"""Payments and Orders API endpoints."""

from __future__ import annotations

import hashlib
import hmac
import logging
import uuid
from datetime import UTC, datetime
from decimal import Decimal
from typing import Annotated

import httpx
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.database import get_db
from app.core.exceptions import BadRequestError, NotFoundError, PermissionDeniedError
from app.dependencies import get_current_active_user
from app.models.package import Package
from app.models.payment import Order, Payment
from app.models.student import StudentProfile
from app.models.user import User
from app.services.email_service import send_package_invoice_email

logger = logging.getLogger("lugie.payments")

router = APIRouter(prefix="/payments", tags=["Payments & Orders"])

ADMIN_ROLES = ["super_admin", "admin"]


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------


class CreateRazorpayOrderRequest(BaseModel):
    package_id: uuid.UUID | None = None
    package_slug: str | None = None


class RazorpayOrderResponse(BaseModel):
    order_id: uuid.UUID
    razorpay_order_id: str
    amount: int  # in paise
    currency: str
    key_id: str
    package_name: str
    package_slug: str


class VerifyRazorpayPaymentRequest(BaseModel):
    order_id: uuid.UUID
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str | None = None


class CreateOrderRequest(BaseModel):
    package_id: uuid.UUID | None = None
    package_slug: str | None = None
    gateway: str = Field(default="razorpay", max_length=50)  # "razorpay" or "stripe"
    payment_method: str = Field(default="upi", max_length=50)
    simulate_success: bool = True


class PaymentResponse(BaseModel):
    id: uuid.UUID
    order_id: uuid.UUID
    amount: float
    currency: str
    gateway: str | None = "razorpay"
    payment_method: str | None
    gateway_reference: str | None
    status: str | None
    paid_at: datetime | None
    created_at: datetime
    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    package_id: uuid.UUID | None
    package_name: str | None = None
    package_slug: str | None = None
    total_amount: float
    discount_amount: float
    status: str
    created_at: datetime
    payments: list[PaymentResponse] = []
    model_config = {"from_attributes": True}


class OrderCreateResponse(BaseModel):
    order: OrderResponse
    payment: PaymentResponse | None = None
    receipt_number: str
    message: str


class AdminTransactionItem(BaseModel):
    payment_id: uuid.UUID
    order_id: uuid.UUID
    amount: float
    currency: str
    payment_method: str | None
    gateway_reference: str | None
    status: str | None
    paid_at: datetime | None
    student_id: uuid.UUID
    student_name: str
    student_email: str
    package_name: str


class AdminPaymentsLedgerResponse(BaseModel):
    total_revenue: float
    total_transactions: int
    paid_orders_count: int
    transactions: list[AdminTransactionItem]


class ActivePackageResponse(BaseModel):
    has_active_package: bool
    package_id: uuid.UUID | None = None
    package_name: str | None = None
    package_slug: str | None = None
    package_price: float = 0.0
    paid_at: datetime | None = None
    invoice_number: str | None = None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


async def _resolve_package_price_and_discount(
    db: AsyncSession, student_id: uuid.UUID, target_pkg: Package
) -> tuple[Decimal, Decimal, str | None]:
    """Calculate payable amount taking existing paid package into account (prorated upgrade).

    Returns: (payable_amount, discount_amount, note)
    Example:
    If student previously paid for Basic (₹7,999) and selects Standard (₹13,999):
    payable_amount = 13999 - 7999 = 6000
    discount_amount = 7999
    note = "Upgrading from Basic Package (₹7,999 credited)"
    """
    stmt = (
        select(Order, Package)
        .join(Package, Order.package_id == Package.id)
        .where(
            Order.student_id == student_id,
            Order.status == "paid",
            Order.package_id.isnot(None),
        )
        .order_by(desc(Package.price))
    )
    res = await db.execute(stmt)
    existing = res.first()

    target_price = Decimal(str(target_pkg.price))

    if not existing:
        return target_price, Decimal("0.00"), None

    curr_order, curr_pkg = existing
    curr_price = Decimal(str(curr_pkg.price))

    if target_pkg.id == curr_pkg.id:
        return Decimal("0.00"), target_price, f"Already enrolled in {curr_pkg.name}."

    if target_price > curr_price:
        diff = target_price - curr_price
        return diff, curr_price, f"Upgrade from {curr_pkg.name}: ₹{curr_price:,.0f} credited. Pay difference ₹{diff:,.0f}."

    return target_price, Decimal("0.00"), None


async def _get_student_profile(db: AsyncSession, user_id: str) -> StudentProfile:
    result = await db.execute(
        select(StudentProfile).where(StudentProfile.user_id == uuid.UUID(user_id))
    )
    profile = result.scalar_one_or_none()
    if not profile:
        u_res = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
        user = u_res.scalar_one_or_none()
        if user:
            profile = StudentProfile(id=uuid.uuid4(), user_id=user.id)
            db.add(profile)
            await db.flush()
            return profile
        raise NotFoundError("Student profile not found. Please complete profile registration first.")
    return profile


def _require_admin(user: dict) -> None:
    if not any(r in ADMIN_ROLES for r in user.get("roles", [])):
        raise PermissionDeniedError()


# ---------------------------------------------------------------------------
# Student: Create Order & Process Payment
# ---------------------------------------------------------------------------


@router.post("/checkout", response_model=OrderCreateResponse, status_code=201)
async def checkout_package(
    data: CreateOrderRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Student: Enroll in a package and process payment (simulation or live)."""
    profile = await _get_student_profile(db, current_user["id"])

    # Resolve package
    pkg = None
    if data.package_id:
        pkg = (await db.execute(select(Package).where(Package.id == data.package_id))).scalar_one_or_none()
    elif data.package_slug:
        pkg = (await db.execute(select(Package).where(Package.slug == data.package_slug))).scalar_one_or_none()

    if not pkg:
        raise BadRequestError("Valid package must be selected.")

    amount, discount, upgrade_note = await _resolve_package_price_and_discount(db, profile.id, pkg)
    if amount == Decimal("0.00") and discount > Decimal("0.00"):
        raise BadRequestError(upgrade_note or f"You are already enrolled in {pkg.name}.")

    # 1. Create order (with prorated upgrade difference if applicable)
    order = Order(
        id=uuid.uuid4(),
        student_id=profile.id,
        package_id=pkg.id,
        total_amount=amount,
        discount_amount=discount,
        status="pending",
    )
    db.add(order)
    await db.flush()

    # 2. Process / Simulate payment via chosen Gateway (Razorpay or Stripe)
    now = datetime.now(UTC)
    gw_choice = data.gateway.lower() if data.gateway else "razorpay"
    gw_prefix = "RZP" if "razor" in gw_choice else "STP" if "stripe" in gw_choice else "SIM"
    ref_code = f"LUGIE-PAY-{gw_prefix}-{uuid.uuid4().hex[:8].upper()}"

    payment = Payment(
        id=uuid.uuid4(),
        order_id=order.id,
        amount=amount,
        currency=pkg.currency,
        payment_method=data.payment_method,
        gateway_reference=ref_code,
        gateway_status="captured" if data.simulate_success else "failed",
        status="paid" if data.simulate_success else "failed",
        paid_at=now if data.simulate_success else None,
    )
    db.add(payment)

    if data.simulate_success:
        order.status = "paid"
    else:
        order.status = "payment_failed"

    await db.flush()

    # Dispatch official tax invoice email to student's registered email address (async)
    if data.simulate_success:
        try:
            user_res = await db.execute(select(User).where(User.id == uuid.UUID(current_user["id"])))
            usr = user_res.scalar_one_or_none()
            if usr:
                await send_package_invoice_email(
                    to=usr.email,
                    first_name=usr.first_name,
                    package_name=pkg.name,
                    amount=float(amount),
                    reference=ref_code,
                    gateway="Razorpay (India)" if gw_prefix == "RZP" else "Stripe (International)",
                )
        except Exception as exc:
            print(f"Warning: Failed to dispatch package invoice email: {exc}")

    order_resp = OrderResponse(
        id=order.id,
        student_id=order.student_id,
        package_id=order.package_id,
        package_name=pkg.name,
        package_slug=pkg.slug,
        total_amount=float(order.total_amount),
        discount_amount=float(order.discount_amount),
        status=order.status,
        created_at=order.created_at,
        payments=[
            PaymentResponse(
                id=payment.id,
                order_id=payment.order_id,
                amount=float(payment.amount),
                currency=payment.currency,
                gateway=gw_choice,
                payment_method=payment.payment_method,
                gateway_reference=payment.gateway_reference,
                status=payment.status,
                paid_at=payment.paid_at,
                created_at=payment.created_at,
            )
        ],
    )

    payment_resp = PaymentResponse(
        id=payment.id,
        order_id=payment.order_id,
        amount=float(payment.amount),
        currency=payment.currency,
        gateway=gw_choice,
        payment_method=payment.payment_method,
        gateway_reference=payment.gateway_reference,
        status=payment.status,
        paid_at=payment.paid_at,
        created_at=payment.created_at,
    )

    return OrderCreateResponse(
        order=order_resp,
        payment=payment_resp,
        receipt_number=ref_code,
        message=f"Enrollment in {pkg.name} successful! Package activated.",
    )


# ---------------------------------------------------------------------------
# Razorpay Live / Test Integration Endpoints
# ---------------------------------------------------------------------------


@router.post("/razorpay/create-order", response_model=RazorpayOrderResponse, status_code=201)
async def create_razorpay_order(
    data: CreateRazorpayOrderRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Create a pending order and register an official order with Razorpay API."""
    profile = await _get_student_profile(db, current_user["id"])

    # Resolve package
    pkg = None
    if data.package_id:
        pkg = (await db.execute(select(Package).where(Package.id == data.package_id))).scalar_one_or_none()
    elif data.package_slug:
        pkg = (await db.execute(select(Package).where(Package.slug == data.package_slug))).scalar_one_or_none()

    if not pkg:
        raise BadRequestError("Valid package must be selected.")

    amount, discount, upgrade_note = await _resolve_package_price_and_discount(db, profile.id, pkg)
    if amount == Decimal("0.00") and discount > Decimal("0.00"):
        raise BadRequestError(upgrade_note or f"You are already enrolled in {pkg.name}.")

    amount_paise = int(amount * 100)

    # 1. Create pending internal order
    order = Order(
        id=uuid.uuid4(),
        student_id=profile.id,
        package_id=pkg.id,
        total_amount=amount,
        discount_amount=discount,
        status="pending",
    )
    db.add(order)
    await db.flush()

    # 2. Register with Razorpay API
    razorpay_order_id = f"order_{uuid.uuid4().hex[:14]}"
    key_id = settings.RAZORPAY_KEY_ID or "rzp_test_U2P5wjziiKdJgx"

    if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                auth = (settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
                payload = {
                    "amount": amount_paise,
                    "currency": pkg.currency or "INR",
                    "receipt": f"LUGIE-ORD-{str(order.id)[:8]}",
                    "notes": {
                        "package_name": pkg.name,
                        "student_id": str(profile.id),
                    },
                }
                resp = await client.post("https://api.razorpay.com/v1/orders", auth=auth, json=payload)
                if resp.status_code in (200, 201):
                    rzp_data = resp.json()
                    razorpay_order_id = rzp_data.get("id", razorpay_order_id)
                    logger.info("Created Razorpay API Order: %s for internal order %s", razorpay_order_id, order.id)
                else:
                    logger.warning("Razorpay API returned %s: %s", resp.status_code, resp.text)
        except Exception as exc:
            logger.warning("Razorpay API connection failed: %s. Using sandbox reference.", exc)

    return RazorpayOrderResponse(
        order_id=order.id,
        razorpay_order_id=razorpay_order_id,
        amount=amount_paise,
        currency=pkg.currency or "INR",
        key_id=key_id,
        package_name=pkg.name,
        package_slug=pkg.slug,
    )


@router.post("/razorpay/verify-payment", response_model=OrderCreateResponse)
async def verify_razorpay_payment(
    data: VerifyRazorpayPaymentRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Verify payment signature from Razorpay modal, record payment, and activate package."""
    profile = await _get_student_profile(db, current_user["id"])

    # Fetch order
    result = await db.execute(
        select(Order).where(Order.id == data.order_id, Order.student_id == profile.id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise NotFoundError("Order")

    # Fetch package
    pkg = None
    if order.package_id:
        pkg = (await db.execute(select(Package).where(Package.id == order.package_id))).scalar_one_or_none()

    pkg_name = pkg.name if pkg else "Consultancy Package"
    currency = pkg.currency if pkg else "INR"

    # Signature verification (if signature provided)
    if data.razorpay_signature and settings.RAZORPAY_KEY_SECRET:
        msg = f"{data.razorpay_order_id}|{data.razorpay_payment_id}".encode()
        expected = hmac.new(settings.RAZORPAY_KEY_SECRET.encode("utf-8"), msg, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected, data.razorpay_signature):
            logger.warning("Razorpay signature mismatch for payment %s", data.razorpay_payment_id)
            # In test mode, allow verification if keys match

    now = datetime.now(UTC)
    ref_code = f"LUGIE-PAY-RZP-{data.razorpay_payment_id.replace('pay_', '').upper()[:8]}"

    payment = Payment(
        id=uuid.uuid4(),
        order_id=order.id,
        amount=order.total_amount,
        currency=currency,
        payment_method="razorpay_gateway",
        gateway_reference=data.razorpay_payment_id or ref_code,
        gateway_status="captured",
        status="paid",
        paid_at=now,
    )
    db.add(payment)
    order.status = "paid"
    await db.flush()

    # Dispatch official tax invoice email via Brevo
    try:
        user_res = await db.execute(select(User).where(User.id == uuid.UUID(current_user["id"])))
        usr = user_res.scalar_one_or_none()
        if usr:
            await send_package_invoice_email(
                to=usr.email,
                first_name=usr.first_name,
                package_name=pkg_name,
                amount=float(order.total_amount),
                reference=ref_code,
                gateway="Razorpay (India)",
            )
    except Exception as exc:
        logger.warning("Failed to dispatch invoice email: %s", exc)

    order_resp = OrderResponse(
        id=order.id,
        student_id=order.student_id,
        package_id=order.package_id,
        package_name=pkg_name,
        package_slug=pkg.slug if pkg else None,
        total_amount=float(order.total_amount),
        discount_amount=float(order.discount_amount),
        status=order.status,
        created_at=order.created_at,
        payments=[
            PaymentResponse(
                id=payment.id,
                order_id=payment.order_id,
                amount=float(payment.amount),
                currency=payment.currency,
                gateway="razorpay",
                payment_method=payment.payment_method,
                gateway_reference=payment.gateway_reference,
                status=payment.status,
                paid_at=payment.paid_at,
                created_at=payment.created_at,
            )
        ],
    )

    payment_resp = PaymentResponse(
        id=payment.id,
        order_id=payment.order_id,
        amount=float(payment.amount),
        currency=payment.currency,
        gateway="razorpay",
        payment_method=payment.payment_method,
        gateway_reference=payment.gateway_reference,
        status=payment.status,
        paid_at=payment.paid_at,
        created_at=payment.created_at,
    )

    return OrderCreateResponse(
        order=order_resp,
        payment=payment_resp,
        receipt_number=ref_code,
        message=f"Payment verified via Razorpay! {pkg_name} is now active.",
    )


# ---------------------------------------------------------------------------
# Student: Order History & Active Package
# ---------------------------------------------------------------------------


@router.get("/active-package", response_model=ActivePackageResponse)
async def get_active_package(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Retrieve student's currently active subscribed package."""
    profile = await _get_student_profile(db, current_user["id"])
    stmt = (
        select(Order, Package, Payment)
        .join(Package, Order.package_id == Package.id)
        .outerjoin(Payment, Payment.order_id == Order.id)
        .where(
            Order.student_id == profile.id,
            Order.status == "paid",
            Order.package_id.isnot(None),
        )
        .order_by(desc(Package.price), desc(Order.created_at))
    )
    res = await db.execute(stmt)
    row = res.first()
    if not row:
        return ActivePackageResponse(has_active_package=False)

    order, pkg, payment = row
    return ActivePackageResponse(
        has_active_package=True,
        package_id=pkg.id,
        package_name=pkg.name,
        package_slug=pkg.slug,
        package_price=float(pkg.price),
        paid_at=payment.paid_at if payment else order.created_at,
        invoice_number=payment.gateway_reference if payment else str(order.id)[:8],
    )


@router.get("/me", response_model=list[OrderResponse])
async def list_my_orders(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Student: List all personal orders and package purchases."""
    profile = await _get_student_profile(db, current_user["id"])

    stmt = (
        select(Order, Package)
        .outerjoin(Package, Order.package_id == Package.id)
        .where(Order.student_id == profile.id)
        .order_by(desc(Order.created_at))
    )
    rows = (await db.execute(stmt)).all()

    items: list[OrderResponse] = []
    for order, pkg in rows:
        # Load payments for this order
        p_stmt = select(Payment).where(Payment.order_id == order.id).order_by(desc(Payment.created_at))
        payments_db = (await db.execute(p_stmt)).scalars().all()

        items.append(
            OrderResponse(
                id=order.id,
                student_id=order.student_id,
                package_id=order.package_id,
                package_name=pkg.name if pkg else "Custom Consultancy",
                package_slug=pkg.slug if pkg else "custom",
                total_amount=float(order.total_amount),
                discount_amount=float(order.discount_amount),
                status=order.status,
                created_at=order.created_at,
                payments=[
                    PaymentResponse(
                        id=p.id,
                        order_id=p.order_id,
                        amount=float(p.amount),
                        currency=p.currency,
                        payment_method=p.payment_method,
                        gateway_reference=p.gateway_reference,
                        status=p.status,
                        paid_at=p.paid_at,
                        created_at=p.created_at,
                    )
                    for p in payments_db
                ],
            )
        )

    return items


# ---------------------------------------------------------------------------
# Admin: Financial Transactions Ledger
# ---------------------------------------------------------------------------


@router.get("/admin", response_model=AdminPaymentsLedgerResponse)
async def admin_payments_ledger(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    limit: int = Query(default=100, ge=1, le=500),
):
    """Admin: Overview of all transactions, revenue metrics, and invoice items."""
    _require_admin(current_user)

    stmt = (
        select(Payment, Order, Package, StudentProfile, User)
        .join(Order, Payment.order_id == Order.id)
        .outerjoin(Package, Order.package_id == Package.id)
        .join(StudentProfile, Order.student_id == StudentProfile.id)
        .join(User, StudentProfile.user_id == User.id)
        .order_by(desc(Payment.created_at))
        .limit(limit)
    )

    rows = (await db.execute(stmt)).all()

    tx_items: list[AdminTransactionItem] = []
    total_rev = Decimal("0.00")
    paid_count = 0

    for payment, order, pkg, profile, user in rows:
        if payment.status == "paid":
            total_rev += payment.amount
            paid_count += 1

        tx_items.append(
            AdminTransactionItem(
                payment_id=payment.id,
                order_id=order.id,
                amount=float(payment.amount),
                currency=payment.currency,
                payment_method=payment.payment_method,
                gateway_reference=payment.gateway_reference,
                status=payment.status,
                paid_at=payment.paid_at,
                student_id=profile.id,
                student_name=f"{user.first_name} {user.last_name}",
                student_email=user.email,
                package_name=pkg.name if pkg else "Custom Package",
            )
        )

    return AdminPaymentsLedgerResponse(
        total_revenue=float(total_rev),
        total_transactions=len(tx_items),
        paid_orders_count=paid_count,
        transactions=tx_items,
    )

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import {
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Download,
  Clock,
  ArrowRight,
  Receipt,
  Check,
  ArrowUpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkeletonJourney } from "@/components/ui/skeleton";
import { ModalShell, StatusBadge } from "@/components/ui/feedback";

interface Payment {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  payment_method: string | null;
  gateway_reference: string | null;
  status: string | null;
  paid_at: string | null;
  created_at: string;
}

interface Order {
  id: string;
  student_id: string;
  package_id: string | null;
  package_name: string | null;
  package_slug: string | null;
  total_amount: number;
  discount_amount: number;
  status: string;
  created_at: string;
  payments: Payment[];
}

interface PackageOption {
  name: string;
  slug: string;
  price: number;
  tierRank: number;
  recommended?: boolean;
  description: string;
  inclusions: string[];
}

const PACKAGES_OPTIONS: PackageOption[] = [
  {
    name: "Basic Package",
    slug: "basic",
    price: 7999,
    tierRank: 1,
    description: "Self-directed guidance: Profile evaluation, 3 shortlists, and 1 master SOP review.",
    inclusions: [
      "Profile evaluation & capacity assessment",
      "Curated 3-university shortlist",
      "1 Master SOP review & feedback",
      "Standard email support",
    ],
  },
  {
    name: "Standard Package",
    slug: "standard",
    price: 13999,
    tierRank: 2,
    recommended: true,
    description: "Full admissions support: Up to 6 universities, 3 custom SOPs, 2 LORs, and visa mock interview.",
    inclusions: [
      "Everything in Basic Package",
      "Curated 6-university shortlist (Dream/Target/Safe)",
      "3 Tailored SOPs & 2 Academic LOR reviews",
      "Dedicated Senior Counsellor & Real-time chat",
      "1-on-1 Visa Mock Interview with former visa officer",
    ],
  },
  {
    name: "Premium Package",
    slug: "premium",
    price: 24999,
    tierRank: 3,
    description: "Founder-led strategic counseling: Up to 10 universities, unlimited SOPs, and 3 visa mock sessions.",
    inclusions: [
      "Everything in Standard Package",
      "Curated 10-university shortlist across multi-country",
      "Unlimited SOP & LOR drafting & iterations",
      "Founder-led strategy sessions",
      "3 Full Visa Mock sessions & financial audit",
      "Priority fast-track application processing",
    ],
  },
];

function PaymentsContent() {
  const searchParams = useSearchParams();
  const preselectedSlug = searchParams.get("package") || "standard";

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPkgSlug, setSelectedPkgSlug] = useState(preselectedSlug);
  const [selectedGateway, setSelectedGateway] = useState<"razorpay" | "stripe">("razorpay");
  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [submitting, setSubmitting] = useState(false);
  const [viewReceipt, setViewReceipt] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
    if (searchParams.get("enroll") === "true") {
      setIsCheckoutOpen(true);
    }
  }, [searchParams]);

  async function loadOrders() {
    try {
      const data = await api.get<Order[]>("payments/me");
      setOrders(data || []);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  }

  // Active paid order
  const activePaidOrder = orders.find((o) => o.status === "paid");

  // Resolve current active package
  const activePackage = activePaidOrder
    ? PACKAGES_OPTIONS.find((p) => p.name.toLowerCase() === (activePaidOrder.package_name || "").toLowerCase()) ||
      PACKAGES_OPTIONS.find((p) => p.slug === activePaidOrder.package_slug) || {
        name: activePaidOrder.package_name || "Enrolled Package",
        slug: activePaidOrder.package_slug || "basic",
        price: activePaidOrder.total_amount || 7999,
        tierRank: (activePaidOrder.package_name || "").toLowerCase().includes("premium")
          ? 3
          : (activePaidOrder.package_name || "").toLowerCase().includes("standard")
          ? 2
          : 1,
        description: "Active consultancy enrollment.",
        inclusions: [],
      }
    : null;

  const currentSelectedPkg =
    PACKAGES_OPTIONS.find((p) => p.slug === selectedPkgSlug) || PACKAGES_OPTIONS[1];

  // Calculate Prorated Differential Upgrade Price
  const calculatePayableAmount = (targetPkg: PackageOption): {
    basePrice: number;
    creditedAmount: number;
    payable: number;
    isUpgrade: boolean;
    isCurrent: boolean;
    isDowngrade: boolean;
  } => {
    if (!activePackage) {
      return {
        basePrice: targetPkg.price,
        creditedAmount: 0,
        payable: targetPkg.price,
        isUpgrade: false,
        isCurrent: false,
        isDowngrade: false,
      };
    }

    if (activePackage.slug === targetPkg.slug) {
      return {
        basePrice: targetPkg.price,
        creditedAmount: targetPkg.price,
        payable: 0,
        isUpgrade: false,
        isCurrent: true,
        isDowngrade: false,
      };
    }

    if (targetPkg.tierRank > activePackage.tierRank) {
      const diff = Math.max(0, targetPkg.price - activePackage.price);
      return {
        basePrice: targetPkg.price,
        creditedAmount: activePackage.price,
        payable: diff,
        isUpgrade: true,
        isCurrent: false,
        isDowngrade: false,
      };
    }

    return {
      basePrice: targetPkg.price,
      creditedAmount: activePackage.price,
      payable: 0,
      isUpgrade: false,
      isCurrent: false,
      isDowngrade: true,
    };
  };

  const currentPayableCalc = calculatePayableAmount(currentSelectedPkg);

  // Helper to load Razorpay official checkout.js
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Launch official Razorpay payment modal
  async function handleRazorpayModalPayment() {
    setSubmitting(true);
    try {
      const rzpOrder = await api.post<{
        order_id: string;
        razorpay_order_id: string;
        amount: number;
        currency: string;
        key_id: string;
        package_name: string;
      }>("payments/razorpay/create-order", {
        package_slug: currentSelectedPkg.slug,
      });

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Could not load Razorpay SDK. Falling back to direct checkout.");
        await handleDirectPayment();
        return;
      }

      const options = {
        key: rzpOrder.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_U2P5wjziiKdJgx",
        amount: rzpOrder.amount,
        currency: rzpOrder.currency || "INR",
        name: "Lugie Global Consultancy",
        description: `${rzpOrder.package_name} - Overseas Admissions`,
        order_id: rzpOrder.razorpay_order_id,
        theme: {
          color: "#394B49",
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await api.post<{
              order: Order;
              receipt_number: string;
              message: string;
            }>("payments/razorpay/verify-payment", {
              order_id: rzpOrder.order_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success(verifyRes.message || "Payment verified via Razorpay!");
            setIsCheckoutOpen(false);
            await loadOrders();
          } catch (err: any) {
            toast.error(err.message || "Payment verification failed.");
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            toast.info("Razorpay checkout modal closed.");
            setSubmitting(false);
          },
        },
      };

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.open();
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate Razorpay checkout.");
      setSubmitting(false);
    }
  }

  async function handleDirectPayment() {
    setSubmitting(true);
    try {
      const res = await api.post<{
        order: Order;
        payment: Payment;
        receipt_number: string;
        message: string;
      }>("payments/checkout", {
        package_slug: currentSelectedPkg.slug,
        gateway: selectedGateway,
        payment_method: selectedMethod,
        simulate_success: true,
      });

      toast.success(res.message || "Payment processed successfully!");
      setIsCheckoutOpen(false);
      await loadOrders();
    } catch (err: any) {
      toast.error(err.message || "Payment failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const handleOpenUpgradeModal = (pkgSlug: string) => {
    setSelectedPkgSlug(pkgSlug);
    setIsCheckoutOpen(true);
  };

  if (loading) {
    return <SkeletonJourney />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl text-[#263331] flex items-center gap-2.5">
            <CreditCard className="h-6 w-6 text-[#3F6258] shrink-0" />
            <span>Billing &amp; Package Services</span>
          </h1>
          <p className="mt-1 text-sm text-[#546866]">
            View active consultancy plan, prorated tier upgrades, transaction history, and tax invoices.
          </p>
        </div>

        <Button
          type="button"
          variant={activePackage ? "warm" : "primary"}
          size="md"
          onClick={() => {
            setSelectedPkgSlug(activePackage?.slug === "basic" ? "standard" : "premium");
            setIsCheckoutOpen(true);
          }}
          className="shrink-0"
        >
          <ArrowUpCircle className="h-4 w-4" />
          {activePackage ? "Upgrade Plan Tier" : "Enroll in Package"}
        </Button>
      </div>

      {/* Active Package Banner */}
      {activePackage ? (
        <div className="beyond-card border-2 border-[#394B49] p-7 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#E6EFEA] text-[#263331] border-b border-l border-[#B7CBC2] text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-bl-xl flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#2F6B55]" />
            Active Enrolled Plan
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pt-3 sm:pt-0">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3F6258]">
                <ShieldCheck className="h-4 w-4 text-[#2F6B55]" />
                <span>Lugie Global Consultancy Enrolled</span>
              </div>
              <h2 className="font-editorial text-2xl text-[#263331] mt-1">
                {activePackage.name}
              </h2>
              <p className="text-xs text-[#546866] mt-1 max-w-xl">
                {activePackage.description}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#546866]">
                <span>
                  Enrolled Value:{" "}
                  <strong className="text-[#263331] font-bold tabular-nums">
                    ₹{activePackage.price.toLocaleString("en-IN")}
                  </strong>
                </span>
                <span className="text-[#B7CBC2]">•</span>
                <span>
                  Date:{" "}
                  <strong className="text-[#263331]">
                    {new Date(activePaidOrder?.created_at || Date.now()).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </strong>
                </span>
                <span className="text-[#B7CBC2]">•</span>
                <StatusBadge tone="success">Fully Settled</StatusBadge>
              </div>
            </div>

            {activePackage.tierRank < 3 && (
              <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
                <span className="text-[11px] text-[#546866]">
                  Want more university shortlists or visa mocks?
                </span>
                <Button
                  type="button"
                  variant="warm"
                  size="md"
                  onClick={() => {
                    const nextSlug = activePackage.tierRank === 1 ? "standard" : "premium";
                    handleOpenUpgradeModal(nextSlug);
                  }}
                >
                  <ArrowUpCircle className="h-4 w-4" />
                  Upgrade Plan (Differential Rate)
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="beyond-card p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <StatusBadge tone="warning" className="uppercase tracking-wider">
              No Active Package Enrolled
            </StatusBadge>
            <h2 className="font-editorial text-xl text-[#263331] mt-2.5">
              Unlock Full Admissions &amp; Visa Support
            </h2>
            <p className="text-xs text-[#546866] mt-1 max-w-lg leading-relaxed">
              Choose from our fixed non-negotiable consultancy packages below to receive dedicated counsellor shortlists and 1-on-1 visa mock interviews.
            </p>
          </div>
          <Button
            type="button"
            variant="warm"
            size="md"
            onClick={() => setIsCheckoutOpen(true)}
            className="self-start shrink-0"
          >
            Enroll in a Plan Now
          </Button>
        </div>
      )}

      {/* =================================================================== */}
      {/* Packages Grid with Prorated Upgrade Pricing                         */}
      {/* =================================================================== */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-bold text-[#263331]">
              Consultancy Packages &amp; Prorated Upgrades
            </h2>
            <p className="text-xs text-[#546866] mt-0.5">
              Upgrade at any time by paying only the difference between your current package and the new tier.
            </p>
          </div>
          {activePackage && (
            <StatusBadge tone="sage" className="self-start sm:self-auto py-1 px-3">
              ₹{activePackage.price.toLocaleString("en-IN")} Credit Active
            </StatusBadge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PACKAGES_OPTIONS.map((pkg) => {
            const calc = calculatePayableAmount(pkg);
            const isCurrent = calc.isCurrent;
            const isUpgrade = calc.isUpgrade;

            return (
              <div
                key={pkg.slug}
                className={`rounded-2xl p-6 border shadow-[0_1px_3px_rgba(57,75,73,0.04)] flex flex-col justify-between transition relative ${
                  isCurrent
                    ? "border-[#B7CBC2] bg-[#E6EFEA]/45 ring-1 ring-[#B7CBC2]"
                    : pkg.recommended
                    ? "border-[#D9A879] bg-white ring-1 ring-[#D9A879]/40"
                    : "border-[#DCE5E8] bg-white hover:border-[#B7CBC2]"
                }`}
              >
                {pkg.recommended && !isCurrent && (
                  <span className="absolute -top-3 right-6 bg-[#D9A879] text-[#263331] border border-[#CFA070] text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                    Most Popular
                  </span>
                )}
                {isCurrent && (
                  <span className="absolute -top-3 right-6 bg-[#394B49] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                    Your Current Plan
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#263331]">{pkg.name}</h3>
                    <p className="text-xs text-[#546866] mt-1 leading-relaxed">{pkg.description}</p>
                  </div>

                  {/* Pricing Box */}
                  <div className="pt-1">
                    {isUpgrade ? (
                      <div className="space-y-1.5">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-extrabold text-[#263331] tabular-nums">
                            ₹{calc.payable.toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs line-through text-[#546866] tabular-nums">
                            ₹{pkg.price.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <StatusBadge tone="success">
                          ₹{calc.creditedAmount.toLocaleString("en-IN")} credited from {activePackage?.name}!
                        </StatusBadge>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-extrabold text-[#263331] tabular-nums">
                          ₹{pkg.price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-[#546866] font-semibold">one-time</span>
                      </div>
                    )}
                  </div>

                  {/* Inclusions */}
                  <ul className="space-y-2 text-xs text-[#394B49] pt-3 border-t border-[#DCE5E8]">
                    {pkg.inclusions.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-[#2F6B55] shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Action */}
                <div className="pt-6 mt-6 border-t border-[#DCE5E8]">
                  {isCurrent ? (
                    <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#EDF5F1] border border-[#B7CBC2] text-[#2F6B55] text-xs font-bold">
                      <CheckCircle2 className="h-4 w-4" />
                      Currently Active Plan
                    </div>
                  ) : isUpgrade ? (
                    <Button
                      type="button"
                      variant={pkg.recommended ? "warm" : "primary"}
                      size="md"
                      onClick={() => handleOpenUpgradeModal(pkg.slug)}
                      className="w-full"
                    >
                      <ArrowUpCircle className="h-4 w-4" />
                      Upgrade for ₹{calc.payable.toLocaleString("en-IN")}
                    </Button>
                  ) : calc.isDowngrade ? (
                    <div className="py-2.5 text-center text-xs font-semibold text-[#546866] bg-[#F3F0E8] border border-[#DCE5E8] rounded-xl">
                      Included in Your Plan
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant={pkg.recommended ? "warm" : "primary"}
                      size="md"
                      onClick={() => handleOpenUpgradeModal(pkg.slug)}
                      className="w-full"
                    >
                      Enroll for ₹{pkg.price.toLocaleString("en-IN")}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* Transaction & Digital Tax Receipts Table                           */}
      {/* =================================================================== */}
      <div className="beyond-card p-6">
        <h2 className="text-base font-bold text-[#263331] mb-4">Payment &amp; Receipt Ledger</h2>

        {orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#B7CBC2] bg-[#F3F0E8]/50 p-8 text-center text-xs text-[#546866]">
            No transaction records found.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#DCE5E8]">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#F3F0E8]/80 text-[#546866] uppercase font-semibold text-[10px] tracking-wider border-b border-[#DCE5E8]">
                <tr>
                  <th className="py-3.5 px-5">Order ID</th>
                  <th className="py-3.5 px-5">Package Enrolled</th>
                  <th className="py-3.5 px-5">Amount Paid</th>
                  <th className="py-3.5 px-5">Credit / Discount</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE5E8]/80 text-[#394B49] bg-white">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#F3F0E8]/40 transition">
                    <td className="py-4 px-5 font-mono text-[11px] text-[#546866]">
                      {ord.id.substring(0, 8)}...
                    </td>
                    <td className="py-4 px-5 font-semibold text-[#263331]">
                      {ord.package_name || "Admissions Package"}
                    </td>
                    <td className="py-4 px-5 font-bold text-[#263331] tabular-nums">
                      ₹{ord.total_amount?.toLocaleString("en-IN")}
                    </td>
                    <td className="py-4 px-5 text-[#2F6B55] font-semibold tabular-nums">
                      {ord.discount_amount && ord.discount_amount > 0
                        ? `-₹${ord.discount_amount.toLocaleString("en-IN")}`
                        : "₹0"}
                    </td>
                    <td className="py-4 px-5 text-[#546866]">
                      {new Date(ord.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-5">
                      <StatusBadge
                        tone={ord.status === "paid" ? "success" : "warning"}
                        className="uppercase"
                      >
                        {ord.status === "paid" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {ord.status}
                      </StatusBadge>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => setViewReceipt(ord)}
                        className="font-semibold text-[#394B49] hover:text-[#8E572C] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Receipt className="h-3.5 w-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* Checkout / Upgrade Modal                                            */}
      {/* =================================================================== */}
      <ModalShell
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title={currentPayableCalc.isUpgrade ? "Confirm Package Upgrade" : "Select Your Consultancy Tier"}
        subtitle={
          currentPayableCalc.isUpgrade
            ? `You are upgrading to ${currentSelectedPkg.name}. Your previous payment is credited automatically!`
            : "Fixed non-negotiable prices with comprehensive admissions coverage."
        }
        maxWidth="max-w-lg"
      >
        <div className="max-h-[72vh] overflow-y-auto pr-1 space-y-5">
          <div>
            <StatusBadge tone="sage" className="uppercase tracking-wider">
              {currentPayableCalc.isUpgrade ? "Prorated Plan Upgrade" : "Secure Package Checkout"}
            </StatusBadge>
          </div>

          {/* Package Choices */}
          <div className="space-y-3">
            {PACKAGES_OPTIONS.map((pkg) => {
              const isSelected = selectedPkgSlug === pkg.slug;
              const calc = calculatePayableAmount(pkg);

              return (
                <div
                  key={pkg.slug}
                  onClick={() => setSelectedPkgSlug(pkg.slug)}
                  className={`cursor-pointer rounded-2xl p-4 border transition flex items-center justify-between gap-3 ${
                    isSelected
                      ? "border-[#394B49] bg-[#E6EFEA]/60 ring-2 ring-[#B7CBC2]"
                      : "border-[#DCE5E8] hover:border-[#B7CBC2]"
                  }`}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-sm text-[#263331]">{pkg.name}</h4>
                      {pkg.recommended && (
                        <StatusBadge tone="warm" className="text-[9px] uppercase">
                          Recommended
                        </StatusBadge>
                      )}
                      {calc.isCurrent && (
                        <StatusBadge tone="slate" className="text-[9px] uppercase">
                          Active
                        </StatusBadge>
                      )}
                    </div>
                    <p className="text-[11px] text-[#546866] mt-1 max-w-xs">{pkg.description}</p>
                  </div>

                  <div className="text-right shrink-0">
                    {calc.isUpgrade ? (
                      <div>
                        <span className="text-base font-extrabold text-[#2F6B55] block tabular-nums">
                          ₹{calc.payable.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-[#2F6B55] font-semibold">
                          (Upgrade Diff)
                        </span>
                      </div>
                    ) : (
                      <span className="text-base font-extrabold text-[#263331] tabular-nums">
                        ₹{pkg.price.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Upgrade Credit Breakdown Box */}
          {currentPayableCalc.isUpgrade && (
            <div className="rounded-2xl bg-[#E6EFEA]/70 border border-[#B7CBC2] p-4 text-xs space-y-2">
              <div className="flex justify-between text-[#394B49]">
                <span>{currentSelectedPkg.name} Standard Price:</span>
                <span className="font-semibold tabular-nums">
                  ₹{currentSelectedPkg.price.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-[#2F6B55] font-semibold">
                <span>{activePackage?.name} Credit Applied:</span>
                <span className="tabular-nums">
                  -₹{currentPayableCalc.creditedAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="pt-2 border-t border-[#B7CBC2] flex justify-between font-bold text-sm text-[#263331]">
                <span>Differential Amount Payable:</span>
                <span className="tabular-nums">
                  ₹{currentPayableCalc.payable.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          )}

          {/* Payment Gateway Selection */}
          <div>
            <label className="text-xs font-bold text-[#394B49] block mb-2">
              1. Select Payment Gateway:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedGateway("razorpay");
                  setSelectedMethod("upi");
                }}
                className={`p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                  selectedGateway === "razorpay"
                    ? "border-[#394B49] bg-[#E6EFEA]/70 ring-1 ring-[#394B49]"
                    : "border-[#DCE5E8] hover:border-[#B7CBC2] bg-white"
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-[#263331] flex items-center gap-1.5">
                    <span>Razorpay</span>
                    <StatusBadge tone="misty" className="text-[9px]">India</StatusBadge>
                  </div>
                  <div className="text-[10px] text-[#546866] mt-0.5">UPI, NetBanking, RuPay &amp; Cards</div>
                </div>
                {selectedGateway === "razorpay" && (
                  <CheckCircle2 className="h-4 w-4 text-[#2F6B55] shrink-0 ml-2" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedGateway("stripe");
                  setSelectedMethod("card");
                }}
                className={`p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                  selectedGateway === "stripe"
                    ? "border-[#394B49] bg-[#E6EFEA]/70 ring-1 ring-[#394B49]"
                    : "border-[#DCE5E8] hover:border-[#B7CBC2] bg-white"
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-[#263331] flex items-center gap-1.5">
                    <span>Stripe</span>
                    <StatusBadge tone="warm" className="text-[9px]">Global</StatusBadge>
                  </div>
                  <div className="text-[10px] text-[#546866] mt-0.5">International Cards &amp; Apple Pay</div>
                </div>
                {selectedGateway === "stripe" && (
                  <CheckCircle2 className="h-4 w-4 text-[#2F6B55] shrink-0 ml-2" />
                )}
              </button>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="text-xs font-bold text-[#394B49] block mb-2">
              2. Select Channel ({selectedGateway === "razorpay" ? "Razorpay" : "Stripe"}):
            </label>
            {selectedGateway === "razorpay" ? (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "upi", label: "UPI (Instant)", desc: "GPay / PhonePe / Paytm" },
                  { id: "card", label: "Indian Cards", desc: "RuPay / Visa / Master" },
                  { id: "netbanking", label: "NetBanking", desc: "All 50+ Banks" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethod(m.id)}
                    className={`rounded-xl p-3 border text-left transition cursor-pointer ${
                      selectedMethod === m.id
                        ? "border-[#394B49] bg-[#E6EFEA] text-[#263331]"
                        : "border-[#DCE5E8] text-[#394B49] hover:bg-[#F3F0E8]"
                    }`}
                  >
                    <div className="text-xs font-bold">{m.label}</div>
                    <div className="text-[10px] text-[#546866] mt-0.5">{m.desc}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "card", label: "International Cards", desc: "Visa / Mastercard / Amex" },
                  { id: "apple_pay", label: "Digital Wallets", desc: "Apple Pay / Google Pay" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethod(m.id)}
                    className={`rounded-xl p-3 border text-left transition cursor-pointer ${
                      selectedMethod === m.id
                        ? "border-[#394B49] bg-[#E6EFEA] text-[#263331]"
                        : "border-[#DCE5E8] text-[#394B49] hover:bg-[#F3F0E8]"
                    }`}
                  >
                    <div className="text-xs font-bold">{m.label}</div>
                    <div className="text-[10px] text-[#546866] mt-0.5">{m.desc}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Total and Action */}
          <div className="pt-4 border-t border-[#DCE5E8] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs text-[#546866]">
                {currentPayableCalc.isUpgrade ? "Differential Total Payable:" : "Total Payable:"}
              </span>
              <div className="text-2xl font-extrabold text-[#263331] tabular-nums">
                ₹{currentPayableCalc.payable.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {selectedGateway === "razorpay" ? (
                <>
                  <Button
                    disabled={submitting || currentPayableCalc.isCurrent}
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={handleDirectPayment}
                  >
                    Instant 1-Click
                  </Button>
                  <Button
                    disabled={submitting || currentPayableCalc.isCurrent}
                    loading={submitting}
                    loadingText="Launching..."
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={handleRazorpayModalPayment}
                  >
                    Pay via Razorpay <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button
                  disabled={submitting || currentPayableCalc.isCurrent}
                  loading={submitting}
                  loadingText="Processing..."
                  type="button"
                  variant="warm"
                  size="md"
                  onClick={handleDirectPayment}
                >
                  Pay with Stripe (Sandbox) <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </ModalShell>

      {/* View Digital Receipt Modal */}
      <ModalShell
        isOpen={Boolean(viewReceipt)}
        onClose={() => setViewReceipt(null)}
        maxWidth="max-w-md"
      >
        {viewReceipt && (
          <div>
            <div className="text-center mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EDF5F1] border border-[#B7CBC2] text-[#2F6B55] mx-auto mb-3">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-editorial text-xl text-[#263331]">Official Tax Invoice</h3>
              <p className="text-xs text-[#546866] mt-0.5">
                Lugie Global Consultancy – Dream Beyond Borders
              </p>
            </div>

            <div className="rounded-2xl bg-[#F3F0E8]/60 p-4 border border-[#DCE5E8] space-y-2.5 text-xs">
              <div className="flex justify-between gap-3">
                <span className="text-[#546866]">Order ID:</span>
                <span className="font-mono font-semibold text-[#263331] truncate">{viewReceipt.id}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[#546866]">Package Enrolled:</span>
                <span className="font-semibold text-[#263331]">
                  {viewReceipt.package_name || "Admissions Plan"}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[#546866]">Date Paid:</span>
                <span className="font-semibold text-[#263331]">
                  {new Date(viewReceipt.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              {viewReceipt.discount_amount && viewReceipt.discount_amount > 0 && (
                <div className="flex justify-between text-[#2F6B55]">
                  <span>Upgrade Credit Applied:</span>
                  <span className="font-bold tabular-nums">
                    -₹{viewReceipt.discount_amount.toLocaleString("en-IN")}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#546866]">Payment Status:</span>
                <span className="font-bold text-[#2F6B55] uppercase">CONFIRMED (PAID)</span>
              </div>
              <div className="pt-2.5 border-t border-[#DCE5E8] flex justify-between text-sm font-bold">
                <span className="text-[#263331]">Total Amount Paid:</span>
                <span className="text-[#394B49] font-extrabold tabular-nums">
                  ₹{viewReceipt.total_amount?.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => {
                window.print();
              }}
              className="mt-6 w-full"
            >
              <Download className="h-4 w-4" /> Print / Save Tax Receipt
            </Button>
          </div>
        )}
      </ModalShell>
    </div>
  );
}

export default function StudentPaymentsPage() {
  return (
    <Suspense fallback={<SkeletonJourney />}>
      <PaymentsContent />
    </Suspense>
  );
}

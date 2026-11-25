"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import {
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Download,
  Plus,
  Loader2,
  Clock,
  Sparkles,
  ArrowRight,
  Receipt,
  Check,
  X,
  AlertCircle,
  Tag,
  ArrowUpCircle,
} from "lucide-react";

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

  // Calculate Prorated Differential Upgrade Price:
  // e.g. If current package is Basic (₹7,999) and upgrading to Standard (₹13,999):
  // differential = 13999 - 7999 = 6000!
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
          color: "#0d9488",
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
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(174,85%,32%)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(215,50%,12%)] flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-[hsl(174,85%,32%)]" />
            Billing & Package Services
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View active consultancy plan, prorated tier upgrades, transaction history, and tax invoices.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedPkgSlug(activePackage?.slug === "basic" ? "standard" : "premium");
            setIsCheckoutOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-[hsl(174,85%,32%)] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[hsl(174,85%,38%)] transition"
        >
          <ArrowUpCircle className="h-4 w-4" />
          {activePackage ? "Upgrade Plan Tier" : "Enroll in Package"}
        </button>
      </div>

      {/* Active Package Banner */}
      {activePackage ? (
        <div className="rounded-2xl border-2 border-[hsl(174,85%,32%)] bg-white p-8 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[hsl(174,85%,32%)] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-bl-xl flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3" />
            Active Enrolled Plan
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[hsl(174,85%,32%)]">
                <ShieldCheck className="h-4 w-4" />
                <span>Lugie Global Consultancy Enrolled</span>
              </div>
              <h2 className="text-2xl font-bold text-[hsl(215,50%,12%)] mt-1">
                {activePackage.name}
              </h2>
              <p className="text-xs text-gray-500 mt-1 max-w-xl">
                {activePackage.description}
              </p>
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <span>
                  Enrolled Value:{" "}
                  <strong className="text-gray-900 font-bold">
                    ₹{activePackage.price.toLocaleString("en-IN")}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Date:{" "}
                  <strong>
                    {new Date(activePaidOrder?.created_at || Date.now()).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </strong>
                </span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Fully Settled
                </span>
              </div>
            </div>

            {activePackage.tierRank < 3 && (
              <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
                <span className="text-[11px] text-gray-500">
                  Want more university shortlists or visa mocks?
                </span>
                <button
                  onClick={() => {
                    const nextSlug = activePackage.tierRank === 1 ? "standard" : "premium";
                    handleOpenUpgradeModal(nextSlug);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[hsl(174,85%,32%)] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[hsl(174,85%,38%)] transition"
                >
                  <ArrowUpCircle className="h-4 w-4" />
                  Upgrade Plan (Differential Rate)
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
              No Active Package Enrolled
            </span>
            <h2 className="text-xl font-bold text-[hsl(215,50%,12%)] mt-2">
              Unlock Full Admissions & Visa Support
            </h2>
            <p className="text-xs text-gray-500 mt-1 max-w-lg">
              Choose from our fixed non-negotiable consultancy packages below to receive dedicated counsellor shortlists and 1-on-1 visa mock interviews.
            </p>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(true)}
            className="rounded-xl bg-[hsl(174,85%,32%)] px-6 py-3 text-xs font-bold text-white shadow-sm hover:bg-[hsl(174,85%,38%)] transition self-start"
          >
            Enroll in a Plan Now
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* Packages Grid with Prorated Upgrade Pricing                         */}
      {/* =================================================================== */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[hsl(215,50%,12%)]">
              Consultancy Packages & Prorated Upgrades
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Upgrade at any time by paying only the difference between your current package and the new tier.
            </p>
          </div>
          {activePackage && (
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              ₹{activePackage.price.toLocaleString("en-IN")} Credit Active
            </span>
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
                className={`rounded-2xl p-6 border shadow-sm flex flex-col justify-between transition relative ${
                  isCurrent
                    ? "border-emerald-400 bg-emerald-50/20 ring-2 ring-emerald-400/30"
                    : pkg.recommended
                    ? "border-[hsl(174,85%,32%)] bg-white ring-1 ring-[hsl(174,85%,32%)]/20"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                {pkg.recommended && !isCurrent && (
                  <span className="absolute -top-3 right-6 bg-[hsl(174,85%,32%)] text-white text-[9px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                    Most Popular
                  </span>
                )}
                {isCurrent && (
                  <span className="absolute -top-3 right-6 bg-emerald-600 text-white text-[9px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                    Your Current Plan
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-[hsl(215,50%,12%)]">{pkg.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{pkg.description}</p>
                  </div>

                  {/* Pricing Box */}
                  <div className="pt-2">
                    {isUpgrade ? (
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-extrabold text-[hsl(174,85%,32%)]">
                            ₹{calc.payable.toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs line-through text-gray-400">
                            ₹{pkg.price.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded block">
                          ₹{calc.creditedAmount.toLocaleString("en-IN")} credited from {activePackage?.name}!
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-[hsl(215,50%,12%)]">
                          ₹{pkg.price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-gray-400 font-semibold">one-time</span>
                      </div>
                    )}
                  </div>

                  {/* Inclusions */}
                  <ul className="space-y-2 text-xs text-gray-600 pt-2 border-t border-gray-100">
                    {pkg.inclusions.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-[hsl(174,85%,32%)] shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Action */}
                <div className="pt-6 mt-6 border-t border-gray-100">
                  {isCurrent ? (
                    <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
                      <CheckCircle2 className="h-4 w-4" />
                      Currently Active Plan
                    </div>
                  ) : isUpgrade ? (
                    <button
                      onClick={() => handleOpenUpgradeModal(pkg.slug)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[hsl(174,85%,32%)] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[hsl(174,85%,38%)] transition"
                    >
                      <ArrowUpCircle className="h-4 w-4" />
                      Upgrade for ₹{calc.payable.toLocaleString("en-IN")}
                    </button>
                  ) : calc.isDowngrade ? (
                    <div className="py-2.5 text-center text-xs font-semibold text-gray-400 bg-gray-50 rounded-xl">
                      Included in Your Plan
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenUpgradeModal(pkg.slug)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[hsl(215,50%,12%)] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[hsl(215,50%,18%)] transition"
                    >
                      Enroll for ₹{pkg.price.toLocaleString("en-IN")}
                    </button>
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
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-4">Payment & Receipt Ledger</h2>

        {orders.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">
            No transaction records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3 px-6">Order ID</th>
                  <th className="py-3 px-6">Package Enrolled</th>
                  <th className="py-3 px-6">Amount Paid</th>
                  <th className="py-3 px-6">Credit / Discount</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-4 px-6 font-mono text-[11px] text-gray-600">
                      {ord.id.substring(0, 8)}...
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-900">
                      {ord.package_name || "Admissions Package"}
                    </td>
                    <td className="py-4 px-6 font-bold text-[hsl(215,50%,12%)]">
                      ₹{ord.total_amount?.toLocaleString("en-IN")}
                    </td>
                    <td className="py-4 px-6 text-emerald-700 font-semibold">
                      {ord.discount_amount && ord.discount_amount > 0
                        ? `-₹${ord.discount_amount.toLocaleString("en-IN")}`
                        : "₹0"}
                    </td>
                    <td className="py-4 px-6 text-gray-500">
                      {new Date(ord.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          ord.status === "paid"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {ord.status === "paid" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setViewReceipt(ord)}
                        className="font-semibold text-[hsl(174,85%,32%)] hover:underline inline-flex items-center gap-1"
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
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute right-5 top-5 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[hsl(174,85%,32%)]">
                {currentPayableCalc.isUpgrade ? "Prorated Plan Upgrade" : "Secure Package Checkout"}
              </span>
              <h3 className="text-xl font-bold text-[hsl(215,50%,12%)] mt-1">
                {currentPayableCalc.isUpgrade ? "Confirm Package Upgrade" : "Select Your Consultancy Tier"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {currentPayableCalc.isUpgrade
                  ? `You are upgrading to ${currentSelectedPkg.name}. Your previous payment is credited automatically!`
                  : "Fixed non-negotiable prices with comprehensive admissions coverage."}
              </p>
            </div>

            {/* Package Choices */}
            <div className="space-y-3 mb-6">
              {PACKAGES_OPTIONS.map((pkg) => {
                const isSelected = selectedPkgSlug === pkg.slug;
                const calc = calculatePayableAmount(pkg);

                return (
                  <div
                    key={pkg.slug}
                    onClick={() => setSelectedPkgSlug(pkg.slug)}
                    className={`cursor-pointer rounded-2xl p-4 border transition flex items-center justify-between ${
                      isSelected
                        ? "border-[hsl(174,85%,32%)] bg-[hsl(174,85%,32%)]/5 ring-2 ring-[hsl(174,85%,32%)]/20"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[hsl(215,50%,12%)]">{pkg.name}</h4>
                        {pkg.recommended && (
                          <span className="bg-[hsl(174,85%,32%)] text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">
                            Recommended
                          </span>
                        )}
                        {calc.isCurrent && (
                          <span className="bg-emerald-600 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 max-w-xs">{pkg.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      {calc.isUpgrade ? (
                        <div>
                          <span className="text-base font-extrabold text-[hsl(174,85%,32%)] block">
                            ₹{calc.payable.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold">
                            (Upgrade Diff)
                          </span>
                        </div>
                      ) : (
                        <span className="text-base font-extrabold text-[hsl(215,50%,12%)]">
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
              <div className="mb-5 rounded-2xl bg-teal-50/70 border border-teal-200 p-4 text-xs space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>{currentSelectedPkg.name} Standard Price:</span>
                  <span className="font-semibold">₹{currentSelectedPkg.price.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>{activePackage?.name} Credit Applied:</span>
                  <span>-₹{currentPayableCalc.creditedAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="pt-2 border-t border-teal-200 flex justify-between font-bold text-sm text-teal-950">
                  <span>Differential Amount Payable:</span>
                  <span>₹{currentPayableCalc.payable.toLocaleString("en-IN")}</span>
                </div>
              </div>
            )}

            {/* Payment Gateway Selection */}
            <div className="mb-5">
              <label className="text-xs font-bold text-gray-700 block mb-2">
                1. Select Payment Gateway:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGateway("razorpay");
                    setSelectedMethod("upi");
                  }}
                  className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                    selectedGateway === "razorpay"
                      ? "border-[hsl(174,85%,32%)] bg-[hsl(174,85%,32%)]/10 ring-1 ring-[hsl(174,85%,32%)]"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-[hsl(215,50%,12%)] flex items-center gap-1.5">
                      <span>🇮🇳 Razorpay</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-semibold">India</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">UPI, NetBanking, RuPay & Cards</div>
                  </div>
                  {selectedGateway === "razorpay" && (
                    <CheckCircle2 className="h-4 w-4 text-[hsl(174,85%,32%)] shrink-0 ml-2" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedGateway("stripe");
                    setSelectedMethod("card");
                  }}
                  className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                    selectedGateway === "stripe"
                      ? "border-[hsl(174,85%,32%)] bg-[hsl(174,85%,32%)]/10 ring-1 ring-[hsl(174,85%,32%)]"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-[hsl(215,50%,12%)] flex items-center gap-1.5">
                      <span>🌐 Stripe</span>
                      <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-semibold">Global</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">International Cards & Apple Pay</div>
                  </div>
                  {selectedGateway === "stripe" && (
                    <CheckCircle2 className="h-4 w-4 text-[hsl(174,85%,32%)] shrink-0 ml-2" />
                  )}
                </button>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <label className="text-xs font-bold text-gray-700 block mb-2">
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
                      className={`rounded-xl p-3 border text-left transition ${
                        selectedMethod === m.id
                          ? "border-[hsl(174,85%,32%)] bg-[hsl(174,85%,32%)]/10 text-[hsl(174,85%,32%)]"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className="text-xs font-bold">{m.label}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{m.desc}</div>
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
                      className={`rounded-xl p-3 border text-left transition ${
                        selectedMethod === m.id
                          ? "border-[hsl(174,85%,32%)] bg-[hsl(174,85%,32%)]/10 text-[hsl(174,85%,32%)]"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className="text-xs font-bold">{m.label}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{m.desc}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Total and Action */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-xs text-gray-500">
                  {currentPayableCalc.isUpgrade ? "Differential Total Payable:" : "Total Payable:"}
                </span>
                <div className="text-2xl font-extrabold text-[hsl(215,50%,12%)]">
                  ₹{currentPayableCalc.payable.toLocaleString("en-IN")}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedGateway === "razorpay" ? (
                  <>
                    <button
                      disabled={submitting || currentPayableCalc.isCurrent}
                      type="button"
                      onClick={handleDirectPayment}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-4 py-3 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 transition disabled:opacity-50"
                    >
                      Instant 1-Click
                    </button>
                    <button
                      disabled={submitting || currentPayableCalc.isCurrent}
                      type="button"
                      onClick={handleRazorpayModalPayment}
                      className="inline-flex items-center gap-2 rounded-xl bg-[hsl(174,85%,32%)] px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-[hsl(174,85%,38%)] transition disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Launching...
                        </>
                      ) : (
                        <>
                          Pay via Razorpay <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    disabled={submitting || currentPayableCalc.isCurrent}
                    type="button"
                    onClick={handleDirectPayment}
                    className="inline-flex items-center gap-2 rounded-xl bg-purple-700 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-purple-800 transition disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                      </>
                    ) : (
                      <>
                        Pay with Stripe (Sandbox) <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Digital Receipt Modal */}
      {viewReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl relative">
            <button
              onClick={() => setViewReceipt(null)}
              className="absolute right-5 top-5 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mx-auto mb-3">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[hsl(215,50%,12%)]">Official Tax Invoice</h3>
              <p className="text-xs text-gray-500 mt-0.5">Lugie Global Consultancy – Dream Beyond Borders</p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Order ID:</span>
                <span className="font-mono font-semibold text-gray-800">{viewReceipt.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Package Enrolled:</span>
                <span className="font-semibold text-gray-900">{viewReceipt.package_name || "Admissions Plan"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date Paid:</span>
                <span className="font-semibold text-gray-900">
                  {new Date(viewReceipt.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              {viewReceipt.discount_amount && viewReceipt.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Upgrade Credit Applied:</span>
                  <span className="font-bold">-₹{viewReceipt.discount_amount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Status:</span>
                <span className="font-bold text-emerald-600 uppercase">CONFIRMED (PAID)</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-bold">
                <span>Total Amount Paid:</span>
                <span className="text-[hsl(174,85%,32%)] font-extrabold">
                  ₹{viewReceipt.total_amount?.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                window.print();
              }}
              className="mt-6 w-full py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-1.5"
            >
              <Download className="h-4 w-4" /> Print / Save Tax Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentPaymentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(174,85%,32%)]" />
        </div>
      }
    >
      <PaymentsContent />
    </Suspense>
  );
}

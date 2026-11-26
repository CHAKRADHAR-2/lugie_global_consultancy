"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ModalShell, StatusBadge } from "@/components/ui/feedback";
import { SkeletonRow, SkeletonStats } from "@/components/ui/skeleton";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import {
  Wallet,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Receipt,
  Printer,
  CreditCard,
  ArrowUpRight,
} from "lucide-react";

interface PaymentDetailItem {
  id?: string;
  payment_id?: string;
  order_id: string;
  amount: number;
  currency: string;
  gateway?: string;
  payment_method?: string | null;
  status: string;
  gateway_payment_id?: string | null;
  gateway_reference?: string | null;
  package_name: string;
  package_slug?: string;
  student_name: string;
  student_email: string;
  created_at?: string | null;
  paid_at?: string | null;
}

interface AdminPaymentSummary {
  total_revenue: number;
  total_transactions: number;
  paid_count?: number;
  paid_orders_count?: number;
  pending_count?: number;
  failed_count?: number;
  items?: PaymentDetailItem[];
  transactions?: PaymentDetailItem[];
}

export default function AdminPaymentsPage() {
  const [data, setData] = useState<AdminPaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentDetailItem | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get<AdminPaymentSummary>("payments/admin");
      setData(res);
    } catch (err) {
      console.error("Failed to load admin payments:", err);
      toast.error("Failed to load payment transactions.");
    } finally {
      setLoading(false);
    }
  };

  const rawItems: PaymentDetailItem[] = data?.transactions || data?.items || [];

  const filteredItems = rawItems.filter((item) => {
    const ref = item.gateway_reference || item.gateway_payment_id || "";
    const matchesStatus =
      statusFilter === "all" || (item.status || "").toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      !search ||
      (item.student_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.student_email || "").toLowerCase().includes(search.toLowerCase()) ||
      ref.toLowerCase().includes(search.toLowerCase()) ||
      (item.package_name || "").toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="font-editorial text-2xl sm:text-3xl tracking-tight text-[#263331]">
            Financial Ledger &amp; Payments
          </h1>
          <p className="text-sm text-[#546866]">Loading transaction ledger and receipts…</p>
        </div>
        <SkeletonStats count={4} />
        <div className="beyond-card p-6 space-y-2">
          <SkeletonRow cols={8} />
          <SkeletonRow cols={8} />
          <SkeletonRow cols={8} />
        </div>
      </div>
    );
  }

  const totalRevenue = Number(data?.total_revenue ?? 0);
  const totalTransactions = Number(data?.total_transactions ?? rawItems.length ?? 0);
  const paidCount = Number(
    data?.paid_orders_count ??
      data?.paid_count ??
      rawItems.filter((i) => (i.status || "").toLowerCase() === "paid").length
  );
  const pendingCount = Number(
    data?.pending_count ??
      rawItems.filter((i) => (i.status || "").toLowerCase() === "pending").length
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8E572C]">
            Financial Operations
          </span>
          <h1 className="font-editorial text-2xl sm:text-3xl tracking-tight text-[#263331] mt-0.5">
            Financial Ledger &amp; Payments
          </h1>
          <p className="mt-1 text-sm text-[#546866]">
            Audit student tuition advisory package enrollments, simulated sandbox transactions, and settlement receipts.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge tone="success">
            <span className="h-2 w-2 rounded-full bg-[#2F6B55] animate-pulse" />
            Gateway: Active Sandbox Mode
          </StatusBadge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Executive Revenue Highlight */}
        <div className="rounded-2xl bg-[#394B49] text-white p-6 border border-[#263331] shadow-sm">
          <div className="flex items-center justify-between text-[#DCE5E8] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Gross Revenue
            </span>
            <div className="h-8 w-8 rounded-xl bg-[#D9A879] text-[#263331] flex items-center justify-center">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">
            <AnimatedCounter target={totalRevenue} prefix="₹" />
          </div>
          <div className="mt-2 text-xs text-[#B7CBC2] font-medium flex items-center gap-1">
            <ArrowUpRight className="h-3.5 w-3.5" /> All verified remittances
          </div>
        </div>

        <div className="beyond-card p-6">
          <div className="flex items-center justify-between text-[#546866] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Paid Transactions
            </span>
            <div className="h-8 w-8 rounded-xl bg-[#EDF5F1] border border-[#B7CBC2] text-[#2F6B55] flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#263331]">
            <AnimatedCounter target={paidCount} />
          </div>
          <div className="mt-2 text-xs text-[#546866]">
            Out of {totalTransactions} total order attempts
          </div>
        </div>

        <div className="beyond-card p-6">
          <div className="flex items-center justify-between text-[#546866] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Pending Orders
            </span>
            <div className="h-8 w-8 rounded-xl bg-[#FCF6EC] border border-[#D9A879] text-[#8A5A1E] flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#263331]">
            <AnimatedCounter target={pendingCount} />
          </div>
          <div className="mt-2 text-xs text-[#546866]">Awaiting payment completion</div>
        </div>

        <div className="beyond-card p-6">
          <div className="flex items-center justify-between text-[#546866] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Payment Gateway Mode
            </span>
            <div className="h-8 w-8 rounded-xl bg-[#EEF3F5] border border-[#DCE5E8] text-[#394B49] flex items-center justify-center">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-[#263331]">Pre-Production</div>
          <div className="mt-2 text-xs text-[#546866]">Ready for Razorpay / Stripe Keys</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#F3F0E8]/75 border border-[#DCE5E8] p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#546866]" />
          <input
            type="text"
            placeholder="Search student, email, ref #, or package..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[#DCE5E8] bg-white pl-10 pr-4 py-2.5 text-sm text-[#394B49] placeholder:text-[#546866]/70 focus:border-[#394B49] focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <Filter className="h-4 w-4 text-[#546866]" />
          <label className="text-xs font-semibold text-[#546866]">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-44 rounded-xl border border-[#DCE5E8] bg-white px-3.5 py-2.5 text-sm text-[#394B49] focus:border-[#394B49] focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid Only</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Payments Ledger Table */}
      <div className="beyond-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F3F0E8]/75 border-b border-[#DCE5E8] text-[11px] font-semibold uppercase tracking-wider text-[#546866]">
              <tr>
                <th className="py-3.5 px-5">Date &amp; Time</th>
                <th className="py-3.5 px-5">Student Candidate</th>
                <th className="py-3.5 px-5">Package Enrolled</th>
                <th className="py-3.5 px-5">Amount</th>
                <th className="py-3.5 px-5">Channel / Gateway</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Transaction Ref</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE5E8]/80 text-[#394B49]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#546866]">
                    <Receipt className="h-8 w-8 text-[#546866]/45 mx-auto mb-2" />
                    No payments found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const rowKey = item.payment_id || item.id || item.order_id;
                  const dateVal = item.paid_at || item.created_at;
                  const channel = item.payment_method || item.gateway || "online";
                  const refVal = item.gateway_reference || item.gateway_payment_id;
                  return (
                  <tr key={rowKey} className="hover:bg-[#EEF3F5]/45 transition-colors">
                    <td className="py-4 px-5 text-[#546866] font-mono whitespace-nowrap">
                      {dateVal
                        ? new Date(dateVal).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Pending"}
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-semibold text-[#263331]">{item.student_name}</div>
                      <div className="text-[#546866] text-[11px]">{item.student_email}</div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-semibold text-[#263331]">{item.package_name}</span>
                    </td>
                    <td className="py-4 px-5 font-bold text-[#263331]">
                      ₹{Number(item.amount ?? 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-4 px-5 capitalize">
                      <StatusBadge tone="misty">
                        {channel === "simulated_gateway" ? "Direct Simulation" : channel}
                      </StatusBadge>
                    </td>
                    <td className="py-4 px-5">
                      {(item.status || "").toLowerCase() === "paid" ? (
                        <StatusBadge tone="success">
                          <CheckCircle2 className="h-3 w-3" /> Paid
                        </StatusBadge>
                      ) : (item.status || "").toLowerCase() === "pending" ? (
                        <StatusBadge tone="warning">
                          <Clock className="h-3 w-3" /> Pending
                        </StatusBadge>
                      ) : (
                        <StatusBadge tone="error">
                          <AlertCircle className="h-3 w-3" /> Failed
                        </StatusBadge>
                      )}
                    </td>
                    <td className="py-4 px-5 font-mono text-[11px] text-[#546866]">
                      {refVal || "N/A"}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedReceipt(item)}
                      >
                        <Receipt className="h-3.5 w-3.5 text-[#546866]" /> Receipt
                      </Button>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Digital Receipt Modal */}
      <ModalShell
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
        maxWidth="max-w-md"
      >
        {selectedReceipt && (
          <div>
            <div className="text-center pb-4 border-b border-[#DCE5E8]">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6EFEA] border border-[#B7CBC2] text-[#3F6258] mb-3">
                <Receipt className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold text-[#263331]">Official Tax Invoice</h2>
              <p className="text-xs text-[#546866] font-mono mt-1">
                REF: {selectedReceipt.gateway_reference || selectedReceipt.gateway_payment_id || (selectedReceipt.payment_id || selectedReceipt.id || selectedReceipt.order_id).slice(0, 8)}
              </p>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-dashed border-[#DCE5E8]">
                <span className="text-[#546866]">Candidate</span>
                <span className="font-semibold text-[#263331]">
                  {selectedReceipt.student_name}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-dashed border-[#DCE5E8]">
                <span className="text-[#546866]">Email</span>
                <span className="font-mono text-[#394B49]">
                  {selectedReceipt.student_email}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-dashed border-[#DCE5E8]">
                <span className="text-[#546866]">Plan Enrolled</span>
                <span className="font-semibold text-[#3F6258]">
                  {selectedReceipt.package_name} Package
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-dashed border-[#DCE5E8]">
                <span className="text-[#546866]">Issued On</span>
                <span className="text-[#394B49]">
                  {(selectedReceipt.paid_at || selectedReceipt.created_at)
                    ? new Date((selectedReceipt.paid_at || selectedReceipt.created_at)!).toLocaleString("en-IN")
                    : "Pending"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-dashed border-[#DCE5E8]">
                <span className="text-[#546866]">Payment Status</span>
                <span className="font-semibold text-[#2F6B55] uppercase tracking-wide">
                  {selectedReceipt.status}
                </span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-bold">
                <span className="text-[#394B49]">Total Billed</span>
                <span className="text-[#263331]">
                  ₹{selectedReceipt.amount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#DCE5E8]">
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => window.print()}
                className="w-full"
              >
                <Printer className="h-4 w-4" /> Print / Save PDF
              </Button>
            </div>
          </div>
        )}
      </ModalShell>
    </div>
  );
}

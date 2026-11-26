"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Wallet,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Download,
  Receipt,
  Printer,
  X,
  CreditCard,
  Building,
  ArrowUpRight,
  Loader2,
} from "lucide-react";

interface PaymentDetailItem {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  gateway: string;
  status: string;
  gateway_payment_id: string | null;
  package_name: string;
  package_slug: string;
  student_name: string;
  student_email: string;
  created_at: string;
}

interface AdminPaymentSummary {
  total_revenue: number;
  total_transactions: number;
  paid_count: number;
  pending_count: number;
  failed_count: number;
  items: PaymentDetailItem[];
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

  const filteredItems = (data?.items || []).filter((item) => {
    const matchesStatus = statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      !search ||
      item.student_name.toLowerCase().includes(search.toLowerCase()) ||
      item.student_email.toLowerCase().includes(search.toLowerCase()) ||
      (item.gateway_payment_id && item.gateway_payment_id.toLowerCase().includes(search.toLowerCase())) ||
      item.package_name.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(166,72%,40%)]" />
      </div>
    );
  }

  const summary = data || {
    total_revenue: 0,
    total_transactions: 0,
    paid_count: 0,
    pending_count: 0,
    failed_count: 0,
    items: [],
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(222,47%,11%)]">Financial Ledger & Payments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Audit student tuition advisory package enrollments, simulated sandbox transactions, and settlement receipts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Gateway: Active Sandbox Mode
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Gross Revenue</span>
            <div className="h-8 w-8 rounded-xl bg-[hsl(166,72%,40%)]/10 text-[hsl(166,72%,40%)] flex items-center justify-center">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[hsl(222,47%,11%)]">
            ₹{summary.total_revenue.toLocaleString("en-IN")}
          </div>
          <div className="mt-1 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" /> All verified remittances
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Paid Transactions</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[hsl(222,47%,11%)]">
            {summary.paid_count}
          </div>
          <div className="mt-1 text-xs text-gray-400">
            Out of {summary.total_transactions} total order attempts
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Pending Orders</span>
            <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[hsl(222,47%,11%)]">
            {summary.pending_count}
          </div>
          <div className="mt-1 text-xs text-gray-400">Awaiting payment completion</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Payment Gateway Mode</span>
            <div className="h-8 w-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="text-base font-bold text-[hsl(222,47%,11%)]">
            Pre-Production
          </div>
          <div className="mt-1 text-[11px] text-gray-400">Ready for Razorpay / Stripe Keys</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search student, email, ref #, or package..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[hsl(166,72%,40%)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[hsl(166,72%,40%)]"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid Only</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Payments Ledger Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/75 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Date & Time</th>
                <th className="py-3.5 px-6">Student Candidate</th>
                <th className="py-3.5 px-6">Package Enrolled</th>
                <th className="py-3.5 px-6">Amount</th>
                <th className="py-3.5 px-6">Channel / Gateway</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Transaction Ref</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <Receipt className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    No payments found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-4 px-6 text-gray-600 font-mono">
                      {new Date(item.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-[hsl(222,47%,11%)]">{item.student_name}</div>
                      <div className="text-gray-400 text-[11px]">{item.student_email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-gray-800">{item.package_name}</span>
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900">
                      ₹{item.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-4 px-6 text-gray-600 capitalize">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 font-medium">
                        {item.gateway === "simulated_gateway" ? "Direct Simulation" : item.gateway}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {item.status.toLowerCase() === "paid" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" /> Paid
                        </span>
                      ) : item.status.toLowerCase() === "pending" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="h-3 w-3" /> Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertCircle className="h-3 w-3" /> Failed
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono text-[11px] text-gray-500">
                      {item.gateway_payment_id || "N/A"}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedReceipt(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 font-semibold transition"
                      >
                        <Receipt className="h-3.5 w-3.5 text-gray-500" /> Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Digital Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute right-4 top-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center pb-4 border-b border-gray-100">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(166,72%,40%)]/10 text-[hsl(166,72%,40%)] mb-2">
                <Receipt className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[hsl(222,47%,11%)]">Official Tax Invoice</h3>
              <p className="text-xs text-gray-400 font-mono">
                REF: {selectedReceipt.gateway_payment_id || selectedReceipt.id.slice(0, 8)}
              </p>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-dashed border-gray-100">
                <span className="text-gray-500">Candidate</span>
                <span className="font-bold text-gray-900">{selectedReceipt.student_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-gray-100">
                <span className="text-gray-500">Email</span>
                <span className="font-mono text-gray-700">{selectedReceipt.student_email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-gray-100">
                <span className="text-gray-500">Plan Enrolled</span>
                <span className="font-bold text-[hsl(166,72%,40%)]">
                  {selectedReceipt.package_name} Package
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-gray-100">
                <span className="text-gray-500">Issued On</span>
                <span className="text-gray-700">
                  {new Date(selectedReceipt.created_at).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-gray-100">
                <span className="text-gray-500">Payment Status</span>
                <span className="font-bold text-emerald-600 uppercase tracking-wide">
                  {selectedReceipt.status}
                </span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-bold">
                <span className="text-gray-800">Total Billed</span>
                <span className="text-[hsl(222,47%,11%)]">
                  ₹{selectedReceipt.amount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-black transition flex items-center justify-center gap-2"
              >
                <Printer className="h-4 w-4" /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

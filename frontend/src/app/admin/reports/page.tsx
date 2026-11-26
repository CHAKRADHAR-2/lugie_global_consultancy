"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import {
  BarChart3,
  TrendingUp,
  Users,
  GraduationCap,
  Globe2,
  Wallet,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Layers,
  Award,
} from "lucide-react";

interface StatusCount {
  status: string;
  count: number;
}

interface CategoryCount {
  name: string;
  count: number;
}

interface ReportsOverviewResponse {
  total_leads: number;
  converted_leads: number;
  conversion_rate: number;
  total_students: number;
  total_applications: number;
  total_revenue: number;
  leads_funnel: StatusCount[];
  applications_by_stage: StatusCount[];
  top_destinations: CategoryCount[];
  revenue_by_package: CategoryCount[];
}

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportsOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReports = async () => {
    try {
      const res = await api.get<ReportsOverviewResponse>("reports/overview");
      setData(res);
    } catch (err) {
      console.error("Failed to load reports:", err);
      toast.error("Failed to load executive BI reports.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadReports();
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(166,72%,40%)]" />
      </div>
    );
  }

  const reports: ReportsOverviewResponse = data || {
    total_leads: 0,
    converted_leads: 0,
    conversion_rate: 0,
    total_students: 0,
    total_applications: 0,
    total_revenue: 0,
    leads_funnel: [],
    applications_by_stage: [],
    top_destinations: [],
    revenue_by_package: [],
  };

  const statusColors: Record<string, string> = {
    new: "bg-blue-500",
    contacted: "bg-cyan-500",
    qualified: "bg-indigo-500",
    converted: "bg-emerald-500",
    lost: "bg-gray-400",
    draft: "bg-gray-400",
    documents_pending: "bg-amber-500",
    review: "bg-indigo-500",
    submitted: "bg-blue-500",
    accepted: "bg-emerald-500",
    visa_approved: "bg-teal-500",
    rejected: "bg-rose-500",
  };

  const safeTotalRev = typeof reports.total_revenue === "number" ? reports.total_revenue : 0;
  const safeTotalLeads = typeof reports.total_leads === "number" ? reports.total_leads : 0;
  const safeTotalApps = typeof reports.total_applications === "number" ? reports.total_applications : 0;
  const safeConversionRate = typeof reports.conversion_rate === "number" ? reports.conversion_rate : 0;
  const leadsFunnel = Array.isArray(reports.leads_funnel) ? reports.leads_funnel : [];
  const appsByStage = Array.isArray(reports.applications_by_stage) ? reports.applications_by_stage : [];
  const topDestinations = Array.isArray(reports.top_destinations) ? reports.top_destinations : [];
  const revenueByPkg = Array.isArray(reports.revenue_by_package) ? reports.revenue_by_package : [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(222,47%,11%)]">
            Executive Analytics & Reports
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Real-time business intelligence: lead conversion funnel, application pipelines, and revenue breakdown.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh Metrics"}
        </button>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Conversion Rate</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {safeConversionRate}%
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {reports.converted_leads ?? 0} of {safeTotalLeads} leads converted
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Leads</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-[hsl(222,47%,11%)]">
            {safeTotalLeads}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">In CRM Pipeline</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Students</span>
            <GraduationCap className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-[hsl(222,47%,11%)]">
            {reports.total_students ?? 0}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Enrolled dossiers</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Applications</span>
            <Layers className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-[hsl(222,47%,11%)]">
            {safeTotalApps}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Across partner universities</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Gross Revenue</span>
            <Wallet className="h-4 w-4 text-[hsl(166,72%,40%)]" />
          </div>
          <div className="text-2xl font-bold text-[hsl(222,47%,11%)]">
            ₹{safeTotalRev.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Tuition advisory fees</p>
        </div>
      </div>

      {/* Middle Grid: Lead Funnel & Application Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Funnel */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[hsl(222,47%,11%)]">Lead Lifecycle Funnel</h2>
            <span className="text-xs text-gray-400 font-medium">CRM Stages</span>
          </div>

          <div className="space-y-4">
            {leadsFunnel.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No leads currently in funnel</p>
            ) : (
              leadsFunnel.map((item) => {
                const pct =
                  safeTotalLeads > 0
                    ? Math.round((item.count / safeTotalLeads) * 100)
                    : 0;
                return (
                  <div key={item.status} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold capitalize text-gray-700">
                        {item.status.replace(/_/g, " ")}
                      </span>
                      <span className="font-mono text-gray-500">
                        {item.count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          statusColors[item.status] || "bg-blue-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Application Stage Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[hsl(222,47%,11%)]">Application Status Distribution</h2>
            <span className="text-xs text-gray-400 font-medium">Admissions Pipeline</span>
          </div>

          <div className="space-y-4">
            {appsByStage.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No applications currently logged</p>
            ) : (
              appsByStage.map((item) => {
                const pct =
                  safeTotalApps > 0
                    ? Math.round((item.count / safeTotalApps) * 100)
                    : 0;
                return (
                  <div key={item.status} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold capitalize text-gray-700">
                        {item.status.replace(/_/g, " ")}
                      </span>
                      <span className="font-mono text-gray-500">
                        {item.count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          statusColors[item.status] || "bg-[hsl(166,72%,40%)]"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Top Destinations & Package Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Study Destinations */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Globe2 className="h-5 w-5 text-[hsl(166,72%,40%)]" />
            <h2 className="text-base font-bold text-[hsl(222,47%,11%)]">Top Study Destinations</h2>
          </div>

          {topDestinations.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No destination metrics yet.</p>
          ) : (
            <div className="space-y-3">
              {topDestinations.map((dest, idx) => (
                <div
                  key={dest.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-6 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-xs text-gray-600">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-gray-800">{dest.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-[hsl(166,72%,40%)] bg-[hsl(166,72%,40%)]/10 px-2.5 py-1 rounded-lg">
                    {dest.count} Applicants
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revenue by Advisory Tier */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-amber-500" />
            <h2 className="text-base font-bold text-[hsl(222,47%,11%)]">Revenue by Advisory Tier</h2>
          </div>

          {revenueByPkg.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No package revenue logged yet.</p>
          ) : (
            <div className="space-y-3">
              {revenueByPkg.map((pkg) => (
                <div
                  key={pkg.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">{pkg.name}</h3>
                    <p className="text-[11px] text-gray-400">Verified remittances</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">
                      ₹{Number(pkg.count ?? 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

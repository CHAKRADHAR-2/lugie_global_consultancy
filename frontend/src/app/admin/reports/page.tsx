"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/feedback";
import { SkeletonCard, SkeletonStats } from "@/components/ui/skeleton";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import {
  TrendingUp,
  Users,
  GraduationCap,
  Globe2,
  Wallet,
  RefreshCw,
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

const BEYOND_FUNNEL_COLORS: Record<string, string> = {
  new: "#D9A879",
  contacted: "#B7CBC2",
  in_discussion: "#3F6258",
  qualified: "#3F6258",
  converted: "#394B49",
  lost: "#8E572C",
  closed_lost: "#8E572C",
  draft: "#D9A879",
  documents_pending: "#8E572C",
  review: "#B7CBC2",
  under_review: "#B7CBC2",
  submitted: "#3F6258",
  conditional_offer: "#3F6258",
  unconditional_offer: "#394B49",
  accepted: "#394B49",
  visa_applied: "#3F6258",
  visa_approved: "#394B49",
  rejected: "#8E572C",
  withdrawn: "#546866",
};

const SERIES_PALETTE = ["#394B49", "#3F6258", "#B7CBC2", "#D9A879", "#8E572C"];

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
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="font-editorial text-2xl sm:text-3xl tracking-tight text-[#263331]">
            Executive Analytics &amp; Reports
          </h1>
          <p className="text-sm text-[#546866]">Loading executive intelligence…</p>
        </div>
        <SkeletonStats count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
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

  const safeTotalRev = typeof reports.total_revenue === "number" ? reports.total_revenue : 0;
  const safeTotalLeads = typeof reports.total_leads === "number" ? reports.total_leads : 0;
  const safeTotalApps = typeof reports.total_applications === "number" ? reports.total_applications : 0;
  const safeConversionRate =
    typeof reports.conversion_rate === "number" ? reports.conversion_rate : 0;
  const leadsFunnel = Array.isArray(reports.leads_funnel) ? reports.leads_funnel : [];
  const appsByStage = Array.isArray(reports.applications_by_stage)
    ? reports.applications_by_stage
    : [];
  const topDestinations = Array.isArray(reports.top_destinations)
    ? reports.top_destinations
    : [];
  const revenueByPkg = Array.isArray(reports.revenue_by_package)
    ? reports.revenue_by_package
    : [];

  const maxDestCount = Math.max(1, ...topDestinations.map((d) => Number(d.count ?? 0)));
  const totalPkgRevenue = revenueByPkg.reduce(
    (sum, item) => sum + Number(item.count ?? 0),
    0
  );

  // Build SVG Donut arcs for Application Status Distribution
  const donutRadius = 42;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const appStageTotal = appsByStage.reduce((acc, s) => acc + s.count, 0);
  let cumulativeArc = 0;
  const donutSegments = appsByStage.map((item, idx) => {
    const share = appStageTotal > 0 ? item.count / appStageTotal : 0;
    const arcLen = share * donutCircumference;
    const offset = -cumulativeArc;
    cumulativeArc += arcLen;
    return {
      ...item,
      color:
        BEYOND_FUNNEL_COLORS[item.status] ||
        SERIES_PALETTE[idx % SERIES_PALETTE.length],
      arcLen,
      offset,
      pct: appStageTotal > 0 ? Math.round(share * 100) : 0,
    };
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8E572C]">
            Business Intelligence
          </span>
          <h1 className="font-editorial text-2xl sm:text-3xl tracking-tight text-[#263331] mt-0.5">
            Executive Analytics &amp; Reports
          </h1>
          <p className="mt-1 text-sm text-[#546866]">
            Real-time business intelligence: lead conversion funnel, application pipelines, and revenue breakdown.
          </p>
        </div>
        <Button
          variant="secondary"
          size="md"
          onClick={handleRefresh}
          disabled={refreshing}
          loading={refreshing}
          loadingText="Refreshing…"
          className="self-start sm:self-center"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Metrics
        </Button>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <div className="beyond-card p-5">
          <div className="flex items-center justify-between text-[#546866] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Conversion Rate
            </span>
            <TrendingUp className="h-4 w-4 text-[#2F6B55]" />
          </div>
          <div className="text-2xl font-bold text-[#2F6B55]">{safeConversionRate}%</div>
          <p className="text-[11px] text-[#546866] mt-1">
            {reports.converted_leads ?? 0} of {safeTotalLeads} leads converted
          </p>
        </div>

        <div className="beyond-card p-5">
          <div className="flex items-center justify-between text-[#546866] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Total Leads
            </span>
            <Users className="h-4 w-4 text-[#394B49]" />
          </div>
          <div className="text-2xl font-bold text-[#263331]">
            <AnimatedCounter target={safeTotalLeads} />
          </div>
          <p className="text-[11px] text-[#546866] mt-1">In CRM Pipeline</p>
        </div>

        <div className="beyond-card p-5">
          <div className="flex items-center justify-between text-[#546866] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Active Students
            </span>
            <GraduationCap className="h-4 w-4 text-[#3F6258]" />
          </div>
          <div className="text-2xl font-bold text-[#263331]">
            <AnimatedCounter target={reports.total_students ?? 0} />
          </div>
          <p className="text-[11px] text-[#546866] mt-1">Enrolled dossiers</p>
        </div>

        <div className="beyond-card p-5">
          <div className="flex items-center justify-between text-[#546866] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Applications
            </span>
            <Layers className="h-4 w-4 text-[#8E572C]" />
          </div>
          <div className="text-2xl font-bold text-[#263331]">
            <AnimatedCounter target={safeTotalApps} />
          </div>
          <p className="text-[11px] text-[#546866] mt-1">Across partner universities</p>
        </div>

        {/* Executive Forest Slate Revenue Highlight */}
        <div className="rounded-2xl bg-[#394B49] text-white p-5 border border-[#263331] shadow-sm">
          <div className="flex items-center justify-between text-[#DCE5E8] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Gross Revenue
            </span>
            <Wallet className="h-4 w-4 text-[#D9A879]" />
          </div>
          <div className="text-2xl font-bold text-white">
            <AnimatedCounter target={safeTotalRev} prefix="₹" />
          </div>
          <p className="text-[11px] text-[#B7CBC2] mt-1">Tuition advisory fees</p>
        </div>
      </div>

      {/* Middle Grid: Lead Funnel & Application Pipeline SVG Visualisations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Funnel */}
        <div className="beyond-card p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE5E8]">
            <div>
              <h2 className="text-base font-semibold text-[#263331]">
                Lead Lifecycle Funnel
              </h2>
              <p className="text-xs text-[#546866] mt-0.5">
                Proportional progression across CRM statuses
              </p>
            </div>
            <StatusBadge tone="sage">CRM Stages</StatusBadge>
          </div>

          {leadsFunnel.length === 0 ? (
            <p className="text-xs text-[#546866] italic py-8 text-center">
              No leads currently in funnel
            </p>
          ) : (
            <>
              {/* Stacked Proportion SVG Strip */}
              <div className="space-y-2">
                <svg
                  viewBox="0 0 400 16"
                  className="w-full h-4 rounded-full overflow-hidden bg-[#EEF3F5]"
                  role="img"
                  aria-label="Lead lifecycle stacked proportions"
                >
                  {(() => {
                    let xCursor = 0;
                    const denom = Math.max(
                      1,
                      leadsFunnel.reduce((s, item) => s + item.count, 0)
                    );
                    return leadsFunnel.map((item, idx) => {
                      const w = (item.count / denom) * 400;
                      const fill =
                        BEYOND_FUNNEL_COLORS[item.status] ||
                        SERIES_PALETTE[idx % SERIES_PALETTE.length];
                      const rect = (
                        <rect
                          key={item.status}
                          x={xCursor}
                          y={0}
                          width={w}
                          height={16}
                          fill={fill}
                        />
                      );
                      xCursor += w;
                      return rect;
                    });
                  })()}
                </svg>
              </div>

              {/* Per-Stage Horizontal Bars */}
              <div className="space-y-3.5">
                {leadsFunnel.map((item, idx) => {
                  const pct =
                    safeTotalLeads > 0
                      ? Math.round((item.count / safeTotalLeads) * 100)
                      : 0;
                  const fill =
                    BEYOND_FUNNEL_COLORS[item.status] ||
                    SERIES_PALETTE[idx % SERIES_PALETTE.length];
                  return (
                    <div key={item.status} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold capitalize text-[#394B49] flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: fill }}
                            aria-hidden="true"
                          />
                          {item.status.replace(/_/g, " ")}
                        </span>
                        <span className="font-mono text-[#546866]">
                          <strong className="text-[#263331]">{item.count}</strong> ({pct}%)
                        </span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-[#EEF3F5] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${Math.max(item.count > 0 ? 4 : 0, pct)}%`,
                            backgroundColor: fill,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Application Stage Distribution with SVG Donut */}
        <div className="beyond-card p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE5E8]">
            <div>
              <h2 className="text-base font-semibold text-[#263331]">
                Application Status Distribution
              </h2>
              <p className="text-xs text-[#546866] mt-0.5">
                Live admissions pipeline across partner universities
              </p>
            </div>
            <StatusBadge tone="warm">Admissions Pipeline</StatusBadge>
          </div>

          {appsByStage.length === 0 ? (
            <p className="text-xs text-[#546866] italic py-8 text-center">
              No applications currently logged
            </p>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* SVG Donut Chart */}
              <div className="relative h-36 w-36 shrink-0 flex items-center justify-center">
                <svg
                  viewBox="0 0 112 112"
                  className="h-full w-full -rotate-90"
                  role="img"
                  aria-label="Application stage distribution donut chart"
                >
                  <circle
                    cx="56"
                    cy="56"
                    r={donutRadius}
                    fill="none"
                    stroke="#EEF3F5"
                    strokeWidth="12"
                  />
                  {donutSegments.map((seg) => (
                    <circle
                      key={seg.status}
                      cx="56"
                      cy="56"
                      r={donutRadius}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="12"
                      strokeDasharray={`${seg.arcLen} ${donutCircumference}`}
                      strokeDashoffset={seg.offset}
                      className="transition-all duration-700 ease-out"
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-bold text-[#263331]">{safeTotalApps}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#546866]">
                    Total Apps
                  </span>
                </div>
              </div>

              {/* Stage Progress List */}
              <div className="flex-1 w-full space-y-3">
                {donutSegments.map((seg) => (
                  <div key={seg.status} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold capitalize text-[#394B49] flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: seg.color }}
                          aria-hidden="true"
                        />
                        {seg.status.replace(/_/g, " ")}
                      </span>
                      <span className="font-mono text-[#546866]">
                        <strong className="text-[#263331]">{seg.count}</strong> ({seg.pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#EEF3F5] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${Math.max(seg.count > 0 ? 4 : 0, seg.pct)}%`,
                          backgroundColor: seg.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Grid: Top Destinations & Package Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Study Destinations */}
        <div className="beyond-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE5E8]">
            <div className="flex items-center gap-2">
              <Globe2 className="h-5 w-5 text-[#3F6258]" />
              <h2 className="text-base font-semibold text-[#263331]">
                Top Study Destinations
              </h2>
            </div>
            <span className="text-xs text-[#546866]">Applicant demand</span>
          </div>

          {topDestinations.length === 0 ? (
            <p className="text-xs text-[#546866] italic py-8 text-center">
              No destination metrics yet.
            </p>
          ) : (
            <div className="space-y-3">
              {topDestinations.map((dest, idx) => {
                const countVal = Number(dest.count ?? 0);
                const relWidth = Math.max(
                  countVal > 0 ? 8 : 0,
                  Math.round((countVal / maxDestCount) * 100)
                );
                const barColor = SERIES_PALETTE[idx % SERIES_PALETTE.length];
                return (
                  <div
                    key={dest.name}
                    className="p-3.5 rounded-xl bg-[#F3F0E8]/75 border border-[#DCE5E8] space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="h-6 w-6 rounded-full bg-white border border-[#DCE5E8] flex items-center justify-center font-semibold text-xs text-[#394B49]">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-[#263331]">
                          {dest.name}
                        </span>
                      </div>
                      <StatusBadge tone="sage">{countVal} Applicants</StatusBadge>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#DCE5E8]/60 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${relWidth}%`, backgroundColor: barColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Revenue by Advisory Tier */}
        <div className="beyond-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE5E8]">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-[#8E572C]" />
              <h2 className="text-base font-semibold text-[#263331]">
                Revenue by Advisory Tier
              </h2>
            </div>
            <span className="text-xs text-[#546866]">Package breakdown</span>
          </div>

          {revenueByPkg.length === 0 ? (
            <p className="text-xs text-[#546866] italic py-8 text-center">
              No package revenue logged yet.
            </p>
          ) : (
            <div className="space-y-3">
              {revenueByPkg.map((pkg, idx) => {
                const amount = Number(pkg.count ?? 0);
                const sharePct =
                  totalPkgRevenue > 0 ? Math.round((amount / totalPkgRevenue) * 100) : 0;
                const tierColor =
                  idx === 0
                    ? "#394B49"
                    : idx === 1
                    ? "#D9A879"
                    : idx === 2
                    ? "#3F6258"
                    : SERIES_PALETTE[idx % SERIES_PALETTE.length];

                return (
                  <div
                    key={pkg.name}
                    className="p-3.5 rounded-xl bg-[#F3F0E8]/75 border border-[#DCE5E8] space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xs font-semibold text-[#263331]">{pkg.name}</h3>
                        <p className="text-[11px] text-[#546866]">
                          Verified remittances ({sharePct}%)
                        </p>
                      </div>
                      <span className="text-sm font-bold text-[#263331]">
                        ₹{amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#DCE5E8]/60 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${Math.max(amount > 0 ? 6 : 0, sharePct)}%`,
                          backgroundColor: tierColor,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

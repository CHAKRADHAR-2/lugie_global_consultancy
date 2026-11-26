"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/feedback";
import { SkeletonCard } from "@/components/ui/skeleton";
import {
  FileCheck,
  Search,
  User,
  Building2,
  Save,
} from "lucide-react";

interface Application {
  id: string;
  student_id: string;
  student_name?: string;
  student_email?: string;
  course_id: string;
  course_name?: string;
  university_name?: string;
  status: string;
  application_reference: string | null;
  submission_date: string | null;
  deadline: string | null;
  notes: string | null;
  created_at: string;
}

interface ApplicationListResponse {
  items: Application[];
  total: number;
  page: number;
  page_size: number;
}

const STATUS_OPTIONS = [
  "draft",
  "under_review",
  "submitted",
  "conditional_offer",
  "unconditional_offer",
  "rejected",
  "withdrawn",
  "visa_applied",
  "visa_approved",
];

function getAppStatusTone(
  status: string
): "success" | "sage" | "warm" | "misty" | "warning" | "error" | "slate" {
  switch (status) {
    case "unconditional_offer":
    case "visa_approved":
      return "success";
    case "conditional_offer":
    case "submitted":
    case "under_review":
    case "visa_applied":
      return "sage";
    case "draft":
      return "warm";
    case "rejected":
    case "withdrawn":
      return "error";
    default:
      return "misty";
  }
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [editingStatus, setEditingStatus] = useState("");
  const [reference, setReference] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  async function fetchApplications() {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: "1",
        page_size: "50",
      };
      if (statusFilter) params.status = statusFilter;

      const data = await api.get<ApplicationListResponse>("applications", { params });
      const items = data?.items || [];
      setApplications(items);
      setTotal(data?.total || 0);
      if (items.length) {
        setSelectedApp(items[0]);
        setEditingStatus(items[0].status);
        setReference(items[0].application_reference || "");
      } else {
        setSelectedApp(null);
      }
    } catch (err) {
      console.error("Failed to load applications:", err);
      toast.error("Failed to load applications list.");
    } finally {
      setLoading(false);
    }
  }

  const handleSelectApp = (app: Application) => {
    setSelectedApp(app);
    setEditingStatus(app.status);
    setReference(app.application_reference || "");
  };

  const handleUpdate = async () => {
    if (!selectedApp) return;
    setUpdating(true);
    try {
      const updated = await api.patch<Application>(`applications/${selectedApp.id}`, {
        status: editingStatus,
        application_reference: reference || null,
      });
      toast.success("Application updated successfully.");
      setSelectedApp(updated);
      setApplications((prev) =>
        prev.map((a) =>
          a.id === selectedApp.id
            ? { ...a, status: editingStatus, application_reference: reference }
            : a
        )
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to update application.");
    } finally {
      setUpdating(false);
    }
  };

  const filtered = applications.filter((app) => {
    const q = search.toLowerCase();
    const studentMatch =
      (app.student_name && app.student_name.toLowerCase().includes(q)) ||
      (app.student_email && app.student_email.toLowerCase().includes(q)) ||
      app.student_id.includes(q);
    const uniMatch =
      (app.university_name && app.university_name.toLowerCase().includes(q)) ||
      (app.course_name && app.course_name.toLowerCase().includes(q)) ||
      (app.application_reference && app.application_reference.toLowerCase().includes(q));
    return !search || studentMatch || uniMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8E572C]">
            Admissions Desk
          </span>
          <h1 className="font-editorial text-2xl sm:text-3xl tracking-tight text-[#263331] mt-0.5">
            University Application Management
          </h1>
          <p className="mt-1 text-sm text-[#546866]">
            Total {total} active student applications filed with global university admissions boards.
          </p>
        </div>
        <StatusBadge tone="sage" className="self-start sm:self-center">
          {total} Filed Applications
        </StatusBadge>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#F3F0E8]/75 border border-[#DCE5E8] p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#546866]" />
          <input
            type="text"
            placeholder="Search by student name, email, university, or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[#DCE5E8] bg-white pl-10 pr-3.5 py-2.5 text-sm text-[#394B49] placeholder:text-[#546866]/70 focus:border-[#394B49] focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <label className="text-xs font-semibold text-[#546866] whitespace-nowrap">Stage:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-56 rounded-xl border border-[#DCE5E8] bg-white px-3.5 py-2.5 text-sm text-[#394B49] focus:border-[#394B49] focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
          >
            <option value="">All Application Stages</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ").toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Master Detail Grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="lg:col-span-6">
            <SkeletonCard />
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="beyond-card p-12 text-center">
          <FileCheck className="h-9 w-9 text-[#546866]/45 mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#263331]">No applications match criteria</p>
          <p className="text-xs text-[#546866] mt-1">
            Try clearing your search or selecting a different stage filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Applications Column */}
          <div className="lg:col-span-6 space-y-3 max-h-[720px] overflow-y-auto pr-1">
            {filtered.map((app) => {
              const isSelected = selectedApp?.id === app.id;
              return (
                <button
                  type="button"
                  key={app.id}
                  onClick={() => handleSelectApp(app)}
                  className={`w-full text-left cursor-pointer rounded-2xl p-4 border transition-all ${
                    isSelected
                      ? "bg-[#E6EFEA]/55 border-[#394B49] shadow-sm ring-2 ring-[#B7CBC2]/70"
                      : "beyond-card beyond-card-interactive"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-semibold text-sm text-[#263331] truncate">
                      {app.university_name || "Target Institution"}
                    </span>
                    <StatusBadge
                      tone={getAppStatusTone(app.status)}
                      className="uppercase text-[10px]"
                    >
                      {app.status.replace(/_/g, " ")}
                    </StatusBadge>
                  </div>

                  <p className="text-xs text-[#546866] font-medium mb-2">
                    {app.course_name || "Academic Programme"}
                  </p>

                  <div className="flex items-center gap-2 pt-2.5 border-t border-[#DCE5E8]/80 text-xs">
                    <User className="h-3.5 w-3.5 text-[#3F6258] shrink-0" />
                    <span className="font-semibold text-[#263331]">
                      {app.student_name || `Candidate #${app.student_id.slice(0, 8)}`}
                    </span>
                    <span className="text-[#546866] text-[11px] truncate">
                      ({app.student_email || "Email on file"})
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#546866] pt-1.5">
                    <span>Ref: {app.application_reference || "Pending"}</span>
                    <span>Filed: {new Date(app.created_at).toLocaleDateString()}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Edit Drawer */}
          <div className="lg:col-span-6">
            {selectedApp && (
              <div className="beyond-card p-6 space-y-5">
                <div className="pb-4 border-b border-[#DCE5E8]">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-lg font-semibold text-[#263331]">
                      Admissions Stage &amp; Outcome Console
                    </h2>
                    <StatusBadge tone={getAppStatusTone(selectedApp.status)} className="uppercase text-[10px]">
                      {selectedApp.status.replace(/_/g, " ")}
                    </StatusBadge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                    <span className="font-semibold text-[#3F6258]">
                      {selectedApp.student_name || "Candidate"}
                    </span>
                    <span className="text-[#546866]">• {selectedApp.student_email}</span>
                  </div>
                  <div className="mt-3 rounded-xl bg-[#F3F0E8]/75 border border-[#DCE5E8] p-3 text-xs flex items-start gap-2.5">
                    <Building2 className="h-4 w-4 text-[#8E572C] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#263331]">
                        {selectedApp.university_name || "Target Institution"}
                      </p>
                      <p className="text-[#546866]">{selectedApp.course_name || "Academic Programme"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
                      Admissions Stage / Status
                    </label>
                    <select
                      value={editingStatus}
                      onChange={(e) => setEditingStatus(e.target.value)}
                      className="w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.replace(/_/g, " ").toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
                      Official University Reference / Application ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. TUM-2025-APP-88419"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
                    />
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleUpdate}
                    loading={updating}
                    loadingText="Saving…"
                    className="w-full"
                  >
                    <Save className="h-4 w-4" />
                    Save Application Status
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import {
  FileCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
  Building2,
  GraduationCap,
  User,
  Mail,
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
        prev.map((a) => (a.id === selectedApp.id ? { ...a, status: editingStatus, application_reference: reference } : a))
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

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileCheck className="h-6 w-6 text-primary" />
          University Application Management Desk
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Total {total} active student applications filed with global university admissions boards.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by student name, email, university, or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-semibold text-muted-foreground">Stage:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Application Stages</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ").toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Master Detail Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-2xl border border-border shadow-sm">
          <FileCheck className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold text-foreground">No applications match criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Applications Column */}
          <div className="lg:col-span-6 space-y-3">
            {filtered.map((app) => {
              const isSelected = selectedApp?.id === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => handleSelectApp(app)}
                  className={`cursor-pointer rounded-2xl p-4 border transition ${
                    isSelected
                      ? "border-primary bg-card shadow-md ring-2 ring-primary/10"
                      : "border-border bg-card hover:border-primary/40 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-foreground">
                      {app.university_name || "Target Institution"}
                    </span>
                    <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                      {app.status.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    {app.course_name || "Academic Programme"}
                  </p>

                  <div className="flex items-center gap-2 pt-2 border-t border-border mt-2 text-xs">
                    <User className="h-3.5 w-3.5 text-primary" />
                    <span className="font-bold text-foreground">
                      {app.student_name || `Candidate #${app.student_id.slice(0, 8)}`}
                    </span>
                    <span className="text-muted-foreground text-[11px] truncate">
                      ({app.student_email || "Email on file"})
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1.5">
                    <span>Ref: {app.application_reference || "Pending"}</span>
                    <span>Filed: {new Date(app.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Edit Drawer */}
          <div className="lg:col-span-6">
            {selectedApp && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
                <div className="pb-3 border-b border-border">
                  <h3 className="text-lg font-bold text-foreground">
                    Admissions Stage & Outcome Console
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold text-primary">
                      {selectedApp.student_name || "Candidate"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      • {selectedApp.student_email}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Admissions Stage / Status
                    </label>
                    <select
                      value={editingStatus}
                      onChange={(e) => setEditingStatus(e.target.value)}
                      className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.replace("_", " ").toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Official University Reference / Application ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. TUM-2025-APP-88419"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <button
                    onClick={handleUpdate}
                    disabled={updating}
                    className="w-full rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                  >
                    {updating && <Loader2 className="h-4 w-4 animate-spin" />}
                    {updating ? "Saving..." : "Save Application Status"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

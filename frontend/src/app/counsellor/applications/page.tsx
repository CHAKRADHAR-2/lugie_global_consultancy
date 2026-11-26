"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import {
  FileCheck,
  Search,
  Building2,
  Filter,
  Mail,
  GraduationCap,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/feedback";
import { GlobalOrbitLoader } from "@/components/ui/loading-concepts";
import { SkeletonRow } from "@/components/ui/skeleton";

interface Application {
  id: string;
  student_id: string;
  student_name?: string;
  student_email?: string;
  course_id: string;
  course_name?: string;
  university_name?: string;
  intake_id?: string;
  status: string;
  application_reference: string | null;
  submission_date: string | null;
  deadline: string | null;
  notes: string | null;
  created_at: string;
}

const INPUT_CLASS =
  "w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] placeholder:text-[#546866]/70 focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition";

function getApplicationStatusTone(
  status: string
): "success" | "sage" | "warm" | "misty" | "warning" | "error" {
  const s = (status || "").toLowerCase();
  if (s === "accepted" || s === "unconditional_offer" || s === "visa_approved") return "success";
  if (s === "submitted" || s === "conditional_offer") return "sage";
  if (s === "under_review" || s === "pending" || s === "documents_pending") return "warning";
  if (s === "rejected") return "error";
  return "misty";
}

export default function CounsellorApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  async function loadApplications() {
    try {
      const data = await api.get<any>("applications");
      const list = data?.items || (Array.isArray(data) ? data : []);
      setApplications(list);
    } catch (err) {
      console.error("Failed to load applications:", err);
      toast.error("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  async function handleStatusUpdate(appId: string, newStatus: string) {
    try {
      await api.patch(`applications/${appId}`, { status: newStatus });
      toast.success(`Application updated to ${newStatus.replace(/_/g, " ")}.`);
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to update application status.");
    }
  }

  const filtered = applications.filter((app) => {
    const q = search.toLowerCase();
    const studentMatch =
      (app.student_name && app.student_name.toLowerCase().includes(q)) ||
      (app.student_email && app.student_email.toLowerCase().includes(q)) ||
      app.student_id.toLowerCase().includes(q);
    const uniMatch =
      (app.university_name && app.university_name.toLowerCase().includes(q)) ||
      (app.course_name && app.course_name.toLowerCase().includes(q)) ||
      (app.application_reference && app.application_reference.toLowerCase().includes(q));
    const matchesSearch = !search || studentMatch || uniMatch;
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl tracking-tight text-[#263331] flex items-center gap-2.5">
            <FileCheck className="h-6 w-6 text-[#3F6258] shrink-0" />
            <span>University Admissions Applications Desk</span>
          </h1>
          <p className="text-sm text-[#546866] mt-1">
            Track student application submissions, institutional reference IDs, and committee outcomes.
          </p>
        </div>
        <StatusBadge tone="sage">{applications.length} Total Applications</StatusBadge>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#F3F0E8]/60 border border-[#DCE5E8] rounded-xl p-3 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-[#546866] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by student name, email, university, or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${INPUT_CLASS} pl-10 bg-white`}
          />
        </div>

        <div className="relative sm:w-60">
          <Filter className="h-4 w-4 text-[#546866] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter applications by stage"
            className={`${INPUT_CLASS} pl-10 bg-white font-medium`}
          >
            <option value="all">All Stages ({applications.length})</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="conditional_offer">Conditional Offer</option>
            <option value="unconditional_offer">Unconditional Offer</option>
            <option value="rejected">Rejected</option>
            <option value="accepted">Accepted</option>
          </select>
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="beyond-card p-6 space-y-4">
          <GlobalOrbitLoader label="Syncing university applications…" size="md" className="py-4" />
          <div className="space-y-1">
            <SkeletonRow cols={6} />
            <SkeletonRow cols={6} />
            <SkeletonRow cols={6} />
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="beyond-card p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6EFEA] border border-[#B7CBC2] text-[#3F6258]">
            <FileCheck className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-[#263331]">No applications found</h3>
          <p className="text-sm text-[#546866] mt-1">
            {search
              ? "No applications matching your search."
              : "Student submissions will appear here for tracking."}
          </p>
        </div>
      ) : (
        <div className="beyond-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-sans">
              <thead className="bg-[#F3F0E8]/80 text-[#546866] text-[11px] uppercase tracking-wider font-semibold border-b border-[#DCE5E8]">
                <tr>
                  <th className="px-5 py-3.5">Candidate Details</th>
                  <th className="px-5 py-3.5">University &amp; Programme</th>
                  <th className="px-5 py-3.5">Reference ID</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Submission Date</th>
                  <th className="px-5 py-3.5 text-right">Update Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE5E8]/80 bg-white">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-[#EEF3F5]/45 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-[#263331] text-sm">
                        {app.student_name || `Student #${app.student_id.slice(0, 8)}`}
                      </div>
                      <div className="text-xs text-[#546866] flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span>{app.student_email || "Email on file"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[#263331] flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-[#3F6258] shrink-0" />
                        <span>{app.university_name || "Target Institution"}</span>
                      </div>
                      <div className="text-xs text-[#546866] flex items-center gap-1 mt-0.5">
                        <GraduationCap className="h-3 w-3 shrink-0" />
                        <span>{app.course_name || "Postgraduate Studies"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-[#546866]">
                      {app.application_reference || "Pending submission"}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge
                        tone={getApplicationStatusTone(app.status)}
                        className="capitalize whitespace-nowrap"
                      >
                        {app.status.replace(/_/g, " ")}
                      </StatusBadge>
                    </td>
                    <td className="px-5 py-4 text-xs text-[#546866] tabular-nums whitespace-nowrap">
                      {new Date(app.created_at).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <select
                        value={app.status}
                        aria-label={`Update application stage for ${app.student_name || app.id}`}
                        onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                        className="rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3 py-1.5 text-xs font-semibold text-[#394B49] focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] cursor-pointer"
                      >
                        <option value="draft">Draft</option>
                        <option value="submitted">Submitted</option>
                        <option value="under_review">Under Review</option>
                        <option value="conditional_offer">Conditional Offer</option>
                        <option value="unconditional_offer">Unconditional Offer</option>
                        <option value="rejected">Rejected</option>
                        <option value="accepted">Accepted</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

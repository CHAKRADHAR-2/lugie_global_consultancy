"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import {
  FileCheck,
  Search,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  Filter,
  User,
  Mail,
  GraduationCap,
} from "lucide-react";

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
      toast.success(`Application updated to ${newStatus.replace("_", " ")}.`);
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
      app.student_id.includes(q);
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-primary" />
            University Admissions Applications Desk
          </h1>
          <p className="text-sm text-muted-foreground">
            Track student application submissions, institutional reference IDs, and committee outcomes.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-card p-2.5 rounded-2xl border border-border shadow-sm">
          <Search className="h-4 w-4 text-muted-foreground ml-2" />
          <input
            type="text"
            placeholder="Search by student name, email, university, or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-sm focus:outline-none w-full text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-2xl border border-border shadow-sm">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border-none text-sm focus:outline-none text-foreground font-medium"
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
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border shadow-sm">
          <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="font-semibold text-foreground">No applications found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {search ? "No applications matching your search." : "Student submissions will appear here for tracking."}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Candidate Details</th>
                  <th className="px-5 py-3.5">University & Programme</th>
                  <th className="px-5 py-3.5">Reference ID</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Submission Date</th>
                  <th className="px-5 py-3.5 text-right">Update Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-foreground text-sm">
                        {app.student_name || `Student #${app.student_id.slice(0, 8)}`}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>{app.student_email || "Email on file"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-foreground flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{app.university_name || "Target Institution"}</span>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <GraduationCap className="h-3 w-3 text-muted-foreground" />
                        <span>{app.course_name || "Postgraduate Studies"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                      {app.application_reference || "Pending submission"}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary capitalize border border-primary/20">
                        {app.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      {new Date(app.created_at).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
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

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  ArrowRightCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
} from "lucide-react";

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  preferred_country: string | null;
  preferred_course: string | null;
  status: string;
  source: string | null;
  created_at: string;
  converted_student_id: string | null;
}

export default function CounsellorLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Follow-up modal
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState("");
  const [nextFollowUp, setNextFollowUp] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  async function loadLeads() {
    try {
      const data = await api.get<any>("leads");
      const list = data?.items || (Array.isArray(data) ? data : []);
      setLeads(list);
    } catch (err) {
      console.error("Failed to load leads:", err);
      toast.error("Failed to load assigned leads.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeads();
  }, []);

  async function handleStatusChange(leadId: string, newStatus: string) {
    try {
      await api.patch(`leads/${leadId}`, { status: newStatus });
      toast.success(`Lead status updated to ${newStatus}.`);
      loadLeads();
    } catch (err: any) {
      toast.error(err.message || "Failed to update lead status.");
    }
  }

  async function handleConvert(lead: Lead) {
    if (!confirm(`Convert ${lead.first_name} ${lead.last_name} to a student profile?`)) return;
    try {
      await api.post(`leads/${lead.id}/convert`, {});
      toast.success("Lead successfully converted to Student!");
      loadLeads();
    } catch (err: any) {
      toast.error(err.message || "Failed to convert lead.");
    }
  }

  async function handleAddFollowUp(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLead || !notes.trim()) return;

    setSubmittingNote(true);
    try {
      await api.post(`leads/${selectedLead.id}/follow-ups`, {
        notes: notes.trim(),
        scheduled_at: nextFollowUp ? new Date(nextFollowUp).toISOString() : null,
      });
      toast.success("Follow-up logged successfully!");
      setSelectedLead(null);
      setNotes("");
      setNextFollowUp("");
    } catch (err: any) {
      toast.error(err.message || "Failed to log follow-up.");
    } finally {
      setSubmittingNote(false);
    }
  }

  const filtered = leads.filter((lead) => {
    const matchesSearch =
      `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      (lead.phone && lead.phone.includes(search)) ||
      (lead.preferred_country && lead.preferred_country.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            My Assigned Leads
          </h1>
          <p className="text-sm text-muted-foreground">
            Connect with student inquiries, log follow-ups, and convert prospective candidates.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-card p-2.5 rounded-2xl border border-border">
          <Search className="h-4 w-4 text-muted-foreground ml-2" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-sm focus:outline-none w-full text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-2xl border border-border">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border-none text-sm focus:outline-none text-foreground font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="in_progress">In Progress</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Leads List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="font-semibold text-foreground">No assigned leads found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {search || statusFilter !== "all"
              ? "Try adjusting your filters or search terms."
              : "No leads are currently assigned to your roster."}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Candidate</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Destination & Program</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-foreground">
                        {lead.first_name} {lead.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Created {new Date(lead.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-5 py-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 text-primary" />
                        <span>{lead.email}</span>
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 text-primary" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs">
                      <div className="font-medium text-foreground">
                        {lead.preferred_country || "Undecided"}
                      </div>
                      <div className="text-muted-foreground">
                        {lead.preferred_course || "General Inquiry"}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-border bg-background text-foreground focus:outline-none"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="in_progress">In Progress</option>
                        <option value="qualified">Qualified</option>
                        <option value="converted">Converted</option>
                        <option value="lost">Lost</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted font-medium transition-colors"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-primary" />
                        Log Note
                      </button>
                      {!lead.converted_student_id && (
                        <button
                          onClick={() => handleConvert(lead)}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                          <ArrowRightCircle className="h-3.5 w-3.5" />
                          Convert
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Follow-up / Note Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">
                Log Follow-up: {selectedLead.first_name} {selectedLead.last_name}
              </h3>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddFollowUp} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground">Interaction Notes *</label>
                <textarea
                  required
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Discussed target intake (Fall 2027), IELTS preparation plan, and budget constraints..."
                  className="w-full mt-1.5 p-3 text-sm bg-muted rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Next Scheduled Contact</label>
                <input
                  type="datetime-local"
                  value={nextFollowUp}
                  onChange={(e) => setNextFollowUp(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 text-sm bg-muted rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2 text-sm rounded-xl border border-border text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingNote}
                  className="px-4 py-2 text-sm rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {submittingNote && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

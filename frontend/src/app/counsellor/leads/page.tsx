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
  MessageSquare,
  ArrowRightCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModalShell, StatusBadge } from "@/components/ui/feedback";
import { GlobalOrbitLoader } from "@/components/ui/loading-concepts";
import { SkeletonRow } from "@/components/ui/skeleton";

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

const INPUT_CLASS =
  "w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] placeholder:text-[#546866]/70 focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition";

function getLeadStatusTone(status: string): "success" | "sage" | "warm" | "misty" | "warning" | "error" {
  const s = (status || "").toLowerCase();
  if (s === "converted" || s === "qualified") return "success";
  if (s === "in_progress" || s === "contacted") return "warm";
  if (s === "lost") return "error";
  return "misty";
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
      toast.success(`Lead status updated to ${newStatus.replace(/_/g, " ")}.`);
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
    const q = search.toLowerCase();
    const matchesSearch =
      `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(q) ||
      lead.email.toLowerCase().includes(q) ||
      (lead.phone && lead.phone.includes(search)) ||
      (lead.preferred_country && lead.preferred_country.toLowerCase().includes(q));

    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl tracking-tight text-[#263331] flex items-center gap-2.5">
            <Users className="h-6 w-6 text-[#3F6258] shrink-0" />
            <span>My Assigned Leads</span>
          </h1>
          <p className="text-sm text-[#546866] mt-1">
            Connect with student inquiries, log follow-ups, and convert prospective candidates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge tone="sage">{leads.length} Total Assigned</StatusBadge>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#F3F0E8]/60 border border-[#DCE5E8] rounded-xl p-3 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-[#546866] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${INPUT_CLASS} pl-10 bg-white`}
          />
        </div>

        <div className="relative sm:w-56">
          <Filter className="h-4 w-4 text-[#546866] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter leads by status"
            className={`${INPUT_CLASS} pl-10 bg-white font-medium`}
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
        <div className="beyond-card p-6 space-y-4">
          <GlobalOrbitLoader label="Syncing assigned leads…" size="md" className="py-4" />
          <div className="space-y-1">
            <SkeletonRow cols={5} />
            <SkeletonRow cols={5} />
            <SkeletonRow cols={5} />
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="beyond-card p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6EFEA] border border-[#B7CBC2] text-[#3F6258]">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-[#263331]">No assigned leads found</h3>
          <p className="text-sm text-[#546866] mt-1">
            {search || statusFilter !== "all"
              ? "Try adjusting your filters or search terms."
              : "No leads are currently assigned to your roster."}
          </p>
        </div>
      ) : (
        <div className="beyond-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-sans">
              <thead className="bg-[#F3F0E8]/80 text-[#546866] text-[11px] uppercase tracking-wider font-semibold border-b border-[#DCE5E8]">
                <tr>
                  <th className="px-5 py-3.5">Candidate</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Destination &amp; Program</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE5E8]/80 bg-white">
                {filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#EEF3F5]/45 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[#263331]">
                        {lead.first_name} {lead.last_name}
                      </div>
                      <div className="text-xs text-[#546866] mt-0.5">
                        Created {new Date(lead.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-5 py-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-[#394B49]">
                        <Mail className="h-3.5 w-3.5 text-[#3F6258] shrink-0" />
                        <span>{lead.email}</span>
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-[#546866]">
                          <Phone className="h-3.5 w-3.5 text-[#3F6258] shrink-0" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs">
                      <div className="font-medium text-[#263331]">
                        {lead.preferred_country || "Undecided"}
                      </div>
                      <div className="text-[#546866] mt-0.5">
                        {lead.preferred_course || "General Inquiry"}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <StatusBadge tone={getLeadStatusTone(lead.status)} className="capitalize w-fit">
                          {lead.status.replace(/_/g, " ")}
                        </StatusBadge>
                        <select
                          value={lead.status}
                          aria-label={`Update status for ${lead.first_name} ${lead.last_name}`}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className="rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-2.5 py-1.5 text-xs font-semibold text-[#394B49] focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] cursor-pointer"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="in_progress">In Progress</option>
                          <option value="qualified">Qualified</option>
                          <option value="converted">Converted</option>
                          <option value="lost">Lost</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center justify-end gap-2 flex-wrap">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedLead(lead)}
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-[#3F6258]" />
                          Log Note
                        </Button>
                        {!lead.converted_student_id && (
                          <Button
                            type="button"
                            variant="sage"
                            size="sm"
                            onClick={() => handleConvert(lead)}
                          >
                            <ArrowRightCircle className="h-3.5 w-3.5 text-[#2F6B55]" />
                            Convert
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Follow-up / Note Modal */}
      <ModalShell
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        title={
          selectedLead
            ? `Log Follow-up: ${selectedLead.first_name} ${selectedLead.last_name}`
            : undefined
        }
        subtitle={selectedLead?.email}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddFollowUp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
              Interaction Notes *
            </label>
            <textarea
              required
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Discussed target intake (Fall 2027), IELTS preparation plan, and budget constraints..."
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
              Next Scheduled Contact
            </label>
            <input
              type="datetime-local"
              value={nextFollowUp}
              onChange={(e) => setNextFollowUp(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setSelectedLead(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submittingNote}
              loadingText="Saving..."
              disabled={submittingNote}
            >
              Save Note
            </Button>
          </div>
        </form>
      </ModalShell>
    </div>
  );
}

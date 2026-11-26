"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FeedbackBanner, StatusBadge } from "@/components/ui/feedback";
import { SkeletonCard } from "@/components/ui/skeleton";
import {
  Users,
  Search,
  Phone,
  Mail,
  UserCheck,
  Sparkles,
  Calendar,
  Globe2,
  BookOpen,
} from "lucide-react";

interface Lead {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  source: string;
  status: string;
  preferred_country: string | null;
  preferred_course: string | null;
  preferred_intake: string | null;
  assigned_counsellor_id: string | null;
  converted_student_id: string | null;
  created_at: string;
}

interface LeadListResponse {
  items: Lead[];
  total: number;
  page: number;
  page_size: number;
}

function getLeadStatusTone(
  status: string
): "success" | "sage" | "warm" | "misty" | "warning" | "error" | "slate" {
  switch (status) {
    case "converted":
      return "success";
    case "new":
      return "warm";
    case "in_discussion":
      return "sage";
    case "contacted":
      return "misty";
    case "closed_lost":
      return "error";
    default:
      return "misty";
  }
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [converting, setConverting] = useState(false);
  const [convertPassword, setConvertPassword] = useState("Student@1234");

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  async function fetchLeads(query?: string) {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: "1",
        page_size: "50",
      };
      if (statusFilter) params.status = statusFilter;
      if (query !== undefined ? query : search) {
        params.search = query !== undefined ? query : search;
      }

      const data = await api.get<LeadListResponse>("leads", { params });
      setLeads(data?.items || []);
      setTotal(data?.total || 0);
      if (data?.items?.length && !selectedLead) {
        setSelectedLead(data.items[0]);
      }
    } catch (err: any) {
      console.error("Failed to load leads:", err);
      toast.error("Failed to load leads.");
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads(search);
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const updated = await api.patch<Lead>(`leads/${leadId}`, { status: newStatus });
      setLeads(leads.map((l) => (l.id === leadId ? { ...l, status: updated.status } : l)));
      if (selectedLead?.id === leadId) {
        setSelectedLead({ ...selectedLead, status: updated.status });
      }
      toast.success(`Lead status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update lead status.");
    }
  };

  const handleConvertLead = async (leadId: string) => {
    setConverting(true);
    try {
      const updated = await api.post<Lead>(`leads/${leadId}/convert`, {
        password: convertPassword,
      });
      setLeads(leads.map((l) => (l.id === leadId ? updated : l)));
      setSelectedLead(updated);
      toast.success("Lead successfully converted to registered student!");
    } catch (err: any) {
      toast.error(err.message || "Failed to convert lead.");
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8E572C]">
            Admissions CRM
          </span>
          <h1 className="font-editorial text-2xl sm:text-3xl tracking-tight text-[#263331] mt-0.5">
            CRM Leads &amp; Enquiries
          </h1>
          <p className="mt-1 text-sm text-[#546866]">
            Total {total} enquiries from website forms and consultation requests.
          </p>
        </div>
        <StatusBadge tone="sage" className="self-start sm:self-center">
          {total} Total Enquiries
        </StatusBadge>
      </div>

      {/* Filters */}
      <div className="bg-[#F3F0E8]/75 border border-[#DCE5E8] p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#546866]" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#DCE5E8] bg-white pl-10 pr-3.5 py-2.5 text-sm text-[#394B49] placeholder:text-[#546866]/70 focus:border-[#394B49] focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
            />
          </div>
          <Button type="submit" variant="primary" size="md">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <label className="text-xs font-semibold text-[#546866] whitespace-nowrap">
            Filter Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-48 rounded-xl border border-[#DCE5E8] bg-white px-3.5 py-2.5 text-sm text-[#394B49] focus:border-[#394B49] focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="in_discussion">In Discussion</option>
            <option value="converted">Converted</option>
            <option value="closed_lost">Closed / Lost</option>
          </select>
        </div>
      </div>

      {/* Master Detail View */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="lg:col-span-7">
            <SkeletonCard />
          </div>
        </div>
      ) : leads.length === 0 ? (
        <div className="beyond-card p-12 text-center">
          <Users className="h-9 w-9 text-[#546866]/50 mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#263331]">No leads found</p>
          <p className="text-xs text-[#546866] mt-1">
            Adjust your search term or status filter to see matching enquiries.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Leads List */}
          <div className="lg:col-span-5 space-y-3 max-h-[720px] overflow-y-auto pr-1">
            {leads.map((lead) => {
              const isSelected = selectedLead?.id === lead.id;
              return (
                <button
                  type="button"
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className={`w-full text-left cursor-pointer rounded-2xl p-4 border transition-all ${
                    isSelected
                      ? "bg-[#E6EFEA]/55 border-[#394B49] shadow-sm ring-2 ring-[#B7CBC2]/70"
                      : "beyond-card beyond-card-interactive"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-semibold text-sm text-[#263331] truncate">
                      {lead.first_name} {lead.last_name || ""}
                    </span>
                    <StatusBadge tone={getLeadStatusTone(lead.status)} className="uppercase text-[10px]">
                      {lead.status.replace(/_/g, " ")}
                    </StatusBadge>
                  </div>

                  <p className="text-xs text-[#546866] mb-2.5 truncate">{lead.email}</p>

                  <div className="flex items-center justify-between text-[11px] text-[#546866] border-t border-[#DCE5E8]/80 pt-2">
                    <span>Target: {lead.preferred_country || "Undecided"}</span>
                    <span>{new Date(lead.created_at).toLocaleDateString()}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Lead Detail Drawer */}
          <div className="lg:col-span-7">
            {selectedLead && (
              <div className="beyond-card p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#DCE5E8]">
                  <div>
                    <h2 className="text-lg font-semibold text-[#263331]">
                      {selectedLead.first_name} {selectedLead.last_name || ""}
                    </h2>
                    <span className="text-xs text-[#546866]">
                      Source: <strong className="text-[#394B49]">{selectedLead.source}</strong>
                    </span>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-[#546866]">Status:</label>
                    <select
                      value={selectedLead.status}
                      onChange={(e) => handleStatusChange(selectedLead.id, e.target.value)}
                      className="rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3 py-2 text-xs font-semibold text-[#394B49] focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="in_discussion">In Discussion</option>
                      <option value="converted">Converted</option>
                      <option value="closed_lost">Closed / Lost</option>
                    </select>
                  </div>
                </div>

                {/* Contact Coordinates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2.5 rounded-xl bg-[#EEF3F5]/60 border border-[#DCE5E8] px-3.5 py-3 text-[#394B49]">
                    <Mail className="h-4 w-4 text-[#3F6258] shrink-0" />
                    <span className="truncate font-medium">{selectedLead.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl bg-[#EEF3F5]/60 border border-[#DCE5E8] px-3.5 py-3 text-[#394B49]">
                    <Phone className="h-4 w-4 text-[#8E572C] shrink-0" />
                    <span className="font-medium">{selectedLead.phone || "Not provided"}</span>
                  </div>
                </div>

                {/* Study Preferences */}
                <div className="rounded-xl bg-[#F3F0E8]/75 p-4 sm:p-5 border border-[#DCE5E8] text-xs space-y-3">
                  <h3 className="font-semibold text-[#546866] uppercase text-[11px] tracking-wider">
                    Study Ambition
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <span className="text-[#546866] flex items-center gap-1 mb-0.5">
                        <Globe2 className="h-3.5 w-3.5 text-[#3F6258]" /> Preferred Country
                      </span>
                      <span className="font-semibold text-[#263331] text-sm">
                        {selectedLead.preferred_country || "Not specified"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#546866] flex items-center gap-1 mb-0.5">
                        <BookOpen className="h-3.5 w-3.5 text-[#394B49]" /> Target Course
                      </span>
                      <span className="font-semibold text-[#263331] text-sm">
                        {selectedLead.preferred_course || "Not specified"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#546866] flex items-center gap-1 mb-0.5">
                        <Calendar className="h-3.5 w-3.5 text-[#8E572C]" /> Target Intake
                      </span>
                      <span className="font-semibold text-[#263331] text-sm">
                        {selectedLead.preferred_intake || "Flexible"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lead-to-Student Conversion Box */}
                {selectedLead.status !== "converted" && !selectedLead.converted_student_id ? (
                  <div className="rounded-2xl border border-[#B7CBC2] bg-[#E6EFEA]/65 p-5 space-y-3">
                    <div className="flex items-center gap-2 font-semibold text-[#263331] text-sm">
                      <Sparkles className="h-4 w-4 text-[#3F6258]" />
                      <span>Convert Lead to Active Student Account</span>
                    </div>
                    <p className="text-xs text-[#394B49] leading-relaxed">
                      This will automatically generate a registered user account, student profile, and
                      assign the &quot;student&quot; role.
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                      <input
                        type="text"
                        value={convertPassword}
                        onChange={(e) => setConvertPassword(e.target.value)}
                        placeholder="Temporary Password"
                        className="w-full sm:w-52 rounded-xl border border-[#DCE5E8] bg-white px-3.5 py-2 text-sm text-[#394B49] focus:border-[#394B49] focus:outline-none focus:ring-2 focus:ring-[#B7CBC2]"
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        loading={converting}
                        loadingText="Converting…"
                        onClick={() => handleConvertLead(selectedLead.id)}
                      >
                        <UserCheck className="h-4 w-4" />
                        Convert Now
                      </Button>
                    </div>
                  </div>
                ) : (
                  <FeedbackBanner
                    tone="success"
                    title="Student Account Provisioned"
                    message="This enquiry has been converted into an active student dossier."
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

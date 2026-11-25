"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  Phone,
  Mail,
  Calendar,
  UserCheck,
  Loader2,
  Sparkles,
  AlertCircle,
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
      if (query !== undefined ? query : search) params.search = query !== undefined ? query : search;

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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(215,50%,12%)]">CRM Leads & Enquiries</h1>
          <p className="mt-1 text-sm text-gray-500">
            Total {total} enquiries from website forms and consultation requests.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[hsl(174,85%,32%)]"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">Filter Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-44 py-2 px-3 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[hsl(174,85%,32%)]"
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
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(174,85%,32%)]" />
        </div>
      ) : leads.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-100">
          <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-700">No leads found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Leads List */}
          <div className="lg:col-span-5 space-y-3">
            {leads.map((lead) => {
              const isSelected = selectedLead?.id === lead.id;
              return (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className={`cursor-pointer rounded-2xl p-4 border transition ${
                    isSelected
                      ? "border-[hsl(174,85%,32%)] bg-white shadow-md ring-2 ring-[hsl(174,85%,32%)]/10"
                      : "border-gray-100 bg-white hover:border-gray-200 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-gray-900">
                      {lead.first_name} {lead.last_name || ""}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        lead.status === "new"
                          ? "bg-blue-50 text-blue-700"
                          : lead.status === "converted"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {lead.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mb-2">{lead.email}</p>

                  <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100 pt-2">
                    <span>Target: {lead.preferred_country || "Undecided"}</span>
                    <span>{new Date(lead.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Lead Detail Drawer */}
          <div className="lg:col-span-7">
            {selectedLead && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <h2 className="text-lg font-bold text-[hsl(215,50%,12%)]">
                      {selectedLead.first_name} {selectedLead.last_name || ""}
                    </h2>
                    <span className="text-xs text-gray-400">Source: {selectedLead.source}</span>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-600">Status:</span>
                    <select
                      value={selectedLead.status}
                      onChange={(e) => handleStatusChange(selectedLead.id, e.target.value)}
                      className="text-xs font-bold rounded-lg border border-gray-300 px-2.5 py-1 focus:outline-none"
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
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{selectedLead.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{selectedLead.phone || "Not provided"}</span>
                  </div>
                </div>

                {/* Study Preferences */}
                <div className="rounded-xl bg-gray-50/70 p-4 border border-gray-100 text-xs space-y-2">
                  <h3 className="font-bold text-gray-900 uppercase text-[10px] tracking-wider">
                    Study Ambition
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-400 block">Preferred Country</span>
                      <span className="font-semibold text-gray-800">
                        {selectedLead.preferred_country || "Not specified"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Target Course</span>
                      <span className="font-semibold text-gray-800">
                        {selectedLead.preferred_course || "Not specified"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Target Intake</span>
                      <span className="font-semibold text-gray-800">
                        {selectedLead.preferred_intake || "Flexible"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lead-to-Student Conversion Box */}
                {selectedLead.status !== "converted" && !selectedLead.converted_student_id && (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-emerald-900 text-xs">
                      <Sparkles className="h-4 w-4 text-emerald-600" />
                      <span>Convert Lead to Active Student Account</span>
                    </div>
                    <p className="text-xs text-emerald-950">
                      This will automatically generate a registered user account, student profile, and
                      assign the &quot;student&quot; role.
                    </p>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={convertPassword}
                        onChange={(e) => setConvertPassword(e.target.value)}
                        placeholder="Temporary Password"
                        className="text-xs rounded-lg border border-gray-300 px-3 py-1.5 focus:outline-none w-48"
                      />
                      <button
                        onClick={() => handleConvertLead(selectedLead.id)}
                        disabled={converting}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(174,85%,32%)] px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[hsl(174,85%,38%)] disabled:opacity-50"
                      >
                        {converting ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserCheck className="h-3.5 w-3.5" />}
                        Convert Now
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

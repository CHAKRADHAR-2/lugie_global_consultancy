"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { StatusBadge } from "@/components/ui/feedback";
import { SkeletonRow } from "@/components/ui/skeleton";
import {
  Search,
  Activity,
} from "lucide-react";

interface SystemAuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface LeadAuditLog {
  id: string;
  lead_id: string;
  changed_by_user_id: string | null;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

export default function AdminAuditLogsPage() {
  const [tab, setTab] = useState<"system" | "leads">("system");
  const [systemLogs, setSystemLogs] = useState<SystemAuditLog[]>([]);
  const [leadLogs, setLeadLogs] = useState<LeadAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      try {
        if (tab === "system") {
          const data = await api.get<SystemAuditLog[]>("audit-logs");
          setSystemLogs(data || []);
        } else {
          const data = await api.get<LeadAuditLog[]>("audit-logs/leads");
          setLeadLogs(data || []);
        }
      } catch (err) {
        console.error("Failed to load audit logs:", err);
        toast.error("Failed to load audit logs.");
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, [tab]);

  const filteredSystemLogs = systemLogs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.resource_type && l.resource_type.toLowerCase().includes(search.toLowerCase())) ||
      (l.ip_address && l.ip_address.includes(search))
  );

  const filteredLeadLogs = leadLogs.filter(
    (l) =>
      l.field_name.toLowerCase().includes(search.toLowerCase()) ||
      (l.old_value && l.old_value.toLowerCase().includes(search.toLowerCase())) ||
      (l.new_value && l.new_value.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8E572C]">
          Governance &amp; Security
        </span>
        <h1 className="font-editorial text-2xl sm:text-3xl tracking-tight text-[#263331] mt-0.5">
          Audit Trail &amp; Security Logs
        </h1>
        <p className="mt-1 text-sm text-[#546866]">
          Immutable event ledger tracking administrative operations, lead assignments, and security events.
        </p>
      </div>

      {/* Tabs + Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#F3F0E8]/75 border border-[#DCE5E8] p-4 rounded-2xl">
        <div
          className="inline-flex rounded-xl bg-[#EAE5D9]/70 border border-[#DCE5E8] p-1 self-start"
          role="tablist"
          aria-label="Audit log streams"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "system"}
            onClick={() => {
              setTab("system");
              setSearch("");
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              tab === "system"
                ? "bg-white text-[#263331] shadow-2xs border border-[#DCE5E8]"
                : "text-[#546866] hover:text-[#394B49]"
            }`}
          >
            System Logs
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "leads"}
            onClick={() => {
              setTab("leads");
              setSearch("");
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              tab === "leads"
                ? "bg-white text-[#263331] shadow-2xs border border-[#DCE5E8]"
                : "text-[#546866] hover:text-[#394B49]"
            }`}
          >
            CRM &amp; Lead Activity
          </button>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#546866]" />
          <input
            type="text"
            placeholder={
              tab === "system"
                ? "Search action, resource, or IP..."
                : "Search field, old or new value..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[#DCE5E8] bg-white pl-10 pr-3.5 py-2.5 text-sm text-[#394B49] placeholder:text-[#546866]/70 focus:border-[#394B49] focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
          />
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="beyond-card p-6 space-y-2">
          <SkeletonRow cols={5} />
          <SkeletonRow cols={5} />
          <SkeletonRow cols={5} />
          <SkeletonRow cols={5} />
        </div>
      ) : tab === "system" ? (
        filteredSystemLogs.length === 0 ? (
          <div className="beyond-card text-center py-16 px-4">
            <Activity className="h-10 w-10 text-[#546866]/45 mx-auto mb-3" />
            <h3 className="font-semibold text-[#263331]">No system logs recorded</h3>
            <p className="text-sm text-[#546866] mt-1">
              Actions will appear here as administrative events occur.
            </p>
          </div>
        ) : (
          <div className="beyond-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F3F0E8]/75 border-b border-[#DCE5E8] text-[11px] font-semibold uppercase tracking-wider text-[#546866]">
                  <tr>
                    <th className="px-5 py-3.5">Action</th>
                    <th className="px-5 py-3.5">Resource</th>
                    <th className="px-5 py-3.5">IP Address</th>
                    <th className="px-5 py-3.5">Details</th>
                    <th className="px-5 py-3.5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE5E8]/80 text-[#394B49]">
                  {filteredSystemLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#EEF3F5]/45 transition-colors">
                      <td className="px-5 py-3.5 font-medium">
                        <StatusBadge tone="sage" className="font-mono text-[11px]">
                          {log.action}
                        </StatusBadge>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#394B49] font-medium">
                        {log.resource_type || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-mono text-[#546866]">
                        {log.ip_address || "127.0.0.1"}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#546866] max-w-xs truncate font-mono">
                        {log.details ? JSON.stringify(log.details) : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#546866] whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : filteredLeadLogs.length === 0 ? (
        <div className="beyond-card text-center py-16 px-4">
          <Activity className="h-10 w-10 text-[#546866]/45 mx-auto mb-3" />
          <h3 className="font-semibold text-[#263331]">No lead activity logged</h3>
          <p className="text-sm text-[#546866] mt-1">
            Status changes, assignments, and follow-ups will appear here.
          </p>
        </div>
      ) : (
        <div className="beyond-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3F0E8]/75 border-b border-[#DCE5E8] text-[11px] font-semibold uppercase tracking-wider text-[#546866]">
                <tr>
                  <th className="px-5 py-3.5">Field Changed</th>
                  <th className="px-5 py-3.5">Old Value</th>
                  <th className="px-5 py-3.5">New Value</th>
                  <th className="px-5 py-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE5E8]/80 text-[#394B49]">
                {filteredLeadLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#EEF3F5]/45 transition-colors">
                    <td className="px-5 py-3.5 font-medium">
                      <StatusBadge tone="misty" className="font-mono text-[11px]">
                        {log.field_name}
                      </StatusBadge>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono">
                      {log.old_value ? (
                        <span className="inline-block rounded-md bg-[#FDF2F2] text-[#A63A3A] border border-[#E7BABA] px-2 py-0.5">
                          {log.old_value}
                        </span>
                      ) : (
                        <span className="text-[#546866]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono">
                      {log.new_value ? (
                        <span className="inline-block rounded-md bg-[#EDF5F1] text-[#2F6B55] border border-[#B7CBC2] px-2 py-0.5 font-semibold">
                          {log.new_value}
                        </span>
                      ) : (
                        <span className="text-[#546866]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#546866] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
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

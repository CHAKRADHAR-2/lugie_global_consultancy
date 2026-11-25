"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import {
  ScrollText,
  Search,
  ShieldAlert,
  Clock,
  User,
  Activity,
  Loader2,
  Filter,
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
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ScrollText className="h-6 w-6 text-primary" />
          Audit Trail & Security Logs
        </h1>
        <p className="text-sm text-muted-foreground">
          Immutable event ledger tracking administrative operations, lead assignments, and security events.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => {
            setTab("system");
            setSearch("");
          }}
          className={`pb-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
            tab === "system"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          System Logs
        </button>
        <button
          onClick={() => {
            setTab("leads");
            setSearch("");
          }}
          className={`pb-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
            tab === "leads"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          CRM & Lead Activity
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3 bg-card p-3 rounded-2xl border border-border">
        <Search className="h-4 w-4 text-muted-foreground ml-2" />
        <input
          type="text"
          placeholder={tab === "system" ? "Search action, resource, or IP..." : "Search field, old or new value..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none text-sm focus:outline-none w-full text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : tab === "system" ? (
        filteredSystemLogs.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-40" />
            <h3 className="font-semibold text-foreground">No system logs recorded</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Actions will appear here as administrative events occur.
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Action</th>
                    <th className="px-5 py-3.5">Resource</th>
                    <th className="px-5 py-3.5">IP Address</th>
                    <th className="px-5 py-3.5">Details</th>
                    <th className="px-5 py-3.5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSystemLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-foreground">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-mono">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">
                        {log.resource_type || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">
                        {log.ip_address || "127.0.0.1"}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground max-w-xs truncate font-mono">
                        {log.details ? JSON.stringify(log.details) : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
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
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-40" />
          <h3 className="font-semibold text-foreground">No lead activity logged</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Status changes, assignments, and follow-ups will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Field Changed</th>
                  <th className="px-5 py-3.5">Old Value</th>
                  <th className="px-5 py-3.5">New Value</th>
                  <th className="px-5 py-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLeadLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      <span className="font-mono text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                        {log.field_name}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-rose-500 font-mono">
                      {log.old_value || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-emerald-600 font-mono font-semibold">
                      {log.new_value || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
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

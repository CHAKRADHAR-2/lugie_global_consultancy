"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { openAuthenticatedUrl } from "@/lib/auth-tokens";
import { toast } from "sonner";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  Loader2,
  XCircle,
  User,
  Mail,
  Eye,
} from "lucide-react";

interface DocumentItem {
  id: string;
  student_id: string;
  student_name?: string;
  student_email?: string;
  document_type: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  status: string;
  scan_status: string;
  uploaded_at: string;
  verified_at: string | null;
}

interface DocumentListResponse {
  items: DocumentItem[];
  total: number;
  page: number;
  page_size: number;
}

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [scanFilter, setScanFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, [statusFilter, scanFilter]);

  async function fetchDocuments() {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: "1",
        page_size: "50",
      };
      if (statusFilter) params.status = statusFilter;
      if (scanFilter) params.scan_status = scanFilter;

      const data = await api.get<DocumentListResponse>("documents", { params });
      setDocuments(data?.items || []);
      setTotal(data?.total || 0);
    } catch (err) {
      console.error("Failed to load documents:", err);
      toast.error("Failed to load documents queue.");
    } finally {
      setLoading(false);
    }
  }

  const handleVerify = async (docId: string) => {
    try {
      const updated = await api.post<DocumentItem>(`documents/${docId}/verify`);
      setDocuments(documents.map((d) => (d.id === docId ? { ...d, status: "verified" } : d)));
      toast.success("Document marked as verified!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to verify document.");
    }
  };

  const handleReject = async (docId: string) => {
    try {
      const updated = await api.post<DocumentItem>(`documents/${docId}/reject`);
      setDocuments(documents.map((d) => (d.id === docId ? { ...d, status: "rejected" } : d)));
      toast.success("Document marked as rejected.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to reject document.");
    }
  };

  const handleQuarantine = async (docId: string) => {
    if (!confirm("Are you sure you want to quarantine this file due to suspected malware/security risk?")) {
      return;
    }
    try {
      const updated = await api.post<DocumentItem>(`documents/${docId}/quarantine`);
      setDocuments(documents.map((d) => (d.id === docId ? { ...d, scan_status: "quarantined" } : d)));
      toast.warning("Document quarantined by Security System.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to quarantine document.");
    }
  };

  const filtered = documents.filter((doc) => {
    const q = search.toLowerCase();
    const studentMatch =
      (doc.student_name && doc.student_name.toLowerCase().includes(q)) ||
      (doc.student_email && doc.student_email.toLowerCase().includes(q)) ||
      doc.student_id.includes(q);
    const fileMatch =
      (doc.file_name && doc.file_name.toLowerCase().includes(q)) ||
      (doc.document_type && doc.document_type.toLowerCase().includes(q));
    return !search || studentMatch || fileMatch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Central Document & Security Audit Desk
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Total {total} verified files, academic marksheets, and passport copies uploaded by registered candidates.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by student name, email, or file name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-semibold text-muted-foreground">Verification:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-xl border border-border bg-background px-3 py-1.5 focus:outline-none"
          >
            <option value="">All Verification States</option>
            <option value="uploaded">Uploaded / Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>

          <label className="text-xs font-semibold text-muted-foreground">Scan:</label>
          <select
            value={scanFilter}
            onChange={(e) => setScanFilter(e.target.value)}
            className="text-xs rounded-xl border border-border bg-background px-3 py-1.5 focus:outline-none"
          >
            <option value="">All Security States</option>
            <option value="clean">Clean</option>
            <option value="scan_disabled">Scan Disabled</option>
            <option value="pending">Scan Pending</option>
            <option value="quarantined">Quarantined</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Loading audit records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold text-foreground">No documents in queue</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 text-muted-foreground uppercase font-semibold text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="p-3.5">Candidate Details</th>
                  <th className="p-3.5">File Name & Size</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Security Scan</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {filtered.map((doc) => {
                  const isClean = doc.scan_status === "clean" || doc.scan_status === "scan_disabled";
                  const isQuarantined = doc.scan_status === "quarantined";
                  return (
                    <tr key={doc.id} className="hover:bg-muted/30 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-primary" />
                          <span>{doc.student_name || `Candidate #${doc.student_id.slice(0, 8)}`}</span>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span>{doc.student_email || "Email on file"}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-foreground block">{doc.file_name}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {(doc.file_size / 1024).toFixed(0)} KB · {new Date(doc.uploaded_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-foreground uppercase text-[11px]">
                        {doc.document_type.replace(/_/g, " ")}
                      </td>
                      <td className="p-3.5">
                        {isClean ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                            <ShieldCheck className="h-3 w-3" /> Safe & Clean
                          </span>
                        ) : isQuarantined ? (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded text-[10px] border border-rose-200">
                            <AlertTriangle className="h-3 w-3" /> Quarantined
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded text-[10px]">
                            <Clock className="h-3 w-3" /> Scanning
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 font-bold text-[10px] uppercase border ${
                            doc.status === "verified"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : doc.status === "rejected"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-muted text-foreground border-border"
                          }`}
                        >
                          {doc.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            openAuthenticatedUrl(`/api/proxy/documents/${doc.id}/file`, doc.file_name).catch((e) =>
                              toast.error(e instanceof Error ? e.message : "Unable to open document.")
                            )
                          }
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-border text-foreground hover:bg-muted transition font-medium"
                          title="Inspect document"
                        >
                          <Eye className="h-3.5 w-3.5" /> Inspect
                        </button>

                        {doc.status !== "verified" && (
                          <button
                            onClick={() => handleVerify(doc.id)}
                            className="px-2 py-1 rounded-lg bg-emerald-600 text-white font-semibold text-[11px] hover:bg-emerald-700 transition"
                          >
                            Verify
                          </button>
                        )}

                        {doc.status !== "rejected" && (
                          <button
                            onClick={() => handleReject(doc.id)}
                            className="px-2 py-1 rounded-lg border border-rose-200 text-rose-600 font-medium text-[11px] hover:bg-rose-50 transition"
                          >
                            Reject
                          </button>
                        )}

                        {doc.scan_status !== "quarantined" && (
                          <button
                            onClick={() => handleQuarantine(doc.id)}
                            className="px-2 py-1 rounded-lg border border-amber-300 text-amber-700 font-medium text-[11px] hover:bg-amber-50 transition"
                            title="Quarantine file"
                          >
                            Quarantine
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

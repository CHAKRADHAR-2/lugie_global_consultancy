"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { openAuthenticatedUrl } from "@/lib/auth-tokens";
import { toast } from "sonner";
import {
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Filter,
  User,
  Mail,
  Eye,
  ExternalLink,
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
  rejection_reason: string | null;
  uploaded_at: string;
}

interface DocumentListResponse {
  items: DocumentItem[];
  total: number;
  page: number;
  page_size: number;
}

export default function CounsellorDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  async function loadDocuments() {
    try {
      const data = await api.get<DocumentListResponse>("documents");
      setDocuments(data?.items || []);
    } catch (err) {
      console.error("Failed to load documents:", err);
      toast.error("Failed to load document queue.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  async function handleVerify(docId: string) {
    try {
      await api.post(`documents/${docId}/verify`);
      toast.success("Document marked as verified.");
      setDocuments((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, status: "verified" } : d))
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to verify document.");
    }
  }

  async function handleReject(docId: string) {
    try {
      await api.post(`documents/${docId}/reject`);
      toast.success("Document rejected.");
      setDocuments((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, status: "rejected" } : d))
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to reject document.");
    }
  }

  const filtered = documents.filter((doc) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (doc.file_name && doc.file_name.toLowerCase().includes(q)) ||
      (doc.document_type && doc.document_type.toLowerCase().includes(q)) ||
      (doc.student_name && doc.student_name.toLowerCase().includes(q)) ||
      (doc.student_email && doc.student_email.toLowerCase().includes(q)) ||
      doc.student_id.includes(q);
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Candidate Document Verification Desk
          </h1>
          <p className="text-sm text-muted-foreground">
            Audit candidate credentials, verify malware scan integrity, and review transcripts for university admissions.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-card p-2.5 rounded-2xl border border-border shadow-sm">
          <Search className="h-4 w-4 text-muted-foreground ml-2" />
          <input
            type="text"
            placeholder="Search by student name, email, filename, or document category..."
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
            <option value="all">All Statuses ({documents.length})</option>
            <option value="uploaded">Uploaded / Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border shadow-sm">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="font-semibold text-foreground">No documents in queue</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {search ? "No documents match the search criteria." : "Uploaded candidate credentials will appear here for verification."}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Candidate</th>
                  <th className="px-5 py-3.5">Document File</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Security Scan</th>
                  <th className="px-5 py-3.5">Verification</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                    {/* Student Column */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-foreground text-sm flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-primary" />
                        <span>{doc.student_name || `Candidate #${doc.student_id.slice(0, 8)}`}</span>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>{doc.student_email || "Email on file"}</span>
                      </div>
                    </td>

                    {/* Document Info */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-foreground flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate max-w-[200px]">{doc.file_name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {(doc.file_size / (1024 * 1024)).toFixed(2)} MB • {new Date(doc.uploaded_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-lg bg-muted text-foreground text-xs uppercase font-medium border border-border">
                        {doc.document_type.replace(/_/g, " ")}
                      </span>
                    </td>

                    {/* Scan Status */}
                    <td className="px-5 py-4">
                      {doc.scan_status === "clean" ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck className="h-3.5 w-3.5" /> Clean
                        </span>
                      ) : doc.scan_status === "quarantined" ? (
                        <span className="inline-flex items-center gap-1 text-xs text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          <ShieldAlert className="h-3.5 w-3.5" /> Quarantined
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                          <AlertTriangle className="h-3.5 w-3.5" /> Scanning
                        </span>
                      )}
                    </td>

                    {/* Verification Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${
                          doc.status === "verified"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : doc.status === "rejected"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() =>
                          openAuthenticatedUrl(`/api/proxy/documents/${doc.id}/file`, doc.file_name).catch((e) =>
                            toast.error(e instanceof Error ? e.message : "Unable to open document.")
                          )
                        }
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted transition font-medium"
                        title="Inspect Document File"
                      >
                        <Eye className="h-3.5 w-3.5" /> Inspect
                      </button>
                      {doc.status !== "verified" && (
                        <button
                          onClick={() => handleVerify(doc.id)}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition shadow-sm"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Verify
                        </button>
                      )}
                      {doc.status !== "rejected" && (
                        <button
                          onClick={() => handleReject(doc.id)}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-medium transition"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Reject
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
    </div>
  );
}

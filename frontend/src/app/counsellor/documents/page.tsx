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
  ShieldCheck,
  ShieldAlert,
  Filter,
  User,
  Mail,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/feedback";
import { DocumentRevealLoader } from "@/components/ui/loading-concepts";
import { SkeletonRow } from "@/components/ui/skeleton";

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

const INPUT_CLASS =
  "w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] placeholder:text-[#546866]/70 focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition";

function getDocStatusTone(status: string): "success" | "sage" | "warm" | "misty" | "warning" | "error" {
  const s = (status || "").toLowerCase();
  if (s === "verified") return "sage";
  if (s === "rejected") return "error";
  if (s === "uploaded" || s === "pending") return "warm";
  return "misty";
}

export default function CounsellorDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [inspectingDoc, setInspectingDoc] = useState<DocumentItem | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function loadDocuments() {
    try {
      const data = await api.get<DocumentListResponse>("documents");
      const list = Array.isArray(data) ? data : data?.items || [];
      setDocuments(list);
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
    setProcessingId(docId);
    try {
      await api.post(`documents/${docId}/verify`);
      toast.success("Document marked as verified.");
      setDocuments((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, status: "verified" } : d))
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to verify document.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(docId: string) {
    setProcessingId(docId);
    try {
      await api.post(`documents/${docId}/reject`);
      toast.success("Document rejected.");
      setDocuments((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, status: "rejected" } : d))
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to reject document.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleInspect(doc: DocumentItem) {
    setInspectingDoc(doc);
    try {
      await openAuthenticatedUrl(`/api/proxy/documents/${doc.id}/file`, doc.file_name);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to open document.");
    } finally {
      setInspectingDoc(null);
    }
  }

  const filtered = documents.filter((doc) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (doc.file_name && doc.file_name.toLowerCase().includes(q)) ||
      (doc.document_type && doc.document_type.toLowerCase().includes(q)) ||
      (doc.student_name && doc.student_name.toLowerCase().includes(q)) ||
      (doc.student_email && doc.student_email.toLowerCase().includes(q)) ||
      doc.student_id.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl tracking-tight text-[#263331] flex items-center gap-2.5">
            <FileText className="h-6 w-6 text-[#3F6258] shrink-0" />
            <span>Candidate Document Verification Desk</span>
          </h1>
          <p className="text-sm text-[#546866] mt-1">
            Audit candidate credentials, verify malware scan integrity, and review transcripts for university admissions.
          </p>
        </div>
        <StatusBadge tone="sage">{documents.length} Files in Queue</StatusBadge>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#F3F0E8]/60 border border-[#DCE5E8] rounded-xl p-3 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-[#546866] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by student name, email, filename, or document category..."
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
            aria-label="Filter documents by verification status"
            className={`${INPUT_CLASS} pl-10 bg-white font-medium`}
          >
            <option value="all">All Statuses ({documents.length})</option>
            <option value="uploaded">Uploaded / Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Active File Inspection Banner */}
      {inspectingDoc && (
        <div className="beyond-card p-5 bg-[#F3F0E8]/70 border-[#B7CBC2] flex items-center justify-center">
          <DocumentRevealLoader
            label={`Preparing secure preview for "${inspectingDoc.file_name}"…`}
            size="sm"
          />
        </div>
      )}

      {/* Documents Table */}
      {loading ? (
        <div className="beyond-card p-6 space-y-4">
          <DocumentRevealLoader label="Reviewing candidate document queue & scan integrity…" size="md" className="py-4" />
          <div className="space-y-1">
            <SkeletonRow cols={6} />
            <SkeletonRow cols={6} />
            <SkeletonRow cols={6} />
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="beyond-card p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6EFEA] border border-[#B7CBC2] text-[#3F6258]">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-[#263331]">No documents in queue</h3>
          <p className="text-sm text-[#546866] mt-1">
            {search
              ? "No documents match the search criteria."
              : "Uploaded candidate credentials will appear here for verification."}
          </p>
        </div>
      ) : (
        <div className="beyond-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-sans">
              <thead className="bg-[#F3F0E8]/80 text-[#546866] text-[11px] uppercase tracking-wider font-semibold border-b border-[#DCE5E8]">
                <tr>
                  <th className="px-5 py-3.5">Candidate</th>
                  <th className="px-5 py-3.5">Document File</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Security Scan</th>
                  <th className="px-5 py-3.5">Verification</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE5E8]/80 bg-white">
                {filtered.map((doc) => {
                  const isClean =
                    doc.scan_status === "clean" || doc.scan_status === "scan_disabled";
                  const isQuarantined =
                    doc.scan_status === "quarantined" || doc.scan_status === "infected";
                  const isInspecting = inspectingDoc?.id === doc.id;
                  const isBusy = processingId === doc.id;

                  return (
                    <tr key={doc.id} className="hover:bg-[#EEF3F5]/45 transition-colors">
                      {/* Student Column */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-[#263331] text-sm flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-[#3F6258] shrink-0" />
                          <span>{doc.student_name || `Candidate #${doc.student_id.slice(0, 8)}`}</span>
                        </div>
                        <div className="text-xs text-[#546866] flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span>{doc.student_email || "Email on file"}</span>
                        </div>
                      </td>

                      {/* Document Info */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-[#263331] flex items-center gap-1.5">
                          <FileText className="h-4 w-4 text-[#3F6258] shrink-0" />
                          <span className="truncate max-w-[200px]">{doc.file_name}</span>
                        </div>
                        <div className="text-xs text-[#546866] mt-0.5 tabular-nums">
                          {(doc.file_size / (1024 * 1024)).toFixed(2)} MB &bull;{" "}
                          {new Date(doc.uploaded_at).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4">
                        <StatusBadge tone="misty" className="uppercase">
                          {doc.document_type.replace(/_/g, " ")}
                        </StatusBadge>
                      </td>

                      {/* Scan Status */}
                      <td className="px-5 py-4">
                        {isClean ? (
                          <StatusBadge tone="success">
                            <ShieldCheck className="h-3 w-3" /> Clean
                          </StatusBadge>
                        ) : isQuarantined ? (
                          <StatusBadge tone="error">
                            <ShieldAlert className="h-3 w-3" /> Quarantined
                          </StatusBadge>
                        ) : (
                          <StatusBadge tone="warning">
                            <AlertTriangle className="h-3 w-3" /> Scanning
                          </StatusBadge>
                        )}
                      </td>

                      {/* Verification Status */}
                      <td className="px-5 py-4">
                        <StatusBadge tone={getDocStatusTone(doc.status)} className="capitalize">
                          {doc.status}
                        </StatusBadge>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center justify-end gap-2 flex-wrap">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            loading={isInspecting}
                            loadingText="Opening..."
                            disabled={isInspecting}
                            onClick={() => handleInspect(doc)}
                            title="Inspect Document File"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Inspect
                          </Button>
                          {doc.status !== "verified" && (
                            <Button
                              type="button"
                              variant="sage"
                              size="sm"
                              disabled={isBusy}
                              onClick={() => handleVerify(doc.id)}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#2F6B55]" />
                              Verify
                            </Button>
                          )}
                          {doc.status !== "rejected" && (
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              disabled={isBusy}
                              onClick={() => handleReject(doc.id)}
                              className="text-[#A63A3A] border-[#E7BABA] hover:bg-[#FDF2F2] hover:border-[#A63A3A]"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Reject
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

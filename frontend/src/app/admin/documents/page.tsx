"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { openAuthenticatedUrl } from "@/lib/auth-tokens";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ModalShell, StatusBadge } from "@/components/ui/feedback";
import { DocumentRevealLoader } from "@/components/ui/loading-concepts";
import { SkeletonRow } from "@/components/ui/skeleton";
import {
  FileText,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Search,
  User,
  Mail,
  Eye,
  ShieldAlert,
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
  const [quarantineTarget, setQuarantineTarget] = useState<DocumentItem | null>(null);
  const [quarantining, setQuarantining] = useState(false);

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
      await api.post<DocumentItem>(`documents/${docId}/verify`);
      setDocuments(documents.map((d) => (d.id === docId ? { ...d, status: "verified" } : d)));
      toast.success("Document marked as verified!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to verify document.");
    }
  };

  const handleReject = async (docId: string) => {
    try {
      await api.post<DocumentItem>(`documents/${docId}/reject`);
      setDocuments(documents.map((d) => (d.id === docId ? { ...d, status: "rejected" } : d)));
      toast.success("Document marked as rejected.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to reject document.");
    }
  };

  const handleQuarantineConfirm = async () => {
    if (!quarantineTarget) return;
    setQuarantining(true);
    try {
      await api.post<DocumentItem>(`documents/${quarantineTarget.id}/quarantine`);
      setDocuments(
        documents.map((d) =>
          d.id === quarantineTarget.id ? { ...d, scan_status: "quarantined" } : d
        )
      );
      toast.warning("Document quarantined by Security System.");
      setQuarantineTarget(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to quarantine document.");
    } finally {
      setQuarantining(false);
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

  const hasScanningFiles = filtered.some(
    (doc) =>
      doc.scan_status !== "clean" &&
      doc.scan_status !== "scan_disabled" &&
      doc.scan_status !== "quarantined"
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8E572C]">
            Security &amp; Compliance
          </span>
          <h1 className="font-editorial text-2xl sm:text-3xl tracking-tight text-[#263331] mt-0.5">
            Central Document &amp; Security Audit Desk
          </h1>
          <p className="mt-1 text-sm text-[#546866]">
            Total {total} files, academic marksheets, and passport copies uploaded by registered candidates.
          </p>
        </div>
        <StatusBadge tone="sage" className="self-start sm:self-center">
          {total} Queued Files
        </StatusBadge>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#F3F0E8]/75 border border-[#DCE5E8] p-4 rounded-2xl flex flex-col lg:flex-row gap-3 items-center justify-between">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#546866]" />
          <input
            type="text"
            placeholder="Search by student name, email, or file name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[#DCE5E8] bg-white pl-10 pr-3.5 py-2.5 text-sm text-[#394B49] placeholder:text-[#546866]/70 focus:border-[#394B49] focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-[#546866]">Verification:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-[#DCE5E8] bg-white px-3 py-2 text-xs font-medium text-[#394B49] focus:border-[#394B49] focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
            >
              <option value="">All Verification States</option>
              <option value="uploaded">Uploaded / Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-[#546866]">Scan:</label>
            <select
              value={scanFilter}
              onChange={(e) => setScanFilter(e.target.value)}
              className="rounded-xl border border-[#DCE5E8] bg-white px-3 py-2 text-xs font-medium text-[#394B49] focus:border-[#394B49] focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
            >
              <option value="">All Security States</option>
              <option value="clean">Clean</option>
              <option value="scan_disabled">Scan Disabled</option>
              <option value="pending">Scan Pending</option>
              <option value="quarantined">Quarantined</option>
            </select>
          </div>
        </div>
      </div>

      {/* Live Scanning Indicator Strip when pending scans exist */}
      {!loading && hasScanningFiles && (
        <div className="beyond-card p-4 bg-[#FCF6EC]/70 border-[#D9A879] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <DocumentRevealLoader size="sm" label="" />
            <div>
              <p className="text-xs font-semibold text-[#8A5A1E]">
                Automated ClamAV Security Scan Active
              </p>
              <p className="text-[11px] text-[#546866]">
                One or more uploaded dossiers are currently awaiting integrity verification.
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchDocuments}>
            Refresh Queue
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="beyond-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <DocumentRevealLoader label="Reviewing document audit records…" size="md" className="py-4" />
            <SkeletonRow cols={6} />
            <SkeletonRow cols={6} />
            <SkeletonRow cols={6} />
            <SkeletonRow cols={6} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-14 text-center px-4">
            <FileText className="h-10 w-10 text-[#546866]/45 mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#263331]">No documents in queue</p>
            <p className="text-xs text-[#546866] mt-1">
              No uploaded candidate documents match the selected filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3F0E8]/75 border-b border-[#DCE5E8] text-[11px] font-semibold uppercase tracking-wider text-[#546866]">
                <tr>
                  <th className="py-3.5 px-4">Candidate Details</th>
                  <th className="py-3.5 px-4">File Name &amp; Size</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Security Scan</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE5E8]/80 text-[#394B49]">
                {filtered.map((doc) => {
                  const isClean =
                    doc.scan_status === "clean" || doc.scan_status === "scan_disabled";
                  const isQuarantined = doc.scan_status === "quarantined";
                  return (
                    <tr key={doc.id} className="hover:bg-[#EEF3F5]/45 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-sm text-[#263331] flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-[#3F6258] shrink-0" />
                          <span>
                            {doc.student_name || `Candidate #${doc.student_id.slice(0, 8)}`}
                          </span>
                        </div>
                        <div className="text-xs text-[#546866] flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span>{doc.student_email || "Email on file"}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[#263331] block">{doc.file_name}</span>
                        <span className="text-[11px] text-[#546866]">
                          {(doc.file_size / 1024).toFixed(0)} KB ·{" "}
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#394B49] uppercase text-[11px]">
                        {doc.document_type.replace(/_/g, " ")}
                      </td>
                      <td className="py-3.5 px-4">
                        {isClean ? (
                          <StatusBadge tone="success">
                            <ShieldCheck className="h-3 w-3" /> Safe &amp; Clean
                          </StatusBadge>
                        ) : isQuarantined ? (
                          <StatusBadge tone="error">
                            <AlertTriangle className="h-3 w-3" /> Quarantined
                          </StatusBadge>
                        ) : (
                          <StatusBadge tone="warning">
                            <Clock className="h-3 w-3" /> Scanning
                          </StatusBadge>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge
                          tone={
                            doc.status === "verified"
                              ? "success"
                              : doc.status === "rejected"
                              ? "error"
                              : "misty"
                          }
                          className="uppercase text-[10px]"
                        >
                          {doc.status}
                        </StatusBadge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              openAuthenticatedUrl(
                                `/api/proxy/documents/${doc.id}/file`,
                                doc.file_name
                              ).catch((e) =>
                                toast.error(
                                  e instanceof Error ? e.message : "Unable to open document."
                                )
                              )
                            }
                            title="Inspect document"
                          >
                            <Eye className="h-3.5 w-3.5" /> Inspect
                          </Button>

                          {doc.status !== "verified" && (
                            <Button
                              variant="sage"
                              size="sm"
                              onClick={() => handleVerify(doc.id)}
                            >
                              Verify
                            </Button>
                          )}

                          {doc.status !== "rejected" && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleReject(doc.id)}
                              className="border-[#E7BABA] text-[#A63A3A] hover:bg-[#FDF2F2] hover:border-[#A63A3A]"
                            >
                              Reject
                            </Button>
                          )}

                          {doc.scan_status !== "quarantined" && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setQuarantineTarget(doc)}
                              className="border-[#D9A879] text-[#8A5A1E] hover:bg-[#FCF6EC]"
                              title="Quarantine file"
                            >
                              Quarantine
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
        )}
      </div>

      {/* Quarantine Confirmation Modal */}
      <ModalShell
        isOpen={Boolean(quarantineTarget)}
        onClose={() => setQuarantineTarget(null)}
        title="Confirm File Quarantine"
        subtitle="Restrict access to suspected or non-compliant files."
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-[#D9A879] bg-[#FCF6EC] p-3.5 text-xs text-[#8A5A1E]">
            <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Are you sure you want to quarantine{" "}
              <strong className="text-[#263331]">{quarantineTarget?.file_name}</strong> due to
              suspected malware or security risk?
            </p>
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setQuarantineTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="md"
              loading={quarantining}
              loadingText="Quarantining…"
              onClick={handleQuarantineConfirm}
            >
              Confirm Quarantine
            </Button>
          </div>
        </div>
      </ModalShell>
    </div>
  );
}

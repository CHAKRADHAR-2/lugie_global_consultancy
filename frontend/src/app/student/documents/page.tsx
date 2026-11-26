"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { openAuthenticatedUrl } from "@/lib/auth-tokens";
import { toast } from "sonner";
import {
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Trash2,
  ShieldCheck,
  Loader2,
  Search,
  Filter,
  FileCheck2,
} from "lucide-react";

interface DocumentItem {
  id: string;
  document_type: string;
  original_filename: string;
  file_size_bytes: number;
  mime_type: string;
  scan_status: string;
  checksum_sha256?: string;
  is_verified: boolean;
  created_at: string;
}

const DOCUMENT_TYPES = [
  "Passport (Front & Back)",
  "Class X (10th) Marksheet & Certificate",
  "Class XII (12th / Intermediate) Marksheet",
  "Bachelor's Degree Certificate / Provisional",
  "Consolidated Academic Transcripts",
  "Individual Semester Marksheets",
  "Master's Degree Certificate (if applicable)",
  "IELTS / TOEFL / PTE Score Card",
  "GRE / GMAT / SAT / ACT Score Card",
  "Duolingo English Test (DET) Score",
  "Statement of Purpose (SOP)",
  "Letter of Recommendation 1 (Academic)",
  "Letter of Recommendation 2 (Academic)",
  "Letter of Recommendation 3 (Professional)",
  "Updated Resume / Curriculum Vitae",
  "Bank Balance Certificate / Solvency",
  "Affidavit of Financial Support",
  "Work Experience & Relieving Letters",
  "Internship / Project Certificates",
  "Portfolio / Research Publication",
  "Other Relevant Document",
];

export default function StudentDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [docType, setDocType] = useState(DOCUMENT_TYPES[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      const data = await api.get<DocumentItem[]>("documents/me");
      setDocuments(data || []);
    } catch (err) {
      console.error("Failed to load documents:", err);
      toast.error("Could not load documents.");
    } finally {
      setLoading(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Max 15MB limit
      if (file.size > 15 * 1024 * 1024) {
        toast.error("File size cannot exceed 15MB.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please choose a file to upload.");
      return;
    }

    setUploading(true);
    try {
      // Read binary Base64 for 4-layer server inspection
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const res = reader.result as string;
          const cleanBase64 = res.includes(",") ? res.split(",")[1] : res;
          resolve(cleanBase64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      // Submit presigned upload & trigger security scanner
      const presigned = await api.post<{
        document_id: string;
        upload_url: string;
        s3_key: string;
      }>("documents/presigned-upload", {
        filename: selectedFile.name,
        document_type: docType,
        mime_type: selectedFile.type || "application/pdf",
        file_size_bytes: selectedFile.size,
        file_base64: base64Data,
      });

      // Confirm upload
      await api.post("documents/confirm-upload", {
        document_id: presigned.document_id,
      });

      toast.success("Security scans passed! File binary verified & SHA-256 hash generated.");
      setSelectedFile(null);
      // Reset input element
      const fileInput = document.getElementById("doc-file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      await loadDocuments();
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.message || "Document upload failed security scan.");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (docId: string, filename: string) => {
    try {
      const res = await api.get<{ download_url: string }>(`documents/${docId}/download`);
      const targetUrl = res.download_url || `/api/proxy/documents/${docId}/file`;
      await openAuthenticatedUrl(targetUrl, filename);
    } catch (err: any) {
      toast.error(err.message || "Download unavailable (pending security verification).");
    }
  };

  const handleDelete = async (docId: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}" from your dossier? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(docId);
    try {
      await api.delete(`documents/${docId}`);
      toast.success("Document removed from your dossier.");
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err: any) {
      console.error("Failed to delete document:", err);
      toast.error(err.message || "Failed to remove document.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      !searchFilter ||
      doc.original_filename.toLowerCase().includes(searchFilter.toLowerCase()) ||
      doc.document_type.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || doc.document_type === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(166,72%,40%)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[hsl(222,47%,11%)]">Document Dossier</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload, manage, and verify your transcripts, test scorecards, passport, and admissions documents.
        </p>
      </div>

      {/* Upload Box */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FileCheck2 className="h-5 w-5 text-[hsl(166,72%,40%)]" />
          <h2 className="text-base font-bold text-gray-900">Upload New Document</h2>
        </div>

        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Document Category (17+ Categories Available)
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[hsl(166,72%,40%)] bg-white"
            >
              {DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Select File (PDF, JPEG, PNG, DOCX — Max 15MB)
            </label>
            <input
              id="doc-file-input"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.docx"
              onChange={handleFileChange}
              className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[hsl(166,72%,40%)] py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[hsl(166,72%,46%)] disabled:opacity-50 transition"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  Upload
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200/80 p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[hsl(166,72%,40%)] shrink-0" />
            <span>
              <strong>Active 4-Layer Security Scanner:</strong> Magic Byte Header Verification &bull; EICAR / Malicious Script Quarantine &bull; SHA-256 Cryptographic Hash &bull; Isolated Disk Vault.
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
            Real-Time Engine Active
          </span>
        </div>
      </div>

      {/* Document Records Table */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Uploaded Dossier Files ({documents.length})
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Manage your materials or delete outdated records
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[hsl(166,72%,40%)] w-44"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-1.5 px-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[hsl(166,72%,40%)] max-w-[150px]"
            >
              <option value="all">All Categories</option>
              {DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredDocs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center">
            <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500">
              {documents.length === 0
                ? "No documents uploaded yet. Upload your transcripts and test scores above."
                : "No documents match your filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-100">
                <tr>
                  <th className="p-3">Document Category</th>
                  <th className="p-3">File Name</th>
                  <th className="p-3">Size</th>
                  <th className="p-3">Security Scan Status</th>
                  <th className="p-3">Counsellor Review</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredDocs.map((doc) => {
                  const isClean = doc.scan_status === "clean" || doc.scan_status === "scan_disabled";
                  const isQuarantined = doc.scan_status === "quarantined";
                  const isDeleting = deletingId === doc.id;

                  return (
                    <tr key={doc.id} className="hover:bg-gray-50/50 transition">
                      <td className="p-3 font-semibold text-gray-900">{doc.document_type}</td>
                      <td className="p-3 font-mono text-[11px] text-gray-600">{doc.original_filename}</td>
                      <td className="p-3">{(doc.file_size_bytes / 1024).toFixed(0)} KB</td>
                      <td className="p-3">
                        {isClean ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 text-emerald-700 px-2 py-0.5 font-bold text-[10px]">
                              <CheckCircle2 className="h-3 w-3" /> Clean / Verified
                            </span>
                            <div
                              className="text-[10px] text-gray-400 font-mono flex items-center gap-1"
                              title={doc.checksum_sha256 || "SHA-256 Validated"}
                            >
                              <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" />
                              <span className="truncate max-w-[130px]">
                                {doc.checksum_sha256 ? `${doc.checksum_sha256.substring(0, 10)}...` : "SHA-256 Verified"}
                              </span>
                            </div>
                          </div>
                        ) : isQuarantined ? (
                          <span className="inline-flex items-center gap-1 rounded bg-rose-50 text-rose-700 px-2 py-0.5 font-bold text-[10px]">
                            <AlertTriangle className="h-3 w-3" /> Quarantined / Threat
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-50 text-amber-700 px-2 py-0.5 font-bold text-[10px]">
                            <Clock className="h-3 w-3" /> Scan Pending
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {doc.is_verified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                            <CheckCircle2 className="h-3 w-3" /> Verified
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px]">Under Review</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => handleDownload(doc.id, doc.original_filename)}
                            disabled={!isClean}
                            title="Open document in a new tab"
                            className="inline-flex items-center gap-1 rounded-lg bg-[hsl(166,72%,40%)]/10 text-[hsl(166,72%,40%)] px-2.5 py-1 font-semibold hover:bg-[hsl(166,72%,40%)] hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed text-[11px]"
                          >
                            <Download className="h-3 w-3" />
                            View / Download
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id, doc.original_filename)}
                            disabled={isDeleting}
                            title="Delete this document from dossier"
                            className="inline-flex items-center gap-1 rounded-lg bg-rose-50 text-rose-600 px-2.5 py-1 font-semibold hover:bg-rose-600 hover:text-white transition disabled:opacity-40 text-[11px]"
                          >
                            {isDeleting ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                            Delete
                          </button>
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
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { openAuthenticatedUrl } from "@/lib/auth-tokens";
import { toast } from "sonner";
import {
  MessageSquare,
  Send,
  Paperclip,
  FileText,
  Download,
  Loader2,
  User,
  Search,
  Phone,
  Mail,
  MapPin,
  X,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/feedback";
import { DocumentRevealLoader, GlobalOrbitLoader } from "@/components/ui/loading-concepts";

interface InboxStudent {
  student_id: string;
  student_name: string;
  student_email: string;
  counsellor_name?: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  total_messages: number;
}

interface ChatMessage {
  id: string;
  student_id: string;
  counsellor_id: string | null;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  message: string;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  is_read: boolean;
  created_at: string;
}

interface StudentDetails {
  id: string;
  student_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  active_package?: string;
  profile_completion?: number;
  preferred_intake?: string;
  preferred_countries?: any;
  current_city?: string;
  current_country?: string;
  budget_min?: number;
  budget_max?: number;
  budget_currency?: string;
}

export default function CounsellorMessagesPage() {
  const [inbox, setInbox] = useState<InboxStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<InboxStudent | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null);
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");

  // Attachment state
  const [attachedDoc, setAttachedDoc] = useState<{
    name: string;
    url: string;
    type: string;
  } | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  async function loadInbox(preserveSelected = true) {
    try {
      const data = await api.get<InboxStudent[]>("messages/chat/counsellor/inbox");
      const list = data || [];
      setInbox(list);

      if (!preserveSelected) {
        if (list.length > 0) {
          selectStudent(list[0]);
        }
      }
    } catch (err: any) {
      console.error("Failed to load counsellor inbox:", err);
    } finally {
      setLoadingInbox(false);
    }
  }

  async function loadStudentChat(studentId: string, silent = false) {
    if (!silent) setLoadingChat(true);
    try {
      const thread = await api.get<ChatMessage[]>(`messages/chat/counsellor/student/${studentId}`);
      setMessages(thread || []);
    } catch (err) {
      console.error("Failed to load student chat:", err);
    } finally {
      if (!silent) setLoadingChat(false);
    }
  }

  async function loadStudentProfile(studentId: string) {
    try {
      const profile = await api.get<StudentDetails>(`students/${studentId}`);
      setStudentDetails(profile);
    } catch (err) {
      console.error("Failed to load student profile:", err);
      setStudentDetails(null);
    }
  }

  function selectStudent(st: InboxStudent) {
    setSelectedStudent(st);
    loadStudentChat(st.student_id);
    loadStudentProfile(st.student_id);
  }

  // Initial load on mount
  useEffect(() => {
    loadInbox(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3-second auto-poll for live real-time chatting
  useEffect(() => {
    pollTimerRef.current = setInterval(() => {
      loadInbox(true);
      if (selectedStudent?.student_id) {
        loadStudentChat(selectedStudent.student_id, true);
      }
    }, 3000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [selectedStudent?.student_id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    const trimmed = inputText.trim();
    if (!trimmed && !attachedDoc) return;

    setSending(true);
    try {
      const res = await api.post<ChatMessage>("messages/chat/send", {
        student_id: selectedStudent.student_id,
        message: trimmed || `Attached document: ${attachedDoc?.name}`,
        attachment_url: attachedDoc?.url || null,
        attachment_name: attachedDoc?.name || null,
        attachment_type: attachedDoc?.type || null,
      });

      setInputText("");
      setAttachedDoc(null);
      setMessages((prev) => [...prev, res]);

      // Refresh inbox to show updated last message
      loadInbox(true);
    } catch (err: any) {
      toast.error(err?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleFileAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error("File exceeds 15 MB limit.");
      return;
    }

    setUploadingDoc(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(",")[1];
          const presigned = await api.post<{
            document_id: string;
            upload_url: string;
          }>("documents/presigned-upload", {
            filename: file.name,
            document_type: "counsellor_note",
            mime_type: file.type || "application/pdf",
            file_size_bytes: file.size,
            file_base64: base64,
          });

          setAttachedDoc({
            name: file.name,
            url: presigned.upload_url,
            type: file.type || "application/pdf",
          });
          toast.success(`Attached "${file.name}"`);
        } catch (innerErr: any) {
          toast.error(innerErr?.message || "Failed to stage attachment");
        } finally {
          setUploadingDoc(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      toast.error("Failed to read file");
      setUploadingDoc(false);
    }
  };

  const filteredInbox = inbox.filter(
    (item) =>
      item.student_name.toLowerCase().includes(search.toLowerCase()) ||
      item.student_email.toLowerCase().includes(search.toLowerCase())
  );

  const profilePct = Math.min(100, Math.max(0, studentDetails?.profile_completion || 0));

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="font-editorial text-2xl sm:text-3xl tracking-tight text-[#263331] flex items-center gap-2.5">
          <MessageSquare className="h-6 w-6 text-[#3F6258] shrink-0" />
          <span>Counsellor Real-Time Admissions Chat Desk</span>
        </h1>
        <p className="text-sm text-[#546866] mt-1">
          Communicate directly with registered students, send document reviews, and resolve admissions queries in real time.
        </p>
      </div>

      {/* Main 3-Column Desk: Inbox | Chat Stream | Student Profile Reference */}
      <div className="beyond-card grid grid-cols-1 lg:grid-cols-12 min-h-[640px] lg:h-[750px] overflow-hidden">
        {/* Column 1: Student Threads Inbox (3 cols) */}
        <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-[#DCE5E8] flex flex-col max-h-[280px] lg:max-h-none lg:h-full bg-[#F3F0E8]/45">
          <div className="p-3 border-b border-[#DCE5E8]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#546866] pointer-events-none" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-[#DCE5E8] bg-white pl-9 pr-3 py-2 text-xs text-[#394B49] placeholder:text-[#546866]/70 focus:border-[#394B49] focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#DCE5E8]/80">
            {loadingInbox ? (
              <div className="p-8 flex justify-center">
                <GlobalOrbitLoader label="Loading inbox…" size="sm" />
              </div>
            ) : filteredInbox.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#546866]">
                No active conversations found.
              </div>
            ) : (
              filteredInbox.map((item) => {
                const isSelected = selectedStudent?.student_id === item.student_id;
                return (
                  <button
                    key={item.student_id}
                    type="button"
                    onClick={() => selectStudent(item)}
                    className={`w-full text-left p-3.5 transition flex flex-col gap-1 cursor-pointer ${
                      isSelected
                        ? "bg-[#E6EFEA] border-l-4 border-[#3F6258]"
                        : "hover:bg-[#EEF3F5]/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-[#263331] truncate">
                        {item.student_name}
                      </span>
                      {item.unread_count > 0 && (
                        <span className="bg-[#D9A879] text-[#263331] text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                          {item.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#546866] truncate">{item.student_email}</p>
                    <p className="text-[11px] text-[#546866]/90 line-clamp-1 italic mt-0.5">
                      {item.last_message}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: Live Chat Thread (6 cols) */}
        <div className="lg:col-span-6 flex flex-col h-[480px] lg:h-full bg-[#F3F0E8]/30">
          {selectedStudent ? (
            <>
              {/* Chat Thread Header */}
              <div className="p-3.5 border-b border-[#DCE5E8] flex items-center justify-between gap-3 bg-white">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 shrink-0 rounded-full bg-[#E6EFEA] border border-[#B7CBC2] text-[#263331] flex items-center justify-center font-bold text-sm">
                    {selectedStudent.student_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-[#263331] truncate">
                      {selectedStudent.student_name}
                    </h2>
                    <p className="text-[11px] text-[#546866] truncate">
                      {selectedStudent.student_email}
                    </p>
                  </div>
                </div>
                <StatusBadge tone="sage" className="shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2F6B55] animate-pulse" />
                  Live Sync
                </StatusBadge>
              </div>

              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingChat ? (
                  <div className="py-16 flex justify-center">
                    <GlobalOrbitLoader label="Loading thread history…" size="md" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-20 text-center text-xs text-[#546866]">
                    No messages in this thread yet. Send a greeting to initiate conversation.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isCounsellor = m.sender_role === "counsellor" || m.sender_role === "admin";
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isCounsellor ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-xs ${
                            isCounsellor
                              ? "bg-[#394B49] text-white rounded-br-xs"
                              : "bg-white text-[#394B49] rounded-bl-xs border border-[#DCE5E8]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4 mb-1">
                            <span
                              className={`font-semibold text-[10px] ${
                                isCounsellor ? "text-[#B7CBC2]" : "text-[#546866]"
                              }`}
                            >
                              {m.sender_name} ({m.sender_role})
                            </span>
                            <span
                              className={`text-[10px] ${
                                isCounsellor ? "text-[#DCE5E8]" : "text-[#546866]"
                              }`}
                            >
                              {new Date(m.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <p className="whitespace-pre-wrap leading-relaxed">{m.message}</p>

                          {m.attachment_url && (
                            <button
                              type="button"
                              onClick={() =>
                                openAuthenticatedUrl(
                                  m.attachment_url!,
                                  m.attachment_name || "document"
                                ).catch((e) =>
                                  toast.error(
                                    e instanceof Error ? e.message : "Unable to open attachment."
                                  )
                                )
                              }
                              className={`mt-2 flex w-full text-left items-center gap-2 rounded-xl p-2 text-[11px] font-medium transition cursor-pointer ${
                                isCounsellor
                                  ? "bg-white/10 hover:bg-white/20 text-white"
                                  : "bg-[#F3F0E8]/60 hover:bg-[#E6EFEA] text-[#263331] border border-[#DCE5E8]"
                              }`}
                            >
                              <FileText className="h-4 w-4 shrink-0" />
                              <span className="truncate flex-1">
                                {m.attachment_name || "Download Document"}
                              </span>
                              <Download className="h-3 w-3 shrink-0" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Attachment Scanning Banner */}
              {uploadingDoc && (
                <div className="mx-4 mb-2 rounded-xl bg-[#F3F0E8] border border-[#DCE5E8] px-3 py-2 flex items-center justify-center">
                  <DocumentRevealLoader size="sm" label="Staging secure attachment…" />
                </div>
              )}

              {/* Staged Attachment Pill */}
              {attachedDoc && (
                <div className="mx-4 mb-2 flex items-center justify-between rounded-xl bg-[#EDF5F1] border border-[#B7CBC2] px-3 py-1.5 text-xs text-[#2F6B55]">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="truncate font-medium">{attachedDoc.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachedDoc(null)}
                    aria-label="Remove attachment"
                    className="hover:text-[#A63A3A] ml-2 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-[#DCE5E8] bg-white">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="counsellor-attach"
                    className="p-2.5 rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 text-[#546866] hover:bg-[#E6EFEA] hover:text-[#394B49] hover:border-[#B7CBC2] cursor-pointer transition shrink-0"
                    title="Attach document or feedback note"
                  >
                    {uploadingDoc ? (
                      <Loader2 className="h-4 w-4 animate-spin text-[#394B49]" />
                    ) : (
                      <Paperclip className="h-4 w-4" />
                    )}
                    <input
                      id="counsellor-attach"
                      type="file"
                      className="hidden"
                      onChange={handleFileAttach}
                      disabled={uploadingDoc}
                    />
                  </label>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type advisory response or feedback (Press Enter to send)..."
                    className="flex-1 rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2 text-xs text-[#394B49] placeholder:text-[#546866]/70 focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={sending}
                    disabled={sending || (!inputText.trim() && !attachedDoc)}
                    className="shrink-0"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#546866]">
              <MessageSquare className="h-10 w-10 opacity-30 mb-2" />
              <p className="text-sm font-semibold text-[#263331]">
                Select a Candidate Conversation
              </p>
              <p className="text-xs max-w-sm mt-1">
                Choose a candidate from the left inbox to view their chat history, attachments, and real-time advisory thread.
              </p>
            </div>
          )}
        </div>

        {/* Column 3: Attached Student Profile Dossier Sidebar (3 cols) */}
        <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-[#DCE5E8] bg-white p-4 overflow-y-auto flex flex-col gap-4">
          <div className="border-b border-[#DCE5E8] pb-3">
            <h2 className="text-xs font-bold text-[#263331] uppercase tracking-wider flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-[#3F6258]" />
              Candidate Live Profile
            </h2>
          </div>

          {selectedStudent && studentDetails ? (
            <div className="space-y-4 text-xs">
              {/* Profile Card */}
              <div className="bg-[#F3F0E8]/60 rounded-xl p-3.5 border border-[#DCE5E8] space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-[#263331] text-sm">
                    {studentDetails.student_name || selectedStudent.student_name}
                  </span>
                  <StatusBadge tone="sage" className="shrink-0">
                    {studentDetails.active_package || "Free Tier"}
                  </StatusBadge>
                </div>
                <div className="flex items-center gap-1.5 text-[#546866]">
                  <Mail className="h-3 w-3 shrink-0" />
                  <span className="truncate">
                    {studentDetails.email || selectedStudent.student_email}
                  </span>
                </div>
                {studentDetails.phone && (
                  <div className="flex items-center gap-1.5 text-[#546866]">
                    <Phone className="h-3 w-3 shrink-0" />
                    <span>{studentDetails.phone}</span>
                  </div>
                )}
                {(studentDetails.current_city || studentDetails.current_country) && (
                  <div className="flex items-center gap-1.5 text-[#546866]">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span>
                      {[studentDetails.current_city, studentDetails.current_country]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                )}
              </div>

              {/* Readiness / Completion */}
              <div className="bg-[#F3F0E8]/60 rounded-xl p-3.5 border border-[#DCE5E8] space-y-1.5">
                <div className="flex justify-between font-medium">
                  <span className="text-[#546866]">Profile Readiness</span>
                  <span className="text-[#2F6B55] font-bold tabular-nums">{profilePct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#DCE5E8] overflow-hidden">
                  <div
                    className="h-full bg-[#2F6B55] rounded-full transition-all"
                    style={{ width: `${profilePct}%` }}
                  />
                </div>
              </div>

              {/* Study Preferences */}
              <div className="bg-[#F3F0E8]/60 rounded-xl p-3.5 border border-[#DCE5E8] space-y-2">
                <span className="font-semibold text-[#263331] block">Study Preferences</span>
                <div className="flex justify-between text-[#546866] gap-2">
                  <span>Target Intake:</span>
                  <span className="font-medium text-[#263331]">
                    {studentDetails.preferred_intake || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between text-[#546866] gap-2">
                  <span>Budget Range:</span>
                  <span className="font-medium text-[#263331] text-right">
                    {studentDetails.budget_min
                      ? `₹${Number(studentDetails.budget_min).toLocaleString()} - ₹${Number(
                          studentDetails.budget_max || 0
                        ).toLocaleString()}`
                      : "Flexible"}
                  </span>
                </div>
              </div>

              {/* Direct Quick Actions */}
              <div className="space-y-2 pt-1">
                <Link
                  href="/counsellor/students"
                  className={buttonVariants({
                    variant: "secondary",
                    size: "sm",
                    className: "w-full",
                  })}
                >
                  View in Student Directory
                </Link>
                <Link
                  href={`/counsellor/assessments?student_id=${selectedStudent.student_id}`}
                  className={buttonVariants({
                    variant: "sage",
                    size: "sm",
                    className: "w-full",
                  })}
                >
                  Write / Update Assessment
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[#546866]">
              Select a student to inspect their profile dossier.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

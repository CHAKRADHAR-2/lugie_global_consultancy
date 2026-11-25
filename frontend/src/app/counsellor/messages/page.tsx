"use client";

import { useEffect, useRef, useState } from "react";
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
  CheckCheck,
  User,
  Clock,
  Search,
  Building2,
  GraduationCap,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  X,
} from "lucide-react";

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

  // Load Inbox on mount
  async function loadInbox(preserveSelected = true) {
    try {
      const data = await api.get<InboxStudent[]>("messages/chat/counsellor/inbox");
      const list = data || [];
      setInbox(list);

      if (!preserveSelected || !selectedStudent) {
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

  useEffect(() => {
    loadInbox(false);

    // 3-second auto-poll for live real-time chatting
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

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          Counsellor Real-Time Admissions Chat Desk
        </h1>
        <p className="text-sm text-muted-foreground">
          Communicate directly with registered students, send document reviews, and resolve admissions queries in real time.
        </p>
      </div>

      {/* Main 3-Column Desk: Inbox | Chat Stream | Student Profile Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[750px] bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Column 1: Student Threads Inbox (3 cols) */}
        <div className="lg:col-span-3 border-r border-border flex flex-col h-full bg-muted/10">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-background pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {loadingInbox ? (
              <div className="p-8 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Loading inbox...</p>
              </div>
            ) : filteredInbox.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No active conversations found.
              </div>
            ) : (
              filteredInbox.map((item) => {
                const isSelected = selectedStudent?.student_id === item.student_id;
                return (
                  <button
                    key={item.student_id}
                    onClick={() => selectStudent(item)}
                    className={`w-full text-left p-3.5 transition flex flex-col gap-1 ${
                      isSelected
                        ? "bg-primary/10 border-l-4 border-primary"
                        : "hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-foreground truncate max-w-[170px]">
                        {item.student_name}
                      </span>
                      {item.unread_count > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {item.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{item.student_email}</p>
                    <p className="text-[11px] text-muted-foreground/80 line-clamp-1 italic mt-0.5">
                      {item.last_message}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: Live Chat Thread (6 cols) */}
        <div className="lg:col-span-6 flex flex-col h-full bg-background">
          {selectedStudent ? (
            <>
              {/* Chat Thread Header */}
              <div className="p-3.5 border-b border-border flex items-center justify-between bg-card">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {selectedStudent.student_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      {selectedStudent.student_name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      {selectedStudent.student_email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Sync
                  </span>
                </div>
              </div>

              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingChat ? (
                  <div className="py-20 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Loading thread history...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-20 text-center text-xs text-muted-foreground">
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
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                            isCounsellor
                              ? "bg-[hsl(215,50%,15%)] text-white rounded-br-none"
                              : "bg-muted text-foreground rounded-bl-none border border-border"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4 mb-1">
                            <span className="font-semibold text-[10px] opacity-80">
                              {m.sender_name} ({m.sender_role})
                            </span>
                            <span className="text-[10px] opacity-60">
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
                                openAuthenticatedUrl(m.attachment_url!, m.attachment_name || "document").catch((e) =>
                                  toast.error(e instanceof Error ? e.message : "Unable to open attachment.")
                                )
                              }
                              className={`mt-2 flex w-full text-left items-center gap-2 rounded-xl p-2 text-[11px] font-medium transition ${
                                isCounsellor
                                  ? "bg-white/10 hover:bg-white/20 text-white"
                                  : "bg-background hover:bg-muted text-primary border border-border"
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

              {/* Staged Attachment Pill */}
              {attachedDoc && (
                <div className="mx-4 mb-2 flex items-center justify-between rounded-xl bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs text-primary">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="truncate">{attachedDoc.name}</span>
                  </div>
                  <button
                    onClick={() => setAttachedDoc(null)}
                    className="hover:text-rose-500 ml-2"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-card">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="counsellor-attach"
                    className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition"
                    title="Attach document or feedback note"
                  >
                    {uploadingDoc ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <Paperclip className="h-5 w-5" />
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
                    className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />

                  <button
                    type="submit"
                    disabled={sending || (!inputText.trim() && !attachedDoc)}
                    className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <MessageSquare className="h-10 w-10 opacity-30 mb-2" />
              <p className="text-sm font-semibold text-foreground">Select a Candidate Conversation</p>
              <p className="text-xs max-w-sm mt-1">
                Choose a candidate from the left inbox to view their chat history, attachments, and real-time advisory thread.
              </p>
            </div>
          )}
        </div>

        {/* Column 3: Attached Student Profile Dossier Sidebar (3 cols) */}
        <div className="lg:col-span-3 border-l border-border bg-card p-4 overflow-y-auto flex flex-col gap-4">
          <div className="border-b border-border pb-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-primary" />
              Candidate Live Profile
            </h4>
          </div>

          {selectedStudent && studentDetails ? (
            <div className="space-y-4 text-xs">
              {/* Profile Card */}
              <div className="bg-muted/40 rounded-xl p-3 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-sm">
                    {studentDetails.student_name || selectedStudent.student_name}
                  </span>
                  <span className="bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-md text-[10px]">
                    {studentDetails.active_package || "Free Tier"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{studentDetails.email || selectedStudent.student_email}</span>
                </div>
                {studentDetails.phone && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{studentDetails.phone}</span>
                  </div>
                )}
                {(studentDetails.current_city || studentDetails.current_country) && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {[studentDetails.current_city, studentDetails.current_country].filter(Boolean).join(", ")}
                    </span>
                  </div>
                )}
              </div>

              {/* Readiness / Completion */}
              <div className="bg-muted/40 rounded-xl p-3 border border-border space-y-1.5">
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Profile Readiness</span>
                  <span className="text-primary font-bold">{studentDetails.profile_completion || 0}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${studentDetails.profile_completion || 0}%` }}
                  />
                </div>
              </div>

              {/* Study Preferences */}
              <div className="bg-muted/40 rounded-xl p-3 border border-border space-y-2">
                <span className="font-semibold text-foreground block">Study Preferences</span>
                <div className="flex justify-between text-muted-foreground">
                  <span>Target Intake:</span>
                  <span className="font-medium text-foreground">{studentDetails.preferred_intake || "Not set"}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Budget Range:</span>
                  <span className="font-medium text-foreground">
                    {studentDetails.budget_min
                      ? `₹${Number(studentDetails.budget_min).toLocaleString()} - ₹${Number(studentDetails.budget_max || 0).toLocaleString()}`
                      : "Flexible"}
                  </span>
                </div>
              </div>

              {/* Direct Quick Actions */}
              <div className="space-y-2 pt-2">
                <a
                  href={`/counsellor/students`}
                  className="w-full rounded-xl border border-border bg-background py-2 text-center text-xs font-semibold text-foreground hover:bg-muted block transition"
                >
                  View in Student Directory
                </a>
                <a
                  href={`/counsellor/assessments`}
                  className="w-full rounded-xl bg-primary/10 border border-primary/20 py-2 text-center text-xs font-semibold text-primary hover:bg-primary/20 block transition"
                >
                  Write / Update Assessment
                </a>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-muted-foreground">
              Select a student to inspect their profile dossier.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

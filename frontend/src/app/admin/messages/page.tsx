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
  ShieldAlert,
  User,
  Clock,
  Search,
  CheckCircle2,
  Sparkles,
  Phone,
  Mail,
  Filter,
  Eye,
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

export default function AdminMessagesPage() {
  const [inbox, setInbox] = useState<InboxStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<InboxStudent | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

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
      console.error("Failed to load admin chat inbox:", err);
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

  function selectStudent(st: InboxStudent) {
    setSelectedStudent(st);
    loadStudentChat(st.student_id);
  }

  useEffect(() => {
    loadInbox(false);

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
    if (!selectedStudent || !inputText.trim()) return;

    setSending(true);
    try {
      const res = await api.post<ChatMessage>("messages/chat/send", {
        student_id: selectedStudent.student_id,
        message: `[ADMIN BROADCAST]: ${inputText.trim()}`,
      });

      setInputText("");
      setMessages((prev) => [...prev, res]);
      loadInbox(true);
      toast.success("Supervisory message dispatched!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to dispatch message");
    } finally {
      setSending(false);
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
          Admin Advisory Chat & Real-Time Supervision Desk
        </h1>
        <p className="text-sm text-muted-foreground">
          Administrative oversight of all candidate-counsellor communication threads, audit logs, and compliance records.
        </p>
      </div>

      {/* Main 2-Column Desk: Student Conversations List | Live Conversation Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[750px] bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Column 1: Conversations List (4 cols) */}
        <div className="lg:col-span-4 border-r border-border flex flex-col h-full bg-muted/10">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search candidate or email..."
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
                <p className="text-xs text-muted-foreground">Loading supervisory streams...</p>
              </div>
            ) : filteredInbox.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No active conversations recorded.
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
                      <span className="font-semibold text-xs text-foreground truncate max-w-[200px]">
                        {item.student_name}
                      </span>
                      <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                        {item.total_messages} msgs
                      </span>
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

        {/* Column 2: Live Conversation Stream & Supervisory Interventions (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-full bg-background">
          {selectedStudent ? (
            <>
              {/* Thread Header */}
              <div className="p-3.5 border-b border-border flex items-center justify-between bg-card">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {selectedStudent.student_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground">
                        {selectedStudent.student_name}
                      </h3>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Admin Monitor Mode
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {selectedStudent.student_email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`/admin/students`}
                    className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    <User className="h-3.5 w-3.5" />
                    Student Profile
                  </a>
                </div>
              </div>

              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingChat ? (
                  <div className="py-20 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Loading conversation transcript...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-20 text-center text-xs text-muted-foreground">
                    No communication history in this thread.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isStaff = m.sender_role === "counsellor" || m.sender_role === "admin";
                    const isAdmin = m.sender_role === "admin";
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isStaff ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                            isAdmin
                              ? "bg-amber-600 text-white rounded-br-none"
                              : isStaff
                              ? "bg-[hsl(215,50%,15%)] text-white rounded-br-none"
                              : "bg-muted text-foreground rounded-bl-none border border-border"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4 mb-1">
                            <span className="font-semibold text-[10px] opacity-80">
                              {m.sender_name} ({m.sender_role.toUpperCase()})
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
                                isStaff
                                  ? "bg-white/10 hover:bg-white/20 text-white"
                                  : "bg-background hover:bg-muted text-primary border border-border"
                              }`}
                            >
                              <FileText className="h-4 w-4 shrink-0" />
                              <span className="truncate flex-1">
                                {m.attachment_name || "View Document"}
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

              {/* Admin Supervisory Reply Bar */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-card">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Broadcast an administrative directive or reply to this thread..."
                    className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="submit"
                    disabled={sending || !inputText.trim()}
                    className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Send Directive
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <MessageSquare className="h-10 w-10 opacity-30 mb-2" />
              <p className="text-sm font-semibold text-foreground">Select a Student Conversation</p>
              <p className="text-xs max-w-sm mt-1">
                Choose a candidate from the left list to review real-time correspondence between students and counsellors.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

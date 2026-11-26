"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { openAuthenticatedUrl } from "@/lib/auth-tokens";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/feedback";
import { GlobalOrbitLoader } from "@/components/ui/loading-concepts";
import { SkeletonRow } from "@/components/ui/skeleton";
import {
  MessageSquare,
  Send,
  FileText,
  Download,
  User,
  Search,
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
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8E572C]">
            Communication Oversight
          </span>
          <h1 className="font-editorial text-2xl sm:text-3xl tracking-tight text-[#263331] mt-0.5">
            Advisory Chat &amp; Supervision Desk
          </h1>
          <p className="text-sm text-[#546866] mt-1">
            Administrative oversight of all candidate-counsellor communication threads, audit logs, and compliance records.
          </p>
        </div>
        <StatusBadge tone="warm" className="self-start sm:self-center">
          Admin Monitor Mode
        </StatusBadge>
      </div>

      {/* Main 2-Column Desk */}
      <div className="beyond-card grid grid-cols-1 lg:grid-cols-12 h-[740px] overflow-hidden">
        {/* Column 1: Conversations List (4 cols) */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-[#DCE5E8] flex flex-col h-full bg-[#F3F0E8]/45">
          <div className="p-3.5 border-b border-[#DCE5E8] bg-white/70">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#546866]" />
              <input
                type="text"
                placeholder="Search candidate or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 pl-9 pr-3 py-2 text-xs text-[#394B49] placeholder:text-[#546866]/70 focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#DCE5E8]/80">
            {loadingInbox ? (
              <div className="p-4 space-y-2">
                <SkeletonRow cols={2} />
                <SkeletonRow cols={2} />
                <SkeletonRow cols={2} />
              </div>
            ) : filteredInbox.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#546866]">
                No active conversations recorded.
              </div>
            ) : (
              filteredInbox.map((item) => {
                const isSelected = selectedStudent?.student_id === item.student_id;
                return (
                  <button
                    type="button"
                    key={item.student_id}
                    onClick={() => selectStudent(item)}
                    className={`w-full text-left p-3.5 transition-colors flex flex-col gap-1 cursor-pointer ${
                      isSelected
                        ? "bg-[#E6EFEA]/75 border-l-4 border-[#394B49]"
                        : "hover:bg-[#EEF3F5]/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-[#263331] truncate">
                        {item.student_name}
                      </span>
                      <span className="text-[10px] font-medium bg-white border border-[#DCE5E8] px-2 py-0.5 rounded-full text-[#546866] shrink-0">
                        {item.total_messages} msgs
                      </span>
                    </div>
                    <p className="text-[11px] text-[#546866] truncate">{item.student_email}</p>
                    <p className="text-[11px] text-[#546866]/85 line-clamp-1 italic mt-0.5">
                      {item.last_message}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: Live Conversation Stream (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-full bg-[#F3F0E8]/25">
          {selectedStudent ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-[#DCE5E8] flex flex-wrap items-center justify-between gap-3 bg-white">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-[#394B49] text-white flex items-center justify-center font-semibold text-sm">
                    {selectedStudent.student_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-[#263331] truncate">
                        {selectedStudent.student_name}
                      </h3>
                      <StatusBadge tone="warm" className="text-[10px]">
                        Admin Monitor Mode
                      </StatusBadge>
                    </div>
                    <p className="text-[11px] text-[#546866] truncate">
                      {selectedStudent.student_email}
                    </p>
                  </div>
                </div>
                <Link
                  href="/admin/students"
                  className={buttonVariants({ variant: "secondary", size: "sm" })}
                >
                  <User className="h-3.5 w-3.5" />
                  Student Profile
                </Link>
              </div>

              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
                {loadingChat ? (
                  <div className="py-16">
                    <GlobalOrbitLoader label="Loading conversation transcript…" size="md" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-20 text-center text-xs text-[#546866]">
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
                          className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs shadow-xs border ${
                            isAdmin
                              ? "bg-[#394B49] text-white border-[#263331] rounded-br-none"
                              : isStaff
                              ? "bg-[#E6EFEA] text-[#263331] border-[#B7CBC2] rounded-br-none"
                              : "bg-white text-[#394B49] border-[#DCE5E8] rounded-bl-none"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4 mb-1">
                            <span
                              className={`font-semibold text-[10px] ${
                                isAdmin ? "text-[#D9A879]" : "text-[#546866]"
                              }`}
                            >
                              {m.sender_name} ({m.sender_role.toUpperCase()})
                            </span>
                            <span
                              className={`text-[10px] ${
                                isAdmin ? "text-[#DCE5E8]" : "text-[#546866]"
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
                                isAdmin
                                  ? "bg-white/10 hover:bg-white/20 text-white"
                                  : "bg-[#F3F0E8]/75 hover:bg-[#EAE5D9] text-[#394B49] border border-[#DCE5E8]"
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
              <form onSubmit={handleSendMessage} className="p-3.5 border-t border-[#DCE5E8] bg-white">
                <div className="flex items-center gap-2.5">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Broadcast an administrative directive or reply to this thread..."
                    className="flex-1 rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] placeholder:text-[#546866]/70 focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={!inputText.trim()}
                    loading={sending}
                    loadingText="Sending…"
                  >
                    <Send className="h-4 w-4" />
                    Send Directive
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <MessageSquare className="h-10 w-10 text-[#546866]/45 mb-3" />
              <p className="text-sm font-semibold text-[#263331]">
                Select a Student Conversation
              </p>
              <p className="text-xs text-[#546866] max-w-sm mt-1">
                Choose a candidate from the left list to review real-time correspondence between students and counsellors.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

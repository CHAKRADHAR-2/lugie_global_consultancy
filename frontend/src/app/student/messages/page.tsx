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
  ShieldCheck,
  User,
  Clock,
  Bell,
  Check,
  X,
  FileBadge,
  Sparkles,
} from "lucide-react";

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

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

export default function StudentMessagesPage() {
  const [activeTab, setActiveTab] = useState<"chat" | "notifications">("chat");

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingChat, setLoadingChat] = useState(true);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);

  // Attachment State
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachedDocInfo, setAttachedDocInfo] = useState<{
    url: string;
    name: string;
    type: string;
  } | null>(null);

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadChatThread();
    loadNotifications();

    // Auto-poll messages every 3 seconds for real-time live chat feel
    pollTimerRef.current = setInterval(() => {
      refreshChatSilently();
    }, 3000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom whenever messages update
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadChatThread() {
    try {
      const data = await api.get<ChatMessage[]>("messages/chat/thread");
      setMessages(data || []);
    } catch (err) {
      console.error("Failed to load chat thread:", err);
    } finally {
      setLoadingChat(false);
    }
  }

  async function refreshChatSilently() {
    try {
      const data = await api.get<ChatMessage[]>("messages/chat/thread");
      if (data && data.length > 0) {
        setMessages((prev) => {
          if (data.length !== prev.length || data[data.length - 1]?.id !== prev[prev.length - 1]?.id) {
            return data;
          }
          return prev;
        });
      }
    } catch {
      // Silent poll fail
    }
  }

  async function loadNotifications() {
    setLoadingNotifs(true);
    try {
      const data = await api.get<NotificationItem[]>("notifications/me");
      setNotifications(data || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoadingNotifs(false);
    }
  }

  // Handle uploading an attachment directly from the chat desk
  const handleAttachmentSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 15 * 1024 * 1024) {
        toast.error("File size cannot exceed 15MB.");
        return;
      }

      setAttachedFile(file);
      setUploadingAttachment(true);
      try {
        // Read file base64
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const res = reader.result as string;
            resolve(res.includes(",") ? res.split(",")[1] : res);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Upload through secure document scanner
        const presigned = await api.post<{
          document_id: string;
          upload_url: string;
          s3_key: string;
        }>("documents/presigned-upload", {
          filename: file.name,
          document_type: "Chat Attachment / Shared Material",
          mime_type: file.type || "application/pdf",
          file_size_bytes: file.size,
          file_base64: base64Data,
        });

        await api.post("documents/confirm-upload", {
          document_id: presigned.document_id,
        });

        setAttachedDocInfo({
          url: `/api/proxy/documents/${presigned.document_id}/file`,
          name: file.name,
          type: file.type || "application/pdf",
        });
        toast.success(`Attached "${file.name}" (verified by security scan)`);
      } catch (err: any) {
        toast.error(err.message || "Failed to attach document.");
        setAttachedFile(null);
      } finally {
        setUploadingAttachment(false);
      }
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text && !attachedDocInfo) return;

    setSending(true);
    try {
      const payload: any = {
        message: text || `Shared document: ${attachedDocInfo?.name}`,
      };
      if (attachedDocInfo) {
        payload.attachment_url = attachedDocInfo.url;
        payload.attachment_name = attachedDocInfo.name;
        payload.attachment_type = attachedDocInfo.type;
      }

      const newMsg = await api.post<ChatMessage>("messages/chat/send", payload);
      setMessages((prev) => [...prev, newMsg]);
      setInputText("");
      setAttachedFile(null);
      setAttachedDocInfo(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to deliver message.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendPrompt = (promptText: string) => {
    setInputText(promptText);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post("notifications/mark-all-read");
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
      toast.success("All system broadcasts marked as read.");
    } catch (err) {
      toast.error("Failed to mark all as read.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(215,50%,12%)] flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-[hsl(174,85%,32%)]" />
            Admissions Desk & Direct Messages
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Real-time chat with your assigned Senior Counsellor, document sharing, and system announcements.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl self-start">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "chat"
                ? "bg-white text-[hsl(174,85%,32%)] shadow-xs"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Live Counsellor Chat
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "notifications"
                ? "bg-white text-[hsl(174,85%,32%)] shadow-xs"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Bell className="h-3.5 w-3.5" />
            System Broadcasts
            {notifications.filter((n) => !n.is_read).length > 0 && (
              <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" />
            )}
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* VIEW 1: Live Counsellor Chat Box                                    */}
      {/* =================================================================== */}
      {activeTab === "chat" && (
        <div className="rounded-3xl border border-gray-200/80 bg-white shadow-sm overflow-hidden flex flex-col h-[700px]">
          {/* Chat Room Header */}
          <div className="px-6 py-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-[hsl(174,85%,32%)]/10 text-[hsl(174,85%,32%)] font-extrabold flex items-center justify-center text-sm border border-[hsl(174,85%,32%)]/20">
                  SC
                </div>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[hsl(215,50%,12%)]">
                    Priya Sharma &bull; Senior Admissions Counsellor
                  </h3>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    Online &bull; Real-Time
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Lugie Global Consultancy Overseas Advisory Desk &bull; Supervised by Lead Admin
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
              <ShieldCheck className="h-4 w-4 text-[hsl(174,85%,32%)]" />
              <span>End-to-End Logged & Verified</span>
            </div>
          </div>

          {/* Messages Stream Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-50/40 to-white">
            {loadingChat ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[hsl(174,85%,32%)]" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center p-8">
                <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
                <h4 className="text-sm font-bold text-gray-800">Your Conversation Starts Here</h4>
                <p className="text-xs text-gray-500 max-w-sm mt-1">
                  Type your first question below or share your Statement of Purpose (SOP) draft for review.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isStudent = msg.sender_role === "student";

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isStudent ? "justify-end" : "justify-start"}`}
                  >
                    {!isStudent && (
                      <div className="h-8 w-8 rounded-full bg-[hsl(174,85%,32%)]/15 text-[hsl(174,85%,32%)] font-bold flex items-center justify-center text-xs shrink-0 mt-1">
                        SC
                      </div>
                    )}

                    <div
                      className={`max-w-[78%] sm:max-w-md rounded-2xl p-4 text-xs leading-relaxed shadow-xs ${
                        isStudent
                          ? "bg-[hsl(174,85%,32%)] text-white rounded-tr-xs"
                          : "bg-white text-gray-800 border border-gray-200/80 rounded-tl-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1 text-[10px]">
                        <span
                          className={`font-semibold ${
                            isStudent ? "text-teal-100" : "text-gray-500"
                          }`}
                        >
                          {isStudent ? "You" : msg.sender_name || "Admissions Counsellor"}
                        </span>
                        <span className={isStudent ? "text-teal-200" : "text-gray-400"}>
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Message Content */}
                      <p className="whitespace-pre-wrap">{msg.message}</p>

                      {/* Attachment Pill (if shared) */}
                      {msg.attachment_url && (
                        <div
                          className={`mt-2.5 p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                            isStudent
                              ? "bg-white/10 border-white/20 text-white"
                              : "bg-slate-50 border-gray-200 text-gray-800"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText
                              className={`h-4 w-4 shrink-0 ${
                                isStudent ? "text-white" : "text-[hsl(174,85%,32%)]"
                              }`}
                            />
                            <span className="font-mono text-[11px] truncate">
                              {msg.attachment_name || "Attached_Document.pdf"}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              openAuthenticatedUrl(
                                msg.attachment_url!,
                                msg.attachment_name || "Attached_Document.pdf"
                              ).catch((e) =>
                                toast.error(e instanceof Error ? e.message : "Unable to open attachment.")
                              )
                            }
                            className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold transition ${
                              isStudent
                                ? "bg-white text-[hsl(174,85%,32%)] hover:bg-teal-50"
                                : "bg-[hsl(174,85%,32%)] text-white hover:bg-[hsl(174,85%,38%)]"
                            }`}
                          >
                            <Download className="h-3 w-3" /> View
                          </button>
                        </div>
                      )}

                      {/* Read status icon */}
                      {isStudent && (
                        <div className="flex justify-end mt-1">
                          <CheckCheck className="h-3.5 w-3.5 text-teal-200" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Guidance Chips */}
          <div className="px-6 py-2 bg-slate-50/70 border-t border-gray-100 flex items-center gap-2 overflow-x-auto text-[11px]">
            <span className="text-gray-400 font-semibold shrink-0 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" /> Quick Prompts:
            </span>
            {[
              "Can you review my SOP draft?",
              "What are the scholarship deadlines for Fall 2025?",
              "Which universities waive the GRE score?",
              "How many academic LORs do I need?",
            ].map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendPrompt(p)}
                className="shrink-0 bg-white border border-gray-200 px-2.5 py-1 rounded-full text-gray-700 hover:border-[hsl(174,85%,32%)] hover:text-[hsl(174,85%,32%)] transition"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Attachment Pending Bar */}
          {attachedDocInfo && (
            <div className="px-6 py-2 bg-emerald-50 border-t border-emerald-100 flex items-center justify-between text-xs text-emerald-800">
              <div className="flex items-center gap-2">
                <FileBadge className="h-4 w-4 text-emerald-600" />
                <span>
                  Attached file ready to send: <strong>{attachedDocInfo.name}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAttachedFile(null);
                  setAttachedDocInfo(null);
                }}
                className="text-emerald-700 hover:text-rose-600 font-bold"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Chat Input Controls */}
          <div className="p-4 bg-white border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex items-end gap-3">
              {/* Attachment Button */}
              <label
                className={`p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-[hsl(174,85%,32%)] hover:border-[hsl(174,85%,32%)] hover:bg-slate-50 transition cursor-pointer shrink-0 ${
                  uploadingAttachment ? "opacity-50 pointer-events-none" : ""
                }`}
                title="Attach PDF or Document for Counsellor"
              >
                {uploadingAttachment ? (
                  <Loader2 className="h-5 w-5 animate-spin text-[hsl(174,85%,32%)]" />
                ) : (
                  <Paperclip className="h-5 w-5" />
                )}
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.docx"
                  onChange={handleAttachmentSelect}
                  className="hidden"
                />
              </label>

              {/* Text Input */}
              <div className="flex-1 relative">
                <textarea
                  rows={2}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message or question for your counsellor (Press Enter to send)..."
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[hsl(174,85%,32%)] focus:ring-1 focus:ring-[hsl(174,85%,32%)]/20"
                />
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={sending || (!inputText.trim() && !attachedDocInfo)}
                className="h-10 px-5 rounded-xl bg-[hsl(174,85%,32%)] text-white font-bold text-xs shadow-md hover:bg-[hsl(174,85%,38%)] transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shrink-0"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* VIEW 2: System Broadcasts & Notifications Desk                      */}
      {/* =================================================================== */}
      {activeTab === "notifications" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">
              System Notifications ({notifications.length})
            </h2>
            {notifications.some((n) => !n.is_read) && (
              <button
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[hsl(174,85%,32%)] hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark All as Read
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-gray-900">You&apos;re All Caught Up</h3>
                <p className="text-xs text-gray-500 mt-1">
                  You will receive broadcast alerts here whenever an official application deadline or document review is processed.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`py-4 flex items-start justify-between gap-4 transition ${
                      !notif.is_read ? "bg-teal-50/20 -mx-6 px-6" : ""
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-gray-900">{notif.title}</h4>
                        {!notif.is_read && (
                          <span className="h-2 w-2 rounded-full bg-[hsl(174,85%,32%)] shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{notif.message}</p>
                      <span className="text-[10px] text-gray-400 block">
                        {new Date(notif.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

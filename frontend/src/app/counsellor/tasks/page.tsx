"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import {
  CheckSquare,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  User,
  Mail,
  Phone,
  Sparkles,
  ArrowRight,
  Filter,
  Flag,
} from "lucide-react";

interface CounsellorTask {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  student_phone?: string;
  student_intake?: string;
  title: string;
  description?: string;
  category: string;
  priority: string;
  status: string;
  due_date?: string;
  completed_at?: string;
  created_at: string;
}

interface StudentOption {
  id: string;
  student_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  profile_evaluation: { label: "Profile Evaluation", color: "bg-blue-50 text-blue-700 border-blue-200" },
  document_review: { label: "Transcript Audit", color: "bg-amber-50 text-amber-700 border-amber-200" },
  shortlisting: { label: "University Strategy", color: "bg-purple-50 text-purple-700 border-purple-200" },
  sop_review: { label: "SOP & LOR Review", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  visa_guidance: { label: "Visa Solvency", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const PRIORITY_BADGES: Record<string, { label: string; color: string }> = {
  urgent: { label: "Urgent", color: "bg-rose-100 text-rose-700" },
  high: { label: "High", color: "bg-amber-100 text-amber-800" },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-700" },
  low: { label: "Low", color: "bg-gray-100 text-gray-700" },
};

export default function CounsellorTasksPage() {
  const [tasks, setTasks] = useState<CounsellorTask[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  // Create Task Modal
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newStudentId, setNewStudentId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("profile_evaluation");
  const [newPriority, setNewPriority] = useState("high");
  const [newDueDays, setNewDueDays] = useState(3);

  async function loadData() {
    setLoading(true);
    try {
      const [tasksData, studentsData] = await Promise.all([
        api.get<CounsellorTask[]>("tasks"),
        api.get<StudentOption[]>("students"),
      ]);
      setTasks(tasksData || []);
      setStudents(studentsData || []);
      if (studentsData && studentsData.length > 0 && !newStudentId) {
        setNewStudentId(studentsData[0].id);
      }
    } catch (err: any) {
      console.error("Failed to load tasks:", err);
      toast.error(err?.message || "Failed to load counsellor tasks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      await api.patch(`tasks/${taskId}`, { status: newStatus });
      toast.success(`Task marked as ${newStatus.replace("_", " ")}`);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: newStatus,
                completed_at: newStatus === "completed" ? new Date().toISOString() : undefined,
              }
            : t
        )
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to update task status");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentId || !newTitle.trim()) {
      toast.error("Please fill in the task title and select a student.");
      return;
    }

    setCreating(true);
    try {
      const created = await api.post<CounsellorTask>("tasks", {
        student_id: newStudentId,
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
        category: newCategory,
        priority: newPriority,
        due_days: Number(newDueDays),
      });
      toast.success("New onboarding task created!");
      setShowModal(false);
      setNewTitle("");
      setNewDescription("");
      setTasks((prev) => [created, ...prev]);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      (t.title?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (t.student_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (t.student_email?.toLowerCase() || "").includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || t.status === filterStatus;
    const matchesPriority = filterPriority === "all" || t.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const urgentCount = tasks.filter((t) => (t.priority === "urgent" || t.priority === "high") && t.status !== "completed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" />
            Admissions Onboarding & Action Items
          </h1>
          <p className="text-sm text-muted-foreground">
            Structured milestone tasks auto-assigned upon student registration.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Create Custom Task
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total Assigned</p>
          <p className="text-2xl font-bold text-foreground mt-1">{tasks.length}</p>
        </div>
        <div className="bg-card rounded-2xl border border-amber-200 bg-amber-50/30 p-4 shadow-sm">
          <p className="text-xs font-medium text-amber-800">Pending Action</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-card rounded-2xl border border-blue-200 bg-blue-50/30 p-4 shadow-sm">
          <p className="text-xs font-medium text-blue-800">In Progress</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{inProgressCount}</p>
        </div>
        <div className="bg-card rounded-2xl border border-emerald-200 bg-emerald-50/30 p-4 shadow-sm">
          <p className="text-xs font-medium text-emerald-800">Completed Milestones</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{completedCount}</p>
        </div>
      </div>

      {/* Controls & Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by student or task title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1 bg-muted p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterStatus === "all" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterStatus === "pending" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilterStatus("in_progress")}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterStatus === "in_progress" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              In Progress ({inProgressCount})
            </button>
            <button
              onClick={() => setFilterStatus("completed")}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterStatus === "completed" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Done ({completedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading onboarding tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center shadow-sm">
          <CheckSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="font-semibold text-foreground text-base">No Tasks Match Filters</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            {search ? "No tasks found matching your search query." : "All student onboarding tasks have been processed."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((t) => {
            const cat = CATEGORY_LABELS[t.category] || { label: t.category, color: "bg-gray-50 text-gray-700" };
            const prio = PRIORITY_BADGES[t.priority] || { label: t.priority, color: "bg-gray-100 text-gray-700" };
            const isCompleted = t.status === "completed";

            return (
              <div
                key={t.id}
                className={`bg-card rounded-2xl border transition p-5 shadow-sm hover:border-primary/40 ${
                  isCompleted ? "opacity-75 bg-muted/20 border-border" : "border-border"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Task Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${cat.color}`}>
                        {cat.label}
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${prio.color}`}>
                        {prio.label}
                      </span>
                      {t.due_date && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Due: {new Date(t.due_date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      )}
                    </div>

                    <h3 className={`text-base font-semibold text-foreground ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                      {t.title}
                    </h3>

                    {t.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 max-w-3xl">
                        {t.description}
                      </p>
                    )}

                    {/* Student Info Bar */}
                    <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5 font-medium text-foreground bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10">
                        <User className="h-3.5 w-3.5 text-primary" />
                        <span>{t.student_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span>{t.student_email}</span>
                      </div>
                      {t.student_phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{t.student_phone}</span>
                        </div>
                      )}
                      {t.student_intake && (
                        <span className="text-primary font-medium">
                          Target: {t.student_intake}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                    {t.status === "pending" && (
                      <button
                        onClick={() => handleUpdateStatus(t.id, "in_progress")}
                        className="rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold px-3 py-2 transition"
                      >
                        Start Task
                      </button>
                    )}
                    {t.status !== "completed" ? (
                      <button
                        onClick={() => handleUpdateStatus(t.id, "completed")}
                        className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold px-3 py-2 transition inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Mark Done
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(t.id, "pending")}
                        className="rounded-xl border border-border text-muted-foreground hover:text-foreground text-xs font-medium px-3 py-1.5 transition"
                      >
                        Re-open
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl border border-border">
            <h3 className="text-lg font-bold text-foreground mb-1">Create Custom Action Task</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Assign a custom milestone or follow-up item to a candidate.
            </p>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Assign To Student *
                </label>
                <select
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                >
                  {students.map((s) => {
                    const name = s.student_name || `${s.first_name || ""} ${s.last_name || ""}`.trim() || s.email || "Student";
                    return (
                      <option key={s.id} value={s.id}>
                        {name} ({s.email})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Audit GRE Test Score Verification Slip"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Detailed Instructions / Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Key deliverables or actions to verify..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="profile_evaluation">Profile Evaluation</option>
                    <option value="document_review">Transcript Audit</option>
                    <option value="shortlisting">University Strategy</option>
                    <option value="sop_review">SOP / LOR Review</option>
                    <option value="visa_guidance">Visa Guidance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Due In (Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={newDueDays}
                    onChange={(e) => setNewDueDays(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                  {creating ? "Creating..." : "Save Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

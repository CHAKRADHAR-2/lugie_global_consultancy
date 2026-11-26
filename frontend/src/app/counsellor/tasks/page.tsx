"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import {
  CheckSquare,
  Search,
  Clock,
  CheckCircle2,
  Plus,
  User,
  Mail,
  Phone,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModalShell, StatusBadge } from "@/components/ui/feedback";
import { GlobalOrbitLoader } from "@/components/ui/loading-concepts";
import { SkeletonCard } from "@/components/ui/skeleton";

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

const INPUT_CLASS =
  "w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] placeholder:text-[#546866]/70 focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition";

const CATEGORY_LABELS: Record<
  string,
  { label: string; tone: "sage" | "warm" | "misty" | "success" | "warning" }
> = {
  profile_evaluation: { label: "Profile Evaluation", tone: "misty" },
  document_review: { label: "Transcript Audit", tone: "warning" },
  shortlisting: { label: "University Strategy", tone: "warm" },
  sop_review: { label: "SOP & LOR Review", tone: "sage" },
  visa_guidance: { label: "Visa Solvency", tone: "success" },
};

const PRIORITY_BADGES: Record<
  string,
  { label: string; tone: "error" | "warm" | "sage" | "misty" }
> = {
  urgent: { label: "Urgent", tone: "error" },
  high: { label: "High", tone: "warm" },
  medium: { label: "Medium", tone: "sage" },
  low: { label: "Low", tone: "misty" },
};

function getTaskStatusTone(status: string): "success" | "warm" | "warning" | "misty" {
  const s = (status || "").toLowerCase();
  if (s === "completed") return "success";
  if (s === "in_progress") return "warm";
  if (s === "pending") return "warning";
  return "misty";
}

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
      const tasksList = Array.isArray(tasksData) ? tasksData : (tasksData as any)?.items || [];
      const studentsList: StudentOption[] = Array.isArray(studentsData)
        ? studentsData
        : (studentsData as any)?.items || [];
      setTasks(tasksList);
      setStudents(studentsList);
      if (studentsList.length > 0 && !newStudentId) {
        setNewStudentId(studentsList[0].id);
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
      toast.success(`Task marked as ${newStatus.replace(/_/g, " ")}`);
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
  const urgentCount = tasks.filter(
    (t) => (t.priority === "urgent" || t.priority === "high") && t.status !== "completed"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl tracking-tight text-[#263331] flex items-center gap-2.5">
            <CheckSquare className="h-6 w-6 text-[#3F6258] shrink-0" />
            <span>Admissions Onboarding &amp; Action Items</span>
          </h1>
          <p className="text-sm text-[#546866] mt-1">
            Structured milestone tasks auto-assigned upon student registration.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {urgentCount > 0 && (
            <StatusBadge tone="warning">{urgentCount} High Priority Open</StatusBadge>
          )}
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => setShowModal(true)}
            className="shrink-0"
          >
            <Plus className="h-4 w-4" />
            Create Custom Task
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="beyond-card p-4">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-[#546866]">
            Total Assigned
          </p>
          <p className="text-2xl font-bold text-[#263331] mt-1 tabular-nums">{tasks.length}</p>
        </div>
        <div className="beyond-card border-[#D9A879] bg-[#FCF6EC]/70 p-4">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-[#8A5A1E]">
            Pending Action
          </p>
          <p className="text-2xl font-bold text-[#8A5A1E] mt-1 tabular-nums">{pendingCount}</p>
        </div>
        <div className="beyond-card border-[#B7CBC2] bg-[#E6EFEA]/70 p-4">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-[#3F6258]">
            In Progress
          </p>
          <p className="text-2xl font-bold text-[#3F6258] mt-1 tabular-nums">{inProgressCount}</p>
        </div>
        <div className="beyond-card border-[#B7CBC2] bg-[#EDF5F1]/80 p-4">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-[#2F6B55]">
            Completed Milestones
          </p>
          <p className="text-2xl font-bold text-[#2F6B55] mt-1 tabular-nums">{completedCount}</p>
        </div>
      </div>

      {/* Controls & Filters */}
      <div className="bg-[#F3F0E8]/60 border border-[#DCE5E8] rounded-xl p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 lg:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#546866] pointer-events-none" />
            <input
              type="text"
              placeholder="Search by student or task title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${INPUT_CLASS} pl-10 bg-white`}
            />
          </div>

          <div className="relative sm:w-44">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#546866] pointer-events-none" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              aria-label="Filter tasks by priority"
              className={`${INPUT_CLASS} pl-10 bg-white font-medium`}
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white border border-[#DCE5E8] p-1 rounded-xl text-xs font-medium overflow-x-auto">
          {[
            { key: "all", label: `All (${tasks.length})` },
            { key: "pending", label: `Pending (${pendingCount})` },
            { key: "in_progress", label: `In Progress (${inProgressCount})` },
            { key: "completed", label: `Done (${completedCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterStatus(tab.key)}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer ${
                filterStatus === tab.key
                  ? "bg-[#394B49] text-white shadow-xs font-semibold"
                  : "text-[#546866] hover:text-[#394B49] hover:bg-[#F3F0E8]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="space-y-4">
          <div className="beyond-card p-6">
            <GlobalOrbitLoader label="Loading onboarding tasks…" size="md" />
          </div>
          <SkeletonCard />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="beyond-card p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6EFEA] border border-[#B7CBC2] text-[#3F6258]">
            <CheckSquare className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-[#263331] text-base">No Tasks Match Filters</h3>
          <p className="text-sm text-[#546866] mt-1 max-w-md mx-auto">
            {search
              ? "No tasks found matching your search query."
              : "All student onboarding tasks have been processed."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((t) => {
            const cat = CATEGORY_LABELS[t.category] || {
              label: t.category,
              tone: "misty" as const,
            };
            const prio = PRIORITY_BADGES[t.priority] || {
              label: t.priority,
              tone: "misty" as const,
            };
            const isCompleted = t.status === "completed";

            return (
              <div
                key={t.id}
                className={`beyond-card beyond-card-interactive p-5 ${
                  isCompleted ? "opacity-80 bg-[#F3F0E8]/50" : ""
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Task Info */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge tone={cat.tone}>{cat.label}</StatusBadge>
                      <StatusBadge tone={prio.tone}>{prio.label}</StatusBadge>
                      <StatusBadge tone={getTaskStatusTone(t.status)} className="capitalize">
                        {t.status.replace(/_/g, " ")}
                      </StatusBadge>
                      {t.due_date && (
                        <span className="text-xs text-[#546866] flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Due:{" "}
                          {new Date(t.due_date).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>

                    <h2
                      className={`text-base font-semibold ${
                        isCompleted ? "line-through text-[#546866]" : "text-[#263331]"
                      }`}
                    >
                      {t.title}
                    </h2>

                    {t.description && (
                      <p className="text-sm text-[#546866] line-clamp-2 max-w-3xl">
                        {t.description}
                      </p>
                    )}

                    {/* Student Info Bar */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#546866]">
                      <div className="flex items-center gap-1.5 font-medium text-[#263331] bg-[#F3F0E8]/70 px-2.5 py-1 rounded-lg border border-[#DCE5E8]">
                        <User className="h-3.5 w-3.5 text-[#3F6258]" />
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
                        <span className="text-[#3F6258] font-medium">
                          Target: {t.student_intake}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2 self-end lg:self-center shrink-0">
                    {t.status === "pending" && (
                      <Button
                        type="button"
                        variant="sage"
                        size="sm"
                        onClick={() => handleUpdateStatus(t.id, "in_progress")}
                      >
                        Start Task
                      </Button>
                    )}
                    {t.status !== "completed" ? (
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => handleUpdateStatus(t.id, "completed")}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Mark Done
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleUpdateStatus(t.id, "pending")}
                      >
                        Re-open
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Task Modal */}
      <ModalShell
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create Custom Action Task"
        subtitle="Assign a custom milestone or follow-up item to a candidate."
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
              Assign To Student *
            </label>
            <select
              value={newStudentId}
              onChange={(e) => setNewStudentId(e.target.value)}
              className={INPUT_CLASS}
              required
            >
              {students.map((s) => {
                const name =
                  s.student_name ||
                  `${s.first_name || ""} ${s.last_name || ""}`.trim() ||
                  s.email ||
                  "Student";
                return (
                  <option key={s.id} value={s.id}>
                    {name} ({s.email})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Audit GRE Test Score Verification Slip"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
              Detailed Instructions / Notes
            </label>
            <textarea
              rows={3}
              placeholder="Key deliverables or actions to verify..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className={INPUT_CLASS}
              >
                <option value="profile_evaluation">Profile Evaluation</option>
                <option value="document_review">Transcript Audit</option>
                <option value="shortlisting">University Strategy</option>
                <option value="sop_review">SOP / LOR Review</option>
                <option value="visa_guidance">Visa Guidance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className={INPUT_CLASS}
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
                Due In (Days)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={newDueDays}
                onChange={(e) => setNewDueDays(Number(e.target.value))}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={creating}
              loadingText="Creating..."
              disabled={creating}
            >
              Save Task
            </Button>
          </div>
        </form>
      </ModalShell>
    </div>
  );
}

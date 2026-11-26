"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ModalShell, StatusBadge } from "@/components/ui/feedback";
import { SkeletonCard } from "@/components/ui/skeleton";
import {
  Search,
  Plus,
  Mail,
  Phone,
  Shield,
  Users,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface CounsellorStaff {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  roles: string[];
  is_active: boolean;
  created_at: string;
  assigned_leads_count: number;
  assigned_students_count: number;
}

export default function AdminCounsellorsPage() {
  const [staff, setStaff] = useState<CounsellorStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New staff form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "counsellor",
    password: "",
  });

  async function loadStaff() {
    try {
      const data = await api.get<CounsellorStaff[]>("users/counsellors");
      setStaff(data || []);
    } catch (err) {
      console.error("Failed to load counsellors:", err);
      toast.error("Failed to load staff list.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStaff();
  }, []);

  async function handleToggleStatus(user: CounsellorStaff) {
    try {
      await api.patch(`users/${user.id}/status`, { is_active: !user.is_active });
      toast.success(`User ${user.first_name} ${!user.is_active ? "activated" : "deactivated"}.`);
      loadStaff();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status.");
    }
  }

  async function handleCreateStaff(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("users", formData);
      toast.success("Staff member created successfully!");
      setIsAddModalOpen(false);
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        role: "counsellor",
        password: "",
      });
      loadStaff();
    } catch (err: any) {
      toast.error(err.message || "Failed to create staff member.");
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = staff.filter(
    (s) =>
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone && s.phone.includes(search))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8E572C]">
            Advisory Team
          </span>
          <h1 className="font-editorial text-2xl sm:text-3xl tracking-tight text-[#263331] mt-0.5">
            Counsellors &amp; Staff Management
          </h1>
          <p className="mt-1 text-sm text-[#546866]">
            Manage counselling advisors, assign roles, and monitor caseload distribution.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => setIsAddModalOpen(true)}
          className="self-start sm:self-center"
        >
          <Plus className="h-4 w-4" />
          Add Staff Member
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-[#F3F0E8]/75 border border-[#DCE5E8] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#546866]" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[#DCE5E8] bg-white pl-10 pr-3.5 py-2.5 text-sm text-[#394B49] placeholder:text-[#546866]/70 focus:border-[#394B49] focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
          />
        </div>
        <span className="text-xs font-medium text-[#546866]">
          <strong className="text-[#263331]">{filtered.length}</strong> staff account
          {filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filtered.length === 0 ? (
        <div className="beyond-card text-center py-16 px-4">
          <Users className="h-12 w-12 text-[#546866]/45 mx-auto mb-3" />
          <h3 className="font-semibold text-[#263331]">No staff members found</h3>
          <p className="text-sm text-[#546866] mt-1">
            {search ? "No staff matches your search query." : "No counsellors or staff added yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="beyond-card beyond-card-interactive p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-11 w-11 shrink-0 rounded-full bg-[#394B49] text-white flex items-center justify-center font-semibold text-sm">
                      {item.first_name[0]}
                      {item.last_name[0]}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-[#263331] text-base truncate">
                        {item.first_name} {item.last_name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <StatusBadge tone="misty" className="uppercase text-[10px]">
                          <Shield className="h-3 w-3" />
                          {item.roles.join(", ")}
                        </StatusBadge>
                        {item.is_active ? (
                          <StatusBadge tone="success" className="text-[10px]">
                            <CheckCircle2 className="h-3 w-3" /> Active
                          </StatusBadge>
                        ) : (
                          <StatusBadge tone="error" className="text-[10px]">
                            <XCircle className="h-3 w-3" /> Inactive
                          </StatusBadge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-[#546866]">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-[#3F6258] shrink-0" />
                    <span className="truncate">{item.email}</span>
                  </div>
                  {item.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-[#8E572C] shrink-0" />
                      <span>{item.phone}</span>
                    </div>
                  )}
                </div>

                {/* Caseload Metrics */}
                <div className="grid grid-cols-2 gap-2.5 mt-4 pt-4 border-t border-[#DCE5E8]">
                  <div className="bg-[#F3F0E8]/75 border border-[#DCE5E8] rounded-xl p-2.5 text-center">
                    <div className="text-lg font-bold text-[#263331]">
                      {item.assigned_leads_count}
                    </div>
                    <div className="text-[11px] text-[#546866]">Assigned Leads</div>
                  </div>
                  <div className="bg-[#F3F0E8]/75 border border-[#DCE5E8] rounded-xl p-2.5 text-center">
                    <div className="text-lg font-bold text-[#263331]">
                      {item.assigned_students_count}
                    </div>
                    <div className="text-[11px] text-[#546866]">Active Students</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-[#DCE5E8] flex items-center justify-between">
                <span className="text-[11px] text-[#546866]">
                  Joined {new Date(item.created_at).toLocaleDateString()}
                </span>
                <Button
                  size="sm"
                  variant={item.is_active ? "secondary" : "sage"}
                  onClick={() => handleToggleStatus(item)}
                  className={
                    item.is_active
                      ? "border-[#E7BABA] text-[#A63A3A] hover:bg-[#FDF2F2] hover:border-[#A63A3A]"
                      : ""
                  }
                >
                  {item.is_active ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Staff Modal */}
      <ModalShell
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Staff Member"
        subtitle="Provision a counsellor or administrator account."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateStaff} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#394B49] mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
                placeholder="Aditi"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#394B49] mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
                placeholder="Sharma"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#394B49] mb-1">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
              placeholder="aditi@lugie.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#394B49] mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
              placeholder="+91 93927 34699"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#394B49] mb-1">Role *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
            >
              <option value="counsellor">Counsellor (Advisory &amp; Student Management)</option>
              <option value="admin">Admin (Full System Permissions)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#394B49] mb-1">
              Temporary Password *
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
              placeholder="Min 8 characters"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#DCE5E8]">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
              loadingText="Creating…"
            >
              Create Account
            </Button>
          </div>
        </form>
      </ModalShell>
    </div>
  );
}

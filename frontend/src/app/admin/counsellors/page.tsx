"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import {
  UserCheck,
  Search,
  Plus,
  Mail,
  Phone,
  Shield,
  Loader2,
  Users,
  CheckCircle2,
  XCircle,
  Briefcase,
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-primary" />
            Counsellors & Staff Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage counselling advisors, assign roles, and monitor caseload distribution.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Staff Member
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3 bg-card p-3 rounded-2xl border border-border">
        <Search className="h-4 w-4 text-muted-foreground ml-2" />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none text-sm focus:outline-none w-full text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="font-semibold text-foreground">No staff members found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {search ? "No staff matches your search query." : "No counsellors or staff added yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-card rounded-2xl border border-border p-5 flex flex-col justify-between hover:border-primary/40 transition-all shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
                      {item.first_name[0]}
                      {item.last_name[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-base">
                        {item.first_name} {item.last_name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground uppercase">
                          <Shield className="h-3 w-3" />
                          {item.roles.join(", ")}
                        </span>
                        {item.is_active ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                            <CheckCircle2 className="h-3 w-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600">
                            <XCircle className="h-3 w-3" /> Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    <span>{item.email}</span>
                  </div>
                  {item.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-primary" />
                      <span>{item.phone}</span>
                    </div>
                  )}
                </div>

                {/* Caseload Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-border">
                  <div className="bg-muted/50 rounded-xl p-2.5 text-center">
                    <div className="text-lg font-bold text-foreground">
                      {item.assigned_leads_count}
                    </div>
                    <div className="text-[11px] text-muted-foreground">Assigned Leads</div>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-2.5 text-center">
                    <div className="text-lg font-bold text-foreground">
                      {item.assigned_students_count}
                    </div>
                    <div className="text-[11px] text-muted-foreground">Active Students</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  Joined {new Date(item.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleToggleStatus(item)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                    item.is_active
                      ? "border-rose-500/20 text-rose-600 hover:bg-rose-500/10"
                      : "border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10"
                  }`}
                >
                  {item.is_active ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Add New Staff Member
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm bg-muted rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Aditi"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm bg-muted rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Sharma"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-sm bg-muted rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="aditi@lugie.com"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-sm bg-muted rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="+91 93927 34699"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-sm bg-muted rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="counsellor">Counsellor (Advisory & Student Management)</option>
                  <option value="admin">Admin (Full System Permissions)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Temporary Password *</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-sm bg-muted rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Min 8 characters"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm rounded-xl border border-border text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

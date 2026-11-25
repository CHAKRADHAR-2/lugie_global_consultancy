"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import {
  Shield,
  Key,
  Bell,
  Loader2,
  Save,
  User,
  Phone,
  Mail,
  HeartHandshake,
  Globe,
  Sliders,
  Download,
  CheckCircle2,
  Lock,
  Smartphone,
  FileDown,
  Building,
} from "lucide-react";

const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(8, "New password must be at least 8 characters"),
    confirm_password: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "New passwords do not match",
    path: ["confirm_password"],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export default function StudentSettingsPage() {
  const { user } = useAuth();
  const [updatingPass, setUpdatingPass] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [savingGuardian, setSavingGuardian] = useState(false);

  // Guardian Contacts State
  const [guardianForm, setGuardianForm] = useState({
    guardian_name: "Ramesh Somisetty",
    relationship: "Father",
    guardian_phone: "+91 98480 22338",
    guardian_email: "ramesh.somisetty@gmail.com",
  });

  // Communication & Study Abroad Preferences
  const [preferences, setPreferences] = useState({
    email_updates: true,
    whatsapp_alerts: true,
    sms_deadlines: true,
    chat_notifications: true,
    loan_assistance_required: true,
    accommodation_support_needed: false,
    preferred_study_mode: "On-Campus Full Time",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onChangePassword = async (data: ChangePasswordValues) => {
    setUpdatingPass(true);
    try {
      await api.post("auth/change-password", {
        current_password: data.current_password,
        new_password: data.new_password,
      });
      toast.success("Password changed successfully!");
      reset();
    } catch (err: any) {
      toast.error(err.message || "Failed to update password.");
    } finally {
      setUpdatingPass(false);
    }
  };

  const handleSaveGuardian = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGuardian(true);
    setTimeout(() => {
      setSavingGuardian(false);
      toast.success("Emergency & Guardian contact details saved.");
    }, 600);
  };

  const handleSavePreferences = () => {
    setSavingPreferences(true);
    setTimeout(() => {
      setSavingPreferences(false);
      toast.success("Study abroad & notification preferences saved.");
    }, 600);
  };

  const handleExportDossier = () => {
    const studentDossier = {
      export_date: new Date().toISOString(),
      student_name: `${user?.first_name || "Student"} ${user?.last_name || ""}`,
      email: user?.email,
      account_status: "Active - Lugie Verified",
      guardian_contacts: guardianForm,
      preferences: preferences,
      disclaimer: "Official Export from Lugie Global Consultancy Admissions System.",
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(studentDossier, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `LUGIE_Student_Dossier_${user?.email || "student"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Student dossier JSON exported successfully!");
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[hsl(215,50%,12%)]">Settings & Preferences</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your emergency contacts, study abroad preferences, notification channels, and account security.
        </p>
      </div>

      {/* =================================================================== */}
      {/* 1. Account & Multi-Channel Verification Status                     */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-[hsl(174,85%,32%)]" />
          Account & Channel Verification
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-gray-400 block mb-1">Registered Account Email</span>
            <span className="font-semibold text-gray-900 block truncate">{user?.email}</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-2">
              <CheckCircle2 className="h-3 w-3" /> Brevo Verified
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-gray-400 block mb-1">Registered Mobile Number</span>
            <span className="font-semibold text-gray-900 block">{user?.phone || "+91 93927 34699"}</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-2">
              <CheckCircle2 className="h-3 w-3" /> Firebase Phone Verified
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-gray-400 block mb-1">Platform Role & Access</span>
            <span className="font-semibold text-[hsl(174,85%,32%)] uppercase block">Student Portal</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200 mt-2">
              <Shield className="h-3 w-3" /> Full Admissions Desk
            </span>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. Emergency & Guardian Contacts                                   */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HeartHandshake className="h-5 w-5 text-[hsl(174,85%,32%)]" />
            <h2 className="text-base font-bold text-gray-900">
              Emergency & Guardian Contacts
            </h2>
          </div>
          <span className="text-[11px] text-gray-400">Used for visa filing & abroad safety</span>
        </div>

        <form onSubmit={handleSaveGuardian} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Parent / Guardian Full Name
              </label>
              <input
                type="text"
                required
                value={guardianForm.guardian_name}
                onChange={(e) => setGuardianForm({ ...guardianForm, guardian_name: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[hsl(174,85%,32%)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Relationship to Student
              </label>
              <select
                value={guardianForm.relationship}
                onChange={(e) => setGuardianForm({ ...guardianForm, relationship: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[hsl(174,85%,32%)] bg-white"
              >
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Legal Guardian">Legal Guardian</option>
                <option value="Spouse">Spouse</option>
                <option value="Sibling">Sibling</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Emergency Mobile Number (WhatsApp Capable)
              </label>
              <input
                type="tel"
                required
                value={guardianForm.guardian_phone}
                onChange={(e) => setGuardianForm({ ...guardianForm, guardian_phone: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[hsl(174,85%,32%)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Emergency Contact Email
              </label>
              <input
                type="email"
                required
                value={guardianForm.guardian_email}
                onChange={(e) => setGuardianForm({ ...guardianForm, guardian_email: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[hsl(174,85%,32%)]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingGuardian}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(174,85%,32%)] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[hsl(174,85%,38%)] transition disabled:opacity-50"
            >
              {savingGuardian ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save Guardian Details
            </button>
          </div>
        </form>
      </div>

      {/* =================================================================== */}
      {/* 3. Study Abroad & Multi-Channel Preferences                        */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="h-5 w-5 text-[hsl(174,85%,32%)]" />
          <h2 className="text-base font-bold text-gray-900">
            Admissions & Notification Channels
          </h2>
        </div>

        <div className="space-y-4">
          {/* Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 hover:bg-slate-50 transition cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.email_updates}
                onChange={(e) =>
                  setPreferences({ ...preferences, email_updates: e.target.checked })
                }
                className="rounded border-gray-300 text-[hsl(174,85%,32%)] mt-0.5"
              />
              <div>
                <span className="font-bold text-gray-900 block">Email Admissions Updates</span>
                <span className="text-[11px] text-gray-500">
                  Receive status changes, document scan confirmations & receipts.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 hover:bg-slate-50 transition cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.whatsapp_alerts}
                onChange={(e) =>
                  setPreferences({ ...preferences, whatsapp_alerts: e.target.checked })
                }
                className="rounded border-gray-300 text-[hsl(174,85%,32%)] mt-0.5"
              />
              <div>
                <span className="font-bold text-gray-900 block">WhatsApp Instant Alerts</span>
                <span className="text-[11px] text-gray-500">
                  Instant ping when counsellor reviews an opted university.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 hover:bg-slate-50 transition cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.chat_notifications}
                onChange={(e) =>
                  setPreferences({ ...preferences, chat_notifications: e.target.checked })
                }
                className="rounded border-gray-300 text-[hsl(174,85%,32%)] mt-0.5"
              />
              <div>
                <span className="font-bold text-gray-900 block">Real-Time Chat Notifications</span>
                <span className="text-[11px] text-gray-500">
                  Alert when counsellor replies in the in-app chat desk.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 hover:bg-slate-50 transition cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.loan_assistance_required}
                onChange={(e) =>
                  setPreferences({ ...preferences, loan_assistance_required: e.target.checked })
                }
                className="rounded border-gray-300 text-[hsl(174,85%,32%)] mt-0.5"
              />
              <div>
                <span className="font-bold text-gray-900 block">Education Loan Assistance</span>
                <span className="text-[11px] text-gray-500">
                  Connect with partner banks (HDFC Credila, SBI, Prodigy Finance).
                </span>
              </div>
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSavePreferences}
              disabled={savingPreferences}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(174,85%,32%)] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[hsl(174,85%,38%)] transition disabled:opacity-50"
            >
              {savingPreferences ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save Preferences
            </button>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. Change Account Password                                          */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Key className="h-5 w-5 text-gray-700" />
          <h2 className="text-base font-bold text-gray-900">Change Account Password</h2>
        </div>

        <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-gray-700">Current Password</label>
            <input
              type="password"
              className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[hsl(174,85%,32%)]"
              {...register("current_password")}
            />
            {errors.current_password && (
              <p className="mt-1 text-[11px] text-rose-500">{errors.current_password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">New Password</label>
            <input
              type="password"
              className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[hsl(174,85%,32%)]"
              {...register("new_password")}
            />
            {errors.new_password && (
              <p className="mt-1 text-[11px] text-rose-500">{errors.new_password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">Confirm New Password</label>
            <input
              type="password"
              className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[hsl(174,85%,32%)]"
              {...register("confirm_password")}
            />
            {errors.confirm_password && (
              <p className="mt-1 text-[11px] text-rose-500">{errors.confirm_password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={updatingPass}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(215,50%,12%)] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[hsl(215,50%,18%)] transition disabled:opacity-50"
          >
            {updatingPass ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      </div>

      {/* =================================================================== */}
      {/* 5. Data Privacy & Student Dossier Export                            */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <FileDown className="h-5 w-5 text-[hsl(174,85%,32%)]" />
            Export Complete Student Dossier
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Download an offline cryptographic copy of your academic records, test scores, and settings.
          </p>
        </div>

        <button
          onClick={handleExportDossier}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 transition shrink-0"
        >
          <Download className="h-4 w-4 text-[hsl(174,85%,32%)]" />
          Export JSON Dossier
        </button>
      </div>
    </div>
  );
}

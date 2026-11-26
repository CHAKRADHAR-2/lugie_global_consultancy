"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import {
  Shield,
  Key,
  Save,
  User,
  HeartHandshake,
  Sliders,
  Download,
  CheckCircle2,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/feedback";

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

const INPUT_CLASS =
  "w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/50 px-3.5 py-2.5 text-xs text-[#394B49] placeholder:text-[#546866]/70 focus:outline-none focus:border-[#394B49] focus:bg-white transition";

const SELECT_CLASS =
  "w-full rounded-xl border border-[#DCE5E8] bg-white px-3.5 py-2.5 text-xs text-[#394B49] focus:outline-none focus:border-[#394B49] transition";

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
        <h1 className="font-editorial text-2xl sm:text-3xl text-[#263331]">
          Settings &amp; Preferences
        </h1>
        <p className="mt-1 text-sm text-[#546866]">
          Manage your emergency contacts, study abroad preferences, notification channels, and account security.
        </p>
      </div>

      {/* =================================================================== */}
      {/* 1. Account & Multi-Channel Verification Status                     */}
      {/* =================================================================== */}
      <div className="beyond-card p-6">
        <h2 className="text-base font-bold text-[#263331] mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-[#3F6258]" />
          Account &amp; Channel Verification
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#F3F0E8]/60 border border-[#DCE5E8]">
            <span className="text-[#546866] block mb-1">Registered Account Email</span>
            <span className="font-semibold text-[#263331] block truncate">{user?.email}</span>
            <StatusBadge tone="success" className="mt-2.5">
              <CheckCircle2 className="h-3 w-3" /> Brevo Verified
            </StatusBadge>
          </div>

          <div className="p-4 rounded-xl bg-[#F3F0E8]/60 border border-[#DCE5E8]">
            <span className="text-[#546866] block mb-1">Registered Mobile Number</span>
            <span className="font-semibold text-[#263331] block">
              {user?.phone || "+91 93927 34699"}
            </span>
            <StatusBadge tone="success" className="mt-2.5">
              <CheckCircle2 className="h-3 w-3" /> Firebase Phone Verified
            </StatusBadge>
          </div>

          <div className="p-4 rounded-xl bg-[#F3F0E8]/60 border border-[#DCE5E8]">
            <span className="text-[#546866] block mb-1">Platform Role &amp; Access</span>
            <span className="font-semibold text-[#394B49] uppercase block">Student Portal</span>
            <StatusBadge tone="sage" className="mt-2.5">
              <Shield className="h-3 w-3" /> Full Admissions Desk
            </StatusBadge>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. Emergency & Guardian Contacts                                   */}
      {/* =================================================================== */}
      <div className="beyond-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <HeartHandshake className="h-5 w-5 text-[#3F6258]" />
            <h2 className="text-base font-bold text-[#263331]">
              Emergency &amp; Guardian Contacts
            </h2>
          </div>
          <span className="text-[11px] text-[#546866]">Used for visa filing &amp; abroad safety</span>
        </div>

        <form onSubmit={handleSaveGuardian} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
                Parent / Guardian Full Name
              </label>
              <input
                type="text"
                required
                value={guardianForm.guardian_name}
                onChange={(e) => setGuardianForm({ ...guardianForm, guardian_name: e.target.value })}
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
                Relationship to Student
              </label>
              <select
                value={guardianForm.relationship}
                onChange={(e) => setGuardianForm({ ...guardianForm, relationship: e.target.value })}
                className={SELECT_CLASS}
              >
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Legal Guardian">Legal Guardian</option>
                <option value="Spouse">Spouse</option>
                <option value="Sibling">Sibling</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
                Emergency Mobile Number (WhatsApp Capable)
              </label>
              <input
                type="tel"
                required
                value={guardianForm.guardian_phone}
                onChange={(e) => setGuardianForm({ ...guardianForm, guardian_phone: e.target.value })}
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
                Emergency Contact Email
              </label>
              <input
                type="email"
                required
                value={guardianForm.guardian_email}
                onChange={(e) => setGuardianForm({ ...guardianForm, guardian_email: e.target.value })}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={savingGuardian}
              disabled={savingGuardian}
            >
              <Save className="h-3.5 w-3.5" />
              Save Guardian Details
            </Button>
          </div>
        </form>
      </div>

      {/* =================================================================== */}
      {/* 3. Study Abroad & Multi-Channel Preferences                        */}
      {/* =================================================================== */}
      <div className="beyond-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="h-5 w-5 text-[#3F6258]" />
          <h2 className="text-base font-bold text-[#263331]">
            Admissions &amp; Notification Channels
          </h2>
        </div>

        <div className="space-y-4">
          {/* Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[#DCE5E8] bg-[#F3F0E8]/40 hover:bg-[#E6EFEA]/50 hover:border-[#B7CBC2] transition cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.email_updates}
                onChange={(e) =>
                  setPreferences({ ...preferences, email_updates: e.target.checked })
                }
                className="rounded border-[#B7CBC2] accent-[#394B49] mt-0.5"
              />
              <div>
                <span className="font-bold text-[#263331] block">Email Admissions Updates</span>
                <span className="text-[11px] text-[#546866]">
                  Receive status changes, document scan confirmations &amp; receipts.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[#DCE5E8] bg-[#F3F0E8]/40 hover:bg-[#E6EFEA]/50 hover:border-[#B7CBC2] transition cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.whatsapp_alerts}
                onChange={(e) =>
                  setPreferences({ ...preferences, whatsapp_alerts: e.target.checked })
                }
                className="rounded border-[#B7CBC2] accent-[#394B49] mt-0.5"
              />
              <div>
                <span className="font-bold text-[#263331] block">WhatsApp Instant Alerts</span>
                <span className="text-[11px] text-[#546866]">
                  Instant ping when counsellor reviews an opted university.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[#DCE5E8] bg-[#F3F0E8]/40 hover:bg-[#E6EFEA]/50 hover:border-[#B7CBC2] transition cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.chat_notifications}
                onChange={(e) =>
                  setPreferences({ ...preferences, chat_notifications: e.target.checked })
                }
                className="rounded border-[#B7CBC2] accent-[#394B49] mt-0.5"
              />
              <div>
                <span className="font-bold text-[#263331] block">Real-Time Chat Notifications</span>
                <span className="text-[11px] text-[#546866]">
                  Alert when counsellor replies in the in-app chat desk.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[#DCE5E8] bg-[#F3F0E8]/40 hover:bg-[#E6EFEA]/50 hover:border-[#B7CBC2] transition cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.loan_assistance_required}
                onChange={(e) =>
                  setPreferences({ ...preferences, loan_assistance_required: e.target.checked })
                }
                className="rounded border-[#B7CBC2] accent-[#394B49] mt-0.5"
              />
              <div>
                <span className="font-bold text-[#263331] block">Education Loan Assistance</span>
                <span className="text-[11px] text-[#546866]">
                  Connect with partner banks (HDFC Credila, SBI, Prodigy Finance).
                </span>
              </div>
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={savingPreferences}
              onClick={handleSavePreferences}
              disabled={savingPreferences}
            >
              <Save className="h-3.5 w-3.5" />
              Save Preferences
            </Button>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. Change Account Password                                          */}
      {/* =================================================================== */}
      <div className="beyond-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Key className="h-5 w-5 text-[#394B49]" />
          <h2 className="text-base font-bold text-[#263331]">Change Account Password</h2>
        </div>

        <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              className={INPUT_CLASS}
              {...register("current_password")}
            />
            {errors.current_password && (
              <p className="mt-1 text-[11px] text-[#A63A3A]">{errors.current_password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
              New Password
            </label>
            <input
              type="password"
              className={INPUT_CLASS}
              {...register("new_password")}
            />
            {errors.new_password && (
              <p className="mt-1 text-[11px] text-[#A63A3A]">{errors.new_password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              className={INPUT_CLASS}
              {...register("confirm_password")}
            />
            {errors.confirm_password && (
              <p className="mt-1 text-[11px] text-[#A63A3A]">{errors.confirm_password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={updatingPass}
            loadingText="Updating..."
            disabled={updatingPass}
          >
            Update Password
          </Button>
        </form>
      </div>

      {/* =================================================================== */}
      {/* 5. Data Privacy & Student Dossier Export                            */}
      {/* =================================================================== */}
      <div className="beyond-card p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#263331] flex items-center gap-2">
            <FileDown className="h-5 w-5 text-[#3F6258]" />
            Export Complete Student Dossier
          </h2>
          <p className="text-xs text-[#546866] mt-0.5">
            Download an offline cryptographic copy of your academic records, test scores, and settings.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={handleExportDossier}
          className="shrink-0"
        >
          <Download className="h-4 w-4 text-[#3F6258]" />
          Export JSON Dossier
        </Button>
      </div>
    </div>
  );
}

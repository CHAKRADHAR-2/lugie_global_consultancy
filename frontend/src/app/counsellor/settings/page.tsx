"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { Shield, Key, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedbackBanner, StatusBadge } from "@/components/ui/feedback";

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
  "w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] placeholder:text-[#546866]/70 focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition";

export default function CounsellorSettingsPage() {
  const { user } = useAuth();
  const [updatingPass, setUpdatingPass] = useState(false);

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

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-editorial text-2xl sm:text-3xl tracking-tight text-[#263331] flex items-center gap-2.5">
          <Shield className="h-6 w-6 text-[#3F6258] shrink-0" />
          <span>Account &amp; Security Settings</span>
        </h1>
        <p className="text-sm text-[#546866] mt-1">
          Manage your advisor credentials and portal preferences.
        </p>
      </div>

      {/* Profile Overview */}
      <div className="beyond-card p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-bold text-[#263331] flex items-center gap-2">
            <User className="h-5 w-5 text-[#3F6258]" />
            Staff Profile
          </h2>
          <StatusBadge tone="sage">Counsellor Workspace</StatusBadge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-[#F3F0E8]/60 border border-[#DCE5E8] rounded-xl p-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#546866] block">
              Full Name
            </span>
            <div className="font-semibold text-[#263331] mt-1">
              {user?.first_name} {user?.last_name}
            </div>
          </div>
          <div className="bg-[#F3F0E8]/60 border border-[#DCE5E8] rounded-xl p-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#546866] block">
              Work Email
            </span>
            <div className="font-semibold text-[#263331] mt-1 truncate">{user?.email}</div>
          </div>
          <div className="bg-[#F3F0E8]/60 border border-[#DCE5E8] rounded-xl p-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#546866] block">
              Assigned Role
            </span>
            <div className="mt-1">
              <StatusBadge tone="sage" className="capitalize">
                {user?.roles?.join(", ") || "Counsellor"}
              </StatusBadge>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="beyond-card p-6 space-y-6">
        <div>
          <h2 className="text-base font-bold text-[#263331] flex items-center gap-2">
            <Key className="h-5 w-5 text-[#3F6258]" />
            Change Password
          </h2>
          <p className="text-xs text-[#546866] mt-1">
            Ensure your account uses a strong, unique password with at least 8 characters.
          </p>
        </div>

        <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              {...register("current_password")}
              className={INPUT_CLASS}
            />
            {errors.current_password && (
              <p className="text-xs text-[#A63A3A] mt-1">{errors.current_password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
              New Password
            </label>
            <input
              type="password"
              {...register("new_password")}
              className={INPUT_CLASS}
            />
            {errors.new_password && (
              <p className="text-xs text-[#A63A3A] mt-1">{errors.new_password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              {...register("confirm_password")}
              className={INPUT_CLASS}
            />
            {errors.confirm_password && (
              <p className="text-xs text-[#A63A3A] mt-1">{errors.confirm_password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={updatingPass}
            loadingText="Updating..."
            disabled={updatingPass}
          >
            Update Password
          </Button>
        </form>
      </div>

      <FeedbackBanner
        tone="info"
        title="Advisor Session Integrity"
        message="All counsellor actions—including document verifications, shortlist opinions, and application stage updates—are logged for student audit compliance."
      />
    </div>
  );
}

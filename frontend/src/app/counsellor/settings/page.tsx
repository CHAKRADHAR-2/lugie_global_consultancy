"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { Shield, Key, Bell, Loader2, User } from "lucide-react";

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
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Account & Security Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your advisor credentials and portal preferences.
        </p>
      </div>

      {/* Profile Overview */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Staff Profile
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-xs text-muted-foreground">Full Name</span>
            <div className="font-semibold text-foreground">
              {user?.first_name} {user?.last_name}
            </div>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Work Email</span>
            <div className="font-semibold text-foreground">{user?.email}</div>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Assigned Role</span>
            <div className="font-semibold text-primary capitalize">
              {user?.roles?.join(", ") || "Counsellor"}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Change Password
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Ensure your account uses a strong, unique password with at least 8 characters.
          </p>
        </div>

        <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4 max-w-md">
          <div>
            <label className="text-xs font-semibold text-foreground">Current Password</label>
            <input
              type="password"
              {...register("current_password")}
              className="w-full mt-1 px-3 py-2 text-sm bg-muted rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            />
            {errors.current_password && (
              <p className="text-xs text-rose-500 mt-1">{errors.current_password.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">New Password</label>
            <input
              type="password"
              {...register("new_password")}
              className="w-full mt-1 px-3 py-2 text-sm bg-muted rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            />
            {errors.new_password && (
              <p className="text-xs text-rose-500 mt-1">{errors.new_password.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Confirm New Password</label>
            <input
              type="password"
              {...register("confirm_password")}
              className="w-full mt-1 px-3 py-2 text-sm bg-muted rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            />
            {errors.confirm_password && (
              <p className="text-xs text-rose-500 mt-1">{errors.confirm_password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={updatingPass}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2 shadow-sm"
          >
            {updatingPass && <Loader2 className="h-4 w-4 animate-spin" />}
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

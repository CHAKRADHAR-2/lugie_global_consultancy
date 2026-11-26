"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuth } from "@/hooks/use-auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: readonly { label: string; href: string; icon?: string }[];
  portalName: string;
}

const ROLE_DASHBOARD: Record<string, string> = {
  super_admin: "/admin/dashboard",
  admin: "/admin/dashboard",
  counsellor: "/counsellor/dashboard",
  student: "/student/dashboard",
};

function isAuthorizedForPortal(roles: string[], portalName: string): boolean {
  if (portalName === "Admin") {
    return roles.includes("super_admin") || roles.includes("admin");
  }
  if (portalName === "Counsellor") {
    return roles.includes("counsellor") || roles.includes("super_admin") || roles.includes("admin");
  }
  if (portalName === "Student") {
    return roles.includes("student");
  }
  return true;
}

export function DashboardLayout({ children, navItems, portalName }: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const roles = user?.roles || [];
  const authorized = Boolean(user && isAuthorizedForPortal(roles, portalName));

  useEffect(() => {
    if (loading) return;

    if (!user) {
      const target = pathname ? `/login?from=${encodeURIComponent(pathname)}` : "/login";
      router.replace(target);
      return;
    }

    if (!isAuthorizedForPortal(roles, portalName)) {
      const primaryRole = roles[0] || "student";
      router.replace(ROLE_DASHBOARD[primaryRole] || "/student/dashboard");
    }
  }, [loading, user, roles, portalName, pathname, router]);

  if (loading || !authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[hsl(210,20%,98%)]">
        <div className="flex flex-col items-center gap-3 text-[hsl(220,13%,46%)]">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(166,72%,40%)]" />
          <p className="text-xs font-medium">Verifying portal session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[hsl(210,20%,98%)] text-[hsl(222,47%,11%)]">
      <Sidebar items={navItems} portalName={portalName} />
      <main className="flex-1 lg:ml-64">
        <div className="p-6 pt-20 lg:pt-6">{children}</div>
      </main>
    </div>
  );
}

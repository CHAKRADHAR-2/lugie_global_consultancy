"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { GlobalOrbitLoader } from "@/components/ui/loading-concepts";
import { PageTransition } from "@/components/ui/fade-in";

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
      <div className="flex min-h-screen items-center justify-center bg-[#F3F0E8] px-4">
        <GlobalOrbitLoader label={`Verifying ${portalName.toLowerCase()} session…`} size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F3F0E8] text-[#394B49]">
      <Sidebar items={navItems} portalName={portalName} />
      <main className="flex-1 min-w-0 lg:ml-64">
        <PageTransition className="mx-auto max-w-7xl p-5 pt-20 sm:p-8 lg:pt-8">
          {children}
        </PageTransition>
      </main>
    </div>
  );
}

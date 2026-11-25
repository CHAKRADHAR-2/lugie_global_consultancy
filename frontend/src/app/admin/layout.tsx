import { ADMIN_NAV_ITEMS } from "@/lib/constants";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={ADMIN_NAV_ITEMS} portalName="Admin">
      {children}
    </DashboardLayout>
  );
}

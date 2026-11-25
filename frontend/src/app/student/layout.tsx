import { STUDENT_NAV_ITEMS } from "@/lib/constants";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={STUDENT_NAV_ITEMS} portalName="Student">
      {children}
    </DashboardLayout>
  );
}

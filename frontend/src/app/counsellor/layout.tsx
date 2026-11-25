import { COUNSELLOR_NAV_ITEMS } from "@/lib/constants";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function CounsellorLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={COUNSELLOR_NAV_ITEMS} portalName="Counsellor">
      {children}
    </DashboardLayout>
  );
}

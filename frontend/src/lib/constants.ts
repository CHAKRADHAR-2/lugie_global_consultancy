export const APP_NAME = "Lugie Global Consultancy";
export const APP_TAGLINE = "Dream Beyond Borders";

export const PUBLIC_NAV_ITEMS = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Destinations", href: "/destinations" },
  { label: "Universities", href: "/universities" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
] as const;

export const STUDENT_NAV_ITEMS = [
  { label: "Dashboard", href: "/student/dashboard", icon: "LayoutDashboard" },
  { label: "My Profile", href: "/student/profile", icon: "User" },
  { label: "Documents", href: "/student/documents", icon: "FileText" },
  { label: "Applications", href: "/student/applications", icon: "GraduationCap" },
  { label: "Universities", href: "/student/universities", icon: "Building2" },
  { label: "Assessment", href: "/student/assessment", icon: "ClipboardCheck" },
  { label: "Payments", href: "/student/payments", icon: "CreditCard" },
  { label: "Messages", href: "/student/messages", icon: "MessageSquare" },
  { label: "Settings", href: "/student/settings", icon: "Settings" },
] as const;

export const COUNSELLOR_NAV_ITEMS = [
  { label: "Dashboard", href: "/counsellor/dashboard", icon: "LayoutDashboard" },
  { label: "My Leads", href: "/counsellor/leads", icon: "Users" },
  { label: "My Students", href: "/counsellor/students", icon: "GraduationCap" },
  { label: "University Shortlists", href: "/counsellor/shortlists", icon: "Building2" },
  { label: "Applications", href: "/counsellor/applications", icon: "FileCheck" },
  { label: "Documents", href: "/counsellor/documents", icon: "FileText" },
  { label: "Assessments", href: "/counsellor/assessments", icon: "ClipboardCheck" },
  { label: "Messages & Chat", href: "/counsellor/messages", icon: "MessageSquare" },
  { label: "Tasks", href: "/counsellor/tasks", icon: "CheckSquare" },
  { label: "Settings", href: "/counsellor/settings", icon: "Settings" },
] as const;

export const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard" },
  { label: "Leads & Enquiries", href: "/admin/leads", icon: "Users" },
  { label: "Students", href: "/admin/students", icon: "GraduationCap" },
  { label: "Counsellors", href: "/admin/counsellors", icon: "UserCheck" },
  { label: "Universities", href: "/admin/universities", icon: "Building2" },
  { label: "Applications", href: "/admin/applications", icon: "FileCheck" },
  { label: "Documents", href: "/admin/documents", icon: "FileText" },
  { label: "Messages & Chats", href: "/admin/messages", icon: "MessageSquare" },
  { label: "Packages & Pricing", href: "/admin/packages", icon: "CreditCard" },
  { label: "Payments", href: "/admin/payments", icon: "Wallet" },
  { label: "Reports", href: "/admin/reports", icon: "BarChart3" },
  { label: "Settings", href: "/admin/settings", icon: "Settings" },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: "ScrollText" },
] as const;

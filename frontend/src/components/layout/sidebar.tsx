"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, User, FileText, GraduationCap, Building2,
  ClipboardCheck, CreditCard, MessageSquare, Settings, Users,
  UserCheck, FileCheck, Wallet, BarChart3, ScrollText, CheckSquare,
  Menu, X, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  LayoutDashboard, User, FileText, GraduationCap, Building2,
  ClipboardCheck, CreditCard, MessageSquare, Settings, Users,
  UserCheck, FileCheck, Wallet, BarChart3, ScrollText, CheckSquare,
};

interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

interface SidebarProps {
  items: readonly NavItem[];
  portalName: string;
}

/**
 * Light-first Beyond Portal Sidebar.
 * Pure White elevated surface on a warm Porcelain workspace, Forest Slate ink,
 * Horizon Sage active navigation highlight, and a Terracotta waypoint indicator.
 */
export function Sidebar({ items, portalName }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const portalBadgeStyle =
    portalName === "Admin"
      ? "bg-[#394B49] text-white"
      : "bg-[#E6EFEA] text-[#3F6258] border border-[#B7CBC2]";

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center justify-between border-b border-[#DCE5E8] bg-white/95 px-4 backdrop-blur-sm lg:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-xl border border-[#DCE5E8] bg-[#F3F0E8] p-2 text-[#394B49] transition hover:bg-[#EAE5D9] cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close sidebar navigation" : "Open sidebar navigation"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <Link href="/" className="flex items-baseline gap-1">
            <span className="font-editorial text-lg text-[#394B49]">LUGIE</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#D9A879]" aria-hidden="true" />
          </Link>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${portalBadgeStyle}`}>
          {portalName}
        </span>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#263331]/35 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Light-First Editorial Sidebar */}
      <aside
        aria-label={`${portalName} portal navigation`}
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-[#DCE5E8] bg-white text-[#394B49] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:z-40 lg:translate-x-0",
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Top Horizon accent line */}
        <div className="h-1 w-full bg-gradient-to-r from-[#394B49] via-[#B7CBC2] to-[#D9A879]" aria-hidden="true" />

        {/* Brand Identity */}
        <div className="flex h-16 items-center justify-between border-b border-[#DCE5E8] px-5">
          <Link href="/" className="flex items-baseline gap-1.5 group">
            <span className="font-editorial text-2xl tracking-tight text-[#394B49]">
              LUGIE
            </span>
            <span
              className="inline-block h-2 w-2 rounded-full bg-[#D9A879] transition-transform group-hover:scale-125"
              aria-hidden="true"
            />
          </Link>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${portalBadgeStyle}`}>
            {portalName}
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#546866]">
            Workspace
          </p>
          <ul className="space-y-1">
            {items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const IconComponent = item.icon ? ICON_MAP[item.icon] : null;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 border",
                      isActive
                        ? "bg-[#E6EFEA] border-[#B7CBC2] text-[#263331] font-semibold shadow-2xs"
                        : "border-transparent font-medium text-[#546866] hover:bg-[#F3F0E8] hover:text-[#394B49]",
                    )}
                  >
                    {IconComponent && (
                      <IconComponent
                        size={17}
                        className={isActive ? "text-[#8E572C]" : "text-[#546866]"}
                      />
                    )}
                    <span className="truncate">{item.label}</span>
                    {isActive && (
                      <span
                        className="ml-auto h-2 w-2 rounded-full bg-[#D9A879] shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile & Sign Out */}
        <div className="border-t border-[#DCE5E8] bg-[#F3F0E8]/60 p-4">
          {user && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#394B49] text-xs font-semibold text-white">
                  {user.first_name?.[0]}
                  {user.last_name?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[#394B49]">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="truncate text-[11px] text-[#546866]">{user.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded-xl border border-transparent p-2 text-[#546866] transition hover:border-[#DCE5E8] hover:bg-white hover:text-[#A63A3A] cursor-pointer"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

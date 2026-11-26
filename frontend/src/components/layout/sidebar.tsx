"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, User, FileText, GraduationCap, Building2,
  ClipboardCheck, CreditCard, MessageSquare, Settings, Users,
  UserCheck, FileCheck, Wallet, BarChart3, ScrollText, CheckSquare,
  Menu, X, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
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

export function Sidebar({ items, portalName }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed left-4 top-4 z-50 rounded-md bg-[hsl(222,47%,11%)] p-2 text-white shadow-md transition hover:bg-[hsl(215,25%,18%)] lg:hidden"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {collapsed && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setCollapsed(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/10 bg-[hsl(222,47%,11%)] text-white transition-transform lg:translate-x-0",
          collapsed ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center border-b border-white/10 px-6">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-xl font-black tracking-tight text-white">
              LUGIE
            </span>
            <span className="inline-block h-2 w-2 rounded-full bg-[hsl(166,72%,40%)]" />
          </Link>
          <span className="ml-2.5 rounded-full bg-[hsl(166,72%,40%)]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[hsl(166,72%,50%)]">
            {portalName}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const IconComponent = item.icon ? ICON_MAP[item.icon] : null;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setCollapsed(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                      isActive
                        ? "bg-[hsl(166,72%,40%)]/15 text-[hsl(166,72%,50%)]"
                        : "text-white/70 hover:bg-[hsl(215,25%,18%)] hover:text-white",
                    )}
                  >
                    {IconComponent && <IconComponent size={18} />}
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[hsl(166,72%,40%)]" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User info */}
        <div className="border-t border-white/10 p-4">
          {user && (
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {user.first_name} {user.last_name}
                </p>
                <p className="truncate text-xs text-white/50">{user.email}</p>
              </div>
              <button
                onClick={logout}
                className="rounded-md p-1.5 text-white/50 transition hover:bg-[hsl(215,25%,18%)] hover:text-[hsl(166,72%,50%)]"
                title="Logout"
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

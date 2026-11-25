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
        className="fixed left-4 top-4 z-50 rounded-md bg-[hsl(215,50%,12%)] p-2 text-white lg:hidden"
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
          "fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-gray-200 bg-white transition-transform lg:translate-x-0",
          collapsed ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold text-[hsl(215,50%,12%)]">
              Lugie<span className="text-[hsl(174,85%,42%)]">.</span>
            </span>
          </Link>
          <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
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
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-[hsl(174,85%,32%)]/10 text-[hsl(174,85%,32%)]"
                        : "text-gray-700 hover:bg-gray-100",
                    )}
                  >
                    {IconComponent && <IconComponent size={18} />}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User info */}
        <div className="border-t border-gray-200 p-4">
          {user && (
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">
                  {user.first_name} {user.last_name}
                </p>
                <p className="truncate text-xs text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={logout}
                className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
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

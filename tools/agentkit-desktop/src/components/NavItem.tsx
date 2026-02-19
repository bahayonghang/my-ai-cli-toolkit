/**
 * NavItem - Sidebar navigation item with lucide-react icons
 */

import type { LucideIcon } from "lucide-react";

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
}

export function NavItem({ icon: Icon, label, count, active, onClick }: NavItemProps) {
  return (
    <button onClick={onClick}
      className={`ak-focus-ring w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 group relative overflow-hidden ${active
        ? "bg-gradient-to-r from-primary-500/20 to-primary-600/10 text-white shadow-lg border border-primary-500/20"
        : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"}`}>
      {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-full shadow-[0_0_10px_#0ea5e9]" />}
      <Icon className={`w-5 h-5 transition-transform duration-200 ${active ? "scale-110" : "group-hover:scale-110"}`} />
      <span className={`flex-1 font-medium tracking-wide ${active ? "text-primary-100" : ""}`}>{label}</span>
      {count !== undefined && (
        <span className={`px-2 py-0.5 text-xs rounded-full ${active
          ? "bg-primary-500/30 text-primary-200"
          : "bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-300"}`}>
          {count}
        </span>
      )}
    </button>
  );
}

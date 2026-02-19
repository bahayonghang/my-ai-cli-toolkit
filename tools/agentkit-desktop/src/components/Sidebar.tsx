/**
 * Sidebar - Navigation sidebar with tabs and detected platforms
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { Package, Zap, Bot, Globe, ShoppingCart, Settings } from "lucide-react";
import { NavItem } from "@/components";
import { AgentKitLogo } from "@/components/icons/AgentKitLogo";
import type { PlatformInfo } from "@/types";

export type TabType = "skills" | "commands" | "agents" | "external" | "marketplace" | "settings";

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  counts: Record<string, number>;
  platforms: PlatformInfo[];
  platformsLoading: boolean;
}

export const Sidebar = React.memo(function Sidebar({
  activeTab,
  onTabChange,
  counts,
  platforms,
  platformsLoading,
}: SidebarProps) {
  const { t } = useTranslation();
  const detectedPlatforms = platforms.filter(p => p.detected);

  return (
    <aside className="w-64 flex flex-col frosted-glass-heavy border-r-0 z-20">
      <div className="p-6 border-b border-white/5">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-primary-300 flex items-center gap-2 filter drop-shadow-sm">
          <AgentKitLogo className="w-9 h-9" />
          <span>{t("app.title")}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-2 font-medium tracking-wide">{t('app.subtitle')}</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        <NavItem icon={Package} label={t('nav.skills')} count={counts.skill ?? 0} active={activeTab === "skills"} onClick={() => onTabChange("skills")} />
        <NavItem icon={Zap} label={t('nav.commands')} count={counts.command ?? 0} active={activeTab === "commands"} onClick={() => onTabChange("commands")} />
        <NavItem icon={Bot} label={t('nav.agents')} count={counts.agent ?? 0} active={activeTab === "agents"} onClick={() => onTabChange("agents")} />
        <NavItem icon={Globe} label={t('nav.external')} active={activeTab === "external"} onClick={() => onTabChange("external")} />
        <NavItem icon={ShoppingCart} label={t('nav.marketplace')} active={activeTab === "marketplace"} onClick={() => onTabChange("marketplace")} />
        <div className="border-t border-white/10 my-3" />
        <NavItem icon={Settings} label={t('nav.settings')} active={activeTab === "settings"} onClick={() => onTabChange("settings")} />
      </nav>

      <div className="p-4 border-t border-white/5 bg-black/20 backdrop-blur-sm">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">{t('platform.detected')}</h3>
        {platformsLoading ? (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />{t('platform.detecting')}
          </div>
        ) : detectedPlatforms.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {detectedPlatforms.slice(0, 6).map(p => (
              <span key={p.platform} className="px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md shadow-sm backdrop-blur-md">
                {p.platform}
              </span>
            ))}
            {detectedPlatforms.length > 6 && <span className="px-2 py-0.5 text-xs text-slate-500">+{detectedPlatforms.length - 6}</span>}
          </div>
        ) : (
          <p className="text-xs text-slate-500">{t('platform.none')}</p>
        )}
      </div>
    </aside>
  );
});

/**
 * SortTabs Component - Tab-style sort options for marketplace
 */

import { useTranslation } from "react-i18next";
import type { MarketplaceSortBy } from "@/types";

interface SortTabsProps {
  value: MarketplaceSortBy;
  onChange: (value: MarketplaceSortBy) => void;
}

const SORT_OPTIONS: MarketplaceSortBy[] = ["hot", "trending", "all_time"];

export function SortTabs({ value, onChange }: SortTabsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-lg">
      {SORT_OPTIONS.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`ak-focus-ring px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            value === option
              ? "bg-primary-500/20 text-primary-200 border border-primary-400/30"
              : "text-slate-300 hover:text-white hover:bg-white/10 border border-transparent"
          }`}
        >
          {t(`marketplace.sort.${option}`)}
        </button>
      ))}
    </div>
  );
}

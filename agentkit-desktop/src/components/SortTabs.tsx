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
    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      {SORT_OPTIONS.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            value === option
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          {t(`marketplace.sort.${option}`)}
        </button>
      ))}
    </div>
  );
}

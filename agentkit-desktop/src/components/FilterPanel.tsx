/**
 * FilterPanel Component - Filter resources by category and tags
 */

import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

interface FilterPanelProps {
  categories: string[];
  tags: string[];
  selectedCategories: Set<string>;
  selectedTags: Set<string>;
  onCategoryChange: (categories: Set<string>) => void;
  onTagChange: (tags: Set<string>) => void;
  onClear: () => void;
}

export function FilterPanel({
  categories,
  tags,
  selectedCategories,
  selectedTags,
  onCategoryChange,
  onTagChange,
  onClear,
}: FilterPanelProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [tagSearch, setTagSearch] = useState("");

  const hasActiveFilters = selectedCategories.size > 0 || selectedTags.size > 0;

  // Filter tags by search
  const filteredTags = useMemo(() => {
    if (!tagSearch) return tags.slice(0, 20); // Show first 20 by default
    return tags.filter((t) =>
      t.toLowerCase().includes(tagSearch.toLowerCase())
    );
  }, [tags, tagSearch]);

  const handleCategoryToggle = (category: string) => {
    const next = new Set(selectedCategories);
    if (next.has(category)) {
      next.delete(category);
    } else {
      next.add(category);
    }
    onCategoryChange(next);
  };

  const handleTagToggle = (tag: string) => {
    const next = new Set(selectedTags);
    if (next.has(tag)) {
      next.delete(tag);
    } else {
      next.add(tag);
    }
    onTagChange(next);
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between px-6 py-3 text-sm transition-colors border-b border-white/5 ${hasActiveFilters
          ? "bg-primary-500/10 text-primary-300"
          : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
      >
        <div className="flex items-center gap-2">
          <span>🔽</span>
          <span>{t('filter.title')}</span>
          {hasActiveFilters && (
            <span className="px-1.5 py-0.5 text-xs bg-primary-500 text-white rounded-full">
              {selectedCategories.size + selectedTags.size}
            </span>
          )}
        </div>
        <span
          className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>

      {/* Filter Content */}
      {isExpanded && (
        <div className="px-6 py-4 space-y-5 bg-black/20 backdrop-blur-sm shadow-inner">
          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  {t('filter.categories')}
                </h4>
                {selectedCategories.size > 0 && (
                  <button
                    onClick={() => onCategoryChange(new Set())}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {t('platformSelector.clear')}
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryToggle(category)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${selectedCategories.has(category)
                      ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                      : "bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10 hover:text-white hover:border-white/10"
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('filter.tags')} ({tags.length})
                </h4>
                {selectedTags.size > 0 && (
                  <button
                    onClick={() => onTagChange(new Set())}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {t('platformSelector.clear')}
                  </button>
                )}
              </div>

              {/* Tag Search */}
              {tags.length > 10 && (
                <input
                  type="text"
                  placeholder={t('filter.searchTags')}
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  className="w-full px-4 py-2 mb-3 text-xs bg-black/30 text-white border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder-slate-500"
                />
              )}

              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {/* Show selected tags first */}
                {Array.from(selectedTags).map((tag) => (
                  <button
                    key={`selected-${tag}`}
                    onClick={() => handleTagToggle(tag)}
                    className="px-3 py-1 text-xs rounded-full bg-primary-500/20 text-primary-300 border border-primary-500/30 hover:bg-primary-500/30 transition-colors"
                  >
                    {tag} ✕
                  </button>
                ))}
                {/* Then show filtered tags (excluding already selected) */}
                {filteredTags
                  .filter((t) => !selectedTags.has(t))
                  .map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className="px-3 py-1 text-xs rounded-full bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10 hover:text-white hover:border-white/10 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                {filteredTags.length === 0 && tagSearch && (
                  <span className="text-xs text-gray-400">{t('filter.noTagsMatch', { query: tagSearch })}</span>
                )}
              </div>

              {tags.length > 20 && !tagSearch && (
                <p className="text-xs text-gray-400 mt-2">
                  {t('filter.showingTags', { total: tags.length })}
                </p>
              )}
            </div>
          )}

          {/* Clear All Button */}
          {hasActiveFilters && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClear}
                className="w-full px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                {t('filter.clearAll')}
              </button>
            </div>
          )}

          {/* No filters available */}
          {categories.length === 0 && tags.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-2">
              {t('filter.noFilters')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

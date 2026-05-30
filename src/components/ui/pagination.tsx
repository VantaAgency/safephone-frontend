"use client";

import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number; // 1-indexed for display
  pageSize: number;
  currentCount: number; // number of items on the current page
  onPageChange: (nextPage: number) => void;
  isLoading?: boolean;
  /** Optional total count when the API exposes it; enables jump-to-last-page. */
  totalCount?: number;
  /** "fr" | "en" — keeps the component framework-agnostic. */
  lang?: "fr" | "en";
}

/**
 * Minimal Prev / Next paginator. Backend endpoints expose limit+offset but
 * not total count, so "Next" is greyed out heuristically: if the current
 * page is full (currentCount === pageSize) we assume there might be more.
 *
 * Use as a footer beneath any tabular list in admin to navigate forward
 * through pages of 20+ entries.
 */
export function Pagination({
  page,
  pageSize,
  currentCount,
  onPageChange,
  isLoading = false,
  totalCount,
  lang = "fr",
}: PaginationProps) {
  const canPrev = page > 1 && !isLoading;
  const hasMore = currentCount === pageSize; // optimistic
  const canNext = hasMore && !isLoading;

  const pageLabel = lang === "fr" ? "Page" : "Page";
  const prevLabel = lang === "fr" ? "Précédent" : "Previous";
  const nextLabel = lang === "fr" ? "Suivant" : "Next";

  // Hide entirely when there's only one (incomplete) page and no prior pages.
  if (page === 1 && !hasMore) return null;

  return (
    <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="font-medium text-indigo-950">
          {pageLabel} {page}
        </span>
        {typeof totalCount === "number" && totalCount > 0 && (
          <span className="text-xs text-slate-400">
            · {currentCount} / {totalCount}
          </span>
        )}
        {typeof totalCount !== "number" && currentCount > 0 && (
          <span className="text-xs text-slate-400">
            · {currentCount} {lang === "fr" ? "résultats" : "results"}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
        >
          ← {prevLabel}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
        >
          {nextLabel} →
        </Button>
      </div>
    </div>
  );
}

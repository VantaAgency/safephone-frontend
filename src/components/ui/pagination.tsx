"use client";

import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number; // 1-indexed for display
  hasNextPage: boolean;
  currentCount: number; // number of items on the current page
  onPageChange: (nextPage: number) => void;
  isLoading?: boolean;
  lang?: "fr" | "en";
}

export function Pagination({
  page,
  hasNextPage,
  currentCount,
  onPageChange,
  isLoading = false,
  lang = "fr",
}: PaginationProps) {
  const canPrev = page > 1 && !isLoading;
  const canNext = hasNextPage && !isLoading;

  const prevLabel = lang === "fr" ? "Précédent" : "Previous";
  const nextLabel = lang === "fr" ? "Suivant" : "Next";

  if (page === 1 && !hasNextPage) return null;

  return (
    <nav aria-label="Pagination" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm">
      <div className="flex items-center gap-2" aria-live="polite">
        <span className="font-medium text-indigo-950">
          Page {page}
        </span>
        {currentCount > 0 && (
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
    </nav>
  );
}

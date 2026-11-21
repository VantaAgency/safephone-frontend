"use client";

import { useState } from "react";

export function usePagination(pageSize = 20) {
  const [page, setPage] = useState(1);
  const offset = (page - 1) * pageSize;

  return {
    // One extra row determines whether there is a next page.
    params: { limit: pageSize + 1, offset },
    setPage,
    items: <T>(rows?: T[]) => rows?.slice(0, pageSize) ?? [],
    controls: (rows?: unknown[], isLoading = false) => ({
      page,
      currentCount: Math.min(rows?.length ?? 0, pageSize),
      hasNextPage: (rows?.length ?? 0) > pageSize,
      isLoading,
      onPageChange: setPage,
    }),
  };
}

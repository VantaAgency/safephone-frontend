"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { dashboard } from "../endpoints";
import type { MemberDashboardSummary, PaginationParams } from "../types";

export function useMemberDashboardSummary(params?: PaginationParams, { enabled = true }: { enabled?: boolean } = {}) {
  return useQuery<MemberDashboardSummary>({
    queryKey: ["dashboard", "summary", params],
    queryFn: () => dashboard.summary(params),
    placeholderData: keepPreviousData,
    enabled,
    staleTime: 60 * 1000,
  });
}

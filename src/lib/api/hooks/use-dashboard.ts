"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboard } from "../endpoints";
import type { MemberDashboardSummary } from "../types";

export function useMemberDashboardSummary({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery<MemberDashboardSummary>({
    queryKey: ["dashboard", "summary"],
    queryFn: () => dashboard.summary(),
    enabled,
    staleTime: 60 * 1000,
  });
}

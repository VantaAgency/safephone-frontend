"use client";

import { useQuery } from "@tanstack/react-query";
import { plans } from "../endpoints";
import type { Plan } from "../types";
import { DEVELOPMENT_TEST_PLAN_SLUG, isDevelopmentRuntime } from "@/lib/plans";

export function usePlans({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery<Plan[]>({
    queryKey: ["plans"],
    queryFn: async () => {
      const result = await plans.list();
      if (isDevelopmentRuntime()) {
        return result;
      }
      return result.filter((plan) => plan.slug !== DEVELOPMENT_TEST_PLAN_SLUG);
    },
    enabled,
    staleTime: 30 * 60 * 1000,
  });
}

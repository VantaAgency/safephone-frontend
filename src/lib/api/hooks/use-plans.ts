"use client";

import { useQuery } from "@tanstack/react-query";
import { plans } from "../endpoints";
import type { Plan } from "../types";

export function usePlans() {
  return useQuery<Plan[]>({
    queryKey: ["plans"],
    queryFn: () => plans.list(),
  });
}

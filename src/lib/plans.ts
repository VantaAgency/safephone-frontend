import type { Plan } from "@/lib/api/types";

export const DEVELOPMENT_TEST_PLAN_SLUG = "test-plan-dev";

export function isDevelopmentPlan(plan: Plan): boolean {
  return plan.slug === DEVELOPMENT_TEST_PLAN_SLUG;
}

export function isDevelopmentRuntime(): boolean {
  return process.env.NODE_ENV !== "production";
}

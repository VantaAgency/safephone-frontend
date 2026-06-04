"use client";

import { cn } from "@/lib/utils";

export interface StepDef {
  key: string;
  label: string;
}

interface StepperProps {
  steps: StepDef[];
  current: number;
  /** Allow jumping back to an already-completed step. */
  onStepClick?: (index: number) => void;
}

// Horizontal numbered step indicator. Past steps show a check and are
// clickable (to edit), the current step is filled, upcoming steps are
// muted. Labels hide on very small screens to keep the row compact.
export function Stepper({ steps, current, onStepClick }: StepperProps) {
  return (
    <ol className="flex items-center">
      {steps.map((step, idx) => {
        const isDone = idx < current;
        const isCurrent = idx === current;
        const clickable = isDone && !!onStepClick;
        return (
          <li
            key={step.key}
            className={cn("flex items-center", idx < steps.length - 1 && "flex-1")}
          >
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick(idx)}
              className={cn(
                "flex items-center gap-2",
                clickable && "cursor-pointer",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-colors",
                  isCurrent && "border-indigo-950 bg-indigo-950 text-white",
                  isDone &&
                    "border-indigo-950 bg-white text-indigo-950",
                  !isDone &&
                    !isCurrent &&
                    "border-slate-200 bg-white text-slate-400",
                )}
              >
                {isDone ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </span>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:inline",
                  isCurrent ? "text-indigo-950" : "text-slate-500",
                )}
              >
                {step.label}
              </span>
            </button>
            {idx < steps.length - 1 && (
              <span
                className={cn(
                  "mx-2 h-px flex-1 transition-colors",
                  idx < current ? "bg-indigo-950" : "bg-slate-200",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

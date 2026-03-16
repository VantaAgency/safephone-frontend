import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "full" | "icon";
  dark?: boolean;
  className?: string;
}

export function Logo({ variant = "full", dark = false, className }: LogoProps) {
  const shieldIcon = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-yellow-500"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-2 7-2 2.89 0 4.87 1 6.82 2.12A1 1 0 0 1 20 6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );

  if (variant === "icon") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        {shieldIcon}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {shieldIcon}
      <span
        className={cn(
          "text-lg font-medium tracking-tighter",
          dark ? "text-white" : "text-indigo-950"
        )}
      >
        SAFEPHONE
      </span>
    </div>
  );
}

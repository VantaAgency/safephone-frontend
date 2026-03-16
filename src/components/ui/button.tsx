import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-yellow-400 text-indigo-950 font-medium hover:bg-yellow-500 shadow-sm hover:shadow-[0_4px_14px_rgba(250,204,21,0.2)] active:scale-[0.98] transition-all",
  secondary:
    "bg-indigo-950 text-white font-medium hover:bg-indigo-900 shadow-sm active:scale-[0.98] transition-all",
  outline:
    "border border-slate-200 text-indigo-950 font-medium bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all",
  ghost:
    "text-slate-500 font-medium hover:text-indigo-950 hover:bg-slate-50 transition-colors",
  danger:
    "bg-red-600 text-white font-medium hover:bg-red-700 shadow-sm active:scale-[0.98] transition-all",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm rounded-full",
  md: "px-5 py-2.5 text-sm rounded-full",
  lg: "px-8 py-3.5 text-sm rounded-full",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, fullWidth, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

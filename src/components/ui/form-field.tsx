import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

interface FormFieldProps {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormField({ label, hint, error, className, children }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-sm font-medium text-indigo-950">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-slate-400">{hint}</p>
      )}
      {error && (
        <p className="text-xs font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-xl border bg-white px-4 py-3 text-sm text-indigo-950",
          "placeholder:text-slate-400",
          "transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
          error
            ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
            : "border-slate-200 hover:border-slate-300",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-xl border bg-white px-4 py-3 text-sm text-indigo-950 resize-none",
          "placeholder:text-slate-400",
          "transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
          error
            ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
            : "border-slate-200 hover:border-slate-300",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  children: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "w-full rounded-xl border bg-white px-4 py-3 text-sm text-indigo-950 appearance-none",
          "transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
          error
            ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
            : "border-slate-200 hover:border-slate-300",
          className
        )}
        {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";

import { cn } from "@/lib/utils";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icons";
import { forwardRef, useState, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

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
        <p className="rounded-lg border border-red-200/80 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormErrorAlert({
  title = "Veuillez verifier le formulaire",
  message,
}: {
  title?: string;
  message: string;
}) {
  return (
    <div className="rounded-2xl border border-red-200/70 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
      <p className="font-semibold">{title}</p>
      <p className="mt-1">{message}</p>
    </div>
  );
}

export function FormSuccessAlert({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">
      <p className="font-semibold">{title}</p>
      <p className="mt-1">{message}</p>
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

interface PasswordInputProps extends Omit<InputProps, "type"> {
  toggleLabel?: string;
  hideLabel?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      error,
      className,
      toggleLabel = "Afficher le mot de passe",
      hideLabel = "Masquer le mot de passe",
      ...props
    },
    ref
  ) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          error={error}
          className={cn("pr-12", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute inset-y-0 right-3 flex items-center text-slate-400 transition-colors hover:text-indigo-700"
          aria-label={visible ? hideLabel : toggleLabel}
          title={visible ? hideLabel : toggleLabel}
        >
          {visible ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

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

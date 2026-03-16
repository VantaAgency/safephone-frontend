import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  label?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
}

export function SectionHeader({ label, title, subtitle, align = "center", dark = false, className }: SectionHeaderProps) {
  return (
    <div className={cn(align === "center" ? "text-center" : "text-left", "mb-12 md:mb-16", className)}>
      {label && (
        <div className={cn(
          "mb-6 inline-flex items-center px-3 py-1.5 rounded-full border shadow-sm backdrop-blur-sm",
          dark
            ? "border-indigo-800 bg-indigo-900/50 text-indigo-300"
            : "border-slate-200/80 bg-white text-slate-500"
        )}>
          <span className="text-xs font-medium tracking-wider uppercase">{label}</span>
        </div>
      )}
      <h2
        className={cn(
          "text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight",
          dark ? "text-white" : "text-indigo-950"
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mt-5 text-base leading-relaxed max-w-2xl",
            align === "center" && "mx-auto",
            dark ? "text-indigo-200" : "text-slate-500"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

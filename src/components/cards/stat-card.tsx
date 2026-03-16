import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  className?: string;
  variant?: "default" | "dark";
}

export function StatCard({ label, value, icon, trend, className, variant = "default" }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        variant === "dark"
          ? "border-indigo-800/30 bg-indigo-950/40"
          : "border-slate-200/80 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={cn(
            "text-[10px] font-medium uppercase tracking-wider",
            variant === "dark" ? "text-indigo-300" : "text-slate-400"
          )}>
            {label}
          </p>
          <p className={cn(
            "mt-1.5 text-xl font-medium tracking-tight",
            variant === "dark" ? "text-white" : "text-indigo-950"
          )}>
            {value}
          </p>
          {trend && (
            <p className="mt-1 text-xs font-medium text-green-500">{trend}</p>
          )}
        </div>
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl",
          variant === "dark" ? "bg-white/5 border border-white/10" : "bg-slate-50 border border-slate-100"
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}

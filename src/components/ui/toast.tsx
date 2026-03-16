"use client";

import { useState, useEffect, createContext, useContext, useCallback, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CheckCircleIcon, XIcon } from "@/components/ui/icons";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextValue {
  toast: (message: string, type?: Toast["type"]) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm transition-all",
        toast.type === "success" && "border-emerald-200/60 bg-white text-emerald-600",
        toast.type === "error" && "border-red-200/60 bg-white text-red-600",
        toast.type === "info" && "border-indigo-200/60 bg-white text-indigo-600"
      )}
    >
      <CheckCircleIcon size={18} />
      <span className="text-sm font-medium text-indigo-950">{toast.message}</span>
      <button onClick={() => onDismiss(toast.id)} className="ml-2 cursor-pointer text-slate-400 hover:text-indigo-950">
        <XIcon size={14} />
      </button>
    </div>
  );
}

"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { RebuildResult } from "@/lib/deploy";
import { cn } from "@/lib/utils";

interface Toast {
  id: number;
  message: string;
  tone: "success" | "error" | "info";
}

interface ToastContextValue {
  toast: (message: string, tone?: Toast["tone"]) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Small bottom-right notifications ("Saved", "Something went wrong"). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list, { id, message, tone }]);
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), tone === "error" ? 6000 : 3000);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-end gap-2 sm:left-auto" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto max-w-sm rounded-md px-4 py-2.5 text-sm text-pretty shadow-lg",
              t.tone === "success" && "bg-neutral-900 text-white",
              t.tone === "error" && "bg-red-600 text-white",
              t.tone === "info" && "bg-white text-neutral-900 ring-1 ring-neutral-200",
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx.toast;
}

/**
 * Confirms a change to public content. Visitors only see it once GitHub has
 * rebuilt the site, so a rebuild that could not be started shows as an error.
 * Pass `null` instead of a confirmation to stay quiet when the rebuild starts.
 */
export function useRebuildToast() {
  const toast = useToast();
  return useCallback(
    (done: string | null, rebuild: RebuildResult) => {
      const message = done ? `${done}. ${rebuild.message}` : rebuild.message;
      if (!rebuild.triggered) toast(message, "error");
      else if (done) toast(message);
    },
    [toast],
  );
}

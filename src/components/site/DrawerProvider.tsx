"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

interface DrawerContextValue {
  open: boolean;
  openDrawer: (trigger?: HTMLElement | null) => void;
  closeDrawer: () => void;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

/** Shares the "is the profile drawer open" state between Header and ProfileDrawer. */
export function DrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  const openDrawer = useCallback((trigger?: HTMLElement | null) => {
    triggerRef.current = trigger ?? (document.activeElement as HTMLElement | null);
    setOpen(true);
  }, []);
  const closeDrawer = useCallback(() => setOpen(false), []);

  const value = useMemo(() => ({ open, openDrawer, closeDrawer, triggerRef }), [open, openDrawer, closeDrawer]);
  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
}

export function useDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("useDrawer must be used inside DrawerProvider");
  return ctx;
}

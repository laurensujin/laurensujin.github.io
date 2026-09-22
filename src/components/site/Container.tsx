import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Standard horizontal padding and max width for public pages. */
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[80rem] px-6 md:px-10", className)}>{children}</div>;
}

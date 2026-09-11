"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "./ui";

interface Props {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  tone?: "danger" | "primary";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Modal confirmation, used before deleting things. */
export function ConfirmDialog({ open, title, description, confirmLabel = "Confirm", tone = "danger", loading, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onCancel}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-lg border border-neutral-200 bg-white p-0 shadow-xl backdrop:bg-neutral-900/40"
    >
      <div className="p-6">
        <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
        {description ? <div className="mt-2 text-sm text-neutral-600">{description}</div> : null}
        <div className="mt-6 flex justify-end gap-2">
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}

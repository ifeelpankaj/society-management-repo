"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type ConfirmReasonDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  reason: string;
  onReasonChange: (value: string) => void;
  reasonLabel?: string;
  reasonRequired?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
};

export function ConfirmReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  reason,
  onReasonChange,
  reasonLabel = "Reason",
  reasonRequired = false,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  busy = false,
  onConfirm,
}: ConfirmReasonDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <div className="space-y-2">
          <p className="font-medium text-sm">
            {reasonLabel}
            {reasonRequired ? " (required)" : " (optional)"}
          </p>
          <Input
            aria-label={reasonLabel}
            onChange={(event) => onReasonChange(event.target.value)}
            placeholder="Enter a reason"
            value={reason}
          />
        </div>
        <DialogFooter>
          <Button
            disabled={busy}
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            {cancelLabel}
          </Button>
          <Button
            disabled={busy || (reasonRequired && !reason.trim())}
            onClick={onConfirm}
            type="button"
            variant={destructive ? "destructive" : "default"}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

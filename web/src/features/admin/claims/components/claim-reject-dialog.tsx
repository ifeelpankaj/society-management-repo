"use client";

import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ModelsFlatClaimResponse } from "@/lib/api/generated-api";

import { claimLabel, flatLabel } from "./claims-table-columns";

type FormSubmitEvent = Parameters<
  NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

type ClaimRejectDialogProps = {
  isRejecting: boolean;
  onOpenChange: (open: boolean) => void;
  onReject: (event: FormSubmitEvent) => void | Promise<void>;
  onRejectReasonChange: (value: string) => void;
  open: boolean;
  rejectReason: string;
  rejectingClaim: ModelsFlatClaimResponse | null;
};

export function ClaimRejectDialog({
  isRejecting,
  onOpenChange,
  onReject,
  onRejectReasonChange,
  open,
  rejectReason,
  rejectingClaim,
}: ClaimRejectDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject claim?</DialogTitle>
          <DialogDescription>
            Add the reason for rejecting {claimLabel(rejectingClaim)} on{" "}
            {flatLabel(rejectingClaim)}.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onReject}>
          <label className="space-y-2">
            <span className="font-medium text-sm">Reason</span>
            <textarea
              className="min-h-28 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              disabled={isRejecting}
              onChange={(event) => onRejectReasonChange(event.target.value)}
              placeholder="Explain why this claim is being rejected"
              value={rejectReason}
            />
          </label>
          <DialogFooter>
            <Button
              disabled={isRejecting}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isRejecting} type="submit" variant="destructive">
              {isRejecting ? "Rejecting..." : "Reject claim"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

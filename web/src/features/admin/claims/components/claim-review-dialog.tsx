"use client";

import type { ComponentProps } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ModelsFlatClaimResponse } from "@/lib/api/generated-api";
import { titleCaseFromSnake } from "@/lib/format";

import { ClaimRejectDialog } from "./claim-reject-dialog";
import { ClaimReviewDetails } from "./claim-review-details";
import { claimLabel, flatLabel } from "./claims-table-columns";

type FormSubmitEvent = Parameters<
  NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

type ClaimReviewDialogProps = {
  actionInProgress: boolean;
  detailQuery: {
    isError: boolean;
    isLoading: boolean;
    refetch: () => void;
  };
  isRejecting: boolean;
  onApprove: (claim: ModelsFlatClaimResponse) => void;
  onOpenChange: (open: boolean) => void;
  onReject: (event: FormSubmitEvent) => void | Promise<void>;
  onRejectOpenChange: (open: boolean) => void;
  onRejectReasonChange: (value: string) => void;
  onStartReject: (claim: ModelsFlatClaimResponse) => void;
  open: boolean;
  rejectOpen: boolean;
  rejectReason: string;
  rejectingClaim: ModelsFlatClaimResponse | null;
  selectedClaim: ModelsFlatClaimResponse | null | undefined;
};

export function ClaimReviewDialog({
  actionInProgress,
  detailQuery,
  isRejecting,
  onApprove,
  onOpenChange,
  onReject,
  onRejectOpenChange,
  onRejectReasonChange,
  onStartReject,
  open,
  rejectOpen,
  rejectReason,
  rejectingClaim,
  selectedClaim,
}: ClaimReviewDialogProps) {
  return (
    <>
      <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogContent className="top-0 right-0 left-auto h-dvh max-h-dvh w-full max-w-xl translate-x-0 translate-y-0 overflow-y-auto rounded-none sm:max-w-xl">
          <DialogHeader className="pr-8">
            <DialogTitle>{claimLabel(selectedClaim)}</DialogTitle>
            <DialogDescription>
              {selectedClaim
                ? `${flatLabel(selectedClaim)} - ${titleCaseFromSnake(selectedClaim.status)}`
                : "Loading claim details"}
            </DialogDescription>
          </DialogHeader>

          {detailQuery.isLoading ? (
            <div className="flex min-h-72 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground text-sm">
              Loading claim details...
            </div>
          ) : detailQuery.isError || !selectedClaim ? (
            <EmptyState
              action={
                <Button onClick={() => detailQuery.refetch()} type="button">
                  Retry
                </Button>
              }
              description="Refresh the claim details and try again."
              title="Could not load claim"
            />
          ) : (
            <ClaimReviewDetails
              actionInProgress={actionInProgress}
              claim={selectedClaim}
              onApprove={onApprove}
              onStartReject={onStartReject}
            />
          )}
        </DialogContent>
      </Dialog>

      <ClaimRejectDialog
        isRejecting={isRejecting}
        onOpenChange={onRejectOpenChange}
        onReject={onReject}
        onRejectReasonChange={onRejectReasonChange}
        open={rejectOpen}
        rejectReason={rejectReason}
        rejectingClaim={rejectingClaim}
      />
    </>
  );
}

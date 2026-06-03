"use client";

import { useEffect, useMemo, useState } from "react";

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

type ActivateSubscriptionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  busy?: boolean;
  onConfirm: (payload: { starts_at: string; ends_at: string }) => void;
};

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toRfc3339(date: Date) {
  return date.toISOString();
}

export function ActivateSubscriptionDialog({
  open,
  onOpenChange,
  busy,
  onConfirm,
}: ActivateSubscriptionDialogProps) {
  const defaults = useMemo(() => {
    const now = new Date();
    return {
      starts_at: toRfc3339(now),
      ends_at: toRfc3339(addDays(now, 30)),
    };
  }, []);

  const [startsAt, setStartsAt] = useState(defaults.starts_at);
  const [endsAt, setEndsAt] = useState(defaults.ends_at);

  useEffect(() => {
    if (!open) return;
    setStartsAt(defaults.starts_at);
    setEndsAt(defaults.ends_at);
  }, [open, defaults.ends_at, defaults.starts_at]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Activate subscription</DialogTitle>
          <DialogDescription>
            Set subscription start and end timestamps (RFC3339).
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="space-y-2">
            <label
              className="font-medium text-sm"
              htmlFor="subscription-starts-at"
            >
              Starts at
            </label>
            <Input
              disabled={busy}
              id="subscription-starts-at"
              onChange={(event) => setStartsAt(event.target.value)}
              placeholder="2026-01-01T00:00:00.000Z"
              value={startsAt}
            />
          </div>
          <div className="space-y-2">
            <label
              className="font-medium text-sm"
              htmlFor="subscription-ends-at"
            >
              Ends at
            </label>
            <Input
              disabled={busy}
              id="subscription-ends-at"
              onChange={(event) => setEndsAt(event.target.value)}
              placeholder="2026-02-01T00:00:00.000Z"
              value={endsAt}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            disabled={busy}
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={busy || !startsAt.trim() || !endsAt.trim()}
            onClick={() =>
              onConfirm({ starts_at: startsAt.trim(), ends_at: endsAt.trim() })
            }
            type="button"
          >
            {busy ? "Activating..." : "Activate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

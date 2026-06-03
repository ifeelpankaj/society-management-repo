"use client";

import type { FormEvent } from "react";

import { FilterSelect } from "@/components/forms/filter-select";
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
import type { ModelsFlatStatus } from "@/lib/api/generated-api";

export type FlatsEditFormValues = {
  flatNumber: string;
  block: string;
  floor: string;
  status: ModelsFlatStatus;
  isActive: boolean;
};

type EditFlatDialogProps = {
  block: string;
  flatNumber: string;
  floor: string;
  isActive: string;
  isUpdating: boolean;
  onBlockChange: (value: string) => void;
  onFlatNumberChange: (value: string) => void;
  onFloorChange: (value: string) => void;
  onIsActiveChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (value: ModelsFlatStatus) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  open: boolean;
  status: ModelsFlatStatus;
};

export function EditFlatDialog({
  block,
  flatNumber,
  floor,
  isActive,
  isUpdating,
  onBlockChange,
  onFlatNumberChange,
  onFloorChange,
  onIsActiveChange,
  onOpenChange,
  onStatusChange,
  onSubmit,
  open,
  status,
}: EditFlatDialogProps) {
  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onOpenChange(false);
      }}
      open={open}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update flat</DialogTitle>
          <DialogDescription>
            Edit inventory details and operational status.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="edit-flat-number">
              Flat number
            </label>
            <Input
              disabled={isUpdating}
              id="edit-flat-number"
              onChange={(event) => onFlatNumberChange(event.target.value)}
              value={flatNumber}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="font-medium text-sm" htmlFor="edit-flat-block">
                Block
              </label>
              <Input
                disabled={isUpdating}
                id="edit-flat-block"
                onChange={(event) => onBlockChange(event.target.value)}
                value={block}
              />
            </div>
            <div className="space-y-2">
              <label className="font-medium text-sm" htmlFor="edit-flat-floor">
                Floor
              </label>
              <Input
                disabled={isUpdating}
                id="edit-flat-floor"
                onChange={(event) => onFloorChange(event.target.value)}
                value={floor}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="font-medium text-sm" htmlFor="edit-flat-status">
                Status
              </label>
              <FilterSelect
                disabled={isUpdating}
                id="edit-flat-status"
                onChange={(event) =>
                  onStatusChange(event.target.value as ModelsFlatStatus)
                }
                options={[
                  { label: "Vacant", value: "vacant" },
                  { label: "Occupied", value: "occupied" },
                  { label: "Blocked", value: "blocked" },
                ]}
                value={status}
              />
            </div>
            <div className="space-y-2">
              <label className="font-medium text-sm" htmlFor="edit-flat-active">
                Active state
              </label>
              <FilterSelect
                disabled={isUpdating}
                id="edit-flat-active"
                onChange={(event) => onIsActiveChange(event.target.value)}
                options={[
                  { label: "Active", value: "true" },
                  { label: "Inactive", value: "false" },
                ]}
                value={isActive}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={isUpdating}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isUpdating} type="submit">
              {isUpdating ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

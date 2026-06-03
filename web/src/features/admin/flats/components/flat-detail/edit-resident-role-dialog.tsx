"use client";

import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  ModelsFlatResidentResponse,
  ModelsFlatResidentRole,
} from "@/lib/api/generated-api";

import {
  residentName,
  residentRoles,
  selectClassName,
  titleCase,
} from "./flat-detail-utils";

type EditResidentRoleDialogProps = {
  isUpdating: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleChange: (role: ModelsFlatResidentRole) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  open: boolean;
  resident: ModelsFlatResidentResponse | null;
  role: ModelsFlatResidentRole;
};

export function EditResidentRoleDialog({
  isUpdating,
  onOpenChange,
  onRoleChange,
  onSubmit,
  open,
  resident,
  role,
}: EditResidentRoleDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update resident role</DialogTitle>
          <DialogDescription>
            Change the flat role for{" "}
            {resident ? residentName(resident) : "resident"}.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="space-y-2">
            <span className="font-medium text-sm">Flat role</span>
            <select
              className={selectClassName}
              disabled={isUpdating}
              onChange={(event) =>
                onRoleChange(event.target.value as ModelsFlatResidentRole)
              }
              value={role}
            >
              {residentRoles.map((item) => (
                <option key={item} value={item}>
                  {titleCase(item)}
                </option>
              ))}
            </select>
          </label>
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
              {isUpdating ? "Saving..." : "Save role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

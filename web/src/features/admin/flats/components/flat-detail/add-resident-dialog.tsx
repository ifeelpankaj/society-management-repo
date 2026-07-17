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
import { Input } from "@/components/ui/input";
import type {
  ModelsFlatResidentRole,
  ModelsSocietyMemberResponse,
} from "@/lib/api/generated-api";

import {
  memberName,
  residentRoles,
  selectClassName,
  titleCase,
} from "./flat-detail-utils";

export type AddResidentFormValues = {
  userId: number;
  role: ModelsFlatResidentRole;
  isPrimary: boolean;
};

type AddResidentDialogProps = {
  addPrimary: boolean;
  addRole: ModelsFlatResidentRole;
  isAddingResident: boolean;
  memberSearch: string;
  members: ModelsSocietyMemberResponse[];
  membersQuery: { isFetching: boolean };
  onAddPrimaryChange: (value: boolean) => void;
  onAddRoleChange: (value: ModelsFlatResidentRole) => void;
  onMemberSearchChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onSelectedUserIdChange: (value: string) => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
    values: AddResidentFormValues,
  ) => void;
  open: boolean;
  selectedUserId: string;
};

export function AddResidentDialog({
  addPrimary,
  addRole,
  isAddingResident,
  memberSearch,
  members,
  membersQuery,
  onAddPrimaryChange,
  onAddRoleChange,
  onMemberSearchChange,
  onOpenChange,
  onSelectedUserIdChange,
  onSubmit,
  open,
  selectedUserId,
}: AddResidentDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add resident</DialogTitle>
          <DialogDescription>
            Select an active society member and assign a flat role.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) =>
            onSubmit(event, {
              userId: Number.parseInt(selectedUserId, 10),
              role: addRole,
              isPrimary: addPrimary,
            })
          }
        >
          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="member-search">
              Search members
            </label>
            <Input
              id="member-search"
              onChange={(event) => {
                onMemberSearchChange(event.target.value);
                onSelectedUserIdChange("");
              }}
              placeholder="Name, email, or phone"
              value={memberSearch}
            />
          </div>
          <label className="space-y-2">
            <span className="font-medium text-sm">Member</span>
            <select
              className={selectClassName}
              disabled={membersQuery.isFetching || members.length === 0}
              onChange={(event) => onSelectedUserIdChange(event.target.value)}
              value={selectedUserId}
            >
              <option value="">
                {membersQuery.isFetching
                  ? "Loading members..."
                  : "Select member"}
              </option>
              {members.map((member) =>
                member.user_id ? (
                  <option key={member.user_id} value={member.user_id}>
                    {memberName(member)}
                  </option>
                ) : null,
              )}
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="font-medium text-sm">Flat role</span>
              <select
                className={selectClassName}
                onChange={(event) =>
                  onAddRoleChange(event.target.value as ModelsFlatResidentRole)
                }
                value={addRole}
              >
                {residentRoles.map((role) => (
                  <option key={role} value={role}>
                    {titleCase(role)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
              <input
                checked={addPrimary}
                className="size-4 accent-primary"
                onChange={(event) => onAddPrimaryChange(event.target.checked)}
                type="checkbox"
              />
              Primary resident
            </label>
          </div>
          <DialogFooter>
            <Button
              disabled={isAddingResident}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={isAddingResident || !selectedUserId}
              type="submit"
            >
              {isAddingResident ? "Adding..." : "Add resident"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { Ban, Crown, RefreshCw, Trash2, UserCog } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  ModelsSocietyMemberResponse,
  ModelsSocietyMemberRole,
} from "@/lib/api/generated-api";
import {
  useDeleteV1SocietiesBySocietyIdMembersAndUserIdCustomMutation,
  usePatchV1SocietiesBySocietyIdMembersAndUserIdRoleCustomMutation,
  usePostV1SocietiesBySocietyIdMembersAndUserIdReactivateCustomMutation,
  usePostV1SocietiesBySocietyIdMembersAndUserIdSuspendCustomMutation,
  usePostV1SocietiesBySocietyIdTransferOwnershipCustomMutation,
} from "@/lib/api/society-members-api";
import { getApiErrorMessage, getApiMessage } from "@/lib/api-message";

const roles: ModelsSocietyMemberRole[] = [
  "owner",
  "admin",
  "staff",
  "resident",
];

function memberName(member: ModelsSocietyMemberResponse) {
  return (
    member.user_full_name || member.user_email || `User #${member.user_id}`
  );
}

export function ResidentActions({
  societyId,
  member,
  onDone,
}: {
  societyId: number;
  member: ModelsSocietyMemberResponse;
  onDone?: () => void;
}) {
  const [roleOpen, setRoleOpen] = useState(false);
  const [nextRole, setNextRole] = useState<ModelsSocietyMemberRole>(
    member.role ?? "resident",
  );
  const [suspendReason, setSuspendReason] = useState("");
  const [removeReason, setRemoveReason] = useState("");
  const [suspendMember, { isLoading: isSuspending }] =
    usePostV1SocietiesBySocietyIdMembersAndUserIdSuspendCustomMutation();
  const [reactivateMember, { isLoading: isReactivating }] =
    usePostV1SocietiesBySocietyIdMembersAndUserIdReactivateCustomMutation();
  const [changeRole, { isLoading: isChangingRole }] =
    usePatchV1SocietiesBySocietyIdMembersAndUserIdRoleCustomMutation();
  const [removeMember, { isLoading: isRemoving }] =
    useDeleteV1SocietiesBySocietyIdMembersAndUserIdCustomMutation();
  const [transferOwnership, { isLoading: isTransferring }] =
    usePostV1SocietiesBySocietyIdTransferOwnershipCustomMutation();
  const busy =
    isSuspending ||
    isReactivating ||
    isChangingRole ||
    isRemoving ||
    isTransferring;
  const userId = member.user_id;
  const canAct = Boolean(userId);
  const inactive = member.status !== "active";

  async function runAction(
    label: string,
    fallback: string,
    action: () => Promise<{ message?: string }>,
  ) {
    const toastId = toast.loading(label);
    try {
      const response = await action();
      toast.success(getApiMessage(response, fallback), { id: toastId });
      onDone?.();
    } catch (error) {
      toast.error(getApiErrorMessage(error, fallback), { id: toastId });
    }
  }

  return (
    <div className="flex justify-end gap-1.5">
      {member.status === "suspended" || member.status === "removed" ? (
        <Button
          aria-label={`Reactivate ${memberName(member)}`}
          disabled={!canAct || busy}
          onClick={(event) => {
            event.stopPropagation();
            runAction("Reactivating member...", "Member reactivated.", () =>
              reactivateMember({ societyId, userId: userId ?? 0 }).unwrap(),
            );
          }}
          size="icon-sm"
          title="Reactivate member"
          type="button"
          variant="outline"
        >
          <RefreshCw className="size-4" />
        </Button>
      ) : (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              aria-label={`Suspend ${memberName(member)}`}
              disabled={!canAct || busy || member.status !== "active"}
              onClick={(event) => event.stopPropagation()}
              size="icon-sm"
              title="Suspend member"
              type="button"
              variant="outline"
            >
              <Ban className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogMedia>
                <Ban className="size-5" />
              </AlertDialogMedia>
              <AlertDialogTitle>Suspend {memberName(member)}?</AlertDialogTitle>
              <AlertDialogDescription>
                The member will lose active access until reactivated.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              onChange={(event) => setSuspendReason(event.target.value)}
              placeholder="Reason optional"
              value={suspendReason}
            />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  runAction("Suspending member...", "Member suspended.", () =>
                    suspendMember({
                      societyId,
                      userId: userId ?? 0,
                      reason: suspendReason.trim() || undefined,
                    }).unwrap(),
                  )
                }
              >
                Suspend
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <Button
        aria-label={`Change role for ${memberName(member)}`}
        disabled={!canAct || busy || inactive}
        onClick={(event) => {
          event.stopPropagation();
          setNextRole(member.role ?? "resident");
          setRoleOpen(true);
        }}
        size="icon-sm"
        title="Change member role"
        type="button"
        variant="ghost"
      >
        <UserCog className="size-4" />
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            aria-label={`Transfer ownership to ${memberName(member)}`}
            disabled={!canAct || busy || inactive || member.role === "owner"}
            onClick={(event) => event.stopPropagation()}
            size="icon-sm"
            title="Transfer ownership"
            type="button"
            variant="outline"
          >
            <Crown className="size-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Crown className="size-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>
              Transfer ownership to {memberName(member)}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will make this member the society owner.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                runAction(
                  "Transferring ownership...",
                  "Ownership transferred.",
                  () =>
                    transferOwnership({
                      societyId,
                      newOwnerUserId: userId ?? 0,
                    }).unwrap(),
                )
              }
            >
              Transfer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            aria-label={`Remove ${memberName(member)}`}
            disabled={!canAct || busy || member.role === "owner"}
            onClick={(event) => event.stopPropagation()}
            size="icon-sm"
            title="Remove member"
            type="button"
            variant="destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Trash2 className="size-5 text-destructive" />
            </AlertDialogMedia>
            <AlertDialogTitle>Remove {memberName(member)}?</AlertDialogTitle>
            <AlertDialogDescription>
              The member will be removed from this society.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            onChange={(event) => setRemoveReason(event.target.value)}
            placeholder="Reason optional"
            value={removeReason}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                runAction("Removing member...", "Member removed.", () =>
                  removeMember({
                    societyId,
                    userId: userId ?? 0,
                    reason: removeReason.trim() || undefined,
                  }).unwrap(),
                )
              }
              variant="destructive"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog onOpenChange={setRoleOpen} open={roleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change member role</DialogTitle>
            <DialogDescription>
              Update role for {memberName(member)}.
            </DialogDescription>
          </DialogHeader>
          <select
            className="h-8 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            onChange={(event) =>
              setNextRole(event.target.value as ModelsSocietyMemberRole)
            }
            value={nextRole}
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
          <DialogFooter>
            <Button
              onClick={() => setRoleOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={!canAct || busy}
              onClick={() =>
                runAction("Changing role...", "Member role changed.", () =>
                  changeRole({
                    societyId,
                    userId: userId ?? 0,
                    role: nextRole,
                  }).unwrap(),
                ).then(() => setRoleOpen(false))
              }
              type="button"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

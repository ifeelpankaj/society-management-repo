"use client";

import { Ban, Crown, RefreshCw, Trash2, UserCog } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ActionPanel,
  ConfirmReasonDialog,
  DangerZone,
} from "@/features/shared/detail-page";
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

const roleDescriptions: Record<ModelsSocietyMemberRole, string> = {
  owner: "Full control including ownership transfer and society deletion.",
  admin: "Manage members, flats, claims, and society settings.",
  staff: "Operational access for day-to-day society tasks.",
  resident: "Standard member access for flat and community features.",
};

function memberName(member: ModelsSocietyMemberResponse) {
  return (
    member.user_full_name || member.user_email || `User #${member.user_id}`
  );
}

type SocietyMemberLifecycleProps = {
  societyId: number;
  member: ModelsSocietyMemberResponse;
  onDone?: () => void;
};

export function SocietyMemberLifecycle({
  societyId,
  member,
  onDone,
}: SocietyMemberLifecycleProps) {
  const [roleOpen, setRoleOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
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
  const isSuspended =
    member.status === "suspended" || member.status === "removed";

  async function runAction(
    label: string,
    fallback: string,
    action: () => Promise<{ message?: string }>,
    onSuccess?: () => void,
  ) {
    const toastId = toast.loading(label);
    try {
      const response = await action();
      toast.success(getApiMessage(response, fallback), { id: toastId });
      onDone?.();
      onSuccess?.();
    } catch (error) {
      toast.error(getApiErrorMessage(error, fallback), { id: toastId });
    }
  }

  return (
    <>
      <ActionPanel
        description="Update how this person participates in the society."
        title="Access and role"
      >
        <Button
          disabled={!canAct || busy || inactive}
          onClick={() => {
            setNextRole(member.role ?? "resident");
            setRoleOpen(true);
          }}
          type="button"
          variant="outline"
        >
          <UserCog className="size-4" />
          Change role
        </Button>
        <Button
          disabled={!canAct || busy || inactive || member.role === "owner"}
          onClick={() => setTransferOpen(true)}
          type="button"
          variant="outline"
        >
          <Crown className="size-4" />
          Transfer ownership
        </Button>
      </ActionPanel>

      <ActionPanel
        description="Suspend to pause access, or reactivate when the member should return."
        title="Account status"
      >
        {isSuspended ? (
          <Button
            disabled={!canAct || busy}
            onClick={() =>
              runAction("Reactivating member...", "Member reactivated.", () =>
                reactivateMember({
                  societyId,
                  userId: userId ?? 0,
                }).unwrap(),
              )
            }
            type="button"
          >
            <RefreshCw className="size-4" />
            Reactivate member
          </Button>
        ) : (
          <Button
            disabled={!canAct || busy || member.status !== "active"}
            onClick={() => setSuspendOpen(true)}
            type="button"
            variant="outline"
          >
            <Ban className="size-4" />
            Suspend member
          </Button>
        )}
      </ActionPanel>

      <DangerZone>
        <p className="text-muted-foreground text-sm">
          Removing a member revokes their society access. This cannot be undone
          from the dashboard without adding them again.
        </p>
        <Button
          disabled={!canAct || busy || member.role === "owner"}
          onClick={() => setRemoveOpen(true)}
          type="button"
          variant="destructive"
        >
          <Trash2 className="size-4" />
          Remove from society
        </Button>
      </DangerZone>

      <Dialog onOpenChange={setRoleOpen} open={roleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change member role</DialogTitle>
            <DialogDescription>
              Update role for {memberName(member)}.
            </DialogDescription>
          </DialogHeader>
          <select
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-3 focus:ring-ring/20"
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
          <p className="text-muted-foreground text-sm">
            {roleDescriptions[nextRole]}
          </p>
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
                runAction(
                  "Changing role...",
                  "Member role changed.",
                  () =>
                    changeRole({
                      societyId,
                      userId: userId ?? 0,
                      role: nextRole,
                    }).unwrap(),
                  () => setRoleOpen(false),
                )
              }
              type="button"
            >
              Save role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmReasonDialog
        busy={busy}
        confirmLabel="Suspend"
        description="The member will lose active access until reactivated."
        onConfirm={() =>
          runAction("Suspending member...", "Member suspended.", () =>
            suspendMember({
              societyId,
              userId: userId ?? 0,
              reason: suspendReason.trim() || undefined,
            }).unwrap(),
          ).then(() => {
            setSuspendOpen(false);
            setSuspendReason("");
          })
        }
        onOpenChange={setSuspendOpen}
        onReasonChange={setSuspendReason}
        open={suspendOpen}
        reason={suspendReason}
        title={`Suspend ${memberName(member)}?`}
      />

      <ConfirmReasonDialog
        busy={busy}
        confirmLabel="Remove"
        description="The member will be removed from this society."
        destructive
        onConfirm={() =>
          runAction("Removing member...", "Member removed.", () =>
            removeMember({
              societyId,
              userId: userId ?? 0,
              reason: removeReason.trim() || undefined,
            }).unwrap(),
          ).then(() => {
            setRemoveOpen(false);
            setRemoveReason("");
          })
        }
        onOpenChange={setRemoveOpen}
        onReasonChange={setRemoveReason}
        open={removeOpen}
        reason={removeReason}
        title={`Remove ${memberName(member)}?`}
      />

      <ConfirmReasonDialog
        busy={busy}
        confirmLabel="Transfer ownership"
        description="This member will become the society owner."
        onConfirm={() =>
          runAction(
            "Transferring ownership...",
            "Ownership transferred.",
            () =>
              transferOwnership({
                societyId,
                newOwnerUserId: userId ?? 0,
              }).unwrap(),
            () => setTransferOpen(false),
          )
        }
        onOpenChange={setTransferOpen}
        onReasonChange={() => {}}
        open={transferOpen}
        reason=""
        title={`Transfer ownership to ${memberName(member)}?`}
      />
    </>
  );
}

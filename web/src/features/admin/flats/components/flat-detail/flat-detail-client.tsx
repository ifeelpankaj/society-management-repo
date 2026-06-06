"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { WorkspacePage } from "@/components/shared/workspace-page";
import { Button } from "@/components/ui/button";
import { useFlatDetail } from "@/features/admin/flats/hooks";
import type {
  ModelsFlatResidentRole,
  ModelsFlatStatus,
} from "@/lib/api/generated-api";

import { paths } from "@/lib/routes/paths";

import { FlatDetailDialogs } from "./flat-detail-dialogs";
import { FlatDetailHeader } from "./flat-detail-header";
import { FlatResidentsTable } from "./flat-residents-table";
import { FlatSummaryCard, flatLabel } from "./flat-summary-card";

type FlatDetailClientProps = {
  societyId: number;
  encodedSocietyId: string;
  flatId: number;
  backLabel?: string;
  flatsHref?: string;
  readOnly?: boolean;
  residentDetailHrefBase?: string;
};

export function FlatDetailClient({
  societyId,
  encodedSocietyId: _encodedSocietyId,
  flatId,
  backLabel,
  flatsHref: flatsHrefProp,
  readOnly = false,
  residentDetailHrefBase,
}: FlatDetailClientProps) {
  const flatsHref = flatsHrefProp ?? paths.flats(societyId);
  const resolveResidentHref = useCallback(
    (residentId: number) =>
      residentDetailHrefBase
        ? `${residentDetailHrefBase}/${residentId}`
        : paths.flatResidentDetail(societyId, flatId, residentId),
    [flatId, residentDetailHrefBase, societyId],
  );

  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [addRole, setAddRole] = useState<ModelsFlatResidentRole>("tenant");
  const [addPrimary, setAddPrimary] = useState(false);
  const [editFlatNumber, setEditFlatNumber] = useState("");
  const [editBlock, setEditBlock] = useState("");
  const [editFloor, setEditFloor] = useState("");
  const [editStatus, setEditStatus] = useState<ModelsFlatStatus>("vacant");
  const [editIsActive, setEditIsActive] = useState("true");

  const detail = useFlatDetail({ societyId, flatId, addOpen, memberSearch });

  useEffect(() => {
    if (!detail.flat || !editOpen) return;
    setEditFlatNumber(detail.flat.flat_number ?? "");
    setEditBlock(detail.flat.block ?? "");
    setEditFloor(detail.flat.floor ?? "");
    setEditStatus(detail.flat.status ?? "vacant");
    setEditIsActive(detail.flat.is_active === false ? "false" : "true");
  }, [editOpen, detail.flat]);

  useEffect(() => {
    if (!addOpen || selectedUserId) return;
    const firstUserId = detail.members.find(
      (member) => member.user_id,
    )?.user_id;
    if (firstUserId) setSelectedUserId(String(firstUserId));
  }, [addOpen, detail.members, selectedUserId]);

  if (detail.flatQuery.isLoading) {
    return (
      <WorkspacePage>
        <div className="flex min-h-80 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground text-sm">
          Loading flat...
        </div>
      </WorkspacePage>
    );
  }

  if (detail.flatQuery.isError || !detail.flat) {
    return (
      <WorkspacePage>
        <EmptyState
          action={
            <Button asChild>
              <Link href={flatsHref}>Back to flats</Link>
            </Button>
          }
          description="Go back to the flat directory and try again."
          title="Could not load flat"
        />
      </WorkspacePage>
    );
  }

  return (
    <WorkspacePage>
      <FlatDetailHeader
        backLabel={backLabel}
        busy={detail.busy}
        flat={detail.flat}
        flatsHref={flatsHref}
        isFetching={detail.flatQuery.isFetching}
        onBlockToggle={detail.handleBlockToggle}
        onDeactivate={() => setDeactivateOpen(true)}
        onEdit={() => setEditOpen(true)}
        onRefetch={detail.refetch}
        readOnly={readOnly}
      />

      <FlatSummaryCard flat={detail.flat} />

      <FlatResidentsTable
        buildResidentDetailHref={resolveResidentHref}
        onAddResident={readOnly ? undefined : () => setAddOpen(true)}
        onRefetch={detail.refetch}
        readOnly={readOnly}
        residents={detail.residents}
        residentsQuery={detail.residentsQuery}
      />

      {!readOnly ? (
        <>
          <ConfirmDialog
            confirmText="Deactivate"
            description="This removes the flat from active service. Existing records remain available if the API returns inactive flats."
            destructive
            onConfirm={() => detail.handleDeactivate()}
            onOpenChange={setDeactivateOpen}
            open={deactivateOpen}
            title={`Deactivate ${flatLabel(detail.flat)}?`}
          />

          <FlatDetailDialogs
            addOpen={addOpen}
            addPrimary={addPrimary}
            addRole={addRole}
            editBlock={editBlock}
            editFlatNumber={editFlatNumber}
            editFloor={editFloor}
            editIsActive={editIsActive}
            editOpen={editOpen}
            editStatus={editStatus}
            isAddingResident={detail.isAddingResident}
            isUpdating={detail.isUpdating}
            memberSearch={memberSearch}
            members={detail.members}
            membersQuery={detail.membersQuery}
            onAddPrimaryChange={setAddPrimary}
            onAddResident={detail.handleAddResident}
            onAddRoleChange={setAddRole}
            onEditBlockChange={setEditBlock}
            onEditFlatNumberChange={setEditFlatNumber}
            onEditFloorChange={setEditFloor}
            onEditIsActiveChange={setEditIsActive}
            onEditOpenChange={setEditOpen}
            onEditStatusChange={setEditStatus}
            onMemberSearchChange={setMemberSearch}
            onSelectedUserIdChange={setSelectedUserId}
            onUpdateFlat={detail.handleUpdateFlat}
            selectedUserId={selectedUserId}
            setAddOpen={setAddOpen}
          />
        </>
      ) : null}
    </WorkspacePage>
  );
}

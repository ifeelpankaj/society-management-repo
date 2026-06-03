"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";
import { useFlatDetail } from "@/features/admin/flats/hooks";
import type {
  ModelsFlatResidentResponse,
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
};

export function FlatDetailClient({
  societyId,
  encodedSocietyId: _encodedSocietyId,
  flatId,
}: FlatDetailClientProps) {
  const flatsHref = paths.flats(societyId);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [addRole, setAddRole] = useState<ModelsFlatResidentRole>("tenant");
  const [addPrimary, setAddPrimary] = useState(false);
  const [roleResident, setRoleResident] =
    useState<ModelsFlatResidentResponse | null>(null);
  const [nextResidentRole, setNextResidentRole] =
    useState<ModelsFlatResidentRole>("tenant");
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
      <PageShell background="tinted" className="min-h-full py-8">
        <main className="mx-auto w-full max-w-6xl">
          <div className="flex min-h-80 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground text-sm">
            Loading flat...
          </div>
        </main>
      </PageShell>
    );
  }

  if (detail.flatQuery.isError || !detail.flat) {
    return (
      <PageShell background="tinted" className="min-h-full py-8">
        <main className="mx-auto w-full max-w-6xl">
          <EmptyState
            action={
              <Button asChild>
                <Link href={flatsHref}>Back to flats</Link>
              </Button>
            }
            description="Go back to the flat directory and try again."
            title="Could not load flat"
          />
        </main>
      </PageShell>
    );
  }

  return (
    <PageShell background="tinted" className="min-h-full py-8">
      <main className="mx-auto w-full max-w-6xl space-y-6">
        <FlatDetailHeader
          busy={detail.busy}
          flat={detail.flat}
          flatsHref={flatsHref}
          isFetching={detail.flatQuery.isFetching}
          onBlockToggle={detail.handleBlockToggle}
          onDeactivate={() => setDeactivateOpen(true)}
          onEdit={() => setEditOpen(true)}
          onRefetch={detail.refetch}
        />

        <FlatSummaryCard flat={detail.flat} flatId={flatId} />

        <FlatResidentsTable
          busy={detail.busy}
          onAddResident={() => setAddOpen(true)}
          onEditRole={(resident) => {
            setRoleResident(resident);
            setNextResidentRole(resident.role ?? "tenant");
          }}
          onMoveOut={detail.handleMoveOutResident}
          onRefetch={detail.refetch}
          onRemove={detail.handleRemoveResident}
          onSetPrimary={detail.handleSetPrimaryResident}
          residents={detail.residents}
          residentsQuery={detail.residentsQuery}
        />

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
          isUpdatingResidentRole={detail.isUpdatingResidentRole}
          memberSearch={memberSearch}
          members={detail.members}
          membersQuery={detail.membersQuery}
          nextResidentRole={nextResidentRole}
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
          onUpdateRole={detail.handleUpdateResidentRole}
          roleResident={roleResident}
          selectedUserId={selectedUserId}
          setAddOpen={setAddOpen}
          setNextResidentRole={setNextResidentRole}
          setRoleResident={setRoleResident}
        />
      </main>
    </PageShell>
  );
}

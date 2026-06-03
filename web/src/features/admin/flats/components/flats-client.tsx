"use client";

import { Plus } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { PageShell } from "@/components/shared/page-shell";
import { RefreshButton } from "@/components/shared/refresh-button";
import { Button } from "@/components/ui/button";
import { FlatsDirectoryCard } from "@/features/admin/flats/components/flats-directory-card";
import { FlatsStatsCards } from "@/features/admin/flats/components/flats-stats-cards";
import { flatLabel } from "@/features/admin/flats/components/flats-table-columns";
import { useFlatMutations, useFlatsList } from "@/features/admin/flats/hooks";
import type {
  ModelsFlatResponse,
  ModelsFlatStatus,
} from "@/lib/api/generated-api";
import { paths } from "@/lib/routes/paths";

const EditFlatDialog = dynamic(
  () =>
    import("./edit-flat-dialog").then((module) => ({
      default: module.EditFlatDialog,
    })),
  { ssr: false },
);

type FlatsClientProps = {
  societyId: number;
  encodedSocietyId: string;
};

export function FlatsClient({
  societyId,
  encodedSocietyId: _encodedSocietyId,
}: FlatsClientProps) {
  const createHref = paths.flatCreate(societyId);
  const [editingFlat, setEditingFlat] = useState<ModelsFlatResponse | null>(
    null,
  );
  const [deactivatingFlat, setDeactivatingFlat] =
    useState<ModelsFlatResponse | null>(null);
  const [editFlatNumber, setEditFlatNumber] = useState("");
  const [editBlock, setEditBlock] = useState("");
  const [editFloor, setEditFloor] = useState("");
  const [editStatus, setEditStatus] = useState<ModelsFlatStatus>("vacant");
  const [editIsActive, setEditIsActive] = useState("true");

  const list = useFlatsList({ societyId });
  const mutations = useFlatMutations({ societyId, onSuccess: list.refetch });

  useEffect(() => {
    if (!editingFlat) return;
    setEditFlatNumber(editingFlat.flat_number ?? "");
    setEditBlock(editingFlat.block ?? "");
    setEditFloor(editingFlat.floor ?? "");
    setEditStatus(editingFlat.status ?? "vacant");
    setEditIsActive(editingFlat.is_active === false ? "false" : "true");
  }, [editingFlat]);

  const handleUpdateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingFlat?.id) return;

    const success = await mutations.handleUpdate(editingFlat.id, {
      flatNumber: editFlatNumber,
      block: editBlock,
      floor: editFloor,
      status: editStatus,
      isActive: editIsActive === "true",
    });
    if (success) setEditingFlat(null);
  };

  const handleDeactivateSubmit = async () => {
    const flat = deactivatingFlat;
    if (!flat?.id) return;

    const success = await mutations.handleDeactivate(flat.id);
    if (success) setDeactivatingFlat(null);
  };

  return (
    <PageShell background="tinted" className="min-h-full py-8">
      <main className="mx-auto w-full max-w-6xl space-y-6">
        <PageHeader
          actions={
            <>
              <RefreshButton loading={list.isFetching} onClick={list.refetch} />
              <Button asChild>
                <Link href={createHref}>
                  <Plus className="size-4" />
                  Add flat
                </Link>
              </Button>
            </>
          }
          description="Manage flat records, availability, and operational access for this society."
          eyebrow="Community inventory"
          title="Flats"
        />

        <FlatsStatsCards
          loading={list.statsQuery.isLoading}
          stats={list.stats}
        />

        <FlatsDirectoryCard
          actionInProgress={mutations.actionInProgress}
          flats={list.flats}
          isEmpty={list.isEmpty}
          isError={list.isError}
          isFetching={list.isFetching}
          isLoading={list.isLoading}
          onBlockToggle={mutations.handleBlockToggle}
          onDeactivate={setDeactivatingFlat}
          onEdit={setEditingFlat}
          onPageChange={list.setPage}
          onPageSizeChange={list.setPageSize}
          onRefetch={list.refetch}
          onSearchChange={list.setSearch}
          onStatusChange={list.setStatus}
          page={list.page}
          pageEnd={list.pageEnd}
          pageSize={list.pageSize}
          pageStart={list.pageStart}
          search={list.search}
          status={list.status}
          totalFlats={list.totalFlats}
          totalPages={list.totalPages}
        />

        <ConfirmDialog
          confirmText="Deactivate"
          description="This removes the flat from active service. It can still appear later if the API returns inactive records."
          destructive
          loading={mutations.isDeactivating}
          onConfirm={handleDeactivateSubmit}
          onOpenChange={(open) => {
            if (!open) setDeactivatingFlat(null);
          }}
          open={Boolean(deactivatingFlat)}
          title={
            deactivatingFlat
              ? `Deactivate ${flatLabel(deactivatingFlat)}?`
              : "Deactivate flat?"
          }
        />

        {editingFlat ? (
          <EditFlatDialog
            block={editBlock}
            flatNumber={editFlatNumber}
            floor={editFloor}
            isActive={editIsActive}
            isUpdating={mutations.isUpdating}
            onBlockChange={setEditBlock}
            onFlatNumberChange={setEditFlatNumber}
            onFloorChange={setEditFloor}
            onIsActiveChange={setEditIsActive}
            onOpenChange={(open) => {
              if (!open) setEditingFlat(null);
            }}
            onStatusChange={setEditStatus}
            onSubmit={handleUpdateSubmit}
            open={Boolean(editingFlat)}
            status={editStatus}
          />
        ) : null}
      </main>
    </PageShell>
  );
}

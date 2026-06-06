"use client";

import { Plus } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { RefreshButton } from "@/components/shared/refresh-button";
import { WorkspacePage } from "@/components/shared/workspace-page";
import { Button } from "@/components/ui/button";
import { FlatsDirectoryCard } from "@/features/admin/flats/components/flats-directory-card";
import { FlatsStatsCards } from "@/features/admin/flats/components/flats-stats-cards";
import { useFlatMutations, useFlatsList } from "@/features/admin/flats/hooks";
import { paths } from "@/lib/routes/paths";

type FlatsClientProps = {
  societyId: number;
  encodedSocietyId: string;
};

export function FlatsClient({
  societyId,
  encodedSocietyId: _encodedSocietyId,
}: FlatsClientProps) {
  const createHref = paths.flatCreate(societyId);
  const list = useFlatsList({ societyId });
  const mutations = useFlatMutations({ societyId, onSuccess: list.refetch });

  return (
    <WorkspacePage>
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

      <FlatsStatsCards loading={list.statsQuery.isLoading} stats={list.stats} />

      <FlatsDirectoryCard
        actionInProgress={mutations.actionInProgress}
        flats={list.flats}
        isEmpty={list.isEmpty}
        isError={list.isError}
        isFetching={list.isFetching}
        isLoading={list.isLoading}
        block={list.block}
        floor={list.floor}
        flatNumber={list.flatNumber}
        isActive={list.isActive}
        onBlockChange={list.setBlock}
        onFloorChange={list.setFloor}
        onFlatNumberChange={list.setFlatNumber}
        onIsActiveChange={list.setIsActive}
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
    </WorkspacePage>
  );
}

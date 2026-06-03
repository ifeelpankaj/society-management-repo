"use client";

import { Home, Search } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageShell } from "@/components/shared/page-shell";
import { RefreshButton } from "@/components/shared/refresh-button";
import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useGetV1FlatResidentsQuery } from "@/lib/api/generated-api";
import { formatNumberIN, titleCaseFromSnake } from "@/lib/format";

export function ResidencesClient() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const residentsQuery = useGetV1FlatResidentsQuery({
    search: search.trim() || undefined,
    status: status === "all" ? undefined : status,
    limit: 50,
    offset: 0,
  });
  const residents = residentsQuery.data?.data?.residents ?? [];

  return (
    <PageShell background="tinted" className="min-h-full py-8">
      <main className="mx-auto w-full max-w-6xl space-y-6">
        <PageHeader
          actions={
            <RefreshButton
              loading={residentsQuery.isFetching}
              onClick={() => residentsQuery.refetch()}
            />
          }
          description="Inspect resident occupancy across societies and flats."
          eyebrow="Developer workspace"
          title="Residences"
        />

        <SectionCard
          contentClassName="space-y-4"
          description={`${formatNumberIN(residents.length)} residences returned`}
          title="Resident Directory"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search residents"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <select
              className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-3 focus:ring-ring/20"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="moved_out">Moved Out</option>
              <option value="all">All</option>
            </select>
          </div>

          {residents.length > 0 ? (
            <div className="divide-y divide-border rounded-lg border border-border">
              {residents.map((resident) => (
                <div
                  className="grid gap-3 p-4 md:grid-cols-[1fr_auto]"
                  key={resident.id}
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Home className="size-4 text-muted-foreground" />
                      <p className="truncate font-medium">
                        {resident.user_name ??
                          resident.user_email ??
                          `User #${resident.user_id}`}
                      </p>
                      <Badge variant="secondary">
                        {titleCaseFromSnake(resident.status)}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {resident.society_name ?? "Society"} -{" "}
                      {resident.flat_number ?? `Flat #${resident.flat_id}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">
                      {titleCaseFromSnake(resident.role)}
                    </Badge>
                    {resident.is_primary ? (
                      <Badge variant="default">Primary</Badge>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              description="Change the filters or refresh the directory."
              title="No residences found"
            />
          )}
        </SectionCard>
      </main>
    </PageShell>
  );
}

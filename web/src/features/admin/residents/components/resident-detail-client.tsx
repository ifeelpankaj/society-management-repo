"use client";

import { Home, UserRound } from "lucide-react";

import { AsyncPanel } from "@/components/shared/async-panel";
import { BackLink } from "@/components/shared/back-link";
import { KeyValueGrid } from "@/components/shared/key-value-grid";
import { PageHeader } from "@/components/shared/page-header";
import { PageShell } from "@/components/shared/page-shell";
import { RoleBadge } from "@/components/shared/role-badge";
import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
import { useResidentDetail } from "@/features/admin/residents/hooks";
import { isRoleKey } from "@/features/auth/profile/profile-utils";
import { formatShortDateIN, titleCaseFromSnake } from "@/lib/format";
import { paths } from "@/lib/routes/paths";

import { ResidentActions } from "./resident-actions";

export function ResidentDetailClient({
  societyId,
  encodedSocietyId: _encodedSocietyId,
  memberId,
}: {
  societyId: number;
  encodedSocietyId: string;
  memberId: number;
}) {
  const residentsHref = paths.residents(societyId);
  const { isError, isLoading, member, ownedFlats, refetch, residences } =
    useResidentDetail({ societyId, memberId });

  const displayName = member?.user_full_name ?? member?.user_email ?? "Member";

  return (
    <PageShell background="tinted" className="min-h-full py-8">
      <main className="mx-auto w-full max-w-5xl space-y-6">
        <PageHeader
          actions={
            member ? (
              <ResidentActions
                member={member}
                onDone={refetch}
                societyId={societyId}
              />
            ) : undefined
          }
          description="User and membership information for this society."
          eyebrow={<BackLink href={residentsHref} label="Residents" />}
          title={displayName}
        />

        <AsyncPanel
          error={isError ? "Refresh the member detail and try again." : null}
          loading={isLoading}
          loadingLabel="Loading member"
          onRetry={refetch}
        >
          {member ? (
            <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <SectionCard
                description="User and membership information"
                title={
                  <span className="flex items-center gap-2">
                    <UserRound className="size-4" />
                    Profile
                  </span>
                }
              >
                <KeyValueGrid
                  items={[
                    {
                      id: "email",
                      label: "Email",
                      value: member.user_email ?? "Not set",
                    },
                    {
                      id: "phone",
                      label: "Phone",
                      value: member.user_phone ?? "Not set",
                    },
                    {
                      id: "role",
                      label: "Role",
                      value:
                        member.role && isRoleKey(member.role) ? (
                          <RoleBadge role={member.role} />
                        ) : (
                          <Badge variant="secondary">
                            {titleCaseFromSnake(member.role)}
                          </Badge>
                        ),
                    },
                    {
                      id: "status",
                      label: "Status",
                      value: (
                        <Badge
                          variant={
                            member.status === "active" ? "default" : "outline"
                          }
                        >
                          {titleCaseFromSnake(member.status)}
                        </Badge>
                      ),
                    },
                    {
                      id: "joined",
                      label: "Joined",
                      value: formatShortDateIN(member.joined_at),
                    },
                    {
                      id: "removed",
                      label: "Removed",
                      value: formatShortDateIN(member.removed_at),
                    },
                  ]}
                />
              </SectionCard>

              <SectionCard
                description={`${ownedFlats.length} owned flats, ${residences.length} active residences`}
                title={
                  <span className="flex items-center gap-2">
                    <Home className="size-4" />
                    Flat ownership
                  </span>
                }
              >
                {ownedFlats.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {ownedFlats.map((flat) => (
                      <div
                        className="rounded-lg border border-border p-3"
                        key={flat.id}
                      >
                        <p className="font-medium">
                          {flat.flat_number ?? `Flat #${flat.flat_id}`}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Block {flat.block ?? "not set"} - Floor{" "}
                          {flat.floor ?? "not set"}
                        </p>
                        {flat.role && isRoleKey(flat.role) ? (
                          <RoleBadge className="mt-2" role={flat.role} />
                        ) : (
                          <Badge className="mt-2" variant="secondary">
                            {titleCaseFromSnake(flat.role)}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center">
                    <p className="font-medium text-sm">No owned flats</p>
                    <p className="mt-1 text-muted-foreground text-xs">
                      This member is not assigned as an owner for any flat.
                    </p>
                  </div>
                )}
              </SectionCard>
            </section>
          ) : null}
        </AsyncPanel>
      </main>
    </PageShell>
  );
}

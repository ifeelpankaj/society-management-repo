"use client";

import { CheckCircle2, Home, QrCode, UserRound, XCircle } from "lucide-react";
import Link from "next/link";

import { AsyncPanel } from "@/components/shared/async-panel";
import { BackLink } from "@/components/shared/back-link";
import { DashboardCard } from "@/components/shared/dashboard-card";
import { KeyValueGrid } from "@/components/shared/key-value-grid";
import { PageHeader } from "@/components/shared/page-header";
import { RoleBadge } from "@/components/shared/role-badge";
import { SectionCard } from "@/components/shared/section-card";
import { WorkspacePage } from "@/components/shared/workspace-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isRoleKey } from "@/features/auth/profile/profile-utils";
import { SocietyMemberLifecycle } from "@/features/members/components/society-member-lifecycle";
import { useSocietyMemberDetail } from "@/features/members/hooks/use-society-member-detail";
import { DetailPageLayout, StatusHero } from "@/features/shared/detail-page";
import type { ModelsFlatResidentResponse } from "@/lib/api/generated-api";
import { formatNumberIN, formatShortDateIN, titleCaseFromSnake } from "@/lib/format";
import { paths } from "@/lib/routes/paths";

type SocietyMemberDetailProps = {
  societyId: number;
  memberId: number;
  backHref: string;
  backLabel: string;
  flatDetailHref?: (flatId: number) => string;
  societyName?: string;
};

function residenceLabel(residence: ModelsFlatResidentResponse) {
  const parts = [residence.block, residence.flat_number].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : `Flat #${residence.flat_id ?? "?"}`;
}

export function SocietyMemberDetail({
  societyId,
  memberId,
  backHref,
  backLabel,
  flatDetailHref,
  societyName,
}: SocietyMemberDetailProps) {
  const {
    approvalStats,
    approvalStatsQuery,
    isError,
    isLoading,
    member,
    refetch,
    residences,
  } = useSocietyMemberDetail({ societyId, memberId });

  const displayName = member?.user_full_name ?? member?.user_email ?? "Member";
  const resolveFlatHref =
    flatDetailHref ?? ((flatId: number) => paths.flatDetail(societyId, flatId));

  return (
    <WorkspacePage size="narrow">
      <PageHeader
        description={
          societyName
            ? `${societyName} — membership and access controls`
            : "User and membership information for this society."
        }
        eyebrow={<BackLink href={backHref} label={backLabel} />}
        title={displayName}
      />

      <AsyncPanel
        error={isError ? "Refresh the member detail and try again." : null}
        loading={isLoading}
        loadingLabel="Loading member"
        onRetry={refetch}
      >
        {member ? (
          <DetailPageLayout
            actions={
              <SocietyMemberLifecycle
                member={member}
                onDone={refetch}
                societyId={societyId}
              />
            }
            summary={
              <StatusHero
                description={member.user_email ?? "Email not set"}
                icon={<UserRound className="size-5" />}
                status={member.status}
                statusVariant={
                  member.status === "active" ? "default" : "outline"
                }
                title={displayName}
              />
            }
            sidebar={
              <>
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
                  description="Resident QR access derived from membership status."
                  title={
                    <span className="flex items-center gap-2">
                      <QrCode className="size-4" />
                      Resident QR status
                    </span>
                  }
                >
                  <Badge
                    variant={member.status === "active" ? "default" : "outline"}
                  >
                    {titleCaseFromSnake(member.status)}
                  </Badge>
                </SectionCard>
              </>
            }
            main={
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <DashboardCard
                    description="Visitor entries approved by this member"
                    icon={<CheckCircle2 className="size-4" />}
                    loading={approvalStatsQuery.isLoading}
                    title="Approved visitors"
                    value={formatNumberIN(approvalStats?.approved_count ?? 0)}
                  />
                  <DashboardCard
                    description="Visitor entries rejected by this member"
                    icon={<XCircle className="size-4" />}
                    loading={approvalStatsQuery.isLoading}
                    title="Rejected visitors"
                    value={formatNumberIN(approvalStats?.rejected_count ?? 0)}
                  />
                </div>

                <SectionCard
                  description={`${residences.length} active ${residences.length === 1 ? "residence" : "residences"}`}
                  title={
                    <span className="flex items-center gap-2">
                      <Home className="size-4" />
                      Residences
                    </span>
                  }
                >
                  {residences.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {residences.map((residence) => (
                        <div
                          className="rounded-lg border border-border p-3"
                          key={residence.id ?? `${residence.flat_id}-${residence.role}`}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">
                              {residenceLabel(residence)}
                            </p>
                            {residence.role ? (
                              <Badge variant="secondary">
                                {titleCaseFromSnake(residence.role)}
                              </Badge>
                            ) : null}
                            {residence.is_primary ? (
                              <Badge variant="outline">Primary</Badge>
                            ) : null}
                          </div>
                          <p className="mt-1 text-muted-foreground text-xs">
                            Floor {residence.floor ?? "not set"}
                          </p>
                          {residence.flat_id ? (
                            <Button
                              asChild
                              className="mt-3"
                              size="sm"
                              type="button"
                              variant="outline"
                            >
                              <Link href={resolveFlatHref(residence.flat_id)}>
                                Open flat
                              </Link>
                            </Button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-border p-6 text-center">
                      <p className="font-medium text-sm">No residences</p>
                      <p className="mt-1 text-muted-foreground text-xs">
                        This member is not linked to any flat yet.
                      </p>
                    </div>
                  )}
                </SectionCard>
              </>
            }
          />
        ) : null}
      </AsyncPanel>
    </WorkspacePage>
  );
}

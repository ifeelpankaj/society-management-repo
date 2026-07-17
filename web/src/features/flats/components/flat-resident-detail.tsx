"use client";

import {
  Crown,
  Home,
  LogOut,
  Mail,
  Phone,
  Trash2,
  UserCog,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";

import { AsyncPanel } from "@/components/shared/async-panel";
import { BackLink } from "@/components/shared/back-link";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { KeyValueGrid } from "@/components/shared/key-value-grid";
import { PageHeader } from "@/components/shared/page-header";
import { RefreshButton } from "@/components/shared/refresh-button";
import { RoleBadge } from "@/components/shared/role-badge";
import { WorkspacePage } from "@/components/shared/workspace-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditResidentRoleDialog } from "@/features/admin/flats/components/flat-detail/edit-resident-role-dialog";
import { residentName } from "@/features/admin/flats/components/flat-detail/flat-detail-utils";
import { isRoleKey } from "@/features/auth/profile/profile-utils";
import { useFlatResidentDetail } from "@/features/flats/hooks/use-flat-resident-detail";
import { ActionPanel, StatusHero } from "@/features/shared/detail-page";
import type { ModelsFlatResidentRole } from "@/lib/api/generated-api";
import { formatShortDateIN, titleCaseFromSnake } from "@/lib/format";
import { paths } from "@/lib/routes/paths";

type FlatResidentDetailProps = {
  societyId: number;
  flatId: number;
  residentId: number;
  backHref: string;
  backLabel: string;
  flatDetailHref?: string;
  readOnly?: boolean;
};

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-lg border border-border bg-card p-4">
      <h2 className="font-semibold text-sm">{title}</h2>
      {children}
    </section>
  );
}

export function FlatResidentDetail({
  societyId,
  flatId,
  residentId,
  backHref,
  backLabel,
  flatDetailHref,
  readOnly = false,
}: FlatResidentDetailProps) {
  const router = useRouter();
  const [roleOpen, setRoleOpen] = useState(false);
  const [nextRole, setNextRole] = useState<ModelsFlatResidentRole>("tenant");
  const [moveOutOpen, setMoveOutOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  const {
    busy,
    handleMoveOut,
    handleRemove,
    handleSetPrimary,
    handleUpdateRole,
    isError,
    isFetching,
    isLoading,
    refetch,
    resident,
  } = useFlatResidentDetail({ societyId, flatId, residentId });

  const displayName = resident ? residentName(resident) : "Resident";
  const flatHref = flatDetailHref ?? paths.flatDetail(societyId, flatId);
  const isActive = resident?.status === "active";

  return (
    <WorkspacePage size="narrow">
      <PageHeader
        actions={
          <RefreshButton loading={isFetching} onClick={() => refetch()} />
        }
        description="Flat resident record and occupancy details."
        eyebrow={<BackLink href={backHref} label={backLabel} />}
        title={displayName}
      />

      <AsyncPanel
        error={isError ? "Refresh the resident detail and try again." : null}
        loading={isLoading}
        loadingLabel="Loading resident"
        onRetry={refetch}
      >
        {resident ? (
          <div className="space-y-5">
            <StatusHero
              description={resident.user_email ?? "Email not set"}
              icon={<UserRound className="size-5" />}
              status={resident.status}
              title={displayName}
            />

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <DetailSection title="Identity and contact">
                <KeyValueGrid
                  items={[
                    {
                      label: "Full name",
                      value: displayName,
                    },
                    {
                      label: "Email",
                      value: (
                        <span className="inline-flex min-w-0 items-center gap-2">
                          <Mail className="size-4 shrink-0 text-muted-foreground" />
                          <span className="truncate">
                            {resident.user_email ?? "Not set"}
                          </span>
                        </span>
                      ),
                    },
                    {
                      label: "Phone",
                      value: (
                        <span className="inline-flex items-center gap-2">
                          <Phone className="size-4 shrink-0 text-muted-foreground" />
                          {resident.user_phone ?? "Not set"}
                        </span>
                      ),
                    },
                    {
                      label: "Status",
                      value: titleCaseFromSnake(resident.status),
                    },
                  ]}
                />
              </DetailSection>

              <DetailSection title="Flat and society occupancy">
                <KeyValueGrid
                  items={[
                    {
                      label: "Flat",
                      value: (
                        <Button asChild size="sm" type="button" variant="link">
                          <Link href={flatHref}>
                            <Home className="size-4" />
                            {resident.flat_number ?? `Flat #${flatId}`}
                          </Link>
                        </Button>
                      ),
                    },
                    {
                      label: "Society",
                      value: resident.society_name ?? "Society",
                    },
                    {
                      label: "Block",
                      value: resident.block ?? "Not set",
                    },
                    {
                      label: "Floor",
                      value: resident.floor ?? "Not set",
                    },
                    {
                      label: "Role",
                      value: isRoleKey(resident.role) ? (
                        <RoleBadge role={resident.role} />
                      ) : (
                        <Badge variant="secondary">
                          {titleCaseFromSnake(resident.role)}
                        </Badge>
                      ),
                    },
                    {
                      label: "Primary",
                      value: resident.is_primary ? "Yes" : "No",
                    },
                  ]}
                />
              </DetailSection>
            </div>

            <DetailSection title="Dates">
              <KeyValueGrid
                items={[
                  {
                    label: "Moved in",
                    value: formatShortDateIN(resident.moved_in_at, "Not set"),
                  },
                  {
                    label: "Moved out",
                    value: formatShortDateIN(resident.moved_out_at, "Not set"),
                  },
                  {
                    label: "Created",
                    value: formatShortDateIN(resident.created_at, "Not set"),
                  },
                  {
                    label: "Updated",
                    value: formatShortDateIN(resident.updated_at, "Not set"),
                  },
                ]}
              />
            </DetailSection>

            {!readOnly && isActive ? (
              <ActionPanel
                description="Manage this resident's role and occupancy on the flat."
                title="Resident actions"
              >
                <Button
                  disabled={busy}
                  onClick={() => {
                    setNextRole(resident.role ?? "tenant");
                    setRoleOpen(true);
                  }}
                  type="button"
                  variant="outline"
                >
                  <UserCog className="size-4" />
                  Update role
                </Button>
                <Button
                  disabled={busy || resident.is_primary}
                  onClick={() => void handleSetPrimary()}
                  type="button"
                  variant="outline"
                >
                  <Crown className="size-4" />
                  Set primary
                </Button>
                <Button
                  disabled={busy}
                  onClick={() => setMoveOutOpen(true)}
                  type="button"
                  variant="outline"
                >
                  <LogOut className="size-4" />
                  Move out
                </Button>
                <Button
                  disabled={busy}
                  onClick={() => setRemoveOpen(true)}
                  type="button"
                  variant="destructive"
                >
                  <Trash2 className="size-4" />
                  Remove
                </Button>
              </ActionPanel>
            ) : null}
          </div>
        ) : null}
      </AsyncPanel>

      {!readOnly && resident ? (
        <>
          <EditResidentRoleDialog
            isUpdating={busy}
            onOpenChange={setRoleOpen}
            onRoleChange={setNextRole}
            onSubmit={(event) => {
              event.preventDefault();
              void handleUpdateRole(nextRole).then((success) => {
                if (success) setRoleOpen(false);
              });
            }}
            open={roleOpen}
            resident={resident}
            role={nextRole}
          />

          <ConfirmDialog
            confirmText="Move out"
            description="The resident will be marked moved out from this flat."
            onConfirm={() => {
              void handleMoveOut().then((success) => {
                if (success) router.push(flatHref);
              });
            }}
            onOpenChange={setMoveOutOpen}
            open={moveOutOpen}
            title={`Move out ${displayName}?`}
          />

          <ConfirmDialog
            confirmText="Remove"
            description="This removes the resident from this flat."
            destructive
            onConfirm={() => {
              void handleRemove().then((success) => {
                if (success) router.push(flatHref);
              });
            }}
            onOpenChange={setRemoveOpen}
            open={removeOpen}
            title={`Remove ${displayName}?`}
          />
        </>
      ) : null}
    </WorkspacePage>
  );
}

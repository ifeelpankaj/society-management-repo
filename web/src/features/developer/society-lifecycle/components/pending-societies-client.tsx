"use client";
import { CheckCircle2, RefreshCw, Wrench } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageShell } from "@/components/shared/page-shell";
import type { SmartTableColumn } from "@/components/tables/smart-table";
import { SmartTable } from "@/components/tables/smart-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  usePendingSocieties,
  useSocietySubscription,
} from "@/features/developer/society-lifecycle/hooks";
import type { ModelsSocietyResponse } from "@/lib/api/generated-api";
import { formatShortDateIN, titleCaseFromSnake } from "@/lib/format";
import { PlanSelect } from "./plan-select";

const ActivateSubscriptionDialog = dynamic(
  () =>
    import("./activate-subscription-dialog").then((module) => ({
      default: module.ActivateSubscriptionDialog,
    })),
  { ssr: false },
);
export function PendingSocietiesClient() {
  const {
    approving,
    handleApprove,
    isError,
    isFetching,
    isLoading,
    refetch,
    selectedSociety,
    setSelectedSociety,
    societies,
  } = usePendingSocieties();
  const columns = useMemo<SmartTableColumn<ModelsSocietyResponse>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Society",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">
              {row.original.name ?? "Society"}
            </p>
            <p className="text-muted-foreground text-xs">
              {row.original.society_code ?? "Code not set"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "city",
        header: "City",
        cell: ({ row }) => row.original.city ?? "Not set",
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) =>
          formatShortDateIN(row.original.created_at, "Not set"),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant="secondary">
            {titleCaseFromSnake(row.original.status)}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        meta: { headerClassName: "text-right", className: "text-right" },
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              disabled={!row.original.id || approving}
              onClick={async (event) => {
                event.stopPropagation();
                if (!row.original.id) return;
                await handleApprove(row.original.id);
              }}
              size="sm"
              type="button"
            >
              <CheckCircle2 className="size-4" />
              Approve
            </Button>
            <Button
              onClick={(event) => {
                event.stopPropagation();
                setSelectedSociety(row.original);
              }}
              size="sm"
              type="button"
              variant="outline"
            >
              <Wrench className="size-4" />
              Subscription
            </Button>
          </div>
        ),
      },
    ],
    [approving, handleApprove, setSelectedSociety],
  );
  return (
    <PageShell background="tinted" className="min-h-screen py-10">
      <main className="mx-auto w-full max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="font-medium text-muted-foreground text-sm">
              Developer workspace
            </p>
            <h1 className="font-semibold text-3xl tracking-tight">
              Pending societies
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Approve societies, assign a subscription, and activate it to
              complete the lifecycle.
            </p>
          </div>
          <Button
            disabled={isFetching}
            onClick={refetch}
            type="button"
            variant="outline"
          >
            <RefreshCw
              className={isFetching ? "size-4 animate-spin" : "size-4"}
            />
            Refresh
          </Button>
        </header>
        <Card>
          <CardHeader>
            <CardTitle>Societies</CardTitle>
            <CardDescription>
              {isFetching ? "Refreshing..." : `${societies.length} pending`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isError ? (
              <EmptyState
                title="Could not load pending societies"
                description="Refresh and try again."
                action={
                  <Button onClick={refetch} type="button">
                    Retry
                  </Button>
                }
              />
            ) : (
              <SmartTable
                columns={columns}
                data={societies}
                loading={isLoading}
                onRowClick={(row) => setSelectedSociety(row)}
                rowKey={(row, index) =>
                  row.id ?? row.society_code ?? `${index}`
                }
              />
            )}
          </CardContent>
        </Card>
        <SocietySubscriptionDialog
          onDone={refetch}
          onOpenChange={(open) => {
            if (!open) setSelectedSociety(null);
          }}
          open={Boolean(selectedSociety)}
          society={selectedSociety}
        />
      </main>
    </PageShell>
  );
}
function SocietySubscriptionDialog({
  open,
  onOpenChange,
  society,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  society: ModelsSocietyResponse | null;
  onDone?: () => void;
}) {
  const {
    activateOpen,
    activating,
    busy,
    handleActivate,
    handleCreatePending,
    plans,
    selectedPlanId,
    setActivateOpen,
    setSelectedPlanId,
    subscriptionToActivate,
    subscriptions,
    subscriptionsQuery,
  } = useSocietySubscription({ society, open, onDone });
  return (
    <>
      <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Subscription setup</DialogTitle>
            <DialogDescription>
              {society?.name ?? "Society"}{" "}
              {society?.society_code ? `(${society.society_code})` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2 rounded-lg border border-border bg-background p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-sm">
                  Current subscriptions
                </span>
                <Badge variant="outline">{subscriptions.length}</Badge>
              </div>
              {subscriptionsQuery.isError ? (
                <p className="text-muted-foreground text-sm">
                  Could not load subscriptions.
                </p>
              ) : subscriptions.length > 0 ? (
                <div className="space-y-2">
                  {subscriptions.slice(0, 3).map((sub) => (
                    <div
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm"
                      key={
                        sub.id ??
                        sub.created_at ??
                        `${sub.society_id}-${sub.current_plan_code}`
                      }
                    >
                      <span className="font-medium">
                        {sub.current_plan_name ??
                          sub.current_plan_code ??
                          "Plan"}
                      </span>
                      <span className="text-muted-foreground">
                        {titleCaseFromSnake(sub.status)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No subscription found for this society yet.
                </p>
              )}
            </div>
            {subscriptions.length === 0 ? (
              <div className="grid gap-3">
                <PlanSelect
                  disabled={busy || plans.length === 0}
                  onChange={setSelectedPlanId}
                  plans={plans}
                  value={selectedPlanId}
                />
                <Button
                  disabled={!society?.id || !selectedPlanId || busy}
                  onClick={handleCreatePending}
                  type="button"
                >
                  Create pending subscription
                </Button>
              </div>
            ) : (
              <div className="grid gap-2">
                <Button
                  disabled={!subscriptionToActivate?.id || busy}
                  onClick={() => setActivateOpen(true)}
                  type="button"
                >
                  Activate subscription
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              disabled={busy}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {activateOpen ? (
        <ActivateSubscriptionDialog
          busy={activating}
          onConfirm={handleActivate}
          onOpenChange={setActivateOpen}
          open={activateOpen}
        />
      ) : null}
    </>
  );
}

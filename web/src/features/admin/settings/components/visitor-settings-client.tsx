"use client";

import { Pencil, Settings2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { FilterPanel } from "@/components/data/filter-panel";
import { PaginationFooter } from "@/components/data/pagination-footer";
import { FilterSelect } from "@/components/forms/filter-select";
import { FormField } from "@/components/forms/form-field";
import { AsyncPanel } from "@/components/shared/async-panel";
import { PageHeader } from "@/components/shared/page-header";
import { RefreshButton } from "@/components/shared/refresh-button";
import { SectionCard } from "@/components/shared/section-card";
import { WorkspacePage } from "@/components/shared/workspace-page";
import type { SmartTableColumn } from "@/components/tables/smart-table";
import { SmartTable } from "@/components/tables/smart-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SettingsLayoutClient } from "@/features/admin/settings/components/settings-layout-client";
import {
  useFlatVisitorRules,
  useVisitorSettings,
} from "@/features/admin/settings/hooks";
import type { SocietyFlatVisitorSettingRow } from "@/lib/api/visitor-types";
import type { VisitorApprovalMode, VisitorPurpose } from "@/lib/api/visitor-types";
import {
  VISITOR_APPROVAL_MODE_LABELS,
  type VisitorApprovalModeKey,
} from "@/lib/constants/visitor-approval-mode";
import {
  VISITOR_PURPOSE_LABELS,
  type VisitorPurposeKey,
} from "@/lib/constants/visitor-purpose";
import { titleCaseFromSnake } from "@/lib/format";

type VisitorSettingsClientProps = {
  societyId: number;
};

type SocietySettingsFormState = {
  approval_mode: VisitorApprovalMode;
  default_visit_duration_minutes: string;
  grace_period_minutes: string;
  qr_expiry_minutes: string;
  allow_resident_pre_approval: boolean;
  allow_public_qr_entry: boolean;
  allow_guard_entry: boolean;
};

type FlatRuleFormState = {
  approval_required: boolean;
  default_visit_duration_minutes: string;
  is_enabled: boolean;
};

function flatLabel(row: SocietyFlatVisitorSettingRow) {
  const parts = [row.block, row.flat_number].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : `Flat #${row.flat_id ?? "?"}`;
}

function purposeLabel(purpose?: VisitorPurpose) {
  if (!purpose) return "Unknown";
  return (
    VISITOR_PURPOSE_LABELS[purpose as VisitorPurposeKey] ??
    titleCaseFromSnake(purpose)
  );
}

function toFormState(
  settings: ReturnType<typeof useVisitorSettings>["settings"],
): SocietySettingsFormState {
  return {
    approval_mode: settings?.approval_mode ?? "mandatory",
    default_visit_duration_minutes: String(
      settings?.default_visit_duration_minutes ?? 120,
    ),
    grace_period_minutes: String(settings?.grace_period_minutes ?? 15),
    qr_expiry_minutes: String(settings?.qr_expiry_minutes ?? 60),
    allow_resident_pre_approval: settings?.allow_resident_pre_approval ?? false,
    allow_public_qr_entry: settings?.allow_public_qr_entry ?? false,
    allow_guard_entry: settings?.allow_guard_entry ?? false,
  };
}

function toRuleFormState(row: SocietyFlatVisitorSettingRow): FlatRuleFormState {
  return {
    approval_required: row.approval_required ?? false,
    default_visit_duration_minutes:
      row.default_visit_duration_minutes != null
        ? String(row.default_visit_duration_minutes)
        : "",
    is_enabled: row.is_enabled ?? true,
  };
}

export function VisitorSettingsClient({ societyId }: VisitorSettingsClientProps) {
  const visitorSettings = useVisitorSettings({ societyId });
  const flatRules = useFlatVisitorRules({ societyId });
  const [form, setForm] = useState<SocietySettingsFormState>(() =>
    toFormState(undefined),
  );
  const [editOpen, setEditOpen] = useState(false);
  const [editingRow, setEditingRow] =
    useState<SocietyFlatVisitorSettingRow | null>(null);
  const [ruleForm, setRuleForm] = useState<FlatRuleFormState>({
    approval_required: false,
    default_visit_duration_minutes: "",
    is_enabled: true,
  });

  useEffect(() => {
    if (visitorSettings.settings) {
      setForm(toFormState(visitorSettings.settings));
    }
  }, [visitorSettings.settings]);

  const refetchAll = () => {
    visitorSettings.refetch();
    flatRules.refetch();
  };

  const handleSaveSettings = async (event: React.FormEvent) => {
    event.preventDefault();

    await visitorSettings.saveSettings({
      approval_mode: form.approval_mode,
      default_visit_duration_minutes: Number.parseInt(
        form.default_visit_duration_minutes,
        10,
      ),
      grace_period_minutes: Number.parseInt(form.grace_period_minutes, 10),
      qr_expiry_minutes: Number.parseInt(form.qr_expiry_minutes, 10),
      allow_resident_pre_approval: form.allow_resident_pre_approval,
      allow_public_qr_entry: form.allow_public_qr_entry,
      allow_guard_entry: form.allow_guard_entry,
    });
  };

  const openEditDialog = (row: SocietyFlatVisitorSettingRow) => {
    setEditingRow(row);
    setRuleForm(toRuleFormState(row));
    setEditOpen(true);
  };

  const handleSaveRule = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingRow?.flat_id || !editingRow.purpose) return;

    const duration = ruleForm.default_visit_duration_minutes.trim();
    const success = await flatRules.updateRule({
      flatId: editingRow.flat_id,
      purpose: editingRow.purpose,
      approval_required: ruleForm.approval_required,
      is_enabled: ruleForm.is_enabled,
      default_visit_duration_minutes: duration
        ? Number.parseInt(duration, 10)
        : undefined,
    });

    if (success) {
      setEditOpen(false);
      setEditingRow(null);
    }
  };

  const columns = useMemo<SmartTableColumn<SocietyFlatVisitorSettingRow>[]>(
    () => [
      {
        id: "flat",
        header: "Flat",
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{flatLabel(row.original)}</p>
            <p className="text-muted-foreground text-xs">
              ID {row.original.flat_id ?? "—"}
            </p>
          </div>
        ),
      },
      {
        id: "purpose",
        header: "Purpose",
        cell: ({ row }) => purposeLabel(row.original.purpose),
      },
      {
        id: "approval_required",
        header: "Approval required",
        cell: ({ row }) => (row.original.approval_required ? "Yes" : "No"),
      },
      {
        id: "is_enabled",
        header: "Enabled",
        cell: ({ row }) =>
          row.original.is_enabled ? (
            <Badge variant="default">Enabled</Badge>
          ) : (
            <Badge variant="outline">Disabled</Badge>
          ),
      },
      {
        id: "duration",
        header: "Duration (min)",
        cell: ({ row }) =>
          row.original.default_visit_duration_minutes ?? "Inherited",
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            onClick={() => openEditDialog(row.original)}
            size="sm"
            type="button"
            variant="outline"
          >
            <Pencil className="size-3.5" />
            Edit
          </Button>
        ),
        meta: { align: "right" },
      },
    ],
    [],
  );

  const purposeOptions = useMemo(
    () => [
      { label: "All purposes", value: "all" },
      ...Object.entries(VISITOR_PURPOSE_LABELS).map(([value, label]) => ({
        label,
        value,
      })),
    ],
    [],
  );

  return (
    <WorkspacePage>
      <PageHeader
        actions={
          <RefreshButton
            loading={
              visitorSettings.isFetching || flatRules.isFetching
            }
            onClick={refetchAll}
          />
        }
        description="Configure society-wide visitor approval rules and per-flat overrides."
        title="Society settings"
      />

      <SettingsLayoutClient societyId={societyId}>
        <AsyncPanel
          error={
            visitorSettings.isError
              ? "Refresh visitor settings and try again."
              : null
          }
          loading={visitorSettings.isLoading}
          loadingLabel="Loading visitor settings"
          onRetry={visitorSettings.refetch}
        >
          <form className="space-y-6" onSubmit={handleSaveSettings}>
            <SectionCard
              description="Default approval behavior and entry channels for the society."
              title={
                <span className="flex items-center gap-2">
                  <Settings2 className="size-4" />
                  Society visitor settings
                </span>
              }
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <label className="block space-y-2 sm:col-span-2 lg:col-span-1">
                  <span className="font-medium text-sm">Approval mode</span>
                  <FilterSelect
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        approval_mode: event.target
                          .value as VisitorApprovalMode,
                      }))
                    }
                    options={Object.entries(VISITOR_APPROVAL_MODE_LABELS).map(
                      ([value, label]) => ({ label, value }),
                    )}
                    value={form.approval_mode}
                  />
                </label>

                <FormField
                  id="default-visit-duration"
                  inputMode="numeric"
                  label="Default visit duration (minutes)"
                  min={1}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      default_visit_duration_minutes: event.target.value,
                    }))
                  }
                  type="number"
                  value={form.default_visit_duration_minutes}
                />

                <FormField
                  id="grace-period"
                  inputMode="numeric"
                  label="Grace period (minutes)"
                  min={0}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      grace_period_minutes: event.target.value,
                    }))
                  }
                  type="number"
                  value={form.grace_period_minutes}
                />

                <FormField
                  id="qr-expiry"
                  inputMode="numeric"
                  label="QR expiry (minutes)"
                  min={1}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      qr_expiry_minutes: event.target.value,
                    }))
                  }
                  type="number"
                  value={form.qr_expiry_minutes}
                />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(
                  [
                    {
                      id: "allow-resident-pre-approval",
                      label: "Allow resident pre-approval",
                      key: "allow_resident_pre_approval" as const,
                    },
                    {
                      id: "allow-public-qr",
                      label: "Allow public QR entry",
                      key: "allow_public_qr_entry" as const,
                    },
                    {
                      id: "allow-guard-entry",
                      label: "Allow guard entry",
                      key: "allow_guard_entry" as const,
                    },
                  ] as const
                ).map((toggle) => (
                  <label
                    key={toggle.id}
                    className="flex items-center gap-3 rounded-md border border-border p-3 text-sm"
                    htmlFor={toggle.id}
                  >
                    <input
                      checked={form[toggle.key]}
                      className="size-4 rounded border-border"
                      id={toggle.id}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          [toggle.key]: event.target.checked,
                        }))
                      }
                      type="checkbox"
                    />
                    <span className="font-medium">{toggle.label}</span>
                  </label>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <Button disabled={visitorSettings.isSaving} type="submit">
                  {visitorSettings.isSaving ? "Saving..." : "Save settings"}
                </Button>
              </div>
            </SectionCard>
          </form>
        </AsyncPanel>

        <SectionCard
          description="Override approval and enablement for specific flats and purposes."
          title="Flat visitor rules"
        >
          <div className="space-y-4">
            <FilterPanel defaultOpen label="Filters">
              <label className="block space-y-2">
                <span className="font-medium text-sm">Block</span>
                <Input
                  id="flat-rules-block"
                  onChange={(event) => flatRules.setBlock(event.target.value)}
                  placeholder="Filter by block"
                  value={flatRules.block}
                />
              </label>
              <label className="block space-y-2">
                <span className="font-medium text-sm">Purpose</span>
                <FilterSelect
                  onChange={(event) =>
                    flatRules.setPurpose(
                      event.target.value as VisitorPurpose | "all",
                    )
                  }
                  options={purposeOptions}
                  value={flatRules.purpose}
                />
              </label>
            </FilterPanel>

            <AsyncPanel
              error={
                flatRules.isError
                  ? "Refresh flat visitor rules and try again."
                  : null
              }
              loading={flatRules.isLoading}
              loadingLabel="Loading flat rules"
              onRetry={flatRules.refetch}
            >
              <SmartTable
                columns={columns}
                data={flatRules.rules}
                loading={flatRules.isFetching}
                rowKey={(row) =>
                  `${row.flat_id ?? "flat"}-${row.purpose ?? "purpose"}`
                }
              />

              <PaginationFooter
                loading={flatRules.isFetching}
                onPageChange={flatRules.setPage}
                onPageSizeChange={flatRules.setPageSize}
                page={flatRules.page}
                pageSize={flatRules.pageSize}
                totalItems={flatRules.total}
                totalPages={flatRules.totalPages}
              />
            </AsyncPanel>
          </div>
        </SectionCard>
      </SettingsLayoutClient>

      <Dialog onOpenChange={setEditOpen} open={editOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveRule}>
            <DialogHeader>
              <DialogTitle>Edit flat visitor rule</DialogTitle>
              <DialogDescription>
                {editingRow
                  ? `${flatLabel(editingRow)} — ${purposeLabel(editingRow.purpose)}`
                  : "Update flat-specific visitor settings."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <label
                className="flex items-center gap-3 rounded-md border border-border p-3 text-sm"
                htmlFor="rule-approval-required"
              >
                <input
                  checked={ruleForm.approval_required}
                  className="size-4 rounded border-border"
                  id="rule-approval-required"
                  onChange={(event) =>
                    setRuleForm((current) => ({
                      ...current,
                      approval_required: event.target.checked,
                    }))
                  }
                  type="checkbox"
                />
                <span className="font-medium">Approval required</span>
              </label>

              <label
                className="flex items-center gap-3 rounded-md border border-border p-3 text-sm"
                htmlFor="rule-is-enabled"
              >
                <input
                  checked={ruleForm.is_enabled}
                  className="size-4 rounded border-border"
                  id="rule-is-enabled"
                  onChange={(event) =>
                    setRuleForm((current) => ({
                      ...current,
                      is_enabled: event.target.checked,
                    }))
                  }
                  type="checkbox"
                />
                <span className="font-medium">Purpose enabled</span>
              </label>

              <FormField
                hint="Leave blank to inherit the society default."
                id="rule-duration"
                inputMode="numeric"
                label="Default visit duration (minutes)"
                min={1}
                onChange={(event) =>
                  setRuleForm((current) => ({
                    ...current,
                    default_visit_duration_minutes: event.target.value,
                  }))
                }
                type="number"
                value={ruleForm.default_visit_duration_minutes}
              />
            </div>

            <DialogFooter>
              <Button
                disabled={flatRules.isUpdating}
                onClick={() => setEditOpen(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button disabled={flatRules.isUpdating} type="submit">
                {flatRules.isUpdating ? "Saving..." : "Save rule"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </WorkspacePage>
  );
}

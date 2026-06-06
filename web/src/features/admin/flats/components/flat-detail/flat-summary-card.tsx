import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FlatStatusBadge } from "@/features/admin/flats/components/flat-status-badge";
import type { ModelsFlatResponse } from "@/lib/api/generated-api";
import { formatShortDateIN } from "@/lib/format";

import { flatLabel } from "./flat-detail-utils";

type FlatSummaryCardProps = {
  flat: ModelsFlatResponse;
};

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-1 rounded-md border border-border p-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <div className="font-medium text-sm">{value}</div>
    </div>
  );
}

export function FlatSummaryCard({ flat }: FlatSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Details</CardTitle>
        <CardDescription>
          Core flat information and operational state.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DetailRow label="Flat number" value={flat.flat_number ?? "Not set"} />
        <DetailRow label="Block" value={flat.block ?? "Not set"} />
        <DetailRow label="Floor" value={flat.floor ?? "Not set"} />
        <DetailRow
          label="Status"
          value={<FlatStatusBadge status={flat.status} />}
        />
        <DetailRow
          label="Active state"
          value={flat.is_active === false ? "Inactive" : "Active"}
        />
        <DetailRow label="Created" value={formatShortDateIN(flat.created_at)} />
        <DetailRow label="Updated" value={formatShortDateIN(flat.updated_at)} />
      </CardContent>
    </Card>
  );
}

export { flatLabel };

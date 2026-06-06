import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FlatVisitorContext } from "@/lib/api/visitor-types";
import { titleCaseFromSnake } from "@/lib/format";

type FlatOccupancyCardProps = {
  context?: FlatVisitorContext;
  loading?: boolean;
};

export function FlatOccupancyCard({
  context,
  loading,
}: FlatOccupancyCardProps) {
  const occupancy = context?.occupancy_status
    ? titleCaseFromSnake(context.occupancy_status)
    : "Unknown";
  const primaryName =
    context?.primary_resident?.full_name ?? "No primary resident";
  const totalResidents = context?.total_residents ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Occupancy</CardTitle>
        <CardDescription>
          Current flat occupancy and primary resident.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        {loading ? (
          <p className="text-muted-foreground text-sm sm:col-span-3">
            Loading occupancy...
          </p>
        ) : (
          <>
            <div className="space-y-1 rounded-md border border-border p-3">
              <p className="text-muted-foreground text-xs">Status</p>
              <Badge variant="secondary">{occupancy}</Badge>
            </div>
            <div className="space-y-1 rounded-md border border-border p-3">
              <p className="text-muted-foreground text-xs">Primary resident</p>
              <p className="font-medium text-sm">{primaryName}</p>
            </div>
            <div className="space-y-1 rounded-md border border-border p-3">
              <p className="text-muted-foreground text-xs">Total residents</p>
              <p className="font-medium text-sm">{totalResidents}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

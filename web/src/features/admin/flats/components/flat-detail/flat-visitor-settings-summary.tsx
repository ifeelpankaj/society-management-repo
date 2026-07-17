import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FlatVisitorContext } from "@/lib/api/visitor-types";
import {
  VISITOR_APPROVAL_MODE_LABELS,
  type VisitorApprovalModeKey,
} from "@/lib/constants/visitor-approval-mode";
import {
  VISITOR_PURPOSE_LABELS,
  type VisitorPurposeKey,
} from "@/lib/constants/visitor-purpose";
import { titleCaseFromSnake } from "@/lib/format";

type FlatVisitorSettingsSummaryProps = {
  context?: FlatVisitorContext;
  loading?: boolean;
};

export function FlatVisitorSettingsSummary({
  context,
  loading,
}: FlatVisitorSettingsSummaryProps) {
  const mode = context?.society_approval_mode;
  const modeLabel = mode
    ? (VISITOR_APPROVAL_MODE_LABELS[mode as VisitorApprovalModeKey] ??
      titleCaseFromSnake(mode))
    : "Not set";
  const settings = context?.visitor_settings ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visitor settings</CardTitle>
        <CardDescription>
          Approval mode inheritance and purpose overrides for this flat.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-muted-foreground text-sm">
            Loading visitor settings...
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Society mode:</span>
              <Badge variant="secondary">{modeLabel}</Badge>
              {context?.inherits_society_mode ? (
                <Badge variant="outline">Inherited</Badge>
              ) : (
                <Badge variant="default">Flat overrides active</Badge>
              )}
            </div>

            {settings.length > 0 ? (
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full min-w-[28rem] text-sm">
                  <thead>
                    <tr className="border-border border-b bg-muted/40 text-left text-muted-foreground text-xs">
                      <th className="px-3 py-2 font-medium">Purpose</th>
                      <th className="px-3 py-2 font-medium">Approval</th>
                      <th className="px-3 py-2 font-medium">Enabled</th>
                      <th className="px-3 py-2 font-medium">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settings.map((setting) => {
                      const purpose = setting.purpose;
                      const purposeLabel = purpose
                        ? (VISITOR_PURPOSE_LABELS[
                            purpose as VisitorPurposeKey
                          ] ?? titleCaseFromSnake(purpose))
                        : "Unknown";

                      return (
                        <tr
                          className="border-border/70 border-b last:border-b-0"
                          key={`${setting.purpose}-${setting.flat_id}`}
                        >
                          <td className="px-3 py-2">{purposeLabel}</td>
                          <td className="px-3 py-2">
                            {setting.approval_required ? "Required" : "Optional"}
                          </td>
                          <td className="px-3 py-2">
                            {setting.is_enabled ? "Yes" : "No"}
                          </td>
                          <td className="px-3 py-2">
                            {setting.default_visit_duration_minutes ??
                              "Inherited"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No flat-specific visitor rules configured.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

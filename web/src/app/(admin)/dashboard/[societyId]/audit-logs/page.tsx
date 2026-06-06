import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import { AppLoader } from "@/components/shared/app-loader";
import { decodeSocietyId } from "@/lib/routes/society-route";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Audit logs",
  "Review society activity and compliance events.",
);

const AuditLogsClient = dynamic(
  () =>
    import("@/features/admin/audit-logs/components/audit-logs-client").then(
      (m) => ({
        default: m.AuditLogsClient,
      }),
    ),
  { loading: () => <AppLoader label="Loading audit logs" /> },
);

type AuditLogsPageProps = {
  params: Promise<{
    societyId: string;
  }>;
};

export default async function AuditLogsPage({ params }: AuditLogsPageProps) {
  const { societyId: encodedSocietyId } = await params;
  const societyId = decodeSocietyId(encodedSocietyId);

  if (!societyId) {
    notFound();
  }

  return <AuditLogsClient />;
}

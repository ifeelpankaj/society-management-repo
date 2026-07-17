import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import { AppLoader } from "@/components/shared/app-loader";
import { decodeSocietyId } from "@/lib/routes/society-route";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Visitor approvals",
  "Review pending visitor requests awaiting approval.",
);

const VisitorApprovalsClient = dynamic(
  () =>
    import("@/features/admin/visitors").then((m) => ({
      default: m.VisitorApprovalsClient,
    })),
  { loading: () => <AppLoader label="Loading pending approvals" /> },
);

type VisitorApprovalsPageProps = {
  params: Promise<{
    societyId: string;
  }>;
};

export default async function VisitorApprovalsPage({
  params,
}: VisitorApprovalsPageProps) {
  const { societyId: encodedSocietyId } = await params;
  const societyId = decodeSocietyId(encodedSocietyId);

  if (!societyId) {
    notFound();
  }

  return (
    <VisitorApprovalsClient
      encodedSocietyId={encodedSocietyId}
      societyId={societyId}
    />
  );
}

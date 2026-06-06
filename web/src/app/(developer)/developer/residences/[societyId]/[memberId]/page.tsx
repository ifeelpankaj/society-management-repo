import { notFound } from "next/navigation";

import { SocietyMemberDetail } from "@/features/members";
import { paths } from "@/lib/routes/paths";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Member details",
  "Platform view of a society member.",
);

type DeveloperMemberPageProps = {
  params: Promise<{ societyId: string; memberId: string }>;
};

export default async function DeveloperMemberPage({
  params,
}: DeveloperMemberPageProps) {
  const { societyId: rawSocietyId, memberId: rawMemberId } = await params;
  const societyId = Number.parseInt(rawSocietyId, 10);
  const memberId = Number.parseInt(rawMemberId, 10);

  if (
    !/^\d+$/.test(rawSocietyId) ||
    societyId <= 0 ||
    !/^\d+$/.test(rawMemberId) ||
    memberId <= 0
  ) {
    notFound();
  }

  return (
    <SocietyMemberDetail
      backHref={paths.developerResidences()}
      backLabel="Residences"
      flatDetailHref={(flatId) => paths.developerFlatDetail(societyId, flatId)}
      memberId={memberId}
      societyId={societyId}
    />
  );
}

import { notFound } from "next/navigation";

import { DeveloperMemberByUserClient } from "@/features/developer/residences/components/developer-member-by-user-client";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Member details",
  "Platform view of a society member.",
);

type DeveloperMemberByUserPageProps = {
  params: Promise<{ societyId: string; userId: string }>;
};

export default async function DeveloperMemberByUserPage({
  params,
}: DeveloperMemberByUserPageProps) {
  const { societyId: rawSocietyId, userId: rawUserId } = await params;
  const societyId = Number.parseInt(rawSocietyId, 10);
  const userId = Number.parseInt(rawUserId, 10);

  if (
    !/^\d+$/.test(rawSocietyId) ||
    societyId <= 0 ||
    !/^\d+$/.test(rawUserId) ||
    userId <= 0
  ) {
    notFound();
  }

  return <DeveloperMemberByUserClient societyId={societyId} userId={userId} />;
}

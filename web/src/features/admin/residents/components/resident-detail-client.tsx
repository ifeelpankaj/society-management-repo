"use client";

import { SocietyMemberDetail } from "@/features/members";
import { paths } from "@/lib/routes/paths";

export function ResidentDetailClient({
  societyId,
  encodedSocietyId: _encodedSocietyId,
  memberId,
}: {
  societyId: number;
  encodedSocietyId: string;
  memberId: number;
}) {
  return (
    <SocietyMemberDetail
      backHref={paths.residents(societyId)}
      backLabel="Residents"
      flatDetailHref={(flatId) => paths.flatDetail(societyId, flatId)}
      memberId={memberId}
      societyId={societyId}
    />
  );
}

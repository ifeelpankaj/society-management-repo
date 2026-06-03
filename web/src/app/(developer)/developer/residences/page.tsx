import { ResidencesClient } from "@/features/developer/residences";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Residences",
  "Browse flats and residents across societies.",
);

export default function DeveloperResidencesPage() {
  return <ResidencesClient />;
}
// want a resident detail page where user can perform //getV1SocietiesBySocietyIdMembersAndMemberId to get member details
//deleteV1SocietiesBySocietyIdMembersAndUserId to remove member from society
//postV1SocietiesBySocietyIdMembersAndUserIdSuspend to suspend member from society
//postV1SocietiesBySocietyIdMembersAndUserIdReactivate to reactivate member if suspended
//patchV1SocietiesBySocietyIdMembersAndUserIdRole chnage member role society level these things

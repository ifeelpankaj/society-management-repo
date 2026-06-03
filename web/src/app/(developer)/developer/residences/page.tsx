import { ResidencesClient } from "@/features/developer/residences";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Residences",
  "Browse flats and residents across societies.",
);

export default function DeveloperResidencesPage() {
  return <ResidencesClient />;
}

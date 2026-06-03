import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import { AppLoader } from "@/components/shared/app-loader";
import { decodeSocietyId } from "@/lib/routes/society-route";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Create flat",
  "Add a new flat to the society inventory.",
);

const CreateFlatClient = dynamic(
  () =>
    import("@/features/admin/flats").then((m) => ({
      default: m.CreateFlatClient,
    })),
  { loading: () => <AppLoader label="Loading create flat" /> },
);

type CreateFlatPageProps = {
  params: Promise<{
    societyId: string;
  }>;
};

export default async function CreateFlatPage({ params }: CreateFlatPageProps) {
  const { societyId: encodedSocietyId } = await params;
  const societyId = decodeSocietyId(encodedSocietyId);

  if (!societyId) {
    notFound();
  }

  return (
    <CreateFlatClient
      encodedSocietyId={encodedSocietyId}
      societyId={societyId}
    />
  );
}

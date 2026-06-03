import { ResidentClaimPage } from "@/features/resident-claim/components/resident-claim-page";

type ClaimPageProps = {
  params: Promise<{
    societyCode: string;
  }>;
};

export default async function ClaimPage({ params }: ClaimPageProps) {
  const { societyCode } = await params;

  return <ResidentClaimPage societyCode={societyCode} />;
}

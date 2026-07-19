import { VisitorInvitePage } from "@/features/visitor-invite/visitor-invite-page";

type VisitInvitePageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function VisitInvitePage({ params }: VisitInvitePageProps) {
  const { token } = await params;

  return <VisitorInvitePage token={token} />;
}

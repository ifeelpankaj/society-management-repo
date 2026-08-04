import { MemberInvitePage } from "@/features/member-invite/member-invite-page";

type JoinFlatPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function JoinFlatPage({ params }: JoinFlatPageProps) {
  const { token } = await params;

  return <MemberInvitePage token={token} />;
}

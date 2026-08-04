import { PageHeader } from "@/components/shared/page-header";

export function ProfileHeader() {
  return (
    <PageHeader
      eyebrow="Account"
      title="Profile"
      description="Review your account, society details, onboarding QR, and password settings."
      showDivider
    />
  );
}

import { LayoutDashboard } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

type ProfileHeaderProps = {
  dashboardRoute: string | null;
  dashboardActionLabel: string;
};

export function ProfileHeader({
  dashboardRoute,
  dashboardActionLabel,
}: ProfileHeaderProps) {
  return (
    <PageHeader
      eyebrow="Account"
      title="Profile"
      description="Review your account, society details, onboarding QR, and password settings."
      actions={
        dashboardRoute ? (
          <Button asChild>
            <Link href={dashboardRoute}>
              <LayoutDashboard className="size-4" />
              {dashboardActionLabel}
            </Link>
          </Button>
        ) : null
      }
      showDivider
    />
  );
}

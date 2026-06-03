import { RouteGuard } from "@/features/auth/components/route-guard";
import { ProfileLayout } from "@/features/auth/profile/components/profile-layout";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Profile",
  "View and manage your account profile.",
);

export default function ProfilePage() {
  return (
    <RouteGuard mode="authenticated">
      <ProfileLayout />
    </RouteGuard>
  );
}

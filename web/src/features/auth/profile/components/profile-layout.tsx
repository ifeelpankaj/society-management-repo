"use client";

import { WorkspacePage } from "@/components/shared/workspace-page";

import { useProfilePage } from "../hooks/use-profile-page";
import { AccountDetailsCard } from "./account-details-card";
import { ChangePasswordCard } from "./change-password-card";
import { ProfileEditCard } from "./profile-edit-card";
import { ProfileHeader } from "./profile-header";
import { ProfileSummaryCard } from "./profile-summary-card";
import { SocietyDetailsCard } from "./society-details-card";

export function ProfileLayout() {
  const profile = useProfilePage();

  return (
    <WorkspacePage size="wide">
      <ProfileHeader />

      <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-4">
          <ProfileSummaryCard
            user={profile.user}
            isLoading={profile.isLoading}
            dashboardRoute={profile.dashboardRoute}
            dashboardActionLabel={profile.dashboardActionLabel}
            isLoggingOut={profile.isLoggingOut}
            onLogout={profile.handleLogout}
          />

          <ChangePasswordCard
            isChangingPassword={profile.isChangingPassword}
            onSubmit={profile.handleChangePassword}
          />

          <ProfileEditCard isLoading={profile.isLoading} user={profile.user} />
        </div>

        <div className="space-y-4">
          <AccountDetailsCard
            user={profile.user}
            isLoading={profile.isLoading}
            isFetching={profile.isFetching}
          />

          <SocietyDetailsCard
            society={profile.society}
            isFetchingSociety={profile.isFetchingSociety}
            claimLink={profile.claimLink}
            host={profile.host}
            qrUrl={profile.qrUrl}
            onCopyLink={profile.handleCopyLink}
          />
        </div>
      </section>
    </WorkspacePage>
  );
}

"use client";

import { PageShell } from "@/components/shared/page-shell";

import { useProfilePage } from "../hooks/use-profile-page";
import { AccountDetailsCard } from "./account-details-card";
import { ChangePasswordCard } from "./change-password-card";
import { ProfileHeader } from "./profile-header";
import { ProfileSummaryCard } from "./profile-summary-card";
import { SocietyDetailsCard } from "./society-details-card";

export function ProfileLayout() {
  const profile = useProfilePage();

  return (
    <div className="min-h-screen bg-background">
      <PageShell size="full" background="subtle">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <ProfileHeader
            dashboardRoute={profile.dashboardRoute}
            dashboardActionLabel={profile.dashboardActionLabel}
          />

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
                onboardingLink={profile.onboardingLink}
                qrUrl={profile.qrUrl}
                onCopyLink={profile.handleCopyLink}
              />
            </div>
          </section>
        </div>
      </PageShell>
    </div>
  );
}

"use client";

import { Building2 } from "lucide-react";
import type { ReactNode } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { DeveloperSidebar } from "@/components/layout/developer-sidebar";
import { AppLoader } from "@/components/shared/app-loader";
import { useAdminSocietySession } from "@/features/admin/society/hooks/use-admin-society";
import { isDeveloperRole } from "@/features/auth/auth-routing";
import { useGetV1AuthProfileQuery } from "@/lib/api/generated-api";
import { appConfig } from "@/lib/config";

type ProfileWorkspaceShellProps = {
  children: ReactNode;
};

function MinimalAccountShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <header className="flex h-16 shrink-0 items-center gap-3 border-border/80 border-b px-6">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
          <Building2 className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-sm">{appConfig.logoText}</p>
          <p className="text-muted-foreground text-xs">Account settings</p>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto scroll-smooth">
        {children}
      </div>
    </div>
  );
}

export function ProfileWorkspaceShell({ children }: ProfileWorkspaceShellProps) {
  const { data: profileData, isLoading: isLoadingProfile } =
    useGetV1AuthProfileQuery();
  const user = profileData?.data?.user ?? null;
  const isDeveloper = isDeveloperRole(user?.global_role);

  const { selectedSocietyId, isLoading: isLoadingSocieties } =
    useAdminSocietySession({ skip: !user || isDeveloper });

  if (isLoadingProfile || (!isDeveloper && isLoadingSocieties && !user)) {
    return (
      <AppLoader
        label="Loading profile"
        description="Preparing your account workspace."
      />
    );
  }

  if (isDeveloper) {
    return (
      <div className="flex h-dvh overflow-hidden bg-background">
        <DeveloperSidebar />
        <div className="h-dvh min-w-0 flex-1 overflow-y-auto scroll-smooth">
          {children}
        </div>
      </div>
    );
  }

  if (selectedSocietyId) {
    return (
      <div className="flex h-dvh overflow-hidden bg-background">
        <AppSidebar societyId={selectedSocietyId} />
        <div className="h-dvh min-w-0 flex-1 overflow-y-auto scroll-smooth">
          {children}
        </div>
      </div>
    );
  }

  return <MinimalAccountShell>{children}</MinimalAccountShell>;
}

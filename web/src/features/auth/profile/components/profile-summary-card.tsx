import { ArrowRight, LogOut } from "lucide-react";
import Link from "next/link";

import { RoleBadge } from "@/components/shared/role-badge";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials, isRoleKey } from "../profile-utils";

type ProfileSummaryCardProps = {
  user:
    | {
        full_name?: string;
        global_role?: string;
        name?: string;
        role?: string;
      }
    | null
    | undefined;
  isLoading: boolean;
  dashboardRoute: string | null;
  dashboardActionLabel: string;
  isLoggingOut: boolean;
  onLogout: () => void;
};

export function ProfileSummaryCard({
  user,
  isLoading,
  dashboardRoute,
  dashboardActionLabel,
  isLoggingOut,
  onLogout,
}: ProfileSummaryCardProps) {
  const userName = user?.full_name ?? user?.name;
  const userRole = user?.global_role ?? user?.role;

  return (
    <SectionCard contentClassName="space-y-6">
      <div className="flex flex-col items-center text-center">
        {isLoading ? (
          <Skeleton className="size-20 rounded-full" />
        ) : (
          <div className="flex size-20 items-center justify-center rounded-full border border-border bg-primary/10 font-semibold text-2xl text-primary">
            {getInitials(userName)}
          </div>
        )}

        <div className="mt-4 space-y-2">
          {isLoading ? (
            <>
              <Skeleton className="mx-auto h-6 w-44" />
              <Skeleton className="mx-auto h-4 w-32" />
            </>
          ) : (
            <>
              <h2 className="font-semibold text-2xl">{userName ?? "User"}</h2>

              {isRoleKey(userRole) ? <RoleBadge role={userRole} /> : null}
            </>
          )}
        </div>
      </div>

      <div className="grid gap-3">
        {dashboardRoute ? (
          <Button asChild className="w-full">
            <Link href={dashboardRoute}>
              {dashboardActionLabel}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        ) : null}

        <Button
          className="w-full"
          disabled={isLoggingOut}
          onClick={onLogout}
          type="button"
          variant="outline"
        >
          <LogOut className="size-4" />
          {isLoggingOut ? "Signing out..." : "Sign out"}
        </Button>
      </div>
    </SectionCard>
  );
}

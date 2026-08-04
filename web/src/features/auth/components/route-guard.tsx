"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { AppLoader } from "@/components/shared/app-loader";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  AUTH_ROUTES,
  hasAdminSetupMembership,
  hasAdminWorkspaceMembership,
  hasMobileOnlyAccess,
  isDeveloperRole,
  isProfileRoute,
  resolveAuthenticatedRoute,
} from "@/features/auth/auth-routing";
import { clearAuth, setCredentials } from "@/features/auth/auth-slice";
import {
  useGetV1AuthProfileQuery,
  useGetV1SocietiesMyQuery,
} from "@/lib/api/generated-api";
import { useAppDispatch } from "@/store/store";

type RouteGuardMode =
  | "adminSetupWorkspace"
  | "adminWorkspace"
  | "authenticated"
  | "developerOnly"
  | "guestOrRedirect"
  | "mobileOnly"
  | "publicOnly"
  | "resolveAuthenticated";

type RouteGuardProps = {
  children?: ReactNode;
  mode: RouteGuardMode;
  societyId?: number;
};

function needsResolvedRoute(mode: RouteGuardMode, userRole?: string | null) {
  return (
    mode === "guestOrRedirect" ||
    mode === "publicOnly" ||
    mode === "resolveAuthenticated" ||
    (mode === "developerOnly" && !isDeveloperRole(userRole))
  );
}

function isProtectedMode(mode: RouteGuardMode) {
  return (
    mode === "adminSetupWorkspace" ||
    mode === "adminWorkspace" ||
    mode === "authenticated" ||
    mode === "developerOnly" ||
    mode === "mobileOnly" ||
    mode === "resolveAuthenticated"
  );
}

export function RouteGuard({ children, mode, societyId }: RouteGuardProps) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const {
    data: profileData,
    isError: isProfileError,
    isFetching: isFetchingProfile,
    isLoading: isLoadingProfile,
  } = useGetV1AuthProfileQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const user = profileData?.data?.user ?? null;
  const shouldResolveRoute =
    Boolean(user) &&
    (needsResolvedRoute(mode, user?.global_role) ||
      mode === "adminSetupWorkspace" ||
      mode === "adminWorkspace" ||
      mode === "mobileOnly" ||
      mode === "authenticated");
  const shouldLoadMemberships =
    shouldResolveRoute && !isDeveloperRole(user?.global_role);
  const {
    data: societiesData,
    isError: isSocietiesError,
    isFetching: isFetchingSocieties,
    isLoading: isLoadingSocieties,
    refetch: refetchSocieties,
  } = useGetV1SocietiesMyQuery(undefined, {
    skip: !shouldLoadMemberships,
  });
  const memberships = societiesData?.data?.societies ?? [];
  const isCheckingProfile =
    isLoadingProfile || (isFetchingProfile && !profileData && !isProfileError);
  const shouldShowProfileLoader = isCheckingProfile && mode !== "publicOnly";
  const isResolvingRoute =
    shouldLoadMemberships && (isLoadingSocieties || isFetchingSocieties);
  const couldNotResolveMemberships = shouldLoadMemberships && isSocietiesError;
  const isDeveloper = isDeveloperRole(user?.global_role);

  useEffect(() => {
    if (user) {
      dispatch(setCredentials({ user }));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (isProfileError) {
      dispatch(clearAuth());

      if (isProtectedMode(mode)) {
        router.replace(AUTH_ROUTES.login);
      }
    }
  }, [dispatch, isProfileError, mode, router]);

  useEffect(() => {
    if (isCheckingProfile || isResolvingRoute || couldNotResolveMemberships) {
      return;
    }

    if (!user) {
      if (isProtectedMode(mode)) {
        router.replace(AUTH_ROUTES.login);
      }
      return;
    }

    if (mode === "authenticated") {
      if (isProfileRoute(pathname)) {
        return;
      }
      const route = resolveAuthenticatedRoute(user, memberships);
      if (route !== pathname) {
        router.replace(route);
      }
      return;
    }

    if (mode === "mobileOnly" && hasMobileOnlyAccess(memberships)) {
      return;
    }

    if (mode === "developerOnly" && isDeveloper) {
      return;
    }

    if (
      mode === "adminSetupWorkspace" &&
      societyId &&
      hasAdminSetupMembership(memberships, societyId)
    ) {
      return;
    }

    if (
      mode === "adminWorkspace" &&
      societyId &&
      hasAdminWorkspaceMembership(memberships, societyId)
    ) {
      return;
    }

    const route = resolveAuthenticatedRoute(user, memberships);
    if (route !== pathname) {
      router.replace(route);
    }
  }, [
    isCheckingProfile,
    couldNotResolveMemberships,
    isDeveloper,
    isResolvingRoute,
    memberships,
    mode,
    pathname,
    router,
    societyId,
    user,
  ]);

  if (shouldShowProfileLoader || isResolvingRoute) {
    return (
      <AppLoader
        label="Checking access"
        description="Verifying your session and workspace access."
      />
    );
  }

  if (couldNotResolveMemberships) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <EmptyState
          title="Could not verify workspace"
          description="Your session is valid, but we could not load your society access yet."
          action={
            <Button onClick={() => refetchSocieties()} type="button">
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  if (!user) {
    return isProtectedMode(mode) ? null : children;
  }

  if (mode === "authenticated") {
    if (isProfileRoute(pathname)) {
      return children;
    }
    const route = resolveAuthenticatedRoute(user, memberships);
    const isAdminRoute =
      route.startsWith("/dashboard") ||
      route === AUTH_ROUTES.developer ||
      route === AUTH_ROUTES.onboarding ||
      route === AUTH_ROUTES.selectSociety;
    if (isAdminRoute && route !== pathname) {
      return null;
    }
    if (route === AUTH_ROUTES.downloadApp && pathname !== AUTH_ROUTES.downloadApp) {
      return null;
    }
    return children;
  }

  if (mode === "mobileOnly") {
    return hasMobileOnlyAccess(memberships) ? children : null;
  }

  if (mode === "adminWorkspace") {
    return societyId && hasAdminWorkspaceMembership(memberships, societyId)
      ? children
      : null;
  }

  if (mode === "adminSetupWorkspace") {
    return societyId && hasAdminSetupMembership(memberships, societyId)
      ? children
      : null;
  }

  if (mode === "developerOnly") {
    return isDeveloper ? children : null;
  }

  return null;
}

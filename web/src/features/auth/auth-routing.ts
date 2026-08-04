import type { User } from "@/features/auth/auth-types";
import type { ModelsMySocietyResponse } from "@/lib/api/generated-api";
import { encodeSocietyId } from "@/lib/routes/society-route";

export const AUTH_ROUTES = {
  home: "/",
  login: "/login",
  onboarding: "/onboarding",
  profile: "/profile",
  downloadApp: "/download-app",
  developer: "/developer",
  selectSociety: "/select-society",
} as const;

export const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  AUTH_ROUTES.developer,
  AUTH_ROUTES.onboarding,
  AUTH_ROUTES.profile,
  AUTH_ROUTES.downloadApp,
  AUTH_ROUTES.selectSociety,
] as const;

export function isProfileRoute(pathname: string) {
  return pathname === AUTH_ROUTES.profile;
}

type SocietyMembership = Pick<ModelsMySocietyResponse, "member" | "society">;

export function isDeveloperRole(role?: string | null) {
  return role === "developer" || role === "super_admin";
}

export function isAdminWorkspaceRole(role?: string | null) {
  return role === "owner" || role === "admin";
}

export function isMobileOnlyRole(role?: string | null) {
  return role === "staff" || role === "resident";
}

export function isAdminSetupRole(role?: string | null) {
  return role === "owner" || role === "admin";
}

export function isResidentRole(role?: string | null) {
  return role === "resident";
}

export function getMembershipSocietyId(membership: SocietyMembership) {
  return membership.society?.id ?? membership.member?.society_id ?? null;
}

export function isActiveSocietyMembership(membership: SocietyMembership) {
  return (
    Boolean(getMembershipSocietyId(membership)) &&
    membership.member?.status === "active" &&
    membership.society?.status === "active"
  );
}

export function isAdminWorkspaceMembership(membership: SocietyMembership) {
  return (
    isActiveSocietyMembership(membership) &&
    isAdminWorkspaceRole(membership.member?.role)
  );
}

export function isAdminSetupMembership(membership: SocietyMembership) {
  return (
    isActiveSocietyMembership(membership) &&
    isAdminSetupRole(membership.member?.role)
  );
}

export function hasAdminWorkspaceMembership(
  memberships: SocietyMembership[],
  societyId: number,
) {
  return memberships.some(
    (membership) =>
      getMembershipSocietyId(membership) === societyId &&
      isAdminWorkspaceMembership(membership),
  );
}

export function hasAdminSetupMembership(
  memberships: SocietyMembership[],
  societyId: number,
) {
  return memberships.some(
    (membership) =>
      getMembershipSocietyId(membership) === societyId &&
      isAdminSetupMembership(membership),
  );
}

export function isResidentMembership(membership: SocietyMembership) {
  return (
    isActiveSocietyMembership(membership) &&
    isResidentRole(membership.member?.role)
  );
}

export function isMobileOnlyMembership(membership: SocietyMembership) {
  return (
    isActiveSocietyMembership(membership) &&
    isMobileOnlyRole(membership.member?.role)
  );
}

export function hasMobileOnlyAccess(memberships: SocietyMembership[]) {
  const hasAdmin = memberships.some(isAdminWorkspaceMembership);
  if (hasAdmin) {
    return false;
  }
  return memberships.some(isMobileOnlyMembership);
}

export function getSocietyDashboardRoute(societyId: number) {
  return `/dashboard/${encodeSocietyId(societyId)}`;
}

function bySocietyId(first: SocietyMembership, second: SocietyMembership) {
  return (
    (getMembershipSocietyId(first) ?? 0) - (getMembershipSocietyId(second) ?? 0)
  );
}

export function resolveAuthenticatedRoute(
  user: User | null | undefined,
  memberships: SocietyMembership[] = [],
) {
  if (!user) {
    return AUTH_ROUTES.login;
  }

  if (isDeveloperRole(user.global_role)) {
    return AUTH_ROUTES.developer;
  }

  const adminMembership = memberships
    .filter(isAdminWorkspaceMembership)
    .sort(bySocietyId)[0];
  const adminSocietyId = adminMembership
    ? getMembershipSocietyId(adminMembership)
    : null;

  if (adminSocietyId) {
    return getSocietyDashboardRoute(adminSocietyId);
  }

  if (hasMobileOnlyAccess(memberships)) {
    return AUTH_ROUTES.downloadApp;
  }

  return AUTH_ROUTES.onboarding;
}

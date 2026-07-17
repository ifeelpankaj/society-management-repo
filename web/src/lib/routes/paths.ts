import { AUTH_ROUTES } from "@/features/auth/auth-routing";
import { encodeSocietyId } from "@/lib/routes/society-route";

function societyPath(societyId: number, segment?: string) {
  const encoded = encodeSocietyId(societyId);
  const base = `/dashboard/${encoded}`;
  return segment ? `${base}/${segment}` : base;
}

export const paths = {
  home: () => AUTH_ROUTES.home,
  login: () => AUTH_ROUTES.login,
  profile: () => AUTH_ROUTES.profile,
  onboarding: () => AUTH_ROUTES.onboarding,
  onboardingSociety: (societyId: number) =>
    `${AUTH_ROUTES.onboarding}/${encodeSocietyId(societyId)}`,
  selectSociety: () => AUTH_ROUTES.selectSociety,
  developer: () => AUTH_ROUTES.developer,
  developerSocieties: () => `${AUTH_ROUTES.developer}/societies`,
  developerSociety: (societyId: number) =>
    `${AUTH_ROUTES.developer}/societies/${encodeSocietyId(societyId)}`,
  developerPlans: () => `${AUTH_ROUTES.developer}/plans`,
  developerPlan: (planId: number) => `${AUTH_ROUTES.developer}/plans/${planId}`,
  developerSubscriptions: () => `${AUTH_ROUTES.developer}/subscriptions`,
  developerSubscription: (subscriptionId: number) =>
    `${AUTH_ROUTES.developer}/subscriptions/${subscriptionId}`,
  developerResidences: () => `${AUTH_ROUTES.developer}/residences`,
  developerResidenceMember: (societyId: number, memberId: number) =>
    `${AUTH_ROUTES.developer}/residences/${societyId}/${memberId}`,
  developerResidenceUser: (societyId: number, userId: number) =>
    `${AUTH_ROUTES.developer}/residences/${societyId}/users/${userId}`,
  developerFlatDetail: (societyId: number, flatId: number) =>
    `${AUTH_ROUTES.developer}/residences/${societyId}/flats/${flatId}`,
  developerFlatResidentDetail: (
    societyId: number,
    flatId: number,
    residentId: number,
  ) =>
    `${AUTH_ROUTES.developer}/residences/${societyId}/flats/${flatId}/residents/${residentId}`,
  developerClaimDetail: (societyId: number, claimId: number) =>
    `${AUTH_ROUTES.developer}/residences/${societyId}/claims/${claimId}`,
  dashboard: (societyId: number) => societyPath(societyId),
  flats: (societyId: number) => societyPath(societyId, "flats"),
  flatCreate: (societyId: number) => societyPath(societyId, "flats/create"),
  flatDetail: (societyId: number, flatId: number) =>
    `${societyPath(societyId, "flats")}/${flatId}`,
  flatResidentDetail: (societyId: number, flatId: number, residentId: number) =>
    `${societyPath(societyId, "flats")}/${flatId}/residents/${residentId}`,
  residents: (societyId: number) => societyPath(societyId, "residents"),
  residentDetail: (societyId: number, memberId: number) =>
    `${societyPath(societyId, "residents")}/${memberId}`,
  claims: (societyId: number) => societyPath(societyId, "claims"),
  claimDetail: (societyId: number, claimId: number) =>
    `${societyPath(societyId, "claims")}/${claimId}`,
  visitors: (societyId: number) => societyPath(societyId, "visitors"),
  visitorApprovals: (societyId: number) =>
    societyPath(societyId, "visitors/approvals"),
  visitorDetail: (societyId: number, entryId: number) =>
    `${societyPath(societyId, "visitors")}/${entryId}`,
  settingsVisitors: (societyId: number) =>
    societyPath(societyId, "settings/visitors"),
  auditLogs: (societyId: number) => societyPath(societyId, "audit-logs"),
} as const;

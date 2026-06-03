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
  developerSubscriptions: () => `${AUTH_ROUTES.developer}/subscriptions`,
  developerResidences: () => `${AUTH_ROUTES.developer}/residences`,
  dashboard: (societyId: number) => societyPath(societyId),
  flats: (societyId: number) => societyPath(societyId, "flats"),
  flatCreate: (societyId: number) => societyPath(societyId, "flats/create"),
  flatDetail: (societyId: number, flatId: number) =>
    `${societyPath(societyId, "flats")}/${flatId}`,
  residents: (societyId: number) => societyPath(societyId, "residents"),
  residentDetail: (societyId: number, memberId: number) =>
    `${societyPath(societyId, "residents")}/${memberId}`,
  claims: (societyId: number) => societyPath(societyId, "claims"),
} as const;

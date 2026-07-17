import { baseApi } from "@/lib/api/base-api";
import type {
  ModelsFlatClaimResponse,
  ModelsFlatStatsResponse,
  ModelsPlanResponse,
  ModelsSocietyResponse,
  ModelsSocietySubscriptionResponse,
} from "@/lib/api/generated-api";

export type FlatClaimStatsResponse = {
  total_claims?: number;
  pending_claims?: number;
  approved_claims?: number;
  rejected_claims?: number;
  cancelled_claims?: number;
};

export type SocietyDashboardMemberStats = {
  total_active_members?: number;
  owners?: number;
  admins?: number;
  staff?: number;
  residents?: number;
};

export type SocietyDashboardQuotaUsage = {
  used?: number;
  limit?: number;
  remaining?: number;
  percent?: number;
};

export type SocietyDashboardSubscriptionUsage = {
  flats?: SocietyDashboardQuotaUsage;
  admins?: SocietyDashboardQuotaUsage;
  staff?: SocietyDashboardQuotaUsage;
  residents?: SocietyDashboardQuotaUsage;
};

export type SocietyDashboardBootstrap = {
  society?: ModelsSocietyResponse;
  flat_stats?: ModelsFlatStatsResponse;
  claim_stats?: FlatClaimStatsResponse;
  recent_pending_claims?: ModelsFlatClaimResponse[];
  member_stats?: SocietyDashboardMemberStats;
  current_subscription?: ModelsSocietySubscriptionResponse;
  subscription_usage?: SocietyDashboardSubscriptionUsage;
  plan_ads?: ModelsPlanResponse[];
};

export type SocietyDashboardBootstrapApiResponse = {
  success?: boolean;
  message?: string;
  data?: {
    dashboard?: SocietyDashboardBootstrap;
  };
};

export const societyDashboardApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getV1SocietiesBySocietyIdDashboardBootstrap: build.query<
      SocietyDashboardBootstrapApiResponse,
      { societyId: number }
    >({
      query: ({ societyId }) => ({
        url: `/v1/societies/${societyId}/dashboard/bootstrap`,
      }),
      keepUnusedDataFor: 900,
      providesTags: [
        "Societies",
        "Flats",
        "Flat Claims",
        "Society Members",
        "Plans",
        "Subscriptions",
      ],
    }),
  }),
});

export const {
  useGetV1SocietiesBySocietyIdDashboardBootstrapQuery,
  useLazyGetV1SocietiesBySocietyIdDashboardBootstrapQuery,
} = societyDashboardApi;

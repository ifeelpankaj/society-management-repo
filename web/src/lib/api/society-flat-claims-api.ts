import { baseApi } from "@/lib/api/base-api";
import type {
  ModelsFlatClaimResponse,
  ModelsFlatClaimStatus,
} from "@/lib/api/generated-api";
import type { FlatClaimStatsResponse } from "@/lib/api/society-dashboard-api";

export type SocietyFlatClaimsApiResponse = {
  success?: boolean;
  message?: string;
  data?: {
    claims?: ModelsFlatClaimResponse[];
  };
};

export type GetSocietyFlatClaimsArg = {
  societyId: number;
  flatId?: number;
  userId?: number;
  status?: ModelsFlatClaimStatus;
  search?: string;
  searchMode?: string;
  limit?: number;
  offset?: number;
};

export type GetSocietyFlatClaimArg = {
  societyId: number;
  claimId: number;
};

export type SocietyFlatClaimApiResponse = {
  success?: boolean;
  message?: string;
  data?: {
    claim?: ModelsFlatClaimResponse;
  };
};

export type SocietyFlatClaimStatsApiResponse = {
  success?: boolean;
  message?: string;
  data?: {
    stats?: FlatClaimStatsResponse;
  };
};

export const societyFlatClaimsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getV1SocietyFlatClaimStats: build.query<
      SocietyFlatClaimStatsApiResponse,
      { societyId: number }
    >({
      query: ({ societyId }) => ({
        url: `/v1/societies/${societyId}/flat-claims/stats`,
      }),
      providesTags: ["Flat Claims"],
    }),
    getV1SocietyFlatClaims: build.query<
      SocietyFlatClaimsApiResponse,
      GetSocietyFlatClaimsArg
    >({
      query: ({
        societyId,
        flatId,
        userId,
        status,
        search,
        searchMode,
        limit = 20,
        offset = 0,
      }) => ({
        url: `/v1/societies/${societyId}/flat-claims`,
        params: {
          flat_id: flatId,
          user_id: userId,
          status,
          search,
          search_mode: searchMode,
          limit,
          offset,
        },
      }),
      providesTags: ["Flat Claims"],
    }),
    getV1SocietyFlatClaim: build.query<
      SocietyFlatClaimApiResponse,
      GetSocietyFlatClaimArg
    >({
      query: ({ societyId, claimId }) => ({
        url: `/v1/societies/${societyId}/flat-claims/${claimId}`,
      }),
      providesTags: ["Flat Claims"],
    }),
  }),
});

export const {
  useGetV1SocietyFlatClaimQuery,
  useGetV1SocietyFlatClaimStatsQuery,
  useGetV1SocietyFlatClaimsQuery,
} = societyFlatClaimsApi;

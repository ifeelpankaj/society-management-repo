import { baseApi } from "@/lib/api/base-api";
import type {
  ModelsFlatClaimResponse,
  ModelsFlatClaimStatus,
} from "@/lib/api/generated-api";

export type SocietyFlatClaimsApiResponse = {
  success?: boolean;
  message?: string;
  data?: {
    claims?: ModelsFlatClaimResponse[];
  };
};

export type GetSocietyFlatClaimsArg = {
  societyId: number;
  status?: ModelsFlatClaimStatus;
  search?: string;
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

export const societyFlatClaimsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getV1SocietyFlatClaims: build.query<
      SocietyFlatClaimsApiResponse,
      GetSocietyFlatClaimsArg
    >({
      query: ({ societyId, status, search, limit = 20, offset = 0 }) => ({
        url: `/v1/societies/${societyId}/flat-claims`,
        params: {
          status,
          search,
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

export const { useGetV1SocietyFlatClaimQuery, useGetV1SocietyFlatClaimsQuery } =
  societyFlatClaimsApi;

import { baseApi } from "@/lib/api/base-api";
import type { ModelsFlatResidentResponse } from "@/lib/api/generated-api";

export type MeResidencyApiResponse = {
  success?: boolean;
  message?: string;
  data?: {
    residences?: ModelsFlatResidentResponse[];
    residency?: ModelsFlatResidentResponse;
  };
};

export const meResidencyApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getV1MeResidency: build.query<
      MeResidencyApiResponse,
      { societyId: number }
    >({
      query: ({ societyId }) => ({
        url: "/v1/me/residency",
        params: { society_id: societyId },
      }),
      providesTags: ["Flat Residents"],
    }),
  }),
});

export const { useLazyGetV1MeResidencyQuery } = meResidencyApi;

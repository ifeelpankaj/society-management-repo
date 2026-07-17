import { baseApi } from "@/lib/api/base-api";
import type {
  ModelsFlatResponse,
  ModelsFlatStatus,
} from "@/lib/api/generated-api";

export type PaginatedFlatsResponse = {
  items?: ModelsFlatResponse[];
  total?: number;
  limit?: number;
  offset?: number;
};

export type SocietyFlatsApiResponse = {
  success?: boolean;
  message?: string;
  data?: {
    flats?: PaginatedFlatsResponse;
  };
};

export type GetSocietyFlatsArg = {
  societyId: number;
  block?: string;
  floor?: string;
  flatNumber?: string;
  status?: ModelsFlatStatus;
  isActive?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
};

export const societyFlatsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getV1SocietiesBySocietyIdFlatsPaginated: build.query<
      SocietyFlatsApiResponse,
      GetSocietyFlatsArg
    >({
      query: ({
        societyId,
        block,
        floor,
        flatNumber,
        status,
        isActive,
        search,
        limit = 20,
        offset = 0,
      }) => ({
        url: `/v1/societies/${societyId}/flats`,
        params: {
          block,
          floor,
          flat_number: flatNumber,
          status,
          is_active: isActive,
          search,
          limit,
          offset,
        },
      }),
      providesTags: ["Flats"],
    }),
  }),
});

export const { useGetV1SocietiesBySocietyIdFlatsPaginatedQuery } =
  societyFlatsApi;

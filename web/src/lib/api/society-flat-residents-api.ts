import { baseApi } from "@/lib/api/base-api";
import type {
  ModelsAddFlatResidentRequest,
  ModelsFlatResidentApiResponse,
  ModelsFlatResidentRole,
  ModelsFlatResidentStatus,
  ModelsFlatResidentsApiResponse,
  ModelsMessageApiResponse,
  ModelsUpdateFlatResidentRoleRequest,
} from "@/lib/api/generated-api";

export type GetSocietyFlatResidentsArg = {
  societyId: number;
  flatId: number;
  role?: ModelsFlatResidentRole;
  status?: ModelsFlatResidentStatus;
  isPrimary?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
};

const residentMutationTags = [
  "Flats",
  "Flat Residents",
  "Society Members",
] as const;

export const societyFlatResidentsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getV1SocietyFlatResidents: build.query<
      ModelsFlatResidentsApiResponse,
      GetSocietyFlatResidentsArg
    >({
      query: ({
        societyId,
        flatId,
        role,
        status,
        isPrimary,
        search,
        limit = 50,
        offset = 0,
      }) => ({
        url: "/v1/flat-residents",
        params: {
          society_id: societyId,
          flat_id: flatId,
          role,
          status,
          is_primary: isPrimary,
          search,
          limit,
          offset,
        },
      }),
      providesTags: ["Flat Residents"],
    }),
    postV1SocietyFlatResidentCustom: build.mutation<
      ModelsFlatResidentApiResponse,
      {
        societyId: number;
        flatId: number;
        userId: number;
        request: ModelsAddFlatResidentRequest;
      }
    >({
      query: ({ societyId, flatId, userId, request }) => ({
        url: `/v1/societies/${societyId}/flats/${flatId}/residents/users/${userId}`,
        method: "POST",
        body: request,
      }),
      invalidatesTags: residentMutationTags,
    }),
    deleteV1SocietyFlatResidentCustom: build.mutation<
      ModelsMessageApiResponse,
      { societyId: number; flatId: number; residentId: number }
    >({
      query: ({ societyId, flatId, residentId }) => ({
        url: `/v1/societies/${societyId}/flats/${flatId}/residents/${residentId}`,
        method: "DELETE",
      }),
      invalidatesTags: residentMutationTags,
    }),
    postV1SocietyFlatResidentMoveOutCustom: build.mutation<
      ModelsFlatResidentApiResponse,
      { societyId: number; flatId: number; residentId: number }
    >({
      query: ({ societyId, flatId, residentId }) => ({
        url: `/v1/societies/${societyId}/flats/${flatId}/residents/${residentId}/move-out`,
        method: "POST",
      }),
      invalidatesTags: residentMutationTags,
    }),
    postV1SocietyFlatResidentPrimaryCustom: build.mutation<
      ModelsFlatResidentApiResponse,
      { societyId: number; flatId: number; residentId: number }
    >({
      query: ({ societyId, flatId, residentId }) => ({
        url: `/v1/societies/${societyId}/flats/${flatId}/residents/${residentId}/primary`,
        method: "POST",
      }),
      invalidatesTags: residentMutationTags,
    }),
    patchV1SocietyFlatResidentRoleCustom: build.mutation<
      ModelsFlatResidentApiResponse,
      {
        societyId: number;
        flatId: number;
        residentId: number;
        request: ModelsUpdateFlatResidentRoleRequest;
      }
    >({
      query: ({ societyId, flatId, residentId, request }) => ({
        url: `/v1/societies/${societyId}/flats/${flatId}/residents/${residentId}/role`,
        method: "PATCH",
        body: request,
      }),
      invalidatesTags: residentMutationTags,
    }),
  }),
});

export const {
  useGetV1SocietyFlatResidentsQuery,
  usePostV1SocietyFlatResidentCustomMutation,
  useDeleteV1SocietyFlatResidentCustomMutation,
  usePostV1SocietyFlatResidentMoveOutCustomMutation,
  usePostV1SocietyFlatResidentPrimaryCustomMutation,
  usePatchV1SocietyFlatResidentRoleCustomMutation,
} = societyFlatResidentsApi;

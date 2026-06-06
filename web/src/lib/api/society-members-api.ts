import { baseApi } from "@/lib/api/base-api";
import type {
  ModelsFlatResidentResponse,
  ModelsPaginatedMembersResponse,
  ModelsSocietyMemberResponse,
  ModelsSocietyMemberRole,
  ModelsSocietyMemberStatus,
} from "@/lib/api/generated-api";

export type SocietyMemberSummary = {
  total_members?: number;
  active_members?: number;
  pending_members?: number;
  suspended_members?: number;
  removed_members?: number;
  owners?: number;
  admins?: number;
  staff?: number;
  residents?: number;
};

export type SocietyMemberDetail = {
  member?: ModelsSocietyMemberResponse;
  owned_flats?: ModelsFlatResidentResponse[];
  residences?: ModelsFlatResidentResponse[];
};

export type GetSocietyMembersArg = {
  societyId: number;
  search?: string;
  searchMode?: string;
  role?: ModelsSocietyMemberRole;
  status?: ModelsSocietyMemberStatus;
  userId?: number;
  invitedBy?: number;
  removedBy?: number;
  joinedFrom?: string;
  joinedTo?: string;
  sortBy?: string;
  sortOrder?: string;
  limit?: number;
  offset?: number;
};

type MembersResponse = {
  success?: boolean;
  message?: string;
  data?: {
    members?: ModelsPaginatedMembersResponse;
  };
};

type SummaryResponse = {
  success?: boolean;
  message?: string;
  data?: {
    summary?: SocietyMemberSummary;
  };
};

type DetailResponse = {
  success?: boolean;
  message?: string;
  data?: {
    member_detail?: SocietyMemberDetail;
  };
};

type MemberMutationResponse = {
  success?: boolean;
  message?: string;
  data?: {
    member?: ModelsSocietyMemberResponse;
    message?: string;
  };
};

export const societyMembersApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    //getV1SocietiesBySocietyIdAllmember use this querry from genrated api
    getV1SocietiesBySocietyIdMembersPaginated: build.query<
      MembersResponse,
      GetSocietyMembersArg
    >({
      query: ({
        societyId,
        search,
        searchMode,
        role,
        status,
        userId,
        invitedBy,
        removedBy,
        joinedFrom,
        joinedTo,
        sortBy,
        sortOrder,
        limit = 20,
        offset = 0,
      }) => ({
        url: `/v1/societies/${societyId}/members`,
        params: {
          search,
          search_mode: searchMode,
          role,
          status,
          user_id: userId,
          invited_by: invitedBy,
          removed_by: removedBy,
          joined_from: joinedFrom,
          joined_to: joinedTo,
          sort_by: sortBy,
          sort_order: sortOrder,
          limit,
          offset,
        },
      }),
      providesTags: ["Society Members"],
    }),
    getV1SocietiesBySocietyIdMembersSummary: build.query<
      SummaryResponse,
      { societyId: number }
    >({
      query: ({ societyId }) => ({
        url: `/v1/societies/${societyId}/members/summary`,
      }),
      providesTags: ["Society Members"],
    }),
    getV1SocietiesBySocietyIdMembersDetail: build.query<
      DetailResponse,
      { societyId: number; memberId: number }
    >({
      query: ({ societyId, memberId }) => ({
        url: `/v1/societies/${societyId}/members/${memberId}`,
      }),
      providesTags: ["Society Members", "Flat Residents"],
    }),
    postV1SocietiesBySocietyIdMembersAndUserIdSuspendCustom: build.mutation<
      MemberMutationResponse,
      { societyId: number; userId: number; reason?: string }
    >({
      query: ({ societyId, userId, reason }) => ({
        url: `/v1/societies/${societyId}/members/${userId}/suspend`,
        method: "POST",
        body: reason ? { reason } : undefined,
      }),
      invalidatesTags: ["Society Members"],
    }),
    postV1SocietiesBySocietyIdMembersAndUserIdReactivateCustom: build.mutation<
      MemberMutationResponse,
      { societyId: number; userId: number }
    >({
      query: ({ societyId, userId }) => ({
        url: `/v1/societies/${societyId}/members/${userId}/reactivate`,
        method: "POST",
      }),
      invalidatesTags: ["Society Members"],
    }),
    patchV1SocietiesBySocietyIdMembersAndUserIdRoleCustom: build.mutation<
      MemberMutationResponse,
      { societyId: number; userId: number; role: ModelsSocietyMemberRole }
    >({
      query: ({ societyId, userId, role }) => ({
        url: `/v1/societies/${societyId}/members/${userId}/role`,
        method: "PATCH",
        body: { society_id: societyId, user_id: userId, role },
      }),
      invalidatesTags: ["Society Members"],
    }),
    deleteV1SocietiesBySocietyIdMembersAndUserIdCustom: build.mutation<
      MemberMutationResponse,
      { societyId: number; userId: number; reason?: string }
    >({
      query: ({ societyId, userId, reason }) => ({
        url: `/v1/societies/${societyId}/members/${userId}`,
        method: "DELETE",
        body: reason ? { reason } : undefined,
      }),
      invalidatesTags: ["Society Members"],
    }),
    postV1SocietiesBySocietyIdTransferOwnershipCustom: build.mutation<
      MemberMutationResponse,
      { societyId: number; newOwnerUserId: number }
    >({
      query: ({ societyId, newOwnerUserId }) => ({
        url: `/v1/societies/${societyId}/transfer-ownership`,
        method: "POST",
        body: { new_owner_user_id: newOwnerUserId },
      }),
      invalidatesTags: ["Society Members"],
    }),
  }),
});

export const {
  useGetV1SocietiesBySocietyIdMembersPaginatedQuery,
  useGetV1SocietiesBySocietyIdMembersSummaryQuery,
  useGetV1SocietiesBySocietyIdMembersDetailQuery,
  usePostV1SocietiesBySocietyIdMembersAndUserIdSuspendCustomMutation,
  usePostV1SocietiesBySocietyIdMembersAndUserIdReactivateCustomMutation,
  usePatchV1SocietiesBySocietyIdMembersAndUserIdRoleCustomMutation,
  useDeleteV1SocietiesBySocietyIdMembersAndUserIdCustomMutation,
  usePostV1SocietiesBySocietyIdTransferOwnershipCustomMutation,
} = societyMembersApi;

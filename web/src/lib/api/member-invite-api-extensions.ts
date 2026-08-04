import type {
  ModelsAcceptFlatMemberInviteResponse,
  ModelsUserResponse,
} from "@/lib/api/generated-api";
import { generatedApi } from "@/lib/api/generated-api";

export type JoinFlatMemberInviteRequest = {
  first_name?: string;
  last_name?: string;
  email?: string;
  identifier?: string;
  password: string;
};

export type JoinFlatMemberInviteResponse = {
  user?: ModelsUserResponse;
  acceptance?: ModelsAcceptFlatMemberInviteResponse;
};

export type JoinFlatMemberInviteApiResponse = {
  data?: { join?: JoinFlatMemberInviteResponse };
  message?: string;
};

export const memberInviteApi = generatedApi.injectEndpoints({
  endpoints: (build) => ({
    postV1PublicFlatMemberInvitesByTokenJoin: build.mutation<
      JoinFlatMemberInviteApiResponse,
      { token: string; joinFlatMemberInviteRequest: JoinFlatMemberInviteRequest }
    >({
      query: ({ token, joinFlatMemberInviteRequest }) => ({
        url: `/v1/public/flat-member-invites/${token}/join`,
        method: "POST",
        body: joinFlatMemberInviteRequest,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { usePostV1PublicFlatMemberInvitesByTokenJoinMutation } =
  memberInviteApi;

import { generatedApi } from "@/lib/api/generated-api";

/** Submit marks the invite as used; avoid refetching the public invite query afterward. */
generatedApi.enhanceEndpoints({
  addTagTypes: ["PublicVisitorInvite"],
  endpoints: {
    getV1PublicVisitorInvitesByToken: {
      providesTags: ["PublicVisitorInvite"],
    },
    postV1PublicVisitorInvitesByTokenSubmit: {
      invalidatesTags: ["Visitor Entries"],
    },
  },
});

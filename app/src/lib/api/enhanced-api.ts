import { generatedApi } from "@/lib/api/generated-api";

export const enhancedApi = generatedApi.enhanceEndpoints({
  addTagTypes: ["GuardDesk", "VisitorStats", "VisitorPending", "FlatVisitorContext"],
  endpoints: {
    getV1SocietiesBySocietyIdGuardDeskBootstrap: {
      providesTags: ["GuardDesk", "VisitorStats", "VisitorPending"],
    },
    getV1SocietiesBySocietyIdVisitorEntriesStats: {
      providesTags: ["VisitorStats", "Visitor Entries"],
    },
    getV1SocietiesBySocietyIdVisitorEntriesPending: {
      providesTags: ["VisitorPending", "Visitor Entries"],
    },
    getV1SocietiesBySocietyIdFlatsAndFlatIdVisitorEntriesPending: {
      providesTags: ["VisitorPending", "Visitor Entries"],
    },
    getV1SocietiesBySocietyIdFlatsAndFlatIdVisitorContext: {
      providesTags: ["FlatVisitorContext", "Visitor Entries"],
    },
    getV1SocietiesBySocietyIdFlatsAndFlatIdVisitorEntries: {
      providesTags: ["Visitor Entries"],
    },
    getV1SocietiesBySocietyIdVisitorEntries: {
      providesTags: ["Visitor Entries"],
    },
    postV1SocietiesBySocietyIdVisitorEntriesAndEntryIdApprove: {
      invalidatesTags: [
        "Visitor Entries",
        "VisitorStats",
        "GuardDesk",
        "VisitorPending",
        "FlatVisitorContext",
      ],
    },
    postV1SocietiesBySocietyIdVisitorEntriesAndEntryIdReject: {
      invalidatesTags: [
        "Visitor Entries",
        "VisitorStats",
        "GuardDesk",
        "VisitorPending",
        "FlatVisitorContext",
      ],
    },
    postV1SocietiesBySocietyIdVisitorEntriesCheckIn: {
      invalidatesTags: ["Visitor Entries", "VisitorStats", "GuardDesk"],
    },
    postV1SocietiesBySocietyIdVisitorEntriesAndEntryIdCheckOut: {
      invalidatesTags: ["Visitor Entries", "VisitorStats", "GuardDesk"],
    },
    postV1SocietiesBySocietyIdVisitorEntriesGuard: {
      invalidatesTags: ["Visitor Entries", "VisitorStats", "GuardDesk", "VisitorPending"],
    },
  },
});

export type VisitorNotificationCacheTag =
  | "Visitor Entries"
  | "VisitorStats"
  | "VisitorPending"
  | "GuardDesk"
  | "FlatVisitorContext";

export function invalidateVisitorNotificationTags(type?: string): VisitorNotificationCacheTag[] {
  switch (type) {
    case "visitor.pending":
      return ["VisitorPending", "VisitorStats"];
    case "visitor.approved":
      return ["Visitor Entries", "VisitorStats", "GuardDesk"];
    case "visitor.rejected":
      return ["VisitorPending", "VisitorStats", "Visitor Entries"];
    case "visitor.checkin":
    case "visitor.checkout":
      return ["Visitor Entries", "VisitorStats", "GuardDesk"];
    default:
      return ["Visitor Entries", "VisitorStats", "VisitorPending", "GuardDesk", "FlatVisitorContext"];
  }
}

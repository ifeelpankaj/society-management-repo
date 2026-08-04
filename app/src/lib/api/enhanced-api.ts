import { generatedApi } from "@/lib/api/generated-api";

export const enhancedApi = generatedApi.enhanceEndpoints({
  addTagTypes: [
    "GuardDesk",
    "VisitorStats",
    "VisitorPending",
    "VisitorWaitingAtGate",
    "VisitorExpectedGuests",
    "FlatVisitorContext",
    "FlatMembers",
    "FlatMemberInvites",
    "FlatVisitorEntries",
  ],
  endpoints: {
    getV1SocietiesBySocietyIdGuardDeskBootstrap: {
      providesTags: ["GuardDesk", "VisitorStats", "VisitorPending", "VisitorWaitingAtGate", "VisitorExpectedGuests"],
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
      providesTags: ["Visitor Entries", "FlatVisitorEntries"],
    },
    getV1SocietiesBySocietyIdVisitorEntries: {
      providesTags: ["Visitor Entries"],
    },
    getV1SocietiesBySocietyIdVisitorEntriesExpectedGuests: {
      providesTags: ["Visitor Entries", "VisitorExpectedGuests"],
    },
    postV1SocietiesBySocietyIdVisitorEntriesAndEntryIdApprove: {
      invalidatesTags: [
        "Visitor Entries",
        "VisitorStats",
        "GuardDesk",
        "VisitorPending",
        "VisitorWaitingAtGate",
        "VisitorExpectedGuests",
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
      invalidatesTags: [
        "Visitor Entries",
        "VisitorStats",
        "GuardDesk",
        "VisitorWaitingAtGate",
        "VisitorExpectedGuests",
      ],
    },
    postV1SocietiesBySocietyIdVisitorEntriesAndEntryIdCheckOut: {
      invalidatesTags: [
        "Visitor Entries",
        "VisitorStats",
        "GuardDesk",
        "VisitorWaitingAtGate",
        "VisitorExpectedGuests",
      ],
    },
    postV1SocietiesBySocietyIdVisitorEntriesGuard: {
      invalidatesTags: [
        "Visitor Entries",
        "VisitorStats",
        "GuardDesk",
        "VisitorPending",
        "VisitorWaitingAtGate",
        "VisitorExpectedGuests",
      ],
    },
  },
});

export type VisitorNotificationCacheTag =
  | "Visitor Entries"
  | "VisitorStats"
  | "VisitorPending"
  | "VisitorWaitingAtGate"
  | "VisitorExpectedGuests"
  | "GuardDesk"
  | "FlatVisitorContext"
  | "FlatMembers"
  | "FlatMemberInvites"
  | "FlatVisitorEntries";

export function invalidateVisitorNotificationTags(type?: string): VisitorNotificationCacheTag[] {
  switch (type) {
    case "visitor.pending":
      return ["VisitorPending", "VisitorStats"];
    case "visitor.approved":
      return [
        "Visitor Entries",
        "VisitorStats",
        "GuardDesk",
        "VisitorWaitingAtGate",
        "VisitorExpectedGuests",
      ];
    case "visitor.rejected":
      return ["VisitorPending", "VisitorStats", "Visitor Entries"];
    case "visitor.checkin":
    case "visitor.checkout":
      return [
        "Visitor Entries",
        "VisitorStats",
        "GuardDesk",
        "VisitorWaitingAtGate",
        "VisitorExpectedGuests",
      ];
    case "member_invite.accepted":
      return ["FlatMemberInvites", "FlatMembers"];
    default:
      return [
        "Visitor Entries",
        "VisitorStats",
        "VisitorPending",
        "VisitorWaitingAtGate",
        "VisitorExpectedGuests",
        "GuardDesk",
        "FlatVisitorContext",
      ];
  }
}

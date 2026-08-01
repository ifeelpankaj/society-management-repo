import { Redirect } from "expo-router";

import { residentMembersRoute } from "@/features/resident/resident-routes";

export default function AddFlatMemberRedirect() {
  return <Redirect href={residentMembersRoute()} />;
}

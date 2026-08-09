import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";

import {
  AddMemberFlatBadge,
  AddMemberSheet,
} from "@/features/resident/members/add-member-sheet";
import { ResidentSubScreen } from "@/features/resident/components/resident-sub-screen";
import { useResidentMembers } from "@/features/resident/hooks/use-resident-members";
import { useResident } from "@/features/resident/resident-context";
import { residentMembersRoute } from "@/features/resident/resident-routes";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export default function AddFlatMemberScreen() {
  const router = useRouter();
  const { canManageFlatMembers, selectedResidence } = useResident();
  const { refetchAll } = useResidentMembers();
  const [isInviteSuccess, setIsInviteSuccess] = useState(false);

  if (!canManageFlatMembers) {
    return <Redirect href={residentMembersRoute()} />;
  }

  const flatNumber = selectedResidence?.flat_number;

  return (
    <ResidentSubScreen
      headerExtra={
        isInviteSuccess && flatNumber ? (
          <Text style={styles.headerSubtitle}>Flat {flatNumber}</Text>
        ) : null
      }
      headerTrailing={<AddMemberFlatBadge flatNumber={flatNumber} />}
      title={isInviteSuccess ? "Invite Member" : "Add Member"}
    >
      <AddMemberSheet
        onCreated={() => {
          void refetchAll();
          router.back();
        }}
        onSuccessViewChange={setIsInviteSuccess}
      />
    </ResidentSubScreen>
  );
}

const styles = StyleSheet.create({
  headerSubtitle: {
    color: colors.guard.textMuted,
    fontSize: 13,
    fontWeight: "500",
    marginTop: -spacing.xs,
    paddingBottom: spacing.xs,
  },
});

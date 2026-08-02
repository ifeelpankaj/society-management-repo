import { Redirect, useRouter } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";

import { AddMemberSheet } from "@/features/resident/members/add-member-sheet";
import { ResidentSubScreen } from "@/features/resident/components/resident-sub-screen";
import { useResidentMembers } from "@/features/resident/hooks/use-resident-members";
import { useResident } from "@/features/resident/resident-context";
import { residentMembersRoute } from "@/features/resident/resident-routes";
import { layout } from "@/theme/layout";

export default function AddFlatMemberScreen() {
  const router = useRouter();
  const { canManageFlatMembers } = useResident();
  const { refetchAll } = useResidentMembers();

  if (!canManageFlatMembers) {
    return <Redirect href={residentMembersRoute()} />;
  }

  return (
    <ResidentSubScreen title="Add member">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <AddMemberSheet
          onCreated={() => {
            void refetchAll();
            router.back();
          }}
        />
      </ScrollView>
    </ResidentSubScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: layout.screenPaddingBottom,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
});

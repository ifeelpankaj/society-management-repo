import { useRouter } from "expo-router";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { Stack } from "@/components/layout";
import { Card, EmptyState, LoadingState } from "@/components/ui";
import { titleize } from "@/features/guard/guard-utils";
import { MemberCard } from "@/features/resident/members/member-card";
import { ResidentSubScreen } from "@/features/resident/components/resident-sub-screen";
import { useResidentMembers } from "@/features/resident/hooks/use-resident-members";
import { useResident } from "@/features/resident/resident-context";
import { residentMembersAddRoute } from "@/features/resident/resident-routes";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

export function ResidentMembersScreen() {
  const router = useRouter();
  const { canManageFlatMembers, selectedResidence } = useResident();
  const { invites, isLoading, isRefreshing, members, refetchAll } = useResidentMembers();

  if (isLoading) {
    return (
      <ResidentSubScreen title="Flat members">
        <LoadingState message="Loading flat members" />
      </ResidentSubScreen>
    );
  }

  return (
    <ResidentSubScreen
      headerExtra={
        canManageFlatMembers ? (
          <Pressable
            accessibilityRole="button"
            style={styles.addButton}
            onPress={() => router.push(residentMembersAddRoute())}
          >
            <Text style={styles.addButtonText}>Add member</Text>
          </Pressable>
        ) : null
      }
      title="Flat members"
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refetchAll} />
        }
      >
        <Stack gap="lg">
          <View style={styles.intro}>
            <Text style={styles.pageTitle}>Flat members</Text>
            <Text style={styles.pageSubtitle}>
              {selectedResidence?.flat_number
                ? `People linked to flat ${selectedResidence.flat_number}.`
                : "People linked to your flat."}
            </Text>
          </View>

          {members.length === 0 ? (
            <EmptyState
              message="Active flat members will appear here."
              title="No members yet"
            />
          ) : (
            members.map((member) => <MemberCard key={`member-${member.id}`} member={member} />)
          )}

          {canManageFlatMembers && invites.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Waiting to join</Text>
              {invites.map((invite) => (
                <Card key={`invite-${invite.id}`} style={styles.inviteCard}>
                  <Text style={styles.inviteName}>{invite.full_name}</Text>
                  <Text style={styles.inviteMeta}>
                    {titleize(invite.role ?? "family")} • expires{" "}
                    {invite.expires_at ? new Date(invite.expires_at).toLocaleDateString() : "soon"}
                  </Text>
                </Card>
              ))}
            </View>
          ) : null}
        </Stack>
      </ScrollView>
    </ResidentSubScreen>
  );
}

const styles = StyleSheet.create({
  addButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.guard.tealSoft,
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  addButtonText: {
    ...typography.bodySmall,
    color: colors.guard.teal,
    fontWeight: "700",
  },
  intro: {
    gap: spacing.xs,
  },
  inviteCard: {
    gap: spacing.xs,
  },
  inviteMeta: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  inviteName: {
    ...typography.subtitle,
    color: colors.text.primary,
    fontWeight: "600",
  },
  pageSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  pageTitle: {
    ...typography.title,
    color: colors.text.primary,
  },
  scrollContent: {
    gap: spacing.lg,
    paddingBottom: layout.screenPaddingBottom,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  section: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.eyebrow,
    color: colors.text.muted,
  },
});

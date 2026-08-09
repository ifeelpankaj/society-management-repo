import { useRouter } from "expo-router";
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";

import { EmptyState, LoadingState } from "@/components/ui";
import { MemberCard } from "@/features/resident/members/member-card";
import { PendingInviteCard } from "@/features/resident/members/pending-invite-card";
import { ResidentSubScreen } from "@/features/resident/components/resident-sub-screen";
import { useResidentMembers } from "@/features/resident/hooks/use-resident-members";
import { useResident } from "@/features/resident/resident-context";
import { residentMembersAddRoute } from "@/features/resident/resident-routes";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";
import { radius } from "@/theme/radius";
import { shadows } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";

export function ResidentMembersScreen() {
  const router = useRouter();
  const { canManageFlatMembers, selectedResidence } = useResident();
  const { invites, isLoading, isRefreshing, members, refetchAll } = useResidentMembers();

  const flatLabel = selectedResidence?.flat_number ?? "your flat";
  const memberCount = members.length;

  const handleAddMember = () => {
    router.push(residentMembersAddRoute());
  };

  const handleMenuPress = () => {
    if (!canManageFlatMembers) {
      Alert.alert("Flat Members", "No actions are available.");
      return;
    }

    Alert.alert("Flat Members", undefined, [
      { text: "Cancel", style: "cancel" },
      { text: "Add Member", onPress: handleAddMember },
    ]);
  };

  const headerTrailing = (
    <Pressable
      accessibilityLabel="More actions"
      accessibilityRole="button"
      hitSlop={8}
      style={({ pressed }) => [styles.menuButton, pressed && styles.menuButtonPressed]}
      onPress={handleMenuPress}
    >
      <SymbolView
        name={{ ios: "ellipsis", android: "more_vert", web: "more_vert" }}
        size={18}
        tintColor={colors.guard.text}
      />
    </Pressable>
  );

  if (isLoading) {
    return (
      <ResidentSubScreen headerTrailing={headerTrailing} title="Flat Members">
        <LoadingState message="Loading flat members" />
      </ResidentSubScreen>
    );
  }

  return (
    <ResidentSubScreen headerTrailing={headerTrailing} title="Flat Members">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refetchAll} />}
        showsVerticalScrollIndicator={false}
      >
        {canManageFlatMembers ? (
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
            onPress={handleAddMember}
          >
            <SymbolView
              name={{
                ios: "person.badge.plus.fill",
                android: "person_add",
                web: "person_add",
              }}
              size={18}
              tintColor={colors.text.inverse}
            />
            <Text style={styles.addButtonText}>Add Member</Text>
          </Pressable>
        ) : null}

        <View style={styles.titleRow}>
          <View style={styles.titleCopy}>
            <Text style={styles.pageTitle}>Flat members</Text>
            <Text style={styles.pageSubtitle}>People linked to flat {flatLabel}.</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryIconWrap}>
              <SymbolView
                name={{ ios: "person.2.fill", android: "group", web: "group" }}
                size={16}
                tintColor={colors.brand.orange}
              />
            </View>
            <View style={styles.summaryCopy}>
              <Text style={styles.summaryCount}>
                {memberCount} {memberCount === 1 ? "Member" : "Members"}
              </Text>
              <Text style={styles.summaryLabel}>Linked to this flat</Text>
            </View>
          </View>
        </View>

        <View style={styles.listSection}>
          {members.length === 0 ? (
            <EmptyState
              message="Active flat members will appear here."
              title="No members yet"
            />
          ) : (
            members.map((member) => <MemberCard key={`member-${member.id}`} member={member} />)
          )}
        </View>

        {canManageFlatMembers && invites.length > 0 ? (
          <View style={styles.pendingSection}>
            <View style={styles.pendingHeader}>
              <View style={styles.pendingHeaderLine} />
              <View style={styles.pendingHeaderContent}>
                <SymbolView
                  name={{ ios: "hourglass", android: "hourglass_empty", web: "hourglass_empty" }}
                  size={14}
                  tintColor={colors.brand.orange}
                />
                <Text style={styles.pendingTitle}>Waiting to join</Text>
              </View>
              <View style={styles.pendingCountBadge}>
                <Text style={styles.pendingCountText}>{invites.length}</Text>
              </View>
              <View style={styles.pendingHeaderLine} />
            </View>

            <View style={styles.pendingList}>
              {invites.map((invite) => (
                <PendingInviteCard key={`invite-${invite.id}`} invite={invite} />
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </ResidentSubScreen>
  );
}

const styles = StyleSheet.create({
  addButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.brand.orange,
    borderRadius: radius.lg,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    ...shadows.sm,
  },
  addButtonPressed: {
    opacity: 0.9,
  },
  addButtonText: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: "700",
  },
  listSection: {
    gap: spacing.sm,
  },
  menuButton: {
    alignItems: "center",
    backgroundColor: colors.surface.card,
    borderColor: colors.border.default,
    borderRadius: radius["2xl"],
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  menuButtonPressed: {
    opacity: 0.85,
  },
  pageSubtitle: {
    color: colors.guard.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },
  pageTitle: {
    color: colors.brand.navy,
    fontSize: 22,
    fontWeight: "800",
  },
  pendingCountBadge: {
    alignItems: "center",
    backgroundColor: colors.brand.orangeSoft,
    borderRadius: 999,
    height: 22,
    justifyContent: "center",
    minWidth: 22,
    paddingHorizontal: 6,
  },
  pendingCountText: {
    color: colors.brand.orange,
    fontSize: 11,
    fontWeight: "700",
  },
  pendingHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  pendingHeaderContent: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 0,
    gap: 6,
  },
  pendingHeaderLine: {
    backgroundColor: "rgba(16, 29, 54, 0.08)",
    flex: 1,
    height: 1,
  },
  pendingList: {
    gap: spacing.sm,
  },
  pendingSection: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  pendingTitle: {
    color: colors.brand.navy,
    fontSize: 14,
    fontWeight: "700",
  },
  scrollContent: {
    gap: spacing.lg,
    paddingBottom: layout.screenPaddingBottom,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.sm,
  },
  summaryCard: {
    alignItems: "center",
    backgroundColor: colors.surface.card,
    borderColor: "rgba(16, 29, 54, 0.08)",
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    flexShrink: 0,
    gap: spacing.sm,
    maxWidth: 150,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    ...shadows.sm,
  },
  summaryCopy: {
    flex: 1,
    gap: 1,
    minWidth: 0,
  },
  summaryCount: {
    color: colors.brand.navy,
    fontSize: 13,
    fontWeight: "800",
  },
  summaryIconWrap: {
    alignItems: "center",
    backgroundColor: colors.brand.orangeSoft,
    borderRadius: radius.full,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  summaryLabel: {
    color: colors.guard.textMuted,
    fontSize: 10,
    fontWeight: "500",
  },
  titleCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
    paddingRight: spacing.sm,
  },
  titleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

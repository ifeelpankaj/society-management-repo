import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppStatusBar } from "@/components/layout/app-status-bar";
import { Stack } from "@/components/layout";
import { Button, Card, EmptyState, ScreenHeader, StatusPill } from "@/components/ui";
import { useGuardSociety } from "@/features/guard/guard-context";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export function GuardSocietyGate() {
  const { isLoading, memberships, refetch, selectSociety } = useGuardSociety();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.screen}>
        <AppStatusBar />
        <View style={styles.inlineLoading}>
          <ActivityIndicator color={colors.guard.teal} size="small" />
        </View>
      </SafeAreaView>
    );
  }

  if (memberships.length === 0) {
    return (
      <SafeAreaView style={styles.screen}>
        <AppStatusBar />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <EmptyState
            title="No guard access"
            message="Your account is signed in, but active guard access is not linked yet."
            actionLabel="Refresh"
            onAction={refetch}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <AppStatusBar />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Stack gap="3xl">
          <ScreenHeader
            eyebrow="Guard workspace"
            title="Select society"
            subtitle="Choose the society gate you are operating before continuing."
          />

          <Stack gap="md">
            {memberships.map((membership) => (
              <Card key={`guard-society-${membership.id ?? membership.society_id}`} style={styles.membershipCard}>
                <View style={styles.membershipHeader}>
                  <View style={styles.membershipCopy}>
                    <Text style={styles.societyTitle}>Society #{membership.society_id}</Text>
                    <Text style={styles.roleLabel}>{membership.role ?? "staff"} access</Text>
                  </View>
                  <StatusPill status={membership.status} />
                </View>
                <Button
                  title="Operate this gate"
                  onPress={() => {
                    if (membership.society_id) {
                      selectSociety(membership.society_id);
                    }
                  }}
                />
              </Card>
            ))}
          </Stack>
        </Stack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  membershipCard: {
    gap: spacing.lg,
  },
  membershipCopy: {
    flex: 1,
  },
  membershipHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.lg,
    justifyContent: "space-between",
  },
  roleLabel: {
    color: colors.text.secondary,
    fontSize: 16,
    marginTop: spacing.xs,
    textTransform: "capitalize",
  },
  screen: {
    backgroundColor: colors.surface.screen,
    flex: 1,
  },
  inlineLoading: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: spacing["2xl"],
    paddingVertical: spacing["3xl"],
  },
  societyTitle: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: "700",
  },
});

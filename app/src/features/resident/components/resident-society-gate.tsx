import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppStatusBar } from "@/components/layout/app-status-bar";
import { Stack } from "@/components/layout";
import { Button, Card, EmptyState, LoadingState, ScreenHeader, StatusPill } from "@/components/ui";
import { useResident } from "@/features/resident/resident-context";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export function ResidentSocietyGate() {
  const { isLoading, refetch, residences, selectResidence } = useResident();

  if (isLoading) {
    return <LoadingState message="Opening resident workspace" />;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <AppStatusBar />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Stack gap="3xl">
          <ScreenHeader
            eyebrow="Resident workspace"
            title="Select residence"
            subtitle="Choose the flat you want to manage before continuing."
          />

          <Stack gap="md">
            {residences.map((residence) => (
              <Card key={`residence-${residence.id ?? residence.flat_id}`} style={styles.residenceCard}>
                <View style={styles.residenceHeader}>
                  <View style={styles.residenceCopy}>
                    <Text style={styles.societyTitle}>
                      {residence.society_name ?? "Your society"}
                    </Text>
                    <Text style={styles.flatLabel}>
                      Flat {residence.flat_number ?? "-"}
                      {residence.block ? ` · Block ${residence.block}` : ""}
                    </Text>
                  </View>
                  <StatusPill status={residence.status} />
                </View>
                <Button
                  title="Open this flat"
                  onPress={() => {
                    if (residence.flat_id) {
                      selectResidence(residence.flat_id);
                    }
                  }}
                />
              </Card>
            ))}

            {residences.length === 0 ? (
              <EmptyState
                title="No active residence"
                message="Your account is signed in, but a flat has not been linked yet."
                actionLabel="Refresh"
                onAction={refetch}
              />
            ) : null}
          </Stack>
        </Stack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flatLabel: {
    color: colors.text.secondary,
    fontSize: 16,
    marginTop: spacing.xs,
  },
  residenceCard: {
    gap: spacing.lg,
  },
  residenceCopy: {
    flex: 1,
  },
  residenceHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.lg,
    justifyContent: "space-between",
  },
  screen: {
    backgroundColor: colors.surface.screen,
    flex: 1,
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

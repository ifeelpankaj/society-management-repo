import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Card, Input, LoadingState, SegmentTabs } from "@/components/ui";
import { GuardBackHeader } from "@/features/guard/components/guard-back-header";
import { useProfileAction } from "@/features/profile/use-profile-action";
import { ResidentSocietyGate } from "@/features/resident/components/resident-society-gate";
import { useResident } from "@/features/resident/resident-context";
import type { ModelsFlatResidentRole } from "@/lib/api/generated-api";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

const ROLE_OPTIONS: { label: string; value: ModelsFlatResidentRole }[] = [
  { label: "Family", value: "family" },
  { label: "Tenant", value: "tenant" },
];

export default function AddFlatMemberScreen() {
  const { canManageFlatMembers, isLoading, requiresSelection, selectedResidence } = useResident();
  const { showComingSoon } = useProfileAction();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ModelsFlatResidentRole>("family");

  if (isLoading) {
    return <LoadingState message="Opening add member" />;
  }

  if (requiresSelection || !selectedResidence) {
    return <ResidentSocietyGate />;
  }

  if (!canManageFlatMembers) {
    return (
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <GuardBackHeader title="Add Member" />
            <Card style={styles.restrictedCard}>
              <Text style={styles.restrictedTitle}>Flat owner only</Text>
              <Text style={styles.restrictedBody}>
                Only the flat owner can add members to this flat.
              </Text>
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <GuardBackHeader title="Add Member" />

          <View style={styles.intro}>
            <Text style={styles.pageTitle}>Add flat member</Text>
            <Text style={styles.pageSubtitle}>
              Invite a family member or tenant to your flat at{" "}
              {selectedResidence.society_name ?? "your society"}.
            </Text>
          </View>

          <Card style={styles.formCard}>
            <Input
              autoCapitalize="words"
              label="Full name"
              value={fullName}
              onChangeText={setFullName}
            />
            <Input
              autoComplete="tel"
              keyboardType="phone-pad"
              label="Phone number"
              value={phone}
              onChangeText={setPhone}
            />
            <Input
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              label="Email"
              value={email}
              onChangeText={setEmail}
            />

            <View style={styles.roleSection}>
              <Text style={styles.roleLabel}>Role</Text>
              <SegmentTabs options={ROLE_OPTIONS} value={role} onChange={setRole} />
            </View>
          </Card>

          <Button
            title="Add member"
            onPress={() => showComingSoon("Add member")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.guard.screenBg,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: layout.screenPaddingBottom,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: layout.screenPaddingTop,
  },
  content: {
    gap: spacing["2xl"],
  },
  restrictedCard: {
    gap: spacing.sm,
  },
  restrictedTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: "700",
  },
  restrictedBody: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  intro: {
    gap: spacing.xs,
  },
  pageTitle: {
    ...typography.title,
    color: colors.text.primary,
  },
  pageSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  formCard: {
    gap: spacing.lg,
  },
  roleSection: {
    gap: spacing.sm,
  },
  roleLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: "600",
  },
});

import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Card, LoadingState } from "@/components/ui";
import { getApiMessage } from "@/features/auth/api-error";
import { GuardBackHeader } from "@/features/guard/components/guard-back-header";
import { titleize, visitorPurposes } from "@/features/guard/guard-utils";
import { ResidentSocietyGate } from "@/features/resident/components/resident-society-gate";
import { useResident } from "@/features/resident/resident-context";
import {
  copyVisitorInviteLink,
  formatVisitorInviteShareMessage,
  shareVisitorInvite,
  shareVisitorInviteOnWhatsApp,
} from "@/features/visitors/visitor-invite-share";
import {
  type ModelsVisitorPurpose,
  usePostV1SocietiesBySocietyIdFlatsAndFlatIdVisitorInvitesMutation,
} from "@/lib/api/generated-api";
import { buildVisitorInviteUrl } from "@/lib/config";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

type CreatedInvite = {
  purpose: ModelsVisitorPurpose;
  token: string;
  expiresAt?: string;
};

export default function ResidentInviteScreen() {
  const router = useRouter();
  const { flatId, canManageFlatVisitors, isLoading, requiresSelection, societyId } = useResident();
  const [purpose, setPurpose] = useState<ModelsVisitorPurpose>("guest");
  const [createdInvite, setCreatedInvite] = useState<CreatedInvite | null>(null);
  const [createInvite, createInviteState] =
    usePostV1SocietiesBySocietyIdFlatsAndFlatIdVisitorInvitesMutation();

  if (isLoading) {
    return <LoadingState message="Opening invite form" />;
  }

  if (requiresSelection || !societyId || !flatId) {
    return <ResidentSocietyGate />;
  }

  if (!canManageFlatVisitors) {
    return (
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <GuardBackHeader title="Visitor Invite" />
            <Card style={styles.restrictedCard}>
              <Text style={styles.restrictedTitle}>Flat owner required</Text>
              <Text style={styles.restrictedBody}>
                Only the flat owner can create pre-approved visitor invites.
              </Text>
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const handleCreateInvite = async () => {
    try {
      const response = await createInvite({
        societyId,
        flatId,
        modelsCreateVisitorInviteRequest: { purpose },
      }).unwrap();

      const token = response.data?.token?.token;
      if (!token) {
        Alert.alert(
          "Invite created",
          response.message ?? "Visitor invite created successfully.",
        );
        router.back();
        return;
      }

      setCreatedInvite({
        purpose,
        token,
        expiresAt: response.data?.token?.expires_at,
      });
    } catch (error) {
      Alert.alert("Invite failed", getApiMessage(error, "Please try again."));
    }
  };

  const shareMessage = createdInvite
    ? formatVisitorInviteShareMessage(createdInvite)
    : "";

  const handleShareInvite = async () => {
    if (!createdInvite) {
      return;
    }

    try {
      await shareVisitorInvite(shareMessage);
    } catch {
      Alert.alert("Share failed", "Unable to open the share sheet.");
    }
  };

  const handleShareWhatsApp = async () => {
    if (!createdInvite) {
      return;
    }

    try {
      await shareVisitorInviteOnWhatsApp(shareMessage);
    } catch {
      Alert.alert("Share failed", "Unable to open WhatsApp.");
    }
  };

  const handleCopyLink = async () => {
    if (!createdInvite) {
      return;
    }

    try {
      const copied = await copyVisitorInviteLink(createdInvite.token);
      Alert.alert(
        copied ? "Link copied" : "Share link",
        copied
          ? "Visitor form link copied to clipboard."
          : "Use the share sheet to copy the visitor form link.",
      );
    } catch {
      Alert.alert("Copy failed", "Unable to copy the visitor form link.");
    }
  };

  if (createdInvite) {
    const formUrl = buildVisitorInviteUrl(createdInvite.token);

    return (
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <GuardBackHeader title="Visitor Invite" />
            <View style={styles.intro}>
              <Text style={styles.pageTitle}>Invite ready</Text>
              <Text style={styles.pageSubtitle}>
                Share this form link with your visitor so they can complete entry details on web.
              </Text>
            </View>

            <Card style={styles.detailsCard}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Purpose</Text>
                <Text style={styles.fieldValue}>{titleize(createdInvite.purpose)}</Text>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Form link</Text>
                <Text selectable style={styles.codeBlock}>
                  {formUrl}
                </Text>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Invite code</Text>
                <Text selectable style={styles.monoBlock}>
                  {createdInvite.token}
                </Text>
              </View>

              {createdInvite.expiresAt ? (
                <Text style={styles.expiresText}>
                  Expires {new Date(createdInvite.expiresAt).toLocaleString()}
                </Text>
              ) : null}
            </Card>

            <Button title="Share on WhatsApp" onPress={handleShareWhatsApp} />
            <Button title="Copy link" variant="secondary" onPress={handleCopyLink} />
            <Button title="Share invite" variant="secondary" onPress={handleShareInvite} />
            <Button title="Done" variant="secondary" onPress={() => router.back()} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <GuardBackHeader title="Visitor Invite" />
          <View style={styles.intro}>
            <Text style={styles.pageTitle}>Create invite</Text>
            <Text style={styles.pageSubtitle}>
              Generate a shareable visitor form link for your flat.
            </Text>
          </View>

          <Card style={styles.purposeCard}>
            <Text style={styles.fieldLabel}>Visitor purpose</Text>
            <View style={styles.purposeOptions}>
              {visitorPurposes.map((option) => {
                const active = option === purpose;

                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    onPress={() => setPurpose(option)}
                    style={[styles.purposeChip, active && styles.purposeChipActive]}
                  >
                    <Text
                      style={[styles.purposeChipText, active && styles.purposeChipTextActive]}
                    >
                      {option.replace(/_/g, " ")}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          <Button
            title="Create invite"
            loading={createInviteState.isLoading}
            onPress={handleCreateInvite}
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
  detailsCard: {
    gap: spacing.lg,
  },
  purposeCard: {
    gap: spacing.lg,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.eyebrow,
    color: colors.text.muted,
  },
  fieldValue: {
    ...typography.subtitle,
    color: colors.text.primary,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  codeBlock: {
    ...typography.bodySmall,
    backgroundColor: colors.surface.screen,
    borderRadius: radius.md,
    color: colors.text.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  monoBlock: {
    ...typography.caption,
    backgroundColor: colors.surface.screen,
    borderRadius: radius.md,
    color: colors.text.primary,
    fontFamily: "monospace",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  expiresText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  purposeOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  purposeChip: {
    backgroundColor: colors.surface.card,
    borderColor: colors.border.default,
    borderRadius: radius["2xl"],
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  purposeChipActive: {
    backgroundColor: colors.operational.primarySoft,
    borderColor: colors.operational.teal,
  },
  purposeChipText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  purposeChipTextActive: {
    color: "#115e59",
  },
});

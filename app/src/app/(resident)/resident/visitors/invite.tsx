import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Button, Card } from "@/components/ui";
import { getApiMessage } from "@/features/auth/api-error";
import { titleize, visitorPurposes } from "@/features/guard/guard-utils";
import { ResidentSubScreen } from "@/features/resident/components/resident-sub-screen";
import { useResidentFeedback } from "@/features/resident/hooks/use-resident-feedback";
import { useResident } from "@/features/resident/resident-context";
import {
  copyVisitorInviteLink,
  formatVisitorInviteShareMessage,
  shareVisitorInvite,
  shareVisitorInviteOnTelegram,
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
  const feedback = useResidentFeedback();
  const { flatId, canManageFlatVisitors, societyId } = useResident();
  const [purpose, setPurpose] = useState<ModelsVisitorPurpose>("guest");
  const [createdInvite, setCreatedInvite] = useState<CreatedInvite | null>(null);
  const [createInvite, createInviteState] =
    usePostV1SocietiesBySocietyIdFlatsAndFlatIdVisitorInvitesMutation();

  if (!canManageFlatVisitors) {
    return (
      <ResidentSubScreen title="Visitor Invite">
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Card style={styles.restrictedCard}>
            <Text style={styles.restrictedTitle}>Visitor access required</Text>
            <Text style={styles.restrictedBody}>
              Active flat residents with visitor management access can create pre-approved visitor
              invites.
            </Text>
          </Card>
        </ScrollView>
      </ResidentSubScreen>
    );
  }

  const handleCreateInvite = async () => {
    if (!societyId || !flatId) {
      return;
    }

    try {
      const response = await createInvite({
        societyId,
        flatId,
        modelsCreateVisitorInviteRequest: { purpose },
      }).unwrap();

      const token = response.data?.token?.token;
      if (!token) {
        feedback.showSuccess(
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
      feedback.showSuccess("Invite ready", "Share the link with your visitor.");
    } catch (error) {
      feedback.showError("Invite failed", error, getApiMessage(error, "Please try again."));
    }
  };

  const shareMessage = createdInvite
    ? formatVisitorInviteShareMessage(createdInvite)
    : "";

  const handleShare = async (shareFn: (message: string) => Promise<void>, errorLabel: string) => {
    if (!createdInvite) {
      return;
    }

    try {
      await shareFn(shareMessage);
    } catch {
      feedback.showError("Share failed", errorLabel, "Please try again.");
    }
  };

  const handleCopyLink = async () => {
    if (!createdInvite) {
      return;
    }

    try {
      const copied = await copyVisitorInviteLink(createdInvite.token);
      feedback.showSuccess(
        copied ? "Link copied" : "Share link",
        copied
          ? "Visitor form link copied to clipboard."
          : "Use the share sheet to copy the visitor form link.",
      );
    } catch {
      feedback.showError("Copy failed", "Unable to copy the visitor form link.", "Please try again.");
    }
  };

  if (createdInvite) {
    const formUrl = buildVisitorInviteUrl(createdInvite.token);

    return (
      <ResidentSubScreen title="Visitor Invite">
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
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

              {createdInvite.expiresAt ? (
                <Text style={styles.expiresText}>
                  Expires {new Date(createdInvite.expiresAt).toLocaleString()}
                </Text>
              ) : null}
            </Card>

            <Button title="Share on WhatsApp" onPress={() => void handleShare(shareVisitorInviteOnWhatsApp, "Unable to open WhatsApp.")} />
            <Button title="Share on Telegram" variant="secondary" onPress={() => void handleShare(shareVisitorInviteOnTelegram, "Unable to open Telegram.")} />
            <Button title="More options" variant="secondary" onPress={() => void handleShare(shareVisitorInvite, "Unable to open the share sheet.")} />
            <Button title="Copy link" variant="secondary" onPress={() => void handleCopyLink()} />
            <Button title="Done" variant="secondary" onPress={() => router.back()} />
          </View>
        </ScrollView>
      </ResidentSubScreen>
    );
  }

  return (
    <ResidentSubScreen title="Visitor Invite">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
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
    </ResidentSubScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing["2xl"],
  },
  scrollContent: {
    paddingBottom: layout.screenPaddingBottom,
    paddingHorizontal: layout.screenPaddingHorizontal,
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
    backgroundColor: colors.guard.tealSoft,
    borderColor: colors.guard.teal,
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

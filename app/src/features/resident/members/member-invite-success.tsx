import { StyleSheet, Text, View } from "react-native";

import { Button, Card } from "@/components/ui";
import { titleize } from "@/features/guard/guard-utils";
import { useResidentFeedback } from "@/features/resident/hooks/use-resident-feedback";
import {
  copyMemberInviteLink,
  formatMemberInviteShareMessage,
  shareMemberInvite,
  shareMemberInviteOnTelegram,
  shareMemberInviteOnWhatsApp,
} from "@/features/resident/members/member-invite-share";
import type { ModelsFlatMemberInviteRole } from "@/lib/api/resident-api-extensions";
import { buildMemberInviteUrl } from "@/lib/config";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

type MemberInviteSuccessProps = {
  flatNumber?: string;
  invite: {
    expiresAt?: string;
    fullName: string;
    role: ModelsFlatMemberInviteRole;
    token: string;
  };
  onDone: () => void;
  societyName?: string;
};

export function MemberInviteSuccess({
  flatNumber,
  invite,
  onDone,
  societyName,
}: MemberInviteSuccessProps) {
  const feedback = useResidentFeedback();
  const shareMessage = formatMemberInviteShareMessage({
    ...invite,
    flatNumber,
    societyName,
  });
  const joinUrl = buildMemberInviteUrl(invite.token);

  const handleShare = async (shareFn: (message: string) => Promise<void>, errorLabel: string) => {
    try {
      await shareFn(shareMessage);
    } catch {
      feedback.showError("Share failed", errorLabel, "Please try again.");
    }
  };

  const handleCopy = async () => {
    try {
      const copied = await copyMemberInviteLink(invite.token);
      feedback.showSuccess(
        copied ? "Link copied" : "Share link",
        copied ? "Join link copied to clipboard." : "Use the share sheet to copy the join link.",
      );
    } catch {
      feedback.showError("Copy failed", "Unable to copy the join link.", "Please try again.");
    }
  };

  return (
    <View style={styles.content}>
      <View style={styles.intro}>
        <Text style={styles.pageTitle}>Invite ready</Text>
        <Text style={styles.pageSubtitle}>
          Share this join link with {invite.fullName} so they can accept and join your flat.
        </Text>
      </View>

      <Card style={styles.detailsCard}>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Member</Text>
          <Text style={styles.fieldValue}>{invite.fullName}</Text>
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Role</Text>
          <Text style={styles.fieldValue}>{titleize(invite.role)}</Text>
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Join link</Text>
          <Text selectable style={styles.codeBlock}>
            {joinUrl}
          </Text>
        </View>
        {invite.expiresAt ? (
          <Text style={styles.expiresText}>
            Expires {new Date(invite.expiresAt).toLocaleString()}
          </Text>
        ) : null}
      </Card>

      <Button title="Share on WhatsApp" onPress={() => void handleShare(shareMemberInviteOnWhatsApp, "Unable to open WhatsApp.")} />
      <Button title="Share on Telegram" variant="secondary" onPress={() => void handleShare(shareMemberInviteOnTelegram, "Unable to open Telegram.")} />
      <Button title="Copy link" variant="secondary" onPress={() => void handleCopy()} />
      <Button title="More options" variant="secondary" onPress={() => void handleShare(shareMemberInvite, "Unable to open the share sheet.")} />
      <Button title="Done" variant="secondary" onPress={onDone} />
    </View>
  );
}

const styles = StyleSheet.create({
  codeBlock: {
    ...typography.bodySmall,
    backgroundColor: colors.surface.screen,
    borderRadius: radius.md,
    color: colors.text.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  content: {
    gap: spacing.lg,
    paddingBottom: spacing["3xl"],
  },
  detailsCard: {
    gap: spacing.lg,
  },
  expiresText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
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
  intro: {
    gap: spacing.xs,
  },
  pageSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  pageTitle: {
    ...typography.title,
    color: colors.text.primary,
  },
});

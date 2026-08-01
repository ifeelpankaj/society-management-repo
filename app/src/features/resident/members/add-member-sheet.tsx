import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Button, Card, Input, SegmentTabs } from "@/components/ui";
import { getApiMessage } from "@/features/auth/api-error";
import { titleize } from "@/features/guard/guard-utils";
import { useResidentFeedback } from "@/features/resident/hooks/use-resident-feedback";
import { MemberInviteSuccess } from "@/features/resident/members/member-invite-success";
import { useResident } from "@/features/resident/resident-context";
import {
  type ModelsFlatMemberInviteRole,
  usePostV1SocietiesBySocietyIdFlatsAndFlatIdMemberInvitesMutation,
} from "@/lib/api/resident-api-extensions";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

const ROLE_OPTIONS: { label: string; value: ModelsFlatMemberInviteRole }[] = [
  { label: "Family", value: "family" },
  { label: "Tenant", value: "tenant" },
];

type CreatedInvite = {
  expiresAt?: string;
  fullName: string;
  role: ModelsFlatMemberInviteRole;
  token: string;
};

type AddMemberSheetProps = {
  onCreated: () => void;
};

export function AddMemberSheet({ onCreated }: AddMemberSheetProps) {
  const { flatId, selectedResidence, societyId } = useResident();
  const feedback = useResidentFeedback();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ModelsFlatMemberInviteRole>("family");
  const [createdInvite, setCreatedInvite] = useState<CreatedInvite | null>(null);
  const [createInvite, createInviteState] =
    usePostV1SocietiesBySocietyIdFlatsAndFlatIdMemberInvitesMutation();

  if (createdInvite) {
    return (
      <MemberInviteSuccess
        invite={createdInvite}
        flatNumber={selectedResidence?.flat_number ?? undefined}
        societyName={selectedResidence?.society_name ?? undefined}
        onDone={() => {
          setCreatedInvite(null);
          setFullName("");
          setPhone("");
          setEmail("");
          onCreated();
        }}
      />
    );
  }

  const handleCreate = async () => {
    if (!societyId || !flatId) {
      return;
    }

    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      feedback.showInfo("Missing name", "Enter the member's full name.");
      return;
    }

    if (!trimmedPhone && !trimmedEmail) {
      feedback.showInfo("Contact required", "Enter a phone number or email for the invite.");
      return;
    }

    try {
      const response = await createInvite({
        societyId,
        flatId,
        modelsCreateFlatMemberInviteRequest: {
          full_name: trimmedName,
          role,
          phone: trimmedPhone || undefined,
          email: trimmedEmail || undefined,
        },
      }).unwrap();

      const token = response.data?.token?.token;
      if (!token) {
        feedback.showSuccess("Invite created", "Member invite was created successfully.");
        onCreated();
        return;
      }

      setCreatedInvite({
        fullName: trimmedName,
        role,
        token,
        expiresAt: response.data?.token?.expires_at,
      });
    } catch (error) {
      feedback.showError("Invite failed", error, getApiMessage(error, "Please try again."));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.intro}>
        <Text style={styles.pageTitle}>Invite member</Text>
        <Text style={styles.pageSubtitle}>
          Send a join link to a family member or tenant for flat{" "}
          {selectedResidence?.flat_number ?? "—"}.
        </Text>
      </View>

      <Card style={styles.formCard}>
        <Input autoCapitalize="words" label="Full name" value={fullName} onChangeText={setFullName} />
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
          <Text style={styles.roleHint}>{titleize(role)} members can access resident features.</Text>
        </View>
      </Card>

      <Button
        loading={createInviteState.isLoading}
        title="Create invite link"
        onPress={() => void handleCreate()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing["2xl"],
    paddingBottom: spacing["3xl"],
  },
  formCard: {
    gap: spacing.lg,
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
  roleHint: {
    ...typography.caption,
    color: colors.text.muted,
  },
  roleLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: "600",
  },
  roleSection: {
    gap: spacing.sm,
  },
});

import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/ui";
import { titleize } from "@/features/guard/guard-utils";
import type { ModelsFlatResidentResponse } from "@/lib/api/generated-api";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

type MemberCardProps = {
  member: ModelsFlatResidentResponse;
};

function roleLabel(role?: string | null) {
  if (role === "owner") {
    return "Owner";
  }
  if (role === "tenant") {
    return "Tenant";
  }
  return "Family";
}

export function MemberCard({ member }: MemberCardProps) {
  const name = member.user_name ?? "Member";

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.nameBlock}>
          <Text style={styles.name}>{name}</Text>
          {member.user_phone ? <Text style={styles.contact}>{member.user_phone}</Text> : null}
          {member.user_email ? <Text style={styles.contact}>{member.user_email}</Text> : null}
        </View>
        <View style={styles.badges}>
          {member.is_primary ? (
            <View style={styles.primaryBadge}>
              <Text style={styles.primaryText}>Primary</Text>
            </View>
          ) : null}
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{roleLabel(member.role)}</Text>
          </View>
        </View>
      </View>
      {member.role && member.role !== "owner" ? (
        <Text style={styles.meta}>{titleize(member.role)} member</Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  badges: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  card: {
    gap: spacing.sm,
  },
  contact: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  header: {
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  meta: {
    ...typography.caption,
    color: colors.text.muted,
  },
  name: {
    ...typography.subtitle,
    color: colors.text.primary,
    fontWeight: "700",
  },
  nameBlock: {
    flex: 1,
    gap: 2,
  },
  primaryBadge: {
    backgroundColor: colors.operational.primarySoft,
    borderRadius: radius["2xl"],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  primaryText: {
    ...typography.caption,
    color: colors.operational.teal,
    fontWeight: "700",
  },
  roleBadge: {
    backgroundColor: colors.surface.screen,
    borderRadius: radius["2xl"],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  roleText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: "600",
  },
});

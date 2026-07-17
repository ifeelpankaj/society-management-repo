import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/lib/theme";

type SelectionCardProps = {
  title: string;
  subtitle: string;
  actionLabel: string;
  badgeLabel?: string;
  badgeTone?: "active" | "pending" | "default";
  selected?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

const badgeStyles = {
  active: {
    backgroundColor: "#ecfdf3",
    color: "#15803d",
  },
  pending: {
    backgroundColor: "#fff7ed",
    color: "#c2410c",
  },
  default: {
    backgroundColor: "#f3f4f6",
    color: "#4b5563",
  },
} as const;

export function SelectionCard({
  title,
  subtitle,
  actionLabel,
  badgeLabel,
  badgeTone = "default",
  selected = false,
  disabled = false,
  onPress,
}: SelectionCardProps) {
  const badge = badgeStyles[badgeTone];

  return (
    <View
      style={[
        styles.card,
        selected && styles.cardSelected,
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardCopy}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
        {badgeLabel ? (
          <View style={[styles.statusBadge, { backgroundColor: badge.backgroundColor }]}>
            <Text style={[styles.statusText, { color: badge.color }]}>{badgeLabel}</Text>
          </View>
        ) : null}
      </View>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={onPress}
        style={[styles.cardButton, disabled && styles.cardButtonDisabled]}
      >
        <Text style={styles.cardButtonText}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.selection.cardBg,
    borderColor: theme.selection.cardBorder,
    borderRadius: theme.selection.cardRadius,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  cardButton: {
    alignItems: "center",
    backgroundColor: theme.brand.orange,
    borderRadius: 14,
    justifyContent: "center",
    minHeight: 46,
  },
  cardButtonDisabled: {
    opacity: 0.55,
  },
  cardButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  cardCopy: {
    flex: 1,
    gap: 4,
  },
  cardHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
  },
  cardSelected: {
    borderColor: theme.guard.teal,
    borderWidth: 2,
  },
  cardSubtitle: {
    color: theme.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  cardTitle: {
    color: theme.text.primary,
    fontSize: 18,
    fontWeight: "700",
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
});

import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import type { SymbolViewProps } from "expo-symbols";

import { Row, Stack } from "@/components/layout";
import { BrandMark } from "@/components/dashboard/brand-mark";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export type DashboardHeaderAction = {
  accessibilityLabel: string;
  icon: SymbolViewProps["name"];
  onPress: () => void;
  showBadge?: boolean;
};

export type DashboardStatusItem = {
  label: string;
  live?: boolean;
};

type DashboardHeaderProps = {
  actions?: DashboardHeaderAction[];
  greeting?: string;
  leading?: ReactNode;
  showBrand?: boolean;
  statusItems?: DashboardStatusItem[];
  title: string;
};

export function DashboardHeader({
  actions = [],
  greeting,
  leading,
  showBrand = true,
  statusItems = [],
  title,
}: DashboardHeaderProps) {
  return (
    <Stack gap="xl">
      <Row align="center" justify="space-between">
        {showBrand ? <BrandMark size="sm" /> : leading}
        {actions.length > 0 ? (
          <Row align="center" gap="md" justify="flex-start">
            {actions.map((action) => (
              <Pressable
                key={action.accessibilityLabel}
                accessibilityLabel={action.accessibilityLabel}
                accessibilityRole="button"
                hitSlop={8}
                style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
                onPress={action.onPress}
              >
                <SymbolView name={action.icon} size={22} tintColor={colors.guard.text} />
                {action.showBadge ? <View style={styles.notificationDot} /> : null}
              </Pressable>
            ))}
          </Row>
        ) : null}
      </Row>

      <Stack gap="xs">
        {greeting ? <Text style={styles.greeting}>{greeting}</Text> : null}
        <Text numberOfLines={2} style={styles.title}>
          {title}
        </Text>
        {statusItems.length > 0 ? (
          <Row align="center" gap="sm" justify="flex-start">
            {statusItems.map((item, index) => (
              <Row key={item.label} align="center" gap="sm" justify="flex-start">
                {index > 0 ? <Text style={styles.separator}>•</Text> : null}
                {item.live !== undefined ? (
                  <Row align="center" gap={6} justify="flex-start">
                    <View
                      style={[
                        styles.liveDot,
                        {
                          backgroundColor: item.live
                            ? colors.status.success
                            : colors.guard.textMuted,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusLabel,
                        {
                          color: item.live ? colors.status.success : colors.guard.textMuted,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Row>
                ) : (
                  <Text style={styles.statusLabelMuted}>{item.label}</Text>
                )}
              </Row>
            ))}
          </Row>
        ) : null}
      </Stack>
    </Stack>
  );
}

const styles = StyleSheet.create({
  greeting: {
    color: colors.text.secondary,
    fontSize: 15,
    fontWeight: "500",
  },
  iconButton: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    position: "relative",
    width: 40,
  },
  iconButtonPressed: {
    opacity: 0.65,
  },
  liveDot: {
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  notificationDot: {
    backgroundColor: colors.status.error,
    borderColor: colors.surface.card,
    borderRadius: 999,
    borderWidth: 2,
    height: 10,
    position: "absolute",
    right: 6,
    top: 6,
    width: 10,
  },
  separator: {
    color: colors.guard.textMuted,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  statusLabelMuted: {
    color: colors.guard.textMuted,
    fontSize: 14,
    fontWeight: "500",
  },
  title: {
    color: colors.guard.text,
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
});

import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { Row, Stack } from "@/components/layout";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

type DashboardSectionProps = {
  actionLabel?: string;
  children: ReactNode;
  onAction?: () => void;
  subtitle?: string;
  title: string;
  trailing?: string;
};

export function DashboardSection({
  actionLabel,
  children,
  onAction,
  subtitle,
  title,
  trailing,
}: DashboardSectionProps) {
  return (
    <Stack gap="lg">
      <Row align="flex-start" gap="md">
        <Stack gap="xs" style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </Stack>
        {actionLabel && onAction ? (
          <Pressable accessibilityRole="button" hitSlop={8} onPress={onAction}>
            <Text style={styles.action}>{actionLabel}</Text>
          </Pressable>
        ) : null}
        {trailing ? <Text style={styles.action}>{trailing}</Text> : null}
      </Row>
      {children}
    </Stack>
  );
}

const styles = StyleSheet.create({
  action: {
    color: colors.brand.orange,
    fontSize: 14,
    fontWeight: "700",
  },
  copy: {
    flex: 1,
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  title: {
    color: colors.guard.text,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
});

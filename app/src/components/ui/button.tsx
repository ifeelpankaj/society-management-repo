import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from "react-native";

import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";
import { radius } from "@/theme/radius";
import { shadows } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = PressableProps & {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  compact?: boolean;
};

export function Button({
  title,
  variant = "primary",
  loading = false,
  disabled,
  fullWidth = true,
  compact = false,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={(state) => [
        styles.base,
        compact ? styles.compact : styles.default,
        fullWidth && styles.fullWidth,
        styles[variant],
        isDisabled && styles.disabled,
        state.pressed && !isDisabled && styles.pressed,
        typeof style === "function" ? style(state) : style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "secondary" || variant === "ghost"
              ? colors.text.primary
              : colors.text.inverse
          }
        />
      ) : (
        <Text style={[compact ? typography.buttonCompact : typography.button, styles[`${variant}Text` as keyof typeof styles]]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: radius.lg,
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  compact: {
    minHeight: layout.buttonHeightCompact,
  },
  danger: {
    backgroundColor: colors.status.danger,
  },
  dangerText: {
    color: colors.text.inverse,
  },
  default: {
    minHeight: layout.buttonHeight,
  },
  disabled: {
    opacity: 0.55,
  },
  fullWidth: {
    width: "100%",
  },
  ghost: {
    backgroundColor: "transparent",
  },
  ghostText: {
    color: colors.text.ghost,
  },
  pressed: {
    opacity: 0.8,
  },
  primary: {
    backgroundColor: colors.brand.orange,
    ...shadows.brand,
  },
  primaryText: {
    color: colors.text.inverse,
  },
  secondary: {
    backgroundColor: colors.surface.secondary,
    borderColor: colors.border.input,
    borderWidth: 1,
  },
  secondaryText: {
    color: colors.text.secondaryDark,
  },
});

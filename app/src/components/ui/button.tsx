import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native";

import { theme } from "@/lib/theme";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = PressableProps & {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  compact?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "shadow-sm",
  secondary: "border border-[#e4dcd6] bg-[#fffaf6]",
  ghost: "bg-transparent",
  danger: "bg-rose-600",
};

const textClasses: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-[#211714]",
  ghost: "text-[#625852]",
  danger: "text-white",
};

export function Button({
  title,
  variant = "primary",
  loading = false,
  disabled,
  fullWidth = true,
  compact = false,
  className,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const primaryStyle =
    variant === "primary"
      ? {
          backgroundColor: theme.brand.orange,
          boxShadow: `0 10px 20px ${theme.brand.orangeShadow}`,
        }
      : undefined;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={[
        "flex-row items-center justify-center rounded-2xl px-5",
        compact ? "min-h-11" : "min-h-14",
        fullWidth ? "w-full" : "",
        variantClasses[variant],
        isDisabled ? "opacity-55" : "active:opacity-80",
        className ?? "",
      ].join(" ")}
      style={(state) => [
        primaryStyle,
        typeof style === "function" ? style(state) : style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "secondary" || variant === "ghost"
              ? theme.text.primary
              : "#ffffff"
          }
        />
      ) : (
        <Text
          className={[
            compact ? "text-sm font-bold" : "text-base font-semibold",
            textClasses[variant],
          ].join(" ")}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

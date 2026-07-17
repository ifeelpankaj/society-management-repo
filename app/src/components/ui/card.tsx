import { View, type ViewProps } from "react-native";

import { theme } from "@/lib/theme";

export function Card({ className, ...props }: ViewProps) {
  return (
    <View
      className={["rounded-2xl border p-5", className ?? ""].join(" ")}
      style={{
        backgroundColor: theme.surface.card,
        borderColor: theme.border.default,
        boxShadow: theme.guard.cardShadow,
      }}
      {...props}
    />
  );
}

import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { Row } from "@/components/layout";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

type BrandMarkProps = {
  size?: "sm" | "md";
};

export function BrandMark({ size = "md" }: BrandMarkProps) {
  const iconSize = size === "sm" ? 28 : 32;
  const fontSize = size === "sm" ? 18 : 20;

  return (
    <Row align="center" gap="sm" justify="flex-start">
      <Image
        accessibilityLabel="ApnaGate logo"
        source={require("@/assets/images/logo-glow.png")}
        style={{ height: iconSize, width: iconSize }}
      />
      <Text style={[styles.brandText, { fontSize }]}>ApnaGate</Text>
    </Row>
  );
}

const styles = StyleSheet.create({
  brandText: {
    color: colors.text.primary,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
});

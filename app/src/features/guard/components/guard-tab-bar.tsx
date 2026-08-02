import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { ScanQrIcon } from "@/components/icons";
import { GuardTabIcon } from "@/features/guard/components/guard-tab-icons";
import {
  guardHomeRoute,
  guardProfileRoute,
  guardScannerRoute,
} from "@/features/guard/guard-routes";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

type GuardTab = "home" | "profile";

type GuardTabBarState = {
  index: number;
  routes: Array<{ name: string }>;
};

const BAR_HEIGHT = 64;
const FAB_SIZE = 58;
const NOTCH_RADIUS = FAB_SIZE / 2 + 10; // notch a bit wider than the FAB
const CORNER_RADIUS = 28;

function resolveActiveTab(pathname: string, state: GuardTabBarState): GuardTab {
  if (pathname.includes("/profile")) return "profile";
  const routeName = state.routes[state.index]?.name;
  if (routeName === "profile") return "profile";
  return "home";
}

/** Builds the rounded-rect + center notch path for the bar background. */
function buildBarPath(width: number, height: number) {
  const cx = width / 2;
  const r = CORNER_RADIUS;
  const nr = NOTCH_RADIUS;

  return `
    M0,${r}
    Q0,0 ${r},0
    L${cx - nr - 14},0
    C${cx - nr + 4},0 ${cx - nr + 6},${nr * 0.85} ${cx - nr * 0.5},${nr * 0.85}
    C${cx - nr * 0.15},${nr} ${cx + nr * 0.15},${nr} ${cx + nr * 0.5},${nr * 0.85}
    C${cx + nr - 6},${nr * 0.85} ${cx + nr - 4},0 ${cx + nr + 14},0
    L${width - r},0
    Q${width},0 ${width},${r}
    L${width},${height - r}
    Q${width},${height} ${width - r},${height}
    L${r},${height}
    Q0,${height} 0,${height - r}
    Z
  `;
}

export function GuardTabBar({ state }: { state: GuardTabBarState }) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const activeTab = resolveActiveTab(pathname, state);

  const goToTab = (tab: GuardTab) => {
    if (tab === activeTab) return;
    router.replace(tab === "profile" ? guardProfileRoute() : guardHomeRoute());
  };

  return (
    <View
      style={[
        styles.wrapper,
        { paddingBottom: Math.max(insets.bottom, spacing.sm) },
      ]}
    >
      <View style={styles.barContainer}>
        {/* Notched background */}
        <Svg
          width="100%"
          height={BAR_HEIGHT}
          viewBox={`0 0 340 ${BAR_HEIGHT}`}
          style={StyleSheet.absoluteFill}
        >
          <Path
            d={buildBarPath(340, BAR_HEIGHT)}
            fill={colors.brand.orangeSoft ?? "#1B1F3B"}
          />
        </Svg>

        <View style={styles.row}>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === "home" }}
            style={styles.tab}
            onPress={() => goToTab("home")}
          >
            <GuardTabIcon
              color={
                activeTab === "home"
                  ? colors.brand.orange
                  : colors.text.placeholder
              }
              name="dashboard"
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === "home"
                  ? styles.tabLabelActive
                  : styles.tabLabelInactive,
              ]}
            >
              Home
            </Text>
          </Pressable>

          {/* Empty slot so the two side tabs stay evenly spaced around the FAB */}
          <View style={styles.fabSpacer} />

          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === "profile" }}
            style={styles.tab}
            onPress={() => goToTab("profile")}
          >
            <GuardTabIcon
              color={
                activeTab === "profile"
                  ? colors.brand.orange
                  : colors.text.placeholder
              }
              name="profile"
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === "profile"
                  ? styles.tabLabelActive
                  : styles.tabLabelInactive,
              ]}
            >
              Profile
            </Text>
          </Pressable>
        </View>

        {/* Floating Scan button, sitting in the notch */}
        <Pressable
          accessibilityLabel="Scan QR"
          accessibilityRole="button"
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
          onPress={() => router.push(guardScannerRoute())}
        >
          <ScanQrIcon color={colors.brand.orangeSoft ?? "#1B1F3B"} size={22} />
        </Pressable>
        <Text style={styles.fabLabel}>Scan</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    backgroundColor: "transparent",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  barContainer: {
    alignSelf: "stretch",
    height: BAR_HEIGHT,
    width: "100%",
  },
  row: {
    flexDirection: "row",
    height: "100%",
  },
  tab: {
    alignItems: "center",
    flex: 1,
    gap: 4,
    justifyContent: "center",
  },
  fabSpacer: {
    width: FAB_SIZE + 20,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  tabLabelActive: {
    color: colors.brand.orange,
  },
  tabLabelInactive: {
    color: colors.text.placeholder,
  },
  fab: {
    alignItems: "center",
    backgroundColor: colors.brand.orange,
    borderRadius: FAB_SIZE / 2,
    height: FAB_SIZE,
    justifyContent: "center",
    left: "50%",
    marginLeft: -FAB_SIZE / 2,
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    top: -FAB_SIZE / 2 + 6,
    width: FAB_SIZE,
  },
  fabPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
  fabLabel: {
    color: colors.text.placeholder,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
    position: "absolute",
    textAlign: "center",
    top: BAR_HEIGHT - 18,
    width: "100%",
  },
});

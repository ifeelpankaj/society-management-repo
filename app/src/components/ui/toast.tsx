// import {
//   createContext,
//   type PropsWithChildren,
//   useCallback,
//   useContext,
//   useRef,
//   useState,
// } from "react";
// import { Platform, StyleSheet, Text, ToastAndroid, View } from "react-native";

// import { colors } from "@/theme/colors";
// import { radius } from "@/theme/radius";
// import { spacing } from "@/theme/spacing";
// import { typography } from "@/theme/typography";

// type ToastVariant = "error" | "success" | "info";

// type ToastOptions = {
//   title: string;
//   message?: string;
//   variant?: ToastVariant;
// };

// type ToastContextValue = {
//   showToast: (options: ToastOptions) => void;
// };

// const ToastContext = createContext<ToastContextValue | null>(null);

// export function ToastProvider({ children }: PropsWithChildren) {
//   const [toast, setToast] = useState<ToastOptions | null>(null);
//   const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   const showToast = useCallback((options: ToastOptions) => {
//     const nextToast = { variant: "info" as ToastVariant, ...options };
//     const text = nextToast.message
//       ? `${nextToast.title}: ${nextToast.message}`
//       : nextToast.title;

//     if (timeoutRef.current) {
//       clearTimeout(timeoutRef.current);
//     }

//     if (Platform.OS === "android") {
//       ToastAndroid.show(text, ToastAndroid.LONG);
//       return;
//     }

//     setToast(nextToast);
//     timeoutRef.current = setTimeout(() => setToast(null), 3500);
//   }, []);

//   return (
//     <ToastContext.Provider value={{ showToast }}>
//       {children}
//       {toast ? (
//         <View style={[StyleSheet.absoluteFill, styles.host]}>
//           <View style={[styles.toast, styles[toast.variant ?? "info"]]}>
//             <Text style={styles.title}>{toast.title}</Text>
//             {toast.message ? (
//               <Text style={styles.message}>{toast.message}</Text>
//             ) : null}
//           </View>
//         </View>
//       ) : null}
//     </ToastContext.Provider>
//   );
// }

// export function useToast() {
//   const context = useContext(ToastContext);

//   if (!context) {
//     throw new Error("useToast must be used inside ToastProvider");
//   }

//   return context;
// }

// const styles = StyleSheet.create({
//   error: {
//     borderLeftColor: colors.status.error,
//   },
//   host: {
//     position: "absolute",
//     top: 50, // or use SafeAreaInsets
//     left: 16,
//     right: 16,
//     alignItems: "center",
//     zIndex: 9999,
//     elevation: 9999,
//     pointerEvents: "none",
//     justifyContent: "flex-start",
//     paddingHorizontal: 18,
//     paddingTop: 54,
//   },
//   info: {
//     borderLeftColor: colors.brand.orange,
//   },
//   message: {
//     ...typography.bodySmall,
//     color: colors.text.ghost,
//     fontSize: 13,
//     lineHeight: 18,
//   },
//   success: {
//     borderLeftColor: colors.status.success,
//   },
//   title: {
//     ...typography.bodySmall,
//     color: colors.text.secondaryDark,
//     fontWeight: "700",
//   },
//   toast: {
//     alignSelf: "center",
//     backgroundColor: colors.surface.card,
//     borderLeftWidth: 4,
//     borderRadius: radius.md,
//     gap: 3,
//     maxWidth: 420,
//     paddingHorizontal: 14,
//     paddingVertical: spacing.md,
//     width: "100%",
//     ...(Platform.OS === "web"
//       ? { boxShadow: "0 12px 26px rgba(0, 0, 0, 0.16)" }
//       : {
//           elevation: 8,
//           shadowColor: "#000000",
//           shadowOffset: { width: 0, height: 12 },
//           shadowOpacity: 0.16,
//           shadowRadius: 26,
//         }),
//   },
// });
import { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import ToastMessage from "react-native-toast-message";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

// ── Types ──────────────────────────────────────────────────────────────────

export type ToastVariant = "error" | "success" | "info" | "warning";

type ToastConfigParams = {
  type: string;
  text1?: string;
  text2?: string;
  hide: () => void;
  props?: { duration?: number };
};

type ShowToastOptions = {
  title: string;
  message?: string;
  variant?: ToastVariant;
  duration?: number;
};

const DEFAULT_DURATION = 3500;
const TOP_OFFSET = 54;

// Distinct accent per variant — saturated on purpose, kept local to the
// toast so the rest of the app's palette stays untouched.
const VARIANT: Record<ToastVariant, { accent: string }> = {
  error: { accent: "#FF5A6E" },
  success: { accent: "#33DDA8" },
  info: { accent: "#7C9CFF" },
  warning: { accent: "#FFB648" },
};

// ── Icons ──────────────────────────────────────────────────────────────────

function ToastGlyph({
  variant,
  size = 15,
}: {
  variant: ToastVariant;
  size?: number;
}) {
  const stroke = "#0B0B10";

  switch (variant) {
    case "success":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M5 12.5L10 17.5L19.5 7"
            stroke={stroke}
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "error":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Line
            x1="6"
            y1="6"
            x2="18"
            y2="18"
            stroke={stroke}
            strokeWidth={2.6}
            strokeLinecap="round"
          />
          <Line
            x1="18"
            y1="6"
            x2="6"
            y2="18"
            stroke={stroke}
            strokeWidth={2.6}
            strokeLinecap="round"
          />
        </Svg>
      );
    case "warning":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Line
            x1="13.4"
            y1="5.5"
            x2="11.6"
            y2="15"
            stroke={stroke}
            strokeWidth={2.6}
            strokeLinecap="round"
          />
          <Circle cx="10.9" cy="18.4" r="1.5" fill={stroke} />
        </Svg>
      );
    case "info":
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="14.1" cy="6.6" r="1.6" fill={stroke} />
          <Line
            x1="13.4"
            y1="10.4"
            x2="10.6"
            y2="18.4"
            stroke={stroke}
            strokeWidth={2.6}
            strokeLinecap="round"
          />
        </Svg>
      );
  }
}

// ── Card ───────────────────────────────────────────────────────────────────

function ToastCard({ type, text1, text2, hide, props }: ToastConfigParams) {
  const variant = (
    VARIANT[type as ToastVariant] ? type : "info"
  ) as ToastVariant;
  const duration = props?.duration ?? DEFAULT_DURATION;
  const progress = useRef(new Animated.Value(0)).current;

  // Re-mounted per toast instance by the library, so resetting on mount
  // keeps the depleting bar in sync with each new toast's lifespan.
  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [duration, progress]);

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["100%", "0%"],
  });

  return (
    <View style={styles.container}>
      <View style={[styles.toast, { shadowColor: VARIANT[variant].accent }]}>
        <View style={styles.row}>
          <View
            style={[
              styles.iconBadge,
              {
                backgroundColor: VARIANT[variant].accent,
                shadowColor: VARIANT[variant].accent,
              },
            ]}
          >
            <ToastGlyph variant={variant} />
          </View>

          <View style={styles.textWrap}>
            {text1 ? (
              <Text style={styles.title} numberOfLines={2}>
                {text1}
              </Text>
            ) : null}
            {text2 ? (
              <Text style={styles.message} numberOfLines={3}>
                {text2}
              </Text>
            ) : null}
          </View>

          <Pressable onPress={hide} hitSlop={10} style={styles.closeButton}>
            <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
              <Line
                x1="6"
                y1="6"
                x2="18"
                y2="18"
                stroke={colors.text.ghost}
                strokeWidth={2}
                strokeLinecap="round"
              />
              <Line
                x1="18"
                y1="6"
                x2="6"
                y2="18"
                stroke={colors.text.ghost}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </Svg>
          </Pressable>
        </View>

        <View style={styles.trackWrap}>
          <Animated.View
            style={[
              styles.track,
              { width: barWidth, backgroundColor: VARIANT[variant].accent },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

// ── Config + mount point ────────────────────────────────────────────────────

export const toastConfig = {
  success: (p: ToastConfigParams) => <ToastCard {...p} />,
  error: (p: ToastConfigParams) => <ToastCard {...p} />,
  info: (p: ToastConfigParams) => <ToastCard {...p} />,
  warning: (p: ToastConfigParams) => <ToastCard {...p} />,
};

/** Mount once at the root of the app, e.g. as the last sibling in App.tsx / root layout. */
export function AppToast() {
  return (
    <ToastMessage config={toastConfig} position="top" topOffset={TOP_OFFSET} />
  );
}

// ── Hook (keeps the existing call-site API) ────────────────────────────────

export function useToast() {
  const showToast = useCallback((options: ShowToastOptions) => {
    const {
      title,
      message,
      variant = "info",
      duration = DEFAULT_DURATION,
    } = options;

    ToastMessage.show({
      type: variant,
      text1: title,
      text2: message,
      position: "top",
      topOffset: TOP_OFFSET,
      visibilityTime: duration,
      props: { duration },
    });
  }, []);

  const hideToast = useCallback(() => ToastMessage.hide(), []);

  return { showToast, hideToast };
}

// ── Styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    width: "92%",
    maxWidth: 420,
    alignSelf: "center",
  },
  toast: {
    borderRadius: radius.lg ?? 18,
    backgroundColor: "rgba(18, 18, 24, 0.94)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.10)",
    overflow: "hidden",
    elevation: 10,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.32,
    shadowRadius: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: spacing.md,
    gap: 12,
  },
  iconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 8,
    elevation: 4,
  },
  textWrap: {
    flex: 1,
    gap: 3,
    paddingTop: 1,
  },
  title: {
    ...typography.bodySmall,
    color: "#F5F5F8",
    fontWeight: "700",
    letterSpacing: 0.15,
  },
  message: {
    ...typography.bodySmall,
    color: "rgba(245, 245, 248, 0.62)",
    fontSize: 13,
    lineHeight: 18,
  },
  closeButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    marginTop: 2,
  },
  trackWrap: {
    height: 2,
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  track: {
    height: "100%",
    borderRadius: 2,
  },
});

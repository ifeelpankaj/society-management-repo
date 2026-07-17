import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { Platform, StyleSheet, Text, ToastAndroid, View } from "react-native";

type ToastVariant = "error" | "success" | "info";

type ToastOptions = {
  title: string;
  message?: string;
  variant?: ToastVariant;
};

type ToastContextValue = {
  showToast: (options: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((options: ToastOptions) => {
    const nextToast = { variant: "info" as ToastVariant, ...options };
    const text = nextToast.message
      ? `${nextToast.title}: ${nextToast.message}`
      : nextToast.title;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (Platform.OS === "android") {
      ToastAndroid.show(text, ToastAndroid.LONG);
      return;
    }

    setToast(nextToast);
    timeoutRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast ? (
        <View style={[StyleSheet.absoluteFill, styles.host]}>
          <View style={[styles.toast, styles[toast.variant ?? "info"]]}>
            <Text style={styles.title}>{toast.title}</Text>
            {toast.message ? (
              <Text style={styles.message}>{toast.message}</Text>
            ) : null}
          </View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}

const styles = StyleSheet.create({
  error: {
    borderLeftColor: "#dc2626",
  },
  host: {
    justifyContent: "flex-start",
    paddingHorizontal: 18,
    paddingTop: 54,
    pointerEvents: "none",
    zIndex: 999,
  },
  info: {
    borderLeftColor: "#ff6a1a",
  },
  message: {
    color: "#5f5753",
    fontSize: 13,
    lineHeight: 18,
  },
  success: {
    borderLeftColor: "#16a34a",
  },
  title: {
    color: "#211714",
    fontSize: 14,
    fontWeight: "700",
  },
  toast: {
    alignSelf: "center",
    backgroundColor: "#ffffff",
    borderLeftWidth: 4,
    borderRadius: 14,
    boxShadow: "0 12px 26px rgba(0, 0, 0, 0.16)",
    gap: 3,
    maxWidth: 420,
    paddingHorizontal: 14,
    paddingVertical: 12,
    width: "100%",
  },
});

import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  DATE_RANGE_OPTIONS,
  type DateRangePreset,
} from "@/features/guard/guard-routes";
import { theme } from "@/theme";

const G = theme.guard;

type LogsDateSheetProps = {
  onApply: (preset: DateRangePreset) => void;
  onClose: () => void;
  selected: DateRangePreset;
  visible: boolean;
};

export function LogsDateSheet({ onApply, onClose, selected, visible }: LogsDateSheetProps) {
  const [draft, setDraft] = useState<DateRangePreset>(selected);

  useEffect(() => {
    if (visible) {
      setDraft(selected);
    }
  }, [selected, visible]);

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable onPress={(event) => event.stopPropagation()}>
          <SafeAreaView edges={["bottom"]} style={styles.sheet}>
            <View style={styles.body}>
              <View style={styles.headerRow}>
                <Text style={styles.title}>Select Date</Text>
                <Pressable accessibilityRole="button" hitSlop={8} onPress={onClose}>
                  <Text style={styles.closeText}>Close</Text>
                </Pressable>
              </View>

              <View style={styles.options}>
                {DATE_RANGE_OPTIONS.map((option) => {
                  const active = draft === option.value;

                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="button"
                      style={[styles.option, active ? styles.optionActive : null]}
                      onPress={() => setDraft(option.value)}
                    >
                      <Text style={[styles.optionText, active ? styles.optionTextActive : null]}>
                        {active ? `✓ ${option.label}` : option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.footer}>
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.footerButton, styles.resetButton, pressed && styles.pressed]}
                  onPress={() => setDraft("today")}
                >
                  <Text style={styles.resetText}>Reset</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.footerButton, styles.applyButton, pressed && styles.pressed]}
                  onPress={() => {
                    onApply(draft);
                    onClose();
                  }}
                >
                  <Text style={styles.applyText}>Apply</Text>
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  applyButton: {
    backgroundColor: G.teal,
    borderColor: G.teal,
  },
  applyText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  backdrop: {
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    flex: 1,
    justifyContent: "flex-end",
  },
  body: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  closeText: {
    color: G.teal,
    fontSize: 15,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  footerButton: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    flex: 1,
    justifyContent: "center",
    minHeight: 50,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  option: {
    borderBottomColor: theme.border.default,
    borderBottomWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 14,
  },
  optionActive: {
    backgroundColor: G.tealSoft,
  },
  optionText: {
    color: G.textMuted,
    fontSize: 15,
    fontWeight: "500",
  },
  optionTextActive: {
    color: G.teal,
    fontWeight: "700",
  },
  options: {
    borderColor: theme.border.default,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  pressed: {
    opacity: 0.88,
  },
  resetButton: {
    backgroundColor: theme.surface.muted,
    borderColor: theme.border.default,
  },
  resetText: {
    color: G.text,
    fontSize: 15,
    fontWeight: "700",
  },
  sheet: {
    backgroundColor: theme.surface.card,
  },
  title: {
    color: G.text,
    fontSize: 17,
    fontWeight: "700",
  },
});

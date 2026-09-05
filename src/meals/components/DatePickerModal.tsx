import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "@/shared/theme/colors";

type DatePickerModalProps = {
  isVisible: boolean;
  selectedDate: Date;
  onCancel: () => void;
  onSelectDate: (date: Date) => void;
};

export function DatePickerModal({
  isVisible,
  selectedDate,
  onCancel,
  onSelectDate,
}: DatePickerModalProps) {
  const [draftDate, setDraftDate] = useState(selectedDate);

  useEffect(() => {
    if (isVisible) {
      setDraftDate(selectedDate);
    }
  }, [isVisible, selectedDate]);

  if (!isVisible) {
    return null;
  }

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") {
      if (event.type === "set" && date) {
        onSelectDate(date);
      } else {
        onCancel();
      }
      return;
    }

    if (date) {
      setDraftDate(date);
    }
  };

  if (Platform.OS === "android") {
    return (
      <DateTimePicker
        accessibilityLabel="日付を選択"
        display="calendar"
        mode="date"
        onChange={handleChange}
        value={selectedDate}
      />
    );
  }

  return (
    <Modal
      animationType="fade"
      onRequestClose={onCancel}
      transparent
      visible={isVisible}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>日付を選択</Text>
          <DateTimePicker
            accessibilityLabel="日付を選択"
            display="inline"
            mode="date"
            onChange={handleChange}
            value={draftDate}
          />
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={onCancel}>
              <Text style={styles.cancelText}>キャンセル</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => onSelectDate(draftDate)}
              style={styles.confirmButton}
            >
              <Text style={styles.confirmText}>選択</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  dialog: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    maxWidth: 420,
    padding: 20,
    width: "100%",
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 24,
    justifyContent: "flex-end",
    marginTop: 12,
  },
  cancelText: {
    color: colors.textMuted,
    fontWeight: "700",
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  confirmText: {
    color: colors.surface,
    fontWeight: "800",
  },
});

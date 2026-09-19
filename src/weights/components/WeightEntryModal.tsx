import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { colors } from "@/shared/theme/colors";

type WeightEntryModalProps = {
  error?: string;
  initialValue: string;
  isSaving: boolean;
  isVisible: boolean;
  title: string;
  onCancel: () => void;
  onChange: () => void;
  onSave: (value: string) => void;
};

export function WeightEntryModal({
  error,
  initialValue,
  isSaving,
  isVisible,
  title,
  onCancel,
  onChange,
  onSave,
}: WeightEntryModalProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (isVisible) {
      setValue(initialValue);
    }
  }, [initialValue, isVisible]);

  return (
    <Modal
      animationType="slide"
      onRequestClose={onCancel}
      transparent
      visible={isVisible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="体重入力を閉じる"
              disabled={isSaving}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>キャンセル</Text>
            </Pressable>
            <Text style={styles.title}>{title}</Text>
            <Pressable
              accessibilityLabel="体重を保存"
              disabled={isSaving}
              onPress={() => onSave(value)}
            >
              <Text style={[styles.saveText, isSaving && styles.disabledText]}>
                保存
              </Text>
            </Pressable>
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>体重（kg）</Text>
            <View style={[styles.inputFrame, error && styles.inputError]}>
              <TextInput
                accessibilityLabel="体重"
                autoFocus
                keyboardType="decimal-pad"
                onChangeText={(nextValue) => {
                  setValue(nextValue);
                  onChange();
                }}
                selectTextOnFocus
                style={styles.input}
                value={value}
              />
              <Text style={styles.unit}>kg</Text>
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(16, 38, 27, 0.45)",
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
  },
  header: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 62,
    paddingHorizontal: 18,
  },
  cancelText: { color: colors.textMuted, fontSize: 12, fontWeight: "700" },
  title: { color: colors.text, fontSize: 15, fontWeight: "800" },
  saveText: { color: colors.primary, fontSize: 13, fontWeight: "800" },
  disabledText: { opacity: 0.5 },
  content: { padding: 20 },
  label: { color: colors.textMuted, fontSize: 11, marginBottom: 7 },
  inputFrame: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 52,
    paddingHorizontal: 12,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 20,
    minHeight: 50,
  },
  unit: { color: colors.textMuted, fontSize: 12, fontWeight: "700" },
  inputError: { borderColor: "#C43D3D" },
  errorText: { color: "#C43D3D", fontSize: 10, marginTop: 5 },
});

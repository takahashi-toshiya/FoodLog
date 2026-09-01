import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  FOOD_MEMO_MAX_LENGTH,
  FOOD_NAME_MAX_LENGTH,
  SERVING_UNIT_MAX_LENGTH,
} from "@/foods/constants/food-input";
import { validateFoodInput } from "@/foods/services/foodInput";
import type { FoodRepository } from "@/foods/storage/FoodRepository";
import type { FoodInputErrors, FoodInputValues } from "@/foods/types/foodInput";
import { calculateCalories } from "@/shared/services/nutrition";
import { colors } from "@/shared/theme/colors";

type AddFoodScreenProps = {
  repository: FoodRepository;
  onCancel: () => void;
  onSaved: () => void;
};

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  placeholder?: string;
  keyboardType?: "default" | "decimal-pad" | "number-pad";
  maxLength?: number;
  multiline?: boolean;
};

function TextField({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  keyboardType = "default",
  maxLength,
  multiline = false,
}: TextFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        keyboardType={keyboardType}
        maxLength={maxLength}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          multiline && styles.memoInput,
          error && styles.inputError,
        ]}
        value={value}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function AddFoodScreen({
  repository,
  onCancel,
  onSaved,
}: AddFoodScreenProps) {
  const [values, setValues] = useState<FoodInputValues>({
    name: "",
    servingAmount: "1",
    servingUnit: "食",
    protein: "",
    fat: "",
    carbs: "",
    calorieMode: "calculated",
    manualCalories: "",
    memo: "",
  });
  const [errors, setErrors] = useState<FoodInputErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const automaticCalories = useMemo(
    () =>
      calculateCalories(
        Number(values.protein) || 0,
        Number(values.fat) || 0,
        Number(values.carbs) || 0,
      ),
    [values.carbs, values.fat, values.protein],
  );

  const updateValue = <Key extends keyof FoodInputValues>(
    key: Key,
    value: FoodInputValues[Key],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSaveError(null);
  };

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    const result = validateFoodInput(values);
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await repository.create(result.value);
      onSaved();
    } catch (error) {
      console.error("食品の保存に失敗しました", error);
      setSaveError("食品を保存できませんでした。もう一度お試しください");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="食品登録を閉じる"
            onPress={onCancel}
            style={styles.headerAction}
          >
            <Text style={styles.closeText}>×</Text>
          </Pressable>
          <Text style={styles.title}>食品を登録</Text>
          <Pressable
            accessibilityLabel="食品を保存"
            disabled={isSaving}
            onPress={handleSave}
            style={styles.headerAction}
          >
            <Text style={[styles.saveText, isSaving && styles.disabledText]}>
              保存
            </Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <TextField
            error={errors.name}
            label="食品名"
            maxLength={FOOD_NAME_MAX_LENGTH}
            onChangeText={(value) => updateValue("name", value)}
            placeholder="例：プロテイン"
            value={values.name}
          />

          <Text style={styles.sectionTitle}>1回分の基準量</Text>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <TextField
                error={errors.servingAmount}
                keyboardType="decimal-pad"
                label="量"
                onChangeText={(value) => updateValue("servingAmount", value)}
                placeholder="例：1"
                value={values.servingAmount}
              />
            </View>
            <View style={styles.halfField}>
              <TextField
                error={errors.servingUnit}
                label="単位"
                maxLength={SERVING_UNIT_MAX_LENGTH}
                onChangeText={(value) => updateValue("servingUnit", value)}
                placeholder="例：食、個、g"
                value={values.servingUnit}
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>1回分の栄養素</Text>
          <View style={styles.nutritionRow}>
            {(
              [
                ["protein", "P たんぱく質"],
                ["fat", "F 脂質"],
                ["carbs", "C 炭水化物"],
              ] as const
            ).map(([key, label]) => (
              <View key={key} style={styles.nutritionField}>
                <TextField
                  error={errors[key]}
                  keyboardType="decimal-pad"
                  label={label}
                  onChangeText={(value) => updateValue(key, value)}
                  placeholder="0"
                  value={values[key]}
                />
              </View>
            ))}
          </View>

          <View style={styles.calorieCard}>
            <View>
              <Text style={styles.calorieLabel}>カロリー</Text>
              <Text style={styles.calorieMode}>
                {values.calorieMode === "calculated"
                  ? "PFCから自動計算"
                  : "手動入力"}
              </Text>
            </View>
            <Text style={styles.calorieValue}>
              {values.calorieMode === "calculated"
                ? automaticCalories
                : Number(values.manualCalories) || 0}{" "}
              <Text style={styles.calorieUnit}>kcal</Text>
            </Text>
          </View>

          <Pressable
            accessibilityLabel="カロリー入力方法を切り替える"
            onPress={() =>
              updateValue(
                "calorieMode",
                values.calorieMode === "calculated" ? "manual" : "calculated",
              )
            }
            style={styles.switchButton}
          >
            <Text style={styles.switchButtonText}>
              {values.calorieMode === "calculated"
                ? "カロリーを手動入力する"
                : "PFCから自動計算する"}
            </Text>
          </Pressable>

          {values.calorieMode === "manual" ? (
            <TextField
              error={errors.manualCalories}
              keyboardType="number-pad"
              label="1回分のカロリー"
              onChangeText={(value) => updateValue("manualCalories", value)}
              placeholder="0"
              value={values.manualCalories}
            />
          ) : null}

          <TextField
            error={errors.memo}
            label="メモ（任意）"
            maxLength={FOOD_MEMO_MAX_LENGTH}
            multiline
            onChangeText={(value) => updateValue("memo", value)}
            placeholder="メーカーや補足など"
            value={values.memo}
          />

          {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}

          <Pressable
            accessibilityLabel="食品を保存する"
            disabled={isSaving}
            onPress={handleSave}
            style={[styles.primaryButton, isSaving && styles.disabledButton]}
          >
            <Text style={styles.primaryButtonText}>
              {isSaving ? "保存しています" : "食品を保存"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  keyboardView: { flex: 1 },
  header: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 58,
  },
  headerAction: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    width: 64,
  },
  closeText: { color: colors.text, fontSize: 26 },
  title: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  saveText: { color: colors.primary, fontSize: 13, fontWeight: "800" },
  disabledText: { opacity: 0.45 },
  content: { padding: 16, paddingBottom: 40 },
  field: { marginBottom: 14 },
  label: { color: colors.textMuted, fontSize: 11, marginBottom: 7 },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.text,
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputError: { borderColor: "#C83E3E" },
  errorText: { color: "#C83E3E", fontSize: 10, marginTop: 5 },
  memoInput: { minHeight: 88, textAlignVertical: "top" },
  sectionTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
  },
  row: { flexDirection: "row", gap: 10 },
  halfField: { flex: 1 },
  nutritionRow: { flexDirection: "row", gap: 8 },
  nutritionField: { flex: 1 },
  calorieCard: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    padding: 14,
  },
  calorieLabel: { color: colors.text, fontSize: 12, fontWeight: "700" },
  calorieMode: { color: colors.primary, fontSize: 9, marginTop: 3 },
  calorieValue: { color: colors.text, fontSize: 22, fontWeight: "800" },
  calorieUnit: { color: colors.textMuted, fontSize: 10, fontWeight: "400" },
  switchButton: {
    alignItems: "flex-end",
    marginBottom: 14,
    paddingVertical: 5,
  },
  switchButtonText: { color: colors.primary, fontSize: 11, fontWeight: "700" },
  saveError: {
    color: "#C83E3E",
    fontSize: 12,
    marginBottom: 12,
    textAlign: "center",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 14,
    justifyContent: "center",
    minHeight: 50,
  },
  disabledButton: { opacity: 0.55 },
  primaryButtonText: { color: colors.surface, fontSize: 14, fontWeight: "800" },
});

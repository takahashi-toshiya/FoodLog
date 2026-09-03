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

import { MEAL_TYPE_LABELS, MEAL_TYPES } from "@/meals/constants/meal-types";
import { validateMealInput } from "@/meals/services/mealInput";
import type { MealRepository } from "@/meals/storage/MealRepository";
import type { MealType } from "@/meals/types/meal";
import type {
  MealInputErrors,
  MealInputPreset,
  MealInputValues,
} from "@/meals/types/mealInput";
import { calculateCalories } from "@/shared/services/nutrition";
import { colors } from "@/shared/theme/colors";

type AddMealScreenProps = {
  initialDate: string;
  initialMealType: MealType;
  initialPreset?: MealInputPreset;
  repository: MealRepository;
  onCancel: () => void;
  onSaved: (date: string) => void;
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

export function AddMealScreen({
  initialDate,
  initialMealType,
  initialPreset,
  repository,
  onCancel,
  onSaved,
}: AddMealScreenProps) {
  const [values, setValues] = useState<MealInputValues>({
    sourceFoodId: initialPreset?.sourceFoodId ?? null,
    date: initialDate,
    mealType: initialMealType,
    name: initialPreset?.name ?? "",
    servingMultiplier: "1",
    protein: initialPreset?.protein ?? "",
    fat: initialPreset?.fat ?? "",
    carbs: initialPreset?.carbs ?? "",
    calorieSource: initialPreset?.calorieSource ?? "calculated",
    manualCalories: initialPreset?.manualCalories ?? "",
    memo: initialPreset?.memo ?? "",
  });
  const [errors, setErrors] = useState<MealInputErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const automaticCalories = useMemo(() => {
    const protein = Number(values.protein) || 0;
    const fat = Number(values.fat) || 0;
    const carbs = Number(values.carbs) || 0;
    const multiplier = Number(values.servingMultiplier) || 0;

    return Math.round(calculateCalories(protein, fat, carbs) * multiplier);
  }, [values.carbs, values.fat, values.protein, values.servingMultiplier]);

  const updateValue = <Key extends keyof MealInputValues>(
    key: Key,
    value: MealInputValues[Key],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSaveError(null);
  };

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    const result = validateMealInput(values);
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await repository.create(result.value);
      onSaved(result.value.date);
    } catch (error) {
      console.error("食事記録の保存に失敗しました", error);
      setSaveError("食事を保存できませんでした。もう一度お試しください");
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
            accessibilityLabel="食事追加を閉じる"
            onPress={onCancel}
            style={styles.headerAction}
          >
            <Text style={styles.closeText}>×</Text>
          </Pressable>
          <Text style={styles.title}>食事を追加</Text>
          <Pressable
            accessibilityLabel="食事を保存"
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
          <View style={styles.row}>
            <View style={styles.halfField}>
              <TextField
                error={errors.date}
                label="日付"
                onChangeText={(value) => updateValue("date", value)}
                placeholder="YYYY-MM-DD"
                value={values.date}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>食事区分</Text>
              <View style={styles.mealTypeGrid}>
                {MEAL_TYPES.map((mealType) => (
                  <Pressable
                    accessibilityLabel={`食事区分を${MEAL_TYPE_LABELS[mealType]}にする`}
                    key={mealType}
                    onPress={() => updateValue("mealType", mealType)}
                    style={[
                      styles.mealTypeButton,
                      values.mealType === mealType && styles.selectedButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.mealTypeText,
                        values.mealType === mealType &&
                          styles.selectedButtonText,
                      ]}
                    >
                      {MEAL_TYPE_LABELS[mealType]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <TextField
            error={errors.name}
            label="食品・料理名"
            maxLength={100}
            onChangeText={(value) => updateValue("name", value)}
            placeholder="例：鮭おにぎり"
            value={values.name}
          />

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

          <TextField
            error={errors.servingMultiplier}
            keyboardType="decimal-pad"
            label="食べた量（1回分に対する倍率）"
            onChangeText={(value) => updateValue("servingMultiplier", value)}
            placeholder="例：0.5"
            value={values.servingMultiplier}
          />
          <Text style={styles.hint}>50%なら0.5、100%なら1、2回分なら2</Text>

          <View style={styles.calorieCard}>
            <View>
              <Text style={styles.calorieLabel}>カロリー</Text>
              <Text style={styles.calorieMode}>
                {values.calorieSource === "calculated"
                  ? "PFCから自動計算"
                  : "手動入力"}
              </Text>
            </View>
            <Text style={styles.calorieValue}>
              {values.calorieSource === "calculated"
                ? automaticCalories
                : Math.round(
                    (Number(values.manualCalories) || 0) *
                      (Number(values.servingMultiplier) || 0),
                  )}{" "}
              <Text style={styles.calorieUnit}>kcal</Text>
            </Text>
          </View>

          <Pressable
            accessibilityLabel="カロリー入力方法を切り替える"
            onPress={() =>
              updateValue(
                "calorieSource",
                values.calorieSource === "calculated" ? "manual" : "calculated",
              )
            }
            style={styles.switchButton}
          >
            <Text style={styles.switchButtonText}>
              {values.calorieSource === "calculated"
                ? "カロリーを手動入力する"
                : "PFCから自動計算する"}
            </Text>
          </Pressable>

          {values.calorieSource === "manual" ? (
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
            maxLength={500}
            multiline
            onChangeText={(value) => updateValue("memo", value)}
            placeholder="量や補足など"
            value={values.memo}
          />

          {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}

          <Pressable
            accessibilityLabel="食事を保存する"
            disabled={isSaving}
            onPress={handleSave}
            style={[styles.primaryButton, isSaving && styles.disabledButton]}
          >
            <Text style={styles.primaryButtonText}>
              {isSaving ? "保存しています" : "食事を保存"}
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
  row: { flexDirection: "row", gap: 10 },
  halfField: { flex: 1 },
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
  mealTypeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  mealTypeButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 9,
    borderWidth: 1,
    minWidth: "46%",
    paddingHorizontal: 6,
    paddingVertical: 7,
  },
  selectedButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  mealTypeText: { color: colors.textMuted, fontSize: 10 },
  selectedButtonText: { color: colors.surface, fontWeight: "700" },
  sectionTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
  },
  nutritionRow: { flexDirection: "row", gap: 8 },
  nutritionField: { flex: 1 },
  hint: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: -8,
    marginBottom: 14,
  },
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
    minHeight: 50,
    justifyContent: "center",
  },
  disabledButton: { opacity: 0.55 },
  primaryButtonText: { color: colors.surface, fontSize: 14, fontWeight: "800" },
});

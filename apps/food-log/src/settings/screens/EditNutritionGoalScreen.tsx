import { useEffect, useState } from "react";
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

import { validateNutritionGoalInput } from "@/settings/services/nutritionGoalInput";
import type { NutritionGoalRepository } from "@/settings/storage/NutritionGoalRepository";
import type {
  NutritionGoalInputErrors,
  NutritionGoalInputValues,
} from "@/settings/types/nutritionGoalInput";
import { calculateCalories } from "@/shared/services/nutrition";
import { colors } from "@/shared/theme/colors";
import { toDateKey } from "@/shared/utils/date";

type EditNutritionGoalScreenProps = {
  repository: NutritionGoalRepository;
  onCancel: () => void;
  onSaved: () => void;
};

const EMPTY_VALUES: NutritionGoalInputValues = {
  protein: "",
  fat: "",
  carbs: "",
};

export function EditNutritionGoalScreen({
  repository,
  onCancel,
  onSaved,
}: EditNutritionGoalScreenProps) {
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState<NutritionGoalInputErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [screenError, setScreenError] = useState<string | null>(null);
  const effectiveFrom = toDateKey(new Date());
  const calories = calculateCalories(
    toDisplayNumber(values.protein),
    toDisplayNumber(values.fat),
    toDisplayNumber(values.carbs),
  );

  useEffect(() => {
    async function loadGoal() {
      try {
        const goal = await repository.findEffectiveOn(effectiveFrom);
        setValues({
          protein: String(goal.protein),
          fat: String(goal.fat),
          carbs: String(goal.carbs),
        });
      } catch (error) {
        console.error("栄養目標の取得に失敗しました", error);
        setScreenError("目標値を読み込めませんでした");
      } finally {
        setIsLoading(false);
      }
    }

    void loadGoal();
  }, [effectiveFrom, repository]);

  const updateValue = (key: keyof NutritionGoalInputValues, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setScreenError(null);
  };

  const handleSave = async () => {
    if (isSaving) return;

    const result = validateNutritionGoalInput(values, effectiveFrom);
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }

    setIsSaving(true);
    setScreenError(null);
    try {
      await repository.save(result.value);
      onSaved();
    } catch (error) {
      console.error("栄養目標の保存に失敗しました", error);
      setScreenError("目標値を保存できませんでした。もう一度お試しください");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.screen}
      >
        <View style={styles.header}>
          <Pressable accessibilityLabel="目標編集を閉じる" onPress={onCancel}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>
          <Text style={styles.title}>1日の目標を編集</Text>
          <Pressable
            accessibilityLabel="目標を保存"
            disabled={isLoading || isSaving}
            onPress={handleSave}
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
          {isLoading ? (
            <Text style={styles.statusText}>目標値を読み込んでいます</Text>
          ) : (
            <>
              <GoalInput
                error={errors.protein}
                label="たんぱく質"
                onChangeText={(value) => updateValue("protein", value)}
                unit="g"
                value={values.protein}
              />
              <GoalInput
                error={errors.fat}
                label="脂質"
                onChangeText={(value) => updateValue("fat", value)}
                unit="g"
                value={values.fat}
              />
              <GoalInput
                error={errors.carbs}
                label="炭水化物"
                onChangeText={(value) => updateValue("carbs", value)}
                unit="g"
                value={values.carbs}
              />
              <View style={styles.calorieCard}>
                <View>
                  <Text style={styles.calorieLabel}>カロリー</Text>
                  <Text style={styles.calorieDescription}>PFCから自動計算</Text>
                </View>
                <Text style={styles.calorieValue}>
                  {calories.toLocaleString()} kcal
                </Text>
              </View>
              {errors.form ? (
                <Text style={styles.screenError}>{errors.form}</Text>
              ) : null}
            </>
          )}

          {screenError ? (
            <Text style={styles.screenError}>{screenError}</Text>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function toDisplayNumber(value: string): number {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

type GoalInputProps = {
  label: string;
  unit: string;
  value: string;
  error?: string;
  keyboardType?: "decimal-pad" | "number-pad";
  onChangeText: (value: string) => void;
};

function GoalInput({
  label,
  unit,
  value,
  error,
  keyboardType = "decimal-pad",
  onChangeText,
}: GoalInputProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}（{unit}）
      </Text>
      <TextInput
        accessibilityLabel={label}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        style={[styles.input, error && styles.inputError]}
        value={value}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  screen: { flex: 1 },
  header: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 62,
    paddingHorizontal: 18,
  },
  closeText: { color: colors.text, fontSize: 26 },
  title: { color: colors.text, fontSize: 15, fontWeight: "800" },
  saveText: { color: colors.primary, fontSize: 13, fontWeight: "800" },
  disabledText: { opacity: 0.5 },
  content: { padding: 20 },
  statusText: { color: colors.textMuted, padding: 24, textAlign: "center" },
  field: { marginBottom: 18 },
  label: { color: colors.textMuted, fontSize: 11, marginBottom: 7 },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.text,
    fontSize: 17,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  calorieCard: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: 13,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    padding: 14,
  },
  calorieLabel: { color: colors.text, fontSize: 12 },
  calorieDescription: { color: colors.primary, fontSize: 9, marginTop: 3 },
  calorieValue: { color: colors.text, fontSize: 18, fontWeight: "800" },
  inputError: { borderColor: "#C43D3D" },
  errorText: { color: "#C43D3D", fontSize: 10, marginTop: 5 },
  screenError: { color: "#C43D3D", fontSize: 11, textAlign: "center" },
});

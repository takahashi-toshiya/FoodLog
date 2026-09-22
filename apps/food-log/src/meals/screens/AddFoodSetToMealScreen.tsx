import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  calculateFoodSetItemNutrition,
  calculateFoodSetNutrition,
} from "@/foods/services/foodSetNutrition";
import type { FoodSetRepository } from "@/foods/storage/FoodSetRepository";
import type { FoodSet } from "@/foods/types/foodSet";
import { DatePickerModal } from "@/meals/components/DatePickerModal";
import { MEAL_TYPE_LABELS, MEAL_TYPES } from "@/meals/constants/meal-types";
import { createMealInputsFromFoodSet } from "@/meals/services/foodSetMealInputs";
import type { MealRepository } from "@/meals/storage/MealRepository";
import type { MealType } from "@/meals/types/meal";
import { colors } from "@/shared/theme/colors";
import { formatLongDate, toDateKey } from "@/shared/utils/date";

type AddFoodSetToMealScreenProps = {
  foodSetId: string;
  foodSetRepository: FoodSetRepository;
  initialDate: string;
  initialMealType: MealType;
  mealRepository: MealRepository;
  onCancel: () => void;
  onSaved: (date: string) => void;
};

type LoadState =
  | { status: "loading" }
  | { status: "success"; foodSet: FoodSet }
  | { status: "notFound" }
  | { status: "error" };

export function AddFoodSetToMealScreen({
  foodSetId,
  foodSetRepository,
  initialDate,
  initialMealType,
  mealRepository,
  onCancel,
  onSaved,
}: AddFoodSetToMealScreenProps) {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [selectedDate, setSelectedDate] = useState(() =>
    dateKeyToDate(initialDate),
  );
  const [selectedMealType, setSelectedMealType] =
    useState<MealType>(initialMealType);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadFoodSet = useCallback(async () => {
    setLoadState({ status: "loading" });

    try {
      const foodSet = await foodSetRepository.findById(foodSetId);
      setLoadState(
        foodSet ? { status: "success", foodSet } : { status: "notFound" },
      );
    } catch (error) {
      console.error("食品セットの取得に失敗しました", error);
      setLoadState({ status: "error" });
    }
  }, [foodSetId, foodSetRepository]);

  useEffect(() => {
    void loadFoodSet();
  }, [loadFoodSet]);

  if (loadState.status !== "success") {
    const message =
      loadState.status === "loading"
        ? "食品セットを読み込んでいます"
        : loadState.status === "notFound"
          ? "指定した食品セットが見つかりません"
          : "食品セットを読み込めませんでした";

    return (
      <StatusScreen
        message={message}
        onCancel={onCancel}
        onRetry={loadState.status === "error" ? loadFoodSet : undefined}
      />
    );
  }

  const { foodSet } = loadState;
  const totals = calculateFoodSetNutrition(foodSet);

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    const date = toDateKey(selectedDate);
    const inputs = createMealInputsFromFoodSet(foodSet, date, selectedMealType);

    setIsSaving(true);
    setSaveError(null);

    try {
      await mealRepository.createMany(inputs);
      onSaved(date);
    } catch (error) {
      console.error("食品セットの食事追加に失敗しました", error);
      setSaveError("食品セットを追加できませんでした。もう一度お試しください");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="食品セットの追加を閉じる"
          onPress={onCancel}
          style={styles.headerAction}
        >
          <Text style={styles.closeText}>×</Text>
        </Pressable>
        <Text style={styles.title}>セットを食事へ追加</Text>
        <View style={styles.headerAction} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.setCard}>
          <Text style={styles.setName}>{foodSet.name}</Text>
          <Text style={styles.setSummary}>
            {foodSet.items.length}品 · {totals.calories} kcal
          </Text>
          <Text style={styles.setNutrition}>
            P {formatNumber(totals.protein)} / F {formatNumber(totals.fat)} / C{" "}
            {formatNumber(totals.carbs)}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>追加先</Text>
        <Text style={styles.label}>日付</Text>
        <Pressable
          accessibilityLabel="追加する日付を選ぶ"
          onPress={() => setIsDatePickerVisible(true)}
          style={styles.dateButton}
        >
          <Text style={styles.dateButtonText}>
            {formatLongDate(selectedDate)}
          </Text>
        </Pressable>

        <Text style={styles.label}>食事区分</Text>
        <View style={styles.mealTypeGrid}>
          {MEAL_TYPES.map((mealType) => {
            const isSelected = selectedMealType === mealType;

            return (
              <Pressable
                accessibilityLabel={`食事区分を${MEAL_TYPE_LABELS[mealType]}にする`}
                key={mealType}
                onPress={() => setSelectedMealType(mealType)}
                style={[
                  styles.mealTypeButton,
                  isSelected && styles.selectedMealTypeButton,
                ]}
              >
                <Text
                  style={[
                    styles.mealTypeText,
                    isSelected && styles.selectedMealTypeText,
                  ]}
                >
                  {MEAL_TYPE_LABELS[mealType]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>追加する食品</Text>
        {foodSet.items.map((item) => {
          const nutrition = calculateFoodSetItemNutrition(item);

          return (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemContent}>
                <Text style={styles.itemName}>{item.food.name}</Text>
                <Text style={styles.itemNutrition}>
                  P {formatNumber(nutrition.protein)} / F{" "}
                  {formatNumber(nutrition.fat)} / C{" "}
                  {formatNumber(nutrition.carbs)}
                </Text>
              </View>
              <Text style={styles.multiplier}>× {item.servingMultiplier}</Text>
            </View>
          );
        })}

        {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}

        <Pressable
          accessibilityLabel="食品セットを食事へ追加する"
          disabled={isSaving}
          onPress={handleSave}
          style={[styles.primaryButton, isSaving && styles.disabledButton]}
        >
          <Text style={styles.primaryButtonText}>
            {isSaving ? "追加しています" : `${foodSet.items.length}品を追加`}
          </Text>
        </Pressable>
      </ScrollView>

      <DatePickerModal
        isVisible={isDatePickerVisible}
        onCancel={() => setIsDatePickerVisible(false)}
        onSelectDate={(date) => {
          setSelectedDate(date);
          setIsDatePickerVisible(false);
          setSaveError(null);
        }}
        selectedDate={selectedDate}
      />
    </SafeAreaView>
  );
}

type StatusScreenProps = {
  message: string;
  onCancel: () => void;
  onRetry?: () => void;
};

function StatusScreen({ message, onCancel, onRetry }: StatusScreenProps) {
  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.statusContent}>
        <Text style={styles.statusText}>{message}</Text>
        {onRetry ? (
          <Pressable onPress={onRetry} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>もう一度読み込む</Text>
          </Pressable>
        ) : null}
        {message !== "食品セットを読み込んでいます" ? (
          <Pressable onPress={onCancel} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>閉じる</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function dateKeyToDate(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatNumber(value: number): number {
  return Number(value.toFixed(1));
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  header: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 58,
    paddingHorizontal: 16,
  },
  headerAction: { alignItems: "center", justifyContent: "center", width: 44 },
  closeText: { color: colors.text, fontSize: 27 },
  title: { color: colors.text, fontSize: 16, fontWeight: "800" },
  content: { padding: 20, paddingBottom: 40 },
  setCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: 16,
    padding: 16,
  },
  setName: { color: colors.text, fontSize: 18, fontWeight: "800" },
  setSummary: { color: colors.textMuted, fontSize: 12, marginTop: 6 },
  setNutrition: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 5,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 12,
    marginTop: 24,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 7,
    marginTop: 12,
  },
  dateButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  dateButtonText: { color: colors.text, fontSize: 14, fontWeight: "700" },
  mealTypeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  mealTypeButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 11,
    borderWidth: 1,
    flexBasis: "22%",
    flexGrow: 1,
    minHeight: 44,
    justifyContent: "center",
  },
  selectedMealTypeButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  mealTypeText: { color: colors.textMuted, fontSize: 12, fontWeight: "700" },
  selectedMealTypeText: { color: colors.surface },
  itemRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 8,
    minHeight: 62,
    padding: 12,
  },
  itemContent: { flex: 1 },
  itemName: { color: colors.text, fontSize: 13, fontWeight: "800" },
  itemNutrition: { color: colors.textMuted, fontSize: 10, marginTop: 5 },
  multiplier: { color: colors.primary, fontSize: 13, fontWeight: "800" },
  errorText: {
    color: "#C83E3E",
    fontSize: 12,
    marginTop: 16,
    textAlign: "center",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 14,
    justifyContent: "center",
    marginTop: 24,
    minHeight: 52,
  },
  disabledButton: { opacity: 0.55 },
  primaryButtonText: { color: colors.surface, fontSize: 14, fontWeight: "800" },
  statusContent: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 32,
  },
  statusText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  retryButtonText: { color: colors.surface, fontWeight: "800" },
  cancelButton: { marginTop: 16, padding: 12 },
  cancelButtonText: { color: colors.textMuted, fontWeight: "700" },
});

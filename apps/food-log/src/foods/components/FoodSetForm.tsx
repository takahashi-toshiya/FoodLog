import { useState } from "react";
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

import { FoodSelectionModal } from "@/foods/screens/FoodSelectionModal";
import { validateFoodSetInput } from "@/foods/services/foodSetInput";
import type { FoodRepository } from "@/foods/storage/FoodRepository";
import type { FoodItem } from "@/foods/types/food";
import type { CreateFoodSetInput } from "@/foods/types/foodSet";
import type {
  FoodSetInputErrors,
  FoodSetInputValues,
} from "@/foods/types/foodSetInput";
import { colors } from "@/shared/theme/colors";

type FoodSetFormProps = {
  closeAccessibilityLabel: string;
  foodRepository: FoodRepository;
  initialValues: FoodSetInputValues;
  onCancel: () => void;
  onSubmit: (input: CreateFoodSetInput) => Promise<void>;
  submitLabel: string;
  title: string;
};

export function FoodSetForm({
  closeAccessibilityLabel,
  foodRepository,
  initialValues,
  onCancel,
  onSubmit,
  submitLabel,
  title,
}: FoodSetFormProps) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FoodSetInputErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFoodSelectionVisible, setIsFoodSelectionVisible] = useState(false);

  const handleSelectFood = (food: FoodItem) => {
    if (values.items.some((item) => item.food.id === food.id)) {
      setErrors((current) => ({
        ...current,
        items: "この食品はすでにセットへ追加されています",
      }));
      setIsFoodSelectionVisible(false);
      return;
    }

    setValues((current) => ({
      ...current,
      items: [...current.items, { food, servingMultiplier: "1" }],
    }));
    setErrors((current) => ({
      ...current,
      items: undefined,
      servingMultipliers: {
        ...current.servingMultipliers,
        [food.id]: undefined,
      },
    }));
    setSaveError(null);
    setIsFoodSelectionVisible(false);
  };

  const handleChangeMultiplier = (foodId: string, value: string) => {
    setValues((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.food.id === foodId ? { ...item, servingMultiplier: value } : item,
      ),
    }));
    setErrors((current) => ({
      ...current,
      servingMultipliers: {
        ...current.servingMultipliers,
        [foodId]: undefined,
      },
    }));
    setSaveError(null);
  };

  const handleRemoveFood = (foodId: string) => {
    setValues((current) => ({
      ...current,
      items: current.items.filter((item) => item.food.id !== foodId),
    }));
    setErrors((current) => ({
      ...current,
      items: undefined,
      servingMultipliers: {
        ...current.servingMultipliers,
        [foodId]: undefined,
      },
    }));
    setSaveError(null);
  };

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    const result = validateFoodSetInput(values);
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await onSubmit(result.value);
    } catch (error) {
      console.error("食品セットの保存に失敗しました", error);
      setSaveError("食品セットを保存できませんでした。もう一度お試しください");
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
            accessibilityLabel={closeAccessibilityLabel}
            onPress={onCancel}
            style={styles.headerAction}
          >
            <Text style={styles.closeText}>×</Text>
          </Pressable>
          <Text style={styles.title}>{title}</Text>
          <Pressable
            accessibilityLabel={submitLabel}
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
          <View style={styles.field}>
            <Text style={styles.label}>セット名</Text>
            <TextInput
              accessibilityLabel="セット名"
              onChangeText={(name) => {
                setValues((current) => ({ ...current, name }));
                setErrors((current) => ({ ...current, name: undefined }));
                setSaveError(null);
              }}
              placeholder="例：いつもの朝食"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, errors.name && styles.inputError]}
              value={values.name}
            />
            {errors.name ? (
              <Text style={styles.errorText}>{errors.name}</Text>
            ) : null}
          </View>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>セットの食品</Text>
              <Text style={styles.sectionDescription}>
                食品ごとに1回分を基準とした倍率を指定します。
              </Text>
            </View>
            <Pressable
              accessibilityLabel="食品を追加"
              onPress={() => setIsFoodSelectionVisible(true)}
              style={styles.addFoodButton}
            >
              <Text style={styles.addFoodButtonText}>＋ 食品を追加</Text>
            </Pressable>
          </View>

          {values.items.map((item) => {
            const multiplierError = errors.servingMultipliers?.[item.food.id];

            return (
              <View key={item.food.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemName}>{item.food.name}</Text>
                    <Text style={styles.itemDetails}>
                      {item.food.servingAmount}
                      {item.food.servingUnit} · P {item.food.protein} / F{" "}
                      {item.food.fat} / C {item.food.carbs}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityLabel={`${item.food.name}をセットから削除`}
                    onPress={() => handleRemoveFood(item.food.id)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>削除</Text>
                  </Pressable>
                </View>
                <View style={styles.multiplierRow}>
                  <Text style={styles.multiplierLabel}>摂取倍率</Text>
                  <TextInput
                    accessibilityLabel={`${item.food.name}の摂取倍率`}
                    keyboardType="decimal-pad"
                    onChangeText={(value) =>
                      handleChangeMultiplier(item.food.id, value)
                    }
                    style={[
                      styles.multiplierInput,
                      multiplierError && styles.inputError,
                    ]}
                    value={item.servingMultiplier}
                  />
                  <Text style={styles.multiplierUnit}>倍</Text>
                </View>
                {multiplierError ? (
                  <Text style={styles.errorText}>{multiplierError}</Text>
                ) : null}
              </View>
            );
          })}

          {errors.items ? (
            <Text style={styles.itemsError}>{errors.items}</Text>
          ) : null}

          {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}

          <Pressable
            accessibilityLabel={`${submitLabel}する`}
            disabled={isSaving}
            onPress={handleSave}
            style={[styles.primaryButton, isSaving && styles.disabledButton]}
          >
            <Text style={styles.primaryButtonText}>
              {isSaving ? "保存しています" : submitLabel}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <FoodSelectionModal
        isVisible={isFoodSelectionVisible}
        onClose={() => setIsFoodSelectionVisible(false)}
        onSelectFood={handleSelectFood}
        repository={foodRepository}
      />
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
  field: { marginBottom: 22 },
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
  sectionHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: { color: colors.text, fontSize: 13, fontWeight: "800" },
  sectionDescription: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
    maxWidth: 210,
  },
  addFoodButton: {
    backgroundColor: colors.primarySoft,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  addFoodButtonText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    padding: 12,
  },
  itemHeader: { alignItems: "center", flexDirection: "row", gap: 8 },
  itemContent: { flex: 1 },
  itemName: { color: colors.text, fontSize: 13, fontWeight: "800" },
  itemDetails: { color: colors.textMuted, fontSize: 10, marginTop: 4 },
  removeButton: { paddingHorizontal: 8, paddingVertical: 8 },
  removeButtonText: { color: "#C83E3E", fontSize: 11, fontWeight: "700" },
  multiplierRow: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 12,
  },
  multiplierLabel: { color: colors.textMuted, flex: 1, fontSize: 11 },
  multiplierInput: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.text,
    minHeight: 40,
    paddingHorizontal: 10,
    textAlign: "right",
    width: 90,
  },
  multiplierUnit: { color: colors.textMuted, fontSize: 11, marginLeft: 6 },
  itemsError: { color: "#C83E3E", fontSize: 11, marginBottom: 14 },
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
    marginTop: 10,
    minHeight: 50,
  },
  disabledButton: { opacity: 0.55 },
  primaryButtonText: { color: colors.surface, fontWeight: "800" },
});

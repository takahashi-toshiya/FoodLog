import { MealEntryForm } from "@/meals/components/MealEntryForm";
import type { MealRepository } from "@/meals/storage/MealRepository";
import type { CreateMealEntryInput, MealType } from "@/meals/types/meal";
import type { MealInputPreset, MealInputValues } from "@/meals/types/mealInput";

type AddMealScreenProps = {
  initialDate: string;
  initialMealType: MealType;
  initialPreset?: MealInputPreset;
  repository: MealRepository;
  onCancel: () => void;
  onSaved: (date: string) => void;
};

export function AddMealScreen({
  initialDate,
  initialMealType,
  initialPreset,
  repository,
  onCancel,
  onSaved,
}: AddMealScreenProps) {
  const initialValues: MealInputValues = {
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
  };

  const handleSubmit = async (input: CreateMealEntryInput) => {
    await repository.create(input);
    onSaved(input.date);
  };

  return (
    <MealEntryForm
      closeAccessibilityLabel="食事追加を閉じる"
      initialValues={initialValues}
      onCancel={onCancel}
      onSubmit={handleSubmit}
      submitLabel="食事を保存"
      title="食事を追加"
    />
  );
}

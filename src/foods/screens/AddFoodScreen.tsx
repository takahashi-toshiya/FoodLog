import { FoodForm } from "@/foods/components/FoodForm";
import type { FoodRepository } from "@/foods/storage/FoodRepository";
import type { CreateFoodInput } from "@/foods/types/food";
import type { FoodInputValues } from "@/foods/types/foodInput";

const INITIAL_VALUES: FoodInputValues = {
  name: "",
  servingAmount: "1",
  servingUnit: "食",
  protein: "",
  fat: "",
  carbs: "",
  calorieMode: "calculated",
  manualCalories: "",
  memo: "",
};

type AddFoodScreenProps = {
  repository: FoodRepository;
  onCancel: () => void;
  onSaved: () => void;
};

export function AddFoodScreen({
  repository,
  onCancel,
  onSaved,
}: AddFoodScreenProps) {
  const handleSubmit = async (input: CreateFoodInput) => {
    await repository.create(input);
    onSaved();
  };

  return (
    <FoodForm
      closeAccessibilityLabel="食品登録を閉じる"
      initialValues={INITIAL_VALUES}
      onCancel={onCancel}
      onSubmit={handleSubmit}
      submitLabel="食品を保存"
      title="食品を登録"
    />
  );
}

import { FoodSetForm } from "@/foods/components/FoodSetForm";
import type { FoodRepository } from "@/foods/storage/FoodRepository";
import type { FoodSetRepository } from "@/foods/storage/FoodSetRepository";
import type { FoodSetInputValues } from "@/foods/types/foodSetInput";

const INITIAL_VALUES: FoodSetInputValues = { name: "", items: [] };

type AddFoodSetScreenProps = {
  foodRepository: FoodRepository;
  foodSetRepository: FoodSetRepository;
  onCancel: () => void;
  onSaved: () => void;
};

export function AddFoodSetScreen({
  foodRepository,
  foodSetRepository,
  onCancel,
  onSaved,
}: AddFoodSetScreenProps) {
  return (
    <FoodSetForm
      closeAccessibilityLabel="食品セット登録を閉じる"
      foodRepository={foodRepository}
      initialValues={INITIAL_VALUES}
      onCancel={onCancel}
      onSubmit={async (input) => {
        await foodSetRepository.create(input);
        onSaved();
      }}
      submitLabel="セットを保存"
      title="食品セットを追加"
    />
  );
}

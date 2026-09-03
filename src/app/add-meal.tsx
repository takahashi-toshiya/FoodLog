import { useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import { AddLibraryFoodToMealScreen } from "@/meals/screens/AddLibraryFoodToMealScreen";
import { AddMealScreen } from "@/meals/screens/AddMealScreen";
import { SQLiteFoodRepository } from "@/foods/storage/SQLiteFoodRepository";
import { SQLiteMealRepository } from "@/meals/storage/SQLiteMealRepository";
import type { MealType } from "@/meals/types/meal";
import { toDateKey } from "@/shared/utils/date";

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export default function AddMealRoute() {
  const db = useSQLiteContext();
  const router = useRouter();
  const params = useLocalSearchParams<{
    date?: string;
    mealType?: string;
    foodId?: string;
  }>();
  const mealRepository = useMemo(() => new SQLiteMealRepository(db), [db]);
  const foodRepository = useMemo(() => new SQLiteFoodRepository(db), [db]);
  const mealType = MEAL_TYPES.includes(params.mealType as MealType)
    ? (params.mealType as MealType)
    : "breakfast";
  const initialDate = params.date ?? toDateKey(new Date());

  if (params.foodId) {
    return (
      <AddLibraryFoodToMealScreen
        foodId={params.foodId}
        foodRepository={foodRepository}
        initialDate={initialDate}
        initialMealType={mealType}
        mealRepository={mealRepository}
        onCancel={() => router.back()}
        onSaved={(date) =>
          router.replace({
            pathname: "/today",
            params: { date, dateRequestId: String(Date.now()) },
          })
        }
      />
    );
  }

  return (
    <AddMealScreen
      initialDate={initialDate}
      initialMealType={mealType}
      onCancel={() => router.back()}
      onSaved={() => router.back()}
      repository={mealRepository}
    />
  );
}

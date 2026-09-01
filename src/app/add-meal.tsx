import { useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import { AddMealScreen } from "@/meals/screens/AddMealScreen";
import { SQLiteMealRepository } from "@/meals/storage/SQLiteMealRepository";
import type { MealType } from "@/meals/types/meal";
import { toDateKey } from "@/shared/utils/date";

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export default function AddMealRoute() {
  const db = useSQLiteContext();
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string; mealType?: string }>();
  const repository = useMemo(() => new SQLiteMealRepository(db), [db]);
  const mealType = MEAL_TYPES.includes(params.mealType as MealType)
    ? (params.mealType as MealType)
    : "breakfast";

  return (
    <AddMealScreen
      initialDate={params.date ?? toDateKey(new Date())}
      initialMealType={mealType}
      onCancel={() => router.back()}
      onSaved={() => router.back()}
      repository={repository}
    />
  );
}

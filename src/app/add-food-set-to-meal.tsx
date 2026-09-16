import { useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import { SQLiteFoodSetRepository } from "@/foods/storage/SQLiteFoodSetRepository";
import { AddFoodSetToMealScreen } from "@/meals/screens/AddFoodSetToMealScreen";
import { SQLiteMealRepository } from "@/meals/storage/SQLiteMealRepository";
import { toDateKey } from "@/shared/utils/date";

export default function AddFoodSetToMealRoute() {
  const db = useSQLiteContext();
  const router = useRouter();
  const params = useLocalSearchParams<{ foodSetId?: string }>();
  const foodSetRepository = useMemo(
    () => new SQLiteFoodSetRepository(db),
    [db],
  );
  const mealRepository = useMemo(() => new SQLiteMealRepository(db), [db]);

  return (
    <AddFoodSetToMealScreen
      foodSetId={params.foodSetId ?? ""}
      foodSetRepository={foodSetRepository}
      initialDate={toDateKey(new Date())}
      initialMealType="breakfast"
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

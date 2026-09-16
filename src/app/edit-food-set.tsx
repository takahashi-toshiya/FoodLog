import { useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import { EditFoodSetScreen } from "@/foods/screens/EditFoodSetScreen";
import { SQLiteFoodRepository } from "@/foods/storage/SQLiteFoodRepository";
import { SQLiteFoodSetRepository } from "@/foods/storage/SQLiteFoodSetRepository";

export default function EditFoodSetRoute() {
  const db = useSQLiteContext();
  const router = useRouter();
  const params = useLocalSearchParams<{ foodSetId?: string }>();
  const foodRepository = useMemo(() => new SQLiteFoodRepository(db), [db]);
  const foodSetRepository = useMemo(
    () => new SQLiteFoodSetRepository(db),
    [db],
  );

  return (
    <EditFoodSetScreen
      foodRepository={foodRepository}
      foodSetId={params.foodSetId ?? ""}
      foodSetRepository={foodSetRepository}
      onCancel={() => router.back()}
      onSaved={() => router.back()}
    />
  );
}

import { useMemo } from "react";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import { AddFoodSetScreen } from "@/foods/screens/AddFoodSetScreen";
import { SQLiteFoodRepository } from "@/foods/storage/SQLiteFoodRepository";
import { SQLiteFoodSetRepository } from "@/foods/storage/SQLiteFoodSetRepository";

export default function AddFoodSetRoute() {
  const db = useSQLiteContext();
  const router = useRouter();
  const foodRepository = useMemo(() => new SQLiteFoodRepository(db), [db]);
  const foodSetRepository = useMemo(
    () => new SQLiteFoodSetRepository(db),
    [db],
  );

  return (
    <AddFoodSetScreen
      foodRepository={foodRepository}
      foodSetRepository={foodSetRepository}
      onCancel={() => router.back()}
      onSaved={() => router.back()}
    />
  );
}

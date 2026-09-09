import { useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import { EditFoodScreen } from "@/foods/screens/EditFoodScreen";
import { SQLiteFoodRepository } from "@/foods/storage/SQLiteFoodRepository";

export default function EditFoodRoute() {
  const db = useSQLiteContext();
  const router = useRouter();
  const params = useLocalSearchParams<{ foodId?: string }>();
  const repository = useMemo(() => new SQLiteFoodRepository(db), [db]);

  return (
    <EditFoodScreen
      foodId={params.foodId ?? ""}
      onCancel={() => router.back()}
      onSaved={() => router.back()}
      repository={repository}
    />
  );
}

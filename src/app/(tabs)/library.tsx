import { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import { FoodLibraryScreen } from "@/foods/screens/FoodLibraryScreen";
import { SQLiteFoodRepository } from "@/foods/storage/SQLiteFoodRepository";

export default function LibraryRoute() {
  const db = useSQLiteContext();
  const router = useRouter();
  const repository = useMemo(() => new SQLiteFoodRepository(db), [db]);
  const [refreshToken, setRefreshToken] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefreshToken((current) => current + 1);
    }, []),
  );

  return (
    <FoodLibraryScreen
      onAddFood={() => router.push("/add-food")}
      refreshToken={refreshToken}
      repository={repository}
    />
  );
}

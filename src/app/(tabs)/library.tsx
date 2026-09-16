import { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import { FoodLibraryScreen } from "@/foods/screens/FoodLibraryScreen";
import { SQLiteFoodRepository } from "@/foods/storage/SQLiteFoodRepository";
import { SQLiteFoodSetRepository } from "@/foods/storage/SQLiteFoodSetRepository";

export default function LibraryRoute() {
  const db = useSQLiteContext();
  const router = useRouter();
  const repository = useMemo(() => new SQLiteFoodRepository(db), [db]);
  const foodSetRepository = useMemo(
    () => new SQLiteFoodSetRepository(db),
    [db],
  );
  const [refreshToken, setRefreshToken] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefreshToken((current) => current + 1);
    }, []),
  );

  return (
    <FoodLibraryScreen
      foodSetRepository={foodSetRepository}
      onAddFood={() => router.push("/add-food")}
      onAddFoodSet={() => router.push("/add-food-set")}
      onEditFood={(foodId) =>
        router.push({ pathname: "/edit-food", params: { foodId } })
      }
      onEditFoodSet={(foodSetId) =>
        router.push({ pathname: "/edit-food-set", params: { foodSetId } })
      }
      onSelectFood={(food) =>
        router.push({ pathname: "/add-meal", params: { foodId: food.id } })
      }
      onSelectFoodSet={(foodSet) =>
        router.push({
          pathname: "/add-food-set-to-meal",
          params: { foodSetId: foodSet.id },
        })
      }
      refreshToken={refreshToken}
      repository={repository}
    />
  );
}

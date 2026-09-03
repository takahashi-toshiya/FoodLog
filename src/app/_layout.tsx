import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";

import { migrateDatabase } from "@/shared/storage/migrations";

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="food-log.db" onInit={migrateDatabase}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="add-food"
          options={{ animation: "slide_from_bottom", presentation: "modal" }}
        />
        <Stack.Screen
          name="add-meal"
          options={{ animation: "slide_from_bottom", presentation: "modal" }}
        />
      </Stack>
    </SQLiteProvider>
  );
}

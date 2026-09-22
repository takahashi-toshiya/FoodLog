import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DatePickerModal } from "@/meals/components/DatePickerModal";
import { DateSelector } from "@/meals/components/DateSelector";
import { MealTabContent } from "@/meals/components/MealTabContent";
import type { MealRepository } from "@/meals/storage/MealRepository";
import type { MealType } from "@/meals/types/meal";
import type { NutritionGoalRepository } from "@/settings/storage/NutritionGoalRepository";
import { colors } from "@/shared/theme/colors";
import { formatLongDate, toDateKey } from "@/shared/utils/date";
import {
  TodayRecordTabs,
  type TodayRecordTab,
} from "@/today/components/TodayRecordTabs";
import { WeightTabContent } from "@/weights/components/WeightTabContent";
import type { WeightRepository } from "@/weights/storage/WeightRepository";

type TodayScreenProps = {
  repository: MealRepository;
  nutritionGoalRepository: NutritionGoalRepository;
  weightRepository: WeightRepository;
  initialDateKey?: string;
  initialDateRequestId?: string;
  isFocused?: boolean;
  onAddMeal?: (date: string, mealType?: MealType) => void;
  onEditMeal?: (entryId: string) => void;
};

export function TodayScreen({
  repository,
  nutritionGoalRepository,
  weightRepository,
  initialDateKey,
  initialDateRequestId,
  isFocused = true,
  onAddMeal,
  onEditMeal,
}: TodayScreenProps) {
  const [selectedDate, setSelectedDate] = useState(() =>
    parseInitialDate(initialDateKey),
  );
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TodayRecordTab>("meals");
  const selectedDateKey = toDateKey(selectedDate);
  const today = new Date();
  const isToday = selectedDateKey === toDateKey(today);

  useEffect(() => {
    if (initialDateKey) {
      setSelectedDate((current) =>
        toDateKey(current) === initialDateKey
          ? current
          : parseInitialDate(initialDateKey),
      );
    }
  }, [initialDateKey, initialDateRequestId]);

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setIsDatePickerVisible(false);
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>今日の記録</Text>
            <Text style={styles.title}>{formatLongDate(selectedDate)}</Text>
          </View>
          <View style={styles.headerActions}>
            {!isToday && (
              <Pressable
                accessibilityLabel="今日へ戻る"
                onPress={() => setSelectedDate(today)}
                style={styles.todayButton}
              >
                <Text style={styles.todayButtonText}>今日</Text>
              </Pressable>
            )}
            <Pressable
              accessibilityLabel="カレンダーを開く"
              onPress={() => setIsDatePickerVisible(true)}
              style={styles.calendarButton}
            >
              <Text style={styles.calendarIcon}>▦</Text>
            </Pressable>
          </View>
        </View>

        <DateSelector
          onSelectDate={setSelectedDate}
          selectedDate={selectedDate}
        />

        <TodayRecordTabs
          onSelectTab={setSelectedTab}
          selectedTab={selectedTab}
        />

        {selectedTab === "meals" ? (
          <MealTabContent
            isFocused={isFocused}
            nutritionGoalRepository={nutritionGoalRepository}
            onAddMeal={onAddMeal}
            onEditMeal={onEditMeal}
            repository={repository}
            selectedDateKey={selectedDateKey}
          />
        ) : (
          <WeightTabContent
            isFocused={isFocused}
            repository={weightRepository}
            selectedDateKey={selectedDateKey}
          />
        )}

        <DatePickerModal
          isVisible={isDatePickerVisible}
          onCancel={() => setIsDatePickerVisible(false)}
          onSelectDate={handleSelectDate}
          selectedDate={selectedDate}
        />
      </View>
    </SafeAreaView>
  );
}

function parseInitialDate(dateKey?: string): Date {
  if (dateKey) {
    const date = new Date(`${dateKey}T00:00:00`);
    if (!Number.isNaN(date.getTime()) && toDateKey(date) === dateKey) {
      return date;
    }
  }

  return new Date();
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 76,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  title: {
    color: colors.text,
    fontSize: 23,
    fontWeight: "800",
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  todayButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 14,
  },
  todayButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  calendarButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  calendarIcon: {
    color: colors.text,
    fontSize: 20,
  },
});

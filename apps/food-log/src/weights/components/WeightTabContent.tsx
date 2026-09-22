import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { colors } from "@/shared/theme/colors";
import { WeightEntryModal } from "@/weights/components/WeightEntryModal";
import { WeightRecordCard } from "@/weights/components/WeightRecordCard";
import { validateWeightInput } from "@/weights/services/weightInput";
import type { WeightRepository } from "@/weights/storage/WeightRepository";
import type { WeightRecord } from "@/weights/types/weight";

type WeightTabContentProps = {
  isFocused: boolean;
  repository: WeightRepository;
  selectedDateKey: string;
};

export function WeightTabContent({
  isFocused,
  repository,
  selectedDateKey,
}: WeightTabContentProps) {
  const [weightRecord, setWeightRecord] = useState<WeightRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [inputError, setInputError] = useState<string>();
  const loadRequestId = useRef(0);

  const loadWeight = useCallback(async () => {
    const requestId = loadRequestId.current + 1;
    loadRequestId.current = requestId;
    setIsLoading(true);
    setWeightRecord(null);
    setLoadError(null);

    try {
      const record = await repository.findByDate(selectedDateKey);
      if (loadRequestId.current === requestId) {
        setWeightRecord(record);
      }
    } catch (error) {
      console.error("選択日の体重取得に失敗しました", error);
      if (loadRequestId.current === requestId) {
        setLoadError("選択日の体重を読み込めませんでした");
      }
    } finally {
      if (loadRequestId.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [repository, selectedDateKey]);

  useEffect(() => {
    if (isFocused) {
      void loadWeight();
    }
  }, [isFocused, loadWeight]);

  const handleOpenModal = () => {
    setInputError(undefined);
    setIsModalVisible(true);
  };

  const handleSave = async (value: string) => {
    if (isSaving) return;

    const result = validateWeightInput({ weightKg: value }, selectedDateKey);
    if (!result.isValid) {
      setInputError(result.errors.weightKg);
      return;
    }

    setIsSaving(true);
    setInputError(undefined);
    try {
      const savedRecord = await repository.save(result.value);
      setWeightRecord(savedRecord);
      setIsModalVisible(false);
    } catch (error) {
      console.error("体重の保存に失敗しました", error);
      setInputError("体重を保存できませんでした。もう一度お試しください");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <WeightContent
          error={loadError}
          isLoading={isLoading}
          onEdit={handleOpenModal}
          onRetry={loadWeight}
          record={weightRecord}
        />
      </ScrollView>

      <WeightEntryModal
        error={inputError}
        initialValue={weightRecord ? String(weightRecord.weightKg) : ""}
        isSaving={isSaving}
        isVisible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onChange={() => setInputError(undefined)}
        onSave={handleSave}
        title={weightRecord ? "体重を編集" : "体重を記録"}
      />
    </>
  );
}

type WeightContentProps = {
  error: string | null;
  isLoading: boolean;
  onEdit: () => void;
  onRetry: () => void;
  record: WeightRecord | null;
};

function WeightContent({
  error,
  isLoading,
  onEdit,
  onRetry,
  record,
}: WeightContentProps) {
  if (isLoading) {
    return <Text style={styles.statusText}>体重を読み込んでいます</Text>;
  }

  if (error) {
    return (
      <View style={styles.errorState}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable accessibilityLabel="体重を再読み込み" onPress={onRetry}>
          <Text style={styles.retryText}>再試行</Text>
        </Pressable>
      </View>
    );
  }

  return <WeightRecordCard onPress={onEdit} record={record} />;
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: {
    paddingBottom: 100,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  statusText: {
    color: colors.textMuted,
    paddingVertical: 32,
    textAlign: "center",
  },
  errorState: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 32,
  },
  errorText: { color: colors.textMuted },
  retryText: { color: colors.primary, fontWeight: "700" },
});

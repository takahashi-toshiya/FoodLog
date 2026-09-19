import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/shared/theme/colors";
import type { WeightRecord } from "@/weights/types/weight";

type WeightRecordCardProps = {
  record: WeightRecord | null;
  onPress: () => void;
};

export function WeightRecordCard({ record, onPress }: WeightRecordCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>体重</Text>
      {record ? (
        <>
          <View style={styles.valueRow}>
            <Text style={styles.value}>{formatWeight(record.weightKg)}</Text>
            <Text style={styles.unit}>kg</Text>
          </View>
          <Pressable
            accessibilityLabel="体重を編集"
            onPress={onPress}
            style={styles.button}
          >
            <Text style={styles.buttonText}>編集</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.emptyText}>この日の体重は未記録です</Text>
          <Pressable
            accessibilityLabel="体重を記録"
            onPress={onPress}
            style={styles.button}
          >
            <Text style={styles.buttonText}>記録する</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

function formatWeight(weightKg: number): string {
  return String(weightKg);
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  valueRow: {
    alignItems: "baseline",
    flexDirection: "row",
    gap: 6,
    marginTop: 12,
  },
  value: {
    color: colors.text,
    fontSize: 42,
    fontWeight: "800",
  },
  unit: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: "700",
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 14,
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: "center",
    marginTop: 22,
    minHeight: 44,
    minWidth: 120,
    paddingHorizontal: 18,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: "800",
  },
});

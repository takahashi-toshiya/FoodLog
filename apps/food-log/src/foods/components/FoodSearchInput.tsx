import { StyleSheet, Text, TextInput, View } from "react-native";

import { colors } from "@/shared/theme/colors";

type FoodSearchInputProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export function FoodSearchInput({ value, onChangeText }: FoodSearchInputProps) {
  return (
    <View style={styles.container}>
      <Text accessibilityElementsHidden style={styles.icon}>
        ⌕
      </Text>
      <TextInput
        accessibilityLabel="食品を検索"
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={onChangeText}
        placeholder="食品を検索"
        placeholderTextColor={colors.textMuted}
        returnKeyType="search"
        style={styles.input}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 14,
    paddingHorizontal: 12,
  },
  icon: {
    color: colors.textMuted,
    fontSize: 20,
    marginRight: 8,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    minHeight: 46,
    paddingVertical: 10,
  },
});

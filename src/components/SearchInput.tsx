import React from 'react';
import { TextInput, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme/darkColors';

type SearchInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle;
};

export function SearchInput({ value, onChangeText, placeholder, style }: SearchInputProps) {
  return (
    <TextInput
      placeholder={placeholder || "Buscar..."}
      placeholderTextColor={colors.textPlaceholder}
      value={value}
      onChangeText={onChangeText}
      autoCapitalize="none"
      style={[styles.input, style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: colors.textPrimary,
    backgroundColor: colors.card,
  },
});

import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors } from '../theme/darkColors';

type InputProps = TextInputProps & {
  value: string;
  onChangeText: (text: string) => void;
};

export default function Input({ value, onChangeText, style, ...rest }: InputProps) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor={colors.textPlaceholder}
      style={[styles.base, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: colors.textPrimary,
    backgroundColor: colors.card,
    fontSize: 15,
  },
});
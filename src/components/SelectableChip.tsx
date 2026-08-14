import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors } from '../theme/darkColors';

type SelectableChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
};

export function SelectableChip({ label, selected, onPress, style }: SelectableChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        selected && styles.chipSelected,
        style,
      ]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 46,
    alignItems: 'center',
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryAlpha,
  },
  label: {
    color: '#c8d2de',
    fontWeight: '700',
  },
  labelSelected: {
    color: colors.primaryLight,
  },
});

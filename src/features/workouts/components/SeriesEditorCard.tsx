import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../../theme/darkColors';

type SeriesEditorCardProps = {
  index: number;
  reps: string;
  loadKg: string;
  onRepsChange: (value: string) => void;
  onLoadKgChange: (value: string) => void;
};

function parseNumber(value: string) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function StepperField({
  label,
  value,
  min,
  step,
  onChange,
}: {
  label: string;
  value: string;
  min: number;
  step: number;
  onChange: (value: string) => void;
}) {
  const numeric = parseNumber(value);

  const decrement = () => {
    const next = Math.max(min, Math.round((numeric - step) * 100) / 100);
    onChange(String(next));
  };

  const increment = () => {
    const next = Math.round((numeric + step) * 100) / 100;
    onChange(String(next));
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable onPress={decrement} hitSlop={8} style={styles.stepButton}>
          <Text style={styles.stepButtonText}>−</Text>
        </Pressable>
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType="number-pad"
          selectTextOnFocus
          style={styles.input}
        />
        <Pressable onPress={increment} hitSlop={8} style={styles.stepButton}>
          <Text style={styles.stepButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function SeriesEditorCard({ index, reps, loadKg, onRepsChange, onLoadKgChange }: SeriesEditorCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Série {index + 1}</Text>
      <View style={styles.row}>
        <StepperField label="Reps" value={reps} min={1} step={1} onChange={onRepsChange} />
        <StepperField label="Carga (kg)" value={loadKg} min={0} step={2.5} onChange={onLoadKgChange} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 12,
    gap: 10,
  },
  title: {
    color: colors.textStrong,
    fontSize: 16,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  field: {
    flex: 1,
  },
  label: {
    color: colors.textMuted,
    marginBottom: 6,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  stepButton: {
    width: 42,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardPressed,
  },
  stepButtonText: {
    color: colors.primaryLight,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 26,
  },
  input: {
    flex: 1,
    textAlign: 'center',
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    paddingVertical: 10,
  },
});


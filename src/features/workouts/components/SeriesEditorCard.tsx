import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../../theme/darkColors';

type SeriesEditorCardProps = {
  index: number;
  reps: string;
  loadKg: string;
  onRepsChange: (value: string) => void;
  onLoadKgChange: (value: string) => void;
};

export function SeriesEditorCard({ index, reps, loadKg, onRepsChange, onLoadKgChange }: SeriesEditorCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Série {index + 1}</Text>
      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>Reps</Text>
          <TextInput
            value={reps}
            onChangeText={onRepsChange}
            keyboardType="number-pad"
            style={styles.input}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Carga (kg)</Text>
          <TextInput
            value={loadKg}
            onChangeText={onLoadKgChange}
            keyboardType="number-pad"
            style={styles.input}
          />
        </View>
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
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    fontSize: 18,
    fontWeight: '700',
  },
});

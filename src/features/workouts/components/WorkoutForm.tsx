import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../../theme/darkColors';
import { SelectableChip } from '../../../components/SelectableChip';
import { PrimaryButton } from '../../../components/PrimaryButton';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

type WorkoutFormProps = {
  onSubmit: (name: string, trainingDays: string[]) => void;
  feedback?: string | null;
};

export function WorkoutForm({ onSubmit, feedback }: WorkoutFormProps) {
  const [name, setName] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const canCreate = useMemo(() => name.trim().length >= 2, [name]);

  const toggleDay = (day: string) => {
    setSelectedDays((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day]
    );
  };

  const handleSubmit = () => {
    onSubmit(name.trim(), selectedDays);
    setName('');
    setSelectedDays([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar treino</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Nome do treino"
        placeholderTextColor={colors.textPlaceholder}
        style={styles.input}
      />

      <Text style={styles.sectionTitle}>Dias de treino</Text>
      <View style={styles.daysRow}>
        {DAYS.map((day) => (
          <SelectableChip
            key={day}
            label={day}
            selected={selectedDays.includes(day)}
            onPress={() => toggleDay(day)}
          />
        ))}
      </View>

      <PrimaryButton
        label="ADICIONAR"
        onPress={handleSubmit}
        disabled={!canCreate}
      />
      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderCard,
    padding: 12,
    gap: 10,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  feedback: {
    color: colors.textMuted,
  },
});

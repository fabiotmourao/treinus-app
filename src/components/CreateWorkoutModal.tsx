import React, { useMemo } from 'react';
import { View, Text, TextInput, Modal, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/darkColors';
import { SelectableChip } from './SelectableChip';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

type CreateWorkoutModalProps = {
  visible: boolean;
  name: string;
  selectedDays: string[];
  feedback: string | null;
  loading?: boolean;
  mode?: 'create' | 'edit';
  onClose: () => void;
  onNameChange: (value: string) => void;
  onToggleDay: (day: string) => void;
  onSubmit: () => void;
};

export function CreateWorkoutModal({
  visible,
  name,
  selectedDays,
  feedback,
  loading = false,
  mode = 'create',
  onClose,
  onNameChange,
  onToggleDay,
  onSubmit,
}: CreateWorkoutModalProps) {
  const canSubmit = useMemo(() => name.trim().length >= 2, [name]);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{mode === 'edit' ? 'Editar rotina de treino' : 'Criar rotina de treino'}</Text>

          <TextInput
            value={name}
            onChangeText={onNameChange}
            placeholder="Nome do treino"
            placeholderTextColor={colors.textPlaceholder}
            autoFocus
            style={styles.input}
          />

          <Text style={styles.sectionLabel}>Dias de treino</Text>
          <View style={styles.daysRow}>
            {DAYS.map((day) => (
              <View key={day} style={styles.dayChipWrapper}>
                <SelectableChip
                  label={day}
                  selected={selectedDays.includes(day)}
                  onPress={() => onToggleDay(day)}
                />
              </View>
            ))}
          </View>

          {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}

          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelLabel}>Cancelar</Text>
            </Pressable>
          <Pressable
            onPress={onSubmit}
            disabled={!canSubmit || loading}
            style={[styles.submitButton, (!canSubmit || loading) && styles.submitButtonDisabled]}
          >
            <Text style={styles.submitLabel}>{mode === 'edit' ? 'Salvar' : 'Adicionar'}</Text>
          </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000088',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  sheet: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderCard,
    padding: 16,
    gap: 12,
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
    paddingVertical: 10,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  sectionLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 6,
  },
  dayChipWrapper: {
    flexBasis: '30%',
  },
  feedback: {
    color: colors.textMuted,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardPressed,
  },
  cancelLabel: {
    color: colors.textBody,
    fontWeight: '700',
    fontSize: 14,
  },
  submitButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitLabel: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 14,
  },
});
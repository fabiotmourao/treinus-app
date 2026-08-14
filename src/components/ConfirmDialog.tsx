import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/darkColors';

export type ConfirmDialogOptions = {
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
};

type ConfirmDialogProps = {
  visible: boolean;
  options: ConfirmDialogOptions | null;
  onCancel: () => void;
};

/**
 * Modal de confirmação customizado, seguindo o padrão visual do projeto
 * (mesmo estilo do CreateWorkoutModal). Funciona igualmente em web e mobile,
 * sem depender do `window.confirm` ou `Alert.alert`.
 */
export function ConfirmDialog({ visible, options, onCancel }: ConfirmDialogProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{options?.title ?? ''}</Text>
          <Text style={styles.message}>{options?.message ?? ''}</Text>

          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={styles.cancelButton}>
              <Text style={styles.cancelLabel}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                options?.onConfirm();
                onCancel();
              }}
              style={[styles.confirmButton, options?.destructive && styles.confirmButtonDestructive]}
            >
              <Text style={styles.confirmLabel}>{options?.confirmLabel ?? 'Confirmar'}</Text>
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
    maxWidth: 420,
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
  message: {
    color: colors.textBody,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
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
  confirmButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  confirmButtonDestructive: {
    backgroundColor: colors.error,
  },
  confirmLabel: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 14,
  },
});

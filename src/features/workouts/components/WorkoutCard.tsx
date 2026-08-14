import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../theme/darkColors';
import { ActionMenu } from '../../../components/ActionMenu';

type WorkoutCardProps = {
  name: string;
  trainingDays: string[];
  note: string | null;
  updatedAt: string | null;
  createdAt: string | null;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  menuOpen?: boolean;
  onMenuClose?: () => void;
  onMenuToggle?: () => void;
};

export function WorkoutCard({ name, trainingDays, note, updatedAt, createdAt, onPress, onEdit, onDelete, menuOpen, onMenuClose, onMenuToggle }: WorkoutCardProps) {
  const menuActions = React.useMemo(() => {
    const actions: { label: string; onPress: () => void; destructive?: boolean }[] = [];
    if (onEdit) {
      actions.push({ label: 'Editar', onPress: onEdit });
    }
    if (onDelete) {
      actions.push({ label: 'Excluir', onPress: onDelete, destructive: true });
    }
    return actions;
  }, [onEdit, onDelete]);

  const handleSelect = () => {
    onMenuClose?.();
  };

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        {menuActions.length > 0 ? (
          <ActionMenu actions={menuActions} isOpen={menuOpen} onClose={onMenuClose} onToggle={onMenuToggle} onSelect={handleSelect} />
        ) : null}
      </View>
      {trainingDays?.length ? (
        <Text style={styles.days}>Dias: {trainingDays.join(', ')}</Text>
      ) : null}
      {note ? <Text style={styles.note}>{note}</Text> : null}
      <Text style={styles.updatedAt}>
        Atualizado em: {updatedAt ?? createdAt ?? 'agora'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    gap: 6,
    backgroundColor: colors.card,
    overflow: 'visible',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    color: colors.textStrong,
    fontWeight: '700',
    fontSize: 16,
    flex: 1,
  },
  days: {
    color: colors.primaryLight,
    fontSize: 13,
  },
  note: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  updatedAt: {
    color: colors.textSubtle,
    fontSize: 12,
  },
});
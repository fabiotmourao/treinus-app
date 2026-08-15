import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../theme/darkColors';
import { ExerciseImage } from '../../exercises/components/ExerciseImage';
import { ActionMenu } from '../../../components/ActionMenu';

type WorkoutExerciseRowProps = {
  name: string;
  gifUrl: string | null;
  gifLocalPath?: string | null;
  seriesCount: number;
  reps: number;
  loadKg: number;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function WorkoutExerciseRow({ name, gifUrl, gifLocalPath, seriesCount, reps, loadKg, onPress, onEdit, onDelete }: WorkoutExerciseRowProps) {
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

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <ExerciseImage gifUrl={gifUrl} gifLocalPath={gifLocalPath} size={96} borderRadius={10} />
      <View style={styles.info}>
        <View style={styles.rowHeader}>
          <Text style={styles.name}>{name}</Text>
          {menuActions.length > 0 ? <ActionMenu actions={menuActions} /> : null}
        </View>
        <Text style={styles.details}>
          {seriesCount} séries • {reps} reps • {loadKg} kg
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  info: {
    flex: 1,
    gap: 5,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  name: {
    color: colors.textStrong,
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  details: {
    color: colors.textSecondary,
    fontSize: 15,
  },
});
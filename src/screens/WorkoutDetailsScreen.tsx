import React, { useMemo } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { estimateWorkoutMetrics, parseWorkoutExerciseConfig } from '../features/workouts/selectors';
import { useWorkoutDetails } from '../features/workouts/hooks';
import { workoutsFeatureRepository } from '../features/workouts/repository';
import { colors } from '../theme/darkColors';
import { EmptyState } from '../components/EmptyState';
import { WorkoutExerciseRow } from '../features/workouts/components/WorkoutExerciseRow';
import { MetricBox } from '../features/workouts/components/MetricBox';
import { PrimaryButton } from '../components/PrimaryButton';
import { useFeedback } from '../components/FeedbackProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkoutDetails'>;

export function WorkoutDetailsScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { workoutId } = route.params;
  const { confirm, showToast } = useFeedback();

  const { data, refetch } = useWorkoutDetails(workoutId);
  const workout = data?.workout ?? null;
  const exercises = data?.exercises ?? [];

  const metrics = useMemo(
    () =>
      estimateWorkoutMetrics(
        exercises.map((item) => ({
          sets: item.sets,
          reps: item.reps,
          restSeconds: item.restSeconds,
          notes: item.notes,
        }))
      ),
    [exercises]
  );

  const handleDelete = (exerciseId: string) => {
    confirm({
      title: 'Excluir exercício',
      message: 'Deseja realmente remover este exercício do treino?',
      confirmLabel: 'Excluir',
      destructive: true,
      onConfirm: () => {
        workoutsFeatureRepository.deleteWorkoutExercise(exerciseId);
        refetch();
        showToast('Exercício removido do treino.');
      },
    });
  };

  if (!workout) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Text style={{ color: '#adb7c4' }}>Treino não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ gap: 14, paddingBottom: insets.bottom + 24 }}
    >
      <View style={{ backgroundColor: colors.card, paddingHorizontal: 16, paddingVertical: 18, gap: 14 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: '700' }}>{workout.name}</Text>
        {workout.trainingDays?.length ? (
          <Text style={{ color: colors.textBody }}>Dias de treino: {workout.trainingDays.join(', ')}</Text>
        ) : null}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <MetricBox label="Duração" value={`${Math.max(0, metrics.durationMin - 5)}-${metrics.durationMin + 5} min`} />
          <MetricBox label="Calorias" value={`${metrics.calories} kcal`} />
          <MetricBox label="Carga" value={`${Math.round(metrics.totalLoadKg)} kg`} />
        </View>

        <PrimaryButton label="Iniciar Treino" onPress={() => {}} />
      </View>

      <View style={{ paddingHorizontal: 16, gap: 10 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: '700' }}>Lista de exercícios</Text>

        <FlatList
          data={exercises}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 6 }} />}
          renderItem={({ item }) => {
            const config = parseWorkoutExerciseConfig(item);
            const firstSeries = config.series[0] ?? { reps: item.reps, loadKg: 0 };

            return (
              <WorkoutExerciseRow
                name={item.name}
                gifUrl={item.gifUrl}
                gifLocalPath={item.gifLocalPath}
                seriesCount={config.series.length}
                reps={firstSeries.reps}
                loadKg={firstSeries.loadKg}
                onPress={() => navigation.navigate('WorkoutExerciseEdit', { workoutId, workoutExerciseId: item.id })}
                onEdit={() => navigation.navigate('WorkoutExerciseEdit', { workoutId, workoutExerciseId: item.id })}
                onDelete={() => handleDelete(item.id)}
              />
            );
          }}
          ListEmptyComponent={<EmptyState message="Nenhum exercício adicionado ainda." />}
        />
      </View>

      <View style={{ alignItems: 'flex-end', paddingHorizontal: 16 }}>
        <Pressable
          onPress={() => navigation.navigate('WorkoutExercisePicker', { workoutId })}
          style={{ borderRadius: 10, backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 20 }}
        >
          <Text style={{ color: colors.textInverse, fontWeight: '700', fontSize: 15 }}>+ Adicionar</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
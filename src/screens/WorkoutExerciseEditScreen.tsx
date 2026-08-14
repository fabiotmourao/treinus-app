import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { parseWorkoutExerciseConfig } from '../features/workouts/selectors';
import { useUpdateWorkoutExerciseConfig, useWorkoutDetails } from '../features/workouts/hooks';
import { colors } from '../theme/darkColors';
import { ExerciseImage } from '../features/exercises/components/ExerciseImage';
import { SeriesEditorCard } from '../features/workouts/components/SeriesEditorCard';
import { PrimaryButton } from '../components/PrimaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkoutExerciseEdit'>;

type EditableSeries = {
  reps: string;
  loadKg: string;
};

export function WorkoutExerciseEditScreen({ route, navigation }: Props) {
  const { workoutId, workoutExerciseId } = route.params;

  const [series, setSeries] = useState<EditableSeries[]>([]);
  const [restSeconds, setRestSeconds] = useState('60');
  const [exerciseName, setExerciseName] = useState('Exercício');
  const [exerciseSubtitle, setExerciseSubtitle] = useState('');
  const [gifUrl, setGifUrl] = useState<string | null>(null);

  const { data: details } = useWorkoutDetails(workoutId);
  const updateConfig = useUpdateWorkoutExerciseConfig();

  useEffect(() => {
    const exerciseItems = details?.exercises ?? [];
    const item = exerciseItems.find((entry) => entry.id === workoutExerciseId);

    if (!item) {
      return;
    }

    const config = parseWorkoutExerciseConfig(item);
    setSeries(config.series.map((entry) => ({ reps: String(entry.reps), loadKg: String(entry.loadKg) })));
    setRestSeconds(String(config.restSeconds));
    setExerciseName(item.name ?? 'Exercício');
    setExerciseSubtitle([item.bodyPart, item.target].filter(Boolean).join(', '));
    setGifUrl(item.gifUrl ?? null);
  }, [workoutExerciseId, workoutId, details]);

  const canSave = useMemo(
    () =>
      series.length > 0 &&
      series.every((entry) => {
        const reps = Number(entry.reps);
        const loadKg = Number(entry.loadKg);
        return Number.isFinite(reps) && reps > 0 && Number.isFinite(loadKg) && loadKg >= 0;
      }),
    [series]
  );

  const updateSeries = (index: number, key: 'reps' | 'loadKg', value: string) => {
    setSeries((current) => {
      const copy = [...current];
      copy[index] = { ...copy[index], [key]: value.replace(/[^0-9]/g, '') };
      return copy;
    });
  };

  const addSeries = () => {
    setSeries((current) => [...current, { reps: '10', loadKg: '10' }]);
  };

  const handleSave = () => {
    if (!canSave) {
      return;
    }

    updateConfig.mutate({
      workoutExerciseId,
      workoutId,
      series: series.map((entry) => ({ reps: Number(entry.reps), loadKg: Number(entry.loadKg) })),
      restSeconds: Number(restSeconds) || 60,
    });

    navigation.goBack();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, gap: 14 }}>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <ExerciseImage gifUrl={gifUrl} size={96} borderRadius={12} />
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={{ color: colors.textStrong, fontSize: 28, fontWeight: '700' }}>{exerciseName}</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 16 }}>{exerciseSubtitle}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 12 }}>
          <Text style={{ color: colors.textMuted, marginBottom: 6 }}>Descanso (seg)</Text>
          <TextInput
            value={restSeconds}
            onChangeText={(value) => setRestSeconds(value.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            style={{ color: colors.textPrimary, fontSize: 22, fontWeight: '700' }}
          />
        </View>
      </View>

      {series.map((entry, index) => (
        <SeriesEditorCard
          key={`series_${index}`}
          index={index}
          reps={entry.reps}
          loadKg={entry.loadKg}
          onRepsChange={(value) => updateSeries(index, 'reps', value)}
          onLoadKgChange={(value) => updateSeries(index, 'loadKg', value)}
        />
      ))}

      <Pressable
        onPress={addSeries}
        style={{ alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 }}
      >
        <Text style={{ color: colors.primary, fontSize: 30, fontWeight: '700' }}>+ Adicionar série</Text>
      </Pressable>

      <PrimaryButton
        label="Salvar"
        onPress={handleSave}
        disabled={!canSave}
        style={{ marginTop: 10, borderRadius: 999, paddingVertical: 16 }}
      />
    </ScrollView>
  );
}

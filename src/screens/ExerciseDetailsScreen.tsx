import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useExercise } from '../features/exercises/hooks';
import { colors } from '../theme/darkColors';
import { ExerciseImage } from '../features/exercises/components/ExerciseImage';

type Props = NativeStackScreenProps<RootStackParamList, 'ExerciseDetails'>;

export function ExerciseDetailsScreen({ route }: Props) {
  const { exerciseId } = route.params;

  const { data: exercise } = useExercise(exerciseId);

  if (!exercise) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Text style={{ color: '#adb7c4' }}>Exercício não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, gap: 14 }}>
      <View style={{ borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 14, gap: 12 }}>
        <ExerciseImage gifUrl={exercise.gifUrl} gifLocalPath={exercise.gifLocalPath} size={260} borderRadius={10} style={{ width: '100%' }} />

        <Text style={{ color: colors.textStrong, fontSize: 24, fontWeight: '700' }}>{exercise.name}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 16 }}>
          {exercise.bodyPart} • {exercise.target} • {exercise.equipment}
        </Text>
      </View>

      <View style={{ borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 14, gap: 8 }}>
        <Text style={{ color: colors.textStrong, fontSize: 18, fontWeight: '700' }}>Como executar</Text>
        {exercise.instructions.length ? (
          exercise.instructions.map((step, index) => (
            <Text key={`${index}_${step}`} style={{ color: colors.textBody, lineHeight: 22 }}>
              {index + 1}. {step}
            </Text>
          ))
        ) : (
          <Text style={{ color: '#9aa4b2' }}>Sem instruções detalhadas para este exercício.</Text>
        )}
      </View>
    </ScrollView>
  );
}

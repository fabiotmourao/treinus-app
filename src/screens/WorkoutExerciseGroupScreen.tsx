import React, { useMemo, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import {
  useExercisesByGroup,
  useFavorites,
  useToggleFavorite,
} from '../features/exercises/hooks';
import { useAddWorkoutExercise, useWorkoutDetails } from '../features/workouts/hooks';
import { colors } from '../theme/darkColors';
import { SearchInput } from '../components/SearchInput';
import { ScreenHeader } from '../components/ScreenHeader';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { ExerciseCard } from '../features/exercises/components/ExerciseCard';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkoutExerciseGroup'>;

type ExerciseItem = {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl: string | null;
};

export function WorkoutExerciseGroupScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { workoutId, groupKey, groupLabel, bodyView } = route.params;
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: items = [], isLoading } = useExercisesByGroup({
    groupKey,
    bodyView,
    search,
    limit: 2000,
    offset: 0,
  });
  const { data: favorites = [] } = useFavorites();
  const toggleFavoriteMutation = useToggleFavorite();
  const { data: details } = useWorkoutDetails(workoutId);
  const addWorkoutExercise = useAddWorkoutExercise();

  const favoriteIds = useMemo(
    () => new Set((favorites as ExerciseItem[]).map((item) => item.id)),
    [favorites]
  );

  const subtitle = bodyView === 'front' ? 'Vista frontal' : 'Vista posterior';

  const emptyMessage = search.trim()
    ? 'Nenhum exercício encontrado nesse grupo para essa busca.'
    : 'Sem exercícios nesse grupo no banco local.';

  const handleToggleSelect = (exerciseId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(exerciseId)) {
        next.delete(exerciseId);
      } else {
        next.add(exerciseId);
      }
      return next;
    });
  };

  const handleToggleFavorite = (exerciseId: string) => {
    toggleFavoriteMutation.mutate(exerciseId);
  };

  const handleAddSelected = () => {
    const selectedItems = items.filter((item) => selectedIds.has(item.id));
    if (!selectedItems.length) return;

    const baseSortOrder = details?.exercises.length ?? 0;

    selectedItems.forEach((item, index) => {
      addWorkoutExercise.mutate({
        id: `we_${Date.now()}_${item.id}`,
        workoutId,
        exerciseId: item.id,
        sortOrder: baseSortOrder + index,
        sets: 3,
        reps: 10,
        restSeconds: 60,
      });
    });

    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16, gap: 10 }}>
      <ScreenHeader title={groupLabel} subtitle={subtitle} />

      <SearchInput
        placeholder="Buscar exercício do grupo"
        value={search}
        onChangeText={setSearch}
      />

      {isLoading ? <Text style={{ color: colors.textSubtle }}>Carregando exercícios...</Text> : null}

      <FlatList
        style={{ flex: 1 }}
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 10 }}
        contentContainerStyle={{ gap: 10, paddingBottom: 24, flexGrow: items.length ? 0 : 1 }}
        ListEmptyComponent={<EmptyState message={emptyMessage} />}
        renderItem={({ item }) => (
          <ExerciseCard
            item={item}
            selected={selectedIds.has(item.id)}
            isFavorite={favoriteIds.has(item.id)}
            onPress={() => handleToggleSelect(item.id)}
            onToggleFavorite={() => handleToggleFavorite(item.id)}
          />
        )}
      />

      <View style={{ paddingBottom: insets.bottom }}>
        <PrimaryButton
          label={`Adicionar exercício${selectedIds.size ? ` (${selectedIds.size})` : ''}`}
          onPress={handleAddSelected}
          disabled={selectedIds.size === 0}
        />
      </View>
    </View>
  );
}

import React, { useMemo, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useExercisesByGroup, useFavorites, useToggleFavorite } from '../features/exercises/hooks';
import { colors } from '../theme/darkColors';
import { SearchInput } from '../components/SearchInput';
import { ScreenHeader } from '../components/ScreenHeader';
import { EmptyState } from '../components/EmptyState';
import { ExerciseCard } from '../features/exercises/components/ExerciseCard';

type Props = NativeStackScreenProps<RootStackParamList, 'ExerciseGroupExercises'>;

type ExerciseItem = {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl: string | null;
};

export function ExerciseGroupExercisesScreen({ route, navigation }: Props) {
  const { groupKey, groupLabel, bodyView } = route.params;
  const [search, setSearch] = useState('');

  const { data: items = [], isLoading } = useExercisesByGroup({
    groupKey,
    bodyView,
    search,
    limit: 2000,
    offset: 0,
  });
  const { data: favorites = [] } = useFavorites();
  const toggleFavoriteMutation = useToggleFavorite();

  const favoriteIds = useMemo(
    () => new Set((favorites as ExerciseItem[]).map((item) => item.id)),
    [favorites]
  );

  const subtitle = bodyView === 'front' ? 'Vista frontal' : 'Vista posterior';

  const emptyMessage = search.trim()
    ? 'Nenhum exercício encontrado nesse grupo para essa busca.'
    : 'Sem exercícios nesse grupo no banco local.';

  const handleToggleFavorite = (exerciseId: string) => {
    toggleFavoriteMutation.mutate(exerciseId);
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
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 10 }}
        contentContainerStyle={{ gap: 10, paddingBottom: 24, flexGrow: items.length ? 0 : 1 }}
        ListEmptyComponent={<EmptyState message={emptyMessage} />}
        renderItem={({ item }) => (
          <ExerciseCard
            item={item}
            isFavorite={favoriteIds.has(item.id)}
            onPress={() => navigation.navigate('ExerciseDetails', { exerciseId: item.id })}
            onToggleFavorite={() => handleToggleFavorite(item.id)}
          />
        )}
      />
    </View>
  );
}

import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFavorites, useToggleFavorite } from '../features/exercises/hooks';
import { colors } from '../theme/darkColors';
import { EmptyState } from '../components/EmptyState';
import { ExerciseCard } from '../features/exercises/components/ExerciseCard';

type FavoriteItem = {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl: string | null;
};

export function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const { data: items = [], isLoading } = useFavorites();
  const toggleFavoriteMutation = useToggleFavorite();

  const handleRemove = (exerciseId: string) => {
    toggleFavoriteMutation.mutate(exerciseId);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      {isLoading ? <Text style={{ color: colors.textSubtle, marginBottom: 8 }}>Carregando favoritos...</Text> : null}
      <FlatList
        data={items as FavoriteItem[]}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 10 }}
        contentContainerStyle={{ gap: 10, paddingBottom: 24, flexGrow: items.length ? 0 : 1 }}
        ListEmptyComponent={<EmptyState message="Nenhum favorito ainda." />}
        renderItem={({ item }) => (
          <ExerciseCard
            item={item}
            isFavorite
            onPress={() => navigation.navigate('ExerciseDetails', { exerciseId: item.id })}
            onToggleFavorite={() => handleRemove(item.id)}
          />
        )}
      />
    </View>
  );
}

import React, { useMemo, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  useExerciseGroupsByView,
  useExercisesCount,
} from '../features/exercises/hooks';
import { ExerciseBodyView } from '../features/exercises/types';
import { colors } from '../theme/darkColors';
import { SearchInput } from '../components/SearchInput';
import { SelectableChip } from '../components/SelectableChip';
import { EmptyState } from '../components/EmptyState';
import { ExerciseGroupCard } from '../features/exercises/components/ExerciseGroupCard';

type GroupCard = {
  groupKey: string;
  groupLabel: string;
  bodyView: ExerciseBodyView;
  total: number;
};

export function ExercisesScreen() {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
  const [selectedView, setSelectedView] = useState<ExerciseBodyView>('front');

  const { data: groups = [], isLoading } = useExerciseGroupsByView(selectedView, search);
  const { data: totalCount = 0 } = useExercisesCount();

  const emptyMessage = useMemo(() => {
    if (search.trim()) {
      return 'Nenhum grupo encontrado para essa busca.';
    }
    return 'Sem exercícios locais. Faça a sincronização primeiro.';
  }, [search]);

  const handleOpenGroup = (group: GroupCard) => {
    navigation.navigate('ExerciseGroupExercises', {
      groupKey: group.groupKey,
      groupLabel: group.groupLabel,
      bodyView: selectedView,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16, gap: 12 }}>
      <SearchInput
        placeholder="Buscar grupos ou exercícios"
        value={search}
        onChangeText={setSearch}
      />

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <SelectableChip
          label="Frente"
          selected={selectedView === 'front'}
          onPress={() => setSelectedView('front')}
          style={{ flex: 1, borderRadius: 10, paddingVertical: 10 }}
        />
        <SelectableChip
          label="Costas"
          selected={selectedView === 'back'}
          onPress={() => setSelectedView('back')}
          style={{ flex: 1, borderRadius: 10, paddingVertical: 10 }}
        />
      </View>

      <Text style={{ color: '#8e98a6', fontSize: 12 }}>
        Exercícios no banco: {totalCount} • grupos exibidos: {groups.length}
      </Text>

      {isLoading ? <Text style={{ color: colors.textSubtle }}>Carregando grupos...</Text> : null}

      <FlatList
        data={groups}
        keyExtractor={(item) => item.groupKey}
        numColumns={2}
        columnWrapperStyle={{ gap: 10 }}
        contentContainerStyle={{ gap: 10, paddingBottom: 24, flexGrow: groups.length ? 0 : 1 }}
        ListEmptyComponent={<EmptyState message={emptyMessage} />}
        renderItem={({ item }) => (
          <ExerciseGroupCard
            label={item.groupLabel}
            total={item.total}
            onPress={() => handleOpenGroup(item)}
          />
        )}
      />
    </View>
  );
}

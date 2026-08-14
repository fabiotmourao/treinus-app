import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Text, View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCreateWorkout, useDeleteWorkout, useUpdateWorkout, useWorkouts } from '../features/workouts/hooks';
import { colors } from '../theme/darkColors';
import { PrimaryButton } from '../components/PrimaryButton';
import { EmptyState } from '../components/EmptyState';
import { WorkoutCard } from '../features/workouts/components/WorkoutCard';
import { CreateWorkoutModal } from '../components/CreateWorkoutModal';
import { useFeedback } from '../components/FeedbackProvider';

export function WorkoutsScreen() {
  const navigation = useNavigation<any>();
  const { confirm, showToast } = useFeedback();
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<{ id: string; name: string; trainingDays: string[] } | null>(null);
  const [name, setName] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const { data: items = [] } = useWorkouts();
  const createWorkout = useCreateWorkout();
  const updateWorkout = useUpdateWorkout();
  const deleteWorkout = useDeleteWorkout();

  const canSubmit = useMemo(() => name.trim().length >= 2, [name]);

  const toggleDay = (day: string) => {
    setSelectedDays((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day]
    );
  };

  const openCreate = () => {
    setEditItem(null);
    setName('');
    setSelectedDays([]);
    setFeedback(null);
    setOpenMenuId(null);
    setModalVisible(true);
  };

  const openEdit = (item: { id: string; name: string; trainingDays: string[] }) => {
    setEditItem(item);
    setName(item.name);
    setSelectedDays(item.trainingDays);
    setFeedback(null);
    setOpenMenuId(null);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setOpenMenuId(null);
    confirm({
      title: 'Excluir treino',
      message: 'Deseja realmente excluir este treino?',
      confirmLabel: 'Excluir',
      destructive: true,
      onConfirm: () => {
        deleteWorkout.mutate(id, {
          onSuccess: () => showToast('Treino excluído com sucesso.'),
          onError: () => showToast('Erro ao excluir treino.', 'error'),
        });
      },
    });
  };

  const handleSubmit = useCallback(() => {
    const normalizedName = name.trim();
    if (normalizedName.length < 2) {
      setFeedback('O nome precisa ter pelo menos 2 caracteres.');
      return;
    }

    if (editItem) {
      updateWorkout.mutate(
        {
          id: editItem.id,
          name: normalizedName,
          trainingDays: selectedDays,
        },
        {
          onSuccess: () => {
            setFeedback(null);
            setName('');
            setSelectedDays([]);
            setEditItem(null);
            setModalVisible(false);
            showToast('Treino atualizado com sucesso.');
          },
          onError: () => {
            setFeedback('Erro ao atualizar treino.');
          },
        }
      );
      return;
    }

    const workoutId = `w_${Date.now()}`;
    createWorkout.mutate(
      {
        id: workoutId,
        name: normalizedName,
        note: null,
        trainingDays: selectedDays,
      },
      {
        onSuccess: () => {
          setFeedback(null);
          setName('');
          setSelectedDays([]);
          setEditItem(null);
          setModalVisible(false);
          showToast('Treino criado com sucesso.');
        },
        onError: () => {
          setFeedback('Erro ao criar treino.');
        },
      }
    );
  }, [name, selectedDays, createWorkout, updateWorkout, editItem, showToast]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16, gap: 12 }}>
      <Pressable
        onPress={openCreate}
        style={{
          backgroundColor: colors.card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.borderCard,
          padding: 12,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '700' }}>Adicionar treino</Text>
      </Pressable>

      <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: '700' }}>Meus treinos</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 8, paddingBottom: 24, flexGrow: items.length ? 0 : 1 }}
        ListEmptyComponent={<EmptyState message="Crie sua primeira rotina de treino." />}
        renderItem={({ item }) => (
          <WorkoutCard
            name={item.name}
            trainingDays={item.trainingDays}
            note={item.note}
            updatedAt={item.updatedAt}
            createdAt={item.createdAt}
            onPress={() => navigation.navigate('WorkoutDetails', { workoutId: item.id })}
            onEdit={() => openEdit(item)}
            onDelete={() => handleDelete(item.id)}
            menuOpen={openMenuId === item.id}
            onMenuClose={() => setOpenMenuId(null)}
            onMenuToggle={() => setOpenMenuId((current) => (current === item.id ? null : item.id))}
          />
        )}
      />

      <CreateWorkoutModal
        visible={modalVisible}
        name={name}
        selectedDays={selectedDays}
        feedback={feedback}
        loading={createWorkout.isPending || updateWorkout.isPending}
        mode={editItem ? 'edit' : 'create'}
        onClose={() => {
          setModalVisible(false);
          setEditItem(null);
          setOpenMenuId(null);
        }}
        onNameChange={setName}
        onToggleDay={toggleDay}
        onSubmit={handleSubmit}
      />
    </View>
  );
}
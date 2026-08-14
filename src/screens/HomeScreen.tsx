import React, { useMemo, useRef, useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useAppStore } from '../store/useAppStore';
import { useWorkouts } from '../features/workouts/hooks';
import { useExercisesCount } from '../features/exercises/hooks';
import { MainTabParamList } from '../navigation/RootNavigator';
import { SyncService, SyncProgress } from '../services/sync/SyncService';
import { colors } from '../theme/darkColors';
import { WeekCalendar } from '../features/workouts/components/WeekCalendar';

type Props = BottomTabScreenProps<MainTabParamList, 'Home'>;

function getWeekDays(offset = 0) {
  const today = new Date();
  const current = new Date(today);
  current.setDate(today.getDate() + offset * 7);

  const start = new Date(current);
  const day = start.getDay();
  start.setDate(start.getDate() - day);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}

function formatMonth(date: Date) {
  return date.toLocaleDateString('pt-BR', { month: 'long' });
}

function formatLastSync(value: string | null) {
  if (!value) {
    return 'nunca';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function HomeScreen({ navigation }: Props) {
  const lastSyncAt = useAppStore((state) => state.lastSyncAt);
  const setLastSyncAt = useAppStore((state) => state.setLastSyncAt);
  const { data: workouts = [] } = useWorkouts();
  const { data: totalExercises = 0 } = useExercisesCount();
  const scrollRef = useRef<ScrollView>(null);
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState<SyncProgress | null>(null);

  const hasExercises = totalExercises > 0;

  const handleSync = async () => {
    if (syncing) {
      return;
    }

    try {
      setSyncing(true);
      setProgress({ received: 0, total: null, percent: 0 });
      const result = await SyncService.syncExercises(setProgress);
      setLastSyncAt(result.syncedAt);
      setProgress({ received: result.totalSaved, total: null, percent: 100 });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Falha ao sincronizar dados.';
      Alert.alert('Erro na sincronização', message);
    } finally {
      setSyncing(false);
    }
  };

  const performedDates = useMemo(() => {
    const set = new Set<string>();
    for (const workout of workouts) {
      if (workout.performedAt) {
        set.add(workout.performedAt);
      }
    }
    return set;
  }, [workouts]);

  const today = useMemo(() => formatDate(new Date()), []);
  const currentMonthLabel = useMemo(() => formatMonth(new Date()), []);

  const weeks = useMemo(() => {
    const todayDate = new Date();
    const todayDay = todayDate.getDate();
    const currentWeekDay = todayDate.getDay();

    const startOffset = -Math.floor((todayDay + currentWeekDay) / 7);
    const endOffset = Math.floor((30 - todayDay) / 7) + 1;

    const result = [];
    for (let i = startOffset; i <= endOffset; i++) {
      const days = getWeekDays(i);
      result.push({ offset: i, days });
    }
    return result;
  }, []);

  const todayWeekIndex = useMemo(() => {
    const todayDate = new Date();
    const todayDay = todayDate.getDate();
    const currentWeekDay = todayDate.getDay();
    const startOffset = -Math.floor((todayDay + currentWeekDay) / 7);
    return Math.abs(startOffset);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      const x = todayWeekIndex * 90 + 16;
      scrollRef.current.scrollTo({ x, animated: false });
    }
  }, [todayWeekIndex]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, gap: 18 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: '700' }}>Olá, Fábio</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4 }}>Prepare-se, hoje é dia de treino!</Text>
        </View>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.borderCard,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 18 }}>👤</Text>
        </View>
      </View>

      <View>
        <Text style={styles.monthLabel}>{currentMonthLabel}</Text>
        <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          {weeks.map((week) => (
            <WeekCalendar
              key={week.offset}
              days={week.days}
              performedDates={performedDates}
              today={today}
            />
          ))}
        </ScrollView>
      </View>

      <View style={{ gap: 10 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: '700' }}>Rotinas</Text>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable
            onPress={() => navigation.navigate('Exercises')}
            style={{
              flex: 1,
              backgroundColor: colors.cardPressed,
              borderRadius: 12,
              paddingVertical: 18,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#e8edf3', fontWeight: '700' }}>Explorar rotinas</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('Favorites')}
            style={{
              flex: 1,
              backgroundColor: colors.cardPressed,
              borderRadius: 12,
              paddingVertical: 18,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#e8edf3', fontWeight: '700' }}>Favoritos</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.borderCard, padding: 14, gap: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '700' }}>Catálogo de exercícios</Text>
          {hasExercises ? (
            <View
              style={{
                backgroundColor: colors.primaryAlpha,
                borderRadius: 999,
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}
            >
              <Text style={{ color: colors.primaryLight, fontSize: 11, fontWeight: '600' }}>
                {totalExercises} exercícios
              </Text>
            </View>
          ) : null}
        </View>

        <Text style={{ color: colors.textMuted, lineHeight: 19 }}>
          {syncing
            ? `Baixando exercícios da internet...`
            : hasExercises
              ? 'Os exercícios ficam salvos no aparelho. Toque para atualizar com os dados mais recentes da internet.'
              : 'Baixe a lista de exercícios uma vez para usar o app no modo offline.'}
        </Text>

        <Text style={{ color: colors.textMuted, fontSize: 12 }}>
          Última sincronização: <Text style={{ color: '#e7edf5' }}>{formatLastSync(lastSyncAt)}</Text>
        </Text>

        {syncing && progress ? (
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                {progress.total ? `${progress.received} de ${progress.total}` : `${progress.received} exercícios`}
              </Text>
              <Text style={{ color: colors.primaryLight, fontWeight: '700', fontSize: 12 }}>{progress.percent}%</Text>
            </View>
            <View
              style={{
                height: 8,
                borderRadius: 4,
                backgroundColor: colors.cardPressed,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: `${progress.percent}%`,
                  backgroundColor: colors.primary,
                  borderRadius: 4,
                }}
              />
            </View>
          </View>
        ) : null}

        <Pressable
          onPress={handleSync}
          disabled={syncing}
          style={[
            {
              borderRadius: 12,
              backgroundColor: syncing ? colors.primaryDark : colors.primary,
              paddingVertical: 12,
              alignItems: 'center',
            },
            syncing && { opacity: 0.7 },
          ]}
        >
          <Text style={{ color: colors.textInverse, fontWeight: '700' }}>
            {syncing
              ? `BAIXANDO... ${progress?.percent ?? 0}%`
              : hasExercises
                ? 'ATUALIZAR EXERCÍCIOS'
                : 'BAIXAR EXERCÍCIOS'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  monthLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
    marginBottom: 10,
  },
});
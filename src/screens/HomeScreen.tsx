import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useAppStore } from '../store/useAppStore';
import { useWorkouts } from '../features/workouts/hooks';
import { MainTabParamList } from '../navigation/RootNavigator';
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

export function HomeScreen({ navigation }: Props) {
  const lastSyncAt = useAppStore((state) => state.lastSyncAt);
  const { data: workouts = [] } = useWorkouts();
  const scrollRef = useRef<ScrollView>(null);

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

      <View style={{ backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.borderCard, padding: 14, gap: 6 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '700' }}>Status offline-first</Text>
        <Text style={{ color: colors.textMuted }}>Última sincronização:</Text>
        <Text style={{ color: '#e7edf5' }}>{lastSyncAt ?? 'nunca'}</Text>
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
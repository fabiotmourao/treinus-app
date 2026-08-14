import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../theme/darkColors';

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

type WeekCalendarProps = {
  days: Date[];
  performedDates: Set<string>;
  today: string;
};

function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}

export function WeekCalendar({ days, performedDates, today }: WeekCalendarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {days.map((date) => {
          const dateStr = formatDate(date);
          const isToday = dateStr === today;
          const hasWorkout = performedDates.has(dateStr);
          const dayName = DAY_NAMES[date.getDay()];
          const dayNumber = date.getDate();

          return (
            <View key={dateStr} style={styles.dayColumn}>
              <Text style={styles.dayName}>{dayName}</Text>
              <Pressable onPress={() => {}} style={styles.dayPressable}>
                <Text
                  style={[
                    styles.dayNumber,
                    isToday && styles.dayNumberToday,
                    hasWorkout && !isToday && styles.dayNumberWorkout,
                  ]}
                >
                  {dayNumber}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
    gap: 6,
  },
  dayName: {
    color: colors.textMuted,
    fontSize: 12,
  },
  dayPressable: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  dayNumber: {
    color: colors.textBody,
    fontSize: 15,
    fontWeight: '700',
  },
  dayNumberToday: {
    color: colors.primary,
  },
  dayNumberWorkout: {
    color: colors.primaryLight,
  },
});
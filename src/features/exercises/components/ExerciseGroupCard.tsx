import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { colors } from '../../../theme/darkColors';

type ExerciseGroupCardProps = {
  label: string;
  total: number;
  onPress: () => void;
};

export function ExerciseGroupCard({ label, total, onPress }: ExerciseGroupCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.total}>{total} exercícios</Text>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Ver exercícios</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    gap: 8,
    backgroundColor: colors.card,
    flex: 1,
    minHeight: 128,
  },
  label: {
    color: colors.textStrong,
    fontWeight: '700',
    fontSize: 17,
  },
  total: {
    color: colors.textMuted,
    fontSize: 13,
  },
  footer: {
    marginTop: 'auto',
  },
  footerText: {
    color: colors.primaryLight,
    fontWeight: '700',
    fontSize: 13,
  },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../theme/darkColors';

type MetricBoxProps = {
  label: string;
  value: string;
};

export function MetricBox({ label, value }: MetricBoxProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 2,
  },
  label: {
    color: colors.primaryLight,
    fontSize: 16,
    fontWeight: '700',
  },
  value: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/darkColors';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
};

export function ScreenHeader({ title, subtitle }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 2,
  },
  title: {
    color: colors.textStrong,
    fontWeight: '700',
    fontSize: 22,
  },
  subtitle: {
    color: '#92a2b2',
  },
});

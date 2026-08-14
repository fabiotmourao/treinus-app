import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme/darkColors';

type ButtonProps = {
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
};

export default function Button({
  children,
  onPress,
  disabled = false,
  variant = 'primary',
  style = {},
}: ButtonProps) {
  const backgroundColor =
    variant === 'primary'
      ? disabled
        ? colors.primaryDark
        : colors.primary
      : variant === 'secondary'
      ? colors.cardPressed
      : 'transparent';

  const textColor =
    variant === 'primary' ? colors.textInverse : variant === 'secondary' ? colors.textPrimary : colors.primaryLight;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: colors.primary,
          opacity: pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: textColor }]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    fontSize: 15,
  },
});
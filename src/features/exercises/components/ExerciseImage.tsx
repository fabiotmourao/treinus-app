import React from 'react';
import { Image, ImageStyle, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../../../theme/darkColors';

type ExerciseImageProps = {
  gifUrl: string | null;
  size?: number;
  borderRadius?: number;
  style?: ViewStyle | ImageStyle;
};

export function ExerciseImage({ gifUrl, size = 72, borderRadius = 8, style }: ExerciseImageProps) {
  if (!gifUrl) {
    return (
      <View
        style={[
          styles.placeholder,
          { width: size, height: size, borderRadius },
          style as ViewStyle,
        ]}
      />
    );
  }

  return (
    <Image
      source={{ uri: gifUrl }}
      style={[
        styles.image,
        { width: size, height: size, borderRadius },
        style as ImageStyle,
      ]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.imagePlaceholder,
  },
  placeholder: {
    backgroundColor: colors.imagePlaceholder,
  },
});

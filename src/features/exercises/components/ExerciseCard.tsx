import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/darkColors';
import { ExerciseImage } from './ExerciseImage';

type ExerciseCardProps = {
  item: {
    id: string;
    name: string;
    bodyPart: string;
    target: string;
    equipment: string;
    gifUrl: string | null;
    gifLocalPath?: string | null;
  };
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
  /** Quando definido, exibe o badge de seleção e o estilo de card selecionado. */
  selected?: boolean;
};

export function ExerciseCard({
  item,
  isFavorite,
  onPress,
  onToggleFavorite,
  selected = false,
}: ExerciseCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <View style={styles.imageWrap}>
        <ExerciseImage gifUrl={item.gifUrl} gifLocalPath={item.gifLocalPath} size={110} borderRadius={10} />
      </View>

      <Text style={styles.name} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.details} numberOfLines={1}>
        {item.bodyPart} • {item.equipment}
      </Text>

      <Pressable
        onPress={onToggleFavorite}
        hitSlop={8}
        style={styles.favoriteButton}
      >
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={20}
          color={isFavorite ? colors.favorite : colors.textMuted}
        />
      </Pressable>

      {selected ? (
        <View style={styles.selectedBadge}>
          <Ionicons name="checkmark" size={14} color={colors.textInverse} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 10,
    gap: 6,
    backgroundColor: colors.card,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryAlpha,
  },
  imageWrap: {
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.card,
    borderRadius: 999,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: {
    color: colors.textStrong,
    fontWeight: '700',
    fontSize: 14,
  },
  details: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../theme/darkColors';

type ExerciseListItemProps = {
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
};

export function ExerciseListItem({ item, isFavorite, onPress, onToggleFavorite }: ExerciseListItemProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.content}>
        {item.gifLocalPath || item.gifUrl ? (
          <Image
            source={{ uri: item.gifLocalPath ?? item.gifUrl ?? undefined }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}

        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.details}>
            {item.bodyPart} • {item.target} • {item.equipment}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={onToggleFavorite}
        style={[
          styles.favoriteButton,
          isFavorite && styles.favoriteButtonActive,
        ]}
      >
        <Text style={[styles.favoriteText, isFavorite && styles.favoriteTextActive]}>
          {isFavorite ? 'Remover dos favoritos' : 'Favoritar'}
        </Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    backgroundColor: colors.card,
  },
  content: {
    flexDirection: 'row',
    gap: 10,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: colors.imagePlaceholder,
  },
  imagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: colors.imagePlaceholder,
  },
  info: {
    flex: 1,
    gap: 6,
  },
  name: {
    fontWeight: '700',
    color: colors.textStrong,
    fontSize: 16,
  },
  details: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  favoriteButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderSecondary,
    backgroundColor: 'transparent',
  },
  favoriteButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryAlpha,
  },
  favoriteText: {
    color: colors.textBody,
    fontWeight: '600',
    fontSize: 13,
  },
  favoriteTextActive: {
    color: colors.primaryLight,
  },
});

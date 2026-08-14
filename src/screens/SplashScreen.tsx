import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { exercisesFeatureRepository } from '../features/exercises/repository';
import { colors } from '../theme/darkColors';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    const total = exercisesFeatureRepository.count();
    if (total > 0) {
      navigation.replace('Main');
      return;
    }

    navigation.replace('Sync');
  }, [navigation]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: '700' }}>Treinos.proswap</Text>
    </View>
  );
}

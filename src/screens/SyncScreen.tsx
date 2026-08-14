import React, { useState } from 'react';
import { View, Text, Alert, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAppStore } from '../store/useAppStore';
import { SyncService } from '../services/sync/SyncService';
import { exercisesFeatureRepository } from '../features/exercises/repository';
import { colors } from '../theme/darkColors';
import { PrimaryButton } from '../components/PrimaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Sync'>;

export function SyncScreen({ navigation }: Props) {
  const setLastSyncAt = useAppStore((state) => state.setLastSyncAt);
  const [loading, setLoading] = useState(false);
  const totalLocal = exercisesFeatureRepository.count();

  const handleSync = async () => {
    try {
      setLoading(true);
      const result = await SyncService.syncExercises();

      if (result.totalSaved === 0) {
        Alert.alert(
          'Sincronização sem dados',
          'A API respondeu, mas nenhum exercício válido foi salvo. Tente novamente em alguns instantes.'
        );
      }

      setLastSyncAt(result.syncedAt);
      Alert.alert('Sincronização concluída', `${result.totalSaved} exercícios salvos localmente.`);
      navigation.replace('Main');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Falha ao sincronizar dados.';
      Alert.alert('Erro na sincronização', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16, justifyContent: 'center' }}>
      <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.borderCard, gap: 14 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: '700' }}>Primeira sincronização</Text>
        <Text style={{ color: colors.textMuted, lineHeight: 20 }}>
          Baixe os exercícios uma vez para usar o app no modo offline.
        </Text>

        <Text style={{ color: colors.textSubtle }}>Exercícios locais atuais: {totalLocal}</Text>

        {totalLocal > 0 ? (
          <Pressable
            onPress={() => navigation.replace('Main')}
            style={{
              borderRadius: 12,
              backgroundColor: colors.cardPressed,
              paddingVertical: 12,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: '#dbe4ef', fontWeight: '700' }}>ENTRAR NO APP</Text>
          </Pressable>
        ) : null}

        <PrimaryButton
          label={loading ? 'SINCRONIZANDO...' : 'SINCRONIZAR AGORA'}
          onPress={handleSync}
          disabled={loading}
          style={{ borderRadius: 12, paddingVertical: 14 }}
        />
      </View>
    </View>
  );
}

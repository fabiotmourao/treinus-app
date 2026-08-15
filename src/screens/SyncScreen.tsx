import React, { useState } from 'react';
import { View, Text, Alert, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAppStore } from '../store/useAppStore';
import { SyncService, SyncProgress } from '../services/sync/SyncService';
import { exercisesFeatureRepository } from '../features/exercises/repository';
import { colors } from '../theme/darkColors';
import { PrimaryButton } from '../components/PrimaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Sync'>;

export function SyncScreen({ navigation }: Props) {
  const setLastSyncAt = useAppStore((state) => state.setLastSyncAt);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const totalLocal = exercisesFeatureRepository.count();

  const handleSync = async () => {
    try {
      setLoading(true);
      setProgress({ received: 0, total: null, percent: 0 });
      const result = await SyncService.syncExercises(setProgress);

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

  const progressLabel = progress?.phase === 'images'
    ? `Imagens ${progress.received} de ${progress.total ?? '?'}`
    : progress?.total
      ? `${progress.received} de ${progress.total}`
      : progress
        ? `${progress.received} exercícios`
        : '';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16, justifyContent: 'center' }}>
      <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.borderCard, gap: 14 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: '700' }}>Primeira sincronização</Text>
        <Text style={{ color: colors.textMuted, lineHeight: 20 }}>
          Baixe os exercícios uma vez para usar o app no modo offline.
        </Text>

        <Text style={{ color: colors.textSubtle }}>Exercícios locais atuais: {totalLocal}</Text>

        {loading && progress?.phase === 'images' ? (
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>
            Baixando imagens dos exercícios para uso offline...
          </Text>
        ) : null}

        {loading && progress ? (
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{progressLabel}</Text>
              <Text style={{ color: colors.primaryLight, fontWeight: '700', fontSize: 12 }}>{progress.percent}%</Text>
            </View>
            <View
              style={{
                height: 8,
                borderRadius: 4,
                backgroundColor: colors.cardPressed,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: `${progress.percent}%`,
                  backgroundColor: colors.primary,
                  borderRadius: 4,
                }}
              />
            </View>
          </View>
        ) : null}

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
          label={
            loading
              ? progress?.phase === 'images'
                ? `BAIXANDO IMAGENS... ${progress?.percent ?? 0}%`
                : `SINCRONIZANDO... ${progress?.percent ?? 0}%`
              : 'SINCRONIZAR AGORA'
          }
          onPress={handleSync}
          disabled={loading}
          style={{ borderRadius: 12, paddingVertical: 14 }}
        />
      </View>
    </View>
  );
}

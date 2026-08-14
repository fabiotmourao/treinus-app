import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../theme/darkColors';

export function ProfileScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16, gap: 14 }}>
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.borderCard,
          padding: 14,
          gap: 8,
        }}
      >
        <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '700' }}>Seu perfil</Text>
        <Text style={{ color: '#a7b2c0' }}>Nome: Usuário</Text>
        <Text style={{ color: '#a7b2c0' }}>E-mail: —</Text>
      </View>

      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.borderCard,
          padding: 14,
          gap: 8,
        }}
      >
        <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '700' }}>Próximas evoluções</Text>
        <Text style={{ color: '#a7b2c0' }}>• Avatar e dados físicos (peso, altura, meta)</Text>
        <Text style={{ color: '#a7b2c0' }}>• Histórico de medidas e progresso</Text>
        <Text style={{ color: '#a7b2c0' }}>• Configurações de conta e privacidade</Text>
      </View>
    </View>
  );
}
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { theme } from '../theme';
import { validateMachineHoursWithGemini } from '../services/gemini';
import { MachineCounter } from '../models/MachineCounter';

// Örnek bir makine ve sayacı başlangıcı
const SAMPLE_MACHINE_ID = 'MCH-1001';
const mockCounter = new MachineCounter('CNT-001', SAMPLE_MACHINE_ID, 12000);

export const MainScreen: React.FC = () => {
  const [hoursInput, setHoursInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | undefined>(undefined);
  const [successText, setSuccessText] = useState<string | undefined>(undefined);
  const [currentHours, setCurrentHours] = useState<number>(mockCounter.currentHours);

  const handleValidate = async () => {
    const newHours = parseFloat(hoursInput);
    if (isNaN(newHours)) {
      setErrorText('Lütfen geçerli bir sayı giriniz.');
      setSuccessText(undefined);
      return;
    }

    if (newHours <= currentHours) {
      setErrorText(`Hata: Yeni saat (${newHours}), mevcut saatten (${currentHours}) büyük olmalıdır.`);
      setSuccessText(undefined);
      return;
    }

    setIsLoading(true);
    setErrorText(undefined);
    setSuccessText(undefined);

    const result = await validateMachineHoursWithGemini(SAMPLE_MACHINE_ID, currentHours, newHours);
    
    setIsLoading(false);

    if (result.isValid) {
      setSuccessText(result.message);
      setCurrentHours(newHours);
      mockCounter.updateHours(newHours);
      setHoursInput(''); // Inputu temizle
    } else {
      setErrorText(result.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.header}>
            <Text style={styles.title}>Makine Bakım Takibi</Text>
            <Text style={styles.subtitle}>Sayaç Güncelleme</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Makine ID:</Text>
              <Text style={styles.value}>{SAMPLE_MACHINE_ID}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Mevcut Çalışma Saati:</Text>
              <Text style={styles.value}>{currentHours} saat</Text>
            </View>
          </View>

          <View style={styles.formContext}>
            <Input
              label="Yeni Makine Saati"
              placeholder="Örn: 12050"
              keyboardType="numeric"
              value={hoursInput}
              onChangeText={setHoursInput}
              error={errorText}
              success={!!successText}
            />
            {successText && (
              <View style={styles.successContainer}>
                <Text style={styles.successMessage}>{successText}</Text>
              </View>
            )}

            <Button
              title="Doğrula ve Kaydet"
              onPress={handleValidate}
              isLoading={isLoading}
              style={styles.submitButton}
            />
          </View>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.m,
  },
  header: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.l,
    alignItems: 'center',
  },
  title: {
    ...theme.typography.header,
    color: theme.colors.primaryDark,
  },
  subtitle: {
    ...theme.typography.caption,
    marginTop: theme.spacing.xs,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.medium,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
  },
  label: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  value: {
    ...theme.typography.body,
    fontWeight: '700',
  },
  formContext: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius,
    padding: theme.spacing.m,
    ...theme.shadows.subtle,
  },
  submitButton: {
    marginTop: theme.spacing.l,
  },
  successContainer: {
    backgroundColor: '#E8F5E9',
    padding: theme.spacing.s,
    borderRadius: theme.borderRadius,
    marginTop: theme.spacing.s,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  successMessage: {
    ...theme.typography.body,
    color: theme.colors.success,
    fontWeight: '500',
  },
});

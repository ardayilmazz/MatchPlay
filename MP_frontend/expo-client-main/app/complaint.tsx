import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { complaintService } from '@/services/complaintService';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/Button';

export default function ComplaintScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { reportedId, reportedName, gameId } = useLocalSearchParams<{
    reportedId: string;
    reportedName: string;
    gameId: string;
  }>();

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert('Hata', 'Lütfen şikayet mesajınızı yazın');
      return;
    }

    if (!user?.token || !reportedId || !gameId) {
      Alert.alert('Hata', 'Eksik bilgi');
      return;
    }

    setLoading(true);
    try {
      await complaintService.createComplaint(gameId, reportedId, message.trim(), user.token);
      Alert.alert('Başarılı', 'Şikayetiniz gönderildi', [
        {
          text: 'Tamam',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Şikayet gönderilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Şikayet Et</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>Şikayet edilecek kişi:</Text>
          <Text style={styles.reportedName}>{reportedName || 'Kullanıcı'}</Text>

          <Text style={styles.label}>Şikayet Mesajı</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Şikayet nedeninizi yazın..."
            placeholderTextColor={colors.text.tertiary}
            multiline
            numberOfLines={8}
            value={message}
            onChangeText={setMessage}
            maxLength={1000}
          />
          <Text style={styles.charCount}>{message.length}/1000</Text>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="İptal"
            onPress={() => router.back()}
            variant="secondary"
            style={styles.cancelButton}
            disabled={loading}
          />
          <Button
            title="Gönder"
            onPress={handleSubmit}
            variant="primary"
            loading={loading}
            disabled={loading || !message.trim()}
            style={styles.submitButton}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  backButton: {
    padding: spacing.xs,
    minWidth: 40,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  reportedName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  messageInput: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    minHeight: 200,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  charCount: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});

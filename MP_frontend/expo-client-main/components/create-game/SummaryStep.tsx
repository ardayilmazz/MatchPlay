import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { GameSkillLevel } from '@/types';
import { gameSkillLevels } from '@/services/mockData';
import { gameService } from '@/services/gameService';
import Button from '@/components/Button';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dribbble,
  MapPin,
  Calendar,
  Clock,
  Users,
  Target,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react-native';

interface SummaryStepProps {
  formData: {
    sportId: string;
    sportName: string;
    cityId: string;
    cityName: string;
    districtId: string;
    districtName: string;
    venueId: string;
    venueName: string;
    venueAddress: string;
    startDate: Date | null;
    endDate: Date | null;
    totalPlayers: number;
    skillLevel: GameSkillLevel;
    description: string;
  };
  onBack: () => void;
}

export default function SummaryStep({ formData, onBack }: SummaryStepProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '-';
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSkillLevelLabel = (level: GameSkillLevel) => {
    return gameSkillLevels.find((l) => l.value === level)?.label || level;
  };

  const handleCreate = async () => {
    if (!formData.startDate || !formData.endDate) {
      setErrorMessage('Lütfen tüm zorunlu alanları doldurun.');
      setShowErrorModal(true);
      return;
    }

    if (!user) {
      setErrorMessage('Oyun oluşturmak için giriş yapmalısınız.');
      setShowErrorModal(true);
      return;
    }

    setIsCreating(true);

    try {
      const newGame = await gameService.createGame({
        creatorId: user.id,
        sportId: formData.sportId,
        sportName: formData.sportName,
        cityId: formData.cityId,
        cityName: formData.cityName,
        districtId: formData.districtId,
        districtName: formData.districtName,
        venueId: formData.venueId,
        venueName: formData.venueName,
        venueAddress: formData.venueAddress,
        startTime: formData.startDate.toISOString(),
        endTime: formData.endDate.toISOString(),
        totalPlayers: formData.totalPlayers,
        skillLevel: formData.skillLevel,
        description: formData.description,
      });

      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage('Oyun oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
      setShowErrorModal(true);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.push('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Oyun Özeti</Text>
      <Text style={styles.subtitle}>Bilgileri kontrol edin ve onaylayın</Text>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Dribbble size={20} color={colors.primary[500]} />
            <Text style={styles.cardTitle}>Oyun Tipi</Text>
          </View>
          <Text style={styles.cardValue}>{formData.sportName}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MapPin size={20} color={colors.primary[500]} />
            <Text style={styles.cardTitle}>Konum</Text>
          </View>
          <Text style={styles.cardValue}>{formData.venueName}</Text>
          <Text style={styles.cardSubvalue}>
            {formData.venueAddress}, {formData.districtName}, {formData.cityName}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Calendar size={20} color={colors.primary[500]} />
            <Text style={styles.cardTitle}>Tarih</Text>
          </View>
          <Text style={styles.cardValue}>{formatDate(formData.startDate)}</Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.card, styles.halfCard]}>
            <View style={styles.cardHeader}>
              <Clock size={20} color={colors.primary[500]} />
              <Text style={styles.cardTitle}>Başlangıç</Text>
            </View>
            <Text style={styles.cardValue}>{formatTime(formData.startDate)}</Text>
          </View>

          <View style={[styles.card, styles.halfCard]}>
            <View style={styles.cardHeader}>
              <Clock size={20} color={colors.primary[500]} />
              <Text style={styles.cardTitle}>Bitiş</Text>
            </View>
            <Text style={styles.cardValue}>{formatTime(formData.endDate)}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.card, styles.halfCard]}>
            <View style={styles.cardHeader}>
              <Users size={20} color={colors.primary[500]} />
              <Text style={styles.cardTitle}>Oyuncu</Text>
            </View>
            <Text style={styles.cardValue}>{formData.totalPlayers}</Text>
          </View>

          <View style={[styles.card, styles.halfCard]}>
            <View style={styles.cardHeader}>
              <Target size={20} color={colors.primary[500]} />
              <Text style={styles.cardTitle}>Seviye</Text>
            </View>
            <Text style={styles.cardValue}>{getSkillLevelLabel(formData.skillLevel)}</Text>
          </View>
        </View>

        {formData.description && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <FileText size={20} color={colors.primary[500]} />
              <Text style={styles.cardTitle}>Açıklama</Text>
            </View>
            <Text style={styles.descriptionText}>{formData.description}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <Button title="Geri" onPress={onBack} variant="outline" style={styles.backButton} />
          <Button
            title="Oyunu Oluştur"
            onPress={handleCreate}
            loading={isCreating}
            style={styles.createButton}
          />
        </View>
      </ScrollView>

      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} />
          <View style={styles.modalContent}>
            <View style={styles.successIcon}>
              <CheckCircle size={48} color={colors.success[500]} />
            </View>
            <Text style={styles.modalTitle}>Başarılı!</Text>
            <Text style={styles.modalMessage}>
              Oyununuz başarıyla oluşturuldu. Diğer oyuncular artık oyununuzu görebilir ve katılım
              isteği gönderebilir.
            </Text>
            <Button title="Tamam" onPress={handleSuccessClose} style={styles.modalButton} />
          </View>
        </View>
      </Modal>

      <Modal visible={showErrorModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowErrorModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.errorIcon}>
              <AlertCircle size={48} color={colors.error[500]} />
            </View>
            <Text style={styles.modalTitle}>Hata</Text>
            <Text style={styles.modalMessage}>{errorMessage}</Text>
            <Button
              title="Tamam"
              onPress={() => setShowErrorModal(false)}
              variant="outline"
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },
  cardValue: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.primary,
  },
  cardSubvalue: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfCard: {
    flex: 1,
  },
  descriptionText: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    lineHeight: typography.sizes.md * typography.lineHeights.relaxed,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  backButton: {
    flex: 1,
  },
  createButton: {
    flex: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successIcon: {
    marginBottom: spacing.lg,
  },
  errorIcon: {
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButton: {
    width: '100%',
  },
});

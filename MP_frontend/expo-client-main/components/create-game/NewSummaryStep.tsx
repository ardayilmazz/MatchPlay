import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borderRadius } from '@/constants/theme';
import Button from '@/components/Button';
import { GameSessionDraft } from '@/services/gameService';
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Target,
  UserCheck,
  DollarSign,
  Clock,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { generateGameTitle } from '@/utils/gameTitle';

// Süre formatlama fonksiyonu
const formatDuration = (minutes: number): string => {
  // 60'dan küçükse veya 60'ın katı değilse dakika olarak göster
  if (minutes < 60 || minutes % 60 !== 0) {
    return `${minutes} dk`;
  }
  
  // 60'ın katı ve 60 veya daha büyükse saat formatında göster
  const hours = minutes / 60;
  if (hours === 1) {
    return '1 saat';
  } else if (hours % 1 === 0) {
    return `${hours} saat`;
  } else {
    return `${hours} saat`;
  }
};

interface NewSummaryStepProps {
  draft: GameSessionDraft;
  onBack: () => void;
  onPublish: () => void;
  isPublishing: boolean;
}

export default function NewSummaryStep({
  draft,
  onBack,
  onPublish,
  isPublishing,
}: NewSummaryStepProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const handlePublish = () => {
    Alert.alert(
      'Oyunu Yayınla',
      'Oyununuz yayınlandıktan sonra diğer kullanıcılar görebilir ve katılım isteği gönderebilir. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Yayınla', onPress: onPublish, style: 'default' },
      ]
    );
  };

  const formatDate = (date?: Date) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSkillLevelLabel = (level?: string) => {
    const labels: Record<string, string> = {
      ilk_defa: 'İlk Defa Oynayacaklar',
      az_bilenler: 'Az Çok Bilenler',
      orta: 'Ortalama Oyuncular',
      iyi: 'İyi Oyuncular',
      profesyonel: 'Profesyonel Oyuncular',
    };
    return labels[level || ''] || '-';
  };

  const getGenderLabel = (gender?: string) => {
    const labels: Record<string, string> = {
      herkes: 'Herkes Katılabilir',
      kizlar: 'Sadece Kızlar',
      erkekler: 'Sadece Erkekler',
      karma_dengeli: 'Karma (Dengeli)',
    };
    return labels[gender || 'herkes'] || 'Herkes Katılabilir';
  };

  const getFeeLabel = (feeAmount?: number) => {
    if (!feeAmount || feeAmount === 0) return 'Ücretsiz';
    return `${feeAmount} TL (Kişi başı)`;
  };

  // Otomatik başlık oluştur
  const getDisplayTitle = () => {
    if (draft.title) return draft.title;
    
    // Eğer başlık yoksa ve gerekli bilgiler varsa otomatik oluştur
    if (draft.gameType && draft.districtName && draft.startDate) {
      return generateGameTitle(
        draft.gameType.name,
        draft.districtName,
        new Date(draft.startDate)
      );
    }
    
    return '-';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Son kontrol</Text>
      <Text style={styles.subtitle}>Oyununuzu gözden geçirin ve yayınlayın</Text>

      <View style={styles.form}>
        {/* Oyun Bilgisi */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Trophy size={20} color={colors.primary[500]} />
            <Text style={styles.cardTitle}>Oyun Bilgisi</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.row}>
              <Text style={styles.label}>Oyun:</Text>
              <Text style={styles.value}>{draft.gameType?.name || '-'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Başlık:</Text>
              <Text style={styles.value}>{getDisplayTitle()}</Text>
            </View>
            {draft.description && (
              <View style={styles.row}>
                <Text style={styles.label}>Açıklama:</Text>
                <Text style={styles.value}>{draft.description}</Text>
              </View>
            )}
            {draft.tags && draft.tags.length > 0 && (
              <View style={styles.row}>
                <Text style={styles.label}>Etiketler:</Text>
                <Text style={styles.value}>{draft.tags.join(', ')}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Konum ve Zaman */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MapPin size={20} color={colors.primary[500]} />
            <Text style={styles.cardTitle}>Konum ve Zaman</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.row}>
              <Text style={styles.label}>Şehir:</Text>
              <Text style={styles.value}>{draft.cityName || '-'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>İlçe:</Text>
              <Text style={styles.value}>{draft.districtName || '-'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Mekan:</Text>
              <Text style={styles.value}>{draft.venueName || '-'}</Text>
            </View>
            {draft.venueAddress && (
              <View style={styles.row}>
                <Text style={styles.label}>Adres:</Text>
                <Text style={styles.value}>{draft.venueAddress}</Text>
              </View>
            )}
            <View style={styles.row}>
              <Calendar size={16} color={colors.text.secondary} />
              <Text style={styles.value}>{formatDate(draft.startDate)}</Text>
            </View>
            <View style={styles.row}>
              <Clock size={16} color={colors.text.secondary} />
              <Text style={styles.value}>{formatDuration(draft.estimatedDuration || 60)}</Text>
            </View>
            <View style={styles.row}>
              <DollarSign size={16} color={colors.text.secondary} />
              <Text style={styles.value}>{getFeeLabel(draft.feeAmount)}</Text>
            </View>
          </View>
        </View>

        {/* Ekip */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Users size={20} color={colors.primary[500]} />
            <Text style={styles.cardTitle}>Ekip</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.row}>
              <Text style={styles.label}>Toplam Oyuncu:</Text>
              <Text style={styles.value}>{draft.totalPlayers || '-'} kişi</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Gerekli Oyuncu:</Text>
              <Text style={styles.value}>{draft.neededPlayers || '-'} kişi</Text>
            </View>
            {draft.teamCount && (
              <View style={styles.row}>
                <Text style={styles.label}>Takım Sayısı:</Text>
                <Text style={styles.value}>{draft.teamCount} takım</Text>
              </View>
            )}
            <View style={styles.row}>
              <Target size={16} color={colors.text.secondary} />
              <Text style={styles.value}>{getSkillLevelLabel(draft.skillLevel)}</Text>
            </View>
            {draft.gameType?.requiresEquipment && (
              <View style={styles.row}>
                <Text style={styles.label}>Ekipman:</Text>
                <Text style={styles.value}>{draft.hasEquipment ? 'Var' : 'Yok'}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Oyuncu Kriterleri */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <UserCheck size={20} color={colors.primary[500]} />
            <Text style={styles.cardTitle}>Oyuncu Kriterleri</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.row}>
              <Text style={styles.label}>Cinsiyet:</Text>
              <Text style={styles.value}>{getGenderLabel(draft.genderPreference)}</Text>
            </View>
          </View>
        </View>

        {/* Butonlar */}
        <View style={styles.actions}>
          <Button
            title="Geri Dön"
            variant="outline"
            onPress={onBack}
            style={styles.backButton}
            disabled={isPublishing}
          />
          <Button
            title={isPublishing ? 'Yayınlanıyor...' : 'Yayınla'}
            onPress={handlePublish}
            style={styles.publishButton}
            disabled={isPublishing}
          />
        </View>
      </View>
    </ScrollView>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
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
  form: {
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.primary,
  },
  cardContent: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  label: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.secondary,
  },
  value: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  backButton: {
    flex: 1,
  },
  publishButton: {
    flex: 2,
  },
  });
}


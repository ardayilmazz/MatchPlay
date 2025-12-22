import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ChevronLeft,
  Save,
  X,
} from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { gameService } from '@/services/gameService';
import { useAuth } from '@/contexts/AuthContext';

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  
  // Düzenleme state'leri
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editNeededPlayers, setEditNeededPlayers] = useState('');

  useEffect(() => {
    loadGameDetails();
  }, [id]);

  const loadGameDetails = async () => {
    try {
      if (!id || typeof id !== 'string') return;
      const gameData = await gameService.fetchGameSession(id);
      setGame(gameData);
      setEditTitle(gameData.title || '');
      setEditDescription(gameData.description || '');
      setEditNeededPlayers(String(gameData.neededPlayers || 1));
    } catch (error) {
      console.error('Oyun detayı yüklenirken hata:', error);
      Alert.alert('Hata', 'Oyun detayı yüklenemedi');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!user?.token || !id || typeof id !== 'string') return;

      const updateData = {
        title: editTitle,
        description: editDescription,
        neededPlayers: parseInt(editNeededPlayers, 10),
      };

      await gameService.updateGameSession(id, updateData, user.token);
      await loadGameDetails();
      setEditing(false);
      Alert.alert('Başarılı', 'Oyun güncellendi');
    } catch (error) {
      console.error('Oyun güncellenirken hata:', error);
      Alert.alert('Hata', 'Oyun güncellenemedi');
    }
  };

  const handleCancel = () => {
    setEditTitle(game.title || '');
    setEditDescription(game.description || '');
    setEditNeededPlayers(String(game.neededPlayers || 1));
    setEditing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}.${month}.${year} - ${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  if (!game) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Oyun bulunamadı</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: editing ? 'Oyunu Düzenle' : 'Oyun Detayı',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color={colors.text.primary} />
            </TouchableOpacity>
          ),
          headerRight: () =>
            !editing ? (
              <TouchableOpacity onPress={() => setEditing(true)} style={styles.editButton}>
                <Text style={styles.editButtonText}>Düzenle</Text>
              </TouchableOpacity>
            ) : null,
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Başlık */}
          <View style={styles.section}>
            <Text style={styles.label}>Başlık</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Oyun başlığı"
                maxLength={40}
              />
            ) : (
              <Text style={styles.value}>{game.title}</Text>
            )}
          </View>

          {/* Oyun Tipi */}
          <View style={styles.section}>
            <Text style={styles.label}>Oyun</Text>
            <Text style={styles.value}>{game.gameType?.name || 'Belirtilmemiş'}</Text>
          </View>

          {/* Açıklama */}
          <View style={styles.section}>
            <Text style={styles.label}>Açıklama</Text>
            {editing ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="Oyun açıklaması"
                multiline
                numberOfLines={4}
                maxLength={200}
              />
            ) : (
              <Text style={styles.value}>{game.description || 'Açıklama yok'}</Text>
            )}
          </View>

          {/* Tarih ve Saat */}
          <View style={styles.section}>
            <View style={styles.iconLabel}>
              <Calendar size={20} color={colors.primary[500]} />
              <Text style={styles.label}>Tarih ve Saat</Text>
            </View>
            <Text style={styles.value}>{formatDate(game.startDate)}</Text>
          </View>

          {/* Süre */}
          {game.duration && (
            <View style={styles.section}>
              <View style={styles.iconLabel}>
                <Clock size={20} color={colors.primary[500]} />
                <Text style={styles.label}>Süre</Text>
              </View>
              <Text style={styles.value}>{game.duration} dakika</Text>
            </View>
          )}

          {/* Toplam Oyuncu Sayısı */}
          <View style={styles.section}>
            <View style={styles.iconLabel}>
              <Users size={20} color={colors.primary[500]} />
              <Text style={styles.label}>Toplam Oyuncu Sayısı</Text>
            </View>
            <Text style={styles.value}>
              {game.currentPlayers?.length || 1} / {game.totalPlayers} kişi
            </Text>
          </View>

          {/* İhtiyaç Duyulan Oyuncu Sayısı */}
          <View style={styles.section}>
            <View style={styles.iconLabel}>
              <Users size={20} color={colors.primary[500]} />
              <Text style={styles.label}>İhtiyaç Duyulan Oyuncu Sayısı</Text>
            </View>
            {editing ? (
              <TextInput
                style={styles.input}
                value={editNeededPlayers}
                onChangeText={setEditNeededPlayers}
                placeholder="İhtiyaç duyulan oyuncu"
                keyboardType="number-pad"
              />
            ) : (
              <Text style={styles.value}>
                {game.neededPlayers || 0} kişi
              </Text>
            )}
          </View>

          {/* Konum */}
          {(game.cityName || game.venueName) && (
            <View style={styles.section}>
              <View style={styles.iconLabel}>
                <MapPin size={20} color={colors.primary[500]} />
                <Text style={styles.label}>Konum</Text>
              </View>
              <Text style={styles.value}>
                {game.venueName || game.districtName || game.cityName}
              </Text>
              {game.venueAddress && (
                <Text style={styles.subValue}>{game.venueAddress}</Text>
              )}
            </View>
          )}

          {/* Yetenek Seviyesi */}
          {game.skillLevel && (
            <View style={styles.section}>
              <Text style={styles.label}>Yetenek Seviyesi</Text>
              <Text style={styles.value}>
                {game.skillLevel === 'beginner' && 'İlk defa oynayacaklar'}
                {game.skillLevel === 'intermediate' && 'Ortalama oyuncular'}
                {game.skillLevel === 'advanced' && 'İyi oyuncular'}
                {game.skillLevel === 'expert' && 'Profesyonel oyuncular'}
              </Text>
            </View>
          )}

          {/* Ücret */}
          {game.hasFee && game.feeAmount && (
            <View style={styles.feeCard}>
              <Text style={styles.feeLabel}>Oyun Ücreti</Text>
              <Text style={styles.feeValue}>{game.feeAmount} TL (Kişi başı)</Text>
            </View>
          )}

          {/* Düzenleme Butonları */}
          {editing && (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancel}
              >
                <X size={20} color={colors.text.primary} />
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Save size={20} color={colors.neutral[0]} />
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  backButton: {
    padding: spacing.sm,
  },
  editButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  editButtonText: {
    fontSize: typography.sizes.md,
    color: colors.primary[500],
    fontWeight: typography.weights.semibold,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  iconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
  subValue: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  input: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  feeCard: {
    backgroundColor: colors.success[50],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  feeLabel: {
    fontSize: typography.sizes.sm,
    color: colors.success[700],
    fontWeight: typography.weights.medium,
    marginBottom: spacing.xs,
  },
  feeValue: {
    fontSize: typography.sizes.lg,
    color: colors.success[700],
    fontWeight: typography.weights.bold,
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  cancelButton: {
    backgroundColor: colors.neutral[100],
  },
  cancelButtonText: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
  },
  saveButton: {
    backgroundColor: colors.primary[500],
  },
  saveButtonText: {
    fontSize: typography.sizes.md,
    color: colors.neutral[0],
    fontWeight: typography.weights.semibold,
  },
  errorText: {
    fontSize: typography.sizes.lg,
    color: colors.text.secondary,
  },
});


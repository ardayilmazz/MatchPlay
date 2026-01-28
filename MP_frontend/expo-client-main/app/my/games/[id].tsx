import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Edit2,
  Save,
  X,
} from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { gameService, GameType } from '@/services/gameService';
import { useAuth } from '@/contexts/AuthContext';
import { homeCacheService } from '@/utils/homeCache';

// Modal'ları import et
import GameSelectionModal from '@/components/create-game/modals/GameSelectionModal';
import LocationTimeModal from '@/components/create-game/modals/LocationTimeModal';
import TeamPlayersModal from '@/components/create-game/modals/TeamPlayersModal';
import SkillLevelModal from '@/components/create-game/modals/SkillLevelModal';
import GenderPreferenceModal from '@/components/create-game/modals/GenderPreferenceModal';
import SimpleTextModal from '@/components/create-game/modals/SimpleTextModal';

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [originalGame, setOriginalGame] = useState<any>(null);
  const [editedGame, setEditedGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Modal görünürlük state'leri
  const [showGameModal, setShowGameModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showPlayersModal, setShowPlayersModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);

  // Oyun tipleri
  const [gameTypes, setGameTypes] = useState<GameType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loadingGameTypes, setLoadingGameTypes] = useState(false);

  useEffect(() => {
    loadGameDetails();
    loadGameTypes();
  }, [id]);

  const loadGameTypes = async () => {
    try {
      setLoadingGameTypes(true);
      const types = await gameService.fetchGameTypes();
      setGameTypes(types);
    } catch (error) {
      console.error('Oyun tipleri yüklenirken hata:', error);
    } finally {
      setLoadingGameTypes(false);
    }
  };

  const loadGameDetails = async () => {
    try {
      if (!id || typeof id !== 'string') return;
      const gameData = await gameService.fetchGameSession(id);
      setOriginalGame(gameData);
      setEditedGame({ ...gameData }); // Kopyasını oluştur
    } catch (error) {
      console.error('Oyun detayı yüklenirken hata:', error);
      Alert.alert('Hata', 'Oyun detayı yüklenemedi');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // Değişiklik olup olmadığını kontrol et
  const hasChanges = () => {
    if (!originalGame || !editedGame) return false;
    return JSON.stringify(originalGame) !== JSON.stringify(editedGame);
  };

  // Local state'i güncelle (API çağrısı YOK)
  const updateLocalGame = (updates: any) => {
    setEditedGame((prev: any) => ({ ...prev, ...updates }));
  };

  // Oyun tipi seçimi
  const handleGameTypeUpdate = (gameType: GameType) => {
    updateLocalGame({ 
      gameTypeId: gameType._id,
      gameType: gameType,
    });
    setShowGameModal(false);
    setSelectedCategory(null);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  // Konum güncelleme
  const handleLocationUpdate = (data: any) => {
    updateLocalGame({
      cityId: data.cityId,
      cityName: data.cityName,
      districtId: data.districtId,
      districtName: data.districtName,
      venueId: data.venueId,
      venueName: data.venueName,
      venueAddress: data.venueAddress,
    });
    setShowLocationModal(false);
  };

  // Ücret güncelleme
  const handleFeeUpdate = (data: any) => {
    const paymentType = data.hasFee && data.feeAmount ? 'alman_usulu' : 'ucretsiz';
    updateLocalGame({ paymentType });
    setShowFeeModal(false);
  };

  // Tarih güncelleme
  const handleDateUpdate = (data: any) => {
    updateLocalGame({ startDate: data.startDate.toISOString() });
    setShowDateModal(false);
  };

  // Süre güncelleme
  const handleDurationUpdate = (data: any) => {
    updateLocalGame({ estimatedDuration: data.duration });
    setShowDurationModal(false);
  };

  // Sadece başlık güncelleme
  const handleTitleUpdate = (value: string) => {
    updateLocalGame({ title: value });
    setShowTitleModal(false);
  };

  // Sadece açıklama güncelleme
  const handleDescriptionUpdate = (value: string) => {
    updateLocalGame({ description: value });
    setShowDescriptionModal(false);
  };

  // Oyuncu sayıları güncelleme
  const handlePlayersUpdate = (data: { totalPlayers: number; neededPlayers: number }) => {
    updateLocalGame({ 
      totalPlayers: data.totalPlayers, 
      neededPlayers: data.neededPlayers 
    });
    setShowPlayersModal(false);
  };

  // Yetenek seviyesi güncelleme
  const handleSkillUpdate = (skillLevel: string) => {
    updateLocalGame({ skillLevel });
    setShowSkillModal(false);
  };

  // Cinsiyet tercihi güncelleme
  const handleGenderUpdate = (genderPreference: string) => {
    updateLocalGame({ genderPreference });
    setShowGenderModal(false);
  };

  // İptal - orijinal verilere geri dön
  const handleCancel = () => {
    if (hasChanges()) {
      Alert.alert(
        'Değişiklikleri İptal Et',
        'Yaptığınız değişiklikler kaybolacak. Emin misiniz?',
        [
          { text: 'Hayır', style: 'cancel' },
          {
            text: 'Evet',
            style: 'destructive',
            onPress: () => {
              setEditedGame({ ...originalGame });
            },
          },
        ]
      );
    }
  };

  // Kaydet - TÜM değişiklikleri tek seferde gönder
  const handleSave = async () => {
    if (!hasChanges()) {
      Alert.alert('Bilgi', 'Değişiklik yapılmadı');
      return;
    }

    try {
      if (!user?.token || !id || typeof id !== 'string') return;

      setSaving(true);

      // Sadece değişen ve backend'e gönderilebilir alanları bul
      const changedFields: any = {};
      
      // İzin verilen alan listesi (backend'de güncellenebilenler)
      const allowedFields = [
        'gameTypeId',
        'title',
        'description',
        'tags',
        'cityId',
        'cityName',
        'districtId',
        'districtName',
        'venueId',
        'venueName',
        'venueAddress',
        'paymentType',
        'startDate',
        'estimatedDuration',
        'totalPlayers',
        'neededPlayers',
        'teamAssignment',
        'skillLevel',
        'hasEquipment',
        'genderPreference',
      ];

      // gameType değişmişse sadece gameTypeId'yi gönder
      const originalGameTypeId = originalGame.gameType?._id || originalGame.gameTypeId;
      const editedGameTypeId = editedGame.gameType?._id || editedGame.gameTypeId;
      
      if (originalGameTypeId !== editedGameTypeId && editedGameTypeId) {
        changedFields.gameTypeId = editedGameTypeId;
      }

      // Diğer değişen alanları kontrol et
      allowedFields.forEach(key => {
        if (key === 'gameTypeId') return; // Zaten yukarıda kontrol ettik
        
        const originalValue = originalGame[key];
        const editedValue = editedGame[key];
        
        // undefined, null ve boş string aynı kabul et
        const original = originalValue === undefined || originalValue === null ? '' : originalValue;
        const edited = editedValue === undefined || editedValue === null ? '' : editedValue;
        
        if (JSON.stringify(original) !== JSON.stringify(edited)) {
          changedFields[key] = editedValue;
        }
      });

      console.log('[GameEdit] Değişen alanlar:', JSON.stringify(changedFields, null, 2));

      if (Object.keys(changedFields).length === 0) {
        Alert.alert('Bilgi', 'Değişiklik yapılmadı');
        return;
      }

      console.log('[GameEdit] API isteği gönderiliyor...');
      // Tek API isteği ile TÜM değişiklikleri gönder
      const result = await gameService.updateGameSession(id, changedFields, user.token);
      console.log('[GameEdit] API yanıtı:', result);
      
      // Cache temizle
      await homeCacheService.clearCache();
      
      // Yeni verileri yükle
      await loadGameDetails();
      
      Alert.alert('Başarılı', 'Oyun güncellendi');
    } catch (error) {
      console.error('[GameEdit] Kaydetme hatası:', error);
      Alert.alert('Hata', 'Oyun güncellenemedi');
    } finally {
      setSaving(false);
    }
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

  const getSkillLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      beginner: 'İlk defa oynayacaklar',
      ilk_defa: 'İlk defa oynayacaklar',
      novice: 'Az çok bilenler',
      az_bilenler: 'Az çok bilenler',
      intermediate: 'Ortalama oyuncular',
      orta: 'Ortalama oyuncular',
      advanced: 'İyi oyuncular',
      iyi: 'İyi oyuncular',
      expert: 'Profesyonel oyuncular',
      profesyonel: 'Profesyonel oyuncular',
    };
    return labels[level] || level;
  };

  const getGenderLabel = (preference: string) => {
    const labels: Record<string, string> = {
      female_only: 'Sadece kızlar',
      male_only: 'Sadece erkekler',
      balanced: 'Karma (dengeli)',
      herkes: 'Herkes katılabilir',
    };
    return labels[preference] || preference;
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

  if (!editedGame) {
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
          title: 'Oyun Düzenle',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color={colors.text.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          
          {/* 1. Oyun */}
          <TouchableOpacity 
            style={styles.editableItem} 
            onPress={() => setShowGameModal(true)}
          >
            <View style={styles.itemLeft}>
              <Text style={styles.itemLabel}>Oyun</Text>
              <Text style={styles.itemValue}>
                {editedGame.gameType?.name || 'Belirtilmemiş'}
              </Text>
            </View>
            <Edit2 size={20} color={colors.primary[500]} />
          </TouchableOpacity>

          {/* 2. Konum */}
          <TouchableOpacity 
            style={styles.editableItem} 
            onPress={() => setShowLocationModal(true)}
          >
            <View style={styles.itemLeft}>
              <Text style={styles.itemLabel}>Konum</Text>
              <Text style={styles.itemValue}>
                {editedGame.venueName || editedGame.districtName || editedGame.cityName || 'Belirtilmemiş'}
              </Text>
              {editedGame.venueAddress && (
                <Text style={styles.itemSubValue}>{editedGame.venueAddress}</Text>
              )}
            </View>
            <Edit2 size={20} color={colors.primary[500]} />
          </TouchableOpacity>

          {/* 3. Oyun Ücreti */}
          <TouchableOpacity 
            style={styles.editableItem} 
            onPress={() => setShowFeeModal(true)}
          >
            <View style={styles.itemLeft}>
              <Text style={styles.itemLabel}>Oyun Ücreti</Text>
              <Text style={styles.itemValue}>
                {!editedGame.paymentType || editedGame.paymentType === 'ucretsiz'
                  ? 'Ücretsiz'
                  : editedGame.paymentType === 'alman_usulu' ? 'Alman Usulü' 
                    : editedGame.paymentType === 'ortak' ? 'Ortak Ödeme'
                    : 'İsmarlanıyor'}
              </Text>
            </View>
            <Edit2 size={20} color={colors.primary[500]} />
          </TouchableOpacity>

          {/* 4. Tarih ve Saat */}
          <TouchableOpacity 
            style={styles.editableItem} 
            onPress={() => setShowDateModal(true)}
          >
            <View style={styles.itemLeft}>
              <Text style={styles.itemLabel}>Tarih ve Saat</Text>
              <Text style={styles.itemValue}>{formatDate(editedGame.startDate)}</Text>
            </View>
            <Edit2 size={20} color={colors.primary[500]} />
          </TouchableOpacity>

          {/* 5. Oyun Süresi */}
          <TouchableOpacity 
            style={styles.editableItem} 
            onPress={() => setShowDurationModal(true)}
          >
            <View style={styles.itemLeft}>
              <Text style={styles.itemLabel}>Oyun Süresi</Text>
              <Text style={styles.itemValue}>
                {editedGame.estimatedDuration && editedGame.estimatedDuration > 0 
                  ? `${editedGame.estimatedDuration} dakika` 
                  : 'Belirtilmemiş'}
              </Text>
            </View>
            <Edit2 size={20} color={colors.primary[500]} />
          </TouchableOpacity>

          {/* 6. Başlık */}
          <TouchableOpacity 
            style={styles.editableItem} 
            onPress={() => setShowTitleModal(true)}
          >
            <View style={styles.itemLeft}>
              <Text style={styles.itemLabel}>Başlık</Text>
              <Text style={styles.itemValue}>{editedGame.title || 'Belirtilmemiş'}</Text>
            </View>
            <Edit2 size={20} color={colors.primary[500]} />
          </TouchableOpacity>

          {/* 7. Açıklama */}
          <TouchableOpacity 
            style={styles.editableItem} 
            onPress={() => setShowDescriptionModal(true)}
          >
            <View style={styles.itemLeft}>
              <Text style={styles.itemLabel}>Açıklama</Text>
              <Text style={styles.itemValue} numberOfLines={2}>
                {editedGame.description || 'Açıklama yok'}
              </Text>
            </View>
            <Edit2 size={20} color={colors.primary[500]} />
          </TouchableOpacity>

          {/* 8. Oyuncu Sayıları */}
          <TouchableOpacity 
            style={styles.editableItem} 
            onPress={() => setShowPlayersModal(true)}
          >
            <View style={styles.itemLeft}>
              <Text style={styles.itemLabel}>Oyuncu Sayıları</Text>
              <View style={styles.playerInfo}>
                <View style={styles.playerRow}>
                  <Text style={styles.playerLabel}>Toplam:</Text>
                  <Text style={styles.itemValue}>{editedGame.totalPlayers} kişi</Text>
                </View>
                <View style={styles.playerRow}>
                  <Text style={styles.playerLabel}>İhtiyaç:</Text>
                  <Text style={styles.itemValue}>{editedGame.neededPlayers || 0} kişi</Text>
                </View>
                <View style={styles.playerRow}>
                  <Text style={styles.playerLabel}>Katılan:</Text>
                  <Text style={styles.itemValue}>
                    {editedGame.currentPlayers?.length || 0} kişi
                  </Text>
                </View>
              </View>
            </View>
            <Edit2 size={20} color={colors.primary[500]} />
          </TouchableOpacity>

          {/* 9. Yetenek Seviyesi */}
          <TouchableOpacity 
            style={styles.editableItem} 
            onPress={() => setShowSkillModal(true)}
          >
            <View style={styles.itemLeft}>
              <Text style={styles.itemLabel}>Yetenek Seviyesi</Text>
              <Text style={styles.itemValue}>
                {editedGame.skillLevel ? getSkillLevelLabel(editedGame.skillLevel) : 'Belirtilmemiş'}
              </Text>
            </View>
            <Edit2 size={20} color={colors.primary[500]} />
          </TouchableOpacity>

          {/* 10. Cinsiyet Tercihi */}
          <TouchableOpacity 
            style={styles.editableItem} 
            onPress={() => setShowGenderModal(true)}
          >
            <View style={styles.itemLeft}>
              <Text style={styles.itemLabel}>Cinsiyet Tercihi</Text>
              <Text style={styles.itemValue}>
                {editedGame.genderPreference ? getGenderLabel(editedGame.genderPreference) : 'Belirtilmemiş'}
              </Text>
            </View>
            <Edit2 size={20} color={colors.primary[500]} />
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* Kaydet ve İptal Butonları - EN ALTTA SABİT */}
      {hasChanges() && (
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={handleCancel}
            disabled={saving}
          >
            <X size={20} color={colors.text.primary} />
            <Text style={styles.cancelButtonText}>İptal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.neutral[0]} />
            ) : (
              <>
                <Save size={20} color={colors.neutral[0]} />
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Modal'lar */}
      <GameSelectionModal
        visible={showGameModal}
        onClose={() => {
          setShowGameModal(false);
          setSelectedCategory(null);
        }}
        onGameSelect={handleGameTypeUpdate}
        onCategorySelect={handleCategorySelect}
        gameTypes={gameTypes}
        loading={loadingGameTypes}
        selectedCategory={selectedCategory}
        selectedGameTypeId={editedGame?.gameType?._id || ''}
      />

      <LocationTimeModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSave={handleLocationUpdate}
        type="location"
        initialLocation={{
          cityId: editedGame.cityId || '',
          cityName: editedGame.cityName || '',
          districtId: editedGame.districtId || '',
          districtName: editedGame.districtName || '',
          venueId: editedGame.venueId || '',
          venueName: editedGame.venueName || '',
          venueAddress: editedGame.venueAddress || '',
        }}
      />

      <LocationTimeModal
        visible={showFeeModal}
        onClose={() => setShowFeeModal(false)}
        onSave={handleFeeUpdate}
        type="fee"
        initialFee={{
          hasFee: editedGame.paymentType && editedGame.paymentType !== 'ucretsiz',
          feeAmount: '',
        }}
      />

      <LocationTimeModal
        visible={showDateModal}
        onClose={() => setShowDateModal(false)}
        onSave={handleDateUpdate}
        type="datetime"
        initialDateTime={editedGame.startDate ? new Date(editedGame.startDate) : new Date()}
      />

      <LocationTimeModal
        visible={showDurationModal}
        onClose={() => setShowDurationModal(false)}
        onSave={handleDurationUpdate}
        type="duration"
        initialDuration={editedGame.estimatedDuration}
      />

      <SimpleTextModal
        visible={showTitleModal}
        title="Başlık Düzenle"
        initialValue={editedGame.title || ''}
        placeholder="Oyun başlığı girin"
        maxLength={50}
        onClose={() => setShowTitleModal(false)}
        onSave={handleTitleUpdate}
      />

      <SimpleTextModal
        visible={showDescriptionModal}
        title="Açıklama Düzenle"
        initialValue={editedGame.description || ''}
        placeholder="Oyun açıklaması girin"
        multiline
        maxLength={200}
        onClose={() => setShowDescriptionModal(false)}
        onSave={handleDescriptionUpdate}
      />

      <TeamPlayersModal
        visible={showPlayersModal}
        onClose={() => setShowPlayersModal(false)}
        onSave={handlePlayersUpdate}
        initialTotalPlayers={editedGame.totalPlayers}
        initialNeededPlayers={editedGame.neededPlayers}
      />

      <SkillLevelModal
        visible={showSkillModal}
        onClose={() => setShowSkillModal(false)}
        onSave={handleSkillUpdate}
        initialSkillLevel={editedGame.skillLevel}
      />

      <GenderPreferenceModal
        visible={showGenderModal}
        onClose={() => setShowGenderModal(false)}
        onSave={handleGenderUpdate}
        initialGenderPreference={editedGame.genderPreference}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  backButton: {
    padding: spacing.sm,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Butonlar için boşluk
  },
  content: {
    padding: spacing.md,
  },
  editableItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral[0],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    minHeight: 70,
  },
  itemLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  itemLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.xs,
  },
  itemValue: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
  },
  itemSubValue: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: 4,
  },
  playerInfo: {
    marginTop: spacing.xs,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  playerLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    width: 70,
  },
  errorText: {
    fontSize: typography.sizes.lg,
    color: colors.text.secondary,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
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
});

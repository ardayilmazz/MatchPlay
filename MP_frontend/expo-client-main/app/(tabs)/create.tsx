import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import StepIndicator from '@/components/create-game/StepIndicator';
import Step1GameStep from '@/components/create-game/Step1GameStep';
import Step2TeamStep from '@/components/create-game/Step2TeamStep';
import NewSummaryStep from '@/components/create-game/NewSummaryStep';
import { ChevronLeft } from 'lucide-react-native';
import {
  fetchGameTypes,
  saveDraftLocally,
  loadDraftLocally,
  clearDraftLocally,
  createGameSession,
  GameType,
  GameSessionDraft,
} from '@/services/gameService';
import { router } from 'expo-router';
import { generateGameTitle } from '@/utils/gameTitle';
import { homeCacheService } from '@/utils/homeCache';

const STEPS = [
  'Oyun',
  'Ekip',
  'Özet',
];

export default function CreateScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [currentStep, setCurrentStep] = useState(0);
  const [gameTypes, setGameTypes] = useState<GameType[]>([]);
  const [loadingGameTypes, setLoadingGameTypes] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  const [draft, setDraft] = useState<GameSessionDraft>({
    currentStep: 0,
    genderPreference: 'herkes',
    skillLevel: 'orta',
  });

  // Oyun tiplerini ve yerel taslağı yükle
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Oyun tiplerini yükle (cache'i yenile)
      const types = await fetchGameTypes(true); // forceRefresh = true
      console.log('[create.tsx] Oyun tipleri yüklendi:', types?.length || 0);
      setGameTypes(types || []);

      // Yerel taslağı yükle
      const savedDraft = await loadDraftLocally();
      if (savedDraft && savedDraft.gameTypeId) {
        // Eski draft'taki gameTypeId'nin hala geçerli olup olmadığını kontrol et
        const isValidGameType = types.some(gt => gt._id === savedDraft.gameTypeId);
        if (isValidGameType) {
          setDraft(savedDraft);
          setCurrentStep(savedDraft.currentStep || 0);
        } else {
          // Geçersiz gameTypeId varsa draft'ı temizle
          console.log('[create.tsx] Geçersiz gameTypeId bulundu, draft temizleniyor');
          await clearDraftLocally();
        }
      } else if (savedDraft) {
        setDraft(savedDraft);
        setCurrentStep(savedDraft.currentStep || 0);
      }
    } catch (error: any) {
      console.error('[create.tsx] loadInitialData error:', error);
      Alert.alert(
        'Bağlantı Hatası',
        'Backend sunucusuna bağlanılamadı. Lütfen backend\'in çalıştığından emin olun.\n\n' +
        'Komutlar:\n' +
        '1. cd MP_backend\n' +
        '2. npm run dev\n' +
        '3. npm run seed:games (ilk kez)',
        [{ text: 'Tamam' }]
      );
      setGameTypes([]);
    } finally {
      setLoadingGameTypes(false);
    }
  };

  // Taslağı güncelle ve kaydet
  const updateDraft = async (updates: Partial<GameSessionDraft>) => {
    const newDraft = { ...draft, ...updates };
    setDraft(newDraft);
    await saveDraftLocally(newDraft);
  };

  // Artık kullanılmıyor - currentStep güncellemesi onNext callback'lerinde yapılıyor
  // const goToNextStep = async () => {
  //   if (currentStep < STEPS.length - 1) {
  //     const nextStep = currentStep + 1;
  //     setCurrentStep(nextStep);
  //   }
  // };

  const goToPreviousStep = async () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      const newDraft = { ...draft, currentStep: prevStep };
      setDraft(newDraft);
      await saveDraftLocally(newDraft);
    }
  };

  const goToStep = async (step: number) => {
    setCurrentStep(step);
    const newDraft = { ...draft, currentStep: step };
    setDraft(newDraft);
    await saveDraftLocally(newDraft);
  };

  // Oyunu yayınla
  const handlePublish = async () => {
    if (!user?.token) {
      Alert.alert('Hata', 'Oturum açmanız gerekiyor');
      return;
    }

    try {
      setIsPublishing(true);
      
      // Eğer başlık yoksa otomatik oluştur
      let finalDraft = { ...draft };
      if (!finalDraft.title && finalDraft.gameType && finalDraft.districtName && finalDraft.startDate) {
        const autoTitle = generateGameTitle(
          finalDraft.gameType.name,
          finalDraft.districtName,
          new Date(finalDraft.startDate)
        );
        finalDraft.title = autoTitle;
      }
      
      await createGameSession(user.token, finalDraft);
      await clearDraftLocally();
      
      // Ana sayfa cache'ini temizle (yeni oyun eklendi)
      await homeCacheService.clearCache();
      console.log('[Create] Home cache cleared after publishing game');
      
      // Draft'ı sıfırla ve başa dön
      setDraft({
        currentStep: 0,
        genderPreference: 'herkes',
        skillLevel: 'orta',
      });
      setCurrentStep(0);
      
      Alert.alert('Başarılı!', 'Oyununuz yayınlandı', [
        {
          text: 'Tamam',
          onPress: () => {
            // Ana sayfaya dön
            router.push('/(tabs)/home');
          },
        },
      ]);
    } catch (error: any) {
      console.error('handlePublish error:', error);
      Alert.alert('Hata', error.message || 'Oyun oluşturulamadı');
    } finally {
      setIsPublishing(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Step1GameStep
            gameTypes={gameTypes}
            loading={loadingGameTypes}
            selectedGameType={draft.gameType || null}
            location={draft.cityId && draft.districtId && draft.venueId ? {
              cityId: draft.cityId,
              cityName: draft.cityName || '',
              districtId: draft.districtId,
              districtName: draft.districtName || '',
              venueId: draft.venueId,
              venueName: draft.venueName || '',
              venueAddress: draft.venueAddress || '',
            } : null}
            feeAmount={draft.feeAmount || 0}
            startDate={draft.startDate ? new Date(draft.startDate) : null}
            estimatedDuration={draft.estimatedDuration || 60}
            title={draft.title || ''}
            description={draft.description || ''}
            tags={draft.tags || []}
            onGameTypeSelect={async (gameType) => {
              await updateDraft({
                gameTypeId: gameType._id,
                gameType: gameType,
                totalPlayers: gameType.minPlayers,
                neededPlayers: gameType.minPlayers - 1,
                estimatedDuration: gameType.defaultDuration,
                teamAssignment: gameType.hasTeams ? 'manual' : null,
                hasEquipment: false,
              });
            }}
            onLocationSelect={async (location) => {
              await updateDraft({
                cityId: location.cityId,
                cityName: location.cityName,
                districtId: location.districtId,
                districtName: location.districtName,
                venueId: location.venueId,
                venueName: location.venueName,
                venueAddress: location.venueAddress,
              });
            }}
            onFeeUpdate={async (data) => {
              await updateDraft(data);
            }}
            onDateTimeUpdate={async (data) => {
              await updateDraft(data);
            }}
            onDurationUpdate={async (data) => {
              await updateDraft(data);
            }}
            onTitleDescriptionUpdate={async (data) => {
              await updateDraft(data);
            }}
            onNext={async () => {
              // Eğer başlık yoksa otomatik oluştur
              if (!draft.title && draft.gameType && draft.districtName && draft.startDate) {
                const autoTitle = generateGameTitle(
                  draft.gameType.name,
                  draft.districtName,
                  new Date(draft.startDate)
                );
                await updateDraft({ title: autoTitle });
              }
              
              const nextStep = currentStep + 1;
              await updateDraft({ currentStep: nextStep });
              setCurrentStep(nextStep);
            }}
          />
        );

      case 1:
        if (!draft.gameType) {
          goToStep(0);
          return null;
        }
        return (
          <Step2TeamStep
            totalPlayers={draft.totalPlayers || draft.gameType.minPlayers}
            neededPlayers={draft.neededPlayers || draft.gameType.minPlayers - 1}
            skillLevel={draft.skillLevel || 'orta'}
            genderPreference={draft.genderPreference || 'herkes'}
            autoCancelIfNotFull={draft.autoCancelIfNotFull || false}
            onPlayersUpdate={async (data) => {
              await updateDraft(data);
            }}
            onSkillLevelUpdate={async (skillLevel) => {
              await updateDraft({ skillLevel });
            }}
            onGenderUpdate={async (genderPreference) => {
              await updateDraft({ genderPreference });
            }}
            onNext={async () => {
              // Eğer başlık yoksa otomatik oluştur
              if (!draft.title && draft.gameType && draft.districtName && draft.startDate) {
                const autoTitle = generateGameTitle(
                  draft.gameType.name,
                  draft.districtName,
                  new Date(draft.startDate)
                );
                await updateDraft({ title: autoTitle });
              }
              
              const nextStep = currentStep + 1;
              await updateDraft({ currentStep: nextStep });
              setCurrentStep(nextStep);
            }}
          />
        );

      case 2:
        return (
          <NewSummaryStep
            draft={draft}
            onBack={goToPreviousStep}
            onPublish={handlePublish}
            isPublishing={isPublishing}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={goToPreviousStep}>
            <ChevronLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>Oyun Oluştur</Text>
      </View>

      <StepIndicator steps={STEPS} currentStep={currentStep} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
      </ScrollView>
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl + spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.primary,
  },
  backButton: {
    marginRight: spacing.md,
    padding: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  });
}

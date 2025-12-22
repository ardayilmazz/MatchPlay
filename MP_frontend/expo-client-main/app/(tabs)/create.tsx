import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import StepIndicator from '@/components/create-game/StepIndicator';
import NewGameTypeStep from '@/components/create-game/NewGameTypeStep';
import TitleDescriptionStep from '@/components/create-game/TitleDescriptionStep';
import LocationTimeStep from '@/components/create-game/LocationTimeStep';
import TeamPlayersStep from '@/components/create-game/TeamPlayersStep';
import PlayerCriteriaStep from '@/components/create-game/PlayerCriteriaStep';
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

const STEPS = [
  'Oyun Seç',
  'Açıklama',
  'Konum & Zaman',
  'Ekip',
  'Kriterler',
  'Özet',
];

export default function CreateScreen() {
  const { user } = useAuth();
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
      await createGameSession(user.token, draft);
      await clearDraftLocally();
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
          <NewGameTypeStep
            gameTypes={gameTypes}
            selectedGameTypeId={draft.gameTypeId || ''}
            loading={loadingGameTypes}
            onSelect={async (gameType) => {
              const nextStep = currentStep + 1;
              await updateDraft({
                gameTypeId: gameType._id,
                gameType: gameType,
                // Varsayılan değerleri ayarla
                totalPlayers: gameType.minPlayers,
                neededPlayers: gameType.minPlayers - 1,
                estimatedDuration: gameType.defaultDuration,
                teamAssignment: gameType.hasTeams ? 'manual' : null,
                hasEquipment: false,
                currentStep: nextStep,
              });
              setCurrentStep(nextStep);
            }}
          />
        );

      case 1:
        return (
          <TitleDescriptionStep
            title={draft.title || ''}
            description={draft.description || ''}
            tags={draft.tags || []}
            onNext={async (title, description, tags) => {
              const nextStep = currentStep + 1;
              await updateDraft({ title, description, tags, currentStep: nextStep });
              setCurrentStep(nextStep);
            }}
          />
        );

      case 2:
        return (
          <LocationTimeStep
            cityId={draft.cityId || ''}
            districtId={draft.districtId || ''}
            venueId={draft.venueId || ''}
            hasFee={draft.hasFee || false}
            feeAmount={draft.feeAmount || ''}
            startDate={draft.startDate ? new Date(draft.startDate) : null}
            estimatedDuration={draft.estimatedDuration || 60}
            expectsFee={draft.gameType?.expectsFee || false}
            onNext={async (data) => {
              const nextStep = currentStep + 1;
              await updateDraft({ ...data, currentStep: nextStep });
              setCurrentStep(nextStep);
            }}
          />
        );

      case 3:
        if (!draft.gameType) {
          goToStep(0);
          return null;
        }
        return (
          <TeamPlayersStep
            gameType={draft.gameType}
            totalPlayers={draft.totalPlayers || draft.gameType.minPlayers}
            neededPlayers={draft.neededPlayers || draft.gameType.minPlayers - 1}
            teamAssignment={draft.teamAssignment || null}
            skillLevel={draft.skillLevel || 'orta'}
            hasEquipment={draft.hasEquipment || false}
            onNext={async (data) => {
              const nextStep = currentStep + 1;
              await updateDraft({ ...data, currentStep: nextStep });
              setCurrentStep(nextStep);
            }}
          />
        );

      case 4:
        return (
          <PlayerCriteriaStep
            genderPreference={draft.genderPreference || 'herkes'}
            onNext={async (genderPreference) => {
              const nextStep = currentStep + 1;
              await updateDraft({ genderPreference, currentStep: nextStep });
              setCurrentStep(nextStep);
            }}
          />
        );

      case 5:
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

const styles = StyleSheet.create({
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
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
});

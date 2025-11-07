import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { GameSkillLevel } from '@/types';
import StepIndicator from '@/components/create-game/StepIndicator';
import GameTypeStep from '@/components/create-game/GameTypeStep';
import LocationStep from '@/components/create-game/LocationStep';
import DateTimeStep from '@/components/create-game/DateTimeStep';
import PlayersStep from '@/components/create-game/PlayersStep';
import DescriptionStep from '@/components/create-game/DescriptionStep';
import SummaryStep from '@/components/create-game/SummaryStep';
import { ChevronLeft } from 'lucide-react-native';

interface GameFormData {
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
}

const STEPS = [
  'Oyun Tipi',
  'Konum',
  'Tarih & Saat',
  'Oyuncular',
  'Açıklama',
  'Özet',
];

export default function CreateScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<GameFormData>({
    sportId: '',
    sportName: '',
    cityId: '',
    cityName: '',
    districtId: '',
    districtName: '',
    venueId: '',
    venueName: '',
    venueAddress: '',
    startDate: null,
    endDate: null,
    totalPlayers: 2,
    skillLevel: 'everyone',
    description: '',
  });

  const updateFormData = (data: Partial<GameFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const goToNextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <GameTypeStep
            selectedSportId={formData.sportId}
            onSelect={(sportId, sportName) => {
              updateFormData({ sportId, sportName });
              goToNextStep();
            }}
          />
        );
      case 1:
        return (
          <LocationStep
            cityId={formData.cityId}
            districtId={formData.districtId}
            venueId={formData.venueId}
            onNext={(locationData) => {
              updateFormData(locationData);
              goToNextStep();
            }}
          />
        );
      case 2:
        return (
          <DateTimeStep
            startDate={formData.startDate}
            endDate={formData.endDate}
            onNext={(startDate, endDate) => {
              updateFormData({ startDate, endDate });
              goToNextStep();
            }}
          />
        );
      case 3:
        return (
          <PlayersStep
            totalPlayers={formData.totalPlayers}
            skillLevel={formData.skillLevel}
            onNext={(totalPlayers, skillLevel) => {
              updateFormData({ totalPlayers, skillLevel });
              goToNextStep();
            }}
          />
        );
      case 4:
        return (
          <DescriptionStep
            description={formData.description}
            onNext={(description) => {
              updateFormData({ description });
              goToNextStep();
            }}
          />
        );
      case 5:
        return <SummaryStep formData={formData} onBack={goToPreviousStep} />;
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

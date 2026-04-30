import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borderRadius } from '@/constants/theme';
import { GameType } from '@/services/gameService';
import { ChevronRight, Check } from 'lucide-react-native';
import Button from '@/components/Button';
import GameSelectionModal from './modals/GameSelectionModal';
import LocationTimeMenuModal from './modals/LocationTimeMenuModal';
import LocationTimeModal from './modals/LocationTimeModal';
import TitleDescriptionModal from './modals/TitleDescriptionModal';

interface LocationData {
  cityId: string;
  cityName: string;
  districtId: string;
  districtName: string;
  venueId: string;
  venueName: string;
  venueAddress: string;
}

interface Step1GameStepProps {
  gameTypes: GameType[];
  loading: boolean;
  selectedGameType: GameType | null;
  location: LocationData | null;
  feeAmount: number;
  startDate: Date | null;
  estimatedDuration: number;
  title: string;
  description: string;
  tags: string[];
  onGameTypeSelect: (gameType: GameType) => void;
  onLocationSelect: (location: LocationData) => void;
  onFeeUpdate: (data: { feeAmount: number }) => void;
  onDateTimeUpdate: (data: { startDate: Date }) => void;
  onDurationUpdate: (data: { estimatedDuration: number }) => void;
  onTitleDescriptionUpdate: (data: { title: string; description: string; tags: string[] }) => void;
  onNext: () => void;
}

export default function Step1GameStep({
  gameTypes,
  loading,
  selectedGameType,
  location,
  feeAmount,
  startDate,
  estimatedDuration,
  title,
  description,
  tags,
  onGameTypeSelect,
  onLocationSelect,
  onFeeUpdate,
  onDateTimeUpdate,
  onDurationUpdate,
  onTitleDescriptionUpdate,
  onNext,
}: Step1GameStepProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [showGameModal, setShowGameModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showLocationTimeMenu, setShowLocationTimeMenu] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showDateTimeModal, setShowDateTimeModal] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);

  const isValid = selectedGameType && location && startDate;

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Oyun</Text>
      <Text style={styles.subtitle}>Oyun bilgilerini belirleyin</Text>

      <View style={styles.sections}>
        {/* 1. Oyun Seçimi */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionButton}
            onPress={() => setShowGameModal(true)}
          >
            <View style={styles.sectionContent}>
              <Text style={styles.sectionTitle}>Oyun Seç*</Text>
              {selectedGameType && (
                <View style={styles.selectedInfo}>
                  <Check size={16} color={colors.success[500]} />
                  <Text style={styles.selectedText}>{selectedGameType.name}</Text>
                </View>
              )}
            </View>
            <ChevronRight size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* 2. Konum ve Zaman */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionButton}
            onPress={() => setShowLocationTimeMenu(true)}
          >
            <View style={styles.sectionContent}>
              <Text style={styles.sectionTitle}>Konum ve Zaman*</Text>
              {(location || startDate) && (
                <View style={styles.selectedInfo}>
                  <Check size={16} color={colors.success[500]} />
                  <Text style={styles.selectedText}>
                    {location && startDate ? 'Tamamlandı' : 'Devam ediyor...'}
                  </Text>
                </View>
              )}
            </View>
            <ChevronRight size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* 3. Başlık ve Açıklama */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionButton}
            onPress={() => setShowTitleModal(true)}
          >
            <View style={styles.sectionContent}>
              <Text style={styles.sectionTitle}>Başlık ve Açıklama</Text>
              {(title || description || tags.length > 0) && (
                <View style={styles.selectedInfo}>
                  <Check size={16} color={colors.success[500]} />
                  <Text style={styles.selectedText}>
                    {title ? 'Özel başlık' : 'Otomatik başlık'}
                  </Text>
                </View>
              )}
            </View>
            <ChevronRight size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <Button
          title="Devam Et"
          onPress={onNext}
          disabled={!isValid}
          style={styles.button}
        />
      </View>

      {/* Modals */}
      <GameSelectionModal
        visible={showGameModal}
        gameTypes={gameTypes}
        loading={loading}
        selectedCategory={selectedCategory}
        selectedGameTypeId={selectedGameType?._id || ''}
        onClose={() => {
          setShowGameModal(false);
          setSelectedCategory(null);
        }}
        onCategorySelect={setSelectedCategory}
        onGameSelect={onGameTypeSelect}
      />

      <LocationTimeModal
        visible={showLocationModal}
        type="location"
        initialLocation={location}
        onClose={() => setShowLocationModal(false)}
        onSave={onLocationSelect}
        onBackToMenu={() => {
          setShowLocationModal(false);
          setShowLocationTimeMenu(true);
        }}
      />

      <LocationTimeModal
        visible={showFeeModal}
        type="fee"
        initialFee={{ feeAmount }}
        onClose={() => setShowFeeModal(false)}
        onSave={onFeeUpdate}
        onBackToMenu={() => {
          setShowFeeModal(false);
          setShowLocationTimeMenu(true);
        }}
      />

      <LocationTimeModal
        visible={showDateTimeModal}
        type="datetime"
        initialDateTime={startDate}
        onClose={() => setShowDateTimeModal(false)}
        onSave={onDateTimeUpdate}
        onBackToMenu={() => {
          setShowDateTimeModal(false);
          setShowLocationTimeMenu(true);
        }}
      />

      <LocationTimeModal
        visible={showDurationModal}
        type="duration"
        initialDuration={estimatedDuration}
        onClose={() => setShowDurationModal(false)}
        onSave={onDurationUpdate}
        onBackToMenu={() => {
          setShowDurationModal(false);
          setShowLocationTimeMenu(true);
        }}
      />

      <LocationTimeMenuModal
        visible={showLocationTimeMenu}
        location={location}
        feeAmount={feeAmount}
        startDate={startDate}
        estimatedDuration={estimatedDuration}
        onClose={() => setShowLocationTimeMenu(false)}
        onLocationPress={() => setShowLocationModal(true)}
        onFeePress={() => setShowFeeModal(true)}
        onDateTimePress={() => setShowDateTimeModal(true)}
        onDurationPress={() => setShowDurationModal(true)}
      />

      <TitleDescriptionModal
        visible={showTitleModal}
        initialTitle={title}
        initialDescription={description}
        initialTags={tags}
        onClose={() => setShowTitleModal(false)}
        onSave={onTitleDescriptionUpdate}
      />
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
  sections: {
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  sectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  subSectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
  },
  sectionContent: {
    flex: 1,
    gap: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.primary,
  },
  subSectionTitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  selectedText: {
    fontSize: typography.sizes.sm,
    color: colors.success[500],
    fontFamily: typography.fontFamily.medium,
  },
  selectedSubText: {
    fontSize: typography.sizes.xs,
    color: colors.success[500],
    fontFamily: typography.fontFamily.medium,
  },
  button: {
    marginTop: spacing.lg,
  },
  });
}

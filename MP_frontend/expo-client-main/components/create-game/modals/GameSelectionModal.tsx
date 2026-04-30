import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borderRadius } from '@/constants/theme';
import { X } from 'lucide-react-native';
import { GameType } from '@/services/gameService';
import {
  Dribbble,
  Trophy,
  CircleDot,
  Spade,
  Dice5,
  CircleStop,
} from 'lucide-react-native';

interface GameSelectionModalProps {
  visible: boolean;
  gameTypes: GameType[];
  loading: boolean;
  selectedCategory: string | null;
  selectedGameTypeId: string;
  onClose: () => void;
  onCategorySelect: (category: string) => void;
  onGameSelect: (gameType: GameType) => void;
}

const iconMap: Record<string, any> = {
  basketball: Dribbble,
  soccer: Trophy,
  tennis: CircleDot,
  chess: Spade,
  dice: Dice5,
  pool: CircleStop,
  cards: Dice5,
  bowling: CircleStop,
  target: CircleDot,
  'table-tennis': CircleDot,
  volleyball: Dribbble,
};

const CATEGORIES = [
  { id: 'masa_tas', label: 'Masa Oyunları', icon: '🎲' },
  { id: 'spor', label: 'Spor - Fiziksel Aktiviteler', icon: '⚽' },
  { id: 'beceri', label: 'Beceri Oyunları', icon: '🎯' },
  { id: 'kart', label: 'Kart Oyunları', icon: '🃏' },
];

export default function GameSelectionModal({
  visible,
  gameTypes,
  loading,
  selectedCategory,
  selectedGameTypeId,
  onClose,
  onCategorySelect,
  onGameSelect,
}: GameSelectionModalProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const filteredGames = selectedCategory
    ? gameTypes.filter((game) => game.category === selectedCategory)
    : [];

  const renderGameCard = (game: GameType) => {
    const isSelected = game._id === selectedGameTypeId;
    const IconComponent = iconMap[game.icon] || Dice5;

    return (
      <TouchableOpacity
        key={game._id}
        style={[styles.gameCard, isSelected && styles.gameCardSelected]}
        onPress={() => {
          onGameSelect(game);
          onClose();
        }}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
          <IconComponent
            size={24}
            color={isSelected ? colors.primary[500] : colors.text.secondary}
          />
        </View>
        <Text style={[styles.gameName, isSelected && styles.gameNameSelected]}>
          {game.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedCategory ? 'Oyun Seç' : 'Kategori Seç'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary[500]} />
              <Text style={styles.loadingText}>Yükleniyor...</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {!selectedCategory ? (
                // Kategori listesi
                <View style={styles.categoryGrid}>
                  {CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={styles.categoryCard}
                      onPress={() => onCategorySelect(category.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.categoryIcon}>{category.icon}</Text>
                      <Text style={styles.categoryLabel}>{category.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                // Oyun listesi
                <View>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => onCategorySelect(null as any)}
                  >
                    <Text style={styles.backButtonText}>← Kategorilere Dön</Text>
                  </TouchableOpacity>
                  <View style={styles.gameGrid}>
                    {filteredGames.map(renderGameCard)}
                  </View>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  loadingContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  scrollView: {
    maxHeight: 500,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  categoryGrid: {
    gap: spacing.md,
  },
  categoryCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryIcon: {
    fontSize: 32,
  },
  categoryLabel: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  backButtonText: {
    fontSize: typography.sizes.md,
    color: colors.primary[500],
    fontFamily: typography.fontFamily.semibold,
  },
  gameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  gameCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  gameCardSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  iconContainer: {
    marginBottom: spacing.xs,
  },
  iconContainerSelected: {
    transform: [{ scale: 1.1 }],
  },
  gameName: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    textAlign: 'center',
  },
  gameNameSelected: {
    color: colors.primary[500],
    fontFamily: typography.fontFamily.semibold,
  },
  });
}

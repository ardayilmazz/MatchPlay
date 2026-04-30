import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { GameType } from '@/services/gameService';
import {
  Dribbble,
  Trophy,
  CircleDot,
  Spade,
  Dice5,
  CircleStop,
} from 'lucide-react-native';

interface NewGameTypeStepProps {
  gameTypes: GameType[];
  selectedGameTypeId: string;
  loading: boolean;
  onSelect: (gameType: GameType) => void;
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

const CATEGORY_ORDER = ['masa_tas', 'spor', 'beceri', 'kart'];

const CATEGORY_LABELS: Record<string, string> = {
  masa_tas: 'Masa & Taş Oyunları',
  spor: 'Spor & Fiziksel Aktiviteler',
  beceri: 'Beceri Oyunları',
  kart: 'Kart Oyunları',
};

// Her kategorideki oyunların sırası
const GAME_ORDER: Record<string, string[]> = {
  masa_tas: [
    '101 Okey',
    'Okey',
    'Tavla',
    'Tabu',
    'Monopoly',
    'Scrabble',
    'Jenga',
    'Catan',
    'Uno',
  ],
  spor: [
    'Halısaha',
    'Voleybol',
    'Basketbol',
    'Tenis',
    'Masa Tenisi',
  ],
  beceri: [
    'Satranç',
    'Bowling',
    'Bilardo 8 Top',
    'Bilardo Amerikan',
    'Dart',
  ],
  kart: [
    'Batak',
    'Kral',
    'Pişti',
    'Blöf',
  ],
};

export default function NewGameTypeStep({
  gameTypes,
  selectedGameTypeId,
  loading,
  onSelect,
}: NewGameTypeStepProps) {
  // Kategorilere göre grupla ve sırala
  const groupedGames: Record<string, GameType[]> = {};
  
  // gameTypes'ın array olduğundan emin ol
  if (Array.isArray(gameTypes)) {
    gameTypes.forEach((game) => {
      if (!groupedGames[game.category]) {
        groupedGames[game.category] = [];
      }
      groupedGames[game.category].push(game);
    });

    // Her kategorideki oyunları GAME_ORDER'a göre sırala
    Object.keys(groupedGames).forEach((category) => {
      const order = GAME_ORDER[category] || [];
      groupedGames[category].sort((a, b) => {
        const indexA = order.indexOf(a.name);
        const indexB = order.indexOf(b.name);
        
        // Her ikisi de listede yoksa alfabetik sırala
        if (indexA === -1 && indexB === -1) {
          return a.name.localeCompare(b.name, 'tr');
        }
        // Sadece a listede yoksa b'yi öne al
        if (indexA === -1) return 1;
        // Sadece b listede yoksa a'yı öne al
        if (indexB === -1) return -1;
        // Her ikisi de listede varsa, sıralarına göre sırala
        return indexA - indexB;
      });
    });
  }

  const renderGameCard = (game: GameType) => {
    const isSelected = game._id === selectedGameTypeId;
    const IconComponent = iconMap[game.icon] || Dice5;

    return (
      <TouchableOpacity
        key={game._id}
        style={[styles.gameCard, isSelected && styles.gameCardSelected]}
        onPress={() => onSelect(game)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
          <IconComponent
            size={28}
            color={isSelected ? colors.primary[500] : colors.text.secondary}
          />
        </View>
        <Text style={[styles.gameName, isSelected && styles.gameNameSelected]}>
          {game.name}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>Oyunlar yükleniyor...</Text>
      </View>
    );
  }

  // Oyun tipleri yüklenemedi
  if (!gameTypes || gameTypes.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.title}>Oyunlar yüklenemedi</Text>
        <Text style={styles.loadingText}>
          Backend sunucusunun çalıştığından ve oyun tiplerinin eklendiğinden emin olun.
        </Text>
        <Text style={styles.loadingText}>
          Komut: npm run seed:games
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hangi oyunu oynayacaksınız?</Text>
      <Text style={styles.subtitle}>Oyun tipini seçin</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {CATEGORY_ORDER.filter(cat => groupedGames[cat] && groupedGames[cat].length > 0).map((category) => (
          <View key={category} style={styles.section}>
            <Text style={styles.categoryTitle}>{CATEGORY_LABELS[category] || category}</Text>
            <View style={styles.grid}>{groupedGames[category].map(renderGameCard)}</View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
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
  section: {
    marginBottom: spacing.xl,
  },
  categoryTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  grid: {
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
    ...shadows.sm,
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


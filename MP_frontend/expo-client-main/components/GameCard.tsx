import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Calendar, MapPin, Users, Clock, Award } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { Game } from '@/types/index';

interface GameCardProps {
  game: Game;
  onPress?: (game: Game) => void;
}

export default function GameCard({ game, onPress }: GameCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const getSkillLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      everyone: 'Herkes',
      beginner: 'Başlangıç',
      intermediate: 'Orta',
      advanced: 'İleri',
      competitive: 'Rekabetçi',
    };
    return labels[level] || level;
  };

  const getStatusColor = () => {
    if (game.status === 'full') return colors.error[500];
    if (game.currentPlayers >= game.totalPlayers * 0.8) return colors.secondary[500];
    return colors.success[500];
  };

  const getStatusText = () => {
    if (game.status === 'full') return 'Dolu';
    if (game.status === 'cancelled') return 'İptal';
    if (game.status === 'completed') return 'Tamamlandı';
    return `${game.currentPlayers}/${game.totalPlayers}`;
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={() => onPress?.(game)}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleContainer}>
            {game.title ? (
              <>
                <Text style={styles.lobbyTitle}>{game.title}</Text>
                <Text style={styles.sportName}>{game.sportName}</Text>
              </>
            ) : (
              <Text style={styles.sportName}>{game.sportName}</Text>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>
        <View style={styles.dateContainer}>
          <Calendar size={16} color={colors.text.secondary} />
          <Text style={styles.dateText}>{formatDate(game.startTime)}</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Clock size={16} color={colors.text.secondary} />
          <Text style={styles.infoText}>
            {formatTime(game.startTime)} - {formatTime(game.endTime)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <MapPin size={16} color={colors.text.secondary} />
          <Text style={styles.infoText} numberOfLines={1}>
            {game.venueName}, {game.districtName}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Award size={16} color={colors.text.secondary} />
          <Text style={styles.infoText}>{getSkillLevelLabel(game.skillLevel)}</Text>
        </View>

        {game.description && (
          <Text style={styles.description} numberOfLines={2}>
            {game.description}
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.playersContainer}>
          <Users size={16} color={colors.primary[500]} />
          <Text style={styles.playersText}>
            {game.totalPlayers - game.currentPlayers} kişi aranıyor
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  cardPressed: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  titleContainer: {
    flex: 1,
    gap: 2,
  },
  lobbyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  sportName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[0],
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  infoContainer: {
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    flex: 1,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
  footer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  playersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  playersText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.primary[500],
  },
});

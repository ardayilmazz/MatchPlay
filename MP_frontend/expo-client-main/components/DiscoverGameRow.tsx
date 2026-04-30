import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { UserPlus } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { Game } from '@/types';
import { resolveSportImage } from '@/utils/sportImages';

interface DiscoverGameRowProps {
  game: Game;
  onPress: (game: Game) => void;
}

export default function DiscoverGameRow({ game, onPress }: DiscoverGameRowProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const source = useMemo(() => resolveSportImage(game.sportName), [game.sportName]);
  const locationLine = `${game.districtName}, ${game.venueName}`;

  return (
    <View style={styles.rowWrap}>
      <Pressable
        onPress={() => onPress(game)}
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
      >
        <LinearGradient
          colors={['#252e45', '#3a2848']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.gradient}
        >
          <View style={styles.glyph}>
            <Image source={source} style={styles.sportImage} resizeMode="contain" />
          </View>
          <View style={styles.colTitle}>
            <Text style={styles.sportTitle} numberOfLines={1}>
              {game.sportName}
            </Text>
            <Text style={styles.capacity}>
              {game.currentPlayers}/{game.totalPlayers}
            </Text>
          </View>
          <View style={styles.colLocation}>
            <Text style={styles.locationText} numberOfLines={2}>
              {locationLine}
            </Text>
          </View>
          <View style={styles.orangeFab}>
            <UserPlus size={22} color={colors.neutral[0]} strokeWidth={2.2} />
          </View>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    rowWrap: {
      marginBottom: spacing.sm,
      borderRadius: borderRadius.xl,
      overflow: 'hidden',
      ...shadows.md,
    },
    pressable: {
      borderRadius: borderRadius.xl,
      overflow: 'hidden',
    },
    pressed: {
      opacity: 0.92,
    },
    gradient: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      minHeight: 78,
    },
    glyph: {
      width: 52,
      height: 52,
      marginRight: spacing.sm,
      borderRadius: 26,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    sportImage: {
      width: 34,
      height: 34,
    },
    colTitle: {
      flex: 1,
      minWidth: 0,
      justifyContent: 'center',
      marginRight: spacing.xs,
    },
    sportTitle: {
      fontSize: typography.sizes.md,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
    },
    capacity: {
      marginTop: 2,
      fontSize: typography.sizes.sm,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.secondary,
    },
    colLocation: {
      flex: 1,
      minWidth: 0,
      justifyContent: 'center',
      alignItems: 'flex-end',
      paddingHorizontal: spacing.xs,
    },
    locationText: {
      fontSize: typography.sizes.xs,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.secondary,
      textAlign: 'right',
    },
    orangeFab: {
      width: 44,
      height: 44,
      borderRadius: 22,
      marginLeft: spacing.xs,
      backgroundColor: colors.secondary[400],
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}

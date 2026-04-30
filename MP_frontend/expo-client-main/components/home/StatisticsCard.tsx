import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useMemo } from 'react';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, borderRadius, typography, shadows } from '@/constants/theme';

interface StatisticsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  onPress?: () => void;
}

export default function StatisticsCard({ title, value, icon: Icon, color: iconColor, onPress }: StatisticsCardProps) {
  const { colors } = useTheme();
  const color = iconColor ?? colors.secondary[400];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const content = (
    <>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Icon size={18} color={color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
          {value}
        </Text>
        <Text style={styles.title}>{title}</Text>
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
        onPress={onPress}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={styles.card}>{content}</View>;
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...shadows.sm,
  },
  cardPressed: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  value: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  title: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  });
}

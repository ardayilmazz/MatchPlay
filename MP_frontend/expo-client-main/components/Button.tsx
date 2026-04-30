import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { colors as themeColors, spacing, typography, borderRadius } from '@/constants/theme';
import { ReactNode, useMemo } from 'react';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: ReactNode;
  size?: 'small' | 'medium' | 'large';
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  leftIcon,
  size = 'medium',
}: ButtonProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const buttonStyles = [
    styles.button,
    size === 'small' && styles.smallButton,
    size === 'large' && styles.largeButton,
    variant === 'primary' && styles.primaryButton,
    variant === 'secondary' && styles.secondaryButton,
    variant === 'outline' && styles.outlineButton,
    variant === 'danger' && styles.dangerButton,
    (disabled || loading) && styles.disabledButton,
    style,
  ];

  const textStyles = [
    styles.text,
    size === 'small' && styles.smallText,
    size === 'large' && styles.largeText,
    variant === 'primary' && styles.primaryText,
    variant === 'secondary' && styles.secondaryText,
    variant === 'outline' && styles.outlineText,
    variant === 'danger' && styles.dangerText,
    (disabled || loading) && styles.disabledText,
    textStyle,
  ];

  const activityColor =
    variant === 'outline' ? colors.secondary[400] : colors.neutral[0];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator color={activityColor} />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text style={textStyles}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const baseStyles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  smallButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },
  largeButton: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    minHeight: 56,
  },
  disabledButton: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  text: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.semibold,
  },
  smallText: {
    fontSize: typography.sizes.sm,
  },
  largeText: {
    fontSize: typography.sizes.lg,
  },
  disabledText: {
    opacity: 0.7,
  },
});

type Colors = typeof themeColors;

function createStyles(colors: Colors) {
  return StyleSheet.create({
    ...baseStyles as object,
    primaryButton: {
      backgroundColor: colors.secondary[400],
    },
    secondaryButton: {
      backgroundColor: colors.primary[600],
    },
    outlineButton: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.secondary[400],
    },
    dangerButton: {
      backgroundColor: colors.error[500],
    },
    primaryText: {
      color: colors.neutral[0],
    },
    secondaryText: {
      color: colors.neutral[0],
    },
    outlineText: {
      color: colors.neutral[0],
    },
    dangerText: {
      color: colors.neutral[0],
    },
  });
}

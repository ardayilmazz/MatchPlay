import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { ReactNode } from 'react';

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

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.neutral[0] : colors.primary[500]}
        />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text style={textStyles}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
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
  primaryButton: {
    backgroundColor: colors.primary[500],
  },
  secondaryButton: {
    backgroundColor: colors.secondary[500],
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  dangerButton: {
    backgroundColor: colors.error[500],
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
    fontWeight: typography.weights.semibold,
  },
  smallText: {
    fontSize: typography.sizes.sm,
  },
  largeText: {
    fontSize: typography.sizes.lg,
  },
  primaryText: {
    color: colors.text.inverse,
  },
  secondaryText: {
    color: colors.text.inverse,
  },
  outlineText: {
    color: colors.primary[500],
  },
  dangerText: {
    color: colors.text.inverse,
  },
  disabledText: {
    opacity: 0.7,
  },
});

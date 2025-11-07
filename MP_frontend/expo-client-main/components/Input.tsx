import { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
  containerStyle?: object;
}

export default function Input({
  label,
  error,
  isPassword = false,
  style,
  containerStyle,
  ...props
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, error && styles.inputError, style]}
          placeholderTextColor={colors.text.tertiary}
          secureTextEntry={isPassword && !isPasswordVisible}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            {isPasswordVisible ? (
              <EyeOff size={20} color={colors.text.tertiary} />
            ) : (
              <Eye size={20} color={colors.text.tertiary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  inputError: {
    borderColor: colors.error[500],
  },
  iconButton: {
    position: 'absolute',
    right: spacing.md,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  error: {
    fontSize: typography.sizes.sm,
    color: colors.error[500],
    marginTop: spacing.xs,
  },
});

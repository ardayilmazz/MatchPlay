import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { X } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import Button from './Button';

interface RatingPromptModalProps {
  visible: boolean;
  onYes: () => void;
  onNo: () => void;
}

export default function RatingPromptModal({
  visible,
  onYes,
  onNo,
}: RatingPromptModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onNo}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Pressable onPress={onNo} style={styles.closeButton}>
            <X size={24} color={colors.text.primary} />
          </Pressable>

          <Text style={styles.title}>Buluştuğunuz kullanıcıyı oylamak ister misiniz?</Text>

          <View style={styles.buttons}>
            <Button
              title="Evet"
              onPress={onYes}
              variant="primary"
              style={styles.button}
            />
            <Button
              title="Hayır"
              onPress={onNo}
              variant="secondary"
              style={styles.button}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modal: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...shadows.lg,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    padding: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
});

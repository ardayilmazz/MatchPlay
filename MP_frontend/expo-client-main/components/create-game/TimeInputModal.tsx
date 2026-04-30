import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borderRadius, shadows } from '@/constants/theme';
import Button from '@/components/Button';

interface TimeInputModalProps {
  visible: boolean;
  initialTime?: string; // "HH:MM" formatında
  onClose: () => void;
  onSave: (time: string) => void; // "HH:MM" formatında
}

export default function TimeInputModal({
  visible,
  initialTime,
  onClose,
  onSave,
}: TimeInputModalProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');

  useEffect(() => {
    if (visible && initialTime) {
      const [h, m] = initialTime.split(':');
      setHour(h || '');
      setMinute(m || '');
    } else if (visible) {
      setHour('');
      setMinute('');
    }
  }, [visible, initialTime]);

  const handleSave = () => {
    const h = hour.padStart(2, '0');
    const m = minute.padStart(2, '0');
    
    // Validasyon
    const hourNum = parseInt(h);
    const minuteNum = parseInt(m);
    
    if (isNaN(hourNum) || hourNum < 0 || hourNum > 23) {
      return;
    }
    
    if (isNaN(minuteNum) || minuteNum < 0 || minuteNum > 59) {
      return;
    }
    
    onSave(`${h}:${m}`);
  };

  const isValid = () => {
    const hourNum = parseInt(hour);
    const minuteNum = parseInt(minute);
    return (
      !isNaN(hourNum) &&
      hourNum >= 0 &&
      hourNum <= 23 &&
      !isNaN(minuteNum) &&
      minuteNum >= 0 &&
      minuteNum <= 59
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.modal}>
              <Text style={styles.title}>Saat Belirle</Text>
              
              <View style={styles.timeInputContainer}>
                <TextInput
                  style={styles.timeInput}
                  value={hour}
                  onChangeText={(text) => {
                    // Sadece rakam ve maksimum 2 karakter
                    const numericText = text.replace(/[^0-9]/g, '').slice(0, 2);
                    setHour(numericText);
                  }}
                  placeholder="00"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="numeric"
                  maxLength={2}
                  selectTextOnFocus
                />
                <Text style={styles.separator}>:</Text>
                <TextInput
                  style={styles.timeInput}
                  value={minute}
                  onChangeText={(text) => {
                    // Sadece rakam ve maksimum 2 karakter
                    const numericText = text.replace(/[^0-9]/g, '').slice(0, 2);
                    setMinute(numericText);
                  }}
                  placeholder="00"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="numeric"
                  maxLength={2}
                  selectTextOnFocus
                />
              </View>

              <View style={styles.footer}>
                <Button
                  title="İptal"
                  onPress={onClose}
                  variant="secondary"
                  style={styles.button}
                />
                <Button
                  title="Kaydet"
                  onPress={handleSave}
                  variant="primary"
                  style={styles.button}
                  disabled={!isValid()}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modal: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...shadows.lg,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  timeInput: {
    backgroundColor: colors.primary[900],
    borderWidth: 2,
    borderColor: colors.neutral[200],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.xxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    textAlign: 'center',
    minWidth: 80,
  },
  separator: {
    fontSize: typography.sizes.xxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
  });
}

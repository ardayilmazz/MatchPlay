import { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import Button from '@/components/Button';

interface TeamPlayersModalProps {
  visible: boolean;
  initialTotalPlayers: number;
  initialNeededPlayers: number;
  initialAutoCancelIfNotFull?: boolean;
  onClose: () => void;
  onSave: (data: { totalPlayers: number; neededPlayers: number; autoCancelIfNotFull?: boolean }) => void;
}

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 30;

export default function TeamPlayersModal({
  visible,
  initialTotalPlayers,
  initialNeededPlayers,
  initialAutoCancelIfNotFull = false,
  onClose,
  onSave,
}: TeamPlayersModalProps) {
  const [totalPlayers, setTotalPlayers] = useState(initialTotalPlayers || MIN_PLAYERS);
  const [neededPlayers, setNeededPlayers] = useState(initialNeededPlayers || 1);
  const [autoCancelIfNotFull, setAutoCancelIfNotFull] = useState(initialAutoCancelIfNotFull);

  const changeTotalPlayers = (direction: 'increase' | 'decrease') => {
    if (direction === 'increase' && totalPlayers < MAX_PLAYERS) {
      setTotalPlayers(totalPlayers + 1);
    } else if (direction === 'decrease' && totalPlayers > MIN_PLAYERS) {
      const newTotal = totalPlayers - 1;
      setTotalPlayers(newTotal);
      if (neededPlayers >= newTotal) {
        setNeededPlayers(newTotal - 1);
      }
    }
  };

  const changeNeededPlayers = (direction: 'increase' | 'decrease') => {
    const maxNeeded = totalPlayers - 1;
    if (direction === 'increase' && neededPlayers < maxNeeded) {
      setNeededPlayers(neededPlayers + 1);
    } else if (direction === 'decrease' && neededPlayers > 1) {
      setNeededPlayers(neededPlayers - 1);
    }
  };

  const handleSave = () => {
    onSave({ totalPlayers, neededPlayers, autoCancelIfNotFull });
    onClose();
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
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Oyuncu Sayıları</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Toplam Oyuncu */}
            <View style={styles.playerSection}>
              <Text style={styles.label}>Toplam Oyuncu Sayısı*</Text>
              <View style={styles.counterControl}>
                <TouchableOpacity
                  style={[styles.counterButton, totalPlayers <= MIN_PLAYERS && styles.counterButtonDisabled]}
                  onPress={() => changeTotalPlayers('decrease')}
                  disabled={totalPlayers <= MIN_PLAYERS}
                >
                  <ChevronLeft size={24} color={totalPlayers <= MIN_PLAYERS ? colors.neutral[300] : colors.primary[500]} />
                </TouchableOpacity>
                
                <View style={styles.counterDisplay}>
                  <Text style={styles.counterValue}>{totalPlayers}</Text>
                </View>
                
                <TouchableOpacity
                  style={[styles.counterButton, totalPlayers >= MAX_PLAYERS && styles.counterButtonDisabled]}
                  onPress={() => changeTotalPlayers('increase')}
                  disabled={totalPlayers >= MAX_PLAYERS}
                >
                  <ChevronRight size={24} color={totalPlayers >= MAX_PLAYERS ? colors.neutral[300] : colors.primary[500]} />
                </TouchableOpacity>
              </View>
            </View>

            {/* İhtiyaç Duyulan Oyuncu */}
            <View style={styles.playerSection}>
              <Text style={styles.label}>İhtiyaç Duyulan Kişi Sayısı*</Text>
              <View style={styles.counterControl}>
                <TouchableOpacity
                  style={[styles.counterButton, neededPlayers <= 1 && styles.counterButtonDisabled]}
                  onPress={() => changeNeededPlayers('decrease')}
                  disabled={neededPlayers <= 1}
                >
                  <ChevronLeft size={24} color={neededPlayers <= 1 ? colors.neutral[300] : colors.primary[500]} />
                </TouchableOpacity>
                
                <View style={styles.counterDisplay}>
                  <Text style={styles.counterValue}>{neededPlayers}</Text>
                </View>
                
                <TouchableOpacity
                  style={[styles.counterButton, neededPlayers >= totalPlayers - 1 && styles.counterButtonDisabled]}
                  onPress={() => changeNeededPlayers('increase')}
                  disabled={neededPlayers >= totalPlayers - 1}
                >
                  <ChevronRight size={24} color={neededPlayers >= totalPlayers - 1 ? colors.neutral[300] : colors.primary[500]} />
                </TouchableOpacity>
              </View>
              <Text style={styles.hint}>
                Siz dahil {totalPlayers} kişi oynayacak, {neededPlayers} kişi daha lazım
              </Text>
            </View>

            {/* Otomatik İptal Seçeneği */}
            <View style={styles.autoCancelSection}>
              <View style={styles.autoCancelContent}>
                <View style={styles.autoCancelTextContainer}>
                  <Text style={styles.autoCancelTitle}>
                    Buluşmaya yeteli sayıda katılım olmazsa otomatik iptal et
                  </Text>
                  <Text style={styles.autoCancelSubtitle}>
                    Oyuna 2 saat kala kontenjan tamamlanmalıdır.
                  </Text>
                </View>
                <Switch
                  value={autoCancelIfNotFull}
                  onValueChange={setAutoCancelIfNotFull}
                  trackColor={{ false: colors.neutral[300], true: colors.primary[500] }}
                  thumbColor={colors.neutral[0]}
                />
              </View>
            </View>

            <Button title="Kaydet" onPress={handleSave} style={styles.saveButton} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  content: {
    gap: spacing.xl,
  },
  playerSection: {
    gap: spacing.md,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  counterControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  counterButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
  },
  counterButtonDisabled: {
    opacity: 0.5,
  },
  counterDisplay: {
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary[500],
    minWidth: 80,
    alignItems: 'center',
  },
  counterValue: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.primary[500],
  },
  hint: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  autoCancelSection: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
  },
  autoCancelContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  autoCancelTextContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  autoCancelTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  autoCancelSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  saveButton: {
    marginTop: spacing.md,
  },
});

import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { X, MapPin, DollarSign, Calendar, Clock, Check } from 'lucide-react-native';

interface LocationData {
  cityId: string;
  cityName: string;
  districtId: string;
  districtName: string;
  venueId: string;
  venueName: string;
  venueAddress: string;
}

interface LocationTimeMenuModalProps {
  visible: boolean;
  location: LocationData | null;
  hasFee: boolean;
  feeAmount: string;
  startDate: Date | null;
  estimatedDuration: number;
  onClose: () => void;
  onLocationPress: () => void;
  onFeePress: () => void;
  onDateTimePress: () => void;
  onDurationPress: () => void;
}

export default function LocationTimeMenuModal({
  visible,
  location,
  hasFee,
  feeAmount,
  startDate,
  estimatedDuration,
  onClose,
  onLocationPress,
  onFeePress,
  onDateTimePress,
  onDurationPress,
}: LocationTimeMenuModalProps) {
  
  const formatDateTime = (date: Date) => {
    return date.toLocaleString('tr-TR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
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
            <Text style={styles.modalTitle}>Konum ve Zaman</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.menuItems}>
            {/* Konum */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onLocationPress();
                onClose();
              }}
            >
              <View style={styles.menuIcon}>
                <MapPin size={24} color={colors.primary[500]} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Konum*</Text>
                {location ? (
                  <View style={styles.selectedInfo}>
                    <Check size={14} color={colors.success[500]} />
                    <Text style={styles.selectedText}>
                      {location.venueName}, {location.districtName}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.menuHint}>Mekan seçin</Text>
                )}
              </View>
            </TouchableOpacity>

            {/* Oyun Ücreti */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onFeePress();
                onClose();
              }}
            >
              <View style={styles.menuIcon}>
                <DollarSign size={24} color={colors.primary[500]} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Oyun Ücreti</Text>
                {feeAmount ? (
                  <View style={styles.selectedInfo}>
                    <Check size={14} color={colors.success[500]} />
                    <Text style={styles.selectedText}>{feeAmount} TL / kişi</Text>
                  </View>
                ) : (
                  <Text style={styles.menuHint}>İsteğe bağlı</Text>
                )}
              </View>
            </TouchableOpacity>

            {/* Tarih ve Saat */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onDateTimePress();
                onClose();
              }}
            >
              <View style={styles.menuIcon}>
                <Calendar size={24} color={colors.primary[500]} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Tarih ve Saat*</Text>
                {startDate ? (
                  <View style={styles.selectedInfo}>
                    <Check size={14} color={colors.success[500]} />
                    <Text style={styles.selectedText}>{formatDateTime(startDate)}</Text>
                  </View>
                ) : (
                  <Text style={styles.menuHint}>Tarih ve saat seçin</Text>
                )}
              </View>
            </TouchableOpacity>

            {/* Oyun Süresi */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onDurationPress();
                onClose();
              }}
            >
              <View style={styles.menuIcon}>
                <Clock size={24} color={colors.primary[500]} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Oyun Süresi</Text>
                <View style={styles.selectedInfo}>
                  <Check size={14} color={colors.success[500]} />
                  <Text style={styles.selectedText}>{estimatedDuration} dakika</Text>
                </View>
              </View>
            </TouchableOpacity>
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
  menuItems: {
    gap: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  menuTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  menuHint: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  selectedText: {
    fontSize: typography.sizes.sm,
    color: colors.success[500],
    fontWeight: typography.weights.medium,
  },
});

import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import Button from '@/components/Button';
import { Calendar, Clock } from 'lucide-react-native';

interface DateTimeStepProps {
  startDate: Date | null;
  endDate: Date | null;
  onNext: (startDate: Date, endDate: Date) => void;
}

export default function DateTimeStep({ startDate: initialStart, endDate: initialEnd, onNext }: DateTimeStepProps) {
  const [startDate, setStartDate] = useState<Date>(initialStart || new Date());
  const [endDate, setEndDate] = useState<Date>(initialEnd || new Date(Date.now() + 2 * 60 * 60 * 1000));
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const adjustStartTime = (hours: number) => {
    const newDate = new Date(startDate);
    newDate.setHours(newDate.getHours() + hours);
    setStartDate(newDate);

    if (newDate >= endDate) {
      const newEndDate = new Date(newDate);
      newEndDate.setHours(newEndDate.getHours() + 2);
      setEndDate(newEndDate);
    }
  };

  const adjustEndTime = (hours: number) => {
    const newDate = new Date(endDate);
    newDate.setHours(newDate.getHours() + hours);
    if (newDate > startDate) {
      setEndDate(newDate);
    }
  };

  const handleNext = () => {
    if (startDate && endDate && endDate > startDate) {
      onNext(startDate, endDate);
    }
  };

  const isValid = startDate && endDate && endDate > startDate;
  const duration = endDate && startDate ? Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60) * 10) / 10 : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ne zaman oynayacaksınız?</Text>
      <Text style={styles.subtitle}>Tarih ve saat bilgisini girin</Text>

      <View style={styles.form}>
        <View style={styles.section}>
          <Text style={styles.label}>Başlangıç</Text>
          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeCard}>
              <Calendar size={20} color={colors.primary[500]} />
              <Text style={styles.dateTimeText}>{formatDate(startDate)}</Text>
            </View>
          </View>
          <View style={styles.timeControls}>
            <Text style={styles.timeLabel}>Saat:</Text>
            <View style={styles.timeButtonsRow}>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => adjustStartTime(-1)}
              >
                <Text style={styles.timeButtonText}>-1s</Text>
              </TouchableOpacity>
              <View style={styles.timeDisplay}>
                <Clock size={18} color={colors.primary[500]} />
                <Text style={styles.timeText}>{formatTime(startDate)}</Text>
              </View>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => adjustStartTime(1)}
              >
                <Text style={styles.timeButtonText}>+1s</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Bitiş</Text>
          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeCard}>
              <Calendar size={20} color={colors.primary[500]} />
              <Text style={styles.dateTimeText}>{formatDate(endDate)}</Text>
            </View>
          </View>
          <View style={styles.timeControls}>
            <Text style={styles.timeLabel}>Saat:</Text>
            <View style={styles.timeButtonsRow}>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => adjustEndTime(-1)}
              >
                <Text style={styles.timeButtonText}>-1s</Text>
              </TouchableOpacity>
              <View style={styles.timeDisplay}>
                <Clock size={18} color={colors.primary[500]} />
                <Text style={styles.timeText}>{formatTime(endDate)}</Text>
              </View>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => adjustEndTime(1)}
              >
                <Text style={styles.timeButtonText}>+1s</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {duration > 0 && (
          <View style={styles.durationCard}>
            <Text style={styles.durationText}>Oyun Süresi: {duration} saat</Text>
          </View>
        )}

        <Button
          title="Devam Et"
          onPress={handleNext}
          disabled={!isValid}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  form: {
    gap: spacing.lg,
  },
  section: {
    gap: spacing.md,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dateTimeCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  dateTimeText: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
  timeControls: {
    gap: spacing.sm,
  },
  timeLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  timeButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  timeButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 60,
    alignItems: 'center',
  },
  timeButtonText: {
    color: colors.text.inverse,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  timeDisplay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  timeText: {
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
  },
  durationCard: {
    backgroundColor: colors.primary[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  durationText: {
    fontSize: typography.sizes.md,
    color: colors.primary[700],
    fontWeight: typography.weights.semibold,
  },
  button: {
    marginTop: spacing.lg,
  },
});

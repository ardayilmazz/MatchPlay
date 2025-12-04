import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { ChevronDown, X } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

interface DatePickerProps {
  label?: string;
  placeholder?: string;
  value?: string; // YYYY-MM-DD formatında
  onValueChange: (value: string) => void;
  error?: string;
}

const months = [
  { label: 'Ocak', value: '01' },
  { label: 'Şubat', value: '02' },
  { label: 'Mart', value: '03' },
  { label: 'Nisan', value: '04' },
  { label: 'Mayıs', value: '05' },
  { label: 'Haziran', value: '06' },
  { label: 'Temmuz', value: '07' },
  { label: 'Ağustos', value: '08' },
  { label: 'Eylül', value: '09' },
  { label: 'Ekim', value: '10' },
  { label: 'Kasım', value: '11' },
  { label: 'Aralık', value: '12' },
];

// 17 yaşından büyük olmalı - bugünün tarihinden 17 yıl öncesine kadar
const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 17; // En az 17 yaşında olmalı (2008, 2007, ...)
  const maxYear = 1960; // Maksimum 1960 yılı
  const years = [];
  
  for (let year = minYear; year >= maxYear; year--) {
    years.push({ label: year.toString(), value: year.toString() });
  }
  
  return years;
};

// Ayın günlerini hesapla
const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

const getDayOptions = (year: number, month: number) => {
  const daysInMonth = getDaysInMonth(year, month);
  const days = [];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = day.toString().padStart(2, '0');
    days.push({ label: dayStr, value: dayStr });
  }
  
  return days;
};

export default function DatePicker({
  label,
  placeholder = 'Yıl - Ay - Gün',
  value,
  onValueChange,
  error,
}: DatePickerProps) {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);

  const yearOptions = getYearOptions();

  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setSelectedYear(parts[0]);
        setSelectedMonth(parts[1]);
        setSelectedDay(parts[2]);
      }
    }
  }, [value]);

  useEffect(() => {
    if (selectedYear && selectedMonth && selectedDay) {
      const dateString = `${selectedYear}-${selectedMonth}-${selectedDay}`;
      onValueChange(dateString);
    }
  }, [selectedYear, selectedMonth, selectedDay]);

  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
    setShowYearPicker(false);
    // Ay ve gün seçilmişse, günü kontrol et
    if (selectedMonth && selectedDay) {
      const daysInMonth = getDaysInMonth(parseInt(year), parseInt(selectedMonth));
      if (parseInt(selectedDay) > daysInMonth) {
        setSelectedDay(daysInMonth.toString().padStart(2, '0'));
      }
    }
  };

  const handleMonthSelect = (month: string) => {
    setSelectedMonth(month);
    setShowMonthPicker(false);
    // Yıl ve gün seçilmişse, günü kontrol et
    if (selectedYear && selectedDay) {
      const daysInMonth = getDaysInMonth(parseInt(selectedYear), parseInt(month));
      if (parseInt(selectedDay) > daysInMonth) {
        setSelectedDay(daysInMonth.toString().padStart(2, '0'));
      }
    }
  };

  const handleDaySelect = (day: string) => {
    setSelectedDay(day);
    setShowDayPicker(false);
  };

  const getDisplayText = () => {
    if (selectedYear && selectedMonth && selectedDay) {
      const monthName = months.find(m => m.value === selectedMonth)?.label || selectedMonth;
      return `${selectedDay} ${monthName} ${selectedYear}`;
    }
    return placeholder;
  };

  const dayOptions = selectedYear && selectedMonth
    ? getDayOptions(parseInt(selectedYear), parseInt(selectedMonth))
    : [];

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.dateContainer}>
        <TouchableOpacity
          style={[styles.dateButton, !selectedYear && styles.placeholderButton, error && styles.inputError]}
          onPress={() => setShowYearPicker(true)}>
          <Text style={[styles.dateButtonText, !selectedYear && styles.placeholderText]}>
            {selectedYear || 'Yıl'}
          </Text>
          <ChevronDown size={16} color={colors.text.tertiary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dateButton, !selectedMonth && styles.placeholderButton, error && styles.inputError]}
          onPress={() => setShowMonthPicker(true)}
          disabled={!selectedYear}>
          <Text style={[styles.dateButtonText, !selectedMonth && styles.placeholderText]}>
            {selectedMonth ? months.find(m => m.value === selectedMonth)?.label : 'Ay'}
          </Text>
          <ChevronDown size={16} color={colors.text.tertiary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dateButton, !selectedDay && styles.placeholderButton, error && styles.inputError]}
          onPress={() => setShowDayPicker(true)}
          disabled={!selectedYear || !selectedMonth}>
          <Text style={[styles.dateButtonText, !selectedDay && styles.placeholderText]}>
            {selectedDay || 'Gün'}
          </Text>
          <ChevronDown size={16} color={colors.text.tertiary} />
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {/* Yıl Picker Modal */}
      <Modal
        visible={showYearPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowYearPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yıl Seçin</Text>
              <TouchableOpacity onPress={() => setShowYearPicker(false)}>
                <X size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={yearOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.value === selectedYear && styles.selectedOption,
                  ]}
                  onPress={() => handleYearSelect(item.value)}>
                  <Text
                    style={[
                      styles.optionText,
                      item.value === selectedYear && styles.selectedOptionText,
                    ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Ay Picker Modal */}
      <Modal
        visible={showMonthPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMonthPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ay Seçin</Text>
              <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
                <X size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={months}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.value === selectedMonth && styles.selectedOption,
                  ]}
                  onPress={() => handleMonthSelect(item.value)}>
                  <Text
                    style={[
                      styles.optionText,
                      item.value === selectedMonth && styles.selectedOptionText,
                    ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Gün Picker Modal */}
      <Modal
        visible={showDayPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDayPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Gün Seçin</Text>
              <TouchableOpacity onPress={() => setShowDayPicker(false)}>
                <X size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={dayOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.value === selectedDay && styles.selectedOption,
                  ]}
                  onPress={() => handleDaySelect(item.value)}>
                  <Text
                    style={[
                      styles.optionText,
                      item.value === selectedDay && styles.selectedOptionText,
                    ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
  dateContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dateButton: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeholderButton: {
    borderColor: colors.neutral[200],
  },
  inputError: {
    borderColor: colors.error[500],
  },
  dateButtonText: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  placeholderText: {
    color: colors.text.tertiary,
  },
  error: {
    fontSize: typography.sizes.sm,
    color: colors.error[500],
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  option: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  selectedOption: {
    backgroundColor: colors.primary[50],
  },
  optionText: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  selectedOptionText: {
    color: colors.primary[500],
    fontWeight: typography.weights.semibold,
  },
});


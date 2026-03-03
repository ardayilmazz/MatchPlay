import { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { X, MapPin, DollarSign, Calendar, Clock, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react-native';
import Button from '@/components/Button';
import { API_URL } from '@/config/api';
import TimeInputModal from '../TimeInputModal';

interface LocationData {
  cityId: string;
  cityName: string;
  districtId: string;
  districtName: string;
  venueId: string;
  venueName: string;
  venueAddress: string;
}

interface LocationTimeModalProps {
  visible: boolean;
  type: 'location' | 'fee' | 'datetime' | 'duration';
  initialLocation?: LocationData | null;
  initialFee?: { feeAmount: string | number };
  initialDateTime?: Date | null;
  initialDuration?: number;
  onClose: () => void;
  onSave: (data: any) => void;
  onBackToMenu?: () => void; // Konum ve Zaman menüsüne geri dön
}

const DURATIONS = [15, 30, 45, 60, 90, 120];
const HOURS = Array.from({ length: 19 }, (_, i) => i + 6); // 6-24
const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];
const DAYS_OF_WEEK = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export default function LocationTimeModal({
  visible,
  type,
  initialLocation,
  initialFee,
  initialDateTime,
  initialDuration,
  onClose,
  onSave,
  onBackToMenu,
}: LocationTimeModalProps) {
  // Location state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [searching, setSearching] = useState(false);

  // Fee state
  const [feeAmount, setFeeAmount] = useState(
    initialFee?.feeAmount ? String(initialFee.feeAmount) : ''
  );

  // DateTime state
  const [selectedDate, setSelectedDate] = useState<Date>(initialDateTime || new Date());
  const [selectedYear, setSelectedYear] = useState(selectedDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(selectedDate.getMonth());
  const [selectedHour, setSelectedHour] = useState(selectedDate.getHours());
  const [showTimeInputModal, setShowTimeInputModal] = useState(false);

  // initialDateTime değiştiğinde selectedDate'i güncelle
  useEffect(() => {
    if (type === 'datetime' && initialDateTime) {
      const newDate = new Date(initialDateTime);
      setSelectedDate(newDate);
      setSelectedYear(newDate.getFullYear());
      setSelectedMonth(newDate.getMonth());
      setSelectedHour(newDate.getHours());
    }
  }, [initialDateTime, type]);

  // Duration state
  const [duration, setDuration] = useState(initialDuration || 60);

  // Search venues
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await fetch(`${API_URL}/locations/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching venues:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (type === 'location' && searchQuery.length > 0) {
      const delayDebounce = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(delayDebounce);
    }
  }, [searchQuery, type]);

  // Calendar functions
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    
    const days: (number | null)[] = [];
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const isDateSelectable = (day: number) => {
    const date = new Date(selectedYear, selectedMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return date >= today && date <= maxDate;
  };

  const selectDate = (day: number) => {
    if (!isDateSelectable(day)) return;
    // Mevcut saati koru
    const hour = selectedDate ? selectedDate.getHours() : selectedHour;
    const minute = selectedDate ? selectedDate.getMinutes() : 0;
    const newDate = new Date(selectedYear, selectedMonth, day, hour, minute);
    setSelectedDate(newDate);
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    } else {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    }
  };

  const changeDuration = (direction: 'prev' | 'next') => {
    const currentIndex = DURATIONS.indexOf(duration);
    if (direction === 'next' && currentIndex < DURATIONS.length - 1) {
      setDuration(DURATIONS[currentIndex + 1]);
    } else if (direction === 'prev' && currentIndex > 0) {
      setDuration(DURATIONS[currentIndex - 1]);
    }
  };

  const handleSave = () => {
    if (type === 'location') {
      // Location data should be selected from search results
      return; // Don't save, user must select from results
    } else if (type === 'fee') {
      const numericFee = feeAmount.trim() ? parseFloat(feeAmount) : 0;
      onSave({ feeAmount: numericFee });
    } else if (type === 'datetime') {
      // selectedDate zaten saat bilgisini içeriyor
      onSave({ startDate: selectedDate });
    } else if (type === 'duration') {
      onSave({ estimatedDuration: duration });
    }
    
    // Eğer onBackToMenu varsa menüye dön, yoksa modal'ı kapat
    if (onBackToMenu) {
      onBackToMenu();
    } else {
      onClose();
    }
  };

  const renderContent = () => {
    switch (type) {
      case 'location':
        return (
          <View style={styles.locationContent}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Mekan ara (örn: Red Kafe)"
              placeholderTextColor={colors.text.tertiary}
            />
            
            {searching && <Text style={styles.searchingText}>Aranıyor...</Text>}
            
            {searchResults.length > 0 && (
              <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
                {searchResults.map((result, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.resultItem}
                    onPress={() => {
                      onSave(result);
                      if (onBackToMenu) {
                        onBackToMenu();
                      } else {
                        onClose();
                      }
                    }}
                  >
                    <MapPin size={20} color={colors.primary[500]} />
                    <View style={styles.resultTextContainer}>
                      <Text style={styles.resultName}>{result.venueName}</Text>
                      <Text style={styles.resultAddress}>
                        {result.districtName}, {result.cityName}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {searchQuery.length > 0 && !searching && searchResults.length === 0 && (
              <Text style={styles.noResultsText}>Sonuç bulunamadı</Text>
            )}
          </View>
        );

      case 'fee':
        return (
          <View style={styles.feeContent}>
            <Text style={styles.feeLabel}>Kişi Başı Ücret (TL)</Text>
            <TextInput
              style={styles.feeInput}
              value={feeAmount}
              onChangeText={setFeeAmount}
              placeholder="Örn: 100 (Boş = Ücretsiz)"
              placeholderTextColor={colors.text.tertiary}
              keyboardType="numeric"
            />
            <Text style={styles.feeHint}>
              Oyun başına kişi başı ücret girin. Boş bırakırsanız oyun ücretsiz olur.
            </Text>

            <Button title="Kaydet" onPress={handleSave} style={styles.saveButton} />
          </View>
        );

      case 'datetime':
        return (
          <ScrollView style={styles.dateTimeContent} showsVerticalScrollIndicator={false}>
            {/* Month Navigation */}
            <View style={styles.monthHeader}>
              <TouchableOpacity onPress={() => changeMonth('prev')}>
                <ChevronLeft size={24} color={colors.primary[500]} />
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {TURKISH_MONTHS[selectedMonth]} {selectedYear}
              </Text>
              <TouchableOpacity onPress={() => changeMonth('next')}>
                <ChevronRight size={24} color={colors.primary[500]} />
              </TouchableOpacity>
            </View>

            {/* Calendar */}
            <View style={styles.calendar}>
              <View style={styles.weekDays}>
                {DAYS_OF_WEEK.map((day) => (
                  <Text key={day} style={styles.weekDayText}>{day}</Text>
                ))}
              </View>
              <View style={styles.daysGrid}>
                {getCalendarDays().map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayCell,
                      day === null && styles.dayCellEmpty,
                      day !== null && !isDateSelectable(day) && styles.dayCellDisabled,
                      day !== null && day === selectedDate.getDate() && 
                        selectedMonth === selectedDate.getMonth() && 
                        selectedYear === selectedDate.getFullYear() && 
                        styles.dayCellSelected,
                    ]}
                    onPress={() => day && selectDate(day)}
                    disabled={!day || !isDateSelectable(day)}
                  >
                    {day && <Text style={[
                      styles.dayText,
                      !isDateSelectable(day) && styles.dayTextDisabled,
                      day === selectedDate.getDate() && 
                        selectedMonth === selectedDate.getMonth() && 
                        selectedYear === selectedDate.getFullYear() && 
                        styles.dayTextSelected,
                    ]}>{day}</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Saat Seçimi */}
            <View style={styles.timeSection}>
              <Text style={styles.timeLabel}>Başlangıç saati:</Text>
              <View style={styles.timeRow}>
                <Text style={styles.timeDisplay}>
                  {selectedDate.toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowTimeInputModal(true)}
                >
                  <Text style={styles.timeButtonText}>Saat belirle</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Button title="Kaydet" onPress={handleSave} style={styles.saveButton} />
          </ScrollView>
        );

      case 'duration':
        return (
          <View style={styles.durationContent}>
            <View style={styles.durationSelector}>
              <TouchableOpacity
                style={[styles.durationArrow, DURATIONS.indexOf(duration) === 0 && styles.durationArrowDisabled]}
                onPress={() => changeDuration('prev')}
                disabled={DURATIONS.indexOf(duration) === 0}
              >
                <ChevronLeft size={24} color={DURATIONS.indexOf(duration) === 0 ? colors.neutral[300] : colors.primary[500]} />
              </TouchableOpacity>
              
              <View style={styles.durationDisplay}>
                <Text style={styles.durationValue}>{duration} dk</Text>
              </View>
              
              <TouchableOpacity
                style={[styles.durationArrow, DURATIONS.indexOf(duration) === DURATIONS.length - 1 && styles.durationArrowDisabled]}
                onPress={() => changeDuration('next')}
                disabled={DURATIONS.indexOf(duration) === DURATIONS.length - 1}
              >
                <ChevronRight size={24} color={DURATIONS.indexOf(duration) === DURATIONS.length - 1 ? colors.neutral[300] : colors.primary[500]} />
              </TouchableOpacity>
            </View>

            <Button title="Kaydet" onPress={handleSave} style={styles.saveButton} />
          </View>
        );

      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'location': return 'Konum Seç';
      case 'fee': return 'Oyun Ücreti';
      case 'datetime': return 'Tarih ve Saat';
      case 'duration': return 'Oyun Süresi';
      default: return '';
    }
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
            {onBackToMenu && (
              <TouchableOpacity onPress={onBackToMenu} style={styles.backButton}>
                <ArrowLeft size={24} color={colors.primary[500]} />
              </TouchableOpacity>
            )}
            <Text style={styles.modalTitle}>{getTitle()}</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {renderContent()}
        </View>
      </View>

      {/* Saat Input Modal */}
      {type === 'datetime' && (
        <TimeInputModal
          visible={showTimeInputModal}
          initialTime={
            selectedDate
              ? `${selectedDate.getHours().toString().padStart(2, '0')}:${selectedDate.getMinutes().toString().padStart(2, '0')}`
              : undefined
          }
          onClose={() => setShowTimeInputModal(false)}
          onSave={(time) => {
            const [hour, minute] = time.split(':');
            const newDate = new Date(selectedDate);
            newDate.setHours(parseInt(hour), parseInt(minute), 0, 0);
            setSelectedDate(newDate);
            setSelectedHour(parseInt(hour));
            setShowTimeInputModal(false);
          }}
        />
      )}
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
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    marginRight: spacing.sm,
  },
  modalTitle: {
    flex: 1,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  locationContent: {
    gap: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  searchingText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  resultsContainer: {
    maxHeight: 400,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  resultAddress: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  noResultsText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    padding: spacing.lg,
  },
  feeContent: {
    gap: spacing.md,
  },
  feeLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  feeInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  feeHint: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
  },
  dateTimeContent: {
    maxHeight: 500,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  monthTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  calendar: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.sm,
  },
  weekDayText: {
    width: 40,
    textAlign: 'center',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xs,
  },
  dayCellEmpty: {
    opacity: 0,
  },
  dayCellDisabled: {
    opacity: 0.3,
  },
  dayCellSelected: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.full,
  },
  dayText: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  dayTextDisabled: {
    color: colors.neutral[300],
  },
  dayTextSelected: {
    color: colors.background.primary,
    fontWeight: typography.weights.bold,
  },
  hourSelector: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  hourLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  hourScroll: {
    flexGrow: 0,
  },
  hourButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  hourButtonSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  hourText: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  hourTextSelected: {
    color: colors.primary[500],
    fontWeight: typography.weights.semibold,
  },
  durationContent: {
    gap: spacing.lg,
  },
  durationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  durationArrow: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
  },
  durationArrowDisabled: {
    opacity: 0.5,
  },
  durationDisplay: {
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary[500],
    minWidth: 120,
    alignItems: 'center',
  },
  durationValue: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.primary[500],
  },
  saveButton: {
    marginTop: spacing.md,
  },
  timeSection: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  timeLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  timeDisplay: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  timeButton: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  timeButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.background.primary,
  },
});

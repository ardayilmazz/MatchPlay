import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borderRadius } from '@/constants/theme';
import Button from '@/components/Button';
import Picker from '@/components/Picker';
import { MapPin, Clock, Calendar, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { cities, districts, venues } from '@/services/mockData';
import TimeInputModal from './TimeInputModal';

interface LocationTimeStepProps {
  cityId: string;
  districtId: string;
  venueId: string;
  hasFee: boolean;
  feeAmount: string;
  startDate: Date | null;
  estimatedDuration: number;
  expectsFee: boolean; // Oyun genelde ücretli mi?
  onNext: (data: {
    cityId: string;
    cityName: string;
    districtId: string;
    districtName: string;
    venueId: string;
    venueName: string;
    venueAddress: string;
    hasFee: boolean;
    feeAmount: string;
    startDate: Date;
    estimatedDuration: number;
  }) => void;
}

const DURATIONS = [15, 30, 45, 60, 90, 120];
const HOURS = Array.from({ length: 19 }, (_, i) => i + 6); // 6-24 (sabah 6 - gece 12)
const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];
const DAYS_OF_WEEK = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

const formatHour = (hour: number) => {
  if (hour === 24) return '00:00';
  return `${hour}:00`;
};

export default function LocationTimeStep({
  cityId: initialCityId,
  districtId: initialDistrictId,
  venueId: initialVenueId,
  hasFee: initialHasFee,
  feeAmount: initialFeeAmount,
  startDate: initialStartDate,
  estimatedDuration: initialDuration,
  expectsFee,
  onNext,
}: LocationTimeStepProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [cityId, setCityId] = useState(initialCityId);
  const [districtId, setDistrictId] = useState(initialDistrictId);
  const [venueId, setVenueId] = useState(initialVenueId);
  const [hasFee, setHasFee] = useState(initialHasFee || false);
  const [feeAmount, setFeeAmount] = useState(initialFeeAmount || '');
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate);
  const [estimatedDuration, setEstimatedDuration] = useState(initialDuration || 60);
  const [isDurationUnknown, setIsDurationUnknown] = useState(false);
  
  // Takvim için state'ler
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedHour, setSelectedHour] = useState(new Date().getHours() + 2);
  const [selectedMinute, setSelectedMinute] = useState(0);
  
  // Saat input modal için state
  const [showTimeInputModal, setShowTimeInputModal] = useState(false);

  // Şehir seçildiğinde ilçeleri filtrele
  const filteredDistricts = cityId
    ? districts.filter((d) => d.cityId === cityId)
    : [];
  
  // İlçe seçildiğinde mekanları filtrele
  const filteredVenues = districtId
    ? venues.filter((v) => v.districtId === districtId)
    : [];

  // Maksimum tarih (3 ay sonra)
  const getMaxDate = () => {
    const max = new Date();
    max.setMonth(max.getMonth() + 3);
    return max;
  };

  // Ayın gün sayısı
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Takvim günlerini oluştur
  const getCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1; // Pazartesi = 0
    
    const days: (number | null)[] = [];
    
    // Boş günler
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }
    
    // Ayın günleri
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  // Tarih seçilebilir mi kontrol et
  const isDateSelectable = (day: number) => {
    const date = new Date(selectedYear, selectedMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = getMaxDate();
    
    return date >= today && date <= maxDate;
  };

  // Tarih seç
  const selectDate = (day: number) => {
    if (!isDateSelectable(day)) return;
    
    // Eğer daha önce bir tarih seçilmişse saatini koru, yoksa varsayılan saat kullan
    const hour = startDate ? startDate.getHours() : (new Date().getHours() + 2);
    const minute = startDate ? startDate.getMinutes() : 0;
    
    const newDate = new Date(selectedYear, selectedMonth, day, hour, minute);
    setStartDate(newDate);
  };

  // Ay değiştir
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

  // Ay seçilebilir mi
  const isMonthSelectable = (direction: 'prev' | 'next') => {
    const today = new Date();
    const maxDate = getMaxDate();
    
    if (direction === 'prev') {
      const checkDate = new Date(selectedYear, selectedMonth, 1);
      return checkDate > today;
    } else {
      const checkDate = new Date(selectedYear, selectedMonth + 1, 1);
      return checkDate <= maxDate;
    }
  };

  // Süre değiştir
  const changeDuration = (direction: 'prev' | 'next') => {
    const currentIndex = DURATIONS.indexOf(estimatedDuration);
    if (direction === 'next' && currentIndex < DURATIONS.length - 1) {
      setEstimatedDuration(DURATIONS[currentIndex + 1]);
    } else if (direction === 'prev' && currentIndex > 0) {
      setEstimatedDuration(DURATIONS[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (cityId && districtId && venueId && startDate) {
      const city = cities.find((c) => c.id === cityId);
      const district = districts.find((d) => d.id === districtId);
      const venue = venues.find((v) => v.id === venueId);

      onNext({
        cityId,
        cityName: city?.name || '',
        districtId,
        districtName: district?.name || '',
        venueId,
        venueName: venue?.name || '',
        venueAddress: venue?.address || '',
        hasFee,
        feeAmount: hasFee ? feeAmount : '',
        startDate,
        estimatedDuration,
      });
    }
  };

  const isValid = cityId && districtId && venueId && startDate && (!hasFee || (hasFee && feeAmount.trim() !== ''));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Nerede ve ne zaman?</Text>
      <Text style={styles.subtitle}>Buluşma konumu ve zamanını belirleyin</Text>

      <View style={styles.form}>
        {/* Konum */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color={colors.primary[500]} />
            <Text style={styles.sectionTitle}>Konum</Text>
          </View>

          <Picker
            label="Şehir*"
            placeholder="Şehir seçin"
            value={cityId}
            onValueChange={(value) => {
              setCityId(value);
              setDistrictId('');
              setVenueId('');
            }}
            options={cities.map((c) => ({ label: c.name, value: c.id }))}
          />

          {cityId && (
            <Picker
              label="İlçe*"
              placeholder="İlçe seçin"
              value={districtId}
              onValueChange={(value) => {
                setDistrictId(value);
                setVenueId('');
              }}
              options={filteredDistricts.map((d) => ({ label: d.name, value: d.id }))}
            />
          )}

          {districtId && (
            <Picker
              label="Mekan*"
              placeholder="Mekan seçin"
              value={venueId}
              onValueChange={setVenueId}
              options={filteredVenues.map((v) => ({ label: v.name, value: v.id }))}
            />
          )}
        </View>

        {/* Ücret Bilgisi */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <DollarSign size={20} color={colors.primary[500]} />
            <Text style={styles.sectionTitle}>Oyun Ücreti</Text>
          </View>
          
          <TouchableOpacity
            style={styles.feeToggle}
            onPress={() => {
              setHasFee(!hasFee);
              if (hasFee) setFeeAmount('');
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, hasFee && styles.checkboxChecked]}>
              {hasFee && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.feeToggleText}>Bu oyun ücretli</Text>
          </TouchableOpacity>

          {hasFee && (
            <View style={styles.feeInputContainer}>
              <TextInput
                style={styles.feeInput}
                value={feeAmount}
                onChangeText={setFeeAmount}
                placeholder="Kişi başı ücret (TL)"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="numeric"
              />
              <Text style={styles.feeHint}>
                Örn: 100 (Kişi başı 100 TL)
              </Text>
            </View>
          )}
        </View>

        {/* Tarih ve Saat */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={colors.primary[500]} />
            <Text style={styles.sectionTitle}>Tarih ve Saat</Text>
          </View>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar size={20} color={colors.text.secondary} />
            <Text style={styles.dateButtonText}>
              {startDate
                ? startDate.toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Tarih seçin'}
            </Text>
          </TouchableOpacity>

          {startDate && (
            <View style={styles.timeSection}>
              <Text style={styles.timeLabel}>Başlangıç saati:</Text>
              <View style={styles.timeRow}>
                <Text style={styles.timeDisplay}>
                  {startDate.toLocaleTimeString('tr-TR', {
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
          )}
        </View>

        {/* Süre */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color={colors.primary[500]} />
            <Text style={styles.sectionTitle}>Oyun Süresi</Text>
          </View>
          
          <View style={styles.durationControls}>
            <View style={styles.durationSelector}>
              <TouchableOpacity
                style={[styles.durationArrow, DURATIONS.indexOf(estimatedDuration) === 0 && styles.durationArrowDisabled]}
                onPress={() => changeDuration('prev')}
                disabled={DURATIONS.indexOf(estimatedDuration) === 0 || isDurationUnknown}
              >
                <ChevronLeft size={24} color={DURATIONS.indexOf(estimatedDuration) === 0 || isDurationUnknown ? colors.neutral[300] : colors.primary[500]} />
              </TouchableOpacity>
              
              <View style={[styles.durationDisplay, isDurationUnknown && styles.durationDisplayDisabled]}>
                <Text style={[styles.durationValue, isDurationUnknown && styles.durationValueDisabled]}>
                  {estimatedDuration} dk
                </Text>
              </View>
              
              <TouchableOpacity
                style={[styles.durationArrow, DURATIONS.indexOf(estimatedDuration) === DURATIONS.length - 1 && styles.durationArrowDisabled]}
                onPress={() => changeDuration('next')}
                disabled={DURATIONS.indexOf(estimatedDuration) === DURATIONS.length - 1 || isDurationUnknown}
              >
                <ChevronRight size={24} color={DURATIONS.indexOf(estimatedDuration) === DURATIONS.length - 1 || isDurationUnknown ? colors.neutral[300] : colors.primary[500]} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.unknownDurationButton, isDurationUnknown && styles.unknownDurationButtonActive]}
              onPress={() => setIsDurationUnknown(!isDurationUnknown)}
              activeOpacity={0.7}
            >
              <Text style={[styles.unknownDurationText, isDurationUnknown && styles.unknownDurationTextActive]}>
                Süre Belirsiz
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Button
          title="Devam Et"
          onPress={handleNext}
          disabled={!isValid}
          style={styles.button}
        />
      </View>

      {/* Tarih Seçici Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => changeMonth('prev')} disabled={!isMonthSelectable('prev')}>
                <ChevronLeft size={24} color={isMonthSelectable('prev') ? colors.primary[500] : colors.neutral[300]} />
              </TouchableOpacity>
              
              <Text style={styles.modalTitle}>
                {TURKISH_MONTHS[selectedMonth]} {selectedYear}
              </Text>
              
              <TouchableOpacity onPress={() => changeMonth('next')} disabled={!isMonthSelectable('next')}>
                <ChevronRight size={24} color={isMonthSelectable('next') ? colors.primary[500] : colors.neutral[300]} />
              </TouchableOpacity>
            </View>

            {/* Takvim */}
            <View style={styles.calendar}>
              {/* Haftanın günleri */}
              <View style={styles.weekDays}>
                {DAYS_OF_WEEK.map((day) => (
                  <Text key={day} style={styles.weekDayText}>{day}</Text>
                ))}
              </View>

              {/* Günler */}
              <View style={styles.daysGrid}>
                {getCalendarDays().map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayCell,
                      day === null && styles.dayCellEmpty,
                      day !== null && !isDateSelectable(day) && styles.dayCellDisabled,
                      day !== null && startDate && 
                        day === startDate.getDate() && 
                        selectedMonth === startDate.getMonth() && 
                        selectedYear === startDate.getFullYear() && 
                        styles.dayCellSelected,
                    ]}
                    onPress={() => day && selectDate(day)}
                    disabled={!day || !isDateSelectable(day)}
                  >
                    {day && (
                      <Text style={[
                        styles.dayText,
                        !isDateSelectable(day) && styles.dayTextDisabled,
                        day === startDate?.getDate() && 
                          selectedMonth === startDate.getMonth() && 
                          selectedYear === startDate.getFullYear() && 
                          styles.dayTextSelected,
                      ]}>
                        {day}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Butonlar */}
            <View style={styles.modalActions}>
              <Button
                title="İptal"
                variant="outline"
                onPress={() => setShowDatePicker(false)}
                style={styles.modalButton}
              />
              <Button
                title="Tamam"
                onPress={() => {
                  // Tarih seçildiyse modal'ı kapat (saat ayrı modal'da seçilecek)
                  setShowDatePicker(false);
                }}
                style={styles.modalButton}
                disabled={!startDate}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Saat Input Modal */}
      <TimeInputModal
        visible={showTimeInputModal}
        initialTime={
          startDate
            ? `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`
            : undefined
        }
        onClose={() => setShowTimeInputModal(false)}
        onSave={(time) => {
          if (startDate) {
            const [hour, minute] = time.split(':');
            const newDate = new Date(startDate);
            newDate.setHours(parseInt(hour), parseInt(minute), 0, 0);
            setStartDate(newDate);
          }
          setShowTimeInputModal(false);
        }}
      />
    </ScrollView>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  form: {
    gap: spacing.xl,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.primary,
  },
  feeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  checkmark: {
    color: colors.text.inverse,
    fontSize: 16,
    fontFamily: typography.fontFamily.bold,
  },
  feeToggleText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
  },
  feeInputContainer: {
    gap: spacing.xs,
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
  durationControls: {
    gap: spacing.md,
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
    minWidth: 100,
    alignItems: 'center',
  },
  durationDisplayDisabled: {
    backgroundColor: colors.neutral[100],
    borderColor: colors.neutral[300],
    opacity: 0.5,
  },
  durationValue: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary[500],
  },
  durationValueDisabled: {
    color: colors.neutral[400],
  },
  unknownDurationButton: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    alignItems: 'center',
  },
  unknownDurationButtonActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  unknownDurationText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
  },
  unknownDurationTextActive: {
    color: colors.primary[500],
    fontFamily: typography.fontFamily.semibold,
  },
  button: {
    marginTop: spacing.lg,
  },
  dateButton: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  dateButtonText: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  timeSection: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  timeLabel: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.medium,
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
    fontFamily: typography.fontFamily.semibold,
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
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral[0],
  },
  hint: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  calendar: {
    gap: spacing.md,
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
    fontFamily: typography.fontFamily.semibold,
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
    fontFamily: typography.fontFamily.bold,
  },
  timeSelector: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  timeSelectorLabel: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.primary,
  },
  timeControls: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
  },
  });
}


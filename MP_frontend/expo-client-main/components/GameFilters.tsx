import { View, Text, StyleSheet, Modal, ScrollView, Pressable, TextInput } from 'react-native';
import { X, Search, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import Button from './Button';
import { gameService, GameType } from '@/services/gameService';

export interface GameFilters {
  // İsim arama
  nameSearch?: string;
  
  // Oyun türü (gameType ID'leri)
  gameTypeIds: string[];
  
  // Konum
  cityId: string | null;
  districtId: string | null;
  maxDistance: number | null; // km cinsinden (2, 5, 10, 20)
  
  // Zaman aralığı
  startDateFrom: Date | null;
  startDateTo: Date | null;
  
  // Doluluk
  availableOnly: boolean; // Sadece yer olan oyunlar
  
  // Cinsiyet tercihi
  genderPreferences: string[]; // 'herkes', 'kizlar', 'erkekler', 'karma_dengeli'
  
  // Yetenek seviyesi
  skillLevels: string[]; // 'ilk_defa', 'az_bilenler', 'orta', 'iyi', 'profesyonel'
  
  // Ücret
  feeType: 'all' | 'free' | 'paid';
}

interface GameFiltersProps {
  visible: boolean;
  onClose: () => void;
  filters: GameFilters;
  onApply: (filters: GameFilters) => void;
  userGender?: 'male' | 'female' | 'other';
}

const DISTANCE_OPTIONS = [
  { label: '2 km', value: 2 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '20 km', value: 20 },
];

const SKILL_LEVELS = [
  { label: 'İlk Defa Oynayacaklar', value: 'ilk_defa' },
  { label: 'Az Çok Bilenler', value: 'az_bilenler' },
  { label: 'Ortalama Oyuncular', value: 'orta' },
  { label: 'İyi Oyuncular', value: 'iyi' },
  { label: 'Profesyonel Oyuncular', value: 'profesyonel' },
];

const GENDER_PREFERENCES = [
  { label: 'Herkes Katılabilir', value: 'herkes' },
  { label: 'Sadece Kızlar', value: 'kizlar' },
  { label: 'Sadece Erkekler', value: 'erkekler' },
  { label: 'Karma (Dengeli)', value: 'karma_dengeli' },
];

const FEE_TYPES = [
  { label: 'Tümü', value: 'all' },
  { label: 'Ücretsiz', value: 'free' },
  { label: 'Ücretli', value: 'paid' },
];

const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const HOURS = Array.from({ length: 19 }, (_, i) => i + 6); // 6-24

export default function GameFiltersModal({
  visible,
  onClose,
  filters,
  onApply,
  userGender,
}: GameFiltersProps) {
  const [localFilters, setLocalFilters] = useState<GameFilters>(filters);
  const [gameTypes, setGameTypes] = useState<GameType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loadingGameTypes, setLoadingGameTypes] = useState(false);

  // Konum ve Zaman bölümü açık/kapalı
  const [showLocationTimeSection, setShowLocationTimeSection] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');

  // Tarih seçici state'leri
  const [selectingDateType, setSelectingDateType] = useState<'from' | 'to' | null>(null);
  const [tempYear, setTempYear] = useState(new Date().getFullYear());
  const [tempMonth, setTempMonth] = useState(new Date().getMonth());

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    if (visible) {
      loadGameTypes();
    }
  }, [visible]);

  const loadGameTypes = async () => {
    try {
      setLoadingGameTypes(true);
      const types = await gameService.fetchGameTypes();
      setGameTypes(types);
    } catch (error) {
      console.error('Oyun tipleri yüklenirken hata:', error);
    } finally {
      setLoadingGameTypes(false);
    }
  };

  const handleReset = () => {
    // Kullanıcının cinsiyetine göre varsayılan cinsiyet tercihleri
    let defaultGenderPrefs = ['herkes'];
    if (userGender === 'male') {
      defaultGenderPrefs = ['herkes', 'erkekler', 'karma_dengeli'];
    } else if (userGender === 'female') {
      defaultGenderPrefs = ['herkes', 'kizlar', 'karma_dengeli'];
    }
    
    const resetFilters: GameFilters = {
      nameSearch: '',
      gameTypeIds: [],
      cityId: null,
      districtId: null,
      maxDistance: 2,
      startDateFrom: null,
      startDateTo: null,
      availableOnly: true,
      genderPreferences: defaultGenderPrefs,
      skillLevels: [],
      feeType: 'all',
    };
    setLocalFilters(resetFilters);
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const toggleGameType = (gameTypeId: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      gameTypeIds: prev.gameTypeIds.includes(gameTypeId)
        ? prev.gameTypeIds.filter((id) => id !== gameTypeId)
        : [...prev.gameTypeIds, gameTypeId],
    }));
  };

  const toggleSkillLevel = (level: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      skillLevels: prev.skillLevels.includes(level)
        ? prev.skillLevels.filter((l) => l !== level)
        : [...prev.skillLevels, level],
    }));
  };

  const toggleGenderPreference = (pref: string) => {
    setLocalFilters((prev) => {
      const currentPrefs = prev.genderPreferences || [];
      return {
        ...prev,
        genderPreferences: currentPrefs.includes(pref)
          ? currentPrefs.filter((p) => p !== pref)
          : [...currentPrefs, pref],
      };
    });
  };

  // Oyun türü kategorileri
  const categorizedGameTypes = {
    masa_tas: gameTypes.filter((g) => g.category === 'masa_tas'),
    spor: gameTypes.filter((g) => g.category === 'spor'),
    beceri: gameTypes.filter((g) => g.category === 'beceri'),
    kart: gameTypes.filter((g) => g.category === 'kart'),
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      masa_tas: 'Masa & Taş Oyunları',
      spor: 'Spor & Fiziksel Aktiviteler',
      beceri: 'Beceri Oyunları',
      kart: 'Kart Oyunları',
    };
    return labels[category] || category;
  };

  // Tarih seçici fonksiyonları
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getCalendarDays = () => {
    const daysInMonth = getDaysInMonth(tempYear, tempMonth);
    const firstDay = new Date(tempYear, tempMonth, 1).getDay();
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
    const date = new Date(tempYear, tempMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const selectDate = (day: number) => {
    if (!isDateSelectable(day)) return;
    
    const selectedDate = new Date(tempYear, tempMonth, day);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectingDateType === 'from') {
      setLocalFilters((prev) => ({ ...prev, startDateFrom: selectedDate }));
      setSelectingDateType(null);
    } else if (selectingDateType === 'to') {
      selectedDate.setHours(23, 59, 59, 999);
      setLocalFilters((prev) => ({ ...prev, startDateTo: selectedDate }));
      setSelectingDateType(null);
    }
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      if (tempMonth === 11) {
        setTempMonth(0);
        setTempYear(tempYear + 1);
      } else {
        setTempMonth(tempMonth + 1);
      }
    } else {
      if (tempMonth === 0) {
        setTempMonth(11);
        setTempYear(tempYear - 1);
      } else {
        setTempMonth(tempMonth - 1);
      }
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Seç';
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Filtreler</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.text.primary} />
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* 1. Başlık Arama */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lobi Başlığı Ara</Text>
            <View style={styles.searchContainer}>
              <Search size={20} color={colors.text.tertiary} />
              <TextInput
                style={styles.searchInput}
                value={localFilters.nameSearch || ''}
                onChangeText={(text) => setLocalFilters((prev) => ({ ...prev, nameSearch: text }))}
                placeholder="Lobi başlığı ara..."
                placeholderTextColor={colors.text.tertiary}
              />
            </View>
          </View>

          {/* 2. Oyun Türü Seçimi */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Oyun Türü</Text>
            {!selectedCategory ? (
              <Pressable
                style={styles.filterButton}
                onPress={() => setSelectedCategory('menu')}
              >
                <Text style={styles.filterButtonText}>
                  {localFilters.gameTypeIds.length > 0 
                    ? `${localFilters.gameTypeIds.length} oyun seçildi` 
                    : 'Oyun Filtrele'}
                </Text>
              </Pressable>
            ) : (
              <View>
                {selectedCategory === 'menu' ? (
                  <View style={styles.categoryContainer}>
                    {Object.keys(categorizedGameTypes).map((category) => (
                      <Pressable
                        key={category}
                        style={styles.categoryButton}
                        onPress={() => setSelectedCategory(category)}
                      >
                        <Text style={styles.categoryButtonText}>{getCategoryLabel(category)}</Text>
                      </Pressable>
                    ))}
                    <Pressable
                      style={[styles.categoryButton, styles.backCategoryButton]}
                      onPress={() => setSelectedCategory(null)}
                    >
                      <Text style={styles.backButtonText}>← Geri</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View>
                    <Pressable
                      style={styles.backButton}
                      onPress={() => setSelectedCategory('menu')}
                    >
                      <Text style={styles.backButtonText}>← Kategorilere Dön</Text>
                    </Pressable>
                    <View style={styles.chipContainer}>
                      {categorizedGameTypes[selectedCategory as keyof typeof categorizedGameTypes]?.map((gameType) => (
                        <Pressable
                          key={gameType._id}
                          style={[
                            styles.chip,
                            localFilters.gameTypeIds.includes(gameType._id) && styles.chipActive,
                          ]}
                          onPress={() => toggleGameType(gameType._id)}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              localFilters.gameTypeIds.includes(gameType._id) && styles.chipTextActive,
                            ]}
                          >
                            {gameType.name}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* 3. Konum ve Zaman Filtreleme */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Konum ve Zaman</Text>
            <Pressable
              style={styles.filterButton}
              onPress={() => setShowLocationTimeSection(!showLocationTimeSection)}
            >
              <Text style={styles.filterButtonText}>
                {showLocationTimeSection ? 'Kapat' : 'Konum ve Zaman Filtrele'}
              </Text>
            </Pressable>
            
            {showLocationTimeSection && (
              <View style={styles.locationTimeContainer}>
                {/* Konum Arama */}
                <View style={styles.searchContainer}>
                  <Search size={20} color={colors.text.tertiary} />
                  <TextInput
                    style={styles.searchInput}
                    value={locationSearchQuery}
                    onChangeText={(text) => {
                      setLocationSearchQuery(text);
                      // Mekan arama yapınca mesafeyi sıfırla
                      if (text.trim()) {
                        setLocalFilters((prev) => ({ ...prev, maxDistance: null }));
                      }
                    }}
                    placeholder="Mekan ara..."
                    placeholderTextColor={colors.text.tertiary}
                  />
                </View>

                {/* Veya */}
                <View style={styles.orDivider}>
                  <View style={styles.orLine} />
                  <Text style={styles.orText}>veya</Text>
                  <View style={styles.orLine} />
                </View>

                {/* Mesafe Seçenekleri */}
                <Text style={styles.subSectionTitle}>Mesafe Seçin</Text>
                <View style={styles.chipContainer}>
                  {DISTANCE_OPTIONS.map((distance) => (
                    <Pressable
                      key={distance.value}
                      style={[
                        styles.chip,
                        localFilters.maxDistance === distance.value && 
                        !locationSearchQuery.trim() && 
                        styles.chipActive,
                      ]}
                      onPress={() => {
                        setLocalFilters((prev) => ({ ...prev, maxDistance: distance.value }));
                        // Mesafe seçince konum aramasını temizle
                        setLocationSearchQuery('');
                      }}
                      disabled={!!locationSearchQuery.trim()}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          localFilters.maxDistance === distance.value && 
                          !locationSearchQuery.trim() && 
                          styles.chipTextActive,
                          !!locationSearchQuery.trim() && styles.chipTextDisabled,
                        ]}
                      >
                        {distance.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* 4. Zaman Aralığı */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tarih Aralığı</Text>
            
            {selectingDateType ? (
              <View style={styles.calendar}>
                <View style={styles.monthHeader}>
                  <Pressable onPress={() => changeMonth('prev')}>
                    <ChevronLeft size={24} color={colors.secondary[400]} />
                  </Pressable>
                  <Text style={styles.monthTitle}>
                    {TURKISH_MONTHS[tempMonth]} {tempYear}
                  </Text>
                  <Pressable onPress={() => changeMonth('next')}>
                    <ChevronRight size={24} color={colors.secondary[400]} />
                  </Pressable>
                </View>

                <View style={styles.daysGrid}>
                  {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day) => (
                    <Text key={day} style={styles.weekDayText}>{day}</Text>
                  ))}
                </View>

                <View style={styles.daysGrid}>
                  {getCalendarDays().map((day, index) => (
                    <Pressable
                      key={index}
                      style={[
                        styles.dayCell,
                        day === null && styles.dayCellEmpty,
                        day !== null && !isDateSelectable(day) && styles.dayCellDisabled,
                      ]}
                      onPress={() => day && selectDate(day)}
                      disabled={!day || !isDateSelectable(day)}
                    >
                      {day && (
                        <Text style={[
                          styles.dayText,
                          !isDateSelectable(day) && styles.dayTextDisabled,
                        ]}>
                          {day}
                        </Text>
                      )}
                    </Pressable>
                  ))}
                </View>

                <Button
                  title="İptal"
                  variant="outline"
                  onPress={() => setSelectingDateType(null)}
                  style={styles.cancelButton}
                />
              </View>
            ) : (
              <View style={styles.dateRangeContainer}>
                <Pressable
                  style={styles.dateButton}
                  onPress={() => {
                    setSelectingDateType('from');
                    const from = localFilters.startDateFrom || new Date();
                    setTempYear(from.getFullYear());
                    setTempMonth(from.getMonth());
                  }}
                >
                  <Text style={styles.dateButtonLabel}>Başlangıç:</Text>
                  <Text style={styles.dateButtonValue}>{formatDate(localFilters.startDateFrom)}</Text>
                </Pressable>

                <Pressable
                  style={styles.dateButton}
                  onPress={() => {
                    setSelectingDateType('to');
                    const to = localFilters.startDateTo || new Date();
                    setTempYear(to.getFullYear());
                    setTempMonth(to.getMonth());
                  }}
                >
                  <Text style={styles.dateButtonLabel}>Bitiş:</Text>
                  <Text style={styles.dateButtonValue}>{formatDate(localFilters.startDateTo)}</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* 5. Doluluk */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Doluluk Durumu</Text>
            <Pressable
              style={[
                styles.toggleButton,
                localFilters.availableOnly && styles.toggleButtonActive,
              ]}
              onPress={() =>
                setLocalFilters((prev) => ({ ...prev, availableOnly: !prev.availableOnly }))
              }
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  localFilters.availableOnly && styles.toggleButtonTextActive,
                ]}
              >
                Sadece yer olan oyunları göster
              </Text>
            </Pressable>
          </View>

          {/* 6. Cinsiyet Tercihi */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cinsiyet Tercihi</Text>
            <View style={styles.chipContainer}>
              {GENDER_PREFERENCES.map((pref) => (
                <Pressable
                  key={pref.value}
                  style={[
                    styles.chip,
                    (localFilters.genderPreferences || []).includes(pref.value) && styles.chipActive,
                  ]}
                  onPress={() => toggleGenderPreference(pref.value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      (localFilters.genderPreferences || []).includes(pref.value) && styles.chipTextActive,
                    ]}
                  >
                    {pref.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* 7. Yetenek Seviyesi */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Yetenek Seviyesi</Text>
            <View style={styles.chipContainer}>
              {SKILL_LEVELS.map((level) => (
                <Pressable
                  key={level.value}
                  style={[
                    styles.chip,
                    localFilters.skillLevels.includes(level.value) && styles.chipActive,
                  ]}
                  onPress={() => toggleSkillLevel(level.value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      localFilters.skillLevels.includes(level.value) && styles.chipTextActive,
                    ]}
                  >
                    {level.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Ücret (Bonus) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ücret</Text>
            <View style={styles.chipContainer}>
              {FEE_TYPES.map((fee) => (
                <Pressable
                  key={fee.value}
                  style={[
                    styles.chip,
                    localFilters.feeType === fee.value && styles.chipActive,
                  ]}
                  onPress={() =>
                    setLocalFilters((prev) => ({ ...prev, feeType: fee.value as any }))
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      localFilters.feeType === fee.value && styles.chipTextActive,
                    ]}
                  >
                    {fee.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Sıfırla"
            onPress={handleReset}
            variant="outline"
            style={styles.resetButton}
          />
          <Button title="Uygula" onPress={handleApply} style={styles.applyButton} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  title: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    padding: 0,
  },
  categoryContainer: {
    gap: spacing.sm,
  },
  categoryButton: {
    padding: spacing.md,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  categoryButtonText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.secondary[400],
    textAlign: 'center',
  },
  backButton: {
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  backButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.secondary[400],
  },
  filterButton: {
    padding: spacing.md,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  filterButtonText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.secondary[400],
    textAlign: 'center',
  },
  backCategoryButton: {
    backgroundColor: colors.neutral[100],
    borderColor: colors.neutral[300],
  },
  locationTimeContainer: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral[300],
  },
  orText: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    paddingHorizontal: spacing.sm,
  },
  subSectionTitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  chipTextDisabled: {
    color: colors.neutral[300],
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  chipActive: {
    backgroundColor: colors.secondary[400],
    borderColor: colors.secondary[400],
  },
  chipText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  chipTextActive: {
    color: colors.neutral[0],
    fontFamily: typography.fontFamily.medium,
  },
  dateRangeContainer: {
    gap: spacing.sm,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  dateButtonLabel: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  dateButtonValue: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
  },
  calendar: {
    gap: spacing.md,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  monthTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  weekDayText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.secondary,
    paddingVertical: spacing.xs,
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
  dayText: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  dayTextDisabled: {
    color: colors.neutral[300],
  },
  cancelButton: {
    marginTop: spacing.sm,
  },
  toggleButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  toggleButtonActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.secondary[400],
  },
  toggleButtonText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  toggleButtonTextActive: {
    color: colors.secondary[400],
    fontFamily: typography.fontFamily.medium,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  resetButton: {
    flex: 1,
  },
  applyButton: {
    flex: 2,
  },
});

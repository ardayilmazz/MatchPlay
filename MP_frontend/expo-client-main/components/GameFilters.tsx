import { View, Text, StyleSheet, Modal, ScrollView, Pressable } from 'react-native';
import { X, SlidersHorizontal } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { sports, cities, districts, gameSkillLevels } from '@/services/mockData';
import Button from './Button';
import Picker from './Picker';

export interface GameFilters {
  sportIds: string[];
  cityId: string | null;
  districtId: string | null;
  skillLevels: string[];
  maxDistance: number;
  dateRange: 'today' | 'tomorrow' | 'week' | 'all';
  onlyAvailable: boolean;
  instantGames: boolean;
}

interface GameFiltersProps {
  visible: boolean;
  onClose: () => void;
  filters: GameFilters;
  onApply: (filters: GameFilters) => void;
  hasLocationPermission: boolean;
}

export default function GameFiltersModal({
  visible,
  onClose,
  filters,
  onApply,
  hasLocationPermission,
}: GameFiltersProps) {
  const [localFilters, setLocalFilters] = useState<GameFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const availableCities = cities.map((city) => ({
    label: city.name,
    value: city.id,
  }));

  const availableDistricts = localFilters.cityId
    ? districts
        .filter((d) => d.cityId === localFilters.cityId)
        .map((d) => ({ label: d.name, value: d.id }))
    : [];

  const sportOptions = sports.map((sport) => ({
    label: sport.name,
    value: sport.id,
  }));

  const skillLevelOptions = gameSkillLevels.map((level) => ({
    label: level.label,
    value: level.value,
  }));

  const dateRangeOptions = [
    { label: 'Bugün', value: 'today' },
    { label: 'Yarın', value: 'tomorrow' },
    { label: 'Bu Hafta', value: 'week' },
    { label: 'Tüm Zamanlar', value: 'all' },
  ];

  const distanceOptions = [
    { label: '500m', value: 0.5 },
    { label: '1km', value: 1 },
    { label: '2km', value: 2 },
    { label: '5km', value: 5 },
    { label: '10km', value: 10 },
    { label: '20km', value: 20 },
  ];

  const handleReset = () => {
    const resetFilters: GameFilters = {
      sportIds: [],
      cityId: null,
      districtId: null,
      skillLevels: [],
      maxDistance: 2,
      dateRange: 'today',
      onlyAvailable: false,
      instantGames: false,
    };
    setLocalFilters(resetFilters);
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const toggleSport = (sportId: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      sportIds: prev.sportIds.includes(sportId)
        ? prev.sportIds.filter((id) => id !== sportId)
        : [...prev.sportIds, sportId],
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
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Anlık Oyunlar</Text>
            </View>
            <Pressable
              style={[
                styles.toggleButton,
                localFilters.instantGames && styles.toggleButtonActive,
              ]}
              onPress={() =>
                setLocalFilters((prev) => ({ ...prev, instantGames: !prev.instantGames }))
              }
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  localFilters.instantGames && styles.toggleButtonTextActive,
                ]}
              >
                2 saat içinde başlayan oyunları göster (1km)
              </Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Spor Türü</Text>
            <View style={styles.chipContainer}>
              {sportOptions.map((sport) => (
                <Pressable
                  key={sport.value}
                  style={[
                    styles.chip,
                    localFilters.sportIds.includes(sport.value) && styles.chipActive,
                  ]}
                  onPress={() => toggleSport(sport.value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      localFilters.sportIds.includes(sport.value) && styles.chipTextActive,
                    ]}
                  >
                    {sport.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {!hasLocationPermission && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Konum</Text>
              <View style={styles.locationPickers}>
                <View style={styles.pickerWrapper}>
                  <Picker
                    label="Şehir"
                    value={localFilters.cityId || ''}
                    onValueChange={(value) =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        cityId: value,
                        districtId: null,
                      }))
                    }
                    options={[{ label: 'Tümü', value: '' }, ...availableCities]}
                  />
                </View>
                {localFilters.cityId && (
                  <View style={styles.pickerWrapper}>
                    <Picker
                      label="İlçe"
                      value={localFilters.districtId || ''}
                      onValueChange={(value) =>
                        setLocalFilters((prev) => ({ ...prev, districtId: value }))
                      }
                      options={[{ label: 'Tümü', value: '' }, ...availableDistricts]}
                    />
                  </View>
                )}
              </View>
            </View>
          )}

          {hasLocationPermission && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mesafe</Text>
              <View style={styles.chipContainer}>
                {distanceOptions.map((distance) => (
                  <Pressable
                    key={distance.value}
                    style={[
                      styles.chip,
                      localFilters.maxDistance === distance.value && styles.chipActive,
                    ]}
                    onPress={() =>
                      setLocalFilters((prev) => ({ ...prev, maxDistance: distance.value }))
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        localFilters.maxDistance === distance.value && styles.chipTextActive,
                      ]}
                    >
                      {distance.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Zaman</Text>
            <View style={styles.chipContainer}>
              {dateRangeOptions.map((range) => (
                <Pressable
                  key={range.value}
                  style={[
                    styles.chip,
                    localFilters.dateRange === range.value && styles.chipActive,
                  ]}
                  onPress={() =>
                    setLocalFilters((prev) => ({ ...prev, dateRange: range.value as any }))
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      localFilters.dateRange === range.value && styles.chipTextActive,
                    ]}
                  >
                    {range.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Yetenek Seviyesi</Text>
            <View style={styles.chipContainer}>
              {skillLevelOptions.map((level) => (
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

          <View style={styles.section}>
            <Pressable
              style={[
                styles.toggleButton,
                localFilters.onlyAvailable && styles.toggleButtonActive,
              ]}
              onPress={() =>
                setLocalFilters((prev) => ({ ...prev, onlyAvailable: !prev.onlyAvailable }))
              }
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  localFilters.onlyAvailable && styles.toggleButtonTextActive,
                ]}
              >
                Sadece müsait oyunları göster
              </Text>
            </Pressable>
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
    fontWeight: typography.weights.bold,
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
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
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
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  chipText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  chipTextActive: {
    color: colors.neutral[0],
    fontWeight: typography.weights.medium,
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
    borderColor: colors.primary[500],
  },
  toggleButtonText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  toggleButtonTextActive: {
    color: colors.primary[500],
    fontWeight: typography.weights.medium,
  },
  locationPickers: {
    gap: spacing.md,
  },
  pickerWrapper: {
    flex: 1,
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

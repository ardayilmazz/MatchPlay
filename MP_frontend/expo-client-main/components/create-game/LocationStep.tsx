import { useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { cities, districts, venues } from '@/services/mockData';
import Picker from '@/components/Picker';
import Button from '@/components/Button';

interface LocationStepProps {
  cityId: string;
  districtId: string;
  venueId: string;
  onNext: (data: {
    cityId: string;
    cityName: string;
    districtId: string;
    districtName: string;
    venueId: string;
    venueName: string;
    venueAddress: string;
  }) => void;
}

export default function LocationStep({
  cityId: initialCityId,
  districtId: initialDistrictId,
  venueId: initialVenueId,
  onNext,
}: LocationStepProps) {
  const [selectedCityId, setSelectedCityId] = useState(initialCityId);
  const [selectedDistrictId, setSelectedDistrictId] = useState(initialDistrictId);
  const [selectedVenueId, setSelectedVenueId] = useState(initialVenueId);

  const filteredDistricts = useMemo(() => {
    if (!selectedCityId) return [];
    return districts.filter((d) => d.cityId === selectedCityId);
  }, [selectedCityId]);

  const filteredVenues = useMemo(() => {
    if (!selectedDistrictId) return [];
    return venues.filter((v) => v.districtId === selectedDistrictId);
  }, [selectedDistrictId]);

  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);
    setSelectedDistrictId('');
    setSelectedVenueId('');
  };

  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrictId(districtId);
    setSelectedVenueId('');
  };

  const handleNext = () => {
    const city = cities.find((c) => c.id === selectedCityId);
    const district = districts.find((d) => d.id === selectedDistrictId);
    const venue = venues.find((v) => v.id === selectedVenueId);

    if (city && district && venue) {
      onNext({
        cityId: city.id,
        cityName: city.name,
        districtId: district.id,
        districtName: district.name,
        venueId: venue.id,
        venueName: venue.name,
        venueAddress: venue.address,
      });
    }
  };

  const isValid = selectedCityId && selectedDistrictId && selectedVenueId;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nerede oynayacaksınız?</Text>
      <Text style={styles.subtitle}>Oyun konumunu seçin</Text>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>İl</Text>
          <Picker
            options={cities.map((c) => ({ label: c.name, value: c.id }))}
            value={selectedCityId}
            onValueChange={handleCityChange}
            placeholder="İl seçin"
          />
        </View>

        {selectedCityId && (
          <View style={styles.field}>
            <Text style={styles.label}>İlçe</Text>
            <Picker
              options={filteredDistricts.map((d) => ({ label: d.name, value: d.id }))}
              value={selectedDistrictId}
              onValueChange={handleDistrictChange}
              placeholder="İlçe seçin"
            />
          </View>
        )}

        {selectedDistrictId && (
          <View style={styles.field}>
            <Text style={styles.label}>Mekan</Text>
            <Picker
              options={filteredVenues.map((v) => ({
                label: `${v.name} - ${v.address}`,
                value: v.id,
              }))}
              value={selectedVenueId}
              onValueChange={setSelectedVenueId}
              placeholder="Mekan seçin"
            />
            {selectedVenueId && (
              <Text style={styles.venueInfo}>
                {venues.find((v) => v.id === selectedVenueId)?.type === 'indoor'
                  ? 'Kapalı alan'
                  : venues.find((v) => v.id === selectedVenueId)?.type === 'outdoor'
                  ? 'Açık alan'
                  : 'Kapalı & Açık alan'}
              </Text>
            )}
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
    gap: spacing.lg,
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.primary,
  },
  venueInfo: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  button: {
    marginTop: spacing.lg,
  },
});

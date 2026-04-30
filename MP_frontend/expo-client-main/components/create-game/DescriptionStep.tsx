import { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import Button from '@/components/Button';
import { FileText } from 'lucide-react-native';

interface DescriptionStepProps {
  description: string;
  onNext: (description: string) => void;
}

const SUGGESTIONS = [
  'Kendi topunuzu getirin',
  'Su şişesi yanınızda olsun',
  'Spor kıyafeti gerekli',
  'Her seviyeden oyuncu katılabilir',
  'Rekabetçi oyun olacak',
  'Eğlenmek için oynuyoruz',
];

export default function DescriptionStep({ description: initialDescription, onNext }: DescriptionStepProps) {
  const [description, setDescription] = useState(initialDescription);

  const addSuggestion = (suggestion: string) => {
    if (description) {
      setDescription(description + '\n• ' + suggestion);
    } else {
      setDescription('• ' + suggestion);
    }
  };

  const handleNext = () => {
    onNext(description.trim());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Eklemek istediğiniz notlar var mı?</Text>
      <Text style={styles.subtitle}>Oyun kuralları, ekipman veya diğer önemli bilgiler</Text>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <View style={styles.inputHeader}>
            <FileText size={20} color={colors.text.secondary} />
            <Text style={styles.label}>Açıklama (İsteğe Bağlı)</Text>
          </View>
          <TextInput
            style={styles.textInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Örn: Kendi topunuzu getirin. Her seviyeden oyuncu katılabilir."
            placeholderTextColor={colors.text.tertiary}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.charCount}>{description.length}/500</Text>
        </View>

        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Hızlı Ekle:</Text>
          <View style={styles.suggestions}>
            {SUGGESTIONS.map((suggestion, index) => (
              <Button
                key={index}
                title={suggestion}
                variant="outline"
                onPress={() => addSuggestion(suggestion)}
                style={styles.suggestionButton}
              />
            ))}
          </View>
        </View>

        <Button
          title="Devam Et"
          onPress={handleNext}
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
    gap: spacing.xl,
  },
  inputContainer: {
    gap: spacing.sm,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.primary,
  },
  textInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  charCount: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    textAlign: 'right',
  },
  suggestionsContainer: {
    gap: spacing.sm,
  },
  suggestionsTitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  suggestionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  button: {
    marginTop: spacing.lg,
  },
});

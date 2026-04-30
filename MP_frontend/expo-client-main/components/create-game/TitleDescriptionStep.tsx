import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import Button from '@/components/Button';
import { FileText, Hash } from 'lucide-react-native';

interface TitleDescriptionStepProps {
  title: string;
  description: string;
  tags: string[];
  onNext: (title: string, description: string, tags: string[]) => void;
}

const AVAILABLE_TAGS = [
  '#Eğlencesine',
  '#İddialı',
  '#Turnuva',
  '#AcemiDostu',
  '#SohbetMuhabbet',
];

export default function TitleDescriptionStep({
  title: initialTitle,
  description: initialDescription,
  tags: initialTags,
  onNext,
}: TitleDescriptionStepProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleNext = () => {
    if (title.trim()) {
      onNext(title.trim(), description.trim(), selectedTags);
    }
  };

  const isValid = title.trim().length > 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Oyununuza bir başlık verin</Text>
      <Text style={styles.subtitle}>İnsanların ilgisini çekecek açıklayıcı bir başlık</Text>

      <View style={styles.form}>
        {/* Başlık */}
        <View style={styles.inputContainer}>
          <View style={styles.inputHeader}>
            <FileText size={20} color={colors.text.secondary} />
            <Text style={styles.label}>Başlık*</Text>
          </View>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Örn: Kadıköy'de satranç turnuvası"
            placeholderTextColor={colors.text.tertiary}
            maxLength={40}
          />
          <Text style={styles.charCount}>{title.length}/40</Text>
        </View>

        {/* Açıklama */}
        <View style={styles.inputContainer}>
          <View style={styles.inputHeader}>
            <FileText size={20} color={colors.text.secondary} />
            <Text style={styles.label}>Açıklama (İsteğe Bağlı)</Text>
          </View>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            value={description}
            onChangeText={setDescription}
            placeholder="Oyun hakkında daha fazla detay ekleyin..."
            placeholderTextColor={colors.text.tertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={200}
          />
          <Text style={styles.charCount}>{description.length}/200</Text>
        </View>

        {/* Etiketler */}
        <View style={styles.inputContainer}>
          <View style={styles.inputHeader}>
            <Hash size={20} color={colors.text.secondary} />
            <Text style={styles.label}>Etiketler</Text>
          </View>
          <View style={styles.tagsContainer}>
            {AVAILABLE_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tag, isSelected && styles.tagSelected]}
                  onPress={() => toggleTag(tag)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {selectedTags.length > 0 && (
            <Text style={styles.hint}>
              {selectedTags.length} etiket seçildi
            </Text>
          )}
        </View>

        <Button
          title="Devam Et"
          onPress={handleNext}
          disabled={!isValid}
          style={styles.button}
        />
      </View>
    </ScrollView>
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
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  multilineInput: {
    minHeight: 100,
  },
  charCount: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    textAlign: 'right',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
  },
  tagSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  tagText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },
  tagTextSelected: {
    color: colors.primary[500],
    fontFamily: typography.fontFamily.semibold,
  },
  hint: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
  },
  button: {
    marginTop: spacing.lg,
  },
});


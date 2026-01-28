import { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { X } from 'lucide-react-native';
import Button from '@/components/Button';

interface TitleDescriptionModalProps {
  visible: boolean;
  initialTitle?: string;
  initialDescription?: string;
  initialTags?: string[];
  onClose: () => void;
  onSave: (data: { title: string; description: string; tags: string[] }) => void;
}

const SUGGESTED_TAGS = [
  'Eğlenceli',
  'Rekabetçi',
  'Sosyal',
  'Rahat',
  'Yeni başlayanlar için',
  'Deneyimli oyuncular',
  'Hızlı oyun',
  'Uzun oyun',
];

export default function TitleDescriptionModal({
  visible,
  initialTitle,
  initialDescription,
  initialTags,
  onClose,
  onSave,
}: TitleDescriptionModalProps) {
  const [title, setTitle] = useState(initialTitle || '');
  const [description, setDescription] = useState(initialDescription || '');
  const [tags, setTags] = useState<string[]>(initialTags || []);

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleSave = () => {
    onSave({ title, description, tags });
    onClose();
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
            <Text style={styles.modalTitle}>Başlık ve Açıklama</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Başlık */}
            <View style={styles.section}>
              <Text style={styles.label}>Başlık (İsteğe Bağlı)</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Oyun başlığı girin"
                placeholderTextColor={colors.text.tertiary}
              />
              <Text style={styles.hint}>
                Boş bırakırsanız otomatik oluşturulacak
              </Text>
            </View>

            {/* Açıklama */}
            <View style={styles.section}>
              <Text style={styles.label}>Açıklama (İsteğe Bağlı)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Oyun hakkında detaylar ekleyin"
                placeholderTextColor={colors.text.tertiary}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Etiketler */}
            <View style={styles.section}>
              <Text style={styles.label}>Etiketler (İsteğe Bağlı)</Text>
              <View style={styles.tagsGrid}>
                {SUGGESTED_TAGS.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tagButton,
                      tags.includes(tag) && styles.tagButtonSelected,
                    ]}
                    onPress={() => toggleTag(tag)}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        tags.includes(tag) && styles.tagTextSelected,
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Button title="Kaydet" onPress={handleSave} style={styles.saveButton} />
          </ScrollView>
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
    maxHeight: '80%',
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
  scrollView: {
    maxHeight: 500,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tagButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tagButtonSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  tagText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  tagTextSelected: {
    color: colors.primary[500],
    fontWeight: typography.weights.semibold,
  },
  saveButton: {
    marginTop: spacing.md,
  },
});

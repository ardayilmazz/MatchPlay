import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import Button from '@/components/Button';
import Picker from '@/components/Picker';
import { Users, Trophy, Target, Package, ChevronLeft, ChevronRight, Plus, X, Edit2 } from 'lucide-react-native';
import { GameType } from '@/services/gameService';

interface Team {
  id: string;
  name: string;
  playerCount: number;
}

interface TeamPlayersStepProps {
  gameType: GameType;
  totalPlayers: number;
  neededPlayers: number;
  teamAssignment: 'manual' | 'random' | null;
  skillLevel: 'ilk_defa' | 'az_bilenler' | 'orta' | 'iyi' | 'profesyonel';
  hasEquipment: boolean;
  onNext: (data: {
    totalPlayers: number;
    neededPlayers: number;
    teamAssignment: 'manual' | 'random' | null;
    teamCount?: number;
    skillLevel: 'ilk_defa' | 'az_bilenler' | 'orta' | 'iyi' | 'profesyonel';
    hasEquipment: boolean;
  }) => void;
}

const SKILL_LEVELS = [
  { value: 'ilk_defa', label: 'İlk Defa Oynayacaklar', icon: '🌱' },
  { value: 'az_bilenler', label: 'Az Çok Bilenler', icon: '🌿' },
  { value: 'orta', label: 'Ortalama Oyuncular', icon: '🌳' },
  { value: 'iyi', label: 'İyi Oyuncular', icon: '⭐' },
  { value: 'profesyonel', label: 'Profesyonel Oyuncular', icon: '🏆' },
];

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 30;

export default function TeamPlayersStep({
  gameType,
  totalPlayers: initialTotalPlayers,
  neededPlayers: initialNeededPlayers,
  teamAssignment: initialTeamAssignment,
  skillLevel: initialSkillLevel,
  hasEquipment: initialHasEquipment,
  onNext,
}: TeamPlayersStepProps) {
  const [totalPlayers, setTotalPlayers] = useState(
    initialTotalPlayers || MIN_PLAYERS
  );
  const [neededPlayers, setNeededPlayers] = useState(
    initialNeededPlayers || 1
  );
  const [teamAssignment, setTeamAssignment] = useState<'manual' | 'random' | null>(
    initialTeamAssignment || null
  );
  const [skillLevel, setSkillLevel] = useState(initialSkillLevel || 'orta');
  const [hasEquipment, setHasEquipment] = useState(initialHasEquipment || false);
  
  // Takım planlama için state'ler
  const [showTeamPlanner, setShowTeamPlanner] = useState(false);
  const [teams, setTeams] = useState<Team[]>([
    { id: '1', name: 'A Takımı', playerCount: Math.floor(totalPlayers / 2) },
    { id: '2', name: 'B Takımı', playerCount: Math.ceil(totalPlayers / 2) },
  ]);
  const [savedTeams, setSavedTeams] = useState<Team[] | null>(null); // Kaydedilmiş takımlar
  const [tempTeams, setTempTeams] = useState<Team[]>(teams); // Geçici takımlar (modal içinde)
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingTeamName, setEditingTeamName] = useState('');

  // Toplam oyuncu sayısını değiştir
  const changeTotalPlayers = (direction: 'increase' | 'decrease') => {
    if (direction === 'increase' && totalPlayers < MAX_PLAYERS) {
      setTotalPlayers(totalPlayers + 1);
    } else if (direction === 'decrease' && totalPlayers > MIN_PLAYERS) {
      const newTotal = totalPlayers - 1;
      setTotalPlayers(newTotal);
      // İhtiyaç duyulan oyuncu sayısını ayarla
      if (neededPlayers >= newTotal) {
        setNeededPlayers(newTotal - 1);
      }
    }
  };

  // İhtiyaç duyulan oyuncu sayısını değiştir
  const changeNeededPlayers = (direction: 'increase' | 'decrease') => {
    const maxNeeded = totalPlayers - 1;
    if (direction === 'increase' && neededPlayers < maxNeeded) {
      setNeededPlayers(neededPlayers + 1);
    } else if (direction === 'decrease' && neededPlayers > 1) {
      setNeededPlayers(neededPlayers - 1);
    }
  };

  // Takım fonksiyonları
  const addTeam = () => {
    const newTeamLetter = String.fromCharCode(65 + tempTeams.length); // A, B, C, D...
    const newTeam: Team = {
      id: Date.now().toString(),
      name: `${newTeamLetter} Takımı`,
      playerCount: 1,
    };
    setTempTeams([...tempTeams, newTeam]);
  };

  const removeTeam = (teamId: string) => {
    if (tempTeams.length > 2) {
      setTempTeams(tempTeams.filter((t) => t.id !== teamId));
    }
  };

  const updateTeamPlayerCount = (teamId: string, change: number) => {
    setTempTeams(tempTeams.map((team) => {
      if (team.id === teamId) {
        const newCount = Math.max(1, Math.min(totalPlayers, team.playerCount + change));
        return { ...team, playerCount: newCount };
      }
      return team;
    }));
  };

  const startEditingTeam = (teamId: string, currentName: string) => {
    setEditingTeamId(teamId);
    setEditingTeamName(currentName);
  };

  const saveTeamName = () => {
    if (editingTeamId && editingTeamName.trim()) {
      setTempTeams(tempTeams.map((team) =>
        team.id === editingTeamId ? { ...team, name: editingTeamName.trim() } : team
      ));
    }
    setEditingTeamId(null);
    setEditingTeamName('');
  };

  const getTotalTeamPlayers = () => {
    return tempTeams.reduce((sum, team) => sum + team.playerCount, 0);
  };

  // Modal açıldığında geçici takımları ayarla
  const openTeamPlanner = () => {
    if (savedTeams) {
      setTempTeams(JSON.parse(JSON.stringify(savedTeams))); // Deep copy
    } else {
      setTempTeams([
        { id: '1', name: 'A Takımı', playerCount: Math.floor(totalPlayers / 2) },
        { id: '2', name: 'B Takımı', playerCount: Math.ceil(totalPlayers / 2) },
      ]);
    }
    setShowTeamPlanner(true);
  };

  // Takımları kaydet
  const saveTeamPlanning = () => {
    setSavedTeams(JSON.parse(JSON.stringify(tempTeams))); // Deep copy
    setTeams(tempTeams);
    setShowTeamPlanner(false);
  };

  // İptal et
  const cancelTeamPlanning = () => {
    setShowTeamPlanner(false);
    setEditingTeamId(null);
    setEditingTeamName('');
  };

  // Takım planlaması buton metni
  const getTeamPlannerButtonText = () => {
    if (savedTeams) {
      return `Takım Planlamasını Düzenle - ${savedTeams.length} Takım`;
    }
    return 'Takım Planlaması Yap';
  };

  const handleNext = () => {
    onNext({
      totalPlayers,
      neededPlayers,
      teamAssignment: gameType.hasTeams ? teamAssignment : null,
      teamCount: gameType.hasTeams && savedTeams ? savedTeams.length : undefined,
      skillLevel,
      hasEquipment: gameType.requiresEquipment ? hasEquipment : false,
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Ekip ayarları</Text>
      <Text style={styles.subtitle}>Oyuncu sayısı ve yetenek seviyesi</Text>

      <View style={styles.form}>
        {/* Oyuncu Sayısı */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={20} color={colors.primary[500]} />
            <Text style={styles.sectionTitle}>Oyuncular</Text>
          </View>

          {/* Toplam Oyuncu Sayısı */}
          <View style={styles.playerCountContainer}>
            <Text style={styles.playerCountLabel}>Toplam Oyuncu Sayısı*</Text>
            <View style={styles.counterControl}>
              <TouchableOpacity
                style={[styles.counterButton, totalPlayers <= MIN_PLAYERS && styles.counterButtonDisabled]}
                onPress={() => changeTotalPlayers('decrease')}
                disabled={totalPlayers <= MIN_PLAYERS}
              >
                <ChevronLeft size={24} color={totalPlayers <= MIN_PLAYERS ? colors.neutral[300] : colors.primary[500]} />
              </TouchableOpacity>
              
              <View style={styles.counterDisplay}>
                <Text style={styles.counterValue}>{totalPlayers}</Text>
              </View>
              
              <TouchableOpacity
                style={[styles.counterButton, totalPlayers >= MAX_PLAYERS && styles.counterButtonDisabled]}
                onPress={() => changeTotalPlayers('increase')}
                disabled={totalPlayers >= MAX_PLAYERS}
              >
                <ChevronRight size={24} color={totalPlayers >= MAX_PLAYERS ? colors.neutral[300] : colors.primary[500]} />
              </TouchableOpacity>
            </View>
          </View>

          {/* İhtiyaç Duyulan Oyuncu Sayısı */}
          <View style={styles.playerCountContainer}>
            <Text style={styles.playerCountLabel}>İhtiyaç Duyulan Kişi Sayısı*</Text>
            <View style={styles.counterControl}>
              <TouchableOpacity
                style={[styles.counterButton, neededPlayers <= 1 && styles.counterButtonDisabled]}
                onPress={() => changeNeededPlayers('decrease')}
                disabled={neededPlayers <= 1}
              >
                <ChevronLeft size={24} color={neededPlayers <= 1 ? colors.neutral[300] : colors.primary[500]} />
              </TouchableOpacity>
              
              <View style={styles.counterDisplay}>
                <Text style={styles.counterValue}>{neededPlayers}</Text>
              </View>
              
              <TouchableOpacity
                style={[styles.counterButton, neededPlayers >= totalPlayers - 1 && styles.counterButtonDisabled]}
                onPress={() => changeNeededPlayers('increase')}
                disabled={neededPlayers >= totalPlayers - 1}
              >
                <ChevronRight size={24} color={neededPlayers >= totalPlayers - 1 ? colors.neutral[300] : colors.primary[500]} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.hint}>
            Siz dahil {totalPlayers} kişi oynayacak, {neededPlayers} kişi daha lazım
          </Text>
        </View>

        {/* Takım Sistemi (sadece takım oyunları için) */}
        {gameType.hasTeams && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Trophy size={20} color={colors.primary[500]} />
              <Text style={styles.sectionTitle}>Takım Planlaması</Text>
            </View>

            <TouchableOpacity
              style={[styles.teamPlannerButton, savedTeams && styles.teamPlannerButtonActive]}
              onPress={openTeamPlanner}
              activeOpacity={0.7}
            >
              <Trophy size={20} color={savedTeams ? colors.primary[500] : colors.text.secondary} />
              <Text style={[styles.teamPlannerButtonText, savedTeams && styles.teamPlannerButtonTextActive]}>
                {getTeamPlannerButtonText()}
              </Text>
            </TouchableOpacity>

            {savedTeams && (
              <Text style={styles.hint}>
                {savedTeams.length} takım planlaması kaydedildi
              </Text>
            )}
          </View>
        )}

        {/* Yetenek Seviyesi */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Target size={20} color={colors.primary[500]} />
            <Text style={styles.sectionTitle}>Yetenek Seviyesi</Text>
          </View>

          <View style={styles.skillGrid}>
            {SKILL_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.skillCard,
                  skillLevel === level.value && styles.skillCardSelected,
                ]}
                onPress={() => setSkillLevel(level.value as any)}
                activeOpacity={0.7}
              >
                <Text style={styles.skillIcon}>{level.icon}</Text>
                <Text
                  style={[
                    styles.skillLabel,
                    skillLevel === level.value && styles.skillLabelSelected,
                  ]}
                >
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Ekipman (sadece ekipman gerektiren oyunlar için) */}
        {gameType.requiresEquipment && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Package size={20} color={colors.primary[500]} />
              <Text style={styles.sectionTitle}>Ekipman</Text>
            </View>

            <Text style={styles.equipmentQuestion}>
              Oyun için gerekli ekipmanlara sahip misiniz?
            </Text>
            <Text style={styles.equipmentInfo}>
              Bu oyun için gerekli: {gameType.equipmentDescription}
            </Text>

            <View style={styles.equipmentGrid}>
              <TouchableOpacity
                style={[
                  styles.equipmentCard,
                  hasEquipment && styles.equipmentCardSelected,
                ]}
                onPress={() => setHasEquipment(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.equipmentIcon}>✅</Text>
                <Text
                  style={[
                    styles.equipmentLabel,
                    hasEquipment && styles.equipmentLabelSelected,
                  ]}
                >
                  Ekipmanım var
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.equipmentCard,
                  !hasEquipment && styles.equipmentCardSelected,
                ]}
                onPress={() => setHasEquipment(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.equipmentIcon}>❌</Text>
                <Text
                  style={[
                    styles.equipmentLabel,
                    !hasEquipment && styles.equipmentLabelSelected,
                  ]}
                >
                  Ekipmanım yok
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Button title="Devam Et" onPress={handleNext} style={styles.button} />
      </View>

      {/* Takım Planlama Modal */}
      <Modal
        visible={showTeamPlanner}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTeamPlanner(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Takım Planlaması</Text>
              <TouchableOpacity onPress={() => setShowTeamPlanner(false)}>
                <X size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Takımlar */}
              <View style={styles.teamsContainer}>
                {tempTeams.map((team, index) => (
                  <View key={team.id} style={styles.teamItem}>
                    <View style={styles.teamHeader}>
                      {editingTeamId === team.id ? (
                        <View style={styles.teamNameEdit}>
                          <TextInput
                            style={styles.teamNameInput}
                            value={editingTeamName}
                            onChangeText={setEditingTeamName}
                            autoFocus
                            onBlur={saveTeamName}
                            onSubmitEditing={saveTeamName}
                          />
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.teamNameContainer}
                          onPress={() => startEditingTeam(team.id, team.name)}
                        >
                          <Text style={styles.teamName}>{team.name}</Text>
                          <Edit2 size={16} color={colors.text.secondary} />
                        </TouchableOpacity>
                      )}

                      {tempTeams.length > 2 && (
                        <TouchableOpacity
                          style={styles.removeTeamButton}
                          onPress={() => removeTeam(team.id)}
                        >
                          <X size={20} color={colors.error[500]} />
                        </TouchableOpacity>
                      )}
                    </View>

                    <View style={styles.teamPlayerControl}>
                      <Text style={styles.teamPlayerLabel}>Oyuncu Sayısı:</Text>
                      <View style={styles.teamCounterControl}>
                        <TouchableOpacity
                          style={styles.teamCounterButton}
                          onPress={() => updateTeamPlayerCount(team.id, -1)}
                          disabled={team.playerCount <= 1}
                        >
                          <ChevronLeft size={20} color={team.playerCount <= 1 ? colors.neutral[300] : colors.primary[500]} />
                        </TouchableOpacity>
                        
                        <Text style={styles.teamPlayerCount}>{team.playerCount}</Text>
                        
                        <TouchableOpacity
                          style={styles.teamCounterButton}
                          onPress={() => updateTeamPlayerCount(team.id, 1)}
                          disabled={team.playerCount >= totalPlayers}
                        >
                          <ChevronRight size={20} color={team.playerCount >= totalPlayers ? colors.neutral[300] : colors.primary[500]} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* Takım Ekle */}
              <TouchableOpacity style={styles.addTeamButton} onPress={addTeam}>
                <Plus size={20} color={colors.primary[500]} />
                <Text style={styles.addTeamText}>Yeni Takım Ekle</Text>
              </TouchableOpacity>

              {/* Özet */}
              <View style={styles.teamSummary}>
                <Text style={styles.teamSummaryText}>
                  Toplam Takım: {tempTeams.length}
                </Text>
                <Text style={styles.teamSummaryText}>
                  Toplam Oyuncu: {getTotalTeamPlayers()} / {totalPlayers}
                </Text>
              </View>
            </ScrollView>

            {/* Modal Butonları */}
            <View style={styles.modalActions}>
              <Button
                title="İptal"
                variant="outline"
                onPress={cancelTeamPlanning}
                style={styles.modalActionButton}
              />
              <Button
                title="Kaydet"
                onPress={saveTeamPlanning}
                style={styles.modalActionButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  hint: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  teamPlannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.neutral[200],
  },
  teamPlannerButtonActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  teamPlannerButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  teamPlannerButtonTextActive: {
    color: colors.primary[500],
  },
  skillGrid: {
    gap: spacing.sm,
  },
  skillCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  skillCardSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  skillIcon: {
    fontSize: 24,
  },
  skillLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    flex: 1,
  },
  skillLabelSelected: {
    color: colors.primary[500],
    fontWeight: typography.weights.semibold,
  },
  equipmentQuestion: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  equipmentInfo: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  equipmentGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  equipmentCard: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  equipmentCardSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  equipmentIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  equipmentLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  equipmentLabelSelected: {
    color: colors.primary[500],
  },
  button: {
    marginTop: spacing.lg,
  },
  playerCountContainer: {
    gap: spacing.sm,
  },
  playerCountLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  counterControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  counterButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
  },
  counterButtonDisabled: {
    opacity: 0.5,
  },
  counterDisplay: {
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary[500],
    minWidth: 80,
    alignItems: 'center',
  },
  counterValue: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.primary[500],
  },
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
  modalScroll: {
    maxHeight: 400,
  },
  teamsContainer: {
    gap: spacing.md,
  },
  teamItem: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  teamName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  teamNameEdit: {
    flex: 1,
  },
  teamNameInput: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  removeTeamButton: {
    padding: spacing.xs,
  },
  teamPlayerControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamPlayerLabel: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  teamCounterControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  teamCounterButton: {
    padding: spacing.xs,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.sm,
  },
  teamPlayerCount: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary[500],
    minWidth: 40,
    textAlign: 'center',
  },
  addTeamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.primary[500],
    borderStyle: 'dashed',
    marginTop: spacing.md,
  },
  addTeamText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary[500],
  },
  teamSummary: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  teamSummaryText: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  modalActions: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalActionButton: {
    flex: 1,
  },
});


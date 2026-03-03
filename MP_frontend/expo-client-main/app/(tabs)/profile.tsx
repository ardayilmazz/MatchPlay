import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Edit, Clock, Users, ChevronRight, Settings, Calendar, UserCheck, CheckCircle, Star, AlertTriangle } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { authService } from '@/services/authService';

export default function ProfileScreen() {
  const { user, setUser } = useAuth();

  useFocusEffect(
    useCallback(() => {
      const refreshUser = async () => {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      };
      refreshUser();
    }, [])
  );

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleSettings = () => {
    router.push('/(tabs)/settings');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>
          <TouchableOpacity onPress={handleSettings}>
            <Settings size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {user?.profilePhoto ? (
              <Image source={{ uri: user.profilePhoto }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user?.firstName?.[0]?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>

          {user?.university && (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Üniversite</Text>
              <Text style={styles.infoValue}>{user.university}</Text>
            </View>
          )}

          {user?.department && (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Bölüm</Text>
              <Text style={styles.infoValue}>{user.department}</Text>
            </View>
          )}

          {user?.bio && (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Hakkımda</Text>
              <Text style={styles.infoValue}>{user.bio}</Text>
            </View>
          )}

          {user?.sports && user.sports.length > 0 && (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>İlgi Alanları</Text>
              <View style={styles.sportsContainer}>
                {user.sports.map((sport, index) => (
                  <View key={index} style={styles.sportTag}>
                    <Text style={styles.sportText}>{sport}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Edit size={20} color={colors.primary[500]} />
            <Text style={styles.editButtonText}>Profili Düzenle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/my/ratings' as any)}
          >
            <View style={styles.menuItemLeft}>
              <Star size={20} color={colors.primary[500]} />
              <Text style={styles.menuItemText}>Kullanıcı Yorumları</Text>
            </View>
            <ChevronRight size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuTitle}>Oyun Yönetimi</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/my/games' as any)}
          >
            <View style={styles.menuItemLeft}>
              <Calendar size={20} color={colors.primary[500]} />
              <Text style={styles.menuItemText}>Planladığım Oyunlar</Text>
            </View>
            <ChevronRight size={20} color={colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/my/joined-games' as any)}
          >
            <View style={styles.menuItemLeft}>
              <UserCheck size={20} color={colors.primary[500]} />
              <Text style={styles.menuItemText}>Katıldığım Oyunlar</Text>
            </View>
            <ChevronRight size={20} color={colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/my/requests' as any)}
          >
            <View style={styles.menuItemLeft}>
              <Clock size={20} color={colors.primary[500]} />
              <Text style={styles.menuItemText}>İstek Geçmişi</Text>
            </View>
            <ChevronRight size={20} color={colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/my/waitlist' as any)}
          >
            <View style={styles.menuItemLeft}>
              <Users size={20} color={colors.primary[500]} />
              <Text style={styles.menuItemText}>Bekleme Listesi</Text>
            </View>
            <ChevronRight size={20} color={colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/my/completed-games' as any)}
          >
            <View style={styles.menuItemLeft}>
              <CheckCircle size={20} color={colors.primary[500]} />
              <Text style={styles.menuItemText}>Geçmiş Oyunlar</Text>
            </View>
            <ChevronRight size={20} color={colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/my/complaints' as any)}
          >
            <View style={styles.menuItemLeft}>
              <AlertTriangle size={20} color={colors.primary[500]} />
              <Text style={styles.menuItemText}>Şikayetlerim</Text>
            </View>
            <ChevronRight size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  profileSection: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: typography.weights.bold,
    color: colors.primary[500],
  },
  name: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  infoCard: {
    width: '100%',
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  infoLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    fontWeight: typography.weights.medium,
  },
  infoValue: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  sportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  sportTag: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  sportText: {
    fontSize: typography.sizes.sm,
    color: colors.primary[700],
    fontWeight: typography.weights.medium,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
  },
  editButtonText: {
    fontSize: typography.sizes.md,
    color: colors.primary[500],
    fontWeight: typography.weights.semibold,
    marginLeft: spacing.sm,
  },
  menuSection: {
    padding: spacing.lg,
  },
  menuTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral[0],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuItemText: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
});

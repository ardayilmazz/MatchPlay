import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, X } from 'lucide-react-native';
import { spacing, typography, borderRadius } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { useState } from 'react';

export default function SettingsScreen() {
  const { logout } = useAuth();
  const { colors } = useTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutPress = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    await logout();
    router.replace('/auth/welcome');
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    header: {
      padding: spacing.xl,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    headerTitle: {
      fontSize: typography.sizes.xxl,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
    },
    content: {
      padding: spacing.lg,
    },
    section: {
      backgroundColor: colors.background.secondary,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.lg,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.md,
      backgroundColor: colors.primary[900],
      justifyContent: 'center',
      alignItems: 'center',
    },
    settingLabel: {
      fontSize: typography.sizes.md,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.primary,
    },
    logoutButton: {
      borderWidth: 1,
      borderColor: 'rgba(211, 47, 47, 0.45)',
    },
    logoutIconContainer: {
      backgroundColor: 'rgba(211, 47, 47, 0.15)',
    },
    logoutText: {
      color: colors.error[400],
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    modalBackdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: colors.background.secondary,
      borderRadius: borderRadius.xl,
      padding: spacing.xl,
      width: '100%',
      maxWidth: 400,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
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
    modalMessage: {
      fontSize: typography.sizes.md,
      color: colors.text.secondary,
      marginBottom: spacing.xl,
      lineHeight: 22,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: colors.primary[900],
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.12)',
    },
    cancelButtonText: {
      fontSize: typography.sizes.md,
      fontFamily: typography.fontFamily.semibold,
      color: colors.text.primary,
    },
    confirmButton: {
      flex: 1,
      backgroundColor: colors.error[500],
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
    },
    confirmButtonText: {
      fontSize: typography.sizes.md,
      fontFamily: typography.fontFamily.semibold,
      color: colors.neutral[0],
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ayarlar</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <TouchableOpacity style={[styles.settingItem, styles.logoutButton]} onPress={handleLogoutPress}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, styles.logoutIconContainer]}>
                  <LogOut size={24} color={colors.error[400]} />
                </View>
                <Text style={[styles.settingLabel, styles.logoutText]}>Çıkış Yap</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={handleLogoutCancel}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleLogoutCancel}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Çıkış Yap</Text>
              <TouchableOpacity onPress={handleLogoutCancel}>
                <X size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalMessage}>
              Çıkış yapmak istediğinize emin misiniz?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleLogoutCancel}>
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleLogoutConfirm}>
                <Text style={styles.confirmButtonText}>Evet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

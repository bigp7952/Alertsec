import { useApp } from '@/contexts/AppContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Couleurs du thème
const COLORS = {
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  primaryDark: '#1D4ED8',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  critical: '#DC2626',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#1E293B',
  textLight: '#64748B',
  border: '#E2E8F0',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

interface CitizenProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joinDate: Date;
  alertsSent: number;
  alertsResolved: number;
  rating: number;
  status: 'active' | 'verified' | 'pending';
  emergencyContacts: string[];
  preferences: {
    notifications: boolean;
    locationSharing: boolean;
    emergencyMode: boolean;
  };
}

export default function ProfileTabScreen() {
  const { userType, isAuthenticated, logout } = useApp();
  
  // États
  const [citizenProfile, setCitizenProfile] = useState<CitizenProfile | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'settings' | 'history'>('overview');

  // Refs
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Données simulées
  const mockProfile: CitizenProfile = {
    id: 'citizen_1',
    name: 'Jean DEMO',
    email: 'demo@alertesec.fr',
    phone: '+221 77 123 45 67',
    address: 'Dakar, Sénégal',
    joinDate: new Date('2024-01-15'),
    alertsSent: 12,
    alertsResolved: 10,
    rating: 4.7,
    status: 'verified',
    emergencyContacts: ['+221 77 987 65 43', '+221 33 123 45 67'],
    preferences: {
      notifications: true,
      locationSharing: true,
      emergencyMode: false,
    },
  };

  useEffect(() => {
    // Vérifier l'authentification
    if (!isAuthenticated || userType !== 'citizen') {
      Alert.alert(
        'Accès refusé',
        'Cette interface est réservée aux citoyens.',
        [{ text: 'OK', onPress: () => router.replace('/role-selection') }]
      );
      return;
    }

    setCitizenProfile(mockProfile);
    startAnimations();
  }, [isAuthenticated, userType]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/role-selection');
          }
        }
      ]
    );
  };

  const togglePreference = (key: keyof CitizenProfile['preferences']) => {
    if (citizenProfile) {
      setCitizenProfile(prev => ({
        ...prev!,
        preferences: {
          ...prev!.preferences,
          [key]: !prev!.preferences[key],
        },
      }));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Informations personnelles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations personnelles</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nom complet:</Text>
            <Text style={styles.infoValue}>{citizenProfile?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{citizenProfile?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Téléphone:</Text>
            <Text style={styles.infoValue}>{citizenProfile?.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Adresse:</Text>
            <Text style={styles.infoValue}>{citizenProfile?.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Membre depuis:</Text>
            <Text style={styles.infoValue}>{citizenProfile?.joinDate.toLocaleDateString('fr-FR')}</Text>
          </View>
        </View>
      </View>

      {/* Statistiques */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistiques</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.primary + '20' }]}>
              <Ionicons name="alert-circle" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.statValue}>{citizenProfile?.alertsSent}</Text>
            <Text style={styles.statLabel}>Alertes envoyées</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.success + '20' }]}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
            </View>
            <Text style={styles.statValue}>{citizenProfile?.alertsResolved}</Text>
            <Text style={styles.statLabel}>Résolues</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.warning + '20' }]}>
              <Ionicons name="star" size={24} color={COLORS.warning} />
            </View>
            <Text style={styles.statValue}>{citizenProfile?.rating}/5</Text>
            <Text style={styles.statLabel}>Évaluation</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.error + '20' }]}>
              <Ionicons name="shield-checkmark" size={24} color={COLORS.error} />
            </View>
            <Text style={styles.statValue}>
              {citizenProfile?.status === 'verified' ? 'Vérifié' : citizenProfile?.status === 'active' ? 'Actif' : 'En attente'}
            </Text>
            <Text style={styles.statLabel}>Statut</Text>
          </View>
        </View>
      </View>

      {/* Contacts d'urgence */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contacts d'urgence</Text>
        <View style={styles.contactsContainer}>
          {citizenProfile?.emergencyContacts.map((contact, index) => (
            <View key={index} style={styles.contactCard}>
              <Ionicons name="call" size={20} color={COLORS.primary} />
              <Text style={styles.contactText}>{contact}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderSettings = () => (
    <View style={styles.tabContent}>
      {/* Préférences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Préférences</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Notifications</Text>
              <Text style={styles.settingDescription}>Recevoir les notifications d'alertes</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggle,
                citizenProfile?.preferences.notifications && styles.toggleActive,
              ]}
              onPress={() => togglePreference('notifications')}
            >
              <View style={[
                styles.toggleThumb,
                citizenProfile?.preferences.notifications && styles.toggleThumbActive,
              ]} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Partage de localisation</Text>
              <Text style={styles.settingDescription}>Autoriser le partage automatique</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggle,
                citizenProfile?.preferences.locationSharing && styles.toggleActive,
              ]}
              onPress={() => togglePreference('locationSharing')}
            >
              <View style={[
                styles.toggleThumb,
                citizenProfile?.preferences.locationSharing && styles.toggleThumbActive,
              ]} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Mode urgence</Text>
              <Text style={styles.settingDescription}>Activer le mode urgence permanent</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggle,
                citizenProfile?.preferences.emergencyMode && styles.toggleActive,
              ]}
              onPress={() => togglePreference('emergencyMode')}
            >
              <View style={[
                styles.toggleThumb,
                citizenProfile?.preferences.emergencyMode && styles.toggleThumbActive,
              ]} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="pencil" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>Modifier le profil</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="key" size={20} color={COLORS.warning} />
            <Text style={styles.actionText}>Changer le mot de passe</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="help-circle" size={20} color={COLORS.textLight} />
            <Text style={styles.actionText}>Aide et support</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={20} color={COLORS.error} />
            <Text style={[styles.actionText, styles.logoutText]}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderHistory = () => (
    <View style={styles.tabContent}>
      {/* Historique des alertes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historique des alertes</Text>
        <View style={styles.historyContainer}>
          {[1, 2, 3, 4, 5].map((item) => (
            <View key={item} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>Alerte #{item}</Text>
                <Text style={styles.historyDate}>15/03/2024</Text>
              </View>
              <Text style={styles.historyDescription}>
                Incident de circulation - Avenue Bourguiba
              </Text>
              <View style={styles.historyStatus}>
                <View style={[styles.statusBadge, { backgroundColor: COLORS.success + '20' }]}>
                  <Text style={[styles.statusText, { color: COLORS.success }]}>Résolu</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Profil principal */}
      <Animated.View
        style={[
          styles.profileSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }],
          },
        ]}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.profileGradient}
        >
          <View style={styles.profileContent}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={40} color={COLORS.white} />
              </View>
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, { backgroundColor: COLORS.success }]} />
              </View>
            </View>
            <Text style={styles.profileName}>{citizenProfile?.name}</Text>
            <Text style={styles.profileEmail}>{citizenProfile?.email}</Text>
            <Text style={styles.profileStatus}>
              {citizenProfile?.status === 'verified' ? 'Compte vérifié' : 'Compte actif'}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Navigation par onglets */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'overview' && styles.tabButtonActive]}
          onPress={() => setSelectedTab('overview')}
        >
          <Ionicons 
            name="person-circle" 
            size={18} 
            color={selectedTab === 'overview' ? COLORS.white : COLORS.textLight} 
          />
          <Text style={[styles.tabText, selectedTab === 'overview' && styles.tabTextActive]}>
            Aperçu
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'settings' && styles.tabButtonActive]}
          onPress={() => setSelectedTab('settings')}
        >
          <Ionicons 
            name="settings" 
            size={18} 
            color={selectedTab === 'settings' ? COLORS.white : COLORS.textLight} 
          />
          <Text style={[styles.tabText, selectedTab === 'settings' && styles.tabTextActive]}>
            Paramètres
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'history' && styles.tabButtonActive]}
          onPress={() => setSelectedTab('history')}
        >
          <Ionicons 
            name="time" 
            size={18} 
            color={selectedTab === 'history' ? COLORS.white : COLORS.textLight} 
          />
          <Text style={[styles.tabText, selectedTab === 'history' && styles.tabTextActive]}>
            Historique
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenu */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'settings' && renderSettings()}
        {selectedTab === 'history' && renderHistory()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  profileSection: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  profileGradient: {
    padding: 24,
  },
  profileContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: COLORS.white + 'CC',
    marginBottom: 2,
  },
  profileStatus: {
    fontSize: 14,
    color: COLORS.white + 'AA',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  contactsContainer: {
    gap: 12,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  contactText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  settingsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: COLORS.primary,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: COLORS.error + '20',
  },
  logoutText: {
    color: COLORS.error,
  },
  historyContainer: {
    gap: 12,
  },
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  historyDate: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  historyDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 12,
  },
  historyStatus: {
    alignSelf: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
import { useApp } from '@/contexts/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
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
  backgroundDark: '#0F172A',
  surface: '#FFFFFF',
  surfaceDark: '#1E293B',
  text: '#1E293B',
  textLight: '#64748B',
  textDark: '#F1F5F9',
  border: '#E2E8F0',
  borderDark: '#334155',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

interface AgentProfile {
  id: string;
  name: string;
  badge: string;
  rank: string;
  experience: number;
  department: string;
  specializations: string[];
  alertsHandled: number;
  responseTime: number;
  rating: number;
  joinDate: Date;
  lastActivity: Date;
  status: 'active' | 'busy' | 'offline';
  vehicle: string;
  certifications: string[];
  achievements: string[];
}

export default function AgentProfileScreen() {
  const { userType, isAuthenticated, logout } = useApp();
  
  // États
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'performance' | 'achievements'>('overview');

  // Refs
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Données simulées
  const mockProfile: AgentProfile = {
    id: 'agent_current',
    name: 'Agent DEMO',
    badge: 'A000',
    rank: 'Lieutenant',
    experience: 8,
    department: 'Forces de l\'Ordre',
    specializations: ['Intervention', 'Sécurité', 'Circulation'],
    alertsHandled: 247,
    responseTime: 3.2,
    rating: 4.8,
    joinDate: new Date('2016-03-15'),
    lastActivity: new Date(),
    status: 'active',
    vehicle: 'Véhicule 001',
    certifications: ['Intervention d\'urgence', 'Gestion de crise', 'Premiers secours'],
    achievements: ['Agent du mois - Mars 2024', 'Temps de réponse record', '100 alertes traitées'],
  };

  useEffect(() => {
    // Vérifier l'authentification
    if (!isAuthenticated || userType !== 'law_enforcement') {
      Alert.alert(
        'Accès refusé',
        'Cette interface est réservée aux forces de l\'ordre.',
        [{ text: 'OK', onPress: () => router.replace('/role-selection') }]
      );
      return;
    }

    setAgentProfile(mockProfile);
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

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Informations personnelles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations personnelles</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nom complet:</Text>
            <Text style={styles.infoValue}>{agentProfile?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Badge:</Text>
            <Text style={styles.infoValue}>{agentProfile?.badge}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Grade:</Text>
            <Text style={styles.infoValue}>{agentProfile?.rank}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Expérience:</Text>
            <Text style={styles.infoValue}>{agentProfile?.experience} ans</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Département:</Text>
            <Text style={styles.infoValue}>{agentProfile?.department}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Véhicule:</Text>
            <Text style={styles.infoValue}>{agentProfile?.vehicle}</Text>
          </View>
        </View>
      </View>

      {/* Spécialisations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spécialisations</Text>
        <View style={styles.specializationsContainer}>
          {agentProfile?.specializations.map((spec, index) => (
            <View key={index} style={styles.specializationTag}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.specializationText}>{spec}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Certifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Certifications</Text>
        <View style={styles.certificationsContainer}>
          {agentProfile?.certifications.map((cert, index) => (
            <View key={index} style={styles.certificationCard}>
              <Ionicons name="ribbon" size={20} color={COLORS.primary} />
              <Text style={styles.certificationText}>{cert}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderPerformance = () => (
    <View style={styles.tabContent}>
      {/* Métriques de performance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Métriques de performance</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: COLORS.primary + '20' }]}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.metricValue}>{agentProfile?.alertsHandled}</Text>
            <Text style={styles.metricLabel}>Alertes traitées</Text>
          </View>
          
          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: COLORS.success + '20' }]}>
              <Ionicons name="time" size={24} color={COLORS.success} />
            </View>
            <Text style={styles.metricValue}>{agentProfile?.responseTime} min</Text>
            <Text style={styles.metricLabel}>Temps de réponse</Text>
          </View>
          
          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: COLORS.warning + '20' }]}>
              <Ionicons name="star" size={24} color={COLORS.warning} />
            </View>
            <Text style={styles.metricValue}>{agentProfile?.rating}/5</Text>
            <Text style={styles.metricLabel}>Évaluation</Text>
          </View>
          
          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: COLORS.error + '20' }]}>
              <Ionicons name="calendar" size={24} color={COLORS.error} />
            </View>
            <Text style={styles.metricValue}>{agentProfile?.experience} ans</Text>
            <Text style={styles.metricLabel}>Ancienneté</Text>
          </View>
        </View>
      </View>

      {/* Graphique de performance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance mensuelle</Text>
        <View style={styles.chartContainer}>
          <View style={styles.chartPlaceholder}>
            <Ionicons name="bar-chart" size={48} color={COLORS.textLight} />
            <Text style={styles.chartText}>Graphique de performance</Text>
            <Text style={styles.chartSubtext}>Données des 12 derniers mois</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderAchievements = () => (
    <View style={styles.tabContent}>
      {/* Réalisations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Réalisations</Text>
        <View style={styles.achievementsContainer}>
          {agentProfile?.achievements.map((achievement, index) => (
            <View key={index} style={styles.achievementCard}>
              <View style={styles.achievementIcon}>
                <Ionicons name="trophy" size={24} color={COLORS.warning} />
              </View>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>{achievement}</Text>
                <Text style={styles.achievementDate}>Récemment obtenu</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Statistiques détaillées */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistiques détaillées</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Date d'embauche:</Text>
            <Text style={styles.statValue}>{agentProfile?.joinDate.toLocaleDateString('fr-FR')}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Dernière activité:</Text>
            <Text style={styles.statValue}>{agentProfile?.lastActivity.toLocaleString('fr-FR')}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Statut actuel:</Text>
            <View style={[styles.statusBadge, { backgroundColor: COLORS.success + '20' }]}>
              <Text style={[styles.statusText, { color: COLORS.success }]}>Actif</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [-50, 0] }) }],
          },
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>Profil Agent</Text>
            <Text style={styles.subtitle}>{agentProfile?.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={24} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </Animated.View>

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
            <Text style={styles.profileName}>{agentProfile?.name}</Text>
            <Text style={styles.profileRank}>{agentProfile?.rank} • Badge {agentProfile?.badge}</Text>
            <Text style={styles.profileDepartment}>{agentProfile?.department}</Text>
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
          style={[styles.tabButton, selectedTab === 'performance' && styles.tabButtonActive]}
          onPress={() => setSelectedTab('performance')}
        >
          <Ionicons 
            name="stats-chart" 
            size={18} 
            color={selectedTab === 'performance' ? COLORS.white : COLORS.textLight} 
          />
          <Text style={[styles.tabText, selectedTab === 'performance' && styles.tabTextActive]}>
            Performance
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'achievements' && styles.tabButtonActive]}
          onPress={() => setSelectedTab('achievements')}
        >
          <Ionicons 
            name="trophy" 
            size={18} 
            color={selectedTab === 'achievements' ? COLORS.white : COLORS.textLight} 
          />
          <Text style={[styles.tabText, selectedTab === 'achievements' && styles.tabTextActive]}>
            Réalisations
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenu */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'performance' && renderPerformance()}
        {selectedTab === 'achievements' && renderAchievements()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
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
  profileRank: {
    fontSize: 16,
    color: COLORS.white + 'CC',
    marginBottom: 2,
  },
  profileDepartment: {
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
  specializationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specializationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  specializationText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primary,
  },
  certificationsContainer: {
    gap: 12,
  },
  certificationCard: {
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
  certificationText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
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
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartPlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  chartText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textLight,
    marginTop: 12,
  },
  chartSubtext: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  achievementsContainer: {
    gap: 12,
  },
  achievementCard: {
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
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  achievementDate: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  statsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
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


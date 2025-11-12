import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
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
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

// Types pour l'utilisateur
interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'citizen' | 'agent' | 'admin';
  avatar?: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  preferences: {
    notifications: boolean;
    locationSharing: boolean;
    emergencyContacts: boolean;
    darkMode: boolean;
  };
  stats: {
    alertsSent: number;
    alertsResolved: number;
    responseTime: number;
    rating: number;
  };
  emergencyContacts: Array<{
    id: string;
    name: string;
    phone: string;
    relationship: string;
  }>;
}

export default function ProfileScreen() {
  // États
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 'user_001',
    name: 'Mamadou Diallo',
    email: 'mamadou.diallo@email.com',
    phone: '+221 77 123 45 67',
    role: 'citizen',
    location: {
      latitude: 14.7167,
      longitude: -17.4677,
      address: 'Dakar, Sénégal',
    },
    preferences: {
      notifications: true,
      locationSharing: true,
      emergencyContacts: true,
      darkMode: false,
    },
    stats: {
      alertsSent: 3,
      alertsResolved: 0,
      responseTime: 0,
      rating: 4.8,
    },
    emergencyContacts: [
      {
        id: '1',
        name: 'Fatou Sall',
        phone: '+221 78 234 56 78',
        relationship: 'Épouse',
      },
      {
        id: '2',
        name: 'Ibrahima Ndiaye',
        phone: '+221 76 345 67 89',
        relationship: 'Frère',
      },
    ],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);

  // Animations
  const profileOpacity = useRef(new Animated.Value(0)).current;
  const statsScale = useRef(new Animated.Value(0.8)).current;
  const settingsSlide = useRef(new Animated.Value(50)).current;

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

  useEffect(() => {
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(profileOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(statsScale, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(settingsSlide, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleEditProfile = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsEditing(!isEditing);
  };

  const handleTogglePreference = async (key: keyof UserProfile['preferences']) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setUserProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: !prev.preferences[key],
      },
    }));
  };

  const handleAddEmergencyContact = () => {
    Alert.alert(
      'Ajouter un contact d\'urgence',
      'Cette fonctionnalité sera disponible prochainement',
      [{ text: 'OK' }]
    );
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
            // Logique de déconnexion
            router.replace('/auth/login-citoyen');
          },
        },
      ]
    );
  };

  const renderProfileHeader = () => (
    <Animatable.View animation="fadeInDown" duration={600} style={styles.profileHeader}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryLight]}
        style={styles.profileHeaderGradient}
      >
        <View style={styles.profileHeaderContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          
          <Text style={styles.profileHeaderTitle}>Profil</Text>
          
          <TouchableOpacity
            onPress={handleEditProfile}
            style={styles.editButton}
          >
            <Ionicons name="create" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animatable.View>
  );

  const renderUserInfo = () => (
    <Animatable.View animation="fadeInUp" duration={600} style={styles.userInfoContainer}>
      <View style={styles.avatarContainer}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryLight]}
          style={styles.avatarGradient}
        >
          <BlurView intensity={20} style={styles.avatarBlur}>
            <Ionicons name="person" size={40} color={COLORS.white} />
          </BlurView>
        </LinearGradient>
      </View>
      
      <View style={styles.userDetails}>
        <Text style={styles.userName}>{userProfile.name}</Text>
        <Text style={styles.userEmail}>{userProfile.email}</Text>
        <Text style={styles.userPhone}>{userProfile.phone}</Text>
        
        <View style={styles.roleContainer}>
          <View style={[
            styles.roleBadge,
            {
              backgroundColor: userProfile.role === 'citizen' ? COLORS.primary :
                              userProfile.role === 'agent' ? COLORS.success : COLORS.warning,
            }
          ]}>
            <Text style={styles.roleText}>
              {userProfile.role === 'citizen' ? 'Citoyen' :
               userProfile.role === 'agent' ? 'Agent' : 'Administrateur'}
            </Text>
          </View>
        </View>
      </View>
    </Animatable.View>
  );

  const renderStats = () => (
    <Animated.View style={[styles.statsContainer, { transform: [{ scale: statsScale }] }]}>
      <Text style={styles.sectionTitle}>Statistiques</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryLight]}
            style={styles.statCardGradient}
          >
            <Ionicons name="warning" size={24} color={COLORS.white} />
            <Text style={styles.statValue}>{userProfile.stats.alertsSent}</Text>
            <Text style={styles.statLabel}>Alertes envoyées</Text>
          </LinearGradient>
        </View>
        
        <View style={styles.statCard}>
          <LinearGradient
            colors={[COLORS.success, '#059669']}
            style={styles.statCardGradient}
          >
            <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
            <Text style={styles.statValue}>{userProfile.stats.alertsResolved}</Text>
            <Text style={styles.statLabel}>Résolues</Text>
          </LinearGradient>
        </View>
        
        <View style={styles.statCard}>
          <LinearGradient
            colors={[COLORS.warning, '#D97706']}
            style={styles.statCardGradient}
          >
            <Ionicons name="time" size={24} color={COLORS.white} />
            <Text style={styles.statValue}>{userProfile.stats.responseTime}min</Text>
            <Text style={styles.statLabel}>Temps moyen</Text>
          </LinearGradient>
        </View>
        
        <View style={styles.statCard}>
          <LinearGradient
            colors={[COLORS.error, '#DC2626']}
            style={styles.statCardGradient}
          >
            <Ionicons name="star" size={24} color={COLORS.white} />
            <Text style={styles.statValue}>{userProfile.stats.rating}</Text>
            <Text style={styles.statLabel}>Note</Text>
          </LinearGradient>
        </View>
      </View>
    </Animated.View>
  );

  const renderSettings = () => (
    <Animated.View style={[styles.settingsContainer, { transform: [{ translateY: settingsSlide }] }]}>
      <Text style={styles.sectionTitle}>Paramètres</Text>
      
      <View style={styles.settingsList}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications" size={20} color={COLORS.primary} />
            <Text style={styles.settingLabel}>Notifications</Text>
          </View>
          <Switch
            value={userProfile.preferences.notifications}
            onValueChange={() => handleTogglePreference('notifications')}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="location" size={20} color={COLORS.primary} />
            <Text style={styles.settingLabel}>Partage de localisation</Text>
          </View>
          <Switch
            value={userProfile.preferences.locationSharing}
            onValueChange={() => handleTogglePreference('locationSharing')}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="people" size={20} color={COLORS.primary} />
            <Text style={styles.settingLabel}>Contacts d'urgence</Text>
          </View>
          <Switch
            value={userProfile.preferences.emergencyContacts}
            onValueChange={() => handleTogglePreference('emergencyContacts')}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="moon" size={20} color={COLORS.primary} />
            <Text style={styles.settingLabel}>Mode sombre</Text>
          </View>
          <Switch
            value={userProfile.preferences.darkMode}
            onValueChange={() => handleTogglePreference('darkMode')}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
      </View>
    </Animated.View>
  );

  const renderEmergencyContacts = () => (
    <View style={styles.emergencyContactsContainer}>
      <View style={styles.emergencyContactsHeader}>
        <Text style={styles.sectionTitle}>Contacts d'urgence</Text>
        <TouchableOpacity
          onPress={handleAddEmergencyContact}
          style={styles.addContactButton}
        >
          <Ionicons name="add" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.contactsList}>
        {userProfile.emergencyContacts.map((contact) => (
          <View key={contact.id} style={styles.contactCard}>
            <View style={styles.contactAvatar}>
              <Ionicons name="person" size={20} color={COLORS.primary} />
            </View>
            
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactPhone}>{contact.phone}</Text>
              <Text style={styles.contactRelationship}>{contact.relationship}</Text>
            </View>
            
            <TouchableOpacity style={styles.contactAction}>
              <Ionicons name="call" size={20} color={COLORS.success} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  const renderActions = () => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        onPress={() => Alert.alert('Aide', 'Fonctionnalité en cours de développement')}
        style={styles.actionButton}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryLight]}
          style={styles.actionButtonGradient}
        >
          <Ionicons name="help-circle" size={20} color={COLORS.white} />
          <Text style={styles.actionButtonText}>Aide & Support</Text>
        </LinearGradient>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={() => Alert.alert('À propos', 'Fonctionnalité en cours de développement')}
        style={styles.actionButton}
      >
        <LinearGradient
          colors={[COLORS.success, '#059669']}
          style={styles.actionButtonGradient}
        >
          <Ionicons name="information-circle" size={20} color={COLORS.white} />
          <Text style={styles.actionButtonText}>À propos</Text>
        </LinearGradient>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={handleLogout}
        style={styles.actionButton}
      >
        <LinearGradient
          colors={[COLORS.error, '#DC2626']}
          style={styles.actionButtonGradient}
        >
          <Ionicons name="log-out" size={20} color={COLORS.white} />
          <Text style={styles.actionButtonText}>Déconnexion</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {renderProfileHeader()}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderUserInfo()}
        {renderStats()}
        {renderSettings()}
        {renderEmergencyContacts()}
        {renderActions()}
      </ScrollView>
    </View>
  );
}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  profileHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  profileHeaderGradient: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  profileHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userInfoContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBlur: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textLight,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textLight,
    marginBottom: 16,
  },
  roleContainer: {
    marginTop: 8,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  statsContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (width - 64) / 2,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statCardGradient: {
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white + 'CC',
    textAlign: 'center',
  },
  settingsContainer: {
    marginTop: 24,
  },
  settingsList: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  emergencyContactsContainer: {
    marginTop: 24,
  },
  emergencyContactsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  addContactButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactsList: {
    gap: 12,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textLight,
    marginBottom: 2,
  },
  contactRelationship: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  contactAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsContainer: {
    marginTop: 24,
    marginBottom: 40,
    gap: 12,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

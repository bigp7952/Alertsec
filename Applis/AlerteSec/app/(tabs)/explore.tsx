import { useApp } from '@/contexts/AppContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Platform,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';

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

interface ZoneData {
  id: string;
  name: string;
  level: 'safe' | 'warning' | 'danger';
  alertsCount: number;
  lastAlert: string;
  description: string;
}

interface CommunityAlert {
  id: string;
  type: 'security' | 'medical' | 'traffic' | 'fire';
  title: string;
  description: string;
  location: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved';
}

export default function ExploreScreen() {
  const { userType, isAuthenticated } = useApp();
  
  // États
  const [activeTab, setActiveTab] = useState<'zones' | 'alerts'>('zones');
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [alerts, setAlerts] = useState<CommunityAlert[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Refs
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Données simulées
  const mockZones: ZoneData[] = [
    {
      id: '1',
      name: 'Centre-ville',
      level: 'danger',
      alertsCount: 8,
      lastAlert: 'Il y a 5 min',
      description: 'Zone à risque élevé',
    },
    {
      id: '2',
      name: 'Quartier des Halles',
      level: 'warning',
      alertsCount: 3,
      lastAlert: 'Il y a 1h',
      description: 'Zone sous surveillance',
    },
    {
      id: '3',
      name: 'Parc Montsouris',
      level: 'safe',
      alertsCount: 0,
      lastAlert: 'Il y a 2 jours',
      description: 'Zone sécurisée',
    },
    {
      id: '4',
      name: 'Avenue Bourguiba',
      level: 'warning',
      alertsCount: 2,
      lastAlert: 'Il y a 30 min',
      description: 'Circulation dense',
    },
  ];

  const mockAlerts: CommunityAlert[] = [
    {
      id: '1',
      type: 'security',
      title: 'Individu agressif',
      description: 'Personne signalée comme agressive près de la station de métro',
      location: 'Métro République',
      timestamp: 'Il y a 5 min',
      severity: 'critical',
      status: 'active',
    },
    {
      id: '2',
      type: 'traffic',
      title: 'Accident de circulation',
      description: 'Collision entre deux véhicules, embouteillages',
      location: 'Boulevard Voltaire',
      timestamp: 'Il y a 20 min',
      severity: 'medium',
      status: 'active',
    },
    {
      id: '3',
      type: 'medical',
      title: 'Urgence médicale',
      description: 'Personne évanouie sur la voie publique',
      location: 'Place de la République',
      timestamp: 'Il y a 1h',
      severity: 'high',
      status: 'resolved',
    },
  ];

  useEffect(() => {
    // Vérifier l'authentification
    if (!isAuthenticated || userType !== 'citizen') {
      Alert.alert(
        'Accès refusé',
        'Cette interface est réservée aux citoyens.',
        [{ text: 'OK', onPress: () => {} }]
      );
      return;
    }

    setZones(mockZones);
    setAlerts(mockAlerts);
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

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setTimeout(() => {
      setRefreshing(false);
      // Simuler une mise à jour des données
      setZones([...mockZones]);
      setAlerts([...mockAlerts]);
    }, 2000);
  }, []);

  const getZoneColor = (level: string) => {
    switch (level) {
      case 'safe': return COLORS.success;
      case 'warning': return COLORS.warning;
      case 'danger': return COLORS.error;
      default: return COLORS.textLight;
    }
  };

  const getZoneIcon = (level: string) => {
    switch (level) {
      case 'safe': return 'shield-checkmark';
      case 'warning': return 'warning';
      case 'danger': return 'alert-circle';
      default: return 'help-circle';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'security': return 'shield';
      case 'medical': return 'medical';
      case 'traffic': return 'car';
      case 'fire': return 'flame';
      default: return 'alert-circle';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return COLORS.success;
      case 'medium': return COLORS.warning;
      case 'high': return COLORS.error;
      case 'critical': return COLORS.critical;
      default: return COLORS.textLight;
    }
  };

  const renderZoneCard = (zone: ZoneData) => (
    <Animatable.View
      key={zone.id}
      animation="fadeInUp"
      delay={zones.indexOf(zone) * 100}
      style={styles.zoneCard}
    >
      <View style={styles.zoneHeader}>
        <View style={styles.zoneInfo}>
          <View style={[styles.zoneIcon, { backgroundColor: getZoneColor(zone.level) + '20' }]}>
            <Ionicons name={getZoneIcon(zone.level) as any} size={20} color={getZoneColor(zone.level)} />
          </View>
          <View style={styles.zoneDetails}>
            <Text style={styles.zoneName}>{zone.name}</Text>
            <Text style={styles.zoneDescription}>{zone.description}</Text>
          </View>
        </View>
        <View style={styles.zoneStats}>
          <Text style={[styles.alertCount, { color: getZoneColor(zone.level) }]}>
            {zone.alertsCount}
          </Text>
          <Text style={styles.alertLabel}>alertes</Text>
        </View>
      </View>
      <View style={styles.zoneFooter}>
        <Text style={styles.lastAlert}>Dernière alerte: {zone.lastAlert}</Text>
        <View style={[styles.statusIndicator, { backgroundColor: getZoneColor(zone.level) }]} />
      </View>
    </Animatable.View>
  );

  const renderAlertCard = (alert: CommunityAlert) => (
    <Animatable.View
      key={alert.id}
      animation="fadeInUp"
      delay={alerts.indexOf(alert) * 100}
      style={styles.alertCard}
    >
      <View style={styles.alertHeader}>
        <View style={[styles.alertIcon, { backgroundColor: getSeverityColor(alert.severity) + '20' }]}>
          <Ionicons name={getAlertIcon(alert.type) as any} size={20} color={getSeverityColor(alert.severity)} />
        </View>
        <View style={styles.alertInfo}>
          <Text style={styles.alertTitle}>{alert.title}</Text>
          <Text style={styles.alertLocation}>{alert.location}</Text>
        </View>
        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(alert.severity) + '20' }]}>
          <Text style={[styles.severityText, { color: getSeverityColor(alert.severity) }]}>
            {alert.severity === 'low' ? 'Faible' : alert.severity === 'medium' ? 'Moyen' : alert.severity === 'high' ? 'Élevé' : 'Critique'}
          </Text>
        </View>
      </View>
      <Text style={styles.alertDescription}>{alert.description}</Text>
      <View style={styles.alertFooter}>
        <Text style={styles.alertTimestamp}>{alert.timestamp}</Text>
        <View style={[styles.statusBadge, { backgroundColor: alert.status === 'active' ? COLORS.error + '20' : COLORS.success + '20' }]}>
          <Text style={[styles.statusText, { color: alert.status === 'active' ? COLORS.error : COLORS.success }]}>
            {alert.status === 'active' ? 'Actif' : 'Résolu'}
          </Text>
        </View>
      </View>
    </Animatable.View>
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
            transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }],
          },
        ]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Explorer</Text>
            <Text style={styles.subtitle}>Situation sécuritaire en temps réel</Text>
          </View>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Ionicons name="refresh" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Statistiques globales */}
      <Animated.View
        style={[
          styles.statsContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          },
        ]}
      >
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.error }]}>3</Text>
            <Text style={styles.statLabel}>Zones critiques</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.warning }]}>15</Text>
            <Text style={styles.statLabel}>Alertes actives</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.primary }]}>127</Text>
            <Text style={styles.statLabel}>Citoyens connectés</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.success }]}>92%</Text>
            <Text style={styles.statLabel}>Zones sûres</Text>
          </View>
        </View>
      </Animated.View>

      {/* Navigation par onglets */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'zones' && styles.tabButtonActive]}
          onPress={() => {
            setActiveTab('zones');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <Ionicons 
            name="map" 
            size={18} 
            color={activeTab === 'zones' ? COLORS.white : COLORS.textLight} 
          />
          <Text style={[styles.tabText, activeTab === 'zones' && styles.tabTextActive]}>
            Zones
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'alerts' && styles.tabButtonActive]}
          onPress={() => {
            setActiveTab('alerts');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <Ionicons 
            name="alert-circle" 
            size={18} 
            color={activeTab === 'alerts' ? COLORS.white : COLORS.textLight} 
          />
          <Text style={[styles.tabText, activeTab === 'alerts' && styles.tabTextActive]}>
            Alertes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenu */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'zones' ? (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>État des zones par quartier</Text>
            {zones.map(renderZoneCard)}
            
            {/* Info explicative */}
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons name="information-circle" size={20} color={COLORS.primary} />
                <Text style={styles.infoTitle}>Comment ça marche ?</Text>
              </View>
              <Text style={styles.infoText}>
                Les zones sont colorées selon le niveau de risque calculé en temps réel à partir des signalements récents. Plus il y a d'alertes dans une zone, plus elle devient rouge.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Dernières alertes de la communauté</Text>
            {alerts.map(renderAlertCard)}
          </View>
        )}
      </ScrollView>

      {/* Message d'encouragement */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <View style={styles.footerIcon}>
            <Ionicons name="people" size={24} color={COLORS.success} />
          </View>
          <View style={styles.footerText}>
            <Text style={styles.footerTitle}>Ensemble, nous sommes plus forts</Text>
            <Text style={styles.footerSubtitle}>Chaque signalement contribue à la sécurité de tous</Text>
          </View>
        </View>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    backgroundColor: COLORS.white,
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  zoneCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  zoneInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  zoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  zoneDetails: {
    flex: 1,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  zoneDescription: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  zoneStats: {
    alignItems: 'center',
  },
  alertCount: {
    fontSize: 20,
    fontWeight: '700',
  },
  alertLabel: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  zoneFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastAlert: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  alertCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  alertLocation: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  alertDescription: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTimestamp: {
    fontSize: 12,
    color: COLORS.textLight,
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
  infoCard: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.primary,
    lineHeight: 16,
  },
  footer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: 16,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  footerText: {
    flex: 1,
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  footerSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
  },
});
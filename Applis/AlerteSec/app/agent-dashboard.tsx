import { useApp } from '@/contexts/AppContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

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
  // Couleurs pour les alertes
  emergency: '#DC2626',
  urgent: '#F59E0B',
  normal: '#3B82F6',
  // Couleurs pour les agents
  agentActive: '#10B981',
  agentBusy: '#F59E0B',
  agentOffline: '#6B7280',
};

// Types pour les alertes
interface AlertData {
  id: string;
  type: 'emergency' | 'urgent' | 'normal';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    address?: string;
  };
  timestamp: Date;
  status: 'pending' | 'processing' | 'resolved';
  category: string;
  urgency: 'immediate' | 'urgent' | 'normal';
  estimatedDuration?: string;
  affectedArea?: string;
  additionalInfo?: string;
  responseTime?: number;
  resolutionNotes?: string;
  audioRecording?: string;
  videoRecording?: string;
  photo?: string;
  citizenId: string;
  citizenName: string;
  citizenPhone?: string;
  assignedAgent?: string;
  estimatedArrival?: number;
}

// Types pour les agents
interface AgentData {
  id: string;
  name: string;
  badge: string;
  status: 'active' | 'busy' | 'offline';
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  currentAlert?: string;
  lastUpdate: Date;
  vehicle: string;
  specializations: string[];
  rank: string;
  experience: number;
  alertsHandled: number;
  responseTime: number;
  availability: 'available' | 'busy' | 'break' | 'off-duty';
}

interface AgentStats {
  totalAlerts: number;
  pendingAlerts: number;
  resolvedAlerts: number;
  averageResponseTime: number;
  activeAgents: number;
  totalAgents: number;
  alertsToday: number;
  criticalAlerts: number;
}

export default function AgentDashboardScreen() {
  const { userType, isAuthenticated, logout } = useApp();
  
  // États
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [agentStats, setAgentStats] = useState<AgentStats | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<AlertData | null>(null);
  const [showAlertDetails, setShowAlertDetails] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [isTakingCharge, setIsTakingCharge] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'processing' | 'resolved'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'emergency' | 'urgent' | 'normal'>('all');
  const [currentView, setCurrentView] = useState<'alerts' | 'stats' | 'team' | 'map'>('alerts');

  // Refs
  const mapRef = useRef<MapView>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Données simulées
  const mockAlerts: AlertData[] = [
    {
      id: '1',
      type: 'emergency',
      severity: 'critical',
      title: 'Accident grave - Avenue Bourguiba',
      description: 'Accident de circulation avec blessés, véhicules endommagés',
      location: { latitude: 14.7167, longitude: -17.4677, accuracy: 5, address: 'Avenue Bourguiba, Dakar' },
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      status: 'pending',
      category: 'Accident',
      urgency: 'immediate',
      estimatedDuration: '2-3 heures',
      affectedArea: 'Centre-ville',
      additionalInfo: 'Trafic bloqué, nécessite déviation',
      audioRecording: 'audio_emergency_1.mp3',
      videoRecording: 'video_emergency_1.mp4',
      photo: 'https://via.placeholder.com/300x200/DC2626/FFFFFF?text=Accident',
      citizenId: 'citizen_1',
      citizenName: 'A. Diallo',
      citizenPhone: '+221 77 123 45 67',
      estimatedArrival: 8,
    },
    {
      id: '2',
      type: 'urgent',
      severity: 'high',
      title: 'Agression signalée - Mermoz',
      description: 'Agression dans le quartier de Mermoz, suspect en fuite',
      location: { latitude: 14.7200, longitude: -17.4700, accuracy: 8, address: 'Mermoz, Dakar' },
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      status: 'processing',
      category: 'Sécurité',
      urgency: 'urgent',
      estimatedDuration: '1-2 heures',
      affectedArea: 'Mermoz',
      additionalInfo: 'Suspect décrit comme homme de 30 ans, vêtu de noir',
      audioRecording: 'audio_urgent_2.mp3',
      citizenId: 'citizen_2',
      citizenName: 'M. Ndiaye',
      citizenPhone: '+221 77 234 56 78',
      assignedAgent: 'Agent Sarr',
      estimatedArrival: 12,
    },
    {
      id: '3',
      type: 'normal',
      severity: 'medium',
      title: 'Véhicule en panne - Corniche',
      description: 'Véhicule bloquant la circulation sur la route de la Corniche',
      location: { latitude: 14.7100, longitude: -17.4600, accuracy: 10, address: 'Route de la Corniche, Dakar' },
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      status: 'resolved',
      category: 'Circulation',
      urgency: 'normal',
      estimatedDuration: '30 minutes',
      affectedArea: 'Corniche',
      resolutionNotes: 'Véhicule remorqué par les services de dépannage',
      citizenId: 'citizen_3',
      citizenName: 'K. Ba',
      citizenPhone: '+221 77 345 67 89',
      assignedAgent: 'Agent Diop',
      estimatedArrival: 0,
    },
  ];

  const mockAgents: AgentData[] = [
    {
      id: 'agent_1',
      name: 'Agent Sarr',
      badge: 'A001',
      status: 'busy',
      location: { latitude: 14.7180, longitude: -17.4650, accuracy: 5 },
      currentAlert: '2',
      lastUpdate: new Date(),
      vehicle: 'Véhicule 001',
      specializations: ['Sécurité', 'Intervention'],
      rank: 'Sergent',
      experience: 8,
      alertsHandled: 156,
      responseTime: 4.2,
      availability: 'busy',
    },
    {
      id: 'agent_2',
      name: 'Agent Diop',
      badge: 'A002',
      status: 'active',
      location: { latitude: 14.7150, longitude: -17.4680, accuracy: 8 },
      lastUpdate: new Date(Date.now() - 2 * 60 * 1000),
      vehicle: 'Véhicule 002',
      specializations: ['Circulation', 'Accidents'],
      rank: 'Caporal',
      experience: 5,
      alertsHandled: 89,
      responseTime: 3.8,
      availability: 'available',
    },
    {
      id: 'agent_3',
      name: 'Agent Fall',
      badge: 'A003',
      status: 'offline',
      location: { latitude: 14.7120, longitude: -17.4620, accuracy: 10 },
      lastUpdate: new Date(Date.now() - 10 * 60 * 1000),
      vehicle: 'Véhicule 003',
      specializations: ['Sécurité', 'Patrouille'],
      rank: 'Brigadier',
      experience: 12,
      alertsHandled: 234,
      responseTime: 3.2,
      availability: 'off-duty',
    },
    {
      id: 'agent_4',
      name: 'Agent Ba',
      badge: 'A004',
      status: 'active',
      location: { latitude: 14.7200, longitude: -17.4700, accuracy: 6 },
      lastUpdate: new Date(Date.now() - 1 * 60 * 1000),
      vehicle: 'Véhicule 004',
      specializations: ['Intervention', 'Sécurité'],
      rank: 'Lieutenant',
      experience: 15,
      alertsHandled: 312,
      responseTime: 2.9,
      availability: 'available',
    },
    {
      id: 'agent_5',
      name: 'Agent Ndiaye',
      badge: 'A005',
      status: 'active',
      location: { latitude: 14.7100, longitude: -17.4600, accuracy: 7 },
      lastUpdate: new Date(Date.now() - 3 * 60 * 1000),
      vehicle: 'Véhicule 005',
      specializations: ['Circulation', 'Patrouille'],
      rank: 'Sergent-chef',
      experience: 10,
      alertsHandled: 198,
      responseTime: 3.5,
      availability: 'break',
    },
  ];

  const mockStats: AgentStats = {
    totalAlerts: 1247,
    pendingAlerts: 23,
    resolvedAlerts: 1189,
    averageResponseTime: 3.4,
    activeAgents: 4,
    totalAgents: 8,
    alertsToday: 47,
    criticalAlerts: 3,
  };

  useEffect(() => {
    // Vérifier l'authentification et le type d'utilisateur
    if (!isAuthenticated || userType !== 'law_enforcement') {
      Alert.alert(
        'Accès refusé',
        'Cette interface est réservée aux forces de l\'ordre.',
        [{ text: 'OK', onPress: () => router.replace('/role-selection') }]
      );
      return;
    }

    setAlerts(mockAlerts);
    setAgents(mockAgents);
    setAgentStats(mockStats);
    initializeLocation();
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

  const initializeLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setUserLocation(location);
      }
    } catch (error) {
      console.error('Erreur localisation agent:', error);
    }
  };

  const handleTakeCharge = async (alert: AlertData) => {
    setIsTakingCharge(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simulation de prise en charge
    setTimeout(() => {
      const updatedAlerts = alerts.map(a => 
        a.id === alert.id 
          ? { ...a, status: 'processing' as const, assignedAgent: 'Vous' }
          : a
      );
      setAlerts(updatedAlerts);
      setIsTakingCharge(false);
      setShowAlertDetails(false);
      
      Alert.alert(
        'Alerte prise en charge',
        `Vous avez pris en charge l'alerte "${alert.title}". Temps d'arrivée estimé: ${alert.estimatedArrival} minutes.`,
        [{ text: 'OK' }]
      );
    }, 1500);
  };

  const handleNavigateToAlert = (alert: AlertData) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: alert.location.latitude,
        longitude: alert.location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setShowMap(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return COLORS.warning;
      case 'processing': return COLORS.primary;
      case 'resolved': return COLORS.success;
      default: return COLORS.textLight;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'processing': return 'En cours';
      case 'resolved': return 'Résolu';
      default: return status;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return COLORS.emergency;
      case 'urgent': return COLORS.urgent;
      case 'normal': return COLORS.normal;
      default: return COLORS.textLight;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency': return 'warning';
      case 'urgent': return 'alert-circle';
      case 'normal': return 'information-circle';
      default: return 'help-circle';
    }
  };

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'active': return COLORS.agentActive;
      case 'busy': return COLORS.agentBusy;
      case 'offline': return COLORS.agentOffline;
      default: return COLORS.textLight;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const statusMatch = filterStatus === 'all' || alert.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || alert.type === filterPriority;
    return statusMatch && priorityMatch;
  });

  const renderAlertCard = (alert: AlertData) => (
    <Animatable.View
      key={alert.id}
      animation="fadeInUp"
      duration={600}
      style={styles.alertCard}
    >
      <View style={styles.alertCardHeader}>
        <View style={[styles.alertTypeIndicator, { backgroundColor: getTypeColor(alert.type) }]}>
          <Ionicons name={getTypeIcon(alert.type) as any} size={16} color={COLORS.white} />
        </View>
        <View style={styles.alertHeaderInfo}>
          <Text style={styles.alertTitle} numberOfLines={1}>{alert.title}</Text>
          <Text style={styles.alertTime}>
            {Math.round((Date.now() - alert.timestamp.getTime()) / 60000)}min • {alert.location.address}
          </Text>
        </View>
        <View style={[styles.alertStatus, { backgroundColor: getStatusColor(alert.status) }]}>
          <Text style={styles.alertStatusText}>{getStatusText(alert.status)}</Text>
        </View>
      </View>
      
      <Text style={styles.alertDescription} numberOfLines={2}>
        {alert.description}
      </Text>
      
      <View style={styles.alertFooter}>
        <View style={styles.alertMeta}>
          <Text style={styles.alertCategory}>{alert.category}</Text>
          <Text style={styles.alertCitizen}>Signalé par: {alert.citizenName}</Text>
        </View>
        <View style={styles.alertActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setSelectedAlert(alert);
              setShowAlertDetails(true);
            }}
          >
            <Ionicons name="eye" size={16} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              router.push('/agent-navigation');
            }}
          >
            <Ionicons name="navigate" size={16} color={COLORS.success} />
          </TouchableOpacity>
        </View>
      </View>
    </Animatable.View>
  );

  const renderAgentMarker = (agent: AgentData) => (
    <Marker
      key={agent.id}
      coordinate={agent.location}
      title={agent.name}
      description={`${agent.vehicle} - ${agent.status}`}
    >
      <View style={[styles.agentMarker, { backgroundColor: getAgentStatusColor(agent.status) }]}>
        <Ionicons name="person" size={16} color={COLORS.white} />
      </View>
    </Marker>
  );

  const renderAlertMarker = (alert: AlertData) => (
    <Marker
      key={alert.id}
      coordinate={alert.location}
      title={alert.title}
      description={alert.description}
    >
      <View style={[styles.alertMarker, { backgroundColor: getTypeColor(alert.type) }]}>
        <Ionicons name={getTypeIcon(alert.type) as any} size={16} color={COLORS.white} />
      </View>
    </Marker>
  );

  const renderStatsView = () => (
    <View style={styles.statsContainer}>
      {/* Statistiques principales */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: COLORS.primary + '20' }]}>
            <Ionicons name="alert-circle" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.statValue}>{agentStats?.totalAlerts}</Text>
          <Text style={styles.statLabel}>Total Alertes</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: COLORS.warning + '20' }]}>
            <Ionicons name="time" size={24} color={COLORS.warning} />
          </View>
          <Text style={styles.statValue}>{agentStats?.pendingAlerts}</Text>
          <Text style={styles.statLabel}>En Attente</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: COLORS.success + '20' }]}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
          </View>
          <Text style={styles.statValue}>{agentStats?.resolvedAlerts}</Text>
          <Text style={styles.statLabel}>Résolues</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: COLORS.error + '20' }]}>
            <Ionicons name="flash" size={24} color={COLORS.error} />
          </View>
          <Text style={styles.statValue}>{agentStats?.criticalAlerts}</Text>
          <Text style={styles.statLabel}>Critiques</Text>
        </View>
      </View>

      {/* Métriques de performance */}
      <View style={styles.performanceSection}>
        <Text style={styles.sectionTitle}>Performance</Text>
        <View style={styles.performanceGrid}>
          <View style={styles.performanceCard}>
            <Text style={styles.performanceValue}>{agentStats?.averageResponseTime} min</Text>
            <Text style={styles.performanceLabel}>Temps de réponse moyen</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '75%', backgroundColor: COLORS.success }]} />
            </View>
          </View>
          
          <View style={styles.performanceCard}>
            <Text style={styles.performanceValue}>{agentStats?.alertsToday}</Text>
            <Text style={styles.performanceLabel}>Alertes aujourd'hui</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '60%', backgroundColor: COLORS.primary }]} />
            </View>
          </View>
        </View>
      </View>

      {/* Équipe */}
      <View style={styles.teamSection}>
        <Text style={styles.sectionTitle}>Statut de l'équipe</Text>
        <View style={styles.teamStats}>
          <View style={styles.teamStat}>
            <Text style={styles.teamStatValue}>{agentStats?.activeAgents}</Text>
            <Text style={styles.teamStatLabel}>Actifs</Text>
          </View>
          <View style={styles.teamStat}>
            <Text style={styles.teamStatValue}>{(agentStats?.totalAgents || 0) - (agentStats?.activeAgents || 0)}</Text>
            <Text style={styles.teamStatLabel}>Hors ligne</Text>
          </View>
          <View style={styles.teamStat}>
            <Text style={styles.teamStatValue}>{Math.round(((agentStats?.activeAgents || 0) / (agentStats?.totalAgents || 1)) * 100)}%</Text>
            <Text style={styles.teamStatLabel}>Disponibilité</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderTeamView = () => (
    <View style={styles.teamContainer}>
      {agents.map((agent) => (
        <View key={agent.id} style={styles.agentCard}>
          <View style={styles.agentHeader}>
            <View style={styles.agentInfo}>
              <Text style={styles.agentName}>{agent.name}</Text>
              <Text style={styles.agentBadge}>{agent.badge} • {agent.rank}</Text>
            </View>
            <View style={[styles.agentStatus, { backgroundColor: getAgentStatusColor(agent.status) }]}>
              <Text style={styles.agentStatusText}>
                {agent.status === 'active' ? 'Actif' : agent.status === 'busy' ? 'Occupé' : 'Hors ligne'}
              </Text>
            </View>
          </View>
          
          <View style={styles.agentDetails}>
            <View style={styles.agentDetailRow}>
              <Ionicons name="car" size={16} color={COLORS.textLight} />
              <Text style={styles.agentDetailText}>{agent.vehicle}</Text>
            </View>
            <View style={styles.agentDetailRow}>
              <Ionicons name="time" size={16} color={COLORS.textLight} />
              <Text style={styles.agentDetailText}>{agent.experience} ans d'expérience</Text>
            </View>
            <View style={styles.agentDetailRow}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.textLight} />
              <Text style={styles.agentDetailText}>{agent.alertsHandled} alertes traitées</Text>
            </View>
          </View>
          
          <View style={styles.agentSpecializations}>
            {agent.specializations.map((spec, index) => (
              <View key={index} style={styles.specializationTag}>
                <Text style={styles.specializationText}>{spec}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.agentMetrics}>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{agent.responseTime} min</Text>
              <Text style={styles.metricLabel}>Temps moyen</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{agent.availability === 'available' ? 'Disponible' : agent.availability === 'busy' ? 'Occupé' : agent.availability === 'break' ? 'Pause' : 'Hors service'}</Text>
              <Text style={styles.metricLabel}>Statut</Text>
            </View>
          </View>
        </View>
      ))}
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
          <View>
            <Text style={styles.title}>Dashboard Agent</Text>
            <Text style={styles.subtitle}>
              {currentView === 'alerts' && `${filteredAlerts.length} alerte(s) • ${agents.filter(a => a.status === 'active').length} agent(s) actif(s)`}
              {currentView === 'stats' && `${agentStats?.alertsToday} alertes aujourd'hui • ${agentStats?.averageResponseTime}min temps moyen`}
              {currentView === 'team' && `${agents.length} agents • ${agents.filter(a => a.availability === 'available').length} disponibles`}
              {currentView === 'map' && 'Vue cartographique • Suivi en temps réel'}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push('/agent-profile')}
            >
              <Ionicons name="person-circle" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => {
                logout();
                router.replace('/role-selection');
              }}
            >
              <Ionicons name="log-out" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Navigation par onglets */}
        <View style={styles.tabNavigation}>
          <TouchableOpacity
            style={[styles.tabButton, currentView === 'alerts' && styles.tabButtonActive]}
            onPress={() => setCurrentView('alerts')}
          >
            <Ionicons 
              name="alert-circle" 
              size={18} 
              color={currentView === 'alerts' ? COLORS.white : COLORS.textLight} 
            />
            <Text style={[styles.tabText, currentView === 'alerts' && styles.tabTextActive]}>
              Alertes
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, currentView === 'stats' && styles.tabButtonActive]}
            onPress={() => setCurrentView('stats')}
          >
            <Ionicons 
              name="stats-chart" 
              size={18} 
              color={currentView === 'stats' ? COLORS.white : COLORS.textLight} 
            />
            <Text style={[styles.tabText, currentView === 'stats' && styles.tabTextActive]}>
              Stats
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, currentView === 'team' && styles.tabButtonActive]}
            onPress={() => setCurrentView('team')}
          >
            <Ionicons 
              name="people" 
              size={18} 
              color={currentView === 'team' ? COLORS.white : COLORS.textLight} 
            />
            <Text style={[styles.tabText, currentView === 'team' && styles.tabTextActive]}>
              Équipe
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, currentView === 'map' && styles.tabButtonActive]}
            onPress={() => setCurrentView('map')}
          >
            <Ionicons 
              name="map" 
              size={18} 
              color={currentView === 'map' ? COLORS.white : COLORS.textLight} 
            />
            <Text style={[styles.tabText, currentView === 'map' && styles.tabTextActive]}>
              Carte
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Filtres - seulement pour la vue alertes */}
        {currentView === 'alerts' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
          >
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Statut:</Text>
              {['all', 'pending', 'processing', 'resolved'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterButton,
                    filterStatus === status && styles.filterButtonActive,
                  ]}
                  onPress={() => setFilterStatus(status as any)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      filterStatus === status && styles.filterButtonTextActive,
                    ]}
                  >
                    {status === 'all' ? 'Tous' : status === 'pending' ? 'En attente' : status === 'processing' ? 'En cours' : 'Résolus'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Priorité:</Text>
              {['all', 'emergency', 'urgent', 'normal'].map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.filterButton,
                    filterPriority === priority && styles.filterButtonActive,
                  ]}
                  onPress={() => setFilterPriority(priority as any)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      filterPriority === priority && styles.filterButtonTextActive,
                    ]}
                  >
                    {priority === 'all' ? 'Toutes' : priority === 'emergency' ? 'Urgence' : priority === 'urgent' ? 'Urgente' : 'Normale'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </Animated.View>

      {/* Contenu principal */}
      {currentView === 'map' ? (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: userLocation?.coords.latitude || 14.7167,
              longitude: userLocation?.coords.longitude || -17.4677,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsCompass={true}
            showsScale={true}
            mapType="standard"
          >
            {/* Marqueur de l'agent actuel */}
            {userLocation && (
              <Marker
                coordinate={{
                  latitude: userLocation.coords.latitude,
                  longitude: userLocation.coords.longitude,
                }}
                title="Votre position"
                description="Agent en service"
              >
                <View style={[styles.agentMarker, { backgroundColor: COLORS.primary }]}>
                  <Ionicons name="person" size={16} color={COLORS.white} />
                </View>
              </Marker>
            )}

            {/* Marqueurs des autres agents */}
            {agents.map(renderAgentMarker)}

            {/* Marqueurs des alertes */}
            {alerts.map(renderAlertMarker)}
          </MapView>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {currentView === 'alerts' && (
            filteredAlerts.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="shield-checkmark" size={48} color={COLORS.textLight} />
                <Text style={styles.emptyStateTitle}>Aucune alerte</Text>
                <Text style={styles.emptyStateDescription}>
                  {filterStatus === 'all' 
                    ? 'Aucune alerte en cours'
                    : `Aucune alerte ${filterStatus === 'pending' ? 'en attente' : filterStatus === 'processing' ? 'en cours' : 'résolue'}`
                  }
                </Text>
              </View>
            ) : (
              filteredAlerts.map(renderAlertCard)
            )
          )}

          {currentView === 'stats' && agentStats && renderStatsView()}
          {currentView === 'team' && renderTeamView()}
        </ScrollView>
      )}

      {/* Modal détails alerte */}
      <Modal
        visible={showAlertDetails}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedAlert && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setShowAlertDetails(false)}
              >
                <Text style={styles.modalCancelButton}>Fermer</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Détails de l'alerte</Text>
              <View style={{ width: 50 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Informations principales */}
              <View style={styles.detailSection}>
                <View style={styles.detailHeader}>
                  <View style={[styles.alertTypeIndicator, { backgroundColor: getTypeColor(selectedAlert.type) }]}>
                    <Ionicons name={getTypeIcon(selectedAlert.type) as any} size={20} color={COLORS.white} />
                  </View>
                  <View style={styles.detailHeaderInfo}>
                    <Text style={styles.detailTitle}>{selectedAlert.title}</Text>
                    <Text style={styles.detailTime}>
                      {Math.round((Date.now() - selectedAlert.timestamp.getTime()) / 60000)} minutes
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.detailDescription}>{selectedAlert.description}</Text>
                
                <View style={styles.detailMeta}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Catégorie:</Text>
                    <Text style={styles.detailValue}>{selectedAlert.category}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Localisation:</Text>
                    <Text style={styles.detailValue}>{selectedAlert.location.address}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Signalé par:</Text>
                    <Text style={styles.detailValue}>{selectedAlert.citizenName}</Text>
                  </View>
                  {selectedAlert.citizenPhone && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Téléphone:</Text>
                      <Text style={styles.detailValue}>{selectedAlert.citizenPhone}</Text>
                    </View>
                  )}
                  {selectedAlert.estimatedArrival && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Temps d'arrivée:</Text>
                      <Text style={styles.detailValue}>{selectedAlert.estimatedArrival} minutes</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Médias */}
              {(selectedAlert.photo || selectedAlert.audioRecording || selectedAlert.videoRecording) && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Médias</Text>
                  
                  {selectedAlert.photo && (
                    <View style={styles.mediaContainer}>
                      <Text style={styles.mediaLabel}>Photo:</Text>
                      <Image source={{ uri: selectedAlert.photo }} style={styles.mediaImage} />
                    </View>
                  )}
                  
                  {selectedAlert.audioRecording && (
                    <View style={styles.mediaContainer}>
                      <Text style={styles.mediaLabel}>Enregistrement audio:</Text>
                      <TouchableOpacity style={styles.audioButton}>
                        <Ionicons name="play" size={20} color={COLORS.white} />
                        <Text style={styles.audioButtonText}>Écouter</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {selectedAlert.videoRecording && (
                    <View style={styles.mediaContainer}>
                      <Text style={styles.mediaLabel}>Vidéo:</Text>
                      <TouchableOpacity style={styles.videoButton}>
                        <Ionicons name="play-circle" size={24} color={COLORS.primary} />
                        <Text style={styles.videoButtonText}>Lire la vidéo</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              {/* Informations supplémentaires */}
              {selectedAlert.additionalInfo && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Informations supplémentaires</Text>
                  <Text style={styles.additionalInfo}>{selectedAlert.additionalInfo}</Text>
                </View>
              )}

              {/* Actions */}
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Actions</Text>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.navigateButton}
                    onPress={() => {
                      setShowAlertDetails(false);
                      router.push('/agent-navigation');
                    }}
                  >
                    <Ionicons name="navigate" size={20} color={COLORS.white} />
                    <Text style={styles.navigateButtonText}>Navigation</Text>
                  </TouchableOpacity>
                  
                  {selectedAlert.status === 'pending' && (
                    <TouchableOpacity
                      style={[styles.takeChargeButton, isTakingCharge && styles.takeChargeButtonDisabled]}
                      onPress={() => handleTakeCharge(selectedAlert)}
                      disabled={isTakingCharge}
                    >
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                      <Text style={styles.takeChargeButtonText}>
                        {isTakingCharge ? 'Prise en charge...' : 'Prendre en charge'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
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
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
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
  mapToggleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    marginTop: 8,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  alertCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertTypeIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertHeaderInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  alertTime: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  alertStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  alertStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.white,
  },
  alertDescription: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertMeta: {
    flex: 1,
  },
  alertCategory: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primary,
    marginBottom: 2,
  },
  alertCitizen: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  alertActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  agentMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  alertMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalCancelButton: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  detailTime: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2,
  },
  detailDescription: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  detailMeta: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  mediaContainer: {
    marginBottom: 16,
  },
  mediaLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  mediaImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  audioButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  videoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  additionalInfo: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  navigateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  navigateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  takeChargeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  takeChargeButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  takeChargeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  // Styles pour la navigation par onglets
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
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
  // Styles pour les statistiques
  statsContainer: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
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
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  performanceSection: {
    marginBottom: 24,
  },
  performanceGrid: {
    gap: 12,
  },
  performanceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  performanceLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  teamSection: {
    marginBottom: 24,
  },
  teamStats: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamStat: {
    flex: 1,
    alignItems: 'center',
  },
  teamStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  teamStatLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  // Styles pour la vue équipe
  teamContainer: {
    padding: 20,
    gap: 16,
  },
  agentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  agentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  agentBadge: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  agentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  agentStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.white,
  },
  agentDetails: {
    marginBottom: 12,
    gap: 6,
  },
  agentDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  agentDetailText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  agentSpecializations: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  specializationTag: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  specializationText: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.primary,
  },
  agentMetrics: {
    flexDirection: 'row',
    gap: 16,
  },
  metric: {
    flex: 1,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 10,
    color: COLORS.textLight,
  },
});
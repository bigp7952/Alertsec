import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
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
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

// Types pour les alertes
interface AlertData {
  id: string;
  type: 'emergency' | 'urgent' | 'normal';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  timestamp: Date;
  description: string;
  title: string;
  status: 'pending' | 'processing' | 'resolved';
  category: string;
  affectedArea?: string;
}

// Types pour les zones de danger
interface DangerZone {
  id: string;
  name: string;
  type: 'high_crime' | 'accident' | 'construction' | 'event';
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number;
  severity: 'low' | 'medium' | 'high';
  lastUpdate: Date;
  description: string;
}

export default function MapScreen() {
  // États
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [dangerZones, setDangerZones] = useState<DangerZone[]>([]);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [showAlerts, setShowAlerts] = useState(true);
  const [showDangerZones, setShowDangerZones] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<AlertData | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 14.7167,
    longitude: -17.4677,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Animations
  const mapOpacity = useRef(new Animated.Value(0)).current;
  const controlsOpacity = useRef(new Animated.Value(0)).current;
  const alertListSlide = useRef(new Animated.Value(300)).current;

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
    // Couleurs pour les zones de danger
    dangerHigh: '#EF4444',
    dangerMedium: '#F59E0B',
    dangerLow: '#10B981',
  };

  useEffect(() => {
    initializeMap();
    loadMockData();
    startAnimations();
  }, []);

  const initializeMap = async () => {
    try {
      // Demander la permission de localisation
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Erreur', 'Permission de localisation refusée');
        return;
      }

      // Obtenir la position actuelle
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setUserLocation(location);
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      console.log('📍 Carte initialisée avec succès');
    } catch (error) {
      console.error('❌ Erreur initialisation carte:', error);
      Alert.alert('Erreur', 'Impossible d\'initialiser la carte');
    }
  };

  const loadMockData = () => {
    // Simulation d'alertes
    const mockAlerts: AlertData[] = [
      {
        id: '1',
        type: 'emergency',
        severity: 'critical',
        location: { latitude: 14.7167, longitude: -17.4677, accuracy: 10 },
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        description: 'ALERTE D\'URGENCE EXTREME - Double-clic détecté',
        title: 'Urgence Extrême',
        status: 'pending',
        category: 'Sécurité',
        affectedArea: 'Avenue Bourguiba',
      },
      {
        id: '2',
        type: 'urgent',
        severity: 'high',
        location: { latitude: 14.7200, longitude: -17.4600, accuracy: 15 },
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        description: 'Accident de circulation avec blessés',
        title: 'Accident de Circulation',
        status: 'processing',
        category: 'Circulation',
        affectedArea: 'Intersection Bourguiba/Leopold Sedar Senghor',
      },
      {
        id: '3',
        type: 'normal',
        severity: 'medium',
        location: { latitude: 14.7100, longitude: -17.4700, accuracy: 20 },
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        description: 'Bruit suspect dans le quartier',
        title: 'Bruit Suspect',
        status: 'resolved',
        category: 'Sécurité',
        affectedArea: 'Quartier Plateau',
      },
    ];

    // Simulation de zones de danger
    const mockDangerZones: DangerZone[] = [
      {
        id: '1',
        name: 'Zone de travaux',
        type: 'construction',
        center: { latitude: 14.7167, longitude: -17.4677 },
        radius: 200,
        severity: 'medium',
        lastUpdate: new Date(),
        description: 'Travaux de rénovation en cours',
      },
      {
        id: '2',
        name: 'Accident de circulation',
        type: 'accident',
        center: { latitude: 14.7200, longitude: -17.4600 },
        radius: 150,
        severity: 'high',
        lastUpdate: new Date(),
        description: 'Accident avec embouteillage',
      },
      {
        id: '3',
        name: 'Manifestation',
        type: 'event',
        center: { latitude: 14.7100, longitude: -17.4700 },
        radius: 300,
        severity: 'medium',
        lastUpdate: new Date(),
        description: 'Manifestation pacifique en cours',
      },
    ];

    setAlerts(mockAlerts);
    setDangerZones(mockDangerZones);
  };

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(mapOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(controlsOpacity, {
        toValue: 1,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(alertListSlide, {
        toValue: 0,
        duration: 600,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleMapTypeChange = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const types: Array<'standard' | 'satellite' | 'hybrid'> = ['standard', 'satellite', 'hybrid'];
    const currentIndex = types.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % types.length;
    setMapType(types[nextIndex]);
  };

  const handleMyLocation = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (userLocation) {
      setMapRegion({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const handleAlertPress = async (alert: AlertData) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedAlert(alert);
    
    // Centrer la carte sur l'alerte
    setMapRegion({
      latitude: alert.location.latitude,
      longitude: alert.location.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
  };

  const handleCreateAlert = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/alert-form');
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'emergency': return 'warning';
      case 'urgent': return 'alert-circle';
      case 'normal': return 'information-circle';
      default: return 'help-circle';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'emergency': return COLORS.emergency;
      case 'urgent': return COLORS.urgent;
      case 'normal': return COLORS.normal;
      default: return COLORS.textLight;
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

  const getDangerZoneColor = (severity: string) => {
    switch (severity) {
      case 'high': return COLORS.dangerHigh;
      case 'medium': return COLORS.dangerMedium;
      case 'low': return COLORS.dangerLow;
      default: return COLORS.textLight;
    }
  };

  const renderAlertMarkers = () => {
    return alerts.map((alert) => (
      <Marker
        key={alert.id}
        coordinate={{
          latitude: alert.location.latitude,
          longitude: alert.location.longitude,
        }}
        title={alert.title}
        description={alert.description}
        onPress={() => handleAlertPress(alert)}
      >
        <View style={[
          styles.alertMarker,
          {
            backgroundColor: getAlertColor(alert.type),
            borderColor: selectedAlert?.id === alert.id ? COLORS.white : 'transparent',
          },
        ]}>
          <Ionicons
            name={getAlertIcon(alert.type) as any}
            size={20}
            color={COLORS.white}
          />
        </View>
      </Marker>
    ));
  };

  const renderDangerZones = () => {
    return dangerZones.map((zone) => (
      <Circle
        key={zone.id}
        center={{
          latitude: zone.center.latitude,
          longitude: zone.center.longitude,
        }}
        radius={zone.radius}
        strokeColor={getDangerZoneColor(zone.severity)}
        fillColor={getDangerZoneColor(zone.severity) + '20'}
        strokeWidth={2}
      />
    ));
  };

  const renderAlertList = () => (
    <Animated.View style={[styles.alertListContainer, { transform: [{ translateY: alertListSlide }] }]}>
      <View style={styles.alertListHeader}>
        <Text style={styles.alertListTitle}>Alertes récentes</Text>
        <TouchableOpacity
          onPress={() => setShowAlerts(!showAlerts)}
          style={styles.toggleButton}
        >
          <Ionicons 
            name={showAlerts ? 'eye-off' : 'eye'} 
            size={20} 
            color={COLORS.primary} 
          />
        </TouchableOpacity>
      </View>
      
      {showAlerts && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.alertListContent}
        >
          {alerts.map((alert) => (
            <TouchableOpacity
              key={alert.id}
              onPress={() => handleAlertPress(alert)}
              style={[
                styles.alertCard,
                {
                  borderLeftColor: getAlertColor(alert.type),
                  backgroundColor: selectedAlert?.id === alert.id ? getAlertColor(alert.type) + '10' : COLORS.white,
                },
              ]}
            >
              <View style={styles.alertCardHeader}>
                <View style={[
                  styles.alertTypeIndicator,
                  { backgroundColor: getAlertColor(alert.type) }
                ]}>
                  <Ionicons
                    name={getAlertIcon(alert.type) as any}
                    size={16}
                    color={COLORS.white}
                  />
                </View>
                <Text style={styles.alertTime}>
                  {Math.floor((Date.now() - alert.timestamp.getTime()) / 60000)}min
                </Text>
              </View>
              
              <Text style={styles.alertTitle} numberOfLines={1}>
                {alert.title}
              </Text>
              
              <Text style={styles.alertDescription} numberOfLines={2}>
                {alert.description}
              </Text>
              
              <View style={[
                styles.alertStatus,
                { backgroundColor: getStatusColor(alert.status) }
              ]}>
                <Text style={styles.alertStatusText}>
                  {alert.status === 'pending' ? 'En attente' :
                   alert.status === 'processing' ? 'En cours' : 'Résolu'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* En-tête */}
      <View style={styles.header}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryLight]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Carte Interactive</Text>
              <Text style={styles.headerSubtitle}>Alertes et zones de danger</Text>
            </View>
            
            <View style={styles.headerRight}>
              <TouchableOpacity
                onPress={() => setShowDangerZones(!showDangerZones)}
                style={styles.toggleButton}
              >
                <Ionicons 
                  name={showDangerZones ? 'eye-off' : 'eye'} 
                  size={20} 
                  color={COLORS.white} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Carte */}
      <Animated.View style={[styles.mapContainer, { opacity: mapOpacity }]}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={mapRegion}
          mapType={mapType}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          showsBuildings={true}
          showsTraffic={true}
          showsIndoors={true}
          onRegionChangeComplete={setMapRegion}
        >
          {/* Marqueur utilisateur */}
          {userLocation && (
            <Marker
              coordinate={{
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
              }}
              title="Ma position"
              description="Position actuelle"
            >
              <View style={styles.userMarker}>
                <Ionicons name="person" size={16} color={COLORS.white} />
              </View>
            </Marker>
          )}

          {/* Marqueurs d'alertes */}
          {renderAlertMarkers()}

          {/* Zones de danger */}
          {showDangerZones && renderDangerZones()}
        </MapView>
      </Animated.View>

      {/* Contrôles de la carte */}
      <Animated.View style={[styles.controlsContainer, { opacity: controlsOpacity }]}>
        <View style={styles.controlsContent}>
          <TouchableOpacity
            onPress={handleMapTypeChange}
            style={styles.controlButton}
          >
            <BlurView intensity={20} style={styles.controlButtonBlur}>
              <LinearGradient
                colors={[COLORS.white, COLORS.background]}
                style={styles.controlButtonGradient}
              >
                <Ionicons name="map" size={20} color={COLORS.primary} />
              </LinearGradient>
            </BlurView>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleMyLocation}
            style={styles.controlButton}
          >
            <BlurView intensity={20} style={styles.controlButtonBlur}>
              <LinearGradient
                colors={[COLORS.white, COLORS.background]}
                style={styles.controlButtonGradient}
              >
                <Ionicons name="locate" size={20} color={COLORS.primary} />
              </LinearGradient>
            </BlurView>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleCreateAlert}
            style={styles.controlButton}
          >
            <BlurView intensity={20} style={styles.controlButtonBlur}>
              <LinearGradient
                colors={[COLORS.emergency, COLORS.critical]}
                style={styles.controlButtonGradient}
              >
                <Ionicons name="add" size={20} color={COLORS.white} />
              </LinearGradient>
            </BlurView>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Liste des alertes */}
      {renderAlertList()}

      {/* Légende */}
      <View style={styles.legendContainer}>
        <View style={styles.legendContent}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: COLORS.emergency }]} />
            <Text style={styles.legendText}>Urgence</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: COLORS.urgent }]} />
            <Text style={styles.legendText}>Urgent</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: COLORS.normal }]} />
            <Text style={styles.legendText}>Normal</Text>
          </View>
        </View>
      </View>
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
  // Couleurs pour les alertes
  emergency: '#DC2626',
  urgent: '#F59E0B',
  normal: '#3B82F6',
  // Couleurs pour les zones de danger
  dangerHigh: '#EF4444',
  dangerMedium: '#F59E0B',
  dangerLow: '#10B981',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.white + 'CC',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  userMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
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
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  controlsContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 140 : 120,
    right: 20,
    zIndex: 1000,
  },
  controlsContent: {
    gap: 12,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  controlButtonBlur: {
    flex: 1,
  },
  controlButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertListContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    height: 140,
    zIndex: 1000,
  },
  alertListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  alertListTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  alertListContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  alertCard: {
    width: 200,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  alertTypeIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertTime: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textLight,
    lineHeight: 16,
    marginBottom: 8,
  },
  alertStatus: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  alertStatusText: {
    fontSize: 8,
    fontWeight: '600',
    color: COLORS.white,
  },
  legendContainer: {
    position: 'absolute',
    bottom: 180,
    left: 20,
    zIndex: 1000,
  },
  legendContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text,
  },
});

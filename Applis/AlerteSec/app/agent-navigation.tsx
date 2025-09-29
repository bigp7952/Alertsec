import { Ionicons } from '@expo/vector-icons';
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
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

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

interface NavigationData {
  destination: {
    latitude: number;
    longitude: number;
    address: string;
  };
  distance: number;
  duration: number;
  route: {
    latitude: number;
    longitude: number;
  }[];
  currentLocation: {
    latitude: number;
    longitude: number;
  };
}

export default function AgentNavigationScreen() {
  // États
  const [navigationData, setNavigationData] = useState<NavigationData | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [navigationSteps, setNavigationSteps] = useState<string[]>([]);

  // Refs
  const mapRef = useRef<MapView>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Données simulées
  const mockNavigationData: NavigationData = {
    destination: {
      latitude: 14.7167,
      longitude: -17.4677,
      address: 'Avenue Bourguiba, Dakar',
    },
    distance: 2.5,
    duration: 8,
    route: [
      { latitude: 14.7150, longitude: -17.4680 },
      { latitude: 14.7155, longitude: -17.4675 },
      { latitude: 14.7160, longitude: -17.4670 },
      { latitude: 14.7167, longitude: -17.4677 },
    ],
    currentLocation: {
      latitude: 14.7150,
      longitude: -17.4680,
    },
  };

  const mockSteps = [
    'Continuez tout droit sur l\'Avenue Bourguiba',
    'Tournez à droite sur la Rue de la République',
    'Continuez sur 200 mètres',
    'Vous êtes arrivé à destination',
  ];

  useEffect(() => {
    setNavigationData(mockNavigationData);
    setNavigationSteps(mockSteps);
    initializeLocation();
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
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
      console.error('Erreur localisation navigation:', error);
    }
  };

  const startNavigation = () => {
    setIsNavigating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Simulation de navigation
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < navigationSteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setIsNavigating(false);
          Alert.alert('Navigation terminée', 'Vous êtes arrivé à destination');
          return prev;
        }
      });
    }, 5000);
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setCurrentStep(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const centerOnLocation = (location: { latitude: number; longitude: number }) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: slideAnim,
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
            <Text style={styles.title}>Navigation</Text>
            <Text style={styles.subtitle}>Vers l'alerte</Text>
          </View>
          <TouchableOpacity
            style={styles.stopButton}
            onPress={stopNavigation}
          >
            <Ionicons name="stop" size={24} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Carte */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: navigationData?.currentLocation.latitude || 14.7150,
            longitude: navigationData?.currentLocation.longitude || -17.4680,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          showsScale={true}
          mapType="standard"
        >
          {/* Position actuelle */}
          {navigationData && (
            <Marker
              coordinate={navigationData.currentLocation}
              title="Votre position"
              description="Position actuelle"
            >
              <View style={styles.currentLocationMarker}>
                <Ionicons name="person" size={16} color={COLORS.white} />
              </View>
            </Marker>
          )}

          {/* Destination */}
          {navigationData && (
            <Marker
              coordinate={navigationData.destination}
              title="Destination"
              description="Alerte à traiter"
            >
              <View style={styles.destinationMarker}>
                <Ionicons name="flag" size={16} color={COLORS.white} />
              </View>
            </Marker>
          )}

          {/* Itinéraire */}
          {navigationData && (
            <Polyline
              coordinates={navigationData.route}
              strokeColor={COLORS.primary}
              strokeWidth={4}
              lineDashPattern={[5, 5]}
            />
          )}
        </MapView>
      </View>

      {/* Panneau de navigation */}
      <Animated.View
        style={[
          styles.navigationPanel,
          {
            transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [200, 0] }) }],
          },
        ]}
      >
        <LinearGradient
          colors={[COLORS.white, COLORS.background]}
          style={styles.panelGradient}
        >
          {/* Informations de navigation */}
          <View style={styles.navigationInfo}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="time" size={20} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Temps</Text>
                <Text style={styles.infoValue}>{navigationData?.duration} min</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="navigate" size={20} color={COLORS.success} />
                <Text style={styles.infoLabel}>Distance</Text>
                <Text style={styles.infoValue}>{navigationData?.distance} km</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="location" size={20} color={COLORS.warning} />
                <Text style={styles.infoLabel}>Destination</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {navigationData?.destination.address}
                </Text>
              </View>
            </View>
          </View>

          {/* Instructions de navigation */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Instructions</Text>
            <ScrollView style={styles.instructionsList} showsVerticalScrollIndicator={false}>
              {navigationSteps.map((step, index) => (
                <View
                  key={index}
                  style={[
                    styles.instructionItem,
                    index === currentStep && styles.instructionItemActive,
                  ]}
                >
                  <View style={[
                    styles.instructionNumber,
                    index === currentStep && styles.instructionNumberActive,
                  ]}>
                    <Text style={[
                      styles.instructionNumberText,
                      index === currentStep && styles.instructionNumberTextActive,
                    ]}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text style={[
                    styles.instructionText,
                    index === currentStep && styles.instructionTextActive,
                  ]}>
                    {step}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Boutons d'action */}
          <View style={styles.actionButtons}>
            {!isNavigating ? (
              <TouchableOpacity
                style={styles.startButton}
                onPress={startNavigation}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.startButtonGradient}
                >
                  <Ionicons name="play" size={20} color={COLORS.white} />
                  <Text style={styles.startButtonText}>Commencer la navigation</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.navigationControls}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => centerOnLocation(navigationData?.currentLocation || { latitude: 0, longitude: 0 })}
                >
                  <Ionicons name="locate" size={20} color={COLORS.primary} />
                  <Text style={styles.controlButtonText}>Ma position</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => centerOnLocation(navigationData?.destination || { latitude: 0, longitude: 0 })}
                >
                  <Ionicons name="flag" size={20} color={COLORS.error} />
                  <Text style={styles.controlButtonText}>Destination</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </LinearGradient>
      </Animated.View>
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
  stopButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  currentLocationMarker: {
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
  destinationMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.error,
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
  navigationPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: height * 0.6,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  panelGradient: {
    padding: 20,
  },
  navigationInfo: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 2,
  },
  instructionsContainer: {
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  instructionsList: {
    maxHeight: 150,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  instructionItemActive: {
    backgroundColor: COLORS.primary + '10',
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instructionNumberActive: {
    backgroundColor: COLORS.primary,
  },
  instructionNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  instructionNumberTextActive: {
    color: COLORS.white,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  instructionTextActive: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  actionButtons: {
    marginTop: 10,
  },
  startButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  navigationControls: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
});


import { useApp } from '@/contexts/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { Camera } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';

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
  // Couleurs pour les zones de danger
  dangerHigh: '#EF4444',
  dangerMedium: '#F59E0B',
  dangerLow: '#10B981',
};

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
  audioRecording?: string;
  videoRecording?: string;
  description?: string;
  status: 'pending' | 'processing' | 'resolved';
  userId: string;
  userName: string;
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
}

export default function HomeScreen() {
  // Contexte global
  const { 
    userLocation, 
    userType, 
    isAuthenticated,
    mapRegion, 
    isMapInitialized,
    setUserLocation, 
    setMapRegion, 
    setMapInitialized 
  } = useApp();

  // États locaux
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [dangerZones, setDangerZones] = useState<DangerZone[]>([]);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [emergencyCountdown, setEmergencyCountdown] = useState(10);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [microphonePermission, setMicrophonePermission] = useState<boolean | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [mediaLibraryPermission, setMediaLibraryPermission] = useState<boolean | null>(null);

  // Refs pour les animations
  const emergencyButtonScale = useRef(new Animated.Value(1)).current;
  const emergencyButtonRotation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const mapRef = useRef<MapView>(null);

  // Données simulées pour les alertes
  const mockAlerts: AlertData[] = [
    {
      id: '1',
      type: 'emergency',
      severity: 'critical',
      location: { latitude: 14.7167, longitude: -17.4677, accuracy: 5 },
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      description: 'Accident de circulation grave',
      status: 'pending',
      userId: 'user1',
      userName: 'A. Diallo',
    },
    {
      id: '2',
      type: 'urgent',
      severity: 'high',
      location: { latitude: 14.7200, longitude: -17.4700, accuracy: 8 },
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      description: 'Agression signalée',
      status: 'processing',
      userId: 'user2',
      userName: 'M. Ndiaye',
    },
    {
      id: '3',
      type: 'normal',
      severity: 'medium',
      location: { latitude: 14.7100, longitude: -17.4600, accuracy: 10 },
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      description: 'Véhicule en panne',
      status: 'resolved',
      userId: 'user3',
      userName: 'K. Ba',
    },
  ];

  // Données simulées pour les zones de danger
  const mockDangerZones: DangerZone[] = [
    {
      id: 'zone1',
      name: 'Zone de travaux',
      type: 'construction',
      center: { latitude: 14.7150, longitude: -17.4650 },
      radius: 200,
      severity: 'medium',
      lastUpdate: new Date(),
    },
    {
      id: 'zone2',
      name: 'Zone à risque',
      type: 'high_crime',
      center: { latitude: 14.7250, longitude: -17.4750 },
      radius: 300,
      severity: 'high',
      lastUpdate: new Date(),
    },
  ];

  // Initialisation des permissions
  useEffect(() => {
    // Vérifier l'authentification et le type d'utilisateur
    if (!isAuthenticated || userType !== 'citizen') {
      // Rediriger vers la sélection de rôle si pas authentifié ou pas citoyen
      router.replace('/role-selection');
      return;
    }

    requestPermissions();
    setAlerts(mockAlerts);
    setDangerZones(mockDangerZones);
    startPulseAnimation();
  }, [isAuthenticated, userType]);

  // Animation de pulsation continue
  const startPulseAnimation = () => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(pulse);
    };
    pulse();
  };

  // Demande des permissions
  const requestPermissions = async () => {
    try {
      // Permission de localisation
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(locationStatus === 'granted');

      // Permission caméra
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(cameraStatus === 'granted');

      // Permission microphone
      const { status: audioStatus } = await Audio.requestPermissionsAsync();
      setMicrophonePermission(audioStatus === 'granted');

      // Permission bibliothèque média
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      setMediaLibraryPermission(mediaStatus === 'granted');

      // Obtenir la position actuelle si pas déjà définie
      if (locationStatus === 'granted' && !userLocation) {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy || 0,
        });
      }
    } catch (error) {
      console.error('Erreur lors de la demande de permissions:', error);
    }
  };

  // Gestion du double-clic pour urgence extrême
  const handleEmergencyDoublePress = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      Vibration.vibrate([0, 500, 200, 500]);

      setIsEmergencyMode(true);
      setEmergencyCountdown(10);

      // Animation du bouton
      Animated.parallel([
        Animated.sequence([
          Animated.timing(emergencyButtonScale, {
            toValue: 1.2,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(emergencyButtonScale, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(emergencyButtonRotation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Démarrage des enregistrements automatiques
      await startEmergencyRecording();

      // Compte à rebours
      const countdownInterval = setInterval(() => {
        setEmergencyCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            sendEmergencyAlert();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error) {
      console.error('Erreur lors de l\'urgence extrême:', error);
      Alert.alert('Erreur', 'Impossible de déclencher l\'urgence extrême');
    }
  };

  // Démarrage des enregistrements d'urgence
  const startEmergencyRecording = async () => {
    try {
      setIsRecording(true);

      // Arrêter l'enregistrement existant s'il y en a un
      if (recording) {
        try {
          await recording.stopAndUnloadAsync();
          setRecording(null);
        } catch (stopError) {
          console.log('Aucun enregistrement à arrêter');
        }
      }

      // Enregistrement audio
      if (microphonePermission) {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(newRecording);
      }

      // Enregistrement vidéo avec Camera
      if (cameraPermission) {
        try {
          const videoUri = `video_emergency_${Date.now()}.mp4`;
          console.log('Enregistrement vidéo démarré:', videoUri);
          // Simulation d'enregistrement vidéo
          setTimeout(() => {
            console.log('Enregistrement vidéo terminé:', videoUri);
          }, 10000);
        } catch (videoError) {
          console.error('Erreur enregistrement vidéo:', videoError);
        }
      }

    } catch (error) {
      console.error('Erreur lors du démarrage des enregistrements:', error);
    }
  };

  // Envoi de l'alerte d'urgence
  const sendEmergencyAlert = async () => {
    try {
      // Arrêt des enregistrements
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        console.log('Enregistrement audio sauvegardé:', uri);
      }

      // Création de l'alerte d'urgence
      const emergencyAlert: AlertData = {
        id: Date.now().toString(),
        type: 'emergency',
        severity: 'critical',
        location: userLocation ? {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          accuracy: userLocation.accuracy || 0,
        } : { latitude: 14.7167, longitude: -17.4677, accuracy: 0 },
        timestamp: new Date(),
        audioRecording: recording?.getURI() || undefined,
        videoRecording: 'video_emergency.mp4', // Simulation
        description: 'URGENCE EXTRÊME - Enregistrements automatiques activés',
        status: 'pending',
        userId: 'current_user',
        userName: 'Utilisateur',
      };

      setAlerts(prev => [emergencyAlert, ...prev]);
      setIsEmergencyMode(false);
      setIsRecording(false);
      setRecording(null);

      // Animation de succès
      Animated.timing(emergencyButtonRotation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      Alert.alert(
        'Alerte d\'urgence envoyée',
        'Votre alerte d\'urgence a été transmise aux forces de l\'ordre avec vos enregistrements audio et vidéo.',
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'alerte:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer l\'alerte d\'urgence');
    }
  };

  // Gestion du clic simple pour alerte normale
  const handleNormalAlertPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/alert-form');
  };

  // Retour à la position de l'utilisateur
  const centerOnUserLocation = () => {
    if (userLocation && userLocation.latitude && userLocation.longitude && mapRef.current) {
      const region = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current.animateToRegion(region);
      setMapRegion(region);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Alert.alert('Position non disponible', 'Impossible de localiser votre position');
    }
  };

  // Rendu des marqueurs d'alerte
  const renderAlertMarkers = () => {
    return alerts.map((alert) => {
      let markerColor = COLORS.normal;
      if (alert.type === 'emergency') markerColor = COLORS.emergency;
      else if (alert.type === 'urgent') markerColor = COLORS.urgent;

  return (
        <Marker
          key={alert.id}
          coordinate={alert.location}
          title={`Alerte ${alert.type}`}
          description={alert.description}
        >
          <View style={[styles.alertMarker, { backgroundColor: markerColor }]}>
            <Ionicons
              name={alert.type === 'emergency' ? 'warning' : alert.type === 'urgent' ? 'alert-circle' : 'information-circle'}
              size={20}
              color={COLORS.white}
            />
          </View>
        </Marker>
      );
    });
  };

  // Rendu des zones de danger
  const renderDangerZones = () => {
    return dangerZones.map((zone) => {
      let zoneColor = COLORS.dangerLow;
      if (zone.severity === 'high') zoneColor = COLORS.dangerHigh;
      else if (zone.severity === 'medium') zoneColor = COLORS.dangerMedium;

      return (
        <Circle
          key={zone.id}
          center={zone.center}
          radius={zone.radius}
          strokeColor={zoneColor}
          fillColor={`${zoneColor}20`}
          strokeWidth={2}
        />
      );
    });
  };

  // Rendu des cartes d'alerte compactes
  const renderAlertCards = () => {
    return alerts.slice(0, 2).map((alert) => {
      let typeColor = COLORS.normal;
      let typeIcon = 'information-circle';
      if (alert.type === 'emergency') {
        typeColor = COLORS.emergency;
        typeIcon = 'warning';
      } else if (alert.type === 'urgent') {
        typeColor = COLORS.urgent;
        typeIcon = 'alert-circle';
      }

      let statusColor = COLORS.warning;
      let statusText = 'En attente';
      if (alert.status === 'processing') {
        statusColor = COLORS.primary;
        statusText = 'En cours';
      } else if (alert.status === 'resolved') {
        statusColor = COLORS.success;
        statusText = 'Résolu';
      }

      return (
        <Animatable.View
          key={alert.id}
          animation="slideInRight"
          duration={500}
          style={styles.alertCard}
        >
          <View style={styles.alertCardHeader}>
            <View style={[styles.alertTypeIndicator, { backgroundColor: typeColor }]}>
              <Ionicons name={typeIcon as any} size={12} color={COLORS.white} />
            </View>
            <Text style={styles.alertTime}>
              {Math.round((Date.now() - alert.timestamp.getTime()) / 60000)}min
            </Text>
          </View>
          
          <Text style={styles.alertDescription} numberOfLines={1}>
            {alert.description}
          </Text>
          
          <View style={styles.alertFooter}>
            <Text style={styles.alertUser}>{alert.userName}</Text>
            <View style={[styles.alertStatus, { backgroundColor: statusColor }]}>
              <Text style={styles.alertStatusText}>{statusText}</Text>
            </View>
          </View>
        </Animatable.View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Carte interactive */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={mapRegion || {
          latitude: (userLocation && userLocation.latitude) ? userLocation.latitude : 14.7167,
          longitude: (userLocation && userLocation.longitude) ? userLocation.longitude : -17.4677,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onRegionChangeComplete={(region) => {
          if (!isMapInitialized) {
            setMapInitialized(true);
          }
          setMapRegion(region);
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        mapType="standard"
      >
        {/* Marqueur de l'utilisateur */}
        {userLocation && userLocation.latitude && userLocation.longitude && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Ma position"
            description="Votre position actuelle"
          >
            <View style={styles.userMarker}>
              <Ionicons name="person" size={16} color={COLORS.white} />
            </View>
          </Marker>
        )}

        {/* Marqueurs d'alertes */}
        {renderAlertMarkers()}

        {/* Zones de danger */}
        {renderDangerZones()}
      </MapView>

      {/* Bouton d'urgence principal */}
      <View style={styles.emergencyButtonContainer}>
        <Animated.View
          style={[
            styles.emergencyButton,
            {
              transform: [
                { scale: emergencyButtonScale },
                { scale: pulseAnimation },
                {
                  rotate: emergencyButtonRotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.emergencyButtonInner}
            onPress={handleNormalAlertPress}
            onLongPress={handleEmergencyDoublePress}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.emergency, COLORS.critical]}
              style={styles.emergencyButtonGradient}
            >
              <Ionicons name="warning" size={32} color={COLORS.white} />
              <Text style={styles.emergencyButtonText}>
                {isEmergencyMode ? emergencyCountdown : 'ALERTE'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Bouton retour position */}
      <TouchableOpacity
        style={styles.locationButton}
        onPress={centerOnUserLocation}
        activeOpacity={0.8}
      >
        <Ionicons name="locate" size={20} color={COLORS.primary} />
      </TouchableOpacity>

      {/* Indicateurs de statut */}
      <View style={styles.statusIndicators}>
        {isRecording && (
          <Animatable.View
            animation="pulse"
            iterationCount="infinite"
            style={styles.recordingIndicator}
          >
            <Ionicons name="mic" size={14} color={COLORS.error} />
            <Text style={styles.recordingText}>ENREGISTREMENT</Text>
          </Animatable.View>
        )}
      </View>

          {/* Liste des alertes récentes */}
          <View style={styles.alertListContainer}>
            <View style={styles.alertListHeader}>
              <Text style={styles.alertListTitle}>Alertes récentes</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity>
                  <Ionicons name="refresh" size={16} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.alertListContent}>
              {renderAlertCards()}
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
    borderColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  emergencyButtonContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 1000,
  },
  emergencyButton: {
    width: 70,
    height: 70,
  },
  emergencyButtonInner: {
    flex: 1,
    borderRadius: 35,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emergencyButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  emergencyButtonText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  alertListContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    height: 90,
    zIndex: 1000,
  },
  alertListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  alertListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
      headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      },
  alertListContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  alertCard: {
    width: 260,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  alertTypeIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertTime: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  alertDescription: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text,
    lineHeight: 16,
    marginBottom: 8,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertUser: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  alertStatus: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  alertStatusText: {
    fontSize: 8,
    fontWeight: '600',
    color: COLORS.white,
  },
  locationButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 140 : 120,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  statusIndicators: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 200 : 180,
    right: 20,
    zIndex: 1000,
    gap: 8,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordingText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.error,
  },
});
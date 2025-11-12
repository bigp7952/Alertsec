import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService, { User, Signalement, Notification, Communication, AgentTracking } from '../services/api';
import { authService, LoginCredentials, RegisterData } from '../services/authService';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { arePushNotificationsAvailable, showExpoGoWarning } from '../utils/expo-go-limitations';

interface ApiContextType {
  // État de l'authentification
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  // Méthodes d'authentification
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;

  // État des signalements
  signalements: Signalement[];
  signalementsLoading: boolean;
  signalementsError: string | null;

  // État des notifications
  notifications: Notification[];
  unreadNotificationsCount: number;
  notificationsLoading: boolean;

  // État des zones de danger
  dangerZones: any[];
  dangerZonesLoading: boolean;

  // État du tracking
  currentLocation: Location.LocationObject | null;
  trackingActive: boolean;

  // Méthodes pour les signalements
  fetchSignalements: () => Promise<void>;
  fetchCitizenSignalements: () => Promise<void>;
  createSignalement: (signalementData: any) => Promise<Signalement>;
  updateSignalementStatus: (signalementId: number, status: string, notes?: string) => Promise<void>;

  // Méthodes pour les notifications
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: number) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;

  // Méthodes pour les communications
  getCommunications: (signalementId: number) => Promise<Communication[]>;
  sendMessage: (signalementId: number, contenu: string, type?: string) => Promise<Communication>;

  // Méthodes pour le tracking
  startLocationTracking: () => Promise<void>;
  stopLocationTracking: () => void;
  updateLocation: (location: Location.LocationObject) => Promise<void>;

  // Méthodes pour les médias
  uploadMedia: (signalementId: number, mediaUri: string, type: string) => Promise<any>;
  capturePhoto: () => Promise<string>;
  recordVideo: () => Promise<string>;
  recordAudio: () => Promise<string>;

  // Méthodes pour les zones de danger
  fetchDangerZones: () => Promise<void>;

  // Méthodes utilitaires
  refreshData: () => Promise<void>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

interface ApiProviderProps {
  children: ReactNode;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  // État de l'authentification
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // État des signalements
  const [signalements, setSignalements] = useState<Signalement[]>([]);
  const [signalementsLoading, setSignalementsLoading] = useState(false);
  const [signalementsError, setSignalementsError] = useState<string | null>(null);

  // État des notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // État des zones de danger
  const [dangerZones, setDangerZones] = useState<any[]>([]);
  const [dangerZonesLoading, setDangerZonesLoading] = useState(false);

  // État du tracking
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [trackingActive, setTrackingActive] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);

  // Initialiser l'application
  useEffect(() => {
    initializeApp();
  }, []);

  // Données mock pour citoyens
  const getMockCitizenSignalements = (): Signalement[] => [
    {
      id: 1001 as any,
      citoyen_id: 501 as any,
      description: 'Accident de circulation grave avec plusieurs véhicules impliqués',
      niveau: 'grave' as any,
      status: 'non traité' as any,
      type: 'accident' as any,
      priorite: 'critique' as any,
      latitude: 14.7167 as any,
      longitude: -17.4677 as any,
      adresse: 'Avenue Bourguiba, Dakar' as any,
      heure: new Date().toISOString() as any,
      date_signalement: new Date(Date.now() - 5 * 60 * 1000).toISOString() as any,
      citoyen: { prenom: 'A.', nom: 'Diallo' } as any,
    } as unknown as Signalement,
    {
      id: 1002 as any,
      citoyen_id: 502 as any,
      description: 'Agression signalée dans le quartier',
      niveau: 'élevé' as any,
      status: 'en cours' as any,
      type: 'agression' as any,
      priorite: 'haute' as any,
      latitude: 14.72 as any,
      longitude: -17.47 as any,
      adresse: 'Rue de la République, Dakar' as any,
      heure: new Date().toISOString() as any,
      date_signalement: new Date(Date.now() - 15 * 60 * 1000).toISOString() as any,
      citoyen: { prenom: 'M.', nom: 'Ndiaye' } as any,
    } as unknown as Signalement,
    {
      id: 1003 as any,
      citoyen_id: 503 as any,
      description: 'Véhicule en panne bloquant la circulation',
      niveau: 'moyen' as any,
      status: 'traité' as any,
      type: 'accident' as any,
      priorite: 'moyenne' as any,
      latitude: 14.71 as any,
      longitude: -17.46 as any,
      adresse: 'Boulevard Général de Gaulle, Dakar' as any,
      heure: new Date().toISOString() as any,
      date_signalement: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() as any,
      citoyen: { prenom: 'K.', nom: 'Ba' } as any,
    } as unknown as Signalement,
    {
      id: 1004 as any,
      citoyen_id: 504 as any,
      description: 'Tentative de vol de sac à main signalée',
      niveau: 'moyen' as any,
      status: 'en cours' as any,
      type: 'vol' as any,
      priorite: 'haute' as any,
      latitude: 14.7150 as any,
      longitude: -17.4650 as any,
      adresse: 'Marché Sandaga, Dakar' as any,
      heure: new Date().toISOString() as any,
      date_signalement: new Date(Date.now() - 45 * 60 * 1000).toISOString() as any,
      citoyen: { prenom: 'S.', nom: 'Seck' } as any,
    } as unknown as Signalement,
    {
      id: 1005 as any,
      citoyen_id: 505 as any,
      description: 'Fumée suspecte près du bâtiment',
      niveau: 'élevé' as any,
      status: 'traité' as any,
      type: 'incendie' as any,
      priorite: 'haute' as any,
      latitude: 14.7180 as any,
      longitude: -17.4680 as any,
      adresse: 'Quartier Plateau, Dakar' as any,
      heure: new Date().toISOString() as any,
      date_signalement: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() as any,
      citoyen: { prenom: 'I.', nom: 'Thiam' } as any,
    } as unknown as Signalement,
    {
      id: 1006 as any,
      citoyen_id: 506 as any,
      description: 'Bruit suspect et activité inhabituelle',
      niveau: 'faible' as any,
      status: 'traité' as any,
      type: 'autre' as any,
      priorite: 'moyenne' as any,
      latitude: 14.7130 as any,
      longitude: -17.4630 as any,
      adresse: 'Corniche Ouest, Dakar' as any,
      heure: new Date().toISOString() as any,
      date_signalement: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() as any,
      citoyen: { prenom: 'F.', nom: 'Diop' } as any,
    } as unknown as Signalement,
  ];

  const getMockDangerZones = (): any[] => [
    {
      id: 2001,
      nom: 'Zone à risque modéré',
      type: 'high_crime',
      niveau_risque: 5,
      latitude_centre: 14.715,
      longitude_centre: -17.465,
      rayon: 400,
      couleur: '#F59E0B',
      dernier_incident: new Date().toISOString(),
    },
    {
      id: 2002,
      nom: 'Zone critique',
      type: 'accident',
      niveau_risque: 8,
      latitude_centre: 14.725,
      longitude_centre: -17.475,
      rayon: 300,
      couleur: '#EF4444',
      dernier_incident: new Date().toISOString(),
    },
  ];

  const initializeApp = async () => {
    try {
      setLoading(true);
      
      // Initialiser le service d'authentification
      const sessionData = await authService.initialize();
      
      if (sessionData) {
        setUser(sessionData.user);
        setIsAuthenticated(true);
        
        // Charger les données initiales
        await Promise.all([
          sessionData.user.role === 'agent' ? fetchSignalements() : fetchCitizenSignalements(),
          fetchNotifications(),
          fetchDangerZones(),
        ]);

        // Démarrer le tracking si c'est un agent
        if (sessionData.user.role === 'agent') {
          await startLocationTracking();
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      setError('Erreur lors de l\'initialisation de l\'application');
    } finally {
      setLoading(false);
    }
  };

  // Méthodes d'authentification
  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const authResponse = await authService.login(credentials);
      setUser(authResponse.data.user);
      setIsAuthenticated(true);

      // Charger les données après connexion
      await Promise.all([
        authResponse.data.user.role === 'agent' ? fetchSignalements() : fetchCitizenSignalements(),
        fetchNotifications(),
        fetchDangerZones(),
      ]);

      // Démarrer le tracking si c'est un agent
      if (authResponse.data.user.role === 'agent') {
        await startLocationTracking();
      }

      // Enregistrer pour les notifications push
      await registerForPushNotifications();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      
      const authResponse = await authService.register(userData);
      setUser(authResponse.data.user);
      setIsAuthenticated(true);

      // Charger les données après inscription
      await Promise.all([
        authResponse.data.user.role === 'agent' ? fetchSignalements() : fetchCitizenSignalements(),
        fetchNotifications(),
        fetchDangerZones(),
      ]);

      // Démarrer le tracking si c'est un agent
      if (authResponse.data.user.role === 'agent') {
        await startLocationTracking();
      }

      // Enregistrer pour les notifications push
      await registerForPushNotifications();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur d\'inscription';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await stopLocationTracking();
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setSignalements([]);
      setNotifications([]);
      setUnreadNotificationsCount(0);
      setCurrentLocation(null);
      setError(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const logoutAll = async () => {
    try {
      await stopLocationTracking();
      await authService.logoutAll();
      setUser(null);
      setIsAuthenticated(false);
      setSignalements([]);
      setNotifications([]);
      setUnreadNotificationsCount(0);
      setCurrentLocation(null);
      setError(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion globale:', error);
    }
  };

  // Méthodes pour les signalements
  const fetchSignalements = async () => {
    if (!isAuthenticated || user?.role !== 'agent') return;

    try {
      setSignalementsLoading(true);
      setSignalementsError(null);
      
      const data = await apiService.getAgentSignalements();
      setSignalements(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des signalements';
      setSignalementsError(errorMessage);
    } finally {
      setSignalementsLoading(false);
    }
  };

  const fetchCitizenSignalements = async () => {
    // Charger toujours les données mock pour les citoyens, même si user n'est pas défini
    try {
      setSignalementsLoading(true);
      setSignalementsError(null);
      // Utiliser des données mock pour citoyens
      const data = getMockCitizenSignalements();
      setSignalements(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des signalements';
      setSignalementsError(errorMessage);
      // En cas d'erreur, utiliser quand même les mocks
      setSignalements(getMockCitizenSignalements());
    } finally {
      setSignalementsLoading(false);
    }
  };

  const createSignalement = async (signalementData: any) => {
    try {
      // Pour les citoyens ou si user n'est pas défini, créer un signalement mock directement
      if (!user || user?.role === 'citoyen') {
        const newSignalement: Signalement = {
          id: Date.now() as any, // Générer un ID unique
          citoyen_id: user?.id || 501 as any,
          description: signalementData.description || 'Signalement créé',
          niveau: signalementData.priorite === 'critique' ? 'grave' : signalementData.priorite === 'haute' ? 'élevé' : 'moyen' as any,
          status: 'non traité' as any,
          type: signalementData.type || 'autre' as any,
          priorite: signalementData.priorite || 'moyenne' as any,
          latitude: signalementData.latitude || 14.7167 as any,
          longitude: signalementData.longitude || -17.4677 as any,
          adresse: signalementData.adresse || 'Position actuelle' as any,
          heure: new Date().toISOString() as any,
          date_signalement: new Date().toISOString() as any,
          citoyen: { prenom: user?.prenom || 'Utilisateur', nom: user?.nom || 'Test' } as any,
        } as unknown as Signalement;
        
        // Ajouter le signalement à la liste immédiatement
        setSignalements(prev => [newSignalement, ...prev]);
        return newSignalement;
      } else {
        // Pour les agents, utiliser l'API
        const newSignalement = await apiService.createSignalement(signalementData);
        setSignalements(prev => [newSignalement, ...prev]);
        return newSignalement;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création du signalement';
      setError(errorMessage);
      throw error;
    }
  };

  const updateSignalementStatus = async (signalementId: number, status: string, notes?: string) => {
    try {
      const updatedSignalement = await apiService.updateSignalementStatus(signalementId, status, notes);
      setSignalements(prev => 
        prev.map(s => s.id === signalementId ? updatedSignalement : s)
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour du signalement';
      setError(errorMessage);
      throw error;
    }
  };

  // Méthodes pour les notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;

    try {
      setNotificationsLoading(true);
      const data = await apiService.getNotifications();
      setNotifications(data);
      setUnreadNotificationsCount(data.filter(n => !n.lu).length);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId: number) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, lu: true } : n)
      );
      setUnreadNotificationsCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      // Implémenter cette méthode dans l'API si nécessaire
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
      setUnreadNotificationsCount(0);
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
    }
  };

  // Méthodes pour les communications
  const getCommunications = async (signalementId: number): Promise<Communication[]> => {
    try {
      return await apiService.getCommunications(signalementId);
    } catch (error) {
      console.error('Erreur lors du chargement des communications:', error);
      return [];
    }
  };

  const sendMessage = async (signalementId: number, contenu: string, type: string = 'message'): Promise<Communication> => {
    try {
      return await apiService.sendMessage(signalementId, contenu, type);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'envoi du message';
      setError(errorMessage);
      throw error;
    }
  };

  // Méthodes pour le tracking
  const startLocationTracking = async () => {
    if (!isAuthenticated || user?.role !== 'agent') return;

    try {
      const subscription = await apiService.startLocationTracking((location) => {
        setCurrentLocation(location);
        updateLocation(location);
      });
      
      setLocationSubscription(subscription);
      setTrackingActive(true);
    } catch (error) {
      console.error('Erreur lors du démarrage du tracking:', error);
    }
  };

  const stopLocationTracking = async () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
      setTrackingActive(false);
    }
  };

  const updateLocation = async (location: Location.LocationObject) => {
    try {
      const locationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        vitesse: location.coords.speed || 0,
        direction: location.coords.heading || 0,
        batterie: 100, // Vous pouvez obtenir le niveau de batterie avec expo-battery
        status: 'en mission',
      };

      await apiService.updateLocation(locationData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la position:', error);
    }
  };

  // Méthodes pour les médias
  const uploadMedia = async (signalementId: number, mediaUri: string, type: string) => {
    try {
      return await apiService.uploadMedia(signalementId, mediaUri, type);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'upload du média';
      setError(errorMessage);
      throw error;
    }
  };

  const capturePhoto = async (): Promise<string> => {
    try {
      return await apiService.capturePhoto();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la capture photo';
      setError(errorMessage);
      throw error;
    }
  };

  const recordVideo = async (): Promise<string> => {
    try {
      return await apiService.recordVideo();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'enregistrement vidéo';
      setError(errorMessage);
      throw error;
    }
  };

  const recordAudio = async (): Promise<string> => {
    try {
      return await apiService.recordAudio();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'enregistrement audio';
      setError(errorMessage);
      throw error;
    }
  };

  // Méthodes pour les zones de danger
  const fetchDangerZones = async () => {
    try {
      setDangerZonesLoading(true);
      if (!isAuthenticated || user?.role === 'citoyen') {
        setDangerZones(getMockDangerZones());
      } else {
        const data = await apiService.getAllDangerZones();
        setDangerZones(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des zones de danger:', error);
    } finally {
      setDangerZonesLoading(false);
    }
  };

  // Méthodes utilitaires
  const refreshData = async () => {
    if (!isAuthenticated) return;

    try {
      await Promise.all([
        user?.role === 'agent' ? fetchSignalements() : fetchCitizenSignalements(),
        fetchNotifications(),
        fetchDangerZones(),
      ]);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des données:', error);
    }
  };

  // Enregistrer pour les notifications push
  const registerForPushNotifications = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission de notification refusée');
        return;
      }

      const token = await Notifications.getExpoPushTokenAsync();
      await apiService.sendPushToken(token.data);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement pour les notifications push:', error);
    }
  };

  // Configuration des notifications
  useEffect(() => {
    if (arePushNotificationsAvailable()) {
      try {
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });

        // Écouter les notifications reçues
        const subscription = Notifications.addNotificationReceivedListener(notification => {
          // Rafraîchir les notifications
          fetchNotifications();
        });

        return () => subscription.remove();
      } catch (error) {
        console.warn('Erreur lors de la configuration des notifications:', error);
      }
    } else {
      showExpoGoWarning('Notifications push');
    }
  }, []);

  // Rafraîchir les données périodiquement
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      refreshData();
    }, 30000); // Toutes les 30 secondes

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const contextValue: ApiContextType = {
    // État de l'authentification
    user,
    isAuthenticated,
    loading,
    error,

    // Méthodes d'authentification
    login,
    register,
    logout,
    logoutAll,

    // État des signalements
    signalements,
    signalementsLoading,
    signalementsError,

    // État des notifications
    notifications,
    unreadNotificationsCount,
    notificationsLoading,

    // État des zones de danger
    dangerZones,
    dangerZonesLoading,

    // État du tracking
    currentLocation,
    trackingActive,

    // Méthodes pour les signalements
    fetchSignalements,
    fetchCitizenSignalements,
    createSignalement,
    updateSignalementStatus,

    // Méthodes pour les notifications
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,

    // Méthodes pour les communications
    getCommunications,
    sendMessage,

    // Méthodes pour le tracking
    startLocationTracking,
    stopLocationTracking,
    updateLocation,

    // Méthodes pour les médias
    uploadMedia,
    capturePhoto,
    recordVideo,
    recordAudio,

    // Méthodes pour les zones de danger
    fetchDangerZones,

    // Méthodes utilitaires
    refreshData,
  };

  return (
    <ApiContext.Provider value={contextValue}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

export default ApiContext;


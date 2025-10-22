import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';

// Configuration de l'API
const API_BASE_URL = 'http://localhost:8000/api';

// Types pour l'API
export interface User {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  grade: string;
  unite: string;
  secteur: string;
  role: 'admin' | 'superviseur' | 'agent' | 'citoyen';
  email: string;
  telephone: string;
  adresse: string;
  specialites?: string[];
  experience?: number;
  charge_travail?: number;
  distance_max?: number;
  taux_reussite?: number;
  temps_moyen_intervention?: number;
}

export interface Signalement {
  id: number;
  citoyen_id: number;
  description: string;
  niveau: string;
  status: string;
  type: string;
  priorite: string;
  latitude: number;
  longitude: number;
  adresse: string;
  heure: string;
  date_signalement: string;
  agent_assigne_id?: number;
  date_assignation?: string;
  date_traitement?: string;
  contact: any;
  medias: any;
  notes_agent?: string;
  citoyen?: User;
  agent_assigne?: User;
  communications?: Communication[];
}

export interface Communication {
  id: number;
  signalement_id: number;
  user_id: number;
  type: string;
  contenu: string;
  envoyeur: string;
  lu: boolean;
  created_at: string;
  user?: User;
}

export interface AgentTracking {
  id: number;
  agent_id: number;
  latitude: number;
  longitude: number;
  vitesse: number;
  direction: number;
  batterie: number;
  is_online: boolean;
  derniere_activite: string;
  signalement_id?: number;
  debut_mission?: string;
  fin_mission_prevue?: string;
  agent?: User;
}

export interface Notification {
  id: number;
  user_id: number;
  titre: string;
  message: string;
  type: string;
  donnees: any;
  lu: boolean;
  created_at: string;
}

export interface ZoneDanger {
  id: number;
  nom: string;
  latitude_centre: number;
  longitude_centre: number;
  rayon: number;
  type: string;
  niveau_risque: number;
  nombre_alertes: number;
  population: number;
  dernier_incident: string;
  facteurs_risque: string[];
  recommandations: string[];
}

export interface AuthResponse {
  user: User;
  token: string;
  token_type: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// Classe principale de l'API
class ApiService {
  private token: string | null = null;
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.initializeToken();
  }

  // Initialiser le token depuis AsyncStorage
  private async initializeToken() {
    try {
      this.token = await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
    }
  }

  // Méthodes d'authentification
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/mobile/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Erreur de connexion');
      }

      const data: ApiResponse<AuthResponse> = await response.json();
      
      if (data.success) {
        this.token = data.data.token;
        await AsyncStorage.setItem('auth_token', data.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
      }

      return data.data;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.token) {
        await fetch(`${this.baseURL}/mobile/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        });
      }
      
      this.token = null;
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }

  async getProfile(): Promise<User> {
    const response = await this.makeRequest<User>('/mobile/profile');
    return response;
  }

  // Méthodes pour la géolocalisation
  async updateLocation(location: {
    latitude: number;
    longitude: number;
    vitesse?: number;
    direction?: number;
    batterie?: number;
    status?: string;
  }): Promise<AgentTracking> {
    const response = await this.makeRequest<AgentTracking>('/mobile/location/update', {
      method: 'POST',
      body: JSON.stringify(location),
    });
    return response;
  }

  // Méthodes pour les signalements
  async getAgentSignalements(): Promise<Signalement[]> {
    const response = await this.makeRequest<Signalement[]>('/mobile/signalements');
    return response;
  }

  async getCitizenSignalements(): Promise<Signalement[]> {
    const response = await this.makeRequest<Signalement[]>('/mobile/citizen/signalements');
    return response;
  }

  async getAllSignalements(): Promise<Signalement[]> {
    const response = await this.makeRequest<Signalement[]>('/signalements');
    return response;
  }

  async createSignalement(signalementData: {
    description: string;
    type: string;
    priorite: string;
    latitude: number;
    longitude: number;
    adresse: string;
    medias?: any[];
  }): Promise<Signalement> {
    const response = await this.makeRequest<Signalement>('/mobile/signalements/create', {
      method: 'POST',
      body: JSON.stringify(signalementData),
    });
    return response;
  }

  async updateSignalementStatus(signalementId: number, status: string, notes?: string): Promise<Signalement> {
    const response = await this.makeRequest<Signalement>(`/mobile/signalements/${signalementId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, notes_agent: notes }),
    });
    return response;
  }

  // Méthodes pour les notifications
  async getNotifications(): Promise<Notification[]> {
    const response = await this.makeRequest<Notification[]>('/mobile/notifications');
    return response;
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await this.makeRequest(`/mobile/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  // Méthodes pour les communications
  async getCommunications(signalementId: number): Promise<Communication[]> {
    const response = await this.makeRequest<Communication[]>(`/mobile/signalements/${signalementId}/communications`);
    return response;
  }

  async sendMessage(signalementId: number, contenu: string, type: string = 'message'): Promise<Communication> {
    const response = await this.makeRequest<Communication>(`/mobile/signalements/${signalementId}/message`, {
      method: 'POST',
      body: JSON.stringify({ contenu, type }),
    });
    return response;
  }

  // Méthodes pour l'upload de médias
  async uploadMedia(signalementId: number, mediaUri: string, type: string): Promise<any> {
    const formData = new FormData();
    
    // Ajouter le fichier
    formData.append('media', {
      uri: mediaUri,
      type: this.getMimeType(type),
      name: `media_${Date.now()}.${this.getFileExtension(type)}`,
    } as any);
    
    formData.append('type', type);

    const response = await fetch(`${this.baseURL}/mobile/signalements/${signalementId}/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Erreur upload média');
    }

    const data: ApiResponse<any> = await response.json();
    return data.data;
  }

  // Méthodes pour les zones de danger
  async getDangerZones(): Promise<ZoneDanger[]> {
    const response = await this.makeRequest<ZoneDanger[]>('/mobile/zones/danger');
    return response;
  }

  async getAllDangerZones(): Promise<ZoneDanger[]> {
    const response = await this.makeRequest<ZoneDanger[]>('/zones-danger');
    return response;
  }

  // Méthodes pour les positions des agents
  async getAgentPositions(): Promise<AgentTracking[]> {
    const response = await this.makeRequest<AgentTracking[]>('/mobile/agents/positions');
    return response;
  }

  // Méthodes utilitaires pour la géolocalisation
  async getCurrentLocation(): Promise<Location.LocationObject> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission de localisation refusée');
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return location;
  }

  async startLocationTracking(callback: (location: Location.LocationObject) => void): Promise<Location.LocationSubscription> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission de localisation refusée');
    }

    return await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 30000, // 30 secondes
        distanceInterval: 100, // 100 mètres
      },
      callback
    );
  }

  // Méthodes pour les médias
  async requestMediaPermissions(): Promise<boolean> {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === 'granted';
  }

  async capturePhoto(): Promise<string> {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission d\'accès aux médias refusée');
    }

    // Ici vous devriez utiliser expo-camera pour capturer une photo
    // Cette méthode est un placeholder
    throw new Error('Méthode de capture photo non implémentée');
  }

  async recordVideo(): Promise<string> {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission d\'accès aux médias refusée');
    }

    // Ici vous devriez utiliser expo-camera pour enregistrer une vidéo
    // Cette méthode est un placeholder
    throw new Error('Méthode d\'enregistrement vidéo non implémentée');
  }

  async recordAudio(): Promise<string> {
    // Ici vous devriez utiliser expo-av pour enregistrer l'audio
    // Cette méthode est un placeholder
    throw new Error('Méthode d\'enregistrement audio non implémentée');
  }

  // Méthode utilitaire pour faire des requêtes
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      defaultHeaders['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        if (response.status === 401) {
          // Token expiré, déconnecter l'utilisateur
          await this.logout();
          throw new Error('Session expirée');
        }
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data: ApiResponse<T> = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur API');
      }

      return data.data;
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  }

  // Méthodes utilitaires pour les médias
  private getMimeType(type: string): string {
    switch (type) {
      case 'photo':
        return 'image/jpeg';
      case 'video':
        return 'video/mp4';
      case 'audio':
        return 'audio/mpeg';
      default:
        return 'application/octet-stream';
    }
  }

  private getFileExtension(type: string): string {
    switch (type) {
      case 'photo':
        return 'jpg';
      case 'video':
        return 'mp4';
      case 'audio':
        return 'mp3';
      default:
        return 'bin';
    }
  }

  // Méthode pour vérifier la santé de l'API
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      const data = await response.json();
      return data.success;
    } catch {
      return false;
    }
  }

  // Méthodes pour obtenir les informations de l'utilisateur
  getToken(): string | null {
    return this.token;
  }

  async isAuthenticated(): Promise<boolean> {
    return !!this.token;
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userStr = await AsyncStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }

  // Méthodes pour les notifications push
  async registerForPushNotifications(): Promise<string | null> {
    // Ici vous devriez implémenter la logique pour enregistrer l'appareil pour les notifications push
    // Cette méthode est un placeholder
    console.log('Enregistrement pour les notifications push');
    return null;
  }

  async sendPushToken(token: string): Promise<void> {
    // Ici vous devriez envoyer le token FCM au serveur
    console.log('Envoi du token push:', token);
  }
}

// Instance singleton
export const apiService = new ApiService();

export default apiService;


import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { User } from './api';

// Clés de stockage
const STORAGE_KEYS = {
  TOKEN: '@alertesec_token',
  USER: '@alertesec_user',
  REFRESH_TOKEN: '@alertesec_refresh_token',
  LAST_LOGIN: '@alertesec_last_login',
  SESSION_EXPIRY: '@alertesec_session_expiry',
} as const;

// Configuration de l'API - IP locale fixe
function resolveApiBaseUrl(): string {
  // Priorité aux variables publiques Expo si définies
  const envUrl = (Constants?.expoConfig as any)?.extra?.EXPO_PUBLIC_API_BASE_URL
    || (Constants as any)?.manifest2?.extra?.expoClient?.extra?.EXPO_PUBLIC_API_BASE_URL;
  if (envUrl) return `${envUrl.replace(/\/$/, '')}/api`;

  // Configuration selon la plateforme
  if (Platform.OS === 'android') {
    // Android emulator: 10.0.2.2 pointe vers l'hôte
    return 'http://10.0.2.2:8000/api';
  }
  
  if (Platform.OS === 'ios') {
    // iOS simulator: localhost fonctionne
    return 'http://localhost:8000/api';
  }
  
  // Web ou fallback: IP locale
  return 'http://172.20.10.4:8000/api';
}

const API_BASE_URL = resolveApiBaseUrl();

// Types pour l'authentification
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    token_type: string;
  };
}

export interface LoginCredentials {
  email?: string;
  matricule?: string;
  password: string;
  device_name?: string;
}

export interface RegisterData {
  matricule: string;
  nom: string;
  prenom: string;
  grade: string;
  unite: string;
  secteur: string;
  role: 'admin' | 'superviseur' | 'agent' | 'citoyen';
  email: string;
  password: string;
  password_confirmation: string;
  telephone?: string;
  adresse?: string;
  specialites?: string[];
  experience?: number;
  distance_max?: number;
}

export interface SessionData {
  user: User;
  token: string;
  tokenType: string;
  lastLogin: string;
  sessionExpiry: string;
}

class AuthService {
  private baseURL: string;
  private currentToken: string | null = null;
  private currentUser: User | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Initialise le service d'authentification
   * Charge les données de session depuis le stockage local
   */
  async initialize(): Promise<SessionData | null> {
    try {
      const [token, user, lastLogin, sessionExpiry] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_LOGIN),
        AsyncStorage.getItem(STORAGE_KEYS.SESSION_EXPIRY),
      ]);

      if (!token || !user) {
        return null;
      }

      // Vérifier si la session n'a pas expiré
      if (sessionExpiry && new Date(sessionExpiry) < new Date()) {
        await this.clearSession();
        return null;
      }

      this.currentToken = token;
      this.currentUser = JSON.parse(user);

      return {
        user: this.currentUser!,
        token,
        tokenType: 'Bearer',
        lastLogin: lastLogin || new Date().toISOString(),
        sessionExpiry: sessionExpiry || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 jours
      };
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
      return null;
    }
  }

  /**
   * Connexion utilisateur
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          ...credentials,
          device_name: credentials.device_name || 'AlerteSec Mobile',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur de connexion');
      }

      if (data.success) {
        await this.saveSession(data.data);
        this.currentToken = data.data.token;
        this.currentUser = data.data.user;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  }

  /**
   * Inscription utilisateur
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur d\'inscription');
      }

      if (data.success) {
        await this.saveSession(data.data);
        this.currentToken = data.data.token;
        this.currentUser = data.data.user;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  }

  /**
   * Déconnexion utilisateur
   */
  async logout(): Promise<void> {
    try {
      if (this.currentToken) {
        await fetch(`${this.baseURL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.currentToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      await this.clearSession();
    }
  }

  /**
   * Déconnexion de tous les appareils
   */
  async logoutAll(): Promise<void> {
    try {
      if (this.currentToken) {
        await fetch(`${this.baseURL}/auth/logout-all`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.currentToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion globale:', error);
    } finally {
      await this.clearSession();
    }
  }

  /**
   * Récupère le profil utilisateur
   */
  async getProfile(): Promise<User> {
    try {
      if (!this.currentToken) {
        throw new Error('Non authentifié');
      }

      const response = await fetch(`${this.baseURL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.currentToken}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération du profil');
      }

      if (data.success) {
        this.currentUser = data.data;
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.data));
      }

      return data.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      throw error;
    }
  }

  /**
   * Met à jour le profil utilisateur
   */
  async updateProfile(profileData: Partial<User>): Promise<User> {
    try {
      if (!this.currentToken) {
        throw new Error('Non authentifié');
      }

      const response = await fetch(`${this.baseURL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.currentToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la mise à jour du profil');
      }

      if (data.success) {
        this.currentUser = data.data;
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.data));
      }

      return data.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  }

  /**
   * Change le mot de passe
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      if (!this.currentToken) {
        throw new Error('Non authentifié');
      }

      const response = await fetch(`${this.baseURL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.currentToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          current_password: currentPassword,
          password: newPassword,
          password_confirmation: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors du changement de mot de passe');
      }
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      throw error;
    }
  }

  /**
   * Vérifie si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    return this.currentToken !== null && this.currentUser !== null;
  }

  /**
   * Récupère l'utilisateur actuel
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Récupère le token actuel
   */
  getCurrentToken(): string | null {
    return this.currentToken;
  }

  /**
   * Sauvegarde la session dans le stockage local
   */
  private async saveSession(sessionData: any): Promise<void> {
    try {
      const now = new Date();
      const sessionExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 jours

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN, sessionData.token),
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(sessionData.user)),
        AsyncStorage.setItem(STORAGE_KEYS.LAST_LOGIN, now.toISOString()),
        AsyncStorage.setItem(STORAGE_KEYS.SESSION_EXPIRY, sessionExpiry.toISOString()),
      ]);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la session:', error);
      throw error;
    }
  }

  /**
   * Efface la session du stockage local
   */
  private async clearSession(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
        AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.LAST_LOGIN),
        AsyncStorage.removeItem(STORAGE_KEYS.SESSION_EXPIRY),
      ]);

      this.currentToken = null;
      this.currentUser = null;
    } catch (error) {
      console.error('Erreur lors de l\'effacement de la session:', error);
    }
  }

  /**
   * Vérifie si la session est valide
   */
  async isSessionValid(): Promise<boolean> {
    try {
      if (!this.currentToken) {
        return false;
      }

      // Vérifier l'expiration de la session
      const sessionExpiry = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_EXPIRY);
      if (sessionExpiry && new Date(sessionExpiry) < new Date()) {
        await this.clearSession();
        return false;
      }

      // Vérifier la validité du token avec le serveur
      const response = await fetch(`${this.baseURL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.currentToken}`,
          'Accept': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Erreur lors de la vérification de la session:', error);
      return false;
    }
  }

  /**
   * Rafraîchit la session si nécessaire
   */
  async refreshSession(): Promise<boolean> {
    try {
      if (!this.currentToken) {
        return false;
      }

      const isValid = await this.isSessionValid();
      if (isValid) {
        return true;
      }

      // Si la session n'est pas valide, déconnecter l'utilisateur
      await this.clearSession();
      return false;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement de la session:', error);
      return false;
    }
  }

  /**
   * Récupère les comptes de démonstration
   */
  async getDemoAccounts(): Promise<User[]> {
    try {
      const response = await fetch(`${this.baseURL}/users/demo-accounts`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération des comptes de démonstration');
      }

      return data.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des comptes de démonstration:', error);
      throw error;
    }
  }
}

// Instance singleton du service d'authentification
export const authService = new AuthService();

export default authService;

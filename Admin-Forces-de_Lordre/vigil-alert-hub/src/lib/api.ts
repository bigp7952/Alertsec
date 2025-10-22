// Configuration de l'API Laravel (prend VITE_API_BASE_URL si présent)
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Interface pour les réponses API
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// Interface pour l'authentification
interface AuthResponse {
  user: User;
  token: string;
  token_type: string;
}

// Interface utilisateur
interface User {
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

// Interface signalement
interface Signalement {
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

// Interface communication
interface Communication {
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

// Interface tracking agent
interface AgentTracking {
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

// Interface zone de danger
interface ZoneDanger {
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

// Interface notification
interface Notification {
  id: number;
  user_id: number;
  titre: string;
  message: string;
  type: string;
  donnees: any;
  lu: boolean;
  created_at: string;
}

// Classe principale de l'API
class ApiService {
  private token: string | null = null;
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  // Méthodes d'authentification
  async login(matricule: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        matricule, 
        password,
        code_service: 'DEMO' // Code service par défaut
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Identifiants incorrects ou serveur inaccessible');
    }

    const data: ApiResponse<AuthResponse> = await response.json();
    
    if (data.success) {
      this.token = data.data.token;
      localStorage.setItem('auth_token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }

    return data.data;
  }

  async logout(): Promise<void> {
    if (this.token) {
      await fetch(`${this.baseURL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });
    }
    
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  async getProfile(): Promise<User> {
    const response = await this.makeRequest<User>('/auth/profile');
    return response;
  }

  // Méthodes pour les signalements
  async getSignalements(): Promise<Signalement[]> {
    const response = await this.makeRequest<Signalement[]>('/signalements');
    return response;
  }

  async getSignalement(id: number): Promise<Signalement> {
    const response = await this.makeRequest<Signalement>(`/signalements/${id}`);
    return response;
  }

  async createSignalement(signalement: Partial<Signalement>): Promise<Signalement> {
    const response = await this.makeRequest<Signalement>('/signalements', {
      method: 'POST',
      body: JSON.stringify(signalement),
    });
    return response;
  }

  async updateSignalement(id: number, updates: Partial<Signalement>): Promise<Signalement> {
    const response = await this.makeRequest<Signalement>(`/signalements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response;
  }

  async deleteSignalement(id: number): Promise<void> {
    await this.makeRequest<void>(`/signalements/${id}`, {
      method: 'DELETE',
    });
  }

  async assignAgent(signalementId: number, agentId: number): Promise<void> {
    await this.makeRequest(`/signalements/${signalementId}/assigner`, {
      method: 'POST',
      body: JSON.stringify({ agent_id: agentId }),
    });
  }

  async autoAssignAgent(signalementId: number): Promise<void> {
    await this.makeRequest(`/signalements/${signalementId}/assignation-automatique`, {
      method: 'POST',
    });
  }

  // Méthodes pour les agents
  async getAgents(): Promise<User[]> {
    // Préférence: endpoint dédié à la liste des forces pour assignation
    try {
      const response = await this.makeRequest<User[]>('/utilisateurs/forces');
      return response;
    } catch {
      // Fallback sur /agents si indisponible
      const response = await this.makeRequest<User[]>('/agents');
      return response;
    }
    return response;
  }

  async getAgent(id: number): Promise<User> {
    const response = await this.makeRequest<User>(`/agents/${id}`);
    return response;
  }

  async getAgentPositions(): Promise<AgentTracking[]> {
    const response = await this.makeRequest<AgentTracking[]>('/agents/positions');
    return response;
  }

  async updateAgent(id: number, updates: Partial<User>): Promise<User> {
    const response = await this.makeRequest<User>(`/agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response;
  }

  async deleteAgent(id: number): Promise<void> {
    await this.makeRequest<void>(`/agents/${id}`, {
      method: 'DELETE',
    });
  }

  async updateAgentPosition(position: Partial<AgentTracking>): Promise<AgentTracking> {
    const response = await this.makeRequest<AgentTracking>('/agents/position/update', {
      method: 'POST',
      body: JSON.stringify(position),
    });
    return response;
  }

  // Méthodes pour les communications
  async getCommunications(signalementId: number): Promise<Communication[]> {
    const response = await this.makeRequest<Communication[]>(`/communications/signalement/${signalementId}`);
    return response;
  }

  async sendMessage(signalementId: number, contenu: string, type: string = 'message'): Promise<Communication> {
    const response = await this.makeRequest<Communication>(`/communications/signalement/${signalementId}`, {
      method: 'POST',
      body: JSON.stringify({ contenu, type }),
    });
    return response;
  }

  // Méthodes pour les zones de danger
  async getDangerZones(): Promise<ZoneDanger[]> {
    const response = await this.makeRequest<ZoneDanger[]>('/zones');
    return response;
  }

  async getFeedbacks(): Promise<any[]> {
    const response = await this.makeRequest<any[]>('/feedbacks');
    return response;
  }

  async getDangerZone(id: number): Promise<ZoneDanger> {
    const response = await this.makeRequest<ZoneDanger>(`/zones/${id}`);
    return response;
  }

  async calculateZoneRisk(zoneId: number): Promise<ZoneDanger> {
    const response = await this.makeRequest<ZoneDanger>(`/zones/${zoneId}/calculate-risk`, {
      method: 'POST',
    });
    return response;
  }

  // Méthodes pour les notifications
  async getNotifications(): Promise<Notification[]> {
    const response = await this.makeRequest<Notification[]>('/notifications');
    return response;
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await this.makeRequest(`/notifications/${notificationId}/mark-read`, {
      method: 'POST',
    });
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await this.makeRequest('/notifications/mark-all-read', {
      method: 'POST',
    });
  }

  async getUnreadNotificationsCount(): Promise<number> {
    const response = await this.makeRequest<{ count: number }>('/notifications/unread-count');
    return response.count;
  }

  // Méthodes pour le dashboard
  async getDashboardStats(): Promise<any> {
    const response = await this.makeRequest('/dashboard');
    return response;
  }

  async getSignalementsStats(): Promise<any> {
    const response = await this.makeRequest('/dashboard/signalements-stats');
    return response;
  }

  async getSuperviseursStats(): Promise<any> {
    const response = await this.makeRequest('/dashboard/superviseurs-stats');
    return response;
  }

  async getAgentsStats(): Promise<any> {
    const response = await this.makeRequest('/dashboard/agents-stats');
    return response;
  }

  async getZonesStats(): Promise<any> {
    const response = await this.makeRequest('/dashboard/zones-stats');
    return response;
  }

  async getMapData(): Promise<any> {
    const response = await this.makeRequest('/dashboard/map-data');
    return response;
  }

  // Méthodes temps réel
  async getRealtimeUpdates(): Promise<any> {
    const response = await this.makeRequest('/realtime/dashboard-data');
    return response;
  }

  async getSignalementsUpdates(): Promise<any> {
    const response = await this.makeRequest('/realtime/signalements-updates');
    return response;
  }

  async getAgentsPositionsUpdates(): Promise<any> {
    const response = await this.makeRequest('/realtime/agents-positions');
    return response;
  }

  async getNotificationsUpdates(): Promise<any> {
    const response = await this.makeRequest('/realtime/notifications-updates');
    return response;
  }

  // Méthodes pour les médias
  async uploadMedia(signalementId: number, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('media', file);
    formData.append('type', this.getMediaType(file));

    const response = await fetch(`${this.baseURL}/signalements/${signalementId}/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Erreur upload média');
    }

    const data: ApiResponse<any> = await response.json();
    return data.data;
  }

  async getSignalementMedia(signalementId: number): Promise<any> {
    const response = await this.makeRequest(`/media/signalement/${signalementId}`);
    return response;
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

    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 401) {
        try {
          this.logout();
        } finally {
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        throw new Error('Session expirée');
      }
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data: ApiResponse<T> = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Erreur API');
    }

    return data.data;
  }

  // Méthode utilitaire pour déterminer le type de média
  private getMediaType(file: File): string {
    if (file.type.startsWith('image/')) {
      return 'photo';
    } else if (file.type.startsWith('video/')) {
      return 'video';
    } else if (file.type.startsWith('audio/')) {
      return 'audio';
    }
    return 'autre';
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

  // Méthode pour obtenir le token actuel
  getToken(): string | null {
    return this.token;
  }

  // Méthode pour vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Méthode pour obtenir l'utilisateur actuel
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

// Instance singleton
export const apiService = new ApiService();

// Export des types
export type {
  User,
  Signalement,
  Communication,
  AgentTracking,
  ZoneDanger,
  Notification,
  ApiResponse,
  AuthResponse,
};

export default apiService;


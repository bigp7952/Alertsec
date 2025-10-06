import { useState, useEffect, useCallback } from 'react';
import apiService, { type User, type Signalement, type AgentTracking, type ZoneDanger, type Notification, type Communication } from '../lib/api';
import { getEcho } from '@/lib/realtime'

// Hook pour l'authentification
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = apiService.getCurrentUser();
        if (currentUser && apiService.isAuthenticated()) {
          setUser(currentUser);
        }
      } catch (err) {
        setError('Erreur d\'initialisation de l\'authentification');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const authResponse = await apiService.login(email, password);
      setUser(authResponse.user);
      setIsAuthenticated(true);
      return authResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiService.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    }
  }, []);

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };
};

// Hook pour les signalements
export const useSignalements = () => {
  const [signalements, setSignalements] = useState<Signalement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSignalements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getSignalements();
      setSignalements(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des signalements';
      setError(errorMessage);
      console.error('Erreur fetchSignalements:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSignalement = useCallback(async (signalementData: Partial<Signalement>) => {
    try {
      const newSignalement = await apiService.createSignalement(signalementData);
      setSignalements(prev => [newSignalement, ...prev]);
      return newSignalement;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du signalement';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateSignalement = useCallback(async (id: number, updates: Partial<Signalement>) => {
    try {
      const updatedSignalement = await apiService.updateSignalement(id, updates);
      setSignalements(prev => 
        prev.map(s => s.id === id ? updatedSignalement : s)
      );
      return updatedSignalement;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du signalement';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteSignalement = useCallback(async (id: number) => {
    try {
      await apiService.deleteSignalement(id);
      setSignalements(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du signalement';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const assignAgent = useCallback(async (signalementId: number, agentId: number) => {
    try {
      await apiService.assignAgent(signalementId, agentId);
      await fetchSignalements(); // Rafraîchir les données
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'assignation de l\'agent';
      setError(errorMessage);
      throw err;
    }
  }, [fetchSignalements]);

  const autoAssignAgent = useCallback(async (signalementId: number) => {
    try {
      await apiService.autoAssignAgent(signalementId);
      await fetchSignalements(); // Rafraîchir les données
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'assignation automatique';
      setError(errorMessage);
      throw err;
    }
  }, [fetchSignalements]);

  useEffect(() => {
    fetchSignalements();
    try {
      const echo = getEcho()
      const channel = (echo as any).channel('signalements')
      channel
        .listen('SignalementCree', (e: any) => {
          const s: Signalement = e.signalement
          setSignalements(prev => [s, ...prev.filter(p => p.id !== s.id)])
        })
        .listen('SignalementMisAJour', (e: any) => {
          const s: Signalement = e.signalement
          setSignalements(prev => prev.map(p => p.id === s.id ? s : p))
        })
    } catch {}
  }, [fetchSignalements]);

  return {
    signalements,
    loading,
    error,
    fetchSignalements,
    createSignalement,
    updateSignalement,
    deleteSignalement,
    assignAgent,
    autoAssignAgent,
  };
};

// Hook pour les agents et leur tracking
export const useAgentTracking = () => {
  const [agents, setAgents] = useState<User[]>([]);
  const [positions, setPositions] = useState<AgentTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [agentsData, positionsData] = await Promise.all([
        apiService.getAgents(),
        apiService.getAgentPositions(),
      ]);
      setAgents(agentsData);
      setPositions(positionsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des agents';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePosition = useCallback(async (positionData: Partial<AgentTracking>) => {
    try {
      const updatedPosition = await apiService.updateAgentPosition(positionData);
      setPositions(prev => 
        prev.map(p => p.agent_id === updatedPosition.agent_id ? updatedPosition : p)
      );
      return updatedPosition;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la position';
      setError(errorMessage);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchAgents();
    try {
      const echo = getEcho()
      const channel = (echo as any).channel('agents')
      channel.listen('AgentPositionMiseAJour', (e: any) => {
        const updated: AgentTracking = e.tracking
        setPositions(prev => prev.some(p => p.id === updated.id)
          ? prev.map(p => p.id === updated.id ? updated : p)
          : [updated, ...prev])
      })
    } catch {}
    const interval = setInterval(fetchAgents, 30000);
    return () => {
      clearInterval(interval)
      try { (getEcho() as any)?.leave?.('agents') } catch {}
    }
  }, [fetchAgents]);

  return {
    agents,
    positions,
    loading,
    error,
    fetchAgents,
    updatePosition,
  };
};

// Hook pour les zones de danger
export const useDangerZones = () => {
  const [zones, setZones] = useState<ZoneDanger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchZones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getDangerZones();
      setZones(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des zones';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateRisk = useCallback(async (zoneId: number) => {
    try {
      const updatedZone = await apiService.calculateZoneRisk(zoneId);
      setZones(prev => 
        prev.map(z => z.id === zoneId ? updatedZone : z)
      );
      return updatedZone;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du calcul du risque';
      setError(errorMessage);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchZones();
    try {
      const echo = getEcho()
      const channel = (echo as any).channel('zones')
      channel.listen('ZoneDangerMiseAJour', (e: any) => {
        const z: ZoneDanger = e.zone
        setZones(prev => prev.map(p => p.id === z.id ? z : p))
      })
    } catch {}
    return () => { try { (getEcho() as any)?.leave?.('zones') } catch {} }
  }, [fetchZones]);

  return {
    zones,
    loading,
    error,
    fetchZones,
    calculateRisk,
  };
};

// Hook pour les notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [notificationsData, countData] = await Promise.all([
        apiService.getNotifications(),
        apiService.getUnreadNotificationsCount(),
      ]);
      setNotifications(notificationsData);
      setUnreadCount(countData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des notifications';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, lu: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du marquage de la notification';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
      setUnreadCount(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du marquage de toutes les notifications';
      setError(errorMessage);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    try {
      const echo = getEcho()
      const channel = (echo as any).channel('notifications')
      channel.listen('NotificationCree', (e: any) => {
        setNotifications(prev => [e.notification, ...prev])
        setUnreadCount(prev => prev + 1)
      })
    } catch {}
    const interval = setInterval(fetchNotifications, 60000);
    return () => {
      clearInterval(interval)
      try { (getEcho() as any)?.leave?.('notifications') } catch {}
    }
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
};

// Hook pour les communications
export const useCommunications = (signalementId: number) => {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommunications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getCommunications(signalementId);
      setCommunications(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des communications';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [signalementId]);

  const sendMessage = useCallback(async (contenu: string, type: string = 'message') => {
    try {
      const newCommunication = await apiService.sendMessage(signalementId, contenu, type);
      setCommunications(prev => [...prev, newCommunication]);
      return newCommunication;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'envoi du message';
      setError(errorMessage);
      throw err;
    }
  }, [signalementId]);

  useEffect(() => {
    if (signalementId) {
      fetchCommunications();
    }
    try {
      const echo = getEcho()
      const channelName = `signalement.${signalementId}`
      const channel = (echo as any).channel(channelName)
      channel.listen('CommunicationCree', (e: any) => {
        setCommunications(prev => [...prev, e.communication])
      })
      return () => { try { (getEcho() as any)?.leave?.(channelName) } catch {} }
    } catch {}
  }, [signalementId, fetchCommunications]);

  return {
    communications,
    loading,
    error,
    fetchCommunications,
    sendMessage,
  };
};

// Hook pour le dashboard
export const useDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [
        dashboardStats,
        signalementsStats,
        agentsStats,
        zonesStats,
        mapData
      ] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getSignalementsStats(),
        apiService.getAgentsStats(),
        apiService.getZonesStats(),
        apiService.getMapData(),
      ]);

      setStats({
        dashboard: dashboardStats,
        signalements: signalementsStats,
        agents: agentsStats,
        zones: zonesStats,
        map: mapData,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement du dashboard';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    
    // Rafraîchir les données du dashboard toutes les 30 secondes
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  return {
    stats,
    loading,
    error,
    fetchDashboardData,
  };
};

// Hook pour les données temps réel
export const useRealtimeData = () => {
  const [realtimeData, setRealtimeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRealtimeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [
        dashboardData,
        signalementsUpdates,
        agentsPositions,
        notificationsUpdates
      ] = await Promise.all([
        apiService.getRealtimeUpdates(),
        apiService.getSignalementsUpdates(),
        apiService.getAgentsPositionsUpdates(),
        apiService.getNotificationsUpdates(),
      ]);

      setRealtimeData({
        dashboard: dashboardData,
        signalements: signalementsUpdates,
        agents: agentsPositions,
        notifications: notificationsUpdates,
        lastUpdate: new Date(),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des données temps réel';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRealtimeData();
    
    // Rafraîchir les données temps réel toutes les 10 secondes
    const interval = setInterval(fetchRealtimeData, 10000);
    return () => clearInterval(interval);
  }, [fetchRealtimeData]);

  return {
    realtimeData,
    loading,
    error,
    fetchRealtimeData,
  };
};

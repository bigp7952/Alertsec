import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useToast } from '@/hooks/use-toast'

export interface Notification {
  id: string
  type: 'emergency' | 'warning' | 'info' | 'success'
  priority: 'critical' | 'high' | 'medium' | 'low'
  title: string
  message: string
  location?: string
  timestamp: Date
  isRead: boolean
  isArchived: boolean
  source: 'system' | 'citizen' | 'agent' | 'dispatch'
  relatedId?: string
  actionRequired?: boolean
  expiresAt?: Date
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  emergencyCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  archiveNotification: (id: string) => void
  clearExpired: () => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead' | 'isArchived'>) => void
  getNotificationsByType: (type: Notification['type']) => Notification[]
  getRecentNotifications: (limit?: number) => Notification[]
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// Notifications de démonstration en temps réel
const DEMO_NOTIFICATIONS: Omit<Notification, 'id' | 'timestamp' | 'isRead' | 'isArchived'>[] = [
  {
    type: 'emergency',
    priority: 'critical',
    title: 'ALERTE CRITIQUE',
    message: 'Accident grave avec blessés - Intervention immédiate requise',
    location: 'Autoroute A1, sortie Liberté',
    source: 'citizen',
    actionRequired: true,
    relatedId: 'SIG-001'
  },
  {
    type: 'warning',
    priority: 'high',
    title: 'Vol signalé',
    message: 'Vol à la tire au marché Sandaga - Suspect en fuite',
    location: 'Marché Sandaga',
    source: 'citizen',
    actionRequired: true,
    relatedId: 'SIG-002'
  },
  {
    type: 'info',
    priority: 'medium',
    title: 'Patrouille terminée',
    message: 'Agent Martin a terminé sa patrouille secteur Nord',
    location: 'Secteur Nord',
    source: 'agent',
    actionRequired: false
  },
  {
    type: 'warning',
    priority: 'high',
    title: 'Embouteillage important',
    message: 'Trafic dense sur la Corniche - Déviations recommandées',
    location: 'Corniche Ouest',
    source: 'system',
    actionRequired: false
  },
  {
    type: 'success',
    priority: 'low',
    title: 'Intervention réussie',
    message: 'Situation maîtrisée à Médina - Zone sécurisée',
    location: 'Quartier Médina',
    source: 'agent',
    actionRequired: false
  },
  {
    type: 'info',
    priority: 'medium',
    title: 'Nouveau signalement',
    message: 'Nuisances sonores signalées par plusieurs citoyens',
    location: 'Fann Résidence',
    source: 'citizen',
    actionRequired: true,
    relatedId: 'SIG-003'
  }
]

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { toast } = useToast()

  // Initialisation avec des notifications de démo
  useEffect(() => {
    const initNotifications = DEMO_NOTIFICATIONS.map((notif, index) => ({
      ...notif,
      id: `notif-${Date.now()}-${index}`,
      timestamp: new Date(Date.now() - index * 300000), // Échelonnées dans le temps
      isRead: index > 2, // Les 3 premières non lues
      isArchived: false
    }))

    setNotifications(initNotifications)
  }, [])

  // Simulation de nouvelles notifications en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      // Ajouter une nouvelle notification aléatoirement (20% de chance toutes les 30 secondes)
      if (Math.random() < 0.2) {
        const randomNotif = DEMO_NOTIFICATIONS[Math.floor(Math.random() * DEMO_NOTIFICATIONS.length)]
        const newNotification: Notification = {
          ...randomNotif,
          id: `notif-${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
          isRead: false,
          isArchived: false,
          title: `[NOUVEAU] ${randomNotif.title}`,
        }

        setNotifications(prev => [newNotification, ...prev].slice(0, 50)) // Garder max 50 notifications

        // Toast pour notifications critiques
        if (newNotification.type === 'emergency') {
          toast({
            title: "🚨 ALERTE CRITIQUE",
            description: newNotification.message,
            variant: "destructive"
          })
        }
      }
    }, 30000) // Toutes les 30 secondes

    return () => clearInterval(interval)
  }, [toast])

  // Nettoyage automatique des notifications expirées
  useEffect(() => {
    const cleanup = setInterval(() => {
      setNotifications(prev => 
        prev.filter(notif => 
          !notif.expiresAt || notif.expiresAt > new Date()
        )
      )
    }, 60000) // Toutes les minutes

    return () => clearInterval(cleanup)
  }, [])

  const unreadCount = notifications.filter(n => !n.isRead && !n.isArchived).length
  const emergencyCount = notifications.filter(n => 
    n.type === 'emergency' && !n.isRead && !n.isArchived
  ).length

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    )
  }

  const archiveNotification = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isArchived: true, isRead: true } : notif
      )
    )
  }

  const clearExpired = () => {
    setNotifications(prev =>
      prev.filter(notif =>
        !notif.expiresAt || notif.expiresAt > new Date()
      )
    )
  }

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead' | 'isArchived'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      isRead: false,
      isArchived: false
    }

    setNotifications(prev => [newNotification, ...prev])

    // Toast automatique pour certains types
    if (newNotification.type === 'emergency') {
      toast({
        title: "🚨 " + newNotification.title,
        description: newNotification.message,
        variant: "destructive"
      })
    }
  }

  const getNotificationsByType = (type: Notification['type']) => {
    return notifications.filter(notif => notif.type === type && !notif.isArchived)
  }

  const getRecentNotifications = (limit = 10) => {
    return notifications
      .filter(notif => !notif.isArchived)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  return (
    <NotificationContext.Provider value={{
      notifications: notifications.filter(n => !n.isArchived),
      unreadCount,
      emergencyCount,
      markAsRead,
      markAllAsRead,
      archiveNotification,
      clearExpired,
      addNotification,
      getNotificationsByType,
      getRecentNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
} 
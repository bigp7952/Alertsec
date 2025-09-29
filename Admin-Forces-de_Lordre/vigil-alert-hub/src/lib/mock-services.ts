import { 
  MOCK_SIGNALEMENTS, 
  MOCK_AGENTS, 
  MOCK_NOTIFICATIONS, 
  MOCK_USERS,
  delay, 
  generateId,
  type Signalement,
  type Agent,
  type Notification,
  type User
} from './mock-data'

// Service pour les signalements (version mockée)
export const signalementsService = {
  async getAll(): Promise<Signalement[]> {
    await delay(400)
    // Trier par date de création (plus récent en premier)
    return [...MOCK_SIGNALEMENTS].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  },

  async create(signalement: Omit<Signalement, 'id' | 'created_at' | 'updated_at'>): Promise<Signalement> {
    await delay(600)
    
    const newSignalement: Signalement = {
      ...signalement,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    MOCK_SIGNALEMENTS.unshift(newSignalement)
    return newSignalement
  },

  async update(id: string, updates: Partial<Signalement>): Promise<Signalement> {
    await delay(500)
    
    const index = MOCK_SIGNALEMENTS.findIndex(s => s.id === id)
    if (index === -1) {
      throw new Error('Signalement non trouvé')
    }
    
    const updatedSignalement = {
      ...MOCK_SIGNALEMENTS[index],
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    MOCK_SIGNALEMENTS[index] = updatedSignalement
    return updatedSignalement
  },

  async delete(id: string): Promise<void> {
    await delay(400)
    
    const index = MOCK_SIGNALEMENTS.findIndex(s => s.id === id)
    if (index === -1) {
      throw new Error('Signalement non trouvé')
    }
    
    MOCK_SIGNALEMENTS.splice(index, 1)
  },

  // Simulation d'écoute des changements en temps réel
  subscribeToChanges(callback: (payload: any) => void) {
    // Dans une vraie application, ceci serait connecté à WebSocket ou SSE
    const interval = setInterval(() => {
      // Simuler un changement aléatoire occasionnellement
      if (Math.random() < 0.1) {
        callback({
          eventType: 'UPDATE',
          new: MOCK_SIGNALEMENTS[0],
          old: null,
          schema: 'public',
          table: 'signalements'
        })
      }
    }, 5000)

    return {
      unsubscribe: () => clearInterval(interval)
    }
  }
}

// Service pour les agents (version mockée)
export const agentsService = {
  async getAll(): Promise<Agent[]> {
    await delay(300)
    return [...MOCK_AGENTS].sort((a, b) => a.nom.localeCompare(b.nom))
  },

  async updatePosition(id: number, position: [number, number]): Promise<Agent> {
    await delay(400)
    
    const agent = MOCK_AGENTS.find(a => a.id === id)
    if (!agent) {
      throw new Error('Agent non trouvé')
    }
    
    agent.position = position
    agent.derniere_activite = new Date().toISOString()
    agent.updated_at = new Date().toISOString()
    
    return agent
  },

  async updateStatus(id: number, status: Agent['status']): Promise<Agent> {
    await delay(350)
    
    const agent = MOCK_AGENTS.find(a => a.id === id)
    if (!agent) {
      throw new Error('Agent non trouvé')
    }
    
    agent.status = status
    agent.derniere_activite = new Date().toISOString()
    agent.updated_at = new Date().toISOString()
    
    return agent
  },

  // Simulation d'écoute des changements en temps réel
  subscribeToChanges(callback: (payload: any) => void) {
    const interval = setInterval(() => {
      // Simuler des mises à jour de position d'agents
      if (Math.random() < 0.2) {
        const randomAgent = MOCK_AGENTS[Math.floor(Math.random() * MOCK_AGENTS.length)]
        callback({
          eventType: 'UPDATE',
          new: randomAgent,
          old: null,
          schema: 'public',
          table: 'agents'
        })
      }
    }, 3000)

    return {
      unsubscribe: () => clearInterval(interval)
    }
  }
}

// Service pour les notifications (version mockée)
export const notificationsService = {
  async getAll(): Promise<Notification[]> {
    await delay(250)
    return [...MOCK_NOTIFICATIONS].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  },

  async create(notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>): Promise<Notification> {
    await delay(400)
    
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    MOCK_NOTIFICATIONS.unshift(newNotification)
    return newNotification
  },

  async markAsRead(id: string): Promise<Notification> {
    await delay(300)
    
    const notification = MOCK_NOTIFICATIONS.find(n => n.id === id)
    if (!notification) {
      throw new Error('Notification non trouvée')
    }
    
    notification.lu = true
    notification.updated_at = new Date().toISOString()
    
    return notification
  },

  async delete(id: string): Promise<void> {
    await delay(300)
    
    const index = MOCK_NOTIFICATIONS.findIndex(n => n.id === id)
    if (index === -1) {
      throw new Error('Notification non trouvée')
    }
    
    MOCK_NOTIFICATIONS.splice(index, 1)
  },

  async deleteAll(): Promise<void> {
    await delay(500)
    MOCK_NOTIFICATIONS.length = 0
  },

  // Simulation d'écoute des changements en temps réel
  subscribeToChanges(callback: (payload: any) => void) {
    const interval = setInterval(() => {
      // Simuler de nouvelles notifications occasionnellement
      if (Math.random() < 0.05) {
        const newNotification: Notification = {
          id: generateId(),
          titre: 'Nouvelle notification',
          message: 'Ceci est une notification générée automatiquement',
          type: ['info', 'warning', 'success'][Math.floor(Math.random() * 3)] as 'info' | 'warning' | 'success',
          lu: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        MOCK_NOTIFICATIONS.unshift(newNotification)
        
        callback({
          eventType: 'INSERT',
          new: newNotification,
          old: null,
          schema: 'public',
          table: 'notifications'
        })
      }
    }, 10000)

    return {
      unsubscribe: () => clearInterval(interval)
    }
  }
}

// Service pour les utilisateurs (version mockée)
export const usersService = {
  async getAll(): Promise<User[]> {
    await delay(350)
    return [...MOCK_USERS].sort((a, b) => a.nom.localeCompare(b.nom))
  },

  async getByMatricule(matricule: string): Promise<User> {
    await delay(300)
    
    const user = MOCK_USERS.find(u => u.matricule === matricule)
    if (!user) {
      throw new Error('Utilisateur non trouvé')
    }
    
    return user
  },

  async updateLastConnection(id: string): Promise<User> {
    await delay(200)
    
    const user = MOCK_USERS.find(u => u.id === id)
    if (!user) {
      throw new Error('Utilisateur non trouvé')
    }
    
    user.derniere_connexion = new Date().toISOString()
    user.updated_at = new Date().toISOString()
    
    return user
  }
}

// Service pour les statistiques (version mockée)
export const statsService = {
  async getStats() {
    await delay(600)
    
    const signalements = await signalementsService.getAll()
    const agents = await agentsService.getAll()
    
    return {
      totalSignalements: signalements.length,
      signalementsCritiques: signalements.filter(s => s.niveau === 'danger-critical').length,
      signalementsEnCours: signalements.filter(s => s.status === 'en cours').length,
      signalementsTraites: signalements.filter(s => s.status === 'traité').length,
      agentsDisponibles: agents.filter(a => a.status === 'disponible').length,
      agentsEnMission: agents.filter(a => a.status === 'en_mission').length,
      tauxResolution: signalements.length > 0 
        ? Math.round((signalements.filter(s => s.status === 'traité').length / signalements.length) * 100)
        : 0
    }
  },

  async getStatsParJour() {
    await delay(500)
    
    const signalements = await signalementsService.getAll()
    const aujourd_hui = new Date()
    const ilYA7Jours = new Date(aujourd_hui.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const statsParJour = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(ilYA7Jours.getTime() + i * 24 * 60 * 60 * 1000)
      const jourSignalements = signalements.filter(s => {
        const signalementDate = new Date(s.created_at)
        return signalementDate.toDateString() === date.toDateString()
      })
      
      statsParJour.push({
        date: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        signalements: jourSignalements.length,
        traites: jourSignalements.filter(s => s.status === 'traité').length
      })
    }
    
    return statsParJour
  }
}

// Export des types pour compatibilité
export type { Signalement, Agent, Notification, User } from './mock-data'


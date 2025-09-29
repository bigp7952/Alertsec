import { useEffect, useRef, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { 
  signalementsService, 
  agentsService, 
  notificationsService,
  statsService,
  type Signalement,
  type Agent,
  type Notification
} from '@/lib/supabase'

interface UseSupabaseReturn {
  isConnected: boolean
  signalements: Signalement[]
  agents: Agent[]
  notifications: Notification[]
  assignerAgent: (signalementId: string, agentId: number) => Promise<void>
  updateAgentPosition: (agentId: number, position: [number, number]) => Promise<void>
  createSignalement: (signalement: Omit<Signalement, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  markNotificationAsRead: (id: string) => Promise<void>
}

export function useSupabase(): UseSupabaseReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [signalements, setSignalements] = useState<Signalement[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { toast } = useToast()

  useEffect(() => {
    let signalementsSubscription: any
    let agentsSubscription: any
    let notificationsSubscription: any

    const initializeData = async () => {
      try {
        // Charger les données initiales depuis Supabase
        const [signalementsData, agentsData, notificationsData] = await Promise.all([
          signalementsService.getAll(),
          agentsService.getAll(),
          notificationsService.getAll()
        ])

        setSignalements(signalementsData)
        setAgents(agentsData)
        setNotifications(notificationsData)
        setIsConnected(true)

        // S'abonner aux changements en temps réel
        signalementsSubscription = signalementsService.subscribeToChanges((payload) => {
          console.log('Signalement changé:', payload)
          
          if (payload.eventType === 'INSERT') {
            setSignalements(prev => [payload.new, ...prev])
            
            toast({
              title: "Nouveau signalement",
              description: `${payload.new.citoyen} - ${payload.new.description}`,
              variant: payload.new.niveau === 'danger-critical' ? 'destructive' : 'default'
            })

            // Créer une notification automatique
            notificationsService.create({
              titre: "Nouveau signalement",
              message: `Signalement de ${payload.new.citoyen} à ${payload.new.localisation.nom}`,
              type: payload.new.niveau === 'danger-critical' ? 'error' : 'warning',
              lu: false
            })
          } else if (payload.eventType === 'UPDATE') {
            setSignalements(prev => 
              prev.map(s => s.id === payload.new.id ? payload.new : s)
            )
          } else if (payload.eventType === 'DELETE') {
            setSignalements(prev => prev.filter(s => s.id !== payload.old.id))
          }
        })

        agentsSubscription = agentsService.subscribeToChanges((payload) => {
          console.log('Agent changé:', payload)
          
          if (payload.eventType === 'INSERT') {
            setAgents(prev => [...prev, payload.new])
          } else if (payload.eventType === 'UPDATE') {
            setAgents(prev => 
              prev.map(a => a.id === payload.new.id ? payload.new : a)
            )
          } else if (payload.eventType === 'DELETE') {
            setAgents(prev => prev.filter(a => a.id !== payload.old.id))
          }
        })

        notificationsSubscription = notificationsService.subscribeToChanges((payload) => {
          console.log('Notification changée:', payload)
          
          if (payload.eventType === 'INSERT') {
            setNotifications(prev => [payload.new, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setNotifications(prev => 
              prev.map(n => n.id === payload.new.id ? payload.new : n)
            )
          } else if (payload.eventType === 'DELETE') {
            setNotifications(prev => prev.filter(n => n.id !== payload.old.id))
          }
        })

      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error)
        setIsConnected(false)
        toast({
          title: "Erreur de connexion",
          description: "Impossible de se connecter à la base de données",
          variant: "destructive"
        })
      }
    }

    initializeData()

    return () => {
      // Nettoyer les abonnements
      if (signalementsSubscription) {
        signalementsSubscription.unsubscribe()
      }
      if (agentsSubscription) {
        agentsSubscription.unsubscribe()
      }
      if (notificationsSubscription) {
        notificationsSubscription.unsubscribe()
      }
    }
  }, [toast])

  const assignerAgent = async (signalementId: string, agentId: number) => {
    try {
      const agent = agents.find(a => a.id === agentId)
      if (!agent) throw new Error('Agent non trouvé')

      // Mettre à jour le signalement
      await signalementsService.update(signalementId, {
        status: 'en cours',
        agent_assigne: agent.nom
      })

      // Mettre à jour le statut de l'agent
      await agentsService.updateStatus(agentId, 'en_mission')

      toast({
        title: "Agent assigné",
        description: `${agent.nom} a été assigné au signalement`,
      })

    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'assigner l'agent",
        variant: "destructive"
      })
    }
  }

  const updateAgentPosition = async (agentId: number, position: [number, number]) => {
    try {
      await agentsService.updatePosition(agentId, position)
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la position:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la position",
        variant: "destructive"
      })
    }
  }

  const createSignalement = async (signalement: Omit<Signalement, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await signalementsService.create(signalement)
      toast({
        title: "Signalement créé",
        description: "Le signalement a été enregistré avec succès",
      })
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      toast({
        title: "Erreur",
        description: "Impossible de créer le signalement",
        variant: "destructive"
      })
    }
  }

  const markNotificationAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id)
      toast({
        title: "Notification marquée comme lue",
        description: "La notification a été mise à jour",
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      toast({
        title: "Erreur",
        description: "Impossible de marquer la notification comme lue",
        variant: "destructive"
      })
    }
  }

  return {
    isConnected,
    signalements,
    agents,
    notifications,
    assignerAgent,
    updateAgentPosition,
    createSignalement,
    markNotificationAsRead
  }
} 
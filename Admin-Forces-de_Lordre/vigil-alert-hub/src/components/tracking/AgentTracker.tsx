import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Clock, 
  Navigation, 
  Users, 
  Activity,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Map,
  BarChart3,
  Settings,
  Zap,
  Target,
  TrendingUp
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Agent } from "@/lib/mock-data"

interface AgentTrackerProps {
  agents: Agent[]
  onAgentSelect?: (agent: Agent) => void
  selectedAgentId?: number
}

interface AgentWithTracking extends Agent {
  lastUpdate: string
  speed?: number
  direction?: number
  battery?: number
  isOnline: boolean
  currentMission?: {
    id: string
    type: string
    startTime: string
    estimatedEnd: string
  }
}

export default function AgentTracker({ 
  agents, 
  onAgentSelect, 
  selectedAgentId 
}: AgentTrackerProps) {
  const [trackingAgents, setTrackingAgents] = useState<AgentWithTracking[]>([])
  const [showOffline, setShowOffline] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'analytics'>('list')
  const [selectedAgent, setSelectedAgent] = useState<AgentWithTracking | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Simuler le tracking en temps réel
  useEffect(() => {
    const updateTrackingData = () => {
      setTrackingAgents(agents.map(agent => ({
        ...agent,
        lastUpdate: new Date().toISOString(),
        speed: Math.random() * 60 + 10, // 10-70 km/h
        direction: Math.random() * 360, // 0-360°
        battery: Math.random() * 100, // 0-100%
        isOnline: Math.random() > 0.1, // 90% de chance d'être en ligne
        currentMission: agent.status === 'en_mission' ? {
          id: `mission-${agent.id}`,
          type: 'Intervention',
          startTime: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000).toISOString(),
          estimatedEnd: new Date(Date.now() + Math.random() * 2 * 60 * 60 * 1000).toISOString()
        } : undefined
      })))
    }

    // Mise à jour initiale
    updateTrackingData()

    // Mise à jour automatique si activée
    let interval: NodeJS.Timeout | null = null
    if (autoRefresh) {
      interval = setInterval(updateTrackingData, 5000) // Mise à jour toutes les 5 secondes
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [agents, autoRefresh])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simuler un délai de rafraîchissement
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  const getStatusColor = (status: string, isOnline: boolean) => {
    if (!isOnline) return "bg-gray-100 text-gray-600"
    if (status === 'disponible') return "bg-green-100 text-green-600"
    return "bg-orange-100 text-orange-600"
  }

  const getStatusIcon = (status: string, isOnline: boolean) => {
    if (!isOnline) return <AlertTriangle className="h-4 w-4" />
    if (status === 'disponible') return <CheckCircle className="h-4 w-4" />
    return <Activity className="h-4 w-4" />
  }

  const getBatteryColor = (battery: number) => {
    if (battery > 50) return "text-green-600"
    if (battery > 20) return "text-yellow-600"
    return "text-red-600"
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'À l\'instant'
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const filteredAgents = trackingAgents.filter(agent => 
    showOffline || agent.isOnline
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Tracking des Agents
          </CardTitle>
          <div className="flex gap-2">
            {/* Mode d'affichage */}
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-r-none"
              >
                <Users className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('map')}
                className="rounded-none"
              >
                <Map className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'analytics' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('analytics')}
                className="rounded-l-none"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={cn(autoRefresh && "bg-primary text-primary-foreground")}
            >
              <Zap className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOffline(!showOffline)}
            >
              {showOffline ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Statistiques globales */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">
              {trackingAgents.filter(a => a.isOnline).length}
            </div>
            <div className="text-xs text-muted-foreground">En ligne</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary">
              {trackingAgents.filter(a => a.status === 'disponible' && a.isOnline).length}
            </div>
            <div className="text-xs text-muted-foreground">Disponibles</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary">
              {trackingAgents.filter(a => a.status === 'en_mission' && a.isOnline).length}
            </div>
            <div className="text-xs text-muted-foreground">En mission</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary">
              {Math.round(trackingAgents.filter(a => a.isOnline).reduce((acc, agent) => acc + (agent.battery || 0), 0) / trackingAgents.filter(a => a.isOnline).length || 0)}%
            </div>
            <div className="text-xs text-muted-foreground">Batterie moy.</div>
          </div>
        </div>

        {/* Contenu selon le mode d'affichage */}
        {viewMode === 'list' && (
          <div className="space-y-3">
            {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className={cn(
                "border rounded-lg p-4 cursor-pointer transition-colors",
                selectedAgentId === agent.id 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => {
                onAgentSelect?.(agent)
                setSelectedAgent(agent)
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    getStatusColor(agent.status, agent.isOnline)
                  )}>
                    {getStatusIcon(agent.status, agent.isOnline)}
                  </div>
                  <div>
                    <h3 className="font-medium">{agent.nom}</h3>
                    <p className="text-sm text-muted-foreground">{agent.secteur}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={agent.isOnline ? "success" : "secondary"}>
                    {agent.isOnline ? 'En ligne' : 'Hors ligne'}
                  </Badge>
                  <Badge variant={agent.status === 'disponible' ? "success" : "warning"}>
                    {agent.status === 'disponible' ? 'Disponible' : 'En mission'}
                  </Badge>
                </div>
              </div>

              {/* Informations de tracking */}
              {agent.isOnline && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Position</p>
                      <p className="text-sm font-medium">
                        {agent.position[0].toFixed(4)}, {agent.position[1].toFixed(4)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Vitesse</p>
                      <p className="text-sm font-medium">
                        {agent.speed?.toFixed(0)} km/h
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Activity className={cn("h-4 w-4", getBatteryColor(agent.battery || 0))} />
                    <div>
                      <p className="text-xs text-muted-foreground">Batterie</p>
                      <p className={cn("text-sm font-medium", getBatteryColor(agent.battery || 0))}>
                        {agent.battery?.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Dernière MAJ</p>
                      <p className="text-sm font-medium">
                        {formatTime(agent.lastUpdate)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mission en cours */}
              {agent.currentMission && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-orange-600" />
                    <span className="font-medium text-sm text-orange-800">Mission en cours</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-1 font-medium">{agent.currentMission.type}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Début:</span>
                      <span className="ml-1 font-medium">
                        {new Date(agent.currentMission.startTime).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Alerte batterie faible */}
              {agent.isOnline && agent.battery && agent.battery < 20 && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-800">
                      Batterie faible ({agent.battery.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        )}

        {/* Mode Carte */}
        {viewMode === 'map' && (
          <div className="space-y-4">
            <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Map className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">Carte de Tracking des Agents</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Visualisation en temps réel des positions des agents
                </p>
                <div className="flex gap-2 justify-center">
                  <Badge variant="success">Disponible</Badge>
                  <Badge variant="warning">En mission</Badge>
                  <Badge variant="secondary">Hors ligne</Badge>
                </div>
              </div>
            </div>
            
            {/* Agent sélectionné */}
            {selectedAgent && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <h4 className="font-medium mb-2">Agent sélectionné: {selectedAgent.nom}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Position: {selectedAgent.position[0].toFixed(4)}, {selectedAgent.position[1].toFixed(4)}</div>
                  <div>Vitesse: {selectedAgent.speed?.toFixed(0)} km/h</div>
                  <div>Batterie: {selectedAgent.battery?.toFixed(0)}%</div>
                  <div>Dernière MAJ: {formatTime(selectedAgent.lastUpdate)}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mode Analytics */}
        {viewMode === 'analytics' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-2">Répartition par statut</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Disponibles</span>
                    <span className="font-medium">{trackingAgents.filter(a => a.status === 'disponible' && a.isOnline).length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>En mission</span>
                    <span className="font-medium">{trackingAgents.filter(a => a.status === 'en_mission' && a.isOnline).length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Hors ligne</span>
                    <span className="font-medium">{trackingAgents.filter(a => !a.isOnline).length}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-2">Métriques moyennes</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Vitesse moy.</span>
                    <span className="font-medium">{Math.round(trackingAgents.filter(a => a.isOnline).reduce((acc, agent) => acc + (agent.speed || 0), 0) / trackingAgents.filter(a => a.isOnline).length || 0)} km/h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Batterie moy.</span>
                    <span className="font-medium">{Math.round(trackingAgents.filter(a => a.isOnline).reduce((acc, agent) => acc + (agent.battery || 0), 0) / trackingAgents.filter(a => a.isOnline).length || 0)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Agents actifs</span>
                    <span className="font-medium">{trackingAgents.filter(a => a.isOnline).length}/{trackingAgents.length}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Graphique de performance */}
            <div className="bg-muted rounded-lg p-4">
              <h4 className="font-medium mb-4">Performance des agents</h4>
              <div className="space-y-3">
                {trackingAgents.map(agent => (
                  <div key={agent.id} className="flex items-center gap-3">
                    <div className="w-24 text-sm">{agent.nom}</div>
                    <div className="flex-1 bg-background rounded-full h-2">
                      <div 
                        className={cn(
                          "h-2 rounded-full transition-all",
                          agent.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        )}
                        style={{ width: `${agent.isOnline ? (agent.taux_reussite || 0) : 0}%` }}
                      />
                    </div>
                    <div className="w-12 text-sm text-right">{agent.isOnline ? (agent.taux_reussite || 0) : 0}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message si aucun agent */}
        {filteredAgents.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {showOffline ? 'Aucun agent trouvé' : 'Aucun agent en ligne'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

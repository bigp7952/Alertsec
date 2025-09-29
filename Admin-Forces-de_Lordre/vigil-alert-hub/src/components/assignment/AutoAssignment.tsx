import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  MapPin, 
  Clock, 
  Star, 
  Zap,
  CheckCircle,
  AlertTriangle,
  Target
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Signalement, Agent } from "@/lib/mock-data"

interface AutoAssignmentProps {
  signalement: Signalement
  agents: Agent[]
  onAssignAgent: (agentId: number) => void
  isAssigning?: boolean
}

interface RecommendedAgent extends Agent {
  score: number
  distance: number
  reasons: string[]
}

export default function AutoAssignment({ 
  signalement, 
  agents, 
  onAssignAgent, 
  isAssigning = false 
}: AutoAssignmentProps) {
  const [recommendedAgents, setRecommendedAgents] = useState<RecommendedAgent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<RecommendedAgent | null>(null)

  // Calculer la distance entre deux points (formule de Haversine)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371 // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Calculer le score de recommandation pour un agent
  const calculateAgentScore = (agent: Agent): { score: number, reasons: string[] } => {
    const reasons: string[] = []
    let score = 0

    // Vérifier la disponibilité (critère obligatoire)
    if (agent.status !== 'disponible') {
      return { score: 0, reasons: ['Agent non disponible'] }
    }

    // Calculer la distance
    const distance = calculateDistance(
      signalement.localisation.lat,
      signalement.localisation.lng,
      agent.position[0],
      agent.position[1]
    )

    // Score basé sur la distance (0-40 points)
    if (distance <= 2) {
      score += 40
      reasons.push('Très proche (< 2km)')
    } else if (distance <= 5) {
      score += 30
      reasons.push('Proche (< 5km)')
    } else if (distance <= agent.distance_max || 10) {
      score += 20
      reasons.push(`Dans la zone (${distance.toFixed(1)}km)`)
    } else {
      score += 5
      reasons.push(`Loin (${distance.toFixed(1)}km)`)
    }

    // Score basé sur les spécialités (0-25 points)
    if (agent.specialites?.includes(signalement.type || '')) {
      score += 25
      reasons.push(`Spécialiste ${signalement.type}`)
    } else if (agent.specialites && agent.specialites.length > 0) {
      score += 10
      reasons.push('Expérience générale')
    }

    // Score basé sur l'expérience (0-15 points)
    if (agent.experience && agent.experience >= 5) {
      score += 15
      reasons.push('Expérience élevée')
    } else if (agent.experience && agent.experience >= 3) {
      score += 10
      reasons.push('Expérience moyenne')
    } else if (agent.experience && agent.experience >= 1) {
      score += 5
      reasons.push('Expérience débutante')
    }

    // Score basé sur la charge de travail (0-10 points)
    if (agent.charge_travail === 0) {
      score += 10
      reasons.push('Aucune charge')
    } else if (agent.charge_travail && agent.charge_travail <= 2) {
      score += 7
      reasons.push('Charge légère')
    } else if (agent.charge_travail && agent.charge_travail <= 4) {
      score += 3
      reasons.push('Charge modérée')
    }

    // Score basé sur le taux de réussite (0-10 points)
    if (agent.taux_reussite && agent.taux_reussite >= 90) {
      score += 10
      reasons.push('Excellente performance')
    } else if (agent.taux_reussite && agent.taux_reussite >= 80) {
      score += 7
      reasons.push('Bonne performance')
    } else if (agent.taux_reussite && agent.taux_reussite >= 70) {
      score += 5
      reasons.push('Performance correcte')
    }

    return { score, reasons }
  }

  // Calculer les recommandations
  useEffect(() => {
    const recommendations = agents
      .map(agent => {
        const { score, reasons } = calculateAgentScore(agent)
        const distance = calculateDistance(
          signalement.localisation.lat,
          signalement.localisation.lng,
          agent.position[0],
          agent.position[1]
        )
        
        return {
          ...agent,
          score,
          distance,
          reasons
        }
      })
      .filter(agent => agent.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5) // Top 5 recommandations

    setRecommendedAgents(recommendations)
    
    // Sélectionner automatiquement le meilleur agent si disponible
    if (recommendations.length > 0) {
      setSelectedAgent(recommendations[0])
    }
  }, [signalement, agents])

  const handleAutoAssign = () => {
    if (selectedAgent) {
      onAssignAgent(selectedAgent.id)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    if (score >= 40) return "text-orange-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "success"
    if (score >= 60) return "warning"
    return "destructive"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Assignation Automatique
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Agent recommandé principal */}
        {selectedAgent && (
          <div className="space-y-4">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Agent Recommandé</h3>
                </div>
                <Badge variant={getScoreBadgeVariant(selectedAgent.score)} className="text-sm">
                  Score: {selectedAgent.score}/100
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="font-medium">{selectedAgent.nom}</p>
                  <p className="text-sm text-muted-foreground">{selectedAgent.secteur}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 text-sm">
                    <MapPin className="h-4 w-4" />
                    {selectedAgent.distance.toFixed(1)} km
                  </div>
                  <div className="flex items-center justify-end gap-1 text-sm">
                    <Clock className="h-4 w-4" />
                    ~{Math.round(selectedAgent.distance * 2)} min
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Pourquoi cet agent ?</p>
                <div className="flex flex-wrap gap-1">
                  {selectedAgent.reasons.map((reason, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {reason}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Button 
              onClick={handleAutoAssign}
              disabled={isAssigning}
              className="w-full"
              size="lg"
            >
              {isAssigning ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2 animate-spin" />
                  Assignation en cours...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Assigner automatiquement
                </>
              )}
            </Button>
          </div>
        )}

        {/* Liste des autres recommandations */}
        {recommendedAgents.length > 1 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Autres recommandations</h4>
            <div className="space-y-2">
              {recommendedAgents.slice(1).map((agent, index) => (
                <div
                  key={agent.id}
                  className={cn(
                    "flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors",
                    selectedAgent?.id === agent.id 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => setSelectedAgent(agent)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{agent.nom}</p>
                        <p className="text-xs text-muted-foreground">{agent.secteur}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {agent.distance.toFixed(1)}km
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3" />
                        {agent.taux_reussite}% réussite
                      </div>
                    </div>
                    <Badge variant={getScoreBadgeVariant(agent.score)} className="text-xs">
                      {agent.score}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">
              {agents.filter(a => a.status === 'disponible').length}
            </div>
            <div className="text-xs text-muted-foreground">Disponibles</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary">
              {recommendedAgents.length}
            </div>
            <div className="text-xs text-muted-foreground">Recommandés</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary">
              {Math.round(recommendedAgents.reduce((acc, agent) => acc + agent.distance, 0) / recommendedAgents.length || 0)}km
            </div>
            <div className="text-xs text-muted-foreground">Distance moy.</div>
          </div>
        </div>

        {/* Alerte si aucun agent disponible */}
        {recommendedAgents.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Aucun agent disponible dans la zone. 
                Vérifiez les agents disponibles ou étendez la zone de recherche.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, MapPin, Clock, User, Eye, Grid3X3, Map, Plus, Filter, MessageSquare, Zap, Navigation, Image, Video, Mic, Phone, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLocation } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import InteractiveMap from "@/components/map/InteractiveMap"
import MediaViewer from "@/components/media/MediaViewer"
import AutoAssignment from "@/components/assignment/AutoAssignment"
import CommunicationPanel from "@/components/communication/CommunicationPanel"
import AgentTracker from "@/components/tracking/AgentTracker"
import DangerZones from "@/components/zones/DangerZones"
import CreateSignalementForm from "@/components/forms/CreateSignalementForm"
import { useSignalements, useAgentTracking } from "@/hooks/useApi"
import apiService, { type Signalement, type User } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const getBadgeVariant = (niveau: string) => {
  switch(niveau) {
    case "danger-critical": return "destructive"
    case "danger-medium": return "warning" 
    case "safe-zone": return "success"
    default: return "secondary"
  }
}

const getNiveauLabel = (niveau: string) => {
  switch(niveau) {
    case "danger-critical": return "Critique"
    case "danger-medium": return "Suspect"
    case "safe-zone": return "Sécurisé"
    default: return niveau
  }
}

const getStatusLabel = (status: string) => {
  switch(status) {
    case "non traité": return "Non traité"
    case "en cours": return "En cours"
    case "traité": return "Traité"
    default: return status
  }
}

export default function Signalements() {
  const location = useLocation()
  const { toast } = useToast()
  
  // Utiliser les hooks API Laravel
  const { 
    signalements, 
    loading: signalementsLoading, 
    error: signalementsError,
    fetchSignalements,
    assignAgent,
    autoAssignAgent 
  } = useSignalements()

  const { 
    agents, 
    positions, 
    loading: agentsLoading 
  } = useAgentTracking()

  const [viewMode, setViewMode] = useState<"grid" | "map">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedSignalement, setSelectedSignalement] = useState<Signalement | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Récupérer les paramètres de navigation
  useEffect(() => {
    if (location.state?.viewMode) {
      setViewMode(location.state.viewMode)
    }
    if (location.state?.highlightLocation) {
      // Logique pour mettre en surbrillance une localisation
      toast({
        title: "Localisation mise en surbrillance",
        description: location.state.highlightLocation,
      })
    }
  }, [location.state, toast])

  const filteredSignalements = signalements.filter(signalement => {
    const matchesSearch = signalement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         signalement.citoyen.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         signalement.localisation.nom.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || signalement.niveau === filterType
    const matchesStatus = filterStatus === "all" || signalement.status === filterStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  const handleSignalementClick = (signalement: Signalement) => {
    setSelectedSignalement(signalement)
    toast({
      title: "Signalement sélectionné",
      description: `${signalement.citoyen} - ${signalement.localisation.nom}`,
    })
  }

  const handleAssignAgent = async (agentId?: number) => {
    const agentToAssign = agentId || (selectedAgent ? parseInt(selectedAgent) : null)
    
    if (!selectedSignalement || !agentToAssign) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un agent",
        variant: "destructive"
      })
      return
    }

    setIsAssigning(true)
    try {
      await assignAgent(selectedSignalement.id, agentToAssign)
      
      const agentName = agents.find(a => a.id === agentToAssign)?.nom || 'Agent'
      toast({
        title: "Agent assigné",
        description: `${agentName} assigné au signalement avec succès`,
      })
      
      setSelectedSignalement(null)
      setSelectedAgent("")
      // Rafraîchir les données
      await fetchSignalements()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'assigner l'agent",
        variant: "destructive"
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const handleCreateSignalement = async (signalementData: Omit<Signalement, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true)
    try {
      await signalementsService.create(signalementData)
      toast({
        title: "Signalement créé",
        description: "Le signalement a été créé avec succès",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le signalement",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateSignalement = async (id: string, updates: Partial<Signalement>) => {
    try {
      await signalementsService.update(id, updates)
      toast({
        title: "Signalement mis à jour",
        description: "Le signalement a été mis à jour avec succès",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le signalement",
        variant: "destructive"
      })
    }
  }

  const handleDeleteSignalement = async (id: string) => {
    try {
      await signalementsService.delete(id)
      toast({
        title: "Signalement supprimé",
        description: "Le signalement a été supprimé avec succès",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le signalement",
        variant: "destructive"
      })
    }
  }

  const availableAgents = agents.filter(agent => agent.status === 'disponible')

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Signalements</h1>
          <p className="text-sm text-muted-foreground">
            Gestion des signalements et interventions
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            Grille
          </Button>
          <Button
            variant={viewMode === "map" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("map")}
          >
            <Map className="h-4 w-4 mr-2" />
            Carte
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Recherche</label>
              <div className="relative">
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8"
                />
                <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Niveau</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les niveaux</SelectItem>
                  <SelectItem value="danger-critical">Critique</SelectItem>
                  <SelectItem value="danger-medium">Suspect</SelectItem>
                  <SelectItem value="safe-zone">Sécurisé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Statut</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="non traité">Non traité</SelectItem>
                  <SelectItem value="en cours">En cours</SelectItem>
                  <SelectItem value="traité">Traité</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={fetchSignalements}
                disabled={signalementsLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${signalementsLoading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              <Button 
                className="flex-1" 
                size="sm"
                onClick={() => setShowCreateForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouveau signalement
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{signalements.length}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">
                {signalements.filter(s => s.niveau === 'danger-critical').length}
              </div>
              <div className="text-xs text-muted-foreground">Critiques</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {signalements.filter(s => s.status === 'en cours').length}
              </div>
              <div className="text-xs text-muted-foreground">En cours</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-safe-zone">
                {signalements.filter(s => s.status === 'traité').length}
              </div>
              <div className="text-xs text-muted-foreground">Traités</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal */}
      {/* Indicateurs de chargement et d'erreur */}
      {signalementsLoading && (
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin mr-2" />
          <span>Chargement des signalements...</span>
        </div>
      )}

      {signalementsError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">Erreur: {signalementsError}</span>
          </div>
        </div>
      )}

      {/* Liste des signalements */}
      {!signalementsLoading && !signalementsError && (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSignalements.map((signalement) => (
            <Card 
              key={signalement.id} 
              className="hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => handleSignalementClick(signalement)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={cn(
                      "h-4 w-4",
                      signalement.niveau === 'danger-critical' ? 'text-destructive' :
                      signalement.niveau === 'danger-medium' ? 'text-warning' : 'text-safe-zone'
                    )} />
                    <Badge variant={getBadgeVariant(signalement.niveau)}>
                      {getNiveauLabel(signalement.niveau)}
                    </Badge>
                  </div>
                  <Badge variant={
                    signalement.status === 'traité' ? 'success' :
                    signalement.status === 'en cours' ? 'warning' : 'secondary'
                  }>
                    {getStatusLabel(signalement.status)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-medium text-foreground line-clamp-2">
                    {signalement.description}
                  </h3>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {signalement.citoyen}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {signalement.heure}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {signalement.localisation.nom}
                </div>
                
                {/* Indicateurs de médias */}
                {signalement.medias && (
                  <div className="flex items-center gap-2">
                    {signalement.medias.photos && signalement.medias.photos.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Image className="h-3 w-3" />
                        {signalement.medias.photos.length}
                      </div>
                    )}
                    {signalement.medias.videos && signalement.medias.videos.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Video className="h-3 w-3" />
                        {signalement.medias.videos.length}
                      </div>
                    )}
                    {signalement.medias.audios && signalement.medias.audios.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mic className="h-3 w-3" />
                        {signalement.medias.audios.length}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Indicateur de communication */}
                {signalement.contact && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    Contact disponible
                  </div>
                )}
                
                {signalement.agent_assigne && (
                  <div className="text-xs text-muted-foreground">
                    Agent: {agents.find(a => a.id.toString() === signalement.agent_assigne)?.nom || signalement.agent_assigne}
                  </div>
                )}
                
                {/* Actions rapides */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSignalementClick(signalement)
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Détails
                  </Button>
                  {signalement.status !== 'traité' && (
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedSignalement(signalement)
                      }}
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Assigner
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="h-96">
              <InteractiveMap 
                signalements={filteredSignalements}
                onSignalementClick={handleSignalementClick}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog pour les détails du signalement */}
      {selectedSignalement && (
        <Dialog open={!!selectedSignalement} onOpenChange={() => setSelectedSignalement(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Détails du signalement - {selectedSignalement.citoyen}
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Colonne gauche - Informations de base */}
              <div className="space-y-6">
                {/* Informations générales */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informations générales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-foreground">Citoyen</label>
                        <p className="text-sm font-medium">{selectedSignalement.citoyen}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">Heure</label>
                  <p className="text-sm">{selectedSignalement.heure}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">Localisation</label>
                  <p className="text-sm">{selectedSignalement.localisation.nom}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">Statut</label>
                  <Badge variant={getBadgeVariant(selectedSignalement.niveau)}>
                    {getStatusLabel(selectedSignalement.status)}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-foreground">Description</label>
                      <p className="text-sm mt-1 p-3 bg-muted rounded-lg">{selectedSignalement.description}</p>
                    </div>

                    {/* Informations de contact */}
                    {selectedSignalement.contact && (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground">Contact</label>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedSignalement.contact.telephone && (
                            <div className="flex items-center gap-2 p-2 bg-muted rounded">
                              <span className="text-xs">📞</span>
                              <span className="text-sm">{selectedSignalement.contact.telephone}</span>
                            </div>
                          )}
                          {selectedSignalement.contact.email && (
                            <div className="flex items-center gap-2 p-2 bg-muted rounded">
                              <span className="text-xs">📧</span>
                              <span className="text-sm">{selectedSignalement.contact.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Lecteur de médias */}
                <MediaViewer signalement={selectedSignalement} />

                {/* Communication avec le citoyen */}
                <CommunicationPanel 
                  signalement={selectedSignalement}
                  onSendMessage={(message, type) => {
                    toast({
                      title: "Message envoyé",
                      description: `${type}: ${message}`,
                    })
                  }}
                />
              </div>
              
              {/* Colonne droite - Actions et tracking */}
              <div className="space-y-6">
                {/* Assignation automatique */}
                <AutoAssignment 
                  signalement={selectedSignalement}
                  agents={agents}
                  onAssignAgent={handleAssignAgent}
                  isAssigning={isAssigning}
                />

                {/* Tracking des agents */}
                <AgentTracker 
                  agents={agents}
                  onAgentSelect={(agent) => {
                    toast({
                      title: "Agent sélectionné",
                      description: `${agent.nom} - ${agent.secteur}`,
                    })
                  }}
                />

                {/* Zones de danger */}
                <DangerZones 
                  signalements={signalements}
                  onZoneSelect={(zone) => {
                    toast({
                      title: "Zone sélectionnée",
                      description: `${zone.name} - Niveau de risque: ${zone.level}%`,
                    })
                  }}
                />
                </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

        </>
      )}

      {/* Formulaire de création de signalement */}
      {showCreateForm && (
        <CreateSignalementForm
          onClose={() => setShowCreateForm(false)}
          onSubmit={async (signalementData) => {
            await handleCreateSignalement(signalementData)
            setShowCreateForm(false)
          }}
          isSubmitting={isLoading}
        />
      )}
    </div>
  )
}
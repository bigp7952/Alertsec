import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, MapPin, Clock, User, Eye, Grid3X3, Map, Plus, Filter, MessageSquare, Zap, Navigation, Image, Video, Mic, Phone, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import InteractiveMap from "@/components/map/InteractiveMap"
import MediaViewer from "@/components/media/MediaViewer"
import AutoAssignment from "@/components/assignment/AutoAssignment"
import CommunicationPanel from "@/components/communication/CommunicationPanel"
import AgentTracker from "@/components/tracking/AgentTracker"
import DangerZones from "@/components/zones/DangerZones"
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

export default function CasGraves() {
  const { toast } = useToast()
  
  // Utiliser les hooks API Laravel pour récupérer les signalements critiques
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
  const [forcesAgents, setForcesAgents] = useState<User[]>([])

  const [viewMode, setViewMode] = useState<"grid" | "map">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedSignalement, setSelectedSignalement] = useState<Signalement | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState("")
  const [assignTarget, setAssignTarget] = useState<Signalement | null>(null)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [previewMedia, setPreviewMedia] = useState<any | null>(null)

  // Charger la liste des agents des forces si la source du hook est vide
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const data = await apiService.getAgents()
        setForcesAgents(data as any)
      } catch (e) {
        // noop
      }
    }
    if (!agents || agents.length === 0) {
      loadAgents()
    } else {
      setForcesAgents(agents as any)
    }
  }, [agents])

  // Filtrer uniquement les cas graves (niveau critique)
  const casGraves = signalements.filter(signalement => 
    signalement.niveau === 'danger-critical'
  )

  const filteredCasGraves = casGraves.filter(signalement => {
    const citoyenNom = `${signalement?.citoyen?.prenom ?? ''} ${signalement?.citoyen?.nom ?? ''}`.trim()
    const adresse = (signalement as any)?.adresse ?? ''
    const desc = signalement?.description ?? ''
    const matchesSearch = `${desc} ${citoyenNom} ${adresse}`.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || signalement.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleSignalementClick = (signalement: Signalement) => {
    setSelectedSignalement(signalement)
    toast({
      title: "Cas grave sélectionné",
      description: `${`${signalement?.citoyen?.prenom ?? ''} ${signalement?.citoyen?.nom ?? ''}`.trim()} - ${(signalement as any)?.adresse || `${(signalement as any)?.latitude ?? ''}, ${(signalement as any)?.longitude ?? ''}`}`,
    })
  }

  const handleAssignAgent = async (agentId?: number) => {
    const agentToAssign = agentId || (selectedAgent ? parseInt(selectedAgent) : null)
    const targetSignalement = assignTarget || selectedSignalement
    
    if (!targetSignalement || !agentToAssign) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un agent",
        variant: "destructive"
      })
      return
    }

    setIsAssigning(true)
    try {
      await assignAgent(targetSignalement.id, agentToAssign)
      
      const agentName = agents.find(a => a.id === agentToAssign)?.nom || 'Agent'
      toast({
        title: "Agent assigné",
        description: `${agentName} assigné au cas grave avec succès`,
      })
      
      setSelectedSignalement(null)
      setAssignTarget(null)
      setSelectedAgent("")
      setShowAssignDialog(false)
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

  const handleUpdateSignalement = async (id: number, updates: Partial<Signalement>) => {
    try {
      await apiService.updateSignalement(id, updates)
      toast({ title: "Cas grave mis à jour", description: "Le cas grave a été mis à jour avec succès" })
      await fetchSignalements()
    } catch (error: any) {
      toast({ title: "Erreur", description: error?.message || "Impossible de mettre à jour le cas grave", variant: "destructive" })
    }
  }

  const handleDeleteSignalement = async (id: number) => {
    try {
      await apiService.deleteSignalement(id)
      toast({ title: "Cas grave supprimé", description: "Le cas grave a été supprimé avec succès" })
      await fetchSignalements()
    } catch (error: any) {
      toast({ title: "Erreur", description: error?.message || "Impossible de supprimer le cas grave", variant: "destructive" })
    }
  }

  const availableAgents = (forcesAgents || [])
    .filter((agent: any) => (agent.role === 'agent' || agent.role === 'superviseur' || agent.role === 'admin'))
    .filter((agent: any) => (agent.statut ?? 'actif') !== 'inactif')

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cas Graves</h1>
          <p className="text-sm text-muted-foreground">
            Gestion des cas critiques nécessitant une intervention urgente
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{casGraves.length}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">
                {casGraves.filter(s => s.status === 'non traité').length}
              </div>
              <div className="text-xs text-muted-foreground">Non traités</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {casGraves.filter(s => s.status === 'en cours').length}
              </div>
              <div className="text-xs text-muted-foreground">En cours</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-safe-zone">
                {casGraves.filter(s => s.status === 'traité').length}
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
          <span>Chargement des cas graves...</span>
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

      {/* Liste des cas graves */}
      {!signalementsLoading && !signalementsError && (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCasGraves.map((signalement) => (
            <Card 
              key={signalement.id} 
              className="hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => handleSignalementClick(signalement)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <Badge variant="destructive">
                      CRITIQUE
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
                    {`${signalement?.citoyen?.prenom ?? ''} ${signalement?.citoyen?.nom ?? ''}`.trim()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {signalement.heure}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {(signalement as any)?.adresse || `${(signalement as any)?.latitude ?? ''}, ${(signalement as any)?.longitude ?? ''}`}
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
                    Agent: {`${(signalement as any).agent_assigne?.prenom ?? ''} ${(signalement as any).agent_assigne?.nom ?? ''}`.trim()}
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
                      setSelectedSignalement(signalement)
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Voir
                  </Button>
                  {!signalement.agent_assigne && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        setAssignTarget(signalement)
                        setShowAssignDialog(true)
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
            <div className="h-[600px] rounded-lg overflow-hidden">
              <InteractiveMap 
                signalements={filteredCasGraves}
                onSignalementClick={handleSignalementClick}
              />
            </div>
          )}
        </>
      )}

      {/* Dialog pour les détails du signalement */}
      {selectedSignalement && (
        <Dialog open={!!selectedSignalement} onOpenChange={() => setSelectedSignalement(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Cas Grave #{selectedSignalement.id} - CRITIQUE
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Informations principales */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informations du signalement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">Citoyen</div>
                      <div>{`${selectedSignalement?.citoyen?.prenom ?? ''} ${selectedSignalement?.citoyen?.nom ?? ''}`.trim()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Heure</div>
                      <div>{selectedSignalement.heure}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Statut</div>
                      <Badge variant={
                        selectedSignalement.status === 'traité' ? 'success' :
                        selectedSignalement.status === 'en cours' ? 'warning' : 'secondary'
                      }>
                        {getStatusLabel(selectedSignalement.status)}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Niveau</div>
                      <Badge variant="destructive">CRITIQUE</Badge>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Description</div>
                    <div className="text-sm">{selectedSignalement.description}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Localisation</div>
                    <div className="text-sm">
                      {(selectedSignalement as any)?.adresse || `${(selectedSignalement as any)?.latitude ?? ''}, ${(selectedSignalement as any)?.longitude ?? ''}`}
                    </div>
                  </div>
                  
                  {selectedSignalement.agent_assigne && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Agent assigné</div>
                      <div className="text-sm">
                        {`${(selectedSignalement as any).agent_assigne?.prenom ?? ''} ${(selectedSignalement as any).agent_assigne?.nom ?? ''}`.trim()}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Médias */}
              {selectedSignalement?.medias && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Médias</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Photos */}
                    {selectedSignalement.medias.photos && selectedSignalement.medias.photos.length > 0 && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-2">Photos</div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {selectedSignalement.medias.photos.map((photo: any, index: number) => (
                            <div key={index} className="aspect-square bg-muted rounded overflow-hidden">
                              <img 
                                src={photo} 
                                alt={`Photo ${index + 1}`}
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={() => setPreviewMedia({ type: 'photo', url: photo })}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
              
                    {/* Videos */}
                    {selectedSignalement.medias.videos && selectedSignalement.medias.videos.length > 0 && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-2">Vidéos</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {selectedSignalement.medias.videos.map((video: any, index: number) => (
                            <div key={index} className="aspect-video bg-muted rounded overflow-hidden">
                              <video 
                                src={video} 
                                controls
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Audios */}
                    {selectedSignalement.medias.audios && selectedSignalement.medias.audios.length > 0 && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-2">Audios</div>
                        <div className="space-y-2">
                          {selectedSignalement.medias.audios.map((audio: any, index: number) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                              <Mic className="h-4 w-4" />
                              <audio src={audio} controls className="flex-1" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(!selectedSignalement.medias.photos?.length && !selectedSignalement.medias.videos?.length && !selectedSignalement.medias.audios?.length) && (
                      <div className="text-sm text-muted-foreground">Aucun média.</div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Contact */}
              {(selectedSignalement as any)?.contact && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {((selectedSignalement as any)?.contact?.telephone) && (
                      <div>
                        <div className="text-xs text-muted-foreground">Téléphone</div>
                        <div>{(selectedSignalement as any)?.contact?.telephone}</div>
                      </div>
                    )}
                    {((selectedSignalement as any)?.contact?.email) && (
                      <div>
                        <div className="text-xs text-muted-foreground">Email</div>
                        <div>{(selectedSignalement as any)?.contact?.email}</div>
                      </div>
                    )}
                    {!((selectedSignalement as any)?.contact?.telephone) && !((selectedSignalement as any)?.contact?.email) && (
                      <div>—</div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    {!selectedSignalement.agent_assigne && (
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setAssignTarget(selectedSignalement)
                          setShowAssignDialog(true)
                        }}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Assigner un agent
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateSignalement(selectedSignalement.id, { status: 'en cours' })}
                    >
                      Marquer en cours
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateSignalement(selectedSignalement.id, { status: 'traité' })}
                    >
                      Marquer comme traité
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialogue d'assignation */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner un agent au cas grave</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {assignTarget && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium">Cas grave #{assignTarget.id}</div>
                <div className="text-xs text-muted-foreground">{assignTarget.description}</div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Agent</label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un agent" />
                </SelectTrigger>
                <SelectContent>
                  {availableAgents.map((agent: any) => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      {agent.prenom} {agent.nom} - {agent.secteur}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAssignDialog(false)
                  setAssignTarget(null)
                  setSelectedAgent("")
                }}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={() => handleAssignAgent()}
                disabled={isAssigning || !selectedAgent}
                className="flex-1"
              >
                {isAssigning ? "Assignation..." : "Assigner"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Prévisualisation des médias */}
      {previewMedia && (
        <MediaViewer
          media={previewMedia}
          onClose={() => setPreviewMedia(null)}
        />
      )}
    </div>
  )
}
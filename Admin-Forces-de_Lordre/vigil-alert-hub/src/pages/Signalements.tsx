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
  const [forcesAgents, setForcesAgents] = useState<User[]>([])

  const [viewMode, setViewMode] = useState<"grid" | "map">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedSignalement, setSelectedSignalement] = useState<Signalement | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState("")
  const [assignTarget, setAssignTarget] = useState<Signalement | null>(null)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [previewMedia, setPreviewMedia] = useState<any | null>(null)

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

  const filteredSignalements = signalements.filter(signalement => {
    const citoyenNom = `${signalement?.citoyen?.prenom ?? ''} ${signalement?.citoyen?.nom ?? ''}`.trim()
    const adresse = (signalement as any)?.adresse ?? ''
    const desc = signalement?.description ?? ''
    const matchesSearch = `${desc} ${citoyenNom} ${adresse}`.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || signalement.niveau === filterType
    const matchesStatus = filterStatus === "all" || signalement.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const handleSignalementClick = (signalement: Signalement) => {
    setSelectedSignalement(signalement)
    toast({
      title: "Signalement sélectionné",
      description: `${`${signalement?.citoyen?.prenom ?? ''} ${signalement?.citoyen?.nom ?? ''}`.trim()} - ${(signalement as any)?.adresse || `${(signalement as any)?.latitude ?? ''}, ${(signalement as any)?.longitude ?? ''}`}`,
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

  const handleCreateSignalement = async (signalementData: any) => {
    setIsLoading(true)
    try {
      // Adapter le payload attendu par l'API Laravel
      const payload = {
        description: signalementData?.description,
        niveau: signalementData?.niveau || 'danger-medium',
        type: signalementData?.type || 'autre',
        latitude: signalementData?.localisation?.lat ?? null,
        longitude: signalementData?.localisation?.lng ?? null,
        adresse: signalementData?.localisation?.nom ?? '',
        heure: signalementData?.heure || new Date().toLocaleTimeString('fr-FR', { hour12: false }),
        contact: signalementData?.contact || null,
        medias: signalementData?.medias || { photos: [], videos: [], audios: [] },
      }

      const base = (import.meta as any).env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
      const res = await fetch(`${base}/signalements/quick`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok || !data?.success) throw new Error(data?.message || 'Erreur API')
      toast({ title: "Signalement créé", description: "Le signalement a été créé avec succès" })
      await fetchSignalements()
    } catch (error: any) {
      toast({ title: "Erreur", description: error?.message || "Impossible de créer le signalement", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateSignalement = async (id: number, updates: Partial<Signalement>) => {
    try {
      await apiService.updateSignalement(id, updates)
      toast({ title: "Signalement mis à jour", description: "Le signalement a été mis à jour avec succès" })
      await fetchSignalements()
    } catch (error: any) {
      toast({ title: "Erreur", description: error?.message || "Impossible de mettre à jour le signalement", variant: "destructive" })
    }
  }

  const handleDeleteSignalement = async (id: number) => {
    try {
      await apiService.deleteSignalement(id)
      toast({ title: "Signalement supprimé", description: "Le signalement a été supprimé avec succès" })
      await fetchSignalements()
    } catch (error: any) {
      toast({ title: "Erreur", description: error?.message || "Impossible de supprimer le signalement", variant: "destructive" })
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

      {/* Dialog pour les détails du signalement - robuste */}
      {selectedSignalement && (
        <Dialog open={!!selectedSignalement} onOpenChange={() => setSelectedSignalement(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Détails du signalement
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">Citoyen</div>
                    <div className="font-medium">{`${selectedSignalement?.citoyen?.prenom ?? ''} ${selectedSignalement?.citoyen?.nom ?? ''}`.trim() || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Heure</div>
                    <div>{selectedSignalement?.heure || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Adresse / Coordonnées</div>
                    <div>{(selectedSignalement as any)?.adresse || `${(selectedSignalement as any)?.latitude ?? ''}, ${(selectedSignalement as any)?.longitude ?? ''}` || '—'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-muted-foreground">Statut</div>
                    <Badge variant={
                      selectedSignalement?.status === 'traité' ? 'success' :
                      selectedSignalement?.status === 'en cours' ? 'warning' : 'secondary'
                    }>
                      {getStatusLabel(selectedSignalement?.status || '')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-muted-foreground">Niveau</div>
                    <Badge variant={getBadgeVariant(selectedSignalement?.niveau || '')}>{getNiveauLabel(selectedSignalement?.niveau || '')}</Badge>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Type</div>
                    <div>{(selectedSignalement as any)?.type || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Priorité</div>
                    <div>{(selectedSignalement as any)?.priorite || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Agent assigné</div>
                    <div>{`${(selectedSignalement as any)?.agent_assigne?.prenom ?? ''} ${(selectedSignalement as any)?.agent_assigne?.nom ?? ''}`.trim() || '—'}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm p-3 bg-muted rounded">{selectedSignalement?.description || '—'}</div>
                </CardContent>
              </Card>

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
                          {selectedSignalement.medias.photos.map((p: any) => (
                            <div key={p.id} className="group">
                              <button onClick={() => setPreviewMedia({ ...p, kind: 'photo' })} className="block w-full text-left">
                                <img src={p.url} alt={p.nom_fichier || 'photo'} className="w-full h-24 object-cover rounded" />
                              </button>
                              <div className="flex items-center justify-between gap-2 mt-1">
                                <div className="text-2xs truncate">{p.nom_fichier}</div>
                                <a href={p.url} download className="text-primary text-2xs">Télécharger</a>
                </div>
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
                          {selectedSignalement.medias.videos.map((v: any) => (
                            <div key={v.id} className="space-y-1">
                              <video controls src={v.url} className="w-full rounded" />
                              <div className="flex items-center justify-between text-2xs">
                                <button onClick={() => setPreviewMedia({ ...v, kind: 'video' })} className="text-2xs text-foreground underline">Voir</button>
                                <a href={v.url} download className="text-primary">Télécharger</a>
                    </div>
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
                          {selectedSignalement.medias.audios.map((a: any) => (
                            <div key={a.id} className="flex items-center justify-between gap-2">
                              <audio controls src={a.url} />
                              <div className="flex items-center gap-3">
                                <button onClick={() => setPreviewMedia({ ...a, kind: 'audio' })} className="text-2xs text-foreground underline">Écouter</button>
                                <a href={a.url} download className="text-primary text-2xs">Télécharger</a>
                              </div>
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
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Lightbox media preview */}
      {previewMedia && (
        <Dialog open={!!previewMedia} onOpenChange={() => setPreviewMedia(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-sm truncate">{previewMedia?.nom_fichier || 'Média'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {previewMedia.kind === 'photo' && (
                <img src={previewMedia.url} alt={previewMedia.nom_fichier || 'photo'} className="w-full max-h-[70vh] object-contain rounded" />
              )}
              {previewMedia.kind === 'video' && (
                <video controls src={previewMedia.url} className="w-full rounded" />
              )}
              {previewMedia.kind === 'audio' && (
                <audio controls src={previewMedia.url} className="w-full" />
              )}
              <div className="flex justify-end">
                <a href={previewMedia.url} download className="text-primary text-sm">Télécharger</a>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog d'assignation d'agent */}
      {assignTarget && (
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-sm">Assigner un agent · #{assignTarget.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">Agents disponibles</div>
              <div className="grid gap-2 max-h-72 overflow-y-auto">
                {availableAgents.map((ag: any) => (
                  <div key={ag.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="text-sm">
                      <div className="font-medium">{ag.prenom} {ag.nom}</div>
                      <div className="text-xs text-muted-foreground">{ag.grade} · {ag.unite} · {ag.secteur}</div>
                    </div>
                    <Button size="sm" onClick={async () => {
                      setIsAssigning(true)
                      try {
                        await assignAgent(assignTarget.id, ag.id)
                        toast({ title: 'Agent assigné', description: `${ag.prenom} ${ag.nom} a été assigné` })
                        setShowAssignDialog(false)
                        setAssignTarget(null)
                        await fetchSignalements()
                      } catch (err: any) {
                        toast({ title: 'Erreur', description: err?.message || 'Échec de l\'assignation', variant: 'destructive' })
                      } finally {
                        setIsAssigning(false)
                      }
                    }} disabled={isAssigning}>
                      {isAssigning ? 'Assignation…' : 'Assigner'}
                    </Button>
                  </div>
                ))}
                {availableAgents.length === 0 && (
                  <div className="text-sm text-muted-foreground">Aucun agent disponible.</div>
                )}
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
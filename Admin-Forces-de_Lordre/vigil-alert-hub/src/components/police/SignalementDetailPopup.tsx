import { useState, useEffect } from "react"
import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  MapPin, 
  Clock, 
  User, 
  Phone,
  Mail,
  FileImage,
  Video,
  Volume2,
  AlertTriangle,
  Users,
  Download,
  Play,
  Eye,
  Navigation,
  MessageSquare
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import apiService, { type User } from '@/lib/api'

interface Signalement {
  id: number
  citoyen?: {
    id: number
    prenom: string
    nom: string
    email?: string
    telephone?: string
  }
  agent_assigne?: {
    id: number
    prenom: string
    nom: string
    grade?: string
    unite?: string
  }
  description: string
  niveau: string
  status: string
  type: string
  priorite: string
  latitude: number
  longitude: number
  adresse: string
  heure: string
  date_signalement: string
  contact?: {
    telephone?: string
    email?: string
  }
  medias?: {
    photos?: Array<{
      id: number
      url: string
      nom_fichier: string
      taille: string
    }>
    videos?: Array<{
      id: number
      url: string
      nom_fichier: string
      taille: string
      duree?: string
    }>
    audios?: Array<{
      id: number
      url: string
      nom_fichier: string
      taille: string
      duree?: string
    }>
  }
  notes_agent?: string
  notes_superviseur?: string
}

interface SignalementDetailPopupProps {
  signalement: Signalement
}

const getNiveauLabel = (niveau: string) => {
  switch(niveau) {
    case "danger-critical": return "Critique"
    case "danger-medium": return "Moyen"
    case "safe-zone": return "Sûr"
    default: return niveau
  }
}

const getBadgeVariant = (niveau: string) => {
  switch(niveau) {
    case "danger-critical": return "destructive"
    case "danger-medium": return "secondary" 
    case "safe-zone": return "default"
    default: return "default"
  }
}

const getPrioriteColor = (priorite: string) => {
  switch(priorite?.toLowerCase()) {
    case "critique": return "bg-red-600"
    case "haute": return "bg-red-500"
    case "moyenne": return "bg-orange-500"
    case "basse": return "bg-yellow-500"
    default: return "bg-red-600"
  }
}

const getTypeIcon = (type: string) => {
  switch(type) {
    case "agression": return "👊"
    case "vol": return "💰"
    case "accident": return "🚗"
    case "incendie": return "🔥"
    default: return "⚠️"
  }
}

// Composant pour afficher les médias
const MediaDisplay = ({ medias }: { medias: any }) => {
  if (!medias) return null

  const { photos = [], videos = [], audios = [] } = medias

  return (
    <div className="space-y-4">
      {/* Photos */}
      {photos.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <FileImage className="h-4 w-4" />
            Photos ({photos.length})
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo: any, index: number) => (
              <div key={index} className="relative group">
                <img 
                  src={photo.url} 
                  alt={`Photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                  <Button size="sm" variant="secondary" className="opacity-0 group-hover:opacity-100">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded truncate">
                    {photo.nom_fichier}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vidéos */}
      {videos.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Video className="h-4 w-4" />
            Vidéos ({videos.length})
          </h4>
          <div className="space-y-3">
            {videos.map((video: any, index: number) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  <Button size="sm" variant="outline">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{video.nom_fichier}</p>
                  <p className="text-xs text-muted-foreground">
                    {video.duree && `${video.duree} • `}
                    {video.taille}
                  </p>
                </div>
                <Button size="sm" variant="ghost">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audios */}
      {audios.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Enregistrements ({audios.length})
          </h4>
          <div className="space-y-3">
            {audios.map((audio: any, index: number) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  <Button size="sm" variant="outline">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{audio.nom_fichier}</p>
                  <p className="text-xs text-muted-foreground">
                    {audio.duree && `${audio.duree} • `}
                    {audio.taille}
                  </p>
                </div>
                <Button size="sm" variant="ghost">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function SignalementDetailPopup({ signalement }: SignalementDetailPopupProps) {
  const [response, setResponse] = useState("")
  const [selectedAgent, setSelectedAgent] = useState("")
  const [status, setStatus] = useState(signalement.status)
  const [agents, setAgents] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [assigningAgent, setAssigningAgent] = useState(false)

  // Charger la liste des agents
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const agentsData = await apiService.getAgents()
        setAgents(agentsData)
      } catch (error) {
        console.error('Erreur lors du chargement des agents:', error)
      }
    }
    loadAgents()
  }, [])

  const handleAssignAgent = async () => {
    if (!selectedAgent) return
    
    try {
      setAssigningAgent(true)
      await apiService.assignAgent(signalement.id, parseInt(selectedAgent))
      toast({
        title: "Assignation réussie",
        description: "L'agent a été assigné avec succès.",
      })
      // Recharger la page ou mettre à jour l'état
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Erreur d'assignation",
        description: error.message || "Impossible d'assigner l'agent.",
        variant: "destructive"
      })
    } finally {
      setAssigningAgent(false)
    }
  }

  const handleAutoAssign = async () => {
    try {
      setAssigningAgent(true)
      await apiService.autoAssignAgent(signalement.id)
      toast({
        title: "Assignation automatique réussie",
        description: "L'agent le plus proche a été assigné automatiquement.",
      })
      // Recharger la page ou mettre à jour l'état
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Erreur d'assignation automatique",
        description: error.message || "Impossible d'assigner un agent automatiquement.",
        variant: "destructive"
      })
    } finally {
      setAssigningAgent(false)
    }
  }

  const handleSendResponse = async () => {
    if (!response.trim()) return
    
    try {
      await apiService.sendMessage(signalement.id, response, 'message')
      toast({
        title: "Message envoyé",
        description: "Votre réponse a été envoyée avec succès.",
      })
      setResponse("")
    } catch (error: any) {
      toast({
        title: "Erreur d'envoi",
        description: error.message || "Impossible d'envoyer le message.",
        variant: "destructive"
      })
    }
  }

  const handleMarkTreated = async () => {
    try {
      await apiService.updateSignalement(signalement.id, { status: 'traité' })
    setStatus("traité")
      toast({
        title: "Signalement traité",
        description: "Le signalement a été marqué comme traité.",
      })
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de marquer comme traité.",
        variant: "destructive"
      })
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <span className="text-2xl">{getTypeIcon(signalement.type)}</span>
          Signalement #{signalement.id} - {signalement.type}
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* Informations principales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {signalement.citoyen ? `${signalement.citoyen.prenom} ${signalement.citoyen.nom}` : 'Citoyen'}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Signalé à {signalement.heure || new Date(signalement.date_signalement).toLocaleTimeString()}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Badge className={`${getPrioriteColor(signalement.priorite)} text-white`}>
                  {signalement.priorite?.toUpperCase() || 'CRITIQUE'}
                </Badge>
              <Badge variant={getBadgeVariant(signalement.niveau)}>
                {getNiveauLabel(signalement.niveau)}
              </Badge>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-2">Description</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{signalement.description}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Localisation
              </h4>
              <p className="text-sm text-muted-foreground">
                {signalement.adresse || `Lat: ${signalement.latitude}, Lng: ${signalement.longitude}`}
              </p>
            </div>
            
            {/* Informations de contact */}
            {signalement.contact && (signalement.contact.telephone || signalement.contact.email) && (
              <div>
                <h4 className="font-medium text-foreground mb-2">Contact</h4>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  {signalement.contact.telephone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {signalement.contact.telephone}
                    </span>
                  )}
                  {signalement.contact.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {signalement.contact.email}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Agent assigné */}
            {signalement.agent_assigne ? (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4" />
                  Unité assignée
                </h4>
                <p className="text-sm text-green-700">
                  {signalement.agent_assigne.prenom} {signalement.agent_assigne.nom}
                  {signalement.agent_assigne.grade && ` - ${signalement.agent_assigne.grade}`}
                </p>
                {signalement.agent_assigne.unite && (
                  <p className="text-xs text-green-600">
                    {signalement.agent_assigne.unite}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <p className="text-sm font-medium text-yellow-800">
                  ⚠️ Aucun agent assigné
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Médias */}
        {signalement.medias && (signalement.medias.photos?.length > 0 || signalement.medias.videos?.length > 0 || signalement.medias.audios?.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Médias partagés</CardTitle>
            </CardHeader>
            <CardContent>
              <MediaDisplay medias={signalement.medias} />
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {(signalement.notes_agent || signalement.notes_superviseur) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {signalement.notes_agent && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-1">Notes de l'agent</h4>
                  <p className="text-sm text-muted-foreground">{signalement.notes_agent}</p>
                </div>
              )}
              {signalement.notes_superviseur && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-1">Notes du superviseur</h4>
                  <p className="text-sm text-muted-foreground">{signalement.notes_superviseur}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Assignation d'agent */}
            {!signalement.agent_assigne && (
              <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
                    Assigner à un agent
            </label>
            <div className="flex gap-2">
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Sélectionner un agent" />
                </SelectTrigger>
                <SelectContent>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id.toString()}>
                            {agent.prenom} {agent.nom} - {agent.grade} ({agent.unite})
                          </SelectItem>
                        ))}
                </SelectContent>
              </Select>
                    <Button 
                      onClick={handleAssignAgent} 
                      disabled={!selectedAgent || assigningAgent}
                      size="sm"
                    >
                      {assigningAgent ? "Assignation..." : "Assigner"}
              </Button>
            </div>
          </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleAutoAssign} 
                    disabled={assigningAgent}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Auto-assigner (agent le plus proche)
                  </Button>
                </div>
              </div>
            )}

            <Separator />

            {/* Communication */}
          <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Envoyer un message
            </label>
            <Textarea
                placeholder="Tapez votre message ici..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="min-h-20"
            />
              <Button 
                onClick={handleSendResponse} 
                disabled={!response.trim()}
                size="sm"
              >
                Envoyer le message
            </Button>
          </div>

            <Separator />

          {/* Marquer comme traité */}
            <div className="pt-2">
            <Button 
              onClick={handleMarkTreated}
              variant={status === "traité" ? "secondary" : "default"}
              disabled={status === "traité"}
              className="w-full"
                size="sm"
            >
              {status === "traité" ? "Déjà marqué comme traité" : "Marquer comme traité"}
            </Button>
          </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
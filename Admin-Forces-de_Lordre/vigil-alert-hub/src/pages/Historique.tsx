import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { History, Filter, Clock, User, MapPin, Eye, ArrowLeft, Calendar, UserCheck, Map, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import apiService, { type Signalement, type User } from '@/lib/api'

// Fonction pour convertir les signalements en format historique
const convertSignalementToHistorique = (signalement: Signalement) => {
  const date = new Date(signalement.date_signalement)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  let timeAgo = ""
  if (diffInMinutes < 60) {
    timeAgo = `Il y a ${diffInMinutes} min`
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60)
    timeAgo = `Il y a ${hours}h`
  } else {
    const days = Math.floor(diffInMinutes / 1440)
    timeAgo = `Il y a ${days} jour${days > 1 ? 's' : ''}`
  }

  return {
    id: signalement.id,
    type: signalement.niveau === 'danger-critical' ? 'critical' : 
          signalement.niveau === 'danger-medium' ? 'medium' : 'safe',
    message: `${signalement.type} - ${signalement.description.substring(0, 50)}${signalement.description.length > 50 ? '...' : ''}`,
    time: timeAgo,
    date: date.toISOString().split('T')[0],
    heure: signalement.heure || date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    location: signalement.adresse || `Lat: ${signalement.latitude}, Lng: ${signalement.longitude}`,
    details: signalement.description,
    reporter: signalement.citoyen ? `${signalement.citoyen.prenom} ${signalement.citoyen.nom}` : 'Citoyen',
    status: signalement.status,
    agent: signalement.agent_assigne ? `${signalement.agent_assigne.prenom} ${signalement.agent_assigne.nom}` : null,
    signalement: signalement // Garder la référence complète
  }
}

// Composant pour les détails d'activité
function ActivityDetailDialog({ activity }: { activity: any }) {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [isAssigning, setIsAssigning] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState("")
  const [notes, setNotes] = useState("")
  const [agents, setAgents] = useState<User[]>([])

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

  const handleTakeCharge = async () => {
    if (!selectedAgent) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un agent",
        variant: "destructive"
      })
      return
    }

    setIsAssigning(true)
    
    try {
      // Assignation réelle via l'API
      await apiService.assignAgent(activity.id, parseInt(selectedAgent))
      
      toast({
        title: "Prise en charge confirmée",
        description: `L'agent a été assigné au signalement "${activity.message}"`,
      })
      
      // Mise à jour du statut de l'activité
      activity.status = "en cours"
      const selectedAgentData = agents.find(a => a.id.toString() === selectedAgent)
      activity.agent = selectedAgentData ? `${selectedAgentData.prenom} ${selectedAgentData.nom}` : "Agent assigné"
      
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'assigner l'agent",
        variant: "destructive"
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const handleViewOnMap = () => {
    toast({
      title: "Navigation vers la carte",
      description: `Localisation: ${activity.location}`,
    })
    
    // Simulation de navigation vers la carte avec coordonnées
    navigate('/signalements', { 
      state: { 
        viewMode: 'map', 
        highlightLocation: activity.location,
        activityId: activity.id
      } 
    })
  }

  const availableAgents = agents.map(agent => ({
    value: agent.id.toString(),
    label: `${agent.prenom} ${agent.nom} (${agent.unite || agent.secteur})`
  }))

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-sm flex items-center gap-2">
          <div className={cn(
            "w-3 h-3 rounded-full",
            activity.type === "critical" ? "bg-danger-critical" :
            activity.type === "medium" ? "bg-danger-medium" : "bg-safe-zone"
          )} />
          {activity.message}
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-medium text-foreground mb-1">Date et Heure</h4>
            <p className="text-xs text-muted-foreground">{activity.date} à {activity.heure}</p>
          </div>
          <div>
            <h4 className="text-xs font-medium text-foreground mb-1">Localisation</h4>
            <p className="text-xs text-muted-foreground">{activity.location}</p>
          </div>
          <div>
            <h4 className="text-xs font-medium text-foreground mb-1">Signalé par</h4>
            <p className="text-xs text-muted-foreground">{activity.reporter}</p>
          </div>
          <div>
            <h4 className="text-xs font-medium text-foreground mb-1">Agent assigné</h4>
            <p className="text-xs text-muted-foreground">{activity.agent || "Non assigné"}</p>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium text-foreground mb-1">Statut</h4>
          <Badge variant={
            activity.status === "traité" ? "success" :
            activity.status === "en cours" ? "warning" : "destructive"
          } className="text-2xs">
            {activity.status}
          </Badge>
        </div>
        
        <div>
          <h4 className="text-xs font-medium text-foreground mb-2">Détails</h4>
          <p className="text-xs text-muted-foreground leading-relaxed bg-muted p-3 rounded">
            {activity.details}
          </p>
        </div>

        {/* Section de prise en charge */}
        {activity.status !== "traité" && (
          <div className="space-y-3 border-t pt-3">
            <h4 className="text-xs font-medium text-foreground">Assignation</h4>
            
            <div className="space-y-2">
              <div>
                <label className="text-xs font-medium text-foreground">Agent disponible</label>
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sélectionner un agent..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAgents.map((agent) => (
                      <SelectItem key={agent.value} value={agent.value}>
                        {agent.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-xs font-medium text-foreground">Notes d'intervention (optionnel)</label>
                <Textarea
                  placeholder="Instructions spécifiques pour l'agent..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 min-h-16"
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          {activity.status !== "traité" ? (
            <>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" className="flex-1" disabled={!selectedAgent}>
                    <UserCheck className="h-3 w-3 mr-1" />
                    {isAssigning ? "Attribution..." : "Prendre en charge"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-sm">Confirmer la prise en charge</AlertDialogTitle>
                    <AlertDialogDescription className="text-xs">
                      Voulez-vous assigner <strong>{selectedAgent}</strong> au signalement "{activity.message}" ?
                      {notes && (
                        <div className="mt-2 p-2 bg-muted rounded">
                          <strong>Notes:</strong> {notes}
                        </div>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="text-xs">Annuler</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleTakeCharge}
                      disabled={isAssigning}
                      className="text-xs"
                    >
                      {isAssigning ? "Attribution..." : "Confirmer"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button variant="outline" size="sm" className="flex-1" onClick={handleViewOnMap}>
                <Map className="h-3 w-3 mr-1" />
                Voir sur carte
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="flex-1" disabled>
                <CheckCircle className="h-3 w-3 mr-1" />
                Déjà traité
              </Button>
              
              <Button variant="outline" size="sm" className="flex-1" onClick={handleViewOnMap}>
                <Map className="h-3 w-3 mr-1" />
                Voir sur carte
              </Button>
            </>
          )}
        </div>

        {activity.status === "en cours" && activity.agent && (
          <div className="bg-warning/10 border border-warning/20 rounded p-2">
            <div className="flex items-center gap-2">
              <UserCheck className="h-3 w-3 text-warning" />
              <span className="text-xs font-medium">Agent assigné: {activity.agent}</span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default function Historique() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterDate, setFilterDate] = useState("all")
  const [signalements, setSignalements] = useState<Signalement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger les signalements depuis l'API
  useEffect(() => {
    const fetchSignalements = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiService.getSignalements()
        setSignalements(data)
      } catch (e: any) {
        console.error('Erreur lors du chargement des signalements:', e)
        setError(e?.message || 'Erreur lors du chargement des données')
      } finally {
        setLoading(false)
      }
    }

    fetchSignalements()
  }, [])

  // Convertir les signalements en format historique
  const historiqueComplet = signalements.map(convertSignalementToHistorique)

  const filteredHistorique = historiqueComplet.filter(activity => {
    const matchesSearch = activity.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.reporter.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || activity.type === filterType
    const matchesStatus = filterStatus === "all" || activity.status === filterStatus
    
    // Filtrage par date
    let matchesDate = true
    if (filterDate !== "all") {
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      if (filterDate === "today") {
        matchesDate = activity.date === today
      } else if (filterDate === "yesterday") {
        matchesDate = activity.date === yesterday
      }
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesDate
  })

  const getTypeLabel = (type: string) => {
    switch(type) {
      case "critical": return "Critique"
      case "medium": return "Moyen"
      case "safe": return "Sécurisé"
      default: return type
    }
  }

  const getTypeColor = (type: string) => {
    switch(type) {
      case "critical": return "destructive"
      case "medium": return "warning"
      case "safe": return "success"
      default: return "secondary"
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

  // Affichage de chargement
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/")}
            className="px-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              Historique des Activités
            </h1>
            <p className="text-xs text-muted-foreground">Chargement des données...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  // Affichage d'erreur
  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/")}
            className="px-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              Historique des Activités
            </h1>
            <p className="text-xs text-red-500">Erreur: {error}</p>
          </div>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">Impossible de charger l'historique des activités.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header avec retour */}
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/")}
          className="px-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            Historique des Activités
          </h1>
          <p className="text-xs text-muted-foreground">
            {filteredHistorique.length} activité{filteredHistorique.length > 1 ? 's' : ''} trouvée{filteredHistorique.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="hover:scale-105 transition-transform">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{historiqueComplet.length}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:scale-105 transition-transform">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-danger-critical">
                {historiqueComplet.filter(h => h.type === "critical").length}
              </div>
              <div className="text-xs text-muted-foreground">Critiques</div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:scale-105 transition-transform">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-warning">
                {historiqueComplet.filter(h => h.status === "en cours").length}
              </div>
              <div className="text-xs text-muted-foreground">En cours</div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:scale-105 transition-transform">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-safe-zone">
                {historiqueComplet.filter(h => h.status === "traité").length}
              </div>
              <div className="text-xs text-muted-foreground">Traités</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-3 w-3" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Rechercher</label>
              <Input
                placeholder="Message, lieu ou personne..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-7"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-7">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="critical">Critique</SelectItem>
                  <SelectItem value="medium">Moyen</SelectItem>
                  <SelectItem value="safe">Sécurisé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Statut</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-7">
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
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Période</label>
              <Select value={filterDate} onValueChange={setFilterDate}>
                <SelectTrigger className="h-7">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les dates</SelectItem>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="yesterday">Hier</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des activités */}
      <div className="space-y-3">
        {filteredHistorique.map((activity, index) => (
          <Card 
            key={activity.id} 
            className="hover:shadow-lg transition-all duration-200 animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Indicateur de type */}
                <div className={cn(
                  "w-3 h-3 rounded-full mt-1 flex-shrink-0",
                  activity.type === "critical" ? "bg-danger-critical" :
                  activity.type === "medium" ? "bg-danger-medium" : "bg-safe-zone"
                )} />
                
                {/* Contenu principal */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{activity.message}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getTypeColor(activity.type)} className="text-2xs">
                          {getTypeLabel(activity.type)}
                        </Badge>
                        <Badge variant={
                          activity.status === "traité" ? "success" :
                          activity.status === "en cours" ? "warning" : "destructive"
                        } className="text-2xs">
                          {getStatusLabel(activity.status)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {activity.date}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {activity.heure}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-2xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {activity.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {activity.reporter}
                    </div>
                  </div>
                  
                  {activity.agent && (
                    <div className="text-2xs text-muted-foreground">
                      Agent assigné: <span className="font-medium">{activity.agent}</span>
                    </div>
                  )}
                </div>
                
                {/* Bouton d'action */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="xs">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <ActivityDetailDialog activity={activity} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHistorique.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">Aucune activité trouvée avec ces filtres.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 
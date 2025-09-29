import { useState } from "react"
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

// Données étendues pour l'historique complet
const historiqueComplet = [
  {
    id: 1,
    type: "critical",
    message: "Accident grave autoroute",
    time: "Il y a 5 min",
    date: "2024-01-20",
    heure: "14:30",
    location: "Autoroute A1",
    details: "Collision entre 3 véhicules. Blessés graves signalés. Ambulances en route.",
    reporter: "Amadou Ba",
    status: "en cours",
    agent: "Agent Martin"
  },
  {
    id: 2,
    type: "medium",
    message: "Vol signalé Sandaga",
    time: "Il y a 12 min",
    date: "2024-01-20",
    heure: "14:15",
    location: "Marché Sandaga",
    details: "Vol à la tire signalé par une commerçante. Suspect en fuite.",
    reporter: "Marie Diallo",
    status: "non traité",
    agent: null
  },
  {
    id: 3,
    type: "safe",
    message: "Zone Almadies sécurisée",
    time: "Il y a 25 min",
    date: "2024-01-20",
    heure: "14:00",
    location: "Quartier Almadies",
    details: "Intervention terminée avec succès. Zone maintenant sécurisée.",
    reporter: "Fatou Sow",
    status: "traité",
    agent: "Agent Diop"
  },
  {
    id: 4,
    type: "critical",
    message: "Incendie immeuble résidentiel",
    time: "Il y a 2h",
    date: "2024-01-20",
    heure: "12:30",
    location: "Médina",
    details: "Incendie déclaré dans un immeuble. Plusieurs familles évacuées.",
    reporter: "Omar Diop",
    status: "traité",
    agent: "Pompiers Secteur Sud"
  },
  {
    id: 5,
    type: "medium",
    message: "Bagarre rue Félix Faure",
    time: "Il y a 3h",
    date: "2024-01-20",
    heure: "11:45",
    location: "Rue Félix Faure",
    details: "Altercation entre plusieurs personnes. Situation sous contrôle.",
    reporter: "Khadija Fall",
    status: "traité",
    agent: "Agent Fall"
  },
  {
    id: 6,
    type: "safe",
    message: "Patrouille préventive terminée",
    time: "Il y a 4h",
    date: "2024-01-20",
    heure: "10:30",
    location: "Plateau",
    details: "Patrouille de routine effectuée sans incident.",
    reporter: "Système",
    status: "traité",
    agent: "Agent Martin"
  },
  {
    id: 7,
    type: "medium",
    message: "Véhicule suspect signalé",
    time: "Hier 18:20",
    date: "2024-01-19",
    heure: "18:20",
    location: "Corniche",
    details: "Véhicule sans plaque d'immatriculation stationné.",
    reporter: "Citoyen anonyme",
    status: "traité",
    agent: "Agent Diop"
  },
  {
    id: 8,
    type: "critical",
    message: "Cambriolage en cours",
    time: "Hier 15:10",
    date: "2024-01-19",
    heure: "15:10",
    location: "Fann Résidence",
    details: "Tentative de cambriolage signalée par un voisin.",
    reporter: "Ibrahim Sarr",
    status: "traité",
    agent: "Agent Fall"
  }
]

// Composant pour les détails d'activité
function ActivityDetailDialog({ activity }: { activity: any }) {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [isAssigning, setIsAssigning] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState("")
  const [notes, setNotes] = useState("")

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
      // Simulation d'assignation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: "Prise en charge confirmée",
        description: `${selectedAgent} a été assigné au signalement "${activity.message}"`,
      })
      
      // Mise à jour du statut de l'activité (simulation)
      activity.status = "en cours"
      activity.agent = selectedAgent
      
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

  const availableAgents = [
    "Agent Martin (Secteur Nord)",
    "Agent Diop (Centre-ville)", 
    "Agent Fall (Secteur Sud)",
    "Agent Ndiaye (Secteur Est)",
    "Agent Sy (Secteur Ouest)"
  ]

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
                      <SelectItem key={agent} value={agent}>
                        {agent}
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

  const filteredHistorique = historiqueComplet.filter(activity => {
    const matchesSearch = activity.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.reporter.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || activity.type === filterType
    const matchesStatus = filterStatus === "all" || activity.status === filterStatus
    const matchesDate = filterDate === "all" || 
                       (filterDate === "today" && activity.date === "2024-01-20") ||
                       (filterDate === "yesterday" && activity.date === "2024-01-19")
    
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
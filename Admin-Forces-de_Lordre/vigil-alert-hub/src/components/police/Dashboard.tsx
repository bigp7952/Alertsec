import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { AlertTriangle, Users, MessageSquare, TrendingUp, MapPin, Clock, Navigation, Eye, ArrowRight, UserCheck, Map, CheckCircle, Wifi, WifiOff, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import InteractiveMap from "@/components/map/InteractiveMap"
import { useSupabase } from "@/hooks/useSupabase"
import { statsService } from "@/lib/supabase"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
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

// Composant pour les détails d'activité
function ActivityDetailDialog({ activity }: { activity: any }) {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [isAssigning, setIsAssigning] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState("")
  const [notes, setNotes] = useState("")
  const { agents, assignerAgent } = useSupabase()

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
      const agentId = parseInt(selectedAgent)
      await assignerAgent(activity.id, agentId)
      
      toast({
        title: "Prise en charge confirmée",
        description: `Agent assigné au signalement "${activity.message}"`,
      })
      
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
    
    navigate('/signalements', { 
      state: { 
        viewMode: 'map', 
        highlightLocation: activity.location,
        activityId: activity.id
      } 
    })
  }

  const availableAgents = agents.filter(agent => agent.status === 'disponible')

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
            <h4 className="text-xs font-medium text-foreground mb-1">Heure</h4>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
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
            <h4 className="text-xs font-medium text-foreground mb-1">Statut</h4>
            <Badge variant={
              activity.status === "traité" ? "success" :
              activity.status === "en cours" ? "warning" : "destructive"
            } className="text-2xs">
              {activity.status}
            </Badge>
          </div>
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
                      <SelectItem key={agent.id} value={agent.id.toString()}>
                        {agent.nom} ({agent.secteur})
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
                      Voulez-vous assigner l'agent au signalement "{activity.message}" ?
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

export function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [stats, setStats] = useState({
    totalSignalements: 0,
    signalementsCritiques: 0,
    agentsDisponibles: 0,
    tauxResolution: 0
  })
  const [statsParJour, setStatsParJour] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  const { toast } = useToast()
  const navigate = useNavigate()
  const { isConnected, signalements, agents, notifications } = useSupabase()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true)
        const [statsData, statsJourData] = await Promise.all([
          statsService.getStats(),
          statsService.getStatsParJour()
        ])
        setStats(statsData)
        setStatsParJour(statsJourData)
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les statistiques",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [toast])

  // Fonction pour gérer l'affichage des détails d'une activité
  const handleViewActivity = (activity: any) => {
    toast({
      title: "Activité consultée",
      description: `Détails de "${activity.message}" affichés`,
    })
  }

  // Fonction pour naviguer vers l'historique complet
  const handleViewAllHistory = () => {
    navigate('/historique')
  }

  // Fonction pour gérer le clic sur un signalement de la carte
  const handleSignalementClick = (signalement: any) => {
    toast({
      title: "Zone sélectionnée",
      description: `${signalement.nom} - ${signalement.description}`,
    })
  }

  // Convertir les signalements en format d'activité
  const recentActivity = signalements.slice(0, 3).map(signalement => ({
    id: signalement.id,
    type: signalement.niveau === 'danger-critical' ? 'critical' : 
          signalement.niveau === 'danger-medium' ? 'medium' : 'safe',
    message: signalement.description,
    time: new Date(signalement.created_at).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    location: signalement.localisation.nom,
    details: signalement.description,
    reporter: signalement.citoyen,
    status: signalement.status,
    agent: signalement.agent_assigne
  }))

  return (
    <div className="space-y-4">
      {/* Header avec heure et statut de connexion */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">Tableau de Bord</h1>
          <p className="text-xs text-muted-foreground">
            {currentTime.toLocaleDateString("fr-FR")} - {currentTime.toLocaleTimeString("fr-FR")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "success" : "destructive"} className="animate-bounce-in">
            {isConnected ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
            {isConnected ? "Connecté" : "Déconnecté"}
          </Badge>
          <Badge variant="outline" className="animate-bounce-in">
            <Activity className="h-3 w-3 mr-1" />
            Temps réel
          </Badge>
        </div>
      </div>

      {/* Statistiques principales - plus compactes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="hover:scale-105 transition-transform duration-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs text-muted-foreground">Signalements</CardTitle>
              <AlertTriangle className="h-3 w-3 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-foreground">
                {isLoading ? "..." : stats.totalSignalements}
              </span>
              <Badge variant="success" className="text-2xs">+5</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:scale-105 transition-transform duration-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs text-muted-foreground">Cas Critiques</CardTitle>
              <AlertTriangle className="h-3 w-3 text-danger-critical" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-danger-critical">
                {isLoading ? "..." : stats.signalementsCritiques}
              </span>
              <Badge variant="warning" className="text-2xs">urgent</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:scale-105 transition-transform duration-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs text-muted-foreground">Agents Actifs</CardTitle>
              <Users className="h-3 w-3 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-foreground">
                {isLoading ? "..." : stats.agentsDisponibles}
              </span>
              <Badge variant="outline" className="text-2xs">/ {agents.length}</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:scale-105 transition-transform duration-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs text-muted-foreground">Taux Résolution</CardTitle>
              <TrendingUp className="h-3 w-3 text-safe-zone" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-safe-zone">
                {isLoading ? "..." : `${stats.tauxResolution}%`}
              </span>
              <Badge variant="success" className="text-2xs">+3%</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques et carte */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Graphique principal */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Signalements cette semaine</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={statsParJour}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="signalements" fill="#2563EB" radius={[2, 2, 0, 0]} />
                <Bar dataKey="traites" fill="#10B981" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition par type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Répartition par type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Critiques", value: signalements.filter(s => s.niveau === 'danger-critical').length, color: "#DC2626" },
                    { name: "Moyens", value: signalements.filter(s => s.niveau === 'danger-medium').length, color: "#F59E0B" },
                    { name: "Sécurisés", value: signalements.filter(s => s.niveau === 'safe-zone').length, color: "#10B981" },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[
                    { name: "Critiques", value: signalements.filter(s => s.niveau === 'danger-critical').length, color: "#DC2626" },
                    { name: "Moyens", value: signalements.filter(s => s.niveau === 'danger-medium').length, color: "#F59E0B" },
                    { name: "Sécurisés", value: signalements.filter(s => s.niveau === 'safe-zone').length, color: "#10B981" },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {[
                { name: "Critiques", color: "#DC2626" },
                { name: "Moyens", color: "#F59E0B" },
                { name: "Sécurisés", color: "#10B981" },
              ].map((entry, index) => (
                <div key={index} className="flex items-center gap-1">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-2xs text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Carte et activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Carte interactive */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              Carte des signalements urgents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 rounded-md overflow-hidden">
              <InteractiveMap 
                onSignalementClick={handleSignalementClick}
              />
            </div>
            <div className="mt-3 space-y-2">
              <h4 className="text-xs font-medium text-foreground">Agents sur le terrain</h4>
              <div className="grid grid-cols-2 gap-2">
                {agents.slice(0, 3).map((agent) => (
                  <div key={agent.id} className="flex items-center gap-2 p-2 bg-muted rounded text-2xs">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      agent.status === "disponible" ? "bg-safe-zone" : "bg-warning"
                    )} />
                    <div>
                      <div className="font-medium">{agent.nom}</div>
                      <div className="text-muted-foreground">{agent.secteur}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activité récente - maintenant fonctionnelle */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-2 hover:bg-muted rounded-md transition-colors">
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-1",
                    activity.type === "critical" ? "bg-danger-critical" :
                    activity.type === "medium" ? "bg-danger-medium" : "bg-safe-zone"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{activity.message}</p>
                    <p className="text-2xs text-muted-foreground">{activity.time} • {activity.location}</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="xs"
                        onClick={() => handleViewActivity(activity)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <ActivityDetailDialog activity={activity} />
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-3"
              onClick={handleViewAllHistory}
            >
              <ArrowRight className="h-3 w-3 mr-1" />
              Voir tout l'historique
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
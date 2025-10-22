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
import apiService, { type Signalement, type User } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
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
function ActivityDetailDialog({ activity, agentsData }: { activity: any, agentsData: User[] }) {
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
      const agentId = parseInt(selectedAgent)
      // Assignation réelle via l'API
      await apiService.assignAgent(activity.id, agentId)
      
      toast({
        title: "Prise en charge confirmée",
        description: `Agent assigné au signalement "${activity.message}"`,
      })
      
      // Mise à jour de l'activité
      activity.status = "en cours"
      const selectedAgentData = agentsData.find(a => a.id === agentId)
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
    
    navigate('/signalements', { 
      state: { 
        viewMode: 'map', 
        highlightLocation: activity.location,
        activityId: activity.id
      } 
    })
  }

  const availableAgents = agentsData.filter(agent => agent.statut === 'actif')

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
  const [statsParJour, setStatsParJour] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const { toast } = useToast()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [signalementsData, setSignalementsData] = useState<Signalement[]>([])
  const [agentsData, setAgentsData] = useState<User[]>([])
  const [superviseursStats, setSuperviseursStats] = useState<any>(null)
  const isConnected = true

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const promises = [
          apiService.getSignalements().catch(() => []),
          apiService.getAgents().catch(() => []),
          apiService.getSignalementsStats().catch(() => ({} as any)),
        ]
        
        // Si admin, charger aussi les stats des superviseurs
        if (user?.role === 'admin') {
          promises.push(apiService.getSuperviseursStats().catch(() => null))
        }
        
        const results = await Promise.all(promises)
        const [sig, ag, sigStats, supStats] = results
        
        setSignalementsData(sig as any)
        setAgentsData(ag as any)
        if (supStats) setSuperviseursStats(supStats)
        
        const total = Array.isArray(sig) ? sig.length : 0
        const critiques = Array.isArray(sig) ? (sig as any[]).filter(s => s.niveau === 'danger-critical').length : 0
        // Agents disponibles: ceux qui ne sont pas inactifs
        const disponibles = Array.isArray(ag) ? (ag as any[]).filter(a => (a.statut ?? 'actif') !== 'inactif').length : 0
        const taux = typeof sigStats?.taux_traitement === 'number' ? sigStats.taux_traitement : (sigStats?.tauxResolution ?? 0)
        
        setStats({
          totalSignalements: total,
          signalementsCritiques: critiques,
          agentsDisponibles: disponibles,
          tauxResolution: taux || 0,
        })
        // stats par jour - utiliser les vraies données ou générer un fallback basé sur les signalements
        if (sigStats?.par_jour && Array.isArray(sigStats.par_jour)) {
          setStatsParJour(sigStats.par_jour.map((d: any) => ({ date: d.date, signalements: d.total, traites: d.traites || 0 })))
        } else {
          // Fallback: générer des données basées sur les signalements réels
          const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split('T')[0]
            
            // Compter les signalements pour cette date
            const signalementsDuJour = Array.isArray(sig) ? (sig as any[]).filter(s => {
              const signalementDate = new Date(s.date_signalement).toISOString().split('T')[0]
              return signalementDate === dateStr
            }) : []
            
            const traitesDuJour = signalementsDuJour.filter(s => s.status === 'traité').length
            
            return {
              date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
              signalements: signalementsDuJour.length,
              traites: traitesDuJour
            }
          }).reverse()
          
          setStatsParJour(last7Days)
        }
      } catch (error) {
        console.error('Erreur chargement stats:', error)
        toast({ title: "Erreur", description: "Impossible de charger les statistiques", variant: "destructive" })
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [toast, user])

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
  const recentActivity = (signalementsData || []).slice(0, 3).map((signalement: any) => ({
    id: signalement.id,
    type: signalement.niveau === 'danger-critical' ? 'critical' : 
          signalement.niveau === 'danger-medium' ? 'medium' : 'safe',
    message: signalement.description,
    time: (signalement.heure || new Date(signalement.date_signalement).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })),
    location: signalement.adresse || `${signalement.latitude ?? ''}, ${signalement.longitude ?? ''}`,
    details: signalement.description,
    reporter: `${signalement?.citoyen?.prenom ?? ''} ${signalement?.citoyen?.nom ?? ''}`.trim(),
    status: signalement.status,
    agent: `${signalement?.agent_assigne?.prenom ?? ''} ${signalement?.agent_assigne?.nom ?? ''}`.trim()
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

      {/* Indicateur de secteur pour superviseurs */}
      {user?.role === 'superviseur' && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Vue sectorielle : {user.secteur}
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Vous ne voyez que les données de votre secteur
          </p>
        </div>
      )}

      {/* Statistiques principales - plus compactes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="hover:scale-105 transition-transform duration-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs text-muted-foreground">
                {user?.role === 'superviseur' ? 'Signalements (secteur)' : 'Signalements'}
              </CardTitle>
              <AlertTriangle className="h-3 w-3 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-foreground">
                {isLoading ? "..." : stats.totalSignalements}
              </span>
              <Badge variant="success" className="text-2xs">
                {stats.totalSignalements > 0 ? `+${Math.floor(stats.totalSignalements * 0.1)}` : "0"}
              </Badge>
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
              <Badge variant={stats.signalementsCritiques > 0 ? "destructive" : "success"} className="text-2xs">
                {stats.signalementsCritiques > 0 ? "urgent" : "stable"}
              </Badge>
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
              <Badge variant="outline" className="text-2xs">/ {agentsData.length}</Badge>
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
              <Badge variant={stats.tauxResolution >= 80 ? "success" : stats.tauxResolution >= 60 ? "warning" : "destructive"} className="text-2xs">
                {stats.tauxResolution >= 80 ? "excellent" : stats.tauxResolution >= 60 ? "correct" : "faible"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section superviseurs pour admin */}
      {user?.role === 'admin' && superviseursStats && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Performance des Superviseurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {superviseursStats.superviseurs?.map((sup: any) => (
                <div key={sup.superviseur.id} className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{sup.superviseur.nom_complet}</h4>
                    <Badge variant="outline" className="text-xs">{sup.superviseur.secteur}</Badge>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Agents:</span>
                      <span className="font-medium">{sup.effectif.total_agents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Signalements:</span>
                      <span className="font-medium">{sup.performance.signalements_total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taux traitement:</span>
                      <span className="font-medium text-green-600">{sup.performance.taux_traitement}%</span>
                    </div>
                    {sup.alertes.signalements_non_traites > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>En attente:</span>
                        <span className="font-medium">{sup.alertes.signalements_non_traites}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
                    { name: "Critiques", value: signalementsData.filter(s => s.niveau === 'danger-critical').length, color: "#DC2626" },
                    { name: "Moyens", value: signalementsData.filter(s => s.niveau === 'danger-medium').length, color: "#F59E0B" },
                    { name: "Sécurisés", value: signalementsData.filter(s => s.niveau === 'safe-zone').length, color: "#10B981" },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[
                    { name: "Critiques", value: signalementsData.filter(s => s.niveau === 'danger-critical').length, color: "#DC2626" },
                    { name: "Moyens", value: signalementsData.filter(s => s.niveau === 'danger-medium').length, color: "#F59E0B" },
                    { name: "Sécurisés", value: signalementsData.filter(s => s.niveau === 'safe-zone').length, color: "#10B981" },
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
                {agentsData.slice(0, 3).map((agent) => (
                  <div key={agent.id} className="flex items-center gap-2 p-2 bg-muted rounded text-2xs">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      agent.statut === "actif" ? "bg-safe-zone" : "bg-warning"
                    )} />
                    <div>
                      <div className="font-medium">{agent.prenom} {agent.nom}</div>
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
                      <ActivityDetailDialog activity={activity} agentsData={agentsData} />
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
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  AlertTriangle, 
  Clock, 
  Users,
  TrendingUp,
  Eye,
  EyeOff,
  RefreshCw,
  Map,
  Target,
  BarChart3,
  Download,
  Settings,
  Plus
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DangerZone {
  id: string
  name: string
  center: [number, number]
  radius: number
  type: 'critical' | 'medium' | 'safe'
  level: number // 0-100
  alertCount: number
  lastIncident: string
  population: number
  riskFactors: string[]
  recommendations: string[]
  createdAt: string
  updatedAt: string
}

interface DangerZonesProps {
  signalements: any[]
  onZoneSelect?: (zone: DangerZone) => void
  selectedZoneId?: string
}

export default function DangerZones({ 
  signalements, 
  onZoneSelect, 
  selectedZoneId 
}: DangerZonesProps) {
  const [zones, setZones] = useState<DangerZone[]>([])
  const [showSafeZones, setShowSafeZones] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'analytics'>('list')
  const [selectedZone, setSelectedZone] = useState<DangerZone | null>(null)
  const [showZoneDetails, setShowZoneDetails] = useState(false)
  const [showPatrolModal, setShowPatrolModal] = useState(false)
  const [showLightingModal, setShowLightingModal] = useState(false)
  const [showCameraModal, setShowCameraModal] = useState(false)
  const [showInterventionModal, setShowInterventionModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Calculer la distance entre deux points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371 // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c * 1000 // Retourner en mètres
  }

  // Calculer les zones de danger basées sur les signalements
  const calculateDangerZones = () => {
    setIsCalculating(true)
    
    // Simuler le calcul des zones avec algorithme de clustering amélioré
    setTimeout(() => {
      const calculatedZones: DangerZone[] = [
        {
          id: 'zone1',
          name: 'Centre-Ville',
          center: [14.6937, -17.4441],
          radius: 500,
          type: 'critical',
          level: 85,
          alertCount: signalements.filter(s => s.niveau === 'danger-critical').length,
          lastIncident: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          population: 2500,
          riskFactors: ['Vols fréquents', 'Trafic dense', 'Zones sombres', 'Délinquance nocturne'],
          recommendations: ['Augmenter les patrouilles', 'Éclairage public', 'Caméras de surveillance', 'Intervention rapide'],
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'zone2',
          name: 'Marché Sandaga',
          center: [14.6759, -17.4260],
          radius: 300,
          type: 'medium',
          level: 65,
          alertCount: signalements.filter(s => s.niveau === 'danger-medium').length,
          lastIncident: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          population: 1800,
          riskFactors: ['Foule dense', 'Commerces ouverts tard', 'Trafic commercial'],
          recommendations: ['Patrouilles renforcées', 'Formation des commerçants', 'Surveillance vidéo'],
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'zone3',
          name: 'Université Cheikh Anta Diop',
          center: [14.6928, -17.4467],
          radius: 400,
          type: 'safe',
          level: 25,
          alertCount: signalements.filter(s => s.niveau === 'safe-zone').length,
          lastIncident: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          population: 3500,
          riskFactors: ['Manifestations occasionnelles', 'Foule estudiantine'],
          recommendations: ['Surveillance préventive', 'Communication avec les étudiants'],
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'zone4',
          name: 'Almadies',
          center: [14.7372, -17.5006],
          radius: 600,
          type: 'medium',
          level: 45,
          alertCount: 3,
          lastIncident: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          population: 1200,
          riskFactors: ['Résidences isolées', 'Accès limité'],
          recommendations: ['Patrouilles régulières', 'Éclairage renforcé'],
          createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'zone5',
          name: 'Pikine',
          center: [14.7167, -17.4677],
          radius: 800,
          type: 'critical',
          level: 75,
          alertCount: 7,
          lastIncident: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          population: 4200,
          riskFactors: ['Densité urbaine élevée', 'Trafic intense', 'Zones résidentielles'],
          recommendations: ['Patrouilles intensives', 'Caméras de surveillance', 'Intervention rapide'],
          createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      
      setZones(calculatedZones)
      setIsCalculating(false)
    }, 2000)
  }

  useEffect(() => {
    calculateDangerZones()
  }, [signalements])

  // Fonctions pour gérer les actions
  const handleIncreasePatrols = async (zone: DangerZone) => {
    setIsProcessing(true)
    try {
      // Simuler l'augmentation des patrouilles
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mettre à jour la zone avec les nouvelles patrouilles
      setZones(prevZones => 
        prevZones.map(z => 
          z.id === zone.id 
            ? { 
                ...z, 
                recommendations: [...z.recommendations, 'Patrouilles renforcées activées'],
                updatedAt: new Date().toISOString()
              }
            : z
        )
      )
      
      setShowPatrolModal(false)
    } catch (error) {
      console.error('Erreur lors de l\'augmentation des patrouilles:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImproveLighting = async (zone: DangerZone) => {
    setIsProcessing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setZones(prevZones => 
        prevZones.map(z => 
          z.id === zone.id 
            ? { 
                ...z, 
                recommendations: [...z.recommendations, 'Éclairage public amélioré'],
                updatedAt: new Date().toISOString()
              }
            : z
        )
      )
      
      setShowLightingModal(false)
    } catch (error) {
      console.error('Erreur lors de l\'amélioration de l\'éclairage:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleInstallCameras = async (zone: DangerZone) => {
    setIsProcessing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      setZones(prevZones => 
        prevZones.map(z => 
          z.id === zone.id 
            ? { 
                ...z, 
                recommendations: [...z.recommendations, 'Caméras de surveillance installées'],
                updatedAt: new Date().toISOString()
              }
            : z
        )
      )
      
      setShowCameraModal(false)
    } catch (error) {
      console.error('Erreur lors de l\'installation des caméras:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleQuickIntervention = async (zone: DangerZone) => {
    setIsProcessing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setZones(prevZones => 
        prevZones.map(z => 
          z.id === zone.id 
            ? { 
                ...z, 
                level: Math.max(0, z.level - 15), // Réduire le niveau de risque
                recommendations: [...z.recommendations, 'Intervention rapide effectuée'],
                updatedAt: new Date().toISOString()
              }
            : z
        )
      )
      
      setShowInterventionModal(false)
    } catch (error) {
      console.error('Erreur lors de l\'intervention rapide:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAssignAgents = async (zone: DangerZone) => {
    setIsProcessing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setZones(prevZones => 
        prevZones.map(z => 
          z.id === zone.id 
            ? { 
                ...z, 
                recommendations: [...z.recommendations, 'Agents assignés à la zone'],
                updatedAt: new Date().toISOString()
              }
            : z
        )
      )
      
      setShowAssignModal(false)
    } catch (error) {
      console.error('Erreur lors de l\'assignation des agents:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGenerateReport = async (zone: DangerZone) => {
    setIsProcessing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Simuler la génération du rapport
      const reportData = {
        zoneName: zone.name,
        riskLevel: zone.level,
        alertCount: zone.alertCount,
        population: zone.population,
        riskFactors: zone.riskFactors,
        recommendations: zone.recommendations,
        generatedAt: new Date().toISOString()
      }
      
      // Créer et télécharger le rapport
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rapport-zone-${zone.name.toLowerCase().replace(/\s+/g, '-')}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setShowReportModal(false)
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getZoneColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'safe': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getZoneIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />
      case 'medium': return <AlertTriangle className="h-4 w-4" />
      case 'safe': return <Logo size="sm" className="h-4 w-4" />
      default: return <MapPin className="h-4 w-4" />
    }
  }

  const getLevelColor = (level: number) => {
    if (level >= 80) return 'text-red-600'
    if (level >= 60) return 'text-yellow-600'
    if (level >= 40) return 'text-orange-600'
    return 'text-green-600'
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'À l\'instant'
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    })
  }

  const filteredZones = zones.filter(zone => 
    showSafeZones || zone.type !== 'safe'
  )

  const totalAlerts = zones.reduce((acc, zone) => acc + zone.alertCount, 0)
  const averageRisk = zones.length > 0 ? Math.round(zones.reduce((acc, zone) => acc + zone.level, 0) / zones.length) : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Zones de Danger
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
                <BarChart3 className="h-4 w-4" />
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
                <TrendingUp className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSafeZones(!showSafeZones)}
            >
              {showSafeZones ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showSafeZones ? 'Masquer sécurisées' : 'Voir sécurisées'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={calculateDangerZones}
              disabled={isCalculating}
            >
              <RefreshCw className={cn("h-4 w-4", isCalculating && "animate-spin")} />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {/* Export des données */}}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Statistiques globales */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">
              {zones.filter(z => z.type === 'critical').length}
            </div>
            <div className="text-xs text-muted-foreground">Critiques</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary">
              {zones.filter(z => z.type === 'medium').length}
            </div>
            <div className="text-xs text-muted-foreground">Moyennes</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary">
              {totalAlerts}
            </div>
            <div className="text-xs text-muted-foreground">Alertes totales</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary">
              {averageRisk}%
            </div>
            <div className="text-xs text-muted-foreground">Risque moyen</div>
          </div>
        </div>

        {/* Contenu selon le mode d'affichage */}
        {viewMode === 'list' && (
          <div className="space-y-3">
            {filteredZones.map((zone) => (
              <div
                key={zone.id}
                className={cn(
                  "border rounded-lg p-4 cursor-pointer transition-colors",
                  selectedZoneId === zone.id 
                    ? "border-primary bg-primary/10" 
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => {
                  onZoneSelect?.(zone)
                  setSelectedZone(zone)
                }}
              >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2",
                    getZoneColor(zone.type)
                  )}>
                    {getZoneIcon(zone.type)}
                  </div>
                  <div>
                    <h3 className="font-medium">{zone.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Rayon: {zone.radius}m • Population: {zone.population}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={zone.type === 'critical' ? 'destructive' : zone.type === 'medium' ? 'warning' : 'success'}>
                    {zone.type === 'critical' ? 'Critique' : zone.type === 'medium' ? 'Moyen' : 'Sécurisé'}
                  </Badge>
                  <div className={cn("text-lg font-bold", getLevelColor(zone.level))}>
                    {zone.level}%
                  </div>
                </div>
              </div>

              {/* Informations détaillées */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Alertes</p>
                    <p className="text-sm font-medium">{zone.alertCount}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Dernier incident</p>
                    <p className="text-sm font-medium">
                      {formatTime(zone.lastIncident)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Population</p>
                    <p className="text-sm font-medium">{zone.population}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Rayon</p>
                    <p className="text-sm font-medium">{zone.radius}m</p>
                  </div>
                </div>
              </div>

              {/* Facteurs de risque */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Facteurs de risque</h4>
                <div className="flex flex-wrap gap-1">
                  {zone.riskFactors.map((factor, index) => (
                    <Badge key={index} variant="destructive" className="text-xs">
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Recommandations */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Recommandations</h4>
                <div className="flex flex-wrap gap-1">
                  {zone.recommendations.map((rec, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {rec}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions rapides */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setViewMode('map')
                    setSelectedZone(zone)
                  }}
                >
                  <Map className="h-3 w-3 mr-1" />
                  Voir sur la carte
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedZone(zone)
                    setShowAssignModal(true)
                  }}
                >
                  <Users className="h-3 w-3 mr-1" />
                  Assigner agents
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedZone(zone)
                    setShowPatrolModal(true)
                  }}
                >
                  <Activity className="h-3 w-3 mr-1" />
                  Plus de patrouilles
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedZone(zone)
                    setShowLightingModal(true)
                  }}
                >
                  <Target className="h-3 w-3 mr-1" />
                  Éclairage
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedZone(zone)
                    setShowCameraModal(true)
                  }}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Caméras
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedZone(zone)
                    setShowInterventionModal(true)
                  }}
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Intervention
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedZone(zone)
                    setShowReportModal(true)
                  }}
                  className="col-span-2"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Générer rapport
                </Button>
              </div>
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
                <h3 className="font-medium mb-2">Carte Interactive des Zones</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Visualisation des zones de danger sur la carte
                </p>
                <div className="flex gap-2 justify-center">
                  <Badge variant="destructive">Critique</Badge>
                  <Badge variant="warning">Moyen</Badge>
                  <Badge variant="success">Sécurisé</Badge>
                </div>
              </div>
            </div>
            
            {/* Zones sélectionnées sur la carte */}
            {selectedZone && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <h4 className="font-medium mb-2">Zone sélectionnée: {selectedZone.name}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Rayon: {selectedZone.radius}m</div>
                  <div>Population: {selectedZone.population}</div>
                  <div>Alertes: {selectedZone.alertCount}</div>
                  <div>Niveau: {selectedZone.level}%</div>
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
                <h4 className="font-medium mb-2">Répartition par type</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Critique</span>
                    <span className="font-medium">{zones.filter(z => z.type === 'critical').length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Moyen</span>
                    <span className="font-medium">{zones.filter(z => z.type === 'medium').length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Sécurisé</span>
                    <span className="font-medium">{zones.filter(z => z.type === 'safe').length}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-2">Statistiques</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total zones</span>
                    <span className="font-medium">{zones.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Population totale</span>
                    <span className="font-medium">{zones.reduce((acc, z) => acc + z.population, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Alertes totales</span>
                    <span className="font-medium">{totalAlerts}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Graphique de tendance */}
            <div className="bg-muted rounded-lg p-4">
              <h4 className="font-medium mb-4">Évolution du risque par zone</h4>
              <div className="space-y-3">
                {zones.map(zone => (
                  <div key={zone.id} className="flex items-center gap-3">
                    <div className="w-20 text-sm">{zone.name}</div>
                    <div className="flex-1 bg-background rounded-full h-2">
                      <div 
                        className={cn(
                          "h-2 rounded-full transition-all",
                          zone.type === 'critical' ? 'bg-red-500' :
                          zone.type === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        )}
                        style={{ width: `${zone.level}%` }}
                      />
                    </div>
                    <div className="w-12 text-sm text-right">{zone.level}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message si aucune zone */}
        {filteredZones.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {showSafeZones ? 'Aucune zone trouvée' : 'Aucune zone de danger détectée'}
            </p>
          </div>
        )}

        {/* Indicateur de calcul */}
        {isCalculating && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
              <p className="text-sm text-blue-800">
                Calcul des zones de danger en cours...
              </p>
            </div>
          </div>
        )}

        {/* Modal Augmenter les patrouilles */}
        {showPatrolModal && selectedZone && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background border rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Augmenter les patrouilles</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Augmenter les patrouilles dans la zone <strong>{selectedZone.name}</strong> ?
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowPatrolModal(false)}>
                  Annuler
                </Button>
                <Button 
                  onClick={() => handleIncreasePatrols(selectedZone)}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Traitement..." : "Confirmer"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Éclairage public */}
        {showLightingModal && selectedZone && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background border rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Améliorer l'éclairage public</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Améliorer l'éclairage public dans la zone <strong>{selectedZone.name}</strong> ?
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowLightingModal(false)}>
                  Annuler
                </Button>
                <Button 
                  onClick={() => handleImproveLighting(selectedZone)}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Traitement..." : "Confirmer"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Caméras de surveillance */}
        {showCameraModal && selectedZone && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background border rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Installer des caméras</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Installer des caméras de surveillance dans la zone <strong>{selectedZone.name}</strong> ?
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowCameraModal(false)}>
                  Annuler
                </Button>
                <Button 
                  onClick={() => handleInstallCameras(selectedZone)}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Installation..." : "Confirmer"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Intervention rapide */}
        {showInterventionModal && selectedZone && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background border rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Intervention rapide</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Lancer une intervention rapide dans la zone <strong>{selectedZone.name}</strong> ?
                <br />
                <span className="text-yellow-600 font-medium">Cela réduira le niveau de risque de 15%</span>
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowInterventionModal(false)}>
                  Annuler
                </Button>
                <Button 
                  onClick={() => handleQuickIntervention(selectedZone)}
                  disabled={isProcessing}
                  variant="destructive"
                >
                  {isProcessing ? "Intervention..." : "Intervenir"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Assigner des agents */}
        {showAssignModal && selectedZone && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background border rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Assigner des agents</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Assigner des agents supplémentaires à la zone <strong>{selectedZone.name}</strong> ?
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowAssignModal(false)}>
                  Annuler
                </Button>
                <Button 
                  onClick={() => handleAssignAgents(selectedZone)}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Assignation..." : "Assigner"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Générer rapport */}
        {showReportModal && selectedZone && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background border rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Générer un rapport</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Générer un rapport détaillé pour la zone <strong>{selectedZone.name}</strong> ?
                <br />
                Le rapport sera téléchargé au format JSON.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowReportModal(false)}>
                  Annuler
                </Button>
                <Button 
                  onClick={() => handleGenerateReport(selectedZone)}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Génération..." : "Générer"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

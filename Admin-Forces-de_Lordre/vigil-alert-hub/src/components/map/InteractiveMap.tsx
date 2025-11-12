import React, { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, AlertTriangle, Clock, User, UserCheck } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import apiService from '@/lib/api'

// Fix pour les icônes Leaflet dans Vite
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Interface pour les signalements
interface Signalement {
  id: number
  type: string
  gravite?: string
  description: string
  latitude: number
  longitude: number
  statut: string
  created_at: string
  user?: {
    nom: string
    prenom: string
  }
}

// Interface pour les zones dangereuses
interface ZoneDangereuse {
  id: number
  nom: string
  type: string
  latitude: number
  longitude: number
  rayon: number
  description: string
  niveau_danger: string
  created_at: string
}

// Définition des zones de signalement avec coordonnées réalistes de Dakar
const signalementZones = [
  {
    id: 1,
    nom: "Autoroute A1",
    type: "critical",
    centre: [14.7645, -17.3660],
    zone: [
      [14.7665, -17.3680],
      [14.7665, -17.3640],
      [14.7625, -17.3640],
      [14.7625, -17.3680]
    ],
    description: "Accident grave - 3 véhicules",
    reporter: "Amadou Ba",
    time: "Il y a 5 min",
    status: "en_cours"
  },
  {
    id: 2,
    nom: "Marché Sandaga",
    type: "medium",
    centre: [14.6928, -17.4467],
    zone: [
      [14.6948, -17.4487],
      [14.6948, -17.4447],
      [14.6908, -17.4447],
      [14.6908, -17.4487]
    ],
    description: "Vol à la tire signalé",
    reporter: "Marie Diallo",
    time: "Il y a 12 min",
    status: "non_traite"
  },
  {
    id: 3,
    nom: "Quartier Almadies",
    type: "safe",
    centre: [14.7392, -17.5103],
    zone: [
      [14.7412, -17.5123],
      [14.7412, -17.5083],
      [14.7372, -17.5083],
      [14.7372, -17.5123]
    ],
    description: "Zone sécurisée",
    reporter: "Fatou Sow",
    time: "Il y a 25 min",
    status: "traite"
  },
  {
    id: 4,
    nom: "Médina",
    type: "critical",
    centre: [14.6892, -17.4374],
    zone: [
      [14.6912, -17.4394],
      [14.6912, -17.4354],
      [14.6872, -17.4354],
      [14.6872, -17.4394]
    ],
    description: "Incendie immeuble résidentiel",
    reporter: "Omar Diop",
    time: "Il y a 2h",
    status: "traite"
  },
  {
    id: 5,
    nom: "Rue Félix Faure",
    type: "medium",
    centre: [14.6959, -17.4421],
    zone: [
      [14.6979, -17.4441],
      [14.6979, -17.4401],
      [14.6939, -17.4401],
      [14.6939, -17.4441]
    ],
    description: "Bagarre signalée",
    reporter: "Khadija Fall",
    time: "Il y a 3h",
    status: "traite"
  }
]

// Positions des agents
const agentsPositions = [
  {
    id: 1,
    nom: "Agent Martin",
    position: [14.7500, -17.4000],
    secteur: "Nord",
    status: "disponible"
  },
  {
    id: 2,
    nom: "Agent Diop",
    position: [14.6950, -17.4450],
    secteur: "Centre",
    status: "en_mission"
  },
  {
    id: 3,
    nom: "Agent Fall",
    position: [14.7200, -17.4800],
    secteur: "Sud",
    status: "disponible"
  }
]

// Composant pour centrer la carte sur une zone spécifique (une seule fois)
function MapController({ center, zoom, highlightLocation }: { 
  center: [number, number], 
  zoom: number,
  highlightLocation?: string 
}) {
  const map = useMap()
  const [hasInitialized, setHasInitialized] = useState(false)
  
  useEffect(() => {
    // Centrer seulement au premier rendu ou quand une zone est mise en évidence
    if (!hasInitialized || highlightLocation) {
      map.setView(center, zoom)
      setHasInitialized(true)
    }
  }, [map, center, zoom, highlightLocation, hasInitialized])
  
  return null
}

// Icônes personnalisées pour les agents
const createAgentIcon = (status: string) => {
  const color = status === 'disponible' ? '#10B981' : '#F59E0B'
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-agent-icon',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  })
}

// Composant pour la dialog d'intervention depuis la carte
function InterventionDialog({ zone }: { zone: any }) {
  const { toast } = useToast()
  const [isAssigning, setIsAssigning] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState("")
  const [notes, setNotes] = useState("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const availableAgents = [
    "Agent Martin (Secteur Nord)",
    "Agent Diop (Centre-ville)", 
    "Agent Fall (Secteur Sud)",
    "Agent Ndiaye (Secteur Est)",
    "Agent Sy (Secteur Ouest)"
  ]

  const handleIntervention = async () => {
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
        title: "Intervention assignée",
        description: `${selectedAgent} a été dépêché vers ${zone.nom}`,
      })
      
      // Mise à jour du statut de la zone (simulation)
      zone.status = "en_cours"
      
      setShowConfirmDialog(false)
      setSelectedAgent("")
      setNotes("")
      
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'assigner l'intervention",
        variant: "destructive"
      })
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button size="xs" className="text-2xs">
            <UserCheck className="h-3 w-3 mr-1" />
            Intervenir
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                zone.type === 'critical' ? 'bg-danger-critical' :
                zone.type === 'medium' ? 'bg-danger-medium' : 'bg-safe-zone'
              }`} />
              Intervention - {zone.nom}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted p-3 rounded text-xs">
              <div className="font-medium">{zone.description}</div>
              <div className="text-muted-foreground mt-1">
                Signalé par {zone.reporter} • {zone.time}
              </div>
            </div>
            
            <div className="space-y-3">
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
                <label className="text-xs font-medium text-foreground">Instructions pour l'agent</label>
                <Textarea
                  placeholder="Instructions spécifiques, équipement nécessaire..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 min-h-16"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowConfirmDialog(true)}
                disabled={!selectedAgent || isAssigning}
                className="flex-1"
                size="sm"
              >
                {isAssigning ? "Assignation..." : "Dépêcher l'agent"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">Confirmer l'intervention</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Voulez-vous dépêcher <strong>{selectedAgent}</strong> vers {zone.nom} ?
              
              {notes && (
                <div className="mt-2 p-2 bg-muted rounded">
                  <strong>Instructions:</strong> {notes}
                </div>
              )}
              
              <div className="mt-2 text-warning">
                <strong>Priorité:</strong> {
                  zone.type === 'critical' ? 'CRITIQUE' :
                  zone.type === 'medium' ? 'Moyenne' : 'Normale'
                }
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setShowConfirmDialog(false)}
              className="text-xs"
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleIntervention}
              disabled={isAssigning}
              className="text-xs"
            >
              {isAssigning ? "Assignation..." : "Confirmer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

interface InteractiveMapProps {
  highlightLocation?: string
  activityId?: number
  onSignalementClick?: (signalement: any) => void
}

export default function InteractiveMap({ 
  highlightLocation, 
  activityId, 
  onSignalementClick 
}: InteractiveMapProps) {
  const mapRef = useRef<L.Map>(null)
  const [signalements, setSignalements] = useState<Signalement[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [zonesDangereuses, setZonesDangereuses] = useState<ZoneDangereuse[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Récupération des données depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Récupérer les signalements
        const signalementsData = await apiService.getSignalements()
        setSignalements(signalementsData || [])
        
        // Récupérer les agents
        const agentsData = await apiService.getAgents()
        setAgents(agentsData || [])
        
        // Récupérer les zones dangereuses
        const zonesData = await apiService.getZonesDangereuses()
        setZonesDangereuses(zonesData || [])
        
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les données de la carte",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    
    // Actualiser les données toutes les 30 secondes
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [toast])

  // Fonction pour obtenir la couleur selon la gravité
  const getGravityColor = (gravite: string) => {
    switch (gravite?.toLowerCase()) {
      case 'critique':
      case 'critical':
      case 'urgent':
        return '#DC2626' // Rouge vif
      case 'moyen':
      case 'medium':
      case 'modere':
        return '#F59E0B' // Orange
      case 'faible':
      case 'low':
      case 'mineur':
        return '#10B981' // Vert
      case 'information':
      case 'info':
        return '#3B82F6' // Bleu
      default:
        return '#6B7280' // Gris
    }
  }

  // Fonction pour obtenir la couleur selon le type
  const getZoneColor = (type: string, isHighlighted: boolean = false) => {
    const opacity = isHighlighted ? 0.8 : 0.4
    const strokeOpacity = isHighlighted ? 1 : 0.7
    
    switch (type) {
      case 'critical':
        return {
          color: '#DC2626',
          fillColor: '#DC2626',
          fillOpacity: opacity,
          weight: isHighlighted ? 3 : 2,
          opacity: strokeOpacity
        }
      case 'medium':
        return {
          color: '#F59E0B',
          fillColor: '#F59E0B',
          fillOpacity: opacity,
          weight: isHighlighted ? 3 : 2,
          opacity: strokeOpacity
        }
      case 'safe':
        return {
          color: '#10B981',
          fillColor: '#10B981',
          fillOpacity: opacity,
          weight: isHighlighted ? 3 : 2,
          opacity: strokeOpacity
        }
      default:
        return {
          color: '#6b7280',
          fillColor: '#6b7280',
          fillOpacity: opacity,
          weight: isHighlighted ? 3 : 2,
          opacity: strokeOpacity
        }
    }
  }

  // Fonction pour obtenir le label du statut
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'non_traite': return 'Non traité'
      case 'en_cours': return 'En cours'
      case 'traite': return 'Traité'
      default: return status
    }
  }

  // Fonction pour obtenir la variante du badge
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'non_traite': return 'destructive'
      case 'en_cours': return 'warning'
      case 'traite': return 'success'
      default: return 'secondary'
    }
  }

  // Centre de la carte sur Dakar
  const centerDakar: [number, number] = [14.7167, -17.4677]
  const zoomLevel = highlightLocation ? 15 : 12

  // Trouver la zone mise en évidence
  const highlightedZone = highlightLocation 
    ? signalementZones.find(zone => zone.nom === highlightLocation)
    : null

  if (loading) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      <MapContainer
        center={highlightedZone ? highlightedZone.centre : centerDakar}
        zoom={zoomLevel}
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
        ref={mapRef}
        className="z-0"
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
        keyboard={true}
        dragging={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Contrôleur pour centrer la carte seulement au début */}
        <MapController 
          center={highlightedZone ? highlightedZone.centre : centerDakar} 
          zoom={zoomLevel}
          highlightLocation={highlightLocation}
        />
        
        {/* Marqueurs des signalements */}
        {signalements.map((signalement) => {
          const isHighlighted = activityId === signalement.id
          const markerColor = getGravityColor(signalement.gravite || signalement.type)
          const iconSize = signalement.gravite === 'critique' || signalement.gravite === 'critical' ? 25 : 20
          
          return (
            <Marker
              key={signalement.id}
              position={[signalement.latitude, signalement.longitude]}
              icon={L.divIcon({
                className: 'custom-marker',
                html: `<div style="
                  background-color: ${markerColor};
                  width: ${iconSize}px;
                  height: ${iconSize}px;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 3px 6px rgba(0,0,0,0.4);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: ${iconSize > 20 ? '14px' : '12px'};
                  font-weight: bold;
                  animation: ${signalement.gravite === 'critique' ? 'pulse 2s infinite' : 'none'};
                ">!</div>`,
                iconSize: [iconSize, iconSize],
                iconAnchor: [iconSize/2, iconSize/2]
              })}
              eventHandlers={{
                click: () => {
                  if (onSignalementClick) {
                    onSignalementClick(signalement)
                  }
                },
              }}
            >
              <Popup>
                <div className="p-2 min-w-64">
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1`} 
                         style={{ backgroundColor: markerColor }} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">Signalement #{signalement.id}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{signalement.description}</p>
                      
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          <span>{signalement.user?.prenom} {signalement.user?.nom}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(signalement.created_at).toLocaleString()}</span>
                        </div>
                        {signalement.gravite && (
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-3 w-3" />
                            <span className="font-medium" style={{ color: markerColor }}>
                              Gravité: {signalement.gravite}
                            </span>
                          </div>
                        )}
                        <div className="mt-2">
                          <Badge 
                            variant={getStatusVariant(signalement.statut)}
                            className="text-2xs"
                          >
                            {getStatusLabel(signalement.statut)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
        
        {/* Zones dangereuses */}
        {zonesDangereuses.map((zone) => {
          const zoneColor = getGravityColor(zone.niveau_danger)
          const circleRadius = zone.rayon || 100 // Rayon en mètres
          
          return (
            <Circle
              key={zone.id}
              center={[zone.latitude, zone.longitude]}
              radius={circleRadius}
              pathOptions={{
                color: zoneColor,
                fillColor: zoneColor,
                fillOpacity: 0.2,
                weight: 2,
                opacity: 0.6
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-sm">{zone.nom}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{zone.description}</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3" />
                      <span className="font-medium" style={{ color: zoneColor }}>
                        Niveau: {zone.niveau_danger}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(zone.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Circle>
          )
        })}
        
        {/* Marqueurs des agents */}
        {agents.filter(agent => agent.latitude && agent.longitude).map((agent) => {
          const agentColor = agent.statut === 'disponible' ? '#10B981' : 
                           agent.statut === 'en_mission' ? '#F59E0B' : '#6B7280'
          
          return (
          <Marker
            key={agent.id}
              position={[agent.latitude!, agent.longitude!]}
              icon={L.divIcon({
                className: 'agent-marker',
                html: `<div style="
                  background-color: ${agentColor};
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 3px 6px rgba(0,0,0,0.4);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: 14px;
                  font-weight: bold;
                ">👮</div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              })}
          >
            <Popup>
              <div className="p-2">
                  <h3 className="font-semibold text-sm">{agent.prenom} {agent.nom}</h3>
                <p className="text-xs text-muted-foreground">Secteur {agent.secteur}</p>
                <Badge 
                    variant={agent.statut === 'disponible' ? 'success' : 'warning'}
                  className="text-2xs mt-1"
                >
                    {agent.statut === 'disponible' ? 'Disponible' : 'En mission'}
                </Badge>
              </div>
            </Popup>
          </Marker>
          )
        })}
      </MapContainer>
      
      {/* Légende */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg z-10">
        <h4 className="text-xs font-semibold mb-2">Légende</h4>
        <div className="space-y-1">
          <div className="text-xs font-medium text-gray-600 mb-1">Signalements</div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: '#DC2626' }}></div>
            <span>Critique/Urgent</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: '#F59E0B' }}></div>
            <span>Moyen/Modéré</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: '#10B981' }}></div>
            <span>Faible/Mineur</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: '#3B82F6' }}></div>
            <span>Information</span>
          </div>
          
          <div className="text-xs font-medium text-gray-600 mb-1 mt-2">Agents</div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: '#10B981' }}></div>
            <span>👮 Disponible</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: '#F59E0B' }}></div>
            <span>👮 En mission</span>
          </div>
          
          <div className="text-xs font-medium text-gray-600 mb-1 mt-2">Zones dangereuses</div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: '#DC2626' }}></div>
            <span>Zone critique</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: '#F59E0B' }}></div>
            <span>Zone moyenne</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: '#10B981' }}></div>
            <span>Zone sûre</span>
          </div>
        </div>
      </div>

      {/* Indicateur de zone mise en évidence */}
      {highlightLocation && (
        <div className="absolute bottom-4 left-4 bg-primary/90 text-white rounded-lg p-3 shadow-lg z-10">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <div>
              <div className="text-sm font-semibold">Zone ciblée</div>
              <div className="text-xs opacity-90">{highlightLocation}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
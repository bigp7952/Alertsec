import { useEffect, useRef } from "react"

interface Signalement {
  id: string
  localisation: { lat: number; lng: number }
  niveau: string
  description: string
  citoyen: string
}

interface MapComponentProps {
  signalements: Signalement[]
}

export function MapComponent({ signalements }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simuler une carte avec des zones colorées
    // En production, intégrer Google Maps ici
  }, [signalements])

  const getZoneColor = (niveau: string) => {
    switch(niveau) {
      case "danger-critical": return "bg-danger-critical"
      case "danger-medium": return "bg-danger-medium" 
      case "safe-zone": return "bg-safe-zone"
      default: return "bg-muted"
    }
  }

  return (
    <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
      {/* Placeholder pour la carte - En production utiliser Google Maps */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-gray-700">Carte de Dakar</h3>
          <p className="text-sm text-gray-500">Intégration Google Maps à venir</p>
        </div>
      </div>

      {/* Légende des zones */}
      <div className="absolute top-4 right-4 bg-card border border-border rounded-lg p-3 space-y-2">
        <h4 className="font-medium text-sm text-foreground">Légende</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-danger-critical rounded"></div>
            <span>Zone critique</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-danger-medium rounded"></div>
            <span>Activité suspecte</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-safe-zone rounded"></div>
            <span>Zone sécurisée</span>
          </div>
        </div>
      </div>

      {/* Compteur de signalements */}
      <div className="absolute bottom-4 left-4 bg-card border border-border rounded-lg p-3">
        <div className="text-sm font-medium text-foreground">
          {signalements.length} signalement{signalements.length > 1 ? 's' : ''} actif{signalements.length > 1 ? 's' : ''}
        </div>
      </div>
    </div>
  )
}
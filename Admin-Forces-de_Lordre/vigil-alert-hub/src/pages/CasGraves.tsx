import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { SignalementDetailPopup } from "@/components/police/SignalementDetailPopup"

// Mock data pour les cas graves uniquement
const casGraves = [
  {
    id: "2", 
    citoyen: "Amadou Ba",
    heure: "13:45",
    description: "Accident de voiture grave sur l'autoroute. Plusieurs véhicules impliqués, blessés sur place. Ambulances requises d'urgence.",
    niveau: "danger-critical" as const,
    status: "en cours" as const,
    localisation: { lat: 14.7204, lng: -17.4581 },
    photo: null,
    priorite: "URGENCE",
    uniteAssignee: "Pompiers Secteur Nord"
  },
  {
    id: "5",
    citoyen: "Aïssa Mbaye",
    heure: "10:45",
    description: "Manifestation non déclarée en cours place de l'Indépendance. Risque d'escalade, présence de plus de 200 personnes.",
    niveau: "danger-critical" as const,
    status: "en cours" as const,
    localisation: { lat: 14.6937, lng: -17.4441 },
    photo: null,
    priorite: "TRÈS URGENT",
    uniteAssignee: "Police Anti-Émeute"
  },
  {
    id: "7",
    citoyen: "Omar Diop",
    heure: "09:30",
    description: "Incendie déclaré dans un immeuble résidentiel à Médina. Plusieurs familles bloquées aux étages supérieurs.",
    niveau: "danger-critical" as const,
    status: "non traité" as const,
    localisation: { lat: 14.6892, lng: -17.4384 },
    photo: null,
    priorite: "CRITIQUE",
    uniteAssignee: null
  },
  {
    id: "8",
    citoyen: "Khadija Fall",
    heure: "08:15",
    description: "Prise d'otage signalée dans une banque du centre-ville. Situation très tendue, négociateur requis.",
    niveau: "danger-critical" as const,
    status: "en cours" as const,
    localisation: { lat: 14.6928, lng: -17.4467 },
    photo: null,
    priorite: "CRITIQUE",
    uniteAssignee: "GIGN"
  }
]

const getPrioriteColor = (priorite: string) => {
  switch(priorite) {
    case "CRITIQUE": return "bg-red-600"
    case "TRÈS URGENT": return "bg-red-500"
    case "URGENCE": return "bg-orange-500"
    default: return "bg-red-600"
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
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCas = casGraves.filter(cas => 
    cas.citoyen.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cas.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cas.priorite.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const casNonTraites = filteredCas.filter(cas => cas.status === "non traité")
  const casEnCours = filteredCas.filter(cas => cas.status === "en cours")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Cas Graves</h1>
        <div className="flex gap-2">
          <Badge variant="destructive" className="text-lg px-3 py-1">
            {casNonTraites.length} non traités
          </Badge>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {casEnCours.length} en cours
          </Badge>
        </div>
      </div>

      {/* Alertes urgentes */}
      {casNonTraites.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              🚨 ATTENTION : {casNonTraites.length} cas critique{casNonTraites.length > 1 ? 's' : ''} non traité{casNonTraites.length > 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      {/* Recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrer les cas graves</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Rechercher par nom, description ou priorité..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Liste des cas graves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCas.map((cas) => (
          <Card 
            key={cas.id} 
            className={`border-l-4 ${cas.status === "non traité" ? "border-l-red-500" : "border-l-orange-500"} hover:shadow-lg transition-shadow`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={`${getPrioriteColor(cas.priorite)} text-white`}>
                    {cas.priorite}
                  </Badge>
                  <span className="text-sm text-muted-foreground">#{cas.id}</span>
                </div>
                <span className="text-sm font-medium text-foreground">{cas.heure}</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground">{cas.citoyen}</h3>
                <Badge variant="outline" className="mt-1">
                  {getStatusLabel(cas.status)}
                </Badge>
              </div>
              
              <p className="text-sm text-foreground leading-relaxed">
                {cas.description}
              </p>
              
              {cas.uniteAssignee && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm font-medium text-foreground">Unité assignée :</p>
                  <p className="text-sm text-muted-foreground">{cas.uniteAssignee}</p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="default" size="sm" className="flex-1">
                      Intervention urgente
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <SignalementDetailPopup signalement={cas} />
                  </DialogContent>
                </Dialog>
                
                {cas.status === "non traité" && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => console.log(`Alerte déclenchée pour ${cas.id}`)}
                  >
                    🚨 Alerte
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCas.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Aucun cas grave trouvé avec ce filtre.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
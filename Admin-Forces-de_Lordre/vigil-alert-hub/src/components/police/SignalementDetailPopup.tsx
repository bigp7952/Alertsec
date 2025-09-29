import { useState } from "react"
import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

interface Signalement {
  id: string
  citoyen: string
  heure: string
  description: string
  niveau: string
  status: string
  localisation: { lat: number; lng: number }
  photo?: string | null
}

interface SignalementDetailPopupProps {
  signalement: Signalement
}

const getNiveauLabel = (niveau: string) => {
  switch(niveau) {
    case "danger-critical": return "Critique"
    case "danger-medium": return "Suspect"
    case "safe-zone": return "Sécurisé"
    default: return niveau
  }
}

const getBadgeVariant = (niveau: string) => {
  switch(niveau) {
    case "danger-critical": return "destructive"
    case "danger-medium": return "secondary" 
    case "safe-zone": return "default"
    default: return "secondary"
  }
}

export function SignalementDetailPopup({ signalement }: SignalementDetailPopupProps) {
  const [response, setResponse] = useState("")
  const [selectedAgent, setSelectedAgent] = useState("")
  const [status, setStatus] = useState(signalement.status)

  const handleAssignAgent = () => {
    // Logique d'assignation Firebase
    console.log(`Assigner à l'agent: ${selectedAgent}`)
  }

  const handleSendResponse = () => {
    // Logique de réponse Firebase
    console.log(`Réponse envoyée: ${response}`)
  }

  const handleMarkTreated = () => {
    setStatus("traité")
    // Logique Firebase pour marquer comme traité
    console.log("Signalement marqué comme traité")
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Détail du Signalement #{signalement.id}</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* Informations principales */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{signalement.citoyen}</h3>
                <p className="text-sm text-muted-foreground">Signalé à {signalement.heure}</p>
              </div>
              <Badge variant={getBadgeVariant(signalement.niveau)}>
                {getNiveauLabel(signalement.niveau)}
              </Badge>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{signalement.description}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-2">Localisation</h4>
              <p className="text-sm text-muted-foreground">
                Lat: {signalement.localisation.lat}, Lng: {signalement.localisation.lng}
              </p>
            </div>
            
            {signalement.photo && (
              <div>
                <h4 className="font-medium text-foreground mb-2">Photo jointe</h4>
                <img 
                  src={signalement.photo} 
                  alt="Signalement" 
                  className="w-full max-w-sm rounded-lg border border-border"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-4">
          {/* Assigner à une unité */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Assigner à une unité
            </label>
            <div className="flex gap-2">
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Sélectionner un agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agent1">Agent Dupont - Secteur Nord</SelectItem>
                  <SelectItem value="agent2">Agent Martin - Secteur Sud</SelectItem>
                  <SelectItem value="agent3">Agent Bernard - Secteur Est</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAssignAgent} disabled={!selectedAgent}>
                Assigner
              </Button>
            </div>
          </div>

          {/* Répondre au signalement */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Répondre au signalement
            </label>
            <Textarea
              placeholder="Tapez votre réponse ici..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="min-h-20"
            />
            <Button onClick={handleSendResponse} disabled={!response.trim()}>
              Envoyer la réponse
            </Button>
          </div>

          {/* Marquer comme traité */}
          <div className="pt-4 border-t border-border">
            <Button 
              onClick={handleMarkTreated}
              variant={status === "traité" ? "secondary" : "default"}
              disabled={status === "traité"}
              className="w-full"
            >
              {status === "traité" ? "Déjà marqué comme traité" : "Marquer comme traité"}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
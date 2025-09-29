import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Star, ThumbsUp, AlertCircle, Bug, Send, Filter } from "lucide-react"

// Mock data pour les feedbacks
const mockFeedbacks = [
  {
    id: "1",
    citoyen: "Marie Diallo",
    email: "marie.diallo@email.com",
    date: "2024-01-20",
    heure: "14:30",
    type: "suggestion",
    note: 4,
    sujet: "Amélioration de l'interface",
    message: "L'application est très utile, mais il serait bien d'ajouter une fonction de notification push pour les alertes importantes.",
    status: "non lu",
    reponse: null
  },
  {
    id: "2",
    citoyen: "Amadou Ba",
    email: "amadou.ba@email.com",
    date: "2024-01-19",
    heure: "16:15",
    type: "plainte",
    note: 2,
    sujet: "Temps de réponse trop long",
    message: "J'ai signalé un accident grave hier et personne n'est venu. Le temps de réponse est inacceptable !",
    status: "en cours",
    reponse: "Nous enquêtons sur ce retard et vous recontacterons sous 24h."
  },
  {
    id: "3",
    citoyen: "Fatou Sow",
    email: "fatou.sow@email.com",
    date: "2024-01-18",
    heure: "09:45",
    type: "félicitation",
    note: 5,
    sujet: "Excellente intervention",
    message: "Merci aux équipes qui sont intervenues rapidement suite à mon signalement. Service impeccable !",
    status: "répondu",
    reponse: "Merci pour votre retour positif ! Nous transmettons vos félicitations à l'équipe."
  },
  {
    id: "4",
    citoyen: "Ibrahima Ndour",
    email: "ibrahima.ndour@email.com",
    date: "2024-01-17",
    heure: "11:20",
    type: "bug",
    note: 3,
    sujet: "Problème de géolocalisation",
    message: "L'application n'arrive pas à détecter ma position correctement, elle me localise toujours à 2km de ma vraie position.",
    status: "non lu",
    reponse: null
  },
  {
    id: "5",
    citoyen: "Aïssa Mbaye",
    email: "aissa.mbaye@email.com",
    date: "2024-01-16",
    heure: "13:10",
    type: "suggestion",
    note: 4,
    sujet: "Mode hors ligne",
    message: "Il faudrait un mode hors ligne pour pouvoir faire des signalements même sans connexion internet.",
    status: "non lu",
    reponse: null
  }
]

const getTypeIcon = (type: string) => {
  switch(type) {
    case "plainte": return AlertCircle
    case "suggestion": return MessageSquare
    case "félicitation": return ThumbsUp
    case "bug": return Bug
    default: return MessageSquare
  }
}

const getTypeColor = (type: string) => {
  switch(type) {
    case "plainte": return "destructive"
    case "suggestion": return "default"
    case "félicitation": return "success"
    case "bug": return "warning"
    default: return "outline"
  }
}

const getStatusColor = (status: string) => {
  switch(status) {
    case "non lu": return "destructive"
    case "en cours": return "warning"
    case "répondu": return "success"
    default: return "outline"
  }
}

const getStatusLabel = (status: string) => {
  switch(status) {
    case "non lu": return "Non lu"
    case "en cours": return "En cours"
    case "répondu": return "Répondu"
    default: return status
  }
}

const getTypeLabel = (type: string) => {
  switch(type) {
    case "plainte": return "Plainte"
    case "suggestion": return "Suggestion"
    case "félicitation": return "Félicitation"
    case "bug": return "Bug"
    default: return type
  }
}

const getNoteStars = (note: number) => {
  return "★".repeat(note) + "☆".repeat(5 - note)
}

export default function Feedbacks() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null)
  const [responseText, setResponseText] = useState("")

  const filteredFeedbacks = mockFeedbacks.filter(feedback => {
    const matchesSearch = feedback.citoyen.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.sujet.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || feedback.type === filterType
    const matchesStatus = filterStatus === "all" || feedback.status === filterStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  const handleSendResponse = (feedbackId: string) => {
    console.log(`Réponse envoyée pour feedback ${feedbackId}: ${responseText}`)
    setResponseText("")
    setSelectedFeedback(null)
  }

  const feedbacksNonLus = filteredFeedbacks.filter(f => f.status === "non lu")
  const moyenneNotes = mockFeedbacks.reduce((sum, f) => sum + f.note, 0) / mockFeedbacks.length

  return (
    <div className="space-y-4">
      {/* Header compact */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            Feedbacks Citoyens
          </h1>
          <p className="text-xs text-muted-foreground">
            Retours et suggestions de la communauté
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="destructive" className={feedbacksNonLus.length > 0 ? "animate-pulse" : ""}>
            {feedbacksNonLus.length} non lu{feedbacksNonLus.length > 1 ? 's' : ''}
          </Badge>
          <Badge variant="outline">
            <Star className="h-3 w-3 mr-1" />
            {moyenneNotes.toFixed(1)}/5
          </Badge>
        </div>
      </div>

      {/* Statistiques compactes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="hover:scale-105 transition-transform">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{mockFeedbacks.length}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:scale-105 transition-transform">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-danger-critical">
              {mockFeedbacks.filter(f => f.status === "non lu").length}
              </div>
              <div className="text-xs text-muted-foreground">Non lus</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:scale-105 transition-transform">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">
              {moyenneNotes.toFixed(1)}/5
              </div>
              <div className="text-xs text-muted-foreground">Note moyenne</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:scale-105 transition-transform">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-danger-medium">
              {mockFeedbacks.filter(f => f.type === "plainte").length}
              </div>
              <div className="text-xs text-muted-foreground">Plaintes</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres compacts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-3 w-3" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Rechercher</label>
              <Input
                placeholder="Nom, sujet ou message..."
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
                  <SelectItem value="plainte">Plaintes</SelectItem>
                  <SelectItem value="suggestion">Suggestions</SelectItem>
                  <SelectItem value="félicitation">Félicitations</SelectItem>
                  <SelectItem value="bug">Bugs</SelectItem>
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
                  <SelectItem value="non lu">Non lus</SelectItem>
                  <SelectItem value="en cours">En cours</SelectItem>
                  <SelectItem value="répondu">Répondus</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des feedbacks - plus compacte */}
      <div className="space-y-3">
        {filteredFeedbacks.map((feedback, index) => {
          const TypeIcon = getTypeIcon(feedback.type)
          return (
          <Card 
            key={feedback.id} 
              className={`${feedback.status === "non lu" ? "border-l-4 border-l-danger-critical bg-red-50/30" : ""} hover:shadow-lg transition-all duration-200 animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
          >
              <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TypeIcon className="h-3 w-3 text-muted-foreground" />
                  <div>
                      <h3 className="text-xs font-semibold text-foreground">{feedback.citoyen}</h3>
                      <p className="text-2xs text-muted-foreground">{feedback.email}</p>
                  </div>
                    <div className="flex gap-1">
                      <Badge variant={getTypeColor(feedback.type)} className="text-2xs">
                      {getTypeLabel(feedback.type)}
                    </Badge>
                      <Badge variant={getStatusColor(feedback.status)} className="text-2xs">
                      {getStatusLabel(feedback.status)}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                    <p className="text-xs font-medium text-foreground">{feedback.date}</p>
                    <p className="text-2xs text-muted-foreground">{feedback.heure}</p>
                    <p className="text-xs text-primary">{getNoteStars(feedback.note)}</p>
                </div>
              </div>
            </CardHeader>
            
              <CardContent className="space-y-3">
              <div>
                  <h4 className="text-xs font-medium text-foreground mb-1">{feedback.sujet}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed bg-white p-2 rounded border">
                  {feedback.message}
                </p>
              </div>
              
              {feedback.reponse && (
                  <div className="bg-muted p-2 rounded-md">
                    <p className="text-xs font-medium text-foreground mb-1">Notre réponse :</p>
                    <p className="text-xs text-muted-foreground">{feedback.reponse}</p>
                </div>
              )}
              
              {feedback.status !== "répondu" && (
                  <div className="space-y-2">
                  <Textarea
                    placeholder="Tapez votre réponse ici..."
                    value={selectedFeedback === feedback.id ? responseText : ""}
                    onChange={(e) => {
                      setSelectedFeedback(feedback.id)
                      setResponseText(e.target.value)
                    }}
                      className="min-h-16 text-xs"
                  />
                  <Button 
                    onClick={() => handleSendResponse(feedback.id)}
                    disabled={!responseText.trim() || selectedFeedback !== feedback.id}
                      size="xs"
                      className="w-full"
                  >
                      <Send className="h-3 w-3 mr-1" />
                    Envoyer la réponse
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          )
        })}
      </div>

      {filteredFeedbacks.length === 0 && (
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-sm text-muted-foreground">Aucun feedback trouvé avec ces filtres.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Send, 
  Clock, 
  User, 
  Bot,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Signalement, Communication } from "@/lib/mock-data"

interface CommunicationPanelProps {
  signalement: Signalement
  onSendMessage: (message: string, type: 'message' | 'sms' | 'appel') => void
  isSending?: boolean
}

export default function CommunicationPanel({ 
  signalement, 
  onSendMessage, 
  isSending = false 
}: CommunicationPanelProps) {
  const [newMessage, setNewMessage] = useState("")
  const [messageType, setMessageType] = useState<'message' | 'sms' | 'appel'>('message')

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim(), messageType)
      setNewMessage("")
    }
  }

  const handleQuickMessage = (message: string) => {
    setNewMessage(message)
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare className="h-4 w-4" />
      case 'appel': return <Phone className="h-4 w-4" />
      case 'sms': return <MessageSquare className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const getSenderIcon = (sender: string) => {
    switch (sender) {
      case 'citoyen': return <User className="h-4 w-4" />
      case 'agent': return <User className="h-4 w-4" />
      case 'systeme': return <Bot className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const getSenderColor = (sender: string) => {
    switch (sender) {
      case 'citoyen': return 'bg-blue-100 text-blue-800'
      case 'agent': return 'bg-green-100 text-green-800'
      case 'systeme': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const communications = signalement.communications || []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Communication avec le citoyen
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Informations de contact */}
        {signalement.contact && (
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-3">Informations de contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {signalement.contact.telephone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{signalement.contact.telephone}</span>
                  <Button variant="outline" size="sm">
                    Appeler
                  </Button>
                </div>
              )}
              {signalement.contact.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{signalement.contact.email}</span>
                  <Button variant="outline" size="sm">
                    Email
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Messages rapides */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Messages rapides</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickMessage("Agent en route, ETA 5 minutes")}
            >
              Agent en route
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickMessage("Pouvez-vous me donner plus de détails ?")}
            >
              Plus de détails
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickMessage("Situation sous contrôle")}
            >
              Situation contrôlée
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickMessage("Merci pour votre signalement")}
            >
              Remerciement
            </Button>
          </div>
        </div>

        {/* Historique des communications */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Historique des communications</h4>
          <div className="max-h-64 overflow-y-auto space-y-3">
            {communications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune communication pour le moment</p>
              </div>
            ) : (
              communications.map((comm, index) => (
                <div
                  key={comm.id}
                  className={cn(
                    "flex gap-3 p-3 rounded-lg",
                    comm.envoyeur === 'citoyen' 
                      ? "bg-blue-50 border-l-4 border-blue-500" 
                      : comm.envoyeur === 'agent'
                      ? "bg-green-50 border-l-4 border-green-500"
                      : "bg-gray-50 border-l-4 border-gray-500"
                  )}
                >
                  <div className="flex-shrink-0">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      getSenderColor(comm.envoyeur)
                    )}>
                      {getSenderIcon(comm.envoyeur)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {comm.envoyeur === 'citoyen' ? 'Citoyen' : 
                         comm.envoyeur === 'agent' ? 'Agent' : 'Système'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getMessageIcon(comm.type)}
                        {comm.type === 'message' ? 'Message' : 
                         comm.type === 'sms' ? 'SMS' : 'Appel'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(comm.timestamp)}
                      </span>
                      {!comm.lu && comm.envoyeur === 'citoyen' && (
                        <Badge variant="destructive" className="text-xs">
                          Non lu
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">{comm.contenu}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Nouveau message */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex gap-2">
            <Button
              variant={messageType === 'message' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMessageType('message')}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Message
            </Button>
            <Button
              variant={messageType === 'sms' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMessageType('sms')}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              SMS
            </Button>
            <Button
              variant={messageType === 'appel' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMessageType('appel')}
            >
              <Phone className="h-4 w-4 mr-1" />
              Appel
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Textarea
              placeholder={`Tapez votre ${messageType}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="min-h-[80px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleSendMessage()
                }
              }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Appuyez sur Ctrl+Entrée pour envoyer rapidement
            </p>
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
              size="sm"
            >
              {isSending ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">
              {communications.length}
            </div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary">
              {communications.filter(c => c.envoyeur === 'citoyen').length}
            </div>
            <div className="text-xs text-muted-foreground">Du citoyen</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary">
              {communications.filter(c => !c.lu && c.envoyeur === 'citoyen').length}
            </div>
            <div className="text-xs text-muted-foreground">Non lus</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}






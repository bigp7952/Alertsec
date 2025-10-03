import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Users, Search, Star, MapPin, Calendar, MessageCircle, Send, History, Plus, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/hooks/useSupabase"
import { usersService, signalementsService } from "@/lib/supabase"
import type { User } from "@/lib/supabase"

const getFiabiliteColor = (fiabilite: number) => {
  if (fiabilite >= 90) return "text-safe-zone"
  if (fiabilite >= 75) return "text-warning"
  return "text-danger-critical"
}

const getFiabiliteBadge = (fiabilite: number) => {
  if (fiabilite >= 90) return "success"
  if (fiabilite >= 75) return "warning"
  return "destructive"
}

// Composant pour l'historique des signalements
function HistoriqueDialog({ utilisateur }: { utilisateur: User }) {
  const [historique, setHistorique] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadHistorique = async () => {
      try {
        setIsLoading(true)
        // Récupérer les signalements de cet utilisateur
        const signalements = await signalementsService.getAll()
        const userSignalements = signalements.filter(s => s.citoyen === `${utilisateur.prenom} ${utilisateur.nom}`)
        setHistorique(userSignalements.map(s => ({
          id: s.id,
          date: new Date(s.created_at).toLocaleDateString('fr-FR'),
          type: s.niveau,
          status: s.status,
          description: s.description
        })))
      } catch (error) {
        console.error('Erreur lors du chargement de l\'historique:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadHistorique()
  }, [utilisateur])

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-sm">Historique de {utilisateur.prenom} {utilisateur.nom}</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Chargement...</p>
          </div>
        ) : historique.length === 0 ? (
          <div className="text-center py-4">
            <History className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Aucun signalement trouvé</p>
          </div>
        ) : (
          historique.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant={
                    item.type === 'danger-critical' ? 'destructive' :
                    item.type === 'danger-medium' ? 'warning' : 'success'
                  } className="text-2xs">
                    {item.type === 'danger-critical' ? 'Critique' :
                     item.type === 'danger-medium' ? 'Suspect' : 'Sécurisé'}
                  </Badge>
                  <Badge variant={
                    item.status === 'traité' ? 'success' :
                    item.status === 'en cours' ? 'warning' : 'secondary'
                  } className="text-2xs">
                    {item.status}
                  </Badge>
        </div>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              </div>
              <div className="text-xs text-muted-foreground">{item.date}</div>
            </div>
          ))
        )}
      </div>
    </>
  )
}

// Composant pour envoyer un message
function MessageDialog({ utilisateur }: { utilisateur: User }) {
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un message",
        variant: "destructive"
      })
      return
    }

    setIsSending(true)
    try {
      // TODO: Implémenter l'envoi de message via Supabase
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulation
      
      toast({
        title: "Message envoyé",
        description: `Message envoyé à ${utilisateur.prenom} ${utilisateur.nom}`,
      })
      
      setMessage("")
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-sm">Envoyer un message à {utilisateur.prenom} {utilisateur.nom}</DialogTitle>
      </DialogHeader>
        
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-foreground">Message</label>
            <Textarea
            placeholder="Saisissez votre message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-24"
          />
        </div>
        
          <Button 
            onClick={handleSendMessage}
          disabled={!message.trim() || isSending}
          className="w-full"
        >
          {isSending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
    </>
  )
}

// Composant pour les détails d'un utilisateur
function UtilisateurDetailPopup({ utilisateur }: { utilisateur: User }) {
  const { toast } = useToast()

  const handleUpdateUser = async (updates: Partial<User>) => {
    try {
      await usersService.updateLastConnection(utilisateur.id)
      toast({
        title: "Utilisateur mis à jour",
        description: "Les informations ont été mises à jour",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'utilisateur",
        variant: "destructive"
      })
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-sm">Détails de {utilisateur.prenom} {utilisateur.nom}</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
            <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={utilisateur.avatar} />
            <AvatarFallback>{utilisateur.prenom[0]}{utilisateur.nom[0]}</AvatarFallback>
              </Avatar>
          <div>
            <h3 className="font-medium">{utilisateur.prenom} {utilisateur.nom}</h3>
            <p className="text-sm text-muted-foreground">{utilisateur.grade}</p>
              </div>
            </div>
            
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-foreground">Matricule</label>
            <p className="text-sm">{utilisateur.matricule}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground">Unité</label>
            <p className="text-sm">{utilisateur.unite}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground">Secteur</label>
            <p className="text-sm">{utilisateur.secteur}</p>
              </div>
          <div>
            <label className="text-xs font-medium text-foreground">Rôle</label>
            <Badge variant="outline" className="text-2xs">
              {utilisateur.role}
            </Badge>
              </div>
            </div>
            
        <div>
          <label className="text-xs font-medium text-foreground">Statut</label>
          <Badge variant={
            utilisateur.statut === 'actif' ? 'success' :
            utilisateur.statut === 'inactif' ? 'secondary' : 'destructive'
          } className="text-2xs">
            {utilisateur.statut}
          </Badge>
        </div>
        
        {utilisateur.derniere_connexion && (
          <div>
            <label className="text-xs font-medium text-foreground">Dernière connexion</label>
            <p className="text-sm text-muted-foreground">
              {new Date(utilisateur.derniere_connexion).toLocaleString('fr-FR')}
            </p>
          </div>
        )}
      </div>
    </>
  )
}

export default function Utilisateurs() {
  const { toast } = useToast()
  const { signalements } = useSupabase()
  const [utilisateurs, setUtilisateurs] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatut, setFilterStatut] = useState("all")

  // Charger les utilisateurs
  useEffect(() => {
    const loadUtilisateurs = async () => {
      try {
        setIsLoading(true)
        const data = await usersService.getAll()
        setUtilisateurs(data)
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les utilisateurs",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadUtilisateurs()
  }, [toast])

  // Calculer les statistiques pour chaque utilisateur
  const utilisateursAvecStats = utilisateurs.map(user => {
    const userSignalements = signalements.filter(s => 
      s.citoyen === `${user.prenom} ${user.nom}`
    )
    
    return {
      ...user,
      nombreSignalements: userSignalements.length,
      fiabilite: userSignalements.length > 0 ? 
        Math.round((userSignalements.filter(s => s.status === 'traité').length / userSignalements.length) * 100) : 100,
      dernierSignalement: userSignalements.length > 0 ? 
        new Date(userSignalements[0].created_at).toLocaleDateString('fr-FR') : 'Aucun'
    }
  })

  const filteredUtilisateurs = utilisateursAvecStats.filter(utilisateur => {
    const matchesSearch = `${utilisateur.prenom} ${utilisateur.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         utilisateur.matricule.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || utilisateur.role === filterRole
    const matchesStatut = filterStatut === "all" || utilisateur.statut === filterStatut
    
    return matchesSearch && matchesRole && matchesStatut
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Utilisateurs</h1>
          <p className="text-sm text-muted-foreground">
            Gestion des agents et opérateurs
          </p>
        </div>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Recherche</label>
              <div className="relative">
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8"
                />
                <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Rôle</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full h-8 px-3 py-1 text-sm border border-input rounded-md bg-background"
              >
                <option value="all">Tous les rôles</option>
                <option value="admin">Admin</option>
                <option value="superviseur">Superviseur</option>
                <option value="agent">Agent</option>
                <option value="operateur">Opérateur</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Statut</label>
              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
                className="w-full h-8 px-3 py-1 text-sm border border-input rounded-md bg-background"
              >
                <option value="all">Tous les statuts</option>
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
                <option value="suspendu">Suspendu</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{utilisateurs.length}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {utilisateurs.filter(u => u.role === 'agent').length}
              </div>
              <div className="text-xs text-muted-foreground">Agents</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-safe-zone">
                {utilisateurs.filter(u => u.statut === 'actif').length}
              </div>
              <div className="text-xs text-muted-foreground">Actifs</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {utilisateurs.filter(u => u.statut === 'inactif').length}
              </div>
              <div className="text-xs text-muted-foreground">Inactifs</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des utilisateurs */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Chargement des utilisateurs...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUtilisateurs.map((utilisateur) => (
            <Card key={utilisateur.id} className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={utilisateur.avatar} />
                      <AvatarFallback>{utilisateur.prenom[0]}{utilisateur.nom[0]}</AvatarFallback>
                </Avatar>
                    <div>
                      <h3 className="font-medium text-sm">{utilisateur.prenom} {utilisateur.nom}</h3>
                      <p className="text-xs text-muted-foreground">{utilisateur.grade}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-2xs">
                    {utilisateur.role}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Matricule:</span>
                    <span className="font-medium">{utilisateur.matricule}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Unité:</span>
                    <span className="font-medium">{utilisateur.unite}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Secteur:</span>
                    <span className="font-medium">{utilisateur.secteur}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Statut:</span>
                    <Badge variant={
                      utilisateur.statut === 'actif' ? 'success' :
                      utilisateur.statut === 'inactif' ? 'secondary' : 'destructive'
                    } className="text-2xs">
                      {utilisateur.statut}
                </Badge>
              </div>
                </div>
                
                <div className="flex gap-1 mt-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex-1">
                        <History className="h-3 w-3 mr-1" />
                        Historique
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <HistoriqueDialog utilisateur={utilisateur} />
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex-1">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Message
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <MessageDialog utilisateur={utilisateur} />
                    </DialogContent>
                  </Dialog>
              
              <Dialog>
                <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex-1">
                        <Users className="h-3 w-3 mr-1" />
                        Détails
                  </Button>
                </DialogTrigger>
                    <DialogContent>
                  <UtilisateurDetailPopup utilisateur={utilisateur} />
                </DialogContent>
              </Dialog>
                </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}
    </div>
  )
}
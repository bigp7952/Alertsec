import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
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
import { 
  AlertTriangle, 
  Users, 
  MessageSquare, 
  FileText, 
  History,
  Menu, 
  X, 
  LogOut,
  User,
  Clock,
  RefreshCw,
  Settings
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo } from '@/components/ui/logo'
// import { useApiAuth } from "@/contexts/ApiAuthContext"
import { NotificationIcon } from "@/components/notifications/NotificationCenter"

interface PoliceLayoutProps {
  children: React.ReactNode
}

export function PoliceLayout({ children }: PoliceLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  // const { user, logout } = useApiAuth()
  
  // Mock user pour les tests
  const user = {
    id: 1,
    matricule: 'POL001',
    nom: 'DIOP',
    prenom: 'Amadou',
    grade: 'Commissaire',
    role: 'admin'
  }
  
  const logout = () => {
    console.log('Logout mocké')
  }

  // Fonction simple pour vérifier les permissions basée sur le rôle
  const hasPermission = (permission: string) => {
    if (!user) return false;
    // Pour simplifier, on autorise tous les accès pour l'admin
    if (user.role === 'admin') return true;
    // Logique basique pour les autres rôles
    return true; // Temporairement, on autorise tout
  };

  const navigationItems = [
    { 
      name: "Dashboard", 
      href: "/", 
      icon: User, 
      badge: null,
      permission: null // Dashboard accessible à tous les utilisateurs connectés
    },
    { 
      name: "Signalements", 
      href: "/signalements", 
      icon: AlertTriangle, 
      badge: "23",
      permission: "view_signalements"
    },
    { 
      name: "Cas Graves", 
      href: "/cas-graves", 
      icon: AlertTriangle, 
      badge: "3",
      permission: "view_signalements"
    },
    { 
      name: "Utilisateurs", 
      href: "/utilisateurs", 
      icon: Users, 
      badge: "847",
      permission: "view_users"
    },
    { 
      name: "Feedbacks", 
      href: "/feedbacks", 
      icon: MessageSquare, 
      badge: "12",
      permission: "view_feedbacks"
    },
    { 
      name: "Historique", 
      href: "/historique", 
      icon: History, 
      badge: null,
      permission: "view_history"
    }
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
    setShowLogoutDialog(false)
  }

  const getTimeUntilExpiry = () => {
    if (!user || !localStorage.getItem('police_session_expiry')) return null
    
    const expiry = parseInt(localStorage.getItem('police_session_expiry') || '0')
    const now = Date.now()
    const timeLeft = Math.max(0, expiry - now)
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m`
  }

  // Filtrer les éléments de navigation selon les permissions
  const filteredNavItems = navigationItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  )

  if (!user) {
    return <div>Chargement...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-12 border-b bg-white/95 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
          
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <span className="font-bold text-lg text-foreground">ALERTSEC</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Indicateur de session */}
          <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{getTimeUntilExpiry()}</span>
          </div>

          {/* Centre de notifications */}
          <NotificationIcon />

          {/* Profil utilisateur */}
          <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="xs" className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-2xs text-white font-medium">
                    {user.prenom[0]}{user.nom[0]}
                  </span>
                </div>
                <span className="hidden sm:block text-xs font-medium">
                  {user.grade} {user.nom}
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Informations du compte
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="bg-muted p-3 rounded">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-medium">Matricule:</span>
                      <div className="text-muted-foreground">{user.matricule}</div>
                    </div>
                    <div>
                      <span className="font-medium">Grade:</span>
                      <div className="text-muted-foreground">{user.grade}</div>
                    </div>
                    <div>
                      <span className="font-medium">Unité:</span>
                      <div className="text-muted-foreground">{user.unite}</div>
                    </div>
                    <div>
                      <span className="font-medium">Secteur:</span>
                      <div className="text-muted-foreground">{user.secteur}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge variant={user.statut === 'actif' ? 'success' : 'destructive'}>
                    {user.statut}
                  </Badge>
                  <Badge variant="outline">
                    {user.role}
                  </Badge>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Session expire dans: {getTimeUntilExpiry()}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="flex-1"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Prolonger
                  </Button>
                  <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="flex-1">
                        <LogOut className="h-3 w-3 mr-1" />
                        Déconnexion
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-sm">Confirmer la déconnexion</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs">
                          Êtes-vous sûr de vouloir vous déconnecter ? 
                          Toutes les données non sauvegardées seront perdues.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="text-xs">Annuler</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleLogout}
                          className="text-xs bg-destructive hover:bg-destructive/90"
                        >
                          Se déconnecter
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full pt-4">
            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-1">
              {filteredNavItems.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-3 w-3" />
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <Badge
                        variant={isActive ? "secondary" : "outline"}
                        className="text-2xs px-1 py-0"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Statistiques rapides */}
            <div className="p-3 border-t">
              <Card className="p-3">
                <h4 className="text-xs font-medium text-foreground mb-2">Statut temps réel</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-2xs">
                    <span className="text-muted-foreground">Signalements actifs</span>
                    <Badge variant="destructive" className="text-2xs">3</Badge>
                  </div>
                  <div className="flex items-center justify-between text-2xs">
                    <span className="text-muted-foreground">Agents disponibles</span>
                    <Badge variant="success" className="text-2xs">12</Badge>
                  </div>
                  <div className="flex items-center justify-between text-2xs">
                    <span className="text-muted-foreground">Interventions</span>
                    <Badge variant="warning" className="text-2xs">8</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </aside>

        {/* Overlay pour mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Contenu principal */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="animate-fade-in">
            {children}
          </div>
          </main>
        </div>
      </div>
  )
}
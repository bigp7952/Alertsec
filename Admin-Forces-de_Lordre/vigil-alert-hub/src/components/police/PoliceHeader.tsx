import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ConnectionStatus } from "@/components/ui/connection-status"
import { NotificationIcon } from "@/components/notifications/NotificationCenter"
import { LogOut, User } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useSupabase } from "@/hooks/useSupabase"

interface PoliceHeaderProps {
  onLogout?: () => void
}

export function PoliceHeader({ onLogout }: PoliceHeaderProps) {
  const { user, logout } = useAuth()
  const { isConnected } = useSupabase()

  const handleLogout = () => {
    logout()
    if (onLogout) onLogout()
  }

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold text-foreground">Vigil Alert Hub</h1>
        <ConnectionStatus isConnected={isConnected} />
      </div>
      
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <NotificationIcon />

        {/* Profil utilisateur */}
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user ? user.prenom[0] + user.nom[0] : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-foreground">
              {user ? `${user.grade} ${user.prenom} ${user.nom}` : "Utilisateur"}
            </p>
            <p className="text-xs text-muted-foreground">
              {user ? user.unite : "Forces de l'ordre"}
            </p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleLogout}
          className="ml-4"
        >
          <LogOut className="h-3 w-3 mr-1" />
          Déconnexion
        </Button>
      </div>
    </header>
  )
}
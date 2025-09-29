import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConnectionStatusProps {
  isConnected: boolean
  className?: string
}

export function ConnectionStatus({ isConnected, className }: ConnectionStatusProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge 
        variant={isConnected ? "success" : "destructive"} 
        className="animate-pulse"
      >
        {isConnected ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
        {isConnected ? "Connecté" : "Déconnecté"}
      </Badge>
      
      <Badge variant="outline" className="animate-pulse">
        <Activity className="h-3 w-3 mr-1" />
        Temps réel
      </Badge>
    </div>
  )
} 
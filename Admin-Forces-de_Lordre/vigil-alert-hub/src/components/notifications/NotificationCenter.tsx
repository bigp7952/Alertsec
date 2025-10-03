import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X, 
  Filter,
  Clock,
  Eye,
  Trash2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/hooks/useSupabase"
import { notificationsService } from "@/lib/supabase"
import type { Notification } from "@/lib/supabase"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'error':
      return AlertTriangle
    case 'success':
      return CheckCircle
    case 'warning':
      return AlertTriangle
    case 'info':
      return Info
    default:
      return Bell
  }
}

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'error':
      return 'text-destructive'
    case 'success':
      return 'text-safe-zone'
    case 'warning':
      return 'text-warning'
    case 'info':
      return 'text-primary'
    default:
      return 'text-muted-foreground'
  }
}

const getNotificationBadge = (type: Notification['type']) => {
  switch (type) {
    case 'error':
      return 'destructive'
    case 'success':
      return 'success'
    case 'warning':
      return 'warning'
    case 'info':
      return 'default'
    default:
      return 'secondary'
  }
}

export function NotificationIcon() {
  const { notifications } = useSupabase()
  const [isOpen, setIsOpen] = useState(false)
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([])
  const [filterType, setFilterType] = useState<Notification['type'] | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'read' | 'unread'>('all')
  const [searchTerm, setSearchTerm] = useState("")
  const [isMarkingAll, setIsMarkingAll] = useState(false)
  const [isDeletingAll, setIsDeletingAll] = useState(false)
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set())
  const [isExpanded, setIsExpanded] = useState<Set<string>>(new Set())
  
  const { toast } = useToast()

  // Synchroniser les notifications locales avec Supabase
  useEffect(() => {
    setLocalNotifications(notifications)
  }, [notifications])

  const unreadCount = localNotifications.filter(n => !n.lu).length
  const criticalCount = localNotifications.filter(n => n.type === 'error' && !n.lu).length

  const filteredNotifications = localNotifications.filter(notification => {
    const matchesType = filterType === 'all' || notification.type === filterType
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'read' && notification.lu) ||
      (filterStatus === 'unread' && !notification.lu)
    const matchesSearch = notification.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    const notDismissed = !dismissedNotifications.has(notification.id)
    
    return matchesType && matchesStatus && matchesSearch && notDismissed
  })

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsService.markAsRead(notificationId)
      setLocalNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, lu: true } : n)
      )
      toast({
        title: "Notification marquée comme lue",
        description: "La notification a été mise à jour",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de marquer la notification comme lue",
        variant: "destructive"
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true)
    try {
      const unreadNotifications = localNotifications.filter(n => !n.lu)
      await Promise.all(unreadNotifications.map(n => notificationsService.markAsRead(n.id)))
      
      setLocalNotifications(prev => 
        prev.map(n => ({ ...n, lu: true }))
      )
      
      toast({
        title: "Toutes les notifications marquées comme lues",
        description: `${unreadNotifications.length} notification(s) mise(s) à jour`,
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de marquer toutes les notifications comme lues",
        variant: "destructive"
      })
    } finally {
      setIsMarkingAll(false)
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      setLocalNotifications(prev => prev.filter(n => n.id !== notificationId))
      await notificationsService.delete(notificationId)
      
      toast({
        title: "Notification supprimée",
        description: "La notification a été supprimée",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la notification",
        variant: "destructive"
      })
    }
  }

  const handleDeleteAll = async () => {
    setIsDeletingAll(true)
    try {
      const count = localNotifications.length
      setLocalNotifications([])
      await notificationsService.deleteAll()
      
      toast({
        title: "Toutes les notifications supprimées",
        description: `${count} notification(s) supprimée(s)`,
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer toutes les notifications",
        variant: "destructive"
      })
    } finally {
      setIsDeletingAll(false)
    }
  }

  const formatTimeAgo = (createdAt: string) => {
    const now = new Date()
    const created = new Date(createdAt)
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return "À l'instant"
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`
    return `Il y a ${Math.floor(diffInMinutes / 1440)}j`
  }

  const handleDismissNotification = (notificationId: string) => {
    setDismissedNotifications(prev => new Set([...prev, notificationId]))
    toast({
      title: "Notification fermée",
      description: "La notification a été fermée",
    })
  }

  const handleToggleExpand = (notificationId: string) => {
    setIsExpanded(prev => {
      const newSet = new Set(prev)
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId)
      } else {
        newSet.add(notificationId)
      }
      return newSet
    })
  }

  return (
    <>
      {/* Icône de notification dans le header */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="relative p-2"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Popup modal des notifications */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Centre de Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive">
                  {unreadCount}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Statistiques */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs font-medium">Total</p>
                      <p className="text-lg font-bold">{localNotifications.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <div>
                      <p className="text-xs font-medium">Non lues</p>
                      <p className="text-lg font-bold text-destructive">{unreadCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <div>
                      <p className="text-xs font-medium">Critiques</p>
                      <p className="text-lg font-bold text-warning">{criticalCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAll}
                >
                  {isMarkingAll ? "..." : "Tout marquer comme lu"}
                </Button>
              )}
              
              {dismissedNotifications.size > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setDismissedNotifications(new Set())}
                >
                  Restaurer ({dismissedNotifications.size})
                </Button>
              )}
              
              {localNotifications.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      disabled={isDeletingAll}
                    >
                      {isDeletingAll ? "..." : "Tout supprimer"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer toutes les notifications</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir supprimer toutes les notifications ? 
                        Cette action est irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAll}>
                        Supprimer tout
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            {/* Filtres */}
            <Card>
              <CardContent className="p-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Recherche</label>
                    <div className="relative">
                      <Input
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-8"
                      />
                      <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Type</label>
                    <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les types</SelectItem>
                        <SelectItem value="error">Erreur</SelectItem>
                        <SelectItem value="warning">Avertissement</SelectItem>
                        <SelectItem value="success">Succès</SelectItem>
                        <SelectItem value="info">Information</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Statut</label>
                    <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="unread">Non lues</SelectItem>
                        <SelectItem value="read">Lues</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Liste des notifications */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Bell className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Aucune notification trouvée
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredNotifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type)

                  return (
                    <Card 
                      key={notification.id} 
                      className={cn(
                        "hover:shadow-md transition-all duration-200 cursor-pointer relative group",
                        !notification.lu && "border-l-4 border-l-primary bg-primary/5"
                      )}
                      onClick={() => !notification.lu && handleMarkAsRead(notification.id)}
                    >
                      {/* Bouton de fermeture */}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDismissNotification(notification.id)
                        }}
                        className="absolute top-1 right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <div className={cn(
                            "p-1.5 rounded-full",
                            notification.type === 'error' && "bg-destructive/10",
                            notification.type === 'warning' && "bg-warning/10",
                            notification.type === 'success' && "bg-safe-zone/10",
                            notification.type === 'info' && "bg-primary/10"
                          )}>
                            <Icon className={cn("h-3 w-3", getNotificationColor(notification.type))} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-sm font-medium text-foreground line-clamp-1">
                                  {notification.titre}
                                </h3>
                                <p className={cn(
                                  "text-xs text-muted-foreground mt-1 leading-relaxed transition-all duration-200",
                                  isExpanded.has(notification.id) ? "" : "line-clamp-2"
                                )}>
                                  {notification.message}
                                </p>
                                {notification.message.length > 100 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleToggleExpand(notification.id)
                                    }}
                                    className="h-4 px-1 text-xs mt-1"
                                  >
                                    {isExpanded.has(notification.id) ? "Réduire" : "Voir plus"}
                                  </Button>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-1 ml-2">
                                <Badge variant={getNotificationBadge(notification.type)} className="text-2xs">
                                  {notification.type}
                                </Badge>
                                {!notification.lu && (
                                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1 text-2xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatTimeAgo(notification.created_at)}
                              </div>
                              
                              <div className="flex items-center gap-1">
                                {!notification.lu && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleMarkAsRead(notification.id)
                                    }}
                                    className="h-5 px-1"
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                )}
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => e.stopPropagation()}
                                      className="h-5 px-1 text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Supprimer la notification</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Êtes-vous sûr de vouloir supprimer cette notification ?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleDeleteNotification(notification.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Supprimer
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 
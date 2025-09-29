import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Navigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthService, type User, type LoginCredentials } from '@/lib/auth-service'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  sessionExpiry: number | null
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => void
  verify2FA: (code: string) => Promise<boolean>
  refreshSession: () => void
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Service d'authentification Supabase utilisé

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    sessionExpiry: null
  })
  
  const { toast } = useToast()

  // Vérification de session au démarrage
  useEffect(() => {
    const checkSession = () => {
      const savedSession = localStorage.getItem('police_session')
      const sessionExpiry = localStorage.getItem('police_session_expiry')
      
      if (savedSession && sessionExpiry) {
        const expiryTime = parseInt(sessionExpiry)
        const now = Date.now()
        
        if (now < expiryTime) {
          const user = JSON.parse(savedSession)
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            sessionExpiry: expiryTime
          })
          return
        } else {
          // Session expirée
          localStorage.removeItem('police_session')
          localStorage.removeItem('police_session_expiry')
          toast({
            title: "Session expirée",
            description: "Veuillez vous reconnecter pour des raisons de sécurité",
            variant: "destructive"
          })
        }
      }
      
      setAuthState(prev => ({ ...prev, isLoading: false }))
    }

    checkSession()
  }, [toast])

  // Auto-logout avant expiration
  useEffect(() => {
    if (authState.sessionExpiry) {
      const timeUntilExpiry = authState.sessionExpiry - Date.now()
      
      if (timeUntilExpiry > 0) {
        // Avertissement 5 minutes avant expiration
        const warningTime = Math.max(0, timeUntilExpiry - 5 * 60 * 1000)
        
        const warningTimer = setTimeout(() => {
          toast({
            title: "Session bientôt expirée",
            description: "Votre session expirera dans 5 minutes",
            variant: "destructive"
          })
        }, warningTime)

        // Logout automatique à l'expiration
        const logoutTimer = setTimeout(() => {
          logout()
        }, timeUntilExpiry)

        return () => {
          clearTimeout(warningTimer)
          clearTimeout(logoutTimer)
        }
      }
    }
  }, [authState.sessionExpiry])

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      // Utiliser le service d'authentification Supabase
      const result = await AuthService.login(credentials)
      
      if (!result.success || !result.user) {
        toast({
          title: "Erreur de connexion",
          description: result.message,
          variant: "destructive"
        })
        return false
      }
      
      // Session de 8 heures pour la sécurité
      const sessionExpiry = Date.now() + (8 * 60 * 60 * 1000)
      
      // Sauvegarde sécurisée
      localStorage.setItem('police_session', JSON.stringify(result.user))
      localStorage.setItem('police_session_expiry', sessionExpiry.toString())
      
      setAuthState({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
        sessionExpiry
      })
      
      toast({
        title: "Connexion réussie",
        description: `Bienvenue ${result.user.grade} ${result.user.prenom} ${result.user.nom}`,
      })
      
      return true
      
    } catch (error) {
      console.error('Erreur de connexion:', error)
      toast({
        title: "Erreur de connexion",
        description: "Une erreur s'est produite lors de la connexion",
        variant: "destructive"
      })
      return false
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const verify2FA = async (code: string): Promise<boolean> => {
    try {
      const result = await AuthService.verify2FA(code)
      
      if (result.success) {
        toast({
          title: "Authentification réussie",
          description: result.message,
        })
        return true
      } else {
        toast({
          title: "Code incorrect",
          description: result.message,
          variant: "destructive"
        })
        return false
      }
    } catch (error) {
      console.error('Erreur 2FA:', error)
      toast({
        title: "Erreur de vérification",
        description: "Une erreur s'est produite lors de la vérification",
        variant: "destructive"
      })
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('police_session')
    localStorage.removeItem('police_session_expiry')
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      sessionExpiry: null
    })
    
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès",
    })
  }

  const refreshSession = () => {
    if (authState.user) {
      const newExpiry = Date.now() + (8 * 60 * 60 * 1000)
      localStorage.setItem('police_session_expiry', newExpiry.toString())
      
      setAuthState(prev => ({
        ...prev,
        sessionExpiry: newExpiry
      }))
      
      toast({
        title: "Session prolongée",
        description: "Votre session a été renouvelée pour 8 heures",
      })
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!authState.user) return false
    return AuthService.hasPermission(authState.user, permission)
  }

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      verify2FA,
      refreshSession,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Composant de protection des routes
export function ProtectedRoute({ 
  children, 
  requiredPermission 
}: { 
  children: ReactNode
  requiredPermission?: string 
}) {
  const { isAuthenticated, isLoading, hasPermission, user } = useAuth()
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Vérification des autorisations...</p>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold text-destructive mb-2">Accès refusé</h2>
          <p className="text-sm text-muted-foreground mb-4">
                         Votre rôle <span className="font-medium">({user?.role})</span> ne dispose pas des autorisations nécessaires pour accéder à cette section.
          </p>
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
              Permission requise: <span className="font-mono">{requiredPermission}</span>
            </div>
            <div className="flex gap-2 justify-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.href = '/'}
              >
                Retour à l'accueil
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.href = '/signalements'}
              >
                Voir les Signalements
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return <>{children}</>
} 
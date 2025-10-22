import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { ButtonProps } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  AlertTriangle,
  CheckCircle,
  Clock,
  KeyRound,
  Smartphone
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import OTPLogin from '@/components/auth/OTPLogin'
import { Logo } from '@/components/ui/logo'
import apiService, { type User as ApiUser } from '@/lib/api'

interface LoginStep {
  id: 'credentials' | '2fa' | 'otp' | 'success'
  title: string
  description: string
}

const LOGIN_STEPS: LoginStep[] = [
  {
    id: 'credentials',
    title: 'Authentification',
    description: 'Identifiants officiels requis'
  },
  {
    id: '2fa',
    title: 'Vérification',
    description: 'Code de sécurité à 6 chiffres'
  },
  {
    id: 'otp',
    title: 'Connexion OTP',
    description: 'Code SMS de vérification'
  },
  {
    id: 'success',
    title: 'Accès autorisé',
    description: 'Redirection en cours...'
  }
]

// Interface pour les comptes de démonstration
interface DemoAccount {
  matricule: string;
  nom: string;
  grade: string;
  unite: string;
  role: string;
}

export default function Login() {
  const { login, verify2FA, isLoading } = useAuth()
  const navigate = useNavigate()
  
  const [currentStep, setCurrentStep] = useState<'credentials' | '2fa' | 'otp' | 'success'>('credentials')
  const [loginMethod, setLoginMethod] = useState<'credentials' | 'otp'>('credentials')
  const credVariant: ButtonProps['variant'] = loginMethod === 'credentials' ? 'default' : 'outline'
  const otpVariant: ButtonProps['variant'] = loginMethod === 'otp' ? 'default' : 'outline'
  const [showPassword, setShowPassword] = useState(false)
  const [show2FAHelp, setShow2FAHelp] = useState(false)
  
  // Formulaire d'authentification
  const [credentials, setCredentials] = useState({
    matricule: '',
    motDePasse: '',
    codeService: ''
  })
  
  // Code 2FA
  const [code2FA, setCode2FA] = useState('')
  const [attempts2FA, setAttempts2FA] = useState(0)
  
  // Validation des champs
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Comptes de démonstration récupérés depuis la base
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([])
  const [loadingAccounts, setLoadingAccounts] = useState(true)

  // Charger les comptes de démonstration depuis la base de données
  useEffect(() => {
    const loadDemoAccounts = async () => {
      try {
        setLoadingAccounts(true)
        // Récupérer les utilisateurs directement via une requête publique
        const baseURL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
        const response = await fetch(`${baseURL}/users/demo-accounts`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            const accounts: DemoAccount[] = data.data.map((user: any) => ({
              matricule: user.matricule,
              nom: `${user.prenom} ${user.nom}`,
              grade: user.grade,
              unite: user.unite,
              role: user.role
            }))
            setDemoAccounts(accounts)
          } else {
            throw new Error('Erreur API')
          }
        } else {
          throw new Error('Erreur réseau')
        }
      } catch (error) {
        console.error('Erreur lors du chargement des comptes:', error)
        // Fallback avec les comptes connus
        setDemoAccounts([
          {
            matricule: 'ADM001',
            nom: 'Amadou Ndiaye',
            grade: 'Commissaire Divisionnaire',
            unite: 'Direction Générale',
            role: 'admin'
          },
          {
            matricule: 'SUP001',
            nom: 'Moussa Diop',
            grade: 'Lieutenant',
            unite: 'Brigade de Sécurité',
            role: 'superviseur'
          },
          {
            matricule: 'SUP002',
            nom: 'Fatou Sarr',
            grade: 'Capitaine',
            unite: 'Brigade de Sécurité',
            role: 'superviseur'
          },
          {
            matricule: 'SUP003',
            nom: 'Ibrahima Fall',
            grade: 'Lieutenant',
            unite: 'Brigade de Sécurité',
            role: 'superviseur'
          }
        ])
      } finally {
        setLoadingAccounts(false)
      }
    }

    loadDemoAccounts()
  }, [])

  const validateCredentials = () => {
    const newErrors: Record<string, string> = {}
    
    if (!credentials.matricule.trim()) {
      newErrors.matricule = 'Le matricule est requis'
    }
    
    if (!credentials.motDePasse.trim()) {
      newErrors.motDePasse = 'Le mot de passe est requis'
    }
    
    // Code service est optionnel maintenant
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateCredentials()) return
    
    // Réinitialiser les erreurs
    setErrors({})
    
    try {
      console.log('Tentative de connexion avec:', credentials.matricule)
      
      const success = await login(credentials)
      console.log('Résultat de connexion:', success)
      
      if (success) {
        setCurrentStep('2fa')
      } else {
        setErrors({ 
          general: 'Échec de la connexion. Vérifiez vos identifiants.' 
        })
      }
    } catch (error: any) {
      console.error('Erreur de connexion détaillée:', error)
      setErrors({ 
        general: error.message || 'Erreur de connexion. Vérifiez vos identifiants et que le serveur backend est accessible.' 
      })
    }
  }

  const handle2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!code2FA.trim()) {
      setErrors({ code2FA: 'Le code 2FA est requis' })
      return
    }
    
    try {
    const success = await verify2FA(code2FA)
    if (success) {
      setCurrentStep('success')
      setTimeout(() => {
          navigate('/')
        }, 1500)
    } else {
      setAttempts2FA(prev => prev + 1)
        setErrors({ code2FA: 'Code 2FA incorrect' })
      }
    } catch (error) {
      console.error('Erreur 2FA:', error)
    }
  }

  const handleOTPLoginSuccess = (user: any) => {
    setCurrentStep('success')
    setTimeout(() => {
      navigate('/')
    }, 1500)
  }

  const handleBackToCredentials = () => {
    setLoginMethod('credentials')
    setCurrentStep('credentials')
  }

  const fillDemoCredentials = (account: DemoAccount) => {
    setCredentials({
      matricule: account.matricule,
      motDePasse: 'demo', // Mot de passe par défaut pour les comptes de démo
      codeService: 'DEMO'
    })
  }

  const getStepIcon = (stepId: string) => {
    switch (stepId) {
      case 'credentials':
        return <User className="h-4 w-4" />
      case '2fa':
        return <KeyRound className="h-4 w-4" />
      case 'otp':
        return <Smartphone className="h-4 w-4" />
      case 'success':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  // Si on est en mode OTP, afficher le composant OTP
  if (loginMethod === 'otp') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <OTPLogin 
          onLoginSuccess={handleOTPLoginSuccess}
          onBack={handleBackToCredentials}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Logo size="xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            AlertSec - Vigil Alert Hub
          </h1>
          <p className="text-gray-600">
            Plateforme de gestion des signalements
          </p>
        </div>

        {/* Étapes de connexion */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {LOGIN_STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                  currentStep === step.id 
                    ? "bg-primary text-primary-foreground" 
                    : index < LOGIN_STEPS.findIndex(s => s.id === currentStep)
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-400"
                )}>
                  {getStepIcon(step.id)}
                  </div>
                  {index < LOGIN_STEPS.length - 1 && (
                    <div className={cn(
                    "flex-1 h-0.5 mx-2",
                    index < LOGIN_STEPS.findIndex(s => s.id === currentStep)
                      ? "bg-green-200"
                      : "bg-gray-200"
                    )} />
                  )}
                </div>
            ))}
          </div>
        </div>

        {/* Choix de méthode de connexion */}
        {currentStep === 'credentials' && (
          <div className="mb-6">
            <div className="flex gap-2">
              <Button
                variant={credVariant}
                onClick={() => setLoginMethod('credentials')}
                className="flex-1"
              >
                <User className="h-4 w-4 mr-2" />
                Identifiants
              </Button>
              <Button
                variant={otpVariant}
                onClick={() => setLoginMethod('otp')}
                className="flex-1"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Code SMS
              </Button>
            </div>
          </div>
        )}

        {/* Formulaire de connexion */}
        {currentStep === 'credentials' && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-center">
                Connexion sécurisée
              </h2>
              <p className="text-sm text-gray-600 text-center">
                Saisissez vos identifiants officiels
              </p>
          </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Matricule
                    </label>
                      <Input
                        type="text"
                        placeholder="POL001"
                        value={credentials.matricule}
                    onChange={(e) => setCredentials(prev => ({ ...prev, matricule: e.target.value }))}
                    className={cn(errors.matricule && "border-red-500")}
                  />
                    {errors.matricule && (
                    <p className="text-red-500 text-xs mt-1">{errors.matricule}</p>
                    )}
                  </div>

                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Input
                      type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={credentials.motDePasse}
                      onChange={(e) => setCredentials(prev => ({ ...prev, motDePasse: e.target.value }))}
                      className={cn(errors.motDePasse && "border-red-500")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.motDePasse && (
                    <p className="text-red-500 text-xs mt-1">{errors.motDePasse}</p>
                    )}
                  </div>

                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code service (optionnel)
                    </label>
                      <Input
                        type="text"
                    placeholder="DEMO"
                        value={credentials.codeService}
                    onChange={(e) => setCredentials(prev => ({ ...prev, codeService: e.target.value }))}
                    className={cn(errors.codeService && "border-red-500")}
                  />
                    {errors.codeService && (
                    <p className="text-red-500 text-xs mt-1">{errors.codeService}</p>
                    )}
                  </div>

                  {/* Affichage des erreurs générales */}
                  {errors.general && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <p className="text-sm text-red-700">{errors.general}</p>
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Connexion...
                      </>
                    ) : (
                      <>
                      <Lock className="h-4 w-4 mr-2" />
                      Se connecter
                      </>
                    )}
                  </Button>
                </form>

                {/* Comptes de démonstration */}
              <div className="mt-6">
                <div className="text-center mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Comptes de démonstration
                  </p>
                  <p className="text-xs text-gray-500">
                    Cliquez sur un compte pour remplir automatiquement les champs
                  </p>
                </div>
                  {loadingAccounts ? (
                    <div className="text-center py-2">
                      <Clock className="h-4 w-4 animate-spin mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Chargement des comptes...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {demoAccounts.map((account) => (
                      <Button
                          key={account.matricule}
                        variant="outline"
                        size="sm"
                          onClick={() => fillDemoCredentials(account)}
                        className="w-full h-auto p-3 text-left justify-start hover:bg-blue-50 hover:border-blue-200 transition-colors"
                        title={`Cliquer pour utiliser ${account.nom}`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-gray-900 truncate">
                              {account.matricule}
                            </div>
                            <div className="text-xs text-gray-600 truncate mt-0.5">
                              {account.nom}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {account.grade}
                            </div>
                            <div className="text-xs text-gray-400 truncate">
                              {account.unite}
                            </div>
                          </div>
                          <div className="ml-2 flex-shrink-0">
                            <Badge 
                              variant={account.role === 'admin' ? 'destructive' : 'secondary'} 
                              className="text-xs px-2 py-1"
                            >
                              {account.role}
                            </Badge>
                          </div>
                        </div>
                      </Button>
                      ))}
                      <div className="text-center mt-3 p-2 bg-gray-50 rounded-md">
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Mot de passe pour tous :</span> 
                          <span className="ml-1 font-mono bg-gray-200 px-2 py-1 rounded text-gray-800">demo</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
            </CardContent>
          </Card>
            )}

        {/* Étape 2FA */}
            {currentStep === '2fa' && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-center">
                Vérification 2FA
              </h2>
              <p className="text-sm text-gray-600 text-center">
                Saisissez le code de sécurité à 6 chiffres
              </p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handle2FA} className="space-y-4">
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code 2FA
                    </label>
                    <Input
                      type="text"
                      placeholder="123456"
                      value={code2FA}
                    onChange={(e) => setCode2FA(e.target.value)}
                    maxLength={6}
                      className="text-center text-lg tracking-widest"
                    />
                    {errors.code2FA && (
                    <p className="text-red-500 text-xs mt-1">{errors.code2FA}</p>
                    )}
                  </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                    {isLoading ? (
                      <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Vérification...
                      </>
                    ) : (
                    <>
                      <KeyRound className="h-4 w-4 mr-2" />
                      Vérifier
                    </>
                    )}
                  </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShow2FAHelp(!show2FAHelp)}
                    className="text-xs"
                  >
                    Aide 2FA
                  </Button>
                </div>

                {show2FAHelp && (
                  <div className="p-3 bg-blue-50 rounded-md">
                    <p className="text-xs text-blue-700">
                      <strong>Code de démonstration :</strong> 123456
                    </p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
            )}

        {/* Étape de succès */}
            {currentStep === 'success' && (
          <Card>
            <CardContent className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-green-600 mb-2">
                Connexion réussie !
              </h2>
              <p className="text-gray-600">
                Redirection vers l'accueil...
              </p>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  )
} 
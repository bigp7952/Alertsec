import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  Building2, 
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

// Comptes de démonstration
const DEMO_ACCOUNTS = [
  {
    matricule: 'POL001',
    nom: 'Commissaire DIOP',
    grade: 'Commissaire',
    unite: 'Central',
    role: 'admin'
  },
  {
    matricule: 'POL002',
    nom: 'Inspecteur FALL',
    grade: 'Inspecteur',
    unite: 'Brigade Mobile',
    role: 'superviseur'
  },
  {
    matricule: 'POL003',
    nom: 'Agent SARR',
    grade: 'Agent',
    unite: 'Patrouille',
    role: 'agent'
  },
  {
    matricule: 'OPE001',
    nom: 'Opérateur BA',
    grade: 'Opérateur',
    unite: 'Central Ops',
    role: 'operateur'
  }
]

export default function Login() {
  const { login, verify2FA, isLoading } = useAuth()
  const navigate = useNavigate()
  
  const [currentStep, setCurrentStep] = useState<'credentials' | '2fa' | 'otp' | 'success'>('credentials')
  const [loginMethod, setLoginMethod] = useState<'credentials' | 'otp'>('credentials')
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

  const validateCredentials = () => {
    const newErrors: Record<string, string> = {}
    
    if (!credentials.matricule.trim()) {
      newErrors.matricule = 'Le matricule est requis'
    }
    
    if (!credentials.motDePasse.trim()) {
      newErrors.motDePasse = 'Le mot de passe est requis'
    }
    
    if (!credentials.codeService.trim()) {
      newErrors.codeService = 'Le code service est requis'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateCredentials()) return
    
    try {
    const success = await login(credentials)
    if (success) {
      setCurrentStep('2fa')
      }
    } catch (error) {
      console.error('Erreur de connexion:', error)
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

  const fillDemoCredentials = (account: typeof DEMO_ACCOUNTS[0]) => {
    setCredentials({
      matricule: account.matricule,
      motDePasse: 'demo123',
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
      <div className="w-full max-w-md">
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
                variant={loginMethod === 'credentials' ? 'default' : 'outline'}
                onClick={() => setLoginMethod('credentials')}
                className="flex-1"
              >
                <User className="h-4 w-4 mr-2" />
                Identifiants
              </Button>
              <Button
                variant={loginMethod === 'otp' ? 'default' : 'outline'}
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
                    Code service
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
                <p className="text-xs text-gray-500 text-center mb-3">
                  Comptes de démonstration :
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {DEMO_ACCOUNTS.map((account) => (
                    <Button
                        key={account.matricule}
                      variant="outline"
                      size="sm"
                        onClick={() => fillDemoCredentials(account)}
                      className="text-xs"
                    >
                      {account.matricule}
                    </Button>
                    ))}
                  </div>
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
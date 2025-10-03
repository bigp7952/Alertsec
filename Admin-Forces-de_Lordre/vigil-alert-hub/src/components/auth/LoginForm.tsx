import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import { useApiAuth } from '@/contexts/ApiAuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/logo';

interface LoginStep {
  id: 'credentials' | 'success'
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
    id: 'success',
    title: 'Accès autorisé',
    description: 'Redirection en cours...'
  }
]

// Comptes de démonstration
const DEMO_ACCOUNTS = [
  {
    email: 'admin@alertsec.com',
    password: 'password',
    nom: 'Admin Ndiaye',
    grade: 'Commissaire Divisionnaire',
    role: 'admin'
  },
  {
    email: 'superviseur1@alertsec.com',
    password: 'password',
    nom: 'Superviseur Ba',
    grade: 'Commissaire',
    role: 'superviseur'
  },
  {
    email: 'agent1@alertsec.com',
    password: 'password',
    nom: 'Agent Diop',
    grade: 'Inspecteur',
    role: 'agent'
  }
]

export default function LoginForm() {
  const { login, loading, error } = useApiAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState<'credentials' | 'success'>('credentials');
  const [showPassword, setShowPassword] = useState(false);
  
  // Formulaire d'authentification
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  
  // Validation des champs
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateCredentials = () => {
    const newErrors: Record<string, string> = {};
    
    if (!credentials.email.trim()) {
      newErrors.email = 'L\'email est requis';
    }
    
    if (!credentials.password.trim()) {
      newErrors.password = 'Le mot de passe est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCredentials()) return;
    
    try {
      await login(credentials.email, credentials.password);
      setCurrentStep('success');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('Erreur de connexion:', error);
    }
  };

  const fillDemoCredentials = (account: typeof DEMO_ACCOUNTS[0]) => {
    setCredentials({
      email: account.email,
      password: account.password
    });
  };

  const getStepIcon = (stepId: string) => {
    switch (stepId) {
      case 'credentials':
        return <User className="h-4 w-4" />;
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="admin@alertsec.com"
                    value={credentials.email}
                    onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                    className={cn(errors.email && "border-red-500")}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
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
                      value={credentials.password}
                      onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                      className={cn(errors.password && "border-red-500")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>

                {error && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? (
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
                <div className="grid grid-cols-1 gap-2">
                  {DEMO_ACCOUNTS.map((account) => (
                    <Button
                      key={account.email}
                      variant="outline"
                      size="sm"
                      onClick={() => fillDemoCredentials(account)}
                      className="text-xs justify-start"
                    >
                      <div className="flex items-center space-x-2">
                        <User className="h-3 w-3" />
                        <span>{account.nom}</span>
                        <Badge variant="secondary" className="text-xs">
                          {account.role}
                        </Badge>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
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
  );
}

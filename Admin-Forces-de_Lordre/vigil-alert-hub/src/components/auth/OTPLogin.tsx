import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Smartphone, ArrowLeft } from "lucide-react"
import { Logo } from '@/components/ui/logo'
import { useToast } from "@/hooks/use-toast"
import { OTPService } from "@/lib/otp-service"

interface OTPLoginProps {
  onLoginSuccess: (user: any) => void
  onBack: () => void
}

export default function OTPLogin({ onLoginSuccess, onBack }: OTPLoginProps) {
  const { toast } = useToast()
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [devCode, setDevCode] = useState("")

  // Gérer l'envoi du code OTP
  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir votre numéro de téléphone",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      // Vérifier si le numéro existe dans la base
      const phoneExists = await OTPService.checkPhoneExists(phoneNumber)
      
      if (!phoneExists) {
        toast({
          title: "Erreur",
          description: "Ce numéro n'est pas enregistré dans le système",
          variant: "destructive"
        })
        return
      }

      // Envoyer le code OTP
      const response = await OTPService.sendOTP(phoneNumber)
      
      if (response.success) {
        setStep("otp")
        setCountdown(60) // 60 secondes de compte à rebours
        
        // Afficher le code en mode développement
        if (response.code) {
          setDevCode(response.code)
        }

        toast({
          title: "Code envoyé",
          description: response.message
        })

        // Démarrer le compte à rebours
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        toast({
          title: "Erreur",
          description: response.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'envoi du code OTP",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Gérer la vérification du code OTP
  const handleVerifyOTP = async () => {
    if (!otpCode.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir le code OTP",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await OTPService.verifyOTP(phoneNumber, otpCode)
      
      if (response.success) {
        // Récupérer les informations utilisateur
        const user = await OTPService.getUserByPhone(phoneNumber)
        
        if (user) {
          toast({
            title: "Connexion réussie",
            description: `Bienvenue ${user.prenom} ${user.nom}`
          })
          
          onLoginSuccess(user)
        } else {
          toast({
            title: "Erreur",
            description: "Impossible de récupérer les informations utilisateur",
            variant: "destructive"
          })
        }
      } else {
        toast({
          title: "Erreur",
          description: response.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la vérification du code OTP",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Renvoyer le code OTP
  const handleResendOTP = () => {
    if (countdown > 0) return
    handleSendOTP()
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Logo size="lg" />
        </div>
        <CardTitle className="text-xl">
          {step === "phone" ? "Connexion sécurisée" : "Vérification OTP"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {step === "phone" 
            ? "Saisissez votre numéro de téléphone pour recevoir un code de vérification"
            : "Saisissez le code reçu par SMS"
          }
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {step === "phone" ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone</Label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+221 77 123 45 67"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button 
              onClick={handleSendOTP}
              disabled={isLoading || !phoneNumber.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Smartphone className="h-4 w-4 mr-2" />
                  Envoyer le code OTP
                </>
              )}
            </Button>

            <Button 
              variant="ghost" 
              onClick={onBack}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="otp">Code OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            </div>

            {/* Afficher le code en mode développement */}
            {import.meta.env.DEV && devCode && (
              <Alert>
                <AlertDescription>
                  <strong>Mode développement :</strong> Code OTP = {devCode}
                </AlertDescription>
              </Alert>
            )}

            <div className="text-center text-sm text-muted-foreground">
              {countdown > 0 ? (
                <p>Réessayer dans {countdown} secondes</p>
              ) : (
                <Button 
                  variant="link" 
                  onClick={handleResendOTP}
                  className="p-0 h-auto"
                >
                  Renvoyer le code
                </Button>
              )}
            </div>

            <Button 
              onClick={handleVerifyOTP}
              disabled={isLoading || !otpCode.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Vérification...
                </>
              ) : (
                <>
                  <Smartphone className="h-4 w-4 mr-2" />
                  Vérifier le code
                </>
              )}
            </Button>

            <Button 
              variant="ghost" 
              onClick={() => setStep("phone")}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Changer de numéro
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
} 
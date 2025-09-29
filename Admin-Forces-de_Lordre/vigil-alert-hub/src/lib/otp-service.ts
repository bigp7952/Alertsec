import { supabase } from './supabase'

export interface OTPResponse {
  success: boolean
  message: string
  code?: string
}

export class OTPService {
  // Envoyer un code OTP par SMS
  static async sendOTP(phoneNumber: string): Promise<OTPResponse> {
    try {
      // Appeler la fonction Supabase pour générer l'OTP
      const { data, error } = await supabase.rpc('generate_otp', {
        phone_number: phoneNumber
      })

      if (error) {
        console.error('Erreur lors de la génération OTP:', error)
        return {
          success: false,
          message: 'Erreur lors de l\'envoi du code OTP'
        }
      }

      // En mode développement, retourner le code pour les tests
      if (import.meta.env.DEV) {
        return {
          success: true,
          message: `Code OTP envoyé au ${phoneNumber}`,
          code: data // Le code généré par la fonction SQL
        }
      }

      return {
        success: true,
        message: `Code OTP envoyé au ${phoneNumber}`
      }
    } catch (error) {
      console.error('Erreur OTP:', error)
      return {
        success: false,
        message: 'Erreur lors de l\'envoi du code OTP'
      }
    }
  }

  // Vérifier un code OTP
  static async verifyOTP(phoneNumber: string, code: string): Promise<OTPResponse> {
    try {
      const { data, error } = await supabase.rpc('verify_otp', {
        phone_number: phoneNumber,
        code_to_verify: code
      })

      if (error) {
        console.error('Erreur lors de la vérification OTP:', error)
        return {
          success: false,
          message: 'Erreur lors de la vérification du code OTP'
        }
      }

      if (data) {
        return {
          success: true,
          message: 'Code OTP vérifié avec succès'
        }
      } else {
        return {
          success: false,
          message: 'Code OTP invalide ou expiré'
        }
      }
    } catch (error) {
      console.error('Erreur vérification OTP:', error)
      return {
        success: false,
        message: 'Erreur lors de la vérification du code OTP'
      }
    }
  }

  // Vérifier si un numéro de téléphone existe dans la base
  static async checkPhoneExists(phoneNumber: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('matricule', phoneNumber) // Utiliser le matricule comme numéro de téléphone
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur lors de la vérification du téléphone:', error)
        return false
      }

      return !!data
    } catch (error) {
      console.error('Erreur vérification téléphone:', error)
      return false
    }
  }

  // Obtenir les informations utilisateur par téléphone
  static async getUserByPhone(phoneNumber: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('matricule', phoneNumber)
        .single()

      if (error) {
        console.error('Erreur lors de la récupération utilisateur:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error)
      return null
    }
  }
} 
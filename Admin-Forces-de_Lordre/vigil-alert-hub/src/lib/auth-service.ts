import { MOCK_USERS, delay, type User } from './mock-data'

export interface LoginCredentials {
  matricule: string
  motDePasse: string
  codeService?: string
}

export { type User } from './mock-data'

export class AuthService {
  // Authentification avec matricule et mot de passe (version mockée)
  static async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; message: string }> {
    try {
      // Simuler un délai d'API
      await delay(800)
      
      // Chercher l'utilisateur dans les données mockées
      const user = MOCK_USERS.find(u => u.matricule === credentials.matricule)

      if (!user) {
        return {
          success: false,
          message: 'Matricule non reconnu'
        }
      }

      // Vérifier le mot de passe
      if (user.mot_de_passe !== credentials.motDePasse) {
        return {
          success: false,
          message: 'Mot de passe incorrect'
        }
      }

      // Vérifier le code de service si fourni
      if (credentials.codeService && user.code_service !== credentials.codeService) {
        return {
          success: false,
          message: 'Code de service invalide'
        }
      }

      // Vérifier le statut
      if (user.statut !== 'actif') {
        return {
          success: false,
          message: 'Compte suspendu'
        }
      }

      // Mettre à jour la dernière connexion (simulation)
      user.derniere_connexion = new Date().toISOString()
      user.updated_at = new Date().toISOString()

      return {
        success: true,
        user: user,
        message: 'Connexion réussie'
      }
    } catch (error) {
      console.error('Erreur de connexion:', error)
      return {
        success: false,
        message: 'Erreur lors de la connexion'
      }
    }
  }

  // Vérification 2FA (version mockée)
  static async verify2FA(code: string): Promise<{ success: boolean; message: string }> {
    try {
      // Simuler un délai d'API
      await delay(600)
      
      // Code de test: 123456
      if (code === '123456') {
        return {
          success: true,
          message: 'Code de vérification validé'
        }
      } else {
        return {
          success: false,
          message: 'Code de vérification invalide'
        }
      }
    } catch (error) {
      console.error('Erreur 2FA:', error)
      return {
        success: false,
        message: 'Erreur lors de la vérification'
      }
    }
  }

  // Obtenir un utilisateur par matricule (version mockée)
  static async getUserByMatricule(matricule: string): Promise<User | null> {
    try {
      // Simuler un délai d'API
      await delay(300)
      
      const user = MOCK_USERS.find(u => u.matricule === matricule)
      return user || null
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error)
      return null
    }
  }

  // Vérifier les permissions d'un utilisateur
  static hasPermission(user: User, permission: string): boolean {
    const rolePermissions = {
      admin: ['view_all', 'edit_all', 'assign_agents', 'manage_users', 'view_reports', 'export_data', 'view_signalements', 'update_status', 'view_map', 'view_users', 'view_feedbacks', 'view_history'],
      superviseur: ['view_all', 'assign_agents', 'view_reports', 'edit_signalements', 'view_signalements', 'update_status', 'view_map', 'view_users', 'view_feedbacks', 'view_history'],
      agent: ['view_signalements', 'update_status', 'view_map', 'view_history', 'view_feedbacks', 'view_users'],
      operateur: ['view_signalements', 'receive_calls', 'dispatch_agents', 'view_map', 'view_history', 'view_feedbacks', 'view_users']
    }

    const userPermissions = rolePermissions[user.role] || []
    return userPermissions.includes(permission)
  }
} 
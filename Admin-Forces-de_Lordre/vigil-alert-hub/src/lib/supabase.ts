// Service mockés pour remplacer Supabase
// Import des services mockés et des types
export {
  signalementsService,
  agentsService,
  notificationsService,
  usersService,
  statsService,
  type Signalement,
  type Agent,
  type Notification,
  type User
} from './mock-services'

// Mock du client Supabase pour compatibilité
export const supabase = {
  // Objet mock pour éviter les erreurs de référence
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    delete: () => ({ error: null })
  }),
  channel: () => ({
    on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
    subscribe: () => ({ unsubscribe: () => {} })
  })
}

export default supabase 
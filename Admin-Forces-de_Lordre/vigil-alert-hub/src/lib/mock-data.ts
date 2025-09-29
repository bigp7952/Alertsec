// Données mockées pour remplacer Supabase
export interface Signalement {
  id: string
  citoyen: string
  heure: string
  description: string
  niveau: 'danger-critical' | 'danger-medium' | 'safe-zone'
  status: 'non traité' | 'en cours' | 'traité'
  localisation: {
    lat: number
    lng: number
    nom: string
  }
  photo?: string | null
  created_at: string
  agent_assigne?: string
  updated_at: string
}

export interface Agent {
  id: number
  nom: string
  position: [number, number]
  secteur: string
  status: 'disponible' | 'en_mission'
  derniere_activite: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  titre: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  lu: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  matricule: string
  nom: string
  prenom: string
  grade: string
  unite: string
  secteur: string
  role: 'admin' | 'superviseur' | 'agent' | 'operateur'
  mot_de_passe: string
  code_service: string
  avatar?: string
  derniere_connexion?: string
  statut: 'actif' | 'inactif' | 'suspendu'
  created_at: string
  updated_at: string
}

// Utilisateurs par défaut
export const MOCK_USERS: User[] = [
  {
    id: '1',
    matricule: 'POL001',
    nom: 'DIOP',
    prenom: 'Amadou',
    grade: 'Commissaire',
    unite: 'Central',
    secteur: 'Centre-Ville',
    role: 'admin',
    mot_de_passe: 'demo123',
    code_service: 'DEMO',
    avatar: '/avatars/commissaire.jpg',
    derniere_connexion: new Date().toISOString(),
    statut: 'actif',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    matricule: 'POL002',
    nom: 'FALL',
    prenom: 'Fatou',
    grade: 'Inspecteur',
    unite: 'Brigade Mobile',
    secteur: 'Nord',
    role: 'superviseur',
    mot_de_passe: 'demo123',
    code_service: 'DEMO',
    avatar: '/avatars/inspecteur.jpg',
    derniere_connexion: new Date().toISOString(),
    statut: 'actif',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    matricule: 'POL003',
    nom: 'SARR',
    prenom: 'Moussa',
    grade: 'Agent',
    unite: 'Patrouille',
    secteur: 'Sud',
    role: 'agent',
    mot_de_passe: 'demo123',
    code_service: 'DEMO',
    avatar: '/avatars/agent.jpg',
    derniere_connexion: new Date().toISOString(),
    statut: 'actif',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    matricule: 'OPE001',
    nom: 'BA',
    prenom: 'Aissatou',
    grade: 'Opérateur',
    unite: 'Central Ops',
    secteur: 'Centre',
    role: 'operateur',
    mot_de_passe: 'demo123',
    code_service: 'DEMO',
    avatar: '/avatars/operateur.jpg',
    derniere_connexion: new Date().toISOString(),
    statut: 'actif',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  }
]

// Signalements mockés
export const MOCK_SIGNALEMENTS: Signalement[] = [
  {
    id: '1',
    citoyen: 'Abdou Khadre NDIAYE',
    heure: '14:30',
    description: 'Vol à main armée en cours au supermarché Auchan. Plusieurs individus armés à l\'intérieur.',
    niveau: 'danger-critical',
    status: 'en cours',
    localisation: {
      lat: 14.6937,
      lng: -17.4441,
      nom: 'Supermarché Auchan, Dakar'
    },
    photo: null,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    agent_assigne: 'POL003',
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    citoyen: 'Mariama SECK',
    heure: '13:15',
    description: 'Accident de circulation grave sur l\'autoroute à péage. Plusieurs véhicules impliqués.',
    niveau: 'danger-medium',
    status: 'traité',
    localisation: {
      lat: 14.7167,
      lng: -17.4677,
      nom: 'Autoroute à péage, sortie Pikine'
    },
    photo: null,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    agent_assigne: 'POL002',
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    citoyen: 'Ousmane DIALLO',
    heure: '12:45',
    description: 'Manifestation pacifique devant l\'université. Pas de débordements signalés.',
    niveau: 'safe-zone',
    status: 'traité',
    localisation: {
      lat: 14.6928,
      lng: -17.4467,
      nom: 'Université Cheikh Anta Diop'
    },
    photo: null,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    agent_assigne: 'POL001',
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    citoyen: 'Awa THIAM',
    heure: '11:20',
    description: 'Cambriolage signalé dans une résidence privée à Almadies.',
    niveau: 'danger-medium',
    status: 'non traité',
    localisation: {
      lat: 14.7372,
      lng: -17.5006,
      nom: 'Résidence Les Almadies'
    },
    photo: null,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '5',
    citoyen: 'Ibrahima WADE',
    heure: '10:30',
    description: 'Bagarre entre jeunes au marché Sandaga. Situation sous contrôle.',
    niveau: 'danger-medium',
    status: 'traité',
    localisation: {
      lat: 14.6759,
      lng: -17.4260,
      nom: 'Marché Sandaga'
    },
    photo: null,
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    agent_assigne: 'POL003',
    updated_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString()
  }
]

// Agents mockés
export const MOCK_AGENTS: Agent[] = [
  {
    id: 1,
    nom: 'Agent SARR',
    position: [14.6937, -17.4441],
    secteur: 'Centre-Ville',
    status: 'en_mission',
    derniere_activite: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    created_at: '2024-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    nom: 'Agent DIENG',
    position: [14.7167, -17.4677],
    secteur: 'Nord',
    status: 'disponible',
    derniere_activite: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    created_at: '2024-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    nom: 'Agent KANE',
    position: [14.6759, -17.4260],
    secteur: 'Sud',
    status: 'disponible',
    derniere_activite: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    created_at: '2024-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    nom: 'Agent MBAYE',
    position: [14.7372, -17.5006],
    secteur: 'Ouest',
    status: 'en_mission',
    derniere_activite: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    created_at: '2024-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  }
]

// Notifications mockées
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    titre: 'Nouveau signalement critique',
    message: 'Vol à main armée signalé au supermarché Auchan',
    type: 'error',
    lu: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    titre: 'Agent assigné',
    message: 'Agent SARR assigné au signalement #1',
    type: 'info',
    lu: true,
    created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    titre: 'Signalement traité',
    message: 'Accident de circulation résolu avec succès',
    type: 'success',
    lu: false,
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    titre: 'Maintenance système',
    message: 'Maintenance programmée ce soir de 22h à 02h',
    type: 'warning',
    lu: true,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  }
]

// Fonction pour générer un ID unique
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

// Fonction pour simuler un délai d'API
export const delay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}


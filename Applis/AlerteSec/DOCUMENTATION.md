# 📚 Documentation Technique - AlerteSec Mobile

## 📋 Table des Matières

1. [Architecture](#architecture)
2. [Authentification](#authentification)
3. [Intégration Backend](#intégration-backend)
4. [Fonctionnalités](#fonctionnalités)

---

## 🏗️ Architecture

### Stack Technologique
- **Expo Router** : Navigation file-based avec routing automatique
- **React Native** : Framework cross-platform (iOS, Android, Web)
- **NativeWind** : Tailwind CSS pour React Native
- **TypeScript** : Typage statique pour la robustesse
- **Expo Location** : Géolocalisation précise
- **React Native Maps** : Cartographie interactive
- **React Native Reanimated** : Animations performantes

### Structure du Projet
```
app/
├── splash.tsx              # Écran de chargement animé
├── onboarding.tsx          # Introduction (3 slides)
├── role-selection.tsx      # Choix citoyen/force
├── auth/                   # Authentification
│   ├── login-citoyen.tsx
│   ├── register-citoyen.tsx
│   └── login-force.tsx
├── signalement/            # Création d'alertes
│   └── nouveau.tsx
└── (tabs)/                 # Interface principale
    ├── index.tsx           # Carte + SOS
    ├── signalements.tsx    # Mes alertes
    ├── explore.tsx         # Communauté
    └── profile.tsx         # Profil utilisateur

components/
├── ui/                     # Composants UI réutilisables
│   ├── buttons.tsx
│   └── cards.tsx
└── ...

contexts/
├── ApiContext.tsx          # Contexte API global
└── ...

services/
├── api.ts                  # Service API avec Laravel
└── authService.ts          # Service d'authentification
```

---

## 🔐 Authentification

### Système d'Authentification Implémenté

#### Fonctionnalités Disponibles
1. ✅ **Authentification sécurisée** avec Laravel Sanctum
2. ✅ **Gestion des sessions persistantes** avec AsyncStorage
3. ✅ **Tokens JWT** avec expiration automatique
4. ✅ **Déconnexion simple et globale**
5. ✅ **Rafraîchissement automatique des tokens**

### Configuration

#### Backend (Laravel)
- ✅ Sanctum configuré pour l'authentification API
- ✅ Routes d'authentification disponibles
- ✅ Middleware de protection des routes
- ✅ Gestion des tokens et sessions

#### Frontend (React Native)
- ✅ Service d'authentification (`authService.ts`)
- ✅ Contexte API mis à jour
- ✅ Gestion automatique des sessions
- ✅ Stockage sécurisé des tokens

### API Endpoints Disponibles

#### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `POST /api/auth/logout` - Déconnexion
- `POST /api/auth/logout-all` - Déconnexion globale
- `GET /api/auth/profile` - Profil utilisateur
- `PUT /api/auth/profile` - Mise à jour du profil
- `POST /api/auth/change-password` - Changement de mot de passe

#### Comptes de démonstration
- `GET /api/users/demo-accounts` - Liste des comptes de test

### Gestion des Sessions

#### Stockage local
- **Token** : Stocké de manière sécurisée
- **Utilisateur** : Données du profil utilisateur
- **Expiration** : Session de 7 jours par défaut
- **Rafraîchissement** : Automatique en cas d'expiration

#### Persistance
- ✅ Session maintenue entre les redémarrages de l'app
- ✅ Reconnexion automatique si session valide
- ✅ Déconnexion automatique si session expirée

### Flux d'Authentification

1. **Initialisation** : L'app vérifie s'il y a une session valide
2. **Connexion** : Si pas de session, affichage du formulaire de connexion
3. **Authentification** : Validation des identifiants côté serveur
4. **Stockage** : Sauvegarde du token et des données utilisateur
5. **Navigation** : Accès aux fonctionnalités selon le rôle

### Rôles et Permissions

- **admin** : Accès complet à toutes les fonctionnalités
- **superviseur** : Gestion des agents et signalements
- **agent** : Traitement des signalements assignés
- **citoyen** : Création de signalements

### Gestion des Erreurs

- **Session expirée** : Déconnexion automatique
- **Token invalide** : Rafraîchissement automatique
- **Erreur réseau** : Messages d'erreur appropriés
- **Données manquantes** : Validation côté client et serveur

### Exemple d'Utilisation

```typescript
import { useApi } from '../contexts/ApiContext';

const { login, logout, user, isAuthenticated } = useApi();

// Connexion
await login({
  matricule: 'ADM001',
  password: 'password123',
  device_name: 'Mon Appareil'
});

// Vérification de l'état
if (isAuthenticated && user) {
  console.log(`Connecté en tant que ${user.nom} ${user.prenom}`);
}

// Déconnexion
await logout();
```

### Sécurité

- **HTTPS** : Obligatoire en production
- **Tokens** : Expiration automatique
- **Stockage** : Chiffrement des données sensibles
- **Validation** : Côté client et serveur
- **Sessions** : Nettoyage automatique

---

## 🔄 Intégration Backend

### Synchronisation Bidirectionnelle

#### Signalements
- ✅ Création depuis l'app mobile → Visible sur le dashboard
- ✅ Assignation depuis le dashboard → Notification à l'agent mobile
- ✅ Mise à jour de statut depuis mobile → Mise à jour dashboard
- ✅ Communications bidirectionnelles

#### Agents
- ✅ Position GPS en temps réel (mobile → dashboard)
- ✅ Statut et disponibilité synchronisés
- ✅ Assignation automatique basée sur proximité
- ✅ Notifications push pour nouvelles missions

#### Médias
- ✅ Upload photos/vidéos/audios depuis mobile
- ✅ Visualisation sur le dashboard
- ✅ Stockage sécurisé avec optimisation automatique
- ✅ Thumbnails générés automatiquement

#### Notifications
- ✅ Push notifications vers mobile
- ✅ Notifications in-app sur dashboard
- ✅ Marquage lu synchronisé
- ✅ Historique complet

### Endpoints API Principaux

#### Authentification
```
POST /api/mobile/login
POST /api/mobile/logout
GET  /api/mobile/profile
```

#### Signalements
```
GET  /api/mobile/signalements
POST /api/mobile/signalements/create
POST /api/mobile/signalements/{id}/status
```

#### Tracking GPS
```
POST /api/mobile/location/update
GET  /api/mobile/agents/positions
```

#### Communications
```
GET  /api/mobile/signalements/{id}/communications
POST /api/mobile/signalements/{id}/message
```

#### Médias
```
POST /api/mobile/signalements/{id}/media
```

#### Notifications
```
GET  /api/mobile/notifications
PUT  /api/mobile/notifications/{id}/read
```

---

## ✨ Fonctionnalités

### Alerte SOS Ultra-Rapide
- Signalement en moins de 10 secondes
- Appui court : Modal avec options (Immédiat / Détaillé)
- Appui long : Alerte automatique envoyée
- Géolocalisation automatique + confirmation visuelle

### Carte Interactive
- Visualisation des zones de danger en temps réel
- Positions des agents
- Zones de signalement colorées par priorité
- Navigation fluide

### Suivi des Signalements
- Historique complet des alertes
- Statut en temps réel
- Détails des interventions
- Communications avec les agents

### Zones de Danger Intelligentes
- Calcul automatique basé sur les signalements récents
- Algorithme de scoring avec pondération par gravité
- Décroissance temporelle (24h par défaut)
- Classification automatique (Rouge/Orange/Vert)

### Algorithme de Scoring

```javascript
// Calcul du score de danger pour une zone
score = Σ(poids_gravité × weight_timeDecay)

// Pondération par gravité
critique = 3, moyen = 2, mineur = 1

// Décroissance temporelle (24h par défaut)
weight_timeDecay = exp(-(now - created_at) / T)

// Classification des zones
score > S_high => Rouge (critique)
score > S_med  => Orange (surveillée)
sinon         => Vert (sûre)
```

---

## 🎨 Design System

### Palette de Couleurs
- **Primaire** : `#0091F5` (Bleu AlerteSec)
- **Danger** : `#EF4444` (Rouge SOS)
- **Warning** : `#F59E0B` (Orange)
- **Success** : `#10B981` (Vert)
- **Neutral** : Échelle de gris moderne

### Composants Réutilisables
- `PrimaryButton` / `SOSButton` / `GhostButton`
- `SignalementCard` / `ZoneCard` / `NotificationBadge`
- Animations : fade, scale, pulse, slide (200-300ms)

---

## 🛡️ Sécurité & Confidentialité

- **Chiffrement** : Données sensibles protégées
- **Authentification** : Vérification côté serveur pour les forces
- **Logs d'accès** : Traçabilité des actions
- **Masquage** : Numéros partiellement cachés sur l'UI publique
- **RGPD** : Respect de la vie privée des utilisateurs

---

## 🚀 Déploiement

### Build Expo
- Build Expo avec `expo build`
- Distribution via App Store/Google Play
- Configuration des notifications push

### Configuration Production
- Variables d'environnement pour l'API
- Configuration des notifications push
- Optimisation des performances

---

**AlerteSec Mobile** - Application de sécurité citoyenne en temps réel


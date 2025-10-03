# Vigil Alert Hub

**Plateforme de gestion des alertes et signalements pour les forces de l'ordre**

Une application web moderne permettant aux forces de l'ordre de gérer efficacement les signalements citoyens, les interventions d'urgence et les opérations de terrain en temps réel.

## 🚀 Fonctionnalités

### ✅ **Fonctionnalités disponibles**

- **📊 Données mockées** : Système de simulation sans base de données
- **🔔 Notifications simulées** : Système de notifications avec données fictives
- **📊 Statistiques dynamiques** : Données simulées en temps réel
- **🗺️ Carte interactive** : Positions des agents simulées
- **👥 Gestion des agents** : Assignation et suivi avec données mockées
- **📱 Interface responsive** : Optimisée pour tous les écrans

### 🔐 Authentification Sécurisée
- Système multi-niveaux avec matricule, mot de passe et code service
- Authentification à deux facteurs (2FA)
- Gestion des rôles : Admin, Superviseur, Agent, Opérateur
- Sessions sécurisées avec expiration automatique

### 📊 Dashboard Interactif
- Vue d'ensemble en temps réel des activités
- Graphiques et statistiques dynamiques
- Carte interactive des zones d'intervention
- Activités récentes avec actions rapides
- **Statut de connexion en temps réel**

### 📋 Gestion des Signalements
- Réception et traitement des alertes citoyennes
- Classification par niveau de priorité (critique, moyen, sécurisé)
- Assignation d'agents et suivi des interventions
- Vue carte et vue grille
- **Mise à jour en temps réel**

### 🚨 Cas Graves
- Gestion spécialisée des urgences critiques
- Intervention prioritaire et escalade
- Coordination des équipes d'urgence
- **Alertes automatiques**

### 🔔 Système de Notifications
- Centre de notifications en temps réel
- Filtrage par type et priorité
- Actions contextuelles (assigner, localiser, contacter)
- Historique complet des notifications
- **Notifications push automatiques**

### 🗺️ Carte Interactive
- Positions des agents en temps réel
- Zones de signalement colorées par priorité
- Assignation d'interventions depuis la carte
- Navigation fluide entre les vues
- **Mise à jour automatique des positions**

## 🛠️ Technologies

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **Cartes**: React Leaflet + OpenStreetMap
- **Graphiques**: Recharts
- **Animations**: Framer Motion
- **Routing**: React Router v6
- **Build**: Vite
- **État**: React Context + Hooks
- **Données**: Services mockés (simulation)

## 📦 Installation

```bash
# Cloner le projet
git clone [url-du-repo]
cd vigil-alert-hub

# Installer les dépendances
npm install

# Démarrer l'application
npm run dev
```

## 🔐 Comptes de Test

### Admin (Accès Complet)
- **Matricule**: POL001
- **Mot de passe**: demo123
- **Code service**: DEMO

### Superviseur
- **Matricule**: POL002
- **Mot de passe**: demo123
- **Code service**: DEMO

### Agent de Terrain
- **Matricule**: POL003
- **Mot de passe**: demo123
- **Code service**: DEMO

### Opérateur
- **Matricule**: OPE001
- **Mot de passe**: demo123
- **Code service**: DEMO

**Code 2FA pour tous les comptes**: 123456

> ⚠️ **Note importante**: Cette version utilise maintenant des données mockées (simulées) pour la démonstration. Aucune base de données externe n'est requise.

## 🏗️ Structure du Projet

```
vigil-alert-hub/
├── src/
│   ├── components/
│   │   ├── ui/                 # Composants UI réutilisables
│   │   ├── police/            # Composants spécifiques police
│   │   ├── map/               # Composants carte
│   │   └── notifications/     # Système de notifications
│   ├── contexts/              # Contextes React (Auth, Notifications)
│   ├── hooks/                 # Hooks personnalisés (useSocket)
│   ├── lib/                   # Utilitaires et API
│   └── pages/                 # Pages principales
├── server/
│   └── index.js              # Serveur Express + Socket.IO
└── public/                   # Assets statiques
```

## 🎯 Permissions par Rôle

| Page | Admin | Superviseur | Agent | Opérateur |
|------|-------|-------------|-------|-----------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Signalements | ✅ | ✅ | ✅ | ✅ |
| Cas Graves | ✅ | ✅ | ✅ | ✅ |
| Utilisateurs | ✅ | ✅ | ✅ | ✅ |
| Feedbacks | ✅ | ✅ | ✅ | ✅ |
| Historique | ✅ | ✅ | ✅ | ✅ |

## 🔄 Développement

```bash
# Lancer en développement
npm run dev

# Linter
npm run lint

# Build
npm run build

# Preview du build
npm run preview
```

## 🌍 Déploiement

```bash
# Build de production
npm run build

# Les fichiers générés seront dans le dossier `dist/`

# Preview de la build de production
npm run preview
```

## 📱 Responsive Design

L'application est entièrement responsive et optimisée pour :
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

## 🔒 Sécurité

- Authentification multi-facteurs
- Sessions avec timeout automatique
- Contrôle d'accès basé sur les rôles (RBAC)
- Validation côté client et serveur
- Protection des routes sensibles
- **Communications chiffrées**

## 🚀 Nouvelles fonctionnalités

### Temps réel
- **Socket.IO** : Communications bidirectionnelles
- **Notifications instantanées** : Alertes en temps réel
- **Positions des agents** : Mise à jour automatique
- **Statut de connexion** : Indicateur visuel

### Backend (Supprimé)
- **API REST** : Endpoints pour toutes les opérations
- **Base de données simulée** : Données persistantes
- **Gestion des agents** : CRUD complet
- **Système de notifications** : Historique et gestion

### Interface
- **Statut de connexion** : Indicateur en temps réel
- **Notifications popup** : Centre de notifications intégré
- **Dashboard dynamique** : Statistiques en direct
- **Carte interactive** : Positions et zones en temps réel

## 🤝 Contribution

Ce projet est développé pour les forces de l'ordre du Sénégal dans le cadre de la modernisation des systèmes de sécurité publique.

## 📈 Roadmap

### Phase 2 (Prochaines améliorations)
- [ ] Base de données PostgreSQL/MongoDB
- [ ] Application mobile citoyenne
- [ ] Notifications push
- [ ] Géolocalisation GPS
- [ ] Intégration SMS/Email
- [ ] Analytics avancés
- [ ] Tests automatisés
- [ ] Déploiement production

### Phase 3 (Fonctionnalités avancées)
- [ ] Chat en temps réel
- [ ] Vidéoconférence
- [ ] Mode hors ligne
- [ ] Intégration IA
- [ ] Rapports automatisés
- [ ] API publique

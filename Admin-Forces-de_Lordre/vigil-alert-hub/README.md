# 🚨 Vigil Alert Hub - Dashboard Admin AlertSec

**Plateforme de gestion des alertes et signalements pour les forces de l'ordre**

Application web moderne permettant aux forces de l'ordre de gérer efficacement les signalements citoyens, les interventions d'urgence et les opérations de terrain en temps réel.

## 🚀 Démarrage Rapide

```bash
# Installation
npm install

# Développement
npm run dev

# Build production
npm run build
```

**Accès**: http://localhost:5173

## 🔐 Comptes de Test

| Rôle | Matricule | Mot de passe | Code service | Code 2FA |
|------|-----------|--------------|--------------|----------|
| **Admin** | POL001 | admin123 | DEMO | 123456 |
| **Superviseur** | POL002 | super123 | DEMO | 123456 |
| **Agent** | POL003 | agent123 | DEMO | 123456 |
| **Opérateur** | OPE001 | ope123 | DEMO | 123456 |

## ✨ Fonctionnalités Principales

### 📊 Dashboard Interactif
- Vue d'ensemble en temps réel des activités
- Graphiques et statistiques dynamiques
- Carte interactive des zones d'intervention
- Activités récentes avec actions rapides

### 🚨 Gestion des Signalements
- Réception et traitement des alertes citoyennes
- Classification par niveau de priorité
- Assignation automatique d'agents
- Lecteur de médias intégré (photos, vidéos, audios)
- Communication avec les citoyens

### 👮 Tracking des Agents
- Position GPS en temps réel
- Vitesse et direction des agents
- Niveau de batterie des appareils
- Statut de connexion (en ligne/hors ligne)
- Missions en cours avec détails

### 🗺️ Zones de Danger
- Calcul automatique des zones à risque
- Niveaux de danger (critique, moyen, sécurisé)
- Facteurs de risque identifiés
- Recommandations personnalisées
- Actions sur les zones (patrouilles, éclairage, caméras)

### 🔔 Système de Notifications
- Centre de notifications en temps réel
- Filtrage par type et priorité
- Actions contextuelles
- Historique complet

## 🛠️ Technologies

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **Cartes**: React Leaflet + OpenStreetMap
- **Graphiques**: Recharts
- **Build**: Vite
- **État**: React Context + Hooks

## 📁 Structure du Projet

```
vigil-alert-hub/
├── src/
│   ├── components/        # Composants React organisés par fonctionnalité
│   ├── contexts/          # Contextes React (Auth, Notifications)
│   ├── hooks/             # Hooks personnalisés
│   ├── lib/               # Services et utilitaires
│   └── pages/             # Pages principales
├── public/                # Fichiers statiques
├── scripts/               # Scripts de test
└── dist/                  # Build de production
```

## 📚 Documentation

- **[DOCUMENTATION.md](DOCUMENTATION.md)** - Documentation technique complète
- **[GUIDE.md](GUIDE.md)** - Guides utilisateur et connexion

## 🔒 Sécurité

- Authentification multi-facteurs (matricule + mot de passe + code service + 2FA)
- Sessions avec timeout automatique
- Contrôle d'accès basé sur les rôles (RBAC)
- Protection des routes sensibles

## 📱 Responsive Design

Optimisé pour tous les écrans :
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

---

**Développé avec ❤️ pour les forces de l'ordre**

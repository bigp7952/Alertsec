# 🚨 Backend AlertSec - API Laravel

**Système complet de gestion des alertes et signalements pour les forces de l'ordre**

API REST complète développée avec Laravel 10, fournissant toutes les fonctionnalités nécessaires pour connecter le dashboard web et l'application mobile Expo.

## 🚀 Démarrage Rapide

```bash
# Installation
composer install
cp .env.example .env
php artisan key:generate

# Configuration base de données
# Éditer .env avec vos paramètres DB

# Migrations et données de test
php artisan migrate --seed

# Démarrer le serveur
php artisan serve --port=8000
```

**Accès API**: http://localhost:8000/api

## 🔐 Comptes de Test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Admin** | admin@alertsec.com | password |
| **Superviseur** | superviseur1@alertsec.com | password |
| **Agent** | agent1@alertsec.com | password |
| **Citoyen** | citoyen1@alertsec.com | password |

## ✨ Fonctionnalités Principales

### 🔐 Authentification & Sécurité
- Laravel Sanctum pour l'authentification API
- Middleware de rôles (admin, superviseur, agent, citoyen)
- Validation des données complète
- Protection CORS configurée

### 🚨 Signalements
- CRUD complet avec géolocalisation
- Médias (photos, vidéos, audio)
- Assignation automatique d'agents
- Calcul de priorité intelligent
- Statuts et workflow

### 👮 Agents & Tracking
- Gestion des agents
- Tracking GPS en temps réel
- Positions et mouvements
- Missions et assignations
- Statistiques de performance

### 🗺️ Zones de Danger
- Calcul automatique du risque
- Facteurs de risque
- Recommandations
- Actions et historique
- Rapports générés

### 💬 Communications
- Messages instantanés
- Communications par signalement
- Types (message, appel, SMS)
- Historique complet

### 🔔 Notifications
- Système de notifications
- Types (info, warning, error, success)
- Diffusion ciblée
- Notifications par rôle

## 📡 API Endpoints Principaux

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/profile` - Profil utilisateur

### Signalements
- `GET /api/signalements` - Liste avec filtres
- `POST /api/signalements` - Créer signalement
- `GET /api/signalements/{id}` - Détails
- `POST /api/signalements/{id}/assigner` - Assigner agent

### Agents
- `GET /api/agents` - Liste des agents
- `POST /api/agents/position/update` - Mise à jour position
- `GET /api/agents/positions` - Toutes positions

### Zones de Danger
- `GET /api/zones` - Liste des zones
- `POST /api/zones/auto-calculate` - Calcul automatique
- `GET /api/zones/{id}/generate-report` - Générer rapport

## 📚 Documentation

- **[DOCUMENTATION.md](DOCUMENTATION.md)** - Documentation technique complète
- **[GUIDE.md](GUIDE.md)** - Guide d'installation et dépannage

## 🛠️ Technologies

- **Framework**: Laravel 10.x
- **Base de données**: MySQL 8.0+
- **Authentification**: Laravel Sanctum
- **API**: REST avec pagination et filtres

## 🔒 Sécurité

- Authentification JWT avec Sanctum
- Middleware de rôles
- Validation des données
- Protection CORS
- Upload sécurisé de fichiers

---

**Développé avec ❤️ pour les forces de l'ordre**

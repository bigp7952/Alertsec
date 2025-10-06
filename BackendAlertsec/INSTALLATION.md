# 🚀 Installation du Backend AlertSec

## 📋 Prérequis

- PHP 8.1 ou supérieur
- Composer
- MySQL 8.0 ou supérieur
- Laravel 10.x

## 🔧 Installation

### 1. Configuration de l'environnement

```bash
# Copier le fichier d'environnement
cp .env.example .env

# Générer la clé d'application
php artisan key:generate
```

### 2. Configuration de la base de données

Éditez le fichier `.env` et configurez votre base de données :

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=alertsec
DB_USERNAME=root
DB_PASSWORD=votre_mot_de_passe
```

### 3. Installation des dépendances

```bash
# Installer les dépendances Composer
composer install

# Installer les dépendances NPM (optionnel pour les assets)
npm install
```

### 4. Configuration de la base de données

```bash
# Exécuter les migrations
php artisan migrate

# Charger les données de test
php artisan db:seed
```

### 5. Configuration des permissions

```bash
# Donner les permissions d'écriture
chmod -R 775 storage bootstrap/cache
```

### 6. Démarrer le serveur

```bash
# Serveur de développement
php artisan serve

# Ou avec un port spécifique
php artisan serve --port=8000
```

## 🧪 Données de test

Les comptes de test suivants sont créés automatiquement :

### Admin
- **Email**: admin@alertsec.com
- **Mot de passe**: password
- **Rôle**: Administrateur système

### Superviseur
- **Email**: superviseur1@alertsec.com
- **Mot de passe**: password
- **Rôle**: Superviseur (Nord)

### Agent
- **Email**: agent1@alertsec.com
- **Mot de passe**: password
- **Rôle**: Agent de terrain

### Citoyen
- **Email**: citoyen1@alertsec.com
- **Mot de passe**: password
- **Rôle**: Citoyen

## 📡 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/profile` - Profil utilisateur

### Signalements
- `GET /api/signalements` - Liste des signalements
- `POST /api/signalements` - Créer un signalement
- `GET /api/signalements/{id}` - Détails d'un signalement
- `PUT /api/signalements/{id}` - Modifier un signalement
- `POST /api/signalements/{id}/assigner` - Assigner un agent

### Agents
- `GET /api/agents` - Liste des agents
- `POST /api/agents/position/update` - Mettre à jour la position
- `GET /api/agents/positions` - Positions des agents

### Communications
- `GET /api/communications` - Messages
- `POST /api/communications` - Envoyer un message
- `GET /api/communications/signalement/{id}` - Messages d'un signalement

### Zones de danger
- `GET /api/zones` - Liste des zones
- `POST /api/zones` - Créer une zone
- `GET /api/zones/{id}/generate-report` - Générer un rapport

### Temps réel
- `GET /api/realtime/dashboard-data` - Données du dashboard
- `GET /api/realtime/signalements-updates` - Mises à jour des signalements
- `GET /api/realtime/agents-positions` - Positions des agents

## 🔐 Middlewares de sécurité

### Rôles
- `role:admin` - Administrateur uniquement
- `role:admin|superviseur` - Admin ou superviseur
- `role:agent` - Agent uniquement
- `role:citoyen` - Citoyen uniquement

### Statut utilisateur
- `user.status` - Vérifie que le compte est actif

## 📊 Fonctionnalités

### ✅ Implémentées
- Authentification avec Sanctum
- Gestion des rôles et permissions
- CRUD complet pour tous les modèles
- Assignation automatique d'agents
- Tracking GPS des agents
- Zones de danger avec calcul de risque
- Système de communications
- Notifications en temps réel
- Upload de médias (photos, vidéos, audio)
- Statistiques et rapports

### 🔄 Temps réel
- Mises à jour des signalements
- Positions des agents
- Communications instantanées
- Notifications push
- Statut système

### 📱 Mobile & Web
- API REST complète
- Authentification JWT
- Upload de fichiers
- Géolocalisation
- Notifications push

## 🛠️ Configuration avancée

### Variables d'environnement

```env
# Configuration spécifique AlertSec
ALERTSEC_API_VERSION=v1
ALERTSEC_MAX_FILE_SIZE=10240
ALERTSEC_ALLOWED_FILE_TYPES=jpg,jpeg,png,mp4,avi,mov,mp3,wav,m4a
ALERTSEC_DEFAULT_AGENT_DISTANCE=10
ALERTSEC_MAX_AGENT_WORKLOAD=5
ALERTSEC_AUTO_ASSIGNMENT_ENABLED=true
ALERTSEC_REAL_TIME_UPDATES=true
ALERTSEC_CACHE_DURATION=300
```

### Cache et Performance

```bash
# Optimiser l'autoloader
composer install --optimize-autoloader --no-dev

# Configurer le cache
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 🚨 Dépannage

### Erreurs communes

1. **Erreur de permissions**
   ```bash
   chmod -R 775 storage bootstrap/cache
   ```

2. **Erreur de base de données**
   - Vérifiez la configuration dans `.env`
   - Assurez-vous que MySQL est démarré

3. **Erreur de clé d'application**
   ```bash
   php artisan key:generate
   ```

### Logs

```bash
# Voir les logs
tail -f storage/logs/laravel.log

# Vider les logs
php artisan log:clear
```

## 📈 Monitoring

### Santé de l'API
- `GET /api/health` - Statut de l'API
- `GET /api/realtime/system-status` - Statut système

### Métriques
- Nombre d'utilisateurs actifs
- Agents en ligne
- Signalements critiques
- Zones à risque élevé

## 🔒 Sécurité

- Authentification JWT avec Sanctum
- Middleware de rôles
- Validation des données
- Protection CORS
- Upload sécurisé de fichiers

## 📞 Support

Pour toute question ou problème :
1. Consultez les logs Laravel
2. Vérifiez la configuration
3. Testez avec les comptes de démo

---

**Backend AlertSec v1.0.0** - Système complet de gestion des alertes et signalements






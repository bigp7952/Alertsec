# 📖 Guide d'Installation et Dépannage - Backend AlertSec

## 🚀 Installation

### Prérequis
- PHP 8.1 ou supérieur
- Composer
- MySQL 8.0 ou supérieur
- Laravel 10.x

### Étapes d'Installation

#### 1. Configuration de l'environnement
```bash
# Copier le fichier d'environnement
cp .env.example .env

# Générer la clé d'application
php artisan key:generate
```

#### 2. Configuration de la base de données
Éditez le fichier `.env` et configurez votre base de données :
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=alertsec
DB_USERNAME=root
DB_PASSWORD=votre_mot_de_passe
```

#### 3. Installation des dépendances
```bash
# Installer les dépendances Composer
composer install

# Installer les dépendances NPM (optionnel pour les assets)
npm install
```

#### 4. Configuration de la base de données
```bash
# Exécuter les migrations
php artisan migrate

# Charger les données de test
php artisan db:seed
```

#### 5. Configuration des permissions
```bash
# Donner les permissions d'écriture
chmod -R 775 storage bootstrap/cache
```

#### 6. Démarrer le serveur
```bash
# Serveur de développement
php artisan serve

# Ou avec un port spécifique
php artisan serve --port=8000
```

---

## 🧪 Données de Test

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

---

## 🔧 Configuration Avancée

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

---

## 🚨 Dépannage

### Erreurs Communes

#### 1. Erreur de permissions
```bash
chmod -R 775 storage bootstrap/cache
```

#### 2. Erreur de base de données
- Vérifiez la configuration dans `.env`
- Assurez-vous que MySQL est démarré
- Vérifiez que la base de données existe

#### 3. Erreur de clé d'application
```bash
php artisan key:generate
```

#### 4. Erreur 500 sur les endpoints
- Vérifiez l'authentification : `curl -X POST http://localhost:8000/api/auth/login`
- Vérifiez les logs Laravel : `tail -f storage/logs/laravel.log`
- Vérifiez la connexion à la base de données

#### 5. Erreur CORS
- Vérifiez la configuration CORS dans `config/cors.php`
- Ajoutez votre domaine frontend dans les origines autorisées

### Logs
```bash
# Voir les logs
tail -f storage/logs/laravel.log

# Vider les logs
php artisan log:clear
```

---

## 📊 Monitoring

### Santé de l'API
- `GET /api/health` - Statut de l'API
- `GET /api/realtime/system-status` - Statut système

### Métriques
- Nombre d'utilisateurs actifs
- Agents en ligne
- Signalements critiques
- Zones à risque élevé

---

## 🔐 Sécurité

### Authentification
- JWT tokens avec Sanctum
- Expiration automatique
- Refresh tokens
- Logout global

### Middlewares de sécurité

#### Rôles
- `role:admin` - Administrateur uniquement
- `role:admin|superviseur` - Admin ou superviseur
- `role:agent` - Agent uniquement
- `role:citoyen` - Citoyen uniquement

#### Statut utilisateur
- `user.status` - Vérifie que le compte est actif

### Validation
- Validation complète des données d'entrée
- Sanitisation des entrées
- Upload sécurisé de fichiers
- Protection CSRF

---

## 🧪 Tests

### Test de Connexion
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@alertsec.com","password":"password"}'
```

### Test de Tracking GPS
```bash
curl -X POST http://localhost:8000/api/mobile/location/update \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"latitude":14.6937,"longitude":-17.4441,"status":"en mission"}'
```

### Test de Création Signalement
```bash
curl -X POST http://localhost:8000/api/mobile/signalements/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"Test signalement","type":"vol","priorite":"haute","latitude":14.6937,"longitude":-17.4441,"adresse":"Dakar, Sénégal"}'
```

---

## 🔄 Intégration avec Dashboard et Mobile

### Pour le Dashboard Web
```javascript
// Exemple d'utilisation
const API_BASE = 'http://localhost:8000/api';

// Récupérer les données du dashboard
const getDashboardData = async (token) => {
  const response = await fetch(`${API_BASE}/dashboard`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

### Pour l'Application Mobile
```javascript
// Exemple d'utilisation
const API_BASE = 'http://localhost:8000/api';

// Connexion
const login = async (email, password) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};
```

---

## 📞 Support

Pour toute question ou problème :
1. Consultez les logs Laravel
2. Vérifiez la configuration
3. Testez avec les comptes de démo
4. Consultez la [DOCUMENTATION.md](DOCUMENTATION.md) pour plus de détails

---

**Backend AlertSec v1.0.0** - Système complet de gestion des alertes et signalements


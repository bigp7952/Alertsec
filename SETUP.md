# 🚀 Guide de Démarrage - AlertSec

**Guide complet pour démarrer le projet après clonage depuis GitHub**

## 📋 Table des Matières

1. [Prérequis](#-prérequis)
2. [Installation Rapide avec Docker](#-installation-rapide-avec-docker)
3. [Installation Manuelle](#-installation-manuelle)
4. [Configuration](#-configuration)
5. [Vérification](#-vérification)
6. [Dépannage](#-dépannage)

---

## ✅ Prérequis

### Option 1 : Docker (Recommandé)

- **Docker Desktop** : [Télécharger](https://www.docker.com/get-started) (version 20.10+)
- **Docker Compose** : Inclus avec Docker Desktop (version 2.0+)

### Option 2 : Installation Manuelle

#### Backend (Laravel)
- **PHP** : 8.1 ou supérieur
- **Composer** : [Télécharger](https://getcomposer.org/)
- **MySQL** : 8.0 ou supérieur
- **Redis** : 7.0 ou supérieur (optionnel mais recommandé)

#### Frontend (React)
- **Node.js** : 18.x ou supérieur
- **npm** : Inclus avec Node.js

#### Mobile (Expo)
- **Node.js** : 18.x ou supérieur
- **Expo CLI** : Installé automatiquement avec npm

---

## 🐳 Installation Rapide avec Docker

### Étape 1 : Cloner le Projet

```bash
git clone <url-du-repo>
cd Projet_Fin_D'etude_(AlertSec)
```

### Étape 2 : Démarrer avec Docker

#### Windows
```powershell
.\start-docker.ps1
```

#### Linux/Mac
```bash
chmod +x start-docker.sh
./start-docker.sh
```

#### Ou manuellement
```bash
# 1. Créer le fichier .env à la racine (sera créé automatiquement si absent)
# 2. Lancer les services
docker-compose up -d --build
```

### Étape 3 : Attendre le Démarrage

Les services démarrent automatiquement :
- ✅ MySQL : Création de la base de données
- ✅ Backend : Installation des dépendances, migrations, seeders
- ✅ Frontend : Installation des dépendances et build
- ✅ Redis : Démarrage du cache

**Temps estimé** : 3-5 minutes pour la première fois

### Étape 4 : Accéder aux Services

Une fois démarré, accédez à :

- **Frontend (Dashboard)** : http://localhost:5173
- **Backend API** : http://localhost:8000
- **API Health Check** : http://localhost:8000/api/health
- **MySQL** : localhost:3306
- **Redis** : localhost:6379

### Étape 5 : Vérifier le Fonctionnement

#### Vérifier les Services
```bash
# Voir les logs
docker-compose logs -f

# Vérifier les conteneurs
docker-compose ps

# Vérifier la santé de l'API
curl http://localhost:8000/api/health
```

#### Tester la Connexion

1. Ouvrir http://localhost:5173
2. Se connecter avec :
   - **Email** : `admin@alertsec.com`
   - **Mot de passe** : `password`

---

## 🔧 Installation Manuelle

### Backend (Laravel)

#### 1. Installer les Dépendances
```bash
cd BackendAlertsec
composer install
```

#### 2. Configuration de l'Environnement
```bash
# Copier le fichier d'environnement
cp .env.example .env

# Générer la clé d'application
php artisan key:generate
```

#### 3. Configuration de la Base de Données

Éditer `BackendAlertsec/.env` :
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=alertsec
DB_USERNAME=root
DB_PASSWORD=votre_mot_de_passe
```

#### 4. Créer la Base de Données
```sql
CREATE DATABASE alertsec CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 5. Exécuter les Migrations
```bash
php artisan migrate --seed
```

#### 6. Démarrer le Serveur
```bash
php artisan serve --port=8000
```

### Frontend (React)

#### 1. Installer les Dépendances
```bash
cd Admin-Forces-de_Lordre/vigil-alert-hub
npm install
```

#### 2. Configuration de l'Environnement
```bash
# Créer le fichier .env
echo "VITE_API_BASE_URL=http://localhost:8000/api" > .env
```

#### 3. Démarrer le Serveur de Développement
```bash
npm run dev
```

Le frontend sera accessible sur http://localhost:5173

### Mobile (Expo)

#### 1. Installer les Dépendances
```bash
cd Applis/AlerteSec
npm install
```

#### 2. Configuration de l'Environnement

Créer ou modifier `Applis/AlerteSec/.env` :
```env
EXPO_PUBLIC_API_URL=http://localhost:8000/api
```

#### 3. Démarrer l'Application
```bash
npm start
# ou
npx expo start
```

#### 4. Options de Lancement
- 📱 **Expo Go** : Scanner le QR code
- 🤖 **Android** : `npm run android`
- 🍎 **iOS** : `npm run ios`
- 🌐 **Web** : `npm run web`

---

## ⚙️ Configuration

### Fichiers d'Environnement

#### Racine du Projet (`.env`)
```env
BACKEND_PORT=8000
FRONTEND_PORT=5173
DB_PORT=3306
REDIS_PORT=6379
DB_DATABASE=alertsec
DB_USERNAME=alertsec
DB_PASSWORD=password
DB_ROOT_PASSWORD=rootpassword
APP_NAME=AlertSec
APP_ENV=local
APP_DEBUG=true
VITE_API_BASE_URL=http://localhost:8000/api
```

#### Backend (`BackendAlertsec/.env`)
```env
APP_NAME=AlertSec
APP_ENV=local
APP_KEY=base64:... (généré avec php artisan key:generate)
APP_DEBUG=true
APP_URL=http://localhost:8000

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=alertsec
DB_USERNAME=alertsec
DB_PASSWORD=password

BROADCAST_DRIVER=redis
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

#### Frontend (`Admin-Forces-de_Lordre/vigil-alert-hub/.env`)
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

#### Mobile (`Applis/AlerteSec/.env`)
```env
EXPO_PUBLIC_API_URL=http://localhost:8000/api
```

---

## ✅ Vérification

### Checklist de Vérification

#### Services Docker
- [ ] Tous les conteneurs sont en cours d'exécution (`docker-compose ps`)
- [ ] Aucune erreur dans les logs (`docker-compose logs`)
- [ ] MySQL est accessible
- [ ] Redis est accessible

#### Backend
- [ ] API répond sur http://localhost:8000/api/health
- [ ] Migrations exécutées avec succès
- [ ] Seeders exécutés (données de test créées)
- [ ] Pas d'erreurs dans `storage/logs/laravel.log`

#### Frontend
- [ ] Application accessible sur http://localhost:5173
- [ ] Pas d'erreurs dans la console du navigateur
- [ ] Connexion fonctionnelle

#### Mobile
- [ ] Application démarre sans erreur
- [ ] Connexion au backend fonctionnelle
- [ ] Pas d'erreurs dans les logs Expo

### Tests de Connexion

#### Comptes de Test

| Rôle | Email | Mot de passe | Code service (Frontend) |
|------|-------|--------------|------------------------|
| **Admin** | admin@alertsec.com | password | DEMO |
| **Superviseur** | superviseur1@alertsec.com | password | DEMO |
| **Agent** | agent1@alertsec.com | password | DEMO |
| **Citoyen** | citoyen1@alertsec.com | password | - |

#### Test API
```bash
# Test de santé
curl http://localhost:8000/api/health

# Test de connexion
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@alertsec.com","password":"password"}'
```

---

## 🐛 Dépannage

### Problèmes Courants

#### 1. Erreur : Port déjà utilisé

**Solution** :
```bash
# Vérifier les ports utilisés
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # Linux/Mac

# Modifier les ports dans docker-compose.yml ou .env
```

#### 2. Erreur : Base de données non accessible

**Solution** :
```bash
# Vérifier que MySQL est démarré
docker-compose ps mysql

# Vérifier les logs
docker-compose logs mysql

# Recréer la base de données
docker-compose exec backend php artisan migrate:fresh --seed
```

#### 3. Erreur : Permissions insuffisantes (Linux/Mac)

**Solution** :
```bash
# Donner les permissions
chmod -R 775 BackendAlertsec/storage
chmod -R 775 BackendAlertsec/bootstrap/cache
```

#### 4. Erreur : Dépendances non installées

**Solution** :
```bash
# Backend
cd BackendAlertsec
composer install

# Frontend
cd Admin-Forces-de_Lordre/vigil-alert-hub
npm install

# Mobile
cd Applis/AlerteSec
npm install
```

#### 5. Erreur : Clé d'application manquante

**Solution** :
```bash
cd BackendAlertsec
php artisan key:generate
```

#### 6. Erreur : CORS

**Solution** :
Vérifier la configuration CORS dans `BackendAlertsec/config/cors.php` :
```php
'allowed_origins' => ['http://localhost:5173'],
```

#### 7. Erreur : Variables d'environnement non chargées

**Solution** :
- Vérifier que les fichiers `.env` existent
- Redémarrer les services après modification
- Vider le cache : `php artisan config:clear`

### Commandes Utiles

#### Docker
```bash
# Voir les logs
docker-compose logs -f [service]

# Redémarrer un service
docker-compose restart [service]

# Reconstruire les images
docker-compose up -d --build

# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v
```

#### Backend
```bash
# Nettoyer le cache
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Réinitialiser la base de données
php artisan migrate:fresh --seed

# Voir les routes
php artisan route:list
```

#### Frontend
```bash
# Nettoyer le cache
rm -rf node_modules/.vite
npm run dev
```

---

## 📚 Documentation Complète

- **README Principal** : [README.md](README.md)
- **Documentation Backend** : [BackendAlertsec/README.md](BackendAlertsec/README.md)
- **Documentation Frontend** : [Admin-Forces-de_Lordre/vigil-alert-hub/README.md](Admin-Forces-de_Lordre/vigil-alert-hub/README.md)
- **Documentation Mobile** : [Applis/AlerteSec/README.md](Applis/AlerteSec/README.md)
- **Guide Docker** : [DOCKER_README.md](DOCKER_README.md)

---

## 🎯 Prochaines Étapes

Une fois le projet démarré :

1. ✅ **Explorer le Dashboard** : http://localhost:5173
2. ✅ **Tester l'API** : http://localhost:8000/api/health
3. ✅ **Lancer l'App Mobile** : `cd Applis/AlerteSec && npm start`
4. ✅ **Consulter la Documentation** : Voir les fichiers README.md de chaque module

---

## 💡 Support

Si vous rencontrez des problèmes :

1. Consultez la section [Dépannage](#-dépannage)
2. Vérifiez les logs : `docker-compose logs`
3. Consultez la documentation complète dans les dossiers `docs/`
4. Ouvrez une issue sur GitHub

---

**🎉 Félicitations ! Votre environnement AlertSec est maintenant prêt !**


# 🐳 Guide Docker - AlertSec

Ce guide vous permet de lancer le projet AlertSec avec Docker, sans avoir à configurer manuellement PHP, Node.js, MySQL, etc.

## 📋 Prérequis

- [Docker](https://www.docker.com/get-started) (version 20.10 ou supérieure)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0 ou supérieure)

## 🚀 Démarrage Rapide

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd Projet_Fin_D'etude_(AlertSec)
```

### 2. Configurer l'environnement

```bash
# Copier le fichier d'environnement
cp .env.example .env
```

Vous pouvez modifier les valeurs dans `.env` si nécessaire (ports, mots de passe, etc.).

### 3. Lancer les services

```bash
# Construire et démarrer tous les services
docker-compose up -d --build
```

Cette commande va :
- ✅ Construire les images Docker pour le backend et le frontend
- ✅ Démarrer MySQL et Redis
- ✅ Installer les dépendances PHP et Node.js
- ✅ Exécuter les migrations de base de données
- ✅ Charger les données de test (seeders)
- ✅ Démarrer les serveurs backend et frontend

### 4. Accéder à l'application

- **Frontend (Dashboard)**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api

## 🔐 Comptes de Test

Les données de test sont automatiquement chargées. Voici les comptes disponibles :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Admin** | admin@alertsec.com | password |
| **Superviseur** | superviseur1@alertsec.com | password |
| **Agent** | agent1@alertsec.com | password |
| **Citoyen** | citoyen1@alertsec.com | password |

## 🛠️ Commandes Utiles

### Voir les logs

```bash
# Tous les services
docker-compose logs -f

# Backend uniquement
docker-compose logs -f backend

# Frontend uniquement
docker-compose logs -f frontend

# MySQL uniquement
docker-compose logs -f mysql
```

### Arrêter les services

```bash
# Arrêter sans supprimer les volumes
docker-compose stop

# Arrêter et supprimer les conteneurs (mais garder les volumes)
docker-compose down

# Arrêter et supprimer tout (y compris les volumes de données)
docker-compose down -v
```

### Redémarrer un service

```bash
# Redémarrer le backend
docker-compose restart backend

# Redémarrer le frontend
docker-compose restart frontend
```

### Exécuter des commandes dans les conteneurs

```bash
# Accéder au shell du backend
docker-compose exec backend bash

# Exécuter une commande artisan
docker-compose exec backend php artisan migrate

# Exécuter une commande npm dans le frontend
docker-compose exec frontend npm run build
```

### Réinitialiser la base de données

```bash
# Supprimer et recréer la base de données
docker-compose exec backend php artisan migrate:fresh --seed
```

## 📁 Structure des Services

```
docker-compose.yml
├── mysql          → Base de données MySQL (port 3306)
├── redis          → Cache et sessions Redis (port 6379)
├── backend        → API Laravel (port 8000)
└── frontend       → Dashboard React (port 5173)
```

## 🔧 Configuration Avancée

### Modifier les ports

Éditez le fichier `.env` à la racine :

```env
BACKEND_PORT=8000
FRONTEND_PORT=5173
DB_PORT=3306
REDIS_PORT=6379
```

### Accéder à MySQL depuis l'extérieur

```bash
# Host: localhost
# Port: 3306 (ou celui défini dans .env)
# User: alertsec (ou celui défini dans .env)
# Password: password (ou celui défini dans .env)
# Database: alertsec
```

### Accéder à Redis depuis l'extérieur

```bash
# Host: localhost
# Port: 6379 (ou celui défini dans .env)
```

## 🐛 Dépannage

### Les services ne démarrent pas

1. Vérifiez que les ports ne sont pas déjà utilisés :
```bash
# Windows
netstat -ano | findstr :8000
netstat -ano | findstr :5173

# Linux/Mac
lsof -i :8000
lsof -i :5173
```

2. Vérifiez les logs :
```bash
docker-compose logs
```

### Erreur de permissions (Linux/Mac)

```bash
# Donner les permissions au dossier storage
sudo chmod -R 775 BackendAlertsec/storage
sudo chmod -R 775 BackendAlertsec/bootstrap/cache
```

### Réinitialiser complètement

```bash
# Arrêter et supprimer tout
docker-compose down -v

# Supprimer les images
docker-compose down --rmi all

# Reconstruire depuis zéro
docker-compose up -d --build --force-recreate
```

### Le backend ne se connecte pas à MySQL

Vérifiez que le service MySQL est démarré et sain :
```bash
docker-compose ps
```

Attendez que MySQL soit complètement démarré (peut prendre 30-60 secondes au premier lancement).

## 📝 Notes Importantes

1. **Premier lancement** : Le premier `docker-compose up` peut prendre plusieurs minutes car il doit :
   - Télécharger les images Docker
   - Installer toutes les dépendances
   - Créer la base de données
   - Exécuter les migrations et seeders

2. **Volumes persistants** : Les données de MySQL et Redis sont stockées dans des volumes Docker, elles persistent même si vous supprimez les conteneurs (sauf si vous utilisez `docker-compose down -v`).

3. **Modifications de code** : Les modifications de code sont reflétées en temps réel grâce aux volumes montés. Pas besoin de reconstruire les images à chaque modification.

4. **Hot reload** : Le frontend et le backend supportent le hot reload, vos modifications sont prises en compte automatiquement.

## 🚀 Déploiement en Production

Pour la production, vous devrez :

1. Modifier `APP_ENV=production` et `APP_DEBUG=false` dans `.env`
2. Générer une nouvelle clé d'application : `docker-compose exec backend php artisan key:generate`
3. Optimiser l'application : `docker-compose exec backend php artisan config:cache`
4. Construire le frontend : `docker-compose exec frontend npm run build`
5. Utiliser un serveur web (Nginx/Apache) au lieu de `php artisan serve`

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs : `docker-compose logs`
2. Vérifiez que tous les services sont démarrés : `docker-compose ps`
3. Consultez la documentation Laravel et Vite
4. Vérifiez que Docker et Docker Compose sont à jour

---

**Bon développement ! 🎉**


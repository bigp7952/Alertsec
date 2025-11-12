#!/bin/bash
# Script de démarrage Docker pour AlertSec
# Usage: ./start-docker.sh

echo "🚀 Démarrage d'AlertSec avec Docker..."
echo ""

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez installer Docker."
    exit 1
fi

# Vérifier si Docker Compose est disponible
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé."
    exit 1
fi

# Créer le fichier .env s'il n'existe pas
if [ ! -f ".env" ]; then
    echo "📝 Création du fichier .env..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
    else
        cat > .env << EOF
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
EOF
    fi
fi

# Créer les fichiers .env.example dans les sous-dossiers si nécessaire
if [ ! -f "BackendAlertsec/.env.example" ]; then
    echo "📝 Création de BackendAlertsec/.env.example..."
    cat > BackendAlertsec/.env.example << EOF
APP_NAME=AlertSec
APP_ENV=local
APP_KEY=
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
EOF
fi

if [ ! -f "Admin-Forces-de_Lordre/vigil-alert-hub/.env.example" ]; then
    echo "📝 Création de Admin-Forces-de_Lordre/vigil-alert-hub/.env.example..."
    echo "VITE_API_BASE_URL=http://localhost:8000/api" > Admin-Forces-de_Lordre/vigil-alert-hub/.env.example
fi

echo "🔨 Construction et démarrage des conteneurs..."
echo ""

# Utiliser docker compose ou docker-compose selon ce qui est disponible
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

# Construire et démarrer les services
$DOCKER_COMPOSE up -d --build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Services démarrés avec succès !"
    echo ""
    echo "📊 Accès aux services :"
    echo "   - Frontend (Dashboard): http://localhost:5173"
    echo "   - Backend API: http://localhost:8000"
    echo "   - MySQL: localhost:3306"
    echo "   - Redis: localhost:6379"
    echo ""
    echo "🔐 Comptes de test :"
    echo "   - Admin: admin@alertsec.com / password"
    echo "   - Superviseur: superviseur1@alertsec.com / password"
    echo "   - Agent: agent1@alertsec.com / password"
    echo ""
    echo "📋 Pour voir les logs : $DOCKER_COMPOSE logs -f"
    echo "🛑 Pour arrêter : $DOCKER_COMPOSE down"
else
    echo ""
    echo "❌ Erreur lors du démarrage. Vérifiez les logs avec : $DOCKER_COMPOSE logs"
    exit 1
fi


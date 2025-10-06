#!/bin/bash

# 🚀 Script d'installation AlertSec Backend
# Ce script automatise l'installation du backend Laravel

echo "🚀 Installation du Backend AlertSec..."
echo "=================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Vérifier si PHP est installé
print_step "Vérification des prérequis..."
if ! command -v php &> /dev/null; then
    print_error "PHP n'est pas installé. Veuillez installer PHP 8.1 ou supérieur."
    exit 1
fi

PHP_VERSION=$(php -r "echo PHP_VERSION;")
print_message "PHP version: $PHP_VERSION"

# Vérifier si Composer est installé
if ! command -v composer &> /dev/null; then
    print_error "Composer n'est pas installé. Veuillez installer Composer."
    exit 1
fi

print_message "Composer détecté"

# Vérifier si MySQL est installé
if ! command -v mysql &> /dev/null; then
    print_warning "MySQL n'est pas détecté. Assurez-vous que MySQL est installé et en cours d'exécution."
fi

# Installation des dépendances
print_step "Installation des dépendances Composer..."
composer install --no-dev --optimize-autoloader

if [ $? -ne 0 ]; then
    print_error "Échec de l'installation des dépendances Composer"
    exit 1
fi

print_message "Dépendances Composer installées"

# Configuration de l'environnement
print_step "Configuration de l'environnement..."

if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        print_message "Fichier .env créé à partir de .env.example"
    else
        print_error "Fichier .env.example non trouvé"
        exit 1
    fi
else
    print_message "Fichier .env existe déjà"
fi

# Générer la clé d'application
print_step "Génération de la clé d'application..."
php artisan key:generate

if [ $? -ne 0 ]; then
    print_error "Échec de la génération de la clé d'application"
    exit 1
fi

print_message "Clé d'application générée"

# Configuration des permissions
print_step "Configuration des permissions..."
chmod -R 775 storage bootstrap/cache
print_message "Permissions configurées"

# Demander les informations de base de données
print_step "Configuration de la base de données..."

echo ""
echo "Veuillez configurer votre base de données MySQL :"
echo ""

read -p "Nom de la base de données [alertsec]: " DB_NAME
DB_NAME=${DB_NAME:-alertsec}

read -p "Nom d'utilisateur MySQL [root]: " DB_USER
DB_USER=${DB_USER:-root}

read -s -p "Mot de passe MySQL: " DB_PASSWORD
echo ""

read -p "Hôte MySQL [127.0.0.1]: " DB_HOST
DB_HOST=${DB_HOST:-127.0.0.1}

read -p "Port MySQL [3306]: " DB_PORT
DB_PORT=${DB_PORT:-3306}

# Mettre à jour le fichier .env
print_step "Mise à jour de la configuration de base de données..."

sed -i "s/DB_DATABASE=.*/DB_DATABASE=$DB_NAME/" .env
sed -i "s/DB_USERNAME=.*/DB_USERNAME=$DB_USER/" .env
sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" .env
sed -i "s/DB_HOST=.*/DB_HOST=$DB_HOST/" .env
sed -i "s/DB_PORT=.*/DB_PORT=$DB_PORT/" .env

print_message "Configuration de base de données mise à jour"

# Tester la connexion à la base de données
print_step "Test de la connexion à la base de données..."
php artisan migrate:status &> /dev/null

if [ $? -ne 0 ]; then
    print_warning "Impossible de se connecter à la base de données"
    print_message "Création de la base de données..."
    
    mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;" 2>/dev/null
    
    if [ $? -ne 0 ]; then
        print_error "Impossible de créer la base de données. Veuillez vérifier vos paramètres."
        exit 1
    fi
    
    print_message "Base de données créée"
fi

# Exécuter les migrations
print_step "Exécution des migrations..."
php artisan migrate --force

if [ $? -ne 0 ]; then
    print_error "Échec des migrations"
    exit 1
fi

print_message "Migrations exécutées avec succès"

# Charger les données de test
print_step "Chargement des données de test..."

read -p "Voulez-vous charger les données de test ? (y/n) [y]: " LOAD_SEED
LOAD_SEED=${LOAD_SEED:-y}

if [[ $LOAD_SEED =~ ^[Yy]$ ]]; then
    php artisan db:seed --force
    
    if [ $? -ne 0 ]; then
        print_error "Échec du chargement des données de test"
        exit 1
    fi
    
    print_message "Données de test chargées"
    
    echo ""
    echo "📋 Comptes de test créés :"
    echo "=========================="
    echo "Admin: admin@alertsec.com / password"
    echo "Superviseur: superviseur1@alertsec.com / password"
    echo "Agent: agent1@alertsec.com / password"
    echo "Citoyen: citoyen1@alertsec.com / password"
    echo ""
fi

# Optimiser l'application
print_step "Optimisation de l'application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

print_message "Application optimisée"

# Créer un script de démarrage
print_step "Création du script de démarrage..."
cat > start.sh << 'EOF'
#!/bin/bash
echo "🚀 Démarrage du serveur AlertSec Backend..."
echo "==========================================="
echo ""
echo "Le serveur sera accessible à l'adresse :"
echo "http://localhost:8000"
echo ""
echo "API Documentation :"
echo "http://localhost:8000/api/health"
echo ""
echo "Pour arrêter le serveur, appuyez sur Ctrl+C"
echo ""

php artisan serve --host=0.0.0.0 --port=8000
EOF

chmod +x start.sh
print_message "Script de démarrage créé (start.sh)"

# Installation terminée
echo ""
echo "🎉 Installation terminée avec succès !"
echo "====================================="
echo ""
echo "📋 Prochaines étapes :"
echo "1. Vérifiez la configuration dans le fichier .env"
echo "2. Lancez le serveur avec : ./start.sh"
echo "3. Testez l'API : http://localhost:8000/api/health"
echo "4. Consultez la documentation : INSTALLATION.md"
echo ""
echo "🔐 Comptes de test (si chargés) :"
echo "- Admin: admin@alertsec.com / password"
echo "- Superviseur: superviseur1@alertsec.com / password"
echo "- Agent: agent1@alertsec.com / password"
echo "- Citoyen: citoyen1@alertsec.com / password"
echo ""
echo "📞 Support : Consultez INSTALLATION.md pour plus d'informations"
echo ""

# Proposer de démarrer le serveur
read -p "Voulez-vous démarrer le serveur maintenant ? (y/n) [n]: " START_SERVER
START_SERVER=${START_SERVER:-n}

if [[ $START_SERVER =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Démarrage du serveur..."
    ./start.sh
fi






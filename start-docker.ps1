# Script de démarrage Docker pour AlertSec
# Usage: .\start-docker.ps1

Write-Host "🚀 Démarrage d'AlertSec avec Docker..." -ForegroundColor Green
Write-Host ""

# Vérifier si Docker est installé
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker n'est pas installé. Veuillez installer Docker Desktop." -ForegroundColor Red
    exit 1
}

# Vérifier si Docker Compose est disponible
if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose n'est pas installé." -ForegroundColor Red
    exit 1
}

# Créer le fichier .env s'il n'existe pas
if (-not (Test-Path ".env")) {
    Write-Host "📝 Création du fichier .env..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env" -ErrorAction SilentlyContinue
    if (-not (Test-Path ".env")) {
        Write-Host "⚠️  Le fichier .env.example n'existe pas. Création d'un fichier .env par défaut..." -ForegroundColor Yellow
        @"
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
"@ | Out-File -FilePath ".env" -Encoding utf8
    }
}

# Créer les fichiers .env.example dans les sous-dossiers si nécessaire
if (-not (Test-Path "BackendAlertsec\.env.example")) {
    Write-Host "📝 Création de BackendAlertsec\.env.example..." -ForegroundColor Yellow
    @"
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
"@ | Out-File -FilePath "BackendAlertsec\.env.example" -Encoding utf8
}

if (-not (Test-Path "Admin-Forces-de_Lordre\vigil-alert-hub\.env.example")) {
    Write-Host "📝 Création de Admin-Forces-de_Lordre\vigil-alert-hub\.env.example..." -ForegroundColor Yellow
    "VITE_API_BASE_URL=http://localhost:8000/api" | Out-File -FilePath "Admin-Forces-de_Lordre\vigil-alert-hub\.env.example" -Encoding utf8
}

Write-Host "🔨 Construction et démarrage des conteneurs..." -ForegroundColor Cyan
Write-Host ""

# Construire et démarrer les services
docker-compose up -d --build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Services démarrés avec succès !" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Accès aux services :" -ForegroundColor Cyan
    Write-Host "   - Frontend (Dashboard): http://localhost:5173" -ForegroundColor White
    Write-Host "   - Backend API: http://localhost:8000" -ForegroundColor White
    Write-Host "   - MySQL: localhost:3306" -ForegroundColor White
    Write-Host "   - Redis: localhost:6379" -ForegroundColor White
    Write-Host ""
    Write-Host "🔐 Comptes de test :" -ForegroundColor Cyan
    Write-Host "   - Admin: admin@alertsec.com / password" -ForegroundColor White
    Write-Host "   - Superviseur: superviseur1@alertsec.com / password" -ForegroundColor White
    Write-Host "   - Agent: agent1@alertsec.com / password" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 Pour voir les logs : docker-compose logs -f" -ForegroundColor Yellow
    Write-Host "🛑 Pour arrêter : docker-compose down" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "❌ Erreur lors du démarrage. Vérifiez les logs avec : docker-compose logs" -ForegroundColor Red
    exit 1
}


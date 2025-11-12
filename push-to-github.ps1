# Script pour pousser le projet AlertSec sur GitHub
# Usage: .\push-to-github.ps1

Write-Host "🚀 Préparation pour GitHub..." -ForegroundColor Green
Write-Host ""

# Vérifier si Git est installé
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git n'est pas installé. Veuillez installer Git." -ForegroundColor Red
    Write-Host "Téléchargez Git depuis: https://git-scm.com/" -ForegroundColor Yellow
    exit 1
}

# Vérifier si Git est initialisé
if (-not (Test-Path ".git")) {
    Write-Host "📦 Initialisation de Git..." -ForegroundColor Cyan
    git init
    
    # Configurer Git si nécessaire
    $gitName = git config --global user.name
    $gitEmail = git config --global user.email
    
    if (-not $gitName) {
        Write-Host "⚠️  Git n'est pas configuré. Veuillez configurer votre nom et email:" -ForegroundColor Yellow
        Write-Host "   git config --global user.name 'Votre Nom'" -ForegroundColor White
        Write-Host "   git config --global user.email 'votre.email@example.com'" -ForegroundColor White
        Write-Host ""
        $continue = Read-Host "Voulez-vous continuer quand même? (o/n)"
        if ($continue -ne "o" -and $continue -ne "O") {
            exit 1
        }
    }
}

# Vérifier le statut
Write-Host "📋 Vérification des fichiers..." -ForegroundColor Cyan
git status --short

Write-Host ""
Write-Host "➕ Ajout des fichiers..." -ForegroundColor Cyan
git add .

# Vérifier s'il y a des changements à committer
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "✅ Aucun changement à committer." -ForegroundColor Green
} else {
    Write-Host "💾 Création du commit initial..." -ForegroundColor Cyan
    git commit -m "Initial commit: Projet AlertSec complet

- Backend Laravel avec API REST complète (60+ endpoints)
- Frontend React avec dashboard admin professionnel
- Application mobile Expo pour agents et citoyens
- Configuration Docker complète avec docker-compose
- Documentation complète (README, SETUP, GUIDE)
- Scripts d'automatisation pour Windows et Linux/Mac
- Système de gestion d'alertes et de sécurité pour forces de l'ordre

Fonctionnalités:
- Authentification multi-rôles (Admin, Superviseur, Agent, Citoyen)
- Gestion des signalements avec géolocalisation
- Tracking GPS en temps réel des agents
- Zones de danger calculées automatiquement
- Système de communications et notifications
- Upload de médias (photos, vidéos, audios)
- Dashboard avec statistiques et analytics"

    Write-Host "✅ Commit créé avec succès!" -ForegroundColor Green
}

Write-Host ""
Write-Host "📤 Instructions pour pousser sur GitHub:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Créez un nouveau dépôt sur GitHub:" -ForegroundColor White
Write-Host "   https://github.com/new" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Ajoutez le remote (remplacez par votre URL):" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/votre-username/AlertSec.git" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Poussez le code:" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Si votre branche s'appelle 'master':" -ForegroundColor White
Write-Host "   git branch -M main" -ForegroundColor Cyan
Write-Host "   git push -u origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 Pour plus de détails, consultez: GITHUB_SETUP.md" -ForegroundColor Yellow
Write-Host ""


#!/bin/bash
# Script pour pousser le projet AlertSec sur GitHub
# Usage: ./push-to-github.sh

echo "🚀 Préparation pour GitHub..."
echo ""

# Vérifier si Git est installé
if ! command -v git &> /dev/null; then
    echo "❌ Git n'est pas installé. Veuillez installer Git."
    echo "Téléchargez Git depuis: https://git-scm.com/"
    exit 1
fi

# Vérifier si Git est initialisé
if [ ! -d ".git" ]; then
    echo "📦 Initialisation de Git..."
    git init
    
    # Configurer Git si nécessaire
    GIT_NAME=$(git config --global user.name)
    GIT_EMAIL=$(git config --global user.email)
    
    if [ -z "$GIT_NAME" ] || [ -z "$GIT_EMAIL" ]; then
        echo "⚠️  Git n'est pas configuré. Veuillez configurer votre nom et email:"
        echo "   git config --global user.name 'Votre Nom'"
        echo "   git config --global user.email 'votre.email@example.com'"
        echo ""
        read -p "Voulez-vous continuer quand même? (o/n) " continue
        if [ "$continue" != "o" ] && [ "$continue" != "O" ]; then
            exit 1
        fi
    fi
fi

# Vérifier le statut
echo "📋 Vérification des fichiers..."
git status --short

echo ""
echo "➕ Ajout des fichiers..."
git add .

# Vérifier s'il y a des changements à committer
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ Aucun changement à committer."
else
    echo "💾 Création du commit initial..."
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

    echo "✅ Commit créé avec succès!"
fi

echo ""
echo "📤 Instructions pour pousser sur GitHub:"
echo ""
echo "1. Créez un nouveau dépôt sur GitHub:"
echo "   https://github.com/new"
echo ""
echo "2. Ajoutez le remote (remplacez par votre URL):"
echo "   git remote add origin https://github.com/votre-username/AlertSec.git"
echo ""
echo "3. Poussez le code:"
echo "   git push -u origin main"
echo ""
echo "   Si votre branche s'appelle 'master':"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "📖 Pour plus de détails, consultez: GITHUB_SETUP.md"
echo ""


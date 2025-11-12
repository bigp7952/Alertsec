#!/bin/bash
# Script de réorganisation du projet AlertSec
# Usage: ./scripts/reorganize-project.sh

echo "🔄 Réorganisation du projet AlertSec..."
echo ""

# Créer la structure de dossiers
echo "📁 Création de la structure de dossiers..."

mkdir -p docs/{architecture,api,deployment,development,user-guides}
mkdir -p .github/{workflows,ISSUE_TEMPLATE}
mkdir -p scripts

echo "  ✓ Structure créée"

# Fonction pour déplacer un fichier
move_doc() {
    local source=$1
    local dest=$2
    if [ -f "$source" ]; then
        cp "$source" "$dest"
        echo "  ✓ Déplacé: $source -> $dest"
    fi
}

# Déplacer la documentation du backend
echo ""
echo "📚 Organisation de la documentation backend..."

move_doc "BackendAlertsec/BACKEND_COMPLET.md" "docs/architecture/backend-complete.md"
move_doc "BackendAlertsec/INSTALLATION.md" "docs/deployment/backend-installation.md"
move_doc "BackendAlertsec/INTEGRATION_COMPLETE.md" "docs/development/backend-integration.md"
move_doc "BackendAlertsec/TEST_CONNEXION_DASHBOARD.md" "docs/development/backend-test-connection.md"
move_doc "BackendAlertsec/TEST_LOGIN_DASHBOARD.md" "docs/development/backend-test-login.md"
move_doc "BackendAlertsec/CORRECTION_ERREUR_USE_AUTH.md" "docs/development/backend-auth-correction.md"
move_doc "BackendAlertsec/CORRECTION_ERROR_PROTECTEDROUTE.md" "docs/development/backend-route-correction.md"

# Déplacer la documentation du frontend
echo ""
echo "📚 Organisation de la documentation frontend..."

move_doc "Admin-Forces-de_Lordre/vigil-alert-hub/GUIDE_FINAL.md" "docs/user-guides/frontend-guide.md"
move_doc "Admin-Forces-de_Lordre/vigil-alert-hub/GUIDE_CONNEXION.md" "docs/development/frontend-connection.md"
move_doc "Admin-Forces-de_Lordre/vigil-alert-hub/GUIDE_OTP.md" "docs/development/frontend-otp.md"
move_doc "Admin-Forces-de_Lordre/vigil-alert-hub/TEST_CONNEXION.md" "docs/development/frontend-test-connection.md"
move_doc "Admin-Forces-de_Lordre/vigil-alert-hub/COMPLETION_ZONES_TRACKING.md" "docs/development/frontend-zones-tracking.md"
move_doc "Admin-Forces-de_Lordre/vigil-alert-hub/CORRECTIONS_DASHBOARD.md" "docs/development/frontend-dashboard-corrections.md"
move_doc "Admin-Forces-de_Lordre/vigil-alert-hub/CORRECTIONS_FINALES.md" "docs/development/frontend-final-corrections.md"
move_doc "Admin-Forces-de_Lordre/vigil-alert-hub/PHASE1_AMELIORATIONS.md" "docs/development/frontend-phase1-improvements.md"
move_doc "Admin-Forces-de_Lordre/vigil-alert-hub/HARMONISATION_COULEURS.md" "docs/development/frontend-color-harmonization.md"
move_doc "Admin-Forces-de_Lordre/vigil-alert-hub/INTEGRATION_LOGO_ALERTSEC.md" "docs/development/frontend-logo-integration.md"
move_doc "Admin-Forces-de_Lordre/vigil-alert-hub/TAILLES_LOGO_MISES_A_JOUR.md" "docs/development/frontend-logo-sizes.md"
move_doc "Admin-Forces-de_Lordre/vigil-alert-hub/MIGRATION_VERS_MOCK.md" "docs/development/frontend-mock-migration.md"
move_doc "Admin-Forces-de_Lordre/vigil-alert-hub/ACTIONS_ZONES_DANGER.md" "docs/development/frontend-danger-zones.md"

# Déplacer la documentation mobile
echo ""
echo "📚 Organisation de la documentation mobile..."
move_doc "Applis/AlerteSec/GUIDE_AUTHENTIFICATION.md" "docs/development/mobile-authentication.md"

# Déplacer DOCKER_README.md
move_doc "DOCKER_README.md" "docs/deployment/docker-guide.md"

echo ""
echo "✅ Réorganisation terminée !"
echo ""
echo "⚠️  Note: Les fichiers originaux n'ont pas été supprimés."
echo "   Vous pouvez les supprimer manuellement après vérification."


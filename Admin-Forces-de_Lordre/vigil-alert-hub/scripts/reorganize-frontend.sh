#!/bin/bash
# Script de réorganisation du frontend
# Usage: ./scripts/reorganize-frontend.sh

echo "🔄 Réorganisation du frontend AlertSec..."
echo ""

BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$BASE_DIR" || exit 1

# Créer la structure de dossiers
echo "📁 Création de la structure de dossiers..."

mkdir -p docs scripts

echo "  ✓ Structure créée"

# Fonction pour déplacer un fichier
move_file() {
    local source=$1
    local dest=$2
    if [ -f "$source" ]; then
        mv "$source" "$dest"
        echo "  ✓ Déplacé: $(basename $source) -> $dest"
    fi
}

# Déplacer tous les fichiers .md (sauf README.md) dans docs/
echo ""
echo "📚 Organisation de la documentation..."

MD_FILES=(
    "ACTIONS_ZONES_DANGER.md"
    "COMPLETION_ZONES_TRACKING.md"
    "CORRECTIONS_DASHBOARD.md"
    "CORRECTIONS_FINALES.md"
    "GUIDE_CONNEXION.md"
    "GUIDE_FINAL.md"
    "GUIDE_OTP.md"
    "HARMONISATION_COULEURS.md"
    "INTEGRATION_LOGO_ALERTSEC.md"
    "MIGRATION_VERS_MOCK.md"
    "PHASE1_AMELIORATIONS.md"
    "TAILLES_LOGO_MISES_A_JOUR.md"
    "TEST_CONNEXION.md"
)

for file in "${MD_FILES[@]}"; do
    move_file "$file" "docs/$file"
done

# Déplacer les fichiers de test dans scripts/
echo ""
echo "🧪 Organisation des scripts de test..."

if [ -f "test-connexion.js" ]; then
    move_file "test-connexion.js" "scripts/test-connexion.js"
fi

# Vérifier le dossier server
if [ -d "server" ] && [ -z "$(ls -A server 2>/dev/null)" ]; then
    echo ""
    echo "📁 Dossier 'server' vide détecté (peut être supprimé si inutilisé)"
fi

echo ""
echo "✅ Réorganisation terminée !"
echo ""
echo "📋 Structure finale :"
echo "  - docs/          : Documentation (.md)"
echo "  - scripts/       : Scripts de test"
echo "  - src/           : Code source"
echo "  - public/        : Fichiers publics"
echo "  - dist/          : Build de production"
echo "  - README.md      : Documentation principale (conservé à la racine)"


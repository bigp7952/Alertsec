# Script de réorganisation du frontend
# Usage: .\scripts\reorganize-frontend.ps1

Write-Host "🔄 Réorganisation du frontend AlertSec..." -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"
$basePath = $PSScriptRoot

# Créer la structure de dossiers
Write-Host "📁 Création de la structure de dossiers..." -ForegroundColor Yellow

$dirs = @(
    "docs",
    "scripts"
)

foreach ($dir in $dirs) {
    $fullPath = Join-Path $basePath $dir
    if (-not (Test-Path $fullPath)) {
        New-Item -ItemType Directory -Force -Path $fullPath | Out-Null
        Write-Host "  ✓ Créé: $dir" -ForegroundColor Green
    }
}

# Déplacer tous les fichiers .md (sauf README.md) dans docs/
Write-Host "`n📚 Organisation de la documentation..." -ForegroundColor Yellow
$mdFiles = @(
    "ACTIONS_ZONES_DANGER.md",
    "COMPLETION_ZONES_TRACKING.md",
    "CORRECTIONS_DASHBOARD.md",
    "CORRECTIONS_FINALES.md",
    "GUIDE_CONNEXION.md",
    "GUIDE_FINAL.md",
    "GUIDE_OTP.md",
    "HARMONISATION_COULEURS.md",
    "INTEGRATION_LOGO_ALERTSEC.md",
    "MIGRATION_VERS_MOCK.md",
    "PHASE1_AMELIORATIONS.md",
    "TAILLES_LOGO_MISES_A_JOUR.md",
    "TEST_CONNEXION.md"
)

foreach ($file in $mdFiles) {
    $source = Join-Path $basePath $file
    if (Test-Path $source) {
        $dest = Join-Path $basePath "docs" $file
        Move-Item $source $dest -Force
        Write-Host "  ✓ Déplacé: $file -> docs/$file" -ForegroundColor Green
    }
}

# Déplacer les fichiers de test dans scripts/
Write-Host "`n🧪 Organisation des scripts de test..." -ForegroundColor Yellow
$testFiles = @(
    "test-connexion.js"
)

foreach ($file in $testFiles) {
    $source = Join-Path $basePath $file
    if (Test-Path $source) {
        $dest = Join-Path $basePath "scripts" $file
        Move-Item $source $dest -Force
        Write-Host "  ✓ Déplacé: $file -> scripts/$file" -ForegroundColor Green
    }
}

# Vérifier s'il y a un dossier server vide ou inutilisé
if (Test-Path (Join-Path $basePath "server")) {
    $serverFiles = Get-ChildItem (Join-Path $basePath "server") -ErrorAction SilentlyContinue
    if ($null -eq $serverFiles -or $serverFiles.Count -eq 0) {
        Write-Host "`n📁 Dossier 'server' vide détecté (peut être supprimé si inutilisé)" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ Réorganisation terminée !" -ForegroundColor Green
Write-Host "`n📋 Structure finale :" -ForegroundColor Cyan
Write-Host "  - docs/          : Documentation (.md)" -ForegroundColor White
Write-Host "  - scripts/        : Scripts de test" -ForegroundColor White
Write-Host "  - src/            : Code source" -ForegroundColor White
Write-Host "  - public/         : Fichiers publics" -ForegroundColor White
Write-Host "  - dist/           : Build de production" -ForegroundColor White
Write-Host "  - README.md       : Documentation principale (conservé à la racine)" -ForegroundColor White


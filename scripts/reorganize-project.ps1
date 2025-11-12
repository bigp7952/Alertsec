# Script de réorganisation du projet AlertSec
# Usage: .\scripts\reorganize-project.ps1

Write-Host "🔄 Réorganisation du projet AlertSec..." -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# Créer la structure de dossiers
Write-Host "📁 Création de la structure de dossiers..." -ForegroundColor Yellow

$dirs = @(
    "docs\architecture",
    "docs\api",
    "docs\deployment",
    "docs\development",
    "docs\user-guides",
    ".github\workflows",
    ".github\ISSUE_TEMPLATE"
)

foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
        Write-Host "  ✓ Créé: $dir" -ForegroundColor Green
    }
}

# Déplacer la documentation du backend
Write-Host "`n📚 Organisation de la documentation backend..." -ForegroundColor Yellow
$backendDocs = @(
    @{Source = "BackendAlertsec\BACKEND_COMPLET.md"; Dest = "docs\architecture\backend-complete.md"},
    @{Source = "BackendAlertsec\INSTALLATION.md"; Dest = "docs\deployment\backend-installation.md"},
    @{Source = "BackendAlertsec\INTEGRATION_COMPLETE.md"; Dest = "docs\development\backend-integration.md"},
    @{Source = "BackendAlertsec\TEST_CONNEXION_DASHBOARD.md"; Dest = "docs\development\backend-test-connection.md"},
    @{Source = "BackendAlertsec\TEST_LOGIN_DASHBOARD.md"; Dest = "docs\development\backend-test-login.md"},
    @{Source = "BackendAlertsec\CORRECTION_ERREUR_USE_AUTH.md"; Dest = "docs\development\backend-auth-correction.md"},
    @{Source = "BackendAlertsec\CORRECTION_ERROR_PROTECTEDROUTE.md"; Dest = "docs\development\backend-route-correction.md"}
)

foreach ($doc in $backendDocs) {
    if (Test-Path $doc.Source) {
        Copy-Item $doc.Source $doc.Dest -Force
        Write-Host "  ✓ Déplacé: $($doc.Source) -> $($doc.Dest)" -ForegroundColor Green
    }
}

# Déplacer la documentation du frontend
Write-Host "`n📚 Organisation de la documentation frontend..." -ForegroundColor Yellow
$frontendDocs = @(
    @{Source = "Admin-Forces-de_Lordre\vigil-alert-hub\GUIDE_FINAL.md"; Dest = "docs\user-guides\frontend-guide.md"},
    @{Source = "Admin-Forces-de_Lordre\vigil-alert-hub\GUIDE_CONNEXION.md"; Dest = "docs\development\frontend-connection.md"},
    @{Source = "Admin-Forces-de_Lordre\vigil-alert-hub\GUIDE_OTP.md"; Dest = "docs\development\frontend-otp.md"},
    @{Source = "Admin-Forces-de_Lordre\vigil-alert-hub\TEST_CONNEXION.md"; Dest = "docs\development\frontend-test-connection.md"},
    @{Source = "Admin-Forces-de_Lordre\vigil-alert-hub\COMPLETION_ZONES_TRACKING.md"; Dest = "docs\development\frontend-zones-tracking.md"},
    @{Source = "Admin-Forces-de_Lordre\vigil-alert-hub\CORRECTIONS_DASHBOARD.md"; Dest = "docs\development\frontend-dashboard-corrections.md"},
    @{Source = "Admin-Forces-de_Lordre\vigil-alert-hub\CORRECTIONS_FINALES.md"; Dest = "docs\development\frontend-final-corrections.md"},
    @{Source = "Admin-Forces-de_Lordre\vigil-alert-hub\PHASE1_AMELIORATIONS.md"; Dest = "docs\development\frontend-phase1-improvements.md"},
    @{Source = "Admin-Forces-de_Lordre\vigil-alert-hub\HARMONISATION_COULEURS.md"; Dest = "docs\development\frontend-color-harmonization.md"},
    @{Source = "Admin-Forces-de_Lordre\vigil-alert-hub\INTEGRATION_LOGO_ALERTSEC.md"; Dest = "docs\development\frontend-logo-integration.md"},
    @{Source = "Admin-Forces-de_Lordre\vigil-alert-hub\TAILLES_LOGO_MISES_A_JOUR.md"; Dest = "docs\development\frontend-logo-sizes.md"},
    @{Source = "Admin-Forces-de_Lordre\vigil-alert-hub\MIGRATION_VERS_MOCK.md"; Dest = "docs\development\frontend-mock-migration.md"},
    @{Source = "Admin-Forces-de_Lordre\vigil-alert-hub\ACTIONS_ZONES_DANGER.md"; Dest = "docs\development\frontend-danger-zones.md"}
)

foreach ($doc in $frontendDocs) {
    if (Test-Path $doc.Source) {
        Copy-Item $doc.Source $doc.Dest -Force
        Write-Host "  ✓ Déplacé: $($doc.Source) -> $($doc.Dest)" -ForegroundColor Green
    }
}

# Déplacer la documentation mobile
Write-Host "`n📚 Organisation de la documentation mobile..." -ForegroundColor Yellow
if (Test-Path "Applis\AlerteSec\GUIDE_AUTHENTIFICATION.md") {
    Copy-Item "Applis\AlerteSec\GUIDE_AUTHENTIFICATION.md" "docs\development\mobile-authentication.md" -Force
    Write-Host "  ✓ Déplacé: GUIDE_AUTHENTIFICATION.md" -ForegroundColor Green
}

# Déplacer DOCKER_README.md
if (Test-Path "DOCKER_README.md") {
    Copy-Item "DOCKER_README.md" "docs\deployment\docker-guide.md" -Force
    Write-Host "  ✓ Déplacé: DOCKER_README.md -> docs\deployment\docker-guide.md" -ForegroundColor Green
}

Write-Host "`n✅ Réorganisation terminée !" -ForegroundColor Green
Write-Host "`n⚠️  Note: Les fichiers originaux n'ont pas été supprimés." -ForegroundColor Yellow
Write-Host "   Vous pouvez les supprimer manuellement après vérification." -ForegroundColor Yellow


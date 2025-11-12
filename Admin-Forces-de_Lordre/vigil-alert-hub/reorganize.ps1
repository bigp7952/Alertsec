# Script simple de réorganisation - À exécuter depuis la racine du frontend
# Usage: .\reorganize.ps1

$files = @(
    @{Source = "ACTIONS_ZONES_DANGER.md"; Dest = "docs\ACTIONS_ZONES_DANGER.md"},
    @{Source = "COMPLETION_ZONES_TRACKING.md"; Dest = "docs\COMPLETION_ZONES_TRACKING.md"},
    @{Source = "CORRECTIONS_DASHBOARD.md"; Dest = "docs\CORRECTIONS_DASHBOARD.md"},
    @{Source = "CORRECTIONS_FINALES.md"; Dest = "docs\CORRECTIONS_FINALES.md"},
    @{Source = "GUIDE_CONNEXION.md"; Dest = "docs\GUIDE_CONNEXION.md"},
    @{Source = "GUIDE_FINAL.md"; Dest = "docs\GUIDE_FINAL.md"},
    @{Source = "GUIDE_OTP.md"; Dest = "docs\GUIDE_OTP.md"},
    @{Source = "HARMONISATION_COULEURS.md"; Dest = "docs\HARMONISATION_COULEURS.md"},
    @{Source = "INTEGRATION_LOGO_ALERTSEC.md"; Dest = "docs\INTEGRATION_LOGO_ALERTSEC.md"},
    @{Source = "MIGRATION_VERS_MOCK.md"; Dest = "docs\MIGRATION_VERS_MOCK.md"},
    @{Source = "PHASE1_AMELIORATIONS.md"; Dest = "docs\PHASE1_AMELIORATIONS.md"},
    @{Source = "TAILLES_LOGO_MISES_A_JOUR.md"; Dest = "docs\TAILLES_LOGO_MISES_A_JOUR.md"},
    @{Source = "TEST_CONNEXION.md"; Dest = "docs\TEST_CONNEXION.md"},
    @{Source = "test-connexion.js"; Dest = "scripts\test-connexion.js"}
)

foreach ($file in $files) {
    if (Test-Path $file.Source) {
        $destDir = Split-Path $file.Dest -Parent
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        Move-Item $file.Source $file.Dest -Force
        Write-Host "✓ Déplacé: $($file.Source) -> $($file.Dest)"
    }
}

Write-Host "`n✅ Réorganisation terminée !"


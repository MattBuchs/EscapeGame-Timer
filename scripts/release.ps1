# Script de Release pour GameMaster OS
# Ce script facilite la création d'une nouvelle version pour distribution locale

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('patch', 'minor', 'major')]
    [string]$VersionType = 'patch'
)

Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   GameMaster OS - Script de Release      ║" -ForegroundColor Cyan
Write-Host "║      Distribution Locale (Web)        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier si des modifications ne sont pas commitées
Write-Host "→ Vérification des modifications Git..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  Attention: Des fichiers ne sont pas commités" -ForegroundColor Red
    Write-Host $gitStatus
    $response = Read-Host "Voulez-vous continuer quand même? (o/N)"
    if ($response -ne "o" -and $response -ne "O") {
        Write-Host "✗ Release annulée" -ForegroundColor Red
        exit 1
    }
}

# 2. Compiler le SASS
Write-Host ""
Write-Host "→ Compilation du SASS..." -ForegroundColor Yellow
npm run compile-sass
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Erreur lors de la compilation SASS" -ForegroundColor Red
    exit 1
}
Write-Host "✓ SASS compilé avec succès" -ForegroundColor Green

# 3. Incrémenter la version
Write-Host ""
Write-Host "→ Incrémentation de la version ($VersionType)..." -ForegroundColor Yellow
$newVersion = npm version $VersionType
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Erreur lors de l'incrémentation de version" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Nouvelle version: $newVersion" -ForegroundColor Green

# 4. Créer le build
Write-Host ""
Write-Host "→ Création du build (cela peut prendre quelques minutes)..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Erreur lors du build" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build créé avec succès" -ForegroundColor Green

# 5. Afficher les fichiers créés
Write-Host ""
Write-Host "→ Fichiers générés dans le dossier dist/:" -ForegroundColor Yellow
Get-ChildItem -Path ".\dist" -File | ForEach-Object {
    $size = [math]::Round($_.Length / 1MB, 2)
    Write-Host "  • $($_.Name) ($size MB)" -ForegroundColor Cyan
}

# 6. Instructions finales
Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          Release terminée !            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Fichier à distribuer:" -ForegroundColor Yellow
$exeFile = Get-ChildItem -Path ".\dist" -Filter "*.exe" | Select-Object -First 1
Write-Host "   → $($exeFile.FullName)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prochaines étapes:" -ForegroundColor Yellow
Write-Host "1. Testez l'installateur (installez sur une autre machine)" -ForegroundColor White
Write-Host "2. Uploadez le fichier .exe sur votre site web" -ForegroundColor White
Write-Host "3. Mettez à jour votre page de téléchargement" -ForegroundColor White
Write-Host "4. Notifiez vos utilisateurs (email, réseaux sociaux)" -ForegroundColor White
Write-Host ""
Write-Host "📋 Guides disponibles:" -ForegroundColor Yellow
Write-Host "   • HEBERGEMENT_WEB.md - Comment héberger sur votre site" -ForegroundColor White
Write-Host "   • INSTALL.md - Instructions pour vos utilisateurs" -ForegroundColor White
Write-Host ""
Write-Host "💡 Conseil: Gardez une copie de l'installateur en backup !" -ForegroundColor Cyan
Write-Host ""

# 📦 Système de Build et Distribution - EscapeTime

## Vue d'ensemble

Le système de build utilise **electron-builder** pour créer un installateur Windows professionnel avec support des mises à jour automatiques via **electron-updater**.

## Architecture

```
EscapeTime/
├── main.js                    # Point d'entrée, initialise l'auto-updater
├── package.json               # Configuration du build
├── src/
│   └── services/
│       └── autoUpdater.js     # Gestion des mises à jour automatiques
├── scripts/
│   └── release.ps1            # Script PowerShell pour faciliter les releases
├── dist/                      # Dossier de sortie (généré)
│   ├── EscapeTime Setup X.X.X.exe
│   └── latest.yml
└── BUILD_GUIDE.md             # Documentation complète
```

## Commandes disponibles

```bash
# Développement
npm start                    # Lancer l'application en mode dev
npm run watch-sass          # Compiler le SASS automatiquement
npm run compile-sass        # Compiler le SASS une fois

# Build
npm run build               # Créer l'installateur Windows
npm run build:dir           # Build sans créer l'installateur (pour tests)
npm run release             # Build de production sans auto-publish

# Gestion de version
npm version patch           # 1.0.0 → 1.0.1
npm version minor           # 1.0.0 → 1.1.0
npm version major           # 1.0.0 → 2.0.0
```

## Processus de release simplifié

### Option 1 : Utiliser le script PowerShell (Recommandé)

```powershell
# Release patch (1.0.0 → 1.0.1)
.\scripts\release.ps1

# Release minor (1.0.0 → 1.1.0)
.\scripts\release.ps1 -VersionType minor

# Release major (1.0.0 → 2.0.0)
.\scripts\release.ps1 -VersionType major
```

Le script fait automatiquement :

1. ✓ Vérifie les modifications Git
2. ✓ Compile le SASS
3. ✓ Incrémente la version
4. ✓ Crée le build
5. ✓ Affiche les fichiers générés

### Option 2 : Manuellement

```bash
# 1. Compiler le SASS
npm run compile-sass

# 2. Incrémenter la version
npm version patch

# 3. Créer le build
npm run build
```

## Configuration du build (package.json)

### Section `build`

```json
{
    "build": {
        "appId": "com.angelsgame.escapetime",
        "productName": "EscapeTime",
        "win": {
            "target": "nsis",
            "icon": "public/img/AngelsGame.ico"
        },
        "nsis": {
            "oneClick": false, // Permet choix du dossier
            "allowToChangeInstallationDirectory": true,
            "createDesktopShortcut": true,
            "createStartMenuShortcut": true,
            "language": "1036" // Français
        },
        "files": [
            "**/*", // Tous les fichiers
            "!**/*.scss", // Sauf les SCSS
            "!dist/**/*" // Sauf dist/
        ],
        "publish": {
            "provider": "generic",
            "url": "https://your-update-server.com/updates"
        }
    }
}
```

### Personnalisation

#### Changer l'icône

```json
"win": {
  "icon": "chemin/vers/votre/icone.ico"
}
```

#### Modifier l'installateur

```json
"nsis": {
  "oneClick": true,                  // Installation en un clic
  "perMachine": true,                // Installation pour tous les utilisateurs
  "runAfterFinish": true             // Lancer après installation
}
```

## Système de mises à jour automatiques

### Comment ça fonctionne

1. **Au démarrage** : L'application vérifie `latest.yml` sur le serveur
2. **Comparaison** : Compare la version distante avec la version locale
3. **Notification** : Si nouvelle version → affiche une boîte de dialogue
4. **Téléchargement** : L'utilisateur peut télécharger la mise à jour
5. **Installation** : Redémarre l'application avec la nouvelle version

### Fichier autoUpdater.js

```javascript
const { autoUpdater } = require("electron-updater");

// Configuration
autoUpdater.autoDownload = false; // Ne pas télécharger automatiquement
autoUpdater.autoInstallOnAppQuit = true; // Installer à la fermeture

// Vérifier les mises à jour
autoUpdater.checkForUpdatesAndNotify();
```

### Événements disponibles

-   `checking-for-update` : Début de vérification
-   `update-available` : Mise à jour trouvée
-   `update-not-available` : Pas de mise à jour
-   `download-progress` : Progression du téléchargement
-   `update-downloaded` : Téléchargement terminé
-   `error` : Erreur

## Distribution

### Option 1 : GitHub Releases (Gratuit, Recommandé)

**Configuration package.json :**

```json
"publish": {
  "provider": "github",
  "owner": "votre-username",
  "repo": "EscapeTime"
}
```

**Étapes :**

1. Créer un repository GitHub
2. Générer un token GitHub (Settings → Developer settings → Personal access tokens)
3. Créer `.env` : `GH_TOKEN=votre_token`
4. Build : `npm run build`
5. Créer une release sur GitHub
6. Upload `EscapeTime Setup X.X.X.exe` et `latest.yml`

**Structure sur GitHub :**

```
Release v1.0.1
├── EscapeTime Setup 1.0.1.exe
└── latest.yml
```

### Option 2 : Serveur Personnel

**Configuration package.json :**

```json
"publish": {
  "provider": "generic",
  "url": "https://votre-domaine.com/updates"
}
```

**Structure sur le serveur :**

```
https://votre-domaine.com/updates/
├── EscapeTime Setup 1.0.0.exe
├── EscapeTime Setup 1.0.1.exe
└── latest.yml                    # Pointe vers la dernière version
```

**latest.yml :**

```yaml
version: 1.0.1
files:
    - url: EscapeTime Setup 1.0.1.exe
      sha512: abc123...
      size: 89456321
path: EscapeTime Setup 1.0.1.exe
releaseDate: "2024-12-31T12:00:00.000Z"
```

### Option 3 : Distribution Locale (Sans mises à jour)

1. Créer le build : `npm run build`
2. Partager uniquement `EscapeTime Setup X.X.X.exe`
3. Les utilisateurs installent manuellement chaque nouvelle version

Pour désactiver les mises à jour automatiques, dans `main.js` :

```javascript
// Commenter ces lignes :
// if (!require('electron-is-dev')) {
//     updater = new AutoUpdater(windows[0]);
//     ...
// }
```

## Sécurité

### Signature de code (Optionnel mais recommandé)

Pour Windows, obtenir un certificat de signature :

1. Acheter un certificat (DigiCert, Sectigo, etc.)
2. Configurer dans package.json :

```json
"win": {
  "certificateFile": "path/to/cert.pfx",
  "certificatePassword": "password"
}
```

Ou utiliser des variables d'environnement :

```bash
set CSC_LINK=path/to/cert.pfx
set CSC_KEY_PASSWORD=password
npm run build
```

## Dépannage

### Le build échoue

**Erreur : "Cannot find module"**

```bash
rm -rf node_modules package-lock.json
npm install
```

**Erreur : "Access denied"**

-   Fermez l'application si elle est ouverte
-   Supprimez le dossier `dist/`
-   Réessayez

### Les mises à jour ne fonctionnent pas

1. **Vérifier l'URL** : `package.json` → `build.publish.url`
2. **Tester l'accès** : Ouvrir l'URL dans un navigateur
3. **Vérifier latest.yml** : Doit être accessible publiquement
4. **Console** : Ouvrir DevTools → Console pour voir les erreurs

### L'installateur ne se lance pas

-   Désactiver temporairement l'antivirus
-   Vérifier que Windows SmartScreen n'a pas bloqué le fichier
-   Signer le code avec un certificat

## Bonnes pratiques

1. **Toujours tester** l'installateur avant distribution
2. **Versionner sémantiquement** : MAJOR.MINOR.PATCH
3. **Garder les anciennes versions** sur le serveur pendant quelques mois
4. **Documenter les changements** dans un fichier CHANGELOG.md
5. **Tester les mises à jour** de version N vers N+1
6. **Sauvegarder** les certificats de signature

## Checklist de release

-   [ ] Code testé et fonctionnel
-   [ ] SASS compilé
-   [ ] Version incrémentée
-   [ ] CHANGELOG.md mis à jour
-   [ ] Build créé sans erreur
-   [ ] Installateur testé (installation + désinstallation)
-   [ ] Mise à jour testée (si applicable)
-   [ ] Fichiers uploadés sur serveur/GitHub
-   [ ] latest.yml accessible
-   [ ] Communication aux utilisateurs

## Ressources

-   [Documentation electron-builder](https://www.electron.build/)
-   [Documentation electron-updater](https://www.electron.build/auto-update)
-   [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)

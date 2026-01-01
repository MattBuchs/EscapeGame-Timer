# 🎮 EscapeTime - Distribution Locale

## 🚀 Processus de distribution simplifié

Votre application est configurée pour une **distribution locale** via votre site web. Les utilisateurs téléchargent l'installateur et l'installent manuellement.

## 📦 Créer une nouvelle version

### Méthode simple (Script automatique)

```powershell
.\scripts\release.ps1
```

Ou pour une version mineure/majeure :

```powershell
.\scripts\release.ps1 -VersionType minor
.\scripts\release.ps1 -VersionType major
```

### Méthode manuelle

```bash
# 1. Compiler le SASS
npm run compile-sass

# 2. Incrémenter la version
npm version patch   # 1.0.0 → 1.0.1

# 3. Créer l'installateur
npm run build
```

## 📤 Distribuer la nouvelle version

### 1. Récupérer l'installateur

Le fichier est dans le dossier `dist/` :

```
dist/EscapeTime Setup 1.0.0.exe
```

### 2. Uploader sur votre site web

**Emplacement recommandé** :

```
votre-site.com/
└── downloads/
    └── EscapeTime Setup 1.0.0.exe
```

**Page de téléchargement** :

-   Utilisez le template dans `templates/download-page.html`
-   Modifiez l'URL du fichier
-   Mettez à jour le numéro de version

### 3. Méthodes d'hébergement

#### Option A : Hébergement sur votre serveur web

-   Upload via FTP, cPanel, ou interface d'administration
-   URL directe : `https://votre-site.com/downloads/EscapeTime Setup 1.0.0.exe`

#### Option B : GitHub Releases (Gratuit)

1. Créer un repository GitHub
2. Aller dans "Releases" → "Create a new release"
3. Tag : `v1.0.0`
4. Uploader `EscapeTime Setup 1.0.0.exe`
5. Publier
6. URL : `https://github.com/user/repo/releases/download/v1.0.0/EscapeTime.Setup.1.0.0.exe`

#### Option C : Services cloud

-   **Google Drive** : Partagez avec lien public
-   **OneDrive** : Créez un lien de partage
-   **Dropbox** : Générez un lien de téléchargement

### 4. Notifier vos utilisateurs

**Email** :

```
Objet : Nouvelle version d'EscapeTime disponible !

Bonjour,

La version 1.0.1 d'EscapeTime est maintenant disponible.

Téléchargez-la ici : https://votre-site.com/download

Nouveautés :
- Correction de bugs
- Amélioration des performances
- Interface bilingue (FR/EN)

Cordialement
```

**Sur votre site** :

-   Bannière de notification
-   Post de blog
-   Section "Dernières mises à jour"

## 📋 Checklist de release

Avant chaque release :

-   [ ] Tester l'application (`npm start`)
-   [ ] Compiler le SASS
-   [ ] Incrémenter la version
-   [ ] Créer le build
-   [ ] Tester l'installateur (installer sur une autre machine)
-   [ ] Uploader sur le serveur
-   [ ] Mettre à jour la page de téléchargement
-   [ ] Tester le lien de téléchargement
-   [ ] Notifier les utilisateurs

## 🗂️ Structure de fichiers recommandée

```
votre-site.com/
├── index.html                          # Page d'accueil
├── download.html                       # Page de téléchargement (template fourni)
├── guide.html                          # Guide d'utilisation
├── downloads/
│   ├── current/
│   │   └── EscapeTime Setup 1.0.1.exe  # Version actuelle
│   └── archive/
│       ├── EscapeTime Setup 1.0.0.exe  # Anciennes versions
│       └── EscapeTime Setup 0.9.0.exe
```

## 📝 Gestion des versions

### Numérotation sémantique : MAJOR.MINOR.PATCH

-   **PATCH** (1.0.0 → 1.0.1) : Corrections de bugs, petites améliorations
-   **MINOR** (1.0.0 → 1.1.0) : Nouvelles fonctionnalités, compatibilité maintenue
-   **MAJOR** (1.0.0 → 2.0.0) : Changements importants, possibles incompatibilités

### Commandes

```bash
npm version patch   # 1.0.0 → 1.0.1
npm version minor   # 1.0.0 → 1.1.0
npm version major   # 1.0.0 → 2.0.0
```

## 🔧 Configuration actuelle

### Mises à jour automatiques

**Statut** : ❌ Désactivées

Les mises à jour automatiques sont **désactivées** pour la distribution locale. Les utilisateurs doivent télécharger et installer manuellement chaque nouvelle version.

### Activer les mises à jour automatiques (optionnel)

Si vous souhaitez activer les mises à jour automatiques plus tard :

1. **Décommenter dans `main.js`** :

```javascript
// Ligne 37-43
if (!require("electron-is-dev")) {
    updater = new AutoUpdater(windows[0]);
    setTimeout(() => {
        updater.checkForUpdatesAndNotify();
    }, 5000);
}
```

2. **Ajouter dans `package.json`** (section `build`) :

```json
"publish": {
    "provider": "generic",
    "url": "https://votre-site.com/updates"
}
```

3. **Uploader deux fichiers** :

-   `EscapeTime Setup 1.0.0.exe`
-   `latest.yml` (généré automatiquement par electron-builder)

## 📚 Documentation disponible

-   **[HEBERGEMENT_WEB.md](HEBERGEMENT_WEB.md)** - Guide complet d'hébergement web
-   **[INSTALL.md](INSTALL.md)** - Instructions pour vos utilisateurs
-   **[BUILD_GUIDE.md](BUILD_GUIDE.md)** - Guide technique de build
-   **[DISTRIBUTION.md](DISTRIBUTION.md)** - Système complet de distribution
-   **[templates/download-page.html](templates/download-page.html)** - Template de page de téléchargement

## 💡 Conseils

### Sécurité

-   ✅ Utilisez HTTPS sur votre site
-   ✅ Fournissez un hash SHA256 du fichier (optionnel)
-   ⚠️ Envisagez la signature de code pour éviter les warnings Windows

### Communication

-   Créez une liste d'emails pour notifier les utilisateurs
-   Maintenez un changelog visible
-   Proposez un support (email, forum, FAQ)

### Sauvegarde

-   Gardez toujours une copie locale de chaque version
-   Archivez les anciennes versions pendant 6-12 mois
-   Sauvegardez le code source de chaque release (Git tags)

## ❓ Support

Pour toute question :

-   Consultez les guides dans le dossier du projet
-   Vérifiez les fichiers de documentation (.md)
-   Testez toujours l'installateur avant distribution

## 🎯 Workflow typique

```
Développement → Test → Compilation SASS → Build → Test installateur →
Upload web → Mise à jour page → Notification utilisateurs → Support
```

Bon courage avec votre distribution ! 🚀

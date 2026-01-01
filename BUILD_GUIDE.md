# Guide de Build et Distribution - EscapeTime

## 📦 Création de l'installateur

### Prérequis

-   Node.js et npm installés
-   Toutes les dépendances installées (`npm install`)

### Commandes de build

#### 1. Build standard (crée l'installateur)

```bash
npm run build
```

Cette commande crée un installateur NSIS dans le dossier `dist/`.

#### 2. Build sans empaquetage (pour tester)

```bash
npm run build:dir
```

Crée les fichiers de l'application sans créer l'installateur.

#### 3. Release (build de production)

```bash
npm run release
```

Crée l'installateur sans publier automatiquement.

### Fichiers générés

Après le build, vous trouverez dans le dossier `dist/` :

-   `EscapeTime Setup X.X.X.exe` - L'installateur pour Windows
-   `latest.yml` - Fichier de configuration pour les mises à jour automatiques

## 🚀 Distribution de l'application

### Option 1 : Distribution locale

1. Partagez le fichier `.exe` directement avec vos utilisateurs
2. Ils double-cliquent dessus pour installer l'application

### Option 2 : Distribution avec mises à jour automatiques

Pour activer les mises à jour automatiques, vous devez :

#### A. Héberger les fichiers de mise à jour

Hébergez ces fichiers sur un serveur accessible :

-   `EscapeTime Setup X.X.X.exe`
-   `latest.yml`

Vous pouvez utiliser :

-   **GitHub Releases** (gratuit, recommandé)
-   Un serveur web personnel
-   Un service de stockage cloud (Dropbox, Google Drive avec lien public)

#### B. Configuration pour GitHub Releases

1. Créez un repository GitHub pour votre projet

2. Modifiez `package.json`, section `build.publish` :

```json
"publish": {
    "provider": "github",
    "owner": "votre-username",
    "repo": "EscapeTime"
}
```

3. Générez un token GitHub :

    - Allez sur GitHub → Settings → Developer settings → Personal access tokens
    - Créez un token avec les permissions `repo`
    - Copiez le token

4. Créez un fichier `.env` à la racine du projet :

```
GH_TOKEN=votre_token_github
```

5. Ajoutez `.env` dans `.gitignore`

6. Pour publier une nouvelle version :

```bash
npm version patch  # ou minor ou major
npm run build
```

7. Upload manuel sur GitHub :
    - Allez dans "Releases" sur GitHub
    - Créez une nouvelle release avec le tag de version
    - Uploadez `EscapeTime Setup X.X.X.exe` et `latest.yml`

#### C. Configuration pour un serveur personnalisé

Dans `package.json`, modifiez :

```json
"publish": {
    "provider": "generic",
    "url": "https://votre-domaine.com/updates"
}
```

Structure des fichiers sur le serveur :

```
https://votre-domaine.com/updates/
├── EscapeTime Setup 1.0.0.exe
├── EscapeTime Setup 1.0.1.exe
└── latest.yml
```

## 🔄 Gestion des versions

### Mettre à jour le numéro de version

```bash
# Version patch (1.0.0 → 1.0.1)
npm version patch

# Version minor (1.0.0 → 1.1.0)
npm version minor

# Version major (1.0.0 → 2.0.0)
npm version major
```

### Processus de mise à jour

1. **Développez vos nouvelles fonctionnalités**
2. **Compilez le SASS si modifié** : `npm run compile-sass`
3. **Testez l'application** : `npm start`
4. **Incrémentez la version** : `npm version patch`
5. **Créez le build** : `npm run build`
6. **Publiez les fichiers** (uploadez sur GitHub Releases ou votre serveur)

### Comment fonctionnent les mises à jour automatiques

1. Au démarrage de l'application, elle vérifie automatiquement si une nouvelle version existe
2. Si une mise à jour est disponible, une boîte de dialogue apparaît
3. L'utilisateur peut choisir de télécharger maintenant ou plus tard
4. Une fois téléchargée, l'application propose de redémarrer pour installer

## 📝 Configuration avancée

### Changer l'icône de l'application

L'icône est définie dans `package.json` :

```json
"win": {
    "icon": "public/img/AngelsGame.ico"
}
```

### Personnaliser l'installateur

Dans `package.json`, section `nsis` :

-   `oneClick`: false permet à l'utilisateur de choisir le dossier d'installation
-   `createDesktopShortcut`: crée un raccourci sur le bureau
-   `createStartMenuShortcut`: crée un raccourci dans le menu démarrer
-   `language`: "1036" pour le français

### Désactiver les mises à jour automatiques

Dans `main.js`, commentez ces lignes :

```javascript
// if (!require('electron-is-dev')) {
//     updater = new AutoUpdater(windows[0]);
//     setTimeout(() => {
//         updater.checkForUpdatesAndNotify();
//     }, 5000);
// }
```

## 🐛 Résolution de problèmes

### Erreur lors du build

-   Vérifiez que toutes les dépendances sont installées : `npm install`
-   Supprimez `node_modules` et `package-lock.json`, puis réinstallez : `npm install`

### L'installateur ne se crée pas

-   Vérifiez que le dossier `dist` n'existe pas ou supprimez-le
-   Vérifiez les permissions d'écriture

### Les mises à jour ne fonctionnent pas

-   Vérifiez que `latest.yml` est bien accessible publiquement
-   Vérifiez l'URL dans `package.json` → `build.publish.url`
-   Vérifiez que la version dans `package.json` est supérieure à celle installée

## 📊 Structure des fichiers de mise à jour

Le fichier `latest.yml` contient :

```yaml
version: 1.0.1
files:
    - url: EscapeTime Setup 1.0.1.exe
      sha512: [hash du fichier]
      size: [taille en bytes]
path: EscapeTime Setup 1.0.1.exe
sha512: [hash du fichier]
releaseDate: "2024-12-31T10:00:00.000Z"
```

Ce fichier est généré automatiquement par electron-builder.

## 🎯 Checklist de release

-   [ ] Toutes les fonctionnalités sont testées
-   [ ] Le SASS est compilé
-   [ ] La version est incrémentée
-   [ ] Le build est créé sans erreur
-   [ ] L'installateur fonctionne (test d'installation)
-   [ ] Les fichiers sont uploadés sur le serveur/GitHub
-   [ ] Le fichier `latest.yml` est accessible publiquement
-   [ ] Les anciennes versions sont archivées

# 🌐 Guide d'hébergement sur votre site web

## Étape 1 : Créer l'installateur

### Compiler et build

```bash
# 1. Compiler le SASS
npm run compile-sass

# 2. Créer l'installateur
npm run build
```

L'installateur sera créé dans le dossier `dist/` :

-   `EscapeTime Setup 1.0.0.exe` (environ 100-200 MB)

## Étape 2 : Héberger sur votre site web

### Option A : Hébergement simple (HTML statique)

#### 1. Upload du fichier

Uploadez `EscapeTime Setup 1.0.0.exe` dans un dossier de votre site, par exemple :

```
votre-site.com/
├── downloads/
│   └── EscapeTime Setup 1.0.0.exe
```

#### 2. Créer une page de téléchargement

Créez une page HTML simple (par exemple `download.html`) :

```html
<!DOCTYPE html>
<html lang="fr">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Télécharger EscapeTime</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
            }

            .container {
                background: white;
                border-radius: 20px;
                padding: 50px;
                max-width: 600px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                text-align: center;
            }

            h1 {
                color: #333;
                margin-bottom: 10px;
                font-size: 2.5em;
            }

            .version {
                color: #888;
                font-size: 0.9em;
                margin-bottom: 30px;
            }

            .description {
                color: #666;
                line-height: 1.6;
                margin-bottom: 30px;
            }

            .download-btn {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 40px;
                border-radius: 50px;
                text-decoration: none;
                font-size: 1.2em;
                font-weight: bold;
                transition: transform 0.3s, box-shadow 0.3s;
                box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
            }

            .download-btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 10px 25px rgba(102, 126, 234, 0.6);
            }

            .info {
                margin-top: 30px;
                padding-top: 30px;
                border-top: 1px solid #eee;
            }

            .info h3 {
                color: #333;
                margin-bottom: 15px;
            }

            .requirements {
                text-align: left;
                color: #666;
                line-height: 1.8;
            }

            .requirements li {
                margin-bottom: 8px;
            }

            .file-size {
                color: #888;
                font-size: 0.85em;
                margin-top: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎮 EscapeTime</h1>
            <div class="version">Version 1.0.0</div>

            <p class="description">
                Un timer professionnel conçu pour les escape games. Gérez le
                temps de jeu, la musique et communiquez avec vos joueurs grâce à
                une interface intuitive à deux fenêtres.
            </p>

            <a href="downloads/EscapeTime Setup 1.0.0.exe" class="download-btn">
                ⬇️ Télécharger pour Windows
            </a>

            <div class="file-size">Taille : ~150 MB</div>

            <div class="info">
                <h3>📋 Configuration requise</h3>
                <ul class="requirements">
                    <li>✅ Windows 10 ou supérieur (64-bit)</li>
                    <li>✅ 4 GB de RAM minimum</li>
                    <li>✅ 200 MB d'espace disque</li>
                    <li>✅ 2 écrans recommandés</li>
                </ul>
            </div>

            <div class="info">
                <h3>🚀 Installation</h3>
                <ol class="requirements">
                    <li>Téléchargez l'installateur</li>
                    <li>Double-cliquez sur le fichier .exe</li>
                    <li>Suivez les instructions d'installation</li>
                    <li>Lancez EscapeTime depuis le bureau</li>
                </ol>
            </div>
        </div>
    </body>
</html>
```

#### 3. Lien de téléchargement direct

Votre lien de téléchargement sera :

```
https://votre-site.com/downloads/EscapeTime Setup 1.0.0.exe
```

### Option B : Avec WordPress

#### 1. Upload du fichier

-   Allez dans **Médias** → **Ajouter**
-   Uploadez `EscapeTime Setup 1.0.0.exe`
-   Copiez l'URL du fichier

#### 2. Créer une page

-   Créez une nouvelle page
-   Ajoutez un bouton de téléchargement
-   Liez le bouton à l'URL du fichier

#### 3. Plugin recommandé

Utilisez **Download Manager** ou **Simple Download Monitor** pour :

-   Comptabiliser les téléchargements
-   Protéger le lien
-   Gérer les versions

### Option C : Services d'hébergement gratuits

#### 1. GitHub Releases (Recommandé)

```bash
# 1. Créer un repository GitHub
# 2. Aller dans "Releases" → "Create a new release"
# 3. Upload EscapeTime Setup 1.0.0.exe
# 4. Publier la release
```

Lien de téléchargement :

```
https://github.com/votre-username/EscapeTime/releases/download/v1.0.0/EscapeTime.Setup.1.0.0.exe
```

#### 2. Google Drive

-   Uploadez le fichier
-   Clic droit → Obtenir le lien
-   Changez les permissions à "Tous ceux qui ont le lien"
-   Utilisez ce format pour le téléchargement direct :

```
https://drive.google.com/uc?export=download&id=ID_DU_FICHIER
```

#### 3. OneDrive / Dropbox

Similaire à Google Drive - créez un lien de partage public

## Étape 3 : Communication

### Page de téléchargement recommandée

Incluez sur votre page :

-   ✅ Description de l'application
-   ✅ Captures d'écran
-   ✅ Configuration requise
-   ✅ Instructions d'installation
-   ✅ Numéro de version
-   ✅ Taille du fichier
-   ✅ Date de mise à jour
-   ✅ Notes de version (changelog)

### Email aux utilisateurs

```
Bonjour,

EscapeTime version 1.0.0 est maintenant disponible !

Téléchargez-le ici :
https://votre-site.com/download

Nouveautés :
- Interface en français et anglais
- Nouveaux thèmes personnalisables
- Amélioration de la stabilité

Configuration requise :
- Windows 10 ou supérieur
- 4 GB RAM
- 200 MB d'espace disque

Installation :
1. Téléchargez le fichier
2. Double-cliquez sur l'installateur
3. Suivez les instructions

Besoin d'aide ? Contactez-nous : support@votre-email.com

Cordialement,
Votre équipe
```

## Étape 4 : Mises à jour futures

### Quand vous sortez une nouvelle version :

#### 1. Créer la nouvelle version

```bash
# Incrémenter la version
npm version patch  # 1.0.0 → 1.0.1

# Compiler et build
npm run compile-sass
npm run build
```

#### 2. Upload sur votre site

-   Uploadez le nouveau fichier `EscapeTime Setup 1.0.1.exe`
-   Mettez à jour la page de téléchargement
-   **Option** : Gardez l'ancienne version avec un lien "Versions précédentes"

#### 3. Notification aux utilisateurs

-   Email aux utilisateurs inscrits
-   Post sur les réseaux sociaux
-   Bannière sur votre site
-   Notification dans un groupe/forum

### Structure recommandée sur le serveur

```
votre-site.com/
├── downloads/
│   ├── current/
│   │   └── EscapeTime Setup 1.0.1.exe  (dernière version)
│   ├── archive/
│   │   ├── EscapeTime Setup 1.0.0.exe
│   │   └── EscapeTime Setup 0.9.0.exe
│   └── changelog.txt
```

## Sécurité et bonnes pratiques

### 1. HTTPS obligatoire

Assurez-vous que votre site utilise HTTPS pour éviter les avertissements de sécurité.

### 2. Checksum (optionnel mais recommandé)

Fournissez un hash SHA256 du fichier pour que les utilisateurs vérifient l'intégrité :

```bash
# Générer le hash (PowerShell)
Get-FileHash "dist\EscapeTime Setup 1.0.0.exe" -Algorithm SHA256
```

Sur votre page :

```
SHA256: abc123def456...
```

### 3. Signature de code (recommandé)

Pour éviter les avertissements Windows SmartScreen, signez votre application avec un certificat.

### 4. Fichier de version (optionnel)

Créez un fichier `version.json` sur votre serveur :

```json
{
    "version": "1.0.0",
    "date": "2024-12-31",
    "downloadUrl": "https://votre-site.com/downloads/EscapeTime Setup 1.0.0.exe",
    "changelog": [
        "Nouvelle interface bilingue",
        "Amélioration des performances",
        "Correction de bugs"
    ]
}
```

## Exemple de page complète

Voir le fichier HTML ci-dessus pour un exemple complet de page de téléchargement professionnelle.

## Support technique

Prévoyez une page ou section pour :

-   FAQ
-   Guide d'installation détaillé
-   Résolution de problèmes courants
-   Contact support

## Statistiques (optionnel)

Pour suivre les téléchargements, utilisez :

-   Google Analytics
-   Script PHP de comptage
-   Service tiers (bit.ly, etc.)

## Checklist de publication

-   [ ] Build créé et testé
-   [ ] Fichier uploadé sur le serveur
-   [ ] Page de téléchargement créée/mise à jour
-   [ ] Lien de téléchargement vérifié
-   [ ] Hash SHA256 généré (optionnel)
-   [ ] Email de notification préparé
-   [ ] Post réseaux sociaux préparé
-   [ ] Changelog mis à jour
-   [ ] Documentation à jour
-   [ ] Support technique prêt

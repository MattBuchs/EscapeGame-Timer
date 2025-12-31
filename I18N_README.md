# Système de traduction i18n - EscapeTime

## Vue d'ensemble

Ce document explique le système de traduction internationalisé (i18n) implémenté dans l'application EscapeTime.

## Langues supportées

- **Français** (fr) - Langue par défaut
- **Anglais** (en)

## Structure des fichiers

```
src/
├── core/
│   └── i18n.js                    # Module i18n principal (fenêtre principale)
├── core/secondWindow/
│   └── i18n.js                    # Module i18n pour la fenêtre secondaire
└── locales/
    ├── fr.json                     # Traductions françaises
    └── en.json                     # Traductions anglaises
```

## Utilisation

### Dans les fichiers HTML

Utilisez les attributs `data-i18n` pour marquer les éléments à traduire :

#### Pour le contenu texte
```html
<h2 data-i18n="settings.title">Paramètres</h2>
```

#### Pour les placeholders
```html
<input data-i18n-placeholder="addTimer.roomNamePlaceholder" placeholder="ex: Salle 1" />
```

#### Pour les attributs title
```html
<button data-i18n-title="home.secondWindowInfoTitle" title="Aide sur la fenêtre secondaire">
```

#### Pour les attributs alt
```html
<img data-i18n-alt="addTimer.stopMusic" alt="Stopper la musique" />
```

### Dans les fichiers JavaScript

#### Importer le module i18n
```javascript
const i18n = require("../../../core/i18n");
// ou pour la fenêtre secondaire
const i18n = require("./i18n");
```

#### Traduire un texte
```javascript
const translatedText = i18n.t("messages.success.timerAdded");
```

#### Traduire avec des paramètres
```javascript
const message = i18n.t("messages.welcome", { name: "John" });
// Dans le fichier JSON: "welcome": "Bonjour {name}"
```

#### Changer la langue
```javascript
i18n.setLocale("en"); // Change pour l'anglais
i18n.setLocale("fr"); // Change pour le français
```

#### Obtenir la langue actuelle
```javascript
const currentLang = i18n.getLocale(); // Retourne "fr" ou "en"
```

## Structure des fichiers de traduction

Les fichiers de traduction (fr.json et en.json) sont organisés par section :

```json
{
    "header": {
        "home": "Accueil",
        "addTimer": "Ajouter un timer",
        "settings": "Paramètres"
    },
    "settings": {
        "title": "Paramètres",
        "language": "Langue de l'application"
    },
    "messages": {
        "success": {
            "timerAdded": "Timer ajouté avec succès"
        },
        "error": {
            "fillAllFields": "Veuillez remplir tous les champs"
        }
    }
}
```

## Changement de langue dans l'application

1. Ouvrir les **Paramètres**
2. Trouver la section **Langue de l'application**
3. Sélectionner **Français** ou **Anglais**
4. La langue change immédiatement dans toutes les fenêtres

## Ajouter une nouvelle traduction

### 1. Ajouter la clé dans fr.json
```json
{
    "newSection": {
        "newKey": "Nouveau texte en français"
    }
}
```

### 2. Ajouter la traduction dans en.json
```json
{
    "newSection": {
        "newKey": "New text in English"
    }
}
```

### 3. Utiliser dans le HTML
```html
<span data-i18n="newSection.newKey">Nouveau texte en français</span>
```

### 4. Ou utiliser dans le JavaScript
```javascript
const text = i18n.t("newSection.newKey");
```

## Fonctionnalités avancées

### Observer les changements de langue

```javascript
i18n.addObserver((newLocale) => {
    console.log(`Langue changée vers: ${newLocale}`);
    // Effectuer des actions personnalisées
});
```

### Retraduire la page manuellement

```javascript
i18n.translatePage();
```

## Stockage

La langue sélectionnée est stockée dans le `localStorage` du navigateur sous la clé `app-locale`. Elle est automatiquement restaurée au redémarrage de l'application.

## Communication entre fenêtres

Le changement de langue est automatiquement synchronisé entre la fenêtre principale et les fenêtres secondaires via IPC (Inter-Process Communication).

## Ajouter une nouvelle langue

Pour ajouter une nouvelle langue (par exemple, l'espagnol) :

1. Créer `src/locales/es.json` avec toutes les traductions
2. Ajouter l'option dans `sectionSettings.html` :
```html
<div class="settingsRooms__section--preference">
    <input type="radio" id="lang-es" name="app-language" value="es" />
    <label for="lang-es" data-i18n="settings.languageSpanish">Español</label>
</div>
```
3. Gérer le changement dans `languageSelector.js`
4. Ajouter les traductions dans fr.json et en.json :
```json
"settings": {
    "languageSpanish": "Espagnol" // dans fr.json
    "languageSpanish": "Spanish"  // dans en.json
}
```

## Dépannage

### Les traductions ne s'affichent pas
- Vérifier que les attributs `data-i18n` sont correctement définis
- Vérifier que la clé existe dans les fichiers JSON
- Regarder la console pour les avertissements de clés manquantes

### La langue ne change pas
- Vérifier que `i18n.translatePage()` est appelé après `setLocale()`
- Vérifier la console pour les erreurs
- Vider le localStorage et recharger l'application

### Clés manquantes
Si une clé de traduction est manquante, le système affichera la clé elle-même dans la console avec un avertissement :
```
Traduction manquante pour la clé: settings.newKey
```

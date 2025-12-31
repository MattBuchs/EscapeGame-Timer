# Guide rapide - Système de traduction

## 🌍 Changement de langue

### Pour l'utilisateur :
1. Cliquer sur **Paramètres** (icône d'engrenage)
2. Descendre jusqu'à **Langue de l'application**
3. Choisir entre **Français** ou **Anglais**
4. Le changement est immédiat dans toutes les fenêtres

### Pour le développeur :

#### Ajouter une traduction dans un fichier HTML existant :
```html
<!-- Avant -->
<h2>Paramètres</h2>

<!-- Après -->
<h2 data-i18n="settings.title">Paramètres</h2>
```

#### Utiliser les traductions en JavaScript :
```javascript
// Importer le module
const i18n = require("../../../core/i18n");

// Traduire un texte
const text = i18n.t("messages.success.timerAdded");
console.log(text); // "Timer ajouté avec succès" (FR) ou "Timer added successfully" (EN)

// Changer la langue
i18n.setLocale("en");
```

#### Ajouter une nouvelle traduction :

1. **Dans `src/locales/fr.json`** :
```json
{
    "mySection": {
        "myNewText": "Mon nouveau texte"
    }
}
```

2. **Dans `src/locales/en.json`** :
```json
{
    "mySection": {
        "myNewText": "My new text"
    }
}
```

3. **Dans le HTML** :
```html
<span data-i18n="mySection.myNewText">Mon nouveau texte</span>
```

## 📁 Fichiers importants

- `src/core/i18n.js` - Module de traduction (fenêtre principale)
- `src/core/secondWindow/i18n.js` - Module de traduction (fenêtre secondaire)
- `src/locales/fr.json` - Traductions françaises
- `src/locales/en.json` - Traductions anglaises
- `src/core/mainWindow/settings/languageSelector.js` - Gestion du changement de langue

## 🔧 Attributs HTML disponibles

| Attribut | Usage |
|----------|-------|
| `data-i18n` | Contenu texte de l'élément |
| `data-i18n-placeholder` | Attribut placeholder des inputs |
| `data-i18n-title` | Attribut title (infobulle) |
| `data-i18n-alt` | Attribut alt des images |

## ✅ Ce qui est traduit

- ✅ Menu de navigation (header)
- ✅ Page d'accueil
- ✅ Page "Ajouter un timer"
- ✅ Page "Paramètres"
- ✅ Sélecteur de langue
- ✅ Titres, labels et placeholders
- ✅ Infobulles (tooltips)

## 📝 Remarques

- La langue est sauvegardée automatiquement dans le navigateur
- Le changement de langue est synchronisé entre toutes les fenêtres
- La langue par défaut est le français

Pour plus de détails, consulter [I18N_README.md](./I18N_README.md)

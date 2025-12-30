# 🎯 Système de Phrases Amélioré

## 📋 Vue d'ensemble

Le système de phrases préenregistrées a été entièrement amélioré avec les fonctionnalités suivantes :

### ✨ Nouvelles Fonctionnalités

#### 1. **Système de Catégories** 📂

Les phrases sont organisées en 7 catégories :

-   💬 **Général** - Messages généraux
-   💡 **Indices** - Indices pour les joueurs
-   ⚠️ **Avertissements** - Messages d'avertissement
-   🎉 **Félicitations** - Messages de réussite
-   📖 **Histoire/Ambiance** - Narration et ambiance
-   ⏰ **Temps** - Messages liés au temps
-   ⭐ **Personnalisé** - Catégorie libre

#### 2. **Système de Favoris** ⭐

-   Marquez vos phrases les plus utilisées comme favoris
-   Les favoris sont mis en évidence dans la liste
-   Filtrage rapide pour afficher uniquement les favoris
-   Badge ⭐ visible dans l'autocompléteur

#### 3. **Statistiques d'Utilisation** 📊

-   Compteur automatique du nombre d'utilisations
-   Tri intelligent : favoris → plus utilisées → alphabétique
-   Visualisation du nombre d'utilisations (ex: "5×")

#### 4. **Interface Améliorée** 🎨

##### Modal d'Ajout

-   Sélecteur de catégorie avec icônes
-   Case à cocher pour marquer comme favori
-   Design moderne avec effet glass-morphism
-   Zone d'options visuellement distincte

##### Autocompléteur

-   **Filtres en temps réel** :
    -   Filtre par catégorie (dropdown)
    -   Filtre favoris uniquement (checkbox)
    -   Recherche textuelle avancée
-   **Affichage groupé** par catégorie
-   **Headers de catégorie** fixes lors du scroll
-   **Métadonnées visibles** : favoris + compteur d'utilisation
-   **Design** :
    -   Favoris avec bordure dorée
    -   Effet hover amélioré
    -   Hauteur augmentée (350px)
    -   Scrollbar moderne

#### 5. **Compatibilité Rétroactive** 🔄

-   Conversion automatique des anciennes phrases (string) en nouveaux objets
-   Migration transparente au premier chargement
-   Aucune perte de données existantes

---

## 🏗️ Structure des Données

### Ancien Format

```json
{
    "phrases": ["Phrase 1", "Phrase 2"]
}
```

### Nouveau Format

```json
{
    "phrases": [
        {
            "text": "Phrase 1",
            "category": "hint",
            "favorite": true,
            "created": "2024-01-01T12:00:00.000Z",
            "usageCount": 5
        }
    ]
}
```

---

## 🎮 Guide d'Utilisation

### Ajouter une Phrase

1. Cliquez sur "Ajouter une phrase"
2. Tapez votre phrase (max 230 caractères)
3. Sélectionnez une catégorie
4. (Optionnel) Cochez "Marquer comme favori"
5. Validez

### Utiliser une Phrase

1. Dans la section Timer, utilisez les filtres :
    - **Catégorie** : choisissez une catégorie spécifique ou "Toutes"
    - **Favoris** : cochez pour voir uniquement vos favoris
2. Tapez dans la barre de recherche pour filtrer par texte
3. Cliquez sur une phrase pour l'insérer
4. Le compteur d'utilisation s'incrémente automatiquement

### Supprimer une Phrase

-   Utilisez le système de suppression existant (dropdown)
-   Compatible avec les anciennes et nouvelles phrases

---

## 🎨 Personnalisation CSS

### Classes Disponibles

#### Filtres

-   `.timer__bottom--filters` : Conteneur des filtres
-   `.phrases-filter-select` : Dropdown de catégories
-   `.phrases-favorites-label` : Label du filtre favoris

#### Dropdown

-   `.phrases-dropdown` : Conteneur principal
-   `.phrase-category-header` : En-tête de catégorie (sticky)
-   `.phrase-item` : Item de phrase
-   `.phrase-item.favorite` : Item favori (bordure dorée)
-   `.phrase-content` : Contenu de la phrase
-   `.phrase-text` : Texte de la phrase
-   `.phrase-meta` : Métadonnées (⭐, compteur)

#### Modal

-   `.phrase-options` : Conteneur des options
-   `.phrase-category-select` : Select de catégorie
-   `.favorite-label` : Label du checkbox favori

---

## 🔧 Fichiers Modifiés

### JavaScript

-   `src/core/mainWindow/phrases/addPhrases.js` : Ajout avec catégories et favoris
-   `src/core/mainWindow/phrases/phrasesAutocomplete.js` : Filtres et tri avancé
-   `src/core/mainWindow/phrases/deletePhrases.js` : Compatibilité nouveau format

### HTML

-   `src/html/mainWindow/modals/modalSettings.html` : UI d'ajout améliorée
-   `src/html/mainWindow/main/sectionRoom.html` : Filtres ajoutés

### CSS

-   `src/css/mainWindow/main/sectionTimer.scss` : Styles filtres et dropdown
-   `src/css/mainWindow/modal.scss` : Styles options de phrase

---

## 🚀 Améliorations Futures Possibles

1. **Export/Import** : Partager des phrases entre salles
2. **Templates** : Phrases avec variables (ex: "{temps} restant")
3. **Multi-langue** : Support de plusieurs langues
4. **Tags** : Système de tags en plus des catégories
5. **Historique** : Voir les dernières phrases envoyées
6. **Recherche avancée** : Regex, recherche par date, etc.
7. **Statistiques** : Dashboard des phrases les plus utilisées

---

## 📝 Notes Techniques

### Migration Automatique

Le code vérifie automatiquement le type de chaque phrase :

```javascript
const phraseText = typeof p === "string" ? p : p.text;
```

### Tri Intelligent

```javascript
phrases.sort((a, b) => {
    if (a.favorite !== b.favorite) return b.favorite ? 1 : -1;
    if (a.usageCount !== b.usageCount) return b.usageCount - a.usageCount;
    return a.text.localeCompare(b.text, "fr");
});
```

### Performance

-   Limite de 50 phrases affichées simultanément
-   Filtrage côté client (pas de requête serveur)
-   Sticky headers pour navigation fluide

---

## 🎯 Constantes des Catégories

```javascript
const CATEGORIES = [
    { id: "general", name: "Général", icon: "💬" },
    { id: "hint", name: "Indices", icon: "💡" },
    { id: "warning", name: "Avertissements", icon: "⚠️" },
    { id: "success", name: "Félicitations", icon: "🎉" },
    { id: "story", name: "Histoire/Ambiance", icon: "📖" },
    { id: "time", name: "Temps", icon: "⏰" },
    { id: "custom", name: "Personnalisé", icon: "⭐" },
];
```

---

Enjoy! 🎮✨

# 🎨 Design System - EscapeGame Timer

## 🌟 Refonte Moderne Complétée

Ce projet a bénéficié d'une refonte complète de son design pour le moderniser tout en conservant son esprit Escape Game.

## 🎯 Principales Améliorations

### **Design System Complet**

-   Système de variables CSS centralisé (`_variables.scss`)
-   Palette de couleurs moderne avec thème sombre purple/cyan
-   Typographie cohérente et hiérarchisée
-   Espacements et bordures standardisés

### **Effets Visuels Modernes**

-   ✨ Effets néon et glow sur les éléments interactifs
-   🌊 Glass morphism avec backdrop blur
-   💫 Animations fluides et transitions élégantes
-   🎭 Ombres et profondeurs réalistes

### **Components Modernisés**

#### **Sidebar Navigation**

-   Design épuré avec effets de hover fluides
-   Animations d'expansion/collapse améliorées
-   Indicateurs visuels de l'onglet actif avec accent néon

#### **Timer Section**

-   Affichage du timer avec effets néon et glow
-   Design futuriste avec bordures lumineuses
-   Formulaires améliorés avec autocomplete moderne
-   Boutons avec gradients et effets de profondeur

#### **Rooms Cards**

-   Cards modernes avec effets de hover élégants
-   Layout responsive en grid
-   Animations d'apparition fluides
-   Gradients subtils et ombres dynamiques

#### **Modales**

-   Glass morphism avec backdrop blur
-   Animations d'apparition (scale + fade)
-   Boutons colorés selon leur fonction (succès/erreur)
-   Scrollbar personnalisée

#### **Settings**

-   Interface épurée et intuitive
-   Cards organisées avec bordures néon
-   Dropzones visuelles pour le drag & drop
-   Inputs et selects stylisés

#### **Second Window (Display)**

-   Affichage fullscreen épuré
-   Timer géant avec effets néon spectaculaires
-   Messages stylisés avec glass morphism
-   Mode photo optimisé

## 🎨 Palette de Couleurs

### **Primaire (Purple)**

-   `#6366f1` - Principal
-   `#4f46e5` - Sombre
-   `#818cf8` - Clair

### **Secondaire (Cyan)**

-   `#06b6d4` - Principal
-   `#0891b2` - Sombre
-   `#22d3ee` - Clair

### **Background**

-   `#0f0f1e` - Dark
-   `#08080f` - Darker
-   `#1a1a2e` - Card

### **Accents**

-   `#10b981` - Success (Green)
-   `#ef4444` - Error (Red)
-   `#f59e0b` - Warning (Orange)
-   `#3b82f6` - Info (Blue)

## 🚀 Caractéristiques Techniques

### **Responsive Design**

-   Mobile first approach
-   Breakpoints optimisés
-   Grid et Flexbox modernes
-   Touch-friendly sur mobile

### **Performance**

-   Transitions hardware-accelerated
-   Animations optimisées avec `will-change`
-   Lazy loading des effets visuels

### **Accessibilité**

-   Contrastes respectés (WCAG)
-   Focus states visibles
-   Tailles de police adaptatives (clamp)
-   Support des préférences de mouvement réduit

## 📁 Structure des Fichiers

```
src/css/
├── _variables.scss          # Variables globales et mixins
├── index.scss              # Point d'entrée principal
├── reset.scss              # Reset CSS
├── mainWindow/
│   ├── header.scss         # Navigation sidebar
│   ├── modal.scss          # Système de modales
│   └── main/
│       ├── sectionTimer.scss
│       ├── sectionRoom.scss
│       ├── sectionSettings.scss
│       ├── sectionAddRoom.scss
│       └── sectionUpdateRoom.scss
└── secondWindow/
    └── content.scss        # Fenêtre d'affichage
```

## 🛠️ Compilation

```bash
# Compiler une fois
npm run compile-sass

# Mode watch (recompile automatiquement)
npm run watch-sass
```

## 💡 Conseils d'Utilisation

### **Ajouter de Nouveaux Composants**

1. Utiliser les variables de `_variables.scss`
2. Appliquer les mixins pour cohérence
3. Respecter la hiérarchie des z-index
4. Tester sur différentes tailles d'écran

### **Animations**

-   Utiliser `$transition-base` pour la plupart des transitions
-   `$transition-fast` pour les micro-interactions
-   `$transition-slow` pour les animations importantes

### **Couleurs**

-   Toujours utiliser les variables de couleur
-   Appliquer les glows sur les éléments interactifs
-   Utiliser les gradients pour les boutons CTA

## 🎯 Esprit Escape Game Conservé

Malgré la modernisation, le design conserve :

-   L'aspect immersif et mystérieux
-   Les effets lumineux rappelant les énigmes
-   La lisibilité du timer central
-   L'ergonomie pour le maître du jeu
-   Le côté spectaculaire pour les joueurs

---

**Design by:** GitHub Copilot AI  
**Date:** Décembre 2025  
**Version:** 2.0 - Modern Redesign

# 🐵 Comment ajouter votre image de logo MockApe

## 📁 Méthode recommandée : Dossier assets (Vite/React)

1. **Placez votre image** dans le dossier `src/assets/` de votre projet
2. **Nommez-la** `logo.png` (ou modifiez l'import dans le code)
3. **Formats supportés** : PNG, JPG, JPEG, SVG, WebP
4. **Taille recommandée** : 200x200px minimum (carré)

```
src/
├── assets/
│   └── logo.png  ← Votre image ici
├── components/
│   └── Header.tsx
└── ...
```

**Avantages de cette méthode :**
- ✅ **Optimisation automatique** par Vite (compression, hash unique)
- ✅ **Gestion du cache** (évite les problèmes de cache)
- ✅ **Code organisé** (assets dans src/assets/)
- ✅ **TypeScript support** (détection d'erreurs si fichier manquant)
- ✅ **Tree shaking** (seules les images utilisées sont incluses)

## 📁 Méthode alternative : Dossier public

Si vous préférez utiliser le dossier public :

1. **Placez votre image** dans `public/monkey-logo.png`
2. **Modifiez le code** dans `src/components/Header.tsx` :

```typescript
// Remplacez l'import par :
const monkeyLogoUrl = '/monkey-logo.png'
// Et utilisez : src={monkeyLogoUrl}
```

## 🎨 Optimisation de l'image pour une qualité maximale

- **Format PNG** recommandé pour la transparence et la qualité
- **Taille recommandée** : 400x400px à 800x800px (haute résolution)
- **Pour écrans Retina** : 800x800px minimum
- **Poids** : < 200KB pour un chargement rapide
- **Fond transparent** si possible
- **Qualité** : 95-100% pour PNG, 90-95% pour JPEG

### 🚀 Améliorations automatiques appliquées :

- ✅ **Rendu haute qualité** avec `image-rendering: high-quality`
- ✅ **Optimisation Retina** pour les écrans haute résolution
- ✅ **Amélioration des couleurs** : contraste +10%, saturation +20%, luminosité +5%
- ✅ **Zoom léger** (110%) pour plus de détails
- ✅ **Accélération GPU** pour un rendu fluide
- ✅ **Taille augmentée** : 160x160px (au lieu de 128x128px)

## 🔧 Personnalisation

Si vous voulez changer le nom du fichier, modifiez l'import dans `Header.tsx` :

```typescript
// Ligne 5 dans Header.tsx
import monkeyLogo from '../assets/logo.png'
```

## ✅ Vérification

1. Redémarrez votre serveur de développement (`npm run dev`)
2. L'image devrait s'afficher automatiquement
3. Si l'image ne se charge pas, un placeholder s'affichera

## 🎯 Effets visuels

L'image sera automatiquement :
- ✅ Arrondie (border-radius)
- ✅ Centrée et redimensionnée
- ✅ Entourée d'un anneau rotatif néon
- ✅ Avec des particules flottantes
- ✅ Avec des effets de survol

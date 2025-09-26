# Configuration du Logo Principal

## Instructions pour ajouter le logo principal

1. **Placez votre fichier logo** dans le dossier `src/assets/` avec le nom `logo-main.png`

2. **Formats supportés** :
   - PNG (recommandé pour la transparence)
   - JPG/JPEG
   - SVG

3. **Recommandations** :
   - Taille : 32x32px ou 64x64px pour une qualité optimale
   - Format : PNG avec transparence si possible
   - Poids : < 50KB pour un chargement rapide

4. **Le logo sera automatiquement affiché** :
   - À gauche de la barre de navigation fixe
   - Dans un conteneur avec gradient MockApe
   - Avec le texte "MockApe Pro" à côté
   - Avec un fallback si l'image ne charge pas

## Structure actuelle

Le logo est maintenant intégré dans `FixedNavigationBar.tsx`. Actuellement, il affiche le logo textuel "M" avec le gradient MockApe.

Pour ajouter votre image de logo :

1. **Placez votre fichier** `logo-main.png` dans `src/assets/`
2. **Décommentez l'import** dans `FixedNavigationBar.tsx` :
   ```typescript
   import mainLogo from '../assets/logo-main.png'
   ```
3. **Remplacez le span "M"** par l'image :
   ```typescript
   <img 
     src={mainLogo} 
     alt="MockApe Logo"
     className="w-full h-full object-contain p-1"
     onError={(e) => {
       // Fallback vers le logo textuel "M"
     }}
   />
   ```

**Structure actuelle (sans image)** :
```typescript
<div className="flex items-center gap-3 mr-6">
  <div className="w-8 h-8 rounded bg-gradient-to-r from-[#9945FF] to-[#06B6D4] flex items-center justify-center">
    <span className="text-white font-bold text-sm">M</span>
  </div>
  <div className="flex flex-col">
    <span className="text-white font-bold text-lg leading-none">MockApe</span>
    <span className="text-white/70 font-medium text-xs leading-none">Pro</span>
  </div>
</div>
```

## Fallback

Si l'image ne charge pas, le système affichera automatiquement le logo textuel "M" avec le gradient MockApe.

## Position dans la barre

La structure de la barre de navigation est maintenant :
1. **Logo principal** (à gauche)
2. **4 onglets** (Charts, Analysis, Calendar, Perpetuals)
3. **Barre de recherche et bouton Deposit** (à droite)

# Système de Spritesheet et Animations Avancées

Ce dossier contient une implémentation complète d'un système de gamification avec PixiJS, incluant un système de spritesheet, des animations avancées, des effets de particules, un système d'éclairage et une gestion de performance adaptative.

## 🎮 Composants Principaux

### 1. MoneyCartPixi.jsx
Le composant principal du jeu qui intègre tous les systèmes :
- **Système de spritesheet** avec animations des symboles
- **Système de particules** avancé avec effets spéciaux
- **Système d'éclairage** dynamique avec lumières et ombres
- **Gestionnaire de performance** adaptatif
- **Logique de jeu** complète avec mécaniques avancées

### 2. SpriteAtlas.jsx
Gestionnaire de spritesheet qui charge et anime les textures :
- **Chargement automatique** des textures depuis un atlas
- **Fallback** vers les anciennes textures SVG si nécessaire
- **Animations fluides** avec PIXI.AnimatedSprite
- **Animations spéciales** : victoire, combo, montée de niveau

### 3. ParticleSystem.jsx
Système de particules avancé avec de nombreux effets :
- **Explosions** avec options personnalisables
- **Vagues** avec anneaux multiples
- **Vortex** avec rotation et expansion
- **Éclairs** avec branches multiples
- **Traînées** de particules
- **Effets de scintillement** et gravité

### 4. LightingSystem.jsx
Système d'éclairage dynamique :
- **Lumières ambiantes** et ponctuelles
- **Effets de pulsation** et scintillement
- **Ombres** directionnelles et radiales
- **Lueurs** et effets de halo
- **Animation** des lumières en temps réel

### 5. PerformanceManager.jsx
Gestionnaire de performance intelligent :
- **Détection automatique** des capacités de l'appareil
- **Adaptation dynamique** des paramètres de jeu
- **Surveillance FPS** en temps réel
- **Optimisations** automatiques selon les performances

## 🎨 Configuration des Sprites

### spriteConfig.js
Configuration complète du spritesheet :
```javascript
export const SPRITE_CONFIG = {
  texturePath: '/images/game/symbols-atlas.png',
  frameData: {
    saver: {
      frames: [
        { x: 0, y: 0, width: 64, height: 64 },
        { x: 64, y: 0, width: 64, height: 64 },
        // ... plus de frames
      ],
      animationSpeed: 0.1,
      loop: true
    }
    // ... autres symboles
  }
};
```

### SYMBOL_EFFECTS
Configuration des effets visuels pour chaque symbole :
```javascript
export const SYMBOL_EFFECTS = {
  saver: {
    particleColor: 0x00FFFF,
    glowColor: 0x00FFFF,
    animationType: 'pulse',
    specialEffect: 'wave'
  }
  // ... autres effets
};
```

## 🚀 Utilisation

### Intégration dans MoneyCartPixi
```javascript
// Initialisation du SpriteAtlas
spriteAtlasRef.current = new SpriteAtlas(app, SPRITE_CONFIG.texturePath, SPRITE_CONFIG.frameData);

// Création d'un sprite animé
const animatedIcon = spriteAtlasRef.current.createAnimatedSprite(symbolName, {
  x: cellSize / 2,
  y: cellSize / 2,
  scale: 0.8
});

// Animation spéciale
const winAnimation = spriteAtlasRef.current.createWinAnimation(x, y, scale);
```

### Effets de Particules
```javascript
// Explosion avancée
particleSystemRef.current.createExplosion(x, y, color, count, {
  size: 4,
  life: 60,
  speed: 3,
  gravity: 0.1,
  sparkle: true,
  trail: true
});

// Vortex
particleSystemRef.current.createVortex(x, y, radius, color, {
  particles: 25,
  rotationSpeed: 0.2,
  expansionSpeed: 1.5
});
```

### Système d'Éclairage
```javascript
// Lumière ponctuelle avec pulsation
lightingSystem.createPointLight(x, y, color, intensity, radius, {
  pulse: true,
  pulseSpeed: 0.03
});

// Effet de lueur
lightingSystem.createGlow(x, y, color, intensity, radius);
```

## 🎯 Démonstrations

### EffectsDemo.jsx
Démonstration des effets de particules et d'éclairage :
- Contrôles interactifs pour tous les effets
- Statistiques de performance en temps réel
- Tests des différents types d'effets

### SpriteAtlasDemo.jsx
Démonstration du système de spritesheet :
- Affichage de tous les symboles animés
- Tests des animations spéciales
- Interface interactive pour tester les effets

## 🔧 Optimisations

### Gestion de Performance
- **Détection automatique** des capacités GPU
- **Adaptation dynamique** du nombre de particules
- **Qualité des textures** adaptative
- **Niveau de détail** (LOD) automatique

### Fallbacks
- **Textures SVG** si le spritesheet n'est pas disponible
- **Dégradation gracieuse** des effets selon les performances
- **Gestion d'erreur** robuste

## 📁 Structure des Fichiers

```
src/components/optimized/
├── MoneyCartPixi.jsx          # Composant principal du jeu
├── SpriteAtlas.jsx            # Gestionnaire de spritesheet
├── ParticleSystem.jsx         # Système de particules
├── LightingSystem.jsx         # Système d'éclairage
├── PerformanceManager.jsx     # Gestionnaire de performance
├── spriteConfig.js            # Configuration des sprites
├── EffectsDemo.jsx            # Démo des effets
├── SpriteAtlasDemo.jsx        # Démo du spritesheet
└── README.md                  # Ce fichier
```

## 🎨 Création du Spritesheet

Pour créer le fichier `symbols-atlas.png` :

1. **Organiser les frames** selon la configuration dans `spriteConfig.js`
2. **Dimensions recommandées** : 768x512 pixels (12x8 frames de 64x64)
3. **Format** : PNG avec transparence
4. **Optimisation** : compression des textures pour le web

## 🚀 Prochaines Étapes

- [ ] Création du fichier spritesheet `symbols-atlas.png`
- [ ] Tests d'intégration dans le jeu principal
- [ ] Optimisation des performances sur différents appareils
- [ ] Ajout d'effets sonores (optionnel selon les spécifications)
- [ ] Tests de compatibilité navigateur

## 💡 Conseils d'Utilisation

1. **Toujours vérifier** que le SpriteAtlas est chargé avant utilisation
2. **Utiliser les fallbacks** pour la compatibilité
3. **Surveiller les performances** avec le PerformanceManager
4. **Tester sur différents appareils** pour valider l'adaptation
5. **Optimiser les textures** selon les besoins de performance

---

*Ce système offre une base solide pour des jeux 2D performants et visuellement attrayants avec PixiJS.*

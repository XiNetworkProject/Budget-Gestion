// Configuration du spritesheet pour les symboles du jeu
export const SPRITE_CONFIG = {
  // Chemin vers le spritesheet (à créer)
  texturePath: '/images/game/symbols-atlas.png',
  
  // Données des frames pour chaque symbole
  frameData: {
    saver: {
      frames: [
        { x: 0, y: 0, width: 64, height: 64 },
        { x: 64, y: 0, width: 64, height: 64 },
        { x: 128, y: 0, width: 64, height: 64 },
        { x: 192, y: 0, width: 64, height: 64 }
      ],
      animationSpeed: 0.1,
      loop: true
    },
    optimizer: {
      frames: [
        { x: 0, y: 64, width: 64, height: 64 },
        { x: 64, y: 64, width: 64, height: 64 },
        { x: 128, y: 64, width: 64, height: 64 },
        { x: 192, y: 64, width: 64, height: 64 }
      ],
      animationSpeed: 0.08,
      loop: true
    },
    collector: {
      frames: [
        { x: 0, y: 128, width: 64, height: 64 },
        { x: 64, y: 128, width: 64, height: 64 },
        { x: 128, y: 128, width: 64, height: 64 },
        { x: 192, y: 128, width: 64, height: 64 }
      ],
      animationSpeed: 0.12,
      loop: true
    },
    defender: {
      frames: [
        { x: 0, y: 192, width: 64, height: 64 },
        { x: 64, y: 192, width: 64, height: 64 },
        { x: 128, y: 192, width: 64, height: 64 },
        { x: 192, y: 192, width: 64, height: 64 }
      ],
      animationSpeed: 0.15,
      loop: true
    },
    bonusSpin: {
      frames: [
        { x: 0, y: 256, width: 64, height: 64 },
        { x: 64, y: 256, width: 64, height: 64 },
        { x: 128, y: 256, width: 64, height: 64 },
        { x: 192, y: 256, width: 64, height: 64 }
      ],
      animationSpeed: 0.2,
      loop: true
    },
    unlocker: {
      frames: [
        { x: 0, y: 320, width: 64, height: 64 },
        { x: 64, y: 320, width: 64, height: 64 },
        { x: 128, y: 320, width: 64, height: 64 },
        { x: 192, y: 320, width: 64, height: 64 }
      ],
      animationSpeed: 0.1,
      loop: true
    },
    payer: {
      frames: [
        { x: 0, y: 384, width: 64, height: 64 },
        { x: 64, y: 384, width: 64, height: 64 },
        { x: 128, y: 384, width: 64, height: 64 },
        { x: 192, y: 384, width: 64, height: 64 }
      ],
      animationSpeed: 0.06,
      loop: true
    },
    sniper: {
      frames: [
        { x: 0, y: 448, width: 64, height: 64 },
        { x: 64, y: 448, width: 64, height: 64 },
        { x: 128, y: 448, width: 64, height: 64 },
        { x: 192, y: 448, width: 64, height: 64 }
      ],
      animationSpeed: 0.18,
      loop: true
    }
  },
  
  // Configuration des animations spéciales
  specialAnimations: {
    win: {
      frames: [
        { x: 256, y: 0, width: 128, height: 128 },
        { x: 384, y: 0, width: 128, height: 128 },
        { x: 512, y: 0, width: 128, height: 128 },
        { x: 640, y: 0, width: 128, height: 128 }
      ],
      animationSpeed: 0.15,
      loop: false
    },
    combo: {
      frames: [
        { x: 256, y: 128, width: 96, height: 96 },
        { x: 352, y: 128, width: 96, height: 96 },
        { x: 448, y: 128, width: 96, height: 96 },
        { x: 544, y: 128, width: 96, height: 96 }
      ],
      animationSpeed: 0.2,
      loop: false
    },
    levelUp: {
      frames: [
        { x: 256, y: 224, width: 112, height: 112 },
        { x: 368, y: 224, width: 112, height: 112 },
        { x: 480, y: 224, width: 112, height: 112 },
        { x: 592, y: 224, width: 112, height: 112 }
      ],
      animationSpeed: 0.12,
      loop: false
    }
  }
};

// Configuration des effets visuels pour chaque symbole
export const SYMBOL_EFFECTS = {
  saver: {
    particleColor: 0x00FFFF,
    glowColor: 0x00FFFF,
    animationType: 'pulse',
    specialEffect: 'wave'
  },
  optimizer: {
    particleColor: 0xFFD700,
    glowColor: 0xFFD700,
    animationType: 'rotation',
    specialEffect: 'sparkle'
  },
  collector: {
    particleColor: 0xFF69B4,
    glowColor: 0xFF69B4,
    animationType: 'bounce',
    specialEffect: 'vortex'
  },
  defender: {
    particleColor: 0x32CD32,
    glowColor: 0x32CD32,
    animationType: 'scale',
    specialEffect: 'shield'
  },
  bonusSpin: {
    particleColor: 0xFF4500,
    glowColor: 0xFF4500,
    animationType: 'flash',
    specialEffect: 'explosion'
  },
  unlocker: {
    particleColor: 0xFF8C00,
    glowColor: 0xFF8C00,
    animationType: 'fade',
    specialEffect: 'unlock'
  },
  payer: {
    particleColor: 0x32CD32,
    glowColor: 0x32CD32,
    animationType: 'shake',
    specialEffect: 'money'
  },
  sniper: {
    particleColor: 0xDC143C,
    glowColor: 0xDC143C,
    animationType: 'zoom',
    specialEffect: 'target'
  }
};

import * as PIXI from 'pixi.js';

class SpriteAtlas {
  constructor(app, texturePath, frameData) {
    this.app = app;
    this.texturePath = texturePath;
    this.frameData = frameData;
    this.textures = new Map();
    this.animations = new Map();
    this.isLoaded = false;
    
    this.loadTextures();
  }

  async loadTextures() {
    try {
      // Charger la texture principale
      const baseTexture = await PIXI.Texture.from(this.texturePath);
      
      // Créer les textures pour chaque frame de chaque symbole
      for (const [symbolName, symbolData] of Object.entries(this.frameData)) {
        const symbolTextures = [];
        
        for (const frame of symbolData.frames) {
          const texture = new PIXI.Texture(baseTexture.baseTexture, new PIXI.Rectangle(
            frame.x, frame.y, frame.width, frame.height
          ));
          symbolTextures.push(texture);
        }
        
        this.textures.set(symbolName, symbolTextures);
        
        // Créer l'animation
        const animatedSprite = new PIXI.AnimatedSprite(symbolTextures);
        animatedSprite.animationSpeed = symbolData.animationSpeed || 0.1;
        animatedSprite.loop = symbolData.loop !== false;
        animatedSprite.anchor.set(0.5);
        
        this.animations.set(symbolName, animatedSprite);
      }
      
      this.isLoaded = true;
      console.log('SpriteAtlas chargé avec succès');
    } catch (error) {
      console.error('Erreur lors du chargement du SpriteAtlas:', error);
      // Fallback vers les textures individuelles
      this.loadFallbackTextures();
    }
  }

  loadFallbackTextures() {
    // Fallback vers les anciennes textures SVG individuelles
    const fallbackTextures = {
      saver: '/images/game/symbol-saver.svg',
      optimizer: '/images/game/symbol-optimizer.svg',
      collector: '/images/game/symbol-collector.svg',
      defender: '/images/game/symbol-defender.svg',
      bonusSpin: '/images/game/symbol-bonus.svg',
      unlocker: '/images/game/symbol-unlocker.svg',
      payer: '/images/game/symbol-payer.svg',
      sniper: '/images/game/symbol-sniper.svg'
    };

    for (const [symbolName, texturePath] of Object.entries(fallbackTextures)) {
      const texture = PIXI.Texture.from(texturePath);
      this.textures.set(symbolName, [texture]);
      
      const sprite = new PIXI.Sprite(texture);
      sprite.anchor.set(0.5);
      this.animations.set(symbolName, sprite);
    }
    
    this.isLoaded = true;
    console.log('Fallback textures chargées');
  }

  createAnimatedSprite(symbolName, options = {}) {
    if (!this.isLoaded) {
      console.warn('SpriteAtlas pas encore chargé');
      return null;
    }

    const animation = this.animations.get(symbolName);
    if (!animation) {
      console.warn(`Symbole ${symbolName} non trouvé`);
      return null;
    }

    // Cloner l'animation
    let sprite;
    if (animation instanceof PIXI.AnimatedSprite) {
      sprite = new PIXI.AnimatedSprite(animation.textures);
      sprite.animationSpeed = animation.animationSpeed;
      sprite.loop = animation.loop;
    } else {
      sprite = new PIXI.Sprite(animation.texture);
    }

    // Appliquer les options
    if (options.scale) sprite.scale.set(options.scale);
    if (options.alpha !== undefined) sprite.alpha = options.alpha;
    if (options.visible !== undefined) sprite.visible = options.visible;
    if (options.anchor) sprite.anchor.set(options.anchor);
    if (options.x !== undefined) sprite.x = options.x;
    if (options.y !== undefined) sprite.y = options.y;

    sprite.anchor.set(0.5);
    return sprite;
  }

  createStaticSprite(symbolName, options = {}) {
    if (!this.isLoaded) return null;

    const textures = this.textures.get(symbolName);
    if (!textures || textures.length === 0) return null;

    const sprite = new PIXI.Sprite(textures[0]);
    
    // Appliquer les options
    if (options.scale) sprite.scale.set(options.scale);
    if (options.alpha !== undefined) sprite.alpha = options.alpha;
    if (options.visible !== undefined) sprite.visible = options.visible;
    if (options.anchor) sprite.anchor.set(options.anchor);
    if (options.x !== undefined) sprite.x = options.x;
    if (options.y !== undefined) sprite.y = options.y;

    sprite.anchor.set(0.5);
    return sprite;
  }

  // Créer une animation de victoire
  createWinAnimation(x, y, scale = 1) {
    if (!this.isLoaded) return null;

    const winTextures = this.frameData.specialAnimations?.win?.frames;
    if (!winTextures) return null;

    const baseTexture = PIXI.Texture.from(this.texturePath);
    const textures = winTextures.map(frame => 
      new PIXI.Texture(baseTexture.baseTexture, new PIXI.Rectangle(
        frame.x, frame.y, frame.width, frame.height
      ))
    );

    const animatedSprite = new PIXI.AnimatedSprite(textures);
    animatedSprite.animationSpeed = 0.15;
    animatedSprite.loop = false;
    animatedSprite.anchor.set(0.5);
    animatedSprite.x = x;
    animatedSprite.y = y;
    animatedSprite.scale.set(scale);

    animatedSprite.play();
    
    animatedSprite.onComplete = () => {
      if (animatedSprite.parent) {
        animatedSprite.parent.removeChild(animatedSprite);
      }
    };

    return animatedSprite;
  }

  // Créer une animation de combo
  createComboAnimation(x, y, comboCount, scale = 1) {
    if (!this.isLoaded) return null;

    const comboTextures = this.frameData.specialAnimations?.combo?.frames;
    if (!comboTextures) return null;

    const baseTexture = PIXI.Texture.from(this.texturePath);
    const textures = comboTextures.map(frame => 
      new PIXI.Texture(baseTexture.baseTexture, new PIXI.Rectangle(
        frame.x, frame.y, frame.width, frame.height
      ))
    );

    const animatedSprite = new PIXI.AnimatedSprite(textures);
    animatedSprite.animationSpeed = 0.2;
    animatedSprite.loop = false;
    animatedSprite.anchor.set(0.5);
    animatedSprite.x = x;
    animatedSprite.y = y;
    animatedSprite.scale.set(scale);

    // Ajouter le texte du combo
    const comboText = new PIXI.Text(`x${comboCount}`, {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xFFFFFF,
      stroke: 0x000000,
      strokeThickness: 2
    });
    comboText.anchor.set(0.5);
    comboText.x = 0;
    comboText.y = -40;
    animatedSprite.addChild(comboText);

    animatedSprite.play();
    
    animatedSprite.onComplete = () => {
      if (animatedSprite.parent) {
        animatedSprite.parent.removeChild(animatedSprite);
      }
    };

    return animatedSprite;
  }

  // Créer une animation de montée de niveau
  createLevelUpAnimation(x, y, newLevel, scale = 1) {
    if (!this.isLoaded) return null;

    const levelUpTextures = this.frameData.specialAnimations?.levelUp?.frames;
    if (!levelUpTextures) return null;

    const baseTexture = PIXI.Texture.from(this.texturePath);
    const textures = levelUpTextures.map(frame => 
      new PIXI.Texture(baseTexture.baseTexture, new PIXI.Rectangle(
        frame.x, frame.y, frame.width, frame.height
      ))
    );

    const animatedSprite = new PIXI.AnimatedSprite(textures);
    animatedSprite.animationSpeed = 0.12;
    animatedSprite.loop = false;
    animatedSprite.anchor.set(0.5);
    animatedSprite.x = x;
    animatedSprite.y = y;
    animatedSprite.scale.set(scale);

    // Ajouter le texte du niveau
    const levelText = new PIXI.Text(`Niveau ${newLevel}`, {
      fontFamily: 'Arial',
      fontSize: 20,
      fill: 0x00FF00,
      stroke: 0x000000,
      strokeThickness: 2
    });
    levelText.anchor.set(0.5);
    levelText.x = 0;
    levelText.y = -50;
    animatedSprite.addChild(levelText);

    animatedSprite.play();
    
    animatedSprite.onComplete = () => {
      if (animatedSprite.parent) {
        animatedSprite.parent.removeChild(animatedSprite);
      }
    };

    return animatedSprite;
  }

  // Vérifier si un symbole est chargé
  isSymbolLoaded(symbolName) {
    return this.textures.has(symbolName);
  }

  // Obtenir la liste des symboles disponibles
  getAvailableSymbols() {
    return Array.from(this.textures.keys());
  }

  // Démarrer l'animation d'un symbole
  playSymbolAnimation(symbolName) {
    const animation = this.animations.get(symbolName);
    if (animation && animation instanceof PIXI.AnimatedSprite) {
      animation.play();
    }
  }

  // Arrêter l'animation d'un symbole
  stopSymbolAnimation(symbolName) {
    const animation = this.animations.get(symbolName);
    if (animation && animation instanceof PIXI.AnimatedSprite) {
      animation.stop();
    }
  }

  // Nettoyer les ressources
  destroy() {
    this.textures.clear();
    this.animations.clear();
    this.isLoaded = false;
  }
}

export default SpriteAtlas;

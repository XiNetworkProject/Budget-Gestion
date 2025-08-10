import * as PIXI from 'pixi.js';

class LightingSystem {
  constructor(app, options = {}) {
    this.app = app;
    this.lights = new Map();
    this.shadows = new Map();
    this.lightContainer = new PIXI.Container();
    this.shadowContainer = new PIXI.Container();
    this.ambientLight = options.ambientLight || 0x404040;
    this.ambientIntensity = options.ambientIntensity || 0.3;
    
    // Ajouter les conteneurs à la scène
    this.app.stage.addChild(this.shadowContainer);
    this.app.stage.addChild(this.lightContainer);
    
    // Créer la lumière ambiante
    this.createAmbientLight();
  }

  // Créer la lumière ambiante
  createAmbientLight() {
    const ambient = new PIXI.Graphics();
    ambient.beginFill(this.ambientLight, this.ambientIntensity);
    ambient.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
    ambient.endFill();
    
    this.lightContainer.addChild(ambient);
    this.lights.set('ambient', ambient);
  }

  // Créer une lumière ponctuelle
  createPointLight(x, y, color = 0xFFFFFF, intensity = 1, radius = 100, options = {}) {
    const {
      flicker = false,
      flickerSpeed = 0.1,
      pulse = false,
      pulseSpeed = 0.05,
      castShadows = true
    } = options;

    const gradientTexture = this.createRadialGradient(radius, color, intensity);
    const light = new PIXI.Sprite(gradientTexture);
    light.anchor.set(0.5);
    light.x = x;
    light.y = y;
    light.alpha = Math.max(0, Math.min(1, intensity));
    this.lightContainer.addChild(light);
    
    const lightData = {
      sprite: light,
      x,
      y,
      color,
      intensity,
      radius,
      flicker,
      flickerSpeed,
      pulse,
      pulseSpeed,
      castShadows,
      originalIntensity: intensity,
      time: 0
    };
    
    this.lights.set(`light_${Date.now()}`, lightData);
    
    // Créer les ombres si activé
    if (castShadows) {
      this.createShadow(x, y, radius, color);
    }
    
    return lightData;
  }

  // Créer une lumière directionnelle (comme le soleil)
  createDirectionalLight(angle = 0, color = 0xFFFFCC, intensity = 0.8, options = {}) {
    const {
      castShadows = true,
      shadowLength = 200
    } = options;

    const light = new PIXI.Graphics();
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    
    // Créer un dégradé linéaire dans la direction de la lumière
    light.beginFill(color, intensity);
    light.drawRect(0, 0, width, height);
    light.endFill();
    
    // Appliquer une transformation pour orienter la lumière
    light.rotation = angle;
    
    this.lightContainer.addChild(light);
    
    const lightData = {
      sprite: light,
      angle,
      color,
      intensity,
      castShadows,
      shadowLength,
      type: 'directional'
    };
    
    this.lights.set('directional', lightData);
    
    if (castShadows) {
      this.createDirectionalShadow(angle, shadowLength);
    }
    
    return lightData;
  }

  // Créer un dégradé radial pour la lumière
  createRadialGradient(radius, color, intensity) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = radius * 2;
    canvas.height = radius * 2;
    
    const gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${intensity})`);
    gradient.addColorStop(0.7, `rgba(255, 255, 255, ${intensity * 0.5})`);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    return PIXI.Texture.from(canvas);
  }

  // Créer une ombre pour une lumière ponctuelle
  createShadow(x, y, radius, color) {
    const shadow = new PIXI.Graphics();
    shadow.beginFill(0x000000, 0.4);
    shadow.drawCircle(0, 0, radius * 1.2);
    shadow.endFill();
    shadow.x = x;
    shadow.y = y;
    shadow.alpha = 0.3;
    
    this.shadowContainer.addChild(shadow);
    this.shadows.set(`shadow_${Date.now()}`, shadow);
  }

  // Créer une ombre directionnelle
  createDirectionalShadow(angle, length) {
    const shadow = new PIXI.Graphics();
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    
    shadow.beginFill(0x000000, 0.2);
    shadow.drawRect(0, 0, width, height);
    shadow.endFill();
    
    // Positionner l'ombre dans la direction opposée à la lumière
    shadow.rotation = angle + Math.PI;
    shadow.alpha = 0.4;
    
    this.shadowContainer.addChild(shadow);
    this.shadows.set('directional_shadow', shadow);
  }

  // Créer un effet de lueur
  createGlow(x, y, color = 0x00FFFF, intensity = 0.6, radius = 50) {
    const glow = new PIXI.Graphics();
    
    // Créer plusieurs cercles avec des alphas décroissants
    for (let i = 0; i < 3; i++) {
      const alpha = intensity * (1 - i * 0.3);
      const size = radius * (1 + i * 0.2);
      
      glow.beginFill(color, alpha);
      glow.drawCircle(0, 0, size);
      glow.endFill();
    }
    
    glow.x = x;
    glow.y = y;
    
    this.lightContainer.addChild(glow);
    
    // Animation de pulsation
    let t = 0;
    const animate = (delta) => {
      t += delta * 0.05;
      const scale = 1 + Math.sin(t) * 0.1;
      glow.scale.set(scale);
    };
    
    this.app.ticker.add(animate);
    
    return glow;
  }

  // Mettre à jour toutes les lumières
  update(delta) {
    this.lights.forEach((lightData, key) => {
      if (key === 'ambient' || key === 'directional') return;
      
      lightData.time += delta;
      
      // Effet de scintillement
      if (lightData.flicker) {
        const flickerIntensity = lightData.originalIntensity * 
          (0.8 + Math.sin(lightData.time * lightData.flickerSpeed) * 0.2);
        lightData.sprite.alpha = flickerIntensity;
      }
      
      // Effet de pulsation
      if (lightData.pulse) {
        const pulseScale = 1 + Math.sin(lightData.time * lightData.pulseSpeed) * 0.2;
        lightData.sprite.scale.set(pulseScale);
      }
    });
  }

  // Déplacer une lumière
  moveLight(lightId, x, y) {
    const light = this.lights.get(lightId);
    if (light && light.sprite) {
      light.sprite.x = x;
      light.sprite.y = y;
      light.x = x;
      light.y = y;
      
      // Mettre à jour l'ombre correspondante
      if (light.castShadows) {
        this.updateShadow(lightId, x, y);
      }
    }
  }

  // Mettre à jour une ombre
  updateShadow(lightId, x, y) {
    const shadowKey = `shadow_${lightId}`;
    const shadow = this.shadows.get(shadowKey);
    if (shadow) {
      shadow.x = x;
      shadow.y = y;
    }
  }

  // Changer l'intensité d'une lumière
  setLightIntensity(lightId, intensity) {
    const light = this.lights.get(lightId);
    if (light && light.sprite) {
      light.intensity = intensity;
      light.sprite.alpha = intensity;
    }
  }

  // Changer la couleur d'une lumière
  setLightColor(lightId, color) {
    const light = this.lights.get(lightId);
    if (light && light.sprite) {
      light.color = color;
      light.sprite.tint = color;
    }
  }

  // Supprimer une lumière
  removeLight(lightId) {
    const light = this.lights.get(lightId);
    if (light) {
      this.lightContainer.removeChild(light.sprite);
      this.lights.delete(lightId);
      
      // Supprimer l'ombre correspondante
      if (light.castShadows) {
        this.removeShadow(lightId);
      }
    }
  }

  // Supprimer une ombre
  removeShadow(lightId) {
    const shadowKey = `shadow_${lightId}`;
    const shadow = this.shadows.get(shadowKey);
    if (shadow) {
      this.shadowContainer.removeChild(shadow);
      this.shadows.delete(shadowKey);
    }
  }

  // Nettoyer toutes les lumières
  clear() {
    this.lights.forEach((light, key) => {
      if (key !== 'ambient') {
        this.removeLight(key);
      }
    });
    
    this.shadows.forEach((shadow, key) => {
      this.shadowContainer.removeChild(shadow);
    });
    this.shadows.clear();
  }

  // Détruire le système d'éclairage
  destroy() {
    this.clear();
    
    if (this.lightContainer.parent) {
      this.app.stage.removeChild(this.lightContainer);
    }
    
    if (this.shadowContainer.parent) {
      this.app.stage.removeChild(this.shadowContainer);
    }
  }
}

export default LightingSystem;

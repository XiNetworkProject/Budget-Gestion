import * as PIXI from 'pixi.js';

class ParticleSystem {
  constructor(app, maxParticles = 100) {
    this.app = app;
    this.maxParticles = maxParticles;
    this.particles = [];
    this.emitters = [];
    
    // Dans PixiJS v8, on utilise un Container simple au lieu de ParticleContainer
    // car ParticleContainer a des limitations et une API différente
    this.particleContainer = new PIXI.Container();
    
    app.stage.addChild(this.particleContainer);
  }

  // Créer une explosion de particules avancée
  createExplosion(x, y, color = 0xFFFFFF, count = 20, options = {}) {
    const {
      size = 4,
      life = 60,
      speed = 3,
      gravity = 0.1,
      sparkle = false,
      trail = false
    } = options;

    for (let i = 0; i < count; i++) {
      const particle = new PIXI.Sprite(PIXI.Texture.WHITE);
      particle.width = size;
      particle.height = size;
      particle.tint = color;
      particle.x = x;
      particle.y = y;
      particle.alpha = 1;
      particle.scale.set(1);
      
      // Vitesse aléatoire avec variation
      const angle = (Math.PI * 2 * i) / count;
      const speedVariation = speed + Math.random() * speed;
      const vx = Math.cos(angle) * speedVariation;
      const vy = Math.sin(angle) * speedVariation;
      
      // Rotation et scale
      const rotation = Math.random() * Math.PI * 2;
      const rotationSpeed = (Math.random() - 0.5) * 0.4;
      
      // Effet de scintillement
      if (sparkle) {
        particle.tint = this.getRandomColor();
      }
      
      this.particles.push({
        sprite: particle,
        vx,
        vy,
        rotation,
        rotationSpeed,
        life: life,
        maxLife: life,
        scale: 1,
        scaleSpeed: -0.02,
        gravity: gravity,
        originalColor: color,
        sparkle: sparkle,
        trail: trail
      });
      
      // Utiliser addChild pour un Container simple
      this.particleContainer.addChild(particle);
      
      // Créer une traînée si demandé
      if (trail) {
        this.createTrailParticle(x, y, color, size * 0.5);
      }
    }
  }

  // Créer une particule de traînée
  createTrailParticle(x, y, color, size) {
    const trail = new PIXI.Sprite(PIXI.Texture.WHITE);
    trail.width = size;
    trail.height = size;
    trail.tint = color;
    trail.x = x;
    trail.y = y;
    trail.alpha = 0.6;
    trail.scale.set(0.8);
    
    this.particles.push({
      sprite: trail,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      rotation: 0,
      rotationSpeed: 0,
      life: 20,
      maxLife: 20,
      scale: 0.8,
      scaleSpeed: -0.05,
      gravity: 0.05,
      originalColor: color,
      sparkle: false,
      trail: false
    });
    
    this.particleContainer.addChild(trail);
  }

  // Générer une couleur aléatoire
  getRandomColor() {
    const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF, 0xFF8800, 0x8800FF];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Créer une traînée de particules
  createTrail(x, y, color = 0x00FFFF, count = 5) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        this.createTrailParticle(x, y, color, 3);
      }, i * 50);
    }
  }

  // Créer un effet de collecte avec animation
  createCollectEffect(x, y, targetX, targetY, color = 0xFFD700) {
    const particle = new PIXI.Sprite(PIXI.Texture.WHITE);
    particle.width = 6;
    particle.height = 6;
    particle.tint = color;
    particle.x = x;
    particle.y = y;
    particle.alpha = 1;
    
    this.particles.push({
      sprite: particle,
      vx: (targetX - x) * 0.02,
      vy: (targetY - y) * 0.02,
      rotation: 0,
      rotationSpeed: 0.1,
      life: 120,
      maxLife: 120,
      scale: 1,
      scaleSpeed: 0,
      gravity: 0,
      originalColor: color,
      sparkle: false,
      trail: false,
      isCollecting: true,
      targetX,
      targetY
    });
    
    this.particleContainer.addChild(particle);
  }

  // Créer un flash lumineux
  createFlash(x, y, width, height, color = 0xFFFFFF) {
    const flash = new PIXI.Graphics();
    flash.beginFill(color);
    flash.drawRect(-width/2, -height/2, width, height);
    flash.endFill();
    flash.x = x;
    flash.y = y;
    flash.alpha = 0.8;
    
    this.particleContainer.addChild(flash);
    
    let alpha = 0.8;
    const animate = () => {
      alpha -= 0.1;
      flash.alpha = alpha;
      
      if (alpha <= 0) {
        this.particleContainer.removeChild(flash);
        this.app.ticker.remove(animate);
      }
    };
    
    this.app.ticker.add(animate);
  }

  // Créer une onde de choc
  createWave(x, y, radius, color = 0x00FFFF, options = {}) {
    const {
      duration = 60,
      thickness = 3,
      expandSpeed = 2
    } = options;
    
    const wave = new PIXI.Graphics();
    wave.lineStyle(thickness, color, 1);
    wave.drawCircle(0, 0, 0);
    wave.x = x;
    wave.y = y;
    
    this.particleContainer.addChild(wave);
    
    let currentRadius = 0;
    let life = duration;
    
    const animate = () => {
      life--;
      currentRadius += expandSpeed;
      
      wave.clear();
      wave.lineStyle(thickness, color, life / duration);
      wave.drawCircle(0, 0, currentRadius);
      
      if (life <= 0) {
        this.particleContainer.removeChild(wave);
        this.app.ticker.remove(animate);
      }
    };
    
    this.app.ticker.add(animate);
  }

  // Créer un éclair
  createLightning(x, y, targetX, targetY, color = 0xFFFF00) {
    const lightning = new PIXI.Graphics();
    lightning.lineStyle(2, color, 1);
    
    const path = this.generateLightningPath(x, y, targetX, targetY);
    lightning.moveTo(path[0].x, path[0].y);
    
    for (let i = 1; i < path.length; i++) {
      lightning.lineTo(path[i].x, path[i].y);
    }
    
    this.particleContainer.addChild(lightning);
    
    let life = 10;
    const animate = () => {
      life--;
      lightning.alpha = life / 10;
      
      if (life <= 0) {
        this.particleContainer.removeChild(lightning);
        this.app.ticker.remove(animate);
      }
    };
    
    this.app.ticker.add(animate);
  }

  // Générer un chemin d'éclair avec des zigzags
  generateLightningPath(startX, startY, endX, endY) {
    const path = [{ x: startX, y: startY }];
    const segments = 8;
    
    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const x = startX + (endX - startX) * t;
      const y = startY + (endY - startY) * t;
      
      // Ajouter de l'aléatoire pour l'effet d'éclair
      const offset = 20;
      const randomX = x + (Math.random() - 0.5) * offset;
      const randomY = y + (Math.random() - 0.5) * offset;
      
      path.push({ x: randomX, y: randomY });
    }
    
    path.push({ x: endX, y: endY });
    return path;
  }

  // Créer un vortex
  createVortex(x, y, radius, color = 0xFF69B4, duration = 60) {
    const vortex = new PIXI.Graphics();
    vortex.lineStyle(2, color, 1);
    
    // Créer un motif de vortex
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const startX = Math.cos(angle) * (radius * 0.3);
      const startY = Math.sin(angle) * (radius * 0.3);
      const endX = Math.cos(angle) * radius;
      const endY = Math.sin(angle) * radius;
      
      vortex.moveTo(startX, startY);
      vortex.lineTo(endX, endY);
    }
    
    vortex.x = x;
    vortex.y = y;
    
    this.particleContainer.addChild(vortex);
    
    let life = duration;
    let rotation = 0;
    
    const animate = () => {
      life--;
      rotation += 0.2;
      
      vortex.rotation = rotation;
      vortex.scale.set(1 + (duration - life) / duration);
      vortex.alpha = life / duration;
      
      if (life <= 0) {
        this.particleContainer.removeChild(vortex);
        this.app.ticker.remove(animate);
      }
    };
    
    this.app.ticker.add(animate);
  }

  // Mettre à jour toutes les particules avec effets avancés
  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Mettre à jour la position avec gravité
      if (particle.gravity) {
        particle.vy += particle.gravity;
      }
      
      particle.sprite.x += particle.vx;
      particle.sprite.y += particle.vy;
      
      // Mettre à jour la rotation
      particle.sprite.rotation += particle.rotationSpeed;
      
      // Mettre à jour la vie
      particle.life--;
      
      // Mettre à jour le scale
      particle.sprite.scale.set(particle.scale);
      particle.scale += particle.scaleSpeed;
      
      // Mettre à jour l'alpha
      particle.sprite.alpha = particle.life / particle.maxLife;
      
      // Effet de scintillement pour les particules spéciales
      if (particle.sparkle && particle.life % 5 === 0) {
        particle.sprite.tint = this.getRandomColor();
      }
      
      // Vérifier si la particule doit être supprimée
      if (particle.life <= 0 || particle.sprite.alpha <= 0) {
        this.particleContainer.removeChild(particle.sprite);
        this.particles.splice(i, 1);
        continue;
      }
      
      // Effet spécial pour les particules de collecte
      if (particle.isCollecting) {
        const dx = particle.targetX - particle.sprite.x;
        const dy = particle.targetY - particle.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 10) {
          // Créer une petite explosion à l'arrivée avec options avancées
          this.createExplosion(particle.targetX, particle.targetY, particle.sprite.tint, 8, {
            size: 3,
            life: 30,
            speed: 2,
            sparkle: true
          });
          
          // Supprimer la particule
          this.particleContainer.removeChild(particle.sprite);
          this.particles.splice(i, 1);
        }
      }
    }
  }

  // Nettoyer toutes les particules
  clear() {
    this.particles.forEach(particle => {
      this.particleContainer.removeChild(particle.sprite);
    });
    this.particles = [];
  }

  // Détruire le système
  destroy() {
    this.clear();
    if (this.particleContainer.parent) {
      this.particleContainer.parent.removeChild(this.particleContainer);
    }
  }
}

export default ParticleSystem;

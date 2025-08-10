import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

class ParticleSystem {
  constructor(app, maxParticles = 100) {
    this.app = app;
    this.maxParticles = maxParticles;
    this.particles = [];
    this.emitters = [];
    
    this.particleContainer = new PIXI.ParticleContainer(maxParticles, {
      scale: true,
      position: true,
      alpha: true,
      tint: true,
      rotation: true
    });
    
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
      gravity: 0.05
    });
    
    this.particleContainer.addChild(trail);
  }

  // Obtenir une couleur aléatoire pour le scintillement
  getRandomColor() {
    const colors = [0xFFD700, 0xFF69B4, 0x00FFFF, 0xFF4500, 0x32CD32, 0xFF8C00];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Créer une traînée de particules
  createTrail(x, y, color = 0x00FFFF, count = 5) {
    for (let i = 0; i < count; i++) {
      const particle = new PIXI.Sprite(PIXI.Texture.WHITE);
      particle.width = 3;
      particle.height = 3;
      particle.tint = color;
      particle.x = x + (Math.random() - 0.5) * 20;
      particle.y = y + (Math.random() - 0.5) * 20;
      particle.alpha = 0.8;
      particle.scale.set(0.5);
      
      this.particles.push({
        sprite: particle,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        rotation: 0,
        rotationSpeed: 0,
        life: 30,
        maxLife: 30,
        scale: 0.5,
        scaleSpeed: -0.03
      });
      
      this.particleContainer.addChild(particle);
    }
  }

  // Créer un effet de collecte
  createCollectEffect(x, y, targetX, targetY, color = 0xFFD700) {
    const particle = new PIXI.Sprite(PIXI.Texture.WHITE);
    particle.width = 6;
    particle.height = 6;
    particle.tint = color;
    particle.x = x;
    particle.y = y;
    particle.alpha = 1;
    particle.scale.set(1);
    
    // Animation vers la cible
    const dx = targetX - x;
    const dy = targetY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const speed = 3;
    const vx = (dx / distance) * speed;
    const vy = (dy / distance) * speed;
    
    this.particles.push({
      sprite: particle,
      vx,
      vy,
      rotation: 0,
      rotationSpeed: 0.1,
      life: Math.ceil(distance / speed),
      maxLife: Math.ceil(distance / speed),
      scale: 1,
      scaleSpeed: 0,
      targetX,
      targetY,
      isCollecting: true
    });
    
    this.particleContainer.addChild(particle);
  }

  // Créer un effet de flash
  createFlash(x, y, width, height, color = 0xFFFFFF) {
    const flash = new PIXI.Graphics();
    flash.beginFill(color, 0.8);
    flash.drawRect(0, 0, width, height);
    flash.endFill();
    flash.x = x;
    flash.y = y;
    flash.alpha = 1;
    
    this.app.stage.addChild(flash);
    
    // Animation de fade
    let life = 10;
    const animate = () => {
      life--;
      flash.alpha = life / 10;
      
      if (life <= 0) {
        this.app.stage.removeChild(flash);
        this.app.ticker.remove(animate);
      }
    };
    
    this.app.ticker.add(animate);
  }

  // Créer un effet de vague avancée avec plusieurs anneaux
  createWave(x, y, radius, color = 0x00FFFF, options = {}) {
    const {
      rings = 3,
      thickness = 2,
      duration = 30,
      expandSpeed = 2
    } = options;

    for (let i = 0; i < rings; i++) {
      const wave = new PIXI.Graphics();
      wave.lineStyle(thickness, color, 0.8 - (i * 0.2));
      wave.drawCircle(0, 0, radius);
      wave.x = x;
      wave.y = y;
      wave.alpha = 1;
      
      this.app.stage.addChild(wave);
      
      let life = duration;
      const delay = i * 5; // Délai entre les anneaux
      
      const animate = () => {
        if (delay > 0) {
          delay--;
          return;
        }
        
        life--;
        const progress = 1 - (life / duration);
        wave.scale.set(1 + progress * expandSpeed);
        wave.alpha = 1 - progress;
        
        if (life <= 0) {
          this.app.stage.removeChild(wave);
          this.app.ticker.remove(animate);
        }
      };
      
      this.app.ticker.add(animate);
    }
  }

  // Créer un effet de foudre
  createLightning(x, y, targetX, targetY, color = 0xFFFF00) {
    const lightning = new PIXI.Graphics();
    lightning.lineStyle(4, color, 1);
    
    // Créer un chemin de foudre zigzag
    const points = this.generateLightningPath(x, y, targetX, targetY);
    lightning.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      lightning.lineTo(points[i].x, points[i].y);
    }
    
    this.app.stage.addChild(lightning);
    
    // Animation de clignotement
    let life = 15;
    let visible = true;
    
    const animate = () => {
      life--;
      
      if (life % 3 === 0) {
        visible = !visible;
        lightning.alpha = visible ? 1 : 0.3;
      }
      
      if (life <= 0) {
        this.app.stage.removeChild(lightning);
        this.app.ticker.remove(animate);
      }
    };
    
    this.app.ticker.add(animate);
  }

  // Générer un chemin de foudre zigzag
  generateLightningPath(startX, startY, endX, endY) {
    const points = [{ x: startX, y: startY }];
    const segments = 8;
    
    for (let i = 1; i < segments; i++) {
      const progress = i / segments;
      const x = startX + (endX - startX) * progress;
      const y = startY + (endY - startY) * progress;
      
      // Ajouter de l'aléatoire pour l'effet zigzag
      const offset = 20;
      const randomX = x + (Math.random() - 0.5) * offset;
      const randomY = y + (Math.random() - 0.5) * offset;
      
      points.push({ x: randomX, y: randomY });
    }
    
    points.push({ x: endX, y: endY });
    return points;
  }

  // Créer un effet de vortex
  createVortex(x, y, radius, color = 0xFF69B4, duration = 60) {
    const vortex = new PIXI.Container();
    vortex.x = x;
    vortex.y = y;
    
    // Créer plusieurs particules en spirale
    for (let i = 0; i < 30; i++) {
      const particle = new PIXI.Sprite(PIXI.Texture.WHITE);
      particle.width = 3;
      particle.height = 3;
      particle.tint = color;
      particle.alpha = 0.8;
      
      // Position initiale en spirale
      const angle = (Math.PI * 2 * i) / 30;
      const distance = radius * (i / 30);
      particle.x = Math.cos(angle) * distance;
      particle.y = Math.sin(angle) * distance;
      
      vortex.addChild(particle);
    }
    
    this.app.stage.addChild(vortex);
    
    // Animation de rotation
    let life = duration;
    let rotation = 0;
    
    const animate = () => {
      life--;
      rotation += 0.2;
      
      vortex.rotation = rotation;
      vortex.scale.set(1 + (duration - life) / duration);
      vortex.alpha = life / duration;
      
      if (life <= 0) {
        this.app.stage.removeChild(vortex);
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

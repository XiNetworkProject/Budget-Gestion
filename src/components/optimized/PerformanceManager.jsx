import React, { useEffect, useRef, useState, useCallback } from 'react';

class PerformanceManager {
  constructor() {
    this.fps = 60;
    this.targetFps = 60;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.performanceLevel = 'high'; // 'low', 'medium', 'high'
    this.deviceCapabilities = this.detectDeviceCapabilities();
    this.adaptiveSettings = this.getAdaptiveSettings();
    
    this.startMonitoring();
  }

  // Détecter les capacités de l'appareil
  detectDeviceCapabilities() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      return { webgl: false, maxTextureSize: 0, maxAnisotropy: 0 };
    }

    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const maxAnisotropy = gl.getParameter(gl.EXT_texture_filter_anisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT) || 0;
    
    // Détecter la mémoire GPU (approximative)
    const memoryInfo = gl.getExtension('WEBGL_debug_renderer_info');
    let memorySize = 0;
    if (memoryInfo) {
      const renderer = gl.getParameter(memoryInfo.UNMASKED_RENDERER_WEBGL);
      if (renderer.includes('NVIDIA') || renderer.includes('AMD')) {
        memorySize = 8000; // 8GB estimé
      } else if (renderer.includes('Intel')) {
        memorySize = 2000; // 2GB estimé
      } else {
        memorySize = 4000; // 4GB par défaut
      }
    }

    // Détecter la résolution de l'écran
    const screenRes = window.screen.width * window.screen.height;
    
    return {
      webgl: true,
      maxTextureSize,
      maxAnisotropy,
      memorySize,
      screenRes,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      devicePixelRatio: window.devicePixelRatio || 1
    };
  }

  // Obtenir les paramètres adaptatifs selon les capacités
  getAdaptiveSettings() {
    const caps = this.deviceCapabilities;
    
    if (caps.isMobile || caps.screenRes < 1920000) { // < 1920x1080
      return {
        maxParticles: 100,
        particleSize: 3,
        animationSpeed: 0.8,
        useAntialiasing: false,
        useShadows: false,
        textureQuality: 'medium',
        maxLights: 2
      };
    } else if (caps.memorySize < 4000) { // < 4GB VRAM
      return {
        maxParticles: 200,
        particleSize: 4,
        animationSpeed: 1.0,
        useAntialiasing: true,
        useShadows: false,
        textureQuality: 'high',
        maxLights: 4
      };
    } else {
      return {
        maxParticles: 500,
        particleSize: 5,
        animationSpeed: 1.2,
        useAntialiasing: true,
        useShadows: true,
        textureQuality: 'ultra',
        maxLights: 8
      };
    }
  }

  // Démarrer la surveillance des performances
  startMonitoring() {
    this.monitorInterval = setInterval(() => {
      this.updatePerformance();
    }, 1000);
  }

  // Mettre à jour les métriques de performance
  updatePerformance() {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    
    if (deltaTime > 0) {
      this.fps = Math.round((this.frameCount * 1000) / deltaTime);
      this.frameCount = 0;
      this.lastTime = currentTime;
      
      // Ajuster automatiquement les paramètres selon les performances
      this.adaptToPerformance();
    }
  }

  // Adapter les paramètres selon les performances
  adaptToPerformance() {
    if (this.fps < 30 && this.performanceLevel !== 'low') {
      this.performanceLevel = 'low';
      this.adaptiveSettings = {
        maxParticles: Math.floor(this.adaptiveSettings.maxParticles * 0.5),
        particleSize: Math.max(2, this.adaptiveSettings.particleSize - 1),
        animationSpeed: this.adaptiveSettings.animationSpeed * 0.8,
        useAntialiasing: false,
        useShadows: false,
        textureQuality: 'low',
        maxLights: Math.max(1, Math.floor(this.adaptiveSettings.maxLights * 0.5))
      };
    } else if (this.fps > 55 && this.performanceLevel !== 'high') {
      this.performanceLevel = 'high';
      this.adaptiveSettings = this.getAdaptiveSettings();
    }
  }

  // Obtenir les paramètres actuels
  getCurrentSettings() {
    return {
      ...this.adaptiveSettings,
      performanceLevel: this.performanceLevel,
      currentFps: this.fps
    };
  }

  // Créer une configuration PixiJS optimisée
  getPixiConfig(width, height) {
    const settings = this.getCurrentSettings();
    
    return {
      width,
      height,
      backgroundAlpha: 0,
      antialias: settings.useAntialiasing,
      resolution: Math.min(2, this.deviceCapabilities.devicePixelRatio),
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false,
      preserveDrawingBuffer: false,
      stencil: false,
      depth: false
    };
  }

  // Obtenir les paramètres du système de particules
  getParticleSettings() {
    const settings = this.getCurrentSettings();
    
    return {
      maxParticles: settings.maxParticles,
      particleSize: settings.particleSize,
      animationSpeed: settings.animationSpeed
    };
  }

  // Obtenir les paramètres de qualité des textures
  getTextureSettings() {
    const settings = this.getCurrentSettings();
    
    switch (settings.textureQuality) {
      case 'low':
        return { scale: 0.5, compression: true };
      case 'medium':
        return { scale: 0.75, compression: false };
      case 'high':
        return { scale: 1.0, compression: false };
      case 'ultra':
        return { scale: 1.0, compression: false, mipmap: true };
      default:
        return { scale: 1.0, compression: false };
    }
  }

  // Vérifier si on peut ajouter plus d'effets
  canAddEffect(effectType) {
    const settings = this.getCurrentSettings();
    
    switch (effectType) {
      case 'particles':
        return this.frameCount < settings.maxParticles;
      case 'lights':
        return this.frameCount < settings.maxLights;
      case 'shadows':
        return settings.useShadows;
      case 'antialiasing':
        return settings.useAntialiasing;
      default:
        return true;
    }
  }

  // Obtenir des statistiques de performance
  getPerformanceStats() {
    return {
      fps: this.fps,
      performanceLevel: this.performanceLevel,
      deviceCapabilities: this.deviceCapabilities,
      adaptiveSettings: this.adaptiveSettings,
      frameCount: this.frameCount
    };
  }

  // Nettoyer les ressources
  destroy() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
  }
}

// Hook React pour utiliser le gestionnaire de performance
export const usePerformanceManager = () => {
  const [performanceManager] = useState(() => new PerformanceManager());
  const [stats, setStats] = useState(performanceManager.getPerformanceStats());

  useEffect(() => {
    const updateStats = () => {
      setStats(performanceManager.getPerformanceStats());
    };

    const interval = setInterval(updateStats, 2000);

    return () => {
      clearInterval(interval);
      performanceManager.destroy();
    };
  }, [performanceManager]);

  return {
    performanceManager,
    stats,
    getPixiConfig: useCallback((width, height) => 
      performanceManager.getPixiConfig(width, height), [performanceManager]),
    getParticleSettings: useCallback(() => 
      performanceManager.getParticleSettings(), [performanceManager]),
    getTextureSettings: useCallback(() => 
      performanceManager.getTextureSettings(), [performanceManager]),
    canAddEffect: useCallback((effectType) => 
      performanceManager.canAddEffect(effectType), [performanceManager])
  };
};

export default PerformanceManager;

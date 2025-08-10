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
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        return { webgl: false, maxTextureSize: 0, maxAnisotropy: 0 };
      }

      const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 0;
      const anisotropyExt = gl.getExtension('EXT_texture_filter_anisotropic') 
        || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic') 
        || gl.getExtension('MOZ_EXT_texture_filter_anisotropic');
      const maxAnisotropy = anisotropyExt ? gl.getParameter(anisotropyExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 0;
      
      // Détecter la mémoire GPU (approximative)
      const memoryInfo = gl.getExtension('WEBGL_debug_renderer_info');
      let memorySize = 0;
      if (memoryInfo) {
        const renderer = gl.getParameter(memoryInfo.UNMASKED_RENDERER_WEBGL) || '';
        if (typeof renderer === 'string') {
          if (renderer.includes('NVIDIA') || renderer.includes('AMD')) {
            memorySize = 8000; // 8GB estimé
          } else if (renderer.includes('Intel')) {
            memorySize = 2000; // 2GB estimé
          } else {
            memorySize = 4000; // 4GB par défaut
          }
        }
      }

      // Détecter la résolution de l'écran
      const screenRes = (window?.screen?.width || 0) * (window?.screen?.height || 0);
      
      return {
        webgl: true,
        maxTextureSize,
        maxAnisotropy,
        memorySize,
        screenRes,
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || ''),
        devicePixelRatio: window.devicePixelRatio || 1
      };
    } catch (_) {
      return { webgl: false, maxTextureSize: 0, maxAnisotropy: 0, memorySize: 0, screenRes: 0, isMobile: false, devicePixelRatio: 1 };
    }
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
    const now = performance.now();
    const delta = now - this.lastTime;
    
    if (delta >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / delta);
      this.frameCount = 0;
      this.lastTime = now;
      
      this.adaptToPerformance();
    }
    
    this.frameCount++;
  }

  // Adapter les paramètres selon les performances
  adaptToPerformance() {
    if (this.fps < 30) {
      this.performanceLevel = 'low';
      this.adaptiveSettings.maxParticles = Math.max(50, this.adaptiveSettings.maxParticles * 0.8);
      this.adaptiveSettings.animationSpeed = Math.max(0.5, this.adaptiveSettings.animationSpeed * 0.9);
    } else if (this.fps < 50) {
      this.performanceLevel = 'medium';
      this.adaptiveSettings.maxParticles = Math.min(300, this.adaptiveSettings.maxParticles * 1.1);
      this.adaptiveSettings.animationSpeed = Math.min(1.5, this.adaptiveSettings.animationSpeed * 1.05);
    } else {
      this.performanceLevel = 'high';
      this.adaptiveSettings.maxParticles = Math.min(500, this.adaptiveSettings.maxParticles * 1.2);
      this.adaptiveSettings.animationSpeed = Math.min(2.0, this.adaptiveSettings.animationSpeed * 1.1);
    }
  }

  // Obtenir les paramètres actuels
  getCurrentSettings() {
    return {
      ...this.adaptiveSettings,
      fps: this.fps,
      performanceLevel: this.performanceLevel
    };
  }

  // Configuration PIXI adaptative
  getPixiConfig(width, height) {
    const settings = this.getCurrentSettings();
    
    return {
      width,
      height,
      backgroundColor: 0x1a1a2e,
      backgroundAlpha: 0,
      antialias: settings.useAntialiasing,
      resolution: Math.min(2, window.devicePixelRatio || 1),
      autoDensity: true,
      powerPreference: 'high-performance'
    };
  }

  // Paramètres des particules adaptatifs
  getParticleSettings() {
    const settings = this.getCurrentSettings();
    
    return {
      maxParticles: settings.maxParticles,
      particleSize: settings.particleSize,
      animationSpeed: settings.animationSpeed
    };
  }

  // Paramètres des textures adaptatifs
  getTextureSettings() {
    const settings = this.getCurrentSettings();
    
    return {
      quality: settings.textureQuality,
      useCompression: settings.textureQuality === 'ultra',
      maxSize: this.deviceCapabilities.maxTextureSize
    };
  }

  // Vérifier si on peut ajouter un effet
  canAddEffect(effectType) {
    const settings = this.getCurrentSettings();
    
    switch (effectType) {
      case 'particle':
        return this.frameCount < settings.maxParticles;
      case 'light':
        return this.frameCount < settings.maxLights;
      case 'shadow':
        return settings.useShadows;
      default:
        return true;
    }
  }

  // Obtenir les statistiques de performance
  getPerformanceStats() {
    return {
      fps: this.fps,
      performanceLevel: this.performanceLevel,
      deviceCapabilities: this.deviceCapabilities,
      currentSettings: this.getCurrentSettings()
    };
  }

  // Nettoyer les ressources
  destroy() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
  }
}

// Hook React pour utiliser le PerformanceManager
export const usePerformanceManager = () => {
  const [performanceStats, setPerformanceStats] = useState(null);
  const performanceManagerRef = useRef(null);

  useEffect(() => {
    performanceManagerRef.current = new PerformanceManager();
    
    const updateStats = () => {
      if (performanceManagerRef.current) {
        setPerformanceStats(performanceManagerRef.current.getPerformanceStats());
      }
    };

    const interval = setInterval(updateStats, 1000);
    updateStats(); // Première mise à jour

    return () => {
      clearInterval(interval);
      if (performanceManagerRef.current) {
        performanceManagerRef.current.destroy();
      }
    };
  }, []);

  return {
    performanceStats,
    performanceManager: performanceManagerRef.current
  };
};

export default PerformanceManager;

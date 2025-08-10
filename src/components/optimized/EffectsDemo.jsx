import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import ParticleSystem from './ParticleSystem';
import LightingSystem from './LightingSystem';
import { usePerformanceManager } from './PerformanceManager';

const EffectsDemo = ({ width = 800, height = 600 }) => {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const particleSystemRef = useRef(null);
  const lightingSystemRef = useRef(null);
  const [currentEffect, setCurrentEffect] = useState('particles');
  const [isPlaying, setIsPlaying] = useState(false);
  
  const { performanceManager, stats } = usePerformanceManager();

  useEffect(() => {
    if (!containerRef.current) return;

    // Configuration PixiJS optimisée
    const pixiConfig = performanceManager.getPixiConfig(width, height);
    const app = new PIXI.Application(pixiConfig);
    appRef.current = app;
          // Utiliser app.canvas au lieu de app.view pour PixiJS v8
      if (app.canvas) {
        containerRef.current.appendChild(app.canvas);
      } else {
        console.error('❌ app.canvas est undefined');
        return;
      }

    // Initialiser les systèmes
    const particleSettings = performanceManager.getParticleSettings();
    particleSystemRef.current = new ParticleSystem(app, particleSettings.maxParticles);
    
    lightingSystemRef.current = new LightingSystem(app, {
      ambientLight: 0x202020,
      ambientIntensity: 0.2
    });

    // Fond sombre
    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000);
    bg.drawRect(0, 0, width, height);
    bg.endFill();
    app.stage.addChild(bg);

    // Lumières de base
    lightingSystemRef.current.createPointLight(width / 2, height / 2, 0xFFFFFF, 0.8, 200);
    lightingSystemRef.current.createDirectionalLight(0, 0xFFFFCC, 0.4);

    // Animation loop
    app.ticker.add((delta) => {
      if (particleSystemRef.current) {
        particleSystemRef.current.update();
      }
      if (lightingSystemRef.current) {
        lightingSystemRef.current.update(delta);
      }
    });

    return () => {
      if (particleSystemRef.current) {
        particleSystemRef.current.destroy();
      }
      if (lightingSystemRef.current) {
        lightingSystemRef.current.destroy();
      }
      app.destroy(true, { children: true });
    };
  }, [width, height, performanceManager]);

  // Effets de particules
  const playParticleEffect = (effectType) => {
    if (!particleSystemRef.current || !isPlaying) return;

    const centerX = width / 2;
    const centerY = height / 2;

    switch (effectType) {
      case 'explosion':
        particleSystemRef.current.createExplosion(centerX, centerY, 0xFFD700, 30, {
          size: 5,
          life: 80,
          speed: 4,
          gravity: 0.15,
          sparkle: true,
          trail: true
        });
        break;

      case 'vortex':
        particleSystemRef.current.createVortex(centerX, centerY, 80, 0xFF69B4, 80);
        break;

      case 'lightning':
        particleSystemRef.current.createLightning(
          centerX - 100, centerY - 100,
          centerX + 100, centerY + 100,
          0xFFFF00
        );
        break;

      case 'wave':
        particleSystemRef.current.createWave(centerX, centerY, 60, 0x00FFFF, {
          rings: 4,
          thickness: 4,
          duration: 50,
          expandSpeed: 3
        });
        break;

      case 'trail':
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            particleSystemRef.current.createTrail(
              centerX + (Math.random() - 0.5) * 200,
              centerY + (Math.random() - 0.5) * 200,
              0xFF4500,
              8
            );
          }, i * 100);
        }
        break;

      default:
        break;
    }
  };

  // Effets d'éclairage
  const playLightingEffect = (effectType) => {
    if (!lightingSystemRef.current || !isPlaying) return;

    const centerX = width / 2;
    const centerY = height / 2;

    switch (effectType) {
      case 'pulse':
        lightingSystemRef.current.createPointLight(centerX, centerY, 0xFF69B4, 1, 120, {
          pulse: true,
          pulseSpeed: 0.1
        });
        break;

      case 'flicker':
        lightingSystemRef.current.createPointLight(centerX - 100, centerY, 0x00FFFF, 0.8, 80, {
          flicker: true,
          flickerSpeed: 0.2
        });
        break;

      case 'glow':
        lightingSystemRef.current.createGlow(centerX + 100, centerY, 0xFFD700, 0.7, 60);
        break;

      case 'moving':
        const light = lightingSystemRef.current.createPointLight(centerX, centerY, 0x32CD32, 0.9, 100);
        let angle = 0;
        const animate = () => {
          angle += 0.02;
          const x = centerX + Math.cos(angle) * 100;
          const y = centerY + Math.sin(angle) * 50;
          lightingSystemRef.current.moveLight(light, x, y);
        };
        appRef.current.ticker.add(animate);
        break;

      default:
        break;
    }
  };

  // Effets combinés
  const playCombinedEffect = () => {
    if (!isPlaying) return;

    const centerX = width / 2;
    const centerY = height / 2;

    // Séquence d'effets
    setTimeout(() => {
      particleSystemRef.current.createExplosion(centerX, centerY, 0xFFD700, 40, {
        size: 6,
        life: 100,
        speed: 5,
        sparkle: true
      });
    }, 0);

    setTimeout(() => {
      particleSystemRef.current.createVortex(centerX, centerY, 100, 0xFF69B4, 100);
    }, 200);

    setTimeout(() => {
      particleSystemRef.current.createLightning(
        centerX - 150, centerY - 150,
        centerX + 150, centerY + 150,
        0xFFFF00
      );
    }, 400);

    setTimeout(() => {
      lightingSystemRef.current.createGlow(centerX, centerY, 0x00FFFF, 0.8, 80);
    }, 600);

    setTimeout(() => {
      particleSystemRef.current.createWave(centerX, centerY, 80, 0xFF4500, {
        rings: 5,
        thickness: 5,
        duration: 60,
        expandSpeed: 4
      });
    }, 800);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    if (appRef.current) {
      if (isPlaying) {
        appRef.current.ticker.stop();
      } else {
        appRef.current.ticker.start();
      }
    }
  };

  return (
    <div style={{ width, height, position: 'relative' }}>
      <div ref={containerRef} style={{ width, height, borderRadius: '8px', overflow: 'hidden' }} />
      
      {/* Contrôles */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {/* Bouton de contrôle principal */}
        <button
          onClick={togglePlayback}
          style={{
            padding: '10px 20px',
            backgroundColor: isPlaying ? '#ff4444' : '#44ff44',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {isPlaying ? 'PAUSE' : 'PLAY'}
        </button>

        {/* Sélecteur d'effets */}
        <select
          value={currentEffect}
          onChange={(e) => setCurrentEffect(e.target.value)}
          style={{
            padding: '8px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            fontSize: '14px'
          }}
        >
          <option value="particles">Particules</option>
          <option value="lighting">Éclairage</option>
          <option value="combined">Combinés</option>
        </select>

        {/* Boutons d'effets selon le type sélectionné */}
        {currentEffect === 'particles' && (
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {['explosion', 'vortex', 'lightning', 'wave', 'trail'].map((effect) => (
              <button
                key={effect}
                onClick={() => playParticleEffect(effect)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textTransform: 'capitalize'
                }}
              >
                {effect}
              </button>
            ))}
          </div>
        )}

        {currentEffect === 'lighting' && (
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {['pulse', 'flicker', 'glow', 'moving'].map((effect) => (
              <button
                key={effect}
                onClick={() => playLightingEffect(effect)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textTransform: 'capitalize'
                }}
              >
                {effect}
              </button>
            ))}
          </div>
        )}

        {currentEffect === 'combined' && (
          <button
            onClick={playCombinedEffect}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ff8800',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            MEGA COMBO !
          </button>
        )}

        {/* Stats de performance */}
        <div style={{
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          <div>FPS: {stats.currentFps}</div>
          <div>Niveau: {stats.performanceLevel}</div>
          <div>Particules max: {stats.adaptiveSettings.maxParticles}</div>
          <div>Qualité: {stats.adaptiveSettings.textureQuality}</div>
        </div>
      </div>
    </div>
  );
};

export default EffectsDemo;

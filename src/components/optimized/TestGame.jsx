import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { Box, Button, Typography } from '@mui/material';
import ParticleSystem from './ParticleSystem';
import SpriteAtlas from './SpriteAtlas';
import LightingSystem from './LightingSystem';
import { SPRITE_CONFIG } from './spriteConfig';

const TestGame = () => {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      // Créer l'application PIXI
      const app = new PIXI.Application({
        width: 800,
        height: 600,
        backgroundColor: 0x1a1a2e,
        antialias: true
      });
      
      appRef.current = app;
      containerRef.current.appendChild(app.view);

      // Test du système de particules
      const particleSystem = new ParticleSystem(app, 100);
      
      // Test du système d'éclairage
      const lightingSystem = new LightingSystem(app, {
        ambientLight: 0x404040,
        ambientIntensity: 0.3
      });

      // Test du SpriteAtlas (avec fallback)
      const spriteAtlas = new SpriteAtlas(app, SPRITE_CONFIG.texturePath, SPRITE_CONFIG.frameData);

      // Créer un fond simple
      const bg = new PIXI.Graphics();
      bg.beginFill(0x2a2a4e);
      bg.drawRect(0, 0, 800, 600);
      bg.endFill();
      app.stage.addChild(bg);

      // Créer un texte de test
      const text = new PIXI.Text('Test des systèmes PixiJS', {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xFFFFFF
      });
      text.x = 400 - text.width / 2;
      text.y = 300 - text.height / 2;
      app.stage.addChild(text);

      // Test des particules
      const testParticles = () => {
        particleSystem.createExplosion(400, 300, 0x00FFFF, 20, {
          size: 6,
          life: 60,
          speed: 4,
          gravity: 0.1,
          sparkle: true
        });
      };

      // Test de l'éclairage
      const testLighting = () => {
        lightingSystem.createPointLight(400, 300, 0xFFFF00, 0.8, 100, {
          pulse: true,
          pulseSpeed: 0.05
        });
      };

      // Ajouter des boutons de test
      const testButton = new PIXI.Graphics();
      testButton.beginFill(0x2196F3);
      testButton.drawRoundedRect(0, 0, 120, 40, 8);
      testButton.endFill();
      testButton.x = 50;
      testButton.y = 500;
      app.stage.addChild(testButton);

      const buttonText = new PIXI.Text('Test Particules', {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 0xFFFFFF
      });
      buttonText.x = 60;
      buttonText.y = 510;
      app.stage.addChild(buttonText);

      // Interaction
      testButton.interactive = true;
      testButton.buttonMode = true;
      testButton.on('pointerdown', testParticles);

      // Animation loop
      const animate = () => {
        particleSystem.update();
        lightingSystem.update(0.016);
        requestAnimationFrame(animate);
      };
      animate();

      console.log('✅ TestGame: Tous les systèmes initialisés avec succès');

    } catch (err) {
      console.error('❌ TestGame: Erreur lors de l\'initialisation:', err);
      setError(err.message);
    }

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
      }
    };
  }, []);

  if (error) {
    return (
      <Box sx={{ p: 2, color: 'red' }}>
        <Typography variant="h6">Erreur de test:</Typography>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Test des systèmes PixiJS
      </Typography>
      <Box ref={containerRef} sx={{ border: '1px solid #ccc', borderRadius: 1 }} />
      <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
        Cliquez sur le bouton bleu pour tester les particules
      </Typography>
    </Box>
  );
};

export default TestGame;

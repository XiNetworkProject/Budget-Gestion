import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { Box, Typography } from '@mui/material';

const SimpleTest = () => {
  const containerRef = useRef(null);
  const appRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      console.log('🚀 SimpleTest: Initialisation...');
      
      // Créer l'application PIXI avec des paramètres simples
      const app = new PIXI.Application({
        width: 400,
        height: 300,
        backgroundColor: 0x2a2a4e,
        antialias: true
      });

      appRef.current = app;
      containerRef.current.appendChild(app.view);

      // Créer un fond simple
      const bg = new PIXI.Graphics();
      bg.beginFill(0x1a1a2e);
      bg.drawRect(0, 0, 400, 300);
      bg.endFill();
      app.stage.addChild(bg);

      // Créer un texte de test
      const text = new PIXI.Text('Test PixiJS OK', {
        fontFamily: 'Arial',
        fontSize: 20,
        fill: 0xFFFFFF
      });
      text.x = 200 - text.width / 2;
      text.y = 150 - text.height / 2;
      app.stage.addChild(text);

      // Créer un cercle coloré
      const circle = new PIXI.Graphics();
      circle.beginFill(0x00FF88);
      circle.drawCircle(0, 0, 30);
      circle.endFill();
      circle.x = 200;
      circle.y = 150;
      app.stage.addChild(circle);

      console.log('✅ SimpleTest: Initialisation réussie');

    } catch (err) {
      console.error('❌ SimpleTest: Erreur lors de l\'initialisation:', err);
    }

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
      }
    };
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Test Simple PixiJS
      </Typography>
      <Box ref={containerRef} sx={{ border: '1px solid #ccc', borderRadius: 1 }} />
      <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
        Si vous voyez un cercle vert et du texte, PixiJS fonctionne correctement.
      </Typography>
    </Box>
  );
};

export default SimpleTest;

import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { Box, Typography, Button } from '@mui/material';

const SimpleTest = () => {
  const containerRef = useRef(null);
  const [status, setStatus] = useState('En attente...');
  const [error, setError] = useState(null);
  const [pixiLoaded, setPixiLoaded] = useState(false);

  useEffect(() => {
    // Vérifier que PIXI est chargé
    try {
      console.log('🔍 Vérification de PIXI...');
      console.log('PIXI:', PIXI);
      console.log('PIXI.VERSION:', PIXI.VERSION);
      console.log('PIXI.Application:', PIXI.Application);
      
      if (PIXI && PIXI.Application) {
        setPixiLoaded(true);
        setStatus('PIXI chargé avec succès');
        console.log('✅ PIXI est disponible');
      } else {
        setError('PIXI.Application n\'est pas disponible');
        console.error('❌ PIXI.Application manquant');
      }
    } catch (err) {
      setError(`Erreur lors du chargement de PIXI: ${err.message}`);
      console.error('❌ Erreur PIXI:', err);
    }
  }, []);

  const testPixiApp = async () => {
    if (!containerRef.current) {
      setError('Container non disponible');
      return;
    }

    try {
      setStatus('Création de l\'application PIXI...');
      console.log('🚀 Création de l\'application PIXI...');

      // Créer une application avec la configuration correcte pour PixiJS v8
      const app = new PIXI.Application({
        width: 400,
        height: 300,
        backgroundColor: 0x2a2a4e,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
      });

      console.log('✅ Application créée:', app);
      console.log('Propriétés de app:', Object.keys(app));
      console.log('app.view:', app.view);
      console.log('app.canvas:', app.canvas);
      console.log('app.screen:', app.screen);

      // Attendre que l'application soit prête
      await app.init();

      // Dans PixiJS v8, on utilise app.view qui est un HTMLCanvasElement
      if (app.view && app.view instanceof HTMLCanvasElement) {
        console.log('✅ Utilisation de app.view (HTMLCanvasElement)');
        
        // Nettoyer le container avant d'ajouter
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
        
        // Ajouter le canvas au DOM
        containerRef.current.appendChild(app.view);
        
        // Créer un cercle simple
        const circle = new PIXI.Graphics();
        circle.beginFill(0x00FF88);
        circle.drawCircle(0, 0, 30);
        circle.endFill();
        circle.x = 200;
        circle.y = 150;
        app.stage.addChild(circle);

        setStatus('✅ Test réussi ! Cercle vert affiché');
        console.log('✅ Test PIXI réussi');
      } else {
        console.log('❌ app.view n\'est pas un HTMLCanvasElement valide');
        console.log('Type de app.view:', typeof app.view);
        console.log('app.view:', app.view);
        setError('app.view n\'est pas un canvas valide');
        return;
      }

    } catch (err) {
      const errorMsg = `Erreur lors du test PIXI: ${err.message}`;
      setError(errorMsg);
      console.error('❌ Erreur test PIXI:', err);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Test Simple PixiJS
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
          Statut: {status}
        </Typography>
        
        {error && (
          <Typography variant="body2" sx={{ color: 'error.main', mb: 1 }}>
            Erreur: {error}
          </Typography>
        )}
        
        {pixiLoaded && (
          <Button 
            variant="contained" 
            onClick={testPixiApp}
            sx={{ mb: 2 }}
          >
            Tester PIXI
          </Button>
        )}
      </Box>

      <Box 
        ref={containerRef} 
        sx={{ 
          border: '1px solid #ccc', 
          borderRadius: 1, 
          minHeight: '300px',
          backgroundColor: '#f5f5f5'
        }} 
      />
      
      <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
        Vérifiez la console pour les logs détaillés.
      </Typography>
    </Box>
  );
};

export default SimpleTest;

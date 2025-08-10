import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { Box, Button, Stack, Typography, Chip } from '@mui/material';
import SpriteAtlas from './SpriteAtlas';
import { SPRITE_CONFIG, SYMBOL_EFFECTS } from './spriteConfig';

const SpriteAtlasDemo = ({ width = 800, height = 600 }) => {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const spriteAtlasRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSymbol, setCurrentSymbol] = useState('saver');
  const [animationType, setAnimationType] = useState('normal');

  useEffect(() => {
    if (!containerRef.current) return;

    const app = new PIXI.Application({ 
      width, 
      height, 
      backgroundAlpha: 0, 
      antialias: true,
      resolution: window.devicePixelRatio || 1
    });
    appRef.current = app;
    containerRef.current.appendChild(app.view);

    // Fond
    const bg = new PIXI.Graphics();
    bg.beginFill(0x1a1a2e);
    bg.drawRect(0, 0, width, height);
    bg.endFill();
    app.stage.addChild(bg);

    // Initialiser le SpriteAtlas
    spriteAtlasRef.current = new SpriteAtlas(app, SPRITE_CONFIG.texturePath, SPRITE_CONFIG.frameData);
    
    // Attendre que le SpriteAtlas soit chargé
    const checkLoaded = () => {
      if (spriteAtlasRef.current.isLoaded) {
        setIsLoaded(true);
        createDemoScene();
      } else {
        setTimeout(checkLoaded, 100);
      }
    };
    checkLoaded();

    return () => {
      if (spriteAtlasRef.current) {
        spriteAtlasRef.current.destroy();
      }
      app.destroy(true, { children: true });
    };
  }, [width, height]);

  const createDemoScene = () => {
    if (!appRef.current || !spriteAtlasRef.current) return;

    const app = appRef.current;
    const stage = app.stage;

    // Titre
    const title = new PIXI.Text('SpriteAtlas Demo - Système de Spritesheet', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xFFFFFF,
      stroke: 0x000000,
      strokeThickness: 2
    });
    title.anchor.set(0.5);
    title.x = width / 2;
    title.y = 40;
    stage.addChild(title);

    // Grille de démonstration des symboles
    const symbols = Object.keys(SPRITE_CONFIG.frameData);
    const cols = 4;
    const rows = Math.ceil(symbols.length / cols);
    const cellSize = 120;
    const padding = 20;
    const startX = (width - (cols * cellSize + (cols - 1) * padding)) / 2;
    const startY = 100;

    symbols.forEach((symbolName, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      const cellContainer = new PIXI.Container();
      cellContainer.x = startX + col * (cellSize + padding);
      cellContainer.y = startY + row * (cellSize + padding);

      // Frame de la cellule
      const frame = new PIXI.Graphics();
      frame.lineStyle(2, 0xFFFFFF, 0.8);
      frame.drawRoundedRect(0, 0, cellSize, cellSize, 8);
      cellContainer.addChild(frame);

      // Symbole animé
      const symbol = spriteAtlasRef.current.createAnimatedSprite(symbolName, {
        x: cellSize / 2,
        y: cellSize / 2,
        scale: 0.8
      });
      if (symbol) {
        cellContainer.addChild(symbol);
        
        // Démarrer l'animation
        if (symbol instanceof PIXI.AnimatedSprite) {
          symbol.play();
        }
      }

      // Nom du symbole
      const nameText = new PIXI.Text(symbolName, {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: 0xFFFFFF
      });
      nameText.anchor.set(0.5);
      nameText.x = cellSize / 2;
      nameText.y = cellSize + 15;
      cellContainer.addChild(nameText);

      // Rendre interactif
      cellContainer.interactive = true;
      cellContainer.buttonMode = true;
      cellContainer.on('pointerdown', () => {
        setCurrentSymbol(symbolName);
        playSymbolEffect(symbolName);
      });

      stage.addChild(cellContainer);
    });

    // Zone de démonstration des animations spéciales
    const demoZone = new PIXI.Container();
    demoZone.x = 50;
    demoZone.y = height - 200;
    stage.addChild(demoZone);

    const demoTitle = new PIXI.Text('Animations Spéciales:', {
      fontFamily: 'Arial',
      fontSize: 18,
      fill: 0xFFFFFF
    });
    demoZone.addChild(demoTitle);

    // Boutons pour les animations spéciales
    const specialAnimations = [
      { name: 'Victoire', key: 'win', color: 0x00FF00 },
      { name: 'Combo', key: 'combo', color: 0xFFD700 },
      { name: 'Niveau', key: 'levelUp', color: 0x00FFFF }
    ];

    specialAnimations.forEach((anim, index) => {
      const btn = new PIXI.Graphics();
      btn.beginFill(anim.color, 0.8);
      btn.drawRoundedRect(0, 0, 100, 30, 6);
      btn.endFill();
      btn.x = index * 120;
      btn.y = 30;
      btn.interactive = true;
      btn.buttonMode = true;
      btn.on('pointerdown', () => playSpecialAnimation(anim.key));
      demoZone.addChild(btn);

      const btnText = new PIXI.Text(anim.name, {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: 0xFFFFFF
      });
      btnText.anchor.set(0.5);
      btnText.x = index * 120 + 50;
      btnText.y = 45;
      demoZone.addChild(btnText);
    });

    // Informations sur le SpriteAtlas
    const infoContainer = new PIXI.Container();
    infoContainer.x = width - 300;
    infoContainer.y = height - 200;
    stage.addChild(infoContainer);

    const infoTitle = new PIXI.Text('Informations SpriteAtlas:', {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xFFFFFF
    });
    infoContainer.addChild(infoTitle);

    const infoText = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: 0xCCCCCC
    });
    infoText.y = 25;
    infoContainer.addChild(infoText);

    // Mise à jour des informations
    const updateInfo = () => {
      if (spriteAtlasRef.current) {
        const availableSymbols = spriteAtlasRef.current.getAvailableSymbols();
        infoText.text = `Symboles chargés: ${availableSymbols.length}\nSymbole actuel: ${currentSymbol}\nType d'animation: ${animationType}`;
      }
    };

    app.ticker.add(updateInfo);
  };

  const playSymbolEffect = (symbolName) => {
    if (!appRef.current || !spriteAtlasRef.current) return;

    const app = appRef.current;
    const effects = SYMBOL_EFFECTS[symbolName];
    
    if (effects) {
      // Effet de lueur
      const glow = new PIXI.Graphics();
      glow.beginFill(effects.glowColor, 0.3);
      glow.drawCircle(width / 2, height / 2, 100);
      glow.endFill();
      app.stage.addChild(glow);

      // Animation de la lueur
      let alpha = 0.3;
      let growing = true;
      const glowAnimation = () => {
        if (growing) {
          alpha += 0.02;
          if (alpha >= 0.6) growing = false;
        } else {
          alpha -= 0.02;
          if (alpha <= 0.1) growing = true;
        }
        glow.alpha = alpha;
      };

      app.ticker.add(glowAnimation);

      // Supprimer après 3 secondes
      setTimeout(() => {
        app.ticker.remove(glowAnimation);
        app.stage.removeChild(glow);
      }, 3000);
    }
  };

  const playSpecialAnimation = (animationType) => {
    if (!appRef.current || !spriteAtlasRef.current) return;

    const app = appRef.current;
    let animation;

    switch (animationType) {
      case 'win':
        animation = spriteAtlasRef.current.createWinAnimation(width / 2, height / 2, 1.5);
        break;
      case 'combo':
        animation = spriteAtlasRef.current.createComboAnimation(width / 2, height / 2, 5, 1.2);
        break;
      case 'levelUp':
        animation = spriteAtlasRef.current.createLevelUpAnimation(width / 2, height / 2, 10, 1.0);
        break;
    }

    if (animation) {
      app.stage.addChild(animation);
      setAnimationType(animationType);
    }
  };

  return (
    <Box sx={{ width, height, position: 'relative' }}>
      <Box ref={containerRef} style={{ width, height, borderRadius: '8px', overflow: 'hidden' }} />
      
      {!isLoaded && (
        <Box sx={{ 
          position: 'absolute', 
          inset: 0, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: 'white'
        }}>
          Chargement du SpriteAtlas...
        </Box>
      )}
      
      {/* Contrôles React */}
      <Box sx={{ 
        position: 'absolute', 
        top: 20, 
        left: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}>
        <Chip 
          label={`Symbole: ${currentSymbol}`}
          color="primary"
          variant="outlined"
        />
        
        <Chip 
          label={`Animation: ${animationType}`}
          color="secondary"
          variant="outlined"
        />
        
        <Chip 
          label={`Statut: ${isLoaded ? 'Chargé' : 'Chargement...'}`}
          color={isLoaded ? 'success' : 'warning'}
          variant="outlined"
        />
      </Box>
      
      {/* Instructions */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: 20, 
        left: 20,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: 2,
        borderRadius: 1
      }}>
        <Typography variant="body2">
          <strong>Instructions:</strong> Cliquez sur un symbole pour voir ses effets, 
          utilisez les boutons d'animations spéciales pour tester les animations de victoire, combo et niveau.
        </Typography>
      </Box>
    </Box>
  );
};

export default SpriteAtlasDemo;

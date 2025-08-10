import React, { useEffect, useRef, useState, memo, useCallback } from 'react';
import * as PIXI from 'pixi.js';
import { Box, Button, Stack, Typography, Chip } from '@mui/material';
import ParticleSystem from './ParticleSystem';
import SpriteAtlas from './SpriteAtlas';
import LightingSystem from './LightingSystem';
import { usePerformanceManager } from './PerformanceManager';
import { SPRITE_CONFIG, SYMBOL_EFFECTS } from './spriteConfig';

// Configuration du jeu
const GAME_CONFIG = {
  cols: 4,
  rows: 3,
  cellSize: 120,
  padding: 20,
  symbols: ['saver', 'optimizer', 'collector', 'defender', 'bonusSpin', 'unlocker', 'payer', 'sniper'],
  symbolWeights: [25, 20, 18, 15, 12, 8, 2, 0], // Probabilités
  lockedRows: 2, // Lignes verrouillées au début
  spinsPerRun: 10,
  baseMultiplier: 1.0
};

// Spritesheet des symboles (simulation - en vrai on aurait un atlas)
const SYMBOL_TEXTURES = {
  saver: '/images/game/symbol-saver.svg',
  optimizer: '/images/game/symbol-optimizer.svg',
  collector: '/images/game/symbol-collector.svg',
  defender: '/images/game/symbol-defender.svg',
  bonusSpin: '/images/game/symbol-bonus.svg',
  unlocker: '/images/game/symbol-unlocker.svg',
  payer: '/images/game/symbol-payer.svg',
  sniper: '/images/game/symbol-sniper.svg'
};

// Couleurs des symboles pour les particules
const SYMBOL_COLORS = {
  saver: 0x00FFFF,
  optimizer: 0xFFD700,
  collector: 0xFF69B4,
  defender: 0x32CD32,
  bonusSpin: 0xFF4500,
  unlocker: 0xFF8C00,
  payer: 0x32CD32,
  sniper: 0xDC143C
};

const MoneyCartPixi = memo(({ width = 800, height = 600, onGameComplete }) => {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const particleSystemRef = useRef(null);
  const spriteAtlasRef = useRef(null);
  const gameStateRef = useRef({
    currentSpin: 0,
    totalSpins: GAME_CONFIG.spinsPerRun,
    multiplier: GAME_CONFIG.baseMultiplier,
    points: 0,
    lockedRows: GAME_CONFIG.lockedRows,
    board: [],
    revealedCells: new Set(),
    isPlaying: false,
    isPaused: false
  });
  const [gameStats, setGameStats] = useState({
    currentSpin: 0,
    totalSpins: GAME_CONFIG.spinsPerRun,
    multiplier: GAME_CONFIG.baseMultiplier,
    points: 0,
    lockedRows: GAME_CONFIG.lockedRows
  });
  const [ready, setReady] = useState(false);

  // Initialisation du board
  const initializeBoard = useCallback(() => {
    const board = [];
    for (let r = 0; r < GAME_CONFIG.rows; r++) {
      const row = [];
      for (let c = 0; c < GAME_CONFIG.cols; c++) {
        const isLocked = r < gameStateRef.current.lockedRows;
        row.push({
          symbol: null,
          isRevealed: false,
          isLocked,
          x: c,
          y: r,
          value: Math.floor(Math.random() * 100) + 10,
          multiplier: 1.0
        });
      }
      board.push(row);
    }
    gameStateRef.current.board = board;
    return board;
  }, []);

  // Génération d'un symbole aléatoire
  const generateSymbol = useCallback(() => {
    const totalWeight = GAME_CONFIG.symbolWeights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < GAME_CONFIG.symbols.length; i++) {
      random -= GAME_CONFIG.symbolWeights[i];
      if (random <= 0) {
        return GAME_CONFIG.symbols[i];
      }
    }
    return GAME_CONFIG.symbols[0];
  }, []);

  // Révélation d'une cellule avec effets visuels avancés
  const revealCell = useCallback((row, col, app) => {
    const cell = gameStateRef.current.board[row][col];
    if (cell.isRevealed || cell.isLocked) return;

    const symbol = generateSymbol();
    cell.symbol = symbol;
    cell.isRevealed = true;
    gameStateRef.current.revealedCells.add(`${row}-${col}`);

    // Animation de révélation
    const cellContainer = app.stage.getChildByName('grid').getChildByName(`cell-${row}-${col}`);
    if (cellContainer) {
      const icon = cellContainer.getChildByName('icon');
      const frame = cellContainer.getChildByName('frame');
      
      // Position de la cellule pour les effets
      const cellX = cellContainer.x + GAME_CONFIG.cellSize / 2;
      const cellY = cellContainer.y + GAME_CONFIG.cellSize / 2;
      
      // Effet de flash avec particules
      if (particleSystemRef.current) {
        particleSystemRef.current.createFlash(
          cellContainer.x, 
          cellContainer.y, 
          GAME_CONFIG.cellSize, 
          GAME_CONFIG.cellSize, 
          SYMBOL_COLORS[symbol] || 0xFFFFFF
        );
        
        // Explosion de particules avancée avec options
        particleSystemRef.current.createExplosion(
          cellX, 
          cellY, 
          SYMBOL_COLORS[symbol] || 0xFFFFFF, 
          15,
          {
            size: 4,
            life: 60,
            speed: 3,
            gravity: 0.1,
            sparkle: true,
            trail: true
          }
        );
      }

      // Créer le sprite animé avec le SpriteAtlas
      if (spriteAtlasRef.current && spriteAtlasRef.current.isSymbolLoaded(symbol)) {
        // Supprimer l'ancienne icône
        cellContainer.removeChild(icon);
        
        // Créer le nouveau sprite animé
        const animatedIcon = spriteAtlasRef.current.createAnimatedSprite(symbol, {
          x: GAME_CONFIG.cellSize / 2,
          y: GAME_CONFIG.cellSize / 2,
          scale: 0.1,
          alpha: 0,
          visible: true
        });
        animatedIcon.name = 'icon';
        animatedIcon.rotation = Math.PI * 2;
        cellContainer.addChild(animatedIcon);
        
        // Démarrer l'animation
        if (animatedIcon instanceof PIXI.AnimatedSprite) {
          animatedIcon.play();
        }
        
        // Mettre à jour la référence pour l'animation
        icon = animatedIcon;
      } else {
        // Fallback vers l'ancien système
        icon.texture = PIXI.Texture.from(SYMBOL_TEXTURES[symbol] || SYMBOL_TEXTURES.saver);
        icon.scale.set(0.1);
        icon.alpha = 0;
        icon.rotation = Math.PI * 2;
        icon.visible = true;
      }

      // Timeline d'animation avec easing
      let t = 0;
      const animate = (delta) => {
        t += delta * 0.15;
        const progress = Math.min(1, t);
        
        // Easing function (bounce)
        const easeOutBounce = (x) => {
          const n1 = 7.5625;
          const d1 = 2.75;
          if (x < 1 / d1) return n1 * x * x;
          if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
          if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
          return n1 * (x -= 2.625 / d1) * x + 0.984375;
        };
        
        const easedProgress = easeOutBounce(progress);
        
        // Icon reveal avec bounce
        const scale = 0.1 + (0.9 * easedProgress);
        const alpha = progress;
        const rotation = Math.PI * 2 * (1 - easedProgress);
        
        icon.scale.set(scale);
        icon.alpha = alpha;
        icon.rotation = rotation;

        if (progress >= 1) {
          app.ticker.remove(animate);
          
          // Effet de vague avancée après la révélation
          if (particleSystemRef.current) {
            particleSystemRef.current.createWave(cellX, cellY, 30, SYMBOL_COLORS[symbol] || 0xFFFFFF, {
              rings: 3,
              thickness: 3,
              duration: 40,
              expandSpeed: 2.5
            });
          }
          
          // Effets spéciaux basés sur le type de symbole
          if (particleSystemRef.current && SYMBOL_EFFECTS[symbol]) {
            const effects = SYMBOL_EFFECTS[symbol];
            
            // Effet de lueur
            if (lightingSystem) {
              lightingSystem.createGlow(cellX, cellY, effects.glowColor, 0.4, 60);
            }
            
            // Effets de particules spéciaux
            switch (effects.specialEffect) {
              case 'vortex':
                particleSystemRef.current.createVortex(cellX, cellY, 40, effects.particleColor, {
                  particles: 25,
                  rotationSpeed: 0.2,
                  expansionSpeed: 1.5
                });
                break;
              case 'sparkle':
                particleSystemRef.current.createExplosion(cellX, cellY, effects.particleColor, 20, {
                  size: 3,
                  life: 80,
                  speed: 2,
                  sparkle: true,
                  trail: true
                });
                break;
              case 'shield':
                particleSystemRef.current.createWave(cellX, cellY, 50, effects.particleColor, {
                  rings: 5,
                  thickness: 4,
                  duration: 60,
                  expandSpeed: 1.8
                });
                break;
              case 'explosion':
                particleSystemRef.current.createExplosion(cellX, cellY, effects.particleColor, 30, {
                  size: 6,
                  life: 100,
                  speed: 4,
                  gravity: 0.15,
                  sparkle: true,
                  trail: true
                });
                break;
              case 'unlock':
                particleSystemRef.current.createLightning(cellX, cellY, 80, effects.particleColor, {
                  branches: 3,
                  intensity: 0.8,
                  duration: 50
                });
                break;
              case 'money':
                particleSystemRef.current.createExplosion(cellX, cellY, effects.particleColor, 25, {
                  size: 5,
                  life: 90,
                  speed: 3,
                  gravity: 0.1,
                  sparkle: true
                });
                break;
              case 'target':
                particleSystemRef.current.createVortex(cellX, cellY, 60, effects.particleColor, {
                  particles: 35,
                  rotationSpeed: 0.3,
                  expansionSpeed: 2.0
                });
                break;
            }
          }
          
          // Appliquer les effets du symbole
          applySymbolEffect(symbol, row, col);
          
          // Continuer le jeu
          setTimeout(() => continueGame(app), 800);
        }
      };
      app.ticker.add(animate);
    }
  }, [generateSymbol]);

  // Application des effets des symboles avec effets visuels
  const applySymbolEffect = useCallback((symbol, row, col) => {
    const gameState = gameStateRef.current;
    const cellContainer = appRef.current.stage.getChildByName('grid').getChildByName(`cell-${row}-${col}`);
    const cellX = cellContainer.x + GAME_CONFIG.cellSize / 2;
    const cellY = cellContainer.y + GAME_CONFIG.cellSize / 2;
    
    switch (symbol) {
      case 'saver':
        // Collecte tous les montants visibles avec effets visuels
        let totalCollected = 0;
        const collectPromises = [];
        
        gameState.board.forEach((r, rIdx) => {
          r.forEach((cell, cIdx) => {
            if (cell.isRevealed && !cell.isLocked) {
              totalCollected += cell.value * cell.multiplier;
              
              // Effet de collecte vers le haut de l'écran
              const targetContainer = appRef.current.stage.getChildByName('grid').getChildByName(`cell-${rIdx}-${cIdx}`);
              if (targetContainer && particleSystemRef.current) {
                const targetX = targetContainer.x + GAME_CONFIG.cellSize / 2;
                const targetY = 50; // Vers le haut
                
                particleSystemRef.current.createCollectEffect(
                  targetX, 
                  targetContainer.y + GAME_CONFIG.cellSize / 2, 
                  targetX, 
                  targetY, 
                  SYMBOL_COLORS.saver
                );
              }
            }
          });
        });
        
        gameState.points += totalCollected;
        
        // Explosion finale de points
        if (particleSystemRef.current) {
          particleSystemRef.current.createExplosion(width / 2, 50, 0xFFD700, 25);
        }
        
        // Animation de combo si plusieurs cellules collectées
        const collectedCount = gameState.board.flat().filter(cell => cell.isRevealed && !cell.isLocked).length;
        if (collectedCount > 1 && spriteAtlasRef.current) {
          const comboAnimation = spriteAtlasRef.current.createComboAnimation(width / 2, 100, collectedCount, 1.2);
          if (comboAnimation) {
            appRef.current.stage.addChild(comboAnimation);
          }
        }
        break;
        
      case 'optimizer':
        // Double le montant de la cellule révélée et augmente le multiplicateur
        const cell = gameState.board[row][col];
        cell.value *= 2;
        gameState.multiplier += 0.5;
        
        // Effet de montée du multiplicateur
        if (particleSystemRef.current) {
          particleSystemRef.current.createTrail(cellX, cellY, 0xFFD700, 8);
        }
        
        // Animation de montée de niveau pour le multiplicateur
        if (spriteAtlasRef.current) {
          const levelUpAnimation = spriteAtlasRef.current.createLevelUpAnimation(
            width / 2, 
            height - 100, 
            Math.floor(gameState.multiplier), 
            1.0
          );
          if (levelUpAnimation) {
            appRef.current.stage.addChild(levelUpAnimation);
          }
        }
        break;
        
      case 'collector':
        // Collecte les cellules voisines
        const neighbors = [
          [row-1, col], [row+1, col], [row, col-1], [row, col+1]
        ].filter(([r, c]) => r >= 0 && r < GAME_CONFIG.rows && c >= 0 && c < GAME_CONFIG.cols);
        
        neighbors.forEach(([r, c]) => {
          const neighbor = gameState.board[r][c];
          if (neighbor.isRevealed && !neighbor.isLocked) {
            gameState.points += neighbor.value * neighbor.multiplier;
            
            // Effet de collecte vers la cellule centrale
            const neighborContainer = appRef.current.stage.getChildByName('grid').getChildByName(`cell-${r}-${c}`);
            if (neighborContainer && particleSystemRef.current) {
              particleSystemRef.current.createCollectEffect(
                neighborContainer.x + GAME_CONFIG.cellSize / 2,
                neighborContainer.y + GAME_CONFIG.cellSize / 2,
                cellX,
                cellY,
                SYMBOL_COLORS.collector
              );
            }
          }
        });
        break;
        
      case 'defender':
        // Protège une ligne du verrouillage
        if (gameState.lockedRows > 0) {
          gameState.lockedRows--;
          
          // Effet de protection
          if (particleSystemRef.current) {
            particleSystemRef.current.createWave(cellX, cellY, 60, 0x32CD32);
          }
        }
        break;
        
      case 'bonusSpin':
        // +1 spin
        gameState.totalSpins++;
        
        // Effet de bonus
        if (particleSystemRef.current) {
          particleSystemRef.current.createExplosion(cellX, cellY, 0xFF4500, 20);
        }
        break;
        
      case 'unlocker':
        // Déverrouille une ligne
        if (gameState.lockedRows > 0) {
          gameState.lockedRows--;
          
          // Effet de déverrouillage
          if (particleSystemRef.current) {
            particleSystemRef.current.createWave(cellX, cellY, 80, 0xFF8C00);
          }
        }
        break;
        
      case 'payer':
        // Paiement immédiat (points x2)
        gameState.points *= 2;
        
        // Effet de paiement
        if (particleSystemRef.current) {
          particleSystemRef.current.createExplosion(cellX, cellY, 0x32CD32, 30);
        }
        break;
        
      case 'sniper':
        // Révèle 3 cellules aléatoires
        const unrevealed = [];
        gameState.board.forEach((r, rIdx) => {
          r.forEach((cell, cIdx) => {
            if (!cell.isRevealed && !cell.isLocked) {
              unrevealed.push([rIdx, cIdx]);
            }
          });
        });
        
        if (unrevealed.length > 0) {
          const toReveal = Math.min(3, unrevealed.length);
          for (let i = 0; i < toReveal; i++) {
            const randomIdx = Math.floor(Math.random() * unrevealed.length);
            const [r, c] = unrevealed.splice(randomIdx, 1)[0];
            gameState.board[r][c].isRevealed = true;
            gameState.board[r][c].symbol = generateSymbol();
            
            // Effet de sniper
            const sniperContainer = appRef.current.stage.getChildByName('grid').getChildByName(`cell-${r}-${c}`);
            if (sniperContainer && particleSystemRef.current) {
              const sniperX = sniperContainer.x + GAME_CONFIG.cellSize / 2;
              const sniperY = sniperContainer.y + GAME_CONFIG.cellSize / 2;
              
              // Ligne de tir
              const line = new PIXI.Graphics();
              line.lineStyle(3, 0xDC143C, 0.8);
              line.moveTo(cellX, cellY);
              line.lineTo(sniperX, sniperY);
              appRef.current.stage.addChild(line);
              
              // Animation de la ligne
              let lineLife = 15;
              const lineAnimate = () => {
                lineLife--;
                line.alpha = lineLife / 15;
                
                if (lineLife <= 0) {
                  appRef.current.stage.removeChild(line);
                  appRef.current.ticker.remove(lineAnimate);
                }
              };
              appRef.current.ticker.add(lineAnimate);
              
              // Révélation immédiate avec SpriteAtlas
              setTimeout(() => {
                const icon = sniperContainer.getChildByName('icon');
                const symbol = gameState.board[r][c].symbol;
                
                if (spriteAtlasRef.current && spriteAtlasRef.current.isSymbolLoaded(symbol)) {
                  // Supprimer l'ancienne icône
                  sniperContainer.removeChild(icon);
                  
                  // Créer le nouveau sprite animé
                  const animatedIcon = spriteAtlasRef.current.createAnimatedSprite(symbol, {
                    x: GAME_CONFIG.cellSize / 2,
                    y: GAME_CONFIG.cellSize / 2,
                    scale: 1,
                    alpha: 1,
                    visible: true
                  });
                  animatedIcon.name = 'icon';
                  sniperContainer.addChild(animatedIcon);
                  
                  // Démarrer l'animation
                  if (animatedIcon instanceof PIXI.AnimatedSprite) {
                    animatedIcon.play();
                  }
                } else {
                  // Fallback vers l'ancien système
                  icon.texture = PIXI.Texture.from(SYMBOL_TEXTURES[symbol]);
                  icon.visible = true;
                  icon.alpha = 1;
                  icon.scale.set(1);
                }
                
                // Effet de révélation
                if (particleSystemRef.current) {
                  particleSystemRef.current.createExplosion(sniperX, sniperY, 0xDC143C, 12);
                }
              }, 200);
            }
          }
        }
        break;
    }
    
    // Mettre à jour l'UI
    setGameStats({
      currentSpin: gameState.currentSpin,
      totalSpins: gameState.totalSpins,
      multiplier: gameState.multiplier,
      points: gameState.points,
      lockedRows: gameState.lockedRows
    });
  }, [generateSymbol, width]);

  // Continuer le jeu
  const continueGame = useCallback((app) => {
    const gameState = gameStateRef.current;
    
    if (gameState.currentSpin >= gameState.totalSpins) {
      // Fin du jeu
      endGame(app);
      return;
    }
    
    // Révéler la prochaine cellule
    const availableCells = [];
    gameState.board.forEach((r, rIdx) => {
      r.forEach((cell, cIdx) => {
        if (!cell.isRevealed && !cell.isLocked) {
          availableCells.push([rIdx, cIdx]);
        }
      });
    });
    
    if (availableCells.length > 0) {
      const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
      const [row, col] = randomCell;
      
      // Animation de sélection avec particules
      const cellContainer = app.stage.getChildByName('grid').getChildByName(`cell-${row}-${col}`);
      if (cellContainer) {
        const frame = cellContainer.getChildByName('frame');
        const cellX = cellContainer.x + GAME_CONFIG.cellSize / 2;
        const cellY = cellContainer.y + GAME_CONFIG.cellSize / 2;
        
        // Particules de sélection
        if (particleSystemRef.current) {
          particleSystemRef.current.createTrail(cellX, cellY, 0x00FFFF, 6);
        }
        
        // Pulsation de sélection
        let pulseT = 0;
        const pulse = (delta) => {
          pulseT += delta * 0.2;
          const scale = 1 + Math.sin(pulseT) * 0.1;
          frame.scale.set(scale);
          
          if (pulseT > Math.PI * 2) {
            app.ticker.remove(pulse);
            frame.scale.set(1);
            revealCell(row, col, app);
          }
        };
        app.ticker.add(pulse);
      }
    } else {
      // Plus de cellules disponibles
      endGame(app);
    }
  }, [revealCell]);

  // Fin du jeu
  const endGame = useCallback((app) => {
    const gameState = gameStateRef.current;
    gameState.isPlaying = false;
    
    // Effet de fin avec particules
    if (particleSystemRef.current) {
      particleSystemRef.current.createExplosion(width / 2, height / 2, 0xFFD700, 50);
    }
    
    // Animation de victoire
    if (spriteAtlasRef.current) {
      const winAnimation = spriteAtlasRef.current.createWinAnimation(width / 2, height / 2 - 50, 1.5);
      if (winAnimation) {
        endScreen.addChild(winAnimation);
      }
    }
    
    // Écran de fin
    const endScreen = new PIXI.Container();
    endScreen.name = 'endScreen';
    
    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.9);
    bg.drawRect(0, 0, width, height);
    bg.endFill();
    endScreen.addChild(bg);
    
    const title = new PIXI.Text('FIN DE PARTIE', {
      fontFamily: 'Arial',
      fontSize: 48,
      fill: 0xFFFFFF,
      stroke: 0x000000,
      strokeThickness: 4
    });
    title.anchor.set(0.5);
    title.x = width / 2;
    title.y = height / 2 - 100;
    endScreen.addChild(title);
    
    const stats = new PIXI.Text(`Points: ${gameState.points}\nMultiplicateur: ${gameState.multiplier.toFixed(1)}x\nSpins utilisés: ${gameState.currentSpin}`, {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xFFFFFF,
      align: 'center'
    });
    stats.anchor.set(0.5);
    stats.x = width / 2;
    stats.y = height / 2;
    endScreen.addChild(stats);
    
    app.stage.addChild(endScreen);
    
    // Callback de fin
    if (onGameComplete) {
      onGameComplete({
        points: gameState.points,
        multiplier: gameState.multiplier,
        spinsUsed: gameState.currentSpin
      });
    }
  }, [width, height, onGameComplete]);

  // Démarrer le jeu
  const startGame = useCallback((app) => {
    const gameState = gameStateRef.current;
    gameState.isPlaying = true;
    gameState.currentSpin = 0;
    gameState.points = 0;
    gameState.multiplier = GAME_CONFIG.baseMultiplier;
    gameState.lockedRows = GAME_CONFIG.lockedRows;
    gameState.revealedCells.clear();
    
    // Réinitialiser le board
    initializeBoard();
    
    // Cacher l'écran de fin s'il existe
    const endScreen = app.stage.getChildByName('endScreen');
    if (endScreen) {
      app.stage.removeChild(endScreen);
    }
    
    // Effet de début
    if (particleSystemRef.current) {
      particleSystemRef.current.createWave(width / 2, height / 2, 100, 0x00FFFF);
    }
    
    // Commencer la première révélation
    setTimeout(() => continueGame(app), 1000);
  }, [initializeBoard, continueGame, width, height]);

  // Pause/Play
  const togglePause = useCallback((app) => {
    const gameState = gameStateRef.current;
    gameState.isPaused = !gameState.isPaused;
    
    if (gameState.isPaused) {
      app.ticker.stop();
    } else {
      app.ticker.start();
    }
  }, []);

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

    // Initialiser le système de particules
    particleSystemRef.current = new ParticleSystem(app, 200);

    // Initialiser le gestionnaire de performance
    const performanceManager = new PerformanceManager();
    const pixiConfig = performanceManager.getPixiConfig(width, height);
    
    // Initialiser le SpriteAtlas pour les symboles
    spriteAtlasRef.current = new SpriteAtlas(app, SPRITE_CONFIG.texturePath, SPRITE_CONFIG.frameData);
    
    // Initialiser le système d'éclairage
    const lightingSystem = new LightingSystem(app, {
      ambientLight: 0x404040,
      ambientIntensity: 0.3
    });
    
    // Créer des lumières dynamiques
    const mainLight = lightingSystem.createPointLight(width / 2, height / 2, 0xFFFFCC, 0.6, 150, {
      pulse: true,
      pulseSpeed: 0.03
    });
    
    // Lumières d'accentuation pour les coins
    lightingSystem.createPointLight(50, 50, 0x00FFFF, 0.4, 80, {
      flicker: true,
      flickerSpeed: 0.15
    });
    
    lightingSystem.createPointLight(width - 50, height - 50, 0xFF69B4, 0.4, 80, {
      flicker: true,
      flickerSpeed: 0.12
    });
    
    // Effet de lueur ambiante
    lightingSystem.createGlow(width / 2, height / 2, 0x00FFFF, 0.3, 100);

    // Fond animé
    const bg = PIXI.Sprite.from('/images/game/bg-aurora.svg');
    bg.width = width;
    bg.height = height;
    bg.alpha = 0.7;
    app.stage.addChild(bg);

    // Particules de fond
    const particles = new PIXI.ParticleContainer(100, {
      scale: true,
      position: true,
      alpha: true
    });
    app.stage.addChild(particles);

    for (let i = 0; i < 50; i++) {
      const particle = PIXI.Sprite.from('/images/game/symbol-bonus.svg');
      particle.width = 8;
      particle.height = 8;
      particle.x = Math.random() * width;
      particle.y = Math.random() * height;
      particle.alpha = 0.3;
      particles.addChild(particle);
    }

    // Animation des particules
    app.ticker.add(() => {
      particles.children.forEach((particle, i) => {
        particle.y -= 0.5;
        particle.alpha = 0.3 + Math.sin(Date.now() * 0.001 + i) * 0.2;
        
        if (particle.y < -10) {
          particle.y = height + 10;
        }
      });
      
      // Mettre à jour le système de particules
      if (particleSystemRef.current) {
        particleSystemRef.current.update();
      }
      
      // Mettre à jour le système d'éclairage
      if (lightingSystem) {
        lightingSystem.update(delta);
      }
    });

    // Grille de jeu
    const grid = new PIXI.Container();
    grid.name = 'grid';
    app.stage.addChild(grid);

    const cellSize = GAME_CONFIG.cellSize;
    const padding = GAME_CONFIG.padding;
    const startX = (width - (GAME_CONFIG.cols * cellSize + (GAME_CONFIG.cols - 1) * padding)) / 2;
    const startY = (height - (GAME_CONFIG.rows * cellSize + (GAME_CONFIG.rows - 1) * padding)) / 2;

    for (let r = 0; r < GAME_CONFIG.rows; r++) {
      for (let c = 0; c < GAME_CONFIG.cols; c++) {
        const cellContainer = new PIXI.Container();
        cellContainer.name = `cell-${r}-${c}`;
        cellContainer.x = startX + c * (cellSize + padding);
        cellContainer.y = startY + r * (cellSize + padding);

        // Frame de la cellule
        const frame = PIXI.Sprite.from('/images/game/cell-frame.svg');
        frame.name = 'frame';
        frame.width = cellSize;
        frame.height = cellSize;
        frame.alpha = 0.8;
        cellContainer.addChild(frame);

        // Icône du symbole
        const icon = new PIXI.Sprite();
        icon.name = 'icon';
        icon.anchor.set(0.5);
        icon.x = cellSize / 2;
        icon.y = cellSize / 2;
        icon.visible = false;
        cellContainer.addChild(icon);

        // Indicateur de verrouillage
        if (r < GAME_CONFIG.lockedRows) {
          const lockIcon = new PIXI.Graphics();
          lockIcon.beginFill(0xFF0000, 0.8);
          lockIcon.drawCircle(cellSize - 20, 20, 12);
          lockIcon.endFill();
          lockIcon.name = 'lock';
          cellContainer.addChild(lockIcon);
        }

        grid.addChild(cellContainer);
      }
    }

    // UI de jeu
    const uiContainer = new PIXI.Container();
    uiContainer.name = 'ui';
    app.stage.addChild(uiContainer);

    // Boutons de contrôle
    const startBtn = new PIXI.Graphics();
    startBtn.beginFill(0x00FF00, 0.8);
    startBtn.drawRoundedRect(10, 10, 100, 40, 8);
    startBtn.endFill();
    startBtn.interactive = true;
    startBtn.buttonMode = true;
    startBtn.on('pointerdown', () => startGame(app));
    uiContainer.addChild(startBtn);

    const startText = new PIXI.Text('START', {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xFFFFFF
    });
    startText.anchor.set(0.5);
    startText.x = 60;
    startText.y = 30;
    startBtn.addChild(startText);

    const pauseBtn = new PIXI.Graphics();
    pauseBtn.beginFill(0xFFFF00, 0.8);
    pauseBtn.drawRoundedRect(120, 10, 100, 40, 8);
    pauseBtn.endFill();
    pauseBtn.interactive = true;
    pauseBtn.buttonMode = true;
    pauseBtn.on('pointerdown', () => togglePause(app));
    uiContainer.addChild(pauseBtn);

    const pauseText = new PIXI.Text('PAUSE', {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0x000000
    });
    pauseText.anchor.set(0.5);
    pauseText.x = 170;
    pauseText.y = 30;
    pauseBtn.addChild(pauseText);

    // Stats du jeu
    const statsContainer = new PIXI.Container();
    statsContainer.x = width - 200;
    statsContainer.y = 10;
    uiContainer.addChild(statsContainer);

    const statsBg = new PIXI.Graphics();
    statsBg.beginFill(0x000000, 0.6);
    statsBg.drawRoundedRect(0, 0, 190, 120, 8);
    statsBg.endFill();
    statsContainer.addChild(statsBg);

    const statsText = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize: 14,
      fill: 0xFFFFFF
    });
    statsText.name = 'statsText';
    statsContainer.addChild(statsText);

    // Mise à jour des stats
    const updateStats = () => {
      const gameState = gameStateRef.current;
      statsText.text = `SPIN: ${gameState.currentSpin}/${gameState.totalSpins}\nPOINTS: ${gameState.points}\nMULTI: ${gameState.multiplier.toFixed(1)}x\nLOCKED: ${gameState.lockedRows}`;
    };

    app.ticker.add(updateStats);

    // Initialiser le board
    initializeBoard();

    setReady(true);

    return () => {
      if (particleSystemRef.current) {
        particleSystemRef.current.destroy();
      }
      if (spriteAtlasRef.current) {
        spriteAtlasRef.current.destroy();
      }
      if (lightingSystem) {
        lightingSystem.destroy();
      }
      if (performanceManager) {
        performanceManager.destroy();
      }
      app.destroy(true, { children: true });
    };
  }, [width, height, initializeBoard, startGame, togglePause]);

  return (
    <Box sx={{ width, height, position: 'relative' }}>
      <Box ref={containerRef} sx={{ width, height, borderRadius: 2, overflow: 'hidden' }} />
      
      {!ready && (
        <Box sx={{ 
          position: 'absolute', 
          inset: 0, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: 'white'
        }}>
          Chargement du jeu...
        </Box>
      )}
      
      {/* Contrôles React */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: 20, 
        left: 20, 
        right: 20,
        display: 'flex',
        gap: 2,
        justifyContent: 'center'
      }}>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => gameStateRef.current.isPlaying && startGame(appRef.current)}
          disabled={!ready || gameStateRef.current.isPlaying}
        >
          Nouvelle Partie
        </Button>
        
        <Chip 
          label={`Points: ${gameStats.points}`}
          color="secondary"
          variant="outlined"
        />
        
        <Chip 
          label={`Multiplicateur: ${gameStats.multiplier.toFixed(1)}x`}
          color="primary"
          variant="outlined"
        />
        
        <Chip 
          label={`Spins: ${gameStats.currentSpin}/${gameStats.totalSpins}`}
          color="info"
          variant="outlined"
        />
      </Box>
    </Box>
  );
});

MoneyCartPixi.displayName = 'MoneyCartPixi';

export default MoneyCartPixi;



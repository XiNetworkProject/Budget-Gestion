import { useEffect, useRef, useState, memo } from 'react';
import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import MoneyCartIntro from './MoneyCartIntro';

// Importation conditionnelle du PixiPlugin pour éviter les erreurs SSR
let pixiPluginLoaded = false;
const loadPixiPlugin = async () => {
  if (typeof window !== 'undefined' && !pixiPluginLoaded) {
    try {
      const { PixiPlugin } = await import('gsap/PixiPlugin');
      gsap.registerPlugin(PixiPlugin);
      pixiPluginLoaded = true;
    } catch (e) {
      console.warn('PixiPlugin non disponible:', e);
    }
  }
};

const MoneyCartGame = memo(() => {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const [showIntro, setShowIntro] = useState(false);
  const gameStateRef = useRef({
    COLS: 6,
    ROWS: 4,
    MAX_ROWS: 8,
    BASE_BET: 1.00,
    BIG_WIN_THRESHOLD: 100,
    MAX_WIN_CAP: 15000,
    respinBase: 3,
    respins: 0,
    playing: false,
    turbo: false,
    isSpinning: false,
    autoplay: false,
    lastSpawned: [],
    cells: [],
    activeTop: 0,
    activeBottom: 0,
    fullRowsAwarded: 0,
    nextUnlockTop: true,
    cellSize: 70, // Taille optimisée pour le centrage
    origin: { x: 0, y: 0 }
  });

  const [ui, setUi] = useState({
    respins: 0,
    rows: 4,
    total: 0,
    bet: 1.00,
    reset: 3,
    cap: 15000,
    turbo: false
  });

  const [showPanel, setShowPanel] = useState(false);
  const [panelData, setPanelData] = useState({ title: '', total: '' });
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Poids des symboles
  const WEIGHTS = {
    base: { coin: 70, collector: 5, payer: 5, cp: 2, p_collector: 1, p_payer: 1, sniper: 3, necro: 2, unlock: 3, arms: 2, upg: 2, rplus: 0 },
    deep: { coin: 65, collector: 6, payer: 6, cp: 2, p_collector: 1, p_payer: 1, sniper: 4, necro: 3, unlock: 3, arms: 2, upg: 2, rplus: 0 }
  };

  // Utilitaires RNG
  const rnd = {
    next: () => Math.random(),
    int: (a, b) => Math.floor(Math.random() * (b - a + 1)) + a,
    pick: (arr) => arr[Math.floor(Math.random() * arr.length)]
  };

  const weightedPick = (table) => {
    const entries = Object.entries(table);
    const sum = entries.reduce((a, [, w]) => a + w, 0);
    let r = Math.random() * sum;
    for (const [k, w] of entries) {
      r -= w;
      if (r < 0) return k;
    }
    return entries[0][0];
  };

  const shuffleInPlace = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const pickNRandom = (arr, n) => {
    const a = arr.slice();
    shuffleInPlace(a);
    return a.slice(0, Math.min(n, a.length));
  };

  // Helpers robustesse tween/destroy
  const killTweens = (obj) => {
    if (!obj) return;
    try { gsap.killTweensOf(obj) } catch { }
    try { if (obj.scale) gsap.killTweensOf(obj.scale) } catch { }
  };

  const safeDestroySymbol = (sym) => {
    if (!sym) return;
    
    try {
      // Tuer toutes les animations GSAP
      killTweens(sym);
      
      // Arrêter les animations idle si elles existent
      if (sym._idleAnimations) {
        sym._idleAnimations.forEach(anim => {
          if (anim && anim.kill) anim.kill();
        });
        sym._idleAnimations = [];
      }
      
      // Marquer comme détruit avec notre flag custom
      sym._isDestroyed = true;
      
      // Détruire l'objet PixiJS
      if (sym.destroy && typeof sym.destroy === 'function') {
        sym.destroy({ children: true });
      }
    } catch (e) {
      // Ignorer les erreurs de destruction
      console.warn('Erreur lors de la destruction du symbole:', e);
    }
  };

  // Classes des symboles
  class Cell {
    constructor(col, rowAbs, gameState, gridLayer) {
      this.col = col;
      this.row = rowAbs;
      this.symbol = null;
      this.gameState = gameState;
      this.container = new PIXI.Container();
      gridLayer.addChild(this.container);
      this.bg = new PIXI.Graphics();
      this.hatch = new PIXI.Graphics();
      this.halo = new PIXI.Graphics();
      this.halo.alpha = 0;
      this.container.addChild(this.bg, this.hatch, this.halo);
      this.resize();
    }

    resize() {
      const pad = Math.max(6, Math.floor(this.gameState.cellSize * 0.04)); // Padding adaptatif HD
      const r = this.isRowActive();
      const cellSize = this.gameState.cellSize;
      const borderWidth = Math.max(2, Math.floor(cellSize * 0.015)); // Bordure adaptative HD
      const innerBorderWidth = Math.max(1, Math.floor(cellSize * 0.008)); // Bordure intérieure HD
      
      // Style Money Cart 4 - cellules avec bordures néon HD
      this.bg.clear();
      
      if (r) {
        // Cellule active - style futuriste avec gradient et bordure néon HD
        this.bg.beginFill(0x1a2332)
          .drawRoundedRect(pad, pad, cellSize - 2 * pad, cellSize - 2 * pad, Math.max(8, cellSize * 0.06))
          .endFill();
        
        // Bordure néon cyan HD
        this.bg.lineStyle(borderWidth, 0x00ffff, 0.7)
          .drawRoundedRect(pad, pad, cellSize - 2 * pad, cellSize - 2 * pad, Math.max(8, cellSize * 0.06));
        
        // Bordure intérieure plus fine HD
        this.bg.lineStyle(innerBorderWidth, 0x66ffff, 0.4)
          .drawRoundedRect(pad + borderWidth, pad + borderWidth, cellSize - 2 * pad - 2 * borderWidth, cellSize - 2 * pad - 2 * borderWidth, Math.max(6, cellSize * 0.04));
      } else {
        // Cellule verrouillée - plus sombre avec bordure rouge HD
        this.bg.beginFill(0x0a0e13)
          .drawRoundedRect(pad, pad, cellSize - 2 * pad, cellSize - 2 * pad, Math.max(8, cellSize * 0.06))
          .endFill();
        
        // Bordure rouge pour verrouillage HD
        this.bg.lineStyle(innerBorderWidth, 0x662222, 0.5)
          .drawRoundedRect(pad, pad, cellSize - 2 * pad, cellSize - 2 * pad, Math.max(8, cellSize * 0.06));
      }
      
      // motif hatch si verrouillé - style plus moderne
      this.hatch.clear();
      if (!r) {
        this.hatch.lineStyle(1, 0xff4466, 0.15);
        // Motif diagonal en X
        for (let k = 0; k < cellSize; k += 16) {
          this.hatch.moveTo(pad + k, pad);
          this.hatch.lineTo(pad + k + 12, pad + 12);
          this.hatch.moveTo(pad + k + 12, pad);
          this.hatch.lineTo(pad + k, pad + 12);
        }
      }
      
      // halo pour surbrillance - effet néon plus prononcé
      this.halo.clear().beginFill(0x00ffff, 0.1)
        .drawRoundedRect(2, 2, cellSize - 4, cellSize - 4, 10)
        .endFill();
      this.halo.lineStyle(2, 0x00ffff, 0.5)
        .drawRoundedRect(2, 2, cellSize - 4, cellSize - 4, 10);
      
      // redessine le symbole si présent
      if (this.symbol) this.symbol.resize();
      
      // effet de transparence pour les cellules verrouillées
      this.container.alpha = r ? 1 : 0.4;
    }

    isRowActive() {
      return this.row >= this.gameState.activeTop && this.row <= this.gameState.activeBottom;
    }

    setHighlight(on) {
      gsap.to(this.halo, { alpha: on ? 1 : 0, duration: .15 });
    }

    isEmpty() {
      return !this.symbol;
    }
  }

  class BaseSymbol extends PIXI.Container {
    constructor(type, value = 0, persistent = false) {
      super();
      this.type = type;
      this.value = value;
      this.persistent = persistent;
      this.cell = null;
    }

    attach(cell) {
      this.cell = cell;
      cell.symbol = this;
      cell.container.addChild(this);
    }

    async onSpawn() {
      await this.popIn();
    }

    async onResolve() { }

    async onPersistent() { }

    destroy() {
      // Arrêter toutes les animations en cours
      gsap.killTweensOf(this);
      gsap.killTweensOf(this.scale);
      
      if (this._idleAnimations) {
        this._idleAnimations.forEach(anim => {
          if (anim && anim.kill) anim.kill();
        });
        this._idleAnimations = [];
      }
      
      // Marquer comme détruit avec notre flag custom
      this._isDestroyed = true;
      
      // Appeler la méthode destroy de PixiJS
      try {
        super.destroy();
      } catch (e) {
        // Ignorer les erreurs de destruction
      }
    }

    resize() {
      this.removeChildren();
      const color = this.colorFor();
      const r = Math.floor(this.cell.gameState.cellSize * .32);
      const cx = Math.floor(this.cell.gameState.cellSize / 2);
      const cy = cx;
      
      // Créer le conteneur principal
      const container = new PIXI.Container();
      container.x = cx;
      container.y = cy;
      
      // Dessiner le symbole selon son type
      if (this.type === 'coin') {
        this.drawCoinSymbol(container, r);
      } else {
        this.drawFeatureSymbol(container, r, color);
      }
      
      this.addChild(container);
      
      // Animation d'idle pour les symboles persistants
      if (this.persistent) {
        this.addIdleAnimation(container);
      }
    }

    drawCoinSymbol(container, r) {
      // Fond métallique doré avec gradient
      const bg = new PIXI.Graphics();
      bg.beginFill(0xffd700);
      bg.drawCircle(0, 0, r);
      bg.endFill();
      
      // Cercles concentriques pour effet 3D
      bg.lineStyle(3, 0xffaa00, 0.8);
      bg.drawCircle(0, 0, r - 2);
      bg.lineStyle(2, 0xffffff, 0.6);
      bg.drawCircle(0, 0, r - 6);
      bg.lineStyle(1, 0xcc8800, 0.4);
      bg.drawCircle(0, 0, r - 10);
      
      container.addChild(bg);
      
      // Symbole dollar stylisé
      const symbol = new PIXI.Graphics();
      symbol.lineStyle(4, 0x000000, 1);
      // Ligne verticale du $
      symbol.moveTo(0, -r * 0.6);
      symbol.lineTo(0, r * 0.6);
      // Courbes du S
      symbol.arc(0, -r * 0.2, r * 0.3, Math.PI, 0);
      symbol.arc(0, r * 0.2, r * 0.3, 0, Math.PI);
      
      container.addChild(symbol);
      
      // Texte de la valeur HD
      const valueText = new PIXI.Text(this.value || '1', {
        fontFamily: "Arial Black",
        fontSize: Math.max(14, Math.floor(r * 0.42)), // Taille minimum pour lisibilité HD
        fontWeight: 900,
        fill: 0x000000,
        align: "center",
        stroke: 0xffffff,
        strokeThickness: Math.max(1, Math.floor(r * 0.015)), // Contour blanc HD
        dropShadow: true,
        dropShadowBlur: Math.max(2, Math.floor(r * 0.02)),
        dropShadowDistance: Math.max(1, Math.floor(r * 0.01)),
        dropShadowColor: 0x333333,
        dropShadowAlpha: 0.7
      });
      valueText.anchor.set(0.5);
      valueText.y = r * 0.7;
      container.addChild(valueText);
    }

    drawFeatureSymbol(container, r, color) {
      // Forme de base selon le type
      const bg = new PIXI.Graphics();
      const isRound = ['collector', 'p_collector', 'sniper', 'p_sniper'].includes(this.type);
      
      if (isRound) {
        bg.beginFill(color);
        bg.drawCircle(0, 0, r);
        bg.endFill();
      } else {
        bg.beginFill(color);
        bg.drawRoundedRect(-r + 4, -r + 4, (r - 4) * 2, (r - 4) * 2, 8);
        bg.endFill();
      }
      
      // Bordures avec effet néon HD
      const borderColor = this.persistent ? 0xffaa00 : 0x00ffff;
      const borderWidth = Math.max(2, Math.floor(r * 0.04)); // Bordure adaptative HD
      const innerBorderWidth = Math.max(1, Math.floor(r * 0.02)); // Bordure intérieure HD
      
      bg.lineStyle(borderWidth, borderColor, 0.9);
      if (isRound) {
        bg.drawCircle(0, 0, r - borderWidth);
      } else {
        bg.drawRoundedRect(-r + 4, -r + 4, (r - 4) * 2, (r - 4) * 2, Math.max(8, r * 0.1));
      }
      
      bg.lineStyle(innerBorderWidth, 0xffffff, 0.6);
      if (isRound) {
        bg.drawCircle(0, 0, r - borderWidth - 4);
      } else {
        bg.drawRoundedRect(-r + 6, -r + 6, (r - 6) * 2, (r - 6) * 2, Math.max(6, r * 0.08));
      }
      
      container.addChild(bg);
      
      // Icône spécifique au type
      this.drawSymbolIcon(container, r);
      
      // Label du symbole
      const label = this.labelFor();
      if (label) {
        const text = new PIXI.Text(label, {
          fontFamily: "Arial Black",
          fontSize: Math.max(12, Math.floor(r * 0.32)), // Taille minimum pour lisibilité HD
          fontWeight: 900,
          fill: 0xffffff,
          align: "center",
          stroke: 0x000000,
          strokeThickness: Math.max(2, Math.floor(r * 0.03)), // Épaisseur adaptative HD
          dropShadow: true,
          dropShadowBlur: Math.max(2, Math.floor(r * 0.02)),
          dropShadowDistance: Math.max(1, Math.floor(r * 0.015)),
          dropShadowColor: 0x000000,
          dropShadowAlpha: 0.8
        });
        text.anchor.set(0.5);
        text.y = r * 0.6;
        container.addChild(text);
      }
      
      // Glow pour persistants
      if (this.persistent) {
        const glow = new PIXI.Graphics();
        glow.beginFill(0xffaa00, 0.1);
        if (isRound) {
          glow.drawCircle(0, 0, r + 8);
        } else {
          glow.drawRoundedRect(-r, -r, r * 2, r * 2, 12);
        }
        glow.endFill();
        container.addChildAt(glow, 0);
      }
    }

    drawSymbolIcon(container, r) {
      const icon = new PIXI.Graphics();
      
      switch (this.type) {
        case 'collector':
        case 'p_collector':
          // Icône magnétique/collecteur
          icon.lineStyle(3, 0xffffff, 1);
          icon.drawCircle(0, 0, r * 0.4);
          icon.moveTo(-r * 0.2, -r * 0.2);
          icon.lineTo(r * 0.2, r * 0.2);
          icon.moveTo(r * 0.2, -r * 0.2);
          icon.lineTo(-r * 0.2, r * 0.2);
          break;
          
        case 'payer':
        case 'p_payer':
          // Icône de paiement (flèches vers l'extérieur)
          icon.lineStyle(3, 0xffffff, 1);
          for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8;
            const x1 = Math.cos(angle) * r * 0.2;
            const y1 = Math.sin(angle) * r * 0.2;
            const x2 = Math.cos(angle) * r * 0.4;
            const y2 = Math.sin(angle) * r * 0.4;
            icon.moveTo(x1, y1);
            icon.lineTo(x2, y2);
          }
          break;
          
        case 'sniper':
        case 'p_sniper':
          // Icône de viseur
          icon.lineStyle(3, 0xffffff, 1);
          icon.drawCircle(0, 0, r * 0.3);
          icon.moveTo(-r * 0.5, 0);
          icon.lineTo(-r * 0.3, 0);
          icon.moveTo(r * 0.3, 0);
          icon.lineTo(r * 0.5, 0);
          icon.moveTo(0, -r * 0.5);
          icon.lineTo(0, -r * 0.3);
          icon.moveTo(0, r * 0.3);
          icon.lineTo(0, r * 0.5);
          break;
          
        case 'necro':
          // Icône nécromancien (crâne stylisé)
          icon.lineStyle(2, 0xffffff, 1);
          icon.beginFill(0xffffff, 0.8);
          icon.drawEllipse(0, -r * 0.1, r * 0.3, r * 0.25);
          icon.endFill();
          icon.beginFill(0x000000);
          icon.drawCircle(-r * 0.1, -r * 0.15, r * 0.05);
          icon.drawCircle(r * 0.1, -r * 0.15, r * 0.05);
          icon.endFill();
          break;
          
        case 'arms':
        case 'p_arms':
          // Icône armement (épées croisées)
          icon.lineStyle(3, 0xffffff, 1);
          icon.moveTo(-r * 0.3, -r * 0.3);
          icon.lineTo(r * 0.3, r * 0.3);
          icon.moveTo(r * 0.3, -r * 0.3);
          icon.lineTo(-r * 0.3, r * 0.3);
          icon.drawRect(-r * 0.1, -r * 0.4, r * 0.2, r * 0.1);
          icon.drawRect(-r * 0.1, r * 0.3, r * 0.2, r * 0.1);
          break;
          
        case 'upg':
          // Icône upgrade (flèche vers le haut)
          icon.lineStyle(4, 0xffffff, 1);
          icon.moveTo(0, -r * 0.4);
          icon.lineTo(0, r * 0.4);
          icon.moveTo(-r * 0.2, -r * 0.2);
          icon.lineTo(0, -r * 0.4);
          icon.lineTo(r * 0.2, -r * 0.2);
          break;
          
        case 'unlock':
          // Icône déverrouillage (cadenas ouvert)
          icon.lineStyle(3, 0xffffff, 1);
          icon.drawRoundedRect(-r * 0.2, 0, r * 0.4, r * 0.3, 5);
          icon.moveTo(-r * 0.1, 0);
          icon.lineTo(-r * 0.1, -r * 0.2);
          icon.arc(0, -r * 0.2, r * 0.1, Math.PI, 0);
          break;
          
        case 'cp':
        case 'p_cp':
          // Icône collector-payer combiné
          icon.lineStyle(2, 0xffffff, 1);
          icon.drawCircle(0, 0, r * 0.3);
          icon.moveTo(-r * 0.15, 0);
          icon.lineTo(r * 0.15, 0);
          icon.moveTo(0, -r * 0.15);
          icon.lineTo(0, r * 0.15);
          break;
          
        case 'rplus':
          // Icône reset plus
          icon.lineStyle(4, 0xffffff, 1);
          icon.moveTo(-r * 0.2, 0);
          icon.lineTo(r * 0.2, 0);
          icon.moveTo(0, -r * 0.2);
          icon.lineTo(0, r * 0.2);
          icon.drawCircle(0, 0, r * 0.3);
          break;
      }
      
      container.addChild(icon);
    }

    addIdleAnimation(container) {
      if (!container || !container.scale || this._isDestroyed || this.destroyed) return;
      
      // Animation de pulsation pour les symboles persistants avec vérifications
      const scaleAnim = gsap.to(container.scale, {
        x: 1.1,
        y: 1.1,
        duration: 1,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true,
        onUpdate: () => {
          if (!container || !container.scale || this._isDestroyed || this.destroyed) {
            scaleAnim.kill();
          }
        }
      });
      
      // Rotation légère avec vérifications
      const rotateAnim = gsap.to(container, {
        rotation: 0.1,
        duration: 2,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
        onUpdate: () => {
          if (!container || this._isDestroyed || this.destroyed) {
            rotateAnim.kill();
          }
        }
      });
      
      // Stocker les animations pour pouvoir les arrêter
      if (!this._idleAnimations) this._idleAnimations = [];
      this._idleAnimations.push(scaleAnim, rotateAnim);
    }

    colorFor() {
      if (this.persistent) {
        if (this.type === "p_collector") return 0xffb347;
        if (this.type === "p_payer") return 0x7ee4ff;
        if (this.type === "p_sniper") return 0xff667a;
        if (this.type === "p_cp") return 0xff66ff;
        if (this.type === "p_arms") return 0xb3a1ff;
      }
      switch (this.type) {
        case "coin": return 0xf5a623;
        case "collector": return 0xff8a00;
        case "payer": return 0x58c1ff;
        case "cp": return 0xff3fff;
        case "sniper": return 0xff3355;
        case "necro": return 0x9bfca4;
        case "unlock": return 0x6a7dff;
        case "arms": return 0xb39cff;
        case "upg": return 0x9db5ff;
        case "rplus": return 0x9cffb1;
        default: return 0xffffff;
      }
    }

    labelFor() {
      switch (this.type) {
        case "coin": return `x${this.value}`;
        case "collector": return "C";
        case "p_collector": return "PC";
        case "payer": return "P";
        case "p_payer": return "PP";
        case "cp": return "C+P";
        case "p_cp": return "PC+P";
        case "sniper": return "S";
        case "p_sniper": return "PS";
        case "necro": return "N";
        case "unlock": return "U";
        case "arms": return "AD";
        case "p_arms": return "PAD";
        case "upg": return "UG";
        case "rplus": return "R+";
        default: return "?";
      }
    }

    async bump() {
      if (!this || !this.scale || this._isDestroyed || this.destroyed) return Promise.resolve();
      
      const dur = 0.12;
      gsap.killTweensOf(this.scale);
      gsap.killTweensOf(this);
      
      // Vérifications de sécurité avant animation
      if (!this.scale || this._isDestroyed || this.destroyed) return Promise.resolve();
      
      // Animation de bump plus dynamique avec vérifications
      const tween = gsap.timeline()
        .to(this.scale, { 
          x: 1.3, 
          y: 1.3, 
          duration: dur * 0.4, 
          ease: "back.out(3)",
          onUpdate: () => {
            if (!this || !this.scale || this._isDestroyed || this.destroyed) {
              tween.kill();
            }
          }
        })
        .to(this.scale, { 
          x: 1, 
          y: 1, 
          duration: dur * 0.6, 
          ease: "back.out(1.5)",
          onUpdate: () => {
            if (!this || !this.scale || this._isDestroyed || this.destroyed) {
              tween.kill();
            }
          }
        });
      
      // Effet de flash pour les actions importantes
      if (this.type !== 'coin' && !this._isDestroyed && !this.destroyed) {
        this.addActionFlash();
      }
      
      return new Promise((resolve) => {
        let done = false;
        const finish = () => { if (done) return; done = true; resolve(); };
        try { 
          tween.eventCallback("onComplete", finish);
          tween.eventCallback("onKill", finish);
        } catch { }
        setTimeout(finish, Math.ceil(dur * 1000) + 60);
      });
    }

    addActionFlash() {
      if (!this.children || this.children.length === 0) return;
      
      const flash = new PIXI.Graphics();
      flash.beginFill(0xffffff, 0.4);
      const r = this.cell.gameState.cellSize * 0.4;
      flash.drawCircle(this.cell.gameState.cellSize / 2, this.cell.gameState.cellSize / 2, r);
      flash.endFill();
      this.addChild(flash);
      
      gsap.to(flash, {
        alpha: 0,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          if (flash.parent) flash.parent.removeChild(flash);
        }
      });
    }

    async popIn() {
      if (!this || !this.scale || this._isDestroyed || this.destroyed) return Promise.resolve();
      
      const dur = 0.35;
      
      try {
        this.scale.set(0.1);
        this.alpha = 1;
        this.rotation = 0;
      } catch (e) {
        return Promise.resolve();
      }
      
      // Vérifications de sécurité avant animation
      if (!this.scale || this._isDestroyed || this.destroyed) return Promise.resolve();
      
      // Animation d'apparition spectaculaire avec vérifications
      const tween = gsap.timeline()
        .to(this.scale, { 
          x: 1.2, 
          y: 1.2, 
          duration: dur * 0.6, 
          ease: "back.out(2)",
          onUpdate: () => {
            if (!this || !this.scale || this._isDestroyed || this.destroyed) {
              tween.kill();
            }
          }
        })
        .to(this.scale, { 
          x: 1, 
          y: 1, 
          duration: dur * 0.4, 
          ease: "back.out(1.5)",
          onUpdate: () => {
            if (!this || !this.scale || this._isDestroyed || this.destroyed) {
              tween.kill();
            }
          }
        }, "-=0.1");
      
      // Effet de particules à l'apparition
      if (!this._isDestroyed && !this.destroyed) {
        this.addSpawnParticles();
      }
      
      return new Promise((resolve) => {
        let done = false;
        const finish = () => { if (done) return; done = true; resolve(); };
        try { 
          tween.eventCallback("onComplete", finish);
          tween.eventCallback("onKill", finish);
        } catch { }
        setTimeout(finish, Math.ceil(dur * 1000) + 60);
      });
    }

    addSpawnParticles() {
      const particleCount = 8;
      const centerX = this.cell.gameState.cellSize / 2;
      const centerY = this.cell.gameState.cellSize / 2;
      
      for (let i = 0; i < particleCount; i++) {
        const particle = new PIXI.Graphics();
        particle.beginFill(this.persistent ? 0xffaa00 : 0x00ffff, 0.8);
        particle.drawCircle(0, 0, 3);
        particle.endFill();
        
        particle.x = centerX;
        particle.y = centerY;
        this.addChild(particle);
        
        const angle = (i / particleCount) * Math.PI * 2;
        const distance = 40;
        const targetX = centerX + Math.cos(angle) * distance;
        const targetY = centerY + Math.sin(angle) * distance;
        
        gsap.to(particle, {
          x: targetX,
          y: targetY,
          alpha: 0,
          scale: 0.1,
          duration: 0.6,
          ease: "power2.out",
          onComplete: () => {
            if (particle.parent) particle.parent.removeChild(particle);
          }
        });
      }
    }
  }

  // Classes de symboles spécifiques
  class CoinSymbol extends BaseSymbol {
    constructor(v) {
      super("coin", v, false);
    }
  }

  class CollectorSymbol extends BaseSymbol {
    constructor(p = false) {
      super(p ? "p_collector" : "collector", 0, p);
    }

    async collectAnimated(gameUtils) {
      const others = gameUtils.symbols().filter(s => s !== this);
      const total = others.reduce((a, s) => a + (s.value || 0), 0);
      for (const s of others) {
        gameUtils.suck(this.cell, s.cell);
        await gameUtils.sleep(30);
      }
      this.value = Math.min(gameStateRef.current.MAX_WIN_CAP, this.value + total);
      gameUtils.floatText(this.cell, `+${total}`);
      this.resize();
      gameUtils.updateHUD();
    }

    async onResolve(gameUtils) {
      await this.collectAnimated(gameUtils);
      await this.bump();
    }

    async onPersistent(gameUtils) {
      await this.collectAnimated(gameUtils);
      await this.bump();
    }
  }

  class PayerSymbol extends BaseSymbol {
    constructor(v = 1, p = false) {
      super(p ? "p_payer" : "payer", v, p);
    }

    async paySequential(gameUtils) {
      const targets = gameUtils.symbols().filter(s => s !== this);
      for (const t of targets) {
        gameUtils.beam(this.cell, t.cell);
        await gameUtils.sleep(60);
        t.value = Math.min(gameStateRef.current.MAX_WIN_CAP, t.value + this.value);
        t.resize();
        gameUtils.floatText(t.cell, `+${this.value}`);
      }
      gameUtils.updateHUD();
    }

    async onResolve(gameUtils) {
      await this.paySequential(gameUtils);
      await this.bump();
    }

    async onPersistent(gameUtils) {
      await this.paySequential(gameUtils);
      await this.bump();
    }
  }

  class ComboCPSymbol extends BaseSymbol {
    constructor(p = false) {
      super(p ? "p_cp" : "cp", 1, p);
    }

    async run(gameUtils) {
      const total = gameUtils.sumValues();
      this.value = Math.min(gameStateRef.current.MAX_WIN_CAP, this.value + total);
      gameUtils.floatText(this.cell, `+${total}`);
      this.resize();
      for (const s of gameUtils.symbols()) {
        if (s !== this) {
          s.value = Math.min(gameStateRef.current.MAX_WIN_CAP, s.value + this.value);
          s.resize();
          gameUtils.floatText(s.cell, `+${this.value}`);
        }
      }
      gameUtils.updateHUD();
      await this.bump();
    }

    async onResolve(gameUtils) {
      await this.run(gameUtils);
    }

    async onPersistent(gameUtils) {
      await this.run(gameUtils);
    }
  }

  class SniperSymbol extends BaseSymbol {
    constructor(p = false) {
      super(p ? "p_sniper" : "sniper", 0, p);
    }

    async shoot(gameUtils, times = 1) {
      let pool = gameUtils.symbols().filter(s => s !== this && s.value > 0);
      for (let i = 0; i < times && pool.length; i++) {
        const t = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
        gameUtils.beam(this.cell, t.cell);
        t.value = Math.min(gameStateRef.current.MAX_WIN_CAP, t.value * 2);
        t.resize();
        gameUtils.floatText(t.cell, "×2");
        await gameUtils.sleep(120);
      }
      gameUtils.updateHUD();
    }

    async onResolve(gameUtils) {
      await this.shoot(gameUtils, 1);
      await this.bump();
    }

    async onPersistent(gameUtils) {
      await this.shoot(gameUtils, 1);
      await this.bump();
    }
  }

  class NecroSymbol extends BaseSymbol {
    constructor() {
      super("necro", 0, false);
    }

    async onResolve(gameUtils) {
      const pool = gameUtils.symbols().filter(s => ["collector", "payer", "cp", "sniper"].includes(s.type));
      const n = rnd.int(1, 2);
      for (let i = 0; i < n && pool.length; i++) {
        const t = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
        if (t.cell) t.cell.setHighlight(true);
        await gameUtils.sleep(80);
        if (t.cell) t.cell.setHighlight(false);
        if (t.onResolve) await t.onResolve(gameUtils);
      }
      await this.bump();
    }
  }

  class UnlockSymbol extends BaseSymbol {
    constructor() {
      super("unlock", 0, false);
    }

    async onResolve(gameUtils) {
      gameUtils.floatText(this.cell, "U");
      await this.bump();
    }
  }

  class ArmsDealerSymbol extends BaseSymbol {
    constructor(p = false) {
      super(p ? "p_arms" : "arms", 0, p);
    }

    async mutateCoins(gameUtils, count = 1) {
      if (Math.random() < 0.5) return;
      const pool = gameUtils.activeCells().filter(c => c.symbol && c.symbol.type === "coin").map(c => c.symbol);
      const pickTypes = ["collector", "payer", "sniper", "necro"];
      for (let i = 0; i < count && pool.length; i++) {
        const target = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
        killTweens(target);
        const type = rnd.pick(pickTypes);
        const cell = target.cell;
        safeDestroySymbol(target);
        cell.symbol = null;
        const sym = gameUtils.createSymbol(type);
        sym.attach(cell);
        sym.resize();
        await sym.onSpawn();
      }
      gameUtils.updateHUD();
    }

    async onResolve(gameUtils) {
      await this.mutateCoins(gameUtils, 1);
      await this.bump();
    }

    async onPersistent(gameUtils) {
      await this.mutateCoins(gameUtils, 1);
      await this.bump();
    }
  }

  class UpgraderSymbol extends BaseSymbol {
    constructor() {
      super("upg", 0, false);
    }

    async onResolve(gameUtils) {
      const candidates = gameUtils.symbols().filter(s => ["collector", "payer", "sniper", "cp"].includes(s.type));
      const n = rnd.int(0, 1);
      for (let i = 0; i < n && candidates.length; i++) {
        const t = candidates.splice(Math.floor(Math.random() * candidates.length), 1)[0];
        const map = { collector: "p_collector", payer: "p_payer", sniper: "p_sniper", cp: "p_cp" };
        const newType = map[t.type];
        killTweens(t);
        const cell = t.cell;
        safeDestroySymbol(t);
        cell.symbol = null;
        const sym = gameUtils.createSymbol(newType);
        sym.attach(cell);
        sym.resize();
        await sym.onSpawn();
      }
      await this.bump();
      gameUtils.updateHUD();
    }
  }

  class ResetPlusSymbol extends BaseSymbol {
    constructor() {
      super("rplus", 0, false);
    }

    async onResolve(gameUtils) {
      const gameState = gameStateRef.current;
      if (gameState.respinBase < 5) {
        gameState.respinBase++;
        gameUtils.toast(`Reset de base +1 → ${gameState.respinBase}`);
      }
      gameState.respins = gameState.respinBase;
      gameUtils.updateHUD();
      await this.bump();
    }
  }

  // Initialisation de l'app PixiJS
  useEffect(() => {
    if (!containerRef.current) return;

    // Charger PixiPlugin
    loadPixiPlugin();

    // Configuration HD adaptée aux dimensions réelles du conteneur
    const pixelRatio = window.devicePixelRatio || 1;
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    
    const app = new PIXI.Application({
      background: 0x0b0f14,
      resizeTo: containerRef.current,
      antialias: true,
      resolution: Math.min(pixelRatio * 1.2, 2), // Résolution plus conservative
      autoDensity: true, // Ajustement automatique de la densité
      width: containerWidth || 800, // Utiliser la largeur réelle du conteneur
      height: containerHeight || 700, // Utiliser la hauteur réelle du conteneur
      powerPreference: 'high-performance', // Performance GPU optimale
      backgroundAlpha: 1, // Alpha opaque pour de meilleures performances
      clearBeforeRender: true,
      preserveDrawingBuffer: false, // Meilleures performances
      premultipliedAlpha: true // Rendu alpha plus rapide
    });

    containerRef.current.appendChild(app.view);
    appRef.current = app;
    
    // Gestionnaire de redimensionnement pour maintenir le centrage
    const handleResize = () => {
      if (gameState.cells.length > 0) {
        layout();
      }
    };
    
    // Écouter les redimensionnements
    app.renderer.on('resize', handleResize);
    window.addEventListener('resize', handleResize);

    const root = new PIXI.Container();
    app.stage.addChild(root);

    const gridLayer = new PIXI.Container();
    const fxLayer = new PIXI.Container();
    root.addChild(gridLayer, fxLayer);

    const gameState = gameStateRef.current;

    // Calculs de layout et fenêtre active
    const recomputeActiveBounds = () => {
      gameState.activeTop = Math.max(0, Math.floor((gameState.MAX_ROWS - gameState.ROWS) / 2));
      gameState.activeBottom = gameState.activeTop + gameState.ROWS - 1;
    };

    const layout = () => {
      const w = app.renderer.width;
      const h = app.renderer.height;
      
      console.log(`Layout - Canvas size: ${w}x${h}`); // Debug
      
      // Marges ajustées pour un centrage parfait
      const topMargin = 60; // Espace minimal pour le HUD
      const bottomMargin = 100; // Espace minimal pour les contrôles  
      const sideMargin = 10; // Marges minimales latérales
      
      const availableWidth = w - 2 * sideMargin;
      const availableHeight = h - topMargin - bottomMargin;
      
      console.log(`Available space: ${availableWidth}x${availableHeight}`); // Debug
      
      const sizeByW = Math.floor(availableWidth / gameState.COLS);
      const sizeByH = Math.floor(availableHeight / gameState.MAX_ROWS);
      
      // Taille ajustée pour un centrage optimal
      gameState.cellSize = Math.max(50, Math.min(sizeByW, sizeByH, 100));
      
      console.log(`Cell size: ${gameState.cellSize}`); // Debug
      
      const gridW = gameState.COLS * gameState.cellSize;
      const gridH = gameState.MAX_ROWS * gameState.cellSize;
      
      // Centrage horizontal parfait - décalage vers la gauche pour compenser
      gameState.origin.x = Math.round((w - gridW) / 2) - 50; // Décalage de 50px vers la gauche
      
      // Centrage vertical optimisé
      gameState.origin.y = Math.round(topMargin + (availableHeight - gridH) / 2);
      
      console.log(`Grid origin: ${gameState.origin.x}, ${gameState.origin.y}`); // Debug
      console.log(`Grid size: ${gridW}x${gridH}`); // Debug
      
      // Mise à jour des positions des cellules
      for (const c of gameState.cells) {
        c.container.x = gameState.origin.x + c.col * gameState.cellSize;
        c.container.y = gameState.origin.y + c.row * gameState.cellSize;
        c.resize();
      }
    };

    const rebuildGrid = () => {
      gridLayer.removeChildren();
      gameState.cells.length = 0;
      for (let c = 0; c < gameState.COLS; c++) {
        for (let r = 0; r < gameState.MAX_ROWS; r++) {
          const cell = new Cell(c, r, gameState, gridLayer);
          gameState.cells.push(cell);
        }
      }
      layout();
    };

    // Utilitaires de jeu
    const gameUtils = {
      cellAtAbs: (col, absRow) => gameState.cells.find(k => k.col === col && k.row === absRow),
      cellAt: (col, rRel) => gameUtils.cellAtAbs(col, gameState.activeTop + rRel),
      activeCells: () => {
        const arr = [];
        for (let c = 0; c < gameState.COLS; c++) {
          for (let r = gameState.activeTop; r <= gameState.activeBottom; r++) {
            const cell = gameUtils.cellAtAbs(c, r);
            if (cell) arr.push(cell);
          }
        }
        return arr;
      },
      emptyCells: () => gameUtils.activeCells().filter(c => c.isEmpty()),
      symbols: () => gameUtils.activeCells().filter(c => c.symbol).map(c => c.symbol),
      sumValues: () => Math.min(gameState.MAX_WIN_CAP, gameUtils.symbols().reduce((a, s) => a + (s.value || 0), 0)),
      sleep: (ms) => new Promise(r => setTimeout(r, ms)),
      updateHUD: () => {
        setUi({
          respins: gameState.respins,
          rows: gameState.ROWS,
          total: gameUtils.sumValues(),
          bet: gameState.BASE_BET,
          reset: gameState.respinBase,
          cap: gameState.MAX_WIN_CAP,
          turbo: gameState.turbo
        });
      },
      cellCenter: (cell) => ({
        x: gameState.origin.x + cell.col * gameState.cellSize + gameState.cellSize / 2,
        y: gameState.origin.y + cell.row * gameState.cellSize + gameState.cellSize / 2
      }),
      floatText: (cell, text) => {
        const t = new PIXI.Text(text, {
          fontFamily: "Arial Black",
          fontSize: Math.max(16, Math.floor(gameState.cellSize * .30)), // Taille minimum HD
          fontWeight: 900,
          fill: 0xffffff,
          stroke: 0x000000,
          strokeThickness: Math.max(2, Math.floor(gameState.cellSize * 0.01)), // Contour HD
          dropShadow: true,
          dropShadowBlur: Math.max(3, Math.floor(gameState.cellSize * 0.02)),
          dropShadowDistance: Math.max(2, Math.floor(gameState.cellSize * 0.015)),
          dropShadowColor: 0x000000,
          dropShadowAlpha: 0.9
        });
        t.anchor.set(.5, 1);
        t.x = gameState.origin.x + cell.col * gameState.cellSize + gameState.cellSize / 2;
        t.y = gameState.origin.y + cell.row * gameState.cellSize + gameState.cellSize - 10;
        fxLayer.addChild(t);
        gsap.to(t, { y: t.y - 24, alpha: 0, duration: .7, ease: "sine.out", onComplete: () => t.destroy() });
      },
      beam: (fromCell, toCell) => {
        const g = new PIXI.Graphics();
        const beamWidth = Math.max(3, Math.floor(gameState.cellSize * 0.02)); // Largeur adaptative HD
        g.lineStyle({ width: beamWidth, color: 0x58c1ff, alpha: .9 });
        const a = gameUtils.cellCenter(fromCell);
        const b = gameUtils.cellCenter(toCell);
        g.moveTo(a.x, a.y);
        g.lineTo(b.x, b.y);
        fxLayer.addChild(g);
        const dotSize = Math.max(3, Math.floor(gameState.cellSize * 0.025)); // Taille adaptative HD
        const dot = new PIXI.Graphics();
        dot.beginFill(0xffffff).drawCircle(0, 0, dotSize).endFill();
        dot.x = a.x;
        dot.y = a.y;
        fxLayer.addChild(dot);
        gsap.to(dot, { x: b.x, y: b.y, duration: .18, ease: "sine.out", onComplete: () => dot.destroy() });
        gsap.to(g, { alpha: 0, duration: .25, onComplete: () => g.destroy() });
      },
      suck: (toCell, fromCell) => {
        const a = gameUtils.cellCenter(fromCell);
        const b = gameUtils.cellCenter(toCell);
        const p = new PIXI.Graphics();
        p.beginFill(0xffd166).drawCircle(0, 0, 2.5).endFill();
        p.x = a.x;
        p.y = a.y;
        fxLayer.addChild(p);
        gsap.to(p, { x: b.x, y: b.y, alpha: 0.2, duration: .22, ease: "sine.in", onComplete: () => p.destroy() });
      },
      toast: (msg, ms = 1600) => {
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), ms);
      },
      electricArc: (a, b) => {
        // Arc électrique amélioré avec multiples éclairs et particules
        const distance = Math.hypot(b.x - a.x, b.y - a.y);
        const arcCount = gameState.turbo ? 1 : 3;
        
        for (let arcIndex = 0; arcIndex < arcCount; arcIndex++) {
          setTimeout(() => {
            const steps = 8 + Math.floor(distance / 100);
            const g = new PIXI.Graphics();
            g.lineStyle({ 
              width: 3 - arcIndex * 0.5, 
              color: 0x00ffff, 
              alpha: 1 - arcIndex * 0.2 
            });
            
            const dx = (b.x - a.x) / steps;
            const dy = (b.y - a.y) / steps;
            g.moveTo(a.x, a.y);
            
            for (let i = 1; i < steps; i++) {
              const deviation = (Math.random() - 0.5) * 25 * (1 - Math.abs(i/steps - 0.5) * 2);
              const px = a.x + dx * i + deviation;
              const py = a.y + dy * i + deviation;
              g.lineTo(px, py);
            }
            g.lineTo(b.x, b.y);
            
            fxLayer.addChild(g);
            
            // Glow secondaire
            if (arcIndex === 0) {
              const glow = new PIXI.Graphics();
              glow.lineStyle({ width: 6, color: 0x2bc0ff, alpha: .18 });
              glow.moveTo(a.x, a.y);
              glow.lineTo(b.x, b.y);
              fxLayer.addChild(glow);
              
              gsap.to(glow, { alpha: 0, duration: .4, onComplete: () => glow.destroy() });
              
              // Particules d'étincelles
              gameUtils.addSparkParticles(a.x, a.y, b.x, b.y);
            }
            
            gsap.to(g, { alpha: 0, duration: .35, onComplete: () => g.destroy() });
          }, arcIndex * 30);
        }
      },

      addSparkParticles: (startX, startY, endX, endY) => {
        if (gameState.turbo) return;
        
        const sparkCount = 6;
        for (let i = 0; i < sparkCount; i++) {
          const spark = new PIXI.Graphics();
          spark.beginFill(0xffffff, 0.9);
          spark.drawCircle(0, 0, 1.5);
          spark.endFill();
          spark._isDestroyed = false; // Utiliser un nom custom au lieu de 'destroyed'
          
          // Position aléatoire le long de l'arc
          const t = 0.2 + Math.random() * 0.6;
          spark.x = startX + (endX - startX) * t;
          spark.y = startY + (endY - startY) * t;
          
          fxLayer.addChild(spark);
          
          // Animation de dispersion avec vérifications
          const angle = Math.random() * Math.PI * 2;
          const distance = 15 + Math.random() * 20;
          
          gsap.to(spark, {
            x: spark.x + Math.cos(angle) * distance,
            y: spark.y + Math.sin(angle) * distance,
            alpha: 0,
            scale: 0.1,
            duration: 0.3,
            ease: "power2.out",
            onUpdate: () => {
              if (spark._isDestroyed || spark.destroyed) {
                gsap.killTweensOf(spark);
              }
            },
            onComplete: () => {
              try {
                if (!spark._isDestroyed && !spark.destroyed) {
                  spark._isDestroyed = true;
                  spark.destroy();
                }
              } catch (e) {
                // Ignorer les erreurs
              }
            }
          });
        }
      },
      screenshake: (amount = 4, dur = .12) => {
        return gsap.fromTo(root, { x: 0 }, { x: amount, yoyo: true, repeat: 3, duration: dur, ease: "sine.inOut" });
      },
      spinFX: (cell, dur = 0.18) => {
        // Crée un petit "spinner" circulaire centré sur la case
        const center = gameUtils.cellCenter(cell);
        const r = Math.max(8, Math.floor(gameState.cellSize * 0.32));
        const sp = new PIXI.Container();
        sp.x = center.x;
        sp.y = center.y;
        sp.rotation = Math.random() * Math.PI;
        const ring = new PIXI.Graphics();
        ring.lineStyle({ width: 3, color: 0x5fd3ff, alpha: 0.8 }).drawCircle(0, 0, r);
        const dot = new PIXI.Graphics();
        dot.beginFill(0xffffff).drawCircle(r, 0, 3).endFill();
        sp.addChild(ring, dot);
        fxLayer.addChild(sp);
        return new Promise((resolve) => {
          gsap.to(sp, { rotation: "+=6.283", duration: dur, ease: "sine.inOut" });
          gsap.to(sp, { alpha: 0.0, delay: dur - 0.08, duration: 0.08, onComplete: () => { sp.destroy(); resolve(); } });
        });
      }
    };

    // Fonction sweepSpinAllCellsTopDown
    const sweepSpinAllCellsTopDown = async () => {
      // Lance les spinners **rangée par rangée** de 0 → MAX_ROWS-1
      const rowDur = gameState.turbo ? 0.12 : 0.18;
      for (let absRow = 0; absRow < gameState.MAX_ROWS; absRow++) {
        const rowCells = gameState.cells.filter(c => c.row === absRow);
        await Promise.all(rowCells.map(c => gameUtils.spinFX(c, rowDur)));
        // petite pause pour un effet "vague" net
        await gameUtils.sleep(gameState.turbo ? 10 : 40);
      }
    };

    // Fabrique de symboles
    const createSymbol = (type) => {
      switch (type) {
        case "coin": return new CoinSymbol(rnd.pick([1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 5]));
        case "collector": return new CollectorSymbol(false);
        case "payer": return new PayerSymbol(rnd.pick([1, 1, 1, 1, 2]), false);
        case "cp": return new ComboCPSymbol(false);
        case "sniper": return new SniperSymbol(false);
        case "necro": return new NecroSymbol();
        case "unlock": return new UnlockSymbol();
        case "arms": return new ArmsDealerSymbol(false);
        case "upg": return new UpgraderSymbol();
        case "rplus": return new ResetPlusSymbol();
        // versions persistantes
        case "p_collector": return new CollectorSymbol(true);
        case "p_payer": return new PayerSymbol(rnd.pick([1, 1, 1, 2]), true);
        case "p_cp": return new ComboCPSymbol(true);
        case "p_sniper": return new SniperSymbol(true);
        case "p_arms": return new ArmsDealerSymbol(true);
        default: return new CoinSymbol(1);
      }
    };

    // Ajouter createSymbol aux gameUtils
    gameUtils.createSymbol = createSymbol;

    // ========= Règle d'unlock par LIGNE PLEINE (alternance haut/bas) =========
    const isRowFullRel = (rRel) => {
      for (let c = 0; c < gameState.COLS; c++) {
        const cell = gameUtils.cellAt(c, rRel);
        if (!cell || !cell.symbol) return false;
      }
      return true;
    };

    const getFullRowsRel = () => {
      const res = [];
      for (let r = 0; r < gameState.ROWS; r++) {
        if (isRowFullRel(r)) res.push(r);
      }
      return res;
    };

    const unlockRow = async (direction, fullRowsRel) => {
      if (gameState.ROWS >= gameState.MAX_ROWS) return;
      // Détermine la source d'arc (ligne pleine la plus proche du bord qui s'ouvre)
      fullRowsRel = fullRowsRel && fullRowsRel.length ? fullRowsRel : getFullRowsRel();
      const sourceRel = direction === 'top' ? Math.min(...fullRowsRel) : Math.max(...fullRowsRel);
      const sourceAbs = gameState.activeTop + sourceRel;
      const targetAbs = (direction === 'top') ? (gameState.activeTop - 1) : (gameState.activeBottom + 1);
      
      // ⚡ arcs électriques de chaque case pleine vers la rangée déverrouillée
      if (targetAbs >= 0 && targetAbs < gameState.MAX_ROWS) {
        for (let c = 0; c < gameState.COLS; c++) {
          const from = gameUtils.cellAtAbs(c, sourceAbs);
          const to = gameUtils.cellAtAbs(c, targetAbs);
          if (from && to) gameUtils.electricArc(gameUtils.cellCenter(from), gameUtils.cellCenter(to));
        }
        await gameUtils.sleep(220);
      }
      
      // Étend la fenêtre active (sans déplacer les symboles existants)
      if (direction === 'top' && gameState.activeTop > 0) gameState.activeTop -= 1;
      else if (direction === 'bottom' && gameState.activeBottom < gameState.MAX_ROWS - 1) gameState.activeBottom += 1;
      gameState.ROWS = Math.min(gameState.MAX_ROWS, gameState.ROWS + 1);
      
      // Rafraîchit le rendu (couleurs/alpha des cellules)
      for (const c of gameState.cells) c.resize();
      gameUtils.updateHUD();
      await gameUtils.sleep(120);
    };

    const unlockRowByRule = async (fullRowsRel) => {
      if (gameState.ROWS >= gameState.MAX_ROWS) return;
      const dir = gameState.nextUnlockTop ? 'top' : 'bottom';
      await unlockRow(dir, fullRowsRel);
      gameState.nextUnlockTop = !gameState.nextUnlockTop;
    };

    const maybeUnlockFromFullRows = async () => {
      const fullRel = getFullRowsRel();
      if (fullRel.length > gameState.fullRowsAwarded && gameState.ROWS < gameState.MAX_ROWS) {
        await unlockRowByRule(fullRel);
        gameState.fullRowsAwarded++;
      }
    };

    // Fonctions de jeu
    const resetBoard = () => {
      for (const c of gameState.cells) {
        if (c.symbol) {
          safeDestroySymbol(c.symbol);
          c.symbol = null;
        }
      }
      gameState.ROWS = 4;
      gameState.fullRowsAwarded = 0;
      gameState.nextUnlockTop = true;
      gameState.respinBase = 3;
      recomputeActiveBounds();
      for (const c of gameState.cells) c.resize();
      gameState.respins = 0;
      gameUtils.updateHUD();
    };

    const startBonus = async () => {
      if (gameState.playing) return;
      gameState.playing = true;
      resetBoard();

      // 💿 NEW: animation de "spin" rangée par rangée sur **toutes** les cases (actives + verrouillées)
      await sweepSpinAllCellsTopDown();

      // spawn initial sur la fenêtre active (après la vague de spin)
      const starters = rnd.int(3, 4);
      for (let i = 0; i < starters; i++) {
        const empt = gameUtils.emptyCells();
        if (!empt.length) break;
        const cell = rnd.pick(empt);
        const coin = new CoinSymbol(rnd.pick([1, 2, 3]));
        coin.attach(cell);
        coin.resize();
        await coin.onSpawn();
      }
      gameState.respins = gameState.respinBase;
      gameUtils.updateHUD();
      gameUtils.toast("Bonus lancé ! Auto en cours…");
      gameState.autoplay = true;
      autoPlayLoop();
    };

    const autoPlayLoop = async () => {
      while (gameState.autoplay && gameState.playing && gameState.respins > 0) {
        await spinStep();
        if (!gameState.playing) break;
        await gameUtils.sleep(gameState.turbo ? 120 : 320);
      }
    };

    const spinStep = async () => {
      if (!gameState.playing || gameState.respins <= 0 || gameState.isSpinning) return;
      gameState.isSpinning = true;
      
      try {
        // 1) SPAWN
        const empties = gameUtils.emptyCells();
        let spawned = 0;
        gameState.lastSpawned = [];
        
        if (empties.length) {
          const spawnCountTable = gameState.turbo ? { 0: 3, 1: 4, 2: 1 } : { 0: 5, 1: 3, 2: 1 };
          const spawnCount = Number(weightedPick(spawnCountTable));
          const chosen = pickNRandom(empties, Math.min(empties.length, spawnCount));
          
          for (const cell of chosen) {
            const key = gameState.ROWS <= 5 ? "base" : "deep";
            const type = weightedPick(WEIGHTS[key]);
            const sym = createSymbol(type);
            sym.attach(cell);
            sym.resize();
            await sym.onSpawn();
            spawned++;
            gameState.lastSpawned.push(sym);
          }
        }
        
        gameState.respins = (spawned > 0) ? gameState.respinBase : (gameState.respins - 1);
        gameUtils.updateHUD();

        // 2) RESOLVE non-persistants du tour
        const order = ["arms", "upg", "payer", "sniper", "collector", "cp", "necro", "unlock"];
        for (const t of order) {
          const group = gameState.lastSpawned.filter(s => s.type === t);
          for (const s of group) {
            if (s.cell) s.cell.setHighlight(true);
            if (s.onResolve) await s.onResolve(gameUtils);
            if (s.cell) s.cell.setHighlight(false);
            await gameUtils.sleep(gameState.turbo ? 30 : 140);
          }
        }

        // 3) PERSISTANTS (tous les tours)
        const pOrder = ["p_arms", "p_payer", "p_sniper", "p_collector", "p_cp"];
        for (const t of pOrder) {
          const group = gameUtils.symbols().filter(s => s.type === t);
          for (const s of group) {
            if (s.cell) s.cell.setHighlight(true);
            if (s.onPersistent) await s.onPersistent(gameUtils);
            if (s.cell) s.cell.setHighlight(false);
            await gameUtils.sleep(gameState.turbo ? 30 : 120);
          }
        }

        // 4) UNLOCK par lignes pleines (avec arc électrique)
        await maybeUnlockFromFullRows();

        // 5) Vérification fin
        const mult = gameUtils.sumValues();
        if (mult >= gameState.MAX_WIN_CAP) {
          setPanelData({ title: "MAX WIN ATTEINT", total: `${mult}×` });
          setShowPanel(true);
          gameState.playing = false;
          gameState.autoplay = false;
          return;
        } else if (mult >= gameState.BIG_WIN_THRESHOLD) {
          // Toast pour gros gain (pourrait être ajouté)
        }

        gameUtils.updateHUD();
        if (gameState.respins <= 0) {
          await endBonus();
          gameState.autoplay = false;
        }
      } finally {
        gameState.isSpinning = false;
      }
    };

    const endBonus = async () => {
      const totalMult = gameUtils.sumValues();
      const total = totalMult * gameState.BASE_BET;
      setPanelData({ 
        title: "Fin du bonus", 
        total: `${totalMult}× (=${total.toFixed(2)})` 
      });
      setShowPanel(true);
      gameState.playing = false;
    };

    // Expose des fonctions pour les contrôles
    window.moneyCartGame = {
      startBonus,
      spinStep: () => {
        gameState.autoplay = false;
        spinStep();
      },
      toggleTurbo: () => {
        gameState.turbo = !gameState.turbo;
        setUi(prev => ({ ...prev, turbo: gameState.turbo }));
      },
      reset: () => {
        gameState.playing = false;
        setShowPanel(false);
        resetBoard();
      },
      runTests: async () => {
        try {
          // Test 1: tween scale ne jette pas (pas de transform DOM)
          const testCell = gameUtils.cellAt(0, 0);
          if (!testCell) {
            console.warn('Test 1 skipped: pas de cellule disponible');
            return;
          }
          const coin = new CoinSymbol(5);
          coin.attach(testCell);
          coin.resize();
          await coin.onSpawn();
          await coin.bump();
          testCell.symbol = null;
          safeDestroySymbol(coin);

          // Test 2: règle d'unlock par ligne pleine + alternance top/bottom
          resetBoard();
          gameState.playing = true;
          for (let c = 0; c < gameState.COLS; c++) {
            const cell = gameUtils.cellAt(c, 0);
            if (!cell) continue;
            const k = new CoinSymbol(1);
            k.attach(cell);
            k.resize();
          }
          const beforeRows = gameState.ROWS;
          await maybeUnlockFromFullRows();
          console.assert(gameState.ROWS === beforeRows + 1, 'Une rangée doit être ajoutée quand une ligne est pleine');
          
          const firstWasTop = !gameState.nextUnlockTop;
          for (let c = 0; c < gameState.COLS; c++) {
            const cell = gameUtils.cellAt(c, 1) || gameUtils.cellAt(c, 2);
            if (cell && !cell.symbol) {
              const k = new CoinSymbol(1);
              k.attach(cell);
              k.resize();
            }
          }
          const beforeRows2 = gameState.ROWS;
          await maybeUnlockFromFullRows();
          console.assert(gameState.ROWS === beforeRows2 + 1, 'Une deuxième rangée doit être ajoutée sur nouvelle ligne pleine');
          console.assert(firstWasTop === true, 'Le premier unlock doit partir du haut');

          // Test 3: ArmsDealer ne crash pas si des coins sont encore en popIn
          const adCell = gameUtils.emptyCells()[0] || gameUtils.cellAt(0, 0);
          if (!adCell) {
            console.warn('Test 3 skipped: pas de cellule disponible');
          } else {
            const ad = new ArmsDealerSymbol(false);
            ad.attach(adCell);
            ad.resize();
            for (let i = 0; i < 3; i++) {
              const e = gameUtils.emptyCells()[0];
              if (!e) break;
              const k = new CoinSymbol(1);
              k.attach(e);
              k.resize();
              k.onSpawn();
            }
            await ad.onResolve(gameUtils);
          }

          // Test 4: Upgrader -> versions persistantes valides (kill tween avant destroy)
          const ugCell = gameUtils.emptyCells()[0] || gameUtils.cellAt(0, 2);
          if (!ugCell) {
            console.warn('Test 4 skipped: pas de cellule disponible');
          } else {
            const ug = new UpgraderSymbol();
            ug.attach(ugCell);
            ug.resize();
            await ug.onResolve(gameUtils);
          }

          // Test 5: ResetPlus augmente la base et remet le compteur
          const rCell = gameUtils.emptyCells()[0] || gameUtils.cellAt(1, 2);
          if (!rCell) {
            console.warn('Test 5 skipped: pas de cellule disponible');
          } else {
            const rplus = new ResetPlusSymbol();
            rplus.attach(rCell);
            rplus.resize();
            await rplus.onResolve(gameUtils);
            console.assert(gameState.respinBase >= 3 && gameState.respins === gameState.respinBase, 'ResetPlus doit remettre le compteur au nouveau base');
          }

          // Test 6: Un symbole Unlock seul NE doit PAS débloquer de rangée
          const rowsBeforeUnlock = gameState.ROWS;
          const uCell = gameUtils.emptyCells()[0];
          if (!uCell) {
            console.warn('Test 6 skipped: pas de cellule disponible');
          } else {
            const u = new UnlockSymbol();
            u.attach(uCell);
            u.resize();
            await u.onResolve(gameUtils);
            console.assert(gameState.ROWS === rowsBeforeUnlock, "Unlock ne doit pas débloquer si la ligne n'est pas pleine");
          }

          // Test 7: PopIn/Bump sur objet non attaché → no-op sans crash
          const ghost = new CoinSymbol(1);
          await ghost.onSpawn();
          await ghost.bump();

          // Test 8: Destroy en cours de tween ne provoque pas d'accès à scale null
          const ccell = gameUtils.emptyCells()[0];
          if (!ccell) {
            console.warn('Test 8 skipped: pas de cellule disponible');
          } else {
            const temp = new CoinSymbol(2);
            temp.attach(ccell);
            temp.resize();
            const tween = temp.bump();
            safeDestroySymbol(temp);
            await tween.catch(() => {});
          }

          // Test 9: Sniper ne tire qu'une seule fois par résolution
          resetBoard();
          gameState.playing = true;
          const sCell = gameUtils.cellAt(0, 0);
          const coinCell = gameUtils.cellAt(1, 0);
          if (!sCell || !coinCell) {
            console.warn('Test 9 skipped: pas de cellules disponibles');
          } else {
            const sniper = new SniperSymbol(false);
            sniper.attach(sCell);
            sniper.resize();
            const targetCoin = new CoinSymbol(2);
            targetCoin.attach(coinCell);
            targetCoin.resize();
            await sniper.onResolve(gameUtils);
            console.assert(targetCoin.value === 4, 'Sniper doit doubler une seule fois la cible');
          }

          // Test 10: plusieurs lignes complètes dans un même tour -> 1 seul unlock
          resetBoard();
          gameState.playing = true;
          for (let c = 0; c < gameState.COLS; c++) {
            let cellA = gameUtils.cellAt(c, 0);
            let cellB = gameUtils.cellAt(c, 1);
            if (!cellA || !cellB) continue;
            const k1 = new CoinSymbol(1);
            k1.attach(cellA);
            k1.resize();
            const k2 = new CoinSymbol(1);
            k2.attach(cellB);
            k2.resize();
          }
          const beforeTest10 = gameState.ROWS;
          await maybeUnlockFromFullRows();
          console.assert(gameState.ROWS === beforeTest10 + 1, 'Quand deux lignes sont complètes en même temps, une seule rangée doit se débloquer (par tour)');

          // Test 11: createSymbol est défini
          console.assert(typeof createSymbol === 'function', 'createSymbol doit être défini');
          const csA = createSymbol('coin');
          console.assert(csA instanceof CoinSymbol, 'createSymbol("coin") → CoinSymbol');
          safeDestroySymbol(csA);
          const csB = createSymbol('collector');
          console.assert(csB instanceof CollectorSymbol, 'createSymbol("collector") → CollectorSymbol');
          safeDestroySymbol(csB);
          const csC = createSymbol('p_collector');
          console.assert(csC instanceof CollectorSymbol && csC.persistent === true, 'createSymbol("p_collector") → CollectorSymbol(persistent)');
          safeDestroySymbol(csC);

          // Test 12: la grille est toujours MAX_ROWS et les rangées verrouillées n'acceptent pas de spawn
          resetBoard();
          gameState.playing = true;
          console.assert(gameState.cells.length === gameState.COLS * gameState.MAX_ROWS, 'La grille doit afficher toutes les rangées visibles');
          for (let c = 0; c < gameState.COLS; c++) {
            for (let r = 0; r < gameState.ROWS; r++) {
              const cell = gameUtils.cellAt(c, r);
              if (cell && cell.isEmpty()) {
                const k = new CoinSymbol(1);
                k.attach(cell);
              }
            }
          }
          console.assert(gameUtils.emptyCells().length === 0, 'Aucune case active vide après remplissage complet');
          await maybeUnlockFromFullRows();
          console.assert(gameUtils.emptyCells().length === gameState.COLS, 'Une rangée déverrouillée ajoute exactement COLS cases vides actives');

          // Test 13 (bump() thenable)
          const cellTest13 = gameUtils.cellAt(0, 0);
          if (!cellTest13) {
            console.warn('Test 13 skipped: pas de cellule disponible');
          } else {
            const sTest13 = new CoinSymbol(1);
            sTest13.attach(cellTest13);
            sTest13.resize();
            const pTest13 = sTest13.bump();
            safeDestroySymbol(sTest13);
            const res = await Promise.race([pTest13.then(() => "ok"), gameUtils.sleep(1000).then(() => "timeout")]);
            console.assert(res === "ok", 'bump() doit se résoudre même après killTweensOf/destroy');
          }

          // Test 14 (popIn() promise)
          const cell2 = gameUtils.cellAt(0, 1);
          if (!cell2) {
            console.warn('Test 14 skipped: pas de cellule disponible');
          } else {
            const s2 = new CoinSymbol(1);
            s2.attach(cell2);
            s2.resize();
            const beforeTest14 = performance.now();
            await s2.onSpawn();
            const elapsed = performance.now() - beforeTest14;
            console.assert(elapsed >= 200, 'popIn/onSpawn devrait attendre au moins ~200ms (approx)');
            safeDestroySymbol(s2);
            cell2.symbol = null;
          }

          // Test 15 (nouveau): la vague de spin de startBonus existe et prend un temps non nul
          resetBoard();
          gameState.playing = true;
          const t0 = performance.now();
          await sweepSpinAllCellsTopDown();
          const elapsed2 = performance.now() - t0;
          console.assert(elapsed2 >= (gameState.MAX_ROWS * (gameState.turbo ? 80 : 140)) * 0.5 / 1.0, 'La vague de spin devrait durer un minimum (approx)');

          gameUtils.toast('Tests OK ✅');
        } catch (err) {
          console.error(err);
          gameUtils.toast('Tests en erreur: ' + (err?.message || err));
        }
      }
    };

    // Initialisation
    recomputeActiveBounds();
    rebuildGrid();
    gameUtils.updateHUD();
    
    // Forcer un layout immédiat pour s'assurer que les cellules sont visibles
    setTimeout(() => {
      layout();
      console.log('Layout forcé après initialisation');
    }, 100);

    // Cleanup
    return () => {
      // Nettoyer les event listeners
      window.removeEventListener('resize', handleResize);
      if (appRef.current) {
        appRef.current.renderer.off('resize', handleResize);
        appRef.current.destroy(true);
        appRef.current = null;
      }
      if (window.moneyCartGame) {
        delete window.moneyCartGame;
      }
    };
  }, []);

  // Gestion des événements clavier
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" && window.moneyCartGame) {
        e.preventDefault();
        window.moneyCartGame.spinStep();
      }
      if (e.key === "Escape") {
        setShowPanel(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  // Rendu conditionnel de l'intro comme overlay
  const renderIntro = () => {
    if (!showIntro) return null;
    return <MoneyCartIntro onComplete={handleIntroComplete} />;
  };

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '700px', 
      background: 'linear-gradient(135deg, #0a0e1a 0%, #1a2332 50%, #0f1623 100%)',
      borderRadius: '16px', 
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Arrière-plan cyberpunk avec motifs */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.2) 0%, transparent 50%),
          linear-gradient(45deg, rgba(0,255,255,0.05) 0%, transparent 25%, transparent 75%, rgba(255,0,255,0.05) 100%)
        `,
        zIndex: 0
      }} />
      
      {/* Canvas PixiJS */}
      <div ref={containerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
      
      {/* HUD Style Money Cart 4 */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        right: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10
      }}>
        {/* SPINS LEFT - Style octogone */}
        <div style={{
          background: 'linear-gradient(145deg, #1a2332, #0a0e1a)',
          border: '2px solid #ff4466',
          borderRadius: '12px',
          padding: '8px 16px',
          clipPath: 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)',
          minWidth: '120px',
          textAlign: 'center',
          boxShadow: '0 0 20px rgba(255, 68, 102, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}>
          <div style={{ fontSize: '11px', color: '#ff4466', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            SPINS LEFT
          </div>
          <div style={{ fontSize: '24px', color: '#ffffff', fontWeight: 900, textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>
            {ui.respins}
          </div>
        </div>

        {/* Indicateurs centraux */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{
            background: 'rgba(0,255,255,0.1)',
            border: '1px solid rgba(0,255,255,0.3)',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '12px',
            color: '#00ffff',
            textShadow: '0 0 6px rgba(0,255,255,0.8)'
          }}>
            Rangées: {ui.rows}/8
          </div>
          <div style={{
            background: 'rgba(255,215,0,0.1)',
            border: '1px solid rgba(255,215,0,0.3)',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '12px',
            color: '#ffd700',
            textShadow: '0 0 6px rgba(255,215,0,0.8)'
          }}>
            Mise: {ui.bet.toFixed(2)}
          </div>
        </div>

        {/* TOTAL WIN - Style octogone */}
        <div style={{
          background: 'linear-gradient(145deg, #1a2332, #0a0e1a)',
          border: '2px solid #00ffff',
          borderRadius: '12px',
          padding: '8px 16px',
          clipPath: 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)',
          minWidth: '120px',
          textAlign: 'center',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}>
          <div style={{ fontSize: '11px', color: '#00ffff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            TOTAL WIN
          </div>
          <div style={{ fontSize: '24px', color: '#ffffff', fontWeight: 900, textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>
            {ui.total}
          </div>
        </div>
      </div>

      {/* Contrôles style Money Cart 4 */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        right: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px',
        zIndex: 10
      }}>
        {/* Bouton principal START */}
        <button
          onClick={() => window.moneyCartGame?.startBonus()}
          style={{
            position: 'relative',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(145deg, #00ff88, #00cc66)',
            border: '3px solid #ffffff',
            color: '#000000',
            fontSize: '12px',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 0 30px rgba(0, 255, 136, 0.6), inset 0 2px 4px rgba(255,255,255,0.3)',
            transition: 'all 0.15s ease',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 0 40px rgba(0, 255, 136, 0.8), inset 0 2px 4px rgba(255,255,255,0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 0 30px rgba(0, 255, 136, 0.6), inset 0 2px 4px rgba(255,255,255,0.3)';
          }}
        >
          START
        </button>

        {/* Indicateur de mise */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px'
        }}>
          <div style={{
            fontSize: '10px',
            color: '#00ffff',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            BET (FUN)
          </div>
          <div style={{
            background: 'linear-gradient(145deg, #1a2332, #0a0e1a)',
            border: '1px solid #00ffff',
            borderRadius: '8px',
            padding: '4px 12px',
            fontSize: '16px',
            color: '#ffffff',
            fontWeight: 700,
            minWidth: '60px',
            textAlign: 'center'
          }}>
            {ui.bet.toFixed(2)}
          </div>
        </div>

        {/* Boutons secondaires */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => window.moneyCartGame?.spinStep()}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              background: 'linear-gradient(145deg, #1a2332, #0a0e1a)',
              border: '1px solid rgba(0,255,255,0.3)',
              color: '#00ffff',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textTransform: 'uppercase'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(145deg, #00ffff, #0088cc)';
              e.target.style.color = '#000000';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(145deg, #1a2332, #0a0e1a)';
              e.target.style.color = '#00ffff';
            }}
          >
            SPIN
          </button>
          
          <button
            onClick={() => window.moneyCartGame?.toggleTurbo()}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              background: ui.turbo ? 'linear-gradient(145deg, #ff6600, #cc4400)' : 'linear-gradient(145deg, #1a2332, #0a0e1a)',
              border: `1px solid ${ui.turbo ? '#ff6600' : 'rgba(255,102,0,0.3)'}`,
              color: ui.turbo ? '#ffffff' : '#ff6600',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textTransform: 'uppercase'
            }}
          >
            TURBO
          </button>
          
          <button
            onClick={() => window.moneyCartGame?.reset()}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              background: 'linear-gradient(145deg, #1a2332, #0a0e1a)',
              border: '1px solid rgba(255,68,102,0.3)',
              color: '#ff4466',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textTransform: 'uppercase'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(145deg, #ff4466, #cc2244)';
              e.target.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(145deg, #1a2332, #0a0e1a)';
              e.target.style.color = '#ff4466';
            }}
          >
            RESET
          </button>
          
          <button
            onClick={() => window.moneyCartGame?.runTests()}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              background: 'linear-gradient(145deg, #1a2332, #0a0e1a)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#cccccc',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textTransform: 'uppercase'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(145deg, #ffffff, #cccccc)';
              e.target.style.color = '#000000';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(145deg, #1a2332, #0a0e1a)';
              e.target.style.color = '#cccccc';
            }}
          >
            TEST
          </button>
          
          <button
            onClick={() => setShowIntro(true)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              background: 'linear-gradient(145deg, #1a2332, #0a0e1a)',
              border: '1px solid rgba(138, 43, 226, 0.3)',
              color: '#9370db',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textTransform: 'uppercase'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(145deg, #9370db, #663399)';
              e.target.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(145deg, #1a2332, #0a0e1a)';
              e.target.style.color = '#9370db';
            }}
          >
            HELP
          </button>
        </div>

        {/* Indicateur WIN */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px'
        }}>
          <div style={{
            fontSize: '10px',
            color: '#ffd700',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            WIN (FUN)
          </div>
          <div style={{
            background: 'linear-gradient(145deg, #1a2332, #0a0e1a)',
            border: '1px solid #ffd700',
            borderRadius: '8px',
            padding: '4px 12px',
            fontSize: '16px',
            color: '#ffd700',
            fontWeight: 700,
            minWidth: '60px',
            textAlign: 'center',
            textShadow: '0 0 6px rgba(255, 215, 0, 0.8)'
          }}>
            {(ui.total * ui.bet).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Panel de fin */}
      {showPanel && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,.45)',
          backdropFilter: 'blur(2px)'
        }}>
          <div style={{
            background: '#0e1620',
            border: '1px solid rgba(255,255,255,.12)',
            borderRadius: '16px',
            padding: '22px',
            minWidth: '320px',
            maxWidth: '92vw',
            textAlign: 'center',
            color: '#e6f0ff'
          }}>
            <h2 style={{ margin: '0 0 8px', fontSize: '22px' }}>{panelData.title}</h2>
            <p>Gains totaux : <b>{panelData.total}</b></p>
            <div style={{ opacity: .8, fontSize: '12px', marginTop: '6px' }}>
              Échap ou clic pour fermer
            </div>
            <button
              onClick={() => setShowPanel(false)}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                borderRadius: '8px',
                background: '#1d2a36',
                border: '1px solid rgba(255,255,255,.1)',
                color: '#e6f0ff',
                cursor: 'pointer'
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div style={{
          position: 'absolute',
          right: '16px',
          bottom: '16px',
          fontWeight: 700,
          background: '#12202c',
          border: '1px solid rgba(255,255,255,.08)',
          borderRadius: '12px',
          padding: '10px 14px',
          color: '#e6f0ff',
          fontSize: '14px',
          opacity: showToast ? 1 : 0,
          transform: showToast ? 'translateY(0)' : 'translateY(10px)',
          transition: '.25s',
          zIndex: 1000
        }}>
          {toastMessage}
        </div>
      )}

      {/* Overlay d'introduction */}
      {renderIntro()}
    </div>
  );
});

MoneyCartGame.displayName = 'MoneyCartGame';

export default MoneyCartGame;

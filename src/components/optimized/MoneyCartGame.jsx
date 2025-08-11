import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';

// Enregistrer le plugin GSAP PixiJS
gsap.registerPlugin(PixiPlugin);

const MoneyCartGame = () => {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  
  const [hudData, setHudData] = useState({
    respins: '—',
    rows: '—',
    total: '0×',
    bet: '1.00',
    reset: '3',
    cap: '15000×'
  });

  const [showPanel, setShowPanel] = useState(false);
  const [panelData, setPanelData] = useState({ title: '', total: '' });
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Configuration du jeu
  const COLS = 6;
  const ROWS = 4;
  const MAX_ROWS = 8;
  const BASE_BET = 1.00;
  const MAX_WIN_CAP = 15000;
  let cellSize = 110;
  let respinBase = 3;
  let respins = 0;
  let playing = false;
  let cells = [];
  let activeTop = 0, activeBottom = 0;

  // Pondérations des symboles
  const WEIGHTS = {
    base: { coin: 70, collector: 5, payer: 5, sniper: 3 }
  };

  // Utilitaires
  const toast = (msg, ms = 1600) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), ms);
  };

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const rnd = {
    next: () => Math.random(),
    int: (a, b) => Math.floor(Math.random() * (b - a + 1)) + a,
    pick: (a) => a[Math.floor(Math.random() * a.length)]
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

  const pickNRandom = (arr, n) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, Math.min(n, a.length));
  };

  // Classe Cell
  class Cell {
    constructor(col, rowAbs) {
      this.col = col;
      this.row = rowAbs;
      this.symbol = null;
      this.container = new PIXI.Container();
      appRef.current.stage.addChild(this.container);
      
      this.bg = new PIXI.Graphics();
      this.hatch = new PIXI.Graphics();
      this.halo = new PIXI.Graphics();
      this.halo.alpha = 0;
      this.container.addChild(this.bg, this.hatch, this.halo);
      this.resize();
    }

    resize() {
      const pad = 8;
      const r = this.row >= activeTop && this.row <= activeBottom;
      
      // Fond
      this.bg.clear()
        .beginFill(r ? 0x0f1822 : 0x0a0e13)
        .drawRoundedRect(pad, pad, cellSize - 2 * pad, cellSize - 2 * pad, 12)
        .endFill();
      
      this.bg.lineStyle(1, r ? 0x294055 : 0x1b2833, 0.85)
        .drawRoundedRect(pad, pad, cellSize - 2 * pad, cellSize - 2 * pad, 12);
      
      // Motif hatch si verrouillé
      this.hatch.clear();
      if (!r) {
        this.hatch.lineStyle(1, 0x365069, 0.25);
        for (let k = -cellSize; k < cellSize; k += 8) {
          this.hatch.moveTo(pad + k, pad);
          this.hatch.lineTo(pad + k + cellSize - 2 * pad, pad + cellSize - 2 * pad);
        }
      }
      
      // Halo pour surbrillance
      this.halo.clear()
        .beginFill(0x58c1ff, 0.07)
        .drawRoundedRect(4, 4, cellSize - 8, cellSize - 8, 16)
        .endFill();
      
      // Redessine le symbole si présent
      if (this.symbol) this.symbol.resize();
      
      // Grise tout le contenu si verrouillé
      this.container.alpha = r ? 1 : 0.55;
    }

    isEmpty() { return !this.symbol; }
  }

  // Classe BaseSymbol
  class BaseSymbol extends PIXI.Container {
    constructor(type, value = 0) {
      super();
      this.type = type;
      this.value = value;
      this.cell = null;
    }

    attach(cell) {
      this.cell = cell;
      cell.symbol = this;
      cell.container.addChild(this);
    }

    async onSpawn() { 
      this.scale.set(0);
      await gsap.to(this.scale, { x: 1, y: 1, duration: 0.3, ease: "back.out(1.7)" });
    }

    resize() {
      this.removeChildren();
      const color = this.getColor();
      const r = Math.floor(cellSize * 0.28);
      const cx = Math.floor(cellSize / 2), cy = cx;
      
      const g = new PIXI.Graphics();
      g.x = cx; g.y = cy;
      g.beginFill(color).drawCircle(0, 0, r).endFill();
      g.lineStyle(6, 0x0b0f14, 0.85).drawCircle(0, 0, r - 8);
      
      const t = new PIXI.Text(this.getLabel(), {
        fontFamily: "Inter,Arial",
        fontSize: Math.floor(r * 0.9),
        fontWeight: 800,
        fill: 0xffffff,
        align: "center"
      });
      t.anchor.set(0.5);
      t.y = 2;
      this.addChild(g, t);
    }

    getColor() {
      switch (this.type) {
        case 'coin': return 0xffd700;
        case 'collector': return 0x00ff88;
        case 'payer': return 0xff6b35;
        case 'sniper': return 0xff4757;
        default: return 0xcccccc;
      }
    }

    getLabel() {
      switch (this.type) {
        case 'coin': return this.value || 'C';
        case 'collector': return 'CL';
        case 'payer': return 'P';
        case 'sniper': return 'S';
        default: return '?';
      }
    }
  }

  // Classes de symboles spécifiques
  class CoinSymbol extends BaseSymbol {
    constructor(v) { super("coin", v); }
  }

  class CollectorSymbol extends BaseSymbol {
    constructor() { super("collector", 0); }

    async onResolve() {
      const empty = emptyCells();
      if (empty.length > 0) {
        const targets = pickNRandom(empty, Math.min(3, empty.length));
        for (const cell of targets) {
          const coin = new CoinSymbol(rnd.int(1, 5));
          coin.attach(cell);
          await coin.onSpawn();
          await sleep(100);
        }
      }
    }
  }

  class PayerSymbol extends BaseSymbol {
    constructor() { super("payer", 1); }

    async onResolve() {
      const empty = emptyCells();
      if (empty.length > 0) {
        const targets = pickNRandom(empty, Math.min(this.value, empty.length));
        for (const cell of targets) {
          const coin = new CoinSymbol(rnd.int(2, 8));
          coin.attach(cell);
          await coin.onSpawn();
          await sleep(150);
        }
      }
    }
  }

  class SniperSymbol extends BaseSymbol {
    constructor() { super("sniper", 0); }

    async onResolve() {
      const empty = emptyCells();
      if (empty.length > 0) {
        const targets = pickNRandom(empty, Math.min(2, empty.length));
        for (const cell of targets) {
          const coin = new CoinSymbol(rnd.int(3, 10));
          coin.attach(cell);
          await coin.onSpawn();
          await sleep(100);
        }
      }
    }
  }

  // Fonctions de jeu
  const recomputeActiveBounds = () => {
    activeTop = Math.max(0, Math.floor((MAX_ROWS - ROWS) / 2));
    activeBottom = activeTop + ROWS - 1;
  };

  const cellAt = (col, rRel) => {
    const absRow = activeTop + rRel;
    return cells.find(c => c.col === col && c.row === absRow);
  };

  const activeCells = () => {
    const active = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = cellAt(c, r);
        if (cell && !cell.isEmpty()) active.push(cell);
      }
    }
    return active;
  };

  const emptyCells = () => {
    const empty = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = cellAt(c, r);
        if (cell && cell.isEmpty()) empty.push(cell);
      }
    }
    return empty;
  };

  const sumValues = () => {
    return activeCells().map(c => c.symbol.value || 0).reduce((sum, v) => sum + v, 0);
  };

  const updateHUD = () => {
    setHudData({
      respins: respins.toString(),
      rows: ROWS.toString(),
      total: `${sumValues()}×`,
      bet: BASE_BET.toFixed(2),
      reset: respinBase.toString(),
      cap: `${MAX_WIN_CAP}×`
    });
  };

  const createSymbol = (type) => {
    switch (type) {
      case 'coin': return new CoinSymbol(rnd.int(1, 5));
      case 'collector': return new CollectorSymbol();
      case 'payer': return new PayerSymbol();
      case 'sniper': return new SniperSymbol();
      default: return new CoinSymbol(1);
    }
  };

  const resetBoard = () => {
    // Nettoyer tous les symboles
    for (const cell of cells) {
      if (cell.symbol) {
        cell.symbol.destroy({ children: true });
        cell.symbol = null;
      }
    }
    
    // Réinitialiser l'état
    respins = 0;
    playing = false;
    
    recomputeActiveBounds();
    updateHUD();
  };

  const startBonus = async () => {
    if (playing) return;
    
    playing = true;
    respins = respinBase;
    toast("Bonus lancé !");
    updateHUD();
  };

  const spinStep = async () => {
    if (!playing || respins <= 0) return;
    
    // Créer de nouveaux symboles
    const empty = emptyCells();
    if (empty.length === 0) {
      toast("Plus d'espace disponible !");
      return;
    }
    
    const newSymbols = [];
    const spawnCount = Math.min(3, empty.length);
    const targets = pickNRandom(empty, spawnCount);
    
    for (const cell of targets) {
      const type = weightedPick(WEIGHTS.base);
      const symbol = createSymbol(type);
      symbol.attach(cell);
      newSymbols.push(symbol);
      await symbol.onSpawn();
      await sleep(100);
    }
    
    // Résoudre les symboles
    for (const symbol of newSymbols) {
      await symbol.onResolve();
    }
    
    respins--;
    updateHUD();
    
    if (respins <= 0) {
      await endBonus();
    }
  };

  const endBonus = async () => {
    playing = false;
    const total = sumValues();
    
    setPanelData({
      title: "Fin du bonus",
      total: `${total}×`
    });
    setShowPanel(true);
    
    toast(`Bonus terminé ! Total : ${total}×`);
  };

  // Initialisation
  useEffect(() => {
    // Créer l'application PixiJS
    const app = new PIXI.Application({
      background: 0x0b0f14,
      width: 800,
      height: 600,
      antialias: true
    });
    
    appRef.current = app;
    
    // Ajouter le canvas au DOM
    if (canvasRef.current) {
      canvasRef.current.appendChild(app.view);
    }
    
    // Créer la grille
    const rebuildGrid = () => {
      cells = [];
      for (let r = 0; r < MAX_ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          cells.push(new Cell(c, r));
        }
      }
    };

    rebuildGrid();
    recomputeActiveBounds();
    updateHUD();

    // Nettoyage
    return () => {
      if (appRef.current) {
        appRef.current.destroy(true);
      }
    };
  }, []);

  return (
    <div className="money-cart-game">
      {/* HUD */}
      <div className="hud">
        <div className="pill">Spins restants : <b>{hudData.respins}</b></div>
        <div className="pill">Rangées actives : <b>{hudData.rows}</b></div>
        <div className="pill">Total : <b>{hudData.total}</b></div>
        <div className="pill">Mise : <b>{hudData.bet}</b></div>
        <div className="pill">Reset de base : <b>{hudData.reset}</b></div>
        <div className="pill">Cap : <b>{hudData.cap}</b></div>
      </div>

      {/* Canvas PixiJS */}
      <div ref={canvasRef} />

      {/* Contrôles */}
      <div className="controls">
        <button className="btn" onClick={startBonus}>Lancer le Bonus</button>
        <button className="btn" onClick={spinStep}>Tour suivant</button>
        <button className="btn" onClick={() => {
          toast("Turbo activé");
        }}>Turbo : OFF</button>
        <button className="btn" onClick={() => {
          playing = false;
          setShowPanel(false);
          resetBoard();
          toast("Réinitialisé");
        }}>Réinitialiser</button>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="toast show">{toastMessage}</div>
      )}

      {/* Panel de fin */}
      {showPanel && (
        <div className="panel" onClick={() => setShowPanel(false)}>
          <div className="card">
            <h2>{panelData.title}</h2>
            <p>Gains totaux : <b>{panelData.total}</b></p>
            <div className="small">Clic pour fermer</div>
          </div>
        </div>
      )}

      {/* Styles CSS */}
      <style jsx>{`
        .money-cart-game {
          position: relative;
          width: 100%;
          height: 100vh;
          background: #0b0f14;
          color: #e6f0ff;
          font-family: Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif;
        }

        .hud {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          top: 12px;
          display: flex;
          gap: 12px;
          align-items: center;
          background: rgba(16, 24, 32, 0.7);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 8px 12px;
          z-index: 10;
        }

        .pill {
          padding: 6px 10px;
          border-radius: 10px;
          background: #15202b;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .controls {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          bottom: 18px;
          display: flex;
          gap: 10px;
          z-index: 10;
        }

        .btn {
          padding: 10px 14px;
          border-radius: 12px;
          background: #1d2a36;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #e6f0ff;
          font-weight: 600;
          cursor: pointer;
          transition: 0.15s;
        }

        .btn:hover {
          transform: translateY(-1px);
          background: #223240;
        }

        .toast {
          position: absolute;
          right: 16px;
          bottom: 16px;
          font-weight: 700;
          background: #12202c;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 10px 14px;
          opacity: 0;
          transform: translateY(10px);
          transition: 0.25s;
          z-index: 20;
        }

        .toast.show {
          opacity: 1;
          transform: translateY(0);
        }

        .panel {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(2px);
          z-index: 30;
        }

        .card {
          background: #0e1620;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          padding: 22px;
          min-width: 320px;
          max-width: 92vw;
          text-align: center;
          pointer-events: auto;
        }

        .card h2 {
          margin: 0 0 8px;
          font-size: 22px;
        }

        .small {
          opacity: 0.8;
          font-size: 12px;
          margin-top: 6px;
        }
      `}</style>
    </div>
  );
};

export default MoneyCartGame;

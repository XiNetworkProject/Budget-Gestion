import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';

// Enregistrer le plugin GSAP PixiJS
gsap.registerPlugin(PixiPlugin);

const MoneyCartGame = () => {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const gameStateRef = useRef({
    respins: 0,
    playing: false,
    turbo: false,
    isSpinning: false,
    autoplay: false,
    lastSpawned: [],
    respinBase: 3,
    ROWS: 4,
    MAX_ROWS: 8,
    COLS: 6,
    fullRowsAwarded: 0,
    nextUnlockTop: true,
    activeTop: 0,
    activeBottom: 0
  });

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
  const BASE_BET = 1.00;
  const BIG_WIN_THRESHOLD = 100;
  const MAX_WIN_CAP = 15000;
  const cellSize = 110;

  // Pondérations des symboles
  const WEIGHTS = {
    base: { coin: 70, collector: 5, payer: 5, cp: 2, p_collector: 1, p_payer: 1, sniper: 3, necro: 2, unlock: 3, arms: 2, upg: 2, rplus: 0 },
    deep: { coin: 65, collector: 6, payer: 6, cp: 2, p_collector: 1, p_payer: 1, sniper: 4, necro: 3, unlock: 3, arms: 2, upg: 2, rplus: 0 }
  };

  // Variables globales du jeu
  let cells = [];
  let respinBase = 3;
  let ROWS = 4;
  const MAX_ROWS = 8;
  const COLS = 6;
  let fullRowsAwarded = 0;
  let nextUnlockTop = true;
  let activeTop = 0, activeBottom = 0;

  // Utilitaires
  const toast = useCallback((msg, ms = 1600) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), ms);
  }, []);

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

  // Helpers pour les tweens
  const killTweens = (obj) => {
    if (!obj) return;
    try { gsap.killTweensOf(obj); } catch { }
    try { if (obj.scale) gsap.killTweensOf(obj.scale); } catch { }
  };

  const safeDestroySymbol = (sym) => {
    if (!sym) return;
    killTweens(sym);
    try { sym.destroy({ children: true }); } catch { }
  };

  // Classe Cell
  class Cell {
    constructor(col, rowAbs) {
      this.col = col;
      this.row = rowAbs;
      this.symbol = null;
      this.container = new PIXI.Container();
      appRef.current.stage.addChild(this.container);
      
      // calques de la cellule : fond, hatch "verrouillé", halo sélection
      this.bg = new PIXI.Graphics();
      this.hatch = new PIXI.Graphics();
      this.halo = new PIXI.Graphics();
      this.halo.alpha = 0;
      this.container.addChild(this.bg, this.hatch, this.halo);
      this.resize();
    }

    resize() {
      const pad = 8, r = isRowActive(this.row);
      // fond
      this.bg.clear().beginFill(r ? 0x0f1822 : 0x0a0e13).drawRoundedRect(pad, pad, cellSize - 2 * pad, cellSize - 2 * pad, 12).endFill();
      this.bg.lineStyle(1, r ? 0x294055 : 0x1b2833, 0.85).drawRoundedRect(pad, pad, cellSize - 2 * pad, cellSize - 2 * pad, 12);
      // motif hatch si verrouillé
      this.hatch.clear();
      if (!r) {
        this.hatch.lineStyle(1, 0x365069, 0.25);
        for (let k = -cellSize; k < cellSize; k += 8) {
          this.hatch.moveTo(pad + k, pad);
          this.hatch.lineTo(pad + k + cellSize - 2 * pad, pad + cellSize - 2 * pad);
        }
      }
      // halo pour surbrillance
      this.halo.clear().beginFill(0x58c1ff, 0.07).drawRoundedRect(4, 4, cellSize - 8, cellSize - 8, 16).endFill();
      // redessine le symbole si présent (pour s'adapter à la taille)
      if (this.symbol) this.symbol.resize();
      // grise tout le contenu si verrouillé (y compris un symbole collé par erreur)
      this.container.alpha = r ? 1 : 0.55;
    }

    isRowActive() { return this.row >= activeTop && this.row <= activeBottom; }

    setHighlight(on) { gsap.to(this.halo, { alpha: on ? 1 : 0, duration: 0.15 }); }

    isEmpty() { return !this.symbol; }
  }

  // Classe BaseSymbol
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

    async onSpawn() { await popIn(this); }

    async onResolve() { }

    async onPersistent() { }

    resize() {
      // (re)dessine un pion simple cercle + label ; pas d'assets → lisible
      this.removeChildren();
      const color = colorFor(this.type, this.persistent);
      const r = Math.floor(cellSize * 0.28);
      const cx = Math.floor(cellSize / 2), cy = cx;
      const g = new PIXI.Graphics();
      g.x = cx;
      g.y = cy;
      g.beginFill(color).drawCircle(0, 0, r).endFill();
      g.lineStyle(6, 0x0b0f14, 0.85).drawCircle(0, 0, r - 8);
      const t = new PIXI.Text(labelFor(this), {
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
  }

  // Fonctions utilitaires
  const colorFor = (type, p) => {
    const colors = {
      coin: 0xffd700, cp: 0xffd700,
      collector: 0x00ff88, p_collector: 0x00ff88,
      payer: 0xff6b35, p_payer: 0xff6b35,
      sniper: 0xff4757, p_sniper: 0xff4757,
      necro: 0x8b5cf6, unlock: 0x58c1ff,
      arms: 0xffa726, upg: 0x26c6da, rplus: 0xff1744
    };
    return colors[type] || 0xcccccc;
  };

  const labelFor = (sym) => {
    const labels = {
      coin: sym.value || "C", cp: "CP",
      collector: "CL", p_collector: "PCL",
      payer: "P", p_payer: "PP",
      sniper: "S", p_sniper: "PS",
      necro: "N", unlock: "U",
      arms: "A", upg: "UP", rplus: "R+"
    };
    return labels[sym.type] || "?";
  };

  // Effets visuels
  const popIn = async (obj) => {
    obj.scale.set(0);
    await gsap.to(obj.scale, { x: 1, y: 1, duration: 0.3, ease: "back.out(1.7)" });
  };

  const bump = async (obj) => {
    const done = { current: false };
    const finish = () => { if (done.current) return; done.current = true; };
    gsap.to(obj.scale, { x: 1.2, y: 1.2, duration: 0.1, onComplete: () => {
      gsap.to(obj.scale, { x: 1, y: 1, duration: 0.1, onComplete: finish });
    }});
    await new Promise(resolve => { finish.current = resolve; });
  };

  // Classes de symboles spécifiques
  class CoinSymbol extends BaseSymbol {
    constructor(v) { super("coin", v, false); }
  }

  class CollectorSymbol extends BaseSymbol {
    constructor(p = false) { super(p ? "p_collector" : "collector", 0, p); }

    async collectAnimated() {
      const targets = pickNRandom(emptyCells(), 3);
      for (const cell of targets) {
        const coin = new CoinSymbol(rnd.int(1, 5));
        coin.attach(cell);
        await coin.onSpawn();
        await sleep(100);
      }
    }

    async onResolve() {
      await this.collectAnimated();
      safeDestroySymbol(this);
    }

    async onPersistent() {
      await this.collectAnimated();
    }

    suck(toCell, fromCell) {
      const from = cellCenter(fromCell);
      const to = cellCenter(toCell);
      gsap.to(from, { x: to.x, y: to.y, duration: 0.5, ease: "power2.in" });
    }

    cellCenter(cell) {
      return {
        x: cell.container.x + cellSize / 2,
        y: cell.container.y + cellSize / 2
      };
    }

    floatText(cell, text) {
      const t = new PIXI.Text(text, { fontSize: 24, fill: 0x00ff88, fontWeight: 800 });
      t.anchor.set(0.5);
      t.x = cell.container.x + cellSize / 2;
      t.y = cell.container.y + cellSize / 2;
      appRef.current.stage.addChild(t);
      gsap.to(t, { y: t.y - 50, alpha: 0, duration: 1, onComplete: () => t.destroy() });
    }
  }

  class PayerSymbol extends BaseSymbol {
    constructor(v = 1, p = false) { super(p ? "p_payer" : "payer", v, p); }

    async paySequential() {
      const targets = pickNRandom(emptyCells(), this.value);
      for (const cell of targets) {
        const coin = new CoinSymbol(rnd.int(2, 8));
        coin.attach(cell);
        await coin.onSpawn();
        await sleep(150);
      }
    }

    async onResolve() {
      await this.paySequential();
      safeDestroySymbol(this);
    }

    async onPersistent() {
      await this.paySequential();
    }

    beam(fromCell, toCell) {
      const from = cellCenter(fromCell);
      const to = cellCenter(toCell);
      const beam = new PIXI.Graphics();
      beam.lineStyle(3, 0xff6b35, 0.8);
      beam.moveTo(from.x, from.y);
      beam.lineTo(to.x, to.y);
      appRef.current.stage.addChild(beam);
      gsap.to(beam, { alpha: 0, duration: 0.3, onComplete: () => beam.destroy() });
    }

    cellCenter(cell) {
      return {
        x: cell.container.x + cellSize / 2,
        y: cell.container.y + cellSize / 2
      };
    }

    floatText(cell, text) {
      const t = new PIXI.Text(text, { fontSize: 24, fill: 0xff6b35, fontWeight: 800 });
      t.anchor.set(0.5);
      t.x = cell.container.x + cellSize / 2;
      t.y = cell.container.y + cellSize / 2;
      appRef.current.stage.addChild(t);
      gsap.to(t, { y: t.y - 50, alpha: 0, duration: 1, onComplete: () => t.destroy() });
    }
  }

  class SniperSymbol extends BaseSymbol {
    constructor(p = false) { super(p ? "p_sniper" : "sniper", 0, p); }

    async onResolve() {
      await this.shoot(2);
      safeDestroySymbol(this);
    }

    async onPersistent() {
      await this.shoot(1);
    }

    async shoot(times = 1) {
      for (let i = 0; i < times; i++) {
        const targets = pickNRandom(emptyCells(), 2);
        for (const cell of targets) {
          const coin = new CoinSymbol(rnd.int(3, 10));
          coin.attach(cell);
          await coin.onSpawn();
          await sleep(100);
        }
        await sleep(200);
      }
    }

    beam(fromCell, toCell) {
      const from = cellCenter(fromCell);
      const to = cellCenter(toCell);
      const beam = new PIXI.Graphics();
      beam.lineStyle(2, 0xff4757, 0.9);
      beam.moveTo(from.x, from.y);
      beam.lineTo(to.x, to.y);
      appRef.current.stage.addChild(beam);
      gsap.to(beam, { alpha: 0, duration: 0.2, onComplete: () => beam.destroy() });
    }

    cellCenter(cell) {
      return {
        x: cell.container.x + cellSize / 2,
        y: cell.container.y + cellSize / 2
      };
    }

    floatText(cell, text) {
      const t = new PIXI.Text(text, { fontSize: 24, fill: 0xff4757, fontWeight: 800 });
      t.anchor.set(0.5);
      t.x = cell.container.x + cellSize / 2;
      t.y = cell.container.y + cellSize / 2;
      appRef.current.stage.addChild(t);
      gsap.to(t, { y: t.y - 50, alpha: 0, duration: 1, onComplete: () => t.destroy() });
    }
  }

  // Fonctions de jeu
  const recomputeActiveBounds = () => {
    // On centre le bloc actif dans la grille visible, puis on ajustera en unlock top/bottom
    activeTop = Math.max(0, Math.floor((MAX_ROWS - ROWS) / 2));
    activeBottom = activeTop + ROWS - 1;
  };

  const isRowActive = (absRow) => { return absRow >= activeTop && absRow <= activeBottom; };

  const relToAbs = (rRel) => { return activeTop + rRel; };

  const cellAtAbs = (col, absRow) => { return cells.find(c => c.col === col && c.row === absRow); };

  const cellAt = (col, rRel) => { return cellAtAbs(col, relToAbs(rRel)); };

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

  const symbols = () => { return activeCells().map(c => c.symbol); };

  const sumValues = () => { return symbols().reduce((sum, s) => sum + (s.value || 0), 0); };

  const updateHUD = () => {
    const state = gameStateRef.current;
    setHudData({
      respins: state.respins.toString(),
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
      case 'p_collector': return new CollectorSymbol(true);
      case 'payer': return new PayerSymbol(rnd.int(1, 3));
      case 'p_payer': return new PayerSymbol(rnd.int(2, 4), true);
      case 'sniper': return new SniperSymbol();
      case 'p_sniper': return new SniperSymbol(true);
      default: return new CoinSymbol(1);
    }
  };

  const resetBoard = () => {
    // Nettoyer tous les symboles
    for (const cell of cells) {
      if (cell.symbol) {
        safeDestroySymbol(cell.symbol);
        cell.symbol = null;
      }
    }
    
    // Réinitialiser l'état
    ROWS = 4;
    respinBase = 3;
    fullRowsAwarded = 0;
    nextUnlockTop = true;
    gameStateRef.current.playing = false;
    gameStateRef.current.respins = 0;
    
    recomputeActiveBounds();
    updateHUD();
  };

  const startBonus = async () => {
    if (gameStateRef.current.playing) return;
    
    gameStateRef.current.playing = true;
    gameStateRef.current.respins = respinBase;
    toast("Bonus lancé !");
    updateHUD();
  };

  const spinStep = async () => {
    if (!gameStateRef.current.playing || gameStateRef.current.isSpinning) return;
    
    gameStateRef.current.isSpinning = true;
    
    // Créer de nouveaux symboles
    const empty = emptyCells();
    if (empty.length === 0) {
      toast("Plus d'espace disponible !");
      gameStateRef.current.isSpinning = false;
      return;
    }
    
    const newSymbols = [];
    for (let i = 0; i < Math.min(3, empty.length); i++) {
      const cell = empty[i];
      const type = weightedPick(WEIGHTS.base);
      const symbol = createSymbol(type);
      symbol.attach(cell);
      newSymbols.push(symbol);
      await symbol.onSpawn();
      await sleep(100);
    }
    
    // Résoudre les symboles
    for (const symbol of newSymbols) {
      if (symbol.persistent) {
        await symbol.onPersistent();
      } else {
        await symbol.onResolve();
      }
    }
    
    gameStateRef.current.respins--;
    gameStateRef.current.isSpinning = false;
    
    if (gameStateRef.current.respins <= 0) {
      await endBonus();
    } else {
      updateHUD();
    }
  };

  const endBonus = async () => {
    gameStateRef.current.playing = false;
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
          const state = gameStateRef.current;
          state.turbo = !state.turbo;
          toast(`Turbo ${state.turbo ? "activé" : "désactivé"}`);
        }}>Turbo : OFF</button>
        <button className="btn" onClick={() => {
          gameStateRef.current.playing = false;
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

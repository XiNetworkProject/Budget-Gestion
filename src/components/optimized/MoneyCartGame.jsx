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

  // Classes de base
  class Cell {
    constructor(col, rowAbs, container) {
      this.col = col;
      this.row = rowAbs;
      this.symbol = null;
      this.container = new PIXI.Container();
      container.addChild(this.container);
      
      this.bg = new PIXI.Graphics();
      this.hatch = new PIXI.Graphics();
      this.halo = new PIXI.Graphics();
      this.halo.alpha = 0;
      
      this.container.addChild(this.bg, this.hatch, this.halo);
      this.resize();
    }

    resize() {
      const pad = 8;
      const r = this.isRowActive();
      
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
      
      if (this.symbol) this.symbol.resize();
      this.container.alpha = r ? 1 : 0.55;
    }

    isRowActive() {
      const state = gameStateRef.current;
      return this.row >= state.activeTop && this.row <= state.activeBottom;
    }

    setHighlight(on) {
      gsap.to(this.halo, { alpha: on ? 1 : 0, duration: 0.15 });
    }

    isEmpty() { return !this.symbol; }
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

    resize() {
      this.removeChildren();
      const color = this.colorFor(this.type, this.persistent);
      const r = Math.floor(cellSize * 0.28);
      const cx = Math.floor(cellSize / 2), cy = cx;
      
      const g = new PIXI.Graphics();
      g.x = cx; g.y = cy;
      g.beginFill(color).drawCircle(0, 0, r).endFill();
      g.lineStyle(6, 0x0b0f14, 0.85).drawCircle(0, 0, r - 8);
      
      const t = new PIXI.Text(this.labelFor(), {
        fontFamily: "Inter,Arial",
        fontSize: Math.floor(r * 0.9),
        fontWeight: 800,
        fill: 0xffffff,
        align: "center"
      });
      t.anchor.set(0.5); t.y = 2;
      this.addChild(g, t);
    }

    colorFor(type, p) {
      if (p) {
        if (type === "p_collector") return 0xffb347;
        if (type === "p_payer") return 0x7ee4ff;
        if (type === "p_sniper") return 0xff667a;
        if (type === "p_cp") return 0xff66ff;
        if (type === "p_arms") return 0xb3a1ff;
      }
      
      switch (type) {
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

    async popIn() {
      if (!this.scale) return Promise.resolve();
      const dur = 0.28;
      this.scale.set(0.3);
      
      return new Promise((resolve) => {
        const tween = gsap.to(this.scale, {
          x: 1, y: 1, ease: "back.out(1.7)", duration: dur, onComplete: resolve
        });
        setTimeout(() => resolve(), Math.ceil(dur * 1000) + 80);
      });
    }

    bump() {
      if (!this || !this.scale) return Promise.resolve();
      const dur = 0.10;
      const tween = gsap.fromTo(this.scale, { x: 1, y: 1 }, { x: 1.1, y: 1.1, yoyo: true, repeat: 1, duration: dur });
      
      return new Promise((resolve) => {
        let done = false;
        const finish = () => { if (done) return; done = true; resolve(); };
        try { tween.eventCallback("onComplete", finish); } catch { }
        setTimeout(finish, Math.ceil(dur * 2 * 1000) + 60);
      });
    }
  }

  // Classes de symboles spécifiques
  class CoinSymbol extends BaseSymbol {
    constructor(v) { super("coin", v, false); }
  }

  class CollectorSymbol extends BaseSymbol {
    constructor(p = false) { super(p ? "p_collector" : "collector", 0, p); }
    
    async collectAnimated() {
      const others = symbols().filter(s => s !== this);
      const total = others.reduce((a, s) => a + (s.value || 0), 0);
      
      for (const s of others) {
        this.suck(this.cell, s.cell);
        await sleep(30);
      }
      
      this.value = Math.min(MAX_WIN_CAP, this.value + total);
      this.floatText(this.cell, `+${total}`);
      this.resize();
      updateHUD();
    }

    async onResolve() {
      await this.collectAnimated();
      await this.bump();
    }

    async onPersistent() {
      await this.collectAnimated();
      await this.bump();
    }

    suck(toCell, fromCell) {
      const a = this.cellCenter(fromCell), b = this.cellCenter(toCell);
      const p = new PIXI.Graphics();
      p.beginFill(0xffd166).drawCircle(0, 0, 2.5).endFill();
      p.x = a.x; p.y = a.y;
      appRef.current.stage.addChild(p);
      
      gsap.to(p, { x: b.x, y: b.y, alpha: 0.2, duration: 0.22, ease: "sine.in", onComplete: () => p.destroy() });
    }

    cellCenter(cell) {
      return {
        x: cell.col * cellSize + cellSize / 2,
        y: cell.row * cellSize + cellSize / 2
      };
    }

    floatText(cell, text) {
      const t = new PIXI.Text(text, {
        fontSize: Math.floor(cellSize * 0.28),
        fontWeight: 800,
        fill: 0xffffff,
        dropShadow: true,
        dropShadowBlur: 2,
        dropShadowDistance: 0
      });
      t.anchor.set(0.5, 1);
      t.x = cell.col * cellSize + cellSize / 2;
      t.y = cell.row * cellSize + cellSize - 10;
      appRef.current.stage.addChild(t);
      
      gsap.to(t, { y: t.y - 24, alpha: 0, duration: 0.7, ease: "sine.out", onComplete: () => t.destroy() });
    }
  }

  class PayerSymbol extends BaseSymbol {
    constructor(v = 1, p = false) { super(p ? "p_payer" : "payer", v, p); }
    
    async paySequential() {
      const targets = symbols().filter(s => s !== this);
      for (const t of targets) {
        this.beam(this.cell, t.cell);
        await sleep(60);
        t.value = Math.min(MAX_WIN_CAP, t.value + this.value);
        t.resize();
        this.floatText(t.cell, `+${this.value}`);
      }
      updateHUD();
    }

    async onResolve() {
      await this.paySequential();
      await this.bump();
    }

    async onPersistent() {
      await this.paySequential();
      await this.bump();
    }

    beam(fromCell, toCell) {
      const g = new PIXI.Graphics();
      g.lineStyle({ width: 3, color: 0x58c1ff, alpha: 0.9 });
      const a = this.cellCenter(fromCell), b = this.cellCenter(toCell);
      g.moveTo(a.x, a.y); g.lineTo(b.x, b.y);
      appRef.current.stage.addChild(g);
      
      const dot = new PIXI.Graphics();
      dot.beginFill(0xffffff).drawCircle(0, 0, 3).endFill();
      dot.x = a.x; dot.y = a.y;
      appRef.current.stage.addChild(dot);
      
      gsap.to(dot, { x: b.x, y: b.y, duration: 0.18, ease: "sine.out", onComplete: () => dot.destroy() });
      gsap.to(g, { alpha: 0, duration: 0.25, onComplete: () => g.destroy() });
    }

    cellCenter(cell) {
      return {
        x: cell.col * cellSize + cellSize / 2,
        y: cell.row * cellSize + cellSize / 2
      };
    }

    floatText(cell, text) {
      const t = new PIXI.Text(text, {
        fontSize: Math.floor(cellSize * 0.28),
        fontWeight: 800,
        fill: 0xffffff,
        dropShadow: true,
        dropShadowBlur: 2,
        dropShadowDistance: 0
      });
      t.anchor.set(0.5, 1);
      t.x = cell.col * cellSize + cellSize / 2;
      t.y = cell.row * cellSize + cellSize - 10;
      appRef.current.stage.addChild(t);
      
      gsap.to(t, { y: t.y - 24, alpha: 0, duration: 0.7, ease: "sine.out", onComplete: () => t.destroy() });
    }
  }

  // Autres classes de symboles (simplifiées pour l'exemple)
  class SniperSymbol extends BaseSymbol {
    constructor(p = false) { super(p ? "p_sniper" : "sniper", 0, p); }
    
    async onResolve() {
      await this.shoot(1);
      await this.bump();
    }

    async onPersistent() {
      await this.shoot(1);
      await this.bump();
    }

    async shoot(times = 1) {
      let pool = symbols().filter(s => s !== this && s.value > 0);
      for (let i = 0; i < times && pool.length; i++) {
        const t = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
        this.beam(this.cell, t.cell);
        t.value = Math.min(MAX_WIN_CAP, t.value * 2);
        t.resize();
        this.floatText(t.cell, "×2");
        await sleep(120);
      }
      updateHUD();
    }

    beam(fromCell, toCell) {
      const g = new PIXI.Graphics();
      g.lineStyle({ width: 3, color: 0x58c1ff, alpha: 0.9 });
      const a = this.cellCenter(fromCell), b = this.cellCenter(toCell);
      g.moveTo(a.x, a.y); g.lineTo(b.x, b.y);
      appRef.current.stage.addChild(g);
      
      gsap.to(g, { alpha: 0, duration: 0.25, onComplete: () => g.destroy() });
    }

    cellCenter(cell) {
      return {
        x: cell.col * cellSize + cellSize / 2,
        y: cell.row * cellSize + cellSize / 2
      };
    }

    floatText(cell, text) {
      const t = new PIXI.Text(text, {
        fontSize: Math.floor(cellSize * 0.28),
        fontWeight: 800,
        fill: 0xffffff,
        dropShadow: true,
        dropShadowBlur: 2,
        dropShadowDistance: 0
      });
      t.anchor.set(0.5, 1);
      t.x = cell.col * cellSize + cellSize / 2;
      t.y = cell.row * cellSize + cellSize - 10;
      appRef.current.stage.addChild(t);
      
      gsap.to(t, { y: t.y - 24, alpha: 0, duration: 0.7, ease: "sine.out", onComplete: () => t.destroy() });
    }
  }

  // Variables globales du jeu
  let cells = [];
  let root, gridLayer, fxLayer;

  // Fonctions utilitaires
  const recomputeActiveBounds = () => {
    const state = gameStateRef.current;
    state.activeTop = Math.max(0, Math.floor((state.MAX_ROWS - state.ROWS) / 2));
    state.activeBottom = state.activeTop + state.ROWS - 1;
  };

  const isRowActive = (absRow) => {
    const state = gameStateRef.current;
    return absRow >= state.activeTop && absRow <= state.activeBottom;
  };

  const relToAbs = (rRel) => {
    const state = gameStateRef.current;
    return state.activeTop + rRel;
  };

  const cellAtAbs = (col, absRow) => {
    return cells.find(k => k.col === col && k.row === absRow);
  };

  const cellAt = (col, rRel) => {
    return cellAtAbs(col, relToAbs(rRel));
  };

  const activeCells = () => {
    const state = gameStateRef.current;
    const arr = [];
    for (let c = 0; c < state.COLS; c++) {
      for (let r = state.activeTop; r <= state.activeBottom; r++) {
        const cell = cellAtAbs(c, r);
        if (cell) arr.push(cell);
      }
    }
    return arr;
  };

  const emptyCells = () => {
    return activeCells().filter(c => c.isEmpty());
  };

  const symbols = () => {
    return activeCells().filter(c => c.symbol).map(c => c.symbol);
  };

  const sumValues = () => {
    return Math.min(MAX_WIN_CAP, symbols().reduce((a, s) => a + (s.value || 0), 0));
  };

  const updateHUD = () => {
    const state = gameStateRef.current;
    setHudData({
      respins: String(state.respins),
      rows: String(state.ROWS),
      total: `${sumValues()}×`,
      bet: BASE_BET.toFixed(2),
      reset: String(state.respinBase),
      cap: `${MAX_WIN_CAP}×`
    });
  };

  // Fabrique de symboles
  const createSymbol = (type) => {
    switch (type) {
      case "coin": return new CoinSymbol(rnd.pick([1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 5]));
      case "collector": return new CollectorSymbol(false);
      case "payer": return new PayerSymbol(rnd.pick([1, 1, 1, 1, 2]), false);
      case "sniper": return new SniperSymbol(false);
      default: return new CoinSymbol(1);
    }
  };

  // Fonctions de jeu
  const resetBoard = () => {
    const state = gameStateRef.current;
    for (const c of cells) {
      if (c.symbol) {
        safeDestroySymbol(c.symbol);
        c.symbol = null;
      }
    }
    state.ROWS = 4;
    state.fullRowsAwarded = 0;
    state.nextUnlockTop = true;
    state.respinBase = 3;
    recomputeActiveBounds();
    for (const c of cells) c.resize();
    state.respins = 0;
    updateHUD();
  };

  const startBonus = async () => {
    const state = gameStateRef.current;
    if (state.playing) return;
    
    state.playing = true;
    resetBoard();
    
    // Spawn initial
    const starters = rnd.int(3, 4);
    for (let i = 0; i < starters; i++) {
      const empt = emptyCells();
      if (!empt.length) break;
      const cell = rnd.pick(empt);
      const coin = new CoinSymbol(rnd.pick([1, 2, 3]));
      coin.attach(cell);
      coin.resize();
      await coin.onSpawn();
    }
    
    state.respins = state.respinBase;
    updateHUD();
    toast("Bonus lancé !");
  };

  const spinStep = async () => {
    const state = gameStateRef.current;
    if (!state.playing || state.respins <= 0 || state.isSpinning) return;
    
    state.isSpinning = true;
    try {
      // Spawn
      const empties = emptyCells();
      let spawned = 0;
      state.lastSpawned = [];
      
      if (empties.length) {
        const spawnCount = rnd.int(1, 3);
        const chosen = pickNRandom(empties, Math.min(empties.length, spawnCount));
        
        for (const cell of chosen) {
          const key = state.ROWS <= 5 ? "base" : "deep";
          const type = weightedPick(WEIGHTS[key]);
          const sym = createSymbol(type);
          sym.attach(cell);
          sym.resize();
          await sym.onSpawn();
          spawned++;
          state.lastSpawned.push(sym);
        }
      }
      
      state.respins = (spawned > 0) ? state.respinBase : (state.respins - 1);
      updateHUD();
      
      // Résolution des symboles
      const order = ["payer", "sniper", "collector"];
      for (const t of order) {
        const group = state.lastSpawned.filter(s => s.type === t);
        for (const s of group) {
          s.cell.setHighlight(true);
          await s.onResolve();
          s.cell.setHighlight(false);
          await sleep(140);
        }
      }
      
      // Fin du tour
      if (state.respins <= 0) {
        await endBonus();
      }
      
      updateHUD();
    } finally {
      state.isSpinning = false;
    }
  };

  const endBonus = async () => {
    const totalMult = sumValues();
    const total = totalMult * BASE_BET;
    setPanelData({
      title: "Fin du bonus",
      total: `${totalMult}× (=${total.toFixed(2)})`
    });
    setShowPanel(true);
    gameStateRef.current.playing = false;
  };

  // Initialisation du jeu
  useEffect(() => {
    if (!canvasRef.current) return;

    // Créer l'application PixiJS
    const app = new PIXI.Application({
      background: 0x0b0f14,
      width: 800,
      height: 600,
      antialias: true,
      view: canvasRef.current
    });
    appRef.current = app;

    // Créer les conteneurs
    root = new PIXI.Container();
    app.stage.addChild(root);
    
    gridLayer = new PIXI.Container();
    fxLayer = new PIXI.Container();
    root.addChild(gridLayer, fxLayer);

    // Créer la grille
    const rebuildGrid = () => {
      gridLayer.removeChildren();
      cells.length = 0;
      
      for (let c = 0; c < 6; c++) {
        for (let r = 0; r < 8; r++) {
          const cell = new Cell(c, r, gridLayer);
          cells.push(cell);
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
      <canvas ref={canvasRef} style={{ display: 'block', margin: '0 auto' }} />

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

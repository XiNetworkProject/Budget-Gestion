import { useEffect, useRef, useState, useCallback } from 'react';
import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

const MoneyCartGame = () => {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const gameStateRef = useRef({
    cells: [],
    respins: 0,
    respinBase: 3,
    playing: false,
    turbo: false,
    autoplay: false,
    isSpinning: false,
    ROWS: 4,
    activeTop: 0,
    activeBottom: 3,
    fullRowsAwarded: 0,
    nextUnlockTop: true,
    lastSpawned: []
  });

  // États UI React
  const [gameUI, setGameUI] = useState({
    respins: 0,
    rows: 4,
    total: 0,
    bet: 1.00,
    reset: 3,
    cap: 15000,
    turbo: false
  });
  const [toast, setToast] = useState({ show: false, message: '' });
  const [panel, setPanel] = useState({ show: false, title: '', total: '' });

  // Constantes du jeu
  const COLS = 6;
  const MAX_ROWS = 8;
  const BASE_BET = 1.00;
  const BIG_WIN_THRESHOLD = 100;
  const MAX_WIN_CAP = 15000;

  const WEIGHTS = {
    base: { coin: 70, collector: 5, payer: 5, cp: 2, p_collector: 1, p_payer: 1, sniper: 3, necro: 2, unlock: 3, arms: 2, upg: 2, rplus: 0 },
    deep: { coin: 65, collector: 6, payer: 6, cp: 2, p_collector: 1, p_payer: 1, sniper: 4, necro: 3, unlock: 3, arms: 2, upg: 2, rplus: 0 }
  };

  // Utilitaires RNG
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

  // Toast function
  const showToast = useCallback((message, duration = 1600) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), duration);
  }, []);

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

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // Classes du jeu (Cell et Symboles)
  class Cell {
    constructor(col, rowAbs, gridLayer, cellSize, origin, isRowActive) {
      this.col = col;
      this.row = rowAbs;
      this.symbol = null;
      this.container = new PIXI.Container();
      gridLayer.addChild(this.container);
      
      this.bg = new PIXI.Graphics();
      this.hatch = new PIXI.Graphics();
      this.halo = new PIXI.Graphics();
      this.halo.alpha = 0;
      this.container.addChild(this.bg, this.hatch, this.halo);
      
      this.cellSize = cellSize;
      this.origin = origin;
      this.isRowActive = isRowActive;
      this.resize();
    }

    resize() {
      const pad = 8;
      const r = this.isRowActive(this.row);
      const cellSize = this.cellSize;
      
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
      
      // Grise le contenu si verrouillé
      this.container.alpha = r ? 1 : 0.55;
    }

    setHighlight(on) {
      gsap.to(this.halo, { alpha: on ? 1 : 0, duration: 0.15 });
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

    resize() {
      this.removeChildren();
      const color = this.colorFor(this.type, this.persistent);
      const cellSize = this.cell?.cellSize || 110;
      const r = Math.floor(cellSize * 0.28);
      const cx = Math.floor(cellSize / 2);
      const cy = cx;
      
      const g = new PIXI.Graphics();
      g.x = cx;
      g.y = cy;
      g.beginFill(color).drawCircle(0, 0, r).endFill();
      g.lineStyle(6, 0x0b0f14, 0.85).drawCircle(0, 0, r - 8);
      
      const t = new PIXI.Text(this.labelFor(this), {
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

    labelFor(sym) {
      switch (sym.type) {
        case "coin": return `x${sym.value}`;
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
      if (!this || !this.scale) return Promise.resolve();
      const dur = 0.28;
      this.scale.set(0.3);
      return new Promise((resolve) => {
        const tween = gsap.to(this.scale, {
          x: 1, y: 1,
          ease: "back.out(1.7)",
          duration: dur,
          onComplete: resolve
        });
        setTimeout(() => resolve(), Math.ceil(dur * 1000) + 80);
      });
    }

    async bump() {
      if (!this || !this.scale) return Promise.resolve();
      const dur = 0.10;
      const tween = gsap.fromTo(this.scale, 
        { x: 1, y: 1 }, 
        { x: 1.1, y: 1.1, yoyo: true, repeat: 1, duration: dur }
      );
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
    constructor(v) {
      super("coin", v, false);
    }
  }

  class CollectorSymbol extends BaseSymbol {
    constructor(p = false) {
      super(p ? "p_collector" : "collector", 0, p);
    }

    async collectAnimated() {
      // Logique de collection simplifiée pour l'exemple
      const others = gameStateRef.current.cells
        .filter(c => c.symbol && c.symbol !== this)
        .map(c => c.symbol);
      const total = others.reduce((a, s) => a + (s.value || 0), 0);
      this.value = Math.min(MAX_WIN_CAP, this.value + total);
      this.resize();
      updateGameUI();
    }

    async onResolve() {
      await this.collectAnimated();
      await this.bump();
    }

    async onPersistent() {
      await this.collectAnimated();
      await this.bump();
    }
  }

  // Factory pour créer les symboles
  const createSymbol = (type) => {
    switch (type) {
      case "coin":
        return new CoinSymbol(rnd.pick([1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 5]));
      case "collector":
        return new CollectorSymbol(false);
      case "p_collector":
        return new CollectorSymbol(true);
      default:
        return new CoinSymbol(1);
    }
  };

  // Fonction pour mettre à jour l'UI
  const updateGameUI = useCallback(() => {
    const state = gameStateRef.current;
    const symbols = state.cells
      .filter(c => c.symbol)
      .map(c => c.symbol);
    const total = Math.min(MAX_WIN_CAP, symbols.reduce((a, s) => a + (s.value || 0), 0));

    setGameUI(prev => ({
      ...prev,
      respins: state.respins,
      rows: state.ROWS,
      total: total,
      reset: state.respinBase
    }));
  }, []);

  // Fonctions du jeu
  const isRowActive = useCallback((absRow) => {
    const state = gameStateRef.current;
    return absRow >= state.activeTop && absRow <= state.activeBottom;
  }, []);

  const recomputeActiveBounds = useCallback(() => {
    const state = gameStateRef.current;
    state.activeTop = Math.max(0, Math.floor((MAX_ROWS - state.ROWS) / 2));
    state.activeBottom = state.activeTop + state.ROWS - 1;
  }, []);

  const emptyCells = useCallback(() => {
    const state = gameStateRef.current;
    return state.cells.filter(c => 
      isRowActive(c.row) && c.isEmpty()
    );
  }, [isRowActive]);

  const startBonus = useCallback(async () => {
    const state = gameStateRef.current;
    if (state.playing) return;
    
    state.playing = true;
    state.respins = state.respinBase;
    state.ROWS = 4;
    state.fullRowsAwarded = 0;
    state.nextUnlockTop = true;
    
    // Reset board
    for (const c of state.cells) {
      if (c.symbol) {
        safeDestroySymbol(c.symbol);
        c.symbol = null;
      }
    }
    
    recomputeActiveBounds();
    for (const c of state.cells) c.resize();
    
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
    
    updateGameUI();
    showToast("Bonus lancé !");
    state.autoplay = true;
    autoPlayLoop();
  }, [emptyCells, recomputeActiveBounds, showToast, updateGameUI]);

  const autoPlayLoop = useCallback(async () => {
    const state = gameStateRef.current;
    while (state.autoplay && state.playing && state.respins > 0) {
      await spinStep();
      if (!state.playing) break;
      await sleep(state.turbo ? 120 : 320);
    }
  }, []);

  const spinStep = useCallback(async () => {
    const state = gameStateRef.current;
    if (!state.playing || state.respins <= 0 || state.isSpinning) return;
    
    state.isSpinning = true;
    try {
      // Spawn
      const empties = emptyCells();
      let spawned = 0;
      state.lastSpawned = [];
      
      if (empties.length) {
        const spawnCountTable = state.turbo ? { 0: 3, 1: 4, 2: 1 } : { 0: 5, 1: 3, 2: 1 };
        const spawnCount = Number(weightedPick(spawnCountTable));
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
      
      state.respins = spawned > 0 ? state.respinBase : (state.respins - 1);
      updateGameUI();
      
      // Resolve symbols
      for (const s of state.lastSpawned) {
        if (s.onResolve) {
          await s.onResolve();
          await sleep(state.turbo ? 30 : 140);
        }
      }
      
      // Check end condition
      if (state.respins <= 0) {
        await endBonus();
        state.autoplay = false;
      }
    } finally {
      state.isSpinning = false;
    }
  }, [emptyCells, updateGameUI]);

  const endBonus = useCallback(async () => {
    const state = gameStateRef.current;
    const symbols = state.cells
      .filter(c => c.symbol)
      .map(c => c.symbol);
    const totalMult = symbols.reduce((a, s) => a + (s.value || 0), 0);
    const total = totalMult * BASE_BET;
    
    setPanel({
      show: true,
      title: "Fin du bonus",
      total: `${totalMult}× (=${total.toFixed(2)})`
    });
    
    state.playing = false;
  }, []);

  const resetBoard = useCallback(() => {
    const state = gameStateRef.current;
    state.playing = false;
    state.autoplay = false;
    
    for (const c of state.cells) {
      if (c.symbol) {
        safeDestroySymbol(c.symbol);
        c.symbol = null;
      }
    }
    
    state.ROWS = 4;
    state.fullRowsAwarded = 0;
    state.nextUnlockTop = true;
    state.respinBase = 3;
    state.respins = 0;
    
    recomputeActiveBounds();
    for (const c of state.cells) c.resize();
    updateGameUI();
    showToast("Réinitialisé");
  }, [recomputeActiveBounds, updateGameUI, showToast]);

  const toggleTurbo = useCallback(() => {
    const state = gameStateRef.current;
    state.turbo = !state.turbo;
    setGameUI(prev => ({ ...prev, turbo: state.turbo }));
    showToast(`Turbo ${state.turbo ? "activé" : "désactivé"}`);
  }, [showToast]);

  // Initialisation PixiJS
  useEffect(() => {
    if (!containerRef.current || appRef.current) return;

    const app = new PIXI.Application({
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      backgroundColor: 0x0b0f14,
      antialias: true
    });

    containerRef.current.appendChild(app.view);
    appRef.current = app;

    const root = new PIXI.Container();
    app.stage.addChild(root);
    
    const gridLayer = new PIXI.Container();
    const fxLayer = new PIXI.Container();
    root.addChild(gridLayer, fxLayer);

    // Variables de layout
    let cellSize = 110;
    let origin = { x: 0, y: 0 };

    const layout = () => {
      const w = app.renderer.width;
      const h = app.renderer.height;
      const hMargin = 240;
      const maxGridW = Math.min(920, w - 40);
      const maxGridH = Math.max(160, h - hMargin);
      const sizeByW = Math.floor(maxGridW / COLS);
      const sizeByH = Math.floor(maxGridH / MAX_ROWS);
      cellSize = Math.max(36, Math.min(sizeByW, sizeByH));
      
      const gridW = COLS * cellSize;
      const gridH = MAX_ROWS * cellSize;
      origin.x = Math.round((w - gridW) / 2);
      origin.y = Math.round((h - gridH) / 2);
      
      for (const c of gameStateRef.current.cells) {
        c.container.x = origin.x + c.col * cellSize;
        c.container.y = origin.y + c.row * cellSize;
        c.cellSize = cellSize;
        c.origin = origin;
        c.resize();
      }
    };

    // Créer la grille
    const cells = [];
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < MAX_ROWS; r++) {
        const cell = new Cell(c, r, gridLayer, cellSize, origin, isRowActive);
        cells.push(cell);
      }
    }
    
    gameStateRef.current.cells = cells;
    recomputeActiveBounds();
    layout();
    updateGameUI();

    const handleResize = () => {
      app.renderer.resize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
      layout();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, [isRowActive, recomputeActiveBounds, updateGameUI]);

  // Gestion des touches
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        gameStateRef.current.autoplay = false;
        spinStep();
      }
      if (e.key === "Escape") {
        setPanel(prev => ({ ...prev, show: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [spinStep]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '600px', backgroundColor: '#0b0f14' }}>
      {/* Canvas Container */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      
      {/* HUD */}
      <div style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        top: '12px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        background: 'rgba(16,24,32,0.7)',
        backdropFilter: 'blur(6px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px',
        padding: '8px 12px',
        color: '#e6f0ff',
        fontSize: '13px'
      }}>
        <div style={{ padding: '6px 10px', borderRadius: '10px', background: '#15202b', border: '1px solid rgba(255,255,255,0.06)' }}>
          Spins restants : <b>{gameUI.respins}</b>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: '10px', background: '#15202b', border: '1px solid rgba(255,255,255,0.06)' }}>
          Rangées actives : <b>{gameUI.rows}</b>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: '10px', background: '#15202b', border: '1px solid rgba(255,255,255,0.06)' }}>
          Total : <b>{gameUI.total}×</b>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: '10px', background: '#15202b', border: '1px solid rgba(255,255,255,0.06)' }}>
          Mise : <b>{gameUI.bet.toFixed(2)}</b>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: '10px', background: '#15202b', border: '1px solid rgba(255,255,255,0.06)' }}>
          Reset de base : <b>{gameUI.reset}</b>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: '10px', background: '#15202b', border: '1px solid rgba(255,255,255,0.06)' }}>
          Cap : <b>{gameUI.cap}×</b>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: '18px',
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={startBonus}
          disabled={gameStateRef.current.playing}
          style={{
            padding: '10px 14px',
            borderRadius: '12px',
            background: '#1d2a36',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#e6f0ff',
            fontWeight: '600',
            cursor: 'pointer',
            transition: '0.15s'
          }}
        >
          Lancer le Bonus
        </button>
        <button
          onClick={() => { gameStateRef.current.autoplay = false; spinStep(); }}
          style={{
            padding: '10px 14px',
            borderRadius: '12px',
            background: '#1d2a36',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#e6f0ff',
            fontWeight: '600',
            cursor: 'pointer',
            transition: '0.15s'
          }}
        >
          Tour suivant (Espace)
        </button>
        <button
          onClick={toggleTurbo}
          style={{
            padding: '10px 14px',
            borderRadius: '12px',
            background: '#1d2a36',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#e6f0ff',
            fontWeight: '600',
            cursor: 'pointer',
            transition: '0.15s'
          }}
        >
          Turbo : {gameUI.turbo ? 'ON' : 'OFF'}
        </button>
        <button
          onClick={resetBoard}
          style={{
            padding: '10px 14px',
            borderRadius: '12px',
            background: '#1d2a36',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#e6f0ff',
            fontWeight: '600',
            cursor: 'pointer',
            transition: '0.15s'
          }}
        >
          Réinitialiser
        </button>
      </div>

      {/* Toast */}
      {toast.show && (
        <div style={{
          position: 'absolute',
          right: '16px',
          bottom: '16px',
          fontWeight: '700',
          background: '#12202c',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          padding: '10px 14px',
          color: '#e6f0ff',
          transition: '0.25s'
        }}>
          {toast.message}
        </div>
      )}

      {/* Panel */}
      {panel.show && (
        <div style={{
          position: 'absolute',
          inset: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(2px)'
        }}>
          <div style={{
            background: '#0e1620',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '16px',
            padding: '22px',
            minWidth: '320px',
            maxWidth: '92vw',
            textAlign: 'center',
            color: '#e6f0ff'
          }}>
            <h2 style={{ margin: '0 0 8px', fontSize: '22px' }}>{panel.title}</h2>
            <p>Gains totaux : <b>{panel.total}</b></p>
            <div style={{ opacity: '0.8', fontSize: '12px', marginTop: '6px' }}>
              Échap ou clic pour fermer
            </div>
            <button
              onClick={() => setPanel(prev => ({ ...prev, show: false }))}
              style={{
                marginTop: '12px',
                padding: '8px 16px',
                borderRadius: '8px',
                background: '#1d2a36',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#e6f0ff',
                cursor: 'pointer'
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoneyCartGame;

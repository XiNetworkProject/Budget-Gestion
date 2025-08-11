import { useEffect, useRef, useState, memo } from 'react';
import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

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
    cellSize: 110,
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
    killTweens(sym);
    try { sym.destroy({ children: true }) } catch { }
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
      const pad = 8;
      const r = this.isRowActive();
      const cellSize = this.gameState.cellSize;
      
      // fond
      this.bg.clear().beginFill(r ? 0x0f1822 : 0x0a0e13).drawRoundedRect(pad, pad, cellSize - 2 * pad, cellSize - 2 * pad, 12).endFill();
      this.bg.lineStyle(1, r ? 0x294055 : 0x1b2833, .85).drawRoundedRect(pad, pad, cellSize - 2 * pad, cellSize - 2 * pad, 12);
      
      // motif hatch si verrouillé
      this.hatch.clear();
      if (!r) {
        this.hatch.lineStyle(1, 0x365069, .25);
        for (let k = -cellSize; k < cellSize; k += 8) {
          this.hatch.moveTo(pad + k, pad);
          this.hatch.lineTo(pad + k + cellSize - 2 * pad, pad + cellSize - 2 * pad);
        }
      }
      
      // halo pour surbrillance
      this.halo.clear().beginFill(0x58c1ff, .07).drawRoundedRect(4, 4, cellSize - 8, cellSize - 8, 16).endFill();
      
      // redessine le symbole si présent
      if (this.symbol) this.symbol.resize();
      
      // grise tout le contenu si verrouillé
      this.container.alpha = r ? 1 : 0.55;
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

    resize() {
      this.removeChildren();
      const color = this.colorFor();
      const r = Math.floor(this.cell.gameState.cellSize * .28);
      const cx = Math.floor(this.cell.gameState.cellSize / 2);
      const cy = cx;
      
      const g = new PIXI.Graphics();
      g.x = cx;
      g.y = cy;
      g.beginFill(color).drawCircle(0, 0, r).endFill();
      g.lineStyle(6, 0x0b0f14, .85).drawCircle(0, 0, r - 8);
      
      const t = new PIXI.Text(this.labelFor(), {
        fontFamily: "Inter,Arial",
        fontSize: Math.floor(r * .9),
        fontWeight: 800,
        fill: 0xffffff,
        align: "center"
      });
      t.anchor.set(.5);
      t.y = 2;
      this.addChild(g, t);
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
      if (!this || !this.scale) return Promise.resolve();
      const dur = .10;
      const tween = gsap.fromTo(this.scale, { x: 1, y: 1 }, { x: 1.1, y: 1.1, yoyo: true, repeat: 1, duration: dur });
      return new Promise((resolve) => {
        let done = false;
        const finish = () => { if (done) return; done = true; resolve(); };
        try { tween.eventCallback("onComplete", finish) } catch { }
        setTimeout(finish, Math.ceil(dur * 2 * 1000) + 60);
      });
    }

    async popIn() {
      if (!this || !this.scale) return Promise.resolve();
      const dur = .28;
      this.scale.set(.3);
      return new Promise((resolve) => {
        const tween = gsap.to(this.scale, { x: 1, y: 1, ease: "back.out(1.7)", duration: dur, onComplete: resolve });
        setTimeout(() => resolve(), Math.ceil(dur * 1000) + 80);
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

    const app = new PIXI.Application({
      background: 0x0b0f14,
      resizeTo: containerRef.current,
      antialias: true,
      width: 800,
      height: 600
    });

    containerRef.current.appendChild(app.view);
    appRef.current = app;

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
      const hMargin = 240;
      const maxGridW = Math.min(920, w - 40);
      const maxGridH = Math.max(160, h - hMargin);
      const sizeByW = Math.floor(maxGridW / gameState.COLS);
      const sizeByH = Math.floor(maxGridH / gameState.MAX_ROWS);
      gameState.cellSize = Math.max(36, Math.min(sizeByW, sizeByH));
      const gridW = gameState.COLS * gameState.cellSize;
      const gridH = gameState.MAX_ROWS * gameState.cellSize;
      gameState.origin.x = Math.round((w - gridW) / 2);
      gameState.origin.y = Math.round((h - gridH) / 2);
      
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
          fontSize: Math.floor(gameState.cellSize * .28),
          fontWeight: 800,
          fill: 0xffffff,
          dropShadow: true,
          dropShadowBlur: 2,
          dropShadowDistance: 0
        });
        t.anchor.set(.5, 1);
        t.x = gameState.origin.x + cell.col * gameState.cellSize + gameState.cellSize / 2;
        t.y = gameState.origin.y + cell.row * gameState.cellSize + gameState.cellSize - 10;
        fxLayer.addChild(t);
        gsap.to(t, { y: t.y - 24, alpha: 0, duration: .7, ease: "sine.out", onComplete: () => t.destroy() });
      },
      beam: (fromCell, toCell) => {
        const g = new PIXI.Graphics();
        g.lineStyle({ width: 3, color: 0x58c1ff, alpha: .9 });
        const a = gameUtils.cellCenter(fromCell);
        const b = gameUtils.cellCenter(toCell);
        g.moveTo(a.x, a.y);
        g.lineTo(b.x, b.y);
        fxLayer.addChild(g);
        const dot = new PIXI.Graphics();
        dot.beginFill(0xffffff).drawCircle(0, 0, 3).endFill();
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
        // Arc électrique : polyligne "zigzag" avec glow + bref flash
        const steps = 6 + Math.floor(Math.hypot(b.x - a.x, b.y - a.y) / 120);
        const g = new PIXI.Graphics();
        g.lineStyle({ width: 2, color: 0x7ee4ff, alpha: 1 });
        const dx = (b.x - a.x) / steps;
        const dy = (b.y - a.y) / steps;
        g.moveTo(a.x, a.y);
        for (let i = 1; i < steps; i++) {
          const px = a.x + dx * i + (Math.random() - 0.5) * 10;
          const py = a.y + dy * i + (Math.random() - 0.5) * 10;
          g.lineTo(px, py);
        }
        g.lineTo(b.x, b.y);
        fxLayer.addChild(g);
        // glow secondaire
        const glow = new PIXI.Graphics();
        glow.lineStyle({ width: 6, color: 0x2bc0ff, alpha: .18 });
        glow.moveTo(a.x, a.y);
        glow.lineTo(b.x, b.y);
        fxLayer.addChild(glow);
        gsap.to(g, { alpha: 0, duration: .35 });
        gsap.to(glow, { alpha: 0, duration: .35, onComplete: () => { g.destroy(); glow.destroy(); } });
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

          // Test 4: Upgrader -> versions persistantes valides (kill tween avant destroy)
          const ugCell = gameUtils.emptyCells()[0] || gameUtils.cellAt(0, 2);
          const ug = new UpgraderSymbol();
          ug.attach(ugCell);
          ug.resize();
          await ug.onResolve(gameUtils);

          // Test 5: ResetPlus augmente la base et remet le compteur
          const rCell = gameUtils.emptyCells()[0] || gameUtils.cellAt(1, 2);
          const rplus = new ResetPlusSymbol();
          rplus.attach(rCell);
          rplus.resize();
          await rplus.onResolve(gameUtils);
          console.assert(gameState.respinBase >= 3 && gameState.respins === gameState.respinBase, 'ResetPlus doit remettre le compteur au nouveau base');

          // Test 6: Un symbole Unlock seul NE doit PAS débloquer de rangée
          const rowsBeforeUnlock = gameState.ROWS;
          const uCell = gameUtils.emptyCells()[0];
          const u = new UnlockSymbol();
          u.attach(uCell);
          u.resize();
          await u.onResolve(gameUtils);
          console.assert(gameState.ROWS === rowsBeforeUnlock, "Unlock ne doit pas débloquer si la ligne n'est pas pleine");

          // Test 7: PopIn/Bump sur objet non attaché → no-op sans crash
          const ghost = new CoinSymbol(1);
          await ghost.onSpawn();
          await ghost.bump();

          // Test 8: Destroy en cours de tween ne provoque pas d'accès à scale null
          const ccell = gameUtils.emptyCells()[0];
          const temp = new CoinSymbol(2);
          temp.attach(ccell);
          temp.resize();
          const tween = temp.bump();
          safeDestroySymbol(temp);
          await tween.catch(() => {});

          // Test 9: Sniper ne tire qu'une seule fois par résolution
          resetBoard();
          gameState.playing = true;
          const sCell = gameUtils.cellAt(0, 0);
          const coinCell = gameUtils.cellAt(1, 0);
          const sniper = new SniperSymbol(false);
          sniper.attach(sCell);
          sniper.resize();
          const targetCoin = new CoinSymbol(2);
          targetCoin.attach(coinCell);
          targetCoin.resize();
          await sniper.onResolve(gameUtils);
          console.assert(targetCoin.value === 4, 'Sniper doit doubler une seule fois la cible');

          // Test 10: plusieurs lignes complètes dans un même tour -> 1 seul unlock
          resetBoard();
          gameState.playing = true;
          for (let c = 0; c < gameState.COLS; c++) {
            let cellA = gameUtils.cellAt(c, 0);
            let cellB = gameUtils.cellAt(c, 1);
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
              if (cell.isEmpty()) {
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
          const sTest13 = new CoinSymbol(1);
          sTest13.attach(cellTest13);
          sTest13.resize();
          const pTest13 = sTest13.bump();
          safeDestroySymbol(sTest13);
          const res = await Promise.race([pTest13.then(() => "ok"), gameUtils.sleep(1000).then(() => "timeout")]);
          console.assert(res === "ok", 'bump() doit se résoudre même après killTweensOf/destroy');

          // Test 14 (popIn() promise)
          const cell2 = gameUtils.cellAt(0, 1);
          const s2 = new CoinSymbol(1);
          s2.attach(cell2);
          s2.resize();
          const beforeTest14 = performance.now();
          await s2.onSpawn();
          const elapsed = performance.now() - beforeTest14;
          console.assert(elapsed >= 200, 'popIn/onSpawn devrait attendre au moins ~200ms (approx)');
          safeDestroySymbol(s2);
          cell2.symbol = null;

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

    // Cleanup
    return () => {
      if (appRef.current) {
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

  return (
    <div style={{ position: 'relative', width: '100%', height: '600px', background: '#0b0f14', borderRadius: '8px', overflow: 'hidden' }}>
      {/* Canvas PixiJS */}
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
        background: 'rgba(16,24,32,.7)',
        backdropFilter: 'blur(6px)',
        border: '1px solid rgba(255,255,255,.08)',
        borderRadius: '14px',
        padding: '8px 12px',
        fontSize: '14px',
        color: '#e6f0ff'
      }}>
        <div style={{ padding: '6px 10px', borderRadius: '10px', background: '#15202b', border: '1px solid rgba(255,255,255,.06)' }}>
          Spins restants : <b>{ui.respins}</b>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: '10px', background: '#15202b', border: '1px solid rgba(255,255,255,.06)' }}>
          Rangées actives : <b>{ui.rows}</b>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: '10px', background: '#15202b', border: '1px solid rgba(255,255,255,.06)' }}>
          Total : <b>{ui.total}×</b>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: '10px', background: '#15202b', border: '1px solid rgba(255,255,255,.06)' }}>
          Mise : <b>{ui.bet.toFixed(2)}</b>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: '10px', background: '#15202b', border: '1px solid rgba(255,255,255,.06)' }}>
          Reset de base : <b>{ui.reset}</b>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: '10px', background: '#15202b', border: '1px solid rgba(255,255,255,.06)' }}>
          Cap : <b>{ui.cap}×</b>
        </div>
      </div>

      {/* Contrôles */}
      <div style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: '18px',
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={() => window.moneyCartGame?.startBonus()}
          style={{
            padding: '10px 14px',
            borderRadius: '12px',
            background: '#1d2a36',
            border: '1px solid rgba(255,255,255,.1)',
            color: '#e6f0ff',
            fontWeight: 600,
            cursor: 'pointer',
            transition: '.15s'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.background = '#223240';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.background = '#1d2a36';
          }}
        >
          Lancer le Bonus
        </button>
        
        <button
          onClick={() => window.moneyCartGame?.spinStep()}
          style={{
            padding: '10px 14px',
            borderRadius: '12px',
            background: '#1d2a36',
            border: '1px solid rgba(255,255,255,.1)',
            color: '#e6f0ff',
            fontWeight: 600,
            cursor: 'pointer',
            transition: '.15s'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.background = '#223240';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.background = '#1d2a36';
          }}
        >
          Tour suivant (Espace)
        </button>
        
        <button
          onClick={() => window.moneyCartGame?.toggleTurbo()}
          style={{
            padding: '10px 14px',
            borderRadius: '12px',
            background: '#1d2a36',
            border: '1px solid rgba(255,255,255,.1)',
            color: '#e6f0ff',
            fontWeight: 600,
            cursor: 'pointer',
            transition: '.15s'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.background = '#223240';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.background = '#1d2a36';
          }}
        >
          Turbo : {ui.turbo ? 'ON' : 'OFF'}
        </button>
        
        <button
          onClick={() => window.moneyCartGame?.reset()}
          style={{
            padding: '10px 14px',
            borderRadius: '12px',
            background: '#1d2a36',
            border: '1px solid rgba(255,255,255,.1)',
            color: '#e6f0ff',
            fontWeight: 600,
            cursor: 'pointer',
            transition: '.15s'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.background = '#223240';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.background = '#1d2a36';
          }}
        >
          Réinitialiser
        </button>

        <button
          onClick={() => window.moneyCartGame?.runTests()}
          style={{
            padding: '10px 14px',
            borderRadius: '12px',
            background: '#1d2a36',
            border: '1px solid rgba(255,255,255,.1)',
            color: '#e6f0ff',
            fontWeight: 600,
            cursor: 'pointer',
            transition: '.15s'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.background = '#223240';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.background = '#1d2a36';
          }}
        >
          Tests
        </button>
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
    </div>
  );
});

MoneyCartGame.displayName = 'MoneyCartGame';

export default MoneyCartGame;

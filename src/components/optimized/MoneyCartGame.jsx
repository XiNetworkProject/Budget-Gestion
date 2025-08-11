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
  let ROWS = 4;
  const MAX_ROWS = 8;
  const BASE_BET = 1.00;
  const BIG_WIN_THRESHOLD = 100;
  const MAX_WIN_CAP = 15000;
  let cellSize = 110;
  let respinBase = 3;
  let respins = 0;
  let playing = false;
  let turbo = false;
  let isSpinning = false;
  let autoplay = false;
  let lastSpawned = [];
  let cells = [];
  let activeTop = 0, activeBottom = 0;
  let fullRowsAwarded = 0;
  let nextUnlockTop = true;

  // Pondérations des symboles
  const WEIGHTS = {
    base: { coin: 70, collector: 5, payer: 5, cp: 2, p_collector: 1, p_payer: 1, sniper: 3, necro: 2, unlock: 3, arms: 2, upg: 2, rplus: 0 },
    deep: { coin: 65, collector: 6, payer: 6, cp: 2, p_collector: 1, p_payer: 1, sniper: 4, necro: 3, unlock: 3, arms: 2, upg: 2, rplus: 0 }
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

    setHighlight(on) {
      gsap.to(this.halo, { alpha: on ? 1 : 0, duration: 0.15 });
    }

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
      for (const s of others) { suck(this.cell, s.cell); await sleep(30); }
      this.value = Math.min(MAX_WIN_CAP, this.value + total);
      floatText(this.cell, `+${total}`);
      this.resize();
      updateHUD();
    }

    async onResolve() { await this.collectAnimated(); await this.bump(); }
    async onPersistent() { await this.collectAnimated(); await this.bump(); }
  }

  class PayerSymbol extends BaseSymbol {
    constructor(v = 1, p = false) { super(p ? "p_payer" : "payer", v, p); }

    async paySequential() {
      const targets = symbols().filter(s => s !== this);
      for (const t of targets) {
        beam(this.cell, t.cell);
        await sleep(60);
        t.value = Math.min(MAX_WIN_CAP, t.value + this.value);
        t.resize();
        floatText(t.cell, `+${this.value}`);
      }
      updateHUD();
    }

    async onResolve() { await this.paySequential(); await this.bump(); }
    async onPersistent() { await this.paySequential(); await this.bump(); }
  }

  class ComboCPSymbol extends BaseSymbol {
    constructor(p = false) { super(p ? "p_cp" : "cp", 1, p); }

    async run() {
      const total = sumValues();
      this.value = Math.min(MAX_WIN_CAP, this.value + total);
      floatText(this.cell, `+${total}`);
      this.resize();
      for (const s of symbols()) {
        if (s !== this) {
          s.value = Math.min(MAX_WIN_CAP, s.value + this.value);
          s.resize();
          floatText(s.cell, `+${this.value}`);
        }
      }
      updateHUD();
      await this.bump();
    }

    async onResolve() { await this.run(); }
    async onPersistent() { await this.run(); }
  }

  class SniperSymbol extends BaseSymbol {
    constructor(p = false) { super(p ? "p_sniper" : "sniper", 0, p); }

    async shoot(times = 1) {
      let pool = symbols().filter(s => s !== this && s.value > 0);
      for (let i = 0; i < times && pool.length; i++) {
        const t = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
        beam(this.cell, t.cell);
        t.value = Math.min(MAX_WIN_CAP, t.value * 2);
        t.resize();
        floatText(t.cell, "×2");
        await sleep(120);
      }
      updateHUD();
    }

    async onResolve() { await this.shoot(1); await this.bump(); }
    async onPersistent() { await this.shoot(1); await this.bump(); }
  }

  class NecroSymbol extends BaseSymbol {
    constructor() { super("necro", 0, false); }

    async onResolve() {
      const pool = symbols().filter(s => ["collector", "payer", "cp", "sniper"].includes(s.type));
      const n = rnd.int(1, 2);
      for (let i = 0; i < n && pool.length; i++) {
        const t = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
        highlight(t.cell, true);
        await sleep(80);
        highlight(t.cell, false);
        await t.onResolve();
      }
      await this.bump();
    }
  }

  class UnlockSymbol extends BaseSymbol {
    constructor() { super("unlock", 0, false); }

    async onResolve() {
      floatText(this.cell, "U");
      await this.bump();
    }
  }

  class ArmsDealerSymbol extends BaseSymbol {
    constructor(p = false) { super(p ? "p_arms" : "arms", 0, p); }

    async mutateCoins(count = 1) {
      if (Math.random() < 0.5) return;
      const pool = activeCells().filter(c => c.symbol && c.symbol.type === "coin").map(c => c.symbol);
      const pickTypes = ["collector", "payer", "sniper", "necro"];
      for (let i = 0; i < count && pool.length; i++) {
        const target = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
        killTweens(target);
        const type = rnd.pick(pickTypes);
        const cell = target.cell;
        safeDestroySymbol(target);
        cell.symbol = null;
        const sym = createSymbol(type);
        sym.attach(cell);
        sym.resize();
        await sym.onSpawn();
      }
      updateHUD();
    }

    async onResolve() { await this.mutateCoins(1); await this.bump(); }
    async onPersistent() { await this.mutateCoins(1); await this.bump(); }
  }

  class UpgraderSymbol extends BaseSymbol {
    constructor() { super("upg", 0, false); }

    async onResolve() {
      const candidates = symbols().filter(s => ["collector", "payer", "sniper", "cp"].includes(s.type));
      const n = rnd.int(0, 1);
      for (let i = 0; i < n && candidates.length; i++) {
        const t = candidates.splice(Math.floor(Math.random() * candidates.length), 1)[0];
        const map = { collector: "p_collector", payer: "p_payer", sniper: "p_sniper", cp: "p_cp" };
        const newType = map[t.type];
        killTweens(t);
        const cell = t.cell;
        safeDestroySymbol(t);
        cell.symbol = null;
        const sym = createSymbol(newType);
        sym.attach(cell);
        sym.resize();
        await sym.onSpawn();
      }
      await this.bump();
      updateHUD();
    }
  }

  class ResetPlusSymbol extends BaseSymbol {
    constructor() { super("rplus", 0, false); }

    async onResolve() {
      if (respinBase < 5) {
        respinBase++;
        toast(`Reset de base +1 → ${respinBase}`);
      }
      respins = respinBase;
      updateHUD();
      await this.bump();
    }
  }

  // Fonctions utilitaires
  function colorFor(type, p) {
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

  function labelFor(sym) {
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

  // Effets visuels
  function cellCenter(cell) {
    return {
      x: cell.container.x + cellSize / 2,
      y: cell.container.y + cellSize / 2
    };
  }

  function floatText(cell, text) {
    const t = new PIXI.Text(text, {
      fontSize: Math.floor(cellSize * 0.28),
      fontWeight: 800,
      fill: 0xffffff,
      dropShadow: true,
      dropShadowBlur: 2,
      dropShadowDistance: 0
    });
    t.anchor.set(0.5, 1);
    t.x = cell.container.x + cellSize / 2;
    t.y = cell.container.y + cellSize - 10;
    appRef.current.stage.addChild(t);
    gsap.to(t, { y: t.y - 24, alpha: 0, duration: 0.7, ease: "sine.out", onComplete: () => t.destroy() });
  }

  function beam(fromCell, toCell) {
    const g = new PIXI.Graphics();
    g.lineStyle({ width: 3, color: 0x58c1ff, alpha: 0.9 });
    const a = cellCenter(fromCell), b = cellCenter(toCell);
    g.moveTo(a.x, a.y);
    g.lineTo(b.x, b.y);
    appRef.current.stage.addChild(g);
    const dot = new PIXI.Graphics();
    dot.beginFill(0xffffff).drawCircle(0, 0, 3).endFill();
    dot.x = a.x;
    dot.y = a.y;
    appRef.current.stage.addChild(dot);
    gsap.to(dot, { x: b.x, y: b.y, duration: 0.18, ease: "sine.out", onComplete: () => dot.destroy() });
    gsap.to(g, { alpha: 0, duration: 0.25, onComplete: () => g.destroy() });
  }

  function suck(toCell, fromCell) {
    const a = cellCenter(fromCell), b = cellCenter(toCell);
    const p = new PIXI.Graphics();
    p.beginFill(0xffd166).drawCircle(0, 0, 2.5).endFill();
    p.x = a.x;
    p.y = a.y;
    appRef.current.stage.addChild(p);
    gsap.to(p, { x: b.x, y: b.y, alpha: 0.2, duration: 0.22, ease: "sine.in", onComplete: () => p.destroy() });
  }

  function electricArc(a, b) {
    const steps = 6 + Math.floor(Math.hypot(b.x - a.x, b.y - a.y) / 120);
    const g = new PIXI.Graphics();
    g.lineStyle({ width: 2, color: 0x7ee4ff, alpha: 1 });
    const dx = (b.x - a.x) / steps, dy = (b.y - a.y) / steps;
    g.moveTo(a.x, a.y);
    for (let i = 1; i < steps; i++) {
      const px = a.x + dx * i + (Math.random() - 0.5) * 10;
      const py = a.y + dy * i + (Math.random() - 0.5) * 10;
      g.lineTo(px, py);
    }
    g.lineTo(b.x, b.y);
    appRef.current.stage.addChild(g);
    const glow = new PIXI.Graphics();
    glow.lineStyle({ width: 6, color: 0x2bc0ff, alpha: 0.18 });
    glow.moveTo(a.x, a.y);
    glow.lineTo(b.x, b.y);
    appRef.current.stage.addChild(glow);
    gsap.to(g, { alpha: 0, duration: 0.35 });
    gsap.to(glow, { alpha: 0, duration: 0.35, onComplete: () => { g.destroy(); glow.destroy(); } });
  }

  function popIn(d) {
    if (!d || !d.scale) return Promise.resolve();
    const dur = 0.28;
    d.scale.set(0.3);
    return new Promise((resolve) => {
      const tween = gsap.to(d.scale, { x: 1, y: 1, ease: "back.out(1.7)", duration: dur, onComplete: resolve });
      setTimeout(() => resolve(), Math.ceil(dur * 1000) + 80);
    });
  }

  function highlight(cell, on) { cell.setHighlight(on); }

  function screenshake(amount = 4, dur = 0.12) {
    return gsap.fromTo(appRef.current.stage, { x: 0 }, { x: amount, yoyo: true, repeat: 3, duration: dur, ease: "sine.inOut" });
  }

  // FX BONUS START
  function spinFX(cell, dur = 0.18) {
    const center = cellCenter(cell);
    const r = Math.max(8, Math.floor(cellSize * 0.32));
    const sp = new PIXI.Container();
    sp.x = center.x;
    sp.y = center.y;
    sp.rotation = Math.random() * Math.PI;
    const ring = new PIXI.Graphics();
    ring.lineStyle({ width: 3, color: 0x5fd3ff, alpha: 0.8 }).drawCircle(0, 0, r);
    const dot = new PIXI.Graphics();
    dot.beginFill(0xffffff).drawCircle(r, 0, 3).endFill();
    sp.addChild(ring, dot);
    appRef.current.stage.addChild(sp);
    return new Promise((resolve) => {
      gsap.to(sp, { rotation: "+=6.283", duration: dur, ease: "sine.inOut" });
      gsap.to(sp, { alpha: 0.0, delay: dur - 0.08, duration: 0.08, onComplete: () => { sp.destroy(); resolve(); } });
    });
  }

  async function sweepSpinAllCellsTopDown() {
    const rowDur = turbo ? 0.12 : 0.18;
    for (let absRow = 0; absRow < MAX_ROWS; absRow++) {
      const rowCells = cells.filter(c => c.row === absRow);
      await Promise.all(rowCells.map(c => spinFX(c, rowDur)));
      await sleep(turbo ? 10 : 40);
    }
  }

  // Fonctions de jeu
  const recomputeActiveBounds = () => {
    activeTop = Math.max(0, Math.floor((MAX_ROWS - ROWS) / 2));
    activeBottom = activeTop + ROWS - 1;
  };

  function isRowActive(absRow) { return absRow >= activeTop && absRow <= activeBottom; }
  function relToAbs(rRel) { return activeTop + rRel; }

  function layout() {
    const w = appRef.current.renderer.width, h = appRef.current.renderer.height;
    const hMargin = 240;
    const maxGridW = Math.min(920, w - 40);
    const maxGridH = Math.max(160, h - hMargin);
    const sizeByW = Math.floor(maxGridW / COLS);
    const sizeByH = Math.floor(maxGridH / MAX_ROWS);
    cellSize = Math.max(36, Math.min(sizeByW, sizeByH));
    const gridW = COLS * cellSize, gridH = MAX_ROWS * cellSize;
    const origin = {
      x: Math.round((w - gridW) / 2),
      y: Math.round((h - gridH) / 2)
    };
    for (const c of cells) {
      c.container.x = origin.x + c.col * cellSize;
      c.container.y = origin.y + c.row * cellSize;
      c.resize();
    }
  }

  function rebuildGrid() {
    cells.length = 0;
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < MAX_ROWS; r++) {
        const cell = new Cell(c, r);
        cells.push(cell);
      }
    }
    layout();
  }

  function cellAtAbs(col, absRow) { return cells.find(k => k.col === col && k.row === absRow); }
  function cellAt(col, rRel) { return cellAtAbs(col, relToAbs(rRel)); }

  function activeCells() {
    const arr = [];
    for (let c = 0; c < COLS; c++) {
      for (let r = activeTop; r <= activeBottom; r++) {
        const cell = cellAtAbs(c, r);
        if (cell) arr.push(cell);
      }
    }
    return arr;
  }

  function emptyCells() { return activeCells().filter(c => c.isEmpty()); }
  function symbols() { return activeCells().filter(c => c.symbol).map(c => c.symbol); }
  function sumValues() { return Math.min(MAX_WIN_CAP, symbols().reduce((a, s) => a + (s.value || 0), 0)); }

  // Règle d'unlock par LIGNE PLEINE
  function isRowFullRel(rRel) {
    for (let c = 0; c < COLS; c++) {
      const cell = cellAt(c, rRel);
      if (!cell || !cell.symbol) return false;
    }
    return true;
  }

  function getFullRowsRel() {
    const res = [];
    for (let r = 0; r < ROWS; r++) {
      if (isRowFullRel(r)) res.push(r);
    }
    return res;
  }

  async function unlockRow(direction, fullRowsRel) {
    if (ROWS >= MAX_ROWS) return;
    fullRowsRel = fullRowsRel && fullRowsRel.length ? fullRowsRel : getFullRowsRel();
    const sourceRel = direction === 'top' ? Math.min(...fullRowsRel) : Math.max(...fullRowsRel);
    const sourceAbs = relToAbs(sourceRel);
    const targetAbs = (direction === 'top') ? (activeTop - 1) : (activeBottom + 1);
    if (targetAbs >= 0 && targetAbs < MAX_ROWS) {
      for (let c = 0; c < COLS; c++) {
        const from = cellAtAbs(c, sourceAbs), to = cellAtAbs(c, targetAbs);
        if (from && to) electricArc(cellCenter(from), cellCenter(to));
      }
      await sleep(220);
    }
    if (direction === 'top' && activeTop > 0) activeTop -= 1;
    else if (direction === 'bottom' && activeBottom < MAX_ROWS - 1) activeBottom += 1;
    ROWS = Math.min(MAX_ROWS, ROWS + 1);
    for (const c of cells) c.resize();
    updateHUD();
    await sleep(120);
  }

  async function unlockRowByRule(fullRowsRel) {
    if (ROWS >= MAX_ROWS) return;
    const dir = nextUnlockTop ? 'top' : 'bottom';
    await unlockRow(dir, fullRowsRel);
    nextUnlockTop = !nextUnlockTop;
  }

  async function maybeUnlockFromFullRows() {
    const fullRel = getFullRowsRel();
    if (fullRel.length > fullRowsAwarded && ROWS < MAX_ROWS) {
      await unlockRowByRule(fullRel);
      fullRowsAwarded++;
    }
  }

  // Fabrique de symboles
  function createSymbol(type) {
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
      case "p_collector": return new CollectorSymbol(true);
      case "p_payer": return new PayerSymbol(rnd.pick([1, 1, 1, 2]), true);
      case "p_cp": return new ComboCPSymbol(true);
      case "p_sniper": return new SniperSymbol(true);
      case "p_arms": return new ArmsDealerSymbol(true);
      default: return new CoinSymbol(1);
    }
  }

  // Boucle de jeu
  function updateHUD() {
    setHudData({
      respins: String(respins),
      rows: String(ROWS),
      total: `${sumValues()}×`,
      bet: BASE_BET.toFixed(2),
      reset: String(respinBase),
      cap: `${MAX_WIN_CAP}×`
    });
  }

  function resetBoard() {
    for (const c of cells) {
      if (c.symbol) {
        safeDestroySymbol(c.symbol);
        c.symbol = null;
      }
    }
    ROWS = 4;
    fullRowsAwarded = 0;
    nextUnlockTop = true;
    respinBase = 3;
    recomputeActiveBounds();
    for (const c of cells) c.resize();
    respins = 0;
    updateHUD();
  }

  async function startBonus() {
    if (playing) return;
    playing = true;
    resetBoard();
    await sweepSpinAllCellsTopDown();
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
    respins = respinBase;
    updateHUD();
    toast("Bonus lancé ! Auto en cours…");
    autoplay = true;
    autoPlayLoop();
  }

  async function autoPlayLoop() {
    while (autoplay && playing && respins > 0) {
      await spinStep();
      if (!playing) break;
      await sleep(turbo ? 120 : 320);
    }
  }

  async function spinStep() {
    if (!playing || respins <= 0 || isSpinning) return;
    isSpinning = true;
    try {
      const empties = emptyCells();
      let spawned = 0;
      lastSpawned = [];
      if (empties.length) {
        const spawnCountTable = turbo ? { 0: 3, 1: 4, 2: 1 } : { 0: 5, 1: 3, 2: 1 };
        const spawnCount = Number(weightedPick(spawnCountTable));
        const chosen = pickNRandom(empties, Math.min(empties.length, spawnCount));
        for (const cell of chosen) {
          const key = ROWS <= 5 ? "base" : "deep";
          const type = weightedPick(WEIGHTS[key]);
          const sym = createSymbol(type);
          sym.attach(cell);
          sym.resize();
          await sym.onSpawn();
          spawned++;
          lastSpawned.push(sym);
        }
      }
      respins = (spawned > 0) ? respinBase : (respins - 1);
      updateHUD();
      const order = ["arms", "upg", "payer", "sniper", "collector", "cp", "necro", "unlock"];
      for (const t of order) {
        const group = lastSpawned.filter(s => s.type === t);
        for (const s of group) {
          highlight(s.cell, true);
          await s.onResolve();
          highlight(s.cell, false);
          await sleep(turbo ? 30 : 140);
        }
      }
      const pOrder = ["p_arms", "p_payer", "p_sniper", "p_collector", "p_cp"];
      for (const t of pOrder) {
        const group = symbols().filter(s => s.type === t);
        for (const s of group) {
          highlight(s.cell, true);
          await s.onPersistent();
          highlight(s.cell, false);
          await sleep(turbo ? 30 : 120);
        }
      }
      await maybeUnlockFromFullRows();
      const mult = sumValues();
      if (mult >= MAX_WIN_CAP) {
        await displayPanel("MAX WIN ATTEINT", `${mult}×`);
        playing = false;
        autoplay = false;
        return;
      } else if (mult >= BIG_WIN_THRESHOLD) {
        toast(`GROS GAIN : ${mult}×`, 1500);
      }
      updateHUD();
      if (respins <= 0) {
        await endBonus();
        autoplay = false;
      }
    } finally {
      isSpinning = false;
    }
  }

  async function endBonus() {
    const totalMult = sumValues();
    const total = totalMult * BASE_BET;
    setPanelData({
      title: "Fin du bonus",
      total: `${totalMult}× (=${total.toFixed(2)})`
    });
    setShowPanel(true);
    playing = false;
  }

  async function displayPanel(title, big) {
    setPanelData({ title, total: big });
    setShowPanel(true);
    await sleep(200);
  }

  // Initialisation
  useEffect(() => {
    const app = new PIXI.Application({
      background: 0x0b0f14,
      width: 800,
      height: 600,
      antialias: true
    });
    
    appRef.current = app;
    
    if (canvasRef.current) {
      canvasRef.current.appendChild(app.view);
    }
    
    recomputeActiveBounds();
    rebuildGrid();
    updateHUD();
    toast("Clique 'Lancer le Bonus' pour commencer");

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
        <button className="btn" onClick={() => { autoplay = false; spinStep(); }}>Tour suivant (Espace)</button>
        <button className="btn" onClick={(e) => { turbo = !turbo; e.target.textContent = `Turbo : ${turbo ? "ON" : "OFF"}`; toast(`Turbo ${turbo ? "activé" : "désactivé"}`); }}>Turbo : OFF</button>
        <button className="btn" onClick={() => { playing = false; setShowPanel(false); resetBoard(); toast("Réinitialisé"); }}>Réinitialiser</button>
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

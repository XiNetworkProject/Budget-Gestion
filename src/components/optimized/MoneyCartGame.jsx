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

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const rnd = {
    next: () => Math.random(),
    int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    pick: (array) => array[Math.floor(Math.random() * array.length)]
  };

  const weightedPick = (table) => {
    const entries = Object.entries(table);
    const sum = entries.reduce((acc, [, weightValue]) => acc + weightValue, 0);
    let randomValue = Math.random() * sum;
    for (const [keyValue, weightValue] of entries) {
      randomValue -= weightValue;
      if (randomValue < 0) return keyValue;
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

  const pickNRandom = (arr, count) => {
    const arrayCopy = arr.slice();
    shuffleInPlace(arrayCopy);
    return arrayCopy.slice(0, Math.min(count, arrayCopy.length));
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
      this.graphics = new PIXI.Graphics();
      this.highlight = new PIXI.Graphics();
      this.graphics.addChild(this.highlight);
      this.graphics.interactive = true;
      this.graphics.buttonMode = true;
      this.graphics.on('pointerdown', () => this.onClick());
    }

    onClick() {
      if (this.symbol && this.symbol.type === 'coin') {
        this.symbol.value = Math.floor(this.symbol.value * 1.5);
        this.symbol.updateLabel();
        updateHUD();
      }
    }

    resize() {
      const posX = this.col * cellSize;
      const posY = (this.row - activeTop) * cellSize;
      this.graphics.position.set(posX, posY);
      this.graphics.clear();
      this.graphics.beginFill(0x1a2634);
      this.graphics.lineStyle(1, 0x2a3644);
      this.graphics.drawRect(0, 0, cellSize, cellSize);
      this.graphics.endFill();
      
      this.highlight.clear();
      this.highlight.beginFill(0x4a90e2, 0.3);
      this.highlight.drawRect(0, 0, cellSize, cellSize);
      this.highlight.endFill();
      this.highlight.visible = false;
    }

    setHighlight(on) {
      this.highlight.visible = on;
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
      this.graphics = new PIXI.Graphics();
      this.label = new PIXI.Text('', { fontSize: 14, fill: 0xffffff, fontWeight: 'bold' });
      this.addChild(this.graphics);
      this.addChild(this.label);
      this.updateGraphics();
      this.updateLabel();
    }

    attach(cell) {
      this.cell = cell;
      cell.symbol = this;
      this.position.set(cellSize / 2, cellSize / 2);
      cell.graphics.addChild(this);
    }

    async onSpawn() { await popIn(this); }
    async onResolve() { }
    async onPersistent() { }

    resize() {
      this.updateGraphics();
      this.updateLabel();
    }

    updateGraphics() {
      this.graphics.clear();
      const color = colorFor(this.type, this.persistent);
      this.graphics.beginFill(color);
      this.graphics.lineStyle(2, 0xffffff);
      this.graphics.drawCircle(0, 0, cellSize / 3);
      this.graphics.endFill();
    }

    updateLabel() {
      this.label.text = labelFor(this);
      this.label.anchor.set(0.5);
    }

    async bump() {
      return new Promise((resolve) => {
        const originalScale = this.scale.x;
        gsap.to(this.scale, {
          x: originalScale * 1.2,
          y: originalScale * 1.2,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            resolve();
          }
        });
      });
    }
  }

  // Classes de symboles spécifiques
  class CoinSymbol extends BaseSymbol {
    constructor(value) { super("coin", value, false); }
  }

  class CollectorSymbol extends BaseSymbol {
    constructor(isPersistent = false) { super(isPersistent ? "p_collector" : "collector", 0, isPersistent); }

    async collectAnimated() {
      const coins = symbols().filter(symbol => symbol.type === 'coin');
      for (const coin of coins) {
        await suck(coin.cell, this.cell);
        coin.value = Math.floor(coin.value * 1.5);
        coin.updateLabel();
      }
    }

    async onResolve() { await this.collectAnimated(); await this.bump(); }
    async onPersistent() { await this.collectAnimated(); await this.bump(); }
  }

  class PayerSymbol extends BaseSymbol {
    constructor(value = 1, isPersistent = false) { super(isPersistent ? "p_payer" : "payer", value, isPersistent); }

    async paySequential() {
      const emptyCells = emptyCells();
      for (let i = 0; i < this.value && i < emptyCells.length; i++) {
        const cell = emptyCells[i];
        const coin = new CoinSymbol(1);
        coin.attach(cell);
        await coin.onSpawn();
        await sleep(100);
      }
    }

    async onResolve() { await this.paySequential(); await this.bump(); }
    async onPersistent() { await this.paySequential(); await this.bump(); }
  }

  class ComboCPSymbol extends BaseSymbol {
    constructor(isPersistent = false) { super(isPersistent ? "p_cp" : "cp", 1, isPersistent); }

    async run() {
      const collectors = symbols().filter(symbol => symbol.type === 'collector' || symbol.type === 'p_collector');
      const payers = symbols().filter(symbol => symbol.type === 'payer' || symbol.type === 'p_payer');
      
      for (const collector of collectors) {
        await collector.onResolve();
      }
      
      for (const payer of payers) {
        await payer.onResolve();
      }
    }

    async onResolve() { await this.run(); }
    async onPersistent() { await this.run(); }
  }

  class SniperSymbol extends BaseSymbol {
    constructor(isPersistent = false) { super(isPersistent ? "p_sniper" : "sniper", 0, isPersistent); }

    async shoot(times = 1) {
      for (let i = 0; i < times; i++) {
        const targets = symbols().filter(symbol => symbol.type === 'coin');
        if (targets.length > 0) {
          const target = rnd.pick(targets);
          await beam(this.cell, target.cell);
          target.value = Math.floor(target.value * 2);
          target.updateLabel();
          await sleep(100);
        }
      }
    }

    async onResolve() { await this.shoot(1); await this.bump(); }
    async onPersistent() { await this.shoot(1); await this.bump(); }
  }

  class NecroSymbol extends BaseSymbol {
    constructor() { super("necro", 0, false); }

    async onResolve() {
      const deadCells = cells.filter(cell => !cell.symbol && cell.row < activeTop);
      if (deadCells.length > 0) {
        const cell = rnd.pick(deadCells);
        const coin = new CoinSymbol(1);
        coin.attach(cell);
        await coin.onSpawn();
      }
    }
  }

  class UnlockSymbol extends BaseSymbol {
    constructor() { super("unlock", 0, false); }

    async onResolve() {
      await maybeUnlockFromFullRows();
    }
  }

  class ArmsDealerSymbol extends BaseSymbol {
    constructor(isPersistent = false) { super(isPersistent ? "p_arms" : "arms", 0, isPersistent); }

    async mutateCoins(count = 1) {
      const coins = symbols().filter(symbol => symbol.type === 'coin');
      const targets = pickNRandom(coins, count);
      
      for (const coin of targets) {
        const newType = rnd.pick(['collector', 'payer', 'cp']);
        const newSymbol = createSymbol(newType, true);
        newSymbol.attach(coin.cell);
        await newSymbol.onSpawn();
        await sleep(100);
      }
    }

    async onResolve() { await this.mutateCoins(1); await this.bump(); }
    async onPersistent() { await this.mutateCoins(1); await this.bump(); }
  }

  class UpgraderSymbol extends BaseSymbol {
    constructor() { super("upg", 0, false); }

    async onResolve() {
      const upgradable = symbols().filter(symbol => 
        symbol.type === 'collector' || 
        symbol.type === 'payer' || 
        symbol.type === 'cp'
      );
      
      if (upgradable.length > 0) {
        const target = rnd.pick(upgradable);
        const persistentSymbol = createSymbol(target.type, true);
        persistentSymbol.attach(target.cell);
        await persistentSymbol.onSpawn();
        await sleep(100);
      }
    }
  }

  class ResetPlusSymbol extends BaseSymbol {
    constructor() { super("rplus", 0, false); }

    async onResolve() {
      respins = Math.min(respins + 1, respinBase);
      updateHUD();
      toast("+1 Respin !");
    }
  }

  // Fonctions utilitaires
  function colorFor(symbolType, isPersistent) {
    const colors = {
      coin: 0xffd700,
      collector: 0x00ff00,
      payer: 0x0080ff,
      cp: 0xff00ff,
      p_collector: 0x00ff80,
      p_payer: 0x4080ff,
      sniper: 0xff8000,
      necro: 0x8000ff,
      unlock: 0xffff00,
      arms: 0xff0080,
      upg: 0x80ff00,
      rplus: 0xff4000
    };
    return isPersistent ? colors[symbolType] || 0xffffff : (colors[symbolType] || 0xffffff) * 0.7;
  }

  function labelFor(symbol) {
    if (symbol.type === 'coin') return symbol.value.toString();
    const labels = {
      collector: 'C',
      p_collector: 'C+',
      payer: 'P',
      p_payer: 'P+',
      cp: 'CP',
      p_cp: 'CP+',
      sniper: 'S',
      p_sniper: 'S+',
      necro: 'N',
      unlock: 'U',
      arms: 'A',
      p_arms: 'A+',
      upg: 'U+',
      rplus: 'R+'
    };
    return labels[symbol.type] || '';
  }

  function cellCenter(cell) {
    return {
      x: cell.col * cellSize + cellSize / 2,
      y: (cell.row - activeTop) * cellSize + cellSize / 2
    };
  }

  function floatText(cell, messageText) {
    const center = cellCenter(cell);
    const textObj = new PIXI.Text(messageText, { fontSize: 16, fill: 0xffff00, fontWeight: 'bold' });
    textObj.anchor.set(0.5);
    textObj.position.set(center.x, center.y - 20);
    appRef.current.stage.addChild(textObj);
    
    gsap.to(textObj, {
      y: center.y - 60,
      alpha: 0,
      duration: 1,
      onComplete: () => {
        appRef.current.stage.removeChild(textObj);
        textObj.destroy();
      }
    });
  }

  function beam(fromCell, toCell) {
    const from = cellCenter(fromCell);
    const to = cellCenter(toCell);
    
    const beam = new PIXI.Graphics();
    beam.lineStyle(3, 0x00ffff, 0.8);
    beam.moveTo(from.x, from.y);
    beam.lineTo(to.x, to.y);
    appRef.current.stage.addChild(beam);
    
    gsap.to(beam, {
      alpha: 0,
      duration: 0.3,
      onComplete: () => {
        appRef.current.stage.removeChild(beam);
        beam.destroy();
      }
    });
  }

  function suck(toCell, fromCell) {
    const from = cellCenter(fromCell);
    const to = cellCenter(toCell);
    
    gsap.to(fromCell.symbol, {
      x: to.x - from.x,
      y: to.y - from.y,
      duration: 0.3,
      onComplete: () => {
        fromCell.symbol.position.set(cellSize / 2, cellSize / 2);
      }
    });
  }

  function electricArc(cellA, cellB) {
    const centerA = cellCenter(cellA);
    const centerB = cellCenter(cellB);
    
    const arc = new PIXI.Graphics();
    arc.lineStyle(3, 0x00ffff, 0.8);
    
    for (let i = 0; i < 5; i++) {
      const offset = (Math.random() - 0.5) * 20;
      const arcX = centerA.x + (centerB.x - centerA.x) * (i / 4) + offset;
      const arcY = centerA.y + (centerB.y - centerA.y) * (i / 4) + offset;
      
      if (i === 0) {
        arc.moveTo(arcX, arcY);
      } else {
        arc.lineTo(arcX, arcY);
      }
    }
    
    appRef.current.stage.addChild(arc);
    
    gsap.to(arc, {
      alpha: 0,
      duration: 0.2,
      onComplete: () => {
        appRef.current.stage.removeChild(arc);
        arc.destroy();
      }
    });
  }

  function popIn(displayObject) {
    return new Promise((resolve) => {
      displayObject.scale.set(0);
      gsap.to(displayObject.scale, {
        x: 1,
        y: 1,
        duration: 0.3,
        ease: "back.out(1.7)",
        onComplete: resolve
      });
    });
  }

  function highlight(cell, isHighlighted) { cell.setHighlight(isHighlighted); }

  function screenshake(shakeAmount = 4, shakeDuration = 0.12) {
    const originalX = appRef.current.stage.x;
    const originalY = appRef.current.stage.y;
    
    gsap.to(appRef.current.stage, {
      x: originalX + (Math.random() - 0.5) * shakeAmount,
      y: originalY + (Math.random() - 0.5) * shakeAmount,
      duration: shakeDuration,
      ease: "power2.out",
      onComplete: () => {
        gsap.to(appRef.current.stage, {
          x: originalX,
          y: originalY,
          duration: shakeDuration * 2,
          ease: "power2.out"
        });
      }
    });
  }

  function spinFX(cell, spinDuration = 0.18) {
    const symbol = cell.symbol;
    if (!symbol) return;
    
    gsap.to(symbol, {
      rotation: symbol.rotation + Math.PI * 2,
      duration: spinDuration,
      ease: "power2.out"
    });
  }

  async function sweepSpinAllCellsTopDown() {
    const activeCells = cells.filter(cell => isRowActive(cell.row));
    for (const cell of activeCells) {
      if (cell.symbol) {
        spinFX(cell);
        await sleep(50);
      }
    }
  }

  const recomputeActiveBounds = () => {
    activeTop = Math.max(0, MAX_ROWS - ROWS);
    activeBottom = MAX_ROWS - 1;
  };

  function isRowActive(absRow) { return absRow >= activeTop && absRow <= activeBottom; }
  function relToAbs(relativeRow) { return activeTop + relativeRow; }

  function layout() {
    const stage = appRef.current.stage;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    stage.position.set(centerX - (COLS * cellSize) / 2, centerY - (ROWS * cellSize) / 2);
    
    cells.forEach(cell => cell.resize());
    symbols().forEach(symbol => symbol.resize());
  }

  function rebuildGrid() {
    cells.forEach(cell => {
      if (cell.graphics.parent) {
        cell.graphics.parent.removeChild(cell.graphics);
      }
    });
    
    cells = [];
    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row < MAX_ROWS; row++) {
        const cell = new Cell(col, row);
        cells.push(cell);
        appRef.current.stage.addChild(cell.graphics);
      }
    }
    
    layout();
  }

  function cellAtAbs(col, absRow) { return cells.find(cell => cell.col === col && cell.row === absRow); }
  function cellAt(col, relativeRow) { return cellAtAbs(col, relToAbs(relativeRow)); }

  function activeCells() {
    return cells.filter(c => isRowActive(c.row));
  }

  function emptyCells() { return activeCells().filter(cell => cell.isEmpty()); }
  function symbols() { return activeCells().filter(cell => cell.symbol).map(cell => cell.symbol); }
  function sumValues() { return Math.min(MAX_WIN_CAP, symbols().reduce((acc, symbol) => acc + (symbol.value || 0), 0)); }

  function isRowFullRel(relativeRow) {
    for (let col = 0; col < COLS; col++) {
      if (!cellAt(col, relativeRow) || cellAt(col, relativeRow).isEmpty()) {
        return false;
      }
    }
    return true;
  }

  function getFullRowsRel() {
    const fullRows = [];
    for (let rowIndex = 0; rowIndex < ROWS; rowIndex++) {
      if (isRowFullRel(rowIndex)) {
        fullRows.push(rowIndex);
      }
    }
    return fullRows;
  }

  async function unlockRow(direction, fullRowsRel) {
    if (fullRowsRel.length === 0) return;
    
    const rowToUnlock = direction === 'up' ? Math.min(...fullRowsRel) - 1 : Math.max(...fullRowsRel) + 1;
    
    if (rowToUnlock < 0 || rowToUnlock >= MAX_ROWS) return;
    
    activeTop = Math.min(activeTop, rowToUnlock);
    activeBottom = Math.max(activeBottom, rowToUnlock);
    
    recomputeActiveBounds();
    layout();
    
    await sleep(200);
  }

  async function unlockRowByRule(fullRowsRel) {
    if (fullRowsRel.length === 0) return;
    
    const middleRow = Math.floor(ROWS / 2);
    const closestRow = fullRowsRel.reduce((closest, row) => 
      Math.abs(row - middleRow) < Math.abs(closest - middleRow) ? row : closest
    );
    
    if (closestRow < middleRow) {
      await unlockRow('up', [closestRow]);
    } else {
      await unlockRow('down', [closestRow]);
    }
  }

  async function maybeUnlockFromFullRows() {
    const fullRows = getFullRowsRel();
    if (fullRows.length >= 2) {
      await unlockRowByRule(fullRows);
    }
  }

  function createSymbol(symbolType, isPersistent = false) {
    switch (symbolType) {
      case 'coin': return new CoinSymbol(Math.floor(Math.random() * 10) + 1);
      case 'collector': return new CollectorSymbol(isPersistent);
      case 'payer': return new PayerSymbol(Math.floor(Math.random() * 3) + 1, isPersistent);
      case 'cp': return new ComboCPSymbol(isPersistent);
      case 'sniper': return new SniperSymbol(isPersistent);
      case 'necro': return new NecroSymbol();
      case 'unlock': return new UnlockSymbol();
      case 'arms': return new ArmsDealerSymbol(isPersistent);
      case 'upg': return new UpgraderSymbol();
      case 'rplus': return new ResetPlusSymbol();
      default: return new CoinSymbol(1);
    }
  }

  function updateHUD() {
    setHudData({
      respins: respins.toString(),
      rows: `${ROWS}/${MAX_ROWS}`,
      total: `${sumValues()}×`,
      bet: BASE_BET.toFixed(2),
      reset: respinBase.toString(),
      cap: `${MAX_WIN_CAP}×`
    });
  }

  function resetBoard() {
    respins = respinBase;
    ROWS = 4;
    recomputeActiveBounds();
    rebuildGrid();
    updateHUD();
  }

  async function startBonus() {
    if (playing) return;
    
    playing = true;
    respins = respinBase;
    lastSpawned = [];
    
    // Remplir la grille initiale
    const emptyCells = emptyCells();
    for (const cell of emptyCells) {
      const type = weightedPick(WEIGHTS.base);
      const symbol = createSymbol(type);
      if (symbol) {
        symbol.attach(cell);
        await symbol.onSpawn();
        await sleep(50);
      }
    }
    
    updateHUD();
    toast("Bonus lancé ! Cliquez sur les pièces ou utilisez 'Tour suivant'");
  }

  async function autoPlayLoop() {
    while (autoplay && respins > 0) {
      await spinStep();
      await sleep(turbo ? 100 : 500);
    }
  }

  async function spinStep() {
    if (isSpinning || respins <= 0) return;
    
    isSpinning = true;
    try {
      respins--;
      
      // Collecter et résoudre les symboles
      const symbolsToResolve = symbols().filter(s => !s.persistent);
      for (const symbol of symbolsToResolve) {
        await symbol.onResolve();
        await sleep(100);
      }
      
      // Vérifier les rangées pleines
      await maybeUnlockFromFullRows();
      
      // Spawn de nouveaux symboles
      const emptyCells = emptyCells();
      for (const cell of emptyCells) {
        const type = weightedPick(WEIGHTS.deep);
        const symbol = createSymbol(type);
        if (symbol) {
          symbol.attach(cell);
          await symbol.onSpawn();
          await sleep(50);
        }
      }
      
      // Vérifier le gain maximum
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

  async function displayPanel(panelTitle, isBig) {
    setPanelData({ title: panelTitle, total: isBig });
    setShowPanel(true);
    await sleep(2000);
    setShowPanel(false);
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
        <button className="btn" onClick={(event) => { turbo = !turbo; event.target.textContent = `Turbo : ${turbo ? "ON" : "OFF"}`; toast(`Turbo ${turbo ? "activé" : "désactivé"}`); }}>Turbo : OFF</button>
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
      <style>{`
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
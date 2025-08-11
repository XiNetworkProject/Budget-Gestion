import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';

// Enregistrer le plugin GSAP PixiJS
gsap.registerPlugin(PixiPlugin);

const MoneyCartGameNew = () => {
  const canvasRef = useRef(null);
  const appRef = useRef(null);

  const [hudData, setHudData] = useState({
    respins: '0',
    rows: '4',
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
  const toast = (messageText, milliseconds = 1600) => {
    setToastMessage(messageText);
    setShowToast(true);
    setTimeout(() => setShowToast(false), milliseconds);
  };

  const sleep = (milliseconds) => new Promise(resolvePromise => setTimeout(resolvePromise, milliseconds));

  const randomNumberGenerator = {
    int: (minimumValue, maximumValue) => Math.floor(Math.random() * (maximumValue - minimumValue + 1)) + minimumValue,
    pick: (arrayOfItems) => arrayOfItems[Math.floor(Math.random() * arrayOfItems.length)]
  };

  const weightedPick = (tableOfWeights) => {
    const entriesArray = Object.entries(tableOfWeights);
    const sumOfWeights = entriesArray.reduce((accumulator, [, weightValue]) => accumulator + weightValue, 0);
    let randomValue = Math.random() * sumOfWeights;
    for (const [keyValue, weightValue] of entriesArray) {
      randomValue -= weightValue;
      if (randomValue < 0) return keyValue;
    }
    return entriesArray[0][0];
  };

  const shuffleInPlace = (arrayToShuffle) => {
    for (let index = arrayToShuffle.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [arrayToShuffle[index], arrayToShuffle[randomIndex]] = [arrayToShuffle[randomIndex], arrayToShuffle[index]];
    }
    return arrayToShuffle;
  };

  const pickNRandom = (arrayOfItems, countOfItems) => {
    const arrayCopy = arrayOfItems.slice();
    shuffleInPlace(arrayCopy);
    return arrayCopy.slice(0, Math.min(countOfItems, arrayCopy.length));
  };

  // Helpers robustesse tween/destroy
  const killTweens = (objectToKill) => {
    if (!objectToKill) return;
    try { gsap.killTweensOf(objectToKill); } catch { }
    try { if (objectToKill.scale) gsap.killTweensOf(objectToKill.scale); } catch { }
  };

  const safeDestroySymbol = (symbolToDestroy) => {
    if (!symbolToDestroy) return;
    killTweens(symbolToDestroy);
    try { symbolToDestroy.destroy({ children: true }); } catch { }
  };

  // Classe Cell
  class Cell {
    constructor(columnIndex, rowAbsoluteIndex) {
      this.col = columnIndex;
      this.row = rowAbsoluteIndex;
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
      const positionX = this.col * cellSize;
      const positionY = (this.row - activeTop) * cellSize;
      this.graphics.position.set(positionX, positionY);
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

    setHighlight(isHighlighted) {
      this.highlight.visible = isHighlighted;
    }

    isEmpty() { return !this.symbol; }
  }

  // Classe BaseSymbol
  class BaseSymbol extends PIXI.Container {
    constructor(symbolType, symbolValue = 0, isPersistent = false) {
      super();
      this.type = symbolType;
      this.value = symbolValue;
      this.persistent = isPersistent;
      this.graphics = new PIXI.Graphics();
      this.label = new PIXI.Text('', { fontSize: 14, fill: 0xffffff, fontWeight: 'bold' });
      this.addChild(this.graphics);
      this.addChild(this.label);
      this.updateGraphics();
      this.updateLabel();
    }

    attach(cellToAttach) {
      this.cell = cellToAttach;
      cellToAttach.symbol = this;
      cellToAttach.graphics.addChild(this);
      this.resize();
    }

    async onSpawn() { await popIn(this); }
    async onResolve() { }
    async onPersistent() { }

    resize() {
      this.graphics.clear();
      this.graphics.beginFill(0x2a3644);
      this.graphics.lineStyle(1, 0x4a90e2);
      this.graphics.drawRect(0, 0, cellSize, cellSize);
      this.graphics.endFill();
    }

    updateGraphics() {
      const colorValue = colorFor(this.type, this.persistent);
      this.graphics.clear();
      this.graphics.beginFill(colorValue);
      this.graphics.lineStyle(2, 0xffffff);
      this.graphics.drawRect(0, 0, cellSize, cellSize);
      this.graphics.endFill();
    }

    updateLabel() {
      this.label.text = labelFor(this);
      this.label.position.set(cellSize / 2, cellSize / 2);
      this.label.anchor.set(0.5);
    }

    async bump() {
      return new Promise((resolvePromise) => {
        const originalScaleValue = this.scale.x;
        gsap.to(this.scale, {
          x: originalScaleValue * 1.3,
          y: originalScaleValue * 1.3,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          onComplete: resolvePromise
        });
      });
    }
  }

  // Classes de symboles spécifiques
  class CoinSymbol extends BaseSymbol {
    constructor(coinValue) { super("coin", coinValue, false); }
  }

  class CollectorSymbol extends BaseSymbol {
    constructor(isPersistent = false) { super(isPersistent ? "p_collector" : "collector", 0, isPersistent); }
    
    async collectAnimated() {
      const coinsArray = symbols().filter(symbolItem => symbolItem.type === 'coin');
      for (const coinItem of coinsArray) {
        await suck(coinItem.cell, this.cell);
        coinItem.value = Math.floor(coinItem.value * 1.5);
        coinItem.updateLabel();
        updateHUD();
        await sleep(50);
      }
    }

    async onResolve() { await this.collectAnimated(); await this.bump(); }
    async onPersistent() { await this.collectAnimated(); await this.bump(); }
  }

  class PayerSymbol extends BaseSymbol {
    constructor(payerValue = 1, isPersistent = false) { super(isPersistent ? "p_payer" : "payer", payerValue, isPersistent); }
    
    async paySequential() {
      const emptyCellsArray = emptyCells();
      for (let index = 0; index < this.value && index < emptyCellsArray.length; index++) {
        const targetCell = emptyCellsArray[index];
        const newCoin = new CoinSymbol(1);
        newCoin.attach(targetCell);
        await newCoin.onSpawn();
        await sleep(100);
      }
    }

    async onResolve() { await this.paySequential(); await this.bump(); }
    async onPersistent() { await this.paySequential(); await this.bump(); }
  }

  class ComboCPSymbol extends BaseSymbol {
    constructor(isPersistent = false) { super(isPersistent ? "p_cp" : "cp", 1, isPersistent); }
    
    async run() {
      const collectorsArray = symbols().filter(symbolItem => symbolItem.type === 'collector' || symbolItem.type === 'p_collector');
      const payersArray = symbols().filter(symbolItem => symbolItem.type === 'payer' || symbolItem.type === 'p_payer');
      
      for (const collectorItem of collectorsArray) {
        await collectorItem.onResolve();
        await sleep(100);
      }
      
      for (const payerItem of payersArray) {
        await payerItem.onResolve();
        await sleep(100);
      }
    }

    async onResolve() { await this.run(); }
    async onPersistent() { await this.run(); }
  }

  class SniperSymbol extends BaseSymbol {
    constructor(isPersistent = false) { super(isPersistent ? "p_sniper" : "sniper", 0, isPersistent); }
    
    async shoot(numberOfShots = 1) {
      for (let shotIndex = 0; shotIndex < numberOfShots; shotIndex++) {
        const targetsArray = symbols().filter(symbolItem => symbolItem.type === 'coin');
        if (targetsArray.length === 0) break;
        
        const targetSymbol = randomNumberGenerator.pick(targetsArray);
        await beam(this.cell, targetSymbol.cell);
        targetSymbol.value = Math.floor(targetSymbol.value * 1.5);
        targetSymbol.updateLabel();
        updateHUD();
      }
    }

    async onResolve() { await this.shoot(1); await this.bump(); }
    async onPersistent() { await this.shoot(1); await this.bump(); }
  }

  class NecroSymbol extends BaseSymbol {
    constructor() { super("necro", 0, false); }
    
    async onResolve() {
      const deadCellsArray = cells.filter(cellItem => !cellItem.symbol && cellItem.row < activeTop);
      if (deadCellsArray.length > 0) {
        const targetCell = randomNumberGenerator.pick(deadCellsArray);
        const newCoin = new CoinSymbol(1);
        newCoin.attach(targetCell);
        await newCoin.onSpawn();
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
    
    async mutateCoins(countOfMutations = 1) {
      const coinsArray = symbols().filter(symbolItem => symbolItem.type === 'coin');
      const targetsArray = pickNRandom(coinsArray, countOfMutations);
      
      for (const coinItem of targetsArray) {
        const newType = randomNumberGenerator.pick(['collector', 'payer', 'cp']);
        const newSymbol = createSymbol(newType, true);
        if (newSymbol) {
          newSymbol.attach(coinItem.cell);
          await newSymbol.onSpawn();
        }
      }
    }

    async onResolve() { await this.mutateCoins(1); await this.bump(); }
    async onPersistent() { await this.mutateCoins(1); await this.bump(); }
  }

  class UpgraderSymbol extends BaseSymbol {
    constructor() { super("upg", 0, false); }
    
    async onResolve() {
      const upgradableArray = symbols().filter(symbolItem =>
        symbolItem.type === 'coin' && symbolItem.value > 1
      );
      
      if (upgradableArray.length > 0) {
        const targetSymbol = randomNumberGenerator.pick(upgradableArray);
        const persistentSymbol = createSymbol(targetSymbol.type, true);
        if (persistentSymbol) {
          const targetCell = randomNumberGenerator.pick(emptyCells());
          persistentSymbol.attach(targetCell);
          await persistentSymbol.onSpawn();
        }
      }
    }
  }

  class ResetPlusSymbol extends BaseSymbol {
    constructor() { super("rplus", 0, false); }
    
    async onResolve() {
      respins = Math.min(respins + 2, respinBase);
      updateHUD();
    }
  }

  // Fonctions utilitaires
  function colorFor(symbolType, isPersistent) {
    const colorsObject = {
      coin: 0xffd700,
      collector: 0x00ff00,
      payer: 0xff00ff,
      cp: 0x00ffff,
      p_collector: 0x008000,
      p_payer: 0x800080,
      sniper: 0xff0000,
      necro: 0x800000,
      unlock: 0xffff00,
      arms: 0xff8000,
      upg: 0x8000ff,
      rplus: 0xff0080
    };
    
    if (isPersistent) {
      return colorsObject[symbolType] || 0xffffff;
    }
    return colorsObject[symbolType] || 0xcccccc;
  }

  function labelFor(symbolObject) {
    const labelsObject = {
      coin: symbolObject.value > 1 ? `${symbolObject.value}×` : '1×',
      collector: 'C',
      payer: 'P',
      cp: 'CP',
      p_collector: 'PC',
      p_payer: 'PP',
      sniper: 'S',
      necro: 'N',
      unlock: 'U',
      arms: 'A',
      upg: 'U',
      rplus: 'R+'
    };
    
    return labelsObject[symbolObject.type] || symbolObject.type;
  }

  function cellCenter(cellObject) {
    return {
      x: cellObject.col * cellSize + cellSize / 2,
      y: (cellObject.row - activeTop) * cellSize + cellSize / 2
    };
  }

  function floatText(cellObject, messageText) {
    const centerPosition = cellCenter(cellObject);
    const floatingTextObject = new PIXI.Text(messageText, { fontSize: 16, fill: 0xffff00, fontWeight: 'bold' });
    floatingTextObject.anchor.set(0.5);
    floatingTextObject.position.set(centerPosition.x, centerPosition.y - 20);
    appRef.current.stage.addChild(floatingTextObject);
    
    gsap.to(floatingTextObject, {
      y: centerPosition.y - 60,
      alpha: 0,
      duration: 1.2,
      onComplete: () => {
        appRef.current.stage.removeChild(floatingTextObject);
        floatingTextObject.destroy();
      }
    });
  }

  function beam(fromCellObject, toCellObject) {
    const fromPosition = cellCenter(fromCellObject);
    const toPosition = cellCenter(toCellObject);
    
    const beamObject = new PIXI.Graphics();
    beamObject.lineStyle(3, 0x00ffff, 0.8);
    beamObject.moveTo(fromPosition.x, fromPosition.y);
    beamObject.lineTo(toPosition.x, toPosition.y);
    
    appRef.current.stage.addChild(beamObject);
    
    gsap.to(beamObject, {
      alpha: 0,
      duration: 0.3,
      onComplete: () => {
        appRef.current.stage.removeChild(beamObject);
        beamObject.destroy();
      }
    });
  }

  function suck(toCellObject, fromCellObject) {
    const fromPosition = cellCenter(fromCellObject);
    const toPosition = cellCenter(toCellObject);
    
    const suckEffectObject = new PIXI.Graphics();
    suckEffectObject.lineStyle(2, 0xff00ff, 0.6);
    suckEffectObject.moveTo(fromPosition.x, fromPosition.y);
    suckEffectObject.lineTo(toPosition.x, toPosition.y);
    
    appRef.current.stage.addChild(suckEffectObject);
    
    gsap.to(suckEffectObject, {
      alpha: 0,
      duration: 0.4,
      onComplete: () => {
        appRef.current.stage.removeChild(suckEffectObject);
        suckEffectObject.destroy();
      }
    });
  }

  function electricArc(cellAObject, cellBObject) {
    const centerA = cellCenter(cellAObject);
    const centerB = cellCenter(cellBObject);
    
    const arcObject = new PIXI.Graphics();
    arcObject.lineStyle(3, 0x00ffff, 0.8);
    
    for (let arcIndex = 0; arcIndex < 5; arcIndex++) {
      const offsetValue = (Math.random() - 0.5) * 20;
      const arcX = centerA.x + (centerB.x - centerA.x) * (arcIndex / 4) + offsetValue;
      const arcY = centerA.y + (centerB.y - centerA.y) * (arcIndex / 4) + offsetValue;
      
      if (arcIndex === 0) {
        arcObject.moveTo(arcX, arcY);
      } else {
        arcObject.lineTo(arcX, arcY);
      }
    }
    
    appRef.current.stage.addChild(arcObject);
    
    gsap.to(arcObject, {
      alpha: 0,
      duration: 0.5,
      onComplete: () => {
        appRef.current.stage.removeChild(arcObject);
        arcObject.destroy();
      }
    });
  }

  function popIn(displayObject) {
    displayObject.scale.set(0);
    gsap.to(displayObject.scale, {
      x: 1, y: 1,
      duration: 0.3,
      ease: "back.out(1.7)"
    });
  }

  function highlight(cellObject, isHighlighted) { cellObject.setHighlight(isHighlighted); }

  function screenshake(shakeAmount = 4, shakeDuration = 0.12) {
    if (!appRef.current || !appRef.current.stage) return;
    
    const originalX = appRef.current.stage.x;
    const originalY = appRef.current.stage.y;
    
    gsap.to(appRef.current.stage, {
      x: originalX + (Math.random() - 0.5) * shakeAmount,
      y: originalY + (Math.random() - 0.5) * shakeAmount,
      duration: shakeDuration,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        appRef.current.stage.position.set(originalX, originalY);
      }
    });
  }

  function spinFX(cellObject, spinDuration = 0.18) {
    const symbolObject = cellObject.symbol;
    if (!symbolObject) return;
    
    gsap.to(symbolObject, {
      rotation: symbolObject.rotation + Math.PI * 2,
      duration: spinDuration,
      ease: "power2.out"
    });
  }

  async function sweepSpinAllCellsTopDown() {
    const activeCellsArray = cells.filter(cellItem => isRowActive(cellItem.row));
    for (const cellItem of activeCellsArray) {
      if (cellItem.symbol) {
        spinFX(cellItem);
        await sleep(50);
      }
    }
  }

  const recomputeActiveBounds = () => {
    activeTop = Math.max(0, fullRowsAwarded);
    activeBottom = activeTop + ROWS - 1;
  };

  function isRowActive(absoluteRow) { return absoluteRow >= activeTop && absoluteRow <= activeBottom; }
  function relativeToAbsolute(relativeRow) { return activeTop + relativeRow; }

  function layout() {
    const stageObject = appRef.current.stage;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    const gridWidth = COLS * cellSize;
    const gridHeight = ROWS * cellSize;
    
    stageObject.position.set(centerX - gridWidth / 2, centerY - gridHeight / 2);
  }

  function rebuildGrid() {
    cells = [];
    for (let columnIndex = 0; columnIndex < COLS; columnIndex++) {
      for (let rowIndex = 0; rowIndex < MAX_ROWS; rowIndex++) {
        const newCell = new Cell(columnIndex, rowIndex);
        cells.push(newCell);
        appRef.current.stage.addChild(newCell.graphics);
      }
    }
    recomputeActiveBounds();
    layout();
  }

  function cellAtAbsolute(columnIndex, absoluteRow) { return cells.find(cellItem => cellItem.col === columnIndex && cellItem.row === absoluteRow); }
  function cellAt(columnIndex, relativeRow) { return cellAtAbsolute(columnIndex, relativeToAbsolute(relativeRow)); }

  function activeCells() {
    return cells.filter(cellItem => isRowActive(cellItem.row));
  }

  function emptyCells() { return activeCells().filter(cellItem => cellItem.isEmpty()); }
  function symbols() { return activeCells().filter(cellItem => cellItem.symbol).map(cellItem => cellItem.symbol); }
  function sumValues() { return Math.min(MAX_WIN_CAP, symbols().reduce((accumulator, symbolItem) => accumulator + (symbolItem.value || 0), 0)); }

  function isRowFullRelative(relativeRow) {
    for (let columnIndex = 0; columnIndex < COLS; columnIndex++) {
      const cellItem = cellAt(columnIndex, relativeRow);
      if (!cellItem || !cellItem.symbol) return false;
    }
    return true;
  }

  function getFullRowsRelative() {
    const fullRowsArray = [];
    for (let columnIndex = 0; columnIndex < COLS; columnIndex++) {
      for (let rowIndex = 0; rowIndex < ROWS; rowIndex++) {
        if (isRowFullRelative(rowIndex)) {
          fullRowsArray.push(rowIndex);
        }
      }
    }
    return fullRowsArray;
  }

  async function unlockRow(direction, fullRowsRelative) {
    const rowToUnlock = direction === 'up' ? Math.min(...fullRowsRelative) - 1 : Math.max(...fullRowsRelative) + 1;
    if (rowToUnlock >= 0 && rowToUnlock < MAX_ROWS) {
      ROWS++;
      fullRowsAwarded++;
      recomputeActiveBounds();
      layout();
      await sweepSpinAllCellsTopDown();
      toast(`Nouvelle rangée débloquée ! (${ROWS} total)`);
    }
  }

  async function unlockRowByRule(fullRowsRelative) {
    if (fullRowsRelative.length === 0) return;
    
    const middleRow = Math.floor(ROWS / 2);
    const closestRow = fullRowsRelative.reduce((closestItem, rowItem) =>
      Math.abs(rowItem - middleRow) < Math.abs(closestItem - middleRow) ? rowItem : closestItem
    );
    
    const direction = closestRow < middleRow ? 'up' : 'down';
    await unlockRow(direction, fullRowsRelative);
  }

  async function maybeUnlockFromFullRows() {
    const fullRowsArray = getFullRowsRelative();
    if (fullRowsArray.length > 0) {
      await unlockRowByRule(fullRowsArray);
    }
  }

  function createSymbol(symbolType, isPersistent = false) {
    const symbolClasses = {
      coin: CoinSymbol,
      collector: CollectorSymbol,
      payer: PayerSymbol,
      cp: ComboCPSymbol,
      p_collector: CollectorSymbol,
      p_payer: PayerSymbol,
      sniper: SniperSymbol,
      necro: NecroSymbol,
      unlock: UnlockSymbol,
      arms: ArmsDealerSymbol,
      upg: UpgraderSymbol,
      rplus: ResetPlusSymbol
    };
    
    const SymbolClass = symbolClasses[symbolType];
    if (SymbolClass) {
      return new SymbolClass(isPersistent);
    }
    return null;
  }

  function updateHUD() {
    setHudData({
      respins: respins.toString(),
      rows: ROWS.toString(),
      total: `${sumValues()}×`,
      bet: BASE_BET.toFixed(2),
      reset: respinBase.toString(),
      cap: `${MAX_WIN_CAP}×`
    });
  }

  function resetBoard() {
    cells.forEach(cellItem => {
      if (cellItem.symbol) {
        safeDestroySymbol(cellItem.symbol);
        cellItem.symbol = null;
      }
    });
    respins = 0;
    fullRowsAwarded = 0;
    ROWS = 4;
    recomputeActiveBounds();
    updateHUD();
  }

  async function startBonus() {
    if (playing) return;
    
    playing = true;
    respins = respinBase;
    fullRowsAwarded = 0;
    ROWS = 4;
    recomputeActiveBounds();
    
    await sweepSpinAllCellsTopDown();
    
    if (autoplay) {
      autoPlayLoop();
    }
    
    updateHUD();
    toast("Bonus lancé !");
  }

  async function autoPlayLoop() {
    while (autoplay && playing && respins > 0) {
      await spinStep();
      await sleep(turbo ? 100 : 500);
    }
  }

  async function spinStep() {
    if (isSpinning) return;
    isSpinning = true;
    
    try {
      respins--;
      updateHUD();
      
      // Vérifier les rangées pleines
      await maybeUnlockFromFullRows();
      
      // Spawn de nouveaux symboles
      const emptyCellsArray = emptyCells();
      for (const cellItem of emptyCellsArray) {
        const symbolType = weightedPick(WEIGHTS.deep);
        const newSymbol = createSymbol(symbolType);
        if (newSymbol) {
          newSymbol.attach(cellItem);
          await newSymbol.onSpawn();
          await sleep(50);
        }
      }
      
      // Vérifier le gain maximum
      const multiplier = sumValues();
      if (multiplier >= MAX_WIN_CAP) {
        await displayPanel("MAX WIN ATTEINT", `${multiplier}×`);
        playing = false;
        autoplay = false;
        return;
      } else if (multiplier >= BIG_WIN_THRESHOLD) {
        toast(`GROS GAIN : ${multiplier}×`, 1500);
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
    const totalMultiplier = sumValues();
    const totalValue = totalMultiplier * BASE_BET;
    setPanelData({
      title: "Fin du bonus",
      total: `${totalMultiplier}× (=${totalValue.toFixed(2)})`
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

export default MoneyCartGameNew;

import React, { useEffect, useRef, useState, memo } from 'react';
import * as PIXI from 'pixi.js';
import { Box, Button, Stack } from '@mui/material';

const MoneyCartPixi = memo(({ width = 720, height = 420, events = [] }) => {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const app = new PIXI.Application({ width, height, backgroundAlpha: 0, antialias: true });
    appRef.current = app;
    containerRef.current.appendChild(app.view);

    // Fond
    const bg = PIXI.Sprite.from('/images/game/bg-aurora.svg');
    bg.width = width; bg.height = height; bg.alpha = 0.5;
    app.stage.addChild(bg);

    // Grille simple
    const grid = new PIXI.Container();
    app.stage.addChild(grid);
    const cols = 4, rows = 3, cw = (width - 40) / cols, ch = (height - 40) / rows;
    const cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = 20 + c * cw;
        const y = 20 + r * ch;
        const frame = PIXI.Sprite.from('/images/game/cell-frame.svg');
        frame.width = cw - 10; frame.height = ch - 10; frame.x = x + 5; frame.y = y + 5;
        grid.addChild(frame);
        const icon = new PIXI.Sprite(); icon.anchor.set(0.5); icon.x = frame.x + frame.width/2; icon.y = frame.y + frame.height/2;
        grid.addChild(icon);
        cells.push({ frame, icon });
      }
    }

    // Animation de base de la séquence
    let step = 0; let tickerFn;
    const reveal = () => {
      if (step >= events.length) return;
      const ev = events[step];
      const idx = (rows * cols / 2 - 2) + (step % 4);
      const cell = cells[idx];
      const textureMap = {
        saver: PIXI.Texture.from('/images/game/symbol-saver.svg'),
        optimizer: PIXI.Texture.from('/images/game/symbol-optimizer.svg'),
        collector: PIXI.Texture.from('/images/game/symbol-collector.svg'),
        defender: PIXI.Texture.from('/images/game/symbol-defender.svg'),
        bonusSpin: PIXI.Texture.from('/images/game/symbol-bonus.svg')
      };
      cell.icon.texture = textureMap[ev.symbol] || PIXI.Texture.EMPTY;
      cell.icon.scale.set(0.1);
      let t = 0;
      tickerFn = (delta) => {
        t += delta * 0.08;
        const s = Math.min(1, t); cell.icon.scale.set(0.1 + s * 0.9); cell.icon.alpha = s;
        if (s >= 1) { app.ticker.remove(tickerFn); setTimeout(() => { step++; reveal(); }, 600); }
      };
      app.ticker.add(tickerFn);
    };
    reveal();

    setReady(true);
    return () => { app.destroy(true, { children: true }); };
  }, [width, height, events]);

  return (
    <Box ref={containerRef} sx={{ width, height, borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
      {!ready && <Box sx={{ position: 'absolute', inset: 0 }} />}
    </Box>
  );
});

MoneyCartPixi.displayName = 'MoneyCartPixi';

export default MoneyCartPixi;



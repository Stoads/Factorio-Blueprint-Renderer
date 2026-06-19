const RENDER = {
  bg:           '#0d1117',
  grid:         '#1a2436',
  emptyGrid:    '#141e2e',
  entityFill:   'rgba(245, 166, 35, 0.82)',
  entityBorder: '#e94560',
  tileFill:     'rgba(90, 70, 40, 0.65)',
  tileBorder:   '#5a4628',
  label:        '#1a0f00',
  emptyText:    '#2a3a5a',
  originFill:   '#00e676',
  originStroke: '#00a152',
  wireCu:       'rgba(74,  144, 217, 0.9)',
  wireRed:      'rgba(255, 55,  55,  0.9)',
  wireGreen:    'rgba(50,  210, 90,  0.9)',
};

// Draws everything onto the full-screen canvas using the current view transform.
// view = { tileSize: number, panX: number, panY: number }
function redrawBlueprint(canvas, ctx, parsed, view) {
  const W = canvas.width;
  const H = canvas.height;

  if (!parsed?.blueprint) {
    _drawEmptyState(canvas, ctx);
    return;
  }

  const bp       = parsed.blueprint;
  const entities = bp.entities ?? [];
  const tiles    = bp.tiles    ?? [];
  const { tileSize, panX, panY } = view;

  // ── Background ────────────────────────────────────────────────────────
  ctx.fillStyle = RENDER.bg;
  ctx.fillRect(0, 0, W, H);

  // ── Visible world bounds (for culling) ────────────────────────────────
  const worldLeft   = -panX / tileSize;
  const worldTop    = -panY / tileSize;
  const worldRight  = (W - panX) / tileSize;
  const worldBottom = (H - panY) / tileSize;

  // ── Grid ──────────────────────────────────────────────────────────────
  // Lines at integer world positions — entity corners always land on integers.
  if (tileSize >= 3) {
    ctx.strokeStyle = RENDER.grid;
    ctx.lineWidth   = 0.5;

    const firstVX = Math.ceil(worldLeft);
    for (let wx = firstVX; wx <= worldRight + 1; wx++) {
      const px = Math.round(wx * tileSize + panX);
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke();
    }

    const firstHY = Math.ceil(worldTop);
    for (let wy = firstHY; wy <= worldBottom + 1; wy++) {
      const py = Math.round(wy * tileSize + panY);
      ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
    }
  }

  // ── Floor tiles ───────────────────────────────────────────────────────
  for (const tile of tiles) {
    const tlx = tile.position.x - 0.5;
    const tly = tile.position.y - 0.5;
    if (tlx + 1 < worldLeft || tly + 1 < worldTop || tlx > worldRight || tly > worldBottom) continue;

    const px = Math.round(tlx * tileSize + panX);
    const py = Math.round(tly * tileSize + panY);
    const ps = Math.ceil(tileSize);

    ctx.fillStyle   = RENDER.tileFill;
    ctx.fillRect(px, py, ps, ps);
    ctx.strokeStyle = RENDER.tileBorder;
    ctx.lineWidth   = 0.5;
    ctx.strokeRect(px + 0.5, py + 0.5, ps - 1, ps - 1);
  }

  // ── Entities ──────────────────────────────────────────────────────────
  const border    = tileSize >= 24 ? 2 : 1;
  const showLabel = (view.showLabel ?? true) && tileSize >= 22;

  for (const entity of entities) {
    const [w, h] = getEntitySize(entity.name, entity.direction);
    const tlx = entity.position.x - w / 2;
    const tly = entity.position.y - h / 2;
    if (tlx + w < worldLeft || tly + h < worldTop || tlx > worldRight || tly > worldBottom) continue;

    const px = Math.round(tlx * tileSize + panX);
    const py = Math.round(tly * tileSize + panY);
    const pw = Math.round(w * tileSize);
    const ph = Math.round(h * tileSize);

    ctx.fillStyle = RENDER.entityFill;
    ctx.fillRect(px + border, py + border, pw - border * 2, ph - border * 2);

    ctx.strokeStyle = RENDER.entityBorder;
    ctx.lineWidth   = border;
    ctx.strokeRect(px + border / 2, py + border / 2, pw - border, ph - border);

    if (showLabel) {
      const text     = entity.name.replace(/-/g, ' ');
      const fontSize = Math.max(6, Math.min(tileSize * 0.18 * Math.min(w, h), 11));
      ctx.fillStyle    = RENDER.label;
      ctx.font         = `${fontSize}px 'Segoe UI', sans-serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, px + pw / 2, py + ph / 2, pw - 4);
    }
  }

  // ── Wires ─────────────────────────────────────────────────────────────
  if (view.showWires ?? true) {
    _drawWires(ctx, entities, bp.wires ?? [], view);
  }

  // ── Origin dot (only when blueprint explicitly defines one) ───────────
  const origin = bp['position-relative-to-grid'] ?? null;
  if (origin && (view.showOrigin ?? true)) {
    const ox   = origin.x * tileSize + panX;
    const oy   = origin.y * tileSize + panY;
    const dotR = Math.max(3, Math.min(tileSize * 0.25, 8));

    ctx.beginPath();
    ctx.arc(ox, oy, dotR + 1.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(ox, oy, dotR, 0, Math.PI * 2);
    ctx.fillStyle   = RENDER.originFill;
    ctx.fill();
    ctx.strokeStyle = RENDER.originStroke;
    ctx.lineWidth   = 1.5;
    ctx.stroke();
  }
}

// Draws all wire connections (copper, red circuit, green circuit) on top of entities.
// Supports both Factorio 2.0 blueprint.wires format and legacy entity.neighbours/connections.
function _drawWires(ctx, entities, wires, view) {
  const { tileSize, panX, panY } = view;
  const lineW = Math.max(1, Math.min(tileSize * 0.06, 2.5));

  const byNum = new Map();
  for (const e of entities) byNum.set(e.entity_number, e);

  const epx = (e) => e.position.x * tileSize + panX;
  const epy = (e) => e.position.y * tileSize + panY;

  const drawLine = (color, ax, ay, bx, by) => {
    ctx.strokeStyle = color;
    ctx.lineWidth   = lineW;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
  };

  // ── Factorio 2.0: blueprint.wires = [[aNum, aConn, bNum, bConn], ...] ─
  // Connector IDs: 1/3 = red circuit, 2/4 = green circuit, 5 = copper wire
  for (const [aNum, aConn, bNum] of wires) {
    const ea = byNum.get(aNum);
    const eb = byNum.get(bNum);
    if (!ea || !eb) continue;

    let color;
    if      (aConn === 5)              color = RENDER.wireCu;
    else if (aConn === 1 || aConn === 3) color = RENDER.wireRed;
    else if (aConn === 2 || aConn === 4) color = RENDER.wireGreen;
    else continue;

    drawLine(color, epx(ea), epy(ea), epx(eb), epy(eb));
  }

  // ── Legacy format: entity.neighbours (copper) + entity.connections ────
  for (const entity of entities) {
    const ex = epx(entity);
    const ey = epy(entity);

    if (entity.neighbours) {
      for (const nid of entity.neighbours) {
        if (entity.entity_number > nid) continue;
        const nb = byNum.get(nid);
        if (nb) drawLine(RENDER.wireCu, ex, ey, epx(nb), epy(nb));
      }
    }

    if (entity.connections) {
      for (const sides of Object.values(entity.connections)) {
        for (const [side, targets] of Object.entries(sides)) {
          if (side !== 'red' && side !== 'green') continue;
          const color = side === 'red' ? RENDER.wireRed : RENDER.wireGreen;
          for (const t of targets) {
            if (entity.entity_number > t.entity_id) continue;
            const target = byNum.get(t.entity_id);
            if (target) drawLine(color, ex, ey, epx(target), epy(target));
          }
        }
      }
    }
  }
}

// Draws a static placeholder when no blueprint is loaded.
function _drawEmptyState(canvas, ctx) {
  const W = canvas.width;
  const H = canvas.height;
  const T = 32;

  ctx.fillStyle = RENDER.bg;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = RENDER.emptyGrid;
  ctx.lineWidth   = 0.5;
  for (let x = 0.5; x < W; x += T) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0.5; y < H; y += T) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  ctx.fillStyle    = RENDER.emptyText;
  ctx.font         = '14px "Segoe UI", sans-serif';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('← 청사진을 불러와 렌더링하세요', W / 2, H / 2);
}

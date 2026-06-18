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
  // Lines at half-integer world positions so they align with entity corners.
  if (tileSize >= 3) {
    ctx.strokeStyle = RENDER.grid;
    ctx.lineWidth   = 0.5;

    const firstVX = Math.ceil(worldLeft - 0.5) + 0.5;
    for (let wx = firstVX; wx <= worldRight + 1; wx++) {
      const px = Math.round(wx * tileSize + panX) + 0.5;
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke();
    }

    const firstHY = Math.ceil(worldTop - 0.5) + 0.5;
    for (let wy = firstHY; wy <= worldBottom + 1; wy++) {
      const py = Math.round(wy * tileSize + panY) + 0.5;
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
  const showLabel = tileSize >= 22;

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

  // ── Origin dot (only when blueprint explicitly defines one) ───────────
  const origin = bp['position-relative-to-grid'] ?? null;
  if (origin) {
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

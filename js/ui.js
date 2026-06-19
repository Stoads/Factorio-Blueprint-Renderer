const SIDEBAR_WIDTH = 300;
const ZOOM_MIN      = 2;
const ZOOM_MAX      = 256;
const ZOOM_STEP     = 1.15;

const SAMPLE = '0eNqNUl1rwjAU/Ss3z3GQpLUtvi0wGGOoqNRQmmlLJMXkI8ke/O9LbWVz6tNezrnn3C85Q3Hp0Vg0HvIBsm8PB/LpAFmWkayTyAiWrSTJuswAVBFRFDwFM/E6EJbRb0ycPUGEVpSCkRVT8TJHb9I4s+d+SuYY4eBYLl/mBcsFWLnSk+Nd1YomP6oPyqUCSSs0bX4jLR4IZ6IYzSXy2ZXbxGNIkrMU7vd1IXtEMfzIFXi7Bm2EoWBOb0/OXMNQqGVGlbf0vQLyknKmx0DexI0XDxVdD35fOXiPLi+6TGkScBZK7HPSX8BLqKGgA==';

// ── State ──────────────────────────────────────────────────────────────
const view = { tileSize: 32, panX: 0, panY: 0, showLabel: true, showWires: true, showOrigin: true };
let currentParsed = null;
let jsonRendered   = false;
let isPanning      = false;
let panStartX      = 0;
let panStartY      = 0;
let rafId          = null;

// ── Canvas ─────────────────────────────────────────────────────────────
const canvas = document.getElementById('bpCanvas');
const ctx    = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  scheduleRedraw();
}

function scheduleRedraw() {
  if (rafId) return;
  rafId = requestAnimationFrame(() => { rafId = null; redrawBlueprint(canvas, ctx, currentParsed, view); });
}

// ── Pan ────────────────────────────────────────────────────────────────
canvas.addEventListener('mousedown', e => {
  if (e.button !== 0) return;
  isPanning = true;
  panStartX = e.clientX - view.panX;
  panStartY = e.clientY - view.panY;
  canvas.classList.add('panning');
  e.preventDefault();
});

window.addEventListener('mousemove', e => {
  if (!isPanning) return;
  view.panX = e.clientX - panStartX;
  view.panY = e.clientY - panStartY;
  scheduleRedraw();
});

window.addEventListener('mouseup', e => {
  if (e.button !== 0) return;
  isPanning = false;
  canvas.classList.remove('panning');
});

// ── Zoom ───────────────────────────────────────────────────────────────
canvas.addEventListener('wheel', e => {
  e.preventDefault();
  const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
  const rect   = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const newSize = Math.min(Math.max(view.tileSize * factor, ZOOM_MIN), ZOOM_MAX);
  const scale   = newSize / view.tileSize;
  view.panX     = mouseX - (mouseX - view.panX) * scale;
  view.panY     = mouseY - (mouseY - view.panY) * scale;
  view.tileSize = newSize;
  scheduleRedraw();
}, { passive: false });

// ── Fit to screen ──────────────────────────────────────────────────────
function fitView() {
  if (!currentParsed?.blueprint) return;

  const bp       = currentParsed.blueprint;
  const entities = bp.entities ?? [];
  const tiles    = bp.tiles    ?? [];
  if (!entities.length && !tiles.length) return;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const e of entities) {
    const [w, h] = getEntitySize(e.name, e.direction);
    const l = e.position.x - w / 2, t = e.position.y - h / 2;
    if (l     < minX) minX = l; if (t     < minY) minY = t;
    if (l + w > maxX) maxX = l + w; if (t + h > maxY) maxY = t + h;
  }
  for (const tile of tiles) {
    const l = tile.position.x - 0.5, t = tile.position.y - 0.5;
    if (l     < minX) minX = l; if (t     < minY) minY = t;
    if (l + 1 > maxX) maxX = l + 1; if (t + 1 > maxY) maxY = t + 1;
  }

  const PAD  = 2;
  minX -= PAD; minY -= PAD; maxX += PAD; maxY += PAD;

  const sidebarOpen = !document.getElementById('sidebar').classList.contains('collapsed');
  const offsetX     = sidebarOpen ? SIDEBAR_WIDTH : 0;
  const availW      = canvas.width - offsetX;
  const availH      = canvas.height;

  view.tileSize = Math.max(
    Math.min(availW * 0.9 / (maxX - minX), availH * 0.9 / (maxY - minY), 64),
    2
  );

  view.panX = offsetX + availW / 2 - (minX + maxX) / 2 * view.tileSize;
  view.panY = availH / 2           - (minY + maxY) / 2 * view.tileSize;

  scheduleRedraw();
}

// ── Sidebar ────────────────────────────────────────────────────────────
const sidebar   = document.getElementById('sidebar');
const toggleBtn = document.getElementById('sidebarToggle');

function toggleSidebar() {
  const collapsed = sidebar.classList.toggle('collapsed');
  toggleBtn.textContent = collapsed ? '▶' : '◀';
}

// ── Modal ──────────────────────────────────────────────────────────────
const modal    = document.getElementById('loadModal');
const errorBox = document.getElementById('modalError');

function openModal() {
  modal.classList.add('open');
  setTimeout(() => document.getElementById('bpInput').focus(), 50);
}

function closeModal() {
  modal.classList.remove('open');
  errorBox.style.display = 'none';
}

function confirmLoad() {
  errorBox.style.display = 'none';
  const input = document.getElementById('bpInput').value;

  let parsed;
  try {
    parsed = decodeBlueprintString(input);
  } catch (e) {
    errorBox.textContent  = '오류: ' + e.message;
    errorBox.style.display = 'block';
    return;
  }

  currentParsed = parsed;
  jsonRendered  = false;

  const info = extractInfo(parsed);
  renderInfo(info);
  renderEntityCounts(info.counts);

  // Reset JSON collapse
  const jsonDetails = document.getElementById('jsonDetails');
  jsonDetails.removeAttribute('open');
  document.getElementById('jsonPre').innerHTML = '';

  document.getElementById('bpInfo').removeAttribute('hidden');

  closeModal();
  fitView();
}

// ── JSON lazy render ───────────────────────────────────────────────────
document.getElementById('jsonDetails').addEventListener('toggle', e => {
  if (e.target.open && !jsonRendered && currentParsed) {
    renderJson(currentParsed);
    jsonRendered = true;
  }
});

// ── Wire up buttons ────────────────────────────────────────────────────
document.getElementById('optShowLabel').addEventListener('change', e => {
  view.showLabel = e.target.checked;
  scheduleRedraw();
});

document.getElementById('optShowWires').addEventListener('change', e => {
  view.showWires = e.target.checked;
  scheduleRedraw();
});

document.getElementById('optShowOrigin').addEventListener('change', e => {
  view.showOrigin = e.target.checked;
  scheduleRedraw();
});

document.getElementById('btnLoad').addEventListener('click', openModal);
document.getElementById('btnFit').addEventListener('click', fitView);
document.getElementById('btnConfirm').addEventListener('click', confirmLoad);
document.getElementById('btnModalClose').addEventListener('click', closeModal);
document.getElementById('btnModalCancel').addEventListener('click', closeModal);
document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
document.getElementById('btnSample').addEventListener('click', () => {
  document.getElementById('bpInput').value = SAMPLE;
});

modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') confirmLoad();
});

window.addEventListener('resize', resizeCanvas);

// ── Init ──────────────────────────────────────────────────────────────
resizeCanvas();

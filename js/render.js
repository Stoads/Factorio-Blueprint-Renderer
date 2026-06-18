// ── HTML escape ────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── JSON syntax highlight ──────────────────────────────────────────────
function syntaxHighlight(json) {
  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = 'j-num';
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? 'j-key' : 'j-str';
        } else if (/true|false/.test(match)) {
          cls = 'j-bool';
        } else if (/null/.test(match)) {
          cls = 'j-null';
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
}

// ── Render blueprint info card ─────────────────────────────────────────
function renderInfo(info) {
  const badge = info.type === 'blueprint'
    ? `<span class="badge badge-blueprint">Blueprint</span>`
    : info.type === 'blueprint_book'
    ? `<span class="badge badge-book">Blueprint Book</span>`
    : `<span class="badge badge-blueprint">${info.type}</span>`;

  let rows = `
    <div class="info-item"><span class="key">Type</span><span class="val">${badge}</span></div>
    <div class="info-item"><span class="key">Name</span><span class="val">${escHtml(info.label)}</span></div>
  `;

  if (info.description) {
    rows += `<div class="info-item"><span class="key">Description</span><span class="val">${escHtml(info.description)}</span></div>`;
  }

  if (info.type === 'blueprint') {
    rows += `<div class="info-item"><span class="key">Entities</span><span class="val">${info.entityCount.toLocaleString()}</span></div>`;
    if (info.tileCount > 0) {
      rows += `<div class="info-item"><span class="key">Tiles</span><span class="val">${info.tileCount.toLocaleString()}</span></div>`;
    }
    const unique = Object.keys(info.counts).length;
    rows += `<div class="info-item"><span class="key">Unique Types</span><span class="val">${unique}</span></div>`;
  }

  if (info.type === 'blueprint_book') {
    rows += `<div class="info-item"><span class="key">Blueprints in book</span><span class="val">${info.bookCount}</span></div>`;
  }

  document.getElementById('infoContent').innerHTML = rows;
}

// ── Render entity counts card ──────────────────────────────────────────
function renderEntityCounts(counts) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  const max = entries[0]?.[1] ?? 1;

  document.getElementById('entityTotal').textContent = total > 0 ? `(총 ${total.toLocaleString()}개)` : '';

  if (entries.length === 0) {
    document.getElementById('entityContent').innerHTML = '<p class="empty-state">엔티티 없음</p>';
    return;
  }

  const html = `<div class="entity-list">${
    entries.map(([name, count]) => `
      <div class="entity-row">
        <span class="entity-name" title="${escHtml(name)}">${escHtml(name)}</span>
        <div class="entity-bar-wrap"><div class="entity-bar" style="width:${Math.round(count / max * 100)}%"></div></div>
        <span class="entity-count">×${count.toLocaleString()}</span>
      </div>
    `).join('')
  }</div>`;

  document.getElementById('entityContent').innerHTML = html;
}

// ── Render raw JSON ────────────────────────────────────────────────────
function renderJson(parsed) {
  const raw = JSON.stringify(parsed, null, 2);
  document.getElementById('jsonPre').innerHTML = syntaxHighlight(raw);
}

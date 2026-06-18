// ── Factorio blueprint string decoder ──────────────────────────────────
function decodeBlueprintString(str) {
  str = str.trim();
  if (!str) throw new Error('입력이 비어 있습니다.');

  // Already JSON?
  if (str.startsWith('{') || str.startsWith('[')) {
    return JSON.parse(str);
  }

  // Blueprint string: first char is version byte ('0')
  if (str[0] !== '0') {
    throw new Error(`알 수 없는 버전 바이트: "${str[0]}" (기대값: "0")`);
  }

  const b64 = str.slice(1);
  // base64 → binary string → Uint8Array
  const binStr = atob(b64);
  const bytes = new Uint8Array(binStr.length);
  for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);

  // zlib inflate
  const inflated = pako.inflate(bytes);
  const json = new TextDecoder('utf-8').decode(inflated);
  return JSON.parse(json);
}

// ── Entity counting ────────────────────────────────────────────────────
function countEntities(bp) {
  const counts = {};

  function add(name) {
    counts[name] = (counts[name] ?? 0) + 1;
  }

  if (bp.entities) bp.entities.forEach(e => add(e.name));
  if (bp.tiles)    bp.tiles.forEach(t => add(t.name));

  return counts;
}

// ── Blueprint info extraction ──────────────────────────────────────────
function extractInfo(parsed) {
  if (parsed.blueprint) {
    const b = parsed.blueprint;
    return {
      type: 'blueprint',
      label: b.label ?? '(이름 없음)',
      description: b.description ?? null,
      version: b.version ?? null,
      entityCount: (b.entities ?? []).length,
      tileCount: (b.tiles ?? []).length,
      counts: countEntities(b),
    };
  }

  if (parsed.blueprint_book) {
    const b = parsed.blueprint_book;
    return {
      type: 'blueprint_book',
      label: b.label ?? '(이름 없음)',
      description: b.description ?? null,
      version: b.version ?? null,
      bookCount: (b.blueprints ?? []).length,
      counts: {},
    };
  }

  if (parsed.deconstruction_planner) {
    return { type: 'deconstruction_planner', label: 'Deconstruction Planner', counts: {} };
  }
  if (parsed.upgrade_planner) {
    return { type: 'upgrade_planner', label: 'Upgrade Planner', counts: {} };
  }

  return { type: 'unknown', label: 'Unknown', counts: {} };
}

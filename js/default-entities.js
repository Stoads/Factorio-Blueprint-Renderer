// Entity definition shape:
// {
//   name:     string      — Factorio internal prototype name
//   size:     { w, h }    — tile footprint at direction=0 (north)
//   category: string      — logical grouping (belt / inserter / container /
//                           furnace / production / mining / power / electric /
//                           fluid / defense / logistics / rail / circuit / tile)
// }
//
// To add a mod's entities at runtime, push into DEFAULT_ENTITIES and call
// rebuildEntityMap() to refresh the lookup.

const DEFAULT_ENTITIES = [
  // ── Belts ────────────────────────────────────────────────────────────
  { name: 'transport-belt',              size: { w: 1, h: 1 }, category: 'belt' },
  { name: 'fast-transport-belt',         size: { w: 1, h: 1 }, category: 'belt' },
  { name: 'express-transport-belt',      size: { w: 1, h: 1 }, category: 'belt' },
  { name: 'underground-belt',            size: { w: 1, h: 1 }, category: 'belt' },
  { name: 'fast-underground-belt',       size: { w: 1, h: 1 }, category: 'belt' },
  { name: 'express-underground-belt',    size: { w: 1, h: 1 }, category: 'belt' },
  { name: 'splitter',                    size: { w: 2, h: 1 }, category: 'belt' },
  { name: 'fast-splitter',               size: { w: 2, h: 1 }, category: 'belt' },
  { name: 'express-splitter',            size: { w: 2, h: 1 }, category: 'belt' },

  // ── Inserters ────────────────────────────────────────────────────────
  { name: 'burner-inserter',             size: { w: 1, h: 1 }, category: 'inserter' },
  { name: 'inserter',                    size: { w: 1, h: 1 }, category: 'inserter' },
  { name: 'long-handed-inserter',        size: { w: 1, h: 1 }, category: 'inserter' },
  { name: 'fast-inserter',               size: { w: 1, h: 1 }, category: 'inserter' },
  { name: 'filter-inserter',             size: { w: 1, h: 1 }, category: 'inserter' },
  { name: 'stack-inserter',              size: { w: 1, h: 1 }, category: 'inserter' },
  { name: 'stack-filter-inserter',       size: { w: 1, h: 1 }, category: 'inserter' },

  // ── Containers ───────────────────────────────────────────────────────
  { name: 'wooden-chest',                size: { w: 1, h: 1 }, category: 'container' },
  { name: 'iron-chest',                  size: { w: 1, h: 1 }, category: 'container' },
  { name: 'steel-chest',                 size: { w: 1, h: 1 }, category: 'container' },
  { name: 'logistic-chest-passive-provider', size: { w: 1, h: 1 }, category: 'container' },
  { name: 'logistic-chest-active-provider',  size: { w: 1, h: 1 }, category: 'container' },
  { name: 'logistic-chest-storage',      size: { w: 1, h: 1 }, category: 'container' },
  { name: 'logistic-chest-buffer',       size: { w: 1, h: 1 }, category: 'container' },
  { name: 'logistic-chest-requester',    size: { w: 1, h: 1 }, category: 'container' },
  { name: 'infinity-chest',              size: { w: 1, h: 1 }, category: 'container' },

  // ── Furnaces ─────────────────────────────────────────────────────────
  { name: 'stone-furnace',               size: { w: 2, h: 2 }, category: 'furnace' },
  { name: 'steel-furnace',               size: { w: 2, h: 2 }, category: 'furnace' },
  { name: 'electric-furnace',            size: { w: 3, h: 3 }, category: 'furnace' },

  // ── Production ───────────────────────────────────────────────────────
  { name: 'assembling-machine-1',        size: { w: 3, h: 3 }, category: 'production' },
  { name: 'assembling-machine-2',        size: { w: 3, h: 3 }, category: 'production' },
  { name: 'assembling-machine-3',        size: { w: 3, h: 3 }, category: 'production' },
  { name: 'chemical-plant',              size: { w: 3, h: 3 }, category: 'production' },
  { name: 'oil-refinery',                size: { w: 5, h: 5 }, category: 'production' },
  { name: 'centrifuge',                  size: { w: 3, h: 3 }, category: 'production' },
  { name: 'lab',                         size: { w: 3, h: 3 }, category: 'production' },
  { name: 'rocket-silo',                 size: { w: 9, h: 9 }, category: 'production' },
  { name: 'beacon',                      size: { w: 3, h: 3 }, category: 'production' },

  // ── Mining ───────────────────────────────────────────────────────────
  { name: 'burner-mining-drill',         size: { w: 2, h: 2 }, category: 'mining' },
  { name: 'electric-mining-drill',       size: { w: 3, h: 3 }, category: 'mining' },
  { name: 'pumpjack',                    size: { w: 3, h: 3 }, category: 'mining' },

  // ── Power ────────────────────────────────────────────────────────────
  { name: 'boiler',                      size: { w: 3, h: 2 }, category: 'power' },
  { name: 'steam-engine',                size: { w: 3, h: 5 }, category: 'power' },
  { name: 'steam-turbine',               size: { w: 3, h: 5 }, category: 'power' },
  { name: 'solar-panel',                 size: { w: 3, h: 3 }, category: 'power' },
  { name: 'accumulator',                 size: { w: 2, h: 2 }, category: 'power' },
  { name: 'nuclear-reactor',             size: { w: 5, h: 5 }, category: 'power' },
  { name: 'heat-exchanger',              size: { w: 3, h: 2 }, category: 'power' },
  { name: 'heat-pipe',                   size: { w: 1, h: 1 }, category: 'power' },

  // ── Electric poles ───────────────────────────────────────────────────
  { name: 'small-electric-pole',         size: { w: 1, h: 1 }, category: 'electric' },
  { name: 'medium-electric-pole',        size: { w: 1, h: 1 }, category: 'electric' },
  { name: 'big-electric-pole',           size: { w: 2, h: 2 }, category: 'electric' },
  { name: 'substation',                  size: { w: 2, h: 2 }, category: 'electric' },

  // ── Fluid ────────────────────────────────────────────────────────────
  { name: 'pipe',                        size: { w: 1, h: 1 }, category: 'fluid' },
  { name: 'pipe-to-ground',              size: { w: 1, h: 1 }, category: 'fluid' },
  { name: 'pump',                        size: { w: 1, h: 2 }, category: 'fluid' },
  { name: 'storage-tank',                size: { w: 3, h: 3 }, category: 'fluid' },
  { name: 'offshore-pump',               size: { w: 1, h: 2 }, category: 'fluid' },

  // ── Defense ──────────────────────────────────────────────────────────
  { name: 'stone-wall',                  size: { w: 1, h: 1 }, category: 'defense' },
  { name: 'gate',                        size: { w: 1, h: 1 }, category: 'defense' },
  { name: 'land-mine',                   size: { w: 1, h: 1 }, category: 'defense' },
  { name: 'gun-turret',                  size: { w: 2, h: 2 }, category: 'defense' },
  { name: 'laser-turret',                size: { w: 2, h: 2 }, category: 'defense' },
  { name: 'flamethrower-turret',         size: { w: 2, h: 3 }, category: 'defense' },
  { name: 'artillery-turret',            size: { w: 4, h: 4 }, category: 'defense' },

  // ── Logistics ────────────────────────────────────────────────────────
  { name: 'radar',                       size: { w: 3, h: 3 }, category: 'logistics' },
  { name: 'roboport',                    size: { w: 4, h: 4 }, category: 'logistics' },

  // ── Rail ─────────────────────────────────────────────────────────────
  { name: 'straight-rail',               size: { w: 2, h: 2 }, category: 'rail' },
  { name: 'curved-rail',                 size: { w: 8, h: 8 }, category: 'rail' },
  { name: 'train-stop',                  size: { w: 2, h: 2 }, category: 'rail' },
  { name: 'rail-signal',                 size: { w: 1, h: 1 }, category: 'rail' },
  { name: 'rail-chain-signal',           size: { w: 1, h: 1 }, category: 'rail' },
  { name: 'locomotive',                  size: { w: 2, h: 6 }, category: 'rail' },
  { name: 'cargo-wagon',                 size: { w: 2, h: 6 }, category: 'rail' },
  { name: 'fluid-wagon',                 size: { w: 2, h: 6 }, category: 'rail' },
  { name: 'artillery-wagon',             size: { w: 2, h: 6 }, category: 'rail' },

  // ── Circuit / signals ────────────────────────────────────────────────
  { name: 'arithmetic-combinator',       size: { w: 1, h: 1 }, category: 'circuit' },
  { name: 'decider-combinator',          size: { w: 1, h: 1 }, category: 'circuit' },
  { name: 'constant-combinator',         size: { w: 1, h: 1 }, category: 'circuit' },
  { name: 'power-switch',                size: { w: 2, h: 2 }, category: 'circuit' },
  { name: 'programmable-speaker',        size: { w: 1, h: 1 }, category: 'circuit' },
  { name: 'lamp',                        size: { w: 1, h: 1 }, category: 'circuit' },

  // ── Tiles (floor) ────────────────────────────────────────────────────
  { name: 'concrete',                    size: { w: 1, h: 1 }, category: 'tile' },
  { name: 'refined-concrete',            size: { w: 1, h: 1 }, category: 'tile' },
  { name: 'hazard-concrete-left',        size: { w: 1, h: 1 }, category: 'tile' },
  { name: 'hazard-concrete-right',       size: { w: 1, h: 1 }, category: 'tile' },
  { name: 'refined-hazard-concrete-left',  size: { w: 1, h: 1 }, category: 'tile' },
  { name: 'refined-hazard-concrete-right', size: { w: 1, h: 1 }, category: 'tile' },
  { name: 'stone-path',                  size: { w: 1, h: 1 }, category: 'tile' },
  { name: 'landfill',                    size: { w: 1, h: 1 }, category: 'tile' },
];

// ── Lookup map (rebuilt on demand) ───────────────────────────────────────
let _entityMap = null;

function _buildMap() {
  _entityMap = new Map(DEFAULT_ENTITIES.map(e => [e.name, e]));
}

// Call this after pushing custom/mod entities into DEFAULT_ENTITIES.
function rebuildEntityMap() {
  _buildMap();
}

// Returns the full entity definition object.
// Falls back to a minimal 1×1 unknown definition if the name isn't registered.
function getEntityDef(name) {
  if (!_entityMap) _buildMap();
  return _entityMap.get(name) ?? { name, size: { w: 1, h: 1 }, category: 'unknown' };
}

// Convenience wrapper kept for renderer / other callers.
// Returns [width, height] in tiles, swapping dimensions for east/west rotation.
function getEntitySize(name, direction = 0) {
  const { size: { w, h } } = getEntityDef(name);
  if (w !== h && (direction === 2 || direction === 6)) return [h, w];
  return [w, h];
}

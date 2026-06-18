// [width, height] in tiles at direction=0 (north/default orientation).
// For non-square entities, direction 2 (east) or 6 (west) swaps width and height.
const ENTITY_SIZES = {
  // Transport belts & logistics
  'transport-belt':              [1, 1],
  'fast-transport-belt':         [1, 1],
  'express-transport-belt':      [1, 1],
  'underground-belt':            [1, 1],
  'fast-underground-belt':       [1, 1],
  'express-underground-belt':    [1, 1],
  'splitter':                    [2, 1],
  'fast-splitter':               [2, 1],
  'express-splitter':            [2, 1],
  // Inserters
  'burner-inserter':             [1, 1],
  'inserter':                    [1, 1],
  'long-handed-inserter':        [1, 1],
  'fast-inserter':               [1, 1],
  'filter-inserter':             [1, 1],
  'stack-inserter':              [1, 1],
  'stack-filter-inserter':       [1, 1],
  // Containers
  'wooden-chest':                [1, 1],
  'iron-chest':                  [1, 1],
  'steel-chest':                 [1, 1],
  'logistic-chest-passive-provider': [1, 1],
  'logistic-chest-active-provider':  [1, 1],
  'logistic-chest-storage':      [1, 1],
  'logistic-chest-buffer':       [1, 1],
  'logistic-chest-requester':    [1, 1],
  'infinity-chest':              [1, 1],
  // Furnaces
  'stone-furnace':               [2, 2],
  'steel-furnace':               [2, 2],
  'electric-furnace':            [3, 3],
  // Assembling
  'assembling-machine-1':        [3, 3],
  'assembling-machine-2':        [3, 3],
  'assembling-machine-3':        [3, 3],
  'chemical-plant':              [3, 3],
  'oil-refinery':                [5, 5],
  'centrifuge':                  [3, 3],
  'lab':                         [3, 3],
  // Mining
  'burner-mining-drill':         [2, 2],
  'electric-mining-drill':       [3, 3],
  // Power generation
  'boiler':                      [3, 2],
  'steam-engine':                [3, 5],
  'steam-turbine':               [3, 5],
  'solar-panel':                 [3, 3],
  'accumulator':                 [2, 2],
  'nuclear-reactor':             [5, 5],
  'heat-exchanger':              [3, 2],
  'heat-pipe':                   [1, 1],
  // Electric poles
  'small-electric-pole':         [1, 1],
  'medium-electric-pole':        [1, 1],
  'big-electric-pole':           [2, 2],
  'substation':                  [2, 2],
  // Pipes & fluids
  'pipe':                        [1, 1],
  'pipe-to-ground':              [1, 1],
  'pump':                        [1, 2],
  'storage-tank':                [3, 3],
  'pumpjack':                    [3, 3],
  'offshore-pump':               [1, 2],
  // Defense
  'stone-wall':                  [1, 1],
  'gate':                        [1, 1],
  'gun-turret':                  [2, 2],
  'laser-turret':                [2, 2],
  'flamethrower-turret':         [2, 3],
  'artillery-turret':            [4, 4],
  'land-mine':                   [1, 1],
  // Logistics / trains
  'radar':                       [3, 3],
  'roboport':                    [4, 4],
  'straight-rail':               [2, 2],
  'curved-rail':                 [8, 8],
  'train-stop':                  [2, 2],
  'rail-signal':                 [1, 1],
  'rail-chain-signal':           [1, 1],
  'locomotive':                  [2, 6],
  'cargo-wagon':                 [2, 6],
  'fluid-wagon':                 [2, 6],
  'artillery-wagon':             [2, 6],
  // Misc
  'beacon':                      [3, 3],
  'rocket-silo':                 [9, 9],
  'programmable-speaker':        [1, 1],
  'arithmetic-combinator':       [1, 1],
  'decider-combinator':          [1, 1],
  'constant-combinator':         [1, 1],
  'power-switch':                [2, 2],
  'lamp':                        [1, 1],
};

const DEFAULT_ENTITY_SIZE = [1, 1];

// Returns [width, height] in tiles for a given entity name and direction.
// Direction: 0=north, 2=east, 4=south, 6=west (Factorio uses multiples of 2).
function getEntitySize(name, direction = 0) {
  const [w, h] = ENTITY_SIZES[name] ?? DEFAULT_ENTITY_SIZE;
  // Swap dimensions for east/west rotation of non-square entities
  if (w !== h && (direction === 2 || direction === 6)) {
    return [h, w];
  }
  return [w, h];
}

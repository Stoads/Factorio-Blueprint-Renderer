# Factorio Blueprint Renderer

Toy project for Factorio engineers who can't play right now but still want to design blueprints.

Developed with Claude-Code Agent.

---

## Tasks

### ✅ Done

- **Blueprint string parsing** — decode base64 + zlib compressed blueprint strings; accept raw JSON as well
- **Blueprint simple rendering** — full-screen canvas with pan / zoom; entities drawn as yellow boxes with red borders; sidebar shows blueprint info and entity counts; JSON viewer (lazy)
- **Rendering options** — toggles in sidebar: entity name label, wire display (copper/red/green), origin point; supports both Factorio 2.0 `blueprint.wires` and legacy `entity.connections` / `entity.neighbours` formats

### 🔲 Up Next

- **Entity appearance customize** — per-entity or per-category fill colors instead of a single yellow; lay groundwork for sprite-based rendering later
- **Belt direction** — render transport belts with directional arrows based on the `direction` field
- **Inserter direction** — render inserters with an arrow indicating pickup / drop orientation
- **Entity placement & removal** — click to place entities on the canvas and remove existing ones; forms the foundation for in-browser blueprint editing and re-encoding to blueprint string
- **Mod entity support** — allow uploading a custom entity definition file (JSON) to register mod entities with their sizes and categories, merged on top of `default-entities.js`

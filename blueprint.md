# Factorio Blueprint Format Reference

> 이 문서는 이 프로젝트를 작업하며 직접 확인한 데이터와 공식 위키에서 수집한 정보를 정리한 것.  
> 확인되지 않은 항목은 ⚠️ 표시. 추가 정보를 찾으면 이 파일에 업데이트할 것.

---

## 1. Blueprint String 인코딩

```
blueprint_string = "0" + base64(zlib_deflate(JSON))
```

- 첫 글자 `"0"` = 버전 바이트 (무조건 슬라이스 후 처리)
- 나머지 = Base64 디코딩 후 zlib inflate (pako 라이브러리 사용)
- 결과는 UTF-8 JSON 문자열

---

## 2. 최상위 JSON 구조

### Blueprint (단일)
```json
{
  "blueprint": {
    "label": "string",
    "description": "string",
    "icons": [...],
    "entities": [...],
    "tiles": [...],
    "wires": [...],
    "position-relative-to-grid": { "x": 0, "y": 0 },
    "item": "blueprint",
    "version": 562949958139904
  }
}
```

### Blueprint Book
```json
{
  "blueprint_book": {
    "label": "string",
    "blueprints": [
      { "index": 0, "blueprint": { ... } },
      ...
    ],
    "item": "blueprint-book",
    "version": ...
  }
}
```

---

## 3. Entity 구조

```json
{
  "entity_number": 1,
  "name": "assembling-machine-2",
  "position": { "x": -25.5, "y": 25.5 },
  "direction": 0,
  "type": "input",
  "recipe": "advanced-circuit",
  "recipe_quality": "normal",
  "neighbours": [2, 5],
  "connections": { ... },
  "output_priority": "right",
  "input_priority": "left"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `entity_number` | int | 블루프린트 내 고유 식별자 (1-based) |
| `name` | string | 엔티티 내부 이름 (kebab-case) |
| `position` | `{x, y}` | 엔티티 **중심** 좌표 (월드 좌표계) |
| `direction` | int | 방향 (아래 섹션 참고) |
| `type` | string | 언더그라운드 벨트: `"input"` / `"output"` |
| `recipe` | string | 조립기 레시피 이름 |
| `recipe_quality` | string | `"normal"` / `"uncommon"` 등 (2.0+) |
| `neighbours` | int[] | 구리선으로 연결된 entity_number 목록 (레거시 포맷) |
| `connections` | object | 회로 연결 (레거시 포맷, 아래 참고) |
| `output_priority` | string | 스플리터: `"left"` / `"right"` |
| `input_priority` | string | 스플리터: `"left"` / `"right"` |

---

## 4. 좌표계

- 월드 좌표 원점 (0, 0)은 블루프린트 기준점
- **position은 엔티티의 기하학적 중심**
- 1×1 엔티티 → 중심이 반정수 (예: 0.5, 1.5, -0.5)
- 2×2 엔티티 → 중심이 정수 (예: 1.0, 2.0)
- 3×3 엔티티 → 중심이 반정수 (예: 1.5, 2.5)
- **결과적으로 모든 엔티티 모서리는 정수 좌표에 위치** → 그리드는 정수 위치에 그려야 정렬됨

```
tlx = entity.position.x - width / 2   // 항상 정수
tly = entity.position.y - height / 2  // 항상 정수
```

### Tile 좌표

타일 position은 타일의 **중심** 좌표 (엔티티와 동일 방식):
```
tile_top_left_x = tile.position.x - 0.5
tile_top_left_y = tile.position.y - 0.5
```

⚠️ 일부 포맷에서는 타일 position이 top-left일 수 있음. 실제 데이터 확인 필요.

---

## 5. 방향 (Direction)

### Factorio 2.0+ (16방향 시스템)

| 값 | 방향 |
|----|------|
| 0  | North (위, 기본) |
| 2  | Northeast |
| 4  | East (오른쪽) |
| 6  | Southeast |
| 8  | South (아래) |
| 10 | Southwest |
| 12 | West (왼쪽) |
| 14 | Northwest |

### Factorio 1.x (8방향 시스템)

| 값 | 방향 |
|----|------|
| 0  | North |
| 2  | East |
| 4  | South |
| 6  | West |

### 크기 회전 규칙

직사각형 엔티티(w ≠ h)의 경우 East/West 방향에서 w, h를 교환:
- **2.0+ 포맷**: direction === 4 또는 12일 때 swap ⚠️ (미확인, 현재 코드는 2/6 기준)
- **1.x 포맷**: direction === 2 또는 6일 때 swap

---

## 6. 전선 (Wires)

### Factorio 2.0+ 포맷 — `blueprint.wires`

```json
"wires": [
  [entity_a_number, connector_a, entity_b_number, connector_b],
  ...
]
```

**커넥터 ID**:

| 값 | 의미 |
|----|------|
| 1  | 회로 커넥터 1번, 빨간 전선 |
| 2  | 회로 커넥터 1번, 초록 전선 |
| 3  | 회로 커넥터 2번, 빨간 전선 |
| 4  | 회로 커넥터 2번, 초록 전선 |
| 5  | 구리 전선 (전력망) |

⚠️ 커넥터 1~4의 정확한 색상 매핑은 추가 데이터로 검증 필요.

**실제 확인된 예시** (2025-06-19):
- `medium-electric-pole` 간 연결: `[A, 5, B, 5]` → 구리 전선 ✓

### 레거시 포맷 (Factorio 1.x)

#### 구리 전선: `entity.neighbours`
```json
"neighbours": [2, 5, 7]
```
전신주에만 존재. entity_number 배열.

#### 회로 전선: `entity.connections`
```json
{
  "1": {
    "red":   [{ "entity_id": 2, "circuit_id": 1 }],
    "green": [{ "entity_id": 3 }]
  },
  "2": { ... }
}
```
키 `"1"` / `"2"` = 커넥터 포인트. `entity_id`는 entity_number.

---

## 7. Icons

```json
"icons": [
  { "signal": { "name": "advanced-circuit" }, "index": 1 },
  { "signal": { "name": "iron-plate", "type": "item" }, "index": 2 }
]
```

- `index`: 1~4 (블루프린트 아이콘 슬롯)
- `signal.type`: `"item"` (기본), `"fluid"`, `"virtual"` 등
- `signal.name`: 내부 아이템명

---

## 8. 알려진 엔티티 크기

| 엔티티 | 크기 (w×h) | 비고 |
|--------|-----------|------|
| `transport-belt` 계열 | 1×1 | |
| `underground-belt` 계열 | 1×1 | |
| `splitter` 계열 | 2×1 | 방향에 따라 1×2 |
| `fast-splitter` | 2×1 | 방향에 따라 1×2 |
| `inserter` 계열 | 1×1 | |
| `long-handed-inserter` | 1×1 | |
| `fast-inserter` | 1×1 | |
| `assembling-machine-2` | 3×3 | |
| `medium-electric-pole` | 1×1 | |
| `small-electric-pole` | 1×1 | |

전체 목록은 `js/default-entities.js` 참조.

---

## 9. 버전 번호

`version` 필드는 Factorio 게임 버전을 인코딩한 정수:
```
version = major << 48 | minor << 32 | patch << 16 | build
```

예: `562949958139904` = 2.0.19.0 ⚠️ (정확한 디코딩 공식 미확인)

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2025-06-19 | 초안 작성 — 2.0 wires 포맷, 좌표계, 방향 정리 |

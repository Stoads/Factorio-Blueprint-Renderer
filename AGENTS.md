# Factorio Blueprint Renderer — Agent Instructions

## 프로젝트 개요

Factorio 블루프린트 문자열을 디코딩하여 캔버스에 렌더링하는 정적 웹 앱.

- **스택**: Vanilla JS, HTML5 Canvas, pako (zlib)
- **파일 구조**:
  - `index.html` — 전체 UI (사이드바, 모달, 캔버스)
  - `css/style.css` — 스타일 (CSS 변수 기반)
  - `js/blueprint.js` — 블루프린트 문자열 파싱/디코딩
  - `js/render.js` — 사이드바 정보 렌더링 (DOM)
  - `js/renderer.js` — 캔버스 렌더링 (그리드, 엔티티, 전선)
  - `js/ui.js` — 상태 관리, 이벤트, pan/zoom
  - `js/default-entities.js` — 엔티티 크기/카테고리 정의
  - `blueprint.md` — Factorio 블루프린트 포맷 레퍼런스 **(먼저 읽을 것)**

---

## Factorio 블루프린트 포맷 관련 작업 시 규칙

### 1. `blueprint.md` 를 먼저 참조

블루프린트 JSON 구조, 좌표계, 전선 포맷, 방향 인코딩 등에 대한 질문은  
**반드시 `blueprint.md`를 먼저 읽고** 해당 파일에 정보가 있으면 그것을 사용한다.

### 2. 위키 검색은 `blueprint.md`에 없을 때만

`blueprint.md`에서 원하는 정보를 찾지 못한 경우에만 공식 위키를 참조:
- Factorio Wiki: https://wiki.factorio.com/Blueprint_string_format

### 3. 위키에서 찾은 정보는 `blueprint.md`에 기록

위키 또는 실제 블루프린트 데이터에서 새로운 정보를 확인했다면  
**즉시 `blueprint.md`에 추가**하고 변경 이력 테이블을 업데이트한다.

기록할 때 확인되지 않은 정보는 `⚠️`를 붙이고,  
실제 데이터로 검증된 정보는 `✓`를 붙인다.

---

## 렌더링 구조 핵심 규칙

### 레이어 순서 (renderer.js)
1. 배경
2. 그리드
3. 타일 (floor tiles)
4. 엔티티
5. **전선** (항상 엔티티 위)
6. 원점 dot

### 좌표 변환
```js
// 월드 → 캔버스 픽셀
px = Math.round(worldX * tileSize + panX)
py = Math.round(worldY * tileSize + panY)
```

### 그리드 정렬
그리드는 **정수 월드 좌표**에 그린다 (반정수 아님).  
이유: 모든 엔티티 모서리는 정수 좌표에 위치하기 때문.

### view 객체
```js
const view = {
  tileSize: 32,    // 타일당 픽셀 수 (줌 레벨)
  panX: 0,         // 캔버스 x 오프셋
  panY: 0,         // 캔버스 y 오프셋
  showLabel: true, // 엔티티 이름 표시
  showWires: true, // 전선 표시
};
```

---

## 전선 렌더링 (현재 구현)

`_drawWires(ctx, entities, wires, view)` — `renderer.js`

- **2.0+ 포맷**: `bp.wires` 배열 처리 (커넥터 5=구리, 1/3=빨강, 2/4=초록)
- **레거시 포맷**: `entity.neighbours` (구리) + `entity.connections` (회로)
- 양쪽 포맷 동시 지원

---

## 엔티티 크기 등록

새 엔티티 크기를 추가할 때는 `js/default-entities.js`의 `DEFAULT_ENTITIES` 배열에 추가:

```js
{ name: 'entity-name', size: { w: 1, h: 1 }, category: 'belt' }
```

카테고리 목록: `belt`, `inserter`, `machine`, `pole`, `logistics`, `unknown`

---

## 렌더링 옵션 토글 추가 패턴

1. `view` 객체에 `showXxx: true` 추가 (`ui.js`)
2. `redrawBlueprint`에서 `view.showXxx ?? true` 조건으로 호출 (`renderer.js`)
3. `<label class="option-row">` + `<input type="checkbox" id="optShowXxx">` 추가 (`index.html`)
4. 이벤트 리스너 추가 (`ui.js`)

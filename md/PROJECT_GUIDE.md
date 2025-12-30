# Statistics Visualization 프로젝트 가이드

## 1. 프로젝트 개요

통계 시각화 라이브러리로, 히스토그램, 도수분포표, 산점도 등의 차트를 Canvas 기반으로 렌더링합니다.

### 주요 기능
- **히스토그램/막대그래프**: 도수분포 시각화
- **도수분포표**: 계급, 도수, 상대도수, 누적도수 표시
- **산점도**: 2차원 데이터 시각화, 회귀선, 강조점

---

## 2. 프로젝트 구조

```
statistics/
├── js/                              # 소스 코드
│   ├── viz-api.js                   # 외부 API 진입점
│   ├── config.js                    # 전역 설정 (색상, 폰트, 크기 등)
│   ├── app.js                       # 앱 초기화 (app.html용)
│   │
│   ├── core/                        # 핵심 로직
│   │   ├── processor.js             # 데이터 처리 (통계 계산, 계급 생성)
│   │   ├── chartStore.js            # 차트 상태 관리
│   │   ├── tableStore.js            # 표 상태 관리
│   │   ├── datasetStore.js          # 데이터셋 관리
│   │   ├── dataStore.js             # 공통 데이터 스토어
│   │   ├── parsers/                 # 입력 파서
│   │   │   ├── index.js             # 파서 모듈 진입점
│   │   │   ├── ParserAdapter.js     # 파서 어댑터
│   │   │   ├── BasicTableParser.js  # 기본 테이블 파서
│   │   │   ├── StemLeafParser.js    # 줄기-잎 그림 파서
│   │   │   ├── CategoryMatrixParser.js # 범주형 매트릭스 파서
│   │   │   └── FrequencyParser.js   # 도수분포 파서
│   │   └── serializer/              # 직렬화
│   │       ├── index.js             # 직렬화 모듈 진입점
│   │       ├── DataExporter.js      # 데이터 내보내기
│   │       └── DataImporter.js      # 데이터 가져오기
│   │
│   ├── renderers/                   # 렌더러 (Canvas 그리기)
│   │   ├── chart.js                 # 히스토그램 렌더러
│   │   ├── table.js                 # 도수분포표 렌더러
│   │   ├── scatter.js               # 산점도 렌더러
│   │   ├── ui.js                    # UI 컴포넌트 렌더러
│   │   ├── chart/                   # 차트 하위 렌더러
│   │   │   ├── AxisRenderer.js      # 축 렌더러
│   │   │   ├── HistogramRenderer.js # 막대 렌더러
│   │   │   ├── PolygonRenderer.js   # 도수다각형 렌더러
│   │   │   ├── CalloutRenderer.js   # 콜아웃(말풍선) 렌더러
│   │   │   ├── CurveRenderer.js     # 분포곡선 렌더러
│   │   │   ├── TriangleRenderer.js  # 합동삼각형 렌더러
│   │   │   ├── DashedLineRenderer.js # 파선 렌더러
│   │   │   ├── CoordinateSystem.js  # 좌표계
│   │   │   └── LayerFactory.js      # 레이어 팩토리
│   │   └── table/                   # 표 하위 렌더러
│   │       ├── TableCellRenderer.js # 셀 렌더러
│   │       ├── TableLayerFactory.js # 레이어 팩토리
│   │       ├── TableEditModal.js    # 편집 모달
│   │       └── factories/           # 테이블 팩토리
│   │           ├── index.js         # 팩토리 모듈 진입점
│   │           ├── BaseTableFactory.js     # 기본 팩토리 클래스
│   │           ├── BasicTableFactory.js    # 기본 테이블 팩토리
│   │           ├── StemLeafFactory.js      # 줄기-잎 팩토리
│   │           └── CategoryMatrixFactory.js # 범주형 매트릭스 팩토리
│   │
│   ├── utils/                       # 유틸리티
│   │   ├── utils.js                 # 공통 유틸리티 함수
│   │   ├── katex.js                 # KaTeX 폰트 렌더링
│   │   ├── corruption.js            # 손글씨/찢김 효과
│   │   ├── validator.js             # 설정 검증
│   │   └── message.js               # 메시지 유틸
│   │
│   ├── animation/                   # 애니메이션 시스템
│   │   ├── index.js                 # 애니메이션 모듈 진입점
│   │   ├── timeline/                # 타임라인 관리
│   │   │   ├── index.js
│   │   │   ├── timeline.controller.js  # 타임라인 컨트롤러
│   │   │   ├── timeline.service.js     # 타임라인 서비스
│   │   │   ├── timeline.dto.js         # 타임라인 DTO
│   │   │   └── timeline.utils.js       # 타임라인 유틸
│   │   ├── layer/                   # 레이어 시스템
│   │   │   ├── index.js
│   │   │   ├── layer.controller.js     # 레이어 컨트롤러
│   │   │   ├── layer.service.js        # 레이어 서비스
│   │   │   ├── layer.dto.js            # 레이어 DTO
│   │   │   └── layer.utils.js          # 레이어 유틸
│   │   └── effects/                 # 애니메이션 효과
│   │       ├── index.js
│   │       ├── animation-index.js      # 애니메이션 인덱스
│   │       ├── animation.controller.js # 애니메이션 컨트롤러
│   │       ├── animation.service.js    # 애니메이션 서비스
│   │       ├── fade.js                 # 페이드 효과
│   │       ├── slide.js                # 슬라이드 효과
│   │       ├── scale.js                # 스케일 효과
│   │       ├── draw.js                 # 드로우 효과
│   │       └── blink.js                # 깜빡임 효과
│   │
│   └── controllers/                 # UI 컨트롤러 (app.html용)
│       ├── index.js                 # 컨트롤러 모듈 진입점
│       ├── GenerationController.js  # 생성 컨트롤러
│       ├── DatasetController.js     # 데이터셋 컨트롤러
│       ├── ChartSettingsController.js # 차트 설정 컨트롤러
│       ├── TableConfigController.js # 테이블 설정 컨트롤러
│       ├── LayerPanelController.js  # 레이어 패널 컨트롤러
│       └── AnimationController.js   # 애니메이션 컨트롤러
│
├── dist/                            # 빌드 출력물
│   ├── viz-api.js                   # UMD 번들
│   ├── viz-api.esm.js               # ES Module 번들
│   └── *.map                        # 소스맵
│
├── schema/
│   └── viz-api.schema.json          # 설정 스키마
│
├── build-helper/                    # 빌드 도구
│   ├── rollup.config.js
│   ├── rollup.config.api.js
│   ├── zip-bundle.js
│   └── bundles/                     # 버전별 빌드 아카이브
│
├── test/                            # 테스트 페이지
├── md/                              # 문서
│
├── index.html                       # 랜딩 페이지
├── app.html                         # 차트 생성기 앱
├── validator.html                   # 설정 검증 도구
├── styles.css                       # 전역 스타일
├── package.json
└── .github/workflows/
    └── deploy.yml                   # GitHub Pages 배포
```

### 디렉토리 요약

| 디렉토리 | 역할 |
|----------|------|
| `js/core/` | 데이터 처리, 상태 관리, 파싱, 직렬화 등 핵심 비즈니스 로직 |
| `js/renderers/` | Canvas 기반 시각화 렌더링 (차트, 테이블, 산점도) |
| `js/animation/` | 타임라인, 레이어, 효과 기반 애니메이션 시스템 |
| `js/utils/` | KaTeX 폰트, 검증, 공통 유틸리티 함수 |
| `js/controllers/` | app.html UI 컨트롤러 (생성기 전용) |
| `dist/` | Rollup 빌드 결과물 (UMD + ESM) |
| `schema/` | 설정 JSON 스키마 (검증용) |
| `build-helper/` | 빌드 스크립트 및 설정 |

---

## 3. 빌드 시스템

### 3.1 의존성 설치

```bash
npm install
```

### 3.2 빌드 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run build` | 기본 빌드 (rollup.config.js) |
| `npm run build:api` | API 번들 빌드 → `dist/` |
| `npm run build:watch` | 변경 감지 자동 빌드 |
| `npm run zip` | 배포용 ZIP 생성 |

### 3.3 빌드 출력물

```
dist/
├── viz-api.js           # UMD 포맷 (script 태그용)
├── viz-api.esm.js       # ES Module 포맷 (import용)
└── *.js.map             # 소스맵 (디버깅용)
```

### 3.4 Rollup 설정

`build-helper/rollup.config.api.js`:
- **입력**: `js/viz-api.js`
- **출력**: UMD + ESM 두 가지 포맷
- **플러그인**: `@rollup/plugin-node-resolve`

---

## 4. 개발 서버

별도의 개발 서버 설정 없이 정적 파일 서버 사용:

```bash
# npx serve 사용 (권장)
npx serve

# 또는 Python
python -m http.server 3000
```

기본 포트: `http://localhost:3000`

---

## 5. 배포

### 5.1 GitHub Pages (자동)

`.github/workflows/deploy.yml`에 의해 `main` 브랜치 푸시 시 자동 배포됩니다.

- 전체 프로젝트 루트가 배포됨
- 빌드 과정 없이 정적 파일 직접 서빙

---

## 6. API 사용법

### 6.1 스크립트 로드

```html
<!-- UMD 방식 -->
<script src="dist/viz-api.js"></script>

<!-- ES Module 방식 -->
<script type="module">
  import { render, renderChart, renderTable, renderScatter } from './dist/viz-api.esm.js';
</script>
```

### 6.2 차트 생성

```javascript
// 통합 렌더링 (purpose로 구분)
VizAPI.render(element, {
  data: [1, 2, 3, 4, 5],
  purpose: 'chart',  // 'chart' | 'table' | 'scatter'
  classCount: 5,
  // ... 옵션
});

// 히스토그램 전용
VizAPI.renderChart(element, {
  data: [1, 2, 3, 4, 5],
  classCount: 5,
  // ... 옵션
});

// 산점도 전용
VizAPI.renderScatter(element, {
  data: [[1, 2], [3, 4], [5, 6]],
  // ... 옵션
});

// 도수분포표 전용
VizAPI.renderTable(element, {
  data: "헤더: 계급, 도수\n0~10: 5\n10~20: 8",
  // ... 옵션
});
```

### 6.3 선언적 방식

HTML 속성으로 설정:

```html
<div id="my-chart"
     data-viz-type="chart"
     data-viz-config='{"data": [1,2,3], "classCount": 5}'>
</div>

<script>
  VizAPI.initAll(); // 모든 data-viz-type 요소 초기화
</script>
```

---

## 7. 주요 설정 옵션

### 7.1 최상위 옵션

| 옵션 | 타입 | 설명 |
|------|------|------|
| `data` | Array/String | 입력 데이터 (필수) |
| `purpose` | String | 렌더링 목적: `chart`, `table`, `scatter` (기본: `chart`) |
| `tableType` | String | 테이블 유형: `basic-table`, `stem-leaf`, `category-matrix` |
| `classCount` | Integer | 계급 개수 3~20 (기본: 5) |
| `classWidth` | Number | 계급 간격 (자동 계산) |
| `classRange` | Object | 계급 범위: `{ firstStart, secondStart, lastEnd }` |
| `canvasSize` | Number | 정사각형 캔버스 크기 |
| `canvasWidth` | Number | 캔버스 너비 (기본: 700) |
| `canvasHeight` | Number | 캔버스 높이 (기본: 450) |
| `animation` | Boolean/Object | 애니메이션 활성화 |
| `cellAnimations` | Array | 셀 하이라이트 애니메이션: `[{ rowIndex, colIndex, duration, repeat }]` |
| `cellVariables` | Array | 셀 값 오버라이드: `[{ rowIndex, colIndex, value }]` |
| `datasets` | Array | 다중 데이터셋 (오버레이 차트용) |
| `unifiedMaxY` | Number | 다중 데이터셋 공통 Y축 최댓값 |

### 7.2 options 내부 - 차트 옵션

| 옵션 | 타입 | 설명 |
|------|------|------|
| `showHistogram` | Boolean | 히스토그램 표시 (기본: true) |
| `showPolygon` | Boolean | 도수다각형 표시 (기본: true) |
| `dataType` | String | Y축 타입: `frequency`, `relativeFrequency` |
| `axisLabels` | Object | 축 라벨: `{ xAxis: "...", yAxis: "..." }` |
| `callout` | Object | 콜아웃 설정: `{ enabled, template, preset }` |
| `englishFont` | Boolean | 영문 Source Han Sans 사용 |
| `showCurve` | Boolean/Object | 분포 곡선 표시 |
| `customYInterval` | Number | Y축 간격 커스텀 |
| `showDashedLines` | Boolean | 계급 경계 수직 파선 표시 |
| `grid` | Object | 격자선: `{ showHorizontal, showVertical }` |
| `axis` | Object | 축 설정: `{ showXAxis, showYAxis, showXLabels, ... }` |
| `histogramColorPreset` | String | 히스토그램 색상: `default`, `green` |
| `histogramColor` | String/Object | 히스토그램 색상 커스텀 |
| `polygonColorPreset` | String | 다각형 색상: `default`, `primary`, `secondary`, `tertiary` |
| `polygonColor` | String/Object | 다각형 색상 커스텀 |
| `polygon` | Object | 다각형 설정: `{ hidden: [인덱스 배열] }` |
| `congruentTriangles` | Object | 합동 삼각형: `{ enabled, boundary }` |
| `triangleLabels` | Array | 삼각형 라벨: `["S₁", "S₂"]` |
| `customBarLabels` | Array | 막대 내부 라벨: `["A", "B", null, "D"]` |
| `corruption` | Object | 찢김 효과: `{ enabled, cells, maskAxisLabels, style }` |

### 7.3 options 내부 - 산점도 옵션

| 옵션 | 타입 | 설명 |
|------|------|------|
| `line` | Boolean/Object | 직선 표시: `{ color, start, end }` |
| `pointHighlights` | Array | 강조점: `[{ x, y, color, scale, label }]` |
| `cellFill` | Object | 셀 채우기: `{ cells: "x1-y1:x2-y2" }` |
| `pointSize` | Number | 점 크기 (기본: 6) |
| `pointColor` | String | 점 색상 (기본: #93DA6A) |

### 7.4 options 내부 - 테이블 옵션

| 옵션 | 타입 | 설명 |
|------|------|------|
| `showTotal` | Boolean | 합계 행/열 표시 |
| `showMergedHeader` | Boolean | 병합 헤더 표시 |
| `showGrid` | Boolean | 격자선 표시 |
| `switchColor` | String | 기본 색상 대체 |

---

## 8. 문제 해결

### 폰트가 깨지는 경우
- KaTeX 폰트 로딩 확인
- `waitForFonts()` 호출 후 렌더링

### 애니메이션이 동작하지 않는 경우
- `animation` 옵션 확인
- 타임라인 컨트롤 확인

### 빌드 오류
- `node_modules` 삭제 후 재설치
- Node.js 버전 확인 (권장: 18+)

---

## 9. 파일 관리 방침

### 9.1 코드 구조 설계

| 레이어 | 역할 | 의존 방향 |
|--------|------|-----------|
| `core/` | 비즈니스 로직 (파싱, 계산, 상태) | 독립적 |
| `renderers/` | 프레젠테이션 (Canvas 그리기) | core, utils 참조 |
| `utils/` | 순수 유틸리티 함수 | 독립적 |
| `animation/` | 애니메이션 시스템 | renderers와 협력 |
| `controllers/` | UI 이벤트 핸들링 (app.html 전용) | 모든 레이어 참조 |

**설계 원칙:**
- 렌더러는 데이터 처리 로직을 직접 수행하지 않음 → `processor.js` 위임
- 각 렌더러(`chart.js`, `scatter.js`, `table.js`)는 독립적으로 동작
- 하위 렌더러(`chart/`, `table/`)는 부모 렌더러에서만 호출

### 9.2 버전 관리

**브랜치 전략:**
- `main` 브랜치 단일 운용
- 기능 개발 시 직접 main에 커밋 (소규모 프로젝트)

**커밋 컨벤션:**
```
feat: 새 기능 추가
fix: 버그 수정
docs: 문서 수정
refactor: 리팩토링
style: 코드 스타일 변경
```

### 9.3 빌드 산출물 관리

| 경로 | 커밋 여부 | 용도 |
|------|-----------|------|
| `dist/` | ✅ 포함 | GitHub Pages 직접 서빙용 |
| `build-helper/bundles/` | ❌ gitignore | 릴리즈별 백업 (로컬 보관) |
| `node_modules/` | ❌ gitignore | npm 의존성 |

**주의:** `dist/` 폴더는 빌드 후 항상 커밋해야 함 (배포 시 빌드 과정 없음)

### 9.4 의존성 관리

**외부 라이브러리 최소화:**
- KaTeX 폰트 파일만 사용 (라이브러리 자체는 미사용)
- Canvas API 직접 사용 (차트 라이브러리 미사용)
- Rollup 빌드 도구만 devDependency

**이유:**
- 번들 크기 최소화
- 외부 의존성 변경에 영향받지 않음
- 커스텀 렌더링 요구사항 대응 용이

### 9.5 테스트 전략

**시각적 테스트 (수동):**
- `test/*.html`: 기능별 테스트 케이스
- `validator.html`: 설정 JSON 검증

**자동화 테스트 없는 이유:**
- Canvas 렌더링 결과는 시각적 확인 필요
- 픽셀 단위 비교 테스트는 유지보수 비용 높음
- 통계 계산 로직은 `processor.js`에서 단순 수식

---

## 10. 실무 워크플로우

### 10.1 로컬 개발

1. 서버 실행: `npx serve`
2. 브라우저에서 `http://localhost:3000` 접속
3. 코드 수정
4. 테스트: `validator.html`에서 검증
5. 커밋 & 푸시 → GitHub Pages 자동 배포
6. `npm run build`

### 10.2 신규 요청 처리 흐름

```
요청 접수 → 요구사항 분석 → 구현 → 테스트 → 배포
```

1. **요청 접수**: 새 옵션, 버그 수정, 기능 개선 등
2. **요구사항 분석**:
   - 기존 옵션으로 해결 가능한지 확인
   - 새 옵션 필요 시 `VIZ-API-CONFIG.md` 참고하여 설계
3. **구현**: 섹션 10.3 참고
4. **테스트**: `validator.html`에서 검증
5. **배포**: 커밋 → 푸시 → GitHub Pages 자동 배포

### 10.3 일반적인 작업 패턴

**새 차트 옵션 추가**
```
viz-api.js (옵션 처리)
    ↓
config.js (기본값 설정, 필요시)
    ↓
renderers/*.js (렌더링 반영)
    ↓
VIZ-API-CONFIG.md (문서화)
```

예시: `showDashedLines` 옵션 추가
```javascript
// 1. viz-api.js - config.options에서 읽어 CONFIG에 반영
if (options.showDashedLines !== undefined) {
  CONFIG.SHOW_DASHED_LINES = options.showDashedLines;
}

// 2. chart.js - CONFIG 값 사용하여 렌더링
if (CONFIG.SHOW_DASHED_LINES) {
  this.dashedLineRenderer.render(ctx, classes, coords);
}

// 3. VIZ-API-CONFIG.md - 문서화
// | showDashedLines | Boolean | 계급 경계 수직 파선 표시 |
```

**버그 수정**
```
validator.html (재현)
    ↓
원인 파악 (렌더러/파서/계산)
    ↓
수정 → 테스트 → 커밋
```

예시: "Y축 라벨이 겹침" 버그
```
1. validator.html에서 재현 JSON 작성
   { "data": [1,1,1,1,1,100], "classCount": 5 }

2. 원인 파악: chart.js → AxisRenderer.js
   - Y축 간격 계산이 데이터 범위 고려 안함

3. 수정: AxisRenderer.js의 _calculateYInterval()
   - 최소 간격 로직 추가

4. 테스트 → 커밋
```

**애니메이션 추가**
```
animation/effects/*.js (효과 정의)
    ↓
렌더러의 _setupAnimations() (등록)
    ↓
renderFrame() (적용)
```

### 10.4 자주 참조하는 파일

| 작업 | 주요 파일 |
|------|-----------|
| 옵션 확인 | `md/VIZ-API-CONFIG.md`, `schema/viz-api.schema.json` |
| 차트 수정 | `js/renderers/chart.js`, `js/renderers/chart/*.js` |
| 산점도 수정 | `js/renderers/scatter.js` |
| 테이블 수정 | `js/renderers/table.js`, `js/renderers/table/*.js` |
| 데이터 파싱 | `js/core/parsers/*.js` |
| 설정 상수 | `js/config.js` |

### 10.5 주의사항

- **빌드 잊지 않기**: `npm run build` 후 커밋
- **dist/ 포함 커밋**: 빌드 결과물 누락 시 배포 실패
- **테스트 먼저**: 수정 전 `validator.html`에서 현재 동작 확인
- **문서 동기화**: 옵션 추가 시 `VIZ-API-CONFIG.md` 업데이트


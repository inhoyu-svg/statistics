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

## 8. 파일별 역할

### 핵심 파일

| 파일 | 역할 |
|------|------|
| `js/viz-api.js` | 외부 API 인터페이스 |
| `js/config.js` | 전역 설정 (색상, 폰트 크기, 스케일링) |
| `js/core/processor.js` | 통계 계산 (평균, 표준편차, 계급 생성) |
| `js/renderers/chart.js` | 히스토그램 렌더링 |
| `js/renderers/scatter.js` | 산점도 렌더링 |
| `js/renderers/table.js` | 도수분포표 렌더링 |
| `js/utils/katex.js` | 수학 폰트 렌더링 |
| `js/utils/corruption.js` | 손글씨 효과 |

### HTML 페이지

| 파일 | 용도 |
|------|------|
| `index.html` | 프로젝트 소개 페이지 |
| `app.html` | 인터랙티브 차트 생성기 |
| `validator.html` | 설정 JSON 검증 도구 |
| `test/*.html` | 각 기능별 테스트 케이스 |

---

## 9. 개발 워크플로우

### 9.1 로컬 개발

1. 서버 실행: `npx serve`
2. 브라우저에서 `http://localhost:3000` 접속
3. 코드 수정 후 브라우저 새로고침

### 9.2 빌드 및 배포

1. 소스 코드 수정 (`js/` 디렉토리)
2. 빌드: `npm run build:api`
3. 테스트: `validator.html`에서 검증
4. 커밋 & 푸시 → GitHub Pages 자동 배포

### 9.3 새 기능 추가 시

1. 렌더러 수정: `js/renderers/`
2. 설정 추가: `js/config.js`, `schema/viz-api.schema.json`
3. API 노출: `js/viz-api.js`
4. 문서 업데이트: `md/HANDOVER.md`

---

## 10. 문제 해결

### 폰트가 깨지는 경우
- KaTeX 폰트 로딩 확인
- `waitForFonts()` 호출 후 렌더링

### 애니메이션이 동작하지 않는 경우
- `animation` 옵션 확인
- 타임라인 컨트롤 확인

### 빌드 오류
- `node_modules` 삭제 후 재설치
- Node.js 버전 확인 (권장: 18+)


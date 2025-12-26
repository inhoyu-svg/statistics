# Statistics 프로젝트 인수인계 문서

> 작성일: 2025-12-26
> 이 문서는 새로운 개발자를 위한 종합 인수인계 가이드입니다.

---

## 1. 프로젝트 개요

### 1.1 프로젝트 정보
| 항목 | 내용 |
|------|------|
| **프로젝트명** | Statistics (통계 시각화 도구) |
| **목적** | 교육용 통계 데이터 시각화 |
| **웹사이트** | https://inhoyu-svg.github.io/statistics/ |
| **버전** | 1.0.0 |
| **라이선스** | - |

### 1.2 프로젝트 설명
통계 데이터를 입력하면 자동으로 **도수분포표, 히스토그램, 상대도수 다각형** 등 다양한 통계표와 차트를 생성하는 교육용 시각화 도구입니다.

**두 가지 사용 방식:**
1. **독립 실행 앱**: `app.html`에서 직접 데이터 입력 및 시각화
2. **외부 임베딩**: `viz-api.js`를 통해 다른 웹페이지에 차트/테이블 삽입

---

## 2. 기술 스택

| 분야 | 기술 | 비고 |
|------|------|------|
| **언어** | JavaScript ES6 Modules | 순수 JS, 프레임워크 없음 |
| **렌더링** | HTML5 Canvas | SVG 미사용 |
| **스타일** | CSS3 | Grid, Flexbox, 애니메이션 |
| **수식** | KaTeX | Canvas에 수식 렌더링 |
| **번들러** | Rollup | UMD/ESM 출력 |
| **배포** | GitHub Pages | 자동 CI/CD |

**핵심 원칙:**
- 외부 npm 패키지 추가 금지 (순수 JS 유지)
- Chart.js, D3.js 등 외부 라이브러리 사용 금지
- CSS 프레임워크 (Bootstrap, Tailwind) 추가 금지

---

## 3. 디렉토리 구조

```
statistics/
├── js/                          # 소스 코드 (70개 파일)
│   ├── app.js                   # 앱 초기화 (334줄)
│   ├── config.js                # 전역 설정 상수 (629줄)
│   ├── viz-api.js               # 외부 연동 API (1561줄)
│   │
│   ├── core/                    # 데이터 처리 계층
│   │   ├── processor.js         # 통계 계산 엔진 (331줄)
│   │   ├── chartStore.js        # 차트 상태 저장소
│   │   ├── dataStore.js         # 데이터 상태 저장소
│   │   ├── tableStore.js        # 테이블 상태 저장소
│   │   ├── datasetStore.js      # 다중 데이터셋 관리
│   │   ├── parsers/             # 데이터 파서 (6개)
│   │   │   ├── FrequencyParser.js
│   │   │   ├── BasicTableParser.js
│   │   │   ├── CategoryMatrixParser.js
│   │   │   ├── StemLeafParser.js
│   │   │   └── ParserAdapter.js
│   │   └── serializer/          # JSON 내보내기/가져오기
│   │       ├── DataExporter.js
│   │       └── DataImporter.js
│   │
│   ├── controllers/             # UI 컨트롤러 (6개)
│   │   ├── AnimationController.js
│   │   ├── ChartSettingsController.js
│   │   ├── DatasetController.js
│   │   ├── GenerationController.js
│   │   ├── LayerPanelController.js
│   │   └── TableConfigController.js
│   │
│   ├── renderers/               # Canvas 렌더링
│   │   ├── chart.js             # 차트 렌더러 (801줄)
│   │   ├── table.js             # 테이블 렌더러 (1834줄)
│   │   ├── scatter.js           # 산점도 렌더러 (411줄)
│   │   ├── ui.js                # 통계 카드 UI
│   │   ├── chart/               # 차트 서브모듈 (9개)
│   │   │   ├── CoordinateSystem.js
│   │   │   ├── AxisRenderer.js
│   │   │   ├── HistogramRenderer.js
│   │   │   ├── PolygonRenderer.js
│   │   │   ├── CurveRenderer.js
│   │   │   ├── CalloutRenderer.js
│   │   │   ├── DashedLineRenderer.js
│   │   │   ├── TriangleRenderer.js
│   │   │   └── LayerFactory.js
│   │   └── table/               # 테이블 서브모듈
│   │       ├── TableCellRenderer.js
│   │       ├── TableLayerFactory.js
│   │       ├── TableEditModal.js
│   │       └── factories/       # 테이블 타입별 팩토리
│   │           ├── BasicTableFactory.js
│   │           ├── CategoryMatrixFactory.js
│   │           ├── StemLeafFactory.js
│   │           └── BaseTableFactory.js
│   │
│   ├── animation/               # 애니메이션 시스템
│   │   ├── effects/             # 효과 (blink, draw, fade, scale, slide)
│   │   ├── layer/               # 레이어 관리
│   │   └── timeline/            # 타임라인 제어
│   │
│   └── utils/                   # 유틸리티 (5개)
│       ├── utils.js             # 공통 헬퍼
│       ├── katex.js             # KaTeX 수식 렌더링
│       ├── validator.js         # 입력 검증
│       ├── message.js           # 메시지 관리
│       └── corruption.js        # 찢김 효과 (1251줄)
│
├── md/                          # 문서
│   ├── CLAUDE.md                # AI 협업 가이드
│   ├── SCHEMA.md                # 데이터 구조 문서
│   ├── VIZ-API-CONFIG.md        # API 설정 레퍼런스
│   └── HANDOVER.md              # 인수인계 문서 (이 파일)
│
├── schema/                      # JSON Schema
│   └── viz-api.schema.json      # viz-api 설정 검증
│
├── test/                        # 테스트 케이스
│   ├── chart-cases.html
│   ├── table-cases.html
│   └── scatter-cases.html
│
├── dist/                        # 빌드 출력
│   ├── viz-api.js               # UMD 번들
│   └── viz-api.esm.js           # ESM 번들
│
├── build-helper/                # 빌드 설정
│   ├── rollup.config.js
│   ├── rollup.config.api.js
│   └── zip-bundle.js
│
├── app.html                     # 메인 앱 페이지
├── index.html                   # 랜딩 페이지
├── validator.html               # 검증/테스트 페이지
└── styles.css                   # 전역 스타일
```

---

## 4. 핵심 기능

### 4.1 공통 기능
| 기능 | 설명 | 적용 대상 |
|------|------|----------|
| **찢김 효과** | corruption으로 셀/영역 찢김 표현 | 차트, 테이블, 산점도 |
| **빈 구간 압축** | 이중물결(≈) 자동 처리 | 차트, 산점도 |
| **애니메이션** | fade, draw, scale, slide, blink 효과 | 차트, 테이블, 산점도 |
| **축 라벨 커스텀** | X축/Y축 제목 설정 | 차트, 산점도 |
| **격자선** | 가로/세로 격자선 표시 | 차트, 산점도 |

### 4.2 차트 (Chart)
| 기능 | 설명 |
|------|------|
| **히스토그램** | 계급별 도수 막대 그래프, 그라데이션 색상 |
| **상대도수 다각형** | 다각형 선 + 점 |
| **말풍선 (Callout)** | 특정 막대에 텍스트 표시 |
| **수직 파선** | 다각형 점에서 X축으로 파선 표시 |
| **합동 삼각형** | S₁, S₂ 경계값 시각화 |
| **막대 내부 라벨** | customBarLabels로 막대 안에 텍스트 |
| **색상 프리셋** | 히스토그램/다각형 색상 커스텀 |
| **데이터 타입** | 도수(frequency) / 상대도수(relativeFrequency) 선택 |
| **계급 설정** | classCount, classWidth, classRange 옵션 |

### 4.3 테이블 (Table)
| 타입 | 용도 | 예시 |
|------|------|------|
| **basic-table** | 이원분류표, 도수분포표 | 혈액형 × 성별, 계급별 도수 |
| **category-matrix** | 카테고리 행렬 | 학급별 데이터 |
| **stem-leaf** | 줄기-잎 그림 | 단일/비교 모드 |

**테이블 전용 기능:**
- cellVariables: 셀 값 커스터마이징 (?, null, 숫자 등)
- cellAnimations: 셀 하이라이트 (깜빡임)
- showTotal: 합계 행 표시 (basic-table)
- showMergedHeader: 병합 헤더 표시 (basic-table)
- showGrid: 격자선 표시 (false시 둥근 테두리)

### 4.4 산점도 (Scatter)
| 기능 | 설명 |
|------|------|
| **X-Y 좌표** | 2D 배열 `[[x, y], ...]` 형식 |
| **점 스타일** | pointSize, pointColor 커스텀 |

### 4.5 애니메이션 시스템
```
Layer → Timeline → Effects
```
- **효과**: fade, draw, scale, slide, blink
- **레이어**: 계층적 관리
- **타임라인**: 시퀀스 제어, 재생/일시정지

### 4.6 해외강의용 추가 기능
| 기능 | 옵션 | 설명 |
|------|------|------|
| **분포 곡선** | `showCurve` | 히스토그램 위 분포 곡선 표시 |
| **축 선 표시** | `axis.showXAxis`, `axis.showYAxis` | X/Y축 선 표시 여부 |
| **축 제목 표시** | `axis.showAxisLabels` | X/Y축 제목 표시 여부 |
| **원점 라벨** | `axis.showOriginLabel` | 원점(0) 라벨 표시 여부 |
| **X축 라벨 형식** | `axis.xLabelFormat` | boundary(경계값) / range(범위) |
| **영어 폰트** | `englishFont` | 테이블 영어 폰트 (Source Han Sans KR) |
| **녹색 대체** | `switchColor` | 테이블 녹색을 다른 색상으로 대체 |

### 4.7 데이터 관리 (app.html 전용)
- **JSON 내보내기**: DataExporter로 설정 저장
- **JSON 가져오기**: DataImporter로 설정 복원
- **다중 데이터셋**: datasetStore로 여러 데이터 관리

### 4.8 외부 API (viz-api.js)
```javascript
// 차트 렌더링
VizAPI.renderChart(element, {
  data: [1, 2, 3, 4, 5],
  classCount: 5
});

// 테이블 렌더링
VizAPI.renderTable(element, {
  tableType: 'basic-table',
  data: '헤더: A, B\n행1: 10, 20\n행2: 30, 40'
});

// 산점도 렌더링
VizAPI.renderScatter(element, {
  data: [[1, 2], [3, 4], [5, 6]]
});
```

---

## 5. 개발 환경 설정

### 5.1 필수 요구사항
- Node.js (v16 이상 권장)
- npm

### 5.2 설치
```bash
cd statistics
npm install
```

### 5.3 개발 서버
로컬에서 테스트하려면 간단한 HTTP 서버 사용:
```bash
# Python 3
python -m http.server 8000

# Node.js (npx)
npx serve
```

### 5.4 개발 모드 (파일 변경 감시)
```bash
npm run build:watch
```

---

## 6. 빌드 및 배포

### 6.1 빌드 명령어
| 명령어 | 설명 |
|--------|------|
| `npm run build` | 일반 빌드 (타임스탬프 폴더 저장) |
| `npm run build:api` | viz-api.js 빌드 (dist/ 폴더) |
| `npm run build:watch` | 개발 모드 (파일 변경 감시) |
| `npm run zip` | 번들을 날짜 기반 폴더에 압축 |

### 6.2 빌드 출력
```
dist/
├── viz-api.js           # UMD 번들 (~598KB)
├── viz-api.js.map       # Source Map
├── viz-api.esm.js       # ESM 번들 (~569KB)
└── viz-api.esm.map      # Source Map
```

### 6.3 배포
- **GitHub Pages**: 자동 배포 (`.github/workflows/`)
- **URL**: https://inhoyu-svg.github.io/statistics/

---

## 7. 핵심 모듈 설명

### 7.1 데이터 처리 흐름
```
사용자 입력
    ↓
Parser (FrequencyParser, BasicTableParser 등)
    ↓
DataProcessor (통계 계산)
    ↓
Store (chartStore, tableStore, dataStore)
    ↓
Renderer (chart.js, table.js, scatter.js)
    ↓
Canvas 출력
```

### 7.2 주요 클래스

**DataProcessor** (`js/core/processor.js`)
```javascript
// 주요 메서드
DataProcessor.parseInput(input)           // 입력 데이터 파싱
DataProcessor.calculateBasicStats(data)   // 기본 통계 계산
DataProcessor.createClasses(...)          // 계급 생성
DataProcessor.calculateFrequencies(...)   // 도수 계산
```

**Parsers** (`js/core/parsers/`)
- FrequencyParser: 숫자 배열 → 계급 데이터
- BasicTableParser: 이원분류표 파싱
- CategoryMatrixParser: 카테고리 행렬 파싱
- StemLeafParser: 줄기-잎 그림 파싱
- ParserAdapter: 모든 파서 출력 통일

**Stores** (`js/core/`)
- chartStore: 차트 설정 상태
- tableStore: 테이블 설정 상태
- dataStore: 입력 데이터 상태
- datasetStore: 다중 데이터셋 관리

**ChartRenderer** (`js/renderers/chart.js`)
- CoordinateSystem: 좌표 변환
- AxisRenderer: 축 렌더링
- HistogramRenderer: 막대 렌더링
- PolygonRenderer: 다각형 렌더링
- CurveRenderer: 분포 곡선 렌더링
- CalloutRenderer: 말풍선 렌더링
- DashedLineRenderer: 수직 파선 렌더링
- TriangleRenderer: 합동 삼각형 렌더링
- LayerFactory: 레이어 생성

**TableRenderer** (`js/renderers/table.js`)
- TableCellRenderer: 셀 렌더링
- TableLayerFactory: 레이어 생성
- TableEditModal: 셀 편집 모달
- factories/: 테이블 타입별 팩토리
  - BasicTableFactory
  - CategoryMatrixFactory
  - StemLeafFactory
  - BaseTableFactory (공통 기반)

**ScatterRenderer** (`js/renderers/scatter.js`)
- 산점도 렌더링
- 압축 구간 처리

---

## 8. 리팩토링 필요 파일

다음 파일들은 600줄을 초과하여 리팩토링이 권장됩니다:

| 파일 | 줄 수 | 권장 조치 |
|------|-------|----------|
| `table.js` | 1834 | 최우선 분할 필요 |
| `viz-api.js` | 1561 | 차트/테이블 API 분리 |
| `corruption.js` | 1251 | 차트/테이블 효과 분리 |
| `TableCellRenderer.js` | 1219 | 렌더링/측정 분리 |
| `GenerationController.js` | 904 | 기능별 분리 |
| `chart.js` | 801 | 추가 분할 검토 |
| `LayerPanelController.js` | 721 | 레이어 관리 분리 |
| `StemLeafFactory.js` | 671 | 메서드 추출 |
| `BasicTableFactory.js` | 633 | 메서드 추출 |

---

## 9. 알려진 이슈

### 9.1 최근 수정된 버그
- category-matrix에서 null 처리 버그 (de25008)
- polygon.hidden 인덱스 기준 동작 수정 (a17f1ee)
- histogramColor 커스텀 시 alpha 값 (5dbe4bc)

### 9.2 향후 개선 사항
- 대형 파일 리팩토링 (9개 파일)
- 테스트 코드 추가 (현재 수동 테스트)
- 성능 최적화 (대용량 데이터)

---

## 10. 참고 문서

| 문서 | 위치 | 내용 |
|------|------|------|
| **프로젝트 소개** | `md/README.md` | 기능 개요, 사용법 |
| **AI 협업 가이드** | `md/CLAUDE.md` | 폴더 구조, 커밋 규칙 |
| **사용 설명서** | `md/USAGE.md` | 테이블 타입별 입력 형식 |
| **데이터 구조** | `md/SCHEMA.md` | viz-api 스키마 |
| **API 레퍼런스** | `md/VIZ-API-CONFIG.md` | 설정 옵션 상세 |

---

## 11. 테스트

### 11.1 테스트 페이지
- `test/chart-cases.html`: 차트 테스트
- `test/table-cases.html`: 테이블 테스트
- `test/scatter-cases.html`: 산점도 테스트
- `validator.html`: 통합 검증 페이지

### 11.2 테스트 방법
1. 로컬 서버 실행
2. 브라우저에서 테스트 페이지 열기
3. 각 케이스 시각적 확인

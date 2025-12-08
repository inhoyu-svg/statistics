# viz-api 데이터 스키마

viz-api.js의 입력/출력 데이터 구조 정의

> 상세 설정 옵션은 [VIZ-API-CONFIG.md](./VIZ-API-CONFIG.md) 참조

---

## 1. 최상위 Config 객체

```typescript
interface Config {
  // 필수
  data: number[] | string;              // 변량 데이터

  // 렌더링 타입 (선택)
  purpose?: 'chart' | 'table';          // 기본: 'chart'
  tableType?: TableType;                // 기본: 'frequency'

  // 캔버스 크기 (선택)
  canvasSize?: number;                  // 정사각형 (canvasWidth/Height 우선)
  canvasWidth?: number;                 // 기본: 700
  canvasHeight?: number;                // 기본: 450

  // 계급 설정 (선택, 차트/도수분포표만)
  classCount?: number;                  // 기본: 5
  classWidth?: number;                  // 자동 계산
  classRange?: ClassRange;              // 수동 범위 지정

  // 애니메이션 (선택)
  animation?: boolean | { enabled: boolean };  // 기본: true

  // 셀 커스터마이징 (선택)
  cellAnimations?: CellAnimation[];     // 셀 하이라이트
  cellAnimationOptions?: { blinkEnabled: boolean };
  cellVariables?: CellVariable[];       // 셀 값 오버라이드

  // 세부 옵션 (선택)
  options?: Options;
}

type TableType = 'frequency' | 'cross-table' | 'category-matrix' | 'stem-leaf';
```

### 필수/선택 요약

| 필드 | 필수 | 타입 | 기본값 |
|:-----|:----:|:-----|:-------|
| `data` | O | `number[]` \| `string` | - |
| `purpose` | X | `string` | `"chart"` |
| `tableType` | X | `string` | `"frequency"` |
| `canvasWidth` | X | `number` | `700` |
| `canvasHeight` | X | `number` | `450` |
| `classCount` | X | `number` | `5` |
| `animation` | X | `boolean` | `true` |
| `options` | X | `object` | `{}` |

---

## 2. tableType별 data 형식

| tableType | data 형식 | 예시 |
|:----------|:----------|:-----|
| `frequency` | 숫자 배열 또는 문자열 | `[62, 87, 97]` 또는 `"62, 87, 97"` |
| `stem-leaf` (단일) | 숫자 문자열 | `"162 178 175 189"` |
| `stem-leaf` (비교) | `"라벨: 숫자들"` 형식 | `"남학생: 162 178\n여학생: 160 165"` |
| `cross-table` | `"헤더: ...\n행: ..."` | `"헤더: 혈액형, 남, 여\nA: 0.4, 0.4"` |
| `category-matrix` | `"헤더: ...\n라벨: ..."` | `"헤더: A, B, C\n학생수: 200, 250, 300"` |

### 특수 문법

**반복 표기** (frequency만):
```
"16*18"        → 16을 18번 반복
"40*2 50*11"   → 40을 2번, 50을 11번
```

---

## 3. 내부 데이터 구조

### 3.1 도수분포표 (frequency)

**파싱 후 계급 구조:**
```typescript
interface ClassData {
  min: number;                    // 계급 시작값 (이상)
  max: number;                    // 계급 끝값 (미만, 마지막만 이하)
  midpoint: number;               // 계급값 = (min + max) / 2
  frequency: number;              // 도수
  relativeFreq: number;           // 상대도수 (%)
  cumulativeFreq: number;         // 누적도수
  cumulativeRelFreq: number;      // 누적상대도수 (%)
  data: number[];                 // 해당 계급의 원본 데이터
}

// 예시
classes: [
  { min: 60, max: 70, midpoint: 65, frequency: 4, relativeFreq: 40, ... },
  { min: 70, max: 80, midpoint: 75, frequency: 3, relativeFreq: 30, ... },
  { min: 80, max: 90, midpoint: 85, frequency: 2, relativeFreq: 20, ... },
  { min: 90, max: 100, midpoint: 95, frequency: 1, relativeFreq: 10, ... }
]
```

**통계 구조:**
```typescript
interface Stats {
  min: number;      // 최솟값
  max: number;      // 최댓값
  range: number;    // 범위 = max - min
  mean: number;     // 평균
  median: number;   // 중앙값
  count: number;    // 데이터 개수
}
```

### 3.2 줄기-잎 그림 (stem-leaf)

**단일 모드:**
```typescript
interface StemLeafSingle {
  isSingleMode: true;
  stems: Array<{
    stem: number | string;    // 줄기 (십의 자리)
    leaves: number[];         // 잎 배열 (일의 자리, 정렬됨)
  }>;
  minStem: number;
  maxStem: number;
}

// 예시: "162 178 175 189"
{
  isSingleMode: true,
  stems: [
    { stem: 16, leaves: [2] },
    { stem: 17, leaves: [5, 8] },
    { stem: 18, leaves: [9] }
  ],
  minStem: 16,
  maxStem: 18
}
```

**비교 모드:**
```typescript
interface StemLeafCompare {
  isSingleMode: false;
  leftLabel: string;          // 왼쪽 그룹 라벨
  rightLabel: string;         // 오른쪽 그룹 라벨
  stems: Array<{
    stem: number | string;
    leftLeaves: number[];     // 왼쪽 잎 (역순 정렬)
    rightLeaves: number[];    // 오른쪽 잎 (정렬)
  }>;
  minStem: number;
  maxStem: number;
}

// 예시: "남학생: 162 178\n여학생: 160 165"
{
  isSingleMode: false,
  leftLabel: "남학생",
  rightLabel: "여학생",
  stems: [
    { stem: 16, leftLeaves: [2], rightLeaves: [0, 5] },
    { stem: 17, leftLeaves: [8], rightLeaves: [] }
  ]
}
```

### 3.3 이원분류표 (cross-table)

```typescript
interface CrossTableData {
  rowLabelColumn: string;       // 행 라벨 컬럼명 (예: "혈액형")
  columnHeaders: string[];      // 열 헤더 (예: ["남학생", "여학생"])
  rowHeaders: string[];         // 행 헤더 (예: ["A", "B", "AB", "O"])
  rows: Array<{
    label: string;              // 행 이름
    values: number[];           // 해당 행의 값들
  }>;
  showTotal: boolean;           // 합계 행/열 표시 여부
  mergedHeaderText?: string;    // 커스텀 병합 헤더
}

// 예시: "헤더: 혈액형, 남학생, 여학생\nA: 0.4, 0.4\nB: 0.22, 0.2"
{
  rowLabelColumn: "혈액형",
  columnHeaders: ["남학생", "여학생"],
  rowHeaders: ["A", "B"],
  rows: [
    { label: "A", values: [0.4, 0.4] },
    { label: "B", values: [0.22, 0.2] }
  ],
  showTotal: true
}
```

### 3.4 카테고리 행렬 (category-matrix)

```typescript
interface CategoryMatrixData {
  headers: string[];            // 열 헤더 (첫 줄에서 추출)
  rows: Array<{
    label: string;              // 행 라벨
    values: number[];           // 해당 행의 값들
  }>;
}

// 예시: "헤더: A, B, C\n학생수: 200, 250, 300"
{
  headers: ["A", "B", "C"],
  rows: [
    { label: "학생수", values: [200, 250, 300] }
  ]
}
```

---

## 4. options 객체 구조

### 4.1 차트 전용

```typescript
interface ChartOptions {
  showHistogram?: boolean;              // 기본: true
  showPolygon?: boolean;                // 기본: true
  dataType?: 'frequency' | 'relativeFrequency';  // 기본: 'relativeFrequency'
  showDashedLines?: boolean;            // 기본: false

  axisLabels?: {
    xAxis?: string;
    yAxis?: string;
  };

  grid?: {
    showHorizontal?: boolean;           // 기본: true
    showVertical?: boolean;             // 기본: true
  };

  axis?: {
    showYLabels?: boolean;              // 기본: true
    showXLabels?: boolean;              // 기본: true
    yLabelFormat?: 'decimal' | 'percent';
  };

  callout?: {
    enabled: boolean;
    template?: string;
    preset?: 'default' | 'primary' | 'secondary' | 'tertiary';
  };

  congruentTriangles?: {
    enabled: boolean;
    boundary?: number;                  // 경계값
  };
  triangleLabels?: string[];            // 예: ["S₁", "S₂"]

  customBarLabels?: string[];           // 막대 내부 라벨
  customYInterval?: number;             // Y축 간격

  histogramColorPreset?: 'default' | 'green';
  histogramColor?: ColorConfig;
  polygonColorPreset?: 'default' | 'primary' | 'secondary' | 'tertiary';
  polygonColor?: ColorConfig;
}
```

### 4.2 테이블 전용

```typescript
interface TableOptions {
  // 도수분포표
  tableConfig?: {
    visibleColumns?: boolean[];         // 7개 컬럼 표시 여부
    columnOrder?: number[];             // 컬럼 순서
    labels?: {
      class?: string;
      midpoint?: string;
      tally?: string;
      frequency?: string;
      relativeFrequency?: string;
      cumulativeFrequency?: string;
      cumulativeRelativeFrequency?: string;
    };
    showSuperscript?: boolean;          // "이상/미만" 표시
    showSummaryRow?: boolean;           // 합계 행 표시
    cellVariables?: CellVariable[];     // rowIndex/colIndex 방식
  };

  // 이원분류표
  crossTable?: {
    showTotal?: boolean;                // 기본: true
    showMergedHeader?: boolean;         // 기본: true
  };
}
```

### 4.3 공통

```typescript
interface CommonOptions {
  corruption?: {
    enabled: boolean;
    cells?: string;                     // 셀 범위: "0-0:2-3"
    maskAxisLabels?: boolean;
    style?: {
      edgeColor?: string;               // 기본: '#FF0000'
      fiberCount?: number;              // 기본: 50
    };
  };
}
```

---

## 5. cellVariables 형식

모든 테이블 타입에서 통일된 `rowIndex/colIndex` 방식을 사용합니다.

```typescript
interface CellVariable {
  rowIndex: number;     // 0-based 행 인덱스
  colIndex: number;     // 0-based 열 인덱스
  value: string | number | any[];
}
```

### 예시

```typescript
// 줄기-잎, 카테고리 매트릭스, 이원분류표
cellVariables: [
  { rowIndex: 1, colIndex: 0, value: "?" },
  { rowIndex: 2, colIndex: 1, value: ["ㄱ", "ㄴ"] }
]

// 도수분포표 (tableConfig 내부)
tableConfig: {
  cellVariables: [
    { rowIndex: 0, colIndex: 2, value: "?" },
    { rowIndex: 4, colIndex: 3, value: 1 }
  ]
}
```

---

## 6. classRange 구조

```typescript
interface ClassRange {
  firstEnd: number;     // 첫 계급 끝값 (0~firstEnd)
  secondEnd: number;    // 두 번째 계급 끝값 (간격 결정)
  lastStart: number;    // 마지막 계급 시작값
}

// 예시: { firstEnd: 10, secondEnd: 20, lastStart: 50 }
// 생성되는 계급: 0~10, 10~20, 20~30, 30~40, 40~50, 50~60
```

---

## 7. 데이터 흐름

```
┌─────────────────────────────────────────────────────────────┐
│                         입력                                │
│  config = { data: [...], purpose: "table", tableType: ... } │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        파싱 단계                            │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │  DataProcessor  │  │  Parser 팩토리  │                   │
│  │  (frequency)    │  │  (기타 타입)    │                   │
│  └─────────────────┘  └─────────────────┘                   │
│         │                     │                             │
│         ▼                     ▼                             │
│    rawData[]           parsedData                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       변환 단계                             │
│  ┌─────────────────────────────────────────┐                │
│  │  통계 계산 (stats)                       │                │
│  │  계급 생성 (classes)                     │                │
│  │  도수/상대도수/누적도수 계산             │                │
│  └─────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      렌더링 단계                            │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │  ChartRenderer  │  │  TableRenderer  │                   │
│  │  (Canvas)       │  │  (Canvas)       │                   │
│  └─────────────────┘  └─────────────────┘                   │
│         │                     │                             │
│         ▼                     ▼                             │
│   Layer 계층 생성      Factory별 렌더링                     │
│   애니메이션 설정      셀 커스터마이징                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         출력                                │
│  { canvas, classes, stats, renderer, ... }                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. 타입 정의 파일 (참고용)

> 실제 프로젝트는 순수 JavaScript이며, 아래는 참조용 TypeScript 정의입니다.

```typescript
// 색상 설정
type ColorConfig = string | {
  fill?: string;
  stroke?: string;
  line?: string;
  point?: string;
  alpha?: number;
};

// 셀 애니메이션
interface CellAnimation {
  rowIndex?: number;
  colIndex?: number;
  rowStart?: number;
  rowEnd?: number;
  colStart?: number;
  colEnd?: number;
  duration?: number;    // 기본: 1500
  repeat?: number;      // 기본: 3
}

// API 반환값
interface RenderResult {
  canvas: HTMLCanvasElement;
  classes?: ClassData[];
  stats?: Stats;
  chartRenderer?: any;
  tableRenderer?: any;
  parsedData?: any;
}
```

# viz-api 내부 데이터 스키마

> ⚠️ 이 문서는 **파싱 후 내부 데이터 구조**를 정의합니다.
>
> **입력 JSON 설정**은 [VIZ-API-CONFIG.md](./VIZ-API-CONFIG.md) 참조

---

## 1. purpose별 data 형식

### 차트 (purpose: "chart")

| data 형식 | 예시 |
|:----------|:-----|
| 숫자 배열 | `[62, 87, 97, 73, 59, 85]` |

### 테이블 (purpose: "table")

| tableType | data 형식 | 예시 |
|:----------|:----------|:-----|
| `basic-table` | `"헤더: ...\n행: ..."` | `"헤더: 혈액형, 남, 여\nA: 0.4, 0.4"` |
| `category-matrix` | `"헤더: ...\n라벨: ..."` | `"헤더: A, B, C\n학생수: 200, 250, 300"` |
| `stem-leaf` (단일) | 숫자 문자열 | `"162 178 175 189"` |
| `stem-leaf` (비교) | `"라벨: 숫자들"` 형식 | `"남학생: 162 178\n여학생: 160 165"` |

### 특수 문법

**반복 표기** (차트 data만 해당):
```
"16*18"        → 16을 18번 반복
"40*2 50*11"   → 40을 2번, 50을 11번
```

---

## 2. 내부 데이터 구조

> 파싱 후 생성되는 내부 데이터 구조입니다.

### 2.1 차트 계급 데이터 (내부 구조)

**차트 렌더링 시 생성되는 계급 구조:**
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

### 2.2 줄기-잎 그림 (stem-leaf)

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

### 2.3 기본 테이블 (basic-table)

```typescript
interface BasicTableData {
  rowLabelColumn: string;       // 행 라벨 컬럼명 (예: "혈액형")
  columnHeaders: string[];      // 열 헤더 (예: ["남학생", "여학생"])
  rowHeaders: string[];         // 행 헤더 (예: ["A", "B", "AB", "O"])
  rows: Array<{
    label: string;              // 행 이름
    values: number[];           // 해당 행의 값들
  }>;
  showTotal: boolean;           // 합계 행/열 표시 여부
  showMergedHeader?: boolean;   // 병합 헤더 표시 여부 (기본: true)
  showGrid?: boolean;           // 격자선 표시 여부 (기본: true, false시 둥근 테두리)
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

### 2.4 카테고리 행렬 (category-matrix)

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

## 3. 데이터 흐름

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

## 4. 타입 정의 (참고용)

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

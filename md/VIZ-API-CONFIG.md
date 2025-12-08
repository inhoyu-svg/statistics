# viz-api.js JSON 설정 가이드

도수분포표/차트를 생성하기 위한 JSON 설정 문서

---

## Quick Start (최소 설정)

> 이것만 있으면 동작합니다.

### 차트 (최소)

```json
{
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75]
}
```

### 테이블 (최소)

```json
{
  "purpose": "table",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75]
}
```

> **주의**: 테이블은 반드시 `"purpose": "table"` 명시 필요

---

## 용어 설명

### 통계 용어

| 용어 | 영문 | 설명 |
|:-----|:-----|:-----|
| **계급** | class | 데이터를 나누는 구간 (예: 60이상~70미만) |
| **계급 개수** | classCount | 데이터를 몇 개의 구간으로 나눌지 |
| **계급 간격** | classWidth | 각 구간의 너비 (예: 10이면 60~70, 70~80, ...) |
| **계급값** | midpoint | 각 계급의 중앙값 (예: 60~70이면 65) |
| **도수** | frequency | 각 계급에 속하는 데이터의 개수 |
| **상대도수** | relativeFrequency | 전체 대비 해당 계급의 비율 (0~1 소수) |
| **누적도수** | cumulativeFrequency | 해당 계급까지의 도수 합계 |
| **누적상대도수** | cumulativeRelativeFrequency | 해당 계급까지의 상대도수 합계 |
| **탈리** | tally | 도수를 막대기 표시로 나타낸 것 (//// 형태) |
| **히스토그램** | histogram | 도수를 막대 높이로 표현한 차트 |
| **도수다각형** | frequency polygon | 각 계급의 중앙값에 점을 찍고 선으로 연결한 그래프 |
| **도수분포표** | frequency table | 계급별 도수를 정리한 표 |
| **줄기와 잎 그림** | stem-and-leaf plot | 줄기(십의 자리)와 잎(일의 자리)으로 데이터 분포를 표현 |
| **이원분류표** | cross table | 두 가지 기준으로 데이터를 분류한 표 |
| **카테고리 행렬** | category matrix | 행/열 카테고리와 값을 가진 표 형태

### 설정 객체 용어

#### 최상위 객체

| 용어 | JSON 경로 | 설명 | 적용 대상 |
|:-----|:----------|:-----|:----------|
| **data** | `data` | 렌더링할 숫자 데이터 배열 (필수) | 전체 |
| **purpose** | `purpose` | 렌더링 목적 (`"chart"` / `"table"`) | 전체 |
| **tableType** | `tableType` | 테이블 유형 (`"frequency"` / `"cross-table"` / `"category-matrix"` / `"stem-leaf"`) | 테이블 |
| **config** | `config` | 계급 설정 (개수, 간격, 범위) | 차트/테이블 |
| **classCount** | `classCount` | 계급 개수 (기본: 5) | 차트/테이블 |
| **classWidth** | `classWidth` | 계급 간격 (자동 계산) | 차트/테이블 |
| **classRange** | `classRange` | 계급 범위 수동 설정 (`{ firstEnd, secondEnd, lastStart }`) | 차트/테이블 |
| **canvasSize** | `canvasSize` | 정사각형 캔버스 크기 (우선 적용) | 차트 |
| **canvasWidth** | `canvasWidth` | 캔버스 너비 (기본: 700) | 차트 |
| **canvasHeight** | `canvasHeight` | 캔버스 높이 (기본: 450) | 차트 |
| **options** | `options` | 차트/테이블 세부 설정을 담는 객체 | 전체 |
| **animation** | `animation` | 애니메이션 활성화 여부 | 차트/테이블 |
| **cellAnimations** | `cellAnimations` | 셀 하이라이트 애니메이션 배열 | 모든 테이블 |
| **cellVariables** | `cellVariables` | 셀 값 커스터마이징 (rowIndex/colIndex 기반) | 줄기-잎 |

#### options 하위 객체 (차트)

| 용어 | JSON 경로 | 설명 |
|:-----|:----------|:-----|
| **showHistogram** | `options.showHistogram` | 히스토그램 표시 여부 (기본: true) |
| **showPolygon** | `options.showPolygon` | 도수다각형 표시 여부 (기본: true) |
| **dataType** | `options.dataType` | Y축 데이터 타입 (`"frequency"` / `"relativeFrequency"`) |
| **axisLabels** | `options.axisLabels` | X축/Y축 라벨 커스터마이징 (`{ xAxis, yAxis }`) |
| **grid** | `options.grid` | 격자선 설정 (`{ showHorizontal, showVertical }`) |
| **axis** | `options.axis` | 축 라벨 표시 설정 (`{ showYLabels, showXLabels, yLabelFormat }`) |
| **callout** | `options.callout` | 말풍선 설정 (`{ enabled, template, preset }`) |
| **showDashedLines** | `options.showDashedLines` | 수직 파선 표시 (다각형 점 → X축) |
| **congruentTriangles** | `options.congruentTriangles` | 합동 삼각형 설정 (`{ enabled, boundary }`) |
| **triangleLabels** | `options.triangleLabels` | 합동삼각형 라벨 (`["S₁", "S₂"]`) |
| **customBarLabels** | `options.customBarLabels` | 막대 내부 커스텀 라벨 배열 |
| **customYInterval** | `options.customYInterval` | Y축 간격 커스텀 |
| **corruption** | `options.corruption` | 찢김 효과 설정 (`{ enabled, cells, maskAxisLabels, style }`) |
| **histogramColorPreset** | `options.histogramColorPreset` | 히스토그램 색상 프리셋 |
| **histogramColor** | `options.histogramColor` | 히스토그램 커스텀 색상 |
| **polygonColorPreset** | `options.polygonColorPreset` | 다각형 색상 프리셋 |
| **polygonColor** | `options.polygonColor` | 다각형 커스텀 색상 |

#### options 하위 객체 (테이블)

| 용어 | JSON 경로 | 설명 |
|:-----|:----------|:-----|
| **tableConfig** | `options.tableConfig` | 도수분포표 컬럼 설정 (표시/순서/라벨) |
| **crossTable** | `options.crossTable` | 이원분류표 전용 설정 (합계/병합헤더) |
| **corruption** | `options.corruption` | 찢김 효과 설정 (`{ enabled, cells, style }`) |

#### tableConfig 하위 객체

| 용어 | JSON 경로 | 설명 |
|:-----|:----------|:-----|
| **visibleColumns** | `options.tableConfig.visibleColumns` | 컬럼 표시 여부 배열 (`[true, false, ...]`) |
| **columnOrder** | `options.tableConfig.columnOrder` | 컬럼 순서 배열 (`[0, 1, 2, ...]`) |
| **labels** | `options.tableConfig.labels` | 컬럼 라벨 설정 (`{ class, frequency, ... }`) |
| **showSuperscript** | `options.tableConfig.showSuperscript` | "이상/미만" 표시 여부 |
| **showSummaryRow** | `options.tableConfig.showSummaryRow` | 합계 행 표시 여부 |
| **cellVariables** | `options.tableConfig.cellVariables` | 셀 값 커스터마이징 배열 |

#### crossTable 하위 객체

| 용어 | JSON 경로 | 설명 |
|:-----|:----------|:-----|
| **showTotal** | `options.crossTable.showTotal` | 합계 행 표시 여부 |
| **showMergedHeader** | `options.crossTable.showMergedHeader` | 병합 헤더 표시 여부 |

---

## JSON 구조 개요

> 전체 설정의 계층 구조입니다. 한눈에 어떤 옵션이 어디에 위치하는지 확인하세요.

```
config (최상위)
│
├── data                    (필수) 숫자 배열 또는 특수 문자열
├── purpose                 "chart" | "table"
├── tableType               "frequency" | "cross-table" | "category-matrix" | "stem-leaf"
├── classCount              계급 개수 (기본: 5)
├── classWidth              계급 간격 (자동 계산)
├── classRange              계급 범위 커스터마이징 { firstEnd, secondEnd, lastStart }
├── canvasSize              정사각형 캔버스 크기 (차트 전용, 우선 적용)
├── canvasWidth             캔버스 너비
├── canvasHeight            캔버스 높이
├── animation               true | false
│
├── options                 ─────────────────────────────────
│   │
│   │  [차트 전용]
│   ├── showHistogram       히스토그램 표시 여부
│   ├── showPolygon         도수다각형 표시 여부
│   ├── dataType            "frequency" | "relativeFrequency"
│   ├── histogramColorPreset / histogramColor   막대 색상
│   ├── polygonColorPreset / polygonColor       다각형 색상
│   ├── axisLabels          { xAxis, yAxis }
│   ├── callout             { enabled, template, preset } 말풍선 설정
│   ├── showDashedLines     수직 파선 표시 (다각형 점 → Y축)
│   ├── grid                { showHorizontal, showVertical } 격자선 설정
│   ├── axis                { showYLabels, showXLabels, yLabelFormat } 축 라벨 설정
│   ├── congruentTriangles  { enabled, boundary } 합동 삼각형 설정
│   ├── triangleLabels      ["S₁", "S₂"] 합동삼각형 라벨 배열
│   ├── customYInterval     Y축 간격 커스텀
│   ├── customBarLabels     ["A", null, "B"] 막대 내부 라벨 배열
│   │
│   │  [차트/테이블 공통]
│   ├── corruption          { enabled, cells, maskAxisLabels, style } 찢김 효과
│   │
│   │  [도수분포표 전용]
│   ├── tableConfig         ─────────────────────────
│   │   ├── visibleColumns  [true, false, ...] 7개
│   │   ├── columnOrder     [0, 1, 2, ...] 순서
│   │   ├── labels          { class, frequency, ... }
│   │   ├── showSuperscript "이상/미만" 표시
│   │   ├── showSummaryRow  합계 행 표시
│   │   └── cellVariables   [{ rowIndex, colIndex, value }, ...]
│   │
│   │  [이원분류표 전용]
│   └── crossTable          ─────────────────────────
│       ├── showTotal       합계 행 표시
│       └── showMergedHeader 병합 헤더 표시
│   
├── cellAnimations          [{ rowIndex, colIndex, rowStart, rowEnd, colStart, colEnd, duration, repeat }, ...]
│
├── cellAnimationOptions    { blinkEnabled: true/false }
│
└── cellVariables           [{ rowIndex, colIndex, value }, ...]  (줄기-잎 전용)
```

---

# 공통 설정

> 차트와 테이블 모두에서 사용되는 필드입니다.

## 필드 목록

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|:-----|:-----|:----:|:------:|:-----|
| `data` | `number[]` | **O** | - | 변량 데이터 배열 |
| `purpose` | `string` | X | `"chart"` | 렌더링 목적 |
| `classCount` | `number` | X | `5` | 계급 개수 |
| `classWidth` | `number` | X | 자동 | 계급 간격 |
| `classRange` | `object` | X | - | 계급 범위 수동 설정 (classCount/classWidth 무시) |
| `animation` | `boolean` \| `object` | X | `true` | 애니메이션 활성화 |

---

## 필드별 동작

### data (필수)

렌더링할 숫자 데이터 배열입니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `number[]` (숫자 배열) |
| **필수 여부** | **필수** |
| **동작** | 배열의 숫자들을 파싱하여 통계 계산 수행 |
| **오류 시** | 유효한 숫자가 없으면 `{ error: "No valid numeric data found" }` 반환 |

```json
{
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75]
}
```

---

### purpose

렌더링 목적을 지정합니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `string` |
| **필수 여부** | 선택 |
| **기본값** | `"chart"` |
| **가능한 값** | `"chart"`, `"table"` |
| **동작** | `"chart"`: 히스토그램 렌더링, `"table"`: 도수분포표 렌더링 |

```json
{
  "purpose": "table",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75]
}
```

---

### classCount

데이터를 몇 개의 계급으로 나눌지 지정합니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `number` |
| **필수 여부** | 선택 |
| **기본값** | `5` |
| **동작** | 데이터 범위를 `classCount`개의 구간으로 나눔 |
| **계산식** | `classWidth = Math.ceil((최댓값 - 최솟값) / classCount)` |

```json
{
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "classCount": 4
}
```

**결과**: 데이터가 4개 계급으로 나뉨

---

### classWidth

각 계급의 너비를 고정합니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `number` |
| **필수 여부** | 선택 |
| **기본값** | 자동 계산 (`Math.ceil(범위 / classCount)`) |
| **동작** | 지정 시 계급 간격 고정, `classCount`는 자동 조정됨 |
| **우선순위** | `classWidth` > `classCount` (둘 다 지정 시 `classWidth` 우선) |

```json
{
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "classWidth": 10
}
```

**결과**: 0~10, 10~20, 20~30, ... 형태의 계급 생성

---

### classRange

계급 범위를 직접 지정합니다. `classCount`, `classWidth`보다 우선 적용됩니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `object` |
| **필수 여부** | 선택 |
| **기본값** | - |
| **동작** | 지정된 범위로 계급 생성 |
| **우선순위** | `classRange` > `classWidth` > `classCount` |

| 하위 필드 | 타입 | 설명 | 예시 |
|:----------|:-----|:-----|:-----|
| `firstEnd` | `number` | 첫 번째 계급의 끝값 | `2` → 0이상~2미만 |
| `secondEnd` | `number` | 두 번째 계급의 끝값 (간격 결정) | `4` → 간격 2 |
| `lastStart` | `number` | 마지막 계급의 시작값 | `12` → 12이상~14미만 |

```json
{
  "data": [1, 3, 3, 5, 5, 5, 7, 7, 7, 7, 9, 9, 9, 11, 11],
  "classRange": {
    "firstEnd": 2,
    "secondEnd": 4,
    "lastStart": 12
  }
}
```

**결과**: 0~2, 2~4, 4~6, 6~8, 8~10, 10~12, 12~14 (간격 2, 7개 계급)

---

### animation

애니메이션 활성화 여부를 지정합니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `boolean` 또는 `object` |
| **필수 여부** | 선택 |
| **기본값** | `true` |
| **boolean 동작** | `true`: 애니메이션 활성화, `false`: 정적 이미지로 렌더링 |
| **object 동작** | `{ enabled: true/false }` 형태로 세부 제어 |

```json
{
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "animation": false
}
```

**결과**: 차트/테이블이 애니메이션 없이 정적 이미지로 렌더링

---

# 차트 (Chart)

> 히스토그램과 도수다각형을 Canvas에 렌더링합니다.

## 차트 구성 요소

### 1. 히스토그램 (Histogram)

| 항목 | 설명 |
|:-----|:-----|
| 표현 방식 | 각 계급의 도수를 **막대 높이**로 표현 |
| 스타일 | 그라데이션 색상 막대 |
| X축 | 계급 구간 |
| Y축 | 도수 또는 상대도수 |

### 2. 도수다각형 (Frequency Polygon)

| 항목 | 설명 |
|:-----|:-----|
| 표현 방식 | 각 계급의 **중앙값**에 점을 찍고 선으로 연결 |
| 점 | 단색 원 |
| 선 | 그라데이션 색상 |
| 위치 | 히스토그램 위에 오버레이 |

---

## 차트 전용 필드

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|:-----|:-----|:----:|:------:|:-----|
| `canvasWidth` | `number` | X | `700` | 캔버스 가로 크기 (px) |
| `canvasHeight` | `number` | X | `450` | 캔버스 세로 크기 (px) |
| `canvasSize` | `number` | X | - | 정사각형 캔버스 크기 (우선 적용) |
| `options.showHistogram` | `boolean` | X | `true` | 히스토그램 표시 |
| `options.showPolygon` | `boolean` | X | `true` | 도수다각형 표시 |
| `options.dataType` | `string` | X | `"relativeFrequency"` | Y축 데이터 타입 |
| `options.axisLabels` | `object` | X | `null` | 축 라벨 커스터마이징 |
| `options.histogramColorPreset` | `string` | X | `"default"` | 히스토그램 색상 프리셋 |
| `options.polygonColorPreset` | `string` | X | `"default"` | 다각형 색상 프리셋 |
| `options.histogramColor` | `string` \| `object` | X | - | 히스토그램 커스텀 색상 |
| `options.polygonColor` | `string` \| `object` | X | - | 다각형 커스텀 색상 |
| `options.callout` | `object` | X | - | 말풍선(콜아웃) 설정 |
| `options.showDashedLines` | `boolean` | X | `false` | 수직 파선 표시 |
| `options.grid` | `object` | X | `{ showHorizontal: true, showVertical: true }` | 격자선 설정 |
| `options.axis` | `object` | X | `{ showYLabels: true, showXLabels: true }` | 축 라벨 표시 설정 |
| `options.congruentTriangles` | `object` | X | - | 합동 삼각형 설정 |
| `options.customYInterval` | `number` | X | `null` | Y축 간격 커스텀 |
| `options.customBarLabels` | `array` | X | - | 막대 내부 라벨 배열 (null은 스킵) |

---

## 차트 필드별 동작

### 캔버스 크기 설정

차트 캔버스 크기를 지정하는 방법은 두 가지입니다:

#### 1. canvasWidth / canvasHeight (권장)

가로/세로 크기를 개별적으로 지정합니다.

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|:-----|:-----|:----:|:------:|:-----|
| `canvasWidth` | `number` | X | `700` | 캔버스 가로 크기 (px) |
| `canvasHeight` | `number` | X | `450` | 캔버스 세로 크기 (px) |

```json
{
  "purpose": "chart",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "canvasWidth": 800,
  "canvasHeight": 500
}
```

**결과**: 800x500px 크기의 직사각형 차트 생성

#### 2. canvasSize (정사각형 단축 옵션)

정사각형 캔버스를 간편하게 생성합니다.

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|:-----|:-----|:----:|:------:|:-----|
| `canvasSize` | `number` | X | - | 정사각형 캔버스 크기 (width = height) |

```json
{
  "purpose": "chart",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "canvasSize": 500
}
```

**결과**: 500x500px 크기의 정사각형 차트 생성

#### 우선순위

`canvasSize`가 지정되면 `canvasWidth`/`canvasHeight`보다 우선 적용됩니다.

| 설정 | 결과 |
|:-----|:-----|
| 아무것도 설정 안 함 | 700x450 (기본값) |
| `canvasWidth: 800` | 800x450 |
| `canvasHeight: 600` | 700x600 |
| `canvasWidth: 800, canvasHeight: 600` | 800x600 |
| `canvasSize: 500` | 500x500 (정사각형) |
| `canvasSize: 500, canvasWidth: 800` | 500x500 (canvasSize 우선) |

---

### options.showHistogram

히스토그램(막대) 표시 여부를 지정합니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `boolean` |
| **필수 여부** | 선택 |
| **기본값** | `true` |
| **동작** | `true`: 막대 표시, `false`: 막대 숨김 |

```json
{
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "options": {
    "showHistogram": false
  }
}
```

**결과**: 도수다각형(점+선)만 표시됨

---

### options.showPolygon

도수다각형(점+선) 표시 여부를 지정합니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `boolean` |
| **필수 여부** | 선택 |
| **기본값** | `true` |
| **동작** | `true`: 점+선 표시, `false`: 점+선 숨김 |

```json
{
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "options": {
    "showPolygon": false
  }
}
```

**결과**: 히스토그램(막대)만 표시됨

---

### options.dataType

Y축 데이터 타입을 지정합니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `string` |
| **필수 여부** | 선택 |
| **기본값** | `"relativeFrequency"` |
| **가능한 값** | `"relativeFrequency"`, `"frequency"` |
| **대소문자** | `dataType`, `datatype` 모두 지원 |

| 값 | 설명 | Y축 표시 예시 |
|:---|:-----|:-------------|
| `"relativeFrequency"` | 상대도수 | 0.00, 0.10, 0.20, ... |
| `"frequency"` | 도수 | 0, 1, 2, 3, ... |

```json
{
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "options": {
    "dataType": "frequency"
  }
}
```

**결과**: Y축이 도수(개수)로 표시됨

---

### options.axisLabels

축 끝에 표시될 라벨을 커스터마이징합니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `object` |
| **필수 여부** | 선택 |
| **기본값** | `null` (기본 라벨 사용) |
| **동작** | X축/Y축 끝에 괄호로 감싼 라벨 표시 |

| 속성 | 타입 | 필수 | 설명 | 표시 결과 |
|:-----|:-----|:----:|:-----|:----------|
| `xAxis` | `string` | X | X축 라벨 | `"(점수)"` |
| `yAxis` | `string` | X | Y축 라벨 | `"(비율)"` |

```json
{
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "options": {
    "axisLabels": {
      "xAxis": "점수",
      "yAxis": "비율"
    }
  }
}
```

**결과**: 축 끝에 "(점수)", "(비율)" 라벨이 표시됨

---

## 색상 설정 (Color Settings)

> 차트의 색상 테마를 변경할 수 있습니다.

### 색상 규칙 가이드

차트와 테이블에서 일관된 색상 체계를 위한 **권장 규칙**입니다.

#### 색상 팔레트

| 이름 | 그라디언트 | 단색 (점) |
|:-----|:----------|:---------|
| 녹색 | `#AEFF7E` → `#68994C` | `#8DCF66` |
| 파랑 | `#54A0F6` → `#6DE0FC` | `#61C1F9` |
| 빨강 | `#D15DA4` → `#E178F2` | `#D96BCB` |
| 주황 | `#F3A257` → `#FA716F` | `#F68D61` |

> 히스토그램 파랑 채우기: `#4141A3` → `#2CA0E8` (alpha: 0.5)

#### 테이블 셀 하이라이트

| 조건 | 색상 | Fill (30%) | Stroke (100%) |
|:-----|:-----|:-----------|:--------------|
| 단일 그룹 하이라이트 | 녹색 | `rgba(141, 207, 102, 0.3)` | `#8DCF66` |
| 복수 그룹 - 첫 번째 | 파랑 | `rgba(97, 193, 249, 0.3)` | `#61C1F9` |
| 복수 그룹 - 두 번째 | 빨강 | `rgba(217, 107, 203, 0.3)` | `#D96BCB` |
| 복수 그룹 - 세 번째 | 주황 | `rgba(246, 141, 97, 0.3)` | `#F68D61` |

> Stroke 두께: `2px`

#### 차트 색상 규칙

**히스토그램 색상**

| 상황 | Fill (alpha) | Stroke |
|:-----|:-------------|:-------|
| 히스토그램 단독 | `#AEFF7E` → `#68994C` (0.3) | `#AEFF7E` → `#68994C` |
| 히스토그램 + 다각형 | `#4141A3` → `#2CA0E8` (0.5) | `#54A0F6` → `#6DE0FC` |

**도수다각형 색상**

| 상황 | Line (Stroke) | Point (Fill) |
|:-----|:--------------|:-------------|
| 단독 (1개) | `#AEFF7E` → `#68994C` | `#8DCF66` |
| 복수 - 첫 번째 | `#54A0F6` → `#6DE0FC` | `#61C1F9` |
| 복수 - 두 번째 | `#D15DA4` → `#E178F2` | `#D96BCB` |
| 복수 - 세 번째 | `#F3A257` → `#FA716F` | `#F68D61` |
| 히스토그램과 함께 - 첫 번째 | `#AEFF7E` → `#68994C` | `#8DCF66` |
| 히스토그램과 함께 - 두 번째 | `#D15DA4` → `#E178F2` | `#D96BCB` |
| 히스토그램과 함께 - 세 번째 | `#F3A257` → `#FA716F` | `#F68D61` |

> **중요**: 히스토그램과 도수다각형이 함께 사용될 때는 **동일한 색상 계열을 사용하지 않습니다.**
> - 히스토그램: 파랑 계열
> - 도수다각형: 녹색/빨강/주황 계열 (파랑 `primary` 제외)

#### 색상 규칙 요약

```
┌──────────────────────────────────────────────────────────────────────┐
│  히스토그램 단독        → 녹색 (#AEFF7E → #68994C)                   │
│  도수다각형 단독 (1개)  → 녹색 (#AEFF7E → #68994C)                   │
│  도수다각형 단독 (복수) → 파랑 → 빨강 → 주황 (녹색 X)                │
│  히스토그램 + 다각형    → 히스토그램: 파랑 / 다각형: 녹색→빨강→주황  │
└──────────────────────────────────────────────────────────────────────┘
```

---

### 옵션 우선순위

```
커스텀 색상 (histogramColor/polygonColor) > 프리셋 > 기본값
```

| 순위 | 옵션 | 설명 |
|:----:|:-----|:-----|
| 1 | `histogramColor` / `polygonColor` | 커스텀 색상 (최우선) |
| 2 | `histogramColorPreset` / `polygonColorPreset` | 프리셋 선택 |
| 3 | 기본값 | `"default"` 프리셋 |

---

### options.histogramColorPreset

히스토그램 색상 프리셋을 선택합니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `string` |
| **필수 여부** | 선택 |
| **기본값** | `"default"` |
| **대소문자** | `histogramColorPreset`, `histogramcolorpreset` 모두 지원 |

#### 프리셋 목록

| 값 | 채우기 | 테두리 | 투명도 |
|:---|:-------|:-------|:------:|
| `"default"` | #4141A3 → #2CA0E8 | #54A0F6 → #6DE0FC | 0.5 |
| `"green"` | #AEFF7E → #68994C | #AEFF7E → #68994C | 0.3 |

```json
{
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "options": {
    "histogramColorPreset": "green"
  }
}
```

**결과**: 초록색 계열 히스토그램 표시

---

### options.polygonColorPreset

다각형 색상 프리셋을 선택합니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `string` |
| **필수 여부** | 선택 |
| **기본값** | `"default"` |
| **대소문자** | `polygonColorPreset`, `polygoncolorpreset` 모두 지원 |

#### 프리셋 목록

| 값 | 선 | 점 |
|:---|:---|:---|
| `"default"` | #AEFF7E → #68994C | #8DCF66 |
| `"primary"` | #54A0F6 → #6DE0FC | #61C1F9 |
| `"secondary"` | #D15DA4 → #E178F2 | #D96BCB |
| `"tertiary"` | #F3A257 → #FA716F | #F68D61 |

```json
{
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "options": {
    "polygonColorPreset": "primary"
  }
}
```

**결과**: 파란색 계열 도수다각형 표시

---

### options.histogramColor

히스토그램 커스텀 색상을 지정합니다. 프리셋보다 우선 적용됩니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `string` 또는 `object` |
| **필수 여부** | 선택 |
| **기본값** | - (프리셋 사용) |
| **우선순위** | 프리셋보다 높음 |

#### 타입 1: 단색 문자열

채우기와 테두리 모두 같은 색상이 적용됩니다.

```json
{
  "options": {
    "histogramColor": "#AEFF7E"
  }
}
```

| 동작 | 설명 |
|:-----|:-----|
| `fillStart` | `#AEFF7E` |
| `fillEnd` | `#AEFF7E` |
| `strokeStart` | `#AEFF7E` |
| `strokeEnd` | `#AEFF7E` |
| `alpha` | 기본값 (`0.5`) |

---

#### 타입 2: CSS 그라데이션 문자열

CSS `linear-gradient()` 문법을 파싱하여 적용합니다.

```json
{
  "options": {
    "histogramColor": "linear-gradient(180deg, #AEFF7E 0%, #68994C 100%)"
  }
}
```

| 동작 | 설명 |
|:-----|:-----|
| `fillStart` | `#AEFF7E` (시작색) |
| `fillEnd` | `#68994C` (끝색) |
| `strokeStart` | `#AEFF7E` (시작색) |
| `strokeEnd` | `#68994C` (끝색) |
| `alpha` | 기본값 (`0.5`) |

---

#### 타입 3: 객체 (세부 제어)

채우기, 테두리, 투명도를 개별적으로 설정합니다.

| 속성 | 타입 | 필수 | 기본값 | 설명 |
|:-----|:-----|:----:|:------:|:-----|
| `fill` | `string` | X | 프리셋 값 | 막대 채우기 색상 |
| `stroke` | `string` | X | 프리셋 값 | 막대 테두리 색상 |
| `alpha` | `number` | X | `0.5` | 막대 전체 투명도 (0~1) |

```json
{
  "options": {
    "histogramColor": {
      "fill": "linear-gradient(180deg, rgba(174, 255, 126, 0.3) 0%, rgba(104, 153, 76, 0.3) 100%)",
      "stroke": "linear-gradient(180deg, #AEFF7E 0%, #68994C 100%)",
      "alpha": 0.3
    }
  }
}
```

| 동작 | 설명 |
|:-----|:-----|
| `fill` 지정 시 | 그라데이션이면 시작/끝색 추출, 단색이면 그대로 사용 |
| `stroke` 지정 시 | 그라데이션이면 시작/끝색 추출, 단색이면 그대로 사용 |
| `alpha` 지정 시 | 막대 렌더링 시 `globalAlpha`로 적용 |
| 미지정 속성 | 기본 프리셋(`default`) 값 사용 |

---

### options.polygonColor

도수다각형 커스텀 색상을 지정합니다. 프리셋보다 우선 적용됩니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `string` 또는 `object` |
| **필수 여부** | 선택 |
| **기본값** | - (프리셋 사용) |
| **우선순위** | 프리셋보다 높음 |

#### 타입 1: 단색 문자열

선과 점 모두 같은 색상이 적용됩니다.

```json
{
  "options": {
    "polygonColor": "#54A0F6"
  }
}
```

| 동작 | 설명 |
|:-----|:-----|
| `gradientStart` | `#54A0F6` |
| `gradientEnd` | `#54A0F6` |
| `pointColor` | `#54A0F6` |

---

#### 타입 2: CSS 그라데이션 문자열

CSS `linear-gradient()` 문법을 파싱하여 적용합니다.

```json
{
  "options": {
    "polygonColor": "linear-gradient(180deg, #54A0F6 0%, #6DE0FC 100%)"
  }
}
```

| 동작 | 설명 |
|:-----|:-----|
| `gradientStart` | `#54A0F6` (시작색) |
| `gradientEnd` | `#6DE0FC` (끝색) |
| `pointColor` | `#54A0F6` (시작색) |

---

#### 타입 3: 객체 (세부 제어)

선과 점 색상을 개별적으로 설정합니다.

| 속성 | 타입 | 필수 | 기본값 | 설명 |
|:-----|:-----|:----:|:------:|:-----|
| `line` | `string` | X | 프리셋 값 | 선 색상 (단색 또는 그라데이션) |
| `point` | `string` | X | 프리셋 값 | 점 색상 (단색만) |

```json
{
  "options": {
    "polygonColor": {
      "line": "linear-gradient(180deg, #54A0F6 0%, #6DE0FC 100%)",
      "point": "#61C1F9"
    }
  }
}
```

| 동작 | 설명 |
|:-----|:-----|
| `line` 지정 시 | 그라데이션이면 시작/끝색 추출, 단색이면 그대로 사용 |
| `point` 지정 시 | 단색으로 점에 적용 |
| 미지정 속성 | 기본 프리셋(`default`) 값 사용 |

---

### 지원하는 색상 형식

| 형식 | 예시 | 사용 가능 속성 |
|:-----|:-----|:--------------|
| HEX | `#AEFF7E`, `#FFF` | 모든 색상 속성 |
| RGB | `rgb(174, 255, 126)` | 모든 색상 속성 |
| RGBA | `rgba(174, 255, 126, 0.3)` | 모든 색상 속성 |
| CSS Gradient | `linear-gradient(180deg, #AEFF7E 0%, #68994C 100%)` | `fill`, `stroke`, `line` |

### 지원하는 그라데이션 방향

| 값 | 설명 | 방향 |
|:---|:-----|:-----|
| `180deg` | 위 → 아래 | 기본값 |
| `0deg` | 아래 → 위 | |
| `90deg` | 왼쪽 → 오른쪽 | |
| `270deg` | 오른쪽 → 왼쪽 | |
| `to bottom` | 위 → 아래 | `180deg`와 동일 |
| `to top` | 아래 → 위 | `0deg`와 동일 |

---

### options.callout

차트에 말풍선(콜아웃)을 표시합니다. 도수다각형의 라벨을 표시할 때 사용합니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `object` |
| **필수 여부** | 선택 |
| **기본값** | - (표시 안 함) |
| **적용 대상** | 도수다각형 |

#### 하위 필드

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|:-----|:-----|:----:|:------:|:-----|
| `enabled` | `boolean` | X | `false` | 말풍선 표시 여부 |
| `template` | `string` | X | - | 말풍선에 표시할 텍스트 |
| `preset` | `string` | X | `"default"` | 색상 프리셋 (polygonColorPreset과 동일) |

#### 예시: 기본 말풍선

```json
{
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "options": {
    "showPolygon": true,
    "callout": {
      "enabled": true,
      "template": "남학생"
    }
  }
}
```

**결과**: 도수다각형 위에 "남학생" 말풍선 표시

#### 예시: 색상 프리셋 적용

```json
{
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "options": {
    "showPolygon": true,
    "polygonColorPreset": "primary",
    "callout": {
      "enabled": true,
      "template": "여학생",
      "preset": "primary"
    }
  }
}
```

**결과**: 파란색 도수다각형 + 파란색 "여학생" 말풍선

#### 프리셋 목록

| 값 | 배경색 | 텍스트색 |
|:---|:-------|:---------|
| `"default"` | 녹색 계열 | 흰색 |
| `"primary"` | 파란색 계열 | 흰색 |
| `"secondary"` | 분홍색 계열 | 흰색 |
| `"tertiary"` | 주황색 계열 | 흰색 |

> **팁**: `callout.preset`은 `polygonColorPreset`과 동일한 값을 사용하면 색상이 일관됩니다.
> **권장**: `callout.preset`은 따로 넣지 않아도 도수다각형의 색상 규칙에 따라 동일한 색상으로 출력되어 굳이 넣지 않아도 됩니다.

---

### options.customBarLabels

막대 내부에 커스텀 라벨을 표시합니다. 넓이비, 비율, 문자 등을 막대 안에 표시할 때 사용합니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `array` |
| **필수 여부** | 선택 |
| **기본값** | - |

배열 인덱스 순서대로 막대에 라벨 적용. `null`은 해당 막대 스킵.

#### 예시: 넓이비 표시

```json
{
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "options": {
    "customBarLabels": ["1", "2", "3", "2", "1"]
  }
}
```

#### 예시: 특정 막대에만 라벨

```json
{
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "options": {
    "customBarLabels": ["A", null, "B", null, "C"]
  }
}
```

> **팁**: 라벨은 KaTeX 수식을 지원합니다. 예: `"\\frac{1}{2}"` → ½ 분수 표시

---

### options.showDashedLines

다각형의 각 점에서 Y축까지 수직 파선을 표시합니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `boolean` |
| **필수 여부** | 선택 |
| **기본값** | `false` |
| **파선 색상** | 히스토그램 색상 프리셋에 따라 자동 설정 |
| **렌더링 순서** | 히스토그램 뒤에 렌더링 (파선이 막대에 가려짐) |
| **애니메이션** | 히스토그램 완료 후 순차적으로 그려지며, 완료 시 Y축에 값 라벨 표시 |

> **권장**: 파선 활성화 시 Y축 끝점에 값 라벨이 자동 생성되므로, 기존 Y축 라벨과 중복을 피하려면 `options.axis.showYLabels: false`를 함께 설정하세요.

```json
{
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "options": {
    "showDashedLines": true,
    "axis": {
      "showYLabels": false
    }
  }
}
```

**결과**: 도수다각형의 각 점에서 Y축까지 수직 파선이 그려지고, 파선 끝점에 값 라벨이 표시됩니다.

---

### options.grid

격자선 표시 설정입니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `object` |
| **필수 여부** | 선택 |
| **하위 속성** | `showHorizontal`, `showVertical` |

#### 하위 속성

| 속성 | 타입 | 기본값 | 설명 |
|:-----|:-----|:------:|:-----|
| `showHorizontal` | `boolean` | `true` | 가로 격자선 표시 |
| `showVertical` | `boolean` | `true` | 세로 격자선 표시 |

```json
{
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "options": {
    "grid": {
      "showHorizontal": true,
      "showVertical": false
    }
  }
}
```

**결과**: 가로 격자선만 표시됩니다.

---

### options.axis

축 라벨 표시 설정입니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `object` |
| **필수 여부** | 선택 |
| **하위 속성** | `showYLabels`, `showXLabels`, `yLabelFormat` |

#### 하위 속성

| 속성 | 타입 | 기본값 | 설명 |
|:-----|:-----|:------:|:-----|
| `showYLabels` | `boolean` | `true` | Y축 값 라벨 표시 (0과 축 제목은 항상 표시) |
| `showXLabels` | `boolean` | `true` | X축 값 라벨 표시 (축 제목은 항상 표시) |
| `yLabelFormat` | `string` | `"decimal"` | `"decimal"` (0.03) 또는 `"percent"` (3%) |

> **참고**: `showYLabels: false` 또는 `showXLabels: false`로 설정해도 축의 시작점(0)과 끝점(축 제목)은 항상 표시됩니다.

```json
{
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "options": {
    "axis": {
      "showYLabels": true,
      "showXLabels": true,
      "yLabelFormat": "percent"
    }
  }
}
```

**결과**: Y축 라벨이 백분율(%)로 표시됩니다.

---

### options.congruentTriangles

합동 삼각형 표시 설정입니다. 히스토그램과 도수다각형 사이의 넓이가 같은 삼각형을 시각화합니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `object` |
| **필수 여부** | 선택 |
| **하위 속성** | `enabled`, `boundary` |

#### 하위 속성

| 속성 | 타입 | 기본값 | 설명 |
|:-----|:-----|:------:|:-----|
| `enabled` | `boolean` | `false` | 합동 삼각형 표시 여부 |
| `boundary` | `number` | - | 삼각형이 표시될 계급의 max 값 |

```json
{
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "classWidth": 10,
  "options": {
    "congruentTriangles": {
      "enabled": true,
      "boundary": 70
    }
  }
}
```

**결과**: 60~70 계급과 70~80 계급 사이에 합동 삼각형(S₁, S₂)이 표시됩니다.

---

### options.customYInterval

Y축 간격을 사용자가 직접 지정합니다. 자동 계산 대신 고정된 간격을 사용합니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `number` |
| **필수 여부** | 선택 |
| **기본값** | `null` (자동 계산) |
| **권장 값** | 도수 모드: 정수 (1, 2, 5, 10), 상대도수 모드: 소수 (0.05, 0.1) |

```json
{
  "data": [1, 3, 5, 7, 9, 11],
  "options": {
    "dataType": "frequency",
    "customYInterval": 2
  }
}
```

**결과**: Y축이 0, 2, 4, 6, 8... 간격으로 표시됩니다.

---

### options.corruption

차트 또는 테이블의 특정 영역에 "찢김" 효과를 적용합니다. 통계 문제에서 "일부가 찢어져 보이지 않는" 상황을 표현할 때 사용합니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `object` |
| **필수 여부** | 선택 |
| **기본값** | `{ enabled: false }` |

#### 하위 속성

| 속성 | 타입 | 기본값 | 설명 |
|:-----|:-----|:------:|:-----|
| `enabled` | `boolean` | `false` | 찢김 효과 활성화 |
| `cells` | `string[]` | `[]` | 마스킹할 셀 범위 배열 |
| `maskAxisLabels` | `boolean` | `true` | 축에 닿는 범위일 때 축 라벨도 마스킹 |
| `style` | `object` | - | 스타일 옵션 |

#### cells 형식 (차트)

차트의 좌표 시스템: `x-y` 형식 (x축이 먼저, 0-0 = 좌측 하단)

| 형식 | 설명 | 예시 |
|:-----|:-----|:-----|
| `"x-y"` | 단일 셀 | `"1-2"` → x=1, y=2 위치 |
| `"x1-y1:x2-y2"` | 셀 범위 | `"1-1:2-3"` → x=1~2, y=1~3 영역 |

#### cells 형식 (테이블)

| 형식 | 설명 | 예시 |
|:-----|:-----|:-----|
| `"row:N"` | 행 전체 | `"row:2"` → 2번째 행 전체 |
| `"col:N"` | 열 전체 | `"col:1"` → 1번째 열 전체 |
| `"R-C"` | 단일 셀 | `"2-1"` → row=2, col=1 |
| `"R1-C1:R2-C2"` | 셀 범위 | `"2-1:3-2"` → row=2~3, col=1~2 영역 |

#### style 하위 속성

| 속성 | 타입 | 기본값 | 설명 |
|:-----|:-----|:------:|:-----|
| `edgeComplexity` | `number` | `0.7` | 가장자리 불규칙성 (0~1) |
| `transparent` | `boolean` | `true` | 투명 모드 (배경이 비침) |
| `fiberEnabled` | `boolean` | `false` | 종이 섬유 효과 |
| `layerCount` | `number` | `1` | 다중 레이어 (1~3, 깊이감) |
| `edgeColorEnabled` | `boolean` | `false` | 가장자리 색상 효과 |

#### 차트 예시

```json
{
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "animation": false,
  "options": {
    "corruption": {
      "enabled": true,
      "cells": ["1-1:2-3"],
      "maskAxisLabels": true,
      "style": {
        "edgeComplexity": 0.7,
        "transparent": true,
        "fiberEnabled": true
      }
    }
  }
}
```

**결과**: 차트의 x=1~2, y=1~3 영역에 불규칙한 찢김 효과가 적용됩니다.

#### 테이블 예시

```json
{
  "purpose": "table",
  "tableType": "frequency",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "animation": false,
  "options": {
    "corruption": {
      "enabled": true,
      "cells": ["2-1:3-2"],
      "style": {
        "edgeComplexity": 0.7,
        "transparent": true
      }
    }
  }
}
```

**결과**: 테이블의 row=2~3, col=1~2 영역에 찢김 효과가 적용됩니다.

---

## 차트 전체 옵션 예시

### 최소 설정

```json
{
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75]
}
```

| 적용 값 | 설명 |
|:--------|:-----|
| `purpose` | `"chart"` (기본값) |
| `classCount` | `5` (기본값) |
| `canvasWidth` | `700` (기본값) |
| `canvasHeight` | `450` (기본값) |
| `dataType` | `"relativeFrequency"` (기본값) |

---

### 전체 설정

```json
{
  "purpose": "chart",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "classCount": 5,
  "classWidth": 10,
  "canvasSize": 600,
  "animation": true,
  "options": {
    "showHistogram": true,
    "showPolygon": true,
    "dataType": "frequency",
    "axisLabels": {
      "xAxis": "점수 구간",
      "yAxis": "학생 수(명)"
    },
    "histogramColor": {
      "fill": "linear-gradient(180deg, rgba(174, 255, 126, 0.3) 0%, rgba(104, 153, 76, 0.3) 100%)",
      "stroke": "linear-gradient(180deg, #AEFF7E 0%, #68994C 100%)",
      "alpha": 0.3
    },
    "polygonColor": {
      "line": "linear-gradient(180deg, #54A0F6 0%, #6DE0FC 100%)",
      "point": "#61C1F9"
    },
    "callout": {
      "enabled": true,
      "template": "남학생",
      "preset": "primary"
    },
    "showDashedLines": true,
    "grid": {
      "showHorizontal": true,
      "showVertical": false
    },
    "axis": {
      "showYLabels": true,
      "showXLabels": true,
      "yLabelFormat": "percent"
    },
    "congruentTriangles": {
      "enabled": true,
      "boundary": 70
    },
    "customYInterval": 2
  }
}
```

---

# 테이블 (Table)

> 다양한 테이블 형식을 Canvas에 렌더링합니다.

## 테이블 전용 필드

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|:-----|:-----|:----:|:------:|:-----|
| `tableType` | `string` | X | `"frequency"` | 테이블 타입 |
| `canvasWidth` | `number` | X | `600` | 캔버스 너비 (px) |
| `canvasHeight` | `number` | X | `400` | 캔버스 높이 (px) |
| `options.tableConfig` | `object` | X | `null` | 테이블 상세 설정 |
| `options.crossTable` | `object` | X | `null` | 이원분류표 전용 옵션 |
| `cellAnimations` | `array` | X | `null` | 셀 애니메이션 설정 |
| `cellAnimationOptions` | `object` | X | `null` | 애니메이션 재생 옵션 |

---

## 테이블 필드별 동작

### tableType

테이블 형식을 지정합니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `string` |
| **필수 여부** | 선택 |
| **기본값** | `"frequency"` |

| 값 | 이름 | 설명 | data 형식 |
|:---|:-----|:-----|:----------|
| `"frequency"` | 도수분포표 | 숫자 데이터를 계급별로 분류 | 숫자 배열 |
| `"category-matrix"` | 카테고리 행렬 | 카테고리별 데이터 비교 | 특수 문자열 |
| `"cross-table"` | 이원 분류표 | 두 변수의 교차 분류 | 특수 문자열 |
| `"stem-leaf"` | 줄기-잎 그림 | 데이터 분포 시각화 | 숫자 또는 특수 문자열 |

#### data 형식 비교표

| tableType | data 타입 | 형식 예시 |
|:----------|:----------|:----------|
| `frequency` | `number[]` | `[62, 87, 97, 73, 59]` |
| `category-matrix` | `string` | `"헤더: A, B, C\n행1: 10, 20, 30"` |
| `cross-table` | `string` | `"제목\n헤더: 라벨명, 열1, 열2\n행1: 값1, 값2"` |
| `stem-leaf` | `string` | `"162 178 175"` 또는 `"남: 162 178\n여: 160 165"` |

---

### canvasWidth / canvasHeight

테이블 캔버스 크기를 지정합니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `number` |
| **필수 여부** | 선택 |
| **기본값** | `canvasWidth: 600`, `canvasHeight: 400` |
| **단위** | 픽셀 (px) |
| **동작** | 지정된 크기의 직사각형 캔버스 생성 |

```json
{
  "purpose": "table",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "canvasWidth": 700,
  "canvasHeight": 500
}
```

**결과**: 700x500px 크기의 테이블 생성

---

## 타입별 data 형식

### 1. frequency (도수분포표)

숫자 배열 형식을 사용합니다.

| 항목 | 설명 |
|:-----|:-----|
| **형식** | `number[]` |
| **필수 필드** | `data` |
| **선택 필드** | `classCount`, `classWidth` |

```json
{
  "purpose": "table",
  "tableType": "frequency",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "classCount": 5
}
```

---

### 2. category-matrix (카테고리 행렬)

`헤더: 값들` + `라벨: 값들` 형식의 문자열을 사용합니다.

| 행 | 형식 | 설명 |
|:---|:-----|:-----|
| 1행 | `헤더: A, B, C, ...` | 열 이름들 |
| 2행~ | `라벨: 값1, 값2, ...` | 각 행의 데이터 |

> **비숫자 문자 지원**: 값에 숫자 외에 `_`, `?`, 영문자 등 임의의 문자를 사용할 수 있습니다.
> - `_` 입력 → 빈칸으로 표시
> - `?` 입력 → `?`로 표시

```json
{
  "purpose": "table",
  "tableType": "category-matrix",
  "data": "헤더: A, B, C, D, E\n전체 학생 수 (명): 200, 250, 300, 350, 400\nO형인 학생 수 (명): 50, 60, 70, 80, 90"
}
```

**비숫자 예시:**
```json
{
  "purpose": "table",
  "tableType": "category-matrix",
  "data": "헤더: A, B, C\n질문 1: O, X, ?\n질문 2: X, O, _"
}
```

---

### 3. cross-table (이원 분류표)

`헤더: 행라벨명, 열이름들` + `행이름: 값들` 형식의 문자열을 사용합니다.

| 행 | 형식 | 설명 |
|:---|:-----|:-----|
| 1행 (선택) | `병합헤더텍스트` | 병합 헤더 커스텀 (생략 시 "상대도수") |
| 2행 | `헤더: 행라벨명, 열1, 열2, ...` | 열 구조 정의 |
| 3행~ | `행이름: 값1, 값2, ...` | 각 행의 데이터 |

> **비숫자 문자 지원**: 값에 숫자 외에 `_`, `?`, 영문자 등 임의의 문자를 사용할 수 있습니다.
> - `_` 입력 → 빈칸으로 표시
> - `?` 입력 → `?`로 표시

```json
{
  "purpose": "table",
  "tableType": "cross-table",
  "data": "비율\n헤더: 혈액형, 남학생, 여학생\nA: 0.4, 0.4\nB: 0.22, 0.2\nAB: 0.12, 0.16\nO: 0.26, 0.24"
}
```

**비숫자 예시:**
```json
{
  "purpose": "table",
  "tableType": "cross-table",
  "data": "헤더: 혈액형, 남학생, 여학생\nA: 0.4, ?\nB: ?, 0.2\nAB: _, 0.16"
}
```

#### options.crossTable

| 옵션 | 타입 | 필수 | 기본값 | 설명 |
|:-----|:-----|:----:|:------:|:-----|
| `showTotal` | `boolean` | X | `true` | 합계 행 표시 |
| `showMergedHeader` | `boolean` | X | `true` | 병합 헤더 표시 |

```json
{
  "purpose": "table",
  "tableType": "cross-table",
  "data": "헤더: 혈액형, 남학생, 여학생\nA: 0.4, 0.4",
  "options": {
    "crossTable": {
      "showTotal": false,
      "showMergedHeader": true
    }
  }
}
```

---

### 4. stem-leaf (줄기-잎 그림)

줄기-잎 그림은 숫자를 입력하면 자동으로 줄기/잎으로 분리되어 배치됩니다.

> **동적 너비**: 줄기-잎 그림은 데이터 양에 따라 테이블 너비가 자동으로 계산됩니다. `canvasWidth`를 지정하면 해당 크기에 맞게 비율 스케일링됩니다.

#### 단일 모드 (숫자만)

```json
{
  "purpose": "table",
  "tableType": "stem-leaf",
  "data": "162 178 175 174 189 186 183 183 181 197 194 191 190 209 205"
}
```

#### 비교 모드 (라벨: 숫자들)

```json
{
  "purpose": "table",
  "tableType": "stem-leaf",
  "data": "남학생: 162 178 175 174 189 186 183 183 181 197 194 191 190 209 205\n여학생: 160 165 170 177 180 182 184 188 192 193 196 201 207"
}
```

#### cellVariables (줄기-잎 전용)

줄기-잎은 데이터가 자동 배치되므로, 특정 셀 값을 수정하려면 `cellVariables`를 사용합니다.

> **참고**: 줄기-잎에서는 data 문자열에 `_`나 `?`를 직접 넣을 수 없습니다 (숫자만 파싱됨).
> 특정 잎을 `?`나 빈칸으로 표시하려면 `cellVariables`를 사용해야 합니다.

**배열 항목 구조:**

| 필드 | 타입 | 필수 | 설명 |
|:-----|:-----|:----:|:-----|
| `rowIndex` | `number` | O | 행 인덱스 (0=헤더, 1~=데이터행) |
| `colIndex` | `number` | O | 열 인덱스 (아래 표 참조) |
| `value` | `string` \| `array` | O | 표시할 값 (단일값 또는 배열) |

**열 인덱스:**

| 모드 | colIndex 0 | colIndex 1 | colIndex 2 |
|:-----|:-----------|:-----------|:-----------|
| 단일 | 줄기 | 잎 | - |
| 비교 | 왼쪽 잎 | 줄기 | 오른쪽 잎 |

**예시 (단일 모드):**
```json
{
  "cellVariables": [
    { "rowIndex": 2, "colIndex": 1, "value": ["x", 5, 8] }
  ]
}
```
→ 줄기 17 행의 잎을 `x 5 8`로 표시 (x는 KaTeX 이탤릭)

**예시 (비교 모드):**
```json
{
  "cellVariables": [
    { "rowIndex": 1, "colIndex": 0, "value": ["x", 5] },
    { "rowIndex": 2, "colIndex": 2, "value": ["_", 2, 5] }
  ]
}
```
→ 왼쪽 잎을 `x 5`로, 오른쪽 잎을 `(빈칸) 2 5`로 표시

---

## 도수분포표 컬럼 설정 (tableConfig)

> `tableType: "frequency"`인 경우에만 적용됩니다.

### 사용 가능한 컬럼 (7개)

| 인덱스 | 컬럼명 | 설명 | 기본 표시 |
|:------:|:-------|:-----|:--------:|
| 0 | 계급 | 구간 범위 (예: 60~70) | O |
| 1 | 계급값 | 구간 중앙값 (예: 65) | X |
| 2 | 탈리 | 획 표시 (||||) | X |
| 3 | 도수 | 데이터 개수 | O |
| 4 | 상대도수(%) | 전체 대비 비율 | O |
| 5 | 누적도수 | 누적 데이터 개수 | X |
| 6 | 누적상대도수(%) | 누적 비율 | X |

---

### tableConfig 옵션

| 옵션 | 타입 | 필수 | 기본값 | 설명 |
|:-----|:-----|:----:|:------:|:-----|
| `visibleColumns` | `boolean[]` | X | `[true,false,false,true,true,false,false]` | 7개 컬럼 표시 여부 |
| `columnOrder` | `number[]` | X | `[0,1,2,3,4,5,6]` | 컬럼 표시 순서 |
| `labels` | `object` | X | 기본 라벨 | 컬럼 헤더 텍스트 |
| `showSuperscript` | `boolean` | X | `true` | 첫 행에 "이상/미만" 표시 |
| `showSummaryRow` | `boolean` | X | `true` | 합계 행 표시 |
| `cellVariables` | `array` | X | `null` | 셀 값 커스터마이징 |

---

### visibleColumns

컬럼 표시 여부를 배열로 지정합니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `boolean[]` (7개 요소) |
| **필수 여부** | 선택 |
| **기본값** | `[true, false, false, true, true, false, false]` |
| **동작** | `true`인 인덱스의 컬럼만 표시 |

```
기본값: [true, false, false, true, true, false, false]

인덱스:  0      1      2      3     4      5      6
컬럼:   계급  계급값  탈리   도수  상대도수 누적도수 누적상대도수
표시:    O      X      X      O      O       X        X
```

```json
{
  "options": {
    "tableConfig": {
      "visibleColumns": [true, true, true, true, true, true, true]
    }
  }
}
```

**결과**: 모든 컬럼 표시

---

### columnOrder

컬럼 표시 순서를 지정합니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `number[]` |
| **필수 여부** | 선택 |
| **기본값** | `[0, 1, 2, 3, 4, 5, 6]` |
| **동작** | 배열 순서대로 컬럼 배치 |

```json
{
  "options": {
    "tableConfig": {
      "visibleColumns": [true, false, false, true, true, false, false],
      "columnOrder": [3, 0, 4]
    }
  }
}
```

**결과**: 도수 → 계급 → 상대도수 순서로 표시

---

### labels

컬럼 헤더 텍스트를 커스터마이징합니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `object` |
| **필수 여부** | 선택 |
| **기본값** | 기본 라벨 |
| **동작** | 지정된 속성만 덮어쓰기, 나머지는 기본값 유지 |

| 속성 | 기본값 |
|:-----|:-------|
| `class` | `"계급"` |
| `midpoint` | `"계급값"` |
| `tally` | `"탈리"` |
| `frequency` | `"도수"` |
| `relativeFrequency` | `"상대도수(%)"` |
| `cumulativeFrequency` | `"누적도수"` |
| `cumulativeRelativeFrequency` | `"누적상대도수(%)"` |

```json
{
  "options": {
    "tableConfig": {
      "labels": {
        "class": "키(cm)",
        "frequency": "학생 수(명)"
      }
    }
  }
}
```

**결과**: `class`와 `frequency`만 커스텀, 나머지는 기본값 유지

---

### showSuperscript

첫 행에 "이상/미만" 표시 여부를 지정합니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `boolean` |
| **필수 여부** | 선택 |
| **기본값** | `true` |
| **동작** | `true`: "60이상~70미만", `false`: "60~70" |

```json
{
  "options": {
    "tableConfig": {
      "showSuperscript": false
    }
  }
}
```

---

### showSummaryRow

합계 행 표시 여부를 지정합니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `boolean` |
| **필수 여부** | 선택 |
| **기본값** | `true` |
| **동작** | `true`: 합계 행 표시, `false`: 합계 행 숨김 |

```json
{
  "options": {
    "tableConfig": {
      "showSummaryRow": false
    }
  }
}
```

---

### cellVariables

특정 셀의 값을 원하는 텍스트로 변경합니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `array` |
| **필수 여부** | 선택 |
| **기본값** | `null` |
| **동작** | 지정된 셀의 값을 커스텀 텍스트로 대체 |

#### 배열 항목 구조

| 속성 | 타입 | 필수 | 설명 | 예시 |
|:-----|:-----|:----:|:-----|:-----|
| `rowIndex` | `number` | **O** | 행 인덱스 (0부터 시작) | `0` |
| `colIndex` | `number` | **O** | 열 인덱스 (0부터 시작) | `2` |
| `value` | `string` | **O** | 표시할 값 | `"A"` |

```json
{
  "options": {
    "tableConfig": {
      "cellVariables": [
        { "rowIndex": 0, "colIndex": 2, "value": "A" },
        { "rowIndex": 1, "colIndex": 2, "value": "B" }
      ]
    }
  }
}
```

**결과**: 첫 번째 행의 도수가 "A"로, 두 번째 행의 도수가 "B"로 표시됨

---

## 테이블 전체 옵션 예시

### 최소 설정

```json
{
  "purpose": "table",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75]
}
```

| 적용 값 | 설명 |
|:--------|:-----|
| `tableType` | `"frequency"` (기본값) |
| `classCount` | `5` (기본값) |
| `canvasWidth` | `600` (기본값) |
| `canvasHeight` | `400` (기본값) |

---

## 타입별 전체 설정 예시

### 1. frequency (도수분포표)

```json
{
  "purpose": "table",
  "tableType": "frequency",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "classCount": 5,
  "classWidth": 10,
  "canvasWidth": 700,
  "canvasHeight": 500,
  "animation": true,
  "options": {
    "tableConfig": {
      "visibleColumns": [true, false, true, true, true, false, false],
      "columnOrder": [0, 2, 3, 4],
      "labels": {
        "class": "키(cm)",
        "frequency": "학생 수(명)",
        "relativeFrequency": "비율(%)"
      },
      "showSuperscript": true,
      "showSummaryRow": true,
      "cellVariables": [
        { "rowIndex": 0, "colIndex": 2, "value": "A" }
      ]
    }
  },
  "cellAnimations": [
    { "rowIndex": 0, "colIndex": 2, "duration": 1500, "repeat": 3 }
  ],
  "cellAnimationOptions": {
    "blinkEnabled": true
  }
}
```

| 필드 | 타입 | 필수 | 설명 |
|:-----|:-----|:----:|:-----|
| `purpose` | `string` | **O** | `"table"` |
| `tableType` | `string` | **O** | `"frequency"` |
| `data` | `number[]` | **O** | 원본 데이터 배열 |
| `classCount` | `number` | X | 계급 개수 |
| `classWidth` | `number` | X | 계급 간격 |
| `canvasWidth` | `number` | X | 캔버스 너비 (기본: 600) |
| `canvasHeight` | `number` | X | 캔버스 높이 (기본: 400) |
| `animation` | `boolean` | X | 애니메이션 활성화 |
| **options.tableConfig** |  |  |  |
| `visibleColumns` | `boolean[]` | X | 컬럼별 표시 여부 (7개) |
| `columnOrder` | `number[]` | X | 컬럼 표시 순서 |
| `labels.class` | `string` | X | "계급" 컬럼 라벨 |
| `labels.frequency` | `string` | X | "도수" 컬럼 라벨 |
| `labels.relativeFrequency` | `string` | X | "상대도수" 컬럼 라벨 |
| `showSuperscript` | `boolean` | X | 윗첨자 표시 |
| `showSummaryRow` | `boolean` | X | 합계 행 표시 |
| `cellVariables` | `array` | X | 셀 값 대체 설정 |
| **cellAnimations** |  |  |  |
| `rowIndex` | `number` | **O** | 행 인덱스 |
| `colIndex` | `number` | **O** | 열 인덱스 |
| `duration` | `number` | X | 애니메이션 시간(ms) |
| `repeat` | `number` | X | 반복 횟수 |
| **cellAnimationOptions** |  |  |  |
| `blinkEnabled` | `boolean` | X | 깜빡임 효과 사용 |

---

### 2. category-matrix (카테고리 행렬)

```json
{
  "purpose": "table",
  "tableType": "category-matrix",
  "data": "헤더: A, B, C, D, E\n전체 학생 수 (명): 200, 250, 300, 350, 400\nO형인 학생 수 (명): 50, 60, 70, 80, 90\nO형인 학생의 비율: 0.25, 0.24, 0.23, 0.23, 0.23",
  "canvasWidth": 800,
  "canvasHeight": 300,
  "animation": true,
  "cellAnimations": [
    { "rowIndex": 1, "colIndex": 2, "duration": 1500, "repeat": 3 },
    { "rowIndex": 2, "colIndex": 2, "duration": 1500, "repeat": 3 }
  ],
  "cellAnimationOptions": {
    "blinkEnabled": true
  }
}
```

| 필드 | 타입 | 필수 | 설명 |
|:-----|:-----|:----:|:-----|
| `purpose` | `string` | **O** | `"table"` |
| `tableType` | `string` | **O** | `"category-matrix"` |
| `data` | `string` | **O** | `"헤더: 열이름들\n라벨: 값들"` 형식 |
| `canvasWidth` | `number` | X | 캔버스 너비 (기본: 600) |
| `canvasHeight` | `number` | X | 캔버스 높이 (기본: 400) |
| `animation` | `boolean` | X | 애니메이션 활성화 (기본: true) |
| `cellAnimations` | `array` | X | 셀 하이라이트 (상세: frequency 섹션 참조) |
| `cellAnimationOptions` | `object` | X | 애니메이션 옵션 (상세: frequency 섹션 참조) |
| `cellVariables` | `array` | X | 셀 값 커스터마이징 (rowIndex/colIndex 기반) |

#### data 형식 상세

```
헤더: A, B, C, D, E          ← 열 이름 (5개)
전체 학생 수 (명): 200, 250, 300, 350, 400   ← 행1: 라벨 + 값들
O형인 학생 수 (명): 50, 60, 70, 80, 90       ← 행2: 라벨 + 값들
O형인 학생의 비율: 0.25, 0.24, 0.23, 0.23, 0.23  ← 행3: 라벨 + 값들
```

#### 셀 값 커스터마이징

데이터 문자열에서 직접 `_`, `?`, `x` 등을 사용할 수 있습니다.

```json
{
  "data": "헤더: A, B, C\n전체: 200, _, 300\nO형: x, 60, ?"
}
```

| 입력 | 결과 |
|:-----|:-----|
| `_` | 빈칸 |
| `?` | 물음표 표시 |
| `x`, `A` 등 | 해당 문자 그대로 표시 |

> **💡 권장사항**: 카테고리 매트릭스에서는 `cellVariables` 대신 **data 문자열에서 직접 편집**하는 것을 권장합니다.
> - JSON 경량화: `cellVariables` 배열 없이도 동일한 결과
> - 가독성 향상: 데이터와 커스텀 값이 한눈에 보임
> - 유지보수 용이: rowIndex/colIndex 계산 불필요

---

### 3. cross-table (이원 분류표)

```json
{
  "purpose": "table",
  "tableType": "cross-table",
  "data": "상대도수\n헤더: 혈액형, 남학생, 여학생\nA: 0.4, 0.4\nB: 0.22, 0.2\nAB: 0.12, 0.16\nO: 0.26, 0.24",
  "canvasWidth": 500,
  "canvasHeight": 400,
  "animation": true,
  "options": {
    "crossTable": {
      "showTotal": true,
      "showMergedHeader": true
    }
  },
  "cellAnimations": [
    { "rowIndex": 1, "colIndex": 1, "duration": 1500, "repeat": 3 },
    { "rowIndex": 1, "colIndex": 2, "duration": 1500, "repeat": 3 }
  ],
  "cellAnimationOptions": {
    "blinkEnabled": true
  }
}
```

| 필드 | 타입 | 필수 | 설명 |
|:-----|:-----|:----:|:-----|
| `purpose` | `string` | **O** | `"table"` |
| `tableType` | `string` | **O** | `"cross-table"` |
| `data` | `string` | **O** | `"병합헤더\n헤더: 행라벨명, 열들\n행: 값들"` 형식 |
| `canvasWidth` | `number` | X | 캔버스 너비 (기본: 600) |
| `canvasHeight` | `number` | X | 캔버스 높이 (기본: 400) |
| `animation` | `boolean` | X | 애니메이션 활성화 (기본: true) |
| `options.crossTable` | `object` | X | 이원분류표 전용 옵션 |
| `cellAnimations` | `array` | X | 셀 하이라이트 (상세: frequency 섹션 참조) |
| `cellAnimationOptions` | `object` | X | 애니메이션 옵션 (상세: frequency 섹션 참조) |
| `cellVariables` | `array` | X | 셀 값 커스터마이징 (rowIndex/colIndex 기반) |

#### options.crossTable 상세

| 옵션 | 타입 | 필수 | 기본값 | 설명 |
|:-----|:-----|:----:|:------:|:-----|
| `showTotal` | `boolean` | X | `true` | 합계 행 표시 |
| `showMergedHeader` | `boolean` | X | `true` | 병합 헤더 표시 |

---

#### 옵션 조합별 결과

| showMergedHeader | showTotal | 병합 헤더 | 합계 행 | 용도 |
|:----------------:|:---------:|:---------:|:-------:|:-----|
| `true` | `true` | O | O | 전체 표시 (기본값) |
| `false` | `true` | X | O | 합계만 필요할 때 |
| `true` | `false` | O | X | 헤더만 필요할 때 |
| `false` | `false` | X | X | 최소 표시 |

---

#### data 형식 상세

```
상대도수                      ← 0행 (선택): 병합 헤더 텍스트
헤더: 혈액형, 남학생, 여학생   ← 1행: 열 구조 (행라벨명, 열1, 열2)
A: 0.4, 0.4                   ← 2행~: 행이름 + 각 열의 값
B: 0.22, 0.2
AB: 0.12, 0.16
O: 0.26, 0.24
```

#### data 작성 규칙

| 행 | 형식 | 필수 | 설명 |
|:---|:-----|:----:|:-----|
| 0행 | `텍스트` (콜론 없음) | X | 병합 헤더 텍스트. 생략 시 "상대도수" |
| 1행 | `헤더: 행라벨명, 열1, 열2, ...` | **O** | 열 구조 정의. 반드시 `헤더:`로 시작 |
| 2행~ | `행이름: 값1, 값2, ...` | **O** | 데이터 행. `행이름:`으로 시작 |

#### 병합 헤더 커스텀 예시

```json
{
  "data": "비율\n헤더: 혈액형, 남학생, 여학생\nA: 0.4, 0.4\nB: 0.22, 0.2"
}
```

**결과**: 병합 헤더가 "비율"로 표시됨

#### 병합 헤더 생략 예시

```json
{
  "data": "헤더: 혈액형, 남학생, 여학생\nA: 0.4, 0.4\nB: 0.22, 0.2"
}
```

**결과**: 병합 헤더가 기본값 "상대도수"로 표시됨

---

#### 셀 값 커스터마이징

데이터 문자열에서 직접 `_`, `?`, `x` 등을 사용할 수 있습니다.

```json
{
  "data": "헤더: 혈액형, 남학생, 여학생\nA: 0.4, _\nB: ?, 0.2"
}
```

| 입력 | 결과 |
|:-----|:-----|
| `_` | 빈칸 |
| `?` | 물음표 표시 |
| `x`, `A` 등 | 해당 문자 그대로 표시 |

> **💡 권장사항**: 이원분류표에서는 `cellVariables` 대신 **data 문자열에서 직접 편집**하는 것을 권장합니다.
> - JSON 경량화: `cellVariables` 배열 없이도 동일한 결과
> - 가독성 향상: 데이터와 커스텀 값이 한눈에 보임
> - 유지보수 용이: rowIndex/colIndex 계산 불필요

---

### 4. stem-leaf (줄기-잎 그림)

> **동적 너비**: 줄기-잎 그림은 데이터 양에 따라 테이블 너비가 자동으로 계산됩니다. `canvasWidth`를 지정하면 해당 크기에 맞게 비율 스케일링됩니다.

#### 단일 데이터

```json
{
  "purpose": "table",
  "tableType": "stem-leaf",
  "data": "162 178 175 174 189 186 183 183 181 197 194 191 190 209 205",
  "canvasWidth": 400,
  "canvasHeight": 350,
  "animation": true,
  "cellAnimations": [
    { "rowIndex": 2, "colIndex": 1, "duration": 1500, "repeat": 3 }
  ],
  "cellAnimationOptions": {
    "blinkEnabled": true
  }
}
```

| 필드 | 타입 | 필수 | 설명 |
|:-----|:-----|:----:|:-----|
| `purpose` | `string` | **O** | `"table"` |
| `tableType` | `string` | **O** | `"stem-leaf"` |
| `data` | `string` | **O** | 공백으로 구분된 숫자들 |
| `canvasWidth` | `number` | X | 캔버스 너비 (기본: 400) |
| `canvasHeight` | `number` | X | 캔버스 높이 (기본: 350) |
| `animation` | `boolean` | X | 애니메이션 활성화 (기본: true) |
| `cellAnimations` | `array` | X | 셀 하이라이트 (상세: frequency 섹션 참조) |
| `cellAnimationOptions` | `object` | X | 애니메이션 옵션 (상세: frequency 섹션 참조) |
| `cellVariables` | `array` | X | 셀 값 커스터마이징 (rowIndex/colIndex 기반) |

> **참고**: 줄기-잎은 숫자만 파싱되므로, `?`나 `_` 같은 특수문자는 `cellVariables`로 지정해야 합니다.

#### data 형식 상세 (단일)

```
162 178 175 174 189 186 183 183 181 197 194 191 190 209 205
```

**결과**: 자동으로 줄기(십의 자리)와 잎(일의 자리)으로 분리

#### cellVariables 예시 (단일)

줄기-잎 그림에서는 숫자만 파싱되므로, `x`, `_` 같은 특수문자는 `cellVariables`로 지정해야 합니다.

```json
{
  "purpose": "table",
  "tableType": "stem-leaf",
  "data": "162 178 175 174 189",
  "cellVariables": [
    { "rowIndex": 2, "colIndex": 1, "value": ["x", 5, 8] }
  ]
}
```

| 설정 | 결과 |
|:-----|:-----|
| `"value": ["x", 5, 8]` | 잎을 `x 5 8`로 표시 (x는 KaTeX_Math 이탤릭) |
| `"value": "_"` | 빈칸으로 표시 |
| `"value": "x"` | 단일 값도 지원 (기존 호환) |

> **열 인덱스 (단일 모드)**: colIndex 0 = 줄기, colIndex 1 = 잎

---

#### 비교 데이터 (두 그룹)

```json
{
  "purpose": "table",
  "tableType": "stem-leaf",
  "data": "남학생: 162 178 175 174 189 186 183 183 181 197 194 191 190 209 205\n여학생: 160 165 170 177 180 182 184 188 192 193 196 201 207",
  "canvasWidth": 600,
  "canvasHeight": 400,
  "animation": true,
  "cellAnimations": [
    { "rowIndex": 3, "colIndex": 0, "duration": 1500, "repeat": 3 },
    { "rowIndex": 3, "colIndex": 2, "duration": 1500, "repeat": 3 }
  ],
  "cellAnimationOptions": {
    "blinkEnabled": true
  }
}
```

#### data 형식 상세 (비교)

```
남학생: 162 178 175 174 189 186 183 183 181 197 194 191 190 209 205
여학생: 160 165 170 177 180 182 184 188 192 193 196 201 207
```

**결과**: 양쪽 비교 형태의 줄기-잎 그림 생성

#### cellVariables 예시 (비교)

```json
{
  "purpose": "table",
  "tableType": "stem-leaf",
  "data": "남학생: 162 165 171 175 182\n여학생: 165 172 175 185",
  "cellVariables": [
    { "rowIndex": 1, "colIndex": 0, "value": ["x", 5] },
    { "rowIndex": 2, "colIndex": 2, "value": ["_", 2, 5] }
  ]
}
```

| 설정 | 결과 |
|:-----|:-----|
| `"value": ["x", 5]` | 남학생 잎을 `x 5`로 표시 (x는 이탤릭) |
| `"value": ["_", 2, 5]` | 여학생 잎을 `  2 5`로 표시 (`_`는 빈칸) |

> **열 인덱스 (비교 모드)**: colIndex 0 = 왼쪽 잎, colIndex 1 = 줄기, colIndex 2 = 오른쪽 잎

#### 특수문자 처리

| 입력 | 결과 |
|:-----|:-----|
| `"x"`, `"y"`, `"a"` 등 (소문자) | 해당 문자 표시 (이탤릭) |
| `"A"`, `"B"` 등 (대문자/숫자) | 해당 문자 표시 |
| `"_"` | 빈칸 (공백) |

---

# 셀 애니메이션 (Cell Animation)

> 특정 셀에 하이라이트 애니메이션을 추가합니다.

## cellAnimations 배열

셀 애니메이션 목록을 정의합니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `array` |
| **필수 여부** | 선택 |
| **기본값** | `null` |
| **동작** | 배열에 정의된 셀들에 하이라이트 애니메이션 적용 |

### 배열 항목 구조

| 속성 | 타입 | 필수 | 기본값 | 설명 |
|:-----|:-----|:----:|:------:|:-----|
| `rowIndex` | `number` | X | `null` | 행 인덱스 (생략 시 열 전체) |
| `colIndex` | `number` | X | `null` | 열 인덱스 (생략 시 행 전체) |
| `rowStart` | `number` | X | `null` | 행 범위 시작 (colIndex와 함께 사용) |
| `rowEnd` | `number` | X | `null` | 행 범위 끝 (colIndex와 함께 사용) |
| `colStart` | `number` | X | `null` | 열 범위 시작 (rowIndex와 함께 사용) |
| `colEnd` | `number` | X | `null` | 열 범위 끝 (rowIndex와 함께 사용) |
| `duration` | `number` | X | `1500` | 애니메이션 시간 (ms) |
| `repeat` | `number` | X | `3` | 반복 횟수 |

---

### 동작 규칙

#### 기본 지정

| rowIndex | colIndex | 결과 |
|:--------:|:--------:|:-----|
| 지정 | 지정 | 특정 셀 하이라이트 |
| 지정 | 생략 | 해당 행 전체 하이라이트 |
| 생략 | 지정 | 해당 열 전체 하이라이트 |
| 생략 | 생략 | 동작 안 함 |

#### 범위 지정

| 조합 | 결과 |
|:-----|:-----|
| `colIndex` + `rowStart` + `rowEnd` | 특정 열의 행 범위 하이라이트 |
| `rowIndex` + `colStart` + `colEnd` | 특정 행의 열 범위 하이라이트 |

> **범위 지정 우선순위**: 범위 지정(`rowStart/rowEnd` 또는 `colStart/colEnd`)이 있으면 기본 지정보다 우선합니다.

---

## cellAnimationOptions 객체

애니메이션 재생 옵션을 지정합니다.

| 속성 | 타입 | 필수 | 기본값 | 설명 |
|:-----|:-----|:----:|:------:|:-----|
| `blinkEnabled` | `boolean` | X | `false` | 블링크 효과 활성화 |

| 값 | 동작 |
|:---|:-----|
| `true` | 하이라이트가 깜빡이며 반복 (`duration`, `repeat` 적용) |
| `false` | 정적 하이라이트만 표시 (기본값, `duration`/`repeat` 무시) |

> **참고**: `blinkEnabled: false`일 때는 `duration`과 `repeat` 값이 무시되고, 300ms 페이드인 후 정적 하이라이트가 유지됩니다.

---

## 셀 애니메이션 예시

### 특정 셀 하이라이트

```json
{
  "purpose": "table",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "cellAnimations": [
    { "rowIndex": 0, "colIndex": 2 }
  ]
}
```

**결과**: 0행 2열 셀이 하이라이트됨

---

### 행 전체 하이라이트

```json
{
  "purpose": "table",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "cellAnimations": [
    { "rowIndex": 2 }
  ]
}
```

**결과**: 2번 행 전체가 하이라이트됨

---

### 열 전체 하이라이트

```json
{
  "purpose": "table",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "cellAnimations": [
    { "colIndex": 3 }
  ]
}
```

**결과**: 3번 열 전체가 하이라이트됨

---

### 여러 셀 하이라이트

```json
{
  "purpose": "table",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "cellAnimations": [
    { "rowIndex": 0, "colIndex": 2 },
    { "rowIndex": 1, "colIndex": 2 },
    { "rowIndex": 2, "colIndex": 2 }
  ]
}
```

**결과**: 0~2행의 2열 셀들이 하이라이트됨 (인접한 셀은 자동 병합)

---

### 열의 행 범위 하이라이트 (범위 지정)

```json
{
  "purpose": "table",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "cellAnimations": [
    { "colIndex": 2, "rowStart": 1, "rowEnd": 4 }
  ]
}
```

**결과**: 2열의 1~4행이 하나의 그룹으로 하이라이트됨

> **Tip**: 위의 "여러 셀 하이라이트" 예시와 동일한 결과를 더 간단하게 표현 가능

---

### 행의 열 범위 하이라이트 (범위 지정)

```json
{
  "purpose": "table",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "cellAnimations": [
    { "rowIndex": 2, "colStart": 0, "colEnd": 2 }
  ]
}
```

**결과**: 2행의 0~2열이 하나의 그룹으로 하이라이트됨

---

### 범위 지정 + 기본 지정 혼합

```json
{
  "purpose": "table",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "cellAnimations": [
    { "colIndex": 1, "rowStart": 2, "rowEnd": 5 },
    { "rowIndex": 0 }
  ]
}
```

**결과**: 1열의 2~5행과 0행 전체가 각각 다른 그룹으로 하이라이트됨

---

### 블링크 비활성화

```json
{
  "purpose": "table",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "cellAnimations": [
    { "rowIndex": 0, "colIndex": 2 }
  ],
  "cellAnimationOptions": {
    "blinkEnabled": false
  }
}
```

**결과**: 블링크 없이 정적 하이라이트 표시

---

### 블링크 활성화

```json
{
  "purpose": "table",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "cellAnimations": [
    { "rowIndex": 0, "colIndex": 2, "duration": 2000, "repeat": 5 }
  ],
  "cellAnimationOptions": {
    "blinkEnabled": true
  }
}
```

**결과**: 2초 동안 5번 깜빡이는 하이라이트 (기본값: 1.5초, 3번)

> **주의**: `blinkEnabled: true`가 없으면 `duration`과 `repeat`은 무시됩니다.

---

## 인접 셀 병합 규칙

인접한 셀들은 자동으로 병합되어 하나의 영역으로 하이라이트됩니다.

| 조건 | 결과 | 색상 |
|:-----|:-----|:-----|
| 1개 그룹 | 단일 영역 | 초록 (#89EC4E) |
| 2개+ 그룹 | 방향별 분리 | 파랑/분홍/주황 |
| 겹치는 셀 | 두 그룹 모두 표시 | 중첩 |

---

# 특수 문자 (Special Characters)

> 데이터에 특수 문자를 사용하여 특별한 렌더링 효과를 적용할 수 있습니다.

## 언더바 (`_`) → 빈칸

언더바(`_`)를 입력하면 **빈칸으로 렌더링**됩니다.

| 항목 | 설명 |
|:-----|:-----|
| **입력** | `_` (언더바) |
| **출력** | 빈칸 (아무것도 표시 안 됨) |
| **용도** | 빈칸을 표시해야 하는 셀에 사용 |
| **적용 범위** | 모든 테이블 타입 |

### 동작 원리

```
입력값: "_"
  ↓
렌더링 시 너비 0으로 처리
  ↓
결과: 셀에 아무것도 표시되지 않음
```

---

## 사용 예시

### 도수분포표에서 빈칸 (cellVariables)

특정 셀의 값을 빈칸으로 표시하려면 `_`를 사용합니다.

```json
{
  "purpose": "table",
  "tableType": "frequency",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "options": {
    "tableConfig": {
      "cellVariables": [
        { "rowIndex": 0, "colIndex": 2, "value": "_" },
        { "rowIndex": 1, "colIndex": 2, "value": "_" }
      ]
    }
  }
}
```

**결과:** 첫 번째, 두 번째 행의 도수 셀이 빈칸으로 표시됨

---

### 이원분류표에서 빈칸

데이터 값에 직접 `_`를 사용합니다.

```json
{
  "purpose": "table",
  "tableType": "cross-table",
  "data": "헤더: 혈액형, 남학생, 여학생\nA: 0.4, _\nB: _, 0.2\nAB: 0.12, 0.16"
}
```

**결과:** A행 여학생, B행 남학생 셀이 빈칸으로 표시됨

---

### 카테고리 행렬에서 빈칸

```json
{
  "purpose": "table",
  "tableType": "category-matrix",
  "data": "헤더: A, B, C\n전체: 100, _, 300\n부분: _, 50, _"
}
```

**결과:** 전체 B열, 부분 A/C열이 빈칸으로 표시됨

---

### 줄기-잎 그림에서의 주의사항

줄기-잎 그림에서는 숫자 데이터만 파싱하므로, `_`는 무시됩니다.

```json
{
  "purpose": "table",
  "tableType": "stem-leaf",
  "data": "162 _ 178 175"
}
```

**결과:** `_`는 무시되고 `162, 178, 175`만 파싱됨

> **Tip**: 줄기-잎 그림에서 빈칸을 표현하려면 해당 숫자를 생략하세요.

---

## 언더바 vs 공백

| 입력 | 결과 | 용도 |
|:-----|:-----|:-----|
| `_` | 빈칸 (의도적) | 값을 비워야 할 때 |
| ` ` (공백) | 파싱 구분자 | 데이터 구분용 |
| `""` (빈 문자열) | 빈칸 | JSON에서 직접 빈 값 지정 |

---

### 의도적 빈칸이 필요한 상황

1. **문제 풀이용 테이블**: 학생이 채워야 하는 칸
2. **미확정 데이터**: 아직 값이 정해지지 않은 경우
3. **N/A 표현**: 해당 없음을 표시

```json
{
  "options": {
    "tableConfig": {
      "cellVariables": [
        { "rowIndex": 0, "colIndex": 2, "value": "_" },
        { "rowIndex": 0, "colIndex": 3, "value": "A" }
      ]
    }
  }
}
```

**결과:**
- `"_"` → 완전한 빈칸
- `"A"` → 문자 A 표시

> **참고**: `rowIndex`는 행 인덱스, `colIndex`는 열 인덱스입니다 (0부터 시작)

---

# 기본값 요약

## 차트 기본값

| 필드 | 기본값 | 설명 |
|:-----|:------:|:-----|
| `purpose` | `"chart"` | 차트 렌더링 |
| `classCount` | `5` | 5개 계급 |
| `classWidth` | 자동 계산 | `Math.ceil(범위/classCount)` |
| `canvasWidth` | `700` | 700px |
| `canvasHeight` | `450` | 450px |
| `animation` | `true` | 애니메이션 활성화 |
| `options.showHistogram` | `true` | 히스토그램 표시 |
| `options.showPolygon` | `true` | 도수다각형 표시 |
| `options.dataType` | `"relativeFrequency"` | 상대도수 기준 |
| `options.axisLabels` | `null` | 기본 축 라벨 |
| `options.histogramColorPreset` | `"default"` | 기본 색상 |
| `options.polygonColorPreset` | `"default"` | 기본 색상 |
| `options.showDashedLines` | `false` | 파선 숨김 |
| `options.grid.showHorizontal` | `true` | 가로 격자선 표시 |
| `options.grid.showVertical` | `true` | 세로 격자선 표시 |
| `options.axis.showYLabels` | `true` | Y축 라벨 표시 |
| `options.axis.showXLabels` | `true` | X축 라벨 표시 |
| `options.axis.yLabelFormat` | `"decimal"` | 소수점 형식 |
| `options.customYInterval` | `null` | 자동 계산 |

## 테이블 기본값

| 필드 | 기본값 | 설명 |
|:-----|:------:|:-----|
| `purpose` | `"chart"` | **주의: 테이블은 명시 필요** |
| `tableType` | `"frequency"` | 도수분포표 |
| `classCount` | `5` | 5개 계급 |
| `classWidth` | 자동 계산 | `Math.ceil(범위/classCount)` |
| `canvasWidth` | `600` | 600px |
| `canvasHeight` | `400` | 400px |
| `animation` | `true` | 애니메이션 활성화 |

> **주의**: 테이블을 렌더링하려면 반드시 `"purpose": "table"`을 명시해야 합니다.

---

# 필수 필드 체크리스트

## 차트 (Chart)

| 필드 | 필수 여부 | 비고 |
|:-----|:--------:|:-----|
| `data` | **필수** | 숫자 배열 |
| `purpose` | 선택 | 기본값 `"chart"` |
| `classCount` | 선택 | 기본값 `5` |
| 그 외 | 선택 | 모두 기본값 있음 |

## 테이블 (Table)

| 필드 | 필수 여부 | 비고 |
|:-----|:--------:|:-----|
| `data` | **필수** | 숫자 배열 또는 특수 문자열 |
| `purpose` | **필수** | 반드시 `"table"` 명시 |
| `tableType` | 선택 | 기본값 `"frequency"` |
| 그 외 | 선택 | 모두 기본값 있음 |

---

# 자주 하는 실수 (Common Mistakes)

| 실수 | 증상 | 해결 방법 |
|:-----|:-----|:----------|
| `purpose: "table"` 누락 | 테이블 대신 차트가 렌더링됨 | 테이블은 반드시 `"purpose": "table"` 명시 |
| `animation: true`만 설정 | 애니메이션 효과 없음 | `cellAnimations` 배열도 함께 설정 필요 |
| cross-table에서 `헤더:` 누락 | 파싱 오류 또는 잘못된 테이블 | 두 번째 줄은 반드시 `헤더: 라벨명, 열1, 열2` 형식 |
| `blinkEnabled: true`만 설정 | 깜빡임 없이 정적 하이라이트 | `duration`, `repeat` 값도 함께 설정 권장 |
| JSON 문법 오류 | 테이블/차트 렌더링 안 됨 | trailing comma 제거, 객체 사이 comma 확인 |

---

# 오류 메시지

| 오류 | 원인 | 해결 방법 |
|:-----|:-----|:----------|
| `element must be a valid HTMLElement` | 컨테이너 요소 없음 | 유효한 DOM 요소 전달 |
| `config.data is required` | data 필드 누락 | data 배열 추가 |
| `No valid numeric data found` | 유효한 숫자 없음 | 숫자 배열 확인 |
| `Invalid purpose` | 잘못된 purpose 값 | `"chart"` 또는 `"table"` 사용 |
| `'xxx' type does not support chart` | 차트 미지원 테이블 타입 | `tableType: "frequency"`만 차트 지원 |

# viz-api.js JSON 설정 가이드

도수분포표/차트를 생성하기 위한 JSON 설정 문서

**내부 데이터 구조** (파싱 후 결과)는 [SCHEMA.md](./SCHEMA.md) 참조

## AI를 위한 핵심 요약

JSON 생성 시 반드시 알아야 할 핵심 규칙입니다.

### 1. purpose 구분 (가장 중요)

| purpose | 용도 | data 형식 | 필수 명시 |
|:--------|:-----|:---------|:---------|
| `"chart"` (기본값) | 히스토그램/도수다각형 | `number[]` 배열 | 생략 가능 |
| `"table"` | 테이블 렌더링 | `"헤더: ...\n행: ..."` 문자열 | **반드시 명시** |
| `"scatter"` | 산점도 | `[[x1, y1], [x2, y2], ...]` 2D 배열 | **반드시 명시** |

### 2. 테이블 tableType 3가지

| tableType | 용도 | data 형식 예시 |
|:----------|:-----|:--------------|
| `"basic-table"` (기본값) | 도수분포표, 이원분류표 | `"헤더: 항목, 값\nA: 10\nB: 20"` |
| `"category-matrix"` | 카테고리 교차표 | `"헤더: A, B, C\n행1: 1, 2, 3"` |
| `"stem-leaf"` | 줄기-잎 그림 | `"162 178 175"` 또는 `"남: 162 178\n여: 165 172"` |

#### basic-table vs category-matrix 선택 기준

| 조건 | 선택 | 이유 |
|:-----|:-----|:-----|
| 행 라벨이 의미 있는 이름 (자료 A, 남학생, 1반 등) | `category-matrix` | 행 라벨 컬럼이 자동 생성됨 |
| 도수분포표 (계급, 도수, 상대도수 등) | `basic-table` | 첫 열이 헤더가 아닌 데이터 |
| 이원분류표 (행/열 모두 카테고리) | `basic-table` | 첫 열 헤더가 "구분" 등 |
| 헤더행 없음 | `category-matrix` | 헤더를 `null`로 처리 가능 |

#### 헤더행 없음 처리

원본 데이터에 헤더행이 없는 경우 `category-matrix` + `null` 헤더 사용:

```json
{
  "purpose": "table",
  "tableType": "category-matrix",
  "data": "헤더: null, null, null, null, null\n자료 A: 14, a, 12, 16, b\n자료 B: 14, b-1, 18, 13, 11"
}
```

- 헤더 개수는 데이터 열 개수와 일치해야 함
- `null`은 빈 셀로 렌더링됨

### 3. 핵심 규칙 체크리스트

| 규칙 | 상세 |
|:-----|:-----|
| 테이블이면 `"purpose": "table"` 필수 | 누락 시 차트로 렌더링됨 |
| `cellVariables`는 **최상위 레벨**에 배치 | options 안에 넣으면 무시됨 |
| 빈칸은 `null` 사용 | data에서는 문자 `null`, cellVariables에서는 JSON `null` |
| 비숫자 값 있으면 합계 `-` 표시 | `cellVariables`로 합계 직접 지정 필요 |
| rowIndex: 0=헤더, 1~=데이터 | 합계 행 = 마지막 데이터 행 + 1 |
| 단일 차트는 `classRange` 사용 금지 | 반드시 `classWidth` 또는 `classCount` 사용 |

### 4. 최소 JSON 템플릿

**차트:**
```json
{ "data": [62, 87, 97, 73, 59, 85] }
```

**테이블 (basic-table):**
```json
{ "purpose": "table", "data": "헤더: 항목, 값\nA: 10\nB: 20" }
```

**테이블 (stem-leaf):**
```json
{ "purpose": "table", "tableType": "stem-leaf", "data": "162 178 175" }
```

**테이블 (category-matrix):**
```json
{ "purpose": "table", "tableType": "category-matrix", "data": "헤더: A, B, C\n행1: 1, 2, 3" }
```

**산점도:**
```json
{ "purpose": "scatter", "data": [[1, 2], [3, 4], [5, 6]] }
```

## Quick Start (최소 설정)

이것만 있으면 동작합니다.

### 차트 (최소)

```json
{
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75, 82, 91]
}
```

**참고**: 차트는 숫자 배열 또는 숫자가 포함된 문자열 모두 지원합니다.

### 테이블 (최소)

```json
{
  "purpose": "table",
  "data": "헤더: 항목, 값\nA: 10\nB: 20\nC: 30"
}
```

**주의**: 테이블은 반드시 `"purpose": "table"` 명시 필요

### 산점도 (최소)

```json
{
  "purpose": "scatter",
  "data": [[1, 2], [3, 4], [5, 6], [7, 8]]
}
```

**주의**: 산점도는 반드시 `"purpose": "scatter"` 명시 필요, data는 `[[x, y], ...]` 2D 배열

## JSON Schema

설정 검증을 위한 JSON Schema가 제공됩니다.

- **파일**: `schema/viz-api.schema.json`
- **스펙**: JSON Schema draft-07
- **기능**:
  - 모든 속성에 description, default, examples 포함
  - tableType별 data 형식 조건부 검증
  - additionalProperties: false로 오타 방지

```javascript
// 사용 예시 (AJV 등)
import Ajv from 'ajv';
import schema from './schema/viz-api.schema.json';

const ajv = new Ajv();
const validate = ajv.compile(schema);
const valid = validate(config);
if (!valid) console.log(validate.errors);
```

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
| **tableType** | `tableType` | 테이블 유형 (`"basic-table"` / `"category-matrix"` / `"stem-leaf"`) | 테이블 |
| **classCount** | `classCount` | 계급 개수 (기본: 5) | 차트 |
| **classWidth** | `classWidth` | 계급 간격 (자동 계산) | 차트 |
| **classRange** | `classRange` | 계급 범위 수동 설정 (`{ firstStart, secondStart, lastEnd }`) | 차트 |
| **canvasSize** | `canvasSize` | 정사각형 캔버스 크기 (우선 적용) | 차트 |
| **canvasWidth** | `canvasWidth` | 캔버스 너비 (기본: 700) | 차트 |
| **canvasHeight** | `canvasHeight` | 캔버스 높이 (기본: 450) | 차트 |
| **options** | `options` | 차트/테이블 세부 설정을 담는 객체 | 전체 |
| **animation** | `animation` | 애니메이션 활성화 여부 | 차트/테이블 |
| **cellAnimations** | `cellAnimations` | 셀 하이라이트 애니메이션 배열 | 모든 테이블 |
| **cellVariables** | `cellVariables` | 셀 값 커스터마이징 (rowIndex/colIndex 기반) | 아래 표 참조 |

#### cellVariables 위치

모든 테이블 타입에서 **최상위 `cellVariables`** 사용:

```json
{
  "tableType": "basic-table",
  "data": "...",
  "cellVariables": [
    { "rowIndex": 0, "colIndex": 1, "value": "A" }
  ]
}
```

#### 유사 필드명 구분 [테이블 전용]

혼동하기 쉬운 3가지 필드를 명확히 구분합니다.

| 필드 | 용도 | 예시 |
|:-----|:-----|:-----|
| `cellAnimations` | 셀 **하이라이트** (깜빡임 효과) | `[{ "rowIndex": 0, "colIndex": 1 }]` |
| `cellVariables` | 셀 **값 변경** (?, null, 숫자 등) | `[{ "rowIndex": 0, "colIndex": 1, "value": "?" }]` |
| `cellAnimationOptions` | 애니메이션 **전역 옵션** | `{ "blinkEnabled": true }` |

```json
{
  "purpose": "table",
  "data": "헤더: 항목, 값\nA: 10\nB: 20",
  "cellAnimations": [{ "rowIndex": 1, "colIndex": 1 }],
  "cellAnimationOptions": { "blinkEnabled": true },
  "cellVariables": [{ "rowIndex": 2, "colIndex": 1, "value": "?" }]
}
```

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
| **polygon** | `options.polygon` | 다각형 옵션 (`{ hidden }`) |
| **corruption** | `options.corruption` | 찢김 효과 설정 (`{ enabled, cells, maskAxisLabels, style }`) |
| **histogramColorPreset** | `options.histogramColorPreset` | 히스토그램 색상 프리셋 |
| **histogramColor** | `options.histogramColor` | 히스토그램 커스텀 색상 |
| **polygonColorPreset** | `options.polygonColorPreset` | 다각형 색상 프리셋 |
| **polygonColor** | `options.polygonColor` | 다각형 커스텀 색상 |

#### options 하위 객체 (테이블)

| 용어 | JSON 경로 | 설명 |
|:-----|:----------|:-----|
| **showTotal** | `options.showTotal` | 합계 행 표시 여부 (basic-table 전용) |
| **showMergedHeader** | `options.showMergedHeader` | 병합 헤더 표시 여부 (basic-table 전용) |
| **corruption** | `options.corruption` | 찢김 효과 설정 (`{ enabled, cells, style }`) |

## JSON 구조 개요

전체 설정의 계층 구조입니다. 한눈에 어떤 옵션이 어디에 위치하는지 확인하세요.

```
config (최상위)
│
├── data                    (필수) 숫자 배열 또는 특수 문자열
├── purpose                 "chart" | "table"
├── tableType               "basic-table" | "category-matrix" | "stem-leaf" (기본: "basic-table")
├── classCount              계급 개수 (차트 전용, 기본: 5)
├── classWidth              계급 간격 (차트 전용, 자동 계산)
├── classRange              계급 범위 커스터마이징 (차트 전용) { firstStart, secondStart, lastEnd }
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
│   ├── polygon             { hidden } 다각형 숨김 옵션
│   │
│   │  [차트/테이블 공통]
│   ├── corruption          { enabled, cells, maskAxisLabels, style } 찢김 효과
│   │
│   │  [basic-table 전용]
│   ├── showTotal           합계 행 표시
│   └── showMergedHeader    병합 헤더 표시
│
│  [테이블 전용]
├── cellAnimations          [{ rowIndex, colIndex, duration, repeat }, ...]
├── cellAnimationOptions    { blinkEnabled: true/false }
└── cellVariables           [{ rowIndex, colIndex, value }, ...]
```

# 공통 설정

차트와 테이블 모두에서 사용되는 필드입니다.

## 필드 목록

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|:-----|:-----|:----:|:------:|:-----|
| `data` | `number[]` | **O** | - | 변량 데이터 배열 |
| `purpose` | `string` | X | `"chart"` | 렌더링 목적 |
| `classCount` | `number` | X | `5` | 계급 개수 |
| `classWidth` | `number` | X | 자동 | 계급 간격 |
| `classRange` | `object` | X | - | 계급 범위 수동 설정 (classCount/classWidth 무시) |
| `animation` | `boolean` \| `object` | X | `true` | 애니메이션 활성화 |

## 필드별 동작

### data (필수)

렌더링할 데이터입니다. **purpose에 따라 형식이 다릅니다.**

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `number[]` 또는 `string` (purpose에 따라 다름) |
| **필수 여부** | **필수** |
| **오류 시** | 유효한 데이터가 없으면 `{ error: "..." }` 반환 |

#### purpose별 data 형식

| purpose | data 타입 | 형식 | 예시 |
|:--------|:---------|:-----|:-----|
| `"chart"` | `number[]` 또는 `string` | 숫자 배열 또는 숫자가 포함된 문자열 | `[62, 87, 97]` 또는 `"62, 87, 97"` |
| `"table"` | `string` | `"헤더: ...\n행: ..."` 형식 | `"헤더: 항목, 값\nA: 10"` |

#### 차트 예시
```json
{
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75, 82, 91]
}
```

#### 테이블 예시
```json
{
  "purpose": "table",
  "data": "헤더: 항목, 값1, 값2\nA: 62, 87\nB: 73, 59"
}
```

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
  "data": "헤더: 항목, 값\nA: 10\nB: 20"
}
```

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
| `firstStart` | `number` | 전체 구간의 **시작값** (첫 계급 시작) | `12` → 12이상~14미만 |
| `secondStart` | `number` | 두 번째 계급의 시작값 (간격 결정용) | `14` → 간격 2 (14-16) |
| `lastEnd` | `number` | **차트 X축이 시각적으로 끝나는 지점** | `22` → 20이상~22미만 |

**lastEnd 설정 원칙 (중요)**:
- `lastEnd`는 **차트의 X축 눈금이 끝나는 지점**을 기입합니다.
- 텍스트 설명에 "22 이상"이라고 적혀 있어도, **차트 축 눈금이 22에서 끝난다면** `lastEnd`는 반드시 `22`입니다.
- 데이터가 축 범위를 벗어나면 해당 데이터는 버리거나, 마지막 계급에 포함시키세요.

```json
{
  "data": [12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
  "classRange": {
    "firstStart": 12,
    "secondStart": 14,
    "lastEnd": 22
  }
}
```

**결과**: 0~12(빈), 12~14, 14~16, 16~18, 18~20, 20~22, 22~24(빈) (간격 2)

**상대도수 그래프 데이터 생성 팁**:
- 상대도수 그래프용 `data` 배열을 만들 때는 **반드시 classRange 범위 내의 값**만 사용하세요.
- 각 계급의 **중앙값(midpoint)**을 사용하면 안전합니다.
- 예: 마지막 계급이 20~22라면, 데이터는 `21`을 넣으세요. (`22`나 `23`을 넣으면 축이 늘어나는 오류 발생)

**classRange 사용 가이드**:

| 상황 | 권장 옵션 | 이유 |
|:-----|:----------|:-----|
| 일반 단일 차트 (0부터 시작) | `classWidth` 또는 `classCount` | 데이터 기반 자동 계산이 안전 |
| **시작값이 0이 아닌 경우** | `classRange` **필수** | `classWidth`는 항상 0부터 시작함 |
| 복수 다각형 오버레이 | `classRange` **필수** | 모든 데이터셋 축 정렬 필요 |
| 두 차트 축 일치 필요 | `classRange` 사용 | 동일한 값 공유 |

**시작값이 0이 아닌 단일 차트 예시**:
```json
{
  "data": [11, 13, 15, 17, 19, 21],
  "classRange": {
    "firstStart": 10,   // X축 시작점 (0~10 빈 구간 자동 생성)
    "secondStart": 12,  // 간격 = 2
    "lastEnd": 22       // X축 끝점 (22~24 빈 구간 자동 생성)
  }
}
```
**결과**: 0~10(빈,중략), 10~12, 12~14, ..., 20~22, 22~24(빈)

**주의**: `classWidth`만 사용하면 데이터가 11부터 시작해도 **X축은 0부터** 생성됩니다.

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

# 차트 (Chart)

히스토그램과 도수다각형을 Canvas에 렌더링합니다.

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

### 3. 복수 도수다각형 (Multiple Polygons)

단일 차트에 여러 데이터셋의 도수다각형을 동시에 표시할 수 있습니다.

**일반 차트와 다른 특수 모드입니다.** 반드시 아래 권장사항과 금지사항을 확인하세요.

#### 개요

| 항목 | 설명 |
|:-----|:-----|
| 표현 방식 | 여러 데이터셋을 **서로 다른 색상**의 다각형으로 오버레이 |
| 좌표 통합 | 모든 데이터셋의 최대값을 기준으로 Y축 자동 조정 |
| 렌더링 모드 | **정적 렌더링만 지원** (애니메이션 비활성화) |
| 말풍선 위치 | 차트 좌측 상단에 세로로 배치 (datasets 순서대로) |

#### 권장사항 (MUST)

| 항목 | 설명 | 예시 |
|:-----|:-----|:-----|
| `showHistogram: false` | 히스토그램 비활성화 필수 | `"options": { "showHistogram": false }` |
| `showPolygon: true` | 다각형 활성화 필수 | `"options": { "showPolygon": true }` |
| `classRange` 지정 | 모든 데이터셋 정렬을 위해 필수 | `"classRange": { "firstStart": 1, "secondStart": 3, "lastEnd": 15 }` |
| `dataType: "frequency"` | 도수 모드 권장 (상대도수도 가능) | `"options": { "dataType": "frequency" }` |
| 서로 다른 `polygonColorPreset` | 데이터셋 구분을 위해 필수 | `"primary"`, `"secondary"`, `"tertiary"` |

#### 금지사항 (MUST NOT)

| 항목 | 이유 | 증상 |
|:-----|:-----|:-----|
| `customYInterval` 사용 금지 | 좌표계 충돌로 차트 깨짐 | 계급이 0~1만 표시되고 전체 영역 차지 |
| `data` 필드 사용 금지 | `datasets`와 충돌 | 무시되거나 오류 발생 |
| `animation: true` 사용 금지 | 복수 다각형은 정적 모드만 지원 | 자동으로 false 처리됨 |
| `showHistogram: true` 사용 금지 | 여러 히스토그램이 겹쳐서 표시됨 | 차트 가독성 심각하게 저하 |

#### datasets 배열 구조

```json
{
  "purpose": "chart",
  "datasets": [
    {
      "data": [1, 3, 3, 5, 5, 5, 7, 7, 7, 7, 7, 7, 7, 9, 9, 9, 9, 9, 11, 11],
      "polygonColorPreset": "primary",
      "callout": { "template": "남학생" }
    },
    {
      "data": [1, 1, 3, 3, 3, 5, 5, 7, 7, 7, 7, 7, 7, 9, 9, 9, 9, 9, 11, 11, 12, 12],
      "polygonColorPreset": "secondary",
      "callout": { "template": "여학생" }
    }
  ],
  "classRange": { "firstStart": 1, "secondStart": 3, "lastEnd": 15 },
  "canvasSize": 700,
  "options": {
    "showHistogram": false,
    "showPolygon": true,
    "dataType": "frequency",
    "axisLabels": {
      "xAxis": "(회)",
      "yAxis": "학생 수(명)"
    }
  }
}
```

#### dataset 개별 필드

| 필드 | 타입 | 필수 | 설명 |
|:-----|:-----|:----:|:-----|
| `data` | `array\|string` | | 해당 데이터셋의 원시 데이터 |
| `polygonColorPreset` | `string` | | 다각형 색상 (`"primary"`, `"secondary"`, `"tertiary"`, `"default"`) |
| `callout` | `object` | X | 해당 데이터셋의 말풍선 설정 |
| `callout.template` | `string` | X | 말풍선 텍스트 |
| `callout.preset` | `string` | X | 말풍선 색상 (생략 시 polygonColorPreset 사용) |
| `polygon` | `object` | X | 해당 데이터셋의 다각형 옵션 |
| `polygon.hidden` | `array` | X | 숨길 점 인덱스 배열 (연결된 선도 자동 숨김)

#### 일반 차트와의 차이점

| 항목 | 일반 차트 (`data`) | 복수 다각형 (`datasets`) |
|:-----|:-----|:-----|
| 데이터 소스 | `data` 필드 | `datasets[].data` 배열 |
| 히스토그램 | 지원 | **미지원** (다각형만) |
| 애니메이션 | 지원 | **미지원** (정적만) |
| 말풍선 위치 | 최고점 위 | **좌측 상단 고정** (세로 배치) |
| Y축 간격 커스텀 | `customYInterval` 가능 | **사용 금지** |
| `classRange` | 선택 | **필수** (정렬 필요) |

#### 트러블슈팅

| 증상 | 원인 | 해결 |
|:-----|:-----|:-----|
| 차트가 0~1 구간만 표시됨 | `customYInterval` 사용 | `customYInterval` 옵션 제거 |
| 첫 번째 다각형이 안 보임 | 코드 버전 문제 | 브라우저 캐시 삭제 (Ctrl+Shift+R) |
| Y축 여백이 이상함 | 파라미터 순서 오류 | 최신 코드로 업데이트 |
| 말풍선이 겹침 | 구버전 코드 | 최신 코드로 업데이트 (세로 배치 지원) |
| 두 데이터셋의 X축이 안 맞음 | `classRange` 미지정 | `classRange` 필수 지정 |

## 차트 전용 필드

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|:-----|:-----|:----:|:------:|:-----|
| `datasets` | `array` | X | - | 복수 데이터셋 배열 (복수 다각형 렌더링) |
| `classCount` | `number` | X | `5` | 계급 개수 |
| `classWidth` | `number` | X | 자동 | 계급 간격 |
| `classRange` | `object` | X | - | 계급 범위 수동 설정 (`{ firstStart, secondStart, lastEnd }`) |
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
| `options.polygon` | `object` | X | - | 다각형 옵션 |
| `options.polygon.hidden` | `array` | X | `[]` | 숨길 점의 인덱스 배열 (아래 규칙 참조) |

**polygon.hidden 인덱스 규칙 (매우 중요)**:

도수다각형은 양 끝에 **가상의 점(도수=0)**이 추가됩니다. 따라서:
- **점 인덱스 = 계급 인덱스 + 1**

**예시**: 계급이 12~14, 14~16, 16~18, 18~20, 20~22 (5개)인 경우
| 점 인덱스 | 설명 | x좌표 |
|:---:|:---|:---:|
| 0 | 가상 시작점 (도수=0) | 10 |
| 1 | 첫 번째 계급 (12~14) | 13 |
| 2 | 두 번째 계급 (14~16) | 15 |
| 3 | 세 번째 계급 (16~18) | 17 |
| 4 | 네 번째 계급 (18~20) | 19 |
| 5 | 다섯 번째 계급 (20~22) | 21 |
| 6 | 가상 끝점 (도수=0) | 24 |

**계산 공식**: 14~16 계급의 점을 숨기려면 → `계급 idx(1) + 1 = 2` → `"hidden": [2]`

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

**권장사항**
- **차트**: `canvasSize`로 정사각형 캔버스 사용 권장
- **테이블**: `canvasWidth` 또는 `canvasHeight` **둘 중 하나만** 사용 권장
- `canvasWidth`와 `canvasHeight`를 동시에 지정하면 비율이 왜곡될 수 있음

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

## 색상 설정 (Color Settings)

차트의 색상 테마를 변경할 수 있습니다.

### 색상 규칙 가이드

차트와 테이블에서 일관된 색상 체계를 위한 **권장 규칙**입니다.

#### 색상 팔레트

| 이름 | 그라디언트 | 단색 (점) |
|:-----|:----------|:---------|
| 녹색 | `#AEFF7E` → `#68994C` | `#8DCF66` |
| 파랑 | `#54A0F6` → `#6DE0FC` | `#61C1F9` |
| 빨강 | `#D15DA4` → `#E178F2` | `#D96BCB` |
| 주황 | `#F3A257` → `#FA716F` | `#F68D61` |

히스토그램 파랑 채우기: `#4141A3` → `#2CA0E8` (alpha: 0.5)

#### 테이블 셀 하이라이트

| 조건 | 색상 | Fill (30%) | Stroke (100%) |
|:-----|:-----|:-----------|:--------------|
| 단일 그룹 하이라이트 | 녹색 | `rgba(141, 207, 102, 0.3)` | `#8DCF66` |
| 복수 그룹 - 첫 번째 | 파랑 | `rgba(97, 193, 249, 0.3)` | `#61C1F9` |
| 복수 그룹 - 두 번째 | 빨강 | `rgba(217, 107, 203, 0.3)` | `#D96BCB` |
| 복수 그룹 - 세 번째 | 주황 | `rgba(246, 141, 97, 0.3)` | `#F68D61` |

Stroke 두께: `2px`

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

**중요**: 히스토그램과 도수다각형이 함께 사용될 때는 **동일한 색상 계열을 사용하지 않습니다.**
- 히스토그램: 파랑 계열
- 도수다각형: 녹색/빨강/주황 계열 (파랑 `primary` 제외)

#### 색상 규칙 요약

```
┌──────────────────────────────────────────────────────────────────────┐
│  히스토그램 단독        → 녹색 (#AEFF7E → #68994C)                   │
│  도수다각형 단독 (1개)  → 녹색 (#AEFF7E → #68994C)                   │
│  도수다각형 단독 (복수) → 파랑 → 빨강 → 주황 (녹색 X)                │
│  히스토그램 + 다각형    → 히스토그램: 파랑 / 다각형: 녹색→빨강→주황  │
└──────────────────────────────────────────────────────────────────────┘
```

### 옵션 우선순위

```
커스텀 색상 (histogramColor/polygonColor) > 프리셋 > 기본값
```

| 순위 | 옵션 | 설명 |
|:----:|:-----|:-----|
| 1 | `histogramColor` / `polygonColor` | 커스텀 색상 (최우선) |
| 2 | `histogramColorPreset` / `polygonColorPreset` | 프리셋 선택 |
| 3 | 기본값 | `"default"` 프리셋 |

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

### options.histogramColor

히스토그램 커스텀 색상을 지정합니다. 프리셋보다 우선 적용됩니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `string` 또는 `object` |
| **필수 여부** | 선택 |
| **기본값** | - (프리셋 사용) |
| **우선순위** | 프리셋보다 높음 |

#### 타입 1: CSS 그라데이션 문자열

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

#### 타입 2: 객체 (세부 제어)

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

### options.polygonColor

도수다각형 커스텀 색상을 지정합니다. 프리셋보다 우선 적용됩니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `string` 또는 `object` |
| **필수 여부** | 선택 |
| **기본값** | - (프리셋 사용) |
| **우선순위** | 프리셋보다 높음 |

#### 타입 1: CSS 그라데이션 문자열

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

#### 타입 2: 객체 (세부 제어)

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

**팁**: `callout.preset`은 `polygonColorPreset`과 동일한 값을 사용하면 색상이 일관됩니다.
**권장**: `callout.preset`은 따로 넣지 않아도 도수다각형의 색상 규칙에 따라 동일한 색상으로 출력되어 굳이 넣지 않아도 됩니다.

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

**팁**: 라벨은 KaTeX 수식을 지원합니다. 예: `"\\frac{1}{2}"` → ½ 분수 표시

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

**권장**: 파선 활성화 시 Y축 끝점에 값 라벨이 자동 생성되므로, 기존 Y축 라벨과 중복을 피하려면 `options.axis.showYLabels: false`를 함께 설정하세요.

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

**참고**: `showYLabels: false` 또는 `showXLabels: false`로 설정해도 축의 시작점(0)과 끝점(축 제목)은 항상 표시됩니다.

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

### options.customYInterval

Y축 간격을 사용자가 직접 지정합니다. 자동 계산 대신 고정된 간격을 사용합니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `number` |
| **필수 여부** | 선택 |
| **기본값** | `null` (자동 계산) |
| **권장 값** | 도수 모드: 정수 (1, 2, 5, 10), 상대도수 모드: 소수 (0.05, 0.1) |

**언제 customYInterval을 사용하나요?**

| 문제 상황 | 해결책 | 예시 |
|:----------|:-------|:-----|
| Y축 눈금이 너무 듬성듬성함 | 작은 간격 지정 | `"customYInterval": 1` |
| Y축 눈금이 너무 촘촘함 | 큰 간격 지정 | `"customYInterval": 5` |
| 특정 눈금 간격으로 문제 출제 | 원하는 간격 지정 | `"customYInterval": 2` |
| 상대도수 눈금을 0.1 단위로 | 소수 간격 지정 | `"customYInterval": 0.1` |

**주의사항**:
- **복수 다각형(`datasets`)에서는 사용 금지** - 좌표계 충돌로 차트가 깨집니다
- 도수(frequency) 모드에서는 **정수**를, 상대도수 모드에서는 **소수**를 사용하세요

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

```json
// 상대도수 모드에서 0.1 간격
{
  "data": [1, 1, 2, 2, 2, 3, 3, 3, 3, 4],
  "options": {
    "dataType": "relativeFrequency",
    "customYInterval": 0.1
  }
}
```

**결과**: Y축이 0, 0.1, 0.2, 0.3, 0.4... 간격으로 표시됩니다.

### options.polygon

다각형(도수다각형)의 점과 선을 부분적으로 숨기는 옵션입니다. 통계 문제에서 "일부 데이터가 소실된" 상황을 표현할 때 사용합니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `object` |
| **필수 여부** | 선택 |
| **기본값** | `{}` |

#### 하위 속성

| 속성 | 타입 | 기본값 | 설명 |
|:-----|:-----|:------:|:-----|
| `hidden` | `number[]` | `[]` | 숨길 계급 인덱스 배열 |

#### hidden 동작 원리

`hidden` 배열에 포함된 인덱스의:
- **점**: 해당 계급의 점이 숨겨짐
- **연결 선**: 해당 점과 연결된 양쪽 선이 모두 숨겨짐

예: `"hidden": [2]`이면:
- index 2의 점 숨김
- index 1 → 2 선 숨김
- index 2 → 3 선 숨김

#### 예시 JSON

```json
{
  "purpose": "chart",
  "data": [11, 11, 13, 13, 13, 13, 15, 15, 15, 15, 15, 15, 17, 17, 17, 17, 19, 19, 21],
  "classRange": { "firstStart": 10, "secondStart": 12, "lastEnd": 22 },
  "options": {
    "showHistogram": true,
    "showPolygon": true,
    "dataType": "frequency",
    "polygon": {
      "hidden": [3]
    }
  }
}
```

**결과**: index 3 (16~18 계급)의 점과 연결 선이 보이지 않아, 다각형이 끊어진 것처럼 표시됩니다.

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

**차트 좌표 시스템 이해하기**:
```
y(그리드)
 10 |□□□□□□□□□□□
  9 |□□□□□□□□□□□
  8 |□□□□■■■□□□□  ← y=8
  7 |□□□■■■■■□□□  ← y=7
  6 |□□■■■■■■■□□  ← y=6
  5 |□□□■■■■■□□□  ← y=5
  4 |□□□□■■■□□□□  ← y=4
  3 |□□□□□□□□□□□
  2 |□□□□□□□□□□□
  1 |□□□□□□□□□□□
  0 |___________________→ x(막대 인덱스)
     0 1 2 3 4 5 6 7 8 9 10
```
- **x**: 막대(계급) 인덱스 (0부터 시작, 좌→우)
- **y**: 그리드 행 (0이 하단, 숫자가 클수록 위)
- **■**: 찢김 효과가 적용될 영역

#### AI 생성 가이드: 찢김(Corruption) 효과

단순히 해당 구간을 사각형으로 가리는 것이 아니라 **종이가 찢어진 듯한 자연스러운 불규칙 형상**을 만들어야 합니다.

**필수 계산 (찢김 생성 전 반드시 수행)**:
1. **최대 도수 확인** - 데이터에서 가장 높은 빈도 찾기
2. **customYInterval 확인** - 없으면 자동 계산됨
3. **gridDivisions 계산** = (최대도수 + 2) / customYInterval
4. **유효 y좌표 범위** = 0 ~ (gridDivisions - 1)
5. **찢으려는 데이터의 y좌표가 이 범위 내에 있는지 확인**

**y좌표와 gridDivisions 관계 (매우 중요)**:
- y좌표는 **Y축 그리드 분할 수(gridDivisions)**에 맞춰야 합니다
- **도수(frequency) 모드 자동 계산**: `targetMax = 최대도수 + 2`, 그 후 5~10칸 사이로 분할
- **상대도수 모드**: 항상 10칸 고정

**도수 모드 gridDivisions 계산 예시:**
| 최대 도수 | targetMax | 간격 | gridDivisions | **유효 y좌표** |
|:----------|:----------|:-----|:--------------|:---------------|
| 12 | 14 | 2 | 7 | **0~6** |
| 8 | 10 | 2 | 5 | **0~4** |
| 20 | 22 | 5 | 5 | **0~4** |
| 50 | 52 | 10 | 6 | **0~5** |

**customYInterval 사용 시:**
| customYInterval | 최대 도수 | gridDivisions | **유효 y좌표** |
|:----------------|:----------|:--------------|:---------------|
| `1` | 12 | 14 | **0~13** |
| `2` | 12 | 7 | **0~6** |
| `5` | 12 | 3 | **0~2** |

**y좌표는 0부터 시작하므로, 최대 y = gridDivisions - 1 입니다!**
**gridDivisions 이상의 y좌표는 무의미합니다!**
**확실하지 않으면 y좌표를 0~6 범위로 보수적으로 설정하세요.**

**절대 규칙**: 찢김 효과의 심미성보다 **타겟 데이터의 은폐**가 더 중요합니다.
텍스트에서 "보이지 않는다"고 한 구간의 인덱스가 `idx 2, 3`이라면, 생성되는 모든 `cells` 좌표들의 집합은 시각적으로 `idx 2`와 `3`을 완벽하게 덮어야 합니다.

**찢김 범위 핵심 규칙**:
1. **타겟 막대만 찢기**: 가려야 할 막대(계급)만 찢고, 다른 막대의 데이터는 절대 건드리지 않음
2. **막대 꼭대기 y좌표 계산**:
   ```
   막대 꼭대기 y좌표 = 도수 / customYInterval
   ```
   - 도수 11, 간격 1 → **꼭대기 = y=11**
   - 도수 12, 간격 2 → **꼭대기 = y=6** (12/2=6)
3. **막대 꼭대기 포함**: 계산된 꼭대기 y좌표를 **포함**하고, 그 아래로 1~2칸까지 찢기
4. **양옆 마진 제한**: 마진 1칸은 **인접 막대의 꼭대기보다 높은 y좌표에서만** 찢기
5. **x범위 유지 (매우 중요)**: y좌표가 내려가도 **타겟 막대의 x범위는 끝까지 유지**
   - ❌ 잘못된 예: `"3-10:4-10"`, `"3-9"`, `"3-8"` (y=9, y=8에서 x=4가 빠짐!)
   - 올바른 예: `"3-10:4-10"`, `"3-9:4-9"`, `"3-8:4-8"` (x=3~4 유지)

**계단식 찢김 예시** (idx 2, 3을 가리고, 각각 도수 11, 11인 경우, customYInterval=1):
```
idx:     0    1    2    3    4    5    6
y=13   □□  ■■  ■■  ■■  ■■  ■■  □□   ← 상단 전체
y=12   □□  ■■  ■■  ■■  ■■  ■■  □□   ← 좁아짐
y=11   □□  ■■  ■■  ■■  ■■  ■■  □□   ← idx 2, 3 꼭대기 (도수 11) [포함]
y=10   □□  □□  ■■  ■■  ■■  □□  □□   ← 좁아짐
y=9    □□  □□  ■■  ■■  □□  □□  □□   ← 계속 좁아짐
y=8    □□  □□  ■■  ■■  □□  □□  □□   ← idx 4 꼭대기(도수 8) 위에서 끝
y=7    □□  □□  □□  □□  ██  □□  □□   ← idx 4 실제 데이터 (안 건드림!)
y=3    □□  ██  □□  □□  □□  □□  □□   ← idx 1 실제 데이터 (안 건드림!)
```
- idx 2, 3 도수=11 → 꼭대기 y=11 **반드시 포함**
- **x=3, 4 범위를 끝까지 유지** (단일 좌표로 줄이지 않음!)
- idx 1 도수=4 → 마진은 y=5 이상에서만
- idx 4 도수=8 → 마진은 y=9 이상에서만

**핵심**: 타겟 막대의 x범위(예: x=3~4)는 **끝점까지 유지**해야 막대가 완전히 가려짐!

**금지 사항**:
- 단일 좌표(`"x-y"`)만 넣어 사각형으로 가리기 금지
- 데이터가 없는 구간만 가리기 금지
- **gridDivisions를 초과하는 y좌표 사용 금지**
- **심미성을 위해 타겟 데이터를 노출시키기 금지**

**필수 사항**:
1. **y좌표 범위 먼저 계산** - customYInterval 설정 확인 필수
2. **타겟 막대의 도수 확인** - 각 막대의 높이(도수)를 먼저 파악
3. **인접 막대의 도수 확인** - 마진 범위 결정에 필수
4. **계단식 찢김** - 각 막대 높이에 맞춰 내려가는 형태

### 단계별 cells 생성 규칙

**x좌표 규칙 (매우 중요)**:
```
x=0: Y축 왼쪽 빈 영역 (막대 없음)
x=1: 첫 번째 막대 (첫 번째 계급)
x=2: 두 번째 막대
...
x=N: N번째 막대 (마지막 계급)
x=N+1: X축 라벨 영역
```

**예시 (7개 막대, 계급 10~24):**
| x좌표 | 영역 |
|:-----:|:-----|
| 0 | Y축 왼쪽 빈 영역 |
| 1 | 10~12 (첫 번째 막대) |
| 2 | 12~14 |
| 3 | 14~16 ← 찢을 타겟 |
| 4 | 16~18 ← 찢을 타겟 |
| 5 | 18~20 |
| 6 | 20~22 |
| 7 | 22~24 (마지막 막대) |
| 8 | X축 라벨 영역 "(개)" |

**계급 idx와 x좌표 관계**: `x좌표 = 계급 idx + 1`
- idx 2, 3 막대를 찢으려면 → **x=3, 4**

**1단계: 정보 수집**
```
- 찢을 막대 계급 idx 목록 (예: idx 2, 3)
- 각 막대의 도수 (예: idx 2=11, idx 3=11)
- 인접 막대 도수 (예: idx 1=4, idx 4=8)
- customYInterval (예: 1)
- 최대 도수 추정 → gridDivisions 계산
```

**2단계: x좌표 범위 결정**
```
- 타겟 막대: idx 2, 3 → x좌표: 3, 4 (idx + 1)
- 왼쪽 마진 1칸: x=2 추가 → x 범위: 2~4
- 오른쪽 마진 1칸: x=5 추가 → x 범위: 2~5
- 상단은 더 넓게: x 범위: 0~8 (Y축~X축 라벨까지 전체 커버)
```

**3단계: y좌표 결정 (위에서 아래로)**
```
공식: 막대 꼭대기 y = 도수 / customYInterval

1. 상단 시작: y = gridDivisions - 1 (예: 13)
2. 타겟 막대 꼭대기: y = 도수 / 간격
   - 예: 도수 11, 간격 1 → 꼭대기 y = 11
   - 예: 도수 12, 간격 2 → 꼭대기 y = 6
3. 끝점: 인접 막대 꼭대기 + 1
   - 예: idx 4 도수 8, 간격 1 → 꼭대기 y=8 → 끝점 y=9까지
   - 예: idx 1 도수 4, 간격 1 → 꼭대기 y=4 → 끝점 y=5까지
```

**4단계: cells 배열 작성 (위→아래, 넓게→좁게)**
```
각 y좌표마다:
- 해당 y에서 찢을 x 범위 결정
- 마진 idx는 해당 idx의 꼭대기(=(도수/간격)-1)보다 높은 y에서만 포함
- "x시작-y:x끝-y" 형식으로 작성
```

**실전 모범 답안 (실제 동작하는 완전한 예시)**

**시나리오**:
- 막대 7개 (계급 idx 0~6, x좌표 1~7)
- 계급 idx 2, 3을 가려야 함 → **x좌표 3, 4** (도수 각각 11, 11)
- idx 1 도수: 4 (x좌표 2), idx 4 도수: 8 (x좌표 5)
- customYInterval: 1, gridDivisions: 14
- x좌표 범위: 0(Y축)~8(X축 라벨)

```json
{
  "purpose": "chart",
  "data": [
    11, 11,
    13, 13, 13, 13,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17,
    19, 19, 19, 19, 19, 19, 19, 19,
    21, 21, 21,
    23
  ],
  "classRange": {
    "firstStart": 10,
    "secondStart": 12,
    "lastEnd": 24
  },
  "canvasWidth": 700,
  "canvasHeight": 450,
  "options": {
    "showHistogram": true,
    "showPolygon": false,
    "dataType": "frequency",
    "customYInterval": 1,
    "corruption": {
      "enabled": true,
      "cells": [
        "0-13:8-13",
        "1-12:7-12",
        "1-11:7-11",
        "2-10:6-10",
        "2-9:5-9",
        "2-8:4-8",
        "2-7:4-7",
        "3-6:4-6",
        "3-5"
      ],
      "style": {
        "edgeComplexity": 0.8,
        "transparent": true
      }
    }
  }
}
```

**cells 배열 해설:**
```
"0-13:8-13"   → y=13: 상단 전체 (x: 0=Y축 ~ 8=X축라벨)
"1-12:7-12"   → y=12: 살짝 좁아짐 (x: 1~7)
"1-11:7-11"   → y=11: 타겟 막대 꼭대기 ★도수 11 포함★ (x좌표 3,4 = idx 2,3)
"2-10:6-10"   → y=10: 좁아짐 (x: 2~6)
"2-9:5-9"     → y=9: x좌표 5 (idx 4) 도수 8 + 1
"2-8:4-8"     → y=8: x좌표 5 (idx 4) 꼭대기 ★도수 8 포함★
"2-7:4-7"     → y=7: 계속 좁아짐
"3-6:4-6"     → y=6: 더 좁아짐
"3-5"         → y=5: 끝점 (x좌표 2 (idx 1) 도수 4 + 1)
```

**시각화:**
```
y(그리드)  x좌표: 0    1    2    3    4    5    6    7    8
           영역: Y축  막대 막대 막대 막대 막대 막대 막대 X축
           idx:  -    0    1    2    3    4    5    6    -
  13 |         ■■  ■■  ■■  ■■  ■■  ■■  ■■  ■■  ■■   ← 상단 전체
  12 |         □□  ■■  ■■  ■■  ■■  ■■  ■■  ■■  □□   ← 살짝 좁아짐
  11 |         □□  ■■  ■■  ■■  ■■  ■■  ■■  ■■  □□   ← 타겟 x=3,4 꼭대기 (도수 11) [포함]
  10 |         □□  □□  ■■  ■■  ■■  ■■  ■■  □□  □□   ← 좁아짐
   9 |         □□  □□  ■■  ■■  ■■  ■■  □□  □□  □□   ← x=5 도수 8 + 1
   8 |         □□  □□  ■■  ■■  ■■  □□  □□  □□  □□   ← x=5 (idx 4) 꼭대기 (도수 8) [포함]
   7 |         □□  □□  ■■  ■■  ■■  □□  □□  □□  □□
   6 |         □□  □□  □□  ■■  ■■  □□  □□  □□  □□   ← 좁아짐
   5 |         □□  □□  □□  ■■  □□  □□  □□  □□  □□   ← 끝점 (x=2 도수 4 + 1)
   4 |         □□  ██  □□  □□  □□  □□  □□  □□  □□   ← x=2 (idx 1) 실제 데이터 (안 건드림!)
```
██ = 다른 막대의 실제 데이터 (절대 찢으면 안됨)
* =타겟 막대 꼭대기는 반드시 찢어야 함
x좌표 = 계급 idx + 1 (x=0은 Y축 영역, x=8은 X축 라벨 영역)

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
  "data": [
    11, 11,
    13, 13, 13, 13,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17,
    19, 19, 19, 19, 19, 19, 19, 19,
    21, 21, 21,
    23
  ],
  "classRange": { "firstStart": 10, "secondStart": 12, "lastEnd": 24 },
  "animation": false,
  "options": {
    "dataType": "frequency",
    "showHistogram": true,
    "showPolygon": false,
    "corruption": {
      "enabled": true,
      "cells": [
        "0-6:8-6",
        "1-5:7-5",
        "2-4:6-4",
        "3-3:5-3",
        "4-2"
      ],
      "style": {
        "edgeComplexity": 0.8,
        "transparent": true
      }
    }
  }
}
```

**결과**: 차트 상단에서 V자 형태로 자연스럽게 찢어진 효과가 적용됩니다. (최대 도수 12 → gridDivisions=7 → y=0~6)

#### 테이블 예시

```json
{
  "purpose": "table",
  "tableType": "basic-table",
  "data": "헤더: 항목, 값1, 값2\nA: 10, 20\nB: 30, 40",
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

### 전체 설정

```json
{
  "purpose": "chart",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75, 68, 91, 83, 72, 78],
  "classCount": 5,
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

# 산점도 (Scatter)

X-Y 좌표 데이터를 점으로 시각화합니다.

## 산점도 전용 필드

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|:-----|:-----|:----:|:------:|:-----|
| `purpose` | `string` | **O** | - | `"scatter"` 필수 |
| `data` | `array` | **O** | - | 2D 배열 `[[x1, y1], [x2, y2], ...]` |
| `canvasWidth` | `number` | X | `650` | 캔버스 너비 (px) |
| `canvasHeight` | `number` | X | `700` | 캔버스 높이 (px) |
| `options.axisLabels` | `object` | X | `null` | 축 제목 설정 |
| `options.pointSize` | `number` | X | `6` | 점 반지름 (px) |
| `options.pointColor` | `string` | X | `"#93DA6A"` | 점 색상 |

## 산점도 필드별 동작

### data (필수)

**형식**: 2D 배열 `[[x1, y1], [x2, y2], ...]`

```json
{
  "purpose": "scatter",
  "data": [[10, 20], [15, 35], [20, 40], [25, 55], [30, 60]]
}
```

**규칙**:
- 최소 2개 이상의 데이터 포인트 필요
- 각 포인트는 `[x, y]` 형식의 숫자 배열
- X, Y 값은 모두 숫자여야 함

### options.axisLabels

축 제목을 설정합니다.

```json
{
  "purpose": "scatter",
  "data": [[10, 20], [15, 35], [20, 40]],
  "options": {
    "axisLabels": {
      "xAxis": "수학 점수",
      "yAxis": "영어 점수"
    }
  }
}
```

**위치**:
- X축 제목: 숫자 라벨 아래, 오른쪽 끝 정렬
- Y축 제목: 차트 상단에 표시

### options.pointSize / options.pointColor

점의 크기와 색상을 설정합니다.

```json
{
  "purpose": "scatter",
  "data": [[10, 20], [15, 35], [20, 40]],
  "options": {
    "pointSize": 8,
    "pointColor": "#FF6B6B"
  }
}
```

## 산점도 축 레이아웃

차트와 동일하게 양쪽에 여유 공간이 추가됩니다.

**X축 구조**: `[압축 ≈] [xMin] ... [xMax] [여유]`
**Y축 구조**: `[압축 ≈] [yMin] ... [yMax] [여유]`

- 왼쪽/아래: 압축 구간 1칸 (이중물결표 ≈ 표시)
- 오른쪽/위: 여유 공간 1칸 (최댓값 + interval 라벨 표시)
- 차트 영역은 사각형 테두리로 감싸짐

## 산점도 전체 옵션 예시

### 최소 설정

```json
{
  "purpose": "scatter",
  "data": [[10, 20], [15, 35], [20, 40], [25, 55], [30, 60]]
}
```

### 전체 설정

```json
{
  "purpose": "scatter",
  "data": [[62, 78], [75, 85], [80, 90], [85, 88], [90, 95], [95, 92]],
  "canvasWidth": 700,
  "canvasHeight": 600,
  "options": {
    "axisLabels": {
      "xAxis": "1학기 점수",
      "yAxis": "2학기 점수"
    },
    "pointSize": 7,
    "pointColor": "#4ECDC4"
  }
}
```

### Corruption (찢김 효과) 예시

```json
{
  "purpose": "scatter",
  "data": [[5, 5], [5, 15], [10, 30], [15, 15], [15, 25], [20, 5], [20, 20], [20, 35], [25, 10], [25, 15], [25, 25], [30, 25], [30, 30], [30, 35], [30, 45], [35, 35], [45, 45], [50, 50]],
  "options": {
    "axisLabels": {
      "xAxis": "듣기 점수(점)",
      "yAxis": "말하기 점수(점)"
    },
    "corruption": {
      "enabled": true,
      "cells": "4-1:6-1, 4-2:6-2, 5-3:6-3, 5-4:6-4"
    }
  }
}
```

**셀 좌표 설명:**
- X축: `0`=압축(≈), `1`~`N`=데이터 구간, `N+1`=여유 구간
- Y축: `0`=압축(≈), `1`~`M`=데이터 구간, `M+1`=여유 구간 (하단부터)
- 형식: `"x-y"` (단일 셀) 또는 `"x1-y1:x2-y2"` (범위)
- 여러 범위: `"4-1:6-2, 5-3:6-4"` 또는 `["4-1:6-2", "5-3:6-4"]`

**데이터 값 → 셀 좌표 변환 공식:**

1. **간격(interval) 계산**: `(최댓값 - 최솟값) / 5`의 깔끔한 수 (1, 2, 5, 10, 20, 50...)
2. **축 시작값**: `floor(데이터최솟값 / interval) * interval`
3. **셀 인덱스 계산**:
   - 시작 셀 = `floor(시작값 / interval) + 1`
   - 끝 셀 = `끝값 / interval` (끝값이 interval 배수일 때)

**변환 예시** (위 데이터 기준, interval=10, 축 시작=0):

| 찢어진 영역 설명 | 셀 계산 | cells 값 |
|-----------------|---------|----------|
| 듣기 30~60, 말하기 0~20 | X: 30/10+1=4 ~ 6, Y: 0/10+1=1 ~ 2 | `"4-1:6-2"` |
| 듣기 40~60, 말하기 20~40 | X: 40/10+1=5 ~ 6, Y: 20/10+1=3 ~ 4 | `"5-3:6-4"` |

→ 최종: `"cells": "4-1:6-2, 5-3:6-4"`

---

# 테이블 (Table)

다양한 테이블 형식을 Canvas에 렌더링합니다.

## 테이블 전용 필드

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|:-----|:-----|:----:|:------:|:-----|
| `tableType` | `string` | X | `"basic-table"` | 테이블 타입 |
| `canvasWidth` | `number` | X | `600` | 캔버스 너비 (px) |
| `canvasHeight` | `number` | X | `400` | 캔버스 높이 (px) |
| `options.showTotal` | `boolean` | X | `true` | 합계 행 표시 (basic-table 전용) |
| `options.showMergedHeader` | `boolean` | X | `true` | 병합 헤더 표시 (basic-table 전용) |
| `cellAnimations` | `array` | X | `null` | 셀 애니메이션 설정 |
| `cellAnimationOptions` | `object` | X | `null` | 애니메이션 재생 옵션 |

## 테이블 필드별 동작

### tableType

테이블 형식을 지정합니다.

| 항목 | 설명 |
|:-----|:-----|
| **타입** | `string` |
| **필수 여부** | 선택 |
| **기본값** | `"basic-table"` |

| 값 | 이름 | 설명 | data 형식 |
|:---|:-----|:-----|:----------|
| `"basic-table"` | 기본 테이블 | 행/열 교차 분류 (상대도수 등) | 특수 문자열 |
| `"category-matrix"` | 카테고리 행렬 | 카테고리별 데이터 비교 | 특수 문자열 |
| `"stem-leaf"` | 줄기-잎 그림 | 데이터 분포 시각화 | 숫자 또는 특수 문자열 |

#### data 형식 비교표

| tableType | data 타입 | 형식 예시 |
|:----------|:----------|:----------|
| `basic-table` | `string` | `"헤더: 라벨명, 열1, 열2\n행1: 값1, 값2"` |
| `category-matrix` | `string` | `"헤더: A, B, C\n행1: 10, 20, 30"` |
| `stem-leaf` | `string` | `"162 178 175"` 또는 `"남: 162 178\n여: 160 165"` |

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
  "data": "헤더: 항목, 값\nA: 10\nB: 20\nC: 30",
  "canvasWidth": 700,
  "canvasHeight": 500
}
```

**결과**: 700x500px 크기의 테이블 생성

**테이블 권장사항**: `canvasWidth` 또는 `canvasHeight` **둘 중 하나만** 사용하세요.
- 테이블은 내용에 따라 자동으로 크기가 조절됩니다
- 한 축만 지정하면 나머지는 비율에 맞게 자동 계산
- 예: `"canvasWidth": 700` → 너비 700px, 높이는 자동

## 타입별 data 형식

### 1. category-matrix (카테고리 행렬)

`헤더: 값들` + `라벨: 값들` 형식의 문자열을 사용합니다.

| rowIndex | 형식 | 설명 |
|:---------|:-----|:-----|
| 0 (헤더) | `헤더: A, B, C, ...` | 열 이름들 |
| 1~ (데이터) | `라벨: 값1, 값2, ...` | 각 행의 데이터 |

```json
{
  "purpose": "table",
  "tableType": "category-matrix",
  "data": "헤더: A, B, C, D, E\n전체 학생 수 (명): 200, 250, 300, 350, 400\nO형인 학생 수 (명): 50, 60, 70, 80, 90"
}
```

비숫자 값(`null`, `?` 등) 사용법은 [특수 문자](#특수-문자-special-characters) 섹션 참조

### 2. basic-table (기본 테이블)

`헤더: 행라벨명, 열이름들` + `행이름: 값들` 형식의 문자열을 사용합니다.
도수분포표, 이원분류표 등 다양한 형태의 테이블을 만들 수 있습니다.

**기본 형식 (병합 헤더 없음):**
```
헤더: 행라벨명, 열1, 열2, ...
행이름1: 값1, 값2, ...
행이름2: 값1, 값2, ...
```

**병합 헤더 포함 형식 (이원분류표):**
```
병합헤더텍스트
헤더: 행라벨명, 열1, 열2, ...
행이름1: 값1, 값2, ...
행이름2: 값1, 값2, ...
```

**병합 헤더 감지 규칙**: 첫 줄이 `헤더:`로 시작하지 않고 `:`도 없으면 병합 헤더로 인식

비숫자 값(`null`, `?` 등) 사용법은 [특수 문자](#특수-문자-special-characters) 섹션 참조

**도수분포표 형태:**
```json
{
  "purpose": "table",
  "tableType": "basic-table",
  "data": "헤더: 키(cm), 도수(명), 상대도수\n60^{이상}~70^{미만}: 2, 0.2\n70~80: 5, 0.5\n80~90: 3, 0.3"
}
```

**권장**: 첫 번째 데이터 행에만 `^{이상}`, `^{미만}` 상첨자 표기를 사용하세요.
- 상첨자: `60^{이상}~70^{미만}` → 60<sup>이상</sup>~70<sup>미만</sup>
- 하첨자: `60_{이상}~70_{미만}` → 60<sub>이상</sub>~70<sub>미만</sub>
- 나머지 행은 숫자만 표기해도 됩니다.

**이원분류표 형태:**
```json
{
  "purpose": "table",
  "tableType": "basic-table",
  "data": "비율\n헤더: 혈액형, 남학생, 여학생\nA: 0.4, 0.4\nB: 0.22, 0.2\nAB: 0.12, 0.16\nO: 0.26, 0.24"
}
```

#### options (basic-table 전용)

| 옵션 | 타입 | 필수 | 기본값 | 설명 |
|:-----|:-----|:----:|:------:|:-----|
| `showTotal` | `boolean` | X | `true` | 합계 행 표시 |
| `showMergedHeader` | `boolean` | X | `true` | 병합 헤더 표시 |

**showMergedHeader 권장값**:
- **도수분포표** (`~` 또는 `^{이상}`, `^{미만}` 포함): `showMergedHeader: false` 권장
- **이원분류표** (위 패턴 없음): `showMergedHeader: true` 권장

**주의**: `showTotal: true`일 때, 비숫자 값(`null`, `?` 등)이 있으면 합계가 `-`로 표시됩니다. 이 경우 `cellVariables`로 합계를 직접 지정하세요. ([상세 설명](#합계-행-직접-지정-cellvariables))

```json
{
  "purpose": "table",
  "tableType": "basic-table",
  "data": "헤더: 혈액형, 남학생, 여학생\nA: 0.4, null\nB: null, 0.2",
  "options": {
    "showTotal": true,
    "showMergedHeader": true
  },
  "cellVariables": [
    { "rowIndex": 3, "colIndex": 1, "value": "1" },
    { "rowIndex": 3, "colIndex": 2, "value": "1" }
  ]
}
```

**설명**: A행 여학생, B행 남학생이 `null`(빈칸)이므로 합계가 자동 계산 불가 → `cellVariables`로 합계(rowIndex 3) 직접 지정

#### LaTeX 분수 표기

테이블 셀에서 `\frac{분자}{분모}` 형식으로 분수를 표현할 수 있습니다.

```json
{
  "purpose": "table",
  "tableType": "basic-table",
  "data": "헤더: 횟수(회), 상대도수\n0^{이상}~4^{미만}: \\frac{1}{6}\n4~8: \\frac{2}{9}\n8~12: null",
  "options": {
    "showTotal": true,
    "showMergedHeader": false
  }
}
```

**자동 높이 조정**: 테이블에 분수가 하나라도 포함되면 **모든 행의 높이가 52px로 통일**됩니다 (기본 40px).

### 3. stem-leaf (줄기-잎 그림)

줄기-잎 그림은 숫자를 입력하면 자동으로 줄기/잎으로 분리되어 배치됩니다.

**동적 너비**: 줄기-잎 그림은 데이터 양에 따라 테이블 너비가 자동으로 계산됩니다. `canvasWidth`를 지정하면 해당 크기에 맞게 비율 스케일링됩니다.

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

#### cellVariables (최상위 레벨)

줄기-잎은 데이터가 자동 배치되므로, 특정 셀 값을 수정하려면 `cellVariables`를 사용합니다.

**참고**: 줄기-잎에서는 data 문자열에 `null`이나 `?`를 직접 넣을 수 없습니다 (숫자만 파싱됨).
특정 잎을 `?`나 빈칸으로 표시하려면 `cellVariables`를 사용해야 합니다.

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
    { "rowIndex": 2, "colIndex": 2, "value": [null, 2, 5] }
  ]
}
```
→ 왼쪽 잎을 `x 5`로, 오른쪽 잎을 `(빈칸) 2 5`로 표시

## 테이블 전체 옵션 예시

### 최소 설정

```json
{
  "purpose": "table",
  "data": "헤더: 항목, 값\nA: 10\nB: 20\nC: 30"
}
```

| 적용 값 | 설명 |
|:--------|:-----|
| `tableType` | `"basic-table"` (기본값) |
| `canvasWidth` | `600` (기본값) |
| `canvasHeight` | `400` (기본값) |

## 타입별 전체 설정 예시

### 1. category-matrix (카테고리 행렬)

```json
{
  "purpose": "table",
  "tableType": "category-matrix",
  "data": "헤더: A, B, C, D, E\n전체 학생 수 (명): 200, 250, null, 350, 400\nO형인 학생 수 (명): 50, ?, 70, 80, 90",
  "canvasWidth": 800,
  "canvasHeight": 300,
  "animation": true,
  "cellAnimations": [
    { "rowIndex": 1, "colIndex": 2, "duration": 1500, "repeat": 3 },
    { "rowIndex": 2, "colIndex": 2, "duration": 1500, "repeat": 3 }
  ],
  "cellAnimationOptions": {
    "blinkEnabled": true
  },
  "cellVariables": [
    { "rowIndex": 1, "colIndex": 3, "value": "300" },
    { "rowIndex": 2, "colIndex": 2, "value": "60" }
  ]
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
| `cellAnimations` | `array` | X | 셀 하이라이트 (rowIndex, colIndex, duration, repeat) |
| `cellAnimationOptions` | `object` | X | 애니메이션 옵션 (rowIndex, colIndex, duration, repeat) |
| `cellVariables` | `array` | X | 셀 값 커스터마이징 (rowIndex/colIndex 기반) |

#### data 형식 상세

```
헤더: A, B, C, D, E                          ← rowIndex 0 (열 이름)
전체 학생 수 (명): 200, 250, null, 350, 400  ← rowIndex 1 (null = 빈칸)
O형인 학생 수 (명): 50, ?, 70, 80, 90        ← rowIndex 2 (? = 물음표)
```

#### 셀 값 커스터마이징

데이터 문자열에서 직접 `null`, `?`, `x` 등을 사용할 수 있습니다.

```json
{
  "data": "헤더: A, B, C\n전체: 200, null, 300\nO형: x, 60, ?"
}
```

| 입력 | 결과 |
|:-----|:-----|
| `null` | 빈칸 |
| `?` | 물음표 표시 |
| `x`, `A` 등 | 해당 문자 그대로 표시 |

**권장사항**: 카테고리 매트릭스에서는 `cellVariables` 대신 **data 문자열에서 직접 편집**하는 것을 권장합니다.
- JSON 경량화: `cellVariables` 배열 없이도 동일한 결과
- 가독성 향상: 데이터와 커스텀 값이 한눈에 보임
- 유지보수 용이: rowIndex/colIndex 계산 불필요

### 2. basic-table (기본 테이블)

basic-table은 다양한 형태의 테이블을 만들 수 있는 범용 타입입니다.
data 형식과 최소 예시는 [2. basic-table (기본 테이블)](#2-basic-table-기본-테이블) 섹션 참조

**옵션 조합 예시:**
- 도수분포표: `showMergedHeader: false`, `showTotal: true`
- 이원분류표: `showMergedHeader: true`, `showTotal: true`

#### 필드 설명

| 필드 | 타입 | 필수 | 설명 |
|:-----|:-----|:----:|:-----|
| `purpose` | `string` | **O** | `"table"` |
| `tableType` | `string` | **O** | `"basic-table"` |
| `data` | `string` | **O** | `"병합헤더\n헤더: 행라벨명, 열들\n행: 값들"` 형식 |
| `canvasWidth` | `number` | X | 캔버스 너비 (기본: 600) |
| `canvasHeight` | `number` | X | 캔버스 높이 (기본: 400) |
| `animation` | `boolean` | X | 애니메이션 활성화 (기본: true) |
| `options.showTotal` | `boolean` | X | 합계 행 표시 (기본: true) |
| `options.showMergedHeader` | `boolean` | X | 병합 헤더 표시 (기본: true) |
| `cellAnimations` | `array` | X | 셀 하이라이트 (rowIndex, colIndex, duration, repeat) |
| `cellAnimationOptions` | `object` | X | 애니메이션 옵션 (rowIndex, colIndex, duration, repeat) |
| `cellVariables` | `array` | X | 셀 값 커스터마이징 (rowIndex/colIndex 기반) |

#### 옵션 조합별 결과

| showMergedHeader | showTotal | 병합 헤더 | 합계 행 | 용도 |
|:----------------:|:---------:|:---------:|:-------:|:-----|
| `true` | `true` | O | O | 전체 표시 (기본값) |
| `false` | `true` | X | O | 합계만 필요할 때 |
| `true` | `false` | O | X | 헤더만 필요할 때 |
| `false` | `false` | X | X | 최소 표시 |

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

**기본 형식:**
```
헤더: 행라벨명, 열1, 열2, ...    ← rowIndex 0
행이름1: 값1, 값2, ...           ← rowIndex 1
행이름2: 값1, 값2, ...           ← rowIndex 2
```

**병합 헤더 포함:**
```
병합헤더텍스트                   ← cellVariables로 수정 불가 (시각 전용)
헤더: 행라벨명, 열1, 열2, ...    ← rowIndex 0
행이름1: 값1, 값2, ...           ← rowIndex 1
```

**규칙**: 첫 줄이 `헤더:`로 시작하지 않고 `:`도 없으면 병합 헤더로 인식

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

#### 셀 값 커스터마이징

데이터 문자열에서 직접 `null`, `?`, `x`, `/` 등을 사용할 수 있습니다.

```json
{
  "data": "헤더: 혈액형, 남학생, 여학생\nA: 0.4, null\nB: ///, 0.2"
}
```

| 입력 | 결과 |
|:-----|:-----|
| `null` | 빈칸 |
| `/`, `//`, ... | 탈리마크 |
| `?` | 물음표 표시 |
| `x`, `A` 등 | 해당 문자 그대로 표시 |

**주의**: 비숫자 값(`null`, `?`, `/` 등) 사용 시 합계가 자동 계산되지 않아 `-`로 표시됩니다.
- **데이터 행**: data 문자열에서 직접 편집 (가독성 좋음)
- **합계 행**: `cellVariables`로 반드시 직접 지정 필요

#### 합계 행 직접 지정 (cellVariables)

`showTotal: true`일 때 합계 행 값을 cellVariables로 직접 지정할 수 있습니다.

```json
{
  "purpose": "table",
  "tableType": "basic-table",
  "data": "헤더: 혈액형, 남, 여\nA: ///, null\nB: 0.4, null",
  "cellVariables": [
    { "rowIndex": 3, "colIndex": 1, "value": "?" },
    { "rowIndex": 3, "colIndex": 2, "value": "1" }
  ],
  "options": {
    "showTotal": true
  }
}
```

**결과:**
- 합계 행 남학생 열: "?" (물음표)
- 합계 행 여학생 열: "1"

**참고**: rowIndex 규칙
- rowIndex 0 = 컬럼 헤더 (`헤더: 혈액형, 남, 여`)
- rowIndex 1~ = 데이터 행
- 합계 행 = 마지막 데이터 행 + 1
- 예: 헤더(0) + 데이터 2행(1,2) → 합계 행은 rowIndex 3

**병합 헤더는 rowIndex에 포함되지 않습니다** (시각 전용, cellVariables로 수정 불가)

**중요: 합계 자동 계산 제한**

셀에 비숫자 값(`null`, `?`, `///` 등)이 포함된 경우 **합계가 자동 계산되지 않고 `-`로 표시**됩니다.

| 상황 | 합계 | 해결 방법 |
|:-----|:----:|:----------|
| 모든 값이 숫자 | 자동 계산 | - |
| 비숫자 값 포함 | `-` 표시 | `cellVariables`로 합계 직접 지정 |

**예시: 비숫자 값이 있는 경우 합계 직접 지정**
```json
{
  "data": "헤더: 항목, A, B\n행1: 10, null\n행2: 20, 30",
  "cellVariables": [
    { "rowIndex": 3, "colIndex": 1, "value": "30" },
    { "rowIndex": 3, "colIndex": 2, "value": "30" }
  ],
  "options": { "showTotal": true }
}
```

### 3. stem-leaf (줄기-잎 그림)

**동적 너비**: 줄기-잎 그림은 데이터 양에 따라 테이블 너비가 자동으로 계산됩니다. `canvasWidth`를 지정하면 해당 크기에 맞게 비율 스케일링됩니다.

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
| `cellAnimations` | `array` | X | 셀 하이라이트 (rowIndex, colIndex, duration, repeat) |
| `cellAnimationOptions` | `object` | X | 애니메이션 옵션 (rowIndex, colIndex, duration, repeat) |
| `cellVariables` | `array` | X | 셀 값 커스터마이징 (rowIndex/colIndex 기반) |

**참고**: 줄기-잎은 숫자만 파싱되므로, `?`나 빈칸 같은 특수 표현은 `cellVariables`로 지정해야 합니다.

#### data 형식 상세 (단일)

```
162 178 175 174 189 186 183 183 181 197 194 191 190 209 205
```

**결과**: 자동으로 줄기(십의 자리)와 잎(일의 자리)으로 분리

#### cellVariables 예시 (단일)

줄기-잎 그림에서는 숫자만 파싱되므로, `x`, 빈칸 등 특수 표현은 `cellVariables`로 지정해야 합니다.

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
| `"value": null` | 빈칸으로 표시 |
| `"value": "x"` | 단일 값도 지원 (기존 호환) |

**열 인덱스 (단일 모드)**: colIndex 0 = 줄기, colIndex 1 = 잎

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
    { "rowIndex": 2, "colIndex": 2, "value": [null, 2, 5] }
  ]
}
```

| 설정 | 결과 |
|:-----|:-----|
| `"value": ["x", 5]` | 남학생 잎을 `x 5`로 표시 (x는 이탤릭) |
| `"value": [null, 2, 5]` | 여학생 잎을 `  2 5`로 표시 (`null`은 빈칸) |

**열 인덱스 (비교 모드)**: colIndex 0 = 왼쪽 잎, colIndex 1 = 줄기, colIndex 2 = 오른쪽 잎

#### 특수문자 처리

| 입력 | 결과 |
|:-----|:-----|
| `"x"`, `"y"`, `"a"` 등 (소문자) | 해당 문자 표시 (이탤릭) |
| `"A"`, `"B"` 등 (대문자/숫자) | 해당 문자 표시 |
| `null` | 빈칸 (공백) |

# 셀 애니메이션 (Cell Animation)

특정 셀에 하이라이트 애니메이션을 추가합니다.

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

**범위 지정 우선순위**: 범위 지정(`rowStart/rowEnd` 또는 `colStart/colEnd`)이 있으면 기본 지정보다 우선합니다.

## cellAnimationOptions 객체

애니메이션 재생 옵션을 지정합니다.

| 속성 | 타입 | 필수 | 기본값 | 설명 |
|:-----|:-----|:----:|:------:|:-----|
| `blinkEnabled` | `boolean` | X | `false` | 블링크 효과 활성화 |

| 값 | 동작 |
|:---|:-----|
| `true` | 하이라이트가 깜빡이며 반복 (`duration`, `repeat` 적용) |
| `false` | 정적 하이라이트만 표시 (기본값, `duration`/`repeat` 무시) |

**참고**: `blinkEnabled: false`일 때는 `duration`과 `repeat` 값이 무시되고, 300ms 페이드인 후 정적 하이라이트가 유지됩니다.

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

**Tip**: 위의 "여러 셀 하이라이트" 예시와 동일한 결과를 더 간단하게 표현 가능

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

### 블링크 활성화

**기본값**: `blinkEnabled: false` (정적 하이라이트). `cellAnimationOptions` 생략 시 블링크 없이 표시됩니다.

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

**주의**: `blinkEnabled: true`가 없으면 `duration`과 `repeat`은 무시됩니다.

## 인접 셀 병합 규칙

인접한 셀들은 자동으로 병합되어 하나의 영역으로 하이라이트됩니다.

| 조건 | 결과 | 색상 |
|:-----|:-----|:-----|
| 1개 그룹 | 단일 영역 | 초록 (#89EC4E) |
| 2개+ 그룹 | 방향별 분리 | 파랑/분홍/주황 |
| 겹치는 셀 | 두 그룹 모두 표시 | 중첩 |

# 특수 문자 (Special Characters)

데이터에 특수 문자를 사용하여 특별한 렌더링 효과를 적용할 수 있습니다.

## 특수 값 표기법 요약

| 표기 | 위치 | 결과 | 예시 |
|:-----|:-----|:-----|:-----|
| `null` | data 문자열 | 빈칸 | `"A: null, 0.3"` |
| `null` | cellVariables.value (JSON) | 빈칸 | `"value": null` |
| `/` | data 문자열 | 탈리마크 1개 | `"A: /, 10"` |
| `///` | data 문자열 | 탈리마크 3개 | `"B: ///, 30"` |
| `/////` | data 문자열 | 탈리마크 5개 (正) | `"C: /////, 50"` |

**중요**: 빈칸은 `null`로 통일합니다. data 문자열에서는 문자 `null`, cellVariables에서는 JSON `null`을 사용합니다.

## null → 빈칸

`null`을 사용하면 **빈칸으로 렌더링**됩니다.

| 항목 | 설명 |
|:-----|:-----|
| **입력** | `null` |
| **출력** | 빈칸 (아무것도 표시 안 됨) |
| **용도** | 특정 셀을 빈칸으로 지정 |
| **적용 범위** | 모든 테이블 타입 |

### 사용 방법

**1. data 문자열에서:**
```
data: "A: null, 0.3"
  ↓
파서에서 null 값으로 변환
  ↓
결과: A행 첫 번째 셀이 빈칸
```

**2. cellVariables에서:**
```
"cellVariables": [{ "rowIndex": 1, "colIndex": 1, "value": null }]
  ↓
렌더러에서 빈칸 처리
  ↓
결과: 해당 셀이 빈칸
```

### 예시

```json
{
  "purpose": "table",
  "tableType": "basic-table",
  "data": "헤더: 혈액형, 남, 여\nA: null, 0.3\nB: 0.4, null"
}
```

**결과:** A행 남학생, B행 여학생 셀이 빈칸으로 표시됨

## 슬래시 (`/`) → 탈리마크 (data 문자열)

data 문자열에서 연속된 슬래시(`/`)를 입력하면 **탈리마크로 렌더링**됩니다.

| 항목 | 설명 |
|:-----|:-----|
| **입력** | `/`, `//`, `///`, `////`, `/////` 등 |
| **출력** | 탈리마크 (세로 막대 + 5번째마다 대각선) |
| **용도** | 도수를 탈리마크로 시각적 표현 |
| **적용 범위** | basic-table, category-matrix |

### 탈리마크 규칙

| 입력 | 결과 |
|:-----|:-----|
| `/` | \| (세로 막대 1개) |
| `//` | \|\| (세로 막대 2개) |
| `///` | \|\|\| (세로 막대 3개) |
| `////` | \|\|\|\| (세로 막대 4개) |
| `/////` | 正 (5개 묶음 - 대각선 추가) |
| `//////` | 正\| (5개 묶음 + 1개) |

**참고**: `1/2` 같은 분수 표기는 탈리마크로 인식하지 않습니다 (슬래시만으로 이루어진 문자열만 해당).

### 예시

```json
{
  "purpose": "table",
  "tableType": "basic-table",
  "data": "헤더: 혈액형, 도수\nA: /////, 5\nB: ///, 3\nAB: //, 2\nO: ///////, 7"
}
```

**결과:**
- A행: 탈리마크 正 (5개)
- B행: 탈리마크 ||| (3개)
- AB행: 탈리마크 || (2개)
- O행: 탈리마크 正|| (7개)

## 사용 예시

### 이원분류표에서 빈칸

데이터 값에 직접 `null`을 사용합니다.

```json
{
  "purpose": "table",
  "tableType": "basic-table",
  "data": "헤더: 혈액형, 남학생, 여학생\nA: 0.4, null\nB: null, 0.2\nAB: 0.12, 0.16"
}
```

**결과:** A행 여학생, B행 남학생 셀이 빈칸으로 표시됨

### 카테고리 행렬에서 빈칸

```json
{
  "purpose": "table",
  "tableType": "category-matrix",
  "data": "헤더: A, B, C\n전체: 100, null, 300\n부분: null, 50, null"
}
```

**결과:** 전체 B열, 부분 A/C열이 빈칸으로 표시됨

### 줄기-잎 그림에서의 주의사항

줄기-잎 그림에서는 숫자 데이터만 파싱하므로, `null` 등 비숫자 문자는 무시됩니다.

```json
{
  "purpose": "table",
  "tableType": "stem-leaf",
  "data": "162 null 178 175"
}
```

**결과:** `null`은 무시되고 `162, 178, 175`만 파싱됨

**Tip**: 줄기-잎 그림에서 특정 잎을 빈칸으로 표현하려면 `cellVariables`를 사용하세요.

## 특수 값 비교표

| 입력 | 위치 | 결과 | 용도 |
|:-----|:-----|:-----|:-----|
| `null` | data 문자열 | 빈칸 | data 문자열에서 빈칸 지정 |
| `null` | cellVariables.value (JSON) | 빈칸 | cellVariables로 빈칸 지정 |
| `/`, `//`, ... | data 문자열 | 탈리마크 | 도수를 탈리마크로 표현 |
| ` ` (공백) | data 문자열 | 파싱 구분자 | 줄기-잎 데이터 구분용 |

### 의도적 빈칸이 필요한 상황

1. **문제 풀이용 테이블**: 학생이 채워야 하는 칸
2. **미확정 데이터**: 아직 값이 정해지지 않은 경우
3. **N/A 표현**: 해당 없음을 표시

```json
{
  "purpose": "table",
  "tableType": "basic-table",
  "data": "헤더: 항목, 값1, 값2\nA: 10, 20\nB: 30, 40",
  "cellVariables": [
    { "rowIndex": 1, "colIndex": 1, "value": null },
    { "rowIndex": 2, "colIndex": 2, "value": "?" }
  ]
}
```

**결과:**
- `null` → 완전한 빈칸
- `"?"` → 물음표 표시

**참고**: `rowIndex`는 행 인덱스, `colIndex`는 열 인덱스입니다 (0부터 시작)

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
| `tableType` | `"basic-table"` | 기본 테이블 |
| `canvasWidth` | `600` | 600px |
| `canvasHeight` | `400` | 400px |
| `animation` | `true` | 애니메이션 활성화 |

**주의**: 테이블을 렌더링하려면 반드시 `"purpose": "table"`을 명시해야 합니다.

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
| `data` | **필수** | 특수 문자열 (tableType별 형식) |
| `purpose` | **필수** | 반드시 `"table"` 명시 |
| `tableType` | 선택 | 기본값 `"basic-table"` |
| 그 외 | 선택 | 모두 기본값 있음 |

# 자주 하는 실수 (Common Mistakes)

## 핵심 실수 3가지

### 1. purpose 누락 (가장 흔함)

```json
// ❌ 잘못됨 - 차트로 렌더링됨
{ "tableType": "stem-leaf", "data": "162 178 175" }

// 올바름
{ "purpose": "table", "tableType": "stem-leaf", "data": "162 178 175" }
```

### 2. cellVariables 위치 오류

모든 테이블 타입에서 `cellVariables`는 **최상위 레벨**에 배치합니다.

```json
// ❌ 잘못됨 - options 안에 넣으면 무시됨
{
  "purpose": "table",
  "tableType": "basic-table",
  "data": "헤더: 항목, 값\nA: 10",
  "options": {
    "cellVariables": [{ "rowIndex": 1, "colIndex": 1, "value": "?" }]
  }
}

// 올바름 - 최상위 레벨
{
  "purpose": "table",
  "tableType": "basic-table",
  "data": "헤더: 항목, 값\nA: 10",
  "cellVariables": [{ "rowIndex": 1, "colIndex": 1, "value": "?" }]
}
```

### 3. data 형식 오류

| tableType | data 형식 | 예시 |
|:----------|:---------|:-----|
| `basic-table` | 줄바꿈 구분 행 | `"헤더: 혈액형, 남, 여\nA: 5, 3"` |
| `category-matrix` | 줄바꿈 구분 행 | `"헤더: A, B\n행1: 1, 2"` |
| `stem-leaf` | 공백 구분 숫자 문자열 | `"162 178 175"` |

```json
// ❌ basic-table에 숫자 배열 (파싱 오류)
{ "purpose": "table", "tableType": "basic-table", "data": [62, 87, 97] }

// basic-table은 특수 문자열 형식
{ "purpose": "table", "tableType": "basic-table", "data": "헤더: 항목, 값\nA: 62\nB: 87" }
```

## 기타 실수

| 실수 | 증상 | 해결 방법 |
|:-----|:-----|:----------|
| `animation: true`만 설정 | 애니메이션 효과 없음 | `cellAnimations` 배열도 함께 설정 필요 |
| basic-table에서 `헤더:` 누락 | 파싱 오류 | 첫 줄은 반드시 `헤더: 라벨명, 열1, 열2` 형식 |
| `cellAnimations`만 설정 | 깜빡임 없이 정적 하이라이트 | 깜빡임 원하면 `cellAnimationOptions: { blinkEnabled: true }` 추가 |
| JSON 문법 오류 | 렌더링 안 됨 | trailing comma 제거, 객체 사이 comma 확인 |


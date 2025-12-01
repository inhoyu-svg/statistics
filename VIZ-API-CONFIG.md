# 📊 viz-api.js JSON 설정 가이드

도수분포표/차트를 생성하기 위한 JSON 설정 문서

---

## 📖 용어 설명

| 용어 | 영문 | 설명 |
|:-----|:-----|:-----|
| 📐 **계급** | class | 데이터를 나누는 구간 (예: 60이상~70미만) |
| 🔢 **계급 개수** | classCount | 데이터를 몇 개의 구간으로 나눌지 |
| 📏 **계급 간격** | classWidth | 각 구간의 너비 (예: 10이면 60~70, 70~80, ...) |
| 🔵 **도수** | frequency | 각 계급에 속하는 데이터의 개수 |
| 📈 **상대도수** | relativeFrequency | 전체 대비 해당 계급의 비율 (%, 0~100) |
| 📊 **히스토그램** | histogram | 도수를 막대 높이로 표현한 차트 |
| 📉 **도수다각형** | frequency polygon | 각 계급의 중앙값에 점을 찍고 선으로 연결한 그래프 |
| 📋 **도수분포표** | frequency table | 계급별 도수를 정리한 표 |

---

## ⚙️ 공통 필드

> 차트와 테이블 모두에서 사용되는 필드입니다.

| 필드 | 타입 | 기본값 | 설명 |
|:-----|:-----|:------:|:-----|
| `data` | `number[]` | **필수** | 변량 데이터 배열 |
| `purpose` | `string` | `"chart"` | `"chart"` (히스토그램) 또는 `"table"` (도수분포표) |
| `classCount` | `number` | `5` | 계급 개수 |
| `classWidth` | `number` | 자동 | 계급 간격 (미지정 시 `Math.ceil(범위 / classCount)`) |
| `animation` | `boolean` \| `object` | `true` | 애니메이션 활성화 |

### 💾 data 입력 형식

배열 형식만 지원합니다:

```json
{
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75]
}
```

---

# 📊 차트 (Histogram)

> 히스토그램과 도수다각형을 Canvas에 렌더링합니다.

## 🎨 차트 구성 요소

차트는 다음 두 가지 요소로 구성됩니다:

### 1️⃣ 히스토그램 (Histogram)

| 항목 | 설명 |
|:-----|:-----|
| 📊 표현 방식 | 각 계급의 도수를 **막대 높이**로 표현 |
| 🎨 스타일 | 그라데이션 색상 막대 |
| ➡️ X축 | 계급 구간 |
| ⬆️ Y축 | 도수 또는 상대도수 |

### 2️⃣ 도수다각형 (Frequency Polygon)

| 항목 | 설명 |
|:-----|:-----|
| 📈 표현 방식 | 각 계급의 **중앙값**에 점을 찍고 선으로 연결 |
| 🔵 점 | 단색 원 |
| 📉 선 | 그라데이션 색상 |
| 📍 위치 | 히스토그램 위에 오버레이 |

> 💡 **Tip**: `options.showHistogram`과 `options.showPolygon`으로 표시 여부를 제어할 수 있습니다.

---

## 🔧 차트 전용 필드

| 필드 | 타입 | 기본값 | 설명 |
|:-----|:-----|:------:|:-----|
| `canvasSize` | `number` | `700` | 캔버스 크기 (정사각형) |
| `options.showHistogram` | `boolean` | `true` | 히스토그램 표시 |
| `options.showPolygon` | `boolean` | `true` | 도수다각형 표시 |
| `options.dataType` | `string` | `"relativeFrequency"` | Y축 데이터 타입 |
| `options.axisLabels` | `object` | `null` | 축 라벨 커스터마이징 |

### 📊 options.dataType 값

| 값 | 설명 | Y축 표시 예시 |
|:---|:-----|:-------------|
| `"relativeFrequency"` | 상대도수 (기본값) | 0, 10, 20, 30 ... (%) |
| `"frequency"` | 도수 | 0, 1, 2, 3 ... (개수) |

### 🏷️ options.axisLabels 구조

```json
{
  "options": {
    "axisLabels": {
      "xAxis": "점수",
      "yAxis": "비율"
    }
  }
}
```

| 속성 | 설명 | 결과 |
|:-----|:-----|:-----|
| `xAxis` | X축 끝 라벨 | "(점수)" |
| `yAxis` | Y축 끝 라벨 | "(비율)" |

---

## 📝 차트 예시

### ✨ 최소 설정

> 데이터만 입력하면 기본값으로 히스토그램이 생성됩니다.

```json
{
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75]
}
```

| 항목 | 값 |
|:-----|:---|
| 📐 캔버스 | 700×700px (정사각형) |
| 🔢 계급 개수 | 5개 |
| ⬆️ Y축 | 상대도수 (%) |
| 🎬 애니메이션 | 활성화 |

---

### 🔢 계급 개수 지정

> `classCount` → 데이터를 몇 개 구간으로 나눌지 지정

```json
{
  "purpose": "chart",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "classCount": 4
}
```

✅ **결과**: 4개 계급으로 나뉜 히스토그램. 계급 간격은 자동 계산.

---

### 📏 계급 간격 지정

> `classWidth` → 각 계급의 너비를 고정

```json
{
  "purpose": "chart",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "classCount": 5,
  "classWidth": 10
}
```

✅ **결과**: 0~10, 10~20, 20~30, ... 형태의 계급 생성

---

### 📐 캔버스 크기 지정

> `canvasSize` → 차트 크기 변경 (정사각형)

```json
{
  "purpose": "chart",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "canvasSize": 500
}
```

✅ **결과**: 500×500px 크기의 차트 생성

---

### 🔵 도수 기준 Y축

> `dataType: "frequency"` → Y축을 상대도수 대신 도수(개수)로 표시

```json
{
  "purpose": "chart",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "options": {
    "dataType": "frequency"
  }
}
```

✅ **결과**: Y축이 0, 1, 2, 3, ... (개수) 형태로 표시됨

---

### 🏷️ 커스텀 축 라벨

> `axisLabels` → X축/Y축 끝에 표시될 라벨 변경

```json
{
  "purpose": "chart",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "options": {
    "axisLabels": {
      "xAxis": "점수",
      "yAxis": "비율"
    }
  }
}
```

✅ **결과**: 축 끝에 "(점수)", "(비율)" 라벨이 표시됨

---

### 📊 히스토그램만 표시

> `showPolygon: false` → 도수다각형 숨기고 히스토그램만 표시

```json
{
  "purpose": "chart",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "options": {
    "showPolygon": false
  }
}
```

✅ **결과**: 막대 그래프만 표시됨 (점+선 없음)

---

### 📈 도수다각형만 표시

> `showHistogram: false` → 히스토그램 숨기고 도수다각형만 표시

```json
{
  "purpose": "chart",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "options": {
    "showHistogram": false
  }
}
```

✅ **결과**: 점+선 그래프만 표시됨 (막대 없음)

---

### ⏸️ 애니메이션 비활성화

> `animation: false` → 막대가 즉시 나타남

```json
{
  "purpose": "chart",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "animation": false
}
```

✅ **결과**: 차트가 애니메이션 없이 즉시 렌더링됨

---

### 🎯 차트 전체 옵션 예시

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
    "dataType": "relativeFrequency",
    "axisLabels": {
      "xAxis": "계급",
      "yAxis": "상대도수"
    }
  }
}
```

---

# 📋 테이블 (도수분포표)

> 계급, 도수, 상대도수 등을 표 형태로 Canvas에 렌더링합니다.

## 🔧 테이블 전용 필드

| 필드 | 타입 | 기본값 | 설명 |
|:-----|:-----|:------:|:-----|
| `canvasWidth` | `number` | `600` | 캔버스 너비 (px) |
| `canvasHeight` | `number` | `400` | 캔버스 높이 (px) |
| `options.tableConfig` | `object` | `null` | 테이블 상세 설정 |

### 📋 테이블 표시 컬럼

기본적으로 다음 컬럼이 표시됩니다:

| 컬럼 | 설명 | 예시 |
|:-----|:-----|:-----|
| 📐 계급 | 구간 범위 | 60이상~70미만 |
| 🔵 도수 | 해당 계급의 데이터 개수 | 3 |
| 📈 상대도수(%) | 전체 대비 비율 | 30% |

---

## 📝 테이블 예시

### ✨ 최소 설정

> `purpose: "table"` → 도수분포표 생성

```json
{
  "purpose": "table",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75]
}
```

| 항목 | 값 |
|:-----|:---|
| 📐 캔버스 | 600×400px |
| 🔢 계급 개수 | 5개 |
| 📋 컬럼 | 계급, 도수, 상대도수 등 |

---

### 📐 테이블 크기 지정

> `canvasWidth`, `canvasHeight` → 테이블 캔버스 크기 변경

```json
{
  "purpose": "table",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "canvasWidth": 700,
  "canvasHeight": 500
}
```

✅ **결과**: 700×500px 크기의 도수분포표 생성

---

### 🔧 계급 설정과 함께 사용

```json
{
  "purpose": "table",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "classCount": 4,
  "classWidth": 10,
  "canvasWidth": 600,
  "canvasHeight": 350
}
```

✅ **결과**: 4개 계급(간격 10)의 도수분포표

---

### ⏸️ 애니메이션 비활성화

```json
{
  "purpose": "table",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "animation": false
}
```

✅ **결과**: 테이블이 애니메이션 없이 즉시 렌더링됨

---

# 📌 기본값 요약

## 📊 차트 기본값

| 필드 | 기본값 |
|:-----|:------:|
| `purpose` | `"chart"` |
| `classCount` | `5` |
| `classWidth` | 자동 계산 |
| `canvasSize` | `700` |
| `animation` | `true` |
| `options.showHistogram` | `true` |
| `options.showPolygon` | `true` |
| `options.dataType` | `"relativeFrequency"` |
| `options.axisLabels` | `null` |

## 📋 테이블 기본값

| 필드 | 기본값 |
|:-----|:------:|
| `purpose` | `"chart"` ⚠️ |
| `classCount` | `5` |
| `classWidth` | 자동 계산 |
| `canvasWidth` | `600` |
| `canvasHeight` | `400` |
| `animation` | `true` |

> ⚠️ 테이블을 렌더링하려면 `purpose: "table"`을 명시해야 합니다.

---

# 🌐 HTML에서 사용 예시

## 📊 차트 렌더링

```html
<div class="visualization-container"
     id="vizContainer1"
     data-viz-mode="chart"
     data-viz-type="graph_library"
     data-viz-config='{
  "purpose": "chart",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "classCount": 5,
  "canvasSize": 600
}'>
</div>
```

## 📋 테이블 렌더링

```html
<div class="visualization-container"
     id="vizContainer2"
     data-viz-mode="table"
     data-viz-type="graph_library"
     data-viz-config='{
  "purpose": "table",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "classCount": 5,
  "classWidth": 10
}'>
</div>
```

## 🏷️ HTML 속성 설명

| 속성 | 설명 |
|:-----|:-----|
| `data-viz-mode` | `"chart"` \| `"table"` \| `"both"` |
| `data-viz-type` | `"graph_library"` (고정) |
| `data-viz-config` | JSON 설정 문자열 |

> ⚠️ **주의사항**
> - HTML 속성값은 작은따옴표(`'`)로 감싸기
> - JSON 내부는 큰따옴표(`"`) 사용
> - `data-viz-mode`는 렌더러 선택용
> - `purpose`는 차트/테이블 결정용 (별개의 설정)

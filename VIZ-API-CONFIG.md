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

# 📋 테이블

> 다양한 테이블 형식을 Canvas에 렌더링합니다.

## 🔧 테이블 전용 필드

| 필드 | 타입 | 기본값 | 설명 |
|:-----|:-----|:------:|:-----|
| `tableType` | `string` | `"frequency"` | 테이블 타입 (아래 참조) |
| `canvasWidth` | `number` | `600` | 캔버스 너비 (px) |
| `canvasHeight` | `number` | `400` | 캔버스 높이 (px) |
| `options.tableConfig` | `object` | `null` | 테이블 상세 설정 (아래 참조) |

---

## 📊 테이블 타입 (tableType)

| 값 | 이름 | 설명 |
|:---|:-----|:-----|
| `"frequency"` | 도수분포표 | 숫자 데이터를 계급별로 분류 (기본값) |
| `"category-matrix"` | 카테고리 행렬 | 카테고리별 데이터 비교 |
| `"cross-table"` | 이원 분류표 | 두 변수의 교차 분류 |
| `"stem-leaf"` | 줄기-잎 그림 | 데이터 분포를 줄기와 잎으로 시각화 |

---

## 📝 타입별 data 형식

### 1️⃣ frequency (도수분포표)

> 숫자 배열 형식

```json
{
  "purpose": "table",
  "tableType": "frequency",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "classCount": 5
}
```

### 2️⃣ category-matrix (카테고리 행렬)

> `헤더: 값들` + `라벨: 값들` 형식

```json
{
  "purpose": "table",
  "tableType": "category-matrix",
  "data": "헤더: A, B, C, D, E\n전체 학생 수 (명): 200, 250, 300, 350, 400\nO형인 학생 수 (명): 50, 60, 70, 80, 90"
}
```

| 행 | 구분 |
|:---|:-----|
| 1행 | `헤더:` 뒤에 열 이름들 |
| 2행~ | `라벨:` 뒤에 값들 |

### 3️⃣ cross-table (이원 분류표)

> `헤더: 행라벨명, 열이름들` + `행이름: 값들` 형식

```json
{
  "purpose": "table",
  "tableType": "cross-table",
  "data": "헤더: 혈액형, 남학생, 여학생\nA: 0.4, 0.4\nB: 0.22, 0.2\nAB: 0.12, 0.16\nO: 0.26, 0.24"
}
```

| 행 | 구분 |
|:---|:-----|
| 1행 | `헤더:` 뒤에 `행라벨명, 열이름1, 열이름2, ...` |
| 2행~ | `행이름:` 뒤에 각 열의 값들 |

#### 커스텀 병합 헤더

첫 줄에 `헤더:`가 아닌 일반 텍스트를 넣으면 병합 헤더로 사용됩니다.

```json
{
  "purpose": "table",
  "tableType": "cross-table",
  "data": "비율\n헤더: 혈액형, 남학생, 여학생\nA: 0.4, 0.4\nB: 0.22, 0.2"
}
```

✅ **결과**: 기본값 "상대도수" 대신 "비율"이 병합 헤더에 표시됨

#### 이원 분류표 옵션 (options.crossTable)

| 옵션 | 타입 | 기본값 | 설명 |
|:-----|:-----|:------:|:-----|
| `showTotal` | `boolean` | `true` | 합계 행 표시 |
| `showMergedHeader` | `boolean` | `true` | 병합 헤더 표시 |

```json
{
  "purpose": "table",
  "tableType": "cross-table",
  "data": "헤더: 혈액형, 남학생, 여학생\nA: 0.4, 0.4\nB: 0.22, 0.2",
  "options": {
    "crossTable": {
      "showTotal": false,
      "showMergedHeader": true
    }
  }
}
```

✅ **결과**: 합계 행이 숨겨진 이원 분류표

### 4️⃣ stem-leaf (줄기-잎 그림)

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

---

## 📋 도수분포표 컬럼 설정 (tableConfig)

> `tableType: "frequency"`인 경우에만 적용됩니다.

`options.tableConfig` 객체로 테이블의 컬럼을 세밀하게 제어할 수 있습니다.

### 🔢 사용 가능한 컬럼 (7개)

| 인덱스 | 컬럼명 | 설명 | 기본 표시 |
|:------:|:-------|:-----|:--------:|
| 0 | 📐 계급 | 구간 범위 (예: 60~70) | ✅ 표시 |
| 1 | 📊 계급값 | 구간 중앙값 (예: 65) | ❌ 숨김 |
| 2 | 📝 탈리 | 정(正)자 표시 | ❌ 숨김 |
| 3 | 🔵 도수 | 데이터 개수 | ✅ 표시 |
| 4 | 📈 상대도수(%) | 전체 대비 비율 | ✅ 표시 |
| 5 | 📊 누적도수 | 누적 데이터 개수 | ❌ 숨김 |
| 6 | 📈 누적상대도수(%) | 누적 비율 | ❌ 숨김 |

### ⚙️ tableConfig 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|:-----|:-----|:------:|:-----|
| `visibleColumns` | `boolean[]` | `[true,false,false,true,true,false,false]` | 7개 컬럼 표시 여부 |
| `columnOrder` | `number[]` | `[0,1,2,3,4,5,6]` | 컬럼 표시 순서 |
| `labels` | `object` | 기본 라벨 | 컬럼 헤더 텍스트 (부분 지정 가능) |
| `showSuperscript` | `boolean` | `true` | 첫 행에 "이상/미만" 표시 |
| `showSummaryRow` | `boolean` | `true` | 합계 행 표시 |
| `cellVariables` | `array` | `null` | 셀 값 커스터마이징 (아래 참조) |

### 🏷️ labels 객체 구조

```json
{
  "labels": {
    "class": "계급",
    "midpoint": "계급값",
    "tally": "탈리",
    "frequency": "도수",
    "relativeFrequency": "상대도수(%)",
    "cumulativeFrequency": "누적도수",
    "cumulativeRelativeFrequency": "누적상대도수(%)"
  }
}
```

> 💡 **Tip**: 일부만 지정해도 됩니다. 지정하지 않은 라벨은 기본값이 유지됩니다.

```json
{
  "labels": {
    "class": "키(cm)",
    "frequency": "학생 수(명)"
  }
}
```

✅ **결과**: `class`와 `frequency`만 커스텀, 나머지는 "상대도수(%)" 등 기본값 유지

---

### 📝 tableConfig 예시

#### 1️⃣ 모든 컬럼 표시

```json
{
  "purpose": "table",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "options": {
    "tableConfig": {
      "visibleColumns": [true, true, true, true, true, true, true]
    }
  }
}
```

✅ **결과**: 계급, 계급값, 탈리, 도수, 상대도수, 누적도수, 누적상대도수 모두 표시

---

#### 2️⃣ 계급 + 도수만 표시

```json
{
  "purpose": "table",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "options": {
    "tableConfig": {
      "visibleColumns": [true, false, false, true, false, false, false]
    }
  }
}
```

✅ **결과**: 계급과 도수 컬럼만 표시 (간단한 도수분포표)

---

#### 3️⃣ 탈리(정자) 표시

```json
{
  "purpose": "table",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "options": {
    "tableConfig": {
      "visibleColumns": [true, false, true, true, true, false, false]
    }
  }
}
```

✅ **결과**: 탈리(정자 표시) 컬럼 추가 - 도수를 시각적으로 표현

---

#### 4️⃣ 누적도수 포함

```json
{
  "purpose": "table",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "options": {
    "tableConfig": {
      "visibleColumns": [true, false, false, true, true, true, true]
    }
  }
}
```

✅ **결과**: 누적도수와 누적상대도수 컬럼 추가

---

#### 5️⃣ 컬럼 라벨 커스터마이징

> `visibleColumns`는 기본값이므로 생략 가능

```json
{
  "purpose": "table",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "options": {
    "tableConfig": {
      "labels": {
        "class": "점수 구간",
        "frequency": "학생 수",
        "relativeFrequency": "비율(%)"
      }
    }
  }
}
```

✅ **결과**: 헤더가 "점수 구간", "학생 수", "비율(%)"로 표시됨

---

#### 6️⃣ 상첨자(이상/미만) 숨기기

```json
{
  "purpose": "table",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "options": {
    "tableConfig": {
      "showSuperscript": false
    }
  }
}
```

✅ **결과**: 첫 행에 "60이상~70미만" 대신 "60~70"으로 표시

---

#### 7️⃣ 컬럼 순서 변경

```json
{
  "purpose": "table",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "options": {
    "tableConfig": {
      "visibleColumns": [true, false, false, true, true, false, false],
      "columnOrder": [3, 0, 4]
    }
  }
}
```

✅ **결과**: 도수 → 계급 → 상대도수 순서로 표시

---

#### 8️⃣ 합계 행 숨기기

```json
{
  "purpose": "table",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "options": {
    "tableConfig": {
      "showSummaryRow": false
    }
  }
}
```

✅ **결과**: 테이블 하단의 "합계" 행이 숨겨짐

---

#### 9️⃣ 셀 값 커스터마이징 (cellVariables)

> 특정 셀의 값을 원하는 텍스트로 변경

```json
{
  "purpose": "table",
  "data": [62, 87, 97, 73, 59, 85, 80, 79, 65, 75],
  "options": {
    "tableConfig": {
      "cellVariables": [
        { "class": "60~70", "column": "frequency", "value": "A" },
        { "class": "70~80", "column": "frequency", "value": "B" }
      ]
    }
  }
}
```

✅ **결과**: 60~70 계급의 도수가 "A"로, 70~80 계급의 도수가 "B"로 표시됨

**cellVariables 배열 항목 구조:**

| 키 | 설명 | 예시 |
|:---|:-----|:-----|
| `class` | 계급 범위 (시작~끝) | `"60~70"` |
| `column` | 컬럼명 | `"frequency"`, `"relativeFrequency"` 등 |
| `value` | 표시할 값 | `"A"`, `"x"`, `"?"` 등 |

---

### 📌 visibleColumns 기본값 설명

```
기본값: [true, false, false, true, true, false, false]

인덱스:  0      1      2      3     4      5      6
컬럼:   계급  계급값  탈리   도수  상대도수 누적도수 누적상대도수
표시:    ✅     ❌     ❌     ✅     ✅      ❌       ❌
```

> 💡 **Tip**: 필요한 컬럼만 `true`로 설정하면 테이블이 간결해집니다.

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


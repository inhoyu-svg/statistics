# 리팩토링 계획

> 작성일: 2025-12-05
> 수정일: 2025-12-08
> 상태: ✅ **전체 완료**

---

## 1. 입력 검증 강화 ✅ 완료

### 현재 문제
- 검증 로직이 viz-api.js, processor.js, 각 파서에 분산
- 에러 메시지 형식 일관성 없음
- 어디서 실패했는지 추적 어려움

### 목표
- 중앙 집중 Validator 클래스 생성
- 표준화된 에러 메시지 형식
- 명확한 에러 위치 표시

### 구현 계획
```
js/utils/validator.js (기존 131줄 → 확장)

class ConfigValidator {
  static validate(config) {
    const errors = [];

    // 필수 필드 검증
    if (!config.data) errors.push({ field: 'data', message: '필수 필드입니다' });

    // 타입 검증
    if (config.classCount && !Number.isInteger(config.classCount)) {
      errors.push({ field: 'classCount', message: '정수여야 합니다' });
    }

    // 범위 검증
    if (config.classCount < 3 || config.classCount > 20) {
      errors.push({ field: 'classCount', message: '3~20 사이여야 합니다' });
    }

    return { valid: errors.length === 0, errors };
  }
}
```

### 수정 파일
- `js/utils/validator.js` - Validator 클래스 확장
- `js/viz-api.js` - 검증 로직을 Validator 호출로 대체
- `js/core/processor.js` - 검증 로직 제거 (Validator로 이동)

### 예상 효과
- ⭐⭐⭐ 높음
- 버그 감소, 디버깅 시간 단축
- JSON Schema와 연동 가능

### 테스트 계획
- [ ] 필수 필드 누락 시 적절한 에러 반환 확인
- [ ] 잘못된 타입 입력 시 에러 메시지 검증
- [ ] 범위 초과 값 (classCount < 3, > 20) 테스트
- [ ] 복합 에러 (여러 필드 동시 오류) 시 모든 에러 수집 확인
- [ ] 기존 viz-api.js, processor.js 호출부 정상 동작 확인

---

## 2. cellVariables 통일 ✅ 선택적

### 현재 문제
- 줄기-잎: `{ rowIndex, colIndex, value }`
- 도수분포표: `{ class, column, value }`
- 사용자가 타입별로 다른 문법 학습 필요

### 목표
- rowIndex/colIndex 방식으로 통일
- 기존 class/column 방식은 deprecated 처리 후 호환성 유지

### 구현 계획
```javascript
// 1. 공통 처리 함수
function applyCellVariables(data, cellVariables) {
  cellVariables.forEach(cv => {
    if (cv.rowIndex !== undefined && cv.colIndex !== undefined) {
      // 새 방식
      data[cv.rowIndex][cv.colIndex] = cv.value;
    } else if (cv.class && cv.column) {
      // 레거시 방식 (deprecated 경고)
      console.warn('class/column 방식은 deprecated됩니다. rowIndex/colIndex를 사용하세요.');
      // 변환 로직...
    }
  });
}

// 2. 도수분포표에서 class → rowIndex 변환 헬퍼
function classToRowIndex(classes, className) {
  return classes.findIndex(c => `${c.min}~${c.max}` === className);
}
```

### 수정 파일
- `js/viz-api.js` - applyCellVariables 공통화
- `js/renderers/table.js` - 레거시 변환 로직
- `md/VIZ-API-CONFIG.md` - 문서 업데이트

### 예상 효과
- ⭐⭐ 중간
- API 일관성 향상
- 주의: 기존 사용자 코드 호환성 고려 필요

### 테스트 계획
- [ ] 새 방식 (rowIndex/colIndex) 정상 동작 확인
- [ ] 레거시 방식 (class/column) 호환성 유지 확인
- [ ] deprecated 경고 메시지 출력 확인
- [ ] classToRowIndex 헬퍼 정확성 테스트
- [ ] 줄기-잎, 도수분포표 양쪽에서 동일 동작 확인

---

## 3. 파서 출력 통일 ✅ 완료

### 현재 문제
```javascript
// 줄기-잎
{ isSingleMode, stems, minStem, maxStem }

// 카테고리
{ headers, rows }

// 이원분류표
{ rowLabelColumn, columnHeaders, rows, showTotal }
```
- 타입별 완전히 다른 구조
- 렌더러에서 타입별 분기 처리 필요

### 목표
```typescript
interface ParsedTableData {
  type: TableType;
  headers: string[];
  rows: Array<{
    label: string;
    cells: Array<{ value: any; metadata?: any }>;
  }>;
  metadata: {
    // 타입별 추가 정보
    isSingleMode?: boolean;  // stem-leaf
    showTotal?: boolean;     // cross-table
  };
}
```

### 구현 계획
1. 공통 인터페이스 정의
2. 각 파서 출력을 공통 형식으로 변환하는 어댑터 추가
3. 렌더러에서 공통 형식 사용

### 수정 파일
- `js/core/parsers/*.js` - 모든 파서
- `js/renderers/table/factories/*.js` - 모든 팩토리
- `js/renderers/table.js` - 렌더링 로직

### 예상 효과
- ⭐⭐ 중간
- 확장성 향상 (새 테이블 타입 추가 용이)
- 주의: 대규모 변경, 테스트 필수

### 테스트 계획
- [ ] 각 파서(줄기-잎, 카테고리, 이원분류표)의 공통 인터페이스 출력 확인
- [ ] 기존 렌더러와의 호환성 테스트
- [ ] metadata 필드 정확성 검증
- [ ] 새 테이블 타입 추가 시나리오 테스트
- [ ] 전체 렌더링 파이프라인 통합 테스트

---

## 4. cellVariables 위치 통일 🔜 향후

### 현재 문제
- `frequency` 테이블: `options.tableConfig.cellVariables`
- 기타 테이블: 최상위 `cellVariables`
- LLM이 위치 혼동으로 잘못된 JSON 생성

### 목표
모든 tableType에서 두 위치 모두 동작하도록 통일

### 구현 계획

**파일**: `js/viz-api.js`

**변경 1**: frequency에서 최상위 cellVariables도 지원 (라인 687 근처)
```javascript
// Before
if (tableConfig?.cellVariables && Array.isArray(tableConfig.cellVariables)) {
  applyCellVariables(classes, tableConfig.cellVariables, tableRenderer.tableId);
}

// After
const cellVars = config.cellVariables || tableConfig?.cellVariables;
if (cellVars && Array.isArray(cellVars)) {
  applyCellVariables(classes, cellVars, tableRenderer.tableId);
}
```

**변경 2**: 기타 테이블에서 options.tableConfig.cellVariables도 지원 (라인 748 근처)
```javascript
// Before
if (config.cellVariables && Array.isArray(config.cellVariables)) {
  finalParseResult = applyCellVariablesGeneric(config.cellVariables, parseResult, tableType);
}

// After
const cellVars = config.cellVariables || tableConfig?.cellVariables;
if (cellVars && Array.isArray(cellVars)) {
  finalParseResult = applyCellVariablesGeneric(cellVars, parseResult, tableType);
}
```

### 테스트 계획
- [ ] frequency + 최상위 cellVariables
- [ ] frequency + options.tableConfig.cellVariables
- [ ] stem-leaf + 양쪽 위치
- [ ] cross-table + 양쪽 위치
- [ ] category-matrix + 양쪽 위치

### 예상 효과
- ⭐⭐ 중간
- LLM 오류 감소
- API 일관성 향상

---

## 우선순위 요약

| 순서 | 작업 | 효과 | 작업량 | 비고 |
|------|------|------|--------|------|
| 1 | 입력 검증 강화 | ⭐⭐⭐ | 중간 | ✅ 완료 |
| 2 | cellVariables 형식 통일 | ⭐⭐ | 작음 | ✅ 완료 |
| 3 | 파서 출력 통일 | ⭐⭐ | 큼 | ✅ 완료 |
| 4 | cellVariables 위치 통일 | ⭐⭐ | 작음 | 🔜 향후 |
| 5 | tableType 통합 | ⭐⭐⭐ | 큼 | 🔜 향후 |

---

## 참고 파일
- `md/SCHEMA.md` - 현재 데이터 구조 정의
- `schema/viz-api.schema.json` - JSON Schema
- `js/utils/validator.js` - 검증 로직 (ConfigValidator 클래스)
- `js/core/parsers/ParserAdapter.js` - 파서 출력 통일 어댑터

---

## 롤백 계획

각 리팩토링 단계별로 문제 발생 시 복구 절차입니다.

### 공통 원칙
1. 각 리팩토링은 별도 브랜치에서 진행
2. 작업 전 태그 생성: `git tag pre-refactor-{n}`
3. PR 단위로 머지, 문제 시 revert commit 생성

### 단계별 롤백

| 단계 | 롤백 명령 | 영향 범위 |
|------|-----------|-----------|
| 1. 입력 검증 | `git revert <commit>` | validator.js, viz-api.js, processor.js |
| 2. cellVariables | `git revert <commit>` | viz-api.js, table.js, 문서 |
| 3. 파서 통일 | `git revert <commit>` | parsers/*, factories/*, table.js |

### 긴급 롤백 시
```bash
# 특정 태그로 복구
git checkout pre-refactor-1
git checkout -b hotfix/rollback

# 또는 특정 커밋 revert
git revert --no-commit <start>..<end>
git commit -m "Revert: 리팩토링 롤백"
```

---

## 마이그레이션 가이드

외부 사용자를 위한 변경 사항 안내입니다.

### v2.0 변경 사항 (예정)

#### 1. 에러 메시지 형식 변경

**Before:**
```javascript
// 다양한 형식의 에러 메시지
"data is required"
"classCount must be integer"
```

**After:**
```javascript
// 표준화된 에러 객체
{
  valid: false,
  errors: [
    { field: 'data', code: 'REQUIRED', message: '필수 필드입니다' },
    { field: 'classCount', code: 'TYPE_ERROR', message: '정수여야 합니다' }
  ]
}
```

#### 2. cellVariables 문법 변경

**Before (deprecated, v3.0에서 제거 예정):**
```javascript
cellVariables: [
  { class: "10~20", column: "frequency", value: 5 }
]
```

**After (권장):**
```javascript
cellVariables: [
  { rowIndex: 0, colIndex: 1, value: 5 }
]
```

> ⚠️ 기존 `class/column` 방식은 v2.x에서 deprecated 경고와 함께 동작합니다.
> v3.0에서 완전히 제거될 예정이므로, 새 방식으로 마이그레이션해주세요.

#### 3. 파서 출력 구조 변경 (v3.0 예정)

대규모 변경으로 별도 마이그레이션 문서 제공 예정입니다.

### 마이그레이션 체크리스트

- [ ] 에러 핸들링 코드에서 새 에러 형식 대응
- [ ] cellVariables 사용 시 rowIndex/colIndex 방식으로 변경
- [ ] deprecated 경고 로그 확인 및 수정
- [ ] 전체 기능 테스트 수행

---

## 변경 이력

| 날짜 | 변경 내용 |
|------|-----------|
| 2025-12-05 | 초안 작성 |
| 2025-12-08 | 테스트 계획, 롤백 계획, 마이그레이션 가이드 추가 |
| 2025-12-08 | ✅ 리팩토링 1: ConfigValidator 클래스 구현 완료 |
| 2025-12-08 | ✅ 리팩토링 2: cellVariables rowIndex/colIndex 통일 완료 |
| 2025-12-08 | ✅ 리팩토링 3: ParserAdapter 패턴 구현 완료 |
| 2025-12-08 | 🔜 리팩토링 4: cellVariables 위치 통일 계획 추가 (향후 작업) |
| 2025-12-08 | ✅ JSON Schema 개선: 조건부 검증, description/examples 추가 (421줄 → 713줄) |
| 2025-12-08 | 🔜 리팩토링 5: tableType 통합 계획 추가 (frequency 제거, cross-table → basic-table) |

---

## 데이터 구조 위험 요소 분석

> LLM/AI가 viz-api JSON 생성 시 주의해야 할 구조적 위험 요소

### 🔴 높음 (오류 가능성 높음)

| # | 위험 요소 | 문제 | 영향 |
|:-:|:---------|:-----|:-----|
| 1 | `data` 타입 다형성 | `number[]` 또는 `string` - tableType별로 다른 형식 필요 | 잘못된 형식 생성 |
| 2 | `purpose` 누락 시 기본값 | `"chart"`가 기본 → 테이블 원하면 반드시 명시 필요 | 테이블 의도했는데 차트 생성 |
| 3 | `tableType` 기본값 혼란 | `"frequency"` 기본 → 다른 타입 원하면 반드시 명시 | 잘못된 테이블 타입 |
| 4 | `options` 깊은 중첩 | `options.tableConfig.cellVariables` 등 3단계 중첩 | 경로 오류 빈번 |

### 🟡 중간 (혼동 가능)

| # | 위험 요소 | 문제 |
|:-:|:---------|:-----|
| 5 | 유사 필드명 | `cellAnimations` vs `cellVariables` vs `cellAnimationOptions` |
| 6 | `animation` 다형성 | `boolean` 또는 `{ enabled: boolean }` 둘 다 허용 |
| 7 | 계급 설정 3종 | `classCount` vs `classWidth` vs `classRange` 중 어떤 걸 써야 하는지 |
| 8 | 인덱스 기반 참조 | `visibleColumns[0]`이 뭔지, `columnOrder`가 뭔지 암기 필요 |

### 🟢 낮음 (개선 권장)

| # | 위험 요소 | 문제 |
|:-:|:---------|:-----|
| 9 | `corruption.cells` 문법 | `"0-0:2-3"` 특수 문법 이해 어려움 |
| 10 | Preset vs Custom | `histogramColorPreset` vs `histogramColor` 우선순위 불명확 |

### 향후 개선 방향

- **#1~4 (높음)**: 리팩토링 4번(cellVariables 위치 통일)으로 #4 해결 예정
- **#5~8 (중간)**: 문서 개선으로 대응 (VIZ-API-CONFIG.md Common Mistakes 섹션)
- **#9~10 (낮음)**: 필요시 개선

---

## 5. tableType 통합 리팩토링 🔜 향후

> 작성일: 2025-12-08

### 목표
- `frequency` tableType을 제거하고 `cross-table`을 `basic-table`로 이름 변경
- chart에서만 `number[]` 데이터 처리 유지
- tableType 3개로 단순화: **basic-table**, **category-matrix**, **stem-leaf**

### 변경 전후 비교

| 변경 전 | 변경 후 | data 형식 | 헤더 위치 |
|--------|--------|----------|----------|
| frequency | ❌ 제거 | number[] → chart 전용 | - |
| cross-table | **basic-table** | string | 위쪽 (top) |
| category-matrix | category-matrix | string | 왼쪽 (left) |
| stem-leaf | stem-leaf | string | - |

### 하위 호환성 처리

#### cross-table → basic-table (별칭)
```javascript
// viz-api.js 초기 처리
if (tableType === 'cross-table') {
  console.warn('[viz-api] tableType "cross-table" is deprecated. Use "basic-table" instead.');
  tableType = 'basic-table';
}
```

#### frequency → chart 자동 전환
```javascript
// viz-api.js 초기 처리
if (purpose === 'table' && tableType === 'frequency') {
  console.warn('[viz-api] tableType "frequency" for tables is deprecated. Rendering as histogram chart.');
  purpose = 'chart';
}
```

### 제거되는 옵션들

**테이블에서 제거 (chart에서는 유지):**
- `classCount`, `classWidth`, `classRange` - 계급 설정

**완전 제거 (frequency 테이블 전용):**
- `visibleColumns` - 컬럼 표시/숨김
- `columnOrder` - 컬럼 순서
- `showSuperscript` - "이상/미만" 표시

### 수정 파일

| 파일 | 변경 유형 |
|------|----------|
| `js/config.js` | TABLE_TYPES 수정 |
| `js/viz-api.js` | frequency 로직 제거, cross→basic |
| `js/renderers/table.js` | frequency 로직 제거, cross→basic |
| `js/renderers/table/factories/index.js` | 라우터 수정 |
| `js/renderers/table/factories/CrossTableFactory.js` | 파일명/클래스명 변경 |
| `js/renderers/table/TableCellRenderer.js` | 메서드명 변경 |
| `js/core/parsers/index.js` | 파서 라우터 수정 |
| `js/core/parsers/CrossTableParser.js` | 파일명/클래스명 변경 |
| `js/utils/validator.js` | validation 수정 |
| `md/VIZ-API-CONFIG.md` | 문서 업데이트 |
| `md/SCHEMA.md` | 문서 업데이트 |
| `schema/viz-api.schema.json` | 스키마 업데이트 |

### 추가 고려사항

#### 1. cellVariables 처리
| 구분 | frequency (제거) | 기타 테이블 |
|------|-----------------|-----------|
| **위치** | `options.tableConfig.cellVariables` | `config.cellVariables` (최상위) |
| **처리** | tableStore 기반 | 파싱 데이터 직접 수정 |

**결정:** frequency 제거 후 `config.cellVariables` (최상위)로 통일

#### 2. options 키 형식
```javascript
// 현재
options['cross-table']    // 하이픈 + 대괄호
options.crossTable        // camelCase (폴백)

// 변경 후
options.basicTable        // camelCase 통일
options['basic-table']    // 폴백 지원
```

#### 3. tableStore 정리
**frequency 제거 시 불필요해지는 상태:**
- `visibleColumns`, `columnOrder`, `columnAlignment`, `cellVariables`, `labels`

**유지할 상태:**
- `summaryRowVisible` - basic-table에서 계속 사용
- `mergedHeaderVisible` - basic-table에서 계속 사용

#### 4. 동적 너비 계산
| Factory | 현재 방식 |
|---------|----------|
| BaseTableFactory | `calculateDynamicWidths()` - 텍스트 측정 |
| CrossTableFactory | `_calculateColumnWidths()` - 균등 분배 |
| CategoryMatrixFactory | `_calculateColumnWidths()` - 균등 분배 |
| StemLeafFactory | `calculateDynamicWidths()` - 자체 로직 |

**권장:** 모든 팩토리에서 동적 너비 계산 통일 (별도 작업)

#### 5. 테스트 데이터 / 예시
- `examples/` 폴더 생성
- 각 tableType별 JSON 예시 파일
- VIZ-API-CONFIG.md 예시 업데이트

#### 6. 문서 추가 내용 (VIZ-API-CONFIG.md)
**cellVariables로 합계 직접 지정하는 케이스:**
- 데이터에 숫자가 아닌 값(A, x, null 등)이 포함되면 합계가 "-"로 표시됨
- 이 경우 cellVariables를 사용하여 합계 행 값을 직접 지정
- 예시:
```json
{
  "tableType": "basic-table",
  "data": "헤더: 구분, 남, 여\nA형: A, 0.3\nB형: 0.4, null",
  "cellVariables": [
    { "rowIndex": 3, "colIndex": 1, "value": "0.7" },
    { "rowIndex": 3, "colIndex": 2, "value": "0.5" }
  ],
  "options": { "basicTable": { "showTotal": true } }
}
```

#### 7. 특수 값 표기법

**빈 셀 표기: `null`**
- 기존 `_` 대신 `null` 사용 (프로그래밍 표준)
- 파서에서 문자열 `"null"` → 빈 값으로 처리
```javascript
const parsedValue = (value === 'null' || value === '') ? null : value;
```

**탈리마크 표기: `/` 연속**
- 슬래시 연속 입력 → 탈리마크로 렌더링
- 분수(`1/2`)와 구분: 슬래시만 있으면 탈리
```
"/"      → 탈리 1개
"///"    → 탈리 3개
"/////"  → 탈리 5개 (正)
"1/2"    → 분수 (탈리 아님)
```
- 파서 로직:
```javascript
if (/^\/+$/.test(value)) {
  return { type: 'tally', count: value.length };
}
```

### 커밋 순서

1. **Commit 1**: CONFIG 상수 및 Factory 이름 변경
2. **Commit 2**: viz-api.js frequency 로직 제거
3. **Commit 3**: table.js frequency 로직 제거
4. **Commit 4**: 문서 업데이트
5. **Commit 5**: 하위 호환성 처리 (별칭 등)

### 예상 효과
- ⭐⭐⭐ 높음
- API 단순화 (tableType 4개 → 3개)
- data 형식 통일 (모두 string)
- LLM 오류 감소 (다형성 제거)
- 코드 복잡도 감소 (frequency 전용 로직 제거)

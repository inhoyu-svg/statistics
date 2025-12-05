# 리팩토링 계획

> 작성일: 2025-12-05
> 예정: 다음 주부터 진행

---

## 1. 입력 검증 강화 🔥 추천

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

---

## 3. 파서 출력 통일 ⚠️ 나중에

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

---

## 우선순위 요약

| 순서 | 작업 | 효과 | 작업량 | 비고 |
|------|------|------|--------|------|
| 1 | 입력 검증 강화 | ⭐⭐⭐ | 중간 | 🔥 먼저 진행 |
| 2 | cellVariables 통일 | ⭐⭐ | 작음 | 선택적 |
| 3 | 파서 출력 통일 | ⭐⭐ | 큼 | 나중에 |

---

## 참고 파일
- `md/SCHEMA.md` - 현재 데이터 구조 정의
- `schema/viz-api.schema.json` - JSON Schema
- `js/utils/validator.js` - 기존 검증 로직

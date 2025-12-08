# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Work Protocol

**🚨 CRITICAL RULE - ALWAYS FOLLOW THIS PROCESS 🚨**

When receiving **ANY** task, feature request, or code modification command:

### Step 1: 실행 계획 설명 (REQUIRED)
- **절대로 바로 코드를 수정하지 마세요**
- 먼저 사용자에게 실행 계획을 **한글로** 자세히 설명하세요
- 어떤 파일을 수정할지, 어떤 메서드/함수를 변경할지 **구체적으로** 명시하세요
- 단계별로 나열하고, 변경 이유도 함께 설명하세요

### Step 2: 사용자 승인 대기 (REQUIRED)
- 사용자가 **"진행", "ㄱㄱ", "좋아", "네", "OK"** 등의 승인 응답을 할 때까지 **대기**하세요
- 승인 없이 코드를 변경하면 **프로토콜 위반**입니다

### Step 3: 승인 후 실행
- 사용자 승인을 받은 후에만 실제 코드 수정을 진행하세요
- 계획대로 정확히 실행하세요

### Example (GOOD ✅)
```
User: "통계 카드에 표준편차 추가해줘"

Claude:
네, 표준편차를 추가하겠습니다. 다음과 같이 진행하겠습니다:

1. js/core/processor.js의 calculateBasicStats() 메서드 수정
   - 표준편차 계산 로직 추가
   - 분산 계산 후 제곱근으로 표준편차 도출

2. js/renderers/ui.js의 renderStatsCards() 메서드 수정
   - statsData 배열에 표준편차 카드 추가
   - 툴팁 설명 포함

진행할까요?

User: "ㄱㄱ"

Claude: [실제 코드 수정 진행]
```

### Example (BAD ❌)
```
User: "통계 카드에 표준편차 추가해줘"

Claude: [바로 코드 수정 시작] ← 프로토콜 위반!
```

---

## 프로젝트 개요

### 기술 스택
- **순수 JavaScript (ES6 Modules)** - 프레임워크 없음
- **HTML5 Canvas** - 차트 렌더링
- **CSS3** - 스타일링 및 애니메이션
- **Git & Vercel** - 버전 관리 및 자동 배포

### 폴더 구조
```
statistics/
├── index.html              # 메인 HTML (455줄)
├── styles.css              # 전역 스타일 (2579줄)
├── js/
│   ├── app.js              # 앱 초기화 및 이벤트 바인딩 (334줄)
│   ├── config.js           # 전역 설정 상수 (472줄)
│   ├── viz-api.js          # 시각화 API 인터페이스 (1119줄)
│   ├── controllers/        # UI 컨트롤러
│   │   ├── index.js                   # 컨트롤러 export (10줄)
│   │   ├── AnimationController.js     # 애니메이션 UI 제어 (130줄)
│   │   ├── ChartSettingsController.js # 차트 설정 제어 (308줄)
│   │   ├── DatasetController.js       # 데이터셋 관리 (275줄)
│   │   ├── GenerationController.js    # 도수분포표 생성 (918줄)
│   │   ├── LayerPanelController.js    # 레이어 패널 제어 (721줄)
│   │   └── TableConfigController.js   # 테이블 설정 제어 (338줄)
│   ├── core/               # 데이터 처리 및 상태 관리
│   │   ├── processor.js    # 통계 계산 및 계급 생성 (317줄)
│   │   ├── chartStore.js   # 차트 상태 저장소 (98줄)
│   │   ├── dataStore.js    # 데이터 상태 저장소 (130줄)
│   │   ├── datasetStore.js # 데이터셋 저장소 (203줄)
│   │   ├── tableStore.js   # 테이블 상태 저장소 (245줄)
│   │   ├── parsers/        # 데이터 파서
│   │   │   ├── index.js               # 파서 export (85줄)
│   │   │   ├── ParserAdapter.js       # 파서 출력 통일 어댑터 (327줄)
│   │   │   ├── FrequencyParser.js     # 도수분포표 파서 (82줄)
│   │   │   ├── CrossTableParser.js    # 이원분류표 파서 (194줄)
│   │   │   ├── CategoryMatrixParser.js # 카테고리 매트릭스 파서 (138줄)
│   │   │   └── StemLeafParser.js      # 줄기와 잎 파서 (273줄)
│   │   └── serializer/     # 데이터 직렬화
│   │       ├── index.js               # 직렬화 export (6줄)
│   │       ├── DataExporter.js        # 데이터 내보내기 (404줄)
│   │       └── DataImporter.js        # 데이터 가져오기 (139줄)
│   ├── renderers/          # UI 렌더링 모듈
│   │   ├── ui.js           # 통계 카드 렌더링 (77줄)
│   │   ├── chart.js        # 메인 차트 컨트롤러 (785줄)
│   │   ├── table.js        # 테이블 렌더링 컨트롤러 (1652줄)
│   │   ├── chart/          # 차트 렌더링 서브모듈
│   │   │   ├── CoordinateSystem.js    # 좌표 변환 (92줄)
│   │   │   ├── LayerFactory.js        # 레이어 생성 (540줄)
│   │   │   ├── HistogramRenderer.js   # 막대 차트 (205줄)
│   │   │   ├── PolygonRenderer.js     # 다각형 (133줄)
│   │   │   ├── AxisRenderer.js        # 축, 그리드 (267줄)
│   │   │   ├── CalloutRenderer.js     # 말풍선 (233줄)
│   │   │   ├── DashedLineRenderer.js  # 점선 렌더러 (104줄)
│   │   │   └── TriangleRenderer.js    # 삼각형 렌더러 (321줄)
│   │   └── table/          # 테이블 렌더링 서브모듈
│   │       ├── TableCellRenderer.js   # 셀 렌더링 (1106줄)
│   │       ├── TableEditModal.js      # 편집 모달 (400줄)
│   │       ├── TableLayerFactory.js   # 테이블 레이어 생성 (486줄)
│   │       └── factories/             # 테이블 팩토리
│   │           ├── index.js               # 팩토리 라우터 (112줄)
│   │           ├── BaseTableFactory.js    # 기본 팩토리 (304줄)
│   │           ├── CrossTableFactory.js   # 이원분류표 팩토리 (429줄)
│   │           ├── CategoryMatrixFactory.js # 카테고리 매트릭스 (192줄)
│   │           └── StemLeafFactory.js     # 줄기와 잎 팩토리 (671줄)
│   ├── animation/          # 애니메이션 시스템
│   │   ├── index.js        # 통합 export (49줄)
│   │   ├── effects/        # 애니메이션 효과
│   │   │   ├── animation.controller.js  # 애니메이션 컨트롤러 (122줄)
│   │   │   ├── animation.service.js     # 애니메이션 서비스 (107줄)
│   │   │   ├── animation-index.js       # 효과 인덱스 (16줄)
│   │   │   ├── blink.js    # 깜빡임 효과 (60줄)
│   │   │   ├── draw.js     # 그리기 효과 (53줄)
│   │   │   ├── fade.js     # 페이드 효과 (30줄)
│   │   │   ├── scale.js    # 크기 조절 효과 (36줄)
│   │   │   ├── slide.js    # 슬라이드 효과 (41줄)
│   │   │   └── index.js    # 효과 export (10줄)
│   │   ├── layer/          # 레이어 관리
│   │   │   ├── layer.controller.js  # 레이어 컨트롤러 (400줄)
│   │   │   ├── layer.dto.js         # 레이어 데이터 객체 (105줄)
│   │   │   ├── layer.service.js     # 레이어 서비스 (144줄)
│   │   │   ├── layer.utils.js       # 레이어 유틸리티 (60줄)
│   │   │   └── index.js    # 레이어 export (26줄)
│   │   └── timeline/       # 타임라인 관리
│   │       ├── timeline.controller.js  # 타임라인 컨트롤러 (194줄)
│   │       ├── timeline.dto.js         # 타임라인 데이터 객체 (19줄)
│   │       ├── timeline.service.js     # 타임라인 서비스 (144줄)
│   │       ├── timeline.utils.js       # 타임라인 유틸리티 (28줄)
│   │       └── index.js    # 타임라인 export (22줄)
│   └── utils/              # 유틸리티 함수
│       ├── utils.js        # 공통 유틸리티 (159줄)
│       ├── katex.js        # KaTeX 렌더링 유틸 (426줄)
│       ├── validator.js    # 입력 검증 - ConfigValidator 클래스 (425줄)
│       ├── message.js      # 메시지 관리 (37줄)
│       └── corruption.js   # 찢김 효과 유틸 (950줄)
├── md/                     # 문서 파일들
│   ├── CLAUDE.md           # Claude Code 가이드
│   ├── SCHEMA.md           # 데이터 구조 스키마 문서
│   ├── VIZ-API-CONFIG.md   # viz-api 설정 가이드
│   ├── REFACTORING-PLAN.md # 리팩토링 계획
│   ├── README.md           # 프로젝트 소개
│   └── USAGE.md            # 사용법 가이드
└── schema/                 # JSON Schema
    └── viz-api.schema.json # viz-api 설정 검증 스키마
```

---

## 주요 기능

### 1. 다양한 테이블 타입
- **도수분포표**: 계급, 도수, 상대도수, 누적도수 자동 계산
- **이원분류표**: 행/열 카테고리 교차 분류
- **줄기-잎 그림**: 데이터 분포 시각화
- **카테고리 매트릭스**: 다중 카테고리 데이터

### 2. 차트 시각화
- Canvas 기반 히스토그램 (그라데이션 막대)
- 상대도수 다각형 (선 + 점)
- 말풍선 (Callout) - 특정 막대에 텍스트 표시
- 수직 파선 (Dashed lines) - 기준선 표시
- 막대 위 값 표시 (Bar labels)
- 합동 삼각형 - 경계값 기준 S₁, S₂ 시각화
- 빈 구간 압축 - 이중물결표(≈) 자동 표시

### 3. viz-api.js (외부 연동 API)
- JSON 설정으로 차트/테이블 렌더링
- iframe 임베딩 지원
- Corruption 효과 (찢김/마스킹)
- 셀 애니메이션 설정

### 4. 고급 설정
- X축/Y축 라벨 커스터마이징
- 격자선 토글 (가로/세로 개별)
- Y축 간격 커스터마이징
- 테이블 컬럼 표시/숨김, 순서 변경

### 5. 애니메이션 시스템
**아키텍처**: Layer → Timeline → Effects 3단 구조

#### 5.1 레이어 시스템 (animation/layer/)
- **Layer**: 차트의 각 요소를 계층적으로 관리 (막대, 점, 선, 라벨 등)
- **LayerController**: 레이어 추가/제거/순서 변경
- **LayerService**: 레이어 검색, 필터링, 상태 관리
- **계층 구조 예시**:
  ```
  히스토그램 그룹
  ├── 막대-0
  ├── 막대-1
  └── 막대-2

  다각형 그룹
  ├── 선 그룹
  │   ├── 선(0→1)
  │   └── 선(1→2)
  └── 점 그룹
      ├── 점-0
      ├── 점-1
      └── 점-2
  ```

#### 5.2 타임라인 시스템 (animation/timeline/)
- **Timeline**: 애니메이션 시퀀스 관리
- **TimelineController**: 재생/일시정지/정지 제어
- **TimelineService**: 애니메이션 큐 관리
- **기능**:
  - 여러 애니메이션의 시간 동기화
  - 순차/병렬 실행 제어
  - 애니메이션 재생 속도 조절

#### 5.3 애니메이션 효과 (animation/effects/)
- **fade**: 투명도 조절 (0 → 1 또는 1 → 0)
- **scale**: 크기 변화 (작게 → 크게)
- **slide**: 위치 이동 (아래 → 위, 왼쪽 → 오른쪽)
- **draw**: 선 그리기 효과 (0% → 100%)
- **blink**: 깜빡임 효과
- **AnimationController**: 효과 조합 및 실행
- **AnimationService**: 이징 함수, 보간

#### 5.4 사용 예시
```javascript
// 1. 레이어에 애니메이션 적용
layer.addAnimation('fade', { from: 0, to: 1, duration: 500 });
layer.addAnimation('scale', { from: 0.5, to: 1, duration: 300 });

// 2. 타임라인으로 시퀀스 제어
timeline.addAnimation(layer, 'fade', { delay: 100 });
timeline.play();

// 3. 레이어 가시성 토글 → 자동 애니메이션
layer.visible = false; // fade-out 애니메이션 자동 실행
```

---

## 리팩토링 가이드

### 현재 상태 (2025-12-05)
**⚠️ 리팩토링 필요 파일:**
- **table.js**: 1652줄 ❌ (600줄 초과)
- **TableCellRenderer.js**: 1106줄 ❌ (600줄 초과)
- **viz-api.js**: 1061줄 ❌ (600줄 초과)
- **corruption.js**: 950줄 ❌ (600줄 초과)
- **GenerationController.js**: 918줄 ❌ (600줄 초과)
- **chart.js**: 785줄 ❌ (600줄 초과)
- **LayerPanelController.js**: 721줄 ❌ (600줄 초과)

**✅ 정상 파일:**
- **chart/ 서브모듈들**: 92~540줄
- **table/factories/**: 79~522줄
- **controllers/**: 대부분 338줄 이하

### 리팩토링이 필요한 신호
다음 중 하나라도 해당되면 리팩토링을 제안하세요:

1. ❌ **파일 크기**: 단일 파일이 600줄 초과
2. ❌ **메서드 크기**: 단일 메서드가 80줄 초과
3. ❌ **중복 코드**: 동일 로직이 3곳 이상 반복
4. ❌ **복잡한 조건문**: 중첩 if문 4단계 이상
5. ❌ **매개변수 과다**: 메서드 매개변수 6개 이상
6. ❌ **책임 분리 실패**: 하나의 메서드가 3가지 이상 작업 수행

### 리팩토링 히스토리

1. **Phase 1 (최소 개입)** - ✅ 완료 (2025-11-19)
   - JSDoc 주석 추가
   - 헬퍼 메서드 추출
   - 메서드 분할
   - 결과: 369줄 → 444줄 (JSDoc 포함)

2. **Phase 2 (대규모 개입)** - ✅ 완료 (2025-11-20)
   - chart.js 파일 분할
   - chart.js (메인 컨트롤러)
   - chart/ 서브모듈 6개 생성
   - 결과: 950줄 → 593줄 + 6개 모듈

3. **Phase 3 (컨트롤러 분리)** - ✅ 완료 (이후)
   - app.js에서 컨트롤러 분리
   - controllers/ 폴더 생성 (7개 파일)
   - 결과: app.js 1495줄 → 334줄

### 향후 개선 방향 (필요)
**우선순위 높음:**
- table.js 분할 필요 (1652줄 → 렌더링/레이어/유틸 분리)
- TableCellRenderer.js 분할 필요 (1106줄 → 렌더링/측정/파싱 분리)
- viz-api.js 분할 필요 (1061줄 → 차트API/테이블API 분리)
- corruption.js 분할 검토 (950줄 → 차트/테이블 분리)

**중간 우선순위:**
- GenerationController.js 분할 필요 (918줄 → 기능별 분리)
- chart.js 추가 분할 검토 (785줄)

**낮은 우선순위:**
- LayerPanelController.js 정리 (721줄)

---

## 커밋 규칙

### 커밋 메시지 형식 (한글)
```
<type>: <제목>

<본문>
```

**Types**:
- `Add`: 새 기능 추가
- `Fix`: 버그 수정
- `Refactor`: 코드 리팩토링 (기능 변경 없음)
- `Update`: 기존 기능 개선
- `Remove`: 코드/파일 제거
- `Docs`: 문서 수정

**⚠️ 중요: 커밋 메시지는 반드시 한글로 작성**

**Example**:
```
Add: 빈 계급 구간 압축 기능 추가

- processor.js에 shouldShowEllipsis() 메서드 추가
- createCoordinateSystem()에 압축 모드 지원
- chart.js에 ≈ 기호 렌더링 추가
```

```
Fix: 레이어 순서 변경 시 애니메이션 순서 업데이트

- setupAnimations() 메서드를 재귀적으로 재작성
- order 기반으로 동적 애니메이션 생성
- replayAnimation() 메서드 추가
```

---

## 디버깅 체크리스트

### 함수 매개변수 관련 오류
**증상**: `XXX is not a function`, `XXX is not defined`

**체크 포인트**:
1. ✅ 메서드 시그니처에 매개변수 선언되어 있는가?
2. ✅ 호출부에서 매개변수를 전달하고 있는가?
3. ✅ 매개변수 순서가 일치하는가?
4. ✅ 화살표 함수로 인한 변수 shadowing은 없는가?

**최근 사례** (2025-11-19):
- `toY is not a function` 오류
  - 원인 1: `createCoordinateSystem()`이 maxY 매개변수를 받지 않음
  - 원인 2: `drawXAxisLabels()`이 toY 매개변수를 받지 않음
  - 원인 3: `toY => toY(0)` 화살표 함수로 변수 shadowing 발생
  - 해결: 메서드 시그니처와 호출부 모두 수정, 화살표 함수 제거

### Canvas 좌표 관련 오류
**증상**: 차트 요소가 잘못된 위치에 렌더링

**체크 포인트**:
1. ✅ toX(), toY() 함수가 올바른 좌표 반환하는가?
2. ✅ 압축 모드에서 모든 렌더링 메서드가 toX() 사용하는가?
3. ✅ 막대 중앙 계산 시 `toX(i) + xScale * 0.5` 사용하는가?
4. ✅ 마지막 라벨 위치가 `toX(length - 1) + xScale`인가?

---

## 주의사항

### 절대 하지 말 것 ⛔
1. **프로토콜 무시**: 실행 계획 없이 바로 코드 수정
2. **파일 구조 변경**: 폴더 구조 임의 변경
3. **의존성 추가**: npm 패키지 설치 (순수 JS 유지)
4. **Canvas API 대체**: Chart.js 등 라이브러리 도입
5. **CSS 프레임워크**: Bootstrap, Tailwind 등 추가
6. **외부 프로젝트 파일 수정**: `frame-test/` 폴더 내 파일 수정 금지 (특히 `math-visualization.js`)

### 항상 할 것 ✅
1. **한글 커뮤니케이션**: 사용자와 한글로 대화
2. **실행 계획 먼저**: 코드 수정 전 계획 설명 및 승인 대기
3. **원자적 커밋**: 하나의 기능/수정 = 하나의 커밋
4. **ES6 모듈**: import/export 사용
5. **XSS 방지**: textContent 사용, innerHTML 지양
6. **Git 푸시**: 수정 후 자동으로 git push하여 Vercel 배포

---

## 질문 템플릿

사용자가 새 기능을 요청하면 다음을 고려:

1. **영향 범위**: 어떤 파일들이 수정되어야 하는가?
2. **데이터 흐름**: processor → ui/chart 순서 맞는가?
3. **설정 추가**: config.js에 상수 추가 필요한가?
4. **검증 필요**: validator.js 업데이트 필요한가?
5. **리팩토링**: 이 기능 추가로 파일이 너무 커지는가?

---

## 마지막 업데이트
- **날짜**: 2025-12-08
- **주요 작업**:
  - ✅ **리팩토링 3단계 완료** (2025-12-08)
    - 입력 검증 강화: `ConfigValidator` 클래스 생성 (`validator.js` 131줄 → 425줄)
    - cellVariables 통일: `rowIndex/colIndex` 방식으로 통일, 레거시 지원
    - 파서 출력 통일: `ParserAdapter` 클래스 생성 (327줄)
    - 팩토리에 `createFromAdaptedData()` 메서드 추가
    - **신규 파일**: `js/core/parsers/ParserAdapter.js`
    - **수정 파일**: `validator.js`, `viz-api.js`, `table.js`, `factories/*.js`
  - ✅ **Corruption (찢김 효과) 기능 추가** (2025-12-04~05)
    - 차트/테이블에 종이 찢김 효과 적용
    - `corruption` 옵션: `{ cells, edgeColor, fiberCount, maskAxisLabels }`
    - 셀 범위 지정: `"0-0:2-3"` 형식 (콜론으로 시작~끝 셀)
    - 인접 셀 병합: 연결된 영역은 하나의 찢김으로 렌더링
    - 차트 상단/오른쪽 테두리 자동 확장
    - **수정 파일**: `js/utils/corruption.js` (신규), `js/viz-api.js`
  - ✅ **JSON Schema 추가** (2025-12-05)
    - viz-api 설정 검증용 JSON Schema 생성
    - 런타임 검증 가능, 다른 언어에서도 사용 가능
    - **신규 파일**: `schema/viz-api.schema.json`
  - ✅ **SCHEMA.md 문서 추가** (2025-12-05)
    - viz-api 데이터 구조 스키마 문서화
    - 최상위 Config 객체, tableType별 data 형식
    - 내부 변환 데이터 구조 (frequency, stem-leaf, cross-table, category-matrix)
    - options 객체 구조, cellVariables 형식
    - 데이터 흐름 다이어그램
    - **신규 파일**: `md/SCHEMA.md`
  - ✅ **정적 모드 합동 삼각형 렌더링** (2025-12-05)
    - `animation: false`일 때도 합동 삼각형 표시
    - `TriangleRenderer.drawStatic()` 메서드 추가
    - S₁, S₂ 라벨 및 점선 렌더링 포함
    - **수정 파일**: `js/renderers/chart/TriangleRenderer.js`, `js/renderers/chart.js`
  - ✅ **테이블 스케일 비율 적용** (2025-12-04)
    - 테이블 렌더링 시 CONFIG.SCALE_RATIO 적용
    - **수정 파일**: `js/renderers/table.js`, `js/renderers/table/TableCellRenderer.js`
  - ✅ **차트 설정 개선** (2025-12-04)
    - 그리드 옵션 추가 (`grid.horizontal`, `grid.vertical`)
    - `customBarLabels` API 단순화
    - 파선 라벨 폰트 크기 16px → 22px
    - 축 라벨 끄기 시 0과 최댓값 라벨은 유지
    - **수정 파일**: `js/renderers/chart/AxisRenderer.js`, `js/renderers/chart/DashedLineRenderer.js`

- **이전 작업**:
  - ✅ **viz-api.js 기능 추가** (2025-12-03)
    - 계급 범위 수동 편집 (`classRange` 파라미터)
    - 말풍선 기능 (`options.callout`)
  - ✅ **SCDream 폰트 전역 적용** (2025-12-03)
  - ✅ **셀 애니메이션 JSON 설정 지원** (2025-12-03)
  - ✅ **CLAUDE.md 폴더 구조 전면 수정** (2025-11-28)
    - 57개 JS 파일 구조 전체 재작성
    - 누락된 폴더 추가: controllers/, parsers/, serializer/, factories/
    - 누락된 파일 추가: viz-api.js, katex.js, datasetStore.js, TableEditModal.js 등
    - 모든 파일 줄 수 실제 값으로 업데이트
    - 리팩토링 가이드 현황 업데이트 (600줄 초과 파일 5개 명시)
  - ✅ **테이블 렌더링 개선** (2025-11-28)
    - 탈리 편집 버그 수정: 모달에서 tallyCount 표시/편집 지원
    - 괄호 내부 KaTeX 렌더링: "키(cm)"에서 "cm"에 KaTeX 폰트 적용
    - 소문자 폰트 크기 증가: 12px → 15px (괄호 안에서 더 잘 보이게)
    - 괄호 단독 사용 시 일반 크기 유지: "(가)" 같은 경우 작게 안 함
    - 영문자 볼드 제거: 이원분류표에서 한글만 볼드, 영문(A, B 등)은 일반체
    - 계급값 기본값 false: TABLE_DEFAULT_VISIBLE_COLUMNS[1] = false
    - 수정 파일: TableEditModal.js, TableCellRenderer.js, config.js
  - ✅ **축 끝 라벨 축 제목 대체** (2025-11-26)
    - Y축 끝 라벨: 숫자값 → (상대도수) 또는 (도수)
    - X축 끝 라벨: 숫자값 → (계급)
    - Y축 끝 라벨 폰트 크기 동적 조정 (4글자 초과 시 11px, 그 외 14px)
    - 폰트 변경: KatexUtils.render() → ctx.fillText() (축 끝 라벨만)
    - X축 괄호 버그 수정 (getCustomLabels() 로직 개선)
    - 수정 파일: config.js, AxisRenderer.js, app.js
  - ✅ **하드코딩 제거 및 코드 품질 개선** (2025-11-24)
    - 색상 하드코딩 13곳 제거 → CSS 변수 사용
    - 투명도 값 CONFIG 상수화 (CHART_BAR_ALPHA, CALLOUT_BG_ALPHA)
    - Utils에 헬퍼 함수 3개 추가 (그라디언트 생성, 계급명 생성)
    - 중복 코드 제거: 그라디언트 생성 4곳, 계급명 생성 4곳
    - 메시지 색상 CSS 변수화
    - 수정 파일: styles.css, config.js, utils.js, 4개 렌더러, LayerFactory.js
    - 결과: DRY 원칙 준수, 완전한 테마 시스템 구축
  - ✅ **CLAUDE.md 문서 전면 수정** (2025-11-24)
    - 폴더 구조 섹션 완전히 재작성
      - CSS 경로 수정: css/styles.css → styles.css (루트)
      - 파일명 수정: ChartRenderer.js → chart.js
      - 모든 파일 줄 수를 실제 값으로 업데이트
    - 누락된 파일/폴더 추가:
      - core/: chartStore.js, dataStore.js, tableStore.js
      - chart/: CalloutRenderer.js
      - renderers/: table.js, table/ 서브폴더
      - animation/ 폴더 전체 구조 (25개 이상 파일)
    - 애니메이션 시스템 상세 설명 추가 (Layer, Timeline, Effects)
    - 리팩토링 섹션 업데이트 (chart.js 593줄 반영)
  - ✅ **미사용 코드 제거** (2025-11-24)
    - config.js: CHART_ZIGZAG_* 상수 6줄 제거
    - AxisRenderer.js: drawEllipsisPattern() 메서드 27줄 제거
    - 문서 수정: "지그재그(⋯)" → "이중물결표(≈)" (7곳)
  - ✅ **막대 위 값 표시 기능 추가** (2025-11-24)
    - CONFIG.SHOW_BAR_LABELS 상수 추가 (기본값: false)
    - index.html에 "막대 위 값 표시" 체크박스 추가
    - LayerFactory에 별도 bar-labels 레이어 그룹 생성
    - HistogramRenderer에 renderBarLabel() 메서드 추가 (fade 효과 포함)
    - 애니메이션 진행도 0.5~1.0 구간에서 fade-in 효과
    - 체크박스 토글 시 상태 유지 (ellipsisInfo, callout 등)
    - 레이어 렌더링 순서: 히스토그램 → 다각형 → 막대 라벨 → 말풍선
  - ✅ **범례 색상 실제 차트와 일치하도록 수정** (2025-11-24)
    - 선: 단색 → 그라디언트 (#AEFF7E → #68994C)
    - 점: 그라디언트 → 단색 (#93DA6A)
    - PolygonRenderer의 실제 렌더링 색상과 일치
  - ✅ **코드 품질 개선 작업 완료** (2025-11-21)
    - H1: requestAnimationFrame 메모리 누수 수정
    - H2: 전역 네임스페이스 오염 방지 (window.__DEV__)
    - H3: 에러 메시지 길이 제한 (최대 10개 항목)
    - M4: 중복 코드 제거 (헬퍼 메서드 3개 추가, 11곳 개선)
    - M1: CSS 변수로 색상 이동 (--chart-bar-border-color, --chart-polygon-color)
    - M2: 매직 넘버 명명 개선 (9개 명확한 상수 추가)
  - ✅ **문서 파일 전면 업데이트** (2025-11-21, 2025-11-24)
    - README.md: 막대 위 값 표시 기능 추가, 중략 기호 수정
    - USAGE.md: 고급 기능 섹션에 막대 위 값 표시 설명 추가, 중략 기호 수정
    - CLAUDE.md: 폴더 구조 재작성, 애니메이션 시스템 설명 추가, 모든 오류 수정
- **현재 상태**: 정상 작동 ✅

---

## ✅ DONE: VIZ-API-CONFIG.md 문서 구조 개선 (2025-12-02)

> AI가 JSON 생성 프롬프트를 작성할 때 활용도를 높이기 위한 개선 완료

### ✅ Quick Start 섹션 추가
- 문서 최상단에 최소 예시 배치
- 차트 최소 JSON, 테이블 최소 JSON
- "이것만 있으면 동작한다" 명시

### ✅ data 형식 비교표
- 4가지 tableType의 data 형식 한눈에 비교

### ✅ Common Mistakes 섹션
- 자주 하는 실수 5가지와 해결법

---

## viz-api.js 미반영 기능 목록 (향후 추가 예정)

> app.js에는 있지만 viz-api.js에는 아직 추가되지 않은 기능들

### 차트 애니메이션 제어
- `pauseAnimation()` / `stopAnimation()` - 일시정지/정지 제어
- `setAnimationSpeed(speed)` - 속도 조절 (0.1x ~ 3x)
- `timeline.seekToProgress()` - 진행도 탐색 (0~1)

### 차트 설정 옵션
- `SHOW_BAR_LABELS` - 막대 위 값 표시 토글

### 레이어 관리
- 레이어 목록 조회 (`getAllLayers()`)
- 레이어 가시성 토글 (`layer.visible`)
- 레이어 순서 변경 (드래그앤드롭)

### 기타
- JSON 설정 내보내기/불러오기 (`exportJson()` / `importJson()`)

### ✅ 이미 구현된 기능 (2025-12-04)
- `options.customYInterval` - Y축 간격 커스터마이징
- `options.grid.showHorizontal/showVertical` - 격자선 토글
- `options.axis.showYLabels/showXLabels` - 축 라벨 표시 토글
- `options.axis.yLabelFormat` - Y축 백분율 형식
- `options.showDashedLines` - 파선 표시 토글
- `playAnimation()` - 애니메이션 재생

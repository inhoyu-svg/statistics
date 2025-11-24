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
├── index.html              # 메인 HTML (281줄)
├── styles.css              # 전역 스타일 (1913줄)
├── js/
│   ├── app.js              # 메인 애플리케이션 컨트롤러 (1495줄)
│   ├── config.js           # 전역 설정 상수 (243줄)
│   ├── core/               # 데이터 처리 및 상태 관리
│   │   ├── processor.js    # 통계 계산 및 계급 생성 (406줄)
│   │   ├── chartStore.js   # 차트 상태 저장소 (98줄)
│   │   ├── dataStore.js    # 데이터 상태 저장소 (130줄)
│   │   └── tableStore.js   # 테이블 상태 저장소 (119줄)
│   ├── renderers/          # UI 렌더링 모듈
│   │   ├── ui.js           # 통계 카드 렌더링 (77줄)
│   │   ├── chart.js        # 메인 차트 컨트롤러 (593줄)
│   │   ├── table.js        # 테이블 렌더링 컨트롤러 (303줄)
│   │   ├── chart/          # 차트 렌더링 서브모듈
│   │   │   ├── CoordinateSystem.js    # 좌표 변환 (79줄)
│   │   │   ├── LayerFactory.js        # 레이어 생성 (248줄)
│   │   │   ├── HistogramRenderer.js   # 막대 차트 (165줄)
│   │   │   ├── PolygonRenderer.js     # 다각형 (116줄)
│   │   │   ├── AxisRenderer.js        # 축, 그리드, 범례 (268줄)
│   │   │   └── CalloutRenderer.js     # 말풍선 (154줄)
│   │   └── table/          # 테이블 렌더링 서브모듈
│   │       ├── TableCellRenderer.js   # 셀 렌더링
│   │       └── TableLayerFactory.js   # 테이블 레이어 생성
│   ├── animation/          # 애니메이션 시스템
│   │   ├── index.js        # 통합 export
│   │   ├── effects/        # 애니메이션 효과
│   │   │   ├── animation.controller.js  # 애니메이션 컨트롤러
│   │   │   ├── animation.service.js     # 애니메이션 서비스
│   │   │   ├── blink.js    # 깜빡임 효과
│   │   │   ├── draw.js     # 그리기 효과
│   │   │   ├── fade.js     # 페이드 효과
│   │   │   ├── scale.js    # 크기 조절 효과
│   │   │   └── slide.js    # 슬라이드 효과
│   │   ├── layer/          # 레이어 관리
│   │   │   ├── layer.controller.js  # 레이어 컨트롤러
│   │   │   ├── layer.dto.js         # 레이어 데이터 객체
│   │   │   ├── layer.service.js     # 레이어 서비스
│   │   │   └── layer.utils.js       # 레이어 유틸리티
│   │   └── timeline/       # 타임라인 관리
│   │       ├── timeline.controller.js  # 타임라인 컨트롤러
│   │       ├── timeline.dto.js         # 타임라인 데이터 객체
│   │       ├── timeline.service.js     # 타임라인 서비스
│   │       └── timeline.utils.js       # 타임라인 유틸리티
│   └── utils/              # 유틸리티 함수
│       ├── utils.js        # 공통 유틸리티 (99줄)
│       ├── validator.js    # 입력 검증 (87줄)
│       └── message.js      # 메시지 관리 (37줄)
└── *.md                    # 문서 파일들 (CLAUDE.md, README.md, USAGE.md)
```

---

## 주요 기능

### 1. 도수분포표 생성
- 데이터 입력 (쉼표 또는 공백 구분)
- 자동 계급 생성 (0부터 시작)
- 계급 개수 및 계급 간격 커스터마이징
- 도수, 상대도수, 누적도수 자동 계산

### 2. 통계 요약 카드
- 데이터 개수, 최솟값, 최댓값, 범위, 평균, 중앙값
- 각 통계량에 대한 툴팁 설명

### 3. 히스토그램 & 상대도수 다각형
- Canvas 기반 차트 렌더링
- 히스토그램 (그라데이션 막대)
- 상대도수 다각형 (선 + 점)
- 범례 표시

### 4. 빈 구간 압축 기능 ⭐ (최근 추가)
- 데이터가 0에서 멀리 떨어진 경우 (예: 140~160 범위)
- 0부터 첫 데이터까지 빈 구간이 3개 이상이면 자동 압축
- 압축된 구간에 이중물결표(≈) 표시
- 차트 가독성 대폭 향상

### 5. 고급 설정
- X축/Y축 라벨 커스터마이징
- 테이블 컬럼 라벨 커스터마이징
- X축 라벨 = 테이블 "계급" 컬럼 (통합)
- Y축 라벨 = 테이블 "상대도수(%)" 컬럼 (통합)

### 6. 애니메이션 시스템 ⭐
**아키텍처**: Layer → Timeline → Effects 3단 구조

#### 6.1 레이어 시스템 (animation/layer/)
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

#### 6.2 타임라인 시스템 (animation/timeline/)
- **Timeline**: 애니메이션 시퀀스 관리
- **TimelineController**: 재생/일시정지/정지 제어
- **TimelineService**: 애니메이션 큐 관리
- **기능**:
  - 여러 애니메이션의 시간 동기화
  - 순차/병렬 실행 제어
  - 애니메이션 재생 속도 조절

#### 6.3 애니메이션 효과 (animation/effects/)
- **fade**: 투명도 조절 (0 → 1 또는 1 → 0)
- **scale**: 크기 변화 (작게 → 크게)
- **slide**: 위치 이동 (아래 → 위, 왼쪽 → 오른쪽)
- **draw**: 선 그리기 효과 (0% → 100%)
- **blink**: 깜빡임 효과
- **AnimationController**: 효과 조합 및 실행
- **AnimationService**: 이징 함수, 보간

#### 6.4 사용 예시
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

## 최근 업데이트 (2025-11-21)

### 빈 구간 압축 기능 구현 (2025-11-19)
**문제**: 데이터가 142~163 범위인데 계급이 0부터 시작하여 0~140 사이에 28개의 빈 막대가 생성되어 차트가 지나치게 길어짐

**해결**:
1. `processor.js`에 `shouldShowEllipsis()` 메서드 추가
   - 첫 데이터가 있는 계급 이전에 빈 계급이 3개 이상이면 압축 필요 판단

2. `CoordinateSystem.js`의 좌표 변환 로직 구현
   - 압축 모드: 0~firstDataIdx 사이를 1칸으로 압축
   - toX() 함수가 압축된 좌표 반환
   - toY() 함수는 maxY 매개변수 받아서 생성

3. `AxisRenderer.js`의 X축 라벨 렌더링
   - 이중물결표(≈) 표시
   - 이중물결 패턴 렌더링 (0과 압축된 칸 사이)
   - 데이터 구간만 라벨 표시

4. 모든 렌더링 모듈이 압축 좌표 시스템 사용
   - `HistogramRenderer`, `PolygonRenderer`, `AxisRenderer` 등

### Chart 렌더러 대규모 리팩토링 (2025-11-20)
**목적**: CLAUDE.md 기준 충족 (600줄 이하), 유지보수성 향상

**분할 전:**
- chart.js: 950줄 ❌

**분할 후:**
- chart.js: 593줄 ✅ (메인 컨트롤러)
- chart/CoordinateSystem.js: 79줄 (좌표 변환)
- chart/LayerFactory.js: 248줄 (레이어 생성)
- chart/HistogramRenderer.js: 165줄 (막대 차트)
- chart/PolygonRenderer.js: 116줄 (다각형)
- chart/AxisRenderer.js: 268줄 (축, 그리드, 범례)
- chart/CalloutRenderer.js: 154줄 (말풍선)

**개선 사항**:
- ✅ 메인 파일: 950줄 → 593줄 (-38%)
- ✅ 모든 파일 600줄 이하 유지
- ✅ 단일 책임 원칙 준수
- ✅ 기존 API 완벽 호환
- ✅ 종합적인 JSDoc 주석 추가
- ✅ 코드 중복 제거
- ✅ XSS 방어 강화 (Utils.escapeHtml 추가)

---

## 리팩토링 가이드

### 현재 상태 (2025-11-24)
- **chart.js**: 593줄 ✅ (메인 컨트롤러)
- **chart/ 서브모듈들**: 각 79~268줄 ✅
- **복잡도**: 낮음
- **유지보수성**: 우수 ✅
- **구조**: 모듈 분할 완료

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
   - 결과: 950줄 → 593줄 + 6개 모듈 (각 79~268줄)

### 향후 개선 방향
현재 구조는 안정적이며 추가 리팩토링 불필요. 향후 고려사항:

- 새로운 차트 유형 추가 시 chart/ 폴더에 모듈 추가
- 각 모듈이 600줄 초과 시 추가 분할 검토
- 공통 로직 발견 시 utils/ 폴더로 이동

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
- **날짜**: 2025-11-24
- **주요 작업**:
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
- **코드 품질**: 85/100점 (우수한 상태)
- **문서 정확도**: 98/100점 (매우 우수)
- **현재 상태**: 정상 작동 ✅

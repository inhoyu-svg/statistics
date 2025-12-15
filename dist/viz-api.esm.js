/**
 * 전역 설정 상수
 * 모든 매직 넘버와 설정 값을 관리
 */

const CONFIG = {
  // 데이터 제한
  MAX_DATA_POINTS: 10000,
  MIN_DATA_POINTS: 2,

  // 계급 설정
  MIN_CLASS_COUNT: 3,
  MAX_CLASS_COUNT: 20,
  MIN_CLASS_WIDTH: 0.1,

  // 차트 설정
  CHART_PADDING: 60,
  CHART_Y_SCALE_MULTIPLIER: 1.2,
  CHART_BAR_WIDTH_RATIO: 1.0,
  CHART_BAR_CENTER_OFFSET: 0.5,
  CHART_POLYGON_START_OFFSET: -0.5,
  CHART_POLYGON_END_OFFSET: 0.9,
  CHART_POINT_RADIUS: 5,
  CHART_GRID_DIVISIONS: 10,
  CHART_LABEL_OFFSET: 5,

  // 차트 레이아웃 오프셋
  CHART_Y_LABEL_OFFSET: 10,
  CHART_X_LABEL_Y_OFFSET: 20,
  CHART_ELLIPSIS_Y_OFFSET: 10,
  CHART_X_TITLE_Y_OFFSET: 10,
  CHART_Y_TITLE_X_OFFSET: 15,

  // 중략 판단 기준
  ELLIPSIS_THRESHOLD: 2,
  ELLIPSIS_POSITION_RATIO: 0.25, // 압축 구간에서 이중물결 기호 위치 (0~1 사이 값)

  // 차트 폰트 설정 (500 = Medium, 300 = Light)
  CHART_FONT_SMALL: "300 11px 'SCDream', sans-serif",
  CHART_FONT_REGULAR: "300 12px 'SCDream', sans-serif",
  CHART_FONT_BOLD: "300 14px 'SCDream', sans-serif",
  CHART_FONT_LARGE: "300 16px 'SCDream', sans-serif",

  // 소수점 자릿수
  DECIMAL_PLACES: 2,

  // 메시지 표시 시간
  MESSAGE_DISPLAY_TIME: 5000,

  // Canvas 기본 크기
  CANVAS_WIDTH: 700,
  CANVAS_HEIGHT: 450,

  // 차트 폰트 스케일링 설정
  BASE_CANVAS_SIZE: 600,              // 기준 캔버스 크기 (이 크기에서 폰트가 기본 크기)
  _currentCanvasSize: 600,            // 현재 캔버스 크기 (동적으로 업데이트됨)

  // 테이블 타입 설정
  TABLE_TYPES: {
    BASIC_TABLE: 'basic-table',          // 기본 테이블 (구 이원 분류표)
    CATEGORY_MATRIX: 'category-matrix',  // 카테고리 행렬
    STEM_LEAF: 'stem-leaf',              // 줄기-잎 그림
    // deprecated (v3.0에서 제거 예정)
    FREQUENCY: 'frequency',              // → chart로 자동 전환
    CROSS_TABLE: 'cross-table'           // → BASIC_TABLE 별칭
  },

  // 테이블 타입별 정보
  TABLE_TYPE_INFO: {
    'basic-table': {
      name: '기본 테이블',
      description: '행/열 헤더가 있는 기본 테이블',
      placeholder: '헤더: 혈액형, 남학생, 여학생\nA: 0.4, 0.4\nB: 0.22, 0.2\nAB: 0.12, 0.16\nO: 0.26, 0.24',
      hint: '첫 줄에 "헤더: 행라벨명, 열이름들", 이후 "행이름: 값들" 형식으로 입력',
      defaultData: '헤더: 혈액형, 남학생, 여학생\nA: 0.4, 0.4\nB: 0.22, 0.2\nAB: 0.12, 0.16\nO: 0.26, 0.24'
    },
    'category-matrix': {
      name: '카테고리 행렬',
      description: '카테고리별 데이터 비교',
      placeholder: '헤더: A, B, C, D, E\n전체 학생 수 (명): 200, 250, 300, 350, 400\nO형인 학생 수 (명): 50, 60, 70, 80, 90',
      hint: '첫 줄에 "헤더: 값들", 이후 "라벨: 값들" 형식으로 입력',
      defaultData: '헤더: A, B, C, D, E\n전체 학생 수 (명): 200, 250, 300, 350, 400\nO형인 학생 수 (명): 50, 60, 70, 80, 90'
    },
    'stem-leaf': {
      name: '줄기-잎 그림',
      description: '데이터 분포를 줄기와 잎으로 시각화',
      placeholder: '숫자만 입력 (단일) 또는\n남학생: 162 178 175...\n여학생: 160 165 170... (비교)',
      hint: '숫자만: 단일 줄기-잎 / "라벨: 숫자들": 비교형 줄기-잎',
      defaultData: '남학생: 162 178 175 174 189 186 183 183 181 197 194 191 190 209 205\n여학생: 160 165 170 177 180 182 184 188 192 193 196 201 207'
    },
    // deprecated - 하위 호환성용 (v3.0에서 제거 예정)
    'frequency': {
      name: '도수분포표',
      description: '숫자 데이터를 계급별로 분류 (chart로 자동 전환)',
      placeholder: '62, 87, 97, 73, 59, 85, 80, 79, 65, 75',
      hint: '숫자를 쉼표 또는 공백으로 구분하여 입력',
      defaultData: '62 87 97 73 59 85 80 79 65 75'
    },
    'cross-table': null  // → basic-table로 리다이렉트
  },

  // 기본 테이블 타입
  DEFAULT_TABLE_TYPE: 'basic-table',

  // 테이블 Canvas 설정
  TABLE_CANVAS_WIDTH: 700,
  TABLE_DEFAULT_WIDTH: 600,          // viz-api 테이블 기본 너비
  TABLE_DEFAULT_HEIGHT: 400,         // viz-api 테이블 기본 높이
  TABLE_MIN_WIDTH: 300,              // 동적 너비 최소값
  TABLE_MAX_WIDTH: 700,              // 동적 너비 최대값 (TABLE_CANVAS_WIDTH와 동일)
  TABLE_ROW_HEIGHT: 40,
  TABLE_ROW_HEIGHT_FRACTION: 52,    // 분수가 포함된 행 높이
  TABLE_HEADER_HEIGHT: 45,
  TABLE_PADDING: 10,
  TABLE_FONT_HEADER: "500 18px 'SCDream', sans-serif",   // Medium (녹색 텍스트)
  TABLE_FONT_DATA: "300 18px 'SCDream', sans-serif",     // Light (흰색 텍스트)
  TABLE_FONT_SUMMARY: "300 18px 'SCDream', sans-serif",  // Light (흰색 텍스트)
  TABLE_SHOW_SUPERSCRIPT: true, // 첫 계급에 상첨자(이상/미만) 표시 여부
  TABLE_SHOW_SUMMARY_ROW: true, // 합계 행 표시 여부 (도수분포표, 이원분류표)
  TABLE_SUPERSCRIPT_Y_OFFSET: 4, // 상첨자 위치 오프셋 (위로 이동)

  // 테이블 격자선 및 셀 설정
  TABLE_GRID_COLOR_LIGHT: '#888888',      // 밝은 격자선 (헤더/합계 구분선)
  TABLE_GRID_COLOR_DARK: '#555555',       // 어두운 격자선 (데이터 행 구분선)
  TABLE_HEADER_TEXT_COLOR: '#8DCF66',     // 헤더 텍스트 색상
  TABLE_CELL_PADDING: 8,                  // 셀 내부 패딩
  TABLE_STEM_LEAF_PADDING: 20,            // 줄기-잎 데이터 셀 패딩 (세로선과의 간격)
  TABLE_GRID_DASH_PATTERN: [5, 3],        // 수직 점선 패턴 [선, 간격]
  TABLE_EMPTY_CANVAS_HEIGHT: 100,         // 빈 테이블 캔버스 높이
  TABLE_FONT_SUPERSCRIPT: "300 11px 'SCDream', sans-serif", // 상첨자 폰트 (Light)

  // 테이블 문자열 상수
  TABLE_SUPERSCRIPT_MIN_TEXT: '이상',      // 상첨자 최솟값 텍스트
  TABLE_SUPERSCRIPT_MAX_TEXT: '미만',      // 상첨자 최댓값 텍스트
  TABLE_CLASS_SEPARATOR: ' ~ ',           // 계급 구분자
  TABLE_NO_DATA_MESSAGE: '데이터가 없습니다', // 데이터 없음 메시지

  // 탈리마크 선 그리기 설정 (Canvas 직접 그리기)
  TALLY_LINE_WIDTH: 2,          // 탈리 선 두께
  TALLY_LINE_HEIGHT: 16,        // 탈리 선 높이
  TALLY_LINE_SPACING: 6,        // 선 간격
  TALLY_GROUP_SPACING: 12,      // 5개 묶음 간격

  // 차트 선 너비
  CHART_LINE_WIDTH_THIN: 1,               // 얇은 선 (격자선)
  CHART_LINE_WIDTH_NORMAL: 2,             // 보통 선 (막대 테두리)
  CHART_LINE_WIDTH_THICK: 3,              // 두꺼운 선 (다각형)
  CHART_LINE_WIDTH_DASHED: 1.5,           // 파선 너비
  CHART_DASHED_PATTERN: [5, 5],           // 파선 패턴 [선, 간격]

  // 축 문자열 상수
  AXIS_ELLIPSIS_SYMBOL: '≈',              // 이중물결 기호

  // 기본 라벨 (고급 설정) - 축 끝 라벨링용 괄호 포함
  DEFAULT_LABELS: {
    xAxis: '(계급)',
    yAxis: '(상대도수)',
    table: {
      class: '계급',
      midpoint: '계급값',
      tally: '탈리',
      frequency: '도수',
      relativeFrequency: '상대도수(%)',
      cumulativeFrequency: '누적도수',
      cumulativeRelativeFrequency: '누적상대도수(%)'
    }
  },

  // 테이블 기본 컬럼 설정
  // 인덱스: [계급, 계급값, 탈리, 도수, 상대도수, 누적도수, 누적상대도수]
  TABLE_DEFAULT_VISIBLE_COLUMNS: [true, false, false, true, true, false, false], // 계급값, 탈리, 누적도수, 누적상대도수 숨김
  TABLE_DEFAULT_COLUMN_ORDER: [0, 1, 2, 3, 4, 5, 6],

  // 범위 밖 데이터 미리보기 최대 개수
  OUT_OF_RANGE_MAX_DISPLAY: 10,

  // 테이블 컬럼별 기본 정렬
  TABLE_DEFAULT_ALIGNMENT: {
    '계급': 'center',
    '계급값': 'center',
    '탈리': 'center',
    '도수': 'center',
    '상대도수(%)': 'center',
    '누적도수': 'center',
    '누적상대도수(%)': 'center'
  },

  // 차트 데이터 타입 설정 (확장 가능)
  CHART_DATA_TYPES: [
    {
      id: 'relativeFrequency',
      label: '상대도수 (%)',
      yAxisLabel: '(상대도수)',
      legendSuffix: '상대도수'
    },
    {
      id: 'frequency',
      label: '도수',
      yAxisLabel: '(도수)',
      legendSuffix: '도수'
    }
    // 향후 확장 가능:
    // { id: 'cumulativeFrequency', label: '누적도수', yAxisLabel: '누적도수', legendSuffix: '누적도수' },
    // { id: 'cumulativeRelativeFrequency', label: '누적상대도수 (%)', yAxisLabel: '누적상대도수(%)', legendSuffix: '누적상대도수' }
  ],

  // 기본 차트 데이터 타입
  DEFAULT_CHART_DATA_TYPE: 'relativeFrequency',

  // 말풍선 설정
  CALLOUT_ENABLED: false,                   // 말풍선 표시 여부 (기본값)
  CALLOUT_WIDTH: 73,                        // 말풍선 너비
  CALLOUT_HEIGHT: 36,                       // 말풍선 높이
  CALLOUT_OFFSET_X: 10,                     // 포인트에서 왼쪽으로 오프셋
  CALLOUT_OFFSET_Y: 10,                     // 포인트에서 위로 오프셋
  CALLOUT_PADDING: 8,                       // 내부 패딩
  CALLOUT_FONT: "500 20px 'SCDream', sans-serif",       // 폰트 (Medium)
  CALLOUT_LINE_HEIGHT: 20,                  // 줄 간격
  CALLOUT_TEMPLATE: '남학생',                // 기본 템플릿
  CALLOUT_ACCENT_BAR_WIDTH: 4,              // 오른쪽 세로 막대 너비

  // 말풍선 세로 막대 색상 (다각형 프리셋별)
  CALLOUT_ACCENT_COLORS: {
    default: '#89EC4E',
    primary: '#008AFF',
    secondary: '#E749AF',
    tertiary: '#FF764F'
  },

  // 말풍선 텍스트 색상 (세로 막대와 동일)
  CALLOUT_TEXT_COLORS: {
    default: '#89EC4E',
    primary: '#008AFF',
    secondary: '#E749AF',
    tertiary: '#FF764F'
  },

  // 말풍선 위치 (차트 왼쪽 상단 고정)
  CALLOUT_POSITION_X: 10,                   // 왼쪽 여백 (CHART_PADDING 기준)
  CALLOUT_POSITION_Y: 10,                   // 상단 여백 (CHART_PADDING 기준)
  CALLOUT_TEXT_WIDTH_RATIO: 0.6,            // 텍스트가 차지하는 너비 비율 (나머지는 여백)

  // 말풍선 연결선 (말풍선 → 최고점)
  CALLOUT_CONNECTOR_LINE_WIDTH: 2,          // 점선 두께
  CALLOUT_CONNECTOR_DASH_PATTERN: [5, 5],   // 점선 패턴 [dash, gap]

  // 차트 요소 표시 설정
  SHOW_HISTOGRAM: true,                     // 히스토그램 표시 여부 (기본값)
  SHOW_POLYGON: true,                       // 도수 다각형 표시 여부 (기본값)

  // 막대 라벨 설정
  SHOW_BAR_LABELS: false,                   // 막대 위 값 표시 여부 (기본값)

  // 막대 내부 커스텀 라벨 설정
  SHOW_BAR_CUSTOM_LABELS: false,            // 막대 내부 커스텀 라벨 표시 여부
  BAR_CUSTOM_LABELS: {},                    // 인덱스별 라벨 (예: {0: 'A', 2: 'B'})
  BAR_CUSTOM_LABEL_FONT_SIZE: 28,           // 라벨 폰트 크기 (기본: 28)
  BAR_CUSTOM_LABEL_COLOR: '#FFFFFF',        // 라벨 색상 (기본: 흰색)

  // 합동 삼각형 설정
  SHOW_CONGRUENT_TRIANGLES: false,          // 합동 삼각형 표시 여부 (기본값)
  CONGRUENT_TRIANGLE_INDEX: 0,              // 표시할 구간 인덱스 (0부터 시작)
  // 삼각형 A (막대 밖) 색상 - 빨간색 그라디언트
  TRIANGLE_A_FILL_START: 'rgba(95, 46, 87, 0.5)',
  TRIANGLE_A_FILL_END: 'rgba(255, 0, 115, 0.5)',
  TRIANGLE_A_STROKE_START: 'rgb(209, 93, 164)',
  TRIANGLE_A_STROKE_END: 'rgb(205, 93, 209)',
  // 삼각형 B (막대 안) - 히스토그램 색상 사용 (CSS 변수)

  // 파선 설정
  SHOW_DASHED_LINES: false,                 // 수직 파선 표시 여부 (기본값)

  // 다각형 색상 프리셋
  POLYGON_COLOR_PRESET: 'default',          // 기본 색상 프리셋
  POLYGON_COLOR_PRESETS: {
    default: {
      gradientStart: '#AEFF7E',
      gradientEnd: '#68994C',
      pointColor: '#8DCF66'
    },
    primary: {
      gradientStart: '#54A0F6',
      gradientEnd: '#6DE0FC',
      pointColor: '#61C1F9'
    },
    secondary: {
      gradientStart: '#D15DA4',
      gradientEnd: '#E178F2',
      pointColor: '#D96BCB'
    },
    tertiary: {
      gradientStart: '#F3A257',
      gradientEnd: '#FA716F',
      pointColor: '#F68D61'
    }
  },

  // 히스토그램 색상 프리셋
  HISTOGRAM_COLOR_PRESET: 'default',
  HISTOGRAM_COLOR_PRESETS: {
    default: {
      fillStart: '#4141A3',
      fillEnd: '#2CA0E8',
      strokeStart: '#54A0F6',
      strokeEnd: '#6DE0FC',
      alpha: 0.5
    },
    green: {
      fillStart: '#AEFF7E',
      fillEnd: '#68994C',
      strokeStart: '#AEFF7E',
      strokeEnd: '#68994C',
      alpha: 0.3
    }
  },

  // 격자선 설정
  GRID_SHOW_HORIZONTAL: true,               // 가로 격자선 표시 여부
  GRID_SHOW_VERTICAL: true,                 // 세로 격자선 표시 여부

  // 축 라벨 설정
  AXIS_SHOW_Y_LABELS: true,                 // Y축 값 라벨 표시 여부 (파선 끝점)
  AXIS_SHOW_X_LABELS: true,                 // X축 값 라벨 표시 여부
  AXIS_Y_LABEL_FORMAT: 'decimal',           // 'decimal' (0.03) 또는 'percent' (3%)

  // 투명도 설정
  CHART_BAR_ALPHA: 0.5,                     // 막대 투명도
  CHART_DEFAULT_ALPHA: 1.0,                 // 기본 투명도
  CALLOUT_BG_ALPHA: 0.3,                    // 말풍선 배경 투명도

  // 애니메이션 타이밍 (차트)
  ANIMATION_BAR_DURATION: 300,              // 막대 애니메이션 시간 (ms)
  ANIMATION_POINT_DURATION: 300,            // 점 애니메이션 시간 (ms)
  ANIMATION_CLASS_DELAY: 150,               // 계급 간 딜레이 (ms)
  ANIMATION_LINE_DURATION: 400,             // 선 드로잉 시간 (ms)
  ANIMATION_LINE_DELAY: 50,                 // 선 간 딜레이 (ms)
  ANIMATION_LINE_START_DELAY: 200,          // 선 시작 전 대기 시간 (ms)
  ANIMATION_CALLOUT_DELAY: 100,             // 말풍선 시작 전 대기 시간 (ms)

  // 테이블 애니메이션
  TABLE_ANIMATION_ROW_INTERVAL: 200,        // 행 간 애니메이션 간격 (ms)
  TABLE_ANIMATION_ROW_DURATION: 300,        // 행 애니메이션 시간 (ms)

  // 레이어 패널
  LAYER_DEPTH_OFFSET: 20,                   // 레이어 깊이당 들여쓰기 (px)

  // JSON 직렬화 기본값 (경량화용)
  JSON_DEFAULTS: {
    layer: {
      visible: true,
      order: 0,
      p_id: null
    },
    animation: {
      startTime: 0,
      duration: 1000,
      effect: 'auto',
      easing: 'linear'
    },
    chartElements: {
      showHistogram: true,
      showPolygon: true,
      showBarLabels: false,
      showDashedLines: false
    },
    gridSettings: {
      showHorizontal: true,
      showVertical: true
    },
    axisLabelSettings: {
      showYLabels: true,
      showXLabels: true
    },
    colorPreset: 'default',
    timeline: {
      currentTime: 0,
      duration: 0
    }
  },

  // 색상 캐시 (성능 최적화)
  _colorCache: null,

  // CSS 색상 초기화 (앱 시작 시 한 번만 호출)
  initializeColors() {
    if (this._colorCache) return;

    this._colorCache = {
      '--color-text': '#e5e7eb',
      '--color-grid-vertical': '#555555',
      '--color-grid-horizontal': '#888888',
      '--color-axis': '#888888',
      '--color-ellipsis': '#555555',
      '--color-border': '#374151',
      '--chart-bar-color': '#4141A3',
      '--chart-bar-color-end': '#2CA0E8',
      '--chart-bar-stroke-start': '#54A0F6',
      '--chart-bar-stroke-end': '#6DE0FC',
      '--chart-polygon-point-color': '#93DA6A',
      '--chart-polygon-line-start': '#AEFF7E',
      '--chart-polygon-line-end': '#68994C',
      '--chart-dashed-line-color': '#54A0F6',
      '--chart-callout-bg-start': 'rgba(255, 255, 255, 0.2)',
      '--chart-callout-bg-end': 'rgba(255, 255, 255, 0.2)',
      '--chart-callout-text': '#93DA6A',
    };
  },

  // CSS 변수에서 색상 가져오기 (캐싱 지원)
  getColor(varName) {
    if (!this._colorCache) {
      this.initializeColors();
    }
    return this._colorCache[varName] || getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  },

  /**
   * 캔버스 크기 설정 (폰트 스케일링용)
   * @param {number} size - 캔버스 크기 (width 또는 height 중 큰 값)
   */
  setCanvasSize(size) {
    this._currentCanvasSize = size || this.BASE_CANVAS_SIZE;
  },

  /**
   * 캔버스 크기에 비례하여 스케일된 폰트 크기 반환
   * @param {number} baseSize - 기준 폰트 크기 (BASE_CANVAS_SIZE 기준)
   * @returns {number} 스케일된 폰트 크기
   */
  getScaledFontSize(baseSize) {
    const scale = this._currentCanvasSize / this.BASE_CANVAS_SIZE;
    return Math.round(baseSize * scale);
  },

  /**
   * 캔버스 크기에 비례하여 스케일된 패딩 반환
   * @returns {number} 스케일된 패딩
   */
  getScaledPadding() {
    const scale = this._currentCanvasSize / this.BASE_CANVAS_SIZE;
    return Math.round(this.CHART_PADDING * scale);
  },

  /**
   * 캔버스 크기에 비례하여 스케일된 값 반환 (범용)
   * @param {number} baseValue - 기준 값 (BASE_CANVAS_SIZE 기준)
   * @returns {number} 스케일된 값
   */
  getScaledValue(baseValue) {
    const scale = this._currentCanvasSize / this.BASE_CANVAS_SIZE;
    return baseValue * scale;
  },

  /**
   * 캔버스 크기에 비례하여 스케일된 선 너비 반환
   * @param {string} type - 'thin', 'normal', 'thick', 'dashed'
   * @returns {number} 스케일된 선 너비
   */
  getScaledLineWidth(type = 'normal') {
    const scale = this._currentCanvasSize / this.BASE_CANVAS_SIZE;
    const widths = {
      thin: this.CHART_LINE_WIDTH_THIN,
      normal: this.CHART_LINE_WIDTH_NORMAL,
      thick: this.CHART_LINE_WIDTH_THICK,
      dashed: this.CHART_LINE_WIDTH_DASHED
    };
    return (widths[type] || widths.normal) * scale;
  },

  /**
   * 캔버스 크기에 비례하여 스케일된 점 반지름 반환
   * @returns {number} 스케일된 점 반지름
   */
  getScaledPointRadius() {
    const scale = this._currentCanvasSize / this.BASE_CANVAS_SIZE;
    return this.CHART_POINT_RADIUS * scale;
  },

  /**
   * 캔버스 크기에 비례하여 스케일된 파선 패턴 반환
   * @returns {Array} 스케일된 파선 패턴
   */
  getScaledDashPattern() {
    const scale = this._currentCanvasSize / this.BASE_CANVAS_SIZE;
    return this.CHART_DASHED_PATTERN.map(v => v * scale);
  },

  /**
   * 캔버스 크기에 비례하여 스케일된 말풍선 연결선 너비 반환
   * @returns {number} 스케일된 선 너비
   */
  getScaledCalloutLineWidth() {
    const scale = this._currentCanvasSize / this.BASE_CANVAS_SIZE;
    return this.CALLOUT_CONNECTOR_LINE_WIDTH * scale;
  },

  /**
   * 캔버스 크기에 비례하여 스케일된 말풍선 연결선 파선 패턴 반환
   * @returns {Array} 스케일된 파선 패턴
   */
  getScaledCalloutDashPattern() {
    const scale = this._currentCanvasSize / this.BASE_CANVAS_SIZE;
    return this.CALLOUT_CONNECTOR_DASH_PATTERN.map(v => v * scale);
  },

  /**
   * 캔버스 크기에 비례하여 스케일된 말풍선 세로 막대 너비 반환
   * @returns {number} 스케일된 너비
   */
  getScaledCalloutAccentBarWidth() {
    const scale = this._currentCanvasSize / this.BASE_CANVAS_SIZE;
    return this.CALLOUT_ACCENT_BAR_WIDTH * scale;
  },

  /**
   * 캔버스 크기에 비례하여 스케일된 말풍선 줄 높이 반환
   * @returns {number} 스케일된 줄 높이
   */
  getScaledCalloutLineHeight() {
    const scale = this._currentCanvasSize / this.BASE_CANVAS_SIZE;
    return this.CALLOUT_LINE_HEIGHT * scale;
  },

  /**
   * 캔버스 크기에 비례하여 스케일된 말풍선 크기 반환
   * @returns {{width: number, height: number}} 스케일된 말풍선 크기
   */
  getScaledCalloutSize() {
    const scale = this._currentCanvasSize / this.BASE_CANVAS_SIZE;
    return {
      width: this.CALLOUT_WIDTH * scale,
      height: this.CALLOUT_HEIGHT * scale
    };
  },

  /**
   * 그리드 설정 계산 (스마트 격자)
   * @param {number} maxValue - 최대값
   * @param {string} dataType - 데이터 타입
   * @returns {{maxY: number, divisions: number}} 조정된 최대값과 분할 수
   */
  calculateGridDivisions(maxValue, dataType) {
    // 상대도수 모드: 기존대로 10칸, maxY는 원래 값 사용
    if (dataType !== 'frequency') {
      return {
        maxY: maxValue,
        divisions: this.CHART_GRID_DIVISIONS
      };
    }

    // 도수 모드: 최대값 + 2칸 여유
    const targetMax = Math.ceil(maxValue) + 2;

    // "좋은 숫자" 간격 후보 (1, 2, 5, 10, 20, 50, 100, ...)
    const niceIntervals = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];

    // 목표: 5~10칸 사이로 분할
    const minDivisions = 5;
    const maxDivisions = 10;

    for (let interval of niceIntervals) {
      const divisions = Math.ceil(targetMax / interval);
      if (divisions >= minDivisions && divisions <= maxDivisions) {
        return {
          maxY: divisions * interval,
          divisions: divisions
        };
      }
    }

    // 적절한 간격을 찾지 못한 경우: targetMax를 그대로 사용
    const fallbackDivisions = Math.min(targetMax, 20);
    return {
      maxY: fallbackDivisions,
      divisions: fallbackDivisions
    };
  },

  // ============================================================
  // 산점도 (Scatter Plot) 설정
  // ============================================================

  // 산점도 기본 설정
  SCATTER_PADDING: 80,                    // 캔버스 패딩 (X축 라벨 공간 확보)
  SCATTER_POINT_RADIUS: 6,                // 점 반지름
  SCATTER_POINT_COLOR: '#93DA6A',         // 점 색상 (기본)
  SCATTER_GRID_COLOR: '#444444',          // 그리드선 색상
  SCATTER_AXIS_COLOR: '#888888',          // 축선 색상
  SCATTER_LABEL_COLOR: '#e5e7eb',         // 라벨 색상

  // 산점도 폰트 설정
  SCATTER_FONT_LABEL: "300 14px 'SCDream', sans-serif",
  SCATTER_FONT_TITLE: "500 16px 'SCDream', sans-serif",

  // 산점도 캔버스 기본 크기
  SCATTER_DEFAULT_WIDTH: 650,
  SCATTER_DEFAULT_HEIGHT: 700,

  // 산점도 그리드 설정
  SCATTER_GRID_LINE_WIDTH: 1,             // 그리드선 두께
  SCATTER_AXIS_LINE_WIDTH: 2,             // 축선 두께

  /**
   * 두 숫자의 최대공약수(GCD) 계산
   * @param {number} a - 첫 번째 숫자
   * @param {number} b - 두 번째 숫자
   * @returns {number} 최대공약수
   */
  gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b > 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }
};

/**
 * 유틸리티 함수 모음
 */


class Utils {
  /**
   * 숫자를 지정된 소수점 자릿수로 포맷
   */
  static formatNumber(num, decimals = CONFIG.DECIMAL_PLACES) {
    return Number(num).toFixed(decimals);
  }

  /**
   * 숫자를 포맷하고 불필요한 뒤의 0 제거
   * @param {number} num - 포맷할 숫자
   * @param {number} decimals - 소수점 자릿수
   * @returns {string} 포맷된 숫자 (뒤의 0 제거: 4.20 → 4.2, 4.00 → 4)
   */
  static formatNumberClean(num, decimals = CONFIG.DECIMAL_PLACES) {
    return parseFloat(Number(num).toFixed(decimals)).toString();
  }

  /**
   * 배열이 비어있는지 확인
   */
  static isEmpty(arr) {
    return !arr || arr.length === 0;
  }

  /**
   * 숫자 범위 검증
   */
  static isInRange(value, min, max) {
    return value >= min && value <= max;
  }

  /**
   * HTML 특수문자 이스케이프 (XSS 방어)
   * @param {string} text - 이스케이프할 텍스트
   * @returns {string} 이스케이프된 텍스트
   */
  static escapeHtml(text) {
    if (text === null || text === undefined) return '';

    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  /**
   * 계급명 생성 헬퍼 (min~max 형식)
   * @param {Object} classData - 계급 데이터 ({ min, max })
   * @returns {string} 계급명 (예: "140~150")
   */
  static getClassName(classData) {
    return `${classData.min}~${classData.max}`;
  }

  /**
   * 수직 그라디언트 생성 (Canvas)
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {number} x - 시작 X 좌표
   * @param {number} y - 시작 Y 좌표
   * @param {number} height - 그라디언트 높이
   * @param {string} startColor - 시작 색상
   * @param {string} endColor - 끝 색상
   * @returns {CanvasGradient} 그라디언트 객체
   */
  static createVerticalGradient(ctx, x, y, height, startColor, endColor) {
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);
    return gradient;
  }

  /**
   * 선 그라디언트 생성 (Canvas) - 두 점 사이
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {number} x1 - 시작 X
   * @param {number} y1 - 시작 Y
   * @param {number} x2 - 끝 X
   * @param {number} y2 - 끝 Y
   * @param {string} startColor - 시작 색상
   * @param {string} endColor - 끝 색상
   * @returns {CanvasGradient} 그라디언트 객체
   */
  static createLineGradient(ctx, x1, y1, x2, y2, startColor, endColor) {
    const gradient = ctx.createLinearGradient(x1, Math.min(y1, y2), x2, Math.max(y1, y2));
    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);
    return gradient;
  }

  /**
   * 타임스탬프 문자열 생성 (YYYYMMDD-HHmmss 형식)
   * @param {Date} date - Date 객체 (기본값: 현재 시간)
   * @returns {string} 포맷된 타임스탬프
   */
  static formatTimestamp(date = new Date()) {
    return date.getFullYear() +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0') + '-' +
      String(date.getHours()).padStart(2, '0') +
      String(date.getMinutes()).padStart(2, '0') +
      String(date.getSeconds()).padStart(2, '0');
  }

  /**
   * 상대도수 포맷팅 (설정에 따라 백분율 또는 소수)
   * @param {number} percentValue - 백분율 값 (예: 15 = 15%)
   * @param {string} format - 'percent' 또는 'decimal'
   * @returns {string} 포맷된 문자열
   */
  static formatRelativeFrequency(percentValue, format = 'percent') {
    if (format === 'percent') {
      // 백분율 형식: 15%
      return `${this.formatNumberClean(percentValue)}%`;
    } else {
      // 소수 형식: 0.15
      const decimalValue = percentValue / 100;
      return this.formatDecimalValue(decimalValue);
    }
  }

  /**
   * LaTeX 분수 문자열 생성
   * @param {number} numerator - 분자
   * @param {number} denominator - 분모
   * @returns {string} LaTeX 분수 문자열 (예: \frac{2}{9})
   */
  static toLatexFrac(numerator, denominator) {
    return `\\frac{${numerator}}{${denominator}}`;
  }

  /**
   * 소수 값 포맷팅 (끝자리 0 생략, 무한소수 처리)
   * @param {number} value - 소수 값 (예: 0.15)
   * @returns {string} 포맷된 문자열
   */
  static formatDecimalValue(value) {
    // 정수인 경우 (1, 0 등)
    if (Number.isInteger(value)) {
      return String(value);
    }

    // 소수점 4자리까지 확인하여 무한소수 판별
    const str4 = value.toFixed(4);
    const decimal4 = str4.split('.')[1];

    // 같은 숫자가 반복되는지 확인 (예: 3333, 6666)
    const isRepeating = decimal4 && /^(\d)\1{3}$/.test(decimal4);

    if (isRepeating) {
      // 무한소수: 0.33..
      const str2 = value.toFixed(2);
      return `${str2}..`;
    }

    // 일반 소수: 끝자리 0 생략
    const str = value.toFixed(CONFIG.DECIMAL_PLACES);
    // 끝자리 0 제거 (0.30 → 0.3, 0.10 → 0.1, 0.00 → 0)
    return str.replace(/\.?0+$/, '') || '0';
  }

}

/**
 * UI 메시지 관리
 */


class MessageManager {
  static show(message, type = 'error') {
    const messageBox = document.getElementById('messageBox');
    if (!messageBox) {
      // messageBox가 없으면 콘솔에만 출력
      console.warn(`[MessageManager] ${type}: ${message}`);
      return;
    }
    messageBox.textContent = message;
    messageBox.className = `message-box show ${type}`;

    // 자동으로 메시지 숨기기
    setTimeout(() => {
      this.hide();
    }, CONFIG.MESSAGE_DISPLAY_TIME);
  }

  static hide() {
    const messageBox = document.getElementById('messageBox');
    if (!messageBox) return;
    messageBox.classList.remove('show');
  }

  static error(message) {
    this.show(message, 'error');
  }

  static success(message) {
    this.show(message, 'success');
  }

  static warning(message) {
    this.show(message, 'warning');
  }
}

/**
 * 데이터 내보내기 (직렬화)
 * 차트 및 테이블 데이터를 JSON으로 변환
 */


class DataExporter {
  /**
   * 차트 및 테이블 데이터를 JSON으로 내보내기
   * @param {Object} chartLayerManager - 차트 레이어 매니저 인스턴스
   * @param {Object} chartTimeline - 차트 타임라인 인스턴스
   * @param {Object} chartRenderer - 차트 렌더러 인스턴스 (좌표 시스템 정보)
   * @param {Array<Object>} tableRenderers - 테이블 렌더러 배열 (옵셔널)
   * @returns {Object} JSON 형식의 차트 및 테이블 데이터
   * @description 레이어 구조와 애니메이션 정보를 JSON으로 직렬화
   */
  static exportData(chartLayerManager, chartTimeline, chartRenderer = null, tableRenderers = []) {
    const defaults = CONFIG.JSON_DEFAULTS;

    // 차트 root 레이어 직렬화
    const chartRootLayer = chartLayerManager.root || chartLayerManager.rootLayer;
    if (!chartRootLayer) {
      throw new Error('Chart root layer not found');
    }

    const serializedChartRoot = this._serializeLayer(chartRootLayer, defaults);

    // 차트 타임라인 애니메이션 정보
    const chartAnimations = this._extractAnimations(chartTimeline, defaults);

    // 차트 설정 정보
    const chartConfig = this._buildChartConfig(chartRenderer, defaults);

    // 테이블 레이어 직렬화
    const tables = this._serializeTables(tableRenderers, defaults);

    // 차트 타임라인 구성
    const chartTimelineData = this._buildTimelineData(chartTimeline, chartAnimations, defaults);

    // 최종 결과 구성
    return this._buildResult(serializedChartRoot, chartTimelineData, chartConfig, tables);
  }

  /**
   * 레이어를 재귀적으로 직렬화 (기본값 생략)
   * @private
   */
  static _serializeLayer(layer, defaults) {
    // 필수 필드만 포함
    const serialized = {
      id: layer.id || 'unknown',
      name: layer.name || layer.id || 'Untitled',
      type: layer.type || 'group'
    };

    // 기본값과 다른 경우만 포함
    const visible = layer.visible !== undefined ? layer.visible : true;
    if (visible !== defaults.layer.visible) {
      serialized.visible = visible;
    }

    const order = layer.order !== undefined ? layer.order : 0;
    if (order !== defaults.layer.order) {
      serialized.order = order;
    }

    const p_id = layer.p_id || null;
    if (p_id !== defaults.layer.p_id) {
      serialized.p_id = p_id;
    }

    // 레이어별 색상 정보 추가
    this._addLayerColor(serialized, layer);

    // 레이어 데이터 추가 (비어있지 않은 경우만)
    if (layer.data && typeof layer.data === 'object' && Object.keys(layer.data).length > 0) {
      serialized.data = { ...layer.data };
    }

    // 자식 레이어 재귀 직렬화 (비어있지 않은 경우만)
    if (layer.children && Array.isArray(layer.children) && layer.children.length > 0) {
      serialized.children = layer.children.map(child => this._serializeLayer(child, defaults));
    }

    return serialized;
  }

  /**
   * 레이어별 색상 정보 추가
   * @private
   */
  static _addLayerColor(serialized, layer) {
    const currentPreset = CONFIG.POLYGON_COLOR_PRESETS[CONFIG.POLYGON_COLOR_PRESET] || CONFIG.POLYGON_COLOR_PRESETS.default;

    if (layer.id === 'polygon') {
      serialized.color = `linear-gradient(180deg, ${currentPreset.gradientStart} 0%, ${currentPreset.gradientEnd} 100%)`;
    } else if (layer.id === 'points') {
      serialized.color = currentPreset.pointColor;
    } else if (layer.id === 'lines') {
      serialized.color = `linear-gradient(180deg, ${currentPreset.gradientStart} 0%, ${currentPreset.gradientEnd} 100%)`;
    } else if (layer.id === 'histogram') {
      const barColorStart = CONFIG.getColor('--chart-bar-color');
      const barColorEnd = CONFIG.getColor('--chart-bar-color-end');
      serialized.color = `linear-gradient(180deg, ${barColorStart} 0%, ${barColorEnd} 100%)`;
    } else if (layer.id === 'dashed-lines') {
      serialized.color = CONFIG.getColor('--chart-dashed-line-color');
    }
  }

  /**
   * 타임라인에서 애니메이션 추출
   * @private
   */
  static _extractAnimations(timeline, defaults) {
    let animations = [];

    if (timeline.animations instanceof Map) {
      animations = Array.from(timeline.animations.entries())
        .map(([layerId, anim]) => this._normalizeAnimation(anim, layerId, defaults));
    } else if (Array.isArray(timeline.animations)) {
      animations = timeline.animations.map(anim => this._normalizeAnimation(anim, null, defaults));
    } else if (Array.isArray(timeline.timeline)) {
      animations = timeline.timeline.map(anim => this._normalizeAnimation(anim, null, defaults));
    }

    return animations;
  }

  /**
   * 애니메이션 객체 정규화 (기본값 생략)
   * @private
   */
  static _normalizeAnimation(anim, layerId, defaults) {
    const result = {
      layerId: layerId || anim.layerId
    };

    const startTime = anim.startTime || 0;
    if (startTime !== defaults.animation.startTime) {
      result.startTime = startTime;
    }

    const duration = anim.duration || 1000;
    if (duration !== defaults.animation.duration) {
      result.duration = duration;
    }

    const effect = anim.effect || 'auto';
    if (effect !== defaults.animation.effect) {
      result.effect = effect;
    }

    // effectOptions: 비어있지 않은 경우만 포함
    if (anim.effectOptions && Object.keys(anim.effectOptions).length > 0) {
      result.effectOptions = anim.effectOptions;
    }

    const easing = anim.easing || 'linear';
    if (easing !== defaults.animation.easing) {
      result.easing = easing;
    }

    return result;
  }

  /**
   * 차트 설정 정보 빌드
   * @private
   */
  static _buildChartConfig(chartRenderer, defaults) {
    if (!chartRenderer) return {};

    const chartConfig = {};

    // 좌표 시스템 정보
    if (chartRenderer.currentCoords) {
      chartConfig.coords = {
        xScale: chartRenderer.currentCoords.xScale,
        chartH: chartRenderer.currentCoords.chartH,
        gridDivisions: chartRenderer.currentCoords.gridDivisions,
        adjustedMaxY: chartRenderer.currentCoords.adjustedMaxY
      };
    }

    // 축 라벨
    if (chartRenderer.currentAxisLabels) {
      chartConfig.axisLabels = chartRenderer.currentAxisLabels;
    }

    // 데이터 타입
    if (chartRenderer.currentDataType) {
      chartConfig.dataType = chartRenderer.currentDataType;
    }

    // 중략 정보
    if (chartRenderer.currentEllipsisInfo) {
      chartConfig.ellipsisInfo = chartRenderer.currentEllipsisInfo;
    }

    // 차트 요소 표시 설정
    this._addChartElements(chartConfig, defaults);

    // 격자선 설정
    this._addGridSettings(chartConfig, defaults);

    // 축 라벨 설정
    this._addAxisLabelSettings(chartConfig, defaults);

    // 색상 프리셋 정보
    if (CONFIG.POLYGON_COLOR_PRESET !== defaults.colorPreset) {
      chartConfig.colorPreset = CONFIG.POLYGON_COLOR_PRESET;
    }

    // 캔버스 크기
    if (chartRenderer.canvas) {
      chartConfig.canvasSize = {
        width: chartRenderer.canvas.width,
        height: chartRenderer.canvas.height
      };
    }

    // 테이블 데이터
    if (chartRenderer.currentClasses && chartRenderer.currentTableConfig) {
      const total = chartRenderer.currentClasses.reduce((sum, c) => sum + c.frequency, 0);
      chartConfig.tableData = {
        classes: chartRenderer.currentClasses,
        total: total,
        config: chartRenderer.currentTableConfig
      };
    }

    return chartConfig;
  }

  /**
   * 차트 요소 표시 설정 추가
   * @private
   */
  static _addChartElements(chartConfig, defaults) {
    const chartElements = {};
    if (CONFIG.SHOW_HISTOGRAM !== defaults.chartElements.showHistogram) {
      chartElements.showHistogram = CONFIG.SHOW_HISTOGRAM;
    }
    if (CONFIG.SHOW_POLYGON !== defaults.chartElements.showPolygon) {
      chartElements.showPolygon = CONFIG.SHOW_POLYGON;
    }
    if (CONFIG.SHOW_BAR_LABELS !== defaults.chartElements.showBarLabels) {
      chartElements.showBarLabels = CONFIG.SHOW_BAR_LABELS;
    }
    if (CONFIG.SHOW_DASHED_LINES !== defaults.chartElements.showDashedLines) {
      chartElements.showDashedLines = CONFIG.SHOW_DASHED_LINES;
    }
    if (Object.keys(chartElements).length > 0) {
      chartConfig.chartElements = chartElements;
    }
  }

  /**
   * 격자선 설정 추가
   * @private
   */
  static _addGridSettings(chartConfig, defaults) {
    const gridSettings = {};
    if (CONFIG.GRID_SHOW_HORIZONTAL !== defaults.gridSettings.showHorizontal) {
      gridSettings.showHorizontal = CONFIG.GRID_SHOW_HORIZONTAL;
    }
    if (CONFIG.GRID_SHOW_VERTICAL !== defaults.gridSettings.showVertical) {
      gridSettings.showVertical = CONFIG.GRID_SHOW_VERTICAL;
    }
    if (Object.keys(gridSettings).length > 0) {
      chartConfig.gridSettings = gridSettings;
    }
  }

  /**
   * 축 라벨 설정 추가
   * @private
   */
  static _addAxisLabelSettings(chartConfig, defaults) {
    const axisLabelSettings = {};
    if (CONFIG.AXIS_SHOW_Y_LABELS !== defaults.axisLabelSettings.showYLabels) {
      axisLabelSettings.showYLabels = CONFIG.AXIS_SHOW_Y_LABELS;
    }
    if (CONFIG.AXIS_SHOW_X_LABELS !== defaults.axisLabelSettings.showXLabels) {
      axisLabelSettings.showXLabels = CONFIG.AXIS_SHOW_X_LABELS;
    }
    if (Object.keys(axisLabelSettings).length > 0) {
      chartConfig.axisLabelSettings = axisLabelSettings;
    }
  }

  /**
   * 테이블 렌더러 배열 직렬화
   * @private
   */
  static _serializeTables(tableRenderers, defaults) {
    const tables = [];

    if (!tableRenderers || tableRenderers.length === 0) {
      return tables;
    }

    tableRenderers.forEach((tableRenderer, index) => {
      try {
        const tableLayerManager = tableRenderer.getLayerManager();
        const tableTimeline = tableRenderer.timeline;

        if (!tableLayerManager) {
          console.warn(`테이블 ${index + 1} LayerManager를 찾을 수 없습니다.`);
          return;
        }

        const tableRootLayer = tableLayerManager.root || tableLayerManager.rootLayer;
        if (!tableRootLayer) {
          console.warn(`테이블 ${index + 1} root 레이어를 찾을 수 없습니다.`);
          return;
        }

        const serializedTableRoot = this._serializeLayer(tableRootLayer, defaults);

        // 테이블 타임라인 애니메이션 정보
        const tableAnimations = tableTimeline ? this._extractAnimations(tableTimeline, defaults) : [];

        // 테이블 데이터 구성
        const tableData = {
          id: tableRenderer.tableId || `table-${index + 1}`,
          canvasId: tableRenderer.canvasId || `frequencyTable-${index + 1}`,
          root: serializedTableRoot
        };

        // 타임라인 추가
        const tableTimelineData = this._buildTimelineData(tableTimeline, tableAnimations, defaults);
        if (Object.keys(tableTimelineData).length > 0) {
          tableData.timeline = tableTimelineData;
        }

        tables.push(tableData);
      } catch (error) {
        console.error(`테이블 ${index + 1} 직렬화 오류:`, error);
      }
    });

    return tables;
  }

  /**
   * 타임라인 데이터 빌드
   * @private
   */
  static _buildTimelineData(timeline, animations, defaults) {
    const timelineData = {};

    if (animations && animations.length > 0) {
      timelineData.animations = animations;
    }

    if (timeline) {
      const currentTime = timeline.currentTime || 0;
      if (currentTime !== defaults.timeline.currentTime) {
        timelineData.currentTime = currentTime;
      }

      const duration = timeline.duration || 0;
      if (duration !== defaults.timeline.duration) {
        timelineData.duration = duration;
      }
    }

    return timelineData;
  }

  /**
   * 최종 결과 객체 빌드
   * @private
   */
  static _buildResult(chartRoot, timelineData, chartConfig, tables) {
    const result = {
      version: '4.0.0',
      chart: {
        root: chartRoot
      }
    };

    // 타임라인 (비어있지 않은 경우만 포함)
    if (Object.keys(timelineData).length > 0) {
      result.chart.timeline = timelineData;
    }

    // config (비어있지 않은 경우만 포함)
    if (Object.keys(chartConfig).length > 0) {
      result.chart.config = chartConfig;
    }

    // 테이블 (비어있지 않은 경우만 포함)
    if (tables.length > 0) {
      result.tables = tables;
    }

    return result;
  }
}

/**
 * 데이터 불러오기 (역직렬화)
 * JSON 데이터를 객체로 복원
 */


class DataImporter {
  /**
   * JSON 데이터 불러오기 (기본값 복원)
   * @param {Object} jsonData - 경량화된 JSON 데이터
   * @returns {Object} 기본값이 복원된 데이터 객체
   * @description 생략된 필드에 기본값을 적용하여 완전한 데이터 구조 복원
   */
  static importData(jsonData) {
    const defaults = CONFIG.JSON_DEFAULTS;
    const version = jsonData.version || '3.0.0';

    // 차트 데이터 복원
    const chartRoot = jsonData.chart?.root
      ? this._deserializeLayer(jsonData.chart.root, defaults)
      : null;

    const chartTimeline = this._deserializeTimeline(jsonData.chart?.timeline, defaults);
    const chartConfig = this._deserializeConfig(jsonData.chart?.config, defaults);

    // 테이블 데이터 복원
    const tables = this._deserializeTables(jsonData.tables, defaults);

    return {
      version,
      chart: {
        root: chartRoot,
        timeline: chartTimeline,
        config: chartConfig
      },
      tables,
      // 원본 데이터 및 테이블 타입 (데이터셋 폼 복원용)
      rawData: jsonData.rawData || null,
      tableType: jsonData.tableType || 'frequency',
      // 커스텀 계급 범위 (설정된 경우에만)
      customRange: jsonData.customRange || null
    };
  }

  /**
   * 레이어 역직렬화 (기본값 적용)
   * @private
   */
  static _deserializeLayer(layerData, defaults) {
    return {
      id: layerData.id,
      name: layerData.name || layerData.id,
      type: layerData.type || 'group',
      visible: layerData.visible ?? defaults.layer.visible,
      order: layerData.order ?? defaults.layer.order,
      p_id: layerData.p_id ?? defaults.layer.p_id,
      color: layerData.color || null,
      children: (layerData.children || []).map(child => this._deserializeLayer(child, defaults)),
      data: layerData.data || {}
    };
  }

  /**
   * 애니메이션 역직렬화 (기본값 적용)
   * @private
   */
  static _deserializeAnimation(anim, defaults) {
    return {
      layerId: anim.layerId,
      startTime: anim.startTime ?? defaults.animation.startTime,
      duration: anim.duration ?? defaults.animation.duration,
      effect: anim.effect ?? defaults.animation.effect,
      effectOptions: anim.effectOptions || {},
      easing: anim.easing ?? defaults.animation.easing
    };
  }

  /**
   * 타임라인 역직렬화
   * @private
   */
  static _deserializeTimeline(timeline, defaults) {
    return {
      animations: (timeline?.animations || []).map(anim => this._deserializeAnimation(anim, defaults)),
      currentTime: timeline?.currentTime ?? defaults.timeline.currentTime,
      duration: timeline?.duration ?? defaults.timeline.duration
    };
  }

  /**
   * 차트 설정 역직렬화 (기본값 병합)
   * @private
   */
  static _deserializeConfig(config, defaults) {
    if (!config) return null;

    return {
      chartElements: {
        ...defaults.chartElements,
        ...config.chartElements
      },
      gridSettings: {
        ...defaults.gridSettings,
        ...config.gridSettings
      },
      axisLabelSettings: {
        ...defaults.axisLabelSettings,
        ...config.axisLabelSettings
      },
      colorPreset: config.colorPreset ?? defaults.colorPreset,
      coords: config.coords || null,
      axisLabels: config.axisLabels || null,
      dataType: config.dataType || null,
      ellipsisInfo: config.ellipsisInfo || null,
      canvasSize: config.canvasSize || null,
      tableData: config.tableData || null
    };
  }

  /**
   * 테이블 배열 역직렬화
   * @private
   */
  static _deserializeTables(tables, defaults) {
    if (!tables || !Array.isArray(tables)) {
      return [];
    }

    return tables.map(table => ({
      id: table.id,
      canvasId: table.canvasId,
      root: this._deserializeLayer(table.root, defaults),
      timeline: this._deserializeTimeline(table.timeline, defaults)
    }));
  }
}

/**
 * 데이터 처리 레이어
 * 통계 계산 및 계급 생성 로직
 */


class DataProcessor {
  /**
   * 입력 문자열을 숫자 배열로 파싱
   * @param {string} input - 쉼표 또는 공백으로 구분된 숫자 문자열
   * @returns {number[]} 파싱된 숫자 배열
   * @example
   * parseInput("1, 2, 3") // [1, 2, 3]
   * parseInput("1 2 3") // [1, 2, 3]
   * parseInput("16*18") // [16, 16, ...(18번)]
   * parseInput("40*2 50*11") // 40 2개, 50 11개
   */
  static parseInput(input) {
    const tokens = input.split(/[,\s]+/);
    const result = [];

    tokens.forEach(token => {
      // 숫자*반복횟수 패턴 체크 (예: 16*18, -5*3, 3.14*2)
      const repeatMatch = token.match(/^(-?\d+\.?\d*)\*(\d+)$/);
      if (repeatMatch) {
        const value = Number(repeatMatch[1]);
        const count = parseInt(repeatMatch[2], 10);
        if (!isNaN(value) && isFinite(value) && count > 0) {
          for (let i = 0; i < count; i++) {
            result.push(value);
          }
        }
      } else {
        const num = Number(token);
        if (!isNaN(num) && isFinite(num)) {
          result.push(num);
        }
      }
    });

    return result;
  }

  /**
   * 기본 통계 계산
   * @precondition viz-api에서 ConfigValidator.validate()로 먼저 검증됨
   * @param {number[]} data - 숫자 배열
   * @returns {{min: number, max: number, range: number, mean: number, median: number, count: number}} 통계 객체
   * @throws {Error} 데이터가 비어있는 경우 (방어적 검증)
   * @example
   * calculateBasicStats([1, 2, 3, 4, 5])
   * // { min: 1, max: 5, range: 4, mean: 3, median: 3, count: 5 }
   */
  static calculateBasicStats(data) {
    // 방어적 검증: ConfigValidator에서 이미 검증되었지만, 직접 호출 시 안전장치
    if (Utils.isEmpty(data)) {
      throw new Error('데이터가 비어있습니다.');
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    const mean = data.reduce((a, b) => a + b, 0) / data.length;

    const sorted = [...data].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length/2 - 1] + sorted[sorted.length/2]) / 2
      : sorted[Math.floor(sorted.length/2)];

    return { min, max, range, mean, median, count: data.length };
  }

  /**
   * 계급 구간 생성 (0부터 시작, 끝에 빈 구간 추가)
   * @param {Object} stats - 통계 객체 (calculateBasicStats 반환값)
   * @param {number} classCount - 생성할 계급 개수
   * @param {number|null} customWidth - 커스텀 계급 간격 (선택)
   * @param {Object|null} customRange - 커스텀 범위 설정 { firstStart, secondStart, lastEnd }
   * @returns {{classes: Array, classWidth: number}} 계급 배열과 계급 간격
   * @example
   * createClasses({ max: 100 }, 5)
   * // { classes: [{min: 0, max: 20, ...}, ...], classWidth: 20 }
   */
  static createClasses(stats, classCount, customWidth = null, customRange = null) {
    // 커스텀 범위가 있으면 그것을 사용
    if (customRange) {
      return this.createCustomRangeClasses(customRange);
    }

    const { max, range } = stats;
    const classWidth = customWidth || Math.ceil(range / classCount);

    const classes = [];
    const startValue = 0; // 항상 0부터 시작

    // 최대값을 포함하는 계급까지 생성
    let i = 0;
    let classMax = 0;

    while (classMax <= max || i < classCount) {
      const classMin = startValue + (i * classWidth);
      classMax = classMin + classWidth;
      classes.push({
        min: classMin,
        max: classMax,
        frequency: 0,
        data: [],
        midpoint: (classMin + classMax) / 2
      });
      i++;

      // 최대값을 포함하는 계급을 생성한 후 종료
      if (classMax > max && i >= classCount) break;
    }

    // 끝에 빈 구간 1개 추가
    const lastClassMin = startValue + (i * classWidth);
    const lastClassMax = lastClassMin + classWidth;
    classes.push({
      min: lastClassMin,
      max: lastClassMax,
      frequency: 0,
      data: [],
      midpoint: (lastClassMin + lastClassMax) / 2
    });

    return { classes, classWidth };
  }

  /**
   * 커스텀 범위로 계급 구간 생성
   * @precondition viz-api에서 ConfigValidator.validate()로 classRange 검증됨
   * @param {Object} customRange - { firstStart, secondStart, lastEnd }
   * @returns {{classes: Array, classWidth: number}} 계급 배열과 계급 간격
   * @throws {Error} 범위 값이 논리적으로 올바르지 않은 경우 (방어적 검증)
   * @description
   * - firstStart: 전체 구간의 시작값 (첫 계급 시작)
   * - secondStart: 두 번째 계급의 시작값 (간격 결정용)
   * - lastEnd: 전체 구간의 끝값 (마지막 계급 끝)
   * @example
   * // { firstStart: 12, secondStart: 14, lastEnd: 22 }
   * // → 간격 2, 계급: 0~12(빈), 12~14, 14~16, 16~18, 18~20, 20~22
   */
  static createCustomRangeClasses(customRange) {
    const { firstStart, secondStart, lastEnd } = customRange;

    // 방어적 검증: ConfigValidator에서 이미 검증되었지만, 직접 호출 시 안전장치
    if (firstStart < 0) {
      throw new Error('첫 계급의 시작값은 0 이상이어야 합니다.');
    }
    if (secondStart <= firstStart) {
      throw new Error('두 번째 계급의 시작값은 첫 계급의 시작값보다 커야 합니다.');
    }
    if (lastEnd <= secondStart) {
      throw new Error('마지막 계급의 끝값은 두 번째 계급의 시작값보다 커야 합니다.');
    }

    // 간격 계산 (첫 번째와 두 번째 계급 시작값의 차이)
    const classWidth = secondStart - firstStart;

    // 간격으로 나누어 떨어지는지 검증
    const totalRange = lastEnd - firstStart;
    if (totalRange % classWidth !== 0) {
      console.warn(`classRange 경고: 전체 범위(${totalRange})가 간격(${classWidth})으로 나누어 떨어지지 않습니다.`);
    }

    const classes = [];

    // firstStart가 0보다 크면 0~firstStart 빈 구간 추가 (중략 표시용)
    if (firstStart > 0) {
      classes.push({
        min: 0,
        max: firstStart,
        frequency: 0,
        data: [],
        midpoint: firstStart / 2
      });
    }

    // firstStart부터 lastEnd까지 classWidth 간격으로 계급 생성
    let currentMin = firstStart;
    while (currentMin < lastEnd) {
      const currentMax = currentMin + classWidth;
      classes.push({
        min: currentMin,
        max: currentMax,
        frequency: 0,
        data: [],
        midpoint: (currentMin + currentMax) / 2
      });
      currentMin = currentMax;
    }

    // lastEnd 이후에 빈 구간 추가 (축 라벨 표시용)
    classes.push({
      min: lastEnd,
      max: lastEnd + classWidth,
      frequency: 0,
      data: [],
      midpoint: lastEnd + (classWidth / 2)
    });

    return { classes, classWidth };
  }

  /**
   * 도수 계산
   * @param {number[]} data - 데이터 배열
   * @param {Array} classes - 계급 배열 (createClasses 반환값)
   * @returns {Array} 도수가 업데이트된 계급 배열
   * @description 각 데이터를 해당하는 계급에 배치하고 도수를 증가시킴
   */
  static calculateFrequencies(data, classes) {
    const outOfRangeData = [];

    data.forEach(value => {
      let placed = false;

      for (let i = 0; i < classes.length; i++) {
        const isLastClass = i === classes.length - 1;
        const inRange = isLastClass
          ? value >= classes[i].min && value <= classes[i].max
          : value >= classes[i].min && value < classes[i].max;

        if (inRange) {
          classes[i].frequency++;
          classes[i].data.push(value);
          placed = true;
          break;
        }
      }

      if (!placed) {
        outOfRangeData.push(value);
      }
    });

    // 범위 밖 데이터가 있으면 경고
    if (outOfRangeData.length > 0) {
      const maxDisplay = CONFIG.OUT_OF_RANGE_MAX_DISPLAY;
      const preview = outOfRangeData.slice(0, maxDisplay).join(', ');
      const message = outOfRangeData.length > maxDisplay
        ? `${outOfRangeData.length}개의 데이터가 계급 범위를 벗어났습니다: ${preview}... 외 ${outOfRangeData.length - maxDisplay}개`
        : `${outOfRangeData.length}개의 데이터가 계급 범위를 벗어났습니다: ${preview}`;

      MessageManager.warning(message);
    }

    return classes;
  }

  /**
   * 상대도수 및 누적도수 계산
   * @param {Array} classes - 계급 배열
   * @param {number} total - 전체 데이터 개수
   * @returns {Array} 상대도수와 누적도수가 추가된 계급 배열
   * @description 각 계급에 relativeFreq, cumulativeFreq, cumulativeRelFreq 추가
   */
  static calculateRelativeAndCumulative(classes, total) {
    let cumulativeFreq = 0;

    classes.forEach(classData => {
      classData.relativeFreq = Utils.formatNumber(classData.frequency / total * 100);
      cumulativeFreq += classData.frequency;
      classData.cumulativeFreq = cumulativeFreq;
      classData.cumulativeRelFreq = Utils.formatNumber(cumulativeFreq / total * 100);
    });

    return classes;
  }

  /**
   * 중략 표시가 필요한지 판단
   * @param {Array} classes - 계급 배열
   * @returns {{show: boolean, firstDataIndex: number}} 중략 표시 여부와 첫 데이터 인덱스
   * @description 첫 번째 데이터가 있는 계급 이전에 빈 계급이 CONFIG.ELLIPSIS_THRESHOLD개 이상이면 중략 표시
   * @example
   * shouldShowEllipsis([{frequency: 0}, {frequency: 0}, {frequency: 5}])
   * // { show: false, firstDataIndex: -1 } (threshold 이하)
   */
  static shouldShowEllipsis(classes) {
    const firstDataIndex = classes.findIndex(classData => classData.frequency > 0);

    // 첫 데이터가 없으면 중략 불필요
    if (firstDataIndex === -1) {
      return { show: false, firstDataIndex: -1 };
    }

    // 기존 조건: 첫 데이터가 threshold 이상 계급에 있으면 중략 필요
    if (firstDataIndex >= CONFIG.ELLIPSIS_THRESHOLD) {
      return { show: true, firstDataIndex };
    }

    // 추가 조건: 첫 계급이 비어있고 범위가 크면 중략 필요 (커스텀 범위 대응)
    if (firstDataIndex >= 1 && classes[0].frequency === 0) {
      const firstClassRange = classes[0].max - classes[0].min;
      const classWidth = classes.length >= 2 ? classes[1].max - classes[1].min : firstClassRange;
      // 첫 계급의 범위가 일반 계급 간격의 threshold배 이상이면 중략 표시
      if (firstClassRange >= classWidth * CONFIG.ELLIPSIS_THRESHOLD) {
        return { show: true, firstDataIndex };
      }
    }

    return { show: false, firstDataIndex: -1 };
  }

  /**
   * 차트 및 테이블 데이터를 JSON으로 내보내기
   * @deprecated DataExporter.exportData()를 직접 사용하세요
   * @see DataExporter
   */
  static exportData(chartLayerManager, chartTimeline, chartRenderer = null, tableRenderers = []) {
    return DataExporter.exportData(chartLayerManager, chartTimeline, chartRenderer, tableRenderers);
  }

  /**
   * JSON 데이터 불러오기 (기본값 복원)
   * @deprecated DataImporter.importData()를 직접 사용하세요
   * @see DataImporter
   */
  static importData(jsonData) {
    return DataImporter.importData(jsonData);
  }
}

/**
 * 도수분포표 파서
 * 숫자 데이터를 파싱하여 배열로 반환
 */


class FrequencyParser {
  /**
   * 입력 문자열을 숫자 배열로 파싱
   * @param {string} input - 쉼표 또는 공백으로 구분된 숫자 문자열
   * @returns {{ success: boolean, data: number[]|null, error: string|null }}
   * @example
   * parse("1, 2, 3") // { success: true, data: [1, 2, 3], error: null }
   * parse("1 2 3")   // { success: true, data: [1, 2, 3], error: null }
   * parse("")        // { success: false, data: null, error: "데이터가 비어있습니다" }
   */
  static parse(input) {
    if (!input || typeof input !== 'string') {
      return {
        success: false,
        data: null,
        error: '데이터가 비어있습니다.'
      };
    }

    const trimmed = input.trim();
    if (!trimmed) {
      return {
        success: false,
        data: null,
        error: '데이터가 비어있습니다.'
      };
    }

    // 쉼표 또는 공백으로 분리하여 숫자로 변환
    const numbers = trimmed
      .split(/[,\s]+/)
      .map(Number)
      .filter(n => !isNaN(n) && isFinite(n));

    if (numbers.length === 0) {
      return {
        success: false,
        data: null,
        error: '유효한 숫자가 없습니다.'
      };
    }

    if (numbers.length < CONFIG.MIN_DATA_POINTS) {
      return {
        success: false,
        data: null,
        error: `최소 ${CONFIG.MIN_DATA_POINTS}개 이상의 데이터가 필요합니다.`
      };
    }

    if (numbers.length > CONFIG.MAX_DATA_POINTS) {
      return {
        success: false,
        data: null,
        error: `데이터 개수는 최대 ${CONFIG.MAX_DATA_POINTS}개까지 입력 가능합니다.`
      };
    }

    return {
      success: true,
      data: numbers,
      error: null
    };
  }

  /**
   * 파서 타입 반환
   * @returns {string}
   */
  static getType() {
    return CONFIG.TABLE_TYPES.FREQUENCY;
  }
}

/**
 * 카테고리 행렬 파서
 * "헤더: A, B, C" + "라벨: 값들" 형식의 데이터를 파싱
 */


class CategoryMatrixParser {
  /**
   * 입력 문자열을 카테고리 행렬 데이터로 파싱
   * @param {string} input - 여러 줄의 "라벨: 값들" 형식 문자열
   * @returns {{ success: boolean, data: Object|null, error: string|null }}
   * @example
   * parse("헤더: A, B, C\n전체: 200, 250, 300\nO형: 50, 60, 70")
   * // { success: true, data: { headers: ['A','B','C'], rows: [{label:'전체', values:[200,250,300]}, ...] } }
   */
  static parse(input) {
    if (!input || typeof input !== 'string') {
      return {
        success: false,
        data: null,
        error: '데이터가 비어있습니다.'
      };
    }

    const trimmed = input.trim();
    if (!trimmed) {
      return {
        success: false,
        data: null,
        error: '데이터가 비어있습니다.'
      };
    }

    const lines = trimmed.split('\n').map(line => line.trim()).filter(line => line);

    if (lines.length < 2) {
      return {
        success: false,
        data: null,
        error: '최소 헤더 1줄과 데이터 1줄이 필요합니다.'
      };
    }

    const result = {
      headers: [],
      rows: []
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const colonIndex = line.indexOf(':');

      if (colonIndex === -1) {
        return {
          success: false,
          data: null,
          error: `${i + 1}번째 줄: "라벨: 값" 형식이 아닙니다.`
        };
      }

      const label = line.substring(0, colonIndex).trim();
      const valuesStr = line.substring(colonIndex + 1).trim();

      if (!label) {
        return {
          success: false,
          data: null,
          error: `${i + 1}번째 줄: 라벨이 비어있습니다.`
        };
      }

      // 첫 번째 줄이 헤더인지 확인 (라벨이 '헤더'인 경우)
      if (i === 0 && label.toLowerCase() === '헤더') {
        result.headers = valuesStr.split(',').map(v => {
          const trimmed = v.trim();
          // null 문자열은 빈 문자열로 처리 (빈칸 표시)
          return trimmed === 'null' ? '' : trimmed;
        });
      } else {
        // 데이터 행
        const values = valuesStr.split(',').map(v => {
          const trimmedVal = v.trim();

          // 1. null 표기 → 빈 값
          if (trimmedVal === 'null' || trimmedVal === '') {
            return null;
          }

          // 2. 탈리마크 표기 → { type: 'tally', count: N }
          if (/^\/+$/.test(trimmedVal)) {
            return { type: 'tally', count: trimmedVal.length };
          }

          // 3. 숫자 변환
          const num = Number(trimmedVal);
          return isNaN(num) ? trimmedVal : num;
        });

        // 헤더가 있으면 개수 확인
        if (result.headers.length > 0 && values.length !== result.headers.length) {
          return {
            success: false,
            data: null,
            error: `${i + 1}번째 줄: 값 개수(${values.length})가 헤더 개수(${result.headers.length})와 일치하지 않습니다.`
          };
        }

        result.rows.push({
          label: label,
          values: values
        });
      }
    }

    if (result.rows.length === 0) {
      return {
        success: false,
        data: null,
        error: '데이터 행이 없습니다.'
      };
    }

    // 헤더가 없으면 자동 생성 (A, B, C, ...)
    if (result.headers.length === 0) {
      const columnCount = result.rows[0].values.length;
      result.headers = Array.from({ length: columnCount }, (_, i) =>
        String.fromCharCode(65 + i) // A, B, C, ...
      );
    }

    return {
      success: true,
      data: result,
      error: null
    };
  }

  /**
   * 파서 타입 반환
   * @returns {string}
   */
  static getType() {
    return CONFIG.TABLE_TYPES.CATEGORY_MATRIX;
  }
}

/**
 * 기본 테이블 파서 (구 이원 분류표)
 * 행(카테고리) × 열(그룹) 형식의 교차 분류 데이터를 파싱
 */


class BasicTableParser {
  /**
   * 입력 문자열을 기본 테이블 데이터로 파싱
   * @param {string} input - 여러 줄의 "행이름: 값들" 형식 문자열
   * @returns {{ success: boolean, data: Object|null, error: string|null }}
   * @example
   * parse("헤더: 혈액형, 남학생, 여학생\nA: 0.4, 0.4\nB: 0.22, 0.2")
   * // { success: true, data: { rowLabelColumn: '혈액형', columnHeaders: ['남학생','여학생'], rows: [...], showTotal: true } }
   */
  static parse(input) {
    if (!input || typeof input !== 'string') {
      return {
        success: false,
        data: null,
        error: '데이터가 비어있습니다.'
      };
    }

    const trimmed = input.trim();
    if (!trimmed) {
      return {
        success: false,
        data: null,
        error: '데이터가 비어있습니다.'
      };
    }

    const lines = trimmed.split('\n').map(line => line.trim()).filter(line => line);

    if (lines.length < 2) {
      return {
        success: false,
        data: null,
        error: '최소 헤더 1줄과 데이터 1줄이 필요합니다.'
      };
    }

    // 커스텀 병합 헤더 감지: 첫 줄이 "헤더:"로 시작하지 않고 ":"도 없으면 커스텀 라벨
    let mergedHeaderText = null;
    let startLineIndex = 0;
    const firstLine = lines[0];

    if (!firstLine.toLowerCase().startsWith('헤더:') && !firstLine.includes(':')) {
      mergedHeaderText = firstLine;
      startLineIndex = 1;
    }

    // 남은 줄이 충분한지 확인
    const remainingLines = lines.slice(startLineIndex);
    if (remainingLines.length < 2) {
      return {
        success: false,
        data: null,
        error: '최소 헤더 1줄과 데이터 1줄이 필요합니다.'
      };
    }

    const result = {
      rowLabelColumn: '',    // 행 라벨 컬럼명 (혈액형)
      columnHeaders: [],     // 열 헤더 (남학생, 여학생)
      rowHeaders: [],        // 행 헤더 (A, B, AB, O)
      rows: [],              // 데이터 행
      showTotal: true,       // 합계 행 표시 여부
      mergedHeaderText       // 커스텀 병합 헤더 텍스트 (null이면 기본값 '상대도수')
    };

    for (let i = startLineIndex; i < lines.length; i++) {
      const line = lines[i];
      const colonIndex = line.indexOf(':');

      if (colonIndex === -1) {
        return {
          success: false,
          data: null,
          error: `${i + 1}번째 줄: "라벨: 값" 형식이 아닙니다.`
        };
      }

      const label = line.substring(0, colonIndex).trim();
      const valuesStr = line.substring(colonIndex + 1).trim();

      if (!label) {
        return {
          success: false,
          data: null,
          error: `${i + 1}번째 줄: 라벨이 비어있습니다.`
        };
      }

      // 첫 번째 데이터 줄: 헤더 (첫 값 = 행 라벨 컬럼명, 나머지 = 열 헤더)
      if (i === startLineIndex && label.toLowerCase() === '헤더') {
        const allHeaders = valuesStr.split(',').map(v => v.trim()).filter(v => v);
        if (allHeaders.length < 2) {
          return {
            success: false,
            data: null,
            error: '헤더는 최소 2개 이상 필요합니다. (행 라벨명, 열 헤더들)'
          };
        }
        // 첫 번째 값은 행 라벨 컬럼명, 나머지는 열 헤더
        result.rowLabelColumn = allHeaders[0];
        result.columnHeaders = allHeaders.slice(1);
      } else {
        // 데이터 행
        const values = valuesStr.split(',').map(v => {
          const trimmedVal = v.trim();

          // 1. null 표기 → 빈 값
          if (trimmedVal === 'null' || trimmedVal === '') {
            return null;
          }

          // 2. 탈리마크 표기 → { type: 'tally', count: N }
          if (/^\/+$/.test(trimmedVal)) {
            return { type: 'tally', count: trimmedVal.length };
          }

          // 3. 숫자 변환
          const num = Number(trimmedVal);
          return isNaN(num) ? trimmedVal : num;
        });

        // 열 헤더가 있으면 개수 확인
        if (result.columnHeaders.length > 0 && values.length !== result.columnHeaders.length) {
          return {
            success: false,
            data: null,
            error: `${i + 1}번째 줄: 값 개수(${values.length})가 열 개수(${result.columnHeaders.length})와 일치하지 않습니다.`
          };
        }

        result.rowHeaders.push(label);
        result.rows.push({
          label: label,
          values: values
        });
      }
    }

    if (result.rows.length === 0) {
      return {
        success: false,
        data: null,
        error: '데이터 행이 없습니다.'
      };
    }

    // 열 헤더가 없으면 자동 생성
    if (result.columnHeaders.length === 0) {
      const columnCount = result.rows[0].values.length;
      result.columnHeaders = Array.from({ length: columnCount }, (_, i) =>
        `열${i + 1}`
      );
    }

    // 행 라벨 컬럼명이 없으면 기본값
    if (!result.rowLabelColumn) {
      result.rowLabelColumn = '구분';
    }

    // 합계 계산 - 상대도수이므로 1로 고정 (실제 합계가 1에 가까운 경우)
    const totals = [];
    for (let col = 0; col < result.columnHeaders.length; col++) {
      let sum = 0;
      let allNumbers = true;
      for (const row of result.rows) {
        if (typeof row.values[col] === 'number') {
          sum += row.values[col];
        } else {
          allNumbers = false;
          break;
        }
      }
      // 상대도수 합계는 1로 표시 (0.95 ~ 1.05 범위면 1로 반올림)
      if (allNumbers && sum >= 0.95 && sum <= 1.05) {
        totals.push(1);
      } else {
        totals.push(allNumbers ? Math.round(sum * 100) / 100 : '-');
      }
    }
    result.totals = totals;

    return {
      success: true,
      data: result,
      error: null
    };
  }

  /**
   * 파서 타입 반환
   * @returns {string}
   */
  static getType() {
    return CONFIG.TABLE_TYPES.BASIC_TABLE;
  }
}

/**
 * 줄기-잎 그림 파서
 * 단일 또는 두 그룹의 숫자 데이터를 파싱하여 줄기-잎 형식으로 변환
 */


class StemLeafParser {
  /**
   * 입력 문자열을 줄기-잎 그림 데이터로 파싱
   * 콜론(:)이 없으면 단일 모드, 있으면 비교 모드로 자동 감지
   * @param {string} input - 숫자만 또는 "라벨: 숫자들" 형식
   * @returns {{ success: boolean, data: Object|null, error: string|null }}
   * @example
   * // 단일 모드
   * parse("15 6 23 25 32 33 19 21")
   * // { success: true, data: { isSingleMode: true, stems: [...] } }
   *
   * // 비교 모드
   * parse("왼쪽: 162, 175, 178\n오른쪽: 160, 165, 170")
   * // { success: true, data: { isSingleMode: false, leftLabel, rightLabel, stems: [...] } }
   */
  static parse(input) {
    if (!input || typeof input !== 'string') {
      return {
        success: false,
        data: null,
        error: '데이터가 비어있습니다.'
      };
    }

    const trimmed = input.trim();
    if (!trimmed) {
      return {
        success: false,
        data: null,
        error: '데이터가 비어있습니다.'
      };
    }

    // 콜론(:) 유무로 단일/비교 모드 자동 감지
    const hasColon = trimmed.includes(':');

    if (hasColon) {
      return this._parseCompareMode(trimmed);
    } else {
      return this._parseSingleMode(trimmed);
    }
  }

  /**
   * 단일 모드 파싱 (숫자만 입력)
   * @param {string} input - 공백 또는 쉼표로 구분된 숫자들
   * @returns {{ success: boolean, data: Object|null, error: string|null }}
   */
  static _parseSingleMode(input) {
    // 숫자만 추출
    const values = input
      .split(/[,\s]+/)
      .map(Number)
      .filter(n => !isNaN(n) && isFinite(n) && Number.isInteger(n));

    if (values.length === 0) {
      return {
        success: false,
        data: null,
        error: '유효한 정수가 없습니다.'
      };
    }

    if (values.length < 2) {
      return {
        success: false,
        data: null,
        error: '최소 2개 이상의 정수가 필요합니다.'
      };
    }

    // 줄기-잎 데이터 생성
    const stemLeafData = this._generateSingleStemLeaf(values);

    return {
      success: true,
      data: {
        isSingleMode: true,
        stems: stemLeafData.stems,
        minStem: stemLeafData.minStem,
        maxStem: stemLeafData.maxStem
      },
      error: null
    };
  }

  /**
   * 비교 모드 파싱 (라벨: 숫자들 형식)
   * @param {string} input - "왼쪽: 숫자들\n오른쪽: 숫자들" 형식
   * @returns {{ success: boolean, data: Object|null, error: string|null }}
   */
  static _parseCompareMode(input) {
    const lines = input.split('\n').map(line => line.trim()).filter(line => line);

    if (lines.length < 2) {
      return {
        success: false,
        data: null,
        error: '"라벨: 숫자들" 형식으로 두 줄이 필요합니다.'
      };
    }

    let leftData = null;
    let rightData = null;
    let leftLabel = '왼쪽';
    let rightLabel = '오른쪽';

    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) {
        return {
          success: false,
          data: null,
          error: `"라벨: 숫자들" 형식이 아닙니다: ${line}`
        };
      }

      const label = line.substring(0, colonIndex).trim();
      const valuesStr = line.substring(colonIndex + 1).trim();
      const values = valuesStr
        .split(/[,\s]+/)
        .map(Number)
        .filter(n => !isNaN(n) && isFinite(n) && Number.isInteger(n));

      if (values.length === 0) {
        return {
          success: false,
          data: null,
          error: `"${label}" 데이터에 유효한 정수가 없습니다.`
        };
      }

      // 라벨로 왼쪽/오른쪽 구분
      const lowerLabel = label.toLowerCase();
      if (lowerLabel.includes('왼쪽') || lowerLabel.includes('left') || lowerLabel === '남학생') {
        leftData = values;
        leftLabel = label;
      } else if (lowerLabel.includes('오른쪽') || lowerLabel.includes('right') || lowerLabel === '여학생') {
        rightData = values;
        rightLabel = label;
      } else {
        // 순서대로 할당
        if (leftData === null) {
          leftData = values;
          leftLabel = label;
        } else if (rightData === null) {
          rightData = values;
          rightLabel = label;
        }
      }
    }

    if (!leftData || !rightData) {
      return {
        success: false,
        data: null,
        error: '왼쪽과 오른쪽 데이터가 모두 필요합니다.'
      };
    }

    // 줄기-잎 데이터 생성
    const stemLeafData = this._generateCompareStemLeaf(leftData, rightData);

    return {
      success: true,
      data: {
        isSingleMode: false,
        leftLabel: leftLabel,
        rightLabel: rightLabel,
        leftData: leftData,
        rightData: rightData,
        stems: stemLeafData.stems,
        minStem: stemLeafData.minStem,
        maxStem: stemLeafData.maxStem
      },
      error: null
    };
  }

  /**
   * 단일 데이터의 줄기-잎 구조 생성
   * @param {number[]} data - 숫자 데이터
   * @returns {{ stems: Object[], minStem: number, maxStem: number }}
   */
  static _generateSingleStemLeaf(data) {
    const minVal = Math.min(...data);
    const maxVal = Math.max(...data);

    // 줄기 = 십의 자리 (예: 25 → 2)
    const minStem = Math.floor(minVal / 10);
    const maxStem = Math.floor(maxVal / 10);

    // 줄기별 잎 분류
    const stems = [];
    for (let stem = minStem; stem <= maxStem; stem++) {
      const leaves = data
        .filter(n => Math.floor(n / 10) === stem)
        .map(n => n % 10)
        .sort((a, b) => a - b); // 오름차순

      stems.push({
        stem: stem,
        leaves: leaves
      });
    }

    return {
      stems: stems,
      minStem: minStem,
      maxStem: maxStem
    };
  }

  /**
   * 두 그룹의 데이터로 줄기-잎 구조 생성 (비교 모드)
   * @param {number[]} leftData - 왼쪽 데이터
   * @param {number[]} rightData - 오른쪽 데이터
   * @returns {{ stems: Object[], minStem: number, maxStem: number }}
   */
  static _generateCompareStemLeaf(leftData, rightData) {
    // 모든 데이터의 줄기 범위 계산
    const allData = [...leftData, ...rightData];
    const minVal = Math.min(...allData);
    const maxVal = Math.max(...allData);

    // 줄기 = 십의 자리 (예: 162 → 16)
    const minStem = Math.floor(minVal / 10);
    const maxStem = Math.floor(maxVal / 10);

    // 줄기별 잎 분류
    const stems = [];
    for (let stem = minStem; stem <= maxStem; stem++) {
      const leftLeaves = leftData
        .filter(n => Math.floor(n / 10) === stem)
        .map(n => n % 10)
        .sort((a, b) => b - a); // 내림차순 (오른쪽으로 정렬)

      const rightLeaves = rightData
        .filter(n => Math.floor(n / 10) === stem)
        .map(n => n % 10)
        .sort((a, b) => a - b); // 오름차순

      stems.push({
        stem: stem,
        leftLeaves: leftLeaves,
        rightLeaves: rightLeaves
      });
    }

    return {
      stems: stems,
      minStem: minStem,
      maxStem: maxStem
    };
  }

  /**
   * 파서 타입 반환
   * @returns {string}
   */
  static getType() {
    return CONFIG.TABLE_TYPES.STEM_LEAF;
  }
}

/**
 * 파서 어댑터
 * 각 파서의 출력을 공통 인터페이스(ParsedTableData)로 변환
 *
 * @typedef {Object} Cell
 * @property {any} value - 셀 값
 * @property {Object} [metadata] - 셀 메타데이터 (옵션)
 *
 * @typedef {Object} Row
 * @property {string} label - 행 라벨
 * @property {Cell[]} cells - 셀 배열
 *
 * @typedef {Object} ParsedTableData
 * @property {string} type - 테이블 타입
 * @property {string[]} headers - 헤더 배열
 * @property {Row[]} rows - 행 배열
 * @property {number} rowCount - 행 개수
 * @property {number} columnCount - 열 개수
 * @property {Object} metadata - 타입별 추가 데이터
 */


class ParserAdapter {
  /**
   * 파서 출력을 공통 형식으로 변환
   * @param {string} type - 테이블 타입
   * @param {Object} parseResult - 파서 출력 결과 (parseResult.data)
   * @param {Object} [options={}] - 변환 옵션
   * @returns {ParsedTableData}
   */
  static adapt(type, parseResult, options = {}) {
    // parseResult가 { success, data, error } 형식인 경우 data 추출
    const data = parseResult?.data ?? parseResult;

    if (!data) {
      throw new Error('어댑터 변환 실패: 데이터가 없습니다.');
    }

    switch (type) {
      case CONFIG.TABLE_TYPES.STEM_LEAF:
        return this._adaptStemLeaf(data, options);

      case CONFIG.TABLE_TYPES.CATEGORY_MATRIX:
        return this._adaptCategoryMatrix(data, options);

      case CONFIG.TABLE_TYPES.BASIC_TABLE:
        return this._adaptBasicTable(data, options);

      case CONFIG.TABLE_TYPES.FREQUENCY:
        // 도수분포표는 별도 메서드 사용 (processor.js에서 계급 생성 후 호출)
        throw new Error('도수분포표는 adaptFrequencyClasses() 메서드를 사용하세요.');

      default:
        throw new Error(`지원하지 않는 테이블 타입: ${type}`);
    }
  }

  /**
   * 줄기-잎 그림 데이터 변환
   * @param {Object} data - StemLeafParser 출력
   * @param {Object} options - 변환 옵션
   * @returns {ParsedTableData}
   * @private
   */
  static _adaptStemLeaf(data, options = {}) {
    const { isSingleMode, stems, leftLabel, rightLabel, minStem, maxStem } = data;

    if (isSingleMode) {
      // 단일 모드: [줄기, 잎]
      const headers = ['줄기', '잎'];
      const rows = stems.map(stemData => ({
        label: String(stemData.stem),
        cells: [
          { value: stemData.stem },
          {
            value: stemData.leaves.join(' '),
            metadata: {
              leaves: stemData.leaves,
              leafCount: stemData.leaves.length
            }
          }
        ]
      }));

      // 최대 잎 개수 계산 (동적 너비용)
      const maxLeafCount = Math.max(...stems.map(s => s.leaves.length));

      return {
        type: CONFIG.TABLE_TYPES.STEM_LEAF,
        headers,
        rows,
        rowCount: rows.length,
        columnCount: 2,
        metadata: {
          isSingleMode: true,
          minStem,
          maxStem,
          maxLeafCount
        }
      };
    } else {
      // 비교 모드: [왼쪽 잎, 줄기, 오른쪽 잎]
      const headers = [leftLabel || '왼쪽', '줄기', rightLabel || '오른쪽'];
      const rows = stems.map(stemData => ({
        label: String(stemData.stem),
        cells: [
          {
            value: stemData.leftLeaves.join(' '),
            metadata: {
              leaves: stemData.leftLeaves,
              leafCount: stemData.leftLeaves.length,
              isLeftSide: true
            }
          },
          { value: stemData.stem },
          {
            value: stemData.rightLeaves.join(' '),
            metadata: {
              leaves: stemData.rightLeaves,
              leafCount: stemData.rightLeaves.length,
              isLeftSide: false
            }
          }
        ]
      }));

      // 최대 잎 개수 계산
      const maxLeftLeafCount = Math.max(...stems.map(s => s.leftLeaves.length));
      const maxRightLeafCount = Math.max(...stems.map(s => s.rightLeaves.length));

      return {
        type: CONFIG.TABLE_TYPES.STEM_LEAF,
        headers,
        rows,
        rowCount: rows.length,
        columnCount: 3,
        metadata: {
          isSingleMode: false,
          leftLabel,
          rightLabel,
          minStem,
          maxStem,
          maxLeftLeafCount,
          maxRightLeafCount,
          maxLeafCount: Math.max(maxLeftLeafCount, maxRightLeafCount)
        }
      };
    }
  }

  /**
   * 카테고리 행렬 데이터 변환
   * @param {Object} data - CategoryMatrixParser 출력
   * @param {Object} options - 변환 옵션
   * @returns {ParsedTableData}
   * @private
   */
  static _adaptCategoryMatrix(data, options = {}) {
    const { headers, rows: rawRows } = data;

    // 첫 번째 열에 라벨 추가
    const fullHeaders = ['구분', ...headers];

    const rows = rawRows.map(row => ({
      label: row.label,
      cells: [
        { value: row.label },
        ...row.values.map(v => ({ value: v }))
      ]
    }));

    return {
      type: CONFIG.TABLE_TYPES.CATEGORY_MATRIX,
      headers: fullHeaders,
      rows,
      rowCount: rows.length,
      columnCount: fullHeaders.length,
      metadata: {
        originalHeaders: headers
      }
    };
  }

  /**
   * 기본 테이블 데이터 변환
   * @param {Object} data - BasicTableParser 출력
   * @param {Object} options - 변환 옵션
   * @returns {ParsedTableData}
   * @private
   */
  static _adaptBasicTable(data, options = {}) {
    const {
      rowLabelColumn,
      columnHeaders,
      rows: rawRows,
      showTotal,
      totals,
      mergedHeaderText
    } = data;

    // 헤더: [행라벨컬럼명, 열헤더들, (합계)]
    const fullHeaders = [rowLabelColumn, ...columnHeaders];
    if (showTotal) {
      fullHeaders.push('합계');
    }

    // 데이터 행 변환
    const rows = rawRows.map(row => {
      const cells = [
        { value: row.label },
        ...row.values.map(v => ({ value: v }))
      ];

      // 합계 열 추가
      if (showTotal) {
        const rowSum = row.values.reduce((sum, v) => {
          return typeof v === 'number' ? sum + v : sum;
        }, 0);
        // 상대도수면 반올림
        const total = rowSum >= 0.95 && rowSum <= 1.05 ? 1 : Math.round(rowSum * 100) / 100;
        cells.push({ value: total });
      }

      return {
        label: row.label,
        cells
      };
    });

    // 합계 행 추가
    if (showTotal && totals) {
      const totalRow = {
        label: '합계',
        cells: [
          { value: '합계' },
          ...totals.map(v => ({ value: v })),
          { value: totals.reduce((sum, v) => typeof v === 'number' ? sum + v : sum, 0) }
        ]
      };
      rows.push(totalRow);
    }

    return {
      type: CONFIG.TABLE_TYPES.BASIC_TABLE,
      headers: fullHeaders,
      rows,
      rowCount: rows.length,
      columnCount: fullHeaders.length,
      metadata: {
        rowLabelColumn,
        columnHeaders,
        showTotal,
        mergedHeaderText,
        hasTotalRow: showTotal,
        originalTotals: totals
      }
    };
  }

  /**
   * 도수분포표 계급 데이터 변환
   * @param {Object[]} classes - processor.js에서 생성된 계급 배열
   * @param {number} total - 총 데이터 개수
   * @param {Object} [options={}] - 변환 옵션
   * @param {boolean[]} [options.visibleColumns] - 표시할 컬럼 여부
   * @returns {ParsedTableData}
   */
  static adaptFrequencyClasses(classes, total, options = {}) {
    const { visibleColumns } = options;

    // 기본 헤더
    const allHeaders = ['계급', '도수', '상대도수', '누적도수', '누적상대도수'];

    // visibleColumns가 있으면 필터링
    let headers = allHeaders;
    if (visibleColumns && Array.isArray(visibleColumns)) {
      headers = allHeaders.filter((_, i) => visibleColumns[i] !== false);
    }

    // 누적값 계산
    let cumulativeFrequency = 0;
    let cumulativeRelative = 0;

    const rows = classes.map(cls => {
      cumulativeFrequency += cls.frequency;
      const relativeFrequency = cls.frequency / total;
      cumulativeRelative += relativeFrequency;

      // 모든 셀 데이터
      const allCells = [
        { value: `${cls.min}~${cls.max}`, metadata: { min: cls.min, max: cls.max } },
        { value: cls.frequency },
        { value: Math.round(relativeFrequency * 1000) / 1000 }, // 소수점 3자리
        { value: cumulativeFrequency },
        { value: Math.round(cumulativeRelative * 1000) / 1000 }
      ];

      // visibleColumns가 있으면 필터링
      let cells = allCells;
      if (visibleColumns && Array.isArray(visibleColumns)) {
        cells = allCells.filter((_, i) => visibleColumns[i] !== false);
      }

      return {
        label: `${cls.min}~${cls.max}`,
        cells
      };
    });

    return {
      type: CONFIG.TABLE_TYPES.FREQUENCY,
      headers,
      rows,
      rowCount: rows.length,
      columnCount: headers.length,
      metadata: {
        total,
        classCount: classes.length,
        visibleColumns,
        allHeaders
      }
    };
  }
}

/**
 * 파서 모듈 통합 export
 */


/**
 * 파서 팩토리
 * 테이블 타입에 따라 적절한 파서 반환
 */
class ParserFactory {
  /**
   * 타입에 맞는 파서로 데이터 파싱
   * @param {string} type - 테이블 타입
   * @param {string} input - 입력 문자열
   * @returns {{ success: boolean, data: any, error: string|null }}
   */
  static parse(type, input) {
    switch (type) {
      case CONFIG.TABLE_TYPES.FREQUENCY:
        return FrequencyParser.parse(input);

      case CONFIG.TABLE_TYPES.CATEGORY_MATRIX:
        return CategoryMatrixParser.parse(input);

      case CONFIG.TABLE_TYPES.BASIC_TABLE:
        return BasicTableParser.parse(input);

      case CONFIG.TABLE_TYPES.STEM_LEAF:
        return StemLeafParser.parse(input);

      default:
        return {
          success: false,
          data: null,
          error: `알 수 없는 테이블 타입: ${type}`
        };
    }
  }

  /**
   * 타입에 맞는 파서 클래스 반환
   * @param {string} type - 테이블 타입
   * @returns {Class|null}
   */
  static getParser(type) {
    switch (type) {
      case CONFIG.TABLE_TYPES.FREQUENCY:
        return FrequencyParser;
      case CONFIG.TABLE_TYPES.CATEGORY_MATRIX:
        return CategoryMatrixParser;
      case CONFIG.TABLE_TYPES.BASIC_TABLE:
        return BasicTableParser;
      case CONFIG.TABLE_TYPES.STEM_LEAF:
        return StemLeafParser;
      default:
        return null;
    }
  }

  /**
   * 지원하는 모든 타입 반환
   * @returns {string[]}
   */
  static getSupportedTypes() {
    return Object.values(CONFIG.TABLE_TYPES);
  }
}

// ============================================================================
// Layer Utils - 레이어 유틸리티 함수
// ============================================================================

/**
 * 고유 ID 생성 (UUID v4)
 * @returns {string} 생성된 UUID
 */
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 레이어 통계 정보 계산
 * @param {Array} flattenedLayers - 평탄화된 레이어 배열 [{layer, depth}, ...]
 * @returns {Object} 통계 정보
 */
function calculateStats(flattenedLayers) {
  const typeCounts = {};

  flattenedLayers.forEach(item => {
    const type = item.layer.type;
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  return {
    total: flattenedLayers.length,
    visible: flattenedLayers.filter(item => item.layer.visible).length,
    byType: typeCounts,
    maxDepth: flattenedLayers.length > 0
      ? Math.max(...flattenedLayers.map(item => item.depth))
      : 0
  };
}

/**
 * 레이어 트리 디버그 출력
 * @param {Layer} rootLayer - 루트 레이어
 * @param {Object} stats - 통계 정보
 */
function printDebugTree(rootLayer, stats) {
  console.log('=== LayerManager Debug Info ===');
  console.log('Stats:', stats);
  console.log('Layer Tree:');

  const printTree = (layer, indent = 0) => {
    const prefix = '  '.repeat(indent);
    const visIcon = layer.visible ? '👁' : '🚫';
    console.log(`${prefix}${visIcon} ${layer.toString()}`);

    layer.children.forEach(child => printTree(child, indent + 1));
  };

  printTree(rootLayer);
  console.log('================================');
}

// ============================================================================
// Layer DTO - 레이어 데이터 구조
// ============================================================================


/**
 * Layer 클래스
 * 모든 그래픽 요소를 Layer로 통일하여 관리
 */
class Layer {
  /**
   * @param {Object} config - 레이어 설정
   * @param {string} config.id - 고유 ID (선택사항, 자동 생성)
   * @param {string} config.name - 사용자 정의 이름
   * @param {string} config.type - 레이어 타입 ('group'|'function'|'shape'|'point'|'line')
   * @param {boolean} config.visible - 표시 여부 (기본: true)
   * @param {number} config.order - 렌더링 순서 (기본: 0)
   * @param {string} config.p_id - 부모 레이어 ID (기본: null)
   * @param {Layer[]} config.children - 자손 레이어들 (기본: [])
   * @param {Object} config.data - 타입별 데이터
   */
  constructor(config) {
    this.id = config.id || generateId();
    this.name = config.name || 'Untitled Layer';
    this.type = config.type || 'group';
    this.visible = config.visible !== undefined ? config.visible : true;
    this.order = config.order !== undefined ? config.order : 0;
    this.p_id = config.p_id || null; // 부모 ID
    this.children = [];
    this.data = config.data || {};

    // children이 있으면 addChild를 통해 추가 (p_id 자동 설정)
    if (config.children && config.children.length > 0) {
      config.children.forEach(child => {
        this.addChild(child);
      });
    }
  }

  /**
   * 자손 레이어 추가
   * @param {Layer} layer - 추가할 레이어
   * @returns {Layer} this
   */
  addChild(layer) {
    if (!(layer instanceof Layer)) {
      throw new Error('Child must be a Layer instance');
    }
    layer.p_id = this.id; // 부모 ID 설정

    // order 자동 설정 (기존 자식 중 최대 order + 1)
    if (this.children.length > 0) {
      const maxOrder = Math.max(...this.children.map(c => c.order));
      layer.order = maxOrder + 1;
    } else {
      layer.order = 0;
    }

    this.children.push(layer);
    return this;
  }

  /**
   * 자손 레이어 제거
   * @param {string} layerId - 제거할 레이어 ID
   * @returns {boolean} 제거 성공 여부
   */
  removeChild(layerId) {
    const index = this.children.findIndex(child => child.id === layerId);
    if (index !== -1) {
      const removed = this.children.splice(index, 1)[0];
      removed.p_id = null; // 부모 ID 제거
      return true;
    }
    return false;
  }

  /**
   * visible 설정 (자손도 함께 변경)
   * @param {boolean} visible - 표시 여부
   * @param {boolean} recursive - 자손도 함께 변경할지 여부 (기본: true)
   */
  setVisible(visible, recursive = true) {
    this.visible = visible;

    // 그룹 레이어이고 recursive가 true면 자식들도 함께 변경
    if (recursive && this.type === 'group' && this.children.length > 0) {
      this.children.forEach(child => {
        child.setVisible(visible, recursive);
      });
    }
  }

  /**
   * 레이어 정보 문자열
   * @returns {string} 레이어 정보
   */
  toString() {
    const childrenInfo = this.children.length > 0
      ? ` (${this.children.length} children)`
      : '';
    return `Layer[${this.type}] ${this.name}${childrenInfo}`;
  }
}

// ============================================================================
// Layer Service - 레이어 비즈니스 로직
// ============================================================================


/**
 * ID로 자손 레이어 찾기 (재귀적)
 * @param {Layer} layer - 검색할 레이어
 * @param {string} layerId - 찾을 레이어 ID
 * @returns {Layer|null} 찾은 레이어 또는 null
 */
function findLayerById(layer, layerId) {
  if (layer.id === layerId) {
    return layer;
  }

  for (const child of layer.children) {
    const found = findLayerById(child, layerId);
    if (found) {
      return found;
    }
  }

  return null;
}

/**
 * 레이어 트리를 평탄화 (DFS 순회)
 * @param {Layer} layer - 평탄화할 레이어
 * @param {boolean} onlyVisible - visible한 레이어만 포함 (기본: false)
 * @returns {Array} 평탄화된 레이어 배열 [{layer, depth}, ...]
 */
function flattenLayers(layer, onlyVisible = false) {
  const result = [];

  const traverse = (currentLayer, depth = 0) => {
    if (onlyVisible && !currentLayer.visible) {
      return;
    }

    // 현재 레이어 추가 (depth 정보 포함)
    result.push({
      layer: currentLayer,
      depth
    });

    // 자손 레이어 순회
    if (currentLayer.children && currentLayer.children.length > 0) {
      // order로 정렬
      const sortedChildren = [...currentLayer.children].sort((a, b) => a.order - b.order);
      sortedChildren.forEach(child => traverse(child, depth + 1));
    }
  };

  traverse(layer);
  return result;
}

/**
 * 렌더링 가능한 레이어만 추출 (group 제외)
 * @param {Layer} layer - 검색할 레이어
 * @returns {Layer[]} 렌더링 가능한 레이어 배열
 */
function getRenderableLayers(layer) {
  const flattened = flattenLayers(layer, true);
  return flattened
    .filter(item => item.layer.type !== 'group')
    .map(item => item.layer);
}

/**
 * 레이어를 JSON으로 직렬화
 * @param {Layer} layer - 직렬화할 레이어
 * @returns {Object} JSON 객체
 */
function serializeLayer(layer) {
  return {
    id: layer.id,
    name: layer.name,
    type: layer.type,
    visible: layer.visible,
    order: layer.order,
    p_id: layer.p_id,
    children: layer.children.map(child => serializeLayer(child)),
    data: layer.data
  };
}

/**
 * JSON에서 레이어 복원
 * @param {Object} json - JSON 객체
 * @returns {Layer} 복원된 레이어
 */
function deserializeLayer(json) {
  const layer = new Layer({
    id: json.id,
    name: json.name,
    type: json.type,
    visible: json.visible,
    order: json.order,
    p_id: json.p_id,
    data: json.data
  });

  // 자손 레이어 복원 (addChild를 통해 p_id 자동 설정)
  if (json.children) {
    json.children.forEach(childJson => {
      const child = deserializeLayer(childJson);
      layer.addChild(child);
    });
  }

  return layer;
}

// ============================================================================
// LayerManager - 레이어 관리 컨트롤러
// ============================================================================


/**
 * LayerManager 클래스
 * 레이어 트리 관리, CRUD, 순서 변경 등
 */
class LayerManager {
  constructor() {
    this.root = new Layer({
      id: 'root',
      name: 'comp',
      type: 'group',
      visible: true
    });

    // 이벤트 리스너
    this.listeners = {
      add: [],
      remove: [],
      update: [],
      reorder: [],
      clear: []
    };
  }

  // ============================================================================
  // 레이어 CRUD
  // ============================================================================

  /**
   * 레이어 추가
   * @param {Layer} layer - 추가할 레이어
   * @param {string} parentId - 부모 레이어 ID (기본: 'root')
   * @returns {boolean} 성공 여부
   */
  addLayer(layer, parentId = 'root') {
    if (!(layer instanceof Layer)) {
      console.error('Layer must be an instance of Layer class');
      return false;
    }

    const parent = this.findLayer(parentId);
    if (!parent) {
      console.error(`Parent layer not found: ${parentId}`);
      return false;
    }

    parent.addChild(layer); // addChild가 p_id 자동 설정
    this._emit('add', { layer, parentId });
    return true;
  }

  /**
   * 레이어 제거
   * @param {string} layerId - 제거할 레이어 ID
   * @returns {boolean} 성공 여부
   */
  removeLayer(layerId) {
    // root는 제거 불가
    if (layerId === 'root') {
      console.error('Cannot remove root layer');
      return false;
    }

    // 삭제 전에 레이어 정보 저장 (이벤트에 전달하기 위해)
    const layer = this.findLayer(layerId);
    if (!layer) {
      console.error(`Layer not found: ${layerId}`);
      return false;
    }

    // 부모에서 제거
    const parent = this.findParent(layerId);
    if (parent && parent.removeChild(layerId)) {
      this._emit('remove', { layerId, layer });
      return true;
    }

    return false;
  }

  /**
   * 레이어 찾기
   * @param {string} layerId - 찾을 레이어 ID
   * @returns {Layer|null} 찾은 레이어 또는 null
   */
  findLayer(layerId) {
    return findLayerById(this.root, layerId);
  }

  /**
   * 부모 레이어 찾기
   * @param {string} layerId - 자식 레이어 ID
   * @returns {Layer|null} 부모 레이어 또는 null
   */
  findParent(layerId) {
    const findParentRecursive = (layer, targetId) => {
      for (const child of layer.children) {
        if (child.id === targetId) {
          return layer;
        }
        const found = findParentRecursive(child, targetId);
        if (found) {
          return found;
        }
      }
      return null;
    };

    return findParentRecursive(this.root, layerId);
  }

  /**
   * 레이어 업데이트
   * @param {string} layerId - 업데이트할 레이어 ID
   * @param {Object} updates - 업데이트할 속성들
   * @returns {boolean} 성공 여부
   */
  updateLayer(layerId, updates) {
    const layer = this.findLayer(layerId);
    if (!layer) {
      console.error(`Layer not found: ${layerId}`);
      return false;
    }

    // 업데이트 적용 (id, p_id, children는 직접 수정 불가)
    Object.keys(updates).forEach(key => {
      if (key in layer && key !== 'id' && key !== 'p_id' && key !== 'children') {
        // visible 속성은 setVisible 메서드 사용 (자손도 함께 변경)
        if (key === 'visible') {
          layer.setVisible(updates[key]);
        } else {
          layer[key] = updates[key];
        }
      }
    });

    this._emit('update', { layerId, updates });
    return true;
  }

  // ============================================================================
  // 레이어 순서 관리
  // ============================================================================

  /**
   * 레이어 순서 변경 (같은 부모 내에서)
   * @param {string} layerId - 이동할 레이어 ID
   * @param {number} newOrder - 새 order 값
   * @returns {boolean} 성공 여부
   */
  reorderLayer(layerId, newOrder) {
    const layer = this.findLayer(layerId);
    if (!layer) {
      console.error(`Layer not found: ${layerId}`);
      return false;
    }

    const oldOrder = layer.order;
    layer.order = newOrder;

    this._emit('reorder', { layerId, oldOrder, newOrder });
    return true;
  }

  /**
   * 레이어를 다른 부모로 이동
   * @param {string} layerId - 이동할 레이어 ID
   * @param {string} newParentId - 새 부모 레이어 ID
   * @param {number} order - 새 부모 내에서의 order (기본: 마지막)
   * @returns {boolean} 성공 여부
   */
  moveLayer(layerId, newParentId, order = -1) {
    const layer = this.findLayer(layerId);
    const newParent = this.findLayer(newParentId);

    if (!layer || !newParent) {
      console.error('Layer or parent not found');
      return false;
    }

    // 순환 참조 방지: newParent가 layer의 자손인지 확인
    if (findLayerById(newParent, layerId)) {
      console.error('Cannot move layer to its own descendant');
      return false;
    }

    // 기존 부모에서 제거
    const oldParent = this.findParent(layerId);
    if (oldParent) {
      oldParent.removeChild(layerId);
    }

    // 새 부모에 추가
    if (order >= 0) {
      layer.order = order;
    } else {
      // 마지막 order + 1
      const maxOrder = Math.max(0, ...newParent.children.map(c => c.order));
      layer.order = maxOrder + 1;
    }

    newParent.addChild(layer); // addChild가 p_id 자동 설정
    this._emit('reorder', { layerId, newParentId, order: layer.order });
    return true;
  }

  // ============================================================================
  // 레이어 조회
  // ============================================================================

  /**
   * 모든 레이어 가져오기 (평탄화)
   * @param {boolean} onlyVisible - visible한 레이어만 (기본: false)
   * @returns {Array} 레이어 배열 [{layer, depth}, ...]
   */
  getAllLayers(onlyVisible = false) {
    return flattenLayers(this.root, onlyVisible);
  }

  /**
   * 렌더링 가능한 레이어만 가져오기
   * @returns {Layer[]} 렌더링 가능한 레이어 배열
   */
  getRenderableLayers() {
    return getRenderableLayers(this.root);
  }

  /**
   * 타입별 레이어 가져오기
   * @param {string} type - 레이어 타입
   * @returns {Layer[]} 해당 타입의 레이어 배열
   */
  getLayersByType(type) {
    const allLayers = this.getAllLayers();
    return allLayers
      .filter(item => item.layer.type === type)
      .map(item => item.layer);
  }

  /**
   * 레이어 검색
   * @param {Function} predicate - 검색 조건 함수
   * @returns {Layer[]} 검색 결과 레이어 배열
   */
  findLayers(predicate) {
    const allLayers = this.getAllLayers();
    return allLayers
      .filter(item => predicate(item.layer))
      .map(item => item.layer);
  }

  // ============================================================================
  // 레이어 상태 관리
  // ============================================================================

  /**
   * 레이어 표시/숨김
   * @param {string} layerId - 레이어 ID
   * @param {boolean} visible - 표시 여부
   * @returns {boolean} 성공 여부
   */
  setLayerVisibility(layerId, visible) {
    return this.updateLayer(layerId, { visible });
  }

  /**
   * 모든 레이어 삭제 (root 제외)
   */
  clearAll() {
    this.root.children = [];
    this._emit('clear', {});
  }

  // ============================================================================
  // JSON 입출력
  // ============================================================================

  /**
   * JSON으로 직렬화
   * @returns {Object} JSON 객체
   */
  toJSON() {
    return {
      version: '3.0.0',
      root: serializeLayer(this.root)
    };
  }

  /**
   * JSON에서 복원
   * @param {Object} json - JSON 객체
   * @returns {boolean} 성공 여부
   */
  fromJSON(json) {
    try {
      this.root = deserializeLayer(json.root);
      return true;
    } catch (error) {
      console.error('Failed to load from JSON:', error);
      return false;
    }
  }

  /**
   * JSON 문자열로 내보내기
   * @param {boolean} pretty - 포맷팅 여부
   * @returns {string} JSON 문자열
   */
  exportJSON(pretty = true) {
    return pretty
      ? JSON.stringify(this.toJSON(), null, 2)
      : JSON.stringify(this.toJSON());
  }

  /**
   * JSON 문자열에서 가져오기
   * @param {string} jsonString - JSON 문자열
   * @returns {boolean} 성공 여부
   */
  importJSON(jsonString) {
    try {
      const json = JSON.parse(jsonString);
      return this.fromJSON(json);
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      return false;
    }
  }

  // ============================================================================
  // 이벤트 시스템
  // ============================================================================

  /**
   * 이벤트 리스너 등록
   * @param {string} event - 이벤트 이름 ('add'|'remove'|'update'|'reorder'|'clear')
   * @param {Function} callback - 콜백 함수
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  /**
   * 이벤트 리스너 제거
   * @param {string} event - 이벤트 이름
   * @param {Function} callback - 콜백 함수
   */
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  /**
   * 이벤트 발생 (내부용)
   * @param {string} event - 이벤트 이름
   * @param {Object} data - 이벤트 데이터
   */
  _emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  // ============================================================================
  // 유틸리티
  // ============================================================================

  /**
   * 레이어 통계 정보
   * @returns {Object} 통계 정보
   */
  getStats() {
    const allLayers = this.getAllLayers();
    return calculateStats(allLayers);
  }

  /**
   * 디버그 정보 출력
   */
  debug() {
    const stats = this.getStats();
    printDebugTree(this.root, stats);
  }
}

// ============================================================================
// LayerTimeline DTO - 타임라인 데이터 구조
// ============================================================================

/**
 * LayerTimeline 클래스
 * 레이어별 애니메이션 타임라인 관리
 */
class LayerTimeline {
  constructor() {
    this.animations = new Map(); // layerId -> animation config
    this.timeline = [];
    this.currentTime = 0;
    this.isPlaying = false;
    this.duration = 0;
    this.onUpdate = null;
    this._lastTimestamp = null;
  }
}

// ============================================================================
// Timeline Utils - 타임라인 유틸리티 함수
// ============================================================================

/**
 * 이징 함수 적용
 * @param {number} t - 진행도 (0~1)
 * @param {string} easing - 이징 타입
 * @returns {number} 이징이 적용된 진행도
 */
function applyEasing(t, easing) {
  switch (easing) {
    case 'linear':
      return t;
    case 'easeOut':
      return 1 - Math.pow(1 - t, 3);
    case 'easeIn':
      return t * t * t;
    case 'easeInOut':
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    case 'easeOutBack':
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    default:
      return t;
  }
}

// ============================================================================
// Timeline Service - 타임라인 비즈니스 로직
// ============================================================================


/**
 * 타임라인 재구성
 * @param {LayerTimeline} timelineInstance - 타임라인 인스턴스
 */
function rebuildTimeline(timelineInstance) {
  timelineInstance.timeline = Array.from(timelineInstance.animations.values());

  // 전체 지속 시간 계산
  timelineInstance.duration = timelineInstance.timeline.reduce((max, anim) => {
    return Math.max(max, anim.startTime + anim.duration);
  }, 0);
}

/**
 * 특정 레이어의 애니메이션 진행도 계산
 * @param {Object} animation - 애니메이션 설정
 * @param {number} currentTime - 현재 시간
 * @returns {number} 진행도 (0~1)
 */
function calculateProgress(animation, currentTime) {
  const { startTime, duration } = animation;

  if (currentTime < startTime) return 0;
  if (currentTime >= startTime + duration) return 1;

  return (currentTime - startTime) / duration;
}

/**
 * 현재 활성화된 애니메이션 가져오기
 * @param {LayerTimeline} timelineInstance - 타임라인 인스턴스
 * @returns {Array} [{layerId, progress, effect, effectOptions}, ...]
 */
function getActiveAnimations(timelineInstance) {
  return timelineInstance.timeline.map(anim => {
    const progress = calculateProgress(anim, timelineInstance.currentTime);
    const easedProgress = applyEasing(progress, anim.easing);

    return {
      layerId: anim.layerId,
      progress: easedProgress,
      rawProgress: progress,
      effect: anim.effect,
      effectOptions: anim.effectOptions,
      status: progress === 0 ? 'pending' : (progress === 1 ? 'completed' : 'active')
    };
  });
}

/**
 * 전체 진행도 (0~1)
 * @param {LayerTimeline} timelineInstance - 타임라인 인스턴스
 * @returns {number}
 */
function getProgress(timelineInstance) {
  return timelineInstance.duration > 0
    ? timelineInstance.currentTime / timelineInstance.duration
    : 0;
}

/**
 * 애니메이션 정보
 * @param {LayerTimeline} timelineInstance - 타임라인 인스턴스
 * @returns {Object}
 */
function getInfo(timelineInstance) {
  return {
    currentTime: timelineInstance.currentTime,
    duration: timelineInstance.duration,
    progress: getProgress(timelineInstance),
    isPlaying: timelineInstance.isPlaying,
    animationCount: timelineInstance.animations.size
  };
}

/**
 * 업데이트 알림
 * @param {LayerTimeline} timelineInstance - 타임라인 인스턴스
 */
function notifyUpdate(timelineInstance) {
  if (timelineInstance.onUpdate) {
    const activeAnimations = getActiveAnimations(timelineInstance);
    timelineInstance.onUpdate(
      activeAnimations,
      timelineInstance.currentTime,
      timelineInstance.duration
    );
  }
}

// ============================================================================
// LayerTimeline Controller - 타임라인 제어
// ============================================================================


// LayerTimeline 클래스에 메서드 추가
Object.assign(LayerTimeline.prototype, {
  // ============================================================================
  // 애니메이션 설정
  // ============================================================================

  /**
   * 레이어에 애니메이션 추가
   * @param {string} layerId - 레이어 ID
   * @param {Object} config - 애니메이션 설정
   * @param {number} config.startTime - 시작 시간 (ms)
   * @param {number} config.duration - 지속 시간 (ms)
   * @param {string|Array<string>} config.effect - 효과 타입
   * @param {Object} config.effectOptions - 효과 옵션
   * @param {string} config.easing - 이징 함수
   */
  addAnimation(layerId, config) {
    const animation = {
      layerId,
      startTime: config.startTime || 0,
      duration: config.duration || 1000,
      effect: config.effect || 'fade',
      effectOptions: config.effectOptions || {},
      easing: config.easing || 'easeOut'
    };

    this.animations.set(layerId, animation);
    rebuildTimeline(this);

    return this;
  },

  /**
   * 레이어 애니메이션 업데이트
   * @param {string} layerId - 레이어 ID
   * @param {Object} updates - 업데이트할 속성들
   */
  updateAnimation(layerId, updates) {
    const animation = this.animations.get(layerId);
    if (!animation) {
      console.warn(`Animation not found for layer: ${layerId}`);
      return this;
    }

    // 업데이트할 속성만 적용
    if (updates.startTime !== undefined) animation.startTime = updates.startTime;
    if (updates.duration !== undefined) animation.duration = updates.duration;
    if (updates.effect !== undefined) animation.effect = updates.effect;
    if (updates.effectOptions !== undefined) animation.effectOptions = updates.effectOptions;
    if (updates.easing !== undefined) animation.easing = updates.easing;

    rebuildTimeline(this);
    return this;
  },

  /**
   * 레이어 애니메이션 제거
   * @param {string} layerId - 레이어 ID
   */
  removeAnimation(layerId) {
    this.animations.delete(layerId);
    rebuildTimeline(this);
    return this;
  },

  /**
   * 모든 애니메이션 제거
   */
  clearAnimations() {
    this.animations.clear();
    this.timeline = [];
    this.duration = 0;
    return this;
  },

  // ============================================================================
  // 재생 제어
  // ============================================================================

  /**
   * 애니메이션 재생
   */
  play() {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this._lastTimestamp = performance.now();
    this._animate();
  },

  /**
   * 애니메이션 일시정지
   */
  pause() {
    this.isPlaying = false;
  },

  /**
   * 애니메이션 정지 및 초기화
   */
  stop() {
    this.isPlaying = false;
    this.currentTime = 0;
    notifyUpdate(this);
  },

  /**
   * 특정 시간으로 이동
   * @param {number} time - 시간 (ms)
   */
  seekTo(time) {
    this.currentTime = Math.max(0, Math.min(time, this.duration));
    notifyUpdate(this);
  },

  /**
   * 진행도로 이동 (0~1)
   * @param {number} progress - 진행도
   */
  seekToProgress(progress) {
    this.seekTo(progress * this.duration);
  },

  /**
   * 애니메이션 루프
   */
  _animate() {
    if (!this.isPlaying) return;

    const now = performance.now();
    const delta = now - this._lastTimestamp;
    this._lastTimestamp = now;

    this.currentTime += delta;

    // 종료 확인
    if (this.currentTime >= this.duration) {
      this.currentTime = this.duration;
      this.isPlaying = false;

      // 마지막 프레임 렌더링 (모든 Progress를 1.0으로)
      notifyUpdate(this);
    } else {
      notifyUpdate(this);

      if (this.isPlaying) {
        requestAnimationFrame(() => this._animate());
      }
    }
  },

  // ============================================================================
  // 애니메이션 상태 조회
  // ============================================================================

  /**
   * 현재 활성화된 애니메이션 가져오기
   * @returns {Array} [{layerId, progress, effect, effectOptions}, ...]
   */
  getActiveAnimations() {
    return getActiveAnimations(this);
  },

  /**
   * 전체 진행도 (0~1)
   * @returns {number}
   */
  getProgress() {
    return getProgress(this);
  },

  /**
   * 애니메이션 정보
   * @returns {Object}
   */
  getInfo() {
    return getInfo(this);
  }
});

// ============================================================================
// Fade Effect - 페이드 효과
// @version 3.0.0
// ============================================================================

/**
 * 페이드 효과 적용 (페이드 인)
 * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
 * @param {number} progress - 진행도 (0~1)
 * @param {Function} renderCallback - 렌더링 콜백
 */
function applyFade(ctx, progress, renderCallback) {
  ctx.save();
  ctx.globalAlpha = progress;
  renderCallback();
  ctx.restore();
}

/**
 * 페이드아웃 효과 적용
 * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
 * @param {number} progress - 진행도 (0~1)
 * @param {Function} renderCallback - 렌더링 콜백
 */
function applyFadeOut(ctx, progress, renderCallback) {
  ctx.save();
  ctx.globalAlpha = 1 - progress; // 페이드아웃: 1 → 0
  renderCallback();
  ctx.restore();
}

// ============================================================================
// Slide Effect - 슬라이드 효과
// @version 3.0.0
// ============================================================================

/**
 * 슬라이드 효과 적용
 * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
 * @param {number} progress - 진행도 (0~1)
 * @param {Object} options - 효과 옵션
 * @param {string} options.direction - 방향 ('up'|'down'|'left'|'right')
 * @param {number} options.distance - 이동 거리 (기본값: 520)
 * @param {Function} renderCallback - 렌더링 콜백
 */
function applySlide(ctx, progress, options, renderCallback) {
  const direction = options.direction || 'up';
  const distance = options.distance || 520;
  const easedProgress = 1 - Math.pow(1 - progress, 3);
  const offset = (1 - easedProgress) * distance;

  ctx.save();
  ctx.globalAlpha = progress;

  switch (direction) {
    case 'up':
      ctx.translate(0, offset);
      break;
    case 'down':
      ctx.translate(0, -offset);
      break;
    case 'left':
      ctx.translate(offset, 0);
      break;
    case 'right':
      ctx.translate(-offset, 0);
      break;
  }

  renderCallback();
  ctx.restore();
}

// ============================================================================
// Scale Effect - 스케일 효과
// @version 3.0.0
// ============================================================================

/**
 * 스케일 효과 적용
 * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
 * @param {number} progress - 진행도 (0~1)
 * @param {Object} options - 효과 옵션
 * @param {number} options.from - 시작 스케일 (기본값: 0)
 * @param {number} options.to - 종료 스케일 (기본값: 1)
 * @param {number} options.centerX - 중심점 X (기본값: 0)
 * @param {number} options.centerY - 중심점 Y (기본값: 0)
 * @param {Function} renderCallback - 렌더링 콜백
 */
function applyScale(ctx, progress, options, renderCallback) {
  const fromScale = options.from || 0;
  const toScale = options.to || 1;
  const centerX = options.centerX || 0;
  const centerY = options.centerY || 0;

  const c1 = 1.70158;
  const c3 = c1 + 1;
  const easedProgress = 1 + c3 * Math.pow(progress - 1, 3) + c1 * Math.pow(progress - 1, 2);
  const scale = fromScale + (toScale - fromScale) * easedProgress;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(scale, scale);
  ctx.translate(-centerX, -centerY);
  ctx.globalAlpha = progress;

  renderCallback();
  ctx.restore();
}

// ============================================================================
// Draw Effect - 그리기 효과 (clipping 기반)
// @version 3.0.0
// ============================================================================

/**
 * 그리기 효과 적용 - clipping을 사용하여 점진적으로 나타남
 * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
 * @param {number} progress - 진행도 (0~1)
 * @param {Object} options - 효과 옵션
 * @param {string} options.direction - 방향 ('left-to-right'|'right-to-left'|'top-to-bottom'|'bottom-to-top')
 * @param {Function} renderCallback - 렌더링 콜백
 */
function applyDraw(ctx, progress, options, renderCallback) {
  const direction = options.direction || 'left-to-right'; // 'left-to-right', 'right-to-left', 'top-to-bottom', 'bottom-to-top'
  const canvas = ctx.canvas;

  // transform을 확인하여 실제 적용된 scale 값 사용
  const transform = ctx.getTransform();
  const currentScale = transform.a; // transform.a는 x축 scale, transform.d는 y축 scale

  // canvas의 논리적 크기 = 물리적 크기 / 실제 적용된 scale
  const width = canvas.width / currentScale;
  const height = canvas.height / currentScale;

  ctx.save();

  // progress에 따라 clipping 영역 설정
  ctx.beginPath();
  switch (direction) {
    case 'left-to-right':
      ctx.rect(0, 0, width * progress, height);
      break;
    case 'right-to-left':
      const startX = width * (1 - progress);
      ctx.rect(startX, 0, width * progress, height);
      break;
    case 'top-to-bottom':
      ctx.rect(0, 0, width, height * progress);
      break;
    case 'bottom-to-top':
      const startY = height * (1 - progress);
      ctx.rect(0, startY, width, height * progress);
      break;
    default:
      ctx.rect(0, 0, width * progress, height);
  }
  ctx.clip();

  // 전체를 그리지만 clipping 영역만 보임
  renderCallback();
  ctx.restore();
}

// ============================================================================
// Blink Effect - 깜빡임 효과
// @version 3.0.0
// ============================================================================

/**
 * 깜빡임 효과 적용
 * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
 * @param {number} progress - 진행도 (0~1)
 * @param {Object} options - 효과 옵션
 * @param {number} options.frequency - 깜빡임 횟수 (기본값: 3)
 * @param {number} options.minAlpha - 최소 투명도 (기본값: 0)
 * @param {number} options.maxAlpha - 최대 투명도 (기본값: 1)
 * @param {number} options.fadeInEnd - 페이드인 종료 지점 (기본값: 0.2)
 * @param {number} options.fadeOutStart - 페이드아웃 시작 지점 (기본값: 0.8)
 * @param {Function} renderCallback - 렌더링 콜백
 */
function applyBlink(ctx, progress, options, renderCallback) {
  const frequency = options.frequency || 3; // 깜빡임 횟수
  const minAlpha = options.minAlpha || 0; // 최소 투명도
  const maxAlpha = options.maxAlpha || 1; // 최대 투명도
  const fadeInEnd = options.fadeInEnd || 0.2; // 페이드인 종료 지점
  const fadeOutStart = options.fadeOutStart || 0.8; // 페이드아웃 시작 지점

  let alpha;

  // 애니메이션 종료 시(progress >= 1.0) 완전히 표시
  if (progress >= 1.0) {
    alpha = maxAlpha;
  } else if (progress <= fadeInEnd) {
    // fadeInEnd 이전: maxAlpha에서 점진적으로 깜빡임 시작
    const fadeProgress = progress / fadeInEnd; // 0~1

    // 깜빡임 효과
    const cycle = Math.sin(progress * Math.PI * 2 * frequency);
    const blinkAlpha = minAlpha + (maxAlpha - minAlpha) * (cycle * 0.5 + 0.5);

    // maxAlpha에서 깜빡임으로 점진적 전환
    alpha = maxAlpha * (1 - fadeProgress) + blinkAlpha * fadeProgress;
  } else if (progress >= fadeOutStart) {
    // fadeOutStart 이후: 깜빡임을 점진적으로 줄이며 maxAlpha로 수렴
    const fadeProgress = (progress - fadeOutStart) / (1.0 - fadeOutStart); // 0~1

    // 깜빡임 효과
    const cycle = Math.sin(progress * Math.PI * 2 * frequency);
    const blinkAlpha = minAlpha + (maxAlpha - minAlpha) * (cycle * 0.5 + 0.5);

    // 깜빡임과 maxAlpha 사이를 fadeProgress로 보간
    alpha = blinkAlpha * (1 - fadeProgress) + maxAlpha * fadeProgress;
  } else {
    // 일반 깜빡임
    const cycle = Math.sin(progress * Math.PI * 2 * frequency);
    alpha = minAlpha + (maxAlpha - minAlpha) * (cycle * 0.5 + 0.5);
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  renderCallback();
  ctx.restore();
}

// ============================================================================
// Animation Service - 애니메이션 효과 결정 및 옵션 조정
// ============================================================================

/**
 * 레이어 타입에 따라 자동으로 효과 결정
 * @param {Object} layer - 레이어 객체
 * @param {string|Array<string>} effect - 효과 타입 ('auto'일 경우 레이어 타입에 따라 자동 결정)
 * @returns {string|Array<string>} 결정된 효과
 */
function getEffectForLayer(layer, effect = 'auto') {
  // 배열인 경우 그대로 반환 (여러 효과 중첩)
  if (Array.isArray(effect)) {
    return effect;
  }

  // 'auto'가 아니면 지정된 효과 그대로 사용
  if (effect !== 'auto') {
    return effect;
  }

  // 'auto'인 경우 레이어 타입에 따라 자동 결정
  if (!layer || !layer.type) {
    return 'slide'; // 기본값
  }

  switch (layer.type) {
    case 'line':
    case 'linear':
    case 'quadratic':
    case 'function':
      // 선(직선/수직선/수평선), 함수(선형/이차)는 draw 효과
      return 'draw';
    case 'point':
    case 'shape':
      // 점이나 도형은 fade 효과
      return 'fade';
    default:
      // 기타는 fade 효과
      return 'fade';
  }
}

/**
 * 레이어 타입에 따라 효과 옵션 조정
 * @param {Object} layer - 레이어 객체
 * @param {string|Array<string>} effect - 효과
 * @param {Object} options - 원본 옵션
 * @returns {Object} 조정된 옵션
 */
function adjustOptionsForLayer(layer, effect, options) {
  // line 타입이고 draw 효과인 경우
  if (layer && layer.type === 'line' && (effect === 'draw' || (Array.isArray(effect) && effect.includes('draw')))) {
    const lineType = layer.data?.lineType;

    // 이미 direction이 설정되어 있으면 그대로 사용
    if (options.direction) {
      return options;
    }

    // lineType에 따라 자동으로 direction 설정
    const adjustedOptions = { ...options };
    if (lineType === 'vertical') {
      adjustedOptions.direction = 'bottom-to-top';
    } else if (lineType === 'horizontal') {
      adjustedOptions.direction = 'left-to-right';
    } else if (lineType === 'segment') {
      // segment는 from/to 좌표를 보고 수직/수평 판단
      const from = layer.data?.from;
      const to = layer.data?.to;

      if (from && to) {
        // 수직선: x 좌표가 같음
        if (from.x === to.x) {
          // from.y > to.y 이면 위에서 아래로 (점에서 축으로)
          if (from.y > to.y) {
            adjustedOptions.direction = 'top-to-bottom';
          } else {
            adjustedOptions.direction = 'bottom-to-top';
          }
        }
        // 수평선: y 좌표가 같음
        else if (from.y === to.y) {
          // from.x > to.x 이면 오른쪽에서 왼쪽으로 (점에서 축으로)
          if (from.x > to.x) {
            adjustedOptions.direction = 'right-to-left';
          } else {
            adjustedOptions.direction = 'left-to-right';
          }
        }
        // 대각선: 기본값 사용
        else {
          adjustedOptions.direction = 'left-to-right';
        }
      } else {
        adjustedOptions.direction = 'left-to-right';
      }
    } else {
      // 기타는 기본값 사용
      adjustedOptions.direction = options.direction || 'left-to-right';
    }

    return adjustedOptions;
  }

  return options;
}

// ============================================================================
// LayerAnimationEffects - 애니메이션 효과 적용
// ============================================================================


/**
 * LayerAnimationEffects - 애니메이션 효과 적용 클래스
 */
class LayerAnimationEffects {
  /**
   * 레이어 타입에 따라 자동으로 효과 결정
   * @param {Object} layer - 레이어 객체
   * @param {string|Array<string>} effect - 효과 타입
   * @returns {string|Array<string>} 결정된 효과
   */
  static getEffectForLayer(layer, effect = 'auto') {
    return getEffectForLayer(layer, effect);
  }

  /**
   * 레이어와 함께 효과 적용
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} layer - 레이어 객체
   * @param {number} progress - 진행도 (0~1)
   * @param {string|Array<string>} effect - 효과 타입
   * @param {Object} options - 효과 옵션
   * @param {Function} renderCallback - 렌더링 콜백
   */
  static applyWithLayer(ctx, layer, progress, effect, options, renderCallback) {
    // effect가 'auto'이면 레이어 타입에 따라 자동 결정
    const finalEffect = getEffectForLayer(layer, effect);

    // line 타입에 대해 draw 효과 방향 자동 설정
    const finalOptions = adjustOptionsForLayer(layer, finalEffect, options);

    // 효과 적용
    this.apply(ctx, progress, finalEffect, finalOptions, renderCallback);
  }

  /**
   * 효과 적용
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {number} progress - 진행도 (0~1)
   * @param {string|Array<string>} effect - 효과 타입
   * @param {Object} options - 효과 옵션
   * @param {Function} renderCallback - 렌더링 콜백
   */
  static apply(ctx, progress, effect, options, renderCallback) {
    // effect가 배열인 경우 여러 효과를 중첩 적용
    if (Array.isArray(effect)) {
      this.applyMultiple(ctx, progress, effect, options, renderCallback);
      return;
    }

    // 단일 효과 적용
    switch (effect) {
      case 'fade':
        applyFade(ctx, progress, renderCallback);
        break;
      case 'fade-out':
        applyFadeOut(ctx, progress, renderCallback);
        break;
      case 'slide':
        applySlide(ctx, progress, options, renderCallback);
        break;
      case 'scale':
        applyScale(ctx, progress, options, renderCallback);
        break;
      case 'draw':
        applyDraw(ctx, progress, options, renderCallback);
        break;
      case 'blink':
        applyBlink(ctx, progress, options, renderCallback);
        break;
      case 'none':
      default:
        renderCallback();
        break;
    }
  }

  /**
   * 여러 효과를 중첩 적용
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {number} progress - 진행도 (0~1)
   * @param {Array<string>} effects - 효과 배열
   * @param {Object} options - 효과 옵션
   * @param {Function} renderCallback - 렌더링 콜백
   */
  static applyMultiple(ctx, progress, effects, options, renderCallback) {
    if (!effects || effects.length === 0) {
      renderCallback();
      return;
    }

    // 재귀적으로 효과를 중첩 적용
    const applyNext = (index) => {
      if (index >= effects.length) {
        renderCallback();
        return;
      }

      const currentEffect = effects[index];
      const effectOptions = options[currentEffect] || options;

      this.apply(ctx, progress, currentEffect, effectOptions, () => {
        applyNext(index + 1);
      });
    };

    applyNext(0);
  }
}

/**
 * 차트 좌표 시스템
 * Canvas 좌표 변환 함수 생성
 */


class CoordinateSystem {
  /**
   * 좌표 시스템 생성
   * @param {HTMLCanvasElement} canvas - Canvas 요소
   * @param {number} padding - 차트 패딩
   * @param {number} classCount - 계급 개수
   * @param {Object} ellipsisInfo - 중략 정보
   * @param {number} maxY - Y축 최댓값
   * @param {string} dataType - 데이터 타입
   * @param {number} customYInterval - 커스텀 Y축 간격 (없으면 자동 계산)
   * @returns {Object} 좌표 변환 함수와 스케일 객체
   */
  static create(canvas, padding, classCount, ellipsisInfo, maxY, dataType = 'relativeFrequency', customYInterval = null) {
    const chartW = canvas.width - padding * 2;
    const chartH = canvas.height - padding * 2;

    let xScale, toX;

    if (ellipsisInfo && ellipsisInfo.show) {
      // 중략 표시: 빈 구간을 1칸으로 압축
      const firstDataIdx = ellipsisInfo.firstDataIndex;
      const visibleClasses = 1 + (classCount - firstDataIdx);
      xScale = chartW / visibleClasses;

      toX = (index) => {
        if (index === 0) return padding;
        if (index < firstDataIdx) return padding + xScale;
        return padding + xScale + (index - firstDataIdx) * xScale;
      };
    } else {
      // 기본 방식: 모든 계급을 동일 간격으로
      xScale = chartW / classCount;
      toX = (index) => padding + index * xScale;
    }

    // 그리드 설정 계산
    let adjustedMaxY, gridDivisions;

    if (customYInterval && customYInterval > 0) {
      // 커스텀 간격 사용 (도수 모드일 때 간격 2칸 여백 적용)
      const targetMax = (dataType === 'frequency')
        ? Math.ceil(maxY) + (customYInterval * 2)
        : maxY;
      gridDivisions = Math.ceil(targetMax / customYInterval);
      adjustedMaxY = gridDivisions * customYInterval;
    } else {
      // 자동 계산 (스마트 격자)
      const gridConfig = CONFIG.calculateGridDivisions(maxY, dataType);
      adjustedMaxY = gridConfig.maxY;
      gridDivisions = gridConfig.divisions;
    }

    const yScale = chartH / adjustedMaxY;
    const toY = (value) => {
      return canvas.height - padding - value * yScale;
    };

    return { toX, toY, xScale, chartH, gridDivisions, adjustedMaxY };
  }

  /**
   * 막대의 중앙 X 좌표 계산
   * @param {number} index - 계급 인덱스
   * @param {Function} toX - X 좌표 변환 함수
   * @param {number} xScale - X축 스케일
   * @returns {number} 막대 중앙의 X 좌표
   */
  static getBarCenterX(index, toX, xScale) {
    return toX(index) + xScale * CONFIG.CHART_BAR_CENTER_OFFSET;
  }

  /**
   * 중략 구간을 건너뛸지 판단
   * @param {number} index - 현재 인덱스
   * @param {Object} ellipsisInfo - 중략 정보
   * @returns {boolean} 건너뛸지 여부
   */
  static shouldSkipEllipsis(index, ellipsisInfo) {
    if (!ellipsisInfo || !ellipsisInfo.show) return false;
    const firstDataIdx = ellipsisInfo.firstDataIndex;
    return index > 0 && index < firstDataIdx;
  }
}

/**
 * KaTeX 웹폰트 Canvas 렌더링 유틸리티
 * KaTeX 폰트를 Canvas에서 직접 사용하여 수학 스타일 텍스트 렌더링
 */

// 폰트 로드 상태
let fontsLoaded = false;

// KaTeX 폰트 패밀리
const KATEX_FONTS = {
  main: 'KaTeX_Main',      // 일반 숫자, 기호
  math: 'KaTeX_Math'};

/**
 * KaTeX 폰트 로드 대기
 * @param {number} timeout - 최대 대기 시간 (ms)
 * @returns {Promise<boolean>}
 */
async function waitForFonts(timeout = 3000) {
  if (fontsLoaded) return true;

  try {
    // document.fonts API 사용
    if (document.fonts) {
      // KaTeX 폰트를 명시적으로 로드 요청
      const fontPromises = [
        document.fonts.load('18px KaTeX_Main'),
        document.fonts.load('italic 18px KaTeX_Math')
      ];

      await Promise.race([
        Promise.all(fontPromises),
        new Promise((_, reject) => setTimeout(() => reject('timeout'), timeout))
      ]);

      // 폰트 로드 완료 확인
      fontsLoaded = document.fonts.check('18px KaTeX_Main');
    }
  } catch (e) {
    console.warn('폰트 로드 대기 중 오류:', e);
    // 타임아웃이어도 계속 진행 (폴백 폰트 사용)
    fontsLoaded = true;
  }

  return fontsLoaded;
}

/**
 * 텍스트 타입 감지
 * @param {string} text - 분석할 텍스트
 * @returns {'number'|'variable'|'text'|'mixed'} 텍스트 타입
 */
function detectTextType(text) {
  const str = String(text).trim();

  // 숫자만 (소수점, 음수 포함)
  if (/^-?\d+\.?\d*$/.test(str)) {
    return 'number';
  }

  // 소문자 알파벳 (변수) - 이탤릭
  if (/^[a-z]$/.test(str)) {
    return 'variable';
  }

  // 대문자 알파벳 - regular
  if (/^[A-Z]$/.test(str)) {
    return 'text';
  }

  return 'mixed';
}

/**
 * 텍스트 타입에 따른 폰트 반환
 * @param {string} textType - 텍스트 타입
 * @param {number} fontSize - 폰트 크기
 * @param {boolean} italic - 이탤릭 여부
 * @returns {string} CSS font 문자열
 */
function getFont(textType, fontSize, italic = false) {
  const style = italic ? 'italic ' : '';

  switch (textType) {
    case 'number':
    case 'text':
      // 숫자, 대문자 알파벳: regular
      return `${fontSize}px ${KATEX_FONTS.main}, Times New Roman, serif`;
    case 'variable':
      // 소문자 알파벳: 이탤릭
      return `italic ${fontSize}px ${KATEX_FONTS.math}, ${KATEX_FONTS.main}, Times New Roman, serif`;
    default:
      return `${style}${fontSize}px ${KATEX_FONTS.main}, Times New Roman, serif`;
  }
}

/**
 * 하이픈(-)을 유니코드 마이너스(−, U+2212)로 변환
 * @param {string} text - 변환할 텍스트
 * @returns {string} 변환된 텍스트
 */
function convertHyphenToMinus(text) {
  return text.replace(/-/g, '−');
}

/**
 * Canvas에 수학 스타일 텍스트 렌더링
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {string} text - 렌더링할 텍스트
 * @param {number} x - X 좌표
 * @param {number} y - Y 좌표
 * @param {Object} options - 옵션
 * @returns {{width: number, height: number}} 렌더링된 크기
 */
function renderMathText(ctx, text, x, y, options = {}) {
  const {
    fontSize = 18,
    color = '#e5e7eb',
    align = 'left',
    baseline = 'middle',
    italic = null  // null이면 자동 감지
  } = options;

  ctx.save();

  // 하이픈을 유니코드 마이너스로 변환
  const str = convertHyphenToMinus(String(text).trim());

  const textType = detectTextType(str);

  // mixed 타입일 때 문자별로 분리하여 렌더링 (소문자는 이탤릭)
  if (textType === 'mixed') {
    ctx.fillStyle = color;
    ctx.textBaseline = baseline;

    const segments = splitByCharType(str);

    // 전체 너비 계산
    let totalWidth = 0;
    segments.forEach(seg => {
      ctx.font = getFontForCharType(seg.type, fontSize);
      totalWidth += ctx.measureText(seg.text).width;
    });

    // 시작 위치 계산
    let startX = x;
    if (align === 'center') startX = x - totalWidth / 2;
    else if (align === 'right') startX = x - totalWidth;

    // 세그먼트별 렌더링
    ctx.textAlign = 'left';
    let currentX = startX;
    segments.forEach(seg => {
      ctx.font = getFontForCharType(seg.type, fontSize);
      ctx.fillText(seg.text, currentX, y);
      currentX += ctx.measureText(seg.text).width;
    });

    ctx.restore();
    return { width: totalWidth, height: fontSize };
  }

  const useItalic = italic !== null ? italic : textType === 'variable';

  ctx.font = getFont(textType, fontSize, useItalic);
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;

  ctx.fillText(str, x, y);

  const metrics = ctx.measureText(str);
  const width = metrics.width;
  const height = fontSize;

  ctx.restore();

  return { width, height };
}

/**
 * Canvas에 첨자가 있는 텍스트 렌더링 (예: x², A₁)
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {string} base - 기본 텍스트
 * @param {string} superscript - 위 첨자 (선택)
 * @param {string} subscript - 아래 첨자 (선택)
 * @param {number} x - X 좌표
 * @param {number} y - Y 좌표
 * @param {Object} options - 옵션
 * @returns {{width: number, height: number}} 렌더링된 크기
 */
function renderWithScript(ctx, base, superscript, subscript, x, y, options = {}) {
  const {
    fontSize = 18,
    color = '#e5e7eb',
    align = 'left',
    baseline = 'middle'
  } = options;

  ctx.save();
  ctx.fillStyle = color;

  // 기본 텍스트
  const baseType = detectTextType(base);
  ctx.font = getFont(baseType, fontSize);
  ctx.textAlign = 'left';
  ctx.textBaseline = baseline;

  // 정렬 처리를 위한 전체 너비 계산
  const baseMetrics = ctx.measureText(base);
  const scriptFontSize = fontSize * 0.7;
  ctx.font = getFont('number', scriptFontSize);

  let totalWidth = baseMetrics.width;
  if (superscript) totalWidth += ctx.measureText(superscript).width;
  if (subscript) totalWidth += ctx.measureText(subscript).width;

  // 시작 위치 계산
  let startX = x;
  if (align === 'center') {
    startX = x - totalWidth / 2;
  } else if (align === 'right') {
    startX = x - totalWidth;
  }

  // 기본 텍스트 그리기
  ctx.font = getFont(baseType, fontSize);
  ctx.textBaseline = baseline;
  ctx.fillText(base, startX, y);
  startX += baseMetrics.width;

  // 위 첨자 그리기
  if (superscript) {
    ctx.font = getFont('number', scriptFontSize);
    const superOffset = fontSize * 0.35;
    ctx.fillText(superscript, startX, y - superOffset);
    startX += ctx.measureText(superscript).width;
  }

  // 아래 첨자 그리기
  if (subscript) {
    ctx.font = getFont('number', scriptFontSize);
    const subOffset = fontSize * 0.1;
    ctx.fillText(subscript, startX, y + subOffset);
  }

  ctx.restore();

  return { width: totalWidth, height: fontSize };
}

/**
 * Canvas에 분수 렌더링
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {string} numerator - 분자
 * @param {string} denominator - 분모
 * @param {number} x - X 좌표
 * @param {number} y - Y 좌표
 * @param {Object} options - 옵션
 * @returns {{width: number, height: number}} 렌더링된 크기
 */
function renderFraction(ctx, numerator, denominator, x, y, options = {}) {
  const {
    fontSize = 18,
    color = '#e5e7eb',
    align = 'center',
    baseline = 'middle'
  } = options;

  ctx.save();
  ctx.fillStyle = color;

  const fracFontSize = fontSize * 0.75;
  ctx.font = getFont('number', fracFontSize);

  // 분자, 분모 너비 측정
  const numWidth = ctx.measureText(numerator).width;
  const denWidth = ctx.measureText(denominator).width;
  const lineWidth = Math.max(numWidth, denWidth) + 4;

  // 전체 크기
  const totalWidth = lineWidth;
  const totalHeight = fontSize * 1.5;

  // 시작 위치 계산
  let startX = x;
  if (align === 'center') {
    startX = x - totalWidth / 2;
  } else if (align === 'right') {
    startX = x - totalWidth;
  }

  let startY = y;
  if (baseline === 'middle') {
    startY = y;
  } else if (baseline === 'top') {
    startY = y + totalHeight / 2;
  } else if (baseline === 'bottom') {
    startY = y - totalHeight / 2;
  }

  // 분자 그리기
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(numerator, startX + lineWidth / 2, startY - 2);

  // 분수선 그리기
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(startX + lineWidth, startY);
  ctx.stroke();

  // 분모 그리기
  ctx.textBaseline = 'top';
  ctx.fillText(denominator, startX + lineWidth / 2, startY + 2);

  ctx.restore();

  return { width: totalWidth, height: totalHeight };
}

/**
 * 간편 API: 텍스트를 자동으로 분석하여 렌더링
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {string} text - 렌더링할 텍스트 (예: "145", "x", "x^2", "1/2")
 * @param {number} x - X 좌표
 * @param {number} y - Y 좌표
 * @param {Object} options - 옵션
 * @returns {{width: number, height: number}} 렌더링된 크기
 */
function render$1(ctx, text, x, y, options = {}) {
  const str = String(text).trim();

  // 분수 패턴 (예: 1/2, a/b)
  const fractionMatch = str.match(/^(.+)\/(.+)$/);
  if (fractionMatch && !str.includes(' ')) {
    return renderFraction(ctx, fractionMatch[1], fractionMatch[2], x, y, options);
  }

  // 첨자 패턴 (예: x^2, A_1, x^2_1)
  const scriptMatch = str.match(/^([^_^]+)(?:\^([^_]+))?(?:_(.+))?$/);
  if (scriptMatch && (scriptMatch[2] || scriptMatch[3])) {
    return renderWithScript(ctx, scriptMatch[1], scriptMatch[2], scriptMatch[3], x, y, options);
  }

  // 일반 텍스트
  return renderMathText(ctx, str, x, y, options);
}

/**
 * 폰트 로드 상태 확인
 * @returns {boolean}
 */
function isFontsLoaded() {
  return fontsLoaded;
}

/**
 * 문자 유형 분류
 * @param {string} char - 단일 문자
 * @returns {'lowercase'|'uppercase'|'korean'|'other'}
 */
function getCharType(char) {
  if (/[a-z]/.test(char)) return 'lowercase';
  if (/[A-Z]/.test(char)) return 'uppercase';
  if (/[가-힣]/.test(char)) return 'korean';
  return 'other';
}

/**
 * 텍스트를 문자 유형별로 분리
 * @param {string} text - 분석할 텍스트
 * @returns {Array<{text: string, type: string}>}
 */
function splitByCharType(text) {
  const result = [];
  let current = { text: '', type: null };

  for (const char of text) {
    const type = getCharType(char);
    if (type === current.type) {
      current.text += char;
    } else {
      if (current.text) result.push(current);
      current = { text: char, type };
    }
  }
  if (current.text) result.push(current);
  return result;
}

/**
 * 문자 유형별 폰트 반환
 * @param {string} type - 문자 유형 ('lowercase', 'uppercase', 'korean', 'other')
 * @param {number} fontSize - 폰트 크기
 * @returns {string} CSS 폰트 문자열
 */
function getFontForCharType(type, fontSize) {
  if (type === 'lowercase') {
    // 영어 소문자: KaTeX_Math 이탤릭
    return `italic ${fontSize}px ${KATEX_FONTS.math}, ${KATEX_FONTS.main}, Times New Roman, serif`;
  }
  if (type === 'korean') {
    // 한글: SCDream 폰트 사용
    return `500 ${fontSize}px 'SCDream', sans-serif`;
  }
  // 대문자, 숫자, 기호 등: KaTeX_Main
  return `${fontSize}px ${KATEX_FONTS.main}, Times New Roman, serif`;
}

/**
 * 혼합 텍스트 렌더링 (축 라벨용)
 * 소문자는 KaTeX_Math 이탤릭, 그 외는 KaTeX_Main으로 렌더링
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {string} text - 렌더링할 텍스트
 * @param {number} x - X 좌표
 * @param {number} y - Y 좌표
 * @param {Object} options - 옵션
 * @returns {{width: number, height: number}}
 */
function renderMixedText(ctx, text, x, y, options = {}) {
  const { fontSize = 14, color = '#e5e7eb', align = 'right', baseline = 'middle' } = options;

  ctx.save();
  ctx.fillStyle = color;
  ctx.textBaseline = baseline;

  // 전체 너비 계산
  const segments = splitByCharType(text);
  let totalWidth = 0;
  segments.forEach(seg => {
    ctx.font = getFontForCharType(seg.type, fontSize);
    totalWidth += ctx.measureText(seg.text).width;
  });

  // 시작 위치 계산
  let startX = x;
  if (align === 'center') startX = x - totalWidth / 2;
  else if (align === 'right') startX = x - totalWidth;

  // 세그먼트별 렌더링
  ctx.textAlign = 'left';
  let currentX = startX;
  segments.forEach(seg => {
    ctx.font = getFontForCharType(seg.type, fontSize);
    // 한글 폰트(SCDream)가 KaTeX 폰트보다 위에 있으므로 아래로 보정
    const yOffset = seg.type === 'korean' ? fontSize * 0.12 : 0;
    ctx.fillText(seg.text, currentX, y + yOffset);
    currentX += ctx.measureText(seg.text).width;
  });

  ctx.restore();
  return { width: totalWidth, height: fontSize };
}

var KatexUtils = {
  waitForFonts,
  render: render$1,
  renderMathText,
  renderWithScript,
  renderFraction,
  renderMixedText,
  splitByCharType,
  getFontForCharType,
  isFontsLoaded
};

/**
 * 말풍선 렌더러
 * 다각형 포인트에 정보 표시용 말풍선 렌더링
 */


class CalloutRenderer {
  /**
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   */
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * 말풍선 레이어 렌더링
   * @param {Layer} layer - 말풍선 레이어
   */
  render(layer) {
    const { x, y, text, width, height, opacity, polygonPreset, pointX, pointY } = layer.data;

    if (!text || opacity === 0) return;

    this.ctx.save();
    this.ctx.globalAlpha = opacity || 1.0;

    // 말풍선 도형 그리기
    this._drawCalloutShape(x, y, width, height);

    // 말풍선에서 최고점까지 점선 연결
    this._drawConnectorLine(x, y, width, height, pointX, pointY, polygonPreset);

    // 오른쪽 세로 막대 그리기
    this._drawAccentBar(x, y, width, height, polygonPreset);

    // 텍스트 그리기
    this._drawText(x, y, width, height, text, polygonPreset);

    this.ctx.restore();
  }

  /**
   * 말풍선 도형 그리기 (배경만, 테두리 없음)
   * @param {number} x - 말풍선 왼쪽 상단 x
   * @param {number} y - 말풍선 왼쪽 상단 y
   * @param {number} width - 너비
   * @param {number} height - 높이
   */
  _drawCalloutShape(x, y, width, height) {
    const ctx = this.ctx;

    // 일반 사각형 그리기 (둥글기 없음)
    ctx.fillStyle = CONFIG.getColor('--chart-callout-bg-start');
    ctx.fillRect(x, y, width, height);
  }

  /**
   * 말풍선에서 최고점까지 점선 연결
   * @param {number} x - 말풍선 왼쪽 상단 x
   * @param {number} y - 말풍선 왼쪽 상단 y
   * @param {number} width - 말풍선 너비
   * @param {number} height - 말풍선 높이
   * @param {number} pointX - 최고점 x 좌표
   * @param {number} pointY - 최고점 y 좌표
   * @param {string} polygonPreset - 다각형 색상 프리셋
   */
  _drawConnectorLine(x, y, width, height, pointX, pointY, polygonPreset) {
    const ctx = this.ctx;

    // 시작점: 말풍선 오른쪽 끝 세로 막대의 중앙
    const startX = x + width;
    const startY = y + height / 2;

    // 끝점: 도수 다각형의 최고점
    const endX = pointX;
    const endY = pointY;

    // 프리셋에 따른 선 색상
    const preset = polygonPreset || 'default';
    const lineColor = CONFIG.CALLOUT_ACCENT_COLORS[preset] || CONFIG.CALLOUT_ACCENT_COLORS.default;

    // 점선 스타일 설정
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = CONFIG.getScaledCalloutLineWidth();
    ctx.setLineDash(CONFIG.getScaledCalloutDashPattern());

    // 점선 그리기
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // 점선 스타일 초기화 (다른 렌더링에 영향 없도록)
    ctx.setLineDash([]);
  }

  /**
   * 오른쪽 세로 막대 그리기
   * @param {number} x - 말풍선 왼쪽 상단 x
   * @param {number} y - 말풍선 왼쪽 상단 y
   * @param {number} width - 말풍선 너비
   * @param {number} height - 말풍선 높이
   * @param {string} polygonPreset - 다각형 색상 프리셋
   */
  _drawAccentBar(x, y, width, height, polygonPreset) {
    const ctx = this.ctx;
    const barWidth = CONFIG.getScaledCalloutAccentBarWidth();

    // 프리셋에 따른 색상 가져오기 (기본값: default)
    const preset = polygonPreset || 'default';
    const barColor = CONFIG.CALLOUT_ACCENT_COLORS[preset] || CONFIG.CALLOUT_ACCENT_COLORS.default;

    // 오른쪽 끝에 세로 막대 그리기
    ctx.fillStyle = barColor;
    ctx.fillRect(x + width - barWidth, y, barWidth, height);
  }

  /**
   * 텍스트 렌더링 (줄바꿈 지원)
   * @param {number} x - 말풍선 x
   * @param {number} y - 말풍선 y
   * @param {number} width - 말풍선 너비
   * @param {number} height - 말풍선 높이
   * @param {string} text - 텍스트 (\\n으로 줄바꿈)
   * @param {string} polygonPreset - 다각형 색상 프리셋
   */
  _drawText(x, y, width, height, text, polygonPreset) {
    const lineHeight = CONFIG.getScaledCalloutLineHeight();

    // 프리셋에 따른 텍스트 색상
    const preset = polygonPreset || 'default';
    const textColor = CONFIG.CALLOUT_TEXT_COLORS[preset] || CONFIG.CALLOUT_TEXT_COLORS.default;

    // 줄바꿈 분할
    const lines = text.split('\n');

    // 텍스트 시작 위치 (수직 중앙 정렬)
    const totalTextHeight = lines.length * lineHeight;
    const textY = y + (height - totalTextHeight) / 2;

    lines.forEach((line, i) => {
      const textX = x + width / 2; // 가로 중앙
      const lineY = textY + i * lineHeight;
      // KaTeX 규칙 적용 렌더링 (소문자 이탤릭 등)
      renderMixedText(this.ctx, line, textX, lineY, {
        fontSize: CONFIG.getScaledFontSize(20),
        color: textColor,
        align: 'center',
        baseline: 'top'
      });
    });
  }

  /**
   * 템플릿 문자열을 실제 데이터로 치환
   * @param {string} template - 템플릿 문자열
   * @param {Object} classData - 계급 데이터
   * @param {string} dataType - 데이터 타입
   * @returns {string} 치환된 텍스트
   */
  static formatTemplate(template, classData, dataType = 'relativeFrequency') {
    if (!template || !classData) return '';

    // 데이터 타입에 따른 값 선택
    let value = classData.relativeFreq;
    let valueSuffix = '%';

    if (dataType === 'frequency') {
      value = classData.frequency;
      valueSuffix = '';
    }

    return template
      .replace(/{min}/g, classData.min)
      .replace(/{max}/g, classData.max)
      .replace(/{midpoint}/g, classData.midpoint)
      .replace(/{frequency}/g, classData.frequency)
      .replace(/{relativeFreq}/g, classData.relativeFreq)
      .replace(/{cumulativeFreq}/g, classData.cumulativeFreq || 0)
      .replace(/{cumulativeRelFreq}/g, classData.cumulativeRelFreq || 0)
      .replace(/{value}/g, value)
      .replace(/{valueSuffix}/g, valueSuffix)
      .replace(/\\n/g, '\n'); // 줄바꿈 지원
  }

  /**
   * 텍스트 너비 측정 (줄바꿈 고려하여 최대 너비 반환)
   * @param {string} text - 텍스트 (\\n으로 줄바꿈)
   * @param {string} font - 폰트
   * @returns {number} 텍스트 너비 (px)
   */
  static measureTextWidth(text, font = CONFIG.CALLOUT_FONT) {
    // 임시 캔버스 생성
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = font;

    // 줄바꿈이 있는 경우 각 줄의 최대 너비 반환
    const lines = text.split('\n');
    let maxWidth = 0;

    lines.forEach(line => {
      const metrics = ctx.measureText(line);
      maxWidth = Math.max(maxWidth, metrics.width);
    });

    return maxWidth;
  }

  /**
   * 말풍선 너비 계산 (텍스트 너비 + 여백)
   * 여백은 전체 너비의 1/5씩 양쪽 (총 2/5), 텍스트는 3/5
   * @param {string} text - 텍스트
   * @param {string} font - 폰트
   * @returns {number} 말풍선 너비 (px)
   */
  static calculateCalloutWidth(text, font = CONFIG.CALLOUT_FONT) {
    const textWidth = this.measureTextWidth(text, font);
    const accentBarWidth = CONFIG.CALLOUT_ACCENT_BAR_WIDTH;

    // 텍스트가 전체의 60%를 차지하도록
    // 너비 = 텍스트너비 / 0.6
    const totalWidth = textWidth / CONFIG.CALLOUT_TEXT_WIDTH_RATIO;

    // 세로 막대 너비를 포함한 최종 너비
    return Math.ceil(totalWidth) + accentBarWidth;
  }
}

/**
 * 레이어 팩토리
 * 차트 레이어 생성 로직
 */


class LayerFactory {
  /**
   * 레이어 생성
   * @param {LayerManager} layerManager - 레이어 매니저
   * @param {Array} classes - 계급 데이터
   * @param {Array} values - 값 배열 (상대도수 또는 도수)
   * @param {Object} coords - 좌표 시스템
   * @param {Object} ellipsisInfo - 중략 정보
   * @param {string} dataType - 데이터 타입 ('relativeFrequency', 'frequency', 등)
   * @param {string} calloutTemplate - 말풍선 템플릿
   * @param {Array<number>} hiddenPolygonIndices - 숨길 다각형 점/선 인덱스 배열
   */
  static createLayers(layerManager, classes, values, coords, ellipsisInfo, dataType = 'relativeFrequency', calloutTemplate = null, hiddenPolygonIndices = []) {
    // clearAll() 제거: 기존 레이어 유지하면서 새 레이어 추가
    // layerManager.clearAll();

    // 레이어 ID 중복 방지를 위한 타임스탬프
    const timestamp = Date.now();

    // 데이터 타입 정보 가져오기
    const dataTypeInfo = CONFIG.CHART_DATA_TYPES.find(t => t.id === dataType);
    const polygonName = dataTypeInfo ? `${dataTypeInfo.legendSuffix} 다각형` : '상대도수 다각형';

    // 히스토그램 그룹
    const histogramGroup = new Layer({
      id: `histogram-${timestamp}`,
      name: '히스토그램',
      type: 'group',
      visible: true
    });

    // 다각형 그룹 (동적 이름)
    const polygonGroup = new Layer({
      id: `polygon-${timestamp}`,
      name: polygonName,
      type: 'group',
      visible: true
    });

    // 막대 레이어 생성
    values.forEach((value, index) => {
      if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;

      // 도수가 0인 막대는 레이어 생성하지 않음
      if (classes[index].frequency === 0) return;

      // 계급명 생성 (예: "140~145")
      const className = Utils.getClassName(classes[index]);

      const barLayer = new Layer({
        id: `bar-${timestamp}-${index}`,
        name: className,
        type: 'bar',
        visible: true,
        data: {
          index,
          relativeFreq: value, // 실제로는 value (상대도수 또는 도수)
          frequency: classes[index].frequency
        }
      });

      histogramGroup.addChild(barLayer);
    });

    // 점 그룹
    const pointsGroup = new Layer({
      id: `points-${timestamp}`,
      name: '점',
      type: 'group',
      visible: true
    });

    // 선 그룹
    const linesGroup = new Layer({
      id: `lines-${timestamp}`,
      name: '선',
      type: 'group',
      visible: true
    });

    // 파선 그룹 (독립 레이어)
    const dashedLinesGroup = new Layer({
      id: `dashed-lines-${timestamp}`,
      name: '수직 파선',
      type: 'group',
      visible: CONFIG.SHOW_DASHED_LINES
    });

    // 점 레이어 생성 (도수 0인 계급도 포함)
    values.forEach((value, index) => {
      if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;

      // 계급명 생성
      const className = Utils.getClassName(classes[index]);

      // hidden 배열에 포함된 인덱스는 숨김
      const isHidden = hiddenPolygonIndices.includes(index);

      const pointLayer = new Layer({
        id: `point-${timestamp}-${index}`,
        name: `점(${className})`,
        type: 'point',
        visible: !isHidden,
        data: {
          index,
          relativeFreq: value, // 실제로는 value (상대도수 또는 도수)
          colorPreset: CONFIG.POLYGON_COLOR_PRESET // 색상 프리셋 저장
        }
      });

      pointsGroup.addChild(pointLayer);
    });

    // 선 레이어 생성
    let prevIndex = null;
    values.forEach((value, index) => {
      if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;

      if (prevIndex !== null) {
        // 시작 계급명과 끝 계급명
        const fromClassName = Utils.getClassName(classes[prevIndex]);
        const toClassName = Utils.getClassName(classes[index]);

        // hidden 인덱스와 연결된 선은 숨김 (from 또는 to가 hidden이면)
        const isLineHidden = hiddenPolygonIndices.includes(prevIndex) || hiddenPolygonIndices.includes(index);

        const lineLayer = new Layer({
          id: `line-${timestamp}-${prevIndex}-${index}`,
          name: `선(${fromClassName}→${toClassName})`,
          type: 'line',
          visible: !isLineHidden,
          data: {
            fromIndex: prevIndex,
            toIndex: index,
            fromFreq: values[prevIndex],
            toFreq: value,
            colorPreset: CONFIG.POLYGON_COLOR_PRESET // 색상 프리셋 저장
          }
        });

        linesGroup.addChild(lineLayer);
      }

      prevIndex = index;
    });

    // 파선 레이어 생성 (점에서 Y축까지 수직 파선)
    // SHOW_DASHED_LINES가 true일 때만 생성
    if (CONFIG.SHOW_DASHED_LINES) {
      values.forEach((value, index) => {
        if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;
        if (value === 0) return; // 값이 0인 파선은 생성하지 않음

        const className = Utils.getClassName(classes[index]);

        const dashedLineLayer = new Layer({
          id: `dashed-line-${timestamp}-${index}`,
          name: `파선(${className})`,
          type: 'dashed-line',
          visible: true,
          data: {
            index,
            relativeFreq: value,
            coords,
            dataType,
            histogramPreset: CONFIG.HISTOGRAM_COLOR_PRESET
          }
        });

        dashedLinesGroup.addChild(dashedLineLayer);
      });
    }

    // 렌더링 순서: 선 → 점 (점이 가장 위에 표시되도록)
    polygonGroup.addChild(linesGroup);
    polygonGroup.addChild(pointsGroup);

    // 렌더링 순서: 파선 → 히스토그램 → 다각형 → 라벨(조건부) → 말풍선
    // (파선이 히스토그램 뒤에 그려지도록 먼저 추가)
    if (CONFIG.SHOW_DASHED_LINES) {
      layerManager.addLayer(dashedLinesGroup);
    }
    if (CONFIG.SHOW_HISTOGRAM) {
      layerManager.addLayer(histogramGroup);
    }
    if (CONFIG.SHOW_POLYGON) {
      layerManager.addLayer(polygonGroup);
    }

    // 막대 라벨 그룹 (SHOW_BAR_LABELS가 true일 때만 생성)
    if (CONFIG.SHOW_BAR_LABELS) {
      const labelsGroup = new Layer({
        id: `bar-labels-${timestamp}`,
        name: '막대 라벨',
        type: 'group',
        visible: true
      });

      // 막대 라벨 레이어 생성
      values.forEach((value, index) => {
        if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;
        if (classes[index].frequency === 0) return;

        const className = Utils.getClassName(classes[index]);

        const labelLayer = new Layer({
          id: `bar-label-${timestamp}-${index}`,
          name: `라벨(${className})`,
          type: 'bar-label',
          visible: true,
          data: {
            index,
            relativeFreq: value,
            frequency: classes[index].frequency,
            dataType
          }
        });

        labelsGroup.addChild(labelLayer);
      });

      layerManager.addLayer(labelsGroup);
    }

    // 막대 커스텀 라벨 그룹 (SHOW_BAR_CUSTOM_LABELS가 true이고 라벨이 있을 때만)
    if (CONFIG.SHOW_BAR_CUSTOM_LABELS && Object.keys(CONFIG.BAR_CUSTOM_LABELS).length > 0) {
      const customLabelsGroup = new Layer({
        id: `bar-custom-labels-${timestamp}`,
        name: '막대 커스텀 라벨',
        type: 'group',
        visible: true
      });

      // 실제 표시되는 막대 기준 인덱스로 라벨 적용
      let visibleBarIndex = 0;
      values.forEach((value, index) => {
        // 막대 생성 조건과 동일하게 체크
        if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;
        if (classes[index].frequency === 0) return;

        // 표시되는 막대 인덱스 기준으로 라벨 조회
        const customLabel = CONFIG.BAR_CUSTOM_LABELS[visibleBarIndex];
        visibleBarIndex++;

        if (!customLabel) return;  // 해당 인덱스에 라벨 없으면 스킵

        const className = Utils.getClassName(classes[index]);

        const customLabelLayer = new Layer({
          id: `bar-custom-label-${timestamp}-${index}`,
          name: `커스텀라벨(${className}): ${customLabel}`,
          type: 'bar-custom-label',
          visible: true,
          data: { index, relativeFreq: value, customLabel, dataType, coords }
        });

        customLabelsGroup.addChild(customLabelLayer);
      });

      layerManager.addLayer(customLabelsGroup);
    }

    // 합동 삼각형 레이어 생성 (SHOW_CONGRUENT_TRIANGLES가 true일 때만)
    if (CONFIG.SHOW_CONGRUENT_TRIANGLES && CONFIG.SHOW_POLYGON) {
      this._createCongruentTriangleLayers(layerManager, values, coords, timestamp);
    }

    // 말풍선 레이어 생성 (템플릿이 제공된 경우)
    if (calloutTemplate) {
      const calloutLayer = this._createCalloutLayer(classes, values, coords, ellipsisInfo, dataType, calloutTemplate, timestamp, layerManager);
      if (calloutLayer) {
        layerManager.addLayer(calloutLayer);
      }
    }
  }

  /**
   * 말풍선 레이어 생성
   * @param {Array} classes - 계급 데이터
   * @param {Array} values - 값 배열
   * @param {Object} coords - 좌표 시스템
   * @param {Object} ellipsisInfo - 중략 정보
   * @param {string} dataType - 데이터 타입
   * @param {string} template - 말풍선 템플릿
   * @param {number} timestamp - 타임스탬프 (레이어 ID 중복 방지)
   * @param {LayerManager} layerManager - 레이어 매니저 (기존 말풍선 개수 확인용)
   * @returns {Layer|null} 말풍선 레이어
   */
  static _createCalloutLayer(classes, values, coords, ellipsisInfo, dataType, template, timestamp, layerManager) {
    // 최상단 포인트 찾기 (y값이 가장 큰 = 상대도수/도수가 가장 큰)
    let maxValue = -Infinity;
    let maxIndex = -1;

    values.forEach((value, index) => {
      if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;
      if (value > maxValue) {
        maxValue = value;
        maxIndex = index;
      }
    });

    if (maxIndex === -1) return null;

    // 템플릿 치환
    const text = CalloutRenderer.formatTemplate(template, classes[maxIndex], dataType);

    // 말풍선 너비 동적 계산 (텍스트 길이 기반)
    const calloutWidth = CalloutRenderer.calculateCalloutWidth(text);

    // 기존 말풍선 개수 확인 (세로 배치용)
    const existingCallouts = layerManager.getAllLayers().filter(({ layer }) => layer.type === 'callout');
    const calloutCount = existingCallouts.length;
    const calloutSpacing = CONFIG.getScaledValue(10); // 말풍선 간격 (스케일링)
    const scaledCalloutSize = CONFIG.getScaledCalloutSize();

    // 말풍선 위치 (차트 왼쪽 상단, 기존 말풍선 아래에 배치)
    const calloutX = CONFIG.getScaledPadding() + CONFIG.getScaledValue(CONFIG.CALLOUT_POSITION_X);
    const calloutY = CONFIG.getScaledPadding() + CONFIG.getScaledValue(CONFIG.CALLOUT_POSITION_Y) + (calloutCount * (scaledCalloutSize.height + calloutSpacing));

    // 포인트 좌표 계산 (애니메이션 참조용)
    const { toX, toY, xScale } = coords;
    const pointX = toX(maxIndex) + xScale * CONFIG.CHART_BAR_CENTER_OFFSET;
    const pointY = toY(maxValue);

    const calloutLayer = new Layer({
      id: `callout-${timestamp}`,
      name: '말풍선',
      type: 'callout',
      visible: true,
      data: {
        x: calloutX,
        y: calloutY,
        width: CONFIG.getScaledValue(calloutWidth),
        height: scaledCalloutSize.height,
        text,
        opacity: 0, // 초기 투명도 (애니메이션용)
        pointX,
        pointY,
        classIndex: maxIndex,
        polygonPreset: CONFIG.POLYGON_COLOR_PRESET // 다각형 프리셋 추가
      }
    });

    return calloutLayer;
  }

  /**
   * 합동 삼각형 레이어 생성
   * @param {LayerManager} layerManager - 레이어 매니저
   * @param {Array} values - 값 배열
   * @param {Object} coords - 좌표 시스템
   * @param {number} timestamp - 타임스탬프
   */
  static _createCongruentTriangleLayers(layerManager, values, coords, timestamp) {
    const i = CONFIG.CONGRUENT_TRIANGLE_INDEX;

    // 유효 범위 체크
    if (i < 0 || i >= values.length - 1) return;

    const { toX, toY, xScale } = coords;

    // 좌표 계산
    const p1x = CoordinateSystem.getBarCenterX(i, toX, xScale);
    const p1y = toY(values[i]);
    const p2x = CoordinateSystem.getBarCenterX(i + 1, toX, xScale);
    const p2y = toY(values[i + 1]);

    // 막대 경계 X (막대 i의 우측 = 막대 i+1의 좌측)
    const boundaryX = toX(i + 1);

    // 선과 막대 경계의 교점 Y 계산 (선형 보간)
    const t = (boundaryX - p1x) / (p2x - p1x);
    const intersectY = p1y + t * (p2y - p1y);

    // 선 방향에 따라 색상 결정 (위=파랑, 아래=빨강)
    const isLineGoingUp = p1y > p2y; // canvas Y좌표: 클수록 아래

    // 위쪽 삼각형 색상 (파란색 = 히스토그램)
    const upperColors = {
      fill: { start: CONFIG.getColor('--chart-bar-color'), end: CONFIG.getColor('--chart-bar-color-end') },
      stroke: { start: CONFIG.getColor('--chart-bar-stroke-start'), end: CONFIG.getColor('--chart-bar-stroke-end') },
      fillAlpha: CONFIG.CHART_BAR_ALPHA
    };

    // 아래쪽 삼각형 색상 (빨간색)
    const lowerColors = {
      fill: { start: CONFIG.TRIANGLE_A_FILL_START, end: CONFIG.TRIANGLE_A_FILL_END },
      stroke: { start: CONFIG.TRIANGLE_A_STROKE_START, end: CONFIG.TRIANGLE_A_STROKE_END }
    };

    // Triangle A: 선 상승 시 아래(빨강), 선 하강 시 위(파랑)
    const colorsA = isLineGoingUp ? lowerColors : upperColors;
    // Triangle B: 선 상승 시 위(파랑), 선 하강 시 아래(빨강)
    const colorsB = isLineGoingUp ? upperColors : lowerColors;

    // 삼각형 그룹
    const trianglesGroup = new Layer({
      id: `triangles-${timestamp}`,
      name: '합동 삼각형',
      type: 'group',
      visible: true
    });

    // 삼각형 A (막대 i 우측)
    const triangleA = new Layer({
      id: `triangle-a-${timestamp}`,
      name: '삼각형 A',
      type: 'triangle',
      visible: true,
      data: {
        points: [
          { x: p1x, y: p1y },           // 막대 i 중앙 상단 (다각형 점)
          { x: boundaryX, y: p1y },     // 막대 i 우측 상단 (막대 모서리)
          { x: boundaryX, y: intersectY } // 교점
        ],
        fillColors: colorsA.fill,
        strokeColors: colorsA.stroke,
        fillAlpha: colorsA.fillAlpha
      }
    });

    // 삼각형 B (막대 i+1 좌측)
    const triangleB = new Layer({
      id: `triangle-b-${timestamp}`,
      name: '삼각형 B',
      type: 'triangle',
      visible: true,
      data: {
        points: [
          { x: boundaryX, y: p2y },     // 막대 i+1 좌측 상단 (막대 모서리)
          { x: p2x, y: p2y },           // 막대 i+1 중앙 상단 (다각형 점)
          { x: boundaryX, y: intersectY } // 교점
        ],
        fillColors: colorsB.fill,
        strokeColors: colorsB.stroke,
        fillAlpha: colorsB.fillAlpha
      }
    });

    trianglesGroup.addChild(triangleA);
    trianglesGroup.addChild(triangleB);

    // 라벨 오프셋 (라벨과 직각 모서리 사이 거리) - 스케일링 적용
    const labelOffset = CONFIG.getScaledValue(30);

    // 라벨 위치 계산 (선 방향에 따라 결정)
    let labelPosBlue, labelPosRed;
    let rightAngleBlue, rightAngleRed;

    if (isLineGoingUp) {
      // 선 상승 시:
      // 파란(B) = S₁: 직각(boundaryX, p2y) 좌측 상단
      // 빨간(A) = S₂: 직각(boundaryX, p1y) 우측 하단
      rightAngleBlue = { x: boundaryX, y: p2y };
      rightAngleRed = { x: boundaryX, y: p1y };
      labelPosBlue = { x: boundaryX - labelOffset, y: p2y - labelOffset };
      labelPosRed = { x: boundaryX + labelOffset, y: p1y + labelOffset };
    } else {
      // 선 하강 시:
      // 파란(A) = S₁: 직각(boundaryX, p1y) 우측 상단
      // 빨간(B) = S₂: 직각(boundaryX, p2y) 좌측 하단
      rightAngleBlue = { x: boundaryX, y: p1y };
      rightAngleRed = { x: boundaryX, y: p2y };
      labelPosBlue = { x: boundaryX + labelOffset, y: p1y - labelOffset };
      labelPosRed = { x: boundaryX - labelOffset, y: p2y + labelOffset };
    }

    // S₁ 라벨 (파란 삼각형)
    const labelS1 = new Layer({
      id: `triangle-label-s1-${timestamp}`,
      name: '라벨 S₁',
      type: 'triangle-label',
      visible: true,
      data: {
        text: 'S',
        subscript: '1',
        x: labelPosBlue.x,
        y: labelPosBlue.y,
        color: '#008AFF'
      }
    });

    // S₂ 라벨 (빨간 삼각형)
    const labelS2 = new Layer({
      id: `triangle-label-s2-${timestamp}`,
      name: '라벨 S₂',
      type: 'triangle-label',
      visible: true,
      data: {
        text: 'S',
        subscript: '2',
        x: labelPosRed.x,
        y: labelPosRed.y,
        color: '#E749AF'
      }
    });

    // S₁ 점선 (라벨 → 직각 모서리)
    const lineS1 = new Layer({
      id: `triangle-label-line-s1-${timestamp}`,
      name: '점선 S₁',
      type: 'triangle-label-line',
      visible: true,
      data: {
        fromX: labelPosBlue.x,
        fromY: labelPosBlue.y,
        toX: rightAngleBlue.x,
        toY: rightAngleBlue.y,
        color: '#008AFF'
      }
    });

    // S₂ 점선 (라벨 → 직각 모서리)
    const lineS2 = new Layer({
      id: `triangle-label-line-s2-${timestamp}`,
      name: '점선 S₂',
      type: 'triangle-label-line',
      visible: true,
      data: {
        fromX: labelPosRed.x,
        fromY: labelPosRed.y,
        toX: rightAngleRed.x,
        toY: rightAngleRed.y,
        color: '#E749AF'
      }
    });

    trianglesGroup.addChild(lineS1);
    trianglesGroup.addChild(lineS2);
    trianglesGroup.addChild(labelS1);
    trianglesGroup.addChild(labelS2);

    layerManager.addLayer(trianglesGroup);
  }
}

/**
 * 히스토그램 렌더러
 * 막대 차트 렌더링 로직
 */


class HistogramRenderer {
  /**
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   */
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * 히스토그램 그리기 (정적 렌더링)
   * @param {Array} values - 값 배열 (상대도수 또는 도수)
   * @param {Array} freq - 도수 배열
   * @param {Object} coords - 좌표 시스템 객체
   * @param {Object} ellipsisInfo - 중략 정보
   * @param {string} dataType - 데이터 타입 ('relativeFrequency', 'frequency', 등)
   */
  draw(values, freq, coords, ellipsisInfo, dataType = 'relativeFrequency') {
    const { toX, toY, xScale } = coords;

    // 프리셋 색상 가져오기
    const preset = CONFIG.HISTOGRAM_COLOR_PRESETS[CONFIG.HISTOGRAM_COLOR_PRESET]
                || CONFIG.HISTOGRAM_COLOR_PRESETS.default;

    values.forEach((value, index) => {
      if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;

      const x = toX(index);
      const y = toY(value);
      const h = toY(0) - y;
      const barWidth = xScale * CONFIG.CHART_BAR_WIDTH_RATIO;

      // 그라디언트 막대
      const gradient = this.ctx.createLinearGradient(x, y, x, y + h);
      gradient.addColorStop(0, preset.fillStart);
      gradient.addColorStop(1, preset.fillEnd);

      this.ctx.globalAlpha = preset.alpha;
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(x, y, barWidth, h);
      this.ctx.globalAlpha = CONFIG.CHART_DEFAULT_ALPHA;

      // 그라디언트 테두리 (데이터가 있는 경우)
      if (freq[index] > 0) {
        const strokeGradient = Utils.createVerticalGradient(
          this.ctx, x, y, h,
          preset.strokeStart,
          preset.strokeEnd
        );
        this.ctx.strokeStyle = strokeGradient;
        this.ctx.lineWidth = CONFIG.getScaledLineWidth('normal');
        this.ctx.strokeRect(x, y, barWidth, h);
      }

      // 라벨은 별도 레이어에서 렌더링 (LayerFactory의 bar-label 레이어)
    });
  }

  /**
   * 개별 막대 렌더링 (레이어 시스템용)
   * @param {Layer} layer - 막대 레이어
   */
  renderBar(layer) {
    const { index, relativeFreq, frequency, coords, dataType } = layer.data;
    const { toX, toY, xScale } = coords;

    // 애니메이션 progress 가져오기 (0~1)
    const progress = layer.data.animationProgress !== undefined ? layer.data.animationProgress : 1;

    // 프리셋 색상 가져오기
    const preset = CONFIG.HISTOGRAM_COLOR_PRESETS[CONFIG.HISTOGRAM_COLOR_PRESET]
                || CONFIG.HISTOGRAM_COLOR_PRESETS.default;

    const x = toX(index);
    const baseY = toY(0); // 바닥 (높이 0)
    const fullY = toY(relativeFreq); // 최종 높이
    const fullH = baseY - fullY; // 전체 높이

    // progress에 따라 높이 조절 (밑에서 위로 자라남)
    const animatedH = fullH * progress;
    const animatedY = baseY - animatedH;
    const barWidth = xScale * CONFIG.CHART_BAR_WIDTH_RATIO;

    // 그라디언트 막대
    const gradient = this.ctx.createLinearGradient(x, animatedY, x, animatedY + animatedH);
    gradient.addColorStop(0, preset.fillStart);
    gradient.addColorStop(1, preset.fillEnd);

    this.ctx.globalAlpha = preset.alpha;
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, animatedY, barWidth, animatedH);
    this.ctx.globalAlpha = CONFIG.CHART_DEFAULT_ALPHA;

    // 그라디언트 테두리 (데이터가 있고 높이가 0보다 클 때만)
    if (frequency > 0 && animatedH > 0) {
      const strokeGradient = Utils.createVerticalGradient(
        this.ctx, x, animatedY, animatedH,
        preset.strokeStart,
        preset.strokeEnd
      );
      this.ctx.strokeStyle = strokeGradient;
      this.ctx.lineWidth = CONFIG.getScaledLineWidth('normal');
      this.ctx.strokeRect(x, animatedY, barWidth, animatedH);
    }

    // 라벨은 별도 레이어에서 렌더링 (LayerFactory의 bar-label 레이어)
  }

  /**
   * 막대 라벨 렌더링 (별도 레이어)
   * @param {Layer} layer - 라벨 레이어
   */
  renderBarLabel(layer) {
    if (!CONFIG.SHOW_BAR_LABELS) return;

    const { index, relativeFreq, frequency, coords, dataType } = layer.data;
    const { toX, toY, xScale } = coords;

    // 애니메이션 progress 가져오기 (0~1)
    const progress = layer.data.animationProgress !== undefined ? layer.data.animationProgress : 1;

    // progress가 0.5 이상일 때만 표시 (0.5~1.0 구간을 0~1로 매핑하여 fade)
    if (progress < 0.5) return;

    // 0.5~1.0을 0~1로 정규화하여 fade 효과
    const fadeProgress = (progress - 0.5) * 2;

    const labelValue = this._formatLabelValue(relativeFreq, frequency, dataType);
    const y = toY(relativeFreq);

    // fade 효과 적용 + KaTeX 폰트 사용
    this.ctx.save();
    this.ctx.globalAlpha = fadeProgress;
    render$1(this.ctx, labelValue,
      CoordinateSystem.getBarCenterX(index, toX, xScale),
      y - CONFIG.getScaledValue(CONFIG.CHART_LABEL_OFFSET) - CONFIG.getScaledValue(5),
      { fontSize: CONFIG.getScaledFontSize(12), color: CONFIG.getColor('--color-text'), align: 'center', baseline: 'middle' }
    );
    this.ctx.restore();
  }

  /**
   * 라벨 값 포맷팅
   * @param {number} value - 표시할 값 (상대도수 또는 도수)
   * @param {number} frequency - 도수
   * @param {string} dataType - 데이터 타입
   * @returns {string} 포맷팅된 라벨
   */
  _formatLabelValue(value, frequency, dataType = 'relativeFrequency') {
    if (dataType === 'frequency') {
      return frequency.toString();
    } else {
      // 상대도수: 백분율로 표시 (% 기호는 Y축 제목에 표시)
      const percentage = value * 100;
      const formatted = Utils.formatNumber(percentage);
      // .00 제거 (예: 20.00 → 20)
      return formatted.replace(/\.00$/, '');
    }
  }

  /**
   * 막대 내부 커스텀 라벨 렌더링
   * @param {Layer} layer - 커스텀 라벨 레이어
   */
  renderBarCustomLabel(layer) {
    const { index, relativeFreq, customLabel, coords } = layer.data;
    const { toX, toY, xScale } = coords;

    const progress = layer.data.animationProgress !== undefined ? layer.data.animationProgress : 1;
    if (progress < 0.5) return;  // 막대가 어느 정도 그려진 후 표시

    const fadeProgress = (progress - 0.5) * 2;

    // 막대 중앙 좌표 계산
    const barWidth = xScale * CONFIG.CHART_BAR_WIDTH_RATIO;
    const x = toX(index) + barWidth / 2;  // 가로 중앙

    // 세로 중앙 (애니메이션 progress 반영)
    const baseY = toY(0);
    const fullY = toY(relativeFreq);
    const animatedH = (baseY - fullY) * progress;
    const y = baseY - animatedH / 2;  // 세로 중앙

    this.ctx.save();
    this.ctx.globalAlpha = fadeProgress;
    render$1(this.ctx, customLabel, x, y, {
      fontSize: CONFIG.getScaledFontSize(CONFIG.BAR_CUSTOM_LABEL_FONT_SIZE),
      color: CONFIG.BAR_CUSTOM_LABEL_COLOR,
      align: 'center',
      baseline: 'middle'
    });
    this.ctx.restore();
  }

  /**
   * 막대 내부 커스텀 라벨 정적 렌더링
   * @param {Array} values - 값 배열 (상대도수 또는 도수)
   * @param {Array} freq - 도수 배열
   * @param {Object} coords - 좌표 시스템 객체
   * @param {Object} ellipsisInfo - 중략 정보
   */
  drawCustomLabelsStatic(values, freq, coords, ellipsisInfo) {
    const { toX, toY, xScale } = coords;
    const barWidth = xScale * CONFIG.CHART_BAR_WIDTH_RATIO;

    // 실제 표시되는 막대 기준 인덱스로 라벨 적용 (LayerFactory와 동일한 로직)
    let visibleBarIndex = 0;

    values.forEach((value, index) => {
      // 막대 생성 조건과 동일하게 체크
      if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;
      if (freq[index] === 0) return;  // 도수가 0인 막대는 스킵

      // 표시되는 막대 인덱스 기준으로 라벨 조회
      const customLabel = CONFIG.BAR_CUSTOM_LABELS[visibleBarIndex];
      visibleBarIndex++;

      if (!customLabel) return;

      // 막대 중앙 좌표 계산
      const x = toX(index) + barWidth / 2;
      const baseY = toY(0);
      const fullY = toY(value);
      const y = (baseY + fullY) / 2;  // 세로 중앙

      render$1(this.ctx, customLabel, x, y, {
        fontSize: CONFIG.getScaledFontSize(CONFIG.BAR_CUSTOM_LABEL_FONT_SIZE),
        color: CONFIG.BAR_CUSTOM_LABEL_COLOR,
        align: 'center',
        baseline: 'middle'
      });
    });
  }
}

/**
 * 다각형 렌더러
 * 상대도수 다각형 (점 + 선) 렌더링 로직
 */


class PolygonRenderer {
  /**
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   */
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * 상대도수 다각형 그리기 (정적 렌더링)
   * @param {Array} relativeFreqs - 상대도수 배열
   * @param {Object} coords - 좌표 시스템 객체
   * @param {Object} ellipsisInfo - 중략 정보
   * @param {Array<number>} hiddenIndices - 숨길 점/선 인덱스 배열
   */
  draw(relativeFreqs, coords, ellipsisInfo, hiddenIndices = []) {
    const { toX, toY, xScale } = coords;

    // 현재 프리셋의 색상 가져오기
    const preset = CONFIG.POLYGON_COLOR_PRESETS[CONFIG.POLYGON_COLOR_PRESET];
    const pointColor = preset?.pointColor || CONFIG.POLYGON_COLOR_PRESETS.default.pointColor;
    const gradientStart = preset?.gradientStart || CONFIG.POLYGON_COLOR_PRESETS.default.gradientStart;
    const gradientEnd = preset?.gradientEnd || CONFIG.POLYGON_COLOR_PRESETS.default.gradientEnd;

    // 선 그리기 (먼저 그려서 점 아래에 위치)
    let prevIndex = null;
    relativeFreqs.forEach((relativeFreq, index) => {
      if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;

      if (prevIndex !== null) {
        // hidden 인덱스와 연결된 선은 스킵
        const isLineHidden = hiddenIndices.includes(prevIndex) || hiddenIndices.includes(index);
        if (!isLineHidden) {
          const x1 = CoordinateSystem.getBarCenterX(prevIndex, toX, xScale);
          const y1 = toY(relativeFreqs[prevIndex]);
          const x2 = CoordinateSystem.getBarCenterX(index, toX, xScale);
          const y2 = toY(relativeFreq);

          // 그라디언트 선 (위에서 아래로)
          const lineGradient = Utils.createLineGradient(
            this.ctx, x1, y1, x2, y2,
            gradientStart,
            gradientEnd
          );

          this.ctx.strokeStyle = lineGradient;
          this.ctx.lineWidth = CONFIG.getScaledLineWidth('thick');
          this.ctx.beginPath();
          this.ctx.moveTo(x1, y1);
          this.ctx.lineTo(x2, y2);
          this.ctx.stroke();
        }
      }

      prevIndex = index;
    });

    // 점 그리기 (나중에 그려서 선 위에 위치)
    relativeFreqs.forEach((relativeFreq, index) => {
      if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;

      // hidden 인덱스는 스킵
      if (hiddenIndices.includes(index)) return;

      const centerX = CoordinateSystem.getBarCenterX(index, toX, xScale);
      const centerY = toY(relativeFreq);

      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, CONFIG.getScaledPointRadius(), 0, Math.PI * 2);
      this.ctx.fillStyle = pointColor;
      this.ctx.fill();
    });
  }

  /**
   * 개별 점 렌더링 (레이어 시스템용)
   * @param {Layer} layer - 점 레이어
   */
  renderPoint(layer) {
    const { index, relativeFreq, coords, colorPreset } = layer.data;
    const { toX, xScale } = coords;

    const centerX = CoordinateSystem.getBarCenterX(index, toX, xScale);
    const centerY = coords.toY(relativeFreq);

    // 레이어에 저장된 색상 프리셋 사용 (없으면 현재 CONFIG 사용)
    const presetName = colorPreset || CONFIG.POLYGON_COLOR_PRESET;
    const preset = CONFIG.POLYGON_COLOR_PRESETS[presetName];
    const pointColor = preset?.pointColor || CONFIG.POLYGON_COLOR_PRESETS.default.pointColor;

    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, CONFIG.getScaledPointRadius(), 0, Math.PI * 2);
    this.ctx.fillStyle = pointColor;
    this.ctx.fill();
  }

  /**
   * 개별 선 렌더링 (레이어 시스템용)
   * @param {Layer} layer - 선 레이어
   */
  renderLine(layer) {
    const { fromIndex, toIndex, fromFreq, toFreq, coords, colorPreset } = layer.data;
    const { toX, toY, xScale } = coords;

    const x1 = CoordinateSystem.getBarCenterX(fromIndex, toX, xScale);
    const y1 = toY(fromFreq);
    const x2 = CoordinateSystem.getBarCenterX(toIndex, toX, xScale);
    const y2 = toY(toFreq);

    // 레이어에 저장된 색상 프리셋 사용 (없으면 현재 CONFIG 사용)
    const presetName = colorPreset || CONFIG.POLYGON_COLOR_PRESET;
    const preset = CONFIG.POLYGON_COLOR_PRESETS[presetName];
    const gradientStart = preset?.gradientStart || CONFIG.POLYGON_COLOR_PRESETS.default.gradientStart;
    const gradientEnd = preset?.gradientEnd || CONFIG.POLYGON_COLOR_PRESETS.default.gradientEnd;

    // 그라디언트 선 (위에서 아래로)
    const lineGradient = Utils.createLineGradient(
      this.ctx, x1, y1, x2, y2,
      gradientStart,
      gradientEnd
    );

    this.ctx.strokeStyle = lineGradient;
    this.ctx.lineWidth = CONFIG.getScaledLineWidth('thick');
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }
}

/**
 * 축 렌더러
 * X축, Y축, 그리드, 범례 렌더링 로직
 */


class AxisRenderer {
  /**
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {HTMLCanvasElement} canvas - Canvas 요소
   * @param {number} padding - 패딩
   */
  constructor(ctx, canvas, padding) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.padding = padding;
  }

  /**
   * 축과 라벨 그리기
   * @param {Array} classes - 계급 배열
   * @param {Object} coords - 좌표 시스템 객체
   * @param {number} maxY - Y축 최댓값
   * @param {Object} axisLabels - 축 라벨
   * @param {Object} ellipsisInfo - 중략 정보
   * @param {string} dataType - 데이터 타입 ('relativeFrequency', 'frequency', 등)
   * @param {number} gridDivisions - 그리드 분할 수
   */
  drawAxes(classes, coords, maxY, axisLabels, ellipsisInfo, dataType = 'relativeFrequency', gridDivisions = CONFIG.CHART_GRID_DIVISIONS) {
    const { toX, toY, xScale } = coords;
    const xLabel = axisLabels?.xAxis || CONFIG.DEFAULT_LABELS.xAxis;

    // Y축 라벨: 사용자 설정 > 데이터 타입별 기본값 > 전역 기본값
    const dataTypeInfo = CONFIG.CHART_DATA_TYPES.find(t => t.id === dataType);
    const yLabel = axisLabels?.yAxis || dataTypeInfo?.yAxisLabel || CONFIG.DEFAULT_LABELS.yAxis;

    this.ctx.fillStyle = CONFIG.getColor('--color-text');
    this.ctx.font = CONFIG.CHART_FONT_BOLD;

    // Y축 라벨 (마지막 라벨은 yLabel로 대체)
    this.drawYAxisLabels(toY, maxY, dataType, gridDivisions, yLabel);

    // X축 라벨 (마지막 라벨은 xLabel로 대체)
    this.drawXAxisLabels(classes, toX, xScale, toY, ellipsisInfo, xLabel);
  }

  /**
   * Y축 라벨 그리기
   * @param {Function} toY - Y 좌표 변환 함수
   * @param {number} maxY - Y축 최댓값
   * @param {string} dataType - 데이터 타입 ('relativeFrequency', 'frequency', 등)
   * @param {number} gridDivisions - 그리드 분할 수
   * @param {string} yLabel - Y축 제목 (마지막 라벨 대체용)
   */
  drawYAxisLabels(toY, maxY, dataType = 'relativeFrequency', gridDivisions = CONFIG.CHART_GRID_DIVISIONS, yLabel = '') {
    const color = CONFIG.getColor('--color-text');

    for (let i = 0; i <= gridDivisions; i++) {
      const value = maxY * i / gridDivisions;

      // 0과 최댓값(축제목)은 항상 표시, 나머지는 AXIS_SHOW_Y_LABELS에 따라
      const isEndpoint = (i === 0 || i === gridDivisions);
      if (!CONFIG.AXIS_SHOW_Y_LABELS && !isEndpoint) continue;

      // 마지막 라벨은 축 제목으로 대체
      if (i === gridDivisions && yLabel) {
        const baseFontSize = 22;
        if (yLabel.length >= 4) {
          // 4글자 이상: Y축 상단 위에 가로로 표시
          renderMixedText(this.ctx, yLabel,
            this.padding,
            toY(value) - CONFIG.getScaledValue(10),
            { fontSize: CONFIG.getScaledFontSize(18), color, align: 'left', baseline: 'bottom' }
          );
          // 최댓값 숫자도 표시
          let formattedMax;
          if (dataType === 'frequency') {
            formattedMax = Math.round(value).toString();
          } else {
            if (CONFIG.AXIS_Y_LABEL_FORMAT === 'percent') {
              formattedMax = Utils.formatNumberClean(value * 100) + '%';
            } else {
              formattedMax = Utils.formatNumberClean(value);
            }
          }
          render$1(this.ctx, formattedMax,
            this.padding - CONFIG.getScaledValue(CONFIG.CHART_Y_LABEL_OFFSET),
            toY(value) + CONFIG.getScaledValue(CONFIG.CHART_LABEL_OFFSET),
            { fontSize: CONFIG.getScaledFontSize(baseFontSize), color, align: 'right', baseline: 'middle' }
          );
        } else {
          // 3글자 이하: 기존 위치 (Y축 왼쪽, 숫자 대신 제목)
          renderMixedText(this.ctx, yLabel,
            this.padding - CONFIG.getScaledValue(CONFIG.CHART_Y_LABEL_OFFSET),
            toY(value) + CONFIG.getScaledValue(CONFIG.CHART_LABEL_OFFSET),
            { fontSize: CONFIG.getScaledFontSize(baseFontSize), color, align: 'right', baseline: 'middle' }
          );
        }
        continue;
      }

      // 데이터 타입에 따라 포맷팅
      let formattedValue;
      if (dataType === 'frequency') {
        formattedValue = Math.round(value).toString();
      } else {
        // 상대도수: decimal (0.03) 또는 percent (3%)
        if (CONFIG.AXIS_Y_LABEL_FORMAT === 'percent') {
          const percentage = value * 100;
          formattedValue = value === 0 ? '0' : Utils.formatNumberClean(percentage) + '%';
        } else {
          formattedValue = Utils.formatNumberClean(value);
        }
      }

      // KaTeX 폰트로 렌더링
      render$1(this.ctx, formattedValue,
        this.padding - CONFIG.getScaledValue(CONFIG.CHART_Y_LABEL_OFFSET),
        toY(value) + CONFIG.getScaledValue(CONFIG.CHART_LABEL_OFFSET),
        { fontSize: CONFIG.getScaledFontSize(22), color: color, align: 'right', baseline: 'middle' }
      );
    }
  }

  /**
   * X축 라벨 그리기 (중략 처리 포함)
   * @param {Array} classes - 계급 배열
   * @param {Function} toX - X 좌표 변환 함수
   * @param {number} xScale - X축 스케일
   * @param {Function} toY - Y 좌표 변환 함수
   * @param {Object} ellipsisInfo - 중략 정보
   * @param {string} xLabel - X축 제목 (마지막 라벨 대체용)
   */
  drawXAxisLabels(classes, toX, xScale, toY, ellipsisInfo, xLabel = '') {
    const color = CONFIG.getColor('--color-text');
    const labelY = this.canvas.height - this.padding + CONFIG.getScaledValue(CONFIG.CHART_X_LABEL_Y_OFFSET);

    if (ellipsisInfo && ellipsisInfo.show) {
      const firstDataIdx = ellipsisInfo.firstDataIndex;

      // X축 0은 Y축 0과 중복되므로 렌더링하지 않음

      // 중략 기호 (이중 물결, X축 위에 세로로) - 항상 표시
      // 배치 순서: 0 - (중략) - (점) - 첫 데이터 라벨
      const ellipsisX = toX(0) + xScale * 0.08;
      const ellipsisY = toY(0);

      this.ctx.save();
      this.ctx.translate(ellipsisX, ellipsisY);
      this.ctx.rotate(Math.PI / 2);
      // 캔버스 크기에 따라 스케일링되는 폰트 사용
      const scaledFontSize = CONFIG.getScaledFontSize(22);
      this.ctx.font = `300 ${scaledFontSize}px 'SCDream', sans-serif`;
      this.ctx.fillStyle = CONFIG.getColor('--color-ellipsis');
      this.ctx.textBaseline = 'bottom';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(CONFIG.AXIS_ELLIPSIS_SYMBOL, 0, 0);
      this.ctx.restore();

      // 데이터 구간 라벨 (AXIS_SHOW_X_LABELS에 따라)
      if (CONFIG.AXIS_SHOW_X_LABELS) {
        for (let i = firstDataIdx; i < classes.length; i++) {
          render$1(this.ctx, String(classes[i].min), toX(i), labelY,
            { fontSize: CONFIG.getScaledFontSize(22), color: color, align: 'center', baseline: 'middle' }
          );
        }
      }

      // 마지막 라벨(축제목): 항상 표시
      renderMixedText(this.ctx, xLabel || String(classes[classes.length - 1].max),
        toX(classes.length - 1) + xScale, labelY,
        { fontSize: CONFIG.getScaledFontSize(22), color, align: 'center', baseline: 'middle' }
      );
    } else {
      // 중략 없이 전체 표시 (KaTeX 폰트)
      if (CONFIG.AXIS_SHOW_X_LABELS) {
        // 첫 번째 라벨(0)은 Y축과 중복되므로 건너뛰기
        classes.forEach((c, i) => {
          if (i === 0 && c.min === 0) return; // 0은 Y축에서 이미 표시됨
          render$1(this.ctx, String(c.min), toX(i), labelY,
            { fontSize: CONFIG.getScaledFontSize(22), color: color, align: 'center', baseline: 'middle' }
          );
        });
      }

      // 마지막 라벨(축제목): 항상 표시
      if (classes.length > 0) {
        renderMixedText(this.ctx, xLabel || String(classes[classes.length - 1].max),
          toX(classes.length), labelY,
          { fontSize: CONFIG.getScaledFontSize(22), color, align: 'center', baseline: 'middle' }
        );
      }
    }
  }

  /**
   * 축 제목 그리기 (축 끝 라벨링)
   * @param {string} xLabel - X축 제목
   * @param {string} yLabel - Y축 제목
   */
  drawAxisTitles(xLabel, yLabel) {
    this.ctx.font = CONFIG.CHART_FONT_REGULAR;
    this.ctx.fillStyle = CONFIG.getColor('--color-text');

    // X축 제목: 오른쪽 끝
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(xLabel, this.canvas.width - this.padding, this.canvas.height - this.padding + 5);

    // Y축 제목: 위쪽 끝 (가로)
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'bottom';
    this.ctx.fillText(yLabel, this.padding, this.padding - 5);
  }

  /**
   * 배경 격자선 그리기
   * @param {Function} toX - X 좌표 변환 함수
   * @param {Function} toY - Y 좌표 변환 함수
   * @param {number} maxY - Y축 최댓값
   * @param {number} classCount - 계급 개수
   * @param {Object} ellipsisInfo - 중략 정보
   * @param {number} gridDivisions - 그리드 분할 수
   */
  drawGrid(toX, toY, maxY, classCount, ellipsisInfo, gridDivisions = CONFIG.CHART_GRID_DIVISIONS) {
    this.ctx.lineWidth = CONFIG.getScaledLineWidth('thin');
    this.ctx.globalAlpha = 1.0; // 투명도 제거

    // 가로 격자선 (Y축) - Y=0 제외
    if (CONFIG.GRID_SHOW_HORIZONTAL) {
      this.ctx.strokeStyle = CONFIG.getColor('--color-grid-horizontal');
      for (let i = 0; i <= gridDivisions; i++) {
        const value = maxY * i / gridDivisions;
        if (value === 0) continue; // Y=0 (X축 기준선) 건너뛰기

        const y = toY(value);
        this.ctx.beginPath();
        this.ctx.moveTo(this.padding, y);
        this.ctx.lineTo(this.canvas.width - this.padding, y);
        this.ctx.stroke();
      }
    }

    // 세로 격자선 (X축) - X=0 제외
    if (CONFIG.GRID_SHOW_VERTICAL) {
      this.ctx.strokeStyle = CONFIG.getColor('--color-grid-vertical');
      for (let i = 0; i <= classCount; i++) {
        if (i === 0) continue; // X=0 (Y축 기준선) 건너뛰기
        if (CoordinateSystem.shouldSkipEllipsis(i, ellipsisInfo)) continue;

        const x = toX(i);
        this.ctx.beginPath();
        this.ctx.moveTo(x, this.padding);
        this.ctx.lineTo(x, this.canvas.height - this.padding);
        this.ctx.stroke();
      }
    }

    // 기준선 (X축, Y축)을 별도로 그려서 #888888 색상 적용
    this.ctx.strokeStyle = CONFIG.getColor('--color-axis');

    // X축 기준선 (Y=0)
    const y0 = toY(0);
    this.ctx.beginPath();
    this.ctx.moveTo(this.padding, y0);
    this.ctx.lineTo(this.canvas.width - this.padding, y0);
    this.ctx.stroke();

    // Y축 기준선 (X=0)
    const x0 = toX(0);
    this.ctx.beginPath();
    this.ctx.moveTo(x0, this.padding);
    this.ctx.lineTo(x0, this.canvas.height - this.padding);
    this.ctx.stroke();
  }

  /**
   * 데이터 없음 메시지
   */
  drawNoDataMessage() {
    this.ctx.fillStyle = CONFIG.getColor('--color-text');
    this.ctx.font = CONFIG.CHART_FONT_BOLD;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      '데이터가 없습니다.',
      this.canvas.width / 2,
      this.canvas.height / 2
    );
  }
}

/**
 * 파선 렌더러
 * 점에서 Y축으로 수직 파선 그리기
 */


class DashedLineRenderer {
  /**
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   */
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * 파선 레이어 렌더링
   * @param {Layer} layer - 파선 레이어
   */
  render(layer) {
    if (!layer.data) {
      console.error('❌ layer.data가 없습니다:', layer);
      return;
    }

    const { index, relativeFreq, coords, animationProgress = 1.0, dataType = 'relativeFrequency', histogramPreset = 'default' } = layer.data;

    if (!coords) {
      console.error('❌ coords가 없습니다:', layer.data);
      return;
    }

    const { toX, toY, xScale } = coords;

    // 점의 위치 (우측 시작점)
    const pointX = toX(index) + xScale * CONFIG.CHART_BAR_CENTER_OFFSET;
    const pointY = toY(relativeFreq);

    // Y축 위치 (좌측 끝점)
    const leftEdgeX = toX(0);

    // 애니메이션 진행도에 따라 현재 끝점 계산 (우→좌)
    const currentEndX = pointX - (pointX - leftEdgeX) * animationProgress;

    // 히스토그램 프리셋에서 색상 가져오기
    const preset = CONFIG.HISTOGRAM_COLOR_PRESETS[histogramPreset]
                || CONFIG.HISTOGRAM_COLOR_PRESETS.default;
    const dashedLineColor = preset.strokeEnd || preset.strokeStart || CONFIG.getColor('--chart-dashed-line-color');

    this.ctx.save();
    this.ctx.strokeStyle = dashedLineColor;
    this.ctx.lineWidth = CONFIG.getScaledLineWidth('dashed');
    this.ctx.setLineDash(CONFIG.getScaledDashPattern());

    this.ctx.beginPath();
    this.ctx.moveTo(pointX, pointY);
    this.ctx.lineTo(currentEndX, pointY);
    this.ctx.stroke();

    this.ctx.restore(); // setLineDash 초기화

    // 파선 끝점 라벨 (애니메이션 완료 시)
    if (animationProgress >= 1.0) {
      this._renderEndpointLabel(leftEdgeX, pointY, relativeFreq, dataType);
    }
  }

  /**
   * 정적 모드에서 모든 파선 렌더링
   * @param {number[]} values - 상대도수/도수 배열
   * @param {Object} coords - 좌표 시스템
   * @param {string} dataType - 데이터 타입
   */
  drawStatic(values, coords, dataType = 'relativeFrequency') {
    const histogramPreset = CONFIG.HISTOGRAM_COLOR_PRESET || 'default';

    values.forEach((value, index) => {
      // 도수 0인 계급은 스킵
      if (value === 0) return;

      const { toX, toY, xScale } = coords;

      // 점의 위치 (우측 시작점)
      const pointX = toX(index) + xScale * CONFIG.CHART_BAR_CENTER_OFFSET;
      const pointY = toY(value);

      // Y축 위치 (좌측 끝점)
      const leftEdgeX = toX(0);

      // 히스토그램 프리셋에서 색상 가져오기
      const preset = CONFIG.HISTOGRAM_COLOR_PRESETS[histogramPreset]
                  || CONFIG.HISTOGRAM_COLOR_PRESETS.default;
      const dashedLineColor = preset.strokeEnd || preset.strokeStart || CONFIG.getColor('--chart-dashed-line-color');

      this.ctx.save();
      this.ctx.strokeStyle = dashedLineColor;
      this.ctx.lineWidth = CONFIG.getScaledLineWidth('dashed');
      this.ctx.setLineDash(CONFIG.getScaledDashPattern());

      this.ctx.beginPath();
      this.ctx.moveTo(pointX, pointY);
      this.ctx.lineTo(leftEdgeX, pointY);
      this.ctx.stroke();

      this.ctx.restore();

      // 파선 끝점 라벨
      this._renderEndpointLabel(leftEdgeX, pointY, value, dataType);
    });
  }

  /**
   * 파선 끝점(Y축)에 값 라벨 렌더링
   * @param {number} x - X 좌표 (Y축 위치)
   * @param {number} y - Y 좌표 (파선 높이)
   * @param {number} value - 표시할 값 (상대도수 또는 도수)
   * @param {string} dataType - 데이터 타입
   */
  _renderEndpointLabel(x, y, value, dataType) {
    const color = CONFIG.getColor('--color-text');
    const labelOffset = CONFIG.getScaledValue(CONFIG.CHART_Y_LABEL_OFFSET || 10);

    // 데이터 타입에 따라 포맷팅
    let formattedValue;
    if (dataType === 'frequency') {
      formattedValue = Math.round(value).toString();
    } else {
      // 상대도수: decimal (0.03) 또는 percent (3%)
      if (CONFIG.AXIS_Y_LABEL_FORMAT === 'percent') {
        const percentage = value * 100;
        formattedValue = Utils.formatNumberClean(percentage) + '%';
      } else {
        formattedValue = Utils.formatNumberClean(value);
      }
    }

    // KaTeX 폰트로 렌더링 (Y축 라벨 왼쪽에 표시)
    render$1(this.ctx, formattedValue,
      x - labelOffset,
      y,
      { fontSize: CONFIG.getScaledFontSize(22), color: color, align: 'right', baseline: 'middle' }
    );
  }
}

/**
 * 합동 삼각형 렌더러
 * 히스토그램과 다각형 사이의 합동 삼각형을 렌더링
 */


class TriangleRenderer {
  /**
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D 컨텍스트
   */
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * 삼각형 레이어 렌더링
   * @param {Object} layer - 삼각형 레이어 데이터
   */
  renderTriangle(layer) {
    const { points, fillColors, strokeColors, fillAlpha } = layer.data;
    const ctx = this.ctx;

    if (!points || points.length < 3) return;

    // 현재 globalAlpha 보존 (fade 애니메이션 효과)
    const currentAlpha = ctx.globalAlpha;
    if (currentAlpha <= 0) return;

    // 삼각형 경계 박스 계산 (그라디언트용)
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));

    ctx.save();

    // 삼각형 경로 생성
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.lineTo(points[2].x, points[2].y);
    ctx.closePath();

    // Fill 그라디언트 생성 및 적용
    if (fillColors && fillColors.start && fillColors.end) {
      const fillGradient = ctx.createLinearGradient(0, minY, 0, maxY);
      fillGradient.addColorStop(0, fillColors.start);
      fillGradient.addColorStop(1, fillColors.end);
      ctx.fillStyle = fillGradient;
      // 현재 alpha에 fillAlpha 곱셈 (fade 효과 유지)
      ctx.globalAlpha = currentAlpha * (fillAlpha ?? 1);
    }
    ctx.fill();

    // Stroke 그라디언트 생성 및 적용
    if (strokeColors && strokeColors.start && strokeColors.end) {
      ctx.globalAlpha = currentAlpha; // fade 효과 유지
      const strokeGradient = ctx.createLinearGradient(0, minY, 0, maxY);
      strokeGradient.addColorStop(0, strokeColors.start);
      strokeGradient.addColorStop(1, strokeColors.end);
      ctx.strokeStyle = strokeGradient;
      ctx.lineWidth = CONFIG.getScaledLineWidth('normal');
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * 삼각형 라벨 렌더링 (S₁, S₂)
   * @param {Object} layer - 라벨 레이어 데이터
   */
  renderTriangleLabel(layer) {
    const { text, subscript, x, y, color } = layer.data;
    const ctx = this.ctx;

    // 현재 globalAlpha 보존 (fade 애니메이션 효과)
    const currentAlpha = ctx.globalAlpha;
    if (currentAlpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = currentAlpha;

    // KaTeX_Main 폰트로 아래첨자 렌더링
    KatexUtils.renderWithScript(ctx, text, null, subscript, x, y, {
      fontSize: CONFIG.getScaledFontSize(30),
      color: color,
      align: 'center',
      baseline: 'middle'
    });

    ctx.restore();
  }

  /**
   * 삼각형 라벨 점선 렌더링
   * @param {Object} layer - 점선 레이어 데이터
   */
  renderTriangleLabelLine(layer) {
    const { fromX, fromY, toX, toY, color } = layer.data;
    const ctx = this.ctx;

    // 현재 globalAlpha 보존 (fade 애니메이션 효과)
    const currentAlpha = ctx.globalAlpha;
    if (currentAlpha <= 0) return;

    // 라벨 반경 (30px 폰트 기준, 라벨과 겹치지 않도록) - 스케일링 적용
    const labelRadius = CONFIG.getScaledValue(18);

    // 방향 벡터 계산 (라벨 → 직각 모서리)
    const dx = toX - fromX;
    const dy = toY - fromY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 정규화된 방향 벡터
    const nx = dx / distance;
    const ny = dy / distance;

    // 점선 시작점을 라벨 바깥으로 오프셋
    const startX = fromX + nx * labelRadius;
    const startY = fromY + ny * labelRadius;

    ctx.save();
    ctx.globalAlpha = currentAlpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = CONFIG.getScaledLineWidth('thin');
    ctx.setLineDash(CONFIG.getScaledDashPattern()); // 점선 패턴

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.setLineDash([]); // 점선 패턴 해제
    ctx.restore();
  }

  /**
   * 정적 모드에서 합동 삼각형 렌더링 (애니메이션 없이)
   * @param {Array} values - 값 배열 (상대도수 또는 도수)
   * @param {Object} coords - 좌표 시스템 { toX, toY, xScale }
   */
  drawStatic(values, coords) {
    if (!CONFIG.SHOW_CONGRUENT_TRIANGLES || !CONFIG.SHOW_POLYGON) return;

    const i = CONFIG.CONGRUENT_TRIANGLE_INDEX;
    if (i < 0 || i >= values.length - 1) return;

    const { toX, toY, xScale } = coords;
    const ctx = this.ctx;

    // 투명도 초기화 (이전 렌더러에서 설정된 값 제거)
    ctx.globalAlpha = 1;

    // 좌표 계산
    const p1x = CoordinateSystem.getBarCenterX(i, toX, xScale);
    const p1y = toY(values[i]);
    const p2x = CoordinateSystem.getBarCenterX(i + 1, toX, xScale);
    const p2y = toY(values[i + 1]);

    // 막대 경계 X (막대 i의 우측 = 막대 i+1의 좌측)
    const boundaryX = toX(i + 1);

    // 선과 막대 경계의 교점 Y 계산 (선형 보간)
    const t = (boundaryX - p1x) / (p2x - p1x);
    const intersectY = p1y + t * (p2y - p1y);

    // 선 방향에 따라 색상 결정 (위=파랑, 아래=빨강)
    const isLineGoingUp = p1y > p2y; // canvas Y좌표: 클수록 아래

    // 위쪽 삼각형 색상 (파란색 = 히스토그램)
    const upperColors = {
      fill: { start: CONFIG.getColor('--chart-bar-color'), end: CONFIG.getColor('--chart-bar-color-end') },
      stroke: { start: CONFIG.getColor('--chart-bar-stroke-start'), end: CONFIG.getColor('--chart-bar-stroke-end') },
      fillAlpha: CONFIG.CHART_BAR_ALPHA
    };

    // 아래쪽 삼각형 색상 (빨간색)
    const lowerColors = {
      fill: { start: CONFIG.TRIANGLE_A_FILL_START, end: CONFIG.TRIANGLE_A_FILL_END },
      stroke: { start: CONFIG.TRIANGLE_A_STROKE_START, end: CONFIG.TRIANGLE_A_STROKE_END }
    };

    // Triangle A: 선 상승 시 아래(빨강), 선 하강 시 위(파랑)
    const colorsA = isLineGoingUp ? lowerColors : upperColors;
    // Triangle B: 선 상승 시 위(파랑), 선 하강 시 아래(빨강)
    const colorsB = isLineGoingUp ? upperColors : lowerColors;

    // 삼각형 A (막대 i 우측)
    const pointsA = [
      { x: p1x, y: p1y },
      { x: boundaryX, y: p1y },
      { x: boundaryX, y: intersectY }
    ];

    // 삼각형 B (막대 i+1 좌측)
    const pointsB = [
      { x: boundaryX, y: p2y },
      { x: p2x, y: p2y },
      { x: boundaryX, y: intersectY }
    ];

    // 삼각형 렌더링
    this._drawTriangleStatic(pointsA, colorsA);
    this._drawTriangleStatic(pointsB, colorsB);

    // 라벨 오프셋
    const labelOffset = 30;

    // 라벨 위치 계산 (선 방향에 따라 결정)
    let labelPosBlue, labelPosRed;
    let rightAngleBlue, rightAngleRed;

    if (isLineGoingUp) {
      rightAngleBlue = { x: boundaryX, y: p2y };
      rightAngleRed = { x: boundaryX, y: p1y };
      labelPosBlue = { x: boundaryX - labelOffset, y: p2y - labelOffset };
      labelPosRed = { x: boundaryX + labelOffset, y: p1y + labelOffset };
    } else {
      rightAngleBlue = { x: boundaryX, y: p1y };
      rightAngleRed = { x: boundaryX, y: p2y };
      labelPosBlue = { x: boundaryX + labelOffset, y: p1y - labelOffset };
      labelPosRed = { x: boundaryX - labelOffset, y: p2y + labelOffset };
    }

    // S₁, S₂ 라벨과 점선 렌더링 (LayerFactory와 동일한 색상 사용)
    const blueColor = '#008AFF';
    const redColor = '#E749AF';

    this._drawLabelLineStatic(labelPosBlue, rightAngleBlue, blueColor);
    this._drawLabelLineStatic(labelPosRed, rightAngleRed, redColor);
    this._drawLabelStatic('S', '1', labelPosBlue.x, labelPosBlue.y, blueColor);
    this._drawLabelStatic('S', '2', labelPosRed.x, labelPosRed.y, redColor);
  }

  /**
   * 정적 삼각형 렌더링 헬퍼
   * @private
   */
  _drawTriangleStatic(points, colors) {
    const ctx = this.ctx;
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.lineTo(points[2].x, points[2].y);
    ctx.closePath();

    if (colors.fill) {
      const fillGradient = ctx.createLinearGradient(0, minY, 0, maxY);
      fillGradient.addColorStop(0, colors.fill.start);
      fillGradient.addColorStop(1, colors.fill.end);
      ctx.fillStyle = fillGradient;
      ctx.globalAlpha = colors.fillAlpha ?? 1;
    }
    ctx.fill();

    if (colors.stroke) {
      ctx.globalAlpha = 1;
      const strokeGradient = ctx.createLinearGradient(0, minY, 0, maxY);
      strokeGradient.addColorStop(0, colors.stroke.start);
      strokeGradient.addColorStop(1, colors.stroke.end);
      ctx.strokeStyle = strokeGradient;
      ctx.lineWidth = CONFIG.getScaledLineWidth('normal');
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * 정적 라벨 점선 렌더링 헬퍼
   * @private
   */
  _drawLabelLineStatic(from, to, color) {
    const ctx = this.ctx;
    const labelRadius = CONFIG.getScaledValue(18);

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / distance;
    const ny = dy / distance;

    const startX = from.x + nx * labelRadius;
    const startY = from.y + ny * labelRadius;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = CONFIG.getScaledLineWidth('thin');
    ctx.setLineDash(CONFIG.getScaledDashPattern());
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  /**
   * 정적 라벨 렌더링 헬퍼
   * @private
   */
  _drawLabelStatic(text, subscript, x, y, color) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = 1; // 투명도 초기화
    KatexUtils.renderWithScript(ctx, text, null, subscript, x, y, {
      fontSize: CONFIG.getScaledFontSize(30),
      color: color,
      align: 'center',
      baseline: 'middle'
    });
    ctx.restore();
  }
}

/**
 * 차트 렌더링 메인 컨트롤러
 * Canvas 기반 히스토그램 및 상대도수 다각형 그리기
 *
 * @description 950줄 → 250줄로 리팩토링 (모듈 분리)
 */


/**
 * @class ChartRenderer
 * @description Canvas 기반 통계 차트 렌더러
 */
class ChartRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`Canvas 요소를 찾을 수 없습니다: ${canvasId}`);
    }

    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) {
      throw new Error(`Canvas 2D 컨텍스트를 생성할 수 없습니다: ${canvasId}`);
    }

    this.padding = CONFIG.CHART_PADDING;

    // 렌더러 인스턴스 생성
    this.histogramRenderer = new HistogramRenderer(this.ctx);
    this.polygonRenderer = new PolygonRenderer(this.ctx);
    this.axisRenderer = new AxisRenderer(this.ctx, this.canvas, this.padding);
    this.calloutRenderer = new CalloutRenderer(this.ctx);
    this.dashedLineRenderer = new DashedLineRenderer(this.ctx);
    this.triangleRenderer = new TriangleRenderer(this.ctx);

    // Layer 시스템
    this.layerManager = new LayerManager();
    this.timeline = new LayerTimeline();
    this.animationMode = true;
    this.animationSpeed = 1.0;

    // 차트 데이터 저장 (renderFrame에서 사용)
    this.currentClasses = null;
    this.currentValues = null;
    this.currentFreq = null;
    this.currentCoords = null;
    this.currentEllipsisInfo = null;
    this.currentMaxY = null;
    this.currentAxisLabels = null;
    this.currentDataType = null;
    this.currentTableConfig = null;
    this.currentEffectiveClassCount = null;

    // 테이블 렌더러 참조
    this.tableRenderer = null;

    // 테이블 하이라이트 상태 추적
    this.lastHighlightInfo = null;

    // 애니메이션 콜백
    this.timeline.onUpdate = () => this.renderFrame();
  }

  /**
   * 테이블 렌더러 설정
   * @param {TableRenderer} tableRenderer - 테이블 렌더러 인스턴스
   */
  setTableRenderer(tableRenderer) {
    this.tableRenderer = tableRenderer;
  }

  // ==================== 메인 렌더링 ====================

  /**
   * 히스토그램과 상대도수 다각형 그리기
   * @param {Array} classes - 계급 데이터 배열
   * @param {Object} axisLabels - 축 라벨 커스터마이징 객체
   * @param {Object} ellipsisInfo - 중략 표시 정보
   * @param {string} dataType - 데이터 타입 ('relativeFrequency', 'frequency', 등)
   * @param {Object} tableConfig - 테이블 설정
   * @param {string} calloutTemplate - 말풍선 템플릿
   * @param {boolean} clearCanvas - 캔버스 및 레이어 초기화 여부 (기본: true)
   * @param {number} unifiedMaxY - 통합 최대 Y값 (여러 데이터셋 사용 시, 없으면 자동 계산)
   * @param {number} unifiedClassCount - 통합 계급 개수 (여러 데이터셋 사용 시, 없으면 자동 계산)
   * @param {number} customYInterval - 커스텀 Y축 간격 (없으면 자동 계산)
   * @param {Array<number>} hiddenPolygonIndices - 숨길 다각형 점/선 인덱스 배열
   */
  draw(classes, axisLabels = null, ellipsisInfo = null, dataType = 'relativeFrequency', tableConfig = null, calloutTemplate = null, clearCanvas = true, unifiedMaxY = null, unifiedClassCount = null, customYInterval = null, hiddenPolygonIndices = []) {
    // 캔버스 크기에 따라 패딩 스케일링
    this.padding = CONFIG.getScaledPadding();
    this.axisRenderer.padding = this.padding;

    if (clearCanvas) {
      // 캔버스 초기화 (크기는 viz-api에서 설정하므로 여기서 덮어쓰지 않음)
      this.clear();

      // 레이어 매니저 초기화 (겹침 방지) - root의 자식 레이어 모두 제거
      this.layerManager.root.children = [];
      // 타임라인 초기화
      this.timeline.animations = new Map(); // Map 객체로 초기화
      this.timeline.timeline = [];
      this.timeline.currentTime = 0;
      this.timeline.duration = 0;

      // 새로운 차트 그리기 시작 - 하이라이트 초기화
      this.lastHighlightInfo = null;
    }

    const freq = classes.map(c => c.frequency);
    const total = freq.reduce((a, b) => a + b, 0);

    if (total === 0) {
      this.axisRenderer.drawNoDataMessage();
      return;
    }

    // 데이터 타입에 따라 값 배열 및 maxY 계산
    const relativeFreqs = freq.map(f => f / total);
    let values, maxY;

    if (dataType === 'frequency') {
      values = freq;
      maxY = unifiedMaxY !== null ? unifiedMaxY : Math.max(...freq);
    } else { // 'relativeFrequency' (기본값)
      values = relativeFreqs;
      maxY = unifiedMaxY !== null ? unifiedMaxY : Math.max(...relativeFreqs) * CONFIG.CHART_Y_SCALE_MULTIPLIER;
    }

    // 좌표 시스템 생성 (통합 계급 개수 우선 사용)
    const effectiveClassCount = unifiedClassCount || classes.length;
    const coords = CoordinateSystem.create(
      this.canvas,
      this.padding,
      effectiveClassCount,
      ellipsisInfo,
      maxY,
      dataType,
      customYInterval
    );

    // 차트 데이터 저장 (애니메이션 모드용)
    this.currentClasses = classes;
    this.currentValues = values;
    this.currentFreq = freq;
    this.currentCoords = coords;
    this.currentEllipsisInfo = ellipsisInfo;
    this.currentMaxY = coords.adjustedMaxY; // 조정된 maxY 사용
    this.currentAxisLabels = axisLabels;
    this.currentDataType = dataType;
    this.currentGridDivisions = coords.gridDivisions;
    this.currentTableConfig = tableConfig;
    this.currentEffectiveClassCount = effectiveClassCount;

    // 애니메이션 모드 분기
    if (this.animationMode) {
      // 애니메이션 모드: Layer 생성 후 진행도 100%로 설정 (자동 재생 안 함)
      LayerFactory.createLayers(
        this.layerManager,
        classes,
        values,
        coords,
        ellipsisInfo,
        dataType,
        calloutTemplate,
        hiddenPolygonIndices
      );
      this.setupAnimations(classes);

      // 자동 재생하지 않고 진행도 100% 상태로 설정
      this.timeline.currentTime = this.timeline.duration;
      this.renderFrame(); // 최종 상태 렌더링
    } else {
      // 정적 렌더링 모드
      // 추가 렌더링(clearCanvas=false)일 때는 배경/축을 다시 그리지 않음 (기존 내용 유지)
      if (clearCanvas) {
        this.axisRenderer.drawGrid(
          coords.toX,
          coords.toY,
          coords.adjustedMaxY,
          effectiveClassCount,
          ellipsisInfo,
          coords.gridDivisions
        );
      }
      // CONFIG 설정에 따라 조건부 렌더링
      if (CONFIG.SHOW_HISTOGRAM) {
        this.histogramRenderer.draw(values, freq, coords, ellipsisInfo, dataType);
      }
      if (CONFIG.SHOW_POLYGON) {
        this.polygonRenderer.draw(values, coords, ellipsisInfo, hiddenPolygonIndices);
      }
      // 합동 삼각형 렌더링 (정적 모드)
      if (CONFIG.SHOW_CONGRUENT_TRIANGLES && CONFIG.SHOW_POLYGON) {
        this.triangleRenderer.drawStatic(values, coords);
      }
      // 파선 렌더링 (정적 모드)
      if (CONFIG.SHOW_DASHED_LINES && CONFIG.SHOW_POLYGON) {
        this.dashedLineRenderer.drawStatic(values, coords, dataType);
      }
      // 막대 내부 커스텀 라벨 렌더링 (정적 모드)
      if (CONFIG.SHOW_BAR_CUSTOM_LABELS && CONFIG.SHOW_HISTOGRAM) {
        this.histogramRenderer.drawCustomLabelsStatic(values, freq, coords, ellipsisInfo);
      }
      if (clearCanvas) {
        this.axisRenderer.drawAxes(classes, coords, coords.adjustedMaxY, axisLabels, ellipsisInfo, dataType, coords.gridDivisions);
      }
    }
  }

  /**
   * 캔버스 초기화
   */
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // ==================== 레이어 렌더링 ====================

  /**
   * Layer 렌더링 (레이어 시스템용)
   * @param {Layer} layer - 렌더링할 레이어
   */
  renderLayer(layer) {
    if (!layer.visible) return;

    // 렌더링 시 필요한 전역 정보를 레이어 데이터에 임시 주입
    const originalData = { ...layer.data };
    layer.data = {
      ...layer.data,
      coords: this.currentCoords,
      ellipsisInfo: this.currentEllipsisInfo,
      dataType: this.currentDataType
    };

    switch (layer.type) {
      case 'bar':
        this.histogramRenderer.renderBar(layer);
        break;
      case 'point':
        this.polygonRenderer.renderPoint(layer);
        break;
      case 'line':
        this.polygonRenderer.renderLine(layer);
        break;
      case 'dashed-line':
        this.dashedLineRenderer.render(layer);
        break;
      case 'bar-label':
        this.histogramRenderer.renderBarLabel(layer);
        break;
      case 'bar-custom-label':
        this.histogramRenderer.renderBarCustomLabel(layer);
        break;
      case 'triangle':
        this.triangleRenderer.renderTriangle(layer);
        break;
      case 'triangle-label':
        this.triangleRenderer.renderTriangleLabel(layer);
        break;
      case 'triangle-label-line':
        this.triangleRenderer.renderTriangleLabelLine(layer);
        break;
      case 'callout':
        this.calloutRenderer.render(layer);
        break;
      case 'group':
        // 그룹은 자식 레이어들을 렌더링
        layer.children.forEach(child => this.renderLayer(child));
        break;
    }

    // 원래 데이터로 복원 (JSON 내보내기 시 깔끔하게 유지)
    layer.data = originalData;
  }

  // ==================== Timeline & Animation ====================

  /**
   * 기존 레이어 페이드아웃 애니메이션 추가
   * 새로운 차트를 그리기 전에 기존 레이어들을 부드럽게 사라지게 함
   */
  fadeOutExistingLayers() {
    const fadeOutDuration = 300; // 페이드아웃 시간 (ms)
    const startTime = this.timeline.duration;

    // 모든 최상위 레이어에 페이드아웃 애니메이션 추가
    this.layerManager.layers.forEach(layer => {
      this.addFadeOutAnimationRecursive(layer, startTime, fadeOutDuration);
    });
  }

  /**
   * 레이어와 자식 레이어들에 재귀적으로 페이드아웃 애니메이션 추가
   * @param {Layer} layer - 레이어
   * @param {number} startTime - 시작 시간
   * @param {number} duration - 지속 시간
   */
  addFadeOutAnimationRecursive(layer, startTime, duration) {
    // 현재 레이어에 페이드아웃 애니메이션 추가
    this.timeline.addAnimation(layer.id, {
      startTime,
      duration,
      effect: 'fade-out',
      effectOptions: {},
      easing: 'easeOut'
    });

    // 자식 레이어들에도 재귀적으로 추가
    if (layer.children && layer.children.length > 0) {
      layer.children.forEach(child => {
        this.addFadeOutAnimationRecursive(child, startTime, duration);
      });
    }
  }

  /**
   * 애니메이션 시퀀스 설정 (계급별 순차 타임라인)
   * @param {Array} classes - 계급 데이터
   */
  setupAnimations(classes) {
    // 타임라인을 초기화하지 않고 기존 애니메이션 뒤에 추가
    // this.timeline.clearAnimations(); // 제거: 연속 타임라인 유지

    const barDuration = CONFIG.ANIMATION_BAR_DURATION;
    const pointDuration = CONFIG.ANIMATION_POINT_DURATION;
    const classDelay = CONFIG.ANIMATION_CLASS_DELAY;
    const lineDuration = CONFIG.ANIMATION_LINE_DURATION;
    const lineDelay = CONFIG.ANIMATION_LINE_DELAY;

    // 기존 타임라인의 끝에서 시작
    let currentTime = this.timeline.duration;

    // 가장 최근에 추가된 레이어 찾기 (ID에 timestamp가 붙어있음)
    const allLayers = this.layerManager.getAllLayers().map(item => item.layer);
    const reversedLayers = [...allLayers].reverse();

    const histogramGroup = reversedLayers.find(l => l.id.startsWith('histogram'));
    const polygonGroup = reversedLayers.find(l => l.id.startsWith('polygon'));
    const labelsGroup = reversedLayers.find(l => l.id.startsWith('bar-labels'));
    const customLabelsGroup = reversedLayers.find(l => l.id.startsWith('bar-custom-labels'));
    const dashedLinesGroup = reversedLayers.find(l => l.id.startsWith('dashed-lines'));

    const pointsGroup = polygonGroup?.children.find(c => c.id.startsWith('points'));

    // 히스토그램도 다각형도 없으면 리턴
    if (!histogramGroup && !polygonGroup) return;

    const bars = histogramGroup?.children || [];
    const points = pointsGroup?.children || [];
    const labels = labelsGroup?.children || [];
    const customLabels = customLabelsGroup?.children || [];

    // 계급별로 묶어서 순차 애니메이션
    // 기준: 막대와 점 중 더 많은 쪽 (보통 같지만 안전하게)
    const classCount = Math.max(bars.length, points.length, classes.length);

    // 막대 인덱스 매핑 (bar.data.index → bars 배열 인덱스)
    const barIndexMap = new Map();
    bars.forEach((bar, idx) => {
      barIndexMap.set(bar.data.index, idx);
    });

    // 라벨 인덱스 매핑 (label.data.index → labels 배열 인덱스)
    const labelIndexMap = new Map();
    labels.forEach((label, idx) => {
      labelIndexMap.set(label.data.index, idx);
    });

    // 점 인덱스 매핑 (point.data.index → points 배열 인덱스)
    const pointIndexMap = new Map();
    points.forEach((point, idx) => {
      pointIndexMap.set(point.data.index, idx);
    });

    // 커스텀 라벨 인덱스 매핑 (customLabel.data.index → customLabels 배열 인덱스)
    const customLabelIndexMap = new Map();
    customLabels.forEach((customLabel, idx) => {
      customLabelIndexMap.set(customLabel.data.index, idx);
    });

    for (let i = 0; i < classCount; i++) {
      // ellipsis 범위 건너뛰기 (빈 계급에 대한 타이밍 낭비 방지)
      if (CoordinateSystem.shouldSkipEllipsis(i, this.currentEllipsisInfo)) continue;

      // 현재 계급 인덱스 i를 기준으로 막대, 점, 라벨 찾기
      const barIdx = barIndexMap.get(i);
      const bar = barIdx !== undefined ? bars[barIdx] : null;

      const pointIdx = pointIndexMap.get(i);
      const point = pointIdx !== undefined ? points[pointIdx] : null;

      const labelIdx = labelIndexMap.get(i);
      const label = labelIdx !== undefined ? labels[labelIdx] : null;

      const customLabelIdx = customLabelIndexMap.get(i);
      const customLabel = customLabelIdx !== undefined ? customLabels[customLabelIdx] : null;

      // 막대 애니메이션 (있으면)
      if (bar) {
        this.timeline.addAnimation(bar.id, {
          startTime: currentTime,
          duration: barDuration,
          effect: 'none', // renderBar에서 높이 애니메이션 처리
          effectOptions: {},
          easing: 'easeOut'
        });
      }

      // 막대 라벨 애니메이션 (막대와 동일한 타이밍)
      if (label) {
        this.timeline.addAnimation(label.id, {
          startTime: currentTime,
          duration: barDuration,
          effect: 'none', // renderBarLabel에서 progress 체크
          effectOptions: {},
          easing: 'easeOut'
        });
      }

      // 막대 커스텀 라벨 애니메이션 (막대와 동일한 타이밍)
      if (customLabel) {
        this.timeline.addAnimation(customLabel.id, {
          startTime: currentTime,
          duration: barDuration,
          effect: 'none', // renderBarCustomLabel에서 progress 체크
          effectOptions: {},
          easing: 'easeOut'
        });
      }

      // 점 애니메이션 (항상)
      if (point) {
        this.timeline.addAnimation(point.id, {
          startTime: currentTime,
          duration: pointDuration,
          effect: 'fade',
          effectOptions: {},
          easing: 'easeOut'
        });
      }

      // 다음 계급으로
      currentTime += Math.max(barDuration, pointDuration) + classDelay;
    }

    // 파선 애니메이션 (히스토그램 완료 후, 순차적으로 그리기)
    if (dashedLinesGroup && dashedLinesGroup.children && dashedLinesGroup.children.length > 0) {
      const dashedLineDelay = CONFIG.ANIMATION_CLASS_DELAY || 150;
      const dashedLineDuration = CONFIG.ANIMATION_LINE_DURATION || 400;

      dashedLinesGroup.children.forEach((dashedLine, idx) => {
        if (dashedLine && dashedLine.visible) {
          this.timeline.addAnimation(dashedLine.id, {
            startTime: currentTime + (idx * dashedLineDelay),
            duration: dashedLineDuration,
            effect: 'draw',
            effectOptions: { direction: 'right-to-left' },
            easing: 'easeOut'
          });
        }
      });

      // 파선 완료 후 시간 업데이트
      currentTime += (dashedLinesGroup.children.length * dashedLineDelay) + dashedLineDuration;
    }

    // 연결선 그룹 애니메이션 (모든 계급 완료 후)
    const linesGroup = polygonGroup?.children.find(c => c.id.startsWith('lines'));
    if (linesGroup && linesGroup.children) {
      currentTime += CONFIG.ANIMATION_LINE_START_DELAY;

      linesGroup.children.forEach((line, idx) => {
        this.timeline.addAnimation(line.id, {
          startTime: currentTime + (idx * lineDelay),
          duration: lineDuration,
          effect: 'draw',
          effectOptions: { direction: 'left-to-right' },
          easing: 'linear'
        });
      });

      // 말풍선 애니메이션 (모든 선이 완료된 후)
      const calloutLayer = reversedLayers.find(l => l.id.startsWith('callout'));
      if (calloutLayer) {
        const lineEndTime = currentTime + (linesGroup.children.length * lineDelay) + lineDuration;
        this.timeline.addAnimation(calloutLayer.id, {
          startTime: lineEndTime + CONFIG.ANIMATION_CALLOUT_DELAY,
          duration: CONFIG.ANIMATION_POINT_DURATION,
          effect: 'custom', // 투명도 애니메이션은 직접 처리
          effectOptions: {},
          easing: 'easeIn'
        });
      }

      // 합동 삼각형 애니메이션 (선 애니메이션 완료 후)
      const trianglesGroup = reversedLayers.find(l => l.id.startsWith('triangles'));
      if (trianglesGroup && trianglesGroup.children) {
        const lineEndTime = currentTime + (linesGroup.children.length * lineDelay) + lineDuration;

        // 삼각형 먼저 애니메이션
        const triangles = trianglesGroup.children.filter(c => c.type === 'triangle');
        triangles.forEach((triangle, idx) => {
          this.timeline.addAnimation(triangle.id, {
            startTime: lineEndTime + (idx * 150),
            duration: 300,
            effect: 'fade',
            effectOptions: {},
            easing: 'easeOut'
          });
        });

        // 삼각형 애니메이션 완료 후 라벨 및 점선 애니메이션
        const triangleEndTime = lineEndTime + (triangles.length * 150) + 300;
        const labelLines = trianglesGroup.children.filter(c => c.type === 'triangle-label-line');
        const labels = trianglesGroup.children.filter(c => c.type === 'triangle-label');

        // 점선 먼저 (draw 효과)
        labelLines.forEach((line, idx) => {
          this.timeline.addAnimation(line.id, {
            startTime: triangleEndTime + (idx * 100),
            duration: 200,
            effect: 'fade',
            effectOptions: {},
            easing: 'easeOut'
          });
        });

        // 라벨 (fade 효과)
        const labelStartTime = triangleEndTime + (labelLines.length * 100) + 100;
        labels.forEach((label, idx) => {
          this.timeline.addAnimation(label.id, {
            startTime: labelStartTime + (idx * 100),
            duration: 200,
            effect: 'fade',
            effectOptions: {},
            easing: 'easeOut'
          });
        });
      }
    }
  }

  /**
   * 애니메이션 재생
   */
  playAnimation() {
    if (!this.animationMode) {
      console.warn('Animation mode is disabled');
      return;
    }
    this.timeline.play();
  }

  /**
   * 애니메이션 일시정지
   */
  pauseAnimation() {
    this.timeline.pause();
  }

  /**
   * 애니메이션 정지
   */
  stopAnimation() {
    this.timeline.stop();
    this.lastHighlightInfo = null; // 하이라이트 초기화
    this.renderFrame(); // 초기 상태로 다시 렌더링
  }

  /**
   * 애니메이션 재설정 및 재생
   * 레이어 순서가 변경된 경우 애니메이션 타이밍을 재설정
   */
  replayAnimation() {
    if (!this.animationMode || !this.currentClasses) {
      return;
    }

    this.stopAnimation();
    this.timeline.clearAnimations();
    this.setupAnimations(this.currentClasses);
    this.playAnimation();
  }

  /**
   * 애니메이션 속도 설정
   * @param {number} speed - 속도 배율 (0.5 = 느리게, 2.0 = 빠르게)
   */
  setAnimationSpeed(speed) {
    this.animationSpeed = Math.max(0.1, Math.min(speed, 5.0));
  }

  /**
   * 애니메이션 모드 활성화
   */
  enableAnimation() {
    this.animationMode = true;
  }

  /**
   * 애니메이션 모드 비활성화
   * 주의: stopAnimation()을 호출하지 않음 (정적 렌더링된 내용 보존)
   */
  disableAnimation() {
    this.animationMode = false;
    // stopAnimation() 호출 제거: renderFrame()이 캔버스를 지워서
    // 정적 모드로 그려진 기존 내용(다각형 등)이 사라지는 문제 방지
  }

  /**
   * 애니메이션 프레임 렌더링
   */
  renderFrame() {
    // 저장된 데이터가 없으면 리턴
    if (!this.currentClasses || !this.currentCoords) return;

    this.clear();

    // 배경 요소 그리기 (격자, 축)
    this.axisRenderer.drawGrid(
      this.currentCoords.toX,
      this.currentCoords.toY,
      this.currentMaxY,
      this.currentEffectiveClassCount || this.currentClasses.length,
      this.currentEllipsisInfo,
      this.currentGridDivisions
    );
    this.axisRenderer.drawAxes(
      this.currentClasses,
      this.currentCoords,
      this.currentMaxY,
      this.currentAxisLabels,
      this.currentEllipsisInfo,
      this.currentDataType,
      this.currentGridDivisions
    );

    // 모든 애니메이션 레이어 수집 (활성 + 완료)
    const allAnimations = this.timeline.timeline.map(anim => {
      const layer = this.layerManager.findLayer(anim.layerId);
      if (!layer || !layer.visible) return null;

      const endTime = anim.startTime + anim.duration;
      const isActive = this.timeline.currentTime >= anim.startTime && this.timeline.currentTime <= endTime;
      const isCompleted = this.timeline.currentTime > endTime;

      if (!isActive && !isCompleted) return null;

      return { anim, layer, isActive, isCompleted };
    }).filter(item => item !== null);

    // 렌더링 순서: dashed-line → bar → triangle → ... (타입 기준 정렬)
    // 파선이 막대 뒤에 그려지도록 먼저 렌더링
    const renderOrder = { 'dashed-line': 0, 'bar': 1, 'bar-custom-label': 2, 'triangle': 3, 'triangle-label-line': 4, 'triangle-label': 5, 'line': 6, 'point': 7, 'bar-label': 8, 'callout': 9 };
    allAnimations.sort((a, b) => {
      const orderA = renderOrder[a.layer.type] ?? 999;
      const orderB = renderOrder[b.layer.type] ?? 999;
      return orderA - orderB;
    });

    // 정렬된 순서대로 렌더링
    allAnimations.forEach(({ anim, layer, isActive }) => {
      if (isActive) {
        // 활성 애니메이션: 진행도 계산 및 효과 적용
        const elapsed = this.timeline.currentTime - anim.startTime;
        const progress = Math.min(1, Math.max(0, elapsed / anim.duration));

        layer.data.animationProgress = progress;

        // 말풍선 레이어는 투명도 애니메이션
        if (layer.type === 'callout') {
          layer.data.opacity = progress;
          this.renderLayer(layer);
        } else {
          LayerAnimationEffects.apply(
            this.ctx,
            progress,
            anim.effect,
            anim.effectOptions,
            () => this.renderLayer(layer)
          );
        }
      } else {
        // 완료된 애니메이션: 완전히 표시 (progress = 1.0)
        layer.data.animationProgress = 1.0;
        if (layer.type === 'callout') {
          layer.data.opacity = 1.0;
        }
        this.renderLayer(layer);
      }
    });

    // 테이블 하이라이트 업데이트
    this.updateTableHighlight(allAnimations);
  }

  /**
   * 테이블 하이라이트 업데이트
   * @param {Array} allAnimations - 모든 애니메이션 정보
   */
  updateTableHighlight(allAnimations) {
    if (!this.tableRenderer || !this.currentClasses || !this.currentTableConfig) return;

    let highlightInfo = null;

    // 우선순위: bar/point > line
    // 1. 활성 bar/point 찾기
    for (const { anim, layer, isActive } of allAnimations) {
      if (!isActive) continue;

      if (layer.type === 'bar' || layer.type === 'point') {
        const classIndex = layer.data.index;
        const progress = layer.data.animationProgress || 0;

        // 전체 계급 배열에서 도수가 0이 아닌 계급까지 카운트
        let visibleIndex = 0;
        for (let i = 0; i < classIndex; i++) {
          if (this.currentClasses[i].frequency > 0) {
            visibleIndex++;
          }
        }

        // 현재 계급이 도수 0이면 스킵
        if (this.currentClasses[classIndex].frequency > 0) {
          highlightInfo = {
            classIndex: visibleIndex,
            progress: progress
          };
          break; // 첫 번째로 찾은 것만 사용
        }
      }
    }

    // 2. bar/point가 없으면 활성 line 찾기
    if (highlightInfo === null) {
      for (const { anim, layer, isActive } of allAnimations) {
        if (!isActive) continue;

        if (layer.type === 'line') {
          const toIndex = layer.data.toIndex;
          const progress = layer.data.animationProgress || 0;

          // 전체 계급 배열에서 도수가 0이 아닌 계급까지 카운트
          let visibleIndex = 0;
          for (let i = 0; i < toIndex; i++) {
            if (this.currentClasses[i].frequency > 0) {
              visibleIndex++;
            }
          }

          // 현재 계급이 도수 0이면 스킵
          if (this.currentClasses[toIndex].frequency > 0) {
            highlightInfo = {
              classIndex: visibleIndex,
              progress: progress
            };
            break; // 첫 번째로 찾은 것만 사용
          }
        }
      }
    }

    // 하이라이트 상태가 변경될 때만 테이블 업데이트 (레이어 시스템 사용)
    const currentHighlight = this.lastHighlightInfo;

    // highlightInfo가 null이 되는 경우 업데이트하지 않음 (깜빡거림 방지)
    // 대신 새로운 하이라이트가 생기거나 classIndex/progress가 변경될 때만 업데이트
    if (highlightInfo !== null) {
      const hasChanged =
        currentHighlight === null ||
        highlightInfo.classIndex !== currentHighlight.classIndex ||
        Math.abs(highlightInfo.progress - currentHighlight.progress) > 0.05;

      if (hasChanged) {
        this.lastHighlightInfo = highlightInfo;

        // 레이어 시스템: 이전 하이라이트 해제 후 새로 설정
        this.tableRenderer.clearHighlight();
        this.tableRenderer.highlightCell(
          highlightInfo.classIndex,
          null, // 행 전체
          highlightInfo.progress
        );
      }
    }
    // highlightInfo가 null이면 아무것도 하지 않음 (이전 하이라이트 유지)
  }
}

/**
 * 테이블 레이어 팩토리
 * 도수분포표를 레이어 구조로 생성
 */


// 탈리마크 컬럼 인덱스 (원본 순서 기준)
const TALLY_COLUMN_INDEX = 2;
// 도수 컬럼 인덱스 (원본 순서 기준)
const FREQUENCY_COLUMN_INDEX = 3;

class TableLayerFactory {
  /**
   * 테이블 레이어 생성 (LayerManager에 추가)
   * @param {LayerManager} layerManager - 레이어 매니저
   * @param {Array} classes - 계급 데이터 배열 (도수 > 0인 것만)
   * @param {number} total - 전체 데이터 개수
   * @param {Object} config - 테이블 설정
   * @param {string} tableId - 테이블 고유 ID (기본값: 'table-1')
   */
  static createTableLayers(layerManager, classes, total, config = null, tableId = 'table-1') {
    // 설정 가져오기
    const tableLabels = { ...CONFIG.DEFAULT_LABELS.table, ...config?.labels };
    const visibleColumns = config?.visibleColumns || CONFIG.TABLE_DEFAULT_VISIBLE_COLUMNS;
    const columnOrder = config?.columnOrder || CONFIG.TABLE_DEFAULT_COLUMN_ORDER;
    const columnAlignment = config?.columnAlignment || CONFIG.TABLE_DEFAULT_ALIGNMENT;
    const showSuperscript = config?.showSuperscript ?? CONFIG.TABLE_SHOW_SUPERSCRIPT;
    const showSummaryRow = config?.showSummaryRow ?? CONFIG.TABLE_SHOW_SUMMARY_ROW;

    // 원본 라벨 배열 (7개: 계급, 계급값, 탈리, 도수, 상대도수, 누적도수, 누적상대도수)
    const allLabels = [
      tableLabels.class,
      tableLabels.midpoint,
      tableLabels.tally,
      tableLabels.frequency,
      tableLabels.relativeFrequency,
      tableLabels.cumulativeFrequency,
      tableLabels.cumulativeRelativeFrequency
    ];

    // columnOrder에 따라 재정렬
    const orderedLabels = columnOrder.map(i => allLabels[i]);
    const orderedVisibleColumns = columnOrder.map(i => visibleColumns[i]);

    // 표시할 컬럼만 필터링
    const filteredLabels = orderedLabels.filter((_, i) => orderedVisibleColumns[i]);
    const columnCount = filteredLabels.length;

    // Canvas 크기 계산
    const padding = CONFIG.TABLE_PADDING;
    const canvasWidth = config?.canvasWidth || CONFIG.TABLE_CANVAS_WIDTH;
    const rowCount = classes.length + (showSummaryRow ? 1 : 0); // 합계 행 조건부
    const canvasHeight = CONFIG.TABLE_HEADER_HEIGHT + (rowCount * CONFIG.TABLE_ROW_HEIGHT) + padding * 2;

    // 열 너비 계산 (config에서 전달받거나 자동 계산)
    const columnWidths = config?.columnWidths || this._calculateColumnWidths(canvasWidth, padding, columnCount);

    // 테이블 타입
    const tableType = CONFIG.TABLE_TYPES.FREQUENCY;

    // 루트 레이어 생성
    const rootLayer = new Layer({
      id: `${tableType}-${tableId}-table-root`,
      name: '도수분포표',
      type: 'group',
      visible: true,
      order: 0,
      data: {
        tableType,
        canvasWidth,
        canvasHeight,
        padding,
        columnCount,
        rowCount
      }
    });

    // 격자선 레이어 생성
    const gridLayer = this._createGridLayer(
      canvasWidth,
      canvasHeight,
      padding,
      rowCount,
      columnWidths,
      tableId,
      showSummaryRow // hasSummaryRow
    );
    rootLayer.addChild(gridLayer);

    // 필터링된 원본 인덱스 배열 (탈리/도수 병합 판별용)
    const filteredOriginalIndices = columnOrder.filter((_, i) => orderedVisibleColumns[i]);

    // 헤더용 라벨/너비 계산 (탈리+도수 병합)
    const { headerLabels, headerWidths } = this._mergeFrequencyHeaders(
      filteredLabels,
      columnWidths,
      filteredOriginalIndices,
      tableLabels
    );

    // 헤더 레이어 생성
    const headerLayer = this._createHeaderLayer(
      headerLabels,
      headerWidths,
      columnAlignment,
      padding,
      tableId
    );
    rootLayer.addChild(headerLayer);

    // 데이터 행 레이어 생성
    classes.forEach((classData, rowIndex) => {
      const rowLayer = this._createDataRowLayer(
        classData,
        rowIndex,
        columnWidths,
        orderedVisibleColumns,
        columnOrder,
        columnAlignment,
        showSuperscript,
        padding,
        filteredLabels,
        tableId
      );
      rootLayer.addChild(rowLayer);
    });

    // 합계 행 레이어 생성 (조건부)
    if (showSummaryRow) {
      const summaryLayer = this._createSummaryRowLayer(
        total,
        classes.length,
        columnWidths,
        orderedVisibleColumns,
        columnOrder,
        columnAlignment,
        padding,
        filteredLabels,
        tableId
      );
      rootLayer.addChild(summaryLayer);
    }

    // LayerManager에 추가 (root의 자식으로)
    layerManager.addLayer(rootLayer, 'root');
  }

  /**
   * 헤더용 라벨/너비 병합 (탈리+도수 → 도수)
   * @param {Array} labels - 필터링된 라벨 배열
   * @param {Array} widths - 필터링된 너비 배열
   * @param {Array} originalIndices - 필터링된 원본 인덱스 배열
   * @param {Object} tableLabels - 테이블 라벨 설정
   * @returns {Object} { headerLabels, headerWidths }
   */
  static _mergeFrequencyHeaders(labels, widths, originalIndices, tableLabels) {
    const headerLabels = [];
    const headerWidths = [];

    // 탈리와 도수 인덱스 찾기
    let tallyIdx = -1;
    let freqIdx = -1;
    originalIndices.forEach((origIdx, i) => {
      if (origIdx === TALLY_COLUMN_INDEX) tallyIdx = i;
      if (origIdx === FREQUENCY_COLUMN_INDEX) freqIdx = i;
    });

    // 탈리와 도수가 둘 다 visible이고 연속인 경우 병합
    const shouldMerge = tallyIdx !== -1 && freqIdx !== -1 && freqIdx === tallyIdx + 1;

    for (let i = 0; i < labels.length; i++) {
      if (shouldMerge && i === tallyIdx) {
        // 탈리+도수 → "도수" 하나로 병합
        headerLabels.push(tableLabels.frequency);
        headerWidths.push(widths[i] + widths[i + 1]);
      } else if (shouldMerge && i === freqIdx) {
        // 도수는 이미 병합되었으므로 스킵
        continue;
      } else {
        headerLabels.push(labels[i]);
        headerWidths.push(widths[i]);
      }
    }

    return { headerLabels, headerWidths };
  }

  /**
   * 열 너비 계산
   * @param {number} canvasWidth - Canvas 너비
   * @param {number} padding - 패딩
   * @param {number} columnCount - 표시할 열 개수
   * @returns {Array} 각 열의 너비 배열
   */
  static _calculateColumnWidths(canvasWidth, padding, columnCount) {
    const totalWidth = canvasWidth - padding * 2;
    const widthPerColumn = totalWidth / columnCount;
    return Array(columnCount).fill(widthPerColumn);
  }

  /**
   * 격자선 레이어 생성
   * @param {number} canvasWidth - Canvas 너비
   * @param {number} canvasHeight - Canvas 높이
   * @param {number} padding - 패딩
   * @param {number} rowCount - 행 개수
   * @param {Array} columnWidths - 열 너비 배열
   * @param {string} tableId - 테이블 고유 ID
   * @param {boolean} hasSummaryRow - 합계 행 여부
   * @returns {Layer} 격자선 레이어
   */
  static _createGridLayer(canvasWidth, canvasHeight, padding, rowCount, columnWidths, tableId, hasSummaryRow = true) {
    const totalWidth = canvasWidth - padding * 2;
    const totalHeight = CONFIG.TABLE_HEADER_HEIGHT + (rowCount * CONFIG.TABLE_ROW_HEIGHT);

    return new Layer({
      id: `frequency-${tableId}-table-grid`,
      name: '격자선',
      type: 'grid',
      visible: true,
      order: 0,
      data: {
        x: padding,
        y: padding,
        width: totalWidth,
        height: totalHeight,
        rowCount,
        columnWidths,
        hasSummaryRow
      }
    });
  }

  /**
   * 헤더 행 레이어 생성
   * @param {Array} headers - 헤더 라벨 배열
   * @param {Array} columnWidths - 열 너비 배열
   * @param {Object} columnAlignment - 컬럼별 정렬 설정
   * @param {number} padding - 패딩
   * @param {string} tableId - 테이블 고유 ID
   * @returns {Layer} 헤더 그룹 레이어
   */
  static _createHeaderLayer(headers, columnWidths, columnAlignment, padding, tableId) {
    const headerGroup = new Layer({
      id: `frequency-${tableId}-table-header`,
      name: '헤더 행',
      type: 'group',
      visible: true,
      order: 1,
      data: {}
    });

    let x = padding;
    const y = padding;

    headers.forEach((header, i) => {
      const cellLayer = new Layer({
        id: `frequency-${tableId}-table-header-col${i}`,
        name: header,
        type: 'cell',
        visible: true,
        order: i,
        data: {
          rowType: 'header',
          rowIndex: -1, // 헤더는 -1
          colIndex: i,
          colLabel: header,
          cellText: header,
          x,
          y,
          width: columnWidths[i],
          height: CONFIG.TABLE_HEADER_HEIGHT,
          alignment: columnAlignment[header] || 'center',
          highlighted: false,
          highlightProgress: 0
        }
      });

      headerGroup.addChild(cellLayer);
      x += columnWidths[i];
    });

    return headerGroup;
  }

  /**
   * 데이터 행 레이어 생성
   * @param {Object} classData - 계급 데이터
   * @param {number} rowIndex - 행 인덱스
   * @param {Array} columnWidths - 열 너비 배열
   * @param {Array} orderedVisibleColumns - 순서가 적용된 표시 컬럼 배열
   * @param {Array} columnOrder - 컬럼 순서 배열
   * @param {Object} columnAlignment - 컬럼별 정렬 설정
   * @param {boolean} showSuperscript - 상첨자 표시 여부
   * @param {number} padding - 패딩
   * @param {Array} filteredLabels - 필터링된 라벨 배열
   * @param {string} tableId - 테이블 고유 ID
   * @returns {Layer} 데이터 행 그룹 레이어
   */
  static _createDataRowLayer(
    classData,
    rowIndex,
    columnWidths,
    orderedVisibleColumns,
    columnOrder,
    columnAlignment,
    showSuperscript,
    padding,
    filteredLabels,
    tableId
  ) {
    const rowGroup = new Layer({
      id: `frequency-${tableId}-table-row-${rowIndex}`,
      name: `데이터 행 ${rowIndex}`,
      type: 'group',
      visible: true,
      order: rowIndex + 2, // 0: grid, 1: header, 2+: data rows
      data: {
        rowIndex
      }
    });

    const y = padding + CONFIG.TABLE_HEADER_HEIGHT + (rowIndex * CONFIG.TABLE_ROW_HEIGHT);

    // 상대도수 형식 (차트 Y축 설정과 동일)
    const relFreqFormat = CONFIG.AXIS_Y_LABEL_FORMAT || 'percent';

    // 원본 셀 데이터 (7개: 계급, 계급값, 탈리, 도수, 상대도수, 누적도수, 누적상대도수)
    // 탈리마크는 빈 문자열로 저장 (실제 렌더링은 tallyCount로 Canvas에 직접 그림)
    const allCells = [
      `${classData.min} ~ ${classData.max}`,                              // 0: 계급
      Utils.formatNumberClean(classData.midpoint),                         // 1: 계급값
      '',                                                                  // 2: 탈리마크 (Canvas 직접 그리기)
      classData.frequency,                                                 // 3: 도수
      Utils.formatRelativeFrequency(classData.relativeFreq, relFreqFormat),// 4: 상대도수
      classData.cumulativeFreq,                                            // 5: 누적도수
      Utils.formatRelativeFrequency(classData.cumulativeRelFreq, relFreqFormat) // 6: 누적상대도수
    ];

    // columnOrder에 따라 재정렬
    const orderedCells = columnOrder.map(i => allCells[i]);

    // 표시할 셀만 필터링
    const cells = orderedCells.filter((_, i) => orderedVisibleColumns[i]);

    // 필터링된 원본 인덱스 배열 (계급 컬럼 판별용)
    const filteredOriginalIndices = columnOrder.filter((_, i) => orderedVisibleColumns[i]);

    let x = padding;

    cells.forEach((cellText, i) => {
      const label = filteredLabels[i];
      const originalIndex = filteredOriginalIndices[i]; // 원본 컬럼 인덱스
      const isClassColumn = originalIndex === 0; // 계급 컬럼 여부
      const isTallyColumn = originalIndex === TALLY_COLUMN_INDEX; // 탈리 컬럼 여부

      const cellLayer = new Layer({
        id: `frequency-${tableId}-table-row-${rowIndex}-col${i}`,
        name: isTallyColumn ? `탈리(${classData.frequency})` : String(cellText),
        type: 'cell',
        visible: true,
        order: i,
        data: {
          rowType: 'data',
          rowIndex,
          colIndex: i,
          colLabel: label,
          cellText: String(cellText),
          x,
          y,
          width: columnWidths[i],
          height: CONFIG.TABLE_ROW_HEIGHT,
          alignment: columnAlignment[label] || 'center',
          highlighted: false,
          highlightProgress: 0,
          // 상첨자 정보 (첫 행의 계급 컬럼인 경우)
          classData: rowIndex === 0 && isClassColumn ? classData : null,
          showSuperscript: rowIndex === 0 && isClassColumn ? showSuperscript : false,
          // 짝수 행 배경색 표시 여부
          isEvenRow: rowIndex % 2 === 1,
          // 탈리 컬럼인 경우 탈리 개수 전달
          tallyCount: isTallyColumn ? classData.frequency : undefined
        }
      });

      rowGroup.addChild(cellLayer);
      x += columnWidths[i];
    });

    return rowGroup;
  }

  /**
   * 합계 행 레이어 생성
   * @param {number} total - 전체 데이터 개수
   * @param {number} dataRowCount - 데이터 행 개수
   * @param {Array} columnWidths - 열 너비 배열
   * @param {Array} orderedVisibleColumns - 순서가 적용된 표시 컬럼 배열
   * @param {Array} columnOrder - 컬럼 순서 배열
   * @param {Object} columnAlignment - 컬럼별 정렬 설정
   * @param {number} padding - 패딩
   * @param {Array} filteredLabels - 필터링된 라벨 배열
   * @param {string} tableId - 테이블 고유 ID
   * @returns {Layer} 합계 행 그룹 레이어
   */
  static _createSummaryRowLayer(
    total,
    dataRowCount,
    columnWidths,
    orderedVisibleColumns,
    columnOrder,
    columnAlignment,
    padding,
    filteredLabels,
    tableId
  ) {
    const summaryGroup = new Layer({
      id: `frequency-${tableId}-table-summary`,
      name: '합계 행',
      type: 'group',
      visible: true,
      order: dataRowCount + 2, // 마지막 순서
      data: {}
    });

    const y = padding + CONFIG.TABLE_HEADER_HEIGHT + (dataRowCount * CONFIG.TABLE_ROW_HEIGHT);

    // 상대도수 형식 (차트 Y축 설정과 동일)
    const relFreqFormat = CONFIG.AXIS_Y_LABEL_FORMAT || 'percent';
    const totalRelFreq = relFreqFormat === 'percent' ? '100%' : '1';

    // 원본 셀 데이터 (7개: 합계, 빈칸, 탈리빈칸, 도수합계, 상대도수합계, 누적도수합계, 누적상대도수합계)
    const allCells = ['합계', '', '', total, totalRelFreq, total, totalRelFreq];

    // columnOrder에 따라 재정렬
    const orderedCells = columnOrder.map(i => allCells[i]);

    // 표시할 셀만 필터링
    const filteredCells = orderedCells.filter((_, i) => orderedVisibleColumns[i]);

    let x = padding;
    let cellIndex = 0;

    filteredCells.forEach((cellText, i) => {
      const label = filteredLabels[i];

      // 모든 셀에 대해 레이어 생성
      const cellWidth = columnWidths[i];

      const cellLayer = new Layer({
          id: `frequency-${tableId}-table-summary-col${cellIndex}`,
          name: String(cellText),
          type: 'cell',
          visible: true,
          order: cellIndex,
          data: {
            rowType: 'summary',
            rowIndex: dataRowCount, // 합계는 마지막 인덱스
            colIndex: i,
            colLabel: label,
            cellText: String(cellText),
            x,
            y,
            width: cellWidth,
            height: CONFIG.TABLE_ROW_HEIGHT,
            alignment: columnAlignment[label] || 'center',
            highlighted: false,
            highlightProgress: 0
          }
      });

      summaryGroup.addChild(cellLayer);
      cellIndex++;

      // x 좌표는 항상 증가 (빈 칸이든 아니든)
      x += columnWidths[i];
    });

    return summaryGroup;
  }
}

/**
 * 테이블 셀 렌더러
 * 개별 셀, 격자선 렌더링 로직
 */


class TableCellRenderer {
  /**
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   */
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * 격자선 렌더링
   * @param {Layer} layer - 격자선 레이어
   */
  renderGrid(layer) {
    const { x, y, width, height, rowCount, columnWidths, hasSummaryRow = false } = layer.data;

    // 하단 선만 (두께 2, 밝은 회색)
    this.ctx.strokeStyle = CONFIG.TABLE_GRID_COLOR_LIGHT;
    this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_NORMAL;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + height);
    this.ctx.lineTo(x + width, y + height);
    this.ctx.stroke();

    // 수평선
    for (let i = 1; i <= rowCount; i++) {
      const lineY = y + CONFIG.TABLE_HEADER_HEIGHT + (i - 1) * CONFIG.TABLE_ROW_HEIGHT;

      // 첫 번째 선(헤더 아래)은 항상 두께 2
      // 마지막 선(합계 위)은 합계 행이 있는 경우에만 두께 2
      const isHeaderLine = i === 1;
      const isSummaryLine = hasSummaryRow && i === rowCount;

      if (isHeaderLine || isSummaryLine) {
        this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_NORMAL;
        this.ctx.strokeStyle = CONFIG.TABLE_GRID_COLOR_LIGHT;
      } else {
        this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_THIN;
        this.ctx.strokeStyle = CONFIG.TABLE_GRID_COLOR_DARK;
      }

      this.ctx.beginPath();
      this.ctx.moveTo(x, lineY);
      this.ctx.lineTo(x + width, lineY);
      this.ctx.stroke();
    }

    // 수직선 (점선, 헤더 영역 제외, 밝은 회색)
    this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_THIN;
    this.ctx.strokeStyle = CONFIG.TABLE_GRID_COLOR_LIGHT;
    this.ctx.setLineDash(CONFIG.TABLE_GRID_DASH_PATTERN);
    let lineX = x;
    for (let i = 0; i < columnWidths.length - 1; i++) {
      lineX += columnWidths[i];
      this.ctx.beginPath();
      this.ctx.moveTo(lineX, y + CONFIG.TABLE_HEADER_HEIGHT);
      this.ctx.lineTo(lineX, y + height);
      this.ctx.stroke();
    }
    this.ctx.setLineDash([]); // 실선으로 복원
  }

  /**
   * 헤더 셀 렌더링
   * @param {Layer} layer - 헤더 셀 레이어
   */
  renderHeaderCell(layer) {
    const { x, y, width, height, cellText, alignment, headerTextColor, animating, animationProgress } = layer.data;

    // 애니메이션 배경 렌더링 (펄스 효과)
    if (animating && animationProgress > 0) {
      this._renderAnimationBackground(x, y, width, height, animationProgress);
    }

    const cellX = this._getCellXPosition(x, width, alignment);
    const cellY = y + height / 2;

    // 커스텀 색상이 있으면 사용, 없으면 기본 헤더 색상 사용
    const color = headerTextColor || CONFIG.TABLE_HEADER_TEXT_COLOR;

    // 숫자/알파벳이면 KaTeX 폰트 적용, 한글은 bold 폰트
    // isHeader=true로 전달하여 상첨자 폰트 크기 조정
    this._renderCellText(cellText, cellX, cellY, alignment, color, true, true);
  }

  /**
   * 데이터 셀 렌더링
   * @param {Layer} layer - 데이터 셀 레이어
   */
  renderDataCell(layer) {
    const {
      x,
      y,
      width,
      height,
      cellText,
      alignment,
      highlighted,
      highlightProgress,
      isEvenRow,
      classData,
      showSuperscript,
      colLabel,
      tallyCount,
      animating,
      animationProgress,
      animationColor
    } = layer.data;

    // 애니메이션 배경 렌더링 (펄스 효과)
    if (animating && animationProgress > 0) {
      this._renderAnimationBackground(x, y, width, height, animationProgress);
    }

    // 하이라이트 배경 렌더링
    if (highlighted && highlightProgress > 0) {
      const alpha = highlightProgress * 0.3; // 최대 30% 투명도
      this.ctx.fillStyle = `rgba(255, 235, 59, ${alpha})`; // 노란색 하이라이트
      this.ctx.fillRect(x, y, width, height);
    }

    const cellX = this._getCellXPosition(x, width, alignment);
    const cellY = y + height / 2;

    // 탈리마크 셀인 경우 Canvas로 직접 그리기
    if (colLabel === CONFIG.DEFAULT_LABELS.table.tally && tallyCount !== undefined) {
      this._renderTallyCanvas(tallyCount, x, y, width, height, CONFIG.getColor('--color-text'));
      return;
    }

    // cellText가 탈리 객체인 경우 (파서에서 "/" 패턴으로 생성된 탈리마크)
    if (cellText && typeof cellText === 'object' && cellText.type === 'tally') {
      this._renderTallyCanvas(cellText.count, x, y, width, height, CONFIG.getColor('--color-text'));
      return;
    }

    // 상첨자가 필요한 경우 (첫 행의 계급 컬럼)
    if (classData && showSuperscript) {
      this._drawClassWithSuperscript(cellText, cellX, cellY, classData, showSuperscript);
      this.ctx.font = CONFIG.TABLE_FONT_DATA;
    } else {
      // 숫자/알파벳이면 KaTeX 폰트, 아니면 기본 폰트
      this._renderCellText(cellText, cellX, cellY, alignment, CONFIG.getColor('--color-text'));
    }
  }

  /**
   * 합계 셀 렌더링
   * @param {Layer} layer - 합계 셀 레이어
   */
  renderSummaryCell(layer) {
    const { x, y, width, height, cellText, alignment, animating, animationProgress } = layer.data;

    // 애니메이션 배경 렌더링 (펄스 효과)
    if (animating && animationProgress > 0) {
      this._renderAnimationBackground(x, y, width, height, animationProgress);
    }

    const cellX = this._getCellXPosition(x, width, alignment);
    const cellY = y + height / 2;

    // 숫자/알파벳이면 KaTeX 폰트, 아니면 기본 폰트
    this._renderCellText(cellText, cellX, cellY, alignment, CONFIG.getColor('--color-text'), true);
  }

  /**
   * 행 헤더 셀 렌더링 (카테고리 행렬, 이원 분류표용)
   * @param {Layer} layer - 행 헤더 셀 레이어
   */
  renderRowHeaderCell(layer) {
    const { x, y, width, height, cellText, alignment, textColor, animating, animationProgress } = layer.data;

    // 애니메이션 배경 렌더링 (펄스 효과)
    if (animating && animationProgress > 0) {
      this._renderAnimationBackground(x, y, width, height, animationProgress);
    }

    const cellX = this._getCellXPosition(x, width, alignment);
    const cellY = y + height / 2;

    // 커스텀 색상이 있으면 사용, 없으면 헤더 색상 사용
    const color = textColor || CONFIG.TABLE_HEADER_TEXT_COLOR;

    // 행 라벨은 데이터 셀과 동일한 폰트 크기 사용 (isHeader = false)
    // 상첨자가 있어도 기본 폰트 크기가 작아지지 않도록 함
    this._renderCellText(cellText, cellX, cellY, alignment, color, false, false);
  }

  /**
   * 줄기-잎 단일 모드 격자선 렌더링 (2열: 줄기 | 잎)
   * @param {Layer} layer - 줄기-잎 격자선 레이어
   */
  renderStemLeafSingleGrid(layer) {
    const { x, y, width, height, rowCount, stemColumnEnd } = layer.data;

    // 외곽선
    this.ctx.strokeStyle = CONFIG.TABLE_GRID_COLOR_LIGHT;
    this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_NORMAL;

    // 하단 선만
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + height);
    this.ctx.lineTo(x + width, y + height);
    this.ctx.stroke();

    // 헤더 아래 선
    const headerY = y + CONFIG.TABLE_HEADER_HEIGHT;
    this.ctx.beginPath();
    this.ctx.moveTo(x, headerY);
    this.ctx.lineTo(x + width, headerY);
    this.ctx.stroke();

    // 줄기 열 오른쪽 세로선 (점선, 헤더 아래부터)
    this.ctx.setLineDash(CONFIG.TABLE_GRID_DASH_PATTERN);
    this.ctx.beginPath();
    this.ctx.moveTo(stemColumnEnd, headerY);
    this.ctx.lineTo(stemColumnEnd, y + height);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // 수평 구분선 (실선)
    this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_THIN;
    this.ctx.strokeStyle = CONFIG.TABLE_GRID_COLOR_DARK;

    for (let i = 1; i < rowCount; i++) {
      const lineY = y + CONFIG.TABLE_HEADER_HEIGHT + (i * CONFIG.TABLE_ROW_HEIGHT);
      this.ctx.beginPath();
      this.ctx.moveTo(x, lineY);
      this.ctx.lineTo(x + width, lineY);
      this.ctx.stroke();
    }
  }

  /**
   * 줄기-잎 비교 모드 격자선 렌더링 (3열: 잎 | 줄기 | 잎)
   * @param {Layer} layer - 줄기-잎 격자선 레이어
   */
  renderStemLeafGrid(layer) {
    const { x, y, width, height, rowCount, stemColumnStart, stemColumnEnd } = layer.data;

    // 외곽선
    this.ctx.strokeStyle = CONFIG.TABLE_GRID_COLOR_LIGHT;
    this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_NORMAL;

    // 하단 선만 (상단 선 제거)
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + height);
    this.ctx.lineTo(x + width, y + height);
    this.ctx.stroke();

    // 헤더 아래 선
    const headerY = y + CONFIG.TABLE_HEADER_HEIGHT;
    this.ctx.beginPath();
    this.ctx.moveTo(x, headerY);
    this.ctx.lineTo(x + width, headerY);
    this.ctx.stroke();

    // 줄기 열 좌우 세로선 (점선, 헤더 아래부터)
    this.ctx.setLineDash(CONFIG.TABLE_GRID_DASH_PATTERN);
    this.ctx.beginPath();
    this.ctx.moveTo(stemColumnStart, headerY);
    this.ctx.lineTo(stemColumnStart, y + height);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(stemColumnEnd, headerY);
    this.ctx.lineTo(stemColumnEnd, y + height);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // 수평 구분선 (실선)
    this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_THIN;
    this.ctx.strokeStyle = CONFIG.TABLE_GRID_COLOR_DARK;

    for (let i = 1; i < rowCount; i++) {
      const lineY = y + CONFIG.TABLE_HEADER_HEIGHT + (i * CONFIG.TABLE_ROW_HEIGHT);
      this.ctx.beginPath();
      this.ctx.moveTo(x, lineY);
      this.ctx.lineTo(x + width, lineY);
      this.ctx.stroke();
    }
  }

  /**
   * 기본 테이블 격자선 렌더링 (2행 헤더 구조)
   * @param {Layer} layer - 격자선 레이어
   */
  renderBasicTableGrid(layer) {
    const {
      x, y, width, height, rowCount, columnWidths, hasSummaryRow,
      mergedHeaderHeight, columnHeaderHeight,
      mergedHeaderLineColor, mergedHeaderLineWidth,
      showMergedHeader = true,
      rowHeights = []
    } = layer.data;

    const totalHeaderHeight = mergedHeaderHeight + columnHeaderHeight;

    // 하단 선 (두께 2, 밝은 회색)
    this.ctx.strokeStyle = CONFIG.TABLE_GRID_COLOR_LIGHT;
    this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_NORMAL;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + height);
    this.ctx.lineTo(x + width, y + height);
    this.ctx.stroke();

    // 병합 헤더 아래 구분선 (#8DCF66, 데이터 열 영역만) - 조건부 렌더링
    if (showMergedHeader && mergedHeaderHeight > 0) {
      const dataColumnStartX = x + columnWidths[0];
      this.ctx.strokeStyle = mergedHeaderLineColor;
      this.ctx.lineWidth = mergedHeaderLineWidth;
      this.ctx.beginPath();
      this.ctx.moveTo(dataColumnStartX, y + mergedHeaderHeight);
      this.ctx.lineTo(x + width, y + mergedHeaderHeight);
      this.ctx.stroke();
    }

    // 컬럼 헤더 아래 선 (두께 2, 밝은 회색)
    this.ctx.strokeStyle = CONFIG.TABLE_GRID_COLOR_LIGHT;
    this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_NORMAL;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + totalHeaderHeight);
    this.ctx.lineTo(x + width, y + totalHeaderHeight);
    this.ctx.stroke();

    // 데이터 행 구분선
    let cumulativeY = 0;
    for (let i = 1; i <= rowCount; i++) {
      // rowHeights가 있으면 누적 높이 사용, 없으면 기존 방식
      const lineY = y + totalHeaderHeight + (rowHeights.length > 0
        ? cumulativeY
        : (i - 1) * CONFIG.TABLE_ROW_HEIGHT);

      // 첫 번째 선(컬럼 헤더 아래) 또는 마지막 선(합계 위)은 두께 2, 밝은 회색
      const isHeaderLine = i === 1;
      const isSummaryLine = hasSummaryRow && i === rowCount;

      if (isHeaderLine || isSummaryLine) {
        this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_NORMAL;
        this.ctx.strokeStyle = CONFIG.TABLE_GRID_COLOR_LIGHT;
      } else {
        this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_THIN;
        this.ctx.strokeStyle = CONFIG.TABLE_GRID_COLOR_DARK;
      }

      this.ctx.beginPath();
      this.ctx.moveTo(x, lineY);
      this.ctx.lineTo(x + width, lineY);
      this.ctx.stroke();

      // 다음 행을 위해 현재 행 높이 누적
      if (rowHeights.length > 0 && i <= rowHeights.length) {
        cumulativeY += rowHeights[i - 1];
      }
    }

    // 수직선 (점선, 컬럼 헤더 이후부터)
    this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_THIN;
    this.ctx.strokeStyle = CONFIG.TABLE_GRID_COLOR_LIGHT;
    this.ctx.setLineDash(CONFIG.TABLE_GRID_DASH_PATTERN);
    let lineX = x;
    for (let i = 0; i < columnWidths.length - 1; i++) {
      lineX += columnWidths[i];
      this.ctx.beginPath();
      this.ctx.moveTo(lineX, y + totalHeaderHeight);
      this.ctx.lineTo(lineX, y + height);
      this.ctx.stroke();
    }
    this.ctx.setLineDash([]); // 실선으로 복원
  }

  /**
   * 병합 헤더 셀 렌더링 (상대도수 또는 커스텀 텍스트)
   * @param {Layer} layer - 병합 헤더 셀 레이어
   */
  renderMergedHeaderCell(layer) {
    const { x, y, width, height, cellText, alignment, headerTextColor } = layer.data;

    // 빈 셀이면 렌더링 안 함
    if (!cellText) return;

    const cellX = this._getCellXPosition(x, width, alignment);
    const cellY = y + height / 2;

    const color = headerTextColor || CONFIG.TABLE_HEADER_TEXT_COLOR;

    // _renderCellText 사용하여 괄호 처리 적용 (isHeader=true)
    this._renderCellText(cellText, cellX, cellY, alignment, color, false, true);
  }

  /**
   * 줄기-잎 줄기 셀 렌더링
   * @param {Layer} layer - 줄기 셀 레이어
   */
  renderStemCell(layer) {
    const { x, y, width, height, cellText, alignment } = layer.data;

    const cellX = this._getCellXPosition(x, width, alignment);
    const cellY = y + height / 2;

    // 줄기는 숫자이므로 KaTeX 폰트 사용
    this._renderCellText(cellText, cellX, cellY, alignment, '#FFFFFF');
  }

  /**
   * 줄기-잎 잎 데이터 셀 렌더링
   * @param {Layer} layer - 잎 데이터 셀 레이어
   */
  renderStemLeafDataCell(layer) {
    const { x, y, width, height, alignment, leaves, cellText, isVariable } = layer.data;

    // 🔍 디버깅 로그
    console.log('[DEBUG] renderStemLeafDataCell:', {
      cellText,
      isVariable,
      leaves,
      'cellText.trim()': cellText ? cellText.trim() : null,
      'typeof cellText': typeof cellText
    });

    // 줄기-잎 전용 패딩 적용 (세로선과의 간격 확보)
    const stemLeafPadding = CONFIG.TABLE_STEM_LEAF_PADDING;
    let cellX;
    if (alignment === 'left') {
      cellX = x + stemLeafPadding;
    } else if (alignment === 'right') {
      cellX = x + width - stemLeafPadding;
    } else {
      cellX = x + width / 2;
    }
    const cellY = y + height / 2;

    // 고정 폰트 크기 (동적 너비로 조절되므로 폰트 축소 불필요)
    const fontSize = 24;

    // 변수인 경우와 일반 잎 데이터 분기
    if (isVariable) {
      // 변수인 경우: 이탤릭 강제
      this._renderStemLeafText(cellText, cellX, cellY, alignment, CONFIG.getColor('--color-text'), fontSize, true);
    } else {
      // 잎 데이터인 경우: 기존 렌더링
      const displayText = leaves ? leaves.join('      ') : '';
      this._renderStemLeafText(displayText, cellX, cellY, alignment, CONFIG.getColor('--color-text'), fontSize, false);
    }
  }

  /**
   * 줄기-잎 텍스트 렌더링 (동적 폰트 크기)
   * @param {string} text - 렌더링할 텍스트
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   * @param {string} alignment - 정렬 방식
   * @param {string} color - 텍스트 색상
   * @param {number} fontSize - 폰트 크기
   * @param {boolean} isVariable - 변수 여부 (소문자: KaTeX_Math, 대문자: KaTeX_Main)
   */
  _renderStemLeafText(text, x, y, alignment, color, fontSize, isVariable = false) {
    const str = String(text).trim();

    if (isVariable) {
      // 변수가 포함된 경우: 토큰별로 분리하여 렌더링
      const tokens = str.split(/\s+/);

      this.ctx.save();
      this.ctx.fillStyle = color;
      this.ctx.textBaseline = 'middle';

      // 전체 너비 계산 (원본: 6개 공백 사용)
      const gap = fontSize * 1.5; // 토큰 간 간격
      let totalWidth = 0;
      tokens.forEach((token, i) => {
        // 언더바는 빈칸으로 처리 (너비 0)
        if (token === '_') {
          if (i < tokens.length - 1) totalWidth += gap;
          return;
        }
        const isLowercase = /^[a-z]$/.test(token);
        this.ctx.font = isLowercase
          ? `italic ${fontSize}px KaTeX_Math, KaTeX_Main, Times New Roman, serif`
          : `${fontSize}px KaTeX_Main, Times New Roman, serif`;
        totalWidth += this.ctx.measureText(token).width;
        if (i < tokens.length - 1) totalWidth += gap;
      });

      // 정렬에 따른 시작 X 좌표
      let currentX = x;
      if (alignment === 'center') currentX = x - totalWidth / 2;
      else if (alignment === 'right') currentX = x - totalWidth;

      // 각 토큰 렌더링
      tokens.forEach((token, i) => {
        // 언더바는 빈칸으로 처리 (렌더링 스킵, 간격만 유지)
        if (token === '_') {
          currentX += gap;
          return;
        }
        const isLowercase = /^[a-z]$/.test(token);
        this.ctx.font = isLowercase
          ? `italic ${fontSize}px KaTeX_Math, KaTeX_Main, Times New Roman, serif`
          : `${fontSize}px KaTeX_Main, Times New Roman, serif`;
        this.ctx.textAlign = 'left';
        this.ctx.fillText(token, currentX, y);
        currentX += this.ctx.measureText(token).width + gap;
      });

      this.ctx.restore();
    } else {
      render$1(this.ctx, str, x, y, {
        fontSize,
        color,
        align: alignment,
        baseline: 'middle'
      });
    }
  }

  /**
   * 정렬에 따른 셀 X 좌표 계산
   * @param {number} cellStartX - 셀 시작 X 좌표
   * @param {number} cellWidth - 셀 너비
   * @param {string} alignment - 정렬 방식 ('left', 'center', 'right')
   * @returns {number} 텍스트 렌더링 X 좌표
   */
  _getCellXPosition(cellStartX, cellWidth, alignment) {
    switch (alignment) {
      case 'left':
        return cellStartX + CONFIG.TABLE_CELL_PADDING;
      case 'right':
        return cellStartX + cellWidth - CONFIG.TABLE_CELL_PADDING;
      case 'center':
      default:
        return cellStartX + cellWidth / 2;
    }
  }

  /**
   * 계급 텍스트를 상첨자와 함께 그리기
   * @param {string} cellText - 원본 셀 텍스트 (예: "2 ~ 4")
   * @param {number} cellX - 셀 중앙 X 좌표
   * @param {number} cellY - 셀 중앙 Y 좌표
   * @param {Object} classData - 계급 데이터 객체 (min, max 포함)
   * @param {boolean} showSuperscript - 상첨자 표시 여부
   */
  _drawClassWithSuperscript(cellText, cellX, cellY, classData, showSuperscript) {
    const min = classData.min;
    const max = classData.max;
    const color = CONFIG.getColor('--color-text');

    // 폰트 설정 (KaTeX 폰트 사용)
    const fontSize = 24;
    const katexFont = `${fontSize}px KaTeX_Main, Times New Roman, serif`;
    const superscriptFont = CONFIG.TABLE_FONT_SUPERSCRIPT;

    // 텍스트 구성 요소
    const minText = String(min);
    const maxText = String(max);
    const superMin = CONFIG.TABLE_SUPERSCRIPT_MIN_TEXT;
    const superMax = CONFIG.TABLE_SUPERSCRIPT_MAX_TEXT;
    const separator = CONFIG.TABLE_CLASS_SEPARATOR;

    // 각 구성 요소의 너비 측정 (KaTeX 폰트 기준)
    this.ctx.font = katexFont;
    const minWidth = this.ctx.measureText(minText).width;
    const maxWidth = this.ctx.measureText(maxText).width;
    const sepWidth = this.ctx.measureText(separator).width;

    // 상첨자 너비 측정
    this.ctx.font = superscriptFont;
    const superMinWidth = showSuperscript ? this.ctx.measureText(superMin).width : 0;
    const superMaxWidth = showSuperscript ? this.ctx.measureText(superMax).width : 0;

    // 전체 너비 계산
    const totalWidth = minWidth + superMinWidth + sepWidth + maxWidth + superMaxWidth;

    // 시작 X 좌표 (중앙 정렬)
    let x = cellX - totalWidth / 2;

    // Y 좌표 조정
    const normalY = cellY;
    const superscriptY = cellY - CONFIG.TABLE_SUPERSCRIPT_Y_OFFSET;

    // 색상 설정
    this.ctx.fillStyle = color;
    this.ctx.textBaseline = 'middle';

    // 1. min 숫자 그리기 (KaTeX 폰트)
    this.ctx.font = katexFont;
    this.ctx.textAlign = 'left';
    this.ctx.fillText(minText, x, normalY);
    x += minWidth;

    // 2. (이상) 상첨자 그리기 (옵션에 따라)
    if (showSuperscript) {
      this.ctx.font = superscriptFont;
      this.ctx.fillText(superMin, x, superscriptY);
      x += superMinWidth;
    }

    // 3. " ~ " 구분자 그리기 (KaTeX 폰트)
    this.ctx.font = katexFont;
    this.ctx.fillText(separator, x, normalY);
    x += sepWidth;

    // 4. max 숫자 그리기 (KaTeX 폰트)
    this.ctx.fillText(maxText, x, normalY);
    x += maxWidth;

    // 5. (미만) 상첨자 그리기 (옵션에 따라)
    if (showSuperscript) {
      this.ctx.font = superscriptFont;
      this.ctx.fillText(superMax, x, superscriptY);
    }
  }

  /**
   * 셀 텍스트 렌더링 (숫자/알파벳은 KaTeX 폰트, 그 외는 기본 폰트)
   * @param {string} text - 렌더링할 텍스트
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   * @param {string} alignment - 정렬 방식
   * @param {string} color - 텍스트 색상
   * @param {boolean} bold - 볼드 여부 (합계 행용)
   * @param {boolean} isHeader - 헤더 여부 (헤더는 더 작은 폰트)
   */
  _renderCellText(text, x, y, alignment, color, bold = false, isHeader = false) {
    // null은 빈칸 처리 (cellVariables에서 null 사용)
    if (text === null) {
      return;
    }

    const str = String(text).trim();
    const fontSize = isHeader ? 22 : 24;

    // 빈 문자열은 렌더링 스킵
    if (str === '') {
      return;
    }

    // LaTeX 분수 표기법(\frac{}{})이 포함된 경우 특별 처리
    const fracMatch = str.match(/^\\frac\{([^}]*)\}\{([^}]*)\}$/);
    if (fracMatch) {
      renderFraction(this.ctx, fracMatch[1], fracMatch[2], x, y, {
        fontSize: fontSize,
        color: color,
        align: alignment,
        baseline: 'middle'
      });
      return;
    }

    // 상첨자 표기법(^)이 포함된 경우 특별 처리
    if (str.includes('^')) {
      const parts = this._parseSuperscript(str);
      this._renderWithSuperscript(parts, x, y, alignment, color, bold, isHeader);
      return;
    }

    // 한글 포함 + 괄호 있는 경우 먼저 처리 (괄호를 작게 렌더링)
    // 예: "O형인 학생 수(명)", "전체 학생 수 (명)"
    const hasKorean = /[가-힣]/.test(str);
    const parenMatch = str.match(/^(.*?)(\s*\([^)]*\))$/);

    if (hasKorean && parenMatch && parenMatch[1].trim()) {
      // mainText가 있을 때만 작은 괄호 렌더링 (예: "학생 수(명)" ✅, "(가)" ❌)
      this._renderTextWithSmallParen(parenMatch[1], parenMatch[2], x, y, alignment, color, bold, fontSize, isHeader);
      return;
    }

    // 숫자 또는 알파벳만 포함된 경우 KaTeX 폰트 사용
    if (this._isNumericOrAlpha(str)) {
      render$1(this.ctx, str, x, y, {
        fontSize: fontSize,
        color: color,
        align: alignment,
        baseline: 'middle'
      });
    } else if (this._containsMixedKoreanAndNumeric(str)) {
      // 한글+숫자/알파벳 혼합인 경우 분리 렌더링 (예: "1반", "2반")
      this._renderMixedText(str, x, y, alignment, color, bold, fontSize, isHeader);
    } else {
      // 한글 등은 기본 폰트 사용 (괄호 처리는 상단에서 이미 완료됨)
      this.ctx.fillStyle = color;
      this.ctx.textBaseline = 'middle';
      // 헤더 → TABLE_FONT_HEADER, 합계 → TABLE_FONT_SUMMARY, 일반 → TABLE_FONT_DATA
      this.ctx.font = isHeader ? CONFIG.TABLE_FONT_HEADER : (bold ? CONFIG.TABLE_FONT_SUMMARY : CONFIG.TABLE_FONT_DATA);
      this.ctx.textAlign = alignment;
      this.ctx.fillText(str, x, y);
    }
  }

  /**
   * 숫자 또는 알파벳만 포함된 문자열인지 확인
   * @param {string} text - 확인할 텍스트
   * @returns {boolean}
   */
  _isNumericOrAlpha(text) {
    // 숫자, 소수점, 음수, 알파벳, 공백, ~만 포함
    return /^[-\d.\sA-Za-z~%]+$/.test(text);
  }

  /**
   * 한글과 숫자/알파벳이 혼합된 문자열인지 확인
   * @param {string} text - 확인할 텍스트
   * @returns {boolean}
   */
  _containsMixedKoreanAndNumeric(text) {
    const hasKorean = /[가-힣]/.test(text);
    const hasNumericOrAlpha = /[0-9A-Za-z]/.test(text);
    return hasKorean && hasNumericOrAlpha;
  }

  /**
   * 한글+숫자/알파벳 혼합 텍스트 렌더링 (예: "1반", "2반")
   * 숫자/알파벳은 KaTeX 폰트, 한글은 기본 폰트 사용
   * @param {string} text - 렌더링할 텍스트
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   * @param {string} alignment - 정렬 방식
   * @param {string} color - 텍스트 색상
   * @param {boolean} bold - 볼드 여부
   * @param {number} fontSize - 폰트 크기 (숫자/알파벳용)
   * @param {boolean} isHeader - 헤더 여부
   */
  _renderMixedText(text, x, y, alignment, color, bold, fontSize, isHeader = false) {
    const segments = this._splitByCharType(text);
    // 한글은 기존 테이블 폰트 크기(18px) 유지
    const koreanFontSize = 18;

    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.textBaseline = 'middle';

    // 전체 너비 계산
    let totalWidth = 0;
    segments.forEach(seg => {
      const segFontSize = seg.type === 'korean' ? koreanFontSize : fontSize;
      this.ctx.font = this._getFontForCharType(seg.type, segFontSize, bold, isHeader);
      totalWidth += this.ctx.measureText(seg.text).width;
    });

    // 정렬에 따른 시작 X 좌표
    let currentX = x;
    if (alignment === 'center') currentX = x - totalWidth / 2;
    else if (alignment === 'right') currentX = x - totalWidth;

    // 각 세그먼트 렌더링
    this.ctx.textAlign = 'left';
    segments.forEach(seg => {
      const segFontSize = seg.type === 'korean' ? koreanFontSize : fontSize;
      this.ctx.font = this._getFontForCharType(seg.type, segFontSize, bold, isHeader);
      this.ctx.fillText(seg.text, currentX, y);
      currentX += this.ctx.measureText(seg.text).width;
    });

    this.ctx.restore();
  }

  /**
   * 괄호가 있는 텍스트를 분리하여 렌더링 (괄호는 작은 폰트)
   * 예: "O형인 학생 수(명)" → "O형인 학생 수" + "(명)"
   * @param {string} mainText - 메인 텍스트
   * @param {string} parenText - 괄호 텍스트
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   * @param {string} alignment - 정렬 방식
   * @param {string} color - 텍스트 색상
   * @param {boolean} bold - 볼드 여부
   * @param {number} fontSize - 폰트 크기
   * @param {boolean} isHeader - 헤더 여부
   */
  _renderTextWithSmallParen(mainText, parenText, x, y, alignment, color, bold, fontSize, isHeader = false) {
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.textBaseline = 'middle';

    const smallFont = bold ? "bold 12px 'SCDream', sans-serif" : "300 12px 'SCDream', sans-serif";
    const koreanFontSize = 18;

    // 메인 텍스트 너비 계산
    let mainWidth = 0;
    const isMixed = this._containsMixedKoreanAndNumeric(mainText);

    if (isMixed) {
      // 혼합 텍스트: 세그먼트별 너비 계산
      const segments = this._splitByCharType(mainText);
      segments.forEach(seg => {
        const segFontSize = seg.type === 'korean' ? koreanFontSize : fontSize;
        this.ctx.font = this._getFontForCharType(seg.type, segFontSize, bold, isHeader);
        mainWidth += this.ctx.measureText(seg.text).width;
      });
    } else {
      // 순수 한글: 헤더 → TABLE_FONT_HEADER, 합계 → TABLE_FONT_SUMMARY, 일반 → TABLE_FONT_DATA
      this.ctx.font = isHeader ? CONFIG.TABLE_FONT_HEADER : (bold ? CONFIG.TABLE_FONT_SUMMARY : CONFIG.TABLE_FONT_DATA);
      mainWidth = this.ctx.measureText(mainText).width;
    }

    // 괄호 텍스트 너비 계산 (KaTeX 폰트 적용 고려)
    const parenContent = parenText.replace(/[()]/g, '').trim();
    const smallFontSize = 12;
    const lowercaseFontSize = 15; // 소문자는 이탤릭이라 더 크게
    let parenWidth = 0;

    // 여는 괄호
    this.ctx.font = smallFont;
    parenWidth += this.ctx.measureText('(').width;

    // 괄호 내부 텍스트
    if (parenContent) {
      const segments = this._splitByCharType(parenContent);
      segments.forEach(seg => {
        const segSize = seg.type === 'lowercase' ? lowercaseFontSize : smallFontSize;
        this.ctx.font = this._getFontForCharType(seg.type, segSize, false);
        parenWidth += this.ctx.measureText(seg.text).width;
      });
    }

    // 닫는 괄호
    this.ctx.font = smallFont;
    parenWidth += this.ctx.measureText(')').width;

    // 전체 너비로 시작 X 좌표 계산
    const totalWidth = mainWidth + parenWidth;
    let startX;
    if (alignment === 'center') {
      startX = x - totalWidth / 2;
    } else if (alignment === 'right') {
      startX = x - totalWidth;
    } else {
      startX = x;
    }

    // 메인 텍스트 렌더링
    this.ctx.textAlign = 'left';
    if (isMixed) {
      // 혼합 텍스트: 세그먼트별 렌더링
      const segments = this._splitByCharType(mainText);
      let currentX = startX;
      segments.forEach(seg => {
        const segFontSize = seg.type === 'korean' ? koreanFontSize : fontSize;
        this.ctx.font = this._getFontForCharType(seg.type, segFontSize, bold, isHeader);
        this.ctx.fillText(seg.text, currentX, y);
        currentX += this.ctx.measureText(seg.text).width;
      });
    } else {
      // 순수 한글: 헤더 → TABLE_FONT_HEADER, 합계 → TABLE_FONT_SUMMARY, 일반 → TABLE_FONT_DATA
      this.ctx.font = isHeader ? CONFIG.TABLE_FONT_HEADER : (bold ? CONFIG.TABLE_FONT_SUMMARY : CONFIG.TABLE_FONT_DATA);
      this.ctx.fillText(mainText, startX, y);
    }

    // 괄호 텍스트 렌더링 (작은 폰트, 약간 아래로)
    // 괄호 내부 텍스트에 KaTeX 폰트 적용
    let parenX = startX + mainWidth;

    // 여는 괄호
    this.ctx.font = smallFont;
    this.ctx.fillText('(', parenX, y + 2);
    parenX += this.ctx.measureText('(').width;

    // 괄호 내부 텍스트: 문자 유형별 폰트 적용
    if (parenContent) {
      const segments = this._splitByCharType(parenContent);
      segments.forEach(seg => {
        const segSize = seg.type === 'lowercase' ? lowercaseFontSize : smallFontSize;
        this.ctx.font = this._getFontForCharType(seg.type, segSize, false);
        this.ctx.fillText(seg.text, parenX, y + 2);
        parenX += this.ctx.measureText(seg.text).width;
      });
    }

    // 닫는 괄호
    this.ctx.font = smallFont;
    this.ctx.fillText(')', parenX, y + 2);

    this.ctx.restore();
  }

  /**
   * 상첨자 표기법 파싱
   * @param {string} text - 파싱할 텍스트 (예: "x^2", "3^{이상}")
   * @returns {Array} 파싱 결과 [{text, super: boolean}, ...]
   */
  _parseSuperscript(text) {
    const result = [];
    // ^{...} 또는 ^x 패턴 매칭
    const regex = /\^(\{[^}]+\}|[^\s{])/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // 매치 이전 일반 텍스트
      if (match.index > lastIndex) {
        result.push({ text: text.slice(lastIndex, match.index), super: false });
      }
      // 상첨자 텍스트 (중괄호 제거)
      let superText = match[1];
      if (superText.startsWith('{') && superText.endsWith('}')) {
        superText = superText.slice(1, -1);
      }
      result.push({ text: superText, super: true });
      lastIndex = regex.lastIndex;
    }

    // 나머지 일반 텍스트
    if (lastIndex < text.length) {
      result.push({ text: text.slice(lastIndex), super: false });
    }

    return result;
  }

  /**
   * 텍스트를 문자 유형별로 분리
   * @param {string} text - 분리할 텍스트
   * @returns {Array} [{text, type: 'korean'|'lowercase'|'other'}, ...]
   */
  _splitByCharType(text) {
    const result = [];
    let current = { text: '', type: null };

    for (const char of text) {
      let type;
      if (/[가-힣]/.test(char)) type = 'korean';
      else if (/[a-z]/.test(char)) type = 'lowercase';
      else type = 'other'; // 대문자, 숫자, 특수문자

      if (type === current.type) {
        current.text += char;
      } else {
        if (current.text) result.push(current);
        current = { text: char, type };
      }
    }
    if (current.text) result.push(current);
    return result;
  }

  /**
   * 문자 유형에 따른 폰트 정보 반환
   * @param {string} type - 문자 유형 ('korean', 'lowercase', 'other')
   * @param {number} fontSize - 폰트 크기
   * @param {boolean} bold - 볼드 여부
   * @param {boolean} isHeader - 헤더 여부 (헤더는 Medium 사용)
   * @returns {string} CSS 폰트 문자열
   */
  _getFontForCharType(type, fontSize, bold = false, isHeader = false) {
    if (type === 'korean') {
      // 한글: SCDream 폰트 사용 (헤더 또는 볼드면 Medium)
      const fontWeight = (bold || isHeader) ? '500 ' : '300 ';
      return `${fontWeight}${fontSize}px 'SCDream', sans-serif`;
    } else if (type === 'lowercase') {
      return `italic ${fontSize}px KaTeX_Math, KaTeX_Main, Times New Roman, serif`;
    } else {
      // 대문자/숫자는 볼드 적용 안 함
      return `${fontSize}px KaTeX_Main, Times New Roman, serif`;
    }
  }

  /**
   * 상첨자가 포함된 텍스트 렌더링
   * @param {Array} parts - 파싱된 텍스트 파트 배열
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   * @param {string} alignment - 정렬 ('left', 'center', 'right')
   * @param {string} color - 텍스트 색상
   * @param {boolean} bold - 볼드 여부
   * @param {boolean} isHeader - 헤더 여부 (헤더는 더 작은 폰트)
   */
  _renderWithSuperscript(parts, x, y, alignment, color, bold = false, isHeader = false) {
    // 헤더인 경우 더 작은 폰트 사용 (_renderCellText와 동일한 기준)
    const normalFontSize = isHeader ? 22 : 24;
    const superFontSize = isHeader ? 12 : 14;
    const superYOffset = isHeader ? -7 : -8;

    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.textBaseline = 'middle';

    // 전체 너비 계산 (각 파트를 문자 유형별로 분리하여 측정)
    let totalWidth = 0;
    parts.forEach(part => {
      const fontSize = part.super ? superFontSize : normalFontSize;
      const segments = this._splitByCharType(part.text);
      segments.forEach(seg => {
        this.ctx.font = this._getFontForCharType(seg.type, fontSize, bold && !part.super);
        totalWidth += this.ctx.measureText(seg.text).width;
      });
    });

    // 정렬에 따른 시작 X 좌표
    let currentX;
    if (alignment === 'center') {
      currentX = x - totalWidth / 2;
    } else if (alignment === 'right') {
      currentX = x - totalWidth;
    } else {
      currentX = x;
    }

    // 각 파트 렌더링 (문자 유형별로 분리하여 렌더링)
    this.ctx.textAlign = 'left';
    parts.forEach(part => {
      const fontSize = part.super ? superFontSize : normalFontSize;
      const yOffset = part.super ? superYOffset : 0;
      const segments = this._splitByCharType(part.text);

      segments.forEach(seg => {
        this.ctx.font = this._getFontForCharType(seg.type, fontSize, bold && !part.super);
        this.ctx.fillText(seg.text, currentX, y + yOffset);
        currentX += this.ctx.measureText(seg.text).width;
      });
    });

    this.ctx.restore();
  }

  /**
   * Canvas로 탈리마크 그리기 (정자 스타일: 세로선 4개 + 대각선 = 5)
   * @param {number} count - 탈리 개수
   * @param {number} cellX - 셀 X 좌표
   * @param {number} cellY - 셀 Y 좌표
   * @param {number} cellWidth - 셀 너비
   * @param {number} cellHeight - 셀 높이
   * @param {string} color - 선 색상
   */
  _renderTallyCanvas(count, cellX, cellY, cellWidth, cellHeight, color) {
    if (count <= 0) return;

    const lineHeight = CONFIG.TALLY_LINE_HEIGHT;
    const lineSpacing = CONFIG.TALLY_LINE_SPACING;
    const groupSpacing = CONFIG.TALLY_GROUP_SPACING;

    // 전체 너비 계산
    const groups = Math.floor(count / 5);
    const remainder = count % 5;
    const groupWidth = 4 * lineSpacing; // 5개 묶음 너비 (세로선 4개 + 대각선)
    const remainderWidth = remainder > 0 ? (remainder - 1) * lineSpacing : 0;
    // 간격 개수: 그룹만 있으면 groups-1, 나머지도 있으면 groups
    const numGaps = groups > 0 ? (remainder > 0 ? groups : Math.max(0, groups - 1)) : 0;
    const totalWidth = groups * groupWidth + numGaps * groupSpacing + remainderWidth;

    // 셀 중앙 정렬
    let x = cellX + (cellWidth - totalWidth) / 2;
    const y = cellY + cellHeight / 2;

    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = CONFIG.TALLY_LINE_WIDTH;
    this.ctx.lineCap = 'round';

    let remaining = count;

    while (remaining > 0) {
      if (remaining >= 5) {
        // 5개 묶음: 세로선 4개 + 대각선
        this._drawTallyGroup(x, y, lineHeight, lineSpacing);
        x += groupWidth + groupSpacing;
        remaining -= 5;
      } else {
        // 나머지: 세로선만
        for (let i = 0; i < remaining; i++) {
          this._drawTallyLine(x + i * lineSpacing, y, lineHeight);
        }
        remaining = 0;
      }
    }

    this.ctx.restore();
  }

  /**
   * 탈리 슬래시 1개 그리기 (/)
   * @param {number} x - X 좌표
   * @param {number} y - 중앙 Y 좌표
   * @param {number} height - 선 높이
   */
  _drawTallyLine(x, y, height) {
    this.ctx.beginPath();
    this.ctx.moveTo(x - height / 4, y + height / 2);  // 왼쪽 아래
    this.ctx.lineTo(x + height / 4, y - height / 2);  // 오른쪽 위
    this.ctx.stroke();
  }

  /**
   * 탈리 5개 묶음 그리기 (슬래시 4개 + 교차선)
   * @param {number} x - 시작 X 좌표
   * @param {number} y - 중앙 Y 좌표
   * @param {number} height - 선 높이
   * @param {number} spacing - 선 간격
   */
  _drawTallyGroup(x, y, height, spacing) {
    // 슬래시 4개 (/)
    for (let i = 0; i < 4; i++) {
      this._drawTallyLine(x + i * spacing, y, height);
    }
    // 교차선 (\) - 왼쪽 위 → 오른쪽 아래
    this.ctx.beginPath();
    this.ctx.moveTo(x - spacing * 0.3, y - height / 2);  // 왼쪽 위
    this.ctx.lineTo(x + 3 * spacing + spacing * 0.3, y + height / 2);  // 오른쪽 아래
    this.ctx.stroke();
  }

  /**
   * 애니메이션 배경 렌더링 (펄스 효과)
   * @param {number} x - 셀 X 좌표
   * @param {number} y - 셀 Y 좌표
   * @param {number} width - 셀 너비
   * @param {number} height - 셀 높이
   * @param {number} progress - 애니메이션 진행도 (0~1)
   */
  _renderAnimationBackground(x, y, width, height, progress) {
    // 색상: #89EC4E (RGB: 137, 236, 78)
    const fillAlpha = progress * 0.3; // fill: 30% opacity
    const strokeAlpha = progress; // stroke: 100% opacity

    this.ctx.save();

    // Fill (30% opacity)
    this.ctx.fillStyle = `rgba(137, 236, 78, ${fillAlpha})`;
    this.ctx.fillRect(x, y, width, height);

    // Stroke (100% opacity)
    this.ctx.strokeStyle = `rgba(137, 236, 78, ${strokeAlpha})`;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x + 1, y + 1, width - 2, height - 2);

    this.ctx.restore();
  }
}

/**
 * 테이블 팩토리 기본 클래스
 * 공통 레이어 생성 로직
 */


class BaseTableFactory {
  /**
   * 열 너비 계산
   * @param {number} canvasWidth - Canvas 너비
   * @param {number} padding - 패딩
   * @param {number} columnCount - 표시할 열 개수
   * @param {Array<number>} customWidths - 커스텀 열 너비 비율 (선택)
   * @returns {Array} 각 열의 너비 배열
   */
  static calculateColumnWidths(canvasWidth, padding, columnCount, customWidths = null) {
    const totalWidth = canvasWidth - padding * 2;

    if (customWidths && customWidths.length === columnCount) {
      const totalRatio = customWidths.reduce((a, b) => a + b, 0);
      return customWidths.map(ratio => (ratio / totalRatio) * totalWidth);
    }

    const widthPerColumn = totalWidth / columnCount;
    return Array(columnCount).fill(widthPerColumn);
  }

  /**
   * 격자선 레이어 생성
   * @param {Object} options - 옵션
   * @returns {Layer} 격자선 레이어
   */
  static createGridLayer(options) {
    const {
      canvasWidth,
      padding,
      rowCount,
      columnWidths,
      tableId,
      tableType = '',
      headerHeight = CONFIG.TABLE_HEADER_HEIGHT,
      rowHeight = CONFIG.TABLE_ROW_HEIGHT,
      hasSummaryRow = false
    } = options;

    const totalWidth = canvasWidth - padding * 2;
    const totalHeight = headerHeight + (rowCount * rowHeight);
    const idPrefix = tableType ? `${tableType}-` : '';

    return new Layer({
      id: `${idPrefix}${tableId}-table-grid`,
      name: '격자선',
      type: 'grid',
      visible: true,
      order: 0,
      data: {
        x: padding,
        y: padding,
        width: totalWidth,
        height: totalHeight,
        rowCount,
        columnWidths,
        headerHeight,
        rowHeight,
        hasSummaryRow
      }
    });
  }

  /**
   * 헤더 행 레이어 생성
   * @param {Object} options - 옵션
   * @returns {Layer} 헤더 그룹 레이어
   */
  static createHeaderLayer(options) {
    const {
      headers,
      columnWidths,
      columnAlignment = {},
      padding,
      tableId,
      tableType = '',
      headerHeight = CONFIG.TABLE_HEADER_HEIGHT,
      rowHeaderLabel = null  // 행 헤더 컬럼 라벨 (이원 분류표용)
    } = options;

    const idPrefix = tableType ? `${tableType}-` : '';

    const headerGroup = new Layer({
      id: `${idPrefix}${tableId}-table-header`,
      name: '헤더 행',
      type: 'group',
      visible: true,
      order: 1,
      data: {}
    });

    let x = padding;
    const y = padding;

    // 행 헤더 컬럼이 있는 경우 (이원 분류표)
    const allHeaders = rowHeaderLabel ? [rowHeaderLabel, ...headers] : headers;

    allHeaders.forEach((header, i) => {
      const cellLayer = new Layer({
        id: `${idPrefix}${tableId}-table-header-col${i}`,
        name: header,
        type: 'cell',
        visible: true,
        order: i,
        data: {
          rowType: 'header',
          rowIndex: -1,
          colIndex: i,
          colLabel: header,
          cellText: header,
          x,
          y,
          width: columnWidths[i],
          height: headerHeight,
          alignment: columnAlignment[header] || 'center',
          highlighted: false,
          highlightProgress: 0
        }
      });

      headerGroup.addChild(cellLayer);
      x += columnWidths[i];
    });

    return headerGroup;
  }

  /**
   * 데이터 셀 레이어 생성
   * @param {Object} options - 옵션
   * @returns {Layer} 셀 레이어
   */
  static createCellLayer(options) {
    const {
      tableId,
      tableType = '',
      rowIndex,
      colIndex,
      cellText,
      x,
      y,
      width,
      height = CONFIG.TABLE_ROW_HEIGHT,
      alignment = 'center',
      rowType = 'data',
      colLabel = ''
    } = options;

    const idPrefix = tableType ? `${tableType}-` : '';

    return new Layer({
      id: `${idPrefix}${tableId}-table-row-${rowIndex}-col${colIndex}`,
      name: String(cellText),
      type: 'cell',
      visible: true,
      order: colIndex,
      data: {
        rowType,
        rowIndex,
        colIndex,
        colLabel,
        cellText: String(cellText),
        x,
        y,
        width,
        height,
        alignment,
        highlighted: false,
        highlightProgress: 0,
        isEvenRow: rowIndex % 2 === 1
      }
    });
  }

  /**
   * 루트 레이어 생성
   * @param {Object} options - 옵션
   * @returns {Layer} 루트 레이어
   */
  static createRootLayer(options) {
    const {
      tableId,
      tableName,
      canvasWidth,
      canvasHeight,
      padding,
      columnCount,
      rowCount,
      tableType = ''
    } = options;

    const idPrefix = tableType ? `${tableType}-` : '';

    return new Layer({
      id: `${idPrefix}${tableId}-table-root`,
      name: tableName,
      type: 'group',
      visible: true,
      order: 0,
      data: {
        canvasWidth,
        canvasHeight,
        padding,
        columnCount,
        rowCount,
        tableType
      }
    });
  }

  /**
   * Canvas 높이 계산
   * @param {number} rowCount - 행 개수 (헤더 제외)
   * @param {number} padding - 패딩
   * @param {number} headerHeight - 헤더 높이
   * @param {number} rowHeight - 행 높이
   * @returns {number} Canvas 높이
   */
  static calculateCanvasHeight(rowCount, padding, headerHeight = CONFIG.TABLE_HEADER_HEIGHT, rowHeight = CONFIG.TABLE_ROW_HEIGHT) {
    return headerHeight + (rowCount * rowHeight) + padding * 2;
  }

  /**
   * 텍스트 너비 측정
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {string} text - 측정할 텍스트
   * @param {string} font - 폰트 설정
   * @returns {number} 텍스트 너비 (px)
   */
  static measureTextWidth(ctx, text, font) {
    ctx.font = font;
    // 상첨자 표기 제거 후 측정 (^{...} 또는 ^x)
    const cleanText = this.stripSuperscript(String(text));
    return ctx.measureText(cleanText).width;
  }

  /**
   * 상첨자 표기 제거
   * @param {string} text - 원본 텍스트
   * @returns {string} 상첨자 표기가 제거된 텍스트
   */
  static stripSuperscript(text) {
    // ^{...} 형식 제거
    let result = text.replace(/\^{[^}]*}/g, '');
    // ^x (단일 문자) 형식 제거
    result = result.replace(/\^[^\s{]/g, '');
    return result;
  }

  /**
   * 테이블 동적 너비 계산
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {Array<string>} headers - 헤더 텍스트 배열
   * @param {Array<Array<string>>} rows - 2차원 행 데이터 배열
   * @param {Object} options - 옵션
   * @returns {Object} { columnWidths: Array, totalWidth: number }
   */
  static calculateDynamicWidths(ctx, headers, rows, options = {}) {
    const {
      headerFont = CONFIG.TABLE_FONT_HEADER,
      dataFont = '24px KaTeX_Main, Times New Roman, serif',  // 실제 렌더링 폰트와 동일
      cellPadding = 32,   // 좌우 합계 (넉넉하게)
      headerExtraPadding = 16  // 헤더 추가 패딩
    } = options;

    const columnCount = headers.length;
    const columnWidths = [];

    // 각 컬럼별 최대 너비 계산
    for (let col = 0; col < columnCount; col++) {
      // 헤더 너비
      const headerWidth = this.measureTextWidth(ctx, headers[col], headerFont) + cellPadding + headerExtraPadding;

      // 데이터 셀 중 최대 너비
      let maxDataWidth = 0;
      for (const row of rows) {
        if (row[col] !== undefined && row[col] !== null) {
          const cellText = String(row[col]);
          // 상첨자가 있으면 추가 패딩 (상첨자 텍스트도 렌더링되므로)
          const hasSuperscript = /\^/.test(cellText);
          const superscriptPadding = hasSuperscript ? 40 : 0;
          const dataWidth = this.measureTextWidth(ctx, cellText, dataFont) + cellPadding + superscriptPadding;
          maxDataWidth = Math.max(maxDataWidth, dataWidth);
        }
      }

      // 헤더와 데이터 중 큰 값 선택
      columnWidths.push(Math.max(headerWidth, maxDataWidth));
    }

    // 총 너비 계산
    const contentWidth = columnWidths.reduce((sum, w) => sum + w, 0);
    const totalWidth = contentWidth + CONFIG.TABLE_PADDING * 2;

    // 최소/최대 너비 제한 적용
    const clampedWidth = Math.max(
      CONFIG.TABLE_MIN_WIDTH,
      Math.min(CONFIG.TABLE_MAX_WIDTH, totalWidth)
    );

    // 너비 제한으로 인한 조정이 필요한 경우 비율 조정
    if (clampedWidth !== totalWidth) {
      const targetContentWidth = clampedWidth - CONFIG.TABLE_PADDING * 2;
      const ratio = targetContentWidth / contentWidth;
      return {
        columnWidths: columnWidths.map(w => w * ratio),
        canvasWidth: clampedWidth
      };
    }

    return { columnWidths, canvasWidth: totalWidth };
  }
}

/**
 * 카테고리 행렬 테이블 팩토리
 * 가로: 카테고리, 세로: 데이터 종류
 */


class CategoryMatrixFactory {
  /**
   * 카테고리 행렬 테이블 레이어 생성
   * @param {LayerManager} layerManager - 레이어 매니저
   * @param {Object} data - 파싱된 데이터 { headers: [], rows: [{ label, values }] }
   * @param {Object} config - 테이블 설정
   * @param {string} tableId - 테이블 고유 ID
   */
  static createTableLayers(layerManager, data, config = null, tableId = 'table-1') {
    const { headers, rows } = data;

    // 첫 번째 열은 행 라벨, 나머지는 데이터
    const columnCount = headers.length + 1; // +1 for row label column
    const rowCount = rows.length; // 합계 행 없음

    const padding = CONFIG.TABLE_PADDING;
    const canvasWidth = config?.canvasWidth || CONFIG.TABLE_CANVAS_WIDTH;
    const canvasHeight = BaseTableFactory.calculateCanvasHeight(rowCount, padding);

    // 열 너비 계산 (config에서 전달받거나 자동 계산)
    const columnWidths = config?.columnWidths || this._calculateColumnWidths(canvasWidth, padding, columnCount);

    // 루트 레이어 생성
    const rootLayer = BaseTableFactory.createRootLayer({
      tableId,
      tableName: '카테고리 행렬',
      canvasWidth,
      canvasHeight,
      padding,
      columnCount,
      rowCount,
      tableType: CONFIG.TABLE_TYPES.CATEGORY_MATRIX
    });

    // 격자선 레이어 (카테고리 행렬은 합계 행 없음)
    const gridLayer = BaseTableFactory.createGridLayer({
      canvasWidth,
      padding,
      rowCount,
      columnWidths,
      tableId,
      tableType: CONFIG.TABLE_TYPES.CATEGORY_MATRIX,
      hasSummaryRow: false
    });
    rootLayer.addChild(gridLayer);

    // 헤더 레이어 (첫 열은 빈 칸 또는 라벨)
    const headerLayer = this._createHeaderLayer(headers, columnWidths, padding, tableId);
    rootLayer.addChild(headerLayer);

    // 데이터 행 레이어
    rows.forEach((row, rowIndex) => {
      const rowLayer = this._createDataRowLayer(
        row,
        rowIndex,
        columnWidths,
        padding,
        tableId
      );
      rootLayer.addChild(rowLayer);
    });

    // LayerManager에 추가
    layerManager.addLayer(rootLayer, 'root');
  }

  /**
   * ParserAdapter의 통일된 출력 형식으로 테이블 레이어 생성
   * @param {LayerManager} layerManager - 레이어 매니저
   * @param {Object} adaptedData - ParserAdapter.adapt() 출력
   * @param {Object} config - 테이블 설정
   * @param {string} tableId - 테이블 고유 ID
   */
  static createFromAdaptedData(layerManager, adaptedData, config = null, tableId = 'table-1') {
    const { headers, rows, metadata } = adaptedData;
    const { originalHeaders } = metadata;

    // adaptedData를 기존 파서 형식으로 변환
    // adaptedData.headers = ['구분', ...originalHeaders]
    // adaptedData.rows = [{ label, cells: [{ value: label }, { value }, ...] }]
    const legacyData = {
      headers: originalHeaders,
      rows: rows.map(row => ({
        label: row.label,
        values: row.cells.slice(1).map(cell => cell.value)  // 첫 번째 셀(라벨) 제외
      }))
    };

    // 기존 메서드 호출
    this.createTableLayers(layerManager, legacyData, config, tableId);
  }

  /**
   * 열 너비 계산 (첫 번째 열은 더 넓게)
   */
  static _calculateColumnWidths(canvasWidth, padding, columnCount) {
    const totalWidth = canvasWidth - padding * 2;
    // 첫 번째 열(라벨)은 30%, 나머지는 균등 분배
    const labelColumnWidth = totalWidth * 0.3;
    const dataColumnWidth = (totalWidth * 0.7) / (columnCount - 1);

    return [labelColumnWidth, ...Array(columnCount - 1).fill(dataColumnWidth)];
  }

  /**
   * 헤더 레이어 생성
   */
  static _createHeaderLayer(headers, columnWidths, padding, tableId) {
    const headerGroup = new Layer({
      id: `category-matrix-${tableId}-table-header`,
      name: '헤더 행',
      type: 'group',
      visible: true,
      order: 1,
      data: {}
    });

    let x = padding;
    const y = padding;

    // 첫 번째 열은 빈 칸
    const allHeaders = ['', ...headers];

    allHeaders.forEach((header, i) => {
      const cellLayer = new Layer({
        id: `category-matrix-${tableId}-table-header-col${i}`,
        name: header || '(빈 셀)',
        type: 'cell',
        visible: true,
        order: i,
        data: {
          rowType: 'header',
          rowIndex: -1,
          colIndex: i,
          colLabel: header,
          cellText: header,
          x,
          y,
          width: columnWidths[i],
          height: CONFIG.TABLE_HEADER_HEIGHT,
          alignment: 'center',
          highlighted: false,
          highlightProgress: 0,
          headerTextColor: '#FFFFFF'
        }
      });

      headerGroup.addChild(cellLayer);
      x += columnWidths[i];
    });

    return headerGroup;
  }

  /**
   * 데이터 행 레이어 생성
   */
  static _createDataRowLayer(row, rowIndex, columnWidths, padding, tableId) {
    const rowGroup = new Layer({
      id: `category-matrix-${tableId}-table-row-${rowIndex}`,
      name: `데이터 행 ${rowIndex}`,
      type: 'group',
      visible: true,
      order: rowIndex + 2,
      data: { rowIndex }
    });

    const y = padding + CONFIG.TABLE_HEADER_HEIGHT + (rowIndex * CONFIG.TABLE_ROW_HEIGHT);
    let x = padding;

    // 첫 번째 열은 행 라벨
    const cells = [row.label, ...row.values];

    cells.forEach((cellText, colIndex) => {
      const isLabelColumn = colIndex === 0;

      const cellLayer = new Layer({
        id: `category-matrix-${tableId}-table-row-${rowIndex}-col${colIndex}`,
        name: String(cellText),
        type: 'cell',
        visible: true,
        order: colIndex,
        data: {
          rowType: isLabelColumn ? 'row-header' : 'data',
          rowIndex,
          colIndex,
          colLabel: '',
          cellText: String(cellText),
          x,
          y,
          width: columnWidths[colIndex],
          height: CONFIG.TABLE_ROW_HEIGHT,
          alignment: isLabelColumn ? 'center' : 'center',
          highlighted: false,
          highlightProgress: 0,
          isEvenRow: rowIndex % 2 === 1,
          isLabelColumn
        }
      });

      rowGroup.addChild(cellLayer);
      x += columnWidths[colIndex];
    });

    return rowGroup;
  }
}

/**
 * 기본 테이블 팩토리 (구 이원 분류표)
 * 행: 카테고리 (혈액형 등), 열: 그룹 (남학생, 여학생 등)
 * 2행 헤더 구조: 병합 헤더(상대도수) + 컬럼 헤더
 */


// 기본 테이블 전용 상수
const BASIC_TABLE_CONFIG = {
  MERGED_HEADER_HEIGHT: 35,           // 병합 헤더 높이
  MERGED_HEADER_TEXT: '상대도수',      // 병합 헤더 텍스트
  MERGED_HEADER_LINE_COLOR: '#8DCF66', // 병합 헤더 아래 구분선 색상
  MERGED_HEADER_LINE_WIDTH: 1          // 구분선 두께
};

class BasicTableFactory {
  /**
   * 기본 테이블 레이어 생성
   * @param {LayerManager} layerManager - 레이어 매니저
   * @param {Object} data - 파싱된 데이터 { rowLabelColumn, columnHeaders, rows, totals, showTotal, showMergedHeader }
   * @param {Object} config - 테이블 설정
   * @param {string} tableId - 테이블 고유 ID
   */
  static createTableLayers(layerManager, data, config = null, tableId = 'table-1') {
    const { rowLabelColumn, columnHeaders, rows, totals, showTotal = true, showMergedHeader = true, mergedHeaderText = null } = data;

    // 커스텀 병합 헤더 텍스트 (없으면 기본값 '상대도수')
    const headerText = mergedHeaderText || BASIC_TABLE_CONFIG.MERGED_HEADER_TEXT;

    // 열 개수: 행 라벨 열 + 데이터 열들
    const columnCount = columnHeaders.length + 1;
    // 행 개수: 데이터 행 + 합계 행 (옵션)
    const rowCount = rows.length + (showTotal ? 1 : 0);

    const padding = CONFIG.TABLE_PADDING;
    const canvasWidth = config?.canvasWidth || CONFIG.TABLE_CANVAS_WIDTH;

    // 각 행의 높이 계산 (분수 포함 여부에 따라)
    const rowHeights = this._calculateRowHeights(rows, totals, showTotal);
    const totalRowHeight = rowHeights.reduce((sum, h) => sum + h, 0);

    // Canvas 높이 계산 (병합 헤더 조건부 + 컬럼 헤더 + 데이터 행들)
    const mergedHeaderHeight = showMergedHeader ? BASIC_TABLE_CONFIG.MERGED_HEADER_HEIGHT : 0;
    const totalHeaderHeight = mergedHeaderHeight + CONFIG.TABLE_HEADER_HEIGHT;
    const canvasHeight = totalHeaderHeight + totalRowHeight + padding * 2;

    // 열 너비 계산 (config에서 전달받거나 자동 계산)
    const columnWidths = config?.columnWidths || this._calculateColumnWidths(canvasWidth, padding, columnCount);

    // 테이블 타입
    const tableType = CONFIG.TABLE_TYPES.BASIC_TABLE;

    // 루트 레이어 생성
    const rootLayer = new Layer({
      id: `${tableType}-${tableId}-table-root`,
      name: '기본 테이블',
      type: 'group',
      visible: true,
      order: 0,
      data: {
        canvasWidth,
        canvasHeight,
        padding,
        columnCount,
        rowCount,
        tableType: CONFIG.TABLE_TYPES.BASIC_TABLE
      }
    });

    // 격자선 레이어 (이원분류표 전용)
    const gridLayer = this._createGridLayer({
      canvasWidth,
      padding,
      rowCount,
      columnWidths,
      tableId,
      hasSummaryRow: showTotal,
      mergedHeaderHeight,
      showMergedHeader,
      rowHeights
    });
    rootLayer.addChild(gridLayer);

    // 병합 헤더 레이어 (상대도수 또는 커스텀 텍스트) - 조건부 생성
    if (showMergedHeader) {
      const mergedHeaderLayer = this._createMergedHeaderLayer(
        columnWidths,
        padding,
        tableId,
        headerText
      );
      rootLayer.addChild(mergedHeaderLayer);
    }

    // 컬럼 헤더 레이어 (혈액형 | 남학생 | 여학생)
    const columnHeaderLayer = this._createColumnHeaderLayer(
      rowLabelColumn,
      columnHeaders,
      columnWidths,
      padding,
      tableId,
      mergedHeaderHeight
    );
    rootLayer.addChild(columnHeaderLayer);

    // 데이터 행 레이어
    rows.forEach((row, rowIndex) => {
      const rowLayer = this._createDataRowLayer(
        row,
        rowIndex,
        columnWidths,
        padding,
        tableId,
        mergedHeaderHeight,
        rowHeights
      );
      rootLayer.addChild(rowLayer);
    });

    // 합계 행 레이어
    if (showTotal && totals) {
      const summaryLayer = this._createSummaryRowLayer(
        totals,
        rows.length,
        columnWidths,
        padding,
        tableId,
        mergedHeaderHeight,
        rowHeights
      );
      rootLayer.addChild(summaryLayer);
    }

    // LayerManager에 추가
    layerManager.addLayer(rootLayer, 'root');
  }

  /**
   * ParserAdapter의 통일된 출력 형식으로 테이블 레이어 생성
   * @param {LayerManager} layerManager - 레이어 매니저
   * @param {Object} adaptedData - ParserAdapter.adapt() 출력
   * @param {Object} config - 테이블 설정
   * @param {string} tableId - 테이블 고유 ID
   */
  static createFromAdaptedData(layerManager, adaptedData, config = null, tableId = 'table-1') {
    const { rows, rowCount, metadata } = adaptedData;
    const { rowLabelColumn, columnHeaders, showTotal, mergedHeaderText, hasTotalRow, originalTotals } = metadata;

    // adaptedData를 기존 파서 형식으로 변환
    // adaptedData.rows에는 합계 행이 포함되어 있을 수 있음
    const dataRows = hasTotalRow ? rows.slice(0, -1) : rows;

    const legacyData = {
      rowLabelColumn,
      columnHeaders,
      showTotal,
      mergedHeaderText,
      totals: originalTotals,
      rows: dataRows.map(row => ({
        label: row.label,
        values: row.cells.slice(1, -1).map(cell => cell.value)  // 첫 번째(라벨)와 마지막(합계) 제외
      }))
    };

    // showTotal이 false면 values에서 마지막 제외 안함
    if (!showTotal) {
      legacyData.rows = dataRows.map(row => ({
        label: row.label,
        values: row.cells.slice(1).map(cell => cell.value)
      }));
    }

    // 기존 메서드 호출
    this.createTableLayers(layerManager, legacyData, config, tableId);
  }

  /**
   * 행별 높이 계산 (분수 포함 여부에 따라)
   * 테이블에 분수가 하나라도 있으면 모든 행을 동일한 높이로 통일
   * @param {Array} rows - 데이터 행 배열
   * @param {Array} totals - 합계 배열
   * @param {boolean} showTotal - 합계 행 표시 여부
   * @returns {Array<number>} 각 행의 높이 배열
   */
  static _calculateRowHeights(rows, totals, showTotal) {
    // 테이블 전체에서 분수가 있는지 확인
    const hasAnyFraction = rows.some(row => this._rowContainsFraction(row.values)) ||
      (showTotal && totals && this._arrayContainsFraction(totals));

    // 분수가 있으면 모든 행을 분수 높이로 통일
    const rowHeight = hasAnyFraction ? CONFIG.TABLE_ROW_HEIGHT_FRACTION : CONFIG.TABLE_ROW_HEIGHT;

    const heights = [];

    // 데이터 행들
    rows.forEach(() => {
      heights.push(rowHeight);
    });

    // 합계 행
    if (showTotal && totals) {
      heights.push(rowHeight);
    }

    return heights;
  }

  /**
   * 행에 분수가 포함되어 있는지 확인
   */
  static _rowContainsFraction(values) {
    return this._arrayContainsFraction(values);
  }

  /**
   * 배열에 분수가 포함되어 있는지 확인
   */
  static _arrayContainsFraction(arr) {
    if (!arr) return false;
    return arr.some(val => {
      if (typeof val === 'string') {
        return /\\frac\{[^}]*\}\{[^}]*\}/.test(val);
      }
      return false;
    });
  }

  /**
   * 열 너비 계산
   */
  static _calculateColumnWidths(canvasWidth, padding, columnCount) {
    const totalWidth = canvasWidth - padding * 2;
    // 첫 번째 열(행 라벨)은 20%, 나머지는 균등 분배
    const labelColumnWidth = totalWidth * 0.2;
    const dataColumnWidth = (totalWidth * 0.8) / (columnCount - 1);

    return [labelColumnWidth, ...Array(columnCount - 1).fill(dataColumnWidth)];
  }

  /**
   * 격자선 레이어 생성 (기본 테이블 전용)
   */
  static _createGridLayer(options) {
    const {
      canvasWidth,
      padding,
      rowCount,
      columnWidths,
      tableId,
      hasSummaryRow,
      mergedHeaderHeight,
      showMergedHeader = true,
      rowHeights = []
    } = options;

    const totalWidth = canvasWidth - padding * 2;
    const totalHeaderHeight = mergedHeaderHeight + CONFIG.TABLE_HEADER_HEIGHT;
    const totalRowHeight = rowHeights.length > 0
      ? rowHeights.reduce((sum, h) => sum + h, 0)
      : rowCount * CONFIG.TABLE_ROW_HEIGHT;
    const totalHeight = totalHeaderHeight + totalRowHeight;

    return new Layer({
      id: `basic-table-${tableId}-table-grid`,
      name: '격자선',
      type: 'basic-table-grid',  // 기본 테이블 전용 타입
      visible: true,
      order: 0,
      data: {
        x: padding,
        y: padding,
        width: totalWidth,
        height: totalHeight,
        rowCount,
        columnWidths,
        hasSummaryRow,
        mergedHeaderHeight,
        columnHeaderHeight: CONFIG.TABLE_HEADER_HEIGHT,
        mergedHeaderLineColor: BASIC_TABLE_CONFIG.MERGED_HEADER_LINE_COLOR,
        mergedHeaderLineWidth: BASIC_TABLE_CONFIG.MERGED_HEADER_LINE_WIDTH,
        showMergedHeader,
        rowHeights
      }
    });
  }

  /**
   * 병합 헤더 레이어 생성 (상대도수 또는 커스텀 텍스트)
   * @param {Array} columnWidths - 열 너비 배열
   * @param {number} padding - 패딩
   * @param {string} tableId - 테이블 ID
   * @param {string} headerText - 병합 헤더 텍스트
   */
  static _createMergedHeaderLayer(columnWidths, padding, tableId, headerText = BASIC_TABLE_CONFIG.MERGED_HEADER_TEXT) {
    const mergedHeaderGroup = new Layer({
      id: `basic-table-${tableId}-table-merged-header`,
      name: '병합 헤더',
      type: 'group',
      visible: true,
      order: 1,
      data: {}
    });

    const y = padding;

    // 첫 번째 열은 빈 칸
    const emptyCell = new Layer({
      id: `basic-table-${tableId}-table-merged-header-empty`,
      name: '(빈 셀)',
      type: 'cell',
      visible: true,
      order: 0,
      data: {
        rowType: 'merged-header',
        rowIndex: -2,
        colIndex: 0,
        cellText: '',
        x: padding,
        y,
        width: columnWidths[0],
        height: BASIC_TABLE_CONFIG.MERGED_HEADER_HEIGHT,
        alignment: 'center',
        highlighted: false,
        highlightProgress: 0
      }
    });
    mergedHeaderGroup.addChild(emptyCell);

    // 나머지 열은 커스텀 텍스트 병합
    const mergedWidth = columnWidths.slice(1).reduce((a, b) => a + b, 0);
    const mergedCell = new Layer({
      id: `basic-table-${tableId}-table-merged-header-title`,
      name: headerText,
      type: 'cell',
      visible: true,
      order: 1,
      data: {
        rowType: 'merged-header',
        rowIndex: -2,
        colIndex: 1,
        cellText: headerText,
        x: padding + columnWidths[0],
        y,
        width: mergedWidth,
        height: BASIC_TABLE_CONFIG.MERGED_HEADER_HEIGHT,
        alignment: 'center',
        highlighted: false,
        highlightProgress: 0,
        isMergedCell: true,
        headerTextColor: '#8DCF66'
      }
    });
    mergedHeaderGroup.addChild(mergedCell);

    return mergedHeaderGroup;
  }

  /**
   * 컬럼 헤더 레이어 생성 (혈액형 | 남학생 | 여학생)
   */
  static _createColumnHeaderLayer(rowLabelColumn, columnHeaders, columnWidths, padding, tableId, mergedHeaderHeight = BASIC_TABLE_CONFIG.MERGED_HEADER_HEIGHT) {
    const headerGroup = new Layer({
      id: `basic-table-${tableId}-table-header`,
      name: '컬럼 헤더',
      type: 'group',
      visible: true,
      order: 2,
      data: {}
    });

    let x = padding;
    const y = padding + mergedHeaderHeight;

    // 첫 번째 열은 행 라벨 컬럼명 (예: 혈액형)
    const allHeaders = [rowLabelColumn, ...columnHeaders];

    allHeaders.forEach((header, i) => {
      const cellLayer = new Layer({
        id: `basic-table-${tableId}-table-header-col${i}`,
        name: header,
        type: 'cell',
        visible: true,
        order: i,
        data: {
          rowType: 'header',
          rowIndex: -1,
          colIndex: i,
          colLabel: header,
          cellText: header,
          x,
          y,
          width: columnWidths[i],
          height: CONFIG.TABLE_HEADER_HEIGHT,
          alignment: 'center',
          highlighted: false,
          highlightProgress: 0,
          headerTextColor: '#8DCF66'
        }
      });

      headerGroup.addChild(cellLayer);
      x += columnWidths[i];
    });

    return headerGroup;
  }

  /**
   * 데이터 행 레이어 생성
   */
  static _createDataRowLayer(row, rowIndex, columnWidths, padding, tableId, mergedHeaderHeight = BASIC_TABLE_CONFIG.MERGED_HEADER_HEIGHT, rowHeights = []) {
    const rowGroup = new Layer({
      id: `basic-table-${tableId}-table-row-${rowIndex}`,
      name: `데이터 행 ${rowIndex}`,
      type: 'group',
      visible: true,
      order: rowIndex + 3,  // 0: grid, 1: merged-header, 2: column-header, 3+: data rows
      data: { rowIndex }
    });

    // Y 좌표 계산 (병합 헤더 + 컬럼 헤더 이후)
    const totalHeaderHeight = mergedHeaderHeight + CONFIG.TABLE_HEADER_HEIGHT;
    // rowHeights가 있으면 이전 행들의 높이 합산, 없으면 기존 방식
    const y = padding + totalHeaderHeight + (rowHeights.length > 0
      ? rowHeights.slice(0, rowIndex).reduce((sum, h) => sum + h, 0)
      : rowIndex * CONFIG.TABLE_ROW_HEIGHT);
    const currentRowHeight = rowHeights[rowIndex] || CONFIG.TABLE_ROW_HEIGHT;
    let x = padding;

    // 첫 번째 열은 행 라벨 (혈액형 값: A, B, AB, O)
    const cells = [row.label, ...row.values];

    cells.forEach((cellText, colIndex) => {
      const isLabelColumn = colIndex === 0;

      // 값 포맷팅 (소수점인 경우, null은 그대로 유지)
      let displayText = cellText;
      if (typeof cellText === 'number' && !isLabelColumn) {
        displayText = cellText.toFixed(2).replace(/\.?0+$/, '');
      }

      // null은 그대로 유지 (빈칸 처리용)
      const cellTextValue = displayText === null ? null : String(displayText);

      const cellLayer = new Layer({
        id: `basic-table-${tableId}-table-row-${rowIndex}-col${colIndex}`,
        name: cellTextValue ?? '',
        type: 'cell',
        visible: true,
        order: colIndex,
        data: {
          rowType: isLabelColumn ? 'row-header' : 'data',
          rowIndex,
          colIndex,
          colLabel: '',
          cellText: cellTextValue,
          x,
          y,
          width: columnWidths[colIndex],
          height: currentRowHeight,
          alignment: 'center',
          highlighted: false,
          highlightProgress: 0,
          isEvenRow: rowIndex % 2 === 1,
          isLabelColumn,
          textColor: isLabelColumn ? '#FFFFFF' : null
        }
      });

      rowGroup.addChild(cellLayer);
      x += columnWidths[colIndex];
    });

    return rowGroup;
  }

  /**
   * 합계 행 레이어 생성
   */
  static _createSummaryRowLayer(totals, dataRowCount, columnWidths, padding, tableId, mergedHeaderHeight = BASIC_TABLE_CONFIG.MERGED_HEADER_HEIGHT, rowHeights = []) {
    const summaryGroup = new Layer({
      id: `basic-table-${tableId}-table-summary`,
      name: '합계 행',
      type: 'group',
      visible: true,
      order: dataRowCount + 3,
      data: {}
    });

    // Y 좌표 계산 (병합 헤더 + 컬럼 헤더 + 데이터 행들 이후)
    const totalHeaderHeight = mergedHeaderHeight + CONFIG.TABLE_HEADER_HEIGHT;
    // rowHeights가 있으면 데이터 행들의 높이 합산
    const dataRowsHeight = rowHeights.length > 0
      ? rowHeights.slice(0, dataRowCount).reduce((sum, h) => sum + h, 0)
      : dataRowCount * CONFIG.TABLE_ROW_HEIGHT;
    const y = padding + totalHeaderHeight + dataRowsHeight;
    const summaryRowHeight = rowHeights[dataRowCount] || CONFIG.TABLE_ROW_HEIGHT;
    let x = padding;

    // 첫 번째 열은 "합계"
    const cells = ['합계', ...totals];

    cells.forEach((cellText, colIndex) => {
      let displayText = cellText;
      if (cellText === null) {
        displayText = null;  // null은 그대로 유지 (빈칸 처리용)
      } else if (typeof cellText === 'number') {
        // 1인 경우 그대로 1로 표시, 그 외는 소수점 처리
        displayText = cellText === 1 ? '1' : cellText.toFixed(2).replace(/\.?0+$/, '');
      }

      const cellLayer = new Layer({
        id: `basic-table-${tableId}-table-summary-col${colIndex}`,
        name: displayText === null ? '' : String(displayText),
        type: 'cell',
        visible: true,
        order: colIndex,
        data: {
          rowType: 'summary',
          rowIndex: dataRowCount,
          colIndex,
          colLabel: '',
          cellText: displayText === null ? null : String(displayText),
          x,
          y,
          width: columnWidths[colIndex],
          height: summaryRowHeight,
          alignment: 'center',
          highlighted: false,
          highlightProgress: 0
        }
      });

      summaryGroup.addChild(cellLayer);
      x += columnWidths[colIndex];
    });

    return summaryGroup;
  }
}

/**
 * 줄기-잎 그림 테이블 팩토리
 * 단일 모드: 줄기 | 잎 (2열)
 * 비교 모드: 잎 | 줄기 | 잎 (3열)
 */


class StemLeafFactory {
  /**
   * 줄기-잎 그림 레이어 생성
   * @param {LayerManager} layerManager - 레이어 매니저
   * @param {Object} data - 파싱된 데이터 { isSingleMode, stems, ... }
   * @param {Object} config - 테이블 설정
   * @param {string} tableId - 테이블 고유 ID
   */
  static createTableLayers(layerManager, data, config = null, tableId = 'table-1') {
    // 단일/비교 모드 분기
    if (data.isSingleMode) {
      this._createSingleModeTableLayers(layerManager, data, config, tableId);
    } else {
      this._createCompareModeTableLayers(layerManager, data, config, tableId);
    }
  }

  /**
   * 동적 너비 계산 (외부 호출용)
   * @param {Object} data - 파싱된 데이터 { isSingleMode, stems, leftLabel, rightLabel }
   * @returns {Object} { canvasWidth, columnWidths }
   */
  static calculateDynamicWidths(data) {
    if (data.isSingleMode) {
      return this._calculateSingleModeDynamicWidths(data.stems);
    } else {
      return this._calculateCompareModeDynamicWidths(data.stems, data.leftLabel, data.rightLabel);
    }
  }

  /**
   * ParserAdapter의 통일된 출력 형식으로 테이블 레이어 생성
   * @param {LayerManager} layerManager - 레이어 매니저
   * @param {Object} adaptedData - ParserAdapter.adapt() 출력
   * @param {Object} config - 테이블 설정
   * @param {string} tableId - 테이블 고유 ID
   */
  static createFromAdaptedData(layerManager, adaptedData, config = null, tableId = 'table-1') {
    const { rows, rowCount, columnCount, metadata } = adaptedData;
    const { isSingleMode, leftLabel, rightLabel, minStem, maxStem, maxLeafCount, maxLeftLeafCount, maxRightLeafCount } = metadata;

    // adaptedData를 기존 파서 형식으로 변환
    const stems = rows.map(row => {
      if (isSingleMode) {
        return {
          stem: row.cells[0].value,
          leaves: row.cells[1].metadata.leaves
        };
      } else {
        return {
          leftLeaves: row.cells[0].metadata.leaves,
          stem: row.cells[1].value,
          rightLeaves: row.cells[2].metadata.leaves
        };
      }
    });

    // 기존 형식으로 변환된 데이터
    const legacyData = {
      isSingleMode,
      stems,
      minStem,
      maxStem,
      leftLabel,
      rightLabel
    };

    // 기존 메서드 호출
    this.createTableLayers(layerManager, legacyData, config, tableId);
  }

  /**
   * 텍스트 측정용 임시 캔버스 컨텍스트 생성
   * @returns {CanvasRenderingContext2D}
   */
  static _createMeasureContext() {
    const tempCanvas = document.createElement('canvas');
    return tempCanvas.getContext('2d');
  }

  // =============================================
  // 단일 모드 (줄기 | 잎) - 2열
  // =============================================

  /**
   * 단일 모드 동적 너비 계산
   * @param {Array} stems - 줄기 데이터 배열
   * @returns {Object} { canvasWidth, columnWidths }
   */
  static _calculateSingleModeDynamicWidths(stems) {
    const ctx = this._createMeasureContext();
    const padding = CONFIG.TABLE_PADDING;
    const cellPadding = 32;
    const headerExtraPadding = 16;

    // 줄기 컬럼 너비 계산
    ctx.font = CONFIG.TABLE_FONT_HEADER;
    const stemHeaderWidth = ctx.measureText('줄기').width + cellPadding + headerExtraPadding;

    ctx.font = '24px KaTeX_Main, Times New Roman, serif';
    let maxStemDataWidth = 0;
    stems.forEach(s => {
      const width = ctx.measureText(String(s.stem)).width + cellPadding;
      maxStemDataWidth = Math.max(maxStemDataWidth, width);
    });
    const stemColWidth = Math.max(stemHeaderWidth, maxStemDataWidth);

    // 잎 컬럼 너비 계산
    ctx.font = CONFIG.TABLE_FONT_HEADER;
    const leafHeaderWidth = ctx.measureText('잎').width + cellPadding + headerExtraPadding;

    ctx.font = '24px KaTeX_Main, Times New Roman, serif';
    let maxLeafDataWidth = 0;
    stems.forEach(s => {
      // 잎 데이터는 공백으로 구분 (6칸 간격)
      const leafStr = s.leaves.join('      ');
      const width = ctx.measureText(leafStr).width + cellPadding;
      maxLeafDataWidth = Math.max(maxLeafDataWidth, width);
    });
    const leafColWidth = Math.max(leafHeaderWidth, maxLeafDataWidth);

    // 총 너비 계산 (제한 없음)
    const contentWidth = stemColWidth + leafColWidth;
    const canvasWidth = contentWidth + padding * 2;

    return {
      canvasWidth,
      columnWidths: [stemColWidth, leafColWidth]
    };
  }

  /**
   * 단일 모드 테이블 레이어 생성
   */
  static _createSingleModeTableLayers(layerManager, data, config, tableId) {
    const { stems } = data;

    const columnCount = 2;  // 줄기 | 잎
    const rowCount = stems.length;

    const padding = CONFIG.TABLE_PADDING;

    // 동적 너비 계산
    const { canvasWidth, columnWidths } = this._calculateSingleModeDynamicWidths(stems);
    const canvasHeight = BaseTableFactory.calculateCanvasHeight(rowCount, padding);

    // 전체 잎 중 최대 개수 계산 (폰트 크기 일관성용)
    const maxLeafCount = Math.max(...stems.map(s => s.leaves.length));

    // 루트 레이어 생성
    const rootLayer = BaseTableFactory.createRootLayer({
      tableId,
      tableName: '줄기-잎 그림',
      canvasWidth,
      canvasHeight,
      padding,
      columnCount,
      rowCount,
      tableType: CONFIG.TABLE_TYPES.STEM_LEAF
    });

    // 격자선 레이어
    const gridLayer = this._createSingleModeGridLayer(canvasWidth, padding, rowCount, columnWidths, tableId);
    rootLayer.addChild(gridLayer);

    // 헤더 레이어
    const headerLayer = this._createSingleModeHeaderLayer(columnWidths, padding, tableId);
    rootLayer.addChild(headerLayer);

    // 데이터 행 레이어
    stems.forEach((stemData, rowIndex) => {
      const rowLayer = this._createSingleModeRowLayer(stemData, rowIndex, columnWidths, padding, tableId, maxLeafCount);
      rootLayer.addChild(rowLayer);
    });

    // LayerManager에 추가
    layerManager.addLayer(rootLayer, 'root');
  }

  /**
   * 단일 모드 격자선 레이어 생성
   */
  static _createSingleModeGridLayer(canvasWidth, padding, rowCount, columnWidths, tableId) {
    const totalWidth = canvasWidth - padding * 2;
    const totalHeight = CONFIG.TABLE_HEADER_HEIGHT + (rowCount * CONFIG.TABLE_ROW_HEIGHT);

    return new Layer({
      id: `stem-leaf-${tableId}-table-grid`,
      name: '격자선',
      type: 'stem-leaf-single-grid',  // 단일 모드 전용 타입
      visible: true,
      order: 0,
      data: {
        x: padding,
        y: padding,
        width: totalWidth,
        height: totalHeight,
        rowCount,
        columnWidths,
        isSingleMode: true,
        // 줄기 열 오른쪽 세로선 위치
        stemColumnEnd: padding + columnWidths[0]
      }
    });
  }

  /**
   * 단일 모드 헤더 레이어 생성
   */
  static _createSingleModeHeaderLayer(columnWidths, padding, tableId) {
    const headerGroup = new Layer({
      id: `stem-leaf-${tableId}-table-header`,
      name: '헤더 행',
      type: 'group',
      visible: true,
      order: 1,
      data: {}
    });

    const y = padding;
    const headers = [
      { text: '줄기', align: 'center' },
      { text: '잎', align: 'center' }
    ];

    let x = padding;
    headers.forEach((header, i) => {
      const cellLayer = new Layer({
        id: `stem-leaf-${tableId}-table-header-col${i}`,
        name: header.text,
        type: 'cell',
        visible: true,
        order: i,
        data: {
          rowType: 'header',
          rowIndex: -1,
          colIndex: i,
          colLabel: header.text,
          cellText: header.text,
          x,
          y,
          width: columnWidths[i],
          height: CONFIG.TABLE_HEADER_HEIGHT,
          alignment: header.align,
          highlighted: false,
          highlightProgress: 0
        }
      });

      headerGroup.addChild(cellLayer);
      x += columnWidths[i];
    });

    return headerGroup;
  }

  /**
   * 단일 모드 데이터 행 레이어 생성
   * @param {number} maxLeafCount - 전체 최대 잎 개수 (폰트 크기 일관성용)
   */
  static _createSingleModeRowLayer(stemData, rowIndex, columnWidths, padding, tableId, maxLeafCount) {
    const rowGroup = new Layer({
      id: `stem-leaf-${tableId}-table-row-${rowIndex}`,
      name: `줄기 ${stemData.stem}`,
      type: 'group',
      visible: true,
      order: rowIndex + 2,
      data: { rowIndex, stem: stemData.stem }
    });

    const y = padding + CONFIG.TABLE_HEADER_HEIGHT + (rowIndex * CONFIG.TABLE_ROW_HEIGHT);
    let x = padding;

    // 줄기 (가운데 정렬)
    const stemCell = new Layer({
      id: `stem-leaf-${tableId}-table-row-${rowIndex}-col0`,
      name: `줄기: ${stemData.stem}`,
      type: 'cell',
      visible: true,
      order: 0,
      data: {
        rowType: 'stem-leaf-stem',
        rowIndex,
        colIndex: 0,
        colLabel: 'stem',
        cellText: String(stemData.stem),
        x,
        y,
        width: columnWidths[0],
        height: CONFIG.TABLE_ROW_HEIGHT,
        alignment: 'center',
        highlighted: false,
        highlightProgress: 0,
        isEvenRow: rowIndex % 2 === 1,
        stem: stemData.stem
      }
    });
    rowGroup.addChild(stemCell);
    x += columnWidths[0];

    // 잎 (왼쪽 정렬, 오름차순)
    const leavesText = stemData.leaves.join('      ');
    // 비숫자 값이 포함되어 있으면 isVariable = true (_, x, A 등)
    const hasVariable = stemData.leaves.some(leaf =>
      typeof leaf === 'string' && !/^\d+$/.test(String(leaf).trim())
    );
    const leavesCell = new Layer({
      id: `stem-leaf-${tableId}-table-row-${rowIndex}-col1`,
      name: `잎: ${leavesText}`,
      type: 'cell',
      visible: true,
      order: 1,
      data: {
        rowType: 'stem-leaf-data',
        rowIndex,
        colIndex: 1,
        colLabel: 'leaves',
        cellText: leavesText,
        x,
        y,
        width: columnWidths[1],
        height: CONFIG.TABLE_ROW_HEIGHT,
        alignment: 'left',
        highlighted: false,
        highlightProgress: 0,
        isEvenRow: rowIndex % 2 === 1,
        leaves: stemData.leaves,
        maxLeafCount,
        isSingleMode: true,
        isVariable: hasVariable
      }
    });
    rowGroup.addChild(leavesCell);

    return rowGroup;
  }

  // =============================================
  // 비교 모드 (잎 | 줄기 | 잎) - 3열
  // =============================================

  /**
   * 비교 모드 동적 너비 계산
   * @param {Array} stems - 줄기 데이터 배열 (leftLeaves, stem, rightLeaves)
   * @param {string} leftLabel - 왼쪽 라벨
   * @param {string} rightLabel - 오른쪽 라벨
   * @returns {Object} { canvasWidth, columnWidths }
   */
  static _calculateCompareModeDynamicWidths(stems, leftLabel, rightLabel) {
    const ctx = this._createMeasureContext();
    const padding = CONFIG.TABLE_PADDING;
    const cellPadding = 32;
    const headerExtraPadding = 16;

    // 왼쪽 잎 컬럼 너비 계산
    ctx.font = CONFIG.TABLE_FONT_HEADER;
    const leftHeaderWidth = ctx.measureText(`잎(${leftLabel})`).width + cellPadding + headerExtraPadding;

    ctx.font = '24px KaTeX_Main, Times New Roman, serif';
    let maxLeftLeafWidth = 0;
    stems.forEach(s => {
      const leafStr = s.leftLeaves.join('      ');
      const width = ctx.measureText(leafStr).width + cellPadding;
      maxLeftLeafWidth = Math.max(maxLeftLeafWidth, width);
    });
    const leftColWidth = Math.max(leftHeaderWidth, maxLeftLeafWidth);

    // 줄기 컬럼 너비 계산
    ctx.font = CONFIG.TABLE_FONT_HEADER;
    const stemHeaderWidth = ctx.measureText('줄기').width + cellPadding + headerExtraPadding;

    ctx.font = '24px KaTeX_Main, Times New Roman, serif';
    let maxStemDataWidth = 0;
    stems.forEach(s => {
      const width = ctx.measureText(String(s.stem)).width + cellPadding;
      maxStemDataWidth = Math.max(maxStemDataWidth, width);
    });
    const stemColWidth = Math.max(stemHeaderWidth, maxStemDataWidth);

    // 오른쪽 잎 컬럼 너비 계산
    ctx.font = CONFIG.TABLE_FONT_HEADER;
    const rightHeaderWidth = ctx.measureText(`잎(${rightLabel})`).width + cellPadding + headerExtraPadding;

    ctx.font = '24px KaTeX_Main, Times New Roman, serif';
    let maxRightLeafWidth = 0;
    stems.forEach(s => {
      const leafStr = s.rightLeaves.join('      ');
      const width = ctx.measureText(leafStr).width + cellPadding;
      maxRightLeafWidth = Math.max(maxRightLeafWidth, width);
    });
    const rightColWidth = Math.max(rightHeaderWidth, maxRightLeafWidth);

    // 왼쪽/오른쪽 잎 컬럼 너비를 동일하게 맞춤 (대칭)
    const leafColWidth = Math.max(leftColWidth, rightColWidth);

    // 총 너비 계산 (제한 없음)
    const contentWidth = leafColWidth + stemColWidth + leafColWidth;
    const canvasWidth = contentWidth + padding * 2;

    return {
      canvasWidth,
      columnWidths: [leafColWidth, stemColWidth, leafColWidth]
    };
  }

  /**
   * 비교 모드 테이블 레이어 생성
   */
  static _createCompareModeTableLayers(layerManager, data, config, tableId) {
    const { leftLabel, rightLabel, stems } = data;

    // 열: 왼쪽 잎 | 줄기 | 오른쪽 잎
    const columnCount = 3;
    // 행: 헤더 + 줄기 개수
    const rowCount = stems.length;

    const padding = CONFIG.TABLE_PADDING;

    // 동적 너비 계산
    const { canvasWidth, columnWidths } = this._calculateCompareModeDynamicWidths(stems, leftLabel, rightLabel);
    const canvasHeight = BaseTableFactory.calculateCanvasHeight(rowCount, padding);

    // 전체 잎 중 최대 개수 계산 (왼쪽/오른쪽 모두 고려, 폰트 크기 일관성용)
    const maxLeafCount = Math.max(
      ...stems.map(s => s.leftLeaves.length),
      ...stems.map(s => s.rightLeaves.length)
    );

    // 루트 레이어 생성
    const rootLayer = BaseTableFactory.createRootLayer({
      tableId,
      tableName: '줄기-잎 그림',
      canvasWidth,
      canvasHeight,
      padding,
      columnCount,
      rowCount,
      tableType: CONFIG.TABLE_TYPES.STEM_LEAF
    });

    // 격자선 레이어 (줄기-잎은 특수 격자)
    const gridLayer = this._createCompareModeGridLayer(canvasWidth, padding, rowCount, columnWidths, tableId);
    rootLayer.addChild(gridLayer);

    // 헤더 레이어
    const headerLayer = this._createCompareModeHeaderLayer(leftLabel, rightLabel, columnWidths, padding, tableId);
    rootLayer.addChild(headerLayer);

    // 줄기-잎 데이터 행 레이어
    stems.forEach((stemData, rowIndex) => {
      const rowLayer = this._createCompareModeRowLayer(
        stemData,
        rowIndex,
        columnWidths,
        padding,
        tableId,
        maxLeafCount
      );
      rootLayer.addChild(rowLayer);
    });

    // LayerManager에 추가
    layerManager.addLayer(rootLayer, 'root');
  }

  /**
   * 비교 모드 격자선 레이어 생성 (줄기 열 좌우에 세로선)
   */
  static _createCompareModeGridLayer(canvasWidth, padding, rowCount, columnWidths, tableId) {
    const totalWidth = canvasWidth - padding * 2;
    const totalHeight = CONFIG.TABLE_HEADER_HEIGHT + (rowCount * CONFIG.TABLE_ROW_HEIGHT);

    return new Layer({
      id: `stem-leaf-${tableId}-table-grid`,
      name: '격자선',
      type: 'stem-leaf-grid', // 특수 타입
      visible: true,
      order: 0,
      data: {
        x: padding,
        y: padding,
        width: totalWidth,
        height: totalHeight,
        rowCount,
        columnWidths,
        // 줄기 열 좌우 세로선 위치
        stemColumnStart: padding + columnWidths[0],
        stemColumnEnd: padding + columnWidths[0] + columnWidths[1]
      }
    });
  }

  /**
   * 비교 모드 헤더 레이어 생성
   */
  static _createCompareModeHeaderLayer(leftLabel, rightLabel, columnWidths, padding, tableId) {
    const headerGroup = new Layer({
      id: `stem-leaf-${tableId}-table-header`,
      name: '헤더 행',
      type: 'group',
      visible: true,
      order: 1,
      data: {}
    });

    const y = padding;
    const headers = [
      { text: `잎(${leftLabel})`, align: 'center' },
      { text: '줄기', align: 'center' },
      { text: `잎(${rightLabel})`, align: 'center' }
    ];

    let x = padding;
    headers.forEach((header, i) => {
      const cellLayer = new Layer({
        id: `stem-leaf-${tableId}-table-header-col${i}`,
        name: header.text,
        type: 'cell',
        visible: true,
        order: i,
        data: {
          rowType: 'header',
          rowIndex: -1,
          colIndex: i,
          colLabel: header.text,
          cellText: header.text,
          x,
          y,
          width: columnWidths[i],
          height: CONFIG.TABLE_HEADER_HEIGHT,
          alignment: header.align,
          highlighted: false,
          highlightProgress: 0
        }
      });

      headerGroup.addChild(cellLayer);
      x += columnWidths[i];
    });

    return headerGroup;
  }

  /**
   * 비교 모드 데이터 행 레이어 생성
   * @param {number} maxLeafCount - 전체 최대 잎 개수 (폰트 크기 일관성용)
   */
  static _createCompareModeRowLayer(stemData, rowIndex, columnWidths, padding, tableId, maxLeafCount) {
    const rowGroup = new Layer({
      id: `stem-leaf-${tableId}-table-row-${rowIndex}`,
      name: `줄기 ${stemData.stem}`,
      type: 'group',
      visible: true,
      order: rowIndex + 2,
      data: { rowIndex, stem: stemData.stem }
    });

    const y = padding + CONFIG.TABLE_HEADER_HEIGHT + (rowIndex * CONFIG.TABLE_ROW_HEIGHT);
    let x = padding;

    // 왼쪽 잎 (오른쪽 정렬, 내림차순)
    const leftLeavesText = stemData.leftLeaves.join('      ');
    // 비숫자 값이 포함되어 있으면 isVariable = true
    const leftHasVariable = stemData.leftLeaves.some(leaf =>
      typeof leaf === 'string' && !/^\d+$/.test(String(leaf).trim())
    );
    const leftCell = new Layer({
      id: `stem-leaf-${tableId}-table-row-${rowIndex}-col0`,
      name: `왼쪽 잎: ${leftLeavesText}`,
      type: 'cell',
      visible: true,
      order: 0,
      data: {
        rowType: 'stem-leaf-data',
        rowIndex,
        colIndex: 0,
        colLabel: 'left-leaves',
        cellText: leftLeavesText,
        x,
        y,
        width: columnWidths[0],
        height: CONFIG.TABLE_ROW_HEIGHT,
        alignment: 'right',
        highlighted: false,
        highlightProgress: 0,
        isEvenRow: rowIndex % 2 === 1,
        leaves: stemData.leftLeaves,
        maxLeafCount,
        isSingleMode: false,
        isVariable: leftHasVariable
      }
    });
    rowGroup.addChild(leftCell);
    x += columnWidths[0];

    // 줄기 (가운데 정렬)
    const stemCell = new Layer({
      id: `stem-leaf-${tableId}-table-row-${rowIndex}-col1`,
      name: `줄기: ${stemData.stem}`,
      type: 'cell',
      visible: true,
      order: 1,
      data: {
        rowType: 'stem-leaf-stem',
        rowIndex,
        colIndex: 1,
        colLabel: 'stem',
        cellText: String(stemData.stem),
        x,
        y,
        width: columnWidths[1],
        height: CONFIG.TABLE_ROW_HEIGHT,
        alignment: 'center',
        highlighted: false,
        highlightProgress: 0,
        isEvenRow: rowIndex % 2 === 1,
        stem: stemData.stem
      }
    });
    rowGroup.addChild(stemCell);
    x += columnWidths[1];

    // 오른쪽 잎 (왼쪽 정렬, 오름차순)
    const rightLeavesText = stemData.rightLeaves.join('      ');
    // 비숫자 값이 포함되어 있으면 isVariable = true
    const rightHasVariable = stemData.rightLeaves.some(leaf =>
      typeof leaf === 'string' && !/^\d+$/.test(String(leaf).trim())
    );
    const rightCell = new Layer({
      id: `stem-leaf-${tableId}-table-row-${rowIndex}-col2`,
      name: `오른쪽 잎: ${rightLeavesText}`,
      type: 'cell',
      visible: true,
      order: 2,
      data: {
        rowType: 'stem-leaf-data',
        rowIndex,
        colIndex: 2,
        colLabel: 'right-leaves',
        cellText: rightLeavesText,
        x,
        y,
        width: columnWidths[2],
        height: CONFIG.TABLE_ROW_HEIGHT,
        alignment: 'left',
        highlighted: false,
        highlightProgress: 0,
        isEvenRow: rowIndex % 2 === 1,
        leaves: stemData.rightLeaves,
        maxLeafCount,
        isSingleMode: false,
        isVariable: rightHasVariable
      }
    });
    rowGroup.addChild(rightCell);

    return rowGroup;
  }
}

/**
 * 테이블 팩토리 모듈 통합 export
 */


/**
 * 테이블 팩토리 라우터
 * 테이블 타입에 따라 적절한 팩토리 반환
 */
class TableFactoryRouter {
  /**
   * 타입에 맞는 팩토리로 테이블 레이어 생성
   * @param {string} type - 테이블 타입
   * @param {LayerManager} layerManager - 레이어 매니저
   * @param {any} data - 파싱된 데이터
   * @param {Object} config - 테이블 설정
   * @param {string} tableId - 테이블 고유 ID
   */
  static createTableLayers(type, layerManager, data, config = null, tableId = 'table-1') {
    switch (type) {
      case CONFIG.TABLE_TYPES.CATEGORY_MATRIX:
        return CategoryMatrixFactory.createTableLayers(layerManager, data, config, tableId);

      case CONFIG.TABLE_TYPES.BASIC_TABLE:
        return BasicTableFactory.createTableLayers(layerManager, data, config, tableId);

      case CONFIG.TABLE_TYPES.STEM_LEAF:
        return StemLeafFactory.createTableLayers(layerManager, data, config, tableId);

      case CONFIG.TABLE_TYPES.FREQUENCY:
      default:
        // 도수분포표는 기존 TableLayerFactory 사용 (별도 처리)
        return null;
    }
  }

  /**
   * ParserAdapter의 통일된 출력 형식(ParsedTableData)으로 테이블 레이어 생성
   * @param {LayerManager} layerManager - 레이어 매니저
   * @param {Object} adaptedData - ParserAdapter.adapt() 출력
   * @param {Object} config - 테이블 설정
   * @param {string} tableId - 테이블 고유 ID
   */
  static createFromAdaptedData(layerManager, adaptedData, config = null, tableId = 'table-1') {
    const { type, metadata } = adaptedData;

    // config에 adaptedData 정보 병합
    const mergedConfig = {
      ...config,
      adaptedData  // 팩토리에서 rowCount, columnCount 등 활용 가능
    };

    switch (type) {
      case CONFIG.TABLE_TYPES.STEM_LEAF:
        return StemLeafFactory.createFromAdaptedData(layerManager, adaptedData, mergedConfig, tableId);

      case CONFIG.TABLE_TYPES.CATEGORY_MATRIX:
        return CategoryMatrixFactory.createFromAdaptedData(layerManager, adaptedData, mergedConfig, tableId);

      case CONFIG.TABLE_TYPES.BASIC_TABLE:
        return BasicTableFactory.createFromAdaptedData(layerManager, adaptedData, mergedConfig, tableId);

      case CONFIG.TABLE_TYPES.FREQUENCY:
      default:
        // 도수분포표는 별도 처리 (기존 TableLayerFactory 사용)
        return null;
    }
  }

  /**
   * 타입에 맞는 팩토리 클래스 반환
   * @param {string} type - 테이블 타입
   * @returns {Class|null}
   */
  static getFactory(type) {
    switch (type) {
      case CONFIG.TABLE_TYPES.CATEGORY_MATRIX:
        return CategoryMatrixFactory;
      case CONFIG.TABLE_TYPES.BASIC_TABLE:
        return BasicTableFactory;
      case CONFIG.TABLE_TYPES.STEM_LEAF:
        return StemLeafFactory;
      default:
        return null;
    }
  }

  /**
   * 도수분포표가 아닌 타입인지 확인
   * @param {string} type - 테이블 타입
   * @returns {boolean}
   */
  static isCustomType(type) {
    return type !== CONFIG.TABLE_TYPES.FREQUENCY &&
           Object.values(CONFIG.TABLE_TYPES).includes(type);
  }
}

/**
 * 테이블 저장소
 * 테이블의 셀 변수, 합계 행, 병합 헤더 등 표시 설정을 관리
 */


/**
 * @class TableStore
 * @description 테이블 관련 설정을 저장하는 저장소
 */
class TableStore {
  constructor() {
    this.cellVariables = new Map();          // 셀 변수 치환 정보
    this.summaryRowVisible = new Map();      // 테이블별 합계 행 표시 여부
    this.mergedHeaderVisible = new Map();    // 테이블별 병합 헤더 표시 여부 (basic-table)
  }

  // =============================================
  // 셀 변수 치환 관련 메서드
  // =============================================

  /**
   * 셀 변수 키 생성
   * @param {string} tableId - 테이블 ID
   * @param {number} rowIndex - 행 인덱스
   * @param {number} colIndex - 열 인덱스
   * @returns {string} 고유 키
   */
  _getCellKey(tableId, rowIndex, colIndex) {
    return `${tableId}-${rowIndex}-${colIndex}`;
  }

  /**
   * 셀에 변수 설정
   * @param {string} tableId - 테이블 ID
   * @param {number} rowIndex - 행 인덱스
   * @param {number} colIndex - 열 인덱스
   * @param {string} variableName - 변수명 (예: 'A', 'x')
   */
  setCellVariable(tableId, rowIndex, colIndex, variableName) {
    const key = this._getCellKey(tableId, rowIndex, colIndex);
    this.cellVariables.set(key, variableName);
  }

  /**
   * 셀의 변수 조회
   * @param {string} tableId - 테이블 ID
   * @param {number} rowIndex - 행 인덱스
   * @param {number} colIndex - 열 인덱스
   * @returns {string|null} 변수명 또는 null
   */
  getCellVariable(tableId, rowIndex, colIndex) {
    const key = this._getCellKey(tableId, rowIndex, colIndex);
    return this.cellVariables.get(key) || null;
  }

  /**
   * 셀의 변수 제거
   * @param {string} tableId - 테이블 ID
   * @param {number} rowIndex - 행 인덱스
   * @param {number} colIndex - 열 인덱스
   */
  removeCellVariable(tableId, rowIndex, colIndex) {
    const key = this._getCellKey(tableId, rowIndex, colIndex);
    this.cellVariables.delete(key);
  }

  /**
   * 특정 테이블의 모든 변수 제거
   * @param {string} tableId - 테이블 ID
   */
  clearAllVariables(tableId) {
    const prefix = `${tableId}-`;
    for (const key of this.cellVariables.keys()) {
      if (key.startsWith(prefix)) {
        this.cellVariables.delete(key);
      }
    }
  }

  /**
   * 모든 테이블의 변수 제거
   */
  clearAllTableVariables() {
    this.cellVariables.clear();
  }

  // =============================================
  // 합계 행 표시 관련 메서드
  // =============================================

  /**
   * 합계 행 표시 여부 설정
   * @param {string} tableId - 테이블 ID
   * @param {boolean} visible - 표시 여부
   */
  setSummaryRowVisible(tableId, visible) {
    this.summaryRowVisible.set(tableId, visible);
  }

  /**
   * 합계 행 표시 여부 조회
   * @param {string} tableId - 테이블 ID
   * @returns {boolean} 표시 여부 (기본값: CONFIG.TABLE_SHOW_SUMMARY_ROW)
   */
  getSummaryRowVisible(tableId) {
    if (this.summaryRowVisible.has(tableId)) {
      return this.summaryRowVisible.get(tableId);
    }
    return CONFIG.TABLE_SHOW_SUMMARY_ROW;
  }

  // =============================================
  // 병합 헤더 표시 관련 메서드 (basic-table 전용)
  // =============================================

  /**
   * 병합 헤더 표시 여부 설정 (basic-table)
   * @param {string} tableId - 테이블 ID
   * @param {boolean} visible - 표시 여부
   */
  setMergedHeaderVisible(tableId, visible) {
    this.mergedHeaderVisible.set(tableId, visible);
  }

  /**
   * 병합 헤더 표시 여부 조회 (basic-table)
   * @param {string} tableId - 테이블 ID
   * @returns {boolean} 표시 여부 (기본값: true)
   */
  getMergedHeaderVisible(tableId) {
    if (this.mergedHeaderVisible.has(tableId)) {
      return this.mergedHeaderVisible.get(tableId);
    }
    return true; // 기본값: 표시
  }

  /**
   * 기본값으로 초기화
   */
  reset() {
    this.cellVariables.clear();
    this.summaryRowVisible.clear();
    this.mergedHeaderVisible.clear();
  }
}

// Singleton 패턴으로 내보내기
var tableStore = new TableStore();

/**
 * 테이블 셀 편집 모달 관리
 * 셀 변수 편집, 합계 행/병합 헤더 토글 등
 */


/**
 * @class TableEditModal
 * @description 테이블 셀 편집 모달 관리 클래스
 */
class TableEditModal {
  /**
   * @param {TableRenderer} tableRenderer - 부모 테이블 렌더러 인스턴스
   */
  constructor(tableRenderer) {
    this.renderer = tableRenderer;
    this._modalHandlers = null;
  }

  /**
   * Canvas 클릭 이벤트 핸들러 - 모달 열기
   * @param {MouseEvent} event - 마우스 이벤트
   */
  handleCanvasClick(event) {
    const rootLayer = this.renderer.layerManager.root;
    if (!rootLayer || rootLayer.children.length === 0) return;

    this.openEditModal();
  }

  /**
   * 편집 모달 열기
   */
  openEditModal() {
    const modal = document.getElementById('variableEditModal');
    if (!modal) return;

    // HTML 테이블 생성
    this.generateEditableTable();

    // 합계 행 체크박스 상태 초기화
    const summaryCheckbox = document.getElementById('showSummaryRowCheckbox');
    if (summaryCheckbox) {
      summaryCheckbox.checked = tableStore.getSummaryRowVisible(this.renderer.tableId);
    }

    // 병합 헤더 옵션 (이원분류표 전용)
    const mergedHeaderOption = document.getElementById('mergedHeaderOption');
    const mergedHeaderCheckbox = document.getElementById('showMergedHeaderCheckbox');
    const isCrossTable = this.renderer.currentTableType === CONFIG.TABLE_TYPES.CROSS_TABLE;

    if (mergedHeaderOption) {
      mergedHeaderOption.style.display = isCrossTable ? 'block' : 'none';
    }
    if (mergedHeaderCheckbox && isCrossTable) {
      mergedHeaderCheckbox.checked = tableStore.getMergedHeaderVisible(this.renderer.tableId);
    }

    // 모달 표시
    modal.style.display = 'flex';

    // 이벤트 리스너 등록
    this._setupModalListeners();
  }

  /**
   * 편집 모달 닫기
   */
  closeEditModal() {
    const modal = document.getElementById('variableEditModal');
    if (modal) {
      modal.style.display = 'none';
    }

    // 이벤트 리스너 제거
    this._removeModalListeners();
  }

  /**
   * 모달 이벤트 리스너 설정
   * @private
   */
  _setupModalListeners() {
    const modal = document.getElementById('variableEditModal');
    const closeBtn = document.getElementById('variableModalCloseBtn');
    const cancelBtn = document.getElementById('variableCancelBtn');
    const saveBtn = document.getElementById('variableSaveBtn');
    const overlay = modal?.querySelector('.modal-overlay');

    // 저장된 핸들러 참조 (제거용)
    this._modalHandlers = {
      close: () => this.closeEditModal(),
      save: () => this.saveChanges(),
      overlayClick: (e) => {
        if (e.target === overlay) this.closeEditModal();
      }
    };

    closeBtn?.addEventListener('click', this._modalHandlers.close);
    cancelBtn?.addEventListener('click', this._modalHandlers.close);
    saveBtn?.addEventListener('click', this._modalHandlers.save);
    overlay?.addEventListener('click', this._modalHandlers.overlayClick);
  }

  /**
   * 모달 이벤트 리스너 제거
   * @private
   */
  _removeModalListeners() {
    if (!this._modalHandlers) return;

    const modal = document.getElementById('variableEditModal');
    const closeBtn = document.getElementById('variableModalCloseBtn');
    const cancelBtn = document.getElementById('variableCancelBtn');
    const saveBtn = document.getElementById('variableSaveBtn');
    const overlay = modal?.querySelector('.modal-overlay');

    closeBtn?.removeEventListener('click', this._modalHandlers.close);
    cancelBtn?.removeEventListener('click', this._modalHandlers.close);
    saveBtn?.removeEventListener('click', this._modalHandlers.save);
    overlay?.removeEventListener('click', this._modalHandlers.overlayClick);

    this._modalHandlers = null;
  }

  /**
   * 편집용 HTML 테이블 생성
   */
  generateEditableTable() {
    const container = document.getElementById('variableEditTableContainer');
    if (!container) return;

    const rootLayer = this.renderer.layerManager.root;
    if (!rootLayer || rootLayer.children.length === 0) {
      container.innerHTML = '<p>테이블 데이터가 없습니다.</p>';
      return;
    }

    const tableLayer = rootLayer.children[0];
    if (!tableLayer) return;

    // 헤더와 데이터 행 분리
    const headerRow = tableLayer.children.find(c => c.id.includes('-table-header'));
    const dataRows = tableLayer.children.filter(c =>
      c.type === 'group' && (c.id.includes('-table-row-') || c.id.includes('-table-summary'))
    );

    // HTML 테이블 생성
    let html = '<table class="variable-edit-table">';

    // 헤더 행
    if (headerRow) {
      html += '<thead><tr>';
      headerRow.children.forEach(cell => {
        html += `<th>${cell.data.cellText}</th>`;
      });
      html += '</tr></thead>';
    }

    // 데이터 행
    html += '<tbody>';
    dataRows.forEach(row => {
      const isSummary = row.id.includes('-table-summary');
      html += `<tr class="${isSummary ? 'summary-row' : ''}" data-row-id="${row.id}">`;

      row.children.forEach((cell, colIndex) => {
        const { rowIndex, cellText, originalValue, tallyCount } = cell.data;
        // tallyCount가 정의되어 있으면 탈리 컬럼 (헤더 병합과 관계없이 정확히 판별)
        const isTallyColumn = tallyCount !== undefined;

        // 탈리 컬럼인 경우 tallyCount 표시, 아니면 cellText 표시
        let displayValue = cellText;
        let originalVal = originalValue !== undefined ? originalValue : cellText;

        if (isTallyColumn) {
          displayValue = String(tallyCount);
          originalVal = String(tallyCount);
        }

        html += `<td data-row="${rowIndex}" data-col="${colIndex}" data-original="${originalVal}" data-is-tally="${isTallyColumn}">${displayValue}</td>`;
      });

      html += '</tr>';
    });
    html += '</tbody></table>';

    container.innerHTML = html;

    // 셀 클릭 이벤트 등록
    const table = container.querySelector('.variable-edit-table');
    table?.querySelectorAll('td').forEach(td => {
      td.addEventListener('click', (e) => this._handleTableCellClick(e));
    });
  }

  /**
   * 테이블 셀 클릭 - 인라인 편집
   * @param {Event} event - 클릭 이벤트
   * @private
   */
  _handleTableCellClick(event) {
    const td = event.target.closest('td');
    if (!td || td.classList.contains('editing')) return;

    // 이미 편집 중인 셀이 있으면 완료 처리
    const editingTd = td.closest('table').querySelector('td.editing');
    if (editingTd) {
      this._finishCellEdit(editingTd);
    }

    // 현재 셀을 편집 모드로 전환
    const currentValue = td.textContent;
    td.classList.add('editing');
    td.innerHTML = `<input type="text" value="${currentValue}" />`;

    const input = td.querySelector('input');
    input.focus();
    input.select();

    // Enter/Escape 키 처리
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this._finishCellEdit(td);
      } else if (e.key === 'Escape') {
        // 원본 값으로 복원
        td.classList.remove('editing');
        td.textContent = td.dataset.original;
      }
    });

    // 포커스 아웃 시 완료
    input.addEventListener('blur', () => {
      this._finishCellEdit(td);
    });
  }

  /**
   * 셀 편집 완료
   * @param {HTMLElement} td - 편집 중인 셀
   * @private
   */
  _finishCellEdit(td) {
    if (!td.classList.contains('editing')) return;

    const input = td.querySelector('input');
    const newValue = input?.value.trim() || td.dataset.original;

    td.classList.remove('editing');
    td.textContent = newValue;
  }

  /**
   * 변경사항 저장
   */
  saveChanges() {
    const container = document.getElementById('variableEditTableContainer');
    const table = container?.querySelector('.variable-edit-table');
    if (!table) return;

    const rootLayer = this.renderer.layerManager.root;
    if (!rootLayer || rootLayer.children.length === 0) return;

    const tableLayer = rootLayer.children[0];
    if (!tableLayer) return;

    // 합계 행 체크박스 상태 확인
    const summaryCheckbox = document.getElementById('showSummaryRowCheckbox');
    const newSummaryRowVisible = summaryCheckbox ? summaryCheckbox.checked : true;
    const oldSummaryRowVisible = tableStore.getSummaryRowVisible(this.renderer.tableId);
    const summaryRowChanged = newSummaryRowVisible !== oldSummaryRowVisible;

    // 합계 행 상태 저장
    tableStore.setSummaryRowVisible(this.renderer.tableId, newSummaryRowVisible);

    // 병합 헤더 체크박스 상태 확인 (이원분류표 전용)
    const isCrossTable = this.renderer.currentTableType === CONFIG.TABLE_TYPES.CROSS_TABLE;
    let mergedHeaderChanged = false;

    if (isCrossTable) {
      const mergedHeaderCheckbox = document.getElementById('showMergedHeaderCheckbox');
      const newMergedHeaderVisible = mergedHeaderCheckbox ? mergedHeaderCheckbox.checked : true;
      const oldMergedHeaderVisible = tableStore.getMergedHeaderVisible(this.renderer.tableId);
      mergedHeaderChanged = newMergedHeaderVisible !== oldMergedHeaderVisible;

      // 병합 헤더 상태 저장
      tableStore.setMergedHeaderVisible(this.renderer.tableId, newMergedHeaderVisible);
    }

    // 모든 데이터 셀 확인
    table.querySelectorAll('td').forEach(td => {
      const rowIndex = parseInt(td.dataset.row);
      const colIndex = parseInt(td.dataset.col);
      const originalValue = td.dataset.original;
      const currentValue = td.textContent.trim();
      const isTallyColumn = td.dataset.isTally === 'true';

      // 레이어에서 해당 셀 찾기
      let cellLayer = null;
      for (const row of tableLayer.children) {
        if (row.type !== 'group') continue;

        for (const cell of row.children) {
          if (cell.data.rowIndex === rowIndex && cell.data.colIndex === colIndex) {
            cellLayer = cell;
            break;
          }
        }
        if (cellLayer) break;
      }

      if (!cellLayer) return;

      // 탈리 컬럼 특별 처리
      if (isTallyColumn) {
        // '_' 입력 시 0으로, 숫자 입력 시 해당 값으로 tallyCount 업데이트
        if (currentValue === '_' || currentValue === '') {
          cellLayer.data.tallyCount = 0;
        } else {
          const numValue = parseInt(currentValue);
          if (!isNaN(numValue)) {
            cellLayer.data.tallyCount = numValue;
          }
        }
        // 탈리 컬럼의 cellText는 항상 빈 문자열 유지
        cellLayer.data.cellText = '';
        return;
      }

      // 값이 변경되었는지 확인
      if (currentValue !== originalValue) {
        // 변수로 설정
        if (!cellLayer.data.originalValue) {
          cellLayer.data.originalValue = originalValue;
        }
        cellLayer.data.cellText = currentValue;
        cellLayer.data.isVariable = true;
        tableStore.setCellVariable(this.renderer.tableId, rowIndex, colIndex, currentValue);
      } else {
        // 원본 값으로 복원된 경우
        if (cellLayer.data.originalValue !== undefined) {
          cellLayer.data.cellText = cellLayer.data.originalValue;
          delete cellLayer.data.originalValue;
          delete cellLayer.data.isVariable;
        }
        tableStore.removeCellVariable(this.renderer.tableId, rowIndex, colIndex);
      }
    });

    // 합계 행 또는 병합 헤더 상태가 변경되었으면 테이블 재생성
    if (summaryRowChanged || mergedHeaderChanged) {
      if (this.renderer.currentTableType && this.renderer.currentData) {
        // 커스텀 테이블 (이원분류표 등)
        this.renderer.drawCustomTable(this.renderer.currentTableType, this.renderer.currentData, this.renderer.currentConfig);
      } else if (this.renderer.currentClasses && this.renderer.currentTotal !== null) {
        // 도수분포표
        this.renderer.draw(this.renderer.currentClasses, this.renderer.currentTotal, this.renderer.currentConfig);
      } else {
        this.renderer.renderFrame();
      }
    } else {
      // Canvas 다시 렌더링
      this.renderer.renderFrame();
    }

    // 모달 닫기
    this.closeEditModal();
  }

  /**
   * 모든 변수 초기화
   */
  clearAllVariables() {
    tableStore.clearAllVariables(this.renderer.tableId);

    // 레이어의 변수 정보도 초기화
    const rootLayer = this.renderer.layerManager.root;
    if (!rootLayer || rootLayer.children.length === 0) return;

    const tableLayer = rootLayer.children[0];
    if (!tableLayer) return;

    for (const child of tableLayer.children) {
      if (child.type !== 'group') continue;

      for (const cellLayer of child.children) {
        if (cellLayer.data.originalValue !== undefined) {
          cellLayer.data.cellText = cellLayer.data.originalValue;
          delete cellLayer.data.originalValue;
          delete cellLayer.data.isVariable;
        }
      }
    }

    this.renderer.renderFrame();
  }
}

/**
 * 테이블 렌더링 레이어
 * Canvas 기반 테이블 그리기 (레이어 시스템)
 * 도수분포표, 카테고리 행렬, 이원 분류표, 줄기-잎 그림 지원
 */


/**
 * @class TableRenderer
 * @description Canvas 기반 도수분포표 렌더러 (레이어 시스템)
 */
class TableRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`Canvas 요소를 찾을 수 없습니다: ${canvasId}`);
    }

    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) {
      throw new Error(`Canvas 2D 컨텍스트를 생성할 수 없습니다: ${canvasId}`);
    }

    // canvasId에서 tableId 추출
    // 예: 'frequencyTable' → 'table-1', 'frequencyTable-2' → 'table-2'
    this.canvasId = canvasId;
    this.tableId = this.extractTableId(canvasId);

    this.padding = CONFIG.TABLE_PADDING;

    // Layer 시스템
    this.layerManager = new LayerManager();
    this.timeline = new LayerTimeline();
    this.animationMode = true; // 애니메이션 사용 여부
    this.animationSpeed = 1.0;

    // 셀 렌더러
    this.cellRenderer = new TableCellRenderer(this.ctx);

    // 스케일 비율 (canvasWidth/canvasHeight 설정 시 사용)
    this.scaleRatio = 1;

    // 현재 설정 저장 (renderFrame에서 사용)
    this.currentClasses = null;
    this.currentTotal = null;
    this.currentConfig = null;

    // 타임라인 콜백
    this.timeline.onUpdate = () => this.renderFrame();

    // 셀 애니메이션 상태
    this.cellAnimationActive = false;
    this.cellAnimationStart = 0;
    this.cellAnimationDuration = 1000;
    this.cellAnimationRepeat = 3;
    this.cellAnimationTargets = []; // [{row, col}, ...]
    this.cellAnimationFrameId = null;
    this.cellAnimationBlinkEnabled = true;

    // 복수 애니메이션 저장
    this.savedAnimations = []; // [{rowIndex, colIndex, duration, repeat}, ...]
    this.activeAnimations = []; // 현재 재생 중인 애니메이션들

    // 편집 모달 관리자
    this.editModal = new TableEditModal(this);

    // 셀 클릭 이벤트 (변수 치환용) - TableEditModal로 위임
    this.canvas.addEventListener('click', (e) => this.editModal.handleCanvasClick(e));
  }

  /**
   * canvasId에서 tableId 추출
   * @param {string} canvasId - Canvas ID (예: 'viz-table-1', 'viz-table-2')
   * @returns {string} 테이블 ID (예: 'viz-table-1', 'table-1')
   */
  extractTableId(canvasId) {
    // viz-api 형식: viz-table-1, viz-table-2 등 → 그대로 사용
    const vizMatch = canvasId.match(/viz-table-\d+/);
    if (vizMatch) {
      return canvasId;
    }
    // 기본값
    return 'table-1';
  }

  /**
   * 도수분포표 그리기
   * @param {Array} classes - 계급 데이터 배열
   * @param {number} total - 전체 데이터 개수
   * @param {Object} config - 테이블 설정 객체
   * @param {Object} highlightInfo - 하이라이트 정보 (레거시 지원)
   */
  draw(classes, total, config = null, highlightInfo = null) {
    // 도수가 0이 아닌 계급만 필터링
    const visibleClasses = classes.filter(c => c.frequency > 0);

    if (visibleClasses.length === 0) {
      this.drawNoDataMessage();
      return;
    }

    // 설정 저장
    this.currentClasses = visibleClasses;
    this.currentTotal = total;
    this.currentConfig = config;

    // 합계 행 표시 여부 (config 우선, 없으면 tableStore에서 가져오기)
    const showSummaryRow = config?.showSummaryRow ?? tableStore.getSummaryRowVisible(this.tableId);

    // Canvas 크기 계산
    const rowCount = visibleClasses.length + (showSummaryRow ? 1 : 0); // 합계 행 조건부
    const autoHeight = CONFIG.TABLE_HEADER_HEIGHT + (rowCount * CONFIG.TABLE_ROW_HEIGHT) + this.padding * 2;

    // 동적 너비 계산
    const dynamicConfig = this._calculateFrequencyTableDynamicWidth(visibleClasses, total, config, showSummaryRow);

    // 비율 계산 (canvasWidth 또는 canvasHeight 중 하나만 설정해도 비율 유지)
    let ratio = 1;
    if (config?.canvasWidth && dynamicConfig.canvasWidth > 0) {
      ratio = config.canvasWidth / dynamicConfig.canvasWidth;
    } else if (config?.canvasHeight && autoHeight > 0) {
      ratio = config.canvasHeight / autoHeight;
    }

    // 최종 canvas 크기 계산 (비율 적용)
    const finalCanvasWidth = config?.canvasWidth || Math.round(dynamicConfig.canvasWidth * ratio);
    const finalCanvasHeight = config?.canvasHeight || Math.round(autoHeight * ratio);
    this.canvas.width = finalCanvasWidth;
    this.canvas.height = finalCanvasHeight;
    this.scaleRatio = ratio; // renderFrame에서 사용
    this.clear();

    // 레이어 생성 (원래 크기로 생성, renderFrame에서 scale 적용)
    this.layerManager.clearAll();
    const layerConfig = {
      ...config,
      showSummaryRow,
      columnWidths: dynamicConfig.columnWidths,
      canvasWidth: dynamicConfig.canvasWidth
    };
    TableLayerFactory.createTableLayers(
      this.layerManager,
      visibleClasses,
      total,
      layerConfig,
      this.tableId
    );

    // 레거시 하이라이트 정보 적용 (있는 경우)
    if (highlightInfo) {
      this.highlightCell(highlightInfo.classIndex, null, highlightInfo.progress);
    }

    // 애니메이션 모드 분기
    if (this.animationMode) {
      // 애니메이션 설정 및 재생
      this.setupAnimations();
      this.playAnimation();
    } else {
      // 정적 렌더링
      this.renderFrame();
    }
  }

  /**
   * 캔버스 초기화
   */
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * 레이어 렌더링 (재귀적)
   * @param {Layer} layer - 렌더링할 레이어
   */
  renderLayer(layer) {
    if (!layer.visible) return;

    switch (layer.type) {
      case 'grid':
        this.cellRenderer.renderGrid(layer);
        break;
      case 'basic-table-grid':
        this.cellRenderer.renderBasicTableGrid(layer);
        break;
      case 'stem-leaf-grid':
        this.cellRenderer.renderStemLeafGrid(layer);
        break;
      case 'stem-leaf-single-grid':
        this.cellRenderer.renderStemLeafSingleGrid(layer);
        break;
      case 'cell':
        this._renderCellByRowType(layer);
        break;
      case 'group':
        layer.children.forEach(child => this.renderLayer(child));
        break;
    }
  }

  /**
   * rowType에 따른 셀 렌더링
   * @param {Layer} layer - 셀 레이어
   */
  _renderCellByRowType(layer) {
    const { rowType } = layer.data;

    switch (rowType) {
      case 'header':
        this.cellRenderer.renderHeaderCell(layer);
        break;
      case 'merged-header':
        this.cellRenderer.renderMergedHeaderCell(layer);
        break;
      case 'summary':
        this.cellRenderer.renderSummaryCell(layer);
        break;
      case 'row-header':
        this.cellRenderer.renderRowHeaderCell(layer);
        break;
      case 'stem-leaf-stem':
        this.cellRenderer.renderStemCell(layer);
        break;
      case 'stem-leaf-data':
        this.cellRenderer.renderStemLeafDataCell(layer);
        break;
      case 'data':
      default:
        this.cellRenderer.renderDataCell(layer);
        break;
    }
  }

  /**
   * 커스텀 테이블 타입 그리기 (카테고리 행렬, 이원 분류표, 줄기-잎 그림)
   * @param {string} type - 테이블 타입 (CONFIG.TABLE_TYPES 값)
   * @param {Object} data - 파싱된 데이터 객체
   * @param {Object} config - 테이블 설정 객체
   */
  drawCustomTable(type, data, config = null) {
    if (!data) {
      this.drawNoDataMessage();
      return;
    }

    // 설정 저장
    this.currentConfig = config;
    this.currentTableType = type;
    this.currentData = data;

    // 이원분류표인 경우 합계 행 및 병합 헤더 표시 여부 적용
    // config에서 명시적으로 설정된 값이 있으면 유지, 없으면 tableStore 사용
    if (type === CONFIG.TABLE_TYPES.BASIC_TABLE) {
      if (data.showTotal === undefined) {
        data.showTotal = tableStore.getSummaryRowVisible(this.tableId);
      }
      if (data.showMergedHeader === undefined) {
        data.showMergedHeader = tableStore.getMergedHeaderVisible(this.tableId);
      }
    }

    // 행 수 계산 (adaptedData가 있으면 직접 사용, 없으면 타입별 계산)
    const rowCount = config?.adaptedData?.rowCount ?? this._calculateRowCount(type, data);

    // Canvas 크기 계산 (이원분류표는 병합 헤더 조건부 추가)
    const showMergedHeader = type === CONFIG.TABLE_TYPES.BASIC_TABLE && data.showMergedHeader !== false;
    const mergedHeaderHeight = showMergedHeader ? 35 : 0;

    // 분수가 포함된 경우 행 높이 조정
    const hasFraction = this._checkTableHasFraction(type, data);
    const rowHeight = hasFraction ? CONFIG.TABLE_ROW_HEIGHT_FRACTION : CONFIG.TABLE_ROW_HEIGHT;
    const autoHeight = mergedHeaderHeight + CONFIG.TABLE_HEADER_HEIGHT + (rowCount * rowHeight) + this.padding * 2;

    // 동적 너비 계산 (줄기-잎 제외)
    const dynamicConfig = this._calculateCustomTableDynamicWidth(type, data, config);

    // 비율 계산 (canvasWidth 또는 canvasHeight 중 하나만 설정해도 비율 유지)
    let ratio = 1;
    if (config?.canvasWidth && dynamicConfig.canvasWidth > 0) {
      ratio = config.canvasWidth / dynamicConfig.canvasWidth;
    } else if (config?.canvasHeight && autoHeight > 0) {
      ratio = config.canvasHeight / autoHeight;
    }

    // 최종 canvas 크기 계산 (비율 적용)
    const finalCanvasWidth = config?.canvasWidth || Math.round(dynamicConfig.canvasWidth * ratio);
    const finalCanvasHeight = config?.canvasHeight || Math.round(autoHeight * ratio);
    this.canvas.width = finalCanvasWidth;
    this.canvas.height = finalCanvasHeight;
    this.scaleRatio = ratio; // renderFrame에서 사용
    this.clear();

    // 레이어 생성 (원래 크기로 생성, renderFrame에서 scale 적용)
    this.layerManager.clearAll();
    const layerConfig = {
      ...config,
      columnWidths: dynamicConfig.columnWidths,
      canvasWidth: dynamicConfig.canvasWidth
    };
    TableFactoryRouter.createTableLayers(type, this.layerManager, data, layerConfig, this.tableId);

    // 애니메이션 모드 분기
    if (this.animationMode) {
      this.setupAnimations();
      this.playAnimation();
    } else {
      this.renderFrame();
    }
  }

  /**
   * 타입별 행 수 계산
   * @param {string} type - 테이블 타입
   * @param {Object} data - 파싱된 데이터
   * @returns {number} 행 수 (헤더 제외)
   */
  _calculateRowCount(type, data) {
    switch (type) {
      case CONFIG.TABLE_TYPES.CATEGORY_MATRIX:
        return data.rows ? data.rows.length : 0;

      case CONFIG.TABLE_TYPES.BASIC_TABLE:
        // 데이터 행 + 합계 행 (옵션)
        const crossRows = data.rows ? data.rows.length : 0;
        return crossRows + (data.showTotal !== false ? 1 : 0);

      case CONFIG.TABLE_TYPES.STEM_LEAF:
        return data.stems ? data.stems.length : 0;

      default:
        return 0;
    }
  }

  /**
   * 테이블 데이터에 분수(\frac{}{})가 포함되어 있는지 확인
   * @param {string} type - 테이블 타입
   * @param {Object} data - 파싱된 데이터
   * @returns {boolean} 분수 포함 여부
   */
  _checkTableHasFraction(type, data) {
    const fracPattern = /\\frac\{[^}]*\}\{[^}]*\}/;

    if (type === CONFIG.TABLE_TYPES.BASIC_TABLE && data.rows) {
      // 데이터 행 검사
      for (const row of data.rows) {
        if (row.values) {
          for (const val of row.values) {
            if (typeof val === 'string' && fracPattern.test(val)) {
              return true;
            }
          }
        }
      }
      // 합계 행 검사
      if (data.totals) {
        for (const val of data.totals) {
          if (typeof val === 'string' && fracPattern.test(val)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * 도수분포표 동적 너비 계산
   * @param {Array} classes - 계급 데이터 배열
   * @param {number} total - 전체 데이터 개수
   * @param {Object} config - 테이블 설정
   * @param {boolean} showSummaryRow - 합계 행 표시 여부
   * @returns {Object} { columnWidths, canvasWidth }
   */
  _calculateFrequencyTableDynamicWidth(classes, total, config, showSummaryRow) {
    const tableLabels = config?.labels || CONFIG.DEFAULT_LABELS.table;
    const visibleColumns = config?.visibleColumns || CONFIG.TABLE_DEFAULT_VISIBLE_COLUMNS;
    const columnOrder = config?.columnOrder || CONFIG.TABLE_DEFAULT_COLUMN_ORDER;
    const showSuperscript = config?.showSuperscript ?? CONFIG.TABLE_SHOW_SUPERSCRIPT;

    // 헤더 텍스트 배열 생성 (7개: 계급, 계급값, 탈리, 도수, 상대도수, 누적도수, 누적상대도수)
    const allLabels = [
      tableLabels.class, tableLabels.midpoint, tableLabels.tally,
      tableLabels.frequency, tableLabels.relativeFrequency,
      tableLabels.cumulativeFrequency, tableLabels.cumulativeRelativeFrequency
    ];

    // 정렬 및 필터링된 헤더
    const orderedLabels = columnOrder.map(i => allLabels[i]);
    const orderedVisible = columnOrder.map(i => visibleColumns[i]);
    const headers = orderedLabels.filter((_, i) => orderedVisible[i]);

    // 데이터 행 생성 (텍스트만)
    const rows = classes.map((c, rowIndex) => {
      // 숫자 안전하게 포맷
      const relFreq = typeof c.relativeFreq === 'number' ? c.relativeFreq.toFixed(2) : String(c.relativeFreq);
      const cumRelFreq = typeof c.cumulativeRelFreq === 'number' ? c.cumulativeRelFreq.toFixed(2) : String(c.cumulativeRelFreq);

      // 첫 번째 행이고 상첨자 표시 시 "이상/미만" 포함
      let classText = `${c.min} ~ ${c.max}`;
      if (rowIndex === 0 && showSuperscript) {
        classText = `${c.min}이상 ~ ${c.max}미만`;
      }

      // 탈리마크 너비 계산 (Canvas 그리기 기준)
      const tallyCount = c.frequency;
      const groups = Math.floor(tallyCount / 5);
      const remainder = tallyCount % 5;
      const groupWidth = 4 * CONFIG.TALLY_LINE_SPACING;
      const groupSpacing = CONFIG.TALLY_GROUP_SPACING;
      const remainderWidth = remainder > 0 ? (remainder - 1) * CONFIG.TALLY_LINE_SPACING : 0;
      // 간격 개수: 그룹만 있으면 groups-1, 나머지도 있으면 groups
      const numGaps = groups > 0 ? (remainder > 0 ? groups : Math.max(0, groups - 1)) : 0;
      const tallyPixelWidth = groups * groupWidth + numGaps * groupSpacing + remainderWidth;
      // 너비 계산용 placeholder (대략적인 문자 수로 변환)
      const tallyWidthChars = 'X'.repeat(Math.ceil(tallyPixelWidth / 10));

      const allCells = [
        classText,                    // 0: 계급
        String(c.midpoint),           // 1: 계급값
        tallyWidthChars,              // 2: 탈리마크 (너비 계산용)
        String(c.frequency),          // 3: 도수
        `${relFreq}%`,                // 4: 상대도수
        String(c.cumulativeFreq),     // 5: 누적도수
        `${cumRelFreq}%`              // 6: 누적상대도수
      ];
      const orderedCells = columnOrder.map(i => allCells[i]);
      return orderedCells.filter((_, i) => orderedVisible[i]);
    });

    // 합계 행 추가 (7개 컬럼)
    if (showSummaryRow) {
      const summaryRow = columnOrder.map(i => {
        switch (i) {
          case 0: return '합계';
          case 1: return '';
          case 2: return '';           // 탈리마크 칸 빈값
          case 3: return String(total);
          case 4: return '100%';
          case 5: return String(total);
          case 6: return '100%';
          default: return '';
        }
      }).filter((_, idx) => orderedVisible[idx]);
      rows.push(summaryRow);
    }

    // BaseTableFactory의 동적 너비 계산 사용
    return BaseTableFactory.calculateDynamicWidths(this.ctx, headers, rows);
  }

  /**
   * 커스텀 테이블 동적 너비 계산 (줄기-잎 제외)
   * @param {string} type - 테이블 타입
   * @param {Object} data - 파싱된 데이터
   * @param {Object} config - 테이블 설정
   * @returns {Object} { columnWidths, canvasWidth }
   */
  _calculateCustomTableDynamicWidth(type, data, config) {
    // 줄기-잎 동적 너비 계산
    if (type === CONFIG.TABLE_TYPES.STEM_LEAF) {
      return StemLeafFactory.calculateDynamicWidths(data);
    }

    let headers = [];
    let rows = [];

    switch (type) {
      case CONFIG.TABLE_TYPES.CATEGORY_MATRIX:
        // 카테고리 행렬 (data.headers 사용)
        headers = ['', ...(data.headers || [])];
        rows = (data.rows || []).map(row => [row.label, ...row.values.map(String)]);
        break;

      case CONFIG.TABLE_TYPES.BASIC_TABLE:
        // 이원분류표
        headers = [data.rowLabelColumn || '', ...(data.columnHeaders || [])];
        rows = (data.rows || []).map(row => {
          const values = row.values.map(v =>
            typeof v === 'number' ? (v === 1 ? '1' : v.toFixed(2).replace(/\.?0+$/, '')) : String(v)
          );
          return [row.label, ...values];
        });
        // 합계 행
        if (data.showTotal !== false && data.totals) {
          const totals = data.totals.map(v =>
            typeof v === 'number' ? (v === 1 ? '1' : v.toFixed(2).replace(/\.?0+$/, '')) : String(v)
          );
          rows.push(['합계', ...totals]);
        }
        break;

      default:
        return {
          columnWidths: null,
          canvasWidth: CONFIG.TABLE_CANVAS_WIDTH
        };
    }

    return BaseTableFactory.calculateDynamicWidths(this.ctx, headers, rows);
  }

  /**
   * 전체 프레임 렌더링
   */
  renderFrame() {
    this.clear();

    // 스케일 적용
    this.ctx.save();
    if (this.scaleRatio !== 1) {
      this.ctx.scale(this.scaleRatio, this.scaleRatio);
    }

    // 셀 애니메이션 진행도 계산 및 적용
    this.processTableAnimations();

    const rootLayer = this.layerManager.root;
    if (rootLayer && rootLayer.children.length > 0) {
      const tableLayer = rootLayer.children[0];
      if (tableLayer && tableLayer.children) {
        // 1. 그리드 레이어 먼저 렌더링
        tableLayer.children.forEach(child => {
          if (child.type === 'grid' || child.type === 'basic-table-grid' ||
              child.type === 'stem-leaf-grid' || child.type === 'stem-leaf-single-grid') {
            this.renderLayer(child);
          }
        });

        // 2. 하이라이트 렌더링 (그리드 위, 텍스트 아래)
        if (this.cellAnimationActive) {
          let renderProgress;
          const elapsed = Date.now() - this.cellAnimationStart;

          if (this.cellAnimationBlinkEnabled) {
            const progress = Math.min(elapsed / this.cellAnimationDuration, 1);
            renderProgress = Math.sin(progress * Math.PI * 2 * this.cellAnimationRepeat) * 0.5 + 0.5;
          } else {
            const fadeInDuration = 300;
            renderProgress = Math.min(elapsed / fadeInDuration, 1);
          }
          this._renderMergedAnimations(renderProgress);
        }

        // 3. 셀 레이어 렌더링 (텍스트)
        tableLayer.children.forEach(child => {
          if (child.type !== 'grid' && child.type !== 'basic-table-grid' &&
              child.type !== 'stem-leaf-grid' && child.type !== 'stem-leaf-single-grid') {
            this.renderLayer(child);
          }
        });
      }
    }

    // 스케일 복원
    this.ctx.restore();
  }

  /**
   * 애니메이션 설정
   */
  setupAnimations() {
    this.timeline.clearAnimations();

    const rootLayer = this.layerManager.root;
    if (!rootLayer || rootLayer.children.length === 0) return;

    // 도수분포표 레이어 찾기
    const tableLayer = rootLayer.children[0];
    if (!tableLayer) return;

    // 데이터 행만 애니메이션 (헤더, 합계는 제외)
    const dataRows = tableLayer.children.filter(child =>
      child.id.startsWith(`${this.tableId}-table-row-`) && child.id !== `${this.tableId}-table-summary`
    );

    // 순차적으로 행 페이드인 애니메이션
    dataRows.forEach((rowLayer, index) => {
      const startTime = index * CONFIG.TABLE_ANIMATION_ROW_INTERVAL;
      const duration = CONFIG.TABLE_ANIMATION_ROW_DURATION;

      this.timeline.addAnimation(rowLayer.id, {
        startTime,
        duration,
        effect: 'fade',
        effectOptions: {
          from: 0,
          to: 1
        }
      });
    });
  }

  /**
   * 애니메이션 재생
   */
  playAnimation() {
    this.timeline.play(this.animationSpeed);
  }

  /**
   * 애니메이션 일시정지
   */
  pauseAnimation() {
    this.timeline.pause();
  }

  /**
   * 애니메이션 정지
   */
  stopAnimation() {
    this.timeline.stop();
  }

  /**
   * 애니메이션 속도 설정
   * @param {number} speed - 속도 (0.5 ~ 3.0)
   */
  setAnimationSpeed(speed) {
    this.animationSpeed = speed;
    this.timeline.setSpeed(speed);
  }

  /**
   * 현재 테이블의 레이어 ID 접두사 반환
   * @returns {string} 레이어 ID 접두사 (예: 'frequency-table-1', 'stem-leaf-table-1')
   */
  _getLayerIdPrefix() {
    const rootLayer = this.layerManager.root;
    if (!rootLayer || rootLayer.children.length === 0) return this.tableId;

    const tableLayer = rootLayer.children[0];
    const tableType = tableLayer?.data?.tableType;

    // tableType이 있으면 접두사로 사용
    if (tableType) {
      return `${tableType}-${this.tableId}`;
    }
    return this.tableId;
  }

  /**
   * 개별 셀 하이라이트
   * @param {number} rowIndex - 행 인덱스
   * @param {number|null} colIndex - 열 인덱스 (null이면 행 전체)
   * @param {number} progress - 하이라이트 진행도 (0~1)
   */
  highlightCell(rowIndex, colIndex = null, progress = 1.0) {
    const prefix = this._getLayerIdPrefix();
    const rowLayer = this.layerManager.findLayer(`${prefix}-table-row-${rowIndex}`);
    if (!rowLayer) return;

    if (colIndex === null) {
      // 행 전체 하이라이트
      rowLayer.children.forEach(cellLayer => {
        cellLayer.data.highlighted = true;
        cellLayer.data.highlightProgress = progress;
      });
    } else {
      // 특정 셀만 하이라이트
      const cellLayer = rowLayer.children[colIndex];
      if (cellLayer) {
        cellLayer.data.highlighted = true;
        cellLayer.data.highlightProgress = progress;
      }
    }

    this.renderFrame();
  }

  /**
   * 하이라이트 해제
   */
  clearHighlight() {
    const rootLayer = this.layerManager.root;
    if (!rootLayer || rootLayer.children.length === 0) return;

    // 테이블 레이어 찾기
    const tableLayer = rootLayer.children[0];
    if (!tableLayer) return;

    const prefix = this._getLayerIdPrefix();

    // 모든 데이터 셀의 하이라이트 제거
    tableLayer.children.forEach(child => {
      if (child.type === 'group' && child.id.startsWith(`${prefix}-table-row-`)) {
        child.children.forEach(cellLayer => {
          if (cellLayer.type === 'cell' && cellLayer.data.rowType === 'data') {
            cellLayer.data.highlighted = false;
            cellLayer.data.highlightProgress = 0;
          }
        });
      }
    });

    this.renderFrame();
  }

  // =============================================
  // 셀 애니메이션 API
  // =============================================

  /**
   * 셀 애니메이션 실행
   * @param {Object} options - 애니메이션 옵션
   * @param {number} [options.rowIndex] - 행 인덱스 (null이면 전체 행)
   * @param {number} [options.colIndex] - 열 인덱스 (null이면 전체 열)
   * @param {number} [options.rowStart] - 행 범위 시작 (colIndex와 함께 사용)
   * @param {number} [options.rowEnd] - 행 범위 끝 (colIndex와 함께 사용)
   * @param {number} [options.colStart] - 열 범위 시작 (rowIndex와 함께 사용)
   * @param {number} [options.colEnd] - 열 범위 끝 (rowIndex와 함께 사용)
   * @param {Array} [options.cells] - 복수 셀 [{row, col}, ...]
   * @param {number} [options.duration=1500] - 애니메이션 시간 (ms)
   * @param {number} [options.repeat=3] - 반복 횟수
   * @param {string} [options.color] - 애니메이션 색상 (CSS rgba 또는 hex)
   */
  animateCells(options = {}) {
    const {
      rowIndex = null,
      colIndex = null,
      rowStart = null,
      rowEnd = null,
      colStart = null,
      colEnd = null,
      cells = null,
      duration = 1500,
      repeat = 3,
      color = null
    } = options;

    // 기존 애니메이션 중지
    this.stopCellAnimation();

    // 대상 셀 결정
    this.cellAnimationTargets = this._resolveAnimationTargets({
      rowIndex, colIndex, rowStart, rowEnd, colStart, colEnd, cells
    });

    if (this.cellAnimationTargets.length === 0) {
      console.warn('animateCells: 대상 셀이 없습니다.');
      return;
    }

    // 애니메이션 상태 설정
    this.cellAnimationActive = true;
    this.cellAnimationStart = Date.now();
    this.cellAnimationDuration = duration;
    this.cellAnimationRepeat = repeat;
    this.cellAnimationColor = color;

    // 애니메이션 루프 시작
    this._runCellAnimationLoop();
  }

  /**
   * 셀 애니메이션 중지
   */
  stopCellAnimation() {
    this.cellAnimationActive = false;

    if (this.cellAnimationFrameId) {
      cancelAnimationFrame(this.cellAnimationFrameId);
      this.cellAnimationFrameId = null;
    }

    // 모든 셀의 애니메이션 상태 초기화
    this._clearAnimationFromAllCells();
    this.cellAnimationTargets = [];

    this.renderFrame();
  }

  /**
   * 셀 애니메이션 대상 결정
   * @param {Object} anim - 애니메이션 설정 객체
   * @param {number|null} anim.rowIndex - 행 인덱스 (0: 헤더, 1+: 데이터행, 마지막: 합계)
   * @param {number|null} anim.colIndex - 열 인덱스
   * @param {number|null} anim.rowStart - 행 범위 시작 (colIndex와 함께 사용)
   * @param {number|null} anim.rowEnd - 행 범위 끝 (colIndex와 함께 사용)
   * @param {number|null} anim.colStart - 열 범위 시작 (rowIndex와 함께 사용)
   * @param {number|null} anim.colEnd - 열 범위 끝 (rowIndex와 함께 사용)
   * @param {Array|null} anim.cells - 복수 셀 배열
   * @returns {Array} 대상 셀 배열 [{row, col}, ...]
   */
  _resolveAnimationTargets(anim) {
    const {
      rowIndex = null,
      colIndex = null,
      rowStart = null,
      rowEnd = null,
      colStart = null,
      colEnd = null,
      cells = null
    } = anim || {};

    // 복수 셀이 지정된 경우
    if (cells && Array.isArray(cells) && cells.length > 0) {
      return cells.map(c => ({ row: c.row, col: c.col }));
    }

    const targets = [];
    const rootLayer = this.layerManager.root;
    if (!rootLayer || rootLayer.children.length === 0) return targets;

    const tableLayer = rootLayer.children[0];
    if (!tableLayer) return targets;

    const prefix = this._getLayerIdPrefix();

    // 테이블 구조 파악: 헤더, 데이터 행들, 합계
    const rowStructure = this._getTableRowStructure(tableLayer, prefix);

    // 1. colIndex + rowStart/rowEnd: 특정 열의 행 범위
    if (colIndex !== null && rowStart !== null && rowEnd !== null) {
      for (let r = rowStart; r <= rowEnd; r++) {
        if (r >= 0 && r < rowStructure.length) {
          targets.push({ row: r, col: colIndex });
        }
      }
    }
    // 2. rowIndex + colStart/colEnd: 특정 행의 열 범위
    else if (rowIndex !== null && colStart !== null && colEnd !== null) {
      const rowInfo = rowStructure[rowIndex];
      if (rowInfo) {
        const rowLayer = this.layerManager.findLayer(rowInfo.layerId);
        if (rowLayer) {
          const maxCol = rowLayer.children.length - 1;
          for (let c = colStart; c <= colEnd; c++) {
            if (c >= 0 && c <= maxCol) {
              targets.push({ row: rowIndex, col: c });
            }
          }
        }
      }
    }
    // 3. 행만 지정: 해당 행의 모든 셀
    else if (rowIndex !== null && colIndex === null) {
      const rowInfo = rowStructure[rowIndex];
      if (rowInfo) {
        const rowLayer = this.layerManager.findLayer(rowInfo.layerId);
        if (rowLayer) {
          rowLayer.children.forEach((_, idx) => {
            targets.push({ row: rowIndex, col: idx });
          });
        }
      }
    }
    // 4. 열만 지정: 해당 열의 모든 행
    else if (rowIndex === null && colIndex !== null) {
      rowStructure.forEach((rowInfo, idx) => {
        targets.push({ row: idx, col: colIndex });
      });
    }
    // 5. 둘 다 지정: 특정 셀
    else if (rowIndex !== null && colIndex !== null) {
      targets.push({ row: rowIndex, col: colIndex });
    }

    return targets;
  }

  /**
   * 테이블 행 구조 파악
   * @param {Layer} tableLayer - 테이블 레이어
   * @param {string} prefix - 레이어 ID 접두사
   * @returns {Array} 행 정보 배열 [{type, layerId}, ...]
   */
  _getTableRowStructure(tableLayer, prefix) {
    const structure = [];

    tableLayer.children.forEach(child => {
      if (child.type === 'group') {
        if (child.id === `${prefix}-table-header`) {
          structure.push({ type: 'header', layerId: child.id });
        } else if (child.id.startsWith(`${prefix}-table-row-`)) {
          structure.push({ type: 'data', layerId: child.id });
        } else if (child.id === `${prefix}-table-summary`) {
          structure.push({ type: 'summary', layerId: child.id });
        }
      }
    });

    return structure;
  }

  /**
   * 셀 애니메이션 루프
   */
  _runCellAnimationLoop() {
    if (!this.cellAnimationActive) return;

    const elapsed = Date.now() - this.cellAnimationStart;

    // 애니메이션 종료 체크 (블링크 활성화 시에만)
    if (this.cellAnimationBlinkEnabled && elapsed >= this.cellAnimationDuration) {
      this.stopCellAnimation();
      return;
    }

    // 다음 프레임 예약 (블링크 비활성화 시 페이드인 완료 후에도 계속)
    this.cellAnimationFrameId = requestAnimationFrame(() => this._runCellAnimationLoop());

    // 렌더링은 processTableAnimations()에서 처리
    this.renderFrame();
  }

  /**
   * 테이블 애니메이션 진행도 계산 및 적용
   */
  processTableAnimations() {
    if (!this.cellAnimationActive) return;

    const elapsed = Date.now() - this.cellAnimationStart;
    const progress = Math.min(elapsed / this.cellAnimationDuration, 1);

    // 펄스 효과: 사인파 곡선 (repeat 횟수만큼 반복)
    // progress가 0~1일 때, repeat 횟수만큼 사인파가 반복됨
    const pulseProgress = Math.sin(progress * Math.PI * 2 * this.cellAnimationRepeat) * 0.5 + 0.5;

    // 대상 셀들에 애니메이션 진행도 적용
    this._applyAnimationToTargetCells(pulseProgress);
  }

  /**
   * 대상 셀들에 애니메이션 진행도 적용
   * @param {number} progress - 애니메이션 진행도 (0~1)
   */
  _applyAnimationToTargetCells(progress) {
    const rootLayer = this.layerManager.root;
    if (!rootLayer || rootLayer.children.length === 0) return;

    const tableLayer = rootLayer.children[0];
    if (!tableLayer) return;

    const prefix = this._getLayerIdPrefix();
    const rowStructure = this._getTableRowStructure(tableLayer, prefix);

    // 디버그: 첫 프레임에서만 로그
    if (!this._debugLogged) {
      console.log('[DEBUG] _applyAnimationToTargetCells - rowStructure:', rowStructure);
      console.log('[DEBUG] targets:', this.cellAnimationTargets);
      this._debugLogged = true;
    }

    this.cellAnimationTargets.forEach(target => {
      const rowInfo = rowStructure[target.row];
      if (!rowInfo) {
        if (!this._debugLogged2) {
          console.log('[DEBUG] rowInfo not found for row:', target.row);
          this._debugLogged2 = true;
        }
        return;
      }
      if (rowInfo.type === 'header') {
        `${prefix}-table-header-col${target.col}`;
      } else if (rowInfo.type === 'summary') {
        `${prefix}-table-summary-col${target.col}`;
      } else {
        // 데이터 행: layerId에서 row 번호 추출
        const match = rowInfo.layerId.match(/row-(\d+)$/);
        const dataRowIdx = match ? match[1] : (target.row - 1);
        `${prefix}-table-row-${dataRowIdx}-col${target.col}`;
      }

      // _renderMergedAnimations가 그룹 규칙에 따라 색상을 적용하므로
      // 여기서는 개별 셀의 animating 플래그를 설정하지 않음
      // (설정하면 _renderAnimationBackground가 초록색을 중복 렌더링함)
    });
  }

  /**
   * 모든 셀의 애니메이션 상태 초기화
   */
  _clearAnimationFromAllCells() {
    const rootLayer = this.layerManager.root;
    if (!rootLayer || rootLayer.children.length === 0) return;

    const tableLayer = rootLayer.children[0];
    if (!tableLayer) return;

    const prefix = this._getLayerIdPrefix();

    // 헤더, 데이터 행, 합계 행 모두 초기화
    tableLayer.children.forEach(child => {
      if (child.type === 'group') {
        const isRow = child.id.startsWith(`${prefix}-table-row-`);
        const isHeader = child.id === `${prefix}-table-header`;
        const isSummary = child.id === `${prefix}-table-summary`;

        if (isRow || isHeader || isSummary) {
          child.children.forEach(cellLayer => {
            if (cellLayer.type === 'cell') {
              cellLayer.data.animating = false;
              cellLayer.data.animationProgress = 0;
              delete cellLayer.data.animationColor;
            }
          });
        }
      }
    });

    // 행/열 전체 애니메이션 상태도 초기화
    this.rowColumnAnimations = [];
  }

  // =============================================
  // 복수 애니메이션 저장/재생 API
  // =============================================

  /**
   * 애니메이션 추가 (저장)
   * @param {Object} options - 애니메이션 옵션
   * @param {number|null} options.rowIndex - 행 인덱스 (null이면 전체)
   * @param {number|null} options.colIndex - 열 인덱스 (null이면 전체)
   * @param {number|null} options.rowStart - 행 범위 시작 (colIndex와 함께 사용)
   * @param {number|null} options.rowEnd - 행 범위 끝 (colIndex와 함께 사용)
   * @param {number|null} options.colStart - 열 범위 시작 (rowIndex와 함께 사용)
   * @param {number|null} options.colEnd - 열 범위 끝 (rowIndex와 함께 사용)
   * @param {number} options.duration - 애니메이션 시간 (ms)
   * @param {number} options.repeat - 반복 횟수
   */
  addAnimation(options) {
    const animation = {
      id: Date.now() + Math.random(), // 고유 ID
      rowIndex: options.rowIndex ?? null,
      colIndex: options.colIndex ?? null,
      rowStart: options.rowStart ?? null,
      rowEnd: options.rowEnd ?? null,
      colStart: options.colStart ?? null,
      colEnd: options.colEnd ?? null,
      duration: options.duration || 1500,
      repeat: options.repeat || 3
    };
    this.savedAnimations.push(animation);
    return animation;
  }

  /**
   * 저장된 애니메이션 목록 반환
   * @returns {Array} 저장된 애니메이션 배열
   */
  getSavedAnimations() {
    return [...this.savedAnimations];
  }

  /**
   * 저장된 애니메이션 삭제
   * @param {number} id - 애니메이션 ID
   */
  removeAnimation(id) {
    this.savedAnimations = this.savedAnimations.filter(a => a.id !== id);
  }

  /**
   * 저장된 모든 애니메이션 초기화
   */
  clearSavedAnimations() {
    this.savedAnimations = [];
  }

  /**
   * 저장된 모든 애니메이션 동시 재생
   * @param {Object} options - 재생 옵션
   * @param {boolean} [options.blinkEnabled=false] - 블링크 효과 활성화
   */
  playAllAnimations(options = {}) {
    const { blinkEnabled = false } = options;

    if (this.savedAnimations.length === 0) {
      console.warn('playAllAnimations: 저장된 애니메이션이 없습니다.');
      return;
    }

    // 기존 애니메이션 중지
    this.stopCellAnimation();

    // savedAnimations에서 대상 셀 목록 생성
    this.cellAnimationTargets = [];
    this.savedAnimations.forEach(anim => {
      const targets = this._resolveAnimationTargets(anim);
      this.cellAnimationTargets.push(...targets);
    });

    // 최대 duration과 repeat 계산
    const maxDuration = Math.max(...this.savedAnimations.map(a => a.duration));
    const maxRepeat = Math.max(...this.savedAnimations.map(a => a.repeat));

    // 애니메이션 상태 설정
    this.cellAnimationActive = true;
    this.cellAnimationStart = Date.now();
    this.cellAnimationDuration = blinkEnabled ? maxDuration : 300; // 블링크 비활성화 시 페이드인 시간
    this.cellAnimationRepeat = maxRepeat;
    this.cellAnimationBlinkEnabled = blinkEnabled;

    // 애니메이션 루프 시작 (블링크/페이드인 모두)
    this._runCellAnimationLoop();
  }

  /**
   * 행/열 전체 애니메이션 영역 계산
   * @param {string} type - 'row' 또는 'column'
   * @param {number} index - 행 또는 열 인덱스
   * @returns {Object|null} {x, y, width, height}
   */
  _getRowColumnBounds(type, index) {
    const rootLayer = this.layerManager.root;
    if (!rootLayer || rootLayer.children.length === 0) return null;

    const tableLayer = rootLayer.children[0];
    if (!tableLayer) return null;

    const prefix = this._getLayerIdPrefix();
    const rowStructure = this._getTableRowStructure(tableLayer, prefix);

    if (type === 'row') {
      // 행 전체 영역 계산
      const rowInfo = rowStructure[index];
      if (!rowInfo) return null;

      const rowLayer = this.layerManager.findLayer(rowInfo.layerId);
      if (!rowLayer || rowLayer.children.length === 0) return null;

      // 첫 번째 셀과 마지막 셀로 영역 계산
      const firstCell = rowLayer.children[0];
      const lastCell = rowLayer.children[rowLayer.children.length - 1];

      if (!firstCell || !lastCell) return null;

      return {
        x: firstCell.x,
        y: firstCell.y,
        width: (lastCell.x + lastCell.width) - firstCell.x,
        height: firstCell.height
      };
    } else if (type === 'column') {
      // 열 전체 영역 계산
      let minY = Infinity, maxY = -Infinity;
      let x = 0, width = 0;

      rowStructure.forEach((rowInfo) => {
        const rowLayer = this.layerManager.findLayer(rowInfo.layerId);
        if (rowLayer && rowLayer.children[index]) {
          const cell = rowLayer.children[index];
          x = cell.x;
          width = cell.width;
          minY = Math.min(minY, cell.y);
          maxY = Math.max(maxY, cell.y + cell.height);
        }
      });

      if (minY === Infinity) return null;

      return {
        x,
        y: minY,
        width,
        height: maxY - minY
      };
    }

    return null;
  }

  /**
   * 행/열 전체 애니메이션 렌더링 (하나의 박스)
   * @param {number} progress - 애니메이션 진행도 (0~1)
   */
  _renderRowColumnAnimations(progress) {
    if (!this.rowColumnAnimations || this.rowColumnAnimations.length === 0) return;

    this.rowColumnAnimations.forEach(anim => {
      const bounds = this._getRowColumnBounds(anim.type, anim.index);
      if (!bounds) return;

      // 개별 애니메이션의 진행도 계산
      const elapsed = Date.now() - this.cellAnimationStart;
      const animProgress = Math.min(elapsed / anim.duration, 1);
      const pulseProgress = Math.sin(animProgress * Math.PI * 2 * anim.repeat) * 0.5 + 0.5;

      // 하나의 박스로 렌더링
      const fillAlpha = pulseProgress * 0.3;
      const strokeAlpha = pulseProgress;

      this.ctx.save();
      this.ctx.fillStyle = `rgba(137, 236, 78, ${fillAlpha})`;
      this.ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      this.ctx.strokeStyle = `rgba(137, 236, 78, ${strokeAlpha})`;
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(bounds.x + 1, bounds.y + 1, bounds.width - 2, bounds.height - 2);
      this.ctx.restore();
    });
  }

  // =============================================
  // 인접 셀 병합 렌더링
  // =============================================

  /**
   * 모든 애니메이션 대상 셀 수집
   * @returns {Array} [{row, col, bounds}, ...]
   */
  _collectAllAnimationCells() {
    const cells = new Map(); // "row-col" -> {row, col, bounds}

    this.savedAnimations.forEach(anim => {
      const targets = this._resolveAnimationTargets(anim);
      targets.forEach(t => {
        const key = `${t.row}-${t.col}`;
        if (!cells.has(key)) {
          const bounds = this._getCellBounds(t.row, t.col);
          if (bounds) cells.set(key, { ...t, bounds });
        }
      });
    });

    return Array.from(cells.values());
  }

  /**
   * 단일 애니메이션의 셀만 수집
   * @param {Object} anim - 애니메이션 객체 {rowIndex, colIndex, ...}
   * @returns {Array} [{row, col, bounds}, ...]
   */
  _collectAnimationCellsForSingleAnim(anim) {
    const cells = [];
    const targets = this._resolveAnimationTargets(anim);

    targets.forEach(t => {
      const bounds = this._getCellBounds(t.row, t.col);
      if (bounds) {
        cells.push({ row: t.row, col: t.col, bounds });
      }
    });

    return cells;
  }

  /**
   * 단일 애니메이션 내에서 인접 셀 그룹화 (방향 제약 적용)
   * @param {Array} cells - 셀 배열 [{row, col, bounds}, ...]
   * @returns {Array} 그룹 배열 [[cell1, cell2, ...], ...]
   */
  _groupCellsWithDirection(cells) {
    if (cells.length === 0) return [];

    const groups = [];
    const cellToGroup = new Map();
    const cellMap = new Map();
    cells.forEach(c => cellMap.set(`${c.row}-${c.col}`, c));

    cells.forEach(cell => {
      const key = `${cell.row}-${cell.col}`;
      if (cellToGroup.has(key)) return;

      const neighbors = [
        { key: `${cell.row - 1}-${cell.col}`, dir: 'vertical' },
        { key: `${cell.row + 1}-${cell.col}`, dir: 'vertical' },
        { key: `${cell.row}-${cell.col - 1}`, dir: 'horizontal' },
        { key: `${cell.row}-${cell.col + 1}`, dir: 'horizontal' }
      ];

      let targetGroupIdx = null;
      let mergeDirection = null;

      for (const n of neighbors) {
        if (!cellToGroup.has(n.key)) continue;
        if (!cellMap.has(n.key)) continue;

        const groupIdx = cellToGroup.get(n.key);
        const group = groups[groupIdx];

        if (group.direction === 'undetermined' || group.direction === n.dir) {
          targetGroupIdx = groupIdx;
          mergeDirection = n.dir;
          break;
        }
      }

      if (targetGroupIdx !== null) {
        const group = groups[targetGroupIdx];
        group.cells.add(key);
        cellToGroup.set(key, targetGroupIdx);

        if (group.direction === 'undetermined' && group.cells.size >= 2) {
          group.direction = mergeDirection;
        }
      } else {
        const newGroup = { cells: new Set([key]), direction: 'undetermined' };
        const newIdx = groups.length;
        groups.push(newGroup);
        cellToGroup.set(key, newIdx);
      }
    });

    return groups.map(g => {
      return Array.from(g.cells).map(key => cellMap.get(key)).filter(Boolean);
    }).filter(g => g.length > 0);
  }

  /**
   * 인접한 셀들을 그룹으로 묶기 (방향 제약 적용)
   * - 행 그룹: 같은 행의 셀만 병합 가능 (가로 방향)
   * - 열 그룹: 같은 열의 셀만 병합 가능 (세로 방향)
   * - 단일 셀: 방향 미정, 다음 셀 추가 시 방향 결정
   * @param {Array} cells - 셀 배열 [{row, col, bounds}, ...]
   * @returns {Array} 그룹 배열 [[cell1, cell2, ...], ...]
   */
  _groupAdjacentCells(cells) {
    // 그룹 구조: { cells: Set<"row-col">, direction: 'undetermined' | 'horizontal' | 'vertical' }
    const groups = [];
    const cellToGroup = new Map(); // "row-col" -> group index
    const cellMap = new Map();
    cells.forEach(c => cellMap.set(`${c.row}-${c.col}`, c));

    // savedAnimations 순서대로 처리 (추가 순서 유지)
    this.savedAnimations.forEach(anim => {
      const targets = this._resolveAnimationTargets(anim);

      targets.forEach(t => {
        const key = `${t.row}-${t.col}`;
        if (cellToGroup.has(key)) return; // 이미 그룹에 있음
        if (!cellMap.has(key)) return; // bounds 없음

        // 인접한 기존 그룹 찾기
        const neighbors = [
          { key: `${t.row - 1}-${t.col}`, dir: 'vertical' },   // 위
          { key: `${t.row + 1}-${t.col}`, dir: 'vertical' },   // 아래
          { key: `${t.row}-${t.col - 1}`, dir: 'horizontal' }, // 왼쪽
          { key: `${t.row}-${t.col + 1}`, dir: 'horizontal' }  // 오른쪽
        ];

        let targetGroupIdx = null;
        let mergeDirection = null;

        for (const n of neighbors) {
          if (!cellToGroup.has(n.key)) continue;

          const groupIdx = cellToGroup.get(n.key);
          const group = groups[groupIdx];

          // 병합 가능 여부 확인
          if (group.direction === 'undetermined' || group.direction === n.dir) {
            targetGroupIdx = groupIdx;
            mergeDirection = n.dir;
            break; // 첫 번째 병합 가능한 그룹 선택
          }
        }

        if (targetGroupIdx !== null) {
          // 기존 그룹에 추가
          const group = groups[targetGroupIdx];
          group.cells.add(key);
          cellToGroup.set(key, targetGroupIdx);

          // 방향 결정 (그룹에 셀이 2개 이상이면)
          if (group.direction === 'undetermined' && group.cells.size >= 2) {
            group.direction = mergeDirection;
          }
        } else {
          // 새 그룹 생성
          const newGroup = { cells: new Set([key]), direction: 'undetermined' };
          const newIdx = groups.length;
          groups.push(newGroup);
          cellToGroup.set(key, newIdx);
        }
      });
    });

    // 결과 변환: Set<key> → Array<cell>
    return groups.map(g => {
      return Array.from(g.cells).map(key => cellMap.get(key)).filter(Boolean);
    }).filter(g => g.length > 0);
  }

  /**
   * 인접 셀 그룹화 (겹침 허용)
   * - savedAnimations 순서대로 처리
   * - 인접하고 방향 맞으면 기존 그룹에 추가
   * - 방향이 다르면 새 그룹 생성, 겹치는 셀도 포함
   * @returns {Array} 그룹 배열 [[cell1, cell2, ...], ...]
   */
  _groupAdjacentCellsWithOverlap() {
    const groups = [];

    this.savedAnimations.forEach((anim, idx) => {
      const targets = this._resolveAnimationTargets(anim);
      if (targets.length === 0) return;

      // 셀에 bounds 추가
      const cells = targets.map(t => {
        const bounds = this._getCellBounds(t.row, t.col);
        return bounds ? { row: t.row, col: t.col, bounds } : null;
      }).filter(Boolean);

      if (cells.length === 0) return;

      // 방향 추론
      let direction = 'undetermined';
      if (cells.length >= 2) {
        direction = cells[0].row === cells[1].row ? 'horizontal' : 'vertical';
      }

      // 인접한 기존 그룹 찾기 (방향 맞는 것만)
      let targetGroup = null;
      for (const group of groups) {
        // 둘 다 방향이 정해져 있고 다르면 스킵
        if (group.direction !== 'undetermined' && direction !== 'undetermined'
            && group.direction !== direction) {
          continue;
        }

        // 인접 여부 체크
        outer:
        for (const c1 of cells) {
          for (const c2 of group.cells) {
            const rowDiff = Math.abs(c1.row - c2.row);
            const colDiff = Math.abs(c1.col - c2.col);
            if ((rowDiff + colDiff) === 1) {
              const adjacencyDir = rowDiff === 0 ? 'horizontal' : 'vertical';

              // 그룹 방향이 정해져 있으면, 인접 방향이 그룹 방향과 맞아야 함
              if (group.direction !== 'undetermined' && adjacencyDir !== group.direction) {
                continue;
              }

              // 그룹 방향이 미정이면 인접 방향으로 설정
              if (group.direction === 'undetermined') {
                group.direction = adjacencyDir;
              }

              targetGroup = group;
              break outer;
            }
          }
        }
        if (targetGroup) break;
      }

      if (targetGroup) {
        // 기존 그룹에 추가 (중복 체크)
        cells.forEach(c => {
          if (!targetGroup.cells.some(tc => tc.row === c.row && tc.col === c.col)) {
            targetGroup.cells.push(c);
          }
        });
        if (targetGroup.direction === 'undetermined') targetGroup.direction = direction;

        // 다른 방향 그룹에도 인접하면 추가 (겹침 처리)
        for (const otherGroup of groups) {
          if (otherGroup === targetGroup) continue;
          if (otherGroup.direction === 'undetermined') continue;
          if (otherGroup.direction === targetGroup.direction) continue;

          cells.forEach(c => {
            // 이미 있으면 스킵
            if (otherGroup.cells.some(tc => tc.row === c.row && tc.col === c.col)) return;

            // 인접 여부 체크
            for (const oc of otherGroup.cells) {
              const rowDiff = Math.abs(c.row - oc.row);
              const colDiff = Math.abs(c.col - oc.col);
              if ((rowDiff + colDiff) === 1) {
                const adjacencyDir = rowDiff === 0 ? 'horizontal' : 'vertical';
                if (adjacencyDir === otherGroup.direction) {
                  otherGroup.cells.push({ ...c });
                  break;
                }
              }
            }
          });
        }
      } else {
        // 새 그룹 생성
        groups.push({ cells: [...cells], direction });
      }
    });

    return groups.map(g => g.cells);
  }

  /**
   * 셀 좌표로 bounds 가져오기
   * @param {number} row - 행 인덱스
   * @param {number} col - 열 인덱스
   * @returns {Object|null} {x, y, width, height}
   */
  _getCellBounds(row, col) {
    const prefix = this._getLayerIdPrefix();
    const rootLayer = this.layerManager.root;
    if (!rootLayer?.children[0]) {
      return null;
    }

    const tableLayer = rootLayer.children[0];
    const rowStructure = this._getTableRowStructure(tableLayer, prefix);
    const rowInfo = rowStructure[row];
    if (!rowInfo) {
      return null;
    }

    // 행 타입에 따른 셀 ID 생성 (기존 _applyAnimationToTargetCells와 동일한 로직)
    let layerId;
    if (rowInfo.type === 'header') {
      layerId = `${prefix}-table-header-col${col}`;
    } else if (rowInfo.type === 'summary') {
      layerId = `${prefix}-table-summary-col${col}`;
    } else {
      // 데이터 행: layerId에서 row 번호 추출
      const match = rowInfo.layerId.match(/row-(\d+)$/);
      const dataRowIdx = match ? match[1] : (row - 1);
      layerId = `${prefix}-table-row-${dataRowIdx}-col${col}`;
    }

    const cellLayer = this.layerManager.findLayer(layerId);
    if (!cellLayer) {
      return null;
    }

    // 레이어 데이터에서 위치 정보 가져오기
    const data = cellLayer.data;
    if (!data) {
      return null;
    }

    return { x: data.x, y: data.y, width: data.width, height: data.height };
  }

  /**
   * 병합된 셀 그룹 렌더링 (인접 셀 병합, 겹침 허용)
   * @param {number} progress - 애니메이션 진행도 (0~1)
   */
  _renderMergedAnimations(progress) {
    if (this.savedAnimations.length === 0) return;

    // 인접 셀 그룹화 (겹침 허용, 직접 bounds 수집)
    const allGroups = this._groupAdjacentCellsWithOverlap();
    if (allGroups.length === 0) return;

    // 색상: 그룹 1개면 초록색, 2개 이상이면 파랑/분홍/주황
    const colors = allGroups.length === 1
      ? ['#89EC4E']
      : ['#008aff', '#e749af', '#ff764f'];

    allGroups.forEach((group, groupIndex) => {
      const color = colors[groupIndex % colors.length];
      const fillAlpha = progress * 0.3;
      const strokeAlpha = progress;

      // hex to rgb 변환
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);

      const cellSet = new Set(group.map(c => `${c.row}-${c.col}`));

      this.ctx.save();

      // 1. 모든 셀에 fill
      this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${fillAlpha})`;
      group.forEach(c => {
        this.ctx.fillRect(c.bounds.x, c.bounds.y, c.bounds.width, c.bounds.height);
      });

      // 2. 외곽 변만 stroke (인접 셀과 공유하는 변은 제외)
      this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${strokeAlpha})`;
      this.ctx.lineWidth = 2;

      group.forEach(c => {
        const { x, y, width, height } = c.bounds;
        const hasTop = cellSet.has(`${c.row - 1}-${c.col}`);
        const hasBottom = cellSet.has(`${c.row + 1}-${c.col}`);
        const hasLeft = cellSet.has(`${c.row}-${c.col - 1}`);
        const hasRight = cellSet.has(`${c.row}-${c.col + 1}`);

        this.ctx.beginPath();
        if (!hasTop) { // 위쪽 변
          this.ctx.moveTo(x, y);
          this.ctx.lineTo(x + width, y);
        }
        if (!hasBottom) { // 아래쪽 변
          this.ctx.moveTo(x, y + height);
          this.ctx.lineTo(x + width, y + height);
        }
        if (!hasLeft) { // 왼쪽 변
          this.ctx.moveTo(x, y);
          this.ctx.lineTo(x, y + height);
        }
        if (!hasRight) { // 오른쪽 변
          this.ctx.moveTo(x + width, y);
          this.ctx.lineTo(x + width, y + height);
        }
        this.ctx.stroke();
      });

      this.ctx.restore();
    });
  }

  /**
   * LayerManager 접근자 (레이어 패널에서 사용)
   * @returns {LayerManager} 레이어 매니저
   */
  getLayerManager() {
    return this.layerManager;
  }

  /**
   * 특정 셀 레이어 찾기
   * @param {number} rowIndex - 행 인덱스
   * @param {number} colIndex - 열 인덱스
   * @returns {Layer|null} 셀 레이어
   */
  findCellLayer(rowIndex, colIndex) {
    const prefix = this._getLayerIdPrefix();
    return this.layerManager.findLayer(`${prefix}-table-row-${rowIndex}-col${colIndex}`);
  }

  /**
   * 행 레이어 찾기
   * @param {number} rowIndex - 행 인덱스
   * @returns {Layer|null} 행 레이어
   */
  findRowLayer(rowIndex) {
    const prefix = this._getLayerIdPrefix();
    return this.layerManager.findLayer(`${prefix}-table-row-${rowIndex}`);
  }

  /**
   * 데이터 없음 메시지
   */
  drawNoDataMessage() {
    this.canvas.width = CONFIG.TABLE_CANVAS_WIDTH;
    this.canvas.height = CONFIG.TABLE_EMPTY_CANVAS_HEIGHT;
    this.clear();

    this.ctx.fillStyle = CONFIG.getColor('--color-text-light');
    this.ctx.font = CONFIG.CHART_FONT_LARGE;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      CONFIG.TABLE_NO_DATA_MESSAGE,
      this.canvas.width / 2,
      this.canvas.height / 2
    );
  }

  // =============================================
  // 셀 변수 편집 모달 관련 메서드 (TableEditModal로 위임)
  // =============================================

  /**
   * 편집 모달 열기
   * @deprecated editModal.openEditModal() 사용
   */
  openEditModal() {
    this.editModal.openEditModal();
  }

  /**
   * 편집 모달 닫기
   * @deprecated editModal.closeEditModal() 사용
   */
  closeEditModal() {
    this.editModal.closeEditModal();
  }

  /**
   * 변경사항 저장
   * @deprecated editModal.saveChanges() 사용
   */
  saveChanges() {
    this.editModal.saveChanges();
  }

  /**
   * 모든 변수 초기화
   * @deprecated editModal.clearAllVariables() 사용
   */
  clearAllVariables() {
    this.editModal.clearAllVariables();
  }
}

/**
 * 산점도 렌더러
 * X-Y 좌표 데이터를 점으로 시각화
 */


class ScatterRenderer {
  /**
   * 산점도 렌더링
   * @param {HTMLCanvasElement} canvas - Canvas 요소
   * @param {Object} config - 설정 객체
   * @returns {Object} 렌더링 결과
   */
  static render(canvas, config) {
    const ctx = canvas.getContext('2d');
    const data = config.data; // [[x1, y1], [x2, y2], ...]
    const options = config.options || {};

    // 캔버스 크기 설정
    const width = config.canvasWidth || CONFIG.SCATTER_DEFAULT_WIDTH;
    const height = config.canvasHeight || CONFIG.SCATTER_DEFAULT_HEIGHT;
    canvas.width = width;
    canvas.height = height;

    // 캔버스 크기 설정 (폰트 스케일링용)
    CONFIG.setCanvasSize(Math.max(width, height));

    // 배경 투명 (클리어)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 데이터 검증
    if (!data || !Array.isArray(data) || data.length < 2) {
      this._drawNoDataMessage(ctx, canvas);
      return { error: '최소 2개의 데이터 포인트가 필요합니다.' };
    }

    // 데이터 범위 추출
    const range = this._extractRange(data);

    // 좌표계 생성
    const padding = CONFIG.getScaledValue(CONFIG.SCATTER_PADDING);
    const coords = this._createCoordinateSystem(canvas, padding, range);

    // 렌더링
    this._drawGrid(ctx, canvas, padding, coords, range);
    this._drawAxes(ctx, canvas, padding, coords, range, options.axisLabels);
    this._drawPoints(ctx, data, coords, options);

    return { success: true, coords, range, padding, canvasHeight: canvas.height };
  }

  /**
   * 데이터에서 범위 추출
   */
  static _extractRange(data) {
    const xValues = data.map(p => p[0]);
    const yValues = data.map(p => p[1]);

    const xDataMin = Math.min(...xValues);
    const xDataMax = Math.max(...xValues);
    const yDataMin = Math.min(...yValues);
    const yDataMax = Math.max(...yValues);

    // 데이터 범위 기반 깔끔한 간격 계산
    const xRange = xDataMax - xDataMin;
    const yRange = yDataMax - yDataMin;

    const xInterval = this._calculateNiceInterval(xRange);
    const yInterval = this._calculateNiceInterval(yRange);

    // 축 시작/끝을 간격의 배수로 맞춤
    const xMin = Math.floor(xDataMin / xInterval) * xInterval;
    const xMax = Math.ceil(xDataMax / xInterval) * xInterval;
    const yMin = Math.floor(yDataMin / yInterval) * yInterval;
    const yMax = Math.ceil(yDataMax / yInterval) * yInterval;

    return {
      xMin,
      xMax,
      yMin,
      yMax,
      xDataMin,
      xDataMax,
      yDataMin,
      yDataMax,
      xInterval,
      yInterval
    };
  }

  /**
   * 깔끔한 축 간격 계산 (1, 2, 5, 10, 20, 50, 100 등)
   */
  static _calculateNiceInterval(range) {
    if (range <= 0) return 1;

    // 대략 4~6개의 눈금을 목표로 함
    const roughInterval = range / 5;

    // 10의 거듭제곱 찾기
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughInterval)));

    // 깔끔한 간격 후보: 1, 2, 5, 10 배수
    const candidates = [1, 2, 5, 10];

    for (const c of candidates) {
      const interval = c * magnitude;
      if (interval >= roughInterval) {
        return interval;
      }
    }

    return 10 * magnitude;
  }

  /**
   * 좌표계 생성
   * 왼쪽/아래: 압축 구간 1칸, 오른쪽/위: 여유 공간 1칸
   */
  static _createCoordinateSystem(canvas, padding, range) {
    const chartW = canvas.width - padding * 2;
    const chartH = canvas.height - padding * 2;

    // 데이터 구간 수 계산
    const xDataCells = Math.round((range.xMax - range.xMin) / range.xInterval);
    const yDataCells = Math.round((range.yMax - range.yMin) / range.yInterval);

    // 전체 구간 수 = 압축(1) + 데이터 구간 + 여유(1)
    const xTotalCells = 1 + xDataCells + 1;
    const yTotalCells = 1 + yDataCells + 1;

    const xCellWidth = chartW / xTotalCells;
    const yCellHeight = chartH / yTotalCells;

    // X축 좌표 변환: 값 → 캔버스 x좌표
    // 압축 구간(1칸) 이후부터 데이터 시작
    const toX = (value) => {
      const dataOffset = (value - range.xMin) / range.xInterval;
      return padding + (1 + dataOffset) * xCellWidth;
    };

    // Y축 좌표 변환: 값 → 캔버스 y좌표 (위아래 반전)
    // 위쪽 여유 공간(1칸) 이후부터 데이터 시작
    const toY = (value) => {
      const dataOffset = (value - range.yMin) / range.yInterval;
      return canvas.height - padding - (1 + dataOffset) * yCellHeight;
    };

    return { toX, toY, chartW, chartH, xCellWidth, yCellHeight, xTotalCells, yTotalCells };
  }

  /**
   * 그리드 렌더링
   */
  static _drawGrid(ctx, canvas, padding, coords, range) {
    const { toX, toY, xCellWidth, yCellHeight, xTotalCells, yTotalCells } = coords;
    ctx.lineWidth = CONFIG.getScaledLineWidth('thin');

    // 가로 격자선 (Y축) - 모든 칸에 그리기
    ctx.strokeStyle = CONFIG.getColor('--color-grid-horizontal');
    for (let i = 1; i < yTotalCells; i++) {
      const y = canvas.height - padding - i * yCellHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }

    // 세로 격자선 (X축) - 모든 칸에 그리기
    ctx.strokeStyle = CONFIG.getColor('--color-grid-vertical');
    for (let i = 1; i < xTotalCells; i++) {
      const x = padding + i * xCellWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, canvas.height - padding);
      ctx.stroke();
    }

    // 축선 (사각형 테두리 - 하단, 좌측, 상단, 우측)
    ctx.strokeStyle = CONFIG.getColor('--color-axis');
    ctx.lineWidth = CONFIG.getScaledLineWidth('medium');

    // X축선 (하단)
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Y축선 (좌측)
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.stroke();

    // 상단 테두리
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(canvas.width - padding, padding);
    ctx.stroke();

    // 우측 테두리
    ctx.beginPath();
    ctx.moveTo(canvas.width - padding, padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // X축 압축 기호 (≈) - 축 위에 위치
    this._drawEllipsisSymbol(ctx, padding + xCellWidth / 2, canvas.height - padding, true);

    // Y축 압축 기호 (≈) - 축 위에 위치
    this._drawEllipsisSymbol(ctx, padding, canvas.height - padding - yCellHeight / 2, false);
  }

  /**
   * 압축 기호 (≈) 렌더링 - 축 위에 배치
   */
  static _drawEllipsisSymbol(ctx, x, y, isHorizontal) {
    ctx.save();
    // 산점도에서 중략 기호 크기 키움
    ctx.font = `400 ${CONFIG.getScaledFontSize(28)}px 'SCDream', sans-serif`;
    ctx.fillStyle = CONFIG.getColor('--color-ellipsis');
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    if (isHorizontal) {
      // X축용: 축 선 위에 90도 회전하여 수직으로 표시
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 2);
      ctx.fillText(CONFIG.AXIS_ELLIPSIS_SYMBOL, 0, 0);
    } else {
      // Y축용: 축 선 위에 수평으로 표시
      ctx.fillText(CONFIG.AXIS_ELLIPSIS_SYMBOL, x, y);
    }
    ctx.restore();
  }

  /**
   * 축 및 라벨 렌더링
   */
  static _drawAxes(ctx, canvas, padding, coords, range, axisLabels = {}) {
    const { toX, toY } = coords;
    const color = CONFIG.getColor('--color-text');
    // 숫자 라벨 크기 키움
    const fontSize = CONFIG.getScaledFontSize(25);

    // X축 라벨 - xMin부터 xMax + interval까지 (여유 칸 라벨 포함)
    const xLabelY = canvas.height - padding + CONFIG.getScaledValue(25);
    const xLabelMax = range.xMax + range.xInterval; // 여유 칸까지
    for (let value = range.xMin; value <= xLabelMax + 0.001; value += range.xInterval) {
      const x = toX(value);
      // 정수면 정수로, 소수면 소수로 표시
      const label = Number.isInteger(value) ? String(value) : value.toFixed(1);
      render$1(ctx, label, x, xLabelY, {
        fontSize, color, align: 'center', baseline: 'top'
      });
    }

    // Y축 라벨 - yMin부터 yMax + interval까지 (여유 칸 라벨 포함)
    const yLabelX = padding - CONFIG.getScaledValue(12);
    const yLabelMax = range.yMax + range.yInterval; // 여유 칸까지
    for (let value = range.yMin; value <= yLabelMax + 0.001; value += range.yInterval) {
      const y = toY(value);
      // 정수면 정수로, 소수면 소수로 표시
      const label = Number.isInteger(value) ? String(value) : value.toFixed(1);
      render$1(ctx, label, yLabelX, y, {
        fontSize, color, align: 'right', baseline: 'middle'
      });
    }

    // 축 제목
    const xTitle = axisLabels?.xAxis || '';
    const yTitle = axisLabels?.yAxis || '';

    // X축 제목: 오른쪽 끝, 숫자 라벨 아래로 더 내림
    if (xTitle) {
      renderMixedText(ctx, xTitle,
        canvas.width - padding,
        canvas.height - padding + CONFIG.getScaledValue(55),
        { fontSize: CONFIG.getScaledFontSize(18), color, align: 'right', baseline: 'top' }
      );
    }

    // Y축 제목: 상단
    if (yTitle) {
      renderMixedText(ctx, yTitle,
        padding,
        padding - CONFIG.getScaledValue(15),
        { fontSize: CONFIG.getScaledFontSize(18), color, align: 'left', baseline: 'bottom' }
      );
    }
  }

  /**
   * 데이터 점 렌더링
   */
  static _drawPoints(ctx, data, coords, options) {
    const { toX, toY } = coords;
    const pointSize = CONFIG.getScaledValue(options.pointSize || CONFIG.SCATTER_POINT_RADIUS);
    const pointColor = options.pointColor || CONFIG.SCATTER_POINT_COLOR;

    ctx.fillStyle = pointColor;

    data.forEach(([x, y]) => {
      const cx = toX(x);
      const cy = toY(y);

      ctx.beginPath();
      ctx.arc(cx, cy, pointSize, 0, Math.PI * 2);
      ctx.fill();

      // 테두리 (어둡게)
      ctx.strokeStyle = this._darkenColor(pointColor, 0.3);
      ctx.lineWidth = CONFIG.getScaledLineWidth('thin');
      ctx.stroke();
    });
  }

  /**
   * 색상을 어둡게
   */
  static _darkenColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - Math.round(255 * amount));
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - Math.round(255 * amount));
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - Math.round(255 * amount));
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * 데이터 없음 메시지
   */
  static _drawNoDataMessage(ctx, canvas) {
    ctx.fillStyle = CONFIG.getColor('--color-text');
    ctx.font = CONFIG.CHART_FONT_BOLD;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('데이터가 없습니다.', canvas.width / 2, canvas.height / 2);
  }

  /**
   * 데이터 유효성 검사
   * @param {Array} data - 데이터 배열
   * @returns {{ valid: boolean, error: string|null }}
   */
  static validate(data) {
    if (!data || !Array.isArray(data)) {
      return { valid: false, error: 'data는 배열이어야 합니다.' };
    }
    if (data.length < 2) {
      return { valid: false, error: '최소 2개의 데이터 포인트가 필요합니다.' };
    }
    for (let i = 0; i < data.length; i++) {
      const point = data[i];
      if (!Array.isArray(point) || point.length !== 2) {
        return { valid: false, error: `${i}번째 포인트는 [x, y] 형식이어야 합니다.` };
      }
      if (typeof point[0] !== 'number' || typeof point[1] !== 'number') {
        return { valid: false, error: `${i}번째 포인트의 x, y는 숫자여야 합니다.` };
      }
    }
    return { valid: true, error: null };
  }
}

/**
 * Corruption (찢김) 효과 유틸리티
 * 차트와 테이블에서 "일부가 찢어져 보이지 않는" 효과 구현
 */

// ==========================================
// Noise 함수
// ==========================================

/**
 * 간단한 Pseudo-random Noise
 */
function simpleNoise(x, seed = 0) {
  const n = Math.sin(x * 12.9898 + seed * 78.233) * 43758.5453;
  return (n - Math.floor(n)) * 2 - 1;
}

/**
 * Smoothstep 보간이 적용된 부드러운 Noise
 */
function smoothNoise(x, seed = 0) {
  const x0 = Math.floor(x);
  const x1 = x0 + 1;
  const t = x - x0;

  const n0 = simpleNoise(x0, seed);
  const n1 = simpleNoise(x1, seed);

  // Smoothstep 보간
  const st = t * t * (3 - 2 * t);
  return n0 + (n1 - n0) * st;
}

// ==========================================
// 찢김 경로 생성
// ==========================================

/**
 * 찢김 경로 생성
 * @param {number} startX - 시작 X
 * @param {number} startY - 시작 Y
 * @param {number} endX - 끝 X
 * @param {number} endY - 끝 Y
 * @param {number} complexity - 불규칙성 (0~1)
 * @param {number} seed - 랜덤 시드
 * @returns {Array} 경로 점 배열
 */
function generateTearPath(startX, startY, endX, endY, complexity = 0.7, seed = 42) {
  const points = [];
  const dx = endX - startX;
  const dy = endY - startY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const segments = Math.max(15, Math.floor(distance / 4));

  // 수직선인지 수평선인지 판단
  const isVertical = Math.abs(dx) < Math.abs(dy);
  const amplitude = complexity * 8; // 최대 8px 변위 (inset보다 작게)

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const baseX = startX + dx * t;
    const baseY = startY + dy * t;

    // 여러 주파수의 노이즈 합성 (Fractal Noise)
    let noise = 0;
    noise += smoothNoise(t * 8, seed) * 1.0;
    noise += smoothNoise(t * 16, seed + 1) * 0.5;
    noise += smoothNoise(t * 32, seed + 2) * 0.25;
    noise = noise / 1.75; // 정규화

    const offset = noise * amplitude;

    if (isVertical) {
      points.push({ x: baseX + offset, y: baseY });
    } else {
      points.push({ x: baseX, y: baseY + offset });
    }
  }

  return points;
}

// ==========================================
// 시각적 질감 효과
// ==========================================

/**
 * 종이 섬유 효과 렌더링
 */
function renderFibers(ctx, allEdges, options = {}) {
  const {
    fiberCount = 20,
    fiberLength = 10,
    color = 'rgba(180, 150, 100, 0.5)'
  } = options;

  // 모든 가장자리 점 합치기
  const allPoints = [...allEdges.top, ...allEdges.right, ...allEdges.bottom, ...allEdges.left];

  ctx.save();
  // 랜덤 시드 고정을 위한 간단한 방법
  let randIndex = 0;
  const pseudoRandom = () => {
    randIndex++;
    return (Math.sin(randIndex * 12.9898) * 43758.5453) % 1;
  };

  allPoints.forEach((point, i) => {
    if (pseudoRandom() > 0.25) return; // 25%만 섬유 그리기

    const angle = (pseudoRandom() - 0.5) * Math.PI; // -90도 ~ 90도
    const length = fiberLength * (0.4 + pseudoRandom() * 0.6);

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineTo(
      point.x + Math.cos(angle) * length,
      point.y + Math.sin(angle) * length
    );
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.3 + pseudoRandom() * 0.7;
    ctx.stroke();
  });
  ctx.restore();
}

// ==========================================
// 차트용 셀 파싱/변환
// ==========================================

/**
 * 차트 셀 범위 파싱 (x-y 형식)
 * 형식: "0-2, 1-2:2-4, 3-0:3-4"
 * - "0-2" → 단일 셀 (x=0, y=2)
 * - "1-2:2-4" → 범위 (x=1~2, y=2~4)
 * @param {string} input - 셀 범위 문자열
 * @returns {Array} [{x1, y1, x2, y2}, ...]
 */
function parseChartCells(input) {
  const ranges = [];
  const parts = input.split(',').map(s => s.trim()).filter(s => s);

  parts.forEach(part => {
    if (part.includes(':')) {
      // 범위: "1-2:2-4"
      const [start, end] = part.split(':').map(s => s.trim());
      const [x1, y1] = start.split('-').map(n => parseInt(n.trim()));
      const [x2, y2] = end.split('-').map(n => parseInt(n.trim()));
      if (!isNaN(x1) && !isNaN(y1) && !isNaN(x2) && !isNaN(y2)) {
        ranges.push({
          x1: Math.min(x1, x2),
          y1: Math.min(y1, y2),
          x2: Math.max(x1, x2),
          y2: Math.max(y1, y2)
        });
      }
    } else if (part.includes('-')) {
      // 단일 셀: "0-2"
      const [x, y] = part.split('-').map(n => parseInt(n.trim()));
      if (!isNaN(x) && !isNaN(y)) {
        ranges.push({ x1: x, y1: y, x2: x, y2: y });
      }
    }
  });

  return ranges;
}

/**
 * 셀 좌표 → 픽셀 좌표 변환
 * @param {number} cellX - X축 셀 인덱스 (막대 인덱스)
 * @param {number} cellY - Y축 셀 인덱스 (0=하단, gridDivisions-1=상단)
 * @param {Object} chartInfo - 차트 정보
 * @returns {{x, y, width, height}} 픽셀 좌표 및 크기
 */
function cellToPixel(cellX, cellY, chartInfo) {
  const { padding, barWidth, gap, chartHeight, gridDivisions, canvasHeight } = chartInfo;

  // X: 막대 시작 위치
  const pixelX = padding + (barWidth + gap) * cellX + gap / 2;

  // 셀 높이
  const cellHeight = chartHeight / gridDivisions;

  // Y: 아래에서부터 계산 (cellY=0이 하단)
  const pixelY = canvasHeight - padding - cellHeight * (cellY + 1);

  return {
    x: pixelX,
    y: pixelY,
    width: barWidth,
    height: cellHeight
  };
}

// ==========================================
// 테이블용 셀 파싱
// ==========================================

/**
 * 테이블 셀 범위 파싱
 * 형식: "row:2, col:1, 3-1, 2-1:2-3"
 * @param {string} input - 셀 범위 문자열
 * @param {number} totalRows - 총 행 수
 * @param {number} totalCols - 총 열 수
 * @returns {Array} [{rowStart, rowEnd, colStart, colEnd}, ...]
 */
function parseTableCells(input, totalRows, totalCols) {
  const ranges = [];
  const parts = input.split(',').map(s => s.trim()).filter(s => s);

  parts.forEach(part => {
    // row:N - 행 전체
    if (part.startsWith('row:')) {
      const row = parseInt(part.substring(4));
      if (!isNaN(row)) {
        ranges.push({ rowStart: row, rowEnd: row, colStart: 0, colEnd: totalCols - 1 });
      }
    }
    // col:N - 열 전체
    else if (part.startsWith('col:')) {
      const col = parseInt(part.substring(4));
      if (!isNaN(col)) {
        ranges.push({ rowStart: 0, rowEnd: totalRows - 1, colStart: col, colEnd: col });
      }
    }
    // R1-C1:R2-C2 - 범위
    else if (part.includes(':')) {
      const [start, end] = part.split(':');
      const [r1, c1] = start.split('-').map(n => parseInt(n));
      const [r2, c2] = end.split('-').map(n => parseInt(n));
      if (!isNaN(r1) && !isNaN(c1) && !isNaN(r2) && !isNaN(c2)) {
        ranges.push({
          rowStart: Math.min(r1, r2),
          rowEnd: Math.max(r1, r2),
          colStart: Math.min(c1, c2),
          colEnd: Math.max(c1, c2)
        });
      }
    }
    // R-C - 단일 셀
    else if (part.includes('-')) {
      const [row, col] = part.split('-').map(n => parseInt(n));
      if (!isNaN(row) && !isNaN(col)) {
        ranges.push({ rowStart: row, rowEnd: row, colStart: col, colEnd: col });
      }
    }
  });

  return ranges;
}

/**
 * 범위들을 셀 집합으로 변환
 * @param {Array} ranges - [{rowStart, rowEnd, colStart, colEnd}, ...]
 * @returns {Set} "row-col" 형태의 셀 키 집합
 */
function rangesToCellSet(ranges) {
  const cells = new Set();
  ranges.forEach(range => {
    for (let row = range.rowStart; row <= range.rowEnd; row++) {
      for (let col = range.colStart; col <= range.colEnd; col++) {
        cells.add(`${row}-${col}`);
      }
    }
  });
  return cells;
}

// ==========================================
// 차트 Corruption 효과
// ==========================================

/**
 * 차트 범위를 셀 집합으로 변환
 * @param {Array} ranges - [{x1, y1, x2, y2}, ...]
 * @returns {Set} "x-y" 형식의 셀 집합
 */
function chartRangesToCellSet(ranges) {
  const cells = new Set();
  ranges.forEach(range => {
    for (let x = range.x1; x <= range.x2; x++) {
      for (let y = range.y1; y <= range.y2; y++) {
        cells.add(`${x}-${y}`);
      }
    }
  });
  return cells;
}

/**
 * 차트에 corruption 효과 적용 (인접 셀 병합 지원)
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {Object} corruptionOptions - corruption 설정
 * @param {Object} chartInfo - 차트 정보 (좌표 변환용)
 */
function applyChartCorruption(ctx, corruptionOptions, chartInfo) {
  if (!corruptionOptions?.enabled || !corruptionOptions.cells) return;

  const cellsInput = Array.isArray(corruptionOptions.cells)
    ? corruptionOptions.cells.join(', ')
    : corruptionOptions.cells;

  const ranges = parseChartCells(cellsInput);
  if (ranges.length === 0) return;

  const style = corruptionOptions.style || {};
  const edgeComplexity = style.edgeComplexity || 0.7;
  const seed = style.seed || 42;
  const inset = 0;
  const overlap = 2;
  const maskAxisLabels = corruptionOptions.maskAxisLabels !== false;

  // 범위를 셀 집합으로 변환
  const cellSet = chartRangesToCellSet(ranges);

  // 축에 닿는 셀 확인 (maskAxisLabels용)
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  cellSet.forEach(key => {
    const [x, y] = key.split('-').map(Number);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  });
  const touchesYAxis = minX === 0;
  const touchesXAxis = minY === 0;
  const touchesTop = maxY >= (chartInfo.gridDivisions - 1);  // 차트 상단에 닿는지
  const touchesRight = chartInfo.barCount && maxX >= (chartInfo.barCount - 1);  // 차트 오른쪽 끝에 닿는지

  // 인접 여부 확인 헬퍼 (차트는 Y=0이 하단)
  const getAdjacency = (x, y) => ({
    hasTop: cellSet.has(`${x}-${y + 1}`),     // Y가 클수록 위
    hasBottom: cellSet.has(`${x}-${y - 1}`),  // Y가 작을수록 아래
    hasLeft: cellSet.has(`${x - 1}-${y}`),
    hasRight: cellSet.has(`${x + 1}-${y}`)
  });

  // 각 셀의 4변 경로를 미리 생성 (외곽은 찢김, 인접은 직선+오버랩)
  const cellEdges = new Map();
  const allEdgePoints = { top: [], right: [], bottom: [], left: [] };

  cellSet.forEach(key => {
    const [x, y] = key.split('-').map(Number);
    const cell = cellToPixel(x, y, chartInfo);
    const adj = getAdjacency(x, y);

    // 외곽: inset 적용, 인접: 오버랩 (셀 경계를 넘어감)
    let topY = adj.hasTop ? cell.y - overlap : cell.y + inset;
    let bottomY = adj.hasBottom ? cell.y + cell.height + overlap : cell.y + cell.height - inset;
    let leftX = adj.hasLeft ? cell.x - overlap : cell.x + inset;
    let rightX = adj.hasRight ? cell.x + cell.width + overlap : cell.x + cell.width - inset;

    // maskAxisLabels: 축 라벨까지 확장 (X축, Y축)
    if (maskAxisLabels) {
      if (touchesXAxis && y === minY && !adj.hasBottom) {
        // X축 라벨까지 확장 (아래로 30px)
        bottomY = cell.y + cell.height + 30;
      }
      if (touchesYAxis && x === minX && !adj.hasLeft) {
        // Y축 라벨까지 확장 (왼쪽으로)
        leftX = 5;
      }
    }

    // 차트 상단 찢김: maskAxisLabels와 관계없이 항상 차트 상단 테두리까지 확장
    if (touchesTop && y === maxY && !adj.hasTop) {
      topY = cell.y - 15;
    }

    // 차트 오른쪽 끝 찢김: maskAxisLabels와 관계없이 항상 차트 오른쪽 테두리까지 확장
    if (touchesRight && x === maxX && !adj.hasRight) {
      rightX = cell.x + cell.width + 15;
    }

    // 각 변의 경로 생성 (외곽은 찢김, 인접은 직선)
    const edges = {
      top: adj.hasTop
        ? [{ x: leftX, y: topY }, { x: rightX, y: topY }]
        : generateTearPath(leftX, topY, rightX, topY, edgeComplexity, seed + x * 100 + y),
      bottom: adj.hasBottom
        ? [{ x: rightX, y: bottomY }, { x: leftX, y: bottomY }]
        : generateTearPath(rightX, bottomY, leftX, bottomY, edgeComplexity, seed + x * 100 + y + 10),
      left: adj.hasLeft
        ? [{ x: leftX, y: bottomY }, { x: leftX, y: topY }]
        : generateTearPath(leftX, bottomY, leftX, topY, edgeComplexity, seed + x * 100 + y + 20),
      right: adj.hasRight
        ? [{ x: rightX, y: topY }, { x: rightX, y: bottomY }]
        : generateTearPath(rightX, topY, rightX, bottomY, edgeComplexity, seed + x * 100 + y + 30)
    };

    cellEdges.set(key, { cell, adj, edges });

    // 외곽 엣지 포인트 수집 (fiber용)
    if (!adj.hasTop) allEdgePoints.top.push(...edges.top);
    if (!adj.hasBottom) allEdgePoints.bottom.push(...edges.bottom);
    if (!adj.hasLeft) allEdgePoints.left.push(...edges.left);
    if (!adj.hasRight) allEdgePoints.right.push(...edges.right);
  });

  // 1단계: 마스킹 (각 셀을 찢김 경로로 마스킹)
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'rgba(0, 0, 0, 1)';

  cellSet.forEach(key => {
    const { edges } = cellEdges.get(key);

    ctx.beginPath();
    // top → right → bottom → left 순서로 경로 연결
    ctx.moveTo(edges.top[0].x, edges.top[0].y);
    edges.top.forEach(p => ctx.lineTo(p.x, p.y));
    edges.right.forEach(p => ctx.lineTo(p.x, p.y));
    edges.bottom.forEach(p => ctx.lineTo(p.x, p.y));
    edges.left.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fill();
  });

  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();

  // 2단계: 가장자리 색상 (외곽 면에만)
  if (style.edgeColorEnabled) {
    const edgeColor = style.edgeColor || 'rgba(160, 130, 80, 0.4)';

    ctx.save();
    ctx.strokeStyle = edgeColor;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    cellSet.forEach(key => {
      const { adj, edges } = cellEdges.get(key);

      if (!adj.hasTop && edges.top.length > 1) {
        ctx.beginPath();
        ctx.moveTo(edges.top[0].x, edges.top[0].y);
        edges.top.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
      if (!adj.hasBottom && edges.bottom.length > 1) {
        ctx.beginPath();
        ctx.moveTo(edges.bottom[0].x, edges.bottom[0].y);
        edges.bottom.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
      if (!adj.hasLeft && edges.left.length > 1) {
        ctx.beginPath();
        ctx.moveTo(edges.left[0].x, edges.left[0].y);
        edges.left.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
      if (!adj.hasRight && edges.right.length > 1) {
        ctx.beginPath();
        ctx.moveTo(edges.right[0].x, edges.right[0].y);
        edges.right.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
    });

    ctx.restore();
  }

  // 3단계: 종이 섬유 효과
  if (style.fiberEnabled) {
    const fiberColor = style.fiberColor || 'rgba(180, 150, 100, 0.5)';
    const fiberCount = style.fiberCount || 20;
    renderFibers(ctx, allEdgePoints, { fiberCount, color: fiberColor });
  }
}

// ==========================================
// 테이블 Corruption 효과 (셀 기반)
// ==========================================

/**
 * 테이블에 corruption 효과 적용
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {Object} corruptionOptions - corruption 설정 { enabled, cells, style }
 * @param {Object} tableInfo - 테이블 정보 { startX, startY, cellHeight, columnWidths, totalRows, totalCols, inset }
 */
function applyTableCorruption(ctx, corruptionOptions, tableInfo) {
  if (!corruptionOptions?.enabled || !corruptionOptions.cells) return;

  const cellsInput = Array.isArray(corruptionOptions.cells)
    ? corruptionOptions.cells.join(', ')
    : corruptionOptions.cells;

  const { totalRows, totalCols } = tableInfo;
  const ranges = parseTableCells(cellsInput, totalRows, totalCols);
  if (ranges.length === 0) return;

  // 범위를 셀 집합으로 변환
  const cellSet = rangesToCellSet(ranges);

  const style = corruptionOptions.style || {};
  const { startX, startY, cellHeight, columnWidths, rowHeights, cellWidth, inset = 3 } = tableInfo;
  const edgeComplexity = style.edgeComplexity || 0.7;
  const seed = style.seed || 42;

  // 셀 좌표 계산 헬퍼
  const getCellCoords = (row, col) => {
    let x, w;
    if (columnWidths && Array.isArray(columnWidths)) {
      x = startX + columnWidths.slice(0, col).reduce((sum, cw) => sum + cw, 0);
      w = columnWidths[col] || cellWidth;
    } else {
      x = startX + col * cellWidth;
      w = cellWidth;
    }
    // rowHeights가 있으면 각 행의 높이 합산, 없으면 균일 높이
    let y, h;
    if (rowHeights && Array.isArray(rowHeights)) {
      y = startY + rowHeights.slice(0, row).reduce((sum, rh) => sum + rh, 0);
      h = rowHeights[row] || cellHeight;
    } else {
      y = startY + row * cellHeight;
      h = cellHeight;
    }
    return { x, y, w, h };
  };

  // 인접 여부 확인 헬퍼
  const getAdjacency = (row, col) => ({
    hasTop: cellSet.has(`${row - 1}-${col}`),
    hasBottom: cellSet.has(`${row + 1}-${col}`),
    hasLeft: cellSet.has(`${row}-${col - 1}`),
    hasRight: cellSet.has(`${row}-${col + 1}`)
  });

  // 인접한 셀 사이의 경계선(grid line)도 마스킹하기 위해 약간 오버랩
  const overlap = 2;

  // 각 셀의 4변 경로를 미리 생성 (외곽은 찢김, 인접은 직선+오버랩)
  const cellEdges = new Map();
  const allEdgePoints = { top: [], right: [], bottom: [], left: [] };

  cellSet.forEach(key => {
    const [row, col] = key.split('-').map(Number);
    const { x, y, w, h } = getCellCoords(row, col);
    const adj = getAdjacency(row, col);

    // 외곽: inset 적용, 인접: 오버랩 (셀 경계를 넘어감)
    const topY = adj.hasTop ? y - overlap : y + inset;
    const bottomY = adj.hasBottom ? y + h + overlap : y + h - inset;
    const leftX = adj.hasLeft ? x - overlap : x + inset;
    const rightX = adj.hasRight ? x + w + overlap : x + w - inset;

    // 각 변의 경로 생성 (외곽은 찢김, 인접은 직선)
    const edges = {
      top: adj.hasTop
        ? [{ x: leftX, y: topY }, { x: rightX, y: topY }]
        : generateTearPath(leftX, topY, rightX, topY, edgeComplexity, seed + row * 100 + col),
      bottom: adj.hasBottom
        ? [{ x: rightX, y: bottomY }, { x: leftX, y: bottomY }]
        : generateTearPath(rightX, bottomY, leftX, bottomY, edgeComplexity, seed + row * 100 + col + 10),
      left: adj.hasLeft
        ? [{ x: leftX, y: bottomY }, { x: leftX, y: topY }]
        : generateTearPath(leftX, bottomY, leftX, topY, edgeComplexity, seed + row * 100 + col + 20),
      right: adj.hasRight
        ? [{ x: rightX, y: topY }, { x: rightX, y: bottomY }]
        : generateTearPath(rightX, topY, rightX, bottomY, edgeComplexity, seed + row * 100 + col + 30)
    };

    cellEdges.set(key, { adj, edges });

    // 외곽 엣지 포인트 수집 (fiber용)
    if (!adj.hasTop) allEdgePoints.top.push(...edges.top);
    if (!adj.hasBottom) allEdgePoints.bottom.push(...edges.bottom);
    if (!adj.hasLeft) allEdgePoints.left.push(...edges.left);
    if (!adj.hasRight) allEdgePoints.right.push(...edges.right);
  });

  // 1단계: 마스킹 (각 셀을 찢김 경로로 마스킹)
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'rgba(0, 0, 0, 1)';

  cellSet.forEach(key => {
    const { edges } = cellEdges.get(key);

    ctx.beginPath();
    // top → right → bottom → left 순서로 경로 연결
    ctx.moveTo(edges.top[0].x, edges.top[0].y);
    edges.top.forEach(p => ctx.lineTo(p.x, p.y));
    edges.right.forEach(p => ctx.lineTo(p.x, p.y));
    edges.bottom.forEach(p => ctx.lineTo(p.x, p.y));
    edges.left.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fill();
  });

  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();

  // 2단계: 가장자리 색상 (외곽 면에만)
  if (style.edgeColorEnabled) {
    const edgeColor = style.edgeColor || 'rgba(160, 130, 80, 0.4)';

    ctx.save();
    ctx.strokeStyle = edgeColor;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    cellSet.forEach(key => {
      const { adj, edges } = cellEdges.get(key);

      if (!adj.hasTop && edges.top.length > 1) {
        ctx.beginPath();
        ctx.moveTo(edges.top[0].x, edges.top[0].y);
        edges.top.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
      if (!adj.hasBottom && edges.bottom.length > 1) {
        ctx.beginPath();
        ctx.moveTo(edges.bottom[0].x, edges.bottom[0].y);
        edges.bottom.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
      if (!adj.hasLeft && edges.left.length > 1) {
        ctx.beginPath();
        ctx.moveTo(edges.left[0].x, edges.left[0].y);
        edges.left.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
      if (!adj.hasRight && edges.right.length > 1) {
        ctx.beginPath();
        ctx.moveTo(edges.right[0].x, edges.right[0].y);
        edges.right.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
    });

    ctx.restore();
  }

  // 3단계: 종이 섬유 효과 (fiberEnabled)
  if (style.fiberEnabled) {
    const fiberColor = style.fiberColor || 'rgba(180, 150, 100, 0.5)';
    const fiberCount = style.fiberCount || 20;
    renderFibers(ctx, allEdgePoints, { fiberCount, color: fiberColor });
  }
}

// ==========================================
// 산점도 Corruption 효과
// ==========================================

/**
 * 산점도 셀 좌표 → 픽셀 좌표 변환
 * @param {number} cellX - X 셀 인덱스 (0 = 압축 구간)
 * @param {number} cellY - Y 셀 인덱스 (0 = 압축 구간, 하단부터)
 * @param {Object} scatterInfo - 산점도 정보
 * @returns {{x, y, width, height}} 픽셀 좌표 및 크기
 */
function scatterCellToPixel(cellX, cellY, scatterInfo) {
  const { padding, xCellWidth, yCellHeight, canvasHeight } = scatterInfo;

  const pixelX = padding + cellX * xCellWidth;
  // Y축은 반전 (cellY=0이 하단)
  const pixelY = canvasHeight - padding - (cellY + 1) * yCellHeight;

  return {
    x: pixelX,
    y: pixelY,
    width: xCellWidth,
    height: yCellHeight
  };
}

/**
 * 산점도에 corruption 효과 적용
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {Object} corruptionOptions - corruption 설정
 * @param {Object} scatterInfo - 산점도 정보 (좌표 변환용)
 */
function applyScatterCorruption(ctx, corruptionOptions, scatterInfo) {
  if (!corruptionOptions?.enabled || !corruptionOptions.cells) return;

  const cellsInput = Array.isArray(corruptionOptions.cells)
    ? corruptionOptions.cells.join(', ')
    : corruptionOptions.cells;

  const ranges = parseChartCells(cellsInput);
  if (ranges.length === 0) return;

  const style = corruptionOptions.style || {};
  const edgeComplexity = style.edgeComplexity || 0.7;
  const seed = style.seed || 42;
  const inset = 0;
  const overlap = 2;

  // 범위를 셀 집합으로 변환
  const cellSet = chartRangesToCellSet(ranges);

  // 경계 셀 확인
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  cellSet.forEach(key => {
    const [x, y] = key.split('-').map(Number);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  });

  const touchesLeft = minX === 0;
  const touchesBottom = minY === 0;
  const touchesTop = maxY >= (scatterInfo.yTotalCells - 1);
  const touchesRight = maxX >= (scatterInfo.xTotalCells - 1);

  // 인접 여부 확인 헬퍼
  const getAdjacency = (x, y) => ({
    hasTop: cellSet.has(`${x}-${y + 1}`),
    hasBottom: cellSet.has(`${x}-${y - 1}`),
    hasLeft: cellSet.has(`${x - 1}-${y}`),
    hasRight: cellSet.has(`${x + 1}-${y}`)
  });

  // 각 셀의 4변 경로를 미리 생성
  const cellEdges = new Map();
  const allEdgePoints = { top: [], right: [], bottom: [], left: [] };

  cellSet.forEach(key => {
    const [x, y] = key.split('-').map(Number);
    const cell = scatterCellToPixel(x, y, scatterInfo);
    const adj = getAdjacency(x, y);

    // 외곽: inset 적용, 인접: 오버랩
    let topY = adj.hasTop ? cell.y - overlap : cell.y + inset;
    let bottomY = adj.hasBottom ? cell.y + cell.height + overlap : cell.y + cell.height - inset;
    let leftX = adj.hasLeft ? cell.x - overlap : cell.x + inset;
    let rightX = adj.hasRight ? cell.x + cell.width + overlap : cell.x + cell.width - inset;

    // 경계 확장 (축 라벨까지)
    if (touchesBottom && y === minY && !adj.hasBottom) {
      bottomY = cell.y + cell.height + 30;
    }
    if (touchesLeft && x === minX && !adj.hasLeft) {
      leftX = 5;
    }
    if (touchesTop && y === maxY && !adj.hasTop) {
      topY = cell.y - 15;
    }
    if (touchesRight && x === maxX && !adj.hasRight) {
      rightX = cell.x + cell.width + 15;
    }

    // 각 변의 경로 생성
    const edges = {
      top: adj.hasTop
        ? [{ x: leftX, y: topY }, { x: rightX, y: topY }]
        : generateTearPath(leftX, topY, rightX, topY, edgeComplexity, seed + x * 100 + y),
      bottom: adj.hasBottom
        ? [{ x: rightX, y: bottomY }, { x: leftX, y: bottomY }]
        : generateTearPath(rightX, bottomY, leftX, bottomY, edgeComplexity, seed + x * 100 + y + 10),
      left: adj.hasLeft
        ? [{ x: leftX, y: bottomY }, { x: leftX, y: topY }]
        : generateTearPath(leftX, bottomY, leftX, topY, edgeComplexity, seed + x * 100 + y + 20),
      right: adj.hasRight
        ? [{ x: rightX, y: topY }, { x: rightX, y: bottomY }]
        : generateTearPath(rightX, topY, rightX, bottomY, edgeComplexity, seed + x * 100 + y + 30)
    };

    cellEdges.set(key, { cell, adj, edges });

    // 외곽 엣지 포인트 수집
    if (!adj.hasTop) allEdgePoints.top.push(...edges.top);
    if (!adj.hasBottom) allEdgePoints.bottom.push(...edges.bottom);
    if (!adj.hasLeft) allEdgePoints.left.push(...edges.left);
    if (!adj.hasRight) allEdgePoints.right.push(...edges.right);
  });

  // 1단계: 마스킹
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'rgba(0, 0, 0, 1)';

  cellSet.forEach(key => {
    const { edges } = cellEdges.get(key);

    ctx.beginPath();
    ctx.moveTo(edges.top[0].x, edges.top[0].y);
    edges.top.forEach(p => ctx.lineTo(p.x, p.y));
    edges.right.forEach(p => ctx.lineTo(p.x, p.y));
    edges.bottom.forEach(p => ctx.lineTo(p.x, p.y));
    edges.left.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fill();
  });

  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();

  // 2단계: 가장자리 색상
  if (style.edgeColorEnabled) {
    const edgeColor = style.edgeColor || 'rgba(160, 130, 80, 0.4)';

    ctx.save();
    ctx.strokeStyle = edgeColor;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    cellSet.forEach(key => {
      const { adj, edges } = cellEdges.get(key);

      if (!adj.hasTop && edges.top.length > 1) {
        ctx.beginPath();
        ctx.moveTo(edges.top[0].x, edges.top[0].y);
        edges.top.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
      if (!adj.hasBottom && edges.bottom.length > 1) {
        ctx.beginPath();
        ctx.moveTo(edges.bottom[0].x, edges.bottom[0].y);
        edges.bottom.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
      if (!adj.hasLeft && edges.left.length > 1) {
        ctx.beginPath();
        ctx.moveTo(edges.left[0].x, edges.left[0].y);
        edges.left.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
      if (!adj.hasRight && edges.right.length > 1) {
        ctx.beginPath();
        ctx.moveTo(edges.right[0].x, edges.right[0].y);
        edges.right.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
    });

    ctx.restore();
  }

  // 3단계: 종이 섬유 효과
  if (style.fiberEnabled) {
    const fiberColor = style.fiberColor || 'rgba(180, 150, 100, 0.5)';
    const fiberCount = style.fiberCount || 20;
    renderFibers(ctx, allEdgePoints, { fiberCount, color: fiberColor });
  }
}

/**
 * 입력 검증 레이어
 */


/**
 * 표준화된 에러 코드
 */
const ERROR_CODES = {
  REQUIRED: 'REQUIRED',
  TYPE_ERROR: 'TYPE_ERROR',
  INVALID_FORMAT: 'INVALID_FORMAT',
  RANGE_ERROR: 'RANGE_ERROR',
  MIN_LENGTH: 'MIN_LENGTH',
  UNSUPPORTED_TYPE: 'UNSUPPORTED_TYPE',
  CUSTOM_RANGE_ERROR: 'CUSTOM_RANGE_ERROR'
};

/**
 * viz-api 설정 검증 클래스
 * 모든 검증을 중앙에서 처리하고 표준화된 에러 형식 반환
 *
 * @typedef {Object} ValidationError
 * @property {string} field - 에러 발생 필드
 * @property {string} code - 에러 코드 (ERROR_CODES)
 * @property {string} message - 사용자 친화적 메시지
 *
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - 검증 성공 여부
 * @property {any} data - 성공 시 파싱된 데이터
 * @property {ValidationError[]} errors - 에러 목록
 */
class ConfigValidator {
  /**
   * viz-api config 객체 전체 검증
   * @param {Object} config - viz-api 설정 객체
   * @param {'chart'|'table'|'scatter'} purpose - 렌더링 목적
   * @returns {ValidationResult}
   */
  static validate(config, purpose = 'chart') {
    const errors = [];
    let parsedData = null;

    // 1. config 객체 자체 검증
    if (!config || typeof config !== 'object') {
      this._addError(errors, 'config', ERROR_CODES.REQUIRED, 'config 객체가 필요합니다.');
      return { valid: false, data: null, errors };
    }

    // 2. 필수 필드 검증
    this._validateRequired(config, errors);

    // 조기 반환: 필수 필드 누락 시
    if (errors.length > 0) {
      return { valid: false, data: null, errors };
    }

    // 산점도는 별도 검증 로직
    if (purpose === 'scatter') {
      return this._validateScatter(config, errors);
    }

    // 2.5. 테이블 데이터인데 purpose가 chart인 경우 경고
    if (purpose === 'chart' && typeof config.data === 'string') {
      const tablePatterns = ['헤더:', '헤더 :', 'Header:', 'header:'];
      const looksLikeTable = tablePatterns.some(p => config.data.includes(p));
      if (looksLikeTable) {
        console.warn('[viz-api] 테이블 데이터 형식("헤더:")인데 purpose가 "chart"입니다. 테이블을 원하면 "purpose": "table"을 추가하세요.');
      }
    }

    // 3. 테이블 타입 검증
    // 차트는 tableType 무시하고 frequency 데이터로 처리
    const tableType = purpose === 'chart' ? 'frequency' : (config.tableType || 'basic-table');
    if (!this._isValidTableType(tableType)) {
      this._addError(
        errors,
        'tableType',
        ERROR_CODES.UNSUPPORTED_TYPE,
        `지원하지 않는 테이블 타입: ${tableType}`
      );
    }

    // 4. 데이터 파싱 및 검증
    const parseResult = this._validateAndParseData(config, tableType, errors);
    if (parseResult && parseResult.success) {
      parsedData = {
        tableType,
        rawData: parseResult.data,
        parseResult
      };
    }

    // 5. 계급 설정 검증 (차트인 경우)
    if (purpose === 'chart') {
      this._validateClassSettings(config, errors);
    }

    // 6. 커스텀 범위 검증
    if (config.classRange) {
      this._validateCustomRange(config.classRange, errors);
    }

    // 7. 옵션 검증
    if (config.options) {
      this._validateOptions(config.options, purpose, errors);
    }

    return {
      valid: errors.length === 0,
      data: errors.length === 0 ? parsedData : null,
      errors
    };
  }

  /**
   * 산점도 데이터 검증
   * @private
   */
  static _validateScatter(config, errors) {
    const data = config.data;

    // data가 2D 배열인지 검증
    if (!Array.isArray(data)) {
      this._addError(errors, 'data', ERROR_CODES.TYPE_ERROR, 'scatter data는 2D 배열이어야 합니다. 예: [[x1, y1], [x2, y2], ...]');
      return { valid: false, data: null, errors };
    }

    // 최소 2개 포인트 필요
    if (data.length < 2) {
      this._addError(errors, 'data', ERROR_CODES.MIN_LENGTH, '최소 2개의 데이터 포인트가 필요합니다.');
      return { valid: false, data: null, errors };
    }

    // 각 포인트가 [x, y] 형식인지 검증
    for (let i = 0; i < data.length; i++) {
      const point = data[i];
      if (!Array.isArray(point) || point.length !== 2) {
        this._addError(errors, 'data', ERROR_CODES.INVALID_FORMAT, `${i}번째 포인트는 [x, y] 형식이어야 합니다.`);
        return { valid: false, data: null, errors };
      }
      if (typeof point[0] !== 'number' || typeof point[1] !== 'number') {
        this._addError(errors, 'data', ERROR_CODES.TYPE_ERROR, `${i}번째 포인트의 x, y는 숫자여야 합니다.`);
        return { valid: false, data: null, errors };
      }
    }

    return {
      valid: true,
      data: { rawData: data },
      errors
    };
  }

  // =====================
  // 내부 검증 메서드들
  // =====================

  /**
   * 필수 필드 검증
   * @private
   */
  static _validateRequired(config, errors) {
    // datasets 배열이 있으면 data는 필수가 아님
    const hasDatasets = Array.isArray(config.datasets) && config.datasets.length > 0;
    if (!config.data && !hasDatasets) {
      this._addError(errors, 'data', ERROR_CODES.REQUIRED, 'data 필드는 필수입니다.');
    }
  }

  /**
   * 데이터 파싱 및 검증
   * @private
   */
  static _validateAndParseData(config, tableType, errors) {
    // datasets 배열이 있으면 data 검증 스킵
    const hasDatasets = Array.isArray(config.datasets) && config.datasets.length > 0;
    if (hasDatasets) {
      return { success: true, data: null };
    }

    // 데이터 문자열 변환 (배열 지원)
    const dataString = Array.isArray(config.data)
      ? config.data.join(', ')
      : config.data;

    // 빈 문자열 체크
    if (!dataString || (typeof dataString === 'string' && !dataString.trim())) {
      this._addError(errors, 'data', ERROR_CODES.REQUIRED, '데이터가 비어있습니다.');
      return null;
    }

    // 파서를 통한 검증
    const parseResult = ParserFactory.parse(tableType, dataString);

    if (!parseResult.success) {
      this._addError(
        errors,
        'data',
        ERROR_CODES.INVALID_FORMAT,
        parseResult.error || '데이터 형식이 올바르지 않습니다.'
      );
    }

    return parseResult;
  }

  /**
   * 계급 설정 검증 (도수분포표 전용)
   * @private
   */
  static _validateClassSettings(config, errors) {
    // classCount 검증
    if (config.classCount !== undefined && config.classCount !== null) {
      const count = config.classCount;

      if (!Number.isInteger(count)) {
        this._addError(
          errors,
          'classCount',
          ERROR_CODES.TYPE_ERROR,
          '계급 개수는 정수여야 합니다.'
        );
      } else if (count < CONFIG.MIN_CLASS_COUNT || count > CONFIG.MAX_CLASS_COUNT) {
        this._addError(
          errors,
          'classCount',
          ERROR_CODES.RANGE_ERROR,
          `계급 개수는 ${CONFIG.MIN_CLASS_COUNT}~${CONFIG.MAX_CLASS_COUNT} 사이여야 합니다.`
        );
      }
    }

    // classWidth 검증
    if (config.classWidth !== undefined && config.classWidth !== null && config.classWidth !== '') {
      const width = config.classWidth;

      if (isNaN(width) || width <= 0) {
        this._addError(
          errors,
          'classWidth',
          ERROR_CODES.RANGE_ERROR,
          '계급 간격은 0보다 큰 숫자여야 합니다.'
        );
      } else if (width < CONFIG.MIN_CLASS_WIDTH) {
        this._addError(
          errors,
          'classWidth',
          ERROR_CODES.RANGE_ERROR,
          `계급 간격은 최소 ${CONFIG.MIN_CLASS_WIDTH} 이상이어야 합니다.`
        );
      }
    }
  }

  /**
   * 커스텀 범위 검증
   * @private
   */
  static _validateCustomRange(range, errors) {
    const { firstStart, secondStart, lastEnd } = range;

    // 필수 필드 체크
    if (firstStart === undefined || secondStart === undefined || lastEnd === undefined) {
      this._addError(
        errors,
        'classRange',
        ERROR_CODES.REQUIRED,
        'classRange는 firstStart, secondStart, lastEnd가 모두 필요합니다.'
      );
      return;
    }

    // 논리적 순서 검증
    if (firstStart < 0) {
      this._addError(
        errors,
        'classRange.firstStart',
        ERROR_CODES.CUSTOM_RANGE_ERROR,
        '첫 계급의 시작값은 0 이상이어야 합니다.'
      );
    }

    if (secondStart <= firstStart) {
      this._addError(
        errors,
        'classRange.secondStart',
        ERROR_CODES.CUSTOM_RANGE_ERROR,
        '두 번째 계급의 시작값은 첫 계급의 시작값보다 커야 합니다.'
      );
    }

    if (lastEnd <= secondStart) {
      this._addError(
        errors,
        'classRange.lastEnd',
        ERROR_CODES.CUSTOM_RANGE_ERROR,
        '마지막 계급의 끝값은 두 번째 계급의 시작값보다 커야 합니다.'
      );
    }

    // 간격으로 나누어 떨어지는지 검증
    const classWidth = secondStart - firstStart;
    const totalRange = lastEnd - firstStart;
    if (classWidth > 0 && totalRange % classWidth !== 0) {
      this._addError(
        errors,
        'classRange',
        ERROR_CODES.CUSTOM_RANGE_ERROR,
        `전체 범위(${totalRange})가 간격(${classWidth})으로 나누어 떨어지지 않습니다.`
      );
    }
  }

  /**
   * 옵션 검증
   * @private
   */
  static _validateOptions(options, purpose, errors) {
    // cellAnimations 검증
    if (options.cellAnimations && !Array.isArray(options.cellAnimations)) {
      this._addError(
        errors,
        'options.cellAnimations',
        ERROR_CODES.TYPE_ERROR,
        'cellAnimations는 배열이어야 합니다.'
      );
    }

    // corruption 옵션 검증
    if (options.corruption?.enabled && !options.corruption.cells) {
      this._addError(
        errors,
        'options.corruption.cells',
        ERROR_CODES.REQUIRED,
        'corruption.enabled가 true일 때 cells는 필수입니다.'
      );
    }
  }

  // =====================
  // 헬퍼 메서드
  // =====================

  /**
   * 테이블 타입 유효성 확인
   * @private
   */
  static _isValidTableType(type) {
    return Object.values(CONFIG.TABLE_TYPES).includes(type);
  }

  /**
   * 에러 추가 헬퍼
   * @private
   */
  static _addError(errors, field, code, message) {
    errors.push({ field, code, message });
  }
}

/**
 * Visualization API
 * External API for creating charts and tables easily
 */


// Counter for unique ID generation
let chartInstanceCounter = 0;
let tableInstanceCounter = 0;

/**
 * Collect all configs that will render to the same canvas
 * (current element + all elements with data-viz-canvas pointing to current)
 * @param {string} containerId - Current container ID
 * @param {Object} currentConfig - Current config object
 * @returns {Array} Array of { config, classes, maxFrequency }
 */
function collectRelatedConfigs(containerId, currentConfig) {
  const results = [];

  // 1. Add current config
  const currentResult = analyzeConfig(currentConfig);
  if (currentResult) {
    results.push(currentResult);
  }

  // 2. Find all elements with data-viz-canvas pointing to this container
  const relatedElements = document.querySelectorAll(`[data-viz-canvas="${containerId}"]`);

  relatedElements.forEach(el => {
    const configStr = el.getAttribute('data-viz-config');
    if (!configStr) return;

    try {
      const config = JSON.parse(configStr);
      const result = analyzeConfig(config);
      if (result) {
        results.push(result);
      }
    } catch (e) {
      console.warn(`[viz-api] Failed to parse config for ${el.id}:`, e);
    }
  });

  return results;
}

/**
 * Analyze config to extract class count and max frequency
 * @param {Object} config - Configuration object
 * @returns {Object|null} { classCount, maxFrequency } or null
 */
function analyzeConfig(config) {
  if (!config || !config.data) return null;

  try {
    // Parse data
    const dataString = Array.isArray(config.data)
      ? config.data.join(', ')
      : config.data;
    const rawData = DataProcessor.parseInput(dataString);
    if (rawData.length === 0) return null;

    // Calculate stats and classes
    const stats = DataProcessor.calculateBasicStats(rawData);
    const classCount = config.classCount || 5;
    const classWidth = config.classWidth || null;
    const customRange = config.classRange || null;
    const { classes } = DataProcessor.createClasses(stats, classCount, classWidth, customRange);

    // Calculate frequencies
    DataProcessor.calculateFrequencies(rawData, classes);

    // Find max frequency
    const maxFrequency = Math.max(...classes.map(c => c.frequency));

    return {
      classCount: classes.length,
      maxFrequency,
      classes
    };
  } catch (e) {
    console.warn('[viz-api] Failed to analyze config:', e);
    return null;
  }
}

/**
 * Calculate unified values from all related configs
 * @param {Array} configs - Array from collectRelatedConfigs
 * @returns {Object} { unifiedMaxY, unifiedClassCount }
 */
function calculateUnifiedValues(configs) {
  if (!configs || configs.length === 0) {
    return { unifiedMaxY: null, unifiedClassCount: null };
  }

  const maxFrequency = Math.max(...configs.map(c => c.maxFrequency));
  const maxClassCount = Math.max(...configs.map(c => c.classCount));

  // Add some padding to maxY (round up to next integer + 1)
  const unifiedMaxY = Math.ceil(maxFrequency) + 1;
  const unifiedClassCount = maxClassCount;

  console.log(`[viz-api] Unified values calculated: maxY=${unifiedMaxY}, classCount=${unifiedClassCount}`);

  return { unifiedMaxY, unifiedClassCount };
}

/**
 * Parse CSS linear-gradient string to color stops
 * @param {string} gradientStr - CSS linear-gradient string
 * @returns {Object|null} { colors: [startColor, endColor], angle: number } or null if invalid
 * @example
 * parseLinearGradient('linear-gradient(180deg, #AEFF7E 0%, #68994C 100%)')
 * // returns { colors: ['#AEFF7E', '#68994C'], angle: 180 }
 */
function parseLinearGradient(gradientStr) {
  if (!gradientStr || typeof gradientStr !== 'string') return null;

  // Match linear-gradient pattern
  const match = gradientStr.match(/linear-gradient\s*\(\s*([^,]+)\s*,\s*(.+)\s*\)/i);
  if (!match) return null;

  const [, angleOrDirection, colorStops] = match;

  // Parse angle (180deg, to bottom, etc.)
  let angle = 180; // default: top to bottom
  if (angleOrDirection.includes('deg')) {
    angle = parseFloat(angleOrDirection);
  } else if (angleOrDirection.includes('to bottom')) {
    angle = 180;
  } else if (angleOrDirection.includes('to top')) {
    angle = 0;
  } else if (angleOrDirection.includes('to right')) {
    angle = 90;
  } else if (angleOrDirection.includes('to left')) {
    angle = 270;
  }

  // Parse color stops
  // Match: #hex, rgb(), rgba(), color names with optional percentage
  const colorPattern = /(#[0-9A-Fa-f]{3,8}|rgba?\s*\([^)]+\)|[a-zA-Z]+)\s*(\d+%)?/g;
  const colors = [];
  let colorMatch;

  while ((colorMatch = colorPattern.exec(colorStops)) !== null) {
    colors.push(colorMatch[1].trim());
  }

  if (colors.length < 2) return null;

  return {
    colors: [colors[0], colors[colors.length - 1]], // start and end colors
    angle
  };
}

/**
 * Apply custom colors from config to CONFIG object
 * @param {Object} options - Options object from config
 */
function applyCustomColors(options) {
  // Histogram colors
  if (options.histogramColor) {
    const hc = options.histogramColor;

    // Create custom preset
    const customHistogram = { ...CONFIG.HISTOGRAM_COLOR_PRESETS.default };

    if (typeof hc === 'string') {
      // Single color or gradient string
      const parsed = parseLinearGradient(hc);
      if (parsed) {
        customHistogram.fillStart = parsed.colors[0];
        customHistogram.fillEnd = parsed.colors[1];
        customHistogram.strokeStart = parsed.colors[0];
        customHistogram.strokeEnd = parsed.colors[1];
      } else {
        // Single color
        customHistogram.fillStart = hc;
        customHistogram.fillEnd = hc;
        customHistogram.strokeStart = hc;
        customHistogram.strokeEnd = hc;
      }
    } else if (typeof hc === 'object') {
      // Object with fill, stroke, and alpha
      if (hc.fill) {
        const parsed = parseLinearGradient(hc.fill);
        if (parsed) {
          customHistogram.fillStart = parsed.colors[0];
          customHistogram.fillEnd = parsed.colors[1];
        } else if (typeof hc.fill === 'string') {
          customHistogram.fillStart = hc.fill;
          customHistogram.fillEnd = hc.fill;
        }
      }
      if (hc.stroke) {
        const parsed = parseLinearGradient(hc.stroke);
        if (parsed) {
          customHistogram.strokeStart = parsed.colors[0];
          customHistogram.strokeEnd = parsed.colors[1];
        } else if (typeof hc.stroke === 'string') {
          customHistogram.strokeStart = hc.stroke;
          customHistogram.strokeEnd = hc.stroke;
        }
      }
      // Alpha (opacity) support
      if (hc.alpha !== undefined) {
        customHistogram.alpha = hc.alpha;
      }
    }

    // Register custom preset and use it
    CONFIG.HISTOGRAM_COLOR_PRESETS.custom = customHistogram;
    CONFIG.HISTOGRAM_COLOR_PRESET = 'custom';
  }

  // Polygon colors
  if (options.polygonColor) {
    const pc = options.polygonColor;

    // Create custom preset
    const customPolygon = { ...CONFIG.POLYGON_COLOR_PRESETS.default };

    if (typeof pc === 'string') {
      // Single color or gradient string
      const parsed = parseLinearGradient(pc);
      if (parsed) {
        customPolygon.gradientStart = parsed.colors[0];
        customPolygon.gradientEnd = parsed.colors[1];
        customPolygon.pointColor = parsed.colors[0];
      } else {
        customPolygon.gradientStart = pc;
        customPolygon.gradientEnd = pc;
        customPolygon.pointColor = pc;
      }
    } else if (typeof pc === 'object') {
      // Object with line and point
      if (pc.line) {
        const parsed = parseLinearGradient(pc.line);
        if (parsed) {
          customPolygon.gradientStart = parsed.colors[0];
          customPolygon.gradientEnd = parsed.colors[1];
        } else if (typeof pc.line === 'string') {
          customPolygon.gradientStart = pc.line;
          customPolygon.gradientEnd = pc.line;
        }
      }
      if (pc.point) {
        customPolygon.pointColor = pc.point;
      }
    }

    // Register custom preset and use it
    CONFIG.POLYGON_COLOR_PRESETS.custom = customPolygon;
    CONFIG.POLYGON_COLOR_PRESET = 'custom';
  }
}

/**
 * Main Rendering API
 * @param {HTMLElement} element - Container element to append canvas
 * @param {Object} config - Configuration object
 * @param {string} [config.purpose='chart'] - Rendering purpose ('chart' | 'table')
 * @param {string} config.data - Raw data string (comma/space separated)
 * @param {Array} [config.datasets] - Multiple datasets for overlay rendering
 * @param {number} [config.classCount=5] - Number of classes
 * @param {number} [config.classWidth] - Class width (auto-calculated if not specified)
 * @param {Object} [config.options] - Additional options
 * @returns {Promise<Object>} Renderer result or { error }
 */
async function render(element, config) {
  // Wait for KaTeX fonts to load
  await waitForFonts();

  const purpose = config.purpose || 'chart';

  if (purpose === 'chart') {
    // datasets 배열이 있으면 복수 도수다각형 렌더링
    if (Array.isArray(config.datasets) && config.datasets.length > 0) {
      return renderMultiplePolygons(element, config);
    }
    return renderChart(element, config);
  } else if (purpose === 'table') {
    return renderTable(element, config);
  } else if (purpose === 'scatter') {
    return renderScatter(element, config);
  } else {
    return { error: `Invalid purpose: ${purpose}. Use 'chart', 'table', or 'scatter'.` };
  }
}

/**
 * Chart Rendering API
 * @param {HTMLElement} element - Container element to append canvas
 * @param {Object} config - Configuration object
 * @param {string} [config.tableType] - Table type (ignored for chart, used internally)
 * @param {string} config.data - Raw data string (comma/space separated)
 * @param {number} [config.classCount=5] - Number of classes (for frequency table)
 * @param {number} [config.classWidth] - Class width (auto-calculated if not specified)
 * @param {Object} [config.classRange] - Custom class range (overrides classCount/classWidth)
 * @param {number} config.classRange.firstStart - First class start value (e.g., 12 for 12~14)
 * @param {number} config.classRange.secondStart - Second class start value (determines interval)
 * @param {number} config.classRange.lastEnd - Last class end value
 * @param {Object} [config.options] - Additional options
 * @param {Object} [config.options.axisLabels] - Axis labels { xAxis, yAxis }
 * @param {string} [config.options.dataType='relativeFrequency'] - Data type ('frequency' | 'relativeFrequency')
 * @param {boolean} [config.options.showHistogram=true] - Show histogram bars
 * @param {boolean} [config.options.showPolygon=true] - Show frequency polygon
 * @param {boolean} [config.options.animation=true] - Enable animation
 * @param {Object} [config.options.callout] - Callout (label) settings
 * @param {boolean} [config.options.callout.enabled=false] - Enable callout on highest point
 * @param {string} [config.options.callout.template] - Template string (e.g., '{min}~{max}\n{frequency}')
 * @param {string} [config.options.callout.preset='default'] - Color preset ('default'|'primary'|'secondary'|'tertiary')
 * @returns {Promise<Object>} { chartRenderer, canvas, classes } or { error }
 */

async function renderChart(element, config) {
  try {
    // Wait for KaTeX fonts to load
    await waitForFonts();

    // 1. Element validation
    if (!element || !(element instanceof HTMLElement)) {
      return {
        error: 'element must be a valid HTMLElement',
        errors: [{ field: 'element', code: 'TYPE_ERROR', message: 'element must be a valid HTMLElement' }]
      };
    }

    // datasets 배열이 있으면 복수 도수다각형 렌더링
    if (Array.isArray(config.datasets) && config.datasets.length > 0) {
      return renderMultiplePolygons(element, config);
    }

    // 2. Config validation (ConfigValidator 중앙 집중 검증)
    const validation = ConfigValidator.validate(config, 'chart');
    if (!validation.valid) {
      return {
        error: validation.errors[0]?.message || 'Validation failed',
        errors: validation.errors
      };
    }

    // 검증 통과 시 파싱된 데이터 사용
    const { tableType, rawData } = validation.data;

    // 3. Calculate statistics
    const stats = DataProcessor.calculateBasicStats(rawData);

    // 4. Create classes (support custom range)
    const classCount = config.classCount || 5;
    const classWidth = config.classWidth || null;
    const customRange = config.classRange || null;
    const { classes, classInterval } = DataProcessor.createClasses(stats, classCount, classWidth, customRange);

    // 5. Calculate frequencies
    DataProcessor.calculateFrequencies(rawData, classes);

    // 6. Generate ellipsis info
    const ellipsisInfo = DataProcessor.shouldShowEllipsis(classes);

    // 7. data-viz-canvas 속성으로 타겟 캔버스 확인
    const canvasContainerId = element.getAttribute('data-viz-canvas');
    let targetContainer = element;
    let isAdditionalRender = false;

    if (canvasContainerId) {
      const existingContainer = document.getElementById(canvasContainerId);
      if (existingContainer) {
        targetContainer = existingContainer;
        isAdditionalRender = true;
        console.log(`[viz-api] data-viz-canvas 발견: ${element.id} → ${canvasContainerId}`);
      } else {
        console.warn(`[viz-api] data-viz-canvas 대상을 찾을 수 없음: ${canvasContainerId}, 기본 컨테이너 사용`);
      }
    }

    // 8. 캔버스 생성 또는 재사용
    let canvas, canvasId, chartRenderer;

    if (isAdditionalRender) {
      // 기존 캔버스 및 ChartRenderer 인스턴스 재사용
      canvas = targetContainer.querySelector('canvas');
      if (!canvas) {
        return { error: `No canvas found in target container: ${canvasContainerId}` };
      }
      canvasId = canvas.id;

      // 기존 ChartRenderer 인스턴스 재사용 (레이어/애니메이션 유지)
      if (canvas.__chartRenderer) {
        chartRenderer = canvas.__chartRenderer;
        console.log(`[viz-api] 기존 ChartRenderer 재사용: ${canvasId}`);
      } else {
        // 인스턴스가 없으면 새로 생성 (fallback)
        chartRenderer = new ChartRenderer(canvasId);
        canvas.__chartRenderer = chartRenderer;
        console.warn(`[viz-api] ChartRenderer 인스턴스가 없어 새로 생성: ${canvasId}`);
      }
    } else {
      // 새 캔버스 생성
      canvasId = `viz-chart-${++chartInstanceCounter}`;
      canvas = document.createElement('canvas');
      canvas.id = canvasId;
      // canvasSize는 정사각형 단축 옵션, canvasWidth/canvasHeight는 개별 설정
      if (config.canvasSize) {
        canvas.width = config.canvasSize;
        canvas.height = config.canvasSize;
      } else {
        canvas.width = config.canvasWidth || CONFIG.CANVAS_WIDTH;
        canvas.height = config.canvasHeight || CONFIG.CANVAS_HEIGHT;
      }

      // 차트 폰트 스케일링을 위한 캔버스 크기 설정
      CONFIG.setCanvasSize(Math.max(canvas.width, canvas.height));

      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', 'Frequency histogram and relative frequency polygon');
      element.appendChild(canvas);
      chartRenderer = new ChartRenderer(canvasId);

      // ChartRenderer 인스턴스를 캔버스에 저장 (추가 렌더링 시 재사용)
      canvas.__chartRenderer = chartRenderer;

      // 통합 좌표 시스템 자동 계산 (복수 도수다각형 지원)
      // 현재 컨테이너를 참조하는 모든 config 수집 및 분석
      const relatedConfigs = collectRelatedConfigs(element.id, config);
      if (relatedConfigs.length > 1) {
        const { unifiedMaxY, unifiedClassCount } = calculateUnifiedValues(relatedConfigs);
        canvas.__unifiedMaxY = unifiedMaxY;
        canvas.__unifiedClassCount = unifiedClassCount;
        console.log(`[viz-api] 복수 도수다각형 감지: ${relatedConfigs.length}개, 통합 값 저장됨`);
      }
    }

    // Process options (support both config.animation object and options.animation boolean)
    const options = config.options || {};
    const axisLabels = options.axisLabels || null;
    // Support both camelCase and lowercase for dataType
    const dataType = options.dataType || options.datatype || 'relativeFrequency';
    const animationConfig = config.animation !== undefined ? config.animation : options.animation;
    const animation = typeof animationConfig === 'object'
      ? animationConfig.enabled !== false
      : animationConfig !== false;

    // Show/hide histogram and polygon
    const showHistogram = options.showHistogram !== false;
    const showPolygon = options.showPolygon !== false;
    CONFIG.SHOW_HISTOGRAM = showHistogram;
    CONFIG.SHOW_POLYGON = showPolygon;

    // Dashed lines (vertical lines from polygon points to x-axis)
    CONFIG.SHOW_DASHED_LINES = options.showDashedLines || false;

    // Grid settings
    const gridOptions = options.grid || {};
    CONFIG.GRID_SHOW_HORIZONTAL = gridOptions.showHorizontal !== false;
    CONFIG.GRID_SHOW_VERTICAL = gridOptions.showVertical !== false;

    // Axis label visibility settings
    const axisOptions = options.axis || {};
    CONFIG.AXIS_SHOW_Y_LABELS = axisOptions.showYLabels !== false;
    CONFIG.AXIS_SHOW_X_LABELS = axisOptions.showXLabels !== false;
    if (axisOptions.yLabelFormat) {
      CONFIG.AXIS_Y_LABEL_FORMAT = axisOptions.yLabelFormat;
    }

    // Congruent triangles settings
    const triangleOptions = options.congruentTriangles || {};
    CONFIG.SHOW_CONGRUENT_TRIANGLES = triangleOptions.enabled || false;
    if (triangleOptions.boundary !== undefined && triangleOptions.boundary !== null) {
      // 경계값 → 인덱스 변환
      for (let j = 0; j < classes.length; j++) {
        if (classes[j].max === triangleOptions.boundary) {
          CONFIG.CONGRUENT_TRIANGLE_INDEX = j;
          break;
        }
      }
    }

    // Color presets (support both camelCase and lowercase)
    const histogramColorPreset = options.histogramColorPreset || options.histogramcolorpreset || 'default';
    const polygonColorPreset = options.polygonColorPreset || options.polygoncolorpreset || 'default';
    CONFIG.HISTOGRAM_COLOR_PRESET = histogramColorPreset;
    CONFIG.POLYGON_COLOR_PRESET = polygonColorPreset;

    // Apply custom colors (overrides presets if specified)
    applyCustomColors(options);

    // Callout options
    const calloutOptions = options.callout || {};
    const calloutEnabled = calloutOptions.enabled || false;
    const calloutTemplate = calloutEnabled
      ? (calloutOptions.template || CONFIG.CALLOUT_TEMPLATE)
      : null;
    const calloutPreset = calloutOptions.preset || 'default';

    // Apply callout preset to polygon color (callout uses polygon preset colors)
    if (calloutEnabled && calloutPreset !== 'default') {
      CONFIG.POLYGON_COLOR_PRESET = calloutPreset;
    }

    // Custom bar labels (막대 내부 커스텀 라벨)
    // 배열 형식: ["A", null, "B"] - null은 해당 막대 스킵
    const customBarLabels = options.customBarLabels;
    if (Array.isArray(customBarLabels) && customBarLabels.length > 0) {
      CONFIG.SHOW_BAR_CUSTOM_LABELS = true;
      CONFIG.BAR_CUSTOM_LABELS = {};
      customBarLabels.forEach((label, idx) => {
        if (label !== null && label !== undefined) {
          CONFIG.BAR_CUSTOM_LABELS[idx] = label;
        }
      });
    } else {
      CONFIG.SHOW_BAR_CUSTOM_LABELS = false;
      CONFIG.BAR_CUSTOM_LABELS = {};
    }

    // Y축 간격 커스텀 설정
    const customYInterval = options.customYInterval || null;

    // 다각형 숨김 옵션 (점/선)
    const polygonOptions = options.polygon || {};
    const hiddenPolygonIndices = polygonOptions.hidden || [];

    if (!animation) {
      chartRenderer.disableAnimation();
    }

    // 9. Draw chart
    // 통합 좌표 시스템 값 (config 지정 > 캔버스 저장 값 > null)
    const unifiedMaxY = config.unifiedMaxY || canvas.__unifiedMaxY || null;
    const unifiedClassCount = config.unifiedClassCount || canvas.__unifiedClassCount || null;
    const clearCanvas = !isAdditionalRender;  // 추가 렌더링이면 캔버스 지우지 않음

    // 추가 렌더링 시: 기존 타임라인 끝 시점 저장 (새 애니메이션 시작 시점)
    const previousDuration = isAdditionalRender ? chartRenderer.timeline.duration : 0;

    chartRenderer.draw(
      classes,
      axisLabels,
      ellipsisInfo,
      dataType,
      null,
      calloutTemplate,
      clearCanvas,
      unifiedMaxY,
      unifiedClassCount,
      customYInterval,
      hiddenPolygonIndices
    );

    // 10. Apply corruption effect (if enabled)
    if (options.corruption?.enabled) {
      const coords = chartRenderer.currentCoords;
      const chartInfo = {
        padding: chartRenderer.padding,
        barWidth: coords.xScale,
        gap: 0,
        chartHeight: coords.chartH,
        gridDivisions: coords.gridDivisions,
        canvasHeight: canvas.height,
        barCount: classes.length
      };
      applyChartCorruption(chartRenderer.ctx, options.corruption, chartInfo);
    }

    // 11. Play animation
    if (animation) {
      // 추가 렌더링: 새 애니메이션 시작 시점으로 seek (기존 레이어는 완료 상태 유지)
      // 첫 렌더링: 처음부터 재생
      chartRenderer.timeline.seekTo(previousDuration);
      chartRenderer.playAnimation();
    }

    // 11. Return result
    return {
      chartRenderer,
      canvas,
      classes,
      stats,
      classInterval
    };

  } catch (error) {
    console.error('renderChart error:', error);
    return { error: error.message };
  }
}

/**
 * Table Rendering API
 * @param {HTMLElement} element - Container element to append canvas
 * @param {Object} config - Configuration object
 * @param {string} [config.tableType='basic-table'] - Table type
 *   ('basic-table' | 'category-matrix' | 'stem-leaf')
 * @param {string} config.data - Raw data string (format depends on tableType)
 * @param {Array<Object>} [config.cellVariables] - Cell variable replacements
 * @param {Object} [config.options] - Additional options
 * @param {boolean} [config.options.animation=true] - Enable animation
 * @param {boolean} [config.options.showTotal=true] - Show total row (basic-table only)
 * @param {boolean} [config.options.showMergedHeader=true] - Show merged header (basic-table only)
 * @returns {Promise<Object>} { tableRenderer, canvas, parsedData? } or { error }
 */
async function renderTable(element, config) {
  try {
    // Wait for KaTeX fonts to load
    await waitForFonts();

    // 1. Element validation
    if (!element || !(element instanceof HTMLElement)) {
      return {
        error: 'element must be a valid HTMLElement',
        errors: [{ field: 'element', code: 'TYPE_ERROR', message: 'element must be a valid HTMLElement' }]
      };
    }

    // 2. Config validation (ConfigValidator 중앙 집중 검증)
    const validation = ConfigValidator.validate(config, 'table');
    if (!validation.valid) {
      return {
        error: validation.errors[0]?.message || 'Validation failed',
        errors: validation.errors
      };
    }

    // 검증 통과 시 파싱된 데이터 사용
    const { tableType, rawData, parseResult } = validation.data;
    const options = config.options || {};

    // 3. Parse data (support both array and string format)
    const dataString = Array.isArray(config.data)
      ? config.data.join(', ')
      : config.data;

    // 4. Create canvas element
    const canvasId = `viz-table-${++tableInstanceCounter}`;
    const canvas = document.createElement('canvas');
    canvas.id = canvasId;
    canvas.width = config.canvasWidth || CONFIG.TABLE_DEFAULT_WIDTH || 600;
    canvas.height = config.canvasHeight || CONFIG.TABLE_DEFAULT_HEIGHT || 400;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Data table');

    element.appendChild(canvas);

    // 5. Create TableRenderer
    const tableRenderer = new TableRenderer(canvasId);

    // 테이블 설정 구성
    const tableConfig = {
      canvasWidth: config.canvasWidth,
      canvasHeight: config.canvasHeight
    };
    const animationConfig = config.animation !== undefined ? config.animation : options.animation;
    const animation = typeof animationConfig === 'object'
      ? animationConfig.enabled !== false
      : animationConfig !== false;

    if (!animation) {
      tableRenderer.animationMode = false;
    }

    // 6. parseResult는 validator에서 이미 파싱됨 (validation.data.parseResult)

    // Apply basic-table specific options (평탄화된 구조)
    if (tableType === 'basic-table') {
      if (options.showTotal !== undefined) {
        parseResult.data.showTotal = options.showTotal;
      }
      if (options.showMergedHeader !== undefined) {
        parseResult.data.showMergedHeader = options.showMergedHeader;
      }
    }

    // Apply cell variables if specified
    let finalParseResult = parseResult;
    if (config.cellVariables && Array.isArray(config.cellVariables)) {
      finalParseResult = applyCellVariablesGeneric(config.cellVariables, parseResult, tableType);
    }

    // ParserAdapter로 통일된 형식 생성 (팩토리에서 활용 가능)
    let adaptedData = null;
    try {
      adaptedData = ParserAdapter.adapt(tableType, finalParseResult);
    } catch (e) {
      // ParserAdapter 실패 시 기존 방식으로 fallback
      console.warn('[viz-api] ParserAdapter 변환 실패, 기존 방식 사용:', e.message);
    }

    // tableConfig에 adaptedData 포함 (팩토리에서 rowCount, columnCount 등 활용)
    const enhancedTableConfig = {
      ...tableConfig,
      adaptedData
    };

    tableRenderer.drawCustomTable(tableType, finalParseResult.data, enhancedTableConfig);

    // Apply cell animations if specified
    applyCellAnimationsFromConfig(tableRenderer, config);

    // Apply corruption effect (if enabled)
    if (options.corruption?.enabled) {
      const scale = tableRenderer.scaleRatio || 1;
      // 테이블 렌더러에서 실제 계산된 columnWidths와 rowHeights 가져오기
      const actualTableInfo = getActualTableInfo(tableRenderer, tableType, finalParseResult.data, canvas, scale);
      if (actualTableInfo) {
        applyTableCorruption(tableRenderer.ctx, options.corruption, actualTableInfo);
      }
    }

    return {
      tableRenderer,
      canvas,
      parsedData: parseResult.data
    };

  } catch (error) {
    console.error('renderTable error:', error);
    return { error: error.message };
  }
}

/**
 * Scatter Plot Rendering API
 * @param {HTMLElement} element - Container element to append canvas
 * @param {Object} config - Configuration object
 * @param {Array<Array<number>>} config.data - Data points [[x1, y1], [x2, y2], ...]
 * @param {number} [config.canvasWidth=600] - Canvas width
 * @param {number} [config.canvasHeight=600] - Canvas height
 * @param {Object} [config.options] - Additional options
 * @param {Object} [config.options.axisLabels] - Axis labels { xAxis, yAxis }
 * @param {number} [config.options.pointSize=6] - Point radius
 * @param {string} [config.options.pointColor='#93DA6A'] - Point color
 * @returns {Promise<Object>} { canvas, coords, range } or { error }
 */
async function renderScatter(element, config) {
  try {
    // Wait for KaTeX fonts to load
    await waitForFonts();

    // 1. Element validation
    if (!element || !(element instanceof HTMLElement)) {
      return {
        error: 'element must be a valid HTMLElement',
        errors: [{ field: 'element', code: 'TYPE_ERROR', message: 'element must be a valid HTMLElement' }]
      };
    }

    // 2. Data validation
    const validation = ScatterRenderer.validate(config.data);
    if (!validation.valid) {
      return {
        error: validation.error,
        errors: [{ field: 'data', code: 'VALIDATION_ERROR', message: validation.error }]
      };
    }

    // 3. Create canvas
    const canvas = document.createElement('canvas');
    element.appendChild(canvas);

    // 4. Render scatter plot
    const result = ScatterRenderer.render(canvas, config);

    if (result.error) {
      return { error: result.error };
    }

    // 5. Apply corruption effect
    const options = config.options || {};
    if (options.corruption?.enabled) {
      const ctx = canvas.getContext('2d');
      const scatterInfo = {
        padding: result.padding,
        xCellWidth: result.coords.xCellWidth,
        yCellHeight: result.coords.yCellHeight,
        xTotalCells: result.coords.xTotalCells,
        yTotalCells: result.coords.yTotalCells,
        canvasHeight: result.canvasHeight
      };
      applyScatterCorruption(ctx, options.corruption, scatterInfo);
    }

    return {
      canvas,
      coords: result.coords,
      range: result.range
    };

  } catch (error) {
    console.error('renderScatter error:', error);
    return { error: error.message };
  }
}

/**
 * Apply cell animations from config
 * @param {TableRenderer} tableRenderer - Table renderer instance
 * @param {Object} config - Configuration object
 */
function applyCellAnimationsFromConfig(tableRenderer, config) {
  if (!config.cellAnimations || !Array.isArray(config.cellAnimations)) {
    return;
  }

  config.cellAnimations.forEach(anim => {
    tableRenderer.addAnimation({
      rowIndex: anim.rowIndex,
      colIndex: anim.colIndex,
      rowStart: anim.rowStart,
      rowEnd: anim.rowEnd,
      colStart: anim.colStart,
      colEnd: anim.colEnd,
      duration: anim.duration,
      repeat: anim.repeat
    });
  });

  // Auto play if animations were added
  if (config.cellAnimations.length > 0) {
    const playOptions = config.cellAnimationOptions || {};
    tableRenderer.playAllAnimations(playOptions);
  }
}

/**
 * Apply cell variables using rowIndex/colIndex (generic for all table types)
 * Modifies the parsed data directly so the factory uses modified values
 * @param {Array} cellVariables - Cell variable definitions [{ rowIndex, colIndex, value }, ...]
 * @param {Object} parseResult - Parsed data result from parser
 * @param {string} tableType - Table type
 * @returns {Object} Modified parseResult
 */
function applyCellVariablesGeneric(cellVariables, parseResult, tableType) {
  if (!cellVariables || !Array.isArray(cellVariables)) return parseResult;
  if (!parseResult || !parseResult.data) return parseResult;

  // Create a deep copy to avoid mutating original
  const data = JSON.parse(JSON.stringify(parseResult.data));

  cellVariables.forEach(cv => {
    if (cv.rowIndex === undefined || cv.colIndex === undefined) return;
    if (cv.value === undefined) return;

    // rowIndex 0 is header, data starts from rowIndex 1
    const dataRowIndex = cv.rowIndex - 1;
    if (dataRowIndex < 0) return; // Can't modify header

    if (tableType === 'stem-leaf') {
      applyCellVariableToStemLeaf(data, dataRowIndex, cv.colIndex, cv.value);
    } else if (tableType === 'category-matrix') {
      applyCellVariableToCategoryMatrix(data, dataRowIndex, cv.colIndex, cv.value);
    } else if (tableType === 'basic-table') {
      applyCellVariableToBasicTable(data, dataRowIndex, cv.colIndex, cv.value);
    }
  });

  return { ...parseResult, data };
}

/**
 * Apply cell variable to stem-leaf data
 * Single mode: colIndex 0=stem, 1=leaves
 * Compare mode: colIndex 0=leftLeaves, 1=stem, 2=rightLeaves
 * @param {Object} data - Parsed stem-leaf data
 * @param {number} dataRowIndex - Data row index (0-based, excluding header)
 * @param {number} colIndex - Column index
 * @param {string|Array} value - Value to set (array for leaves, string for stem)
 */
function applyCellVariableToStemLeaf(data, dataRowIndex, colIndex, value) {
  if (!data.stems || dataRowIndex >= data.stems.length) return;

  const stemData = data.stems[dataRowIndex];
  // 잎 값은 배열 또는 단일 값 지원
  const leavesValue = Array.isArray(value) ? value : [value];

  if (data.isSingleMode === false) {
    // Compare mode: col0=leftLeaves, col1=stem, col2=rightLeaves
    if (colIndex === 0) {
      stemData.leftLeaves = leavesValue;
    } else if (colIndex === 1) {
      stemData.stem = Array.isArray(value) ? value[0] : value;
    } else if (colIndex === 2) {
      stemData.rightLeaves = leavesValue;
    }
  } else {
    // Single mode: col0=stem, col1=leaves
    if (colIndex === 0) {
      stemData.stem = Array.isArray(value) ? value[0] : value;
    } else if (colIndex === 1) {
      stemData.leaves = leavesValue;
    }
  }
}

/**
 * Apply cell variable to category-matrix data
 */
function applyCellVariableToCategoryMatrix(data, dataRowIndex, colIndex, value) {
  if (!data.rows || dataRowIndex >= data.rows.length) return;

  const row = data.rows[dataRowIndex];
  if (colIndex === 0) {
    row.label = value;
  } else {
    const valueIndex = colIndex - 1;
    if (row.values && valueIndex < row.values.length) {
      row.values[valueIndex] = value;
    }
  }
}

/**
 * Apply cell variable to basic-table data
 * 합계 행도 편집 가능 (dataRowIndex === data.rows.length)
 */
function applyCellVariableToBasicTable(data, dataRowIndex, colIndex, value) {
  if (!data.rows) return;

  // 합계 행 처리 (dataRowIndex === data.rows.length)
  if (dataRowIndex === data.rows.length) {
    if (data.totals && colIndex > 0) {
      const valueIndex = colIndex - 1;
      if (valueIndex < data.totals.length) {
        data.totals[valueIndex] = value;
      }
    }
    return;
  }

  // 일반 데이터 행 처리
  if (dataRowIndex >= data.rows.length) return;

  const row = data.rows[dataRowIndex];
  if (colIndex === 0) {
    row.label = value;
  } else {
    const valueIndex = colIndex - 1;
    if (row.values && valueIndex < row.values.length) {
      row.values[valueIndex] = value;
    }
  }
}

/**
 * 테이블 렌더러의 레이어 매니저에서 실제 테이블 정보 추출 (corruption용)
 * @param {TableRenderer} tableRenderer - 테이블 렌더러 인스턴스
 * @param {string} tableType - 테이블 타입
 * @param {Object} data - 파싱된 테이블 데이터
 * @param {HTMLCanvasElement} canvas - Canvas 요소
 * @param {number} scale - 스케일 비율
 * @returns {Object|null} tableInfo for corruption
 */
function getActualTableInfo(tableRenderer, tableType, data, canvas, scale = 1) {
  const padding = CONFIG.TABLE_PADDING * scale;

  // 레이어 매니저에서 grid 레이어 찾기
  const rootLayer = tableRenderer.layerManager?.root;
  if (!rootLayer) {
    return calculateCustomTableInfo(tableType, data, canvas, null, scale);
  }

  // basic-table의 경우 rootLayer.children[0]이 table-root이고, 그 안에 grid가 있음
  const tableRoot = rootLayer?.children?.[0];

  // grid 레이어 찾기 (tableRoot.children에서 검색)
  let gridLayer = null;
  const searchChildren = tableRoot?.children || rootLayer.children || [];
  for (const child of searchChildren) {
    if (child.type?.includes('grid')) {
      gridLayer = child;
      break;
    }
  }

  if (!gridLayer?.data) {
    // grid 레이어가 없으면 기존 방식 사용
    return calculateCustomTableInfo(tableType, data, canvas, null, scale);
  }

  const gridData = gridLayer.data;

  // 실제 columnWidths 추출 (scale 적용)
  let columnWidths = null;
  if (gridData.columnWidths && Array.isArray(gridData.columnWidths)) {
    columnWidths = gridData.columnWidths.map(w => w * scale);
  }

  // 행 높이 계산
  const showMergedHeader = gridData.showMergedHeader !== false;
  const mergedHeaderHeight = showMergedHeader ? (gridData.mergedHeaderHeight || 35) * scale : 0;
  const columnHeaderHeight = (gridData.columnHeaderHeight || CONFIG.TABLE_HEADER_HEIGHT) * scale;

  // rowHeights 계산: 개별 행 높이 배열
  const rowHeights = [];
  if (showMergedHeader) rowHeights.push(mergedHeaderHeight);
  rowHeights.push(columnHeaderHeight);

  // 데이터 행 높이 (gridData.rowHeights가 있으면 사용, 없으면 균일 높이)
  const dataRowCount = gridData.rowCount || (data.rows?.length || 0) + (data.showTotal !== false ? 1 : 0);
  if (gridData.rowHeights && Array.isArray(gridData.rowHeights)) {
    gridData.rowHeights.forEach(h => rowHeights.push(h * scale));
  } else {
    const defaultRowHeight = CONFIG.TABLE_ROW_HEIGHT * scale;
    for (let i = 0; i < dataRowCount; i++) {
      rowHeights.push(defaultRowHeight);
    }
  }

  const totalRows = rowHeights.length;
  const totalCols = columnWidths ? columnWidths.length : (data.columnHeaders?.length || 0) + 1;

  return {
    startX: padding,
    startY: padding,
    cellWidth: columnWidths ? columnWidths[0] : (canvas.width - padding * 2) / totalCols,
    cellHeight: CONFIG.TABLE_ROW_HEIGHT * scale,
    columnWidths,
    rowHeights,
    totalRows,
    totalCols,
    inset: 3 * scale
  };
}

/**
 * Calculate tableInfo for custom table types (corruption용) - fallback
 * @param {string} tableType - Table type
 * @param {Object} data - Parsed table data
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Object} tableConfig - Table configuration
 * @param {number} scale - Scale ratio from table renderer
 * @returns {Object|null} tableInfo for corruption
 */
function calculateCustomTableInfo(tableType, data, canvas, tableConfig, scale = 1) {
  let totalRows, totalCols;
  let columnWidths = null;
  let rowHeights = null;  // 각 행의 높이 배열
  let startY = CONFIG.TABLE_PADDING * scale;
  const padding = CONFIG.TABLE_PADDING * scale;
  const totalWidth = canvas.width - padding * 2;

  if (tableType === 'stem-leaf') {
    // stem-leaf: stems 배열 + header
    totalRows = (data.stems?.length || 0) + 1;
    totalCols = data.isSingleMode === false ? 3 : 2; // compare: 3, single: 2
  } else if (tableType === 'category-matrix') {
    // category-matrix: rows + header
    totalRows = (data.rows?.length || 0) + 1;
    totalCols = (data.headers?.length || 0) + 1; // label column + value columns
  } else if (tableType === 'basic-table') {
    // basic-table: 병합헤더(선택적) + 컬럼헤더 + 데이터행 + 합계행(선택적)
    const showTotal = data.showTotal !== false;
    const showMergedHeader = data.showMergedHeader !== false;
    const mergedHeaderHeight = 35 * scale;
    const columnHeaderHeight = CONFIG.TABLE_HEADER_HEIGHT * scale;
    const dataRowHeight = CONFIG.TABLE_ROW_HEIGHT * scale;

    // 행 계산: 병합헤더 + 컬럼헤더 + 데이터행 + 합계행
    const dataRowCount = data.rows?.length || 0;
    totalRows = (showMergedHeader ? 1 : 0) + 1 + dataRowCount + (showTotal ? 1 : 0);
    // 열 계산: 행라벨열 + 데이터열들 (합계는 행이지 열이 아님)
    totalCols = (data.columnHeaders?.length || 0) + 1;

    // BasicTableFactory와 동일한 열 너비 계산: 첫 열 20%, 나머지 80% 균등
    const labelColumnWidth = totalWidth * 0.2;
    const dataColumnWidth = totalCols > 1 ? (totalWidth * 0.8) / (totalCols - 1) : totalWidth * 0.8;
    columnWidths = [labelColumnWidth, ...Array(totalCols - 1).fill(dataColumnWidth)];

    // 각 행의 높이 배열 생성 (행마다 다른 높이 적용)
    rowHeights = [];
    if (showMergedHeader) rowHeights.push(mergedHeaderHeight);  // row 0: 병합헤더
    rowHeights.push(columnHeaderHeight);  // row 1 (또는 0): 컬럼헤더
    for (let i = 0; i < dataRowCount; i++) {
      rowHeights.push(dataRowHeight);  // 데이터 행
    }
    if (showTotal) rowHeights.push(dataRowHeight);  // 합계 행
  } else {
    return null;
  }

  if (totalRows === 0 || totalCols === 0) return null;

  return {
    startX: padding,
    startY,
    cellWidth: totalWidth / totalCols,
    cellHeight: CONFIG.TABLE_ROW_HEIGHT * scale,
    columnWidths,
    rowHeights,  // 각 행의 높이 배열 추가
    totalRows,
    totalCols,
    inset: 3 * scale
  };
}

// ============================================
// Multiple Polygon Rendering (Static Mode)
// ============================================

/**
 * 복수 도수다각형 정적 렌더링
 * datasets 배열을 받아 하나의 캔버스에 여러 다각형을 동시 렌더링
 * @param {HTMLElement} element - 컨테이너 요소
 * @param {Object} config - 설정 객체
 * @param {Array} config.datasets - 데이터셋 배열 [{ data, callout, polygonColorPreset }, ...]
 * @param {Object} [config.classRange] - 공통 계급 범위
 * @param {Object} [config.options] - 공통 옵션
 * @returns {Promise<Object>} { chartRenderer, canvas, allClasses }
 */
async function renderMultiplePolygons(element, config) {
  try {
    await waitForFonts();

    // 1. Element validation
    if (!element || !(element instanceof HTMLElement)) {
      return {
        error: 'element must be a valid HTMLElement',
        errors: [{ field: 'element', code: 'TYPE_ERROR', message: 'element must be a valid HTMLElement' }]
      };
    }

    const datasets = config.datasets;
    if (!Array.isArray(datasets) || datasets.length === 0) {
      return { error: 'datasets array is required and must not be empty' };
    }

    // 2. 각 dataset 분석 및 classes 생성
    const allAnalyzed = [];
    for (const dataset of datasets) {
      if (!dataset.data) {
        console.warn('[viz-api] Dataset missing data field, skipping');
        continue;
      }

      const dataString = Array.isArray(dataset.data)
        ? dataset.data.join(', ')
        : dataset.data;
      const rawData = DataProcessor.parseInput(dataString);
      if (rawData.length === 0) continue;

      const stats = DataProcessor.calculateBasicStats(rawData);
      const classCount = config.classCount || 5;
      const classWidth = config.classWidth || null;
      const customRange = config.classRange || null;
      const { classes, classWidth: classInterval } = DataProcessor.createClasses(stats, classCount, classWidth, customRange);

      DataProcessor.calculateFrequencies(rawData, classes);

      const freq = classes.map(c => c.frequency);
      const total = freq.reduce((a, b) => a + b, 0);
      const relativeFreqs = freq.map(f => f / total);

      allAnalyzed.push({
        dataset,
        classes,
        classInterval,
        freq,
        relativeFreqs,
        total,
        maxRelativeFreq: Math.max(...relativeFreqs),
        maxFrequency: Math.max(...freq)
      });
    }

    if (allAnalyzed.length === 0) {
      return { error: 'No valid datasets found' };
    }

    // 3. 통합 값 계산
    const options = config.options || {};
    const dataType = options.dataType || 'relativeFrequency';

    // config에서 unifiedMaxY 지정 가능, 없으면 자동 계산
    // CoordinateSystem에서 customYInterval이 있으면 자동으로 2칸 여백 추가하므로 여기선 최대값만 전달
    let unifiedMaxY = config.unifiedMaxY;
    if (unifiedMaxY === undefined || unifiedMaxY === null) {
      if (dataType === 'frequency') {
        unifiedMaxY = Math.max(...allAnalyzed.map(a => a.maxFrequency));
      } else {
        const maxRelFreq = Math.max(...allAnalyzed.map(a => a.maxRelativeFreq));
        unifiedMaxY = maxRelFreq * CONFIG.CHART_Y_SCALE_MULTIPLIER;
      }
    }

    const unifiedClassCount = Math.max(...allAnalyzed.map(a => a.classes.length));

    console.log(`[viz-api] Multiple polygons: ${allAnalyzed.length} datasets, unifiedMaxY=${unifiedMaxY}, unifiedClassCount=${unifiedClassCount}`);

    // 4. 캔버스 생성
    const canvasId = `viz-chart-${++chartInstanceCounter}`;
    const canvas = document.createElement('canvas');
    canvas.id = canvasId;

    if (config.canvasSize) {
      canvas.width = config.canvasSize;
      canvas.height = config.canvasSize;
    } else {
      canvas.width = config.canvasWidth || CONFIG.CANVAS_WIDTH;
      canvas.height = config.canvasHeight || CONFIG.CANVAS_HEIGHT;
    }

    CONFIG.setCanvasSize(Math.max(canvas.width, canvas.height));

    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Multiple frequency polygons');
    element.appendChild(canvas);

    // 5. ChartRenderer 생성 및 정적 모드 설정
    const chartRenderer = new ChartRenderer(canvasId);
    chartRenderer.disableAnimation();

    // 6. 공통 옵션 적용
    CONFIG.SHOW_HISTOGRAM = options.showHistogram === true;  // 기본 false
    CONFIG.SHOW_POLYGON = options.showPolygon !== false;     // 기본 true
    CONFIG.SHOW_DASHED_LINES = options.showDashedLines || false;

    const gridOptions = options.grid || {};
    CONFIG.GRID_SHOW_HORIZONTAL = gridOptions.showHorizontal !== false;
    CONFIG.GRID_SHOW_VERTICAL = gridOptions.showVertical !== false;

    const axisOptions = options.axis || {};
    CONFIG.AXIS_SHOW_Y_LABELS = axisOptions.showYLabels !== false;
    CONFIG.AXIS_SHOW_X_LABELS = axisOptions.showXLabels !== false;

    // 7. 각 데이터셋 순서대로 그리기
    const axisLabels = options.axisLabels || null;
    const customYInterval = options.customYInterval || null;
    const ellipsisInfo = DataProcessor.shouldShowEllipsis(allAnalyzed[0].classes);

    // 첫 번째 데이터셋으로 축/그리드 그리기
    const firstAnalyzed = allAnalyzed[0];
    CONFIG.POLYGON_COLOR_PRESET = firstAnalyzed.dataset.polygonColorPreset || 'default';

    // 첫 번째 dataset의 다각형 숨김 인덱스
    const firstHiddenIndices = firstAnalyzed.dataset.polygon?.hidden || [];

    console.log(`[viz-api] Drawing dataset 0: preset=${CONFIG.POLYGON_COLOR_PRESET}, isFirst=true`);

    chartRenderer.draw(
      firstAnalyzed.classes,
      axisLabels,
      ellipsisInfo,
      dataType,
      null,  // tableConfig
      null,  // calloutTemplate
      true,  // clearCanvas
      unifiedMaxY,
      unifiedClassCount,
      customYInterval,
      firstHiddenIndices
    );

    // 저장된 coords 사용 (나머지 데이터셋에서 재사용)
    const coords = chartRenderer.currentCoords;

    // callout 인덱스 (세로 배치용)
    let calloutIndex = 0;

    // 첫 번째 callout
    if (firstAnalyzed.dataset.callout?.template) {
      const calloutPreset = firstAnalyzed.dataset.callout.preset || CONFIG.POLYGON_COLOR_PRESET;
      const values = dataType === 'frequency' ? firstAnalyzed.freq : firstAnalyzed.relativeFreqs;
      console.log(`[viz-api] Drawing callout for dataset 0: template=${firstAnalyzed.dataset.callout.template}, index=${calloutIndex}`);
      renderStaticCallout(chartRenderer, firstAnalyzed.classes, values, coords, firstAnalyzed.dataset.callout.template, calloutPreset, dataType, calloutIndex);
      calloutIndex++;
    }

    // 나머지 데이터셋은 다각형만 직접 그리기 (draw() 호출 안 함)
    for (let i = 1; i < allAnalyzed.length; i++) {
      const analyzed = allAnalyzed[i];
      const colorPreset = analyzed.dataset.polygonColorPreset || 'default';

      console.log(`[viz-api] Drawing dataset ${i}: preset=${colorPreset}, isFirst=false`);

      // 색상 프리셋 설정
      CONFIG.POLYGON_COLOR_PRESET = colorPreset;

      // 값 배열
      const values = dataType === 'frequency' ? analyzed.freq : analyzed.relativeFreqs;

      // 다각형 숨김 인덱스 (dataset별)
      const hiddenIndices = analyzed.dataset.polygon?.hidden || [];

      // 다각형 직접 그리기 (축/그리드 건드리지 않음)
      if (CONFIG.SHOW_POLYGON) {
        chartRenderer.polygonRenderer.draw(values, coords, ellipsisInfo, hiddenIndices);
      }

      // callout 그리기
      if (analyzed.dataset.callout?.template) {
        const calloutPreset = analyzed.dataset.callout.preset || colorPreset;
        console.log(`[viz-api] Drawing callout for dataset ${i}: template=${analyzed.dataset.callout.template}, index=${calloutIndex}`);
        renderStaticCallout(chartRenderer, analyzed.classes, values, coords, analyzed.dataset.callout.template, calloutPreset, dataType, calloutIndex);
        calloutIndex++;
      }
    }

    return {
      chartRenderer,
      canvas,
      allClasses: allAnalyzed.map(a => a.classes)
    };

  } catch (error) {
    console.error('renderMultiplePolygons error:', error);
    return { error: error.message };
  }
}

/**
 * 정적 모드에서 Callout 렌더링 (왼쪽 상단에 세로로 쌓임)
 * @param {ChartRenderer} chartRenderer - 차트 렌더러
 * @param {Array} classes - 계급 배열
 * @param {Array} values - 값 배열
 * @param {Object} coords - 좌표 시스템
 * @param {string} template - 템플릿 문자열
 * @param {string} colorPreset - 색상 프리셋
 * @param {string} dataType - 데이터 타입
 * @param {number} calloutIndex - 말풍선 인덱스 (0부터, 세로 배치용)
 */
function renderStaticCallout(chartRenderer, classes, values, coords, template, colorPreset, dataType, calloutIndex = 0) {
  // 최고점 찾기
  let maxIndex = 0;
  let maxValue = values[0];
  values.forEach((v, i) => {
    if (v > maxValue) {
      maxValue = v;
      maxIndex = i;
    }
  });

  const classData = classes[maxIndex];
  if (!classData) return;

  // 상대도수 계산 (백분율)
  const total = classes.reduce((sum, c) => sum + c.frequency, 0);
  classData.relativeFreq = ((classData.frequency / total) * 100).toFixed(1);

  // 템플릿 치환
  const CalloutRenderer = chartRenderer.calloutRenderer.constructor;
  const text = CalloutRenderer.formatTemplate(template, classData, dataType);
  if (!text) return;

  // 말풍선 크기 계산
  const scaledCalloutSize = CONFIG.getScaledCalloutSize();
  const font = `${CONFIG.getScaledFontSize(20)}px KaTeX_Main`;
  const calloutWidth = CalloutRenderer.calculateCalloutWidth(text, font);
  const calloutHeight = scaledCalloutSize.height;

  // 위치 계산 - 왼쪽 상단에 세로로 쌓임 (LayerFactory와 동일한 로직)
  const calloutSpacing = CONFIG.getScaledValue(10);
  const calloutX = CONFIG.getScaledPadding() + CONFIG.getScaledValue(CONFIG.CALLOUT_POSITION_X);
  const calloutY = CONFIG.getScaledPadding() + CONFIG.getScaledValue(CONFIG.CALLOUT_POSITION_Y) + (calloutIndex * (calloutHeight + calloutSpacing));

  // 포인트 좌표 (연결선용)
  const { toX, toY, xScale } = coords;
  const pointX = toX(maxIndex) + xScale * CONFIG.CHART_BAR_WIDTH_RATIO / 2;
  const pointY = toY(maxValue);

  // 레이어 데이터 구성
  const layerData = {
    x: calloutX,
    y: calloutY,
    width: calloutWidth,
    height: calloutHeight,
    text,
    opacity: 1,
    polygonPreset: colorPreset,
    pointX,
    pointY
  };

  // 렌더링
  chartRenderer.calloutRenderer.render({ data: layerData });
}

// ============================================
// Cell Animation API
// ============================================

/**
 * 셀 애니메이션 추가
 * @param {TableRenderer} tableRenderer - 테이블 렌더러 인스턴스
 * @param {Object} options - 애니메이션 옵션
 * @param {number} [options.rowIndex] - 행 인덱스 (null이면 열 전체)
 * @param {number} [options.colIndex] - 열 인덱스 (null이면 행 전체)
 * @param {number} [options.duration=1500] - 애니메이션 시간 (ms)
 * @param {number} [options.repeat=3] - 반복 횟수
 * @returns {Object} 추가된 애니메이션 객체 { id, rowIndex, colIndex, duration, repeat }
 */
function addCellAnimation(tableRenderer, options) {
  if (!tableRenderer) return { error: 'tableRenderer is required' };
  return tableRenderer.addAnimation(options);
}

/**
 * 특정 셀 애니메이션 삭제
 * @param {TableRenderer} tableRenderer - 테이블 렌더러 인스턴스
 * @param {number} id - 삭제할 애니메이션 ID
 */
function removeCellAnimation(tableRenderer, id) {
  if (!tableRenderer) return;
  tableRenderer.removeAnimation(id);
}

/**
 * 저장된 셀 애니메이션 목록 조회
 * @param {TableRenderer} tableRenderer - 테이블 렌더러 인스턴스
 * @returns {Array} 애니메이션 배열 [{ id, rowIndex, colIndex, duration, repeat }, ...]
 */
function getCellAnimations(tableRenderer) {
  if (!tableRenderer) return [];
  return tableRenderer.getSavedAnimations();
}

/**
 * 저장된 모든 셀 애니메이션 재생
 * @param {TableRenderer} tableRenderer - 테이블 렌더러 인스턴스
 * @param {Object} [options] - 재생 옵션
 * @param {boolean} [options.blinkEnabled=false] - 블링크 효과 활성화
 */
function playCellAnimations(tableRenderer, options = {}) {
  if (!tableRenderer) return;
  tableRenderer.playAllAnimations(options);
}

/**
 * 셀 애니메이션 재생 중지 (목록은 유지)
 * @param {TableRenderer} tableRenderer - 테이블 렌더러 인스턴스
 */
function stopCellAnimations(tableRenderer) {
  if (!tableRenderer) return;
  tableRenderer.stopCellAnimation();
}

/**
 * 모든 셀 애니메이션 초기화 (중지 + 목록 삭제)
 * @param {TableRenderer} tableRenderer - 테이블 렌더러 인스턴스
 */
function clearCellAnimations(tableRenderer) {
  if (!tableRenderer) return;
  tableRenderer.stopCellAnimation();
  tableRenderer.clearSavedAnimations();
}

var vizApi = {
  render,
  renderChart,
  renderTable,
  // Cell Animation API
  addCellAnimation,
  removeCellAnimation,
  getCellAnimations,
  playCellAnimations,
  stopCellAnimations,
  clearCellAnimations
};

export { addCellAnimation, clearCellAnimations, vizApi as default, getCellAnimations, playCellAnimations, removeCellAnimation, render, renderChart, renderScatter, renderTable, stopCellAnimations };
//# sourceMappingURL=viz-api.esm.js.map

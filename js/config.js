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
  CHART_LEGEND_X_OFFSET: 180,

  // 범례 레이아웃
  CHART_LEGEND_Y_START: 20,           // 첫 번째 범례 항목 Y 위치
  CHART_LEGEND_BAR_HEIGHT: 15,        // 범례 막대 높이
  CHART_LEGEND_ITEM_WIDTH: 20,        // 범례 아이템 너비 (박스/선)
  CHART_LEGEND_TEXT_X_OFFSET: 25,     // 범례 텍스트 X 오프셋
  CHART_LEGEND_TEXT_Y_OFFSET: 12,     // 범례 텍스트 Y 오프셋 (아이템 상단 기준)
  CHART_LEGEND_ITEM_SPACING: 30,      // 범례 항목 간 Y 간격
  CHART_LEGEND_POINT_RADIUS: 4,       // 범례 점 반지름
  CHART_LEGEND_POINT_CENTER_X: 10,    // 범례 점 중심 X 오프셋 (아이템 시작점 기준)

  // 중략 판단 기준
  ELLIPSIS_THRESHOLD: 2,
  ELLIPSIS_POSITION_RATIO: 0.25, // 압축 구간에서 이중물결 기호 위치 (0~1 사이 값)

  // 차트 폰트 설정
  CHART_FONT_SMALL: '11px sans-serif',
  CHART_FONT_REGULAR: '12px sans-serif',
  CHART_FONT_BOLD: 'bold 14px sans-serif',
  CHART_FONT_LARGE: '16px sans-serif',

  // 소수점 자릿수
  DECIMAL_PLACES: 2,

  // 메시지 표시 시간
  MESSAGE_DISPLAY_TIME: 5000,

  // Canvas 기본 크기
  CANVAS_WIDTH: 700,
  CANVAS_HEIGHT: 450,

  // 테이블 타입 설정
  TABLE_TYPES: {
    FREQUENCY: 'frequency',              // 도수분포표
    CATEGORY_MATRIX: 'category-matrix',  // 카테고리 행렬
    CROSS_TABLE: 'cross-table',          // 이원 분류표
    STEM_LEAF: 'stem-leaf'               // 줄기-잎 그림
  },

  // 테이블 타입별 정보
  TABLE_TYPE_INFO: {
    'frequency': {
      name: '도수분포표',
      description: '숫자 데이터를 계급별로 분류',
      placeholder: '62, 87, 97, 73, 59, 85, 80, 79, 65, 75',
      hint: '숫자를 쉼표 또는 공백으로 구분하여 입력',
      defaultData: '62 87 97 73 59 85 80 79 65 75'
    },
    'category-matrix': {
      name: '카테고리 행렬',
      description: '카테고리별 데이터 비교',
      placeholder: '헤더: A, B, C, D, E\n전체 학생 수 (명): 200, 250, 300, 350, 400\nO형인 학생 수 (명): 50, 60, 70, 80, 90',
      hint: '첫 줄에 "헤더: 값들", 이후 "라벨: 값들" 형식으로 입력',
      defaultData: '헤더: A, B, C, D, E\n전체 학생 수 (명): 200, 250, 300, 350, 400\nO형인 학생 수 (명): 50, 60, 70, 80, 90'
    },
    'cross-table': {
      name: '이원 분류표',
      description: '두 변수의 교차 분류',
      placeholder: '헤더: 혈액형, 남학생, 여학생\nA: 0.4, 0.4\nB: 0.22, 0.2\nAB: 0.12, 0.16\nO: 0.26, 0.24',
      hint: '첫 줄에 "헤더: 행라벨명, 열이름들", 이후 "행이름: 값들" 형식으로 입력',
      defaultData: '헤더: 혈액형, 남학생, 여학생\nA: 0.4, 0.4\nB: 0.22, 0.2\nAB: 0.12, 0.16\nO: 0.26, 0.24'
    },
    'stem-leaf': {
      name: '줄기-잎 그림',
      description: '데이터 분포를 줄기와 잎으로 시각화',
      placeholder: '숫자만 입력 (단일) 또는\n남학생: 162 178 175...\n여학생: 160 165 170... (비교)',
      hint: '숫자만: 단일 줄기-잎 / "라벨: 숫자들": 비교형 줄기-잎',
      defaultData: '남학생: 162 178 175 174 189 186 183 183 181 197 194 191 190 209 205\n여학생: 160 165 170 177 180 182 184 188 192 193 196 201 207'
    }
  },

  // 기본 테이블 타입
  DEFAULT_TABLE_TYPE: 'frequency',

  // 테이블 Canvas 설정
  TABLE_CANVAS_WIDTH: 700,
  TABLE_ROW_HEIGHT: 40,
  TABLE_HEADER_HEIGHT: 45,
  TABLE_PADDING: 10,
  TABLE_FONT_HEADER: 'bold 18px sans-serif',
  TABLE_FONT_DATA: '18px sans-serif',
  TABLE_FONT_SUMMARY: 'bold 18px sans-serif',
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
  TABLE_FONT_SUPERSCRIPT: '11px sans-serif', // 상첨자 폰트

  // 테이블 문자열 상수
  TABLE_SUPERSCRIPT_MIN_TEXT: '이상',      // 상첨자 최솟값 텍스트
  TABLE_SUPERSCRIPT_MAX_TEXT: '미만',      // 상첨자 최댓값 텍스트
  TABLE_CLASS_SEPARATOR: ' ~ ',           // 계급 구분자
  TABLE_NO_DATA_MESSAGE: '데이터가 없습니다', // 데이터 없음 메시지

  // 차트 선 너비
  CHART_LINE_WIDTH_THIN: 1,               // 얇은 선 (격자선)
  CHART_LINE_WIDTH_NORMAL: 2,             // 보통 선 (막대 테두리)
  CHART_LINE_WIDTH_THICK: 3,              // 두꺼운 선 (다각형)
  CHART_LINE_WIDTH_DASHED: 1.5,           // 파선 너비
  CHART_DASHED_PATTERN: [5, 5],           // 파선 패턴 [선, 간격]

  // 축/범례 문자열 상수
  AXIS_ELLIPSIS_SYMBOL: '≈',              // 이중물결 기호
  LEGEND_LABEL_HISTOGRAM: '히스토그램',    // 범례 히스토그램 라벨

  // 기본 라벨 (고급 설정) - 축 끝 라벨링용 괄호 포함
  DEFAULT_LABELS: {
    xAxis: '(계급)',
    yAxis: '(상대도수)',
    table: {
      class: '계급',
      midpoint: '계급값',
      frequency: '도수',
      relativeFrequency: '상대도수(%)',
      cumulativeFrequency: '누적도수',
      cumulativeRelativeFrequency: '누적상대도수(%)'
    }
  },

  // 테이블 기본 컬럼 설정
  TABLE_DEFAULT_VISIBLE_COLUMNS: [true, true, true, true, false, false], // 누적도수, 누적상대도수 숨김
  TABLE_DEFAULT_COLUMN_ORDER: [0, 1, 2, 3, 4, 5],

  // 범위 밖 데이터 미리보기 최대 개수
  OUT_OF_RANGE_MAX_DISPLAY: 10,

  // 테이블 컬럼별 기본 정렬
  TABLE_DEFAULT_ALIGNMENT: {
    '계급': 'center',
    '계급값': 'center',
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
  CALLOUT_TAIL_WIDTH: 20,                   // 꼬리 너비 (미사용)
  CALLOUT_TAIL_HEIGHT: 10,                  // 꼬리 높이 (미사용)
  CALLOUT_BORDER_RADIUS: 0,                 // 모서리 둥글기 (0 = 둥글기 없음)
  CALLOUT_PADDING: 8,                       // 내부 패딩
  CALLOUT_FONT: '20px sans-serif',          // 폰트
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
  }
};

export default CONFIG;

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.VizAPI = {}));
})(this, (function (exports) { 'use strict';

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
    TABLE_MIN_WIDTH: 300,              // 동적 너비 최소값
    TABLE_MAX_WIDTH: 700,              // 동적 너비 최대값 (TABLE_CANVAS_WIDTH와 동일)
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
     * 숫자를 포맷하고 불필요한 .00 제거
     * @param {number} num - 포맷할 숫자
     * @param {number} decimals - 소수점 자릿수
     * @returns {string} 포맷된 숫자 (불필요한 .00 제거)
     */
    static formatNumberClean(num, decimals = CONFIG.DECIMAL_PLACES) {
      const formatted = Number(num).toFixed(decimals);
      // .00 제거 (예: 20.00 → 20, 33.33은 유지)
      return formatted.replace(/\.00$/, '');
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
      messageBox.textContent = message;
      messageBox.className = `message-box show ${type}`;

      // 자동으로 메시지 숨기기
      setTimeout(() => {
        this.hide();
      }, CONFIG.MESSAGE_DISPLAY_TIME);
    }

    static hide() {
      const messageBox = document.getElementById('messageBox');
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
     * @param {number[]} data - 숫자 배열
     * @returns {{min: number, max: number, range: number, mean: number, median: number, count: number}} 통계 객체
     * @throws {Error} 데이터가 비어있는 경우
     * @example
     * calculateBasicStats([1, 2, 3, 4, 5])
     * // { min: 1, max: 5, range: 4, mean: 3, median: 3, count: 5 }
     */
    static calculateBasicStats(data) {
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
     * @param {Object|null} customRange - 커스텀 범위 설정 { firstEnd, secondEnd, lastStart }
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
     * @param {Object} customRange - { firstEnd, secondEnd, lastStart }
     * @returns {{classes: Array, classWidth: number}} 계급 배열과 계급 간격
     * @description
     * - 첫 칸: 0 ~ firstEnd (비어있음)
     * - 두 번째 칸: firstEnd ~ secondEnd (간격 결정)
     * - 중간 칸들: 두 번째 칸의 간격으로 자동 생성
     * - 마지막 칸: lastStart ~ (lastStart + 간격)
     */
    static createCustomRangeClasses(customRange) {
      const { firstEnd, secondEnd, lastStart } = customRange;

      // 유효성 검사
      if (firstEnd <= 0) {
        throw new Error('첫 칸의 끝값은 0보다 커야 합니다.');
      }
      if (secondEnd <= firstEnd) {
        throw new Error('두 번째 칸의 끝값은 첫 칸의 끝값보다 커야 합니다.');
      }
      if (lastStart <= secondEnd) {
        throw new Error('마지막 칸의 시작값은 두 번째 칸의 끝값보다 커야 합니다.');
      }

      // 간격 계산 (두 번째 칸 기준)
      const classWidth = secondEnd - firstEnd;

      const classes = [];

      // 첫 칸 추가 (0 ~ firstEnd)
      classes.push({
        min: 0,
        max: firstEnd,
        frequency: 0,
        data: [],
        midpoint: firstEnd / 2
      });

      // 두 번째 칸부터 마지막 칸 직전까지
      let currentMin = firstEnd;
      while (currentMin < lastStart) {
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

      // 마지막 칸 추가 (lastStart ~ lastStart + classWidth)
      classes.push({
        min: lastStart,
        max: lastStart + classWidth,
        frequency: 0,
        data: [],
        midpoint: lastStart + (classWidth / 2)
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
      ctx.lineWidth = CONFIG.CALLOUT_CONNECTOR_LINE_WIDTH;
      ctx.setLineDash(CONFIG.CALLOUT_CONNECTOR_DASH_PATTERN);

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
      const barWidth = CONFIG.CALLOUT_ACCENT_BAR_WIDTH;

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
      const ctx = this.ctx;
      CONFIG.CALLOUT_PADDING;
      const lineHeight = CONFIG.CALLOUT_LINE_HEIGHT;

      // 프리셋에 따른 텍스트 색상
      const preset = polygonPreset || 'default';
      const textColor = CONFIG.CALLOUT_TEXT_COLORS[preset] || CONFIG.CALLOUT_TEXT_COLORS.default;

      ctx.font = CONFIG.CALLOUT_FONT;
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      // 줄바꿈 분할
      const lines = text.split('\n');

      // 텍스트 시작 위치 (수직 중앙 정렬)
      const totalTextHeight = lines.length * lineHeight;
      const textY = y + (height - totalTextHeight) / 2;

      lines.forEach((line, i) => {
        const textX = x + width / 2; // 가로 중앙
        const lineY = textY + i * lineHeight;
        ctx.fillText(line, textX, lineY);
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
     */
    static createLayers(layerManager, classes, values, coords, ellipsisInfo, dataType = 'relativeFrequency', calloutTemplate = null) {
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

        const pointLayer = new Layer({
          id: `point-${timestamp}-${index}`,
          name: `점(${className})`,
          type: 'point',
          visible: true,
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

          const lineLayer = new Layer({
            id: `line-${timestamp}-${prevIndex}-${index}`,
            name: `선(${fromClassName}→${toClassName})`,
            type: 'line',
            visible: true,
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
              coords
            }
          });

          dashedLinesGroup.addChild(dashedLineLayer);
        });
      }

      // 렌더링 순서: 선 → 점 (점이 가장 위에 표시되도록)
      polygonGroup.addChild(linesGroup);
      polygonGroup.addChild(pointsGroup);

      // 렌더링 순서: 히스토그램 → 파선 → 다각형 → 라벨(조건부) → 말풍선
      // CONFIG에 따라 조건부 추가
      if (CONFIG.SHOW_HISTOGRAM) {
        layerManager.addLayer(histogramGroup);
      }
      if (CONFIG.SHOW_DASHED_LINES) {
        layerManager.addLayer(dashedLinesGroup);
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
      const calloutSpacing = 10; // 말풍선 간격

      // 말풍선 위치 (차트 왼쪽 상단, 기존 말풍선 아래에 배치)
      const calloutX = CONFIG.CHART_PADDING + CONFIG.CALLOUT_POSITION_X;
      const calloutY = CONFIG.CHART_PADDING + CONFIG.CALLOUT_POSITION_Y + (calloutCount * (CONFIG.CALLOUT_HEIGHT + calloutSpacing));

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
          width: calloutWidth,
          height: CONFIG.CALLOUT_HEIGHT,
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

      // 라벨 오프셋 (라벨과 직각 모서리 사이 거리)
      const labelOffset = 30;

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

    const textType = detectTextType(text);
    const useItalic = italic !== null ? italic : textType === 'variable';

    ctx.font = getFont(textType, fontSize, useItalic);
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;

    ctx.fillText(text, x, y);

    const metrics = ctx.measureText(text);
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
      const subOffset = fontSize * 0.2;
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

  var KatexUtils = {
    waitForFonts,
    render: render$1,
    renderMathText,
    renderWithScript,
    renderFraction,
    isFontsLoaded
  };

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

      values.forEach((value, index) => {
        if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;

        const x = toX(index);
        const y = toY(value);
        const h = toY(0) - y;
        const barWidth = xScale * CONFIG.CHART_BAR_WIDTH_RATIO;

        // 그라디언트 막대
        const gradient = this.ctx.createLinearGradient(x, y, x, y + h);
        gradient.addColorStop(0, CONFIG.getColor('--chart-bar-color'));
        gradient.addColorStop(1, CONFIG.getColor('--chart-bar-color-end'));

        this.ctx.globalAlpha = CONFIG.CHART_BAR_ALPHA;
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, y, barWidth, h);
        this.ctx.globalAlpha = CONFIG.CHART_DEFAULT_ALPHA;

        // 그라디언트 테두리 (데이터가 있는 경우)
        if (freq[index] > 0) {
          const strokeGradient = Utils.createVerticalGradient(
            this.ctx, x, y, h,
            CONFIG.getColor('--chart-bar-stroke-start'),
            CONFIG.getColor('--chart-bar-stroke-end')
          );
          this.ctx.strokeStyle = strokeGradient;
          this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_NORMAL;
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
      gradient.addColorStop(0, CONFIG.getColor('--chart-bar-color'));
      gradient.addColorStop(1, CONFIG.getColor('--chart-bar-color-end'));

      this.ctx.globalAlpha = CONFIG.CHART_BAR_ALPHA;
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(x, animatedY, barWidth, animatedH);
      this.ctx.globalAlpha = CONFIG.CHART_DEFAULT_ALPHA;

      // 그라디언트 테두리 (데이터가 있고 높이가 0보다 클 때만)
      if (frequency > 0 && animatedH > 0) {
        const strokeGradient = Utils.createVerticalGradient(
          this.ctx, x, animatedY, animatedH,
          CONFIG.getColor('--chart-bar-stroke-start'),
          CONFIG.getColor('--chart-bar-stroke-end')
        );
        this.ctx.strokeStyle = strokeGradient;
        this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_NORMAL;
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
        y - CONFIG.CHART_LABEL_OFFSET - 5,
        { fontSize: 12, color: CONFIG.getColor('--color-text'), align: 'center', baseline: 'middle' }
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
     */
    draw(relativeFreqs, coords, ellipsisInfo) {
      const { toX, toY, xScale } = coords;

      // 현재 프리셋의 색상 가져오기
      const preset = CONFIG.POLYGON_COLOR_PRESETS[CONFIG.POLYGON_COLOR_PRESET];
      const pointColor = preset?.pointColor || CONFIG.POLYGON_COLOR_PRESETS.default.pointColor;
      const gradientStart = preset?.gradientStart || CONFIG.POLYGON_COLOR_PRESETS.default.gradientStart;
      const gradientEnd = preset?.gradientEnd || CONFIG.POLYGON_COLOR_PRESETS.default.gradientEnd;

      // 점 그리기
      relativeFreqs.forEach((relativeFreq, index) => {
        if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;

        const centerX = CoordinateSystem.getBarCenterX(index, toX, xScale);
        const centerY = toY(relativeFreq);

        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, CONFIG.CHART_POINT_RADIUS, 0, Math.PI * 2);
        this.ctx.fillStyle = pointColor;
        this.ctx.fill();
      });

      // 선 그리기
      let prevIndex = null;
      relativeFreqs.forEach((relativeFreq, index) => {
        if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;

        if (prevIndex !== null) {
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
          this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_THICK;
          this.ctx.beginPath();
          this.ctx.moveTo(x1, y1);
          this.ctx.lineTo(x2, y2);
          this.ctx.stroke();
        }

        prevIndex = index;
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
      this.ctx.arc(centerX, centerY, CONFIG.CHART_POINT_RADIUS, 0, Math.PI * 2);
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
      this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_THICK;
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
      if (!CONFIG.AXIS_SHOW_Y_LABELS) return;

      const color = CONFIG.getColor('--color-text');

      for (let i = 0; i <= gridDivisions; i++) {
        const value = maxY * i / gridDivisions;

        // 마지막 라벨은 축 제목으로 대체 (4글자 초과 시 폰트 축소)
        if (i === gridDivisions && yLabel) {
          const fontSize = yLabel.length > 4 ? 11 : 14;
          this.ctx.font = `${fontSize}px sans-serif`;
          this.ctx.fillStyle = color;
          this.ctx.textAlign = 'right';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText(yLabel,
            this.padding - CONFIG.CHART_Y_LABEL_OFFSET,
            toY(value) + CONFIG.CHART_LABEL_OFFSET
          );
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
            const formatted = Utils.formatNumber(percentage);
            formattedValue = formatted.replace(/\.00$/, '') + '%';
          } else {
            formattedValue = Utils.formatNumber(value);
          }
        }

        // KaTeX 폰트로 렌더링
        render$1(this.ctx, formattedValue,
          this.padding - CONFIG.CHART_Y_LABEL_OFFSET,
          toY(value) + CONFIG.CHART_LABEL_OFFSET,
          { fontSize: 18, color: color, align: 'right', baseline: 'middle' }
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
      if (!CONFIG.AXIS_SHOW_X_LABELS) return;

      const color = CONFIG.getColor('--color-text');
      const labelY = this.canvas.height - this.padding + CONFIG.CHART_X_LABEL_Y_OFFSET;

      if (ellipsisInfo && ellipsisInfo.show) {
        const firstDataIdx = ellipsisInfo.firstDataIndex;

        // X축 0은 Y축 0과 중복되므로 렌더링하지 않음

        // 중략 기호 (이중 물결, X축 위에 세로로)
        const ellipsisX = toX(0) + (toX(1) - toX(0)) * CONFIG.ELLIPSIS_POSITION_RATIO;
        const ellipsisY = toY(0);

        this.ctx.save();
        this.ctx.translate(ellipsisX, ellipsisY);
        this.ctx.rotate(Math.PI / 2);
        this.ctx.font = CONFIG.CHART_FONT_LARGE;
        this.ctx.fillStyle = CONFIG.getColor('--color-ellipsis');
        this.ctx.textBaseline = 'bottom';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(CONFIG.AXIS_ELLIPSIS_SYMBOL, 0, 0);
        this.ctx.restore();

        // 데이터 구간 라벨 (KaTeX 폰트)
        for (let i = firstDataIdx; i < classes.length; i++) {
          render$1(this.ctx, String(classes[i].min), toX(i), labelY,
            { fontSize: 18, color: color, align: 'center', baseline: 'middle' }
          );
        }

        // 마지막 라벨: 축 제목으로 대체
        this.ctx.font = '14px sans-serif';
        this.ctx.fillStyle = color;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(xLabel || String(classes[classes.length - 1].max),
          toX(classes.length - 1) + xScale, labelY
        );
      } else {
        // 중략 없이 전체 표시 (KaTeX 폰트)
        // 첫 번째 라벨(0)은 Y축과 중복되므로 건너뛰기
        classes.forEach((c, i) => {
          if (i === 0 && c.min === 0) return; // 0은 Y축에서 이미 표시됨
          render$1(this.ctx, String(c.min), toX(i), labelY,
            { fontSize: 18, color: color, align: 'center', baseline: 'middle' }
          );
        });

        // 마지막 라벨: 축 제목으로 대체
        if (classes.length > 0) {
          this.ctx.font = '14px sans-serif';
          this.ctx.fillStyle = color;
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText(xLabel || String(classes[classes.length - 1].max),
            toX(classes.length), labelY
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
      this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_THIN;
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
     * 범례 그리기
     * @param {string} dataType - 데이터 타입 ('relativeFrequency', 'frequency', 등)
     */
    drawLegend(dataType = 'relativeFrequency') {
      // 데이터 타입 정보 가져오기
      const dataTypeInfo = CONFIG.CHART_DATA_TYPES.find(t => t.id === dataType);
      const legendSuffix = dataTypeInfo?.legendSuffix || '상대도수';

      const legendX = this.canvas.width - CONFIG.CHART_LEGEND_X_OFFSET;
      this.ctx.textAlign = 'left';
      this.ctx.font = CONFIG.CHART_FONT_REGULAR;

      // 히스토그램 범례
      const y1 = CONFIG.CHART_LEGEND_Y_START;
      const barGradient = this.ctx.createLinearGradient(
        legendX,
        y1,
        legendX,
        y1 + CONFIG.CHART_LEGEND_BAR_HEIGHT
      );
      barGradient.addColorStop(0, CONFIG.getColor('--chart-bar-color'));
      barGradient.addColorStop(1, CONFIG.getColor('--chart-bar-color-end'));

      this.ctx.fillStyle = barGradient;
      this.ctx.fillRect(legendX, y1, CONFIG.CHART_LEGEND_ITEM_WIDTH, CONFIG.CHART_LEGEND_BAR_HEIGHT);
      this.ctx.strokeStyle = CONFIG.getColor('--color-border');
      this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_THIN;
      this.ctx.strokeRect(legendX, y1, CONFIG.CHART_LEGEND_ITEM_WIDTH, CONFIG.CHART_LEGEND_BAR_HEIGHT);
      this.ctx.fillStyle = CONFIG.getColor('--color-text');
      this.ctx.fillText(CONFIG.LEGEND_LABEL_HISTOGRAM, legendX + CONFIG.CHART_LEGEND_TEXT_X_OFFSET, y1 + CONFIG.CHART_LEGEND_TEXT_Y_OFFSET);

      // 다각형 범례 (동적 텍스트)
      const y2 = y1 + CONFIG.CHART_LEGEND_ITEM_SPACING;

      // 현재 프리셋의 색상 가져오기
      const preset = CONFIG.POLYGON_COLOR_PRESETS[CONFIG.POLYGON_COLOR_PRESET];
      const pointColor = preset?.pointColor || CONFIG.POLYGON_COLOR_PRESETS.default.pointColor;
      const gradientStart = preset?.gradientStart || CONFIG.POLYGON_COLOR_PRESETS.default.gradientStart;
      const gradientEnd = preset?.gradientEnd || CONFIG.POLYGON_COLOR_PRESETS.default.gradientEnd;

      // 선 (그라디언트)
      const lineGradient = Utils.createLineGradient(
        this.ctx, legendX, y2, legendX + CONFIG.CHART_LEGEND_ITEM_WIDTH, y2,
        gradientStart,
        gradientEnd
      );
      this.ctx.strokeStyle = lineGradient;
      this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_THICK;
      this.ctx.beginPath();
      this.ctx.moveTo(legendX, y2);
      this.ctx.lineTo(legendX + CONFIG.CHART_LEGEND_ITEM_WIDTH, y2);
      this.ctx.stroke();

      // 점 (단색)
      this.ctx.fillStyle = pointColor;
      this.ctx.beginPath();
      this.ctx.arc(legendX + CONFIG.CHART_LEGEND_POINT_CENTER_X, y2, CONFIG.CHART_LEGEND_POINT_RADIUS, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = CONFIG.getColor('--color-text');
      this.ctx.fillText(`${legendSuffix} 다각형`, legendX + CONFIG.CHART_LEGEND_TEXT_X_OFFSET, y2 + CONFIG.CHART_LEGEND_TEXT_Y_OFFSET - 8);
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

      const { index, relativeFreq, coords, animationProgress = 1.0 } = layer.data;

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

      this.ctx.save();
      this.ctx.strokeStyle = CONFIG.getColor('--chart-dashed-line-color');
      this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_DASHED;
      this.ctx.setLineDash(CONFIG.CHART_DASHED_PATTERN);

      this.ctx.beginPath();
      this.ctx.moveTo(pointX, pointY);
      this.ctx.lineTo(currentEndX, pointY);
      this.ctx.stroke();

      this.ctx.restore(); // setLineDash 초기화
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
        ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_NORMAL;
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
        fontSize: 30,
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

      // 라벨 반경 (30px 폰트 기준, 라벨과 겹치지 않도록)
      const labelRadius = 18;

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
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]); // 점선 패턴

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(toX, toY);
      ctx.stroke();

      ctx.setLineDash([]); // 점선 패턴 해제
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
     */
    draw(classes, axisLabels = null, ellipsisInfo = null, dataType = 'relativeFrequency', tableConfig = null, calloutTemplate = null, clearCanvas = true, unifiedMaxY = null, unifiedClassCount = null, customYInterval = null) {
      if (clearCanvas) {
        // 캔버스 초기화
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;
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
          calloutTemplate
        );
        this.setupAnimations(classes);

        // 자동 재생하지 않고 진행도 100% 상태로 설정
        this.timeline.currentTime = this.timeline.duration;
        this.renderFrame(); // 최종 상태 렌더링
      } else {
        // 정적 렌더링 모드
        this.axisRenderer.drawGrid(
          coords.toX,
          coords.toY,
          coords.adjustedMaxY,
          classes.length,
          ellipsisInfo,
          coords.gridDivisions
        );
        this.histogramRenderer.draw(values, freq, coords, ellipsisInfo, dataType);
        this.polygonRenderer.draw(values, coords, ellipsisInfo);
        this.axisRenderer.drawAxes(classes, coords, coords.adjustedMaxY, axisLabels, ellipsisInfo, dataType, coords.gridDivisions);
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
      const dashedLinesGroup = reversedLayers.find(l => l.id.startsWith('dashed-lines'));

      const pointsGroup = polygonGroup?.children.find(c => c.id.startsWith('points'));

      // 히스토그램도 다각형도 없으면 리턴
      if (!histogramGroup && !polygonGroup) return;

      const bars = histogramGroup?.children || [];
      const points = pointsGroup?.children || [];
      const labels = labelsGroup?.children || [];

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

        // 파선 애니메이션 (점과 동일한 타이밍, 우→좌 그리기)
        const dashedLine = dashedLinesGroup?.children.find(d => d.data?.index === i);
        if (dashedLine && dashedLine.visible) {
          this.timeline.addAnimation(dashedLine.id, {
            startTime: currentTime,
            duration: pointDuration,
            effect: 'draw',
            effectOptions: { direction: 'right-to-left' },
            easing: 'easeOut'
          });
        }

        // 다음 계급으로
        currentTime += Math.max(barDuration, pointDuration) + classDelay;
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
     */
    disableAnimation() {
      this.animationMode = false;
      this.stopAnimation();
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
        this.currentClasses.length,
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

      // 렌더링 순서: bar → triangle → triangle-label-line → triangle-label → line → dashed-line → point (타입 기준 정렬)
      const renderOrder = { 'bar': 0, 'triangle': 1, 'triangle-label-line': 2, 'triangle-label': 3, 'line': 4, 'dashed-line': 5, 'point': 6, 'bar-label': 7, 'callout': 8 };
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
      const tableLabels = config?.labels || CONFIG.DEFAULT_LABELS.table;
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
      const { x, y, width, height, cellText, alignment, headerTextColor } = layer.data;

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
        tallyCount
      } = layer.data;

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
      const { x, y, width, height, cellText, alignment } = layer.data;

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
      const { x, y, width, height, cellText, alignment, textColor } = layer.data;

      const cellX = this._getCellXPosition(x, width, alignment);
      const cellY = y + height / 2;

      // 커스텀 색상이 있으면 사용, 없으면 헤더 색상 사용
      const color = textColor || CONFIG.TABLE_HEADER_TEXT_COLOR;

      // 숫자/알파벳이면 KaTeX 폰트 적용
      this._renderCellText(cellText, cellX, cellY, alignment, color);
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
     * 이원분류표 격자선 렌더링 (2행 헤더 구조)
     * @param {Layer} layer - 격자선 레이어
     */
    renderCrossTableGrid(layer) {
      const {
        x, y, width, height, rowCount, columnWidths, hasSummaryRow,
        mergedHeaderHeight, columnHeaderHeight,
        mergedHeaderLineColor, mergedHeaderLineWidth,
        showMergedHeader = true
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
      for (let i = 1; i <= rowCount; i++) {
        const lineY = y + totalHeaderHeight + (i - 1) * CONFIG.TABLE_ROW_HEIGHT;

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

      // 전체 최대 잎 개수에 따라 폰트 크기 조정 (일관성 유지)
      // 단일 모드: 11개 이상, 비교 모드: 7개 이상일 때 폰트 축소
      const { maxLeafCount = 0, isSingleMode = false } = layer.data;
      const threshold = isSingleMode ? 11 : 7;
      const fontSize = maxLeafCount >= threshold ? 20 : 24;

      // 변수인 경우와 일반 잎 데이터 분기
      if (isVariable) {
        // 변수인 경우: 동적 폰트 크기 + 이탤릭 강제
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
      const str = String(text).trim();
      const fontSize = isHeader ? 22 : 24;

      // 언더바만 있는 경우 빈칸으로 처리 (렌더링 스킵)
      if (str === '_' || str === '') {
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
        this._renderTextWithSmallParen(parenMatch[1], parenMatch[2], x, y, alignment, color, bold, fontSize);
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
        this._renderMixedText(str, x, y, alignment, color, bold, fontSize);
      } else {
        // 한글 등은 기본 폰트 사용 (괄호 처리는 상단에서 이미 완료됨)
        this.ctx.fillStyle = color;
        this.ctx.textBaseline = 'middle';
        this.ctx.font = bold ? CONFIG.TABLE_FONT_SUMMARY : CONFIG.TABLE_FONT_DATA;
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
     */
    _renderMixedText(text, x, y, alignment, color, bold, fontSize) {
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
        this.ctx.font = this._getFontForCharType(seg.type, segFontSize, bold);
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
        this.ctx.font = this._getFontForCharType(seg.type, segFontSize, bold);
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
     */
    _renderTextWithSmallParen(mainText, parenText, x, y, alignment, color, bold, fontSize) {
      this.ctx.save();
      this.ctx.fillStyle = color;
      this.ctx.textBaseline = 'middle';

      const smallFont = bold ? 'bold 12px sans-serif' : '12px sans-serif';
      const koreanFontSize = 18;

      // 메인 텍스트 너비 계산
      let mainWidth = 0;
      const isMixed = this._containsMixedKoreanAndNumeric(mainText);

      if (isMixed) {
        // 혼합 텍스트: 세그먼트별 너비 계산
        const segments = this._splitByCharType(mainText);
        segments.forEach(seg => {
          const segFontSize = seg.type === 'korean' ? koreanFontSize : fontSize;
          this.ctx.font = this._getFontForCharType(seg.type, segFontSize, bold);
          mainWidth += this.ctx.measureText(seg.text).width;
        });
      } else {
        // 순수 한글: 기본 폰트
        this.ctx.font = bold ? CONFIG.TABLE_FONT_SUMMARY : CONFIG.TABLE_FONT_DATA;
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
          this.ctx.font = this._getFontForCharType(seg.type, segFontSize, bold);
          this.ctx.fillText(seg.text, currentX, y);
          currentX += this.ctx.measureText(seg.text).width;
        });
      } else {
        // 순수 한글
        this.ctx.font = bold ? CONFIG.TABLE_FONT_SUMMARY : CONFIG.TABLE_FONT_DATA;
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
     * @returns {string} CSS 폰트 문자열
     */
    _getFontForCharType(type, fontSize, bold = false) {
      if (type === 'korean') {
        // 한글만 볼드 적용
        const fontWeight = bold ? 'bold ' : '';
        return `${fontWeight}${fontSize}px sans-serif`;
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
      // 헤더인 경우 더 작은 폰트 사용
      const normalFontSize = isHeader ? 18 : 24;
      const superFontSize = isHeader ? 11 : 14;
      const superYOffset = isHeader ? -6 : -8;

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
      return ctx.measureText(String(text)).width;
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
            const dataWidth = this.measureTextWidth(ctx, row[col], dataFont) + cellPadding;
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
   * 이원 분류표 테이블 팩토리
   * 행: 카테고리 (혈액형 등), 열: 그룹 (남학생, 여학생 등)
   * 2행 헤더 구조: 병합 헤더(상대도수) + 컬럼 헤더
   */


  // 이원분류표 전용 상수
  const CROSS_TABLE_CONFIG = {
    MERGED_HEADER_HEIGHT: 35,           // 병합 헤더 높이
    MERGED_HEADER_TEXT: '상대도수',      // 병합 헤더 텍스트
    MERGED_HEADER_LINE_COLOR: '#8DCF66', // 병합 헤더 아래 구분선 색상
    MERGED_HEADER_LINE_WIDTH: 1          // 구분선 두께
  };

  class CrossTableFactory {
    /**
     * 이원 분류표 레이어 생성
     * @param {LayerManager} layerManager - 레이어 매니저
     * @param {Object} data - 파싱된 데이터 { rowLabelColumn, columnHeaders, rows, totals, showTotal, showMergedHeader }
     * @param {Object} config - 테이블 설정
     * @param {string} tableId - 테이블 고유 ID
     */
    static createTableLayers(layerManager, data, config = null, tableId = 'table-1') {
      const { rowLabelColumn, columnHeaders, rows, totals, showTotal = true, showMergedHeader = true, mergedHeaderText = null } = data;

      // 커스텀 병합 헤더 텍스트 (없으면 기본값 '상대도수')
      const headerText = mergedHeaderText || CROSS_TABLE_CONFIG.MERGED_HEADER_TEXT;

      // 열 개수: 행 라벨 열 + 데이터 열들
      const columnCount = columnHeaders.length + 1;
      // 행 개수: 데이터 행 + 합계 행 (옵션)
      const rowCount = rows.length + (showTotal ? 1 : 0);

      const padding = CONFIG.TABLE_PADDING;
      const canvasWidth = config?.canvasWidth || CONFIG.TABLE_CANVAS_WIDTH;

      // Canvas 높이 계산 (병합 헤더 조건부 + 컬럼 헤더 + 데이터 행들)
      const mergedHeaderHeight = showMergedHeader ? CROSS_TABLE_CONFIG.MERGED_HEADER_HEIGHT : 0;
      const totalHeaderHeight = mergedHeaderHeight + CONFIG.TABLE_HEADER_HEIGHT;
      const canvasHeight = totalHeaderHeight + (rowCount * CONFIG.TABLE_ROW_HEIGHT) + padding * 2;

      // 열 너비 계산 (config에서 전달받거나 자동 계산)
      const columnWidths = config?.columnWidths || this._calculateColumnWidths(canvasWidth, padding, columnCount);

      // 테이블 타입
      const tableType = CONFIG.TABLE_TYPES.CROSS_TABLE;

      // 루트 레이어 생성
      const rootLayer = new Layer({
        id: `${tableType}-${tableId}-table-root`,
        name: '이원 분류표',
        type: 'group',
        visible: true,
        order: 0,
        data: {
          canvasWidth,
          canvasHeight,
          padding,
          columnCount,
          rowCount,
          tableType: CONFIG.TABLE_TYPES.CROSS_TABLE
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
        showMergedHeader
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
          mergedHeaderHeight
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
          mergedHeaderHeight
        );
        rootLayer.addChild(summaryLayer);
      }

      // LayerManager에 추가
      layerManager.addLayer(rootLayer, 'root');
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
     * 격자선 레이어 생성 (이원분류표 전용)
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
        showMergedHeader = true
      } = options;

      const totalWidth = canvasWidth - padding * 2;
      const totalHeaderHeight = mergedHeaderHeight + CONFIG.TABLE_HEADER_HEIGHT;
      const totalHeight = totalHeaderHeight + (rowCount * CONFIG.TABLE_ROW_HEIGHT);

      return new Layer({
        id: `cross-table-${tableId}-table-grid`,
        name: '격자선',
        type: 'cross-table-grid',  // 이원분류표 전용 타입
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
          mergedHeaderLineColor: CROSS_TABLE_CONFIG.MERGED_HEADER_LINE_COLOR,
          mergedHeaderLineWidth: CROSS_TABLE_CONFIG.MERGED_HEADER_LINE_WIDTH,
          showMergedHeader
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
    static _createMergedHeaderLayer(columnWidths, padding, tableId, headerText = CROSS_TABLE_CONFIG.MERGED_HEADER_TEXT) {
      const mergedHeaderGroup = new Layer({
        id: `cross-table-${tableId}-table-merged-header`,
        name: '병합 헤더',
        type: 'group',
        visible: true,
        order: 1,
        data: {}
      });

      const y = padding;

      // 첫 번째 열은 빈 칸
      const emptyCell = new Layer({
        id: `cross-table-${tableId}-table-merged-header-empty`,
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
          height: CROSS_TABLE_CONFIG.MERGED_HEADER_HEIGHT,
          alignment: 'center',
          highlighted: false,
          highlightProgress: 0
        }
      });
      mergedHeaderGroup.addChild(emptyCell);

      // 나머지 열은 커스텀 텍스트 병합
      const mergedWidth = columnWidths.slice(1).reduce((a, b) => a + b, 0);
      const mergedCell = new Layer({
        id: `cross-table-${tableId}-table-merged-header-title`,
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
          height: CROSS_TABLE_CONFIG.MERGED_HEADER_HEIGHT,
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
    static _createColumnHeaderLayer(rowLabelColumn, columnHeaders, columnWidths, padding, tableId, mergedHeaderHeight = CROSS_TABLE_CONFIG.MERGED_HEADER_HEIGHT) {
      const headerGroup = new Layer({
        id: `cross-table-${tableId}-table-header`,
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
          id: `cross-table-${tableId}-table-header-col${i}`,
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
    static _createDataRowLayer(row, rowIndex, columnWidths, padding, tableId, mergedHeaderHeight = CROSS_TABLE_CONFIG.MERGED_HEADER_HEIGHT) {
      const rowGroup = new Layer({
        id: `cross-table-${tableId}-table-row-${rowIndex}`,
        name: `데이터 행 ${rowIndex}`,
        type: 'group',
        visible: true,
        order: rowIndex + 3,  // 0: grid, 1: merged-header, 2: column-header, 3+: data rows
        data: { rowIndex }
      });

      // Y 좌표 계산 (병합 헤더 + 컬럼 헤더 이후)
      const totalHeaderHeight = mergedHeaderHeight + CONFIG.TABLE_HEADER_HEIGHT;
      const y = padding + totalHeaderHeight + (rowIndex * CONFIG.TABLE_ROW_HEIGHT);
      let x = padding;

      // 첫 번째 열은 행 라벨 (혈액형 값: A, B, AB, O)
      const cells = [row.label, ...row.values];

      cells.forEach((cellText, colIndex) => {
        const isLabelColumn = colIndex === 0;

        // 값 포맷팅 (소수점인 경우)
        let displayText = cellText;
        if (typeof cellText === 'number' && !isLabelColumn) {
          displayText = cellText.toFixed(2).replace(/\.?0+$/, '');
        }

        const cellLayer = new Layer({
          id: `cross-table-${tableId}-table-row-${rowIndex}-col${colIndex}`,
          name: String(displayText),
          type: 'cell',
          visible: true,
          order: colIndex,
          data: {
            rowType: isLabelColumn ? 'row-header' : 'data',
            rowIndex,
            colIndex,
            colLabel: '',
            cellText: String(displayText),
            x,
            y,
            width: columnWidths[colIndex],
            height: CONFIG.TABLE_ROW_HEIGHT,
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
    static _createSummaryRowLayer(totals, dataRowCount, columnWidths, padding, tableId, mergedHeaderHeight = CROSS_TABLE_CONFIG.MERGED_HEADER_HEIGHT) {
      const summaryGroup = new Layer({
        id: `cross-table-${tableId}-table-summary`,
        name: '합계 행',
        type: 'group',
        visible: true,
        order: dataRowCount + 3,
        data: {}
      });

      // Y 좌표 계산 (병합 헤더 + 컬럼 헤더 + 데이터 행들 이후)
      const totalHeaderHeight = mergedHeaderHeight + CONFIG.TABLE_HEADER_HEIGHT;
      const y = padding + totalHeaderHeight + (dataRowCount * CONFIG.TABLE_ROW_HEIGHT);
      let x = padding;

      // 첫 번째 열은 "합계"
      const cells = ['합계', ...totals];

      cells.forEach((cellText, colIndex) => {
        let displayText = cellText;
        if (typeof cellText === 'number') {
          // 1인 경우 그대로 1로 표시, 그 외는 소수점 처리
          displayText = cellText === 1 ? '1' : cellText.toFixed(2).replace(/\.?0+$/, '');
        }

        const cellLayer = new Layer({
          id: `cross-table-${tableId}-table-summary-col${colIndex}`,
          name: String(displayText),
          type: 'cell',
          visible: true,
          order: colIndex,
          data: {
            rowType: 'summary',
            rowIndex: dataRowCount,
            colIndex,
            colLabel: '',
            cellText: String(displayText),
            x,
            y,
            width: columnWidths[colIndex],
            height: CONFIG.TABLE_ROW_HEIGHT,
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

    // =============================================
    // 단일 모드 (줄기 | 잎) - 2열
    // =============================================

    /**
     * 단일 모드 테이블 레이어 생성
     */
    static _createSingleModeTableLayers(layerManager, data, config, tableId) {
      const { stems } = data;

      const columnCount = 2;  // 줄기 | 잎
      const rowCount = stems.length;

      const padding = CONFIG.TABLE_PADDING;
      const canvasWidth = CONFIG.TABLE_CANVAS_WIDTH;
      const canvasHeight = BaseTableFactory.calculateCanvasHeight(rowCount, padding);

      // 전체 잎 중 최대 개수 계산 (폰트 크기 일관성용)
      const maxLeafCount = Math.max(...stems.map(s => s.leaves.length));

      // 열 너비 계산 (줄기 30% | 잎 70%)
      const columnWidths = this._calculateSingleModeColumnWidths(canvasWidth, padding);

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
     * 단일 모드 열 너비 계산 (줄기 30% | 잎 70%)
     */
    static _calculateSingleModeColumnWidths(canvasWidth, padding) {
      const totalWidth = canvasWidth - padding * 2;
      return [
        totalWidth * 0.3,  // 줄기
        totalWidth * 0.7   // 잎
      ];
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
          isSingleMode: true
        }
      });
      rowGroup.addChild(leavesCell);

      return rowGroup;
    }

    // =============================================
    // 비교 모드 (잎 | 줄기 | 잎) - 3열
    // =============================================

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
      const canvasWidth = CONFIG.TABLE_CANVAS_WIDTH;
      const canvasHeight = BaseTableFactory.calculateCanvasHeight(rowCount, padding);

      // 전체 잎 중 최대 개수 계산 (왼쪽/오른쪽 모두 고려, 폰트 크기 일관성용)
      const maxLeafCount = Math.max(
        ...stems.map(s => s.leftLeaves.length),
        ...stems.map(s => s.rightLeaves.length)
      );

      // 열 너비 계산 (왼쪽 잎 | 줄기 | 오른쪽 잎)
      const columnWidths = this._calculateCompareModeColumnWidths(canvasWidth, padding);

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
     * 비교 모드 열 너비 계산 (왼쪽 40% | 줄기 20% | 오른쪽 40%)
     */
    static _calculateCompareModeColumnWidths(canvasWidth, padding) {
      const totalWidth = canvasWidth - padding * 2;
      return [
        totalWidth * 0.4,  // 왼쪽 잎
        totalWidth * 0.2,  // 줄기
        totalWidth * 0.4   // 오른쪽 잎
      ];
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
          isSingleMode: false
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
          isSingleMode: false
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

        case CONFIG.TABLE_TYPES.CROSS_TABLE:
          return CrossTableFactory.createTableLayers(layerManager, data, config, tableId);

        case CONFIG.TABLE_TYPES.STEM_LEAF:
          return StemLeafFactory.createTableLayers(layerManager, data, config, tableId);

        case CONFIG.TABLE_TYPES.FREQUENCY:
        default:
          // 도수분포표는 기존 TableLayerFactory 사용 (별도 처리)
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
        case CONFIG.TABLE_TYPES.CROSS_TABLE:
          return CrossTableFactory;
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
   * 도수분포표의 표시 설정을 관리
   */


  /**
   * @class TableStore
   * @description 테이블 관련 설정(컬럼 표시, 순서, 라벨)을 저장하는 저장소
   */
  class TableStore {
    constructor() {
      this.visibleColumns = [...CONFIG.TABLE_DEFAULT_VISIBLE_COLUMNS]; // 6개 컬럼 표시 여부
      this.columnOrder = [...CONFIG.TABLE_DEFAULT_COLUMN_ORDER];       // 컬럼 순서
      this.labels = null;                                               // 테이블 라벨
      this.columnAlignment = { ...CONFIG.TABLE_DEFAULT_ALIGNMENT };     // 컬럼별 정렬
      this.cellVariables = new Map();                                   // 셀 변수 치환 정보
      this.summaryRowVisible = new Map();                               // 테이블별 합계 행 표시 여부
      this.mergedHeaderVisible = new Map();                             // 테이블별 병합 헤더 표시 여부 (이원분류표)
    }

    /**
     * 테이블 설정 저장
     * @param {Array} visibleColumns - 표시할 컬럼 배열
     * @param {Array} columnOrder - 컬럼 순서 배열
     * @param {Object} labels - 테이블 라벨 객체
     */
    setConfig(visibleColumns, columnOrder, labels) {
      this.visibleColumns = visibleColumns;
      this.columnOrder = columnOrder;
      this.labels = labels;
    }

    /**
     * 테이블 설정 가져오기
     * @returns {Object} 테이블 설정 객체
     */
    getConfig() {
      return {
        visibleColumns: this.visibleColumns,
        columnOrder: this.columnOrder,
        labels: this.labels || CONFIG.DEFAULT_LABELS.table
      };
    }

    /**
     * 표시할 컬럼 설정
     * @param {Array} visibleColumns - 표시할 컬럼 배열
     */
    setVisibleColumns(visibleColumns) {
      this.visibleColumns = visibleColumns;
    }

    /**
     * 컬럼 순서 설정
     * @param {Array} columnOrder - 컬럼 순서 배열
     */
    setColumnOrder(columnOrder) {
      this.columnOrder = columnOrder;
    }

    /**
     * 테이블 라벨 설정
     * @param {Object} labels - 테이블 라벨 객체
     */
    setLabels(labels) {
      this.labels = labels;
    }

    /**
     * 컬럼 정렬 설정
     * @param {string} columnName - 컬럼 이름
     * @param {string} alignment - 정렬 방식 ('left', 'center', 'right')
     */
    setColumnAlignment(columnName, alignment) {
      this.columnAlignment[columnName] = alignment;
    }

    /**
     * 컬럼 정렬 가져오기
     * @param {string} columnName - 컬럼 이름
     * @returns {string} 정렬 방식
     */
    getColumnAlignment(columnName) {
      return this.columnAlignment[columnName] || 'center';
    }

    /**
     * 모든 컬럼 정렬 가져오기
     * @returns {Object} 컬럼별 정렬 객체
     */
    getAllAlignments() {
      return { ...this.columnAlignment };
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
    // 병합 헤더 표시 관련 메서드 (이원분류표 전용)
    // =============================================

    /**
     * 병합 헤더 표시 여부 설정 (이원분류표)
     * @param {string} tableId - 테이블 ID
     * @param {boolean} visible - 표시 여부
     */
    setMergedHeaderVisible(tableId, visible) {
      this.mergedHeaderVisible.set(tableId, visible);
    }

    /**
     * 병합 헤더 표시 여부 조회 (이원분류표)
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
      this.visibleColumns = [...CONFIG.TABLE_DEFAULT_VISIBLE_COLUMNS];
      this.columnOrder = [...CONFIG.TABLE_DEFAULT_COLUMN_ORDER];
      this.labels = null;
      this.columnAlignment = { ...CONFIG.TABLE_DEFAULT_ALIGNMENT };
      this.cellVariables.clear();
      this.summaryRowVisible.clear();
      this.mergedHeaderVisible.clear();
    }

    /**
     * JSON 형식으로 변환 (Export용)
     * @returns {Object} JSON 객체
     */
    toJSON() {
      return {
        visibleColumns: this.visibleColumns,
        columnOrder: this.columnOrder,
        labels: this.labels,
        columnAlignment: this.columnAlignment
      };
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

      // 현재 설정 저장 (renderFrame에서 사용)
      this.currentClasses = null;
      this.currentTotal = null;
      this.currentConfig = null;

      // 타임라인 콜백
      this.timeline.onUpdate = () => this.renderFrame();

      // 편집 모달 관리자
      this.editModal = new TableEditModal(this);

      // 셀 클릭 이벤트 (변수 치환용) - TableEditModal로 위임
      this.canvas.addEventListener('click', (e) => this.editModal.handleCanvasClick(e));
    }

    /**
     * canvasId에서 tableId 추출
     * @param {string} canvasId - Canvas ID (예: 'frequencyTable', 'frequencyTable-2')
     * @returns {string} 테이블 ID (예: 'table-1', 'table-2')
     */
    extractTableId(canvasId) {
      // 'frequencyTable' → 'table-1'
      // 'frequencyTable-2' → 'table-2'
      if (canvasId === 'frequencyTable') {
        return 'table-1';
      }
      const match = canvasId.match(/frequencyTable-(\d+)/);
      if (match) {
        return `table-${match[1]}`;
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

      // 합계 행 표시 여부 (tableStore에서 가져오기)
      const showSummaryRow = tableStore.getSummaryRowVisible(this.tableId);

      // Canvas 크기 계산
      const rowCount = visibleClasses.length + (showSummaryRow ? 1 : 0); // 합계 행 조건부
      const canvasHeight = CONFIG.TABLE_HEADER_HEIGHT + (rowCount * CONFIG.TABLE_ROW_HEIGHT) + this.padding * 2;

      // 동적 너비 계산
      const dynamicConfig = this._calculateFrequencyTableDynamicWidth(visibleClasses, total, config, showSummaryRow);

      this.canvas.width = dynamicConfig.canvasWidth;
      this.canvas.height = canvasHeight;
      this.clear();

      // 레이어 생성
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
        case 'cross-table-grid':
          this.cellRenderer.renderCrossTableGrid(layer);
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
      if (type === CONFIG.TABLE_TYPES.CROSS_TABLE) {
        data.showTotal = tableStore.getSummaryRowVisible(this.tableId);
        data.showMergedHeader = tableStore.getMergedHeaderVisible(this.tableId);
      }

      // 행 수 계산 (타입별)
      const rowCount = this._calculateRowCount(type, data);

      // Canvas 크기 계산 (이원분류표는 병합 헤더 조건부 추가)
      const showMergedHeader = type === CONFIG.TABLE_TYPES.CROSS_TABLE && data.showMergedHeader !== false;
      const mergedHeaderHeight = showMergedHeader ? 35 : 0;
      const canvasHeight = mergedHeaderHeight + CONFIG.TABLE_HEADER_HEIGHT + (rowCount * CONFIG.TABLE_ROW_HEIGHT) + this.padding * 2;

      // 동적 너비 계산 (줄기-잎 제외)
      const dynamicConfig = this._calculateCustomTableDynamicWidth(type, data, config);

      this.canvas.width = dynamicConfig.canvasWidth;
      this.canvas.height = canvasHeight;
      this.clear();

      // 레이어 생성 (TableFactoryRouter 사용)
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

        case CONFIG.TABLE_TYPES.CROSS_TABLE:
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
      // 줄기-잎은 기존 고정 너비 사용
      if (type === CONFIG.TABLE_TYPES.STEM_LEAF) {
        return {
          columnWidths: null,
          canvasWidth: CONFIG.TABLE_CANVAS_WIDTH
        };
      }

      let headers = [];
      let rows = [];

      switch (type) {
        case CONFIG.TABLE_TYPES.CATEGORY_MATRIX:
          // 카테고리 행렬 (data.headers 사용)
          headers = ['', ...(data.headers || [])];
          rows = (data.rows || []).map(row => [row.label, ...row.values.map(String)]);
          break;

        case CONFIG.TABLE_TYPES.CROSS_TABLE:
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
      const rootLayer = this.layerManager.root;
      if (rootLayer && rootLayer.children.length > 0) {
        // root의 자식들(도수분포표)을 렌더링
        rootLayer.children.forEach(child => this.renderLayer(child));
      }
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
   * Visualization API
   * External API for creating charts and tables easily
   */


  // Counter for unique ID generation
  let chartInstanceCounter = 0;
  let tableInstanceCounter = 0;

  /**
   * Main Rendering API
   * @param {HTMLElement} element - Container element to append canvas
   * @param {Object} config - Configuration object
   * @param {string} [config.purpose='chart'] - Rendering purpose ('chart' | 'table')
   * @param {string} config.data - Raw data string (comma/space separated)
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
      return renderChart(element, config);
    } else if (purpose === 'table') {
      return renderTable(element, config);
    } else {
      return { error: `Invalid purpose: ${purpose}. Use 'chart' or 'table'.` };
    }
  }

  /**
   * Chart Rendering API
   * @param {HTMLElement} element - Container element to append canvas
   * @param {Object} config - Configuration object
   * @param {string} config.tableType - Table type ('frequency', 'stem-leaf', etc.)
   * @param {string} config.data - Raw data string (comma/space separated)
   * @param {number} [config.classCount=5] - Number of classes (for frequency table)
   * @param {number} [config.classWidth] - Class width (auto-calculated if not specified)
   * @param {Object} [config.options] - Additional options
   * @param {Object} [config.options.axisLabels] - Axis labels { xAxis, yAxis }
   * @param {string} [config.options.dataType='relativeFrequency'] - Data type ('frequency' | 'relativeFrequency')
   * @param {boolean} [config.options.showHistogram=true] - Show histogram bars
   * @param {boolean} [config.options.showPolygon=true] - Show frequency polygon
   * @param {boolean} [config.options.animation=true] - Enable animation
   * @returns {Promise<Object>} { chartRenderer, canvas, classes } or { error }
   */
  async function renderChart(element, config) {
    try {
      // Wait for KaTeX fonts to load
      await waitForFonts();
      // 1. Parameter validation
      if (!element || !(element instanceof HTMLElement)) {
        return { error: 'element must be a valid HTMLElement' };
      }

      if (!config || !config.data) {
        return { error: 'config.data is required' };
      }

      const tableType = config.tableType || 'frequency';

      // Currently only frequency type supports chart
      if (tableType !== 'frequency') {
        return { error: `'${tableType}' type does not support chart. Only 'frequency' type is supported.` };
      }

      // 2. Parse data (support both array and string format)
      const dataString = Array.isArray(config.data)
        ? config.data.join(', ')
        : config.data;
      const rawData = DataProcessor.parseInput(dataString);
      if (rawData.length === 0) {
        return { error: 'No valid numeric data found' };
      }

      // 3. Calculate statistics
      const stats = DataProcessor.calculateBasicStats(rawData);

      // 4. Create classes
      const classCount = config.classCount || 5;
      const classWidth = config.classWidth || null;
      const { classes, classInterval } = DataProcessor.createClasses(stats, classCount, classWidth);

      // 5. Calculate frequencies
      DataProcessor.calculateFrequencies(rawData, classes);

      // 6. Generate ellipsis info
      const ellipsisInfo = DataProcessor.shouldShowEllipsis(classes);

      // 7. Create canvas element (support custom canvasSize)
      const canvasId = `viz-chart-${++chartInstanceCounter}`;
      const canvas = document.createElement('canvas');
      canvas.id = canvasId;
      const canvasSize = config.canvasSize || CONFIG.CANVAS_WIDTH;
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', 'Frequency histogram and relative frequency polygon');

      element.appendChild(canvas);

      // 8. Create ChartRenderer and render
      const chartRenderer = new ChartRenderer(canvasId);

      // Process options (support both config.animation object and options.animation boolean)
      const options = config.options || {};
      const axisLabels = options.axisLabels || null;
      const dataType = options.dataType || 'relativeFrequency';
      const animationConfig = config.animation !== undefined ? config.animation : options.animation;
      const animation = typeof animationConfig === 'object'
        ? animationConfig.enabled !== false
        : animationConfig !== false;

      // Show/hide histogram and polygon
      const showHistogram = options.showHistogram !== false;
      const showPolygon = options.showPolygon !== false;
      CONFIG.SHOW_HISTOGRAM = showHistogram;
      CONFIG.SHOW_POLYGON = showPolygon;

      if (!animation) {
        chartRenderer.disableAnimation();
      }

      // 9. Draw chart
      chartRenderer.draw(classes, axisLabels, ellipsisInfo, dataType);

      // 10. Return result
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
   * @param {string} config.data - Raw data string (comma/space separated)
   * @param {number} [config.classCount=5] - Number of classes
   * @param {number} [config.classWidth] - Class width (auto-calculated if not specified)
   * @param {Object} [config.options] - Additional options
   * @param {Object} [config.options.tableConfig] - Table configuration
   * @param {boolean} [config.options.animation=true] - Enable animation
   * @returns {Promise<Object>} { tableRenderer, canvas, classes, stats } or { error }
   */
  async function renderTable(element, config) {
    try {
      // Wait for KaTeX fonts to load
      await waitForFonts();
      // 1. Parameter validation
      if (!element || !(element instanceof HTMLElement)) {
        return { error: 'element must be a valid HTMLElement' };
      }

      if (!config || !config.data) {
        return { error: 'config.data is required' };
      }

      // 2. Parse data (support both array and string format)
      const dataString = Array.isArray(config.data)
        ? config.data.join(', ')
        : config.data;
      const rawData = DataProcessor.parseInput(dataString);
      if (rawData.length === 0) {
        return { error: 'No valid numeric data found' };
      }

      // 3. Calculate statistics
      const stats = DataProcessor.calculateBasicStats(rawData);

      // 4. Create classes
      const classCount = config.classCount || 5;
      const classWidth = config.classWidth || null;
      const { classes } = DataProcessor.createClasses(stats, classCount, classWidth);

      // 5. Calculate frequencies
      DataProcessor.calculateFrequencies(rawData, classes);
      DataProcessor.calculateRelativeAndCumulative(classes, rawData.length);

      // 6. Create canvas element
      const canvasId = `viz-table-${++tableInstanceCounter}`;
      const canvas = document.createElement('canvas');
      canvas.id = canvasId;
      canvas.width = config.canvasWidth || CONFIG.TABLE_DEFAULT_WIDTH || 600;
      canvas.height = config.canvasHeight || CONFIG.TABLE_DEFAULT_HEIGHT || 400;
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', 'Frequency distribution table');

      element.appendChild(canvas);

      // 7. Create TableRenderer and render
      const tableRenderer = new TableRenderer(canvasId);

      // Process options
      const options = config.options || {};
      const tableConfig = options.tableConfig || null;
      const animationConfig = config.animation !== undefined ? config.animation : options.animation;
      const animation = typeof animationConfig === 'object'
        ? animationConfig.enabled !== false
        : animationConfig !== false;

      if (!animation) {
        tableRenderer.animationMode = false;
      }

      // 8. Draw table
      tableRenderer.draw(classes, rawData.length, tableConfig);

      // 9. Return result
      return {
        tableRenderer,
        canvas,
        classes,
        stats
      };

    } catch (error) {
      console.error('renderTable error:', error);
      return { error: error.message };
    }
  }

  var vizApi = { render, renderChart, renderTable };

  exports.default = vizApi;
  exports.render = render;
  exports.renderChart = renderChart;
  exports.renderTable = renderTable;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=viz-api.js.map

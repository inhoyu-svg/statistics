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

  // 테이블 Canvas 설정
  TABLE_CANVAS_WIDTH: 700,
  TABLE_ROW_HEIGHT: 40,
  TABLE_HEADER_HEIGHT: 45,
  TABLE_PADDING: 10,
  TABLE_FONT_HEADER: 'bold 14px sans-serif',
  TABLE_FONT_DATA: '14px sans-serif',
  TABLE_FONT_SUMMARY: 'bold 14px sans-serif',
  TABLE_SHOW_SUPERSCRIPT: true, // 첫 계급에 상첨자(이상/미만) 표시 여부
  TABLE_SUPERSCRIPT_Y_OFFSET: 4, // 상첨자 위치 오프셋 (위로 이동)

  // 기본 라벨 (고급 설정)
  DEFAULT_LABELS: {
    xAxis: '계급',
    yAxis: '상대도수',
    table: {
      class: '계급',
      midpoint: '계급값',
      frequency: '도수',
      relativeFrequency: '상대도수(%)',
      cumulativeFrequency: '누적도수',
      cumulativeRelativeFrequency: '누적상대도수(%)'
    }
  },

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
      yAxisLabel: '상대도수(%)',
      legendSuffix: '상대도수'
    },
    {
      id: 'frequency',
      label: '도수',
      yAxisLabel: '도수',
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
  CALLOUT_BORDER_RADIUS: 5.46,              // 모서리 둥글기
  CALLOUT_PADDING: 8,                       // 내부 패딩
  CALLOUT_FONT: '16px sans-serif',          // 폰트
  CALLOUT_LINE_HEIGHT: 20,                  // 줄 간격
  CALLOUT_TEMPLATE: '남학생',                // 기본 템플릿

  // 차트 요소 표시 설정
  SHOW_HISTOGRAM: true,                     // 히스토그램 표시 여부 (기본값)
  SHOW_POLYGON: true,                       // 도수 다각형 표시 여부 (기본값)

  // 막대 라벨 설정
  SHOW_BAR_LABELS: false,                   // 막대 위 값 표시 여부 (기본값)

  // 파선 설정
  SHOW_DASHED_LINES: false,                 // 수직 파선 표시 여부 (기본값)

  // 격자선 설정
  GRID_SHOW_HORIZONTAL: true,               // 가로 격자선 표시 여부
  GRID_SHOW_VERTICAL: true,                 // 세로 격자선 표시 여부

  // 축 라벨 설정
  AXIS_SHOW_Y_LABELS: true,                 // Y축 값 라벨 표시 여부 (파선 끝점)
  AXIS_SHOW_X_LABELS: true,                 // X축 값 라벨 표시 여부

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

  // 색상 캐시 (성능 최적화)
  _colorCache: null,

  // CSS 색상 초기화 (앱 시작 시 한 번만 호출)
  initializeColors() {
    if (this._colorCache) return;

    const style = getComputedStyle(document.documentElement);
    this._colorCache = {
      '--color-text': style.getPropertyValue('--color-text').trim(),
      '--color-grid': style.getPropertyValue('--color-grid').trim(),
      '--color-border': style.getPropertyValue('--color-border').trim(),
      '--color-text-light': style.getPropertyValue('--color-text-light').trim(),
      '--chart-bar-color': style.getPropertyValue('--chart-bar-color').trim(),
      '--chart-bar-color-end': style.getPropertyValue('--chart-bar-color-end').trim(),
      '--chart-bar-border-color': style.getPropertyValue('--chart-bar-border-color').trim(),
      '--chart-bar-stroke-start': style.getPropertyValue('--chart-bar-stroke-start').trim(),
      '--chart-bar-stroke-end': style.getPropertyValue('--chart-bar-stroke-end').trim(),
      '--chart-polygon-point-color': style.getPropertyValue('--chart-polygon-point-color').trim(),
      '--chart-polygon-line-start': style.getPropertyValue('--chart-polygon-line-start').trim(),
      '--chart-polygon-line-end': style.getPropertyValue('--chart-polygon-line-end').trim(),
      '--chart-line-color-start': style.getPropertyValue('--chart-line-color-start').trim(),
      '--chart-line-color-end': style.getPropertyValue('--chart-line-color-end').trim(),
      '--chart-polygon-color': style.getPropertyValue('--chart-polygon-color').trim(),
      '--chart-dashed-line-color': style.getPropertyValue('--chart-dashed-line-color').trim(),
      '--chart-callout-bg-start': style.getPropertyValue('--chart-callout-bg-start').trim(),
      '--chart-callout-bg-end': style.getPropertyValue('--chart-callout-bg-end').trim(),
      '--chart-callout-border': style.getPropertyValue('--chart-callout-border').trim(),
      '--chart-callout-text': style.getPropertyValue('--chart-callout-text').trim(),
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

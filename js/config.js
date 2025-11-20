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

  // 중략(Ellipsis) 패턴 설정
  CHART_ZIGZAG_HEIGHT: 15,
  CHART_ZIGZAG_WIDTH: 8,
  CHART_ZIGZAG_COUNT: 3,
  CHART_ZIGZAG_MARGIN: 5,

  // 중략 판단 기준
  ELLIPSIS_THRESHOLD: 2,
  ELLIPSIS_POSITION_RATIO: 0.25, // 압축 구간에서 이중물결 기호 위치 (0~1 사이 값)

  // 차트 색상 (하드코딩 방지)
  CHART_BAR_BORDER_COLOR: '#57F684',
  CHART_POLYGON_COLOR: '#FC9A63',

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
  TABLE_FONT_DATA: '13px sans-serif',
  TABLE_FONT_SUMMARY: 'bold 13px sans-serif',

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
      '--chart-line-color-start': style.getPropertyValue('--chart-line-color-start').trim(),
      '--chart-line-color-end': style.getPropertyValue('--chart-line-color-end').trim(),
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

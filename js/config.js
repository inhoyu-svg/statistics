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

  // 차트 색상 (하드코딩 방지)
  CHART_BAR_BORDER_COLOR: '#57F684',
  CHART_POLYGON_COLOR: '#FC9A63',

  // 소수점 자릿수
  DECIMAL_PLACES: 2,

  // 메시지 표시 시간
  MESSAGE_DISPLAY_TIME: 5000,

  // Canvas 기본 크기
  CANVAS_WIDTH: 700,
  CANVAS_HEIGHT: 450,

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

  // CSS 변수에서 가져오는 색상 (테마 통합)
  getColor(varName) {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(varName).trim();
  }
};

export default CONFIG;

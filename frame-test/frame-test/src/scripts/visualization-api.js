(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.VisualizationAPI = {}));
})(this, (function (exports) { 'use strict';

  var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
  // ============================================================================
  // State Coordinate Configuration - 좌표평면 기본 상태 설정
  // @version 3.0.0
  // ============================================================================

  /**
   * 좌표평면 기본 설정
   */
  const DefaultCoordinateConfig = {
    // 좌표 범위
    xMin: -10,
    xMax: 10,
    yMin: -10,
    yMax: 10,
    
    // 격자 설정
    gridSpacing: 2,        // 격자 간격 (단위: 좌표)
    showGrid: false,         // 격자선 표시 여부
    showMinorGrid: false,   // 보조 격자선 표시 여부
    minorGridSpacing: 0.5,  // 보조 격자 간격
    
    // 축 설정
    showAxes: true,         // 축 표시 여부
    showArrows: true,       // 화살표 표시 여부
    showTicks: false,        // 눈금 표시 여부
    showLabels: false,       // 라벨(숫자) 표시 여부
    showAxisLabels: true,   // 축 글자(x, y) 표시 여부
    showOriginLabel: true,  // 원점(O) 표시 여부
    showIntercepts: true,   // 절편 표시 여부
    showFunctionList: true,  // 함수 목록 표시 여부
    showVerticalLines: true, // 수직선 표시 여부
    showVerticalLineLabels: true, // 수직선 라벨 표시 여부
    tickLength: 8,          // 눈금 길이
    
    // 색상 설정
    backgroundColor: "transparent",
    axisColor: "#B2B2B2",
    gridColor: "#404040",
    minorGridColor: "#2a2a2a",
    labelColor: "#B2B2B2",
     
    // 두께 설정
    axisWidth: 1,
    gridWidth: 1,
    minorGridWidth: 0.5,
    
    // 폰트 설정 (전체)
    fontSize: 25,
    fontFamily: "KaTeX_Main",
    
    // 축 라벨(눈금 숫자) 전용 폰트 설정
    labelFontSize: 18,
    labelFontFamily: "KaTeX_Main",

    // 커스텀 라벨(점, xLabel, yLabel) 전용 폰트 설정
    customLabelFontSize: 25,
    customLabelFontFamily: "KaTeX_Math",

    // 축 글자(x, y) 전용 폰트 설정
    axisLabelFontSize: 23,
    axisLabelFontFamily: "KaTeX_Math",
    
    // 원점(O) 전용 폰트 설정
    originLabelFontSize: 23,
    originLabelFontFamily: "KaTeX_Main",
    
    // 수직선 전용 폰트 설정
    verticalLineFontSize: 14,
    verticalLineFontFamily: "KaTeX_Main",
    
    // 캔버스 테두리 설정
    borderEnabled: false,
    borderColor: "#283945",
    borderWidth: 10,
    borderStyle: "solid", // 'solid', 'dashed', 'dotted'
    borderRadius: 20,     // 둥근 모서리 반지름 (픽셀)
    
    // 렌더링 영역 제한 (clipping)
    clipEnabled: false,    // 렌더링 영역 제한 여부
    clipXMin: -8,          // 렌더링 시작 x 좌표
    clipXMax: 8,           // 렌더링 끝 x 좌표
    clipYMin: -8,          // 렌더링 시작 y 좌표
    clipYMax: 8,           // 렌더링 끝 y 좌표
    
    // 렌더링 설정
    canvasSize: 500,
    renderQuality: 'high', // 'low', 'medium', 'high'
    antialias: true,
    autoHiDPI: false,       // HiDPI 자동 처리 (Retina 디스플레이 대응)
    forceScale: 2,      // 강제 스케일 (autoHiDPI가 true일 때 devicePixelRatio 대신 사용할 값, null이면 devicePixelRatio 사용)
    autoDrawPlane: true,    // 좌표평면 자동 그리기 (render 내부에서 처리)
    autoSetCoordinatePlane: true,

    // 좌표 전환 애니메이션 설정
    enableCoordinateTransition: true,    // 좌표 전환 애니메이션 활성화
    coordinateTransitionDuration: 800,   // 전환 기본 지속 시간 (ms)
    coordinateTransitionEasing: 'easeOut', // 전환 기본 easing

    // 타임라인 연동 자동 좌표평면 설정
    autoCoordinateFromTimeline: true,   // 타임라인 활성 레이어에 따라 좌표 범위 자동 조정

    // 함수 식 라벨 표시 설정 (그래프 위)
    showEquationLabels: true,          // 그래프 위 함수 식 라벨 표시 (수학 문제집 스타일)
    equationLabelStyle: {
      fontSize: 23,
      fontFamily: 'KaTeX_Math',
      color: 'auto',                   // 'auto'이면 함수 색상 자동 적용
      backgroundColor: 'transparent',   // 배경 없음 (깔끔한 스타일)
      offsetFromCurve: 50,             // 함수 곡선으로부터 거리 (픽셀)
      padding: 4,                       // 배경 박스 패딩 (사용 시)
      showDot: false                    // 라벨 위치 표시 점 (빨간 점) 표시 여부
    },

    // 레이어 리스트 표시 설정 (좌측 하단)
    showLayerList: false,              // 캔버스 좌측 하단 레이어 이름 목록 표시 여부

    // 디버그 시각화 옵션
    showDebugBoundingBox: false,        // 마스터 토글 (이것만으로 모든 디버그 제어)
    showDebugRectangle: true,          // F1-F4 참조 사각형 표시 (개별 토글 - 향후 확장용)
    showDebugPoints: true,             // 수집된 점들 표시 (개별 토글 - 향후 확장용)
    showDebugFinalBounds: true,        // 최종 범위 영역 표시 (개별 토글 - 향후 확장용)
    showDebugMarginBounds: true,       // 여백 적용 후 최종 범위 표시 (보라색 박스)
    debugLineWidth: 1,                  // 선 두께

    // 좌표 전환 상태 (런타임)
    coordinateTransition: null  // 전환 진행 상태 (startCoordinateTransition에서 설정됨)
  };

  /**
   * 좌표평면 상태 설정 생성 함수
   * @param {Object} customConfig - 사용자 정의 설정
   * @returns {Object} 병합된 설정 객체
   */
  function create$1(customConfig = {}) {
    return {
      ...DefaultCoordinateConfig,
      ...customConfig
    };
  }

  // =========================================================================
  // State Color - 색상/프리셋 자산 관리
  // =========================================================================

  // 통합 색상 프리셋
  const COLOR_PRESETS = {
    primary: { gradient: 'linear-gradient(180deg, #54A0F6 0%, #6DE0FC 100%)', color: '#43A4F6' },
    secondary: { gradient: 'linear-gradient(180deg, #D15DA4 0%, #CD5DD1 100%)', color: '#DB6FE7' },
    tertiary: { gradient: 'linear-gradient(180deg, #FA716F 0%, #F3A257 100%)', color: '#F69B63' },

    areaPrimary: { gradient: 'linear-gradient(180deg,rgba(65, 65, 163, 0.5) 0%,rgba(44, 160, 232, 0.5) 100%)', color: '#4141A3' },
    areaSecondary: { gradient: 'linear-gradient(180deg,rgba(135, 106, 33, 0.5) 0%,rgba(255, 198, 55, 0.5) 100%)', color: '#876A21' },
    areaTertiary: { gradient: 'linear-gradient(180deg,rgba(95, 46, 87, 0.5) 0%,rgba(255, 0, 115, 0.5) 100%)', color: '#5F2E57' },

    info: '#F3EF70'
  };

  // 기본 색상 (프리셋 외)
  const DEFAULT_COLORS = {
    function: COLOR_PRESETS.primary.gradient,
    point: COLOR_PRESETS.info,
    line: COLOR_PRESETS.info,
    shapeArea: COLOR_PRESETS.areaPrimary.gradient,
    shapeStoke: COLOR_PRESETS.info
  };

  // 프리셋별 색상 팔레트
  const PRESET_COLORS = {
    'basic-function': { function: '#4CAF50' },
    'function-with-point': { function: '#4CAF50', point: '#F3EF70', line: '#F3EF70' },
    'area-triangle': { function: DEFAULT_COLORS.function, area: DEFAULT_COLORS.shapeArea },
    'area-rectangle': { function: DEFAULT_COLORS.function, area: DEFAULT_COLORS.shapeArea },
    'area-integral': { function: DEFAULT_COLORS.function, area: DEFAULT_COLORS.shapeArea },
    'branch-functions': { colors: ['#4CAF50', '#00BCD4', '#FF6B6B'] },
    'move-function': { original: DEFAULT_COLORS.function, moved: '#00BCD4' }
  };

  // ============================================================================
  // Function Style Defaults
  // @version 3.0.0
  // ============================================================================


  /**
   * 함수(Function) 기본 스타일
   */
  const FUNCTION_DEFAULTS = {
    equation: '일반형',
    value: [1, 0, 0],          // [a, b, c] for ax² + bx + c
    color: DEFAULT_COLORS.function,
    lineWidth: 4
  };

  // ============================================================================
  // Point Style Defaults
  // @version 3.0.0
  // ============================================================================


  /**
   * 점(Point) 기본 스타일
   */
  const POINT_DEFAULTS = {
    pointType: 'free',         // 'free', 'x-axis', 'y-axis', 'intersection'
    x: 0,
    y: 0,
    color: DEFAULT_COLORS.point,
    size: 5,
    showLabel: false,
    label: ''
  };

  // ============================================================================
  // Line Style Defaults
  // @version 3.0.0
  // ============================================================================


  /**
   * 선(Line) 기본 스타일
   */
  const LINE_DEFAULTS = {
    lineType: 'vertical',      // 'vertical', 'horizontal'
    x: 0,                      // vertical line의 x 좌표
    y: 0,                      // horizontal line의 y 좌표
    color: DEFAULT_COLORS.line,
    width: 2,
    style: 'dashed',            // 'solid', 'dashed'
    showLabel: false,
    label: ''
  };

  // ============================================================================
  // Shape Style Defaults (Triangle, Rectangle, Integral)
  // @version 3.0.0
  // ============================================================================


  /**
   * 삼각형(Triangle) 기본 스타일
   */
  const TRIANGLE_DEFAULTS = {
    shapeType: 'triangle',
    mode: 'free',              // 'free', 'x-axis', 'y-axis'
    vertices: [
      { x: 0, y: 2 },
      { x: -2, y: -2 },
      { x: 2, y: -2 }
    ],
    p: { x: 0, y: 0 },         // mode가 'x-axis' 또는 'y-axis'일 때 꼭짓점
    func: null,                // mode가 'x-axis' 또는 'y-axis'일 때 함수 정의
    fillColor: DEFAULT_COLORS.shapeArea,
    strokeColor: DEFAULT_COLORS.shapeStoke,
    strokeWidth: 0
  };

  /**
   * 사각형(Rectangle) 기본 스타일
   */
  const RECTANGLE_DEFAULTS = {
    shapeType: 'rectangle',
    vertices: [
      { x: -2, y: 2 },
      { x: 2, y: 2 },
      { x: 2, y: -2 },
      { x: -2, y: -2 }
    ],
    fillColor: DEFAULT_COLORS.shapeArea,
    strokeColor: DEFAULT_COLORS.shapeStoke,
    strokeWidth: 0
  };

  /**
   * 적분 영역(Integral) 기본 스타일
   */
  const INTEGRAL_DEFAULTS = {
    shapeType: 'integral',
    direction: 'y',            // 'x', 'y'
    shift: 0,
    l1: { x: -2 },            // y축 방향일 때 x 좌표
    l2: { x: 2 },             // y축 방향일 때 x 좌표
    func: {
      equation: '일반형',
      value: [1, 0, -4]
    },
    fillColor: DEFAULT_COLORS.shapeArea,
    strokeColor: DEFAULT_COLORS.shapeStoke,
    strokeWidth: 0
  };

  // ============================================================================
  // Layer List Style Defaults
  // @version 3.0.0
  // ============================================================================

  /**
   * 레이어 리스트(Canvas 렌더링) 기본 스타일
   */
  const LAYER_LIST_DEFAULTS = {
    position: 'bottom-left',
    fontSize: 22,
    fontFamily: 'KaTeX_Math',
    itemBackgroundColor: 'rgba(37, 37, 37, 0.5)',
    backgroundBlur: 8,
    itemBorderColor: 'rgba(255, 255, 255, 0.1)',
    itemBorderWidth: 1,
    itemBorderRadius: 6,
    itemPadding: 12,
    itemSpacing: 8,
    padding: 10,
    margin: 10,
    maxWidth: 270
  };

  // ============================================================================
  // Web UI Preset Configurations
  // @version 3.0.0
  // ============================================================================

  /**
   * 웹 UI용 프리셋 설정
   * 각 프리셋의 기본 파라미터를 정의
   */
  const WEB_PRESET_CONFIGS = {
    'basic-function': {
      value: [1, 0, -4],
    },

    'function-with-point': {
      value: [1, 0, -4],
      pointX: 3,
      showXline: true,
      showYline: true,
      showIntersectionPoint: true
    },

    'area-triangle': {
      value: [1, 0, -4],
      mode: 'free',
      vertices: [
        { x: -2, y: 0 },
        { x: 2, y: 0 },
        { x: 0, y: -4 }
      ]
    },

    'area-rectangle': {
      value: [1, 0, -4],
      vertices: [
        { x: -2, y: 0 },   // 왼쪽 아래 (x축)
        { x: -1, y: -3 },  // 오른쪽 아래 (x축)
        { x: 1, y: -3 },   // 오른쪽 위
        { x: 2, y: 0 }     // 왼쪽 위
      ]
    },

    'area-integral-x': {
      basePreset: 'area-integral',
      params: {
        value: [1, 0, -4],
        direction: 'x',
        shift: 2,
        l1: { y: -4 },  // X축 방향은 y 좌표 필요
        l2: { y: 0 }
      }
    },

    'area-integral-y': {
      basePreset: 'area-integral',
      params: {
        value: [1, 0, -4],
        direction: 'y',
        shift: 2,
        l1: { x: -2 },  // Y축 방향은 x 좌표 필요
        l2: { x: 2 }
      }
    },

    'branch-functions': {
      value: [1, 0, 0],
      direction: 'both',
      mixed: true,
      count: 3
    },

    'move-function-1': {
      basePreset: 'move-function',
      params: {
        value: [1, 0, 0],
        dx: 2,
        dy: 0
      }
    },

    'move-function-2': {
      basePreset: 'move-function',
      params: {
        value: [1, 0, 0],
        dx: 0,
        dy: 3
      }
    }
  };

  // ============================================================================
  // Style Configuration Factory
  // @version 3.0.0
  // ============================================================================


  /**
   * 넓이 영역(도형) 전용 색상 프리셋
   * 삼각형, 사각형, 적분 영역에 사용되는 채우기 색상 팔레트
   */
  const SHAPE_COLOR_PRESETS = [
    { name: 'Area Primary', gradient: COLOR_PRESETS.areaPrimary.gradient, color: COLOR_PRESETS.areaPrimary.color },
    { name: 'Area Secondary', gradient: COLOR_PRESETS.areaSecondary.gradient, color: COLOR_PRESETS.areaSecondary.color },
    { name: 'Area Tertiary', gradient: COLOR_PRESETS.areaTertiary.gradient, color: COLOR_PRESETS.areaTertiary.color }
  ];

  /**
   * 스타일 설정 생성 함수
   * @returns {Object} 스타일 설정 객체
   */
  function createStyleConfig() {
    return {
      colorPresets: COLOR_PRESETS,
      shapeColorPresets: SHAPE_COLOR_PRESETS,
      defaultColors: DEFAULT_COLORS,
      function: { ...FUNCTION_DEFAULTS },
      point: { ...POINT_DEFAULTS },
      line: { ...LINE_DEFAULTS },
      triangle: { ...TRIANGLE_DEFAULTS },
      rectangle: { ...RECTANGLE_DEFAULTS },
      integral: { ...INTEGRAL_DEFAULTS },
      layerList: { ...LAYER_LIST_DEFAULTS },
      presetColors: PRESET_COLORS,
      webPresetConfigs: WEB_PRESET_CONFIGS
    };
  }

  /**
   * 특정 레이어 타입의 기본 스타일 가져오기
   * @param {string} type - 레이어 타입 ('linear', 'quadratic', 'point', 'line', 'triangle', 'rectangle', 'integral', 'layerList')
   * @returns {Object} 해당 타입의 기본 스타일
   */
  function getDefaultStyle(type) {
    const config = createStyleConfig();

    switch(type) {
      case 'linear':
      case 'quadratic':
        return { ...config.function };
      case 'point':
        return { ...config.point };
      case 'line':
        return { ...config.line };
      case 'triangle':
        return { ...config.triangle };
      case 'rectangle':
        return { ...config.rectangle };
      case 'integral':
        return { ...config.integral };
      case 'layerList':
        return { ...config.layerList };
      default:
        console.warn(`Unknown style type: ${type}`);
        return {};
    }
  }

  // =========================================================================
  // UI Icons - 아이콘 경로/팩토리 관리
  // =========================================================================

  // SVG path 데이터
  const ICON_PATHS = {
    quadratic_down: 'M20.0234 5.02832C36.5975 72.5373 81.1454 207.555 126.744 207.555C172.343 207.555 217.699 72.5373 234.678 5.02832',
    quadratic_up : 'M234.648 223.144C218.074 155.635 173.527 20.6166 127.928 20.6166C82.3288 20.6165 36.9724 155.635 19.9941 223.144',
    line_y : 'M0 20.6152H246',
    line_x : 'M20.6133 0L20.6133 246',
    linear_left : 'M141.805 10.3076L17.8547 224.995',
    linear_right : 'M17.8516 10.3076L141.802 224.995'
  };

  // path name으로 Path2D 반환
  function getPath2D(name) {
    const d = ICON_PATHS[name];
    if (!d) return null;
    try {
      return new Path2D(d);
    } catch (e) {
      console.warn('[ui-icons] Invalid path for', name, e);
      return null;
    }
  }

  // ============================================================================
  // Circle DTO - 원 스타일 설정
  // @version 3.0.0
  // ============================================================================


  /**
   * 원 스타일 설정 생성
   * @param {Object} data - 원 데이터
   * @returns {Object} 스타일 설정
   */
  function createCircleStyle(data) {
    const {
      fillColor: rawFillColor,
      strokeColor: rawStrokeColor,
      strokeWidth: rawStrokeWidth
    } = data;

    const styleConfig = createStyleConfig();

    return {
      fillColor: rawFillColor && rawFillColor !== '#'
        ? rawFillColor
        : styleConfig.defaultColors.shapeArea,
      strokeColor: rawStrokeColor && rawStrokeColor !== '#'
        ? rawStrokeColor
        : styleConfig.defaultColors.shapeStoke,
      strokeWidth: rawStrokeWidth && rawStrokeWidth >= 0
        ? rawStrokeWidth
        : 0
    };
  }

  // ============================================================================
  // Font Manager - 전역 폰트 설정 및 렌더링 관리
  // @version 3.0.0
  // ============================================================================

  /**
   * 일반 하이픈(-)을 유니코드 마이너스 기호(−, U+2212)로 변환
   * @param {string|number} text - 변환할 텍스트 또는 숫자
   * @returns {string} 변환된 텍스트
   */
  function formatMinusSign(text) {
    return String(text).replace(/-/g, '−');
  }

  /**
   * 폰트 타입별 설정 가져오기
   * @param {Object} config - 좌표평면 상태
   * @param {string} type - 폰트 타입 ('default', 'axisLabel', 'customLabel', 'axisText', 'origin', 'verticalLine')
   * @returns {Object} { size: number, family: string }
   */
  function getFontConfig(config, type = 'default') {
    switch (type) {
      case 'axisLabel':
        // 축 라벨(눈금 숫자)
        return {
          size: config.labelFontSize || config.fontSize,
          family: config.labelFontFamily || config.fontFamily
        };

      case 'customLabel':
        // 커스텀 라벨(점, xLabel, yLabel)
        return {
          size: config.customLabelFontSize || config.fontSize,
          family: config.customLabelFontFamily || config.fontFamily
        };

      case 'axisText':
        // 축 글자(x, y)
        return {
          size: config.axisLabelFontSize || config.fontSize,
          family: config.axisLabelFontFamily || config.fontFamily
        };

      case 'origin':
        // 원점(O)
        return {
          size: config.originLabelFontSize || config.fontSize,
          family: config.originLabelFontFamily || config.fontFamily
        };

      case 'verticalLine':
        // 수직선
        return {
          size: config.verticalLineFontSize || config.fontSize,
          family: config.verticalLineFontFamily || config.fontFamily
        };

      case 'default':
      default:
        // 기본 폰트
        return {
          size: config.fontSize,
          family: config.fontFamily
        };
    }
  }

  /**
   * 폰트 문자열 생성
   * @param {Object} config - 좌표평면 상태
   * @param {string} type - 폰트 타입
   * @returns {string} CSS 폰트 문자열 (예: "25px KaTeX_Main")
   */
  function getFontString(config, type = 'default') {
    const fontConfig = getFontConfig(config, type);
    return `${fontConfig.size}px ${fontConfig.family}`;
  }

  /**
   * 혼합 폰트 렌더링을 위한 설정 객체 생성
   * @param {Object} config - 좌표평면 상태
   * @param {boolean} useCustom - 커스텀 폰트 사용 여부
   * @param {string} customFont - 커스텀 폰트 패밀리 (옵션)
   * @returns {Object} 혼합 폰트 설정 객체
   */
  function createMixedFontConfig(config, useCustom = false, customFont = null) {
    const defaultConfig = getFontConfig(config, 'default');
    const customConfig = getFontConfig(config, 'customLabel');

    return {
      defaultFamily: defaultConfig.family,
      defaultSize: defaultConfig.size,
      customFamily: customFont || customConfig.family,
      customSize: customConfig.size,
      useMixedFont: useCustom
    };
  }

  /**
   * 혼합 폰트로 텍스트 렌더링 (문자 종류에 따라 자동 폰트 선택)
   * - 괄호, 쉼표, 공백, 마이너스: 기본 폰트 (defaultSize, defaultFamily)
   * - 소문자 알파벳 (a-z): customSize, KaTeX_Math
   * - 대문자 알파벳 (A-Z) + 숫자 (0-9): customSize, KaTeX_Main
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {string} text - 렌더링할 텍스트
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   * @param {Object} fonts - 폰트 설정 객체
   * @param {string} fonts.defaultFamily - 기본 폰트 패밀리
   * @param {number} fonts.defaultSize - 기본 폰트 크기
   * @param {string} fonts.customFamily - 커스텀 폰트 패밀리
   * @param {number} fonts.customSize - 커스텀 폰트 크기
   * @param {boolean} fonts.useMixedFont - 혼합 폰트 사용 여부
   */
  function renderMixedFontText(ctx, text, x, y, fonts) {
    // 하이픈을 유니코드 마이너스 기호로 변환
    const formattedText = formatMinusSign(text);

    // 혼합 폰트를 사용하지 않으면 일반 렌더링
    if (!fonts.useMixedFont) {
      ctx.fillText(formattedText, x, y);
      return;
    }

    // textAlign에 따라 시작 위치 조정
    const align = ctx.textAlign;
    let startX = x;

    // 전체 텍스트 너비 계산 (정렬을 위해)
    if (align !== 'left') {
      let totalWidth = 0;
      for (let i = 0; i < formattedText.length; i++) {
        const char = formattedText[i];
        // 괄호, 쉼표, 공백, 유니코드 마이너스는 기본 폰트 사용
        const isPunctuation = char === '(' || char === ')' || char === ',' || char === ' ' || char === '−';
        const isLowerCase = /[a-z]/.test(char);
        const isUpperCaseOrDigit = /[A-Z0-9]/.test(char);

        if (isPunctuation) {
          ctx.font = `${fonts.defaultSize}px ${fonts.defaultFamily}`;
        } else if (isLowerCase) {
          // 소문자는 KaTeX_Math
          ctx.font = `${fonts.customSize}px KaTeX_Math`;
        } else if (isUpperCaseOrDigit) {
          // 대문자와 숫자는 KaTeX_Main
          ctx.font = `${fonts.customSize}px KaTeX_Main`;
        } else {
          // 그 외는 커스텀 폰트
          ctx.font = `${fonts.customSize}px ${fonts.customFamily}`;
        }

        totalWidth += ctx.measureText(char).width;
      }

      if (align === 'center') {
        startX = x - totalWidth / 2;
      } else if (align === 'right') {
        startX = x - totalWidth;
      }
    }

    // 문자별로 렌더링
    let currentX = startX;
    const originalTextAlign = ctx.textAlign;
    ctx.textAlign = 'left'; // 문자별 렌더링은 항상 left로

    for (let i = 0; i < formattedText.length; i++) {
      const char = formattedText[i];
      // 괄호, 쉼표, 공백, 유니코드 마이너스는 기본 폰트 사용
      const isPunctuation = char === '(' || char === ')' || char === ',' || char === ' ' || char === '−';
      const isLowerCase = /[a-z]/.test(char);
      const isUpperCaseOrDigit = /[A-Z0-9]/.test(char);

      if (isPunctuation) {
        ctx.font = `${fonts.defaultSize}px ${fonts.defaultFamily}`;
      } else if (isLowerCase) {
        // 소문자는 KaTeX_Math
        ctx.font = `${fonts.customSize}px KaTeX_Math`;
      } else if (isUpperCaseOrDigit) {
        // 대문자와 숫자는 KaTeX_Main
        ctx.font = `${fonts.customSize}px KaTeX_Main`;
      } else {
        // 그 외는 커스텀 폰트
        ctx.font = `${fonts.customSize}px ${fonts.customFamily}`;
      }

      ctx.fillText(char, currentX, y);
      currentX += ctx.measureText(char).width;
    }

    // 원래 textAlign 복원
    ctx.textAlign = originalTextAlign;
  }

  /**
   * 좌표 라벨 객체를 렌더링 (각 문자에 자동 폰트 적용)
   * - 괄호, 쉼표, 공백, 마이너스: 기본 폰트 (defaultSize, defaultFamily)
   * - 소문자 알파벳 (a-z): customSize, KaTeX_Math
   * - 대문자 알파벳 (A-Z) + 숫자 (0-9): customSize, KaTeX_Main
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} labelObj - 라벨 객체
   * @param {string|number} labelObj.x - X 값
   * @param {string|number} labelObj.y - Y 값
   * @param {boolean} labelObj.xIsString - X가 문자열인지 여부
   * @param {boolean} labelObj.yIsString - Y가 문자열인지 여부
   * @param {string} labelObj.font - 문자열에 적용할 커스텀 폰트
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   * @param {Object} fonts - 폰트 설정 객체
   */
  function renderCoordinateLabelWithMixedFont(ctx, labelObj, x, y, fonts) {
    const { x: xVal, y: yVal } = labelObj;
    // 하이픈을 유니코드 마이너스 기호로 변환
    const xText = formatMinusSign(String(xVal));
    const yText = formatMinusSign(String(yVal));
    const fullText = `(${xText}, ${yText})`;

    // textAlign에 따라 시작 위치 조정
    const align = ctx.textAlign;
    let startX = x;

    // 전체 텍스트 너비 계산
    if (align !== 'left') {
      let totalWidth = 0;
      for (let i = 0; i < fullText.length; i++) {
        const char = fullText[i];
        const isPunctuation = char === '(' || char === ')' || char === ',' || char === ' ' || char === '−';
        const isLowerCase = /[a-z]/.test(char);
        const isUpperCaseOrDigit = /[A-Z0-9]/.test(char);

        if (isPunctuation) {
          ctx.font = `${fonts.defaultSize}px ${fonts.defaultFamily}`;
        } else if (isLowerCase) {
          ctx.font = `${fonts.customSize}px KaTeX_Math`;
        } else if (isUpperCaseOrDigit) {
          ctx.font = `${fonts.customSize}px KaTeX_Main`;
        } else {
          ctx.font = `${fonts.customSize}px ${fonts.customFamily}`;
        }

        totalWidth += ctx.measureText(char).width;
      }

      if (align === 'center') {
        startX = x - totalWidth / 2;
      } else if (align === 'right') {
        startX = x - totalWidth;
      }
    }

    // 각 문자별로 렌더링
    let currentX = startX;
    const originalTextAlign = ctx.textAlign;
    ctx.textAlign = 'left';

    for (let i = 0; i < fullText.length; i++) {
      const char = fullText[i];
      const isPunctuation = char === '(' || char === ')' || char === ',' || char === ' ' || char === '−';
      const isLowerCase = /[a-z]/.test(char);
      const isUpperCaseOrDigit = /[A-Z0-9]/.test(char);

      if (isPunctuation) {
        ctx.font = `${fonts.defaultSize}px ${fonts.defaultFamily}`;
      } else if (isLowerCase) {
        ctx.font = `${fonts.customSize}px KaTeX_Math`;
      } else if (isUpperCaseOrDigit) {
        ctx.font = `${fonts.customSize}px KaTeX_Main`;
      } else {
        ctx.font = `${fonts.customSize}px ${fonts.customFamily}`;
      }

      ctx.fillText(char, currentX, y);
      currentX += ctx.measureText(char).width;
    }

    // 원래 textAlign 복원
    ctx.textAlign = originalTextAlign;
  }

  /**
   * 컨텍스트에 폰트 설정 적용
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} config - 좌표평면 상태
   * @param {string} type - 폰트 타입
   */
  function applyFont(ctx, config, type = 'default') {
    ctx.font = getFontString(config, type);
  }

  // ============================================================================
  // Draw Utilities - 좌표 변환 유틸리티
  // @version 3.0.0
  // ============================================================================


  /**
   * 수학 좌표계 x를 캔버스 픽셀 x로 변환
   * @param {number} x - 수학 좌표계 x값
   * @param {Object} config - 좌표평면 상태
   * @param {number} canvasSize - 캔버스 크기
   * @returns {number} 캔버스 픽셀 x (invalid config인 경우 NaN)
   */
  function coordToPixelX$1(x, config, canvasSize) {
    const { xMin, xMax } = config;
    // NaN 체크 - 좌표 전환 중이거나 잘못된 config
    if (!isFinite(xMin) || !isFinite(xMax) || !isFinite(x)) {
      return NaN;
    }
    return ((x - xMin) / (xMax - xMin)) * canvasSize;
  }

  /**
   * 수학 좌표계 y를 캔버스 픽셀 y로 변환
   * @param {number} y - 수학 좌표계 y값
   * @param {Object} config - 좌표평면 상태
   * @param {number} canvasSize - 캔버스 크기
   * @returns {number} 캔버스 픽셀 y (invalid config인 경우 NaN)
   */
  function coordToPixelY$1(y, config, canvasSize) {
    const { yMin, yMax } = config;
    // NaN 체크 - 좌표 전환 중이거나 잘못된 config
    if (!isFinite(yMin) || !isFinite(yMax) || !isFinite(y)) {
      return NaN;
    }
    return canvasSize - ((y - yMin) / (yMax - yMin)) * canvasSize;
  }

  /**
   * 그라디언트 생성
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {string} gradientStr - 그라디언트 문자열 (예: "linear-gradient(180deg, #5484F6 0%, #6DE0FC 100%)")
   * @param {number} x0 - 시작 x (선형 그라디언트)
   * @param {number} y0 - 시작 y
   * @param {number} x1 - 끝 x
   * @param {number} y1 - 끝 y
   * @returns {CanvasGradient|string} 그라디언트 객체 또는 원본 색상
   */
  function createGradient(ctx, gradientStr, x0, y0, x1, y1) {
    if (!gradientStr || !gradientStr.includes('gradient')) {
      return gradientStr; // 일반 색상이면 그대로 반환
    }
    
    try {
      // linear-gradient 파싱
      const linearMatch = gradientStr.match(/linear-gradient\(([^,]+),\s*(.+)\)/);
      if (linearMatch) {
        const angleStr = linearMatch[1].trim();
        const angle = parseFloat(angleStr) || 180;
        const colorStops = linearMatch[2];
        
        // 각도를 좌표로 변환 (180deg = 위->아래)
        // CSS gradient angle: 0deg = 위로, 90deg = 오른쪽, 180deg = 아래, 270deg = 왼쪽
        const rad = ((angle - 90) * Math.PI) / 180;
        const centerX = (x0 + x1) / 2;
        const centerY = (y0 + y1) / 2;
        const length = Math.max(x1 - x0, y1 - y0);
        
        const startX = centerX - Math.cos(rad) * length / 2;
        const startY = centerY - Math.sin(rad) * length / 2;
        const endX = centerX + Math.cos(rad) * length / 2;
        const endY = centerY + Math.sin(rad) * length / 2;
        
        const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
        
        // 색상 스톱 파싱 (hex 또는 rgba 모두 지원)
        const stops = colorStops.match(/(#[0-9A-Fa-f]{6}|rgba?\([^)]+\))\s+(\d+(?:\.\d+)?)%/g);
        
        if (stops) {
          stops.forEach(stop => {
            const match = stop.match(/(#[0-9A-Fa-f]{6}|rgba?\([^)]+\))\s+(\d+(?:\.\d+)?)%/);
            if (match) {
              const color = match[1];
              const position = parseFloat(match[2]) / 100;
              gradient.addColorStop(position, color);
            }
          });
        }
        
        return gradient;
      }
    } catch (e) {
      console.warn('Failed to parse gradient:', e);
    }
    
    return gradientStr;
  }

  /**
   * 색상 또는 그라디언트 적용
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {string} colorOrGradient - 색상 또는 그라디언트 문자열
   * @param {Object} state - 좌표평면 상태
   * @param {number} canvasSize - 캔버스 크기
   * @param {string} type - 'stroke' 또는 'fill'
   * @param {Object} bounds - 선택적 bounds {minX, minY, maxX, maxY} (픽셀 좌표)
   * @returns {void}
   */
  function applyColorOrGradient(ctx, colorOrGradient, config, canvasSize, type = 'stroke', bounds = null) {
    if (!colorOrGradient) {
      return;
    }

    if (colorOrGradient.includes('gradient')) {
      // bounds가 제공되면 해당 영역 기준으로, 아니면 전체 캔버스 기준으로 생성
      let x0, y0, x1, y1;
      if (bounds) {
        x0 = bounds.minX;
        y0 = bounds.minY;
        x1 = bounds.maxX;
        y1 = bounds.maxY;

        // NaN이나 Infinity 체크 - 잘못된 bounds는 전체 캔버스로 fallback
        if (!isFinite(x0) || !isFinite(y0) || !isFinite(x1) || !isFinite(y1)) {
          console.warn('[Gradient] Invalid bounds detected, using canvas bounds:', bounds);
          x0 = 0;
          y0 = 0;
          x1 = 0;
          y1 = canvasSize;
        }
      } else {
        x0 = 0;
        y0 = 0;
        x1 = 0;
        y1 = canvasSize;
      }

      const gradient = createGradient(ctx, colorOrGradient, x0, y0, x1, y1);
      if (type === 'stroke') {
        ctx.strokeStyle = gradient;
      } else {
        ctx.fillStyle = gradient;
      }
    } else {
      // 일반 색상
      if (type === 'stroke') {
        ctx.strokeStyle = colorOrGradient;
      } else {
        ctx.fillStyle = colorOrGradient;
      }
    }
  }

  /**
   * 이차함수의 절편 계산
   * @param {Array} value - [a, b, c] 이차함수 계수
   * @returns {Object} { xIntercepts: Array<number>, yIntercept: number }
   */
  function calculateQuadraticIntercepts(value) {
    const [a, b, c] = value;
    const result = { xIntercepts: [], yIntercept: c };
    
    // x절편 계산: y = 0일 때 ax² + bx + c = 0의 해
    if (a !== 0) {
      const discriminant = b * b - 4 * a * c;
      if (discriminant > 0) {
        // 두 개의 실근
        const sqrtDisc = Math.sqrt(discriminant);
        result.xIntercepts.push((-b - sqrtDisc) / (2 * a));
        result.xIntercepts.push((-b + sqrtDisc) / (2 * a));
      } else if (discriminant === 0) {
        // 중근
        result.xIntercepts.push(-b / (2 * a));
      }
    }
    
    return result;
  }

  /**
   * 절편 라벨 배치 계산
   * @param {Object} p
   * @param {'x'|'y'} p.axis - 절편 축 종류
   * @param {number[]} p.value - [a,b,c]
   * @param {number[]} p.xIntercepts - x절편 목록 (정렬되어 있지 않아도 됨)
   * @param {number} p.yIntercept - y절편
   * @param {number} [p.currentX] - 현재 절편의 x (x축 절편일 때)
   * @returns {{labelDx:number,labelDy:number,textAlign:string,textBaseline:string}}
   */
  function computeInterceptLabelOffset(p) {
    const { axis, value, xIntercepts = [], yIntercept, currentX } = p || {};
    const a = value?.[0] ?? 0;
    const b = value?.[1] ?? 0;
    const c = value?.[2] ?? 0;
    const D = b * b - 4 * a * c;
    const vx = a !== 0 ? -b / (2 * a) : 0;
    const vy = a * vx * vx + b * vx + c;

    const twoRoots = D > 0;
    const oneRoot = D === 0;
    const zeroRoots = D < 0;

    // x절편 규칙: 두 근이면 좌상/우상, 한 근이면 아래(아래로 볼록), 위(위로 볼록)
    if (axis === 'x') {
      if (oneRoot) {
        // 중근: 아래로 볼록(a>0) → 점 아래, 위로 볼록(a<0) → 점 위
        if (a > 0) return { labelDx: 0, labelDy: 14, textAlign: 'center', textBaseline: 'top' };
        if (a < 0) return { labelDx: 0, labelDy: -14, textAlign: 'center', textBaseline: 'bottom' };
        // a=0은 비정상 케이스: 보수적으로 위
        return { labelDx: 0, labelDy: -14, textAlign: 'center', textBaseline: 'bottom' };
      }
      if (twoRoots) {
        const minX = Math.min.apply(null, xIntercepts);
        const isLeft = (currentX === minX);
        if (a > 0) {
          // 아래로 볼록: 두 x절편 모두 점 하단 배치
          if (isLeft) return { labelDx: -12, labelDy: 14, textAlign: 'right', textBaseline: 'top' };
          return { labelDx: 12, labelDy: 14, textAlign: 'left', textBaseline: 'top' };
        }
        // 위로 볼록 등: 기존처럼 점 상단 배치
        if (isLeft) return { labelDx: -12, labelDy: -14, textAlign: 'right', textBaseline: 'bottom' };
        return { labelDx: 12, labelDy: -14, textAlign: 'left', textBaseline: 'bottom' };
      }
      // 근 없음일 때는 생성하지 않음(호출 측에서 걸러짐)
      return { labelDx: -12, labelDy: 0, textAlign: 'right', textBaseline: 'middle' };
    }

    // y절편 규칙 (기존 요구사항 반영): a>0(아래로 볼록)과 a<0(위로 볼록) 분기
    function quadrant(x, y) {
      if (x === 0 && y === 0) return 'origin';
      if (x === 0) return y > 0 ? 'axisY_pos' : 'axisY_neg';
      if (y === 0) return x > 0 ? 'axisX_pos' : 'axisX_neg';
      if (x > 0 && y > 0) return 'Q1';
      if (x < 0 && y > 0) return 'Q2';
      if (x < 0 && y < 0) return 'Q3';
      return 'Q4';
    }
    const vq = quadrant(vx, vy);

    if (a > 0) { // 아래로 볼록
      if (twoRoots) {
        if (vq === 'axisY_pos' || vq === 'axisY_neg') return { labelDx: -12, labelDy: 14, textAlign: 'right', textBaseline: 'top' };
        if (vq === 'Q4') return { labelDx: -12, labelDy: 0, textAlign: 'right', textBaseline: 'middle' };
        if (vq === 'Q3') return { labelDx: 12, labelDy: 0, textAlign: 'left', textBaseline: 'middle' };
      } else if (oneRoot) {
        // 중근: 꼭짓점 x 부호 기준 (음수 → 우측, 양수 → 좌측)
        if (vx < 0) return { labelDx: 12, labelDy: 0, textAlign: 'left', textBaseline: 'middle' };
        if (vx > 0) return { labelDx: -12, labelDy: 0, textAlign: 'right', textBaseline: 'middle' };
      } else if (zeroRoots) {
        if (vq === 'Q2') return { labelDx: 12, labelDy: 0, textAlign: 'left', textBaseline: 'middle' };
        if (vq === 'Q1') return { labelDx: -12, labelDy: 0, textAlign: 'right', textBaseline: 'middle' };
      }
    } else if (a < 0) { // 위로 볼록
      if (twoRoots) {
        if (vq === 'axisY_pos' || vq === 'axisY_neg') return { labelDx: -12, labelDy: -14, textAlign: 'right', textBaseline: 'bottom' };
        if (vq === 'Q1') return { labelDx: -12, labelDy: 0, textAlign: 'right', textBaseline: 'middle' };
        if (vq === 'Q2') return { labelDx: 12, labelDy: 0, textAlign: 'left', textBaseline: 'middle' };
      } else if (oneRoot) {
        // 중근: 꼭짓점 x 부호 기준 (음수 → 우측, 양수 → 좌측)
        if (vx < 0) return { labelDx: 12, labelDy: 0, textAlign: 'left', textBaseline: 'middle' };
        if (vx > 0) return { labelDx: -12, labelDy: 0, textAlign: 'right', textBaseline: 'middle' };
      } else if (zeroRoots) {
        if (vq === 'Q3') return { labelDx: 12, labelDy: 0, textAlign: 'left', textBaseline: 'middle' };
        if (vq === 'Q4') return { labelDx: -12, labelDy: 0, textAlign: 'right', textBaseline: 'middle' };
      }
    }

    // 기본값(보수적 좌측 배치)
    return { labelDx: -12, labelDy: 0, textAlign: 'right', textBaseline: 'middle' };
  }

  // ==========================================================================
  // 텍스트 포맷팅 유틸리티 (공용)
  // ==========================================================================

  /**
   * 숫자를 포맷팅하고 마이너스 기호를 유니코드로 변환
   * @param {number} value - 포맷팅할 숫자
   * @param {number} precision - 소수점 자릿수 (기본 2)
   * @returns {string} 포맷된 문자열
   */
  function formatNumber(value, precision = 2) {
    if (Number.isInteger(value)) {
      return formatMinusSign(value.toString());
    }
    const rounded = Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
    let result;
    if (rounded === Math.floor(rounded)) {
      result = Math.floor(rounded).toString();
    } else {
      result = rounded.toString();
    }
    return formatMinusSign(result);
  }

  // ============================================================================
  // Circle Utils - 원 유틸리티 함수
  // @version 3.0.0
  // ============================================================================


  /**
   * 원의 좌표 변환
   * @param {Object} center - 중심점 {x, y}
   * @param {number} radius - 반지름
   * @param {Object} state - 상태
   * @param {number} canvasSize - 캔버스 크기
   * @returns {Object} 변환된 좌표 {cx, cy, rPx, bounds}
   */
  function transformCircleCoordinates(center, radius, config, canvasSize) {
    const cx = coordToPixelX$1(center.x, config, canvasSize);
    const cy = coordToPixelY$1(center.y, config, canvasSize);
    const rPx = Math.abs(coordToPixelX$1(center.x + radius, config, canvasSize) - cx);

    // 그라데이션 적용을 위한 바운드
    const bounds = {
      minX: cx - rPx,
      minY: cy - rPx,
      maxX: cx + rPx,
      maxY: cy + rPx
    };

    return { cx, cy, rPx, bounds };
  }

  // ============================================================================
  // Circle Renderer - 원 렌더링 렌더러
  // @version 3.0.0
  // ============================================================================


  /**
   * 원 렌더링
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {number} cx - 중심 X (픽셀)
   * @param {number} cy - 중심 Y (픽셀)
   * @param {number} rPx - 반지름 (픽셀)
   * @param {Object} style - 스타일 설정
   * @param {Object} bounds - 바운드 {minX, minY, maxX, maxY}
   * @param {Object} config - 상태
   * @param {number} canvasSize - 캔버스 크기
   */
  function renderCircle(ctx, cx, cy, rPx, style, bounds, config, canvasSize) {
    ctx.beginPath();
    ctx.arc(cx, cy, rPx, 0, Math.PI * 2);
    ctx.closePath();

    // Fill
    if (style.fillColor) {
      applyColorOrGradient(ctx, style.fillColor, config, canvasSize, 'fill', bounds);
      ctx.fill();
    }

    // Stroke
    if (style.strokeColor && style.strokeWidth > 0) {
      applyColorOrGradient(ctx, style.strokeColor, config, canvasSize, 'stroke', bounds);
      ctx.lineWidth = style.strokeWidth;
      ctx.stroke();
    }
  }

  // ============================================================================
  // Circle Router - 원 렌더링 라우터
  // @version 3.0.0
  // ============================================================================


  /**
   * 원 렌더링 - 메인 진입점
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} data - 원 데이터 { center: {x,y}, radius, fillColor, strokeColor, strokeWidth }
   * @param {Object} config - 상태
   * @param {number} canvasSize - 캔버스 크기
   */
  function drawCircle(ctx, data, config, canvasSize) {
    // 기본값 설정
    const {
      center = { x: 0, y: 0 },
      radius = 1
    } = data;

    // 1. 스타일 설정 생성
    const style = createCircleStyle(data);

    // 2. 좌표 변환
    const { cx, cy, rPx, bounds } = transformCircleCoordinates(center, radius, config, canvasSize);

    // 3. 원 렌더링
    renderCircle(ctx, cx, cy, rPx, style, bounds, config, canvasSize);
  }

  /**
   * 이차함수 기본 계산 모듈
   * 이차함수 f(x) = ax² + bx + c에 대한 핵심 수학 계산을 담당
   */

  /**
   * 꼭짓점 계산
   * @param {number} a - 이차항 계수
   * @param {number} b - 일차항 계수
   * @param {number} c - 상수항
   * @returns {{x: number, y: number}} 꼭짓점 좌표
   */
  function calculateVertex(a, b, c) {
      const Vx = -b / (2 * a);
      const Vy = c - (b * b) / (4 * a);
      return { x: Vx, y: Vy };
  }

  /**
   * 판별식 계산
   * @param {number} a - 이차항 계수
   * @param {number} b - 일차항 계수
   * @param {number} c - 상수항
   * @returns {number} 판별식 D = b² - 4ac
   */
  function calculateDiscriminant(a, b, c) {
      return b * b - 4 * a * c;
  }

  /**
   * x절편 계산
   * @param {number} a - 이차항 계수
   * @param {number} b - 일차항 계수
   * @param {number} c - 상수항
   * @returns {Array<{x: number, y: number}>} x절편 배열 (0개, 1개, 또는 2개)
   */
  function calculateXIntercepts(a, b, c) {
      const discriminant = calculateDiscriminant(a, b, c);

      if (discriminant < 0) {
          return [];
      }

      const x1 = (-b - Math.sqrt(discriminant)) / (2 * a);
      const x2 = (-b + Math.sqrt(discriminant)) / (2 * a);

      // 중근인 경우
      if (Math.abs(x1 - x2) < 0.0001) {
          return [{ x: x1, y: 0 }];
      }

      return [
          { x: x1, y: 0 },
          { x: x2, y: 0 }
      ];
  }

  /**
   * y절편 계산
   * @param {number} c - 상수항
   * @returns {{x: number, y: number}} y절편 좌표
   */
  function calculateYIntercept(c) {
      return { x: 0, y: c };
  }

  /**
   * 기하학적 계산 모듈
   * 점 간의 거리, 대칭, 범위 계산 등을 담당
   */

  /**
   * 두 점 사이의 유클리드 거리 계산
   * @param {{x: number, y: number}} point1 - 첫 번째 점
   * @param {{x: number, y: number}} point2 - 두 번째 점
   * @returns {number} 거리
   */
  function calculateDistance(point1, point2) {
      const dx = point1.x - point2.x;
      const dy = point1.y - point2.y;
      return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 기준점을 중심으로 점을 대칭
   * @param {{x: number, y: number}} point - 대칭시킬 점
   * @param {{x: number, y: number}} center - 대칭 중심점
   * @returns {{x: number, y: number}} 대칭된 점
   */
  function reflectPoint(point, center) {
      return {
          x: 2 * center.x - point.x,
          y: point.y  // Y좌표는 유지 (X축 기준 선대칭)
      };
  }

  /**
   * 두 경계 상자의 합집합 계산
   * @param {{mx: number, Mx: number, my: number, My: number}} box1 - 첫 번째 상자
   * @param {{mx: number, Mx: number, my: number, My: number}} box2 - 두 번째 상자
   * @returns {{mx: number, Mx: number, my: number, My: number}} 합집합 상자
   */
  function unionBoundingBoxes(box1, box2) {
      return {
          mx: Math.min(box1.mx, box2.mx),
          Mx: Math.max(box1.Mx, box2.Mx),
          my: Math.min(box1.my, box2.my),
          My: Math.max(box1.My, box2.My)
      };
  }

  /**
   * 여러 경계 상자의 합집합 계산
   * @param {Array<{mx: number, Mx: number, my: number, My: number}>} boxes - 상자 배열
   * @returns {{mx: number, Mx: number, my: number, My: number}} 합집합 상자
   */
  function unionMultipleBoundingBoxes(boxes) {
      if (boxes.length === 0) {
          return { mx: 0, Mx: 0, my: 0, My: 0 };
      }

      if (boxes.length === 1) {
          return { ...boxes[0] };
      }

      return boxes.reduce((acc, box) => unionBoundingBoxes(acc, box));
  }

  /**
   * 주시영역 특수 케이스 처리 모듈
   * - 원점 꼭짓점
   * - 판별식 < 0 & b = 0 (축이 y축)
   * - 판별식 < 0 & b ≠ 0 (V' 규칙)
   */


  /**
   * 원점 꼭짓점 특수 케이스 확인
   * @param {Array<{a: number, b: number, c: number}>} functions - 함수 배열
   * @returns {boolean} 모든 함수의 꼭짓점이 원점인지 여부
   */
  function isOriginVertexCase(functions) {
      if (functions.length < 2) {
          return false;
      }

      return functions.every(func => {
          const vertex = calculateVertex(func.a, func.b, func.c);
          return Math.abs(vertex.x) < 0.0001 && Math.abs(vertex.y) < 0.0001;
      });
  }

  /**
   * 원점 꼭짓점 특수 케이스 주시영역 계산
   * 대칭 기본값 [-10, 10] × [-10, 10] 반환
   * @param {Array<{a: number, b: number, c: number}>} functions - 함수 배열
   * @returns {{mx: number, Mx: number, my: number, My: number}} 주시영역
   */
  function calculateOriginVertexFocusArea(functions) {
      // 원점 꼭짓점 케이스는 대칭 기본값 사용
      return { mx: -10, Mx: 10, my: -10, My: 10 };
  }

  /**
   * b = 0 & 판별식 < 0 특수 케이스 확인
   * @param {number} a - 이차항 계수
   * @param {number} b - 일차항 계수
   * @param {number} c - 상수항
   * @returns {boolean} b = 0 & 판별식 < 0 여부
   */
  function isBZeroNoXIntercept(a, b, c) {
      const discriminant = calculateDiscriminant(a, b, c);
      return discriminant < 0 && Math.abs(b) < 0.0001;
  }

  /**
   * b = 0 & 판별식 < 0 특수 케이스 주시영역 계산
   * @param {number} a - 이차항 계수
   * @param {number} c - 상수항
   * @returns {{mx: number, Mx: number, my: number, My: number, V: {x: number, y: number, label: string}}} 주시영역
   */
  function calculateBZeroFocusArea(a, c) {
      const absC = Math.abs(c);
      const absA = Math.abs(a);
      const sampleX = Math.sqrt(absC / absA);
      const halfWidth = Math.max(sampleX, 1);
      const height = 2 * absC;

      const Vx = 0;
      const Vy = c;

      if (c > 0) {
          // 아래로 볼록 포물선
          return {
              mx: -halfWidth,
              Mx: halfWidth,
              my: 0,
              My: height,
              V: { x: Vx, y: Vy, label: 'V' }
          };
      } else {
          // 위로 볼록 포물선
          return {
              mx: -halfWidth,
              Mx: halfWidth,
              my: -height,
              My: 0,
              V: { x: Vx, y: Vy, label: 'V' }
          };
      }
  }

  /**
   * 판별식 < 0 & b ≠ 0 케이스 확인
   * @param {number} a - 이차항 계수
   * @param {number} b - 일차항 계수
   * @param {number} c - 상수항
   * @returns {boolean} 판별식 < 0 & b ≠ 0 여부
   */
  function isVPrimeCase(a, b, c) {
      const discriminant = calculateDiscriminant(a, b, c);
      return discriminant < 0 && Math.abs(b) >= 0.0001;
  }

  /**
   * V' 계산 (판별식 < 0 & b ≠ 0 케이스)
   * @param {number} a - 이차항 계수
   * @param {number} b - 일차항 계수
   * @returns {{x: number, y: number, label: string}} V' 좌표
   */
  function calculateVPrime(a, b) {
      const Vx = -b / (2 * a);
      return { x: Vx, y: 0, label: "V'" };
  }

  /**
   * 원점 꼭짓점 특수 케이스 확인 (단일 함수, 1~2개 함수 시)
   * @param {number} a - 이차항 계수
   * @param {number} b - 일차항 계수
   * @param {number} c - 상수항
   * @param {number} totalFunctions - 총 함수 개수
   * @returns {boolean} 원점 꼭짓점 특수 케이스 여부
   */
  function isSingleOriginVertex(a, b, c, totalFunctions) {
      if (totalFunctions > 2) {
          return false;
      }

      const vertex = calculateVertex(a, b, c);
      return Math.abs(vertex.x) < 0.0001 && Math.abs(vertex.y) < 0.0001;
  }

  /**
   * 단일 함수 원점 꼭짓점 주시영역 계산
   * @param {number} a - 이차항 계수
   * @returns {{mx: number, Mx: number, my: number, My: number}} 주시영역
   */
  function calculateSingleOriginVertexFocusArea(a) {
      if (a > 0) {
          return { mx: -10, Mx: 10, my: -5, My: 15 };
      } else {
          return { mx: -10, Mx: 10, my: -15, My: 5 };
      }
  }

  // ============================================================================
  // 일차함수 특수 케이스 (Linear Functions)
  // ============================================================================

  /**
   * 일차함수 판별 (a=0인 경우)
   * @param {number} a - 이차항 계수
   * @param {number} b - 일차항 계수
   * @param {number} c - 상수항
   * @returns {boolean} 일차함수 여부
   */
  function isLinearFunction(a, b, c) {
      return Math.abs(a) < 0.0001;
  }

  /**
   * 일차함수 기본 범위 반환
   * 일차함수는 무한히 뻗어나가므로 고정 범위 사용
   * @returns {Object} 기본 좌표 범위 {mx, Mx, my, My}
   */
  function getLinearFunctionDefaultRange() {
      return {
          mx: -10,
          Mx: 10,
          my: -10,
          My: 10
      };
  }

  /**
   * 단일 함수 주시영역 계산 모듈
   * single_function_focus_area.md 규칙 구현
   * Layer 객체를 plain object로 변환하여 처리
   */


  /**
   * Layer 객체를 plain object로 변환
   * @param {Object} layerFunc - Layer 형식의 함수 객체
   * @param {number} index - 함수 인덱스
   * @returns {{a: number, b: number, c: number, name: string}} Plain object
   */
  function layerToPlainFunc$1(layerFunc, index = 0) {
      const [a, b, c] = layerFunc.value || [0, 0, 0];
      return {
          a,
          b,
          c,
          name: layerFunc.name || `f${index + 1}`
      };
  }

  /**
   * 단일 함수의 주시영역 계산
   * @param {Object} layerFunc - Layer 형식의 함수 객체
   * @param {Array<{x: number, y: number}>} additionalPoints - 추가 점들 (교점 등)
   * @param {number} totalFunctions - 총 함수 개수
   * @param {number} funcIndex - 함수 인덱스 (디버그용)
   * @returns {{mx: number, Mx: number, my: number, My: number, V: object, F1: object, F2: object, F3: object, F4: object}} 주시영역 정보
   */
  function calculateSingleFocusArea(layerFunc, additionalPoints = [], totalFunctions = 1, funcIndex = 0) {
      // Layer 객체를 plain object로 변환
      const func = layerToPlainFunc$1(layerFunc, funcIndex);
      const { a, b, c} = func;

      // 특수 케이스 0: 일차함수 (a=0) - 최우선 처리
      if (isLinearFunction(a)) {
          const range = getLinearFunctionDefaultRange();

          return {
              ...range,
              V: null,      // 일차함수는 꼭짓점 없음
              F1: null,
              F2: null,
              F3: null,
              F4: null,
              beforeSquaring: { ...range },
              afterSquaring: { ...range }
          };
      }

      // 꼭짓점 계산 (이차함수만)
      const vertex = calculateVertex(a, b, c);
      const Vx = vertex.x;
      const Vy = vertex.y;

      // 특수 케이스 1: 원점 꼭짓점 (함수 1~2개일 때만)
      if (isSingleOriginVertex(a, b, c, totalFunctions)) {
          const area = calculateSingleOriginVertexFocusArea(a);
          const V = { x: Vx, y: Vy, label: 'V' };
          return { ...area, V, F1: null, F2: null, F3: null, F4: null };
      }

      // 특수 케이스 2: b = 0 & 판별식 < 0
      if (isBZeroNoXIntercept(a, b, c)) {
          const area = calculateBZeroFocusArea(a, c);
          return { ...area, F1: null, F2: null, F3: null, F4: null };
      }

      // V 또는 V' 결정
      let V;
      if (isVPrimeCase(a, b, c)) {
          V = calculateVPrime(a, b);
      } else {
          V = { x: Vx, y: Vy, label: 'V' };
      }

      // 일반 케이스: F1~F4 계산
      const points = [];

      // 원점
      const O = { x: 0, y: 0, label: 'O' };
      points.push({ point: O, dist: calculateDistance(O, V), label: 'O' });

      // x절편들
      const xIntercepts = calculateXIntercepts(a, b, c);
      xIntercepts.forEach((intercept, idx) => {
          points.push({
              point: intercept,
              dist: calculateDistance(intercept, V),
              label: `X${idx + 1}`
          });
      });

      // y절편
      const yIntercept = calculateYIntercept(c);
      points.push({
          point: yIntercept,
          dist: calculateDistance(yIntercept, V),
          label: 'Y'
      });

      // 추가 점들
      additionalPoints.forEach((p, idx) => {
          points.push({
              point: p,
              dist: calculateDistance(p, V),
              label: `P${idx + 1}`
          });
      });

      // F1: 가장 먼 점
      points.sort((a, b) => b.dist - a.dist);
      const F1 = { ...points[0].point, label: 'F1' };

      // F2: V를 기준으로 F1을 대칭
      const F2 = { ...reflectPoint(F1, V), label: 'F2' };

      // F3, F4: V(또는 V')의 y좌표 높이
      const F3 = { x: F1.x, y: V.y, label: 'F3' };
      const F4 = { x: F2.x, y: V.y, label: 'F4' };

      // 주시영역 계산 (여백 제외)
      const focusPoints = [F1, F2, F3, F4];
      const xs = focusPoints.map(p => p.x);
      const ys = focusPoints.map(p => p.y);

      const mx = Math.min(...xs);
      const Mx = Math.max(...xs);
      const my = Math.min(...ys);
      const My = Math.max(...ys);

      return { mx, Mx, my, My, V, F1, F2, F3, F4 };
  }

  /**
   * 다중 함수 주시영역 통합 모듈
   * multiple_functions_focus_area.md 규칙 구현
   * Layer 객체 지원 + 70% 규칙 통합
   */


  /**
   * Layer 객체를 plain object로 변환
   * @param {Object} layerFunc - Layer 형식의 함수 객체
   * @param {number} index - 함수 인덱스
   * @returns {{a: number, b: number, c: number, name: string}} Plain object
   */
  function layerToPlainFunc(layerFunc, index = 0) {
      const [a, b, c] = layerFunc.value || [0, 0, 0];
      return {
          a,
          b,
          c,
          name: layerFunc.name || `f${index + 1}`
      };
  }

  /**
   * 70% 규칙 적용 (정사각형 조정 포함)
   * @param {{mx: number, Mx: number, my: number, My: number}} focusArea - 주시영역 (여백 포함)
   * @param {boolean} useOriginVertexRule - 원점 꼭짓점 규칙 사용 여부
   * @returns {{xMin: number, xMax: number, yMin: number, yMax: number}} 최종 좌표 범위
   */
  function apply70PercentRule(focusArea, useOriginVertexRule = false) {
      // 원점 꼭짓점 특수 케이스는 70% 규칙 적용하지 않음
      if (useOriginVertexRule) {
          return {
              xMin: focusArea.mx,
              xMax: focusArea.Mx,
              yMin: focusArea.my,
              yMax: focusArea.My
          };
      }

      const { mx, Mx, my, My } = focusArea;
      const finalWidth = Mx - mx;
      const finalHeight = My - my;
      const xCenter = (Mx + mx) / 2;
      const yCenter = (My + my) / 2;

      // 70% 규칙: 주시영역이 뷰포트의 70%를 차지하도록
      let totalRange;
      if (finalHeight >= finalWidth) {
          totalRange = finalHeight / 0.7;
      } else {
          totalRange = finalWidth / 0.7;
      }

      // 정사각형으로 조정 (중심점 기준 대칭)
      const xMin = xCenter - totalRange / 2;
      const xMax = xCenter + totalRange / 2;
      const yMin = yCenter - totalRange / 2;
      const yMax = yCenter + totalRange / 2;

      return { xMin, xMax, yMin, yMax };
  }

  /**
   * 다중 함수의 통합 주시영역 계산
   * @param {Array<Object>} layerFunctions - Layer 형식의 함수 배열
   * @param {Array<{x: number, y: number}>} userPoints - 사용자 정의 점 배열
   * @param {Array<{type: string, points: Array}>} shapes - 도형 배열
   * @returns {{xMin: number, xMax: number, yMin: number, yMax: number, _debug: Object}} 통합 주시영역
   */
  function calculateMultiFunctionFocusArea(layerFunctions, userPoints = [], shapes = []) {
      // Layer 객체를 plain object로 변환
      const functions = layerFunctions.map((layerFunc, idx) => layerToPlainFunc(layerFunc, idx));

      // 각 함수의 개별 주시영역 계산
      const individualAreas = layerFunctions.map((layerFunc, idx) =>
          calculateSingleFocusArea(layerFunc, [], layerFunctions.length, idx)
      );

      // ===== 최우선: 도형이 있는 경우 =====
      if (shapes.length > 0) {
          const allShapePoints = shapes.flatMap(shape => shape.points);

          if (allShapePoints.length > 0) {
              const xs = allShapePoints.map(p => p.x);
              const ys = allShapePoints.map(p => p.y);
              let mx = Math.min(...xs);
              let Mx = Math.max(...xs);
              let my = Math.min(...ys);
              let My = Math.max(...ys);

              // 사용자 점이 있으면 점까지 확장
              if (userPoints.length > 0) {
                  const pointXs = userPoints.map(p => p.x);
                  const pointYs = userPoints.map(p => p.y);

                  mx = Math.min(mx, ...pointXs);
                  Mx = Math.max(Mx, ...pointXs);
                  my = Math.min(my, ...pointYs);
                  My = Math.max(My, ...pointYs);
              }

              // 여백 추가 (사방으로)
              const xMargin = Math.max(Math.ceil((Mx - mx) / 5), 2);
              const yMargin = Math.max(Math.ceil((My - my) / 5), 2);

              mx = mx - xMargin;
              Mx = Mx + xMargin;
              my = my - yMargin;
              My = My + yMargin;

              // 함수가 있으면 꼭짓점 확인 및 확장
              if (functions.length > 0) {
                  // V가 null인 경우(일차함수) 제외
                  const vertices = individualAreas.map(area => area.V).filter(v => v !== null);

                  let needsExpansion = false;
                  vertices.forEach(V => {
                      if (V.x < mx || V.x > Mx || V.y < my || V.y > My) {
                          needsExpansion = true;
                      }
                  });

                  if (needsExpansion) {
                      const vertexXs = vertices.map(v => v.x);
                      const vertexYs = vertices.map(v => v.y);

                      mx = Math.min(mx, ...vertexXs);
                      Mx = Math.max(Mx, ...vertexXs);
                      my = Math.min(my, ...vertexYs);
                      My = Math.max(My, ...vertexYs);
                  }

                  // 추가 여백 (위 또는 아래)
                  const hasUpward = functions.some(f => f.a < 0);
                  const additionalMargin = Math.max(Math.ceil((My - my) / 10), 1);

                  if (hasUpward) {
                      my = my - additionalMargin;
                  } else {
                      My = My + additionalMargin;
                  }
              }

              // 70% 규칙 적용 전 좌표 저장 (디버그 시각화용)
              const beforeSquaring = { mx, Mx, my, My };

              // 70% 규칙 적용
              const finalCoords = apply70PercentRule({ mx, Mx, my, My }, false);

              return {
                  ...finalCoords,
                  _debug: {
                      mode: 'Shapes',
                      functionCount: functions.length,
                      individualAreas,
                      beforeSquaring,          // 70% 규칙 적용 전 (파랑 박스)
                      afterSquaring: finalCoords,  // 70% 규칙 적용 후 (초록 박스)
                      useOriginVertexRule: false,
                      // 디버그 시각화를 위해 shapes와 userPoints 포함
                      shapes,
                      userPoints
                  }
              };
          }
      }

      // ===== 도형이 없는 경우: 기존 로직 =====
      if (functions.length === 0) {
          // 함수가 없고 점만 있는 경우
          if (userPoints.length > 0) {
              const xs = userPoints.map(p => p.x);
              const ys = userPoints.map(p => p.y);
              const mx = Math.min(...xs);
              const Mx = Math.max(...xs);
              const my = Math.min(...ys);
              const My = Math.max(...ys);

              // 최소 범위 보장
              const width = Math.max(Mx - mx, 2);
              const height = Math.max(My - my, 2);
              const centerX = (mx + Mx) / 2;
              const centerY = (my + My) / 2;

              // 70% 규칙 적용
              const focusArea = {
                  mx: centerX - width / 2,
                  Mx: centerX + width / 2,
                  my: centerY - height / 2,
                  My: centerY + height / 2
              };

              // 70% 규칙 적용 전 좌표 저장 (디버그 시각화용)
              const beforeSquaring = { ...focusArea };

              const finalCoords = apply70PercentRule(focusArea, false);

              return {
                  ...finalCoords,
                  _debug: {
                      mode: 'PointsOnly',
                      individualAreas: [],
                      beforeSquaring,          // 70% 규칙 적용 전 (파랑 박스)
                      afterSquaring: finalCoords,  // 70% 규칙 적용 후 (초록 박스)
                      useOriginVertexRule: false
                  }
              };
          }

          return {
              xMin: -10, xMax: 10, yMin: -10, yMax: 10,
              _debug: {
                  mode: 'Default',
                  individualAreas: [],
                  useOriginVertexRule: false
              }
          };
      }

      // 특수 케이스: 모든 함수의 꼭짓점이 원점 (함수 2개 이상, 점 없음)
      if (isOriginVertexCase(functions) && userPoints.length === 0) {
          const area = calculateOriginVertexFocusArea();

          // 원점 꼭짓점 케이스는 70% 규칙 적용하지 않음
          return {
              xMin: area.mx,
              xMax: area.Mx,
              yMin: area.my,
              yMax: area.My,
              _debug: {
                  mode: 'Union',
                  specialCase: '원점 꼭짓점',
                  functionCount: functions.length,
                  individualAreas,
                  useOriginVertexRule: true
              }
          };
      }

      // 일반 케이스: 개별 주시영역들의 Union
      const boxes = individualAreas.map(area => ({
          mx: area.mx,
          Mx: area.Mx,
          my: area.my,
          My: area.My
      }));

      // 사용자 점이 있으면 점들의 경계 상자도 추가
      if (userPoints.length > 0) {
          const xs = userPoints.map(p => p.x);
          const ys = userPoints.map(p => p.y);
          boxes.push({
              mx: Math.min(...xs),
              Mx: Math.max(...xs),
              my: Math.min(...ys),
              My: Math.max(...ys)
          });
      }

      const unionBox = unionMultipleBoundingBoxes(boxes);
      let { mx, Mx, my, My } = unionBox;

      const beforeMargin = { mx, Mx, my, My };

      // 여백 추가 (통합 후 한 번만)
      const rectHeight = My - my;
      const hasUpward = functions.some(f => f.a < 0);
      const margin = Math.max(Math.ceil(rectHeight / 10), 1);

      let my_with_margin = my;
      let My_with_margin = My;

      if (hasUpward) {
          my_with_margin = my - margin;
      } else {
          My_with_margin = My + margin;
      }

      const afterMargin = { mx, Mx, my: my_with_margin, My: My_with_margin };

      // 70% 규칙 적용 전 좌표 저장 (디버그 시각화용)
      const beforeSquaring = { ...afterMargin };

      // 70% 규칙 적용
      const finalCoords = apply70PercentRule(
          { mx, Mx, my: my_with_margin, My: My_with_margin },
          false
      );

      return {
          ...finalCoords,
          _debug: {
              mode: 'Union',
              functionCount: functions.length,
              individualAreas,
              union: beforeMargin,
              margin: { value: margin, direction: hasUpward ? '아래' : '위' },
              afterMargin,
              beforeSquaring,          // 70% 규칙 적용 전 (파랑 박스)
              afterSquaring: finalCoords,  // 70% 규칙 적용 후 (초록 박스)
              rule70percent: {
                  applied: true,
                  ratio: 0.7
              },
              useOriginVertexRule: false
          }
      };
  }

  /**
   * 통합 주시영역에 교점 정보 추가 (시각화용)
   * @param {Array<Object>} layerFunctions - Layer 형식의 함수 배열
   * @returns {Array<{x: number, y: number, label: string}>} 교점 배열
   */
  function calculateAllIntersections(layerFunctions) {
      const functions = layerFunctions.map((layerFunc, idx) => layerToPlainFunc(layerFunc, idx));
      const allIntersections = [];

      for (let i = 0; i < functions.length; i++) {
          for (let j = i + 1; j < functions.length; j++) {
              const f1 = functions[i];
              const f2 = functions[j];

              const aI = f1.a - f2.a;
              const bI = f1.b - f2.b;
              const cI = f1.c - f2.c;

              if (Math.abs(aI) > 0.0001) {
                  const disc = bI * bI - 4 * aI * cI;
                  if (disc >= 0) {
                      const xi1 = (-bI - Math.sqrt(disc)) / (2 * aI);
                      const yi1 = f1.a * xi1 * xi1 + f1.b * xi1 + f1.c;
                      allIntersections.push({
                          x: xi1,
                          y: yi1,
                          label: `I_${f1.name}${f2.name}`
                      });

                      if (disc > 0.0001) {
                          const xi2 = (-bI + Math.sqrt(disc)) / (2 * aI);
                          const yi2 = f1.a * xi2 * xi2 + f1.b * xi2 + f1.c;
                          allIntersections.push({
                              x: xi2,
                              y: yi2,
                              label: `I_${f1.name}${f2.name}`
                          });
                      }
                  }
              }
          }
      }

      return allIntersections;
  }

  // ============================================================================
  // Auto Set Coordinate Plane - 좌표평면 자동 설정 메인 진입점
  // @version 4.0.0
  // ============================================================================


  /**
   * 자동 좌표평면 설정 함수
   * 새로운 아키텍처: Core + Focus-area 모듈 기반, 70% 규칙 통합
   * @param {Array} functions - Layer 형식의 함수 배열
   * @param {Object} options - 옵션 (디버그 설정, 사용자 점, 도형 등)
   * @param {boolean} options.showDebugBoundingBox - 디버그 바운딩 박스 표시
   * @param {boolean} options.showDebugRectangle - 디버그 직사각형 표시
   * @param {Array<{x: number, y: number}>} options.userPoints - 사용자 정의 점 배열 (선택적)
   * @param {Array<{type: string, points: Array}>} options.shapes - 도형 배열 (선택적)
   * @returns {Object} { xMin, xMax, yMin, yMax, _debug? } 좌표 범위 (디버그 데이터 포함 가능)
   */
  function autoSetCoordinatePlane(functions, options = {}) {
    const enableDebug = options.showDebugBoundingBox || options.showDebugRectangle;
    const userPoints = options.userPoints || [];
    const shapes = options.shapes || [];

    // 기본값: 함수가 없으면 기본 범위 반환
    if (!functions || !Array.isArray(functions) || functions.length === 0) {
      return { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };
    }

    // calculateMultiFunctionFocusArea를 사용하여 통합 계산
    // (단일 함수도 이 함수에서 처리)
    const result = calculateMultiFunctionFocusArea(functions, userPoints, shapes);

    // 반환 형식: { xMin, xMax, yMin, yMax, _debug? }
    // enableDebug가 false면 _debug 제거
    if (!enableDebug && result._debug) {
      const { _debug, ...coords } = result;
      return coords;
    }

    return result;
  }

  // hasPointsInFunc helper function은 이제 필요 없음 (새 아키텍처에서 처리)

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
  // Coordinate Transition Utilities - 좌표평면 전환 애니메이션
  // @version 1.0.0
  // ============================================================================


  /**
   * 선형 보간 헬퍼 함수
   * @param {number} a - 시작값
   * @param {number} b - 종료값
   * @param {number} t - 진행도 (0-1)
   * @returns {number} 보간된 값
   */
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /**
   * 좌표 전환 시작
   * @param {Object} config - 좌표 설정 객체 (mutable)
   * @param {Object} newCoordinates - 목표 좌표 { xMin, xMax, yMin, yMax }
   * @param {Object} options - 옵션 { duration, easing, onComplete }
   */
  function startCoordinateTransition(config, newCoordinates, options = {}) {
    // 이미 목표 좌표에 있는지 확인 (불필요한 애니메이션 방지)
    const isAtTarget =
      config.xMin === newCoordinates.xMin &&
      config.xMax === newCoordinates.xMax &&
      config.yMin === newCoordinates.yMin &&
      config.yMax === newCoordinates.yMax;

    if (isAtTarget) {
      console.log('좌표 전환: 이미 목표 좌표에 있음 - 전환 스킵');
      return;
    }

    config.coordinateTransition = {
      enabled: true,
      duration: options.duration || 800,
      easing: options.easing || 'easeOut',
      progress: 0,
      startTime: performance.now(),
      onComplete: options.onComplete || null,
      fromConfig: {
        xMin: config.xMin,
        xMax: config.xMax,
        yMin: config.yMin,
        yMax: config.yMax
      },
      toConfig: {
        xMin: newCoordinates.xMin,
        xMax: newCoordinates.xMax,
        yMin: newCoordinates.yMin,
        yMax: newCoordinates.yMax
      }
    };
  }

  /**
   * 좌표 전환 업데이트 (렌더 루프에서 호출)
   * @param {Object} config - 좌표 설정 객체 (mutable)
   * @param {number} currentTime - 현재 타임스탬프
   * @returns {boolean} - 여전히 애니메이션 중이면 true
   */
  function updateCoordinateTransition(config, currentTime) {
    const trans = config.coordinateTransition;

    if (!trans || !trans.enabled) {
      return false;
    }

    const elapsed = currentTime - trans.startTime;
    const rawProgress = Math.min(elapsed / trans.duration, 1);
    trans.progress = applyEasing(rawProgress, trans.easing);

    // 좌표값 보간
    config.xMin = lerp(trans.fromConfig.xMin, trans.toConfig.xMin, trans.progress);
    config.xMax = lerp(trans.fromConfig.xMax, trans.toConfig.xMax, trans.progress);
    config.yMin = lerp(trans.fromConfig.yMin, trans.toConfig.yMin, trans.progress);
    config.yMax = lerp(trans.fromConfig.yMax, trans.toConfig.yMax, trans.progress);

    // 완료 체크
    if (rawProgress >= 1) {
      // 정확한 목표값으로 스냅
      config.xMin = trans.toConfig.xMin;
      config.xMax = trans.toConfig.xMax;
      config.yMin = trans.toConfig.yMin;
      config.yMax = trans.toConfig.yMax;

      trans.enabled = false;

      console.log('좌표 전환 완료:', {
        xMin: config.xMin,
        xMax: config.xMax,
        yMin: config.yMin,
        yMax: config.yMax
      });

      if (trans.onComplete) {
        trans.onComplete();
      }

      return false;
    }

    return true; // 여전히 애니메이션 중
  }

  // ============================================================================
  // Coordinate Cache Utility - 좌표 계산 캐싱 유틸리티
  // @version 1.0.0
  // ============================================================================

  /**
   * 좌표 계산 캐시 관리 클래스
   * 성능 최적화를 위해 함수 변경 시에만 좌표를 재계산하고, 그 외에는 캐시된 결과를 재사용
   */
  class CoordinateCache {
    constructor() {
      // 캐시된 좌표 계산 결과
      this.cachedResult = null;

      // 이전 함수 시그니처 (변경 감지용)
      this.previousSignature = null;

      // 디버그 데이터 (마지막 계산 결과)
      this.lastDebugData = null;

      // 통계
      this.stats = {
        hits: 0,      // 캐시 히트 횟수
        misses: 0,    // 캐시 미스 횟수
        lastUpdate: null
      };
    }

    /**
     * 함수 배열의 시그니처 생성 (변경 감지용)
     * @param {Array} functions - 함수 배열
     * @param {boolean} debugMode - 디버그 모드 여부
     * @param {Array} shapes - 도형 배열
     * @param {Array} userPoints - 사용자 점 배열
     * @returns {string} 시그니처 문자열
     */
    getFunctionsSignature(functions, debugMode = false, shapes = [], userPoints = []) {
      if (!functions || !Array.isArray(functions)) return '';

      const functionsSignature = functions.map(func => {
        if (!func.value || !Array.isArray(func.value)) return '';
        return func.value.join(',');
      }).join('|');

      // shapes 시그니처 생성
      const shapesSignature = shapes.map(shape => {
        const pointsStr = shape.points.map(p => `${p.x},${p.y}`).join(';');
        return `${shape.type}:${pointsStr}`;
      }).join('|');

      // userPoints 시그니처 생성
      const pointsSignature = userPoints.map(p => `${p.x},${p.y}`).join(';');

      // 디버그 모드 여부도 시그니처에 포함 (디버그 데이터 필요 여부가 다름)
      return `${functionsSignature}:shapes=${shapesSignature}:points=${pointsSignature}:debug=${debugMode}`;
    }

    /**
     * 함수가 변경되었는지 확인
     * @param {Array} functions - 함수 배열
     * @param {boolean} debugMode - 디버그 모드 여부
     * @param {Array} shapes - 도형 배열
     * @param {Array} userPoints - 사용자 점 배열
     * @returns {boolean} 변경 여부
     */
    hasChanged(functions, debugMode = false, shapes = [], userPoints = []) {
      const currentSignature = this.getFunctionsSignature(functions, debugMode, shapes, userPoints);
      return currentSignature !== this.previousSignature;
    }

    /**
     * 캐시에서 좌표 가져오기
     * @param {Array} functions - 함수 배열
     * @param {boolean} debugMode - 디버그 모드 여부
     * @param {Array} shapes - 도형 배열
     * @param {Array} userPoints - 사용자 점 배열
     * @returns {Object|null} 캐시된 좌표 결과 또는 null
     */
    get(functions, debugMode = false, shapes = [], userPoints = []) {
      if (!this.hasChanged(functions, debugMode, shapes, userPoints) && this.cachedResult) {
        this.stats.hits++;
        return {
          coord: this.cachedResult.coord,
          debugData: this.cachedResult.debugData,
          fromCache: true
        };
      }

      this.stats.misses++;
      return null;
    }

    /**
     * 좌표 계산 결과를 캐시에 저장
     * @param {Array} functions - 함수 배열
     * @param {Object} coord - 좌표 결과 {xMin, xMax, yMin, yMax}
     * @param {Object} debugData - 디버그 데이터 (선택적)
     * @param {boolean} debugMode - 디버그 모드 여부
     * @param {Array} shapes - 도형 배열
     * @param {Array} userPoints - 사용자 점 배열
     */
    set(functions, coord, debugData = null, debugMode = false, shapes = [], userPoints = []) {
      const signature = this.getFunctionsSignature(functions, debugMode, shapes, userPoints);

      this.cachedResult = {
        coord,
        debugData
      };

      this.previousSignature = signature;
      this.lastDebugData = debugData;
      this.stats.lastUpdate = performance.now();
    }

    /**
     * 캐시 및 디버그 데이터 초기화
     */
    clear() {
      this.cachedResult = null;
      this.previousSignature = null;
      this.lastDebugData = null;
      this.stats = {
        hits: 0,
        misses: 0,
        lastUpdate: null
      };
    }

    /**
     * 캐시 통계 가져오기
     * @returns {Object} 캐시 통계
     */
    getStats() {
      const total = this.stats.hits + this.stats.misses;
      const hitRate = total > 0 ? (this.stats.hits / total * 100).toFixed(2) : 0;

      return {
        ...this.stats,
        total,
        hitRate: `${hitRate}%`
      };
    }

    /**
     * 디버그 데이터 가져오기
     * @returns {Object|null} 마지막 디버그 데이터
     */
    getDebugData() {
      return this.lastDebugData;
    }
  }

  // 싱글톤 인스턴스 생성
  const coordinateCache = new CoordinateCache();

  // ============================================================================
  // Coordinate Plane Utils - 좌표평면 유틸리티 함수
  // @version 3.0.0
  // ============================================================================

  /**
   * 그리드 간격 자동 계산
   * @param {number} range - 범위
   * @returns {number} 적절한 간격
   */
  function calculateGridStep(range) {
    const targetSteps = 10; // 목표 눈금 개수
    const roughStep = range / targetSteps;

    // 10의 거듭제곱으로 정규화
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const normalized = roughStep / magnitude;

    // 1, 2, 5 중 선택
    let step;
    if (normalized <= 1) {
      step = 1;
    } else if (normalized <= 2) {
      step = 2;
    } else if (normalized <= 5) {
      step = 5;
    } else {
      step = 10;
    }

    return step * magnitude;
  }

  /**
   * 둥근 사각형 경로 생성
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   * @param {number} width - 너비
   * @param {number} height - 높이
   * @param {number} radius - 둥근 모서리 반지름
   */
  function createRoundedRectPath(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
  }

  /**
   * 좌표 범위 검증
   * @param {Object} config - 상태 객체
   * @returns {boolean} 유효성 여부
   */
  function validateCoordinateRange(config) {
    if (!config) return false;

    // 필수 속성 체크
    const required = ['xMin', 'xMax', 'yMin', 'yMax'];
    for (const key of required) {
      if (typeof config[key] !== 'number') {
        console.error(`Invalid config: ${key} must be a number`);
        return false;
      }
    }

    // 범위 체크
    if (config.xMin >= config.xMax) {
      console.error('Invalid config: xMin must be less than xMax');
      return false;
    }

    if (config.yMin >= config.yMax) {
      console.error('Invalid config: yMin must be less than yMax');
      return false;
    }

    return true;
  }

  // ============================================================================
  // Coordinate Plane DTO - 좌표평면 설정 객체
  // @version 3.0.0
  // ============================================================================

  /**
   * 좌표평면 렌더링 설정 객체 생성
   * @param {Object} config - 좌표평면 상태
   * @param {Object} options - 사용자 옵션
   * @returns {Object} 좌표평면 렌더링 설정
   */
  function createCoordinatePlaneConfig(config, options = {}) {
    return {
      // 표시 옵션
      showAxes: config.showAxes,
      showGrid: config.showGrid,
      showMinorGrid: config.showMinorGrid,
      showTicks: config.showTicks,
      showLabels: config.showLabels,
      showArrows: config.showArrows,
      showAxisLabels: config.showAxisLabels,
      showOrigin: config.showOriginLabel,

      // 색상 및 두께
      backgroundColor: config.backgroundColor,
      axesColor: config.axisColor,
      gridColor: config.gridColor,
      minorGridColor: config.minorGridColor,
      labelColor: config.labelColor,
      axesWidth: config.axisWidth,
      gridWidth: config.gridWidth,
      minorGridWidth: config.minorGridWidth,

      // 테두리 설정
      borderEnabled: config.borderEnabled,
      borderColor: config.borderColor,
      borderWidth: config.borderWidth,
      borderRadius: config.borderRadius,

      // 간격 설정
      gridSpacing: config.gridSpacing,
      minorGridSpacing: config.minorGridSpacing,

      // 크기
      arrowSize: 8,
      tickSize: config.tickLength,

      // 폰트
      fontFamily: config.fontFamily,
      fontSize: config.fontSize,

      // 축 라벨(눈금 숫자) 전용 폰트
      labelFontSize: config.labelFontSize,
      labelFontFamily: config.labelFontFamily,

      // 축 글자(x, y) 전용 폰트
      axisLabelFontSize: config.axisLabelFontSize,
      axisLabelFontFamily: config.axisLabelFontFamily,

      // 원점(O) 전용 폰트
      originLabelFontSize: config.originLabelFontSize,
      originLabelFontFamily: config.originLabelFontFamily,

      // 오프셋
      xLabelOffset: 16,
      xLabelOffsetY: 8,   // X축 라벨의 Y 좌표 오프셋 (위아래 이동)
      yLabelOffset: 16,
      yLabelOffsetX: -20,  // Y축 라벨의 X 좌표 오프셋 (좌우 이동)
      originOffsetX: 6,
      originOffsetY: 6,
      numberLabelOffsetX: 8,
      numberLabelOffsetY: 8,

      // 디버그 옵션
      showDebugBoundingBox: config.showDebugBoundingBox,
      showDebugRectangle: config.showDebugRectangle,
      showDebugPoints: config.showDebugPoints,
      showDebugFinalBounds: config.showDebugFinalBounds,
      debugBoxColor: config.debugBoxColor,
      debugLineWidth: config.debugLineWidth,

      // 사용자 옵션으로 덮어쓰기
      ...options
    };
  }

  // ============================================================================
  // Coordinate Plane Renderer - 좌표평면 렌더링 렌더러
  // @version 3.0.0
  // ============================================================================


  /**
   * 배경 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} coordState - 좌표평면 상태
   * @param {number} canvasSize - 캔버스 크기
   */
  function drawBackground(ctx, renderConfig, canvasSize) {
    // 전체 클리어 (투명하게)
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // 배경 그리기 - 항상 save/restore로 감싸서 fillStyle이 남지 않도록
    ctx.save();

    if (renderConfig.borderEnabled && renderConfig.borderRadius > 0) {
      // 둥근 모서리로 배경 그리기
      createRoundedRectPath(ctx, 0, 0, canvasSize, canvasSize, renderConfig.borderRadius);
      ctx.clip();
      ctx.fillStyle = renderConfig.backgroundColor;
      ctx.fillRect(0, 0, canvasSize, canvasSize);
    } else {
      // 일반 사각형 배경
      ctx.fillStyle = renderConfig.backgroundColor;
      ctx.fillRect(0, 0, canvasSize, canvasSize);
    }

    ctx.restore();
  }

  /**
   * 축 그리기 (X축, Y축)
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} coordState - 좌표평면 상태
   * @param {number} canvasSize - 캔버스 크기
   * @param {Object} renderConfig - 렌더링 설정
   */
  function drawAxes(ctx, coordState, canvasSize, renderConfig) {
    ctx.save();

    ctx.strokeStyle = renderConfig.axesColor;
    ctx.lineWidth = renderConfig.axesWidth;
    ctx.fillStyle = renderConfig.axesColor;

    // X축 (y=0)
    const y0 = coordToPixelY$1(0, coordState, canvasSize);
    if (y0 >= 0 && y0 <= canvasSize) {
      // 축 선
      ctx.beginPath();
      ctx.moveTo(0, y0);
      ctx.lineTo(canvasSize, y0);
      ctx.stroke();

      // 오른쪽 화살표
      if (renderConfig.showArrows) {
        ctx.beginPath();
        ctx.moveTo(canvasSize, y0);
        ctx.lineTo(canvasSize - renderConfig.arrowSize, y0 - renderConfig.arrowSize / 2);
        ctx.lineTo(canvasSize - renderConfig.arrowSize, y0 + renderConfig.arrowSize / 2);
        ctx.closePath();
        ctx.fill();
      }

      // x 라벨
      if (renderConfig.showAxisLabels) {
        applyFont(ctx, renderConfig, 'axisText');
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('x', canvasSize - renderConfig.xLabelOffset, y0 + renderConfig.xLabelOffsetY);
      }
    }

    // Y축 (x=0)
    const x0 = coordToPixelX$1(0, coordState, canvasSize);
    if (x0 >= 0 && x0 <= canvasSize) {
      // 축 선
      ctx.beginPath();
      ctx.moveTo(x0, canvasSize);
      ctx.lineTo(x0, 0);
      ctx.stroke();

      // 위쪽 화살표
      if (renderConfig.showArrows) {
        ctx.beginPath();
        ctx.moveTo(x0, 0);
        ctx.lineTo(x0 - renderConfig.arrowSize / 2, renderConfig.arrowSize);
        ctx.lineTo(x0 + renderConfig.arrowSize / 2, renderConfig.arrowSize);
        ctx.closePath();
        ctx.fill();
      }

      // y 라벨
      if (renderConfig.showAxisLabels) {
        applyFont(ctx, renderConfig, 'axisText');
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText('y', x0 + renderConfig.yLabelOffsetX, renderConfig.yLabelOffset);
      }
    }

    // 원점 O 라벨
    if (renderConfig.showOrigin && y0 >= 0 && y0 <= canvasSize && x0 >= 0 && x0 <= canvasSize) {
      applyFont(ctx, renderConfig, 'origin');
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText('O', x0 - renderConfig.originOffsetX, y0 + renderConfig.originOffsetY);
    }

    ctx.restore();
  }

  /**
   * 그리드 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} coordState - 좌표평면 상태
   * @param {number} canvasSize - 캔버스 크기
   * @param {Object} renderConfig - 렌더링 설정
   */
  function drawGrid(ctx, coordState, canvasSize, renderConfig) {
    ctx.save();
    const { xMin, xMax, yMin, yMax } = coordState;

    // 보조 격자선 그리기 (먼저)
    if (renderConfig.showMinorGrid && renderConfig.minorGridSpacing) {
      ctx.strokeStyle = renderConfig.minorGridColor;
      ctx.lineWidth = renderConfig.minorGridWidth;

      // 세로선 (x 방향)
      const xStart = Math.ceil(xMin / renderConfig.minorGridSpacing) * renderConfig.minorGridSpacing;
      for (let x = xStart; x <= xMax; x += renderConfig.minorGridSpacing) {
        const px = coordToPixelX$1(x, coordState, canvasSize);
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, canvasSize);
        ctx.stroke();
      }

      // 가로선 (y 방향)
      const yStart = Math.ceil(yMin / renderConfig.minorGridSpacing) * renderConfig.minorGridSpacing;
      for (let y = yStart; y <= yMax; y += renderConfig.minorGridSpacing) {
        const py = coordToPixelY$1(y, coordState, canvasSize);
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(canvasSize, py);
        ctx.stroke();
      }
    }

    // 주 격자선 그리기
    ctx.strokeStyle = renderConfig.gridColor;
    ctx.lineWidth = renderConfig.gridWidth;

    const gridSpacing = renderConfig.gridSpacing || calculateGridStep(xMax - xMin);

    // 세로선 (x 방향)
    const xStart = Math.ceil(xMin / gridSpacing) * gridSpacing;
    for (let x = xStart; x <= xMax; x += gridSpacing) {
      const px = coordToPixelX$1(x, coordState, canvasSize);
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, canvasSize);
      ctx.stroke();
    }

    // 가로선 (y 방향)
    const yStart = Math.ceil(yMin / gridSpacing) * gridSpacing;
    for (let y = yStart; y <= yMax; y += gridSpacing) {
      const py = coordToPixelY$1(y, coordState, canvasSize);
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(canvasSize, py);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * 눈금 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} coordState - 좌표평면 상태
   * @param {number} canvasSize - 캔버스 크기
   * @param {Object} renderConfig - 렌더링 설정
   */
  function drawTicks(ctx, coordState, canvasSize, renderConfig) {
    ctx.save();

    ctx.strokeStyle = renderConfig.axesColor;
    ctx.lineWidth = 1;

    const { xMin, xMax, yMin, yMax } = coordState;
    const gridSpacing = renderConfig.gridSpacing || calculateGridStep(xMax - xMin);

    // X축 눈금
    const y0 = coordToPixelY$1(0, coordState, canvasSize);
    if (y0 >= 0 && y0 <= canvasSize) {
      const xStart = Math.ceil(xMin / gridSpacing) * gridSpacing;

      for (let x = xStart; x <= xMax; x += gridSpacing) {
        if (x === 0) continue; // 원점 제외
        const px = coordToPixelX$1(x, coordState, canvasSize);
        ctx.beginPath();
        ctx.moveTo(px, y0 - renderConfig.tickSize);
        ctx.lineTo(px, y0 + renderConfig.tickSize);
        ctx.stroke();
      }
    }

    // Y축 눈금
    const x0 = coordToPixelX$1(0, coordState, canvasSize);
    if (x0 >= 0 && x0 <= canvasSize) {
      const yStart = Math.ceil(yMin / gridSpacing) * gridSpacing;

      for (let y = yStart; y <= yMax; y += gridSpacing) {
        if (y === 0) continue; // 원점 제외
        const py = coordToPixelY$1(y, coordState, canvasSize);
        ctx.beginPath();
        ctx.moveTo(x0 - renderConfig.tickSize, py);
        ctx.lineTo(x0 + renderConfig.tickSize, py);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  /**
   * 라벨 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} coordState - 좌표평면 상태
   * @param {number} canvasSize - 캔버스 크기
   * @param {Object} renderConfig - 렌더링 설정
   */
  function drawLabels(ctx, coordState, canvasSize, renderConfig) {
    ctx.save();

    ctx.fillStyle = renderConfig.labelColor;
    applyFont(ctx, renderConfig, 'axisLabel');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const { xMin, xMax, yMin, yMax } = coordState;
    const gridSpacing = renderConfig.gridSpacing || calculateGridStep(xMax - xMin);

    // X축 라벨
    const y0 = coordToPixelY$1(0, coordState, canvasSize);
    if (y0 >= 0 && y0 <= canvasSize) {
      const xStart = Math.ceil(xMin / gridSpacing) * gridSpacing;

      for (let x = xStart; x <= xMax; x += gridSpacing) {
        if (x === 0) continue; // 원점 제외
        if (x === xMin || x === xMax) continue; // 범위 경계 제외
        const px = coordToPixelX$1(x, coordState, canvasSize);
        const labelY = y0 + renderConfig.numberLabelOffsetY;
        if (labelY < canvasSize) {
          const formatted = formatNumber(x);
          ctx.fillText(formatted, px, labelY);
        }
      }
    }

    // Y축 라벨
    const x0 = coordToPixelX$1(0, coordState, canvasSize);
    if (x0 >= 0 && x0 <= canvasSize) {
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      const yStart = Math.ceil(yMin / gridSpacing) * gridSpacing;

      for (let y = yStart; y <= yMax; y += gridSpacing) {
        if (y === 0) continue; // 원점 제외
        if (y === yMin || y === yMax) continue; // 범위 경계 제외
        const py = coordToPixelY$1(y, coordState, canvasSize);
        const labelX = x0 - renderConfig.numberLabelOffsetX;
        if (labelX > 0) {
          const formatted = formatNumber(y);
          ctx.fillText(formatted, labelX, py);
        }
      }
    }

    ctx.restore();
  }

  /**
   * 캔버스 테두리 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} coordState - 좌표평면 상태
   * @param {number} canvasSize - 캔버스 크기
   */
  function drawCanvasBorder(ctx, renderConfig, canvasSize) {
    if (!renderConfig.borderEnabled) {
      return;
    }

    ctx.save();

    const borderWidth = renderConfig.borderWidth;
    const borderRadius = renderConfig.borderRadius;
    const halfBorderWidth = borderWidth / 2;

    // 테두리 스타일 설정
    ctx.strokeStyle = renderConfig.borderColor;
    ctx.lineWidth = borderWidth;

    if (renderConfig.borderStyle === 'dashed') {
      ctx.setLineDash([10, 5]);
    } else if (renderConfig.borderStyle === 'dotted') {
      ctx.setLineDash([2, 3]);
    } else {
      ctx.setLineDash([]);
    }

    // 둥근 모서리 사각형 그리기
    ctx.beginPath();
    ctx.moveTo(halfBorderWidth + borderRadius, halfBorderWidth);
    ctx.lineTo(canvasSize - halfBorderWidth - borderRadius, halfBorderWidth);
    ctx.arcTo(
      canvasSize - halfBorderWidth, halfBorderWidth,
      canvasSize - halfBorderWidth, halfBorderWidth + borderRadius,
      borderRadius
    );
    ctx.lineTo(canvasSize - halfBorderWidth, canvasSize - halfBorderWidth - borderRadius);
    ctx.arcTo(
      canvasSize - halfBorderWidth, canvasSize - halfBorderWidth,
      canvasSize - halfBorderWidth - borderRadius, canvasSize - halfBorderWidth,
      borderRadius
    );
    ctx.lineTo(halfBorderWidth + borderRadius, canvasSize - halfBorderWidth);
    ctx.arcTo(
      halfBorderWidth, canvasSize - halfBorderWidth,
      halfBorderWidth, canvasSize - halfBorderWidth - borderRadius,
      borderRadius
    );
    ctx.lineTo(halfBorderWidth, halfBorderWidth + borderRadius);
    ctx.arcTo(
      halfBorderWidth, halfBorderWidth,
      halfBorderWidth + borderRadius, halfBorderWidth,
      borderRadius
    );
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  }

  /**
   * 디버그 바운딩박스 시각화 (F1-F4 참조 사각형 + 확장 영역)
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} coordState - 좌표평면 상태
   * @param {number} canvasSize - 캔버스 크기
   * @param {Object} debugData - 디버그 데이터 (_debug 객체)
   * @param {Object} renderConfig - 렌더링 설정
   */
  function drawDebugRectangle(ctx, coordState, canvasSize, debugData, renderConfig) {
    if (!debugData) {
      return;
    }

    ctx.save();

    // 새로운 Union 모드 또는 도형 기반 모드 감지
    if (debugData.mode === 'Union' && debugData.individualAreas) {
      drawUnionDebugVisualization(ctx, coordState, canvasSize, debugData, renderConfig);
      ctx.restore();
      return;
    }

    // 도형 기반 주시영역 모드
    if (debugData.mode && debugData.mode.startsWith('Shapes')) {
      drawShapesDebugVisualization(ctx, coordState, canvasSize, debugData);
      ctx.restore();
      return;
    }

    // 기존 단일 함수 모드 (하위 호환성)
    if (!debugData.F1 || !debugData.F2 || !debugData.F3 || !debugData.F4) {
      ctx.restore();
      return;
    }

    const { F1, F2, F3, F4, V_for_symmetry, beforeExpansion, afterExpansion } = debugData;
    const baseColor = '#ff00006e';
    const expansionColor = '#0000FF6e';  // 파란색 (추가 확장 영역)
    const lineWidth = renderConfig.debugLineWidth || 2;

    // 1. 확장 후 사각형 그리기 (파란색) - 먼저 그려서 뒤에 표시
    if (afterExpansion && afterExpansion.rectangle) {
      ctx.strokeStyle = expansionColor;
      ctx.lineWidth = lineWidth;
      ctx.setLineDash([5, 5]); // 점선

      ctx.beginPath();
      const rect = afterExpansion.rectangle;
      const px0 = coordToPixelX$1(rect[0].x, coordState, canvasSize);
      const py0 = coordToPixelY$1(rect[0].y, coordState, canvasSize);
      const px1 = coordToPixelX$1(rect[1].x, coordState, canvasSize);
      const py1 = coordToPixelY$1(rect[1].y, coordState, canvasSize);
      const px2 = coordToPixelX$1(rect[2].x, coordState, canvasSize);
      const py2 = coordToPixelY$1(rect[2].y, coordState, canvasSize);
      const px3 = coordToPixelX$1(rect[3].x, coordState, canvasSize);
      const py3 = coordToPixelY$1(rect[3].y, coordState, canvasSize);

      ctx.moveTo(px0, py0);
      ctx.lineTo(px1, py1);
      ctx.lineTo(px2, py2);
      ctx.lineTo(px3, py3);
      ctx.closePath();
      ctx.stroke();

      // 확장 영역 레이블
      ctx.fillStyle = expansionColor;
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';  // 정중앙 정렬
      const centerX = (px0 + px1) / 2;
      const centerY = (py0 + py3) / 2;
      ctx.fillText('확장 영역', centerX, centerY);
    }

    // 2. 확장 전 사각형 그리기 (빨간색) - 나중에 그려서 위에 표시
    if (beforeExpansion && beforeExpansion.rectangle) {
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = lineWidth;
      ctx.setLineDash([5, 5]); // 점선

      ctx.beginPath();
      const rect = beforeExpansion.rectangle;
      const px0 = coordToPixelX$1(rect[0].x, coordState, canvasSize);
      const py0 = coordToPixelY$1(rect[0].y, coordState, canvasSize);
      const px1 = coordToPixelX$1(rect[1].x, coordState, canvasSize);
      const py1 = coordToPixelY$1(rect[1].y, coordState, canvasSize);
      const px2 = coordToPixelX$1(rect[2].x, coordState, canvasSize);
      const py2 = coordToPixelY$1(rect[2].y, coordState, canvasSize);
      const px3 = coordToPixelX$1(rect[3].x, coordState, canvasSize);
      const py3 = coordToPixelY$1(rect[3].y, coordState, canvasSize);

      ctx.moveTo(px0, py0);
      ctx.lineTo(px1, py1);
      ctx.lineTo(px2, py2);
      ctx.lineTo(px3, py3);
      ctx.closePath();
      ctx.stroke();

      // 기본 주시영역 레이블
      ctx.fillStyle = baseColor;
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';  // 정중앙 정렬
      const centerX = (px0 + px1) / 2;
      const centerY = (py0 + py3) / 2;
      ctx.fillText('주시영역', centerX, centerY);
    }

    // 3. F1, F2, F3, F4 점 그리기 (기본 색)
    ctx.setLineDash([]); // 실선
    ctx.fillStyle = baseColor;
    const pointRadius = 4;

    const f1px = coordToPixelX$1(F1.x, coordState, canvasSize);
    const f1py = coordToPixelY$1(F1.y, coordState, canvasSize);
    const f2px = coordToPixelX$1(F2.x, coordState, canvasSize);
    const f2py = coordToPixelY$1(F2.y, coordState, canvasSize);
    const f3px = coordToPixelX$1(F3.x, coordState, canvasSize);
    const f3py = coordToPixelY$1(F3.y, coordState, canvasSize);
    const f4px = coordToPixelX$1(F4.x, coordState, canvasSize);
    const f4py = coordToPixelY$1(F4.y, coordState, canvasSize);

    [
      { point: F1, label: 'F1', px: f1px, py: f1py },
      { point: F2, label: 'F2', px: f2px, py: f2py },
      { point: F3, label: 'F3', px: f3px, py: f3py },
      { point: F4, label: 'F4', px: f4px, py: f4py }
    ].forEach(({ point, label, px, py }) => {
      // 점 그리기
      ctx.beginPath();
      ctx.arc(px, py, pointRadius, 0, 2 * Math.PI);
      ctx.fill();

      // 라벨 그리기
      ctx.fillStyle = baseColor;
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${label}(${point.x.toFixed(1)}, ${point.y.toFixed(1)})`, px + 8, py - 4);
    });

    // 4. F3', F4' 점 그리기 (두 함수 모드인 경우, 녹색)
    if (debugData.F3prime && debugData.F4prime) {
      const f3pColor = '#00AA00';  // 녹색
      ctx.setLineDash([]);
      ctx.fillStyle = f3pColor;

      const f3ppx = coordToPixelX$1(debugData.F3prime.x, coordState, canvasSize);
      const f3ppy = coordToPixelY$1(debugData.F3prime.y, coordState, canvasSize);
      const f4ppx = coordToPixelX$1(debugData.F4prime.x, coordState, canvasSize);
      const f4ppy = coordToPixelY$1(debugData.F4prime.y, coordState, canvasSize);

      [
        { point: debugData.F3prime, label: "F3'", px: f3ppx, py: f3ppy },
        { point: debugData.F4prime, label: "F4'", px: f4ppx, py: f4ppy }
      ].forEach(({ point, label, px, py }) => {
        // 점 그리기
        ctx.beginPath();
        ctx.arc(px, py, pointRadius, 0, 2 * Math.PI);
        ctx.fill();

        // 라벨 그리기
        ctx.fillStyle = f3pColor;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';  // F3, F4 아래에 표시
        ctx.fillText(`${label}(${point.x.toFixed(1)}, ${point.y.toFixed(1)})`, px + 8, py + 4);
      });
    }

    // 5. V_for_symmetry (대칭 중심) 표시
    if (V_for_symmetry) {
      const vx = coordToPixelX$1(V_for_symmetry.x, coordState, canvasSize);
      const vy = coordToPixelY$1(V_for_symmetry.y, coordState, canvasSize);

      ctx.strokeStyle = baseColor;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);

      // 대칭축 (수직선 x = Vx) 그리기
      ctx.beginPath();
      ctx.moveTo(vx, 0);
      ctx.lineTo(vx, canvasSize);
      ctx.stroke();

      // V 점 그리기
      ctx.fillStyle = baseColor;
      ctx.beginPath();
      ctx.arc(vx, vy, 3, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = baseColor;
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`V(${V_for_symmetry.x.toFixed(1)}, ${V_for_symmetry.y.toFixed(1)})`, vx + 6, vy + 6);
    }

    // 6. 두 함수 모드: Vg (두 번째 함수 꼭짓점) 표시
    if (debugData.twoFunctionMode && debugData.Vg) {
      const vgColor = '#AA00AA';  // 보라색
      const vgx = coordToPixelX$1(debugData.Vg.x, coordState, canvasSize);
      const vgy = coordToPixelY$1(debugData.Vg.y, coordState, canvasSize);

      // Vg 점 그리기
      ctx.fillStyle = vgColor;
      ctx.beginPath();
      ctx.arc(vgx, vgy, 3, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = vgColor;
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`Vg(${debugData.Vg.x.toFixed(1)}, ${debugData.Vg.y.toFixed(1)})`, vgx + 6, vgy - 6);
    }

    ctx.restore();
  }

  /**
   * Union 모드 디버그 시각화
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} coordState - 좌표 상태
   * @param {number} canvasSize - 캔버스 크기
   * @param {Object} debugData - Union 모드 디버그 데이터
   * @param {Object} renderConfig - 렌더링 설정
   */
  function drawUnionDebugVisualization(ctx, coordState, canvasSize, debugData, renderConfig) {
    const lineWidth = renderConfig.debugLineWidth || 2;
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

    // 1. 개별 주시영역 그리기
    if (debugData.individualAreas) {
      debugData.individualAreas.forEach((area, idx) => {
        const color = colors[idx % colors.length];
        const { mx, Mx, my, My, debugInfo } = area;

        // 개별 주시영역 사각형
        const px1 = coordToPixelX$1(mx, coordState, canvasSize);
        const py1 = coordToPixelY$1(My, coordState, canvasSize);
        const px2 = coordToPixelX$1(Mx, coordState, canvasSize);
        const py2 = coordToPixelY$1(my, coordState, canvasSize);

        // 반투명 배경 (20% opacity)
        ctx.fillStyle = color + '33';
        ctx.fillRect(px1, py1, px2 - px1, py2 - py1);

        // 테두리 (50% opacity)
        ctx.strokeStyle = color + '80';
        ctx.lineWidth = lineWidth;
        ctx.setLineDash([5, 3]);
        ctx.strokeRect(px1, py1, px2 - px1, py2 - py1);

        // 레이블
        ctx.fillStyle = color;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`함수 ${idx + 1}`, (px1 + px2) / 2, py1 + 5);

        // F1~F4 점 그리기 (개별 함수) - 새로운 아키텍처 지원
        // area 객체에서 직접 F1-F4 추출 (focus-area/single-function.js에서 반환)
        const { F1, F2, F3, F4, V } = area;

        if (F1 && F2 && F3 && F4) {
          ctx.fillStyle = color;
          ctx.setLineDash([]);

          // F1, F2, F3, F4 점 그리기 (더 큰 원으로)
          [F1, F2, F3, F4].forEach(point => {
            if (!point) return;
            const px = coordToPixelX$1(point.x, coordState, canvasSize);
            const py = coordToPixelY$1(point.y, coordState, canvasSize);

            // 채워진 원
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, 2 * Math.PI);
            ctx.fill();

            // 라벨 (F1, F2, F3, F4)
            ctx.fillStyle = color;
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(point.label || '', px, py - 6);
          });
        }

        // 꼭짓점 V 그리기 (다른 색상으로 강조)
        if (V) {
          const px = coordToPixelX$1(V.x, coordState, canvasSize);
          const py = coordToPixelY$1(V.y, coordState, canvasSize);

          // V 점 (더 크게, 테두리 포함)
          ctx.strokeStyle = color;
          ctx.fillStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(px, py, 5, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();

          // V 라벨
          ctx.fillStyle = color;
          ctx.font = 'bold 11px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(V.label || 'V', px, py + 7);
        }
      });
    }

    // 2. Union 결과 (전체 주시영역) 그리기
    if (debugData.union) {
      const { mx, Mx, my, My } = debugData.union;

      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = lineWidth + 1;
      ctx.setLineDash([10, 5]);

      const px1 = coordToPixelX$1(mx, coordState, canvasSize);
      const py1 = coordToPixelY$1(My, coordState, canvasSize);
      const px2 = coordToPixelX$1(Mx, coordState, canvasSize);
      const py2 = coordToPixelY$1(my, coordState, canvasSize);

      ctx.strokeRect(px1, py1, px2 - px1, py2 - py1);

      // Union 레이블
      ctx.fillStyle = '#FF0000';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Union (여백 전)', (px1 + px2) / 2, (py1 + py2) / 2);
    }

    // 3. 여백 적용 후 영역 그리기
    if (debugData.afterMargin) {
      const { mx, Mx, my, My } = debugData.afterMargin;

      ctx.strokeStyle = '#0000FF';
      ctx.lineWidth = lineWidth + 1;
      ctx.setLineDash([8, 8]);

      const px1 = coordToPixelX$1(mx, coordState, canvasSize);
      const py1 = coordToPixelY$1(My, coordState, canvasSize);
      const px2 = coordToPixelX$1(Mx, coordState, canvasSize);
      const py2 = coordToPixelY$1(my, coordState, canvasSize);

      ctx.strokeRect(px1, py1, px2 - px1, py2 - py1);

      // 여백 적용 레이블
      ctx.fillStyle = '#0000FF';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('여백 적용 후', (px1 + px2) / 2, py2 - 5);
    }

    // 4. 최종 범위 (70% 규칙 적용 후) 그리기
    if (debugData.afterSquaring) {
      const { xMin, xMax, yMin, yMax } = debugData.afterSquaring;

      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = lineWidth + 2;
      ctx.setLineDash([]);

      const px1 = coordToPixelX$1(xMin, coordState, canvasSize);
      const py1 = coordToPixelY$1(yMax, coordState, canvasSize);
      const px2 = coordToPixelX$1(xMax, coordState, canvasSize);
      const py2 = coordToPixelY$1(yMin, coordState, canvasSize);

      ctx.strokeRect(px1, py1, px2 - px1, py2 - py1);

      // 최종 범위 레이블
      ctx.fillStyle = '#00FF00';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText('최종 (70% 규칙)', px2 - 5, py1 + 5);
    }

    // 5. 교점 그리기 (다중 함수)
    if (debugData.intersections && debugData.intersections.length > 0) {
      ctx.setLineDash([]);
      const intersectionColor = '#FF00FF'; // 마젠타

      debugData.intersections.forEach((intersection, idx) => {
        const px = coordToPixelX$1(intersection.x, coordState, canvasSize);
        const py = coordToPixelY$1(intersection.y, coordState, canvasSize);

        // 교점 그리기 (X 표시)
        ctx.strokeStyle = intersectionColor;
        ctx.lineWidth = 2;
        const size = 6;

        ctx.beginPath();
        ctx.moveTo(px - size, py - size);
        ctx.lineTo(px + size, py + size);
        ctx.moveTo(px + size, py - size);
        ctx.lineTo(px - size, py + size);
        ctx.stroke();

        // 교점 라벨
        ctx.fillStyle = intersectionColor;
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(
          `I${idx + 1}(${intersection.x.toFixed(1)}, ${intersection.y.toFixed(1)})`,
          px + 8,
          py - 4
        );
      });
    }

    // 6. UserPoints 시각화 (레이어에서 추출된 점들)
    if (debugData.userPoints && debugData.userPoints.length > 0) {
      ctx.setLineDash([]);
      const userPointColor = '#FFA500'; // 오렌지

      debugData.userPoints.forEach((point, idx) => {
        const px = coordToPixelX$1(point.x, coordState, canvasSize);
        const py = coordToPixelY$1(point.y, coordState, canvasSize);

        // 점 그리기 (십자가 + 원)
        ctx.strokeStyle = userPointColor;
        ctx.fillStyle = userPointColor;
        ctx.lineWidth = 2;

        // 원
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, 2 * Math.PI);
        ctx.stroke();

        // 십자가
        const size = 4;
        ctx.beginPath();
        ctx.moveTo(px - size, py);
        ctx.lineTo(px + size, py);
        ctx.moveTo(px, py - size);
        ctx.lineTo(px, py + size);
        ctx.stroke();

        // 라벨 (레이어 이름 또는 좌표)
        const label = point.layerName || `P${idx + 1}`;
        ctx.fillStyle = userPointColor;
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(label, px, py + 8);
      });
    }

    // 7. Shapes 시각화 (레이어에서 추출된 도형들)
    if (debugData.shapes && debugData.shapes.length > 0) {
      ctx.setLineDash([3, 3]);
      const shapeColors = ['#9370DB', '#20B2AA', '#FFD700']; // 보라, 청록, 금색

      debugData.shapes.forEach((shape, idx) => {
        const color = shapeColors[idx % shapeColors.length];
        ctx.strokeStyle = color;
        ctx.fillStyle = color + '20'; // 반투명
        ctx.lineWidth = 2;

        // 도형 윤곽 그리기
        if (shape.points && shape.points.length > 0) {
          ctx.beginPath();
          const firstPoint = shape.points[0];
          const px = coordToPixelX$1(firstPoint.x, coordState, canvasSize);
          const py = coordToPixelY$1(firstPoint.y, coordState, canvasSize);
          ctx.moveTo(px, py);

          for (let i = 1; i < shape.points.length; i++) {
            const point = shape.points[i];
            const px = coordToPixelX$1(point.x, coordState, canvasSize);
            const py = coordToPixelY$1(point.y, coordState, canvasSize);
            ctx.lineTo(px, py);
          }

          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // 도형 중심에 라벨
          const centerX = shape.points.reduce((sum, p) => sum + p.x, 0) / shape.points.length;
          const centerY = shape.points.reduce((sum, p) => sum + p.y, 0) / shape.points.length;
          const centerPx = coordToPixelX$1(centerX, coordState, canvasSize);
          const centerPy = coordToPixelY$1(centerY, coordState, canvasSize);

          const label = shape.layerName || `Shape${idx + 1}`;
          ctx.fillStyle = color;
          ctx.font = 'bold 11px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, centerPx, centerPy);
        }
      });
    }

    ctx.setLineDash([]);
  }

  /**
   * 도형 기반 주시영역 디버그 시각화
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} coordState - 좌표 상태
   * @param {number} canvasSize - 캔버스 크기
   * @param {Object} debugData - 디버그 데이터
   * @param {Object} renderConfig - 렌더링 설정
   */
  function drawShapesDebugVisualization(ctx, coordState, canvasSize, debugData, renderConfig) {
    const coordToPixelX = (x) => ((x - coordState.xMin) / (coordState.xMax - coordState.xMin)) * canvasSize;
    const coordToPixelY = (y) => canvasSize - ((y - coordState.yMin) / (coordState.yMax - coordState.yMin)) * canvasSize;

    // 1. Before Squaring 범위 (점선으로 표시)
    if (debugData.beforeSquaring) {
      const { mx, Mx, my, My } = debugData.beforeSquaring;

      const x1 = coordToPixelX(mx);
      const y1 = coordToPixelY(My);
      const x2 = coordToPixelX(Mx);
      const y2 = coordToPixelY(my);

      ctx.strokeStyle = '#FF8800'; // Orange
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

      // Label for before squaring
      ctx.fillStyle = '#FF8800';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`Before Square: [${mx.toFixed(1)}, ${Mx.toFixed(1)}] × [${my.toFixed(1)}, ${My.toFixed(1)}]`, x1 + 5, y1 + 5);
    }

    // 2. After Squaring 범위 (실선으로 표시)
    if (debugData.afterSquaring) {
      const { xMin, xMax, yMin, yMax } = debugData.afterSquaring;

      const x1 = coordToPixelX(xMin);
      const y1 = coordToPixelY(yMax);
      const x2 = coordToPixelX(xMax);
      const y2 = coordToPixelY(yMin);

      ctx.strokeStyle = '#0000FF'; // Blue
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

      // Label for after squaring
      ctx.fillStyle = '#0000FF';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`After Square: [${xMin.toFixed(1)}, ${xMax.toFixed(1)}] × [${yMin.toFixed(1)}, ${yMax.toFixed(1)}]`, x1 + 5, y2 - 5);
    }

    // 3. 도형 꼭짓점 그리기
    if (debugData.shapes && debugData.shapes.length > 0) {
      debugData.shapes.forEach((shape, idx) => {
        if (shape.points && shape.points.length > 0) {
          shape.points.forEach((point, pIdx) => {
            const px = coordToPixelX(point.x);
            const py = coordToPixelY(point.y);

            // Draw shape vertex as filled circle
            ctx.fillStyle = '#00AA00'; // Green
            ctx.beginPath();
            ctx.arc(px, py, 5, 0, Math.PI * 2);
            ctx.fill();

            // Vertex label
            ctx.fillStyle = '#00AA00';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(`S${idx + 1}-V${pIdx + 1}`, px, py + 7);
          });
        }
      });
    }

    // 4. 사용자 점 그리기
    if (debugData.userPoints && debugData.userPoints.length > 0) {
      debugData.userPoints.forEach((point, idx) => {
        const px = coordToPixelX(point.x);
        const py = coordToPixelY(point.y);

        // Draw user point as X mark
        ctx.strokeStyle = '#FF00FF'; // Magenta
        ctx.lineWidth = 2;
        const size = 6;

        ctx.beginPath();
        ctx.moveTo(px - size, py - size);
        ctx.lineTo(px + size, py + size);
        ctx.moveTo(px + size, py - size);
        ctx.lineTo(px - size, py + size);
        ctx.stroke();

        // Point label
        ctx.fillStyle = '#FF00FF';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`P${idx + 1}(${point.x.toFixed(1)}, ${point.y.toFixed(1)})`, px + 8, py - 4);
      });
    }

    // 5. 함수 꼭짓점 그리기 (있는 경우)
    if (debugData.functionVertices && debugData.functionVertices.length > 0) {
      debugData.functionVertices.forEach((vertex, idx) => {
        const px = coordToPixelX(vertex.x);
        const py = coordToPixelY(vertex.y);

        // Draw function vertex as triangle
        ctx.fillStyle = '#4444FF'; // Light blue
        ctx.beginPath();
        ctx.moveTo(px, py - 6);
        ctx.lineTo(px - 5, py + 4);
        ctx.lineTo(px + 5, py + 4);
        ctx.closePath();
        ctx.fill();

        // Vertex label
        ctx.fillStyle = '#4444FF';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`F${idx + 1}-V`, px, py + 7);
      });
    }

    ctx.setLineDash([]);
  }

  // ============================================================================
  // Coordinate Plane Router - 좌표평면 렌더링 라우터
  // @version 3.0.0
  // ============================================================================


  // ============================================================================
  // 내부 상태 (디버깅용)
  // ============================================================================

  // 좌표 전환 대기 중인 로그 (애니메이션 완료 시 출력)
  let pendingCoordinateLog = null;

  // 타임라인 시작 기준 시간 (첫 전환 시점)
  let timelineBaseTime = null;

  // 이전 좌표 범위 (로그 중복 방지)
  let prevCoordinateRange = null;

  // ============================================================================
  // 메인 함수
  // ============================================================================

  /**
   * 좌표평면 그리기 - 메인 진입점
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} config - 좌표평면 상태
   * @param {number} canvasSize - 캔버스 크기
   * @param {Object} options - 렌더링 옵션
   */
  function drawCoordinatePlane(ctx, config, canvasSize, options = {}) {
    // 1. 좌표 범위 검증
    if (!validateCoordinateRange(config)) {
      console.error('Invalid coordinate range in config');
      return;
    }

    // 2. 자동 좌표평면 설정
    applyAutoCoordinateSettings(config, options);

    // 3. 렌더링 설정 생성
    const planeConfig = createCoordinatePlaneConfig(config, options);

    // 4. 배경 그리기
    drawBackground(ctx, planeConfig, canvasSize);

    // 5. 테두리 패딩 계산
    const padding = config.borderEnabled ? config.borderWidth : 0;
    const contentSize = canvasSize - padding * 2;

    ctx.save();

    // 테두리 패딩만큼 이동
    if (padding > 0) {
      ctx.translate(padding, padding);
    }

    // 6. 그리드 그리기 (축보다 먼저)
    if (config.showGrid) {
      drawGrid(ctx, config, contentSize, planeConfig);
    }

    // 7. 축 그리기
    if (config.showAxes) {
      drawAxes(ctx, config, contentSize, planeConfig);
    }

    // 8. 눈금 그리기
    if (config.showTicks) {
      drawTicks(ctx, config, contentSize, planeConfig);
    }

    // 9. 라벨 그리기
    if (config.showLabels) {
      drawLabels(ctx, config, contentSize, planeConfig);
    }

    // 10. 디버그 바운딩박스 그리기 (마스터 토글로 제어)
    if (config.showDebugBoundingBox) {
      const debugData = coordinateCache.getDebugData();
      if (debugData) {
        drawDebugRectangle(ctx, config, contentSize, debugData, planeConfig);
      }
    }

    ctx.restore();

    // 11. 캔버스 테두리 그리기 (restore 후에 그려서 덮이지 않도록)
    if (config.borderEnabled) {
      drawCanvasBorder(ctx, planeConfig, canvasSize);
    }
  }

  /**
   * 자동 좌표평면 설정 적용
   *
   * 아키텍처: 레이어 시스템 기반 데이터 흐름
   * ┌─────────────────────────────────────────────────────────────┐
   * │ 1. renderer.js (render 함수)                                │
   * │    → extractFunctionsFromLayers(layers)                     │
   * │    → { functions, points, shapes } 추출                     │
   * ├─────────────────────────────────────────────────────────────┤
   * │ 2. options에 전달:                                          │
   * │    - options.functions: Function 레이어 배열                │
   * │    - options.userPoints: Point 레이어 추출 결과             │
   * │    - options.shapes: Shape 레이어 추출 결과                 │
   * ├─────────────────────────────────────────────────────────────┤
   * │ 3. 이 함수 (applyAutoCoordinateSettings):                   │
   * │    → coordinateCache.get() 캐시 조회                        │
   * │    → autoSetCoordinatePlane(functions, {userPoints, shapes})│
   * │    → 좌표 범위 계산                                         │
   * └─────────────────────────────────────────────────────────────┘
   *
   * @param {Object} config - 좌표평면 상태
   * @param {Object} options - 렌더링 옵션
   * @param {Array} options.functions - Function 레이어 배열
   * @param {Array} options.userPoints - Point 레이어 추출 결과
   * @param {Array} options.shapes - Shape 레이어 추출 결과
   */
  function applyAutoCoordinateSettings(config, options) {
    // 자동 좌표평면 설정 활성화 여부 확인
    const autoCoordinate = options.autoCoordinate !== undefined
      ? options.autoCoordinate
      : config.autoSetCoordinatePlane;

    const shouldAutoSet = autoCoordinate !== false;

    // 함수 정보가 제공되면 자동 설정 적용 (빈 배열도 기본값으로 리셋)
    if (shouldAutoSet && options.functions &&
        Array.isArray(options.functions)) {

      // ========================================================================
      // 성능 최적화: 애니메이션/시킹 진행 중 스킵
      // ========================================================================
      // 1. 좌표 전환 애니메이션이 진행 중이면 자동 설정을 스킵하여 성능 향상
      const isTransitioning = config.coordinateTransition?.enabled &&
                              config.coordinateTransition?.progress < 1;

      // 2. 타임라인 인디케이터 드래그 중에도 스킵 (렉 방지)
      const isSeekingTimeline = options.skipAutoCoordinate === true;

      if (isTransitioning || isSeekingTimeline) {
        // 애니메이션/시킹 진행 중에는 계산 스킵
        return;
      }
      // ========================================================================

      // ========================================================================
      // 레이어 추출: userPoints와 shapes 가져오기
      // ========================================================================
      // 레이어 시스템에서 추출된 데이터 사용
      // - options.userPoints: Point 레이어 → {x, y, pointType, layerId, layerName}[]
      // - options.shapes: Shape 레이어 → {type, points, layerId, layerName}[]
      const shapes = options.shapes || [];
      const userPoints = options.userPoints || [];

      // ========================================================================
      // 성능 최적화: 함수 변경 감지 및 캐싱
      // ========================================================================
      let autoCoord;
      const enableDebugVisualization = config.showDebugBoundingBox; // 마스터 토글로 제어

      // 캐시 조회 (shapes와 userPoints도 포함하여 정확한 변경 감지)
      const cached = coordinateCache.get(options.functions, enableDebugVisualization, shapes, userPoints);

      if (cached) {
        // 캐시 히트: 기존 결과 재사용
        autoCoord = cached.coord;
      } else {
        // 캐시 미스: 새로 계산
        if (enableDebugVisualization) {
          // 디버그 모드: 한 번만 계산하고 결과 분리 (중복 제거)
          const result = autoSetCoordinatePlane(options.functions, {
            showDebugBoundingBox: true,
            userPoints,
            shapes
          });
          autoCoord = {
            xMin: result.xMin,
            xMax: result.xMax,
            yMin: result.yMin,
            yMax: result.yMax
          };
          let debugData = result._debug || null;

          // 교점 계산 및 디버그 데이터에 추가 (다중 함수일 때만)
          if (debugData && options.functions && options.functions.length >= 2) {
            const intersections = calculateAllIntersections(options.functions);
            debugData.intersections = intersections;
          }

          // 레이어에서 추출된 userPoints와 shapes도 디버그 데이터에 포함
          if (debugData) {
            debugData.userPoints = userPoints;
            debugData.shapes = shapes;
          }

          // 캐시 저장 (shapes와 userPoints도 전달)
          coordinateCache.set(options.functions, autoCoord, debugData, true, shapes, userPoints);
        } else {
          // 일반 모드: 디버그 데이터 없이 계산
          autoCoord = autoSetCoordinatePlane(options.functions, {
            showDebugBoundingBox: false,
            userPoints,
            shapes
          });

          // 캐시 저장 (shapes와 userPoints도 전달)
          coordinateCache.set(options.functions, autoCoord, null, false, shapes, userPoints);
        }
      }
      // ========================================================================

      // 목표 좌표 확인 (전환 애니메이션 진행 중이면 목표 좌표와 비교)
      const targetCoord = config.coordinateTransition?.enabled
        ? config.coordinateTransition.toState
        : { xMin: config.xMin, xMax: config.xMax, yMin: config.yMin, yMax: config.yMax };

      // 목표 좌표가 실제로 변경되었는지 확인
      const hasChanged =
        targetCoord.xMin !== autoCoord.xMin ||
        targetCoord.xMax !== autoCoord.xMax ||
        targetCoord.yMin !== autoCoord.yMin ||
        targetCoord.yMax !== autoCoord.yMax;

      if (!hasChanged) return;

      // 로그 정보 저장 (애니메이션 완료 시 출력)
      const currentTime = performance.now();
      if (timelineBaseTime === null) {
        timelineBaseTime = currentTime;
      }
      const relativeTime = Math.round(currentTime - timelineBaseTime);

      pendingCoordinateLog = {
        타임라인시간: `${relativeTime}ms`,
        시작시간원본: currentTime,
        함수개수: options.functions.length,
        적용된함수: options.functions.map(f => f.value),
        시작좌표: targetCoord,
        목표좌표: autoCoord,
        전환애니메이션: config.enableCoordinateTransition
      };

      // 디버그 로그 출력 (좌표 변경 시 1회만)
      if (enableDebugVisualization) {
        const debugData = coordinateCache.getDebugData();
        if (debugData) {
          // 이전 좌표와 비교
          const currentRange = `${autoCoord.xMin},${autoCoord.xMax},${autoCoord.yMin},${autoCoord.yMax}`;
          if (prevCoordinateRange !== currentRange) {
            // 새로운 Union 기반 디버그 출력
            if (debugData.specialCase) {
              // 특수 케이스
              console.group(`[Debug-SpecialCase] ${debugData.specialCase}`);
              console.log('규칙:', debugData.rule || '특수 규칙 적용');
              console.log('최종 좌표 범위:', { xMin: autoCoord.xMin, xMax: autoCoord.xMax, yMin: autoCoord.yMin, yMax: autoCoord.yMax });
              console.groupEnd();
            } else if (debugData.mode === 'Union') {
              // Union 모드 (다중 함수)
              console.group('[Debug-Union] 다중 함수 좌표 범위 계산 완료');
              console.log('1. 모드:', 'Union (개별 주시영역 합집합)');
              console.log('2. 함수 개수:', debugData.functionCount);
              console.log('3. 개별 주시영역:');
              debugData.individualAreas.forEach((area, idx) => {
                console.log(`   함수 ${idx + 1}:`, {
                  범위: `[${area.mx.toFixed(2)}, ${area.Mx.toFixed(2)}] × [${area.my.toFixed(2)}, ${area.My.toFixed(2)}]`,
                  ...area.debugInfo
                });
              });
              console.log('4. Union 결과:', debugData.union);
              console.log('5. 여백 추가:', debugData.margin);
              console.log('6. 여백 적용 후:', debugData.afterMargin);
              console.log('7. 70% 규칙:', debugData.rule70percent);
              console.log('8. 정사각형 조정 후:', debugData.afterSquaring);
              console.log('9. 최종 좌표 범위:', { xMin: autoCoord.xMin, xMax: autoCoord.xMax, yMin: autoCoord.yMin, yMax: autoCoord.yMax });
              console.groupEnd();
            } else {
              // 기본 출력 (디버그 데이터가 부족한 경우)
              console.group('[Debug-AutoCoordinate] 좌표 범위 계산 완료');
              console.log('최종 좌표 범위:', { xMin: autoCoord.xMin, xMax: autoCoord.xMax, yMin: autoCoord.yMin, yMax: autoCoord.yMax });
              if (debugData) {
                console.log('디버그 데이터:', debugData);
              }
              console.groupEnd();
            }

            prevCoordinateRange = currentRange;
          }
        }
      }

      // 전환 애니메이션이 활성화되어 있으면 애니메이션 사용
      if (config.enableCoordinateTransition) {
        startCoordinateTransition(config, autoCoord, {
          duration: config.coordinateTransitionDuration,
          easing: config.coordinateTransitionEasing,
          onComplete: () => {
            // 애니메이션 완료 시 로그 출력
            if (pendingCoordinateLog) {
              const duration = performance.now() - pendingCoordinateLog.시작시간원본;
              const { 시작시간원본, ...logData } = pendingCoordinateLog;
              console.log('[Timeline-Coordinate] 좌표 전환 완료:', {
                ...logData,
                최종좌표: { xMin: config.xMin, xMax: config.xMax, yMin: config.yMin, yMax: config.yMax },
                소요시간: `${Math.round(duration)}ms`
              });
              pendingCoordinateLog = null;
            }
          }
        });
      } else {
        // 즉시 업데이트 (하위 호환성)
        Object.assign(config, {
          xMin: autoCoord.xMin,
          xMax: autoCoord.xMax,
          yMin: autoCoord.yMin,
          yMax: autoCoord.yMax
        });

        // 즉시 업데이트 시 바로 로그 출력
        if (pendingCoordinateLog) {
          const { 시작시간원본, ...logData } = pendingCoordinateLog;
          console.log('[Timeline-Coordinate] 좌표 즉시 업데이트:', {
            ...logData,
            최종좌표: { xMin: config.xMin, xMax: config.xMax, yMin: config.yMin, yMax: config.yMax }
          });
          pendingCoordinateLog = null;
        }
      }
    }
  }

  // ============================================================================
  // Function DTO - 함수 스타일 설정
  // @version 3.0.0
  // ============================================================================


  /**
   * 함수 스타일 설정 생성
   * @param {Object} data - 함수 데이터
   * @returns {Object} 스타일 설정
   */
  function createFunctionStyle(data) {
    const {
      color: rawColor,
      lineWidth: rawLineWidth
    } = data;

    const styleConfig = createStyleConfig();

    return {
      color: rawColor && rawColor !== '#'
        ? rawColor
        : styleConfig.defaultColors.function,
      lineWidth: rawLineWidth && rawLineWidth > 0
        ? rawLineWidth
        : styleConfig.function.lineWidth
    };
  }

  // ============================================================================
  // Function Utils - 함수 유틸리티
  // @version 3.0.0
  // ============================================================================

  /**
   * 함수 데이터 검증
   * @param {Array} value - 함수 계수 [a, b, c]
   * @returns {boolean} 유효성 여부
   */
  function validateFunctionData(value) {
    if (!value || value.length < 3) {
      console.warn('Invalid function data:', value);
      return false;
    }
    return true;
  }

  /**
   * 평행이동 적용된 계수 계산
   * @param {Array} value - 원본 계수 [a, b, c]
   * @param {Object} data - 레이어 데이터
   * @returns {Array} 평행이동 적용된 계수 [a, b, c]
   */
  function applyFunctionShift(value, data) {
    const [a, b, c] = value;

    // 평행이동이 없으면 원본 반환
    if (!data._shifted) {
      return [a, b, c];
    }

    const shift = data._shiftValue || 0;
    const direction = data._shiftDirection || 'y';

    let actualA = a, actualB = b, actualC = c;

    if (direction === 'y') {
      // y 방향 평행이동: y = ax^2 + bx + (c + shift)
      actualC = c + shift;
    } else if (direction === 'x') {
      // x 방향 평행이동: y = a(x - shift)^2 + b(x - shift) + c
      actualB = b - 2 * a * shift;
      actualC = a * shift * shift - b * shift + c;
    }

    return [actualA, actualB, actualC];
  }

  // ============================================================================
  // Function Renderer - 함수 렌더링 렌더러
  // @version 3.0.0
  // ============================================================================


  /**
   * 이차함수 렌더링
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Array} coefficients - 계수 [a, b, c]
   * @param {Object} config - 상태
   * @param {number} canvasSize - 캔버스 크기
   */
  function renderQuadraticFunction(ctx, coefficients, config, canvasSize) {
    const [a, b, c] = coefficients;
    const { xMin, xMax } = config;
    const step = (xMax - xMin) / 500; // 500개 점으로 샘플링

    ctx.beginPath();
    let isFirst = true;

    for (let x = xMin; x <= xMax; x += step) {
      const y = a * x * x + b * x + c;
      const px = coordToPixelX$1(x, config, canvasSize);
      const py = coordToPixelY$1(y, config, canvasSize);

      if (isFirst) {
        ctx.moveTo(px, py);
        isFirst = false;
      } else {
        ctx.lineTo(px, py);
      }
    }

    ctx.stroke();
  }

  // ============================================================================
  // Function Router - 함수 렌더링 라우터
  // @version 3.0.0
  // ============================================================================


  /**
   * 함수 렌더링 - 메인 진입점
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} layer - 레이어 객체
   * @param {Object} config - 좌표평면 상태
   * @param {number} canvasSize - 캔버스 크기
   * @param {number} progress - 애니메이션 진행도 (0~1) - 현재 미사용
   */
  function drawFunction(ctx, layer, config, canvasSize, progress) {
    const { value } = layer.data;

    // 1. 데이터 검증
    if (!validateFunctionData(value)) {
      return;
    }

    // 2. 평행이동 적용
    const coefficients = applyFunctionShift(value, layer.data);

    // 3. 스타일 설정 생성
    const style = createFunctionStyle(layer.data);

    // 4. 캔버스 스타일 적용
    ctx.save();
    applyColorOrGradient(ctx, style.color, config, canvasSize, 'stroke');
    ctx.lineWidth = style.lineWidth;

    // 5. 함수 렌더링
    renderQuadraticFunction(ctx, coefficients, config, canvasSize);

    ctx.restore();
  }

  // ============================================================================
  // Integral DTO - 적분 스타일 설정
  // @version 3.0.0
  // ============================================================================


  /**
   * 적분 영역 스타일 설정 생성
   * @param {Object} data - 적분 데이터
   * @returns {Object} 스타일 설정
   */
  function createIntegralStyle(data) {
    const {
      fillColor: rawFillColor,
      strokeColor: rawStrokeColor,
      strokeWidth: rawStrokeWidth
    } = data;

    const styleConfig = createStyleConfig();

    return {
      fillColor: rawFillColor && rawFillColor !== '#'
        ? rawFillColor
        : styleConfig.defaultColors.shapeArea,
      strokeColor: rawStrokeColor && rawStrokeColor !== '#'
        ? rawStrokeColor
        : styleConfig.defaultColors.shapeStoke,
      strokeWidth: rawStrokeWidth && rawStrokeWidth >= 0
        ? rawStrokeWidth
        : 0
    };
  }

  // ============================================================================
  // Integral Utils - 적분 유틸리티 함수
  // @version 3.0.0
  // ============================================================================

  /**
   * 적분 데이터 검증
   * @param {Object} func - 함수 정의
   * @returns {boolean} 유효성 여부
   */
  function validateIntegralData(func) {
    if (!func || !func.value) {
      console.warn('Invalid integral data');
      return false;
    }
    return true;
  }

  /**
   * 함수 정의 정규화
   * @param {Object} funcDef - 함수 정의
   * @returns {Object} 정규화된 함수 정의 {type, a, b, c}
   */
  function normalizeFunctionDef(funcDef) {
    // 명시적 type이 있으면 우선 적용
    if (funcDef.type === 'linear') {
      if (Array.isArray(funcDef.value)) {
        if (funcDef.value.length === 2) {
          return { type: 'linear', a: 0, b: funcDef.value[0] || 0, c: funcDef.value[1] || 0 };
        }
        return { type: 'linear', a: 0, b: funcDef.value[1] || 0, c: funcDef.value[2] || 0 };
      }
      return { type: 'linear', a: 0, b: funcDef.b || 0, c: funcDef.c || 0 };
    }

    if (funcDef.type === 'quadratic') {
      if (Array.isArray(funcDef.value) && funcDef.value.length === 3) {
        return { type: 'quadratic', a: funcDef.value[0] || 0, b: funcDef.value[1] || 0, c: funcDef.value[2] || 0 };
      }
      return { type: 'quadratic', a: funcDef.a || 0, b: funcDef.b || 0, c: funcDef.c || 0 };
    }

    // type이 없고 value만 있는 구버전 처리
    if (Array.isArray(funcDef.value)) {
      const v = funcDef.value;
      if (v.length === 2) {
        return { type: 'linear', a: 0, b: v[0] || 0, c: v[1] || 0 };
      }
      if (v.length === 3) {
        if ((v[0] || 0) === 0) {
          return { type: 'linear', a: 0, b: v[1] || 0, c: v[2] || 0 };
        }
        return { type: 'quadratic', a: v[0] || 0, b: v[1] || 0, c: v[2] || 0 };
      }
    }

    return { type: 'quadratic', a: 0, b: 0, c: 0 };
  }

  /**
   * 평행이동 적용
   * @param {Object} func - 함수 정의
   * @param {number} shift - 평행이동 거리
   * @param {string} direction - 방향 ('x' or 'y')
   * @returns {Object} 평행이동 적용된 함수
   */
  function applyShift(func, shift, direction) {
    if (shift === 0) return func;

    const { a, b, c } = func;

    if (direction === 'x') {
      return {
        ...func,
        b: (-2 * a * shift) + b,
        c: (a * shift * shift) - (b * shift) + c
      };
    } else if (direction === 'y') {
      return {
        ...func,
        c: c + shift
      };
    }

    return func;
  }

  /**
   * 함수 y값 계산
   * @param {Object} func - 함수 정의
   * @param {number} x - X 좌표
   * @returns {number} Y 값
   */
  function evalFuncY(func, x) {
    if (func.type === 'linear') {
      return (func.a || 0) * x + (func.b || 0);
    } else if (func.type === 'quadratic') {
      return (func.a || 0) * x * x + (func.b || 0) * x + (func.c || 0);
    }
    return 0;
  }

  /**
   * y값에서 x값 계산 (역함수)
   * @param {Object} func - 함수 정의
   * @param {number} y - Y 좌표
   * @param {string} side - 'left' or 'right'
   * @returns {number} X 값
   */
  function getXFromY(func, y, side = 'left') {
    const a = func.a || 0;
    const b = func.b || 0;
    const c = func.c || 0;

    // 선형
    if (func.type === 'linear' || a === 0) {
      if (b === 0) return 0;
      return (y - c) / b;
    }

    // 이차
    const discriminant = b * b - 4 * a * (c - y);
    if (discriminant < 0) return 0;

    const sqrtD = Math.sqrt(discriminant);
    const x1 = (-b + sqrtD) / (2 * a);
    const x2 = (-b - sqrtD) / (2 * a);

    return side === 'left' ? Math.min(x1, x2) : Math.max(x1, x2);
  }

  /**
   * l1/l2 기반으로 polygon 계산
   * @param {Object} funcDef - 함수 정의
   * @param {string} direction - 방향 ('x' or 'y')
   * @param {number} shift - 평행이동 거리
   * @param {Object} l1 - 시작 점
   * @param {Object} l2 - 끝 점
   * @returns {Array} polygon 배열
   */
  function calculatePolygonFromL1L2(funcDef, direction, shift, l1, l2) {
    const polygon = [];
    const steps = 50;

    const func = normalizeFunctionDef(funcDef);

    if (direction === 'x') {
      calculateXDirectionPolygon(polygon, func, shift, l1, l2, steps);
    } else if (direction === 'y') {
      calculateYDirectionPolygon(polygon, func, shift, l1, l2, steps);
    }

    return polygon;
  }

  /**
   * x 방향 polygon 계산
   */
  function calculateXDirectionPolygon(polygon, func, shift, l1, l2, steps) {
    // l1, l2가 숫자인지 객체인지 판단
    const y1 = typeof l1 === 'number' ? l1 : l1.y;
    const y2 = typeof l2 === 'number' ? l2 : l2.y;
    const yMin = Math.min(y1, y2);
    const yMax = Math.max(y1, y2);
    const dy = (yMax - yMin) / steps;

    if (shift !== 0 && shift !== undefined && shift !== null) {
      const shiftedFunc = applyShift(func, shift, 'x');

      // 왼쪽 곡선 (원본 함수)
      for (let i = 0; i <= steps; i++) {
        const y = yMin + i * dy;
        const x = getXFromY(func, y, 'left');
        if (!isNaN(x) && isFinite(x)) {
          polygon.push({ x, y });
        }
      }

      // 오른쪽 곡선 (평행이동된 함수) - 역순
      for (let i = steps; i >= 0; i--) {
        const y = yMin + i * dy;
        const x = getXFromY(shiftedFunc, y, 'left');
        if (!isNaN(x) && isFinite(x)) {
          polygon.push({ x, y });
        }
      }
    } else {
      // 왼쪽 곡선 (함수 곡선)
      for (let i = 0; i <= steps; i++) {
        const y = yMin + i * dy;
        const x = getXFromY(func, y, 'left');
        if (!isNaN(x) && isFinite(x)) {
          polygon.push({ x, y });
        }
      }

      // 오른쪽 곡선 (y축: x = 0) - 역순
      for (let i = steps; i >= 0; i--) {
        const y = yMin + i * dy;
        polygon.push({ x: 0, y });
      }
    }
  }

  /**
   * y 방향 polygon 계산
   */
  function calculateYDirectionPolygon(polygon, func, shift, l1, l2, steps) {
    // l1, l2가 숫자인지 객체인지 판단
    const x1 = typeof l1 === 'number' ? l1 : l1.x;
    const x2 = typeof l2 === 'number' ? l2 : l2.x;
    const xMin = Math.min(x1, x2);
    const xMax = Math.max(x1, x2);
    const dx = (xMax - xMin) / steps;

    if (shift !== 0 && shift !== undefined && shift !== null) {
      const shiftedFunc = applyShift(func, shift, 'y');

      // 하단 곡선 (원본 함수)
      for (let i = 0; i <= steps; i++) {
        const x = xMin + i * dx;
        const y = evalFuncY(func, x);
        if (!isNaN(y) && isFinite(y)) {
          polygon.push({ x, y });
        }
      }

      // 상단 곡선 (평행이동된 함수) - 역순
      for (let i = steps; i >= 0; i--) {
        const x = xMin + i * dx;
        const y = evalFuncY(shiftedFunc, x);
        if (!isNaN(y) && isFinite(y)) {
          polygon.push({ x, y });
        }
      }
    } else {
      // 하단 곡선 (함수 곡선)
      for (let i = 0; i <= steps; i++) {
        const x = xMin + i * dx;
        const y = evalFuncY(func, x);
        if (!isNaN(y) && isFinite(y)) {
          polygon.push({ x, y });
        }
      }

      // 상단 직선 (x축: y = 0) - 역순
      for (let i = steps; i >= 0; i--) {
        const x = xMin + i * dx;
        polygon.push({ x, y: 0 });
      }
    }
  }

  // ============================================================================
  // Integral Renderer - 적분 영역 렌더링 렌더러
  // @version 3.0.0
  // ============================================================================


  /**
   * 적분 영역 (polygon) 렌더링
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Array} pixelPoints - 픽셀 좌표 배열
   * @param {Object} style - 스타일 설정
   * @param {Object} bounds - 바운드 {minX, minY, maxX, maxY}
   * @param {Object} config - 상태
   * @param {number} canvasSize - 캔버스 크기
   */
  function renderIntegralPolygon(ctx, pixelPoints, style, bounds, config, canvasSize) {
    ctx.beginPath();
    pixelPoints.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.closePath();

    // Fill
    if (style.fillColor) {
      applyColorOrGradient(ctx, style.fillColor, config, canvasSize, 'fill', bounds);
      ctx.fill();
    }

    // Stroke
    if (style.strokeColor && style.strokeWidth > 0) {
      applyColorOrGradient(ctx, style.strokeColor, config, canvasSize, 'stroke', bounds);
      ctx.lineWidth = style.strokeWidth;
      ctx.stroke();
    }
  }

  // ============================================================================
  // Integral Router - 적분 영역 렌더링 라우터
  // @version 3.0.0
  // ============================================================================


  /**
   * 적분 영역 렌더링 - 메인 진입점
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} data - 적분 데이터
   * @param {Object} config - 좌표평면 상태
   * @param {number} canvasSize - 캔버스 크기
   */
  function drawIntegral(ctx, data, config, canvasSize) {
    const { direction, shift, l1, l2, func } = data;

    // 1. 데이터 검증
    if (!validateIntegralData(func)) {
      return;
    }

    // 2. polygon 계산
    const polygon = calculatePolygonFromL1L2(func, direction, shift, l1, l2);

    if (!polygon || polygon.length === 0) {
      console.warn('Failed to calculate polygon');
      return;
    }

    // 3. 픽셀 좌표로 변환 및 바운드 계산
    const pixelPoints = polygon.map(point => ({
      x: coordToPixelX$1(point.x, config, canvasSize),
      y: coordToPixelY$1(point.y, config, canvasSize)
    }));

    const bounds = {
      minX: Math.min(...pixelPoints.map(p => p.x)),
      minY: Math.min(...pixelPoints.map(p => p.y)),
      maxX: Math.max(...pixelPoints.map(p => p.x)),
      maxY: Math.max(...pixelPoints.map(p => p.y))
    };

    // 4. 스타일 설정 생성
    const style = createIntegralStyle(data);

    // 5. 적분 영역 렌더링
    renderIntegralPolygon(ctx, pixelPoints, style, bounds, config, canvasSize);
  }

  // ============================================================================
  // Label DTO - 라벨 스타일 설정
  // @version 4.0.0
  // ============================================================================

  /**
   * 라벨 기본 스타일
   */
  const DEFAULT_LABEL_STYLE = {
    fontSize: 18,               // config.js의 equationLabelStyle과 동일
    fontFamily: 'KaTeX_Math',
    color: 'auto',              // 'auto'이면 레이어 색상 자동 적용
    backgroundColor: 'transparent',
    offsetFromCurve: 50,        // config.js의 equationLabelStyle과 동일
    padding: 4,
    showDot: false,             // config.js의 equationLabelStyle과 동일 (기본: 점 숨김)
    align: 'right',             // 오른쪽 정렬 (80% 위치에 맞춤)
    maxAttempts: 10             // 충돌 회피 최대 시도 횟수
  };

  /**
   * 라벨 스타일 생성
   * @param {Object} data - 레이어 데이터
   * @param {Object} coordConfig - 좌표 설정
   * @returns {Object} 라벨 스타일 객체
   */
  function createLabelStyle(data, coordConfig) {
    const globalStyle = coordConfig.equationLabelStyle || {};

    return {
      ...DEFAULT_LABEL_STYLE,
      ...globalStyle,
      ...data.style,
      // 개별 속성 우선순위: data > global > default
      fontSize: data.fontSize ?? globalStyle.fontSize ?? DEFAULT_LABEL_STYLE.fontSize,
      fontFamily: data.fontFamily ?? globalStyle.fontFamily ?? DEFAULT_LABEL_STYLE.fontFamily,
      color: data.color ?? globalStyle.color ?? DEFAULT_LABEL_STYLE.color,
      backgroundColor: data.backgroundColor ?? globalStyle.backgroundColor ?? DEFAULT_LABEL_STYLE.backgroundColor,
      offsetFromCurve: data.offsetFromCurve ?? globalStyle.offsetFromCurve ?? DEFAULT_LABEL_STYLE.offsetFromCurve,
      padding: data.padding ?? globalStyle.padding ?? DEFAULT_LABEL_STYLE.padding,
      showDot: data.showDot ?? globalStyle.showDot ?? DEFAULT_LABEL_STYLE.showDot,
      align: data.align ?? globalStyle.align ?? DEFAULT_LABEL_STYLE.align,
      maxAttempts: data.maxAttempts ?? globalStyle.maxAttempts ?? DEFAULT_LABEL_STYLE.maxAttempts
    };
  }

  // ============================================================================
  // Label Utils - 라벨 유틸리티 함수
  // @version 4.0.0
  // ============================================================================

  /**
   * 레이어에서 색상 추출
   * @param {Object} layer - 레이어 객체
   * @returns {string} 색상 값
   */
  function extractLayerColor$1(layer) {
    if (!layer || !layer.data) return '#666666';

    const data = layer.data;

    // 1. data.color 직접 확인
    if (data.color) return data.color;

    // 2. gradient 확인
    if (data.gradient) return data.gradient;

    // 3. fillColor 확인
    if (data.fillColor) return data.fillColor;

    // 4. strokeColor 확인
    if (data.strokeColor) return data.strokeColor;

    return '#666666';
  }

  /**
   * 수학 좌표계 x를 캔버스 픽셀 x로 변환
   */
  function coordToPixelX(x, config, canvasSize) {
    const { xMin, xMax } = config;
    return ((x - xMin) / (xMax - xMin)) * canvasSize;
  }

  /**
   * 수학 좌표계 y를 캔버스 픽셀 y로 변환
   */
  function coordToPixelY(y, config, canvasSize) {
    const { yMin, yMax } = config;
    return canvasSize - ((y - yMin) / (yMax - yMin)) * canvasSize;
  }

  /**
   * 함수 레이어의 최적 라벨 위치 계산 (픽셀 좌표 반환)
   * draw-equation-label.js의 로직을 그대로 사용
   * @param {Object} layer - 레이어 객체 (함수 계수 포함)
   * @param {Object} config - 좌표 설정
   * @param {number} canvasSize - 캔버스 크기
   * @param {Object} style - 라벨 스타일
   * @returns {Object} 픽셀 좌표 {x, y, align}
   */
  function calculateOptimalLabelPosition(layer, config, canvasSize, style) {
    const value = layer.data._value || layer.data.value; // _value 우선, 없으면 value 사용 (하위 호환성)
    if (!value || !Array.isArray(value)) return null;

    // 실제 텍스트 가져오기 (바운딩 박스 계산용)
    const text = layer.data.text || '';

    // 계수 추출
    let a = 0, b = 0, c = 0;
    if (value.length === 2) {
      // 일차함수: [m, n] → y = mx + n
      [b, c] = value;
    } else if (value.length === 3) {
      [a, b, c] = value;
    }

    // 이차함수: 꼭짓점 기준
    if (a !== 0) {
      return calculateQuadraticLabelPosition(a, b, c, config, canvasSize, style, text);
    }

    // 일차함수: 중앙 기준
    return calculateLinearLabelPosition(b, c, config, canvasSize, style);
  }

  /**
   * 이차함수 라벨 위치 계산 (픽셀 좌표 반환)
   */
  function calculateQuadraticLabelPosition(a, b, c, config, canvasSize, style, text) {
    // NaN 체크 - 좌표 전환 중이거나 잘못된 config는 null 반환
    if (!isFinite(config.xMin) || !isFinite(config.xMax) || !isFinite(config.yMin) || !isFinite(config.yMax)) {
      return null;
    }

    // 교과서 스타일: 그래프 오른쪽 끝 80% 지점에 라벨 표시 (좌표 전환 시 부드러운 이동)
    const rangeX = config.xMax - config.xMin;
    let labelX = config.xMin + rangeX * 0.8; // 오른쪽 80% 지점
    let labelYCoord = a * labelX * labelX + b * labelX + c; // 수학 좌표 Y값

    // Y값이 화면 범위를 벗어나면 X를 조정하여 화면 내 함수 위의 점 찾기
    if (labelYCoord < config.yMin || labelYCoord > config.yMax) {
      // 비율 기반 탐색 (좌표 전환 시 부드러운 이동)
      const rangeX = config.xMax - config.xMin;

      // 오른쪽 80%에서 20%까지 탐색 (안쪽으로 더 넓게)
      for (let ratio = 0.8; ratio >= 0.2; ratio -= 0.05) {
        const testX = config.xMin + rangeX * ratio;
        const testY = a * testX * testX + b * testX + c;

        if (testY >= config.yMin && testY <= config.yMax) {
          labelX = testX;
          labelYCoord = testY;
          break;
        }
      }

      // 여전히 못 찾으면 왼쪽도 탐색
      if (labelYCoord < config.yMin || labelYCoord > config.yMax) {
        for (let ratio = 0.2; ratio >= 0.0; ratio -= 0.05) {
          const testX = config.xMin + rangeX * ratio;
          const testY = a * testX * testX + b * testX + c;

          if (testY >= config.yMin && testY <= config.yMax) {
            labelX = testX;
            labelYCoord = testY;
            break;
          }
        }
      }
    }

    // 픽셀 좌표 변환
    const px = coordToPixelX(labelX, config, canvasSize);
    const dotY = coordToPixelY(labelYCoord, config, canvasSize); // 점의 Y 위치 (함수 곡선 위)

    // 아래로 볼록(a > 0)이면 위쪽에 라벨, 위로 볼록(a < 0)이면 아래쪽에 라벨
    const offsetY = a > 0 ? -style.offsetFromCurve : style.offsetFromCurve;
    let labelY = dotY + offsetY; // 라벨의 Y 픽셀 위치 (점에서 offset만큼 떨어짐)

    // 라벨이 캔버스 밖으로 나가지 않도록 제한 (Y축만)
    const labelHeight = style.fontSize + 10; // 대략적인 라벨 높이
    if (labelY < labelHeight) labelY = labelHeight;
    if (labelY > canvasSize - labelHeight) labelY = canvasSize - labelHeight;

    // 라벨 텍스트가 캔버스 오른쪽 경계를 벗어나는지 체크
    const labelGap = 20;
    // 실제 텍스트 너비 계산 (Canvas 없이 추정)
    // 평균적으로 fontSize * 0.6 per character (수학 폰트 기준)
    const estimatedTextWidth = text ? text.length * style.fontSize * 0.6 : style.fontSize * 5;
    const textRightEdge = px + labelGap + estimatedTextWidth;

    let align = 'right'; // 기본: 점 오른쪽에 라벨
    let isFlipped = false;

    if (textRightEdge > canvasSize - 10) {
      // 오른쪽 경계를 벗어나면 점 왼쪽에 라벨 배치
      // align: 'left' + isFlipped: false → 점 왼쪽에 라벨 (label.renderer.js 99-100번 줄)
      align = 'left';
      isFlipped = false;
    }

    return {
      x: px,      // 점 위치 X (함수 곡선 위)
      y: labelY,  // 라벨 텍스트 Y (offset 적용)
      dotY: dotY, // 점 위치 Y (함수 곡선 위, offset 적용 전)
      align: align,
      isFlipped: isFlipped,
      baseline: a > 0 ? 'bottom' : 'top'
    };
  }

  /**
   * 일차함수 라벨 위치 계산 (픽셀 좌표 반환)
   */
  function calculateLinearLabelPosition(b, c, config, canvasSize, style, text) {
    // NaN 체크 - 좌표 전환 중이거나 잘못된 config는 null 반환
    if (!isFinite(config.xMin) || !isFinite(config.xMax) || !isFinite(config.yMin) || !isFinite(config.yMax)) {
      return null;
    }

    // 중앙 x 좌표
    const centerX = (config.xMin + config.xMax) / 2;

    // 중앙에서의 y 값
    const centerY = b * centerX + c;

    // 픽셀 좌표 변환
    const px = coordToPixelX(centerX, config, canvasSize);
    const dotY = coordToPixelY(centerY, config, canvasSize); // 점의 Y 위치 (함수 곡선 위)

    // 기울기에 따라 라벨 위치 조정
    const offsetY = b >= 0 ? -style.offsetFromCurve : style.offsetFromCurve;
    let labelY = dotY + offsetY; // 라벨의 Y 위치 (점에서 offset만큼 떨어짐)

    // Y축 제한만 적용
    const labelHeight = style.fontSize + 10;
    if (labelY < labelHeight) labelY = labelHeight;
    if (labelY > canvasSize - labelHeight) labelY = canvasSize - labelHeight;

    return {
      x: px,      // 점 위치 X (함수 곡선 위)
      y: labelY,  // 라벨 텍스트 Y (offset 적용)
      dotY: dotY, // 점 위치 Y (함수 곡선 위, offset 적용 전)
      align: 'center',
      baseline: b >= 0 ? 'bottom' : 'top'
    };
  }

  /**
   * 두 사각형이 겹치는지 확인 (AABB Collision Detection)
   * @param {Object} box1 - {x, y, width, height}
   * @param {Object} box2 - {x, y, width, height}
   * @param {number} padding - 여백 (픽셀)
   * @returns {boolean} 겹치면 true
   */
  function isBoxOverlapping(box1, box2, padding = 5) {
    return !(
      box1.x + box1.width + padding < box2.x ||
      box2.x + box2.width + padding < box1.x ||
      box1.y + box1.height + padding < box2.y ||
      box2.y + box2.height + padding < box1.y
    );
  }

  /**
   * 라벨 위치의 바운딩 박스 계산
   * @param {Object} position - {x, y, align}
   * @param {number} textWidth - 텍스트 너비
   * @param {number} textHeight - 텍스트 높이
   * @param {boolean} isFlipped - 위치 반전 여부
   * @returns {Object} {x, y, width, height}
   */
  function getLabelBoundingBox(position, textWidth, textHeight, isFlipped) {
    const labelGap = 20;
    const padding = 4;

    let textX;
    if (position.align === 'left') {
      if (isFlipped) {
        // 반전: 점 오른쪽에 텍스트
        textX = position.x + labelGap;
      } else {
        // 기본: 점 왼쪽에 텍스트
        textX = position.x - labelGap - textWidth;
      }
    } else if (position.align === 'center') {
      textX = position.x - textWidth / 2;
    } else if (position.align === 'right') {
      // 오른쪽 정렬: 점 오른쪽에 텍스트
      textX = position.x + labelGap;
    }

    return {
      x: textX - padding,
      y: position.y - textHeight / 2 - padding,
      width: textWidth + padding * 2,
      height: textHeight + padding * 2
    };
  }

  /**
   * 화면 밖으로 짤리는지 확인
   * @param {Object} position - {x, y, align}
   * @param {number} textWidth - 텍스트 너비
   * @param {number} canvasWidth - 캔버스 너비
   * @returns {boolean} 짤리면 true
   */
  function isClippedOffScreen(position, textWidth, canvasWidth) {
    const labelGap = 20;
    const minPadding = 10;

    if (position.align === 'left') {
      const textX = position.x - labelGap - textWidth;
      return textX < minPadding;
    }

    return false;
  }

  /**
   * 수학 폰트 규칙을 적용한 텍스트 너비 측정
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {string} text - 측정할 텍스트
   * @param {number} fontSize - 폰트 크기
   * @returns {number} 텍스트 너비 (픽셀)
   */
  function measureTextWidthWithMathFont$1(ctx, text, fontSize) {
    // 마이너스 기호 변환
    text = text.replace(/-/g, '−');
    // 상첨자 앞에 공백 추가
    text = text.replace(/([^\s⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿ])([⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿ])/g, '$1 $2');

    let totalWidth = 0;
    let i = 0;

    while (i < text.length) {
      const char = text[i];

      // 소문자 알파벳: Italic KaTeX_Math
      if (/[a-z]/.test(char)) {
        let alphabetGroup = '';
        while (i < text.length && /[a-z]/.test(text[i])) {
          alphabetGroup += text[i];
          i++;
        }
        ctx.font = `italic ${fontSize}px "KaTeX_Math", "Times New Roman", serif`;
        totalWidth += ctx.measureText(alphabetGroup).width;
      } else {
        // 나머지: Regular KaTeX_Main
        ctx.font = `normal ${fontSize}px "KaTeX_Main", "Times New Roman", serif`;
        totalWidth += ctx.measureText(char).width;
        i++;
      }
    }

    return totalWidth;
  }

  /**
   * 수학 폰트 규칙을 적용한 텍스트 렌더링
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {string} text - 그릴 텍스트
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   * @param {number} fontSize - 폰트 크기
   */
  function drawTextWithMathFont$1(ctx, text, x, y, fontSize) {
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // 마이너스 기호 변환
    text = text.replace(/-/g, '−');
    // 상첨자 앞에 공백 추가
    text = text.replace(/([^\s⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿ])([⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿ])/g, '$1 $2');

    let currentX = x;
    let i = 0;

    while (i < text.length) {
      const char = text[i];

      // 소문자 알파벳: Italic KaTeX_Math
      if (/[a-z]/.test(char)) {
        let alphabetGroup = '';
        while (i < text.length && /[a-z]/.test(text[i])) {
          alphabetGroup += text[i];
          i++;
        }
        ctx.font = `italic ${fontSize}px "KaTeX_Math", "Times New Roman", serif`;
        ctx.fillText(alphabetGroup, currentX, y);
        currentX += ctx.measureText(alphabetGroup).width;
      } else {
        // 나머지: Regular KaTeX_Main
        ctx.font = `normal ${fontSize}px "KaTeX_Main", "Times New Roman", serif`;
        ctx.fillText(char, currentX, y);
        currentX += ctx.measureText(char).width;
        i++;
      }
    }
  }

  // ============================================================================
  // Label Renderer - 라벨 렌더링 로직
  // @version 4.0.0
  // ============================================================================


  /**
   * 그라디언트 문자열을 Canvas 그라디언트 객체로 변환
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {string} colorOrGradient - 색상 또는 그라디언트 문자열
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   * @param {number} width - 너비
   * @returns {string|CanvasGradient} Canvas에 적용 가능한 색상
   */
  function applyColorForText$1(ctx, colorOrGradient, x, y, width) {
    if (colorOrGradient && colorOrGradient.includes('gradient')) {
      // NaN이나 Infinity 체크 - 잘못된 좌표는 그라디언트 대신 기본 색상 사용
      if (!isFinite(x) || !isFinite(y) || !isFinite(width)) {
        console.warn('[Label Gradient] Invalid coordinates, using solid color:', { x, y, width });
        // 그라디언트를 파싱해서 첫 번째 색상 추출
        const colorMatch = colorOrGradient.match(/#[0-9A-Fa-f]{6}|rgba?\([^)]+\)/);
        return colorMatch ? colorMatch[0] : '#000000';
      }

      const gradient = createGradient(
        ctx,
        colorOrGradient,
        x,
        y - 10,
        x + width,
        y + 10
      );
      return gradient;
    } else {
      return colorOrGradient;
    }
  }

  /**
   * 라벨 위치 표시 점 렌더링
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {Object} position - {x, y} 픽셀 좌표
   */
  function renderLabelDot(ctx, position) {
    ctx.save();
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(position.x, position.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * 라벨 배경 렌더링
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   * @param {number} width - 너비
   * @param {number} height - 높이
   * @param {Object} style - 라벨 스타일
   */
  function renderLabelBackground(ctx, x, y, width, height, style) {
    if (style.backgroundColor && style.backgroundColor !== 'transparent') {
      ctx.save();
      ctx.fillStyle = style.backgroundColor;
      ctx.fillRect(
        x - style.padding,
        y - height / 2 - style.padding,
        width + style.padding * 2,
        height + style.padding * 2
      );
      ctx.restore();
    }
  }

  /**
   * 라벨 텍스트 렌더링
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {string} text - 라벨 텍스트
   * @param {Object} position - {x, y, align, baseline, isFlipped}
   * @param {number} textWidth - 텍스트 너비
   * @param {number} textHeight - 텍스트 높이
   * @param {string} color - 텍스트 색상
   * @param {Object} style - 라벨 스타일
   */
  function renderEquationText(ctx, text, position, textWidth, textHeight, color, style) {
    const labelGap = 20;

    // 위치 계산
    let textX;
    if (position.align === 'left') {
      if (position.isFlipped) {
        // 반전: 점 오른쪽에 텍스트
        textX = position.x + labelGap;
      } else {
        // 기본: 점 왼쪽에 텍스트
        textX = position.x - labelGap - textWidth;
      }
    } else if (position.align === 'center') {
      textX = position.x - textWidth / 2;
    } else if (position.align === 'right') {
      // 오른쪽 정렬: 점 오른쪽에 텍스트 (점 → 라벨)
      textX = position.x + labelGap;
    }

    // baseline에 따른 실제 Y 좌표
    let actualY = position.y;
    if (position.baseline === 'bottom') {
      actualY = position.y;
    } else if (position.baseline === 'middle') {
      actualY = position.y + textHeight / 4;
    } else if (position.baseline === 'top') {
      actualY = position.y + textHeight / 2;
    }

    // 배경 렌더링
    renderLabelBackground(ctx, textX, actualY, textWidth, textHeight, style);

    // 그라디언트 문자열을 Canvas 그라디언트 객체로 변환
    const appliedColor = applyColorForText$1(ctx, color, textX, actualY, textWidth);
    ctx.fillStyle = appliedColor;

    // 텍스트 렌더링
    drawTextWithMathFont$1(ctx, text, textX, actualY, style.fontSize);
  }

  /**
   * 충돌 회피 로직
   * @param {Array} existingPositions - 기존 라벨 위치들
   * @param {Object} newPosition - 새 라벨 위치
   * @param {number} textWidth - 텍스트 너비
   * @param {number} textHeight - 텍스트 높이
   * @param {Object} style - 라벨 스타일
   * @param {number} canvasWidth - 캔버스 너비
   * @returns {Object} 조정된 위치 {x, y, align, isFlipped}
   */
  function avoidCollision(existingPositions, newPosition, textWidth, textHeight, style, canvasWidth) {
    const maxAttempts = style.maxAttempts || 10;
    const stepY = 15;

    let adjustedPosition = { ...newPosition };
    let isFlipped = newPosition.isFlipped || false;
    let currentBox = getLabelBoundingBox(adjustedPosition, textWidth, textHeight, isFlipped);

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      let hasCollision = false;
      let shouldFlip = false;

      for (const existingPos of existingPositions) {
        const existingBox = {
          x: existingPos.box.x,
          y: existingPos.box.y,
          width: existingPos.box.width,
          height: existingPos.box.height
        };

        if (isBoxOverlapping(currentBox, existingBox)) {
          hasCollision = true;

          // 기존 라벨이 flipped이고, 현재 라벨이 왼쪽 정렬이면
          if (existingPos.isFlipped && !isFlipped && adjustedPosition.align === 'left') {
            shouldFlip = true;
            isFlipped = true;
            currentBox = getLabelBoundingBox(adjustedPosition, textWidth, textHeight, isFlipped);
            break;
          }
        }
      }

      if (!hasCollision) {
        adjustedPosition.isFlipped = isFlipped;
        return adjustedPosition;
      }

      if (shouldFlip) {
        continue;
      }

      // Y축 이동
      adjustedPosition.y += stepY;
      currentBox = getLabelBoundingBox(adjustedPosition, textWidth, textHeight, isFlipped);
    }

    adjustedPosition.isFlipped = isFlipped;
    return adjustedPosition;
  }

  /**
   * 단일 라벨 렌더링
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {Object} layer - 레이어 객체
   * @param {Object} coordConfig - 좌표 설정
   * @param {number} canvasSize - 캔버스 크기
   * @param {Object} style - 라벨 스타일
   * @param {Array} existingPositions - 기존 라벨 위치들
   * @returns {Object|null} 라벨 위치 정보
   */
  function renderSingleLabel(ctx, layer, coordConfig, canvasSize, style, existingPositions) {
    // 부모로부터 동적으로 업데이트된 데이터 사용
    const text = layer.data.text;
    const value = layer.data._value || layer.data.value; // _value 우선 (동적), 없으면 value 사용

    if (!text || !value) {
      return null;
    }

    // 최적 위치 계산 (픽셀 좌표 반환)
    const pixelPos = calculateOptimalLabelPosition(layer, coordConfig, canvasSize, style);

    if (!pixelPos) {
      return null;
    }

    // 텍스트 크기 측정 (수학 폰트 규칙 적용)
    const textWidth = measureTextWidthWithMathFont$1(ctx, text, style.fontSize);
    const textHeight = style.fontSize;

    // 초기 위치 설정
    let labelPosition = {
      x: pixelPos.x,
      y: pixelPos.y,
      align: pixelPos.align || 'left',
      baseline: pixelPos.baseline || 'middle',
      isFlipped: pixelPos.isFlipped || false  // calculateOptimalLabelPosition에서 계산된 값 사용
    };

    // 화면 밖 짤림 체크 (충돌 회피 전에 수행)
    if (isClippedOffScreen(labelPosition, textWidth)) {
      labelPosition.isFlipped = true;
    }

    // 충돌 회피
    labelPosition = avoidCollision(
      existingPositions,
      labelPosition,
      textWidth,
      textHeight,
      style);

    // 색상 결정 (부모로부터 동적으로 업데이트된 색상 사용)
    let textColor = style.color;
    if (textColor === 'auto') {
      textColor = extractLayerColor$1(layer);
    }

    // 디버그 점 렌더링 (라벨보다 먼저)
    // 점은 함수 곡선 위에 표시 (dotY 사용)
    if (style.showDot) {
      const dotPosition = {
        x: labelPosition.x,
        y: labelPosition.dotY !== undefined ? labelPosition.dotY : labelPosition.y
      };
      renderLabelDot(ctx, dotPosition);
    }

    // 라벨 렌더링
    ctx.save();
    renderEquationText(ctx, text, labelPosition, textWidth, textHeight, textColor, style);
    ctx.restore();

    // 실제 텍스트 박스 위치 계산 (저장용)
    let boxX = labelPosition.x;
    let boxY = labelPosition.y;

    // align에 따른 x 위치 (isFlipped 고려)
    const labelGap = 20;
    if (labelPosition.align === 'left') {
      if (labelPosition.isFlipped) {
        // 반전된 경우: 점 오른쪽에 텍스트
        boxX = labelPosition.x + labelGap;
      } else {
        // 기본: 점 왼쪽에 텍스트
        boxX = labelPosition.x - labelGap - textWidth;
      }
    } else if (labelPosition.align === 'center') {
      boxX = labelPosition.x - textWidth / 2;
    } else if (labelPosition.align === 'right') {
      // 오른쪽 정렬: 점 오른쪽에 텍스트 (점 → 라벨)
      boxX = labelPosition.x + labelGap;
    }

    // baseline에 따른 y 위치
    if (labelPosition.baseline === 'bottom') {
      boxY = labelPosition.y - textHeight;
    } else if (labelPosition.baseline === 'middle') {
      boxY = labelPosition.y - textHeight / 2;
    } else if (labelPosition.baseline === 'top') {
      boxY = labelPosition.y;
    }

    // 위치 정보를 박스로 저장 (다음 라벨의 충돌 체크용)
    return {
      x: boxX,
      y: boxY,
      width: textWidth,
      height: textHeight,
      align: labelPosition.align,
      baseline: labelPosition.baseline,
      isFlipped: labelPosition.isFlipped || false,
      box: {
        x: boxX,
        y: boxY,
        width: textWidth,
        height: textHeight
      }
    };
  }

  /**
     * 이차함수 식을 문자열로 변환
     * @param {Array} value - [a, b, c] 또는 [a, b] (일차함수)
     * @returns {string} 함수 식 문자열 (예: "y = x² - 4", "y = 2x + 3")
     */
    function formatFunctionEquation(value) {
      if (!value || !Array.isArray(value) || value.length < 2) {
        return 'y = 0';
      }
      
      const isLinear = value.length === 2;
      let a, b, c;
      
      if (isLinear) {
        // 일차함수: y = ax + b, value = [a, b]
        a = 0;
        b = value[0];
        c = value[1];
      } else {
        // 이차함수: y = ax² + bx + c, value = [a, b, c]
        [a, b, c] = value;
      }
      
      // 숫자 포맷팅 헬퍼
      const formatNumber = (num) => {
        if (num === 0) return '0';
        if (num === 1) return '';
        if (num === -1) return '-';
        // 소수점 처리
        if (Number.isInteger(num)) {
          return num.toString();
        }
        // 소수점 3자리까지만
        return parseFloat(num.toFixed(3)).toString();
      };
      
      let equation = 'y = ';
      let hasTerm = false;
      
      if (isLinear) {
        // 일차함수: y = ax + b
        // ax 항
        if (b !== 0) {
          const aStr = formatNumber(b);
          if (aStr === '') {
            equation += 'x';
          } else if (aStr === '-') {
            equation += '-x';
          } else {
            equation += `${aStr}x`;
          }
          hasTerm = true;
        }
        
        // 상수항 c
        if (c !== 0) {
          const cStr = formatNumber(c);
          if (hasTerm) {
            if (c > 0) {
              equation += ` + ${cStr}`;
            } else {
              equation += ` - ${Math.abs(c)}`;
            }
          } else {
            equation += cStr;
          }
          hasTerm = true;
        }
        
        if (!hasTerm) {
          equation += '0';
        }
      } else {
        // 이차함수: y = ax² + bx + c
        
        // ax² 항
        if (a !== 0) {
          const aStr = formatNumber(a);
          if (aStr === '') {
            equation += 'x²';
          } else if (aStr === '-') {
            equation += '-x²';
          } else {
            equation += `${aStr}x²`;
          }
          hasTerm = true;
        }
        
        // bx 항
        if (b !== 0) {
          const bStr = formatNumber(b);
          if (hasTerm) {
            if (b > 0) {
              if (bStr === '') {
                equation += ' + x';
              } else {
                equation += ` + ${bStr}x`;
              }
            } else {
              if (bStr === '-') {
                equation += ' - x';
              } else {
                equation += ` - ${Math.abs(b)}x`;
              }
            }
          } else {
            if (bStr === '') {
              equation += 'x';
            } else if (bStr === '-') {
              equation += '-x';
            } else {
              equation += `${bStr}x`;
            }
          }
          hasTerm = true;
        }
        
        // 상수항 c
        if (c !== 0) {
          const cStr = formatNumber(c);
          if (hasTerm) {
            if (c > 0) {
              equation += ` + ${cStr}`;
            } else {
              equation += ` - ${Math.abs(c)}`;
            }
          } else {
            equation += cStr;
          }
          hasTerm = true;
        }
        
        if (!hasTerm) {
          equation += '0';
        }
      }
      
      return equation;
    }

  // ============================================================================
  // Label Router - 라벨 렌더링 진입점
  // @version 4.0.0
  // ============================================================================


  // 라벨 위치 저장소 (충돌 회피용)
  const labelPositions = [];

  // 전체 레이어 배열 저장소 (부모 레이어 찾기용)
  let allLayers = [];

  /**
   * 라벨 위치 저장소 초기화
   */
  function clearLabelPositions() {
    labelPositions.length = 0;
  }

  /**
   * 전체 레이어 배열 설정 (부모 찾기용)
   * @param {Array} layers - 전체 레이어 배열
   */
  function setAllLayers(layers) {
    allLayers = layers;
  }

  /**
   * 레이어 ID로 레이어 찾기 (재귀)
   * @param {Array} layers - 레이어 배열
   * @param {string} id - 찾을 레이어 ID
   * @returns {Object|null} 찾은 레이어
   */
  function findLayerById(layers, id) {
    for (const layer of layers) {
      if (layer.id === id) return layer;
      if (layer.children && layer.children.length > 0) {
        const found = findLayerById(layer.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * 라벨 그리기 (메인 진입점)
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {Object} layer - 레이어 객체
   * @param {Object} coordConfig - 좌표 설정
   * @param {number} canvasSize - 캔버스 크기
   * @param {number} progress - 애니메이션 진행도 (0~1)
   */
  function drawLabel(ctx, layer, coordConfig, canvasSize, progress = 1) {
    if (!layer || !layer.data) return;

    // showEquationLabels 플래그 체크
    if (coordConfig.showEquationLabels === false) {
      return; // 라벨 표시 비활성화
    }

    // 부모 레이어에서 함수 데이터 가져오기
    let functionData = null;
    let functionColor = null;
    let functionText = null;

    if (layer.p_id && allLayers.length > 0) {
      const parent = findLayerById(allLayers, layer.p_id);
      if (parent && parent.children && parent.children.length > 0) {
        // 부모의 첫 번째 자식 = 함수 레이어
        const functionLayer = parent.children.find(child =>
          child.type === 'quadratic' || child.type === 'linear' || child.type === 'function'
        );
        if (functionLayer && functionLayer.data && functionLayer.data.value) {
          functionData = functionLayer.data.value;
          functionColor = functionLayer.data.color;
          // 함수 계수로부터 함수 식 생성
          functionText = formatFunctionEquation(functionData);
        }
      }
    }

    // 함수 데이터를 실제 layer.data에 업데이트 (JSON에도 반영됨)
    if (functionData) {
      layer.data._value = functionData; // 위치 계산용 (JSON 제외)
    }

    // 함수 텍스트 동적 업데이트 (실제 data.text 변경)
    if (functionText) {
      layer.data.text = functionText; // 실제 데이터 변경 (JSON에 반영됨)
    }

    // 함수 색상 동적 업데이트 (실제 data.color 변경)
    if (functionColor) {
      layer.data.color = functionColor; // 실제 데이터 변경 (JSON에 반영됨)
    }

    // 스타일 생성
    const style = createLabelStyle(layer.data, coordConfig);

    // 애니메이션 적용 (fade 효과)
    ctx.save();
    ctx.globalAlpha = progress;

    // 라벨 렌더링
    const position = renderSingleLabel(ctx, layer, coordConfig, canvasSize, style, labelPositions);

    // 위치 저장
    if (position) {
      labelPositions.push(position);
    }

    ctx.restore();
  }

  // ============================================================================
  // Line DTO - 선 스타일 설정
  // @version 3.0.0
  // ============================================================================


  /**
   * 선 스타일 설정 생성
   * @param {Object} data - 선 데이터
   * @returns {Object} 스타일 설정
   */
  function createLineStyle(data) {
    const {
      color: rawColor,
      width: rawWidth,
      style
    } = data;

    const styleConfig = createStyleConfig();

    return {
      color: rawColor && rawColor !== '#'
        ? rawColor
        : styleConfig.defaultColors.line,
      width: rawWidth && rawWidth > 0
        ? rawWidth
        : styleConfig.line.width,
      style: style || 'dashed' // solid, dotted, dashed
    };
  }

  // ============================================================================
  // Line Utils - 선 유틸리티 함수
  // @version 3.0.0
  // ============================================================================


  /**
   * 선 레이어 자동 이름 설정
   * @param {Object} layer - 레이어 객체
   */
  function autoSetLineName(layer) {
    try {
      const { lineType, x, y, from, to } = layer.data;
      const hasName = typeof layer.name === 'string'
        && layer.name.trim().length > 0
        && layer.name !== 'Untitled Layer';

      if (hasName) return;

      const fmt = formatNumber;

      if (lineType === 'horizontal') {
        const yy = (typeof y === 'number') ? y : (from && to && from.y === to.y ? from.y : null);
        if (yy !== null) layer.name = `y = ${fmt(yy)}`;
      } else if (lineType === 'vertical') {
        const xx = (typeof x === 'number') ? x : (from && to && from.x === to.x ? from.x : null);
        if (xx !== null) layer.name = `x = ${fmt(xx)}`;
      } else if (lineType === 'segment') {
        if (from && to && from.y === to.y) {
          const yy = from.y;
          layer.name = `y = ${fmt(yy)}`;
        } else if (from && to && from.x === to.x) {
          const xx = from.x;
          layer.name = `x = ${fmt(xx)}`;
        }
      }
    } catch (_) {
      // 이름 설정 실패 시 무시
    }
  }

  /**
   * 선 스타일을 캔버스에 적용
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {string} style - 선 스타일 (solid, dotted, dashed)
   */
  function applyLineStyle$1(ctx, style) {
    if (style === 'solid') {
      ctx.setLineDash([]);
    } else if (style === 'dotted') {
      ctx.setLineDash([2, 2]);
    } else {
      // 기본값 또는 'dashed'
      ctx.setLineDash([5, 5]);
    }
  }

  // ============================================================================
  // Line Renderer - 선 렌더링 렌더러
  // @version 3.0.0
  // ============================================================================


  /**
   * 수직선 렌더링 (x = 상수)
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {number} x - X 좌표
   * @param {Object} config - 상태
   * @param {number} canvasSize - 캔버스 크기
   */
  function renderVerticalLine(ctx, x, config, canvasSize) {
    const px = coordToPixelX$1(x, config, canvasSize);
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, canvasSize);
    ctx.stroke();
  }

  /**
   * 수평선 렌더링 (y = 상수)
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {number} y - Y 좌표
   * @param {Object} config - 상태
   * @param {number} canvasSize - 캔버스 크기
   */
  function renderHorizontalLine(ctx, y, config, canvasSize) {
    const py = coordToPixelY$1(y, config, canvasSize);
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(canvasSize, py);
    ctx.stroke();
  }

  /**
   * 선분 렌더링 (from → to)
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} from - 시작점 {x, y}
   * @param {Object} to - 끝점 {x, y}
   * @param {Object} config - 상태
   * @param {number} canvasSize - 캔버스 크기
   */
  function renderSegment(ctx, from, to, config, canvasSize) {
    if (!from || !to) return;

    const px1 = coordToPixelX$1(from.x, config, canvasSize);
    const py1 = coordToPixelY$1(from.y, config, canvasSize);
    const px2 = coordToPixelX$1(to.x, config, canvasSize);
    const py2 = coordToPixelY$1(to.y, config, canvasSize);

    ctx.beginPath();
    ctx.moveTo(px1, py1);
    ctx.lineTo(px2, py2);
    ctx.stroke();
  }

  // ============================================================================
  // Line Router - 선 렌더링 라우터
  // @version 3.0.0
  // ============================================================================


  /**
   * 선 렌더링 - 메인 진입점
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} layer - 레이어 객체
   * @param {Object} config - 좌표평면 상태
   * @param {number} canvasSize - 캔버스 크기
   * @param {number} progress - 애니메이션 진행도 (0~1) - 현재 미사용
   */
  function drawLine(ctx, layer, config, canvasSize, progress) {
    const { lineType, x, y, from, to } = layer.data;

    // 1. 자동 이름 설정
    autoSetLineName(layer);

    // 2. 스타일 설정 생성
    const style = createLineStyle(layer.data);

    // 3. 캔버스 스타일 적용
    ctx.save();
    applyColorOrGradient(ctx, style.color, config, canvasSize, 'stroke');
    ctx.lineWidth = style.width;
    applyLineStyle$1(ctx, style.style);

    // 4. 선 타입에 따라 렌더링
    switch (lineType) {
      case 'vertical':
        renderVerticalLine(ctx, x, config, canvasSize);
        break;

      case 'horizontal':
        renderHorizontalLine(ctx, y, config, canvasSize);
        break;

      case 'segment':
        renderSegment(ctx, from, to, config, canvasSize);
        break;
    }

    ctx.restore();
  }

  // ============================================================================
  // Measurement Utils - 측정 유틸리티 함수
  // @version 3.0.0
  // ============================================================================


  // ============================================================================
  // 길이 측정 유틸리티
  // ============================================================================

  /**
   * 선분 길이 계산 (유클리드 거리)
   * @param {Object} from - 시작점 {x, y}
   * @param {Object} to - 끝점 {x, y}
   * @returns {number} 선분 길이
   */
  function calculateLength(from, to) {
    if (!from || !to) return 0;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // ============================================================================
  // 각도 측정 유틸리티
  // ============================================================================

  /**
   * 세 점으로 각도 계산 (라디안)
   * @param {Object} vertex - 꼭짓점 {x, y}
   * @param {Object} point1 - 첫 번째 변의 점 {x, y}
   * @param {Object} point2 - 두 번째 변의 점 {x, y}
   * @returns {number} 각도 (라디안, 0 ~ π) - 항상 내각 반환
   */
  function calculateAngle(vertex, point1, point2) {
    if (!vertex || !point1 || !point2) return 0;

    // 벡터 계산
    const v1x = point1.x - vertex.x;
    const v1y = point1.y - vertex.y;
    const v2x = point2.x - vertex.x;
    const v2y = point2.y - vertex.y;

    // 각 벡터의 각도
    const angle1 = Math.atan2(v1y, v1x);
    const angle2 = Math.atan2(v2y, v2x);

    // 각도 차이 (항상 양수, 0 ~ 2π)
    let angleDiff = angle2 - angle1;
    if (angleDiff < 0) angleDiff += 2 * Math.PI;

    // 항상 내각 반환 (180도 미만)
    if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;

    return angleDiff;
  }

  /**
   * 라디안을 도(degree)로 변환
   * @param {number} radian - 라디안 값
   * @returns {number} 도(degree) 값
   */
  function radianToDegree(radian) {
    return radian * (180 / Math.PI);
  }

  /**
   * 각도 라벨 위치 계산 (픽셀 좌표)
   * @param {Object} vertexPixel - 꼭짓점 픽셀 {x, y}
   * @param {number} angle1 - 첫 번째 변의 각도 (라디안)
   * @param {number} angle2 - 두 번째 변의 각도 (라디안)
   * @param {number} arcRadius - 호의 반지름 (픽셀)
   * @param {boolean} arcIsCounterclockwise - 렌더링된 호가 반시계방향인지 여부
   * @returns {Object} 라벨 위치 {x, y}
   */
  function getAngleLabelPosition(vertexPixel, angle1, angle2, arcRadius = 30, arcIsCounterclockwise = false) {
    // 각도 차이 계산
    let angleDiff = angle2 - angle1;
    if (angleDiff < 0) angleDiff += 2 * Math.PI;

    // 내각 방향의 중점 계산
    let midAngle;
    if (arcIsCounterclockwise) {
      // 호가 반시계방향 = 외각을 그림 → 내각의 중점을 계산해야 함
      // 내각 크기 = 2π - angleDiff
      // angle2에서 시작해서 내각의 절반만큼 회전
      midAngle = angle2 + (2 * Math.PI - angleDiff) / 2;
    } else {
      // 호가 시계방향 = 내각을 그림 → angleDiff/2 만큼 angle1에서 회전
      // 이 방식은 angle1 > angle2 경우에도 항상 올바른 내각 중점을 계산
      midAngle = angle1 + angleDiff / 2;
    }

    // 호보다 살짝 안쪽에 배치 (호 방향과 같은 방향, 더 짧은 거리)
    const distance = arcRadius * 0.55;

    const labelX = vertexPixel.x + Math.cos(midAngle) * distance;
    const labelY = vertexPixel.y + Math.sin(midAngle) * distance;

    return {
      x: labelX,
      y: labelY
    };
  }

  // ============================================================================
  // 베지어 곡선 유틸리티
  // ============================================================================

  /**
   * 2차 베지어 곡선 위의 점 계산
   * @param {Object} p0 - 시작점 {x, y}
   * @param {Object} p1 - 제어점 {x, y}
   * @param {Object} p2 - 끝점 {x, y}
   * @param {number} t - 매개변수 (0~1)
   * @returns {Object} 베지어 곡선 위의 점 {x, y}
   */
  function getQuadraticBezierPoint(p0, p1, p2, t) {
    const x = (1-t)*(1-t)*p0.x + 2*(1-t)*t*p1.x + t*t*p2.x;
    const y = (1-t)*(1-t)*p0.y + 2*(1-t)*t*p1.y + t*t*p2.y;
    return { x, y };
  }

  // ============================================================================
  // 좌표 변환 유틸리티
  // ============================================================================

  /**
   * 좌표를 픽셀로 변환
   * @param {Object} point - 좌표 {x, y}
   * @param {Object} config - 상태
   * @param {number} canvasSize - 캔버스 크기
   * @returns {Object} 픽셀 좌표 {x, y}
   */
  function coordToPixel(point, config, canvasSize) {
    return {
      x: coordToPixelX$1(point.x, config, canvasSize),
      y: coordToPixelY$1(point.y, config, canvasSize)
    };
  }

  // ============================================================================
  // Measurement Renderer - 측정값 렌더링
  // @version 3.0.0
  // ============================================================================


  // ============================================================================
  // 공통 렌더링 유틸리티
  // ============================================================================

  /**
   * 선 스타일 적용
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {string} lineStyle - 선 스타일 ('solid'|'dashed'|'dotted')
   */
  function applyLineStyle(ctx, lineStyle) {
    if (lineStyle === 'solid') {
      ctx.setLineDash([]);
    } else if (lineStyle === 'dotted') {
      ctx.setLineDash([2, 2]);
    } else if (lineStyle === 'dashed') {
      ctx.setLineDash([5, 5]);
    }
  }

  /**
   * 라벨 렌더링 (배경 + 텍스트)
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {string} text - 표시할 텍스트
   * @param {Object} position - 위치 {x, y}
   * @param {Object} style - 스타일 설정
   * @param {boolean} noBackground - 배경 없이 렌더링 (기본: false)
   */
  function renderLabel$2(ctx, text, position, style, noBackground = false) {
    ctx.save();

    // 폰트 설정
    ctx.font = `${style.labelFontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (!noBackground) {
      // 텍스트 크기 측정
      const textMetrics = ctx.measureText(text);
      const textWidth = textMetrics.width;
      const textHeight = style.labelFontSize;

      // 배경 렌더링
      const padding = style.labelPadding;
      const bgX = position.x - textWidth / 2 - padding;
      const bgY = position.y - textHeight / 2 - padding;
      const bgWidth = textWidth + padding * 2;
      const bgHeight = textHeight + padding * 2;

      ctx.fillStyle = style.labelBackground;
      ctx.fillRect(bgX, bgY, bgWidth, bgHeight);

      // 테두리 (선택적)
      ctx.strokeStyle = style.labelColor;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(bgX, bgY, bgWidth, bgHeight);
    }

    // 텍스트 렌더링
    ctx.fillStyle = style.labelColor;
    ctx.fillText(text, position.x, position.y);

    ctx.restore();
  }

  // ============================================================================
  // 길이 측정 렌더링
  // ============================================================================

  /**
   * 길이 측정 렌더링
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} data - 길이 측정 데이터
   * @param {Object} style - 스타일 설정
   * @param {Object} config - 좌표평면 상태
   * @param {number} canvasSize - 캔버스 크기
   */
  function renderLength(ctx, data, style, config, canvasSize) {
    const { from, to } = data;
    if (!from || !to) return;

    // 픽셀 좌표 변환
    const fromPixel = coordToPixel(from, config, canvasSize);
    const toPixel = coordToPixel(to, config, canvasSize);

    ctx.save();

    // 길이 계산
    const length = calculateLength(from, to);
    const labelText = style.customLabel || length.toFixed(style.decimalPlaces);

    // 선분 중점 및 벡터 계산
    const midX = (fromPixel.x + toPixel.x) / 2;
    const midY = (fromPixel.y + toPixel.y) / 2;
    const dx = toPixel.x - fromPixel.x;
    const dy = toPixel.y - fromPixel.y;

    // 왼쪽 수직 벡터 (90도 반시계방향 회전)
    const perpX = -dy;
    const perpY = dx;
    const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);

    // 정규화
    const normalizedX = perpX / perpLength;
    const normalizedY = perpY / perpLength;

    // 감김 방향에 따라 부호 결정
    // CCW (반시계방향): 왼쪽 = 바깥쪽이므로 그대로(+)
    // CW (시계방향): 왼쪽 = 안쪽이므로 반대(-)
    const windingOrder = data.windingOrder || 'ccw';
    const sign = windingOrder === 'cw' ? -1 : 1;

    // 제어점 (선분 중점에서 수직 방향으로 offset)
    const arcOffset = 20;  // 곡선 높이
    const controlX = midX + normalizedX * arcOffset * sign;
    const controlY = midY + normalizedY * arcOffset * sign;
    const control = { x: controlX, y: controlY };

    // 2. 길이 라벨 렌더링 (showLabel = true일 때) - 먼저 라벨 영역 계산
    let labelPos, textWidth, textHeight, maskX, maskY, maskWidth, maskHeight;
    if (style.showLabel) {
      // 라벨 위치 = 베지어 곡선의 중점 (t=0.5)
      labelPos = getQuadraticBezierPoint(fromPixel, control, toPixel, 0.5);

      // 라벨 텍스트 크기 측정
      ctx.font = `${style.labelFontSize}px Arial`;
      const textMetrics = ctx.measureText(labelText);
      textWidth = textMetrics.width;
      textHeight = style.labelFontSize;

      // 마스크 영역 계산
      const padding = 4;
      maskX = labelPos.x - textWidth / 2 - padding;
      maskY = labelPos.y - textHeight / 2 - padding;
      maskWidth = textWidth + padding * 2;
      maskHeight = textHeight + padding * 2;
    }

    // 1. 베지어 곡선 호 렌더링 (showLine = true일 때)
    if (style.showLine) {
      ctx.save();

      // 라벨 영역을 클리핑 제외 (inverse clip)
      if (style.showLabel) {
        // 전체 캔버스 영역을 패스로 만들고
        ctx.beginPath();
        ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
        // 라벨 영역을 구멍으로 뚫기 (evenodd winding rule)
        ctx.rect(maskX, maskY, maskWidth, maskHeight);
        ctx.clip('evenodd');
      }

      // 베지어 곡선 그리기
      ctx.strokeStyle = style.lineColor;
      ctx.lineWidth = style.lineWidth;
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.moveTo(fromPixel.x, fromPixel.y);
      ctx.quadraticCurveTo(controlX, controlY, toPixel.x, toPixel.y);
      ctx.stroke();

      ctx.restore();
    }

    // 3. 길이 라벨 텍스트 렌더링
    if (style.showLabel) {
      // 길이 라벨은 흰색 텍스트로 배경 없이 렌더링
      const lengthLabelStyle = {
        ...style,
        labelColor: '#FFFFFF'  // 흰색 텍스트
      };
      renderLabel$2(ctx, labelText, labelPos, lengthLabelStyle, true);  // noBackground = true
    }

    ctx.restore();
  }

  // ============================================================================
  // 각도 측정 렌더링
  // ============================================================================

  /**
   * 각도 측정 렌더링
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} data - 각도 측정 데이터
   * @param {Object} style - 스타일 설정
   * @param {Object} config - 좌표평면 상태
   * @param {number} canvasSize - 캔버스 크기
   */
  function renderAngle(ctx, data, style, config, canvasSize) {
    const { vertex, point1, point2 } = data;
    if (!vertex || !point1 || !point2) return;

    // 픽셀 좌표 변환
    const vertexPixel = coordToPixel(vertex, config, canvasSize);
    const point1Pixel = coordToPixel(point1, config, canvasSize);
    const point2Pixel = coordToPixel(point2, config, canvasSize);

    ctx.save();

    // 1. 두 변 렌더링 (showLines = true일 때)
    if (style.showLines) {
      ctx.strokeStyle = style.lineColor;
      ctx.lineWidth = style.lineWidth;
      applyLineStyle(ctx, style.lineStyle);

      // 첫 번째 변
      ctx.beginPath();
      ctx.moveTo(vertexPixel.x, vertexPixel.y);
      ctx.lineTo(point1Pixel.x, point1Pixel.y);
      ctx.stroke();

      // 두 번째 변
      ctx.beginPath();
      ctx.moveTo(vertexPixel.x, vertexPixel.y);
      ctx.lineTo(point2Pixel.x, point2Pixel.y);
      ctx.stroke();
    }

    // 2. 호(arc) 렌더링 (showArcs = true일 때)
    if (style.showArcs) {
      // 각 변의 각도 계산
      const angle1 = Math.atan2(
        point1Pixel.y - vertexPixel.y,
        point1Pixel.x - vertexPixel.x
      );
      const angle2 = Math.atan2(
        point2Pixel.y - vertexPixel.y,
        point2Pixel.x - vertexPixel.x
      );

      // 각도 차이 계산하여 항상 내각(180도 미만) 선택
      let angleDiff = angle2 - angle1;
      if (angleDiff < 0) angleDiff += 2 * Math.PI;

      // 각도 차이가 180도보다 크면 반대 방향으로 그려야 내각이 됨
      const counterclockwise = angleDiff > Math.PI;

      ctx.strokeStyle = style.arcColor;
      ctx.lineWidth = style.arcWidth;
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(
        vertexPixel.x,
        vertexPixel.y,
        style.arcRadius,
        angle1,
        angle2,
        counterclockwise
      );
      ctx.stroke();
    }

    // 3. 각도 라벨 렌더링 (showLabel = true일 때)
    if (style.showLabel) {
      // 각도 계산 (라디안)
      const angleRad = calculateAngle(vertex, point1, point2);

      // 각도 값 생성
      let angleValue, unit;
      if (style.angleUnit === 'degree') {
        angleValue = radianToDegree(angleRad);
        unit = '°';
      } else {
        angleValue = angleRad;
        unit = ' rad';
      }

      const labelText = angleValue.toFixed(style.decimalPlaces) + unit;

      // 라벨 위치 계산 (호 렌더링과 동일한 각도 계산 재사용)
      const angle1 = Math.atan2(
        point1Pixel.y - vertexPixel.y,
        point1Pixel.x - vertexPixel.x
      );
      const angle2 = Math.atan2(
        point2Pixel.y - vertexPixel.y,
        point2Pixel.x - vertexPixel.x
      );

      // 호와 동일한 counterclockwise 값 계산 (arc 렌더링과 동일한 로직)
      let angleDiff = angle2 - angle1;
      if (angleDiff < 0) angleDiff += 2 * Math.PI;
      const counterclockwise = angleDiff > Math.PI;

      // arcRadius와 counterclockwise 값을 사용하여 호와 꼭지점 사이에 라벨 배치
      const labelPos = getAngleLabelPosition(
        vertexPixel,
        angle1,
        angle2,
        style.arcRadius,
        counterclockwise  // 호 방향 정보 전달
      );

      // 각도 라벨은 흰색 텍스트로 배경 없이 렌더링
      const angleLabelStyle = {
        ...style,
        labelColor: '#FFFFFF'  // 흰색 텍스트
      };
      renderLabel$2(ctx, labelText, labelPos, angleLabelStyle, true);  // noBackground = true
    }

    ctx.restore();
  }

  // ============================================================================
  // Measurement DTO - 측정값 스타일 정의
  // @version 4.3.0
  // ============================================================================


  /**
   * 길이 측정 기본 스타일
   * @constant
   */
  const DEFAULT_LENGTH_STYLE = {
    showLine: false,
    showLabel: true,
    lineColor: COLOR_PRESETS.info,
    lineWidth: 2,
    lineStyle: 'solid',
    labelFontSize: 14,
    labelColor: COLOR_PRESETS.info,
    labelBackground: 'rgba(255,255,255,0.9)',
    labelPadding: 4,
    labelPosition: 'center',
    labelOffset: 10,
    decimalPlaces: 1,
    customLabel: null
  };

  /**
   * 각도 측정 기본 스타일
   * @constant
   */
  const DEFAULT_ANGLE_STYLE = {
    showLines: false,
    showArcs: true,
    showLabel: true,
    lineColor: COLOR_PRESETS.info,
    lineWidth: 1,
    lineStyle: 'solid',
    arcColor: COLOR_PRESETS.info,
    arcWidth: 2,
    arcRadius: 30,
    labelFontSize: 14,
    labelColor: COLOR_PRESETS.info,
    labelBackground: 'rgba(255,255,255,0.9)',
    labelPadding: 4,
    labelDistance: 45,
    angleUnit: 'degree',
    decimalPlaces: 1
  };

  // ============================================================================
  // Measurement Router - 측정값 렌더링 진입점
  // @version 4.0.0
  // ============================================================================


  // ============================================================================
  // 진입점 함수
  // ============================================================================

  /**
   * 측정 레이어 렌더링
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} data - 레이어 데이터
   * @param {Object} config - 좌표평면 상태
   * @param {number} canvasSize - 캔버스 크기
   */
  function drawMeasurement(ctx, data, config, canvasSize) {
    const { measurementType } = data;

    if (measurementType === 'length') {
      const style = { ...DEFAULT_LENGTH_STYLE, ...data };
      renderLength(ctx, data, style, config, canvasSize);
    } else if (measurementType === 'angle') {
      const style = { ...DEFAULT_ANGLE_STYLE, ...data };
      renderAngle(ctx, data, style, config, canvasSize);
    } else {
      console.warn(`Unknown measurement type: ${measurementType}`);
    }
  }

  // ============================================================================
  // Point DTO - 점 스타일 설정
  // @version 3.0.0
  // ============================================================================


  /**
   * 점 스타일 설정 생성
   * @param {Object} data - 점 데이터
   * @returns {Object} 스타일 설정
   */
  function createPointStyle(data) {
    const {
      color: rawColor,
      size: rawSize
    } = data;

    const styleConfig = createStyleConfig();

    return {
      color: rawColor && rawColor !== '#'
        ? rawColor
        : styleConfig.defaultColors.point,
      size: rawSize && rawSize > 0
        ? rawSize
        : styleConfig.point.size
    };
  }

  /**
   * 라벨 폰트 설정 생성
   * @param {Object} data - 점 데이터
   * @param {Object} state - 상태
   * @returns {Object} 폰트 설정
   */
  function createLabelFontConfig(data, config) {
    // labelFont가 명시적으로 null이면 일반 폰트 사용
    // labelFont가 undefined이면 customLabelFontFamily 사용
    // labelFont가 문자열이면 해당 폰트 사용
    const useCustom = data.labelFont !== null;
    const customFont = data.labelFont || null;

    return createMixedFontConfig(config, useCustom, customFont);
  }

  // ============================================================================
  // Point Utils - 점 유틸리티 함수
  // @version 3.0.0
  // ============================================================================


  /**
   * 점 레이어 자동 이름 설정
   * @param {Object} layer - 레이어 객체
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   */
  function autoSetPointName(layer, x, y) {
    try {
      const hasName = typeof layer.name === 'string'
        && layer.name.trim().length > 0
        && layer.name !== 'Untitled Layer';

      if (hasName) return;

      const fmt = formatNumber;
      layer.name = `(${fmt(x)}, ${fmt(y)})`;
    } catch (_) {
      // 이름 설정 실패 시 무시
    }
  }

  /**
   * 라벨 위치와 정렬 계산
   * @param {Object} layer - 레이어 객체
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   * @param {number} px - 픽셀 X 좌표
   * @param {number} py - 픽셀 Y 좌표
   * @returns {Object} { labelText, labelX, labelY, textAlign, textBaseline }
   */
  function calculateLabelPosition(layer, x, y, px, py) {
    const { pointType, label } = layer.data;

    // 0) 사용자 지정 오프셋 우선
    if (typeof layer.data.labelDx === 'number' || typeof layer.data.labelDy === 'number') {
      return calculateCustomOffsetLabel(layer, x, y, px, py);
    }

    // 0-1) x축 절편 (이차함수 메타데이터 있음)
    if ((pointType === 'x-axis' || (y === 0 && x !== 0)) && Array.isArray(layer.data.quadValue)) {
      return calculateXInterceptWithQuadratic(layer, x, px, py);
    }

    // x축 절편 (일반)
    if (pointType === 'x-axis' || (y === 0 && x !== 0)) {
      return calculateXInterceptLabel(layer, x, px, py);
    }

    // 0-2) y축 절편 (이차함수 메타데이터 있음)
    if ((pointType === 'y-axis' || (x === 0 && y !== 0)) && Array.isArray(layer.data.quadValue)) {
      return calculateYInterceptWithQuadratic(layer, y, px, py);
    }

    // y축 절편 (일반)
    if (pointType === 'y-axis' || (x === 0 && y !== 0)) {
      return calculateYInterceptLabel(layer, y, px, py);
    }

    // 일반 점
    return calculateGeneralPointLabel(label, x, y, px, py);
  }

  /**
   * 사용자 지정 오프셋 라벨
   */
  function calculateCustomOffsetLabel(layer, x, y, px, py) {
    const { pointType, label } = layer.data;

    const labelText = (pointType === 'x-axis' || (y === 0 && x !== 0))
      ? (label || formatNumber(x))
      : (pointType === 'y-axis' || (x === 0 && y !== 0))
        ? (label || formatNumber(y))
        : (label || `(${formatNumber(x)}, ${formatNumber(y)})`);

    const dx = layer.data.labelDx || 0;
    const dy = layer.data.labelDy || 0;
    const labelX = px + dx;
    const labelY = py + dy;

    const textAlign = layer.data.textAlign || (dx < 0 ? 'right' : dx > 0 ? 'left' : 'center');
    const textBaseline = layer.data.textBaseline || (dy < 0 ? 'bottom' : dy > 0 ? 'top' : 'middle');

    return { labelText, labelX, labelY, textAlign, textBaseline };
  }

  /**
   * x축 절편 라벨 (이차함수 메타데이터 있음)
   */
  function calculateXInterceptWithQuadratic(layer, x, px, py) {
    const value = layer.data.quadValue;
    const intercepts = calculateQuadraticIntercepts(value);
    const off = computeInterceptLabelOffset({
      axis: 'x',
      value,
      xIntercepts: intercepts.xIntercepts,
      yIntercept: intercepts.yIntercept,
      currentX: x
    });

    const labelText = layer.data.label || formatNumber(x);
    const labelX = px + (off.labelDx || 0);
    const labelY = py + (off.labelDy || 0);
    const textAlign = off.textAlign || 'center';
    const textBaseline = off.textBaseline || 'bottom';

    return { labelText, labelX, labelY, textAlign, textBaseline };
  }

  /**
   * x축 절편 라벨 (일반)
   */
  function calculateXInterceptLabel(layer, x, px, py) {
    const segmentDy = layer.data.segmentDy;
    const labelText = layer.data.label || formatNumber(x);
    const labelX = px;
    let labelY, textAlign, textBaseline;

    if (typeof segmentDy === 'number') {
      if (segmentDy > 0) {
        // 선분이 위로 → 라벨은 아래
        labelY = py + 15;
        textAlign = 'center';
        textBaseline = 'top';
      } else if (segmentDy < 0) {
        // 선분이 아래로 → 라벨은 위
        labelY = py - 15;
        textAlign = 'center';
        textBaseline = 'bottom';
      } else {
        // 동점 특수 케이스: 기본 위
        labelY = py - 15;
        textAlign = 'center';
        textBaseline = 'bottom';
      }
    } else {
      // 메타데이터 없으면 기본 위
      labelY = py - 15;
      textAlign = 'center';
      textBaseline = 'bottom';
    }

    return { labelText, labelX, labelY, textAlign, textBaseline };
  }

  /**
   * y축 절편 라벨 (이차함수 메타데이터 있음)
   */
  function calculateYInterceptWithQuadratic(layer, y, px, py) {
    const value = layer.data.quadValue;
    const intercepts = calculateQuadraticIntercepts(value);
    const off = computeInterceptLabelOffset({
      axis: 'y',
      value,
      xIntercepts: intercepts.xIntercepts,
      yIntercept: intercepts.yIntercept
    });

    const labelText = layer.data.label || formatNumber(y);
    const labelX = px + (off.labelDx || 0);
    const labelY = py + (off.labelDy || 0);
    const textAlign = off.textAlign || 'right';
    const textBaseline = off.textBaseline || 'middle';

    return { labelText, labelX, labelY, textAlign, textBaseline };
  }

  /**
   * y축 절편 라벨 (일반)
   */
  function calculateYInterceptLabel(layer, y, px, py) {
    const segmentDx = layer.data.segmentDx;
    const labelText = layer.data.label || formatNumber(y);
    const labelY = py;
    let labelX, textAlign;

    if (typeof segmentDx === 'number') {
      if (segmentDx > 0) {
        // 선분이 오른쪽 → 라벨은 왼쪽
        labelX = px - 15;
        textAlign = 'right';
      } else if (segmentDx < 0) {
        // 선분이 왼쪽 → 라벨은 오른쪽
        labelX = px + 15;
        textAlign = 'left';
      } else {
        // 동점 특수 케이스: 기본 왼쪽
        labelX = px - 15;
        textAlign = 'right';
      }
    } else {
      // 메타데이터 없으면 기본 왼쪽
      labelX = px - 15;
      textAlign = 'right';
    }

    const textBaseline = 'middle';

    return { labelText, labelX, labelY, textAlign, textBaseline };
  }

  /**
   * 일반 점 라벨
   */
  function calculateGeneralPointLabel(label, x, y, px, py) {
    const labelText = label || `(${formatNumber(x)}, ${formatNumber(y)})`;
    const labelX = px + 10;
    const labelY = py - 10;
    const textAlign = 'left';
    const textBaseline = 'bottom';

    return { labelText, labelX, labelY, textAlign, textBaseline };
  }

  // ============================================================================
  // Point Renderer - 점 렌더링 렌더러
  // @version 3.0.0
  // ============================================================================


  /**
   * 점 렌더링
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {number} px - 픽셀 X 좌표
   * @param {number} py - 픽셀 Y 좌표
   * @param {number} size - 점 크기
   */
  function renderDot(ctx, px, py, size) {
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * 점 라벨 렌더링
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {string|Object} labelText - 라벨 텍스트 또는 좌표 객체
   * @param {number} labelX - 라벨 X 좌표
   * @param {number} labelY - 라벨 Y 좌표
   * @param {string} textAlign - 텍스트 정렬
   * @param {string} textBaseline - 텍스트 베이스라인
   * @param {Object} fontConfig - 폰트 설정
   * @param {Object} label - 원본 라벨 (객체 체크용)
   */
  function renderLabel$1(ctx, labelText, labelX, labelY, textAlign, textBaseline, fontConfig, label) {
    ctx.textAlign = textAlign;
    ctx.textBaseline = textBaseline;

    // label이 객체인 경우 (xLabel/yLabel이 있는 경우) 특수 렌더링
    if (typeof label === 'object' && label !== null && 'x' in label && 'y' in label) {
      renderCoordinateLabelWithMixedFont(ctx, label, labelX, labelY, fontConfig);
    } else {
      renderMixedFontText(ctx, labelText, labelX, labelY, fontConfig);
    }
  }

  // ============================================================================
  // Point Router - 점 렌더링 라우터
  // @version 3.0.0
  // ============================================================================


  /**
   * 점 렌더링 - 메인 진입점
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} layer - 레이어 객체
   * @param {Object} config - 좌표평면 상태
   * @param {number} canvasSize - 캔버스 크기
   * @param {number} progress - 애니메이션 진행도 (0~1) - 현재 미사용
   */
  function drawPoint(ctx, layer, config, canvasSize, progress) {
    const { x, y, showLabel, label, showDot } = layer.data;

    // 1. 픽셀 좌표 변환
    const px = coordToPixelX$1(x, config, canvasSize);
    const py = coordToPixelY$1(y, config, canvasSize);

    // 2. 자동 이름 설정
    autoSetPointName(layer, x, y);

    // 3. 스타일 설정 생성
    const style = createPointStyle(layer.data);

    ctx.save();

    // 4. 점 그리기 (showDot이 false가 아니면 그리기)
    if (showDot !== false) {
      applyColorOrGradient(ctx, style.color, config, canvasSize, 'fill');
      renderDot(ctx, px, py, style.size);
    }

    // 5. 라벨 그리기 (원점 제외)
    if (showLabel && !(x === 0 && y === 0)) {
      // 라벨 색상은 점 색상과 동일하게 설정
      ctx.fillStyle = style.color;

      // 폰트 설정 생성
      const fontConfig = createLabelFontConfig(layer.data, config);
      ctx.font = `${fontConfig.customSize}px ${fontConfig.customFamily}`;

      // 라벨 위치 계산
      const { labelText, labelX, labelY, textAlign, textBaseline } = calculateLabelPosition(
        layer, x, y, px, py
      );

      // 라벨 렌더링
      renderLabel$1(ctx, labelText, labelX, labelY, textAlign, textBaseline, fontConfig, label);
    }

    ctx.restore();
  }

  // ============================================================================
  // Polygon DTO - 다각형 스타일 설정
  // @version 3.0.0
  // ============================================================================


  /**
   * 다각형 스타일 설정 생성
   * @param {Object} data - 다각형 데이터
   * @returns {Object} 스타일 설정
   */
  function createPolygonStyle(data) {
    const {
      fillColor: rawFillColor,
      strokeColor: rawStrokeColor,
      strokeWidth: rawStrokeWidth
    } = data;

    const styleConfig = createStyleConfig();

    return {
      fillColor: rawFillColor && rawFillColor !== '#'
        ? rawFillColor
        : styleConfig.defaultColors.shapeArea,
      strokeColor: rawStrokeColor && rawStrokeColor !== '#'
        ? rawStrokeColor
        : styleConfig.defaultColors.shapeStoke,
      strokeWidth: rawStrokeWidth && rawStrokeWidth >= 0
        ? rawStrokeWidth
        : 0
    };
  }

  // ============================================================================
  // Polygon Utils - 다각형 유틸리티 함수
  // @version 3.0.0
  // ============================================================================


  /**
   * 다각형 검증
   * @param {Array} vertices - 꼭짓점 배열
   * @returns {boolean} 유효성 여부
   */
  function validatePolygonVertices(vertices) {
    if (!vertices || vertices.length < 3) {
      console.warn('Invalid polygon vertices');
      return false;
    }
    return true;
  }

  /**
   * 다각형 좌표 변환 및 바운드 계산
   * @param {Array} vertices - 꼭짓점 배열 [{x, y}, ...]
   * @param {Object} state - 상태
   * @param {number} canvasSize - 캔버스 크기
   * @returns {Object} {pixelPoints, bounds}
   */
  function transformPolygonCoordinates(vertices, config, canvasSize) {
    const pixelPoints = vertices.map(pt => ({
      x: coordToPixelX$1(pt.x, config, canvasSize),
      y: coordToPixelY$1(pt.y, config, canvasSize)
    }));

    const bounds = {
      minX: Math.min(...pixelPoints.map(p => p.x)),
      minY: Math.min(...pixelPoints.map(p => p.y)),
      maxX: Math.max(...pixelPoints.map(p => p.x)),
      maxY: Math.max(...pixelPoints.map(p => p.y))
    };

    return { pixelPoints, bounds };
  }

  // ============================================================================
  // Polygon Renderer - 다각형 렌더링 렌더러
  // @version 3.0.0
  // ============================================================================


  /**
   * 다각형 렌더링
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Array} pixelPoints - 픽셀 좌표 배열
   * @param {Object} style - 스타일 설정
   * @param {Object} bounds - 바운드 {minX, minY, maxX, maxY}
   * @param {Object} config - 상태
   * @param {number} canvasSize - 캔버스 크기
   */
  function renderPolygon(ctx, pixelPoints, style, bounds, config, canvasSize) {
    ctx.beginPath();
    pixelPoints.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.closePath();

    // Fill
    if (style.fillColor) {
      applyColorOrGradient(ctx, style.fillColor, config, canvasSize, 'fill', bounds);
      ctx.fill();
    }

    // Stroke
    if (style.strokeColor && style.strokeWidth > 0) {
      applyColorOrGradient(ctx, style.strokeColor, config, canvasSize, 'stroke', bounds);
      ctx.lineWidth = style.strokeWidth;
      ctx.stroke();
    }
  }

  // ============================================================================
  // Polygon Router - 다각형 렌더링 라우터
  // @version 3.0.0
  // ============================================================================


  /**
   * 다각형 렌더링 - 메인 진입점
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} data - 다각형 데이터 { vertices: [{x,y},...], fillColor, strokeColor, strokeWidth }
   * @param {Object} config - 상태
   * @param {number} canvasSize - 캔버스 크기
   */
  function drawPolygon(ctx, data, config, canvasSize) {
    const { vertices = [] } = data;

    // 1. 꼭짓점 검증
    if (!validatePolygonVertices(vertices)) {
      return;
    }

    // 2. 스타일 설정 생성
    const style = createPolygonStyle(data);

    // 3. 좌표 변환 및 바운드 계산
    const { pixelPoints, bounds } = transformPolygonCoordinates(vertices, config, canvasSize);

    // 4. 다각형 렌더링
    renderPolygon(ctx, pixelPoints, style, bounds, config, canvasSize);
  }

  // ============================================================================
  // Rectangle DTO - 사각형 스타일 설정
  // @version 3.0.0
  // ============================================================================


  /**
   * 사각형 스타일 설정 생성
   * @param {Object} data - 사각형 데이터
   * @returns {Object} 스타일 설정
   */
  function createRectangleStyle(data) {
    const {
      fillColor: rawFillColor,
      strokeColor: rawStrokeColor,
      strokeWidth: rawStrokeWidth
    } = data;

    const styleConfig = createStyleConfig();

    return {
      fillColor: rawFillColor && rawFillColor !== '#'
        ? rawFillColor
        : styleConfig.defaultColors.shapeArea,
      strokeColor: rawStrokeColor && rawStrokeColor !== '#'
        ? rawStrokeColor
        : styleConfig.defaultColors.shapeStoke,
      strokeWidth: rawStrokeWidth && rawStrokeWidth >= 0
        ? rawStrokeWidth
        : 0
    };
  }

  // ============================================================================
  // Rectangle Utils - 사각형 유틸리티 함수
  // @version 3.0.0
  // ============================================================================


  /**
   * 사각형 검증
   * @param {Array} vertices - 꼭짓점 배열
   * @returns {boolean} 유효성 여부
   */
  function validateRectangleVertices(vertices) {
    if (!vertices || vertices.length !== 4) {
      console.warn('Invalid rectangle vertices');
      return false;
    }
    return true;
  }

  /**
   * 사각형 좌표 변환 및 바운드 계산
   * @param {Array} vertices - 꼭짓점 배열 [{x, y}, ...]
   * @param {Object} state - 상태
   * @param {number} canvasSize - 캔버스 크기
   * @returns {Object} {pixelPoints, bounds}
   */
  function transformRectangleCoordinates(vertices, config, canvasSize) {
    const pixelPoints = vertices.map(pt => ({
      x: coordToPixelX$1(pt.x, config, canvasSize),
      y: coordToPixelY$1(pt.y, config, canvasSize)
    }));

    const bounds = {
      minX: Math.min(...pixelPoints.map(p => p.x)),
      minY: Math.min(...pixelPoints.map(p => p.y)),
      maxX: Math.max(...pixelPoints.map(p => p.x)),
      maxY: Math.max(...pixelPoints.map(p => p.y))
    };

    return { pixelPoints, bounds };
  }

  // ============================================================================
  // Rectangle Renderer - 사각형 렌더링 렌더러
  // @version 3.0.0
  // ============================================================================


  /**
   * 사각형 렌더링
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Array} pixelPoints - 픽셀 좌표 배열
   * @param {Object} style - 스타일 설정
   * @param {Object} bounds - 바운드 {minX, minY, maxX, maxY}
   * @param {Object} config - 상태
   * @param {number} canvasSize - 캔버스 크기
   */
  function renderRectangle(ctx, pixelPoints, style, bounds, config, canvasSize) {
    ctx.beginPath();
    pixelPoints.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.closePath();

    // Fill
    if (style.fillColor) {
      applyColorOrGradient(ctx, style.fillColor, config, canvasSize, 'fill', bounds);
      ctx.fill();
    }

    // Stroke
    if (style.strokeColor && style.strokeWidth > 0) {
      applyColorOrGradient(ctx, style.strokeColor, config, canvasSize, 'stroke', bounds);
      ctx.lineWidth = style.strokeWidth;
      ctx.stroke();
    }
  }

  // ============================================================================
  // Rectangle Router - 사각형 렌더링 라우터
  // @version 3.0.0
  // ============================================================================


  /**
   * 사각형 렌더링 - 메인 진입점
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} data - 사각형 데이터 { vertices: [{x,y},...], fillColor, strokeColor, strokeWidth }
   * @param {Object} config - 상태
   * @param {number} canvasSize - 캔버스 크기
   */
  function drawRectangle(ctx, data, config, canvasSize) {
    const { vertices } = data;

    // 1. 꼭짓점 검증
    if (!validateRectangleVertices(vertices)) {
      return;
    }

    // 2. 스타일 설정 생성
    const style = createRectangleStyle(data);

    // 3. 좌표 변환 및 바운드 계산
    const { pixelPoints, bounds } = transformRectangleCoordinates(vertices, config, canvasSize);

    // 4. 사각형 렌더링
    renderRectangle(ctx, pixelPoints, style, bounds, config, canvasSize);
  }

  // ============================================================================
  // Triangle DTO - 삼각형 스타일 설정
  // @version 3.0.0
  // ============================================================================


  /**
   * 삼각형 스타일 설정 생성
   * @param {Object} data - 삼각형 데이터
   * @returns {Object} 스타일 설정
   */
  function createTriangleStyle(data) {
    const {
      fillColor: rawFillColor,
      strokeColor: rawStrokeColor,
      strokeWidth: rawStrokeWidth
    } = data;

    const styleConfig = createStyleConfig();

    return {
      fillColor: rawFillColor && rawFillColor !== '#'
        ? rawFillColor
        : styleConfig.defaultColors.shapeArea,
      strokeColor: rawStrokeColor && rawStrokeColor !== '#'
        ? rawStrokeColor
        : styleConfig.defaultColors.shapeStoke,
      strokeWidth: rawStrokeWidth && rawStrokeWidth >= 0
        ? rawStrokeWidth
        : 0
    };
  }

  // ============================================================================
  // Triangle Utils - 삼각형 유틸리티 함수
  // @version 3.0.0
  // ============================================================================


  /**
   * 삼각형 꼭짓점 계산
   * @param {Object} data - 삼각형 데이터 { mode, vertices, p, func }
   * @returns {Array|null} 꼭짓점 배열 [{x, y}, ...] 또는 null
   */
  function calculateTriangleVertices(data) {
    const { mode, vertices, p, func } = data;

    if (mode === 'free' && vertices) {
      // 자유형: vertices 직접 사용
      return vertices;
    }

    if (mode === 'x-axis' && p && func) {
      // x축 기준: x절편 2개 + 꼭짓점 p
      const [a, b, c] = func.value;
      const discriminant = b * b - 4 * a * c;
      if (discriminant >= 0) {
        const x1 = (-b - Math.sqrt(discriminant)) / (2 * a);
        const x2 = (-b + Math.sqrt(discriminant)) / (2 * a);
        return [
          { x: x1, y: 0 },
          { x: x2, y: 0 },
          { x: p.x, y: p.y }
        ];
      }
    }

    if (mode === 'y-axis' && p && func) {
      // y축 기준: 꼭짓점 V + 원점 O + 이동점 p
      const [a, b, c] = func.value;

      // 꼭짓점 V 계산
      const vx = -b / (2 * a);
      const vy = a * vx * vx + b * vx + c;

      // 원점 O
      const origin = { x: 0, y: 0 };

      return [
        { x: vx, y: vy },      // 꼭짓점 V
        origin,                 // 원점 O
        { x: p.x, y: p.y }     // 이동점 p
      ];
    }

    return null;
  }

  /**
   * 삼각형 좌표 변환 및 바운드 계산
   * @param {Array} points - 꼭짓점 배열 [{x, y}, ...]
   * @param {Object} state - 상태
   * @param {number} canvasSize - 캔버스 크기
   * @returns {Object} {pixelPoints, bounds}
   */
  function transformTriangleCoordinates(points, config, canvasSize) {
    const pixelPoints = points.map(pt => ({
      x: coordToPixelX$1(pt.x, config, canvasSize),
      y: coordToPixelY$1(pt.y, config, canvasSize)
    }));

    const bounds = {
      minX: Math.min(...pixelPoints.map(p => p.x)),
      minY: Math.min(...pixelPoints.map(p => p.y)),
      maxX: Math.max(...pixelPoints.map(p => p.x)),
      maxY: Math.max(...pixelPoints.map(p => p.y))
    };

    return { pixelPoints, bounds };
  }

  // ============================================================================
  // Triangle Renderer - 삼각형 렌더링 렌더러
  // @version 3.0.0
  // ============================================================================


  /**
   * 삼각형 렌더링
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Array} pixelPoints - 픽셀 좌표 배열
   * @param {Object} style - 스타일 설정
   * @param {Object} bounds - 바운드 {minX, minY, maxX, maxY}
   * @param {Object} config - 상태
   * @param {number} canvasSize - 캔버스 크기
   */
  function renderTriangle(ctx, pixelPoints, style, bounds, config, canvasSize) {
    ctx.beginPath();
    pixelPoints.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.closePath();

    // Fill
    if (style.fillColor) {
      applyColorOrGradient(ctx, style.fillColor, config, canvasSize, 'fill', bounds);
      ctx.fill();
    }

    // Stroke
    if (style.strokeColor && style.strokeWidth > 0) {
      applyColorOrGradient(ctx, style.strokeColor, config, canvasSize, 'stroke', bounds);
      ctx.lineWidth = style.strokeWidth;
      ctx.stroke();
    }
  }

  // ============================================================================
  // Triangle Router - 삼각형 렌더링 라우터
  // @version 3.0.0
  // ============================================================================


  /**
   * 삼각형 렌더링 - 메인 진입점
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} data - 삼각형 데이터 { mode, vertices, p, func, fillColor, strokeColor, strokeWidth }
   * @param {Object} config - 상태
   * @param {number} canvasSize - 캔버스 크기
   */
  function drawTriangle(ctx, data, config, canvasSize) {
    // 1. 꼭짓점 계산
    const points = calculateTriangleVertices(data);

    if (!points || points.length !== 3) {
      return; // 유효한 삼각형이 아님
    }

    // 2. 스타일 설정 생성
    const style = createTriangleStyle(data);

    // 3. 좌표 변환 및 바운드 계산
    const { pixelPoints, bounds } = transformTriangleCoordinates(points, config, canvasSize);

    // 4. 삼각형 렌더링
    renderTriangle(ctx, pixelPoints, style, bounds, config, canvasSize);
  }

  // ============================================================================
  // Unfolded Cube DTO - 전개도 데이터 구조
  // @version 4.0.0
  // ============================================================================

  /**
   * 전개도 스타일 설정 생성
   * @param {Object} data - 레이어 데이터
   * @returns {Object} 전개도 스타일 설정
   */
  function createUnfoldedCubeStyle(data) {
    return {
      size: data.size || 60,
      position: data.position || { x: 0, y: 0 },
      faceColors: data.faceColors || {
        front: '#0096ff',   // 파랑 (1)
        top: '#FFEB3B',     // 노랑 (2)
        right: '#9C27B0',   // 보라 (3)
        left: '#FF9800',    // 주황 (4)
        bottom: '#ff3366',  // 빨강 (5)
        back: '#4CAF50'     // 초록 (6)
      },
      showLabels: data.showLabels !== false,
      labelColor: data.labelColor || '#ffffff',
      labelFont: data.labelFont || 'bold 16px Arial'
    };
  }

  /**
   * 전개도 검증
   * @param {Object} data - 레이어 데이터
   * @returns {boolean} 유효성
   */
  function validateUnfoldedCubeData(data) {
    if (!data) return false;
    if (data.size && (typeof data.size !== 'number' || data.size <= 0)) return false;
    if (data.faceColors && typeof data.faceColors !== 'object') return false;
    return true;
  }

  // ============================================================================
  // Unfolded Cube Renderer - 전개도 렌더링 로직
  // @version 4.0.0
  // ============================================================================

  /**
   * 전개도 렌더링 (십자형 레이아웃)
   *
   * 레이아웃:
   *       [top]
   * [left][front][right][back]
   *       [bottom]
   *
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} style - 스타일 설정
   * @param {number} canvasSize - 캔버스 크기
   */
  function renderUnfoldedCube(ctx, style, canvasSize) {
    const { size, position, faceColors, borderColor, borderWidth, showLabels, labelColor, labelFont } = style;

    ctx.save();

    // 중심점 계산
    const cx = canvasSize / 2 + position.x;
    const cy = canvasSize / 2 + position.y;

    // 전개도 레이아웃 정의
    const faces = [
      { name: 'front', x: cx, y: cy, color: faceColors.front, label: '1' },
      { name: 'top', x: cx, y: cy - size, color: faceColors.top, label: '2' },
      { name: 'bottom', x: cx, y: cy + size, color: faceColors.bottom, label: '5' },
      { name: 'left', x: cx - size, y: cy, color: faceColors.left, label: '4' },
      { name: 'right', x: cx + size, y: cy, color: faceColors.right, label: '3' },
      { name: 'back', x: cx + size * 2, y: cy, color: faceColors.back, label: '6' }
    ];

    // 각 면 그리기
    faces.forEach(face => {
      // 면 채우기
      ctx.fillStyle = face.color;
      ctx.fillRect(
        face.x - size / 2,
        face.y - size / 2,
        size,
        size
      );

      // 테두리
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth;
      ctx.strokeRect(
        face.x - size / 2,
        face.y - size / 2,
        size,
        size
      );

      // 레이블 (주사위 번호)
      if (showLabels) {
        ctx.fillStyle = labelColor;
        ctx.font = labelFont;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(face.label, face.x, face.y);
      }
    });

    ctx.restore();
  }

  /**
   * 전개도 그리기 (좌표계 변환 포함)
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} style - 스타일 설정
   * @param {Object} _config - 좌표평면 상태 (현재 미사용)
   * @param {number} canvasSize - 캔버스 크기
   */
  function renderUnfoldedCubeWithCoords(ctx, style, _config, canvasSize) {
    // 현재는 좌표평면 무시하고 캔버스 중심에 그리기
    // 향후 좌표계 변환 추가 가능
    renderUnfoldedCube(ctx, style, canvasSize);
  }

  // ============================================================================
  // Unfolded Cube Router - 전개도 그리기 진입점
  // @version 4.0.0
  // ============================================================================


  /**
   * 전개도 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} data - 레이어 데이터
   * @param {Object} config - 좌표평면 상태
   * @param {number} canvasSize - 캔버스 크기
   * @param {number} progress - 애니메이션 진행도 (0-1)
   */
  function drawUnfoldedCube(ctx, data, config, canvasSize, progress = 1) {
    // 데이터 검증
    if (!validateUnfoldedCubeData(data)) {
      console.warn('Invalid unfolded cube data:', data);
      return;
    }

    // 스타일 설정 생성
    const style = createUnfoldedCubeStyle(data);

    ctx.save();

    // 애니메이션 진행도 반영 (opacity)
    ctx.globalAlpha = progress;

    // 렌더링
    renderUnfoldedCubeWithCoords(ctx, style, config, canvasSize);

    ctx.restore();
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

  // ============================================================================
  // Constants - 전역 상수 정의
  // @version 4.0.0
  // ============================================================================

  // ============================================================================
  // Layer Types
  // ============================================================================

  /**
   * 레이어 타입 상수
   * @constant
   */
  const LAYER_TYPES = {
    GROUP: 'group',
    LINEAR: 'linear',
    QUADRATIC: 'quadratic',
    FUNCTION: 'function',
    POINT: 'point',
    LINE: 'line',
    SHAPE: 'shape',
    MEASUREMENT: 'measurement',
    LABEL: 'label'
  };

  // ============================================================================
  // Purpose Types (Adapter)
  // ============================================================================

  /**
   * Purpose 타입 상수 (어댑터용)
   * @constant
   */
  const PURPOSE_TYPES = {
    BASIC: 'basic',
    AREA: 'area',
    BRANCH: 'branch',
    MOVE: 'move',
    SHAPE: 'shape'
  };

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
      this.type = config.type || LAYER_TYPES.GROUP;
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
      if (recursive && this.type === LAYER_TYPES.GROUP && this.children.length > 0) {
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
  // Measurement Utilities - 측정 레이어 생성 헬퍼
  // ============================================================================


  /**
   * 다각형의 감김 방향(winding order) 계산
   * @param {Array<{x,y}>} vertices - 꼭짓점 배열
   * @returns {string} 'ccw' (반시계방향) 또는 'cw' (시계방향)
   */
  function getPolygonWindingOrder(vertices) {
    if (!vertices || vertices.length < 3) return 'ccw';

    // Shoelace formula로 넓이 부호 계산
    let area = 0;
    for (let i = 0; i < vertices.length; i++) {
      const j = (i + 1) % vertices.length;
      area += vertices[i].x * vertices[j].y;
      area -= vertices[j].x * vertices[i].y;
    }

    // Canvas 좌표계에서 area > 0이면 CCW, < 0이면 CW
    return area > 0 ? 'ccw' : 'cw';
  }

  /**
   * 삼각형의 변 길이 측정 레이어들을 생성
   * @param {Array<{x,y}>} vertices - 3개의 꼭짓점
   * @param {Object} options - 스타일 옵션
   * @returns {Layer[]} 측정 레이어 배열 (3개)
   */
  function createTriangleSideLengthLayers(vertices, options = {}) {
    if (!vertices || vertices.length !== 3) return [];

    const {
      lineColor = DEFAULT_LENGTH_STYLE.lineColor,
      lineWidth = DEFAULT_LENGTH_STYLE.lineWidth,
      lineStyle = DEFAULT_LENGTH_STYLE.lineStyle,
      labelFontSize = DEFAULT_LENGTH_STYLE.labelFontSize,
      labelColor = DEFAULT_LENGTH_STYLE.labelColor,
      labelBackground = DEFAULT_LENGTH_STYLE.labelBackground,
      decimalPlaces = DEFAULT_LENGTH_STYLE.decimalPlaces
    } = options;

    const layers = [];

    // 감김 방향 계산
    const windingOrder = getPolygonWindingOrder(vertices);

    // 변 AB, BC, CA
    const sides = [
      { from: vertices[0], to: vertices[1], name: 'AB' },
      { from: vertices[1], to: vertices[2], name: 'BC' },
      { from: vertices[2], to: vertices[0], name: 'CA' }
    ];

    sides.forEach((side) => {
      layers.push(new Layer({
        name: `변 ${side.name} 길이`,
        type: 'measurement',
        data: {
          measurementType: 'length',
          from: side.from,
          to: side.to,
          showLine: true, // 베지어 곡선 호 표시
          showLabel: true,
          windingOrder,  // 감김 방향 추가
          lineColor,
          lineWidth,
          lineStyle,
          labelFontSize,
          labelColor,
          labelBackground,
          decimalPlaces
        }
      }));
    });

    return layers;
  }

  /**
   * 삼각형의 각도 측정 레이어들을 생성
   * @param {Array<{x,y}>} vertices - 3개의 꼭짓점
   * @param {Object} options - 스타일 옵션
   * @returns {Layer[]} 측정 레이어 배열 (3개)
   */
  function createTriangleAngleLayers(vertices, options = {}) {
    if (!vertices || vertices.length !== 3) return [];

    const {
      lineColor = DEFAULT_ANGLE_STYLE.lineColor,
      lineWidth = DEFAULT_ANGLE_STYLE.lineWidth,
      arcColor = DEFAULT_ANGLE_STYLE.arcColor,
      arcWidth = DEFAULT_ANGLE_STYLE.arcWidth,
      arcRadius = DEFAULT_ANGLE_STYLE.arcRadius,
      labelFontSize = DEFAULT_ANGLE_STYLE.labelFontSize,
      labelColor = DEFAULT_ANGLE_STYLE.labelColor,
      labelBackground = DEFAULT_ANGLE_STYLE.labelBackground,
      angleUnit = DEFAULT_ANGLE_STYLE.angleUnit,
      decimalPlaces = DEFAULT_ANGLE_STYLE.decimalPlaces
    } = options;

    const layers = [];

    // 각 A, B, C
    const angles = [
      { vertex: vertices[0], point1: vertices[2], point2: vertices[1], name: 'A' },
      { vertex: vertices[1], point1: vertices[0], point2: vertices[2], name: 'B' },
      { vertex: vertices[2], point1: vertices[1], point2: vertices[0], name: 'C' }
    ];

    angles.forEach((angle, index) => {
      layers.push(new Layer({
        name: `각 ${angle.name}`,
        type: 'measurement',
        data: {
          measurementType: 'angle',
          vertex: angle.vertex,
          point1: angle.point1,
          point2: angle.point2,
          showLines: false, // 변은 이미 도형이 그리므로 숨김
          showArcs: true,
          showLabel: true,
          lineColor,
          lineWidth,
          arcColor,
          arcWidth,
          arcRadius,
          labelFontSize,
          labelColor,
          labelBackground,
          angleUnit,
          decimalPlaces
        }
      }));
    });

    return layers;
  }

  /**
   * 사각형의 변 길이 측정 레이어들을 생성
   * @param {Array<{x,y}>} vertices - 4개의 꼭짓점
   * @param {Object} options - 스타일 옵션
   * @returns {Layer[]} 측정 레이어 배열 (4개)
   */
  function createRectangleSideLengthLayers(vertices, options = {}) {
    if (!vertices || vertices.length !== 4) return [];

    const {
      lineColor = DEFAULT_LENGTH_STYLE.lineColor,
      lineWidth = DEFAULT_LENGTH_STYLE.lineWidth,
      lineStyle = DEFAULT_LENGTH_STYLE.lineStyle,
      labelFontSize = DEFAULT_LENGTH_STYLE.labelFontSize,
      labelColor = DEFAULT_LENGTH_STYLE.labelColor,
      labelBackground = DEFAULT_LENGTH_STYLE.labelBackground,
      decimalPlaces = DEFAULT_LENGTH_STYLE.decimalPlaces
    } = options;

    const layers = [];

    // 감김 방향 계산
    const windingOrder = getPolygonWindingOrder(vertices);

    for (let i = 0; i < 4; i++) {
      const from = vertices[i];
      const to = vertices[(i + 1) % 4];
      const sideName = String.fromCharCode(65 + i) + String.fromCharCode(65 + ((i + 1) % 4));

      layers.push(new Layer({
        name: `변 ${sideName} 길이`,
        type: 'measurement',
        data: {
          measurementType: 'length',
          from,
          to,
          showLine: true, // 베지어 곡선 호 표시
          showLabel: true,
          windingOrder,  // 감김 방향 추가
          lineColor,
          lineWidth,
          lineStyle,
          labelFontSize,
          labelColor,
          labelBackground,
          decimalPlaces
        }
      }));
    }

    return layers;
  }

  /**
   * 사각형의 각도 측정 레이어들을 생성
   * @param {Array<{x,y}>} vertices - 4개의 꼭짓점
   * @param {Object} options - 스타일 옵션
   * @returns {Layer[]} 측정 레이어 배열 (4개)
   */
  function createRectangleAngleLayers(vertices, options = {}) {
    if (!vertices || vertices.length !== 4) return [];

    const {
      lineColor = DEFAULT_ANGLE_STYLE.lineColor,
      lineWidth = DEFAULT_ANGLE_STYLE.lineWidth,
      arcColor = DEFAULT_ANGLE_STYLE.arcColor,
      arcWidth = DEFAULT_ANGLE_STYLE.arcWidth,
      arcRadius = DEFAULT_ANGLE_STYLE.arcRadius,
      labelFontSize = DEFAULT_ANGLE_STYLE.labelFontSize,
      labelColor = DEFAULT_ANGLE_STYLE.labelColor,
      labelBackground = DEFAULT_ANGLE_STYLE.labelBackground,
      angleUnit = DEFAULT_ANGLE_STYLE.angleUnit,
      decimalPlaces = DEFAULT_ANGLE_STYLE.decimalPlaces
    } = options;

    const layers = [];

    for (let i = 0; i < 4; i++) {
      const vertex = vertices[i];
      const point1 = vertices[(i - 1 + 4) % 4];
      const point2 = vertices[(i + 1) % 4];
      const angleName = String.fromCharCode(65 + i);

      layers.push(new Layer({
        name: `각 ${angleName}`,
        type: 'measurement',
        data: {
          measurementType: 'angle',
          vertex,
          point1,
          point2,
          showLines: false,
          showArcs: true,
          showLabel: true,
          lineColor,
          lineWidth,
          arcColor,
          arcWidth,
          arcRadius,
          labelFontSize,
          labelColor,
          labelBackground,
          angleUnit,
          decimalPlaces
        }
      }));
    }

    return layers;
  }

  /**
   * 다각형의 변 길이 측정 레이어들을 생성
   * @param {Array<{x,y}>} vertices - N개의 꼭짓점
   * @param {Object} options - 스타일 옵션
   * @returns {Layer[]} 측정 레이어 배열 (N개)
   */
  function createPolygonSideLengthLayers(vertices, options = {}) {
    if (!vertices || vertices.length < 3) return [];

    const {
      lineColor = DEFAULT_LENGTH_STYLE.lineColor,
      lineWidth = DEFAULT_LENGTH_STYLE.lineWidth,
      lineStyle = DEFAULT_LENGTH_STYLE.lineStyle,
      labelFontSize = DEFAULT_LENGTH_STYLE.labelFontSize,
      labelColor = DEFAULT_LENGTH_STYLE.labelColor,
      labelBackground = DEFAULT_LENGTH_STYLE.labelBackground,
      decimalPlaces = DEFAULT_LENGTH_STYLE.decimalPlaces
    } = options;

    const layers = [];

    // 감김 방향 계산
    const windingOrder = getPolygonWindingOrder(vertices);

    for (let i = 0; i < vertices.length; i++) {
      const from = vertices[i];
      const to = vertices[(i + 1) % vertices.length];

      layers.push(new Layer({
        name: `변 ${i + 1} 길이`,
        type: 'measurement',
        data: {
          measurementType: 'length',
          from,
          to,
          showLine: true, // 베지어 곡선 호 표시
          showLabel: true,
          windingOrder,  // 감김 방향 추가
          lineColor,
          lineWidth,
          lineStyle,
          labelFontSize,
          labelColor,
          labelBackground,
          decimalPlaces
        }
      }));
    }

    return layers;
  }

  /**
   * 다각형의 각도 측정 레이어들을 생성
   * @param {Array<{x,y}>} vertices - N개의 꼭짓점
   * @param {Object} options - 스타일 옵션
   * @returns {Layer[]} 측정 레이어 배열 (N개)
   */
  function createPolygonAngleLayers(vertices, options = {}) {
    if (!vertices || vertices.length < 3) return [];

    const {
      lineColor = DEFAULT_ANGLE_STYLE.lineColor,
      lineWidth = DEFAULT_ANGLE_STYLE.lineWidth,
      arcColor = DEFAULT_ANGLE_STYLE.arcColor,
      arcWidth = DEFAULT_ANGLE_STYLE.arcWidth,
      arcRadius = DEFAULT_ANGLE_STYLE.arcRadius,
      labelFontSize = DEFAULT_ANGLE_STYLE.labelFontSize,
      labelColor = DEFAULT_ANGLE_STYLE.labelColor,
      labelBackground = DEFAULT_ANGLE_STYLE.labelBackground,
      angleUnit = DEFAULT_ANGLE_STYLE.angleUnit,
      decimalPlaces = DEFAULT_ANGLE_STYLE.decimalPlaces
    } = options;

    const layers = [];

    for (let i = 0; i < vertices.length; i++) {
      const vertex = vertices[i];
      const point1 = vertices[(i - 1 + vertices.length) % vertices.length];
      const point2 = vertices[(i + 1) % vertices.length];

      layers.push(new Layer({
        name: `각 ${i + 1}`,
        type: 'measurement',
        data: {
          measurementType: 'angle',
          vertex,
          point1,
          point2,
          showLines: false,
          showArcs: true,
          showLabel: true,
          lineColor,
          lineWidth,
          arcColor,
          arcWidth,
          arcRadius,
          labelFontSize,
          labelColor,
          labelBackground,
          angleUnit,
          decimalPlaces
        }
      }));
    }

    return layers;
  }

  // ============================================================================
  // Fade Effect - 페이드 효과
  // @version 3.0.0
  // ============================================================================

  /**
   * 페이드 효과 적용
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
      case LAYER_TYPES.LINE:
      case LAYER_TYPES.LINEAR:
      case LAYER_TYPES.QUADRATIC:
      case LAYER_TYPES.FUNCTION:
        // 선(직선/수직선/수평선), 함수(선형/이차)는 draw 효과
        return 'draw';
      case LAYER_TYPES.POINT:
      case LAYER_TYPES.SHAPE:
      case LAYER_TYPES.MEASUREMENT:
      case LAYER_TYPES.LABEL:
        // 점, 도형, 측정, 라벨은 fade 효과
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
    if (layer && layer.type === LAYER_TYPES.LINE && (effect === 'draw' || (Array.isArray(effect) && effect.includes('draw')))) {
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

  // ============================================================================
  // Canvas Manager - 캔버스 설정 및 HiDPI 처리
  // @version 3.0.0
  // ============================================================================

  /**
   * 캔버스 설정 및 HiDPI 처리
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} config - 좌표평면 상태
   * @param {number} canvasSize - 캔버스 크기 (CSS 픽셀 기준)
   * @returns {{ dpr: number, contentSize: number }} DPR과 컨텐츠 크기
   */
  function setupCanvas(ctx, config, canvasSize) {
    const canvas = ctx.canvas;
    let dpr = 1;

    if (config.autoHiDPI) {
      // forceScale이 설정되어 있으면 그것을 사용, 없으면 devicePixelRatio 사용
      dpr = config.forceScale !== null ? config.forceScale : (window.devicePixelRatio || 1);

      // canvasSize를 CSS 크기로 사용
      const cssWidth = canvasSize;
      const cssHeight = canvasSize;

      // 이미 HiDPI가 적용되어 있는지 확인 (canvas 크기 체크)
      const isAlreadyScaled = canvas.width === cssWidth * dpr && canvas.height === cssHeight * dpr;

      // 이전 dpr 값을 저장하고 변경 감지
      const prevDpr = canvas._currentDpr || 1;
      const dprChanged = prevDpr !== dpr;

      if (!isAlreadyScaled || dprChanged) {
        // Canvas 물리적 크기 설정 (devicePixelRatio 배수)
        canvas.width = cssWidth * dpr;
        canvas.height = cssHeight * dpr;

        // CSS 크기는 원래대로 유지
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;

        // 현재 dpr 저장 (다음 프레임에서 변경 감지용)
        canvas._currentDpr = dpr;
      }

      // Context 스케일링은 항상 적용 (canvas.width 설정 시 context가 리셋되므로)
      // transform 상태를 체크하여 이미 적용되어 있는지 확인
      const transform = ctx.getTransform();
      const isScaled = transform.a === dpr && transform.d === dpr;

      if (!isScaled) {
        // 기존 transform을 리셋하고 새로운 scale 적용
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    } else {
      // autoHiDPI가 false일 때: canvas 물리적 크기와 CSS 크기를 동일하게 설정
      // 브라우저 zoom 변경을 감지하지 않고 고정 크기 사용
      const needsResize = canvas.width !== canvasSize || canvas.height !== canvasSize;

      // CSS 크기가 명시적으로 설정되지 않은 경우를 대비
      const cssWidth = canvas.style.width;
      const cssHeight = canvas.style.height;
      const needsCssUpdate = cssWidth !== `${canvasSize}px` || cssHeight !== `${canvasSize}px`;

      if (needsResize || needsCssUpdate) {
        // Canvas 물리적 크기 설정
        canvas.width = canvasSize;
        canvas.height = canvasSize;

        // CSS 크기를 명시적으로 설정 (중요!)
        canvas.style.width = `${canvasSize}px`;
        canvas.style.height = `${canvasSize}px`;

        // canvas.width 설정 시 context가 자동으로 리셋되므로 추가 작업 불필요
      } else {
        // canvas 크기가 변경되지 않았을 때만 transform 체크
        const transform = ctx.getTransform();
        const isIdentity = transform.a === 1 && transform.d === 1 &&
                          transform.b === 0 && transform.c === 0 &&
                          transform.e === 0 && transform.f === 0;

        if (!isIdentity) {
          // transform이 초기 상태가 아니면 리셋
          ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
      }
    }

    // 테두리가 있는 경우 패딩 계산
    const padding = config.borderEnabled ? config.borderWidth : 0;
    const contentSize = canvasSize - padding * 2;

    return { dpr, contentSize };
  }

  /**
   * 캔버스 초기화 (clearRect)
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {number} canvasSize - 캔버스 크기
   * @param {Object} animationState - 애니메이션 상태
   */
  function clearCanvas(ctx, canvasSize, animationState = null) {
    // animationState.skipClear가 true이면 clearRect 스킵
    if (!animationState || !animationState.skipClear) {
      ctx.clearRect(0, 0, canvasSize, canvasSize);
    }
  }

  /**
   * 테두리 패딩 적용
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} config - 좌표평면 상태
   */
  function applyPadding(ctx, config) {
    const padding = config.borderEnabled ? config.borderWidth : 0;
    if (padding > 0) {
      ctx.translate(padding, padding);
    }
  }

  // ============================================================================
  // Render Utils - 렌더링 헬퍼 함수들
  // @version 4.0.0
  // ============================================================================


  /**
   * 렌더링 가능한 레이어 추출 (재귀적)
   * @param {Layer[]} layers - 레이어 배열
   * @returns {Layer[]} 렌더링 가능한 레이어들 (group 제외, visible만)
   */
  function getRenderableLayers(layers) {
    const result = [];

    const traverse = (layer) => {
      if (layer.type === LAYER_TYPES.GROUP) {
        layer.children.forEach(traverse);
      } else if (layer.visible) {
        result.push(layer);
      }
    };

    layers.forEach(traverse);
    return result;
  }

  /**
   * 애니메이션 진행도 계산
   * @param {number} index - 레이어 인덱스
   * @param {number} total - 전체 레이어 개수
   * @param {number} globalProgress - 전역 진행도 (0-1)
   * @returns {number} 해당 레이어의 진행도 (0-1)
   */
  function calculateProgress$1(index, total, globalProgress) {
    const itemProgress = 1 / total;
    const start = index * itemProgress;
    const end = (index + 1) * itemProgress;

    if (globalProgress < start) return 0;
    if (globalProgress > end) return 1;

    return (globalProgress - start) / itemProgress;
  }

  /**
   * 레이어에서 함수, 점, 도형 정보 추출 (자동 좌표평면 설정용)
   *
   * 아키텍처: 레이어 시스템 기반 데이터 추출
   * - Point 레이어 → userPoints 배열로 변환
   * - Shape 레이어 → shapes 배열로 변환
   * - Function 레이어 → functions 배열로 변환
   *
   * @param {Layer[]} layers - 레이어 배열
   * @returns {{functions: Array, points: Array, shapes: Array}} 함수, 점, 도형 정보 객체
   */
  function extractFunctionsFromLayers(layers) {
    const functions = [];
    const points = []; // userPoints로 사용될 점 레이어 수집
    const shapes = []; // shapes로 사용될 도형 레이어 수집

    const traverse = (layer) => {
      if (layer.type === LAYER_TYPES.GROUP) {
        layer.children.forEach(traverse);
      } else if ((layer.type === LAYER_TYPES.LINEAR || layer.type === LAYER_TYPES.QUADRATIC) && layer.data) {
        // 레이어 데이터에서 함수 정보 추출
        const func = {
          value: layer.data.value,
          prop: layer.data.prop || {},
          name: layer.name, // 레이어 이름 포함 (디버깅용)
          id: layer.id // 레이어 ID 포함 (캐싱용)
        };
        functions.push(func);
      } else if (layer.type === LAYER_TYPES.POINT && layer.data) {
        // 점 레이어 정보 수집
        // pointType 필터링: custom, free 등만 userPoints에 포함
        // (x-axis, y-axis, intersection 등은 함수 기반이므로 제외 가능)
        const pointType = layer.data.pointType || 'custom';

        // 모든 점 타입을 포함하되, 타입 정보 유지
        points.push({
          x: layer.data.x,
          y: layer.data.y,
          pointType: pointType,
          layerId: layer.id, // 레이어 ID 추적
          layerName: layer.name // 레이어 이름 추적
        });
      } else if (layer.type === LAYER_TYPES.SHAPE && layer.data) {
        // 도형 레이어 정보 수집
        const shapeData = extractShapeVertices(layer.data, layer.id, layer.name);
        if (shapeData) {
          shapes.push(shapeData);
        }
      }
    };

    if (layers) {
      layers.forEach(traverse);
    }

    // 수집된 점들을 각 함수의 prop에 추가
    // 같은 그룹 내의 점들은 해당 그룹의 함수들과 연관
    if (points.length > 0) {
      functions.forEach(func => {
        if (!func.prop.points) {
          func.prop.points = [];
        }
        // 모든 점을 추가 (향후 그룹 관계에 따라 필터링 가능)
        points.forEach(point => {
          func.prop.points.push({
            x: point.x,
            y: point.y,
            pointType: point.pointType
          });
        });
      });

      // 함수가 없는 경우에도 점들만으로 처리하기 위해 빈 함수 추가
      if (functions.length === 0 && points.length > 0) {
        functions.push({
          value: [0, 0, 0], // 더미 값
          prop: {
            points: points.map(p => ({
              x: p.x,
              y: p.y,
              pointType: p.pointType
            }))
          }
        });
      }
    }

    return {
      functions,
      points, // userPoints로 사용됨
      shapes  // shapes로 사용됨
    };
  }

  /**
   * 도형 레이어에서 꼭짓점 추출 (shapes 배열용)
   *
   * 개선사항:
   * - Triangle x-axis/y-axis 모드 지원
   * - Circle 근사 점 개수 증가 (8 → 16)
   * - 레이어 메타데이터 추가 (디버깅용)
   *
   * @param {Object} data - 도형 레이어 data
   * @param {string} layerId - 레이어 ID
   * @param {string} layerName - 레이어 이름
   * @returns {{type: string, points: Array<{x: number, y: number}>, layerId?: string, layerName?: string}|null} 도형 정보
   */
  function extractShapeVertices(data, layerId, layerName) {
    const { shapeType } = data;

    const createShapeData = (type, points) => ({
      type,
      points,
      layerId,
      layerName
    });

    switch (shapeType) {
      case 'triangle':
        // free 모드: 직접 입력된 꼭짓점 사용
        if (data.mode === 'free' && data.vertices && data.vertices.length >= 3) {
          return createShapeData('triangle', data.vertices);
        }

        // x-axis 모드: 꼭짓점을 계산하여 사용
        // (triangle.utils.js에서 계산된 vertices가 data에 있다고 가정)
        if (data.mode === 'x-axis' && data.calculatedVertices && data.calculatedVertices.length >= 3) {
          return createShapeData('triangle', data.calculatedVertices);
        }

        // y-axis 모드: 꼭짓점을 계산하여 사용
        if (data.mode === 'y-axis' && data.calculatedVertices && data.calculatedVertices.length >= 3) {
          return createShapeData('triangle', data.calculatedVertices);
        }

        return null;

      case 'rectangle':
      case 'polygon':
        if (data.vertices && data.vertices.length > 0) {
          return createShapeData(shapeType, data.vertices);
        }
        return null;

      case 'circle':
        // 원을 16개 점으로 근사하여 bounding box 계산 (정확도 향상)
        if (data.cx !== undefined && data.cy !== undefined && data.r !== undefined) {
          const points = [];
          const numPoints = 16; // 8 → 16으로 증가
          for (let i = 0; i < numPoints; i++) {
            const angle = (i * Math.PI * 2) / numPoints;
            points.push({
              x: data.cx + data.r * Math.cos(angle),
              y: data.cy + data.r * Math.sin(angle)
            });
          }
          return createShapeData('circle', points);
        }
        return null;

      case 'integral':
        // 적분 영역의 4개 꼭짓점 계산 (bounding box용)
        if (data.func && data.direction && data.l1 && data.l2) {
          const shift = data.shift || 0;
          const polygon = calculatePolygonFromL1L2(data.func, data.direction, shift, data.l1, data.l2);

          if (polygon && polygon.length > 0) {
            // polygon에서 bounding box의 4개 꼭짓점만 추출
            const xs = polygon.map(p => p.x);
            const ys = polygon.map(p => p.y);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);

            const boundingBoxPoints = [
              { x: minX, y: minY },
              { x: maxX, y: minY },
              { x: maxX, y: maxY },
              { x: minX, y: maxY }
            ];

            return createShapeData('integral', boundingBoxPoints);
          }
        }
        return null;

      default:
        return null;
    }
  }

  /**
   * 렌더링 영역 제한 (clipping) 적용
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} config - 좌표평면 설정
   * @param {number} canvasSize - 캔버스 크기
   */
  function applyClipRegion(ctx, config, canvasSize) {
    const coordToPixelX = (x) => {
      const { xMin, xMax } = config;
      return ((x - xMin) / (xMax - xMin)) * canvasSize;
    };

    const coordToPixelY = (y) => {
      const { yMin, yMax } = config;
      return canvasSize - ((y - yMin) / (yMax - yMin)) * canvasSize;
    };

    const x1 = coordToPixelX(config.clipXMin);
    const y1 = coordToPixelY(config.clipYMax);
    const x2 = coordToPixelX(config.clipXMax);
    const y2 = coordToPixelY(config.clipYMin);

    const clipX = Math.max(0, Math.min(x1, canvasSize));
    const clipY = Math.max(0, Math.min(y1, canvasSize));
    const clipWidth = Math.min(x2, canvasSize) - clipX;
    const clipHeight = Math.min(y2, canvasSize) - clipY;

    ctx.beginPath();
    ctx.rect(clipX, clipY, clipWidth, clipHeight);
    ctx.clip();
  }

  // ============================================================================
  // Layer Renderer - 타입별 레이어 렌더링
  // @version 3.0.0
  // ============================================================================


  // ============================================================================
  // 타입별 렌더러 맵핑
  // ============================================================================

  /**
   * Layer 타입과 렌더러 함수명 매핑
   */
  const TYPE_RENDERERS = {
    'linear': 'renderFunction',
    'quadratic': 'renderFunction',
    'shape': 'renderShape',
    'point': 'renderPoint',
    'line': 'renderLine',
    'measurement': 'renderMeasurement',
    'label': 'renderLabel',
    '3d': 'render3D'
  };

  /**
   * Layer 타입별 렌더링 순서 (낮을수록 먼저 그려짐)
   */
  const TYPE_ORDER = {
    'shape': 0,
    'linear': 1,
    'quadratic': 1,
    '3d': 1,
    'line': 2,
    'point': 3,
    'measurement': 4,
    'label': 5
  };

  // ============================================================================
  // 타입별 렌더러 함수
  // ============================================================================

  /**
   * 함수 레이어 렌더링
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Layer} layer - 레이어
   * @param {Object} config - 좌표평면 상태
   * @param {number} canvasSize - 캔버스 크기
   * @param {number} progress - 애니메이션 진행도 (0-1)
   */
  function renderFunction(ctx, layer, config, canvasSize, progress) {
    drawFunction(ctx, layer, config, canvasSize);
  }

  /**
   * 도형 레이어 렌더링
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Layer} layer - 레이어
   * @param {Object} config - 좌표평면 상태
   * @param {number} canvasSize - 캔버스 크기
   * @param {number} progress - 애니메이션 진행도 (0-1)
   */
  function renderShape(ctx, layer, config, canvasSize, progress) {
    const { shapeType, color } = layer.data;

    ctx.save();
    ctx.fillStyle = color || 'rgba(255, 107, 107, 0.5)';
    ctx.globalAlpha = progress;

    switch (shapeType) {
      case 'triangle':
        drawTriangle(ctx, layer.data, config, canvasSize);
        break;
      case 'rectangle':
        drawRectangle(ctx, layer.data, config, canvasSize);
        break;
      case 'polygon':
        drawPolygon(ctx, layer.data, config, canvasSize);
        break;
      case 'circle':
        drawCircle(ctx, layer.data, config, canvasSize);
        break;
      case 'integral':
        drawIntegral(ctx, layer.data, config, canvasSize);
        break;
      case 'unfolded-cube':
        drawUnfoldedCube(ctx, layer.data, config, canvasSize, progress);
        break;
      default:
        console.warn(`Unknown shape type: ${shapeType}`);
    }

    ctx.restore();
  }

  /**
   * 점 레이어 렌더링
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Layer} layer - 레이어
   * @param {Object} config - 좌표평면 상태
   * @param {number} canvasSize - 캔버스 크기
   * @param {number} progress - 애니메이션 진행도 (0-1)
   */
  function renderPoint(ctx, layer, config, canvasSize, progress) {
    drawPoint(ctx, layer, config, canvasSize);
  }

  /**
   * 선 레이어 렌더링
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Layer} layer - 레이어
   * @param {Object} config - 좌표평면 상태
   * @param {number} canvasSize - 캔버스 크기
   * @param {number} progress - 애니메이션 진행도 (0-1)
   */
  function renderLine(ctx, layer, config, canvasSize, progress) {
    drawLine(ctx, layer, config, canvasSize);
  }

  /**
   * 측정 레이어 렌더링
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Layer} layer - 레이어
   * @param {Object} config - 좌표평면 상태
   * @param {number} canvasSize - 캔버스 크기
   * @param {number} progress - 애니메이션 진행도 (0-1)
   */
  function renderMeasurement(ctx, layer, config, canvasSize, progress) {
    ctx.save();
    ctx.globalAlpha = progress;
    drawMeasurement(ctx, layer.data, config, canvasSize);
    ctx.restore();
  }

  /**
   * 라벨 레이어 렌더링
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Layer} layer - 레이어
   * @param {Object} config - 좌표평면 상태
   * @param {number} canvasSize - 캔버스 크기
   * @param {number} progress - 애니메이션 진행도 (0-1)
   */
  function renderLabel(ctx, layer, config, canvasSize, progress) {
    drawLabel(ctx, layer, config, canvasSize, progress);
  }

  /**
   * 3D 레이어 렌더링
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트 (사용 안 함)
   * @param {Layer} layer - 레이어
   * @param {Object} config - 좌표평면 상태 (사용 안 함)
   * @param {number} canvasSize - 캔버스 크기 (사용 안 함)
   * @param {number} progress - 애니메이션 진행도 (0-1)
   */
  function render3D(ctx, layer, config, canvasSize, progress) {
    const { mode3DInstance, canvas3D, size, faceColors } = layer.data;

    if (!mode3DInstance || !canvas3D) {
      console.warn('3D layer missing mode3DInstance or canvas3D');
      return;
    }

    // Canvas3D는 항상 opacity=1 유지 (여러 3D 레이어 간 간섭 방지)
    // 개별 레이어 opacity는 material.opacity로 제어
    canvas3D.style.opacity = '1';

    // progress 기반 레이어 opacity 계산
    const layerOpacity = Math.max(0, Math.min(1, progress));

    // Pointer events 제어 (모든 3D 레이어가 투명하면 비활성화)
    // TODO: 여러 3D 레이어가 있을 경우 종합 판단 필요
    canvas3D.style.pointerEvents = layerOpacity > 0 ? 'auto' : 'none';

    // Mode3D 초기화 및 큐브 생성 (첫 렌더링 시)
    if (!mode3DInstance._cubeInitializedForLayer) {
      // Mode3D 씬이 없으면 초기화
      if (!mode3DInstance.scene) {
        mode3DInstance.init();
      }

      // Hex 색상을 Three.js 색상으로 변환
      const colors = convertFaceColorsToThree(faceColors);
      const cubeSize = size || 2;

      // 기존 큐브가 있다면 제거
      if (mode3DInstance.cubeGroup) {
        mode3DInstance.scene.remove(mode3DInstance.cubeGroup);
        mode3DInstance.cubeGroup = null;
        mode3DInstance.cubeFaces = [];
      }

      mode3DInstance.createUnfoldingCube(colors, cubeSize);

      // 초기 상태를 펼쳐진 상태(1)로 설정
      mode3DInstance.unfoldProgress = 1;
      mode3DInstance.updateCubeFolding(layerOpacity);

      mode3DInstance._cubeInitializedForLayer = true;

      console.log('3D 큐브 초기화 완료:', { colors, size: cubeSize, initialUnfoldProgress: 1 });
    }

    // unfoldProgress 제어 (opacity가 0이어도 상태는 업데이트해야 타임라인 되감기 시 초기 상태로 복귀)
    // progress 0→1: unfoldProgress 1→0 (펼쳐진 → 접힌)
    // 2D 전개도(펼쳐진 상태)에서 3D 큐브로 변환되면서 접히는 효과
    mode3DInstance.unfoldProgress = 1 - progress;
    mode3DInstance.updateCubeFolding(layerOpacity);
  }

  /**
   * Hex 색상을 Three.js 색상으로 변환
   * @param {Object} faceColors - 면 색상 객체
   * @returns {Object} Three.js 색상 객체
   */
  function convertFaceColorsToThree(faceColors) {
    if (!faceColors) return null;

    return {
      1: parseInt(faceColors.front?.replace('#', '0x') || '0xFFFFFF'),
      2: parseInt(faceColors.top?.replace('#', '0x') || '0xFFFFFF'),
      3: parseInt(faceColors.right?.replace('#', '0x') || '0xFFFFFF'),
      4: parseInt(faceColors.left?.replace('#', '0x') || '0xFFFFFF'),
      5: parseInt(faceColors.bottom?.replace('#', '0x') || '0xFFFFFF'),
      6: parseInt(faceColors.back?.replace('#', '0x') || '0xFFFFFF')
    };
  }

  /**
   * 레이어 타입에 맞는 렌더러 함수 가져오기
   * @param {string} layerType - 레이어 타입
   * @returns {Function|null} 렌더러 함수
   */
  function getRendererForType(layerType) {
    const rendererName = TYPE_RENDERERS[layerType];
    if (!rendererName) {
      return null;
    }

    switch (rendererName) {
      case 'renderFunction':
        return renderFunction;
      case 'renderShape':
        return renderShape;
      case 'renderPoint':
        return renderPoint;
      case 'renderLine':
        return renderLine;
      case 'renderMeasurement':
        return renderMeasurement;
      case 'renderLabel':
        return renderLabel;
      case 'render3D':
        return render3D;
      default:
        return null;
    }
  }

  /**
   * Layer List Renderer
   * 캔버스에 레이어 이름 목록을 표시하는 렌더러
   */


  /**
   * 레이어 목록을 캔버스에 렌더링
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Array} layers - 레이어 배열
   * @param {number} canvasSize - 캔버스 크기
   * @param {Object} options - 렌더링 옵션
   * @param {Object} config - 좌표평면 상태 (선택사항)
   */
  function drawLayerList(ctx, layers, canvasSize, options = {}, config = null) {
    if (!layers || layers.length === 0) return;

    // 그룹을 평탄화하여 개별 레이어만 추출 (점, 선분, 도형은 제외)
    const flattenLayers = (layers) => {
      const result = [];
      const traverse = (layer) => {
        if (layer.type === LAYER_TYPES.GROUP && layer.children) {
          layer.children.forEach(traverse);
        } else if (layer.visible && layer.data?.showEquation !== false && layer.type !== 'point' && layer.type !== 'shape') {
          // segment는 제외
          if (layer.type === LAYER_TYPES.LINE && layer.data?.lineType === 'segment') {
            return;
          }
          result.push(layer);
        }
      };
      layers.forEach(traverse);
      return result;
    };

    const visibleLayers = flattenLayers(layers);
    if (visibleLayers.length === 0) return;

    // 기본 옵션: state-style-config.js의 layerList 값을 기반으로 병합
    const layerListDefaults = getDefaultStyle('layerList') || {};
    const merged = { ...layerListDefaults, ...options };

    // 스케일 계산 (config에서 forceScale 또는 devicePixelRatio 가져오기)
    let canvasScale = 1;
    if (config && config.autoHiDPI) {
      canvasScale = config.forceScale !== null ? config.forceScale : (window.devicePixelRatio || 1);
    }

    const {
      fontSize,
      fontFamily,
      itemBackgroundColor,
      itemBorderColor,
      itemBorderWidth,
      itemBorderRadius,
      itemPadding,
      itemSpacing,
      padding,
      margin,
      maxWidth,
      position,
      showIcon = false // 아이콘 표시 여부 (기본값: false)
    } = merged;
    const lineHeight = fontSize + itemPadding * 2;

    // 높이 계산
    const totalHeight = visibleLayers.length * lineHeight + (visibleLayers.length - 1) * itemSpacing + padding * 2;

    // 텍스트 스타일 설정
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // 아이콘 관련 상수
    const iconSize = showIcon ? 24 : 0; // 아이콘 크기 (showIcon이 false면 0)
    const iconMargin = showIcon ? 8 : 0; // 아이콘과 텍스트 사이 간격 (showIcon이 false면 0)

    // 모든 레이어 이름의 실제 너비 측정 (수학 폰트 규칙 적용)
    const textWidths = visibleLayers.map(layer => {
      return measureTextWidthWithMathFont(ctx, layer.name, fontSize);
    });

    // 각 항목의 너비 계산 (텍스트 너비 + [아이콘] + 여백)
    const itemWidths = textWidths.map(textWidth => {
      const calculatedItemWidth = textWidth + iconSize + iconMargin + itemPadding * 2;
      const minItemWidth = iconSize + iconMargin + itemPadding * 2; // 최소 너비
      return Math.max(calculatedItemWidth, minItemWidth);
    });

    // 최대 항목 너비 계산 (위치 계산용)
    const maxItemWidth = Math.max(...itemWidths, 0);

    // 전체 너비 결정 (최대 항목 너비 + 패딩)
    const minWidth = iconSize + iconMargin + itemPadding * 2 + padding * 2;
    const calculatedWidth = maxItemWidth + padding * 2;
    const finalWidth = maxWidth ? Math.min(calculatedWidth, maxWidth) : calculatedWidth;
    const actualWidth = Math.max(finalWidth, minWidth);

    // 위치 재계산 (너비가 변경되었으므로)
    const pos = calculatePosition(position, canvasSize, margin, totalHeight, actualWidth);

    // 각 레이어 항목 그리기
    visibleLayers.forEach((layer, index) => {
      const itemY = pos.y + padding + index * (lineHeight + itemSpacing);
      const itemX = pos.x + padding;

      // 각 항목의 너비는 자신의 텍스트 너비에 맞춤
      const itemWidth = itemWidths[index];

      // 각 항목의 배경 (둥근 모서리 + 블러)
      ctx.save();
      drawRoundedRect(ctx, itemX, itemY, itemWidth, lineHeight, itemBorderRadius);
      ctx.fillStyle = itemBackgroundColor;
      ctx.fill();
      ctx.restore();

      // 블러 효과는 반투명 배경 자체에 적용되므로 추가 처리 불필요

      // 각 항목의 외곽선
      ctx.strokeStyle = itemBorderColor;
      ctx.lineWidth = itemBorderWidth;
      ctx.stroke();

      // 텍스트 Y 위치 (항목 중앙)
      const textY = itemY + lineHeight / 2;

      // 레이어 색상 추출 (그라디언트 또는 단색)
      const layerColor = extractLayerColor(layer);

      // 아이콘 그리기 (showIcon이 true일 때만)
      if (showIcon) {
        const iconX = itemX + itemPadding;
        const iconY = itemY + (lineHeight - iconSize) / 2;
        // shape 타입은 data.shapeType으로 실제 타입 확인
        const iconType = layer.type === LAYER_TYPES.SHAPE ? (layer.data?.shapeType || layer.type) : layer.type;
        drawLayerIcon(ctx, iconType, iconX, iconY, iconSize, layerColor, layer, canvasScale);
      }

      // 레이어 이름 표시 (그라디언트 적용)
      const textX = itemX + itemPadding + iconSize + iconMargin;
      const textWidth = textWidths[index];
      applyColorForText(ctx, layerColor, textX, textY, textWidth);

      // 함수식 폰트 규칙 적용 (소문자 알파벳: Italic, 나머지: Regular)
      drawTextWithMathFont(ctx, layer.name, textX, textY, fontSize);
    });
  }

  /**
   * 텍스트에 색상 또는 그라디언트 적용
   */
  function applyColorForText(ctx, colorOrGradient, x, y, width) {
    if (colorOrGradient && colorOrGradient.includes('gradient')) {
      const gradient = createGradient(
        ctx,
        colorOrGradient,
        x,
        y - 10,
        x + width,
        y + 10
      );
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = colorOrGradient;
    }
  }

  function drawLayerIcon(ctx, type, x, y, size, colorOrGradient, layer, canvasScale = 1) {
    ctx.save();
    switch (type) {
      case 'linear':
        drawLinearIcon(ctx, x, y, size, colorOrGradient, layer, canvasScale);
        break;
      case 'quadratic':
        drawQuadraticIcon(ctx, x, y, size, colorOrGradient, layer, canvasScale);
        break;
      case 'line':
        drawLineIcon(ctx, x, y, size, colorOrGradient, canvasScale);
        break;
      case 'point':
        drawPointIcon(ctx, x, y, size, colorOrGradient, canvasScale);
        break;
      case 'triangle':
        drawTriangleIcon(ctx, x, y, size, colorOrGradient, canvasScale);
        break;
      case 'rectangle':
        drawRectangleIcon(ctx, x, y, size, colorOrGradient, canvasScale);
        break;
      case 'integral':
        drawIntegralIcon(ctx, x, y, size, colorOrGradient, canvasScale);
        break;
      default:
        drawPointIcon(ctx, x, y, size, colorOrGradient, canvasScale);
        break;
    }
    ctx.restore();
  }

  // Helper functions for drawing layer icons
  function drawQuadraticIcon(ctx, x, y, size, colorOrGradient, layer, canvasScale = 1) {
    const vb = { x: 20.0234, y: 5.02832, w: 214.6546, h: 202.52668 };
    const pad = size * 0.1;
    const targetW = size - pad * 2;
    const targetH = size - pad * 2;
    const scale = Math.min(targetW / vb.w, targetH / vb.h);
    const offsetX = x + (size - vb.w * scale) / 2 - vb.x * scale;
    const offsetY = y + (size - vb.h * scale) / 2 - vb.y * scale;
    const a = Array.isArray(layer && layer.data && layer.data.value) ? (layer.data.value[0] || 0) : 0;
    const name = a < 0 ? 'quadratic_up' : 'quadratic_down';
    const path = getPath2D(name);
    if (!path) return;
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    if (colorOrGradient && colorOrGradient.includes('gradient')) {
      const gradient = createGradient(ctx, colorOrGradient, vb.x - 100, vb.y + vb.h - 100, vb.x, vb.y);
      ctx.strokeStyle = gradient;
    } else {
      const match = colorOrGradient && colorOrGradient.match ? colorOrGradient.match(/#[0-9A-Fa-f]{6}/) : null;
      ctx.strokeStyle = match ? match[0] : (colorOrGradient || '#5484F6');
    }
    ctx.lineWidth = (1.5 * canvasScale) / scale;
    ctx.lineCap = 'round';
    ctx.stroke(path);
    ctx.restore();
  }

  function drawLinearIcon(ctx, x, y, size, colorOrGradient, layer, canvasScale = 1) {
    let a = 0;
    if (layer && layer.data && Array.isArray(layer.data.value)) {
      a = layer.data.value.length === 3 ? (layer.data.value[1] || 0) : (layer.data.value[0] || 0);
    }
    const name = a >= 0 ? 'linear_left' : 'linear_right';
    const path = getPath2D(name);
    if (!path) return;
    const vb = { x: 0, y: 0, w: 246, h: 246 };
    const pad = size * 0.1;
    const targetW = size - pad * 2;
    const targetH = size - pad * 2;
    const scale = Math.min(targetW / vb.w, targetH / vb.h);
    const offsetX = x + (size - vb.w * scale) / 2 - vb.x * scale;
    const offsetY = y + (size - vb.h * scale) / 2 - vb.y * scale;
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    if (colorOrGradient && typeof colorOrGradient === 'string' && colorOrGradient.includes('gradient')) {
      const gradient = createGradient(ctx, colorOrGradient, vb.x, vb.y + vb.h, vb.x + vb.w, vb.y);
      ctx.strokeStyle = gradient;
    } else if (colorOrGradient && typeof colorOrGradient === 'string') {
      const match = colorOrGradient.match(/#[0-9A-Fa-f]{6}/);
      ctx.strokeStyle = match ? match[0] : colorOrGradient;
    } else {
      ctx.strokeStyle = colorOrGradient || '#5484F6';
    }
    ctx.lineWidth = (1.5 * canvasScale) / scale;
    ctx.lineCap = 'round';
    ctx.stroke(path);
    ctx.restore();
  }

  function drawLineIcon(ctx, x, y, size, colorOrGradient, canvasScale = 1) {
    ctx.beginPath();
    ctx.moveTo(x + size * 0.1, y + size * 0.8);
    ctx.lineTo(x + size * 0.9, y + size * 0.2);
    if (colorOrGradient && colorOrGradient.includes('gradient')) {
      ctx.strokeStyle = createGradient(ctx, colorOrGradient, x, y + size * 0.8, x + size, y + size * 0.2);
    } else {
      const match = colorOrGradient.match(/#[0-9A-Fa-f]{6}/);
      ctx.strokeStyle = match ? match[0] : colorOrGradient;
    }
    ctx.lineWidth = 1.5 / canvasScale;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  function drawPointIcon(ctx, x, y, size, colorOrGradient, canvasScale = 1) {
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const radius = size * 0.3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    if (colorOrGradient && colorOrGradient.includes('gradient')) {
      ctx.fillStyle = createGradient(ctx, colorOrGradient, centerX - radius, centerY - radius, centerX + radius, centerY + radius);
    } else {
      const match = colorOrGradient.match(/#[0-9A-Fa-f]{6}/);
      ctx.fillStyle = match ? match[0] : colorOrGradient;
    }
    ctx.fill();
  }

  function drawTriangleIcon(ctx, x, y, size, colorOrGradient, canvasScale = 1) {
    ctx.beginPath();
    ctx.moveTo(x + size / 2, y + size * 0.2);
    ctx.lineTo(x + size * 0.9, y + size * 0.8);
    ctx.lineTo(x + size * 0.1, y + size * 0.8);
    ctx.closePath();
    if (colorOrGradient && colorOrGradient.includes('gradient')) {
      ctx.strokeStyle = createGradient(ctx, colorOrGradient, x, y + size * 0.2, x + size, y + size * 0.8);
    } else {
      const match = colorOrGradient.match(/#[0-9A-Fa-f]{6}/);
      ctx.strokeStyle = match ? match[0] : colorOrGradient;
    }
    ctx.lineWidth = 2 / canvasScale;
    ctx.stroke();
  }

  function drawRectangleIcon(ctx, x, y, size, colorOrGradient, canvasScale = 1) {
    const margin = size * 0.15;
    ctx.beginPath();
    ctx.rect(x + margin, y + margin, size - margin * 2, size - margin * 2);
    if (colorOrGradient && colorOrGradient.includes('gradient')) {
      ctx.strokeStyle = createGradient(ctx, colorOrGradient, x + margin, y + margin, x + size - margin, y + size - margin);
    } else {
      const match = colorOrGradient.match(/#[0-9A-Fa-f]{6}/);
      ctx.strokeStyle = match ? match[0] : colorOrGradient;
    }
    ctx.lineWidth = 2 / canvasScale;
    ctx.stroke();
  }

  function drawIntegralIcon(ctx, x, y, size, colorOrGradient, canvasScale = 1) {
    const margin = size * 0.15;
    ctx.beginPath();
    ctx.rect(x + margin, y + margin, size - margin * 2, size - margin * 2);
    let fillColor, strokeColor;
    if (colorOrGradient && colorOrGradient.includes('gradient')) {
      const gradient = createGradient(ctx, colorOrGradient, x + margin, y + margin, x + size - margin, y + size - margin);
      fillColor = gradient;
      strokeColor = gradient;
    } else {
      const match = colorOrGradient.match(/#[0-9A-Fa-f]{6}/);
      const baseColor = match ? match[0] : colorOrGradient;
      fillColor = baseColor + '40';
      strokeColor = baseColor;
    }
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2 / canvasScale;
    ctx.stroke();
  }

  function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
  }

  function calculatePosition(position, canvasSize, margin, totalHeight, maxWidth) {
    let x, y;
    switch (position) {
      case 'top-left':
        x = margin;
        y = margin;
        break;
      case 'top-right':
        x = canvasSize - maxWidth - margin;
        y = margin;
        break;
      case 'bottom-right':
        x = canvasSize - maxWidth - margin;
        y = canvasSize - totalHeight - margin;
        break;
      case 'bottom-left':
      default:
        x = margin;
        y = canvasSize - totalHeight - margin;
        break;
    }
    return { x, y };
  }

  function extractLayerColor(layer) {
    const defaultColor = '#5484F6';
    if (layer.type === LAYER_TYPES.GROUP && layer.children && layer.children.length > 0) {
      const firstChild = layer.children[0];
      if (firstChild.data) {
        if (firstChild.data.color) return firstChild.data.color;
        if (firstChild.data.fillColor) return firstChild.data.fillColor;
      }
    }
    if (!layer.data) return defaultColor;
    if (Array.isArray(layer.data)) {
      if (layer.data.length > 0) {
        const firstItem = layer.data[0];
        if (firstItem.color) return firstItem.color;
        if (firstItem.fillColor) return firstItem.fillColor;
      }
      return defaultColor;
    }
    if (layer.data.color) return layer.data.color;
    if (layer.data.fillColor) return layer.data.fillColor;
    if (layer.style) {
      if (layer.style.gradient) return layer.style.gradient;
      if (layer.style.fillColor) return layer.style.fillColor;
      if (layer.style.stroke) return layer.style.stroke;
      if (layer.style.fill) return layer.style.fill;
    }
    return defaultColor;
  }

  /**
   * 수학 폰트 규칙을 적용한 텍스트 너비 측정 (실제로는 그리지 않음)
   */
  function measureTextWidthWithMathFont(ctx, text, fontSize) {
    text = text.replace(/-/g, '−');
    text = text.replace(/([^\s⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿ])([⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿ])/g, '$1 $2');
    let totalWidth = 0;
    let i = 0;
    while (i < text.length) {
      const char = text[i];
      if (/[a-z]/.test(char)) {
        let alphabetGroup = '';
        while (i < text.length && /[a-z]/.test(text[i])) {
          alphabetGroup += text[i];
          i++;
        }
        ctx.font = `italic ${fontSize}px "KaTeX_Math", "Times New Roman", serif`;
        totalWidth += ctx.measureText(alphabetGroup).width;
      } else {
        ctx.font = `normal ${fontSize}px "KaTeX_Main", "Times New Roman", serif`;
        totalWidth += ctx.measureText(char).width;
        i++;
      }
    }
    return totalWidth;
  }

  function drawTextWithMathFont(ctx, text, x, y, fontSize) {
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    text = text.replace(/-/g, '−');
    text = text.replace(/([^\s⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿ])([⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿ])/g, '$1 $2');
    let currentX = x;
    let i = 0;
    while (i < text.length) {
      const char = text[i];
      if (/[a-z]/.test(char)) {
        let alphabetGroup = '';
        while (i < text.length && /[a-z]/.test(text[i])) {
          alphabetGroup += text[i];
          i++;
        }
        ctx.font = `italic ${fontSize}px "KaTeX_Math", "Times New Roman", serif`;
        ctx.fillText(alphabetGroup, currentX, y);
        currentX += ctx.measureText(alphabetGroup).width;
      } else {
        ctx.font = `normal ${fontSize}px "KaTeX_Main", "Times New Roman", serif`;
        ctx.fillText(char, currentX, y);
        currentX += ctx.measureText(char).width;
        i++;
      }
    }
  }

  // ============================================================================
  // Layer Service - 레이어 비즈니스 로직
  // ============================================================================


  /**
   * 레이어를 JSON으로 직렬화
   * @param {Layer} layer - 직렬화할 레이어
   * @returns {Object} JSON 객체
   */
  function serializeLayer(layer) {
    // data에서 _로 시작하는 내부 전용 속성 제외
    let serializedData = layer.data;
    if (layer.data && typeof layer.data === 'object') {
      serializedData = Object.keys(layer.data)
        .filter(key => !key.startsWith('_'))
        .reduce((obj, key) => {
          obj[key] = layer.data[key];
          return obj;
        }, {});
    }

    return {
      id: layer.id,
      name: layer.name,
      type: layer.type,
      visible: layer.visible,
      order: layer.order,
      p_id: layer.p_id,
      children: layer.children.map(child => serializeLayer(child)),
      data: serializedData
    };
  }

  /**
   * 함수 레이어에 자동으로 라벨 레이어 추가
   * @param {Layer} rootLayer - 루트 레이어 (재귀적으로 탐색)
   * @returns {{ count: number, labels: Layer[], updated: number }} 추가된 라벨 개수, 라벨 배열, 업데이트된 라벨 개수
   */
  function ensureFunctionLabels(rootLayer) {
    const addedLabels = [];
    let updatedCount = 0;

    // 함수 타입 체크
    const isFunctionType = (type) => type === 'quadratic' || type === 'linear' || type === 'function';

    // 최상위 레이어가 함수 레이어 자체인 경우 (그룹 없이 단일 함수)
    if (isFunctionType(rootLayer.type) && rootLayer.data && rootLayer.data.value) {
      return { count: 0, labels: [] };
    }

    // 그룹 레이어를 순회하면서 함수 레이어 찾기
    const processGroup = (group) => {
      if (!group || !group.children) return;

      group.children.forEach(child => {
        if (isFunctionType(child.type) && child.data && child.data.value) {
          // 이 함수에 대한 라벨이 이미 있는지 확인 (함수 레이어 ID 기반)
          const existingLabel = group.children.find(c =>
            c.type === 'label' && c.data && c.data._functionLayerId === child.id
          );

          if (existingLabel) {
            // 기존 라벨 업데이트 (함수 식이 변경되었을 수 있음)
            const functionName = child.name || formatFunctionEquation(child.data.value);
            existingLabel.name = `라벨: ${functionName}`;
            existingLabel.data.text = functionName;
            existingLabel.data.color = child.data.color || '#5484F6';
            updatedCount++;
            // 업데이트된 라벨도 반환 (UI 갱신용)
            addedLabels.push({ label: existingLabel, parent: group, updated: true });
          } else {
            // 새 라벨 생성
            const functionName = child.name || formatFunctionEquation(child.data.value);
            const labelLayer = new Layer({
              name: `라벨: ${functionName}`,
              type: 'label',
              order: group.children.length, // 마지막에 추가
              data: {
                text: functionName,
                color: child.data.color || '#5484F6',
                _functionLayerId: child.id  // 함수 레이어 ID 저장 (중복 방지용)
                // fontSize, showDot, offsetFromCurve 등은 생략
                // → createLabelStyle()이 DEFAULT_LABEL_STYLE과 coordConfig.equationLabelStyle을 사용
              }
            });

            group.addChild(labelLayer);
            addedLabels.push({ label: labelLayer, parent: group });
          }
        }

        // 중첩된 그룹 재귀 처리
        if (child.type === 'group') {
          processGroup(child);
        }
      });
    };

    // 최상위가 그룹이면 처리
    if (rootLayer.type === 'group') {
      processGroup(rootLayer);
    }

    return {
      count: addedLabels.filter(item => !item.updated).length,  // 새로 추가된 라벨만 카운트
      labels: addedLabels,
      updated: updatedCount
    };
  }

  // ============================================================================
  // Renderer - Layer 기반 렌더링 메인 함수
  // @version 3.0.0
  // ============================================================================


  // ============================================================================
  // 내부 상태 (디버깅용)
  // ============================================================================

  // 이전 타임라인 상태 저장 (로그 중복 방지)
  let prevTimelineState = null;

  // ============================================================================
  // 공개 API
  // ============================================================================

  /**
   * 레이어 배열 렌더링
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Layer[]} layers - 렌더링할 레이어 배열
   * @param {Object} config - 좌표평면 설정
   * @param {number} canvasSize - 캔버스 크기 (CSS 픽셀 기준)
   * @param {Object} animationState - 애니메이션 상태 (선택사항)
   */
  function render(ctx, layers, config, canvasSize, animationState = null) {
    // layers가 없어도 좌표평면은 그려야 함 (웹에서만)
    if (!layers) {
      layers = [];
    }

    // 0. 좌표 전환 애니메이션 업데이트
    updateCoordinateTransition(config, performance.now());

    // 1. Canvas 크기 및 HiDPI 처리
    const { contentSize } = setupCanvas(ctx, config, canvasSize);

    // 2. 캔버스 초기화 (CSS 픽셀 기준 - scale 적용 상태에서 동작)
    clearCanvas(ctx, canvasSize, animationState);

    // 3. 좌표평면 자동 그리기 (config.autoDrawPlane이 true이면)
    if (config.autoDrawPlane !== false && drawCoordinatePlane) {
      // 좌표 계산용 레이어: 항상 전체 레이어 사용 (애니메이션 상태 무관)
      // 이유: 애니메이션 첫 프레임에도 모든 요소를 포함한 좌표 범위가 필요
      const layersForCoordinate = layers;

      // 타임라인 기반 레이어 필터링 (옵션 활성화 시) - 좌표 계산에는 사용 안 함
      if (config.autoCoordinateFromTimeline && animationState?.activeAnimations) {
        // Active + Completed 레이어만 추출 (Pending 제외)
        new Set(
          animationState.activeAnimations
            .filter(anim => anim.status !== 'pending')
            .map(anim => anim.layerId)
        );
        // 주의: layersForCoordinate는 변경하지 않음 (항상 전체 레이어 사용)
        // const filteredLayers = filterLayersByTimeline(layers, activeLayerIds);

        // 디버깅 로그: 상태가 변경되었을 때만 출력
        const currentState = {
          pending: animationState.activeAnimations.filter(a => a.status === 'pending').map(a => a.layerId).sort(),
          active: animationState.activeAnimations.filter(a => a.status === 'active').map(a => a.layerId).sort(),
          completed: animationState.activeAnimations.filter(a => a.status === 'completed').map(a => a.layerId).sort()
        };

        const stateChanged = !prevTimelineState ||
          JSON.stringify(prevTimelineState) !== JSON.stringify(currentState);

        if (stateChanged) {
          prevTimelineState = currentState;
        }
      }

      // layers에서 함수, 점, 도형 정보 추출하여 options에 전달
      const extractionResult = extractFunctionsFromLayers(layersForCoordinate);

      const options = {
        autoCoordinate: config.autoSetCoordinatePlane !== false, // config.autoSetCoordinatePlane 사용 (기본값 true)
        functions: extractionResult.functions,
        userPoints: extractionResult.points,
        shapes: extractionResult.shapes,
        skipAutoCoordinate: animationState?.skipAutoCoordinate === true // 타임라인 드래그 중 스킵
      };
      drawCoordinatePlane(ctx, config, canvasSize, options);
    }

    ctx.save();

    // 4. 테두리 패딩만큼 이동
    applyPadding(ctx, config);

    // 5. 렌더링 영역 제한 (clipping) 적용
    if (config.clipEnabled) {
      applyClipRegion(ctx, config, contentSize);
    }

    // 6. 라벨 위치 저장소 초기화 (매 프레임마다 초기화하여 충돌 회피 재계산)
    clearLabelPositions();

    // 6-1. 전체 레이어 배열 설정 (라벨이 부모 데이터 참조용)
    setAllLayers(layers);

    // 6-2. 모든 함수 레이어에 자동으로 라벨 추가 (없는 경우)
    if (layers && layers.length > 0) {
      layers.forEach(layer => ensureFunctionLabels(layer));
    }

    // 7. 렌더링 가능한 레이어만 추출 (group 제외, visible만)
    const renderableLayers = getRenderableLayers(layers);

    // 8. 렌더링 순서 정렬
    renderableLayers.sort((a, b) => {
      const typeA = TYPE_ORDER[a.type] ?? 999;
      const typeB = TYPE_ORDER[b.type] ?? 999;

      if (typeA !== typeB) {
        return typeA - typeB;
      }
      return a.order - b.order;
    });

    // 9. coordConfig 유효성 체크
    const hasValidCoordinates = isFinite(config.xMin) && isFinite(config.xMax) &&
                                 isFinite(config.yMin) && isFinite(config.yMax);

    // 10. 각 레이어 렌더링
    renderableLayers.forEach((layer, index) => {
      if (!layer.visible) return;

      // 좌표가 유효하지 않으면 레이어 렌더링 건너뛰기 (전환 중)
      if (!hasValidCoordinates) {
        return;
      }

      const rendererFn = getRendererForType(layer.type);
      if (rendererFn) {
        // 애니메이션 진행도 및 효과 가져오기
        const animInfo = getAnimationInfo(layer, index, renderableLayers.length, animationState);

        // 애니메이션 효과 적용하여 렌더링
        if (animInfo.effect !== 'none') {
          LayerAnimationEffects.applyWithLayer(ctx, layer, animInfo.progress, animInfo.effect, animInfo.effectOptions, () => {
            rendererFn(ctx, layer, config, contentSize, animInfo.progress);
          });
        } else {
          rendererFn(ctx, layer, config, contentSize, animInfo.progress);
        }
      } else {
        console.warn(`No renderer for layer type: ${layer.type}`);
      }
    });

    // 10. 함수 라벨은 프리셋에서 showEquationLabel: true로 자동 생성됨
    // drawAllFunctionLabels() 호출 제거: 프리셋 기반 라벨 생성으로 중복 방지

    ctx.restore();
  }

  // ============================================================================
  // 내부 헬퍼 함수
  // ============================================================================

  /**
   * 애니메이션 정보 추출
   * @param {Layer} layer - 레이어
   * @param {number} index - 레이어 인덱스
   * @param {number} total - 전체 레이어 개수
   * @param {Object} animationState - 애니메이션 상태
   * @returns {{ progress: number, effect: string, effectOptions: Object }}
   */
  function getAnimationInfo(layer, index, total, animationState) {
    let progress = 1;
    let effect = 'none';
    let effectOptions = {};

    if (animationState) {
      if (animationState.enabled) {
        // 전역 애니메이션 모드
        progress = calculateProgress$1(index, total, animationState.progress);
      } else if (animationState.activeAnimations) {
        // 개별 레이어 애니메이션 모드
        const layerAnim = animationState.activeAnimations.find(a => a.layerId === layer.id);
        if (layerAnim) {
          progress = layerAnim.progress;
          effect = layerAnim.effect;
          effectOptions = layerAnim.effectOptions;
        }
      }
    }

    return { progress, effect, effectOptions };
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
      }

      notifyUpdate(this);

      if (this.isPlaying) {
        requestAnimationFrame(() => this._animate());
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
  // Intercept Utils - 절편 레이어 생성 유틸리티
  // @version 3.0.0
  // ============================================================================


  /**
   * 절편 레이어 생성
   * @param {Array} value - 함수 계수 [a, b, c]
   * @param {Object} options - 옵션
   * @returns {Layer[]} 생성된 절편 레이어 배열
   */
  function createInterceptLayers(value, options = {}) {
    const {
      showXIntercepts = true,
      showYIntercept = true,
      showInterceptDots = true,
      color = '#F3EF70',
      size = 6
    } = options;

    const layers = [];
    const intercepts = calculateQuadraticIntercepts(value);

    // X절편 레이어 생성
    if (showXIntercepts && intercepts.xIntercepts.length > 0) {
      intercepts.xIntercepts.forEach((x) => {
        const offsetData = computeInterceptLabelOffset({
          axis: 'x',
          value: value,
          xIntercepts: intercepts.xIntercepts,
          yIntercept: intercepts.yIntercept,
          currentX: x
        });

        layers.push(new Layer({
          name: `${formatNumber(x)}`,
          type: 'point',
          data: {
            pointType: 'dot',
            x: x,
            y: 0,
            color: color,
            size: size,
            showLabel: true,
            showDot: showInterceptDots,
            _interceptLayer: true,
            ...offsetData
          }
        }));
      });
    }

    // Y절편 레이어 생성
    if (showYIntercept && intercepts.yIntercept !== null) {
      const offsetData = computeInterceptLabelOffset({
        axis: 'y',
        value: value,
        xIntercepts: intercepts.xIntercepts,
        yIntercept: intercepts.yIntercept
      });

      layers.push(new Layer({
        name: `${formatNumber(intercepts.yIntercept)}`,
        type: 'point',
        data: {
          pointType: 'dot',
          x: 0,
          y: intercepts.yIntercept,
          color: color,
          size: size,
          showLabel: true,
          showDot: showInterceptDots,
          _interceptLayer: true,
          ...offsetData
        }
      }));
    }

    return layers;
  }

  // ============================================================================
  // Vertex Dot Layer Utilities
  // ============================================================================


  /**
   * 도형의 꼭짓점에 점 레이어들을 생성합니다.
   *
   * @param {string} shapeType - 'triangle' | 'rectangle' | 'polygon'
   * @param {Array<{x: number, y: number}>} vertices - 꼭짓점 좌표 배열
   * @param {Object} options - 옵션
   * @param {string} options.color - 점 색상 (기본값: '#F3EF70')
   * @param {number} options.size - 점 크기 (기본값: 6)
   * @param {boolean} options.showLabel - 라벨 표시 여부 (기본값: false)
   * @returns {Layer[]} - 생성된 점 레이어 배열
   */
  function createVertexDotLayers(shapeType, vertices, options = {}) {
    const {
      color = '#F3EF70',
      size = 6,
      showLabel = false
    } = options;

    if (!vertices || vertices.length === 0) {
      return [];
    }

    const layers = [];
    const alphabet = getAlphabetByShapeType(shapeType, vertices.length);

    // 도형의 중심점 계산 (라벨을 바깥쪽에 배치하기 위해)
    const centroid = calculateCentroid(vertices);

    vertices.forEach((vertex, index) => {
      const label = alphabet[index] || `P${index + 1}`;

      // 중심점에서 바깥쪽으로 라벨 오프셋 계산
      const labelOffset = calculateLabelOffset(vertex, centroid);

      layers.push(new Layer({
        name: label,
        type: 'point',
        data: {
          pointType: 'dot',
          x: vertex.x,
          y: vertex.y,
          color: color,
          size: size,
          showLabel: showLabel,
          showDot: true,
          label: label,  // name과 동일하게 항상 설정
          labelDx: labelOffset.labelDx,  // 도형 바깥쪽 오프셋
          labelDy: labelOffset.labelDy,
          textAlign: labelOffset.textAlign,
          textBaseline: labelOffset.textBaseline,
          _vertexDotLayer: true  // 꼭짓점 점 레이어임을 식별하는 플래그
        }
      }));
    });

    return layers;
  }

  /**
   * 도형 타입에 따른 알파벳 배열 반환
   * @param {string} shapeType
   * @param {number} vertexCount
   * @returns {string[]}
   */
  function getAlphabetByShapeType(shapeType, vertexCount) {
    const fullAlphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

    switch (shapeType) {
      case 'triangle':
        return fullAlphabet.slice(0, 3); // A, B, C
      case 'rectangle':
        return fullAlphabet.slice(0, 4); // A, B, C, D
      case 'polygon':
        return fullAlphabet.slice(0, Math.min(vertexCount, 12));
      default:
        return fullAlphabet.slice(0, vertexCount);
    }
  }

  /**
   * 도형의 중심점(centroid) 계산
   * @param {Array<{x: number, y: number}>} vertices - 꼭짓점 좌표 배열
   * @returns {{x: number, y: number}} - 중심점 좌표
   */
  function calculateCentroid(vertices) {
    const sumX = vertices.reduce((sum, v) => sum + v.x, 0);
    const sumY = vertices.reduce((sum, v) => sum + v.y, 0);
    return {
      x: sumX / vertices.length,
      y: sumY / vertices.length
    };
  }

  /**
   * 중심점에서 바깥쪽으로 라벨 오프셋 계산
   * @param {{x: number, y: number}} vertex - 꼭짓점 좌표
   * @param {{x: number, y: number}} centroid - 도형 중심점
   * @param {number} offsetDistance - 오프셋 거리 (기본값: 18)
   * @returns {{labelDx: number, labelDy: number, textAlign: string, textBaseline: string}}
   */
  function calculateLabelOffset(vertex, centroid, offsetDistance = 18) {
    // 중심→꼭짓점 방향 벡터 계산
    const dx = vertex.x - centroid.x;
    const dy = vertex.y - centroid.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    // 중심과 꼭짓점이 같은 경우 (단일 점) - 위쪽에 배치
    if (length === 0) {
      return {
        labelDx: 0,
        labelDy: -offsetDistance,
        textAlign: 'center',
        textBaseline: 'bottom'
      };
    }

    // 정규화된 방향 벡터
    const normalizedX = dx / length;
    const normalizedY = dy / length;

    // 바깥쪽 오프셋 계산 (y축 반전 적용)
    const labelDx = normalizedX * offsetDistance;
    const labelDy = -normalizedY * offsetDistance;  // y축 반전 (캔버스 좌표계)

    // 방향에 따른 텍스트 정렬 결정
    let textAlign = 'center';
    if (normalizedX > 0.3) {
      textAlign = 'left';
    } else if (normalizedX < -0.3) {
      textAlign = 'right';
    }

    let textBaseline = 'middle';
    if (normalizedY > 0.3) {
      textBaseline = 'bottom';
    } else if (normalizedY < -0.3) {
      textBaseline = 'top';
    }

    return {
      labelDx,
      labelDy,
      textAlign,
      textBaseline
    };
  }

  // ============================================================================
  // Basic Factory - 기본 함수 프리셋 팩토리
  // @version 3.0.0
  // ============================================================================


  /**
   * 기본 함수 프리셋
   * @param {Object} params - 파라미터
   * @returns {Layer} 레이어 그룹
   */
  function createBasicFunction(params) {
    const styleConfig = createStyleConfig();

    const {
      name,
      equation = '일반형',
      value = styleConfig.function.value,
      color = styleConfig.defaultColors.function,
      lineWidth = styleConfig.function.lineWidth,
      // 절편 옵션
      showIntercepts = false,
      showXIntercepts = true,
      showYIntercept = true,
      showInterceptDots = true
    } = params;

    // name이 없으면 함수 식으로 자동 생성
    const functionName = name || formatFunctionEquation(value);

    const children = [];
    let order = 0;

    // 1. 함수 레이어
    const functionLayer = new Layer({
      name: functionName,
      type: 'quadratic',
      order: order++,
      data: {
        equation,
        value,
        color,
        lineWidth
      }
    });
    children.push(functionLayer);

    // 2. 절편 레이어들 (옵션)
    if (showIntercepts) {
      const interceptLayers = createInterceptLayers(value, {
        showXIntercepts,
        showYIntercept,
        showInterceptDots,
        color: '#F3EF70',
        size: 6
      });

      interceptLayers.forEach(layer => {
        layer.order = order++;
        children.push(layer);
      });
    }

    // 3. 함수 라벨은 ensureFunctionLabels()에서 자동 생성됨

    return new Layer({
      name: functionName,
      type: 'group',
      children
    });
  }

  /**
   * 함수 + 교점 프리셋
   * @param {Object} params - 파라미터
   * @returns {Layer} 레이어 그룹
   */
  function createFunctionWithPoint(params) {
    const styleConfig = createStyleConfig();

    const {
      name,
      equation = '일반형',
      value = [1, 0, -4],
      functionColor = styleConfig.defaultColors.function,
      pointColor = styleConfig.defaultColors.point,
      lineColor = styleConfig.defaultColors.line
    } = params;

    // 기존 호환성: params.pointX가 있으면 point1로 변환
    let points = [];
    if (params.point1 || params.point2 || params.point3) {
      // 새로운 형식: point1, point2, point3
      if (params.point1) points.push(params.point1);
      if (params.point2) points.push(params.point2);
      if (params.point3) points.push(params.point3);
    } else if (params.pointX !== undefined) {
      // 기존 형식: pointX, pointY 등
      points.push({
        enabled: true,
        x: params.pointX,
        autoY: params.pointY === null || params.pointY === undefined,
        y: params.pointY,
        showXline: params.showXline !== false,
        showYline: params.showYline !== false,
        showXAxisLabel: params.showXAxisLabel !== false,
        showYAxisLabel: params.showYAxisLabel !== false,
        showIntersectionPoint: params.showIntersectionPoint !== false,
        showIntersectionLabel: params.showIntersectionLabel === true
      });
    }

    // name이 없으면 함수 식으로 자동 생성
    const functionName = name || formatFunctionEquation(value);

    const children = [];
    let order = 0;

    // 1. 함수
    children.push(new Layer({
      name: functionName,
      type: 'quadratic',
      order: order++,
      data: {
        equation,
        value,
        color: functionColor,
        lineWidth: 5
      }
    }));

    // 중복 좌표 추적용 Set
    const usedXCoords = new Set();
    const usedYCoords = new Set();

    // 각 교점에 대한 레이어 생성
    points.forEach((point) => {
      if (!point.enabled) return; // 비활성화된 교점은 건너뜀

      const pointX = point.x;
      // pointY가 null이거나 autoY가 true면 함수값 계산
      const actualY = (point.y !== null && !point.autoY) ? point.y : (value[0] * pointX * pointX + value[1] * pointX + value[2]);

      // X축 수선 (중복 허용 - 서로 다른 위치에서 시작)
      if (point.showXline) {
        children.push(new Layer({
          name: `x = ${formatNumber(pointX)}`,
          type: 'line',
          order: order++,
          data: {
            lineType: 'segment',
            from: { x: pointX, y: actualY },
            to: { x: pointX, y: 0 },
            color: lineColor,
            width: 2,
            style: 'dashed'
          }
        }));
      }

      // Y축 수선 (중복 허용 - 서로 다른 위치에서 시작)
      if (point.showYline) {
        children.push(new Layer({
          name: `y = ${formatNumber(actualY)}`,
          type: 'line',
          order: order++,
          data: {
            lineType: 'segment',
            from: { x: pointX, y: actualY },
            to: { x: 0, y: actualY },
            color: lineColor,
            width: 2,
            style: 'dashed'
          }
        }));
      }

      // X축 라벨 (중복 방지)
      if (point.showXAxisLabel && !usedXCoords.has(pointX)) {
        usedXCoords.add(pointX);
        const xAxisLabel = `${formatNumber(pointX)}`;
        children.push(new Layer({
          name: xAxisLabel,
          type: 'point',
          order: order++,
          data: {
            pointType: 'x-axis',
            x: pointX,
            y: 0,
            segmentDy: actualY,
            quadValue: value,
            color: pointColor,
            size: 5,
            showLabel: true
          }
        }));
      }

      // Y축 라벨 (중복 방지)
      if (point.showYAxisLabel && !usedYCoords.has(actualY)) {
        usedYCoords.add(actualY);
        const yAxisLabel = `${formatNumber(actualY)}`;
        children.push(new Layer({
          name: yAxisLabel,
          type: 'point',
          order: order++,
          data: {
            pointType: 'y-axis',
            x: 0,
            y: actualY,
            segmentDx: pointX,
            quadValue: value,
            color: pointColor,
            size: 5,
            showLabel: true
          }
        }));
      }

      // 교차점 (중복 허용 - 서로 다른 위치)
      if (point.showIntersectionPoint) {
        const intersectionLabel = `(${pointX}, ${actualY})`;
        children.push(new Layer({
          name: intersectionLabel,
          type: 'point',
          order: order++,
          data: {
            pointType: 'intersection',
            x: pointX,
            y: actualY,
            color: pointColor,
            size: 5,
            showLabel: point.showIntersectionLabel
          }
        }));
      }
    });

    // 함수 라벨은 ensureFunctionLabels()에서 자동 생성됨

    return new Layer({
      name: functionName,
      type: 'group',
      children,
      data: {
        _presetId: 'function-with-point',
        _presetParams: params
      }
    });
  }

  // ============================================================================
  // Area Factory - 넓이 관련 프리셋 팩토리
  // @version 3.0.0
  // ============================================================================


  /**
   * 삼각형 넓이 프리셋
   * @param {Object} params - 파라미터
   * @returns {Layer} 레이어 그룹
   */
  function createAreaTriangle(params) {
    const styleConfig = createStyleConfig();

    const {
      name,
      equation = '일반형',
      value = [1, 0, -4],
      mode = 'free',
      vertices = [
        { x: -2, y: 0 },
        { x: 2, y: 0 },
        { x: 0, y: -4 }
      ],
      functionColor = styleConfig.defaultColors.function,
      areaColor = styleConfig.defaultColors.shapeArea,
      dotMode = null,
      showSideLength = false,
      showAngle = false,
      measurementOptions = {}
    } = params;

    // p 기본값: 함수의 꼭짓점
    const [a, b, c] = value;
    const defaultP = {
      x: -b / (2 * a),
      y: a * (-b / (2 * a)) * (-b / (2 * a)) + b * (-b / (2 * a)) + c
    };
    const p = params.p || defaultP;

    // name이 없으면 함수 식으로 자동 생성
    const functionName = name || formatFunctionEquation(value);

    const children = [];

    // 1. 함수
    children.push(new Layer({
      name: functionName,
      type: 'quadratic',
      order: 0,
      data: {
        equation,
        value,
        color: functionColor,
        lineWidth: 5
      }
    }));

    // 2. 삼각형
    children.push(new Layer({
      name: '삼각형',
      type: 'shape',
      order: 1,
      data: {
        shapeType: 'triangle',
        mode,
        vertices: vertices,
        p,
        func: { equation, value },
        fillColor: areaColor,
        strokeColor: null,
        strokeWidth: 0
      }
    }));

    // 3. dotMode가 활성화된 경우 꼭짓점 점 레이어 추가
    if (dotMode && dotMode.enabled) {
      const dotLayers = createVertexDotLayers('triangle', vertices, {
        color: dotMode.color || '#F3EF70',
        size: dotMode.size || 6,
        showLabel: dotMode.showLabel !== false
      });
      children.push(...dotLayers);
    }

    // 4. showSideLength가 활성화된 경우 변 길이 측정 레이어 추가
    if (showSideLength) {
      const sideLengthLayers = createTriangleSideLengthLayers(vertices, measurementOptions);
      children.push(...sideLengthLayers);
    }

    // 5. showAngle이 활성화된 경우 각도 측정 레이어 추가
    if (showAngle) {
      const angleLayers = createTriangleAngleLayers(vertices, measurementOptions);
      children.push(...angleLayers);
    }

    return new Layer({
      name: functionName,
      type: 'group',
      children
    });
  }

  /**
   * 사각형 넓이 프리셋
   * @param {Object} params - 파라미터
   * @returns {Layer} 레이어 그룹
   */
  function createAreaRectangle(params) {
    const styleConfig = createStyleConfig();

    const {
      name,
      equation = '일반형',
      value = [1, 0, -4],
      vertices = [
        { x: -2, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: -4 },
        { x: -2, y: -4 }
      ],
      functionColor = styleConfig.defaultColors.function,
      areaColor = styleConfig.defaultColors.shapeArea,
      fillColor,
      strokeColor,
      strokeWidth,
      dotMode = null,
      showSideLength = false,
      showAngle = false,
      measurementOptions = {}
    } = params;

    // name이 없으면 함수 식으로 자동 생성
    const functionName = name || formatFunctionEquation(value);

    const children = [];

    // 1. 함수
    children.push(new Layer({
      name: functionName,
      type: 'quadratic',
      order: 0,
      data: {
        equation,
        value,
        color: functionColor,
        lineWidth: 5
      }
    }));

    // 2. 사각형
    children.push(new Layer({
      name: '사각형',
      type: 'shape',
      order: 1,
      data: {
        shapeType: 'rectangle',
        vertices,
        fillColor: fillColor !== undefined ? fillColor : areaColor,
        strokeColor: strokeColor !== undefined ? strokeColor : null,
        strokeWidth: strokeWidth !== undefined ? strokeWidth : 0
      }
    }));

    // 3. dotMode가 활성화된 경우 꼭짓점 점 레이어 추가
    if (dotMode && dotMode.enabled) {
      const dotLayers = createVertexDotLayers('rectangle', vertices, {
        color: dotMode.color || '#F3EF70',
        size: dotMode.size || 6,
        showLabel: dotMode.showLabel !== false
      });
      children.push(...dotLayers);
    }

    // 4. showSideLength가 활성화된 경우 변 길이 측정 레이어 추가
    if (showSideLength) {
      const sideLengthLayers = createRectangleSideLengthLayers(vertices, measurementOptions);
      children.push(...sideLengthLayers);
    }

    // 5. showAngle이 활성화된 경우 각도 측정 레이어 추가
    if (showAngle) {
      const angleLayers = createRectangleAngleLayers(vertices, measurementOptions);
      children.push(...angleLayers);
    }

    return new Layer({
      name: functionName,
      type: 'group',
      children
    });
  }

  /**
   * 적분 영역 프리셋
   * @param {Object} params - 파라미터
   * @returns {Layer} 레이어 그룹
   */
  function createAreaIntegral(params) {
    const styleConfig = createStyleConfig();

    const {
      name,
      equation = '일반형',
      value = [1, 0, -4],
      direction = 'x',
      shift = 0,
      l1 = { y: -4 },
      l2 = { y: 0 },
      functionColor = styleConfig.defaultColors.function,
      shiftedColor = styleConfig.colorPresets.secondary.gradient,
      areaColor = styleConfig.defaultColors.shapeArea,
      fillColor,
      strokeColor,
      strokeWidth
    } = params;

    // name이 없으면 함수 식으로 자동 생성
    const functionName = name || formatFunctionEquation(value);

    const children = [];
    let order = 0;

    // 1. 원본 함수
    children.push(new Layer({
      name: functionName,
      type: 'quadratic',
      order: order++,
      data: {
        equation,
        value,
        color: functionColor,
        lineWidth: styleConfig.function.lineWidth
      }
    }));

    // 2. 평행이동 함수 (shift가 있으면)
    if (shift !== 0) {
      // 평행이동된 함수 계산
      const [a, b, c] = value;
      let shiftedValue;
      if (direction === 'x') {
        // x축 방향 평행이동: (x, y) → (x + shift, y)
        // y = a(x-shift)² + b(x-shift) + c
        //   = a(x² - 2shift·x + shift²) + bx - b·shift + c
        //   = ax² + (-2a·shift + b)x + (a·shift² - b·shift + c)
        const newB = -2 * a * shift + b;
        const newC = a * shift * shift - b * shift + c;
        shiftedValue = [a, newB, newC];
      } else {
        // y축 방향 평행이동: (x, y) → (x, y + shift)
        // y = ax² + bx + c + shift
        shiftedValue = [a, b, c + shift];
      }

      children.push(new Layer({
        name: formatFunctionEquation(shiftedValue),
        type: 'quadratic',
        order: order++,
        data: {
          equation,
          value: shiftedValue,
          color: shiftedColor,
          lineWidth: styleConfig.function.lineWidth
        }
      }));
    }

    // 3. 적분 영역
    children.push(new Layer({
      name: '적분 영역',
      type: 'shape',
      order: order++,
      data: {
        shapeType: 'integral',
        direction,
        shift,
        l1,
        l2,
        func: { equation, value },
        fillColor: fillColor !== undefined ? fillColor : areaColor,
        strokeColor: strokeColor !== undefined ? strokeColor : null,
        strokeWidth: strokeWidth !== undefined ? strokeWidth : 0
      }
    }));

    return new Layer({
      name: functionName,
      type: 'group',
      children
    });
  }

  // ============================================================================
  // Advanced Factory - 고급 함수 프리셋 팩토리
  // @version 3.0.0
  // ============================================================================


  /**
   * 가지형 함수 프리셋
   * @param {Object} params - 파라미터
   * @returns {Layer} 레이어 그룹
   */
  function createBranchFunctions(params) {
    const styleConfig = createStyleConfig();
    const colors = [
      styleConfig.colorPresets.primary.gradient,
      styleConfig.colorPresets.secondary.gradient,
      styleConfig.colorPresets.tertiary.gradient
    ];

    const {
      name,
      equation = '일반형',
      value = [1, 0, 0],
      direction = 'both',
      mixed = false,
      aStep = 2,
      count = 3
    } = params;

    // name이 없으면 함수 식으로 자동 생성
    const groupName = name || formatFunctionEquation(value);

    const children = [];
    const a = value[0];
    const b = value[1];
    const c = value[2];

    if (mixed) {
      // 혼합: a값 변화
      let order = 0;
      const baseAbsA = Math.max(0.1, Math.abs(a));

      const addLayer = (newA, idx, label) => {
        const newValue = [newA, b, c];
        children.push(new Layer({
          name: formatFunctionEquation(newValue),
          type: 'quadratic',
          order: order++,
          data: {
            equation,
            value: newValue,
            color: colors[idx % colors.length],
            lineWidth: 5
          }
        }));
      };

      if (direction === 'both') {
        // 아래로 볼록(a>0) count개 + 위로 볼록(a<0) count개
        for (let i = 0; i < count; i++) {
          const mag = baseAbsA + i * aStep;
          addLayer(+mag, i);
        }
        for (let i = 0; i < count; i++) {
          const mag = baseAbsA + i * aStep;
          addLayer(-mag, i + count);
        }
      } else if (direction === 'a>0') {
        for (let i = 0; i < count; i++) {
          const mag = baseAbsA + i * aStep;
          addLayer(+mag, i);
        }
      } else if (direction === 'a<0') {
        for (let i = 0; i < count; i++) {
          const mag = baseAbsA + i * aStep;
          addLayer(-mag, i);
        }
      } else {
        // 알 수 없는 direction: 현재 a의 부호만 따름 (하위호환)
        for (let i = 0; i < count; i++) {
          const mag = baseAbsA + i * aStep;
          const newA = (a >= 0 ? +mag : -mag);
          addLayer(newA, i);
        }
      }
    } else {
      // 단순 방향별
      if (direction === 'a>0' || direction === 'both') {
        const posValue = [Math.abs(a), b, c];
        children.push(new Layer({
          name: formatFunctionEquation(posValue),
          type: 'quadratic',
          order: 0,
          data: {
            equation,
            value: posValue,
            color: colors[0], // 파란색
            lineWidth: 5
          }
        }));
      }

      if (direction === 'a<0' || direction === 'both') {
        const negValue = [-Math.abs(a), b, c];
        children.push(new Layer({
          name: formatFunctionEquation(negValue),
          type: 'quadratic',
          order: 1,
          data: {
            equation,
            value: negValue,
            color: colors[1], // 초록색
            lineWidth: 5
          }
        }));
      }
    }

    return new Layer({
      name: groupName,
      type: 'group',
      children
    });
  }

  /**
   * 평행이동 프리셋
   * @param {Object} params - 파라미터
   * @returns {Layer} 레이어 그룹
   */
  function createMoveFunction(params) {
    const styleConfig = createStyleConfig();

    const {
      name,
      equation = '일반형',
      value = [1, 0, 0],
      dx = 2,
      dy = 3,
      originalColor = styleConfig.defaultColors.function,
      movedColor = styleConfig.colorPresets.secondary.gradient
    } = params;

    // name이 없으면 함수 식으로 자동 생성
    const groupName = name || formatFunctionEquation(value);

    const children = [];
    const a = value[0];
    const b = value[1];
    const c = value[2];
    const originalValue = [a, b, c];

    // 1. 원본 함수
    children.push(new Layer({
      name: formatFunctionEquation(originalValue),
      type: 'quadratic',
      order: 0,
      data: {
        equation,
        value: originalValue,
        color: originalColor,
        lineWidth: 5
      }
    }));

    // 2. 평행이동된 함수
    const movedA = a;
    const movedB = b - 2 * a * dx;
    const movedC = a * dx * dx - b * dx + c + dy;
    const movedValue = [movedA, movedB, movedC];

    children.push(new Layer({
      name: formatFunctionEquation(movedValue),
      type: 'quadratic',
      order: 1,
      data: {
        equation,
        value: movedValue,
        color: movedColor,
        lineWidth: 5
      }
    }));

    return new Layer({
      name: groupName,
      type: 'group',
      children
    });
  }

  // ============================================================================
  // Preset Factory - 프리셋 생성 팩토리 (메인)
  // @version 3.0.0
  // ============================================================================


  // ============================================================================
  // 프리셋 매핑
  // ============================================================================

  const PRESETS = {
    'basic-function': createBasicFunction,
    'function-with-point': createFunctionWithPoint,
    'area-triangle': createAreaTriangle,
    'area-rectangle': createAreaRectangle,
    'area-integral': createAreaIntegral,
    'branch-functions': createBranchFunctions,
    'move-function': createMoveFunction
  };

  /**
   * 프리셋으로 레이어 생성
   * @param {string} presetId - 프리셋 ID
   * @param {Object} params - 파라미터 (함수 값, 색상 등)
   * @returns {Layer} 생성된 레이어
   */
  function create(presetId, params = {}) {
    const presetFn = PRESETS[presetId];
    if (!presetFn) {
      console.error(`Preset not found: ${presetId}`);
      return null;
    }

    const layer = presetFn(params);

    // 그룹 레이어인 경우 메타데이터 저장 (편집용)
    if (layer && layer.type === LAYER_TYPES.GROUP) {
      layer.data._presetId = presetId;
      layer.data._presetParams = JSON.parse(JSON.stringify(params)); // deep copy
    }

    return layer;
  }

  // ============================================================================
  // Basic Adapter - 기본 함수 purpose → Layer 변환
  // @version 3.0.0
  // ============================================================================


  /**
   * Basic purpose를 Layer로 변환
   * @param {Object} func - Purpose 데이터
   * @returns {Layer|Layer[]} 생성된 레이어 (단일 또는 배열)
   */
  function convertBasicToLayer(func) {
    const styleConfig = createStyleConfig();

    // name이 없으면 함수 식으로 자동 생성
    const functionName = func.name || formatFunctionEquation(func.value) || 'Untitled Layer';

    const params = {
      name: functionName,
      equation: func.equation || '일반형',
      value: func.value,
      color: (func?.colors?.functionColor) || styleConfig.defaultColors.function,
      lineWidth: styleConfig.function.lineWidth,
      // 절편 옵션 전달
      showIntercepts: func?.showIntercepts || false,
      showXIntercepts: func?.showXIntercepts !== false, // 기본값 true
      showYIntercept: func?.showYIntercept !== false,   // 기본값 true
      showInterceptDots: func?.showInterceptDots !== false // 기본값 true
    };

    const group = create('basic-function', params);
    return (group && group.children) ? group.children : group;
  }

  // ============================================================================
  // Branch Adapter - 가지형 함수 purpose → Layer 변환
  // @version 3.0.0
  // ============================================================================


  /**
   * Branch purpose를 Layer로 변환
   * @param {Object} func - Purpose 데이터
   * @returns {Layer|Layer[]|null} 생성된 레이어 (단일 또는 배열)
   */
  function convertBranchToLayer(func) {
    const direction = func?.prop?.direction;
    if (!direction) return null;

    // name이 없으면 함수 식으로 자동 생성
    const functionName = func.name || formatFunctionEquation(func.value);

    const params = {
      name: functionName,
      equation: func.equation || '일반형',
      value: func.value,
      direction,
      mixed: !!(func?.prop?.mixed),
      count: func?.prop?.count,
      aStep: func?.prop?.aStep
    };

    const group = create('branch-functions', params);
    return (group && group.children) ? group.children : group;
  }

  // ============================================================================
  // Move Adapter - 평행이동 함수 purpose → Layer 변환
  // @version 3.0.0
  // ============================================================================


  /**
   * Move purpose를 Layer로 변환
   * @param {Object} func - Purpose 데이터
   * @returns {Layer|Layer[]|null} 생성된 레이어 (단일 또는 배열)
   */
  function convertMoveToLayer(func) {
    const styleConfig = createStyleConfig();

    const dx = func?.prop?.dx ?? 0;
    const dy = func?.prop?.dy ?? 0;

    // name이 없으면 함수 식으로 자동 생성
    const functionName = func.name || formatFunctionEquation(func.value || [1, 0, 0]);

    const params = {
      name: functionName,
      equation: func.equation || '일반형',
      value: func.value || [1, 0, 0],
      dx,
      dy,
      originalColor: (func?.colors?.originalColor) || styleConfig.defaultColors.function,
      movedColor: (func?.colors?.movedColor) || styleConfig.defaultColors.function
    };

    const group = create('move-function', params);
    return (group && group.children) ? group.children : group;
  }

  // ============================================================================
  // Area Adapter - 넓이 관련 purpose → Layer 변환
  // @version 3.0.0
  // ============================================================================


  /**
   * Area purpose를 Layer로 변환
   * @param {Object} func - Purpose 데이터
   * @returns {Layer|Layer[]|null} 생성된 레이어 (단일 또는 배열)
   */
  function convertAreaToLayer(func) {
    const styleConfig = createStyleConfig();
    const shape = func?.prop?.shape;

    if (!shape) return null;

    // Triangle
    if (shape === 'triangle') {
      const functionName = func.name || formatFunctionEquation(func.value || [1, 0, -4]);
      const params = {
        name: functionName,
        equation: func.equation || '일반형',
        value: func.value || [1, 0, -4],
        mode: func?.prop?.mode || 'free',
        vertices: func?.prop?.vertices || null,
        p: func?.prop?.p || { x: 0, y: 0 },
        functionColor: (func?.colors?.functionColor) || styleConfig.defaultColors.function,
        areaColor: (func?.colors?.areaColor) || styleConfig.defaultColors.shapeArea,
        dotMode: func?.prop?.dotMode || null,
        showSideLength: func?.prop?.showSideLength || false,
        showAngle: func?.prop?.showAngle || false,
        measurementOptions: func?.prop?.measurementOptions || {}
      };
      const group = create('area-triangle', params);
      return group && group.children ? group.children : group;
    }

    // Rectangle
    if (shape === 'rectangle') {
      const functionName = func.name || formatFunctionEquation(func.value || [1, 0, -4]);
      const params = {
        name: functionName,
        equation: func.equation || '일반형',
        value: func.value || [1, 0, -4],
        vertices: func?.prop?.vertices || [
          { x: -2, y: 0 },
          { x: 2, y: 0 },
          { x: 2, y: -4 },
          { x: -2, y: -4 }
        ],
        functionColor: (func?.colors?.functionColor) || styleConfig.defaultColors.function,
        areaColor: (func?.colors?.areaColor) || styleConfig.defaultColors.shapeArea,
        dotMode: func?.prop?.dotMode || null,
        showSideLength: func?.prop?.showSideLength || false,
        showAngle: func?.prop?.showAngle || false,
        measurementOptions: func?.prop?.measurementOptions || {}
      };
      const group = create('area-rectangle', params);
      return group && group.children ? group.children : group;
    }

    // Integral
    if (shape === 'integral') {
      const functionName = func.name || formatFunctionEquation(func.value || [1, 0, -4]);
      const params = {
        name: functionName,
        equation: func.equation || '일반형',
        value: func.value || [1, 0, -4],
        direction: func?.prop?.direction || 'x',
        shift: func?.prop?.shift || 0,
        l1: func?.prop?.l1 || { y: -4 },
        l2: func?.prop?.l2 || { y: 0 },
        functionColor: (func?.colors?.functionColor) || styleConfig.defaultColors.function,
        shiftedColor: (func?.colors?.movedColor) || styleConfig.defaultColors.function,
        areaColor: (func?.colors?.areaColor) || styleConfig.defaultColors.shapeArea
      };
      const group = create('area-integral', params);
      return group && group.children ? group.children : group;
    }

    return null;
  }

  // ============================================================================
  // Shape Adapter - 도형 purpose → Layer 변환
  // @version 3.0.0
  // ============================================================================


  /**
   * Shape purpose를 Layer로 변환
   * @param {Object} func - Purpose 데이터
   * @returns {Layer|null} 생성된 레이어
   */
  function convertShapeToLayer(func) {
    const styleConfig = createStyleConfig();
    const shapeType = func?.prop?.shapeType;

    if (!shapeType) {
      console.warn('Shape adapter: shapeType is required in prop');
      return null;
    }

    // Triangle
    if (shapeType === 'triangle') {
      const name = func.name || '삼각형';
      const vertices = func?.prop?.vertices || [
        { x: -2, y: 0 },
        { x: 2, y: 0 },
        { x: 0, y: -4 }
      ];
      const mode = func?.prop?.mode || 'free';
      const p = func?.prop?.p || { x: 0, y: 0 };
      const funcData = func?.prop?.func || null;
      const showSideLength = func?.prop?.showSideLength || false;
      const showAngle = func?.prop?.showAngle || false;
      const measurementOptions = func?.prop?.measurementOptions || {};

      const children = [];

      // 1. 삼각형 도형 레이어
      children.push(new Layer({
        name,
        type: 'shape',
        order: 0,
        data: {
          shapeType: 'triangle',
          mode,
          vertices,
          p,
          func: funcData,
          fillColor: func?.colors?.fillColor || styleConfig.defaultColors.shapeArea,
          strokeColor: func?.colors?.strokeColor || null,
          strokeWidth: func?.prop?.strokeWidth || 0
        }
      }));

      // 2. showSideLength가 활성화된 경우 변 길이 측정 레이어 추가
      if (showSideLength) {
        const sideLengthLayers = createTriangleSideLengthLayers(vertices, measurementOptions);
        children.push(...sideLengthLayers);
      }

      // 3. showAngle이 활성화된 경우 각도 측정 레이어 추가
      if (showAngle) {
        const angleLayers = createTriangleAngleLayers(vertices, measurementOptions);
        children.push(...angleLayers);
      }

      // measurement가 있으면 그룹으로, 없으면 단일 레이어로
      if (showSideLength || showAngle) {
        return new Layer({
          name,
          type: 'group',
          children
        });
      } else {
        return children[0];
      }
    }

    // Rectangle
    if (shapeType === 'rectangle') {
      const name = func.name || '사각형';
      const vertices = func?.prop?.vertices || [
        { x: -2, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: -4 },
        { x: -2, y: -4 }
      ];
      const showSideLength = func?.prop?.showSideLength || false;
      const showAngle = func?.prop?.showAngle || false;
      const measurementOptions = func?.prop?.measurementOptions || {};

      const children = [];

      // 1. 사각형 도형 레이어
      children.push(new Layer({
        name,
        type: 'shape',
        order: 0,
        data: {
          shapeType: 'rectangle',
          vertices,
          fillColor: func?.colors?.fillColor || styleConfig.defaultColors.shapeArea,
          strokeColor: func?.colors?.strokeColor || null,
          strokeWidth: func?.prop?.strokeWidth || 0
        }
      }));

      // 2. showSideLength가 활성화된 경우 변 길이 측정 레이어 추가
      if (showSideLength) {
        const sideLengthLayers = createRectangleSideLengthLayers(vertices, measurementOptions);
        children.push(...sideLengthLayers);
      }

      // 3. showAngle이 활성화된 경우 각도 측정 레이어 추가
      if (showAngle) {
        const angleLayers = createRectangleAngleLayers(vertices, measurementOptions);
        children.push(...angleLayers);
      }

      // measurement가 있으면 그룹으로, 없으면 단일 레이어로
      if (showSideLength || showAngle) {
        return new Layer({
          name,
          type: 'group',
          children
        });
      } else {
        return children[0];
      }
    }

    // Polygon
    if (shapeType === 'polygon') {
      const name = func.name || '다각형';
      const vertices = func?.prop?.vertices;

      if (!vertices || vertices.length < 3) {
        console.warn('Shape adapter: polygon requires at least 3 vertices');
        return null;
      }

      const showSideLength = func?.prop?.showSideLength || false;
      const showAngle = func?.prop?.showAngle || false;
      const measurementOptions = func?.prop?.measurementOptions || {};

      const children = [];

      // 1. 다각형 도형 레이어
      children.push(new Layer({
        name,
        type: 'shape',
        order: 0,
        data: {
          shapeType: 'polygon',
          vertices,
          fillColor: func?.colors?.fillColor || styleConfig.defaultColors.shapeArea,
          strokeColor: func?.colors?.strokeColor || null,
          strokeWidth: func?.prop?.strokeWidth || 0
        }
      }));

      // 2. showSideLength가 활성화된 경우 변 길이 측정 레이어 추가
      if (showSideLength) {
        const sideLengthLayers = createPolygonSideLengthLayers(vertices, measurementOptions);
        children.push(...sideLengthLayers);
      }

      // 3. showAngle이 활성화된 경우 각도 측정 레이어 추가
      if (showAngle) {
        const angleLayers = createPolygonAngleLayers(vertices, measurementOptions);
        children.push(...angleLayers);
      }

      // measurement가 있으면 그룹으로, 없으면 단일 레이어로
      if (showSideLength || showAngle) {
        return new Layer({
          name,
          type: 'group',
          children
        });
      } else {
        return children[0];
      }
    }

    // Circle
    if (shapeType === 'circle') {
      const name = func.name || '원';
      const center = func?.prop?.center || { x: 0, y: 0 };
      const radius = func?.prop?.radius || 2;

      return new Layer({
        name,
        type: 'shape',
        data: {
          shapeType: 'circle',
          center,
          radius,
          fillColor: func?.colors?.fillColor || styleConfig.defaultColors.shapeArea,
          strokeColor: func?.colors?.strokeColor || null,
          strokeWidth: func?.prop?.strokeWidth || 0
        }
      });
    }

    // Integral
    if (shapeType === 'integral') {
      const name = func.name || '적분 영역';
      const direction = func?.prop?.direction || 'x';
      const shift = func?.prop?.shift || 0;
      const l1 = func?.prop?.l1 || { y: -4 };
      const l2 = func?.prop?.l2 || { y: 0 };
      const funcData = func?.prop?.func;

      if (!funcData) {
        console.warn('Shape adapter: integral requires func data');
        return null;
      }

      return new Layer({
        name,
        type: 'shape',
        data: {
          shapeType: 'integral',
          direction,
          shift,
          l1,
          l2,
          func: funcData,
          fillColor: func?.colors?.fillColor || styleConfig.defaultColors.shapeArea,
          strokeColor: func?.colors?.strokeColor || null,
          strokeWidth: func?.prop?.strokeWidth || 0
        }
      });
    }

    console.warn(`Unknown shape type: ${shapeType}`);
    return null;
  }

  // ============================================================================
  // Adapter Registry - Purpose 타입별 어댑터 매핑
  // @version 3.0.0
  // ============================================================================


  /**
   * Purpose 타입과 어댑터 함수 매핑
   */
  const ADAPTER_REGISTRY = {
    'basic': convertBasicToLayer,
    'branch': convertBranchToLayer,
    'move': convertMoveToLayer,
    'area': convertAreaToLayer,
    'shape': convertShapeToLayer
  };

  /**
   * Purpose 타입에 맞는 어댑터 함수 가져오기
   * @param {string} purposeType - Purpose 타입
   * @returns {Function|null} 어댑터 함수
   */
  function getAdapterForPurpose(purposeType) {
    return ADAPTER_REGISTRY[purposeType] || null;
  }

  /**
   * Purpose를 Layer로 변환
   * @param {string} purposeType - Purpose 타입
   * @param {Object} func - Purpose 데이터
   * @param {number} index - 레이어 인덱스
   * @returns {Layer|Layer[]|null} 생성된 레이어
   */
  function convertWithAdapter(purposeType, func, index = 0) {
    const adapter = getAdapterForPurpose(purposeType);

    if (!adapter) {
      console.warn(`No adapter found for purpose type: ${purposeType}`);
      return null;
    }

    // basic adapter만 index가 필요함
    if (purposeType === 'basic') {
      return adapter(func, index);
    }

    return adapter(func);
  }

  // ============================================================================
  // Extras Processor - functions.dot / functions.line 처리
  // @version 3.0.0
  // ============================================================================


  /**
   * functions.dot을 Layer 배열로 변환
   * @param {Array} dotList - 점 데이터 배열
   * @returns {Layer[]} 생성된 레이어 배열
   */
  function processDotList(dotList) {
    const styleConfig = createStyleConfig();
    const extras = [];

    if (!Array.isArray(dotList)) return extras;

    dotList.forEach((d, i) => {
      const x = d?.x ?? 0;
      const y = d?.y ?? 0;
      const pointColor = d?.color || styleConfig.defaultColors.point;
      const size = d?.size ?? 5;
      const showLabel = !!d?.showLabel;
      const pointType = d?.pointType || 'custom';
      const name = d?.name;
      const autoLines = !!d?.autoLines;
      const xLabel = d?.xLabel;
      const yLabel = d?.yLabel;
      const label = d?.label;

      // 점 라벨 처리
      // 우선순위: xLabel/yLabel 객체 > 단순 label 문자열 > undefined
      const pointLabel = (xLabel !== undefined || yLabel !== undefined)
        ? {
            x: xLabel !== undefined ? xLabel : x,
            y: yLabel !== undefined ? yLabel : y,
            xIsString: typeof xLabel === 'string',
            yIsString: typeof yLabel === 'string',
            font: d?.labelFont
          }
        : label;

      // 점 레이어 추가
      extras.push(new Layer({
        name,
        type: LAYER_TYPES.POINT,
        order: Number.MAX_SAFE_INTEGER - 1000 + i,
        data: {
          pointType,
          x,
          y,
          color: pointColor,
          size,
          showLabel,
          label: pointLabel
        }
      }));

      // 자동 보조선 생성
      if (autoLines) {
        const lineColor = d?.lineColor || styleConfig.defaultColors.line;
        const lineWidth = d?.lineWidth ?? styleConfig.line.width;
        const lineStyle = d?.lineStyle || 'dashed';

        // 수평선: (x, y) → (0, y)
        extras.push(new Layer({
          type: LAYER_TYPES.LINE,
          order: Number.MAX_SAFE_INTEGER - 500 + i * 2,
          data: {
            lineType: 'segment',
            from: { x: x, y: y },
            to: { x: 0, y: y },
            color: lineColor,
            width: lineWidth,
            style: lineStyle
          }
        }));

        // y축 절편 (라벨만)
        extras.push(new Layer({
          type: LAYER_TYPES.POINT,
          order: Number.MAX_SAFE_INTEGER - 400 + i * 4,
          data: {
            pointType: 'y-axis',
            x: 0,
            y: y,
            color: lineColor,
            showLabel: true,
            showDot: false,
            segmentDx: x,
            label: yLabel !== undefined ? yLabel : y,
          }
        }));

        // 수직선: (x, y) → (x, 0)
        extras.push(new Layer({
          type: LAYER_TYPES.LINE,
          order: Number.MAX_SAFE_INTEGER - 500 + i * 2 + 1,
          data: {
            lineType: 'segment',
            from: { x: x, y: y },
            to: { x: x, y: 0 },
            color: lineColor,
            width: lineWidth,
            style: lineStyle
          }
        }));

        // x축 절편 (라벨만)
        extras.push(new Layer({
          type: LAYER_TYPES.POINT,
          order: Number.MAX_SAFE_INTEGER - 400 + i * 4 + 1,
          data: {
            pointType: 'x-axis',
            x: x,
            y: 0,
            color: lineColor,
            showLabel: true,
            showDot: false,
            segmentDy: y,
            label: xLabel !== undefined ? xLabel : x,
          }
        }));
      }
    });

    return extras;
  }

  /**
   * functions.line을 Layer 배열로 변환
   * @param {Array} lineList - 선 데이터 배열
   * @returns {Layer[]} 생성된 레이어 배열
   */
  function processLineList(lineList) {
    const styleConfig = createStyleConfig();
    const extras = [];

    if (!Array.isArray(lineList)) return extras;

    lineList.forEach((l, i) => {
      const lineType = l?.lineType || 'segment';
      const width = l?.width ?? styleConfig.line.width;
      const color = l?.color || styleConfig.defaultColors.line;
      const style = l?.style || 'dashed';
      const name = l?.name;

      const data = {
        lineType,
        color,
        width,
        style
      };

      if (lineType === 'horizontal') {
        data.y = l?.y ?? 0;
      } else if (lineType === 'vertical') {
        data.x = l?.x ?? 0;
      } else if (lineType === 'segment') {
        data.from = l?.from || { x: 0, y: 0 };
        data.to = l?.to || { x: 1, y: 0 };
      }

      extras.push(new Layer({
        name,
        type: 'line',
        order: Number.MAX_SAFE_INTEGER - 500 + i,
        data
      }));
    });

    return extras;
  }

  /**
   * functions.dot / functions.line 처리
   * @param {Object} func - Purpose 데이터
   * @returns {Layer[]} 생성된 레이어 배열
   */
  function processExtras(func) {
    const extras = [];

    try {
      const dotList = func?.functions?.dot;
      const lineList = func?.functions?.line;

      if (dotList) {
        extras.push(...processDotList(dotList));
      }

      if (lineList) {
        extras.push(...processLineList(lineList));
      }
    } catch (e) {
      console.warn('Error processing extras:', e);
    }

    return extras;
  }

  /**
   * Base 레이어와 Extras를 병합
   * @param {Layer|Layer[]|null} base - 기본 레이어
   * @param {Layer[]} extras - 추가 레이어들
   * @returns {Layer|Layer[]|null} 병합된 결과
   */
  function mergeBaseWithExtras(base, extras) {
    if (!base) {
      return extras.length ? extras : null;
    }

    // base가 그룹 레이어인 경우
    if (base.type === LAYER_TYPES.GROUP && Array.isArray(base.children)) {
      base.children.push(...extras);
      return base;
    }

    // base가 배열인 경우
    if (Array.isArray(base)) {
      base.push(...extras);
      return base;
    }

    // base가 단일 레이어인 경우
    return extras.length ? [base, ...extras] : base;
  }

  // ============================================================================
  // Logger Utility - 환경별 로그 레벨 관리
  // @version 4.0.0
  // ============================================================================

  /**
   * 로그 레벨 상수
   * @enum {number}
   */
  const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3};

  /**
   * 현재 로그 레벨 (환경에 따라 설정)
   * - 개발: DEBUG (모든 로그 출력)
   * - 프로덕션: WARN (경고와 에러만 출력)
   */
  let currentLogLevel = LOG_LEVELS.DEBUG;

  // 환경 감지 (Vite 환경 변수 또는 NODE_ENV 사용)
  if (typeof ({ url: (typeof document === 'undefined' && typeof location === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : typeof document === 'undefined' ? location.href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('visualization-api.js', document.baseURI).href)) }) !== 'undefined' && undefined) {
    currentLogLevel = undefined.PROD ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;
  } else if (typeof process !== 'undefined' && process.env) {
    currentLogLevel = process.env.NODE_ENV === 'production' ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;
  }

  /**
   * 로그 출력 헬퍼
   * @param {number} level - 로그 레벨
   * @param {string} tag - 로그 태그 (파일/모듈 이름)
   * @param {Array} args - 로그 인자들
   */
  function log(level, tag, ...args) {
    if (level < currentLogLevel) {
      return;
    }

    const timestamp = new Date().toISOString().substr(11, 12);
    const prefix = `[${timestamp}] [${tag}]`;

    switch (level) {
      case LOG_LEVELS.DEBUG:
        console.log(`%c${prefix}`, 'color: #888', ...args);
        break;
      case LOG_LEVELS.INFO:
        console.info(`%c${prefix}`, 'color: #3b82f6', ...args);
        break;
      case LOG_LEVELS.WARN:
        console.warn(`%c${prefix}`, 'color: #f59e0b', ...args);
        break;
      case LOG_LEVELS.ERROR:
        console.error(`%c${prefix}`, 'color: #ef4444', ...args);
        break;
    }
  }

  /**
   * Logger 클래스
   */
  class Logger {
    constructor(tag) {
      this.tag = tag;
    }

    /**
     * 디버그 로그 (개발 환경에서만 출력)
     * @param {...any} args
     */
    debug(...args) {
      log(LOG_LEVELS.DEBUG, this.tag, ...args);
    }

    /**
     * 정보 로그
     * @param {...any} args
     */
    info(...args) {
      log(LOG_LEVELS.INFO, this.tag, ...args);
    }

    /**
     * 경고 로그
     * @param {...any} args
     */
    warn(...args) {
      log(LOG_LEVELS.WARN, this.tag, ...args);
    }

    /**
     * 에러 로그
     * @param {...any} args
     */
    error(...args) {
      log(LOG_LEVELS.ERROR, this.tag, ...args);
    }

    /**
     * 객체를 테이블로 출력 (디버그 전용)
     * @param {Object} data
     */
    table(data) {
      if (currentLogLevel <= LOG_LEVELS.DEBUG) {
        console.table(data);
      }
    }

    /**
     * 그룹 시작 (디버그 전용)
     * @param {string} label
     */
    group(label) {
      if (currentLogLevel <= LOG_LEVELS.DEBUG) {
        console.group(`[${this.tag}] ${label}`);
      }
    }

    /**
     * 그룹 종료 (디버그 전용)
     */
    groupEnd() {
      if (currentLogLevel <= LOG_LEVELS.DEBUG) {
        console.groupEnd();
      }
    }

    /**
     * 시간 측정 시작
     * @param {string} label
     */
    time(label) {
      if (currentLogLevel <= LOG_LEVELS.DEBUG) {
        console.time(`[${this.tag}] ${label}`);
      }
    }

    /**
     * 시간 측정 종료
     * @param {string} label
     */
    timeEnd(label) {
      if (currentLogLevel <= LOG_LEVELS.DEBUG) {
        console.timeEnd(`[${this.tag}] ${label}`);
      }
    }
  }

  /**
   * Logger 인스턴스 생성 팩토리
   * @param {string} tag - 로그 태그 (파일/모듈 이름)
   * @returns {Logger}
   */
  function createLogger(tag) {
    return new Logger(tag);
  }

  // ============================================================================
  // Purpose Adapter - 목적 기반 데이터를 Layer로 변환 (메인)
  // @version 4.0.0
  // ============================================================================


  const logger = createLogger('PurposeAdapter');

  /**
   * Purpose 기반 데이터를 Layer로 변환
   * @param {Object} func - Purpose 데이터
   * @param {string} func.purpose - Purpose 타입 ('basic', 'area', 'branch', 'move')
   * @param {Array} func.value - 함수 계수 배열 (필수)
   * @param {number} index - 레이어 인덱스
   * @returns {Layer|Layer[]|null} 생성된 레이어
   * @throws {ValidationError} 입력 데이터가 유효하지 않은 경우
   */
  function convertPurposeToLayer(func, index = 0) {
    // 기본 안전장치 (이전 호환성 유지)
    if (!func || typeof func !== 'object') return null;

    // Purpose가 없는 경우 (dot/line 등) null 반환
    if (!func.purpose) {
      logger.debug('No purpose specified, skipping conversion');
      return null;
    }

    // 입력 검증 (경고만, 에러 throw 안함 - 호환성 유지)
    const validPurposes = Object.values(PURPOSE_TYPES);
    if (!validPurposes.includes(func.purpose)) {
      logger.warn(`Unknown purpose type: ${func.purpose}, attempting conversion anyway`);
    }

    // value 검증 (경고만)
    if (func.purpose !== PURPOSE_TYPES.SHAPE && !func.value) {
      logger.warn('Missing value property for purpose:', func.purpose);
    }

    if (func.value && !Array.isArray(func.value)) {
      logger.warn('func.value should be an array');
    }

    if (func.value && Array.isArray(func.value) && func.value.length < 2) {
      logger.warn('func.value should have at least 2 elements');
    }

    // Purpose 타입에 맞는 어댑터로 변환
    const base = convertWithAdapter(func.purpose, func, index);

    if (!base) {
      logger.warn(`Adapter returned null for purpose: ${func.purpose}`);
      return null;
    }

    // functions.dot / functions.line 처리
    const extras = processExtras(func);

    // Base와 Extras 병합
    return mergeBaseWithExtras(base, extras);
  }

  // ============================================================================
  // Math Graphics Library - 메인 진입점
  // @version 4.0.0
  // ============================================================================

  // ============================================================================
  // 버전 관리
  // ============================================================================

  const VERSION = {
    MAJOR: 4,
    MINOR: 5,
    PATCH: 0,
    BUILD: 20251124,

    // 버전 문자열 반환
    toString() {
      return `${this.MAJOR}.${this.MINOR}.${this.PATCH}`;
    },

    // 전체 버전 정보 반환
    getInfo() {
      return {
        version: this.toString(),
        major: this.MAJOR,
        minor: this.MINOR,
        patch: this.PATCH,
        build: this.BUILD,
        name: 'Math Graph Library',
        fullName: `Math Graph Library ${this.MAJOR}.${this.MINOR}`
      };
    }
  };

  // 하위 호환성을 위한 개별 export
  VERSION.toString();

  function getVersionInfo() {
    return VERSION.getInfo();
  }

  // ============================================================================
  // 초기화 메시지 (콘솔)
  // ============================================================================

  if (typeof window !== 'undefined') {
    console.log(
      `%c ${VERSION.getInfo().fullName} `,
      'background: linear-gradient(135deg, #0f0f1e 0%, #4CAF50 100%); color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
    );
  }

  // ============================================================================
  // Timeline Continuity Storage
  // ============================================================================
  /**
   * Canvas별 타임라인 저장소 (WeakMap 사용으로 자동 GC)
   * Key: HTMLCanvasElement
   * Value: { timeline: LayerTimeline, lastEndTime: number, layers: Layer[] }
   */
  const canvasTimelineStorage = new WeakMap();

  /**
   * Canvas에 저장된 타임라인 데이터 가져오기
   * @param {HTMLCanvasElement} canvas - 캔버스 엘리먼트
   * @returns {Object|null} 저장된 데이터 또는 null
   */
  function getCanvasTimeline(canvas) {
    return canvasTimelineStorage.get(canvas) || null;
  }

  /**
   * Canvas에 타임라인 데이터 저장
   * @param {HTMLCanvasElement} canvas - 캔버스 엘리먼트
   * @param {LayerTimeline} timeline - 타임라인 인스턴스
   * @param {Layer[]} layers - 레이어 배열
   * @param {Object} coordinates - 좌표 정보 { xMin, xMax, yMin, yMax }
   */
  function setCanvasTimeline(canvas, timeline, layers, coordinates) {
    const lastEndTime = timeline ? calculateTimelineEndTime(timeline) : 0;
    canvasTimelineStorage.set(canvas, {
      timeline,
      lastEndTime,
      layers: layers.slice(), // 복사본 저장
      lastCoordinates: coordinates ? { ...coordinates } : null // 좌표 저장
    });
  }

  /**
   * 타임라인의 마지막 종료 시간 계산
   * @param {LayerTimeline} timeline - 타임라인 인스턴스
   * @returns {number} 마지막 애니메이션 종료 시간 (ms)
   */
  function calculateTimelineEndTime(timeline) {
    let maxEndTime = 0;
    timeline.animations.forEach((anim) => {
      const endTime = anim.startTime + anim.duration;
      if (endTime > maxEndTime) {
        maxEndTime = endTime;
      }
    });
    return maxEndTime;
  }

  /**
   * 그래프 렌더링 함수
   * @param {HTMLElement} vizElement - 렌더링할 DOM 요소
   * @param {Object} config - 설정 객체
   * @param {Object} [config.global] - 좌표 및 격자 설정
   * @param {Array} [config.functions] - 함수 목록
   * @param {Array} [config.dot] - 점 목록
   * @param {Array} [config.line] - 라인 목록
   * @param {Object} [config.animation] - 애니메이션 설정 (미포함시 모션 X)
   * @param {boolean} [config.animation.enabled=false] - 애니메이션 활성화 여부
   * @param {number} [config.animation.startTime=0] - 전체 애니메이션 시작 시간 (ms)
   * @param {number} [config.animation.duration=1000] - 각 레이어의 애니메이션 지속 시간 (ms)
   * @param {number} [config.animation.delay=400] - 레이어 간 시간 간격 (ms)
   * @param {string|Array<string>} [config.animation.effect='auto'] - 효과 ('auto': 타입별 자동, 'fade'|'slide'|'scale'|'draw'|'blink', 또는 배열로 중첩)
   * @param {string} [config.animation.easing='easeOut'] - 이징 함수 (linear, easeIn, easeOut, easeInOut)
   */
  function renderGraph(vizElement, config) {
    console.log('[VisualizationAPI] renderGraph:', vizElement);

    // 버전 정보 가져오기
    const versionInfo = getVersionInfo();
    const libraryName = versionInfo.fullName || 'Math Graph Library';

    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`${libraryName} 렌더링 시작(From API):`, vizElement.id);
      console.log(`테스트 ID: ${vizElement.id}`, config);
      console.log('='.repeat(60));

      const size = config.canvasSize || 500;

      // 기존 canvas가 있으면 재사용, 없으면 새로 생성
      let canvas = vizElement.querySelector('canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        vizElement.appendChild(canvas);
      }

      // 캔버스 크기 설정 (크기가 변경되었을 수 있으므로 항상 설정)
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext('2d');

      // 레이어 추가 헬퍼 함수
      const addLayerToList = (layers, layer) => {
        if (!layer) return;
        if (Array.isArray(layer)) {
          layers.push(...layer);
        } else {
          layers.push(layer);
        }
      };

      const doRender = () => {
        const stateConfig = config.global || {};

        // global에 좌표값이 있으면 autoSetCoordinatePlane을 false로 자동 설정
        const hasCoordinateValues = stateConfig.xMin !== undefined ||
                                     stateConfig.xMax !== undefined ||
                                     stateConfig.yMin !== undefined ||
                                     stateConfig.yMax !== undefined;

        if (hasCoordinateValues && config.autoSetCoordinatePlane === undefined) {
          // global 좌표값이 있고 사용자가 명시적으로 설정하지 않았으면 false
          stateConfig.autoSetCoordinatePlane = false;
        } else if (config.autoSetCoordinatePlane !== undefined) {
          // 사용자가 명시적으로 설정한 경우 그 값 사용
          stateConfig.autoSetCoordinatePlane = config.autoSetCoordinatePlane;
        }

        // 디버그 옵션 전달
        if (config.showDebugBoundingBox !== undefined) {
          stateConfig.showDebugBoundingBox = config.showDebugBoundingBox;
        }
        if (config.showDebugRectangle !== undefined) {
          stateConfig.showDebugRectangle = config.showDebugRectangle;
        }

        // ========================================================================
        // 좌표 복원 (Canvas 재사용 시 부드러운 전환을 위해)
        // ========================================================================
        const existingCanvasData = getCanvasTimeline(canvas);
        console.log('[Coordinates-Debug] existingCanvasData:', existingCanvasData);
        console.log('[Coordinates-Debug] hasCoordinateValues:', hasCoordinateValues);

        if (existingCanvasData?.lastCoordinates && !hasCoordinateValues) {
          // 사용자가 명시적으로 좌표를 제공하지 않은 경우에만 복원
          stateConfig.xMin = existingCanvasData.lastCoordinates.xMin;
          stateConfig.xMax = existingCanvasData.lastCoordinates.xMax;
          stateConfig.yMin = existingCanvasData.lastCoordinates.yMin;
          stateConfig.yMax = existingCanvasData.lastCoordinates.yMax;
          console.log(`[Coordinates] ✅ 이전 좌표 복원: [${stateConfig.xMin}, ${stateConfig.xMax}] × [${stateConfig.yMin}, ${stateConfig.yMax}]`);
        } else {
          console.log(`[Coordinates] ⚠️ 복원 실패 - lastCoordinates: ${!!existingCanvasData?.lastCoordinates}, hasCoordinateValues: ${hasCoordinateValues}`);
        }

        const coordConfig = create$1(stateConfig);

        // ========================================================================
        // 기존 레이어 불러오기 (Canvas 재사용 시)
        // ========================================================================
        // existingCanvasData는 위에서 이미 가져옴
        const layers = existingCanvasData && existingCanvasData.layers
          ? [...existingCanvasData.layers] // 기존 레이어 복사
          : [];

        const existingLayerCount = layers.length; // 기존 레이어 개수 저장

        if (existingCanvasData && existingCanvasData.layers) {
          console.log(`[Layers] 기존 레이어 ${existingCanvasData.layers.length}개 불러옴`);
        }

        // 레이어 리스트 렌더링 헬퍼 함수 (layers, coordConfig에 접근 가능한 위치)
        const renderLayerList = () => {
          // config.showLayerList로 제어
          if (coordConfig.showLayerList !== false) {
            try {
              drawLayerList(ctx, layers, size, {}, coordConfig);
            } catch (e) {
              console.warn('layerList 렌더링 실패:', e);
            }
          }
        };

        // 새 함수 레이어 생성
        if (config.functions && Array.isArray(config.functions)) {
          config.functions.forEach((func, index) => {
            let layer = convertPurposeToLayer(func, index);

            // layer가 배열인 경우 처리
            if (Array.isArray(layer)) {
              // 배열의 각 요소도 그룹이 아니면 감싸기
              const wrappedLayers = layer.map(l => {
                if (l && l.type !== 'group') {
                  const groupLayer = new Layer({
                    name: l.name,
                    type: 'group'
                  });
                  groupLayer.addChild(l);
                  return groupLayer;
                }
                return l;
              });
              addLayerToList(layers, wrappedLayers);
              return;
            }

            // layer가 null이면 스킵
            if (!layer) return;

            // 단일 함수 레이어인 경우 그룹으로 감싸기
            if (layer.type !== 'group') {
              const groupLayer = new Layer({
                name: layer.name,
                type: 'group'
              });
              groupLayer.addChild(layer);
              layer = groupLayer;
            }

            addLayerToList(layers, layer);
          });
        }

        // 최상단 dot/line 배열 지원
        try {
          const topDots = Array.isArray(config.dot) ? config.dot : [];
          const topLines = Array.isArray(config.line) ? config.line : [];
          if (topDots.length > 0 || topLines.length > 0) {
            // processExtras를 직접 호출하여 dot/line을 Layer로 변환
            const extraLayers = processExtras({ functions: { dot: topDots, line: topLines } });
            addLayerToList(layers, extraLayers);
          }
        } catch (e) {
          console.warn('Top-level dot/line 처리 중 오류:', e);
        }

        // 모든 함수 레이어에 자동으로 라벨 추가 (없는 경우)
        layers.forEach(layer => ensureFunctionLabels(layer));

        // 레이어 JSON 출력
        console.log(`\n[${vizElement.id}] Layers JSON:`, JSON.stringify(layers.map(l => serializeLayer(l)), null, 2));

        const hasAnimation = config.animation && config.animation.enabled;
        let animation = null;
        let previousEndTime = 0; // 재사용 시 이전 타임라인의 마지막 시간

        if (hasAnimation && LayerTimeline) {
          // ========================================================================
          // Canvas 재사용 감지 및 타임라인 오프셋 계산
          // ========================================================================
          const existingData = getCanvasTimeline(canvas);
          const isReuse = existingData && existingData.timeline;
          const baseOffset = isReuse ? existingData.lastEndTime : 0;
          previousEndTime = baseOffset; // 재생 시작 위치로 저장

          if (isReuse) {
            console.log(`[Timeline] Canvas 재사용 감지 - 기존 타임라인 마지막 시간: ${baseOffset}ms`);
            // 기존 타임라인 재사용
            animation = existingData.timeline;
          } else {
            console.log('[Timeline] 새 타임라인 생성 - 시작 시간: 0ms');
            // 새 타임라인 생성
            animation = new LayerTimeline();
          }

          // 애니메이션 기본값
          const defaults = {
            startTime: 0,
            duration: 1000,
            effect: 'auto',
            easing: 'easeOut'
          };

          if (config.animation.layers && Array.isArray(config.animation.layers)) {
            // 개별 레이어 애니메이션 설정
            config.animation.layers.forEach(animConfig => {
              animation.addAnimation(animConfig.layerId, {
                startTime: baseOffset + (animConfig.startTime || defaults.startTime),
                duration: animConfig.duration || defaults.duration,
                effect: animConfig.effect || defaults.effect,
                easing: animConfig.easing || defaults.easing
              });
            });
          } else {
            // 전역 애니메이션 설정
            const globalStartTime = config.animation.startTime || defaults.startTime;
            const delay = config.animation.delay || 400;
            const duration = config.animation.duration || defaults.duration;
            const effect = config.animation.effect || defaults.effect;
            const easing = config.animation.easing || defaults.easing;

            // 새로 추가된 레이어에만 애니메이션 등록
            const newLayers = layers.slice(existingLayerCount);
            console.log(`[Timeline] 새 레이어 ${newLayers.length}개에 애니메이션 등록`);

            newLayers.forEach((layer, index) => {
              // 렌더링 가능한 모든 자식 레이어의 ID 수집
              const renderableIds = [];
              const collectIds = (l) => {
                if (l.type === 'group' && l.children) {
                  l.children.forEach(child => collectIds(child));
                } else if (l.type !== 'group') {
                  renderableIds.push(l.id);
                }
              };
              collectIds(layer);

              // 각 렌더링 가능한 레이어에 애니메이션 등록 (baseOffset 적용)
              renderableIds.forEach(id => {
                animation.addAnimation(id, {
                  startTime: baseOffset + globalStartTime + (index * delay),
                  duration,
                  effect,
                  easing
                });
              });
            });
          }

          console.log('애니메이션 설정 완료:', animation);
        }

        const renderFrame = () => {
          ctx.clearRect(0, 0, size, size);

          if (animation) {
            const activeAnimations = animation.getActiveAnimations();
            render(ctx, layers, coordConfig, size, { activeAnimations });
          } else {
            render(ctx, layers, coordConfig, size);
          }

          renderLayerList();

          if (animation && animation.isPlaying) {
            requestAnimationFrame(renderFrame);
          } else if (animation) {
            // 애니메이션이 끝났을 때 최종 좌표 저장
            saveCoordinates();
          }
        };

        // 좌표 저장 함수
        const saveCoordinates = () => {
          const finalCoordinates = {
            xMin: coordConfig.xMin,
            xMax: coordConfig.xMax,
            yMin: coordConfig.yMin,
            yMax: coordConfig.yMax
          };

          if (animation) {
            setCanvasTimeline(canvas, animation, layers, finalCoordinates);
            const newEndTime = calculateTimelineEndTime(animation);
            console.log(`[Timeline] 타임라인 저장 완료 - 새 마지막 시간: ${newEndTime}ms`);
          } else {
            setCanvasTimeline(canvas, null, layers, finalCoordinates);
          }
          console.log(`[Coordinates] 좌표 저장: [${finalCoordinates.xMin}, ${finalCoordinates.xMax}] × [${finalCoordinates.yMin}, ${finalCoordinates.yMax}]`);
        };

        if (animation) {
          // 재사용 시 이전 마지막 시간부터 재생 시작
          if (previousEndTime > 0) {
            animation.currentTime = previousEndTime;
            console.log(`[Timeline] 재생 시작 위치: ${previousEndTime}ms`);
          }
          animation.play();
        } else {
          // 애니메이션 없는 경우 첫 렌더링 후 바로 저장
          renderFrame();
          saveCoordinates();
        }

        // 애니메이션이 있는 경우 첫 렌더링 (루프가 시작되고 끝날 때 저장됨)
        if (animation) {
          renderFrame();
        }

        console.log(`${libraryName} 렌더링 완료(From API):`, vizElement.id);
      };

      if (document.fonts && document.fonts.load) {
        Promise.all([
          document.fonts.load('16px KaTeX_Main'),
          document.fonts.load('16px KaTeX_Math')
        ]).then(() => {
          console.log('KaTeX 폰트 로딩 완료');
          doRender();
        }).catch(err => {
          console.warn('KaTeX 폰트 로딩 실패, fallback 폰트 사용:', err);
          doRender();
        });
      } else {
        doRender();
      }
    } catch (error) {
      console.error(`${libraryName} 렌더링 실패(From API):`, vizElement.id, error);
      vizElement.innerHTML = `<div style="color: red; text-align: center; padding: 20px;">그래프 렌더링 실패: ${error.message}</div>`;
    }
  }

  exports.renderGraph = renderGraph;

}));
//# sourceMappingURL=visualization-api.js.map

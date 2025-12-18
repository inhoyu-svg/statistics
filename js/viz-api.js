/**
 * Visualization API
 * External API for creating charts and tables easily
 */

import CONFIG from './config.js';
import DataProcessor from './core/processor.js';
import { ParserAdapter } from './core/parsers/index.js';
import ChartRenderer from './renderers/chart.js';
import TableRenderer from './renderers/table.js';
import ScatterRenderer from './renderers/scatter.js';
import { waitForFonts } from './utils/katex.js';
import { applyChartCorruption, applyTableCorruption, applyScatterCorruption } from './utils/corruption.js';
import { ConfigValidator } from './utils/validator.js';

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
export async function render(element, config) {
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

export async function renderChart(element, config) {
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
 * 테이블 데이터 변경 감지 (null → 실제값)
 * @param {Object} prevData - 이전 파싱 데이터
 * @param {Object} currData - 현재 파싱 데이터
 * @returns {Array} 변경된 셀 목록 [{rowIndex, colIndex, newValue}, ...]
 */
function diffTableData(prevData, currData) {
  const changes = [];
  if (!prevData?.rows || !currData?.rows) return changes;

  currData.rows.forEach((currRow, rowIdx) => {
    const prevRow = prevData.rows[rowIdx];
    if (!prevRow) return;

    currRow.values.forEach((currValue, colIdx) => {
      const prevValue = prevRow.values[colIdx];
      // null → 실제값 변경 감지
      if (prevValue === null && currValue !== null) {
        changes.push({
          rowIndex: rowIdx + 1,  // 헤더 제외 (1-based)
          colIndex: colIdx + 1,  // 라벨 컬럼 제외 (1-based)
          newValue: currValue
        });
      }
    });
  });
  return changes;
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
 * @param {boolean} [config.options.showGrid=true] - Show grid lines (false: rounded border instead)
 * @returns {Promise<Object>} { tableRenderer, canvas, parsedData? } or { error }
 */
export async function renderTable(element, config) {
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

    // 4. data-viz-canvas 속성으로 타겟 캔버스 확인
    const canvasContainerId = element.getAttribute('data-viz-canvas');
    let targetContainer = element;
    let isAdditionalRender = false;

    if (canvasContainerId) {
      const existingContainer = document.getElementById(canvasContainerId);
      if (existingContainer) {
        targetContainer = existingContainer;
        isAdditionalRender = true;
        console.log(`[viz-api] table data-viz-canvas 발견: ${element.id} → ${canvasContainerId}`);
      } else {
        console.warn(`[viz-api] table data-viz-canvas 대상을 찾을 수 없음: ${canvasContainerId}`);
      }
    }

    // 5. 캔버스 생성 또는 재사용
    let canvas, canvasId, tableRenderer;

    if (isAdditionalRender) {
      // 기존 캔버스 및 TableRenderer 인스턴스 재사용
      canvas = targetContainer.querySelector('canvas');
      if (!canvas) {
        return { error: `No canvas found in target container: ${canvasContainerId}` };
      }
      canvasId = canvas.id;

      // 기존 TableRenderer 인스턴스 재사용
      if (canvas.__tableRenderer) {
        tableRenderer = canvas.__tableRenderer;
        console.log(`[viz-api] 기존 TableRenderer 재사용: ${canvasId}`);
      } else {
        tableRenderer = new TableRenderer(canvasId);
        canvas.__tableRenderer = tableRenderer;
        console.warn(`[viz-api] TableRenderer 인스턴스가 없어 새로 생성: ${canvasId}`);
      }
    } else {
      // 새 캔버스 생성
      canvasId = `viz-table-${++tableInstanceCounter}`;
      canvas = document.createElement('canvas');
      canvas.id = canvasId;
      canvas.width = config.canvasWidth || CONFIG.TABLE_DEFAULT_WIDTH || 600;
      canvas.height = config.canvasHeight || CONFIG.TABLE_DEFAULT_HEIGHT || 400;
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', 'Data table');
      element.appendChild(canvas);

      tableRenderer = new TableRenderer(canvasId);
      canvas.__tableRenderer = tableRenderer;
    }

    // 테이블 설정 구성
    const tableConfig = {
      canvasWidth: config.canvasWidth,
      canvasHeight: config.canvasHeight,
      showGrid: options.showGrid  // 그리드 표시 여부 (undefined면 기본값 true)
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
      // showGrid: false일 때 자동으로 showMergedHeader, showTotal도 false
      if (options.showGrid === false) {
        parseResult.data.showMergedHeader = options.showMergedHeader ?? false;
        parseResult.data.showTotal = options.showTotal ?? false;
      } else {
        if (options.showTotal !== undefined) {
          parseResult.data.showTotal = options.showTotal;
        }
        if (options.showMergedHeader !== undefined) {
          parseResult.data.showMergedHeader = options.showMergedHeader;
        }
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

    // 추가 렌더링인 경우: 데이터 비교 및 fadeIn 애니메이션
    if (isAdditionalRender && canvas.__previousTableData) {
      const prevData = canvas.__previousTableData;
      const changes = diffTableData(prevData, finalParseResult.data);

      if (changes.length > 0) {
        console.log(`[viz-api] 테이블 변경 감지: ${changes.length}개 셀 fadeIn`);
        tableRenderer.updateCellsWithAnimation(changes);
      }

      // Apply cell animations if specified (추가 렌더링에서도 적용)
      applyCellAnimationsFromConfig(tableRenderer, config);
    } else {
      // 새 렌더링: 테이블 전체 그리기
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
    }

    // 현재 데이터 저장 (다음 비교용)
    canvas.__previousTableData = JSON.parse(JSON.stringify(finalParseResult.data));

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
export async function renderScatter(element, config) {
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
export function addCellAnimation(tableRenderer, options) {
  if (!tableRenderer) return { error: 'tableRenderer is required' };
  return tableRenderer.addAnimation(options);
}

/**
 * 특정 셀 애니메이션 삭제
 * @param {TableRenderer} tableRenderer - 테이블 렌더러 인스턴스
 * @param {number} id - 삭제할 애니메이션 ID
 */
export function removeCellAnimation(tableRenderer, id) {
  if (!tableRenderer) return;
  tableRenderer.removeAnimation(id);
}

/**
 * 저장된 셀 애니메이션 목록 조회
 * @param {TableRenderer} tableRenderer - 테이블 렌더러 인스턴스
 * @returns {Array} 애니메이션 배열 [{ id, rowIndex, colIndex, duration, repeat }, ...]
 */
export function getCellAnimations(tableRenderer) {
  if (!tableRenderer) return [];
  return tableRenderer.getSavedAnimations();
}

/**
 * 저장된 모든 셀 애니메이션 재생
 * @param {TableRenderer} tableRenderer - 테이블 렌더러 인스턴스
 * @param {Object} [options] - 재생 옵션
 * @param {boolean} [options.blinkEnabled=false] - 블링크 효과 활성화
 */
export function playCellAnimations(tableRenderer, options = {}) {
  if (!tableRenderer) return;
  tableRenderer.playAllAnimations(options);
}

/**
 * 셀 애니메이션 재생 중지 (목록은 유지)
 * @param {TableRenderer} tableRenderer - 테이블 렌더러 인스턴스
 */
export function stopCellAnimations(tableRenderer) {
  if (!tableRenderer) return;
  tableRenderer.stopCellAnimation();
}

/**
 * 모든 셀 애니메이션 초기화 (중지 + 목록 삭제)
 * @param {TableRenderer} tableRenderer - 테이블 렌더러 인스턴스
 */
export function clearCellAnimations(tableRenderer) {
  if (!tableRenderer) return;
  tableRenderer.stopCellAnimation();
  tableRenderer.clearSavedAnimations();
}

export default {
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

/**
 * Visualization API
 * External API for creating charts and tables easily
 */

import CONFIG from './config.js';
import DataProcessor from './core/processor.js';
import { ParserFactory } from './core/parsers/index.js';
import ChartRenderer from './renderers/chart.js';
import TableRenderer from './renderers/table.js';
import tableStore from './core/tableStore.js';
import { waitForFonts } from './utils/katex.js';

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
 * @param {Object} [config.classRange] - Custom class range (overrides classCount/classWidth)
 * @param {number} config.classRange.firstEnd - First class end value (e.g., 10 for 0~10)
 * @param {number} config.classRange.secondEnd - Second class end value (determines interval)
 * @param {number} config.classRange.lastStart - Last class start value
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
      null
    );

    // 10. Play animation
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
 * @param {string} [config.tableType='frequency'] - Table type
 *   ('frequency' | 'category-matrix' | 'cross-table' | 'stem-leaf')
 * @param {string} config.data - Raw data string (format depends on tableType)
 * @param {number} [config.classCount=5] - Number of classes (for frequency table)
 * @param {number} [config.classWidth] - Class width (auto-calculated if not specified)
 * @param {Object} [config.classRange] - Custom class range (for frequency table, overrides classCount/classWidth)
 * @param {number} config.classRange.firstEnd - First class end value
 * @param {number} config.classRange.secondEnd - Second class end value (determines interval)
 * @param {number} config.classRange.lastStart - Last class start value
 * @param {Object} [config.options] - Additional options
 * @param {Object} [config.options.tableConfig] - Table configuration
 * @param {boolean} [config.options.animation=true] - Enable animation
 * @param {Object} [config.options.crossTable] - Cross-table specific options
 * @param {boolean} [config.options.crossTable.showTotal=true] - Show total row
 * @param {boolean} [config.options.crossTable.showMergedHeader=true] - Show merged header
 * @returns {Promise<Object>} { tableRenderer, canvas, classes?, stats?, parsedData? } or { error }
 */
export async function renderTable(element, config) {
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

    // 2. Get table type
    const tableType = config.tableType || 'frequency';

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

    // Process options
    const options = config.options || {};
    const baseTableConfig = options.tableConfig || {};
    // canvasWidth/canvasHeight를 tableConfig에 포함 (사용자 설정 우선)
    const tableConfig = {
      ...baseTableConfig,
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

    // 6. Handle by table type
    if (tableType === 'frequency') {
      // Frequency table: use DataProcessor
      const rawData = DataProcessor.parseInput(dataString);
      if (rawData.length === 0) {
        return { error: 'No valid numeric data found' };
      }

      const stats = DataProcessor.calculateBasicStats(rawData);
      const classCount = config.classCount || 5;
      const classWidth = config.classWidth || null;
      const customRange = config.classRange || null;
      const { classes } = DataProcessor.createClasses(stats, classCount, classWidth, customRange);

      DataProcessor.calculateFrequencies(rawData, classes);
      DataProcessor.calculateRelativeAndCumulative(classes, rawData.length);

      tableRenderer.draw(classes, rawData.length, tableConfig);

      // Apply cell variables if specified
      if (tableConfig?.cellVariables && Array.isArray(tableConfig.cellVariables)) {
        applyCellVariables(classes, tableConfig.cellVariables, tableRenderer.tableId);
        // Re-render to apply cell variables
        tableRenderer.draw(classes, rawData.length, tableConfig);
      }

      // Apply cell animations if specified
      applyCellAnimationsFromConfig(tableRenderer, config);

      return {
        tableRenderer,
        canvas,
        classes,
        stats
      };
    } else {
      // Custom table types: use ParserFactory
      const parseResult = ParserFactory.parse(tableType, dataString);
      if (!parseResult.success) {
        return { error: parseResult.error || 'Failed to parse data' };
      }

      // Apply cross-table specific options
      if (tableType === 'cross-table') {
        const crossTableOptions = options.crossTable || {};
        if (crossTableOptions.showTotal !== undefined) {
          parseResult.data.showTotal = crossTableOptions.showTotal;
        }
        if (crossTableOptions.showMergedHeader !== undefined) {
          parseResult.data.showMergedHeader = crossTableOptions.showMergedHeader;
        }
      }

      // Apply cell variables if specified (for custom table types)
      let finalParseResult = parseResult;
      if (config.cellVariables && Array.isArray(config.cellVariables)) {
        finalParseResult = applyCellVariablesGeneric(config.cellVariables, parseResult, tableType);
      }

      tableRenderer.drawCustomTable(tableType, finalParseResult.data, tableConfig);

      // Apply cell animations if specified
      applyCellAnimationsFromConfig(tableRenderer, config);

      return {
        tableRenderer,
        canvas,
        parsedData: parseResult.data
      };
    }

  } catch (error) {
    console.error('renderTable error:', error);
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
 * Apply cell variables to table cells
 * @param {Array} classes - Class data array
 * @param {Array} cellVariables - Cell variable definitions
 * @param {string} tableId - Table ID
 */
function applyCellVariables(classes, cellVariables, tableId) {
  // Column name → index mapping
  const columnMap = {
    'class': 0,
    'midpoint': 1,
    'tally': 2,
    'frequency': 3,
    'relativeFrequency': 4,
    'cumulativeFrequency': 5,
    'cumulativeRelativeFrequency': 6
  };

  cellVariables.forEach(cv => {
    // Find row index by class range
    const rowIndex = classes.findIndex(c =>
      `${c.min}~${c.max}` === cv.class
    );
    if (rowIndex === -1) return;

    const colIndex = columnMap[cv.column];
    if (colIndex === undefined) return;

    tableStore.setCellVariable(tableId, rowIndex, colIndex, cv.value);
  });
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
    } else if (tableType === 'cross-table') {
      applyCellVariableToCrossTable(data, dataRowIndex, cv.colIndex, cv.value);
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
 * Apply cell variable to cross-table data
 */
function applyCellVariableToCrossTable(data, dataRowIndex, colIndex, value) {
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

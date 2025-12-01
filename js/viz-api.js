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
 * @param {Object} [config.options] - Additional options
 * @param {Object} [config.options.axisLabels] - Axis labels { xAxis, yAxis }
 * @param {string} [config.options.dataType='relativeFrequency'] - Data type ('frequency' | 'relativeFrequency')
 * @param {boolean} [config.options.showHistogram=true] - Show histogram bars
 * @param {boolean} [config.options.showPolygon=true] - Show frequency polygon
 * @param {boolean} [config.options.animation=true] - Enable animation
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

    // 10. Play animation (draw() sets currentTime to 100%, so reset and play)
    if (animation) {
      chartRenderer.timeline.seekTo(0);
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
    const tableConfig = options.tableConfig || null;
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
      const { classes } = DataProcessor.createClasses(stats, classCount, classWidth);

      DataProcessor.calculateFrequencies(rawData, classes);
      DataProcessor.calculateRelativeAndCumulative(classes, rawData.length);

      tableRenderer.draw(classes, rawData.length, tableConfig);

      // Apply cell variables if specified
      if (tableConfig?.cellVariables && Array.isArray(tableConfig.cellVariables)) {
        applyCellVariables(classes, tableConfig.cellVariables, tableRenderer.tableId);
        // Re-render to apply cell variables
        tableRenderer.draw(classes, rawData.length, tableConfig);
      }

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

      tableRenderer.drawCustomTable(tableType, parseResult.data, tableConfig);

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

export default { render, renderChart, renderTable };

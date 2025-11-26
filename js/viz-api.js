/**
 * Visualization API
 * External API for creating charts easily
 */

import CONFIG from './config.js';
import DataProcessor from './core/processor.js';
import ChartRenderer from './renderers/chart.js';

// Counter for unique ID generation
let chartInstanceCounter = 0;

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
 * @param {boolean} [config.options.animation=true] - Enable animation
 * @returns {Object} { chartRenderer, canvas, classes } or { error }
 */
export function renderChart(element, config) {
  try {
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

export default { renderChart };

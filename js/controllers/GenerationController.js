/**
 * 도수분포표 생성 컨트롤러
 * 데이터 처리, 테이블/차트 생성, JSON 내보내기/불러오기
 */

import CONFIG from '../config.js';
import Utils from '../utils/utils.js';
import Validator from '../utils/validator.js';
import MessageManager from '../utils/message.js';
import DataProcessor from '../core/processor.js';
import { ParserFactory } from '../core/parsers/index.js';
import UIRenderer from '../renderers/ui.js';
import TableRenderer from '../renderers/table.js';
import DataStore from '../core/dataStore.js';
import ChartStore from '../core/chartStore.js';
import DatasetStore from '../core/datasetStore.js';
import * as KatexUtils from '../utils/katex.js';
import { applyChartCorruption } from '../utils/corruption.js';

/**
 * @class GenerationController
 * @description 도수분포표 생성 및 JSON 내보내기/불러오기 관리
 */
class GenerationController {
  /**
   * @param {FrequencyDistributionApp} app - 메인 애플리케이션 인스턴스
   */
  constructor(app) {
    this.app = app;
  }

  /**
   * 계급 범위 편집기 이벤트 리스너 등록
   */
  initClassRangeEditor() {
    const firstStartInput = document.getElementById('firstStart');
    const secondStartInput = document.getElementById('secondStart');
    const lastEndInput = document.getElementById('lastEnd');
    const intervalDisplay = document.getElementById('intervalDisplay');
    const applyBtn = document.getElementById('applyClassRangeBtn');

    const updateDisplayValues = () => {
      const firstStart = parseFloat(firstStartInput?.value) || 0;
      const secondStart = parseFloat(secondStartInput?.value) || 2;
      const lastEnd = parseFloat(lastEndInput?.value) || 20;

      const interval = secondStart - firstStart;
      if (intervalDisplay) {
        intervalDisplay.textContent = `(간격: ${interval})`;
      }
    };

    firstStartInput?.addEventListener('input', updateDisplayValues);
    secondStartInput?.addEventListener('input', updateDisplayValues);
    lastEndInput?.addEventListener('input', updateDisplayValues);

    applyBtn?.addEventListener('click', () => {
      this.regenerateWithCustomRange();
    });
  }

  /**
   * 계급 범위 편집기 표시 및 초기값 설정
   * @param {Array} classes - 계급 배열
   */
  showClassRangeEditor(classes) {
    const editor = document.getElementById('classRangeEditor');
    if (!editor) return;

    editor.style.display = 'block';

    if (classes.length >= 2) {
      const firstStart = classes[0].min;
      const secondStart = classes[1].min;
      const lastEnd = classes[classes.length - 1].max;

      const firstStartInput = document.getElementById('firstStart');
      const secondStartInput = document.getElementById('secondStart');
      const lastEndInput = document.getElementById('lastEnd');

      if (firstStartInput) firstStartInput.value = firstStart;
      if (secondStartInput) secondStartInput.value = secondStart;
      if (lastEndInput) lastEndInput.value = lastEnd;
    }
  }

  /**
   * 커스텀 범위로 도수분포표 재생성
   */
  regenerateWithCustomRange() {
    try {
      const firstStart = parseFloat(document.getElementById('firstStart')?.value);
      const secondStart = parseFloat(document.getElementById('secondStart')?.value);
      const lastEnd = parseFloat(document.getElementById('lastEnd')?.value);

      if (firstStart === undefined || !secondStart || !lastEnd) return;

      // 루프 전 초기화 (generate()와 동일)
      this.app.chartRenderer.canvas.width = CONFIG.CANVAS_WIDTH;
      this.app.chartRenderer.canvas.height = CONFIG.CANVAS_HEIGHT;
      this.app.chartRenderer.clear();
      this.app.chartRenderer.layerManager.root.children = [];
      this.app.chartRenderer.timeline.animations = new Map();
      this.app.chartRenderer.timeline.timeline = [];
      this.app.chartRenderer.timeline.currentTime = 0;
      this.app.chartRenderer.timeline.duration = 0;
      this.app.chartRenderer.lastHighlightInfo = null;

      const customRange = { firstStart, secondStart, lastEnd };

      const allDatasetInputs = this.app.datasetController.getAllDatasetInputValues();
      if (allDatasetInputs.length === 0) return;

      const customLabels = this.app.tableConfigController.getCustomLabels();
      const tableConfig = this.app.tableConfigController.getTableConfigWithAlignment();
      const dataType = ChartStore.getDataType();

      const processedDatasets = [];

      for (let i = 0; i < allDatasetInputs.length; i++) {
        const inputValues = allDatasetInputs[i];

        try {
          const data = DataProcessor.parseInput(inputValues.rawData);
          if (data.length === 0) continue;

          const stats = DataProcessor.calculateBasicStats(data);
          const { classes } = DataProcessor.createClasses(stats, 0, null, customRange);
          DataProcessor.calculateFrequencies(data, classes);
          DataProcessor.calculateRelativeAndCumulative(classes, data.length);

          const ellipsisInfo = DataProcessor.shouldShowEllipsis(classes);

          if (this.app.tableRenderers[i]) {
            this.app.tableRenderers[i].draw(classes, data.length, tableConfig);
          }

          processedDatasets.push({
            datasetId: inputValues.datasetId,
            data,
            stats,
            classes,
            ellipsisInfo,
            settings: inputValues.settings
          });

        } catch (error) {
          console.error(`데이터셋 ${inputValues.datasetId} 처리 오류:`, error);
        }
      }

      if (processedDatasets.length === 0) return;

      const firstDataset = processedDatasets[0];
      DataStore.setData(firstDataset.data, firstDataset.stats, firstDataset.classes);
      ChartStore.setConfig(customLabels.axis, firstDataset.ellipsisInfo);

      // 통합 좌표 시스템 계산
      let unifiedMaxY = 0;
      let unifiedClassCount = 0;
      let unifiedEllipsisInfo = null;

      for (const dataset of processedDatasets) {
        const freq = dataset.classes.map(c => c.frequency);
        const total = freq.reduce((a, b) => a + b, 0);

        unifiedClassCount = Math.max(unifiedClassCount, dataset.classes.length);

        if (!unifiedEllipsisInfo) {
          unifiedEllipsisInfo = dataset.ellipsisInfo;
        } else if (!dataset.ellipsisInfo.show) {
          unifiedEllipsisInfo = dataset.ellipsisInfo;
        } else if (unifiedEllipsisInfo.show && dataset.ellipsisInfo.show) {
          if (dataset.ellipsisInfo.firstDataIndex < unifiedEllipsisInfo.firstDataIndex) {
            unifiedEllipsisInfo = dataset.ellipsisInfo;
          }
        }

        if (total > 0) {
          if (dataType === 'frequency') {
            unifiedMaxY = Math.max(unifiedMaxY, Math.max(...freq));
          } else {
            const relativeFreqs = freq.map(f => f / total);
            unifiedMaxY = Math.max(unifiedMaxY, Math.max(...relativeFreqs) * CONFIG.CHART_Y_SCALE_MULTIPLIER);
          }
        }
      }

      // 모든 데이터셋 차트 렌더링
      for (let i = 0; i < processedDatasets.length; i++) {
        const dataset = processedDatasets[i];

        CONFIG.SHOW_HISTOGRAM = dataset.settings.showHistogram;
        CONFIG.SHOW_POLYGON = dataset.settings.showPolygon;
        CONFIG.POLYGON_COLOR_PRESET = dataset.settings.colorPreset;
        CONFIG.HISTOGRAM_COLOR_PRESET = dataset.settings.histogramColorPreset || 'default';
        CONFIG.SHOW_BAR_LABELS = dataset.settings.showBarLabels;
        CONFIG.SHOW_DASHED_LINES = dataset.settings.showDashedLines;
        CONFIG.SHOW_CONGRUENT_TRIANGLES = dataset.settings.showTriangles;
        // 경계값 → 인덱스 변환
        let triangleIndex = 0;
        if (dataset.settings.triangleBoundary !== null) {
          const boundary = dataset.settings.triangleBoundary;
          for (let j = 0; j < dataset.classes.length; j++) {
            if (dataset.classes[j].max === boundary) {
              triangleIndex = j;
              break;
            }
          }
        }
        CONFIG.CONGRUENT_TRIANGLE_INDEX = triangleIndex;
        CONFIG.SHOW_CALLOUT = dataset.settings.showCallout;

        const clearCanvas = (i === 0);
        const customYInterval = this.app.chartSettingsController.getCustomYInterval();

        this.app.chartRenderer.draw(
          dataset.classes,
          customLabels.axis,
          unifiedEllipsisInfo,
          dataType,
          tableConfig,
          dataset.settings.calloutTemplate,
          clearCanvas,
          unifiedMaxY,
          unifiedClassCount,
          customYInterval
        );
      }

      this.app.layerPanelController.renderLayerPanel();

    } catch (error) {
      console.error('Custom range error:', error);
      MessageManager.warning(`범위 설정 오류: ${error.message}`);
    }
  }

  /**
   * 산점도 처리
   * @param {Object} inputValues - 데이터셋 입력값
   * @param {boolean} reset - 리셋 모드 여부
   * @param {number} processedCount - 현재까지 처리된 데이터셋 수
   * @returns {Object}
   */
  processScatter(inputValues, reset, processedCount) {
    const { rawData, datasetId } = inputValues;

    try {
      // 산점도 데이터 파싱
      let scatterData;
      try {
        // JSON 배열 형식: [[x,y], [x,y], ...]
        scatterData = JSON.parse(rawData);
      } catch (e) {
        // (x,y) 또는 x,y 형식 파싱 시도
        const points = rawData.match(/\(?\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)?/g);
        if (points) {
          scatterData = points.map(p => {
            const match = p.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
            return [parseFloat(match[1]), parseFloat(match[2])];
          });
        } else {
          throw new Error('산점도 데이터 형식이 올바르지 않습니다. 예: [[10,20], [15,35]] 또는 (10,20) (15,35)');
        }
      }

      if (!Array.isArray(scatterData) || scatterData.length < 2) {
        MessageManager.warning(`데이터셋 ${datasetId}: 최소 2개 이상의 데이터 포인트가 필요합니다.`);
        return { success: false, error: '데이터 부족' };
      }

      // 산점도 설정 추출
      const settings = inputValues.settings || {};
      const pointSize = settings.scatterPointSize || 6;
      const colorPreset = settings.scatterColorPreset || 'default';
      const xLabel = settings.scatterXLabel || '';
      const yLabel = settings.scatterYLabel || '';

      // 색상 프리셋 → 실제 색상 변환
      const colorMap = {
        'default': '#8DCF66',
        'primary': '#61C1F9',
        'secondary': '#D96BCB',
        'tertiary': '#F3A257'
      };
      const pointColor = colorMap[colorPreset] || colorMap['default'];

      // Corruption 설정
      const corruptionEnabled = settings.corruptionEnabled || false;
      const corruptionCells = settings.corruptionCells || '';
      const corruptionEdgeColor = settings.corruptionEdgeColor ?? true;
      const corruptionFiber = settings.corruptionFiber ?? false;

      // viz-api를 통해 산점도 렌더링
      const config = {
        purpose: 'scatter',
        data: scatterData,
        animation: false,
        options: {
          pointSize,
          pointColor,
          axisLabels: (xLabel || yLabel) ? {
            xAxis: xLabel,
            yAxis: yLabel
          } : undefined,
          corruption: corruptionEnabled && corruptionCells ? {
            enabled: true,
            cells: corruptionCells,
            style: {
              edgeColorEnabled: corruptionEdgeColor,
              fiberEnabled: corruptionFiber
            }
          } : undefined
        }
      };

      // 차트 컨테이너에서 산점도 wrapper 찾기/생성
      const chartCanvas = this.app.chartRenderer.canvas;
      const chartContainer = chartCanvas.closest('.chart-container');

      // 기존 산점도 캔버스 제거
      const existingScatter = chartContainer?.querySelector('.scatter-canvas-wrapper')
      if (existingScatter) {
        existingScatter.remove();
      }

      // 산점도용 wrapper 생성
      const scatterWrapper = document.createElement('div');
      scatterWrapper.className = 'scatter-canvas-wrapper';
      chartCanvas.parentElement.insertBefore(scatterWrapper, chartCanvas);

      // viz-api 호출
      import('../viz-api.js').then(VizAPI => {
        VizAPI.render(scatterWrapper, config);
      });

      MessageManager.success('산점도가 생성되었습니다.');
      return { success: true };

    } catch (error) {
      console.error(`산점도 처리 오류 (데이터셋 ${datasetId}):`, error);
      MessageManager.warning(`데이터셋 ${datasetId}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 커스텀 테이블 타입 처리
   * @param {Object} inputValues - 데이터셋 입력값
   * @param {boolean} reset - 리셋 모드 여부
   * @param {number} processedCount - 현재까지 처리된 데이터셋 수
   * @returns {Object}
   */
  processCustomTableType(inputValues, reset, processedCount) {
    const { tableType, rawData, datasetId } = inputValues;

    try {
      const parseResult = ParserFactory.parse(tableType, rawData);

      if (!parseResult.success) {
        MessageManager.warning(`데이터셋 ${datasetId}: ${parseResult.error}`);
        return { success: false, error: parseResult.error };
      }

      const validation = Validator.validateByType(tableType, rawData);
      if (!validation.valid) {
        MessageManager.warning(`데이터셋 ${datasetId}: ${validation.message}`);
        return { success: false, error: validation.message };
      }

      let currentTableRenderer;
      if (reset && processedCount === 0) {
        currentTableRenderer = this.app.tableRenderers[0];
      } else {
        currentTableRenderer = this.createNewTable();
      }

      currentTableRenderer.drawCustomTable(tableType, parseResult.data, null);

      const typeInfo = CONFIG.TABLE_TYPE_INFO[tableType];
      MessageManager.success(`${typeInfo?.name || '테이블'}이(가) 생성되었습니다.`);

      return { success: true };

    } catch (error) {
      console.error(`커스텀 테이블 처리 오류 (데이터셋 ${datasetId}):`, error);
      MessageManager.warning(`데이터셋 ${datasetId}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 도수분포표 생성 메인 로직
   * @param {boolean} reset - true: 기존 테이블 초기화 후 새로 생성
   */
  async generate(reset = true) {
    try {
      await KatexUtils.waitForFonts();
      MessageManager.hide();

      const allDatasetInputs = this.app.datasetController.getAllDatasetInputValues();

      if (allDatasetInputs.length === 0) {
        MessageManager.error('데이터를 입력해주세요!');
        return;
      }

      if (reset) {
        this.clearExtraTables();
        this.app.chartRenderer.canvas.width = CONFIG.CANVAS_WIDTH;
        this.app.chartRenderer.canvas.height = CONFIG.CANVAS_HEIGHT;
        this.app.chartRenderer.clear();
        this.app.chartRenderer.layerManager.root.children = [];
        this.app.chartRenderer.timeline.animations = new Map();
        this.app.chartRenderer.timeline.timeline = [];
        this.app.chartRenderer.timeline.currentTime = 0;
        this.app.chartRenderer.timeline.duration = 0;

        // 산점도 wrapper 제거 및 차트 캔버스 복원
        const chartCanvas = this.app.chartRenderer.canvas;
        const chartContainer = chartCanvas.closest('.chart-container');
        const existingScatter = chartContainer?.querySelector('.scatter-canvas-wrapper');
        if (existingScatter) {
          existingScatter.remove();
        }
        chartCanvas.style.display = '';
        const chartTitle = chartContainer?.querySelector('h2');
        if (chartTitle) {
          chartTitle.style.display = '';
        }
      }

      let processedCount = 0;
      const processedDatasets = [];

      // 현재 시각화 타입 확인 (첫 번째 데이터셋 기준)
      const currentVizType = allDatasetInputs[0]?.vizType || 'chart';

      // 시각화 타입에 따라 다른 타입의 결과물 정리
      const chartCanvas = this.app.chartRenderer.canvas;
      const chartContainer = chartCanvas.closest('.chart-container');

      if (currentVizType === 'scatter') {
        // 산점도 모드: 차트 캔버스 숨기기
        chartCanvas.style.display = 'none';
        const chartTitle = chartContainer?.querySelector('h2');
        if (chartTitle) chartTitle.style.display = 'none';
      } else {
        // 차트/테이블 모드: 산점도 wrapper 제거, 차트 캔버스 복원
        const existingScatter = chartContainer?.querySelector('.scatter-canvas-wrapper');
        if (existingScatter) existingScatter.remove();
        chartCanvas.style.display = '';
        const chartTitle = chartContainer?.querySelector('h2');
        if (chartTitle) chartTitle.style.display = '';
      }

      for (let i = 0; i < allDatasetInputs.length; i++) {
        const inputValues = allDatasetInputs[i];
        const vizType = inputValues.vizType || 'chart';
        const tableType = inputValues.tableType || CONFIG.TABLE_TYPES.FREQUENCY;

        try {
          // 산점도 처리
          if (vizType === 'scatter') {
            const scatterResult = this.processScatter(inputValues, reset, processedCount);
            if (scatterResult.success) {
              processedCount++;
            }
            continue;
          }

          // 테이블 처리 (차트가 아닌 테이블 타입)
          if (vizType === 'table' || tableType !== CONFIG.TABLE_TYPES.FREQUENCY) {
            const customResult = this.processCustomTableType(inputValues, reset, processedCount);
            if (customResult.success) {
              processedCount++;
            }
            continue;
          }

          const data = DataProcessor.parseInput(inputValues.rawData);

          const dataValidation = Validator.validateData(data);
          if (!dataValidation.valid) {
            MessageManager.warning(`데이터셋 ${inputValues.datasetId}: ${dataValidation.message}`);
            continue;
          }

          const classCountValidation = Validator.validateClassCount(inputValues.classCount);
          if (!classCountValidation.valid) {
            MessageManager.warning(`데이터셋 ${inputValues.datasetId}: ${classCountValidation.message}`);
            continue;
          }

          const classWidthValidation = Validator.validateClassWidth(inputValues.classWidth);
          if (!classWidthValidation.valid) {
            MessageManager.warning(`데이터셋 ${inputValues.datasetId}: ${classWidthValidation.message}`);
            continue;
          }

          const stats = DataProcessor.calculateBasicStats(data);
          const { classes } = DataProcessor.createClasses(stats, inputValues.classCount, inputValues.classWidth);
          DataProcessor.calculateFrequencies(data, classes);
          DataProcessor.calculateRelativeAndCumulative(classes, data.length);

          const ellipsisInfo = DataProcessor.shouldShowEllipsis(classes);

          let currentTableRenderer;
          if (reset && processedCount === 0) {
            currentTableRenderer = this.app.tableRenderers[0];
          } else if (!reset || processedCount > 0) {
            currentTableRenderer = this.createNewTable();
          }

          const tableConfig = this.app.tableConfigController.getTableConfigWithAlignment();
          currentTableRenderer.draw(classes, data.length, tableConfig);

          processedDatasets.push({
            datasetId: inputValues.datasetId,
            data,
            stats,
            classes,
            ellipsisInfo,
            settings: inputValues.settings
          });

          DatasetStore.updateDataset(inputValues.datasetId, {
            data,
            stats,
            classes,
            ellipsisInfo,
            settings: inputValues.settings
          });

          processedCount++;

        } catch (error) {
          console.error(`데이터셋 ${inputValues.datasetId} 처리 오류:`, error);
          MessageManager.warning(`데이터셋 ${inputValues.datasetId}: ${error.message}`);
        }
      }

      if (processedCount === 0) {
        MessageManager.error('처리할 수 있는 유효한 데이터가 없습니다.');
        return;
      }

      if (processedDatasets.length > 0) {
        const firstDataset = processedDatasets[0];
        UIRenderer.renderStatsCards(firstDataset.stats);

        const customLabels = this.app.tableConfigController.getCustomLabels();
        const tableConfig = this.app.tableConfigController.getDefaultTableConfig();
        const dataType = ChartStore.getDataType();

        // 통합 좌표 시스템 계산
        let unifiedMaxY = 0;
        let unifiedClassCount = 0;
        let unifiedEllipsisInfo = null;

        for (const dataset of processedDatasets) {
          const freq = dataset.classes.map(c => c.frequency);
          const total = freq.reduce((a, b) => a + b, 0);

          unifiedClassCount = Math.max(unifiedClassCount, dataset.classes.length);

          if (!unifiedEllipsisInfo) {
            unifiedEllipsisInfo = dataset.ellipsisInfo;
          } else if (!dataset.ellipsisInfo.show) {
            unifiedEllipsisInfo = dataset.ellipsisInfo;
          } else if (unifiedEllipsisInfo.show && dataset.ellipsisInfo.show) {
            if (dataset.ellipsisInfo.firstDataIndex < unifiedEllipsisInfo.firstDataIndex) {
              unifiedEllipsisInfo = dataset.ellipsisInfo;
            }
          }

          if (total > 0) {
            if (dataType === 'frequency') {
              const maxFreq = Math.max(...freq);
              unifiedMaxY = Math.max(unifiedMaxY, maxFreq);
            } else {
              const relativeFreqs = freq.map(f => f / total);
              const maxRelative = Math.max(...relativeFreqs) * CONFIG.CHART_Y_SCALE_MULTIPLIER;
              unifiedMaxY = Math.max(unifiedMaxY, maxRelative);
            }
          }
        }

        for (let i = 0; i < processedDatasets.length; i++) {
          const dataset = processedDatasets[i];

          CONFIG.SHOW_HISTOGRAM = dataset.settings.showHistogram;
          CONFIG.SHOW_POLYGON = dataset.settings.showPolygon;
          CONFIG.POLYGON_COLOR_PRESET = dataset.settings.colorPreset;
          CONFIG.HISTOGRAM_COLOR_PRESET = dataset.settings.histogramColorPreset || 'default';
          CONFIG.SHOW_BAR_LABELS = dataset.settings.showBarLabels;
          CONFIG.SHOW_DASHED_LINES = dataset.settings.showDashedLines;
          CONFIG.SHOW_CONGRUENT_TRIANGLES = dataset.settings.showTriangles;
          // 경계값 → 인덱스 변환
          let triangleIndex = 0;
          if (dataset.settings.triangleBoundary !== null) {
            const boundary = dataset.settings.triangleBoundary;
            for (let j = 0; j < dataset.classes.length; j++) {
              if (dataset.classes[j].max === boundary) {
                triangleIndex = j;
                break;
              }
            }
          }
          CONFIG.CONGRUENT_TRIANGLE_INDEX = triangleIndex;
          CONFIG.SHOW_CALLOUT = dataset.settings.showCallout;

          // 막대 내부 커스텀 라벨
          const customBarLabels = dataset.settings.customBarLabels;
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

          const clearCanvas = (i === 0);
          const customYInterval = this.app.chartSettingsController.getCustomYInterval();

          this.app.chartRenderer.draw(
            dataset.classes,
            customLabels.axis,
            unifiedEllipsisInfo,
            dataType,
            tableConfig,
            dataset.settings.calloutTemplate,
            clearCanvas,
            unifiedMaxY,
            unifiedClassCount,
            customYInterval
          );
        }

        // Corruption 효과 적용 (마지막 데이터셋 설정 기준)
        const lastDataset = processedDatasets[processedDatasets.length - 1];
        if (lastDataset.settings.corruptionEnabled && lastDataset.settings.corruptionCells) {
          this.applyChartCorruption(lastDataset.settings, lastDataset.classes.length);
        }

        DataStore.setData(firstDataset.data, firstDataset.stats, firstDataset.classes);
        ChartStore.setConfig(customLabels.axis, firstDataset.ellipsisInfo);

        this.showClassRangeEditor(firstDataset.classes);
      }

      this.app.layerPanelController.renderLayerPanel();
      this.renderDatasetTabs(processedCount);

      document.getElementById('resultSection').classList.add('active');
      document.querySelector('.layout-grid').classList.add('two-column');

      const jsonButtons = document.querySelector('.json-buttons');
      if (jsonButtons) {
        jsonButtons.style.display = 'flex';
      }

      if (processedCount === 1) {
        MessageManager.success('도수분포표가 생성되었습니다!');
      } else {
        MessageManager.success(`${processedCount}개의 도수분포표가 생성되었습니다!`);
      }

    } catch (error) {
      console.error('Error:', error);
      MessageManager.error(`오류가 발생했습니다: ${error.message}`);
    }
  }

  /**
   * 데이터셋 탭 렌더링
   * @param {number} count - 데이터셋 개수
   */
  renderDatasetTabs(count) {
    const tabsContainer = document.getElementById('datasetTabs');
    if (!tabsContainer) return;

    tabsContainer.innerHTML = '';

    for (let i = 0; i < count; i++) {
      const btn = document.createElement('button');
      btn.className = `dataset-tab-btn ${i === 0 ? 'active' : ''}`;
      btn.textContent = `데이터셋 ${i + 1}`;
      btn.dataset.tabIndex = i;
      btn.addEventListener('click', () => this.toggleDatasetTab(i));
      tabsContainer.appendChild(btn);
    }

    this.updateTableVisibility();
  }

  /**
   * 데이터셋 탭 토글
   * @param {number} index - 토글할 탭 인덱스
   */
  toggleDatasetTab(index) {
    const tabs = document.querySelectorAll('.dataset-tab-btn');
    const targetTab = tabs[index];

    if (targetTab) {
      targetTab.classList.toggle('active');
      this.updateTableVisibility();
    }
  }

  /**
   * 선택된 탭에 따라 테이블 표시/숨김 업데이트
   */
  updateTableVisibility() {
    const tabs = document.querySelectorAll('.dataset-tab-btn');
    const tableWrapper = document.querySelector('.table-wrapper');
    if (!tableWrapper) return;

    const allCanvases = tableWrapper.querySelectorAll('canvas');

    tabs.forEach((tab, i) => {
      const isActive = tab.classList.contains('active');
      if (allCanvases[i]) {
        allCanvases[i].style.display = isActive ? 'block' : 'none';
      }
    });
  }

  /**
   * 차트에 Corruption 효과 적용
   * @param {Object} settings - 데이터셋 설정
   * @param {number} barCount - 막대 개수
   */
  applyChartCorruption(settings, barCount) {
    const chartRenderer = this.app.chartRenderer;
    const coords = chartRenderer.currentCoords;
    if (!coords) return;

    const corruptionOptions = {
      enabled: true,
      cells: settings.corruptionCells,
      style: {
        edgeColorEnabled: settings.corruptionEdgeColor ?? true,
        fiberEnabled: settings.corruptionFiber ?? false
      }
    };

    const chartInfo = {
      padding: chartRenderer.padding,
      barWidth: coords.xScale,
      gap: coords.gap,
      chartHeight: coords.yEnd - coords.yStart,
      gridDivisions: coords.gridDivisions,
      canvasHeight: chartRenderer.canvas.height,
      barCount: barCount
    };

    applyChartCorruption(chartRenderer.ctx, corruptionOptions, chartInfo);
  }

  /**
   * 추가 테이블 제거 (첫 번째 테이블만 유지)
   */
  clearExtraTables() {
    const tableWrapper = document.querySelector('.table-wrapper');
    if (!tableWrapper) return;

    const allCanvases = tableWrapper.querySelectorAll('canvas');
    allCanvases.forEach((canvas, i) => {
      if (i > 0) canvas.remove();
    });

    this.app.tableRenderers = this.app.tableRenderers.slice(0, 1);
    this.app.tableCounter = 1;
  }

  /**
   * 새 테이블 캔버스 생성 및 렌더러 추가
   * @returns {TableRenderer}
   */
  createNewTable() {
    const tableWrapper = document.querySelector('.table-wrapper');
    if (!tableWrapper) {
      throw new Error('테이블 래퍼를 찾을 수 없습니다.');
    }

    this.app.tableCounter++;
    const tableId = `frequencyTable-${this.app.tableCounter}`;

    const canvas = document.createElement('canvas');
    canvas.id = tableId;
    canvas.role = 'img';
    canvas.setAttribute('aria-label', `도수분포표 ${this.app.tableCounter}`);

    tableWrapper.appendChild(canvas);

    const newRenderer = new TableRenderer(tableId);
    this.app.tableRenderers.push(newRenderer);

    return newRenderer;
  }

  /**
   * JSON 데이터 내보내기
   */
  exportJson() {
    try {
      const jsonData = DataProcessor.exportData(
        this.app.chartRenderer.layerManager,
        this.app.chartRenderer.timeline,
        this.app.chartRenderer,
        this.app.tableRenderers
      );

      if (DataStore.hasData()) {
        jsonData.rawData = DataStore.getRawData();
      }

      const datasetSection = document.querySelector('.dataset-section');
      if (datasetSection) {
        const tableTypeSelect = datasetSection.querySelector('.dataset-table-type');
        if (tableTypeSelect) {
          jsonData.tableType = tableTypeSelect.value;
        }
      }

      const firstStart = parseFloat(document.getElementById('firstStart')?.value);
      const secondStart = parseFloat(document.getElementById('secondStart')?.value);
      const lastEnd = parseFloat(document.getElementById('lastEnd')?.value);

      if (firstStart !== undefined && secondStart && lastEnd) {
        jsonData.customRange = { firstStart, secondStart, lastEnd };
      }

      const jsonString = JSON.stringify(jsonData, null, 2);

      const sizeInBytes = new Blob([jsonString]).size;
      const sizeInMB = sizeInBytes / (1024 * 1024);

      if (sizeInMB > 50) {
        throw new Error(
          `JSON 파일이 너무 큽니다 (${sizeInMB.toFixed(1)}MB). ` +
          `최대 50MB까지 지원됩니다.`
        );
      }

      const blob = new Blob([jsonString], { type: 'application/json' });
      const filename = `chart-data-${Utils.formatTimestamp()}.json`;

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(link.href);

      MessageManager.success(`JSON 파일이 다운로드되었습니다: ${filename}`);
    } catch (error) {
      console.error('Export error:', error);
      MessageManager.error(`내보내기 오류: ${error.message}`);
    }
  }

  /**
   * JSON 파일 선택 핸들러
   * @param {Event} event - 파일 선택 이벤트
   */
  handleJsonFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > 50) {
      MessageManager.error(`파일이 너무 큽니다 (${sizeInMB.toFixed(1)}MB). 최대 50MB까지 지원됩니다.`);
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);

        const version = jsonData.version || '3.0.0';
        const majorVersion = parseInt(version.split('.')[0]);

        if (majorVersion < 3) {
          MessageManager.warning(`구버전 JSON 파일입니다 (v${version}). 일부 기능이 제한될 수 있습니다.`);
        }

        const importedData = DataProcessor.importData(jsonData);
        this.applyImportedData(importedData);

        MessageManager.success(`JSON 데이터를 불러왔습니다 (v${version})`);
      } catch (error) {
        console.error('Import error:', error);
        MessageManager.error(`JSON 파싱 오류: ${error.message}`);
      }

      event.target.value = '';
    };

    reader.onerror = () => {
      MessageManager.error('파일 읽기 오류가 발생했습니다.');
      event.target.value = '';
    };

    reader.readAsText(file);
  }

  /**
   * 불러온 JSON 데이터 적용
   * @param {Object} data - 불러온 데이터 객체
   */
  applyImportedData(data) {
    if (!data || !data.chart) {
      MessageManager.warning('유효하지 않은 JSON 데이터입니다.');
      return;
    }

    const config = data.chart.config;
    if (!config) {
      MessageManager.warning('차트 설정 정보가 없습니다.');
      return;
    }

    if (config.chartElements) {
      CONFIG.SHOW_HISTOGRAM = config.chartElements.showHistogram;
      CONFIG.SHOW_POLYGON = config.chartElements.showPolygon;
      CONFIG.SHOW_BAR_LABELS = config.chartElements.showBarLabels;
      CONFIG.SHOW_DASHED_LINES = config.chartElements.showDashedLines;

      const histogramCheck = document.getElementById('showHistogram');
      const polygonCheck = document.getElementById('showPolygon');
      const barLabelsCheck = document.getElementById('showBarLabels');
      const dashedLinesCheck = document.getElementById('showDashedLines');

      if (histogramCheck) histogramCheck.checked = CONFIG.SHOW_HISTOGRAM;
      if (polygonCheck) polygonCheck.checked = CONFIG.SHOW_POLYGON;
      if (barLabelsCheck) barLabelsCheck.checked = CONFIG.SHOW_BAR_LABELS;
      if (dashedLinesCheck) dashedLinesCheck.checked = CONFIG.SHOW_DASHED_LINES;
    }

    if (config.gridSettings) {
      CONFIG.GRID_SHOW_HORIZONTAL = config.gridSettings.showHorizontal;
      CONFIG.GRID_SHOW_VERTICAL = config.gridSettings.showVertical;
    }

    if (config.axisLabelSettings) {
      CONFIG.AXIS_SHOW_Y_LABELS = config.axisLabelSettings.showYLabels;
      CONFIG.AXIS_SHOW_X_LABELS = config.axisLabelSettings.showXLabels;
    }

    if (config.colorPreset && CONFIG.POLYGON_COLOR_PRESETS[config.colorPreset]) {
      CONFIG.POLYGON_COLOR_PRESET = config.colorPreset;
    }

    if (config.tableData && config.tableData.classes) {
      const { classes, total, config: tableConfig } = config.tableData;

      const ellipsisInfo = config.ellipsisInfo || null;
      const axisLabels = config.axisLabels || { xAxis: '', yAxis: '' };
      const dataType = config.dataType || 'relativeFrequency';

      const mergedTableConfig = { ...tableConfig };
      if (!tableConfig.labels || Object.keys(tableConfig.labels).length === 0) {
        mergedTableConfig.labels = CONFIG.DEFAULT_LABELS.table;
      }

      const customYInterval = this.app.chartSettingsController.getCustomYInterval();
      this.app.chartRenderer.draw(classes, axisLabels, ellipsisInfo, dataType, mergedTableConfig, null, true, null, null, customYInterval);

      if (this.app.tableRenderers.length > 0) {
        this.app.tableRenderers[0].draw(classes, total, mergedTableConfig);
      }

      document.getElementById('resultSection').classList.add('active');
      document.querySelector('.layout-grid').classList.add('two-column');
      const jsonButtons = document.querySelector('.json-buttons');
      if (jsonButtons) jsonButtons.style.display = 'flex';

      const xAxisInput = document.getElementById('xAxisLabel');
      const yAxisInput = document.getElementById('yAxisLabel');
      if (xAxisInput) xAxisInput.value = axisLabels.xAxis || '';
      if (yAxisInput) yAxisInput.value = axisLabels.yAxis || '';

      if (data.rawData) {
        const stats = DataProcessor.calculateBasicStats(data.rawData);
        DataStore.setData(data.rawData, stats, classes);
      }

      const formConfig = {
        ...config,
        rawData: data.rawData,
        tableType: data.tableType
      };
      this.syncDatasetFormFromImport(classes, formConfig);

      if (data.customRange) {
        const { firstStart, secondStart, lastEnd } = data.customRange;

        const firstStartInput = document.getElementById('firstStart');
        const secondStartInput = document.getElementById('secondStart');
        const lastEndInput = document.getElementById('lastEnd');

        if (firstStartInput) firstStartInput.value = firstStart;
        if (secondStartInput) secondStartInput.value = secondStart;
        if (lastEndInput) lastEndInput.value = lastEnd;

        const intervalDisplay = document.getElementById('intervalDisplay');
        const interval = secondStart - firstStart;

        if (intervalDisplay) intervalDisplay.textContent = `(간격: ${interval})`;
      }
    }
  }

  /**
   * JSON 불러오기 시 데이터셋 입력 폼 동기화
   * @param {Array} classes - 계급 데이터 배열
   * @param {Object} config - 불러온 설정 객체
   */
  syncDatasetFormFromImport(classes, config) {
    const datasetSection = document.querySelector('.dataset-section');
    if (!datasetSection) return;

    const tableTypeSelect = datasetSection.querySelector('.dataset-table-type');
    if (tableTypeSelect && config.tableType) {
      tableTypeSelect.value = config.tableType;
      tableTypeSelect.dispatchEvent(new Event('change'));
    }

    const visibleClasses = classes.filter(c => c.frequency > 0);
    const classCount = visibleClasses.length;
    const classWidth = classes.length > 0 ? classes[0].end - classes[0].start : 5;

    const classCountInput = datasetSection.querySelector('.dataset-class-count');
    if (classCountInput) classCountInput.value = classCount;

    const classWidthInput = datasetSection.querySelector('.dataset-class-width');
    if (classWidthInput) classWidthInput.value = classWidth;

    const dataInput = datasetSection.querySelector('.dataset-data-input');
    if (dataInput) {
      if (config.rawData && Array.isArray(config.rawData)) {
        dataInput.value = config.rawData.join(', ');
        dataInput.classList.remove('imported-data');
      } else {
        dataInput.value = '(불러온 데이터 - 원본 없음)';
        dataInput.classList.add('imported-data');

        const clearImportedState = () => {
          dataInput.value = '';
          dataInput.classList.remove('imported-data');
          dataInput.removeEventListener('focus', clearImportedState);
        };
        dataInput.addEventListener('focus', clearImportedState);
      }
    }

    const chartElements = config.chartElements || {};

    const showHistogram = datasetSection.querySelector('.dataset-show-histogram');
    if (showHistogram) {
      showHistogram.checked = chartElements.showHistogram !== false;
    }

    const showPolygon = datasetSection.querySelector('.dataset-show-polygon');
    if (showPolygon) {
      showPolygon.checked = chartElements.showPolygon !== false;
    }

    const showBarLabels = datasetSection.querySelector('.dataset-show-bar-labels');
    if (showBarLabels) {
      showBarLabels.checked = chartElements.showBarLabels === true;
    }

    const showDashedLines = datasetSection.querySelector('.dataset-show-dashed-lines');
    if (showDashedLines) {
      showDashedLines.checked = chartElements.showDashedLines === true;
    }

    const showTriangles = datasetSection.querySelector('.dataset-show-triangles');
    if (showTriangles) {
      showTriangles.checked = chartElements.showTriangles === true;
    }

    const triangleBoundaryInput = datasetSection.querySelector('.dataset-triangle-boundary');
    if (triangleBoundaryInput && chartElements.triangleBoundary !== undefined) {
      triangleBoundaryInput.value = chartElements.triangleBoundary;
    }

    const colorPreset = config.colorPreset || 'default';
    const colorRadio = datasetSection.querySelector(`.dataset-polygon-color[value="${colorPreset}"]`);
    if (colorRadio) {
      colorRadio.checked = true;
      const allColorBtns = datasetSection.querySelectorAll('.color-preset-btn');
      allColorBtns.forEach(btn => btn.classList.remove('selected'));
      colorRadio.closest('.color-preset-btn')?.classList.add('selected');
    }
  }
}

export default GenerationController;

/**
 * 차트 설정 컨트롤러
 * 차트 데이터 타입, 격자선, 히스토그램/다각형 토글, 색상 프리셋
 */

import CONFIG from '../config.js';
import DataStore from '../core/dataStore.js';
import ChartStore from '../core/chartStore.js';

/**
 * @class ChartSettingsController
 * @description 차트 설정 UI 관리
 */
class ChartSettingsController {
  /**
   * @param {FrequencyDistributionApp} app - 메인 애플리케이션 인스턴스
   */
  constructor(app) {
    this.app = app;
  }

  /**
   * 차트 데이터 타입 라디오 버튼 동적 생성 및 이벤트 리스너 등록
   * 각 모드별 Y축 간격 입력 필드 포함
   */
  initChartDataTypeRadios() {
    const container = document.getElementById('chartDataTypeRadios');
    if (!container) return;

    const defaultDataType = ChartStore.getDataType();

    CONFIG.CHART_DATA_TYPES.forEach((typeInfo, index) => {
      const radioItem = document.createElement('div');
      radioItem.className = 'radio-item y-axis-mode-item';

      // 라디오 버튼
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.id = `chartDataType${index}`;
      radio.name = 'chartDataType';
      radio.value = typeInfo.id;
      radio.checked = typeInfo.id === defaultDataType;

      // 라벨
      const label = document.createElement('label');
      label.htmlFor = `chartDataType${index}`;
      label.textContent = typeInfo.label;

      // 간격 입력 필드
      const intervalWrapper = document.createElement('span');
      intervalWrapper.className = 'y-interval-wrapper';
      intervalWrapper.innerHTML = `
        <span class="interval-label">간격:</span>
        <input type="number"
               class="y-interval-input"
               data-mode="${typeInfo.id}"
               step="${typeInfo.id === 'frequency' ? '1' : '0.01'}"
               min="0"
               placeholder="자동">
      `;

      radio.addEventListener('change', () => this.handleChartDataTypeChange(typeInfo.id));

      // 간격 입력 변경 시 차트 업데이트
      const intervalInput = intervalWrapper.querySelector('.y-interval-input');
      intervalInput.addEventListener('change', () => {
        if (radio.checked) {
          this.updateChart();
        }
      });

      radioItem.appendChild(radio);
      radioItem.appendChild(label);
      radioItem.appendChild(intervalWrapper);
      container.appendChild(radioItem);
    });
  }

  /**
   * 현재 선택된 Y축 간격 값 가져오기
   * @returns {number|null} 커스텀 간격 값 (없으면 null)
   */
  getCustomYInterval() {
    const dataType = ChartStore.getDataType();
    const input = document.querySelector(`.y-interval-input[data-mode="${dataType}"]`);
    const value = parseFloat(input?.value);
    return (!isNaN(value) && value > 0) ? value : null;
  }

  /**
   * 차트 데이터 타입 변경 핸들러
   * @param {string} dataType - 선택된 데이터 타입 ID
   */
  handleChartDataTypeChange(dataType) {
    ChartStore.setDataType(dataType);
    this.updateChart();
  }

  /**
   * 격자선 표시 토글 이벤트 리스너 등록
   */
  initGridToggle() {
    const horizontalCheckbox = document.getElementById('showHorizontalGrid');
    const verticalCheckbox = document.getElementById('showVerticalGrid');

    horizontalCheckbox?.addEventListener('change', () => {
      CONFIG.GRID_SHOW_HORIZONTAL = horizontalCheckbox.checked;
      this.redrawChart();
    });

    verticalCheckbox?.addEventListener('change', () => {
      CONFIG.GRID_SHOW_VERTICAL = verticalCheckbox.checked;
      this.redrawChart();
    });

    // Y축 값 라벨 토글
    const yAxisLabelsCheckbox = document.getElementById('showYAxisLabels');
    yAxisLabelsCheckbox?.addEventListener('change', () => {
      CONFIG.AXIS_SHOW_Y_LABELS = yAxisLabelsCheckbox.checked;
      this.redrawChart();
    });

    // X축 값 라벨 토글
    const xAxisLabelsCheckbox = document.getElementById('showXAxisLabels');
    xAxisLabelsCheckbox?.addEventListener('change', () => {
      CONFIG.AXIS_SHOW_X_LABELS = xAxisLabelsCheckbox.checked;
      this.redrawChart();
    });

    // Y축 백분율 표시 토글
    const yAxisPercentCheckbox = document.getElementById('yAxisPercent');
    yAxisPercentCheckbox?.addEventListener('change', () => {
      CONFIG.AXIS_Y_LABEL_FORMAT = yAxisPercentCheckbox.checked ? 'percent' : 'decimal';
      this.redrawChart();
    });

    // 파선 토글
    const dashedLinesCheckbox = document.getElementById('showDashedLines');
    dashedLinesCheckbox?.addEventListener('change', () => {
      CONFIG.SHOW_DASHED_LINES = dashedLinesCheckbox.checked;
      this.redrawChart();
    });
  }

  /**
   * 상첨자 토글 이벤트 리스너 등록
   */
  initSuperscriptToggle() {
    const checkbox = document.querySelector('.dataset-show-superscript');
    checkbox?.addEventListener('change', () => {
      if (DataStore.hasData()) {
        const { classes } = DataStore.getData();
        const configWithAlignment = this.app.tableConfigController.getTableConfigWithAlignment();
        this.app.tableRenderer.draw(classes, DataStore.getRawData().length, configWithAlignment);
      }
    });
  }

  /**
   * 막대 라벨 토글 이벤트 리스너 등록
   */
  initBarLabelsToggle() {
    const checkbox = document.getElementById('showBarLabels');
    checkbox?.addEventListener('change', () => {
      CONFIG.SHOW_BAR_LABELS = checkbox.checked;

      if (DataStore.hasData()) {
        const { classes } = DataStore.getData();
        const customLabels = this.app.tableConfigController.getCustomLabels();
        const dataType = ChartStore.getDataType();
        const ellipsisInfo = ChartStore.getConfig()?.ellipsisInfo;
        const configWithAlignment = this.app.tableConfigController.getTableConfigWithAlignment();
        const customYInterval = this.getCustomYInterval();

        this.app.chartRenderer.draw(classes, customLabels.axis, ellipsisInfo, dataType, configWithAlignment, customLabels.calloutTemplate, true, null, null, customYInterval);

        this.app.chartRenderer.stopAnimation();
        this.app.chartRenderer.timeline.currentTime = this.app.chartRenderer.timeline.duration;
        this.app.chartRenderer.renderFrame();
      }
    });
  }

  /**
   * 히스토그램/다각형 표시 토글 이벤트 리스너 등록
   */
  initChartElementsToggle() {
    const histogramCheckbox = document.getElementById('showHistogram');
    histogramCheckbox?.addEventListener('change', () => {
      CONFIG.SHOW_HISTOGRAM = histogramCheckbox.checked;

      if (DataStore.hasData()) {
        const { classes } = DataStore.getData();
        const customLabels = this.app.tableConfigController.getCustomLabels();
        const dataType = ChartStore.getDataType();
        const ellipsisInfo = ChartStore.getConfig()?.ellipsisInfo;
        const configWithAlignment = this.app.tableConfigController.getTableConfigWithAlignment();
        const customYInterval = this.getCustomYInterval();

        this.app.chartRenderer.draw(classes, customLabels.axis, ellipsisInfo, dataType, configWithAlignment, customLabels.calloutTemplate, true, null, null, customYInterval);
        this.app.chartRenderer.stopAnimation();
        this.app.chartRenderer.timeline.currentTime = this.app.chartRenderer.timeline.duration;
        this.app.chartRenderer.renderFrame();
      }
    });

    const polygonCheckbox = document.getElementById('showPolygon');
    polygonCheckbox?.addEventListener('change', () => {
      CONFIG.SHOW_POLYGON = polygonCheckbox.checked;

      if (DataStore.hasData()) {
        const { classes } = DataStore.getData();
        const customLabels = this.app.tableConfigController.getCustomLabels();
        const dataType = ChartStore.getDataType();
        const ellipsisInfo = ChartStore.getConfig()?.ellipsisInfo;
        const configWithAlignment = this.app.tableConfigController.getTableConfigWithAlignment();
        const customYInterval = this.getCustomYInterval();

        this.app.chartRenderer.draw(classes, customLabels.axis, ellipsisInfo, dataType, configWithAlignment, customLabels.calloutTemplate, true, null, null, customYInterval);
        this.app.chartRenderer.stopAnimation();
        this.app.chartRenderer.timeline.currentTime = this.app.chartRenderer.timeline.duration;
        this.app.chartRenderer.renderFrame();
      }
    });
  }

  /**
   * 다각형 색상 프리셋 이벤트 리스너 등록
   */
  initPolygonColorPreset() {
    const presetRadios = document.querySelectorAll('input[name="polygonColor"]');

    presetRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) {
          CONFIG.POLYGON_COLOR_PRESET = radio.value;

          if (DataStore.hasData()) {
            const { classes } = DataStore.getData();
            const customLabels = this.app.tableConfigController.getCustomLabels();
            const dataType = ChartStore.getDataType();
            const ellipsisInfo = ChartStore.getConfig()?.ellipsisInfo;
            const configWithAlignment = this.app.tableConfigController.getTableConfigWithAlignment();
            const customYInterval = this.getCustomYInterval();

            this.app.chartRenderer.draw(classes, customLabels.axis, ellipsisInfo, dataType, configWithAlignment, customLabels.calloutTemplate, true, null, null, customYInterval);
            this.app.chartRenderer.stopAnimation();
            this.app.chartRenderer.timeline.currentTime = this.app.chartRenderer.timeline.duration;
            this.app.chartRenderer.renderFrame();
          }
        }
      });
    });
  }

  /**
   * 차트 다시 그리기 (격자선 변경 시)
   */
  redrawChart() {
    if (DataStore.hasData()) {
      const { classes } = DataStore.getData();
      const customLabels = this.app.tableConfigController.getCustomLabels();
      const dataType = ChartStore.getDataType();
      const ellipsisInfo = ChartStore.getConfig()?.ellipsisInfo;
      const configWithAlignment = this.app.tableConfigController.getTableConfigWithAlignment();
      const customYInterval = this.getCustomYInterval();

      this.app.chartRenderer.draw(classes, customLabels.axis, ellipsisInfo, dataType, configWithAlignment, customLabels.calloutTemplate, true, null, null, customYInterval);

      this.app.chartRenderer.stopAnimation();
      this.app.chartRenderer.timeline.currentTime = this.app.chartRenderer.timeline.duration;
      this.app.chartRenderer.renderFrame();
    }
  }

  /**
   * 차트 업데이트
   */
  updateChart() {
    const classes = DataStore.getData()?.classes;
    const axisLabels = ChartStore.getConfig()?.axisLabels;
    const ellipsisInfo = ChartStore.getConfig()?.ellipsisInfo;
    const dataType = ChartStore.getDataType();
    const tableConfig = this.app.tableConfigController.getTableConfigWithAlignment();
    const customLabels = this.app.tableConfigController.getCustomLabels();
    const customYInterval = this.getCustomYInterval();

    if (classes) {
      this.app.chartRenderer.draw(classes, axisLabels, ellipsisInfo, dataType, tableConfig, customLabels.calloutTemplate, true, null, null, customYInterval);
    }
  }

  /**
   * 테이블 업데이트
   */
  updateTable() {
    const data = DataStore.getData();
    if (!data) return;

    const { classes } = data;
    const total = data.data.length;
    const configWithAlignment = this.app.tableConfigController.getTableConfigWithAlignment();

    this.app.tableRenderer.draw(classes, total, configWithAlignment);
  }
}

export default ChartSettingsController;

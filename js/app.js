/**
 * 도수분포표 애플리케이션
 * 메인 애플리케이션 컨트롤러
 *
 * @version 3.0.0 (모듈화)
 * @description ES6 모듈 시스템을 사용한 관심사 분리 버전
 */

import CONFIG from './config.js';
import Utils from './utils/utils.js';
import Validator from './utils/validator.js';
import MessageManager from './utils/message.js';
import DataProcessor from './core/processor.js';
import { ParserFactory } from './core/parsers/index.js';
import UIRenderer from './renderers/ui.js';
import ChartRenderer from './renderers/chart.js';
import TableRenderer from './renderers/table.js';
import DataStore from './core/dataStore.js';
import TableStore from './core/tableStore.js';
import ChartStore from './core/chartStore.js';
import DatasetStore from './core/datasetStore.js';
import * as KatexUtils from './utils/katex.js';

// ========== 애플리케이션 컨트롤러 ==========
class FrequencyDistributionApp {
  constructor() {
    this.chartRenderer = new ChartRenderer('chart');

    // 테이블 관리
    this.tableRenderers = []; // 여러 테이블 렌더러
    this.tableCounter = 0; // 테이블 카운터
    this.tableRenderer = null; // 첫 번째 테이블 (호환성 유지)

    // 첫 번째 테이블 렌더러 초기화
    this.initFirstTableRenderer();

    this.columnOrder = [0, 1, 2, 3, 4, 5]; // 컬럼 순서 관리
    this.draggedElement = null;

    // 레이어 소스별 접힌 그룹 ID 목록
    this.collapsedGroups = {
      chart: new Set(),
      table: new Set()
    };

    // 레이어 소스 상태 (기본: 차트)
    this.currentLayerSource = 'chart';

    this.init();
  }

  /**
   * 첫 번째 테이블 렌더러 초기화
   */
  initFirstTableRenderer() {
    this.tableRenderer = new TableRenderer('frequencyTable');
    this.tableRenderers.push(this.tableRenderer);
    this.tableCounter = 1;
  }

  /**
   * 데이터셋 섹션 생성
   * @param {number} datasetId - 데이터셋 ID
   */
  createDatasetSection(datasetId) {
    const template = document.getElementById('datasetSectionTemplate');
    if (!template) {
      console.error('데이터셋 템플릿을 찾을 수 없습니다.');
      return;
    }

    // 템플릿 복제
    const section = template.content.cloneNode(true);
    const details = section.querySelector('.dataset-section');

    // 데이터셋 ID 설정
    details.setAttribute('data-dataset-id', datasetId);

    // 제목 설정
    const title = section.querySelector('.dataset-title');
    const colorIndicator = title.querySelector('.dataset-color-indicator');

    // innerHTML을 사용하여 색상 인디케이터와 텍스트 모두 설정
    title.innerHTML = `<span class="dataset-color-indicator" data-color="default"></span>📊 데이터셋 ${datasetId}`;

    // 색상 인디케이터 요소 다시 찾기
    const indicator = title.querySelector('.dataset-color-indicator');

    // 색상 프리셋 라디오 버튼에 name 속성 설정 및 이벤트 리스너 추가
    const colorRadios = section.querySelectorAll('.dataset-polygon-color');
    colorRadios.forEach(radio => {
      radio.name = `polygonColor-${datasetId}`;

      // 색상 변경 이벤트 리스너
      radio.addEventListener('change', (e) => {
        if (indicator) {
          indicator.setAttribute('data-color', e.target.value);
        }
      });
    });

    // 삭제 버튼 이벤트 리스너
    const removeBtn = section.querySelector('.dataset-remove-btn');
    removeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.removeDatasetSection(datasetId);
    });

    // 테이블 타입 변경 이벤트 리스너
    const tableTypeSelect = section.querySelector('.dataset-table-type');
    tableTypeSelect?.addEventListener('change', (e) => {
      this.onTableTypeChange(details, e.target.value);
    });

    // 아코디언 컨테이너에 추가
    const accordion = document.getElementById('datasetsAccordion');
    accordion?.appendChild(section);

    // DatasetStore에 데이터셋 추가
    DatasetStore.addDataset({ id: datasetId });
  }

  /**
   * 테이블 타입 변경 시 UI 업데이트
   * @param {HTMLElement} section - 데이터셋 섹션 요소
   * @param {string} tableType - 선택된 테이블 타입
   */
  onTableTypeChange(section, tableType) {
    // 타입 정보 가져오기
    const typeInfo = CONFIG.TABLE_TYPE_INFO[tableType];
    if (!typeInfo) return;

    // 힌트 텍스트 업데이트
    const hintElement = section.querySelector('.dataset-type-hint');
    if (hintElement) {
      hintElement.innerHTML = `💡 ${typeInfo.hint}`;
    }

    // 데이터 입력 필드 placeholder 및 기본 데이터 업데이트
    const dataInput = section.querySelector('.dataset-data-input');
    if (dataInput) {
      dataInput.placeholder = typeInfo.placeholder;
      // 타입 변경 시 해당 타입의 기본 데이터로 교체
      if (typeInfo.defaultData) {
        dataInput.value = typeInfo.defaultData;
      }
    }

    // 도수분포표 전용 옵션 표시/숨김
    const frequencyOnlyOptions = section.querySelectorAll('.frequency-only-options');
    const isFrequency = tableType === CONFIG.TABLE_TYPES.FREQUENCY;

    frequencyOnlyOptions.forEach(option => {
      if (isFrequency) {
        option.classList.remove('hidden');
      } else {
        option.classList.add('hidden');
      }
    });
  }

  /**
   * 데이터셋 섹션 제거
   * @param {number} datasetId - 제거할 데이터셋 ID
   */
  removeDatasetSection(datasetId) {
    // 최소 1개는 유지
    if (DatasetStore.getCount() <= 1) {
      MessageManager.warning('최소 1개의 데이터셋이 필요합니다.');
      return;
    }

    // DOM에서 제거
    const section = document.querySelector(`.dataset-section[data-dataset-id="${datasetId}"]`);
    section?.remove();

    // DatasetStore에서 제거
    DatasetStore.removeDataset(datasetId);

    // 테이블 제거 (해당 ID의 테이블이 있으면)
    this.removeTableByDatasetId(datasetId);

    MessageManager.success('데이터셋이 제거되었습니다.');
  }

  /**
   * 데이터셋 ID로 테이블 제거
   * @param {number} datasetId - 데이터셋 ID
   */
  removeTableByDatasetId(datasetId) {
    const tableId = datasetId === 1 ? 'frequencyTable' : `frequencyTable-${datasetId}`;
    const tableCanvas = document.getElementById(tableId);
    const tableSection = tableCanvas?.closest('.table-section-item');
    tableSection?.remove();

    // tableRenderers 배열에서도 제거
    const rendererIndex = this.tableRenderers.findIndex(r => r.canvasId === tableId);
    if (rendererIndex !== -1) {
      this.tableRenderers.splice(rendererIndex, 1);
    }
  }

  /**
   * 새 데이터셋 추가 (섹션만 생성, 렌더링 안 함)
   */
  addDatasetAndGenerate() {
    // 다음 데이터셋 ID 계산
    const nextId = DatasetStore.getCount() + 1;

    // 새 데이터셋 섹션 생성
    this.createDatasetSection(nextId);

    // 렌더링은 하지 않음 - 사용자가 "도수분포표 생성" 버튼 클릭 시 렌더링
  }

  /**
   * 데이터셋 입력값 읽기
   * @param {number} datasetId - 데이터셋 ID
   * @returns {Object|null} 데이터셋 입력값 객체 또는 null
   */
  getDatasetInputValues(datasetId) {
    const section = document.querySelector(`.dataset-section[data-dataset-id="${datasetId}"]`);
    if (!section) return null;

    try {
      // 테이블 타입
      const tableTypeSelect = section.querySelector('.dataset-table-type');
      const tableType = tableTypeSelect?.value || CONFIG.TABLE_TYPES.FREQUENCY;

      // 데이터 입력
      const dataInput = section.querySelector('.dataset-data-input');
      const rawData = dataInput?.value.trim();
      if (!rawData) {
        return null; // 빈 데이터는 null 반환
      }

      // 계급 설정
      const classCountInput = section.querySelector('.dataset-class-count');
      const classWidthInput = section.querySelector('.dataset-class-width');
      const classCount = parseInt(classCountInput?.value) || 5;
      const classWidth = classWidthInput?.value ? parseFloat(classWidthInput.value) : null;

      // 차트 표시 옵션
      const showHistogram = section.querySelector('.dataset-show-histogram')?.checked ?? true;
      const showPolygon = section.querySelector('.dataset-show-polygon')?.checked ?? true;
      const showSuperscript = section.querySelector('.dataset-show-superscript')?.checked ?? true;
      const showBarLabels = section.querySelector('.dataset-show-bar-labels')?.checked ?? false;
      const showDashedLines = section.querySelector('.dataset-show-dashed-lines')?.checked ?? false;
      const showCallout = section.querySelector('.dataset-show-callout')?.checked ?? false;

      // 색상 프리셋
      const colorRadio = section.querySelector('.dataset-polygon-color:checked');
      const colorPreset = colorRadio?.value || 'default';

      // 말풍선 템플릿
      const calloutTemplateInput = section.querySelector('.dataset-callout-template');
      const calloutTemplate = calloutTemplateInput?.value || '';

      return {
        datasetId,
        tableType,
        rawData,
        classCount,
        classWidth,
        settings: {
          showHistogram,
          showPolygon,
          showSuperscript,
          showBarLabels,
          showDashedLines,
          showCallout,
          calloutTemplate,
          colorPreset
        }
      };
    } catch (error) {
      console.error(`데이터셋 ${datasetId} 입력값 읽기 오류:`, error);
      return null;
    }
  }

  /**
   * 모든 데이터셋의 입력값 읽기
   * @returns {Array} 데이터셋 입력값 배열 (빈 데이터는 제외)
   */
  getAllDatasetInputValues() {
    const datasets = DatasetStore.getAllDatasets();
    const results = [];

    for (const dataset of datasets) {
      const inputValues = this.getDatasetInputValues(dataset.id);
      if (inputValues) {
        results.push(inputValues);
      }
    }

    return results;
  }

  /**
   * 이벤트 리스너 초기화
   */
  async init() {
    // KaTeX 폰트 로드 대기
    await KatexUtils.waitForFonts();

    // 첫 번째 데이터셋 섹션 생성
    this.createDatasetSection(1);

    // 차트 데이터 유형 라디오 버튼 초기화 (고급 설정)
    this.initChartDataTypeRadios();

    const generateBtn = document.getElementById('generateBtn');
    generateBtn?.addEventListener('click', () => this.generate(true)); // true: 새로 시작

    // 도수분포표 추가 버튼
    const addBtn = document.getElementById('addBtn');
    addBtn?.addEventListener('click', () => this.addDatasetAndGenerate()); // 새 데이터셋 추가 후 생성

    // JSON 내보내기 버튼
    const exportJsonBtn = document.getElementById('exportJsonBtn');
    exportJsonBtn?.addEventListener('click', () => this.exportJson());

    // 애니메이션 컨트롤 초기화
    this.initAnimationControls();

    // 격자선 토글 초기화
    this.initGridToggle();

    // 테이블 설정 패널 초기화
    this.initTableConfigPanel();

    // JSON 미리보기 모달 초기화
    this.initJsonPreviewModal();

    // 레이어 소스 선택기 초기화
    this.initLayerSourceSelector();

    // 하이라이트 테스트 버튼 초기화
    this.initHighlightTestButtons();
  }

  /**
   * 애니메이션 컨트롤 이벤트 리스너 등록
   */
  initAnimationControls() {
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    const progressSlider = document.getElementById('progressSlider');
    const progressText = document.getElementById('progressText');

    // 슬라이더 조작 중인지 여부
    this.isUserDraggingSlider = false;

    // 애니메이션 모드는 항상 활성화
    this.chartRenderer.enableAnimation();

    // 재생/일시정지/정지
    playBtn?.addEventListener('click', () => {
      // 진행도를 0%로 리셋 후 재생
      this.chartRenderer.timeline.currentTime = 0;
      this.chartRenderer.playAnimation();
    });
    pauseBtn?.addEventListener('click', () => this.chartRenderer.pauseAnimation());
    stopBtn?.addEventListener('click', () => this.chartRenderer.stopAnimation());

    // 속도 조절
    speedSlider?.addEventListener('input', (e) => {
      const speed = parseFloat(e.target.value);
      speedValue.textContent = `${speed}x`;
      this.chartRenderer.setAnimationSpeed(speed);
    });

    // 진행도 슬라이더 조작
    progressSlider?.addEventListener('input', (e) => {
      const percentage = parseInt(e.target.value);
      const progress = percentage / 100;

      // 슬라이더 조작 중 표시
      this.isUserDraggingSlider = true;

      // 타임라인 이동
      if (this.chartRenderer && this.chartRenderer.timeline) {
        this.chartRenderer.timeline.seekToProgress(progress);
      }

      // 진행도 텍스트 업데이트
      if (progressText) {
        progressText.textContent = `${percentage}%`;
      }

      // 슬라이더 배경 업데이트
      this.updateSliderBackground(progressSlider, percentage);
    });

    // 슬라이더 조작 종료 감지
    progressSlider?.addEventListener('mouseup', () => {
      this.isUserDraggingSlider = false;
    });

    progressSlider?.addEventListener('touchend', () => {
      this.isUserDraggingSlider = false;
    });

    // 진행도 자동 업데이트 (슬라이더 조작 중이 아닐 때만)
    this.updateProgress = () => {
      if (this.chartRenderer && this.chartRenderer.timeline) {
        const progress = this.chartRenderer.timeline.getProgress();
        const percentage = Math.round(progress * 100);

        // 슬라이더 조작 중이 아닐 때만 업데이트
        if (!this.isUserDraggingSlider) {
          if (progressSlider) {
            progressSlider.value = percentage;
            this.updateSliderBackground(progressSlider, percentage);
          }
          if (progressText) {
            progressText.textContent = `${percentage}%`;
          }
        }
      }

      // 계속 업데이트 (ID 저장하여 나중에 정리 가능)
      this.animationFrameId = requestAnimationFrame(this.updateProgress);
    };

    // 진행도 업데이트 시작
    this.updateProgress();
  }

  /**
   * 리소스 정리 (페이지 언로드 시 호출)
   */
  destroy() {
    // requestAnimationFrame 정리
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * 계급 범위 편집기 이벤트 리스너 등록
   */
  initClassRangeEditor() {
    const firstEndInput = document.getElementById('firstEnd');
    const secondEndInput = document.getElementById('secondEnd');
    const lastStartInput = document.getElementById('lastStart');
    const secondStart = document.getElementById('secondStart');
    const lastEnd = document.getElementById('lastEnd');
    const intervalDisplay = document.getElementById('intervalDisplay');

    // 실시간 업데이트 함수
    const updateValues = () => {
      const firstEnd = parseFloat(firstEndInput?.value) || 1;
      const secondEnd = parseFloat(secondEndInput?.value) || 3;
      const lastStart = parseFloat(lastStartInput?.value) || 15;

      // 두 번째 칸 시작값 = 첫 칸 끝값
      if (secondStart) {
        secondStart.textContent = firstEnd;
      }

      // 간격 계산
      const interval = secondEnd - firstEnd;
      if (intervalDisplay) {
        intervalDisplay.textContent = `(간격: ${interval})`;
      }

      // 마지막 칸 끝값 = 마지막 시작값 + 간격
      if (lastEnd) {
        lastEnd.textContent = lastStart + interval;
      }

      // 재생성
      this.regenerateWithCustomRange();
    };

    // 입력 이벤트 리스너
    firstEndInput?.addEventListener('input', updateValues);
    secondEndInput?.addEventListener('input', updateValues);
    lastStartInput?.addEventListener('input', updateValues);
  }

  /**
   * 상첨자 토글 이벤트 리스너 등록
   */
  initSuperscriptToggle() {
    const checkbox = document.querySelector('.dataset-show-superscript');
    checkbox?.addEventListener('change', () => {
      // 데이터가 있을 때만 재렌더링
      if (DataStore.hasData()) {
        const { classes } = DataStore.getData();
        const configWithAlignment = this.getTableConfigWithAlignment();

        this.tableRenderer.draw(classes, DataStore.getRawData().length, configWithAlignment);
      }
    });
  }

  /**
   * 막대 라벨 토글 이벤트 리스너 등록
   */
  initBarLabelsToggle() {
    const checkbox = document.getElementById('showBarLabels');
    checkbox?.addEventListener('change', () => {
      // CONFIG 상태 업데이트
      CONFIG.SHOW_BAR_LABELS = checkbox.checked;

      // 데이터가 있을 때만 차트 재생성
      if (DataStore.hasData()) {
        const { classes } = DataStore.getData();
        const customLabels = this.getCustomLabels();
        const dataType = ChartStore.getDataType();
        const ellipsisInfo = ChartStore.getConfig()?.ellipsisInfo;
        const configWithAlignment = this.getTableConfigWithAlignment();

        // 레이어 재생성 (레이어 시스템 사용하되 애니메이션 스킵)
        this.chartRenderer.draw(classes, customLabels.axis, ellipsisInfo, dataType, configWithAlignment, customLabels.calloutTemplate);

        // 애니메이션 즉시 완료 (타임라인을 끝으로 이동)
        this.chartRenderer.stopAnimation();
        this.chartRenderer.timeline.currentTime = this.chartRenderer.timeline.duration;
        this.chartRenderer.renderFrame();
      }
    });
  }

  /**
   * 히스토그램/다각형 표시 토글 이벤트 리스너 등록
   */
  initChartElementsToggle() {
    // 히스토그램 토글
    const histogramCheckbox = document.getElementById('showHistogram');
    histogramCheckbox?.addEventListener('change', () => {
      CONFIG.SHOW_HISTOGRAM = histogramCheckbox.checked;

      if (DataStore.hasData()) {
        const { classes } = DataStore.getData();
        const customLabels = this.getCustomLabels();
        const dataType = ChartStore.getDataType();
        const ellipsisInfo = ChartStore.getConfig()?.ellipsisInfo;
        const configWithAlignment = this.getTableConfigWithAlignment();

        this.chartRenderer.draw(classes, customLabels.axis, ellipsisInfo, dataType, configWithAlignment, customLabels.calloutTemplate);
        this.chartRenderer.stopAnimation();
        this.chartRenderer.timeline.currentTime = this.chartRenderer.timeline.duration;
        this.chartRenderer.renderFrame();
      }
    });

    // 다각형 토글
    const polygonCheckbox = document.getElementById('showPolygon');
    polygonCheckbox?.addEventListener('change', () => {
      CONFIG.SHOW_POLYGON = polygonCheckbox.checked;

      if (DataStore.hasData()) {
        const { classes } = DataStore.getData();
        const customLabels = this.getCustomLabels();
        const dataType = ChartStore.getDataType();
        const ellipsisInfo = ChartStore.getConfig()?.ellipsisInfo;
        const configWithAlignment = this.getTableConfigWithAlignment();

        this.chartRenderer.draw(classes, customLabels.axis, ellipsisInfo, dataType, configWithAlignment, customLabels.calloutTemplate);
        this.chartRenderer.stopAnimation();
        this.chartRenderer.timeline.currentTime = this.chartRenderer.timeline.duration;
        this.chartRenderer.renderFrame();
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
            const customLabels = this.getCustomLabels();
            const dataType = ChartStore.getDataType();
            const ellipsisInfo = ChartStore.getConfig()?.ellipsisInfo;
            const configWithAlignment = this.getTableConfigWithAlignment();

            this.chartRenderer.draw(classes, customLabels.axis, ellipsisInfo, dataType, configWithAlignment, customLabels.calloutTemplate);
            this.chartRenderer.stopAnimation();
            this.chartRenderer.timeline.currentTime = this.chartRenderer.timeline.duration;
            this.chartRenderer.renderFrame();
          }
        }
      });
    });
  }

  /**
   * 격자선 표시 토글 이벤트 리스너 등록
   */
  initGridToggle() {
    const horizontalCheckbox = document.getElementById('showHorizontalGrid');
    const verticalCheckbox = document.getElementById('showVerticalGrid');

    // 가로 격자선 토글
    horizontalCheckbox?.addEventListener('change', () => {
      CONFIG.GRID_SHOW_HORIZONTAL = horizontalCheckbox.checked;
      this.redrawChart();
    });

    // 세로 격자선 토글
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

    // 파선 토글
    const dashedLinesCheckbox = document.getElementById('showDashedLines');
    dashedLinesCheckbox?.addEventListener('change', () => {
      CONFIG.SHOW_DASHED_LINES = dashedLinesCheckbox.checked;
      this.redrawChart();
    });
  }

  /**
   * 차트 다시 그리기 (격자선 변경 시)
   */
  redrawChart() {
    if (DataStore.hasData()) {
      const { classes } = DataStore.getData();
      const customLabels = this.getCustomLabels();
      const dataType = ChartStore.getDataType();
      const ellipsisInfo = ChartStore.getConfig()?.ellipsisInfo;
      const configWithAlignment = this.getTableConfigWithAlignment();

      // 레이어 재생성 (애니메이션 스킵)
      this.chartRenderer.draw(classes, customLabels.axis, ellipsisInfo, dataType, configWithAlignment, customLabels.calloutTemplate);

      // 애니메이션 즉시 완료
      this.chartRenderer.stopAnimation();
      this.chartRenderer.timeline.currentTime = this.chartRenderer.timeline.duration;
      this.chartRenderer.renderFrame();
    }
  }

  /**
   * 테이블 설정 패널 동적 생성
   * CONFIG.DEFAULT_LABELS.table 기반으로 각 컬럼별 설정 행 생성
   */
  initTableConfigPanel() {
    const panel = this._getTableConfigPanel();
    if (!panel) return;

    // CONFIG에서 컬럼 정보 가져오기
    const tableLabels = CONFIG.DEFAULT_LABELS.table;
    const columns = [
      { key: 'class', label: tableLabels.class },
      { key: 'midpoint', label: tableLabels.midpoint },
      { key: 'frequency', label: tableLabels.frequency },
      { key: 'relativeFrequency', label: tableLabels.relativeFrequency },
      { key: 'cumulativeFrequency', label: tableLabels.cumulativeFrequency },
      { key: 'cumulativeRelativeFrequency', label: tableLabels.cumulativeRelativeFrequency }
    ];

    // 각 컬럼별 설정 행 생성
    const defaultVisibleColumns = CONFIG.TABLE_DEFAULT_VISIBLE_COLUMNS;
    columns.forEach((column, index) => {
      const row = document.createElement('div');
      row.className = 'table-config-row';
      row.draggable = true;
      row.dataset.columnIndex = index;

      const defaultAlignment = CONFIG.TABLE_DEFAULT_ALIGNMENT[column.label] || 'center';
      const isChecked = defaultVisibleColumns[index] ? 'checked' : '';

      row.innerHTML = `
        <span class="drag-handle">⋮⋮</span>
        <input type="checkbox" class="column-checkbox" data-column-index="${index}" ${isChecked}>
        <span class="column-label">${column.label}</span>
        <div class="alignment-buttons">
          <button class="align-btn ${defaultAlignment === 'left' ? 'active' : ''}" data-column="${column.label}" data-align="left">L</button>
          <button class="align-btn ${defaultAlignment === 'center' ? 'active' : ''}" data-column="${column.label}" data-align="center">C</button>
          <button class="align-btn ${defaultAlignment === 'right' ? 'active' : ''}" data-column="${column.label}" data-align="right">R</button>
        </div>
        <div class="label-input-wrapper">
          <input type="text" class="label-input" data-column-index="${index}" placeholder="${column.label}" value="">
        </div>
      `;

      panel.appendChild(row);
    });

    // 이벤트 리스너 등록
    this.initTableConfigEvents();
  }

  /**
   * 테이블 설정 패널 이벤트 리스너
   */
  initTableConfigEvents() {
    const panel = this._getTableConfigPanel();
    if (!panel) return;

    // 체크박스 변경 이벤트
    panel.querySelectorAll('.column-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', () => this.handleTableUpdate());
    });

    // 라벨 입력 이벤트
    panel.querySelectorAll('.label-input').forEach(input => {
      input.addEventListener('input', () => this.handleTableUpdate());
    });

    // 정렬 버튼 이벤트
    panel.querySelectorAll('.align-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const column = e.target.dataset.column;
        const alignment = e.target.dataset.align;

        // 같은 컬럼의 다른 버튼 비활성화
        panel.querySelectorAll(`.align-btn[data-column="${column}"]`).forEach(b => {
          b.classList.remove('active');
        });
        e.target.classList.add('active');

        // Store에 저장
        TableStore.setColumnAlignment(column, alignment);

        // 테이블 업데이트
        this.handleTableUpdate();
      });
    });

    // 드래그 앤 드롭 초기화
    this.initTableConfigDragAndDrop();
  }

  /**
   * 테이블 설정 변경 시 테이블 재렌더링
   */
  handleTableUpdate() {
    if (!DataStore.hasData()) return;

    const { classes } = DataStore.getData();
    const configWithAlignment = this.getTableConfigWithAlignment();

    this.tableRenderer.draw(classes, DataStore.getRawData().length, configWithAlignment);
  }

  /**
   * 테이블 설정 패널 드래그 앤 드롭 초기화
   */
  initTableConfigDragAndDrop() {
    const panel = this._getTableConfigPanel();
    if (!panel) return;

    let draggedElement = null;

    panel.querySelectorAll('.table-config-row').forEach(row => {
      row.addEventListener('dragstart', (e) => {
        draggedElement = e.target;
        e.target.classList.add('dragging');
      });

      row.addEventListener('dragend', (e) => {
        e.target.classList.remove('dragging');
        panel.querySelectorAll('.table-config-row').forEach(r => r.classList.remove('drag-over'));

        // 순서 변경 적용
        this.updateColumnOrder();
        this.handleTableUpdate();
      });

      row.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (e.target.closest('.table-config-row') && e.target !== draggedElement) {
          e.target.closest('.table-config-row').classList.add('drag-over');
        }
      });

      row.addEventListener('dragleave', (e) => {
        if (e.target.closest('.table-config-row')) {
          e.target.closest('.table-config-row').classList.remove('drag-over');
        }
      });

      row.addEventListener('drop', (e) => {
        e.preventDefault();
        const dropTarget = e.target.closest('.table-config-row');
        if (dropTarget && dropTarget !== draggedElement) {
          const allRows = [...panel.querySelectorAll('.table-config-row')];
          const draggedIndex = allRows.indexOf(draggedElement);
          const targetIndex = allRows.indexOf(dropTarget);

          if (draggedIndex < targetIndex) {
            dropTarget.after(draggedElement);
          } else {
            dropTarget.before(draggedElement);
          }
        }
      });
    });
  }

  /**
   * 드래그 후 컬럼 순서 업데이트
   */
  updateColumnOrder() {
    const rows = this._getTableConfigRows();
    if (rows.length === 0) return;

    this.columnOrder = rows.map(row => parseInt(row.dataset.columnIndex));
  }

  /**
   * 계급 범위 편집기 표시 및 초기값 설정
   * @param {Array} classes - 계급 배열
   */
  showClassRangeEditor(classes) {
    const editor = document.getElementById('classRangeEditor');
    if (!editor) return;

    // 편집기 표시
    editor.style.display = 'block';

    // 기본값 제안
    if (classes.length >= 3) {
      const firstEnd = classes[0].max;
      const secondEnd = classes[1].max;
      const lastStart = classes[classes.length - 1].min;

      // 입력 필드 placeholder 업데이트
      const firstEndInput = document.getElementById('firstEnd');
      const secondEndInput = document.getElementById('secondEnd');
      const lastStartInput = document.getElementById('lastStart');

      if (firstEndInput) firstEndInput.placeholder = firstEnd;
      if (secondEndInput) secondEndInput.placeholder = secondEnd;
      if (lastStartInput) lastStartInput.placeholder = lastStart;
    }
  }

  /**
   * 커스텀 범위로 도수분포표 재생성
   */
  regenerateWithCustomRange() {
    // 데이터가 없으면 아무것도 하지 않음
    const data = DataStore.getRawData();
    if (!data || data.length === 0) return;

    try {
      const firstEnd = parseFloat(document.getElementById('firstEnd')?.value);
      const secondEnd = parseFloat(document.getElementById('secondEnd')?.value);
      const lastStart = parseFloat(document.getElementById('lastStart')?.value);

      // 유효한 값이 모두 입력되었는지 확인
      if (!firstEnd || !secondEnd || !lastStart) return;

      const customRange = { firstEnd, secondEnd, lastStart };

      // 고급 설정 값 가져오기
      const customLabels = this.getCustomLabels();
      const tableConfig = this.getTableConfig();

      // 데이터 처리
      const stats = DataStore.getStats();
      const { classes } = DataProcessor.createClasses(stats, 0, null, customRange);
      DataProcessor.calculateFrequencies(data, classes);
      DataProcessor.calculateRelativeAndCumulative(classes, data.length);

      // 중략 표시 여부 확인
      const ellipsisInfo = DataProcessor.shouldShowEllipsis(classes);

      // Store 업데이트
      DataStore.setClasses(classes);
      ChartStore.setConfig(customLabels.axis, ellipsisInfo);

      // UI 재렌더링
      const configWithAlignment = this.getTableConfigWithAlignment();

      this.tableRenderer.draw(classes, data.length, configWithAlignment);

      // 차트 데이터 타입 가져오기
      const dataType = ChartStore.getDataType();
      this.chartRenderer.draw(classes, customLabels.axis, ellipsisInfo, dataType, configWithAlignment, customLabels.calloutTemplate);

      // 레이어 패널 재렌더링
      this.renderLayerPanel();

    } catch (error) {
      console.error('Custom range error:', error);
      MessageManager.warning(`범위 설정 오류: ${error.message}`);
    }
  }

  /**
   * 슬라이더 배경 그라데이션 업데이트
   * @param {HTMLInputElement} slider - 슬라이더 요소
   * @param {number} percentage - 진행도 (0~100)
   */
  updateSliderBackground(slider, percentage) {
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
    const primaryDark = getComputedStyle(document.documentElement).getPropertyValue('--color-primary-dark').trim();
    const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim();

    slider.style.background = `linear-gradient(to right, ${primaryColor} 0%, ${primaryDark} ${percentage}%, ${borderColor} ${percentage}%, ${borderColor} 100%)`;
  }

  /**
   * 조상 중 하나라도 접혀있는지 확인
   * @param {string} layerId - 확인할 레이어 ID
   * @param {LayerManager} layerManager - 레이어 매니저
   * @returns {boolean} 조상이 접혀있으면 true
   */
  isAnyAncestorCollapsed(layerId, layerManager, tableIndex = null) {
    const currentCollapsedGroups = this.collapsedGroups[this.currentLayerSource];
    let currentParent = layerManager.findParent(layerId);
    while (currentParent) {
      const uniqueKey = this._getLayerUniqueKey(currentParent.id, tableIndex);

      if (currentCollapsedGroups.has(uniqueKey)) {
        return true;
      }
      currentParent = layerManager.findParent(currentParent.id);
    }
    return false;
  }

  /**
   * 레이어 고유 키 생성
   * @param {string} layerId - 레이어 ID
   * @param {number|string|null} tableIndex - 테이블 인덱스 (테이블 모드일 때만 사용)
   * @returns {string} 고유 키
   */
  _getLayerUniqueKey(layerId, tableIndex = null) {
    if (this.currentLayerSource === 'table' && tableIndex !== null && tableIndex !== undefined) {
      return `${tableIndex}-${layerId}`;
    }
    return layerId;
  }

  /**
   * 레이어 패널 렌더링
   * @description 선택된 소스(차트/테이블)의 레이어 목록을 HTML로 생성하고 이벤트 리스너 등록
   */
  renderLayerPanel() {
    const layerList = document.getElementById('layerList');
    if (!layerList) return;

    // 선택된 소스에 따라 레이어 가져오기
    let layers = [];
    let layerManager = null;

    if (this.currentLayerSource === 'chart') {
      layerManager = this.chartRenderer.layerManager;
      if (!layerManager) {
        layerList.innerHTML = '<p class="no-layers">레이어가 없습니다</p>';
        return;
      }
      layers = layerManager.getAllLayers();

    } else if (this.currentLayerSource === 'table') {
      // 모든 테이블 렌더러의 레이어 통합
      if (this.tableRenderers.length === 0) {
        layerList.innerHTML = '<p class="no-layers">레이어가 없습니다</p>';
        return;
      }

      // 각 테이블의 레이어를 가져와서 통합
      this.tableRenderers.forEach((renderer, tableIndex) => {
        const tableLayerManager = renderer.getLayerManager();
        if (tableLayerManager) {
          const tableLayers = tableLayerManager.getAllLayers();

          // 각 레이어에 tableIndex와 tableLayerManager 정보 추가
          tableLayers.forEach(({ layer, depth }) => {
            layers.push({
              layer,
              depth,
              tableIndex,
              tableLayerManager
            });
          });
        }
      });

      if (layers.length === 0) {
        layerList.innerHTML = '<p class="no-layers">레이어가 없습니다</p>';
        return;
      }
    }

    if (layers.length === 0) {
      layerList.innerHTML = '<p class="no-layers">레이어가 없습니다</p>';
      return;
    }

    // root 레이어 제외 및 접힌 그룹의 자식 필터링
    const filteredLayers = layers
      .filter(({ layer, tableIndex, tableLayerManager }) => {
        if (layer.id === 'root') return false;

        // 조상 중 하나라도 접혀있으면 숨김
        const currentLayerManager = this.currentLayerSource === 'table' ? tableLayerManager : layerManager;
        if (this.isAnyAncestorCollapsed(layer.id, currentLayerManager, tableIndex)) {
          return false;
        }

        return true;
      })
      .map(({ layer, depth, tableIndex, tableLayerManager }) => ({
        layer,
        depth: depth - 1, // depth 1 감소 (histogram/polygon이 depth-0이 됨)
        tableIndex, // 테이블 모드일 때 사용
        tableLayerManager // 테이블 모드일 때 사용
      }));

    // HTML 생성
    const currentCollapsedGroups = this.collapsedGroups[this.currentLayerSource];
    layerList.innerHTML = filteredLayers.map(({ layer, depth, tableIndex, tableLayerManager }) => {
      const typeClass = layer.type;
      const depthClass = `depth-${depth}`;
      const isGroup = layer.type === 'group';

      // 테이블 모드일 때 고유 키로 collapsed 상태 체크
      const uniqueKey = this._getLayerUniqueKey(layer.id, tableIndex);
      const isCollapsed = currentCollapsedGroups.has(uniqueKey);
      const toggleIcon = isGroup ? (isCollapsed ? '▶' : '▼') : '';

      const visibilityIcon = layer.visible ? '👁️' : '👁️‍🗨️';

      // 테이블 모드일 때 레이어 이름 앞에 "테이블 N:" 접두사 추가
      let layerName = layer.name || layer.id;
      if (this.currentLayerSource === 'table' && tableIndex !== undefined) {
        layerName = `테이블 ${tableIndex + 1}: ${layerName}`;
      }

      // 타입별 아이콘 및 색상
      let typeIcon = '';
      if (layer.id === 'histogram') {
        typeIcon = '<span class="layer-icon histogram-icon">📊</span>';
      } else if (layer.id === 'polygon') {
        typeIcon = '<span class="layer-icon polygon-icon">📈</span>';
      } else if (layer.id === 'points') {
        typeIcon = '<span class="layer-icon point-icon">⬤</span>';
      } else if (layer.id === 'lines') {
        typeIcon = '<span class="layer-icon line-icon">━</span>';
      } else if (layer.type === 'bar') {
        typeIcon = '<span class="layer-icon bar-icon">▓</span>';
      } else if (layer.type === 'point') {
        typeIcon = '<span class="layer-icon point-icon">●</span>';
      } else if (layer.type === 'line') {
        typeIcon = '<span class="layer-icon line-icon">─</span>';
      }

      // data-table-index 속성 추가 (테이블 모드일 때만)
      const tableIndexAttr = (this.currentLayerSource === 'table' && tableIndex !== undefined) ? ` data-table-index="${tableIndex}"` : '';

      return `
        <div class="layer-item ${depthClass}" draggable="true" data-layer-id="${Utils.escapeHtml(layer.id)}"${tableIndexAttr}>
          ${isGroup ? `<span class="layer-toggle" data-layer-id="${Utils.escapeHtml(layer.id)}"${tableIndexAttr}>${toggleIcon}</span>` : '<span class="layer-toggle-spacer"></span>'}
          <span class="layer-drag-handle">⋮⋮</span>
          <button class="layer-visibility-btn" data-layer-id="${Utils.escapeHtml(layer.id)}" data-visible="${layer.visible}"${tableIndexAttr} title="${layer.visible ? '숨기기' : '보이기'}">${visibilityIcon}</button>
          ${typeIcon}
          <span class="layer-name">${Utils.escapeHtml(layerName)}</span>
          <button class="layer-json-btn" data-layer-id="${Utils.escapeHtml(layer.id)}"${tableIndexAttr} title="JSON 미리보기">📄</button>
        </div>
      `;
    }).join('');

    // 토글 이벤트
    layerList.querySelectorAll('.layer-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const layerId = e.target.dataset.layerId;
        const tableIndex = e.target.dataset.tableIndex;
        const currentCollapsedGroups = this.collapsedGroups[this.currentLayerSource];

        // 테이블 모드일 때 고유 키 생성 (tableIndex-layerId)
        const uniqueKey = this._getLayerUniqueKey(layerId, tableIndex);

        if (currentCollapsedGroups.has(uniqueKey)) {
          currentCollapsedGroups.delete(uniqueKey);
        } else {
          currentCollapsedGroups.add(uniqueKey);
        }

        this.renderLayerPanel();
      });
    });

    // 드래그앤드롭 초기화
    this.initLayerDragAndDrop();

    // 가시성 토글 버튼 이벤트
    layerList.querySelectorAll('.layer-visibility-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const layerId = e.currentTarget.dataset.layerId;
        const currentVisible = e.currentTarget.dataset.visible === 'true';
        const newVisible = !currentVisible;

        // 테이블 모드일 때 해당 테이블의 layerManager 사용
        let targetLayerManager = layerManager;
        let targetRenderer = null;

        if (this.currentLayerSource === 'table') {
          const tableIndex = parseInt(e.currentTarget.dataset.tableIndex);
          if (!isNaN(tableIndex) && this.tableRenderers[tableIndex]) {
            targetRenderer = this.tableRenderers[tableIndex];
            targetLayerManager = targetRenderer.getLayerManager();
          }
        }

        if (!targetLayerManager) return;

        // 레이어 가시성 변경
        targetLayerManager.setLayerVisibility(layerId, newVisible);

        // 부모 레이어인 경우 모든 자식도 함께 변경
        const layer = targetLayerManager.findLayer(layerId);
        if (layer && layer.type === 'group' && layer.children) {
          layer.children.forEach(child => {
            targetLayerManager.setLayerVisibility(child.id, newVisible);
          });
        }

        // UI 업데이트
        this.renderLayerPanel();

        // 선택된 소스의 렌더러 업데이트
        if (this.currentLayerSource === 'chart') {
          this.chartRenderer.renderFrame();
        } else if (this.currentLayerSource === 'table' && targetRenderer) {
          targetRenderer.renderFrame();
        }
      });
    });

    // JSON 미리보기 버튼 이벤트
    layerList.querySelectorAll('.layer-json-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const layerId = e.currentTarget.dataset.layerId;
        const tableIndex = e.currentTarget.dataset.tableIndex;
        this.showJsonPreview(layerId, tableIndex);
      });
    });
  }

  /**
   * 데이터셋 탭 렌더링
   * @param {number} count - 데이터셋 개수
   */
  renderDatasetTabs(count) {
    const tabsContainer = document.getElementById('datasetTabs');
    if (!tabsContainer) return;

    tabsContainer.innerHTML = '';

    // 탭 버튼 생성
    for (let i = 0; i < count; i++) {
      const btn = document.createElement('button');
      btn.className = `dataset-tab-btn ${i === 0 ? 'active' : ''}`;
      btn.textContent = `데이터셋 ${i + 1}`;
      btn.dataset.tabIndex = i;
      btn.addEventListener('click', () => this.toggleDatasetTab(i));
      tabsContainer.appendChild(btn);
    }

    // 초기 상태: 첫 번째 탭만 표시
    this.updateTableVisibility();
  }

  /**
   * 데이터셋 탭 토글 (복수 선택 가능)
   * @param {number} index - 토글할 탭 인덱스
   */
  toggleDatasetTab(index) {
    const tabs = document.querySelectorAll('.dataset-tab-btn');
    const targetTab = tabs[index];

    if (targetTab) {
      // active 상태 토글
      targetTab.classList.toggle('active');

      // 테이블 표시 업데이트
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

    // 각 탭의 active 상태에 따라 해당 테이블 표시/숨김
    tabs.forEach((tab, i) => {
      const isActive = tab.classList.contains('active');
      if (allCanvases[i]) {
        allCanvases[i].style.display = isActive ? 'block' : 'none';
      }
    });
  }

  /**
   * 레이어 드래그앤드롭 초기화
   */
  initLayerDragAndDrop() {
    const layerList = document.getElementById('layerList');
    const items = layerList.querySelectorAll('.layer-item');

    items.forEach(item => {
      item.addEventListener('dragstart', (e) => this.handleLayerDragStart(e));
      item.addEventListener('dragover', (e) => this.handleLayerDragOver(e));
      item.addEventListener('drop', (e) => this.handleLayerDrop(e));
      item.addEventListener('dragend', (e) => this.handleLayerDragEnd(e));
      item.addEventListener('dragenter', (e) => this.handleLayerDragEnter(e));
      item.addEventListener('dragleave', (e) => this.handleLayerDragLeave(e));
    });
  }

  handleLayerDragStart(e) {
    this.draggedLayerElement = e.currentTarget;
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
  }

  handleLayerDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
  }

  handleLayerDragEnter(e) {
    if (e.currentTarget !== this.draggedLayerElement) {
      e.currentTarget.classList.add('drag-over');
    }
  }

  handleLayerDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  }

  handleLayerDrop(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }

    if (this.draggedLayerElement !== e.currentTarget) {
      const draggedId = this.draggedLayerElement.dataset.layerId;
      const targetId = e.currentTarget.dataset.layerId;

      // 레이어 순서 변경
      const draggedLayer = this.chartRenderer.layerManager.findLayer(draggedId);
      const targetLayer = this.chartRenderer.layerManager.findLayer(targetId);

      if (draggedLayer && targetLayer) {
        // 같은 부모인지 확인
        const draggedParent = this.chartRenderer.layerManager.findParent(draggedId);
        const targetParent = this.chartRenderer.layerManager.findParent(targetId);

        if (draggedParent && targetParent && draggedParent.id === targetParent.id) {
          // 순서 교환
          const temp = draggedLayer.order;
          draggedLayer.order = targetLayer.order;
          targetLayer.order = temp;

          // children 배열을 order 기준으로 재정렬
          draggedParent.children.sort((a, b) => a.order - b.order);

          // 레이어 패널 다시 렌더링
          this.renderLayerPanel();

          // 애니메이션 타이밍 재설정 및 재생
          this.chartRenderer.replayAnimation();
        }
      }
    }

    e.currentTarget.classList.remove('drag-over');
    return false;
  }

  handleLayerDragEnd(e) {
    const items = document.querySelectorAll('.layer-item');
    items.forEach(item => {
      item.classList.remove('dragging');
      item.classList.remove('drag-over');
    });
  }

  /**
   * 차트 업데이트
   * @description Store에서 데이터를 가져와 차트를 다시 렌더링 (데이터 변경 없음)
   */
  updateChart() {
    const classes = DataStore.getData()?.classes;
    const axisLabels = ChartStore.getConfig()?.axisLabels;
    const ellipsisInfo = ChartStore.getConfig()?.ellipsisInfo;
    const dataType = ChartStore.getDataType();
    const tableConfig = this.getTableConfigWithAlignment();
    const customLabels = this.getCustomLabels();

    if (classes) {
      this.chartRenderer.draw(classes, axisLabels, ellipsisInfo, dataType, tableConfig, customLabels.calloutTemplate);
    }
  }

  /**
   * 테이블 업데이트
   * @description Store에서 데이터를 가져와 테이블을 다시 렌더링
   */
  updateTable() {
    const data = DataStore.getData();
    if (!data) return;

    const { classes } = data;
    const total = data.data.length;
    const tableConfig = TableStore.getConfig();

    // tableConfig에 columnAlignment 추가
    const configWithAlignment = {
      ...tableConfig,
      columnAlignment: TableStore.getAllAlignments()
    };

    this.tableRenderer.draw(classes, total, configWithAlignment);
  }


  /**
   * 차트 데이터 타입 라디오 버튼 동적 생성 및 이벤트 리스너 등록
   */
  initChartDataTypeRadios() {
    const container = document.getElementById('chartDataTypeRadios');
    const defaultDataType = ChartStore.getDataType();

    // CONFIG에서 차트 데이터 타입 읽어서 동적 생성
    CONFIG.CHART_DATA_TYPES.forEach((typeInfo, index) => {
      const radioItem = document.createElement('div');
      radioItem.className = 'radio-item';

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.id = `chartDataType${index}`;
      radio.name = 'chartDataType';
      radio.value = typeInfo.id;
      radio.checked = typeInfo.id === defaultDataType;

      const label = document.createElement('label');
      label.htmlFor = `chartDataType${index}`;
      label.textContent = typeInfo.label;

      // 라디오 버튼 클릭 이벤트
      radio.addEventListener('change', () => this.handleChartDataTypeChange(typeInfo.id));

      radioItem.appendChild(radio);
      radioItem.appendChild(label);
      container.appendChild(radioItem);
    });
  }

  /**
   * 차트 데이터 타입 변경 핸들러
   * @param {string} dataType - 선택된 데이터 타입 ID
   */
  handleChartDataTypeChange(dataType) {
    // ChartStore에 저장
    ChartStore.setDataType(dataType);

    // 차트 다시 렌더링
    this.updateChart();
  }


  /**
   * JSON 데이터 내보내기
   * @description 현재 차트 및 테이블 레이어 구조와 타임라인을 JSON 파일로 다운로드
   */
  exportJson() {
    try {
      // 차트 및 테이블 레이어와 타임라인 데이터 추출
      const jsonData = DataProcessor.exportData(
        this.chartRenderer.layerManager,
        this.chartRenderer.timeline,
        this.chartRenderer,
        this.tableRenderers
      );

      // JSON 문자열 생성 (들여쓰기 포함)
      const jsonString = JSON.stringify(jsonData, null, 2);

      // 메모리 체크 (50MB 제한)
      const sizeInBytes = new Blob([jsonString]).size;
      const sizeInMB = sizeInBytes / (1024 * 1024);

      if (sizeInMB > 50) {
        throw new Error(
          `JSON 파일이 너무 큽니다 (${sizeInMB.toFixed(1)}MB). ` +
          `최대 50MB까지 지원됩니다.`
        );
      }

      // Blob 생성
      const blob = new Blob([jsonString], { type: 'application/json' });

      // 파일명 생성 (YYYYMMDD-HHmmss)
      const filename = `chart-data-${Utils.formatTimestamp()}.json`;

      // 다운로드 링크 생성 및 클릭
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // URL 해제
      URL.revokeObjectURL(link.href);

      MessageManager.success(`JSON 파일이 다운로드되었습니다: ${filename}`);
    } catch (error) {
      console.error('Export error:', error);
      MessageManager.error(`내보내기 오류: ${error.message}`);
    }
  }

  /**
   * 커스텀 테이블 타입 처리 (카테고리 행렬, 이원 분류표, 줄기-잎 그림)
   * @param {Object} inputValues - 데이터셋 입력값
   * @param {boolean} reset - 리셋 모드 여부
   * @param {number} processedCount - 현재까지 처리된 데이터셋 수
   * @returns {Object} 처리 결과 { success: boolean, error?: string }
   */
  processCustomTableType(inputValues, reset, processedCount) {
    const { tableType, rawData, datasetId } = inputValues;

    try {
      // 1. 파서를 사용하여 데이터 파싱
      const parseResult = ParserFactory.parse(tableType, rawData);

      if (!parseResult.success) {
        MessageManager.warning(`데이터셋 ${datasetId}: ${parseResult.error}`);
        return { success: false, error: parseResult.error };
      }

      // 2. 검증
      const validation = Validator.validateByType(tableType, rawData);
      if (!validation.valid) {
        MessageManager.warning(`데이터셋 ${datasetId}: ${validation.message}`);
        return { success: false, error: validation.message };
      }

      // 3. 테이블 렌더러 선택/생성
      let currentTableRenderer;
      if (reset && processedCount === 0) {
        currentTableRenderer = this.tableRenderers[0];
      } else {
        currentTableRenderer = this.createNewTable();
      }

      // 4. 테이블 렌더링 (drawCustomTable 사용)
      currentTableRenderer.drawCustomTable(tableType, parseResult.data, null);

      // 5. 성공 메시지
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
   * @param {boolean} reset - true: 기존 테이블 초기화 후 새로 생성, false: 기존 테이블 유지하며 추가
   * @description 입력 데이터를 파싱하고 검증한 후, 도수분포표와 히스토그램 생성
   * @throws {Error} 데이터 처리 중 오류 발생 시
   */
  async generate(reset = true) {
    try {
      // KaTeX 폰트 로드 대기
      await KatexUtils.waitForFonts();

      MessageManager.hide();

      // 1. 모든 데이터셋의 입력값 가져오기
      const allDatasetInputs = this.getAllDatasetInputValues();

      if (allDatasetInputs.length === 0) {
        MessageManager.error('데이터를 입력해주세요!');
        return;
      }

      // 2. 리셋 모드인 경우 추가 테이블 제거
      if (reset) {
        this.clearExtraTables();
      }

      // 3. 각 데이터셋 처리
      let processedCount = 0;
      const processedDatasets = [];

      for (let i = 0; i < allDatasetInputs.length; i++) {
        const inputValues = allDatasetInputs[i];
        const tableType = inputValues.tableType || CONFIG.TABLE_TYPES.FREQUENCY;

        try {
          // 커스텀 테이블 타입 처리 (도수분포표가 아닌 경우)
          if (tableType !== CONFIG.TABLE_TYPES.FREQUENCY) {
            const customResult = this.processCustomTableType(inputValues, reset, processedCount);
            if (customResult.success) {
              processedCount++;
              // 커스텀 타입은 차트 없이 테이블만 렌더링
            }
            continue;
          }

          // 3.1. 데이터 파싱 (도수분포표)
          const data = DataProcessor.parseInput(inputValues.rawData);

          // 3.2. 데이터 검증
          const dataValidation = Validator.validateData(data);
          if (!dataValidation.valid) {
            MessageManager.warning(`데이터셋 ${inputValues.datasetId}: ${dataValidation.message}`);
            continue;
          }

          // 3.3. 계급 설정 검증
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

          // 3.4. 데이터 처리
          const stats = DataProcessor.calculateBasicStats(data);
          const { classes } = DataProcessor.createClasses(stats, inputValues.classCount, inputValues.classWidth);
          DataProcessor.calculateFrequencies(data, classes);
          DataProcessor.calculateRelativeAndCumulative(classes, data.length);

          // 중략 표시 여부 확인
          const ellipsisInfo = DataProcessor.shouldShowEllipsis(classes);

          // 3.5. 테이블 렌더러 선택/생성
          let currentTableRenderer;
          if (reset && processedCount === 0) {
            // 첫 번째 데이터셋: 기존 첫 번째 테이블 사용
            currentTableRenderer = this.tableRenderers[0];
          } else if (!reset || processedCount > 0) {
            // 추가 모드 또는 두 번째 이상 데이터셋: 새 테이블 생성
            currentTableRenderer = this.createNewTable();
          }

          // 3.6. 테이블 렌더링
          const tableConfig = this.getTableConfigWithAlignment();
          currentTableRenderer.draw(classes, data.length, tableConfig);

          // 3.7. 처리된 데이터셋 저장
          processedDatasets.push({
            datasetId: inputValues.datasetId,
            data,
            stats,
            classes,
            ellipsisInfo,
            settings: inputValues.settings
          });

          // 3.8. DatasetStore 업데이트
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

      // 도수분포표가 있는 경우에만 차트 및 통계 카드 렌더링
      if (processedDatasets.length > 0) {
        // 4. 첫 번째 데이터셋으로 UI 업데이트 (통계 카드)
        const firstDataset = processedDatasets[0];
        UIRenderer.renderStatsCards(firstDataset.stats);

        // 5. 모든 데이터셋에 대해 차트 렌더링 (겹쳐 그리기)
        const customLabels = this.getCustomLabels();
        const tableConfig = this.getDefaultTableConfig();
        const dataType = ChartStore.getDataType(); // 전역 차트 데이터 유형

        // 5.1. 통합 좌표 시스템을 위한 최대 Y값 계산
        let unifiedMaxY = 0;
        for (const dataset of processedDatasets) {
          const freq = dataset.classes.map(c => c.frequency);
          const total = freq.reduce((a, b) => a + b, 0);

          if (total > 0) {
            if (dataType === 'frequency') {
              const maxFreq = Math.max(...freq);
              unifiedMaxY = Math.max(unifiedMaxY, maxFreq);
            } else { // 'relativeFrequency'
              const relativeFreqs = freq.map(f => f / total);
              const maxRelative = Math.max(...relativeFreqs) * CONFIG.CHART_Y_SCALE_MULTIPLIER;
              unifiedMaxY = Math.max(unifiedMaxY, maxRelative);
            }
          }
        }

        for (let i = 0; i < processedDatasets.length; i++) {
          const dataset = processedDatasets[i];

          // 각 데이터셋의 설정을 CONFIG에 반영
          CONFIG.SHOW_HISTOGRAM = dataset.settings.showHistogram;
          CONFIG.SHOW_POLYGON = dataset.settings.showPolygon;
          CONFIG.POLYGON_COLOR_PRESET = dataset.settings.colorPreset;
          CONFIG.SHOW_BAR_LABELS = dataset.settings.showBarLabels;
          CONFIG.SHOW_DASHED_LINES = dataset.settings.showDashedLines;
          CONFIG.SHOW_CALLOUT = dataset.settings.showCallout;

          // 첫 번째 데이터셋만 캔버스 초기화, 나머지는 겹쳐 그리기
          const clearCanvas = (i === 0);

          this.chartRenderer.draw(
            dataset.classes,
            customLabels.axis,
            dataset.ellipsisInfo,
            dataType, // 전역 설정 사용
            tableConfig,
            dataset.settings.calloutTemplate,
            clearCanvas,
            unifiedMaxY // 통합 최대 Y값
          );
        }

        // 6. Store에 첫 번째 데이터셋 저장 (기존 호환성 유지)
        DataStore.setData(firstDataset.data, firstDataset.stats, firstDataset.classes);
        ChartStore.setConfig(customLabels.axis, firstDataset.ellipsisInfo);

        // 10. 계급 범위 편집기 표시 (첫 번째 데이터셋)
        this.showClassRangeEditor(firstDataset.classes);
      }

      // 7. 레이어 패널 렌더링
      this.renderLayerPanel();

      // 8. 데이터셋 탭 렌더링
      this.renderDatasetTabs(processedCount);

      // 9. 결과 섹션 표시 및 2열 레이아웃 전환
      document.getElementById('resultSection').classList.add('active');
      document.querySelector('.layout-grid').classList.add('two-column');

      // 11. JSON 내보내기 버튼 표시
      const exportJsonBtn = document.getElementById('exportJsonBtn');
      if (exportJsonBtn) {
        exportJsonBtn.style.display = 'block';
      }

      // 12. 하이라이트 테스트 버튼 표시
      this.showHighlightTestButtons();

      // 13. 성공 메시지
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
   * 기본 테이블 설정 가져오기
   * @returns {Object} 테이블 설정 객체
   */
  getDefaultTableConfig() {
    return {
      visibleColumns: [...CONFIG.TABLE_DEFAULT_VISIBLE_COLUMNS],
      columnOrder: [...CONFIG.TABLE_DEFAULT_COLUMN_ORDER],
      labels: {},
      columnAlignment: {
        0: 'center',
        1: 'center',
        2: 'center',
        3: 'center',
        4: 'center',
        5: 'center'
      }
    };
  }

  /**
   * 추가 테이블 제거 (첫 번째 테이블만 유지)
   */
  clearExtraTables() {
    const tableWrapper = document.querySelector('.table-wrapper');
    if (!tableWrapper) return;

    // 첫 번째 캔버스를 제외한 모든 추가 캔버스 제거
    const allCanvases = tableWrapper.querySelectorAll('canvas');
    allCanvases.forEach((canvas, i) => {
      if (i > 0) canvas.remove();
    });

    // tableRenderers 배열을 첫 번째만 유지
    this.tableRenderers = this.tableRenderers.slice(0, 1);
    this.tableCounter = 1;
  }

  /**
   * 새 테이블 캔버스 생성 및 렌더러 추가
   * @returns {TableRenderer} 새로 생성된 테이블 렌더러
   */
  createNewTable() {
    const tableWrapper = document.querySelector('.table-wrapper');
    if (!tableWrapper) {
      throw new Error('테이블 래퍼를 찾을 수 없습니다.');
    }

    // 카운터 증가
    this.tableCounter++;
    const tableId = `frequencyTable-${this.tableCounter}`;

    // 새 캔버스 생성 (첫 번째 테이블과 동일한 구조)
    const canvas = document.createElement('canvas');
    canvas.id = tableId;
    canvas.role = 'img';
    canvas.setAttribute('aria-label', `도수분포표 ${this.tableCounter}`);

    // 테이블 래퍼에 추가
    tableWrapper.appendChild(canvas);

    // 새 렌더러 생성 및 저장
    const newRenderer = new TableRenderer(tableId);
    this.tableRenderers.push(newRenderer);

    return newRenderer;
  }

  /**
   * 테이블 설정 패널 요소 가져오기
   * @returns {HTMLElement|null} 패널 요소 또는 null
   * @private
   */
  _getTableConfigPanel() {
    return document.getElementById('tableConfigPanel');
  }

  /**
   * 모든 테이블 설정 행 가져오기
   * @returns {HTMLElement[]} 설정 행 배열
   * @private
   */
  _getTableConfigRows() {
    const panel = this._getTableConfigPanel();
    return panel ? [...panel.querySelectorAll('.table-config-row')] : [];
  }

  /**
   * 정렬 정보가 포함된 테이블 설정 가져오기
   * @returns {{labels: Object, visibleColumns: boolean[], columnOrder: number[], showSuperscript: boolean, columnAlignment: Object}} 통합 설정 객체
   * @description getTableConfig()에 columnAlignment를 추가한 통합 객체 반환
   */
  getTableConfigWithAlignment() {
    const tableConfig = this.getTableConfig();
    const columnAlignment = TableStore.getAllAlignments();
    return {
      ...tableConfig,
      columnAlignment: columnAlignment
    };
  }

  /**
   * 고급 설정에서 커스텀 라벨 가져오기
   * @returns {{axis: Object, table: Object, calloutTemplate: string}} 축 라벨, 표 라벨, 말풍선 템플릿
   * @description X축/Y축 라벨, 표 컬럼 라벨, 말풍선 템플릿을 통합하여 반환
   */
  getCustomLabels() {
    const xAxisLabel = document.getElementById('xAxisLabel')?.value.trim() || '';
    const yAxisLabel = document.getElementById('yAxisLabel')?.value.trim() || '';

    // 말풍선 체크박스 상태 확인
    const showCallout = document.getElementById('showCallout')?.checked || false;
    const calloutTemplate = showCallout
      ? (document.getElementById('calloutTemplate')?.value.trim() || CONFIG.CALLOUT_TEMPLATE)
      : null;

    // CONFIG의 기본 라벨 순서
    const defaults = [
      CONFIG.DEFAULT_LABELS.table.class,
      CONFIG.DEFAULT_LABELS.table.midpoint,
      CONFIG.DEFAULT_LABELS.table.frequency,
      CONFIG.DEFAULT_LABELS.table.relativeFrequency,
      CONFIG.DEFAULT_LABELS.table.cumulativeFrequency,
      CONFIG.DEFAULT_LABELS.table.cumulativeRelativeFrequency
    ];

    const panel = this._getTableConfigPanel();
    let labels = defaults; // 기본값으로 시작

    if (panel) {
      // 패널이 있으면 사용자 입력값 사용
      const labelInputs = [...panel.querySelectorAll('.label-input')];
      labels = labelInputs.map((input, i) => input.value.trim() || defaults[i]);
    }

    const [label1, label2, label3, label4, label5, label6] = labels;

    // X축 라벨과 표의 "계급" 컬럼을 통합
    const classLabel = xAxisLabel || label1 || CONFIG.DEFAULT_LABELS.table.class;
    // Y축 라벨과 표의 "상대도수(%)" 컬럼을 통합
    const relativeFreqLabel = yAxisLabel || label4 || CONFIG.DEFAULT_LABELS.table.relativeFrequency;

    return {
      axis: {
        xAxis: xAxisLabel || label1 || CONFIG.DEFAULT_LABELS.xAxis,
        // Y축 라벨: 사용자가 입력한 경우만 전달 (비어있으면 null로 데이터 타입별 기본값 사용)
        yAxis: yAxisLabel || null
      },
      table: {
        class: classLabel,
        midpoint: label2,
        frequency: label3,
        relativeFrequency: relativeFreqLabel,
        cumulativeFrequency: label5,
        cumulativeRelativeFrequency: label6
      },
      calloutTemplate
    };
  }

  /**
   * 표 설정 가져오기
   * @returns {{labels: Object, visibleColumns: boolean[], columnOrder: number[], showSuperscript: boolean}} 표 설정 객체
   * @description 표시할 컬럼, 라벨, 순서 정보를 반환
   */
  getTableConfig() {
    const customLabels = this.getCustomLabels();

    const panel = this._getTableConfigPanel();
    if (!panel) {
      return {
        labels: customLabels.table,
        visibleColumns: [...CONFIG.TABLE_DEFAULT_VISIBLE_COLUMNS],
        columnOrder: [...CONFIG.TABLE_DEFAULT_COLUMN_ORDER],
        showSuperscript: CONFIG.TABLE_SHOW_SUPERSCRIPT
      };
    }

    // 체크박스 상태 확인 (원본 순서)
    const checkboxes = [...panel.querySelectorAll('.column-checkbox')];
    const originalVisibleColumns = checkboxes.map(cb => cb.checked);

    // 상첨자 표시 옵션
    const showSuperscript = document.querySelector('.dataset-show-superscript')?.checked ?? CONFIG.TABLE_SHOW_SUPERSCRIPT;

    return {
      labels: customLabels.table,
      visibleColumns: originalVisibleColumns,
      columnOrder: this.columnOrder,
      showSuperscript: showSuperscript
    };
  }

  /**
   * 레이어 소스 선택기 초기화
   */
  initLayerSourceSelector() {
    const selector = document.getElementById('layerSourceSelect');
    if (!selector) return;

    selector.addEventListener('change', (e) => {
      this.currentLayerSource = e.target.value;
      this.renderLayerPanel();
    });
  }

  /**
   * 하이라이트 테스트 버튼 초기화
   */
  initHighlightTestButtons() {
    const highlightCell1Btn = document.getElementById('highlightCell1');
    const highlightRow2Btn = document.getElementById('highlightRow2');
    const highlightCell3Btn = document.getElementById('highlightCell3');
    const clearHighlightBtn = document.getElementById('clearHighlight');

    const jsonCell1Btn = document.getElementById('jsonCell1');
    const jsonRow2Btn = document.getElementById('jsonRow2');
    const jsonCell3Btn = document.getElementById('jsonCell3');

    // 첫 행 도수 셀 하이라이트 (행 0, 열 2)
    highlightCell1Btn?.addEventListener('click', () => {
      this.tableRenderer.clearHighlight();
      this.tableRenderer.highlightCell(0, 2, 1.0);
    });

    // 첫 행 도수 셀 JSON 미리보기
    jsonCell1Btn?.addEventListener('click', () => {
      const cellLayer = this.tableRenderer.findCellLayer(0, 2);
      if (cellLayer) {
        this.showLayerJsonPreview(cellLayer);
      } else {
        MessageManager.error('셀 레이어를 찾을 수 없습니다.');
      }
    });

    // 두 번째 행 전체 하이라이트 (행 1, 전체)
    highlightRow2Btn?.addEventListener('click', () => {
      this.tableRenderer.clearHighlight();
      this.tableRenderer.highlightCell(1, null, 1.0);
    });

    // 두 번째 행 JSON 미리보기
    jsonRow2Btn?.addEventListener('click', () => {
      const rowLayer = this.tableRenderer.findRowLayer(1);
      if (rowLayer) {
        this.showLayerJsonPreview(rowLayer);
      } else {
        MessageManager.error('행 레이어를 찾을 수 없습니다.');
      }
    });

    // 3행 2열 셀 하이라이트 (행 2, 열 1)
    highlightCell3Btn?.addEventListener('click', () => {
      this.tableRenderer.clearHighlight();
      this.tableRenderer.highlightCell(2, 1, 1.0);
    });

    // 3행 2열 셀 JSON 미리보기
    jsonCell3Btn?.addEventListener('click', () => {
      const cellLayer = this.tableRenderer.findCellLayer(2, 1);
      if (cellLayer) {
        this.showLayerJsonPreview(cellLayer);
      } else {
        MessageManager.error('셀 레이어를 찾을 수 없습니다.');
      }
    });

    // 하이라이트 해제
    clearHighlightBtn?.addEventListener('click', () => {
      this.tableRenderer.clearHighlight();
    });
  }

  /**
   * 하이라이트 테스트 버튼 표시
   */
  showHighlightTestButtons() {
    const group = document.querySelector('.highlight-test-group');
    if (group) {
      group.style.display = 'block';
    }
  }

  /**
   * 레이어 JSON 미리보기 표시 (헬퍼 메서드)
   * @param {Layer} layer - 표시할 레이어
   */
  showLayerJsonPreview(layer) {
    const modal = document.getElementById('jsonPreviewModal');
    const content = document.getElementById('jsonPreviewContent');

    if (!modal || !content) return;

    // 레이어를 JSON으로 변환 (순환 참조 제거)
    const layerData = {
      id: layer.id,
      name: layer.name,
      type: layer.type,
      visible: layer.visible,
      order: layer.order,
      p_id: layer.p_id,
      data: layer.data,
      childrenCount: layer.children?.length || 0,
      children: layer.children?.map(child => ({
        id: child.id,
        name: child.name,
        type: child.type,
        visible: child.visible,
        order: child.order,
        data: child.data
      })) || []
    };

    const json = JSON.stringify(layerData, null, 2);
    content.textContent = json;

    // 모달 표시
    modal.style.display = 'flex';
  }

  /**
   * JSON 미리보기 모달 초기화
   */
  initJsonPreviewModal() {
    const modal = document.getElementById('jsonPreviewModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const copyJsonBtn = document.getElementById('copyJsonBtn');
    const overlay = modal?.querySelector('.modal-overlay');

    // 닫기 버튼들
    modalCloseBtn?.addEventListener('click', () => this.closeJsonPreview());
    closeModalBtn?.addEventListener('click', () => this.closeJsonPreview());

    // 오버레이 클릭으로 닫기
    overlay?.addEventListener('click', () => this.closeJsonPreview());

    // ESC 키로 닫기
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal?.style.display === 'flex') {
        this.closeJsonPreview();
      }
    });

    // JSON 복사 버튼
    copyJsonBtn?.addEventListener('click', () => {
      const jsonContent = document.getElementById('jsonPreviewContent');
      if (jsonContent) {
        navigator.clipboard.writeText(jsonContent.textContent)
          .then(() => {
            MessageManager.success('JSON이 클립보드에 복사되었습니다!');
          })
          .catch(err => {
            MessageManager.error('복사에 실패했습니다: ' + err.message);
          });
      }
    });

    // 전체 레이어 JSON 미리보기 버튼
    const showAllLayersJsonBtn = document.getElementById('showAllLayersJsonBtn');
    showAllLayersJsonBtn?.addEventListener('click', () => this.showAllLayersJsonPreview());
  }

  /**
   * JSON 미리보기 모달 표시
   * @param {string} layerId - 레이어 ID
   */
  showJsonPreview(layerId, tableIndex = null) {
    // 현재 선택된 소스의 LayerManager에서 레이어 찾기
    let layerManager;
    if (this.currentLayerSource === 'chart') {
      layerManager = this.chartRenderer.layerManager;
    } else if (this.currentLayerSource === 'table') {
      // 테이블 모드: tableIndex로 해당 테이블의 layerManager 사용
      if (tableIndex !== null && tableIndex !== undefined) {
        const tableIdx = parseInt(tableIndex);
        if (!isNaN(tableIdx) && this.tableRenderers[tableIdx]) {
          layerManager = this.tableRenderers[tableIdx].getLayerManager();
        }
      } else {
        // tableIndex가 없으면 첫 번째 테이블 사용 (하위 호환)
        layerManager = this.tableRenderer.getLayerManager();
      }
    }

    if (!layerManager) {
      MessageManager.error('레이어 매니저를 찾을 수 없습니다.');
      return;
    }

    const layer = layerManager.findLayer(layerId);
    if (!layer) {
      MessageManager.error('레이어를 찾을 수 없습니다.');
      return;
    }

    // 레이어를 JSON으로 직렬화
    const layerJson = this.serializeLayerForPreview(layer);
    const jsonString = JSON.stringify(layerJson, null, 2);

    // 모달에 JSON 표시
    const jsonContent = document.getElementById('jsonPreviewContent');
    const modal = document.getElementById('jsonPreviewModal');
    const modalTitle = modal?.querySelector('.modal-title');

    if (jsonContent) {
      jsonContent.textContent = jsonString;
    }

    if (modalTitle) {
      modalTitle.textContent = `📄 레이어 JSON 미리보기: ${layer.name || layer.id}`;
    }

    if (modal) {
      modal.style.display = 'flex';
    }
  }

  /**
   * 전체 레이어 JSON 미리보기 모달 표시
   */
  showAllLayersJsonPreview() {
    // 선택된 소스에 따라 LayerManager 가져오기
    let layerManager;
    let sourceName;

    if (this.currentLayerSource === 'chart') {
      layerManager = this.chartRenderer.layerManager;
      sourceName = '차트';
    } else if (this.currentLayerSource === 'table') {
      layerManager = this.tableRenderer.getLayerManager();
      sourceName = '테이블';
    }

    if (!layerManager) return;

    // 전체 레이어 구조를 JSON으로 직렬화
    const allLayersJson = layerManager.toJSON();
    const jsonString = JSON.stringify(allLayersJson, null, 2);

    // 모달에 JSON 표시
    const jsonContent = document.getElementById('jsonPreviewContent');
    const modal = document.getElementById('jsonPreviewModal');
    const modalTitle = modal?.querySelector('.modal-title');

    if (jsonContent) {
      jsonContent.textContent = jsonString;
    }

    if (modalTitle) {
      modalTitle.textContent = `📄 ${sourceName} 레이어 JSON 미리보기`;
    }

    if (modal) {
      modal.style.display = 'flex';
    }
  }

  /**
   * JSON 미리보기 모달 닫기
   */
  closeJsonPreview() {
    const modal = document.getElementById('jsonPreviewModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  /**
   * 레이어를 미리보기용 JSON으로 직렬화
   * @param {Layer} layer - 레이어 객체
   * @returns {Object} JSON 객체
   */
  serializeLayerForPreview(layer) {
    const json = {
      id: layer.id,
      name: layer.name,
      type: layer.type,
      visible: layer.visible,
      order: layer.order
    };

    // 레이어별 색상 정보 추가
    const currentPreset = CONFIG.POLYGON_COLOR_PRESETS[CONFIG.POLYGON_COLOR_PRESET] || CONFIG.POLYGON_COLOR_PRESETS.default;

    if (layer.id === 'polygon') {
      // 다각형 그룹: 그라디언트 색상
      json.color = `linear-gradient(180deg, ${currentPreset.gradientStart} 0%, ${currentPreset.gradientEnd} 100%)`;
    } else if (layer.id === 'points') {
      // 점 그룹: 단색
      json.color = currentPreset.pointColor;
    } else if (layer.id === 'lines') {
      // 선 그룹: 그라디언트 색상
      json.color = `linear-gradient(180deg, ${currentPreset.gradientStart} 0%, ${currentPreset.gradientEnd} 100%)`;
    } else if (layer.id === 'histogram') {
      // 히스토그램 그룹: 고정 그라디언트
      const barColorStart = CONFIG.getColor('--chart-bar-color');
      const barColorEnd = CONFIG.getColor('--chart-bar-color-end');
      json.color = `linear-gradient(180deg, ${barColorStart} 0%, ${barColorEnd} 100%)`;
    } else if (layer.id === 'dashed-lines') {
      // 파선 그룹: 단색
      json.color = CONFIG.getColor('--chart-dashed-line-color');
    }

    // p_id 추가 (root가 아닌 경우)
    if (layer.p_id) {
      json.p_id = layer.p_id;
    }

    // data 추가 (있으면)
    if (layer.data && Object.keys(layer.data).length > 0) {
      json.data = { ...layer.data };
      // animationProgress는 제외 (임시 데이터)
      delete json.data.animationProgress;
      delete json.data.coords; // 좌표 시스템 객체 제외 (너무 큼)
      delete json.data.ellipsisInfo; // 중략 정보 제외
      delete json.data.dataType; // 데이터 타입 제외
    }

    // children 추가 (그룹인 경우)
    if (layer.children && layer.children.length > 0) {
      json.children = layer.children.map(child => this.serializeLayerForPreview(child));
    }

    return json;
  }
}

// ========== 개발 모드: 브라우저 콘솔에서 Store 접근 가능 ==========
// 개발 모드에서만 전역 네임스페이스에 노출 (프로덕션에서는 접근 불가)
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  window.__DEV__ = {
    DataStore,
    TableStore,
    ChartStore
  };
  console.log('📊 개발 모드: window.__DEV__로 Store 접근 가능');
}

// ========== KaTeX 폰트 테스트 함수 (콘솔에서 testKatex() 호출) ==========
window.testKatex = async function() {
  const canvas = document.getElementById('chart');
  if (!canvas) {
    console.error('차트 Canvas를 찾을 수 없습니다');
    return;
  }

  const ctx = canvas.getContext('2d');

  // KaTeX 폰트 로드 대기
  const fontsReady = await KatexUtils.waitForFonts();
  console.log('폰트 로드 상태:', fontsReady ? '성공' : '실패 (폴백 폰트 사용)');

  console.log('KaTeX 폰트 테스트 시작...');

  // 테스트 텍스트들 (더 큰 폰트, 더 넓은 간격)
  const testCases = [
    { text: '145', x: 80, y: 30, desc: '숫자' },
    { text: '23.5', x: 180, y: 30, desc: '소수' },
    { text: 'x', x: 280, y: 30, desc: '변수' },
    { text: 'A', x: 350, y: 30, desc: '알파벳' },
    { text: 'x^2', x: 440, y: 30, desc: '위첨자' },
    { text: 'A_1', x: 530, y: 30, desc: '아래첨자' },
    { text: '1/2', x: 620, y: 30, desc: '분수' }
  ];

  for (const tc of testCases) {
    const result = KatexUtils.render(ctx, tc.text, tc.x, tc.y, {
      fontSize: 24,
      color: '#8DCF66',
      align: 'center',
      baseline: 'middle'
    });
    console.log(`✓ ${tc.desc}: "${tc.text}"`, result);
  }

  console.log('KaTeX 폰트 테스트 완료! 차트 상단을 확인하세요.');
};

// ========== 앱 초기화 ==========
// DOM이 로드된 후 초기화
let appInstance;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    appInstance = new FrequencyDistributionApp();
  });
} else {
  appInstance = new FrequencyDistributionApp();
}

// 페이지 언로드 시 리소스 정리
window.addEventListener('beforeunload', () => {
  if (appInstance && typeof appInstance.destroy === 'function') {
    appInstance.destroy();
  }
});

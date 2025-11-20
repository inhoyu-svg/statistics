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
import UIRenderer from './renderers/ui.js';
import ChartRenderer from './renderers/chart.js';
import TableRenderer from './renderers/table.js';
import DataStore from './core/dataStore.js';
import TableStore from './core/tableStore.js';
import ChartStore from './core/chartStore.js';

// ========== 애플리케이션 컨트롤러 ==========
class FrequencyDistributionApp {
  constructor() {
    this.chartRenderer = new ChartRenderer('chart');
    this.tableRenderer = new TableRenderer('frequencyTable');
    this.columnOrder = [0, 1, 2, 3, 4, 5]; // 컬럼 순서 관리
    this.draggedElement = null;
    this.collapsedGroups = new Set(); // 접힌 그룹 ID 목록
    this.init();
  }

  /**
   * 이벤트 리스너 초기화
   */
  init() {
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.addEventListener('click', () => this.generate());

    // Enter 키로도 생성 가능
    document.getElementById('dataInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        this.generate();
      }
    });

    // 드래그 앤 드롭 초기화
    this.initDragAndDrop();

    // 애니메이션 컨트롤 초기화
    this.initAnimationControls();
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

    // 애니메이션 모드는 항상 활성화
    this.chartRenderer.enableAnimation();

    // 재생/일시정지/정지
    playBtn?.addEventListener('click', () => this.chartRenderer.playAnimation());
    pauseBtn?.addEventListener('click', () => this.chartRenderer.pauseAnimation());
    stopBtn?.addEventListener('click', () => this.chartRenderer.stopAnimation());

    // 속도 조절
    speedSlider?.addEventListener('input', (e) => {
      const speed = parseFloat(e.target.value);
      speedValue.textContent = `${speed}x`;
      this.chartRenderer.setAnimationSpeed(speed);
    });
  }

  /**
   * 조상 중 하나라도 접혀있는지 확인
   * @param {string} layerId - 확인할 레이어 ID
   * @returns {boolean} 조상이 접혀있으면 true
   */
  isAnyAncestorCollapsed(layerId) {
    let currentParent = this.chartRenderer.layerManager.findParent(layerId);
    while (currentParent) {
      if (this.collapsedGroups.has(currentParent.id)) {
        return true;
      }
      currentParent = this.chartRenderer.layerManager.findParent(currentParent.id);
    }
    return false;
  }

  /**
   * 레이어 패널 렌더링
   * @description 차트 레이어 목록을 HTML로 생성하고 이벤트 리스너 등록
   */
  renderLayerPanel() {
    const layerList = document.getElementById('layerList');
    if (!layerList) return;

    // 레이어 목록 가져오기
    const layers = this.chartRenderer.layerManager.getAllLayers();

    // root 레이어 제외 및 접힌 그룹의 자식 필터링
    const filteredLayers = layers
      .filter(({ layer }) => {
        if (layer.id === 'root') return false;

        // 조상 중 하나라도 접혀있으면 숨김
        if (this.isAnyAncestorCollapsed(layer.id)) {
          return false;
        }

        return true;
      })
      .map(({ layer, depth }) => ({
        layer,
        depth: depth - 1 // depth 1 감소 (histogram/polygon이 depth-0이 됨)
      }));

    // HTML 생성
    layerList.innerHTML = filteredLayers.map(({ layer, depth }) => {
      const typeClass = layer.type;
      const depthClass = `depth-${depth}`;
      const isGroup = layer.type === 'group';
      const isCollapsed = this.collapsedGroups.has(layer.id);
      const toggleIcon = isGroup ? (isCollapsed ? '▶' : '▼') : '';

      return `
        <div class="layer-item ${depthClass}" draggable="true" data-layer-id="${Utils.escapeHtml(layer.id)}">
          ${isGroup ? `<span class="layer-toggle" data-layer-id="${Utils.escapeHtml(layer.id)}">${toggleIcon}</span>` : '<span class="layer-toggle-spacer"></span>'}
          <span class="layer-drag-handle">⋮⋮</span>
          <div class="layer-visibility">
            <input type="checkbox" ${layer.visible ? 'checked' : ''} data-layer-id="${Utils.escapeHtml(layer.id)}">
          </div>
          <span class="layer-name">${Utils.escapeHtml(layer.name || layer.id)}</span>
          <span class="layer-type ${typeClass}">${Utils.escapeHtml(layer.type)}</span>
        </div>
      `;
    }).join('');

    // 토글 이벤트
    layerList.querySelectorAll('.layer-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const layerId = e.target.dataset.layerId;

        if (this.collapsedGroups.has(layerId)) {
          this.collapsedGroups.delete(layerId);
        } else {
          this.collapsedGroups.add(layerId);
        }

        this.renderLayerPanel();
      });
    });

    // 드래그앤드롭 초기화
    this.initLayerDragAndDrop();

    // 체크박스 이벤트
    layerList.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const layerId = e.target.dataset.layerId;
        const visible = e.target.checked;
        this.chartRenderer.layerManager.setLayerVisibility(layerId, visible);
        this.updateChart();
      });
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

    if (classes) {
      this.chartRenderer.draw(classes, axisLabels, ellipsisInfo);
    }
  }

  /**
   * 드래그 앤 드롭 이벤트 리스너 등록
   */
  initDragAndDrop() {
    const container = document.getElementById('columnToggles');
    const items = container.querySelectorAll('.column-toggle-item');

    items.forEach(item => {
      item.addEventListener('dragstart', (e) => this.handleDragStart(e));
      item.addEventListener('dragover', (e) => this.handleDragOver(e));
      item.addEventListener('drop', (e) => this.handleDrop(e));
      item.addEventListener('dragend', (e) => this.handleDragEnd(e));
      item.addEventListener('dragenter', (e) => this.handleDragEnter(e));
      item.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    });
  }

  /**
   * 드래그 시작
   */
  handleDragStart(e) {
    this.draggedElement = e.currentTarget;
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
  }

  /**
   * 드래그 중 (드롭 가능 영역)
   */
  handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
  }

  /**
   * 드래그 진입
   */
  handleDragEnter(e) {
    if (e.currentTarget !== this.draggedElement) {
      e.currentTarget.classList.add('drag-over');
    }
  }

  /**
   * 드래그 이탈
   */
  handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  }

  /**
   * 드롭 처리
   */
  handleDrop(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }

    if (this.draggedElement !== e.currentTarget) {
      // DOM 순서 변경
      const container = document.getElementById('columnToggles');
      const allItems = Array.from(container.querySelectorAll('.column-toggle-item'));

      const draggedIndex = allItems.indexOf(this.draggedElement);
      const targetIndex = allItems.indexOf(e.currentTarget);

      // columnOrder 배열 업데이트
      const draggedOrder = this.columnOrder[draggedIndex];
      this.columnOrder.splice(draggedIndex, 1);
      this.columnOrder.splice(targetIndex, 0, draggedOrder);

      // DOM 재정렬
      if (draggedIndex < targetIndex) {
        e.currentTarget.parentNode.insertBefore(this.draggedElement, e.currentTarget.nextSibling);
      } else {
        e.currentTarget.parentNode.insertBefore(this.draggedElement, e.currentTarget);
      }
    }

    e.currentTarget.classList.remove('drag-over');
    return false;
  }

  /**
   * 드래그 종료
   */
  handleDragEnd(e) {
    const container = document.getElementById('columnToggles');
    const items = container.querySelectorAll('.column-toggle-item');

    items.forEach(item => {
      item.classList.remove('dragging');
      item.classList.remove('drag-over');
    });
  }

  /**
   * 도수분포표 생성 메인 로직
   * @description 입력 데이터를 파싱하고 검증한 후, 도수분포표와 히스토그램 생성
   * @throws {Error} 데이터 처리 중 오류 발생 시
   */
  generate() {
    try {
      MessageManager.hide();

      // 1. 입력 값 가져오기
      const input = document.getElementById('dataInput').value.trim();
      if (!input) {
        MessageManager.error('데이터를 입력해주세요!');
        return;
      }

      // 2. 데이터 파싱
      const data = DataProcessor.parseInput(input);

      // 3. 데이터 검증
      const dataValidation = Validator.validateData(data);
      if (!dataValidation.valid) {
        MessageManager.error(dataValidation.message);
        return;
      }

      // 4. 계급 설정 검증
      const classCount = parseInt(document.getElementById('classCount').value);
      const classCountValidation = Validator.validateClassCount(classCount);
      if (!classCountValidation.valid) {
        MessageManager.error(classCountValidation.message);
        return;
      }

      const classWidthInput = document.getElementById('classWidth').value;
      const customWidth = classWidthInput ? parseFloat(classWidthInput) : null;
      const classWidthValidation = Validator.validateClassWidth(customWidth);
      if (!classWidthValidation.valid) {
        MessageManager.error(classWidthValidation.message);
        return;
      }

      // 5. 고급 설정 값 가져오기
      const customLabels = this.getCustomLabels();
      const tableConfig = this.getTableConfig();

      // 표 컬럼 검증
      const columnValidation = Validator.validateTableColumns(tableConfig.visibleColumns);
      if (!columnValidation.valid) {
        MessageManager.error(columnValidation.message);
        return;
      }

      // 6. 데이터 처리
      const stats = DataProcessor.calculateBasicStats(data);
      const { classes } = DataProcessor.createClasses(stats, classCount, customWidth);
      DataProcessor.calculateFrequencies(data, classes);
      DataProcessor.calculateRelativeAndCumulative(classes, data.length);

      // 중략 표시 여부 확인
      const ellipsisInfo = DataProcessor.shouldShowEllipsis(classes);

      // 7. Store에 데이터 저장
      DataStore.setData(data, stats, classes);
      TableStore.setConfig(tableConfig.visibleColumns, tableConfig.columnOrder, tableConfig.labels);
      ChartStore.setConfig(customLabels.axis, ellipsisInfo);

      // 8. UI 렌더링 (커스텀 라벨 전달)
      UIRenderer.renderStatsCards(stats);
      this.tableRenderer.draw(classes, data.length, tableConfig);
      this.chartRenderer.draw(classes, customLabels.axis, ellipsisInfo);

      // 9. 레이어 패널 렌더링
      this.renderLayerPanel();

      // 10. 결과 섹션 표시 및 2열 레이아웃 전환
      document.getElementById('resultSection').classList.add('active');
      document.querySelector('.layout-grid').classList.add('two-column');

      // 11. 성공 메시지
      MessageManager.success('도수분포표가 생성되었습니다!');

    } catch (error) {
      console.error('Error:', error);
      MessageManager.error(`오류가 발생했습니다: ${error.message}`);
    }
  }

  /**
   * 고급 설정에서 커스텀 라벨 가져오기
   * @returns {{axis: Object, table: Object}} 축 라벨과 표 라벨 객체
   * @description X축/Y축 라벨과 표 컬럼 라벨을 통합하여 반환
   */
  getCustomLabels() {
    const xAxisLabel = document.getElementById('xAxisLabel').value.trim();
    const yAxisLabel = document.getElementById('yAxisLabel').value.trim();
    const label1 = document.getElementById('label1').value.trim();
    const label2 = document.getElementById('label2').value.trim();
    const label3 = document.getElementById('label3').value.trim();
    const label4 = document.getElementById('label4').value.trim();
    const label5 = document.getElementById('label5').value.trim();
    const label6 = document.getElementById('label6').value.trim();

    // X축 라벨과 표의 "계급" 컬럼을 통합
    const classLabel = label1 || xAxisLabel || CONFIG.DEFAULT_LABELS.table.class;
    // Y축 라벨과 표의 "상대도수(%)" 컬럼을 통합
    const relativeFreqLabel = label4 || yAxisLabel || CONFIG.DEFAULT_LABELS.table.relativeFrequency;

    return {
      axis: {
        xAxis: xAxisLabel || label1 || CONFIG.DEFAULT_LABELS.xAxis,
        yAxis: yAxisLabel || label4 || CONFIG.DEFAULT_LABELS.yAxis
      },
      table: {
        class: classLabel,
        midpoint: label2 || CONFIG.DEFAULT_LABELS.table.midpoint,
        frequency: label3 || CONFIG.DEFAULT_LABELS.table.frequency,
        relativeFrequency: relativeFreqLabel,
        cumulativeFrequency: label5 || CONFIG.DEFAULT_LABELS.table.cumulativeFrequency,
        cumulativeRelativeFrequency: label6 || CONFIG.DEFAULT_LABELS.table.cumulativeRelativeFrequency
      }
    };
  }

  /**
   * 표 설정 가져오기
   * @returns {{labels: Object, visibleColumns: boolean[], columnOrder: number[]}} 표 설정 객체
   * @description 표시할 컬럼, 라벨, 순서 정보를 반환
   */
  getTableConfig() {
    const customLabels = this.getCustomLabels();

    // 체크박스 상태 확인 (원본 순서)
    const originalVisibleColumns = [
      document.getElementById('col1').checked,
      document.getElementById('col2').checked,
      document.getElementById('col3').checked,
      document.getElementById('col4').checked,
      document.getElementById('col5').checked,
      document.getElementById('col6').checked
    ];

    return {
      labels: customLabels.table,
      visibleColumns: originalVisibleColumns,
      columnOrder: this.columnOrder
    };
  }
}

// ========== 개발 모드: 브라우저 콘솔에서 Store 접근 가능 ==========
if (typeof window !== 'undefined') {
  window.DataStore = DataStore;
  window.TableStore = TableStore;
  window.ChartStore = ChartStore;
}

// ========== 앱 초기화 ==========
// DOM이 로드된 후 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new FrequencyDistributionApp();
  });
} else {
  new FrequencyDistributionApp();
}

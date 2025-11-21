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

    // 컬럼 정렬 버튼 초기화
    this.initAlignmentButtons();

    // 차트 데이터 타입 라디오 버튼 동적 생성
    this.initChartDataTypeRadios();

    // 애니메이션 컨트롤 초기화
    this.initAnimationControls();

    // 계급 범위 편집기 초기화
    this.initClassRangeEditor();
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
    playBtn?.addEventListener('click', () => this.chartRenderer.playAnimation());
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

      // 계속 업데이트
      requestAnimationFrame(this.updateProgress);
    };

    // 진행도 업데이트 시작
    this.updateProgress();
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
      const columnAlignment = TableStore.getAllAlignments();
      const configWithAlignment = {
        ...tableConfig,
        columnAlignment: columnAlignment
      };

      this.tableRenderer.draw(classes, data.length, configWithAlignment);

      // 차트 데이터 타입 가져오기
      const dataType = ChartStore.getDataType();
      this.chartRenderer.draw(classes, customLabels.axis, ellipsisInfo, dataType);

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

      const visibilityIcon = layer.visible ? '👁️' : '👁️‍🗨️';

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

      return `
        <div class="layer-item ${depthClass}" draggable="true" data-layer-id="${Utils.escapeHtml(layer.id)}">
          ${isGroup ? `<span class="layer-toggle" data-layer-id="${Utils.escapeHtml(layer.id)}">${toggleIcon}</span>` : '<span class="layer-toggle-spacer"></span>'}
          <span class="layer-drag-handle">⋮⋮</span>
          <button class="layer-visibility-btn" data-layer-id="${Utils.escapeHtml(layer.id)}" data-visible="${layer.visible}" title="${layer.visible ? '숨기기' : '보이기'}">${visibilityIcon}</button>
          ${typeIcon}
          <span class="layer-name">${Utils.escapeHtml(layer.name || layer.id)}</span>
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

    // 가시성 토글 버튼 이벤트
    layerList.querySelectorAll('.layer-visibility-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const layerId = e.currentTarget.dataset.layerId;
        const currentVisible = e.currentTarget.dataset.visible === 'true';
        const newVisible = !currentVisible;

        // 레이어 가시성 변경
        this.chartRenderer.layerManager.setLayerVisibility(layerId, newVisible);

        // 부모 레이어인 경우 모든 자식도 함께 변경
        const layer = this.chartRenderer.layerManager.findLayer(layerId);
        if (layer && layer.type === 'group' && layer.children) {
          layer.children.forEach(child => {
            this.chartRenderer.layerManager.setLayerVisibility(child.id, newVisible);
          });
        }

        // UI 업데이트
        this.renderLayerPanel();
        this.chartRenderer.renderFrame();
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
    const dataType = ChartStore.getDataType();

    if (classes) {
      this.chartRenderer.draw(classes, axisLabels, ellipsisInfo, dataType);
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
    const columnAlignment = TableStore.getAllAlignments();

    // tableConfig에 columnAlignment 추가
    const configWithAlignment = {
      ...tableConfig,
      columnAlignment: columnAlignment
    };

    this.tableRenderer.draw(classes, total, configWithAlignment);
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
   * 컬럼 정렬 버튼 이벤트 리스너 등록
   */
  initAlignmentButtons() {
    const buttons = document.querySelectorAll('.align-btn');

    buttons.forEach(button => {
      button.addEventListener('click', (e) => this.handleAlignmentChange(e));
    });
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
   * 정렬 변경 핸들러
   * @param {Event} e - 클릭 이벤트
   */
  handleAlignmentChange(e) {
    const button = e.currentTarget;
    const columnName = button.dataset.column;
    const alignment = button.dataset.align;

    // 같은 컬럼의 다른 버튼 비활성화
    const columnButtons = document.querySelectorAll(`.align-btn[data-column="${columnName}"]`);
    columnButtons.forEach(btn => btn.classList.remove('active'));

    // 클릭된 버튼 활성화
    button.classList.add('active');

    // TableStore에 정렬 설정 저장
    TableStore.setColumnAlignment(columnName, alignment);

    // 테이블 다시 렌더링
    this.updateTable();
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

      // tableConfig에 columnAlignment 추가
      const columnAlignment = TableStore.getAllAlignments();
      const configWithAlignment = {
        ...tableConfig,
        columnAlignment: columnAlignment
      };

      this.tableRenderer.draw(classes, data.length, configWithAlignment);

      // 차트 데이터 타입 가져오기
      const dataType = ChartStore.getDataType();
      this.chartRenderer.draw(classes, customLabels.axis, ellipsisInfo, dataType);

      // 9. 레이어 패널 렌더링
      this.renderLayerPanel();

      // 10. 결과 섹션 표시 및 2열 레이아웃 전환
      document.getElementById('resultSection').classList.add('active');
      document.querySelector('.layout-grid').classList.add('two-column');

      // 11. 계급 범위 편집기 표시 및 초기값 설정
      this.showClassRangeEditor(classes);

      // 12. 성공 메시지
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
        // Y축 라벨: 사용자가 입력한 경우만 전달 (비어있으면 null로 데이터 타입별 기본값 사용)
        yAxis: yAxisLabel || label4 || null
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

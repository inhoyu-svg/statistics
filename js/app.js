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

    // ChartRenderer가 TableRenderer를 참조할 수 있도록 연결
    this.chartRenderer.setTableRenderer(this.tableRenderer);

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

    // JSON 내보내기 버튼
    const exportJsonBtn = document.getElementById('exportJsonBtn');
    exportJsonBtn?.addEventListener('click', () => this.exportJson());

    // 차트 데이터 타입 라디오 버튼 동적 생성
    this.initChartDataTypeRadios();

    // 애니메이션 컨트롤 초기화
    this.initAnimationControls();

    // 계급 범위 편집기 초기화
    this.initClassRangeEditor();

    // 상첨자 토글 초기화
    this.initSuperscriptToggle();

    // 막대 라벨 토글 초기화
    this.initBarLabelsToggle();

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
    const checkbox = document.getElementById('showSuperscript');
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
    const defaultVisibleColumns = [true, true, true, true, false, false]; // 누적도수, 누적상대도수 숨김
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
  isAnyAncestorCollapsed(layerId, layerManager) {
    const currentCollapsedGroups = this.collapsedGroups[this.currentLayerSource];
    let currentParent = layerManager.findParent(layerId);
    while (currentParent) {
      if (currentCollapsedGroups.has(currentParent.id)) {
        return true;
      }
      currentParent = layerManager.findParent(currentParent.id);
    }
    return false;
  }

  /**
   * 레이어 패널 렌더링
   * @description 선택된 소스(차트/테이블)의 레이어 목록을 HTML로 생성하고 이벤트 리스너 등록
   */
  renderLayerPanel() {
    const layerList = document.getElementById('layerList');
    if (!layerList) return;

    // 선택된 소스에 따라 LayerManager 가져오기
    let layerManager;
    if (this.currentLayerSource === 'chart') {
      layerManager = this.chartRenderer.layerManager;
    } else if (this.currentLayerSource === 'table') {
      layerManager = this.tableRenderer.getLayerManager();
    }

    if (!layerManager) {
      layerList.innerHTML = '<p class="no-layers">레이어가 없습니다</p>';
      return;
    }

    // 레이어 목록 가져오기
    const layers = layerManager.getAllLayers();

    // root 레이어 제외 및 접힌 그룹의 자식 필터링
    const filteredLayers = layers
      .filter(({ layer }) => {
        if (layer.id === 'root') return false;

        // 조상 중 하나라도 접혀있으면 숨김
        if (this.isAnyAncestorCollapsed(layer.id, layerManager)) {
          return false;
        }

        return true;
      })
      .map(({ layer, depth }) => ({
        layer,
        depth: depth - 1 // depth 1 감소 (histogram/polygon이 depth-0이 됨)
      }));

    // HTML 생성
    const currentCollapsedGroups = this.collapsedGroups[this.currentLayerSource];
    layerList.innerHTML = filteredLayers.map(({ layer, depth }) => {
      const typeClass = layer.type;
      const depthClass = `depth-${depth}`;
      const isGroup = layer.type === 'group';
      const isCollapsed = currentCollapsedGroups.has(layer.id);
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
          <button class="layer-json-btn" data-layer-id="${Utils.escapeHtml(layer.id)}" title="JSON 미리보기">📄</button>
        </div>
      `;
    }).join('');

    // 토글 이벤트
    layerList.querySelectorAll('.layer-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const layerId = e.target.dataset.layerId;
        const currentCollapsedGroups = this.collapsedGroups[this.currentLayerSource];

        if (currentCollapsedGroups.has(layerId)) {
          currentCollapsedGroups.delete(layerId);
        } else {
          currentCollapsedGroups.add(layerId);
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
        layerManager.setLayerVisibility(layerId, newVisible);

        // 부모 레이어인 경우 모든 자식도 함께 변경
        const layer = layerManager.findLayer(layerId);
        if (layer && layer.type === 'group' && layer.children) {
          layer.children.forEach(child => {
            layerManager.setLayerVisibility(child.id, newVisible);
          });
        }

        // UI 업데이트
        this.renderLayerPanel();

        // 선택된 소스의 렌더러 업데이트
        if (this.currentLayerSource === 'chart') {
          this.chartRenderer.renderFrame();
        } else if (this.currentLayerSource === 'table') {
          this.tableRenderer.renderFrame();
        }
      });
    });

    // JSON 미리보기 버튼 이벤트
    layerList.querySelectorAll('.layer-json-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const layerId = e.currentTarget.dataset.layerId;
        this.showJsonPreview(layerId);
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
   * @description 현재 레이어 구조와 타임라인을 JSON 파일로 다운로드
   */
  exportJson() {
    try {
      // 레이어와 타임라인 데이터 추출
      const jsonData = DataProcessor.exportChartData(
        this.chartRenderer.layerManager,
        this.chartRenderer.timeline,
        this.chartRenderer
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
      const now = new Date();
      const timestamp = now.getFullYear() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0') + '-' +
        String(now.getHours()).padStart(2, '0') +
        String(now.getMinutes()).padStart(2, '0') +
        String(now.getSeconds()).padStart(2, '0');
      const filename = `chart-data-${timestamp}.json`;

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
      const configWithAlignment = this.getTableConfigWithAlignment();

      this.tableRenderer.draw(classes, data.length, configWithAlignment);

      // 차트 데이터 타입 가져오기
      const dataType = ChartStore.getDataType();
      this.chartRenderer.draw(classes, customLabels.axis, ellipsisInfo, dataType, configWithAlignment, customLabels.calloutTemplate);

      // 9. 레이어 패널 렌더링
      this.renderLayerPanel();

      // 10. 결과 섹션 표시 및 2열 레이아웃 전환
      document.getElementById('resultSection').classList.add('active');
      document.querySelector('.layout-grid').classList.add('two-column');

      // 11. 계급 범위 편집기 표시 및 초기값 설정
      this.showClassRangeEditor(classes);

      // 12. JSON 내보내기 버튼 표시
      const exportJsonBtn = document.getElementById('exportJsonBtn');
      if (exportJsonBtn) {
        exportJsonBtn.style.display = 'block';
      }

      // 13. 하이라이트 테스트 버튼 표시
      this.showHighlightTestButtons();

      // 14. 성공 메시지
      MessageManager.success('도수분포표가 생성되었습니다!');

    } catch (error) {
      console.error('Error:', error);
      MessageManager.error(`오류가 발생했습니다: ${error.message}`);
    }
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

    const panel = this._getTableConfigPanel();
    if (!panel) return { axis: {}, table: {} };

    const labelInputs = [...panel.querySelectorAll('.label-input')];
    const labels = labelInputs.map(input => input.value.trim());

    // CONFIG의 기본 라벨 순서
    const defaults = [
      CONFIG.DEFAULT_LABELS.table.class,
      CONFIG.DEFAULT_LABELS.table.midpoint,
      CONFIG.DEFAULT_LABELS.table.frequency,
      CONFIG.DEFAULT_LABELS.table.relativeFrequency,
      CONFIG.DEFAULT_LABELS.table.cumulativeFrequency,
      CONFIG.DEFAULT_LABELS.table.cumulativeRelativeFrequency
    ];

    const [label1, label2, label3, label4, label5, label6] = labels.map((label, i) =>
      label || defaults[i]
    );

    // X축 라벨과 표의 "계급" 컬럼을 통합
    const classLabel = label1 || xAxisLabel || CONFIG.DEFAULT_LABELS.table.class;
    // Y축 라벨과 표의 "상대도수(%)" 컬럼을 통합
    const relativeFreqLabel = label4 || yAxisLabel || CONFIG.DEFAULT_LABELS.table.relativeFrequency;

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
        visibleColumns: [true, true, true, true, false, false],
        columnOrder: [0, 1, 2, 3, 4, 5],
        showSuperscript: CONFIG.TABLE_SHOW_SUPERSCRIPT
      };
    }

    // 체크박스 상태 확인 (원본 순서)
    const checkboxes = [...panel.querySelectorAll('.column-checkbox')];
    const originalVisibleColumns = checkboxes.map(cb => cb.checked);

    // 상첨자 표시 옵션
    const showSuperscript = document.getElementById('showSuperscript')?.checked ?? CONFIG.TABLE_SHOW_SUPERSCRIPT;

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
      const rowLayer = this.tableRenderer.getLayerManager().findLayer('table-row-1');
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
  showJsonPreview(layerId) {
    // 현재 선택된 소스의 LayerManager에서 레이어 찾기
    let layerManager;
    if (this.currentLayerSource === 'chart') {
      layerManager = this.chartRenderer.layerManager;
    } else if (this.currentLayerSource === 'table') {
      layerManager = this.tableRenderer.getLayerManager();
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

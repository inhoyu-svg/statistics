/**
 * 테이블 렌더링 레이어
 * Canvas 기반 테이블 그리기 (레이어 시스템)
 * 도수분포표, 카테고리 행렬, 이원 분류표, 줄기-잎 그림 지원
 */

import CONFIG from '../config.js';
import { LayerManager, LayerTimeline } from '../animation/index.js';
import TableLayerFactory from './table/TableLayerFactory.js';
import TableCellRenderer from './table/TableCellRenderer.js';
import { TableFactoryRouter } from './table/factories/index.js';
import tableStore from '../core/tableStore.js';

/**
 * @class TableRenderer
 * @description Canvas 기반 도수분포표 렌더러 (레이어 시스템)
 */
class TableRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`Canvas 요소를 찾을 수 없습니다: ${canvasId}`);
    }

    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) {
      throw new Error(`Canvas 2D 컨텍스트를 생성할 수 없습니다: ${canvasId}`);
    }

    // canvasId에서 tableId 추출
    // 예: 'frequencyTable' → 'table-1', 'frequencyTable-2' → 'table-2'
    this.canvasId = canvasId;
    this.tableId = this.extractTableId(canvasId);

    this.padding = CONFIG.TABLE_PADDING;

    // Layer 시스템
    this.layerManager = new LayerManager();
    this.timeline = new LayerTimeline();
    this.animationMode = true; // 애니메이션 사용 여부
    this.animationSpeed = 1.0;

    // 셀 렌더러
    this.cellRenderer = new TableCellRenderer(this.ctx);

    // 현재 설정 저장 (renderFrame에서 사용)
    this.currentClasses = null;
    this.currentTotal = null;
    this.currentConfig = null;

    // 타임라인 콜백
    this.timeline.onUpdate = () => this.renderFrame();

    // 셀 클릭 이벤트 (변수 치환용)
    this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
  }

  /**
   * canvasId에서 tableId 추출
   * @param {string} canvasId - Canvas ID (예: 'frequencyTable', 'frequencyTable-2')
   * @returns {string} 테이블 ID (예: 'table-1', 'table-2')
   */
  extractTableId(canvasId) {
    // 'frequencyTable' → 'table-1'
    // 'frequencyTable-2' → 'table-2'
    if (canvasId === 'frequencyTable') {
      return 'table-1';
    }
    const match = canvasId.match(/frequencyTable-(\d+)/);
    if (match) {
      return `table-${match[1]}`;
    }
    // 기본값
    return 'table-1';
  }

  /**
   * 도수분포표 그리기
   * @param {Array} classes - 계급 데이터 배열
   * @param {number} total - 전체 데이터 개수
   * @param {Object} config - 테이블 설정 객체
   * @param {Object} highlightInfo - 하이라이트 정보 (레거시 지원)
   */
  draw(classes, total, config = null, highlightInfo = null) {
    // 도수가 0이 아닌 계급만 필터링
    const visibleClasses = classes.filter(c => c.frequency > 0);

    if (visibleClasses.length === 0) {
      this.drawNoDataMessage();
      return;
    }

    // 설정 저장
    this.currentClasses = visibleClasses;
    this.currentTotal = total;
    this.currentConfig = config;

    // Canvas 크기 계산
    const rowCount = visibleClasses.length + 1; // +1 for summary row
    const canvasHeight = CONFIG.TABLE_HEADER_HEIGHT + (rowCount * CONFIG.TABLE_ROW_HEIGHT) + this.padding * 2;

    this.canvas.width = CONFIG.TABLE_CANVAS_WIDTH;
    this.canvas.height = canvasHeight;
    this.clear();

    // 레이어 생성
    this.layerManager.clearAll();
    TableLayerFactory.createTableLayers(
      this.layerManager,
      visibleClasses,
      total,
      config,
      this.tableId
    );

    // 레거시 하이라이트 정보 적용 (있는 경우)
    if (highlightInfo) {
      this.highlightCell(highlightInfo.classIndex, null, highlightInfo.progress);
    }

    // 애니메이션 모드 분기
    if (this.animationMode) {
      // 애니메이션 설정 및 재생
      this.setupAnimations();
      this.playAnimation();
    } else {
      // 정적 렌더링
      this.renderFrame();
    }
  }

  /**
   * 캔버스 초기화
   */
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * 레이어 렌더링 (재귀적)
   * @param {Layer} layer - 렌더링할 레이어
   */
  renderLayer(layer) {
    if (!layer.visible) return;

    switch (layer.type) {
      case 'grid':
        this.cellRenderer.renderGrid(layer);
        break;
      case 'cross-table-grid':
        this.cellRenderer.renderCrossTableGrid(layer);
        break;
      case 'stem-leaf-grid':
        this.cellRenderer.renderStemLeafGrid(layer);
        break;
      case 'stem-leaf-single-grid':
        this.cellRenderer.renderStemLeafSingleGrid(layer);
        break;
      case 'cell':
        this._renderCellByRowType(layer);
        break;
      case 'group':
        layer.children.forEach(child => this.renderLayer(child));
        break;
    }
  }

  /**
   * rowType에 따른 셀 렌더링
   * @param {Layer} layer - 셀 레이어
   */
  _renderCellByRowType(layer) {
    const { rowType } = layer.data;

    switch (rowType) {
      case 'header':
        this.cellRenderer.renderHeaderCell(layer);
        break;
      case 'merged-header':
        this.cellRenderer.renderMergedHeaderCell(layer);
        break;
      case 'summary':
        this.cellRenderer.renderSummaryCell(layer);
        break;
      case 'row-header':
        this.cellRenderer.renderRowHeaderCell(layer);
        break;
      case 'stem-leaf-stem':
        this.cellRenderer.renderStemCell(layer);
        break;
      case 'stem-leaf-data':
        this.cellRenderer.renderStemLeafDataCell(layer);
        break;
      case 'data':
      default:
        this.cellRenderer.renderDataCell(layer);
        break;
    }
  }

  /**
   * 커스텀 테이블 타입 그리기 (카테고리 행렬, 이원 분류표, 줄기-잎 그림)
   * @param {string} type - 테이블 타입 (CONFIG.TABLE_TYPES 값)
   * @param {Object} data - 파싱된 데이터 객체
   * @param {Object} config - 테이블 설정 객체
   */
  drawCustomTable(type, data, config = null) {
    if (!data) {
      this.drawNoDataMessage();
      return;
    }

    // 설정 저장
    this.currentConfig = config;

    // 행 수 계산 (타입별)
    const rowCount = this._calculateRowCount(type, data);

    // Canvas 크기 계산 (이원분류표는 병합 헤더 추가)
    const mergedHeaderHeight = type === CONFIG.TABLE_TYPES.CROSS_TABLE ? 35 : 0;
    const canvasHeight = mergedHeaderHeight + CONFIG.TABLE_HEADER_HEIGHT + (rowCount * CONFIG.TABLE_ROW_HEIGHT) + this.padding * 2;

    this.canvas.width = CONFIG.TABLE_CANVAS_WIDTH;
    this.canvas.height = canvasHeight;
    this.clear();

    // 레이어 생성 (TableFactoryRouter 사용)
    this.layerManager.clearAll();
    TableFactoryRouter.createTableLayers(type, this.layerManager, data, config, this.tableId);

    // 애니메이션 모드 분기
    if (this.animationMode) {
      this.setupAnimations();
      this.playAnimation();
    } else {
      this.renderFrame();
    }
  }

  /**
   * 타입별 행 수 계산
   * @param {string} type - 테이블 타입
   * @param {Object} data - 파싱된 데이터
   * @returns {number} 행 수 (헤더 제외)
   */
  _calculateRowCount(type, data) {
    switch (type) {
      case CONFIG.TABLE_TYPES.CATEGORY_MATRIX:
        return data.rows ? data.rows.length : 0;

      case CONFIG.TABLE_TYPES.CROSS_TABLE:
        // 데이터 행 + 합계 행 (옵션)
        const crossRows = data.rows ? data.rows.length : 0;
        return crossRows + (data.showTotal !== false ? 1 : 0);

      case CONFIG.TABLE_TYPES.STEM_LEAF:
        return data.stems ? data.stems.length : 0;

      default:
        return 0;
    }
  }

  /**
   * 전체 프레임 렌더링
   */
  renderFrame() {
    this.clear();
    const rootLayer = this.layerManager.root;
    if (rootLayer && rootLayer.children.length > 0) {
      // root의 자식들(도수분포표)을 렌더링
      rootLayer.children.forEach(child => this.renderLayer(child));
    }
  }

  /**
   * 애니메이션 설정
   */
  setupAnimations() {
    this.timeline.clearAnimations();

    const rootLayer = this.layerManager.root;
    if (!rootLayer || rootLayer.children.length === 0) return;

    // 도수분포표 레이어 찾기
    const tableLayer = rootLayer.children[0];
    if (!tableLayer) return;

    // 데이터 행만 애니메이션 (헤더, 합계는 제외)
    const dataRows = tableLayer.children.filter(child =>
      child.id.startsWith(`${this.tableId}-table-row-`) && child.id !== `${this.tableId}-table-summary`
    );

    // 순차적으로 행 페이드인 애니메이션
    dataRows.forEach((rowLayer, index) => {
      const startTime = index * CONFIG.TABLE_ANIMATION_ROW_INTERVAL;
      const duration = CONFIG.TABLE_ANIMATION_ROW_DURATION;

      this.timeline.addAnimation(rowLayer.id, {
        startTime,
        duration,
        effect: 'fade',
        effectOptions: {
          from: 0,
          to: 1
        }
      });
    });
  }

  /**
   * 애니메이션 재생
   */
  playAnimation() {
    this.timeline.play(this.animationSpeed);
  }

  /**
   * 애니메이션 일시정지
   */
  pauseAnimation() {
    this.timeline.pause();
  }

  /**
   * 애니메이션 정지
   */
  stopAnimation() {
    this.timeline.stop();
  }

  /**
   * 애니메이션 속도 설정
   * @param {number} speed - 속도 (0.5 ~ 3.0)
   */
  setAnimationSpeed(speed) {
    this.animationSpeed = speed;
    this.timeline.setSpeed(speed);
  }

  /**
   * 현재 테이블의 레이어 ID 접두사 반환
   * @returns {string} 레이어 ID 접두사 (예: 'frequency-table-1', 'stem-leaf-table-1')
   */
  _getLayerIdPrefix() {
    const rootLayer = this.layerManager.root;
    if (!rootLayer || rootLayer.children.length === 0) return this.tableId;

    const tableLayer = rootLayer.children[0];
    const tableType = tableLayer?.data?.tableType;

    // tableType이 있으면 접두사로 사용
    if (tableType) {
      return `${tableType}-${this.tableId}`;
    }
    return this.tableId;
  }

  /**
   * 개별 셀 하이라이트
   * @param {number} rowIndex - 행 인덱스
   * @param {number|null} colIndex - 열 인덱스 (null이면 행 전체)
   * @param {number} progress - 하이라이트 진행도 (0~1)
   */
  highlightCell(rowIndex, colIndex = null, progress = 1.0) {
    const prefix = this._getLayerIdPrefix();
    const rowLayer = this.layerManager.findLayer(`${prefix}-table-row-${rowIndex}`);
    if (!rowLayer) return;

    if (colIndex === null) {
      // 행 전체 하이라이트
      rowLayer.children.forEach(cellLayer => {
        cellLayer.data.highlighted = true;
        cellLayer.data.highlightProgress = progress;
      });
    } else {
      // 특정 셀만 하이라이트
      const cellLayer = rowLayer.children[colIndex];
      if (cellLayer) {
        cellLayer.data.highlighted = true;
        cellLayer.data.highlightProgress = progress;
      }
    }

    this.renderFrame();
  }

  /**
   * 하이라이트 해제
   */
  clearHighlight() {
    const rootLayer = this.layerManager.root;
    if (!rootLayer || rootLayer.children.length === 0) return;

    // 테이블 레이어 찾기
    const tableLayer = rootLayer.children[0];
    if (!tableLayer) return;

    const prefix = this._getLayerIdPrefix();

    // 모든 데이터 셀의 하이라이트 제거
    tableLayer.children.forEach(child => {
      if (child.type === 'group' && child.id.startsWith(`${prefix}-table-row-`)) {
        child.children.forEach(cellLayer => {
          if (cellLayer.type === 'cell' && cellLayer.data.rowType === 'data') {
            cellLayer.data.highlighted = false;
            cellLayer.data.highlightProgress = 0;
          }
        });
      }
    });

    this.renderFrame();
  }

  /**
   * LayerManager 접근자 (레이어 패널에서 사용)
   * @returns {LayerManager} 레이어 매니저
   */
  getLayerManager() {
    return this.layerManager;
  }

  /**
   * 특정 셀 레이어 찾기
   * @param {number} rowIndex - 행 인덱스
   * @param {number} colIndex - 열 인덱스
   * @returns {Layer|null} 셀 레이어
   */
  findCellLayer(rowIndex, colIndex) {
    const prefix = this._getLayerIdPrefix();
    return this.layerManager.findLayer(`${prefix}-table-row-${rowIndex}-col${colIndex}`);
  }

  /**
   * 행 레이어 찾기
   * @param {number} rowIndex - 행 인덱스
   * @returns {Layer|null} 행 레이어
   */
  findRowLayer(rowIndex) {
    const prefix = this._getLayerIdPrefix();
    return this.layerManager.findLayer(`${prefix}-table-row-${rowIndex}`);
  }

  /**
   * 데이터 없음 메시지
   */
  drawNoDataMessage() {
    this.canvas.width = CONFIG.TABLE_CANVAS_WIDTH;
    this.canvas.height = CONFIG.TABLE_EMPTY_CANVAS_HEIGHT;
    this.clear();

    this.ctx.fillStyle = CONFIG.getColor('--color-text-light');
    this.ctx.font = CONFIG.CHART_FONT_LARGE;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      CONFIG.TABLE_NO_DATA_MESSAGE,
      this.canvas.width / 2,
      this.canvas.height / 2
    );
  }

  // =============================================
  // 셀 변수 편집 모달 관련 메서드
  // =============================================

  /**
   * Canvas 클릭 이벤트 핸들러 - 모달 열기
   * @param {MouseEvent} event - 마우스 이벤트
   */
  handleCanvasClick(event) {
    // 테이블 데이터가 있는 경우에만 모달 열기
    const rootLayer = this.layerManager.root;
    if (!rootLayer || rootLayer.children.length === 0) return;

    this.openEditModal();
  }

  /**
   * 편집 모달 열기
   */
  openEditModal() {
    const modal = document.getElementById('variableEditModal');
    if (!modal) return;

    // HTML 테이블 생성
    this.generateEditableTable();

    // 모달 표시
    modal.style.display = 'flex';

    // 이벤트 리스너 등록
    this._setupModalListeners();
  }

  /**
   * 편집 모달 닫기
   */
  closeEditModal() {
    const modal = document.getElementById('variableEditModal');
    if (modal) {
      modal.style.display = 'none';
    }

    // 이벤트 리스너 제거
    this._removeModalListeners();
  }

  /**
   * 모달 이벤트 리스너 설정
   */
  _setupModalListeners() {
    const modal = document.getElementById('variableEditModal');
    const closeBtn = document.getElementById('variableModalCloseBtn');
    const cancelBtn = document.getElementById('variableCancelBtn');
    const saveBtn = document.getElementById('variableSaveBtn');
    const overlay = modal?.querySelector('.modal-overlay');

    // 저장된 핸들러 참조 (제거용)
    this._modalHandlers = {
      close: () => this.closeEditModal(),
      save: () => this.saveChanges(),
      overlayClick: (e) => {
        if (e.target === overlay) this.closeEditModal();
      }
    };

    closeBtn?.addEventListener('click', this._modalHandlers.close);
    cancelBtn?.addEventListener('click', this._modalHandlers.close);
    saveBtn?.addEventListener('click', this._modalHandlers.save);
    overlay?.addEventListener('click', this._modalHandlers.overlayClick);
  }

  /**
   * 모달 이벤트 리스너 제거
   */
  _removeModalListeners() {
    if (!this._modalHandlers) return;

    const modal = document.getElementById('variableEditModal');
    const closeBtn = document.getElementById('variableModalCloseBtn');
    const cancelBtn = document.getElementById('variableCancelBtn');
    const saveBtn = document.getElementById('variableSaveBtn');
    const overlay = modal?.querySelector('.modal-overlay');

    closeBtn?.removeEventListener('click', this._modalHandlers.close);
    cancelBtn?.removeEventListener('click', this._modalHandlers.close);
    saveBtn?.removeEventListener('click', this._modalHandlers.save);
    overlay?.removeEventListener('click', this._modalHandlers.overlayClick);

    this._modalHandlers = null;
  }

  /**
   * 편집용 HTML 테이블 생성
   */
  generateEditableTable() {
    const container = document.getElementById('variableEditTableContainer');
    if (!container) return;

    const rootLayer = this.layerManager.root;
    if (!rootLayer || rootLayer.children.length === 0) {
      container.innerHTML = '<p>테이블 데이터가 없습니다.</p>';
      return;
    }

    const tableLayer = rootLayer.children[0];
    if (!tableLayer) return;

    // 헤더와 데이터 행 분리
    const headerRow = tableLayer.children.find(c => c.id.includes('-table-header'));
    const dataRows = tableLayer.children.filter(c =>
      c.type === 'group' && (c.id.includes('-table-row-') || c.id.includes('-table-summary'))
    );

    // HTML 테이블 생성
    let html = '<table class="variable-edit-table">';

    // 헤더 행
    if (headerRow) {
      html += '<thead><tr>';
      headerRow.children.forEach(cell => {
        html += `<th>${cell.data.cellText}</th>`;
      });
      html += '</tr></thead>';
    }

    // 데이터 행
    html += '<tbody>';
    dataRows.forEach(row => {
      const isSummary = row.id.includes('-table-summary');
      html += `<tr class="${isSummary ? 'summary-row' : ''}" data-row-id="${row.id}">`;

      row.children.forEach((cell, colIndex) => {
        const { rowIndex, cellText, originalValue } = cell.data;
        const displayValue = cellText;
        const originalVal = originalValue !== undefined ? originalValue : cellText;

        html += `<td data-row="${rowIndex}" data-col="${colIndex}" data-original="${originalVal}">${displayValue}</td>`;
      });

      html += '</tr>';
    });
    html += '</tbody></table>';

    container.innerHTML = html;

    // 셀 클릭 이벤트 등록
    const table = container.querySelector('.variable-edit-table');
    table?.querySelectorAll('td').forEach(td => {
      td.addEventListener('click', (e) => this._handleTableCellClick(e));
    });
  }

  /**
   * 테이블 셀 클릭 - 인라인 편집
   * @param {Event} event - 클릭 이벤트
   */
  _handleTableCellClick(event) {
    const td = event.target.closest('td');
    if (!td || td.classList.contains('editing')) return;

    // 이미 편집 중인 셀이 있으면 완료 처리
    const editingTd = td.closest('table').querySelector('td.editing');
    if (editingTd) {
      this._finishCellEdit(editingTd);
    }

    // 현재 셀을 편집 모드로 전환
    const currentValue = td.textContent;
    td.classList.add('editing');
    td.innerHTML = `<input type="text" value="${currentValue}" />`;

    const input = td.querySelector('input');
    input.focus();
    input.select();

    // Enter/Escape 키 처리
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this._finishCellEdit(td);
      } else if (e.key === 'Escape') {
        // 원본 값으로 복원
        td.classList.remove('editing');
        td.textContent = td.dataset.original;
      }
    });

    // 포커스 아웃 시 완료
    input.addEventListener('blur', () => {
      this._finishCellEdit(td);
    });
  }

  /**
   * 셀 편집 완료
   * @param {HTMLElement} td - 편집 중인 셀
   */
  _finishCellEdit(td) {
    if (!td.classList.contains('editing')) return;

    const input = td.querySelector('input');
    const newValue = input?.value.trim() || td.dataset.original;

    td.classList.remove('editing');
    td.textContent = newValue;
  }

  /**
   * 변경사항 저장
   */
  saveChanges() {
    const container = document.getElementById('variableEditTableContainer');
    const table = container?.querySelector('.variable-edit-table');
    if (!table) return;

    const rootLayer = this.layerManager.root;
    if (!rootLayer || rootLayer.children.length === 0) return;

    const tableLayer = rootLayer.children[0];
    if (!tableLayer) return;

    // 모든 데이터 셀 확인
    table.querySelectorAll('td').forEach(td => {
      const rowIndex = parseInt(td.dataset.row);
      const colIndex = parseInt(td.dataset.col);
      const originalValue = td.dataset.original;
      const currentValue = td.textContent.trim();

      // 레이어에서 해당 셀 찾기
      let cellLayer = null;
      for (const row of tableLayer.children) {
        if (row.type !== 'group') continue;

        for (const cell of row.children) {
          if (cell.data.rowIndex === rowIndex && cell.data.colIndex === colIndex) {
            cellLayer = cell;
            break;
          }
        }
        if (cellLayer) break;
      }

      if (!cellLayer) return;

      // 값이 변경되었는지 확인
      if (currentValue !== originalValue) {
        // 변수로 설정
        if (!cellLayer.data.originalValue) {
          cellLayer.data.originalValue = originalValue;
        }
        cellLayer.data.cellText = currentValue;
        cellLayer.data.isVariable = true;
        tableStore.setCellVariable(this.tableId, rowIndex, colIndex, currentValue);
      } else {
        // 원본 값으로 복원된 경우
        if (cellLayer.data.originalValue !== undefined) {
          cellLayer.data.cellText = cellLayer.data.originalValue;
          delete cellLayer.data.originalValue;
          delete cellLayer.data.isVariable;
        }
        tableStore.removeCellVariable(this.tableId, rowIndex, colIndex);
      }
    });

    // Canvas 다시 렌더링
    this.renderFrame();

    // 모달 닫기
    this.closeEditModal();
  }

  /**
   * 모든 변수 초기화
   */
  clearAllVariables() {
    tableStore.clearAllVariables(this.tableId);

    // 레이어의 변수 정보도 초기화
    const rootLayer = this.layerManager.root;
    if (!rootLayer || rootLayer.children.length === 0) return;

    const tableLayer = rootLayer.children[0];
    if (!tableLayer) return;

    for (const child of tableLayer.children) {
      if (child.type !== 'group') continue;

      for (const cellLayer of child.children) {
        if (cellLayer.data.originalValue !== undefined) {
          cellLayer.data.cellText = cellLayer.data.originalValue;
          delete cellLayer.data.originalValue;
          delete cellLayer.data.isVariable;
        }
      }
    }

    this.renderFrame();
  }
}

export default TableRenderer;

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
  // 셀 변수 치환 관련 메서드
  // =============================================

  /**
   * Canvas 클릭 이벤트 핸들러
   * @param {MouseEvent} event - 마우스 이벤트
   */
  handleCanvasClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 클릭된 셀 찾기
    const cellInfo = this.findCellAtPosition(x, y);
    if (cellInfo) {
      this.showVariableInput(cellInfo);
    }
  }

  /**
   * 좌표로 셀 찾기
   * @param {number} x - Canvas X 좌표
   * @param {number} y - Canvas Y 좌표
   * @returns {Object|null} 셀 정보 { rowIndex, colIndex, layer }
   */
  findCellAtPosition(x, y) {
    const rootLayer = this.layerManager.root;
    if (!rootLayer || rootLayer.children.length === 0) return null;

    const tableLayer = rootLayer.children[0];
    if (!tableLayer) return null;

    // 모든 행 레이어 순회
    for (const child of tableLayer.children) {
      if (child.type !== 'group') continue;

      // 데이터 행 또는 합계 행인지 확인
      const isDataRow = child.id.includes('-table-row-');
      const isSummaryRow = child.id.includes('-table-summary');
      if (!isDataRow && !isSummaryRow) continue;

      // 행 내의 셀 순회
      for (const cellLayer of child.children) {
        if (cellLayer.type !== 'cell') continue;

        const { x: cellX, y: cellY, width, height, rowType } = cellLayer.data;

        // 헤더는 제외 (데이터, 합계만 클릭 가능)
        if (rowType === 'header' || rowType === 'merged-header') continue;

        // 좌표가 셀 범위 내인지 확인
        if (x >= cellX && x <= cellX + width && y >= cellY && y <= cellY + height) {
          return {
            rowIndex: cellLayer.data.rowIndex,
            colIndex: cellLayer.data.colIndex,
            rowType: cellLayer.data.rowType,
            layer: cellLayer
          };
        }
      }
    }

    return null;
  }

  /**
   * 변수 입력 팝업 표시
   * @param {Object} cellInfo - 셀 정보
   */
  showVariableInput(cellInfo) {
    const { rowIndex, colIndex, layer } = cellInfo;

    // 현재 변수 확인
    const existingVar = tableStore.getCellVariable(this.tableId, rowIndex, colIndex);

    if (existingVar) {
      // 이미 변수가 있으면 해제 확인
      if (confirm(`변수 "${existingVar}"를 해제하시겠습니까?`)) {
        // 원본 값으로 복원
        if (layer.data.originalValue !== undefined) {
          layer.data.cellText = layer.data.originalValue;
          delete layer.data.originalValue;
          delete layer.data.isVariable;
        }
        tableStore.removeCellVariable(this.tableId, rowIndex, colIndex);
        this.renderFrame();
      }
    } else {
      // 새 변수 입력
      const varName = prompt('변수명을 입력하세요 (예: A, x, y):');
      if (varName && varName.trim()) {
        // 원본 값 저장 후 변수로 대체
        layer.data.originalValue = layer.data.cellText;
        layer.data.cellText = varName.trim();
        layer.data.isVariable = true;
        tableStore.setCellVariable(this.tableId, rowIndex, colIndex, varName.trim());
        this.renderFrame();
      }
    }
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

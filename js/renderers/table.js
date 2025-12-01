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
import BaseTableFactory from './table/factories/BaseTableFactory.js';
import tableStore from '../core/tableStore.js';
import TableEditModal from './table/TableEditModal.js';

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

    // 셀 애니메이션 상태
    this.cellAnimationActive = false;
    this.cellAnimationStart = 0;
    this.cellAnimationDuration = 1000;
    this.cellAnimationRepeat = 3;
    this.cellAnimationTargets = []; // [{row, col}, ...]
    this.cellAnimationFrameId = null;
    this.cellAnimationBlinkEnabled = true;

    // 복수 애니메이션 저장
    this.savedAnimations = []; // [{rowIndex, colIndex, duration, repeat}, ...]
    this.activeAnimations = []; // 현재 재생 중인 애니메이션들

    // 편집 모달 관리자
    this.editModal = new TableEditModal(this);

    // 셀 클릭 이벤트 (변수 치환용) - TableEditModal로 위임
    this.canvas.addEventListener('click', (e) => this.editModal.handleCanvasClick(e));
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

    // 합계 행 표시 여부 (config 우선, 없으면 tableStore에서 가져오기)
    const showSummaryRow = config?.showSummaryRow ?? tableStore.getSummaryRowVisible(this.tableId);

    // Canvas 크기 계산
    const rowCount = visibleClasses.length + (showSummaryRow ? 1 : 0); // 합계 행 조건부
    const canvasHeight = CONFIG.TABLE_HEADER_HEIGHT + (rowCount * CONFIG.TABLE_ROW_HEIGHT) + this.padding * 2;

    // 동적 너비 계산
    const dynamicConfig = this._calculateFrequencyTableDynamicWidth(visibleClasses, total, config, showSummaryRow);

    this.canvas.width = dynamicConfig.canvasWidth;
    this.canvas.height = canvasHeight;
    this.clear();

    // 레이어 생성
    this.layerManager.clearAll();
    const layerConfig = {
      ...config,
      showSummaryRow,
      columnWidths: dynamicConfig.columnWidths,
      canvasWidth: dynamicConfig.canvasWidth
    };
    TableLayerFactory.createTableLayers(
      this.layerManager,
      visibleClasses,
      total,
      layerConfig,
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
    this.currentTableType = type;
    this.currentData = data;

    // 이원분류표인 경우 합계 행 및 병합 헤더 표시 여부 적용
    if (type === CONFIG.TABLE_TYPES.CROSS_TABLE) {
      data.showTotal = tableStore.getSummaryRowVisible(this.tableId);
      data.showMergedHeader = tableStore.getMergedHeaderVisible(this.tableId);
    }

    // 행 수 계산 (타입별)
    const rowCount = this._calculateRowCount(type, data);

    // Canvas 크기 계산 (이원분류표는 병합 헤더 조건부 추가)
    const showMergedHeader = type === CONFIG.TABLE_TYPES.CROSS_TABLE && data.showMergedHeader !== false;
    const mergedHeaderHeight = showMergedHeader ? 35 : 0;
    const canvasHeight = mergedHeaderHeight + CONFIG.TABLE_HEADER_HEIGHT + (rowCount * CONFIG.TABLE_ROW_HEIGHT) + this.padding * 2;

    // 동적 너비 계산 (줄기-잎 제외)
    const dynamicConfig = this._calculateCustomTableDynamicWidth(type, data, config);

    this.canvas.width = dynamicConfig.canvasWidth;
    this.canvas.height = canvasHeight;
    this.clear();

    // 레이어 생성 (TableFactoryRouter 사용)
    this.layerManager.clearAll();
    const layerConfig = {
      ...config,
      columnWidths: dynamicConfig.columnWidths,
      canvasWidth: dynamicConfig.canvasWidth
    };
    TableFactoryRouter.createTableLayers(type, this.layerManager, data, layerConfig, this.tableId);

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
   * 도수분포표 동적 너비 계산
   * @param {Array} classes - 계급 데이터 배열
   * @param {number} total - 전체 데이터 개수
   * @param {Object} config - 테이블 설정
   * @param {boolean} showSummaryRow - 합계 행 표시 여부
   * @returns {Object} { columnWidths, canvasWidth }
   */
  _calculateFrequencyTableDynamicWidth(classes, total, config, showSummaryRow) {
    const tableLabels = config?.labels || CONFIG.DEFAULT_LABELS.table;
    const visibleColumns = config?.visibleColumns || CONFIG.TABLE_DEFAULT_VISIBLE_COLUMNS;
    const columnOrder = config?.columnOrder || CONFIG.TABLE_DEFAULT_COLUMN_ORDER;
    const showSuperscript = config?.showSuperscript ?? CONFIG.TABLE_SHOW_SUPERSCRIPT;

    // 헤더 텍스트 배열 생성 (7개: 계급, 계급값, 탈리, 도수, 상대도수, 누적도수, 누적상대도수)
    const allLabels = [
      tableLabels.class, tableLabels.midpoint, tableLabels.tally,
      tableLabels.frequency, tableLabels.relativeFrequency,
      tableLabels.cumulativeFrequency, tableLabels.cumulativeRelativeFrequency
    ];

    // 정렬 및 필터링된 헤더
    const orderedLabels = columnOrder.map(i => allLabels[i]);
    const orderedVisible = columnOrder.map(i => visibleColumns[i]);
    const headers = orderedLabels.filter((_, i) => orderedVisible[i]);

    // 데이터 행 생성 (텍스트만)
    const rows = classes.map((c, rowIndex) => {
      // 숫자 안전하게 포맷
      const relFreq = typeof c.relativeFreq === 'number' ? c.relativeFreq.toFixed(2) : String(c.relativeFreq);
      const cumRelFreq = typeof c.cumulativeRelFreq === 'number' ? c.cumulativeRelFreq.toFixed(2) : String(c.cumulativeRelFreq);

      // 첫 번째 행이고 상첨자 표시 시 "이상/미만" 포함
      let classText = `${c.min} ~ ${c.max}`;
      if (rowIndex === 0 && showSuperscript) {
        classText = `${c.min}이상 ~ ${c.max}미만`;
      }

      // 탈리마크 너비 계산 (Canvas 그리기 기준)
      const tallyCount = c.frequency;
      const groups = Math.floor(tallyCount / 5);
      const remainder = tallyCount % 5;
      const groupWidth = 4 * CONFIG.TALLY_LINE_SPACING;
      const groupSpacing = CONFIG.TALLY_GROUP_SPACING;
      const remainderWidth = remainder > 0 ? (remainder - 1) * CONFIG.TALLY_LINE_SPACING : 0;
      // 간격 개수: 그룹만 있으면 groups-1, 나머지도 있으면 groups
      const numGaps = groups > 0 ? (remainder > 0 ? groups : Math.max(0, groups - 1)) : 0;
      const tallyPixelWidth = groups * groupWidth + numGaps * groupSpacing + remainderWidth;
      // 너비 계산용 placeholder (대략적인 문자 수로 변환)
      const tallyWidthChars = 'X'.repeat(Math.ceil(tallyPixelWidth / 10));

      const allCells = [
        classText,                    // 0: 계급
        String(c.midpoint),           // 1: 계급값
        tallyWidthChars,              // 2: 탈리마크 (너비 계산용)
        String(c.frequency),          // 3: 도수
        `${relFreq}%`,                // 4: 상대도수
        String(c.cumulativeFreq),     // 5: 누적도수
        `${cumRelFreq}%`              // 6: 누적상대도수
      ];
      const orderedCells = columnOrder.map(i => allCells[i]);
      return orderedCells.filter((_, i) => orderedVisible[i]);
    });

    // 합계 행 추가 (7개 컬럼)
    if (showSummaryRow) {
      const summaryRow = columnOrder.map(i => {
        switch (i) {
          case 0: return '합계';
          case 1: return '';
          case 2: return '';           // 탈리마크 칸 빈값
          case 3: return String(total);
          case 4: return '100%';
          case 5: return String(total);
          case 6: return '100%';
          default: return '';
        }
      }).filter((_, idx) => orderedVisible[idx]);
      rows.push(summaryRow);
    }

    // BaseTableFactory의 동적 너비 계산 사용
    return BaseTableFactory.calculateDynamicWidths(this.ctx, headers, rows);
  }

  /**
   * 커스텀 테이블 동적 너비 계산 (줄기-잎 제외)
   * @param {string} type - 테이블 타입
   * @param {Object} data - 파싱된 데이터
   * @param {Object} config - 테이블 설정
   * @returns {Object} { columnWidths, canvasWidth }
   */
  _calculateCustomTableDynamicWidth(type, data, config) {
    // 줄기-잎은 기존 고정 너비 사용
    if (type === CONFIG.TABLE_TYPES.STEM_LEAF) {
      return {
        columnWidths: null,
        canvasWidth: CONFIG.TABLE_CANVAS_WIDTH
      };
    }

    let headers = [];
    let rows = [];

    switch (type) {
      case CONFIG.TABLE_TYPES.CATEGORY_MATRIX:
        // 카테고리 행렬 (data.headers 사용)
        headers = ['', ...(data.headers || [])];
        rows = (data.rows || []).map(row => [row.label, ...row.values.map(String)]);
        break;

      case CONFIG.TABLE_TYPES.CROSS_TABLE:
        // 이원분류표
        headers = [data.rowLabelColumn || '', ...(data.columnHeaders || [])];
        rows = (data.rows || []).map(row => {
          const values = row.values.map(v =>
            typeof v === 'number' ? (v === 1 ? '1' : v.toFixed(2).replace(/\.?0+$/, '')) : String(v)
          );
          return [row.label, ...values];
        });
        // 합계 행
        if (data.showTotal !== false && data.totals) {
          const totals = data.totals.map(v =>
            typeof v === 'number' ? (v === 1 ? '1' : v.toFixed(2).replace(/\.?0+$/, '')) : String(v)
          );
          rows.push(['합계', ...totals]);
        }
        break;

      default:
        return {
          columnWidths: null,
          canvasWidth: CONFIG.TABLE_CANVAS_WIDTH
        };
    }

    return BaseTableFactory.calculateDynamicWidths(this.ctx, headers, rows);
  }

  /**
   * 전체 프레임 렌더링
   */
  renderFrame() {
    this.clear();

    // 셀 애니메이션 진행도 계산 및 적용
    this.processTableAnimations();

    const rootLayer = this.layerManager.root;
    if (rootLayer && rootLayer.children.length > 0) {
      // root의 자식들(도수분포표)을 렌더링
      rootLayer.children.forEach(child => this.renderLayer(child));
    }

    // 병합된 셀 애니메이션 렌더링 (인접 셀은 하나의 영역으로)
    if (this.cellAnimationActive) {
      let renderProgress;
      if (this.cellAnimationBlinkEnabled) {
        // 블링크 활성화: 펄스 효과 (사인파)
        const elapsed = Date.now() - this.cellAnimationStart;
        const progress = Math.min(elapsed / this.cellAnimationDuration, 1);
        renderProgress = Math.sin(progress * Math.PI * 2 * this.cellAnimationRepeat) * 0.5 + 0.5;
      } else {
        // 블링크 비활성화: 정적 하이라이트
        renderProgress = 1;
      }
      this._renderMergedAnimations(renderProgress);
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

  // =============================================
  // 셀 애니메이션 API
  // =============================================

  /**
   * 셀 애니메이션 실행
   * @param {Object} options - 애니메이션 옵션
   * @param {number} [options.rowIndex] - 행 인덱스 (null이면 전체 행)
   * @param {number} [options.colIndex] - 열 인덱스 (null이면 전체 열)
   * @param {Array} [options.cells] - 복수 셀 [{row, col}, ...]
   * @param {number} [options.duration=1500] - 애니메이션 시간 (ms)
   * @param {number} [options.repeat=3] - 반복 횟수
   * @param {string} [options.color] - 애니메이션 색상 (CSS rgba 또는 hex)
   */
  animateCells(options = {}) {
    const {
      rowIndex = null,
      colIndex = null,
      cells = null,
      duration = 1500,
      repeat = 3,
      color = null
    } = options;

    // 기존 애니메이션 중지
    this.stopCellAnimation();

    // 대상 셀 결정
    this.cellAnimationTargets = this._resolveAnimationTargets(rowIndex, colIndex, cells);

    if (this.cellAnimationTargets.length === 0) {
      console.warn('animateCells: 대상 셀이 없습니다.');
      return;
    }

    // 애니메이션 상태 설정
    this.cellAnimationActive = true;
    this.cellAnimationStart = Date.now();
    this.cellAnimationDuration = duration;
    this.cellAnimationRepeat = repeat;
    this.cellAnimationColor = color;

    // 애니메이션 루프 시작
    this._runCellAnimationLoop();
  }

  /**
   * 셀 애니메이션 중지
   */
  stopCellAnimation() {
    this.cellAnimationActive = false;

    if (this.cellAnimationFrameId) {
      cancelAnimationFrame(this.cellAnimationFrameId);
      this.cellAnimationFrameId = null;
    }

    // 모든 셀의 애니메이션 상태 초기화
    this._clearAnimationFromAllCells();
    this.cellAnimationTargets = [];

    this.renderFrame();
  }

  /**
   * 셀 애니메이션 대상 결정
   * @param {number|null} rowIndex - 행 인덱스 (0: 헤더, 1+: 데이터행, 마지막: 합계)
   * @param {number|null} colIndex - 열 인덱스
   * @param {Array|null} cells - 복수 셀 배열
   * @returns {Array} 대상 셀 배열 [{row, col}, ...]
   */
  _resolveAnimationTargets(rowIndex, colIndex, cells) {
    // 복수 셀이 지정된 경우
    if (cells && Array.isArray(cells) && cells.length > 0) {
      return cells.map(c => ({ row: c.row, col: c.col }));
    }

    const targets = [];
    const rootLayer = this.layerManager.root;
    if (!rootLayer || rootLayer.children.length === 0) return targets;

    const tableLayer = rootLayer.children[0];
    if (!tableLayer) return targets;

    const prefix = this._getLayerIdPrefix();

    // 테이블 구조 파악: 헤더, 데이터 행들, 합계
    const rowStructure = this._getTableRowStructure(tableLayer, prefix);

    // 행만 지정: 해당 행의 모든 셀
    if (rowIndex !== null && colIndex === null) {
      const rowInfo = rowStructure[rowIndex];
      if (rowInfo) {
        const rowLayer = this.layerManager.findLayer(rowInfo.layerId);
        if (rowLayer) {
          rowLayer.children.forEach((_, idx) => {
            targets.push({ row: rowIndex, col: idx });
          });
        }
      }
    }
    // 열만 지정: 해당 열의 모든 행
    else if (rowIndex === null && colIndex !== null) {
      rowStructure.forEach((rowInfo, idx) => {
        targets.push({ row: idx, col: colIndex });
      });
    }
    // 둘 다 지정: 특정 셀
    else if (rowIndex !== null && colIndex !== null) {
      targets.push({ row: rowIndex, col: colIndex });
    }

    return targets;
  }

  /**
   * 테이블 행 구조 파악
   * @param {Layer} tableLayer - 테이블 레이어
   * @param {string} prefix - 레이어 ID 접두사
   * @returns {Array} 행 정보 배열 [{type, layerId}, ...]
   */
  _getTableRowStructure(tableLayer, prefix) {
    const structure = [];

    tableLayer.children.forEach(child => {
      if (child.type === 'group') {
        if (child.id === `${prefix}-table-header`) {
          structure.push({ type: 'header', layerId: child.id });
        } else if (child.id.startsWith(`${prefix}-table-row-`)) {
          structure.push({ type: 'data', layerId: child.id });
        } else if (child.id === `${prefix}-table-summary`) {
          structure.push({ type: 'summary', layerId: child.id });
        }
      }
    });

    return structure;
  }

  /**
   * 셀 애니메이션 루프
   */
  _runCellAnimationLoop() {
    if (!this.cellAnimationActive) return;

    const elapsed = Date.now() - this.cellAnimationStart;

    // 애니메이션 종료 체크
    if (elapsed >= this.cellAnimationDuration) {
      this.stopCellAnimation();
      return;
    }

    // 다음 프레임 예약
    this.cellAnimationFrameId = requestAnimationFrame(() => this._runCellAnimationLoop());

    // 렌더링은 processTableAnimations()에서 처리
    this.renderFrame();
  }

  /**
   * 테이블 애니메이션 진행도 계산 및 적용
   */
  processTableAnimations() {
    if (!this.cellAnimationActive) return;

    const elapsed = Date.now() - this.cellAnimationStart;
    const progress = Math.min(elapsed / this.cellAnimationDuration, 1);

    // 펄스 효과: 사인파 곡선 (repeat 횟수만큼 반복)
    // progress가 0~1일 때, repeat 횟수만큼 사인파가 반복됨
    const pulseProgress = Math.sin(progress * Math.PI * 2 * this.cellAnimationRepeat) * 0.5 + 0.5;

    // 대상 셀들에 애니메이션 진행도 적용
    this._applyAnimationToTargetCells(pulseProgress);
  }

  /**
   * 대상 셀들에 애니메이션 진행도 적용
   * @param {number} progress - 애니메이션 진행도 (0~1)
   */
  _applyAnimationToTargetCells(progress) {
    const rootLayer = this.layerManager.root;
    if (!rootLayer || rootLayer.children.length === 0) return;

    const tableLayer = rootLayer.children[0];
    if (!tableLayer) return;

    const prefix = this._getLayerIdPrefix();
    const rowStructure = this._getTableRowStructure(tableLayer, prefix);

    this.cellAnimationTargets.forEach(target => {
      const rowInfo = rowStructure[target.row];
      if (!rowInfo) return;

      // 행 타입에 따른 셀 ID 생성
      let layerId;
      if (rowInfo.type === 'header') {
        layerId = `${prefix}-table-header-col${target.col}`;
      } else if (rowInfo.type === 'summary') {
        layerId = `${prefix}-table-summary-col${target.col}`;
      } else {
        // 데이터 행: layerId에서 row 번호 추출
        const match = rowInfo.layerId.match(/row-(\d+)$/);
        const dataRowIdx = match ? match[1] : (target.row - 1);
        layerId = `${prefix}-table-row-${dataRowIdx}-col${target.col}`;
      }

      const cellLayer = this.layerManager.findLayer(layerId);
      if (cellLayer) {
        cellLayer.data.animating = true;
        cellLayer.data.animationProgress = progress;
        if (this.cellAnimationColor) {
          cellLayer.data.animationColor = this.cellAnimationColor;
        }
      }
    });
  }

  /**
   * 모든 셀의 애니메이션 상태 초기화
   */
  _clearAnimationFromAllCells() {
    const rootLayer = this.layerManager.root;
    if (!rootLayer || rootLayer.children.length === 0) return;

    const tableLayer = rootLayer.children[0];
    if (!tableLayer) return;

    const prefix = this._getLayerIdPrefix();

    // 헤더, 데이터 행, 합계 행 모두 초기화
    tableLayer.children.forEach(child => {
      if (child.type === 'group') {
        const isRow = child.id.startsWith(`${prefix}-table-row-`);
        const isHeader = child.id === `${prefix}-table-header`;
        const isSummary = child.id === `${prefix}-table-summary`;

        if (isRow || isHeader || isSummary) {
          child.children.forEach(cellLayer => {
            if (cellLayer.type === 'cell') {
              cellLayer.data.animating = false;
              cellLayer.data.animationProgress = 0;
              delete cellLayer.data.animationColor;
            }
          });
        }
      }
    });

    // 행/열 전체 애니메이션 상태도 초기화
    this.rowColumnAnimations = [];
  }

  // =============================================
  // 복수 애니메이션 저장/재생 API
  // =============================================

  /**
   * 애니메이션 추가 (저장)
   * @param {Object} options - 애니메이션 옵션
   * @param {number|null} options.rowIndex - 행 인덱스 (null이면 전체)
   * @param {number|null} options.colIndex - 열 인덱스 (null이면 전체)
   * @param {number} options.duration - 애니메이션 시간 (ms)
   * @param {number} options.repeat - 반복 횟수
   */
  addAnimation(options) {
    const animation = {
      id: Date.now() + Math.random(), // 고유 ID
      rowIndex: options.rowIndex ?? null,
      colIndex: options.colIndex ?? null,
      duration: options.duration || 1500,
      repeat: options.repeat || 3
    };
    this.savedAnimations.push(animation);
    return animation;
  }

  /**
   * 저장된 애니메이션 목록 반환
   * @returns {Array} 저장된 애니메이션 배열
   */
  getSavedAnimations() {
    return [...this.savedAnimations];
  }

  /**
   * 저장된 애니메이션 삭제
   * @param {number} id - 애니메이션 ID
   */
  removeAnimation(id) {
    this.savedAnimations = this.savedAnimations.filter(a => a.id !== id);
  }

  /**
   * 저장된 모든 애니메이션 초기화
   */
  clearSavedAnimations() {
    this.savedAnimations = [];
  }

  /**
   * 저장된 모든 애니메이션 동시 재생
   * @param {Object} options - 재생 옵션
   * @param {boolean} [options.blinkEnabled=true] - 블링크 효과 활성화
   */
  playAllAnimations(options = {}) {
    const { blinkEnabled = true } = options;

    if (this.savedAnimations.length === 0) {
      console.warn('playAllAnimations: 저장된 애니메이션이 없습니다.');
      return;
    }

    // 기존 애니메이션 중지
    this.stopCellAnimation();

    // 최대 duration과 repeat 계산
    const maxDuration = Math.max(...this.savedAnimations.map(a => a.duration));
    const maxRepeat = Math.max(...this.savedAnimations.map(a => a.repeat));

    // 애니메이션 상태 설정
    this.cellAnimationActive = true;
    this.cellAnimationStart = Date.now();
    this.cellAnimationDuration = blinkEnabled ? maxDuration : Infinity; // 블링크 비활성화 시 무한
    this.cellAnimationRepeat = maxRepeat;
    this.cellAnimationBlinkEnabled = blinkEnabled;

    if (blinkEnabled) {
      // 블링크 활성화: 애니메이션 루프 시작
      this._runCellAnimationLoop();
    } else {
      // 블링크 비활성화: 정적 렌더링 한 번
      this.renderFrame();
    }
  }

  /**
   * 행/열 전체 애니메이션 영역 계산
   * @param {string} type - 'row' 또는 'column'
   * @param {number} index - 행 또는 열 인덱스
   * @returns {Object|null} {x, y, width, height}
   */
  _getRowColumnBounds(type, index) {
    const rootLayer = this.layerManager.root;
    if (!rootLayer || rootLayer.children.length === 0) return null;

    const tableLayer = rootLayer.children[0];
    if (!tableLayer) return null;

    const prefix = this._getLayerIdPrefix();
    const rowStructure = this._getTableRowStructure(tableLayer, prefix);

    if (type === 'row') {
      // 행 전체 영역 계산
      const rowInfo = rowStructure[index];
      if (!rowInfo) return null;

      const rowLayer = this.layerManager.findLayer(rowInfo.layerId);
      if (!rowLayer || rowLayer.children.length === 0) return null;

      // 첫 번째 셀과 마지막 셀로 영역 계산
      const firstCell = rowLayer.children[0];
      const lastCell = rowLayer.children[rowLayer.children.length - 1];

      if (!firstCell || !lastCell) return null;

      return {
        x: firstCell.x,
        y: firstCell.y,
        width: (lastCell.x + lastCell.width) - firstCell.x,
        height: firstCell.height
      };
    } else if (type === 'column') {
      // 열 전체 영역 계산
      let minY = Infinity, maxY = -Infinity;
      let x = 0, width = 0;

      rowStructure.forEach((rowInfo) => {
        const rowLayer = this.layerManager.findLayer(rowInfo.layerId);
        if (rowLayer && rowLayer.children[index]) {
          const cell = rowLayer.children[index];
          x = cell.x;
          width = cell.width;
          minY = Math.min(minY, cell.y);
          maxY = Math.max(maxY, cell.y + cell.height);
        }
      });

      if (minY === Infinity) return null;

      return {
        x,
        y: minY,
        width,
        height: maxY - minY
      };
    }

    return null;
  }

  /**
   * 행/열 전체 애니메이션 렌더링 (하나의 박스)
   * @param {number} progress - 애니메이션 진행도 (0~1)
   */
  _renderRowColumnAnimations(progress) {
    if (!this.rowColumnAnimations || this.rowColumnAnimations.length === 0) return;

    this.rowColumnAnimations.forEach(anim => {
      const bounds = this._getRowColumnBounds(anim.type, anim.index);
      if (!bounds) return;

      // 개별 애니메이션의 진행도 계산
      const elapsed = Date.now() - this.cellAnimationStart;
      const animProgress = Math.min(elapsed / anim.duration, 1);
      const pulseProgress = Math.sin(animProgress * Math.PI * 2 * anim.repeat) * 0.5 + 0.5;

      // 하나의 박스로 렌더링
      const fillAlpha = pulseProgress * 0.3;
      const strokeAlpha = pulseProgress;

      this.ctx.save();
      this.ctx.fillStyle = `rgba(137, 236, 78, ${fillAlpha})`;
      this.ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      this.ctx.strokeStyle = `rgba(137, 236, 78, ${strokeAlpha})`;
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(bounds.x + 1, bounds.y + 1, bounds.width - 2, bounds.height - 2);
      this.ctx.restore();
    });
  }

  // =============================================
  // 인접 셀 병합 렌더링
  // =============================================

  /**
   * 모든 애니메이션 대상 셀 수집
   * @returns {Array} [{row, col, bounds}, ...]
   */
  _collectAllAnimationCells() {
    const cells = new Map(); // "row-col" -> {row, col, bounds}

    this.savedAnimations.forEach(anim => {
      const targets = this._resolveAnimationTargets(anim.rowIndex, anim.colIndex, null);
      targets.forEach(t => {
        const key = `${t.row}-${t.col}`;
        if (!cells.has(key)) {
          const bounds = this._getCellBounds(t.row, t.col);
          if (bounds) cells.set(key, { ...t, bounds });
        }
      });
    });

    return Array.from(cells.values());
  }

  /**
   * 인접한 셀들을 그룹으로 묶기 (Union-Find)
   * @param {Array} cells - 셀 배열
   * @returns {Array} 그룹 배열 [[cell1, cell2, ...], ...]
   */
  _groupAdjacentCells(cells) {
    const cellMap = new Map();
    cells.forEach(c => cellMap.set(`${c.row}-${c.col}`, c));

    const parent = new Map();
    const find = (key) => {
      if (!parent.has(key)) parent.set(key, key);
      if (parent.get(key) !== key) {
        parent.set(key, find(parent.get(key)));
      }
      return parent.get(key);
    };
    const union = (a, b) => {
      const pa = find(a), pb = find(b);
      if (pa !== pb) parent.set(pa, pb);
    };

    // 인접 셀 연결
    cells.forEach(c => {
      const key = `${c.row}-${c.col}`;
      const neighbors = [
        `${c.row - 1}-${c.col}`, // 위
        `${c.row + 1}-${c.col}`, // 아래
        `${c.row}-${c.col - 1}`, // 왼쪽
        `${c.row}-${c.col + 1}`  // 오른쪽
      ];
      neighbors.forEach(nKey => {
        if (cellMap.has(nKey)) union(key, nKey);
      });
    });

    // 그룹별로 분류
    const groups = new Map();
    cells.forEach(c => {
      const key = `${c.row}-${c.col}`;
      const root = find(key);
      if (!groups.has(root)) groups.set(root, []);
      groups.get(root).push(c);
    });

    return Array.from(groups.values());
  }

  /**
   * 셀 좌표로 bounds 가져오기
   * @param {number} row - 행 인덱스
   * @param {number} col - 열 인덱스
   * @returns {Object|null} {x, y, width, height}
   */
  _getCellBounds(row, col) {
    const prefix = this._getLayerIdPrefix();
    const rootLayer = this.layerManager.root;
    if (!rootLayer?.children[0]) return null;

    const tableLayer = rootLayer.children[0];
    const rowStructure = this._getTableRowStructure(tableLayer, prefix);
    const rowInfo = rowStructure[row];
    if (!rowInfo) return null;

    // 행 타입에 따른 셀 ID 생성 (기존 _applyAnimationToTargetCells와 동일한 로직)
    let layerId;
    if (rowInfo.type === 'header') {
      layerId = `${prefix}-table-header-col${col}`;
    } else if (rowInfo.type === 'summary') {
      layerId = `${prefix}-table-summary-col${col}`;
    } else {
      // 데이터 행: layerId에서 row 번호 추출
      const match = rowInfo.layerId.match(/row-(\d+)$/);
      const dataRowIdx = match ? match[1] : (row - 1);
      layerId = `${prefix}-table-row-${dataRowIdx}-col${col}`;
    }

    const cellLayer = this.layerManager.findLayer(layerId);
    if (!cellLayer) return null;

    // 레이어 데이터에서 위치 정보 가져오기
    const data = cellLayer.data;
    if (!data) return null;

    return { x: data.x, y: data.y, width: data.width, height: data.height };
  }

  /**
   * 병합된 셀 그룹 렌더링 (인접 셀은 하나의 영역으로)
   * @param {number} progress - 애니메이션 진행도 (0~1)
   */
  _renderMergedAnimations(progress) {
    const cells = this._collectAllAnimationCells();
    if (cells.length === 0) return;

    const groups = this._groupAdjacentCells(cells);
    const fillAlpha = progress * 0.3;
    const strokeAlpha = progress;

    groups.forEach(group => {
      const cellSet = new Set(group.map(c => `${c.row}-${c.col}`));

      this.ctx.save();

      // 1. 모든 셀에 fill
      this.ctx.fillStyle = `rgba(137, 236, 78, ${fillAlpha})`;
      group.forEach(c => {
        this.ctx.fillRect(c.bounds.x, c.bounds.y, c.bounds.width, c.bounds.height);
      });

      // 2. 외곽 변만 stroke (인접 셀과 공유하는 변은 제외)
      this.ctx.strokeStyle = `rgba(137, 236, 78, ${strokeAlpha})`;
      this.ctx.lineWidth = 2;

      group.forEach(c => {
        const { x, y, width, height } = c.bounds;
        const hasTop = cellSet.has(`${c.row - 1}-${c.col}`);
        const hasBottom = cellSet.has(`${c.row + 1}-${c.col}`);
        const hasLeft = cellSet.has(`${c.row}-${c.col - 1}`);
        const hasRight = cellSet.has(`${c.row}-${c.col + 1}`);

        this.ctx.beginPath();
        if (!hasTop) { // 위쪽 변
          this.ctx.moveTo(x, y);
          this.ctx.lineTo(x + width, y);
        }
        if (!hasBottom) { // 아래쪽 변
          this.ctx.moveTo(x, y + height);
          this.ctx.lineTo(x + width, y + height);
        }
        if (!hasLeft) { // 왼쪽 변
          this.ctx.moveTo(x, y);
          this.ctx.lineTo(x, y + height);
        }
        if (!hasRight) { // 오른쪽 변
          this.ctx.moveTo(x + width, y);
          this.ctx.lineTo(x + width, y + height);
        }
        this.ctx.stroke();
      });

      this.ctx.restore();
    });
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
  // 셀 변수 편집 모달 관련 메서드 (TableEditModal로 위임)
  // =============================================

  /**
   * 편집 모달 열기
   * @deprecated editModal.openEditModal() 사용
   */
  openEditModal() {
    this.editModal.openEditModal();
  }

  /**
   * 편집 모달 닫기
   * @deprecated editModal.closeEditModal() 사용
   */
  closeEditModal() {
    this.editModal.closeEditModal();
  }

  /**
   * 변경사항 저장
   * @deprecated editModal.saveChanges() 사용
   */
  saveChanges() {
    this.editModal.saveChanges();
  }

  /**
   * 모든 변수 초기화
   * @deprecated editModal.clearAllVariables() 사용
   */
  clearAllVariables() {
    this.editModal.clearAllVariables();
  }
}

export default TableRenderer;

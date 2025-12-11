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
import StemLeafFactory from './table/factories/StemLeafFactory.js';
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

    // 스케일 비율 (canvasWidth/canvasHeight 설정 시 사용)
    this.scaleRatio = 1;

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
   * @param {string} canvasId - Canvas ID (예: 'viz-table-1', 'viz-table-2')
   * @returns {string} 테이블 ID (예: 'viz-table-1', 'table-1')
   */
  extractTableId(canvasId) {
    // viz-api 형식: viz-table-1, viz-table-2 등 → 그대로 사용
    const vizMatch = canvasId.match(/viz-table-\d+/);
    if (vizMatch) {
      return canvasId;
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
    const autoHeight = CONFIG.TABLE_HEADER_HEIGHT + (rowCount * CONFIG.TABLE_ROW_HEIGHT) + this.padding * 2;

    // 동적 너비 계산
    const dynamicConfig = this._calculateFrequencyTableDynamicWidth(visibleClasses, total, config, showSummaryRow);

    // 비율 계산 (canvasWidth 또는 canvasHeight 중 하나만 설정해도 비율 유지)
    let ratio = 1;
    if (config?.canvasWidth && dynamicConfig.canvasWidth > 0) {
      ratio = config.canvasWidth / dynamicConfig.canvasWidth;
    } else if (config?.canvasHeight && autoHeight > 0) {
      ratio = config.canvasHeight / autoHeight;
    }

    // 최종 canvas 크기 계산 (비율 적용)
    const finalCanvasWidth = config?.canvasWidth || Math.round(dynamicConfig.canvasWidth * ratio);
    const finalCanvasHeight = config?.canvasHeight || Math.round(autoHeight * ratio);
    this.canvas.width = finalCanvasWidth;
    this.canvas.height = finalCanvasHeight;
    this.scaleRatio = ratio; // renderFrame에서 사용
    this.clear();

    // 레이어 생성 (원래 크기로 생성, renderFrame에서 scale 적용)
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
      case 'basic-table-grid':
        this.cellRenderer.renderBasicTableGrid(layer);
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
    // config에서 명시적으로 설정된 값이 있으면 유지, 없으면 tableStore 사용
    if (type === CONFIG.TABLE_TYPES.BASIC_TABLE) {
      if (data.showTotal === undefined) {
        data.showTotal = tableStore.getSummaryRowVisible(this.tableId);
      }
      if (data.showMergedHeader === undefined) {
        data.showMergedHeader = tableStore.getMergedHeaderVisible(this.tableId);
      }
    }

    // 행 수 계산 (adaptedData가 있으면 직접 사용, 없으면 타입별 계산)
    const rowCount = config?.adaptedData?.rowCount ?? this._calculateRowCount(type, data);

    // Canvas 크기 계산 (이원분류표는 병합 헤더 조건부 추가)
    const showMergedHeader = type === CONFIG.TABLE_TYPES.BASIC_TABLE && data.showMergedHeader !== false;
    const mergedHeaderHeight = showMergedHeader ? 35 : 0;

    // 분수가 포함된 경우 행 높이 조정
    const hasFraction = this._checkTableHasFraction(type, data);
    const rowHeight = hasFraction ? CONFIG.TABLE_ROW_HEIGHT_FRACTION : CONFIG.TABLE_ROW_HEIGHT;
    const autoHeight = mergedHeaderHeight + CONFIG.TABLE_HEADER_HEIGHT + (rowCount * rowHeight) + this.padding * 2;

    // 동적 너비 계산 (줄기-잎 제외)
    const dynamicConfig = this._calculateCustomTableDynamicWidth(type, data, config);

    // 비율 계산 (canvasWidth 또는 canvasHeight 중 하나만 설정해도 비율 유지)
    let ratio = 1;
    if (config?.canvasWidth && dynamicConfig.canvasWidth > 0) {
      ratio = config.canvasWidth / dynamicConfig.canvasWidth;
    } else if (config?.canvasHeight && autoHeight > 0) {
      ratio = config.canvasHeight / autoHeight;
    }

    // 최종 canvas 크기 계산 (비율 적용)
    const finalCanvasWidth = config?.canvasWidth || Math.round(dynamicConfig.canvasWidth * ratio);
    const finalCanvasHeight = config?.canvasHeight || Math.round(autoHeight * ratio);
    this.canvas.width = finalCanvasWidth;
    this.canvas.height = finalCanvasHeight;
    this.scaleRatio = ratio; // renderFrame에서 사용
    this.clear();

    // 레이어 생성 (원래 크기로 생성, renderFrame에서 scale 적용)
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

      case CONFIG.TABLE_TYPES.BASIC_TABLE:
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
   * 테이블 데이터에 분수(\frac{}{})가 포함되어 있는지 확인
   * @param {string} type - 테이블 타입
   * @param {Object} data - 파싱된 데이터
   * @returns {boolean} 분수 포함 여부
   */
  _checkTableHasFraction(type, data) {
    const fracPattern = /\\frac\{[^}]*\}\{[^}]*\}/;

    if (type === CONFIG.TABLE_TYPES.BASIC_TABLE && data.rows) {
      // 데이터 행 검사
      for (const row of data.rows) {
        if (row.values) {
          for (const val of row.values) {
            if (typeof val === 'string' && fracPattern.test(val)) {
              return true;
            }
          }
        }
      }
      // 합계 행 검사
      if (data.totals) {
        for (const val of data.totals) {
          if (typeof val === 'string' && fracPattern.test(val)) {
            return true;
          }
        }
      }
    }

    return false;
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
    // 줄기-잎 동적 너비 계산
    if (type === CONFIG.TABLE_TYPES.STEM_LEAF) {
      return StemLeafFactory.calculateDynamicWidths(data);
    }

    let headers = [];
    let rows = [];

    switch (type) {
      case CONFIG.TABLE_TYPES.CATEGORY_MATRIX:
        // 카테고리 행렬 (data.headers 사용)
        headers = ['', ...(data.headers || [])];
        rows = (data.rows || []).map(row => [row.label, ...row.values.map(String)]);
        break;

      case CONFIG.TABLE_TYPES.BASIC_TABLE:
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

    // 스케일 적용
    this.ctx.save();
    if (this.scaleRatio !== 1) {
      this.ctx.scale(this.scaleRatio, this.scaleRatio);
    }

    // 셀 애니메이션 진행도 계산 및 적용
    this.processTableAnimations();

    const rootLayer = this.layerManager.root;
    if (rootLayer && rootLayer.children.length > 0) {
      const tableLayer = rootLayer.children[0];
      if (tableLayer && tableLayer.children) {
        // 1. 그리드 레이어 먼저 렌더링
        tableLayer.children.forEach(child => {
          if (child.type === 'grid' || child.type === 'basic-table-grid' ||
              child.type === 'stem-leaf-grid' || child.type === 'stem-leaf-single-grid') {
            this.renderLayer(child);
          }
        });

        // 2. 하이라이트 렌더링 (그리드 위, 텍스트 아래)
        if (this.cellAnimationActive) {
          let renderProgress;
          const elapsed = Date.now() - this.cellAnimationStart;

          if (this.cellAnimationBlinkEnabled) {
            const progress = Math.min(elapsed / this.cellAnimationDuration, 1);
            renderProgress = Math.sin(progress * Math.PI * 2 * this.cellAnimationRepeat) * 0.5 + 0.5;
          } else {
            const fadeInDuration = 300;
            renderProgress = Math.min(elapsed / fadeInDuration, 1);
          }
          this._renderMergedAnimations(renderProgress);
        }

        // 3. 셀 레이어 렌더링 (텍스트)
        tableLayer.children.forEach(child => {
          if (child.type !== 'grid' && child.type !== 'basic-table-grid' &&
              child.type !== 'stem-leaf-grid' && child.type !== 'stem-leaf-single-grid') {
            this.renderLayer(child);
          }
        });
      }
    }

    // 스케일 복원
    this.ctx.restore();
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
   * @param {number} [options.rowStart] - 행 범위 시작 (colIndex와 함께 사용)
   * @param {number} [options.rowEnd] - 행 범위 끝 (colIndex와 함께 사용)
   * @param {number} [options.colStart] - 열 범위 시작 (rowIndex와 함께 사용)
   * @param {number} [options.colEnd] - 열 범위 끝 (rowIndex와 함께 사용)
   * @param {Array} [options.cells] - 복수 셀 [{row, col}, ...]
   * @param {number} [options.duration=1500] - 애니메이션 시간 (ms)
   * @param {number} [options.repeat=3] - 반복 횟수
   * @param {string} [options.color] - 애니메이션 색상 (CSS rgba 또는 hex)
   */
  animateCells(options = {}) {
    const {
      rowIndex = null,
      colIndex = null,
      rowStart = null,
      rowEnd = null,
      colStart = null,
      colEnd = null,
      cells = null,
      duration = 1500,
      repeat = 3,
      color = null
    } = options;

    // 기존 애니메이션 중지
    this.stopCellAnimation();

    // 대상 셀 결정
    this.cellAnimationTargets = this._resolveAnimationTargets({
      rowIndex, colIndex, rowStart, rowEnd, colStart, colEnd, cells
    });

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
   * @param {Object} anim - 애니메이션 설정 객체
   * @param {number|null} anim.rowIndex - 행 인덱스 (0: 헤더, 1+: 데이터행, 마지막: 합계)
   * @param {number|null} anim.colIndex - 열 인덱스
   * @param {number|null} anim.rowStart - 행 범위 시작 (colIndex와 함께 사용)
   * @param {number|null} anim.rowEnd - 행 범위 끝 (colIndex와 함께 사용)
   * @param {number|null} anim.colStart - 열 범위 시작 (rowIndex와 함께 사용)
   * @param {number|null} anim.colEnd - 열 범위 끝 (rowIndex와 함께 사용)
   * @param {Array|null} anim.cells - 복수 셀 배열
   * @returns {Array} 대상 셀 배열 [{row, col}, ...]
   */
  _resolveAnimationTargets(anim) {
    const {
      rowIndex = null,
      colIndex = null,
      rowStart = null,
      rowEnd = null,
      colStart = null,
      colEnd = null,
      cells = null
    } = anim || {};

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

    // 1. colIndex + rowStart/rowEnd: 특정 열의 행 범위
    if (colIndex !== null && rowStart !== null && rowEnd !== null) {
      for (let r = rowStart; r <= rowEnd; r++) {
        if (r >= 0 && r < rowStructure.length) {
          targets.push({ row: r, col: colIndex });
        }
      }
    }
    // 2. rowIndex + colStart/colEnd: 특정 행의 열 범위
    else if (rowIndex !== null && colStart !== null && colEnd !== null) {
      const rowInfo = rowStructure[rowIndex];
      if (rowInfo) {
        const rowLayer = this.layerManager.findLayer(rowInfo.layerId);
        if (rowLayer) {
          const maxCol = rowLayer.children.length - 1;
          for (let c = colStart; c <= colEnd; c++) {
            if (c >= 0 && c <= maxCol) {
              targets.push({ row: rowIndex, col: c });
            }
          }
        }
      }
    }
    // 3. 행만 지정: 해당 행의 모든 셀
    else if (rowIndex !== null && colIndex === null) {
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
    // 4. 열만 지정: 해당 열의 모든 행
    else if (rowIndex === null && colIndex !== null) {
      rowStructure.forEach((rowInfo, idx) => {
        targets.push({ row: idx, col: colIndex });
      });
    }
    // 5. 둘 다 지정: 특정 셀
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

    // 애니메이션 종료 체크 (블링크 활성화 시에만)
    if (this.cellAnimationBlinkEnabled && elapsed >= this.cellAnimationDuration) {
      this.stopCellAnimation();
      return;
    }

    // 다음 프레임 예약 (블링크 비활성화 시 페이드인 완료 후에도 계속)
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

    // 디버그: 첫 프레임에서만 로그
    if (!this._debugLogged) {
      console.log('[DEBUG] _applyAnimationToTargetCells - rowStructure:', rowStructure);
      console.log('[DEBUG] targets:', this.cellAnimationTargets);
      this._debugLogged = true;
    }

    this.cellAnimationTargets.forEach(target => {
      const rowInfo = rowStructure[target.row];
      if (!rowInfo) {
        if (!this._debugLogged2) {
          console.log('[DEBUG] rowInfo not found for row:', target.row);
          this._debugLogged2 = true;
        }
        return;
      }

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

      // _renderMergedAnimations가 그룹 규칙에 따라 색상을 적용하므로
      // 여기서는 개별 셀의 animating 플래그를 설정하지 않음
      // (설정하면 _renderAnimationBackground가 초록색을 중복 렌더링함)
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
   * @param {number|null} options.rowStart - 행 범위 시작 (colIndex와 함께 사용)
   * @param {number|null} options.rowEnd - 행 범위 끝 (colIndex와 함께 사용)
   * @param {number|null} options.colStart - 열 범위 시작 (rowIndex와 함께 사용)
   * @param {number|null} options.colEnd - 열 범위 끝 (rowIndex와 함께 사용)
   * @param {number} options.duration - 애니메이션 시간 (ms)
   * @param {number} options.repeat - 반복 횟수
   */
  addAnimation(options) {
    const animation = {
      id: Date.now() + Math.random(), // 고유 ID
      rowIndex: options.rowIndex ?? null,
      colIndex: options.colIndex ?? null,
      rowStart: options.rowStart ?? null,
      rowEnd: options.rowEnd ?? null,
      colStart: options.colStart ?? null,
      colEnd: options.colEnd ?? null,
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
   * @param {boolean} [options.blinkEnabled=false] - 블링크 효과 활성화
   */
  playAllAnimations(options = {}) {
    const { blinkEnabled = false } = options;

    if (this.savedAnimations.length === 0) {
      console.warn('playAllAnimations: 저장된 애니메이션이 없습니다.');
      return;
    }

    // 기존 애니메이션 중지
    this.stopCellAnimation();

    // savedAnimations에서 대상 셀 목록 생성
    this.cellAnimationTargets = [];
    this.savedAnimations.forEach(anim => {
      const targets = this._resolveAnimationTargets(anim);
      this.cellAnimationTargets.push(...targets);
    });

    // 최대 duration과 repeat 계산
    const maxDuration = Math.max(...this.savedAnimations.map(a => a.duration));
    const maxRepeat = Math.max(...this.savedAnimations.map(a => a.repeat));

    // 애니메이션 상태 설정
    this.cellAnimationActive = true;
    this.cellAnimationStart = Date.now();
    this.cellAnimationDuration = blinkEnabled ? maxDuration : 300; // 블링크 비활성화 시 페이드인 시간
    this.cellAnimationRepeat = maxRepeat;
    this.cellAnimationBlinkEnabled = blinkEnabled;

    // 애니메이션 루프 시작 (블링크/페이드인 모두)
    this._runCellAnimationLoop();
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
      const targets = this._resolveAnimationTargets(anim);
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
   * 단일 애니메이션의 셀만 수집
   * @param {Object} anim - 애니메이션 객체 {rowIndex, colIndex, ...}
   * @returns {Array} [{row, col, bounds}, ...]
   */
  _collectAnimationCellsForSingleAnim(anim) {
    const cells = [];
    const targets = this._resolveAnimationTargets(anim);

    targets.forEach(t => {
      const bounds = this._getCellBounds(t.row, t.col);
      if (bounds) {
        cells.push({ row: t.row, col: t.col, bounds });
      }
    });

    return cells;
  }

  /**
   * 단일 애니메이션 내에서 인접 셀 그룹화 (방향 제약 적용)
   * @param {Array} cells - 셀 배열 [{row, col, bounds}, ...]
   * @returns {Array} 그룹 배열 [[cell1, cell2, ...], ...]
   */
  _groupCellsWithDirection(cells) {
    if (cells.length === 0) return [];

    const groups = [];
    const cellToGroup = new Map();
    const cellMap = new Map();
    cells.forEach(c => cellMap.set(`${c.row}-${c.col}`, c));

    cells.forEach(cell => {
      const key = `${cell.row}-${cell.col}`;
      if (cellToGroup.has(key)) return;

      const neighbors = [
        { key: `${cell.row - 1}-${cell.col}`, dir: 'vertical' },
        { key: `${cell.row + 1}-${cell.col}`, dir: 'vertical' },
        { key: `${cell.row}-${cell.col - 1}`, dir: 'horizontal' },
        { key: `${cell.row}-${cell.col + 1}`, dir: 'horizontal' }
      ];

      let targetGroupIdx = null;
      let mergeDirection = null;

      for (const n of neighbors) {
        if (!cellToGroup.has(n.key)) continue;
        if (!cellMap.has(n.key)) continue;

        const groupIdx = cellToGroup.get(n.key);
        const group = groups[groupIdx];

        if (group.direction === 'undetermined' || group.direction === n.dir) {
          targetGroupIdx = groupIdx;
          mergeDirection = n.dir;
          break;
        }
      }

      if (targetGroupIdx !== null) {
        const group = groups[targetGroupIdx];
        group.cells.add(key);
        cellToGroup.set(key, targetGroupIdx);

        if (group.direction === 'undetermined' && group.cells.size >= 2) {
          group.direction = mergeDirection;
        }
      } else {
        const newGroup = { cells: new Set([key]), direction: 'undetermined' };
        const newIdx = groups.length;
        groups.push(newGroup);
        cellToGroup.set(key, newIdx);
      }
    });

    return groups.map(g => {
      return Array.from(g.cells).map(key => cellMap.get(key)).filter(Boolean);
    }).filter(g => g.length > 0);
  }

  /**
   * 인접한 셀들을 그룹으로 묶기 (방향 제약 적용)
   * - 행 그룹: 같은 행의 셀만 병합 가능 (가로 방향)
   * - 열 그룹: 같은 열의 셀만 병합 가능 (세로 방향)
   * - 단일 셀: 방향 미정, 다음 셀 추가 시 방향 결정
   * @param {Array} cells - 셀 배열 [{row, col, bounds}, ...]
   * @returns {Array} 그룹 배열 [[cell1, cell2, ...], ...]
   */
  _groupAdjacentCells(cells) {
    // 그룹 구조: { cells: Set<"row-col">, direction: 'undetermined' | 'horizontal' | 'vertical' }
    const groups = [];
    const cellToGroup = new Map(); // "row-col" -> group index
    const cellMap = new Map();
    cells.forEach(c => cellMap.set(`${c.row}-${c.col}`, c));

    // savedAnimations 순서대로 처리 (추가 순서 유지)
    this.savedAnimations.forEach(anim => {
      const targets = this._resolveAnimationTargets(anim);

      targets.forEach(t => {
        const key = `${t.row}-${t.col}`;
        if (cellToGroup.has(key)) return; // 이미 그룹에 있음
        if (!cellMap.has(key)) return; // bounds 없음

        // 인접한 기존 그룹 찾기
        const neighbors = [
          { key: `${t.row - 1}-${t.col}`, dir: 'vertical' },   // 위
          { key: `${t.row + 1}-${t.col}`, dir: 'vertical' },   // 아래
          { key: `${t.row}-${t.col - 1}`, dir: 'horizontal' }, // 왼쪽
          { key: `${t.row}-${t.col + 1}`, dir: 'horizontal' }  // 오른쪽
        ];

        let targetGroupIdx = null;
        let mergeDirection = null;

        for (const n of neighbors) {
          if (!cellToGroup.has(n.key)) continue;

          const groupIdx = cellToGroup.get(n.key);
          const group = groups[groupIdx];

          // 병합 가능 여부 확인
          if (group.direction === 'undetermined' || group.direction === n.dir) {
            targetGroupIdx = groupIdx;
            mergeDirection = n.dir;
            break; // 첫 번째 병합 가능한 그룹 선택
          }
        }

        if (targetGroupIdx !== null) {
          // 기존 그룹에 추가
          const group = groups[targetGroupIdx];
          group.cells.add(key);
          cellToGroup.set(key, targetGroupIdx);

          // 방향 결정 (그룹에 셀이 2개 이상이면)
          if (group.direction === 'undetermined' && group.cells.size >= 2) {
            group.direction = mergeDirection;
          }
        } else {
          // 새 그룹 생성
          const newGroup = { cells: new Set([key]), direction: 'undetermined' };
          const newIdx = groups.length;
          groups.push(newGroup);
          cellToGroup.set(key, newIdx);
        }
      });
    });

    // 결과 변환: Set<key> → Array<cell>
    return groups.map(g => {
      return Array.from(g.cells).map(key => cellMap.get(key)).filter(Boolean);
    }).filter(g => g.length > 0);
  }

  /**
   * 인접 셀 그룹화 (겹침 허용)
   * - savedAnimations 순서대로 처리
   * - 인접하고 방향 맞으면 기존 그룹에 추가
   * - 방향이 다르면 새 그룹 생성, 겹치는 셀도 포함
   * @returns {Array} 그룹 배열 [[cell1, cell2, ...], ...]
   */
  _groupAdjacentCellsWithOverlap() {
    const groups = [];

    this.savedAnimations.forEach((anim, idx) => {
      const targets = this._resolveAnimationTargets(anim);
      if (targets.length === 0) return;

      // 셀에 bounds 추가
      const cells = targets.map(t => {
        const bounds = this._getCellBounds(t.row, t.col);
        return bounds ? { row: t.row, col: t.col, bounds } : null;
      }).filter(Boolean);

      if (cells.length === 0) return;

      // 방향 추론
      let direction = 'undetermined';
      if (cells.length >= 2) {
        direction = cells[0].row === cells[1].row ? 'horizontal' : 'vertical';
      }

      // 인접한 기존 그룹 찾기 (방향 맞는 것만)
      let targetGroup = null;
      for (const group of groups) {
        // 둘 다 방향이 정해져 있고 다르면 스킵
        if (group.direction !== 'undetermined' && direction !== 'undetermined'
            && group.direction !== direction) {
          continue;
        }

        // 인접 여부 체크
        outer:
        for (const c1 of cells) {
          for (const c2 of group.cells) {
            const rowDiff = Math.abs(c1.row - c2.row);
            const colDiff = Math.abs(c1.col - c2.col);
            if ((rowDiff + colDiff) === 1) {
              const adjacencyDir = rowDiff === 0 ? 'horizontal' : 'vertical';

              // 그룹 방향이 정해져 있으면, 인접 방향이 그룹 방향과 맞아야 함
              if (group.direction !== 'undetermined' && adjacencyDir !== group.direction) {
                continue;
              }

              // 그룹 방향이 미정이면 인접 방향으로 설정
              if (group.direction === 'undetermined') {
                group.direction = adjacencyDir;
              }

              targetGroup = group;
              break outer;
            }
          }
        }
        if (targetGroup) break;
      }

      if (targetGroup) {
        // 기존 그룹에 추가 (중복 체크)
        cells.forEach(c => {
          if (!targetGroup.cells.some(tc => tc.row === c.row && tc.col === c.col)) {
            targetGroup.cells.push(c);
          }
        });
        if (targetGroup.direction === 'undetermined') targetGroup.direction = direction;

        // 다른 방향 그룹에도 인접하면 추가 (겹침 처리)
        for (const otherGroup of groups) {
          if (otherGroup === targetGroup) continue;
          if (otherGroup.direction === 'undetermined') continue;
          if (otherGroup.direction === targetGroup.direction) continue;

          cells.forEach(c => {
            // 이미 있으면 스킵
            if (otherGroup.cells.some(tc => tc.row === c.row && tc.col === c.col)) return;

            // 인접 여부 체크
            for (const oc of otherGroup.cells) {
              const rowDiff = Math.abs(c.row - oc.row);
              const colDiff = Math.abs(c.col - oc.col);
              if ((rowDiff + colDiff) === 1) {
                const adjacencyDir = rowDiff === 0 ? 'horizontal' : 'vertical';
                if (adjacencyDir === otherGroup.direction) {
                  otherGroup.cells.push({ ...c });
                  break;
                }
              }
            }
          });
        }
      } else {
        // 새 그룹 생성
        groups.push({ cells: [...cells], direction });
      }
    });

    return groups.map(g => g.cells);
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
    if (!rootLayer?.children[0]) {
      return null;
    }

    const tableLayer = rootLayer.children[0];
    const rowStructure = this._getTableRowStructure(tableLayer, prefix);
    const rowInfo = rowStructure[row];
    if (!rowInfo) {
      return null;
    }

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
    if (!cellLayer) {
      return null;
    }

    // 레이어 데이터에서 위치 정보 가져오기
    const data = cellLayer.data;
    if (!data) {
      return null;
    }

    return { x: data.x, y: data.y, width: data.width, height: data.height };
  }

  /**
   * 병합된 셀 그룹 렌더링 (인접 셀 병합, 겹침 허용)
   * @param {number} progress - 애니메이션 진행도 (0~1)
   */
  _renderMergedAnimations(progress) {
    if (this.savedAnimations.length === 0) return;

    // 인접 셀 그룹화 (겹침 허용, 직접 bounds 수집)
    const allGroups = this._groupAdjacentCellsWithOverlap();
    if (allGroups.length === 0) return;

    // 색상: 그룹 1개면 초록색, 2개 이상이면 파랑/분홍/주황
    const colors = allGroups.length === 1
      ? ['#89EC4E']
      : ['#008aff', '#e749af', '#ff764f'];

    allGroups.forEach((group, groupIndex) => {
      const color = colors[groupIndex % colors.length];
      const fillAlpha = progress * 0.3;
      const strokeAlpha = progress;

      // hex to rgb 변환
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);

      const cellSet = new Set(group.map(c => `${c.row}-${c.col}`));

      this.ctx.save();

      // 1. 모든 셀에 fill
      this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${fillAlpha})`;
      group.forEach(c => {
        this.ctx.fillRect(c.bounds.x, c.bounds.y, c.bounds.width, c.bounds.height);
      });

      // 2. 외곽 변만 stroke (인접 셀과 공유하는 변은 제외)
      this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${strokeAlpha})`;
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

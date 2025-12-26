/**
 * 기본 테이블 팩토리 (구 이원 분류표)
 * 행: 카테고리 (혈액형 등), 열: 그룹 (남학생, 여학생 등)
 * 2행 헤더 구조: 병합 헤더(상대도수) + 컬럼 헤더
 */

import CONFIG from '../../../config.js';
import { Layer } from '../../../animation/index.js';
import BaseTableFactory from './BaseTableFactory.js';

// 기본 테이블 전용 상수
const BASIC_TABLE_CONFIG = {
  MERGED_HEADER_HEIGHT: 35,           // 병합 헤더 높이
  MERGED_HEADER_TEXT: '상대도수',      // 병합 헤더 텍스트
  MERGED_HEADER_LINE_WIDTH: 1          // 구분선 두께
};

/**
 * 녹색 계열 색상 반환 (switchColor 적용)
 * @returns {string} 색상 코드
 */
function getGreenColor() {
  return CONFIG.TABLE_SWITCH_COLOR || CONFIG.TABLE_HEADER_TEXT_COLOR;
}

class BasicTableFactory {
  /**
   * 기본 테이블 레이어 생성
   * @param {LayerManager} layerManager - 레이어 매니저
   * @param {Object} data - 파싱된 데이터 { rowLabelColumn, columnHeaders, rows, totals, showTotal, showMergedHeader }
   * @param {Object} config - 테이블 설정
   * @param {string} tableId - 테이블 고유 ID
   */
  static createTableLayers(layerManager, data, config = null, tableId = 'table-1') {
    const { rowLabelColumn, columnHeaders, rows, totals, showTotal = true, showMergedHeader = true, mergedHeaderText = null, totalDataColumns } = data;

    // 커스텀 병합 헤더 텍스트 (없으면 기본값 '상대도수')
    const headerText = mergedHeaderText || BASIC_TABLE_CONFIG.MERGED_HEADER_TEXT;

    // 열 개수: 행 라벨 열 + 데이터 열들 (colSpan 합계 사용)
    const dataColCount = totalDataColumns || columnHeaders.reduce((sum, h) => sum + (h.colSpan || 1), 0);
    const columnCount = dataColCount + 1;
    // 행 개수: 데이터 행 + 합계 행 (옵션)
    const rowCount = rows.length + (showTotal ? 1 : 0);

    const padding = CONFIG.TABLE_PADDING;
    // 테두리 패딩 (showGrid: false일 때 캔버스 확장분)
    const borderPadX = config?.borderPadX || 0;
    const borderPadY = config?.borderPadY || 0;
    const canvasWidth = config?.canvasWidth || CONFIG.TABLE_CANVAS_WIDTH;

    // 각 행의 높이 계산 (분수 포함 여부에 따라)
    const rowHeights = this._calculateRowHeights(rows, totals, showTotal);
    const totalRowHeight = rowHeights.reduce((sum, h) => sum + h, 0);

    // Canvas 높이 계산 (config에서 전달받거나 자동 계산)
    const mergedHeaderHeight = showMergedHeader ? BASIC_TABLE_CONFIG.MERGED_HEADER_HEIGHT : 0;
    const totalHeaderHeight = mergedHeaderHeight + CONFIG.TABLE_HEADER_HEIGHT;
    const canvasHeight = config?.canvasHeight || (totalHeaderHeight + totalRowHeight + padding * 2);

    // 열 너비 계산 (config에서 전달받거나 자동 계산)
    const columnWidths = config?.columnWidths || this._calculateColumnWidths(canvasWidth, padding, columnCount);

    // 테이블 타입
    const tableType = CONFIG.TABLE_TYPES.BASIC_TABLE;

    // 루트 레이어 생성
    const rootLayer = new Layer({
      id: `${tableType}-${tableId}-table-root`,
      name: '기본 테이블',
      type: 'group',
      visible: true,
      order: 0,
      data: {
        canvasWidth,
        canvasHeight,
        padding,
        columnCount,
        rowCount,
        tableType: CONFIG.TABLE_TYPES.BASIC_TABLE
      }
    });

    // 그리드 표시 여부 (config에서 가져오거나 기본값 true)
    const showGrid = config?.showGrid ?? CONFIG.TABLE_SHOW_GRID;

    // showGrid: false일 때 헤더 높이를 0으로 처리 (데이터만 표시)
    const effectiveMergedHeaderHeight = showGrid ? mergedHeaderHeight : 0;
    const effectiveColumnHeaderHeight = showGrid ? CONFIG.TABLE_HEADER_HEIGHT : 0;

    // 격자선 레이어 (이원분류표 전용)
    // showGrid: false일 때 최종 캔버스 너비 계산 (테두리 중앙 배치용)
    const finalCanvasWidth = showGrid ? canvasWidth : canvasWidth + borderPadX * 2;
    const finalCanvasHeight = showGrid ? canvasHeight : canvasHeight + borderPadY * 2;
    const gridLayer = this._createGridLayer({
      canvasWidth,
      padding,
      rowCount,
      columnWidths,
      tableId,
      hasSummaryRow: showTotal,
      mergedHeaderHeight: effectiveMergedHeaderHeight,
      showMergedHeader,
      rowHeights,
      showGrid,
      borderPadX,
      borderPadY,
      columnHeaderHeight: effectiveColumnHeaderHeight,
      finalCanvasWidth,
      finalCanvasHeight
    });
    rootLayer.addChild(gridLayer);

    // 병합 헤더 레이어 (상대도수 또는 커스텀 텍스트) - showGrid: true일 때만
    if (showMergedHeader && showGrid) {
      const mergedHeaderLayer = this._createMergedHeaderLayer(
        columnWidths,
        padding,
        tableId,
        headerText,
        borderPadX,
        borderPadY
      );
      rootLayer.addChild(mergedHeaderLayer);
    }

    // 컬럼 헤더 레이어 - showGrid: true일 때만
    if (showGrid) {
      const columnHeaderLayer = this._createColumnHeaderLayer(
        rowLabelColumn,
        columnHeaders,
        columnWidths,
        padding,
        tableId,
        mergedHeaderHeight,
        borderPadX,
        borderPadY
      );
      rootLayer.addChild(columnHeaderLayer);
    }

    // 데이터 행 레이어
    rows.forEach((row, rowIndex) => {
      const rowLayer = this._createDataRowLayer(
        row,
        rowIndex,
        columnWidths,
        padding,
        tableId,
        effectiveMergedHeaderHeight,
        rowHeights,
        borderPadX,
        borderPadY,
        effectiveColumnHeaderHeight
      );
      rootLayer.addChild(rowLayer);
    });

    // 합계 행 레이어
    if (showTotal && totals) {
      const summaryLayer = this._createSummaryRowLayer(
        totals,
        rows.length,
        columnWidths,
        padding,
        tableId,
        effectiveMergedHeaderHeight,
        rowHeights,
        borderPadX,
        borderPadY,
        effectiveColumnHeaderHeight
      );
      rootLayer.addChild(summaryLayer);
    }

    // LayerManager에 추가
    layerManager.addLayer(rootLayer, 'root');
  }

  /**
   * ParserAdapter의 통일된 출력 형식으로 테이블 레이어 생성
   * @param {LayerManager} layerManager - 레이어 매니저
   * @param {Object} adaptedData - ParserAdapter.adapt() 출력
   * @param {Object} config - 테이블 설정
   * @param {string} tableId - 테이블 고유 ID
   */
  static createFromAdaptedData(layerManager, adaptedData, config = null, tableId = 'table-1') {
    const { rows, rowCount, metadata } = adaptedData;
    const { rowLabelColumn, columnHeaders, showTotal, mergedHeaderText, hasTotalRow, originalTotals } = metadata;

    // adaptedData를 기존 파서 형식으로 변환
    // adaptedData.rows에는 합계 행이 포함되어 있을 수 있음
    const dataRows = hasTotalRow ? rows.slice(0, -1) : rows;

    const legacyData = {
      rowLabelColumn,
      columnHeaders,
      showTotal,
      mergedHeaderText,
      totals: originalTotals,
      rows: dataRows.map(row => ({
        label: row.label,
        values: row.cells.slice(1, -1).map(cell => cell.value)  // 첫 번째(라벨)와 마지막(합계) 제외
      }))
    };

    // showTotal이 false면 values에서 마지막 제외 안함
    if (!showTotal) {
      legacyData.rows = dataRows.map(row => ({
        label: row.label,
        values: row.cells.slice(1).map(cell => cell.value)
      }));
    }

    // 기존 메서드 호출
    this.createTableLayers(layerManager, legacyData, config, tableId);
  }

  /**
   * 행별 높이 계산 (분수 포함 여부에 따라)
   * 테이블에 분수가 하나라도 있으면 모든 행을 동일한 높이로 통일
   * @param {Array} rows - 데이터 행 배열
   * @param {Array} totals - 합계 배열
   * @param {boolean} showTotal - 합계 행 표시 여부
   * @returns {Array<number>} 각 행의 높이 배열
   */
  static _calculateRowHeights(rows, totals, showTotal) {
    // 테이블 전체에서 분수가 있는지 확인
    const hasAnyFraction = rows.some(row => this._rowContainsFraction(row.values)) ||
      (showTotal && totals && this._arrayContainsFraction(totals));

    // 분수가 있으면 모든 행을 분수 높이로 통일
    const rowHeight = hasAnyFraction ? CONFIG.TABLE_ROW_HEIGHT_FRACTION : CONFIG.TABLE_ROW_HEIGHT;

    const heights = [];

    // 데이터 행들
    rows.forEach(() => {
      heights.push(rowHeight);
    });

    // 합계 행
    if (showTotal && totals) {
      heights.push(rowHeight);
    }

    return heights;
  }

  /**
   * 행에 분수가 포함되어 있는지 확인
   */
  static _rowContainsFraction(values) {
    return this._arrayContainsFraction(values);
  }

  /**
   * 배열에 분수가 포함되어 있는지 확인
   */
  static _arrayContainsFraction(arr) {
    if (!arr) return false;
    return arr.some(val => {
      if (typeof val === 'string') {
        return /\\frac\{[^}]*\}\{[^}]*\}/.test(val);
      }
      return false;
    });
  }

  /**
   * 열 너비 계산
   */
  static _calculateColumnWidths(canvasWidth, padding, columnCount) {
    const totalWidth = canvasWidth - padding * 2;
    // 첫 번째 열(행 라벨)은 20%, 나머지는 균등 분배
    const labelColumnWidth = totalWidth * 0.2;
    const dataColumnWidth = (totalWidth * 0.8) / (columnCount - 1);

    return [labelColumnWidth, ...Array(columnCount - 1).fill(dataColumnWidth)];
  }

  /**
   * 격자선 레이어 생성 (기본 테이블 전용)
   */
  static _createGridLayer(options) {
    const {
      canvasWidth,
      padding,
      rowCount,
      columnWidths,
      tableId,
      hasSummaryRow,
      mergedHeaderHeight,
      showMergedHeader = true,
      rowHeights = [],
      showGrid = true,
      borderPadX = 0,
      borderPadY = 0,
      columnHeaderHeight = CONFIG.TABLE_HEADER_HEIGHT,
      finalCanvasWidth = 0,
      finalCanvasHeight = 0
    } = options;

    const totalWidth = canvasWidth - padding * 2;
    // 테두리 패딩 오프셋 (showGrid: false일 때 콘텐츠 위치 조정)
    const offsetX = borderPadX;
    const offsetY = borderPadY;
    const totalHeaderHeight = mergedHeaderHeight + columnHeaderHeight;
    const totalRowHeight = rowHeights.length > 0
      ? rowHeights.reduce((sum, h) => sum + h, 0)
      : rowCount * CONFIG.TABLE_ROW_HEIGHT;
    const totalHeight = totalHeaderHeight + totalRowHeight;

    return new Layer({
      id: `basic-table-${tableId}-table-grid`,
      name: '격자선',
      type: 'basic-table-grid',  // 기본 테이블 전용 타입
      visible: true,
      order: 0,
      data: {
        x: padding + offsetX,
        y: padding + offsetY,
        width: totalWidth,
        height: totalHeight,
        rowCount,
        columnWidths,
        hasSummaryRow,
        mergedHeaderHeight,
        columnHeaderHeight,
        mergedHeaderLineColor: getGreenColor(),
        mergedHeaderLineWidth: BASIC_TABLE_CONFIG.MERGED_HEADER_LINE_WIDTH,
        showMergedHeader,
        rowHeights,
        showGrid,
        finalCanvasWidth,
        finalCanvasHeight
      }
    });
  }

  /**
   * 병합 헤더 레이어 생성 (상대도수 또는 커스텀 텍스트)
   * @param {Array} columnWidths - 열 너비 배열
   * @param {number} padding - 패딩
   * @param {string} tableId - 테이블 ID
   * @param {string} headerText - 병합 헤더 텍스트
   * @param {number} borderPadX - 테두리 X 패딩
   * @param {number} borderPadY - 테두리 Y 패딩
   */
  static _createMergedHeaderLayer(columnWidths, padding, tableId, headerText = BASIC_TABLE_CONFIG.MERGED_HEADER_TEXT, borderPadX = 0, borderPadY = 0) {
    const mergedHeaderGroup = new Layer({
      id: `basic-table-${tableId}-table-merged-header`,
      name: '병합 헤더',
      type: 'group',
      visible: true,
      order: 1,
      data: {}
    });

    const y = padding + borderPadY;

    // 첫 번째 열은 빈 칸
    const emptyCell = new Layer({
      id: `basic-table-${tableId}-table-merged-header-empty`,
      name: '(빈 셀)',
      type: 'cell',
      visible: true,
      order: 0,
      data: {
        rowType: 'merged-header',
        rowIndex: -2,
        colIndex: 0,
        cellText: '',
        x: padding + borderPadX,
        y,
        width: columnWidths[0],
        height: BASIC_TABLE_CONFIG.MERGED_HEADER_HEIGHT,
        alignment: 'center',
        highlighted: false,
        highlightProgress: 0
      }
    });
    mergedHeaderGroup.addChild(emptyCell);

    // 나머지 열은 커스텀 텍스트 병합
    const mergedWidth = columnWidths.slice(1).reduce((a, b) => a + b, 0);
    const mergedCell = new Layer({
      id: `basic-table-${tableId}-table-merged-header-title`,
      name: headerText,
      type: 'cell',
      visible: true,
      order: 1,
      data: {
        rowType: 'merged-header',
        rowIndex: -2,
        colIndex: 1,
        cellText: headerText,
        x: padding + borderPadX + columnWidths[0],
        y,
        width: mergedWidth,
        height: BASIC_TABLE_CONFIG.MERGED_HEADER_HEIGHT,
        alignment: 'center',
        highlighted: false,
        highlightProgress: 0,
        isMergedCell: true,
        headerTextColor: getGreenColor()
      }
    });
    mergedHeaderGroup.addChild(mergedCell);

    return mergedHeaderGroup;
  }

  /**
   * 컬럼 헤더 레이어 생성 (혈액형 | 남학생 | 여학생)
   * columnHeaders는 객체 배열: [{ text: '도수', colSpan: 2 }, ...]
   */
  static _createColumnHeaderLayer(rowLabelColumn, columnHeaders, columnWidths, padding, tableId, mergedHeaderHeight = BASIC_TABLE_CONFIG.MERGED_HEADER_HEIGHT, borderPadX = 0, borderPadY = 0) {
    const headerGroup = new Layer({
      id: `basic-table-${tableId}-table-header`,
      name: '컬럼 헤더',
      type: 'group',
      visible: true,
      order: 2,
      data: {}
    });

    let x = padding + borderPadX;
    const y = padding + borderPadY + mergedHeaderHeight;

    // 첫 번째 열은 행 라벨 컬럼명 (예: 혈액형)
    const rowLabelCell = new Layer({
      id: `basic-table-${tableId}-table-header-col0`,
      name: rowLabelColumn,
      type: 'cell',
      visible: true,
      order: 0,
      data: {
        rowType: 'header',
        rowIndex: -1,
        colIndex: 0,
        colLabel: rowLabelColumn,
        cellText: rowLabelColumn,
        x,
        y,
        width: columnWidths[0],
        height: CONFIG.TABLE_HEADER_HEIGHT,
        alignment: 'center',
        highlighted: false,
        highlightProgress: 0,
        headerTextColor: getGreenColor()
      }
    });
    headerGroup.addChild(rowLabelCell);
    x += columnWidths[0];

    // 데이터 헤더 (colSpan 지원)
    let dataColIndex = 1; // columnWidths 인덱스 (0은 행 라벨)
    columnHeaders.forEach((headerObj, i) => {
      // 호환성: 문자열이면 객체로 변환
      const header = typeof headerObj === 'string' ? { text: headerObj, colSpan: 1 } : headerObj;
      const colSpan = header.colSpan || 1;

      // colSpan에 해당하는 너비 합산
      let cellWidth = 0;
      for (let j = 0; j < colSpan; j++) {
        cellWidth += columnWidths[dataColIndex + j] || 0;
      }

      const cellLayer = new Layer({
        id: `basic-table-${tableId}-table-header-col${dataColIndex}`,
        name: header.text,
        type: 'cell',
        visible: true,
        order: dataColIndex,
        data: {
          rowType: 'header',
          rowIndex: -1,
          colIndex: dataColIndex,
          colLabel: header.text,
          cellText: header.text,
          x,
          y,
          width: cellWidth,
          height: CONFIG.TABLE_HEADER_HEIGHT,
          alignment: 'center',
          highlighted: false,
          highlightProgress: 0,
          headerTextColor: getGreenColor(),
          colSpan: colSpan,
          isMergedCell: colSpan > 1
        }
      });

      headerGroup.addChild(cellLayer);
      x += cellWidth;
      dataColIndex += colSpan;
    });

    return headerGroup;
  }

  /**
   * 데이터 행 레이어 생성
   */
  static _createDataRowLayer(row, rowIndex, columnWidths, padding, tableId, mergedHeaderHeight = BASIC_TABLE_CONFIG.MERGED_HEADER_HEIGHT, rowHeights = [], borderPadX = 0, borderPadY = 0, columnHeaderHeight = CONFIG.TABLE_HEADER_HEIGHT) {
    const rowGroup = new Layer({
      id: `basic-table-${tableId}-table-row-${rowIndex}`,
      name: `데이터 행 ${rowIndex}`,
      type: 'group',
      visible: true,
      order: rowIndex + 3,  // 0: grid, 1: merged-header, 2: column-header, 3+: data rows
      data: { rowIndex }
    });

    // Y 좌표 계산 (병합 헤더 + 컬럼 헤더 이후)
    const totalHeaderHeight = mergedHeaderHeight + columnHeaderHeight;
    // rowHeights가 있으면 이전 행들의 높이 합산, 없으면 기존 방식
    const y = padding + borderPadY + totalHeaderHeight + (rowHeights.length > 0
      ? rowHeights.slice(0, rowIndex).reduce((sum, h) => sum + h, 0)
      : rowIndex * CONFIG.TABLE_ROW_HEIGHT);
    const currentRowHeight = rowHeights[rowIndex] || CONFIG.TABLE_ROW_HEIGHT;
    let x = padding + borderPadX;

    // 첫 번째 열은 행 라벨 (혈액형 값: A, B, AB, O)
    const cells = [row.label, ...row.values];

    cells.forEach((cellText, colIndex) => {
      const isLabelColumn = colIndex === 0;

      // 탈리마크 객체인 경우 그대로 전달
      const isTallyObject = cellText && typeof cellText === 'object' && cellText.type === 'tally';

      // 값 포맷팅 (소수점인 경우, null은 그대로 유지)
      let displayText = cellText;
      if (typeof cellText === 'number' && !isLabelColumn) {
        displayText = cellText.toFixed(2).replace(/\.?0+$/, '');
      }

      // null은 그대로 유지, 탈리 객체도 그대로 유지
      const cellTextValue = isTallyObject ? cellText : (displayText === null ? null : String(displayText));

      const cellLayer = new Layer({
        id: `basic-table-${tableId}-table-row-${rowIndex}-col${colIndex}`,
        name: isTallyObject ? `탈리(${cellText.count})` : (cellTextValue ?? ''),
        type: 'cell',
        visible: true,
        order: colIndex,
        data: {
          rowType: isLabelColumn ? 'row-header' : 'data',
          rowIndex,
          colIndex,
          colLabel: '',
          cellText: cellTextValue,
          x,
          y,
          width: columnWidths[colIndex],
          height: currentRowHeight,
          alignment: 'center',
          highlighted: false,
          highlightProgress: 0,
          isEvenRow: rowIndex % 2 === 1,
          isLabelColumn,
          textColor: isLabelColumn ? '#FFFFFF' : null
        }
      });

      rowGroup.addChild(cellLayer);
      x += columnWidths[colIndex];
    });

    return rowGroup;
  }

  /**
   * 합계 행 레이어 생성
   */
  static _createSummaryRowLayer(totals, dataRowCount, columnWidths, padding, tableId, mergedHeaderHeight = BASIC_TABLE_CONFIG.MERGED_HEADER_HEIGHT, rowHeights = [], borderPadX = 0, borderPadY = 0, columnHeaderHeight = CONFIG.TABLE_HEADER_HEIGHT) {
    const summaryGroup = new Layer({
      id: `basic-table-${tableId}-table-summary`,
      name: '합계 행',
      type: 'group',
      visible: true,
      order: dataRowCount + 3,
      data: {}
    });

    // Y 좌표 계산 (병합 헤더 + 컬럼 헤더 + 데이터 행들 이후)
    const totalHeaderHeight = mergedHeaderHeight + columnHeaderHeight;
    // rowHeights가 있으면 데이터 행들의 높이 합산
    const dataRowsHeight = rowHeights.length > 0
      ? rowHeights.slice(0, dataRowCount).reduce((sum, h) => sum + h, 0)
      : dataRowCount * CONFIG.TABLE_ROW_HEIGHT;
    const y = padding + borderPadY + totalHeaderHeight + dataRowsHeight;
    const summaryRowHeight = rowHeights[dataRowCount] || CONFIG.TABLE_ROW_HEIGHT;
    let x = padding + borderPadX;

    // 첫 번째 열은 "합계" (englishFont 옵션이면 "Total")
    const totalLabel = CONFIG.TABLE_ENGLISH_FONT ? 'Total' : '합계';
    const cells = [totalLabel, ...totals];

    cells.forEach((cellText, colIndex) => {
      let displayText = cellText;
      if (cellText === null) {
        displayText = null;  // null은 그대로 유지 (빈칸 처리용)
      } else if (typeof cellText === 'number') {
        // 1인 경우 그대로 1로 표시, 그 외는 소수점 처리
        displayText = cellText === 1 ? '1' : cellText.toFixed(2).replace(/\.?0+$/, '');
      }

      const cellLayer = new Layer({
        id: `basic-table-${tableId}-table-summary-col${colIndex}`,
        name: displayText === null ? '' : String(displayText),
        type: 'cell',
        visible: true,
        order: colIndex,
        data: {
          rowType: 'summary',
          rowIndex: dataRowCount,
          colIndex,
          colLabel: '',
          cellText: displayText === null ? null : String(displayText),
          x,
          y,
          width: columnWidths[colIndex],
          height: summaryRowHeight,
          alignment: 'center',
          highlighted: false,
          highlightProgress: 0
        }
      });

      summaryGroup.addChild(cellLayer);
      x += columnWidths[colIndex];
    });

    return summaryGroup;
  }
}

export default BasicTableFactory;

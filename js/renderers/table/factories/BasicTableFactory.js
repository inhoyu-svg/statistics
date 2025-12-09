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
  MERGED_HEADER_LINE_COLOR: '#8DCF66', // 병합 헤더 아래 구분선 색상
  MERGED_HEADER_LINE_WIDTH: 1          // 구분선 두께
};

class BasicTableFactory {
  /**
   * 기본 테이블 레이어 생성
   * @param {LayerManager} layerManager - 레이어 매니저
   * @param {Object} data - 파싱된 데이터 { rowLabelColumn, columnHeaders, rows, totals, showTotal, showMergedHeader }
   * @param {Object} config - 테이블 설정
   * @param {string} tableId - 테이블 고유 ID
   */
  static createTableLayers(layerManager, data, config = null, tableId = 'table-1') {
    const { rowLabelColumn, columnHeaders, rows, totals, showTotal = true, showMergedHeader = true, mergedHeaderText = null } = data;

    // 커스텀 병합 헤더 텍스트 (없으면 기본값 '상대도수')
    const headerText = mergedHeaderText || BASIC_TABLE_CONFIG.MERGED_HEADER_TEXT;

    // 열 개수: 행 라벨 열 + 데이터 열들
    const columnCount = columnHeaders.length + 1;
    // 행 개수: 데이터 행 + 합계 행 (옵션)
    const rowCount = rows.length + (showTotal ? 1 : 0);

    const padding = CONFIG.TABLE_PADDING;
    const canvasWidth = config?.canvasWidth || CONFIG.TABLE_CANVAS_WIDTH;

    // Canvas 높이 계산 (병합 헤더 조건부 + 컬럼 헤더 + 데이터 행들)
    const mergedHeaderHeight = showMergedHeader ? BASIC_TABLE_CONFIG.MERGED_HEADER_HEIGHT : 0;
    const totalHeaderHeight = mergedHeaderHeight + CONFIG.TABLE_HEADER_HEIGHT;
    const canvasHeight = totalHeaderHeight + (rowCount * CONFIG.TABLE_ROW_HEIGHT) + padding * 2;

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

    // 격자선 레이어 (이원분류표 전용)
    const gridLayer = this._createGridLayer({
      canvasWidth,
      padding,
      rowCount,
      columnWidths,
      tableId,
      hasSummaryRow: showTotal,
      mergedHeaderHeight,
      showMergedHeader
    });
    rootLayer.addChild(gridLayer);

    // 병합 헤더 레이어 (상대도수 또는 커스텀 텍스트) - 조건부 생성
    if (showMergedHeader) {
      const mergedHeaderLayer = this._createMergedHeaderLayer(
        columnWidths,
        padding,
        tableId,
        headerText
      );
      rootLayer.addChild(mergedHeaderLayer);
    }

    // 컬럼 헤더 레이어 (혈액형 | 남학생 | 여학생)
    const columnHeaderLayer = this._createColumnHeaderLayer(
      rowLabelColumn,
      columnHeaders,
      columnWidths,
      padding,
      tableId,
      mergedHeaderHeight
    );
    rootLayer.addChild(columnHeaderLayer);

    // 데이터 행 레이어
    rows.forEach((row, rowIndex) => {
      const rowLayer = this._createDataRowLayer(
        row,
        rowIndex,
        columnWidths,
        padding,
        tableId,
        mergedHeaderHeight
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
        mergedHeaderHeight
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
      showMergedHeader = true
    } = options;

    const totalWidth = canvasWidth - padding * 2;
    const totalHeaderHeight = mergedHeaderHeight + CONFIG.TABLE_HEADER_HEIGHT;
    const totalHeight = totalHeaderHeight + (rowCount * CONFIG.TABLE_ROW_HEIGHT);

    return new Layer({
      id: `basic-table-${tableId}-table-grid`,
      name: '격자선',
      type: 'basic-table-grid',  // 기본 테이블 전용 타입
      visible: true,
      order: 0,
      data: {
        x: padding,
        y: padding,
        width: totalWidth,
        height: totalHeight,
        rowCount,
        columnWidths,
        hasSummaryRow,
        mergedHeaderHeight,
        columnHeaderHeight: CONFIG.TABLE_HEADER_HEIGHT,
        mergedHeaderLineColor: BASIC_TABLE_CONFIG.MERGED_HEADER_LINE_COLOR,
        mergedHeaderLineWidth: BASIC_TABLE_CONFIG.MERGED_HEADER_LINE_WIDTH,
        showMergedHeader
      }
    });
  }

  /**
   * 병합 헤더 레이어 생성 (상대도수 또는 커스텀 텍스트)
   * @param {Array} columnWidths - 열 너비 배열
   * @param {number} padding - 패딩
   * @param {string} tableId - 테이블 ID
   * @param {string} headerText - 병합 헤더 텍스트
   */
  static _createMergedHeaderLayer(columnWidths, padding, tableId, headerText = BASIC_TABLE_CONFIG.MERGED_HEADER_TEXT) {
    const mergedHeaderGroup = new Layer({
      id: `basic-table-${tableId}-table-merged-header`,
      name: '병합 헤더',
      type: 'group',
      visible: true,
      order: 1,
      data: {}
    });

    const y = padding;

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
        x: padding,
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
        x: padding + columnWidths[0],
        y,
        width: mergedWidth,
        height: BASIC_TABLE_CONFIG.MERGED_HEADER_HEIGHT,
        alignment: 'center',
        highlighted: false,
        highlightProgress: 0,
        isMergedCell: true,
        headerTextColor: '#8DCF66'
      }
    });
    mergedHeaderGroup.addChild(mergedCell);

    return mergedHeaderGroup;
  }

  /**
   * 컬럼 헤더 레이어 생성 (혈액형 | 남학생 | 여학생)
   */
  static _createColumnHeaderLayer(rowLabelColumn, columnHeaders, columnWidths, padding, tableId, mergedHeaderHeight = BASIC_TABLE_CONFIG.MERGED_HEADER_HEIGHT) {
    const headerGroup = new Layer({
      id: `basic-table-${tableId}-table-header`,
      name: '컬럼 헤더',
      type: 'group',
      visible: true,
      order: 2,
      data: {}
    });

    let x = padding;
    const y = padding + mergedHeaderHeight;

    // 첫 번째 열은 행 라벨 컬럼명 (예: 혈액형)
    const allHeaders = [rowLabelColumn, ...columnHeaders];

    allHeaders.forEach((header, i) => {
      const cellLayer = new Layer({
        id: `basic-table-${tableId}-table-header-col${i}`,
        name: header,
        type: 'cell',
        visible: true,
        order: i,
        data: {
          rowType: 'header',
          rowIndex: -1,
          colIndex: i,
          colLabel: header,
          cellText: header,
          x,
          y,
          width: columnWidths[i],
          height: CONFIG.TABLE_HEADER_HEIGHT,
          alignment: 'center',
          highlighted: false,
          highlightProgress: 0,
          headerTextColor: '#8DCF66'
        }
      });

      headerGroup.addChild(cellLayer);
      x += columnWidths[i];
    });

    return headerGroup;
  }

  /**
   * 데이터 행 레이어 생성
   */
  static _createDataRowLayer(row, rowIndex, columnWidths, padding, tableId, mergedHeaderHeight = BASIC_TABLE_CONFIG.MERGED_HEADER_HEIGHT) {
    const rowGroup = new Layer({
      id: `basic-table-${tableId}-table-row-${rowIndex}`,
      name: `데이터 행 ${rowIndex}`,
      type: 'group',
      visible: true,
      order: rowIndex + 3,  // 0: grid, 1: merged-header, 2: column-header, 3+: data rows
      data: { rowIndex }
    });

    // Y 좌표 계산 (병합 헤더 + 컬럼 헤더 이후)
    const totalHeaderHeight = mergedHeaderHeight + CONFIG.TABLE_HEADER_HEIGHT;
    const y = padding + totalHeaderHeight + (rowIndex * CONFIG.TABLE_ROW_HEIGHT);
    let x = padding;

    // 첫 번째 열은 행 라벨 (혈액형 값: A, B, AB, O)
    const cells = [row.label, ...row.values];

    cells.forEach((cellText, colIndex) => {
      const isLabelColumn = colIndex === 0;

      // 값 포맷팅 (소수점인 경우)
      let displayText = cellText;
      if (typeof cellText === 'number' && !isLabelColumn) {
        displayText = cellText.toFixed(2).replace(/\.?0+$/, '');
      }

      const cellLayer = new Layer({
        id: `basic-table-${tableId}-table-row-${rowIndex}-col${colIndex}`,
        name: String(displayText),
        type: 'cell',
        visible: true,
        order: colIndex,
        data: {
          rowType: isLabelColumn ? 'row-header' : 'data',
          rowIndex,
          colIndex,
          colLabel: '',
          cellText: String(displayText),
          x,
          y,
          width: columnWidths[colIndex],
          height: CONFIG.TABLE_ROW_HEIGHT,
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
  static _createSummaryRowLayer(totals, dataRowCount, columnWidths, padding, tableId, mergedHeaderHeight = BASIC_TABLE_CONFIG.MERGED_HEADER_HEIGHT) {
    const summaryGroup = new Layer({
      id: `basic-table-${tableId}-table-summary`,
      name: '합계 행',
      type: 'group',
      visible: true,
      order: dataRowCount + 3,
      data: {}
    });

    // Y 좌표 계산 (병합 헤더 + 컬럼 헤더 + 데이터 행들 이후)
    const totalHeaderHeight = mergedHeaderHeight + CONFIG.TABLE_HEADER_HEIGHT;
    const y = padding + totalHeaderHeight + (dataRowCount * CONFIG.TABLE_ROW_HEIGHT);
    let x = padding;

    // 첫 번째 열은 "합계"
    const cells = ['합계', ...totals];

    cells.forEach((cellText, colIndex) => {
      let displayText = cellText;
      if (typeof cellText === 'number') {
        // 1인 경우 그대로 1로 표시, 그 외는 소수점 처리
        displayText = cellText === 1 ? '1' : cellText.toFixed(2).replace(/\.?0+$/, '');
      }

      const cellLayer = new Layer({
        id: `basic-table-${tableId}-table-summary-col${colIndex}`,
        name: String(displayText),
        type: 'cell',
        visible: true,
        order: colIndex,
        data: {
          rowType: 'summary',
          rowIndex: dataRowCount,
          colIndex,
          colLabel: '',
          cellText: String(displayText),
          x,
          y,
          width: columnWidths[colIndex],
          height: CONFIG.TABLE_ROW_HEIGHT,
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

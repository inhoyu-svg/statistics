/**
 * 테이블 레이어 팩토리
 * 도수분포표를 레이어 구조로 생성
 */

import CONFIG from '../../config.js';
import Utils from '../../utils/utils.js';
import { Layer } from '../../animation/index.js';

class TableLayerFactory {
  /**
   * 테이블 레이어 생성 (LayerManager에 추가)
   * @param {LayerManager} layerManager - 레이어 매니저
   * @param {Array} classes - 계급 데이터 배열 (도수 > 0인 것만)
   * @param {number} total - 전체 데이터 개수
   * @param {Object} config - 테이블 설정
   * @param {string} tableId - 테이블 고유 ID (기본값: 'table-1')
   */
  static createTableLayers(layerManager, classes, total, config = null, tableId = 'table-1') {
    // 설정 가져오기
    const tableLabels = config?.labels || CONFIG.DEFAULT_LABELS.table;
    const visibleColumns = config?.visibleColumns || [true, true, true, true, false, false];
    const columnOrder = config?.columnOrder || [0, 1, 2, 3, 4, 5];
    const columnAlignment = config?.columnAlignment || CONFIG.TABLE_DEFAULT_ALIGNMENT;
    const showSuperscript = config?.showSuperscript ?? CONFIG.TABLE_SHOW_SUPERSCRIPT;

    // 원본 라벨 배열
    const allLabels = [
      tableLabels.class,
      tableLabels.midpoint,
      tableLabels.frequency,
      tableLabels.relativeFrequency,
      tableLabels.cumulativeFrequency,
      tableLabels.cumulativeRelativeFrequency
    ];

    // columnOrder에 따라 재정렬
    const orderedLabels = columnOrder.map(i => allLabels[i]);
    const orderedVisibleColumns = columnOrder.map(i => visibleColumns[i]);

    // 표시할 컬럼만 필터링
    const filteredLabels = orderedLabels.filter((_, i) => orderedVisibleColumns[i]);
    const columnCount = filteredLabels.length;

    // Canvas 크기 계산
    const padding = CONFIG.TABLE_PADDING;
    const canvasWidth = CONFIG.TABLE_CANVAS_WIDTH;
    const rowCount = classes.length + 1; // +1 for summary row
    const canvasHeight = CONFIG.TABLE_HEADER_HEIGHT + (rowCount * CONFIG.TABLE_ROW_HEIGHT) + padding * 2;

    // 열 너비 계산
    const columnWidths = this._calculateColumnWidths(canvasWidth, padding, columnCount);

    // 테이블 타입
    const tableType = CONFIG.TABLE_TYPES.FREQUENCY;

    // 루트 레이어 생성
    const rootLayer = new Layer({
      id: `${tableType}-${tableId}-table-root`,
      name: '도수분포표',
      type: 'group',
      visible: true,
      order: 0,
      data: {
        tableType,
        canvasWidth,
        canvasHeight,
        padding,
        columnCount,
        rowCount
      }
    });

    // 격자선 레이어 생성 (도수분포표는 합계 행 있음)
    const gridLayer = this._createGridLayer(
      canvasWidth,
      canvasHeight,
      padding,
      rowCount,
      columnWidths,
      tableId,
      true // hasSummaryRow
    );
    rootLayer.addChild(gridLayer);

    // 헤더 레이어 생성
    const headerLayer = this._createHeaderLayer(
      filteredLabels,
      columnWidths,
      columnAlignment,
      padding,
      tableId
    );
    rootLayer.addChild(headerLayer);

    // 데이터 행 레이어 생성
    classes.forEach((classData, rowIndex) => {
      const rowLayer = this._createDataRowLayer(
        classData,
        rowIndex,
        columnWidths,
        orderedVisibleColumns,
        columnOrder,
        columnAlignment,
        showSuperscript,
        padding,
        filteredLabels,
        tableId
      );
      rootLayer.addChild(rowLayer);
    });

    // 합계 행 레이어 생성
    const summaryLayer = this._createSummaryRowLayer(
      total,
      classes.length,
      columnWidths,
      orderedVisibleColumns,
      columnOrder,
      columnAlignment,
      padding,
      filteredLabels,
      tableId
    );
    rootLayer.addChild(summaryLayer);

    // LayerManager에 추가 (root의 자식으로)
    layerManager.addLayer(rootLayer, 'root');
  }

  /**
   * 열 너비 계산
   * @param {number} canvasWidth - Canvas 너비
   * @param {number} padding - 패딩
   * @param {number} columnCount - 표시할 열 개수
   * @returns {Array} 각 열의 너비 배열
   */
  static _calculateColumnWidths(canvasWidth, padding, columnCount) {
    const totalWidth = canvasWidth - padding * 2;
    const widthPerColumn = totalWidth / columnCount;
    return Array(columnCount).fill(widthPerColumn);
  }

  /**
   * 격자선 레이어 생성
   * @param {number} canvasWidth - Canvas 너비
   * @param {number} canvasHeight - Canvas 높이
   * @param {number} padding - 패딩
   * @param {number} rowCount - 행 개수
   * @param {Array} columnWidths - 열 너비 배열
   * @param {string} tableId - 테이블 고유 ID
   * @param {boolean} hasSummaryRow - 합계 행 여부
   * @returns {Layer} 격자선 레이어
   */
  static _createGridLayer(canvasWidth, canvasHeight, padding, rowCount, columnWidths, tableId, hasSummaryRow = true) {
    const totalWidth = canvasWidth - padding * 2;
    const totalHeight = CONFIG.TABLE_HEADER_HEIGHT + (rowCount * CONFIG.TABLE_ROW_HEIGHT);

    return new Layer({
      id: `frequency-${tableId}-table-grid`,
      name: '격자선',
      type: 'grid',
      visible: true,
      order: 0,
      data: {
        x: padding,
        y: padding,
        width: totalWidth,
        height: totalHeight,
        rowCount,
        columnWidths,
        hasSummaryRow
      }
    });
  }

  /**
   * 헤더 행 레이어 생성
   * @param {Array} headers - 헤더 라벨 배열
   * @param {Array} columnWidths - 열 너비 배열
   * @param {Object} columnAlignment - 컬럼별 정렬 설정
   * @param {number} padding - 패딩
   * @param {string} tableId - 테이블 고유 ID
   * @returns {Layer} 헤더 그룹 레이어
   */
  static _createHeaderLayer(headers, columnWidths, columnAlignment, padding, tableId) {
    const headerGroup = new Layer({
      id: `frequency-${tableId}-table-header`,
      name: '헤더 행',
      type: 'group',
      visible: true,
      order: 1,
      data: {}
    });

    let x = padding;
    const y = padding;

    headers.forEach((header, i) => {
      const cellLayer = new Layer({
        id: `frequency-${tableId}-table-header-col${i}`,
        name: header,
        type: 'cell',
        visible: true,
        order: i,
        data: {
          rowType: 'header',
          rowIndex: -1, // 헤더는 -1
          colIndex: i,
          colLabel: header,
          cellText: header,
          x,
          y,
          width: columnWidths[i],
          height: CONFIG.TABLE_HEADER_HEIGHT,
          alignment: columnAlignment[header] || 'center',
          highlighted: false,
          highlightProgress: 0
        }
      });

      headerGroup.addChild(cellLayer);
      x += columnWidths[i];
    });

    return headerGroup;
  }

  /**
   * 데이터 행 레이어 생성
   * @param {Object} classData - 계급 데이터
   * @param {number} rowIndex - 행 인덱스
   * @param {Array} columnWidths - 열 너비 배열
   * @param {Array} orderedVisibleColumns - 순서가 적용된 표시 컬럼 배열
   * @param {Array} columnOrder - 컬럼 순서 배열
   * @param {Object} columnAlignment - 컬럼별 정렬 설정
   * @param {boolean} showSuperscript - 상첨자 표시 여부
   * @param {number} padding - 패딩
   * @param {Array} filteredLabels - 필터링된 라벨 배열
   * @param {string} tableId - 테이블 고유 ID
   * @returns {Layer} 데이터 행 그룹 레이어
   */
  static _createDataRowLayer(
    classData,
    rowIndex,
    columnWidths,
    orderedVisibleColumns,
    columnOrder,
    columnAlignment,
    showSuperscript,
    padding,
    filteredLabels,
    tableId
  ) {
    const rowGroup = new Layer({
      id: `frequency-${tableId}-table-row-${rowIndex}`,
      name: `데이터 행 ${rowIndex}`,
      type: 'group',
      visible: true,
      order: rowIndex + 2, // 0: grid, 1: header, 2+: data rows
      data: {
        rowIndex
      }
    });

    const y = padding + CONFIG.TABLE_HEADER_HEIGHT + (rowIndex * CONFIG.TABLE_ROW_HEIGHT);

    // 원본 셀 데이터
    const allCells = [
      `${classData.min} ~ ${classData.max}`,
      Utils.formatNumberClean(classData.midpoint),
      classData.frequency,
      `${Utils.formatNumberClean(classData.relativeFreq)}%`,
      classData.cumulativeFreq,
      `${Utils.formatNumberClean(classData.cumulativeRelFreq)}%`
    ];

    // columnOrder에 따라 재정렬
    const orderedCells = columnOrder.map(i => allCells[i]);

    // 표시할 셀만 필터링
    const cells = orderedCells.filter((_, i) => orderedVisibleColumns[i]);

    // 필터링된 원본 인덱스 배열 (계급 컬럼 판별용)
    const filteredOriginalIndices = columnOrder.filter((_, i) => orderedVisibleColumns[i]);

    let x = padding;

    cells.forEach((cellText, i) => {
      const label = filteredLabels[i];
      const originalIndex = filteredOriginalIndices[i]; // 원본 컬럼 인덱스
      const isClassColumn = originalIndex === 0; // 계급 컬럼 여부

      const cellLayer = new Layer({
        id: `frequency-${tableId}-table-row-${rowIndex}-col${i}`,
        name: String(cellText),
        type: 'cell',
        visible: true,
        order: i,
        data: {
          rowType: 'data',
          rowIndex,
          colIndex: i,
          colLabel: label,
          cellText: String(cellText),
          x,
          y,
          width: columnWidths[i],
          height: CONFIG.TABLE_ROW_HEIGHT,
          alignment: columnAlignment[label] || 'center',
          highlighted: false,
          highlightProgress: 0,
          // 상첨자 정보 (첫 행의 계급 컬럼인 경우)
          classData: rowIndex === 0 && isClassColumn ? classData : null,
          showSuperscript: rowIndex === 0 && isClassColumn ? showSuperscript : false,
          // 짝수 행 배경색 표시 여부
          isEvenRow: rowIndex % 2 === 1
        }
      });

      rowGroup.addChild(cellLayer);
      x += columnWidths[i];
    });

    return rowGroup;
  }

  /**
   * 합계 행 레이어 생성
   * @param {number} total - 전체 데이터 개수
   * @param {number} dataRowCount - 데이터 행 개수
   * @param {Array} columnWidths - 열 너비 배열
   * @param {Array} orderedVisibleColumns - 순서가 적용된 표시 컬럼 배열
   * @param {Array} columnOrder - 컬럼 순서 배열
   * @param {Object} columnAlignment - 컬럼별 정렬 설정
   * @param {number} padding - 패딩
   * @param {Array} filteredLabels - 필터링된 라벨 배열
   * @param {string} tableId - 테이블 고유 ID
   * @returns {Layer} 합계 행 그룹 레이어
   */
  static _createSummaryRowLayer(
    total,
    dataRowCount,
    columnWidths,
    orderedVisibleColumns,
    columnOrder,
    columnAlignment,
    padding,
    filteredLabels,
    tableId
  ) {
    const summaryGroup = new Layer({
      id: `frequency-${tableId}-table-summary`,
      name: '합계 행',
      type: 'group',
      visible: true,
      order: dataRowCount + 2, // 마지막 순서
      data: {}
    });

    const y = padding + CONFIG.TABLE_HEADER_HEIGHT + (dataRowCount * CONFIG.TABLE_ROW_HEIGHT);

    // 원본 셀 데이터 (계급, 계급값은 "합계"로 병합, 나머지는 값)
    const allCells = ['합계', '', total, '100%', total, '100%'];

    // columnOrder에 따라 재정렬
    const orderedCells = columnOrder.map(i => allCells[i]);

    // 표시할 셀만 필터링
    const filteredCells = orderedCells.filter((_, i) => orderedVisibleColumns[i]);

    let x = padding;
    let cellIndex = 0;

    filteredCells.forEach((cellText, i) => {
      const label = filteredLabels[i];

      // 모든 셀에 대해 레이어 생성
      const cellWidth = columnWidths[i];

      const cellLayer = new Layer({
          id: `frequency-${tableId}-table-summary-col${cellIndex}`,
          name: String(cellText),
          type: 'cell',
          visible: true,
          order: cellIndex,
          data: {
            rowType: 'summary',
            rowIndex: dataRowCount, // 합계는 마지막 인덱스
            colIndex: i,
            colLabel: label,
            cellText: String(cellText),
            x,
            y,
            width: cellWidth,
            height: CONFIG.TABLE_ROW_HEIGHT,
            alignment: columnAlignment[label] || 'center',
            highlighted: false,
            highlightProgress: 0
          }
      });

      summaryGroup.addChild(cellLayer);
      cellIndex++;

      // x 좌표는 항상 증가 (빈 칸이든 아니든)
      x += columnWidths[i];
    });

    return summaryGroup;
  }
}

export default TableLayerFactory;

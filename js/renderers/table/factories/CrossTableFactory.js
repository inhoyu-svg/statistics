/**
 * 이원 분류표 테이블 팩토리
 * 행: 카테고리 (혈액형 등), 열: 그룹 (남학생, 여학생 등)
 */

import CONFIG from '../../../config.js';
import { Layer } from '../../../animation/index.js';
import BaseTableFactory from './BaseTableFactory.js';

class CrossTableFactory {
  /**
   * 이원 분류표 레이어 생성
   * @param {LayerManager} layerManager - 레이어 매니저
   * @param {Object} data - 파싱된 데이터 { columnHeaders, rowHeaders, rows, totals, showTotal }
   * @param {Object} config - 테이블 설정
   * @param {string} tableId - 테이블 고유 ID
   */
  static createTableLayers(layerManager, data, config = null, tableId = 'table-1') {
    const { columnHeaders, rows, totals, showTotal = true } = data;

    // 열 개수: 행 라벨 열 + 데이터 열들
    const columnCount = columnHeaders.length + 1;
    // 행 개수: 데이터 행 + 합계 행 (옵션)
    const rowCount = rows.length + (showTotal ? 1 : 0);

    const padding = CONFIG.TABLE_PADDING;
    const canvasWidth = CONFIG.TABLE_CANVAS_WIDTH;
    const canvasHeight = BaseTableFactory.calculateCanvasHeight(rowCount, padding);

    // 열 너비 계산
    const columnWidths = this._calculateColumnWidths(canvasWidth, padding, columnCount);

    // 루트 레이어 생성
    const rootLayer = BaseTableFactory.createRootLayer({
      tableId,
      tableName: '이원 분류표',
      canvasWidth,
      canvasHeight,
      padding,
      columnCount,
      rowCount,
      tableType: CONFIG.TABLE_TYPES.CROSS_TABLE
    });

    // 격자선 레이어 (이원 분류표는 합계 행 있음)
    const gridLayer = BaseTableFactory.createGridLayer({
      canvasWidth,
      padding,
      rowCount,
      columnWidths,
      tableId,
      hasSummaryRow: showTotal
    });
    rootLayer.addChild(gridLayer);

    // 헤더 레이어
    const headerLayer = this._createHeaderLayer(columnHeaders, columnWidths, padding, tableId);
    rootLayer.addChild(headerLayer);

    // 데이터 행 레이어
    rows.forEach((row, rowIndex) => {
      const rowLayer = this._createDataRowLayer(
        row,
        rowIndex,
        columnWidths,
        padding,
        tableId
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
        tableId
      );
      rootLayer.addChild(summaryLayer);
    }

    // LayerManager에 추가
    layerManager.addLayer(rootLayer, 'root');
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
   * 헤더 레이어 생성
   */
  static _createHeaderLayer(columnHeaders, columnWidths, padding, tableId) {
    const headerGroup = new Layer({
      id: `${tableId}-table-header`,
      name: '헤더 행',
      type: 'group',
      visible: true,
      order: 1,
      data: {}
    });

    let x = padding;
    const y = padding;

    // 첫 번째 열은 "상대도수" 또는 빈 칸
    const allHeaders = ['상대도수', ...columnHeaders];

    allHeaders.forEach((header, i) => {
      const cellLayer = new Layer({
        id: `${tableId}-table-header-col${i}`,
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
   */
  static _createDataRowLayer(row, rowIndex, columnWidths, padding, tableId) {
    const rowGroup = new Layer({
      id: `${tableId}-table-row-${rowIndex}`,
      name: `데이터 행 ${rowIndex}`,
      type: 'group',
      visible: true,
      order: rowIndex + 2,
      data: { rowIndex }
    });

    const y = padding + CONFIG.TABLE_HEADER_HEIGHT + (rowIndex * CONFIG.TABLE_ROW_HEIGHT);
    let x = padding;

    // 첫 번째 열은 행 라벨 (혈액형)
    const cells = [row.label, ...row.values];

    cells.forEach((cellText, colIndex) => {
      const isLabelColumn = colIndex === 0;

      // 값 포맷팅 (소수점인 경우)
      let displayText = cellText;
      if (typeof cellText === 'number' && !isLabelColumn) {
        displayText = cellText.toFixed(2).replace(/\.?0+$/, '');
      }

      const cellLayer = new Layer({
        id: `${tableId}-table-row-${rowIndex}-col${colIndex}`,
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
          isLabelColumn
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
  static _createSummaryRowLayer(totals, dataRowCount, columnWidths, padding, tableId) {
    const summaryGroup = new Layer({
      id: `${tableId}-table-summary`,
      name: '합계 행',
      type: 'group',
      visible: true,
      order: dataRowCount + 2,
      data: {}
    });

    const y = padding + CONFIG.TABLE_HEADER_HEIGHT + (dataRowCount * CONFIG.TABLE_ROW_HEIGHT);
    let x = padding;

    // 첫 번째 열은 "합계"
    const cells = ['합계', ...totals];

    cells.forEach((cellText, colIndex) => {
      let displayText = cellText;
      if (typeof cellText === 'number') {
        displayText = cellText.toFixed(2).replace(/\.?0+$/, '');
      }

      const cellLayer = new Layer({
        id: `${tableId}-table-summary-col${colIndex}`,
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

export default CrossTableFactory;

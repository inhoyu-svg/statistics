/**
 * 카테고리 행렬 테이블 팩토리
 * 가로: 카테고리, 세로: 데이터 종류
 */

import CONFIG from '../../../config.js';
import { Layer } from '../../../animation/index.js';
import BaseTableFactory from './BaseTableFactory.js';

class CategoryMatrixFactory {
  /**
   * 카테고리 행렬 테이블 레이어 생성
   * @param {LayerManager} layerManager - 레이어 매니저
   * @param {Object} data - 파싱된 데이터 { headers: [], rows: [{ label, values }] }
   * @param {Object} config - 테이블 설정
   * @param {string} tableId - 테이블 고유 ID
   */
  static createTableLayers(layerManager, data, config = null, tableId = 'table-1') {
    const { headers, rows } = data;

    // 첫 번째 열은 행 라벨, 나머지는 데이터
    const columnCount = headers.length + 1; // +1 for row label column
    const rowCount = rows.length; // 합계 행 없음

    const padding = CONFIG.TABLE_PADDING;
    const canvasWidth = CONFIG.TABLE_CANVAS_WIDTH;
    const canvasHeight = BaseTableFactory.calculateCanvasHeight(rowCount, padding);

    // 열 너비 계산 (첫 번째 열은 더 넓게)
    const columnWidths = this._calculateColumnWidths(canvasWidth, padding, columnCount);

    // 루트 레이어 생성
    const rootLayer = BaseTableFactory.createRootLayer({
      tableId,
      tableName: '카테고리 행렬',
      canvasWidth,
      canvasHeight,
      padding,
      columnCount,
      rowCount,
      tableType: CONFIG.TABLE_TYPES.CATEGORY_MATRIX
    });

    // 격자선 레이어 (카테고리 행렬은 합계 행 없음)
    const gridLayer = BaseTableFactory.createGridLayer({
      canvasWidth,
      padding,
      rowCount,
      columnWidths,
      tableId,
      tableType: CONFIG.TABLE_TYPES.CATEGORY_MATRIX,
      hasSummaryRow: false
    });
    rootLayer.addChild(gridLayer);

    // 헤더 레이어 (첫 열은 빈 칸 또는 라벨)
    const headerLayer = this._createHeaderLayer(headers, columnWidths, padding, tableId);
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

    // LayerManager에 추가
    layerManager.addLayer(rootLayer, 'root');
  }

  /**
   * 열 너비 계산 (첫 번째 열은 더 넓게)
   */
  static _calculateColumnWidths(canvasWidth, padding, columnCount) {
    const totalWidth = canvasWidth - padding * 2;
    // 첫 번째 열(라벨)은 30%, 나머지는 균등 분배
    const labelColumnWidth = totalWidth * 0.3;
    const dataColumnWidth = (totalWidth * 0.7) / (columnCount - 1);

    return [labelColumnWidth, ...Array(columnCount - 1).fill(dataColumnWidth)];
  }

  /**
   * 헤더 레이어 생성
   */
  static _createHeaderLayer(headers, columnWidths, padding, tableId) {
    const headerGroup = new Layer({
      id: `category-matrix-${tableId}-table-header`,
      name: '헤더 행',
      type: 'group',
      visible: true,
      order: 1,
      data: {}
    });

    let x = padding;
    const y = padding;

    // 첫 번째 열은 빈 칸
    const allHeaders = ['', ...headers];

    allHeaders.forEach((header, i) => {
      const cellLayer = new Layer({
        id: `category-matrix-${tableId}-table-header-col${i}`,
        name: header || '(빈 셀)',
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
          headerTextColor: '#FFFFFF'
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
      id: `category-matrix-${tableId}-table-row-${rowIndex}`,
      name: `데이터 행 ${rowIndex}`,
      type: 'group',
      visible: true,
      order: rowIndex + 2,
      data: { rowIndex }
    });

    const y = padding + CONFIG.TABLE_HEADER_HEIGHT + (rowIndex * CONFIG.TABLE_ROW_HEIGHT);
    let x = padding;

    // 첫 번째 열은 행 라벨
    const cells = [row.label, ...row.values];

    cells.forEach((cellText, colIndex) => {
      const isLabelColumn = colIndex === 0;

      const cellLayer = new Layer({
        id: `category-matrix-${tableId}-table-row-${rowIndex}-col${colIndex}`,
        name: String(cellText),
        type: 'cell',
        visible: true,
        order: colIndex,
        data: {
          rowType: isLabelColumn ? 'row-header' : 'data',
          rowIndex,
          colIndex,
          colLabel: '',
          cellText: String(cellText),
          x,
          y,
          width: columnWidths[colIndex],
          height: CONFIG.TABLE_ROW_HEIGHT,
          alignment: isLabelColumn ? 'center' : 'center',
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
}

export default CategoryMatrixFactory;

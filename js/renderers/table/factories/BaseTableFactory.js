/**
 * 테이블 팩토리 기본 클래스
 * 공통 레이어 생성 로직
 */

import CONFIG from '../../../config.js';
import { Layer } from '../../../animation/index.js';

class BaseTableFactory {
  /**
   * 열 너비 계산
   * @param {number} canvasWidth - Canvas 너비
   * @param {number} padding - 패딩
   * @param {number} columnCount - 표시할 열 개수
   * @param {Array<number>} customWidths - 커스텀 열 너비 비율 (선택)
   * @returns {Array} 각 열의 너비 배열
   */
  static calculateColumnWidths(canvasWidth, padding, columnCount, customWidths = null) {
    const totalWidth = canvasWidth - padding * 2;

    if (customWidths && customWidths.length === columnCount) {
      const totalRatio = customWidths.reduce((a, b) => a + b, 0);
      return customWidths.map(ratio => (ratio / totalRatio) * totalWidth);
    }

    const widthPerColumn = totalWidth / columnCount;
    return Array(columnCount).fill(widthPerColumn);
  }

  /**
   * 격자선 레이어 생성
   * @param {Object} options - 옵션
   * @returns {Layer} 격자선 레이어
   */
  static createGridLayer(options) {
    const {
      canvasWidth,
      padding,
      rowCount,
      columnWidths,
      tableId,
      headerHeight = CONFIG.TABLE_HEADER_HEIGHT,
      rowHeight = CONFIG.TABLE_ROW_HEIGHT
    } = options;

    const totalWidth = canvasWidth - padding * 2;
    const totalHeight = headerHeight + (rowCount * rowHeight);

    return new Layer({
      id: `${tableId}-table-grid`,
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
        headerHeight,
        rowHeight
      }
    });
  }

  /**
   * 헤더 행 레이어 생성
   * @param {Object} options - 옵션
   * @returns {Layer} 헤더 그룹 레이어
   */
  static createHeaderLayer(options) {
    const {
      headers,
      columnWidths,
      columnAlignment = {},
      padding,
      tableId,
      headerHeight = CONFIG.TABLE_HEADER_HEIGHT,
      rowHeaderLabel = null  // 행 헤더 컬럼 라벨 (이원 분류표용)
    } = options;

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

    // 행 헤더 컬럼이 있는 경우 (이원 분류표)
    const allHeaders = rowHeaderLabel ? [rowHeaderLabel, ...headers] : headers;

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
          height: headerHeight,
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
   * 데이터 셀 레이어 생성
   * @param {Object} options - 옵션
   * @returns {Layer} 셀 레이어
   */
  static createCellLayer(options) {
    const {
      tableId,
      rowIndex,
      colIndex,
      cellText,
      x,
      y,
      width,
      height = CONFIG.TABLE_ROW_HEIGHT,
      alignment = 'center',
      rowType = 'data',
      colLabel = ''
    } = options;

    return new Layer({
      id: `${tableId}-table-row-${rowIndex}-col${colIndex}`,
      name: String(cellText),
      type: 'cell',
      visible: true,
      order: colIndex,
      data: {
        rowType,
        rowIndex,
        colIndex,
        colLabel,
        cellText: String(cellText),
        x,
        y,
        width,
        height,
        alignment,
        highlighted: false,
        highlightProgress: 0,
        isEvenRow: rowIndex % 2 === 1
      }
    });
  }

  /**
   * 루트 레이어 생성
   * @param {Object} options - 옵션
   * @returns {Layer} 루트 레이어
   */
  static createRootLayer(options) {
    const {
      tableId,
      tableName,
      canvasWidth,
      canvasHeight,
      padding,
      columnCount,
      rowCount,
      tableType
    } = options;

    return new Layer({
      id: `${tableId}-table-root`,
      name: tableName,
      type: 'group',
      visible: true,
      order: 0,
      data: {
        canvasWidth,
        canvasHeight,
        padding,
        columnCount,
        rowCount,
        tableType
      }
    });
  }

  /**
   * Canvas 높이 계산
   * @param {number} rowCount - 행 개수 (헤더 제외)
   * @param {number} padding - 패딩
   * @param {number} headerHeight - 헤더 높이
   * @param {number} rowHeight - 행 높이
   * @returns {number} Canvas 높이
   */
  static calculateCanvasHeight(rowCount, padding, headerHeight = CONFIG.TABLE_HEADER_HEIGHT, rowHeight = CONFIG.TABLE_ROW_HEIGHT) {
    return headerHeight + (rowCount * rowHeight) + padding * 2;
  }
}

export default BaseTableFactory;

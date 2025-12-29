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
      tableType = '',
      headerHeight = CONFIG.TABLE_HEADER_HEIGHT,
      rowHeight = CONFIG.TABLE_ROW_HEIGHT,
      hasSummaryRow = false
    } = options;

    const totalWidth = canvasWidth - padding * 2;
    const totalHeight = headerHeight + (rowCount * rowHeight);
    const idPrefix = tableType ? `${tableType}-` : '';

    return new Layer({
      id: `${idPrefix}${tableId}-table-grid`,
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
        rowHeight,
        hasSummaryRow
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
      tableType = '',
      headerHeight = CONFIG.TABLE_HEADER_HEIGHT,
      rowHeaderLabel = null  // 행 헤더 컬럼 라벨 (이원 분류표용)
    } = options;

    const idPrefix = tableType ? `${tableType}-` : '';

    const headerGroup = new Layer({
      id: `${idPrefix}${tableId}-table-header`,
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
        id: `${idPrefix}${tableId}-table-header-col${i}`,
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
      tableType = '',
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

    const idPrefix = tableType ? `${tableType}-` : '';

    return new Layer({
      id: `${idPrefix}${tableId}-table-row-${rowIndex}-col${colIndex}`,
      name: cellText === null ? '' : String(cellText),
      type: 'cell',
      visible: true,
      order: colIndex,
      data: {
        rowType,
        rowIndex,
        colIndex,
        colLabel,
        cellText: cellText === null ? null : String(cellText),
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
      tableType = ''
    } = options;

    const idPrefix = tableType ? `${tableType}-` : '';

    return new Layer({
      id: `${idPrefix}${tableId}-table-root`,
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

  /**
   * 텍스트 너비 측정
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {string} text - 측정할 텍스트
   * @param {string} font - 폰트 설정
   * @returns {number} 텍스트 너비 (px)
   */
  static measureTextWidth(ctx, text, font) {
    ctx.font = font;
    // 상첨자 표기 제거 후 측정 (^{...} 또는 ^x)
    const cleanText = this.stripSuperscript(String(text));
    return ctx.measureText(cleanText).width;
  }

  /**
   * 상첨자 표기 제거
   * @param {string} text - 원본 텍스트
   * @returns {string} 상첨자 표기가 제거된 텍스트
   */
  static stripSuperscript(text) {
    // ^{...} 형식 제거
    let result = text.replace(/\^{[^}]*}/g, '');
    // ^x (단일 문자) 형식 제거
    result = result.replace(/\^[^\s{]/g, '');
    return result;
  }

  /**
   * 테이블 동적 너비 계산
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {Array<string>} headers - 헤더 텍스트 배열
   * @param {Array<Array<string>>} rows - 2차원 행 데이터 배열
   * @param {Object} options - 옵션
   * @returns {Object} { columnWidths: Array, totalWidth: number }
   */
  static calculateDynamicWidths(ctx, headers, rows, options = {}) {
    const {
      headerFont = CONFIG.TABLE_FONT_HEADER,
      dataFont = '24px KaTeX_Main, Times New Roman, serif',  // 실제 렌더링 폰트와 동일
      cellPadding = 32,   // 좌우 합계 (넉넉하게)
      headerExtraPadding = 16  // 헤더 추가 패딩
    } = options;

    const columnCount = headers.length;
    const columnWidths = [];

    // 각 컬럼별 최대 너비 계산
    for (let col = 0; col < columnCount; col++) {
      // 헤더 너비 (긴 헤더는 패딩 절반으로 줄임)
      const headerText = headers[col] || '';
      const isLongHeader = headerText.length >= 15;
      const actualCellPadding = isLongHeader ? cellPadding / 2 : cellPadding;
      const extraPadding = isLongHeader ? 0 : headerExtraPadding;
      const headerWidth = this.measureTextWidth(ctx, headerText, headerFont) + actualCellPadding + extraPadding;

      // 데이터 셀 중 최대 너비
      let maxDataWidth = 0;
      for (const row of rows) {
        if (row[col] !== undefined && row[col] !== null) {
          const cellText = String(row[col]);
          // 상첨자가 있으면 추가 패딩 (상첨자 텍스트도 렌더링되므로)
          const hasSuperscript = /\^/.test(cellText);
          const superscriptPadding = hasSuperscript ? 40 : 0;
          const dataWidth = this.measureTextWidth(ctx, cellText, dataFont) + cellPadding + superscriptPadding;
          maxDataWidth = Math.max(maxDataWidth, dataWidth);
        }
      }

      // 헤더와 데이터 중 큰 값 선택
      columnWidths.push(Math.max(headerWidth, maxDataWidth));
    }

    // 총 너비 계산
    const contentWidth = columnWidths.reduce((sum, w) => sum + w, 0);
    const totalWidth = contentWidth + CONFIG.TABLE_PADDING * 2;

    // 최소/최대 너비 제한 적용
    const clampedWidth = Math.max(
      CONFIG.TABLE_MIN_WIDTH,
      Math.min(CONFIG.TABLE_MAX_WIDTH, totalWidth)
    );

    // 너비 제한으로 인한 조정이 필요한 경우 비율 조정
    if (clampedWidth !== totalWidth) {
      const targetContentWidth = clampedWidth - CONFIG.TABLE_PADDING * 2;
      const ratio = targetContentWidth / contentWidth;
      return {
        columnWidths: columnWidths.map(w => w * ratio),
        canvasWidth: clampedWidth
      };
    }

    return { columnWidths, canvasWidth: totalWidth };
  }
}

export default BaseTableFactory;

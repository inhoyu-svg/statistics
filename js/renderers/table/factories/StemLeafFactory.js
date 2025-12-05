/**
 * 줄기-잎 그림 테이블 팩토리
 * 단일 모드: 줄기 | 잎 (2열)
 * 비교 모드: 잎 | 줄기 | 잎 (3열)
 */

import CONFIG from '../../../config.js';
import { Layer } from '../../../animation/index.js';
import BaseTableFactory from './BaseTableFactory.js';

class StemLeafFactory {
  /**
   * 줄기-잎 그림 레이어 생성
   * @param {LayerManager} layerManager - 레이어 매니저
   * @param {Object} data - 파싱된 데이터 { isSingleMode, stems, ... }
   * @param {Object} config - 테이블 설정
   * @param {string} tableId - 테이블 고유 ID
   */
  static createTableLayers(layerManager, data, config = null, tableId = 'table-1') {
    // 단일/비교 모드 분기
    if (data.isSingleMode) {
      this._createSingleModeTableLayers(layerManager, data, config, tableId);
    } else {
      this._createCompareModeTableLayers(layerManager, data, config, tableId);
    }
  }

  /**
   * 동적 너비 계산 (외부 호출용)
   * @param {Object} data - 파싱된 데이터 { isSingleMode, stems, leftLabel, rightLabel }
   * @returns {Object} { canvasWidth, columnWidths }
   */
  static calculateDynamicWidths(data) {
    if (data.isSingleMode) {
      return this._calculateSingleModeDynamicWidths(data.stems);
    } else {
      return this._calculateCompareModeDynamicWidths(data.stems, data.leftLabel, data.rightLabel);
    }
  }

  /**
   * 텍스트 측정용 임시 캔버스 컨텍스트 생성
   * @returns {CanvasRenderingContext2D}
   */
  static _createMeasureContext() {
    const tempCanvas = document.createElement('canvas');
    return tempCanvas.getContext('2d');
  }

  // =============================================
  // 단일 모드 (줄기 | 잎) - 2열
  // =============================================

  /**
   * 단일 모드 동적 너비 계산
   * @param {Array} stems - 줄기 데이터 배열
   * @returns {Object} { canvasWidth, columnWidths }
   */
  static _calculateSingleModeDynamicWidths(stems) {
    const ctx = this._createMeasureContext();
    const padding = CONFIG.TABLE_PADDING;
    const cellPadding = 32;
    const headerExtraPadding = 16;

    // 줄기 컬럼 너비 계산
    ctx.font = CONFIG.TABLE_FONT_HEADER;
    const stemHeaderWidth = ctx.measureText('줄기').width + cellPadding + headerExtraPadding;

    ctx.font = '24px KaTeX_Main, Times New Roman, serif';
    let maxStemDataWidth = 0;
    stems.forEach(s => {
      const width = ctx.measureText(String(s.stem)).width + cellPadding;
      maxStemDataWidth = Math.max(maxStemDataWidth, width);
    });
    const stemColWidth = Math.max(stemHeaderWidth, maxStemDataWidth);

    // 잎 컬럼 너비 계산
    ctx.font = CONFIG.TABLE_FONT_HEADER;
    const leafHeaderWidth = ctx.measureText('잎').width + cellPadding + headerExtraPadding;

    ctx.font = '24px KaTeX_Main, Times New Roman, serif';
    let maxLeafDataWidth = 0;
    stems.forEach(s => {
      // 잎 데이터는 공백으로 구분 (6칸 간격)
      const leafStr = s.leaves.join('      ');
      const width = ctx.measureText(leafStr).width + cellPadding;
      maxLeafDataWidth = Math.max(maxLeafDataWidth, width);
    });
    const leafColWidth = Math.max(leafHeaderWidth, maxLeafDataWidth);

    // 총 너비 계산 (제한 없음)
    const contentWidth = stemColWidth + leafColWidth;
    const canvasWidth = contentWidth + padding * 2;

    return {
      canvasWidth,
      columnWidths: [stemColWidth, leafColWidth]
    };
  }

  /**
   * 단일 모드 테이블 레이어 생성
   */
  static _createSingleModeTableLayers(layerManager, data, config, tableId) {
    const { stems } = data;

    const columnCount = 2;  // 줄기 | 잎
    const rowCount = stems.length;

    const padding = CONFIG.TABLE_PADDING;

    // 동적 너비 계산
    const { canvasWidth, columnWidths } = this._calculateSingleModeDynamicWidths(stems);
    const canvasHeight = BaseTableFactory.calculateCanvasHeight(rowCount, padding);

    // 전체 잎 중 최대 개수 계산 (폰트 크기 일관성용)
    const maxLeafCount = Math.max(...stems.map(s => s.leaves.length));

    // 루트 레이어 생성
    const rootLayer = BaseTableFactory.createRootLayer({
      tableId,
      tableName: '줄기-잎 그림',
      canvasWidth,
      canvasHeight,
      padding,
      columnCount,
      rowCount,
      tableType: CONFIG.TABLE_TYPES.STEM_LEAF
    });

    // 격자선 레이어
    const gridLayer = this._createSingleModeGridLayer(canvasWidth, padding, rowCount, columnWidths, tableId);
    rootLayer.addChild(gridLayer);

    // 헤더 레이어
    const headerLayer = this._createSingleModeHeaderLayer(columnWidths, padding, tableId);
    rootLayer.addChild(headerLayer);

    // 데이터 행 레이어
    stems.forEach((stemData, rowIndex) => {
      const rowLayer = this._createSingleModeRowLayer(stemData, rowIndex, columnWidths, padding, tableId, maxLeafCount);
      rootLayer.addChild(rowLayer);
    });

    // LayerManager에 추가
    layerManager.addLayer(rootLayer, 'root');
  }

  /**
   * 단일 모드 격자선 레이어 생성
   */
  static _createSingleModeGridLayer(canvasWidth, padding, rowCount, columnWidths, tableId) {
    const totalWidth = canvasWidth - padding * 2;
    const totalHeight = CONFIG.TABLE_HEADER_HEIGHT + (rowCount * CONFIG.TABLE_ROW_HEIGHT);

    return new Layer({
      id: `stem-leaf-${tableId}-table-grid`,
      name: '격자선',
      type: 'stem-leaf-single-grid',  // 단일 모드 전용 타입
      visible: true,
      order: 0,
      data: {
        x: padding,
        y: padding,
        width: totalWidth,
        height: totalHeight,
        rowCount,
        columnWidths,
        isSingleMode: true,
        // 줄기 열 오른쪽 세로선 위치
        stemColumnEnd: padding + columnWidths[0]
      }
    });
  }

  /**
   * 단일 모드 헤더 레이어 생성
   */
  static _createSingleModeHeaderLayer(columnWidths, padding, tableId) {
    const headerGroup = new Layer({
      id: `stem-leaf-${tableId}-table-header`,
      name: '헤더 행',
      type: 'group',
      visible: true,
      order: 1,
      data: {}
    });

    const y = padding;
    const headers = [
      { text: '줄기', align: 'center' },
      { text: '잎', align: 'center' }
    ];

    let x = padding;
    headers.forEach((header, i) => {
      const cellLayer = new Layer({
        id: `stem-leaf-${tableId}-table-header-col${i}`,
        name: header.text,
        type: 'cell',
        visible: true,
        order: i,
        data: {
          rowType: 'header',
          rowIndex: -1,
          colIndex: i,
          colLabel: header.text,
          cellText: header.text,
          x,
          y,
          width: columnWidths[i],
          height: CONFIG.TABLE_HEADER_HEIGHT,
          alignment: header.align,
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
   * 단일 모드 데이터 행 레이어 생성
   * @param {number} maxLeafCount - 전체 최대 잎 개수 (폰트 크기 일관성용)
   */
  static _createSingleModeRowLayer(stemData, rowIndex, columnWidths, padding, tableId, maxLeafCount) {
    const rowGroup = new Layer({
      id: `stem-leaf-${tableId}-table-row-${rowIndex}`,
      name: `줄기 ${stemData.stem}`,
      type: 'group',
      visible: true,
      order: rowIndex + 2,
      data: { rowIndex, stem: stemData.stem }
    });

    const y = padding + CONFIG.TABLE_HEADER_HEIGHT + (rowIndex * CONFIG.TABLE_ROW_HEIGHT);
    let x = padding;

    // 줄기 (가운데 정렬)
    const stemCell = new Layer({
      id: `stem-leaf-${tableId}-table-row-${rowIndex}-col0`,
      name: `줄기: ${stemData.stem}`,
      type: 'cell',
      visible: true,
      order: 0,
      data: {
        rowType: 'stem-leaf-stem',
        rowIndex,
        colIndex: 0,
        colLabel: 'stem',
        cellText: String(stemData.stem),
        x,
        y,
        width: columnWidths[0],
        height: CONFIG.TABLE_ROW_HEIGHT,
        alignment: 'center',
        highlighted: false,
        highlightProgress: 0,
        isEvenRow: rowIndex % 2 === 1,
        stem: stemData.stem
      }
    });
    rowGroup.addChild(stemCell);
    x += columnWidths[0];

    // 잎 (왼쪽 정렬, 오름차순)
    const leavesText = stemData.leaves.join('      ');
    // 비숫자 값이 포함되어 있으면 isVariable = true (_, x, A 등)
    const hasVariable = stemData.leaves.some(leaf =>
      typeof leaf === 'string' && !/^\d+$/.test(String(leaf).trim())
    );
    const leavesCell = new Layer({
      id: `stem-leaf-${tableId}-table-row-${rowIndex}-col1`,
      name: `잎: ${leavesText}`,
      type: 'cell',
      visible: true,
      order: 1,
      data: {
        rowType: 'stem-leaf-data',
        rowIndex,
        colIndex: 1,
        colLabel: 'leaves',
        cellText: leavesText,
        x,
        y,
        width: columnWidths[1],
        height: CONFIG.TABLE_ROW_HEIGHT,
        alignment: 'left',
        highlighted: false,
        highlightProgress: 0,
        isEvenRow: rowIndex % 2 === 1,
        leaves: stemData.leaves,
        maxLeafCount,
        isSingleMode: true,
        isVariable: hasVariable
      }
    });
    rowGroup.addChild(leavesCell);

    return rowGroup;
  }

  // =============================================
  // 비교 모드 (잎 | 줄기 | 잎) - 3열
  // =============================================

  /**
   * 비교 모드 동적 너비 계산
   * @param {Array} stems - 줄기 데이터 배열 (leftLeaves, stem, rightLeaves)
   * @param {string} leftLabel - 왼쪽 라벨
   * @param {string} rightLabel - 오른쪽 라벨
   * @returns {Object} { canvasWidth, columnWidths }
   */
  static _calculateCompareModeDynamicWidths(stems, leftLabel, rightLabel) {
    const ctx = this._createMeasureContext();
    const padding = CONFIG.TABLE_PADDING;
    const cellPadding = 32;
    const headerExtraPadding = 16;

    // 왼쪽 잎 컬럼 너비 계산
    ctx.font = CONFIG.TABLE_FONT_HEADER;
    const leftHeaderWidth = ctx.measureText(`잎(${leftLabel})`).width + cellPadding + headerExtraPadding;

    ctx.font = '24px KaTeX_Main, Times New Roman, serif';
    let maxLeftLeafWidth = 0;
    stems.forEach(s => {
      const leafStr = s.leftLeaves.join('      ');
      const width = ctx.measureText(leafStr).width + cellPadding;
      maxLeftLeafWidth = Math.max(maxLeftLeafWidth, width);
    });
    const leftColWidth = Math.max(leftHeaderWidth, maxLeftLeafWidth);

    // 줄기 컬럼 너비 계산
    ctx.font = CONFIG.TABLE_FONT_HEADER;
    const stemHeaderWidth = ctx.measureText('줄기').width + cellPadding + headerExtraPadding;

    ctx.font = '24px KaTeX_Main, Times New Roman, serif';
    let maxStemDataWidth = 0;
    stems.forEach(s => {
      const width = ctx.measureText(String(s.stem)).width + cellPadding;
      maxStemDataWidth = Math.max(maxStemDataWidth, width);
    });
    const stemColWidth = Math.max(stemHeaderWidth, maxStemDataWidth);

    // 오른쪽 잎 컬럼 너비 계산
    ctx.font = CONFIG.TABLE_FONT_HEADER;
    const rightHeaderWidth = ctx.measureText(`잎(${rightLabel})`).width + cellPadding + headerExtraPadding;

    ctx.font = '24px KaTeX_Main, Times New Roman, serif';
    let maxRightLeafWidth = 0;
    stems.forEach(s => {
      const leafStr = s.rightLeaves.join('      ');
      const width = ctx.measureText(leafStr).width + cellPadding;
      maxRightLeafWidth = Math.max(maxRightLeafWidth, width);
    });
    const rightColWidth = Math.max(rightHeaderWidth, maxRightLeafWidth);

    // 왼쪽/오른쪽 잎 컬럼 너비를 동일하게 맞춤 (대칭)
    const leafColWidth = Math.max(leftColWidth, rightColWidth);

    // 총 너비 계산 (제한 없음)
    const contentWidth = leafColWidth + stemColWidth + leafColWidth;
    const canvasWidth = contentWidth + padding * 2;

    return {
      canvasWidth,
      columnWidths: [leafColWidth, stemColWidth, leafColWidth]
    };
  }

  /**
   * 비교 모드 테이블 레이어 생성
   */
  static _createCompareModeTableLayers(layerManager, data, config, tableId) {
    const { leftLabel, rightLabel, stems } = data;

    // 열: 왼쪽 잎 | 줄기 | 오른쪽 잎
    const columnCount = 3;
    // 행: 헤더 + 줄기 개수
    const rowCount = stems.length;

    const padding = CONFIG.TABLE_PADDING;

    // 동적 너비 계산
    const { canvasWidth, columnWidths } = this._calculateCompareModeDynamicWidths(stems, leftLabel, rightLabel);
    const canvasHeight = BaseTableFactory.calculateCanvasHeight(rowCount, padding);

    // 전체 잎 중 최대 개수 계산 (왼쪽/오른쪽 모두 고려, 폰트 크기 일관성용)
    const maxLeafCount = Math.max(
      ...stems.map(s => s.leftLeaves.length),
      ...stems.map(s => s.rightLeaves.length)
    );

    // 루트 레이어 생성
    const rootLayer = BaseTableFactory.createRootLayer({
      tableId,
      tableName: '줄기-잎 그림',
      canvasWidth,
      canvasHeight,
      padding,
      columnCount,
      rowCount,
      tableType: CONFIG.TABLE_TYPES.STEM_LEAF
    });

    // 격자선 레이어 (줄기-잎은 특수 격자)
    const gridLayer = this._createCompareModeGridLayer(canvasWidth, padding, rowCount, columnWidths, tableId);
    rootLayer.addChild(gridLayer);

    // 헤더 레이어
    const headerLayer = this._createCompareModeHeaderLayer(leftLabel, rightLabel, columnWidths, padding, tableId);
    rootLayer.addChild(headerLayer);

    // 줄기-잎 데이터 행 레이어
    stems.forEach((stemData, rowIndex) => {
      const rowLayer = this._createCompareModeRowLayer(
        stemData,
        rowIndex,
        columnWidths,
        padding,
        tableId,
        maxLeafCount
      );
      rootLayer.addChild(rowLayer);
    });

    // LayerManager에 추가
    layerManager.addLayer(rootLayer, 'root');
  }

  /**
   * 비교 모드 격자선 레이어 생성 (줄기 열 좌우에 세로선)
   */
  static _createCompareModeGridLayer(canvasWidth, padding, rowCount, columnWidths, tableId) {
    const totalWidth = canvasWidth - padding * 2;
    const totalHeight = CONFIG.TABLE_HEADER_HEIGHT + (rowCount * CONFIG.TABLE_ROW_HEIGHT);

    return new Layer({
      id: `stem-leaf-${tableId}-table-grid`,
      name: '격자선',
      type: 'stem-leaf-grid', // 특수 타입
      visible: true,
      order: 0,
      data: {
        x: padding,
        y: padding,
        width: totalWidth,
        height: totalHeight,
        rowCount,
        columnWidths,
        // 줄기 열 좌우 세로선 위치
        stemColumnStart: padding + columnWidths[0],
        stemColumnEnd: padding + columnWidths[0] + columnWidths[1]
      }
    });
  }

  /**
   * 비교 모드 헤더 레이어 생성
   */
  static _createCompareModeHeaderLayer(leftLabel, rightLabel, columnWidths, padding, tableId) {
    const headerGroup = new Layer({
      id: `stem-leaf-${tableId}-table-header`,
      name: '헤더 행',
      type: 'group',
      visible: true,
      order: 1,
      data: {}
    });

    const y = padding;
    const headers = [
      { text: `잎(${leftLabel})`, align: 'center' },
      { text: '줄기', align: 'center' },
      { text: `잎(${rightLabel})`, align: 'center' }
    ];

    let x = padding;
    headers.forEach((header, i) => {
      const cellLayer = new Layer({
        id: `stem-leaf-${tableId}-table-header-col${i}`,
        name: header.text,
        type: 'cell',
        visible: true,
        order: i,
        data: {
          rowType: 'header',
          rowIndex: -1,
          colIndex: i,
          colLabel: header.text,
          cellText: header.text,
          x,
          y,
          width: columnWidths[i],
          height: CONFIG.TABLE_HEADER_HEIGHT,
          alignment: header.align,
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
   * 비교 모드 데이터 행 레이어 생성
   * @param {number} maxLeafCount - 전체 최대 잎 개수 (폰트 크기 일관성용)
   */
  static _createCompareModeRowLayer(stemData, rowIndex, columnWidths, padding, tableId, maxLeafCount) {
    const rowGroup = new Layer({
      id: `stem-leaf-${tableId}-table-row-${rowIndex}`,
      name: `줄기 ${stemData.stem}`,
      type: 'group',
      visible: true,
      order: rowIndex + 2,
      data: { rowIndex, stem: stemData.stem }
    });

    const y = padding + CONFIG.TABLE_HEADER_HEIGHT + (rowIndex * CONFIG.TABLE_ROW_HEIGHT);
    let x = padding;

    // 왼쪽 잎 (오른쪽 정렬, 내림차순)
    const leftLeavesText = stemData.leftLeaves.join('      ');
    // 비숫자 값이 포함되어 있으면 isVariable = true
    const leftHasVariable = stemData.leftLeaves.some(leaf =>
      typeof leaf === 'string' && !/^\d+$/.test(String(leaf).trim())
    );
    const leftCell = new Layer({
      id: `stem-leaf-${tableId}-table-row-${rowIndex}-col0`,
      name: `왼쪽 잎: ${leftLeavesText}`,
      type: 'cell',
      visible: true,
      order: 0,
      data: {
        rowType: 'stem-leaf-data',
        rowIndex,
        colIndex: 0,
        colLabel: 'left-leaves',
        cellText: leftLeavesText,
        x,
        y,
        width: columnWidths[0],
        height: CONFIG.TABLE_ROW_HEIGHT,
        alignment: 'right',
        highlighted: false,
        highlightProgress: 0,
        isEvenRow: rowIndex % 2 === 1,
        leaves: stemData.leftLeaves,
        maxLeafCount,
        isSingleMode: false,
        isVariable: leftHasVariable
      }
    });
    rowGroup.addChild(leftCell);
    x += columnWidths[0];

    // 줄기 (가운데 정렬)
    const stemCell = new Layer({
      id: `stem-leaf-${tableId}-table-row-${rowIndex}-col1`,
      name: `줄기: ${stemData.stem}`,
      type: 'cell',
      visible: true,
      order: 1,
      data: {
        rowType: 'stem-leaf-stem',
        rowIndex,
        colIndex: 1,
        colLabel: 'stem',
        cellText: String(stemData.stem),
        x,
        y,
        width: columnWidths[1],
        height: CONFIG.TABLE_ROW_HEIGHT,
        alignment: 'center',
        highlighted: false,
        highlightProgress: 0,
        isEvenRow: rowIndex % 2 === 1,
        stem: stemData.stem
      }
    });
    rowGroup.addChild(stemCell);
    x += columnWidths[1];

    // 오른쪽 잎 (왼쪽 정렬, 오름차순)
    const rightLeavesText = stemData.rightLeaves.join('      ');
    // 비숫자 값이 포함되어 있으면 isVariable = true
    const rightHasVariable = stemData.rightLeaves.some(leaf =>
      typeof leaf === 'string' && !/^\d+$/.test(String(leaf).trim())
    );
    const rightCell = new Layer({
      id: `stem-leaf-${tableId}-table-row-${rowIndex}-col2`,
      name: `오른쪽 잎: ${rightLeavesText}`,
      type: 'cell',
      visible: true,
      order: 2,
      data: {
        rowType: 'stem-leaf-data',
        rowIndex,
        colIndex: 2,
        colLabel: 'right-leaves',
        cellText: rightLeavesText,
        x,
        y,
        width: columnWidths[2],
        height: CONFIG.TABLE_ROW_HEIGHT,
        alignment: 'left',
        highlighted: false,
        highlightProgress: 0,
        isEvenRow: rowIndex % 2 === 1,
        leaves: stemData.rightLeaves,
        maxLeafCount,
        isSingleMode: false,
        isVariable: rightHasVariable
      }
    });
    rowGroup.addChild(rightCell);

    return rowGroup;
  }
}

export default StemLeafFactory;

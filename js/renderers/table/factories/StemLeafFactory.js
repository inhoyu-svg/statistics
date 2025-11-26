/**
 * 줄기-잎 그림 테이블 팩토리
 * 가운데 줄기, 양쪽에 잎 데이터
 */

import CONFIG from '../../../config.js';
import { Layer } from '../../../animation/index.js';
import BaseTableFactory from './BaseTableFactory.js';

class StemLeafFactory {
  /**
   * 줄기-잎 그림 레이어 생성
   * @param {LayerManager} layerManager - 레이어 매니저
   * @param {Object} data - 파싱된 데이터 { leftLabel, rightLabel, stems, ... }
   * @param {Object} config - 테이블 설정
   * @param {string} tableId - 테이블 고유 ID
   */
  static createTableLayers(layerManager, data, config = null, tableId = 'table-1') {
    const { leftLabel, rightLabel, stems } = data;

    // 열: 왼쪽 잎 | 줄기 | 오른쪽 잎
    const columnCount = 3;
    // 행: 헤더 + 줄기 개수
    const rowCount = stems.length;

    const padding = CONFIG.TABLE_PADDING;
    const canvasWidth = CONFIG.TABLE_CANVAS_WIDTH;
    const canvasHeight = BaseTableFactory.calculateCanvasHeight(rowCount, padding);

    // 열 너비 계산 (왼쪽 잎 | 줄기 | 오른쪽 잎)
    const columnWidths = this._calculateColumnWidths(canvasWidth, padding);

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
    const gridLayer = this._createGridLayer(canvasWidth, padding, rowCount, columnWidths, tableId);
    rootLayer.addChild(gridLayer);

    // 헤더 레이어
    const headerLayer = this._createHeaderLayer(leftLabel, rightLabel, columnWidths, padding, tableId);
    rootLayer.addChild(headerLayer);

    // 줄기-잎 데이터 행 레이어
    stems.forEach((stemData, rowIndex) => {
      const rowLayer = this._createStemLeafRowLayer(
        stemData,
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
   * 열 너비 계산 (왼쪽 40% | 줄기 20% | 오른쪽 40%)
   */
  static _calculateColumnWidths(canvasWidth, padding) {
    const totalWidth = canvasWidth - padding * 2;
    return [
      totalWidth * 0.4,  // 왼쪽 잎
      totalWidth * 0.2,  // 줄기
      totalWidth * 0.4   // 오른쪽 잎
    ];
  }

  /**
   * 특수 격자선 레이어 생성 (줄기 열 좌우에 세로선)
   */
  static _createGridLayer(canvasWidth, padding, rowCount, columnWidths, tableId) {
    const totalWidth = canvasWidth - padding * 2;
    const totalHeight = CONFIG.TABLE_HEADER_HEIGHT + (rowCount * CONFIG.TABLE_ROW_HEIGHT);

    return new Layer({
      id: `${tableId}-table-grid`,
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
   * 헤더 레이어 생성
   */
  static _createHeaderLayer(leftLabel, rightLabel, columnWidths, padding, tableId) {
    const headerGroup = new Layer({
      id: `${tableId}-table-header`,
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
        id: `${tableId}-table-header-col${i}`,
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
   * 줄기-잎 데이터 행 레이어 생성
   */
  static _createStemLeafRowLayer(stemData, rowIndex, columnWidths, padding, tableId) {
    const rowGroup = new Layer({
      id: `${tableId}-table-row-${rowIndex}`,
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
    const leftCell = new Layer({
      id: `${tableId}-table-row-${rowIndex}-col0`,
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
        leaves: stemData.leftLeaves
      }
    });
    rowGroup.addChild(leftCell);
    x += columnWidths[0];

    // 줄기 (가운데 정렬)
    const stemCell = new Layer({
      id: `${tableId}-table-row-${rowIndex}-col1`,
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
    const rightCell = new Layer({
      id: `${tableId}-table-row-${rowIndex}-col2`,
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
        leaves: stemData.rightLeaves
      }
    });
    rowGroup.addChild(rightCell);

    return rowGroup;
  }
}

export default StemLeafFactory;

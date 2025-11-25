/**
 * 테이블 레이어 팩토리
 * 도수분포표를 레이어 구조로 생성
 */

import CONFIG from '../../config.js';
import Utils from '../../utils/utils.js';
import { Layer } from '../../animation/index.js';

class TableLayerFactory {
  /**
   * 테이블 레이어 생성 (LayerManager에 추가) - 다중 데이터셋 지원
   * @param {LayerManager} layerManager - 레이어 매니저
   * @param {Array} datasets - 데이터셋 배열 (각 객체: {id, name, preset, classes, frequencies, relativeFreqs})
   * @param {Object} config - 테이블 설정
   */
  static createTableLayers(layerManager, datasets, config = null) {
    if (!datasets || datasets.length === 0) return;

    // 설정 가져오기
    const tableLabels = config?.labels || CONFIG.DEFAULT_LABELS.table;
    const columnAlignment = config?.columnAlignment || CONFIG.TABLE_DEFAULT_ALIGNMENT;
    const showSuperscript = config?.showSuperscript ?? CONFIG.TABLE_SHOW_SUPERSCRIPT;

    // 첫 번째 데이터셋의 classes를 기준으로 사용 (공통 class ranges)
    const allClasses = datasets[0].classes;

    // 어느 데이터셋에서든 도수가 0이 아닌 계급만 필터링 (원본 인덱스 유지)
    const visibleClassesWithIndex = allClasses
      .map((c, originalIndex) => ({ classData: c, originalIndex }))
      .filter(item => datasets.some(ds => ds.frequencies[item.originalIndex] > 0));

    // 다중 데이터셋용 헤더 생성
    const headers = [tableLabels.class]; // 계급 컬럼
    datasets.forEach(ds => {
      headers.push(`${ds.name}\n${tableLabels.frequency}`);
      headers.push(`${ds.name}\n${tableLabels.relativeFrequency}`);
    });

    const columnCount = headers.length;

    // Canvas 크기 계산
    const padding = CONFIG.TABLE_PADDING;
    const canvasWidth = CONFIG.TABLE_CANVAS_WIDTH;
    const rowCount = visibleClassesWithIndex.length + 1; // +1 for summary row
    const canvasHeight = CONFIG.TABLE_HEADER_HEIGHT + (rowCount * CONFIG.TABLE_ROW_HEIGHT) + padding * 2;

    // 열 너비 계산
    const columnWidths = this._calculateColumnWidths(canvasWidth, padding, columnCount);

    // 루트 레이어 생성
    const rootLayer = new Layer({
      id: 'table-root',
      name: '도수분포표',
      type: 'group',
      visible: true,
      order: 0,
      data: {
        canvasWidth,
        canvasHeight,
        padding,
        columnCount,
        rowCount
      }
    });

    // 격자선 레이어 생성
    const gridLayer = this._createGridLayer(
      canvasWidth,
      canvasHeight,
      padding,
      rowCount,
      columnWidths
    );
    rootLayer.addChild(gridLayer);

    // 헤더 레이어 생성
    const headerLayer = this._createHeaderLayer(
      headers,
      columnWidths,
      columnAlignment,
      padding
    );
    rootLayer.addChild(headerLayer);

    // 데이터 행 레이어 생성 (다중 데이터셋)
    visibleClassesWithIndex.forEach((item, rowIndex) => {
      const rowLayer = this._createMultiDatasetRowLayer(
        item.classData,
        rowIndex,
        item.originalIndex,
        datasets,
        columnWidths,
        columnAlignment,
        showSuperscript,
        padding,
        headers
      );
      rootLayer.addChild(rowLayer);
    });

    // 합계 행 레이어 생성 (다중 데이터셋)
    const summaryLayer = this._createMultiDatasetSummaryLayer(
      datasets,
      visibleClassesWithIndex.length,
      columnWidths,
      columnAlignment,
      padding,
      headers
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
   * @returns {Layer} 격자선 레이어
   */
  static _createGridLayer(canvasWidth, canvasHeight, padding, rowCount, columnWidths) {
    const totalWidth = canvasWidth - padding * 2;
    const totalHeight = CONFIG.TABLE_HEADER_HEIGHT + (rowCount * CONFIG.TABLE_ROW_HEIGHT);

    return new Layer({
      id: 'table-grid',
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
        columnWidths
      }
    });
  }

  /**
   * 헤더 행 레이어 생성
   * @param {Array} headers - 헤더 라벨 배열
   * @param {Array} columnWidths - 열 너비 배열
   * @param {Object} columnAlignment - 컬럼별 정렬 설정
   * @param {number} padding - 패딩
   * @returns {Layer} 헤더 그룹 레이어
   */
  static _createHeaderLayer(headers, columnWidths, columnAlignment, padding) {
    const headerGroup = new Layer({
      id: 'table-header',
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
        id: `table-header-col${i}`,
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
    filteredLabels
  ) {
    const rowGroup = new Layer({
      id: `table-row-${rowIndex}`,
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

    let x = padding;

    cells.forEach((cellText, i) => {
      const label = filteredLabels[i];
      const cellLayer = new Layer({
        id: `table-row-${rowIndex}-col${i}`,
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
          classData: rowIndex === 0 && label === '계급' ? classData : null,
          showSuperscript: rowIndex === 0 && label === '계급' ? showSuperscript : false,
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
    filteredLabels
  ) {
    const summaryGroup = new Layer({
      id: 'table-summary',
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

      // 빈 문자열이 아닌 경우에만 레이어 생성 (병합된 부분은 레이어 없음)
      if (cellText !== '') {
        // 첫 번째 셀("합계")인 경우 다음 셀(계급값)도 병합
        let cellWidth = columnWidths[i];
        if (cellText === '합계' && i + 1 < filteredCells.length && filteredCells[i + 1] === '') {
          cellWidth += columnWidths[i + 1]; // 다음 셀 너비도 포함
        }

        const cellLayer = new Layer({
          id: `table-summary-col${cellIndex}`,
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
      }

      // x 좌표는 항상 증가 (빈 칸이든 아니든)
      x += columnWidths[i];
    });

    return summaryGroup;
  }

  /**
   * 다중 데이터셋 데이터 행 레이어 생성
   * @param {Object} classData - 계급 데이터
   * @param {number} rowIndex - 표시 행 인덱스 (필터링 후)
   * @param {number} originalIndex - 원본 계급 인덱스 (필터링 전)
   * @param {Array} datasets - 데이터셋 배열
   * @param {Array} columnWidths - 열 너비 배열
   * @param {Object} columnAlignment - 컬럼별 정렬 설정
   * @param {boolean} showSuperscript - 상첨자 표시 여부
   * @param {number} padding - 패딩
   * @param {Array} headers - 헤더 라벨 배열
   * @returns {Layer} 데이터 행 그룹 레이어
   */
  static _createMultiDatasetRowLayer(
    classData,
    rowIndex,
    originalIndex,
    datasets,
    columnWidths,
    columnAlignment,
    showSuperscript,
    padding,
    headers
  ) {
    const rowGroup = new Layer({
      id: `table-row-${rowIndex}`,
      name: `데이터 행 ${rowIndex}`,
      type: 'group',
      visible: true,
      order: rowIndex + 2,
      data: {
        rowIndex
      }
    });

    const y = padding + CONFIG.TABLE_HEADER_HEIGHT + (rowIndex * CONFIG.TABLE_ROW_HEIGHT);

    // 첫 번째 셀: 계급
    const cells = [`${classData.min} ~ ${classData.max}`];

    // 각 데이터셋에 대해 도수와 상대도수 추가 (원본 인덱스 사용)
    datasets.forEach(ds => {
      const freq = ds.frequencies[originalIndex] || 0;
      const relFreq = ds.relativeFreqs[originalIndex] || 0;
      cells.push(freq);
      cells.push(`${Utils.formatNumberClean(relFreq * 100)}%`);
    });

    let x = padding;

    cells.forEach((cellText, i) => {
      const label = headers[i];
      const cellLayer = new Layer({
        id: `table-row-${rowIndex}-col${i}`,
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
          classData: rowIndex === 0 && i === 0 ? classData : null,
          showSuperscript: rowIndex === 0 && i === 0 ? showSuperscript : false,
          isEvenRow: rowIndex % 2 === 1
        }
      });

      rowGroup.addChild(cellLayer);
      x += columnWidths[i];
    });

    return rowGroup;
  }

  /**
   * 다중 데이터셋 합계 행 레이어 생성
   * @param {Array} datasets - 데이터셋 배열
   * @param {number} dataRowCount - 데이터 행 개수
   * @param {Array} columnWidths - 열 너비 배열
   * @param {Object} columnAlignment - 컬럼별 정렬 설정
   * @param {number} padding - 패딩
   * @param {Array} headers - 헤더 라벨 배열
   * @returns {Layer} 합계 행 그룹 레이어
   */
  static _createMultiDatasetSummaryLayer(
    datasets,
    dataRowCount,
    columnWidths,
    columnAlignment,
    padding,
    headers
  ) {
    const summaryGroup = new Layer({
      id: 'table-summary',
      name: '합계 행',
      type: 'group',
      visible: true,
      order: dataRowCount + 2,
      data: {}
    });

    const y = padding + CONFIG.TABLE_HEADER_HEIGHT + (dataRowCount * CONFIG.TABLE_ROW_HEIGHT);

    // 첫 번째 셀: "합계"
    const cells = ['합계'];

    // 각 데이터셋에 대해 합계 추가
    datasets.forEach(ds => {
      const total = ds.frequencies.reduce((sum, f) => sum + f, 0);
      cells.push(total);
      cells.push('100%');
    });

    let x = padding;

    cells.forEach((cellText, i) => {
      const label = headers[i];
      const cellLayer = new Layer({
        id: `table-summary-col${i}`,
        name: String(cellText),
        type: 'cell',
        visible: true,
        order: i,
        data: {
          rowType: 'summary',
          rowIndex: dataRowCount,
          colIndex: i,
          colLabel: label,
          cellText: String(cellText),
          x,
          y,
          width: columnWidths[i],
          height: CONFIG.TABLE_ROW_HEIGHT,
          alignment: columnAlignment[label] || 'center',
          highlighted: false,
          highlightProgress: 0
        }
      });

      summaryGroup.addChild(cellLayer);
      x += columnWidths[i];
    });

    return summaryGroup;
  }
}

export default TableLayerFactory;

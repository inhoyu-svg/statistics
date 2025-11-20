/**
 * 테이블 렌더링 레이어
 * Canvas를 사용한 도수분포표 그리기
 */

import CONFIG from '../config.js';
import Utils from '../utils/utils.js';

/**
 * @class TableRenderer
 * @description Canvas 기반 도수분포표 렌더러
 */
class TableRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.padding = CONFIG.TABLE_PADDING;
    this.columns = 6; // 계급, 계급값, 도수, 상대도수, 누적도수, 누적상대도수
  }

  /**
   * 도수분포표 그리기
   * @param {Array} classes - 계급 데이터 배열
   * @param {number} total - 전체 데이터 개수
   * @param {Object} config - 테이블 설정 객체 (labels, visibleColumns, columnOrder, columnAlignment)
   */
  draw(classes, total, config = null) {
    // 도수가 0이 아닌 계급만 필터링
    const visibleClasses = classes.filter(c => c.frequency > 0);

    if (visibleClasses.length === 0) {
      this.drawNoDataMessage();
      return;
    }

    // 설정 가져오기
    const tableLabels = config?.labels || CONFIG.DEFAULT_LABELS.table;
    const visibleColumns = config?.visibleColumns || [true, true, true, true, true, true];
    const columnOrder = config?.columnOrder || [0, 1, 2, 3, 4, 5];
    const columnAlignment = config?.columnAlignment || CONFIG.TABLE_DEFAULT_ALIGNMENT;

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

    // Canvas 크기 계산 (헤더 + 데이터 행 + 합계 행)
    const rowCount = visibleClasses.length + 1; // +1 for summary row
    const canvasHeight = CONFIG.TABLE_HEADER_HEIGHT + (rowCount * CONFIG.TABLE_ROW_HEIGHT) + this.padding * 2;

    this.canvas.width = CONFIG.TABLE_CANVAS_WIDTH;
    this.canvas.height = canvasHeight;
    this.clear();

    // 열 너비 계산
    const columnWidths = this.calculateColumnWidths(columnCount);

    // 렌더링 순서
    this.drawGrid(rowCount, columnWidths);
    this.drawHeader(filteredLabels, columnWidths, columnAlignment);
    this.drawDataRows(visibleClasses, columnWidths, orderedVisibleColumns, columnOrder, columnAlignment);
    this.drawSummaryRow(total, visibleClasses.length, columnWidths, orderedVisibleColumns, columnOrder, columnAlignment);
  }

  /**
   * 캔버스 초기화
   */
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * 열 너비 계산
   * @param {number} columnCount - 표시할 열 개수
   * @returns {Array} 각 열의 너비 배열
   */
  calculateColumnWidths(columnCount = 6) {
    const totalWidth = this.canvas.width - this.padding * 2;
    // 동적으로 균등 분배
    const widthPerColumn = totalWidth / columnCount;
    return Array(columnCount).fill(widthPerColumn);
  }

  /**
   * 격자선 그리기
   * @param {number} rowCount - 행 개수
   * @param {Array} columnWidths - 열 너비 배열
   */
  drawGrid(rowCount, columnWidths) {
    this.ctx.strokeStyle = CONFIG.getColor('--color-border');
    this.ctx.lineWidth = 1;

    const totalWidth = this.canvas.width - this.padding * 2;
    const totalHeight = CONFIG.TABLE_HEADER_HEIGHT + (rowCount * CONFIG.TABLE_ROW_HEIGHT);

    // 외곽선
    this.ctx.strokeRect(this.padding, this.padding, totalWidth, totalHeight);

    // 수평선
    for (let i = 1; i <= rowCount; i++) {
      const y = this.padding + CONFIG.TABLE_HEADER_HEIGHT + (i - 1) * CONFIG.TABLE_ROW_HEIGHT;
      this.ctx.beginPath();
      this.ctx.moveTo(this.padding, y);
      this.ctx.lineTo(this.padding + totalWidth, y);
      this.ctx.stroke();
    }

    // 수직선
    let x = this.padding;
    for (let i = 0; i < columnWidths.length - 1; i++) {
      x += columnWidths[i];
      this.ctx.beginPath();
      this.ctx.moveTo(x, this.padding);
      this.ctx.lineTo(x, this.padding + totalHeight);
      this.ctx.stroke();
    }
  }

  /**
   * 헤더 행 그리기
   * @param {Array} headers - 헤더 라벨 배열 (필터링된)
   * @param {Array} columnWidths - 열 너비 배열
   * @param {Object} columnAlignment - 컬럼별 정렬 설정
   */
  drawHeader(headers, columnWidths, columnAlignment) {
    // 헤더 배경 (그라디언트)
    const gradient = this.ctx.createLinearGradient(
      this.padding,
      this.padding,
      this.padding,
      this.padding + CONFIG.TABLE_HEADER_HEIGHT
    );
    gradient.addColorStop(0, CONFIG.getColor('--color-primary'));
    gradient.addColorStop(1, CONFIG.getColor('--color-primary-dark'));

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(
      this.padding,
      this.padding,
      this.canvas.width - this.padding * 2,
      CONFIG.TABLE_HEADER_HEIGHT
    );

    // 헤더 텍스트
    this.ctx.fillStyle = 'white';
    this.ctx.font = CONFIG.TABLE_FONT_HEADER;
    this.ctx.textBaseline = 'middle';

    let x = this.padding;
    const y = this.padding + CONFIG.TABLE_HEADER_HEIGHT / 2;

    headers.forEach((header, i) => {
      const alignment = columnAlignment[header] || 'center';
      const cellX = this.getCellXPosition(x, columnWidths[i], alignment);

      this.ctx.textAlign = alignment;
      this.ctx.fillText(header, cellX, y);
      x += columnWidths[i];
    });
  }

  /**
   * 데이터 행 그리기
   * @param {Array} classes - 계급 배열
   * @param {Array} columnWidths - 열 너비 배열
   * @param {Array} orderedVisibleColumns - 순서가 적용된 표시 컬럼 배열
   * @param {Array} columnOrder - 컬럼 순서 배열
   * @param {Object} columnAlignment - 컬럼별 정렬 설정
   */
  drawDataRows(classes, columnWidths, orderedVisibleColumns, columnOrder, columnAlignment) {
    this.ctx.font = CONFIG.TABLE_FONT_DATA;
    this.ctx.textBaseline = 'middle';

    // 원본 라벨 배열 (정렬 정보 가져오기 위해 필요)
    const allLabels = ['계급', '계급값', '도수', '상대도수(%)', '누적도수', '누적상대도수(%)'];
    const orderedLabels = columnOrder.map(i => allLabels[i]);
    const filteredLabels = orderedLabels.filter((_, i) => orderedVisibleColumns[i]);

    classes.forEach((classData, rowIndex) => {
      const y = this.padding + CONFIG.TABLE_HEADER_HEIGHT + (rowIndex * CONFIG.TABLE_ROW_HEIGHT);

      // 짝수 행 배경색
      if (rowIndex % 2 === 1) {
        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
        this.ctx.fillRect(
          this.padding,
          y,
          this.canvas.width - this.padding * 2,
          CONFIG.TABLE_ROW_HEIGHT
        );
      }

      // 원본 셀 데이터
      const allCells = [
        `${classData.min} ~ ${classData.max}`,
        Utils.formatNumber(classData.midpoint),
        classData.frequency,
        `${classData.relativeFreq}%`,
        classData.cumulativeFreq,
        `${classData.cumulativeRelFreq}%`
      ];

      // columnOrder에 따라 재정렬
      const orderedCells = columnOrder.map(i => allCells[i]);

      // 표시할 셀만 필터링
      const cells = orderedCells.filter((_, i) => orderedVisibleColumns[i]);

      // 텍스트 그리기
      this.ctx.fillStyle = CONFIG.getColor('--color-text');
      let x = this.padding;
      const cellY = y + CONFIG.TABLE_ROW_HEIGHT / 2;

      cells.forEach((cellText, i) => {
        const label = filteredLabels[i];
        const alignment = columnAlignment[label] || 'center';
        const cellX = this.getCellXPosition(x, columnWidths[i], alignment);

        this.ctx.textAlign = alignment;
        this.ctx.fillText(String(cellText), cellX, cellY);
        x += columnWidths[i];
      });
    });
  }

  /**
   * 합계 행 그리기
   * @param {number} total - 전체 데이터 개수
   * @param {number} dataRowCount - 데이터 행 개수
   * @param {Array} columnWidths - 열 너비 배열
   * @param {Array} orderedVisibleColumns - 순서가 적용된 표시 컬럼 배열
   * @param {Array} columnOrder - 컬럼 순서 배열
   * @param {Object} columnAlignment - 컬럼별 정렬 설정
   */
  drawSummaryRow(total, dataRowCount, columnWidths, orderedVisibleColumns, columnOrder, columnAlignment) {
    const y = this.padding + CONFIG.TABLE_HEADER_HEIGHT + (dataRowCount * CONFIG.TABLE_ROW_HEIGHT);

    // 합계 행 배경
    const gradient = this.ctx.createLinearGradient(
      this.padding,
      y,
      this.padding,
      y + CONFIG.TABLE_ROW_HEIGHT
    );
    gradient.addColorStop(0, CONFIG.getColor('--color-primary'));
    gradient.addColorStop(1, CONFIG.getColor('--color-primary-dark'));

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(
      this.padding,
      y,
      this.canvas.width - this.padding * 2,
      CONFIG.TABLE_ROW_HEIGHT
    );

    // 합계 텍스트
    this.ctx.fillStyle = 'white';
    this.ctx.font = CONFIG.TABLE_FONT_SUMMARY;
    this.ctx.textBaseline = 'middle';

    const cellY = y + CONFIG.TABLE_ROW_HEIGHT / 2;

    // 원본 라벨 배열 (정렬 정보 가져오기 위해 필요)
    const allLabels = ['계급', '계급값', '도수', '상대도수(%)', '누적도수', '누적상대도수(%)'];
    const orderedLabels = columnOrder.map(i => allLabels[i]);
    const filteredLabels = orderedLabels.filter((_, i) => orderedVisibleColumns[i]);

    // 원본 셀 데이터 (계급, 계급값은 "합계"로 병합, 나머지는 값)
    const allCells = ['합계', '', total, '100%', total, '100%'];

    // columnOrder에 따라 재정렬
    const orderedCells = columnOrder.map(i => allCells[i]);

    // 표시할 셀만 필터링
    const filteredCells = orderedCells.filter((_, i) => orderedVisibleColumns[i]);

    let x = this.padding;
    filteredCells.forEach((cellText, i) => {
      // 빈 문자열은 건너뛰기 (병합된 부분)
      if (cellText !== '') {
        const label = filteredLabels[i];
        const alignment = columnAlignment[label] || 'center';
        const cellX = this.getCellXPosition(x, columnWidths[i], alignment);

        this.ctx.textAlign = alignment;
        this.ctx.fillText(String(cellText), cellX, cellY);
      }
      x += columnWidths[i];
    });
  }

  /**
   * 정렬에 따른 셀 X 좌표 계산
   * @param {number} cellStartX - 셀 시작 X 좌표
   * @param {number} cellWidth - 셀 너비
   * @param {string} alignment - 정렬 방식 ('left', 'center', 'right')
   * @returns {number} 텍스트 렌더링 X 좌표
   */
  getCellXPosition(cellStartX, cellWidth, alignment) {
    const padding = 8; // 셀 내부 패딩
    switch (alignment) {
      case 'left':
        return cellStartX + padding;
      case 'right':
        return cellStartX + cellWidth - padding;
      case 'center':
      default:
        return cellStartX + cellWidth / 2;
    }
  }

  /**
   * 데이터 없음 메시지
   */
  drawNoDataMessage() {
    this.canvas.width = CONFIG.TABLE_CANVAS_WIDTH;
    this.canvas.height = 100;
    this.clear();

    this.ctx.fillStyle = CONFIG.getColor('--color-text-light');
    this.ctx.font = CONFIG.CHART_FONT_LARGE;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      '데이터가 없습니다',
      this.canvas.width / 2,
      this.canvas.height / 2
    );
  }
}

export default TableRenderer;

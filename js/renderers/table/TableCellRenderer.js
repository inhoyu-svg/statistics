/**
 * 테이블 셀 렌더러
 * 개별 셀, 격자선 렌더링 로직
 */

import CONFIG from '../../config.js';

class TableCellRenderer {
  /**
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   */
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * 격자선 렌더링
   * @param {Layer} layer - 격자선 레이어
   */
  renderGrid(layer) {
    const { x, y, width, height, rowCount, columnWidths } = layer.data;

    // 하단 선만 (두께 2, 밝은 회색)
    this.ctx.strokeStyle = CONFIG.TABLE_GRID_COLOR_LIGHT;
    this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_NORMAL;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + height);
    this.ctx.lineTo(x + width, y + height);
    this.ctx.stroke();

    // 수평선
    for (let i = 1; i <= rowCount; i++) {
      const lineY = y + CONFIG.TABLE_HEADER_HEIGHT + (i - 1) * CONFIG.TABLE_ROW_HEIGHT;

      // 첫 번째 선(헤더 아래) 또는 마지막 선(합계 위)은 두께 2, 밝은 회색
      if (i === 1 || i === rowCount) {
        this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_NORMAL;
        this.ctx.strokeStyle = CONFIG.TABLE_GRID_COLOR_LIGHT;
      } else {
        this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_THIN;
        this.ctx.strokeStyle = CONFIG.TABLE_GRID_COLOR_DARK;
      }

      this.ctx.beginPath();
      this.ctx.moveTo(x, lineY);
      this.ctx.lineTo(x + width, lineY);
      this.ctx.stroke();
    }

    // 수직선 (점선, 헤더 영역 제외, 밝은 회색)
    this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_THIN;
    this.ctx.strokeStyle = CONFIG.TABLE_GRID_COLOR_LIGHT;
    this.ctx.setLineDash(CONFIG.TABLE_GRID_DASH_PATTERN);
    let lineX = x;
    for (let i = 0; i < columnWidths.length - 1; i++) {
      lineX += columnWidths[i];
      this.ctx.beginPath();
      this.ctx.moveTo(lineX, y + CONFIG.TABLE_HEADER_HEIGHT);
      this.ctx.lineTo(lineX, y + height);
      this.ctx.stroke();
    }
    this.ctx.setLineDash([]); // 실선으로 복원
  }

  /**
   * 헤더 셀 렌더링
   * @param {Layer} layer - 헤더 셀 레이어
   */
  renderHeaderCell(layer) {
    const { x, y, width, height, cellText, alignment } = layer.data;

    // 헤더 텍스트
    this.ctx.fillStyle = CONFIG.TABLE_HEADER_TEXT_COLOR;
    this.ctx.font = CONFIG.TABLE_FONT_HEADER;
    this.ctx.textBaseline = 'middle';
    this.ctx.textAlign = alignment;

    const cellX = this._getCellXPosition(x, width, alignment);
    const cellY = y + height / 2;

    this.ctx.fillText(cellText, cellX, cellY);
  }

  /**
   * 데이터 셀 렌더링
   * @param {Layer} layer - 데이터 셀 레이어
   */
  renderDataCell(layer) {
    const {
      x,
      y,
      width,
      height,
      cellText,
      alignment,
      highlighted,
      highlightProgress,
      isEvenRow,
      classData,
      showSuperscript,
      colLabel
    } = layer.data;

    // 텍스트 그리기
    this.ctx.fillStyle = CONFIG.getColor('--color-text');
    this.ctx.font = CONFIG.TABLE_FONT_DATA;
    this.ctx.textBaseline = 'middle';
    this.ctx.textAlign = alignment;

    const cellX = this._getCellXPosition(x, width, alignment);
    const cellY = y + height / 2;

    // 상첨자가 필요한 경우 (첫 행의 계급 컬럼)
    if (classData && showSuperscript) {
      this._drawClassWithSuperscript(cellText, cellX, cellY, classData, showSuperscript);
      // 폰트 복원
      this.ctx.font = CONFIG.TABLE_FONT_DATA;
    } else {
      this.ctx.fillText(cellText, cellX, cellY);
    }
  }

  /**
   * 합계 셀 렌더링
   * @param {Layer} layer - 합계 셀 레이어
   */
  renderSummaryCell(layer) {
    const { x, y, width, height, cellText, alignment } = layer.data;

    // 합계 텍스트
    this.ctx.fillStyle = CONFIG.getColor('--color-text');
    this.ctx.font = CONFIG.TABLE_FONT_SUMMARY;
    this.ctx.textBaseline = 'middle';
    this.ctx.textAlign = alignment;

    const cellX = this._getCellXPosition(x, width, alignment);
    const cellY = y + height / 2;

    this.ctx.fillText(cellText, cellX, cellY);
  }

  /**
   * 정렬에 따른 셀 X 좌표 계산
   * @param {number} cellStartX - 셀 시작 X 좌표
   * @param {number} cellWidth - 셀 너비
   * @param {string} alignment - 정렬 방식 ('left', 'center', 'right')
   * @returns {number} 텍스트 렌더링 X 좌표
   */
  _getCellXPosition(cellStartX, cellWidth, alignment) {
    switch (alignment) {
      case 'left':
        return cellStartX + CONFIG.TABLE_CELL_PADDING;
      case 'right':
        return cellStartX + cellWidth - CONFIG.TABLE_CELL_PADDING;
      case 'center':
      default:
        return cellStartX + cellWidth / 2;
    }
  }

  /**
   * 계급 텍스트를 상첨자와 함께 그리기
   * @param {string} cellText - 원본 셀 텍스트 (예: "2 ~ 4")
   * @param {number} cellX - 셀 중앙 X 좌표
   * @param {number} cellY - 셀 중앙 Y 좌표
   * @param {Object} classData - 계급 데이터 객체 (min, max 포함)
   * @param {boolean} showSuperscript - 상첨자 표시 여부
   */
  _drawClassWithSuperscript(cellText, cellX, cellY, classData, showSuperscript) {
    const min = classData.min;
    const max = classData.max;

    // 폰트 크기 설정
    const normalFont = CONFIG.TABLE_FONT_DATA;
    const superscriptFont = CONFIG.TABLE_FONT_SUPERSCRIPT;

    // 텍스트 구성 요소
    const minText = String(min);
    const maxText = String(max);
    const superMin = CONFIG.TABLE_SUPERSCRIPT_MIN_TEXT;
    const superMax = CONFIG.TABLE_SUPERSCRIPT_MAX_TEXT;
    const separator = CONFIG.TABLE_CLASS_SEPARATOR;

    // 각 구성 요소의 너비 측정
    this.ctx.font = normalFont;
    const minWidth = this.ctx.measureText(minText).width;
    const maxWidth = this.ctx.measureText(maxText).width;
    const sepWidth = this.ctx.measureText(separator).width;

    // 상첨자 너비 측정 (표시 여부와 관계없이)
    this.ctx.font = superscriptFont;
    const superMinWidth = showSuperscript ? this.ctx.measureText(superMin).width : 0;
    const superMaxWidth = showSuperscript ? this.ctx.measureText(superMax).width : 0;

    // 전체 너비 계산
    const totalWidth = minWidth + superMinWidth + sepWidth + maxWidth + superMaxWidth;

    // 시작 X 좌표 (중앙 정렬)
    let x = cellX - totalWidth / 2;

    // Y 좌표 조정
    const normalY = cellY;
    const superscriptY = cellY - CONFIG.TABLE_SUPERSCRIPT_Y_OFFSET;

    // 1. min 숫자 그리기
    this.ctx.font = normalFont;
    this.ctx.textAlign = 'left';
    this.ctx.fillText(minText, x, normalY);
    x += minWidth;

    // 2. (이상) 상첨자 그리기 (옵션에 따라)
    if (showSuperscript) {
      this.ctx.font = superscriptFont;
      this.ctx.fillText(superMin, x, superscriptY);
      x += superMinWidth;
    }

    // 3. " ~ " 구분자 그리기
    this.ctx.font = normalFont;
    this.ctx.fillText(separator, x, normalY);
    x += sepWidth;

    // 4. max 숫자 그리기
    this.ctx.fillText(maxText, x, normalY);
    x += maxWidth;

    // 5. (미만) 상첨자 그리기 (옵션에 따라)
    if (showSuperscript) {
      this.ctx.font = superscriptFont;
      this.ctx.fillText(superMax, x, superscriptY);
    }
  }
}

export default TableCellRenderer;

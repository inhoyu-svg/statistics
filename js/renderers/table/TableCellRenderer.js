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

    this.ctx.strokeStyle = CONFIG.getColor('--color-border');
    this.ctx.lineWidth = 1;

    // 외곽선
    this.ctx.strokeRect(x, y, width, height);

    // 수평선
    for (let i = 1; i <= rowCount; i++) {
      const lineY = y + CONFIG.TABLE_HEADER_HEIGHT + (i - 1) * CONFIG.TABLE_ROW_HEIGHT;
      this.ctx.beginPath();
      this.ctx.moveTo(x, lineY);
      this.ctx.lineTo(x + width, lineY);
      this.ctx.stroke();
    }

    // 수직선
    let lineX = x;
    for (let i = 0; i < columnWidths.length - 1; i++) {
      lineX += columnWidths[i];
      this.ctx.beginPath();
      this.ctx.moveTo(lineX, y);
      this.ctx.lineTo(lineX, y + height);
      this.ctx.stroke();
    }
  }

  /**
   * 헤더 셀 렌더링
   * @param {Layer} layer - 헤더 셀 레이어
   */
  renderHeaderCell(layer) {
    const { x, y, width, height, cellText, alignment } = layer.data;

    // 헤더 배경 (그라디언트)
    const gradient = this.ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, CONFIG.getColor('--color-primary'));
    gradient.addColorStop(1, CONFIG.getColor('--color-primary-dark'));

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, y, width, height);

    // 헤더 텍스트
    this.ctx.fillStyle = 'white';
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

    // 배경색 결정
    if (highlighted && highlightProgress > 0) {
      // 하이라이트: 밝은 파란색 배경
      const alpha = Math.min(highlightProgress, 1) * 0.3;
      this.ctx.fillStyle = `rgba(84, 160, 246, ${alpha})`;
      this.ctx.fillRect(x, y, width, height);

      // 테두리 추가
      this.ctx.strokeStyle = 'rgba(84, 160, 246, 0.8)';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x, y, width, height);
    } else if (isEvenRow) {
      // 짝수 행 기본 배경색
      this.ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
      this.ctx.fillRect(x, y, width, height);
    }

    // 텍스트 그리기
    this.ctx.fillStyle = CONFIG.getColor('--color-text');
    this.ctx.font = CONFIG.TABLE_FONT_DATA;
    this.ctx.textBaseline = 'middle';
    this.ctx.textAlign = alignment;

    const cellX = this._getCellXPosition(x, width, alignment);
    const cellY = y + height / 2;

    // 상첨자가 필요한 경우 (첫 행의 계급 컬럼)
    if (classData && showSuperscript && colLabel === '계급') {
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

    // 합계 행 배경
    const gradient = this.ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, CONFIG.getColor('--color-primary'));
    gradient.addColorStop(1, CONFIG.getColor('--color-primary-dark'));

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, y, width, height);

    // 합계 텍스트
    this.ctx.fillStyle = 'white';
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
    const normalFont = CONFIG.TABLE_FONT_DATA; // 기본: '14px sans-serif'
    const superscriptFont = '11px sans-serif'; // 상첨자용 작은 폰트

    // 텍스트 구성 요소
    const minText = String(min);
    const maxText = String(max);
    const superMin = '이상';
    const superMax = '미만';
    const separator = ' ~ ';

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

/**
 * 테이블 셀 렌더러
 * 개별 셀, 격자선 렌더링 로직
 */

import CONFIG from '../../config.js';
import * as KatexUtils from '../../utils/katex.js';

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
    const { x, y, width, height, rowCount, columnWidths, hasSummaryRow = false } = layer.data;

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

      // 첫 번째 선(헤더 아래)은 항상 두께 2
      // 마지막 선(합계 위)은 합계 행이 있는 경우에만 두께 2
      const isHeaderLine = i === 1;
      const isSummaryLine = hasSummaryRow && i === rowCount;

      if (isHeaderLine || isSummaryLine) {
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
    const { x, y, width, height, cellText, alignment, headerTextColor } = layer.data;

    // 헤더 텍스트 (커스텀 색상이 있으면 사용, 없으면 기본값)
    this.ctx.fillStyle = headerTextColor || CONFIG.TABLE_HEADER_TEXT_COLOR;
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

    const cellX = this._getCellXPosition(x, width, alignment);
    const cellY = y + height / 2;

    // 상첨자가 필요한 경우 (첫 행의 계급 컬럼)
    if (classData && showSuperscript) {
      this._drawClassWithSuperscript(cellText, cellX, cellY, classData, showSuperscript);
      this.ctx.font = CONFIG.TABLE_FONT_DATA;
    } else {
      // 숫자/알파벳이면 KaTeX 폰트, 아니면 기본 폰트
      this._renderCellText(cellText, cellX, cellY, alignment, CONFIG.getColor('--color-text'));
    }
  }

  /**
   * 합계 셀 렌더링
   * @param {Layer} layer - 합계 셀 레이어
   */
  renderSummaryCell(layer) {
    const { x, y, width, height, cellText, alignment } = layer.data;

    const cellX = this._getCellXPosition(x, width, alignment);
    const cellY = y + height / 2;

    // 숫자/알파벳이면 KaTeX 폰트, 아니면 기본 폰트
    this._renderCellText(cellText, cellX, cellY, alignment, CONFIG.getColor('--color-text'), true);
  }

  /**
   * 행 헤더 셀 렌더링 (카테고리 행렬, 이원 분류표용)
   * @param {Layer} layer - 행 헤더 셀 레이어
   */
  renderRowHeaderCell(layer) {
    const { x, y, width, height, cellText, alignment, textColor } = layer.data;

    const cellX = this._getCellXPosition(x, width, alignment);
    const cellY = y + height / 2;

    // 커스텀 색상이 있으면 사용, 없으면 헤더 색상 사용
    const color = textColor || CONFIG.TABLE_HEADER_TEXT_COLOR;

    // 숫자/알파벳이면 KaTeX 폰트 적용
    this._renderCellText(cellText, cellX, cellY, alignment, color);
  }

  /**
   * 줄기-잎 격자선 렌더링
   * @param {Layer} layer - 줄기-잎 격자선 레이어
   */
  renderStemLeafGrid(layer) {
    const { x, y, width, height, rowCount, stemColumnStart, stemColumnEnd } = layer.data;

    // 외곽선
    this.ctx.strokeStyle = CONFIG.TABLE_GRID_COLOR_LIGHT;
    this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_NORMAL;

    // 하단 선만 (상단 선 제거)
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + height);
    this.ctx.lineTo(x + width, y + height);
    this.ctx.stroke();

    // 헤더 아래 선
    const headerY = y + CONFIG.TABLE_HEADER_HEIGHT;
    this.ctx.beginPath();
    this.ctx.moveTo(x, headerY);
    this.ctx.lineTo(x + width, headerY);
    this.ctx.stroke();

    // 줄기 열 좌우 세로선 (점선, 헤더 아래부터)
    this.ctx.setLineDash(CONFIG.TABLE_GRID_DASH_PATTERN);
    this.ctx.beginPath();
    this.ctx.moveTo(stemColumnStart, headerY);
    this.ctx.lineTo(stemColumnStart, y + height);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(stemColumnEnd, headerY);
    this.ctx.lineTo(stemColumnEnd, y + height);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // 수평 구분선 (실선)
    this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_THIN;
    this.ctx.strokeStyle = CONFIG.TABLE_GRID_COLOR_DARK;

    for (let i = 1; i < rowCount; i++) {
      const lineY = y + CONFIG.TABLE_HEADER_HEIGHT + (i * CONFIG.TABLE_ROW_HEIGHT);
      this.ctx.beginPath();
      this.ctx.moveTo(x, lineY);
      this.ctx.lineTo(x + width, lineY);
      this.ctx.stroke();
    }
  }

  /**
   * 이원분류표 격자선 렌더링 (2행 헤더 구조)
   * @param {Layer} layer - 격자선 레이어
   */
  renderCrossTableGrid(layer) {
    const {
      x, y, width, height, rowCount, columnWidths, hasSummaryRow,
      mergedHeaderHeight, columnHeaderHeight,
      mergedHeaderLineColor, mergedHeaderLineWidth
    } = layer.data;

    const totalHeaderHeight = mergedHeaderHeight + columnHeaderHeight;

    // 하단 선 (두께 2, 밝은 회색)
    this.ctx.strokeStyle = CONFIG.TABLE_GRID_COLOR_LIGHT;
    this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_NORMAL;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + height);
    this.ctx.lineTo(x + width, y + height);
    this.ctx.stroke();

    // 병합 헤더 아래 구분선 (#8DCF66, 데이터 열 영역만)
    const dataColumnStartX = x + columnWidths[0];
    this.ctx.strokeStyle = mergedHeaderLineColor;
    this.ctx.lineWidth = mergedHeaderLineWidth;
    this.ctx.beginPath();
    this.ctx.moveTo(dataColumnStartX, y + mergedHeaderHeight);
    this.ctx.lineTo(x + width, y + mergedHeaderHeight);
    this.ctx.stroke();

    // 컬럼 헤더 아래 선 (두께 2, 밝은 회색)
    this.ctx.strokeStyle = CONFIG.TABLE_GRID_COLOR_LIGHT;
    this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_NORMAL;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + totalHeaderHeight);
    this.ctx.lineTo(x + width, y + totalHeaderHeight);
    this.ctx.stroke();

    // 데이터 행 구분선
    for (let i = 1; i <= rowCount; i++) {
      const lineY = y + totalHeaderHeight + (i - 1) * CONFIG.TABLE_ROW_HEIGHT;

      // 첫 번째 선(컬럼 헤더 아래) 또는 마지막 선(합계 위)은 두께 2, 밝은 회색
      const isHeaderLine = i === 1;
      const isSummaryLine = hasSummaryRow && i === rowCount;

      if (isHeaderLine || isSummaryLine) {
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

    // 수직선 (점선, 컬럼 헤더 이후부터)
    this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_THIN;
    this.ctx.strokeStyle = CONFIG.TABLE_GRID_COLOR_LIGHT;
    this.ctx.setLineDash(CONFIG.TABLE_GRID_DASH_PATTERN);
    let lineX = x;
    for (let i = 0; i < columnWidths.length - 1; i++) {
      lineX += columnWidths[i];
      this.ctx.beginPath();
      this.ctx.moveTo(lineX, y + totalHeaderHeight);
      this.ctx.lineTo(lineX, y + height);
      this.ctx.stroke();
    }
    this.ctx.setLineDash([]); // 실선으로 복원
  }

  /**
   * 병합 헤더 셀 렌더링 (상대도수)
   * @param {Layer} layer - 병합 헤더 셀 레이어
   */
  renderMergedHeaderCell(layer) {
    const { x, y, width, height, cellText, alignment, headerTextColor, isMergedCell } = layer.data;

    // 빈 셀이면 렌더링 안 함
    if (!cellText) return;

    // 병합 헤더 텍스트
    this.ctx.fillStyle = headerTextColor || CONFIG.TABLE_HEADER_TEXT_COLOR;
    this.ctx.font = CONFIG.TABLE_FONT_HEADER;
    this.ctx.textBaseline = 'middle';
    this.ctx.textAlign = alignment;

    const cellX = this._getCellXPosition(x, width, alignment);
    const cellY = y + height / 2;

    this.ctx.fillText(cellText, cellX, cellY);
  }

  /**
   * 줄기-잎 줄기 셀 렌더링
   * @param {Layer} layer - 줄기 셀 레이어
   */
  renderStemCell(layer) {
    const { x, y, width, height, cellText, alignment } = layer.data;

    const cellX = this._getCellXPosition(x, width, alignment);
    const cellY = y + height / 2;

    // 줄기는 숫자이므로 KaTeX 폰트 사용
    this._renderCellText(cellText, cellX, cellY, alignment, '#FFFFFF');
  }

  /**
   * 줄기-잎 잎 데이터 셀 렌더링
   * @param {Layer} layer - 잎 데이터 셀 레이어
   */
  renderStemLeafDataCell(layer) {
    const { x, y, width, height, cellText, alignment } = layer.data;

    // 줄기-잎 전용 패딩 적용 (세로선과의 간격 확보)
    const stemLeafPadding = CONFIG.TABLE_STEM_LEAF_PADDING;
    let cellX;
    if (alignment === 'left') {
      cellX = x + stemLeafPadding;
    } else if (alignment === 'right') {
      cellX = x + width - stemLeafPadding;
    } else {
      cellX = x + width / 2;
    }
    const cellY = y + height / 2;

    // 잎은 숫자이므로 KaTeX 폰트 사용
    this._renderCellText(cellText, cellX, cellY, alignment, CONFIG.getColor('--color-text'));
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
    const color = CONFIG.getColor('--color-text');

    // 폰트 설정 (KaTeX 폰트 사용)
    const fontSize = 18;
    const katexFont = `${fontSize}px KaTeX_Main, Times New Roman, serif`;
    const superscriptFont = CONFIG.TABLE_FONT_SUPERSCRIPT;

    // 텍스트 구성 요소
    const minText = String(min);
    const maxText = String(max);
    const superMin = CONFIG.TABLE_SUPERSCRIPT_MIN_TEXT;
    const superMax = CONFIG.TABLE_SUPERSCRIPT_MAX_TEXT;
    const separator = CONFIG.TABLE_CLASS_SEPARATOR;

    // 각 구성 요소의 너비 측정 (KaTeX 폰트 기준)
    this.ctx.font = katexFont;
    const minWidth = this.ctx.measureText(minText).width;
    const maxWidth = this.ctx.measureText(maxText).width;
    const sepWidth = this.ctx.measureText(separator).width;

    // 상첨자 너비 측정
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

    // 색상 설정
    this.ctx.fillStyle = color;
    this.ctx.textBaseline = 'middle';

    // 1. min 숫자 그리기 (KaTeX 폰트)
    this.ctx.font = katexFont;
    this.ctx.textAlign = 'left';
    this.ctx.fillText(minText, x, normalY);
    x += minWidth;

    // 2. (이상) 상첨자 그리기 (옵션에 따라)
    if (showSuperscript) {
      this.ctx.font = superscriptFont;
      this.ctx.fillText(superMin, x, superscriptY);
      x += superMinWidth;
    }

    // 3. " ~ " 구분자 그리기 (KaTeX 폰트)
    this.ctx.font = katexFont;
    this.ctx.fillText(separator, x, normalY);
    x += sepWidth;

    // 4. max 숫자 그리기 (KaTeX 폰트)
    this.ctx.fillText(maxText, x, normalY);
    x += maxWidth;

    // 5. (미만) 상첨자 그리기 (옵션에 따라)
    if (showSuperscript) {
      this.ctx.font = superscriptFont;
      this.ctx.fillText(superMax, x, superscriptY);
    }
  }

  /**
   * 셀 텍스트 렌더링 (숫자/알파벳은 KaTeX 폰트, 그 외는 기본 폰트)
   * @param {string} text - 렌더링할 텍스트
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   * @param {string} alignment - 정렬 방식
   * @param {string} color - 텍스트 색상
   * @param {boolean} bold - 볼드 여부 (합계 행용)
   */
  _renderCellText(text, x, y, alignment, color, bold = false) {
    const str = String(text).trim();
    const fontSize = 18;

    // 숫자 또는 알파벳만 포함된 경우 KaTeX 폰트 사용
    if (this._isNumericOrAlpha(str)) {
      KatexUtils.render(this.ctx, str, x, y, {
        fontSize: fontSize,
        color: color,
        align: alignment,
        baseline: 'middle'
      });
    } else {
      // 한글 등은 기본 폰트 사용
      this.ctx.fillStyle = color;
      this.ctx.font = bold ? CONFIG.TABLE_FONT_SUMMARY : CONFIG.TABLE_FONT_DATA;
      this.ctx.textBaseline = 'middle';
      this.ctx.textAlign = alignment;
      this.ctx.fillText(str, x, y);
    }
  }

  /**
   * 숫자 또는 알파벳만 포함된 문자열인지 확인
   * @param {string} text - 확인할 텍스트
   * @returns {boolean}
   */
  _isNumericOrAlpha(text) {
    // 숫자, 소수점, 음수, 알파벳, 공백, ~만 포함
    return /^[-\d.\sA-Za-z~%]+$/.test(text);
  }
}

export default TableCellRenderer;

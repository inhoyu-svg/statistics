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
    const { x, y, width, height, cellText, alignment, headerTextColor, animating, animationProgress } = layer.data;

    // 애니메이션 배경 렌더링 (펄스 효과)
    if (animating && animationProgress > 0) {
      this._renderAnimationBackground(x, y, width, height, animationProgress);
    }

    const cellX = this._getCellXPosition(x, width, alignment);
    const cellY = y + height / 2;

    // 커스텀 색상이 있으면 사용, 없으면 기본 헤더 색상 사용
    const color = headerTextColor || CONFIG.TABLE_HEADER_TEXT_COLOR;

    // 숫자/알파벳이면 KaTeX 폰트 적용, 한글은 bold 폰트
    // isHeader=true로 전달하여 상첨자 폰트 크기 조정
    this._renderCellText(cellText, cellX, cellY, alignment, color, true, true);
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
      colLabel,
      tallyCount,
      animating,
      animationProgress,
      animationColor
    } = layer.data;

    // 애니메이션 배경 렌더링 (펄스 효과)
    if (animating && animationProgress > 0) {
      this._renderAnimationBackground(x, y, width, height, animationProgress);
    }

    // 하이라이트 배경 렌더링
    if (highlighted && highlightProgress > 0) {
      const alpha = highlightProgress * 0.3; // 최대 30% 투명도
      this.ctx.fillStyle = `rgba(255, 235, 59, ${alpha})`; // 노란색 하이라이트
      this.ctx.fillRect(x, y, width, height);
    }

    const cellX = this._getCellXPosition(x, width, alignment);
    const cellY = y + height / 2;

    // 탈리마크 셀인 경우 Canvas로 직접 그리기
    if (colLabel === CONFIG.DEFAULT_LABELS.table.tally && tallyCount !== undefined) {
      this._renderTallyCanvas(tallyCount, x, y, width, height, CONFIG.getColor('--color-text'));
      return;
    }

    // cellText가 탈리 객체인 경우 (파서에서 "/" 패턴으로 생성된 탈리마크)
    if (cellText && typeof cellText === 'object' && cellText.type === 'tally') {
      this._renderTallyCanvas(cellText.count, x, y, width, height, CONFIG.getColor('--color-text'));
      return;
    }

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
    const { x, y, width, height, cellText, alignment, animating, animationProgress } = layer.data;

    // 애니메이션 배경 렌더링 (펄스 효과)
    if (animating && animationProgress > 0) {
      this._renderAnimationBackground(x, y, width, height, animationProgress);
    }

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
    const { x, y, width, height, cellText, alignment, textColor, animating, animationProgress } = layer.data;

    // 애니메이션 배경 렌더링 (펄스 효과)
    if (animating && animationProgress > 0) {
      this._renderAnimationBackground(x, y, width, height, animationProgress);
    }

    const cellX = this._getCellXPosition(x, width, alignment);
    const cellY = y + height / 2;

    // 커스텀 색상이 있으면 사용, 없으면 헤더 색상 사용
    const color = textColor || CONFIG.TABLE_HEADER_TEXT_COLOR;

    // 행 라벨은 데이터 셀과 동일한 폰트 크기 사용 (isHeader = false)
    // 상첨자가 있어도 기본 폰트 크기가 작아지지 않도록 함
    this._renderCellText(cellText, cellX, cellY, alignment, color, false, false);
  }

  /**
   * 줄기-잎 단일 모드 격자선 렌더링 (2열: 줄기 | 잎)
   * @param {Layer} layer - 줄기-잎 격자선 레이어
   */
  renderStemLeafSingleGrid(layer) {
    const { x, y, width, height, rowCount, stemColumnEnd } = layer.data;

    // 외곽선
    this.ctx.strokeStyle = CONFIG.TABLE_GRID_COLOR_LIGHT;
    this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_NORMAL;

    // 하단 선만
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

    // 줄기 열 오른쪽 세로선 (점선, 헤더 아래부터)
    this.ctx.setLineDash(CONFIG.TABLE_GRID_DASH_PATTERN);
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
   * 줄기-잎 비교 모드 격자선 렌더링 (3열: 잎 | 줄기 | 잎)
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
   * 기본 테이블 격자선 렌더링 (2행 헤더 구조)
   * @param {Layer} layer - 격자선 레이어
   */
  renderBasicTableGrid(layer) {
    const {
      x, y, width, height, rowCount, columnWidths, hasSummaryRow,
      mergedHeaderHeight, columnHeaderHeight,
      mergedHeaderLineColor, mergedHeaderLineWidth,
      showMergedHeader = true,
      rowHeights = [],
      showGrid = true
    } = layer.data;

    const totalHeaderHeight = mergedHeaderHeight + columnHeaderHeight;

    // showGrid가 false면 둥근 테두리만 렌더링
    if (!showGrid) {
      // showGrid: false일 때는 병합 헤더 + 컬럼 헤더 영역 제외 (데이터만 감싸기)
      const headerOffset = mergedHeaderHeight + columnHeaderHeight;
      const adjustedY = y + headerOffset;
      const adjustedHeight = height - headerOffset;

      // 양옆/상하 패딩 적용 (테두리 바깥으로 확장)
      const padX = CONFIG.TABLE_BORDER_PADDING_X;
      const padY = CONFIG.TABLE_BORDER_PADDING_Y;

      this._renderRoundedBorder(
        x - padX,
        adjustedY - padY,
        width + padX * 2,
        adjustedHeight + padY * 2
      );
      return;
    }

    // 하단 선 (두께 2, 밝은 회색)
    this.ctx.strokeStyle = CONFIG.TABLE_GRID_COLOR_LIGHT;
    this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_NORMAL;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + height);
    this.ctx.lineTo(x + width, y + height);
    this.ctx.stroke();

    // 병합 헤더 아래 구분선 (#8DCF66, 데이터 열 영역만) - 조건부 렌더링
    if (showMergedHeader && mergedHeaderHeight > 0) {
      const dataColumnStartX = x + columnWidths[0];
      this.ctx.strokeStyle = mergedHeaderLineColor;
      this.ctx.lineWidth = mergedHeaderLineWidth;
      this.ctx.beginPath();
      this.ctx.moveTo(dataColumnStartX, y + mergedHeaderHeight);
      this.ctx.lineTo(x + width, y + mergedHeaderHeight);
      this.ctx.stroke();
    }

    // 컬럼 헤더 아래 선 (두께 2, 밝은 회색)
    this.ctx.strokeStyle = CONFIG.TABLE_GRID_COLOR_LIGHT;
    this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_NORMAL;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + totalHeaderHeight);
    this.ctx.lineTo(x + width, y + totalHeaderHeight);
    this.ctx.stroke();

    // 데이터 행 구분선
    let cumulativeY = 0;
    for (let i = 1; i <= rowCount; i++) {
      // rowHeights가 있으면 누적 높이 사용, 없으면 기존 방식
      const lineY = y + totalHeaderHeight + (rowHeights.length > 0
        ? cumulativeY
        : (i - 1) * CONFIG.TABLE_ROW_HEIGHT);

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

      // 다음 행을 위해 현재 행 높이 누적
      if (rowHeights.length > 0 && i <= rowHeights.length) {
        cumulativeY += rowHeights[i - 1];
      }
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
   * 둥근 테두리 렌더링 (showGrid: false일 때)
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   * @param {number} width - 너비
   * @param {number} height - 높이
   */
  _renderRoundedBorder(x, y, width, height) {
    const radius = CONFIG.TABLE_BORDER_RADIUS;
    const borderColor = CONFIG.TABLE_BORDER_COLOR;
    const borderWidth = CONFIG.TABLE_BORDER_WIDTH;

    this.ctx.strokeStyle = borderColor;
    this.ctx.lineWidth = borderWidth;
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, width, height, radius);
    this.ctx.stroke();
  }

  /**
   * 병합 헤더 셀 렌더링 (상대도수 또는 커스텀 텍스트)
   * @param {Layer} layer - 병합 헤더 셀 레이어
   */
  renderMergedHeaderCell(layer) {
    const { x, y, width, height, cellText, alignment, headerTextColor } = layer.data;

    // 빈 셀이면 렌더링 안 함
    if (!cellText) return;

    const cellX = this._getCellXPosition(x, width, alignment);
    const cellY = y + height / 2;

    const color = headerTextColor || CONFIG.TABLE_HEADER_TEXT_COLOR;

    // _renderCellText 사용하여 괄호 처리 적용 (isHeader=true)
    this._renderCellText(cellText, cellX, cellY, alignment, color, false, true);
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
    const { x, y, width, height, alignment, leaves, cellText, isVariable } = layer.data;

    // 🔍 디버깅 로그
    console.log('[DEBUG] renderStemLeafDataCell:', {
      cellText,
      isVariable,
      leaves,
      'cellText.trim()': cellText ? cellText.trim() : null,
      'typeof cellText': typeof cellText
    });

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

    // 고정 폰트 크기 (동적 너비로 조절되므로 폰트 축소 불필요)
    const fontSize = 24;

    // 변수인 경우와 일반 잎 데이터 분기
    if (isVariable) {
      // 변수인 경우: 이탤릭 강제
      this._renderStemLeafText(cellText, cellX, cellY, alignment, CONFIG.getColor('--color-text'), fontSize, true);
    } else {
      // 잎 데이터인 경우: 기존 렌더링
      const displayText = leaves ? leaves.join('      ') : '';
      this._renderStemLeafText(displayText, cellX, cellY, alignment, CONFIG.getColor('--color-text'), fontSize, false);
    }
  }

  /**
   * 줄기-잎 텍스트 렌더링 (동적 폰트 크기)
   * @param {string} text - 렌더링할 텍스트
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   * @param {string} alignment - 정렬 방식
   * @param {string} color - 텍스트 색상
   * @param {number} fontSize - 폰트 크기
   * @param {boolean} isVariable - 변수 여부 (소문자: KaTeX_Math, 대문자: KaTeX_Main)
   */
  _renderStemLeafText(text, x, y, alignment, color, fontSize, isVariable = false) {
    const str = String(text).trim();

    if (isVariable) {
      // 변수가 포함된 경우: 토큰별로 분리하여 렌더링
      const tokens = str.split(/\s+/);

      this.ctx.save();
      this.ctx.fillStyle = color;
      this.ctx.textBaseline = 'middle';

      // 전체 너비 계산 (원본: 6개 공백 사용)
      const gap = fontSize * 1.5; // 토큰 간 간격
      let totalWidth = 0;
      tokens.forEach((token, i) => {
        // 언더바는 빈칸으로 처리 (너비 0)
        if (token === '_') {
          if (i < tokens.length - 1) totalWidth += gap;
          return;
        }
        const isLowercase = /^[a-z]$/.test(token);
        this.ctx.font = isLowercase
          ? `italic ${fontSize}px KaTeX_Math, KaTeX_Main, Times New Roman, serif`
          : `${fontSize}px KaTeX_Main, Times New Roman, serif`;
        totalWidth += this.ctx.measureText(token).width;
        if (i < tokens.length - 1) totalWidth += gap;
      });

      // 정렬에 따른 시작 X 좌표
      let currentX = x;
      if (alignment === 'center') currentX = x - totalWidth / 2;
      else if (alignment === 'right') currentX = x - totalWidth;

      // 각 토큰 렌더링
      tokens.forEach((token, i) => {
        // 언더바는 빈칸으로 처리 (렌더링 스킵, 간격만 유지)
        if (token === '_') {
          currentX += gap;
          return;
        }
        const isLowercase = /^[a-z]$/.test(token);
        this.ctx.font = isLowercase
          ? `italic ${fontSize}px KaTeX_Math, KaTeX_Main, Times New Roman, serif`
          : `${fontSize}px KaTeX_Main, Times New Roman, serif`;
        this.ctx.textAlign = 'left';
        this.ctx.fillText(token, currentX, y);
        currentX += this.ctx.measureText(token).width + gap;
      });

      this.ctx.restore();
    } else {
      KatexUtils.render(this.ctx, str, x, y, {
        fontSize,
        color,
        align: alignment,
        baseline: 'middle'
      });
    }
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
    const fontSize = 24;
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
   * @param {boolean} isHeader - 헤더 여부 (헤더는 더 작은 폰트)
   */
  _renderCellText(text, x, y, alignment, color, bold = false, isHeader = false) {
    // null은 빈칸 처리 (cellVariables에서 null 사용)
    if (text === null) {
      return;
    }

    const str = String(text).trim();
    const fontSize = isHeader ? 22 : 24;

    // 빈 문자열은 렌더링 스킵
    if (str === '') {
      return;
    }

    // LaTeX 분수 표기법(\frac{}{})이 포함된 경우 특별 처리
    const fracMatch = str.match(/^\\frac\{([^}]*)\}\{([^}]*)\}$/);
    if (fracMatch) {
      KatexUtils.renderFraction(this.ctx, fracMatch[1], fracMatch[2], x, y, {
        fontSize: fontSize,
        color: color,
        align: alignment,
        baseline: 'middle'
      });
      return;
    }

    // 상첨자 표기법(^)이 포함된 경우 특별 처리
    if (str.includes('^')) {
      const parts = this._parseSuperscript(str);
      this._renderWithSuperscript(parts, x, y, alignment, color, bold, isHeader);
      return;
    }

    // 한글 포함 + 괄호 있는 경우 먼저 처리 (괄호를 작게 렌더링)
    // 예: "O형인 학생 수(명)", "전체 학생 수 (명)"
    const hasKorean = /[가-힣]/.test(str);
    const parenMatch = str.match(/^(.*?)(\s*\([^)]*\))$/);

    if (hasKorean && parenMatch && parenMatch[1].trim()) {
      // mainText가 있을 때만 작은 괄호 렌더링 (예: "학생 수(명)" ✅, "(가)" ❌)
      this._renderTextWithSmallParen(parenMatch[1], parenMatch[2], x, y, alignment, color, bold, fontSize, isHeader);
      return;
    }

    // 숫자 또는 알파벳만 포함된 경우 KaTeX 폰트 사용
    if (this._isNumericOrAlpha(str)) {
      KatexUtils.render(this.ctx, str, x, y, {
        fontSize: fontSize,
        color: color,
        align: alignment,
        baseline: 'middle'
      });
    } else if (this._containsMixedKoreanAndNumeric(str)) {
      // 한글+숫자/알파벳 혼합인 경우 분리 렌더링 (예: "1반", "2반")
      this._renderMixedText(str, x, y, alignment, color, bold, fontSize, isHeader);
    } else {
      // 한글 등은 기본 폰트 사용 (괄호 처리는 상단에서 이미 완료됨)
      this.ctx.fillStyle = color;
      this.ctx.textBaseline = 'middle';
      // 헤더 → TABLE_FONT_HEADER, 합계 → TABLE_FONT_SUMMARY, 일반 → TABLE_FONT_DATA
      this.ctx.font = isHeader ? CONFIG.TABLE_FONT_HEADER : (bold ? CONFIG.TABLE_FONT_SUMMARY : CONFIG.TABLE_FONT_DATA);
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

  /**
   * 한글과 숫자/알파벳이 혼합된 문자열인지 확인
   * @param {string} text - 확인할 텍스트
   * @returns {boolean}
   */
  _containsMixedKoreanAndNumeric(text) {
    const hasKorean = /[가-힣]/.test(text);
    const hasNumericOrAlpha = /[0-9A-Za-z]/.test(text);
    return hasKorean && hasNumericOrAlpha;
  }

  /**
   * 한글+숫자/알파벳 혼합 텍스트 렌더링 (예: "1반", "2반")
   * 숫자/알파벳은 KaTeX 폰트, 한글은 기본 폰트 사용
   * @param {string} text - 렌더링할 텍스트
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   * @param {string} alignment - 정렬 방식
   * @param {string} color - 텍스트 색상
   * @param {boolean} bold - 볼드 여부
   * @param {number} fontSize - 폰트 크기 (숫자/알파벳용)
   * @param {boolean} isHeader - 헤더 여부
   */
  _renderMixedText(text, x, y, alignment, color, bold, fontSize, isHeader = false) {
    const segments = this._splitByCharType(text);
    // 혼합 텍스트에서는 한글도 동일한 폰트 크기 사용 (baseline 정렬을 위해)
    const koreanFontSize = fontSize;

    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.textBaseline = 'middle';

    // 전체 너비 계산
    let totalWidth = 0;
    segments.forEach(seg => {
      const segFontSize = seg.type === 'korean' ? koreanFontSize : fontSize;
      this.ctx.font = this._getFontForCharType(seg.type, segFontSize, bold, isHeader);
      totalWidth += this.ctx.measureText(seg.text).width;
    });

    // 정렬에 따른 시작 X 좌표
    let currentX = x;
    if (alignment === 'center') currentX = x - totalWidth / 2;
    else if (alignment === 'right') currentX = x - totalWidth;

    // 각 세그먼트 렌더링
    this.ctx.textAlign = 'left';
    segments.forEach(seg => {
      const segFontSize = seg.type === 'korean' ? koreanFontSize : fontSize;
      this.ctx.font = this._getFontForCharType(seg.type, segFontSize, bold, isHeader);
      // baseline 보정: 대괄호 -2px, 한글 +1px
      const yOffset = seg.type === 'bracket' ? -2 : (seg.type === 'korean' ? 1 : 0);
      this.ctx.fillText(seg.text, currentX, y + yOffset);
      currentX += this.ctx.measureText(seg.text).width;
    });

    this.ctx.restore();
  }

  /**
   * 괄호가 있는 텍스트를 분리하여 렌더링 (괄호는 작은 폰트)
   * 예: "O형인 학생 수(명)" → "O형인 학생 수" + "(명)"
   * @param {string} mainText - 메인 텍스트
   * @param {string} parenText - 괄호 텍스트
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   * @param {string} alignment - 정렬 방식
   * @param {string} color - 텍스트 색상
   * @param {boolean} bold - 볼드 여부
   * @param {number} fontSize - 폰트 크기
   * @param {boolean} isHeader - 헤더 여부
   */
  _renderTextWithSmallParen(mainText, parenText, x, y, alignment, color, bold, fontSize, isHeader = false) {
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.textBaseline = 'middle';

    const smallFont = bold ? "bold 12px 'SCDream', sans-serif" : "300 12px 'SCDream', sans-serif";
    const koreanFontSize = 18;

    // 메인 텍스트 너비 계산
    let mainWidth = 0;
    const isMixed = this._containsMixedKoreanAndNumeric(mainText);

    if (isMixed) {
      // 혼합 텍스트: 세그먼트별 너비 계산
      const segments = this._splitByCharType(mainText);
      segments.forEach(seg => {
        const segFontSize = seg.type === 'korean' ? koreanFontSize : fontSize;
        this.ctx.font = this._getFontForCharType(seg.type, segFontSize, bold, isHeader);
        mainWidth += this.ctx.measureText(seg.text).width;
      });
    } else {
      // 순수 한글: 헤더 → TABLE_FONT_HEADER, 합계 → TABLE_FONT_SUMMARY, 일반 → TABLE_FONT_DATA
      this.ctx.font = isHeader ? CONFIG.TABLE_FONT_HEADER : (bold ? CONFIG.TABLE_FONT_SUMMARY : CONFIG.TABLE_FONT_DATA);
      mainWidth = this.ctx.measureText(mainText).width;
    }

    // 괄호 텍스트 너비 계산 (KaTeX 폰트 적용 고려)
    const parenContent = parenText.replace(/[()]/g, '').trim();
    const smallFontSize = 12;
    const lowercaseFontSize = 15; // 소문자는 이탤릭이라 더 크게
    let parenWidth = 0;

    // 여는 괄호
    this.ctx.font = smallFont;
    parenWidth += this.ctx.measureText('(').width;

    // 괄호 내부 텍스트
    if (parenContent) {
      const segments = this._splitByCharType(parenContent);
      segments.forEach(seg => {
        const segSize = seg.type === 'lowercase' ? lowercaseFontSize : smallFontSize;
        this.ctx.font = this._getFontForCharType(seg.type, segSize, false);
        parenWidth += this.ctx.measureText(seg.text).width;
      });
    }

    // 닫는 괄호
    this.ctx.font = smallFont;
    parenWidth += this.ctx.measureText(')').width;

    // 전체 너비로 시작 X 좌표 계산
    const totalWidth = mainWidth + parenWidth;
    let startX;
    if (alignment === 'center') {
      startX = x - totalWidth / 2;
    } else if (alignment === 'right') {
      startX = x - totalWidth;
    } else {
      startX = x;
    }

    // 메인 텍스트 렌더링
    this.ctx.textAlign = 'left';
    if (isMixed) {
      // 혼합 텍스트: 세그먼트별 렌더링
      const segments = this._splitByCharType(mainText);
      let currentX = startX;
      segments.forEach(seg => {
        const segFontSize = seg.type === 'korean' ? koreanFontSize : fontSize;
        this.ctx.font = this._getFontForCharType(seg.type, segFontSize, bold, isHeader);
        this.ctx.fillText(seg.text, currentX, y);
        currentX += this.ctx.measureText(seg.text).width;
      });
    } else {
      // 순수 한글: 헤더 → TABLE_FONT_HEADER, 합계 → TABLE_FONT_SUMMARY, 일반 → TABLE_FONT_DATA
      this.ctx.font = isHeader ? CONFIG.TABLE_FONT_HEADER : (bold ? CONFIG.TABLE_FONT_SUMMARY : CONFIG.TABLE_FONT_DATA);
      this.ctx.fillText(mainText, startX, y);
    }

    // 괄호 텍스트 렌더링 (작은 폰트, 약간 아래로)
    // 괄호 내부 텍스트에 KaTeX 폰트 적용
    let parenX = startX + mainWidth;

    // 여는 괄호
    this.ctx.font = smallFont;
    this.ctx.fillText('(', parenX, y + 2);
    parenX += this.ctx.measureText('(').width;

    // 괄호 내부 텍스트: 문자 유형별 폰트 적용
    if (parenContent) {
      const segments = this._splitByCharType(parenContent);
      segments.forEach(seg => {
        const segSize = seg.type === 'lowercase' ? lowercaseFontSize : smallFontSize;
        this.ctx.font = this._getFontForCharType(seg.type, segSize, false);
        this.ctx.fillText(seg.text, parenX, y + 2);
        parenX += this.ctx.measureText(seg.text).width;
      });
    }

    // 닫는 괄호
    this.ctx.font = smallFont;
    this.ctx.fillText(')', parenX, y + 2);

    this.ctx.restore();
  }

  /**
   * 상첨자 표기법 파싱
   * @param {string} text - 파싱할 텍스트 (예: "x^2", "3^{이상}")
   * @returns {Array} 파싱 결과 [{text, super: boolean}, ...]
   */
  _parseSuperscript(text) {
    const result = [];
    // ^{...} 또는 ^x 패턴 매칭
    const regex = /\^(\{[^}]+\}|[^\s{])/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // 매치 이전 일반 텍스트
      if (match.index > lastIndex) {
        result.push({ text: text.slice(lastIndex, match.index), super: false });
      }
      // 상첨자 텍스트 (중괄호 제거)
      let superText = match[1];
      if (superText.startsWith('{') && superText.endsWith('}')) {
        superText = superText.slice(1, -1);
      }
      result.push({ text: superText, super: true });
      lastIndex = regex.lastIndex;
    }

    // 나머지 일반 텍스트
    if (lastIndex < text.length) {
      result.push({ text: text.slice(lastIndex), super: false });
    }

    return result;
  }

  /**
   * 텍스트를 문자 유형별로 분리
   * @param {string} text - 분리할 텍스트
   * @returns {Array} [{text, type: 'korean'|'lowercase'|'bracket'|'other'}, ...]
   */
  _splitByCharType(text) {
    const result = [];
    let current = { text: '', type: null };

    for (const char of text) {
      let type;
      if (/[가-힣]/.test(char)) type = 'korean';
      else if (/[a-z]/.test(char)) type = 'lowercase';
      else if (/[\[\]]/.test(char)) type = 'bracket'; // 대괄호는 별도 타입
      else type = 'other'; // 대문자, 숫자, 특수문자

      if (type === current.type) {
        current.text += char;
      } else {
        if (current.text) result.push(current);
        current = { text: char, type };
      }
    }
    if (current.text) result.push(current);
    return result;
  }

  /**
   * 문자 유형에 따른 폰트 정보 반환
   * @param {string} type - 문자 유형 ('korean', 'lowercase', 'bracket', 'other')
   * @param {number} fontSize - 폰트 크기
   * @param {boolean} bold - 볼드 여부
   * @param {boolean} isHeader - 헤더 여부 (헤더는 Medium 사용)
   * @returns {string} CSS 폰트 문자열
   */
  _getFontForCharType(type, fontSize, bold = false, isHeader = false) {
    if (type === 'korean') {
      // 한글: SCDream 폰트 사용 (헤더 또는 볼드면 Medium)
      const fontWeight = (bold || isHeader) ? '500 ' : '300 ';
      return `${fontWeight}${fontSize}px 'SCDream', sans-serif`;
    } else if (type === 'lowercase') {
      return `italic ${fontSize}px KaTeX_Math, KaTeX_Main, Times New Roman, serif`;
    } else {
      // 대문자/숫자/대괄호는 볼드 적용 안 함
      return `${fontSize}px KaTeX_Main, Times New Roman, serif`;
    }
  }

  /**
   * 상첨자가 포함된 텍스트 렌더링
   * @param {Array} parts - 파싱된 텍스트 파트 배열
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   * @param {string} alignment - 정렬 ('left', 'center', 'right')
   * @param {string} color - 텍스트 색상
   * @param {boolean} bold - 볼드 여부
   * @param {boolean} isHeader - 헤더 여부 (헤더는 더 작은 폰트)
   */
  _renderWithSuperscript(parts, x, y, alignment, color, bold = false, isHeader = false) {
    // 헤더인 경우 더 작은 폰트 사용 (_renderCellText와 동일한 기준)
    const normalFontSize = isHeader ? 22 : 24;
    const superFontSize = isHeader ? 12 : 14;
    const superYOffset = isHeader ? -7 : -8;

    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.textBaseline = 'middle';

    // 전체 너비 계산 (각 파트를 문자 유형별로 분리하여 측정)
    let totalWidth = 0;
    parts.forEach(part => {
      const fontSize = part.super ? superFontSize : normalFontSize;
      const segments = this._splitByCharType(part.text);
      segments.forEach(seg => {
        this.ctx.font = this._getFontForCharType(seg.type, fontSize, bold && !part.super);
        totalWidth += this.ctx.measureText(seg.text).width;
      });
    });

    // 정렬에 따른 시작 X 좌표
    let currentX;
    if (alignment === 'center') {
      currentX = x - totalWidth / 2;
    } else if (alignment === 'right') {
      currentX = x - totalWidth;
    } else {
      currentX = x;
    }

    // 각 파트 렌더링 (문자 유형별로 분리하여 렌더링)
    this.ctx.textAlign = 'left';
    parts.forEach(part => {
      const fontSize = part.super ? superFontSize : normalFontSize;
      const yOffset = part.super ? superYOffset : 0;
      const segments = this._splitByCharType(part.text);

      segments.forEach(seg => {
        this.ctx.font = this._getFontForCharType(seg.type, fontSize, bold && !part.super);
        this.ctx.fillText(seg.text, currentX, y + yOffset);
        currentX += this.ctx.measureText(seg.text).width;
      });
    });

    this.ctx.restore();
  }

  /**
   * Canvas로 탈리마크 그리기 (정자 스타일: 세로선 4개 + 대각선 = 5)
   * @param {number} count - 탈리 개수
   * @param {number} cellX - 셀 X 좌표
   * @param {number} cellY - 셀 Y 좌표
   * @param {number} cellWidth - 셀 너비
   * @param {number} cellHeight - 셀 높이
   * @param {string} color - 선 색상
   */
  _renderTallyCanvas(count, cellX, cellY, cellWidth, cellHeight, color) {
    if (count <= 0) return;

    const lineHeight = CONFIG.TALLY_LINE_HEIGHT;
    const lineSpacing = CONFIG.TALLY_LINE_SPACING;
    const groupSpacing = CONFIG.TALLY_GROUP_SPACING;

    // 전체 너비 계산
    const groups = Math.floor(count / 5);
    const remainder = count % 5;
    const groupWidth = 4 * lineSpacing; // 5개 묶음 너비 (세로선 4개 + 대각선)
    const remainderWidth = remainder > 0 ? (remainder - 1) * lineSpacing : 0;
    // 간격 개수: 그룹만 있으면 groups-1, 나머지도 있으면 groups
    const numGaps = groups > 0 ? (remainder > 0 ? groups : Math.max(0, groups - 1)) : 0;
    const totalWidth = groups * groupWidth + numGaps * groupSpacing + remainderWidth;

    // 셀 중앙 정렬
    let x = cellX + (cellWidth - totalWidth) / 2;
    const y = cellY + cellHeight / 2;

    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = CONFIG.TALLY_LINE_WIDTH;
    this.ctx.lineCap = 'round';

    let remaining = count;

    while (remaining > 0) {
      if (remaining >= 5) {
        // 5개 묶음: 세로선 4개 + 대각선
        this._drawTallyGroup(x, y, lineHeight, lineSpacing);
        x += groupWidth + groupSpacing;
        remaining -= 5;
      } else {
        // 나머지: 세로선만
        for (let i = 0; i < remaining; i++) {
          this._drawTallyLine(x + i * lineSpacing, y, lineHeight);
        }
        remaining = 0;
      }
    }

    this.ctx.restore();
  }

  /**
   * 탈리 슬래시 1개 그리기 (/)
   * @param {number} x - X 좌표
   * @param {number} y - 중앙 Y 좌표
   * @param {number} height - 선 높이
   */
  _drawTallyLine(x, y, height) {
    this.ctx.beginPath();
    this.ctx.moveTo(x - height / 4, y + height / 2);  // 왼쪽 아래
    this.ctx.lineTo(x + height / 4, y - height / 2);  // 오른쪽 위
    this.ctx.stroke();
  }

  /**
   * 탈리 5개 묶음 그리기 (슬래시 4개 + 교차선)
   * @param {number} x - 시작 X 좌표
   * @param {number} y - 중앙 Y 좌표
   * @param {number} height - 선 높이
   * @param {number} spacing - 선 간격
   */
  _drawTallyGroup(x, y, height, spacing) {
    // 슬래시 4개 (/)
    for (let i = 0; i < 4; i++) {
      this._drawTallyLine(x + i * spacing, y, height);
    }
    // 교차선 (\) - 왼쪽 위 → 오른쪽 아래
    this.ctx.beginPath();
    this.ctx.moveTo(x - spacing * 0.3, y - height / 2);  // 왼쪽 위
    this.ctx.lineTo(x + 3 * spacing + spacing * 0.3, y + height / 2);  // 오른쪽 아래
    this.ctx.stroke();
  }

  /**
   * 애니메이션 배경 렌더링 (펄스 효과)
   * @param {number} x - 셀 X 좌표
   * @param {number} y - 셀 Y 좌표
   * @param {number} width - 셀 너비
   * @param {number} height - 셀 높이
   * @param {number} progress - 애니메이션 진행도 (0~1)
   */
  _renderAnimationBackground(x, y, width, height, progress) {
    // 색상: #89EC4E (RGB: 137, 236, 78)
    const fillAlpha = progress * 0.3; // fill: 30% opacity
    const strokeAlpha = progress; // stroke: 100% opacity

    this.ctx.save();

    // Fill (30% opacity)
    this.ctx.fillStyle = `rgba(137, 236, 78, ${fillAlpha})`;
    this.ctx.fillRect(x, y, width, height);

    // Stroke (100% opacity)
    this.ctx.strokeStyle = `rgba(137, 236, 78, ${strokeAlpha})`;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x + 1, y + 1, width - 2, height - 2);

    this.ctx.restore();
  }
}

export default TableCellRenderer;

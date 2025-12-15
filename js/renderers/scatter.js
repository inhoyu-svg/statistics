/**
 * 산점도 렌더러
 * X-Y 좌표 데이터를 점으로 시각화
 */

import CONFIG from '../config.js';
import * as KatexUtils from '../utils/katex.js';

class ScatterRenderer {
  /**
   * 산점도 렌더링
   * @param {HTMLCanvasElement} canvas - Canvas 요소
   * @param {Object} config - 설정 객체
   * @returns {Object} 렌더링 결과
   */
  static render(canvas, config) {
    const ctx = canvas.getContext('2d');
    const data = config.data; // [[x1, y1], [x2, y2], ...]
    const options = config.options || {};

    // 캔버스 크기 설정
    const width = config.canvasWidth || CONFIG.SCATTER_DEFAULT_WIDTH;
    const height = config.canvasHeight || CONFIG.SCATTER_DEFAULT_HEIGHT;
    canvas.width = width;
    canvas.height = height;

    // 캔버스 크기 설정 (폰트 스케일링용)
    CONFIG.setCanvasSize(Math.max(width, height));

    // 배경 투명 (클리어)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 데이터 검증
    if (!data || !Array.isArray(data) || data.length < 2) {
      this._drawNoDataMessage(ctx, canvas);
      return { error: '최소 2개의 데이터 포인트가 필요합니다.' };
    }

    // 데이터 범위 추출
    const range = this._extractRange(data);

    // 좌표계 생성
    const padding = CONFIG.getScaledValue(CONFIG.SCATTER_PADDING);
    const coords = this._createCoordinateSystem(canvas, padding, range);

    // 렌더링
    this._drawGrid(ctx, canvas, padding, coords, range);
    this._drawAxes(ctx, canvas, padding, coords, range, options.axisLabels);
    this._drawPoints(ctx, data, coords, options);

    return { success: true, coords, range };
  }

  /**
   * 데이터에서 범위 추출
   */
  static _extractRange(data) {
    const xValues = data.map(p => p[0]);
    const yValues = data.map(p => p[1]);

    const xDataMin = Math.min(...xValues);
    const xDataMax = Math.max(...xValues);
    const yDataMin = Math.min(...yValues);
    const yDataMax = Math.max(...yValues);

    // 데이터 범위 기반 깔끔한 간격 계산
    const xRange = xDataMax - xDataMin;
    const yRange = yDataMax - yDataMin;

    const xInterval = this._calculateNiceInterval(xRange);
    const yInterval = this._calculateNiceInterval(yRange);

    // 축 시작/끝을 간격의 배수로 맞춤
    const xMin = Math.floor(xDataMin / xInterval) * xInterval;
    const xMax = Math.ceil(xDataMax / xInterval) * xInterval;
    const yMin = Math.floor(yDataMin / yInterval) * yInterval;
    const yMax = Math.ceil(yDataMax / yInterval) * yInterval;

    return {
      xMin,
      xMax,
      yMin,
      yMax,
      xDataMin,
      xDataMax,
      yDataMin,
      yDataMax,
      xInterval,
      yInterval
    };
  }

  /**
   * 깔끔한 축 간격 계산 (1, 2, 5, 10, 20, 50, 100 등)
   */
  static _calculateNiceInterval(range) {
    if (range <= 0) return 1;

    // 대략 4~6개의 눈금을 목표로 함
    const roughInterval = range / 5;

    // 10의 거듭제곱 찾기
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughInterval)));

    // 깔끔한 간격 후보: 1, 2, 5, 10 배수
    const candidates = [1, 2, 5, 10];

    for (const c of candidates) {
      const interval = c * magnitude;
      if (interval >= roughInterval) {
        return interval;
      }
    }

    return 10 * magnitude;
  }

  /**
   * 좌표계 생성
   * 왼쪽/아래: 압축 구간 1칸, 오른쪽/위: 여유 공간 1칸
   */
  static _createCoordinateSystem(canvas, padding, range) {
    const chartW = canvas.width - padding * 2;
    const chartH = canvas.height - padding * 2;

    // 데이터 구간 수 계산
    const xDataCells = Math.round((range.xMax - range.xMin) / range.xInterval);
    const yDataCells = Math.round((range.yMax - range.yMin) / range.yInterval);

    // 전체 구간 수 = 압축(1) + 데이터 구간 + 여유(1)
    const xTotalCells = 1 + xDataCells + 1;
    const yTotalCells = 1 + yDataCells + 1;

    const xCellWidth = chartW / xTotalCells;
    const yCellHeight = chartH / yTotalCells;

    // X축 좌표 변환: 값 → 캔버스 x좌표
    // 압축 구간(1칸) 이후부터 데이터 시작
    const toX = (value) => {
      const dataOffset = (value - range.xMin) / range.xInterval;
      return padding + (1 + dataOffset) * xCellWidth;
    };

    // Y축 좌표 변환: 값 → 캔버스 y좌표 (위아래 반전)
    // 위쪽 여유 공간(1칸) 이후부터 데이터 시작
    const toY = (value) => {
      const dataOffset = (value - range.yMin) / range.yInterval;
      return canvas.height - padding - (1 + dataOffset) * yCellHeight;
    };

    return { toX, toY, chartW, chartH, xCellWidth, yCellHeight, xTotalCells, yTotalCells };
  }

  /**
   * 그리드 렌더링
   */
  static _drawGrid(ctx, canvas, padding, coords, range) {
    const { toX, toY, xCellWidth, yCellHeight, xTotalCells, yTotalCells } = coords;
    ctx.lineWidth = CONFIG.getScaledLineWidth('thin');

    // 가로 격자선 (Y축) - 모든 칸에 그리기
    ctx.strokeStyle = CONFIG.getColor('--color-grid-horizontal');
    for (let i = 1; i < yTotalCells; i++) {
      const y = canvas.height - padding - i * yCellHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }

    // 세로 격자선 (X축) - 모든 칸에 그리기
    ctx.strokeStyle = CONFIG.getColor('--color-grid-vertical');
    for (let i = 1; i < xTotalCells; i++) {
      const x = padding + i * xCellWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, canvas.height - padding);
      ctx.stroke();
    }

    // 축선 (사각형 테두리 - 하단, 좌측, 상단, 우측)
    ctx.strokeStyle = CONFIG.getColor('--color-axis');
    ctx.lineWidth = CONFIG.getScaledLineWidth('medium');

    // X축선 (하단)
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Y축선 (좌측)
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.stroke();

    // 상단 테두리
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(canvas.width - padding, padding);
    ctx.stroke();

    // 우측 테두리
    ctx.beginPath();
    ctx.moveTo(canvas.width - padding, padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // X축 압축 기호 (≈) - 축 위에 위치
    this._drawEllipsisSymbol(ctx, padding + xCellWidth / 2, canvas.height - padding, true);

    // Y축 압축 기호 (≈) - 축 위에 위치
    this._drawEllipsisSymbol(ctx, padding, canvas.height - padding - yCellHeight / 2, false);
  }

  /**
   * 압축 기호 (≈) 렌더링 - 축 위에 배치
   */
  static _drawEllipsisSymbol(ctx, x, y, isHorizontal) {
    ctx.save();
    // 산점도에서 중략 기호 크기 키움
    ctx.font = `400 ${CONFIG.getScaledFontSize(28)}px 'SCDream', sans-serif`;
    ctx.fillStyle = CONFIG.getColor('--color-ellipsis');
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    if (isHorizontal) {
      // X축용: 축 선 위에 90도 회전하여 수직으로 표시
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 2);
      ctx.fillText(CONFIG.AXIS_ELLIPSIS_SYMBOL, 0, 0);
    } else {
      // Y축용: 축 선 위에 수평으로 표시
      ctx.fillText(CONFIG.AXIS_ELLIPSIS_SYMBOL, x, y);
    }
    ctx.restore();
  }

  /**
   * 축 및 라벨 렌더링
   */
  static _drawAxes(ctx, canvas, padding, coords, range, axisLabels = {}) {
    const { toX, toY } = coords;
    const color = CONFIG.getColor('--color-text');
    // 숫자 라벨 크기 키움
    const fontSize = CONFIG.getScaledFontSize(22);

    // X축 라벨 - xMin부터 xMax + interval까지 (여유 칸 라벨 포함)
    const xLabelY = canvas.height - padding + CONFIG.getScaledValue(25);
    const xLabelMax = range.xMax + range.xInterval; // 여유 칸까지
    for (let value = range.xMin; value <= xLabelMax + 0.001; value += range.xInterval) {
      const x = toX(value);
      // 정수면 정수로, 소수면 소수로 표시
      const label = Number.isInteger(value) ? String(value) : value.toFixed(1);
      KatexUtils.render(ctx, label, x, xLabelY, {
        fontSize, color, align: 'center', baseline: 'top'
      });
    }

    // Y축 라벨 - yMin부터 yMax + interval까지 (여유 칸 라벨 포함)
    const yLabelX = padding - CONFIG.getScaledValue(12);
    const yLabelMax = range.yMax + range.yInterval; // 여유 칸까지
    for (let value = range.yMin; value <= yLabelMax + 0.001; value += range.yInterval) {
      const y = toY(value);
      // 정수면 정수로, 소수면 소수로 표시
      const label = Number.isInteger(value) ? String(value) : value.toFixed(1);
      KatexUtils.render(ctx, label, yLabelX, y, {
        fontSize, color, align: 'right', baseline: 'middle'
      });
    }

    // 축 제목
    const xTitle = axisLabels?.xAxis || '';
    const yTitle = axisLabels?.yAxis || '';

    // X축 제목: 오른쪽 끝, 숫자 라벨 아래로 더 내림
    if (xTitle) {
      KatexUtils.renderMixedText(ctx, xTitle,
        canvas.width - padding,
        canvas.height - padding + CONFIG.getScaledValue(55),
        { fontSize: CONFIG.getScaledFontSize(18), color, align: 'right', baseline: 'top' }
      );
    }

    // Y축 제목: 상단
    if (yTitle) {
      KatexUtils.renderMixedText(ctx, yTitle,
        padding,
        padding - CONFIG.getScaledValue(15),
        { fontSize: CONFIG.getScaledFontSize(18), color, align: 'left', baseline: 'bottom' }
      );
    }
  }

  /**
   * 데이터 점 렌더링
   */
  static _drawPoints(ctx, data, coords, options) {
    const { toX, toY } = coords;
    const pointSize = CONFIG.getScaledValue(options.pointSize || CONFIG.SCATTER_POINT_RADIUS);
    const pointColor = options.pointColor || CONFIG.SCATTER_POINT_COLOR;

    ctx.fillStyle = pointColor;

    data.forEach(([x, y]) => {
      const cx = toX(x);
      const cy = toY(y);

      ctx.beginPath();
      ctx.arc(cx, cy, pointSize, 0, Math.PI * 2);
      ctx.fill();

      // 테두리 (어둡게)
      ctx.strokeStyle = this._darkenColor(pointColor, 0.3);
      ctx.lineWidth = CONFIG.getScaledLineWidth('thin');
      ctx.stroke();
    });
  }

  /**
   * 색상을 어둡게
   */
  static _darkenColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - Math.round(255 * amount));
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - Math.round(255 * amount));
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - Math.round(255 * amount));
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * 데이터 없음 메시지
   */
  static _drawNoDataMessage(ctx, canvas) {
    ctx.fillStyle = CONFIG.getColor('--color-text');
    ctx.font = CONFIG.CHART_FONT_BOLD;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('데이터가 없습니다.', canvas.width / 2, canvas.height / 2);
  }

  /**
   * 데이터 유효성 검사
   * @param {Array} data - 데이터 배열
   * @returns {{ valid: boolean, error: string|null }}
   */
  static validate(data) {
    if (!data || !Array.isArray(data)) {
      return { valid: false, error: 'data는 배열이어야 합니다.' };
    }
    if (data.length < 2) {
      return { valid: false, error: '최소 2개의 데이터 포인트가 필요합니다.' };
    }
    for (let i = 0; i < data.length; i++) {
      const point = data[i];
      if (!Array.isArray(point) || point.length !== 2) {
        return { valid: false, error: `${i}번째 포인트는 [x, y] 형식이어야 합니다.` };
      }
      if (typeof point[0] !== 'number' || typeof point[1] !== 'number') {
        return { valid: false, error: `${i}번째 포인트의 x, y는 숫자여야 합니다.` };
      }
    }
    return { valid: true, error: null };
  }
}

export default ScatterRenderer;

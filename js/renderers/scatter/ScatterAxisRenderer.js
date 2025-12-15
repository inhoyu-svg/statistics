/**
 * 산점도 축 렌더러
 * 그리드선 및 축 라벨 렌더링
 */

import CONFIG from '../../config.js';
import * as KatexUtils from '../../utils/katex.js';
import ScatterCoordinateSystem from './ScatterCoordinateSystem.js';

class ScatterAxisRenderer {
  /**
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   */
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * 그리드 및 축 렌더링
   * @param {Object} coords - 좌표계 객체
   * @param {Object} options - 옵션
   * @param {Object} options.axisLabels - 축 라벨 { xAxis, yAxis }
   */
  draw(coords, options = {}) {
    const { axisLabels = {} } = options;

    // 그리드 라인 정보 가져오기
    const { xLines, yLines } = ScatterCoordinateSystem.getGridLines(coords);

    // 그리드선 그리기
    this._drawGridLines(coords, xLines, yLines);

    // 축선 그리기
    this._drawAxisLines(coords);

    // 축 라벨 그리기
    this._drawAxisLabels(coords, xLines, yLines);

    // 축 제목 그리기
    if (axisLabels.xAxis || axisLabels.yAxis) {
      this._drawAxisTitles(coords, axisLabels);
    }
  }

  /**
   * 그리드선 그리기
   */
  _drawGridLines(coords, xLines, yLines) {
    const { toX, toY, yMin, yMax, xMin, xMax } = coords;

    this.ctx.save();
    this.ctx.strokeStyle = CONFIG.SCATTER_GRID_COLOR;
    this.ctx.lineWidth = CONFIG.SCATTER_GRID_LINE_WIDTH;

    // 수직 그리드선 (X축 방향)
    xLines.forEach(({ value }) => {
      const x = toX(value);
      this.ctx.beginPath();
      this.ctx.moveTo(x, toY(yMin));
      this.ctx.lineTo(x, toY(yMax));
      this.ctx.stroke();
    });

    // 수평 그리드선 (Y축 방향)
    yLines.forEach(({ value }) => {
      const y = toY(value);
      this.ctx.beginPath();
      this.ctx.moveTo(toX(xMin), y);
      this.ctx.lineTo(toX(xMax), y);
      this.ctx.stroke();
    });

    this.ctx.restore();
  }

  /**
   * 축선 그리기 (X축, Y축)
   */
  _drawAxisLines(coords) {
    const { toX, toY, xMin, xMax, yMin, yMax } = coords;

    this.ctx.save();
    this.ctx.strokeStyle = CONFIG.SCATTER_AXIS_COLOR;
    this.ctx.lineWidth = CONFIG.SCATTER_AXIS_LINE_WIDTH;

    // X축 (yMin 위치)
    this.ctx.beginPath();
    this.ctx.moveTo(toX(xMin), toY(yMin));
    this.ctx.lineTo(toX(xMax), toY(yMin));
    this.ctx.stroke();

    // Y축 (xMin 위치)
    this.ctx.beginPath();
    this.ctx.moveTo(toX(xMin), toY(yMin));
    this.ctx.lineTo(toX(xMin), toY(yMax));
    this.ctx.stroke();

    this.ctx.restore();
  }

  /**
   * 축 라벨 그리기 (showLabel이 true인 경우에만)
   */
  _drawAxisLabels(coords, xLines, yLines) {
    const { toX, toY, yMin, xMin } = coords;
    const labelOffset = 8;

    this.ctx.save();

    // X축 라벨 (하단)
    xLines.forEach(({ value, showLabel }) => {
      if (!showLabel) return;

      const x = toX(value);
      const y = toY(yMin) + labelOffset + 14;

      KatexUtils.render(this.ctx, String(value), x, y, {
        fontSize: 14,
        color: CONFIG.SCATTER_LABEL_COLOR,
        align: 'center',
        baseline: 'top'
      });
    });

    // Y축 라벨 (좌측)
    yLines.forEach(({ value, showLabel }) => {
      if (!showLabel) return;

      const x = toX(xMin) - labelOffset;
      const y = toY(value);

      KatexUtils.render(this.ctx, String(value), x, y, {
        fontSize: 14,
        color: CONFIG.SCATTER_LABEL_COLOR,
        align: 'right',
        baseline: 'middle'
      });
    });

    this.ctx.restore();
  }

  /**
   * 축 제목 그리기
   */
  _drawAxisTitles(coords, axisLabels) {
    const { toX, toY, xMin, xMax, yMin, yMax, canvasHeight, padding } = coords;

    this.ctx.save();

    // X축 제목 (하단 중앙)
    if (axisLabels.xAxis) {
      const x = (toX(xMin) + toX(xMax)) / 2;
      const y = canvasHeight - padding / 3;

      this.ctx.font = CONFIG.SCATTER_FONT_TITLE;
      this.ctx.fillStyle = CONFIG.SCATTER_LABEL_COLOR;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(axisLabels.xAxis, x, y);
    }

    // Y축 제목 (좌측 중앙, 세로 회전)
    if (axisLabels.yAxis) {
      const x = padding / 3;
      const y = (toY(yMin) + toY(yMax)) / 2;

      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.rotate(-Math.PI / 2);
      this.ctx.font = CONFIG.SCATTER_FONT_TITLE;
      this.ctx.fillStyle = CONFIG.SCATTER_LABEL_COLOR;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(axisLabels.yAxis, 0, 0);
      this.ctx.restore();
    }

    this.ctx.restore();
  }
}

export default ScatterAxisRenderer;

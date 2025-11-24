/**
 * 파선 렌더러
 * 점에서 Y축으로 수직 파선 그리기
 */

import CONFIG from '../../config.js';

class DashedLineRenderer {
  /**
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   */
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * 파선 레이어 렌더링
   * @param {Layer} layer - 파선 레이어
   */
  render(layer) {
    const { index, relativeFreq, coords } = layer.data;
    const { toX, toY, xScale } = coords;

    // 점의 위치
    const pointX = toX(index) + xScale * CONFIG.CHART_BAR_CENTER_OFFSET;
    const pointY = toY(relativeFreq);

    // Y축까지 수직 파선
    const leftEdgeX = toX(0); // Y축 위치

    this.ctx.save();
    this.ctx.strokeStyle = CONFIG.getColor('--chart-polygon-point-color'); // 점과 동일한 색상
    this.ctx.lineWidth = 1.5;
    this.ctx.setLineDash([5, 5]); // 파선 패턴 (5px 선, 5px 공백)

    this.ctx.beginPath();
    this.ctx.moveTo(pointX, pointY);
    this.ctx.lineTo(leftEdgeX, pointY);
    this.ctx.stroke();

    this.ctx.restore(); // setLineDash 초기화
  }
}

export default DashedLineRenderer;

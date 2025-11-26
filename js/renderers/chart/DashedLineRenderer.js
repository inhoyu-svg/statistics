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
    if (!layer.data) {
      console.error('❌ layer.data가 없습니다:', layer);
      return;
    }

    const { index, relativeFreq, coords, animationProgress = 1.0 } = layer.data;

    if (!coords) {
      console.error('❌ coords가 없습니다:', layer.data);
      return;
    }

    const { toX, toY, xScale } = coords;

    // 점의 위치 (우측 시작점)
    const pointX = toX(index) + xScale * CONFIG.CHART_BAR_CENTER_OFFSET;
    const pointY = toY(relativeFreq);

    // Y축 위치 (좌측 끝점)
    const leftEdgeX = toX(0);

    // 애니메이션 진행도에 따라 현재 끝점 계산 (우→좌)
    const currentEndX = pointX - (pointX - leftEdgeX) * animationProgress;

    this.ctx.save();
    this.ctx.strokeStyle = CONFIG.getColor('--chart-dashed-line-color');
    this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_DASHED;
    this.ctx.setLineDash(CONFIG.CHART_DASHED_PATTERN);

    this.ctx.beginPath();
    this.ctx.moveTo(pointX, pointY);
    this.ctx.lineTo(currentEndX, pointY);
    this.ctx.stroke();

    this.ctx.restore(); // setLineDash 초기화
  }
}

export default DashedLineRenderer;

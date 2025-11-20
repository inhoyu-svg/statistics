/**
 * 히스토그램 렌더러
 * 막대 차트 렌더링 로직
 */

import CONFIG from '../../config.js';
import CoordinateSystem from './CoordinateSystem.js';

class HistogramRenderer {
  /**
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   */
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * 히스토그램 그리기 (정적 렌더링)
   * @param {Array} relativeFreqs - 상대도수 배열
   * @param {Array} freq - 도수 배열
   * @param {Object} coords - 좌표 시스템 객체
   * @param {Object} ellipsisInfo - 중략 정보
   */
  draw(relativeFreqs, freq, coords, ellipsisInfo) {
    const { toX, toY, xScale } = coords;

    relativeFreqs.forEach((relativeFreq, index) => {
      if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;

      const x = toX(index);
      const y = toY(relativeFreq);
      const h = toY(0) - y;
      const barWidth = xScale * CONFIG.CHART_BAR_WIDTH_RATIO;

      // 그라디언트 막대
      const gradient = this.ctx.createLinearGradient(x, y, x, y + h);
      gradient.addColorStop(0, CONFIG.getColor('--chart-bar-color'));
      gradient.addColorStop(1, CONFIG.getColor('--chart-bar-color-end'));

      this.ctx.globalAlpha = 0.5;
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(x, y, barWidth, h);
      this.ctx.globalAlpha = 1.0;

      // 녹색 테두리 (데이터가 있는 경우)
      if (freq[index] > 0) {
        this.ctx.strokeStyle = CONFIG.CHART_BAR_BORDER_COLOR;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, barWidth, h);
      }

      // 도수 라벨
      this.ctx.fillStyle = CONFIG.getColor('--color-text');
      this.ctx.font = CONFIG.CHART_FONT_REGULAR;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        freq[index],
        CoordinateSystem.getBarCenterX(index, toX, xScale),
        y - CONFIG.CHART_LABEL_OFFSET
      );
    });
  }

  /**
   * 개별 막대 렌더링 (레이어 시스템용)
   * @param {Layer} layer - 막대 레이어
   */
  renderBar(layer) {
    const { index, relativeFreq, frequency, coords } = layer.data;
    const { toX, toY, xScale } = coords;

    // 애니메이션 progress 가져오기 (0~1)
    const progress = layer.data.animationProgress !== undefined ? layer.data.animationProgress : 1;

    const x = toX(index);
    const baseY = toY(0); // 바닥 (높이 0)
    const fullY = toY(relativeFreq); // 최종 높이
    const fullH = baseY - fullY; // 전체 높이

    // progress에 따라 높이 조절 (밑에서 위로 자라남)
    const animatedH = fullH * progress;
    const animatedY = baseY - animatedH;
    const barWidth = xScale * CONFIG.CHART_BAR_WIDTH_RATIO;

    // 그라디언트 막대
    const gradient = this.ctx.createLinearGradient(x, animatedY, x, animatedY + animatedH);
    gradient.addColorStop(0, CONFIG.getColor('--chart-bar-color'));
    gradient.addColorStop(1, CONFIG.getColor('--chart-bar-color-end'));

    this.ctx.globalAlpha = 0.5;
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, animatedY, barWidth, animatedH);
    this.ctx.globalAlpha = 1.0;

    // 녹색 테두리 (데이터가 있는 경우)
    if (frequency > 0) {
      this.ctx.strokeStyle = CONFIG.CHART_BAR_BORDER_COLOR;
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x, animatedY, barWidth, animatedH);
    }

    // 도수 라벨 (progress가 0.5 이상일 때만 표시)
    if (progress > 0.5) {
      this.ctx.fillStyle = CONFIG.getColor('--color-text');
      this.ctx.font = CONFIG.CHART_FONT_REGULAR;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        frequency,
        CoordinateSystem.getBarCenterX(index, toX, xScale),
        animatedY - CONFIG.CHART_LABEL_OFFSET
      );
    }
  }
}

export default HistogramRenderer;

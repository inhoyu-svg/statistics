/**
 * 히스토그램 렌더러
 * 막대 차트 렌더링 로직
 */

import CONFIG from '../../config.js';
import Utils from '../../utils/utils.js';
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
   * @param {Array} values - 값 배열 (상대도수 또는 도수)
   * @param {Array} freq - 도수 배열
   * @param {Object} coords - 좌표 시스템 객체
   * @param {Object} ellipsisInfo - 중략 정보
   * @param {string} dataType - 데이터 타입 ('relativeFrequency', 'frequency', 등)
   */
  draw(values, freq, coords, ellipsisInfo, dataType = 'relativeFrequency') {
    const { toX, toY, xScale } = coords;

    values.forEach((value, index) => {
      if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;

      const x = toX(index);
      const y = toY(value);
      const h = toY(0) - y;
      const barWidth = xScale * CONFIG.CHART_BAR_WIDTH_RATIO;

      // 그라디언트 막대
      const gradient = this.ctx.createLinearGradient(x, y, x, y + h);
      gradient.addColorStop(0, CONFIG.getColor('--chart-bar-color'));
      gradient.addColorStop(1, CONFIG.getColor('--chart-bar-color-end'));

      this.ctx.globalAlpha = CONFIG.CHART_BAR_ALPHA;
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(x, y, barWidth, h);
      this.ctx.globalAlpha = CONFIG.CHART_DEFAULT_ALPHA;

      // 그라디언트 테두리 (데이터가 있는 경우)
      if (freq[index] > 0) {
        const strokeGradient = Utils.createVerticalGradient(
          this.ctx, x, y, h,
          CONFIG.getColor('--chart-bar-stroke-start'),
          CONFIG.getColor('--chart-bar-stroke-end')
        );
        this.ctx.strokeStyle = strokeGradient;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, barWidth, h);
      }

      // 라벨은 별도 레이어에서 렌더링 (LayerFactory의 bar-label 레이어)
    });
  }

  /**
   * 개별 막대 렌더링 (레이어 시스템용)
   * @param {Layer} layer - 막대 레이어
   */
  renderBar(layer) {
    const { index, relativeFreq, frequency, coords, dataType } = layer.data;
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

    this.ctx.globalAlpha = CONFIG.CHART_BAR_ALPHA;
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, animatedY, barWidth, animatedH);
    this.ctx.globalAlpha = CONFIG.CHART_DEFAULT_ALPHA;

    // 그라디언트 테두리 (데이터가 있고 높이가 0보다 클 때만)
    if (frequency > 0 && animatedH > 0) {
      const strokeGradient = Utils.createVerticalGradient(
        this.ctx, x, animatedY, animatedH,
        CONFIG.getColor('--chart-bar-stroke-start'),
        CONFIG.getColor('--chart-bar-stroke-end')
      );
      this.ctx.strokeStyle = strokeGradient;
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x, animatedY, barWidth, animatedH);
    }

    // 라벨은 별도 레이어에서 렌더링 (LayerFactory의 bar-label 레이어)
  }

  /**
   * 막대 라벨 렌더링 (별도 레이어)
   * @param {Layer} layer - 라벨 레이어
   */
  renderBarLabel(layer) {
    if (!CONFIG.SHOW_BAR_LABELS) return;

    const { index, relativeFreq, frequency, coords, dataType } = layer.data;
    const { toX, toY, xScale } = coords;

    // 애니메이션 progress 가져오기 (0~1)
    const progress = layer.data.animationProgress !== undefined ? layer.data.animationProgress : 1;

    // progress가 0.5 이상일 때만 표시 (0.5~1.0 구간을 0~1로 매핑하여 fade)
    if (progress < 0.5) return;

    // 0.5~1.0을 0~1로 정규화하여 fade 효과
    const fadeProgress = (progress - 0.5) * 2; // 0.5일 때 0, 1.0일 때 1

    const labelValue = this._formatLabelValue(relativeFreq, frequency, dataType);
    const y = toY(relativeFreq);

    // fade 효과 적용
    this.ctx.save();
    this.ctx.globalAlpha = fadeProgress;
    this.ctx.fillStyle = CONFIG.getColor('--color-text');
    this.ctx.font = CONFIG.CHART_FONT_REGULAR;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      labelValue,
      CoordinateSystem.getBarCenterX(index, toX, xScale),
      y - CONFIG.CHART_LABEL_OFFSET - 5
    );
    this.ctx.restore();
  }

  /**
   * 라벨 값 포맷팅
   * @param {number} value - 표시할 값 (상대도수 또는 도수)
   * @param {number} frequency - 도수
   * @param {string} dataType - 데이터 타입
   * @returns {string} 포맷팅된 라벨
   */
  _formatLabelValue(value, frequency, dataType = 'relativeFrequency') {
    if (dataType === 'frequency') {
      return frequency.toString();
    } else {
      // 상대도수: 백분율로 표시 (% 기호는 Y축 제목에 표시)
      const percentage = value * 100;
      const formatted = Utils.formatNumber(percentage);
      // .00 제거 (예: 20.00 → 20)
      return formatted.replace(/\.00$/, '');
    }
  }
}

export default HistogramRenderer;

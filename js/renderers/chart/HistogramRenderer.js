/**
 * 히스토그램 렌더러
 * 막대 차트 렌더링 로직
 */

import CONFIG from '../../config.js';
import Utils from '../../utils/utils.js';
import CoordinateSystem from './CoordinateSystem.js';
import * as KatexUtils from '../../utils/katex.js';

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

    // 프리셋 색상 가져오기
    const preset = CONFIG.HISTOGRAM_COLOR_PRESETS[CONFIG.HISTOGRAM_COLOR_PRESET]
                || CONFIG.HISTOGRAM_COLOR_PRESETS.default;

    values.forEach((value, index) => {
      if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;

      const x = toX(index);
      const y = toY(value);
      const h = toY(0) - y;
      const barWidth = xScale * CONFIG.CHART_BAR_WIDTH_RATIO;

      // 그라디언트 막대
      const gradient = this.ctx.createLinearGradient(x, y, x, y + h);
      gradient.addColorStop(0, preset.fillStart);
      gradient.addColorStop(1, preset.fillEnd);

      this.ctx.globalAlpha = preset.alpha;
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(x, y, barWidth, h);
      this.ctx.globalAlpha = CONFIG.CHART_DEFAULT_ALPHA;

      // 그라디언트 테두리 (데이터가 있는 경우)
      if (freq[index] > 0) {
        const strokeGradient = Utils.createVerticalGradient(
          this.ctx, x, y, h,
          preset.strokeStart,
          preset.strokeEnd
        );
        this.ctx.strokeStyle = strokeGradient;
        this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_NORMAL;
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

    // 프리셋 색상 가져오기
    const preset = CONFIG.HISTOGRAM_COLOR_PRESETS[CONFIG.HISTOGRAM_COLOR_PRESET]
                || CONFIG.HISTOGRAM_COLOR_PRESETS.default;

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
    gradient.addColorStop(0, preset.fillStart);
    gradient.addColorStop(1, preset.fillEnd);

    this.ctx.globalAlpha = preset.alpha;
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, animatedY, barWidth, animatedH);
    this.ctx.globalAlpha = CONFIG.CHART_DEFAULT_ALPHA;

    // 그라디언트 테두리 (데이터가 있고 높이가 0보다 클 때만)
    if (frequency > 0 && animatedH > 0) {
      const strokeGradient = Utils.createVerticalGradient(
        this.ctx, x, animatedY, animatedH,
        preset.strokeStart,
        preset.strokeEnd
      );
      this.ctx.strokeStyle = strokeGradient;
      this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_NORMAL;
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
    const fadeProgress = (progress - 0.5) * 2;

    const labelValue = this._formatLabelValue(relativeFreq, frequency, dataType);
    const y = toY(relativeFreq);

    // fade 효과 적용 + KaTeX 폰트 사용
    this.ctx.save();
    this.ctx.globalAlpha = fadeProgress;
    KatexUtils.render(this.ctx, labelValue,
      CoordinateSystem.getBarCenterX(index, toX, xScale),
      y - CONFIG.CHART_LABEL_OFFSET - 5,
      { fontSize: CONFIG.getScaledFontSize(12), color: CONFIG.getColor('--color-text'), align: 'center', baseline: 'middle' }
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

  /**
   * 막대 내부 커스텀 라벨 렌더링
   * @param {Layer} layer - 커스텀 라벨 레이어
   */
  renderBarCustomLabel(layer) {
    console.log('[HistogramRenderer] renderBarCustomLabel called:', layer.data);
    const { index, relativeFreq, customLabel, coords } = layer.data;
    const { toX, toY, xScale } = coords;

    const progress = layer.data.animationProgress !== undefined ? layer.data.animationProgress : 1;
    if (progress < 0.5) return;  // 막대가 어느 정도 그려진 후 표시

    const fadeProgress = (progress - 0.5) * 2;

    // 막대 중앙 좌표 계산
    const barWidth = xScale * CONFIG.CHART_BAR_WIDTH_RATIO;
    const x = toX(index) + barWidth / 2;  // 가로 중앙

    // 세로 중앙 (애니메이션 progress 반영)
    const baseY = toY(0);
    const fullY = toY(relativeFreq);
    const animatedH = (baseY - fullY) * progress;
    const y = baseY - animatedH / 2;  // 세로 중앙

    this.ctx.save();
    this.ctx.globalAlpha = fadeProgress;
    KatexUtils.render(this.ctx, customLabel, x, y, {
      fontSize: CONFIG.getScaledFontSize(CONFIG.BAR_CUSTOM_LABEL_FONT_SIZE),
      color: CONFIG.BAR_CUSTOM_LABEL_COLOR,
      align: 'center',
      baseline: 'middle'
    });
    this.ctx.restore();
  }
}

export default HistogramRenderer;

/**
 * 파선 렌더러
 * 점에서 Y축으로 수직 파선 그리기
 */

import CONFIG from '../../config.js';
import Utils from '../../utils/utils.js';
import * as KatexUtils from '../../utils/katex.js';

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

    const { index, relativeFreq, coords, animationProgress = 1.0, dataType = 'relativeFrequency', histogramPreset = 'default' } = layer.data;

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

    // 히스토그램 프리셋에서 색상 가져오기
    const preset = CONFIG.HISTOGRAM_COLOR_PRESETS[histogramPreset]
                || CONFIG.HISTOGRAM_COLOR_PRESETS.default;
    const dashedLineColor = preset.strokeEnd || preset.strokeStart || CONFIG.getColor('--chart-dashed-line-color');

    this.ctx.save();
    this.ctx.strokeStyle = dashedLineColor;
    this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_DASHED;
    this.ctx.setLineDash(CONFIG.CHART_DASHED_PATTERN);

    this.ctx.beginPath();
    this.ctx.moveTo(pointX, pointY);
    this.ctx.lineTo(currentEndX, pointY);
    this.ctx.stroke();

    this.ctx.restore(); // setLineDash 초기화

    // 파선 끝점 라벨 (애니메이션 완료 시)
    if (animationProgress >= 1.0) {
      this._renderEndpointLabel(leftEdgeX, pointY, relativeFreq, dataType);
    }
  }

  /**
   * 파선 끝점(Y축)에 값 라벨 렌더링
   * @param {number} x - X 좌표 (Y축 위치)
   * @param {number} y - Y 좌표 (파선 높이)
   * @param {number} value - 표시할 값 (상대도수 또는 도수)
   * @param {string} dataType - 데이터 타입
   */
  _renderEndpointLabel(x, y, value, dataType) {
    const color = CONFIG.getColor('--color-text');
    const labelOffset = CONFIG.CHART_Y_LABEL_OFFSET || 10;

    // 데이터 타입에 따라 포맷팅
    let formattedValue;
    if (dataType === 'frequency') {
      formattedValue = Math.round(value).toString();
    } else {
      // 상대도수: decimal (0.03) 또는 percent (3%)
      if (CONFIG.AXIS_Y_LABEL_FORMAT === 'percent') {
        const percentage = value * 100;
        formattedValue = Utils.formatNumberClean(percentage) + '%';
      } else {
        formattedValue = Utils.formatNumberClean(value);
      }
    }

    // KaTeX 폰트로 렌더링 (Y축 라벨 왼쪽에 표시)
    KatexUtils.render(this.ctx, formattedValue,
      x - labelOffset,
      y,
      { fontSize: CONFIG.getScaledFontSize(22), color: color, align: 'right', baseline: 'middle' }
    );
  }
}

export default DashedLineRenderer;

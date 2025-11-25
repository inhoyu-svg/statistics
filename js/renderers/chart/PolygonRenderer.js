/**
 * 다각형 렌더러
 * 상대도수 다각형 (점 + 선) 렌더링 로직
 */

import CONFIG from '../../config.js';
import Utils from '../../utils/utils.js';
import CoordinateSystem from './CoordinateSystem.js';

class PolygonRenderer {
  /**
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   */
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * 상대도수 다각형 그리기 (정적 렌더링)
   * @param {Array} relativeFreqs - 상대도수 배열
   * @param {Object} coords - 좌표 시스템 객체
   * @param {Object} ellipsisInfo - 중략 정보
   */
  draw(relativeFreqs, coords, ellipsisInfo) {
    const { toX, toY, xScale } = coords;

    // 현재 프리셋의 색상 가져오기
    const preset = CONFIG.POLYGON_COLOR_PRESETS[CONFIG.POLYGON_COLOR_PRESET];
    const pointColor = preset?.pointColor || CONFIG.POLYGON_COLOR_PRESETS.default.pointColor;
    const gradientStart = preset?.gradientStart || CONFIG.POLYGON_COLOR_PRESETS.default.gradientStart;
    const gradientEnd = preset?.gradientEnd || CONFIG.POLYGON_COLOR_PRESETS.default.gradientEnd;

    // 점 그리기
    relativeFreqs.forEach((relativeFreq, index) => {
      if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;

      const centerX = CoordinateSystem.getBarCenterX(index, toX, xScale);
      const centerY = toY(relativeFreq);

      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, CONFIG.CHART_POINT_RADIUS, 0, Math.PI * 2);
      this.ctx.fillStyle = pointColor;
      this.ctx.fill();
    });

    // 선 그리기
    let prevIndex = null;
    relativeFreqs.forEach((relativeFreq, index) => {
      if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;

      if (prevIndex !== null) {
        const x1 = CoordinateSystem.getBarCenterX(prevIndex, toX, xScale);
        const y1 = toY(relativeFreqs[prevIndex]);
        const x2 = CoordinateSystem.getBarCenterX(index, toX, xScale);
        const y2 = toY(relativeFreq);

        // 그라디언트 선 (위에서 아래로)
        const lineGradient = Utils.createLineGradient(
          this.ctx, x1, y1, x2, y2,
          gradientStart,
          gradientEnd
        );

        this.ctx.strokeStyle = lineGradient;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
      }

      prevIndex = index;
    });
  }

  /**
   * 개별 점 렌더링 (레이어 시스템용)
   * @param {Layer} layer - 점 레이어
   */
  renderPoint(layer) {
    const { index, relativeFreq, coords, colorPreset } = layer.data;
    const { toX, xScale } = coords;

    const centerX = CoordinateSystem.getBarCenterX(index, toX, xScale);
    const centerY = coords.toY(relativeFreq);

    // 레이어에 저장된 색상 프리셋 사용 (없으면 현재 CONFIG 사용)
    const presetName = colorPreset || CONFIG.POLYGON_COLOR_PRESET;
    const preset = CONFIG.POLYGON_COLOR_PRESETS[presetName];
    const pointColor = preset?.pointColor || CONFIG.POLYGON_COLOR_PRESETS.default.pointColor;

    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, CONFIG.CHART_POINT_RADIUS, 0, Math.PI * 2);
    this.ctx.fillStyle = pointColor;
    this.ctx.fill();
  }

  /**
   * 개별 선 렌더링 (레이어 시스템용)
   * @param {Layer} layer - 선 레이어
   */
  renderLine(layer) {
    const { fromIndex, toIndex, fromFreq, toFreq, coords, colorPreset } = layer.data;
    const { toX, toY, xScale } = coords;

    const x1 = CoordinateSystem.getBarCenterX(fromIndex, toX, xScale);
    const y1 = toY(fromFreq);
    const x2 = CoordinateSystem.getBarCenterX(toIndex, toX, xScale);
    const y2 = toY(toFreq);

    // 레이어에 저장된 색상 프리셋 사용 (없으면 현재 CONFIG 사용)
    const presetName = colorPreset || CONFIG.POLYGON_COLOR_PRESET;
    const preset = CONFIG.POLYGON_COLOR_PRESETS[presetName];
    const gradientStart = preset?.gradientStart || CONFIG.POLYGON_COLOR_PRESETS.default.gradientStart;
    const gradientEnd = preset?.gradientEnd || CONFIG.POLYGON_COLOR_PRESETS.default.gradientEnd;

    // 그라디언트 선 (위에서 아래로)
    const lineGradient = Utils.createLineGradient(
      this.ctx, x1, y1, x2, y2,
      gradientStart,
      gradientEnd
    );

    this.ctx.strokeStyle = lineGradient;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }
}

export default PolygonRenderer;

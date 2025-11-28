/**
 * 합동 삼각형 렌더러
 * 히스토그램과 다각형 사이의 합동 삼각형을 렌더링
 */

import CONFIG from '../../config.js';
import KatexUtils from '../../utils/katex.js';

class TriangleRenderer {
  /**
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D 컨텍스트
   */
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * 삼각형 레이어 렌더링
   * @param {Object} layer - 삼각형 레이어 데이터
   */
  renderTriangle(layer) {
    const { points, fillColors, strokeColors, fillAlpha } = layer.data;
    const ctx = this.ctx;

    if (!points || points.length < 3) return;

    // 현재 globalAlpha 보존 (fade 애니메이션 효과)
    const currentAlpha = ctx.globalAlpha;
    if (currentAlpha <= 0) return;

    // 삼각형 경계 박스 계산 (그라디언트용)
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));

    ctx.save();

    // 삼각형 경로 생성
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.lineTo(points[2].x, points[2].y);
    ctx.closePath();

    // Fill 그라디언트 생성 및 적용
    if (fillColors && fillColors.start && fillColors.end) {
      const fillGradient = ctx.createLinearGradient(0, minY, 0, maxY);
      fillGradient.addColorStop(0, fillColors.start);
      fillGradient.addColorStop(1, fillColors.end);
      ctx.fillStyle = fillGradient;
      // 현재 alpha에 fillAlpha 곱셈 (fade 효과 유지)
      ctx.globalAlpha = currentAlpha * (fillAlpha ?? 1);
    }
    ctx.fill();

    // Stroke 그라디언트 생성 및 적용
    if (strokeColors && strokeColors.start && strokeColors.end) {
      ctx.globalAlpha = currentAlpha; // fade 효과 유지
      const strokeGradient = ctx.createLinearGradient(0, minY, 0, maxY);
      strokeGradient.addColorStop(0, strokeColors.start);
      strokeGradient.addColorStop(1, strokeColors.end);
      ctx.strokeStyle = strokeGradient;
      ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_NORMAL;
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * 삼각형 라벨 렌더링 (S₁, S₂)
   * @param {Object} layer - 라벨 레이어 데이터
   */
  renderTriangleLabel(layer) {
    const { text, subscript, x, y, color } = layer.data;
    const ctx = this.ctx;

    // 현재 globalAlpha 보존 (fade 애니메이션 효과)
    const currentAlpha = ctx.globalAlpha;
    if (currentAlpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = currentAlpha;

    // KaTeX_Main 폰트로 아래첨자 렌더링
    KatexUtils.renderWithScript(ctx, text, null, subscript, x, y, {
      fontSize: 30,
      color: color,
      align: 'center',
      baseline: 'middle'
    });

    ctx.restore();
  }

  /**
   * 삼각형 라벨 점선 렌더링
   * @param {Object} layer - 점선 레이어 데이터
   */
  renderTriangleLabelLine(layer) {
    const { fromX, fromY, toX, toY, color } = layer.data;
    const ctx = this.ctx;

    // 현재 globalAlpha 보존 (fade 애니메이션 효과)
    const currentAlpha = ctx.globalAlpha;
    if (currentAlpha <= 0) return;

    // 라벨 반경 (30px 폰트 기준, 라벨과 겹치지 않도록)
    const labelRadius = 18;

    // 방향 벡터 계산 (라벨 → 직각 모서리)
    const dx = toX - fromX;
    const dy = toY - fromY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 정규화된 방향 벡터
    const nx = dx / distance;
    const ny = dy / distance;

    // 점선 시작점을 라벨 바깥으로 오프셋
    const startX = fromX + nx * labelRadius;
    const startY = fromY + ny * labelRadius;

    ctx.save();
    ctx.globalAlpha = currentAlpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]); // 점선 패턴

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.setLineDash([]); // 점선 패턴 해제
    ctx.restore();
  }
}

export default TriangleRenderer;

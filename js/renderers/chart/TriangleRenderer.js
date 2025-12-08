/**
 * 합동 삼각형 렌더러
 * 히스토그램과 다각형 사이의 합동 삼각형을 렌더링
 */

import CONFIG from '../../config.js';
import KatexUtils from '../../utils/katex.js';
import CoordinateSystem from './CoordinateSystem.js';

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
      ctx.lineWidth = CONFIG.getScaledLineWidth('normal');
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
      fontSize: CONFIG.getScaledFontSize(30),
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

    // 라벨 반경 (30px 폰트 기준, 라벨과 겹치지 않도록) - 스케일링 적용
    const labelRadius = CONFIG.getScaledValue(18);

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
    ctx.lineWidth = CONFIG.getScaledLineWidth('thin');
    ctx.setLineDash(CONFIG.getScaledDashPattern()); // 점선 패턴

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.setLineDash([]); // 점선 패턴 해제
    ctx.restore();
  }

  /**
   * 정적 모드에서 합동 삼각형 렌더링 (애니메이션 없이)
   * @param {Array} values - 값 배열 (상대도수 또는 도수)
   * @param {Object} coords - 좌표 시스템 { toX, toY, xScale }
   */
  drawStatic(values, coords) {
    if (!CONFIG.SHOW_CONGRUENT_TRIANGLES || !CONFIG.SHOW_POLYGON) return;

    const i = CONFIG.CONGRUENT_TRIANGLE_INDEX;
    if (i < 0 || i >= values.length - 1) return;

    const { toX, toY, xScale } = coords;
    const ctx = this.ctx;

    // 투명도 초기화 (이전 렌더러에서 설정된 값 제거)
    ctx.globalAlpha = 1;

    // 좌표 계산
    const p1x = CoordinateSystem.getBarCenterX(i, toX, xScale);
    const p1y = toY(values[i]);
    const p2x = CoordinateSystem.getBarCenterX(i + 1, toX, xScale);
    const p2y = toY(values[i + 1]);

    // 막대 경계 X (막대 i의 우측 = 막대 i+1의 좌측)
    const boundaryX = toX(i + 1);

    // 선과 막대 경계의 교점 Y 계산 (선형 보간)
    const t = (boundaryX - p1x) / (p2x - p1x);
    const intersectY = p1y + t * (p2y - p1y);

    // 선 방향에 따라 색상 결정 (위=파랑, 아래=빨강)
    const isLineGoingUp = p1y > p2y; // canvas Y좌표: 클수록 아래

    // 위쪽 삼각형 색상 (파란색 = 히스토그램)
    const upperColors = {
      fill: { start: CONFIG.getColor('--chart-bar-color'), end: CONFIG.getColor('--chart-bar-color-end') },
      stroke: { start: CONFIG.getColor('--chart-bar-stroke-start'), end: CONFIG.getColor('--chart-bar-stroke-end') },
      fillAlpha: CONFIG.CHART_BAR_ALPHA
    };

    // 아래쪽 삼각형 색상 (빨간색)
    const lowerColors = {
      fill: { start: CONFIG.TRIANGLE_A_FILL_START, end: CONFIG.TRIANGLE_A_FILL_END },
      stroke: { start: CONFIG.TRIANGLE_A_STROKE_START, end: CONFIG.TRIANGLE_A_STROKE_END }
    };

    // Triangle A: 선 상승 시 아래(빨강), 선 하강 시 위(파랑)
    const colorsA = isLineGoingUp ? lowerColors : upperColors;
    // Triangle B: 선 상승 시 위(파랑), 선 하강 시 아래(빨강)
    const colorsB = isLineGoingUp ? upperColors : lowerColors;

    // 삼각형 A (막대 i 우측)
    const pointsA = [
      { x: p1x, y: p1y },
      { x: boundaryX, y: p1y },
      { x: boundaryX, y: intersectY }
    ];

    // 삼각형 B (막대 i+1 좌측)
    const pointsB = [
      { x: boundaryX, y: p2y },
      { x: p2x, y: p2y },
      { x: boundaryX, y: intersectY }
    ];

    // 삼각형 렌더링
    this._drawTriangleStatic(pointsA, colorsA);
    this._drawTriangleStatic(pointsB, colorsB);

    // 라벨 오프셋
    const labelOffset = 30;

    // 라벨 위치 계산 (선 방향에 따라 결정)
    let labelPosBlue, labelPosRed;
    let rightAngleBlue, rightAngleRed;

    if (isLineGoingUp) {
      rightAngleBlue = { x: boundaryX, y: p2y };
      rightAngleRed = { x: boundaryX, y: p1y };
      labelPosBlue = { x: boundaryX - labelOffset, y: p2y - labelOffset };
      labelPosRed = { x: boundaryX + labelOffset, y: p1y + labelOffset };
    } else {
      rightAngleBlue = { x: boundaryX, y: p1y };
      rightAngleRed = { x: boundaryX, y: p2y };
      labelPosBlue = { x: boundaryX + labelOffset, y: p1y - labelOffset };
      labelPosRed = { x: boundaryX - labelOffset, y: p2y + labelOffset };
    }

    // S₁, S₂ 라벨과 점선 렌더링 (LayerFactory와 동일한 색상 사용)
    const blueColor = '#008AFF';
    const redColor = '#E749AF';

    this._drawLabelLineStatic(labelPosBlue, rightAngleBlue, blueColor);
    this._drawLabelLineStatic(labelPosRed, rightAngleRed, redColor);
    this._drawLabelStatic('S', '1', labelPosBlue.x, labelPosBlue.y, blueColor);
    this._drawLabelStatic('S', '2', labelPosRed.x, labelPosRed.y, redColor);
  }

  /**
   * 정적 삼각형 렌더링 헬퍼
   * @private
   */
  _drawTriangleStatic(points, colors) {
    const ctx = this.ctx;
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.lineTo(points[2].x, points[2].y);
    ctx.closePath();

    if (colors.fill) {
      const fillGradient = ctx.createLinearGradient(0, minY, 0, maxY);
      fillGradient.addColorStop(0, colors.fill.start);
      fillGradient.addColorStop(1, colors.fill.end);
      ctx.fillStyle = fillGradient;
      ctx.globalAlpha = colors.fillAlpha ?? 1;
    }
    ctx.fill();

    if (colors.stroke) {
      ctx.globalAlpha = 1;
      const strokeGradient = ctx.createLinearGradient(0, minY, 0, maxY);
      strokeGradient.addColorStop(0, colors.stroke.start);
      strokeGradient.addColorStop(1, colors.stroke.end);
      ctx.strokeStyle = strokeGradient;
      ctx.lineWidth = CONFIG.getScaledLineWidth('normal');
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * 정적 라벨 점선 렌더링 헬퍼
   * @private
   */
  _drawLabelLineStatic(from, to, color) {
    const ctx = this.ctx;
    const labelRadius = CONFIG.getScaledValue(18);

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / distance;
    const ny = dy / distance;

    const startX = from.x + nx * labelRadius;
    const startY = from.y + ny * labelRadius;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = CONFIG.getScaledLineWidth('thin');
    ctx.setLineDash(CONFIG.getScaledDashPattern());
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  /**
   * 정적 라벨 렌더링 헬퍼
   * @private
   */
  _drawLabelStatic(text, subscript, x, y, color) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = 1; // 투명도 초기화
    KatexUtils.renderWithScript(ctx, text, null, subscript, x, y, {
      fontSize: CONFIG.getScaledFontSize(30),
      color: color,
      align: 'center',
      baseline: 'middle'
    });
    ctx.restore();
  }
}

export default TriangleRenderer;

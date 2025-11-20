// ============================================================================
// Scale Effect - 스케일 효과
// @version 3.0.0
// ============================================================================

/**
 * 스케일 효과 적용
 * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
 * @param {number} progress - 진행도 (0~1)
 * @param {Object} options - 효과 옵션
 * @param {number} options.from - 시작 스케일 (기본값: 0)
 * @param {number} options.to - 종료 스케일 (기본값: 1)
 * @param {number} options.centerX - 중심점 X (기본값: 0)
 * @param {number} options.centerY - 중심점 Y (기본값: 0)
 * @param {Function} renderCallback - 렌더링 콜백
 */
export function applyScale(ctx, progress, options, renderCallback) {
  const fromScale = options.from || 0;
  const toScale = options.to || 1;
  const centerX = options.centerX || 0;
  const centerY = options.centerY || 0;

  const c1 = 1.70158;
  const c3 = c1 + 1;
  const easedProgress = 1 + c3 * Math.pow(progress - 1, 3) + c1 * Math.pow(progress - 1, 2);
  const scale = fromScale + (toScale - fromScale) * easedProgress;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(scale, scale);
  ctx.translate(-centerX, -centerY);
  ctx.globalAlpha = progress;

  renderCallback();
  ctx.restore();
}

// ============================================================================
// Fade Effect - 페이드 효과
// @version 3.0.0
// ============================================================================

/**
 * 페이드 효과 적용 (페이드 인)
 * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
 * @param {number} progress - 진행도 (0~1)
 * @param {Function} renderCallback - 렌더링 콜백
 */
export function applyFade(ctx, progress, renderCallback) {
  ctx.save();
  ctx.globalAlpha = progress;
  renderCallback();
  ctx.restore();
}

/**
 * 페이드아웃 효과 적용
 * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
 * @param {number} progress - 진행도 (0~1)
 * @param {Function} renderCallback - 렌더링 콜백
 */
export function applyFadeOut(ctx, progress, renderCallback) {
  ctx.save();
  ctx.globalAlpha = 1 - progress; // 페이드아웃: 1 → 0
  renderCallback();
  ctx.restore();
}

// ============================================================================
// Slide Effect - 슬라이드 효과
// @version 3.0.0
// ============================================================================

/**
 * 슬라이드 효과 적용
 * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
 * @param {number} progress - 진행도 (0~1)
 * @param {Object} options - 효과 옵션
 * @param {string} options.direction - 방향 ('up'|'down'|'left'|'right')
 * @param {number} options.distance - 이동 거리 (기본값: 520)
 * @param {Function} renderCallback - 렌더링 콜백
 */
export function applySlide(ctx, progress, options, renderCallback) {
  const direction = options.direction || 'up';
  const distance = options.distance || 520;
  const easedProgress = 1 - Math.pow(1 - progress, 3);
  const offset = (1 - easedProgress) * distance;

  ctx.save();
  ctx.globalAlpha = progress;

  switch (direction) {
    case 'up':
      ctx.translate(0, offset);
      break;
    case 'down':
      ctx.translate(0, -offset);
      break;
    case 'left':
      ctx.translate(offset, 0);
      break;
    case 'right':
      ctx.translate(-offset, 0);
      break;
  }

  renderCallback();
  ctx.restore();
}

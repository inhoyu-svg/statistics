// ============================================================================
// Draw Effect - 그리기 효과 (clipping 기반)
// @version 3.0.0
// ============================================================================

/**
 * 그리기 효과 적용 - clipping을 사용하여 점진적으로 나타남
 * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
 * @param {number} progress - 진행도 (0~1)
 * @param {Object} options - 효과 옵션
 * @param {string} options.direction - 방향 ('left-to-right'|'right-to-left'|'top-to-bottom'|'bottom-to-top')
 * @param {Function} renderCallback - 렌더링 콜백
 */
export function applyDraw(ctx, progress, options, renderCallback) {
  const direction = options.direction || 'left-to-right'; // 'left-to-right', 'right-to-left', 'top-to-bottom', 'bottom-to-top'
  const canvas = ctx.canvas;

  // transform을 확인하여 실제 적용된 scale 값 사용
  const transform = ctx.getTransform();
  const currentScale = transform.a; // transform.a는 x축 scale, transform.d는 y축 scale

  // canvas의 논리적 크기 = 물리적 크기 / 실제 적용된 scale
  const width = canvas.width / currentScale;
  const height = canvas.height / currentScale;

  ctx.save();

  // progress에 따라 clipping 영역 설정
  ctx.beginPath();
  switch (direction) {
    case 'left-to-right':
      ctx.rect(0, 0, width * progress, height);
      break;
    case 'right-to-left':
      const startX = width * (1 - progress);
      ctx.rect(startX, 0, width * progress, height);
      break;
    case 'top-to-bottom':
      ctx.rect(0, 0, width, height * progress);
      break;
    case 'bottom-to-top':
      const startY = height * (1 - progress);
      ctx.rect(0, startY, width, height * progress);
      break;
    default:
      ctx.rect(0, 0, width * progress, height);
  }
  ctx.clip();

  // 전체를 그리지만 clipping 영역만 보임
  renderCallback();
  ctx.restore();
}

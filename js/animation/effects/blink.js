// ============================================================================
// Blink Effect - 깜빡임 효과
// @version 3.0.0
// ============================================================================

/**
 * 깜빡임 효과 적용
 * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
 * @param {number} progress - 진행도 (0~1)
 * @param {Object} options - 효과 옵션
 * @param {number} options.frequency - 깜빡임 횟수 (기본값: 3)
 * @param {number} options.minAlpha - 최소 투명도 (기본값: 0)
 * @param {number} options.maxAlpha - 최대 투명도 (기본값: 1)
 * @param {number} options.fadeInEnd - 페이드인 종료 지점 (기본값: 0.2)
 * @param {number} options.fadeOutStart - 페이드아웃 시작 지점 (기본값: 0.8)
 * @param {Function} renderCallback - 렌더링 콜백
 */
export function applyBlink(ctx, progress, options, renderCallback) {
  const frequency = options.frequency || 3; // 깜빡임 횟수
  const minAlpha = options.minAlpha || 0; // 최소 투명도
  const maxAlpha = options.maxAlpha || 1; // 최대 투명도
  const fadeInEnd = options.fadeInEnd || 0.2; // 페이드인 종료 지점
  const fadeOutStart = options.fadeOutStart || 0.8; // 페이드아웃 시작 지점

  let alpha;

  // 애니메이션 종료 시(progress >= 1.0) 완전히 표시
  if (progress >= 1.0) {
    alpha = maxAlpha;
  } else if (progress <= fadeInEnd) {
    // fadeInEnd 이전: maxAlpha에서 점진적으로 깜빡임 시작
    const fadeProgress = progress / fadeInEnd; // 0~1

    // 깜빡임 효과
    const cycle = Math.sin(progress * Math.PI * 2 * frequency);
    const blinkAlpha = minAlpha + (maxAlpha - minAlpha) * (cycle * 0.5 + 0.5);

    // maxAlpha에서 깜빡임으로 점진적 전환
    alpha = maxAlpha * (1 - fadeProgress) + blinkAlpha * fadeProgress;
  } else if (progress >= fadeOutStart) {
    // fadeOutStart 이후: 깜빡임을 점진적으로 줄이며 maxAlpha로 수렴
    const fadeProgress = (progress - fadeOutStart) / (1.0 - fadeOutStart); // 0~1

    // 깜빡임 효과
    const cycle = Math.sin(progress * Math.PI * 2 * frequency);
    const blinkAlpha = minAlpha + (maxAlpha - minAlpha) * (cycle * 0.5 + 0.5);

    // 깜빡임과 maxAlpha 사이를 fadeProgress로 보간
    alpha = blinkAlpha * (1 - fadeProgress) + maxAlpha * fadeProgress;
  } else {
    // 일반 깜빡임
    const cycle = Math.sin(progress * Math.PI * 2 * frequency);
    alpha = minAlpha + (maxAlpha - minAlpha) * (cycle * 0.5 + 0.5);
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  renderCallback();
  ctx.restore();
}

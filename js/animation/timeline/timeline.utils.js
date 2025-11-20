// ============================================================================
// Timeline Utils - 타임라인 유틸리티 함수
// ============================================================================

/**
 * 이징 함수 적용
 * @param {number} t - 진행도 (0~1)
 * @param {string} easing - 이징 타입
 * @returns {number} 이징이 적용된 진행도
 */
export function applyEasing(t, easing) {
  switch (easing) {
    case 'linear':
      return t;
    case 'easeOut':
      return 1 - Math.pow(1 - t, 3);
    case 'easeIn':
      return t * t * t;
    case 'easeInOut':
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    case 'easeOutBack':
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    default:
      return t;
  }
}

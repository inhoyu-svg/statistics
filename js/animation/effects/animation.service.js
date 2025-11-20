// ============================================================================
// Animation Service - 애니메이션 효과 결정 및 옵션 조정
// ============================================================================

/**
 * 레이어 타입에 따라 자동으로 효과 결정
 * @param {Object} layer - 레이어 객체
 * @param {string|Array<string>} effect - 효과 타입 ('auto'일 경우 레이어 타입에 따라 자동 결정)
 * @returns {string|Array<string>} 결정된 효과
 */
export function getEffectForLayer(layer, effect = 'auto') {
  // 배열인 경우 그대로 반환 (여러 효과 중첩)
  if (Array.isArray(effect)) {
    return effect;
  }

  // 'auto'가 아니면 지정된 효과 그대로 사용
  if (effect !== 'auto') {
    return effect;
  }

  // 'auto'인 경우 레이어 타입에 따라 자동 결정
  if (!layer || !layer.type) {
    return 'slide'; // 기본값
  }

  switch (layer.type) {
    case 'line':
    case 'linear':
    case 'quadratic':
    case 'function':
      // 선(직선/수직선/수평선), 함수(선형/이차)는 draw 효과
      return 'draw';
    case 'point':
    case 'shape':
      // 점이나 도형은 fade 효과
      return 'fade';
    default:
      // 기타는 fade 효과
      return 'fade';
  }
}

/**
 * 레이어 타입에 따라 효과 옵션 조정
 * @param {Object} layer - 레이어 객체
 * @param {string|Array<string>} effect - 효과
 * @param {Object} options - 원본 옵션
 * @returns {Object} 조정된 옵션
 */
export function adjustOptionsForLayer(layer, effect, options) {
  // line 타입이고 draw 효과인 경우
  if (layer && layer.type === 'line' && (effect === 'draw' || (Array.isArray(effect) && effect.includes('draw')))) {
    const lineType = layer.data?.lineType;

    // 이미 direction이 설정되어 있으면 그대로 사용
    if (options.direction) {
      return options;
    }

    // lineType에 따라 자동으로 direction 설정
    const adjustedOptions = { ...options };
    if (lineType === 'vertical') {
      adjustedOptions.direction = 'bottom-to-top';
    } else if (lineType === 'horizontal') {
      adjustedOptions.direction = 'left-to-right';
    } else if (lineType === 'segment') {
      // segment는 from/to 좌표를 보고 수직/수평 판단
      const from = layer.data?.from;
      const to = layer.data?.to;

      if (from && to) {
        // 수직선: x 좌표가 같음
        if (from.x === to.x) {
          // from.y > to.y 이면 위에서 아래로 (점에서 축으로)
          if (from.y > to.y) {
            adjustedOptions.direction = 'top-to-bottom';
          } else {
            adjustedOptions.direction = 'bottom-to-top';
          }
        }
        // 수평선: y 좌표가 같음
        else if (from.y === to.y) {
          // from.x > to.x 이면 오른쪽에서 왼쪽으로 (점에서 축으로)
          if (from.x > to.x) {
            adjustedOptions.direction = 'right-to-left';
          } else {
            adjustedOptions.direction = 'left-to-right';
          }
        }
        // 대각선: 기본값 사용
        else {
          adjustedOptions.direction = 'left-to-right';
        }
      } else {
        adjustedOptions.direction = 'left-to-right';
      }
    } else {
      // 기타는 기본값 사용
      adjustedOptions.direction = options.direction || 'left-to-right';
    }

    return adjustedOptions;
  }

  return options;
}

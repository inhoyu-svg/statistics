// ============================================================================
// LayerAnimationEffects - 애니메이션 효과 적용
// ============================================================================

import {
  applyFade,
  applyFadeOut,
  applySlide,
  applyScale,
  applyDraw,
  applyBlink
} from './index.js';
import { getEffectForLayer, adjustOptionsForLayer } from './animation.service.js';

/**
 * LayerAnimationEffects - 애니메이션 효과 적용 클래스
 */
export class LayerAnimationEffects {
  /**
   * 레이어 타입에 따라 자동으로 효과 결정
   * @param {Object} layer - 레이어 객체
   * @param {string|Array<string>} effect - 효과 타입
   * @returns {string|Array<string>} 결정된 효과
   */
  static getEffectForLayer(layer, effect = 'auto') {
    return getEffectForLayer(layer, effect);
  }

  /**
   * 레이어와 함께 효과 적용
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} layer - 레이어 객체
   * @param {number} progress - 진행도 (0~1)
   * @param {string|Array<string>} effect - 효과 타입
   * @param {Object} options - 효과 옵션
   * @param {Function} renderCallback - 렌더링 콜백
   */
  static applyWithLayer(ctx, layer, progress, effect, options, renderCallback) {
    // effect가 'auto'이면 레이어 타입에 따라 자동 결정
    const finalEffect = getEffectForLayer(layer, effect);

    // line 타입에 대해 draw 효과 방향 자동 설정
    const finalOptions = adjustOptionsForLayer(layer, finalEffect, options);

    // 효과 적용
    this.apply(ctx, progress, finalEffect, finalOptions, renderCallback);
  }

  /**
   * 효과 적용
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {number} progress - 진행도 (0~1)
   * @param {string|Array<string>} effect - 효과 타입
   * @param {Object} options - 효과 옵션
   * @param {Function} renderCallback - 렌더링 콜백
   */
  static apply(ctx, progress, effect, options, renderCallback) {
    // effect가 배열인 경우 여러 효과를 중첩 적용
    if (Array.isArray(effect)) {
      this.applyMultiple(ctx, progress, effect, options, renderCallback);
      return;
    }

    // 단일 효과 적용
    switch (effect) {
      case 'fade':
        applyFade(ctx, progress, renderCallback);
        break;
      case 'fade-out':
        applyFadeOut(ctx, progress, renderCallback);
        break;
      case 'slide':
        applySlide(ctx, progress, options, renderCallback);
        break;
      case 'scale':
        applyScale(ctx, progress, options, renderCallback);
        break;
      case 'draw':
        applyDraw(ctx, progress, options, renderCallback);
        break;
      case 'blink':
        applyBlink(ctx, progress, options, renderCallback);
        break;
      case 'none':
      default:
        renderCallback();
        break;
    }
  }

  /**
   * 여러 효과를 중첩 적용
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {number} progress - 진행도 (0~1)
   * @param {Array<string>} effects - 효과 배열
   * @param {Object} options - 효과 옵션
   * @param {Function} renderCallback - 렌더링 콜백
   */
  static applyMultiple(ctx, progress, effects, options, renderCallback) {
    if (!effects || effects.length === 0) {
      renderCallback();
      return;
    }

    // 재귀적으로 효과를 중첩 적용
    const applyNext = (index) => {
      if (index >= effects.length) {
        renderCallback();
        return;
      }

      const currentEffect = effects[index];
      const effectOptions = options[currentEffect] || options;

      this.apply(ctx, progress, currentEffect, effectOptions, () => {
        applyNext(index + 1);
      });
    };

    applyNext(0);
  }
}

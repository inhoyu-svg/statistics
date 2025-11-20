// ============================================================================
// LayerTimeline Controller - 타임라인 제어
// ============================================================================

import { LayerTimeline } from './timeline.dto.js';
import {
  rebuildTimeline,
  getActiveAnimations,
  getProgress,
  getInfo,
  notifyUpdate
} from './timeline.service.js';

// LayerTimeline 클래스에 메서드 추가
Object.assign(LayerTimeline.prototype, {
  // ============================================================================
  // 애니메이션 설정
  // ============================================================================

  /**
   * 레이어에 애니메이션 추가
   * @param {string} layerId - 레이어 ID
   * @param {Object} config - 애니메이션 설정
   * @param {number} config.startTime - 시작 시간 (ms)
   * @param {number} config.duration - 지속 시간 (ms)
   * @param {string|Array<string>} config.effect - 효과 타입
   * @param {Object} config.effectOptions - 효과 옵션
   * @param {string} config.easing - 이징 함수
   */
  addAnimation(layerId, config) {
    const animation = {
      layerId,
      startTime: config.startTime || 0,
      duration: config.duration || 1000,
      effect: config.effect || 'fade',
      effectOptions: config.effectOptions || {},
      easing: config.easing || 'easeOut'
    };

    this.animations.set(layerId, animation);
    rebuildTimeline(this);

    return this;
  },

  /**
   * 레이어 애니메이션 업데이트
   * @param {string} layerId - 레이어 ID
   * @param {Object} updates - 업데이트할 속성들
   */
  updateAnimation(layerId, updates) {
    const animation = this.animations.get(layerId);
    if (!animation) {
      console.warn(`Animation not found for layer: ${layerId}`);
      return this;
    }

    // 업데이트할 속성만 적용
    if (updates.startTime !== undefined) animation.startTime = updates.startTime;
    if (updates.duration !== undefined) animation.duration = updates.duration;
    if (updates.effect !== undefined) animation.effect = updates.effect;
    if (updates.effectOptions !== undefined) animation.effectOptions = updates.effectOptions;
    if (updates.easing !== undefined) animation.easing = updates.easing;

    rebuildTimeline(this);
    return this;
  },

  /**
   * 레이어 애니메이션 제거
   * @param {string} layerId - 레이어 ID
   */
  removeAnimation(layerId) {
    this.animations.delete(layerId);
    rebuildTimeline(this);
    return this;
  },

  /**
   * 모든 애니메이션 제거
   */
  clearAnimations() {
    this.animations.clear();
    this.timeline = [];
    this.duration = 0;
    return this;
  },

  // ============================================================================
  // 재생 제어
  // ============================================================================

  /**
   * 애니메이션 재생
   */
  play() {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this._lastTimestamp = performance.now();
    this._animate();
  },

  /**
   * 애니메이션 일시정지
   */
  pause() {
    this.isPlaying = false;
  },

  /**
   * 애니메이션 정지 및 초기화
   */
  stop() {
    this.isPlaying = false;
    this.currentTime = 0;
    notifyUpdate(this);
  },

  /**
   * 특정 시간으로 이동
   * @param {number} time - 시간 (ms)
   */
  seekTo(time) {
    this.currentTime = Math.max(0, Math.min(time, this.duration));
    notifyUpdate(this);
  },

  /**
   * 진행도로 이동 (0~1)
   * @param {number} progress - 진행도
   */
  seekToProgress(progress) {
    this.seekTo(progress * this.duration);
  },

  /**
   * 애니메이션 루프
   */
  _animate() {
    if (!this.isPlaying) return;

    const now = performance.now();
    const delta = now - this._lastTimestamp;
    this._lastTimestamp = now;

    this.currentTime += delta;

    // 종료 확인
    if (this.currentTime >= this.duration) {
      this.currentTime = this.duration;
      this.isPlaying = false;

      // 마지막 프레임 렌더링 (모든 Progress를 1.0으로)
      notifyUpdate(this);
    } else {
      notifyUpdate(this);

      if (this.isPlaying) {
        requestAnimationFrame(() => this._animate());
      }
    }
  },

  // ============================================================================
  // 애니메이션 상태 조회
  // ============================================================================

  /**
   * 현재 활성화된 애니메이션 가져오기
   * @returns {Array} [{layerId, progress, effect, effectOptions}, ...]
   */
  getActiveAnimations() {
    return getActiveAnimations(this);
  },

  /**
   * 전체 진행도 (0~1)
   * @returns {number}
   */
  getProgress() {
    return getProgress(this);
  },

  /**
   * 애니메이션 정보
   * @returns {Object}
   */
  getInfo() {
    return getInfo(this);
  }
});

export { LayerTimeline };

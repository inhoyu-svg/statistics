// ============================================================================
// Timeline Service - 타임라인 비즈니스 로직
// ============================================================================

import { applyEasing } from './timeline.utils.js';

/**
 * 타임라인 재구성
 * @param {LayerTimeline} timelineInstance - 타임라인 인스턴스
 */
export function rebuildTimeline(timelineInstance) {
  timelineInstance.timeline = Array.from(timelineInstance.animations.values());
  console.log('Rebuilt timeline:', timelineInstance.timeline);

  // 전체 지속 시간 계산
  timelineInstance.duration = timelineInstance.timeline.reduce((max, anim) => {
    return Math.max(max, anim.startTime + anim.duration);
  }, 0);
}

/**
 * 특정 레이어의 애니메이션 진행도 계산
 * @param {Object} animation - 애니메이션 설정
 * @param {number} currentTime - 현재 시간
 * @returns {number} 진행도 (0~1)
 */
export function calculateProgress(animation, currentTime) {
  const { startTime, duration } = animation;

  if (currentTime < startTime) return 0;
  if (currentTime >= startTime + duration) return 1;

  return (currentTime - startTime) / duration;
}

/**
 * 현재 활성화된 애니메이션 가져오기
 * @param {LayerTimeline} timelineInstance - 타임라인 인스턴스
 * @returns {Array} [{layerId, progress, effect, effectOptions}, ...]
 */
export function getActiveAnimations(timelineInstance) {
  return timelineInstance.timeline.map(anim => {
    const progress = calculateProgress(anim, timelineInstance.currentTime);
    const easedProgress = applyEasing(progress, anim.easing);

    return {
      layerId: anim.layerId,
      progress: easedProgress,
      rawProgress: progress,
      effect: anim.effect,
      effectOptions: anim.effectOptions,
      status: progress === 0 ? 'pending' : (progress === 1 ? 'completed' : 'active')
    };
  });
}

/**
 * 전체 진행도 (0~1)
 * @param {LayerTimeline} timelineInstance - 타임라인 인스턴스
 * @returns {number}
 */
export function getProgress(timelineInstance) {
  return timelineInstance.duration > 0
    ? timelineInstance.currentTime / timelineInstance.duration
    : 0;
}

/**
 * 애니메이션 정보
 * @param {LayerTimeline} timelineInstance - 타임라인 인스턴스
 * @returns {Object}
 */
export function getInfo(timelineInstance) {
  return {
    currentTime: timelineInstance.currentTime,
    duration: timelineInstance.duration,
    progress: getProgress(timelineInstance),
    isPlaying: timelineInstance.isPlaying,
    animationCount: timelineInstance.animations.size
  };
}

/**
 * 업데이트 알림
 * @param {LayerTimeline} timelineInstance - 타임라인 인스턴스
 */
export function notifyUpdate(timelineInstance) {
  if (timelineInstance.onUpdate) {
    const activeAnimations = getActiveAnimations(timelineInstance);
    timelineInstance.onUpdate(
      activeAnimations,
      timelineInstance.currentTime,
      timelineInstance.duration
    );
  }
}

// ============================================================================
// Serialization - 타임라인 직렬화/역직렬화
// ============================================================================

/**
 * 타임라인을 JSON으로 직렬화
 * @param {LayerTimeline} timeline - 타임라인 인스턴스
 * @returns {Object} 직렬화된 타임라인 데이터
 */
export function serializeTimeline(timeline) {
  return {
    animations: Array.from(timeline.animations.entries()).map(([layerId, anim]) => ({
      layerId,
      startTime: anim.startTime,
      duration: anim.duration,
      effect: anim.effect,
      effectOptions: anim.effectOptions || {},
      easing: anim.easing || 'easeOut'
    })),
    currentTime: timeline.currentTime || 0,
    duration: timeline.duration || 0
  };
}

/**
 * JSON에서 타임라인 복원
 * @param {LayerTimeline} timeline - 타임라인 인스턴스
 * @param {Object} json - 직렬화된 타임라인 데이터
 */
export function deserializeTimeline(timeline, json) {
  timeline.clearAnimations();

  if (json && json.animations) {
    json.animations.forEach(anim => {
      timeline.addAnimation(anim.layerId, {
        startTime: anim.startTime,
        duration: anim.duration,
        effect: anim.effect,
        effectOptions: anim.effectOptions,
        easing: anim.easing
      });
    });
  }

  if (json.currentTime !== undefined) {
    timeline.currentTime = json.currentTime;
  }
}

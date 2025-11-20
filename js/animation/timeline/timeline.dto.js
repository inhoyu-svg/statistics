// ============================================================================
// LayerTimeline DTO - 타임라인 데이터 구조
// ============================================================================

/**
 * LayerTimeline 클래스
 * 레이어별 애니메이션 타임라인 관리
 */
export class LayerTimeline {
  constructor() {
    this.animations = new Map(); // layerId -> animation config
    this.timeline = [];
    this.currentTime = 0;
    this.isPlaying = false;
    this.duration = 0;
    this.onUpdate = null;
    this._lastTimestamp = null;
  }
}

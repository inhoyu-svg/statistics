/**
 * 애니메이션 컨트롤러
 * 차트 애니메이션 재생/일시정지/정지/속도 조절
 */

/**
 * @class AnimationController
 * @description 차트 애니메이션 제어 관리
 */
class AnimationController {
  /**
   * @param {FrequencyDistributionApp} app - 메인 애플리케이션 인스턴스
   */
  constructor(app) {
    this.app = app;
    this.animationFrameId = null;
    this.isUserDraggingSlider = false;
    this.updateProgress = null;
  }

  /**
   * 애니메이션 컨트롤 이벤트 리스너 등록
   */
  init() {
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    const progressSlider = document.getElementById('progressSlider');
    const progressText = document.getElementById('progressText');

    // 애니메이션 모드는 항상 활성화
    this.app.chartRenderer.enableAnimation();

    // 재생/일시정지/정지
    playBtn?.addEventListener('click', () => {
      // 진행도를 0%로 리셋 후 재생
      this.app.chartRenderer.timeline.currentTime = 0;
      this.app.chartRenderer.playAnimation();
    });
    pauseBtn?.addEventListener('click', () => this.app.chartRenderer.pauseAnimation());
    stopBtn?.addEventListener('click', () => this.app.chartRenderer.stopAnimation());

    // 속도 조절
    speedSlider?.addEventListener('input', (e) => {
      const speed = parseFloat(e.target.value);
      speedValue.textContent = `${speed}x`;
      this.app.chartRenderer.setAnimationSpeed(speed);
    });

    // 진행도 슬라이더 조작
    progressSlider?.addEventListener('input', (e) => {
      const percentage = parseInt(e.target.value);
      const progress = percentage / 100;

      // 슬라이더 조작 중 표시
      this.isUserDraggingSlider = true;

      // 타임라인 이동
      if (this.app.chartRenderer && this.app.chartRenderer.timeline) {
        this.app.chartRenderer.timeline.seekToProgress(progress);
      }

      // 진행도 텍스트 업데이트
      if (progressText) {
        progressText.textContent = `${percentage}%`;
      }

      // 슬라이더 배경 업데이트
      this.updateSliderBackground(progressSlider, percentage);
    });

    // 슬라이더 조작 종료 감지
    progressSlider?.addEventListener('mouseup', () => {
      this.isUserDraggingSlider = false;
    });

    progressSlider?.addEventListener('touchend', () => {
      this.isUserDraggingSlider = false;
    });

    // 진행도 자동 업데이트 함수 정의
    this.updateProgress = () => {
      if (this.app.chartRenderer && this.app.chartRenderer.timeline) {
        const progress = this.app.chartRenderer.timeline.getProgress();
        const percentage = Math.round(progress * 100);

        // 슬라이더 조작 중이 아닐 때만 업데이트
        if (!this.isUserDraggingSlider) {
          if (progressSlider) {
            progressSlider.value = percentage;
            this.updateSliderBackground(progressSlider, percentage);
          }
          if (progressText) {
            progressText.textContent = `${percentage}%`;
          }
        }
      }

      // 계속 업데이트
      this.animationFrameId = requestAnimationFrame(this.updateProgress);
    };

    // 진행도 업데이트 시작
    this.updateProgress();
  }

  /**
   * 슬라이더 배경 그라데이션 업데이트
   * @param {HTMLInputElement} slider - 슬라이더 요소
   * @param {number} percentage - 진행도 (0-100)
   */
  updateSliderBackground(slider, percentage) {
    if (!slider) return;
    slider.style.background = `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${percentage}%, var(--color-background-light) ${percentage}%, var(--color-background-light) 100%)`;
  }

  /**
   * 리소스 정리
   */
  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}

export default AnimationController;

/**
 * 차트 렌더링 메인 컨트롤러
 * Canvas 기반 히스토그램 및 상대도수 다각형 그리기
 *
 * @description 950줄 → 250줄로 리팩토링 (모듈 분리)
 */

import CONFIG from '../config.js';
import { LayerManager, LayerTimeline, LayerAnimationEffects } from '../animation/index.js';

// 분할된 렌더러 모듈들
import CoordinateSystem from './chart/CoordinateSystem.js';
import LayerFactory from './chart/LayerFactory.js';
import HistogramRenderer from './chart/HistogramRenderer.js';
import PolygonRenderer from './chart/PolygonRenderer.js';
import AxisRenderer from './chart/AxisRenderer.js';

/**
 * @class ChartRenderer
 * @description Canvas 기반 통계 차트 렌더러
 */
class ChartRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.padding = CONFIG.CHART_PADDING;

    // 렌더러 인스턴스 생성
    this.histogramRenderer = new HistogramRenderer(this.ctx);
    this.polygonRenderer = new PolygonRenderer(this.ctx);
    this.axisRenderer = new AxisRenderer(this.ctx, this.canvas, this.padding);

    // Layer 시스템
    this.layerManager = new LayerManager();
    this.timeline = new LayerTimeline();
    this.animationMode = true;
    this.animationSpeed = 1.0;

    // 차트 데이터 저장 (renderFrame에서 사용)
    this.currentClasses = null;
    this.currentValues = null;
    this.currentFreq = null;
    this.currentCoords = null;
    this.currentEllipsisInfo = null;
    this.currentMaxY = null;
    this.currentAxisLabels = null;
    this.currentDataType = null;

    // 애니메이션 콜백
    this.timeline.onUpdate = () => this.renderFrame();
  }

  // ==================== 메인 렌더링 ====================

  /**
   * 히스토그램과 상대도수 다각형 그리기
   * @param {Array} classes - 계급 데이터 배열
   * @param {Object} axisLabels - 축 라벨 커스터마이징 객체
   * @param {Object} ellipsisInfo - 중략 표시 정보
   * @param {string} dataType - 데이터 타입 ('relativeFrequency', 'frequency', 등)
   */
  draw(classes, axisLabels = null, ellipsisInfo = null, dataType = 'relativeFrequency') {
    this.canvas.width = CONFIG.CANVAS_WIDTH;
    this.canvas.height = CONFIG.CANVAS_HEIGHT;
    this.clear();

    const freq = classes.map(c => c.frequency);
    const total = freq.reduce((a, b) => a + b, 0);

    if (total === 0) {
      this.axisRenderer.drawNoDataMessage();
      return;
    }

    // 데이터 타입에 따라 값 배열 및 maxY 계산
    const relativeFreqs = freq.map(f => f / total);
    let values, maxY;

    if (dataType === 'frequency') {
      values = freq;
      maxY = Math.max(...freq);
    } else { // 'relativeFrequency' (기본값)
      values = relativeFreqs;
      maxY = Math.max(...relativeFreqs) * CONFIG.CHART_Y_SCALE_MULTIPLIER;
    }

    // 좌표 시스템 생성
    const coords = CoordinateSystem.create(
      this.canvas,
      this.padding,
      classes.length,
      ellipsisInfo,
      maxY,
      dataType
    );

    // 차트 데이터 저장 (애니메이션 모드용)
    this.currentClasses = classes;
    this.currentValues = values;
    this.currentFreq = freq;
    this.currentCoords = coords;
    this.currentEllipsisInfo = ellipsisInfo;
    this.currentMaxY = coords.adjustedMaxY; // 조정된 maxY 사용
    this.currentAxisLabels = axisLabels;
    this.currentDataType = dataType;
    this.currentGridDivisions = coords.gridDivisions;

    // 애니메이션 모드 분기
    if (this.animationMode) {
      // 애니메이션 모드: Layer 생성 후 애니메이션 재생
      LayerFactory.createLayers(
        this.layerManager,
        classes,
        values,
        coords,
        ellipsisInfo,
        dataType
      );
      this.setupAnimations(classes);
      this.playAnimation();
    } else {
      // 정적 렌더링 모드
      this.axisRenderer.drawGrid(
        coords.toX,
        coords.toY,
        coords.adjustedMaxY,
        classes.length,
        ellipsisInfo,
        coords.gridDivisions
      );
      this.histogramRenderer.draw(values, freq, coords, ellipsisInfo, dataType);
      this.polygonRenderer.draw(values, coords, ellipsisInfo);
      this.axisRenderer.drawAxes(classes, coords, coords.adjustedMaxY, axisLabels, ellipsisInfo, dataType, coords.gridDivisions);
      this.axisRenderer.drawLegend(dataType);
    }
  }

  /**
   * 캔버스 초기화
   */
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // ==================== 레이어 렌더링 ====================

  /**
   * Layer 렌더링 (레이어 시스템용)
   * @param {Layer} layer - 렌더링할 레이어
   */
  renderLayer(layer) {
    if (!layer.visible) return;

    // 렌더링 시 필요한 전역 정보를 레이어 데이터에 임시 주입
    const originalData = { ...layer.data };
    layer.data = {
      ...layer.data,
      coords: this.currentCoords,
      ellipsisInfo: this.currentEllipsisInfo,
      dataType: this.currentDataType
    };

    switch (layer.type) {
      case 'bar':
        this.histogramRenderer.renderBar(layer);
        break;
      case 'point':
        this.polygonRenderer.renderPoint(layer);
        break;
      case 'line':
        this.polygonRenderer.renderLine(layer);
        break;
      case 'group':
        // 그룹은 자식 레이어들을 렌더링
        layer.children.forEach(child => this.renderLayer(child));
        break;
    }

    // 원래 데이터로 복원 (JSON 내보내기 시 깔끔하게 유지)
    layer.data = originalData;
  }

  // ==================== Timeline & Animation ====================

  /**
   * 애니메이션 시퀀스 설정 (order 기반, 재귀적 처리)
   * @param {Array} classes - 계급 데이터
   */
  setupAnimations(classes) {
    this.timeline.clearAnimations();

    const itemDelay = 50; // 아이템 간 딜레이 (ms)
    const itemDuration = 600; // 아이템 애니메이션 시간 (ms)

    /**
     * 레이어를 재귀적으로 처리하는 헬퍼 함수
     * @param {Layer} layer - 처리할 레이어
     * @param {number} time - 현재 시간
     * @returns {number} 업데이트된 시간
     */
    const processLayer = (layer, time) => {
      if (layer.type === 'group') {
        // 그룹의 children을 order로 정렬하여 처리
        const sortedChildren = [...layer.children].sort((a, b) => a.order - b.order);

        sortedChildren.forEach((child) => {
          time = processLayer(child, time);
        });

        // 그룹의 마지막 아이템 완료 대기
        time += itemDuration;
      } else {
        // 실제 렌더링 레이어 (bar, point, line)
        let effect = 'fade';
        let effectOptions = {};
        let easing = 'easeInOut';

        if (layer.type === 'bar') {
          effect = 'none'; // renderBar에서 높이 애니메이션
        } else if (layer.type === 'line') {
          effect = 'draw';
          effectOptions = { direction: 'left-to-right' };
          easing = 'linear';
        }

        this.timeline.addAnimation(layer.id, {
          startTime: time,
          duration: itemDuration,
          effect: effect,
          effectOptions: effectOptions,
          easing: easing
        });

        time += itemDelay;
      }

      return time;
    };

    // root의 children을 order로 정렬하여 처리
    const rootLayer = this.layerManager.root;
    const sortedGroups = [...rootLayer.children].sort((a, b) => a.order - b.order);

    let currentTime = 0;
    sortedGroups.forEach((group) => {
      currentTime = processLayer(group, currentTime);
    });
  }

  /**
   * 애니메이션 재생
   */
  playAnimation() {
    if (!this.animationMode) {
      console.warn('Animation mode is disabled');
      return;
    }
    this.timeline.play();
  }

  /**
   * 애니메이션 일시정지
   */
  pauseAnimation() {
    this.timeline.pause();
  }

  /**
   * 애니메이션 정지
   */
  stopAnimation() {
    this.timeline.stop();
    this.renderFrame(); // 초기 상태로 다시 렌더링
  }

  /**
   * 애니메이션 재설정 및 재생
   * 레이어 순서가 변경된 경우 애니메이션 타이밍을 재설정
   */
  replayAnimation() {
    if (!this.animationMode || !this.currentClasses) {
      return;
    }

    this.stopAnimation();
    this.timeline.clearAnimations();
    this.setupAnimations(this.currentClasses);
    this.playAnimation();
  }

  /**
   * 애니메이션 속도 설정
   * @param {number} speed - 속도 배율 (0.5 = 느리게, 2.0 = 빠르게)
   */
  setAnimationSpeed(speed) {
    this.animationSpeed = Math.max(0.1, Math.min(speed, 5.0));
  }

  /**
   * 애니메이션 모드 활성화
   */
  enableAnimation() {
    this.animationMode = true;
  }

  /**
   * 애니메이션 모드 비활성화
   */
  disableAnimation() {
    this.animationMode = false;
    this.stopAnimation();
  }

  /**
   * 애니메이션 프레임 렌더링
   */
  renderFrame() {
    // 저장된 데이터가 없으면 리턴
    if (!this.currentClasses || !this.currentCoords) return;

    this.clear();

    // 배경 요소 그리기 (격자, 축)
    this.axisRenderer.drawGrid(
      this.currentCoords.toX,
      this.currentCoords.toY,
      this.currentMaxY,
      this.currentClasses.length,
      this.currentEllipsisInfo,
      this.currentGridDivisions
    );
    this.axisRenderer.drawAxes(
      this.currentClasses,
      this.currentCoords,
      this.currentMaxY,
      this.currentAxisLabels,
      this.currentEllipsisInfo,
      this.currentDataType,
      this.currentGridDivisions
    );

    // 모든 애니메이션 레이어 수집 (활성 + 완료)
    const allAnimations = this.timeline.timeline.map(anim => {
      const layer = this.layerManager.findLayer(anim.layerId);
      if (!layer || !layer.visible) return null;

      const endTime = anim.startTime + anim.duration;
      const isActive = this.timeline.currentTime >= anim.startTime && this.timeline.currentTime <= endTime;
      const isCompleted = this.timeline.currentTime > endTime;

      if (!isActive && !isCompleted) return null;

      return { anim, layer, isActive, isCompleted };
    }).filter(item => item !== null);

    // 렌더링 순서: bar → line → point (타입 기준 정렬)
    const renderOrder = { 'bar': 0, 'line': 1, 'point': 2 };
    allAnimations.sort((a, b) => {
      const orderA = renderOrder[a.layer.type] ?? 999;
      const orderB = renderOrder[b.layer.type] ?? 999;
      return orderA - orderB;
    });

    // 정렬된 순서대로 렌더링
    allAnimations.forEach(({ anim, layer, isActive }) => {
      if (isActive) {
        // 활성 애니메이션: 진행도 계산 및 효과 적용
        const elapsed = this.timeline.currentTime - anim.startTime;
        const progress = Math.min(1, Math.max(0, elapsed / anim.duration));

        layer.data.animationProgress = progress;

        LayerAnimationEffects.apply(
          this.ctx,
          progress,
          anim.effect,
          anim.effectOptions,
          () => this.renderLayer(layer)
        );
      } else {
        // 완료된 애니메이션: 완전히 표시 (progress = 1.0)
        layer.data.animationProgress = 1.0;
        this.renderLayer(layer);
      }
    });

    this.axisRenderer.drawLegend(this.currentDataType);
  }
}

export default ChartRenderer;

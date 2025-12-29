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
import CurveRenderer from './chart/CurveRenderer.js';
import AxisRenderer from './chart/AxisRenderer.js';
import CalloutRenderer from './chart/CalloutRenderer.js';
import DashedLineRenderer from './chart/DashedLineRenderer.js';
import TriangleRenderer from './chart/TriangleRenderer.js';

/**
 * @class ChartRenderer
 * @description Canvas 기반 통계 차트 렌더러
 */
class ChartRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`Canvas 요소를 찾을 수 없습니다: ${canvasId}`);
    }

    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) {
      throw new Error(`Canvas 2D 컨텍스트를 생성할 수 없습니다: ${canvasId}`);
    }

    this.padding = CONFIG.CHART_PADDING;

    // 렌더러 인스턴스 생성
    this.histogramRenderer = new HistogramRenderer(this.ctx);
    this.polygonRenderer = new PolygonRenderer(this.ctx);
    this.curveRenderer = new CurveRenderer(this.ctx);
    this.axisRenderer = new AxisRenderer(this.ctx, this.canvas, this.padding);
    this.calloutRenderer = new CalloutRenderer(this.ctx);
    this.dashedLineRenderer = new DashedLineRenderer(this.ctx);
    this.triangleRenderer = new TriangleRenderer(this.ctx);

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
    this.currentTableConfig = null;
    this.currentEffectiveClassCount = null;

    // 차트별 CONFIG 스냅샷 (다중 차트 환경에서 독립적 설정 유지)
    this.configSnapshot = null;

    // 테이블 렌더러 참조
    this.tableRenderer = null;

    // 테이블 하이라이트 상태 추적
    this.lastHighlightInfo = null;

    // 애니메이션 콜백
    this.timeline.onUpdate = () => this.renderFrame();
  }

  /**
   * 테이블 렌더러 설정
   * @param {TableRenderer} tableRenderer - 테이블 렌더러 인스턴스
   */
  setTableRenderer(tableRenderer) {
    this.tableRenderer = tableRenderer;
  }

  // ==================== 메인 렌더링 ====================

  /**
   * 히스토그램과 상대도수 다각형 그리기
   * @param {Array} classes - 계급 데이터 배열
   * @param {Object} axisLabels - 축 라벨 커스터마이징 객체
   * @param {Object} ellipsisInfo - 중략 표시 정보
   * @param {string} dataType - 데이터 타입 ('relativeFrequency', 'frequency', 등)
   * @param {Object} tableConfig - 테이블 설정
   * @param {string} calloutTemplate - 말풍선 템플릿
   * @param {boolean} clearCanvas - 캔버스 및 레이어 초기화 여부 (기본: true)
   * @param {number} unifiedMaxY - 통합 최대 Y값 (여러 데이터셋 사용 시, 없으면 자동 계산)
   * @param {number} unifiedClassCount - 통합 계급 개수 (여러 데이터셋 사용 시, 없으면 자동 계산)
   * @param {number} customYInterval - 커스텀 Y축 간격 (없으면 자동 계산)
   * @param {Array<number>} hiddenPolygonIndices - 숨길 다각형 점/선 인덱스 배열
   */
  draw(classes, axisLabels = null, ellipsisInfo = null, dataType = 'relativeFrequency', tableConfig = null, calloutTemplate = null, clearCanvas = true, unifiedMaxY = null, unifiedClassCount = null, customYInterval = null, hiddenPolygonIndices = []) {
    // 캔버스 크기에 따라 패딩 스케일링
    this.padding = CONFIG.getScaledPadding();
    this.axisRenderer.padding = this.padding;

    if (clearCanvas) {
      // 캔버스 초기화 (크기는 viz-api에서 설정하므로 여기서 덮어쓰지 않음)
      this.clear();

      // 레이어 매니저 초기화 (겹침 방지) - root의 자식 레이어 모두 제거
      this.layerManager.root.children = [];
      // 타임라인 초기화
      this.timeline.animations = new Map(); // Map 객체로 초기화
      this.timeline.timeline = [];
      this.timeline.currentTime = 0;
      this.timeline.duration = 0;

      // 새로운 차트 그리기 시작 - 하이라이트 초기화
      this.lastHighlightInfo = null;
    }

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
      maxY = unifiedMaxY !== null ? unifiedMaxY : Math.max(...freq);
    } else { // 'relativeFrequency' (기본값)
      values = relativeFreqs;
      maxY = unifiedMaxY !== null ? unifiedMaxY : Math.max(...relativeFreqs) * CONFIG.CHART_Y_SCALE_MULTIPLIER;
    }

    // 좌표 시스템 생성 (통합 계급 개수 우선 사용)
    const effectiveClassCount = unifiedClassCount || classes.length;
    const coords = CoordinateSystem.create(
      this.canvas,
      this.padding,
      effectiveClassCount,
      ellipsisInfo,
      maxY,
      dataType,
      customYInterval
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
    this.currentTableConfig = tableConfig;
    this.currentEffectiveClassCount = effectiveClassCount;

    // 애니메이션 모드 분기
    if (this.animationMode) {
      // 애니메이션 모드: Layer 생성 후 진행도 100%로 설정 (자동 재생 안 함)
      LayerFactory.createLayers(
        this.layerManager,
        classes,
        values,
        coords,
        ellipsisInfo,
        dataType,
        calloutTemplate,
        hiddenPolygonIndices
      );
      this.setupAnimations(classes);

      // 자동 재생하지 않고 진행도 100% 상태로 설정
      this.timeline.currentTime = this.timeline.duration;
      this.renderFrame(); // 최종 상태 렌더링
    } else {
      // 정적 렌더링 모드
      // 추가 렌더링(clearCanvas=false)일 때는 배경/축을 다시 그리지 않음 (기존 내용 유지)
      if (clearCanvas) {
        this.axisRenderer.drawGrid(
          coords.toX,
          coords.toY,
          coords.adjustedMaxY,
          effectiveClassCount,
          ellipsisInfo,
          coords.gridDivisions
        );
      }
      // CONFIG 설정에 따라 조건부 렌더링
      // 렌더링 순서: 히스토그램 → 합동 삼각형 → 도수다각형 (삼각형이 막대 앞, 다각형 뒤)
      if (CONFIG.SHOW_HISTOGRAM) {
        this.histogramRenderer.draw(values, freq, coords, ellipsisInfo, dataType);
      }
      // 합동 삼각형 렌더링 (정적 모드) - 히스토그램 뒤, 다각형 앞
      if (CONFIG.SHOW_CONGRUENT_TRIANGLES && CONFIG.SHOW_POLYGON) {
        this.triangleRenderer.drawStatic(values, coords);
      }
      if (CONFIG.SHOW_POLYGON) {
        this.polygonRenderer.draw(values, coords, ellipsisInfo, hiddenPolygonIndices);
      }
      // 분포 곡선 렌더링 (정적 모드)
      if (CONFIG.SHOW_CURVE) {
        this.curveRenderer.draw(values, coords, ellipsisInfo);
      }
      // 파선 렌더링 (정적 모드)
      if (CONFIG.SHOW_DASHED_LINES && CONFIG.SHOW_POLYGON) {
        this.dashedLineRenderer.drawStatic(values, coords, dataType);
      }
      // 막대 내부 커스텀 라벨 렌더링 (정적 모드)
      if (CONFIG.SHOW_BAR_CUSTOM_LABELS && CONFIG.SHOW_HISTOGRAM) {
        this.histogramRenderer.drawCustomLabelsStatic(values, freq, coords, ellipsisInfo);
      }
      if (clearCanvas) {
        this.axisRenderer.drawAxes(classes, coords, coords.adjustedMaxY, axisLabels, ellipsisInfo, dataType, coords.gridDivisions);
      }
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
      case 'dashed-line':
        this.dashedLineRenderer.render(layer);
        break;
      case 'bar-label':
        this.histogramRenderer.renderBarLabel(layer);
        break;
      case 'bar-custom-label':
        this.histogramRenderer.renderBarCustomLabel(layer);
        break;
      case 'triangle':
        this.triangleRenderer.renderTriangle(layer);
        break;
      case 'triangle-label':
        this.triangleRenderer.renderTriangleLabel(layer);
        break;
      case 'triangle-label-line':
        this.triangleRenderer.renderTriangleLabelLine(layer);
        break;
      case 'callout':
        this.calloutRenderer.render(layer);
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
   * 기존 레이어 페이드아웃 애니메이션 추가
   * 새로운 차트를 그리기 전에 기존 레이어들을 부드럽게 사라지게 함
   */
  fadeOutExistingLayers() {
    const fadeOutDuration = 300; // 페이드아웃 시간 (ms)
    const startTime = this.timeline.duration;

    // 모든 최상위 레이어에 페이드아웃 애니메이션 추가
    this.layerManager.layers.forEach(layer => {
      this.addFadeOutAnimationRecursive(layer, startTime, fadeOutDuration);
    });
  }

  /**
   * 레이어와 자식 레이어들에 재귀적으로 페이드아웃 애니메이션 추가
   * @param {Layer} layer - 레이어
   * @param {number} startTime - 시작 시간
   * @param {number} duration - 지속 시간
   */
  addFadeOutAnimationRecursive(layer, startTime, duration) {
    // 현재 레이어에 페이드아웃 애니메이션 추가
    this.timeline.addAnimation(layer.id, {
      startTime,
      duration,
      effect: 'fade-out',
      effectOptions: {},
      easing: 'easeOut'
    });

    // 자식 레이어들에도 재귀적으로 추가
    if (layer.children && layer.children.length > 0) {
      layer.children.forEach(child => {
        this.addFadeOutAnimationRecursive(child, startTime, duration);
      });
    }
  }

  /**
   * 애니메이션 시퀀스 설정 (계급별 순차 타임라인)
   * @param {Array} classes - 계급 데이터
   */
  setupAnimations(classes) {
    // 타임라인을 초기화하지 않고 기존 애니메이션 뒤에 추가
    // this.timeline.clearAnimations(); // 제거: 연속 타임라인 유지

    const barDuration = CONFIG.ANIMATION_BAR_DURATION;
    const pointDuration = CONFIG.ANIMATION_POINT_DURATION;
    const classDelay = CONFIG.ANIMATION_CLASS_DELAY;
    const lineDuration = CONFIG.ANIMATION_LINE_DURATION;
    const lineDelay = CONFIG.ANIMATION_LINE_DELAY;

    // 기존 타임라인의 끝에서 시작
    let currentTime = this.timeline.duration;

    // 가장 최근에 추가된 레이어 그룹 찾기 (그룹 ID는 '-group-' 패턴 포함)
    const allLayers = this.layerManager.getAllLayers().map(item => item.layer);
    const reversedLayers = [...allLayers].reverse();

    const histogramGroup = reversedLayers.find(l => l.id.startsWith('histogram-group'));
    const polygonGroup = reversedLayers.find(l => l.id.startsWith('polygon-group'));
    const labelsGroup = reversedLayers.find(l => l.id.startsWith('bar-labels-group'));
    const customLabelsGroup = reversedLayers.find(l => l.id.startsWith('bar-custom-labels-group'));
    const dashedLinesGroup = reversedLayers.find(l => l.id.startsWith('dashed-lines-group'));

    const pointsGroup = polygonGroup?.children.find(c => c.id.startsWith('points-group'));

    // 히스토그램도 다각형도 없으면 리턴
    if (!histogramGroup && !polygonGroup) return;

    const bars = histogramGroup?.children || [];
    const points = pointsGroup?.children || [];
    const labels = labelsGroup?.children || [];
    const customLabels = customLabelsGroup?.children || [];

    // 계급별로 묶어서 순차 애니메이션
    // 기준: 막대와 점 중 더 많은 쪽 (보통 같지만 안전하게)
    const classCount = Math.max(bars.length, points.length, classes.length);

    // 막대 인덱스 매핑 (bar.data.index → bars 배열 인덱스)
    const barIndexMap = new Map();
    bars.forEach((bar, idx) => {
      barIndexMap.set(bar.data.index, idx);
    });

    // 라벨 인덱스 매핑 (label.data.index → labels 배열 인덱스)
    const labelIndexMap = new Map();
    labels.forEach((label, idx) => {
      labelIndexMap.set(label.data.index, idx);
    });

    // 점 인덱스 매핑 (point.data.index → points 배열 인덱스)
    const pointIndexMap = new Map();
    points.forEach((point, idx) => {
      pointIndexMap.set(point.data.index, idx);
    });

    // 커스텀 라벨 인덱스 매핑 (customLabel.data.index → customLabels 배열 인덱스)
    const customLabelIndexMap = new Map();
    customLabels.forEach((customLabel, idx) => {
      customLabelIndexMap.set(customLabel.data.index, idx);
    });

    for (let i = 0; i < classCount; i++) {
      // ellipsis 범위 건너뛰기 (빈 계급에 대한 타이밍 낭비 방지)
      if (CoordinateSystem.shouldSkipEllipsis(i, this.currentEllipsisInfo)) continue;

      // 현재 계급 인덱스 i를 기준으로 막대, 점, 라벨 찾기
      const barIdx = barIndexMap.get(i);
      const bar = barIdx !== undefined ? bars[barIdx] : null;

      const pointIdx = pointIndexMap.get(i);
      const point = pointIdx !== undefined ? points[pointIdx] : null;

      const labelIdx = labelIndexMap.get(i);
      const label = labelIdx !== undefined ? labels[labelIdx] : null;

      const customLabelIdx = customLabelIndexMap.get(i);
      const customLabel = customLabelIdx !== undefined ? customLabels[customLabelIdx] : null;

      // 막대 애니메이션 (있으면)
      if (bar) {
        this.timeline.addAnimation(bar.id, {
          startTime: currentTime,
          duration: barDuration,
          effect: 'none', // renderBar에서 높이 애니메이션 처리
          effectOptions: {},
          easing: 'easeOut'
        });
      }

      // 막대 라벨 애니메이션 (막대와 동일한 타이밍)
      if (label) {
        this.timeline.addAnimation(label.id, {
          startTime: currentTime,
          duration: barDuration,
          effect: 'none', // renderBarLabel에서 progress 체크
          effectOptions: {},
          easing: 'easeOut'
        });
      }

      // 막대 커스텀 라벨 애니메이션 (막대와 동일한 타이밍)
      if (customLabel) {
        this.timeline.addAnimation(customLabel.id, {
          startTime: currentTime,
          duration: barDuration,
          effect: 'none', // renderBarCustomLabel에서 progress 체크
          effectOptions: {},
          easing: 'easeOut'
        });
      }

      // 점 애니메이션 (항상)
      if (point) {
        this.timeline.addAnimation(point.id, {
          startTime: currentTime,
          duration: pointDuration,
          effect: 'fade',
          effectOptions: {},
          easing: 'easeOut'
        });
      }

      // 다음 계급으로
      currentTime += Math.max(barDuration, pointDuration) + classDelay;
    }

    // 파선 애니메이션 (히스토그램 완료 후, 순차적으로 그리기)
    if (dashedLinesGroup && dashedLinesGroup.children && dashedLinesGroup.children.length > 0) {
      const dashedLineDelay = CONFIG.ANIMATION_CLASS_DELAY || 150;
      const dashedLineDuration = CONFIG.ANIMATION_LINE_DURATION || 400;

      dashedLinesGroup.children.forEach((dashedLine, idx) => {
        if (dashedLine && dashedLine.visible) {
          this.timeline.addAnimation(dashedLine.id, {
            startTime: currentTime + (idx * dashedLineDelay),
            duration: dashedLineDuration,
            effect: 'draw',
            effectOptions: { direction: 'right-to-left' },
            easing: 'easeOut'
          });
        }
      });

      // 파선 완료 후 시간 업데이트
      currentTime += (dashedLinesGroup.children.length * dashedLineDelay) + dashedLineDuration;
    }

    // 연결선 그룹 애니메이션 (모든 계급 완료 후)
    const linesGroup = polygonGroup?.children.find(c => c.id.startsWith('lines-group'));
    if (linesGroup && linesGroup.children) {
      currentTime += CONFIG.ANIMATION_LINE_START_DELAY;

      linesGroup.children.forEach((line, idx) => {
        this.timeline.addAnimation(line.id, {
          startTime: currentTime + (idx * lineDelay),
          duration: lineDuration,
          effect: 'draw',
          effectOptions: { direction: 'left-to-right' },
          easing: 'linear'
        });
      });

      // 말풍선 애니메이션 (모든 선이 완료된 후)
      const calloutLayer = reversedLayers.find(l => l.id.startsWith('callout-'));
      if (calloutLayer) {
        const lineEndTime = currentTime + (linesGroup.children.length * lineDelay) + lineDuration;
        this.timeline.addAnimation(calloutLayer.id, {
          startTime: lineEndTime + CONFIG.ANIMATION_CALLOUT_DELAY,
          duration: CONFIG.ANIMATION_POINT_DURATION,
          effect: 'custom', // 투명도 애니메이션은 직접 처리
          effectOptions: {},
          easing: 'easeIn'
        });
      }

      // 합동 삼각형 애니메이션 (선 애니메이션 완료 후)
      const trianglesGroup = reversedLayers.find(l => l.id.startsWith('triangles-group'));
      if (trianglesGroup && trianglesGroup.children) {
        const lineEndTime = currentTime + (linesGroup.children.length * lineDelay) + lineDuration;

        // 삼각형 먼저 애니메이션
        const triangles = trianglesGroup.children.filter(c => c.type === 'triangle');
        triangles.forEach((triangle, idx) => {
          this.timeline.addAnimation(triangle.id, {
            startTime: lineEndTime + (idx * 150),
            duration: 300,
            effect: 'fade',
            effectOptions: {},
            easing: 'easeOut'
          });
        });

        // 삼각형 애니메이션 완료 후 라벨 및 점선 애니메이션
        const triangleEndTime = lineEndTime + (triangles.length * 150) + 300;
        const labelLines = trianglesGroup.children.filter(c => c.type === 'triangle-label-line');
        const labels = trianglesGroup.children.filter(c => c.type === 'triangle-label');

        // 점선 먼저 (draw 효과)
        labelLines.forEach((line, idx) => {
          this.timeline.addAnimation(line.id, {
            startTime: triangleEndTime + (idx * 100),
            duration: 200,
            effect: 'fade',
            effectOptions: {},
            easing: 'easeOut'
          });
        });

        // 라벨 (fade 효과)
        const labelStartTime = triangleEndTime + (labelLines.length * 100) + 100;
        labels.forEach((label, idx) => {
          this.timeline.addAnimation(label.id, {
            startTime: labelStartTime + (idx * 100),
            duration: 200,
            effect: 'fade',
            effectOptions: {},
            easing: 'easeOut'
          });
        });
      }
    }
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
    this.lastHighlightInfo = null; // 하이라이트 초기화
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
   * 주의: stopAnimation()을 호출하지 않음 (정적 렌더링된 내용 보존)
   */
  disableAnimation() {
    this.animationMode = false;
    // stopAnimation() 호출 제거: renderFrame()이 캔버스를 지워서
    // 정적 모드로 그려진 기존 내용(다각형 등)이 사라지는 문제 방지
  }

  /**
   * 애니메이션 프레임 렌더링
   */
  renderFrame() {
    // 저장된 데이터가 없으면 리턴
    if (!this.currentClasses || !this.currentCoords) return;

    // CONFIG 스냅샷 복원 (다중 차트 환경에서 독립적 설정 유지)
    if (this.configSnapshot) {
      CONFIG.AXIS_SHOW_Y_LABELS = this.configSnapshot.AXIS_SHOW_Y_LABELS;
      CONFIG.AXIS_SHOW_X_LABELS = this.configSnapshot.AXIS_SHOW_X_LABELS;
      CONFIG.AXIS_Y_LABEL_FORMAT = this.configSnapshot.AXIS_Y_LABEL_FORMAT;
      CONFIG.SHOW_HISTOGRAM = this.configSnapshot.SHOW_HISTOGRAM;
      CONFIG.SHOW_POLYGON = this.configSnapshot.SHOW_POLYGON;
      CONFIG.SHOW_CONGRUENT_TRIANGLES = this.configSnapshot.SHOW_CONGRUENT_TRIANGLES;
      CONFIG.SHOW_DASHED_LINES = this.configSnapshot.SHOW_DASHED_LINES;
      CONFIG.SHOW_BAR_CUSTOM_LABELS = this.configSnapshot.SHOW_BAR_CUSTOM_LABELS;
      CONFIG.BAR_CUSTOM_LABELS = this.configSnapshot.BAR_CUSTOM_LABELS;
      CONFIG.CONGRUENT_TRIANGLE_INDEX = this.configSnapshot.CONGRUENT_TRIANGLE_INDEX;
      CONFIG.GRID_SHOW_HORIZONTAL = this.configSnapshot.GRID_SHOW_HORIZONTAL;
      CONFIG.GRID_SHOW_VERTICAL = this.configSnapshot.GRID_SHOW_VERTICAL;
      CONFIG.CHART_ENGLISH_FONT = this.configSnapshot.CHART_ENGLISH_FONT;
    }

    this.clear();

    // 배경 요소 그리기 (격자, 축)
    this.axisRenderer.drawGrid(
      this.currentCoords.toX,
      this.currentCoords.toY,
      this.currentMaxY,
      this.currentEffectiveClassCount || this.currentClasses.length,
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

    // 렌더링 순서: dashed-line → bar → triangle → ... (타입 기준 정렬)
    // 파선이 막대 뒤에 그려지도록 먼저 렌더링
    const renderOrder = { 'dashed-line': 0, 'bar': 1, 'bar-custom-label': 2, 'triangle': 3, 'triangle-label-line': 4, 'triangle-label': 5, 'line': 6, 'point': 7, 'bar-label': 8, 'callout': 9 };
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

        // 말풍선 레이어는 투명도 애니메이션
        if (layer.type === 'callout') {
          layer.data.opacity = progress;
          this.renderLayer(layer);
        } else {
          LayerAnimationEffects.apply(
            this.ctx,
            progress,
            anim.effect,
            anim.effectOptions,
            () => this.renderLayer(layer)
          );
        }
      } else {
        // 완료된 애니메이션: 완전히 표시 (progress = 1.0)
        layer.data.animationProgress = 1.0;
        if (layer.type === 'callout') {
          layer.data.opacity = 1.0;
        }
        this.renderLayer(layer);
      }
    });

    // 테이블 하이라이트 업데이트
    this.updateTableHighlight(allAnimations);
  }

  /**
   * 테이블 하이라이트 업데이트
   * @param {Array} allAnimations - 모든 애니메이션 정보
   */
  updateTableHighlight(allAnimations) {
    if (!this.tableRenderer || !this.currentClasses || !this.currentTableConfig) return;

    let highlightInfo = null;

    // 우선순위: bar/point > line
    // 1. 활성 bar/point 찾기
    for (const { anim, layer, isActive } of allAnimations) {
      if (!isActive) continue;

      if (layer.type === 'bar' || layer.type === 'point') {
        const classIndex = layer.data.index;
        const progress = layer.data.animationProgress || 0;

        // 전체 계급 배열에서 도수가 0이 아닌 계급까지 카운트
        let visibleIndex = 0;
        for (let i = 0; i < classIndex; i++) {
          if (this.currentClasses[i].frequency > 0) {
            visibleIndex++;
          }
        }

        // 현재 계급이 도수 0이면 스킵
        if (this.currentClasses[classIndex].frequency > 0) {
          highlightInfo = {
            classIndex: visibleIndex,
            progress: progress
          };
          break; // 첫 번째로 찾은 것만 사용
        }
      }
    }

    // 2. bar/point가 없으면 활성 line 찾기
    if (highlightInfo === null) {
      for (const { anim, layer, isActive } of allAnimations) {
        if (!isActive) continue;

        if (layer.type === 'line') {
          const toIndex = layer.data.toIndex;
          const progress = layer.data.animationProgress || 0;

          // 전체 계급 배열에서 도수가 0이 아닌 계급까지 카운트
          let visibleIndex = 0;
          for (let i = 0; i < toIndex; i++) {
            if (this.currentClasses[i].frequency > 0) {
              visibleIndex++;
            }
          }

          // 현재 계급이 도수 0이면 스킵
          if (this.currentClasses[toIndex].frequency > 0) {
            highlightInfo = {
              classIndex: visibleIndex,
              progress: progress
            };
            break; // 첫 번째로 찾은 것만 사용
          }
        }
      }
    }

    // 하이라이트 상태가 변경될 때만 테이블 업데이트 (레이어 시스템 사용)
    const currentHighlight = this.lastHighlightInfo;

    // highlightInfo가 null이 되는 경우 업데이트하지 않음 (깜빡거림 방지)
    // 대신 새로운 하이라이트가 생기거나 classIndex/progress가 변경될 때만 업데이트
    if (highlightInfo !== null) {
      const hasChanged =
        currentHighlight === null ||
        highlightInfo.classIndex !== currentHighlight.classIndex ||
        Math.abs(highlightInfo.progress - currentHighlight.progress) > 0.05;

      if (hasChanged) {
        this.lastHighlightInfo = highlightInfo;

        // 레이어 시스템: 이전 하이라이트 해제 후 새로 설정
        this.tableRenderer.clearHighlight();
        this.tableRenderer.highlightCell(
          highlightInfo.classIndex,
          null, // 행 전체
          highlightInfo.progress
        );
      }
    }
    // highlightInfo가 null이면 아무것도 하지 않음 (이전 하이라이트 유지)
  }
}

export default ChartRenderer;

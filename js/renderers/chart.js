/**
 * 차트 렌더링 메인 컨트롤러
 * Canvas 기반 히스토그램 및 상대도수 다각형 그리기
 *
 * @description 950줄 → 250줄로 리팩토링 (모듈 분리)
 */

import CONFIG from '../config.js';
import DataStore from '../core/dataStore.js';
import { LayerManager, LayerTimeline, LayerAnimationEffects } from '../animation/index.js';

// 분할된 렌더러 모듈들
import CoordinateSystem from './chart/CoordinateSystem.js';
import LayerFactory from './chart/LayerFactory.js';
import HistogramRenderer from './chart/HistogramRenderer.js';
import PolygonRenderer from './chart/PolygonRenderer.js';
import AxisRenderer from './chart/AxisRenderer.js';
import CalloutRenderer from './chart/CalloutRenderer.js';
import DashedLineRenderer from './chart/DashedLineRenderer.js';

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
    this.axisRenderer = new AxisRenderer(this.ctx, this.canvas, this.padding);
    this.calloutRenderer = new CalloutRenderer(this.ctx);
    this.dashedLineRenderer = new DashedLineRenderer(this.ctx);

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
   * @param {Array} datasetResults - 데이터셋 결과 배열 또는 단일 classes 배열 (하위 호환)
   * @param {Object} axisLabels - 축 라벨 커스터마이징 객체
   * @param {Object} ellipsisInfo - 중략 표시 정보
   * @param {string} dataType - 데이터 타입 ('relativeFrequency', 'frequency', 등)
   * @param {Object} tableConfig - 테이블 설정
   * @param {string} calloutTemplate - 말풍선 템플릿
   */
  draw(datasetResults, axisLabels = null, ellipsisInfo = null, dataType = 'relativeFrequency', tableConfig = null, calloutTemplate = null) {
    this.canvas.width = CONFIG.CANVAS_WIDTH;
    this.canvas.height = CONFIG.CANVAS_HEIGHT;
    this.clear();

    // 새로운 차트 그리기 시작 - 하이라이트 초기화
    this.lastHighlightInfo = null;

    // 하위 호환성: datasetResults가 classes 배열인 경우
    const isOldFormat = datasetResults.length > 0 && datasetResults[0].hasOwnProperty('frequency');

    if (isOldFormat) {
      // 구 형식: classes 배열 → datasetResults 형식으로 변환
      const classes = datasetResults;
      const freq = classes.map(c => c.frequency);
      const total = freq.reduce((a, b) => a + b, 0);
      const relativeFreqs = freq.map(f => f / total);

      datasetResults = [{
        id: 1,
        name: CONFIG.DEFAULT_DATASET_NAME,
        preset: 'default',
        classes: classes,
        frequencies: freq,
        relativeFreqs: relativeFreqs
      }];
    }

    // 공통 계급 정보 가져오기
    const classes = DataStore.getClasses() || datasetResults[0].classes;

    // 모든 데이터셋의 최대값 계산
    let maxY = 0;
    datasetResults.forEach(ds => {
      if (dataType === 'frequency') {
        maxY = Math.max(maxY, ...ds.frequencies);
      } else {
        maxY = Math.max(maxY, ...ds.relativeFreqs);
      }
    });

    if (dataType === 'relativeFrequency') {
      maxY = maxY * CONFIG.CHART_Y_SCALE_MULTIPLIER;
    }

    if (maxY === 0) {
      this.axisRenderer.drawNoDataMessage();
      return;
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
    this.currentDatasetResults = datasetResults;
    this.currentCoords = coords;
    this.currentEllipsisInfo = ellipsisInfo;
    this.currentMaxY = coords.adjustedMaxY;
    this.currentAxisLabels = axisLabels;
    this.currentDataType = dataType;
    this.currentGridDivisions = coords.gridDivisions;
    this.currentTableConfig = tableConfig;

    // 애니메이션 모드 분기
    if (this.animationMode) {
      // 애니메이션 모드: Layer 생성 후 애니메이션 재생
      LayerFactory.createLayers(
        this.layerManager,
        datasetResults,
        coords,
        ellipsisInfo,
        dataType,
        calloutTemplate
      );
      this.setupAnimations(datasetResults);
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

      // 각 데이터셋 렌더링
      datasetResults.forEach(ds => {
        const values = dataType === 'frequency' ? ds.frequencies : ds.relativeFreqs;
        this.histogramRenderer.draw(values, ds.frequencies, coords, ellipsisInfo, dataType, ds.preset);
        this.polygonRenderer.draw(values, coords, ellipsisInfo, ds.preset);
      });

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
      case 'dashed-line':
        this.dashedLineRenderer.render(layer);
        break;
      case 'bar-label':
        this.histogramRenderer.renderBarLabel(layer);
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
   * 애니메이션 시퀀스 설정 (계급별 순차 타임라인)
   * @param {Array} classes - 계급 데이터
   */
  setupAnimations(datasetResults) {
    this.timeline.clearAnimations();

    const barDuration = CONFIG.ANIMATION_BAR_DURATION;
    const pointDuration = CONFIG.ANIMATION_POINT_DURATION;
    const classDelay = CONFIG.ANIMATION_CLASS_DELAY;
    const lineDuration = CONFIG.ANIMATION_LINE_DURATION;
    const lineDelay = CONFIG.ANIMATION_LINE_DELAY;

    let currentTime = 0;

    // 히스토그램 그룹에서 막대 찾기 (다중 데이터셋 구조)
    const histogramGroup = this.layerManager.findLayer('histogram');
    // 다각형 그룹에서 점 찾기 (다중 데이터셋 구조)
    const polygonGroup = this.layerManager.findLayer('polygon');
    // 막대 라벨 그룹 찾기
    const labelsGroup = this.layerManager.findLayer('bar-labels');

    // 히스토그램도 다각형도 없으면 리턴
    if (!histogramGroup && !polygonGroup) return;

    // 다중 데이터셋 구조: 각 데이터셋 그룹의 자식들을 모두 수집
    const bars = [];
    if (histogramGroup) {
      histogramGroup.children.forEach(datasetGroup => {
        bars.push(...datasetGroup.children);
      });
    }

    const points = [];
    const lines = [];
    if (polygonGroup) {
      polygonGroup.children.forEach(datasetPolygonGroup => {
        const pointsGroup = datasetPolygonGroup.children.find(c => c.id.includes('points'));
        if (pointsGroup) {
          points.push(...pointsGroup.children);
        }

        const linesGroup = datasetPolygonGroup.children.find(c => c.id.includes('lines'));
        if (linesGroup) {
          lines.push(...linesGroup.children);
        }
      });
    }

    const labels = labelsGroup?.children || [];

    // 계급별로 묶어서 순차 애니메이션
    // 기준: 막대와 점 중 더 많은 쪽 (보통 같지만 안전하게)
    const classes = datasetResults[0]?.classes || [];
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

    for (let i = 0; i < classCount; i++) {
      // 현재 계급 인덱스 i를 기준으로 막대, 점, 라벨 찾기
      const barIdx = barIndexMap.get(i);
      const bar = barIdx !== undefined ? bars[barIdx] : null;

      const pointIdx = pointIndexMap.get(i);
      const point = pointIdx !== undefined ? points[pointIdx] : null;

      const labelIdx = labelIndexMap.get(i);
      const label = labelIdx !== undefined ? labels[labelIdx] : null;

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

      // 파선 애니메이션 (점과 동일한 타이밍, 우→좌 그리기)
      const dashedLine = this.layerManager.findLayer(`dashed-line-${i}`);
      if (dashedLine && dashedLine.visible) {
        this.timeline.addAnimation(dashedLine.id, {
          startTime: currentTime,
          duration: pointDuration,
          effect: 'draw',
          effectOptions: { direction: 'right-to-left' },
          easing: 'easeOut'
        });
      }

      // 다음 계급으로
      currentTime += Math.max(barDuration, pointDuration) + classDelay;
    }

    // 연결선 애니메이션 (모든 계급 완료 후)
    if (lines.length > 0) {
      currentTime += CONFIG.ANIMATION_LINE_START_DELAY;

      lines.forEach((line, idx) => {
        this.timeline.addAnimation(line.id, {
          startTime: currentTime + (idx * lineDelay),
          duration: lineDuration,
          effect: 'draw',
          effectOptions: { direction: 'left-to-right' },
          easing: 'linear'
        });
      });
    }

    // 말풍선 그룹 애니메이션 (모든 선이 완료된 후)
    const calloutsGroup = this.layerManager.findLayer('callouts');
    if (calloutsGroup && calloutsGroup.children) {
      const lineEndTime = currentTime + (lines.length * lineDelay) + lineDuration;

      calloutsGroup.children.forEach((calloutLayer, idx) => {
        this.timeline.addAnimation(calloutLayer.id, {
          startTime: lineEndTime + CONFIG.ANIMATION_CALLOUT_DELAY + (idx * 100),
          duration: CONFIG.ANIMATION_POINT_DURATION,
          effect: 'custom', // 투명도 애니메이션은 직접 처리
          effectOptions: {},
          easing: 'easeIn'
        });
      });
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
    if (!this.animationMode || !this.currentDatasetResults) {
      return;
    }

    this.stopAnimation();
    this.timeline.clearAnimations();
    this.setupAnimations(this.currentDatasetResults);
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

    // 렌더링 순서: bar → line → dashed-line → point (타입 기준 정렬)
    const renderOrder = { 'bar': 0, 'line': 1, 'dashed-line': 2, 'point': 3, 'bar-label': 4, 'callout': 5 };
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

    this.axisRenderer.drawLegend(this.currentDataType);

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

/**
 * 산점도 렌더러
 * X-Y 좌표 데이터를 점으로 시각화
 * @version 2.0.0 - 인스턴스 기반 + 애니메이션 지원
 */

import CONFIG from '../config.js';
import * as KatexUtils from '../utils/katex.js';
import { Layer, LayerManager, LayerTimeline, LayerAnimationEffects } from '../animation/index.js';

class ScatterRenderer {
  /**
   * @param {HTMLCanvasElement} canvas - Canvas 요소
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.layerManager = new LayerManager();
    this.timeline = new LayerTimeline();
    this.animationMode = true;
    this.animationSpeed = 1.0;
    this.timeline.onUpdate = () => this.renderFrame();

    // 렌더링 관련 상태
    this.config = null;
    this.coords = null;
    this.range = null;
    this.padding = null;
    this.data = null;
    this.options = null;
    this.pointHighlights = [];  // 강조할 점 목록
  }

  /**
   * 산점도 렌더링
   * @param {Object} config - 설정 객체
   * @returns {Object} 렌더링 결과
   */
  render(config) {
    this.config = config;
    this.data = config.data;
    this.options = config.options || {};
    this.pointHighlights = this.options.pointHighlights || [];

    const ctx = this.ctx;
    const canvas = this.canvas;

    // 캔버스 크기 설정 (500x500 고정)
    const FIXED_SCATTER_SIZE = 500;
    canvas.width = FIXED_SCATTER_SIZE;
    canvas.height = FIXED_SCATTER_SIZE;

    // 캔버스 크기 설정 (폰트 스케일링용)
    CONFIG.setCanvasSize(FIXED_SCATTER_SIZE);

    // 배경 투명 (클리어)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 데이터 검증
    if (!this.data || !Array.isArray(this.data) || this.data.length < 2) {
      this._drawNoDataMessage(ctx, canvas);
      return { error: '최소 2개의 데이터 포인트가 필요합니다.' };
    }

    // 데이터 범위 추출
    this.range = this._extractRange(this.data);

    // 좌표계 생성
    this.padding = CONFIG.getScaledValue(CONFIG.SCATTER_PADDING);
    this.coords = this._createCoordinateSystem(canvas, this.padding, this.range);

    // 애니메이션 모드: 레이어 생성
    if (this.animationMode && config.animation !== false) {
      this._createLayers();
      this._setupAnimations();
      // 초기 상태: 애니메이션 끝 상태로 렌더링
      this.timeline.currentTime = this.timeline.duration;
      this.renderFrame();
    } else {
      // 정적 렌더링
      this._drawGrid(ctx, canvas, this.padding, this.coords, this.range, this.options);
      this._drawAxes(ctx, canvas, this.padding, this.coords, this.range, this.options.axisLabels);
      this._drawPoints(ctx, this.data, this.coords, this.options);
    }

    return {
      success: true,
      coords: this.coords,
      range: this.range,
      padding: this.padding,
      canvasHeight: canvas.height
    };
  }

  /**
   * 레이어 생성 (점들을 Layer로 변환)
   */
  _createLayers() {
    const { toX, toY } = this.coords;
    const pointSize = CONFIG.getScaledValue(this.options.pointSize || CONFIG.SCATTER_POINT_RADIUS);
    const pointColor = this.options.pointColor || CONFIG.SCATTER_POINT_COLOR;

    // 루트 그룹
    const rootLayer = new Layer({
      id: 'scatter-root',
      name: '산점도',
      type: 'group',
      visible: true,
      order: 0
    });
    this.layerManager.addLayer(rootLayer);

    // 점 그룹
    const pointsGroup = new Layer({
      id: 'points-group',
      name: '데이터 점',
      type: 'group',
      visible: true,
      order: 1,
      p_id: 'scatter-root'
    });
    this.layerManager.addLayer(pointsGroup);

    // 개별 점 레이어
    this.data.forEach((point, index) => {
      const [x, y] = point;
      const cx = toX(x);
      const cy = toY(y);

      // 강조 대상인지 확인
      const highlight = this.pointHighlights.find(h => h.x === x && h.y === y);

      const pointLayer = new Layer({
        id: `point-${index}`,
        name: `점 (${x}, ${y})`,
        type: 'point',
        visible: true,
        order: index,
        p_id: 'points-group',
        data: {
          index,  // 인덱스 저장
          x,
          y,
          cx,
          cy,
          radius: pointSize,
          color: pointColor,
          highlight: highlight ? {
            color: highlight.color || CONFIG.SCATTER_HIGHLIGHT_COLOR,
            scale: highlight.scale || CONFIG.SCATTER_HIGHLIGHT_SCALE,
            label: highlight.label || null
          } : null
        }
      });
      this.layerManager.addLayer(pointLayer);
    });
  }

  /**
   * 순차 Scale 애니메이션 설정 (x좌표 순서대로 왼쪽→오른쪽)
   */
  _setupAnimations() {
    const pointLayers = this.layerManager.getLayersByType('point');

    // x좌표(원본 데이터 기준) 오름차순 정렬
    const sortedLayers = [...pointLayers].sort((a, b) => a.data.x - b.data.x);

    let currentTime = 0;

    // 등장 애니메이션
    sortedLayers.forEach((layer) => {
      this.timeline.addAnimation(layer.id, {
        startTime: currentTime,
        duration: 150,  // 각 점 150ms (빠르게 탁탁)
        effect: 'scale',
        effectOptions: {
          from: 0,
          to: 1,
          centerX: layer.data.cx,
          centerY: layer.data.cy
        },
        easing: 'easeOutBack'
      });
      currentTime += 60;  // 점 간 딜레이 60ms
    });

    // 등장 애니메이션 완료 시점 (마지막 점 애니메이션 종료)
    const lastAnimEndTime = currentTime - 60 + 150;

    // 강조 애니메이션 (등장 완료 후)
    const highlightStartTime = lastAnimEndTime + 100;  // 100ms 딜레이

    pointLayers.forEach(layer => {
      if (!layer.data.highlight) return;

      this.timeline.addAnimation(`${layer.id}-highlight`, {
        startTime: highlightStartTime,
        duration: CONFIG.SCATTER_HIGHLIGHT_DURATION,
        effect: 'custom',  // 커스텀 효과 (renderFrame에서 처리)
        effectOptions: {
          type: 'highlight',
          scale: layer.data.highlight.scale,
          color: layer.data.highlight.color
        },
        easing: 'easeOutBack'
      });
    });
  }

  /**
   * 프레임 렌더링 (애니메이션용)
   */
  renderFrame() {
    const ctx = this.ctx;
    const canvas = this.canvas;

    // 캔버스 크기 설정 복원 (다른 렌더러가 변경했을 수 있음)
    CONFIG.setCanvasSize(Math.max(canvas.width, canvas.height));

    // 캔버스 클리어
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. 정적 요소 (격자, 축) - 항상 표시
    this._drawGrid(ctx, canvas, this.padding, this.coords, this.range, this.options);
    this._drawAxes(ctx, canvas, this.padding, this.coords, this.range, this.options.axisLabels);

    // 2. 활성 애니메이션 가져오기
    const activeAnimations = this.timeline.getActiveAnimations();
    const progressMap = new Map();
    activeAnimations.forEach(anim => {
      progressMap.set(anim.layerId, anim.progress);
    });

    // 3. 점들 (애니메이션 적용)
    const pointLayers = this.layerManager.getLayersByType('point');
    pointLayers.forEach(layer => {
      if (!layer.visible) return;

      // 등장 애니메이션
      const animation = this.timeline.animations.get(layer.id);
      if (!animation) {
        // 애니메이션 없으면 정적 렌더링 (강조 체크)
        this._renderPointWithHighlight(layer.data);
        return;
      }

      // 등장 애니메이션 progress 계산
      const animEndTime = animation.startTime + animation.duration;
      let progress = 0;

      if (this.timeline.currentTime >= animEndTime) {
        progress = 1;
      } else if (this.timeline.currentTime > animation.startTime) {
        const elapsed = this.timeline.currentTime - animation.startTime;
        progress = Math.min(elapsed / animation.duration, 1);
      }

      if (progress <= 0) return;

      // 등장 애니메이션 완료 후 강조 처리
      if (progress >= 1) {
        this._renderPointWithHighlight(layer.data);
      } else {
        // 등장 중: scale 효과
        LayerAnimationEffects.apply(ctx, progress, 'scale', {
          from: 0,
          to: 1,
          centerX: layer.data.cx,
          centerY: layer.data.cy
        }, () => {
          this._renderPoint(layer.data);
        });
      }
    });
  }

  /**
   * 강조 상태를 포함한 점 렌더링
   */
  _renderPointWithHighlight(pointData) {
    const { highlight } = pointData;

    // 강조 대상이 아니면 일반 렌더링
    if (!highlight) {
      this._renderPoint(pointData);
      return;
    }

    // 강조 애니메이션 확인 - pointData에 저장된 인덱스 사용
    const highlightAnimKey = `point-${pointData.index}-highlight`;
    const highlightAnim = this.timeline.animations.get(highlightAnimKey);

    if (!highlightAnim) {
      // 애니메이션 없으면 강조 상태로 렌더링
      this._renderHighlightedPoint(pointData, 1);
      return;
    }

    // 강조 애니메이션 progress 계산
    const animEndTime = highlightAnim.startTime + highlightAnim.duration;
    let highlightProgress = 0;

    if (this.timeline.currentTime >= animEndTime) {
      highlightProgress = 1;
    } else if (this.timeline.currentTime > highlightAnim.startTime) {
      const elapsed = this.timeline.currentTime - highlightAnim.startTime;
      highlightProgress = Math.min(elapsed / highlightAnim.duration, 1);
    }

    if (highlightProgress > 0) {
      this._renderHighlightedPoint(pointData, highlightProgress);
    } else {
      this._renderPoint(pointData);
    }
  }

  /**
   * 단일 점 렌더링
   */
  _renderPoint(pointData) {
    const { cx, cy, radius, color } = pointData;
    const ctx = this.ctx;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * 강조된 점 렌더링
   * @param {Object} pointData - 점 데이터
   * @param {number} progress - 강조 애니메이션 진행도 (0~1)
   */
  _renderHighlightedPoint(pointData, progress) {
    const { cx, cy, radius, color, highlight } = pointData;
    const ctx = this.ctx;

    // easeOutBack 이징 적용
    const easedProgress = this._easeOutBack(progress);

    // 크기 보간: 1 → highlight.scale
    const currentScale = 1 + (highlight.scale - 1) * easedProgress;
    const currentRadius = radius * currentScale;

    // 색상 보간: 원래 색상 → 강조 색상
    const currentColor = progress >= 1 ? highlight.color : this._interpolateColor(color, highlight.color, easedProgress);

    ctx.fillStyle = currentColor;
    ctx.beginPath();
    ctx.arc(cx, cy, currentRadius, 0, Math.PI * 2);
    ctx.fill();

    // 라벨 렌더링 (애니메이션 완료 후)
    if (highlight.label && progress >= 1) {
      this._renderHighlightLabel(pointData, currentRadius);
    }
  }

  /**
   * 강조점 라벨 렌더링
   * @param {Object} pointData - 점 데이터
   * @param {number} pointRadius - 현재 점 반지름
   */
  _renderHighlightLabel(pointData, pointRadius) {
    const { highlight } = pointData;
    const label = highlight.label;

    // 라벨 위치 결정 (다른 점들과 충돌 최소화)
    const labelPos = this._findBestLabelPosition(pointData, pointRadius);

    const fontSize = CONFIG.getScaledFontSize(32);

    // KaTeX로 라벨 렌더링
    KatexUtils.render(this.ctx, label, labelPos.x, labelPos.y, {
      fontSize,
      color: highlight.color,
      align: 'center',
      baseline: 'middle'
    });
  }

  /**
   * 최적의 라벨 위치 찾기 (충돌 최소화)
   * @param {Object} pointData - 점 데이터
   * @param {number} pointRadius - 현재 점 반지름
   * @returns {{x: number, y: number}} 라벨 위치
   */
  _findBestLabelPosition(pointData, pointRadius) {
    const { cx, cy, x, y } = pointData;
    const offset = pointRadius + CONFIG.getScaledValue(15);

    // 8방향 후보 (우상, 우, 우하, 하, 좌하, 좌, 좌상, 상)
    const directions = [
      { dx: 1, dy: -1 },   // 우상
      { dx: 1, dy: 0 },    // 우
      { dx: 1, dy: 1 },    // 우하
      { dx: 0, dy: 1 },    // 하
      { dx: -1, dy: 1 },   // 좌하
      { dx: -1, dy: 0 },   // 좌
      { dx: -1, dy: -1 },  // 좌상
      { dx: 0, dy: -1 }    // 상
    ];

    // 각 방향에서 다른 점들과의 거리 계산
    let bestDir = directions[0];
    let bestScore = -Infinity;

    const pointLayers = this.layerManager.getLayersByType('point');

    for (const dir of directions) {
      const candidateX = cx + dir.dx * offset;
      const candidateY = cy + dir.dy * offset;

      // 캔버스 경계 체크
      if (candidateX < this.padding || candidateX > this.canvas.width - this.padding ||
          candidateY < this.padding || candidateY > this.canvas.height - this.padding) {
        continue;
      }

      // 다른 점들과의 최소 거리
      let minDist = Infinity;
      for (const layer of pointLayers) {
        if (layer.data.x === x && layer.data.y === y) continue;
        const dist = Math.hypot(candidateX - layer.data.cx, candidateY - layer.data.cy);
        minDist = Math.min(minDist, dist);
      }

      if (minDist > bestScore) {
        bestScore = minDist;
        bestDir = dir;
      }
    }

    return {
      x: cx + bestDir.dx * offset,
      y: cy + bestDir.dy * offset
    };
  }

  /**
   * easeOutBack 이징 함수
   */
  _easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  /**
   * 색상 보간 (hex → hex)
   */
  _interpolateColor(color1, color2, progress) {
    const hex2rgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    };

    const rgb2hex = (r, g, b) => {
      return '#' + [r, g, b].map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
    };

    const c1 = hex2rgb(color1);
    const c2 = hex2rgb(color2);

    const r = c1.r + (c2.r - c1.r) * progress;
    const g = c1.g + (c2.g - c1.g) * progress;
    const b = c1.b + (c2.b - c1.b) * progress;

    return rgb2hex(r, g, b);
  }

  /**
   * 애니메이션 비활성화
   */
  disableAnimation() {
    this.animationMode = false;
  }

  /**
   * 애니메이션 재생
   */
  playAnimation() {
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
    this.timeline.currentTime = 0;
    this.renderFrame();
  }

  /**
   * 애니메이션 다시 재생
   */
  replayAnimation() {
    this.timeline.stop();
    this.timeline.currentTime = 0;
    this.timeline.play();
  }

  /**
   * 애니메이션 속도 설정
   */
  setAnimationSpeed(speed) {
    this.animationSpeed = speed;
    // LayerTimeline doesn't have setSpeed method, speed is handled in _animate
  }

  // ============================================
  // 헬퍼 메서드들
  // ============================================

  /**
   * 데이터에서 범위 추출
   */
  _extractRange(data) {
    const xValues = data.map(p => p[0]);
    const yValues = data.map(p => p[1]);

    const xDataMin = Math.min(...xValues);
    const xDataMax = Math.max(...xValues);
    const yDataMin = Math.min(...yValues);
    const yDataMax = Math.max(...yValues);

    const xRange = xDataMax - xDataMin;
    const yRange = yDataMax - yDataMin;

    const xInterval = this._calculateNiceInterval(xRange);
    const yInterval = this._calculateNiceInterval(yRange);

    const xMin = Math.floor(xDataMin / xInterval) * xInterval;
    const xMax = Math.ceil(xDataMax / xInterval) * xInterval;
    const yMin = Math.floor(yDataMin / yInterval) * yInterval;
    const yMax = Math.ceil(yDataMax / yInterval) * yInterval;

    const hasXCompression = xMin > 0;
    const hasYCompression = yMin > 0;

    return {
      xMin, xMax, yMin, yMax,
      xDataMin, xDataMax, yDataMin, yDataMax,
      xInterval, yInterval,
      hasXCompression, hasYCompression
    };
  }

  /**
   * 깔끔한 축 간격 계산
   */
  _calculateNiceInterval(range) {
    if (range <= 0) return 1;

    const roughInterval = range / 5;
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughInterval)));
    const candidates = [1, 2, 5, 10];

    for (const c of candidates) {
      const interval = c * magnitude;
      if (interval >= roughInterval) {
        return interval;
      }
    }

    return 10 * magnitude;
  }

  /**
   * 좌표계 생성
   */
  _createCoordinateSystem(canvas, padding, range) {
    const chartW = canvas.width - padding * 2;
    const chartH = canvas.height - padding * 2;

    const xDataCells = Math.round((range.xMax - range.xMin) / range.xInterval);
    const yDataCells = Math.round((range.yMax - range.yMin) / range.yInterval);

    const xCompressionCells = range.hasXCompression ? 1 : 0;
    const yCompressionCells = range.hasYCompression ? 1 : 0;

    const xTotalCells = xCompressionCells + xDataCells + 1;
    const yTotalCells = yCompressionCells + yDataCells + 1;

    const xCellWidth = chartW / xTotalCells;
    const yCellHeight = chartH / yTotalCells;

    const toX = (value) => {
      const dataOffset = (value - range.xMin) / range.xInterval;
      return padding + (xCompressionCells + dataOffset) * xCellWidth;
    };

    const toY = (value) => {
      const dataOffset = (value - range.yMin) / range.yInterval;
      return canvas.height - padding - (yCompressionCells + dataOffset) * yCellHeight;
    };

    return {
      toX, toY, chartW, chartH,
      xCellWidth, yCellHeight,
      xTotalCells, yTotalCells,
      xCompressionCells, yCompressionCells
    };
  }

  /**
   * 그리드 렌더링
   */
  _drawGrid(ctx, canvas, padding, coords, range, options = {}) {
    const { xCellWidth, yCellHeight, xTotalCells, yTotalCells } = coords;

    // 셀 영역 색칠 (배경으로 먼저 렌더링)
    if (options.cellFill) {
      this._drawCellFill(ctx, canvas, padding, coords, options.cellFill);
    }

    ctx.lineWidth = CONFIG.getScaledLineWidth('thin');

    // 보조 격자선
    ctx.strokeStyle = '#555555';

    for (let i = 0; i < yTotalCells; i++) {
      const y = canvas.height - padding - (i + 0.5) * yCellHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }

    for (let i = 0; i < xTotalCells; i++) {
      const x = padding + (i + 0.5) * xCellWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, canvas.height - padding);
      ctx.stroke();
    }

    // 주 격자선 (가로)
    ctx.strokeStyle = CONFIG.getColor('--color-grid-horizontal');
    for (let i = 1; i < yTotalCells; i++) {
      const y = canvas.height - padding - i * yCellHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }

    // 주 격자선 (세로)
    ctx.strokeStyle = CONFIG.getColor('--color-grid-vertical');
    for (let i = 1; i < xTotalCells; i++) {
      const x = padding + i * xCellWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, canvas.height - padding);
      ctx.stroke();
    }

    // 축선 (테두리)
    ctx.strokeStyle = CONFIG.getColor('--color-axis');
    ctx.lineWidth = CONFIG.getScaledLineWidth('medium');

    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(canvas.width - padding, padding);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(canvas.width - padding, padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // 압축 기호
    if (coords.xCompressionCells > 0) {
      this._drawEllipsisSymbol(ctx, padding + xCellWidth / 4, canvas.height - padding, true);
    }

    if (coords.yCompressionCells > 0) {
      this._drawEllipsisSymbol(ctx, padding, canvas.height - padding - yCellHeight / 4, false);
    }
  }

  /**
   * 압축 기호 렌더링
   */
  _drawEllipsisSymbol(ctx, x, y, isHorizontal) {
    ctx.save();
    ctx.font = `400 ${CONFIG.getScaledFontSize(28)}px 'SCDream', sans-serif`;
    ctx.fillStyle = CONFIG.getColor('--color-ellipsis');
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    if (isHorizontal) {
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 2);
      ctx.fillText(CONFIG.AXIS_ELLIPSIS_SYMBOL, 0, 0);
    } else {
      ctx.fillText(CONFIG.AXIS_ELLIPSIS_SYMBOL, x, y);
    }
    ctx.restore();
  }

  /**
   * 축 및 라벨 렌더링
   */
  _drawAxes(ctx, canvas, padding, coords, range, axisLabels = {}) {
    const { toX, toY } = coords;
    const color = CONFIG.getColor('--color-text');
    const fontSize = CONFIG.getScaledFontSize(25);

    // 원점 라벨
    const originLabelX = padding - CONFIG.getScaledValue(12);
    const originLabelY = canvas.height - padding + CONFIG.getScaledValue(25);
    KatexUtils.render(ctx, '0', originLabelX, originLabelY, {
      fontSize, color, align: 'right', baseline: 'top'
    });

    // X축 라벨
    const xLabelY = canvas.height - padding + CONFIG.getScaledValue(25);
    const xLabelMax = range.xMax + range.xInterval;
    for (let value = range.xMin; value <= xLabelMax + 0.001; value += range.xInterval) {
      if (Math.abs(value) < 0.0001) continue;
      const x = toX(value);
      const label = Number.isInteger(value) ? String(value) : value.toFixed(1);
      KatexUtils.render(ctx, label, x, xLabelY, {
        fontSize, color, align: 'center', baseline: 'top'
      });
    }

    // Y축 라벨
    const yLabelX = padding - CONFIG.getScaledValue(12);
    const yLabelMax = range.yMax + range.yInterval;
    for (let value = range.yMin; value <= yLabelMax + 0.001; value += range.yInterval) {
      if (Math.abs(value) < 0.0001) continue;
      const y = toY(value);
      const label = Number.isInteger(value) ? String(value) : value.toFixed(1);
      KatexUtils.render(ctx, label, yLabelX, y, {
        fontSize, color, align: 'right', baseline: 'middle'
      });
    }

    // 축 제목
    const xTitle = axisLabels?.xAxis || '';
    const yTitle = axisLabels?.yAxis || '';

    if (xTitle) {
      KatexUtils.renderMixedText(ctx, xTitle,
        canvas.width - padding,
        canvas.height - padding + CONFIG.getScaledValue(55),
        { fontSize: CONFIG.getScaledFontSize(18), color, align: 'right', baseline: 'top' }
      );
    }

    if (yTitle) {
      KatexUtils.renderMixedText(ctx, yTitle,
        padding,
        padding - CONFIG.getScaledValue(15),
        { fontSize: CONFIG.getScaledFontSize(18), color, align: 'left', baseline: 'bottom' }
      );
    }
  }

  /**
   * 데이터 점 렌더링 (정적 모드용)
   */
  _drawPoints(ctx, data, coords, options) {
    const { toX, toY } = coords;
    const pointSize = CONFIG.getScaledValue(options.pointSize || CONFIG.SCATTER_POINT_RADIUS);
    const pointColor = options.pointColor || CONFIG.SCATTER_POINT_COLOR;
    const highlights = options.pointHighlights || [];

    // 강조점 정보 수집 (라벨 렌더링용)
    const highlightedPoints = [];

    data.forEach(([x, y]) => {
      const cx = toX(x);
      const cy = toY(y);

      // 강조 대상인지 확인
      const highlight = highlights.find(h => h.x === x && h.y === y);

      if (highlight) {
        // 강조 점 렌더링
        const highlightColor = highlight.color || CONFIG.SCATTER_HIGHLIGHT_COLOR;
        const highlightScale = highlight.scale || CONFIG.SCATTER_HIGHLIGHT_SCALE;
        const highlightRadius = pointSize * highlightScale;

        ctx.fillStyle = highlightColor;
        ctx.beginPath();
        ctx.arc(cx, cy, highlightRadius, 0, Math.PI * 2);
        ctx.fill();

        // 라벨이 있으면 수집
        if (highlight.label) {
          highlightedPoints.push({ x, y, cx, cy, highlightRadius, highlight });
        }
      } else {
        // 일반 점 렌더링
        ctx.fillStyle = pointColor;
        ctx.beginPath();
        ctx.arc(cx, cy, pointSize, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 라벨 렌더링 (정적 모드)
    highlightedPoints.forEach(point => {
      this._renderStaticHighlightLabel(ctx, point, data, coords);
    });
  }

  /**
   * 정적 모드에서 강조점 라벨 렌더링
   */
  _renderStaticHighlightLabel(ctx, point, data, coords) {
    const { highlightRadius, highlight } = point;
    const label = highlight.label;

    // 라벨 위치 결정
    const labelPos = this._findBestLabelPositionStatic(point, highlightRadius, data, coords);

    const fontSize = CONFIG.getScaledFontSize(32);

    // KaTeX로 라벨 렌더링
    KatexUtils.render(ctx, label, labelPos.x, labelPos.y, {
      fontSize,
      color: highlight.color || CONFIG.SCATTER_HIGHLIGHT_COLOR,
      align: 'center',
      baseline: 'middle'
    });
  }

  /**
   * 정적 모드에서 최적의 라벨 위치 찾기
   */
  _findBestLabelPositionStatic(point, pointRadius, data, coords) {
    const { cx, cy, x, y } = point;
    const { toX, toY } = coords;
    const offset = pointRadius + CONFIG.getScaledValue(15);

    const directions = [
      { dx: 1, dy: -1 },
      { dx: 1, dy: 0 },
      { dx: 1, dy: 1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: -1, dy: -1 },
      { dx: 0, dy: -1 }
    ];

    let bestDir = directions[0];
    let bestScore = -Infinity;

    for (const dir of directions) {
      const candidateX = cx + dir.dx * offset;
      const candidateY = cy + dir.dy * offset;

      // 캔버스 경계 체크
      if (candidateX < this.padding || candidateX > this.canvas.width - this.padding ||
          candidateY < this.padding || candidateY > this.canvas.height - this.padding) {
        continue;
      }

      // 다른 점들과의 최소 거리
      let minDist = Infinity;
      for (const [px, py] of data) {
        if (px === x && py === y) continue;
        const dist = Math.hypot(candidateX - toX(px), candidateY - toY(py));
        minDist = Math.min(minDist, dist);
      }

      if (minDist > bestScore) {
        bestScore = minDist;
        bestDir = dir;
      }
    }

    return {
      x: cx + bestDir.dx * offset,
      y: cy + bestDir.dy * offset
    };
  }

  /**
   * 데이터 없음 메시지
   */
  _drawNoDataMessage(ctx, canvas) {
    ctx.fillStyle = CONFIG.getColor('--color-text');
    ctx.font = CONFIG.CHART_FONT_BOLD;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('데이터가 없습니다.', canvas.width / 2, canvas.height / 2);
  }

  /**
   * 셀 범위 문자열 파싱
   * @param {string} cellStr - "x1-y1:x2-y2" 형식
   * @returns {{x1: number, y1: number, x2: number, y2: number}} 파싱된 범위
   */
  _parseCellRange(cellStr) {
    const [start, end] = cellStr.split(':');
    const [x1, y1] = start.split('-').map(Number);
    const [x2, y2] = end.split('-').map(Number);
    return { x1, y1, x2, y2 };
  }

  /**
   * 셀 영역 색칠 (그라데이션)
   * @param {CanvasRenderingContext2D} ctx
   * @param {HTMLCanvasElement} canvas
   * @param {number} padding
   * @param {Object} coords - 좌표 시스템
   * @param {Object} cellFillOptions - cellFill 옵션
   */
  _drawCellFill(ctx, canvas, padding, coords, cellFillOptions) {
    const { cells } = cellFillOptions;
    const range = this._parseCellRange(cells);

    const { xCellWidth, yCellHeight } = coords;

    // 셀 좌표 → 픽셀 좌표 변환
    // Y축은 반전 (셀 0이 하단)
    const x = padding + range.x1 * xCellWidth;
    const y = canvas.height - padding - (range.y2 + 1) * yCellHeight;
    const width = (range.x2 - range.x1 + 1) * xCellWidth;
    const height = (range.y2 - range.y1 + 1) * yCellHeight;

    // 그라데이션 생성 (하단 → 상단, 수직)
    const gradient = ctx.createLinearGradient(x, y + height, x, y);

    // 하단: #2ca0e8 (밝은 파랑), 상단: #4141a3 (보라)
    gradient.addColorStop(0, 'rgba(44, 160, 232, 0.3)');   // 하단 (#2ca0e8)
    gradient.addColorStop(1, 'rgba(65, 65, 163, 0.3)');    // 상단 (#4141a3)

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
  }

  // ============================================
  // 정적 메서드 (하위 호환성)
  // ============================================

  /**
   * 정적 렌더링 (하위 호환용)
   */
  static render(canvas, config) {
    const renderer = new ScatterRenderer(canvas);
    renderer.animationMode = false;
    return renderer.render(config);
  }

  /**
   * 데이터 유효성 검사
   */
  static validate(data) {
    if (!data || !Array.isArray(data)) {
      return { valid: false, error: 'data는 배열이어야 합니다.' };
    }
    if (data.length < 2) {
      return { valid: false, error: '최소 2개의 데이터 포인트가 필요합니다.' };
    }
    for (let i = 0; i < data.length; i++) {
      const point = data[i];
      if (!Array.isArray(point) || point.length !== 2) {
        return { valid: false, error: `${i}번째 포인트는 [x, y] 형식이어야 합니다.` };
      }
      if (typeof point[0] !== 'number' || typeof point[1] !== 'number') {
        return { valid: false, error: `${i}번째 포인트의 x, y는 숫자여야 합니다.` };
      }
    }
    return { valid: true, error: null };
  }
}

export default ScatterRenderer;

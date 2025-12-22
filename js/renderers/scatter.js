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

    const ctx = this.ctx;
    const canvas = this.canvas;

    // 캔버스 크기 설정
    const width = config.canvasWidth || CONFIG.SCATTER_DEFAULT_WIDTH;
    const height = config.canvasHeight || CONFIG.SCATTER_DEFAULT_HEIGHT;
    canvas.width = width;
    canvas.height = height;

    // 캔버스 크기 설정 (폰트 스케일링용)
    CONFIG.setCanvasSize(Math.max(width, height));

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
      this._drawGrid(ctx, canvas, this.padding, this.coords, this.range);
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

      const pointLayer = new Layer({
        id: `point-${index}`,
        name: `점 (${x}, ${y})`,
        type: 'point',
        visible: true,
        order: index,
        p_id: 'points-group',
        data: {
          x,
          y,
          cx,
          cy,
          radius: pointSize,
          color: pointColor
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
    // rebuildTimeline은 addAnimation 내부에서 자동 호출됨
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
    this._drawGrid(ctx, canvas, this.padding, this.coords, this.range);
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

      const animation = this.timeline.animations.get(layer.id);
      if (!animation) {
        // 애니메이션 없으면 정적 렌더링
        this._renderPoint(layer.data);
        return;
      }

      // 애니메이션 완료 상태면 progress = 1
      const animEndTime = animation.startTime + animation.duration;
      let progress = 0;

      if (this.timeline.currentTime >= animEndTime) {
        progress = 1;
      } else if (this.timeline.currentTime > animation.startTime) {
        const elapsed = this.timeline.currentTime - animation.startTime;
        progress = Math.min(elapsed / animation.duration, 1);
      }

      if (progress <= 0) return;

      // scale 효과: 중심에서 커지며 등장
      LayerAnimationEffects.apply(ctx, progress, 'scale', {
        from: 0,
        to: 1,
        centerX: layer.data.cx,
        centerY: layer.data.cy
      }, () => {
        this._renderPoint(layer.data);
      });
    });
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
  _drawGrid(ctx, canvas, padding, coords, range) {
    const { xCellWidth, yCellHeight, xTotalCells, yTotalCells } = coords;
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

    ctx.fillStyle = pointColor;

    data.forEach(([x, y]) => {
      const cx = toX(x);
      const cy = toY(y);

      ctx.beginPath();
      ctx.arc(cx, cy, pointSize, 0, Math.PI * 2);
      ctx.fill();
    });
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

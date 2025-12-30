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

    // CONFIG 상태 스냅샷 저장 (애니메이션 재생 시 복원용)
    this.configSnapshot = {
      CHART_ENGLISH_FONT: CONFIG.CHART_ENGLISH_FONT
    };

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
      this._drawAxes(ctx, canvas, this.padding, this.coords, this.range, this.options.axisLabels, this.options.axis);
      // 직선 (점보다 먼저)
      if (this.options.line) {
        this._drawStaticLine(ctx);
      }
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

    // 직선 draw 애니메이션 (점 등장 완료 후)
    let lineEndTime = lastAnimEndTime;
    if (this.options.line) {
      const lineStartTime = lastAnimEndTime + 100;  // 100ms 딜레이
      this.timeline.addAnimation('line', {
        startTime: lineStartTime,
        duration: 500,
        effect: 'draw',
        easing: 'easeOut'
      });
      lineEndTime = lineStartTime + 500;
    }

    // 강조 애니메이션 (직선 완료 후)
    const highlightStartTime = lineEndTime + 100;  // 100ms 딜레이

    // 강조 애니메이션 종료 시점 추적
    let highlightEndTime = lineEndTime;

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

      highlightEndTime = Math.max(highlightEndTime, highlightStartTime + CONFIG.SCATTER_HIGHLIGHT_DURATION);
    });

    // cellFill 페이드인 애니메이션 (가장 마지막)
    if (this.options.cellFill) {
      const cellFillStartTime = highlightEndTime + 100;  // 100ms 딜레이
      this.timeline.addAnimation('cellFill', {
        startTime: cellFillStartTime,
        duration: 400,
        effect: 'fade',
        effectOptions: { from: 0, to: 1 },
        easing: 'easeOut'
      });
    }
  }

  /**
   * 프레임 렌더링 (애니메이션용)
   */
  renderFrame() {
    const ctx = this.ctx;
    const canvas = this.canvas;

    // 캔버스 크기 설정 복원 (다른 렌더러가 변경했을 수 있음)
    CONFIG.setCanvasSize(Math.max(canvas.width, canvas.height));

    // CONFIG 상태 복원 (다른 차트가 변경했을 수 있음)
    if (this.configSnapshot) {
      CONFIG.CHART_ENGLISH_FONT = this.configSnapshot.CHART_ENGLISH_FONT;
    }

    // 캔버스 클리어
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. cellFill 애니메이션 렌더링 (배경으로 먼저 - 그리드보다 뒤)
    if (this.options.cellFill) {
      const cellFillAnim = this.timeline.animations.get('cellFill');
      if (cellFillAnim) {
        const animEndTime = cellFillAnim.startTime + cellFillAnim.duration;
        let progress = 0;

        if (this.timeline.currentTime >= animEndTime) {
          progress = 1;
        } else if (this.timeline.currentTime > cellFillAnim.startTime) {
          progress = (this.timeline.currentTime - cellFillAnim.startTime) / cellFillAnim.duration;
        }

        if (progress > 0) {
          this._drawCellFillWithAlpha(ctx, canvas, this.padding, this.coords, this.options.cellFill, progress);
        }
      }
    }

    // 2. 정적 요소 (격자, 축) - cellFill 제외
    const optionsWithoutCellFill = { ...this.options, cellFill: null };
    this._drawGrid(ctx, canvas, this.padding, this.coords, this.range, optionsWithoutCellFill);
    this._drawAxes(ctx, canvas, this.padding, this.coords, this.range, this.options.axisLabels, this.options.axis);

    // 3. 직선 렌더링 (점보다 먼저 - 점 뒤에 위치)
    if (this.options.line) {
      const lineAnim = this.timeline.animations.get('line');
      if (lineAnim) {
        const animEndTime = lineAnim.startTime + lineAnim.duration;
        let progress = 0;

        if (this.timeline.currentTime >= animEndTime) {
          progress = 1;
        } else if (this.timeline.currentTime > lineAnim.startTime) {
          progress = (this.timeline.currentTime - lineAnim.startTime) / lineAnim.duration;
        }

        if (progress > 0) {
          this._drawLineWithProgress(ctx, progress);
        }
      }
    }

    // 4. 활성 애니메이션 가져오기
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
    // 색상은 easeOutBack 대신 선형 또는 easeOutCubic 사용 (오버슈트 방지)
    const colorProgress = this._easeOutCubic(progress);
    const currentColor = progress >= 1 ? highlight.color : this._interpolateColor(color, highlight.color, colorProgress);

    ctx.fillStyle = currentColor;
    ctx.beginPath();
    ctx.arc(cx, cy, currentRadius, 0, Math.PI * 2);
    ctx.fill();

    // 라벨 렌더링 (점과 함께 스케일업 애니메이션)
    // 위치는 최종 크기 기준으로 고정 (애니메이션 중 위치 점프 방지)
    if (highlight.label) {
      const finalRadius = radius * highlight.scale;
      this._renderHighlightLabel(pointData, finalRadius, easedProgress);
    }
  }

  /**
   * 강조점 라벨 렌더링
   * @param {Object} pointData - 점 데이터
   * @param {number} pointRadius - 현재 점 반지름
   * @param {number} progress - 애니메이션 진행도 (0~1, eased)
   */
  _renderHighlightLabel(pointData, pointRadius, progress = 1) {
    const { highlight } = pointData;
    const label = highlight.label;

    // 라벨 타입 판별: 한 글자(영문/숫자)는 KaTeX, 그 외는 일반 텍스트
    const labelType = this._getLabelType(label);
    const baseFontSize = CONFIG.getScaledFontSize(labelType === 'katex' ? 32 : 20);

    // 라벨 위치 결정 (다른 점들과 충돌 최소화)
    const labelPos = this._findBestLabelPosition(pointData, pointRadius, labelType);

    // 스케일업 애니메이션: 0% → 100%
    const fontSize = baseFontSize * progress;

    // 폰트 크기가 너무 작으면 렌더링 스킵
    if (fontSize < 1) return;

    // 라벨 타입에 따라 렌더링 방식 결정
    if (labelType === 'katex') {
      // 한 글자 (A, B, x, y 등): KaTeX 렌더링
      KatexUtils.render(this.ctx, label, labelPos.x, labelPos.y, {
        fontSize,
        color: highlight.color,
        align: 'center',
        baseline: 'middle'
      });
    } else {
      // 여러 글자: renderMixedText (englishFont 옵션 적용)
      const useEnglishFont = CONFIG.CHART_ENGLISH_FONT;
      KatexUtils.renderMixedText(this.ctx, label, labelPos.x, labelPos.y, {
        fontSize,
        color: highlight.color,
        align: 'center',
        baseline: 'middle',
        useEnglishFont
      });
    }
  }

  /**
   * 라벨 타입 판별
   * @param {string} label - 라벨 텍스트
   * @returns {'katex'|'korean'|'text'} 라벨 타입
   */
  _getLabelType(label) {
    // 한 글자 영문/숫자는 KaTeX
    if (/^[A-Za-z0-9]$/.test(label)) {
      return 'katex';
    }
    // 한글 포함
    if (/[가-힣]/.test(label)) {
      return 'korean';
    }
    // 그 외 (여러 글자 영문 등)
    return 'text';
  }

  /**
   * 최적의 라벨 위치 찾기 (충돌 최소화)
   * @param {Object} pointData - 점 데이터
   * @param {number} pointRadius - 현재 점 반지름
   * @param {string} labelType - 라벨 타입 ('katex'|'korean'|'text')
   * @returns {{x: number, y: number}} 라벨 위치
   */
  _findBestLabelPosition(pointData, pointRadius, labelType = 'katex') {
    const { cx, cy, x, y, highlight } = pointData;
    const label = highlight.label;

    // 라벨 텍스트 크기 측정
    const fontSize = CONFIG.getScaledFontSize(labelType === 'katex' ? 32 : 20);
    const labelMetrics = this._measureLabelSize(label, fontSize, labelType);

    // 점 반지름 + 여백 + 라벨 크기의 절반을 오프셋으로 사용
    const margin = CONFIG.getScaledValue(8);

    // 8방향 후보 (우상, 우, 우하, 하, 좌하, 좌, 좌상, 상)
    const directions = [
      { dx: 1, dy: -1, offsetX: labelMetrics.width / 2 + margin, offsetY: labelMetrics.height / 2 + margin },   // 우상
      { dx: 1, dy: 0, offsetX: labelMetrics.width / 2 + margin, offsetY: 0 },    // 우
      { dx: 1, dy: 1, offsetX: labelMetrics.width / 2 + margin, offsetY: labelMetrics.height / 2 + margin },    // 우하
      { dx: 0, dy: 1, offsetX: 0, offsetY: labelMetrics.height / 2 + margin },    // 하
      { dx: -1, dy: 1, offsetX: labelMetrics.width / 2 + margin, offsetY: labelMetrics.height / 2 + margin },   // 좌하
      { dx: -1, dy: 0, offsetX: labelMetrics.width / 2 + margin, offsetY: 0 },   // 좌
      { dx: -1, dy: -1, offsetX: labelMetrics.width / 2 + margin, offsetY: labelMetrics.height / 2 + margin },  // 좌상
      { dx: 0, dy: -1, offsetX: 0, offsetY: labelMetrics.height / 2 + margin }    // 상
    ];

    // 각 방향에서 다른 점들과의 거리 계산
    let bestDir = directions[0];
    let bestScore = -Infinity;

    const pointLayers = this.layerManager.getLayersByType('point');

    // 직선 좌표 계산 (line 옵션이 있을 때)
    let lineX1, lineY1, lineX2, lineY2;
    if (this.options.line) {
      lineX1 = this.padding;
      lineY1 = this.canvas.height - this.padding;
      lineX2 = this.canvas.width - this.padding;
      lineY2 = this.padding;
    }

    for (const dir of directions) {
      // 방향별로 다른 오프셋 적용 (라벨 크기 기반)
      const offsetX = pointRadius + dir.offsetX;
      const offsetY = pointRadius + dir.offsetY;
      const candidateX = cx + dir.dx * offsetX;
      const candidateY = cy + dir.dy * offsetY;

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

      // 직선과의 거리도 고려
      if (this.options.line) {
        const lineDist = this._distanceToLine(candidateX, candidateY, lineX1, lineY1, lineX2, lineY2);
        minDist = Math.min(minDist, lineDist);
      }

      if (minDist > bestScore) {
        bestScore = minDist;
        bestDir = dir;
      }
    }

    // 선택된 방향의 오프셋으로 최종 위치 계산
    const finalOffsetX = pointRadius + bestDir.offsetX;
    const finalOffsetY = pointRadius + bestDir.offsetY;
    return {
      x: cx + bestDir.dx * finalOffsetX,
      y: cy + bestDir.dy * finalOffsetY
    };
  }

  /**
   * 라벨 텍스트 크기 측정
   * @param {string} label - 라벨 텍스트
   * @param {number} fontSize - 폰트 크기
   * @param {string} labelType - 라벨 타입 ('katex'|'korean'|'text')
   * @returns {{width: number, height: number}} 텍스트 크기
   */
  _measureLabelSize(label, fontSize, labelType) {
    const ctx = this.ctx;
    ctx.save();

    // 라벨 타입에 따라 폰트 설정
    if (labelType === 'katex') {
      ctx.font = `${fontSize}px 'KaTeX_Main', 'Times New Roman', serif`;
    } else if (labelType === 'korean') {
      ctx.font = `${fontSize}px 'SCDream', sans-serif`;
    } else {
      // text: englishFont 옵션에 따라
      const useEnglishFont = CONFIG.CHART_ENGLISH_FONT;
      ctx.font = useEnglishFont
        ? `${fontSize}px 'Source Han Sans KR', sans-serif`
        : `${fontSize}px 'SCDream', sans-serif`;
    }

    const metrics = ctx.measureText(label);
    ctx.restore();

    // 높이는 폰트 크기 기반으로 추정 (한글은 약간 더 높음)
    const height = fontSize * (labelType === 'korean' ? 1.2 : 1.0);
    return {
      width: metrics.width,
      height: height
    };
  }

  /**
   * 점에서 직선까지의 거리 계산
   * @param {number} px - 점 X
   * @param {number} py - 점 Y
   * @param {number} x1 - 직선 시작점 X
   * @param {number} y1 - 직선 시작점 Y
   * @param {number} x2 - 직선 끝점 X
   * @param {number} y2 - 직선 끝점 Y
   * @returns {number} 거리
   */
  _distanceToLine(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    return Math.hypot(px - xx, py - yy);
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
   * easeOutCubic 이징 함수 (색상 보간용, 오버슈트 없음)
   */
  _easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
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

    // 그리드 표시 옵션 (기본값: true)
    const gridOptions = options.grid || {};
    const showHorizontal = gridOptions.showHorizontal !== false;
    const showVertical = gridOptions.showVertical !== false;

    // 셀 영역 색칠 (배경으로 먼저 렌더링)
    if (options.cellFill) {
      this._drawCellFill(ctx, canvas, padding, coords, options.cellFill);
    }

    ctx.lineWidth = CONFIG.getScaledLineWidth('thin');

    // 보조 격자선 (가로)
    if (showHorizontal) {
      ctx.strokeStyle = '#555555';
      for (let i = 0; i < yTotalCells; i++) {
        const y = canvas.height - padding - (i + 0.5) * yCellHeight;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
      }
    }

    // 보조 격자선 (세로)
    if (showVertical) {
      ctx.strokeStyle = '#555555';
      for (let i = 0; i < xTotalCells; i++) {
        const x = padding + (i + 0.5) * xCellWidth;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, canvas.height - padding);
        ctx.stroke();
      }
    }

    // 주 격자선 (가로)
    if (showHorizontal) {
      ctx.strokeStyle = CONFIG.getColor('--color-grid-horizontal');
      for (let i = 1; i < yTotalCells; i++) {
        const y = canvas.height - padding - i * yCellHeight;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
      }
    }

    // 주 격자선 (세로)
    if (showVertical) {
      ctx.strokeStyle = CONFIG.getColor('--color-grid-vertical');
      for (let i = 1; i < xTotalCells; i++) {
        const x = padding + i * xCellWidth;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, canvas.height - padding);
        ctx.stroke();
      }
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

    // 압축 기호 (라벨이 숨겨지면 압축 기호도 숨김)
    const axisOptions = options.axis || {};
    const showXLabels = axisOptions.showXLabels !== false;
    const showYLabels = axisOptions.showYLabels !== false;

    if (coords.xCompressionCells > 0 && showXLabels) {
      this._drawEllipsisSymbol(ctx, padding + xCellWidth / 4, canvas.height - padding, true);
    }

    if (coords.yCompressionCells > 0 && showYLabels) {
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
   * @param {CanvasRenderingContext2D} ctx
   * @param {HTMLCanvasElement} canvas
   * @param {number} padding
   * @param {Object} coords
   * @param {Object} range
   * @param {Object} axisLabels - 축 제목 {xAxis, yAxis}
   * @param {Object} axisOptions - 축 표시 옵션 {showYLabels, showXLabels, showAxisLabels, showOriginLabel}
   */
  _drawAxes(ctx, canvas, padding, coords, range, axisLabels = {}, axisOptions = {}) {
    const { toX, toY } = coords;
    const color = CONFIG.getColor('--color-text');
    const fontSize = CONFIG.getScaledFontSize(25);

    // 옵션 기본값 (모두 true)
    const showYLabels = axisOptions.showYLabels !== false;
    const showXLabels = axisOptions.showXLabels !== false;
    const showAxisLabels = axisOptions.showAxisLabels !== false;
    const showOriginLabel = axisOptions.showOriginLabel !== false;

    // 원점 라벨
    if (showOriginLabel) {
      const originLabelX = padding - CONFIG.getScaledValue(12);
      const originLabelY = canvas.height - padding + CONFIG.getScaledValue(25);
      KatexUtils.render(ctx, '0', originLabelX, originLabelY, {
        fontSize, color, align: 'right', baseline: 'top'
      });
    }

    // X축 라벨
    if (showXLabels) {
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
    }

    // Y축 라벨
    if (showYLabels) {
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
    }

    // 축 제목
    if (showAxisLabels) {
      const xTitle = axisLabels?.xAxis || '';
      const yTitle = axisLabels?.yAxis || '';
      const useEnglishFont = CONFIG.CHART_ENGLISH_FONT;

      // 영어만 포함된 짧은 제목인지 확인 (한글 없음)
      const isEnglishOnly = (text) => !/[가-힣]/.test(text);

      if (xTitle) {
        if (useEnglishFont) {
          // englishFont: true → 오른쪽 정렬, 한 칸 아래
          const xTitleYOffset = showXLabels ? 55 : 25;
          KatexUtils.renderMixedText(ctx, xTitle,
            canvas.width - padding,
            canvas.height - padding + CONFIG.getScaledValue(xTitleYOffset),
            { fontSize: CONFIG.getScaledFontSize(22), color, align: 'right', baseline: 'top', useEnglishFont }
          );
        } else {
          // 기존 동작
          // 숫자 라벨 숨김 + 영어 제목일 때만 폰트 조정
          const xLabelsHiddenAndEnglish = !showXLabels && isEnglishOnly(xTitle);
          // 라벨 숨김 시 오프셋 조정 (영어: 25, 한글: 20), 표시 시: 55
          const xTitleYOffset = !showXLabels ? (isEnglishOnly(xTitle) ? 25 : 20) : 55;
          const xTitleFontSize = xLabelsHiddenAndEnglish ? 26 : 18;
          KatexUtils.renderMixedText(ctx, xTitle,
            canvas.width - padding,
            canvas.height - padding + CONFIG.getScaledValue(xTitleYOffset),
            { fontSize: CONFIG.getScaledFontSize(xTitleFontSize), color, align: 'right', baseline: 'top', useEnglishFont }
          );
        }
      }

      if (yTitle) {
        // Y축: 긴 영어 제목(영어만 + 4글자 이상)은 상단으로 올림 (최우선)
        const isLongEnglishTitle = isEnglishOnly(yTitle) && yTitle.length >= 4;

        if (isLongEnglishTitle) {
          // 긴 영어 제목: Y축 상단 위에 가로로 표시
          KatexUtils.renderMixedText(ctx, yTitle,
            padding,
            padding - CONFIG.getScaledValue(15),
            { fontSize: CONFIG.getScaledFontSize(18), color, align: 'left', baseline: 'bottom', useEnglishFont }
          );
        } else {
          // 기존 로직: 숫자 라벨 숨김 + 영어 제목일 때 Y축 왼쪽 상단 + 큰 폰트
          const yLabelsHiddenAndEnglish = !showYLabels && isEnglishOnly(yTitle);
          if (yLabelsHiddenAndEnglish) {
            // 숨김 + 영어: Y축 왼쪽 상단에 표시 (큰 폰트)
            KatexUtils.renderMixedText(ctx, yTitle,
              padding - CONFIG.getScaledValue(15),
              padding,
              { fontSize: CONFIG.getScaledFontSize(26), color, align: 'right', baseline: 'top', useEnglishFont }
            );
          } else {
            // 기존: 상단에 표시
            KatexUtils.renderMixedText(ctx, yTitle,
              padding,
              padding - CONFIG.getScaledValue(15),
              { fontSize: CONFIG.getScaledFontSize(18), color, align: 'left', baseline: 'bottom', useEnglishFont }
            );
          }
        }
      }
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

    // 라벨 타입 판별
    const labelType = this._getLabelType(label);

    // 라벨 위치 결정
    const labelPos = this._findBestLabelPositionStatic(point, highlightRadius, data, coords, labelType);

    const fontSize = CONFIG.getScaledFontSize(labelType === 'katex' ? 32 : 20);
    const color = highlight.color || CONFIG.SCATTER_HIGHLIGHT_COLOR;

    // 라벨 타입에 따라 렌더링 방식 결정
    if (labelType === 'katex') {
      // 한 글자 (A, B, x, y 등): KaTeX 렌더링
      KatexUtils.render(ctx, label, labelPos.x, labelPos.y, {
        fontSize,
        color,
        align: 'center',
        baseline: 'middle'
      });
    } else {
      // 여러 글자: renderMixedText (englishFont 옵션 적용)
      const useEnglishFont = CONFIG.CHART_ENGLISH_FONT;
      KatexUtils.renderMixedText(ctx, label, labelPos.x, labelPos.y, {
        fontSize,
        color,
        align: 'center',
        baseline: 'middle',
        useEnglishFont
      });
    }
  }

  /**
   * 정적 모드에서 최적의 라벨 위치 찾기
   * @param {string} labelType - 라벨 타입 ('katex'|'korean'|'text')
   */
  _findBestLabelPositionStatic(point, pointRadius, data, coords, labelType = 'katex') {
    const { cx, cy, x, y, highlight } = point;
    const { toX, toY } = coords;
    const label = highlight.label;

    // 라벨 텍스트 크기 측정
    const fontSize = CONFIG.getScaledFontSize(labelType === 'katex' ? 32 : 20);
    const labelMetrics = this._measureLabelSize(label, fontSize, labelType);

    // 점 반지름 + 여백 + 라벨 크기의 절반을 오프셋으로 사용
    const margin = CONFIG.getScaledValue(8);

    const directions = [
      { dx: 1, dy: -1, offsetX: labelMetrics.width / 2 + margin, offsetY: labelMetrics.height / 2 + margin },
      { dx: 1, dy: 0, offsetX: labelMetrics.width / 2 + margin, offsetY: 0 },
      { dx: 1, dy: 1, offsetX: labelMetrics.width / 2 + margin, offsetY: labelMetrics.height / 2 + margin },
      { dx: 0, dy: 1, offsetX: 0, offsetY: labelMetrics.height / 2 + margin },
      { dx: -1, dy: 1, offsetX: labelMetrics.width / 2 + margin, offsetY: labelMetrics.height / 2 + margin },
      { dx: -1, dy: 0, offsetX: labelMetrics.width / 2 + margin, offsetY: 0 },
      { dx: -1, dy: -1, offsetX: labelMetrics.width / 2 + margin, offsetY: labelMetrics.height / 2 + margin },
      { dx: 0, dy: -1, offsetX: 0, offsetY: labelMetrics.height / 2 + margin }
    ];

    let bestDir = directions[0];
    let bestScore = -Infinity;

    // 직선 좌표 계산 (line 옵션이 있을 때)
    let lineX1, lineY1, lineX2, lineY2;
    if (this.options.line) {
      lineX1 = this.padding;
      lineY1 = this.canvas.height - this.padding;
      lineX2 = this.canvas.width - this.padding;
      lineY2 = this.padding;
    }

    for (const dir of directions) {
      // 방향별로 다른 오프셋 적용 (라벨 크기 기반)
      const offsetX = pointRadius + dir.offsetX;
      const offsetY = pointRadius + dir.offsetY;
      const candidateX = cx + dir.dx * offsetX;
      const candidateY = cy + dir.dy * offsetY;

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

      // 직선과의 거리도 고려
      if (this.options.line) {
        const lineDist = this._distanceToLine(candidateX, candidateY, lineX1, lineY1, lineX2, lineY2);
        minDist = Math.min(minDist, lineDist);
      }

      if (minDist > bestScore) {
        bestScore = minDist;
        bestDir = dir;
      }
    }

    // 선택된 방향의 오프셋으로 최종 위치 계산
    const finalOffsetX = pointRadius + bestDir.offsetX;
    const finalOffsetY = pointRadius + bestDir.offsetY;
    return {
      x: cx + bestDir.dx * finalOffsetX,
      y: cy + bestDir.dy * finalOffsetY
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

  /**
   * 셀 영역 색칠 (애니메이션용 - alpha 적용)
   * @param {CanvasRenderingContext2D} ctx
   * @param {HTMLCanvasElement} canvas
   * @param {number} padding
   * @param {Object} coords - 좌표 시스템
   * @param {Object} cellFillOptions - cellFill 옵션
   * @param {number} alpha - 투명도 (0~1)
   */
  _drawCellFillWithAlpha(ctx, canvas, padding, coords, cellFillOptions, alpha) {
    const { cells } = cellFillOptions;
    const range = this._parseCellRange(cells);

    const { xCellWidth, yCellHeight } = coords;

    const x = padding + range.x1 * xCellWidth;
    const y = canvas.height - padding - (range.y2 + 1) * yCellHeight;
    const width = (range.x2 - range.x1 + 1) * xCellWidth;
    const height = (range.y2 - range.y1 + 1) * yCellHeight;

    const gradient = ctx.createLinearGradient(x, y + height, x, y);

    // alpha를 적용한 투명도 (기본 0.3 * alpha)
    const baseAlpha = 0.3;
    const finalAlpha = baseAlpha * alpha;

    gradient.addColorStop(0, `rgba(44, 160, 232, ${finalAlpha})`);
    gradient.addColorStop(1, `rgba(65, 65, 163, ${finalAlpha})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
  }

  /**
   * 직선 렌더링 (애니메이션용 - progress 적용)
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} progress - 애니메이션 진행도 (0~1)
   */
  _drawLineWithProgress(ctx, progress) {
    const lineOpts = this.options.line === true ? {} : this.options.line;
    const { toX, toY } = this.coords;

    let x1, y1, x2, y2;

    if (lineOpts.start || lineOpts.end) {
      // 커스텀 좌표가 지정된 경우 데이터 좌표 사용
      const startX = lineOpts.start?.[0] ?? this.range.xMin;
      const startY = lineOpts.start?.[1] ?? this.range.yMin;
      const endX = lineOpts.end?.[0] ?? this.range.xMax;
      const endY = lineOpts.end?.[1] ?? this.range.yMax;
      x1 = toX(startX);
      y1 = toY(startY);
      x2 = toX(endX);
      y2 = toY(endY);
    } else {
      // 기본값: 그래프 영역의 (0,0) → 우상단 모서리 (픽셀 좌표)
      // 좌하단: padding (진짜 원점 0,0)
      // 우상단: canvas 끝 - padding
      x1 = this.padding;
      y1 = this.canvas.height - this.padding;
      x2 = this.canvas.width - this.padding;
      y2 = this.padding;
    }

    // 유효성 검사
    if (!isFinite(x1) || !isFinite(y1) || !isFinite(x2) || !isFinite(y2)) {
      return;
    }

    // draw 애니메이션: progress에 따라 끝점 이동
    const currentX2 = x1 + (x2 - x1) * progress;
    const currentY2 = y1 + (y2 - y1) * progress;

    // 그라데이션 색상 (수직: 상단 #54a0f6 → 하단 #6de0fc)
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    // minY와 maxY가 같으면 단일 색상 사용
    let strokeStyle;
    if (lineOpts.color) {
      strokeStyle = lineOpts.color;
    } else if (maxY - minY < 1) {
      // Y 범위가 너무 작으면 단일 색상
      strokeStyle = '#54a0f6';
    } else {
      const gradient = ctx.createLinearGradient(0, minY, 0, maxY);
      gradient.addColorStop(0, '#54a0f6');  // 상단 (y가 작은 쪽)
      gradient.addColorStop(1, '#6de0fc');  // 하단 (y가 큰 쪽)
      strokeStyle = gradient;
    }

    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(currentX2, currentY2);
    ctx.stroke();
  }

  /**
   * 직선 렌더링 (정적 모드용)
   * @param {CanvasRenderingContext2D} ctx
   */
  _drawStaticLine(ctx) {
    this._drawLineWithProgress(ctx, 1);
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

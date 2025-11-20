/**
 * 차트 렌더링 레이어
 * Canvas를 사용한 히스토그램 및 상대도수 다각형 그리기
 */

import CONFIG from '../config.js';
import Utils from '../utils/utils.js';
import { Layer, LayerManager, LayerTimeline, LayerAnimationEffects } from '../animation/index.js';

/**
 * @class ChartRenderer
 * @description Canvas 기반 통계 차트 렌더러
 */
class ChartRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.padding = CONFIG.CHART_PADDING;

    // Layer 시스템
    this.layerManager = new LayerManager();
    this.timeline = new LayerTimeline();
    this.animationMode = false; // 애니메이션 모드 (기본: 정적 렌더링)
    this.animationSpeed = 1.0; // 애니메이션 속도 배율

    // 차트 데이터 저장 (renderFrame에서 사용)
    this.currentClasses = null;
    this.currentRelativeFreqs = null;
    this.currentCoords = null;
    this.currentEllipsisInfo = null;
    this.currentMaxY = null;
    this.currentAxisLabels = null;

    // 애니메이션 콜백
    this.timeline.onUpdate = () => this.renderFrame();
  }

  // ==================== 메인 렌더링 ====================

  /**
   * 히스토그램과 상대도수 다각형 그리기
   * @param {Array} classes - 계급 데이터 배열
   * @param {Object} axisLabels - 축 라벨 커스터마이징 객체
   * @param {Object} ellipsisInfo - 중략 표시 정보
   */
  draw(classes, axisLabels = null, ellipsisInfo = null) {
    this.canvas.width = CONFIG.CANVAS_WIDTH;
    this.canvas.height = CONFIG.CANVAS_HEIGHT;
    this.clear();

    const freq = classes.map(c => c.frequency);
    const total = freq.reduce((a, b) => a + b, 0);

    if (total === 0) {
      this.drawNoDataMessage();
      return;
    }

    const relativeFreqs = freq.map(f => f / total);
    const maxY = Math.max(...relativeFreqs) * CONFIG.CHART_Y_SCALE_MULTIPLIER;

    // 좌표 시스템 생성
    const coords = this.createCoordinateSystem(classes.length, ellipsisInfo, maxY);

    // 차트 데이터 저장 (애니메이션 모드용)
    this.currentClasses = classes;
    this.currentRelativeFreqs = relativeFreqs;
    this.currentCoords = coords;
    this.currentEllipsisInfo = ellipsisInfo;
    this.currentMaxY = maxY;
    this.currentAxisLabels = axisLabels;

    // 애니메이션 모드 분기
    if (this.animationMode) {
      // 애니메이션 모드: Layer 생성 후 애니메이션 재생
      this.createLayers(classes, relativeFreqs, coords, ellipsisInfo);
      this.setupAnimations(classes);
      this.playAnimation();
    } else {
      // 정적 렌더링 모드 (기존 방식)
      this.drawGrid(coords.toX, coords.toY, maxY, classes.length, ellipsisInfo);
      this.drawHistogram(relativeFreqs, freq, coords, ellipsisInfo);
      this.drawPolygon(relativeFreqs, coords, ellipsisInfo);
      this.drawAxes(classes, coords, maxY, axisLabels, ellipsisInfo);
      this.drawLegend();
    }
  }

  /**
   * 캔버스 초기화
   */
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // ==================== 좌표 시스템 ====================

  /**
   * 압축 여부에 따른 좌표 변환 함수 생성
   * @param {number} classCount - 계급 개수
   * @param {Object} ellipsisInfo - 중략 정보
   * @returns {Object} 좌표 변환 함수와 스케일 객체
   */
  createCoordinateSystem(classCount, ellipsisInfo, maxY) {
    const chartW = this.canvas.width - this.padding * 2;
    const chartH = this.canvas.height - this.padding * 2;

    let xScale, toX;

    if (ellipsisInfo && ellipsisInfo.show) {
      // 중략 표시: 빈 구간을 1칸으로 압축
      const firstDataIdx = ellipsisInfo.firstDataIndex;
      const visibleClasses = 1 + (classCount - firstDataIdx);
      xScale = chartW / visibleClasses;

      toX = (index) => {
        if (index === 0) return this.padding;
        if (index < firstDataIdx) return this.padding + xScale;
        return this.padding + xScale + (index - firstDataIdx) * xScale;
      };
    } else {
      // 기본 방식: 모든 계급을 동일 간격으로
      xScale = chartW / classCount;
      toX = (index) => this.padding + index * xScale;
    }

    const yScale = chartH / maxY;
    const toY = (value) => {
      return this.canvas.height - this.padding - value * yScale;
    };

    return { toX, toY, xScale, chartH };
  }

  /**
   * 막대의 중앙 X 좌표 계산
   * @param {number} index - 계급 인덱스
   * @param {Function} toX - X 좌표 변환 함수
   * @param {number} xScale - X축 스케일
   * @returns {number} 막대 중앙의 X 좌표
   */
  getBarCenterX(index, toX, xScale) {
    return toX(index) + xScale * CONFIG.CHART_BAR_CENTER_OFFSET;
  }

  /**
   * 중략 구간을 건너뛸지 판단
   * @param {number} index - 현재 인덱스
   * @param {Object} ellipsisInfo - 중략 정보
   * @returns {boolean} 건너뛸지 여부
   */
  shouldSkipEllipsis(index, ellipsisInfo) {
    if (!ellipsisInfo || !ellipsisInfo.show) return false;
    const firstDataIdx = ellipsisInfo.firstDataIndex;
    return index > 0 && index < firstDataIdx;
  }

  // ==================== 차트 요소 렌더링 ====================

  /**
   * 히스토그램 그리기
   * @param {Array} relativeFreqs - 상대도수 배열
   * @param {Array} freq - 도수 배열
   * @param {Object} coords - 좌표 시스템 객체
   * @param {Object} ellipsisInfo - 중략 정보
   */
  drawHistogram(relativeFreqs, freq, coords, ellipsisInfo) {
    const { toX, toY, xScale } = coords;

    relativeFreqs.forEach((relativeFreq, index) => {
      if (this.shouldSkipEllipsis(index, ellipsisInfo)) return;

      const x = toX(index);
      const y = toY(relativeFreq);
      const h = toY(0) - y;
      const barWidth = xScale * CONFIG.CHART_BAR_WIDTH_RATIO;

      // 그라디언트 막대
      const gradient = this.ctx.createLinearGradient(x, y, x, y + h);
      gradient.addColorStop(0, CONFIG.getColor('--chart-bar-color'));
      gradient.addColorStop(1, CONFIG.getColor('--chart-bar-color-end'));

      this.ctx.globalAlpha = 0.5;
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(x, y, barWidth, h);
      this.ctx.globalAlpha = 1.0;

      // 데이터가 있는 막대에만 녹색 테두리
      if (freq[index] > 0) {
        this.ctx.strokeStyle = CONFIG.CHART_BAR_BORDER_COLOR;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, barWidth, h);
      }

      // 도수 라벨
      this.ctx.fillStyle = CONFIG.getColor('--color-text');
      this.ctx.font = CONFIG.CHART_FONT_REGULAR;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        freq[index],
        this.getBarCenterX(index, toX, xScale),
        y - CONFIG.CHART_LABEL_OFFSET
      );
    });
  }

  /**
   * 상대도수 다각형 그리기
   * @param {Array} relativeFreqs - 상대도수 배열
   * @param {Object} coords - 좌표 시스템 객체
   * @param {Object} ellipsisInfo - 중략 정보
   */
  drawPolygon(relativeFreqs, coords, ellipsisInfo) {
    const { toX, toY, xScale } = coords;

    // 선 그리기
    this.ctx.strokeStyle = CONFIG.CHART_POLYGON_COLOR;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();

    let firstPoint = true;
    relativeFreqs.forEach((relativeFreq, index) => {
      if (this.shouldSkipEllipsis(index, ellipsisInfo)) return;

      const x = this.getBarCenterX(index, toX, xScale);
      const y = toY(relativeFreq);

      if (firstPoint) {
        this.ctx.moveTo(x, y);
        firstPoint = false;
      } else {
        this.ctx.lineTo(x, y);
      }
    });
    this.ctx.stroke();

    // 점 그리기
    relativeFreqs.forEach((relativeFreq, index) => {
      if (this.shouldSkipEllipsis(index, ellipsisInfo)) return;

      const centerX = this.getBarCenterX(index, toX, xScale);
      const centerY = toY(relativeFreq);

      const gradient = this.ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, CONFIG.CHART_POINT_RADIUS
      );
      gradient.addColorStop(0, CONFIG.getColor('--chart-line-color-start'));
      gradient.addColorStop(1, CONFIG.getColor('--chart-line-color-end'));

      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, CONFIG.CHART_POINT_RADIUS, 0, Math.PI * 2);
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
    });
  }

  /**
   * 축과 라벨 그리기
   * @param {Array} classes - 계급 배열
   * @param {Object} coords - 좌표 시스템 객체
   * @param {number} maxY - Y축 최댓값
   * @param {Object} axisLabels - 축 라벨
   * @param {Object} ellipsisInfo - 중략 정보
   */
  drawAxes(classes, coords, maxY, axisLabels, ellipsisInfo) {
    const { toX, toY, xScale } = coords;
    const xLabel = axisLabels?.xAxis || CONFIG.DEFAULT_LABELS.xAxis;
    const yLabel = axisLabels?.yAxis || CONFIG.DEFAULT_LABELS.yAxis;

    this.ctx.fillStyle = CONFIG.getColor('--color-text');
    this.ctx.font = CONFIG.CHART_FONT_BOLD;

    // Y축 라벨
    this.drawYAxisLabels(toY, maxY);

    // X축 라벨
    this.drawXAxisLabels(classes, toX, xScale, toY, ellipsisInfo);

    // 축 제목
    this.drawAxisTitles(xLabel, yLabel);
  }

  /**
   * Y축 라벨 그리기
   * @param {Function} toY - Y 좌표 변환 함수
   * @param {number} maxY - Y축 최댓값
   */
  drawYAxisLabels(toY, maxY) {
    this.ctx.textAlign = 'right';
    for (let i = 0; i <= CONFIG.CHART_GRID_DIVISIONS; i++) {
      const value = maxY * i / CONFIG.CHART_GRID_DIVISIONS;
      const formattedValue = Utils.formatNumber(value);
      this.ctx.fillText(
        formattedValue,
        this.padding - CONFIG.CHART_Y_LABEL_OFFSET,
        toY(value) + CONFIG.CHART_LABEL_OFFSET
      );
    }
  }

  /**
   * X축 라벨 그리기 (중략 처리 포함)
   * @param {Array} classes - 계급 배열
   * @param {Function} toX - X 좌표 변환 함수
   * @param {number} xScale - X축 스케일
   * @param {Function} toY - Y 좌표 변환 함수
   * @param {Object} ellipsisInfo - 중략 정보
   */
  drawXAxisLabels(classes, toX, xScale, toY, ellipsisInfo) {
    this.ctx.textAlign = 'center';
    this.ctx.font = CONFIG.CHART_FONT_SMALL;
    const labelY = this.canvas.height - this.padding + CONFIG.CHART_X_LABEL_Y_OFFSET;

    if (ellipsisInfo && ellipsisInfo.show) {
      const firstDataIdx = ellipsisInfo.firstDataIndex;

      // 0 표시
      this.ctx.fillText('0', toX(0), labelY);

      // 중략 기호 (이중 물결, X축 위에 세로로)
      const ellipsisX = toX(0) + (toX(1) - toX(0)) * CONFIG.ELLIPSIS_POSITION_RATIO;
      const ellipsisY = toY(0);

      this.ctx.save();
      this.ctx.translate(ellipsisX, ellipsisY);
      this.ctx.rotate(Math.PI / 2); // 90도 회전
      this.ctx.font = CONFIG.CHART_FONT_LARGE;
      this.ctx.fillStyle = CONFIG.getColor('--color-text');
      this.ctx.fillText('≈', 0, 0);
      this.ctx.restore();

      // 데이터 구간 라벨
      for (let i = firstDataIdx; i < classes.length; i++) {
        this.ctx.fillText(classes[i].min, toX(i), labelY);
      }

      // 마지막 값
      this.ctx.fillText(
        classes[classes.length - 1].max,
        toX(classes.length - 1) + xScale,
        labelY
      );
    } else {
      // 중략 없이 전체 표시
      classes.forEach((c, i) => {
        this.ctx.fillText(c.min, toX(i), labelY);
      });

      if (classes.length > 0) {
        this.ctx.fillText(
          classes[classes.length - 1].max,
          toX(classes.length),
          labelY
        );
      }
    }
  }

  /**
   * 축 제목 그리기
   * @param {string} xLabel - X축 제목
   * @param {string} yLabel - Y축 제목
   */
  drawAxisTitles(xLabel, yLabel) {
    this.ctx.font = CONFIG.CHART_FONT_BOLD;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(xLabel, this.canvas.width / 2, this.canvas.height - CONFIG.CHART_X_TITLE_Y_OFFSET);

    this.ctx.save();
    this.ctx.translate(CONFIG.CHART_Y_TITLE_X_OFFSET, this.canvas.height / 2);
    this.ctx.rotate(-Math.PI / 2);
    this.ctx.fillText(yLabel, 0, 0);
    this.ctx.restore();
  }

  // ==================== 유틸리티 ====================

  /**
   * 배경 격자선 그리기
   * @param {Function} toX - X 좌표 변환 함수
   * @param {Function} toY - Y 좌표 변환 함수
   * @param {number} maxY - Y축 최댓값
   * @param {number} classCount - 계급 개수
   * @param {Object} ellipsisInfo - 중략 정보
   */
  drawGrid(toX, toY, maxY, classCount, ellipsisInfo) {
    this.ctx.strokeStyle = CONFIG.getColor('--color-grid');
    this.ctx.lineWidth = 1;

    // 가로 격자선 (Y축)
    for (let i = 0; i <= CONFIG.CHART_GRID_DIVISIONS; i++) {
      const y = toY(maxY * i / CONFIG.CHART_GRID_DIVISIONS);
      this.ctx.beginPath();
      this.ctx.moveTo(this.padding, y);
      this.ctx.lineTo(this.canvas.width - this.padding, y);
      this.ctx.stroke();
    }

    // 세로 격자선 (X축) - 막대 너비와 동일한 간격
    for (let i = 0; i <= classCount; i++) {
      if (this.shouldSkipEllipsis(i, ellipsisInfo)) continue;

      const x = toX(i);
      this.ctx.beginPath();
      this.ctx.moveTo(x, this.padding);
      this.ctx.lineTo(x, this.canvas.height - this.padding);
      this.ctx.stroke();
    }
  }

  /**
   * 중략 구간 시각적 표시 (zigzag 패턴)
   * @param {number} startX - 시작 X 좌표
   * @param {number} endX - 끝 X 좌표
   * @param {Function} getBaseY - 기준 Y 좌표를 가져오는 함수
   */
  drawEllipsisPattern(startX, endX, getBaseY) {
    const baseY = getBaseY(0);
    const zigzagHeight = CONFIG.CHART_ZIGZAG_HEIGHT;
    const zigzagWidth = CONFIG.CHART_ZIGZAG_WIDTH;
    const centerX = (startX + endX) / 2;
    const numZigzags = CONFIG.CHART_ZIGZAG_COUNT;
    const margin = CONFIG.CHART_ZIGZAG_MARGIN;

    this.ctx.strokeStyle = CONFIG.getColor('--color-text-light');
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    for (let i = 0; i < numZigzags; i++) {
      const x = centerX - (numZigzags * zigzagWidth / 2) + (i * zigzagWidth);
      this.ctx.moveTo(x, baseY - margin);
      this.ctx.lineTo(x + zigzagWidth / 2, baseY - margin - zigzagHeight);
      this.ctx.lineTo(x + zigzagWidth, baseY - margin);
    }

    this.ctx.stroke();
  }

  /**
   * 범례 그리기
   */
  drawLegend() {
    const legendX = this.canvas.width - CONFIG.CHART_LEGEND_X_OFFSET;
    this.ctx.textAlign = 'left';
    this.ctx.font = CONFIG.CHART_FONT_REGULAR;

    // 히스토그램 범례
    const barGradient = this.ctx.createLinearGradient(legendX, 20, legendX, 35);
    barGradient.addColorStop(0, CONFIG.getColor('--chart-bar-color'));
    barGradient.addColorStop(1, CONFIG.getColor('--chart-bar-color-end'));

    this.ctx.fillStyle = barGradient;
    this.ctx.fillRect(legendX, 20, 20, 15);
    this.ctx.strokeStyle = CONFIG.getColor('--color-border');
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(legendX, 20, 20, 15);
    this.ctx.fillStyle = CONFIG.getColor('--color-text');
    this.ctx.fillText('히스토그램', legendX + 25, 32);

    // 상대도수 다각형 범례
    this.ctx.strokeStyle = CONFIG.CHART_POLYGON_COLOR;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(legendX, 50);
    this.ctx.lineTo(legendX + 20, 50);
    this.ctx.stroke();

    const pointGradient = this.ctx.createRadialGradient(
      legendX + 10, 50, 0,
      legendX + 10, 50, 4
    );
    pointGradient.addColorStop(0, CONFIG.getColor('--chart-line-color-start'));
    pointGradient.addColorStop(1, CONFIG.getColor('--chart-line-color-end'));

    this.ctx.fillStyle = pointGradient;
    this.ctx.beginPath();
    this.ctx.arc(legendX + 10, 50, 4, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = CONFIG.getColor('--color-text');
    this.ctx.fillText('상대도수 다각형', legendX + 25, 54);
  }

  /**
   * 데이터 없음 메시지
   */
  drawNoDataMessage() {
    this.ctx.fillStyle = CONFIG.getColor('--color-text-light');
    this.ctx.font = CONFIG.CHART_FONT_LARGE;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      '데이터가 없습니다',
      this.canvas.width / 2,
      this.canvas.height / 2
    );
  }

  // ==================== Layer 시스템 ====================

  /**
   * Layer 생성
   * @param {Array} classes - 계급 데이터
   * @param {Array} relativeFreqs - 상대도수 배열
   * @param {Object} coords - 좌표 시스템
   * @param {Object} ellipsisInfo - 중략 정보
   */
  createLayers(classes, relativeFreqs, coords, ellipsisInfo) {
    this.layerManager.clear();

    // 히스토그램 그룹
    const histogramGroup = new Layer({
      id: 'histogram',
      name: '히스토그램',
      type: 'group',
      visible: true
    });

    // 다각형 그룹
    const polygonGroup = new Layer({
      id: 'polygon',
      name: '상대도수 다각형',
      type: 'group',
      visible: true
    });

    // 막대 레이어 생성
    relativeFreqs.forEach((relativeFreq, index) => {
      if (this.shouldSkipEllipsis(index, ellipsisInfo)) return;

      const barLayer = new Layer({
        id: `bar-${index}`,
        name: `막대 ${index}`,
        type: 'bar',
        visible: true,
        data: {
          index,
          relativeFreq,
          frequency: classes[index].frequency,
          coords,
          ellipsisInfo
        }
      });

      histogramGroup.addChild(barLayer);
    });

    // 점 그룹
    const pointsGroup = new Layer({
      id: 'points',
      name: '점',
      type: 'group',
      visible: true
    });

    // 선 그룹
    const linesGroup = new Layer({
      id: 'lines',
      name: '선',
      type: 'group',
      visible: true
    });

    // 점 레이어 생성
    relativeFreqs.forEach((relativeFreq, index) => {
      if (this.shouldSkipEllipsis(index, ellipsisInfo)) return;

      const pointLayer = new Layer({
        id: `point-${index}`,
        name: `점 ${index}`,
        type: 'point',
        visible: true,
        data: {
          index,
          relativeFreq,
          coords
        }
      });

      pointsGroup.addChild(pointLayer);
    });

    // 선 레이어 생성
    let prevIndex = null;
    relativeFreqs.forEach((relativeFreq, index) => {
      if (this.shouldSkipEllipsis(index, ellipsisInfo)) return;

      if (prevIndex !== null) {
        const lineLayer = new Layer({
          id: `line-${prevIndex}-${index}`,
          name: `선 ${prevIndex}-${index}`,
          type: 'line',
          visible: true,
          data: {
            fromIndex: prevIndex,
            toIndex: index,
            fromFreq: relativeFreqs[prevIndex],
            toFreq: relativeFreq,
            coords
          }
        });

        linesGroup.addChild(lineLayer);
      }

      prevIndex = index;
    });

    polygonGroup.addChild(pointsGroup);
    polygonGroup.addChild(linesGroup);

    this.layerManager.addLayer(histogramGroup);
    this.layerManager.addLayer(polygonGroup);
  }

  /**
   * 개별 막대 렌더링
   * @param {Layer} layer - 막대 레이어
   */
  renderBar(layer) {
    const { index, relativeFreq, frequency, coords } = layer.data;
    const { toX, toY, xScale } = coords;

    const x = toX(index);
    const y = toY(relativeFreq);
    const h = toY(0) - y;
    const barWidth = xScale * CONFIG.CHART_BAR_WIDTH_RATIO;

    // 그라디언트 막대
    const gradient = this.ctx.createLinearGradient(x, y, x, y + h);
    gradient.addColorStop(0, CONFIG.getColor('--chart-bar-color'));
    gradient.addColorStop(1, CONFIG.getColor('--chart-bar-color-end'));

    this.ctx.globalAlpha = 0.5;
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, y, barWidth, h);
    this.ctx.globalAlpha = 1.0;

    // 녹색 테두리 (데이터가 있는 경우)
    if (frequency > 0) {
      this.ctx.strokeStyle = CONFIG.CHART_BAR_BORDER_COLOR;
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x, y, barWidth, h);
    }

    // 도수 라벨
    this.ctx.fillStyle = CONFIG.getColor('--color-text');
    this.ctx.font = CONFIG.CHART_FONT_REGULAR;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      frequency,
      this.getBarCenterX(index, toX, xScale),
      y - CONFIG.CHART_LABEL_OFFSET
    );
  }

  /**
   * 개별 점 렌더링
   * @param {Layer} layer - 점 레이어
   */
  renderPoint(layer) {
    const { index, relativeFreq, coords } = layer.data;
    const { toX, xScale } = coords;

    const centerX = this.getBarCenterX(index, toX, xScale);
    const centerY = coords.toY(relativeFreq);

    const gradient = this.ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, CONFIG.CHART_POINT_RADIUS
    );
    gradient.addColorStop(0, CONFIG.getColor('--chart-line-color-start'));
    gradient.addColorStop(1, CONFIG.getColor('--chart-line-color-end'));

    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, CONFIG.CHART_POINT_RADIUS, 0, Math.PI * 2);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
  }

  /**
   * 개별 선 렌더링
   * @param {Layer} layer - 선 레이어
   */
  renderLine(layer) {
    const { fromIndex, toIndex, fromFreq, toFreq, coords } = layer.data;
    const { toX, toY, xScale } = coords;

    const x1 = this.getBarCenterX(fromIndex, toX, xScale);
    const y1 = toY(fromFreq);
    const x2 = this.getBarCenterX(toIndex, toX, xScale);
    const y2 = toY(toFreq);

    this.ctx.strokeStyle = CONFIG.CHART_POLYGON_COLOR;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  /**
   * Layer 렌더링
   * @param {Layer} layer - 렌더링할 레이어
   */
  renderLayer(layer) {
    if (!layer.visible) return;

    switch (layer.type) {
      case 'bar':
        this.renderBar(layer);
        break;
      case 'point':
        this.renderPoint(layer);
        break;
      case 'line':
        this.renderLine(layer);
        break;
      case 'group':
        // 그룹은 자식 레이어들을 렌더링
        layer.children.forEach(child => this.renderLayer(child));
        break;
    }
  }

  // ==================== Timeline & Animation ====================

  /**
   * 애니메이션 시퀀스 설정
   * @param {Array} classes - 계급 데이터
   */
  setupAnimations(classes) {
    this.timeline.clearAnimations();

    const barDelay = 100; // 막대 간 딜레이 (ms)
    const barDuration = 300; // 막대 애니메이션 시간 (ms)
    const pointDelay = 100; // 점 간 딜레이 (ms)
    const pointDuration = 300; // 점 애니메이션 시간 (ms)
    const lineDelay = 100; // 선 간 딜레이 (ms)
    const lineDuration = 300; // 선 애니메이션 시간 (ms)

    let currentTime = 0;

    // 1단계: 막대 순차 등장
    const histogramGroup = this.layerManager.findLayer('histogram');
    if (histogramGroup) {
      histogramGroup.children.forEach((barLayer, index) => {
        this.timeline.addAnimation(barLayer.id, {
          startTime: currentTime,
          duration: barDuration,
          effect: 'fade',
          effectOptions: {},
          easing: 'easeOut'
        });
        currentTime += barDelay;
      });
    }

    // 막대 애니메이션 완료 대기
    currentTime += barDuration;

    // 2단계: 점 순차 등장
    const pointsGroup = this.layerManager.findLayer('points');
    if (pointsGroup) {
      pointsGroup.children.forEach((pointLayer, index) => {
        this.timeline.addAnimation(pointLayer.id, {
          startTime: currentTime,
          duration: pointDuration,
          effect: 'fade',
          effectOptions: {},
          easing: 'easeOut'
        });
        currentTime += pointDelay;
      });
    }

    // 점 애니메이션 완료 대기
    currentTime += pointDuration;

    // 3단계: 선 순차 그리기
    const linesGroup = this.layerManager.findLayer('lines');
    if (linesGroup) {
      linesGroup.children.forEach((lineLayer, index) => {
        this.timeline.addAnimation(lineLayer.id, {
          startTime: currentTime,
          duration: lineDuration,
          effect: 'draw',
          effectOptions: { direction: 'left-to-right' },
          easing: 'linear'
        });
        currentTime += lineDelay;
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
    this.renderFrame(); // 초기 상태로 다시 렌더링
  }

  /**
   * 애니메이션 속도 설정
   * @param {number} speed - 속도 배율 (0.5 = 느리게, 2.0 = 빠르게)
   */
  setAnimationSpeed(speed) {
    this.animationSpeed = Math.max(0.1, Math.min(speed, 5.0));
    // Timeline의 delta에 속도 배율 적용 필요 (timeline.controller.js 수정 필요)
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
    this.drawGrid(
      this.currentCoords.toX,
      this.currentCoords.toY,
      this.currentMaxY,
      this.currentClasses.length,
      this.currentEllipsisInfo
    );
    this.drawAxes(
      this.currentClasses,
      this.currentCoords,
      this.currentMaxY,
      this.currentAxisLabels,
      this.currentEllipsisInfo
    );

    // 현재 시간에 활성화된 애니메이션 가져오기
    const activeAnimations = this.timeline.timeline.filter(anim => {
      const endTime = anim.startTime + anim.duration;
      return this.timeline.currentTime >= anim.startTime && this.timeline.currentTime <= endTime;
    });

    // 각 레이어를 애니메이션 효과와 함께 렌더링
    activeAnimations.forEach(anim => {
      const layer = this.layerManager.findLayer(anim.layerId);
      if (!layer || !layer.visible) return;

      // 진행도 계산 (0~1)
      const elapsed = this.timeline.currentTime - anim.startTime;
      const progress = Math.min(1, Math.max(0, elapsed / anim.duration));

      // 효과 적용하여 렌더링
      LayerAnimationEffects.apply(
        this.ctx,
        progress,
        anim.effect,
        anim.effectOptions,
        () => this.renderLayer(layer)
      );
    });

    // 애니메이션이 완료된 레이어는 완전히 표시
    const completedLayers = this.timeline.timeline.filter(anim => {
      const endTime = anim.startTime + anim.duration;
      return this.timeline.currentTime > endTime;
    });

    completedLayers.forEach(anim => {
      const layer = this.layerManager.findLayer(anim.layerId);
      if (layer && layer.visible) {
        this.renderLayer(layer);
      }
    });

    this.drawLegend();
  }
}

export default ChartRenderer;

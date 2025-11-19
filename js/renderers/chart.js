/**
 * 차트 렌더링 레이어
 * Canvas를 사용한 히스토그램 및 상대도수 다각형 그리기
 */

import CONFIG from '../config.js';
import Utils from '../utils/utils.js';

/**
 * @class ChartRenderer
 * @description Canvas 기반 통계 차트 렌더러
 */
class ChartRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.padding = CONFIG.CHART_PADDING;
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

    // 렌더링 순서
    this.drawGrid(coords.toX, coords.toY, maxY);
    this.drawHistogram(relativeFreqs, freq, coords, ellipsisInfo);
    this.drawPolygon(relativeFreqs, coords, ellipsisInfo);
    this.drawAxes(classes, coords, maxY, axisLabels, ellipsisInfo);
    this.drawLegend();
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

    relativeFreqs.forEach((r, i) => {
      if (this.shouldSkipEllipsis(i, ellipsisInfo)) return;

      const x = toX(i);
      const y = toY(r);
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
      if (freq[i] > 0) {
        this.ctx.strokeStyle = '#57F684';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, barWidth, h);
      }

      // 도수 라벨
      this.ctx.fillStyle = CONFIG.getColor('--color-text');
      this.ctx.font = '12px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        freq[i],
        this.getBarCenterX(i, toX, xScale),
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
    this.ctx.strokeStyle = '#FC9A63';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();

    let firstPoint = true;
    relativeFreqs.forEach((r, i) => {
      if (this.shouldSkipEllipsis(i, ellipsisInfo)) return;

      const x = this.getBarCenterX(i, toX, xScale);
      const y = toY(r);

      if (firstPoint) {
        this.ctx.moveTo(x, y);
        firstPoint = false;
      } else {
        this.ctx.lineTo(x, y);
      }
    });
    this.ctx.stroke();

    // 점 그리기
    relativeFreqs.forEach((r, i) => {
      if (this.shouldSkipEllipsis(i, ellipsisInfo)) return;

      const centerX = this.getBarCenterX(i, toX, xScale);
      const centerY = toY(r);

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
    this.ctx.font = 'bold 14px sans-serif';

    // Y축 라벨
    this.drawYAxisLabels(toY, maxY);

    // X축 라벨
    this.drawXAxisLabels(classes, toX, xScale, ellipsisInfo);

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
        this.padding - 10,
        toY(value) + CONFIG.CHART_LABEL_OFFSET
      );
    }
  }

  /**
   * X축 라벨 그리기 (중략 처리 포함)
   * @param {Array} classes - 계급 배열
   * @param {Function} toX - X 좌표 변환 함수
   * @param {number} xScale - X축 스케일
   * @param {Object} ellipsisInfo - 중략 정보
   */
  drawXAxisLabels(classes, toX, xScale, ellipsisInfo) {
    this.ctx.textAlign = 'center';
    this.ctx.font = '11px sans-serif';
    const labelY = this.canvas.height - this.padding + 20;

    if (ellipsisInfo && ellipsisInfo.show) {
      const firstDataIdx = ellipsisInfo.firstDataIndex;

      // 0 표시
      this.ctx.fillText('0', toX(0), labelY);

      // 중략 기호
      const ellipsisX = (toX(0) + toX(1)) / 2;
      this.ctx.fillText('⋯', ellipsisX, labelY + 10);

      // Zigzag 패턴
      this.drawEllipsisPattern(toX(0), toX(1), toY);

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
    this.ctx.font = 'bold 14px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(xLabel, this.canvas.width / 2, this.canvas.height - 10);

    this.ctx.save();
    this.ctx.translate(15, this.canvas.height / 2);
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
   */
  drawGrid(toX, toY, maxY) {
    this.ctx.strokeStyle = CONFIG.getColor('--color-grid');
    this.ctx.lineWidth = 1;

    for (let i = 0; i <= CONFIG.CHART_GRID_DIVISIONS; i++) {
      const y = toY(maxY * i / CONFIG.CHART_GRID_DIVISIONS);
      this.ctx.beginPath();
      this.ctx.moveTo(this.padding, y);
      this.ctx.lineTo(this.canvas.width - this.padding, y);
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
    const zigzagHeight = 15;
    const zigzagWidth = 8;
    const centerX = (startX + endX) / 2;
    const numZigzags = 3;

    this.ctx.strokeStyle = CONFIG.getColor('--color-text-light');
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    for (let i = 0; i < numZigzags; i++) {
      const x = centerX - (numZigzags * zigzagWidth / 2) + (i * zigzagWidth);
      this.ctx.moveTo(x, baseY - 5);
      this.ctx.lineTo(x + zigzagWidth / 2, baseY - 5 - zigzagHeight);
      this.ctx.lineTo(x + zigzagWidth, baseY - 5);
    }

    this.ctx.stroke();
  }

  /**
   * 범례 그리기
   */
  drawLegend() {
    const legendX = this.canvas.width - 180;
    this.ctx.textAlign = 'left';
    this.ctx.font = '12px sans-serif';

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
    this.ctx.strokeStyle = '#FC9A63';
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
    this.ctx.font = '16px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      '데이터가 없습니다',
      this.canvas.width / 2,
      this.canvas.height / 2
    );
  }
}

export default ChartRenderer;

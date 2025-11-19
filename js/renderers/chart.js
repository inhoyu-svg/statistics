/**
 * 차트 렌더링 레이어
 * Canvas를 사용한 히스토그램 및 상대도수 다각형 그리기
 */

import CONFIG from '../config.js';
import Utils from '../utils/utils.js';

class ChartRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.padding = CONFIG.CHART_PADDING;
  }

  /**
   * 캔버스 초기화
   */
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * 히스토그램과 상대도수 다각형 그리기
   */
  draw(classes) {
    // Canvas 크기 설정 (매번 그릴 때마다)
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

    const chartW = this.canvas.width - this.padding * 2;
    const chartH = this.canvas.height - this.padding * 2;
    const maxY = Math.max(...relativeFreqs) * CONFIG.CHART_Y_SCALE_MULTIPLIER;

    const xScale = chartW / classes.length;
    const yScale = chartH / maxY;

    // 좌표 변환 함수
    const toX = (index) => this.padding + index * xScale;
    const toY = (value) => this.canvas.height - this.padding - value * yScale;

    // 렌더링 순서
    this.drawGrid(toX, toY, maxY);
    this.drawHistogram(relativeFreqs, freq, toX, toY, xScale);
    this.drawPolygon(relativeFreqs, toX, toY, classes.length);
    this.drawAxes(classes, toX, toY, maxY, xScale);
    this.drawLegend();
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

  /**
   * 배경 격자선 그리기
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
   * 히스토그램 그리기
   */
  drawHistogram(relativeFreqs, freq, toX, toY, xScale) {
    relativeFreqs.forEach((r, i) => {
      const x = toX(i);
      const y = toY(r);
      const h = toY(0) - y;

      // 그라디언트 생성 (위에서 아래로)
      const gradient = this.ctx.createLinearGradient(x, y, x, y + h);
      gradient.addColorStop(0, CONFIG.getColor('--chart-bar-color'));
      gradient.addColorStop(1, CONFIG.getColor('--chart-bar-color-end'));

      // 막대 그리기 (투명도 50%)
      this.ctx.globalAlpha = 0.5;
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(x, y, xScale * CONFIG.CHART_BAR_WIDTH_RATIO, h);
      this.ctx.globalAlpha = 1.0; // 투명도 원래대로

      // 스트로크 그리기 (도수가 0이 아닐 때만)
      if (freq[i] > 0) {
        this.ctx.strokeStyle = '#57F684';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, xScale * CONFIG.CHART_BAR_WIDTH_RATIO, h);
      }

      // 도수 라벨
      this.ctx.fillStyle = CONFIG.getColor('--color-text');
      this.ctx.font = '12px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        freq[i],
        x + xScale * CONFIG.CHART_BAR_CENTER_OFFSET,
        y - CONFIG.CHART_LABEL_OFFSET
      );
    });
  }

  /**
   * 상대도수 다각형 그리기
   */
  drawPolygon(relativeFreqs, toX, toY, classCount) {
    // 라인 색상 (#FA716F + #F3A257의 중간색)
    this.ctx.strokeStyle = '#FC9A63';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();

    // 첫 번째 점에서 시작
    this.ctx.moveTo(toX(0 + CONFIG.CHART_BAR_CENTER_OFFSET), toY(relativeFreqs[0]));

    // 각 점 연결 (첫 번째는 이미 moveTo로 처리했으므로 두 번째부터)
    for (let i = 1; i < relativeFreqs.length; i++) {
      this.ctx.lineTo(toX(i + CONFIG.CHART_BAR_CENTER_OFFSET), toY(relativeFreqs[i]));
    }

    this.ctx.stroke();

    // 점 찍기 (그라디언트 효과)
    relativeFreqs.forEach((r, i) => {
      // 각 점마다 그라디언트 생성
      const centerX = toX(i + CONFIG.CHART_BAR_CENTER_OFFSET);
      const centerY = toY(r);
      const gradient = this.ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, CONFIG.CHART_POINT_RADIUS
      );
      gradient.addColorStop(0, CONFIG.getColor('--chart-line-color-start'));
      gradient.addColorStop(1, CONFIG.getColor('--chart-line-color-end'));

      this.ctx.beginPath();
      this.ctx.arc(
        centerX,
        centerY,
        CONFIG.CHART_POINT_RADIUS,
        0,
        Math.PI * 2
      );
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
    });
  }

  /**
   * 축과 라벨 그리기
   */
  drawAxes(classes, toX, toY, maxY, xScale) {
    this.ctx.fillStyle = CONFIG.getColor('--color-text');
    this.ctx.font = 'bold 14px sans-serif';

    // Y축 라벨
    this.ctx.textAlign = 'right';
    for (let i = 0; i <= CONFIG.CHART_GRID_DIVISIONS; i++) {
      const value = Utils.formatNumber(maxY * i / CONFIG.CHART_GRID_DIVISIONS);
      this.ctx.fillText(
        value,
        this.padding - 10,
        toY(maxY * i / CONFIG.CHART_GRID_DIVISIONS) + CONFIG.CHART_LABEL_OFFSET
      );
    }

    // X축 라벨 (계급 경계값)
    this.ctx.textAlign = 'center';
    this.ctx.font = '11px sans-serif';

    // 각 막대의 시작 위치에 경계값 표시
    classes.forEach((c, i) => {
      this.ctx.fillText(
        c.min,
        toX(i),
        this.canvas.height - this.padding + 20
      );
    });

    // 마지막 막대의 끝 값도 표시
    if (classes.length > 0) {
      this.ctx.fillText(
        classes[classes.length - 1].max,
        toX(classes.length),
        this.canvas.height - this.padding + 20
      );
    }

    // 축 제목
    this.ctx.font = 'bold 14px sans-serif';
    this.ctx.fillText('계급', this.canvas.width / 2, this.canvas.height - 10);

    // Y축 제목 (회전)
    this.ctx.save();
    this.ctx.translate(15, this.canvas.height / 2);
    this.ctx.rotate(-Math.PI / 2);
    this.ctx.fillText('상대도수', 0, 0);
    this.ctx.restore();
  }

  /**
   * 범례 그리기
   */
  drawLegend() {
    const legendX = this.canvas.width - 180;
    this.ctx.textAlign = 'left';
    this.ctx.font = '12px sans-serif';

    // 히스토그램 범례 (그라디언트)
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

    // 상대도수 다각형 범례 (주황색 계열)
    this.ctx.strokeStyle = '#FC9A63'; // 그라디언트 중간색
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(legendX, 50);
    this.ctx.lineTo(legendX + 20, 50);
    this.ctx.stroke();

    // 포인트에 그라디언트 적용
    const pointGradient = this.ctx.createRadialGradient(legendX + 10, 50, 0, legendX + 10, 50, 4);
    pointGradient.addColorStop(0, CONFIG.getColor('--chart-line-color-start'));
    pointGradient.addColorStop(1, CONFIG.getColor('--chart-line-color-end'));
    this.ctx.fillStyle = pointGradient;
    this.ctx.beginPath();
    this.ctx.arc(legendX + 10, 50, 4, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = CONFIG.getColor('--color-text');
    this.ctx.fillText('상대도수 다각형', legendX + 25, 54);
  }
}

export default ChartRenderer;

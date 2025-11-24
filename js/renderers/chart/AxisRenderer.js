/**
 * 축 렌더러
 * X축, Y축, 그리드, 범례 렌더링 로직
 */

import CONFIG from '../../config.js';
import Utils from '../../utils/utils.js';
import CoordinateSystem from './CoordinateSystem.js';

class AxisRenderer {
  /**
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {HTMLCanvasElement} canvas - Canvas 요소
   * @param {number} padding - 패딩
   */
  constructor(ctx, canvas, padding) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.padding = padding;
  }

  /**
   * 축과 라벨 그리기
   * @param {Array} classes - 계급 배열
   * @param {Object} coords - 좌표 시스템 객체
   * @param {number} maxY - Y축 최댓값
   * @param {Object} axisLabels - 축 라벨
   * @param {Object} ellipsisInfo - 중략 정보
   * @param {string} dataType - 데이터 타입 ('relativeFrequency', 'frequency', 등)
   * @param {number} gridDivisions - 그리드 분할 수
   */
  drawAxes(classes, coords, maxY, axisLabels, ellipsisInfo, dataType = 'relativeFrequency', gridDivisions = CONFIG.CHART_GRID_DIVISIONS) {
    const { toX, toY, xScale } = coords;
    const xLabel = axisLabels?.xAxis || CONFIG.DEFAULT_LABELS.xAxis;

    // Y축 라벨: 사용자 설정 > 데이터 타입별 기본값 > 전역 기본값
    const dataTypeInfo = CONFIG.CHART_DATA_TYPES.find(t => t.id === dataType);
    const yLabel = axisLabels?.yAxis || dataTypeInfo?.yAxisLabel || CONFIG.DEFAULT_LABELS.yAxis;

    this.ctx.fillStyle = CONFIG.getColor('--color-text');
    this.ctx.font = CONFIG.CHART_FONT_BOLD;

    // Y축 라벨
    this.drawYAxisLabels(toY, maxY, dataType, gridDivisions);

    // X축 라벨
    this.drawXAxisLabels(classes, toX, xScale, toY, ellipsisInfo);

    // 축 제목
    this.drawAxisTitles(xLabel, yLabel);
  }

  /**
   * Y축 라벨 그리기
   * @param {Function} toY - Y 좌표 변환 함수
   * @param {number} maxY - Y축 최댓값
   * @param {string} dataType - 데이터 타입 ('relativeFrequency', 'frequency', 등)
   * @param {number} gridDivisions - 그리드 분할 수
   */
  drawYAxisLabels(toY, maxY, dataType = 'relativeFrequency', gridDivisions = CONFIG.CHART_GRID_DIVISIONS) {
    this.ctx.textAlign = 'right';
    for (let i = 0; i <= gridDivisions; i++) {
      const value = maxY * i / gridDivisions;

      // 데이터 타입에 따라 포맷팅
      let formattedValue;
      if (dataType === 'frequency') {
        // 도수 모드: 정수
        formattedValue = Math.round(value).toString();
      } else {
        // 상대도수 모드: 백분율 (% 기호는 Y축 제목에 표시)
        const percentage = value * 100;
        const formatted = Utils.formatNumber(percentage);
        // .00 제거 (예: 20.00 → 20)
        formattedValue = formatted.replace(/\.00$/, '');
      }

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
    if (!CONFIG.AXIS_SHOW_X_LABELS) return;

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

  /**
   * 배경 격자선 그리기
   * @param {Function} toX - X 좌표 변환 함수
   * @param {Function} toY - Y 좌표 변환 함수
   * @param {number} maxY - Y축 최댓값
   * @param {number} classCount - 계급 개수
   * @param {Object} ellipsisInfo - 중략 정보
   * @param {number} gridDivisions - 그리드 분할 수
   */
  drawGrid(toX, toY, maxY, classCount, ellipsisInfo, gridDivisions = CONFIG.CHART_GRID_DIVISIONS) {
    this.ctx.strokeStyle = CONFIG.getColor('--color-grid');
    this.ctx.lineWidth = 1;

    // 가로 격자선 (Y축)
    if (CONFIG.GRID_SHOW_HORIZONTAL) {
      // 모든 격자선 그리기
      for (let i = 0; i <= gridDivisions; i++) {
        const y = toY(maxY * i / gridDivisions);
        this.ctx.beginPath();
        this.ctx.moveTo(this.padding, y);
        this.ctx.lineTo(this.canvas.width - this.padding, y);
        this.ctx.stroke();
      }
    } else {
      // 격자선 꺼져 있어도 X축 기준선(Y=0)은 표시
      const y0 = toY(0);
      this.ctx.beginPath();
      this.ctx.moveTo(this.padding, y0);
      this.ctx.lineTo(this.canvas.width - this.padding, y0);
      this.ctx.stroke();
    }

    // 세로 격자선 (X축) - 막대 너비와 동일한 간격
    if (CONFIG.GRID_SHOW_VERTICAL) {
      // 모든 격자선 그리기
      for (let i = 0; i <= classCount; i++) {
        if (CoordinateSystem.shouldSkipEllipsis(i, ellipsisInfo)) continue;

        const x = toX(i);
        this.ctx.beginPath();
        this.ctx.moveTo(x, this.padding);
        this.ctx.lineTo(x, this.canvas.height - this.padding);
        this.ctx.stroke();
      }
    } else {
      // 격자선 꺼져 있어도 Y축 기준선(X=0)은 표시
      const x0 = toX(0);
      this.ctx.beginPath();
      this.ctx.moveTo(x0, this.padding);
      this.ctx.lineTo(x0, this.canvas.height - this.padding);
      this.ctx.stroke();
    }
  }

  /**
   * 범례 그리기
   * @param {string} dataType - 데이터 타입 ('relativeFrequency', 'frequency', 등)
   */
  drawLegend(dataType = 'relativeFrequency') {
    // 데이터 타입 정보 가져오기
    const dataTypeInfo = CONFIG.CHART_DATA_TYPES.find(t => t.id === dataType);
    const legendSuffix = dataTypeInfo?.legendSuffix || '상대도수';

    const legendX = this.canvas.width - CONFIG.CHART_LEGEND_X_OFFSET;
    this.ctx.textAlign = 'left';
    this.ctx.font = CONFIG.CHART_FONT_REGULAR;

    // 히스토그램 범례
    const y1 = CONFIG.CHART_LEGEND_Y_START;
    const barGradient = this.ctx.createLinearGradient(
      legendX,
      y1,
      legendX,
      y1 + CONFIG.CHART_LEGEND_BAR_HEIGHT
    );
    barGradient.addColorStop(0, CONFIG.getColor('--chart-bar-color'));
    barGradient.addColorStop(1, CONFIG.getColor('--chart-bar-color-end'));

    this.ctx.fillStyle = barGradient;
    this.ctx.fillRect(legendX, y1, CONFIG.CHART_LEGEND_ITEM_WIDTH, CONFIG.CHART_LEGEND_BAR_HEIGHT);
    this.ctx.strokeStyle = CONFIG.getColor('--color-border');
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(legendX, y1, CONFIG.CHART_LEGEND_ITEM_WIDTH, CONFIG.CHART_LEGEND_BAR_HEIGHT);
    this.ctx.fillStyle = CONFIG.getColor('--color-text');
    this.ctx.fillText('히스토그램', legendX + CONFIG.CHART_LEGEND_TEXT_X_OFFSET, y1 + CONFIG.CHART_LEGEND_TEXT_Y_OFFSET);

    // 다각형 범례 (동적 텍스트)
    const y2 = y1 + CONFIG.CHART_LEGEND_ITEM_SPACING;

    // 선 (그라디언트)
    const lineGradient = Utils.createLineGradient(
      this.ctx, legendX, y2, legendX + CONFIG.CHART_LEGEND_ITEM_WIDTH, y2,
      CONFIG.getColor('--chart-polygon-line-start'),
      CONFIG.getColor('--chart-polygon-line-end')
    );
    this.ctx.strokeStyle = lineGradient;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(legendX, y2);
    this.ctx.lineTo(legendX + CONFIG.CHART_LEGEND_ITEM_WIDTH, y2);
    this.ctx.stroke();

    // 점 (단색)
    this.ctx.fillStyle = CONFIG.getColor('--chart-polygon-point-color');
    this.ctx.beginPath();
    this.ctx.arc(legendX + CONFIG.CHART_LEGEND_POINT_CENTER_X, y2, CONFIG.CHART_LEGEND_POINT_RADIUS, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = CONFIG.getColor('--color-text');
    this.ctx.fillText(`${legendSuffix} 다각형`, legendX + CONFIG.CHART_LEGEND_TEXT_X_OFFSET, y2 + CONFIG.CHART_LEGEND_TEXT_Y_OFFSET - 8);
  }

  /**
   * Y축 값 라벨 그리기 (파선 끝점)
   * @param {Array} values - 값 배열
   * @param {Object} coords - 좌표 시스템
   * @param {Object} ellipsisInfo - 중략 정보
   * @param {string} dataType - 데이터 타입
   */
  drawYValueLabels(values, coords, ellipsisInfo, dataType = 'relativeFrequency') {
    if (!CONFIG.AXIS_SHOW_Y_LABELS) return;

    const { toX, toY } = coords;
    const leftEdgeX = toX(0); // Y축 위치

    this.ctx.save();
    this.ctx.fillStyle = CONFIG.getColor('--chart-polygon-point-color');
    this.ctx.font = CONFIG.CHART_FONT_SMALL;
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'middle';

    values.forEach((value, index) => {
      if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;

      const y = toY(value);

      // 값 포맷팅
      let labelText;
      if (dataType === 'frequency') {
        labelText = Math.round(value).toString();
      } else {
        const percentage = value * 100;
        labelText = Utils.formatNumber(percentage).replace(/\.00$/, '');
      }

      // Y축 왼쪽에 라벨 표시
      this.ctx.fillText(labelText, leftEdgeX - 5, y);
    });

    this.ctx.restore();
  }

  /**
   * 데이터 없음 메시지
   */
  drawNoDataMessage() {
    this.ctx.fillStyle = CONFIG.getColor('--color-text');
    this.ctx.font = CONFIG.CHART_FONT_BOLD;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      '데이터가 없습니다.',
      this.canvas.width / 2,
      this.canvas.height / 2
    );
  }
}

export default AxisRenderer;

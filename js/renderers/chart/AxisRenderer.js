/**
 * 축 렌더러
 * X축, Y축, 그리드, 범례 렌더링 로직
 */

import CONFIG from '../../config.js';
import Utils from '../../utils/utils.js';
import CoordinateSystem from './CoordinateSystem.js';
import * as KatexUtils from '../../utils/katex.js';

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

    // Y축 라벨 (마지막 라벨은 yLabel로 대체)
    this.drawYAxisLabels(toY, maxY, dataType, gridDivisions, yLabel);

    // X축 라벨 (마지막 라벨은 xLabel로 대체)
    this.drawXAxisLabels(classes, toX, xScale, toY, ellipsisInfo, xLabel);
  }

  /**
   * Y축 라벨 그리기
   * @param {Function} toY - Y 좌표 변환 함수
   * @param {number} maxY - Y축 최댓값
   * @param {string} dataType - 데이터 타입 ('relativeFrequency', 'frequency', 등)
   * @param {number} gridDivisions - 그리드 분할 수
   * @param {string} yLabel - Y축 제목 (마지막 라벨 대체용)
   */
  drawYAxisLabels(toY, maxY, dataType = 'relativeFrequency', gridDivisions = CONFIG.CHART_GRID_DIVISIONS, yLabel = '') {
    if (!CONFIG.AXIS_SHOW_Y_LABELS) return;

    const color = CONFIG.getColor('--color-text');

    for (let i = 0; i <= gridDivisions; i++) {
      const value = maxY * i / gridDivisions;

      // 마지막 라벨은 축 제목으로 대체 (4글자 초과 시 폰트 축소)
      if (i === gridDivisions && yLabel) {
        const baseFontSize = yLabel.length > 4 ? 11 : 14;
        KatexUtils.renderMixedText(this.ctx, yLabel,
          this.padding - CONFIG.CHART_Y_LABEL_OFFSET,
          toY(value) + CONFIG.CHART_LABEL_OFFSET,
          { fontSize: CONFIG.getScaledFontSize(baseFontSize), color, align: 'right', baseline: 'middle' }
        );
        continue;
      }

      // 데이터 타입에 따라 포맷팅
      let formattedValue;
      if (dataType === 'frequency') {
        formattedValue = Math.round(value).toString();
      } else {
        // 상대도수: decimal (0.03) 또는 percent (3%)
        if (CONFIG.AXIS_Y_LABEL_FORMAT === 'percent') {
          const percentage = value * 100;
          formattedValue = value === 0 ? '0' : Utils.formatNumberClean(percentage) + '%';
        } else {
          formattedValue = Utils.formatNumberClean(value);
        }
      }

      // KaTeX 폰트로 렌더링
      KatexUtils.render(this.ctx, formattedValue,
        this.padding - CONFIG.CHART_Y_LABEL_OFFSET,
        toY(value) + CONFIG.CHART_LABEL_OFFSET,
        { fontSize: CONFIG.getScaledFontSize(18), color: color, align: 'right', baseline: 'middle' }
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
   * @param {string} xLabel - X축 제목 (마지막 라벨 대체용)
   */
  drawXAxisLabels(classes, toX, xScale, toY, ellipsisInfo, xLabel = '') {
    if (!CONFIG.AXIS_SHOW_X_LABELS) return;

    const color = CONFIG.getColor('--color-text');
    const labelY = this.canvas.height - this.padding + CONFIG.CHART_X_LABEL_Y_OFFSET;

    if (ellipsisInfo && ellipsisInfo.show) {
      const firstDataIdx = ellipsisInfo.firstDataIndex;

      // X축 0은 Y축 0과 중복되므로 렌더링하지 않음

      // 중략 기호 (이중 물결, X축 위에 세로로)
      const ellipsisX = toX(0) + (toX(1) - toX(0)) * CONFIG.ELLIPSIS_POSITION_RATIO;
      const ellipsisY = toY(0);

      this.ctx.save();
      this.ctx.translate(ellipsisX, ellipsisY);
      this.ctx.rotate(Math.PI / 2);
      this.ctx.font = CONFIG.CHART_FONT_LARGE;
      this.ctx.fillStyle = CONFIG.getColor('--color-ellipsis');
      this.ctx.textBaseline = 'bottom';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(CONFIG.AXIS_ELLIPSIS_SYMBOL, 0, 0);
      this.ctx.restore();

      // 데이터 구간 라벨 (KaTeX 폰트)
      for (let i = firstDataIdx; i < classes.length; i++) {
        KatexUtils.render(this.ctx, String(classes[i].min), toX(i), labelY,
          { fontSize: CONFIG.getScaledFontSize(18), color: color, align: 'center', baseline: 'middle' }
        );
      }

      // 마지막 라벨: 축 제목으로 대체
      KatexUtils.renderMixedText(this.ctx, xLabel || String(classes[classes.length - 1].max),
        toX(classes.length - 1) + xScale, labelY,
        { fontSize: CONFIG.getScaledFontSize(14), color, align: 'center', baseline: 'middle' }
      );
    } else {
      // 중략 없이 전체 표시 (KaTeX 폰트)
      // 첫 번째 라벨(0)은 Y축과 중복되므로 건너뛰기
      classes.forEach((c, i) => {
        if (i === 0 && c.min === 0) return; // 0은 Y축에서 이미 표시됨
        KatexUtils.render(this.ctx, String(c.min), toX(i), labelY,
          { fontSize: CONFIG.getScaledFontSize(18), color: color, align: 'center', baseline: 'middle' }
        );
      });

      // 마지막 라벨: 축 제목으로 대체
      if (classes.length > 0) {
        KatexUtils.renderMixedText(this.ctx, xLabel || String(classes[classes.length - 1].max),
          toX(classes.length), labelY,
          { fontSize: CONFIG.getScaledFontSize(14), color, align: 'center', baseline: 'middle' }
        );
      }
    }
  }

  /**
   * 축 제목 그리기 (축 끝 라벨링)
   * @param {string} xLabel - X축 제목
   * @param {string} yLabel - Y축 제목
   */
  drawAxisTitles(xLabel, yLabel) {
    this.ctx.font = CONFIG.CHART_FONT_REGULAR;
    this.ctx.fillStyle = CONFIG.getColor('--color-text');

    // X축 제목: 오른쪽 끝
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(xLabel, this.canvas.width - this.padding, this.canvas.height - this.padding + 5);

    // Y축 제목: 위쪽 끝 (가로)
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'bottom';
    this.ctx.fillText(yLabel, this.padding, this.padding - 5);
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
    this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_THIN;
    this.ctx.globalAlpha = 1.0; // 투명도 제거

    // 가로 격자선 (Y축) - Y=0 제외
    if (CONFIG.GRID_SHOW_HORIZONTAL) {
      this.ctx.strokeStyle = CONFIG.getColor('--color-grid-horizontal');
      for (let i = 0; i <= gridDivisions; i++) {
        const value = maxY * i / gridDivisions;
        if (value === 0) continue; // Y=0 (X축 기준선) 건너뛰기

        const y = toY(value);
        this.ctx.beginPath();
        this.ctx.moveTo(this.padding, y);
        this.ctx.lineTo(this.canvas.width - this.padding, y);
        this.ctx.stroke();
      }
    }

    // 세로 격자선 (X축) - X=0 제외
    if (CONFIG.GRID_SHOW_VERTICAL) {
      this.ctx.strokeStyle = CONFIG.getColor('--color-grid-vertical');
      for (let i = 0; i <= classCount; i++) {
        if (i === 0) continue; // X=0 (Y축 기준선) 건너뛰기
        if (CoordinateSystem.shouldSkipEllipsis(i, ellipsisInfo)) continue;

        const x = toX(i);
        this.ctx.beginPath();
        this.ctx.moveTo(x, this.padding);
        this.ctx.lineTo(x, this.canvas.height - this.padding);
        this.ctx.stroke();
      }
    }

    // 기준선 (X축, Y축)을 별도로 그려서 #888888 색상 적용
    this.ctx.strokeStyle = CONFIG.getColor('--color-axis');

    // X축 기준선 (Y=0)
    const y0 = toY(0);
    this.ctx.beginPath();
    this.ctx.moveTo(this.padding, y0);
    this.ctx.lineTo(this.canvas.width - this.padding, y0);
    this.ctx.stroke();

    // Y축 기준선 (X=0)
    const x0 = toX(0);
    this.ctx.beginPath();
    this.ctx.moveTo(x0, this.padding);
    this.ctx.lineTo(x0, this.canvas.height - this.padding);
    this.ctx.stroke();
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

    // 히스토그램 프리셋 색상 가져오기
    const histPreset = CONFIG.HISTOGRAM_COLOR_PRESETS[CONFIG.HISTOGRAM_COLOR_PRESET]
                    || CONFIG.HISTOGRAM_COLOR_PRESETS.default;

    const barGradient = this.ctx.createLinearGradient(
      legendX,
      y1,
      legendX,
      y1 + CONFIG.CHART_LEGEND_BAR_HEIGHT
    );
    barGradient.addColorStop(0, histPreset.fillStart);
    barGradient.addColorStop(1, histPreset.fillEnd);

    this.ctx.globalAlpha = histPreset.alpha;
    this.ctx.fillStyle = barGradient;
    this.ctx.fillRect(legendX, y1, CONFIG.CHART_LEGEND_ITEM_WIDTH, CONFIG.CHART_LEGEND_BAR_HEIGHT);
    this.ctx.globalAlpha = CONFIG.CHART_DEFAULT_ALPHA;

    // 테두리 (프리셋 색상 사용)
    const strokeGradient = this.ctx.createLinearGradient(
      legendX,
      y1,
      legendX,
      y1 + CONFIG.CHART_LEGEND_BAR_HEIGHT
    );
    strokeGradient.addColorStop(0, histPreset.strokeStart);
    strokeGradient.addColorStop(1, histPreset.strokeEnd);
    this.ctx.strokeStyle = strokeGradient;
    this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_THIN;
    this.ctx.strokeRect(legendX, y1, CONFIG.CHART_LEGEND_ITEM_WIDTH, CONFIG.CHART_LEGEND_BAR_HEIGHT);

    this.ctx.fillStyle = CONFIG.getColor('--color-text');
    this.ctx.fillText(CONFIG.LEGEND_LABEL_HISTOGRAM, legendX + CONFIG.CHART_LEGEND_TEXT_X_OFFSET, y1 + CONFIG.CHART_LEGEND_TEXT_Y_OFFSET);

    // 다각형 범례 (동적 텍스트)
    const y2 = y1 + CONFIG.CHART_LEGEND_ITEM_SPACING;

    // 현재 프리셋의 색상 가져오기
    const preset = CONFIG.POLYGON_COLOR_PRESETS[CONFIG.POLYGON_COLOR_PRESET];
    const pointColor = preset?.pointColor || CONFIG.POLYGON_COLOR_PRESETS.default.pointColor;
    const gradientStart = preset?.gradientStart || CONFIG.POLYGON_COLOR_PRESETS.default.gradientStart;
    const gradientEnd = preset?.gradientEnd || CONFIG.POLYGON_COLOR_PRESETS.default.gradientEnd;

    // 선 (그라디언트)
    const lineGradient = Utils.createLineGradient(
      this.ctx, legendX, y2, legendX + CONFIG.CHART_LEGEND_ITEM_WIDTH, y2,
      gradientStart,
      gradientEnd
    );
    this.ctx.strokeStyle = lineGradient;
    this.ctx.lineWidth = CONFIG.CHART_LINE_WIDTH_THICK;
    this.ctx.beginPath();
    this.ctx.moveTo(legendX, y2);
    this.ctx.lineTo(legendX + CONFIG.CHART_LEGEND_ITEM_WIDTH, y2);
    this.ctx.stroke();

    // 점 (단색)
    this.ctx.fillStyle = pointColor;
    this.ctx.beginPath();
    this.ctx.arc(legendX + CONFIG.CHART_LEGEND_POINT_CENTER_X, y2, CONFIG.CHART_LEGEND_POINT_RADIUS, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = CONFIG.getColor('--color-text');
    this.ctx.fillText(`${legendSuffix} 다각형`, legendX + CONFIG.CHART_LEGEND_TEXT_X_OFFSET, y2 + CONFIG.CHART_LEGEND_TEXT_Y_OFFSET - 8);
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

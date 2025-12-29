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
    const color = CONFIG.getColor('--color-text');
    const useEnglishFont = CONFIG.CHART_ENGLISH_FONT;

    for (let i = 0; i <= gridDivisions; i++) {
      const value = maxY * i / gridDivisions;

      // 원점 표시 여부 체크
      const isOrigin = (i === 0);
      if (isOrigin && !CONFIG.AXIS_SHOW_ORIGIN_LABEL) continue;

      // 숫자 라벨 표시 여부 (원점 제외)
      if (!CONFIG.AXIS_SHOW_Y_LABELS && !isOrigin) continue;

      // 마지막 라벨은 축 제목으로 대체 (showAxisLabels가 true일 때만)
      if (i === gridDivisions && yLabel && CONFIG.AXIS_SHOW_AXIS_LABELS) {
        const baseFontSize = 22;
        const yLabelsHidden = !CONFIG.AXIS_SHOW_Y_LABELS;

        if (yLabelsHidden) {
          // 숨김 시: Y축 왼쪽 중앙에 표시
          const centerY = (this.padding + (this.ctx.canvas.height - this.padding)) / 2;
          KatexUtils.renderMixedText(this.ctx, yLabel,
            this.padding - CONFIG.getScaledValue(10),
            centerY,
            { fontSize: CONFIG.getScaledFontSize(baseFontSize), color, align: 'right', baseline: 'middle', useEnglishFont }
          );
        } else if (yLabel.length >= 4) {
          // 4글자 이상: Y축 상단 위에 가로로 표시
          KatexUtils.renderMixedText(this.ctx, yLabel,
            this.padding,
            toY(value) - CONFIG.getScaledValue(10),
            { fontSize: CONFIG.getScaledFontSize(18), color, align: 'left', baseline: 'bottom', useEnglishFont }
          );
          // 최댓값 숫자도 표시
          let formattedMax;
          if (dataType === 'frequency') {
            formattedMax = Math.round(value).toString();
          } else {
            if (CONFIG.AXIS_Y_LABEL_FORMAT === 'percent') {
              formattedMax = Utils.formatNumberClean(value * 100) + '%';
            } else {
              formattedMax = Utils.formatNumberClean(value);
            }
          }
          KatexUtils.render(this.ctx, formattedMax,
            this.padding - CONFIG.getScaledValue(CONFIG.CHART_Y_LABEL_OFFSET),
            toY(value) + CONFIG.getScaledValue(CONFIG.CHART_LABEL_OFFSET),
            { fontSize: CONFIG.getScaledFontSize(baseFontSize), color, align: 'right', baseline: 'middle' }
          );
        } else {
          // 3글자 이하: 기존 위치 (Y축 왼쪽, 숫자 대신 제목)
          KatexUtils.renderMixedText(this.ctx, yLabel,
            this.padding - CONFIG.getScaledValue(CONFIG.CHART_Y_LABEL_OFFSET),
            toY(value) + CONFIG.getScaledValue(CONFIG.CHART_LABEL_OFFSET),
            { fontSize: CONFIG.getScaledFontSize(baseFontSize), color, align: 'right', baseline: 'middle', useEnglishFont }
          );
        }
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
        this.padding - CONFIG.getScaledValue(CONFIG.CHART_Y_LABEL_OFFSET),
        toY(value) + CONFIG.getScaledValue(CONFIG.CHART_LABEL_OFFSET),
        { fontSize: CONFIG.getScaledFontSize(22), color: color, align: 'right', baseline: 'middle' }
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
    const color = CONFIG.getColor('--color-text');
    const labelY = this.canvas.height - this.padding + CONFIG.getScaledValue(CONFIG.CHART_X_LABEL_Y_OFFSET);

    // X축 라벨 포맷: 'boundary' (경계값) 또는 'range' (범위)
    const isRangeFormat = CONFIG.AXIS_X_LABEL_FORMAT === 'range';

    if (isRangeFormat) {
      // 범위 형식: 막대 중앙에 "min-max" 형태로 표시
      this.drawXAxisRangeLabels(classes, toX, xScale, toY, ellipsisInfo, xLabel, labelY, color);
    } else {
      // 경계값 형식: 기존 로직
      this.drawXAxisBoundaryLabels(classes, toX, xScale, toY, ellipsisInfo, xLabel, labelY, color);
    }
  }

  /**
   * X축 범위 라벨 그리기 (막대 중앙에 "min-max" 형태)
   * @param {Array} classes - 계급 배열
   * @param {Function} toX - X 좌표 변환 함수
   * @param {number} xScale - X축 스케일
   * @param {Function} toY - Y 좌표 변환 함수
   * @param {Object} ellipsisInfo - 중략 정보
   * @param {string} xLabel - X축 제목
   * @param {number} labelY - 라벨 Y 좌표
   * @param {string} color - 텍스트 색상
   */
  drawXAxisRangeLabels(classes, toX, xScale, toY, ellipsisInfo, xLabel, labelY, color) {
    const useEnglishFont = CONFIG.CHART_ENGLISH_FONT;

    if (!CONFIG.AXIS_SHOW_X_LABELS) {
      // 라벨 숨김 시 축 제목만 표시 (위치 조정: 축선에 가깝게)
      if (CONFIG.AXIS_SHOW_AXIS_LABELS && xLabel && classes.length > 0) {
        const lastBarCenterX = toX(classes.length - 1) + xScale / 2;
        const titleLabelY = this.canvas.height - this.padding + CONFIG.getScaledValue(10);
        KatexUtils.renderMixedText(this.ctx, xLabel,
          lastBarCenterX + xScale, titleLabelY,
          { fontSize: CONFIG.getScaledFontSize(22), color, align: 'center', baseline: 'middle', useEnglishFont }
        );
      }
      return;
    }

    // 중략 처리
    const firstDataIdx = (ellipsisInfo && ellipsisInfo.show) ? ellipsisInfo.firstDataIndex : 0;

    // 중략 기호 (showCurve가 false일 때만)
    if (ellipsisInfo && ellipsisInfo.show && !CONFIG.SHOW_CURVE) {
      const ellipsisX = toX(0) + xScale * 0.08;
      const ellipsisY = toY(0);

      this.ctx.save();
      this.ctx.translate(ellipsisX, ellipsisY);
      this.ctx.rotate(Math.PI / 2);
      const scaledFontSize = CONFIG.getScaledFontSize(22);
      this.ctx.font = `300 ${scaledFontSize}px 'SCDream', sans-serif`;
      this.ctx.fillStyle = CONFIG.getColor('--color-ellipsis');
      this.ctx.textBaseline = 'bottom';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(CONFIG.AXIS_ELLIPSIS_SYMBOL, 0, 0);
      this.ctx.restore();
    }

    // 각 막대 중앙에 범위 라벨 표시
    for (let i = firstDataIdx; i < classes.length; i++) {
      const c = classes[i];
      // 범위 라벨: "min-max" (max - 1을 사용하여 겹치지 않게)
      // 예: 0~5 계급이면 "0-4", 5~10이면 "5-9"
      const rangeLabel = `${c.min}-${c.max - 1}`;
      const barCenterX = toX(i) + xScale / 2;

      KatexUtils.render(this.ctx, rangeLabel, barCenterX, labelY,
        { fontSize: CONFIG.getScaledFontSize(22), color, align: 'center', baseline: 'middle' }
      );
    }

    // 축 제목 (마지막 막대 오른쪽)
    if (CONFIG.AXIS_SHOW_AXIS_LABELS && xLabel && classes.length > 0) {
      const lastBarCenterX = toX(classes.length - 1) + xScale / 2;
      KatexUtils.renderMixedText(this.ctx, xLabel,
        lastBarCenterX + xScale, labelY,
        { fontSize: CONFIG.getScaledFontSize(22), color, align: 'center', baseline: 'middle', useEnglishFont }
      );
    }
  }

  /**
   * X축 경계값 라벨 그리기 (기존 로직)
   * @param {Array} classes - 계급 배열
   * @param {Function} toX - X 좌표 변환 함수
   * @param {number} xScale - X축 스케일
   * @param {Function} toY - Y 좌표 변환 함수
   * @param {Object} ellipsisInfo - 중략 정보
   * @param {string} xLabel - X축 제목
   * @param {number} labelY - 라벨 Y 좌표
   * @param {string} color - 텍스트 색상
   */
  drawXAxisBoundaryLabels(classes, toX, xScale, toY, ellipsisInfo, xLabel, labelY, color) {
    const useEnglishFont = CONFIG.CHART_ENGLISH_FONT;

    if (ellipsisInfo && ellipsisInfo.show) {
      const firstDataIdx = ellipsisInfo.firstDataIndex;

      // X축 0은 Y축 0과 중복되므로 렌더링하지 않음

      // 중략 기호 (이중 물결, X축 위에 세로로) - showCurve가 false일 때만 표시
      // 배치 순서: 0 - (중략) - (점) - 첫 데이터 라벨
      if (!CONFIG.SHOW_CURVE) {
        const ellipsisX = toX(0) + xScale * 0.08;
        const ellipsisY = toY(0);

        this.ctx.save();
        this.ctx.translate(ellipsisX, ellipsisY);
        this.ctx.rotate(Math.PI / 2);
        // 캔버스 크기에 따라 스케일링되는 폰트 사용
        const scaledFontSize = CONFIG.getScaledFontSize(22);
        this.ctx.font = `300 ${scaledFontSize}px 'SCDream', sans-serif`;
        this.ctx.fillStyle = CONFIG.getColor('--color-ellipsis');
        this.ctx.textBaseline = 'bottom';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(CONFIG.AXIS_ELLIPSIS_SYMBOL, 0, 0);
        this.ctx.restore();
      }

      // 데이터 구간 라벨 (AXIS_SHOW_X_LABELS에 따라)
      if (CONFIG.AXIS_SHOW_X_LABELS) {
        for (let i = firstDataIdx; i < classes.length; i++) {
          KatexUtils.render(this.ctx, String(classes[i].min), toX(i), labelY,
            { fontSize: CONFIG.getScaledFontSize(22), color: color, align: 'center', baseline: 'middle' }
          );
        }
      }

      // 마지막 라벨(축제목): englishFont 여부에 따라 동작 변경
      if (CONFIG.AXIS_SHOW_AXIS_LABELS && xLabel) {
        const xLabelsHidden = !CONFIG.AXIS_SHOW_X_LABELS;

        if (useEnglishFont) {
          // englishFont: true → 최댓값 라벨 표시 + 축 제목은 한 칸 아래 오른쪽 정렬
          if (CONFIG.AXIS_SHOW_X_LABELS) {
            KatexUtils.render(this.ctx, String(classes[classes.length - 1].max),
              toX(classes.length - 1) + xScale, labelY,
              { fontSize: CONFIG.getScaledFontSize(22), color, align: 'center', baseline: 'middle' }
            );
          }
          // 축 제목: 한 칸 아래 + 오른쪽 정렬
          const titleLabelY = labelY + CONFIG.getScaledValue(20);
          KatexUtils.renderMixedText(this.ctx, xLabel,
            this.canvas.width - this.padding, titleLabelY,
            { fontSize: CONFIG.getScaledFontSize(22), color, align: 'right', baseline: 'middle', useEnglishFont }
          );
        } else {
          // englishFont: false → 기존 동작 (최댓값을 축 제목으로 대체)
          const titleLabelY = xLabelsHidden
            ? this.canvas.height - this.padding + CONFIG.getScaledValue(10)
            : labelY;
          KatexUtils.renderMixedText(this.ctx, xLabel,
            toX(classes.length - 1) + xScale, titleLabelY,
            { fontSize: CONFIG.getScaledFontSize(22), color, align: 'center', baseline: 'middle', useEnglishFont }
          );
        }
      } else if (CONFIG.AXIS_SHOW_X_LABELS) {
        KatexUtils.render(this.ctx, String(classes[classes.length - 1].max),
          toX(classes.length - 1) + xScale, labelY,
          { fontSize: CONFIG.getScaledFontSize(22), color, align: 'center', baseline: 'middle' }
        );
      }
    } else {
      // 중략 없이 전체 표시 (KaTeX 폰트)
      if (CONFIG.AXIS_SHOW_X_LABELS) {
        // 첫 번째 라벨(0)은 Y축과 중복되므로 건너뛰기
        classes.forEach((c, i) => {
          if (i === 0 && c.min === 0) return; // 0은 Y축에서 이미 표시됨
          KatexUtils.render(this.ctx, String(c.min), toX(i), labelY,
            { fontSize: CONFIG.getScaledFontSize(22), color: color, align: 'center', baseline: 'middle' }
          );
        });
      }

      // 마지막 라벨(축제목): englishFont 여부에 따라 동작 변경
      if (classes.length > 0) {
        if (CONFIG.AXIS_SHOW_AXIS_LABELS && xLabel) {
          const xLabelsHidden = !CONFIG.AXIS_SHOW_X_LABELS;

          if (useEnglishFont) {
            // englishFont: true → 최댓값 라벨 표시 + 축 제목은 한 칸 아래 오른쪽 정렬
            if (CONFIG.AXIS_SHOW_X_LABELS) {
              KatexUtils.render(this.ctx, String(classes[classes.length - 1].max),
                toX(classes.length), labelY,
                { fontSize: CONFIG.getScaledFontSize(22), color, align: 'center', baseline: 'middle' }
              );
            }
            // 축 제목: 한 칸 아래 + 오른쪽 정렬
            const titleLabelY = labelY + CONFIG.getScaledValue(20);
            KatexUtils.renderMixedText(this.ctx, xLabel,
              this.canvas.width - this.padding, titleLabelY,
              { fontSize: CONFIG.getScaledFontSize(22), color, align: 'right', baseline: 'middle', useEnglishFont }
            );
          } else {
            // englishFont: false → 기존 동작 (최댓값을 축 제목으로 대체)
            const titleLabelY = xLabelsHidden
              ? this.canvas.height - this.padding + CONFIG.getScaledValue(10)
              : labelY;
            KatexUtils.renderMixedText(this.ctx, xLabel,
              toX(classes.length), titleLabelY,
              { fontSize: CONFIG.getScaledFontSize(22), color, align: 'center', baseline: 'middle', useEnglishFont }
            );
          }
        } else if (CONFIG.AXIS_SHOW_X_LABELS) {
          KatexUtils.render(this.ctx, String(classes[classes.length - 1].max),
            toX(classes.length), labelY,
            { fontSize: CONFIG.getScaledFontSize(22), color, align: 'center', baseline: 'middle' }
          );
        }
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
    this.ctx.lineWidth = CONFIG.getScaledLineWidth('thin');
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
    if (CONFIG.AXIS_SHOW_X_AXIS) {
      const y0 = toY(0);
      this.ctx.beginPath();
      this.ctx.moveTo(this.padding, y0);
      this.ctx.lineTo(this.canvas.width - this.padding, y0);
      this.ctx.stroke();
    }

    // Y축 기준선 (X=0)
    if (CONFIG.AXIS_SHOW_Y_AXIS) {
      const x0 = toX(0);
      this.ctx.beginPath();
      this.ctx.moveTo(x0, this.padding);
      this.ctx.lineTo(x0, this.canvas.height - this.padding);
      this.ctx.stroke();
    }
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

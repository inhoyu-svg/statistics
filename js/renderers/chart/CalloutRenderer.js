/**
 * 말풍선 렌더러
 * 다각형 포인트에 정보 표시용 말풍선 렌더링
 */

import CONFIG from '../../config.js';
import Utils from '../../utils/utils.js';
import * as KatexUtils from '../../utils/katex.js';

class CalloutRenderer {
  /**
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   */
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * 말풍선 레이어 렌더링
   * @param {Layer} layer - 말풍선 레이어
   */
  render(layer) {
    const { x, y, text, width, height, opacity, polygonPreset, pointX, pointY } = layer.data;

    if (!text || opacity === 0) return;

    this.ctx.save();
    this.ctx.globalAlpha = opacity || 1.0;

    // 말풍선 도형 그리기
    this._drawCalloutShape(x, y, width, height);

    // 말풍선에서 최고점까지 점선 연결
    this._drawConnectorLine(x, y, width, height, pointX, pointY, polygonPreset);

    // 오른쪽 세로 막대 그리기
    this._drawAccentBar(x, y, width, height, polygonPreset);

    // 텍스트 그리기
    this._drawText(x, y, width, height, text, polygonPreset);

    this.ctx.restore();
  }

  /**
   * 말풍선 도형 그리기 (배경만, 테두리 없음)
   * @param {number} x - 말풍선 왼쪽 상단 x
   * @param {number} y - 말풍선 왼쪽 상단 y
   * @param {number} width - 너비
   * @param {number} height - 높이
   */
  _drawCalloutShape(x, y, width, height) {
    const ctx = this.ctx;

    // 일반 사각형 그리기 (둥글기 없음)
    ctx.fillStyle = CONFIG.getColor('--chart-callout-bg-start');
    ctx.fillRect(x, y, width, height);
  }

  /**
   * 말풍선에서 최고점까지 점선 연결
   * @param {number} x - 말풍선 왼쪽 상단 x
   * @param {number} y - 말풍선 왼쪽 상단 y
   * @param {number} width - 말풍선 너비
   * @param {number} height - 말풍선 높이
   * @param {number} pointX - 최고점 x 좌표
   * @param {number} pointY - 최고점 y 좌표
   * @param {string} polygonPreset - 다각형 색상 프리셋
   */
  _drawConnectorLine(x, y, width, height, pointX, pointY, polygonPreset) {
    const ctx = this.ctx;

    // 시작점: 말풍선 오른쪽 끝 세로 막대의 중앙
    const startX = x + width;
    const startY = y + height / 2;

    // 끝점: 도수 다각형의 최고점
    const endX = pointX;
    const endY = pointY;

    // 프리셋에 따른 선 색상
    const preset = polygonPreset || 'default';
    const lineColor = CONFIG.CALLOUT_ACCENT_COLORS[preset] || CONFIG.CALLOUT_ACCENT_COLORS.default;

    // 점선 스타일 설정
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = CONFIG.getScaledCalloutLineWidth();
    ctx.setLineDash(CONFIG.getScaledCalloutDashPattern());

    // 점선 그리기
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // 점선 스타일 초기화 (다른 렌더링에 영향 없도록)
    ctx.setLineDash([]);
  }

  /**
   * 오른쪽 세로 막대 그리기
   * @param {number} x - 말풍선 왼쪽 상단 x
   * @param {number} y - 말풍선 왼쪽 상단 y
   * @param {number} width - 말풍선 너비
   * @param {number} height - 말풍선 높이
   * @param {string} polygonPreset - 다각형 색상 프리셋
   */
  _drawAccentBar(x, y, width, height, polygonPreset) {
    const ctx = this.ctx;
    const barWidth = CONFIG.getScaledCalloutAccentBarWidth();

    // 프리셋에 따른 색상 가져오기 (기본값: default)
    const preset = polygonPreset || 'default';
    const barColor = CONFIG.CALLOUT_ACCENT_COLORS[preset] || CONFIG.CALLOUT_ACCENT_COLORS.default;

    // 오른쪽 끝에 세로 막대 그리기
    ctx.fillStyle = barColor;
    ctx.fillRect(x + width - barWidth, y, barWidth, height);
  }

  /**
   * 텍스트 렌더링 (줄바꿈 지원)
   * @param {number} x - 말풍선 x
   * @param {number} y - 말풍선 y
   * @param {number} width - 말풍선 너비
   * @param {number} height - 말풍선 높이
   * @param {string} text - 텍스트 (\\n으로 줄바꿈)
   * @param {string} polygonPreset - 다각형 색상 프리셋
   */
  _drawText(x, y, width, height, text, polygonPreset) {
    const lineHeight = CONFIG.getScaledCalloutLineHeight();

    // 프리셋에 따른 텍스트 색상
    const preset = polygonPreset || 'default';
    const textColor = CONFIG.CALLOUT_TEXT_COLORS[preset] || CONFIG.CALLOUT_TEXT_COLORS.default;

    // 줄바꿈 분할
    const lines = text.split('\n');

    // 텍스트 시작 위치 (수직 중앙 정렬)
    const totalTextHeight = lines.length * lineHeight;
    const textY = y + (height - totalTextHeight) / 2;

    lines.forEach((line, i) => {
      const textX = x + width / 2; // 가로 중앙
      const lineY = textY + i * lineHeight;
      // KaTeX 규칙 적용 렌더링 (소문자 이탤릭 등)
      KatexUtils.renderMixedText(this.ctx, line, textX, lineY, {
        fontSize: CONFIG.getScaledFontSize(20),
        color: textColor,
        align: 'center',
        baseline: 'top'
      });
    });
  }

  /**
   * 템플릿 문자열을 실제 데이터로 치환
   * @param {string} template - 템플릿 문자열
   * @param {Object} classData - 계급 데이터
   * @param {string} dataType - 데이터 타입
   * @returns {string} 치환된 텍스트
   */
  static formatTemplate(template, classData, dataType = 'relativeFrequency') {
    if (!template || !classData) return '';

    // 데이터 타입에 따른 값 선택
    let value = classData.relativeFreq;
    let valueSuffix = '%';

    if (dataType === 'frequency') {
      value = classData.frequency;
      valueSuffix = '';
    }

    return template
      .replace(/{min}/g, classData.min)
      .replace(/{max}/g, classData.max)
      .replace(/{midpoint}/g, classData.midpoint)
      .replace(/{frequency}/g, classData.frequency)
      .replace(/{relativeFreq}/g, classData.relativeFreq)
      .replace(/{cumulativeFreq}/g, classData.cumulativeFreq || 0)
      .replace(/{cumulativeRelFreq}/g, classData.cumulativeRelFreq || 0)
      .replace(/{value}/g, value)
      .replace(/{valueSuffix}/g, valueSuffix)
      .replace(/\\n/g, '\n'); // 줄바꿈 지원
  }

  /**
   * 텍스트 너비 측정 (줄바꿈 고려하여 최대 너비 반환)
   * @param {string} text - 텍스트 (\\n으로 줄바꿈)
   * @param {string} font - 폰트
   * @returns {number} 텍스트 너비 (px)
   */
  static measureTextWidth(text, font = CONFIG.CALLOUT_FONT) {
    // 임시 캔버스 생성
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = font;

    // 줄바꿈이 있는 경우 각 줄의 최대 너비 반환
    const lines = text.split('\n');
    let maxWidth = 0;

    lines.forEach(line => {
      const metrics = ctx.measureText(line);
      maxWidth = Math.max(maxWidth, metrics.width);
    });

    return maxWidth;
  }

  /**
   * 말풍선 너비 계산 (텍스트 너비 + 여백)
   * 여백은 전체 너비의 1/5씩 양쪽 (총 2/5), 텍스트는 3/5
   * @param {string} text - 텍스트
   * @param {string} font - 폰트
   * @returns {number} 말풍선 너비 (px)
   */
  static calculateCalloutWidth(text, font = CONFIG.CALLOUT_FONT) {
    const textWidth = this.measureTextWidth(text, font);
    const accentBarWidth = CONFIG.CALLOUT_ACCENT_BAR_WIDTH;

    // 텍스트가 전체의 60%를 차지하도록
    // 너비 = 텍스트너비 / 0.6
    const totalWidth = textWidth / CONFIG.CALLOUT_TEXT_WIDTH_RATIO;

    // 세로 막대 너비를 포함한 최종 너비
    return Math.ceil(totalWidth) + accentBarWidth;
  }
}

export default CalloutRenderer;

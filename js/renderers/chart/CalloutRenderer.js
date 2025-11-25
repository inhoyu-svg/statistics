/**
 * 말풍선 렌더러
 * 다각형 포인트에 정보 표시용 말풍선 렌더링
 */

import CONFIG from '../../config.js';
import Utils from '../../utils/utils.js';

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
    const { x, y, text, width, height, opacity, polygonPreset } = layer.data;

    if (!text || opacity === 0) return;

    this.ctx.save();
    this.ctx.globalAlpha = opacity || 1.0;

    // 말풍선 도형 그리기
    this._drawCalloutShape(x, y, width, height);

    // 오른쪽 세로 막대 그리기
    this._drawAccentBar(x, y, width, height, polygonPreset);

    // 텍스트 그리기
    this._drawText(x, y, width, height, text);

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
   * 오른쪽 세로 막대 그리기
   * @param {number} x - 말풍선 왼쪽 상단 x
   * @param {number} y - 말풍선 왼쪽 상단 y
   * @param {number} width - 말풍선 너비
   * @param {number} height - 말풍선 높이
   * @param {string} polygonPreset - 다각형 색상 프리셋
   */
  _drawAccentBar(x, y, width, height, polygonPreset) {
    const ctx = this.ctx;
    const barWidth = CONFIG.CALLOUT_ACCENT_BAR_WIDTH;

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
   */
  _drawText(x, y, width, height, text) {
    const ctx = this.ctx;
    const padding = CONFIG.CALLOUT_PADDING;
    const lineHeight = CONFIG.CALLOUT_LINE_HEIGHT;

    ctx.font = CONFIG.CALLOUT_FONT;
    ctx.fillStyle = CONFIG.getColor('--chart-callout-text');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // 줄바꿈 분할
    const lines = text.split('\n');

    // 텍스트 시작 위치 (수직 중앙 정렬)
    const totalTextHeight = lines.length * lineHeight;
    const textY = y + (height - totalTextHeight) / 2;

    lines.forEach((line, i) => {
      const textX = x + width / 2; // 가로 중앙
      const lineY = textY + i * lineHeight;
      ctx.fillText(line, textX, lineY);
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
}

export default CalloutRenderer;

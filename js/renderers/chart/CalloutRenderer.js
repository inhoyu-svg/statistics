/**
 * 말풍선 렌더러
 * 다각형 포인트에 정보 표시용 말풍선 렌더링
 */

import CONFIG from '../../config.js';

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
    const { x, y, text, width, height, opacity } = layer.data;

    if (!text || opacity === 0) return;

    this.ctx.save();
    this.ctx.globalAlpha = opacity || 1.0;

    // 말풍선 도형 그리기
    this._drawCalloutShape(x, y, width, height);

    // 텍스트 그리기
    this._drawText(x, y, width, height, text);

    this.ctx.restore();
  }

  /**
   * 말풍선 도형 그리기 (배경 + 테두리)
   * @param {number} x - 말풍선 왼쪽 상단 x
   * @param {number} y - 말풍선 왼쪽 상단 y
   * @param {number} width - 너비
   * @param {number} height - 높이
   */
  _drawCalloutShape(x, y, width, height) {
    const ctx = this.ctx;
    const radius = CONFIG.CALLOUT_BORDER_RADIUS;

    // 둥근 사각형 Path 생성
    const path = new Path2D();

    // 상단 왼쪽 모서리부터 시작 (시계방향)
    path.moveTo(x + radius, y);

    // 상단 우측 모서리
    path.lineTo(x + width - radius, y);
    path.arcTo(x + width, y, x + width, y + radius, radius);

    // 우측 하단 모서리
    path.lineTo(x + width, y + height - radius);
    path.arcTo(x + width, y + height, x + width - radius, y + height, radius);

    // 하단 좌측 모서리
    path.lineTo(x + radius, y + height);
    path.arcTo(x, y + height, x, y + height - radius, radius);

    // 좌측 상단 모서리
    path.lineTo(x, y + radius);
    path.arcTo(x, y, x + radius, y, radius);

    path.closePath();

    // 배경 그라데이션
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, 'rgba(174, 255, 126, 0.3)'); // #AEFF7E
    gradient.addColorStop(1, 'rgba(104, 153, 76, 0.3)');  // #68994C

    ctx.fillStyle = gradient;
    ctx.fill(path);

    // 테두리
    ctx.strokeStyle = '#93DA6A';
    ctx.lineWidth = 1;
    ctx.stroke(path);
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
    ctx.fillStyle = '#93DA6A';
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

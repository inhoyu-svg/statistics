/**
 * 산점도 점 렌더러
 * 데이터 포인트를 점으로 렌더링
 */

import CONFIG from '../../config.js';

class ScatterPointRenderer {
  /**
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   */
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * 모든 데이터 포인트 렌더링
   * @param {Array<Array<number>>} dataPoints - [[x1, y1], [x2, y2], ...]
   * @param {Object} coords - 좌표계 객체
   * @param {Object} options - 옵션
   * @param {number} options.pointSize - 점 크기
   * @param {string} options.pointColor - 점 색상
   */
  draw(dataPoints, coords, options = {}) {
    const {
      pointSize = CONFIG.SCATTER_POINT_RADIUS,
      pointColor = CONFIG.SCATTER_POINT_COLOR
    } = options;

    const { toX, toY } = coords;

    this.ctx.save();

    dataPoints.forEach(([x, y]) => {
      this._drawPoint(toX(x), toY(y), pointSize, pointColor);
    });

    this.ctx.restore();
  }

  /**
   * 단일 점 렌더링
   * @param {number} canvasX - 캔버스 X좌표
   * @param {number} canvasY - 캔버스 Y좌표
   * @param {number} radius - 점 반지름
   * @param {string} color - 점 색상
   */
  _drawPoint(canvasX, canvasY, radius, color) {
    this.ctx.beginPath();
    this.ctx.arc(canvasX, canvasY, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();

    // 테두리 (약간 어두운 색상)
    this.ctx.strokeStyle = this._darkenColor(color, 0.3);
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();
  }

  /**
   * 색상을 어둡게 만들기
   * @param {string} color - 원본 색상 (hex)
   * @param {number} amount - 어둡게 할 정도 (0~1)
   * @returns {string} 어두워진 색상
   */
  _darkenColor(color, amount) {
    // #RRGGBB 형식 파싱
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // 어둡게 만들기
    const darken = (c) => Math.round(c * (1 - amount));

    return `rgb(${darken(r)}, ${darken(g)}, ${darken(b)})`;
  }

  /**
   * 애니메이션용 단일 점 렌더링 (레이어 시스템 호환)
   * @param {Object} layer - 레이어 객체
   * @param {Object} options - 옵션
   */
  renderPoint(layer, options = {}) {
    const { x, y, radius, color, opacity = 1 } = layer.data;

    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this._drawPoint(x, y, radius, color);
    this.ctx.restore();
  }
}

export default ScatterPointRenderer;

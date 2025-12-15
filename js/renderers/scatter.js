/**
 * 산점도 렌더러 (메인 컨트롤러)
 * 정사각형 그리드 기반 산점도 렌더링
 */

import CONFIG from '../config.js';
import ScatterCoordinateSystem from './scatter/ScatterCoordinateSystem.js';
import ScatterAxisRenderer from './scatter/ScatterAxisRenderer.js';
import ScatterPointRenderer from './scatter/ScatterPointRenderer.js';

class ScatterRenderer {
  /**
   * @param {HTMLCanvasElement} canvas - Canvas 요소
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.axisRenderer = new ScatterAxisRenderer(this.ctx);
    this.pointRenderer = new ScatterPointRenderer(this.ctx);
  }

  /**
   * 산점도 렌더링
   * @param {Array<Array<number>>} dataPoints - [[x1, y1], [x2, y2], ...]
   * @param {Object} options - 렌더링 옵션
   * @param {Object} options.axisLabels - 축 라벨 { xAxis, yAxis }
   * @param {number} options.pointSize - 점 크기
   * @param {string} options.pointColor - 점 색상
   * @param {number} options.canvasWidth - 캔버스 너비
   * @param {number} options.canvasHeight - 캔버스 높이
   */
  draw(dataPoints, options = {}) {
    const {
      axisLabels = {},
      pointSize = CONFIG.SCATTER_POINT_RADIUS,
      pointColor = CONFIG.SCATTER_POINT_COLOR,
      canvasWidth = CONFIG.SCATTER_DEFAULT_WIDTH,
      canvasHeight = CONFIG.SCATTER_DEFAULT_HEIGHT
    } = options;

    // 캔버스 크기 설정
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;

    // 캔버스 초기화 (배경색)
    this.ctx.fillStyle = CONFIG.getColor('--color-surface');
    this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 데이터에서 좌표계 파라미터 추출
    const params = ScatterCoordinateSystem.extractParams(dataPoints);

    // 좌표계 생성
    const coords = ScatterCoordinateSystem.create({
      canvasWidth,
      canvasHeight,
      padding: CONFIG.SCATTER_PADDING,
      ...params
    });

    // 그리드 및 축 렌더링
    this.axisRenderer.draw(coords, { axisLabels });

    // 점 렌더링
    this.pointRenderer.draw(dataPoints, coords, { pointSize, pointColor });

    return {
      coords,
      dataPoints
    };
  }

  /**
   * 데이터 유효성 검사
   * @param {Array<Array<number>>} dataPoints - 데이터 포인트
   * @returns {{ valid: boolean, error: string|null }}
   */
  static validate(dataPoints) {
    if (!Array.isArray(dataPoints)) {
      return { valid: false, error: '데이터는 배열이어야 합니다.' };
    }

    if (dataPoints.length < 2) {
      return { valid: false, error: '최소 2개 이상의 데이터 포인트가 필요합니다.' };
    }

    for (let i = 0; i < dataPoints.length; i++) {
      const point = dataPoints[i];
      if (!Array.isArray(point) || point.length !== 2) {
        return { valid: false, error: `${i + 1}번째 포인트가 [x, y] 형식이 아닙니다.` };
      }
      if (typeof point[0] !== 'number' || typeof point[1] !== 'number') {
        return { valid: false, error: `${i + 1}번째 포인트의 값이 숫자가 아닙니다.` };
      }
    }

    // 간격 검증
    const xInterval = Math.abs(dataPoints[1][0] - dataPoints[0][0]);
    const yInterval = Math.abs(dataPoints[1][1] - dataPoints[0][1]);

    if (xInterval === 0) {
      return { valid: false, error: 'X축 간격이 0입니다.' };
    }
    if (yInterval === 0) {
      return { valid: false, error: 'Y축 간격이 0입니다.' };
    }

    return { valid: true, error: null };
  }

  /**
   * 문자열 데이터 파싱
   * @param {string} dataString - "x1,y1 x2,y2 x3,y3" 형식
   * @returns {Array<Array<number>>} 파싱된 데이터 포인트
   */
  static parseData(dataString) {
    if (typeof dataString !== 'string') {
      return dataString; // 이미 배열이면 그대로 반환
    }

    return dataString
      .trim()
      .split(/\s+/)
      .map(pair => {
        const [x, y] = pair.split(',').map(Number);
        return [x, y];
      });
  }
}

export default ScatterRenderer;

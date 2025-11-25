/**
 * 유틸리티 함수 모음
 */

import CONFIG from '../config.js';

class Utils {
  /**
   * 숫자를 지정된 소수점 자릿수로 포맷
   */
  static formatNumber(num, decimals = CONFIG.DECIMAL_PLACES) {
    return Number(num).toFixed(decimals);
  }

  /**
   * 숫자를 포맷하고 불필요한 .00 제거
   * @param {number} num - 포맷할 숫자
   * @param {number} decimals - 소수점 자릿수
   * @returns {string} 포맷된 숫자 (불필요한 .00 제거)
   */
  static formatNumberClean(num, decimals = CONFIG.DECIMAL_PLACES) {
    const formatted = Number(num).toFixed(decimals);
    // .00 제거 (예: 20.00 → 20, 33.33은 유지)
    return formatted.replace(/\.00$/, '');
  }

  /**
   * 데이터 문자열을 숫자 배열로 파싱
   * @param {string} str - 쉼표 또는 공백으로 구분된 숫자 문자열
   * @returns {Array<number>} 숫자 배열
   */
  static parseData(str) {
    if (!str || typeof str !== 'string') return [];

    // 쉼표와 공백을 모두 구분자로 사용
    return str
      .split(/[,\s]+/)
      .map(s => s.trim())
      .filter(s => s !== '')
      .map(s => parseFloat(s))
      .filter(n => !isNaN(n));
  }

  /**
   * 배열이 비어있는지 확인
   */
  static isEmpty(arr) {
    return !arr || arr.length === 0;
  }

  /**
   * 숫자 범위 검증
   */
  static isInRange(value, min, max) {
    return value >= min && value <= max;
  }

  /**
   * HTML 특수문자 이스케이프 (XSS 방어)
   * @param {string} text - 이스케이프할 텍스트
   * @returns {string} 이스케이프된 텍스트
   */
  static escapeHtml(text) {
    if (text === null || text === undefined) return '';

    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  /**
   * 계급명 생성 헬퍼 (min~max 형식)
   * @param {Object} classData - 계급 데이터 ({ min, max })
   * @returns {string} 계급명 (예: "140~150")
   */
  static getClassName(classData) {
    return `${classData.min}~${classData.max}`;
  }

  /**
   * 수직 그라디언트 생성 (Canvas)
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {number} x - 시작 X 좌표
   * @param {number} y - 시작 Y 좌표
   * @param {number} height - 그라디언트 높이
   * @param {string} startColor - 시작 색상
   * @param {string} endColor - 끝 색상
   * @returns {CanvasGradient} 그라디언트 객체
   */
  static createVerticalGradient(ctx, x, y, height, startColor, endColor) {
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);
    return gradient;
  }

  /**
   * 선 그라디언트 생성 (Canvas) - 두 점 사이
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {number} x1 - 시작 X
   * @param {number} y1 - 시작 Y
   * @param {number} x2 - 끝 X
   * @param {number} y2 - 끝 Y
   * @param {string} startColor - 시작 색상
   * @param {string} endColor - 끝 색상
   * @returns {CanvasGradient} 그라디언트 객체
   */
  static createLineGradient(ctx, x1, y1, x2, y2, startColor, endColor) {
    const gradient = ctx.createLinearGradient(x1, Math.min(y1, y2), x2, Math.max(y1, y2));
    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);
    return gradient;
  }
}

export default Utils;

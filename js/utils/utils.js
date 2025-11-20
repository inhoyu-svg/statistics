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
}

export default Utils;

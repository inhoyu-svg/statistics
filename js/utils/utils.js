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
}

export default Utils;

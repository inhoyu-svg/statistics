/**
 * 도수분포표 파서
 * 숫자 데이터를 파싱하여 배열로 반환
 */

import CONFIG from '../../config.js';

class FrequencyParser {
  /**
   * 입력 문자열을 숫자 배열로 파싱
   * @param {string} input - 쉼표 또는 공백으로 구분된 숫자 문자열
   * @returns {{ success: boolean, data: number[]|null, error: string|null }}
   * @example
   * parse("1, 2, 3") // { success: true, data: [1, 2, 3], error: null }
   * parse("1 2 3")   // { success: true, data: [1, 2, 3], error: null }
   * parse("")        // { success: false, data: null, error: "데이터가 비어있습니다" }
   */
  static parse(input) {
    if (!input || typeof input !== 'string') {
      return {
        success: false,
        data: null,
        error: '데이터가 비어있습니다.'
      };
    }

    const trimmed = input.trim();
    if (!trimmed) {
      return {
        success: false,
        data: null,
        error: '데이터가 비어있습니다.'
      };
    }

    // 쉼표 또는 공백으로 분리하여 숫자로 변환
    const numbers = trimmed
      .split(/[,\s]+/)
      .map(Number)
      .filter(n => !isNaN(n) && isFinite(n));

    if (numbers.length === 0) {
      return {
        success: false,
        data: null,
        error: '유효한 숫자가 없습니다.'
      };
    }

    if (numbers.length < CONFIG.MIN_DATA_POINTS) {
      return {
        success: false,
        data: null,
        error: `최소 ${CONFIG.MIN_DATA_POINTS}개 이상의 데이터가 필요합니다.`
      };
    }

    if (numbers.length > CONFIG.MAX_DATA_POINTS) {
      return {
        success: false,
        data: null,
        error: `데이터 개수는 최대 ${CONFIG.MAX_DATA_POINTS}개까지 입력 가능합니다.`
      };
    }

    return {
      success: true,
      data: numbers,
      error: null
    };
  }

  /**
   * 파서 타입 반환
   * @returns {string}
   */
  static getType() {
    return CONFIG.TABLE_TYPES.FREQUENCY;
  }
}

export default FrequencyParser;

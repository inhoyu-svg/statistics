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
   * parse("1, 2, 3")   // { success: true, data: [1, 2, 3], error: null }
   * parse("1 2 3")     // { success: true, data: [1, 2, 3], error: null }
   * parse("35*10")     // { success: true, data: [35, 35, ...(10개)], error: null }
   * parse("40*2 50*3") // { success: true, data: [40, 40, 50, 50, 50], error: null }
   * parse("")          // { success: false, data: null, error: "데이터가 비어있습니다" }
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

    // 쉼표 또는 공백으로 분리
    const tokens = trimmed.split(/[,\s]+/);
    const numbers = [];

    for (const token of tokens) {
      // 숫자*반복횟수 패턴 체크 (예: 35*10, -5*3, 3.14*2)
      const repeatMatch = token.match(/^(-?\d+\.?\d*)\*(\d+)$/);
      if (repeatMatch) {
        const value = Number(repeatMatch[1]);
        const count = parseInt(repeatMatch[2], 10);
        if (!isNaN(value) && isFinite(value) && count > 0) {
          for (let i = 0; i < count; i++) {
            numbers.push(value);
          }
        }
      } else {
        // 일반 숫자
        const num = Number(token);
        if (!isNaN(num) && isFinite(num)) {
          numbers.push(num);
        }
      }
    }

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

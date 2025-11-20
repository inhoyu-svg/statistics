/**
 * 입력 검증 레이어
 */

import CONFIG from '../config.js';
import Utils from './utils.js';

class Validator {
  /**
   * 데이터 배열 검증
   */
  static validateData(data) {
    if (Utils.isEmpty(data)) {
      return { valid: false, message: '유효한 데이터가 없습니다. 숫자를 입력해주세요.' };
    }

    if (data.length < CONFIG.MIN_DATA_POINTS) {
      return { valid: false, message: `최소 ${CONFIG.MIN_DATA_POINTS}개 이상의 데이터가 필요합니다.` };
    }

    if (data.length > CONFIG.MAX_DATA_POINTS) {
      return { valid: false, message: `데이터 개수는 최대 ${CONFIG.MAX_DATA_POINTS}개까지 입력 가능합니다.` };
    }

    // NaN, Infinity 체크
    if (data.some(v => !isFinite(v))) {
      return { valid: false, message: '유효하지 않은 숫자가 포함되어 있습니다.' };
    }

    return { valid: true };
  }

  /**
   * 계급 개수 검증
   */
  static validateClassCount(count) {
    if (!count || isNaN(count)) {
      return { valid: false, message: '계급 개수를 입력해주세요.' };
    }

    if (!Utils.isInRange(count, CONFIG.MIN_CLASS_COUNT, CONFIG.MAX_CLASS_COUNT)) {
      return {
        valid: false,
        message: `계급 개수는 ${CONFIG.MIN_CLASS_COUNT}~${CONFIG.MAX_CLASS_COUNT} 사이여야 합니다.`
      };
    }

    return { valid: true };
  }

  /**
   * 계급 간격 검증
   */
  static validateClassWidth(width) {
    if (width === null || width === undefined || width === '') {
      return { valid: true }; // 선택사항이므로 비어있어도 OK
    }

    if (isNaN(width) || width <= 0) {
      return { valid: false, message: '계급 간격은 0보다 큰 숫자여야 합니다.' };
    }

    if (width < CONFIG.MIN_CLASS_WIDTH) {
      return { valid: false, message: `계급 간격은 최소 ${CONFIG.MIN_CLASS_WIDTH} 이상이어야 합니다.` };
    }

    return { valid: true };
  }

  /**
   * 표 컬럼 선택 검증 (최소 2개 이상 선택되어야 함)
   */
  static validateTableColumns(visibleColumns) {
    const checkedCount = visibleColumns.filter(col => col === true).length;

    if (checkedCount < 2) {
      return {
        valid: false,
        message: '최소 2개 이상의 컬럼을 선택해주세요.'
      };
    }

    return { valid: true };
  }
}

export default Validator;

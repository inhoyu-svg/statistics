/**
 * 입력 검증 레이어
 */

import CONFIG from '../config.js';
import Utils from './utils.js';
import { ParserFactory } from '../core/parsers/index.js';

/**
 * 표준화된 에러 코드
 */
export const ERROR_CODES = {
  REQUIRED: 'REQUIRED',
  TYPE_ERROR: 'TYPE_ERROR',
  INVALID_FORMAT: 'INVALID_FORMAT',
  RANGE_ERROR: 'RANGE_ERROR',
  MIN_LENGTH: 'MIN_LENGTH',
  MAX_LENGTH: 'MAX_LENGTH',
  UNSUPPORTED_TYPE: 'UNSUPPORTED_TYPE',
  CUSTOM_RANGE_ERROR: 'CUSTOM_RANGE_ERROR'
};

class Validator {
  /**
   * 테이블 타입에 따른 데이터 검증
   * @param {string} type - 테이블 타입
   * @param {string} input - 원본 입력 문자열
   * @returns {{ valid: boolean, data: any, message: string|null }}
   */
  static validateByType(type, input) {
    // 타입 유효성 검사
    if (!Object.values(CONFIG.TABLE_TYPES).includes(type)) {
      return {
        valid: false,
        data: null,
        message: `알 수 없는 테이블 타입: ${type}`
      };
    }

    // 입력 검사
    if (!input || typeof input !== 'string' || !input.trim()) {
      return {
        valid: false,
        data: null,
        message: '데이터를 입력해주세요.'
      };
    }

    // 파서를 통한 파싱 및 검증
    const parseResult = ParserFactory.parse(type, input);

    if (!parseResult.success) {
      return {
        valid: false,
        data: null,
        message: parseResult.error
      };
    }

    return {
      valid: true,
      data: parseResult.data,
      message: null
    };
  }

  /**
   * 도수분포표 전용 데이터 배열 검증 (기존 호환)
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

/**
 * viz-api 설정 검증 클래스
 * 모든 검증을 중앙에서 처리하고 표준화된 에러 형식 반환
 *
 * @typedef {Object} ValidationError
 * @property {string} field - 에러 발생 필드
 * @property {string} code - 에러 코드 (ERROR_CODES)
 * @property {string} message - 사용자 친화적 메시지
 *
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - 검증 성공 여부
 * @property {any} data - 성공 시 파싱된 데이터
 * @property {ValidationError[]} errors - 에러 목록
 */
class ConfigValidator {
  /**
   * viz-api config 객체 전체 검증
   * @param {Object} config - viz-api 설정 객체
   * @param {'chart'|'table'} purpose - 렌더링 목적
   * @returns {ValidationResult}
   */
  static validate(config, purpose = 'chart') {
    const errors = [];
    let parsedData = null;

    // 1. config 객체 자체 검증
    if (!config || typeof config !== 'object') {
      this._addError(errors, 'config', ERROR_CODES.REQUIRED, 'config 객체가 필요합니다.');
      return { valid: false, data: null, errors };
    }

    // 2. 필수 필드 검증
    this._validateRequired(config, errors);

    // 조기 반환: 필수 필드 누락 시
    if (errors.length > 0) {
      return { valid: false, data: null, errors };
    }

    // 2.5. 테이블 데이터인데 purpose가 chart인 경우 경고
    if (purpose === 'chart' && typeof config.data === 'string') {
      const tablePatterns = ['헤더:', '헤더 :', 'Header:', 'header:'];
      const looksLikeTable = tablePatterns.some(p => config.data.includes(p));
      if (looksLikeTable) {
        console.warn('[viz-api] 테이블 데이터 형식("헤더:")인데 purpose가 "chart"입니다. 테이블을 원하면 "purpose": "table"을 추가하세요.');
      }
    }

    // 3. 테이블 타입 검증
    // 차트는 tableType 무시하고 frequency 데이터로 처리
    const tableType = purpose === 'chart' ? 'frequency' : (config.tableType || 'basic-table');
    if (!this._isValidTableType(tableType)) {
      this._addError(
        errors,
        'tableType',
        ERROR_CODES.UNSUPPORTED_TYPE,
        `지원하지 않는 테이블 타입: ${tableType}`
      );
    }

    // 4. 데이터 파싱 및 검증
    const parseResult = this._validateAndParseData(config, tableType, errors);
    if (parseResult && parseResult.success) {
      parsedData = {
        tableType,
        rawData: parseResult.data,
        parseResult
      };
    }

    // 5. 계급 설정 검증 (차트인 경우)
    if (purpose === 'chart') {
      this._validateClassSettings(config, errors);
    }

    // 6. 커스텀 범위 검증
    if (config.classRange) {
      this._validateCustomRange(config.classRange, errors);
    }

    // 7. 옵션 검증
    if (config.options) {
      this._validateOptions(config.options, purpose, errors);
    }

    return {
      valid: errors.length === 0,
      data: errors.length === 0 ? parsedData : null,
      errors
    };
  }

  // =====================
  // 내부 검증 메서드들
  // =====================

  /**
   * 필수 필드 검증
   * @private
   */
  static _validateRequired(config, errors) {
    // datasets 배열이 있으면 data는 필수가 아님
    const hasDatasets = Array.isArray(config.datasets) && config.datasets.length > 0;
    if (!config.data && !hasDatasets) {
      this._addError(errors, 'data', ERROR_CODES.REQUIRED, 'data 필드는 필수입니다.');
    }
  }

  /**
   * 데이터 파싱 및 검증
   * @private
   */
  static _validateAndParseData(config, tableType, errors) {
    // datasets 배열이 있으면 data 검증 스킵
    const hasDatasets = Array.isArray(config.datasets) && config.datasets.length > 0;
    if (hasDatasets) {
      return { success: true, data: null };
    }

    // 데이터 문자열 변환 (배열 지원)
    const dataString = Array.isArray(config.data)
      ? config.data.join(', ')
      : config.data;

    // 빈 문자열 체크
    if (!dataString || (typeof dataString === 'string' && !dataString.trim())) {
      this._addError(errors, 'data', ERROR_CODES.REQUIRED, '데이터가 비어있습니다.');
      return null;
    }

    // 파서를 통한 검증
    const parseResult = ParserFactory.parse(tableType, dataString);

    if (!parseResult.success) {
      this._addError(
        errors,
        'data',
        ERROR_CODES.INVALID_FORMAT,
        parseResult.error || '데이터 형식이 올바르지 않습니다.'
      );
    }

    return parseResult;
  }

  /**
   * 계급 설정 검증 (도수분포표 전용)
   * @private
   */
  static _validateClassSettings(config, errors) {
    // classCount 검증
    if (config.classCount !== undefined && config.classCount !== null) {
      const count = config.classCount;

      if (!Number.isInteger(count)) {
        this._addError(
          errors,
          'classCount',
          ERROR_CODES.TYPE_ERROR,
          '계급 개수는 정수여야 합니다.'
        );
      } else if (count < CONFIG.MIN_CLASS_COUNT || count > CONFIG.MAX_CLASS_COUNT) {
        this._addError(
          errors,
          'classCount',
          ERROR_CODES.RANGE_ERROR,
          `계급 개수는 ${CONFIG.MIN_CLASS_COUNT}~${CONFIG.MAX_CLASS_COUNT} 사이여야 합니다.`
        );
      }
    }

    // classWidth 검증
    if (config.classWidth !== undefined && config.classWidth !== null && config.classWidth !== '') {
      const width = config.classWidth;

      if (isNaN(width) || width <= 0) {
        this._addError(
          errors,
          'classWidth',
          ERROR_CODES.RANGE_ERROR,
          '계급 간격은 0보다 큰 숫자여야 합니다.'
        );
      } else if (width < CONFIG.MIN_CLASS_WIDTH) {
        this._addError(
          errors,
          'classWidth',
          ERROR_CODES.RANGE_ERROR,
          `계급 간격은 최소 ${CONFIG.MIN_CLASS_WIDTH} 이상이어야 합니다.`
        );
      }
    }
  }

  /**
   * 커스텀 범위 검증
   * @private
   */
  static _validateCustomRange(range, errors) {
    const { firstStart, secondStart, lastEnd } = range;

    // 필수 필드 체크
    if (firstStart === undefined || secondStart === undefined || lastEnd === undefined) {
      this._addError(
        errors,
        'classRange',
        ERROR_CODES.REQUIRED,
        'classRange는 firstStart, secondStart, lastEnd가 모두 필요합니다.'
      );
      return;
    }

    // 논리적 순서 검증
    if (firstStart < 0) {
      this._addError(
        errors,
        'classRange.firstStart',
        ERROR_CODES.CUSTOM_RANGE_ERROR,
        '첫 계급의 시작값은 0 이상이어야 합니다.'
      );
    }

    if (secondStart <= firstStart) {
      this._addError(
        errors,
        'classRange.secondStart',
        ERROR_CODES.CUSTOM_RANGE_ERROR,
        '두 번째 계급의 시작값은 첫 계급의 시작값보다 커야 합니다.'
      );
    }

    if (lastEnd <= secondStart) {
      this._addError(
        errors,
        'classRange.lastEnd',
        ERROR_CODES.CUSTOM_RANGE_ERROR,
        '마지막 계급의 끝값은 두 번째 계급의 시작값보다 커야 합니다.'
      );
    }

    // 간격으로 나누어 떨어지는지 검증
    const classWidth = secondStart - firstStart;
    const totalRange = lastEnd - firstStart;
    if (classWidth > 0 && totalRange % classWidth !== 0) {
      this._addError(
        errors,
        'classRange',
        ERROR_CODES.CUSTOM_RANGE_ERROR,
        `전체 범위(${totalRange})가 간격(${classWidth})으로 나누어 떨어지지 않습니다.`
      );
    }
  }

  /**
   * 옵션 검증
   * @private
   */
  static _validateOptions(options, purpose, errors) {
    // cellAnimations 검증
    if (options.cellAnimations && !Array.isArray(options.cellAnimations)) {
      this._addError(
        errors,
        'options.cellAnimations',
        ERROR_CODES.TYPE_ERROR,
        'cellAnimations는 배열이어야 합니다.'
      );
    }

    // corruption 옵션 검증
    if (options.corruption?.enabled && !options.corruption.cells) {
      this._addError(
        errors,
        'options.corruption.cells',
        ERROR_CODES.REQUIRED,
        'corruption.enabled가 true일 때 cells는 필수입니다.'
      );
    }
  }

  // =====================
  // 헬퍼 메서드
  // =====================

  /**
   * 테이블 타입 유효성 확인
   * @private
   */
  static _isValidTableType(type) {
    return Object.values(CONFIG.TABLE_TYPES).includes(type);
  }

  /**
   * 에러 추가 헬퍼
   * @private
   */
  static _addError(errors, field, code, message) {
    errors.push({ field, code, message });
  }
}

export default Validator;
export { ConfigValidator };

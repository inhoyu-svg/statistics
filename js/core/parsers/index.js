/**
 * 파서 모듈 통합 export
 */

import CONFIG from '../../config.js';
import FrequencyParser from './FrequencyParser.js';
import CategoryMatrixParser from './CategoryMatrixParser.js';
import CrossTableParser from './CrossTableParser.js';
import StemLeafParser from './StemLeafParser.js';

/**
 * 파서 팩토리
 * 테이블 타입에 따라 적절한 파서 반환
 */
class ParserFactory {
  /**
   * 타입에 맞는 파서로 데이터 파싱
   * @param {string} type - 테이블 타입
   * @param {string} input - 입력 문자열
   * @returns {{ success: boolean, data: any, error: string|null }}
   */
  static parse(type, input) {
    switch (type) {
      case CONFIG.TABLE_TYPES.FREQUENCY:
        return FrequencyParser.parse(input);

      case CONFIG.TABLE_TYPES.CATEGORY_MATRIX:
        return CategoryMatrixParser.parse(input);

      case CONFIG.TABLE_TYPES.CROSS_TABLE:
        return CrossTableParser.parse(input);

      case CONFIG.TABLE_TYPES.STEM_LEAF:
        return StemLeafParser.parse(input);

      default:
        return {
          success: false,
          data: null,
          error: `알 수 없는 테이블 타입: ${type}`
        };
    }
  }

  /**
   * 타입에 맞는 파서 클래스 반환
   * @param {string} type - 테이블 타입
   * @returns {Class|null}
   */
  static getParser(type) {
    switch (type) {
      case CONFIG.TABLE_TYPES.FREQUENCY:
        return FrequencyParser;
      case CONFIG.TABLE_TYPES.CATEGORY_MATRIX:
        return CategoryMatrixParser;
      case CONFIG.TABLE_TYPES.CROSS_TABLE:
        return CrossTableParser;
      case CONFIG.TABLE_TYPES.STEM_LEAF:
        return StemLeafParser;
      default:
        return null;
    }
  }

  /**
   * 지원하는 모든 타입 반환
   * @returns {string[]}
   */
  static getSupportedTypes() {
    return Object.values(CONFIG.TABLE_TYPES);
  }
}

export {
  ParserFactory,
  FrequencyParser,
  CategoryMatrixParser,
  CrossTableParser,
  StemLeafParser
};

export default ParserFactory;

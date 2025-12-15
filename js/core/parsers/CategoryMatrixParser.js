/**
 * 카테고리 행렬 파서
 * "헤더: A, B, C" + "라벨: 값들" 형식의 데이터를 파싱
 */

import CONFIG from '../../config.js';

class CategoryMatrixParser {
  /**
   * 입력 문자열을 카테고리 행렬 데이터로 파싱
   * @param {string} input - 여러 줄의 "라벨: 값들" 형식 문자열
   * @returns {{ success: boolean, data: Object|null, error: string|null }}
   * @example
   * parse("헤더: A, B, C\n전체: 200, 250, 300\nO형: 50, 60, 70")
   * // { success: true, data: { headers: ['A','B','C'], rows: [{label:'전체', values:[200,250,300]}, ...] } }
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

    const lines = trimmed.split('\n').map(line => line.trim()).filter(line => line);

    if (lines.length < 2) {
      return {
        success: false,
        data: null,
        error: '최소 헤더 1줄과 데이터 1줄이 필요합니다.'
      };
    }

    const result = {
      headers: [],
      rows: []
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const colonIndex = line.indexOf(':');

      if (colonIndex === -1) {
        return {
          success: false,
          data: null,
          error: `${i + 1}번째 줄: "라벨: 값" 형식이 아닙니다.`
        };
      }

      const label = line.substring(0, colonIndex).trim();
      const valuesStr = line.substring(colonIndex + 1).trim();

      if (!label) {
        return {
          success: false,
          data: null,
          error: `${i + 1}번째 줄: 라벨이 비어있습니다.`
        };
      }

      // 첫 번째 줄이 헤더인지 확인 (라벨이 '헤더'인 경우)
      if (i === 0 && label.toLowerCase() === '헤더') {
        result.headers = valuesStr.split(',').map(v => {
          const trimmed = v.trim();
          // null 문자열은 빈 문자열로 처리 (빈칸 표시)
          return trimmed === 'null' ? '' : trimmed;
        });
        // 모든 헤더가 빈 문자열인지 확인
        if (result.headers.every(h => h === '')) {
          return {
            success: false,
            data: null,
            error: '헤더 값이 비어있습니다.'
          };
        }
      } else {
        // 데이터 행
        const values = valuesStr.split(',').map(v => {
          const trimmedVal = v.trim();

          // 1. null 표기 → 빈 값
          if (trimmedVal === 'null' || trimmedVal === '') {
            return null;
          }

          // 2. 탈리마크 표기 → { type: 'tally', count: N }
          if (/^\/+$/.test(trimmedVal)) {
            return { type: 'tally', count: trimmedVal.length };
          }

          // 3. 숫자 변환
          const num = Number(trimmedVal);
          return isNaN(num) ? trimmedVal : num;
        });

        // 헤더가 있으면 개수 확인
        if (result.headers.length > 0 && values.length !== result.headers.length) {
          return {
            success: false,
            data: null,
            error: `${i + 1}번째 줄: 값 개수(${values.length})가 헤더 개수(${result.headers.length})와 일치하지 않습니다.`
          };
        }

        result.rows.push({
          label: label,
          values: values
        });
      }
    }

    if (result.rows.length === 0) {
      return {
        success: false,
        data: null,
        error: '데이터 행이 없습니다.'
      };
    }

    // 헤더가 없으면 자동 생성 (A, B, C, ...)
    if (result.headers.length === 0) {
      const columnCount = result.rows[0].values.length;
      result.headers = Array.from({ length: columnCount }, (_, i) =>
        String.fromCharCode(65 + i) // A, B, C, ...
      );
    }

    return {
      success: true,
      data: result,
      error: null
    };
  }

  /**
   * 파서 타입 반환
   * @returns {string}
   */
  static getType() {
    return CONFIG.TABLE_TYPES.CATEGORY_MATRIX;
  }
}

export default CategoryMatrixParser;

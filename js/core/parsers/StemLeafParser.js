/**
 * 줄기-잎 그림 파서
 * 두 그룹의 숫자 데이터를 파싱하여 줄기-잎 형식으로 변환
 */

import CONFIG from '../../config.js';

class StemLeafParser {
  /**
   * 입력 문자열을 줄기-잎 그림 데이터로 파싱
   * @param {string} input - "왼쪽: 숫자들\n오른쪽: 숫자들" 형식
   * @returns {{ success: boolean, data: Object|null, error: string|null }}
   * @example
   * parse("왼쪽: 162, 175, 178\n오른쪽: 160, 165, 170")
   * // { success: true, data: { leftLabel, rightLabel, stems: [...] } }
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
        error: '"왼쪽: 숫자들"과 "오른쪽: 숫자들" 두 줄이 필요합니다.'
      };
    }

    let leftData = null;
    let rightData = null;
    let leftLabel = '왼쪽';
    let rightLabel = '오른쪽';

    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) {
        return {
          success: false,
          data: null,
          error: `"라벨: 숫자들" 형식이 아닙니다: ${line}`
        };
      }

      const label = line.substring(0, colonIndex).trim();
      const valuesStr = line.substring(colonIndex + 1).trim();
      const values = valuesStr
        .split(/[,\s]+/)
        .map(Number)
        .filter(n => !isNaN(n) && isFinite(n) && Number.isInteger(n));

      if (values.length === 0) {
        return {
          success: false,
          data: null,
          error: `"${label}" 데이터에 유효한 정수가 없습니다.`
        };
      }

      // 라벨로 왼쪽/오른쪽 구분
      const lowerLabel = label.toLowerCase();
      if (lowerLabel.includes('왼쪽') || lowerLabel.includes('left') || lowerLabel === '남학생') {
        leftData = values;
        leftLabel = label;
      } else if (lowerLabel.includes('오른쪽') || lowerLabel.includes('right') || lowerLabel === '여학생') {
        rightData = values;
        rightLabel = label;
      } else {
        // 순서대로 할당
        if (leftData === null) {
          leftData = values;
          leftLabel = label;
        } else if (rightData === null) {
          rightData = values;
          rightLabel = label;
        }
      }
    }

    if (!leftData || !rightData) {
      return {
        success: false,
        data: null,
        error: '왼쪽과 오른쪽 데이터가 모두 필요합니다.'
      };
    }

    // 줄기-잎 데이터 생성
    const stemLeafData = this._generateStemLeaf(leftData, rightData);

    return {
      success: true,
      data: {
        leftLabel: leftLabel,
        rightLabel: rightLabel,
        leftData: leftData,
        rightData: rightData,
        stems: stemLeafData.stems,
        minStem: stemLeafData.minStem,
        maxStem: stemLeafData.maxStem
      },
      error: null
    };
  }

  /**
   * 두 그룹의 데이터로 줄기-잎 구조 생성
   * @param {number[]} leftData - 왼쪽 데이터
   * @param {number[]} rightData - 오른쪽 데이터
   * @returns {{ stems: Object[], minStem: number, maxStem: number }}
   */
  static _generateStemLeaf(leftData, rightData) {
    // 모든 데이터의 줄기 범위 계산
    const allData = [...leftData, ...rightData];
    const minVal = Math.min(...allData);
    const maxVal = Math.max(...allData);

    // 줄기 = 십의 자리 (예: 162 → 16)
    const minStem = Math.floor(minVal / 10);
    const maxStem = Math.floor(maxVal / 10);

    // 줄기별 잎 분류
    const stems = [];
    for (let stem = minStem; stem <= maxStem; stem++) {
      const leftLeaves = leftData
        .filter(n => Math.floor(n / 10) === stem)
        .map(n => n % 10)
        .sort((a, b) => b - a); // 내림차순 (오른쪽으로 정렬)

      const rightLeaves = rightData
        .filter(n => Math.floor(n / 10) === stem)
        .map(n => n % 10)
        .sort((a, b) => a - b); // 오름차순

      stems.push({
        stem: stem,
        leftLeaves: leftLeaves,
        rightLeaves: rightLeaves
      });
    }

    return {
      stems: stems,
      minStem: minStem,
      maxStem: maxStem
    };
  }

  /**
   * 파서 타입 반환
   * @returns {string}
   */
  static getType() {
    return CONFIG.TABLE_TYPES.STEM_LEAF;
  }
}

export default StemLeafParser;

/**
 * 기본 테이블 파서 (구 이원 분류표)
 * 행(카테고리) × 열(그룹) 형식의 교차 분류 데이터를 파싱
 */

import CONFIG from '../../config.js';

class BasicTableParser {
  /**
   * 입력 문자열을 기본 테이블 데이터로 파싱
   * @param {string} input - 여러 줄의 "행이름: 값들" 형식 문자열
   * @returns {{ success: boolean, data: Object|null, error: string|null }}
   * @example
   * parse("헤더: 혈액형, 남학생, 여학생\nA: 0.4, 0.4\nB: 0.22, 0.2")
   * // { success: true, data: { rowLabelColumn: '혈액형', columnHeaders: ['남학생','여학생'], rows: [...], showTotal: true } }
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

    // 커스텀 병합 헤더 감지: 첫 줄이 "헤더:"로 시작하지 않고 ":"도 없으면 커스텀 라벨
    let mergedHeaderText = null;
    let startLineIndex = 0;
    const firstLine = lines[0];

    if (!firstLine.toLowerCase().startsWith('헤더:') && !firstLine.includes(':')) {
      mergedHeaderText = firstLine;
      startLineIndex = 1;
    }

    // 남은 줄이 충분한지 확인
    const remainingLines = lines.slice(startLineIndex);
    if (remainingLines.length < 2) {
      return {
        success: false,
        data: null,
        error: '최소 헤더 1줄과 데이터 1줄이 필요합니다.'
      };
    }

    const result = {
      rowLabelColumn: '',    // 행 라벨 컬럼명 (혈액형)
      columnHeaders: [],     // 열 헤더 (남학생, 여학생)
      rowHeaders: [],        // 행 헤더 (A, B, AB, O)
      rows: [],              // 데이터 행
      showTotal: true,       // 합계 행 표시 여부
      mergedHeaderText       // 커스텀 병합 헤더 텍스트 (null이면 기본값 '상대도수')
    };

    for (let i = startLineIndex; i < lines.length; i++) {
      const line = lines[i];
      const colonIndex = line.indexOf(':');

      if (colonIndex === -1) {
        return {
          success: false,
          data: null,
          error: `${i + 1}번째 줄: "라벨: 값" 형식이 아닙니다.`
        };
      }

      const rawLabel = line.substring(0, colonIndex).trim();
      const valuesStr = line.substring(colonIndex + 1).trim();

      // null 문자열 → 실제 null (빈 셀)
      const label = rawLabel === 'null' ? null : rawLabel;

      if (rawLabel === '') {
        return {
          success: false,
          data: null,
          error: `${i + 1}번째 줄: 라벨이 비어있습니다.`
        };
      }

      // 첫 번째 데이터 줄: 헤더 (첫 값 = 행 라벨 컬럼명, 나머지 = 열 헤더)
      if (i === startLineIndex && rawLabel.toLowerCase() === '헤더') {
        const allHeaders = valuesStr.split(',').map(v => {
          const trimmed = v.trim();
          // null 문자열 → 실제 null (빈 셀)
          return trimmed === 'null' ? null : trimmed;
        }).filter(v => v !== ''); // 빈 문자열만 필터링, null은 유지
        if (allHeaders.length < 2) {
          return {
            success: false,
            data: null,
            error: '헤더는 최소 2개 이상 필요합니다. (행 라벨명, 열 헤더들)'
          };
        }
        // 첫 번째 값은 행 라벨 컬럼명, 나머지는 열 헤더
        result.rowLabelColumn = allHeaders[0];

        // 열 헤더 파싱 (colSpan 지원: "도수*2" → { text: '도수', colSpan: 2 })
        let totalDataColumns = 0;
        result.columnHeaders = allHeaders.slice(1).map(header => {
          if (header === null) {
            totalDataColumns += 1;
            return { text: null, colSpan: 1 };
          }
          const colSpanMatch = header.match(/^(.+)\*(\d+)$/);
          if (colSpanMatch) {
            const colSpan = parseInt(colSpanMatch[2], 10);
            totalDataColumns += colSpan;
            return { text: colSpanMatch[1], colSpan };
          }
          totalDataColumns += 1;
          return { text: header, colSpan: 1 };
        });
        result.totalDataColumns = totalDataColumns;
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

        // 열 헤더가 있으면 개수 확인 (totalDataColumns = colSpan 합계)
        const expectedColumns = result.totalDataColumns || result.columnHeaders.length;
        if (expectedColumns > 0 && values.length !== expectedColumns) {
          return {
            success: false,
            data: null,
            error: `${i + 1}번째 줄: 값 개수(${values.length})가 열 개수(${expectedColumns})와 일치하지 않습니다.`
          };
        }

        result.rowHeaders.push(label);
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

    // 열 헤더가 없으면 자동 생성
    if (result.columnHeaders.length === 0) {
      const columnCount = result.rows[0].values.length;
      result.columnHeaders = Array.from({ length: columnCount }, (_, i) =>
        ({ text: `열${i + 1}`, colSpan: 1 })
      );
      result.totalDataColumns = columnCount;
    }

    // 행 라벨 컬럼명이 없으면 기본값 (null은 빈칸이므로 유지)
    if (result.rowLabelColumn === undefined || result.rowLabelColumn === '') {
      result.rowLabelColumn = '구분';
    }

    // 합계 계산 - totalDataColumns 기준
    const totals = [];
    const dataColumnCount = result.totalDataColumns || result.rows[0]?.values.length || 0;
    for (let col = 0; col < dataColumnCount; col++) {
      let sum = 0;
      let allNumbers = true;
      for (const row of result.rows) {
        if (typeof row.values[col] === 'number') {
          sum += row.values[col];
        } else {
          allNumbers = false;
          break;
        }
      }
      // 상대도수 합계는 1로 표시 (0.95 ~ 1.05 범위면 1로 반올림)
      if (allNumbers && sum >= 0.95 && sum <= 1.05) {
        totals.push(1);
      } else {
        totals.push(allNumbers ? Math.round(sum * 100) / 100 : '-');
      }
    }
    result.totals = totals;

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
    return CONFIG.TABLE_TYPES.BASIC_TABLE;
  }
}

export default BasicTableParser;

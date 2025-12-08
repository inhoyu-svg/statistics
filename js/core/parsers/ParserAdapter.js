/**
 * 파서 어댑터
 * 각 파서의 출력을 공통 인터페이스(ParsedTableData)로 변환
 *
 * @typedef {Object} Cell
 * @property {any} value - 셀 값
 * @property {Object} [metadata] - 셀 메타데이터 (옵션)
 *
 * @typedef {Object} Row
 * @property {string} label - 행 라벨
 * @property {Cell[]} cells - 셀 배열
 *
 * @typedef {Object} ParsedTableData
 * @property {string} type - 테이블 타입
 * @property {string[]} headers - 헤더 배열
 * @property {Row[]} rows - 행 배열
 * @property {number} rowCount - 행 개수
 * @property {number} columnCount - 열 개수
 * @property {Object} metadata - 타입별 추가 데이터
 */

import CONFIG from '../../config.js';

class ParserAdapter {
  /**
   * 파서 출력을 공통 형식으로 변환
   * @param {string} type - 테이블 타입
   * @param {Object} parseResult - 파서 출력 결과 (parseResult.data)
   * @param {Object} [options={}] - 변환 옵션
   * @returns {ParsedTableData}
   */
  static adapt(type, parseResult, options = {}) {
    // parseResult가 { success, data, error } 형식인 경우 data 추출
    const data = parseResult?.data ?? parseResult;

    if (!data) {
      throw new Error('어댑터 변환 실패: 데이터가 없습니다.');
    }

    switch (type) {
      case CONFIG.TABLE_TYPES.STEM_LEAF:
        return this._adaptStemLeaf(data, options);

      case CONFIG.TABLE_TYPES.CATEGORY_MATRIX:
        return this._adaptCategoryMatrix(data, options);

      case CONFIG.TABLE_TYPES.CROSS_TABLE:
        return this._adaptCrossTable(data, options);

      case CONFIG.TABLE_TYPES.FREQUENCY:
        // 도수분포표는 별도 메서드 사용 (processor.js에서 계급 생성 후 호출)
        throw new Error('도수분포표는 adaptFrequencyClasses() 메서드를 사용하세요.');

      default:
        throw new Error(`지원하지 않는 테이블 타입: ${type}`);
    }
  }

  /**
   * 줄기-잎 그림 데이터 변환
   * @param {Object} data - StemLeafParser 출력
   * @param {Object} options - 변환 옵션
   * @returns {ParsedTableData}
   * @private
   */
  static _adaptStemLeaf(data, options = {}) {
    const { isSingleMode, stems, leftLabel, rightLabel, minStem, maxStem } = data;

    if (isSingleMode) {
      // 단일 모드: [줄기, 잎]
      const headers = ['줄기', '잎'];
      const rows = stems.map(stemData => ({
        label: String(stemData.stem),
        cells: [
          { value: stemData.stem },
          {
            value: stemData.leaves.join(' '),
            metadata: {
              leaves: stemData.leaves,
              leafCount: stemData.leaves.length
            }
          }
        ]
      }));

      // 최대 잎 개수 계산 (동적 너비용)
      const maxLeafCount = Math.max(...stems.map(s => s.leaves.length));

      return {
        type: CONFIG.TABLE_TYPES.STEM_LEAF,
        headers,
        rows,
        rowCount: rows.length,
        columnCount: 2,
        metadata: {
          isSingleMode: true,
          minStem,
          maxStem,
          maxLeafCount
        }
      };
    } else {
      // 비교 모드: [왼쪽 잎, 줄기, 오른쪽 잎]
      const headers = [leftLabel || '왼쪽', '줄기', rightLabel || '오른쪽'];
      const rows = stems.map(stemData => ({
        label: String(stemData.stem),
        cells: [
          {
            value: stemData.leftLeaves.join(' '),
            metadata: {
              leaves: stemData.leftLeaves,
              leafCount: stemData.leftLeaves.length,
              isLeftSide: true
            }
          },
          { value: stemData.stem },
          {
            value: stemData.rightLeaves.join(' '),
            metadata: {
              leaves: stemData.rightLeaves,
              leafCount: stemData.rightLeaves.length,
              isLeftSide: false
            }
          }
        ]
      }));

      // 최대 잎 개수 계산
      const maxLeftLeafCount = Math.max(...stems.map(s => s.leftLeaves.length));
      const maxRightLeafCount = Math.max(...stems.map(s => s.rightLeaves.length));

      return {
        type: CONFIG.TABLE_TYPES.STEM_LEAF,
        headers,
        rows,
        rowCount: rows.length,
        columnCount: 3,
        metadata: {
          isSingleMode: false,
          leftLabel,
          rightLabel,
          minStem,
          maxStem,
          maxLeftLeafCount,
          maxRightLeafCount,
          maxLeafCount: Math.max(maxLeftLeafCount, maxRightLeafCount)
        }
      };
    }
  }

  /**
   * 카테고리 행렬 데이터 변환
   * @param {Object} data - CategoryMatrixParser 출력
   * @param {Object} options - 변환 옵션
   * @returns {ParsedTableData}
   * @private
   */
  static _adaptCategoryMatrix(data, options = {}) {
    const { headers, rows: rawRows } = data;

    // 첫 번째 열에 라벨 추가
    const fullHeaders = ['구분', ...headers];

    const rows = rawRows.map(row => ({
      label: row.label,
      cells: [
        { value: row.label },
        ...row.values.map(v => ({ value: v }))
      ]
    }));

    return {
      type: CONFIG.TABLE_TYPES.CATEGORY_MATRIX,
      headers: fullHeaders,
      rows,
      rowCount: rows.length,
      columnCount: fullHeaders.length,
      metadata: {
        originalHeaders: headers
      }
    };
  }

  /**
   * 이원 분류표 데이터 변환
   * @param {Object} data - CrossTableParser 출력
   * @param {Object} options - 변환 옵션
   * @returns {ParsedTableData}
   * @private
   */
  static _adaptCrossTable(data, options = {}) {
    const {
      rowLabelColumn,
      columnHeaders,
      rows: rawRows,
      showTotal,
      totals,
      mergedHeaderText
    } = data;

    // 헤더: [행라벨컬럼명, 열헤더들, (합계)]
    const fullHeaders = [rowLabelColumn, ...columnHeaders];
    if (showTotal) {
      fullHeaders.push('합계');
    }

    // 데이터 행 변환
    const rows = rawRows.map(row => {
      const cells = [
        { value: row.label },
        ...row.values.map(v => ({ value: v }))
      ];

      // 합계 열 추가
      if (showTotal) {
        const rowSum = row.values.reduce((sum, v) => {
          return typeof v === 'number' ? sum + v : sum;
        }, 0);
        // 상대도수면 반올림
        const total = rowSum >= 0.95 && rowSum <= 1.05 ? 1 : Math.round(rowSum * 100) / 100;
        cells.push({ value: total });
      }

      return {
        label: row.label,
        cells
      };
    });

    // 합계 행 추가
    if (showTotal && totals) {
      const totalRow = {
        label: '합계',
        cells: [
          { value: '합계' },
          ...totals.map(v => ({ value: v })),
          { value: totals.reduce((sum, v) => typeof v === 'number' ? sum + v : sum, 0) }
        ]
      };
      rows.push(totalRow);
    }

    return {
      type: CONFIG.TABLE_TYPES.CROSS_TABLE,
      headers: fullHeaders,
      rows,
      rowCount: rows.length,
      columnCount: fullHeaders.length,
      metadata: {
        rowLabelColumn,
        columnHeaders,
        showTotal,
        mergedHeaderText,
        hasTotalRow: showTotal,
        originalTotals: totals
      }
    };
  }

  /**
   * 도수분포표 계급 데이터 변환
   * @param {Object[]} classes - processor.js에서 생성된 계급 배열
   * @param {number} total - 총 데이터 개수
   * @param {Object} [options={}] - 변환 옵션
   * @param {boolean[]} [options.visibleColumns] - 표시할 컬럼 여부
   * @returns {ParsedTableData}
   */
  static adaptFrequencyClasses(classes, total, options = {}) {
    const { visibleColumns } = options;

    // 기본 헤더
    const allHeaders = ['계급', '도수', '상대도수', '누적도수', '누적상대도수'];

    // visibleColumns가 있으면 필터링
    let headers = allHeaders;
    if (visibleColumns && Array.isArray(visibleColumns)) {
      headers = allHeaders.filter((_, i) => visibleColumns[i] !== false);
    }

    // 누적값 계산
    let cumulativeFrequency = 0;
    let cumulativeRelative = 0;

    const rows = classes.map(cls => {
      cumulativeFrequency += cls.frequency;
      const relativeFrequency = cls.frequency / total;
      cumulativeRelative += relativeFrequency;

      // 모든 셀 데이터
      const allCells = [
        { value: `${cls.min}~${cls.max}`, metadata: { min: cls.min, max: cls.max } },
        { value: cls.frequency },
        { value: Math.round(relativeFrequency * 1000) / 1000 }, // 소수점 3자리
        { value: cumulativeFrequency },
        { value: Math.round(cumulativeRelative * 1000) / 1000 }
      ];

      // visibleColumns가 있으면 필터링
      let cells = allCells;
      if (visibleColumns && Array.isArray(visibleColumns)) {
        cells = allCells.filter((_, i) => visibleColumns[i] !== false);
      }

      return {
        label: `${cls.min}~${cls.max}`,
        cells
      };
    });

    return {
      type: CONFIG.TABLE_TYPES.FREQUENCY,
      headers,
      rows,
      rowCount: rows.length,
      columnCount: headers.length,
      metadata: {
        total,
        classCount: classes.length,
        visibleColumns,
        allHeaders
      }
    };
  }
}

export default ParserAdapter;

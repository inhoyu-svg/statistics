/**
 * 테이블 저장소
 * 테이블의 셀 변수, 합계 행, 병합 헤더 등 표시 설정을 관리
 */

import CONFIG from '../config.js';

/**
 * @class TableStore
 * @description 테이블 관련 설정을 저장하는 저장소
 */
class TableStore {
  constructor() {
    this.cellVariables = new Map();          // 셀 변수 치환 정보
    this.summaryRowVisible = new Map();      // 테이블별 합계 행 표시 여부
    this.mergedHeaderVisible = new Map();    // 테이블별 병합 헤더 표시 여부 (basic-table)
  }

  // =============================================
  // 셀 변수 치환 관련 메서드
  // =============================================

  /**
   * 셀 변수 키 생성
   * @param {string} tableId - 테이블 ID
   * @param {number} rowIndex - 행 인덱스
   * @param {number} colIndex - 열 인덱스
   * @returns {string} 고유 키
   */
  _getCellKey(tableId, rowIndex, colIndex) {
    return `${tableId}-${rowIndex}-${colIndex}`;
  }

  /**
   * 셀에 변수 설정
   * @param {string} tableId - 테이블 ID
   * @param {number} rowIndex - 행 인덱스
   * @param {number} colIndex - 열 인덱스
   * @param {string} variableName - 변수명 (예: 'A', 'x')
   */
  setCellVariable(tableId, rowIndex, colIndex, variableName) {
    const key = this._getCellKey(tableId, rowIndex, colIndex);
    this.cellVariables.set(key, variableName);
  }

  /**
   * 셀의 변수 조회
   * @param {string} tableId - 테이블 ID
   * @param {number} rowIndex - 행 인덱스
   * @param {number} colIndex - 열 인덱스
   * @returns {string|null} 변수명 또는 null
   */
  getCellVariable(tableId, rowIndex, colIndex) {
    const key = this._getCellKey(tableId, rowIndex, colIndex);
    return this.cellVariables.get(key) || null;
  }

  /**
   * 셀의 변수 제거
   * @param {string} tableId - 테이블 ID
   * @param {number} rowIndex - 행 인덱스
   * @param {number} colIndex - 열 인덱스
   */
  removeCellVariable(tableId, rowIndex, colIndex) {
    const key = this._getCellKey(tableId, rowIndex, colIndex);
    this.cellVariables.delete(key);
  }

  /**
   * 특정 테이블의 모든 변수 제거
   * @param {string} tableId - 테이블 ID
   */
  clearAllVariables(tableId) {
    const prefix = `${tableId}-`;
    for (const key of this.cellVariables.keys()) {
      if (key.startsWith(prefix)) {
        this.cellVariables.delete(key);
      }
    }
  }

  /**
   * 모든 테이블의 변수 제거
   */
  clearAllTableVariables() {
    this.cellVariables.clear();
  }

  // =============================================
  // 합계 행 표시 관련 메서드
  // =============================================

  /**
   * 합계 행 표시 여부 설정
   * @param {string} tableId - 테이블 ID
   * @param {boolean} visible - 표시 여부
   */
  setSummaryRowVisible(tableId, visible) {
    this.summaryRowVisible.set(tableId, visible);
  }

  /**
   * 합계 행 표시 여부 조회
   * @param {string} tableId - 테이블 ID
   * @returns {boolean} 표시 여부 (기본값: CONFIG.TABLE_SHOW_SUMMARY_ROW)
   */
  getSummaryRowVisible(tableId) {
    if (this.summaryRowVisible.has(tableId)) {
      return this.summaryRowVisible.get(tableId);
    }
    return CONFIG.TABLE_SHOW_SUMMARY_ROW;
  }

  // =============================================
  // 병합 헤더 표시 관련 메서드 (basic-table 전용)
  // =============================================

  /**
   * 병합 헤더 표시 여부 설정 (basic-table)
   * @param {string} tableId - 테이블 ID
   * @param {boolean} visible - 표시 여부
   */
  setMergedHeaderVisible(tableId, visible) {
    this.mergedHeaderVisible.set(tableId, visible);
  }

  /**
   * 병합 헤더 표시 여부 조회 (basic-table)
   * @param {string} tableId - 테이블 ID
   * @returns {boolean} 표시 여부 (기본값: true)
   */
  getMergedHeaderVisible(tableId) {
    if (this.mergedHeaderVisible.has(tableId)) {
      return this.mergedHeaderVisible.get(tableId);
    }
    return true; // 기본값: 표시
  }

  /**
   * 기본값으로 초기화
   */
  reset() {
    this.cellVariables.clear();
    this.summaryRowVisible.clear();
    this.mergedHeaderVisible.clear();
  }
}

// Singleton 패턴으로 내보내기
export default new TableStore();

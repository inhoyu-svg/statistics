/**
 * 테이블 저장소
 * 도수분포표의 표시 설정을 관리
 */

import CONFIG from '../config.js';

/**
 * @class TableStore
 * @description 테이블 관련 설정(컬럼 표시, 순서, 라벨)을 저장하는 저장소
 */
class TableStore {
  constructor() {
    this.visibleColumns = [...CONFIG.TABLE_DEFAULT_VISIBLE_COLUMNS]; // 6개 컬럼 표시 여부
    this.columnOrder = [...CONFIG.TABLE_DEFAULT_COLUMN_ORDER];       // 컬럼 순서
    this.labels = null;                                               // 테이블 라벨
    this.columnAlignment = { ...CONFIG.TABLE_DEFAULT_ALIGNMENT };     // 컬럼별 정렬
  }

  /**
   * 테이블 설정 저장
   * @param {Array} visibleColumns - 표시할 컬럼 배열
   * @param {Array} columnOrder - 컬럼 순서 배열
   * @param {Object} labels - 테이블 라벨 객체
   */
  setConfig(visibleColumns, columnOrder, labels) {
    this.visibleColumns = visibleColumns;
    this.columnOrder = columnOrder;
    this.labels = labels;
  }

  /**
   * 테이블 설정 가져오기
   * @returns {Object} 테이블 설정 객체
   */
  getConfig() {
    return {
      visibleColumns: this.visibleColumns,
      columnOrder: this.columnOrder,
      labels: this.labels || CONFIG.DEFAULT_LABELS.table
    };
  }

  /**
   * 표시할 컬럼 설정
   * @param {Array} visibleColumns - 표시할 컬럼 배열
   */
  setVisibleColumns(visibleColumns) {
    this.visibleColumns = visibleColumns;
  }

  /**
   * 컬럼 순서 설정
   * @param {Array} columnOrder - 컬럼 순서 배열
   */
  setColumnOrder(columnOrder) {
    this.columnOrder = columnOrder;
  }

  /**
   * 테이블 라벨 설정
   * @param {Object} labels - 테이블 라벨 객체
   */
  setLabels(labels) {
    this.labels = labels;
  }

  /**
   * 컬럼 정렬 설정
   * @param {string} columnName - 컬럼 이름
   * @param {string} alignment - 정렬 방식 ('left', 'center', 'right')
   */
  setColumnAlignment(columnName, alignment) {
    this.columnAlignment[columnName] = alignment;
  }

  /**
   * 컬럼 정렬 가져오기
   * @param {string} columnName - 컬럼 이름
   * @returns {string} 정렬 방식
   */
  getColumnAlignment(columnName) {
    return this.columnAlignment[columnName] || 'center';
  }

  /**
   * 모든 컬럼 정렬 가져오기
   * @returns {Object} 컬럼별 정렬 객체
   */
  getAllAlignments() {
    return { ...this.columnAlignment };
  }

  /**
   * 기본값으로 초기화
   */
  reset() {
    this.visibleColumns = [...CONFIG.TABLE_DEFAULT_VISIBLE_COLUMNS];
    this.columnOrder = [...CONFIG.TABLE_DEFAULT_COLUMN_ORDER];
    this.labels = null;
    this.columnAlignment = { ...CONFIG.TABLE_DEFAULT_ALIGNMENT };
  }

  /**
   * JSON 형식으로 변환 (Export용)
   * @returns {Object} JSON 객체
   */
  toJSON() {
    return {
      visibleColumns: this.visibleColumns,
      columnOrder: this.columnOrder,
      labels: this.labels,
      columnAlignment: this.columnAlignment
    };
  }
}

// Singleton 패턴으로 내보내기
export default new TableStore();

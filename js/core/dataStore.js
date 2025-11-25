/**
 * 데이터 저장소
 * 공통 데이터(원본 데이터, 통계, 계급)를 중앙에서 관리
 */

/**
 * @class DataStore
 * @description 도수분포표의 공통 데이터를 저장하는 중앙 저장소
 */
class DataStore {
  constructor() {
    this.rawData = null;   // 원본 입력 데이터 배열
    this.stats = null;     // 통계 정보 객체
    this.classes = null;   // 계급 데이터 배열
  }

  /**
   * 데이터 저장
   * @param {Array} rawData - 원본 데이터
   * @param {Object} stats - 통계 정보
   * @param {Array} classes - 계급 배열
   */
  setData(rawData, stats, classes) {
    this.rawData = rawData;
    this.stats = stats;
    this.classes = classes;
  }

  /**
   * 모든 데이터 가져오기
   * @returns {Object} 저장된 모든 데이터
   */
  getData() {
    return {
      rawData: this.rawData,
      stats: this.stats,
      classes: this.classes
    };
  }

  /**
   * 원본 데이터 가져오기
   * @returns {Array} 원본 데이터
   */
  getRawData() {
    return this.rawData;
  }

  /**
   * 통계 정보 가져오기
   * @returns {Object} 통계 정보
   */
  getStats() {
    return this.stats;
  }

  /**
   * 계급 데이터 가져오기
   * @returns {Array} 계급 배열
   */
  getClasses() {
    return this.classes;
  }

  /**
   * 계급 데이터만 업데이트
   * @param {Array} classes - 계급 배열
   */
  setClasses(classes) {
    this.classes = classes;
  }

  /**
   * 저장소 초기화
   */
  clear() {
    this.rawData = null;
    this.stats = null;
    this.classes = null;
  }

  /**
   * 데이터가 존재하는지 확인
   * @returns {boolean} 데이터 존재 여부
   */
  hasData() {
    return this.rawData !== null && this.classes !== null;
  }

  /**
   * JSON 형식으로 변환 (Export용)
   * @returns {Object} JSON 객체
   */
  toJSON() {
    return {
      rawData: this.rawData,
      stats: this.stats,
      classes: this.classes,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * CSV 형식으로 변환 (Export용)
   * @returns {string} CSV 문자열
   */
  toCSV() {
    if (!this.classes) return '';

    const headers = ['계급', '계급값', '도수', '상대도수(%)', '누적도수', '누적상대도수(%)'];
    const rows = this.classes.map(c => [
      `${c.min} ~ ${c.max}`,
      c.midpoint,
      c.frequency,
      c.relativeFreq,
      c.cumulativeFreq,
      c.cumulativeRelFreq
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }
}

// Singleton 패턴으로 내보내기
export default new DataStore();

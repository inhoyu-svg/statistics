/**
 * 데이터 저장소
 * 여러 데이터셋과 공통 데이터를 중앙에서 관리
 */

import CONFIG from '../config.js';

/**
 * @class DataStore
 * @description 여러 데이터셋과 계급 정보를 저장하는 중앙 저장소
 */
class DataStore {
  constructor() {
    this.datasets = [];        // 여러 데이터셋 배열
    this.nextId = 1;           // 데이터셋 ID 자동 증가
    this.classes = null;       // 공통 계급 데이터 배열
  }

  /**
   * 데이터셋 추가
   * @param {string} name - 데이터셋 이름
   * @param {Array} data - 원본 데이터 배열
   * @param {string} preset - 색상 프리셋
   * @returns {Object} 추가된 데이터셋
   */
  addDataset(name, data, preset = 'default') {
    const dataset = {
      id: this.nextId++,
      name: name || `${CONFIG.DEFAULT_DATASET_NAME} ${this.nextId}`,
      data: data || [],
      preset: preset,
      stats: null,              // 통계 정보 (나중에 계산)
      frequencies: null,        // 도수 배열 (나중에 계산)
      relativeFreqs: null       // 상대도수 배열 (나중에 계산)
    };

    this.datasets.push(dataset);
    return dataset;
  }

  /**
   * 데이터셋 제거
   * @param {number} id - 데이터셋 ID
   * @returns {boolean} 제거 성공 여부
   */
  removeDataset(id) {
    const index = this.datasets.findIndex(d => d.id === id);
    if (index !== -1) {
      this.datasets.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 데이터셋 업데이트
   * @param {number} id - 데이터셋 ID
   * @param {Object} props - 업데이트할 속성 (name, data, preset 등)
   * @returns {Object|null} 업데이트된 데이터셋
   */
  updateDataset(id, props) {
    const dataset = this.datasets.find(d => d.id === id);
    if (dataset) {
      Object.assign(dataset, props);
      return dataset;
    }
    return null;
  }

  /**
   * 특정 데이터셋 가져오기
   * @param {number} id - 데이터셋 ID
   * @returns {Object|null} 데이터셋
   */
  getDataset(id) {
    return this.datasets.find(d => d.id === id) || null;
  }

  /**
   * 모든 데이터셋 가져오기
   * @returns {Array} 데이터셋 배열
   */
  getAllDatasets() {
    return this.datasets;
  }

  /**
   * 데이터셋 개수 가져오기
   * @returns {number} 데이터셋 개수
   */
  getDatasetCount() {
    return this.datasets.length;
  }

  /**
   * 공통 계급 데이터 설정
   * @param {Array} classes - 계급 배열
   */
  setClasses(classes) {
    this.classes = classes;
  }

  /**
   * 공통 계급 데이터 가져오기
   * @returns {Array} 계급 배열
   */
  getClasses() {
    return this.classes;
  }

  /**
   * 저장소 초기화
   */
  clear() {
    this.datasets = [];
    this.nextId = 1;
    this.classes = null;
  }

  /**
   * 데이터가 존재하는지 확인
   * @returns {boolean} 데이터 존재 여부
   */
  hasData() {
    return this.datasets.length > 0 && this.classes !== null;
  }

  /**
   * 첫 번째 데이터셋 가져오기 (하위 호환성)
   * @returns {Object|null} 첫 번째 데이터셋
   */
  getFirstDataset() {
    return this.datasets.length > 0 ? this.datasets[0] : null;
  }

  /**
   * 하위 호환성: 첫 번째 데이터셋의 원본 데이터 반환
   * @deprecated 대신 getFirstDataset().data 사용
   * @returns {Array|null} 원본 데이터
   */
  getRawData() {
    const first = this.getFirstDataset();
    return first ? first.data : null;
  }

  /**
   * 하위 호환성: 첫 번째 데이터셋의 통계 정보 반환
   * @deprecated 대신 getFirstDataset().stats 사용
   * @returns {Object|null} 통계 정보
   */
  getStats() {
    const first = this.getFirstDataset();
    return first ? first.stats : null;
  }

  /**
   * 하위 호환성: 전체 데이터 반환
   * @deprecated 대신 getFirstDataset(), getClasses() 사용
   * @returns {Object} 저장된 데이터
   */
  getData() {
    const first = this.getFirstDataset();
    return {
      rawData: first ? first.data : null,
      stats: first ? first.stats : null,
      classes: this.classes
    };
  }

  /**
   * 하위 호환성: 데이터 설정
   * @deprecated 대신 addDataset() 사용
   * @param {Array} rawData - 원본 데이터
   * @param {Object} stats - 통계 정보
   * @param {Array} classes - 계급 배열
   */
  setData(rawData, stats, classes) {
    // 기존 데이터 제거
    this.clear();

    // 새 데이터셋 추가
    const dataset = this.addDataset(CONFIG.DEFAULT_DATASET_NAME, rawData, 'default');
    dataset.stats = stats;

    // 계급 설정
    this.classes = classes;
  }

  /**
   * JSON 형식으로 변환 (Export용)
   * @returns {Object} JSON 객체
   */
  toJSON() {
    return {
      datasets: this.datasets.map(d => ({
        id: d.id,
        name: d.name,
        data: d.data,
        preset: d.preset,
        stats: d.stats
      })),
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

    // 헤더: 계급, 계급값, (데이터셋별 도수/상대도수)
    const headers = ['계급', '계급값'];
    this.datasets.forEach(d => {
      headers.push(`도수(${d.name})`);
      headers.push(`상대도수(${d.name})`);
    });

    // 행 데이터
    const rows = this.classes.map((c, i) => {
      const row = [`${c.min} ~ ${c.max}`, c.midpoint];

      this.datasets.forEach(d => {
        row.push(d.frequencies ? d.frequencies[i] : 0);
        row.push(d.relativeFreqs ? d.relativeFreqs[i] : 0);
      });

      return row;
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }
}

// Singleton 패턴으로 내보내기
export default new DataStore();

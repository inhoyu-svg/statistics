/**
 * 데이터셋 스토어
 * 여러 데이터셋의 상태를 독립적으로 관리
 */

import CONFIG from '../config.js';

class DatasetStore {
  constructor() {
    this.datasets = [];
    this.currentDatasetId = null;
    this.nextId = 1;
  }

  /**
   * 새 데이터셋 추가
   * @param {Object} options - 데이터셋 초기 설정
   * @returns {number} 생성된 데이터셋 ID
   */
  addDataset(options = {}) {
    const id = this.nextId++;
    const dataset = {
      id,
      name: `데이터셋 ${id}`,
      data: options.data || [],
      stats: options.stats || null,
      classes: options.classes || [],
      settings: {
        classCount: options.classCount || 5,
        classWidth: options.classWidth || null,
        colorPreset: options.colorPreset || 'default',
        showHistogram: options.showHistogram !== undefined ? options.showHistogram : true,
        showPolygon: options.showPolygon !== undefined ? options.showPolygon : true,
        showBarLabels: options.showBarLabels || false,
        showDashedLines: options.showDashedLines || false,
        showCallout: options.showCallout || false,
        calloutTemplate: options.calloutTemplate || '',
        xAxisLabel: options.xAxisLabel || '',
        yAxisLabel: options.yAxisLabel || '',
        dataType: options.dataType || 'relativeFrequency',
        showSuperscript: options.showSuperscript !== undefined ? options.showSuperscript : true
      },
      tableConfig: options.tableConfig || {
        visibleColumns: [...CONFIG.TABLE_DEFAULT_VISIBLE_COLUMNS],
        columnOrder: [...CONFIG.TABLE_DEFAULT_COLUMN_ORDER],
        labels: {},
        columnAlignment: {}
      },
      ellipsisInfo: options.ellipsisInfo || null,
      collapsed: false // 아코디언 접힌 상태
    };

    this.datasets.push(dataset);

    // 첫 번째 데이터셋이면 자동으로 현재 데이터셋으로 설정
    if (this.datasets.length === 1) {
      this.currentDatasetId = id;
    }

    return id;
  }

  /**
   * 데이터셋 가져오기
   * @param {number} id - 데이터셋 ID
   * @returns {Object|null} 데이터셋 객체
   */
  getDataset(id) {
    return this.datasets.find(ds => ds.id === id) || null;
  }

  /**
   * 현재 활성화된 데이터셋 가져오기
   * @returns {Object|null} 현재 데이터셋 객체
   */
  getCurrentDataset() {
    if (!this.currentDatasetId) return null;
    return this.getDataset(this.currentDatasetId);
  }

  /**
   * 현재 데이터셋 설정
   * @param {number} id - 데이터셋 ID
   */
  setCurrentDataset(id) {
    const dataset = this.getDataset(id);
    if (dataset) {
      this.currentDatasetId = id;
    }
  }

  /**
   * 데이터셋 업데이트
   * @param {number} id - 데이터셋 ID
   * @param {Object} updates - 업데이트할 속성들
   */
  updateDataset(id, updates) {
    const dataset = this.getDataset(id);
    if (!dataset) return;

    // 최상위 속성 업데이트
    Object.keys(updates).forEach(key => {
      if (key === 'settings' && typeof updates[key] === 'object') {
        // settings는 병합
        dataset.settings = { ...dataset.settings, ...updates.settings };
      } else if (key === 'tableConfig' && typeof updates[key] === 'object') {
        // tableConfig는 병합
        dataset.tableConfig = { ...dataset.tableConfig, ...updates.tableConfig };
      } else {
        dataset[key] = updates[key];
      }
    });
  }

  /**
   * 데이터셋 제거
   * @param {number} id - 데이터셋 ID
   */
  removeDataset(id) {
    const index = this.datasets.findIndex(ds => ds.id === id);
    if (index === -1) return;

    this.datasets.splice(index, 1);

    // 현재 데이터셋이 제거된 경우 다른 데이터셋으로 전환
    if (this.currentDatasetId === id) {
      this.currentDatasetId = this.datasets.length > 0 ? this.datasets[0].id : null;
    }
  }

  /**
   * 모든 데이터셋 제거 (첫 번째만 유지)
   */
  clearExtraDatasets() {
    if (this.datasets.length <= 1) return;

    this.datasets = this.datasets.slice(0, 1);
    this.currentDatasetId = this.datasets[0].id;
    this.nextId = 2;
  }

  /**
   * 모든 데이터셋 가져오기
   * @returns {Array} 데이터셋 배열
   */
  getAllDatasets() {
    return [...this.datasets];
  }

  /**
   * 데이터셋 개수
   * @returns {number} 데이터셋 개수
   */
  getCount() {
    return this.datasets.length;
  }

  /**
   * 데이터셋 존재 여부
   * @param {number} id - 데이터셋 ID
   * @returns {boolean} 존재 여부
   */
  hasDataset(id) {
    return this.datasets.some(ds => ds.id === id);
  }

  /**
   * 데이터셋 이름 변경
   * @param {number} id - 데이터셋 ID
   * @param {string} name - 새 이름
   */
  renameDataset(id, name) {
    const dataset = this.getDataset(id);
    if (dataset) {
      dataset.name = name;
    }
  }

  /**
   * 데이터셋 접기/펼치기 토글
   * @param {number} id - 데이터셋 ID
   */
  toggleCollapsed(id) {
    const dataset = this.getDataset(id);
    if (dataset) {
      dataset.collapsed = !dataset.collapsed;
    }
  }

  /**
   * 모든 데이터 초기화
   */
  reset() {
    this.datasets = [];
    this.currentDatasetId = null;
    this.nextId = 1;
  }
}

// 싱글톤 인스턴스 생성
const datasetStoreInstance = new DatasetStore();

export default datasetStoreInstance;

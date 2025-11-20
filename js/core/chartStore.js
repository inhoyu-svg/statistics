/**
 * 차트 저장소
 * 차트의 표시 설정을 관리
 */

import CONFIG from '../config.js';

/**
 * @class ChartStore
 * @description 차트 관련 설정(축 라벨, 중략 정보)을 저장하는 저장소
 */
class ChartStore {
  constructor() {
    this.axisLabels = null;   // X축, Y축 라벨
    this.ellipsisInfo = null; // 중략 표시 정보
    this.dataType = CONFIG.DEFAULT_CHART_DATA_TYPE; // 차트 데이터 타입
  }

  /**
   * 차트 설정 저장
   * @param {Object} axisLabels - 축 라벨 객체 {xAxis, yAxis}
   * @param {Object} ellipsisInfo - 중략 정보 객체 {show, firstDataIndex}
   */
  setConfig(axisLabels, ellipsisInfo) {
    this.axisLabels = axisLabels;
    this.ellipsisInfo = ellipsisInfo;
  }

  /**
   * 차트 설정 가져오기
   * @returns {Object} 차트 설정 객체
   */
  getConfig() {
    return {
      axisLabels: this.axisLabels || {
        xAxis: CONFIG.DEFAULT_LABELS.xAxis,
        yAxis: CONFIG.DEFAULT_LABELS.yAxis
      },
      ellipsisInfo: this.ellipsisInfo
    };
  }

  /**
   * 축 라벨 설정
   * @param {Object} axisLabels - 축 라벨 객체
   */
  setAxisLabels(axisLabels) {
    this.axisLabels = axisLabels;
  }

  /**
   * 중략 정보 설정
   * @param {Object} ellipsisInfo - 중략 정보 객체
   */
  setEllipsisInfo(ellipsisInfo) {
    this.ellipsisInfo = ellipsisInfo;
  }

  /**
   * 차트 데이터 타입 설정
   * @param {string} dataType - 데이터 타입 ('relativeFrequency', 'frequency', 등)
   */
  setDataType(dataType) {
    this.dataType = dataType;
  }

  /**
   * 차트 데이터 타입 가져오기
   * @returns {string} 데이터 타입
   */
  getDataType() {
    return this.dataType || CONFIG.DEFAULT_CHART_DATA_TYPE;
  }

  /**
   * 기본값으로 초기화
   */
  reset() {
    this.axisLabels = null;
    this.ellipsisInfo = null;
    this.dataType = CONFIG.DEFAULT_CHART_DATA_TYPE;
  }

  /**
   * JSON 형식으로 변환 (Export용)
   * @returns {Object} JSON 객체
   */
  toJSON() {
    return {
      axisLabels: this.axisLabels,
      ellipsisInfo: this.ellipsisInfo,
      dataType: this.dataType
    };
  }
}

// Singleton 패턴으로 내보내기
export default new ChartStore();

/**
 * 데이터 불러오기 (역직렬화)
 * JSON 데이터를 객체로 복원
 */

import CONFIG from '../../config.js';

class DataImporter {
  /**
   * JSON 데이터 불러오기 (기본값 복원)
   * @param {Object} jsonData - 경량화된 JSON 데이터
   * @returns {Object} 기본값이 복원된 데이터 객체
   * @description 생략된 필드에 기본값을 적용하여 완전한 데이터 구조 복원
   */
  static importData(jsonData) {
    const defaults = CONFIG.JSON_DEFAULTS;
    const version = jsonData.version || '3.0.0';

    // 차트 데이터 복원
    const chartRoot = jsonData.chart?.root
      ? this._deserializeLayer(jsonData.chart.root, defaults)
      : null;

    const chartTimeline = this._deserializeTimeline(jsonData.chart?.timeline, defaults);
    const chartConfig = this._deserializeConfig(jsonData.chart?.config, defaults);

    // 테이블 데이터 복원
    const tables = this._deserializeTables(jsonData.tables, defaults);

    return {
      version,
      chart: {
        root: chartRoot,
        timeline: chartTimeline,
        config: chartConfig
      },
      tables,
      // 원본 데이터 및 테이블 타입 (데이터셋 폼 복원용)
      rawData: jsonData.rawData || null,
      tableType: jsonData.tableType || 'frequency',
      // 커스텀 계급 범위 (설정된 경우에만)
      customRange: jsonData.customRange || null
    };
  }

  /**
   * 레이어 역직렬화 (기본값 적용)
   * @private
   */
  static _deserializeLayer(layerData, defaults) {
    return {
      id: layerData.id,
      name: layerData.name || layerData.id,
      type: layerData.type || 'group',
      visible: layerData.visible ?? defaults.layer.visible,
      order: layerData.order ?? defaults.layer.order,
      p_id: layerData.p_id ?? defaults.layer.p_id,
      color: layerData.color || null,
      children: (layerData.children || []).map(child => this._deserializeLayer(child, defaults)),
      data: layerData.data || {}
    };
  }

  /**
   * 애니메이션 역직렬화 (기본값 적용)
   * @private
   */
  static _deserializeAnimation(anim, defaults) {
    return {
      layerId: anim.layerId,
      startTime: anim.startTime ?? defaults.animation.startTime,
      duration: anim.duration ?? defaults.animation.duration,
      effect: anim.effect ?? defaults.animation.effect,
      effectOptions: anim.effectOptions || {},
      easing: anim.easing ?? defaults.animation.easing
    };
  }

  /**
   * 타임라인 역직렬화
   * @private
   */
  static _deserializeTimeline(timeline, defaults) {
    return {
      animations: (timeline?.animations || []).map(anim => this._deserializeAnimation(anim, defaults)),
      currentTime: timeline?.currentTime ?? defaults.timeline.currentTime,
      duration: timeline?.duration ?? defaults.timeline.duration
    };
  }

  /**
   * 차트 설정 역직렬화 (기본값 병합)
   * @private
   */
  static _deserializeConfig(config, defaults) {
    if (!config) return null;

    return {
      chartElements: {
        ...defaults.chartElements,
        ...config.chartElements
      },
      gridSettings: {
        ...defaults.gridSettings,
        ...config.gridSettings
      },
      axisLabelSettings: {
        ...defaults.axisLabelSettings,
        ...config.axisLabelSettings
      },
      colorPreset: config.colorPreset ?? defaults.colorPreset,
      coords: config.coords || null,
      axisLabels: config.axisLabels || null,
      dataType: config.dataType || null,
      ellipsisInfo: config.ellipsisInfo || null,
      canvasSize: config.canvasSize || null,
      tableData: config.tableData || null
    };
  }

  /**
   * 테이블 배열 역직렬화
   * @private
   */
  static _deserializeTables(tables, defaults) {
    if (!tables || !Array.isArray(tables)) {
      return [];
    }

    return tables.map(table => ({
      id: table.id,
      canvasId: table.canvasId,
      root: this._deserializeLayer(table.root, defaults),
      timeline: this._deserializeTimeline(table.timeline, defaults)
    }));
  }
}

export default DataImporter;

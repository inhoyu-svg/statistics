/**
 * 데이터 내보내기 (직렬화)
 * 차트 및 테이블 데이터를 JSON으로 변환
 */

import CONFIG from '../../config.js';

class DataExporter {
  /**
   * 차트 및 테이블 데이터를 JSON으로 내보내기
   * @param {Object} chartLayerManager - 차트 레이어 매니저 인스턴스
   * @param {Object} chartTimeline - 차트 타임라인 인스턴스
   * @param {Object} chartRenderer - 차트 렌더러 인스턴스 (좌표 시스템 정보)
   * @param {Array<Object>} tableRenderers - 테이블 렌더러 배열 (옵셔널)
   * @returns {Object} JSON 형식의 차트 및 테이블 데이터
   * @description 레이어 구조와 애니메이션 정보를 JSON으로 직렬화
   */
  static exportData(chartLayerManager, chartTimeline, chartRenderer = null, tableRenderers = []) {
    const defaults = CONFIG.JSON_DEFAULTS;

    // 차트 root 레이어 직렬화
    const chartRootLayer = chartLayerManager.root || chartLayerManager.rootLayer;
    if (!chartRootLayer) {
      throw new Error('Chart root layer not found');
    }

    const serializedChartRoot = this._serializeLayer(chartRootLayer, defaults);

    // 차트 타임라인 애니메이션 정보
    const chartAnimations = this._extractAnimations(chartTimeline, defaults);

    // 차트 설정 정보
    const chartConfig = this._buildChartConfig(chartRenderer, defaults);

    // 테이블 레이어 직렬화
    const tables = this._serializeTables(tableRenderers, defaults);

    // 차트 타임라인 구성
    const chartTimelineData = this._buildTimelineData(chartTimeline, chartAnimations, defaults);

    // 최종 결과 구성
    return this._buildResult(serializedChartRoot, chartTimelineData, chartConfig, tables);
  }

  /**
   * 레이어를 재귀적으로 직렬화 (기본값 생략)
   * @private
   */
  static _serializeLayer(layer, defaults) {
    // 필수 필드만 포함
    const serialized = {
      id: layer.id || 'unknown',
      name: layer.name || layer.id || 'Untitled',
      type: layer.type || 'group'
    };

    // 기본값과 다른 경우만 포함
    const visible = layer.visible !== undefined ? layer.visible : true;
    if (visible !== defaults.layer.visible) {
      serialized.visible = visible;
    }

    const order = layer.order !== undefined ? layer.order : 0;
    if (order !== defaults.layer.order) {
      serialized.order = order;
    }

    const p_id = layer.p_id || null;
    if (p_id !== defaults.layer.p_id) {
      serialized.p_id = p_id;
    }

    // 레이어별 색상 정보 추가
    this._addLayerColor(serialized, layer);

    // 레이어 데이터 추가 (비어있지 않은 경우만)
    if (layer.data && typeof layer.data === 'object' && Object.keys(layer.data).length > 0) {
      serialized.data = { ...layer.data };
    }

    // 자식 레이어 재귀 직렬화 (비어있지 않은 경우만)
    if (layer.children && Array.isArray(layer.children) && layer.children.length > 0) {
      serialized.children = layer.children.map(child => this._serializeLayer(child, defaults));
    }

    return serialized;
  }

  /**
   * 레이어별 색상 정보 추가
   * @private
   */
  static _addLayerColor(serialized, layer) {
    const currentPreset = CONFIG.POLYGON_COLOR_PRESETS[CONFIG.POLYGON_COLOR_PRESET] || CONFIG.POLYGON_COLOR_PRESETS.default;

    if (layer.id === 'polygon') {
      serialized.color = `linear-gradient(180deg, ${currentPreset.gradientStart} 0%, ${currentPreset.gradientEnd} 100%)`;
    } else if (layer.id === 'points') {
      serialized.color = currentPreset.pointColor;
    } else if (layer.id === 'lines') {
      serialized.color = `linear-gradient(180deg, ${currentPreset.gradientStart} 0%, ${currentPreset.gradientEnd} 100%)`;
    } else if (layer.id === 'histogram') {
      const barColorStart = CONFIG.getColor('--chart-bar-color');
      const barColorEnd = CONFIG.getColor('--chart-bar-color-end');
      serialized.color = `linear-gradient(180deg, ${barColorStart} 0%, ${barColorEnd} 100%)`;
    } else if (layer.id === 'dashed-lines') {
      serialized.color = CONFIG.getColor('--chart-dashed-line-color');
    }
  }

  /**
   * 타임라인에서 애니메이션 추출
   * @private
   */
  static _extractAnimations(timeline, defaults) {
    let animations = [];

    if (timeline.animations instanceof Map) {
      animations = Array.from(timeline.animations.entries())
        .map(([layerId, anim]) => this._normalizeAnimation(anim, layerId, defaults));
    } else if (Array.isArray(timeline.animations)) {
      animations = timeline.animations.map(anim => this._normalizeAnimation(anim, null, defaults));
    } else if (Array.isArray(timeline.timeline)) {
      animations = timeline.timeline.map(anim => this._normalizeAnimation(anim, null, defaults));
    }

    return animations;
  }

  /**
   * 애니메이션 객체 정규화 (기본값 생략)
   * @private
   */
  static _normalizeAnimation(anim, layerId, defaults) {
    const result = {
      layerId: layerId || anim.layerId
    };

    const startTime = anim.startTime || 0;
    if (startTime !== defaults.animation.startTime) {
      result.startTime = startTime;
    }

    const duration = anim.duration || 1000;
    if (duration !== defaults.animation.duration) {
      result.duration = duration;
    }

    const effect = anim.effect || 'auto';
    if (effect !== defaults.animation.effect) {
      result.effect = effect;
    }

    // effectOptions: 비어있지 않은 경우만 포함
    if (anim.effectOptions && Object.keys(anim.effectOptions).length > 0) {
      result.effectOptions = anim.effectOptions;
    }

    const easing = anim.easing || 'linear';
    if (easing !== defaults.animation.easing) {
      result.easing = easing;
    }

    return result;
  }

  /**
   * 차트 설정 정보 빌드
   * @private
   */
  static _buildChartConfig(chartRenderer, defaults) {
    if (!chartRenderer) return {};

    const chartConfig = {};

    // 좌표 시스템 정보
    if (chartRenderer.currentCoords) {
      chartConfig.coords = {
        xScale: chartRenderer.currentCoords.xScale,
        chartH: chartRenderer.currentCoords.chartH,
        gridDivisions: chartRenderer.currentCoords.gridDivisions,
        adjustedMaxY: chartRenderer.currentCoords.adjustedMaxY
      };
    }

    // 축 라벨
    if (chartRenderer.currentAxisLabels) {
      chartConfig.axisLabels = chartRenderer.currentAxisLabels;
    }

    // 데이터 타입
    if (chartRenderer.currentDataType) {
      chartConfig.dataType = chartRenderer.currentDataType;
    }

    // 중략 정보
    if (chartRenderer.currentEllipsisInfo) {
      chartConfig.ellipsisInfo = chartRenderer.currentEllipsisInfo;
    }

    // 차트 요소 표시 설정
    this._addChartElements(chartConfig, defaults);

    // 격자선 설정
    this._addGridSettings(chartConfig, defaults);

    // 축 라벨 설정
    this._addAxisLabelSettings(chartConfig, defaults);

    // 색상 프리셋 정보
    if (CONFIG.POLYGON_COLOR_PRESET !== defaults.colorPreset) {
      chartConfig.colorPreset = CONFIG.POLYGON_COLOR_PRESET;
    }

    // 캔버스 크기
    if (chartRenderer.canvas) {
      chartConfig.canvasSize = {
        width: chartRenderer.canvas.width,
        height: chartRenderer.canvas.height
      };
    }

    // 테이블 데이터
    if (chartRenderer.currentClasses && chartRenderer.currentTableConfig) {
      const total = chartRenderer.currentClasses.reduce((sum, c) => sum + c.frequency, 0);
      chartConfig.tableData = {
        classes: chartRenderer.currentClasses,
        total: total,
        config: chartRenderer.currentTableConfig
      };
    }

    return chartConfig;
  }

  /**
   * 차트 요소 표시 설정 추가
   * @private
   */
  static _addChartElements(chartConfig, defaults) {
    const chartElements = {};
    if (CONFIG.SHOW_HISTOGRAM !== defaults.chartElements.showHistogram) {
      chartElements.showHistogram = CONFIG.SHOW_HISTOGRAM;
    }
    if (CONFIG.SHOW_POLYGON !== defaults.chartElements.showPolygon) {
      chartElements.showPolygon = CONFIG.SHOW_POLYGON;
    }
    if (CONFIG.SHOW_BAR_LABELS !== defaults.chartElements.showBarLabels) {
      chartElements.showBarLabels = CONFIG.SHOW_BAR_LABELS;
    }
    if (CONFIG.SHOW_DASHED_LINES !== defaults.chartElements.showDashedLines) {
      chartElements.showDashedLines = CONFIG.SHOW_DASHED_LINES;
    }
    if (Object.keys(chartElements).length > 0) {
      chartConfig.chartElements = chartElements;
    }
  }

  /**
   * 격자선 설정 추가
   * @private
   */
  static _addGridSettings(chartConfig, defaults) {
    const gridSettings = {};
    if (CONFIG.GRID_SHOW_HORIZONTAL !== defaults.gridSettings.showHorizontal) {
      gridSettings.showHorizontal = CONFIG.GRID_SHOW_HORIZONTAL;
    }
    if (CONFIG.GRID_SHOW_VERTICAL !== defaults.gridSettings.showVertical) {
      gridSettings.showVertical = CONFIG.GRID_SHOW_VERTICAL;
    }
    if (Object.keys(gridSettings).length > 0) {
      chartConfig.gridSettings = gridSettings;
    }
  }

  /**
   * 축 라벨 설정 추가
   * @private
   */
  static _addAxisLabelSettings(chartConfig, defaults) {
    const axisLabelSettings = {};
    if (CONFIG.AXIS_SHOW_Y_LABELS !== defaults.axisLabelSettings.showYLabels) {
      axisLabelSettings.showYLabels = CONFIG.AXIS_SHOW_Y_LABELS;
    }
    if (CONFIG.AXIS_SHOW_X_LABELS !== defaults.axisLabelSettings.showXLabels) {
      axisLabelSettings.showXLabels = CONFIG.AXIS_SHOW_X_LABELS;
    }
    if (Object.keys(axisLabelSettings).length > 0) {
      chartConfig.axisLabelSettings = axisLabelSettings;
    }
  }

  /**
   * 테이블 렌더러 배열 직렬화
   * @private
   */
  static _serializeTables(tableRenderers, defaults) {
    const tables = [];

    if (!tableRenderers || tableRenderers.length === 0) {
      return tables;
    }

    tableRenderers.forEach((tableRenderer, index) => {
      try {
        const tableLayerManager = tableRenderer.getLayerManager();
        const tableTimeline = tableRenderer.timeline;

        if (!tableLayerManager) {
          console.warn(`테이블 ${index + 1} LayerManager를 찾을 수 없습니다.`);
          return;
        }

        const tableRootLayer = tableLayerManager.root || tableLayerManager.rootLayer;
        if (!tableRootLayer) {
          console.warn(`테이블 ${index + 1} root 레이어를 찾을 수 없습니다.`);
          return;
        }

        const serializedTableRoot = this._serializeLayer(tableRootLayer, defaults);

        // 테이블 타임라인 애니메이션 정보
        const tableAnimations = tableTimeline ? this._extractAnimations(tableTimeline, defaults) : [];

        // 테이블 데이터 구성
        const tableData = {
          id: tableRenderer.tableId || `table-${index + 1}`,
          canvasId: tableRenderer.canvasId || `frequencyTable-${index + 1}`,
          root: serializedTableRoot
        };

        // 타임라인 추가
        const tableTimelineData = this._buildTimelineData(tableTimeline, tableAnimations, defaults);
        if (Object.keys(tableTimelineData).length > 0) {
          tableData.timeline = tableTimelineData;
        }

        tables.push(tableData);
      } catch (error) {
        console.error(`테이블 ${index + 1} 직렬화 오류:`, error);
      }
    });

    return tables;
  }

  /**
   * 타임라인 데이터 빌드
   * @private
   */
  static _buildTimelineData(timeline, animations, defaults) {
    const timelineData = {};

    if (animations && animations.length > 0) {
      timelineData.animations = animations;
    }

    if (timeline) {
      const currentTime = timeline.currentTime || 0;
      if (currentTime !== defaults.timeline.currentTime) {
        timelineData.currentTime = currentTime;
      }

      const duration = timeline.duration || 0;
      if (duration !== defaults.timeline.duration) {
        timelineData.duration = duration;
      }
    }

    return timelineData;
  }

  /**
   * 최종 결과 객체 빌드
   * @private
   */
  static _buildResult(chartRoot, timelineData, chartConfig, tables) {
    const result = {
      version: '4.0.0',
      chart: {
        root: chartRoot
      }
    };

    // 타임라인 (비어있지 않은 경우만 포함)
    if (Object.keys(timelineData).length > 0) {
      result.chart.timeline = timelineData;
    }

    // config (비어있지 않은 경우만 포함)
    if (Object.keys(chartConfig).length > 0) {
      result.chart.config = chartConfig;
    }

    // 테이블 (비어있지 않은 경우만 포함)
    if (tables.length > 0) {
      result.tables = tables;
    }

    return result;
  }
}

export default DataExporter;

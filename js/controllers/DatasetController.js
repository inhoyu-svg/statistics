/**
 * 데이터셋 컨트롤러
 * 데이터셋 섹션 생성/삭제/입력값 관리
 */

import CONFIG from '../config.js';
import MessageManager from '../utils/message.js';
import DatasetStore from '../core/datasetStore.js';

/**
 * @class DatasetController
 * @description 데이터셋 CRUD 관리
 */
class DatasetController {
  /**
   * @param {FrequencyDistributionApp} app - 메인 애플리케이션 인스턴스
   */
  constructor(app) {
    this.app = app;
  }

  /**
   * 데이터셋 섹션 생성
   * @param {number} datasetId - 데이터셋 ID
   */
  createDatasetSection(datasetId) {
    const template = document.getElementById('datasetSectionTemplate');
    if (!template) {
      console.error('데이터셋 템플릿을 찾을 수 없습니다.');
      return;
    }

    // 템플릿 복제
    const section = template.content.cloneNode(true);
    const details = section.querySelector('.dataset-section');

    // 데이터셋 ID 설정
    details.setAttribute('data-dataset-id', datasetId);

    // 제목 설정
    const title = section.querySelector('.dataset-title');
    title.innerHTML = `<span class="dataset-color-indicator" data-color="default"></span>📊 데이터셋 ${datasetId}`;

    // 색상 인디케이터 요소 다시 찾기
    const indicator = title.querySelector('.dataset-color-indicator');

    // 색상 프리셋 라디오 버튼에 name 속성 설정 및 이벤트 리스너 추가
    const colorRadios = section.querySelectorAll('.dataset-polygon-color');
    colorRadios.forEach(radio => {
      radio.name = `polygonColor-${datasetId}`;

      // 색상 변경 이벤트 리스너
      radio.addEventListener('change', (e) => {
        if (indicator) {
          indicator.setAttribute('data-color', e.target.value);
        }
      });
    });

    // 히스토그램 색상 프리셋 라디오 버튼에 name 속성 설정
    const histColorRadios = section.querySelectorAll('.dataset-histogram-color');
    histColorRadios.forEach(radio => {
      radio.name = `histogramColor-${datasetId}`;
    });

    // 삭제 버튼 이벤트 리스너
    const removeBtn = section.querySelector('.dataset-remove-btn');
    removeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.removeDatasetSection(datasetId);
    });

    // 테이블 타입 변경 이벤트 리스너
    const tableTypeSelect = section.querySelector('.dataset-table-type');
    tableTypeSelect?.addEventListener('change', (e) => {
      this.onTableTypeChange(details, e.target.value);
    });

    // 아코디언 컨테이너에 추가
    const accordion = document.getElementById('datasetsAccordion');
    accordion?.appendChild(section);

    // DatasetStore에 데이터셋 추가
    DatasetStore.addDataset({ id: datasetId });
  }

  /**
   * 테이블 타입 변경 시 UI 업데이트
   * @param {HTMLElement} section - 데이터셋 섹션 요소
   * @param {string} tableType - 선택된 테이블 타입
   */
  onTableTypeChange(section, tableType) {
    // 타입 정보 가져오기
    const typeInfo = CONFIG.TABLE_TYPE_INFO[tableType];
    if (!typeInfo) return;

    // 힌트 텍스트 업데이트
    const hintElement = section.querySelector('.dataset-type-hint');
    if (hintElement) {
      hintElement.innerHTML = `💡 ${typeInfo.hint}`;
    }

    // 데이터 입력 필드 placeholder 및 기본 데이터 업데이트
    const dataInput = section.querySelector('.dataset-data-input');
    if (dataInput) {
      dataInput.placeholder = typeInfo.placeholder;
      // 타입 변경 시 해당 타입의 기본 데이터로 교체
      if (typeInfo.defaultData) {
        dataInput.value = typeInfo.defaultData;
      }
    }

    // 도수분포표 전용 옵션 표시/숨김
    const frequencyOnlyOptions = section.querySelectorAll('.frequency-only-options');
    const isFrequency = tableType === CONFIG.TABLE_TYPES.FREQUENCY;

    frequencyOnlyOptions.forEach(option => {
      if (isFrequency) {
        option.classList.remove('hidden');
      } else {
        option.classList.add('hidden');
      }
    });
  }

  /**
   * 데이터셋 섹션 제거
   * @param {number} datasetId - 제거할 데이터셋 ID
   */
  removeDatasetSection(datasetId) {
    // 최소 1개는 유지
    if (DatasetStore.getCount() <= 1) {
      MessageManager.warning('최소 1개의 데이터셋이 필요합니다.');
      return;
    }

    // DOM에서 제거
    const section = document.querySelector(`.dataset-section[data-dataset-id="${datasetId}"]`);
    section?.remove();

    // DatasetStore에서 제거
    DatasetStore.removeDataset(datasetId);

    // 테이블 제거 (해당 ID의 테이블이 있으면)
    this.removeTableByDatasetId(datasetId);

    MessageManager.success('데이터셋이 제거되었습니다.');
  }

  /**
   * 데이터셋 ID로 테이블 제거
   * @param {number} datasetId - 데이터셋 ID
   */
  removeTableByDatasetId(datasetId) {
    const tableId = datasetId === 1 ? 'frequencyTable' : `frequencyTable-${datasetId}`;
    const tableCanvas = document.getElementById(tableId);
    const tableSection = tableCanvas?.closest('.table-section-item');
    tableSection?.remove();

    // tableRenderers 배열에서도 제거
    const rendererIndex = this.app.tableRenderers.findIndex(r => r.canvasId === tableId);
    if (rendererIndex !== -1) {
      this.app.tableRenderers.splice(rendererIndex, 1);
    }
  }

  /**
   * 새 데이터셋 추가 (섹션만 생성, 렌더링 안 함)
   */
  addDatasetAndGenerate() {
    // 다음 데이터셋 ID 계산
    const nextId = DatasetStore.getCount() + 1;

    // 새 데이터셋 섹션 생성
    this.createDatasetSection(nextId);

    // 렌더링은 하지 않음 - 사용자가 "도수분포표 생성" 버튼 클릭 시 렌더링
  }

  /**
   * 데이터셋 입력값 읽기
   * @param {number} datasetId - 데이터셋 ID
   * @returns {Object|null} 데이터셋 입력값 객체 또는 null
   */
  getDatasetInputValues(datasetId) {
    const section = document.querySelector(`.dataset-section[data-dataset-id="${datasetId}"]`);
    if (!section) return null;

    try {
      // 테이블 타입
      const tableTypeSelect = section.querySelector('.dataset-table-type');
      const tableType = tableTypeSelect?.value || CONFIG.TABLE_TYPES.FREQUENCY;

      // 데이터 입력
      const dataInput = section.querySelector('.dataset-data-input');
      const rawData = dataInput?.value.trim();
      if (!rawData) {
        return null; // 빈 데이터는 null 반환
      }

      // 계급 설정
      const classCountInput = section.querySelector('.dataset-class-count');
      const classWidthInput = section.querySelector('.dataset-class-width');
      const classCount = parseInt(classCountInput?.value) || 5;
      const classWidth = classWidthInput?.value ? parseFloat(classWidthInput.value) : null;

      // 차트 표시 옵션
      const showHistogram = section.querySelector('.dataset-show-histogram')?.checked ?? true;
      const showPolygon = section.querySelector('.dataset-show-polygon')?.checked ?? true;
      const showSuperscript = section.querySelector('.dataset-show-superscript')?.checked ?? true;
      const showBarLabels = section.querySelector('.dataset-show-bar-labels')?.checked ?? false;
      const showDashedLines = section.querySelector('.dataset-show-dashed-lines')?.checked ?? false;
      const showTriangles = section.querySelector('.dataset-show-triangles')?.checked ?? false;
      const triangleBoundaryValue = parseFloat(section.querySelector('.dataset-triangle-boundary')?.value);
      const triangleBoundary = isNaN(triangleBoundaryValue) ? null : triangleBoundaryValue;
      const showCallout = section.querySelector('.dataset-show-callout')?.checked ?? false;

      // 색상 프리셋
      const colorRadio = section.querySelector('.dataset-polygon-color:checked');
      const colorPreset = colorRadio?.value || 'default';

      // 히스토그램 색상 프리셋
      const histColorRadio = section.querySelector('.dataset-histogram-color:checked');
      const histogramColorPreset = histColorRadio?.value || 'default';

      // 말풍선 템플릿
      const calloutTemplateInput = section.querySelector('.dataset-callout-template');
      const calloutTemplate = calloutTemplateInput?.value || '';

      return {
        datasetId,
        tableType,
        rawData,
        classCount,
        classWidth,
        settings: {
          showHistogram,
          showPolygon,
          showSuperscript,
          showBarLabels,
          showDashedLines,
          showTriangles,
          triangleBoundary,
          showCallout,
          calloutTemplate,
          colorPreset,
          histogramColorPreset
        }
      };
    } catch (error) {
      console.error(`데이터셋 ${datasetId} 입력값 읽기 오류:`, error);
      return null;
    }
  }

  /**
   * 모든 데이터셋의 입력값 읽기
   * @returns {Array} 데이터셋 입력값 배열 (빈 데이터는 제외)
   */
  getAllDatasetInputValues() {
    const datasets = DatasetStore.getAllDatasets();
    const results = [];

    for (const dataset of datasets) {
      const inputValues = this.getDatasetInputValues(dataset.id);
      if (inputValues) {
        results.push(inputValues);
      }
    }

    return results;
  }
}

export default DatasetController;

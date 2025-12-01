/**
 * 도수분포표 애플리케이션
 * 메인 애플리케이션 컨트롤러
 *
 * @version 4.0.0 (컨트롤러 분리)
 * @description ES6 모듈 시스템을 사용한 관심사 분리 버전
 */

import CONFIG from './config.js';
import ChartRenderer from './renderers/chart.js';
import TableRenderer from './renderers/table.js';
import DataStore from './core/dataStore.js';
import TableStore from './core/tableStore.js';
import ChartStore from './core/chartStore.js';
import DatasetStore from './core/datasetStore.js';
import * as KatexUtils from './utils/katex.js';

// 컨트롤러 import
import {
  AnimationController,
  DatasetController,
  TableConfigController,
  LayerPanelController,
  ChartSettingsController,
  GenerationController
} from './controllers/index.js';

// ========== 애플리케이션 컨트롤러 ==========
class FrequencyDistributionApp {
  constructor() {
    this.chartRenderer = new ChartRenderer('chart');

    // 테이블 관리
    this.tableRenderers = [];
    this.tableCounter = 0;
    this.tableRenderer = null;

    // 첫 번째 테이블 렌더러 초기화
    this.initFirstTableRenderer();

    // 컨트롤러 초기화
    this._initControllers();

    this.init();
  }

  /**
   * 컨트롤러 인스턴스 초기화
   * @private
   */
  _initControllers() {
    this.animationController = new AnimationController(this);
    this.datasetController = new DatasetController(this);
    this.tableConfigController = new TableConfigController(this);
    this.layerPanelController = new LayerPanelController(this);
    this.chartSettingsController = new ChartSettingsController(this);
    this.generationController = new GenerationController(this);
  }

  /**
   * 첫 번째 테이블 렌더러 초기화
   */
  initFirstTableRenderer() {
    this.tableRenderer = new TableRenderer('frequencyTable');
    this.tableRenderers.push(this.tableRenderer);
    this.tableCounter = 1;
  }

  /**
   * 이벤트 리스너 초기화
   */
  async init() {
    // KaTeX 폰트 로드 대기
    await KatexUtils.waitForFonts();

    // 첫 번째 데이터셋 섹션 생성
    this.datasetController.createDatasetSection(1);

    // 차트 데이터 유형 라디오 버튼 초기화 (고급 설정)
    this.chartSettingsController.initChartDataTypeRadios();

    // 도수분포표 생성 버튼
    const generateBtn = document.getElementById('generateBtn');
    generateBtn?.addEventListener('click', () => this.generationController.generate(true));

    // 도수분포표 추가 버튼
    const addBtn = document.getElementById('addBtn');
    addBtn?.addEventListener('click', () => this.datasetController.addDatasetAndGenerate());

    // JSON 내보내기/불러오기 버튼
    const exportJsonBtn = document.getElementById('exportJsonBtn');
    exportJsonBtn?.addEventListener('click', () => this.generationController.exportJson());

    const importJsonBtn = document.getElementById('importJsonBtn');
    const jsonFileInput = document.getElementById('jsonFileInput');
    importJsonBtn?.addEventListener('click', () => jsonFileInput?.click());
    jsonFileInput?.addEventListener('change', (e) => this.generationController.handleJsonFileSelect(e));

    // 애니메이션 컨트롤 초기화
    this.animationController.init();

    // 격자선 토글 초기화
    this.chartSettingsController.initGridToggle();

    // 테이블 설정 패널 초기화
    this.tableConfigController.initTableConfigPanel();

    // JSON 미리보기 모달 초기화
    this.layerPanelController.initJsonPreviewModal();

    // 레이어 소스 선택기 초기화
    this.layerPanelController.initLayerSourceSelector();

    // 애니메이션 테스트 버튼 초기화
    this.layerPanelController.initAnimationTestButtons();

    // 계급 범위 편집기 초기화
    this.generationController.initClassRangeEditor();
  }

  /**
   * 리소스 정리 (페이지 언로드 시 호출)
   */
  destroy() {
    this.animationController.destroy();
  }

  // ========== 위임 메서드 (기존 API 호환성 유지) ==========

  /**
   * @deprecated DatasetController.createDatasetSection() 사용
   */
  createDatasetSection(datasetId) {
    return this.datasetController.createDatasetSection(datasetId);
  }

  /**
   * @deprecated DatasetController.onTableTypeChange() 사용
   */
  onTableTypeChange(section, tableType) {
    return this.datasetController.onTableTypeChange(section, tableType);
  }

  /**
   * @deprecated DatasetController.removeDatasetSection() 사용
   */
  removeDatasetSection(datasetId) {
    return this.datasetController.removeDatasetSection(datasetId);
  }

  /**
   * @deprecated DatasetController.removeTableByDatasetId() 사용
   */
  removeTableByDatasetId(datasetId) {
    return this.datasetController.removeTableByDatasetId(datasetId);
  }

  /**
   * @deprecated DatasetController.addDatasetAndGenerate() 사용
   */
  addDatasetAndGenerate() {
    return this.datasetController.addDatasetAndGenerate();
  }

  /**
   * @deprecated DatasetController.getDatasetInputValues() 사용
   */
  getDatasetInputValues(datasetId) {
    return this.datasetController.getDatasetInputValues(datasetId);
  }

  /**
   * @deprecated DatasetController.getAllDatasetInputValues() 사용
   */
  getAllDatasetInputValues() {
    return this.datasetController.getAllDatasetInputValues();
  }

  /**
   * @deprecated GenerationController.generate() 사용
   */
  generate(reset = true) {
    return this.generationController.generate(reset);
  }

  /**
   * @deprecated TableConfigController.getTableConfig() 사용
   */
  getTableConfig() {
    return this.tableConfigController.getTableConfig();
  }

  /**
   * @deprecated TableConfigController.getTableConfigWithAlignment() 사용
   */
  getTableConfigWithAlignment() {
    return this.tableConfigController.getTableConfigWithAlignment();
  }

  /**
   * @deprecated TableConfigController.getCustomLabels() 사용
   */
  getCustomLabels() {
    return this.tableConfigController.getCustomLabels();
  }

  /**
   * @deprecated TableConfigController.getDefaultTableConfig() 사용
   */
  getDefaultTableConfig() {
    return this.tableConfigController.getDefaultTableConfig();
  }

  /**
   * @deprecated LayerPanelController.renderLayerPanel() 사용
   */
  renderLayerPanel() {
    return this.layerPanelController.renderLayerPanel();
  }

  /**
   * @deprecated ChartSettingsController.updateChart() 사용
   */
  updateChart() {
    return this.chartSettingsController.updateChart();
  }

  /**
   * @deprecated ChartSettingsController.updateTable() 사용
   */
  updateTable() {
    return this.chartSettingsController.updateTable();
  }

  /**
   * @deprecated ChartSettingsController.redrawChart() 사용
   */
  redrawChart() {
    return this.chartSettingsController.redrawChart();
  }

  /**
   * @deprecated GenerationController.exportJson() 사용
   */
  exportJson() {
    return this.generationController.exportJson();
  }

  /**
   * @deprecated GenerationController.handleJsonFileSelect() 사용
   */
  handleJsonFileSelect(event) {
    return this.generationController.handleJsonFileSelect(event);
  }

  /**
   * @deprecated GenerationController.createNewTable() 사용
   */
  createNewTable() {
    return this.generationController.createNewTable();
  }

  /**
   * @deprecated GenerationController.clearExtraTables() 사용
   */
  clearExtraTables() {
    return this.generationController.clearExtraTables();
  }
}

// ========== 개발 모드: 브라우저 콘솔에서 Store 접근 가능 ==========
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  window.__DEV__ = {
    DataStore,
    TableStore,
    ChartStore
  };
  console.log('📊 개발 모드: window.__DEV__로 Store 접근 가능');
}

// ========== KaTeX 폰트 테스트 함수 ==========
window.testKatex = async function() {
  const canvas = document.getElementById('chart');
  if (!canvas) {
    console.error('차트 Canvas를 찾을 수 없습니다');
    return;
  }

  const ctx = canvas.getContext('2d');
  const fontsReady = await KatexUtils.waitForFonts();
  console.log('폰트 로드 상태:', fontsReady ? '성공' : '실패 (폴백 폰트 사용)');

  console.log('KaTeX 폰트 테스트 시작...');

  const testCases = [
    { text: '145', x: 80, y: 30, desc: '숫자' },
    { text: '23.5', x: 180, y: 30, desc: '소수' },
    { text: 'x', x: 280, y: 30, desc: '변수' },
    { text: 'A', x: 350, y: 30, desc: '알파벳' },
    { text: 'x^2', x: 440, y: 30, desc: '위첨자' },
    { text: 'A_1', x: 530, y: 30, desc: '아래첨자' },
    { text: '1/2', x: 620, y: 30, desc: '분수' }
  ];

  for (const tc of testCases) {
    const result = KatexUtils.render(ctx, tc.text, tc.x, tc.y, {
      fontSize: 24,
      color: '#8DCF66',
      align: 'center',
      baseline: 'middle'
    });
    console.log(`✓ ${tc.desc}: "${tc.text}"`, result);
  }

  console.log('KaTeX 폰트 테스트 완료! 차트 상단을 확인하세요.');
};

// ========== 앱 초기화 ==========
let appInstance;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    appInstance = new FrequencyDistributionApp();
  });
} else {
  appInstance = new FrequencyDistributionApp();
}

// 페이지 언로드 시 리소스 정리
window.addEventListener('beforeunload', () => {
  if (appInstance && typeof appInstance.destroy === 'function') {
    appInstance.destroy();
  }
});

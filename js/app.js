/**
 * 도수분포표 애플리케이션
 * 메인 애플리케이션 컨트롤러
 *
 * @version 3.0.0 (모듈화)
 * @description ES6 모듈 시스템을 사용한 관심사 분리 버전
 */

import CONFIG from './config.js';
import Utils from './utils/utils.js';
import Validator from './utils/validator.js';
import MessageManager from './utils/message.js';
import DataProcessor from './core/processor.js';
import UIRenderer from './renderers/ui.js';
import ChartRenderer from './renderers/chart.js';

// ========== 애플리케이션 컨트롤러 ==========
class FrequencyDistributionApp {
  constructor() {
    this.chartRenderer = new ChartRenderer('chart');
    this.init();
  }

  /**
   * 이벤트 리스너 초기화
   */
  init() {
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.addEventListener('click', () => this.generate());

    // Enter 키로도 생성 가능
    document.getElementById('dataInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        this.generate();
      }
    });
  }

  /**
   * 도수분포표 생성 메인 로직
   */
  generate() {
    try {
      MessageManager.hide();

      // 1. 입력 값 가져오기
      const input = document.getElementById('dataInput').value.trim();
      if (!input) {
        MessageManager.error('데이터를 입력해주세요!');
        return;
      }

      // 2. 데이터 파싱
      const data = DataProcessor.parseInput(input);

      // 3. 데이터 검증
      const dataValidation = Validator.validateData(data);
      if (!dataValidation.valid) {
        MessageManager.error(dataValidation.message);
        return;
      }

      // 4. 계급 설정 검증
      const classCount = parseInt(document.getElementById('classCount').value);
      const classCountValidation = Validator.validateClassCount(classCount);
      if (!classCountValidation.valid) {
        MessageManager.error(classCountValidation.message);
        return;
      }

      const classWidthInput = document.getElementById('classWidth').value;
      const customWidth = classWidthInput ? parseFloat(classWidthInput) : null;
      const classWidthValidation = Validator.validateClassWidth(customWidth);
      if (!classWidthValidation.valid) {
        MessageManager.error(classWidthValidation.message);
        return;
      }

      // 5. 고급 설정 값 가져오기
      const customLabels = this.getCustomLabels();

      // 6. 데이터 처리
      const stats = DataProcessor.calculateBasicStats(data);
      const { classes } = DataProcessor.createClasses(stats, classCount, customWidth);
      DataProcessor.calculateFrequencies(data, classes);
      DataProcessor.calculateRelativeAndCumulative(classes, data.length);

      // 중략 표시 여부 확인
      const ellipsisInfo = DataProcessor.shouldShowEllipsis(classes);

      // 7. UI 렌더링 (커스텀 라벨 전달)
      UIRenderer.renderStatsCards(stats);
      UIRenderer.renderFrequencyTable(classes, data.length, customLabels.table);
      this.chartRenderer.draw(classes, customLabels.axis, ellipsisInfo);

      // 8. 결과 섹션 표시 및 2열 레이아웃 전환
      document.getElementById('resultSection').classList.add('active');
      document.querySelector('.layout-grid').classList.add('two-column');

      // 9. 성공 메시지
      MessageManager.success('도수분포표가 생성되었습니다!');

    } catch (error) {
      console.error('Error:', error);
      MessageManager.error(`오류가 발생했습니다: ${error.message}`);
    }
  }

  /**
   * 고급 설정에서 커스텀 라벨 가져오기
   */
  getCustomLabels() {
    const xAxisLabel = document.getElementById('xAxisLabel').value.trim();
    const yAxisLabel = document.getElementById('yAxisLabel').value.trim();
    const label1 = document.getElementById('label1').value.trim();
    const label2 = document.getElementById('label2').value.trim();
    const label3 = document.getElementById('label3').value.trim();
    const label4 = document.getElementById('label4').value.trim();
    const label5 = document.getElementById('label5').value.trim();
    const label6 = document.getElementById('label6').value.trim();

    // X축 라벨과 표의 "계급" 컬럼을 통합
    const classLabel = label1 || xAxisLabel || CONFIG.DEFAULT_LABELS.table.class;
    // Y축 라벨과 표의 "상대도수(%)" 컬럼을 통합
    const relativeFreqLabel = label4 || yAxisLabel || CONFIG.DEFAULT_LABELS.table.relativeFrequency;

    return {
      axis: {
        xAxis: xAxisLabel || label1 || CONFIG.DEFAULT_LABELS.xAxis,
        yAxis: yAxisLabel || label4 || CONFIG.DEFAULT_LABELS.yAxis
      },
      table: {
        class: classLabel,
        midpoint: label2 || CONFIG.DEFAULT_LABELS.table.midpoint,
        frequency: label3 || CONFIG.DEFAULT_LABELS.table.frequency,
        relativeFrequency: relativeFreqLabel,
        cumulativeFrequency: label5 || CONFIG.DEFAULT_LABELS.table.cumulativeFrequency,
        cumulativeRelativeFrequency: label6 || CONFIG.DEFAULT_LABELS.table.cumulativeRelativeFrequency
      }
    };
  }
}

// ========== 앱 초기화 ==========
// DOM이 로드된 후 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new FrequencyDistributionApp();
  });
} else {
  new FrequencyDistributionApp();
}

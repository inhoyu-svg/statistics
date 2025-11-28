/**
 * 테이블 설정 컨트롤러
 * 테이블 컬럼 설정, 정렬, 드래그앤드롭 순서 변경
 */

import CONFIG from '../config.js';
import TableStore from '../core/tableStore.js';
import DataStore from '../core/dataStore.js';

/**
 * @class TableConfigController
 * @description 테이블 설정 패널 관리
 */
class TableConfigController {
  /**
   * @param {FrequencyDistributionApp} app - 메인 애플리케이션 인스턴스
   */
  constructor(app) {
    this.app = app;
    this.columnOrder = [0, 1, 2, 3, 4, 5, 6]; // 7개 컬럼
    this.draggedElement = null;
  }

  /**
   * 테이블 설정 패널 동적 생성
   * CONFIG.DEFAULT_LABELS.table 기반으로 각 컬럼별 설정 행 생성
   */
  initTableConfigPanel() {
    const panel = this._getTableConfigPanel();
    if (!panel) return;

    // CONFIG에서 컬럼 정보 가져오기 (7개 컬럼)
    const tableLabels = CONFIG.DEFAULT_LABELS.table;
    const columns = [
      { key: 'class', label: tableLabels.class },
      { key: 'midpoint', label: tableLabels.midpoint },
      { key: 'tally', label: tableLabels.tally },
      { key: 'frequency', label: tableLabels.frequency },
      { key: 'relativeFrequency', label: tableLabels.relativeFrequency },
      { key: 'cumulativeFrequency', label: tableLabels.cumulativeFrequency },
      { key: 'cumulativeRelativeFrequency', label: tableLabels.cumulativeRelativeFrequency }
    ];

    // 각 컬럼별 설정 행 생성
    const defaultVisibleColumns = CONFIG.TABLE_DEFAULT_VISIBLE_COLUMNS;
    columns.forEach((column, index) => {
      const row = document.createElement('div');
      row.className = 'table-config-row';
      row.draggable = true;
      row.dataset.columnIndex = index;

      const defaultAlignment = CONFIG.TABLE_DEFAULT_ALIGNMENT[column.label] || 'center';
      const isChecked = defaultVisibleColumns[index] ? 'checked' : '';

      row.innerHTML = `
        <span class="drag-handle">⋮⋮</span>
        <input type="checkbox" class="column-checkbox" data-column-index="${index}" ${isChecked}>
        <span class="column-label">${column.label}</span>
        <div class="alignment-buttons">
          <button class="align-btn ${defaultAlignment === 'left' ? 'active' : ''}" data-column="${column.label}" data-align="left">L</button>
          <button class="align-btn ${defaultAlignment === 'center' ? 'active' : ''}" data-column="${column.label}" data-align="center">C</button>
          <button class="align-btn ${defaultAlignment === 'right' ? 'active' : ''}" data-column="${column.label}" data-align="right">R</button>
        </div>
        <div class="label-input-wrapper">
          <input type="text" class="label-input" data-column-index="${index}" placeholder="${column.label}" value="">
        </div>
      `;

      panel.appendChild(row);
    });

    // 이벤트 리스너 등록
    this.initTableConfigEvents();
  }

  /**
   * 테이블 설정 패널 이벤트 리스너
   */
  initTableConfigEvents() {
    const panel = this._getTableConfigPanel();
    if (!panel) return;

    // 체크박스 변경 이벤트
    panel.querySelectorAll('.column-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', () => this.handleTableUpdate());
    });

    // 라벨 입력 이벤트
    panel.querySelectorAll('.label-input').forEach(input => {
      input.addEventListener('input', () => this.handleTableUpdate());
    });

    // 정렬 버튼 이벤트
    panel.querySelectorAll('.align-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const column = e.target.dataset.column;
        const alignment = e.target.dataset.align;

        // 같은 컬럼의 다른 버튼 비활성화
        panel.querySelectorAll(`.align-btn[data-column="${column}"]`).forEach(b => {
          b.classList.remove('active');
        });
        e.target.classList.add('active');

        // Store에 저장
        TableStore.setColumnAlignment(column, alignment);

        // 테이블 업데이트
        this.handleTableUpdate();
      });
    });

    // 드래그 앤 드롭 초기화
    this.initTableConfigDragAndDrop();
  }

  /**
   * 테이블 설정 변경 시 테이블 재렌더링
   */
  handleTableUpdate() {
    if (!DataStore.hasData()) return;

    const { classes } = DataStore.getData();
    const configWithAlignment = this.getTableConfigWithAlignment();

    this.app.tableRenderer.draw(classes, DataStore.getRawData().length, configWithAlignment);
  }

  /**
   * 테이블 설정 패널 드래그 앤 드롭 초기화
   */
  initTableConfigDragAndDrop() {
    const panel = this._getTableConfigPanel();
    if (!panel) return;

    let draggedElement = null;

    panel.querySelectorAll('.table-config-row').forEach(row => {
      row.addEventListener('dragstart', (e) => {
        draggedElement = e.target;
        e.target.classList.add('dragging');
      });

      row.addEventListener('dragend', (e) => {
        e.target.classList.remove('dragging');
        panel.querySelectorAll('.table-config-row').forEach(r => r.classList.remove('drag-over'));

        // 순서 변경 적용
        this.updateColumnOrder();
        this.handleTableUpdate();
      });

      row.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (e.target.closest('.table-config-row') && e.target !== draggedElement) {
          e.target.closest('.table-config-row').classList.add('drag-over');
        }
      });

      row.addEventListener('dragleave', (e) => {
        if (e.target.closest('.table-config-row')) {
          e.target.closest('.table-config-row').classList.remove('drag-over');
        }
      });

      row.addEventListener('drop', (e) => {
        e.preventDefault();
        const dropTarget = e.target.closest('.table-config-row');
        if (dropTarget && dropTarget !== draggedElement) {
          const allRows = [...panel.querySelectorAll('.table-config-row')];
          const draggedIndex = allRows.indexOf(draggedElement);
          const targetIndex = allRows.indexOf(dropTarget);

          if (draggedIndex < targetIndex) {
            dropTarget.after(draggedElement);
          } else {
            dropTarget.before(draggedElement);
          }
        }
      });
    });
  }

  /**
   * 드래그 후 컬럼 순서 업데이트
   */
  updateColumnOrder() {
    const rows = this._getTableConfigRows();
    if (rows.length === 0) return;

    this.columnOrder = rows.map(row => parseInt(row.dataset.columnIndex));
  }

  /**
   * 기본 테이블 설정 가져오기
   * @returns {Object} 테이블 설정 객체
   */
  getDefaultTableConfig() {
    return {
      visibleColumns: [...CONFIG.TABLE_DEFAULT_VISIBLE_COLUMNS],
      columnOrder: [...CONFIG.TABLE_DEFAULT_COLUMN_ORDER],
      labels: {},
      columnAlignment: {
        0: 'center',
        1: 'center',
        2: 'center',
        3: 'center',
        4: 'center',
        5: 'center'
      }
    };
  }

  /**
   * 정렬 정보가 포함된 테이블 설정 가져오기
   * @returns {Object} 통합 설정 객체
   */
  getTableConfigWithAlignment() {
    const tableConfig = this.getTableConfig();
    const columnAlignment = TableStore.getAllAlignments();
    return {
      ...tableConfig,
      columnAlignment: columnAlignment
    };
  }

  /**
   * 고급 설정에서 커스텀 라벨 가져오기
   * @returns {Object} 축 라벨, 표 라벨, 말풍선 템플릿
   */
  getCustomLabels() {
    const xAxisLabel = document.getElementById('xAxisLabel')?.value.trim() || '';
    const yAxisLabel = document.getElementById('yAxisLabel')?.value.trim() || '';

    // 말풍선 체크박스 상태 확인
    const showCallout = document.getElementById('showCallout')?.checked || false;
    const calloutTemplate = showCallout
      ? (document.getElementById('calloutTemplate')?.value.trim() || CONFIG.CALLOUT_TEMPLATE)
      : null;

    // CONFIG의 기본 라벨 순서 (7개: 계급, 계급값, 탈리, 도수, 상대도수, 누적도수, 누적상대도수)
    const defaults = [
      CONFIG.DEFAULT_LABELS.table.class,
      CONFIG.DEFAULT_LABELS.table.midpoint,
      CONFIG.DEFAULT_LABELS.table.tally,
      CONFIG.DEFAULT_LABELS.table.frequency,
      CONFIG.DEFAULT_LABELS.table.relativeFrequency,
      CONFIG.DEFAULT_LABELS.table.cumulativeFrequency,
      CONFIG.DEFAULT_LABELS.table.cumulativeRelativeFrequency
    ];

    const panel = this._getTableConfigPanel();
    let labels = defaults; // 기본값으로 시작

    if (panel) {
      // 패널이 있으면 사용자 입력값 사용
      const labelInputs = [...panel.querySelectorAll('.label-input')];
      labels = labelInputs.map((input, i) => input.value.trim() || defaults[i]);
    }

    const [label1, label2, label3, label4, label5, label6, label7] = labels;

    // X축 라벨과 표의 "계급" 컬럼을 통합
    const classLabel = xAxisLabel || label1 || CONFIG.DEFAULT_LABELS.table.class;
    // Y축 라벨과 표의 "상대도수(%)" 컬럼을 통합
    const relativeFreqLabel = yAxisLabel || label5 || CONFIG.DEFAULT_LABELS.table.relativeFrequency;

    return {
      axis: {
        xAxis: xAxisLabel || (label1 !== CONFIG.DEFAULT_LABELS.table.class ? label1 : null) || CONFIG.DEFAULT_LABELS.xAxis,
        yAxis: yAxisLabel || null
      },
      table: {
        class: classLabel,
        midpoint: label2,
        tally: label3,
        frequency: label4,
        relativeFrequency: relativeFreqLabel,
        cumulativeFrequency: label6,
        cumulativeRelativeFrequency: label7
      },
      calloutTemplate
    };
  }

  /**
   * 표 설정 가져오기
   * @returns {Object} 표 설정 객체
   */
  getTableConfig() {
    const customLabels = this.getCustomLabels();

    const panel = this._getTableConfigPanel();
    if (!panel) {
      return {
        labels: customLabels.table,
        visibleColumns: [...CONFIG.TABLE_DEFAULT_VISIBLE_COLUMNS],
        columnOrder: [...CONFIG.TABLE_DEFAULT_COLUMN_ORDER],
        showSuperscript: CONFIG.TABLE_SHOW_SUPERSCRIPT
      };
    }

    // 체크박스 상태 확인 (원본 순서)
    const checkboxes = [...panel.querySelectorAll('.column-checkbox')];
    const originalVisibleColumns = checkboxes.map(cb => cb.checked);

    // 상첨자 표시 옵션
    const showSuperscript = document.querySelector('.dataset-show-superscript')?.checked ?? CONFIG.TABLE_SHOW_SUPERSCRIPT;

    return {
      labels: customLabels.table,
      visibleColumns: originalVisibleColumns,
      columnOrder: this.columnOrder,
      showSuperscript: showSuperscript
    };
  }

  /**
   * 테이블 설정 패널 요소 가져오기
   * @returns {HTMLElement|null}
   * @private
   */
  _getTableConfigPanel() {
    return document.getElementById('tableConfigPanel');
  }

  /**
   * 모든 테이블 설정 행 가져오기
   * @returns {HTMLElement[]}
   * @private
   */
  _getTableConfigRows() {
    const panel = this._getTableConfigPanel();
    return panel ? [...panel.querySelectorAll('.table-config-row')] : [];
  }
}

export default TableConfigController;

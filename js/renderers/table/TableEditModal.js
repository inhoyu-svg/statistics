/**
 * 테이블 셀 편집 모달 관리
 * 셀 변수 편집, 합계 행/병합 헤더 토글 등
 */

import CONFIG from '../../config.js';
import tableStore from '../../core/tableStore.js';

/**
 * @class TableEditModal
 * @description 테이블 셀 편집 모달 관리 클래스
 */
class TableEditModal {
  /**
   * @param {TableRenderer} tableRenderer - 부모 테이블 렌더러 인스턴스
   */
  constructor(tableRenderer) {
    this.renderer = tableRenderer;
    this._modalHandlers = null;
  }

  /**
   * Canvas 클릭 이벤트 핸들러 - 모달 열기
   * @param {MouseEvent} event - 마우스 이벤트
   */
  handleCanvasClick(event) {
    const rootLayer = this.renderer.layerManager.root;
    if (!rootLayer || rootLayer.children.length === 0) return;

    this.openEditModal();
  }

  /**
   * 편집 모달 열기
   */
  openEditModal() {
    const modal = document.getElementById('variableEditModal');
    if (!modal) return;

    // HTML 테이블 생성
    this.generateEditableTable();

    // 합계 행 체크박스 상태 초기화
    const summaryCheckbox = document.getElementById('showSummaryRowCheckbox');
    if (summaryCheckbox) {
      summaryCheckbox.checked = tableStore.getSummaryRowVisible(this.renderer.tableId);
    }

    // 병합 헤더 옵션 (이원분류표 전용)
    const mergedHeaderOption = document.getElementById('mergedHeaderOption');
    const mergedHeaderCheckbox = document.getElementById('showMergedHeaderCheckbox');
    const isCrossTable = this.renderer.currentTableType === CONFIG.TABLE_TYPES.CROSS_TABLE;

    if (mergedHeaderOption) {
      mergedHeaderOption.style.display = isCrossTable ? 'block' : 'none';
    }
    if (mergedHeaderCheckbox && isCrossTable) {
      mergedHeaderCheckbox.checked = tableStore.getMergedHeaderVisible(this.renderer.tableId);
    }

    // 모달 표시
    modal.style.display = 'flex';

    // 이벤트 리스너 등록
    this._setupModalListeners();
  }

  /**
   * 편집 모달 닫기
   */
  closeEditModal() {
    const modal = document.getElementById('variableEditModal');
    if (modal) {
      modal.style.display = 'none';
    }

    // 이벤트 리스너 제거
    this._removeModalListeners();
  }

  /**
   * 모달 이벤트 리스너 설정
   * @private
   */
  _setupModalListeners() {
    const modal = document.getElementById('variableEditModal');
    const closeBtn = document.getElementById('variableModalCloseBtn');
    const cancelBtn = document.getElementById('variableCancelBtn');
    const saveBtn = document.getElementById('variableSaveBtn');
    const overlay = modal?.querySelector('.modal-overlay');

    // 저장된 핸들러 참조 (제거용)
    this._modalHandlers = {
      close: () => this.closeEditModal(),
      save: () => this.saveChanges(),
      overlayClick: (e) => {
        if (e.target === overlay) this.closeEditModal();
      }
    };

    closeBtn?.addEventListener('click', this._modalHandlers.close);
    cancelBtn?.addEventListener('click', this._modalHandlers.close);
    saveBtn?.addEventListener('click', this._modalHandlers.save);
    overlay?.addEventListener('click', this._modalHandlers.overlayClick);
  }

  /**
   * 모달 이벤트 리스너 제거
   * @private
   */
  _removeModalListeners() {
    if (!this._modalHandlers) return;

    const modal = document.getElementById('variableEditModal');
    const closeBtn = document.getElementById('variableModalCloseBtn');
    const cancelBtn = document.getElementById('variableCancelBtn');
    const saveBtn = document.getElementById('variableSaveBtn');
    const overlay = modal?.querySelector('.modal-overlay');

    closeBtn?.removeEventListener('click', this._modalHandlers.close);
    cancelBtn?.removeEventListener('click', this._modalHandlers.close);
    saveBtn?.removeEventListener('click', this._modalHandlers.save);
    overlay?.removeEventListener('click', this._modalHandlers.overlayClick);

    this._modalHandlers = null;
  }

  /**
   * 편집용 HTML 테이블 생성
   */
  generateEditableTable() {
    const container = document.getElementById('variableEditTableContainer');
    if (!container) return;

    const rootLayer = this.renderer.layerManager.root;
    if (!rootLayer || rootLayer.children.length === 0) {
      container.innerHTML = '<p>테이블 데이터가 없습니다.</p>';
      return;
    }

    const tableLayer = rootLayer.children[0];
    if (!tableLayer) return;

    // 헤더와 데이터 행 분리
    const headerRow = tableLayer.children.find(c => c.id.includes('-table-header'));
    const dataRows = tableLayer.children.filter(c =>
      c.type === 'group' && (c.id.includes('-table-row-') || c.id.includes('-table-summary'))
    );

    // HTML 테이블 생성
    let html = '<table class="variable-edit-table">';

    // 헤더 행
    if (headerRow) {
      html += '<thead><tr>';
      headerRow.children.forEach(cell => {
        html += `<th>${cell.data.cellText}</th>`;
      });
      html += '</tr></thead>';
    }

    // 데이터 행
    html += '<tbody>';
    dataRows.forEach(row => {
      const isSummary = row.id.includes('-table-summary');
      html += `<tr class="${isSummary ? 'summary-row' : ''}" data-row-id="${row.id}">`;

      row.children.forEach((cell, colIndex) => {
        const { rowIndex, cellText, originalValue, tallyCount } = cell.data;
        // tallyCount가 정의되어 있으면 탈리 컬럼 (헤더 병합과 관계없이 정확히 판별)
        const isTallyColumn = tallyCount !== undefined;

        // 탈리 컬럼인 경우 tallyCount 표시, 아니면 cellText 표시
        let displayValue = cellText;
        let originalVal = originalValue !== undefined ? originalValue : cellText;

        if (isTallyColumn) {
          displayValue = String(tallyCount);
          originalVal = String(tallyCount);
        }

        html += `<td data-row="${rowIndex}" data-col="${colIndex}" data-original="${originalVal}" data-is-tally="${isTallyColumn}">${displayValue}</td>`;
      });

      html += '</tr>';
    });
    html += '</tbody></table>';

    container.innerHTML = html;

    // 셀 클릭 이벤트 등록
    const table = container.querySelector('.variable-edit-table');
    table?.querySelectorAll('td').forEach(td => {
      td.addEventListener('click', (e) => this._handleTableCellClick(e));
    });
  }

  /**
   * 테이블 셀 클릭 - 인라인 편집
   * @param {Event} event - 클릭 이벤트
   * @private
   */
  _handleTableCellClick(event) {
    const td = event.target.closest('td');
    if (!td || td.classList.contains('editing')) return;

    // 이미 편집 중인 셀이 있으면 완료 처리
    const editingTd = td.closest('table').querySelector('td.editing');
    if (editingTd) {
      this._finishCellEdit(editingTd);
    }

    // 현재 셀을 편집 모드로 전환
    const currentValue = td.textContent;
    td.classList.add('editing');
    td.innerHTML = `<input type="text" value="${currentValue}" />`;

    const input = td.querySelector('input');
    input.focus();
    input.select();

    // Enter/Escape 키 처리
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this._finishCellEdit(td);
      } else if (e.key === 'Escape') {
        // 원본 값으로 복원
        td.classList.remove('editing');
        td.textContent = td.dataset.original;
      }
    });

    // 포커스 아웃 시 완료
    input.addEventListener('blur', () => {
      this._finishCellEdit(td);
    });
  }

  /**
   * 셀 편집 완료
   * @param {HTMLElement} td - 편집 중인 셀
   * @private
   */
  _finishCellEdit(td) {
    if (!td.classList.contains('editing')) return;

    const input = td.querySelector('input');
    const newValue = input?.value.trim() || td.dataset.original;

    td.classList.remove('editing');
    td.textContent = newValue;
  }

  /**
   * 변경사항 저장
   */
  saveChanges() {
    const container = document.getElementById('variableEditTableContainer');
    const table = container?.querySelector('.variable-edit-table');
    if (!table) return;

    const rootLayer = this.renderer.layerManager.root;
    if (!rootLayer || rootLayer.children.length === 0) return;

    const tableLayer = rootLayer.children[0];
    if (!tableLayer) return;

    // 합계 행 체크박스 상태 확인
    const summaryCheckbox = document.getElementById('showSummaryRowCheckbox');
    const newSummaryRowVisible = summaryCheckbox ? summaryCheckbox.checked : true;
    const oldSummaryRowVisible = tableStore.getSummaryRowVisible(this.renderer.tableId);
    const summaryRowChanged = newSummaryRowVisible !== oldSummaryRowVisible;

    // 합계 행 상태 저장
    tableStore.setSummaryRowVisible(this.renderer.tableId, newSummaryRowVisible);

    // 병합 헤더 체크박스 상태 확인 (이원분류표 전용)
    const isCrossTable = this.renderer.currentTableType === CONFIG.TABLE_TYPES.CROSS_TABLE;
    let mergedHeaderChanged = false;

    if (isCrossTable) {
      const mergedHeaderCheckbox = document.getElementById('showMergedHeaderCheckbox');
      const newMergedHeaderVisible = mergedHeaderCheckbox ? mergedHeaderCheckbox.checked : true;
      const oldMergedHeaderVisible = tableStore.getMergedHeaderVisible(this.renderer.tableId);
      mergedHeaderChanged = newMergedHeaderVisible !== oldMergedHeaderVisible;

      // 병합 헤더 상태 저장
      tableStore.setMergedHeaderVisible(this.renderer.tableId, newMergedHeaderVisible);
    }

    // 모든 데이터 셀 확인
    table.querySelectorAll('td').forEach(td => {
      const rowIndex = parseInt(td.dataset.row);
      const colIndex = parseInt(td.dataset.col);
      const originalValue = td.dataset.original;
      const currentValue = td.textContent.trim();
      const isTallyColumn = td.dataset.isTally === 'true';

      // 레이어에서 해당 셀 찾기
      let cellLayer = null;
      for (const row of tableLayer.children) {
        if (row.type !== 'group') continue;

        for (const cell of row.children) {
          if (cell.data.rowIndex === rowIndex && cell.data.colIndex === colIndex) {
            cellLayer = cell;
            break;
          }
        }
        if (cellLayer) break;
      }

      if (!cellLayer) return;

      // 탈리 컬럼 특별 처리
      if (isTallyColumn) {
        // '_' 입력 시 0으로, 숫자 입력 시 해당 값으로 tallyCount 업데이트
        if (currentValue === '_' || currentValue === '') {
          cellLayer.data.tallyCount = 0;
        } else {
          const numValue = parseInt(currentValue);
          if (!isNaN(numValue)) {
            cellLayer.data.tallyCount = numValue;
          }
        }
        // 탈리 컬럼의 cellText는 항상 빈 문자열 유지
        cellLayer.data.cellText = '';
        return;
      }

      // 값이 변경되었는지 확인
      if (currentValue !== originalValue) {
        // 변수로 설정
        if (!cellLayer.data.originalValue) {
          cellLayer.data.originalValue = originalValue;
        }
        cellLayer.data.cellText = currentValue;
        cellLayer.data.isVariable = true;
        tableStore.setCellVariable(this.renderer.tableId, rowIndex, colIndex, currentValue);
      } else {
        // 원본 값으로 복원된 경우
        if (cellLayer.data.originalValue !== undefined) {
          cellLayer.data.cellText = cellLayer.data.originalValue;
          delete cellLayer.data.originalValue;
          delete cellLayer.data.isVariable;
        }
        tableStore.removeCellVariable(this.renderer.tableId, rowIndex, colIndex);
      }
    });

    // 합계 행 또는 병합 헤더 상태가 변경되었으면 테이블 재생성
    if (summaryRowChanged || mergedHeaderChanged) {
      if (this.renderer.currentTableType && this.renderer.currentData) {
        // 커스텀 테이블 (이원분류표 등)
        this.renderer.drawCustomTable(this.renderer.currentTableType, this.renderer.currentData, this.renderer.currentConfig);
      } else if (this.renderer.currentClasses && this.renderer.currentTotal !== null) {
        // 도수분포표
        this.renderer.draw(this.renderer.currentClasses, this.renderer.currentTotal, this.renderer.currentConfig);
      } else {
        this.renderer.renderFrame();
      }
    } else {
      // Canvas 다시 렌더링
      this.renderer.renderFrame();
    }

    // 모달 닫기
    this.closeEditModal();
  }

  /**
   * 모든 변수 초기화
   */
  clearAllVariables() {
    tableStore.clearAllVariables(this.renderer.tableId);

    // 레이어의 변수 정보도 초기화
    const rootLayer = this.renderer.layerManager.root;
    if (!rootLayer || rootLayer.children.length === 0) return;

    const tableLayer = rootLayer.children[0];
    if (!tableLayer) return;

    for (const child of tableLayer.children) {
      if (child.type !== 'group') continue;

      for (const cellLayer of child.children) {
        if (cellLayer.data.originalValue !== undefined) {
          cellLayer.data.cellText = cellLayer.data.originalValue;
          delete cellLayer.data.originalValue;
          delete cellLayer.data.isVariable;
        }
      }
    }

    this.renderer.renderFrame();
  }
}

export default TableEditModal;

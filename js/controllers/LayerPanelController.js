/**
 * 레이어 패널 컨트롤러
 * 레이어 목록 표시, 가시성 토글, 드래그앤드롭 순서 변경, JSON 미리보기
 */

import CONFIG from '../config.js';
import Utils from '../utils/utils.js';
import MessageManager from '../utils/message.js';

/**
 * @class LayerPanelController
 * @description 레이어 패널 UI 관리
 */
class LayerPanelController {
  /**
   * @param {FrequencyDistributionApp} app - 메인 애플리케이션 인스턴스
   */
  constructor(app) {
    this.app = app;
    this.currentLayerSource = 'chart';
    this.collapsedGroups = {
      chart: new Set(),
      table: new Set()
    };
    this.draggedLayerElement = null;
  }

  /**
   * 레이어 소스 선택기 초기화
   */
  initLayerSourceSelector() {
    const selector = document.getElementById('layerSourceSelect');
    if (!selector) return;

    selector.addEventListener('change', (e) => {
      this.currentLayerSource = e.target.value;
      this.renderLayerPanel();
    });
  }

  /**
   * 조상 중 하나라도 접혀있는지 확인
   * @param {string} layerId - 확인할 레이어 ID
   * @param {LayerManager} layerManager - 레이어 매니저
   * @param {number|null} tableIndex - 테이블 인덱스
   * @returns {boolean}
   */
  isAnyAncestorCollapsed(layerId, layerManager, tableIndex = null) {
    const currentCollapsedGroups = this.collapsedGroups[this.currentLayerSource];
    let currentParent = layerManager.findParent(layerId);
    while (currentParent) {
      const uniqueKey = this._getLayerUniqueKey(currentParent.id, tableIndex);

      if (currentCollapsedGroups.has(uniqueKey)) {
        return true;
      }
      currentParent = layerManager.findParent(currentParent.id);
    }
    return false;
  }

  /**
   * 레이어 고유 키 생성
   * @param {string} layerId - 레이어 ID
   * @param {number|string|null} tableIndex - 테이블 인덱스
   * @returns {string}
   * @private
   */
  _getLayerUniqueKey(layerId, tableIndex = null) {
    if (this.currentLayerSource === 'table' && tableIndex !== null && tableIndex !== undefined) {
      return `${tableIndex}-${layerId}`;
    }
    return layerId;
  }

  /**
   * 레이어 패널 렌더링
   */
  renderLayerPanel() {
    const layerList = document.getElementById('layerList');
    if (!layerList) return;

    // 선택된 소스에 따라 레이어 가져오기
    let layers = [];
    let layerManager = null;

    if (this.currentLayerSource === 'chart') {
      layerManager = this.app.chartRenderer.layerManager;
      if (!layerManager) {
        layerList.innerHTML = '<p class="no-layers">레이어가 없습니다</p>';
        return;
      }
      layers = layerManager.getAllLayers();

    } else if (this.currentLayerSource === 'table') {
      // 모든 테이블 렌더러의 레이어 통합
      if (this.app.tableRenderers.length === 0) {
        layerList.innerHTML = '<p class="no-layers">레이어가 없습니다</p>';
        return;
      }

      // 각 테이블의 레이어를 가져와서 통합
      this.app.tableRenderers.forEach((renderer, tableIndex) => {
        const tableLayerManager = renderer.getLayerManager();
        if (tableLayerManager) {
          const tableLayers = tableLayerManager.getAllLayers();

          tableLayers.forEach(({ layer, depth }) => {
            layers.push({
              layer,
              depth,
              tableIndex,
              tableLayerManager
            });
          });
        }
      });

      if (layers.length === 0) {
        layerList.innerHTML = '<p class="no-layers">레이어가 없습니다</p>';
        return;
      }
    }

    if (layers.length === 0) {
      layerList.innerHTML = '<p class="no-layers">레이어가 없습니다</p>';
      return;
    }

    // root 레이어 제외 및 접힌 그룹의 자식 필터링
    const filteredLayers = layers
      .filter(({ layer, tableIndex, tableLayerManager }) => {
        if (layer.id === 'root') return false;

        const currentLayerManager = this.currentLayerSource === 'table' ? tableLayerManager : layerManager;
        if (this.isAnyAncestorCollapsed(layer.id, currentLayerManager, tableIndex)) {
          return false;
        }

        return true;
      })
      .map(({ layer, depth, tableIndex, tableLayerManager }) => ({
        layer,
        depth: depth - 1,
        tableIndex,
        tableLayerManager
      }));

    // HTML 생성
    const currentCollapsedGroups = this.collapsedGroups[this.currentLayerSource];
    layerList.innerHTML = filteredLayers.map(({ layer, depth, tableIndex, tableLayerManager }) => {
      const depthClass = `depth-${depth}`;
      const isGroup = layer.type === 'group';

      const uniqueKey = this._getLayerUniqueKey(layer.id, tableIndex);
      const isCollapsed = currentCollapsedGroups.has(uniqueKey);
      const toggleIcon = isGroup ? (isCollapsed ? '▶' : '▼') : '';

      const visibilityIcon = layer.visible ? '👁️' : '👁️‍🗨️';

      let layerName = layer.name || layer.id;
      if (this.currentLayerSource === 'table' && tableIndex !== undefined) {
        layerName = `테이블 ${tableIndex + 1}: ${layerName}`;
      }

      // 타입별 아이콘
      let typeIcon = '';
      if (layer.id === 'histogram') {
        typeIcon = '<span class="layer-icon histogram-icon">📊</span>';
      } else if (layer.id === 'polygon') {
        typeIcon = '<span class="layer-icon polygon-icon">📈</span>';
      } else if (layer.id === 'points') {
        typeIcon = '<span class="layer-icon point-icon">⬤</span>';
      } else if (layer.id === 'lines') {
        typeIcon = '<span class="layer-icon line-icon">━</span>';
      } else if (layer.type === 'bar') {
        typeIcon = '<span class="layer-icon bar-icon">▓</span>';
      } else if (layer.type === 'point') {
        typeIcon = '<span class="layer-icon point-icon">●</span>';
      } else if (layer.type === 'line') {
        typeIcon = '<span class="layer-icon line-icon">─</span>';
      }

      const tableIndexAttr = (this.currentLayerSource === 'table' && tableIndex !== undefined) ? ` data-table-index="${tableIndex}"` : '';

      return `
        <div class="layer-item ${depthClass}" draggable="true" data-layer-id="${Utils.escapeHtml(layer.id)}"${tableIndexAttr}>
          ${isGroup ? `<span class="layer-toggle" data-layer-id="${Utils.escapeHtml(layer.id)}"${tableIndexAttr}>${toggleIcon}</span>` : '<span class="layer-toggle-spacer"></span>'}
          <span class="layer-drag-handle">⋮⋮</span>
          <button class="layer-visibility-btn" data-layer-id="${Utils.escapeHtml(layer.id)}" data-visible="${layer.visible}"${tableIndexAttr} title="${layer.visible ? '숨기기' : '보이기'}">${visibilityIcon}</button>
          ${typeIcon}
          <span class="layer-name">${Utils.escapeHtml(layerName)}</span>
          <button class="layer-json-btn" data-layer-id="${Utils.escapeHtml(layer.id)}"${tableIndexAttr} title="JSON 미리보기">📄</button>
        </div>
      `;
    }).join('');

    // 이벤트 리스너 등록
    this._setupLayerPanelEvents(layerList, layerManager);
  }

  /**
   * 레이어 패널 이벤트 설정
   * @param {HTMLElement} layerList - 레이어 목록 요소
   * @param {LayerManager} layerManager - 레이어 매니저
   * @private
   */
  _setupLayerPanelEvents(layerList, layerManager) {
    // 토글 이벤트
    layerList.querySelectorAll('.layer-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const layerId = e.target.dataset.layerId;
        const tableIndex = e.target.dataset.tableIndex;
        const currentCollapsedGroups = this.collapsedGroups[this.currentLayerSource];

        const uniqueKey = this._getLayerUniqueKey(layerId, tableIndex);

        if (currentCollapsedGroups.has(uniqueKey)) {
          currentCollapsedGroups.delete(uniqueKey);
        } else {
          currentCollapsedGroups.add(uniqueKey);
        }

        this.renderLayerPanel();
      });
    });

    // 드래그앤드롭 초기화
    this.initLayerDragAndDrop();

    // 가시성 토글 버튼 이벤트
    layerList.querySelectorAll('.layer-visibility-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const layerId = e.currentTarget.dataset.layerId;
        const currentVisible = e.currentTarget.dataset.visible === 'true';
        const newVisible = !currentVisible;

        let targetLayerManager = layerManager;
        let targetRenderer = null;

        if (this.currentLayerSource === 'table') {
          const tableIndex = parseInt(e.currentTarget.dataset.tableIndex);
          if (!isNaN(tableIndex) && this.app.tableRenderers[tableIndex]) {
            targetRenderer = this.app.tableRenderers[tableIndex];
            targetLayerManager = targetRenderer.getLayerManager();
          }
        }

        if (!targetLayerManager) return;

        targetLayerManager.setLayerVisibility(layerId, newVisible);

        const layer = targetLayerManager.findLayer(layerId);
        if (layer && layer.type === 'group' && layer.children) {
          layer.children.forEach(child => {
            targetLayerManager.setLayerVisibility(child.id, newVisible);
          });
        }

        this.renderLayerPanel();

        if (this.currentLayerSource === 'chart') {
          this.app.chartRenderer.renderFrame();
        } else if (this.currentLayerSource === 'table' && targetRenderer) {
          targetRenderer.renderFrame();
        }
      });
    });

    // JSON 미리보기 버튼 이벤트
    layerList.querySelectorAll('.layer-json-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const layerId = e.currentTarget.dataset.layerId;
        const tableIndex = e.currentTarget.dataset.tableIndex;
        this.showJsonPreview(layerId, tableIndex);
      });
    });
  }

  /**
   * 레이어 드래그앤드롭 초기화
   */
  initLayerDragAndDrop() {
    const layerList = document.getElementById('layerList');
    const items = layerList.querySelectorAll('.layer-item');

    items.forEach(item => {
      item.addEventListener('dragstart', (e) => this.handleLayerDragStart(e));
      item.addEventListener('dragover', (e) => this.handleLayerDragOver(e));
      item.addEventListener('drop', (e) => this.handleLayerDrop(e));
      item.addEventListener('dragend', (e) => this.handleLayerDragEnd(e));
      item.addEventListener('dragenter', (e) => this.handleLayerDragEnter(e));
      item.addEventListener('dragleave', (e) => this.handleLayerDragLeave(e));
    });
  }

  handleLayerDragStart(e) {
    this.draggedLayerElement = e.currentTarget;
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
  }

  handleLayerDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
  }

  handleLayerDragEnter(e) {
    if (e.currentTarget !== this.draggedLayerElement) {
      e.currentTarget.classList.add('drag-over');
    }
  }

  handleLayerDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  }

  handleLayerDrop(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }

    if (this.draggedLayerElement !== e.currentTarget) {
      const draggedId = this.draggedLayerElement.dataset.layerId;
      const targetId = e.currentTarget.dataset.layerId;

      const draggedLayer = this.app.chartRenderer.layerManager.findLayer(draggedId);
      const targetLayer = this.app.chartRenderer.layerManager.findLayer(targetId);

      if (draggedLayer && targetLayer) {
        const draggedParent = this.app.chartRenderer.layerManager.findParent(draggedId);
        const targetParent = this.app.chartRenderer.layerManager.findParent(targetId);

        if (draggedParent && targetParent && draggedParent.id === targetParent.id) {
          const temp = draggedLayer.order;
          draggedLayer.order = targetLayer.order;
          targetLayer.order = temp;

          draggedParent.children.sort((a, b) => a.order - b.order);

          this.renderLayerPanel();
          this.app.chartRenderer.replayAnimation();
        }
      }
    }

    e.currentTarget.classList.remove('drag-over');
    return false;
  }

  handleLayerDragEnd(e) {
    const items = document.querySelectorAll('.layer-item');
    items.forEach(item => {
      item.classList.remove('dragging');
      item.classList.remove('drag-over');
    });
  }

  /**
   * JSON 미리보기 모달 초기화
   */
  initJsonPreviewModal() {
    const modal = document.getElementById('jsonPreviewModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const copyJsonBtn = document.getElementById('copyJsonBtn');
    const overlay = modal?.querySelector('.modal-overlay');

    modalCloseBtn?.addEventListener('click', () => this.closeJsonPreview());
    closeModalBtn?.addEventListener('click', () => this.closeJsonPreview());
    overlay?.addEventListener('click', () => this.closeJsonPreview());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal?.style.display === 'flex') {
        this.closeJsonPreview();
      }
    });

    copyJsonBtn?.addEventListener('click', () => {
      const jsonContent = document.getElementById('jsonPreviewContent');
      if (jsonContent) {
        navigator.clipboard.writeText(jsonContent.textContent)
          .then(() => {
            MessageManager.success('JSON이 클립보드에 복사되었습니다!');
          })
          .catch(err => {
            MessageManager.error('복사에 실패했습니다: ' + err.message);
          });
      }
    });

    const showAllLayersJsonBtn = document.getElementById('showAllLayersJsonBtn');
    showAllLayersJsonBtn?.addEventListener('click', () => this.showAllLayersJsonPreview());
  }

  /**
   * JSON 미리보기 모달 표시
   * @param {string} layerId - 레이어 ID
   * @param {string|null} tableIndex - 테이블 인덱스
   */
  showJsonPreview(layerId, tableIndex = null) {
    let layerManager;
    if (this.currentLayerSource === 'chart') {
      layerManager = this.app.chartRenderer.layerManager;
    } else if (this.currentLayerSource === 'table') {
      if (tableIndex !== null && tableIndex !== undefined) {
        const tableIdx = parseInt(tableIndex);
        if (!isNaN(tableIdx) && this.app.tableRenderers[tableIdx]) {
          layerManager = this.app.tableRenderers[tableIdx].getLayerManager();
        }
      } else {
        layerManager = this.app.tableRenderer.getLayerManager();
      }
    }

    if (!layerManager) {
      MessageManager.error('레이어 매니저를 찾을 수 없습니다.');
      return;
    }

    const layer = layerManager.findLayer(layerId);
    if (!layer) {
      MessageManager.error('레이어를 찾을 수 없습니다.');
      return;
    }

    const layerJson = this.serializeLayerForPreview(layer);
    const jsonString = JSON.stringify(layerJson, null, 2);

    const jsonContent = document.getElementById('jsonPreviewContent');
    const modal = document.getElementById('jsonPreviewModal');
    const modalTitle = modal?.querySelector('.modal-title');

    if (jsonContent) {
      jsonContent.textContent = jsonString;
    }

    if (modalTitle) {
      modalTitle.textContent = `📄 레이어 JSON 미리보기: ${layer.name || layer.id}`;
    }

    if (modal) {
      modal.style.display = 'flex';
    }
  }

  /**
   * 전체 레이어 JSON 미리보기 모달 표시
   */
  showAllLayersJsonPreview() {
    let layerManager;
    let sourceName;

    if (this.currentLayerSource === 'chart') {
      layerManager = this.app.chartRenderer.layerManager;
      sourceName = '차트';
    } else if (this.currentLayerSource === 'table') {
      layerManager = this.app.tableRenderer.getLayerManager();
      sourceName = '테이블';
    }

    if (!layerManager) return;

    const allLayersJson = layerManager.toJSON();
    const jsonString = JSON.stringify(allLayersJson, null, 2);

    const jsonContent = document.getElementById('jsonPreviewContent');
    const modal = document.getElementById('jsonPreviewModal');
    const modalTitle = modal?.querySelector('.modal-title');

    if (jsonContent) {
      jsonContent.textContent = jsonString;
    }

    if (modalTitle) {
      modalTitle.textContent = `📄 ${sourceName} 레이어 JSON 미리보기`;
    }

    if (modal) {
      modal.style.display = 'flex';
    }
  }

  /**
   * JSON 미리보기 모달 닫기
   */
  closeJsonPreview() {
    const modal = document.getElementById('jsonPreviewModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  /**
   * 레이어를 미리보기용 JSON으로 직렬화
   * @param {Layer} layer - 레이어 객체
   * @returns {Object}
   */
  serializeLayerForPreview(layer) {
    const json = {
      id: layer.id,
      name: layer.name,
      type: layer.type,
      visible: layer.visible,
      order: layer.order
    };

    const currentPreset = CONFIG.POLYGON_COLOR_PRESETS[CONFIG.POLYGON_COLOR_PRESET] || CONFIG.POLYGON_COLOR_PRESETS.default;

    if (layer.id === 'polygon') {
      json.color = `linear-gradient(180deg, ${currentPreset.gradientStart} 0%, ${currentPreset.gradientEnd} 100%)`;
    } else if (layer.id === 'points') {
      json.color = currentPreset.pointColor;
    } else if (layer.id === 'lines') {
      json.color = `linear-gradient(180deg, ${currentPreset.gradientStart} 0%, ${currentPreset.gradientEnd} 100%)`;
    } else if (layer.id === 'histogram') {
      const barColorStart = CONFIG.getColor('--chart-bar-color');
      const barColorEnd = CONFIG.getColor('--chart-bar-color-end');
      json.color = `linear-gradient(180deg, ${barColorStart} 0%, ${barColorEnd} 100%)`;
    } else if (layer.id === 'dashed-lines') {
      json.color = CONFIG.getColor('--chart-dashed-line-color');
    }

    if (layer.p_id) {
      json.p_id = layer.p_id;
    }

    if (layer.data && Object.keys(layer.data).length > 0) {
      json.data = { ...layer.data };
      delete json.data.animationProgress;
      delete json.data.coords;
      delete json.data.ellipsisInfo;
      delete json.data.dataType;
    }

    if (layer.children && layer.children.length > 0) {
      json.children = layer.children.map(child => this.serializeLayerForPreview(child));
    }

    return json;
  }

  /**
   * 레이어 JSON 미리보기 표시 (헬퍼 메서드)
   * @param {Layer} layer - 표시할 레이어
   */
  showLayerJsonPreview(layer) {
    const modal = document.getElementById('jsonPreviewModal');
    const content = document.getElementById('jsonPreviewContent');

    if (!modal || !content) return;

    const layerData = {
      id: layer.id,
      name: layer.name,
      type: layer.type,
      visible: layer.visible,
      order: layer.order,
      p_id: layer.p_id,
      data: layer.data,
      childrenCount: layer.children?.length || 0,
      children: layer.children?.map(child => ({
        id: child.id,
        name: child.name,
        type: child.type,
        visible: child.visible,
        order: child.order,
        data: child.data
      })) || []
    };

    const json = JSON.stringify(layerData, null, 2);
    content.textContent = json;

    modal.style.display = 'flex';
  }

  /**
   * 하이라이트 테스트 버튼 초기화
   */
  initHighlightTestButtons() {
    const highlightCell1Btn = document.getElementById('highlightCell1');
    const highlightRow2Btn = document.getElementById('highlightRow2');
    const highlightCell3Btn = document.getElementById('highlightCell3');
    const clearHighlightBtn = document.getElementById('clearHighlight');

    const jsonCell1Btn = document.getElementById('jsonCell1');
    const jsonRow2Btn = document.getElementById('jsonRow2');
    const jsonCell3Btn = document.getElementById('jsonCell3');

    highlightCell1Btn?.addEventListener('click', () => {
      this.app.tableRenderer.clearHighlight();
      this.app.tableRenderer.highlightCell(0, 2, 1.0);
    });

    jsonCell1Btn?.addEventListener('click', () => {
      const cellLayer = this.app.tableRenderer.findCellLayer(0, 2);
      if (cellLayer) {
        this.showLayerJsonPreview(cellLayer);
      } else {
        MessageManager.error('셀 레이어를 찾을 수 없습니다.');
      }
    });

    highlightRow2Btn?.addEventListener('click', () => {
      this.app.tableRenderer.clearHighlight();
      this.app.tableRenderer.highlightCell(1, null, 1.0);
    });

    jsonRow2Btn?.addEventListener('click', () => {
      const rowLayer = this.app.tableRenderer.findRowLayer(1);
      if (rowLayer) {
        this.showLayerJsonPreview(rowLayer);
      } else {
        MessageManager.error('행 레이어를 찾을 수 없습니다.');
      }
    });

    highlightCell3Btn?.addEventListener('click', () => {
      this.app.tableRenderer.clearHighlight();
      this.app.tableRenderer.highlightCell(2, 1, 1.0);
    });

    jsonCell3Btn?.addEventListener('click', () => {
      const cellLayer = this.app.tableRenderer.findCellLayer(2, 1);
      if (cellLayer) {
        this.showLayerJsonPreview(cellLayer);
      } else {
        MessageManager.error('셀 레이어를 찾을 수 없습니다.');
      }
    });

    clearHighlightBtn?.addEventListener('click', () => {
      this.app.tableRenderer.clearHighlight();
    });
  }

  /**
   * 하이라이트 테스트 버튼 표시
   */
  showHighlightTestButtons() {
    const group = document.querySelector('.highlight-test-group');
    if (group) {
      group.style.display = 'block';
    }
  }

  /**
   * 애니메이션 테스트 버튼 초기화
   */
  initAnimationTestButtons() {
    const addAnimationBtn = document.getElementById('addAnimationBtn');
    const playAllAnimBtn = document.getElementById('playAllAnimBtn');
    const clearAnimBtn = document.getElementById('clearAnimBtn');
    const savedAnimList = document.getElementById('savedAnimList');

    const rowIndexInput = document.getElementById('animRowIndex');
    const colIndexInput = document.getElementById('animColIndex');
    const repeatInput = document.getElementById('animRepeat');
    const durationInput = document.getElementById('animDuration');
    const blinkEnabledCheckbox = document.getElementById('animBlinkEnabled');
    const repeatLabel = document.getElementById('animRepeatLabel');

    // 블링크 체크박스 변경 시 반복 필드 표시/숨김
    blinkEnabledCheckbox?.addEventListener('change', () => {
      if (repeatLabel) {
        repeatLabel.style.display = blinkEnabledCheckbox.checked ? '' : 'none';
      }
    });

    // 현재 활성화된 테이블 렌더러 가져오기
    const getActiveTableRenderer = () => {
      return this.app.tableRenderers?.[0] || this.app.tableRenderer;
    };

    // 입력값 읽기 헬퍼 (빈 값은 null로 처리)
    const getAnimationOptions = () => {
      const rowVal = rowIndexInput?.value;
      const colVal = colIndexInput?.value;
      return {
        rowIndex: rowVal !== '' ? parseInt(rowVal) : null,
        colIndex: colVal !== '' ? parseInt(colVal) : null,
        repeat: parseInt(repeatInput?.value) || 3,
        duration: parseInt(durationInput?.value) || 1500
      };
    };

    // 저장된 애니메이션 목록 UI 업데이트
    const updateSavedAnimList = () => {
      const renderer = getActiveTableRenderer();
      if (!renderer || !savedAnimList) return;

      const animations = renderer.getSavedAnimations();
      savedAnimList.innerHTML = '';

      if (animations.length === 0) {
        savedAnimList.innerHTML = '<div style="color: var(--color-text-light); font-size: 10px;">저장된 애니메이션 없음</div>';
        return;
      }

      animations.forEach(anim => {
        const item = document.createElement('div');
        item.className = 'saved-anim-item';

        // 애니메이션 타입 표시
        let typeText;
        if (anim.rowIndex !== null && anim.colIndex !== null) {
          typeText = `셀 [${anim.rowIndex}, ${anim.colIndex}]`;
        } else if (anim.rowIndex !== null) {
          typeText = `행 ${anim.rowIndex} 전체`;
        } else if (anim.colIndex !== null) {
          typeText = `열 ${anim.colIndex} 전체`;
        } else {
          typeText = '전체';
        }

        item.innerHTML = `
          <span class="anim-info">${typeText} (${anim.repeat}회, ${anim.duration}ms)</span>
          <button class="remove-btn" data-id="${anim.id}">×</button>
        `;

        // 삭제 버튼 이벤트
        item.querySelector('.remove-btn').addEventListener('click', (e) => {
          const id = parseFloat(e.target.dataset.id);
          renderer.removeAnimation(id);
          updateSavedAnimList();
        });

        savedAnimList.appendChild(item);
      });
    };

    // 애니메이션 추가
    addAnimationBtn?.addEventListener('click', () => {
      const renderer = getActiveTableRenderer();
      if (!renderer) {
        MessageManager.warning('테이블이 없습니다. 먼저 도수분포표를 생성하세요.');
        return;
      }
      const opts = getAnimationOptions();

      // 행과 열 둘 다 비어있으면 경고
      if (opts.rowIndex === null && opts.colIndex === null) {
        MessageManager.warning('행 또는 열을 지정해주세요.');
        return;
      }

      renderer.addAnimation(opts);
      updateSavedAnimList();
      MessageManager.success('애니메이션이 추가되었습니다.');
    });

    // 모든 애니메이션 재생
    playAllAnimBtn?.addEventListener('click', () => {
      const renderer = getActiveTableRenderer();
      if (!renderer) {
        MessageManager.warning('테이블이 없습니다. 먼저 도수분포표를 생성하세요.');
        return;
      }
      if (renderer.getSavedAnimations().length === 0) {
        MessageManager.warning('저장된 애니메이션이 없습니다. 먼저 애니메이션을 추가하세요.');
        return;
      }
      const blinkEnabled = blinkEnabledCheckbox?.checked ?? true;
      renderer.playAllAnimations({ blinkEnabled });
    });

    // 애니메이션 초기화
    clearAnimBtn?.addEventListener('click', () => {
      const renderer = getActiveTableRenderer();
      if (renderer) {
        renderer.stopCellAnimation();
        renderer.clearSavedAnimations();
        updateSavedAnimList();
        MessageManager.success('애니메이션이 초기화되었습니다.');
      }
    });

    // 초기 목록 업데이트
    updateSavedAnimList();
  }
}

export default LayerPanelController;

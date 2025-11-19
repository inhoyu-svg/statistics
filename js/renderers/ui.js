/**
 * UI 렌더링 레이어
 * 통계 카드 및 도수분포표 렌더링
 */

import CONFIG from '../config.js';
import Utils from '../utils/utils.js';

class UIRenderer {
  /**
   * 통계 요약 카드 렌더링 (템플릿 리터럴 대신 DOM 조작)
   */
  static renderStatsCards(stats) {
    const container = document.getElementById('statsSummary');
    container.innerHTML = ''; // 초기화

    const statsData = [
      {
        label: '데이터 개수',
        value: stats.count,
        tooltip: '전체 데이터의 개수입니다. 표본의 크기를 나타냅니다.'
      },
      {
        label: '최솟값',
        value: stats.min,
        tooltip: '데이터 중 가장 작은 값입니다.'
      },
      {
        label: '최댓값',
        value: stats.max,
        tooltip: '데이터 중 가장 큰 값입니다.'
      },
      {
        label: '범위',
        value: stats.range,
        tooltip: '최댓값과 최솟값의 차이입니다. 데이터의 분산 정도를 나타냅니다.'
      },
      {
        label: '평균',
        value: Utils.formatNumber(stats.mean),
        tooltip: '모든 데이터 값을 더한 후 개수로 나눈 값입니다. 데이터의 중심 경향을 나타냅니다.'
      },
      {
        label: '중앙값',
        value: Utils.formatNumber(stats.median),
        tooltip: '데이터를 크기순으로 정렬했을 때 중앙에 위치한 값입니다. 극단값의 영향을 덜 받습니다.'
      }
    ];

    statsData.forEach(stat => {
      const card = document.createElement('div');
      card.className = 'stat-card';

      const h3 = document.createElement('h3');
      h3.textContent = stat.label;

      const p = document.createElement('p');
      p.textContent = stat.value;

      // 툴팁 추가
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = stat.tooltip;

      card.appendChild(h3);
      card.appendChild(p);
      card.appendChild(tooltip);
      container.appendChild(card);
    });

    // stats-summary 표시
    container.classList.add('active');
  }

  /**
   * 도수분포표 렌더링 (XSS 방지)
   */
  static renderFrequencyTable(classes, total, labels = null) {
    const table = document.getElementById('frequencyTable');
    table.innerHTML = ''; // 초기화

    // 라벨 가져오기 (커스텀 라벨 또는 기본값)
    const tableLabels = labels || CONFIG.DEFAULT_LABELS.table;

    // thead 생성
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = [
      tableLabels.class,
      tableLabels.midpoint,
      tableLabels.frequency,
      tableLabels.relativeFrequency,
      tableLabels.cumulativeFrequency,
      tableLabels.cumulativeRelativeFrequency
    ];

    headers.forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // tbody 생성
    const tbody = document.createElement('tbody');

    classes.forEach(classData => {
      // 도수가 0인 계급은 표에서 제외
      if (classData.frequency === 0) return;

      const row = document.createElement('tr');

      const cells = [
        `${classData.min} ~ ${classData.max}`,
        Utils.formatNumber(classData.midpoint),
        classData.frequency,
        `${classData.relativeFreq}%`,
        classData.cumulativeFreq,
        `${classData.cumulativeRelFreq}%`
      ];

      cells.forEach(cellText => {
        const td = document.createElement('td');
        td.textContent = cellText;
        row.appendChild(td);
      });

      tbody.appendChild(row);
    });

    // 합계 행
    const totalRow = document.createElement('tr');
    totalRow.style.background = CONFIG.getColor('--color-primary');
    totalRow.style.color = 'white';
    totalRow.style.fontWeight = 'bold';

    // 첫 번째 셀: "합계" (colspan=2)
    const td1 = document.createElement('td');
    td1.colSpan = 2;
    td1.textContent = '합계';
    totalRow.appendChild(td1);

    // 나머지 셀들
    const totalCells = [total, '100%', total, '100%'];
    totalCells.forEach(cellText => {
      const td = document.createElement('td');
      td.textContent = cellText;
      totalRow.appendChild(td);
    });

    tbody.appendChild(totalRow);
    table.appendChild(tbody);
  }
}

export default UIRenderer;

// ============================================================================
// Layer Utils - 레이어 유틸리티 함수
// ============================================================================

/**
 * 고유 ID 생성 (UUID v4)
 * @returns {string} 생성된 UUID
 */
export function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 레이어 통계 정보 계산
 * @param {Array} flattenedLayers - 평탄화된 레이어 배열 [{layer, depth}, ...]
 * @returns {Object} 통계 정보
 */
export function calculateStats(flattenedLayers) {
  const typeCounts = {};

  flattenedLayers.forEach(item => {
    const type = item.layer.type;
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  return {
    total: flattenedLayers.length,
    visible: flattenedLayers.filter(item => item.layer.visible).length,
    byType: typeCounts,
    maxDepth: flattenedLayers.length > 0
      ? Math.max(...flattenedLayers.map(item => item.depth))
      : 0
  };
}

/**
 * 레이어 트리 디버그 출력
 * @param {Layer} rootLayer - 루트 레이어
 * @param {Object} stats - 통계 정보
 */
export function printDebugTree(rootLayer, stats) {
  console.log('=== LayerManager Debug Info ===');
  console.log('Stats:', stats);
  console.log('Layer Tree:');

  const printTree = (layer, indent = 0) => {
    const prefix = '  '.repeat(indent);
    const visIcon = layer.visible ? '👁' : '🚫';
    console.log(`${prefix}${visIcon} ${layer.toString()}`);

    layer.children.forEach(child => printTree(child, indent + 1));
  };

  printTree(rootLayer);
  console.log('================================');
}

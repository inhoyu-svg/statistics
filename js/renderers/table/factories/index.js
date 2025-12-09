/**
 * 테이블 팩토리 모듈 통합 export
 */

import CONFIG from '../../../config.js';
import BaseTableFactory from './BaseTableFactory.js';
import CategoryMatrixFactory from './CategoryMatrixFactory.js';
import BasicTableFactory from './BasicTableFactory.js';
import StemLeafFactory from './StemLeafFactory.js';

/**
 * 테이블 팩토리 라우터
 * 테이블 타입에 따라 적절한 팩토리 반환
 */
class TableFactoryRouter {
  /**
   * 타입에 맞는 팩토리로 테이블 레이어 생성
   * @param {string} type - 테이블 타입
   * @param {LayerManager} layerManager - 레이어 매니저
   * @param {any} data - 파싱된 데이터
   * @param {Object} config - 테이블 설정
   * @param {string} tableId - 테이블 고유 ID
   */
  static createTableLayers(type, layerManager, data, config = null, tableId = 'table-1') {
    switch (type) {
      case CONFIG.TABLE_TYPES.CATEGORY_MATRIX:
        return CategoryMatrixFactory.createTableLayers(layerManager, data, config, tableId);

      case CONFIG.TABLE_TYPES.BASIC_TABLE:
        return BasicTableFactory.createTableLayers(layerManager, data, config, tableId);

      case CONFIG.TABLE_TYPES.STEM_LEAF:
        return StemLeafFactory.createTableLayers(layerManager, data, config, tableId);

      case CONFIG.TABLE_TYPES.FREQUENCY:
      default:
        // 도수분포표는 기존 TableLayerFactory 사용 (별도 처리)
        return null;
    }
  }

  /**
   * ParserAdapter의 통일된 출력 형식(ParsedTableData)으로 테이블 레이어 생성
   * @param {LayerManager} layerManager - 레이어 매니저
   * @param {Object} adaptedData - ParserAdapter.adapt() 출력
   * @param {Object} config - 테이블 설정
   * @param {string} tableId - 테이블 고유 ID
   */
  static createFromAdaptedData(layerManager, adaptedData, config = null, tableId = 'table-1') {
    const { type, metadata } = adaptedData;

    // config에 adaptedData 정보 병합
    const mergedConfig = {
      ...config,
      adaptedData  // 팩토리에서 rowCount, columnCount 등 활용 가능
    };

    switch (type) {
      case CONFIG.TABLE_TYPES.STEM_LEAF:
        return StemLeafFactory.createFromAdaptedData(layerManager, adaptedData, mergedConfig, tableId);

      case CONFIG.TABLE_TYPES.CATEGORY_MATRIX:
        return CategoryMatrixFactory.createFromAdaptedData(layerManager, adaptedData, mergedConfig, tableId);

      case CONFIG.TABLE_TYPES.BASIC_TABLE:
        return BasicTableFactory.createFromAdaptedData(layerManager, adaptedData, mergedConfig, tableId);

      case CONFIG.TABLE_TYPES.FREQUENCY:
      default:
        // 도수분포표는 별도 처리 (기존 TableLayerFactory 사용)
        return null;
    }
  }

  /**
   * 타입에 맞는 팩토리 클래스 반환
   * @param {string} type - 테이블 타입
   * @returns {Class|null}
   */
  static getFactory(type) {
    switch (type) {
      case CONFIG.TABLE_TYPES.CATEGORY_MATRIX:
        return CategoryMatrixFactory;
      case CONFIG.TABLE_TYPES.BASIC_TABLE:
        return BasicTableFactory;
      case CONFIG.TABLE_TYPES.STEM_LEAF:
        return StemLeafFactory;
      default:
        return null;
    }
  }

  /**
   * 도수분포표가 아닌 타입인지 확인
   * @param {string} type - 테이블 타입
   * @returns {boolean}
   */
  static isCustomType(type) {
    return type !== CONFIG.TABLE_TYPES.FREQUENCY &&
           Object.values(CONFIG.TABLE_TYPES).includes(type);
  }
}

export {
  TableFactoryRouter,
  BaseTableFactory,
  CategoryMatrixFactory,
  BasicTableFactory,
  StemLeafFactory
};

export default TableFactoryRouter;

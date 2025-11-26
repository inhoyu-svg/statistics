/**
 * Configuration Module
 * Centralized configuration management
 */

// 환경 감지
const isDevelopment = window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname === '';

// 기본 서버 URL
const DEFAULT_DEV_SERVER = 'http://localhost:4173';
const DEFAULT_PROD_SERVER = window.location.origin;

// 환경에 따른 서버 URL 설정
export const API_SERVER_URL = isDevelopment
  ? (import.meta.env.VITE_API_SERVER_URL || DEFAULT_DEV_SERVER)
  : (import.meta.env.VITE_API_SERVER_URL || DEFAULT_PROD_SERVER);

// 번들 파일 경로
export const BUNDLE_PATH = `${API_SERVER_URL}/dist`;
export const ASSETS_PATH = `${API_SERVER_URL}/assets`;
export const STYLES_PATH = `${API_SERVER_URL}/src/styles`;

// 디버그 모드
export const DEBUG = isDevelopment;

// 설정 정보 출력 (디버그 모드)
if (DEBUG) {
  console.log('[Config] Environment:', isDevelopment ? 'Development' : 'Production');
  console.log('[Config] API Server:', API_SERVER_URL);
  console.log('[Config] Bundle Path:', BUNDLE_PATH);
}

export default {
  API_SERVER_URL,
  BUNDLE_PATH,
  ASSETS_PATH,
  STYLES_PATH,
  DEBUG,
  isDevelopment
};

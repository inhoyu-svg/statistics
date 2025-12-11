/**
 * UI 메시지 관리
 */

import CONFIG from '../config.js';

class MessageManager {
  static show(message, type = 'error') {
    const messageBox = document.getElementById('messageBox');
    if (!messageBox) {
      // messageBox가 없으면 콘솔에만 출력
      console.warn(`[MessageManager] ${type}: ${message}`);
      return;
    }
    messageBox.textContent = message;
    messageBox.className = `message-box show ${type}`;

    // 자동으로 메시지 숨기기
    setTimeout(() => {
      this.hide();
    }, CONFIG.MESSAGE_DISPLAY_TIME);
  }

  static hide() {
    const messageBox = document.getElementById('messageBox');
    if (!messageBox) return;
    messageBox.classList.remove('show');
  }

  static error(message) {
    this.show(message, 'error');
  }

  static success(message) {
    this.show(message, 'success');
  }

  static warning(message) {
    this.show(message, 'warning');
  }
}

export default MessageManager;

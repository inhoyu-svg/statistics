/**
 * Sound Manager Module
 * Handles sound effects playback through Flutter WebView bridge or HTML5 Audio
 */

import { log, warn, error } from '../utils/logger.js';

// Sound file mapping (Flutter file names to web file names)
const SOUND_MAP = {
    '등장 (높은 도로롱).mp3': '등장 (높은 도로롱).mp3',
    '기타_마우스 클릭.mp3': '기타_마우스 클릭.mp3',
    '등장 (또로롱).mp3': '등장 (또로롱).mp3',
    'UI 선택_딸깍2.mp3': 'UI 선택_딸깍2.mp3',
    'UI 선택_딸깍1.mp3': 'UI 선택_딸깍1.mp3',
    '일자 밑줄 효과음.mp3': '일자 밑줄 효과음.mp3',
    '동그라미 효과음.mp3': '동그라미 효과음.mp3',
    '별표 효과음.mp3': '별표 효과음.mp3',
    '구불구불 밑줄 효과음.mp3': '구불구불 밑줄 효과음.mp3',
    '화면 이동 Main (챠악).mp3': '화면 이동 Main (챠악).mp3'
};

// Audio cache for web playback
const audioCache = new Map();

/**
 * Plays a sound effect through Flutter WebView or HTML5 Audio
 * @param {string} soundFileName - Name of the sound file to play
 * @param {number} volume - Volume level (0.0 to 1.0)
 * @param {string|null} elementId - Optional element ID for tracking
 * @returns {Promise<boolean>} - Promise that resolves to true if successful
 */
export function playSoundEffect(soundFileName, volume = 0.5, elementId = null) {
    if (!soundFileName) return Promise.resolve(false);

    try {
        // Try Flutter WebView first
        if (window.flutter_inappwebview && window.flutter_inappwebview.callHandler) {
            window.flutter_inappwebview.callHandler('SoundEffectChannel', JSON.stringify({
                fileName: soundFileName,
                volume: volume,
                elementId: elementId
            }));
            log(`[Sound Flutter] ${soundFileName} (볼륨: ${Math.round(volume * 100)}%)`);
            return Promise.resolve(true);
        }

        // Fallback to HTML5 Audio for web browser
        const webFileName = SOUND_MAP[soundFileName] || soundFileName;
        const soundPath = `../../public/assets/sounds/${webFileName}`;

        // Use cached audio or create new one
        let audio = audioCache.get(soundPath);
        if (!audio) {
            audio = new Audio(soundPath);
            audioCache.set(soundPath, audio);
        }

        // Clone for simultaneous playback
        const audioClone = audio.cloneNode();
        audioClone.volume = volume;
        audioClone.play().catch(err => {
            warn(`[Sound Web] Failed to play ${webFileName}:`, err.message);
        });
        return Promise.resolve(true);

    } catch (err) {
        error(`[Sound Error] ${soundFileName}:`, err);
        return Promise.resolve(false);
    }
}

/**
 * Plays sound effect based on element ID pattern matching
 * @param {string} elementId - Element ID to match against sound patterns
 */
export function playSoundForElementById(elementId) {
    if (!elementId) {
        log('[Sound] elementId 없음');
        return;
    }

    // 1. focusTitle로 시작 (단, focusTitle1 제외)
    if (elementId.startsWith('focusTitle') && elementId !== 'focusTitle1') {
        playSoundEffect('등장 (높은 도로롱).mp3', 0.5, elementId);
        return;
    }

    // 2. focusReview로 시작 (focusReview1, focusReview1_1, focusReview2 등)
    if (elementId.startsWith('focusReview')) {
        playSoundEffect('기타_마우스 클릭.mp3', 0.5, elementId);
        return;
    }

    // 3. todaySceneTag로 시작 (todaySceneTag1, todaySceneTag1_1 등)
    if (elementId.startsWith('todaySceneTag')) {
        playSoundEffect('등장 (또로롱).mp3', 0.5, elementId);
        return;
    }

    // 4. focusScene로 시작하고 text를 포함 (단, focusScene1_1text1 제외)
    if (elementId.startsWith('focusScene') && elementId.includes('text') && elementId !== 'focusScene1_1text1') {
        playSoundEffect('UI 선택_딸깍2.mp3', 0.5, elementId);
        return;
    }

    // 5. focusScene로 시작하고 Title을 포함 (focusScene2_1Title, focusScene2_2Title 등)
    if (elementId.startsWith('focusScene') && elementId.includes('Title')) {
        playSoundEffect('UI 선택_딸깍1.mp3', 0.5, elementId);
        return;
    }
}

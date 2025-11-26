// Title Effects Module
// Main title 효과 관련 함수들

import { applyKeywordItemCombinedEffect } from './glow-effects.js';
import { log, warn, error } from '../utils/logger.js';

/**
 * main-title 효과 트리거 (element 객체 직접 전달)
 * @param {HTMLElement} element - main-title 요소
 */
export function triggerMainTitleEffectsOnElement(element) {
    if (!element) {
        log(`[Main Title Effect] element 없음`);
        return;
    }

    log(`[Main Title Effect] element 체크 중 - classList:`, Array.from(element.classList));

    // main-title인지 확인
    if (!element.classList.contains('main-title')) {
        log(`[Main Title Effect] element는 main-title이 아님`);
        return;
    }

    log(`[Main Title Effect] element 처리 시작`);

    // 1순위: 하이라이트 스팬 찾기 (화살표만 있는 스팬 제외)
    const allHighlightSpans = element.querySelectorAll('[class*="highlight-"]');
    // 화살표 특수문자만 있는 스팬은 제외
    const highlightSpans = Array.from(allHighlightSpans).filter(span => {
        const text = span.textContent.trim();
        // 화살표만 있는지 체크 (다른 문자가 하나라도 있으면 포함)
        const onlyArrows = /^[▲▼◀▶\s]+$/.test(text);
        return !onlyArrows;
    });

    if (highlightSpans.length > 0) {
        log(`[Main Title Effect] ${highlightSpans.length}개 하이라이트 스팬 발견 (화살표만 있는 스팬 제외)`);
        const randomSpan = highlightSpans[Math.floor(Math.random() * highlightSpans.length)];

        setTimeout(() => {
            const effects = ['glow-pulse-star', 'glow-double-pulse', 'glow-double-pulse-star'];
            const effectType = effects[Math.floor(Math.random() * effects.length)];
            log(`[Main Title Effect] 하이라이트 스팬에 ${effectType} 효과 적용`);
            applyKeywordItemCombinedEffect(randomSpan, effectType);
        }, 1300);
        return;
    }

    // 2순위: 수식 찾기 (최상위 수식 컨테이너만 선택)
    const mathElements = element.querySelectorAll('mjx-container, .math, .mathjax-container');
    if (mathElements.length > 0) {
        log(`[Main Title Effect] ${mathElements.length}개 수식 발견`);
        const randomMath = mathElements[Math.floor(Math.random() * mathElements.length)];

        setTimeout(() => {
            const effects = ['glow-pulse-star', 'glow-double-pulse', 'glow-double-pulse-star'];
            const effectType = effects[Math.floor(Math.random() * effects.length)];
            log(`[Main Title Effect] 수식에 ${effectType} 효과 적용`);
            applyKeywordItemCombinedEffect(randomMath, effectType);
        }, 1300);
        return;
    }

    // 3순위: 요소 전체에 효과 적용 (DOM 수정 없이)
    log(`[Main Title Effect] 하이라이트/수식 없음 - 요소 전체에 효과 적용`);
    setTimeout(() => {
        const effects = ['glow-pulse-star', 'glow-double-pulse', 'glow-double-pulse-star'];
        const effectType = effects[Math.floor(Math.random() * effects.length)];
        log(`[Main Title Effect] 전체 요소에 ${effectType} 효과 적용`);
        applyKeywordItemCombinedEffect(element, effectType);
    }, 1300);
}

/**
 * main-title 효과 트리거 (ID 기반 - 호환성)
 * @param {string} targetElementId - main-title 요소 ID
 */
export function triggerMainTitleEffects(targetElementId) {
    const element = document.getElementById(targetElementId);
    if (element) {
        triggerMainTitleEffectsOnElement(element);
    }
}

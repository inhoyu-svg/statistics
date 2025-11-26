// Glow Effects Module
// Glow 효과 트리거 및 관리 관련 함수들

import { createSVGEffect } from './svg-effects.js';
import { log, warn, error } from '../utils/logger.js';

/**
 * keyword-item에 조합 효과 적용 (5-9번)
 * @param {HTMLElement} element - 효과를 적용할 요소
 * @param {string} effectType - 효과 타입
 */
export function applyKeywordItemCombinedEffect(element, effectType) {
    if (effectType === 'glow-circle-check') {
        // 9번: 동그라미(0ms) -> 체크(200ms), 모두 400ms에 사라짐
        createSVGEffect(element, 'glow-circle', 0, null, 200);
        setTimeout(() => {
            createSVGEffect(element, 'glow-check');
        }, 200);
    } else if (effectType === 'glow-pulse-star') {
        // 5번: 밑줄(0ms) -> 별(200ms), 모두 600ms에 사라짐
        // rect 미리 계산 (레이아웃 변경 전)
        const rect = element.getBoundingClientRect();
        createSVGEffect(element, 'glow-pulse', 0, null, 200, rect);
        setTimeout(() => {
            createSVGEffect(element, 'glow-star', 0, null, 0, rect);
        }, 200);
    } else if (effectType === 'glow-double-pulse') {
        // 6번: 밑줄1(0ms) -> 밑줄2(200ms), 모두 600ms에 사라짐
        // rect 미리 계산 (레이아웃 변경 전)
        const rect = element.getBoundingClientRect();
        createSVGEffect(element, 'glow-pulse', 0, null, 200, rect);
        setTimeout(() => {
            createSVGEffect(element, 'glow-pulse', 8, null, 0, rect);
        }, 200);
    } else if (effectType === 'glow-double-pulse-star') {
        // 7번: 밑줄1(0ms) -> 밑줄2(200ms) -> 별(400ms), 모두 800ms에 사라짐
        // rect 미리 계산 (레이아웃 변경 전)
        const rect = element.getBoundingClientRect();
        createSVGEffect(element, 'glow-pulse', 0, null, 400, rect);
        setTimeout(() => {
            createSVGEffect(element, 'glow-pulse', 8, null, 200, rect);
        }, 200);
        setTimeout(() => {
            createSVGEffect(element, 'glow-star', 0, null, 0, rect);
        }, 400);
    } else if (effectType === 'glow-pulse-curl-star') {
        // 8번: 밑줄(0ms) -> 돼지꼬리(200ms) -> 별(400ms), 모두 800ms에 사라짐
        createSVGEffect(element, 'glow-pulse', 0, null, 400);
        setTimeout(() => {
            createSVGEffect(element, 'glow-curl', 0, null, 200);
        }, 200);
        setTimeout(() => {
            requestAnimationFrame(() => {
                const rect = element.getBoundingClientRect();
                const customOffset = {
                    top: rect.top + rect.height * 0.5 - 30,
                    left: rect.right + 80,
                    scale: 1.2
                };
                createSVGEffect(element, 'glow-star', 0, customOffset);
            });
        }, 400);
    } else if (effectType === 'glow-pulse-question') {
        // 10번: 밑줄(0ms) -> 물음표(200ms), 모두 600ms에 사라짐
        createSVGEffect(element, 'glow-pulse', 0, null, 200);
        setTimeout(() => {
            createSVGEffect(element, 'glow-question');
        }, 200);
    } else if (effectType === 'glow-circle-curl-arrow') {
        // 14번: 동그라미(0ms) -> 돼지꼬리(200ms) -> 화살표(400ms), 모두 800ms에 사라짐
        createSVGEffect(element, 'glow-circle', 0, null, 400);
        setTimeout(() => {
            createSVGEffect(element, 'glow-curl', 0, null, 200);
        }, 200);
        setTimeout(() => {
            createSVGEffect(element, 'glow-arrow');
        }, 400);
    } else if (effectType === 'glow-circle-star') {
        // 동그라미(0ms) -> 별(200ms), 모두 600ms에 사라짐
        // rect 미리 계산 (레이아웃 변경 전)
        const rect = element.getBoundingClientRect();
        createSVGEffect(element, 'glow-circle', 0, null, 200, rect);
        setTimeout(() => {
            createSVGEffect(element, 'glow-star', 0, null, 0, rect);
        }, 200);
    }
}

/**
 * Glow 효과 트리거 (ID 기반)
 * @param {string} targetElementId - 효과를 적용할 요소의 ID
 * @param {Set} glowEffectsApplied - 효과가 적용된 요소들을 추적하는 Set
 * @param {Function} triggerMainTitleEffects - main title 효과 트리거 함수
 * @param {Function} triggerTodayDefinitionKeywordEffects - today definition keyword 효과 트리거 함수
 * @param {Function} triggerContentTextEffects - content text 효과 트리거 함수
 * @param {Function} triggerSummarySceneTitleEffects - summary scene title 효과 트리거 함수
 * @param {Function} triggerContentTextEffectsOnElement - content text 효과 트리거 함수 (element 직접 전달)
 */
export function triggerGlowEffects(targetElementId, glowEffectsApplied, triggerMainTitleEffects, triggerTodayDefinitionKeywordEffects, triggerContentTextEffects, triggerSummarySceneTitleEffects, triggerContentTextEffectsOnElement) {
    log(`[triggerGlowEffects] 호출됨 - targetElementId: ${targetElementId}`);

    if (!targetElementId) {
        log(`[triggerGlowEffects] targetElementId가 없음`);
        return;
    }

    // focusReviewTitle은 완전히 제외
    if (targetElementId === 'focusReviewTitle1_1' || targetElementId === 'focusReviewTitle1_2' || targetElementId === 'focusReviewTitle1_3') {
        log(`[triggerGlowEffects] Review Title 제외 - 효과 적용 안 함`);
        return;
    }

    const element = document.getElementById(targetElementId);
    if (!element) {
        log(`[triggerGlowEffects] ${targetElementId} 요소를 찾을 수 없음`);
        return;
    }

    log(`[triggerGlowEffects] ${targetElementId} 요소 찾음, classList:`, Array.from(element.classList));

    // 0. focusReviewContent1_1, 1_2, 1_3 체크 (내부 explanation-text에 효과 적용)
    // 중요: targetElement가 focusReviewContent일 때만 효과 적용 (reveal만 되었을 때는 안 함)
    if (targetElementId === 'focusReviewContent1_1' || targetElementId === 'focusReviewContent1_2' || targetElementId === 'focusReviewContent1_3') {
        // 이미 처리했는지 확인
        if (glowEffectsApplied && glowEffectsApplied.has(targetElementId)) {
            log(`[triggerGlowEffects] Review Content ${targetElementId} 이미 처리됨 - 스킵`);
            return;
        }

        log(`[triggerGlowEffects] Review Content TARGET 감지 -> 내부 explanation-text에 효과 적용`);
        // 처리 완료 표시 (먼저 추가하여 중복 방지)
        if (glowEffectsApplied) {
            glowEffectsApplied.add(targetElementId);
        }

        const explanationText = element.querySelector('.explanation-text');
        if (explanationText) {
            triggerContentTextEffectsOnElement(explanationText);
        }
        return;
    }

    // 1. main-title 체크 (본인만)
    if (element.classList.contains('main-title')) {
        log(`[triggerGlowEffects] main-title 감지 -> triggerMainTitleEffects 호출`);
        triggerMainTitleEffects(targetElementId);
        return;
    }

    // 2. today-definition-text 체크 (본인만)
    if (element.classList.contains('today-definition-text')) {
        log(`[triggerGlowEffects] today-definition-text 감지 -> triggerTodayDefinitionKeywordEffects 호출`);
        triggerTodayDefinitionKeywordEffects(targetElementId);
        return;
    }

    // 3. explanation-text, definition-text, equation-aligned 체크 (본인만)
    if (element.classList.contains('explanation-text') ||
        element.classList.contains('definition-text') ||
        element.classList.contains('equation-aligned')) {
        log(`[triggerGlowEffects] content text 클래스 감지 -> triggerContentTextEffects 호출`);
        triggerContentTextEffects(targetElementId);
        return;
    }

    // 4. summary 씬의 scene-title 체크 (본인만)
    if (element.classList.contains('scene-title')) {
        // focusReviewTitle 내부의 scene-title은 제외
        const reviewTitleParent = element.closest('[id^="focusReviewTitle"]');
        if (reviewTitleParent) {
            log(`[triggerGlowEffects] Review Title의 scene-title 제외`);
            return;
        }

        const summaryScene = element.closest('.summary-scene');
        if (summaryScene) {
            log(`[triggerGlowEffects] summary scene-title 감지 -> triggerSummarySceneTitleEffects 호출`);
            triggerSummarySceneTitleEffects(targetElementId);
            return;
        }
    }

    log(`[triggerGlowEffects] ${targetElementId}는 glow 효과 대상이 아님 (클래스: ${Array.from(element.classList).join(', ')})`);
}

/**
 * 새로 추가된 요소에만 Glow 효과 트리거
 * @param {Array<string>} revealElements - reveal될 요소 ID 배열
 * @param {Set} glowEffectsApplied - 효과가 적용된 요소들을 추적하는 Set
 * @param {Function} triggerMainTitleEffectsOnElement - main title 효과 트리거 함수 (element 직접 전달)
 * @param {Function} triggerTodayDefinitionKeywordEffectsOnElement - today definition keyword 효과 트리거 함수 (element 직접 전달)
 * @param {Function} triggerContentTextEffectsOnElement - content text 효과 트리거 함수 (element 직접 전달)
 * @param {Function} triggerSummarySceneTitleEffectsOnElement - summary scene title 효과 트리거 함수 (element 직접 전달)
 * @param {Function} triggerGlowEffectsCallback - triggerGlowEffects 함수 (ID 기반 호출용)
 */
export function triggerGlowEffectsForNewElements(revealElements, glowEffectsApplied, triggerMainTitleEffectsOnElement, triggerTodayDefinitionKeywordEffectsOnElement, triggerContentTextEffectsOnElement, triggerSummarySceneTitleEffectsOnElement, triggerGlowEffectsCallback) {
    if (!revealElements || revealElements.length === 0) return;

    // 이전에 적용된 요소들 추적 (항상 초기화 - 프레임 전환 시 리셋)
    // constructor에서 초기화하므로 여기서는 체크만 함
    if (!glowEffectsApplied) {
        glowEffectsApplied = new Set();
    }

    log(`[Glow Effects] revealElements 체크:`, revealElements);

    // 새로 추가된 요소만 필터링
    const newElements = revealElements.filter(elementId => {
        const element = document.getElementById(elementId);
        if (!element) {
            log(`[Glow Effects Filter] ${elementId} 요소를 찾을 수 없음`);
            return false;
        }

        // 이미 적용한 요소는 제외
        if (glowEffectsApplied.has(elementId)) {
            log(`[Glow Effects Filter] ${elementId} 이미 적용됨 - 스킵`);
            return false;
        }

        // Review 관련 요소 제외
        if (elementId === 'focusReviewTitle1_1' || elementId === 'focusReviewTitle1_2' || elementId === 'focusReviewTitle1_3') {
            log(`[Glow Effects Filter] ${elementId} Review Title 제외`);
            return false;
        }
        if (elementId === 'focusReview1_1' || elementId === 'focusReview1_2' || elementId === 'focusReview1_3') {
            log(`[Glow Effects Filter] ${elementId} Review 컨테이너 제외`);
            return false;
        }
        // focusReviewContent는 제외하지 않음 - triggerGlowEffects에서 처리
        if (elementId === 'focusReviewContent1_1' || elementId === 'focusReviewContent1_2' || elementId === 'focusReviewContent1_3') {
            log(`[Glow Effects Filter] ${elementId} Review Content 통과 - triggerGlowEffects로 전달`);
            return true; // 통과시켜서 triggerGlowEffects 호출되도록
        }

        // Glow 대상 클래스 체크 (본인 또는 자식)
        const isGlowTarget =
            element.classList.contains('main-title') ||
            element.classList.contains('today-definition-text') ||
            element.classList.contains('explanation-text') ||
            element.classList.contains('definition-text') ||
            element.classList.contains('equation-aligned') ||
            (element.classList.contains('scene-title') && element.parentElement && element.parentElement.id && element.parentElement.id.includes('focusOutroScene'));

        // 자식에 glow 대상이 있는지도 체크
        const mainTitle = element.querySelector('.main-title');
        const todayDef = element.querySelector('.today-definition-text');
        const explanationText = element.querySelector('.explanation-text');
        const definitionText = element.querySelector('.definition-text');
        const equationAligned = element.querySelector('.equation-aligned');

        // summary scene의 scene-title 찾기 (focusOutroScene로 시작하는 ID의 자식)
        let sceneTitle = null;
        const titleDivs = element.querySelectorAll('[id^="focusOutroScene"] .scene-title');
        if (titleDivs.length > 0) {
            sceneTitle = titleDivs[0];
        }

        const hasGlowChild = mainTitle || todayDef || explanationText || definitionText || equationAligned || sceneTitle;

        log(`[Glow Effects Filter] ${elementId} - 본인: ${isGlowTarget}, 자식: ${!!hasGlowChild}`, {
            mainTitle: !!mainTitle,
            todayDef: !!todayDef,
            explanationText: !!explanationText,
            definitionText: !!definitionText,
            equationAligned: !!equationAligned,
            sceneTitle: !!sceneTitle
        });

        return isGlowTarget || hasGlowChild;
    });

    log(`[Glow Effects] 새로 추가된 glow 대상: ${newElements.length}개`, newElements);

    // 새로 추가된 요소에만 효과 적용
    newElements.forEach(elementId => {
        const element = document.getElementById(elementId);

        // 자식에서 실제 glow 대상 찾기
        const mainTitle = element.querySelector('.main-title');
        const todayDef = element.querySelector('.today-definition-text');
        const explanationText = element.querySelector('.explanation-text');
        const definitionText = element.querySelector('.definition-text');
        const equationAligned = element.querySelector('.equation-aligned');

        // summary scene의 scene-title 찾기 (focusOutroScene로 시작하는 ID의 자식)
        let sceneTitle = null;
        const titleDivs = element.querySelectorAll('[id^="focusOutroScene"] .scene-title');
        if (titleDivs.length > 0) {
            sceneTitle = titleDivs[0];
        }

        // 찾은 자식 요소에 직접 효과 적용 (요소에 임시 ID 부여하지 않고 직접 전달)
        if (mainTitle) {
            log(`[Glow Effects] ${elementId} 내부에서 main-title 발견 -> 직접 효과 적용`);
            // mainTitle 요소를 직접 전달
            triggerMainTitleEffectsOnElement(mainTitle);
        } else if (todayDef) {
            log(`[Glow Effects] ${elementId} 내부에서 today-definition-text 발견 -> 직접 효과 적용`);
            triggerTodayDefinitionKeywordEffectsOnElement(todayDef);
        } else if (explanationText || definitionText || equationAligned) {
            const target = explanationText || definitionText || equationAligned;
            log(`[Glow Effects] ${elementId} 내부에서 content text 발견 -> 직접 효과 적용`);
            triggerContentTextEffectsOnElement(target);
        } else if (sceneTitle) {
            log(`[Glow Effects] ${elementId} 내부에서 scene-title 발견 -> 직접 효과 적용`);
            triggerSummarySceneTitleEffectsOnElement(sceneTitle);
        } else {
            // 본인이 glow 대상인 경우
            triggerGlowEffectsCallback(elementId);
        }

        // 추적 Set에 추가
        glowEffectsApplied.add(elementId);
    });
}

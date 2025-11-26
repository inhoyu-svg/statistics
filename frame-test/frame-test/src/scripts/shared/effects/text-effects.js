// Text Effects Module
// 텍스트 효과 관련 함수들 (today-definition, content-text, summary-scene-title)

import { createSVGEffect, createTextEffect, createFixedPositionEffect } from './svg-effects.js';
import { applyKeywordItemCombinedEffect } from './glow-effects.js';
import { log, warn, error } from '../utils/logger.js';

/**
 * today-definition-text의 keyword 효과 트리거 (element 객체 직접 전달)
 * @param {HTMLElement} element - today-definition-text 요소
 */
export function triggerTodayDefinitionKeywordEffectsOnElement(element) {
    if (!element) {
        log(`[Today Definition Keyword Effect] element 없음`);
        return;
    }

    log(`[Today Definition Keyword Effect] element 체크 중 - classList:`, Array.from(element.classList));

    // today-definition-text인지 확인
    if (!element.classList.contains('today-definition-text')) {
        log(`[Today Definition Keyword Effect] element는 today-definition-text가 아님`);
        return;
    }

    log(`[Today Definition Keyword Effect] element 처리 시작`);
    log(`[Today Definition Keyword Effect] element HTML:`, element.innerHTML);
    log(`[Today Definition Keyword Effect] element 구조:`, element);

    // 1순위: 하이라이트 스팬 찾기 (today-definition-text 전체에서, 화살표만 있는 스팬 제외)
    const allHighlightSpans = element.querySelectorAll('[class*="highlight-"]');
    // 화살표 특수문자만 있는 스팬은 제외
    const highlightSpans = Array.from(allHighlightSpans).filter(span => {
        const text = span.textContent.trim();
        const onlyArrows = /^[▲▼◀▶\s]+$/.test(text);
        return !onlyArrows;
    });

    log(`[Today Definition Keyword Effect] 하이라이트 검색 결과: ${highlightSpans.length}개 (화살표만 있는 스팬 제외)`);
    if (highlightSpans.length > 0) {
        log(`[Today Definition Keyword Effect] ${highlightSpans.length}개 하이라이트 스팬 발견`);
        const randomSpan = highlightSpans[Math.floor(Math.random() * highlightSpans.length)];

        setTimeout(() => {
            const effects = ['glow-circle-check', 'glow-circle-curl-arrow', 'glow-pulse-question'];
            const effectType = effects[Math.floor(Math.random() * effects.length)];
            log(`[Today Definition Keyword Effect] 하이라이트 스팬에 ${effectType} 효과 적용`);
            applyKeywordItemCombinedEffect(randomSpan, effectType);
        }, 1000);
        return;
    }

    // 2순위: 수식 찾기 (최상위 수식 컨테이너만 선택)
    const mathContainers = element.querySelectorAll('mjx-container, .math, .mathjax-container');
    log(`[Today Definition Keyword Effect] 수식 컨테이너 검색 결과:`, mathContainers.length, mathContainers);
    if (mathContainers.length > 0) {
        log(`[Today Definition Keyword Effect] ${mathContainers.length}개 수식 발견`);
        const randomMath = mathContainers[Math.floor(Math.random() * mathContainers.length)];
        const mathRect = randomMath.getBoundingClientRect();
        log(`[Today Definition Keyword Effect] 선택된 수식:`, randomMath);
        log(`[Today Definition Keyword Effect] 선택된 수식 위치:`, mathRect);

        setTimeout(() => {
            const effects = ['glow-circle-check', 'glow-circle-curl-arrow', 'glow-pulse-question'];
            const effectType = effects[Math.floor(Math.random() * effects.length)];
            log(`[Today Definition Keyword Effect] 수식에 ${effectType} 효과 적용`);

            // 수식은 inline 요소이므로 임시 fixed 요소를 사용
            createFixedPositionEffect(mathRect, effectType, '수식', createSVGEffect);
        }, 1000);
        return;
    }

    // 3순위: keyword-text에 효과 적용
    const keywordText = element.querySelector('.keyword-text');
    log(`[Today Definition Keyword Effect] keyword-text 검색 결과:`, keywordText);
    if (keywordText) {
        log(`[Today Definition Keyword Effect] keyword-text에 효과 적용`);
        setTimeout(() => {
            const effects = ['glow-circle-check', 'glow-circle-curl-arrow', 'glow-pulse-question'];
            const effectType = effects[Math.floor(Math.random() * effects.length)];
            log(`[Today Definition Keyword Effect] keyword-text에 ${effectType} 효과 적용`);
            applyKeywordItemCombinedEffect(keywordText, effectType);
        }, 1000);
        return;
    }

    // 4순위: 마지막 단어에 효과 적용
    log(`[Today Definition Keyword Effect] 하이라이트/수식/keyword-text 없음 - 마지막 단어 찾기`);

    // 텍스트 노드 찾기 (MathJax 제외)
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function (node) {
                if (node.textContent.trim().length === 0) return NodeFilter.FILTER_REJECT;
                if (node.parentElement && node.parentElement.closest('mjx-container, mjx-assistive-mml')) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        },
        false
    );

    let lastTextNode = null;
    let node;
    while (node = walker.nextNode()) {
        lastTextNode = node;
    }

    if (lastTextNode && lastTextNode.parentElement) {
        const fullText = lastTextNode.textContent;
        const trimmedText = fullText.trim();
        const words = trimmedText.split(/\s+/);
        const lastWord = words[words.length - 1];

        log(`[Today Definition Keyword Effect] 마지막 단어 찾음: "${lastWord}"`);

        // Range API로 마지막 단어의 정확한 위치 계산
        setTimeout(() => {
            try {
                const range = document.createRange();
                const fullText = lastTextNode.textContent;

                // 마지막 단어의 시작 인덱스 찾기
                const lastWordIndex = fullText.lastIndexOf(lastWord);
                if (lastWordIndex === -1) {
                    warn(`[Today Definition Keyword Effect] 마지막 단어 "${lastWord}"를 텍스트에서 찾을 수 없음`);
                    return;
                }

                // 마지막 단어 범위 설정
                range.setStart(lastTextNode, lastWordIndex);
                range.setEnd(lastTextNode, lastWordIndex + lastWord.length);

                // 마지막 단어의 정확한 위치 가져오기
                const rect = range.getBoundingClientRect();
                log(`[Today Definition Keyword Effect] 마지막 단어 "${lastWord}" 위치:`, {
                    left: rect.left,
                    top: rect.top,
                    width: rect.width,
                    height: rect.height
                });

                // 효과 타입 선택
                const effects = ['glow-circle-check', 'glow-circle-curl-arrow', 'glow-pulse-question'];
                const effectType = effects[Math.floor(Math.random() * effects.length)];

                // 위치 정보를 직접 전달하여 효과 생성
                createFixedPositionEffect(rect, effectType, lastWord, createSVGEffect);

            } catch (error) {
                error('[Today Definition Keyword Effect] 마지막 단어 위치 계산 오류:', error);
            }
        }, 1000);
    }
}

/**
 * today-definition-text의 keyword 효과 트리거 (ID 기반 - 호환성)
 * @param {string} targetElementId - today-definition-text 요소 ID
 */
export function triggerTodayDefinitionKeywordEffects(targetElementId) {
    const element = document.getElementById(targetElementId);
    if (element) {
        triggerTodayDefinitionKeywordEffectsOnElement(element);
    }
}

/**
 * explanation-text, definition-text, equation-aligned 효과 트리거 (element 객체 직접 전달)
 * @param {HTMLElement} element - content text 요소
 */
export function triggerContentTextEffectsOnElement(element) {
    if (!element) {
        log(`[Content Text Effect] element 없음`);
        return;
    }

    log(`[Content Text Effect] element 체크 중 - classList:`, Array.from(element.classList));

    // explanation-text, definition-text, equation-aligned, review-content, main-title 중 하나인지 확인
    const isTargetClass = element.classList.contains('explanation-text') ||
        element.classList.contains('definition-text') ||
        element.classList.contains('equation-aligned') ||
        element.classList.contains('review-content') ||
        element.classList.contains('main-title');

    if (!isTargetClass) {
        log(`[Content Text Effect] element는 대상 클래스가 아님`);
        return;
    }

    // review 씬에서는 적용 안 함 (부모 요소 ID로 판단)
    // 단, focusReviewContent1_1, 1_2, 1_3는 예외
    let parent = element;
    let isReviewScene = false;
    let isReviewContentException = false;

    while (parent && parent !== document.body) {
        // focusReviewContent1_1, 1_2, 1_3는 예외 처리
        if (parent.id && (parent.id === 'focusReviewContent1_1' || parent.id === 'focusReviewContent1_2' || parent.id === 'focusReviewContent1_3')) {
            isReviewContentException = true;
            break;
        }
        if (parent.id && (parent.id.includes('focusReview') || parent.classList.contains('intro-frame') || parent.classList.contains('outro-frame'))) {
            isReviewScene = true;
            break;
        }
        parent = parent.parentElement;
    }

    if (isReviewScene && !isReviewContentException) {
        log(`[Content Text Effect] review/intro/outro 씬에서는 효과 적용 안 함 (parent ID:`, parent.id, ')');
        return;
    }

    log(`[Content Text Effect] element 처리 시작`);

    // Review Content일 때는 전체 텍스트에 밑줄 적용 (올라오는 애니메이션 후)
    if (isReviewContentException) {
        log(`[Content Text Effect] Review Content - explanation-text 전체에 웨이브 밑줄 적용`);

        let effectApplied = false; // 중복 방지 플래그

        // transitionend 이벤트로 애니메이션 완료 대기
        const applyEffect = () => {
            if (effectApplied) {
                log(`[Content Text Effect] Review Content 이미 효과 적용됨 - 스킵`);
                return;
            }
            effectApplied = true;

            const rect = element.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(element);

            // padding 값 가져오기
            const paddingLeft = parseFloat(computedStyle.paddingLeft);
            const paddingRight = parseFloat(computedStyle.paddingRight);
            const paddingTop = parseFloat(computedStyle.paddingTop);
            const paddingBottom = parseFloat(computedStyle.paddingBottom);

            // padding을 제외한 실제 콘텐츠 영역 계산
            const adjustedRect = {
                left: rect.left + paddingLeft,
                top: rect.top + paddingTop,
                right: rect.right - paddingRight,
                bottom: rect.bottom - paddingBottom,
                width: rect.width - paddingLeft - paddingRight,
                height: rect.height - paddingTop - paddingBottom,
                x: rect.x + paddingLeft,
                y: rect.y + paddingTop
            };

            log(`[Content Text Effect] Review Content 단일 선 밑줄 적용 (패딩 제외, 하이라이트 색상 자동, duration: 0.4s)`, adjustedRect);
            createSVGEffect(element, 'glow-pulse', 0, null, 0, adjustedRect, null, 0.4);
        };

        // transitionend 이벤트 리스너 (한 번만 실행)
        let fallbackTimeout;
        const handleTransitionEnd = (e) => {
            if (e.propertyName === 'transform' || e.propertyName === 'opacity') {
                element.removeEventListener('transitionend', handleTransitionEnd);
                clearTimeout(fallbackTimeout); // fallback 취소
                // 애니메이션 완료 후 약간의 여유를 두고 rect 계산
                setTimeout(applyEffect, 50);
            }
        };

        element.addEventListener('transitionend', handleTransitionEnd);

        // 백업: transitionend가 발생하지 않을 경우를 대비해 1초 후 강제 실행
        fallbackTimeout = setTimeout(() => {
            element.removeEventListener('transitionend', handleTransitionEnd);
            applyEffect();
        }, 1000);
        return;
    }

    // 1순위: 하이라이트 스팬 찾기 (화살표만 있는 스팬 제외)
    const allHighlightSpans = element.querySelectorAll('[class*="highlight-"]');
    const highlightSpans = Array.from(allHighlightSpans).filter(span => {
        const text = span.textContent.trim();
        const onlyArrows = /^[▲▼◀▶\s]+$/.test(text);
        return !onlyArrows;
    });

    if (highlightSpans.length > 0) {
        log(`[Content Text Effect] ${highlightSpans.length}개 하이라이트 스팬 발견 (화살표만 있는 스팬 제외)`);
        const randomSpan = highlightSpans[Math.floor(Math.random() * highlightSpans.length)];

        setTimeout(() => {
            const spanRect = randomSpan.getBoundingClientRect();
            const effects = ['glow-pulse', 'glow-wavy', 'glow-star'];
            const effectType = effects[Math.floor(Math.random() * effects.length)];
            log(`[Content Text Effect] 하이라이트 스팬에 ${effectType} 효과 적용`);
            createSVGEffect(randomSpan, effectType, 0, null, 0, spanRect);
        }, 1000);
        return;
    }

    // 2순위: 수식 찾기
    const mathContainers = element.querySelectorAll('mjx-container, .math, .mathjax-container');
    if (mathContainers.length > 0) {
        log(`[Content Text Effect] ${mathContainers.length}개 수식 발견`);
        const randomMath = mathContainers[Math.floor(Math.random() * mathContainers.length)];

        setTimeout(() => {
            const mathRect = randomMath.getBoundingClientRect();
            const effects = ['glow-pulse', 'glow-wavy', 'glow-star'];
            const effectType = effects[Math.floor(Math.random() * effects.length)];
            log(`[Content Text Effect] 수식에 ${effectType} 효과 적용`);
            // 직접 createSVGEffect 호출 (원본 요소의 색상 사용)
            createSVGEffect(element, effectType, 0, null, 0, mathRect);
        }, 1000);
        return;
    }

    // 3순위: main-title이면 전체 텍스트에 밑줄 효과
    if (element.classList.contains('main-title')) {
        log(`[Content Text Effect] main-title - 전체 텍스트에 밑줄 효과 적용`);
        setTimeout(() => {
            const rect = element.getBoundingClientRect();
            createSVGEffect(element, 'glow-wavy', 0, null, 0, rect);
        }, 1000);
        return;
    }

    // 하이라이트도 수식도 없으면 효과 적용 안 함
    log(`[Content Text Effect] 하이라이트/수식 없음 - 효과 적용 안 함`);
}

/**
 * explanation-text, definition-text, equation-aligned 효과 트리거 (ID 기반 - 호환성)
 * @param {string} targetElementId - content text 요소 ID
 */
export function triggerContentTextEffects(targetElementId) {
    const element = document.getElementById(targetElementId);
    if (element) {
        triggerContentTextEffectsOnElement(element);
    }
}

/**
 * summary 씬의 scene-title 효과 트리거 (element 객체 직접 전달)
 * @param {HTMLElement} element - scene-title 요소
 */
export function triggerSummarySceneTitleEffectsOnElement(element) {
    if (!element) {
        log(`[Summary Scene Title Effect] element 없음`);
        return;
    }

    log(`[Summary Scene Title Effect] element 체크 중 - classList:`, Array.from(element.classList));

    // scene-title인지 확인
    if (!element.classList.contains('scene-title')) {
        log(`[Summary Scene Title Effect] element는 scene-title이 아님`);
        return;
    }

    // summary 씬 내부인지 확인 (outro frame의 scene-title)
    const parentDiv = element.parentElement;
    const isSummaryScene = parentDiv && parentDiv.id && parentDiv.id.includes('focusOutroScene');

    if (!isSummaryScene) {
        log(`[Summary Scene Title Effect] scene-title은 summary/outro 씬이 아님`);
        return;
    }

    log(`[Summary Scene Title Effect] scene-title 처리 시작`);

    setTimeout(() => {
        // scene-title 자체에 텍스트 효과 적용
        const texts = ['중요', '핵심', '기억'];
        const randomText = texts[Math.floor(Math.random() * texts.length)];
        const iconTypes = ['glow-star', 'glow-check'];
        const randomIconType = iconTypes[Math.floor(Math.random() * iconTypes.length)];

        log(`[Summary Scene Title Effect] scene-title에 텍스트 효과 적용: ${randomText}`);
        createTextEffect(element, randomIconType, randomText);
    }, 1000);
}

/**
 * summary 씬의 scene-title 효과 트리거 (ID 기반 - 호환성)
 * @param {string} targetElementId - scene-title 요소 ID
 */
export function triggerSummarySceneTitleEffects(targetElementId) {
    const element = document.getElementById(targetElementId);
    if (element) {
        triggerSummarySceneTitleEffectsOnElement(element);
    }
}

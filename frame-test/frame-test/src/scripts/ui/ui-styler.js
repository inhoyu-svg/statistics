/**
 * UI Styling Module
 * Handles all UI-related styling, text formatting, and visual adjustments
 */

/**
 * Setup scene number styling for all frames
 * @param {Array} frames - Array of frame data objects
 */
export function setupSceneNumberStyling(frames) {
    frames.forEach((frameData) => {
        const frameElement = frameData.element;
        const sceneNumbers = frameElement.querySelectorAll('.scene-number');
        sceneNumbers.forEach(sceneNumber => {
            const text = sceneNumber.textContent.trim();
            if (text.length > 1) {
                sceneNumber.classList.add('multi-char');
            }
        });
    });
}

/**
 * Setup automatic title breaking for main and scene titles
 */
export function setupTitleBreaking() {
    // Main Title processing
    const mainTitles = document.querySelectorAll('.main-title');
    mainTitles.forEach(title => {
        const text = title.textContent.trim();
        if (text.length > 20) {
            const brokenText = breakTextAt20Chars(text);
            title.innerHTML = brokenText;
            console.log(`Main title "${text}"를 20글자 단위로 줄바꿈`);
        }
    });

    // Scene Title processing
    const sceneTitles = document.querySelectorAll('.scene-title');
    sceneTitles.forEach(title => {
        const text = title.textContent.trim();
        if (text.length > 20) {
            const brokenText = breakTextAt20Chars(text);
            title.innerHTML = brokenText;
            console.log(`Scene title "${text}"를 20글자 단위로 줄바꿈`);
        }
    });
}

/**
 * Break text at 20 character intervals
 * @param {string} text - Text to break
 * @returns {string} HTML string with <br> tags
 */
function breakTextAt20Chars(text) {
    const words = text.split(' ');
    let result = [];
    let currentLine = '';

    for (let word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;

        if (testLine.replace(/\s/g, '').length <= 20) {
            currentLine = testLine;
        } else {
            if (currentLine) {
                result.push(currentLine);
            }
            currentLine = word;
        }
    }

    if (currentLine) {
        result.push(currentLine);
    }

    return result.join('<br>');
}

/**
 * Setup scene tag styling based on content
 */
export function setupSceneTagStyling() {
    const sceneTags = document.querySelectorAll('.scene-tag');
    console.log(`총 ${sceneTags.length}개의 scene-tag 발견`);

    sceneTags.forEach(tag => {
        const text = tag.textContent.trim();
        const lowerText = text.toLowerCase();

        // Number check (highest priority)
        if (/^\d+$/.test(text)) {
            tag.classList.add('number');
            const parentScene = tag.closest('.math-scene');
            if (parentScene) {
                parentScene.classList.add('number-scene');
            }
        }
        // Today check
        else if (lowerText === 'today') {
            tag.classList.add('today');
            const parentScene = tag.closest('.math-scene');
            if (parentScene) {
                parentScene.classList.add('today-scene');
            }
        }
        // Summary check
        else if (lowerText === 'summary') {
            tag.classList.add('summary');
            const parentScene = tag.closest('.math-scene');
            if (parentScene) {
                parentScene.classList.add('summary-scene');
            }
        }
        // Single character check (excluding numbers)
        else if (text.length === 1) {
            tag.classList.add('single-char');
        }
    });
}

/**
 * Setup chapter badge styling based on content
 */
export function setupChapterBadgeStyling() {
    const chapterBadges = document.querySelectorAll('.chapter-badge');
    chapterBadges.forEach(badge => {
        const text = badge.textContent.trim();

        // Number check
        if (/^\d+$/.test(text)) {
            badge.classList.add('number');
        }
        // Summary check
        else if (text.toLowerCase() === 'summary') {
            badge.classList.add('summary');
        }
    });
}

/**
 * Add last-frame class to the final frame
 */
export function setupLastFrameClass() {
    const chalkFrames = document.querySelectorAll('.chalk-frame');
    if (chalkFrames.length > 0) {
        const lastFrame = chalkFrames[chalkFrames.length - 1];
        lastFrame.classList.add('last-frame');
    }
}

/**
 * Wrap arrow symbols in span elements for smaller display
 */
export function wrapArrowSymbols() {
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    const nodesToProcess = [];
    let node;
    while (node = walker.nextNode()) {
        if (/[▲▼◀▶]/.test(node.textContent)) {
            nodesToProcess.push(node);
        }
    }

    nodesToProcess.forEach(textNode => {
        const text = textNode.textContent;
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        const arrowRegex = /[▲▼◀▶]/g;
        let match;

        while ((match = arrowRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
            }

            const arrowSpan = document.createElement('span');
            arrowSpan.className = 'arrow-symbol';
            arrowSpan.textContent = match[0];
            fragment.appendChild(arrowSpan);

            lastIndex = match.index + 1;
        }

        if (lastIndex < text.length) {
            fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
        }

        textNode.parentNode.replaceChild(fragment, textNode);
    });
}

/**
 * Validate scene layouts against expected scene counts
 * @param {Array} frames - Array of frame data objects
 */
export function validateSceneLayouts(frames) {
    const contentAreas = document.querySelectorAll('.content-area');
    contentAreas.forEach((area, index) => {
        const layoutClasses = Array.from(area.classList).filter(cls => cls.startsWith('scene-layout-'));
        const scenes = area.querySelectorAll('.math-scene');

        if (layoutClasses.length > 0) {
            console.log(`Frame ${index} Layout: ${layoutClasses.join(', ')}, Scenes: ${scenes.length}개`);

            const layoutClass = layoutClasses[0];
            const expectedScenes = getExpectedSceneCount(layoutClass);

            if (expectedScenes && scenes.length !== expectedScenes) {
                console.warn(`Frame ${index}: ${layoutClass}는 ${expectedScenes}개 씬을 필요로 하지만 ${scenes.length}개만 있습니다.`);
            }
        }
    });
}

/**
 * Get expected scene count for a layout class
 * @param {string} layoutClass - Layout class name
 * @returns {number|null} Expected scene count or null
 */
function getExpectedSceneCount(layoutClass) {
    const layoutMap = {
        'scene-layout-1x1': 1,
        'scene-layout-1x2': 2,
        'scene-layout-2x1': 2,
        'scene-layout-1x3': 3,
        'scene-layout-2x2': 4,
        'scene-layout-1x4': 4,
        'scene-layout-1-2-2': 3,
        'scene-layout-2x3': 6,
        'scene-layout-2-3': 5,
        'scene-layout-3-2': 5
    };

    return layoutMap[layoutClass] || null;
}

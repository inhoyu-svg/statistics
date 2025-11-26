/**
 * Data Manager Module
 * Handles JSON data loading, validation, and template data extraction
 */

import { log, warn, error } from '../shared/utils/logger.js';

/**
 * Generate cuts from JSON data
 * @param {Object} instance - LectureTemplate instance
 * @param {Array} cutsData - Array of cut data from JSON
 * @returns {boolean} Success status
 */
export function generateCutsFromJSON(instance, cutsData) {
    if (!cutsData || !Array.isArray(cutsData)) {
        warn('JSON cuts 데이터가 없습니다. HTML 기반 생성을 시도합니다.');
        return false;
    }

    log('JSON 기반 Cut 생성 시작:', cutsData.length, '개 Cut');

    // Reset existing cut data
    instance.allCuts = [];
    instance.frames.forEach(frame => {
        if (frame.cuts) frame.cuts = [];
    });

    // Create cuts directly from JSON data
    cutsData.forEach((cutData, index) => {
        const cut = {
            name: cutData.visual_script || `Cut ${cutData.cut_index}`,
            cutIndex: cutData.cut_index,
            globalCutIndex: cutData.cut_index,
            frameIndex: cutData.frame_index,
            targetElement: cutData.target_element,
            revealElements: cutData.reveal_elements || [],
            isOverviewMode: cutData.is_overview_mode || false,
            cameraPosition: cutData.camera_position || 'center',
            animationType: cutData.animation_type || 'focus',
            animationDuration: cutData.animation_duration || 800,
            cutType: cutData.cut_type,
            visualScript: cutData.visual_script,
            voiceScript: cutData.voice_script
        };

        instance.allCuts.push(cut);

        // Add cut to corresponding frame
        const frameIndex = cut.frameIndex;
        if (instance.frames[frameIndex]) {
            if (!instance.frames[frameIndex].cuts) {
                instance.frames[frameIndex].cuts = [];
            }
            instance.frames[frameIndex].cuts.push(cut);
        } else {
            console.warn(`프레임 ${frameIndex}가 존재하지 않습니다. Cut ${cut.cutIndex} 스킵.`);
        }
    });

    // Sort cuts
    instance.allCuts.sort((a, b) => a.cutIndex - b.cutIndex);
    instance.frames.forEach(frame => {
        if (frame.cuts) {
            frame.cuts.sort((a, b) => a.cutIndex - b.cutIndex);
        }
    });

    log('JSON 기반 Cut 생성 완료:', instance.allCuts.length, '개 Cut');
    log('프레임별 Cut 분배:', instance.frames.map((frame, idx) => `Frame ${idx}: ${frame.cuts?.length || 0}개`));
    return true;
}

/**
 * Validate JSON data structure
 * @param {Array} cutsData - Array of cut data to validate
 * @returns {Object} Validation result with valid flag and error message
 */
export function validateJSONData(cutsData) {
    if (!cutsData || !Array.isArray(cutsData)) {
        return { valid: false, error: 'cuts 데이터가 배열이 아닙니다.' };
    }

    for (let i = 0; i < cutsData.length; i++) {
        const cut = cutsData[i];
        if (typeof cut.cut_index !== 'number') {
            return { valid: false, error: `Cut ${i}: cut_index가 숫자가 아닙니다.` };
        }
        if (typeof cut.frame_index !== 'number') {
            return { valid: false, error: `Cut ${i}: frame_index가 숫자가 아닙니다.` };
        }
        if (!cut.visual_script) {
            return { valid: false, error: `Cut ${i}: visual_script가 없습니다.` };
        }
    }

    return { valid: true };
}

/**
 * Extract template data from DOM
 * @param {Object} instance - LectureTemplate instance
 */
export function extractTemplateData(instance) {
    const chalkFrames = document.querySelectorAll('.chalk-frame');
    instance.config.totalFrames = chalkFrames.length;

    chalkFrames.forEach((frame, frameIndex) => {
        const frameData = {
            frameIndex: frameIndex,
            element: frame,
            transition: frame.getAttribute('data-transition') || 'fade',
            scenes: [],
            cuts: [],
            hasTitle: frame.querySelector(`[id*="focusTitle"]`) !== null,
        };

        const scenes = frame.querySelectorAll('.math-scene');
        frameData.totalScenes = scenes.length;

        instance.frames.push(frameData);
        extractFrameSections(instance, frame, frameIndex);
    });

    console.log(`총 ${instance.config.totalFrames}개의 프레임을 찾았습니다.`);
}

/**
 * Extract frame section information
 * @param {Object} instance - LectureTemplate instance
 * @param {HTMLElement} frame - Frame element
 * @param {number} frameIndex - Frame index
 */
function extractFrameSections(instance, frame, frameIndex) {
    const sections = frame.querySelectorAll('[id*="focus"]');

    sections.forEach(section => {
        const elementId = section.getAttribute('id');
        if (elementId) {
            instance.config.cutAnimations[elementId] = section;
        }
    });
}

/**
 * Generate frames and cuts dynamically from HTML
 * @param {Object} instance - LectureTemplate instance
 */
export function generateFramesAndCuts(instance) {
    let globalCutIndex = 0;

    instance.frames.forEach((frameData, frameIndex) => {
        const frameCuts = [];
        let frameCutIndex = 0;

        if (frameIndex === 0) {
            // Special handling for first frame: lecture title -> tip -> Today scene -> Today keywords

            // 1. Title area
            if (frameData.hasTitle) {
                const titleId = `focusTitle${frameIndex + 1}`;
                const titleElement = document.getElementById(titleId);
                if (titleElement) {
                    const cut = {
                        name: `강의 타이틀`,
                        description: "강의 제목 포커싱",
                        className: `cut-${globalCutIndex}`,
                        targetElement: titleId,
                        cutIndex: frameCutIndex,
                        globalCutIndex: globalCutIndex,
                        frameIndex: frameIndex
                    };
                    frameCuts.push(cut);
                    instance.allCuts.push(cut);
                    frameCutIndex++;
                    globalCutIndex++;
                    console.log(`강의 타이틀 추가: ${titleId}`);
                }
            }

            // 2. Full zoom out (only Today tag and box visible)
            const zoomOutCut = {
                name: `전체 보기`,
                description: "Today 씬 전체 zoom out",
                className: `cut-${globalCutIndex}`,
                targetElement: null,
                cutIndex: frameCutIndex,
                globalCutIndex: globalCutIndex,
                frameIndex: frameIndex
            };
            frameCuts.push(zoomOutCut);
            instance.allCuts.push(zoomOutCut);
            frameCutIndex++;
            globalCutIndex++;
            console.log(`전체 zoom out 추가`);

            // 3. Today keywords individual focusing
            let keywordIndex = 1;
            while (true) {
                const keywordId = `focusScene${frameIndex + 1}_1text${keywordIndex}`;
                const keywordElement = document.getElementById(keywordId);
                if (!keywordElement) break;

                const cut = {
                    name: `키워드 ${keywordIndex}`,
                    description: `${keywordIndex}번째 키워드 설명`,
                    className: `cut-${globalCutIndex}`,
                    targetElement: keywordId,
                    cutIndex: frameCutIndex,
                    globalCutIndex: globalCutIndex,
                    frameIndex: frameIndex
                };
                frameCuts.push(cut);
                instance.allCuts.push(cut);
                frameCutIndex++;
                globalCutIndex++;
                keywordIndex++;
                console.log(`키워드 ${keywordIndex - 1} 추가: ${keywordId}`);
            }

        } else {
            // Regular frame processing

            // 1. Title area
            if (frameData.hasTitle) {
                const titleId = `focusTitle${frameIndex + 1}`;
                const titleElement = document.getElementById(titleId);
                if (titleElement) {
                    const cut = {
                        name: `프레임 ${frameIndex + 1} 타이틀`,
                        description: "제목 포커싱",
                        className: `cut-${globalCutIndex}`,
                        targetElement: titleId,
                        cutIndex: frameCutIndex,
                        globalCutIndex: globalCutIndex,
                        frameIndex: frameIndex
                    };
                    frameCuts.push(cut);
                    instance.allCuts.push(cut);
                    frameCutIndex++;
                    globalCutIndex++;
                    console.log(`프레임 ${frameIndex + 1} 타이틀 추가: ${titleId}`);
                }
            }

            // 2. Scene sections
            for (let sceneNum = 1; sceneNum <= frameData.totalScenes; sceneNum++) {
                const sceneSections = getSceneSections(instance, frameIndex + 1, sceneNum);
                sceneSections.forEach(section => {
                    const cut = {
                        name: section.name,
                        description: section.description,
                        className: `cut-${globalCutIndex}`,
                        targetElement: section.elementId,
                        cutIndex: frameCutIndex,
                        globalCutIndex: globalCutIndex,
                        frameIndex: frameIndex,
                        sceneNum: sceneNum
                    };
                    frameCuts.push(cut);
                    instance.allCuts.push(cut);
                    frameCutIndex++;
                    globalCutIndex++;
                });
            }
        }

        // Add overview at the end of all frames
        const cut = {
            name: `프레임 ${frameIndex + 1} 전체`,
            description: "전체 보기",
            className: `cut-${globalCutIndex}`,
            targetElement: null,
            cutIndex: frameCutIndex,
            globalCutIndex: globalCutIndex,
            frameIndex: frameIndex
        };
        frameCuts.push(cut);
        instance.allCuts.push(cut);
        globalCutIndex++;

        frameData.cuts = frameCuts;
    });

    console.log(`총 ${instance.frames.length}개 프레임, ${instance.allCuts.length}개의 cut이 생성되었습니다.`);
}

/**
 * Get scene sections for a specific frame and scene
 * @param {Object} instance - LectureTemplate instance
 * @param {number} frameNum - Frame number (1-indexed)
 * @param {number} sceneNum - Scene number (1-indexed)
 * @returns {Array} Array of section objects
 */
export function getSceneSections(instance, frameNum, sceneNum) {
    const sections = [];
    const frameElement = document.querySelector(`[data-frame-index="${frameNum - 1}"]`);
    if (!frameElement) {
        console.warn(`Frame ${frameNum} not found, looking for data-frame-index="${frameNum - 1}"`);
        return sections;
    }

    const contentArea = frameElement.querySelector('.content-area');
    if (!contentArea) {
        console.warn(`Content area not found in frame ${frameNum}`);
        return sections;
    }

    const allScenes = contentArea.querySelectorAll('.math-scene');
    const sceneElement = allScenes[sceneNum - 1];

    if (!sceneElement) {
        console.warn(`Scene ${sceneNum} not found in frame ${frameNum}`);
        return sections;
    }

    const focusElements = sceneElement.querySelectorAll('[id*="focus"]');
    focusElements.forEach(element => {
        const elementId = element.getAttribute('id');
        if (elementId) {
            sections.push({
                elementId: elementId,
                name: generateSectionName(element, frameNum, sceneNum),
                description: generateSectionDescription(element)
            });
        }
    });

    return sections;
}

/**
 * Generate section name based on element
 * @param {HTMLElement} element - Element to generate name for
 * @param {number} frameNum - Frame number
 * @param {number} sceneNum - Scene number
 * @returns {string} Generated name
 */
function generateSectionName(element, frameNum, sceneNum) {
    const className = element.className;
    const textContent = element.textContent.trim();

    if (className.includes('title')) {
        return `F${frameNum} 씬${sceneNum} 제목`;
    } else if (className.includes('subtitle')) {
        return `F${frameNum} 씬${sceneNum} 부제목`;
    } else if (className.includes('eq')) {
        const mathContent = element.querySelector('.math')?.textContent || textContent;
        return mathContent.substring(0, 20) + (mathContent.length > 20 ? '...' : '');
    } else if (className.includes('result')) {
        return `F${frameNum} 씬${sceneNum} 결과`;
    } else {
        return `F${frameNum} 씬${sceneNum} 내용`;
    }
}

/**
 * Generate section description based on element
 * @param {HTMLElement} element - Element to generate description for
 * @returns {string} Generated description
 */
function generateSectionDescription(element) {
    const className = element.className;

    if (className.includes('title')) {
        return "씬 제목 포커싱";
    } else if (className.includes('eq')) {
        return "수식 설명";
    } else if (className.includes('result')) {
        return "결과 강조";
    } else {
        return "내용 포커싱";
    }
}

/**
 * Get frames data for external access
 * @param {Object} instance - LectureTemplate instance
 * @returns {Array} Frames data
 */
export function getFramesData(instance) {
    return instance.frames.map((frameData, index) => ({
        index: index,
        totalCuts: frameData.cuts?.length || 0,
        transition: frameData.transition,
        hasTitle: frameData.hasTitle,
        totalScenes: frameData.totalScenes
    }));
}

/**
 * Get template configuration data
 * @param {Object} instance - LectureTemplate instance
 * @returns {Object} Template data
 */
export function getTemplateData(instance) {
    return {
        totalFrames: instance.config.totalFrames,
        totalCuts: instance.allCuts.length,
        currentFrame: instance.currentFrameIndex,
        currentCut: instance.currentCut,
        frames: getFramesData(instance)
    };
}

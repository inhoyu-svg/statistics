/**
 * Flutter Bridge Module
 * Handles communication between WebView and Flutter application
 */

/**
 * Sends a message to Flutter WebView
 * @param {Object} data - Data to send to Flutter
 */
export function notifyFlutter(data) {
    try {
        // Flutter WebView의 JavaScript Channel을 통해 메시지 전달
        if (window.flutterChannel && window.flutterChannel.postMessage) {
            window.flutterChannel.postMessage(JSON.stringify(data));
        }
        // 또는 다른 방식의 Flutter 통신
        else if (window.flutter_inappwebview && window.flutter_inappwebview.callHandler) {
            window.flutter_inappwebview.callHandler('webViewMessage', data);
        }
        // 일반적인 postMessage 방식
        else if (window.parent !== window) {
            window.parent.postMessage(data, '*');
        }
    } catch (error) {
        console.error('Flutter에 메시지 전달 실패:', error);
    }
}

/**
 * Handles Flutter's request to move to next cut
 * @param {Object} templateInstance - LectureTemplate instance
 */
export function moveToNextFromFlutter(templateInstance) {
    console.log('Flutter에서 moveToNext 호출됨');
    templateInstance.moveToNext();

    // Flutter에 현재 상태 전달
    const currentFrame = templateInstance.frames[templateInstance.currentFrameIndex];
    if (currentFrame) {
        notifyFlutter({
            type: 'cutChanged',
            currentFrame: templateInstance.currentFrameIndex + 1,
            currentCut: templateInstance.currentCut,
            totalFrames: templateInstance.frames.length,
            totalCuts: currentFrame.cuts.length,
            cutName: currentFrame.cuts[templateInstance.currentCut - 1]?.name || '',
            isLastCut: templateInstance.currentCut >= currentFrame.cuts.length,
            isLastFrame: templateInstance.currentFrameIndex >= templateInstance.frames.length - 1
        });
    }
}

/**
 * Handles Flutter's request to move to previous cut
 * @param {Object} templateInstance - LectureTemplate instance
 */
export function moveToPreviousFromFlutter(templateInstance) {
    console.log('Flutter에서 moveToPrevious 호출됨');
    templateInstance.moveToPrevious();

    // Flutter에 현재 상태 전달
    const currentFrame = templateInstance.frames[templateInstance.currentFrameIndex];
    if (currentFrame) {
        notifyFlutter({
            type: 'cutChanged',
            currentFrame: templateInstance.currentFrameIndex + 1,
            currentCut: templateInstance.currentCut,
            totalFrames: templateInstance.frames.length,
            totalCuts: currentFrame.cuts.length,
            cutName: currentFrame.cuts[templateInstance.currentCut - 1]?.name || '',
            isFirstCut: templateInstance.currentCut <= 1,
            isFirstFrame: templateInstance.currentFrameIndex <= 0
        });
    }
}

/**
 * Handles Flutter's request to move to a specific cut
 * @param {Object} templateInstance - LectureTemplate instance
 * @param {number} cutNumber - The cut number to move to
 */
export function moveToCutFromFlutter(templateInstance, cutNumber) {
    console.log(`Flutter에서 moveToCut(${cutNumber}) 호출됨`);
    templateInstance.moveToCut(cutNumber);

    // Flutter에 현재 상태 전달
    notifyFlutter({
        type: 'cutChanged',
        currentCut: templateInstance.currentCut,
        totalCuts: templateInstance.cuts.length,
        cutName: templateInstance.cuts[templateInstance.currentCut - 1]?.name || '',
        isFirstCut: templateInstance.currentCut <= 1,
        isLastCut: templateInstance.currentCut >= templateInstance.cuts.length
    });
}

/**
 * Handles Flutter WebView ready event
 * @param {Object} templateInstance - LectureTemplate instance
 */
export function onFlutterReady(templateInstance) {
    console.log('Flutter WebView 연동 준비 완료');

    // 초기 상태를 Flutter에 전달
    const currentFrame = templateInstance.frames[templateInstance.currentFrameIndex];
    if (currentFrame) {
        notifyFlutter({
            type: 'initialized',
            currentFrame: templateInstance.currentFrameIndex + 1,
            currentCut: templateInstance.currentCut,
            totalFrames: templateInstance.frames.length,
            totalCuts: currentFrame.cuts.length,
            cutName: currentFrame.cuts[templateInstance.currentCut - 1]?.name || '',
            framesData: templateInstance.getFramesData()
        });
    }
}

/**
 * Sets up global window functions for Flutter to call
 * @param {Object} templateInstance - LectureTemplate instance
 */
export function setupFlutterGlobalFunctions(templateInstance) {
    // Flutter에서 직접 호출할 수 있는 전역 함수들
    window.moveToNextFromFlutter = () => {
        if (templateInstance) {
            moveToNextFromFlutter(templateInstance);
        }
    };

    window.moveToPreviousFromFlutter = () => {
        if (templateInstance) {
            moveToPreviousFromFlutter(templateInstance);
        }
    };

    window.moveToCutFromFlutter = (cutNumber) => {
        if (templateInstance) {
            moveToCutFromFlutter(templateInstance, cutNumber);
        }
    };

    window.onFlutterReady = () => {
        if (templateInstance) {
            onFlutterReady(templateInstance);
        }
    };

    console.log('Flutter 전역 함수 설정 완료');
}

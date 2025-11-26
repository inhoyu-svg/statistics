export function calculateScale(instance, targetElementId) {
    if (!targetElementId) return 1;

    const targetElement = document.getElementById(targetElementId);
    if (!targetElement) return 1;

    const currentFrame = instance.frames[instance.currentFrameIndex];
    if (!currentFrame) return 1;

    // 뷰포트 크기
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 타겟 요소의 원본 크기를 계산하기 위해 현재 스케일 정보 추출
    const currentTransform = currentFrame.element.style.transform;
    let currentScale = 1;

    // transform에서 현재 스케일 추출
    const scaleMatch = currentTransform.match(/scale\(([^)]+)\)/);
    if (scaleMatch) {
        currentScale = parseFloat(scaleMatch[1]);
    }

    // 키워드 상세 프레임에서 키워드 레이아웃인 경우 특별 처리
    if (instance.isKeywordDetailFrame() && targetElement.closest('.keyword-parent-layout-comprehension, .keyword-parent-layout-extraction, .keyword-parent-layout-application')) {
        // 키워드 레이아웃의 최대 너비: calc(clamp(800px, 90vw, 1600px) - 140px)
        const maxLayoutWidth = Math.min(Math.max(800, window.innerWidth * 0.9), 1600) - 140;

        // 현재 크기를 현재 스케일로 나누어 원본 크기 계산
        const targetRect = targetElement.getBoundingClientRect();
        const targetWidth = targetRect.width / currentScale;
        const targetHeight = targetRect.height / currentScale;

        // 레이아웃 너비에 맞추기 위한 스케일 계산
        const padding = 100; // 좌우 여백
        const desiredWidth = maxLayoutWidth + padding;
        const desiredHeight = targetHeight + (padding * 2);

        // 뷰포트에 맞추기 위한 스케일 계산
        const scaleX = viewportWidth / desiredWidth;
        const scaleY = viewportHeight / desiredHeight;

        // 가로 기준으로 스케일 결정 (키워드 레이아웃 너비에 맞춤)
        let calculatedScale = Math.min(scaleX, scaleY);

        // 최소/최대 스케일 제한
        const minScale = 0.5;
        const maxScale = 1.2;

        return Math.max(minScale, Math.min(maxScale, calculatedScale));
    }

    // 현재 크기를 현재 스케일로 나누어 원본 크기 계산
    const targetRect = targetElement.getBoundingClientRect();
    const targetWidth = targetRect.width / currentScale;
    const targetHeight = targetRect.height / currentScale;

    // Step 내용에 따른 동적 패딩 조정
    let padding = 10;

    // Visualization Container는 그래프 전체가 보이도록 더 큰 패딩 사용
    if (targetElementId.includes('visualizationContainer')) {
        padding = 150;
    }
    // Step 내용인 경우 더 적은 패딩 사용 (내용에 더 집중)
    else if (targetElementId.includes('focusStepContent')) {
        padding = 10;
    }
    // 키워드 내용인 경우 중간 패딩 사용
    else if (targetElementId.includes('focusKeywordContent')) {
        padding = 50;
    }
    // 제목인 경우 기본 패딩 사용
    else {
        padding = 70;
    }

    const desiredWidth = targetWidth + (padding * 2);
    const desiredHeight = targetHeight + (padding * 2);

    // 뷰포트에 맞추기 위한 스케일 계산
    const scaleX = viewportWidth / desiredWidth;
    const scaleY = viewportHeight / desiredHeight;

    // 요소의 가로/세로 비율에 따라 주요 차원 결정
    const isWiderThanTall = targetWidth > targetHeight;
    let calculatedScale = isWiderThanTall ? scaleX : scaleY;

    // 최소/최대 스케일 제한
    let minScale = 0.5;
    let maxScale = 1.5;

    // Visualization Container는 최대 스케일을 더 작게 제한 (그래프가 잘리지 않도록)
    if (targetElementId.includes('visualizationContainer')) {
        maxScale = 1.2;
    }

    let finalScale = Math.max(minScale, Math.min(maxScale, calculatedScale));
    // 고해상도 디스플레이에서 스케일 보정
    const devicePixelRatio = window.devicePixelRatio || 1;
    if (devicePixelRatio > 1) {
        // 고해상도에서는 스케일을 약간 줄여서 더 선명하게 보이도록 조정
        finalScale = finalScale * Math.min(devicePixelRatio * 0.8, 1.2);
    }

    // 디버깅: Step 내용의 스케일 계산 과정 출력
    if (targetElementId.includes('focusStepContent')) {
        console.log(`Step 스케일 계산: ${targetElementId}`, {
            원본크기: `${targetWidth.toFixed(1)} x ${targetHeight.toFixed(1)}`,
            뷰포트: `${viewportWidth} x ${viewportHeight}`,
            패딩: padding,
            scaleX: scaleX.toFixed(3),
            scaleY: scaleY.toFixed(3),
            계산된스케일: calculatedScale.toFixed(3),
            최종스케일: finalScale.toFixed(3)
        });
    }

    return finalScale;
}

export function calculateCameraPosition(instance, targetElementId) {
    if (!targetElementId) {
        return { scale: 1, translateX: 0, translateY: 0 };
    }

    const targetElement = document.getElementById(targetElementId);
    if (!targetElement) {
        console.warn(`Target element not found: ${targetElementId}`);
        return { scale: 1, translateX: 0, translateY: 0 };
    }

    const currentFrame = instance.frames[instance.currentFrameIndex];
    if (!currentFrame) {
        return { scale: 1, translateX: 0, translateY: 0 };
    }

    // Step Title인 경우 앞의 Scene Tag와 함께 그룹으로 계산
    const groupRect = calculateGroupRect(instance, targetElementId, targetElement);
    const scale = calculateScale(instance, targetElementId);

    // 프레임 내에서의 타겟 엘리먼트 위치 계산 (프레임 좌표계 기준)
    const frameRect = currentFrame.element.getBoundingClientRect();

    // 그룹 전체의 중심 위치 계산
    const targetCenterXInFrame = (groupRect.left + groupRect.width / 2) - frameRect.left;
    const targetCenterYInFrame = (groupRect.top + groupRect.height / 2) - frameRect.top;

    // 프레임 중심 위치 (전체 화면 기준)
    const frameCenterX = frameRect.width / 2;
    const frameCenterY = frameRect.height / 2;

    // 타겟을 가시 영역으로 이동시키기 위한 오프셋 계산
    const offsetX = frameCenterX - targetCenterXInFrame;
    let offsetY = frameCenterY - targetCenterYInFrame;

    // Step Title은 정확히 중앙에, Step Content는 중앙보다 조금 아래에 배치
    if (targetElementId.includes('focusStepTitle')) {
        // Step Title은 뷰포트의 정중앙에 배치
        offsetY = frameCenterY - targetCenterYInFrame;
    } else if (targetElementId.includes('focusStepContent') || targetElementId.includes('stepDetail')) {
        // Step Content는 중앙보다 10% 아래에 배치
        const viewportCenterLower = frameCenterY + (frameRect.height * 0.1);
        offsetY = viewportCenterLower - targetCenterYInFrame;
    } else if (targetElementId.includes('visualizationContainer')) {
        // Visualization Container는 정중앙에 배치 (그래프가 잘리지 않도록)
        offsetY = frameCenterY - targetCenterYInFrame;
    }

    // 백분율로 변환 (프레임 크기 기준)
    let translateX = (offsetX / frameRect.width) * 100;
    let translateY = (offsetY / frameRect.height) * 100;

    // 극단적인 transform 값 제한 (viewport 내에 유지)
    // Frame4의 Step 상세 콘텐츠는 세로로 매우 길어질 수 있으므로 Y축 제한을 적응적으로 설정
    const maxTransformX = 50; // X축: 최대 50%까지 이동 허용

    // Y축: Step 관련은 필요에 따라 동적으로 제한 설정
    let maxTransformY = 50; // 기본값
    if (targetElementId.includes('visualizationContainer')) {
        // Visualization Container는 프레임 내 위치에 따라 동적 제한
        // visualizationContainer4_2_4 형식에서 숫자 추출
        const vizMatch = targetElementId.match(/visualizationContainer\d+_\d+_(\d+)/);
        if (vizMatch) {
            const contentIndex = parseInt(vizMatch[1]);
            // content index에 따라 제한을 늘림 (최대 400%까지)
            maxTransformY = Math.min(50 + (contentIndex * 60), 400);
        } else {
            maxTransformY = 300; // 기본 visualization은 300%
        }
    } else if (targetElementId.includes('Step')) {
        // Step 번호에 따라 제한을 점진적으로 늘림
        const stepMatch = targetElementId.match(/Step\d+_(\d+)/);
        if (stepMatch) {
            const stepIndex = parseInt(stepMatch[1]);
            // 각 Step당 약 50% 정도씩 추가 (최대 400%까지)
            maxTransformY = Math.min(50 + (stepIndex * 50), 400);
        } else {
            maxTransformY = 250; // Step Title 등은 250%
        }
    }

    translateX = Math.max(-maxTransformX, Math.min(maxTransformX, translateX));
    translateY = Math.max(-maxTransformY, Math.min(maxTransformY, translateY));

    // 정답 프레임 - 카메라 완전 고정 (위에서/옆에서 날아오는 효과 방지, 화면 잘림 방지)
    if (instance.isAnswerFrame()) {
        return { scale: 1, translateX: 0, translateY: 0 };
    }

    const position = { scale, translateX, translateY };

    console.log(`카메라 위치 계산: ${targetElementId}, scale: ${scale}, translate: ${translateX.toFixed(1)}%, ${translateY.toFixed(1)}% (제한 적용됨)`);
    return position;
}

export function calculateGroupRect(instance, targetElementId, targetElement) {
    // Step Title인 경우 앞의 Scene Tag와 함께 그룹으로 처리
    if (targetElementId.includes('focusStepTitle') || targetElementId.includes('focusKeywordTitle')) {
        const previousElement = targetElement.previousElementSibling;

        // 바로 앞 요소가 scene-tag인 경우 두 요소를 합친 영역 계산
        if (previousElement && previousElement.classList.contains('scene-tag')) {
            const targetRect = targetElement.getBoundingClientRect();
            const prevRect = previousElement.getBoundingClientRect();

            // 두 요소를 포함하는 전체 영역 계산
            const left = Math.min(targetRect.left, prevRect.left);
            const top = Math.min(targetRect.top, prevRect.top);
            const right = Math.max(targetRect.right, prevRect.right);
            const bottom = Math.max(targetRect.bottom, prevRect.bottom);

            const groupRect = {
                left: left,
                top: top,
                right: right,
                bottom: bottom,
                width: right - left,
                height: bottom - top
            };

            console.log(`그룹 영역 계산: ${targetElementId} + ${previousElement.id}`, {
                target: `${targetRect.width.toFixed(1)}x${targetRect.height.toFixed(1)}`,
                prev: `${prevRect.width.toFixed(1)}x${prevRect.height.toFixed(1)}`,
                group: `${groupRect.width.toFixed(1)}x${groupRect.height.toFixed(1)}`
            });

            return groupRect;
        }
    }

    // 일반적인 경우 원래 요소의 rect 반환
    return targetElement.getBoundingClientRect();
}

export function applyCameraToHighlight(instance, highlightElement) {
    if (!highlightElement) return;

    const currentFrame = instance.frames[instance.currentFrameIndex];
    if (!currentFrame) return;

    const frameElement = currentFrame.element;

    // 하이라이트 요소의 위치
    const rect = highlightElement.getBoundingClientRect();

    // 프레임의 위치
    const frameRect = frameElement.getBoundingClientRect();

    // 하이라이트가 화면의 35% 정도 차지하도록 scale 계산
    const viewportWidth = window.innerWidth;
    const targetRatio = 0.35;
    const scaleByWidth = (viewportWidth * targetRatio) / rect.width;

    // 최소 1.2, 최대 2.5로 제한
    const scale = Math.max(1.2, Math.min(2.5, scaleByWidth));

    // 하이라이트의 프레임 내 상대 위치 계산 (프레임 좌표계 기준)
    const targetCenterXInFrame = (rect.left + rect.width / 2) - frameRect.left;
    const targetCenterYInFrame = (rect.top + rect.height / 2) - frameRect.top;

    // 프레임 중심 위치
    const frameCenterX = frameRect.width / 2;
    const frameCenterY = frameRect.height / 2;

    // 타겟을 중앙으로 이동시키기 위한 오프셋 계산
    const offsetX = frameCenterX - targetCenterXInFrame;
    const offsetY = frameCenterY - targetCenterYInFrame;

    // 백분율로 변환 (프레임 크기 기준)
    const translateX = (offsetX / frameRect.width) * 100;
    const translateY = (offsetY / frameRect.height) * 100;

    console.log(`[Camera] 하이라이트로 이동`);
    console.log(`  - scale: ${scale.toFixed(2)}`);
    console.log(`  - translate: (${translateX.toFixed(1)}%, ${translateY.toFixed(1)}%)`);
    console.log(`  - 하이라이트 프레임 내 위치: (${targetCenterXInFrame.toFixed(0)}, ${targetCenterYInFrame.toFixed(0)})`);
    console.log(`  - 프레임 중심: (${frameCenterX.toFixed(0)}, ${frameCenterY.toFixed(0)})`);

    // 카메라 이동 (부드럽게)
    // 기존 transition 완전히 초기화
    frameElement.style.transformOrigin = '50% 50%';
    frameElement.style.transition = 'none';

    // 첫 번째 프레임: transition 초기화 적용
    requestAnimationFrame(() => {
        // 강제 reflow
        void frameElement.offsetHeight;

        // 두 번째 프레임: 새로운 transition 설정
        requestAnimationFrame(() => {
            frameElement.style.transition = 'transform 0.8s ease-out';

            // 세 번째 프레임: transform 적용
            requestAnimationFrame(() => {
                frameElement.style.transform = `scale(${scale}) translate(${translateX}%, ${translateY}%)`;
            });
        });
    });
}

export function resetCameraToOverview(instance) {
    const currentFrame = instance.frames[instance.currentFrameIndex];
    if (!currentFrame) return;

    const frameElement = currentFrame.element;

    console.log('[Camera] Overview 원위치로 복귀');

    // 카메라 원점 복귀 효과음 재생
    instance.playSoundEffect('화면 이동 Main (챠악).mp3');
    console.log('[Sound] 카메라 원점 복귀 효과음 재생');

    // 원래 overview mode 상태로 복귀 (scale 1, translate 0)
    // 기존 transition 완전히 초기화
    frameElement.style.transformOrigin = '50% 50%';
    frameElement.style.transition = 'none';

    // 첫 번째 프레임: transition 초기화 적용
    requestAnimationFrame(() => {
        // 강제 reflow
        void frameElement.offsetHeight;

        // 두 번째 프레임: 새로운 transition 설정
        requestAnimationFrame(() => {
            frameElement.style.transition = 'transform 0.8s ease-out';

            // 세 번째 프레임: transform 적용
            requestAnimationFrame(() => {
                frameElement.style.transform = 'scale(1) translate(0, 0)';
            });
        });
    });
}

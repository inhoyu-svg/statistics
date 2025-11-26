// ===== Arrow Visibility System =====

export function updateArrowVisibility(instance, cutIndex) {
    const currentFrame = instance.frames[instance.currentFrameIndex];
    if (!currentFrame) return;

    const currentCut = instance.allCuts.find(c => c.cutIndex === cutIndex);
    if (!currentCut) return;

    const isCurrentKeywordDetailFrame = instance.isKeywordDetailFrame();
    const isCurrentStepFrame = instance.isStepFrame();
    const targetElement = currentCut.targetElement;
    const isOverviewMode = currentCut.isOverviewMode;

    updateExtractionArrows(instance, currentFrame, currentCut, cutIndex, isCurrentKeywordDetailFrame, isCurrentStepFrame, isOverviewMode);
    updateFlowArrows(instance, currentFrame, currentCut, cutIndex, isCurrentKeywordDetailFrame, isCurrentStepFrame, isOverviewMode, targetElement);
    updateContentArrows(instance, currentFrame, currentCut, cutIndex, isCurrentKeywordDetailFrame, isCurrentStepFrame, isOverviewMode);

    const extractionArrows = currentFrame.element.querySelectorAll('.extraction-arrow, .extraction-arrow-overview');
    const flowArrows = currentFrame.element.querySelectorAll('.flow-arrow');
    const contentArrows = currentFrame.element.querySelectorAll('.content-arrow');

    console.log(`Cut ${cutIndex} - 화살표 가시성 업데이트: extraction=${extractionArrows.length}개, flow=${flowArrows.length}개, content=${contentArrows.length}개`);
}

function updateExtractionArrows(instance, currentFrame, currentCut, cutIndex, isCurrentKeywordDetailFrame, isCurrentStepFrame, isOverviewMode) {
    const extractionArrows = currentFrame.element.querySelectorAll('.extraction-arrow, .extraction-arrow-overview');
    extractionArrows.forEach(arrow => {
        let extractionSection;
        let leftElement, rightElement;
        const isOverviewArrow = arrow.classList.contains('extraction-arrow-overview');

        if (isOverviewArrow) {
            extractionSection = arrow.closest('.extraction-overview-grid');
            if (extractionSection) {
                leftElement = extractionSection.querySelector('.extraction-left-overview');
                rightElement = extractionSection.querySelector('.extraction-right-overview');
            }
        } else {
            extractionSection = arrow.closest('.extraction-middle-section');
            if (extractionSection) {
                leftElement = extractionSection.querySelector('.extraction-left');
                rightElement = extractionSection.querySelector('.extraction-right');
            }
        }

        if (!extractionSection || !leftElement || !rightElement) return;

        const leftId = leftElement.id;
        const rightId = rightElement.id;

        let isLeftRevealed, isRightRevealed;
        if (isOverviewMode && isOverviewArrow) {
            isLeftRevealed = true;
            isRightRevealed = true;
            console.log(`Cut ${cutIndex} - 인출 화살표 Overview Mode - 강제 표시`);
        } else {
            isLeftRevealed = !leftId || currentCut.revealElements?.includes(leftId) ||
                isElementVisible(leftElement);
            isRightRevealed = !rightId || currentCut.revealElements?.includes(rightId) ||
                isElementVisible(rightElement);
        }

        if (isLeftRevealed && isRightRevealed) {
            arrow.classList.add('arrow-visible');
            console.log(`Cut ${cutIndex} - 인출 키워드 화살표 표시 (좌우 컬럼 모두 등장) Frame=${instance.currentFrameIndex}, isOverviewMode=${isOverviewMode}, isOverviewArrow=${isOverviewArrow}`);

            if (isOverviewMode) {
                arrow.classList.remove('reveal-dimmed');
                console.log(`Cut ${cutIndex} - 인출 화살표 Overview Mode - dimmed 제거`);
            }
            else if (isCurrentKeywordDetailFrame || isCurrentStepFrame) {
                const leftIsDimmed = leftElement && leftElement.classList.contains('reveal-dimmed');
                const rightIsDimmed = rightElement && rightElement.classList.contains('reveal-dimmed');

                console.log(`Cut ${cutIndex} - 인출 화살표 dimmed 체크: left=${leftElement?.id} (${leftIsDimmed}), right=${rightElement?.id} (${rightIsDimmed})`);

                if (leftIsDimmed || rightIsDimmed) {
                    arrow.classList.add('reveal-dimmed');
                    console.log(`Cut ${cutIndex} - 인출 화살표 dimmed 추가`);
                } else {
                    arrow.classList.remove('reveal-dimmed');
                    console.log(`Cut ${cutIndex} - 인출 화살표 dimmed 제거`);
                }
            } else {
                console.log(`Cut ${cutIndex} - 인출 화살표 Frame ${instance.currentFrameIndex} - dimmed 처리 안 함`);
            }
        } else {
            arrow.classList.remove('arrow-visible');
            arrow.classList.remove('reveal-dimmed');
        }
    });
}

function updateFlowArrows(instance, currentFrame, currentCut, cutIndex, isCurrentKeywordDetailFrame, isCurrentStepFrame, isOverviewMode, targetElement) {
    const flowArrows = currentFrame.element.querySelectorAll('.flow-arrow');
    console.log(`Cut ${cutIndex} - 찾은 flow-arrow 개수: ${flowArrows.length}`);

    flowArrows.forEach((arrow, index) => {
        console.log(`Cut ${cutIndex} - flow-arrow ${index} 처리 중`);

        const flowSection = arrow.closest('.application-flow-section');
        if (!flowSection) {
            console.log(`Cut ${cutIndex} - flow-arrow ${index}: application-flow-section 없음`);
            return;
        }

        const allSteps = flowSection.querySelectorAll('.flow-step');
        console.log(`Cut ${cutIndex} - flow-arrow ${index}: 찾은 flow-step 개수: ${allSteps.length}`);

        let targetStep;

        if (index === 0 && allSteps.length >= 2) {
            targetStep = allSteps[1];
        } else if (index === 1 && allSteps.length >= 3) {
            targetStep = allSteps[2];
        }

        if (!targetStep) {
            console.log(`Cut ${cutIndex} - flow-arrow ${index}: targetStep 없음`);
            return;
        }

        const targetId = targetStep.id;
        const isTargetRevealed = !targetId || currentCut.revealElements?.includes(targetId) ||
            isElementVisible(targetStep);

        console.log(`Cut ${cutIndex} - flow-arrow ${index}: targetId=${targetId}, revealed=${isTargetRevealed}`);
        console.log(`Cut ${cutIndex} - revealElements:`, currentCut.revealElements);

        if (isTargetRevealed) {
            arrow.classList.add('arrow-visible');
            console.log(`Cut ${cutIndex} - 적용 키워드 화살표 ${index + 1} 표시 (${targetId} 등장)`);
            console.log(`Cut ${cutIndex} - 화살표 클래스:`, arrow.className);

            if (isOverviewMode) {
                arrow.classList.remove('reveal-dimmed');
            }
            else if (isCurrentKeywordDetailFrame || isCurrentStepFrame) {
                const prevStep = index === 0 ? allSteps[0] : allSteps[index];
                const nextStep = targetStep;

                const prevIsDimmed = prevStep && prevStep.classList.contains('reveal-dimmed');
                const nextIsDimmed = nextStep && nextStep.classList.contains('reveal-dimmed');
                const isNextStepTarget = nextStep && nextStep.id === targetElement;

                console.log(`Cut ${cutIndex} - flow-arrow ${index} dimmed 체크: prevStep=${prevStep?.id} (${prevIsDimmed}), nextStep=${nextStep?.id} (${nextIsDimmed}), isNextStepTarget=${isNextStepTarget}`);

                if (isNextStepTarget) {
                    arrow.classList.remove('reveal-dimmed');
                    console.log(`Cut ${cutIndex} - flow-arrow ${index} target step이므로 dimmed 제거`);
                } else if (prevIsDimmed || nextIsDimmed) {
                    arrow.classList.add('reveal-dimmed');
                    console.log(`Cut ${cutIndex} - flow-arrow ${index} dimmed 추가`);
                } else {
                    arrow.classList.remove('reveal-dimmed');
                    console.log(`Cut ${cutIndex} - flow-arrow ${index} dimmed 제거`);
                }
            } else {
                arrow.classList.remove('reveal-dimmed');
            }
        } else {
            arrow.classList.remove('arrow-visible');
            arrow.classList.remove('reveal-dimmed');
            console.log(`Cut ${cutIndex} - 적용 키워드 화살표 ${index + 1} 숨김`);
        }
    });
}

function updateContentArrows(instance, currentFrame, currentCut, cutIndex, isCurrentKeywordDetailFrame, isCurrentStepFrame, isOverviewMode) {
    const contentArrows = currentFrame.element.querySelectorAll('.content-arrow');
    contentArrows.forEach(arrow => {
        const parentContent = arrow.closest('.keyword-content-item, .step-content-item');
        if (!parentContent) return;

        const parentId = parentContent.id;
        const isParentVisible = !parentId || currentCut.revealElements?.includes(parentId) ||
            isElementVisible(parentContent);

        if (isParentVisible) {
            arrow.classList.add('arrow-visible');
            console.log(`Cut ${cutIndex} - 콘텐츠 화살표 표시 (부모 요소 등장)`);

            if (isOverviewMode) {
                arrow.classList.remove('reveal-dimmed');
            }
            else if (isCurrentKeywordDetailFrame || isCurrentStepFrame) {
                if (parentContent && parentContent.classList.contains('reveal-dimmed')) {
                    arrow.classList.add('reveal-dimmed');
                } else {
                    arrow.classList.remove('reveal-dimmed');
                }
            }
        } else {
            arrow.classList.remove('arrow-visible');
            arrow.classList.remove('reveal-dimmed');
        }
    });
}

function isElementVisible(element) {
    if (!element) return false;

    const style = window.getComputedStyle(element);
    return style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        style.display !== 'none';
}

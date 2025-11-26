// SVG Effects Module
// SVG 생성 및 효과 관련 함수들

import { getHighlightColor, isWhiteColor } from '../utils/color-utils.js';
import { playSoundEffect } from '../media/sound-manager.js';
import { log, warn, error } from '../utils/logger.js';

/**
 * SVG 효과 생성
 * @param {HTMLElement} element - 효과를 적용할 요소
 * @param {string} effectType - 효과 타입 (glow-pulse, glow-wavy, glow-star, glow-check, glow-question, glow-curl, glow-arrow, glow-circle, glow-accent-lines, glow-eyes)
 * @param {number} yOffset - Y축 오프셋 (기본값: 0)
 * @param {Object} customOffset - 커스텀 오프셋 객체 (top, left, scale 포함)
 * @param {number} fadeOutExtraDelay - 페이드 아웃 추가 지연 시간 (ms)
 * @param {DOMRect} precomputedRect - 미리 계산된 rect 객체
 * @param {string} customColor - 커스텀 색상
 * @param {number} customDuration - 커스텀 지속 시간 (초)
 */
export function createSVGEffect(element, effectType, yOffset = 0, customOffset = null, fadeOutExtraDelay = 0, precomputedRect = null, customColor = null, customDuration = null) {
    // SVG 글로우 효과음 재생 (볼륨 35%)
    // 단일 효과는 각각 고유 효과음 사용
    const isSingleLineEffect = effectType === 'glow-pulse' || effectType === 'glow-wavy';
    const isSingleCircleEffect = effectType === 'glow-circle';

    let soundToPlay;
    if (isSingleLineEffect) {
        soundToPlay = '일자 밑줄 효과음.mp3';
    } else if (isSingleCircleEffect) {
        soundToPlay = '동그라미 효과음.mp3';
    } else {
        // 다른 효과들은 랜덤
        const glowSoundEffects = [
            '구불구불 밑줄 효과음.mp3',
            '동그라미 효과음.mp3',
            '별표 효과음.mp3',
            '일자 밑줄 효과음.mp3'
        ];
        soundToPlay = glowSoundEffects[Math.floor(Math.random() * glowSoundEffects.length)];
    }

    playSoundEffect(soundToPlay, 0.35);

    // requestAnimationFrame을 사용하여 레이아웃 계산을 다음 프레임으로 지연
    requestAnimationFrame(() => {
        const color = customColor || getHighlightColor(element);
        log(`[SVG 효과] 최종 사용될 색상:`, color, `element:`, element);

        // 최종 안전장치: 색상이 흰색이면 효과 적용하지 않음
        if (isWhiteColor(color)) {
            warn(`[SVG 효과 경고] 흰색 감지됨 - 효과 적용 skip, color:`, color);
            return;
        }

        // precomputedRect이 있으면 사용, 없으면 getBoundingClientRect 호출
        const rect = precomputedRect || element.getBoundingClientRect();
        const elementWidth = rect.width;
        const elementHeight = rect.height;

        // step 상세 씬 내부인지 확인
        const isInStepDetailScene = element.closest('.step-detail-scene') !== null;

        // step-list-scene 또는 keyword-list-scene 내부인지 확인 (scale 적용된 컨테이너)
        const stepListScene = element.closest('.step-list-scene');
        const keywordListScene = element.closest('.keyword-list-scene');
        const scaledScene = stepListScene || keywordListScene;

        // scale 값 추출 - 씬별로 다른 CSS clamp 계산
        let sceneScale = 1;
        if (scaledScene) {
            const vw = window.innerWidth / 100;

            if (stepListScene) {
                // step-list-scene: scale(clamp(0.4, 0.9vw + 0.25, 0.75))
                sceneScale = Math.max(0.4, Math.min(0.9 * vw + 0.25, 0.75));
            } else if (keywordListScene) {
                // keyword-list-scene: scale(clamp(0.6, 1.5vw + 0.4, 1.0))
                sceneScale = Math.max(0.6, Math.min(1.5 * vw + 0.4, 1.0));
            }
        }

        // SVG 컨테이너 생성
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add('glow-effect-svg');

        let pathElement;
        let svgWidth = 0;
        let svgHeight = 0;
        let svgTop = 0;
        let svgLeft = 0;

        if (effectType === 'glow-pulse') {
            // 밑줄: 아치형으로 위로 살짝 올라간 곡선 (곡선 더 휘어지게)
            const glowPadding = 60; // glow 효과가 잘리지 않도록 넉넉하게
            svgWidth = elementWidth + glowPadding * 2;
            svgHeight = 80; // 높이도 넉넉하게
            // fixed positioning을 위한 절대 좌표 계산
            svgTop = rect.bottom + yOffset;
            svgLeft = rect.left - glowPadding + 5;  // 5px 오른쪽으로

            pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            // 왼쪽에서 오른쪽으로 가면서 중간이 위로 더 많이 올라간 아치형 (곡선 더 휘어지게)
            const startX = glowPadding;
            const endX = elementWidth + glowPadding;
            const startY = 10; // SVG 상단 근처
            const controlY = 0; // 10px 위로 (곡선 더 휘어지게)
            pathElement.setAttribute('d', `M${startX},${startY} Q${svgWidth / 2},${controlY} ${endX},${startY}`);
        } else if (effectType === 'glow-wavy') {
            // 웨이브 밑줄: 사인파 형태의 물결치는 밑줄
            const rect = element.getBoundingClientRect();
            const glowPadding = 60;
            svgWidth = rect.width + glowPadding * 2;
            svgHeight = 80;
            // fixed positioning을 위한 절대 좌표 계산
            svgTop = rect.bottom - 10 + yOffset;
            svgLeft = rect.left - glowPadding;

            pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            // 웨이브 생성: 균일한 사인파 형태
            const startX = glowPadding;
            const endX = rect.width + glowPadding;
            const baseY = 15; // 기준 Y 위치
            const amplitude = 2; // 웨이브 높이
            const wavelength = 20; // 웨이브 길이
            const pointsPerWave = 20; // 한 파장당 점의 개수 (많을수록 부드러움)

            let pathD = `M${startX},${baseY}`;

            const totalLength = endX - startX;
            const step = totalLength / (totalLength / wavelength * pointsPerWave);

            for (let x = startX + step; x <= endX; x += step) {
                const normalizedX = (x - startX) / wavelength;
                const y = baseY + Math.sin(normalizedX * Math.PI * 2) * amplitude;
                pathD += ` L${x},${y}`;
            }

            // 마지막 점 확실하게 추가
            const finalY = baseY + Math.sin((endX - startX) / wavelength * Math.PI * 2) * amplitude;
            pathD += ` L${endX},${finalY}`;

            pathElement.setAttribute('d', pathD);
        } else if (effectType === 'glow-star' || effectType === 'glow-check' || effectType === 'glow-question') {
            // 별/체크/물음표: body에 직접 append하고 절대 좌표로 배치
            // 물음표는 scale을 줄임
            let scale;
            if (effectType === 'glow-question') {
                scale = customOffset && customOffset.scale ? customOffset.scale : 1.4; // 물음표는 1.4배
            } else {
                scale = customOffset && customOffset.scale ? customOffset.scale : 1.7; // 별/체크는 1.7배
            }

            // element의 화면상 절대 위치 계산 (precomputedRect이 있으면 사용)
            // rect는 이미 위에서 계산됨

            // SVG 크기 설정
            svgWidth = 100;
            svgHeight = 100;

            // 절대 좌표로 배치 (customOffset이 있으면 그 위치 사용, 없으면 기본 위치)
            if (customOffset) {
                svgTop = customOffset.top;
                svgLeft = customOffset.left;
            } else {
                if (effectType === 'glow-question') {
                    // 물음표는 오른쪽 아래로 이동
                    svgTop = rect.top - svgHeight + 80; // 10px 아래로 (기존 -5에서 +10 = +5)
                    svgLeft = rect.right - 30; // 30px 더 오른쪽으로 (기존 -70에서 +30 = -40)
                } else {
                    svgTop = rect.top - svgHeight + 7; // 스팬 위쪽에 (3px 더 위로)
                    svgLeft = rect.right - 80; // 스팬 오른쪽에서 80px 왼쪽으로
                }
            }

            // 아이콘을 SVG 중앙에 배치
            const iconX = 25;
            const iconY = 35;

            log('[SVG Debug - Body Append]', {
                effectType,
                rect: { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left },
                svgWidth,
                svgHeight,
                svgTop,
                svgLeft,
                iconX,
                iconY,
                scale
            });

            pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            let pathD;
            if (effectType === 'glow-star') {
                // 오각성 펜타그램 - 한 붓 그리기, 곡선으로 부드럽게 (1.7배 확대)
                // 각 모서리를 Q(quadratic curve)로 부드럽게 연결
                const p1x = 29.25 * scale + iconX, p1y = 6.5 * scale + iconY;
                const p2x = 39 * scale + iconX, p2y = 36.4 * scale + iconY;
                const p3x = 13 * scale + iconX, p3y = 15.6 * scale + iconY;
                const p4x = 45.5 * scale + iconX, p4y = 15.6 * scale + iconY;
                const p5x = 19.5 * scale + iconX, p5y = 36.4 * scale + iconY;

                // 각 선분에 살짝 곡선 추가
                pathD = `M${p1x},${p1y} Q${(p1x + p2x) / 2 - 2},${(p1y + p2y) / 2} ${p2x},${p2y} Q${(p2x + p3x) / 2},${(p2y + p3y) / 2 - 2} ${p3x},${p3y} Q${(p3x + p4x) / 2},${(p3y + p4y) / 2 + 2} ${p4x},${p4y} Q${(p4x + p5x) / 2 + 2},${(p4y + p5y) / 2} ${p5x},${p5y} Q${(p5x + p1x) / 2},${(p5y + p1y) / 2 + 2} ${p1x},${p1y}`;
            } else if (effectType === 'glow-check') {
                // 체크 - 곡선으로 부드럽게 (1.7배 확대)
                pathD = `M${13 * scale + iconX},${29.9 * scale + iconY} Q${18.2 * scale + iconX},${33.8 * scale + iconY} ${23.4 * scale + iconX},${39 * scale + iconY} Q${32.5 * scale + iconX},${28.6 * scale + iconY} ${45.5 * scale + iconX},${15.6 * scale + iconY}`;
            } else {
                // 물음표 - 곡선으로 부드럽게 (1.7배 확대)
                // 상단 곡선 부분
                const topCurveStartX = 18 * scale + iconX, topCurveStartY = 15 * scale + iconY;
                const topCurveControlX1 = 18 * scale + iconX, topCurveControlY1 = 10 * scale + iconY;
                const topCurveControlX2 = 21 * scale + iconX, topCurveControlY2 = 7 * scale + iconY;
                const topCurveMidX = 29 * scale + iconX, topCurveMidY = 7 * scale + iconY;
                const topCurveControlX3 = 37 * scale + iconX, topCurveControlY3 = 7 * scale + iconY;
                const topCurveControlX4 = 40 * scale + iconX, topCurveControlY4 = 10 * scale + iconY;
                const topCurveEndX = 40 * scale + iconX, topCurveEndY = 15 * scale + iconY;

                // 중간 부분 (물음표 꼬리)
                const midControlX = 40 * scale + iconX, midControlY = 20 * scale + iconY;
                const midEndX = 29 * scale + iconX, midEndY = 25 * scale + iconY;

                // 아래 직선
                const bottomEndX = 29 * scale + iconX, bottomEndY = 32 * scale + iconY;

                pathD = `M${topCurveStartX},${topCurveStartY} C${topCurveControlX1},${topCurveControlY1} ${topCurveControlX2},${topCurveControlY2} ${topCurveMidX},${topCurveMidY} C${topCurveControlX3},${topCurveControlY3} ${topCurveControlX4},${topCurveControlY4} ${topCurveEndX},${topCurveEndY} Q${midControlX},${midControlY} ${midEndX},${midEndY} L${bottomEndX},${bottomEndY}`;
            }
            pathElement.setAttribute('d', pathD);
            log('[Path d]', effectType, pathD);
        } else if (effectType === 'glow-curl' || effectType === 'glow-curl-arrow') {
            // 돼지꼬리 (curl): 반으로 자른 작은 원 하나 (루프)
            // glow-curl-arrow: 돼지꼬리만 (화살표는 별도로 나중에 추가)
            // element의 화면상 절대 위치 계산
            const rect = element.getBoundingClientRect();

            // SVG 크기 설정 (더 크게)
            svgWidth = 90;
            svgHeight = 90;

            // 절대 좌표로 배치 (동그라미 바깥쪽 오른쪽 아래)
            svgTop = rect.top + rect.height * 0.5 - 60; // 60px 위로 조정
            svgLeft = rect.right - 5; // 동그라미에 더 가까이 배치

            pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            // 작은 루프: 원을 거의 다 그리기 (반지름 1.3배 증가 후 2/3로 축소, 다시 2/3로 축소)
            const r = 23 * 1.3 * (2 / 3) * (2 / 3); // 반지름 4/9 크기
            const cx = 45, cy = 45;

            // 시작: 왼쪽 아래 (7시 방향) - 더 아래로
            const startX = cx - r * 0.6;
            const startY = cy + r * 0.8;

            // 끝: 오른쪽 위 (12시 반 방향) - 거의 위쪽으로
            const endX = cx + r * 0.5;
            const endY = cy - r * 0.95;

            // 왼쪽 아래에서 시작해서 반시계방향으로 원을 그리며 오른쪽 위에서 끝
            // 두 개의 Arc로 나눔: 첫 Arc는 180도, 두번째 Arc는 약 100도
            const pathD = `M ${startX},${startY} a ${r},${r} 0 1,1 ${r * 2},0 a ${r},${r} 0 0,1 ${endX - startX - r * 2},${endY - startY}`;

            pathElement.setAttribute('d', pathD);

            element.dataset.curlEndTop = svgTop + endY;
            element.dataset.curlEndLeft = svgLeft + endX;

            log('[Path d]', effectType, pathD, '끝점:', { top: element.dataset.curlEndTop, left: element.dataset.curlEndLeft });
        } else if (effectType === 'glow-arrow') {
            // 화살촉: 돼지꼬리 끝에 붙는 화살표
            // element의 화면상 절대 위치 계산
            const rect = element.getBoundingClientRect();

            // SVG 크기 설정
            svgWidth = 90;
            svgHeight = 90;

            // 절대 좌표로 배치 (동그라미 바깥쪽 오른쪽 아래) - 돼지꼬리와 동일 위치
            svgTop = rect.top + rect.height * 0.5 - 60; // 아래쪽으로 이동 (60px 위로 조정)
            svgLeft = rect.right + 10; // 오른쪽으로 이동

            pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            // 돼지꼬리 끝점 계산 (glow-curl과 동일 - 4/9 크기)
            const r = 23 * 1.3 * (2 / 3) * (2 / 3);
            const cx = 45, cy = 45;
            let endX = cx + r * 0.5;
            let endY = cy - r * 0.95;

            // 화살표 위치 조정: 돼지꼬리와 적당히 겹치도록
            endX += 6; // 오른쪽으로 (기존 10에서 6으로 조정)
            endY -= 3; // 위로 (기존 5에서 3으로 조정)

            // 화살촉 크기를 0.87배로 (1.3 * 2/3)
            const arrowSize = 15 * 1.3 * (2 / 3);
            // 화살촉 각도 (돼지꼬리 끝 방향에 맞춰서) - 오른쪽으로 10도 회전
            const arrowAngle = -35 * Math.PI / 180; // -35도 (오른쪽 위를 향함)

            // 화살촉 두 선분
            const arrow1X = endX - arrowSize * Math.cos(arrowAngle - Math.PI / 6);
            const arrow1Y = endY - arrowSize * Math.sin(arrowAngle - Math.PI / 6);
            const arrow2X = endX - arrowSize * Math.cos(arrowAngle + Math.PI / 6);
            const arrow2Y = endY - arrowSize * Math.sin(arrowAngle + Math.PI / 6);

            const pathD = `M ${arrow1X},${arrow1Y} L ${endX},${endY} L ${arrow2X},${arrow2Y}`;

            pathElement.setAttribute('d', pathD);

            log('[Path d - Arrow]', effectType, pathD);
        } else if (effectType === 'glow-circle') {
            // 동그라미: 항상 body에 fixed positioning (잘림 방지)
            const rect = element.getBoundingClientRect();

            const extraSize = 15;
            const padding = 30;

            const actualWidth = rect.width;
            const actualHeight = rect.height;

            svgWidth = actualWidth + extraSize * 2 + padding * 2;
            svgHeight = actualHeight + extraSize * 2 + padding * 2;

            svgTop = rect.top - extraSize - padding + 5;
            svgLeft = rect.left - extraSize - padding;

            const cx = svgWidth / 2;
            const cy = svgHeight / 2;
            const rx = (actualWidth / 2) + extraSize;
            const ry = (actualHeight / 2) + extraSize;

            pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const d = `M ${cx - rx},${cy} a ${rx},${ry} 0 1,1 ${rx * 2},0 a ${rx},${ry} 0 1,1 ${-rx * 2},0`;
            pathElement.setAttribute('d', d);
        } else if (effectType === 'glow-accent-lines') {
            // 강조선 2개: 태그 왼쪽 위에 비스듬한 짧은 선 2개
            const rect = element.getBoundingClientRect();
            svgWidth = 100;
            svgHeight = 100;
            // 태그 왼쪽 위 위치
            svgTop = rect.top - 70;
            svgLeft = rect.left - 120;

            pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            // 선 2개: 스케치처럼 왼쪽 아래에서 오른쪽 위로 향하는 짧은 선들
            // 첫 번째 선 (더 위쪽, 더 긴 선)
            const line1 = `M 20,80 L 60,35`;
            // 두 번째 선 (아래쪽, 짧은 선)
            const line2 = `M 50,95 L 75,70`;

            pathElement.setAttribute('d', `${line1} M ${line2.substring(2)}`);
        } else if (effectType === 'glow-eyes') {
            // 눈 2개: 태그 오른쪽 아래에 타원형 눈 2개
            const rect = element.getBoundingClientRect();
            svgWidth = 150;
            svgHeight = 100;
            // 태그 오른쪽 아래 위치
            svgTop = rect.bottom - 20;
            svgLeft = rect.right + 20;

            pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            // 왼쪽 눈 (타원)
            const eye1CenterX = 35;
            const eye1CenterY = 50;
            const eyeRadiusX = 20;
            const eyeRadiusY = 25;

            // 오른쪽 눈 (타원)
            const eye2CenterX = 90;
            const eye2CenterY = 50;

            // 두 개의 타원을 그리기 (스케치처럼)
            const eye1 = `M ${eye1CenterX - eyeRadiusX},${eye1CenterY} a ${eyeRadiusX},${eyeRadiusY} 0 1,1 ${eyeRadiusX * 2},0 a ${eyeRadiusX},${eyeRadiusY} 0 1,1 ${-eyeRadiusX * 2},0`;
            const eye2 = `M ${eye2CenterX - eyeRadiusX},${eye2CenterY} a ${eyeRadiusX},${eyeRadiusY} 0 1,1 ${eyeRadiusX * 2},0 a ${eyeRadiusX},${eyeRadiusY} 0 1,1 ${-eyeRadiusX * 2},0`;

            pathElement.setAttribute('d', `${eye1} ${eye2}`);
        }

        // 공통 속성 설정
        pathElement.setAttribute('stroke-linecap', 'round');
        pathElement.setAttribute('stroke-linejoin', 'round');

        // 공통 속성
        pathElement.setAttribute('stroke', color);
        pathElement.setAttribute('fill', 'none');

        // stroke-width: step 상세 씬은 1px, 나머지는 3px
        let strokeWidth = isInStepDetailScene ? 1 : 3;
        pathElement.setAttribute('stroke-width', strokeWidth);

        pathElement.setAttribute('stroke-linecap', 'round');
        pathElement.setAttribute('stroke-linejoin', 'round');
        pathElement.setAttribute('stroke-opacity', '1');

        // SVG 텍스처 + 그림자 필터 생성 (size 1, radius 8.3 + shadow)
        const filterId = `texture-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', filterId);
        filter.setAttribute('x', '-50%');
        filter.setAttribute('y', '-50%');
        filter.setAttribute('width', '200%');
        filter.setAttribute('height', '200%');

        // feDropShadow: 그림자 효과 (매우 진하게)
        const feDropShadow = document.createElementNS('http://www.w3.org/2000/svg', 'feDropShadow');
        feDropShadow.setAttribute('dx', '0');
        feDropShadow.setAttribute('dy', '0');
        feDropShadow.setAttribute('stdDeviation', '50');
        feDropShadow.setAttribute('flood-color', '#000000');
        feDropShadow.setAttribute('flood-opacity', '0.98');
        feDropShadow.setAttribute('result', 'shadow');

        // feTurbulence: size와 radius 파라미터로 텍스처 생성
        const turbulence = document.createElementNS('http://www.w3.org/2000/svg', 'feTurbulence');
        turbulence.setAttribute('type', 'fractalNoise');
        turbulence.setAttribute('baseFrequency', '1');
        turbulence.setAttribute('numOctaves', '1');
        turbulence.setAttribute('seed', Math.floor(Math.random() * 1000));

        // feDisplacementMap: radius 8.3으로 텍스처 변위 적용
        const displacementMap = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap');
        displacementMap.setAttribute('in', 'shadow');
        displacementMap.setAttribute('scale', '8.3');

        filter.appendChild(feDropShadow);
        filter.appendChild(turbulence);
        filter.appendChild(displacementMap);
        defs.appendChild(filter);

        // pathElement에 필터 적용
        pathElement.setAttribute('filter', `url(#${filterId})`);

        // SVG 설정
        svg.appendChild(defs);

        // SVG 크기 설정
        svg.setAttribute('width', svgWidth);
        svg.setAttribute('height', svgHeight);
        svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
        svg.setAttribute('overflow', 'visible');

        // precomputedRect이 전달된 경우 모든 효과를 fixed로 body에 추가
        // 그 외: 별/체크/물음표/동그라미/웨이브/돼지꼬리/화살표/강조선/눈은 fixed로 body에 추가, 일반 밑줄만 absolute로 element에 추가
        const shouldUseFixed = precomputedRect || effectType === 'glow-star' || effectType === 'glow-check' || effectType === 'glow-question' || effectType === 'glow-circle' || effectType === 'glow-wavy' || effectType === 'glow-curl' || effectType === 'glow-curl-arrow' || effectType === 'glow-arrow' || effectType === 'glow-accent-lines' || effectType === 'glow-eyes';

        if (shouldUseFixed) {
            svg.style.position = 'fixed';
        } else {
            svg.style.position = 'absolute';
        }

        svg.style.setProperty('overflow', 'visible', 'important');
        svg.style.pointerEvents = 'none';
        svg.style.setProperty('z-index', '9999', 'important');
        svg.style.contain = 'none';

        // 위치 설정 - 화면 경계 내로 제한 (스크롤 방지)
        const clampedTop = Math.max(0, Math.min(svgTop, window.innerHeight - svgHeight));
        const clampedLeft = Math.max(0, Math.min(svgLeft, window.innerWidth - svgWidth));
        svg.style.top = `${clampedTop}px`;
        svg.style.left = `${clampedLeft}px`;

        // 물음표는 30도 회전
        if (effectType === 'glow-question') {
            svg.style.transform = 'rotate(30deg)';
            svg.style.transformOrigin = 'center center';
        }

        // 돼지꼬리는 45도 회전
        if (effectType === 'glow-curl' || effectType === 'glow-curl-arrow') {
            svg.style.transform = 'rotate(45deg)';
            svg.style.transformOrigin = 'center center';
        }

        // 화살표는 35도 회전 (반시계 방향 10도)
        if (effectType === 'glow-arrow') {
            svg.style.transform = 'rotate(35deg)';
            svg.style.transformOrigin = 'center center';
        }

        svg.appendChild(pathElement);

        // 물음표의 점 요소를 SVG에 추가
        let dotElement = null;
        if (effectType === 'glow-question') {
            const scale = 1.4;
            const iconX = 25;
            const iconY = 35;
            const dotCx = 29 * scale + iconX;
            const dotCy = 38 * scale + iconY;
            const dotR = 2 * scale;

            dotElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dotElement.setAttribute('cx', dotCx);
            dotElement.setAttribute('cy', dotCy);
            dotElement.setAttribute('r', dotR);
            dotElement.setAttribute('fill', color);
            dotElement.setAttribute('opacity', '0');

            svg.appendChild(dotElement);
        }

        // precomputedRect이 전달된 경우 body에 직접 추가
        // 그 외: 별/체크/물음표/동그라미/웨이브/돼지꼬리/화살표/강조선/눈은 body에 직접 추가, 일반 밑줄만 element에 추가
        if (shouldUseFixed) {
            if (sceneScale !== 1 && effectType !== 'glow-circle' && effectType !== 'glow-wavy' && effectType !== 'glow-accent-lines' && effectType !== 'glow-eyes') {
                // SVG 크기를 scale에 맞게 조정 (더 크게)
                const currentWidth = parseFloat(svg.getAttribute('width'));
                const currentHeight = parseFloat(svg.getAttribute('height'));
                svg.setAttribute('width', currentWidth / sceneScale);
                svg.setAttribute('height', currentHeight / sceneScale);

                log(`[SVG Scale] SVG 크기 조정 - 원래: ${currentWidth}x${currentHeight}, 조정 후: ${currentWidth / sceneScale}x${currentHeight / sceneScale}`);
            }

            document.body.appendChild(svg);
            log(`[SVG Effect] SVG를 body에 직접 추가 - position: fixed, effectType: ${effectType}`);
        } else {
            // element와 부모들의 overflow visible 설정 (밑줄용)
            element.style.setProperty('position', 'relative', 'important');
            element.style.setProperty('overflow', 'visible', 'important');
            log(`[SVG Effect] element position: ${getComputedStyle(element).position}`);

            let parent = element.parentElement;
            let depth = 0;
            while (parent && depth < 15) {
                // viewport, frame-container, body는 overflow를 건드리지 않음 (스크롤 방지)
                if (parent.classList.contains('viewport') ||
                    parent.classList.contains('frame-container') ||
                    parent.tagName === 'BODY' ||
                    parent.tagName === 'HTML') {
                    log(`[SVG Effect] ${parent.className || parent.tagName} overflow 건너뜀 (스크롤 방지)`);
                    break;
                }

                parent.style.setProperty('overflow', 'visible', 'important');
                log(`[SVG Effect] overflow visible 설정: ${parent.className || parent.tagName}`);

                if (parent.classList.contains('lecture-frame')) {
                    break;
                }
                parent = parent.parentElement;
                depth++;
            }

            // element에 SVG 추가
            element.appendChild(svg);
        }

        // DOM에 추가된 후 path 길이 계산
        const pathLength = pathElement.getTotalLength ? pathElement.getTotalLength() : 200;
        log(`[SVG Effect] ${effectType} pathLength:`, pathLength);

        // 초기 상태 설정
        pathElement.style.strokeDasharray = pathLength;
        pathElement.style.strokeDashoffset = pathLength;
        pathElement.style.opacity = '1';
        log(`[SVG Effect] 초기 상태 설정 완료 - dasharray: ${pathLength}, dashoffset: ${pathLength}`);

        // 모든 효과 그리기 시간 통일: 200ms (customDuration으로 오버라이드 가능)
        const drawDuration = customDuration || 0.2;
        const drawDurationMs = drawDuration * 1000;

        // 애니메이션 시작
        if (true) {
            // 애니메이션 시작 (이중 RAF로 확실하게 transition 적용)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    log(`[SVG Effect] 애니메이션 시작 - drawDuration: ${drawDuration}s`);
                    pathElement.style.transition = `stroke-dashoffset ${drawDuration}s ease-out, opacity 1.0s ease-out`;
                    pathElement.style.strokeDashoffset = '0';
                    log(`[SVG Effect] dashoffset: 0 설정, 그리기 시작`);

                    // 물음표 점은 그리기 완료 후 페이드 인
                    if (dotElement) {
                        setTimeout(() => {
                            dotElement.style.transition = 'opacity 0.3s ease-in';
                            dotElement.style.opacity = '1';
                            log(`[SVG Effect] 물음표 점 페이드 인 시작`);
                        }, drawDurationMs);
                    }

                    // 그리기 완료 후 svg 전체를 fade out
                    let fadeOutDelay = 400 + fadeOutExtraDelay;
                    setTimeout(() => {
                        svg.style.transition = 'opacity 1.0s ease-out';
                        svg.style.opacity = '0';
                        log(`[SVG Effect] fade out 시작 - ${effectType}, delay: ${fadeOutDelay}ms`);
                    }, fadeOutDelay);
                });
            });
        }

        // SVG 제거 타이밍: fade out 시작(400 + fadeOutExtraDelay) + fade out 지속(1000ms)
        let removeDelay = 400 + fadeOutExtraDelay + 1000;
        setTimeout(() => {
            if (svg.parentNode) {
                svg.parentNode.removeChild(svg);
            }
        }, removeDelay);
    });
}

/**
 * Border SVG 생성
 * @param {HTMLElement} container - SVG를 추가할 컨테이너
 * @param {number} borderRadius - 테두리 반경
 */
export function createBorderSVG(container, borderRadius) {
    // 이미 SVG가 있으면 생성하지 않음
    if (container.querySelector('.border-svg')) return;

    // 컨테이너의 실제 크기 가져오기
    const rect = container.getBoundingClientRect();
    const width = rect.width + 4; // border 두께 고려
    const height = rect.height + 4;

    const borderDiv = document.createElement('div');
    borderDiv.className = 'border-svg';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.style.width = '100%';
    svg.style.height = '100%';

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    // 시계 반대방향: 왼쪽 위 모서리부터 시작 (커브 시작점)
    const r = borderRadius;
    const pathData = `M 2 ${r}
                     L 2 ${height - r - 2}
                     Q 2 ${height - 2} ${r} ${height - 2}
                     L ${width - r - 2} ${height - 2}
                     Q ${width - 2} ${height - 2} ${width - 2} ${height - r - 2}
                     L ${width - 2} ${r}
                     Q ${width - 2} 2 ${width - r - 2} 2
                     L ${r} 2
                     Q 2 2 2 ${r}`;

    path.setAttribute('d', pathData);

    svg.appendChild(path);
    borderDiv.appendChild(svg);
    // border-svg를 맨 앞에 추가하여 :last-of-type selector가 정상 작동하도록 함
    container.insertBefore(borderDiv, container.firstChild);

    // Path 길이 계산하여 정확한 dasharray 설정
    setTimeout(() => {
        const pathLength = path.getTotalLength();
        path.style.strokeDasharray = `0 ${pathLength}`;
        path.style.strokeDashoffset = '0';

        // CSS 변수로 길이 설정
        container.style.setProperty('--path-length', pathLength);

        log('SVG border 생성 완료:', container.className, `경로 길이: ${pathLength}`);
    }, 10);
}

/**
 * 텍스트 SVG 효과 생성 (별/체크 단일 효과 오른쪽에 표시)
 * @param {HTMLElement} element - 효과를 적용할 요소
 * @param {string} iconType - 아이콘 타입 (glow-star, glow-check, tag-decoration)
 * @param {string} customText - 커스텀 텍스트 (기본값: null)
 */
export function createTextEffect(element, iconType, customText = null) {
    // requestAnimationFrame을 사용하여 레이아웃 계산을 다음 프레임으로 지연
    requestAnimationFrame(() => {
        const color = getHighlightColor(element);
        const rect = element.getBoundingClientRect();

        // 텍스트 선택 (커스텀 텍스트가 있으면 사용, 없으면 랜덤)
        let text;
        if (customText) {
            text = customText;
        } else {
            const texts = ['중요', '핵심', '기억'];
            text = texts[Math.floor(Math.random() * texts.length)];
        }

        // SVG 생성
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add('glow-text-svg');

        let svgWidth = 120;
        let svgHeight = 80;
        let svgTop, svgLeft;

        // 태그 장식용 텍스트는 왼쪽에 배치
        if (iconType === 'tag-decoration') {
            svgWidth = 150;
            svgHeight = 100;
            svgTop = rect.top - 50;
            svgLeft = rect.left - 180;
        } else {
            // 별/체크 아이콘 + 텍스트를 scene-title 위에 배치
            svgWidth = 180;
            svgHeight = 80;
            svgTop = rect.top - svgHeight + 30;  // scene-title 위에서 40px 아래로
            svgLeft = rect.left + (rect.width - svgWidth) / 2 + 100;  // 가운데에서 100px 오른쪽으로
        }

        svg.setAttribute('width', svgWidth);
        svg.setAttribute('height', svgHeight);
        svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
        svg.style.position = 'fixed';

        // 위치 설정 - 화면 경계 내로 제한 (스크롤 방지)
        const clampedTop = Math.max(0, Math.min(svgTop, window.innerHeight - svgHeight));
        const clampedLeft = Math.max(0, Math.min(svgLeft, window.innerWidth - svgWidth));
        svg.style.top = `${clampedTop}px`;
        svg.style.left = `${clampedLeft}px`;

        svg.style.pointerEvents = 'none';
        svg.style.zIndex = '9999';
        svg.style.opacity = '0';
        svg.style.overflow = 'visible';

        // 그림자 + 텍스처 필터 생성 (SVG 경로와 동일)
        const filterId = `text-texture-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', filterId);
        filter.setAttribute('x', '-50%');
        filter.setAttribute('y', '-50%');
        filter.setAttribute('width', '200%');
        filter.setAttribute('height', '200%');

        // feDropShadow: 그림자 효과
        const feDropShadow = document.createElementNS('http://www.w3.org/2000/svg', 'feDropShadow');
        feDropShadow.setAttribute('dx', '0');
        feDropShadow.setAttribute('dy', '0');
        feDropShadow.setAttribute('stdDeviation', '50');
        feDropShadow.setAttribute('flood-color', '#000000');
        feDropShadow.setAttribute('flood-opacity', '0.98');
        feDropShadow.setAttribute('result', 'shadow');

        // feTurbulence: 텍스처 생성
        const turbulence = document.createElementNS('http://www.w3.org/2000/svg', 'feTurbulence');
        turbulence.setAttribute('type', 'fractalNoise');
        turbulence.setAttribute('baseFrequency', '1');
        turbulence.setAttribute('numOctaves', '4');
        turbulence.setAttribute('result', 'turbulence');

        // feDisplacementMap: 텍스처 변위 적용
        const displacementMap = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap');
        displacementMap.setAttribute('in', 'SourceGraphic');
        displacementMap.setAttribute('in2', 'turbulence');
        displacementMap.setAttribute('scale', '5.5');
        displacementMap.setAttribute('result', 'displacement');

        // feComposite: displacement와 shadow 합성
        const feComposite = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
        feComposite.setAttribute('in', 'displacement');
        feComposite.setAttribute('in2', 'shadow');
        feComposite.setAttribute('operator', 'over');

        filter.appendChild(feDropShadow);
        filter.appendChild(turbulence);
        filter.appendChild(displacementMap);
        filter.appendChild(feComposite);
        defs.appendChild(filter);
        svg.appendChild(defs);

        // 아이콘(별 또는 체크) path 생성
        const iconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        iconPath.setAttribute('stroke', color);
        iconPath.setAttribute('fill', 'none');
        iconPath.setAttribute('stroke-width', '4');
        iconPath.setAttribute('stroke-linecap', 'round');
        iconPath.setAttribute('stroke-linejoin', 'round');
        iconPath.setAttribute('filter', `url(#${filterId})`);

        // 아이콘 타입에 따른 경로 설정
        if (iconType === 'glow-star') {
            // 오각별 펜타그램 경로 (왼쪽에 배치)
            const iconX = 10;
            const iconY = 20;
            const scale = 2.25;

            const p1x = 29.25 * scale + iconX, p1y = 6.5 * scale + iconY;
            const p2x = 39 * scale + iconX, p2y = 36.4 * scale + iconY;
            const p3x = 13 * scale + iconX, p3y = 15.6 * scale + iconY;
            const p4x = 45.5 * scale + iconX, p4y = 15.6 * scale + iconY;
            const p5x = 19.5 * scale + iconX, p5y = 36.4 * scale + iconY;

            const pathD = `M${p1x},${p1y} Q${(p1x + p2x) / 2 - 2},${(p1y + p2y) / 2} ${p2x},${p2y} Q${(p2x + p3x) / 2},${(p2y + p3y) / 2 - 2} ${p3x},${p3y} Q${(p3x + p4x) / 2},${(p3y + p4y) / 2 + 2} ${p4x},${p4y} Q${(p4x + p5x) / 2 + 2},${(p4y + p5y) / 2} ${p5x},${p5y} Q${(p5x + p1x) / 2},${(p5y + p1y) / 2 + 2} ${p1x},${p1y}`;
            iconPath.setAttribute('d', pathD);
        } else if (iconType === 'glow-check') {
            // 체크 경로 (왼쪽에 배치)
            const iconX = 10;
            const iconY = 20;
            const scale = 2.25;
            const pathD = `M${13 * scale + iconX},${29.9 * scale + iconY} Q${18.2 * scale + iconX},${33.8 * scale + iconY} ${23.4 * scale + iconX},${39 * scale + iconY} Q${32.5 * scale + iconX},${28.6 * scale + iconY} ${45.5 * scale + iconX},${15.6 * scale + iconY}`;
            iconPath.setAttribute('d', pathD);
        }

        svg.appendChild(iconPath);

        // 텍스트 요소 (아이콘 오른쪽에 배치)
        const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textElement.setAttribute('x', '65');
        textElement.setAttribute('y', '55');
        textElement.setAttribute('fill', color);
        textElement.setAttribute('font-family', 'GangwonEduSaeeum');
        textElement.setAttribute('font-size', '46');
        textElement.setAttribute('font-weight', 'bold');
        textElement.setAttribute('filter', `url(#${filterId})`);
        textElement.textContent = text;

        svg.appendChild(textElement);
        document.body.appendChild(svg);

        log(`[Text Effect] 아이콘 "${iconType}" + 텍스트 "${text}" 생성, 위치: ${clampedLeft}, ${clampedTop}`);

        // Fade in 애니메이션 (아이콘 그려진 후 0.2초 후)
        setTimeout(() => {
            svg.style.transition = 'opacity 0.4s ease-in';
            svg.style.opacity = '1';

            // Fade out (1초 후)
            setTimeout(() => {
                svg.style.transition = 'opacity 0.5s ease-out';
                svg.style.opacity = '0';

                // 제거
                setTimeout(() => {
                    if (svg.parentNode) {
                        svg.parentNode.removeChild(svg);
                    }
                }, 500);
            }, 500);
        }, 200);
    });
}

/**
 * 고정 위치에 조합 효과 적용 (마지막 단어용)
 * @param {DOMRect} rect - 요소의 위치 정보
 * @param {string} effectType - 효과 타입
 * @param {string} word - 단어
 * @param {Function} createSVGEffectCallback - createSVGEffect 콜백 함수 (LectureTemplate의 메서드를 바인딩하여 전달)
 */
export function createFixedPositionEffect(rect, effectType, word, createSVGEffectCallback) {
    log(`[Fixed Position Effect] "${word}"에 ${effectType} 효과 적용 - 원본 위치:`, {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
    });

    // rect 정보로 임시 span 요소 생성 (화면에 보이지 않게, 위치만 정확히)
    const tempElement = document.createElement('span');
    tempElement.style.position = 'fixed';
    tempElement.style.left = `${rect.left}px`;
    tempElement.style.top = `${rect.top}px`;
    tempElement.style.width = `${rect.width}px`;
    tempElement.style.height = `${rect.height}px`;
    tempElement.style.opacity = '0';
    tempElement.style.pointerEvents = 'none';
    tempElement.style.display = 'inline-block';
    tempElement.style.zIndex = '9999';
    tempElement.textContent = word;
    document.body.appendChild(tempElement);

    log(`[Fixed Position Effect] tempElement 스타일:`, {
        position: tempElement.style.position,
        left: tempElement.style.left,
        top: tempElement.style.top,
        width: tempElement.style.width,
        height: tempElement.style.height
    });

    // requestAnimationFrame으로 레이아웃 완료 대기
    requestAnimationFrame(() => {
        // 디버깅: tempElement의 실제 rect 확인
        const tempRect = tempElement.getBoundingClientRect();
        log(`[Fixed Position Effect] tempElement 실제 rect:`, {
            left: tempRect.left,
            top: tempRect.top,
            width: tempRect.width,
            height: tempRect.height,
            원본과_차이: {
                left: tempRect.left - rect.left,
                top: tempRect.top - rect.top
            }
        });

        if (effectType === 'glow-circle-check') {
            // 9번: 동그라미(0ms) -> 체크(200ms), 모두 400ms에 사라짐
            createSVGEffectCallback(tempElement, 'glow-circle', 0, null, 200, rect);
            setTimeout(() => {
                createSVGEffectCallback(tempElement, 'glow-check', 0, null, 0, rect);
            }, 200);
        } else if (effectType === 'glow-pulse-question') {
            // 10번: 밑줄(0ms) -> 물음표(200ms), 모두 600ms에 사라짐
            createSVGEffectCallback(tempElement, 'glow-pulse', 0, null, 200, rect);
            setTimeout(() => {
                createSVGEffectCallback(tempElement, 'glow-question', 0, null, 0, rect);
            }, 200);
        } else if (effectType === 'glow-circle-curl-arrow') {
            // 14번: 동그라미(0ms) -> 돼지꼬리(200ms) -> 화살표(400ms), 모두 800ms에 사라짐
            createSVGEffectCallback(tempElement, 'glow-circle', 0, null, 400, rect);
            setTimeout(() => {
                createSVGEffectCallback(tempElement, 'glow-curl', 0, null, 200, rect);
            }, 200);
            setTimeout(() => {
                createSVGEffectCallback(tempElement, 'glow-arrow', 0, null, 0, rect);
            }, 400);
        }
    });

    // 효과가 완료된 후 임시 요소 제거
    setTimeout(() => {
        if (tempElement.parentNode) {
            tempElement.parentNode.removeChild(tempElement);
        }
    }, 2000);
}

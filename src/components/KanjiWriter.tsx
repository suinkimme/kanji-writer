import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { getKanjiSVG } from '@/data';

interface Props {
  children?: ReactNode;
  size?: number;
}

export function Kanjiwriter({ children, size = 100 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (size <= 0 || !Number.isInteger(size)) {
      console.warn('Kanjiwriter: size must be a positive integer');
      return;
    }

    // children에서 텍스트 추출
    const text = typeof children === 'string' ? children : String(children || '');
    if (!text || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = '';

    // 텍스트를 문자 배열로 분리
    const characters = Array.from(text);

    // 각 문자에 대해 SVG 가져오기
    Promise.all(characters.map(char => getKanjiSVG(char))).then(svgArray => {
      // cleanup: 컴포넌트가 unmount되었거나 children/size가 변경된 경우
      if (!containerRef.current) return;

      // 기존 내용 제거 (중복 방지)
      const currentContainer = containerRef.current;
      currentContainer.innerHTML = '';

      svgArray.forEach((svg, charIndex) => {
        if (!svg) return;

        // SVG 문자열을 파싱하기 위한 임시 div
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = svg;
        const svgElement = tempDiv.querySelector('svg');
        if (!svgElement) return;

        // SVG를 inline-block으로 표시
        svgElement.style.display = 'inline-block';

        // SVG 크기 설정
        svgElement.setAttribute('width', size.toString());
        svgElement.setAttribute('height', size.toString());

        // 모든 path 요소 찾기 (이미 획순대로 정렬되어 있음)
        const paths = Array.from(svgElement.querySelectorAll('path[id*="-s"]'));

        // 획순 번호 텍스트 숨기기
        const strokeNumbersGroup = svgElement.querySelector('[id*="StrokeNumbers"]');
        if (strokeNumbersGroup) {
          strokeNumbersGroup.setAttribute('style', 'display: none;');
        }

        // 애니메이션 스타일 생성
        const animations: string[] = [];

        paths.forEach((path, pathIndex) => {
          const pathId = path.getAttribute('id');
          if (!pathId) return;

          const pathElement = path as SVGPathElement;

          // path 길이 계산 (이제 DOM에 추가되어 있으므로 정상 작동)
          const pathLength = pathElement.getTotalLength();
          if (pathLength === 0) return;

          // 각 문자의 첫 번째 획이 이전 문자의 마지막 획 이후에 시작되도록 delay 계산
          const previousStrokes = svgArray.slice(0, charIndex).reduce((total, prevSvg) => {
            if (!prevSvg) return total;
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = prevSvg;
            const prevPaths = tempDiv.querySelectorAll('path[id*="-s"]');
            return total + prevPaths.length;
          }, 0);

          const delay = (previousStrokes + pathIndex) * 0.5; // 각 획 사이 0.5초 간격
          const duration = 0.8; // 각 획 그리기 시간 0.8초

          // stroke-dasharray와 stroke-dashoffset 설정
          path.setAttribute('stroke-dasharray', pathLength.toString());
          path.setAttribute('stroke-dashoffset', pathLength.toString());

          // 애니메이션 CSS 추가 (고유한 이름을 위해 charIndex와 pathIndex 사용)
          const animationName = `draw-${charIndex}-${pathIndex}`;
          animations.push(`
            @keyframes ${animationName} {
              to {
                stroke-dashoffset: 0;
              }
            }
            #${pathId.replace(/:/g, '\\:')} {
              animation: ${animationName} ${duration}s ease-in-out ${delay}s forwards;
            }
          `);
        });

        // style 요소에 애니메이션 추가
        if (animations.length > 0) {
          let styleElement = svgElement.querySelector('style#kanji-animations') as SVGStyleElement;
          if (!styleElement) {
            styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
            styleElement.setAttribute('id', `kanji-animations-${charIndex}`);
            svgElement.insertBefore(styleElement, svgElement.firstChild);
          }
          styleElement.textContent = animations.join('\n');
        }

        // SVG를 container에 직접 추가
        currentContainer.appendChild(svgElement);
      });
    });

    // cleanup 함수: 컴포넌트 unmount 시 정리
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [children, size]);

  return <div ref={containerRef} />;
}

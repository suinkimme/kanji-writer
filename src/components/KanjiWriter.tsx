import { useEffect, useRef } from 'react';
import { getKanjiSVG } from '@/data';

interface Props {
  value: string;
  size?: number;
}

export function KanjiWriter({ value, size = 100 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (size <= 0 || !Number.isInteger(size)) {
      console.warn('KanjiWriter: size must be a positive integer');
      return;
    }

    getKanjiSVG(value).then(svg => {
      if (!svg || !containerRef.current) return;

      const container = containerRef.current;
      container.innerHTML = svg;

      // DOM에 추가된 후 SVG 요소 가져오기
      const svgElement = container.querySelector('svg');
      if (!svgElement) return;

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

      paths.forEach((path, index) => {
        const pathId = path.getAttribute('id');
        if (!pathId) return;

        const pathElement = path as SVGPathElement;

        // path 길이 계산 (이제 DOM에 추가되어 있으므로 정상 작동)
        const pathLength = pathElement.getTotalLength();
        if (pathLength === 0) return;

        const delay = index * 0.5; // 각 획 사이 0.5초 간격
        const duration = 0.8; // 각 획 그리기 시간 0.8초

        // stroke-dasharray와 stroke-dashoffset 설정
        path.setAttribute('stroke-dasharray', pathLength.toString());
        path.setAttribute('stroke-dashoffset', pathLength.toString());

        // 애니메이션 CSS 추가
        const animationName = `draw-${index}`;
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
          styleElement.setAttribute('id', 'kanji-animations');
          svgElement.insertBefore(styleElement, svgElement.firstChild);
        }
        styleElement.textContent = animations.join('\n');
      }
    });
  }, [value, size]);

  return <div ref={containerRef} />;
}

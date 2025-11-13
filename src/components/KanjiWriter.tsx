import { useEffect, useRef } from 'react';
import { getKanjiSVG } from '@/data';

interface Props {
  value: string;
}

export function KanjiWriter({ value }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getKanjiSVG(value).then(svg => {
      if (!svg || !containerRef.current) return;

      const container = containerRef.current;
      container.innerHTML = svg;

      // DOM에 추가된 후 SVG 요소 가져오기
      const svgElement = container.querySelector('svg');
      if (!svgElement) return;

      // StrokeNumbers 그룹에서 text 요소들 찾기
      const strokeNumbersGroup = svgElement.querySelector('[id*="StrokeNumbers"]');
      if (!strokeNumbersGroup) return;

      const textElements = Array.from(strokeNumbersGroup.querySelectorAll('text'));

      // text 내용(획순 번호) 추출 및 정렬
      const strokeOrder: number[] = [];
      textElements.forEach(text => {
        const number = parseInt(text.textContent || '0', 10);
        if (number > 0) {
          strokeOrder.push(number);
        }
      });
      strokeOrder.sort((a, b) => a - b);

      // SVG의 기본 ID 추출 (예: 065e5)
      const baseGroup = svgElement.querySelector('g[id*="kvg:"]:not([id*="Stroke"])');
      const baseId = baseGroup?.getAttribute('id')?.replace('kvg:', '') || '';

      // 애니메이션 스타일 생성
      const animations: string[] = [];

      strokeOrder.forEach((number, index) => {
        // path id에서 획순 번호로 찾기 (예: kvg:065e5-s1)
        const pathId = `kvg:${baseId}-s${number}`;
        const path = svgElement.querySelector(`path[id="${pathId}"]`) as SVGPathElement;

        if (!path) return;

        // path 길이 계산 (이제 DOM에 추가되어 있으므로 정상 작동)
        const pathLength = path.getTotalLength();
        if (pathLength === 0) return;

        const delay = index * 0.5; // 각 획 사이 0.5초 간격
        const duration = 0.8; // 각 획 그리기 시간 0.8초

        // stroke-dasharray와 stroke-dashoffset 설정
        path.setAttribute('stroke-dasharray', pathLength.toString());
        path.setAttribute('stroke-dashoffset', pathLength.toString());

        // 애니메이션 CSS 추가
        const animationName = `draw-${number}`;
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

      // 획순 번호 텍스트 숨기기
      strokeNumbersGroup.setAttribute('style', 'display: none;');
    });
  }, [value]);

  return <div ref={containerRef} />;
}

/**
 * Componente AnimatedText
 *
 * Anima texto letra por letra ou palavra por palavra.
 * Ótimo para títulos e headlines.
 */

'use client';

import { useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap';

interface AnimatedTextProps {
  children: string;
  type?: 'chars' | 'words' | 'lines';
  stagger?: number;
  delay?: number;
  duration?: number;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  animation?: 'fadeUp' | 'fadeIn' | 'scale' | 'blur';
  triggerOnScroll?: boolean;
}

export function AnimatedText({
  children,
  type = 'words',
  stagger = 0.05,
  delay = 0,
  duration = 0.5,
  className = '',
  as: Component = 'p',
  animation = 'fadeUp',
  triggerOnScroll = false,
}: AnimatedTextProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Dividir o texto em elementos
    const text = children;
    let elements: string[] = [];

    if (type === 'chars') {
      elements = text.split('');
    } else if (type === 'words') {
      elements = text.split(' ');
    } else {
      elements = text.split('\n');
    }

    // Criar spans para cada elemento
    ref.current.innerHTML = elements
      .map((el, i) => {
        const content = type === 'words' ? el + (i < elements.length - 1 ? '&nbsp;' : '') : el;
        return `<span class="inline-block overflow-hidden"><span class="anim-text-inner inline-block">${content}</span></span>`;
      })
      .join('');

    // Configurar animação baseada no tipo
    const animationConfigs = {
      fadeUp: {
        from: { opacity: 0, y: 20 },
        to: { opacity: 1, y: 0 },
      },
      fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 },
      },
      scale: {
        from: { opacity: 0, scale: 0 },
        to: { opacity: 1, scale: 1 },
      },
      blur: {
        from: { opacity: 0, filter: 'blur(10px)' },
        to: { opacity: 1, filter: 'blur(0px)' },
      },
    };

    const config = animationConfigs[animation];

    const ctx = gsap.context(() => {
      const innerElements = ref.current!.querySelectorAll('.anim-text-inner');

      const toVars: gsap.TweenVars = {
        ...config.to,
        stagger,
        delay,
        duration,
        ease: 'power2.out',
      };

      if (triggerOnScroll) {
        toVars.scrollTrigger = {
          trigger: ref.current,
          start: 'top 85%',
        };
      }

      gsap.fromTo(innerElements, config.from, toVars);
    });

    return () => ctx.revert();
  }, [children, type, stagger, delay, duration, animation, triggerOnScroll]);

  return <Component ref={ref as React.RefObject<HTMLParagraphElement>} className={className} />;
}

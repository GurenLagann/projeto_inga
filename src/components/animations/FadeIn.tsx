/**
 * Componente FadeIn
 *
 * Wrapper que aplica animação de fade in aos seus filhos.
 * Pode ser configurado para diferentes direções e delays.
 */

'use client';

import { useRef, useEffect, ReactNode } from 'react';
import { gsap } from '@/lib/gsap';

interface FadeInProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  triggerOnScroll?: boolean;
}

export function FadeIn({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  distance = 30,
  className = '',
  triggerOnScroll = false,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const directionMap = {
      up: { y: distance },
      down: { y: -distance },
      left: { x: distance },
      right: { x: -distance },
      none: {},
    };

    const fromVars = {
      opacity: 0,
      ...directionMap[direction],
    };

    const toVars: gsap.TweenVars = {
      opacity: 1,
      x: 0,
      y: 0,
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

    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current, fromVars, toVars);
    });

    return () => ctx.revert();
  }, [direction, delay, duration, distance, triggerOnScroll]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

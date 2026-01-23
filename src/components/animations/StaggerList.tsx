/**
 * Componente StaggerList
 *
 * Wrapper que aplica animação stagger aos seus filhos.
 * Cada filho aparece com um pequeno delay em relação ao anterior.
 */

'use client';

import { useRef, useEffect, ReactNode } from 'react';
import { gsap } from '@/lib/gsap';

interface StaggerListProps {
  children: ReactNode;
  stagger?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  triggerOnScroll?: boolean;
}

export function StaggerList({
  children,
  stagger = 0.1,
  direction = 'up',
  delay = 0,
  duration = 0.5,
  distance = 40,
  className = '',
  triggerOnScroll = true,
}: StaggerListProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const directionMap = {
      up: { y: distance },
      down: { y: -distance },
      left: { x: distance },
      right: { x: -distance },
    };

    const fromVars = {
      opacity: 0,
      ...directionMap[direction],
    };

    const toVars: gsap.TweenVars = {
      opacity: 1,
      x: 0,
      y: 0,
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

    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current!.children, fromVars, toVars);
    });

    return () => ctx.revert();
  }, [stagger, direction, delay, duration, distance, triggerOnScroll]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

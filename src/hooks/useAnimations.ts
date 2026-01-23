/**
 * Hooks customizados para animações GSAP
 *
 * Estes hooks facilitam a aplicação de animações comuns nos componentes React.
 * Todos os hooks limpam suas animações automaticamente no unmount.
 */

'use client';

import { useRef, useEffect, useCallback } from 'react';
import { gsap, animationPresets, durations } from '@/lib/gsap';

/**
 * Hook para animação de fade in ao montar o componente
 *
 * @param options - Configurações da animação
 * @returns ref - Ref para aplicar ao elemento
 *
 * @example
 * const ref = useFadeIn({ delay: 0.2, direction: 'up' });
 * return <div ref={ref}>Conteúdo animado</div>
 */
export function useFadeIn(options: {
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
} = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const { delay = 0, duration = durations.normal, direction = 'up' } = options;

  useEffect(() => {
    if (!ref.current) return;

    const directionMap = {
      up: { y: 30 },
      down: { y: -30 },
      left: { x: 30 },
      right: { x: -30 },
    };

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { opacity: 0, ...directionMap[direction] },
        { opacity: 1, x: 0, y: 0, delay, duration }
      );
    });

    return () => ctx.revert();
  }, [delay, duration, direction]);

  return ref;
}

/**
 * Hook para animar lista de elementos com stagger
 *
 * @param options - Configurações da animação
 * @returns ref - Ref para aplicar ao container
 *
 * @example
 * const ref = useStaggerList({ stagger: 0.1 });
 * return <div ref={ref}>{items.map(item => <Card key={item.id} />)}</div>
 */
export function useStaggerList(options: {
  stagger?: number;
  duration?: number;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
} = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const {
    stagger = 0.1,
    duration = durations.normal,
    delay = 0,
    direction = 'up'
  } = options;

  useEffect(() => {
    if (!ref.current) return;

    const directionMap = {
      up: { y: 40 },
      down: { y: -40 },
      left: { x: 40 },
      right: { x: -40 },
    };

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current!.children,
        { opacity: 0, ...directionMap[direction] },
        {
          opacity: 1,
          x: 0,
          y: 0,
          stagger,
          duration,
          delay,
          ease: 'power2.out',
        }
      );
    });

    return () => ctx.revert();
  }, [stagger, duration, delay, direction]);

  return ref;
}

/**
 * Hook para animação baseada em scroll (ScrollTrigger)
 *
 * @param options - Configurações do ScrollTrigger
 * @returns ref - Ref para aplicar ao elemento
 *
 * @example
 * const ref = useScrollAnimation({ animation: 'fadeInUp' });
 * return <section ref={ref}>Seção animada ao scroll</section>
 */
export function useScrollAnimation(options: {
  animation?: keyof typeof animationPresets;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  markers?: boolean;
} = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const {
    animation = 'fadeInUp',
    start = 'top 85%',
    end = 'bottom 20%',
    scrub = false,
    markers = false,
  } = options;

  useEffect(() => {
    if (!ref.current) return;

    const preset = animationPresets[animation];

    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current, preset.from, {
        ...preset.to,
        scrollTrigger: {
          trigger: ref.current,
          start,
          end,
          scrub,
          markers,
        },
      });
    });

    return () => ctx.revert();
  }, [animation, start, end, scrub, markers]);

  return ref;
}

/**
 * Hook para animação de hover em elementos
 *
 * @returns { ref, onMouseEnter, onMouseLeave } - Props para aplicar ao elemento
 *
 * @example
 * const hoverProps = useHoverAnimation();
 * return <button {...hoverProps}>Hover me</button>
 */
export function useHoverAnimation(options: {
  scale?: number;
  duration?: number;
} = {}) {
  const ref = useRef<HTMLElement>(null);
  const { scale = 1.05, duration = 0.3 } = options;

  const onMouseEnter = useCallback(() => {
    if (ref.current) {
      gsap.to(ref.current, {
        scale,
        duration,
        ease: 'power2.out',
      });
    }
  }, [scale, duration]);

  const onMouseLeave = useCallback(() => {
    if (ref.current) {
      gsap.to(ref.current, {
        scale: 1,
        duration,
        ease: 'power2.out',
      });
    }
  }, [duration]);

  return { ref, onMouseEnter, onMouseLeave };
}

/**
 * Hook para criar timeline GSAP
 *
 * @returns { timeline, ref } - Timeline e ref para o contexto
 *
 * @example
 * const { timeline, ref } = useTimeline();
 * useEffect(() => {
 *   timeline
 *     .from('.title', { opacity: 0, y: 20 })
 *     .from('.subtitle', { opacity: 0, y: 20 }, '-=0.3');
 * }, [timeline]);
 */
export function useTimeline(options: gsap.TimelineVars = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const optionsRef = useRef(options);

  useEffect(() => {
    const ctx = gsap.context(() => {
      timelineRef.current = gsap.timeline(optionsRef.current);
    }, ref);

    return () => {
      ctx.revert();
      timelineRef.current = null;
    };
  }, []);

  return { timeline: timelineRef.current, ref };
}

/**
 * Hook para animação de contador de números
 *
 * @param endValue - Valor final do contador
 * @param options - Configurações
 * @returns { ref, value } - Ref e valor atual
 *
 * @example
 * const { ref } = useCountUp(100, { duration: 2 });
 * return <span ref={ref}>0</span>
 */
export function useCountUp(
  endValue: number,
  options: {
    duration?: number;
    delay?: number;
    startOnView?: boolean;
  } = {}
) {
  const ref = useRef<HTMLElement>(null);
  const { duration = 2, delay = 0, startOnView = true } = options;

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      const obj = { value: 0 };

      const animation = {
        value: endValue,
        duration,
        delay,
        ease: 'power2.out',
        onUpdate: () => {
          if (ref.current) {
            ref.current.textContent = Math.round(obj.value).toString();
          }
        },
      };

      if (startOnView) {
        gsap.to(obj, {
          ...animation,
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 80%',
          },
        });
      } else {
        gsap.to(obj, animation);
      }
    });

    return () => ctx.revert();
  }, [endValue, duration, delay, startOnView]);

  return { ref };
}

/**
 * Hook para animação de página/rota
 * Útil para transições entre páginas
 *
 * @returns ref - Ref para o container da página
 */
export function usePageTransition() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      // Animação de entrada
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    });

    return () => ctx.revert();
  }, []);

  return ref;
}

/**
 * Hook para animar modal (abertura e fechamento)
 *
 * @param isOpen - Estado do modal
 * @param onAnimationComplete - Callback após animação de fechamento
 * @returns ref - Ref para o modal
 */
export function useModalAnimation(
  isOpen: boolean,
  onAnimationComplete?: () => void
) {
  const ref = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    if (isOpen) {
      // Animação de abertura
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );
      gsap.fromTo(
        ref.current,
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
      );
    }
  }, [isOpen]);

  const animateClose = useCallback(() => {
    if (!ref.current) return;

    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
    gsap.to(ref.current, {
      opacity: 0,
      scale: 0.95,
      y: 10,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: onAnimationComplete,
    });
  }, [onAnimationComplete]);

  return { ref, overlayRef, animateClose };
}

/**
 * Hook para animação de texto (typewriter effect)
 *
 * @param text - Texto a ser animado
 * @returns ref - Ref para o elemento de texto
 */
export function useTypewriter(text: string, options: { speed?: number } = {}) {
  const ref = useRef<HTMLElement>(null);
  const { speed = 0.05 } = options;

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    element.textContent = '';

    const chars = text.split('');

    const ctx = gsap.context(() => {
      chars.forEach((char, i) => {
        gsap.to(element, {
          delay: i * speed,
          duration: 0,
          onComplete: () => {
            element.textContent += char;
          },
        });
      });
    });

    return () => ctx.revert();
  }, [text, speed]);

  return ref;
}

/**
 * Configuração e utilitários GSAP
 *
 * Este arquivo centraliza a configuração do GSAP e registra os plugins necessários.
 * Importar gsap daqui garante que os plugins estejam sempre registrados.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Registrar plugins apenas no cliente (evita erros de SSR)
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Configurações padrão para todas as animações
gsap.defaults({
  ease: 'power2.out',
  duration: 0.6,
});

// Configuração do ScrollTrigger
ScrollTrigger.defaults({
  toggleActions: 'play none none reverse',
  start: 'top 85%',
});

/**
 * Presets de animação reutilizáveis
 */
export const animationPresets = {
  // Fade in de baixo para cima
  fadeInUp: {
    from: { opacity: 0, y: 30 },
    to: { opacity: 1, y: 0 },
  },
  // Fade in da esquerda
  fadeInLeft: {
    from: { opacity: 0, x: -30 },
    to: { opacity: 1, x: 0 },
  },
  // Fade in da direita
  fadeInRight: {
    from: { opacity: 0, x: 30 },
    to: { opacity: 1, x: 0 },
  },
  // Scale in (para modais e cards)
  scaleIn: {
    from: { opacity: 0, scale: 0.9 },
    to: { opacity: 1, scale: 1 },
  },
  // Bounce in (mais divertido)
  bounceIn: {
    from: { opacity: 0, scale: 0.5 },
    to: { opacity: 1, scale: 1, ease: 'back.out(1.7)' },
  },
  // Slide down (para menus)
  slideDown: {
    from: { opacity: 0, y: -20, height: 0 },
    to: { opacity: 1, y: 0, height: 'auto' },
  },
};

/**
 * Eases customizados para diferentes contextos
 */
export const eases = {
  smooth: 'power2.out',
  snappy: 'power3.out',
  bounce: 'back.out(1.7)',
  elastic: 'elastic.out(1, 0.5)',
  gentle: 'power1.inOut',
};

/**
 * Durações padrão
 */
export const durations = {
  fast: 0.3,
  normal: 0.5,
  slow: 0.8,
  verySlow: 1.2,
};

export { gsap, ScrollTrigger };

'use client';

import { useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { gsap } from '@/lib/gsap';

interface HeroProps {
    onSectionChange: (section: string) => void;
}

export function Hero({ onSectionChange }: HeroProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const buttonsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            // Timeline para animação sequencial
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            // Animação do título com efeito de "reveal"
            tl.fromTo(
                titleRef.current,
                { opacity: 0, y: 60, scale: 0.9 },
                { opacity: 1, y: 0, scale: 1, duration: 1 }
            )
            // Animação do subtítulo
            .fromTo(
                subtitleRef.current,
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 0.8 },
                '-=0.5' // Começa 0.5s antes do anterior terminar
            )
            // Animação dos botões com stagger
            .fromTo(
                buttonsRef.current?.children || [],
                { opacity: 0, y: 30, scale: 0.9 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.6,
                    stagger: 0.15,
                    ease: 'back.out(1.7)'
                },
                '-=0.4'
            );

            // Animação flutuante contínua para o título
            gsap.to(titleRef.current, {
                y: -10,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: 'power1.inOut',
            });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative min-h-screen flex items-center justify-center overflow-hidden"
        >
            <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
                <h1
                    ref={titleRef}
                    className="text-4xl md:text-6xl mb-6 font-bold"
                    style={{ opacity: 0 }} // Esconde até a animação começar
                >
                    Grupo Inga Capoeira
                </h1>
                <p
                    ref={subtitleRef}
                    className="text-lg md:text-xl mb-8 max-w-2xl mx-auto"
                    style={{ opacity: 0 }}
                >
                    Preservando a tradição da capoeira através da arte, música e movimento.
                    Venha fazer parte da nossa roda e descobrir a energia da capoeira.
                </p>
                <div
                    ref={buttonsRef}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Button
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 transform hover:scale-105 transition-transform"
                        onClick={() => onSectionChange('about')}
                        style={{ opacity: 0 }}
                    >
                        Conheça Nossa História
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="bg-orange-600 hover:bg-orange-700 border-white text-white hover:text-black transform hover:scale-105 transition-transform"
                        onClick={() => onSectionChange('events')}
                        style={{ opacity: 0 }}
                    >
                        Ver Eventos
                    </Button>
                </div>
            </div>
        </section>
    );
}

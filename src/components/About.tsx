'use client';

import { useRef, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { gsap } from '@/lib/gsap';

interface AboutProps {
    onSectionChange: (section: string) => void;
}

export function About({ onSectionChange }: AboutProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            // Animação do header
            gsap.fromTo(
                headerRef.current,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    scrollTrigger: {
                        trigger: headerRef.current,
                        start: 'top 80%',
                    },
                }
            );

            // Animação do conteúdo principal
            gsap.fromTo(
                contentRef.current?.children || [],
                { opacity: 0, x: -50 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.7,
                    stagger: 0.2,
                    scrollTrigger: {
                        trigger: contentRef.current,
                        start: 'top 75%',
                    },
                }
            );

            // Animação dos cards com stagger e efeito de "pop"
            if (cardsRef.current) {
                const cards = cardsRef.current.children;

                gsap.fromTo(
                    cards,
                    { opacity: 0, y: 60, scale: 0.8 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.6,
                        stagger: 0.15,
                        ease: 'back.out(1.7)',
                        scrollTrigger: {
                            trigger: cardsRef.current,
                            start: 'top 80%',
                        },
                    }
                );

                // Animação dos números (contador)
                const numbers = cardsRef.current.querySelectorAll('.stat-number');
                numbers.forEach((num) => {
                    const target = parseInt(num.textContent?.replace('+', '') || '0');
                    const hasPlus = num.textContent?.includes('+');

                    gsap.fromTo(
                        { value: 0 },
                        { value: 0 },
                        {
                            value: target,
                            duration: 2,
                            ease: 'power2.out',
                            scrollTrigger: {
                                trigger: num,
                                start: 'top 85%',
                            },
                            onUpdate: function () {
                                const current = Math.round(this.targets()[0].value);
                                (num as HTMLElement).textContent = current + (hasPlus ? '+' : '');
                            },
                        }
                    );
                });
            }
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section id="about" className="py-20 bg-gray-50" ref={sectionRef}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div ref={headerRef} className="text-center mb-16" style={{ opacity: 0 }}>
                    <h2 className="text-3xl md:text-4xl mb-4 font-bold text-gray-900">
                        Quem Somos
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Desde 1999 preservando e compartilhando a tradição da capoeira pelo Brasil e pelo mundo
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div ref={contentRef} className="space-y-6">
                        <div style={{ opacity: 0 }}>
                            <h3 className="text-xl mb-3 font-semibold text-gray-900">Quem Somos</h3>
                            <p className="text-gray-600">
                                A <strong>Associação Ingá Capoeira</strong> foi fundada em <strong>22 de janeiro de 1999</strong>,
                                sob a direção do <strong>Mestre Perna</strong>, que já contava com vasta experiência no mundo
                                da capoeira. Hoje, o grupo conta com um conselho administrativo formado pelos membros mais
                                antigos: <strong>Contra-Mestre Batata</strong> e <strong>Contra-Mestre Vavá</strong>.
                            </p>
                        </div>

                        <div style={{ opacity: 0 }}>
                            <h3 className="text-xl mb-3 font-semibold text-gray-900">Nossa Filosofia</h3>
                            <p className="text-gray-600">
                                Desde sua fundação, o grupo segue a filosofia de <strong>fazer amizades através da capoeira</strong>,
                                buscando constantemente a <strong>evolução técnica, pedagógica, cultural e esportiva</strong>.
                                Mais que uma arte marcial, a capoeira é uma ferramenta de transformação social e preservação
                                das raízes culturais brasileiras.
                            </p>
                        </div>

                        <Button
                            onClick={() => onSectionChange('history')}
                            className="bg-blue-600 hover:bg-blue-700 transform hover:scale-105 transition-transform"
                            style={{ opacity: 0 }}
                        >
                            Leia Nossa História Completa
                        </Button>
                    </div>
                </div>

                <div ref={cardsRef} className="mt-16 grid md:grid-cols-3 gap-8">
                    <Card className="hover:shadow-xl transition-shadow duration-300 cursor-default" style={{ opacity: 0 }}>
                        <CardContent className="p-6 text-center">
                            <div className="stat-number text-4xl font-bold mb-2 text-blue-600">25+</div>
                            <p className="text-gray-600">Anos de tradição</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-xl transition-shadow duration-300 cursor-default" style={{ opacity: 0 }}>
                        <CardContent className="p-6 text-center">
                            <div className="stat-number text-4xl font-bold mb-2 text-blue-600">5</div>
                            <p className="text-gray-600">Países alcançados</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-xl transition-shadow duration-300 cursor-default" style={{ opacity: 0 }}>
                        <CardContent className="p-6 text-center">
                            <div className="stat-number text-4xl font-bold mb-2 text-blue-600">2</div>
                            <p className="text-gray-600">CDs lançados</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}

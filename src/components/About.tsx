
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

interface AboutProps {
    onSectionChange: (section: string) => void;
}

export function About({ onSectionChange }: AboutProps) {
    return (
        <section id="about" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl mb-4">Sobre o Grupo</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Conheça um pouco da nossa trajetória e nosso compromisso com a tradição
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl mb-3">Quem Somos</h3>
                            <p className="text-gray-600">
                                notas sobre o Inga Capoeira.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl mb-3">Nossa Missão</h3>
                            <p className="text-gray-600">
                                Formamos capoeiristas completos através dos três pilares fundamentais:
                                luta, dança e música. Mais que uma arte marcial, a capoeira é uma
                                ferramenta de transformação social e preservação cultural.
                            </p>
                        </div>

                        <Button
                            onClick={() => onSectionChange('history')}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Leia Nossa História Completa
                        </Button>
                    </div>
                </div>

                <div className="mt-16 grid md:grid-cols-3 gap-8">
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-3xl mb-2 text-blue-600">29+</div>
                            <p className="text-gray-600">Anos de tradição</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-3xl mb-2 text-blue-600">200+</div>
                            <p className="text-gray-600">Membros ativos</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-3xl mb-2 text-blue-600">5</div>
                            <p className="text-gray-600">Cidades</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
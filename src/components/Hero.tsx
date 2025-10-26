
import { Button } from './ui/button';

interface HeroProps {
    onSectionChange: (section: string) => void;
}

export function Hero({ onSectionChange }: HeroProps) {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

            <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
                <h1 className="text-4xl md:text-6xl mb-6">
                    Grupo Capoeira Axé
                </h1>
                <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
                    Preservando a tradição da capoeira através da arte, música e movimento.
                    Venha fazer parte da nossa roda e descobrir a energia da capoeira.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => onSectionChange('about')}
                    >
                        Conheça Nossa História
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="bg-orange-600 hover:bg-orange-700 border-white text-white hover:text-black"
                        onClick={() => onSectionChange('events')}
                    >
                        Ver Eventos
                    </Button>
                </div>
            </div>
        </section>
    );
}
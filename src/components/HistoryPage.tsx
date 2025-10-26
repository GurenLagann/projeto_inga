import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Users, Award, Globe } from 'lucide-react';

interface HistoryPageProps {
    onSectionChange: (section: string) => void;
}

export function HistoryPage({ onSectionChange }: HistoryPageProps) {
    const timeline = [
        {
            year: "1995",
            title: "Fundação do Grupo",
            description: "Mestre João Silva funda o Grupo Capoeira Axé em São Paulo, começando com apenas 8 alunos em um pequeno espaço alugado no centro da cidade."
        },
        {
            year: "1998",
            title: "Primeira Academia Própria",
            description: "Abertura da primeira academia própria na Rua Augusta. O grupo já contava com 40 membros e realizava rodas mensais."
        },
        {
            year: "2001",
            title: "Primeiro Batizado",
            description: "Realização do primeiro batizado oficial do grupo, com a presença de mestres convidados da Bahia e graduação de 25 novos capoeiristas."
        },
        {
            year: "2005",
            title: "Expansão para Santos",
            description: "Abertura da segunda academia em Santos, marcando o início da expansão do grupo para outras cidades."
        },
        {
            year: "2008",
            title: "Intercâmbio Cultural",
            description: "Primeiro intercâmbio com grupos da Bahia, fortalecendo as raízes tradicionais e estabelecendo parcerias duradouras."
        },
        {
            year: "2012",
            title: "Projeto Social",
            description: "Lançamento do projeto social 'Capoeira Transformando Vidas', oferecendo aulas gratuitas para crianças em situação de vulnerabilidade."
        },
        {
            year: "2018",
            title: "Reconhecimento Nacional",
            description: "O grupo recebe reconhecimento da Confederação Brasileira de Capoeira pelo trabalho de preservação cultural."
        },
        {
            year: "2024",
            title: "Era Digital",
            description: "Lançamento da plataforma digital para membros, democratizando o acesso aos ensinamentos e conectando capoeiristas de diferentes regiões."
        }
    ];

    const achievements = [
        {
            icon: <Award className="w-8 h-8 text-blue-600" />,
            title: "Graduações Realizadas",
            number: "500+",
            description: "Capoeiristas graduados ao longo de nossa história"
        },
        {
            icon: <Users className="w-8 h-8 text-blue-600" />,
            title: "Vidas Transformadas",
            number: "1000+",
            description: "Pessoas impactadas por nossos projetos sociais"
        },
        {
            icon: <Globe className="w-8 h-8 text-blue-600" />,
            title: "Parcerias Internacionais",
            number: "12",
            description: "Grupos parceiros ao redor do mundo"
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Header da página */}
            <div className="bg-blue-600 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Button
                        variant="ghost"
                        onClick={() => onSectionChange('home')}
                        className="text-white hover:bg-blue-700 mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar ao Início
                    </Button>
                    <h1 className="text-4xl md:text-6xl mb-4">Nossa História</h1>
                    <p className="text-xl max-w-3xl">
                        Uma jornada de quase três décadas preservando e compartilhando a rica tradição da capoeira
                    </p>
                </div>
            </div>

            {/* Seção introdutória */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl mb-6">As Origens do Axé</h2>
                            <div className="space-y-4 text-gray-600">
                                <p>
                                    Em 1995, em um pequeno espaço no centro de São Paulo, nascia algo especial.
                                    Mestre João Silva, vindo de Salvador com o coração cheio de tradição baiana,
                                    reuniu os primeiros oito alunos que dariam vida ao que hoje conhecemos como
                                    Grupo Capoeira Axé.
                                </p>
                                <p>
                                    O nome Axé não foi escolhido por acaso. Representa a energia vital,
                                    a força ancestral que move a capoeira e conecta todos os capoeiristas
                                    numa grande família. Desde o primeiro dia, nosso compromisso foi preservar
                                    não apenas os movimentos, mas toda a filosofia e espiritualidade que
                                    fazem da capoeira uma arte única no mundo.
                                </p>
                                <p>
                                    O que começou como um sonho de oito pessoas se transformou numa comunidade
                                    que hoje impacta centenas de vidas, mantendo viva uma das mais belas
                                    expressões da cultura afro-brasileira.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl mb-4">Linha do Tempo</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Os marcos importantes que construíram nossa história
                        </p>
                    </div>

                    <div className="space-y-8">
                        {timeline.map((item, index) => (
                            <Card key={index} className="overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="flex">
                                        <div className="bg-blue-600 text-white p-6 flex items-center justify-center min-w-[120px]">
                                            <span className="text-xl">{item.year}</span>
                                        </div>
                                        <div className="p-6 flex-1">
                                            <h3 className="text-xl mb-2">{item.title}</h3>
                                            <p className="text-gray-600">{item.description}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Filosofia e Valores */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl mb-4">Nossa Filosofia</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Os valores que guiam nossa jornada
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl mb-3">Tradição e Inovação</h3>
                                <p className="text-gray-600">
                                    Respeitamos profundamente as raízes da capoeira, mas também abraçamos
                                    novas formas de ensinar e compartilhar conhecimento, sempre mantendo
                                    a essência tradicional.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl mb-3">Inclusão e Diversidade</h3>
                                <p className="text-gray-600">
                                    Nossa roda é aberta para todos, independente de idade, gênero, raça ou
                                    condição social. A capoeira nos ensina que a diversidade fortalece a comunidade.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl mb-3">Transformação Social</h3>
                                <p className="text-gray-600">
                                    Acreditamos no poder transformador da capoeira. Através dela, formamos
                                    não apenas atletas, mas cidadãos conscientes e protagonistas de mudança social.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Conquistas */}
            <section className="py-20 bg-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl mb-4">Nossas Conquistas</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Números que refletem nosso impacto na comunidade
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {achievements.map((achievement, index) => (
                            <Card key={index} className="text-center">
                                <CardHeader>
                                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                        {achievement.icon}
                                    </div>
                                    <CardTitle className="text-3xl text-blue-600 mb-2">
                                        {achievement.number}
                                    </CardTitle>
                                    <CardTitle className="text-lg">
                                        {achievement.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600">{achievement.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Chamada para ação */}
            <section className="py-20 bg-blue-600 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl mb-6">Faça Parte Desta História</h2>
                    <p className="text-xl mb-8">
                        Nossa história continua sendo escrita todos os dias.
                        Venha construir o futuro da capoeira conosco.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            variant="secondary"
                            onClick={() => onSectionChange('events')}
                        >
                            Ver Próximos Eventos
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-white text-black hover:bg-white hover:text-blue-600"
                        >
                            Entre em Contato
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
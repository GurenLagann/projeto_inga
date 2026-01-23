import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Users, Award, Globe, Music, MapPin } from 'lucide-react';

interface HistoryPageProps {
    onSectionChange: (section: string) => void;
}

export function HistoryPage({ onSectionChange }: HistoryPageProps) {
    const timeline = [
        {
            year: "1997",
            title: "O Início de um Sonho",
            description: "Perna, atuando como instrutor de capoeira, começa a desenvolver a ideia de criar seu próprio grupo, com foco na evolução técnica e na construção de amizades através da capoeira."
        },
        {
            year: "1999",
            title: "Fundação do Grupo Ingá Capoeira",
            description: "Em 22 de janeiro de 1999, nasce oficialmente a Associação Ingá Capoeira, sob a direção do Mestre Perna. O grupo surge da necessidade de adquirir conhecimento e evoluir tecnicamente."
        },
        {
            year: "2001",
            title: "Primeiro CD - Ingá Capoeira Vol. I",
            description: "Lançamento do primeiro trabalho musical do grupo, o CD 'Ingá Capoeira Vol. I', contando com a participação de convidados especiais e marcando a identidade musical do grupo."
        },
        {
            year: "2005",
            title: "CD Ingá Capoeira Vol. II",
            description: "Lançamento do segundo CD, mais desenvolvido e maduro, consolidando o repertório musical do grupo e sua contribuição para a cultura da capoeira."
        },
        {
            year: "2005-2010",
            title: "Expansão Nacional",
            description: "O grupo realiza oficinas e workshops em diversos estados brasileiros: Rio de Janeiro, Goiás, Minas Gerais e Ceará, expandindo sua presença e metodologia de ensino."
        },
        {
            year: "2010-2015",
            title: "Intercâmbio Internacional",
            description: "A Ingá Capoeira atravessa fronteiras, realizando trabalhos em Israel, Estados Unidos, Espanha e Argentina, levando a cultura brasileira para o mundo."
        },
        {
            year: "2017",
            title: "Formação do Conselho",
            description: "Consolidação do conselho administrativo formado pelos membros mais antigos: Contra-Mestre Batata e Contra-Mestre Vavá, fortalecendo a estrutura organizacional do grupo."
        },
        {
            year: "2024",
            title: "25 Anos de História",
            description: "O grupo celebra mais de duas décadas de tradição, com centenas de alunos formados e uma presença consolidada no cenário da capoeira nacional e internacional."
        }
    ];

    const achievements = [
        {
            icon: <Award className="w-8 h-8 text-blue-600" />,
            title: "Anos de Tradição",
            number: "25+",
            description: "Desde 1999 preservando e ensinando a arte da capoeira"
        },
        {
            icon: <Globe className="w-8 h-8 text-blue-600" />,
            title: "Países Visitados",
            number: "5",
            description: "Israel, EUA, Espanha, Argentina e Brasil"
        },
        {
            icon: <Music className="w-8 h-8 text-blue-600" />,
            title: "CDs Lançados",
            number: "2",
            description: "Produções musicais que marcam a identidade do grupo"
        }
    ];

    const leaders = [
        {
            name: "Mestre Perna",
            role: "Fundador e Diretor",
            description: "Com mais de 30 anos dedicados à capoeira, fundou o grupo em 1999 e lidera sua trajetória até hoje."
        },
        {
            name: "Mestre Vavá",
            role: "Conselho Administrativo",
            description: "Membro fundador do conselho, contribui com sua experiência para o desenvolvimento do grupo."
        },
        {
            name: "C. Mestre Koala",
            role: "Conselho Administrativo",
            description: "Membro responsável pelo campeonato Bambas do Vale em Taubaté-SP e pela organização de eventos do grupo."
        },
       
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
                        Mais de 25 anos preservando e compartilhando a rica tradição da capoeira pelo Brasil e pelo mundo
                    </p>
                </div>
            </div>

            {/* Seção introdutória */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl mb-6 font-bold text-gray-900">As Origens do Ingá</h2>
                            <div className="space-y-4 text-gray-600">
                                <p>
                                    A <strong>Associação Ingá Capoeira</strong> foi fundada em <strong>22 de janeiro de 1999</strong>,
                                    sob a direção do <strong>Mestre Perna</strong>, que já contava com vasta experiência no mundo
                                    da capoeira. A ideia de criar o grupo, no entanto, surgiu dois anos antes, em 1997, quando
                                    Perna atuava como instrutor e sonhava em construir algo maior.
                                </p>
                                <p>
                                    A associação nasceu da necessidade de <strong>adquirir conhecimento e evoluir tecnicamente</strong>,
                                    sempre seguindo uma filosofia de fazer amizades através da capoeira. Desde o início, o grupo
                                    se dedicou a aperfeiçoar aspectos técnicos, pedagógicos, culturais e esportivos da arte.
                                </p>
                                <p>
                                    Hoje, a Ingá Capoeira conta com um <strong>conselho administrativo</strong> formado pelos
                                    seus membros mais antigos: <strong>Contra-Mestre Batata</strong> e <strong>Contra-Mestre Vavá</strong>,
                                    que auxiliam na orientação e desenvolvimento do grupo.
                                </p>
                            </div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-8">
                            <h3 className="text-xl font-semibold mb-4 text-gray-900">Pelo Mundo</h3>
                            <p className="text-gray-600 mb-4">
                                Ao longo de sua trajetória, o grupo expandiu fronteiras, realizando oficinas e workshops em:
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium text-blue-600 mb-2 flex items-center gap-2">
                                        <Globe className="w-4 h-4" /> Internacional
                                    </h4>
                                    <ul className="text-gray-600 text-sm space-y-1">
                                        <li>Israel</li>
                                        <li>Estados Unidos</li>
                                        <li>Espanha</li>
                                        <li>Argentina</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium text-blue-600 mb-2 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> Brasil
                                    </h4>
                                    <ul className="text-gray-600 text-sm space-y-1">
                                        <li>São Paulo</li>
                                        <li>Rio de Janeiro</li>
                                        <li>Goiás</li>
                                        <li>Minas Gerais</li>
                                        <li>Ceará</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Liderança */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl mb-4 font-bold text-gray-900">Nossa Liderança</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Os mestres que guiam o caminho do Ingá Capoeira
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {leaders.map((leader, index) => (
                            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                        <Users className="w-10 h-10 text-blue-600" />
                                    </div>
                                    <CardTitle className="text-xl">{leader.name}</CardTitle>
                                    <p className="text-blue-600 font-medium">{leader.role}</p>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600">{leader.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl mb-4 font-bold text-gray-900">Linha do Tempo</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Os marcos importantes que construíram nossa história
                        </p>
                    </div>

                    <div className="space-y-8">
                        {timeline.map((item, index) => (
                            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <CardContent className="p-0">
                                    <div className="flex flex-col sm:flex-row">
                                        <div className="bg-blue-600 text-white p-6 flex items-center justify-center sm:min-w-[140px]">
                                            <span className="text-xl font-bold">{item.year}</span>
                                        </div>
                                        <div className="p-6 flex-1">
                                            <h3 className="text-xl mb-2 font-semibold text-gray-900">{item.title}</h3>
                                            <p className="text-gray-600">{item.description}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Produções Musicais */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl mb-4 font-bold text-gray-900">Produções Musicais</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            A música é parte essencial da capoeira e do Ingá
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Music className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <div>
                                        <CardTitle>Ingá Capoeira Vol. I</CardTitle>
                                        <p className="text-blue-600">2001</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    Primeiro trabalho musical do grupo, contando com a participação de
                                    convidados especiais. Um marco na história do Ingá, estabelecendo
                                    a identidade sonora do grupo.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Music className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <div>
                                        <CardTitle>Ingá Capoeira Vol. II</CardTitle>
                                        <p className="text-blue-600">2005</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    Segundo álbum, mais desenvolvido e maduro, consolidando o repertório
                                    musical do grupo e sua contribuição para a cultura da capoeira brasileira.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Filosofia e Valores */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl mb-4 font-bold text-gray-900">Nossa Filosofia</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Os valores que guiam nossa jornada
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl mb-3 font-semibold text-gray-900">Amizade</h3>
                            <p className="text-gray-600">
                                Desde sua fundação, o grupo segue a política de fazer amizades através
                                da capoeira, construindo laços que vão além do treino.
                            </p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Award className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl mb-3 font-semibold text-gray-900">Evolução Técnica</h3>
                            <p className="text-gray-600">
                                Busca constante pelo aperfeiçoamento técnico, pedagógico, cultural
                                e esportivo, formando capoeiristas completos.
                            </p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Globe className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl mb-3 font-semibold text-gray-900">Respeito às Raízes</h3>
                            <p className="text-gray-600">
                                Profundo respeito aos mestres orientadores que contribuíram para
                                o desenvolvimento do grupo ao longo dos anos.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Conquistas */}
            <section className="py-20 bg-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl mb-4 font-bold text-gray-900">Nossas Conquistas</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Números que refletem nossa trajetória
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {achievements.map((achievement, index) => (
                            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                        {achievement.icon}
                                    </div>
                                    <CardTitle className="text-4xl text-blue-600 mb-2">
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
                    <h2 className="text-3xl md:text-4xl mb-6 font-bold">Faça Parte Desta História</h2>
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
                            className="border-white text-white hover:bg-white hover:text-blue-600"
                            onClick={() => onSectionChange('contact')}
                        >
                            Entre em Contato
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}

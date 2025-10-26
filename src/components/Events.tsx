import { Calendar, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

export function Events() {
  const events = [
    {
      id: 1,
      title: "Roda de Capoeira Aberta",
      date: "14 de Novembro, 2025",
      time: "19:00 - 21:00",
      location: "Arena Zn | Beach Sports",
      type: "Roda Aberta",
      description: "Roda tradicional aberta ao público com apresentações dos alunos e convidados especiais.",
      status: "Confirmado"
    },
    {
      id: 2,
      title: "São Paulo pela Capoeira - Raizes Ingazeira",
      date: "15 de Novembro, 2025", 
      time: "10:00 - 15:00",
      location: "CT Fire Gym",
      type: "Batizado e Troca de Cordas",
      description: "Aprenda a tocar berimbau, atabaque e pandeiro com nossos mestres.",
      status: "Confirmado"
    },

  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmado':
        return 'bg-green-100 text-green-800';
      case 'Vagas Limitadas':
        return 'bg-yellow-100 text-yellow-800';
      case 'Inscrições Abertas':
        return 'bg-blue-100 text-blue-800';
      case 'Gratuito':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <section id="events" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl mb-4">Próximos Eventos</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Participe das nossas rodas, workshops e eventos especiais
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg mb-2">{event.title}</CardTitle>
                    <Badge variant="secondary" className="mb-2">
                      {event.type}
                    </Badge>
                  </div>
                  <Badge className={getStatusColor(event.status)}>
                    {event.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600 mb-4">{event.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    {event.date}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-2" />
                    {event.time}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                </div>

                <Button className="w-full bg-blue-700 hover:bg-blue-800">
                  {event.status === 'Gratuito' ? 'Participar Grátis' : 'Mais Informações'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
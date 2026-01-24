"use client";

import { MapPin, Phone, Clock, Mail, ExternalLink } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface AcademyHorario {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classType: string | null;
}

interface Academy {
  id: number;
  name: string;
  address: string;
  city?: string;
  neighborhood?: string;
  phone: string;
  email?: string;
  description?: string;
  schedule: string;
  horarios?: AcademyHorario[];
}

interface AcademyCardProps {
  academy: Academy;
  onViewMap?: () => void;
}

const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function AcademyCard({ academy, onViewMap }: AcademyCardProps) {
  // Agrupa horários por dia da semana
  const horariosPorDia: Record<number, AcademyHorario[]> = {};
  if (academy.horarios) {
    for (const h of academy.horarios) {
      if (!horariosPorDia[h.dayOfWeek]) {
        horariosPorDia[h.dayOfWeek] = [];
      }
      horariosPorDia[h.dayOfWeek].push(h);
    }
  }

  const handleOpenMaps = () => {
    const query = encodeURIComponent(`${academy.name} ${academy.address}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleCall = () => {
    const phone = academy.phone.replace(/\D/g, '');
    window.open(`tel:${phone}`, '_self');
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col">
      {/* Header com cor */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{academy.name}</h3>
            {academy.neighborhood && academy.city && (
              <p className="text-blue-100 text-sm">
                {academy.neighborhood} - {academy.city}
              </p>
            )}
          </div>
        </div>
      </div>

      <CardContent className="p-4 flex-1 flex flex-col">
        {/* Endereço */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            {academy.address}
          </p>
        </div>

        {/* Contato */}
        <div className="flex flex-wrap gap-2 mb-4">
          {academy.phone && academy.phone !== 'Não informado' && (
            <button
              onClick={handleCall}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Phone className="w-4 h-4" />
              {academy.phone}
            </button>
          )}
          {academy.email && (
            <a
              href={`mailto:${academy.email}`}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Mail className="w-4 h-4" />
              {academy.email}
            </a>
          )}
        </div>

        {/* Horários */}
        <div className="mb-4 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Horários de Aula</span>
          </div>

          {academy.horarios && academy.horarios.length > 0 ? (
            <div className="space-y-1.5">
              {Object.entries(horariosPorDia)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([dia, horarios]) => (
                  <div key={dia} className="flex items-center gap-2">
                    <Badge variant="outline" className="w-12 justify-center text-xs">
                      {diasSemana[parseInt(dia)]}
                    </Badge>
                    <div className="flex flex-wrap gap-1">
                      {horarios.map((h, idx) => (
                        <span key={idx} className="text-sm text-gray-600">
                          {h.startTime.substring(0, 5)}-{h.endTime.substring(0, 5)}
                          {idx < horarios.length - 1 && ','}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              {academy.schedule || 'Consulte-nos para horários'}
            </p>
          )}
        </div>

        {/* Descrição */}
        {academy.description && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">
            {academy.description}
          </p>
        )}

        {/* Botão */}
        <Button
          onClick={onViewMap || handleOpenMaps}
          className="w-full bg-blue-600 hover:bg-blue-700 mt-auto"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Ver no Mapa
        </Button>
      </CardContent>
    </Card>
  );
}

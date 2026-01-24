"use client";

import { Calendar, Clock, MapPin, Users, Loader2, Check, X } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Evento } from '@/types/members';

// Cores por tipo de evento
const tipoEventoConfig: Record<string, { cor: string; corBg: string; label: string }> = {
  roda: { cor: '#22C55E', corBg: 'bg-green-500', label: 'Roda' },
  batizado: { cor: '#F59E0B', corBg: 'bg-amber-500', label: 'Batizado' },
  workshop: { cor: '#3B82F6', corBg: 'bg-blue-500', label: 'Workshop' },
  treino: { cor: '#8B5CF6', corBg: 'bg-purple-500', label: 'Treino' },
  geral: { cor: '#6B7280', corBg: 'bg-gray-500', label: 'Evento' },
};

// Status do evento
const statusConfig: Record<string, { cor: string; label: string }> = {
  confirmado: { cor: 'bg-green-100 text-green-800 border-green-200', label: 'Confirmado' },
  vagas_limitadas: { cor: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Vagas Limitadas' },
  inscricoes_abertas: { cor: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Inscrições Abertas' },
  cancelado: { cor: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelado' },
};

interface EventCardProps {
  evento: Evento;
  isInscrito?: boolean;
  isLoading?: boolean;
  onInscrever?: () => void;
  onCancelar?: () => void;
  showActions?: boolean;
}

export function EventCard({
  evento,
  isInscrito = false,
  isLoading = false,
  onInscrever,
  onCancelar,
  showActions = true,
}: EventCardProps) {
  const tipoConfig = tipoEventoConfig[evento.tipo] || tipoEventoConfig.geral;
  const statusCfg = statusConfig[evento.status] || statusConfig.confirmado;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const formatFullDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (inicio: string | null, fim: string | null) => {
    if (!inicio) return null;
    const start = inicio.substring(0, 5);
    const end = fim ? fim.substring(0, 5) : null;
    return end ? `${start} - ${end}` : start;
  };

  const isCancelado = evento.status === 'cancelado';

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col ${isCancelado ? 'opacity-60' : ''}`}>
      {/* Barra colorida no topo */}
      <div className={`h-1.5 ${tipoConfig.corBg}`} />

      <CardContent className="p-5 flex flex-col flex-1">
        {/* Header com data e badges */}
        <div className="flex items-start justify-between mb-4">
          {/* Data destacada */}
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-lg flex flex-col items-center justify-center text-white"
              style={{ backgroundColor: tipoConfig.cor }}
            >
              <span className="text-xs font-medium uppercase">
                {new Date(evento.dataInicio).toLocaleDateString('pt-BR', { month: 'short' })}
              </span>
              <span className="text-xl font-bold leading-none">
                {new Date(evento.dataInicio).getDate()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                {evento.titulo}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className="text-xs"
                  style={{ borderColor: tipoConfig.cor, color: tipoConfig.cor }}
                >
                  {tipoConfig.label}
                </Badge>
                {isInscrito && (
                  <Badge className="bg-green-100 text-green-700 border border-green-200 text-xs">
                    <Check className="w-3 h-3 mr-1" />
                    Inscrito
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <Badge variant="outline" className={`text-xs ${statusCfg.cor}`}>
            {statusCfg.label}
          </Badge>
        </div>

        {/* Descrição */}
        {evento.descricao && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {evento.descricao}
          </p>
        )}

        {/* Informações */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>{formatFullDate(evento.dataInicio)}</span>
            {evento.dataFim && evento.dataFim !== evento.dataInicio && (
              <span className="text-gray-400 mx-1">até</span>
            )}
            {evento.dataFim && evento.dataFim !== evento.dataInicio && (
              <span>{formatDate(evento.dataFim)}</span>
            )}
          </div>

          {formatTime(evento.horaInicio, evento.horaFim) && (
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2 text-gray-400" />
              {formatTime(evento.horaInicio, evento.horaFim)}
            </div>
          )}

          {(evento.local || evento.academiaNome) && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              {evento.local || evento.academiaNome}
            </div>
          )}

          {evento.maxParticipantes && (
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-2 text-gray-400" />
              <span>
                {evento.totalInscritos || 0} / {evento.maxParticipantes} inscritos
              </span>
              {evento.maxParticipantes && evento.totalInscritos &&
               evento.totalInscritos >= evento.maxParticipantes && (
                <Badge className="ml-2 bg-red-100 text-red-700 text-xs">Esgotado</Badge>
              )}
            </div>
          )}
        </div>

        {/* Espaço flexível para empurrar botão para baixo */}
        <div className="flex-1" />

        {/* Botões de ação */}
        {showActions && (
          <div className="pt-4 mt-auto">
            {isInscrito ? (
              <Button
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={onCancelar}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar Inscrição
                  </>
                )}
              </Button>
            ) : (
              <Button
                className="w-full"
                style={{ backgroundColor: tipoConfig.cor }}
                onClick={onInscrever}
                disabled={isLoading || isCancelado}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Inscrevendo...
                  </>
                ) : isCancelado ? (
                  'Evento Cancelado'
                ) : evento.valor && evento.valor > 0 ? (
                  `Inscrever-se - R$ ${evento.valor.toFixed(2)}`
                ) : (
                  'Inscrever-se'
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

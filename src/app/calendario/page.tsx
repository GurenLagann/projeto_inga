"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  Loader2
} from 'lucide-react';

interface CalendarioItem {
  id: number;
  tipo: 'evento' | 'aula';
  titulo: string;
  descricao: string | null;
  dataInicio: string;
  dataFim: string | null;
  horaInicio: string | null;
  horaFim: string | null;
  local: string | null;
  cor: string;
  status?: string;
  diaSemana?: string;
  horarioAulaId?: number;
}

const diasSemanaHeader = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const mesesNome = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function CalendarioPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [items, setItems] = useState<CalendarioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dayItems, setDayItems] = useState<CalendarioItem[]>([]);

  const ano = currentDate.getFullYear();
  const mes = currentDate.getMonth();
  const mesFormatado = `${ano}-${String(mes + 1).padStart(2, '0')}`;

  const loadCalendario = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/calendario?mes=${mesFormatado}`);
      if (res.status === 401) {
        router.push('/login?redirect=/calendario');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
      }
    } catch (err) {
      console.error('Erro ao carregar calendário:', err);
    } finally {
      setIsLoading(false);
    }
  }, [mesFormatado, router]);

  useEffect(() => {
    loadCalendario();
  }, [loadCalendario]);

  // Quando seleciona um dia, filtra os itens desse dia
  useEffect(() => {
    if (selectedDay !== null) {
      const dataFormatada = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
      const filtered = items.filter(item => item.dataInicio === dataFormatada);
      setDayItems(filtered);
    }
  }, [selectedDay, items, ano, mes]);

  const previousMonth = () => {
    setCurrentDate(new Date(ano, mes - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(ano, mes + 1, 1));
    setSelectedDay(null);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDay(today.getDate());
  };

  // Gera os dias do mês
  const firstDayOfMonth = new Date(ano, mes, 1).getDay();
  const daysInMonth = new Date(ano, mes + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === ano && today.getMonth() === mes;

  const getDayEvents = (day: number) => {
    const dataFormatada = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return items.filter(item => item.dataInicio === dataFormatada);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/members')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div className="h-8 w-px bg-gray-200" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Calendário</h1>
                <p className="text-sm text-gray-500">Eventos e aulas do grupo</p>
              </div>
            </div>
            <Button onClick={goToToday} variant="outline" size="sm">
              Hoje
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendário */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <Button variant="ghost" size="sm" onClick={previousMonth}>
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <CardTitle className="text-xl">
                    {mesesNome[mes]} {ano}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={nextMonth}>
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="py-20 text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Carregando...</p>
                  </div>
                ) : (
                  <>
                    {/* Dias da semana */}
                    <div className="grid grid-cols-7 mb-2">
                      {diasSemanaHeader.map((dia) => (
                        <div
                          key={dia}
                          className="text-center text-sm font-medium text-gray-500 py-2"
                        >
                          {dia}
                        </div>
                      ))}
                    </div>

                    {/* Grid de dias */}
                    <div className="grid grid-cols-7 gap-1">
                      {/* Dias vazios antes do primeiro dia */}
                      {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square p-1" />
                      ))}

                      {/* Dias do mês */}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dayEvents = getDayEvents(day);
                        const isToday = isCurrentMonth && today.getDate() === day;
                        const isSelected = selectedDay === day;

                        return (
                          <div
                            key={day}
                            className={`aspect-square p-1 border rounded-lg cursor-pointer transition-colors ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : isToday
                                ? 'border-blue-300 bg-blue-50'
                                : 'border-transparent hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedDay(day)}
                          >
                            <div className="h-full flex flex-col">
                              <span
                                className={`text-sm font-medium ${
                                  isToday ? 'text-blue-600' : 'text-gray-700'
                                }`}
                              >
                                {day}
                              </span>
                              <div className="flex-1 overflow-hidden">
                                {dayEvents.slice(0, 3).map((event, idx) => (
                                  <div
                                    key={idx}
                                    className="h-1.5 rounded-full mt-0.5"
                                    style={{ backgroundColor: event.cor }}
                                    title={event.titulo}
                                  />
                                ))}
                                {dayEvents.length > 3 && (
                                  <span className="text-xs text-gray-400">
                                    +{dayEvents.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Legenda */}
                    <div className="mt-6 flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#DC2626]" />
                        <span className="text-gray-600">Aulas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#22C55E]" />
                        <span className="text-gray-600">Rodas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                        <span className="text-gray-600">Batizados</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#3B82F6]" />
                        <span className="text-gray-600">Workshops</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#8B5CF6]" />
                        <span className="text-gray-600">Treinos</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detalhes do dia selecionado */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  {selectedDay !== null
                    ? `${selectedDay} de ${mesesNome[mes]}`
                    : 'Selecione um dia'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDay === null ? (
                  <p className="text-gray-500 text-center py-8">
                    Clique em um dia para ver os eventos e aulas.
                  </p>
                ) : dayItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Nenhum evento ou aula neste dia.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {dayItems.map((item) => (
                      <div
                        key={`${item.tipo}-${item.id}`}
                        className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-2 h-full min-h-[3rem] rounded-full"
                            style={{ backgroundColor: item.cor }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{item.titulo}</span>
                              <Badge
                                variant="outline"
                                className="text-xs"
                                style={{
                                  borderColor: item.cor,
                                  color: item.cor
                                }}
                              >
                                {item.tipo === 'aula' ? 'Aula' : 'Evento'}
                              </Badge>
                            </div>

                            {item.descricao && (
                              <p className="text-sm text-gray-600 mb-2">
                                {item.descricao}
                              </p>
                            )}

                            <div className="space-y-1 text-sm text-gray-500">
                              {item.horaInicio && (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  {item.horaInicio.substring(0, 5)}
                                  {item.horaFim && ` - ${item.horaFim.substring(0, 5)}`}
                                </div>
                              )}
                              {item.local && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  {item.local}
                                </div>
                              )}
                            </div>

                            {item.tipo === 'evento' && item.status && (
                              <Badge
                                className="mt-2"
                                variant={
                                  item.status === 'confirmado' ? 'default' :
                                  item.status === 'cancelado' ? 'destructive' : 'secondary'
                                }
                              >
                                {item.status === 'confirmado' ? 'Confirmado' :
                                 item.status === 'cancelado' ? 'Cancelado' :
                                 item.status === 'vagas_limitadas' ? 'Vagas Limitadas' :
                                 item.status === 'inscricoes_abertas' ? 'Inscrições Abertas' :
                                 item.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

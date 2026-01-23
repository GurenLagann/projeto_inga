"use client";

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Modal, ModalFooter } from './ui/modal';
import { Evento } from '@/types/members';

interface InscricaoModalProps {
  evento: Evento | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function InscricaoModal({ evento, isOpen, onClose, onSuccess }: InscricaoModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
  });

  useEffect(() => {
    if (isOpen) {
      checkSession();
    }
  }, [isOpen]);

  const checkSession = async () => {
    setCheckingSession(true);
    try {
      const res = await fetch('/api/session');
      const data = await res.json();
      setIsLoggedIn(data.authenticated);
    } catch {
      setIsLoggedIn(false);
    } finally {
      setCheckingSession(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evento) return;

    setIsLoading(true);
    try {
      const body: Record<string, unknown> = { eventoId: evento.id };

      if (!isLoggedIn) {
        body.nomeExterno = form.nome;
        body.emailExterno = form.email;
        body.telefoneExterno = form.telefone || null;
      }

      const res = await fetch('/api/eventos/inscricao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Erro ao realizar inscrição');
        return;
      }

      alert('Inscrição realizada com sucesso!');
      onSuccess();
      onClose();
      setForm({ nome: '', email: '', telefone: '' });
    } catch {
      alert('Erro ao realizar inscrição. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!evento) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Inscrição - ${evento.titulo}`}
      description={evento.descricao || 'Preencha seus dados para se inscrever'}
      size="md"
    >
      {checkingSession ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {isLoggedIn ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-800">
                Você está logado. Clique em confirmar para se inscrever no evento.
              </p>
            </div>
          ) : evento.permiteInscricaoPublica ? (
            <>
              <div>
                <Label htmlFor="inscricaoNome">Nome completo *</Label>
                <Input
                  id="inscricaoNome"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Seu nome"
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="inscricaoEmail">Email *</Label>
                <Input
                  id="inscricaoEmail"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="seu@email.com"
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="inscricaoTelefone">Telefone</Label>
                <Input
                  id="inscricaoTelefone"
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className="mt-2"
                />
              </div>
            </>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <p className="text-amber-800">
                Este evento requer login para inscrição.{' '}
                <a href="/members" className="text-blue-600 hover:underline">
                  Faça login ou cadastre-se
                </a>
              </p>
            </div>
          )}

          {evento.valor !== null && evento.valor > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-blue-800">
                Valor: <strong>R$ {evento.valor.toFixed(2)}</strong>
              </p>
            </div>
          )}

          <ModalFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || (!isLoggedIn && !evento.permiteInscricaoPublica)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Inscrevendo...
                </>
              ) : (
                'Confirmar Inscrição'
              )}
            </Button>
          </ModalFooter>
        </form>
      )}
    </Modal>
  );
}

export function Events() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [showInscricaoModal, setShowInscricaoModal] = useState(false);

  useEffect(() => {
    loadEventos();
  }, []);

  const loadEventos = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/eventos');
      const data = await res.json();
      if (res.ok) {
        setEventos(data.eventos);
      }
    } catch (err) {
      console.error('Erro ao carregar eventos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'bg-green-100 text-green-800';
      case 'vagas_limitadas':
        return 'bg-yellow-100 text-yellow-800';
      case 'inscricoes_abertas':
        return 'bg-blue-100 text-blue-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'Confirmado';
      case 'vagas_limitadas':
        return 'Vagas Limitadas';
      case 'inscricoes_abertas':
        return 'Inscrições Abertas';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'roda':
        return 'Roda';
      case 'batizado':
        return 'Batizado';
      case 'workshop':
        return 'Workshop';
      case 'treino':
        return 'Treino';
      case 'geral':
        return 'Evento';
      default:
        return tipo;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
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

  const openInscricaoModal = (evento: Evento) => {
    setSelectedEvento(evento);
    setShowInscricaoModal(true);
  };

  if (isLoading) {
    return (
      <section id="events" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl mb-4">Próximos Eventos</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Participe das nossas rodas, workshops e eventos especiais
            </p>
          </div>
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </section>
    );
  }

  if (eventos.length === 0) {
    return (
      <section id="events" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl mb-4">Próximos Eventos</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Participe das nossas rodas, workshops e eventos especiais
            </p>
          </div>
          <div className="text-center py-12 text-gray-500">
            <p>Nenhum evento programado no momento.</p>
            <p className="mt-2">Fique de olho para novidades em breve!</p>
          </div>
        </div>
      </section>
    );
  }

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
          {eventos.map((evento) => (
            <Card key={evento.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg mb-2">{evento.titulo}</CardTitle>
                    <Badge variant="secondary" className="mb-2">
                      {getTipoLabel(evento.tipo)}
                    </Badge>
                  </div>
                  <Badge className={getStatusColor(evento.status)}>
                    {getStatusLabel(evento.status)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                {evento.descricao && (
                  <p className="text-gray-600 mb-4">{evento.descricao}</p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(evento.dataInicio)}
                    {evento.dataFim && evento.dataFim !== evento.dataInicio && (
                      <> a {formatDate(evento.dataFim)}</>
                    )}
                  </div>
                  {formatTime(evento.horaInicio, evento.horaFim) && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-2" />
                      {formatTime(evento.horaInicio, evento.horaFim)}
                    </div>
                  )}
                  {(evento.local || evento.academiaNome) && (
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-2" />
                      {evento.local || evento.academiaNome}
                    </div>
                  )}
                </div>

                {evento.maxParticipantes && (
                  <p className="text-sm text-gray-500 mb-4">
                    {evento.totalInscritos || 0} / {evento.maxParticipantes} inscritos
                  </p>
                )}

                <Button
                  className="w-full bg-blue-700 hover:bg-blue-800"
                  onClick={() => openInscricaoModal(evento)}
                  disabled={evento.status === 'cancelado'}
                >
                  {evento.valor && evento.valor > 0
                    ? `Inscrever-se - R$ ${evento.valor.toFixed(2)}`
                    : 'Inscrever-se'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <InscricaoModal
        evento={selectedEvento}
        isOpen={showInscricaoModal}
        onClose={() => {
          setShowInscricaoModal(false);
          setSelectedEvento(null);
        }}
        onSuccess={loadEventos}
      />
    </section>
  );
}

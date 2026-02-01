"use client";

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Modal, ModalFooter } from './ui/modal';
import { MapPin, Clock, Phone, Loader2, CheckCircle, Users } from 'lucide-react';

interface Horario {
  id: number;
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
  tipoAula: string | null;
}

interface Academia {
  id: number;
  nome: string;
  endereco: string;
  bairro: string | null;
  cidade: string | null;
  telefone: string | null;
  horarios: Horario[];
}

const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export function FloatingCTA() {
  const [isOpen, setIsOpen] = useState(false);
  const [academias, setAcademias] = useState<Academia[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState<'horarios' | 'form'>('horarios');

  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    email: '',
    experienciaCapoeira: '',
    academiaInteresse: '',
    observacoes: '',
  });

  useEffect(() => {
    if (isOpen && academias.length === 0) {
      loadHorarios();
    }
  }, [isOpen, academias.length]);

  const loadHorarios = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/interessados?tipo=horarios');
      if (res.ok) {
        const data = await res.json();
        setAcademias(data.academias);
      }
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.nome.trim()) {
      alert('Por favor, informe seu nome');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/interessados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome,
          telefone: form.telefone || null,
          email: form.email || null,
          experienciaCapoeira: form.experienciaCapoeira === 'sim',
          academiaInteresse: form.academiaInteresse ? parseInt(form.academiaInteresse) : null,
          observacoes: form.observacoes || null,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao enviar. Tente novamente.');
      }
    } catch {
      alert('Erro ao enviar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setStep('horarios');
    setSubmitted(false);
    setForm({
      nome: '',
      telefone: '',
      email: '',
      experienciaCapoeira: '',
      academiaInteresse: '',
      observacoes: '',
    });
  };

  return (
    <>
      {/* Botão Flutuante */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-green-500 to-yellow-500 text-white px-6 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 font-semibold"
      >
        <Users className="w-5 h-5" />
        Venha Conhecer!
      </button>

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={submitted ? "Obrigado!" : step === 'horarios' ? "Nossos Horários de Aula" : "Quero Conhecer!"}
      >
        {submitted ? (
          // Tela de sucesso
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Interesse registrado com sucesso!
            </h3>
            <p className="text-gray-600 mb-6">
              Entraremos em contato em breve para agendar sua aula experimental.
            </p>
            <Button onClick={handleClose} className="bg-green-600 hover:bg-green-700">
              Fechar
            </Button>
          </div>
        ) : step === 'horarios' ? (
          // Tela de horários
          <>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : academias.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma academia cadastrada no momento.</p>
              </div>
            ) : (
              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                {academias.map((academia) => (
                  <div key={academia.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{academia.nome}</h4>
                        <p className="text-sm text-gray-600">
                          {academia.endereco}
                          {academia.bairro && ` - ${academia.bairro}`}
                          {academia.cidade && `, ${academia.cidade}`}
                        </p>
                        {academia.telefone && (
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3" />
                            {academia.telefone}
                          </p>
                        )}
                      </div>
                    </div>

                    {academia.horarios.length > 0 ? (
                      <div className="ml-11">
                        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Horários:
                        </p>
                        <div className="grid grid-cols-1 gap-1">
                          {academia.horarios.map((horario) => (
                            <div
                              key={horario.id}
                              className="text-sm bg-white px-3 py-1.5 rounded border flex justify-between items-center"
                            >
                              <span className="font-medium text-gray-700">
                                {diasSemana[horario.diaSemana]}
                              </span>
                              <span className="text-gray-600">
                                {horario.horaInicio.substring(0, 5)} - {horario.horaFim.substring(0, 5)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 ml-11 italic">
                        Horários em breve
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <ModalFooter>
              <Button variant="outline" onClick={handleClose}>
                Fechar
              </Button>
              <Button
                onClick={() => setStep('form')}
                className="bg-green-600 hover:bg-green-700"
              >
                Quero Conhecer!
              </Button>
            </ModalFooter>
          </>
        ) : (
          // Formulário
          <>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={form.nome}
                  onChange={(e) => setForm(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={form.telefone}
                    onChange={(e) => setForm(prev => ({ ...prev, telefone: e.target.value }))}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="experiencia">Já praticou capoeira antes?</Label>
                <select
                  id="experiencia"
                  value={form.experienciaCapoeira}
                  onChange={(e) => setForm(prev => ({ ...prev, experienciaCapoeira: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione</option>
                  <option value="nao">Não, nunca pratiquei</option>
                  <option value="sim">Sim, já pratiquei</option>
                </select>
              </div>

              {academias.length > 0 && (
                <div>
                  <Label htmlFor="academia">Qual academia tem interesse?</Label>
                  <select
                    id="academia"
                    value={form.academiaInteresse}
                    onChange={(e) => setForm(prev => ({ ...prev, academiaInteresse: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecione uma academia</option>
                    {academias.map((academia) => (
                      <option key={academia.id} value={academia.id}>
                        {academia.nome} {academia.bairro && `(${academia.bairro})`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <textarea
                  id="observacoes"
                  value={form.observacoes}
                  onChange={(e) => setForm(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Alguma dúvida ou informação adicional?"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
                />
              </div>
            </div>

            <ModalFooter>
              <Button variant="outline" onClick={() => setStep('horarios')}>
                Voltar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar'
                )}
              </Button>
            </ModalFooter>
          </>
        )}
      </Modal>
    </>
  );
}

"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Calendar,
  Clock,
  QrCode,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Loader2,
  User,
  GraduationCap,
  TrendingUp,
  BookOpen,
  UserCheck
} from 'lucide-react';
import { Modal, ModalFooter } from '@/components/ui/modal';

interface InstructorProfile {
  id: number;
  nome: string;
  apelido: string | null;
  email: string;
  graduacao: string | null;
  corda: string | null;
  corPrimaria: string | null;
  corSecundaria: string | null;
}

interface InstructorStats {
  totalAulas: number;
  totalAlunosDistintos: number;
  presencasMes: number;
  presencasSemana: number;
}

interface Aula {
  id: number;
  academiaId: number;
  academiaNome: string;
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
  tipoAula: string | null;
  descricao: string | null;
  totalAlunos: number;
}

interface Aluno {
  id: number;
  nome: string;
  apelido: string | null;
  email: string;
  graduacao: string | null;
  graduacaoCor: string | null;
  totalPresencas: number;
  ultimaPresenca: string | null;
}

interface Presenca {
  id: number;
  membroId: number;
  membroNome: string;
  membroApelido: string | null;
  dataAula: string;
  presente: boolean;
  horaCheckin: string | null;
  metodoCheckin: string;
  horarioInfo: string;
  academiaNome: string;
}

interface QRCodeData {
  qrCode: string;
  checkinUrl: string;
  info: {
    academia: string;
    horario: string;
    diaSemana: string;
    dataAula: string;
  };
}

interface InstrutorOption {
  id: number;
  nome: string;
  apelido: string | null;
  graduacao: string | null;
  corPrimaria: string | null;
  totalAulas: number;
}

const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function InstrutorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [perfil, setPerfil] = useState<InstructorProfile | null>(null);
  const [estatisticas, setEstatisticas] = useState<InstructorStats | null>(null);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [presencas, setPresencas] = useState<Presenca[]>([]);

  // Admin-specific state
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [instrutores, setInstrutores] = useState<InstrutorOption[]>([]);
  const [selectedInstrutorId, setSelectedInstrutorId] = useState<number | null>(null);

  const [selectedAula, setSelectedAula] = useState<Aula | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [qrCodeModal, setQrCodeModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<QRCodeData | null>(null);
  const [qrCodeLoading, setQrCodeLoading] = useState(false);
  const [presencaModal, setPresencaModal] = useState(false);
  const [alunosPresenca, setAlunosPresenca] = useState<{ membroId: number; presente: boolean }[]>([]);
  const [savingPresenca, setSavingPresenca] = useState(false);

  const loadData = useCallback(async (instrutorId?: number | null) => {
    setIsLoading(true);
    setError(null);

    try {
      // Primeiro verifica se é admin e carrega lista de instrutores
      const sessionRes = await fetch('/api/session');
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        const userIsAdmin = sessionData.user?.admin === 1;
        setIsAdmin(userIsAdmin);

        // Se é admin, carrega lista de instrutores
        if (userIsAdmin) {
          const instrutoresRes = await fetch('/api/instrutor/lista');
          if (instrutoresRes.ok) {
            const instrutoresData = await instrutoresRes.json();
            setInstrutores(instrutoresData.instrutores);
          }
        }
      }

      // Monta a URL com o instrutorId se especificado
      const instrutorParam = instrutorId ? `?instrutorId=${instrutorId}` : '';

      // Carrega perfil do instrutor
      const perfilRes = await fetch(`/api/instrutor/perfil${instrutorParam}`);
      if (perfilRes.status === 401) {
        router.push('/login?redirect=/instrutor');
        return;
      }
      if (perfilRes.status === 403) {
        setError('Acesso restrito a instrutores.');
        setIsLoading(false);
        return;
      }
      if (!perfilRes.ok) {
        throw new Error('Erro ao carregar perfil');
      }
      const perfilData = await perfilRes.json();
      setPerfil(perfilData.perfil);
      setEstatisticas(perfilData.estatisticas);
      setIsAdminView(perfilData.isAdminView || false);

      // Carrega aulas do instrutor
      const aulasRes = await fetch(`/api/instrutor/aulas${instrutorParam}`);
      if (aulasRes.ok) {
        const aulasData = await aulasRes.json();
        setAulas(aulasData.aulas);
      }

      // Carrega alunos do instrutor
      const alunosRes = await fetch(`/api/instrutor/alunos${instrutorParam}`);
      if (alunosRes.ok) {
        const alunosData = await alunosRes.json();
        setAlunos(alunosData.alunos);
      }

      // Carrega presenças recentes
      const dataInicio = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const presencasUrl = instrutorId
        ? `/api/instrutor/presencas?dataInicio=${dataInicio}&instrutorId=${instrutorId}`
        : `/api/instrutor/presencas?dataInicio=${dataInicio}`;
      const presencasRes = await fetch(presencasUrl);
      if (presencasRes.ok) {
        const presencasData = await presencasRes.json();
        setPresencas(presencasData.presencas);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData(selectedInstrutorId);
  }, [loadData, selectedInstrutorId]);

  const handleInstrutorChange = (instrutorId: number | null) => {
    setSelectedInstrutorId(instrutorId);
  };

  const handleGenerateQRCode = async (aula: Aula) => {
    setSelectedAula(aula);
    setQrCodeModal(true);
    setQrCodeLoading(true);

    try {
      const res = await fetch(`/api/presencas/qrcode?horarioAulaId=${aula.id}&dataAula=${selectedDate}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao gerar QR code');
      }
      const data = await res.json();
      setQrCodeData(data);
    } catch (err) {
      console.error('Erro ao gerar QR code:', err);
      setError(err instanceof Error ? err.message : 'Erro ao gerar QR code');
      setQrCodeModal(false);
    } finally {
      setQrCodeLoading(false);
    }
  };

  const handleOpenPresencaModal = async (aula: Aula) => {
    setSelectedAula(aula);

    // Busca alunos que frequentam essa aula
    const res = await fetch(`/api/instrutor/alunos?horarioAulaId=${aula.id}`);
    if (res.ok) {
      const data = await res.json();
      setAlunosPresenca(data.alunos.map((a: Aluno) => ({ membroId: a.id, presente: false })));
    }

    setPresencaModal(true);
  };

  const handleTogglePresenca = (membroId: number) => {
    setAlunosPresenca(prev =>
      prev.map(a => a.membroId === membroId ? { ...a, presente: !a.presente } : a)
    );
  };

  const handleSavePresencas = async () => {
    if (!selectedAula) return;

    setSavingPresenca(true);
    try {
      const res = await fetch('/api/instrutor/presencas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          horarioAulaId: selectedAula.id,
          dataAula: selectedDate,
          presencas: alunosPresenca,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao salvar presenças');
      }

      setPresencaModal(false);
      loadData(selectedInstrutorId);
    } catch (err) {
      console.error('Erro ao salvar presenças:', err);
      alert(err instanceof Error ? err.message : 'Erro ao salvar presenças');
    } finally {
      setSavingPresenca(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error && !perfil) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="py-12 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/members')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <h1 className="text-xl font-bold text-gray-900">Painel do Instrutor</h1>
                <p className="text-sm text-gray-500">
                  {perfil?.nome} {perfil?.apelido && `(${perfil.apelido})`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Admin Instructor Selector */}
              {isAdmin && instrutores.length > 0 && (
                <div className="flex items-center gap-2">
                  <label htmlFor="instrutor-select" className="text-sm text-gray-600">
                    Visualizar:
                  </label>
                  <select
                    id="instrutor-select"
                    value={selectedInstrutorId || ''}
                    onChange={(e) => handleInstrutorChange(e.target.value ? parseInt(e.target.value) : null)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[200px]"
                  >
                    <option value="">Visão Geral (Todos)</option>
                    {instrutores.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.apelido || inst.nome} {inst.graduacao && `- ${inst.graduacao}`} ({inst.totalAulas} aulas)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isAdminView ? (
                <Badge className="bg-purple-600">
                  Visão Admin
                </Badge>
              ) : perfil?.graduacao && (
                <Badge
                  style={{
                    backgroundColor: perfil.corPrimaria || '#6B7280',
                    color: perfil.corPrimaria === '#FFFFFF' || perfil.corPrimaria === '#F5F5DC' ? '#000' : '#fff'
                  }}
                >
                  {perfil.graduacao}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {estatisticas && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{estatisticas.totalAulas}</p>
                    <p className="text-sm text-gray-500">Aulas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{estatisticas.totalAlunosDistintos}</p>
                    <p className="text-sm text-gray-500">Alunos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{estatisticas.presencasMes}</p>
                    <p className="text-sm text-gray-500">Presenças/Mês</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{estatisticas.presencasSemana}</p>
                    <p className="text-sm text-gray-500">Presenças/Semana</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Date Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data da Aula
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="aulas" className="w-full">
          <TabsList className="grid w-full max-w-lg grid-cols-3 mb-6">
            <TabsTrigger value="aulas" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Minhas Aulas
            </TabsTrigger>
            <TabsTrigger value="alunos" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Meus Alunos
            </TabsTrigger>
            <TabsTrigger value="presencas" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Presenças
            </TabsTrigger>
          </TabsList>

          {/* Aulas Tab */}
          <TabsContent value="aulas">
            {aulas.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  Você ainda não tem aulas cadastradas.
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aulas.map((aula) => (
                  <Card key={aula.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{aula.academiaNome}</CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            {diasSemana[aula.diaSemana]}
                          </Badge>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          {aula.totalAlunos} alunos
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          {aula.horaInicio.substring(0, 5)} - {aula.horaFim.substring(0, 5)}
                        </div>
                        {aula.tipoAula && (
                          <div className="flex items-center text-sm text-gray-600">
                            <GraduationCap className="w-4 h-4 mr-2" />
                            {aula.tipoAula}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleOpenPresencaModal(aula)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Chamada
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleGenerateQRCode(aula)}
                        >
                          <QrCode className="w-4 h-4 mr-1" />
                          QR Code
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Alunos Tab */}
          <TabsContent value="alunos">
            {alunos.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  Nenhum aluno encontrado.
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {alunos.map((aluno) => (
                  <Card key={aluno.id}>
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: aluno.graduacaoCor || '#6B7280' }}
                        >
                          {aluno.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{aluno.nome}</p>
                          {aluno.apelido && (
                            <p className="text-sm text-gray-500">({aluno.apelido})</p>
                          )}
                          {aluno.graduacao && (
                            <Badge
                              variant="outline"
                              className="mt-1"
                              style={{ borderColor: aluno.graduacaoCor || '#6B7280' }}
                            >
                              {aluno.graduacao}
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">{aluno.totalPresencas}</p>
                          <p className="text-xs text-gray-500">presenças</p>
                        </div>
                      </div>
                      {aluno.ultimaPresenca && (
                        <p className="text-xs text-gray-400 mt-2">
                          Última presença: {new Date(aluno.ultimaPresenca).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Presenças Tab */}
          <TabsContent value="presencas">
            {presencas.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  Nenhuma presença registrada nos últimos 30 dias.
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Presenças Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y">
                    {presencas.slice(0, 20).map((presenca) => (
                      <div key={presenca.id} className="py-3 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          {presenca.presente ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium">
                              {presenca.membroNome}
                              {presenca.membroApelido && ` (${presenca.membroApelido})`}
                            </p>
                            <p className="text-sm text-gray-500">
                              {presenca.academiaNome} - {presenca.horarioInfo}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {new Date(presenca.dataAula).toLocaleDateString('pt-BR')}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {presenca.metodoCheckin === 'qrcode' ? 'QR Code' : 'Manual'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* QR Code Modal */}
      <Modal
        isOpen={qrCodeModal}
        onClose={() => setQrCodeModal(false)}
        title={`QR Code - ${selectedAula?.academiaNome}`}
      >
        <div className="text-center py-4">
          {qrCodeLoading ? (
            <div className="py-12">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Gerando QR Code...</p>
            </div>
          ) : qrCodeData ? (
            <>
              <Image
                src={qrCodeData.qrCode}
                alt="QR Code para check-in"
                className="mx-auto mb-4"
                width={250}
                height={250}
                unoptimized
              />
              <div className="bg-gray-50 rounded-lg p-4 text-left mb-4">
                <div className="space-y-2 text-sm">
                  <p><strong>Academia:</strong> {qrCodeData.info.academia}</p>
                  <p><strong>Horário:</strong> {qrCodeData.info.horario}</p>
                  <p><strong>Dia:</strong> {qrCodeData.info.diaSemana}</p>
                  <p><strong>Data:</strong> {new Date(qrCodeData.info.dataAula).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Este QR Code expira em 15 minutos.
              </p>
            </>
          ) : null}
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setQrCodeModal(false)}>
            Fechar
          </Button>
        </ModalFooter>
      </Modal>

      {/* Presença Modal */}
      <Modal
        isOpen={presencaModal}
        onClose={() => setPresencaModal(false)}
        title={`Chamada - ${selectedAula?.academiaNome}`}
      >
        <div className="py-4">
          <p className="text-sm text-gray-600 mb-4">
            {diasSemana[selectedAula?.diaSemana || 0]} - {selectedAula?.horaInicio?.substring(0, 5)} às {selectedAula?.horaFim?.substring(0, 5)}
            <br />
            Data: {new Date(selectedDate).toLocaleDateString('pt-BR')}
          </p>

          {alunosPresenca.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              Nenhum aluno encontrado para esta aula.
            </p>
          ) : (
            <div className="divide-y max-h-96 overflow-y-auto">
              {alunos
                .filter(a => alunosPresenca.some(ap => ap.membroId === a.id))
                .map((aluno) => {
                  const presencaItem = alunosPresenca.find(ap => ap.membroId === aluno.id);
                  return (
                    <div
                      key={aluno.id}
                      className={`py-3 px-2 flex justify-between items-center cursor-pointer hover:bg-gray-50 rounded ${
                        presencaItem?.presente ? 'bg-green-50' : ''
                      }`}
                      onClick={() => handleTogglePresenca(aluno.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            presencaItem?.presente
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {presencaItem?.presente ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <User className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{aluno.nome}</p>
                          {aluno.apelido && (
                            <p className="text-sm text-gray-500">({aluno.apelido})</p>
                          )}
                        </div>
                      </div>
                      {aluno.graduacao && (
                        <Badge
                          variant="outline"
                          style={{ borderColor: aluno.graduacaoCor || '#6B7280' }}
                        >
                          {aluno.graduacao}
                        </Badge>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setPresencaModal(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSavePresencas}
            disabled={savingPresenca}
            className="bg-green-600 hover:bg-green-700"
          >
            {savingPresenca ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Salvar Chamada
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Play, User, Video, Map, Shield, CalendarDays, Calendar, GraduationCap, Plus, Music, BookOpen, Footprints, Loader2, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Academy, User as UserType, Membro, Evento, VideosPorCategoria } from '@/types/members';
import { LoginForm } from './LoginForm';
import { StudentProfile } from './StudentProfile';
import { EventCard } from './EventCard';
import { AcademyCard } from './AcademyCard';
import { Modal, ModalFooter } from './ui/modal';

type VideoCategoriaTab = 'movimentacoes' | 'musicalidade' | 'historia';

export function MembersArea() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [minhasInscricoes, setMinhasInscricoes] = useState<Set<number>>(new Set());
  const [user, setUser] = useState<UserType | null>(null);
  const [membro, setMembro] = useState<Membro | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inscricaoLoading, setInscricaoLoading] = useState<number | null>(null);

  // Video states
  const [videos, setVideos] = useState<VideosPorCategoria>({ movimentacoes: [], musicalidade: [], historia: [] });
  const [activeVideoTab, setActiveVideoTab] = useState<VideoCategoriaTab>('movimentacoes');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoFormLoading, setVideoFormLoading] = useState(false);
  const [videoForm, setVideoForm] = useState({
    titulo: '',
    descricao: '',
    categoria: 'movimentacoes' as VideoCategoriaTab,
    urlVideo: '',
    thumbnailUrl: '',
    duracao: '',
    nivel: '',
    instrutorNome: '',
  });

  // Verificar sessão ao carregar
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/session');
      const data = await response.json();

      if (data.authenticated && data.user) {
        setUser(data.user);
        setMembro(data.membro || null);
        setIsAdmin(data.user.admin === 1);
        setIsInstructor(data.isInstructor || false);
        setIsLoggedIn(true);
      }
    } catch (err) {
      console.error('Erro ao verificar sessão:', err);
    } finally {
      setIsCheckingSession(false);
    }
  };

  const loadMembersData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Buscar vídeos do banco de dados
      try {
        const videosRes = await fetch('/api/videos');
        if (videosRes.ok) {
          const videosData = await videosRes.json();
          setVideos(videosData.videosPorCategoria);
        }
      } catch (err) {
        console.error('Erro ao buscar vídeos:', err);
      }

      // Buscar academias do banco de dados
      try {
        const academiasRes = await fetch('/api/academias');
        if (academiasRes.ok) {
          const academiasData = await academiasRes.json();
          setAcademies(academiasData.academias);
        }
      } catch (err) {
        console.error('Erro ao buscar academias:', err);
      }

      // Buscar dados atualizados do aluno
      try {
        const response = await fetch('/api/student');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setMembro(data.membro || null);
        }
      } catch (err) {
        console.error('Erro ao buscar dados do aluno:', err);
      }

      // Buscar eventos
      try {
        const eventosRes = await fetch('/api/eventos');
        if (eventosRes.ok) {
          const eventosData = await eventosRes.json();
          setEventos(eventosData.eventos);

          // Verificar inscrições do usuário
          const inscricoesSet = new Set<number>();
          for (const evento of eventosData.eventos) {
            const inscricaoRes = await fetch(`/api/eventos/inscricao?eventoId=${evento.id}`);
            if (inscricaoRes.ok) {
              const inscricaoData = await inscricaoRes.json();
              if (inscricaoData.inscrito && inscricaoData.inscricao?.status !== 'cancelada') {
                inscricoesSet.add(evento.id);
              }
            }
          }
          setMinhasInscricoes(inscricoesSet);
        }
      } catch (err) {
        console.error('Erro ao buscar eventos:', err);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carregar dados quando o usuário fizer login
  useEffect(() => {
    if (isLoggedIn) {
      loadMembersData();
    }
  }, [isLoggedIn, loadMembersData]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    checkSession(); // Recarregar dados da sessão
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    }

    setIsLoggedIn(false);
    setIsAdmin(false);
    setVideos({ movimentacoes: [], musicalidade: [], historia: [] });
    setAcademies([]);
    setEventos([]);
    setMinhasInscricoes(new Set());
    setUser(null);
    setMembro(null);
  };

  const handleAddVideo = async () => {
    if (!videoForm.titulo || !videoForm.urlVideo) {
      alert('Preencha o título e URL do vídeo');
      return;
    }

    setVideoFormLoading(true);
    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoForm),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Erro ao adicionar vídeo');
        return;
      }

      // Recarregar vídeos
      const videosRes = await fetch('/api/videos');
      if (videosRes.ok) {
        const videosData = await videosRes.json();
        setVideos(videosData.videosPorCategoria);
      }

      // Limpar form e fechar modal
      setVideoForm({
        titulo: '',
        descricao: '',
        categoria: 'movimentacoes',
        urlVideo: '',
        thumbnailUrl: '',
        duracao: '',
        nivel: '',
        instrutorNome: '',
      });
      setShowVideoModal(false);
    } catch {
      alert('Erro ao adicionar vídeo');
    } finally {
      setVideoFormLoading(false);
    }
  };

  const getVideoThumbnail = (url: string): string => {
    // Tenta extrair thumbnail do YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
    if (youtubeMatch) {
      return `https://img.youtube.com/vi/${youtubeMatch[1]}/hqdefault.jpg`;
    }
    return '/images/video-placeholder.jpg';
  };

  const handleInscreverEvento = async (eventoId: number) => {
    setInscricaoLoading(eventoId);
    try {
      const res = await fetch('/api/eventos/inscricao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventoId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Erro ao realizar inscrição');
        return;
      }

      setMinhasInscricoes(prev => new Set([...prev, eventoId]));
      // Recarregar eventos para atualizar contador
      const eventosRes = await fetch('/api/eventos');
      if (eventosRes.ok) {
        const eventosData = await eventosRes.json();
        setEventos(eventosData.eventos);
      }
    } catch {
      alert('Erro ao realizar inscrição. Tente novamente.');
    } finally {
      setInscricaoLoading(null);
    }
  };

  const handleCancelarInscricao = async (eventoId: number) => {
    if (!confirm('Tem certeza que deseja cancelar sua inscrição?')) {
      return;
    }

    setInscricaoLoading(eventoId);
    try {
      const res = await fetch(`/api/eventos/inscricao?eventoId=${eventoId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Erro ao cancelar inscrição');
        return;
      }

      setMinhasInscricoes(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventoId);
        return newSet;
      });
      // Recarregar eventos para atualizar contador
      const eventosRes = await fetch('/api/eventos');
      if (eventosRes.ok) {
        const eventosData = await eventosRes.json();
        setEventos(eventosData.eventos);
      }
    } catch {
      alert('Erro ao cancelar inscrição. Tente novamente.');
    } finally {
      setInscricaoLoading(null);
    }
  };

  const handleProfileUpdate = (updatedUser: UserType, updatedMembro: Membro | null) => {
    setUser(updatedUser);
    setMembro(updatedMembro);
  };

  // Mostra loading enquanto verifica sessão
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Verificando sessão...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <section className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl mb-2 font-bold text-gray-900">Área dos Membros</h2>
            <p className="text-gray-600">
              Bem-vindo de volta, {user?.name || 'visitante'}! Acesse seus conteúdos exclusivos.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
                onClick={() => router.push('/calendario')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Calendário
              </Button>
            {(isInstructor || isAdmin) && (
              <Button
                onClick={() => router.push('/instrutor')}
                className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4" />
                Painel Instrutor
              </Button>
            )}
            {isAdmin && (
              <Button
                onClick={() => router.push('/admin')}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Painel Admin
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando conteúdo...</p>
          </div>
        ) : (
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full max-w-3xl grid-cols-4 mb-8">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Meu Perfil
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Eventos
              </TabsTrigger>
              <TabsTrigger value="courses" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Vídeos de Cursos
              </TabsTrigger>
              <TabsTrigger value="academies" className="flex items-center gap-2">
                <Map className="w-4 h-4" />
                Academias
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-8">
              {user ? (
                <StudentProfile
                  user={user}
                  membro={membro}
                  onUpdate={handleProfileUpdate}
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">Carregando informações...</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="events" className="mt-8">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Próximos Eventos</h3>
                <p className="text-gray-600">Confira os eventos e inscreva-se!</p>
              </div>

              {eventos.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    Nenhum evento programado no momento. Fique de olho para novidades!
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {eventos.map((evento) => (
                    <EventCard
                      key={evento.id}
                      evento={evento}
                      isInscrito={minhasInscricoes.has(evento.id)}
                      isLoading={inscricaoLoading === evento.id}
                      onInscrever={() => handleInscreverEvento(evento.id)}
                      onCancelar={() => handleCancelarInscricao(evento.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="courses" className="mt-8">
              {/* Header com botão de adicionar para admin */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Vídeos de Aulas</h3>
                  <p className="text-gray-600">Aprenda com nossos vídeos organizados por categoria</p>
                </div>
                {isAdmin && (
                  <Button
                    onClick={() => setShowVideoModal(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Vídeo
                  </Button>
                )}
              </div>

              {/* Tabs de categorias */}
              <div className="flex gap-2 mb-6 border-b">
                <button
                  onClick={() => setActiveVideoTab('movimentacoes')}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
                    activeVideoTab === 'movimentacoes'
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  <Footprints className="w-4 h-4" />
                  Movimentações
                  <Badge variant="secondary" className="ml-1">{videos.movimentacoes.length}</Badge>
                </button>
                <button
                  onClick={() => setActiveVideoTab('musicalidade')}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
                    activeVideoTab === 'musicalidade'
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  <Music className="w-4 h-4" />
                  Musicalidade
                  <Badge variant="secondary" className="ml-1">{videos.musicalidade.length}</Badge>
                </button>
                <button
                  onClick={() => setActiveVideoTab('historia')}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
                    activeVideoTab === 'historia'
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  História/Curiosidades
                  <Badge variant="secondary" className="ml-1">{videos.historia.length}</Badge>
                </button>
              </div>

              {/* Conteúdo dos vídeos */}
              {videos[activeVideoTab].length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum vídeo cadastrado nesta categoria.</p>
                    {isAdmin && (
                      <Button
                        onClick={() => {
                          setVideoForm(prev => ({ ...prev, categoria: activeVideoTab }));
                          setShowVideoModal(true);
                        }}
                        variant="outline"
                        className="mt-4"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar primeiro vídeo
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos[activeVideoTab].map((video) => (
                    <Card key={video.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                      <div className="aspect-video w-full overflow-hidden bg-gray-200 relative">
                        <Image
                          src={video.thumbnailUrl || getVideoThumbnail(video.urlVideo)}
                          alt={video.titulo}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <a
                            href={video.urlVideo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white rounded-full p-3 shadow-lg hover:scale-110 transition-transform"
                          >
                            <Play className="w-8 h-8 text-blue-600" />
                          </a>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{video.titulo}</h3>
                        {video.instrutorNome && (
                          <p className="text-sm text-gray-600 mb-3">
                            Por {video.instrutorNome}
                          </p>
                        )}
                        {video.descricao && (
                          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{video.descricao}</p>
                        )}

                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {video.nivel && (
                              <Badge variant="secondary" className="text-xs">
                                {video.nivel}
                              </Badge>
                            )}
                            {video.duracao && (
                              <span className="text-xs text-gray-500">
                                {video.duracao}
                              </span>
                            )}
                          </div>
                          <a
                            href={video.urlVideo}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Assistir
                            </Button>
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="academies" className="mt-8">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nossas Academias</h3>
                <p className="text-gray-600">Encontre a academia mais próxima de você</p>
              </div>

              {academies.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    Nenhuma academia cadastrada no momento.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {academies.map((academy) => (
                    <AcademyCard key={academy.id} academy={academy} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Modal para adicionar vídeo */}
        {showVideoModal && (
          <Modal
            isOpen={showVideoModal}
            onClose={() => setShowVideoModal(false)}
            title="Adicionar Vídeo"
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="video-titulo">Título *</Label>
                <Input
                  id="video-titulo"
                  value={videoForm.titulo}
                  onChange={(e) => setVideoForm(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Título do vídeo"
                />
              </div>

              <div>
                <Label htmlFor="video-url">URL do Vídeo *</Label>
                <Input
                  id="video-url"
                  value={videoForm.urlVideo}
                  onChange={(e) => setVideoForm(prev => ({ ...prev, urlVideo: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="text-xs text-gray-500 mt-1">Cole o link do YouTube ou outra plataforma</p>
              </div>

              <div>
                <Label htmlFor="video-categoria">Categoria *</Label>
                <select
                  id="video-categoria"
                  value={videoForm.categoria}
                  onChange={(e) => setVideoForm(prev => ({ ...prev, categoria: e.target.value as VideoCategoriaTab }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="movimentacoes">Movimentações</option>
                  <option value="musicalidade">Musicalidade</option>
                  <option value="historia">História/Curiosidades</option>
                </select>
              </div>

              <div>
                <Label htmlFor="video-descricao">Descrição</Label>
                <textarea
                  id="video-descricao"
                  value={videoForm.descricao}
                  onChange={(e) => setVideoForm(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descrição do vídeo"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="video-instrutor">Instrutor</Label>
                  <Input
                    id="video-instrutor"
                    value={videoForm.instrutorNome}
                    onChange={(e) => setVideoForm(prev => ({ ...prev, instrutorNome: e.target.value }))}
                    placeholder="Nome do instrutor"
                  />
                </div>
                <div>
                  <Label htmlFor="video-duracao">Duração</Label>
                  <Input
                    id="video-duracao"
                    value={videoForm.duracao}
                    onChange={(e) => setVideoForm(prev => ({ ...prev, duracao: e.target.value }))}
                    placeholder="Ex: 10:30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="video-nivel">Nível</Label>
                  <select
                    id="video-nivel"
                    value={videoForm.nivel}
                    onChange={(e) => setVideoForm(prev => ({ ...prev, nivel: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecione</option>
                    <option value="Iniciante">Iniciante</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                    <option value="Todos os níveis">Todos os níveis</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="video-thumbnail">URL da Thumbnail</Label>
                  <Input
                    id="video-thumbnail"
                    value={videoForm.thumbnailUrl}
                    onChange={(e) => setVideoForm(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                    placeholder="Opcional (auto do YouTube)"
                  />
                </div>
              </div>
            </div>

            <ModalFooter>
              <Button
                variant="outline"
                onClick={() => setShowVideoModal(false)}
                disabled={videoFormLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddVideo}
                disabled={videoFormLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {videoFormLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Vídeo
                  </>
                )}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </section>
  );
}

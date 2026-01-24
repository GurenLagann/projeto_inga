"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Users,
  Shield,
  ShieldOff,
  Trash2,
  ArrowLeft,
  UserCog,
  Mail,
  Calendar,
  MapPin,
  Clock,
  Plus,
  Edit2,
  X,
  Building2,
  Phone,
  Search,
  Loader2,
  Save,
  User,
  CalendarDays,
  Award,
  GraduationCap,
  Eye,
  UserCheck,
  CheckCircle
} from 'lucide-react';
import { Modal, ModalFooter } from './ui/modal';

interface User {
  id: number;
  name: string;
  email: string;
  corda: string | null;
  cordaColor: string | null;
  group: string | null;
  academy: string | null;
  instructor: string | null;
  admin: number;
  createdAt: string;
}

interface Academia {
  id: number;
  name: string;
  address: string;
  addressNumber: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string;
  state: string | null;
  zipCode: string | null;
  phone: string | null;
  email: string | null;
  description: string | null;
  active: boolean;
  createdAt: string;
}

interface Horario {
  id: number;
  academiaId: number;
  academiaName: string;
  membroInstrutorId: number | null;
  instrutorNome: string | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classType: string | null;
  description: string | null;
  active: boolean;
  createdAt: string;
}

interface Membro {
  id: number;
  apelido: string | null;
  usuarioId: number;
  usuarioNome: string;
  usuarioEmail: string;
  displayName: string;
  graduacaoId: number | null;
  graduacaoNome: string | null;
  corPrimaria: string | null;
  corSecundaria: string | null;
  academiaId: number | null;
  academiaNome: string | null;
}

interface Evento {
  id: number;
  titulo: string;
  descricao: string | null;
  dataInicio: string;
  dataFim: string | null;
  horaInicio: string | null;
  horaFim: string | null;
  local: string | null;
  tipo: string;
  status: string;
  maxParticipantes: number | null;
  permiteInscricaoPublica: boolean;
  valor: number | null;
  academiaId: number | null;
  academiaNome: string | null;
  active: boolean;
  totalInscritos: number;
}

interface Inscricao {
  id: number;
  eventoId: number;
  membroId: number | null;
  usuarioId: number | null;
  nomeExterno: string | null;
  emailExterno: string | null;
  telefoneExterno: string | null;
  status: string;
  dataInscricao: string;
  displayName: string;
  displayEmail: string;
  displayPhone: string;
}

interface DashboardStats {
  totalAlunos: number;
  totalMestres: number;
  totalInstrutores: number;
  totalAcademias: number;
  totalEventos: number;
  totalInscricoes: number;
  presencasMes: number;
  presencasSemana: number;
}

interface Graduacao {
  id: number;
  nome: string;
  corda: string;
  corPrimaria: string;
  corSecundaria: string | null;
  ordem: number;
}

type TabType = 'usuarios' | 'academias' | 'horarios' | 'eventos';

const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
];

export function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('usuarios');
  const [users, setUsers] = useState<User[]>([]);
  const [academias, setAcademias] = useState<Academia[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [graduacoes, setGraduacoes] = useState<Graduacao[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form states
  const [showAcademiaForm, setShowAcademiaForm] = useState(false);
  const [showHorarioForm, setShowHorarioForm] = useState(false);
  const [showEventoForm, setShowEventoForm] = useState(false);
  const [showInscricoesModal, setShowInscricoesModal] = useState(false);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [editingAcademia, setEditingAcademia] = useState<Academia | null>(null);
  const [editingHorario, setEditingHorario] = useState<Horario | null>(null);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const [editingMembro, setEditingMembro] = useState<Membro | null>(null);
  const [cepLoading, setCepLoading] = useState(false);

  // Academia form
  const [academiaForm, setAcademiaForm] = useState({
    name: '',
    address: '',
    addressNumber: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    description: '',
    active: true,
  });

  // Horario form
  const [horarioForm, setHorarioForm] = useState({
    academiaId: 0,
    membroInstrutorId: null as number | null,
    dayOfWeek: 1,
    startTime: '19:00',
    endTime: '21:00',
    classType: '',
    description: '',
    active: true,
  });

  // Evento form
  const [eventoForm, setEventoForm] = useState({
    titulo: '',
    descricao: '',
    dataInicio: '',
    dataFim: '',
    horaInicio: '',
    horaFim: '',
    local: '',
    tipo: 'geral',
    status: 'confirmado',
    maxParticipantes: '',
    permiteInscricaoPublica: false,
    valor: '',
    academiaId: null as number | null,
    active: true,
  });

  // Edit member form
  const [membroForm, setMembroForm] = useState({
    apelido: '',
    graduacaoId: null as number | null,
    academiaId: null as number | null,
  });

  // Tipos de aula pré-definidos
  const CLASS_TYPES = [
    'Iniciantes',
    'Intermediário',
    'Avançado',
    'Kids (4-7 anos)',
    'Infantil (8-12 anos)',
    'Juvenil',
    'Adulto',
    'Roda',
    'Música',
    'Maculelê',
    'Puxada de Rede',
    'Samba de Roda',
  ];

  // Tipos de evento
  const EVENT_TYPES = [
    { value: 'geral', label: 'Geral' },
    { value: 'roda', label: 'Roda' },
    { value: 'batizado', label: 'Batizado' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'treino', label: 'Treino' },
  ];

  // Status de evento
  const EVENT_STATUS = [
    { value: 'confirmado', label: 'Confirmado', color: 'bg-green-100 text-green-800' },
    { value: 'inscricoes_abertas', label: 'Inscrições Abertas', color: 'bg-blue-100 text-blue-800' },
    { value: 'vagas_limitadas', label: 'Vagas Limitadas', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'cancelado', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
  ];

  const loadAcademias = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/academias');
      const data = await res.json();
      if (res.ok) {
        setAcademias(data.academias);
      }
    } catch (err) {
      console.error('Erro ao carregar academias:', err);
    }
  }, []);

  const loadHorarios = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/horarios');
      const data = await res.json();
      if (res.ok) {
        setHorarios(data.horarios);
      }
    } catch (err) {
      console.error('Erro ao carregar horários:', err);
    }
  }, []);

  const loadMembros = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/membros');
      const data = await res.json();
      if (res.ok) {
        setMembros(data.membros);
      }
    } catch (err) {
      console.error('Erro ao carregar membros:', err);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (res.ok) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  }, []);

  const loadEventos = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/eventos');
      const data = await res.json();
      if (res.ok) {
        setEventos(data.eventos);
      }
    } catch (err) {
      console.error('Erro ao carregar eventos:', err);
    }
  }, []);

  const loadGraduacoes = useCallback(async () => {
    try {
      const res = await fetch('/api/graduacoes');
      const data = await res.json();
      if (res.ok) {
        setGraduacoes(data.graduacoes);
      }
    } catch (err) {
      console.error('Erro ao carregar graduações:', err);
    }
  }, []);

  const loadInscricoes = useCallback(async (eventoId: number) => {
    try {
      const res = await fetch(`/api/admin/eventos/inscricoes?eventoId=${eventoId}`);
      const data = await res.json();
      if (res.ok) {
        setInscricoes(data.inscricoes);
      }
    } catch (err) {
      console.error('Erro ao carregar inscrições:', err);
    }
  }, []);

  const fetchAddressByCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      alert('CEP deve ter 8 dígitos');
      return;
    }

    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();

      if (data.erro) {
        alert('CEP não encontrado');
        return;
      }

      setAcademiaForm(prev => ({
        ...prev,
        address: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
        zipCode: cleanCep.replace(/(\d{5})(\d{3})/, '$1-$2'),
      }));
    } catch (err) {
      console.error('Erro ao buscar CEP:', err);
      alert('Erro ao buscar CEP. Tente novamente.');
    } finally {
      setCepLoading(false);
    }
  };

  useEffect(() => {
    const checkAdminAndLoadData = async () => {
      try {
        const sessionRes = await fetch('/api/session');
        const sessionData = await sessionRes.json();

        if (!sessionData.authenticated) {
          router.push('/members');
          return;
        }

        const usersRes = await fetch('/api/admin/users');
        const usersData = await usersRes.json();

        if (!usersRes.ok) {
          if (usersRes.status === 403) {
            setError('Acesso negado. Você não tem permissão de administrador.');
            setIsAdmin(false);
          } else {
            setError(usersData.error || 'Erro ao carregar usuários');
          }
          setIsLoading(false);
          return;
        }

        setIsAdmin(true);
        setUsers(usersData.users);
        await Promise.all([
          loadAcademias(),
          loadHorarios(),
          loadMembros(),
          loadStats(),
          loadEventos(),
          loadGraduacoes(),
        ]);
      } catch (err) {
        console.error('Erro:', err);
        setError('Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAndLoadData();
  }, [router, loadAcademias, loadHorarios, loadMembros, loadStats, loadEventos, loadGraduacoes]);

  const toggleAdmin = async (userId: number, currentAdmin: number) => {
    setActionLoading(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          admin: currentAdmin === 1 ? 0 : 1,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Erro ao atualizar usuário');
        return;
      }

      setUsers(users.map(u =>
        u.id === userId ? { ...u, admin: currentAdmin === 1 ? 0 : 1 } : u
      ));
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro ao atualizar usuário');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (userId: number, userName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${userName}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Erro ao excluir usuário');
        return;
      }

      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro ao excluir usuário');
    } finally {
      setActionLoading(null);
    }
  };

  // Academia CRUD
  const handleAcademiaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(-1);

    try {
      const method = editingAcademia ? 'PUT' : 'POST';
      const body = editingAcademia
        ? { id: editingAcademia.id, ...academiaForm }
        : academiaForm;

      const res = await fetch('/api/admin/academias', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Erro ao salvar academia');
        return;
      }

      await loadAcademias();
      resetAcademiaForm();
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro ao salvar academia');
    } finally {
      setActionLoading(null);
    }
  };

  const editAcademia = (academia: Academia) => {
    setEditingAcademia(academia);
    setAcademiaForm({
      name: academia.name,
      address: academia.address,
      addressNumber: academia.addressNumber || '',
      complement: academia.complement || '',
      neighborhood: academia.neighborhood || '',
      city: academia.city,
      state: academia.state || '',
      zipCode: academia.zipCode || '',
      phone: academia.phone || '',
      email: academia.email || '',
      description: academia.description || '',
      active: academia.active,
    });
    setShowAcademiaForm(true);
  };

  const deleteAcademia = async (id: number, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir a academia "${name}"? Os horários vinculados também serão excluídos.`)) {
      return;
    }

    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/academias?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Erro ao excluir academia');
        return;
      }

      await loadAcademias();
      await loadHorarios();
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro ao excluir academia');
    } finally {
      setActionLoading(null);
    }
  };

  const resetAcademiaForm = () => {
    setShowAcademiaForm(false);
    setEditingAcademia(null);
    setAcademiaForm({
      name: '',
      address: '',
      addressNumber: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: '',
      description: '',
      active: true,
    });
  };

  // Horario CRUD
  const handleHorarioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(-1);

    try {
      const method = editingHorario ? 'PUT' : 'POST';
      const body = editingHorario
        ? { id: editingHorario.id, ...horarioForm }
        : horarioForm;

      const res = await fetch('/api/admin/horarios', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Erro ao salvar horário');
        return;
      }

      await loadHorarios();
      resetHorarioForm();
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro ao salvar horário');
    } finally {
      setActionLoading(null);
    }
  };

  const editHorario = (horario: Horario) => {
    setEditingHorario(horario);
    setHorarioForm({
      academiaId: horario.academiaId,
      membroInstrutorId: horario.membroInstrutorId,
      dayOfWeek: horario.dayOfWeek,
      startTime: horario.startTime.substring(0, 5),
      endTime: horario.endTime.substring(0, 5),
      classType: horario.classType || '',
      description: horario.description || '',
      active: horario.active,
    });
    setShowHorarioForm(true);
  };

  const deleteHorario = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este horário?')) {
      return;
    }

    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/horarios?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Erro ao excluir horário');
        return;
      }

      await loadHorarios();
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro ao excluir horário');
    } finally {
      setActionLoading(null);
    }
  };

  const resetHorarioForm = () => {
    setShowHorarioForm(false);
    setEditingHorario(null);
    setHorarioForm({
      academiaId: academias[0]?.id || 0,
      membroInstrutorId: null,
      dayOfWeek: 1,
      startTime: '19:00',
      endTime: '21:00',
      classType: '',
      description: '',
      active: true,
    });
  };

  // Evento CRUD
  const handleEventoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(-1);

    try {
      const method = editingEvento ? 'PUT' : 'POST';
      const body = {
        ...(editingEvento && { id: editingEvento.id }),
        titulo: eventoForm.titulo,
        descricao: eventoForm.descricao || null,
        dataInicio: eventoForm.dataInicio,
        dataFim: eventoForm.dataFim || null,
        horaInicio: eventoForm.horaInicio || null,
        horaFim: eventoForm.horaFim || null,
        local: eventoForm.local || null,
        tipo: eventoForm.tipo,
        status: eventoForm.status,
        maxParticipantes: eventoForm.maxParticipantes ? parseInt(eventoForm.maxParticipantes) : null,
        permiteInscricaoPublica: eventoForm.permiteInscricaoPublica,
        valor: eventoForm.valor ? parseFloat(eventoForm.valor) : null,
        academiaId: eventoForm.academiaId,
        active: eventoForm.active,
      };

      const res = await fetch('/api/admin/eventos', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Erro ao salvar evento');
        return;
      }

      await loadEventos();
      resetEventoForm();
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro ao salvar evento');
    } finally {
      setActionLoading(null);
    }
  };

  const editEvento = (evento: Evento) => {
    setEditingEvento(evento);
    setEventoForm({
      titulo: evento.titulo,
      descricao: evento.descricao || '',
      dataInicio: evento.dataInicio?.split('T')[0] || '',
      dataFim: evento.dataFim?.split('T')[0] || '',
      horaInicio: evento.horaInicio?.substring(0, 5) || '',
      horaFim: evento.horaFim?.substring(0, 5) || '',
      local: evento.local || '',
      tipo: evento.tipo,
      status: evento.status,
      maxParticipantes: evento.maxParticipantes?.toString() || '',
      permiteInscricaoPublica: evento.permiteInscricaoPublica,
      valor: evento.valor?.toString() || '',
      academiaId: evento.academiaId,
      active: evento.active,
    });
    setShowEventoForm(true);
  };

  const deleteEvento = async (id: number, titulo: string) => {
    if (!confirm(`Tem certeza que deseja excluir o evento "${titulo}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/eventos?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Erro ao excluir evento');
        return;
      }

      await loadEventos();
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro ao excluir evento');
    } finally {
      setActionLoading(null);
    }
  };

  const resetEventoForm = () => {
    setShowEventoForm(false);
    setEditingEvento(null);
    setEventoForm({
      titulo: '',
      descricao: '',
      dataInicio: '',
      dataFim: '',
      horaInicio: '',
      horaFim: '',
      local: '',
      tipo: 'geral',
      status: 'confirmado',
      maxParticipantes: '',
      permiteInscricaoPublica: false,
      valor: '',
      academiaId: null,
      active: true,
    });
  };

  const openInscricoes = async (evento: Evento) => {
    setSelectedEvento(evento);
    await loadInscricoes(evento.id);
    setShowInscricoesModal(true);
  };

  const updateInscricaoStatus = async (inscricaoId: number, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/eventos/inscricoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: inscricaoId, status: newStatus }),
      });

      if (res.ok && selectedEvento) {
        await loadInscricoes(selectedEvento.id);
        await loadEventos();
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  const deleteInscricao = async (inscricaoId: number) => {
    if (!confirm('Tem certeza que deseja remover esta inscrição?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/eventos/inscricoes?id=${inscricaoId}`, {
        method: 'DELETE',
      });

      if (res.ok && selectedEvento) {
        await loadInscricoes(selectedEvento.id);
        await loadEventos();
      }
    } catch (err) {
      console.error('Erro ao remover inscrição:', err);
    }
  };

  // Edit Member
  const openEditMember = (membro: Membro) => {
    setEditingMembro(membro);
    setMembroForm({
      apelido: membro.apelido || '',
      graduacaoId: membro.graduacaoId,
      academiaId: membro.academiaId,
    });
    setShowEditMemberModal(true);
  };

  const handleMembroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMembro) return;

    setActionLoading(-1);
    try {
      const res = await fetch('/api/admin/membros', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingMembro.id,
          apelido: membroForm.apelido || null,
          graduacaoId: membroForm.graduacaoId,
          academiaId: membroForm.academiaId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Erro ao atualizar membro');
        return;
      }

      await loadMembros();
      setShowEditMemberModal(false);
      setEditingMembro(null);
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro ao atualizar membro');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <ShieldOff className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
            <p className="text-gray-600 mb-6">
              {error || 'Você não tem permissão para acessar esta área.'}
            </p>
            <Button onClick={() => router.push('/members')} className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Área de Membros
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <UserCog className="w-8 h-8 text-blue-600" />
              Painel Administrativo
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie usuários, academias e horários
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/members')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('usuarios')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'usuarios'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Usuários
          </button>
          <button
            onClick={() => setActiveTab('academias')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'academias'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Building2 className="w-4 h-4 inline mr-2" />
            Academias
          </button>
          <button
            onClick={() => setActiveTab('horarios')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'horarios'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Horários
          </button>
          <button
            onClick={() => setActiveTab('eventos')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'eventos'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <CalendarDays className="w-4 h-4 inline mr-2" />
            Eventos
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'usuarios' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total de Alunos</p>
                      <p className="text-3xl font-bold text-gray-900">{stats?.totalAlunos || 0}</p>
                    </div>
                    <Users className="w-10 h-10 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Mestres</p>
                      <p className="text-3xl font-bold text-gray-900">{stats?.totalMestres || 0}</p>
                    </div>
                    <Award className="w-10 h-10 text-amber-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Instrutores</p>
                      <p className="text-3xl font-bold text-gray-900">{stats?.totalInstrutores || 0}</p>
                    </div>
                    <GraduationCap className="w-10 h-10 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Administradores</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {users.filter(u => u.admin === 1).length}
                      </p>
                    </div>
                    <Shield className="w-10 h-10 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Second row of stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Academias Ativas</p>
                      <p className="text-3xl font-bold text-gray-900">{stats?.totalAcademias || 0}</p>
                    </div>
                    <Building2 className="w-10 h-10 text-indigo-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Eventos Ativos</p>
                      <p className="text-3xl font-bold text-gray-900">{stats?.totalEventos || 0}</p>
                    </div>
                    <CalendarDays className="w-10 h-10 text-pink-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Inscrições em Eventos</p>
                      <p className="text-3xl font-bold text-gray-900">{stats?.totalInscricoes || 0}</p>
                    </div>
                    <UserCheck className="w-10 h-10 text-teal-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Presenças no Mês</p>
                      <p className="text-3xl font-bold text-gray-900">{stats?.presencasMes || 0}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {stats?.presencasSemana || 0} esta semana
                      </p>
                    </div>
                    <CheckCircle className="w-10 h-10 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Lista de Usuários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Usuário</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Corda</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Grupo</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Cadastro</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {user.corda ? (
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded-full border"
                                  style={{ backgroundColor: user.cordaColor || '#ccc' }}
                                />
                                <span className="text-sm">{user.corda}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-600">
                              {user.group || '-'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(user.createdAt)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {user.admin === 1 ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                <Shield className="w-3 h-3 mr-1" />
                                Admin
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                Usuário
                              </Badge>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex justify-end gap-2">
                              {(() => {
                                const membro = membros.find(m => m.usuarioId === user.id);
                                if (membro) {
                                  return (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openEditMember(membro)}
                                      title="Editar membro"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </Button>
                                  );
                                }
                                return null;
                              })()}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleAdmin(user.id, user.admin)}
                                disabled={actionLoading === user.id}
                                title={user.admin === 1 ? 'Remover admin' : 'Tornar admin'}
                              >
                                {user.admin === 1 ? (
                                  <ShieldOff className="w-4 h-4" />
                                ) : (
                                  <Shield className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteUser(user.id, user.name)}
                                disabled={actionLoading === user.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Excluir usuário"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {users.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      Nenhum usuário cadastrado
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Academias Tab */}
        {activeTab === 'academias' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <Card className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total de Academias</p>
                      <p className="text-2xl font-bold text-gray-900">{academias.length}</p>
                    </div>
                  </div>
                </Card>
              </div>
              <Button
                onClick={() => {
                  resetAcademiaForm();
                  setShowAcademiaForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Academia
              </Button>
            </div>

            {/* Academia Form Modal */}
            {showAcademiaForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{editingAcademia ? 'Editar Academia' : 'Nova Academia'}</span>
                    <Button variant="ghost" size="sm" onClick={resetAcademiaForm}>
                      <X className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAcademiaSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nome da Academia *</Label>
                        <Input
                          id="name"
                          value={academiaForm.name}
                          onChange={(e) => setAcademiaForm({ ...academiaForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">CEP</Label>
                        <div className="flex gap-2">
                          <Input
                            id="zipCode"
                            value={academiaForm.zipCode}
                            onChange={(e) => setAcademiaForm({ ...academiaForm, zipCode: e.target.value })}
                            placeholder="00000-000"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fetchAddressByCep(academiaForm.zipCode)}
                            disabled={cepLoading || !academiaForm.zipCode}
                            title="Buscar endereço pelo CEP"
                          >
                            {cepLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Search className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Digite o CEP e clique na lupa para buscar</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="address">Rua/Logradouro *</Label>
                        <Input
                          id="address"
                          value={academiaForm.address}
                          onChange={(e) => setAcademiaForm({ ...academiaForm, address: e.target.value })}
                          placeholder="Nome da rua"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="addressNumber">Número</Label>
                        <Input
                          id="addressNumber"
                          value={academiaForm.addressNumber}
                          onChange={(e) => setAcademiaForm({ ...academiaForm, addressNumber: e.target.value })}
                          placeholder="123"
                        />
                      </div>
                      <div>
                        <Label htmlFor="complement">Complemento</Label>
                        <Input
                          id="complement"
                          value={academiaForm.complement}
                          onChange={(e) => setAcademiaForm({ ...academiaForm, complement: e.target.value })}
                          placeholder="Sala, Bloco..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="neighborhood">Bairro</Label>
                        <Input
                          id="neighborhood"
                          value={academiaForm.neighborhood}
                          onChange={(e) => setAcademiaForm({ ...academiaForm, neighborhood: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">Cidade *</Label>
                        <Input
                          id="city"
                          value={academiaForm.city}
                          onChange={(e) => setAcademiaForm({ ...academiaForm, city: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">Estado</Label>
                        <Input
                          id="state"
                          value={academiaForm.state}
                          onChange={(e) => setAcademiaForm({ ...academiaForm, state: e.target.value })}
                          placeholder="UF"
                          maxLength={2}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          value={academiaForm.phone}
                          onChange={(e) => setAcademiaForm({ ...academiaForm, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="academiaEmail">Email</Label>
                        <Input
                          id="academiaEmail"
                          type="email"
                          value={academiaForm.email}
                          onChange={(e) => setAcademiaForm({ ...academiaForm, email: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <input
                          type="checkbox"
                          id="academiaActive"
                          checked={academiaForm.active}
                          onChange={(e) => setAcademiaForm({ ...academiaForm, active: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="academiaActive">Academia Ativa</Label>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="academiaDescription">Descrição</Label>
                      <textarea
                        id="academiaDescription"
                        value={academiaForm.description}
                        onChange={(e) => setAcademiaForm({ ...academiaForm, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" disabled={actionLoading === -1} className="bg-blue-600 hover:bg-blue-700">
                        {actionLoading === -1 ? 'Salvando...' : 'Salvar'}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetAcademiaForm}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Academias List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {academias.map((academia) => (
                <Card key={academia.id} className={!academia.active ? 'opacity-60' : ''}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          {academia.name}
                          {!academia.active && (
                            <Badge variant="secondary">Inativa</Badge>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span>
                            {academia.address}
                            {academia.addressNumber && `, ${academia.addressNumber}`}
                            {academia.complement && ` - ${academia.complement}`}
                            {academia.neighborhood && ` - ${academia.neighborhood}`}
                            {` - ${academia.city}`}
                            {academia.state && `/${academia.state}`}
                          </span>
                        </p>
                        {academia.phone && (
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Phone className="w-4 h-4" />
                            {academia.phone}
                          </p>
                        )}
                        {academia.email && (
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Mail className="w-4 h-4" />
                            {academia.email}
                          </p>
                        )}
                        {academia.description && (
                          <p className="text-sm text-gray-500 mt-2">{academia.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editAcademia(academia)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteAcademia(academia.id, academia.name)}
                          disabled={actionLoading === academia.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {academias.length === 0 && !showAcademiaForm && (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  Nenhuma academia cadastrada. Clique em &quot;Nova Academia&quot; para adicionar.
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Horarios Tab */}
        {activeTab === 'horarios' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <Card className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total de Horários</p>
                      <p className="text-2xl font-bold text-gray-900">{horarios.length}</p>
                    </div>
                  </div>
                </Card>
              </div>
              <Button
                onClick={() => {
                  if (academias.length === 0) {
                    alert('Cadastre uma academia primeiro');
                    return;
                  }
                  resetHorarioForm();
                  setHorarioForm(prev => ({ ...prev, academiaId: academias[0].id }));
                  setShowHorarioForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={academias.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Horário
              </Button>
            </div>

            {/* Modal de Horário - Novo Design */}
            <Modal
              isOpen={showHorarioForm}
              onClose={resetHorarioForm}
              title={editingHorario ? 'Editar Horário' : 'Novo Horário de Aula'}
              description="Preencha as informações do horário de aula"
              size="lg"
            >
              <form onSubmit={handleHorarioSubmit} className="space-y-6">
                {/* Academia */}
                <div>
                  <Label htmlFor="horarioAcademia" className="text-sm font-medium text-gray-700">
                    Academia *
                  </Label>
                  <select
                    id="horarioAcademia"
                    value={horarioForm.academiaId}
                    onChange={(e) => setHorarioForm({ ...horarioForm, academiaId: parseInt(e.target.value) })}
                    className="mt-2 w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  >
                    {academias.map((a) => (
                      <option key={a.id} value={a.id}>{a.name} - {a.city}</option>
                    ))}
                  </select>
                </div>

                {/* Dia da Semana - Seleção Visual */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Dia da Semana *
                  </Label>
                  <div className="grid grid-cols-7 gap-2">
                    {DAYS_OF_WEEK.map((day, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setHorarioForm({ ...horarioForm, dayOfWeek: index })}
                        className={`py-3 px-2 rounded-lg text-sm font-medium transition-all ${
                          horarioForm.dayOfWeek === index
                            ? 'bg-blue-600 text-white shadow-md scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <span className="hidden sm:inline">{day.substring(0, 3)}</span>
                        <span className="sm:hidden">{day.substring(0, 1)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Horários */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime" className="text-sm font-medium text-gray-700">
                      Hora de Início *
                    </Label>
                    <div className="mt-2 relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="startTime"
                        type="time"
                        value={horarioForm.startTime}
                        onChange={(e) => setHorarioForm({ ...horarioForm, startTime: e.target.value })}
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="endTime" className="text-sm font-medium text-gray-700">
                      Hora de Término *
                    </Label>
                    <div className="mt-2 relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="endTime"
                        type="time"
                        value={horarioForm.endTime}
                        onChange={(e) => setHorarioForm({ ...horarioForm, endTime: e.target.value })}
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Tipo de Aula - Chips Selecionáveis */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Tipo de Aula
                  </Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {CLASS_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setHorarioForm({ ...horarioForm, classType: type })}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          horarioForm.classType === type
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <Input
                    value={horarioForm.classType}
                    onChange={(e) => setHorarioForm({ ...horarioForm, classType: e.target.value })}
                    placeholder="Ou digite um tipo personalizado..."
                    className="h-11"
                  />
                </div>

                {/* Instrutor */}
                <div>
                  <Label htmlFor="horarioInstrutor" className="text-sm font-medium text-gray-700">
                    Professor/Instrutor
                  </Label>
                  <div className="mt-2 relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      id="horarioInstrutor"
                      value={horarioForm.membroInstrutorId || ''}
                      onChange={(e) => setHorarioForm({ ...horarioForm, membroInstrutorId: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full h-11 pl-10 pr-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Selecione um instrutor (opcional)</option>
                      {membros.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.displayName} {m.graduacaoNome ? `(${m.graduacaoNome})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  {membros.length === 0 && (
                    <p className="mt-2 text-sm text-amber-600">
                      Nenhum membro cadastrado. Cadastre membros para selecionar instrutores.
                    </p>
                  )}
                </div>

                {/* Observações */}
                <div>
                  <Label htmlFor="horarioDescription" className="text-sm font-medium text-gray-700">
                    Observações
                  </Label>
                  <textarea
                    id="horarioDescription"
                    value={horarioForm.description}
                    onChange={(e) => setHorarioForm({ ...horarioForm, description: e.target.value })}
                    className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    rows={3}
                    placeholder="Informações adicionais sobre a aula..."
                  />
                </div>

                {/* Status */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="horarioActive"
                    checked={horarioForm.active}
                    onChange={(e) => setHorarioForm({ ...horarioForm, active: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <Label htmlFor="horarioActive" className="font-medium text-gray-900 cursor-pointer">
                      Horário Ativo
                    </Label>
                    <p className="text-sm text-gray-500">
                      Horários inativos não aparecem para os membros
                    </p>
                  </div>
                </div>

                {/* Footer com botões */}
                <ModalFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetHorarioForm}
                    className="px-6"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={actionLoading === -1}
                    className="px-6 bg-blue-600 hover:bg-blue-700"
                  >
                    {actionLoading === -1 ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {editingHorario ? 'Atualizar' : 'Criar Horário'}
                      </>
                    )}
                  </Button>
                </ModalFooter>
              </form>
            </Modal>

            {/* Horarios grouped by Academia */}
            {academias.map((academia) => {
              const academiaHorarios = horarios.filter(h => h.academiaId === academia.id);
              if (academiaHorarios.length === 0) return null;

              return (
                <Card key={academia.id} className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      {academia.name}
                      <span className="text-sm font-normal text-gray-500">
                        ({academiaHorarios.length} horário{academiaHorarios.length !== 1 ? 's' : ''})
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Dia</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Horário</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Professor</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Tipo</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-600">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {academiaHorarios
                            .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime))
                            .map((horario) => (
                            <tr key={horario.id} className={`border-b border-gray-100 hover:bg-gray-50 ${!horario.active ? 'opacity-50' : ''}`}>
                              <td className="py-4 px-4">
                                <span className="font-medium">{DAYS_OF_WEEK[horario.dayOfWeek]}</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-sm">
                                  {horario.startTime.substring(0, 5)} - {horario.endTime.substring(0, 5)}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-sm text-gray-600">
                                  {horario.instrutorNome || '-'}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-sm text-gray-600">
                                  {horario.classType || '-'}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                {horario.active ? (
                                  <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                                ) : (
                                  <Badge variant="secondary">Inativo</Badge>
                                )}
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => editHorario(horario)}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => deleteHorario(horario.id)}
                                    disabled={actionLoading === horario.id}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {horarios.length === 0 && !showHorarioForm && (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  {academias.length === 0
                    ? 'Cadastre uma academia primeiro para adicionar horários.'
                    : 'Nenhum horário cadastrado. Clique em "Novo Horário" para adicionar.'}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Eventos Tab */}
        {activeTab === 'eventos' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <Card className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total de Eventos</p>
                      <p className="text-2xl font-bold text-gray-900">{eventos.length}</p>
                    </div>
                  </div>
                </Card>
              </div>
              <Button
                onClick={() => {
                  resetEventoForm();
                  setShowEventoForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Evento
              </Button>
            </div>

            {/* Modal de Evento */}
            <Modal
              isOpen={showEventoForm}
              onClose={resetEventoForm}
              title={editingEvento ? 'Editar Evento' : 'Novo Evento'}
              description="Preencha as informações do evento"
              size="lg"
            >
              <form onSubmit={handleEventoSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="eventoTitulo" className="text-sm font-medium text-gray-700">
                    Título *
                  </Label>
                  <Input
                    id="eventoTitulo"
                    value={eventoForm.titulo}
                    onChange={(e) => setEventoForm({ ...eventoForm, titulo: e.target.value })}
                    placeholder="Nome do evento"
                    className="mt-2 h-11"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="eventoDescricao" className="text-sm font-medium text-gray-700">
                    Descrição
                  </Label>
                  <textarea
                    id="eventoDescricao"
                    value={eventoForm.descricao}
                    onChange={(e) => setEventoForm({ ...eventoForm, descricao: e.target.value })}
                    className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    rows={3}
                    placeholder="Descrição do evento..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventoDataInicio" className="text-sm font-medium text-gray-700">
                      Data de Início *
                    </Label>
                    <Input
                      id="eventoDataInicio"
                      type="date"
                      value={eventoForm.dataInicio}
                      onChange={(e) => setEventoForm({ ...eventoForm, dataInicio: e.target.value })}
                      className="mt-2 h-11"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventoDataFim" className="text-sm font-medium text-gray-700">
                      Data de Término
                    </Label>
                    <Input
                      id="eventoDataFim"
                      type="date"
                      value={eventoForm.dataFim}
                      onChange={(e) => setEventoForm({ ...eventoForm, dataFim: e.target.value })}
                      className="mt-2 h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventoHoraInicio" className="text-sm font-medium text-gray-700">
                      Hora de Início
                    </Label>
                    <Input
                      id="eventoHoraInicio"
                      type="time"
                      value={eventoForm.horaInicio}
                      onChange={(e) => setEventoForm({ ...eventoForm, horaInicio: e.target.value })}
                      className="mt-2 h-11"
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventoHoraFim" className="text-sm font-medium text-gray-700">
                      Hora de Término
                    </Label>
                    <Input
                      id="eventoHoraFim"
                      type="time"
                      value={eventoForm.horaFim}
                      onChange={(e) => setEventoForm({ ...eventoForm, horaFim: e.target.value })}
                      className="mt-2 h-11"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="eventoLocal" className="text-sm font-medium text-gray-700">
                    Local
                  </Label>
                  <Input
                    id="eventoLocal"
                    value={eventoForm.local}
                    onChange={(e) => setEventoForm({ ...eventoForm, local: e.target.value })}
                    placeholder="Endereço ou nome do local"
                    className="mt-2 h-11"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Tipo</Label>
                    <select
                      value={eventoForm.tipo}
                      onChange={(e) => setEventoForm({ ...eventoForm, tipo: e.target.value })}
                      className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {EVENT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Status</Label>
                    <select
                      value={eventoForm.status}
                      onChange={(e) => setEventoForm({ ...eventoForm, status: e.target.value })}
                      className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {EVENT_STATUS.map((status) => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventoMaxParticipantes" className="text-sm font-medium text-gray-700">
                      Máx. Participantes
                    </Label>
                    <Input
                      id="eventoMaxParticipantes"
                      type="number"
                      value={eventoForm.maxParticipantes}
                      onChange={(e) => setEventoForm({ ...eventoForm, maxParticipantes: e.target.value })}
                      placeholder="Deixe vazio para ilimitado"
                      className="mt-2 h-11"
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventoValor" className="text-sm font-medium text-gray-700">
                      Valor (R$)
                    </Label>
                    <Input
                      id="eventoValor"
                      type="number"
                      step="0.01"
                      value={eventoForm.valor}
                      onChange={(e) => setEventoForm({ ...eventoForm, valor: e.target.value })}
                      placeholder="0.00 para gratuito"
                      className="mt-2 h-11"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Academia (opcional)</Label>
                  <select
                    value={eventoForm.academiaId || ''}
                    onChange={(e) => setEventoForm({ ...eventoForm, academiaId: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Nenhuma academia vinculada</option>
                    {academias.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="eventoInscricaoPublica"
                      checked={eventoForm.permiteInscricaoPublica}
                      onChange={(e) => setEventoForm({ ...eventoForm, permiteInscricaoPublica: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="eventoInscricaoPublica" className="cursor-pointer">
                      Permitir inscrição sem login
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="eventoActive"
                      checked={eventoForm.active}
                      onChange={(e) => setEventoForm({ ...eventoForm, active: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="eventoActive" className="cursor-pointer">
                      Evento Ativo
                    </Label>
                  </div>
                </div>

                <ModalFooter>
                  <Button type="button" variant="outline" onClick={resetEventoForm} className="px-6">
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={actionLoading === -1}
                    className="px-6 bg-blue-600 hover:bg-blue-700"
                  >
                    {actionLoading === -1 ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {editingEvento ? 'Atualizar' : 'Criar Evento'}
                      </>
                    )}
                  </Button>
                </ModalFooter>
              </form>
            </Modal>

            {/* Modal de Inscrições */}
            <Modal
              isOpen={showInscricoesModal}
              onClose={() => {
                setShowInscricoesModal(false);
                setSelectedEvento(null);
                setInscricoes([]);
              }}
              title={`Inscrições - ${selectedEvento?.titulo}`}
              description={`${inscricoes.length} inscrito(s)`}
              size="lg"
            >
              <div className="space-y-4">
                {inscricoes.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Nenhuma inscrição encontrada</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Nome</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Contato</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-600">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inscricoes.map((inscricao) => (
                          <tr key={inscricao.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-medium text-gray-900">{inscricao.displayName}</p>
                                {inscricao.membroId && (
                                  <Badge variant="secondary" className="text-xs mt-1">Membro</Badge>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm text-gray-600">{inscricao.displayEmail}</p>
                              <p className="text-sm text-gray-500">{inscricao.displayPhone}</p>
                            </td>
                            <td className="py-4 px-4">
                              <select
                                value={inscricao.status}
                                onChange={(e) => updateInscricaoStatus(inscricao.id, e.target.value)}
                                className="text-sm px-2 py-1 rounded border border-gray-300"
                              >
                                <option value="pendente">Pendente</option>
                                <option value="confirmada">Confirmada</option>
                                <option value="presente">Presente</option>
                                <option value="cancelada">Cancelada</option>
                              </select>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deleteInscricao(inscricao.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </Modal>

            {/* Edit Member Modal */}
            <Modal
              isOpen={showEditMemberModal}
              onClose={() => {
                setShowEditMemberModal(false);
                setEditingMembro(null);
              }}
              title="Editar Membro"
              description={editingMembro ? `Editando: ${editingMembro.displayName}` : ''}
              size="md"
            >
              <form onSubmit={handleMembroSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="membroApelido" className="text-sm font-medium text-gray-700">
                    Apelido (Nome de Capoeira)
                  </Label>
                  <Input
                    id="membroApelido"
                    value={membroForm.apelido}
                    onChange={(e) => setMembroForm({ ...membroForm, apelido: e.target.value })}
                    placeholder="Ex: Mestre Bimba"
                    className="mt-2 h-11"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Graduação</Label>
                  <select
                    value={membroForm.graduacaoId || ''}
                    onChange={(e) => setMembroForm({ ...membroForm, graduacaoId: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sem graduação</option>
                    {graduacoes.map((g) => (
                      <option key={g.id} value={g.id}>{g.nome} - {g.corda}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Academia</Label>
                  <select
                    value={membroForm.academiaId || ''}
                    onChange={(e) => setMembroForm({ ...membroForm, academiaId: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Nenhuma academia</option>
                    {academias.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <ModalFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEditMemberModal(false);
                      setEditingMembro(null);
                    }}
                    className="px-6"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={actionLoading === -1}
                    className="px-6 bg-blue-600 hover:bg-blue-700"
                  >
                    {actionLoading === -1 ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </>
                    )}
                  </Button>
                </ModalFooter>
              </form>
            </Modal>

            {/* Lista de Eventos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  Lista de Eventos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Evento</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Data</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Local</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Tipo</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Inscritos</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventos.map((evento) => {
                        const statusInfo = EVENT_STATUS.find(s => s.value === evento.status);
                        const tipoInfo = EVENT_TYPES.find(t => t.value === evento.tipo);
                        return (
                          <tr key={evento.id} className={`border-b border-gray-100 hover:bg-gray-50 ${!evento.active ? 'opacity-50' : ''}`}>
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-medium text-gray-900">{evento.titulo}</p>
                                {evento.valor !== null && evento.valor > 0 && (
                                  <p className="text-sm text-green-600">R$ {evento.valor.toFixed(2)}</p>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm">
                                <p className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(evento.dataInicio).toLocaleDateString('pt-BR')}
                                </p>
                                {evento.horaInicio && (
                                  <p className="flex items-center gap-1 text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    {evento.horaInicio.substring(0, 5)}
                                    {evento.horaFim && ` - ${evento.horaFim.substring(0, 5)}`}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm text-gray-600">
                                {evento.local || evento.academiaNome || '-'}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant="secondary">{tipoInfo?.label || evento.tipo}</Badge>
                            </td>
                            <td className="py-4 px-4">
                              <Badge className={statusInfo?.color || ''}>{statusInfo?.label || evento.status}</Badge>
                            </td>
                            <td className="py-4 px-4">
                              <button
                                onClick={() => openInscricoes(evento)}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                              >
                                <UserCheck className="w-4 h-4" />
                                <span className="font-medium">{evento.totalInscritos}</span>
                                {evento.maxParticipantes && (
                                  <span className="text-gray-400">/ {evento.maxParticipantes}</span>
                                )}
                              </button>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openInscricoes(evento)}
                                  title="Ver inscritos"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => editEvento(evento)}
                                  title="Editar evento"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deleteEvento(evento.id, evento.titulo)}
                                  disabled={actionLoading === evento.id}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Excluir evento"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {eventos.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      Nenhum evento cadastrado. Clique em &quot;Novo Evento&quot; para adicionar.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

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
  Loader2
} from 'lucide-react';

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
  instructorId: number | null;
  instructorName: string | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classType: string | null;
  description: string | null;
  active: boolean;
  createdAt: string;
}

type TabType = 'usuarios' | 'academias' | 'horarios';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form states
  const [showAcademiaForm, setShowAcademiaForm] = useState(false);
  const [showHorarioForm, setShowHorarioForm] = useState(false);
  const [editingAcademia, setEditingAcademia] = useState<Academia | null>(null);
  const [editingHorario, setEditingHorario] = useState<Horario | null>(null);
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
    instructorId: null as number | null,
    dayOfWeek: 1,
    startTime: '19:00',
    endTime: '21:00',
    classType: '',
    description: '',
    active: true,
  });

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
        await loadAcademias();
        await loadHorarios();
      } catch (err) {
        console.error('Erro:', err);
        setError('Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAndLoadData();
  }, [router, loadAcademias, loadHorarios]);

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
      instructorId: horario.instructorId,
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
      instructorId: null,
      dayOfWeek: 1,
      startTime: '19:00',
      endTime: '21:00',
      classType: '',
      description: '',
      active: true,
    });
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
        </div>

        {/* Users Tab */}
        {activeTab === 'usuarios' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total de Usuários</p>
                      <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                    </div>
                    <Users className="w-10 h-10 text-blue-600" />
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
                    <Shield className="w-10 h-10 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Usuários Comuns</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {users.filter(u => u.admin === 0).length}
                      </p>
                    </div>
                    <Users className="w-10 h-10 text-gray-400" />
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

            {/* Horario Form Modal */}
            {showHorarioForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{editingHorario ? 'Editar Horário' : 'Novo Horário'}</span>
                    <Button variant="ghost" size="sm" onClick={resetHorarioForm}>
                      <X className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleHorarioSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="horarioAcademia">Academia *</Label>
                        <select
                          id="horarioAcademia"
                          value={horarioForm.academiaId}
                          onChange={(e) => setHorarioForm({ ...horarioForm, academiaId: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          {academias.map((a) => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="horarioInstructor">Professor</Label>
                        <select
                          id="horarioInstructor"
                          value={horarioForm.instructorId || ''}
                          onChange={(e) => setHorarioForm({ ...horarioForm, instructorId: e.target.value ? parseInt(e.target.value) : null })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Selecione um professor</option>
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="dayOfWeek">Dia da Semana *</Label>
                        <select
                          id="dayOfWeek"
                          value={horarioForm.dayOfWeek}
                          onChange={(e) => setHorarioForm({ ...horarioForm, dayOfWeek: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          {DAYS_OF_WEEK.map((day, index) => (
                            <option key={index} value={index}>{day}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="startTime">Início *</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={horarioForm.startTime}
                          onChange={(e) => setHorarioForm({ ...horarioForm, startTime: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="endTime">Término *</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={horarioForm.endTime}
                          onChange={(e) => setHorarioForm({ ...horarioForm, endTime: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="classType">Tipo de Aula</Label>
                        <Input
                          id="classType"
                          value={horarioForm.classType}
                          onChange={(e) => setHorarioForm({ ...horarioForm, classType: e.target.value })}
                          placeholder="Ex: Iniciantes, Avançados, Kids"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <input
                          type="checkbox"
                          id="horarioActive"
                          checked={horarioForm.active}
                          onChange={(e) => setHorarioForm({ ...horarioForm, active: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="horarioActive">Horário Ativo</Label>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="horarioDescription">Observações</Label>
                      <textarea
                        id="horarioDescription"
                        value={horarioForm.description}
                        onChange={(e) => setHorarioForm({ ...horarioForm, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" disabled={actionLoading === -1} className="bg-blue-600 hover:bg-blue-700">
                        {actionLoading === -1 ? 'Salvando...' : 'Salvar'}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetHorarioForm}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

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
                                  {horario.instructorName || '-'}
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
      </div>
    </div>
  );
}

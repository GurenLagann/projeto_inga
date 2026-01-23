"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Award, Calendar, Mail, MapPin, Phone, User, Pencil, X, Save } from 'lucide-react';
import { User as UserType, Membro } from '@/types/members';

interface Graduacao {
  id: number;
  nome: string;
  corda: string;
  corPrimaria: string;
  corSecundaria: string | null;
}

interface Academia {
  id: number;
  name: string;
  city: string;
  neighborhood: string | null;
}

interface StudentProfileProps {
  user: UserType;
  membro: Membro | null;
  onUpdate?: (updatedUser: UserType, updatedMembro: Membro | null) => void;
}

export function StudentProfile({ user, membro, onUpdate }: StudentProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [graduacoes, setGraduacoes] = useState<Graduacao[]>([]);
  const [academias, setAcademias] = useState<Academia[]>([]);

  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone || '',
    apelido: membro?.apelido || '',
    graduacaoId: membro?.graduacaoId?.toString() || '',
    academiaId: membro?.academiaId?.toString() || '',
  });

  // Buscar graduações e academias ao carregar
  useEffect(() => {
    async function fetchData() {
      try {
        const [gradRes, acadRes] = await Promise.all([
          fetch('/api/graduacoes'),
          fetch('/api/academias')
        ]);

        if (gradRes.ok) {
          const gradData = await gradRes.json();
          setGraduacoes(gradData.graduacoes || []);
        }

        if (acadRes.ok) {
          const acadData = await acadRes.json();
          setAcademias(acadData.academias || []);
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      }
    }
    fetchData();
  }, []);

  // Atualizar formData quando user ou membro mudar
  useEffect(() => {
    setFormData({
      name: user.name,
      phone: user.phone || '',
      apelido: membro?.apelido || '',
      graduacaoId: membro?.graduacaoId?.toString() || '',
      academiaId: membro?.academiaId?.toString() || '',
    });
  }, [user, membro]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      phone: user.phone || '',
      apelido: membro?.apelido || '',
      graduacaoId: membro?.graduacaoId?.toString() || '',
      academiaId: membro?.academiaId?.toString() || '',
    });
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/student', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: {
            name: formData.name,
            phone: formData.phone || null,
          },
          ...(membro && {
            membro: {
              apelido: formData.apelido || null,
              graduacaoId: formData.graduacaoId ? parseInt(formData.graduacaoId) : null,
              academiaId: formData.academiaId ? parseInt(formData.academiaId) : null,
            }
          }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao atualizar perfil');
        setIsSaving(false);
        return;
      }

      if (onUpdate) {
        onUpdate(data.user, data.membro);
      }

      setSuccess('Perfil atualizado com sucesso!');
      setIsEditing(false);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      setError('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Encontrar graduação selecionada para preview
  const selectedGraduacao = graduacoes.find(g => g.id === parseInt(formData.graduacaoId));

  return (
    <div className="max-w-2xl">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" />
              {isEditing ? 'Editar Perfil' : (membro?.apelido || user.name)}
            </CardTitle>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
              {success}
            </div>
          )}

          {isEditing ? (
            // Modo de edição
            <div className="space-y-6">
              {/* Dados do Usuário */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Dados Pessoais</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(11) 99999-9999"
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              {/* Dados do Membro (se for aluno) */}
              {membro && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Dados do Aluno</h3>

                  <div>
                    <Label htmlFor="apelido">Apelido na Capoeira</Label>
                    <Input
                      id="apelido"
                      name="apelido"
                      value={formData.apelido}
                      onChange={handleChange}
                      placeholder="Ex: Trovão, Pantera..."
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="graduacaoId">Graduação Atual</Label>
                    <select
                      id="graduacaoId"
                      name="graduacaoId"
                      value={formData.graduacaoId}
                      onChange={handleChange}
                      className="mt-2 w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione sua graduação</option>
                      {graduacoes.map((grad) => (
                        <option key={grad.id} value={grad.id}>
                          {grad.nome} ({grad.corda})
                        </option>
                      ))}
                    </select>
                    {selectedGraduacao && (
                      <div className="mt-3 flex items-center gap-3">
                        <span className="text-sm text-gray-600">Cor:</span>
                        <div
                          className="w-16 h-6 rounded border border-gray-300 shadow-sm flex"
                          style={{ overflow: 'hidden' }}
                        >
                          <div
                            className="flex-1"
                            style={{ backgroundColor: selectedGraduacao.corPrimaria }}
                          />
                          {selectedGraduacao.corSecundaria && (
                            <div
                              className="flex-1"
                              style={{ backgroundColor: selectedGraduacao.corSecundaria }}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="academiaId">Academia</Label>
                    <select
                      id="academiaId"
                      name="academiaId"
                      value={formData.academiaId}
                      onChange={handleChange}
                      className="mt-2 w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione sua academia</option>
                      {academias.map((academia) => (
                        <option key={academia.id} value={academia.id}>
                          {academia.name} {academia.neighborhood ? `- ${academia.neighborhood}` : ''} ({academia.city})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Botões de ação */}
              <div className="flex gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 flex items-center justify-center gap-2"
                  disabled={isSaving}
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          ) : (
            // Modo de visualização
            <>
              {/* Corda/Graduação (se for membro) */}
              {membro && (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-gray-600 mb-1 block">
                        Graduação Atual
                      </Label>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-full border-4 shadow-md flex"
                          style={{
                            backgroundColor: membro.corPrimaria || '#22c55e',
                            borderColor: membro.corPrimaria || '#22c55e',
                            overflow: 'hidden'
                          }}
                        >
                          {membro.corSecundaria && (
                            <div
                              className="w-1/2 h-full"
                              style={{ backgroundColor: membro.corSecundaria }}
                            />
                          )}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {membro.graduacaoNome || 'Não definida'}
                          </h3>
                          {membro.proximaGraduacaoNome && (
                            <p className="text-sm text-gray-600 mt-1">
                              Próxima: {membro.proximaGraduacaoNome}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <Award className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              )}

              {/* Informações do Usuário */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nome
                  </Label>
                  <p className="text-gray-900">{user.name}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <p className="text-gray-900">{user.email}</p>
                </div>

                {user.phone && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Telefone
                    </Label>
                    <p className="text-gray-900">{user.phone}</p>
                  </div>
                )}

                {membro?.academiaNome && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Academia
                    </Label>
                    <p className="text-gray-900">{membro.academiaNome}</p>
                  </div>
                )}

                {membro?.mestreNome && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Mestre
                    </Label>
                    <p className="text-gray-900">{membro.mestreNome}</p>
                  </div>
                )}

                {membro?.dataEntrada && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Data de Entrada
                    </Label>
                    <p className="text-gray-900">
                      {new Date(membro.dataEntrada).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}

                {membro?.dataBatizado && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Data de Batizado
                    </Label>
                    <p className="text-gray-900">
                      {new Date(membro.dataBatizado).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
              </div>

              {/* Aviso se não for membro */}
              {!membro && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
                  <p className="text-sm">
                    Você está cadastrado como visitante ou responsável.
                    Se você é aluno do Grupo Inga, entre em contato com a administração para vincular seu perfil.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

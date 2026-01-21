"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Award, Calendar, Mail, MapPin, School, User, Pencil, X, Save } from 'lucide-react';
import { Student } from '@/types/members';

// Cores de corda disponíveis na capoeira
const CORD_COLORS = [
  { name: 'Crua (Iniciante)', color: '#F5F5DC' },
  { name: 'Crua-Amarela', color: '#F5F5DC' },
  { name: 'Amarela', color: '#FFD700' },
  { name: 'Amarela-Laranja', color: '#FFD700' },
  { name: 'Laranja', color: '#FFA500' },
  { name: 'Laranja-Azul', color: '#FFA500' },
  { name: 'Azul', color: '#1E90FF' },
  { name: 'Azul-Verde', color: '#1E90FF' },
  { name: 'Verde', color: '#22C55E' },
  { name: 'Verde-Roxa', color: '#22C55E' },
  { name: 'Roxa', color: '#8B5CF6' },
  { name: 'Roxa-Marrom', color: '#8B5CF6' },
  { name: 'Marrom', color: '#8B4513' },
  { name: 'Vermelha', color: '#DC2626' },
  { name: 'Branca', color: '#FFFFFF' },
];

interface StudentProfileProps {
  student: Student;
  onUpdate?: (updatedStudent: Student) => void;
}

export function StudentProfile({ student, onUpdate }: StudentProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: student.name,
    corda: student.corda || '',
    cordaColor: student.cordaColor || '',
    groupName: student.group || '',
    academy: student.academy || '',
    instructor: student.instructor || '',
    joinedDate: student.joinedDate || '',
    baptizedDate: student.baptizedDate || '',
    nextGraduation: student.nextGraduation || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'corda') {
      const selectedCord = CORD_COLORS.find(c => c.name === value);
      setFormData({
        ...formData,
        corda: value,
        cordaColor: selectedCord?.color || formData.cordaColor
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      name: student.name,
      corda: student.corda || '',
      cordaColor: student.cordaColor || '',
      groupName: student.group || '',
      academy: student.academy || '',
      instructor: student.instructor || '',
      joinedDate: student.joinedDate || '',
      baptizedDate: student.baptizedDate || '',
      nextGraduation: student.nextGraduation || '',
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
          name: formData.name,
          corda: formData.corda || null,
          cordaColor: formData.cordaColor || null,
          groupName: formData.groupName || null,
          academy: formData.academy || null,
          instructor: formData.instructor || null,
          joinedDate: formData.joinedDate || null,
          baptizedDate: formData.baptizedDate || null,
          nextGraduation: formData.nextGraduation || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao atualizar perfil');
        setIsSaving(false);
        return;
      }

      // Atualizar o estado local com os novos dados
      if (onUpdate) {
        onUpdate({
          ...student,
          name: data.user.name,
          corda: data.user.corda || 'Não definida',
          cordaColor: data.user.cordaColor || '#22c55e',
          group: data.user.group || 'Não definido',
          academy: data.user.academy || 'Não definida',
          instructor: data.user.instructor || 'Não definido',
          joinedDate: data.user.joinedDate || '',
          baptizedDate: data.user.baptizedDate || undefined,
          nextGraduation: data.user.nextGraduation || undefined,
        });
      }

      setSuccess('Perfil atualizado com sucesso!');
      setIsEditing(false);

      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      setError('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" />
              {isEditing ? 'Editar Perfil' : student.name}
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
              {/* Nome */}
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

              {/* Corda */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <Label htmlFor="corda">Corda Atual</Label>
                <select
                  id="corda"
                  name="corda"
                  value={formData.corda}
                  onChange={handleChange}
                  className="mt-2 w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione sua corda</option>
                  {CORD_COLORS.map((cord) => (
                    <option key={cord.name} value={cord.name}>
                      {cord.name}
                    </option>
                  ))}
                </select>
                {formData.cordaColor && (
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-sm text-gray-600">Cor:</span>
                    <div
                      className="w-16 h-6 rounded border border-gray-300 shadow-sm"
                      style={{ backgroundColor: formData.cordaColor }}
                    />
                  </div>
                )}
              </div>

              {/* Grid de campos */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="groupName">Grupo</Label>
                  <Input
                    id="groupName"
                    name="groupName"
                    value={formData.groupName}
                    onChange={handleChange}
                    placeholder="Ex: Grupo Inga Capoeira"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="academy">Academia</Label>
                  <Input
                    id="academy"
                    name="academy"
                    value={formData.academy}
                    onChange={handleChange}
                    placeholder="Ex: Academia Central"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="instructor">Mestre/Instrutor</Label>
                  <Input
                    id="instructor"
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleChange}
                    placeholder="Ex: Mestre Bimba"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="nextGraduation">Próxima Graduação</Label>
                  <Input
                    id="nextGraduation"
                    name="nextGraduation"
                    value={formData.nextGraduation}
                    onChange={handleChange}
                    placeholder="Ex: Corda Azul"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="joinedDate">Data de Entrada</Label>
                  <Input
                    id="joinedDate"
                    name="joinedDate"
                    type="date"
                    value={formData.joinedDate}
                    onChange={handleChange}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="baptizedDate">Data de Batizado</Label>
                  <Input
                    id="baptizedDate"
                    name="baptizedDate"
                    type="date"
                    value={formData.baptizedDate}
                    onChange={handleChange}
                    className="mt-2"
                  />
                </div>
              </div>

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
              {/* Corda/Faixa */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-gray-600 mb-1 block">
                      Corda Atual
                    </Label>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full border-4 shadow-md"
                        style={{
                          backgroundColor: student.cordaColor,
                          borderColor: student.cordaColor
                        }}
                      />
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {student.corda}
                        </h3>
                        {student.nextGraduation && (
                          <p className="text-sm text-gray-600 mt-1">
                            Próxima: {student.nextGraduation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <Award className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              {/* Informações do Aluno */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <p className="text-gray-900">{student.email}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <School className="w-4 h-4" />
                    Grupo
                  </Label>
                  <p className="text-gray-900">{student.group}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Academia
                  </Label>
                  <p className="text-gray-900">{student.academy}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Instrutor
                  </Label>
                  <p className="text-gray-900">{student.instructor}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data de Entrada
                  </Label>
                  <p className="text-gray-900">{student.joinedDate || 'Não informada'}</p>
                </div>

                {student.baptizedDate && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Data de Batizado
                    </Label>
                    <p className="text-gray-900">{student.baptizedDate}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

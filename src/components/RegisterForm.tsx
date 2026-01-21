"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

// Cores de corda disponíveis na capoeira
const CORD_COLORS = [
  { name: 'Crua (Iniciante)', color: '#F5F5DC' },
  { name: 'Crua-Amarela', color: '#F5F5DC', secondary: '#FFD700' },
  { name: 'Amarela', color: '#FFD700' },
  { name: 'Amarela-Laranja', color: '#FFD700', secondary: '#FFA500' },
  { name: 'Laranja', color: '#FFA500' },
  { name: 'Laranja-Azul', color: '#FFA500', secondary: '#1E90FF' },
  { name: 'Azul', color: '#1E90FF' },
  { name: 'Azul-Verde', color: '#1E90FF', secondary: '#22C55E' },
  { name: 'Verde', color: '#22C55E' },
  { name: 'Verde-Roxa', color: '#22C55E', secondary: '#8B5CF6' },
  { name: 'Roxa', color: '#8B5CF6' },
  { name: 'Roxa-Marrom', color: '#8B5CF6', secondary: '#8B4513' },
  { name: 'Marrom', color: '#8B4513' },
  { name: 'Vermelha', color: '#DC2626' },
  { name: 'Branca', color: '#FFFFFF' },
];

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isExistingStudent, setIsExistingStudent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    groupName: '',
    instructor: '',
    corda: '',
    cordaColor: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Se mudar a corda, atualizar também a cor
    if (name === 'corda') {
      const selectedCord = CORD_COLORS.find(c => c.name === value);
      setFormData({
        ...formData,
        corda: value,
        cordaColor: selectedCord?.color || ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    setError('');
  };

  const handleStudentToggle = (isStudent: boolean) => {
    setIsExistingStudent(isStudent);
    if (!isStudent) {
      // Limpar campos de aluno se não for aluno existente
      setFormData({
        ...formData,
        groupName: '',
        instructor: '',
        corda: '',
        cordaColor: ''
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validações
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres');
      setLoading(false);
      return;
    }

    // Validar complexidade da senha
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
    if (!passwordRegex.test(formData.password)) {
      setError('A senha deve conter: letra maiúscula, minúscula, número e caractere especial (@$!%*?&)');
      setLoading(false);
      return;
    }

    // Validar campos de aluno existente
    if (isExistingStudent) {
      if (!formData.groupName || !formData.instructor || !formData.corda) {
        setError('Preencha todos os campos de informação do aluno');
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          isExistingStudent,
          ...(isExistingStudent && {
            groupName: formData.groupName,
            instructor: formData.instructor,
            corda: formData.corda,
            cordaColor: formData.cordaColor
          })
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao cadastrar usuário');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/members');
      }, 2000);
    } catch (err) {
      console.error('Erro ao cadastrar:', err);
      setError('Erro ao cadastrar usuário. Tente novamente.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6 text-center">
            <div className="mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Cadastro realizado com sucesso!
            </h3>
            <p className="text-sm text-gray-600">
              Redirecionando para a área de membros...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-blue-600">
            Cadastro de Membro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Dados básicos */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="João Silva"
                  required
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  required
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo 8 caracteres"
                  required
                  className="mt-2"
                  minLength={8}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Deve conter: maiúscula, minúscula, número e caractere especial
                </p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Digite a senha novamente"
                  required
                  className="mt-2"
                  minLength={8}
                />
              </div>
            </div>

            {/* Pergunta se já é aluno */}
            <div className="border-t pt-6">
              <Label className="text-base font-medium text-gray-900">
                Você já é aluno de capoeira?
              </Label>
              <div className="mt-3 flex gap-4">
                <button
                  type="button"
                  onClick={() => handleStudentToggle(true)}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                    isExistingStudent
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium">Sim, já sou aluno</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleStudentToggle(false)}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                    !isExistingStudent
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium">Não, quero começar</span>
                </button>
              </div>
            </div>

            {/* Campos adicionais para alunos existentes */}
            {isExistingStudent && (
              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Informações do Aluno
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="groupName">Nome do Grupo *</Label>
                    <Input
                      id="groupName"
                      name="groupName"
                      type="text"
                      value={formData.groupName}
                      onChange={handleChange}
                      placeholder="Ex: Grupo Inga Capoeira"
                      required={isExistingStudent}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="instructor">Mestre/Instrutor *</Label>
                    <Input
                      id="instructor"
                      name="instructor"
                      type="text"
                      value={formData.instructor}
                      onChange={handleChange}
                      placeholder="Ex: Mestre Bimba"
                      required={isExistingStudent}
                      className="mt-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="corda">Cor da Corda *</Label>
                    <select
                      id="corda"
                      name="corda"
                      value={formData.corda}
                      onChange={handleChange}
                      required={isExistingStudent}
                      className="mt-2 w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione sua corda</option>
                      {CORD_COLORS.map((cord) => (
                        <option key={cord.name} value={cord.name}>
                          {cord.name}
                        </option>
                      ))}
                    </select>

                    {/* Preview da cor selecionada */}
                    {formData.cordaColor && (
                      <div className="mt-3 flex items-center gap-3">
                        <span className="text-sm text-gray-600">Cor da corda:</span>
                        <div
                          className="w-20 h-6 rounded border border-gray-300 shadow-sm"
                          style={{ backgroundColor: formData.cordaColor }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/members')}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

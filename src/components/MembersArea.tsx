"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Play, MapPin, User, Video, Map, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getCourses, getAcademies } from '@/lib/members-data';
import { Course, Academy, User as UserType, Membro } from '@/types/members';
import { LoginForm } from './LoginForm';
import { StudentProfile } from './StudentProfile';

export function MembersArea() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [user, setUser] = useState<UserType | null>(null);
  const [membro, setMembro] = useState<Membro | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const [coursesData, academiesData] = await Promise.all([
        getCourses(),
        getAcademies()
      ]);

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

      setCourses(coursesData);
      setAcademies(academiesData);
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
    setCourses([]);
    setAcademies([]);
    setUser(null);
    setMembro(null);
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
            <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-8">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Meu Perfil
              </TabsTrigger>
              <TabsTrigger value="courses" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Vídeos de Cursos
              </TabsTrigger>
              <TabsTrigger value="academies" className="flex items-center gap-2">
                <Map className="w-4 h-4" />
                Localização das Academias
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

            <TabsContent value="courses" className="mt-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                    <div className="aspect-video w-full overflow-hidden bg-gray-200 relative">
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Por {course.instructor}
                      </p>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {course.level}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {course.duration}
                          </span>
                        </div>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Play className="w-3 h-3 mr-1" />
                          Assistir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="academies" className="mt-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {academies.map((academy) => (
                  <Card key={academy.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        {academy.name}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Endereço</Label>
                        <p className="text-sm text-gray-600 mt-1">{academy.address}</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Telefone</Label>
                        <p className="text-sm text-gray-600 mt-1">{academy.phone}</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Horários</Label>
                        <p className="text-sm text-gray-600 mt-1">{academy.schedule}</p>
                      </div>

                      <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-4">
                        Ver no Mapa
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </section>
  );
}

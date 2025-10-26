"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Play, MapPin, User, Lock, Video, Map } from 'lucide-react';

export function MembersArea() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginData, setLoginData] = useState({ email: '', password: '' });

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulação de login - em produção conectaria com backend/Supabase
        if (loginData.email && loginData.password) {
            setIsLoggedIn(true);
        }
    };

    const courses = [
        {
            id: 1,
            title: "Fundamentos da Capoeira",
            instructor: "Mestre João Silva",
            duration: "45 min",
            level: "Iniciante",
            thumbnail: "https://images.unsplash.com/photo-1583166614297-a97b68d5cead?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXBvZWlyYSUyMG1hcnRpYWwlMjBhcnRzJTIwYnJhemlsfGVufDF8fHx8MTc1OTY4MzcxNHww&ixlib=rb-4.1.0&q=80&w=400"
        },
        {
            id: 2,
            title: "Sequências de Ginga",
            instructor: "Professor Maria Santos",
            duration: "30 min",
            level: "Intermediário",
            thumbnail: "https://images.unsplash.com/photo-1738835935023-ebff4a85bc7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXBvZWlyYSUyMGdyb3VwJTIwdHJhaW5pbmd8ZW58MXx8fHwxNzU5NjgzNzE2fDA&ixlib=rb-4.1.0&q=80&w=400"
        },
        {
            id: 3,
            title: "Instrumentos: Berimbau",
            instructor: "Mestre João Silva",
            duration: "60 min",
            level: "Todos os níveis",
            thumbnail: "https://images.unsplash.com/photo-1759352441436-143e91f617ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZXJpbWJhdSUyMGNhcG9laXJhJTIwbXVzaWN8ZW58MXx8fHwxNzU5NjgzNzE5fDA&ixlib=rb-4.1.0&q=80&w=400"
        }
    ];

    const academies = [
        {
            id: 1,
            name: "Academia Central",
            address: "Rua Augusta, 1234 - Centro, São Paulo",
            phone: "(11) 99999-1234",
            schedule: "Seg a Sex: 18h às 22h | Sáb: 9h às 12h"
        },
        {
            id: 2,
            name: "Academia Vila Madalena",
            address: "Rua Harmonia, 567 - Vila Madalena, São Paulo",
            phone: "(11) 99999-5678",
            schedule: "Seg a Sex: 19h às 21h | Dom: 10h às 12h"
        },
        {
            id: 3,
            name: "Academia Santos",
            address: "Av. Ana Costa, 890 - Santos, SP",
            phone: "(13) 99999-9012",
            schedule: "Ter e Qui: 20h às 22h | Sáb: 14h às 17h"
        }
    ];

    if (!isLoggedIn) {
        return (
            <section id="members" className="py-20 bg-gray-50">
                <div className="max-w-md mx-auto px-4">
                    <Card>
                        <CardHeader className="text-center">
                            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                                <Lock className="w-6 h-6 text-orange-600" />
                            </div>
                            <CardTitle>Área dos Membros</CardTitle>
                            <p className="text-gray-600">
                                Acesse vídeos exclusivos e informações das academias
                            </p>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={loginData.email}
                                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                        placeholder="seu@email.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="password">Senha</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={loginData.password}
                                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
                                    Entrar
                                </Button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    Não é membro ainda?{' '}
                                    <a href="#contact" className="text-orange-600 hover:underline">
                                        Entre em contato
                                    </a>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        );
    }

    return (
        <section id="members" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl md:text-4xl mb-2">Área dos Membros</h2>
                        <p className="text-gray-600">
                            Bem-vindo de volta! Acesse seus conteúdos exclusivos.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setIsLoggedIn(false)}
                        className="flex items-center gap-2"
                    >
                        <User className="w-4 h-4" />
                        Sair
                    </Button>
                </div>

                <Tabs defaultValue="courses" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="courses" className="flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            Vídeos de Cursos
                        </TabsTrigger>
                        <TabsTrigger value="academies" className="flex items-center gap-2">
                            <Map className="w-4 h-4" />
                            Localização das Academias
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="courses" className="mt-8">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map((course) => (
                                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-4">
                                        <h3 className="mb-2">{course.title}</h3>
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
                                            <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
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
                                <Card key={academy.id}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-orange-600" />
                                            {academy.name}
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="space-y-3">
                                        <div>
                                            <Label className="text-sm">Endereço</Label>
                                            <p className="text-sm text-gray-600">{academy.address}</p>
                                        </div>

                                        <div>
                                            <Label className="text-sm">Telefone</Label>
                                            <p className="text-sm text-gray-600">{academy.phone}</p>
                                        </div>

                                        <div>
                                            <Label className="text-sm">Horários</Label>
                                            <p className="text-sm text-gray-600">{academy.schedule}</p>
                                        </div>

                                        <Button className="w-full bg-orange-600 hover:bg-orange-700">
                                            Ver no Mapa
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </section>
    );
}
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, MapPin, Calendar, Loader2, LogIn, AlertCircle } from 'lucide-react';

interface CheckinInfo {
  academia: string;
  horario: string;
  diaSemana: string;
  dataAula: string;
}

interface CheckinResult {
  success: boolean;
  message: string;
  error?: string;
  alreadyCheckedIn?: boolean;
  info?: CheckinInfo;
}

function CheckinContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'authenticating' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const [info, setInfo] = useState<CheckinInfo | null>(null);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Token de check-in não fornecido.');
      return;
    }

    // Verifica se o token expirou antes de enviar
    try {
      const tokenData = JSON.parse(atob(token));
      if (Date.now() > tokenData.expiresAt) {
        setStatus('expired');
        setMessage('Este QR Code expirou. Solicite um novo ao instrutor.');
        return;
      }
    } catch {
      setStatus('error');
      setMessage('Token inválido.');
      return;
    }

    // Faz o check-in
    performCheckin(token);
  }, [searchParams]);

  const performCheckin = async (token: string) => {
    try {
      const response = await fetch('/api/presencas/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data: CheckinResult = await response.json();

      if (response.status === 401) {
        setStatus('authenticating');
        setMessage('Você precisa fazer login para registrar presença.');
        // Salva o token para usar após o login
        sessionStorage.setItem('checkin_token', token);
        return;
      }

      if (response.status === 403 && data.error === 'Você precisa ser um membro para fazer check-in') {
        setStatus('error');
        setMessage('Você precisa ser um membro cadastrado para fazer check-in.');
        return;
      }

      if (!response.ok) {
        setStatus('error');
        setMessage(data.error || 'Erro ao fazer check-in.');
        return;
      }

      setStatus('success');
      setMessage(data.message);
      setInfo(data.info || null);
      setAlreadyCheckedIn(data.alreadyCheckedIn || false);
    } catch (error) {
      console.error('Erro no check-in:', error);
      setStatus('error');
      setMessage('Erro de conexão. Tente novamente.');
    }
  };

  const handleLogin = () => {
    router.push('/login?redirect=/checkin');
  };

  const handleGoToMembers = () => {
    router.push('/members');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="py-12 text-center">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-lg text-gray-600">Registrando presença...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'authenticating') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-yellow-600" />
            </div>
            <CardTitle className="text-xl">Login Necessário</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">{message}</p>
            <Button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-xl text-orange-600">QR Code Expirado</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">{message}</p>
            <Button
              onClick={handleGoToMembers}
              variant="outline"
              className="w-full"
            >
              Ir para Área de Membros
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-600">Erro no Check-in</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">{message}</p>
            <Button
              onClick={handleGoToMembers}
              variant="outline"
              className="w-full"
            >
              Ir para Área de Membros
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            alreadyCheckedIn ? 'bg-yellow-100' : 'bg-green-100'
          }`}>
            {alreadyCheckedIn ? (
              <AlertCircle className="w-10 h-10 text-yellow-600" />
            ) : (
              <CheckCircle className="w-10 h-10 text-green-600" />
            )}
          </div>
          <CardTitle className={`text-2xl ${alreadyCheckedIn ? 'text-yellow-600' : 'text-green-600'}`}>
            {alreadyCheckedIn ? 'Já Registrado!' : 'Presença Confirmada!'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-6">{message}</p>

          {info && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Academia</p>
                    <p className="font-medium">{info.academia}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Data</p>
                    <p className="font-medium">
                      {info.diaSemana}, {new Date(info.dataAula).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Horário</p>
                    <p className="font-medium">{info.horario}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleGoToMembers}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Ir para Área de Membros
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="py-12 text-center">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-lg text-gray-600">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <CheckinContent />
    </Suspense>
  );
}

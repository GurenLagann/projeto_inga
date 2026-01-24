"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { gsap } from '@/lib/gsap';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Animação de entrada
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Timeline para animação sequencial
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Card entra com efeito de bounce
      tl.fromTo(
        cardRef.current,
        { opacity: 0, y: 50, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.4)' }
      );

      // Elementos do formulário entram em sequência
      if (formRef.current) {
        tl.fromTo(
          formRef.current.children,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 },
          '-=0.3'
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Animação de shake quando há erro
  useEffect(() => {
    if (error && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { x: -10 },
        {
          x: 10,
          duration: 0.1,
          repeat: 3,
          yoyo: true,
          ease: 'power2.inOut',
          onComplete: () => { gsap.set(cardRef.current, { x: 0 }); },
        }
      );
    }
  }, [error]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Animação do botão durante loading
    if (formRef.current) {
      const button = formRef.current.querySelector('button[type="submit"]');
      if (button) {
        gsap.to(button, { scale: 0.98, duration: 0.1 });
      }
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao fazer login');
        setIsLoading(false);

        // Reset do botão
        if (formRef.current) {
          const button = formRef.current.querySelector('button[type="submit"]');
          if (button) {
            gsap.to(button, { scale: 1, duration: 0.2 });
          }
        }
        return;
      }

      // Animação de sucesso antes de redirecionar
      if (cardRef.current) {
        gsap.to(cardRef.current, {
          scale: 1.02,
          boxShadow: '0 0 30px rgba(34, 197, 94, 0.3)',
          duration: 0.3,
          onComplete: () => {
            gsap.to(cardRef.current, {
              opacity: 0,
              y: -20,
              duration: 0.3,
              onComplete: onLoginSuccess,
            });
          },
        });
      } else {
        onLoginSuccess();
      }
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      setError('Erro ao fazer login. Tente novamente.');
      setIsLoading(false);

      // Reset do botão
      if (formRef.current) {
        const button = formRef.current.querySelector('button[type="submit"]');
        if (button) {
          gsap.to(button, { scale: 1, duration: 0.2 });
        }
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4"
    >
      <div className="w-full max-w-md">
        <Card ref={cardRef} className="shadow-lg" style={{ opacity: 0 }}>
          <CardHeader>
            <CardTitle className="text-2xl text-center text-blue-600">
              Área dos Membros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form ref={formRef} onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm animate-pulse">
                  {error}
                </div>
              )}

              <div style={{ opacity: 0 }}>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  placeholder="seu@email.com"
                  className="mt-2 transition-all focus:scale-[1.01]"
                  required
                  disabled={isLoading}
                />
              </div>

              <div style={{ opacity: 0 }}>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="••••••••"
                  className="mt-2 transition-all focus:scale-[1.01]"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading}
                style={{ opacity: 0 }}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Não é membro ainda?{' '}
                <a href="/register" className="text-blue-600 hover:underline transition-colors">
                  Cadastre-se aqui
                </a>
              </p>
              <p className="text-xs text-gray-500">
                ou{' '}
                <a href="#contact" className="text-blue-600 hover:underline transition-colors">
                  Entre em contato
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

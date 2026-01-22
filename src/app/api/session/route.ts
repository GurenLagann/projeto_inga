import { NextResponse } from 'next/server';
import { getSessionData } from '@/lib/session';

export async function GET() {
  try {
    const sessionData = await getSessionData();

    if (!sessionData) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: sessionData.user,
      membro: sessionData.membro,
    });
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

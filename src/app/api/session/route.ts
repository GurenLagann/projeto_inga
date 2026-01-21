import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';

export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        corda: user.corda,
        cordaColor: user.cordaColor,
        group: user.group,
        academy: user.academy,
        instructor: user.instructor,
        joinedDate: user.joinedDate,
        baptizedDate: user.baptizedDate,
        nextGraduation: user.nextGraduation,
        admin: user.admin,
      },
    });
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

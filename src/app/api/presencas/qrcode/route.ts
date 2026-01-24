import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionData, checkIsInstructor } from '@/lib/session';
import QRCode from 'qrcode';

// GET - Gerar QR Code para check-in
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionData();
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const horarioAulaId = searchParams.get('horarioAulaId');
    const dataAula = searchParams.get('dataAula');

    if (!horarioAulaId || !dataAula) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: horarioAulaId, dataAula' },
        { status: 400 }
      );
    }

    // Verifica se o usuário é admin ou instrutor da aula
    const isAdmin = session.user.admin === 1;

    if (!isAdmin && session.membro) {
      const isInstructor = await checkIsInstructor(session.membro.id);
      if (!isInstructor) {
        return NextResponse.json(
          { error: 'Apenas administradores e instrutores podem gerar QR codes' },
          { status: 403 }
        );
      }

      // Verifica se é instrutor dessa aula
      const aulaResult = await pool.query(
        'SELECT membro_instrutor_id FROM horarios_aulas WHERE id = $1',
        [horarioAulaId]
      );

      if (aulaResult.rows.length === 0) {
        return NextResponse.json({ error: 'Aula não encontrada' }, { status: 404 });
      }

      if (!isAdmin && aulaResult.rows[0].membro_instrutor_id !== session.membro.id) {
        return NextResponse.json(
          { error: 'Você só pode gerar QR code para suas próprias aulas' },
          { status: 403 }
        );
      }
    }

    // Gera token único para o QR code (válido por 15 minutos)
    const token = Buffer.from(
      JSON.stringify({
        horarioAulaId: parseInt(horarioAulaId),
        dataAula,
        createdAt: Date.now(),
        expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutos
      })
    ).toString('base64');

    // Gera o URL de check-in
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const checkinUrl = `${baseUrl}/checkin?token=${encodeURIComponent(token)}`;

    // Gera o QR code como data URL
    const qrCodeDataUrl = await QRCode.toDataURL(checkinUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    // Busca informações da aula
    const aulaInfo = await pool.query(
      `SELECT h.*, a.name as academia_nome
       FROM horarios_aulas h
       JOIN academias a ON h.academia_id = a.id
       WHERE h.id = $1`,
      [horarioAulaId]
    );

    const aula = aulaInfo.rows[0];
    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    return NextResponse.json({
      qrCode: qrCodeDataUrl,
      checkinUrl,
      token,
      info: {
        academia: aula?.academia_nome || 'N/A',
        horario: aula ? `${aula.start_time} - ${aula.end_time}` : 'N/A',
        diaSemana: aula ? diasSemana[aula.day_of_week] : 'N/A',
        dataAula,
      },
    });
  } catch (error) {
    console.error('Erro ao gerar QR code:', error);
    return NextResponse.json({ error: 'Erro ao gerar QR code' }, { status: 500 });
  }
}
